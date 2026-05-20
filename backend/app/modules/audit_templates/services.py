"""Checklist template use cases."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.domain.audits.audit_actions import AuditActivityAction
from app.domain.audits.enums import AuditStatus, TemplateVersionStatus
from app.domain.audits.permissions import can_manage_templates, can_view_templates
from app.domain.audits.scoring import (
    ScoringItem,
    scores_by_clause,
    scores_by_process,
    suggest_auto_findings,
    weighted_average,
)
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.audit import Audit
from app.infrastructure.models.checklist_question import ChecklistQuestion
from app.infrastructure.models.checklist_section import ChecklistSection
from app.infrastructure.models.checklist_template import ChecklistTemplate
from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion
from app.infrastructure.models.user import User
from app.modules.audit_templates.schemas import (
    ActivateVersionRequest,
    ApplyTemplateRequest,
    AuditFromTemplateCreate,
    CloneTemplateRequest,
    ComplianceBreakdown,
    NewVersionRequest,
    QuestionCreate,
    QuestionResponse,
    QuestionUpdate,
    SectionCreate,
    SectionResponse,
    SectionUpdate,
    TemplateCreate,
    TemplateDetailResponse,
    TemplateListResponse,
    TemplateSummary,
    TemplateUpdate,
    VersionDetailResponse,
    VersionSummary,
)
from app.modules.audit_templates.snapshot import apply_template_snapshot
from app.modules.audits.activity_service import AuditActivityService
from app.modules.audits.schemas import AuditDetailResponse
from app.repositories.audit_repository import AuditRepository
from app.repositories.checklist_template_repository import ChecklistTemplateRepository


class ChecklistTemplateService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._templates = ChecklistTemplateRepository(session)
        self._audits = AuditRepository(session)
        self._activity = AuditActivityService(session)

    # --- Templates ---
    def list_templates(
        self,
        *,
        actor: User,
        iso_standard: str | None = None,
        active_only: bool = True,
    ) -> TemplateListResponse:
        if not can_view_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        rows = self._templates.list_accessible(
            tenant_id, iso_standard=iso_standard, active_only=active_only
        )
        return TemplateListResponse(
            items=[TemplateSummary.model_validate(r) for r in rows],
            total=len(rows),
        )

    def get_template(self, template_id: uuid.UUID, *, actor: User) -> TemplateDetailResponse:
        if not can_view_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        template = self._templates.get_template(template_id, tenant_id=tenant_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found.")
        versions = [
            VersionSummary(
                id=v.id,
                template_id=v.template_id,
                version_number=v.version_number,
                status=TemplateVersionStatus(v.status),
                change_summary=v.change_summary,
                published_at=v.published_at,
                question_count=self._templates.count_questions(v.id),
            )
            for v in sorted(template.versions, key=lambda x: x.version_number)
        ]
        current = None
        if template.current_version_id:
            current = self.get_version(template_id, template.current_version_id, actor=actor)
        return TemplateDetailResponse(
            **TemplateSummary.model_validate(template).model_dump(),
            versions=versions,
            current_version=current,
        )

    def create_template(self, payload: TemplateCreate, *, actor: User) -> TemplateDetailResponse:
        if not can_manage_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        code = payload.code.strip().upper()
        if self._templates.code_exists(code, tenant_id=tenant_id):
            raise HTTPException(status_code=409, detail=f"Template code '{code}' exists.")
        template = ChecklistTemplate(
            tenant_id=tenant_id,
            iso_standard=payload.iso_standard.value,
            code=code,
            title=payload.title,
            description=payload.description,
            is_system=False,
            is_active=True,
            created_by_id=actor.id,
        )
        self._session.add(template)
        self._session.flush()
        version = ChecklistTemplateVersion(
            template_id=template.id,
            version_number=1,
            status=TemplateVersionStatus.DRAFT.value,
            change_summary="Versión inicial",
        )
        self._session.add(version)
        self._session.flush()
        template.current_version_id = version.id
        self._session.commit()
        return self.get_template(template.id, actor=actor)

    def update_template(
        self,
        template_id: uuid.UUID,
        payload: TemplateUpdate,
        *,
        actor: User,
    ) -> TemplateSummary:
        template = self._get_editable_template(template_id, actor)
        if payload.title is not None:
            template.title = payload.title
        if payload.description is not None:
            template.description = payload.description
        if payload.is_active is not None:
            template.is_active = payload.is_active
        template.updated_by_id = actor.id
        self._session.commit()
        return TemplateSummary.model_validate(template)

    def deactivate_template(self, template_id: uuid.UUID, *, actor: User) -> TemplateSummary:
        return self.update_template(
            template_id, TemplateUpdate(is_active=False), actor=actor
        )

    def activate_template(self, template_id: uuid.UUID, *, actor: User) -> TemplateSummary:
        return self.update_template(
            template_id, TemplateUpdate(is_active=True), actor=actor
        )

    def clone_template(
        self,
        template_id: uuid.UUID,
        payload: CloneTemplateRequest,
        *,
        actor: User,
    ) -> TemplateDetailResponse:
        if not can_manage_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        source = self._templates.get_template(template_id, tenant_id=tenant_id)
        if source is None or source.current_version_id is None:
            raise HTTPException(status_code=404, detail="Template not found.")
        code = payload.code.strip().upper()
        if self._templates.code_exists(code, tenant_id=tenant_id):
            raise HTTPException(status_code=409, detail=f"Template code '{code}' exists.")
        version = self._templates.get_version_with_structure(
            source.current_version_id, tenant_id=tenant_id
        )
        if version is None:
            raise HTTPException(status_code=404, detail="Template version not found.")

        clone = ChecklistTemplate(
            tenant_id=tenant_id,
            iso_standard=source.iso_standard,
            code=code,
            title=payload.title or f"{source.title} (copia)",
            description=source.description,
            is_system=False,
            is_active=True,
            source_template_id=source.id,
            created_by_id=actor.id,
        )
        self._session.add(clone)
        self._session.flush()
        new_version = self._duplicate_version_structure(
            version,
            clone.id,
            version_number=1,
            status=TemplateVersionStatus.ACTIVE.value,
            change_summary=f"Clonado desde {source.code}",
        )
        new_version.published_at = datetime.now(UTC)
        new_version.published_by_id = actor.id
        clone.current_version_id = new_version.id
        self._session.commit()
        return self.get_template(clone.id, actor=actor)

    def create_version(
        self,
        template_id: uuid.UUID,
        payload: NewVersionRequest,
        *,
        actor: User,
    ) -> VersionDetailResponse:
        template = self._get_editable_template(template_id, actor)
        if template.current_version_id is None:
            raise HTTPException(status_code=400, detail="Template has no base version.")
        current = self._templates.get_version_with_structure(
            template.current_version_id,
            tenant_id=require_current_tenant_id(),
        )
        if current is None:
            raise HTTPException(status_code=404, detail="Current version not found.")
        max_num = max((v.version_number for v in template.versions), default=0)
        new_version = self._duplicate_version_structure(
            current,
            template.id,
            version_number=max_num + 1,
            status=TemplateVersionStatus.DRAFT.value,
            change_summary=payload.change_summary or f"Versión {max_num + 1}",
        )
        template.current_version_id = new_version.id
        self._session.commit()
        return self.get_version(template_id, new_version.id, actor=actor)

    def activate_version(
        self,
        template_id: uuid.UUID,
        payload: ActivateVersionRequest,
        *,
        actor: User,
    ) -> VersionDetailResponse:
        template = self._get_editable_template(template_id, actor)
        version_id = payload.version_id or template.current_version_id
        if version_id is None:
            raise HTTPException(status_code=400, detail="No version specified.")
        version = self._session.get(ChecklistTemplateVersion, version_id)
        if version is None or version.template_id != template.id:
            raise HTTPException(status_code=404, detail="Version not found.")
        for v in template.versions:
            if v.id == version.id:
                v.status = TemplateVersionStatus.ACTIVE.value
                v.published_at = datetime.now(UTC)
                v.published_by_id = actor.id
            elif v.status == TemplateVersionStatus.ACTIVE.value:
                v.status = TemplateVersionStatus.ARCHIVED.value
        template.current_version_id = version.id
        template.is_active = True
        self._session.commit()
        return self.get_version(template_id, version.id, actor=actor)

    def get_version(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        *,
        actor: User,
    ) -> VersionDetailResponse:
        if not can_view_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        version = self._templates.get_version_with_structure(version_id, tenant_id=tenant_id)
        if version is None or version.template_id != template_id:
            raise HTTPException(status_code=404, detail="Version not found.")
        return self._version_detail(version)

    # --- Sections & questions (draft versions only) ---
    def add_section(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        payload: SectionCreate,
        *,
        actor: User,
    ) -> SectionResponse:
        version = self._get_draft_version(template_id, version_id, actor)
        section = ChecklistSection(
            version_id=version.id,
            chapter_code=payload.chapter_code,
            clause_code=payload.clause_code,
            title=payload.title,
            description=payload.description,
            process_area=payload.process_area,
            sort_order=payload.sort_order,
        )
        self._session.add(section)
        self._session.commit()
        self._session.refresh(section)
        return SectionResponse.model_validate(section)

    def update_section(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        section_id: uuid.UUID,
        payload: SectionUpdate,
        *,
        actor: User,
    ) -> SectionResponse:
        section = self._get_section(template_id, version_id, section_id, actor)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(section, field, value)
        self._session.commit()
        return SectionResponse.model_validate(section)

    def add_question(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        section_id: uuid.UUID,
        payload: QuestionCreate,
        *,
        actor: User,
    ) -> QuestionResponse:
        section = self._get_section(template_id, version_id, section_id, actor)
        question = ChecklistQuestion(
            section_id=section.id,
            clause_code=payload.clause_code,
            question_text=payload.question_text,
            compliance_criteria=payload.compliance_criteria,
            guidance_text=payload.guidance_text,
            weight=payload.weight,
            criticality=payload.criticality.value,
            response_type=payload.response_type.value,
            is_required=payload.is_required,
            evidence_required=payload.evidence_required,
            sort_order=payload.sort_order,
        )
        self._session.add(question)
        self._session.commit()
        self._session.refresh(question)
        return QuestionResponse.model_validate(question)

    def update_question(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        section_id: uuid.UUID,
        question_id: uuid.UUID,
        payload: QuestionUpdate,
        *,
        actor: User,
    ) -> QuestionResponse:
        section = self._get_section(template_id, version_id, section_id, actor)
        question = self._get_question(section, question_id)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            if hasattr(value, "value"):
                setattr(question, field, value.value)
            else:
                setattr(question, field, value)
        self._session.commit()
        return QuestionResponse.model_validate(question)

    def delete_question(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        section_id: uuid.UUID,
        question_id: uuid.UUID,
        *,
        actor: User,
    ) -> None:
        section = self._get_section(template_id, version_id, section_id, actor)
        question = self._get_question(section, question_id)
        self._session.delete(question)
        self._session.commit()

    # --- Audit integration ---
    def apply_to_audit(
        self,
        audit_id: uuid.UUID,
        payload: ApplyTemplateRequest,
        *,
        actor: User,
        ip: str | None = None,
    ) -> int:
        from app.domain.audits.permissions import can_manage_audits

        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        audit = self._audits.get_by_id(tenant_id, audit_id)
        if audit is None:
            raise HTTPException(status_code=404, detail="Audit not found.")
        if audit.status not in {AuditStatus.PLANEADA.value, AuditStatus.EN_PROCESO.value}:
            raise HTTPException(
                status_code=400,
                detail="Checklist can only be applied to planned or in-progress audits.",
            )
        version = self._resolve_version(payload.template_id, payload.version_id, tenant_id)
        items = apply_template_snapshot(
            self._session, audit, version, template_id=payload.template_id
        )
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.TEMPLATE_APPLIED,
            user_id=actor.id,
            ip_address=ip,
            changes={
                "template_id": str(payload.template_id),
                "version_id": str(version.id),
                "items": len(items),
            },
        )
        self._session.commit()
        return len(items)

    def create_audit_from_template(
        self,
        payload: AuditFromTemplateCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> AuditDetailResponse:
        from app.domain.audits.permissions import can_manage_audits
        from app.modules.audits.schemas import AuditResponse

        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        code = payload.code.strip().upper()
        if self._audits.code_exists(tenant_id, code):
            raise HTTPException(status_code=409, detail=f"Audit code '{code}' exists.")
        version = self._resolve_version(payload.template_id, payload.version_id, tenant_id)
        template = version.template

        audit = Audit(
            tenant_id=tenant_id,
            audit_plan_id=payload.audit_plan_id,
            code=code,
            title=payload.title,
            description=payload.description,
            audit_type=payload.audit_type.value,
            status=AuditStatus.PLANEADA.value,
            iso_standards=[template.iso_standard],
            process_area=payload.process_area,
            scope=payload.scope,
            objectives=payload.objectives,
            location=payload.location,
            lead_auditor_id=payload.lead_auditor_id or actor.id,
            created_by_id=actor.id,
        )
        self._session.add(audit)
        self._session.flush()
        items = apply_template_snapshot(
            self._session, audit, version, template_id=payload.template_id
        )
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.AUDIT_FROM_TEMPLATE,
            user_id=actor.id,
            ip_address=ip,
            changes={
                "template_id": str(payload.template_id),
                "version_id": str(version.id),
                "checklist_items": len(items),
            },
        )
        self._session.commit()
        refreshed = self._audits.get_by_id(tenant_id, audit.id)
        assert refreshed is not None
        return AuditDetailResponse(
            **AuditResponse.model_validate(refreshed).model_dump(),
            checklist_items_count=len(items),
        )

    def compliance_breakdown(
        self, audit_id: uuid.UUID, *, actor: User
    ) -> ComplianceBreakdown:
        if not can_view_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        audit = self._audits.get_by_id(tenant_id, audit_id)
        if audit is None:
            raise HTTPException(status_code=404, detail="Audit not found.")
        items = self._scoring_items(audit)
        return ComplianceBreakdown(
            global_score=weighted_average(items),
            by_clause=scores_by_clause(items),
            by_process=scores_by_process(items),
            auto_finding_suggestions=suggest_auto_findings(items),
        )

    # --- Helpers ---
    def _resolve_version(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID | None,
        tenant_id: uuid.UUID,
    ) -> ChecklistTemplateVersion:
        template = self._templates.get_template(template_id, tenant_id=tenant_id)
        if template is None or not template.is_active:
            raise HTTPException(status_code=404, detail="Template not found or inactive.")
        vid = version_id or template.current_version_id
        if vid is None:
            raise HTTPException(status_code=400, detail="Template has no active version.")
        version = self._templates.get_version_with_structure(vid, tenant_id=tenant_id)
        if version is None or version.template_id != template_id:
            raise HTTPException(status_code=404, detail="Template version not found.")
        return version

    def _duplicate_version_structure(
        self,
        source: ChecklistTemplateVersion,
        template_id: uuid.UUID,
        *,
        version_number: int | None = None,
        status: str = TemplateVersionStatus.DRAFT.value,
        change_summary: str = "Copia de versión",
    ) -> ChecklistTemplateVersion:
        new_version = ChecklistTemplateVersion(
            template_id=template_id,
            version_number=version_number or source.version_number,
            status=status,
            change_summary=change_summary,
        )
        self._session.add(new_version)
        self._session.flush()
        for section in sorted(source.sections, key=lambda s: s.sort_order):
            new_section = ChecklistSection(
                version_id=new_version.id,
                chapter_code=section.chapter_code,
                clause_code=section.clause_code,
                title=section.title,
                description=section.description,
                process_area=section.process_area,
                sort_order=section.sort_order,
            )
            self._session.add(new_section)
            self._session.flush()
            for question in sorted(section.questions, key=lambda q: q.sort_order):
                self._session.add(
                    ChecklistQuestion(
                        section_id=new_section.id,
                        clause_code=question.clause_code,
                        question_text=question.question_text,
                        compliance_criteria=question.compliance_criteria,
                        guidance_text=question.guidance_text,
                        weight=question.weight,
                        criticality=question.criticality,
                        response_type=question.response_type,
                        is_required=question.is_required,
                        evidence_required=question.evidence_required,
                        sort_order=question.sort_order,
                    )
                )
        return new_version

    def _version_detail(self, version: ChecklistTemplateVersion) -> VersionDetailResponse:
        sections = []
        for section in sorted(version.sections, key=lambda s: s.sort_order):
            sections.append(
                SectionResponse(
                    id=section.id,
                    version_id=section.version_id,
                    chapter_code=section.chapter_code,
                    clause_code=section.clause_code,
                    title=section.title,
                    description=section.description,
                    process_area=section.process_area,
                    sort_order=section.sort_order,
                    questions=[
                        QuestionResponse.model_validate(q)
                        for q in sorted(section.questions, key=lambda x: x.sort_order)
                    ],
                )
            )
        return VersionDetailResponse(
            id=version.id,
            template_id=version.template_id,
            version_number=version.version_number,
            status=TemplateVersionStatus(version.status),
            change_summary=version.change_summary,
            published_at=version.published_at,
            question_count=self._templates.count_questions(version.id),
            sections=sections,
        )

    def _get_editable_template(self, template_id: uuid.UUID, actor: User) -> ChecklistTemplate:
        if not can_manage_templates(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        template = self._templates.get_template(template_id, tenant_id=tenant_id)
        if template is None:
            raise HTTPException(status_code=404, detail="Template not found.")
        if template.is_system:
            raise HTTPException(status_code=403, detail="System templates cannot be modified.")
        if template.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Forbidden.")
        return template

    def _get_draft_version(
        self, template_id: uuid.UUID, version_id: uuid.UUID, actor: User
    ) -> ChecklistTemplateVersion:
        self._get_editable_template(template_id, actor)
        version = self._session.get(ChecklistTemplateVersion, version_id)
        if version is None or version.template_id != template_id:
            raise HTTPException(status_code=404, detail="Version not found.")
        if version.status != TemplateVersionStatus.DRAFT.value:
            raise HTTPException(
                status_code=400,
                detail="Only draft versions can be edited.",
            )
        return version

    def _get_section(
        self,
        template_id: uuid.UUID,
        version_id: uuid.UUID,
        section_id: uuid.UUID,
        actor: User,
    ) -> ChecklistSection:
        version = self._get_draft_version(template_id, version_id, actor)
        section = self._session.get(ChecklistSection, section_id)
        if section is None or section.version_id != version.id:
            raise HTTPException(status_code=404, detail="Section not found.")
        return section

    @staticmethod
    def _get_question(section: ChecklistSection, question_id: uuid.UUID) -> ChecklistQuestion:
        question = next((q for q in section.questions if q.id == question_id), None)
        if question is None:
            raise HTTPException(status_code=404, detail="Question not found.")
        return question

    @staticmethod
    def _scoring_items(audit: Audit) -> list[ScoringItem]:
        items: list[ScoringItem] = []
        for checklist in audit.checklists:
            status_value = "pendiente"
            score = None
            if checklist.response:
                status_value = checklist.response.compliance_status
                score = checklist.response.score
            items.append(
                ScoringItem(
                    clause_code=checklist.clause_code,
                    weight=checklist.weight,
                    criticality=checklist.criticality or "media",
                    compliance_status=status_value,
                    process_area=checklist.process_area,
                    score=score,
                    response_type=checklist.response_type or "cumple",
                )
            )
        return items
