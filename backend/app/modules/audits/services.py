"""Audit module use cases."""

import hashlib
import uuid
from datetime import UTC, date, datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.domain.audits.audit_actions import AuditActivityAction
from app.domain.audits.enums import (
    ActionPlanStatus,
    AuditStatus,
    ChecklistCompliance,
    EvidenceType,
    FindingSource,
    FindingStatus,
    IsoStandard,
)
from app.domain.audits.permissions import (
    can_conduct_audits,
    can_manage_audits,
    can_manage_findings,
    can_view_audits,
)
from app.domain.audits.workflow import assert_valid_audit_transition
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.audit import Audit
from app.infrastructure.models.audit_action_plan import AuditActionPlan
from app.infrastructure.models.audit_checklist import AuditChecklist
from app.infrastructure.models.audit_evidence import AuditEvidence
from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.audit_plan import AuditPlan
from app.infrastructure.models.audit_response import AuditResponse as AuditResponseModel
from app.infrastructure.models.document import Document
from app.infrastructure.models.user import User
from app.infrastructure.storage.paths import build_version_storage_key
from app.infrastructure.storage.protocol import StorageProvider
from app.infrastructure.storage.validators import validate_upload
from app.modules.audits.activity_service import AuditActivityService
from app.modules.audits.schemas import (
    ActionPlanCreate,
    ActionPlanResponse,
    ActionPlanUpdate,
    AuditCreate,
    AuditDashboardResponse,
    AuditDetailResponse,
    AuditListResponse,
    AuditPlanCreate,
    AuditPlanResponse,
    AuditPlanUpdate,
    AuditResponse,
    AuditStatusChange,
    AuditTimelineEntry,
    AuditTimelineResponse,
    AuditUpdate,
    ChecklistCreate,
    ChecklistItemResponse,
    EvidenceDocumentRef,
    EvidenceExternalUrl,
    EvidenceResponse,
    FindingCreate,
    FindingResponse,
    FindingUpdate,
    ResponseUpsert,
)
from app.repositories.audit_activity_repository import AuditActivityRepository
from app.repositories.audit_repository import AuditRepository


class AuditModuleService:
    """Consolidated audit module service (enterprise bounded context)."""

    def __init__(
        self,
        session: Session,
        storage: StorageProvider | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._session = session
        self._storage = storage
        self._settings = settings
        self._audits = AuditRepository(session)
        self._activity = AuditActivityService(session)

    # --- Plans ---
    def create_plan(
        self,
        payload: AuditPlanCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> AuditPlanResponse:
        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        plan = AuditPlan(
            tenant_id=tenant_id,
            code=payload.code.strip().upper(),
            title=payload.title,
            year=payload.year,
            description=payload.description,
            iso_standards=[s.value for s in payload.iso_standards] or None,
            created_by_id=actor.id,
        )
        self._session.add(plan)
        self._session.commit()
        self._session.refresh(plan)
        return AuditPlanResponse.model_validate(plan)

    def list_plans(self) -> list[AuditPlanResponse]:
        tenant_id = require_current_tenant_id()
        rows = self._session.scalars(
            select(AuditPlan).where(
                AuditPlan.tenant_id == tenant_id,
                AuditPlan.deleted_at.is_(None),
            )
        ).all()
        return [AuditPlanResponse.model_validate(r) for r in rows]

    def update_plan(
        self,
        plan_id: uuid.UUID,
        payload: AuditPlanUpdate,
        *,
        actor: User,
    ) -> AuditPlanResponse:
        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        plan = self._get_plan(plan_id)
        if payload.title is not None:
            plan.title = payload.title
        if payload.description is not None:
            plan.description = payload.description
        if payload.status is not None:
            plan.status = payload.status
        if payload.iso_standards is not None:
            plan.iso_standards = [s.value for s in payload.iso_standards]
        self._session.commit()
        return AuditPlanResponse.model_validate(plan)

    # --- Audits ---
    def create_audit(
        self,
        payload: AuditCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> AuditDetailResponse:
        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        code = payload.code.strip().upper()
        if self._audits.code_exists(tenant_id, code):
            raise HTTPException(status_code=409, detail=f"Audit code '{code}' exists.")

        audit = Audit(
            tenant_id=tenant_id,
            audit_plan_id=payload.audit_plan_id,
            code=code,
            title=payload.title,
            description=payload.description,
            audit_type=payload.audit_type.value,
            status=AuditStatus.PLANEADA.value,
            iso_standards=[s.value for s in payload.iso_standards] or None,
            process_area=payload.process_area,
            scope=payload.scope,
            objectives=payload.objectives,
            location=payload.location,
            planned_start_date=payload.planned_start_date,
            planned_end_date=payload.planned_end_date,
            lead_auditor_id=payload.lead_auditor_id or actor.id,
            team_member_ids=[str(u) for u in payload.team_member_ids] or None,
            created_by_id=actor.id,
        )
        self._session.add(audit)
        self._session.flush()
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.AUDIT_CREATED,
            user_id=actor.id,
            ip_address=ip,
            changes={"code": code, "audit_type": audit.audit_type},
        )
        self._session.commit()
        return self._audit_detail(audit.id)

    def list_audits(
        self,
        *,
        skip: int,
        limit: int,
        status: str | None = None,
        audit_type: str | None = None,
        process_area: str | None = None,
        search: str | None = None,
    ) -> AuditListResponse:
        tenant_id = require_current_tenant_id()
        rows, total = self._audits.search(
            tenant_id,
            skip=skip,
            limit=limit,
            status=status,
            audit_type=audit_type,
            process_area=process_area,
            search=search,
        )
        return AuditListResponse(
            items=[AuditResponse.model_validate(r) for r in rows],
            total=total,
            skip=skip,
            limit=limit,
        )

    def get_audit(self, audit_id: uuid.UUID, *, actor: User) -> AuditDetailResponse:
        if not can_view_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        return self._audit_detail(audit_id)

    def update_audit(
        self,
        audit_id: uuid.UUID,
        payload: AuditUpdate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> AuditDetailResponse:
        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        before = {"title": audit.title, "status": audit.status}
        for field, value in payload.model_dump(exclude_unset=True).items():
            if field == "iso_standards" and value is not None:
                audit.iso_standards = [IsoStandard(v).value for v in value]
            elif field == "team_member_ids" and value is not None:
                audit.team_member_ids = [str(u) for u in value]
            elif hasattr(audit, field):
                setattr(audit, field, value)
        audit.updated_by_id = actor.id
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.AUDIT_UPDATED,
            user_id=actor.id,
            ip_address=ip,
            changes={"before": before, "after": {"title": audit.title, "status": audit.status}},
        )
        self._session.commit()
        return self._audit_detail(audit_id)

    def change_audit_status(
        self,
        audit_id: uuid.UUID,
        payload: AuditStatusChange,
        *,
        actor: User,
        ip: str | None = None,
    ) -> AuditDetailResponse:
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        current = AuditStatus(audit.status)
        target = payload.status
        assert_valid_audit_transition(current, target)
        audit.status = target.value
        if target == AuditStatus.EN_PROCESO and not audit.actual_start_date:
            audit.actual_start_date = date.today()
        if target in {AuditStatus.FINALIZADA, AuditStatus.CERRADA}:
            audit.actual_end_date = date.today()
            audit.compliance_score = self._audits.compute_compliance_score(audit.id)
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.AUDIT_STATUS_CHANGED,
            user_id=actor.id,
            ip_address=ip,
            changes={"from": current.value, "to": target.value},
            message=payload.comment,
        )
        self._session.commit()
        return self._audit_detail(audit_id)

    def delete_audit(self, audit_id: uuid.UUID, *, actor: User, ip: str | None = None) -> None:
        if not can_manage_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        audit.deleted_at = datetime.now(UTC)
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.AUDIT_DELETED,
            user_id=actor.id,
            ip_address=ip,
        )
        self._session.commit()

    # --- Checklist ---
    def add_checklist_item(
        self,
        audit_id: uuid.UUID,
        payload: ChecklistCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> ChecklistItemResponse:
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        item = AuditChecklist(
            audit_id=audit.id,
            iso_standard=payload.iso_standard.value,
            clause_code=payload.clause_code,
            requirement_text=payload.requirement_text,
            question_text=payload.question_text,
            sort_order=payload.sort_order,
            weight=payload.weight,
        )
        self._session.add(item)
        self._session.flush()
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.CHECKLIST_CREATED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="checklist",
            entity_id=item.id,
        )
        self._session.commit()
        return self._checklist_response(item)

    def list_checklist(self, audit_id: uuid.UUID) -> list[ChecklistItemResponse]:
        audit = self._get_audit(audit_id)
        items = sorted(audit.checklists, key=lambda c: c.sort_order)
        return [self._checklist_response(i) for i in items]

    def upsert_response(
        self,
        audit_id: uuid.UUID,
        checklist_id: uuid.UUID,
        payload: ResponseUpsert,
        *,
        actor: User,
        ip: str | None = None,
    ) -> ChecklistItemResponse:
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        item = self._get_checklist(audit, checklist_id)
        compliance = self._resolve_compliance_status(item, payload)
        if item.response is None:
            item.response = AuditResponseModel(
                checklist_id=item.id,
                compliance_status=compliance,
                score=payload.score,
                text_value=payload.text_value,
                numeric_value=payload.numeric_value,
                observations=payload.observations,
                responded_by_id=actor.id,
                responded_at=datetime.now(UTC),
            )
            self._session.add(item.response)
        else:
            item.response.compliance_status = compliance
            item.response.score = payload.score
            item.response.text_value = payload.text_value
            item.response.numeric_value = payload.numeric_value
            item.response.observations = payload.observations
            item.response.responded_by_id = actor.id
            item.response.responded_at = datetime.now(UTC)
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.RESPONSE_RECORDED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="checklist",
            entity_id=item.id,
            changes={"compliance": compliance},
        )
        audit.compliance_score = self._audits.compute_compliance_score(audit.id)
        self._session.commit()
        self._session.refresh(item)
        return self._checklist_response(item)

    # --- Findings ---
    def create_finding(
        self,
        audit_id: uuid.UUID,
        payload: FindingCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> FindingResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        count = self._session.scalar(
            select(func.count(AuditFinding.id)).where(AuditFinding.audit_id == audit.id)
        ) or 0
        finding = AuditFinding(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            code=f"{audit.code}-H{count + 1:03d}",
            title=payload.title,
            description=payload.description,
            classification=payload.classification.value,
            severity=payload.severity.value,
            status=FindingStatus.ABIERTO.value,
            requirement_reference=payload.requirement_reference,
            process_area=payload.process_area or audit.process_area,
            responsible_user_id=payload.responsible_user_id,
            due_date=payload.due_date,
            root_cause=payload.root_cause,
            source=FindingSource.MANUAL.value,
            created_by_id=actor.id,
        )
        self._session.add(finding)
        self._session.flush()
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.FINDING_CREATED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="finding",
            entity_id=finding.id,
            changes={"severity": finding.severity, "classification": finding.classification},
        )
        self._session.commit()
        return FindingResponse.model_validate(finding)

    def list_findings(self, audit_id: uuid.UUID) -> list[FindingResponse]:
        audit = self._get_audit(audit_id)
        return [FindingResponse.model_validate(f) for f in audit.findings if not f.deleted_at]

    def update_finding(
        self,
        audit_id: uuid.UUID,
        finding_id: uuid.UUID,
        payload: FindingUpdate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> FindingResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        finding = self._get_finding(audit, finding_id)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            if value is not None and hasattr(value, "value"):
                setattr(finding, field, value.value)
            elif value is not None:
                setattr(finding, field, value)
        if data.get("status") == FindingStatus.CERRADO:
            self._activity.log(
                tenant_id=audit.tenant_id,
                audit_id=audit.id,
                action=AuditActivityAction.FINDING_CLOSED,
                user_id=actor.id,
                ip_address=ip,
                entity_type="finding",
                entity_id=finding.id,
            )
        else:
            self._activity.log(
                tenant_id=audit.tenant_id,
                audit_id=audit.id,
                action=AuditActivityAction.FINDING_UPDATED,
                user_id=actor.id,
                ip_address=ip,
                entity_type="finding",
                entity_id=finding.id,
            )
        self._session.commit()
        return FindingResponse.model_validate(finding)

    # --- Action plans ---
    def create_action_plan(
        self,
        audit_id: uuid.UUID,
        finding_id: uuid.UUID,
        payload: ActionPlanCreate,
        *,
        actor: User,
        ip: str | None = None,
    ) -> ActionPlanResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        finding = self._get_finding(audit, finding_id)
        plan = AuditActionPlan(
            tenant_id=audit.tenant_id,
            finding_id=finding.id,
            title=payload.title,
            description=payload.description,
            status=ActionPlanStatus.PENDIENTE.value,
            responsible_user_id=payload.responsible_user_id,
            due_date=payload.due_date,
            created_by_id=actor.id,
        )
        self._session.add(plan)
        self._session.flush()
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.ACTION_PLAN_CREATED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="action_plan",
            entity_id=plan.id,
        )
        self._session.commit()
        return ActionPlanResponse.model_validate(plan)

    def update_action_plan(
        self,
        audit_id: uuid.UUID,
        finding_id: uuid.UUID,
        plan_id: uuid.UUID,
        payload: ActionPlanUpdate,
        *,
        actor: User,
    ) -> ActionPlanResponse:
        audit = self._get_audit(audit_id)
        finding = self._get_finding(audit, finding_id)
        plan = next((p for p in finding.action_plans if p.id == plan_id), None)
        if plan is None:
            raise HTTPException(status_code=404, detail="Action plan not found.")
        for field, value in payload.model_dump(exclude_unset=True).items():
            if value is not None and hasattr(value, "value"):
                setattr(plan, field, value.value)
            elif value is not None:
                setattr(plan, field, value)
        if payload.status == ActionPlanStatus.COMPLETADA:
            plan.completed_at = datetime.now(UTC)
        self._session.commit()
        return ActionPlanResponse.model_validate(plan)

    # --- Evidence ---
    def add_document_evidence(
        self,
        audit_id: uuid.UUID,
        payload: EvidenceDocumentRef,
        *,
        actor: User,
        ip: str | None = None,
    ) -> EvidenceResponse:
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        tenant_id = require_current_tenant_id()
        doc = self._session.get(Document, payload.document_id)
        if doc is None or doc.tenant_id != tenant_id or doc.deleted_at is not None:
            raise HTTPException(status_code=404, detail="Document not found.")
        evidence = AuditEvidence(
            tenant_id=tenant_id,
            audit_id=audit.id,
            evidence_type=EvidenceType.DOCUMENT_REFERENCE.value,
            description=payload.description,
            document_id=payload.document_id,
            document_version_id=payload.document_version_id,
            created_by_id=actor.id,
        )
        self._session.add(evidence)
        self._session.flush()
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.EVIDENCE_ADDED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="evidence",
            entity_id=evidence.id,
            changes={"document_id": str(payload.document_id)},
        )
        self._session.commit()
        return EvidenceResponse.model_validate(evidence)

    def add_external_evidence(
        self,
        audit_id: uuid.UUID,
        payload: EvidenceExternalUrl,
        *,
        actor: User,
        ip: str | None = None,
    ) -> EvidenceResponse:
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        evidence = AuditEvidence(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            finding_id=payload.finding_id,
            checklist_id=payload.checklist_id,
            evidence_type=EvidenceType.EXTERNAL_URL.value,
            description=payload.description,
            external_url=payload.external_url,
            created_by_id=actor.id,
        )
        self._session.add(evidence)
        self._session.flush()
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.EVIDENCE_ADDED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="evidence",
            entity_id=evidence.id,
        )
        self._session.commit()
        return EvidenceResponse.model_validate(evidence)

    async def upload_evidence(
        self,
        audit_id: uuid.UUID,
        file: UploadFile,
        *,
        actor: User,
        finding_id: uuid.UUID | None = None,
        ip: str | None = None,
    ) -> EvidenceResponse:
        if not self._storage or not self._settings:
            raise HTTPException(status_code=500, detail="Storage not configured.")
        if not can_conduct_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        audit = self._get_audit(audit_id)
        data = await file.read()
        filename = file.filename or "evidence.bin"
        mime = file.content_type or "application/octet-stream"
        validate_upload(
            filename=filename,
            mime_type=mime,
            size=len(data),
            settings=self._settings,
        )
        file_hash = hashlib.sha256(data).hexdigest()
        evidence_id = uuid.uuid4()
        storage_key = build_version_storage_key(
            tenant_id=audit.tenant_id,
            document_id=audit.id,
            version_id=evidence_id,
            filename=filename,
        )
        stored = self._storage.put_object(
            storage_key=storage_key,
            data=data,
            mime_type=mime,
        )
        evidence = AuditEvidence(
            id=evidence_id,
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            finding_id=finding_id,
            evidence_type=EvidenceType.FILE_UPLOAD.value,
            file_name=filename,
            storage_key=stored.storage_key,
            mime_type=stored.mime_type,
            file_size=stored.size,
            file_hash_sha256=file_hash,
            created_by_id=actor.id,
        )
        self._session.add(evidence)
        self._session.flush()
        self._activity.log(
            tenant_id=audit.tenant_id,
            audit_id=audit.id,
            action=AuditActivityAction.EVIDENCE_ADDED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="evidence",
            entity_id=evidence.id,
        )
        self._session.commit()
        return EvidenceResponse.model_validate(evidence)

    def list_evidences(self, audit_id: uuid.UUID) -> list[EvidenceResponse]:
        audit = self._get_audit(audit_id)
        return [
            EvidenceResponse.model_validate(e)
            for e in audit.evidences
            if e.deleted_at is None
        ]

    # --- Timeline & Dashboard ---
    def get_timeline(
        self,
        audit_id: uuid.UUID,
        *,
        skip: int,
        limit: int,
    ) -> AuditTimelineResponse:
        audit = self._get_audit(audit_id)
        repo = AuditActivityRepository(self._session)
        rows, total = repo.list_for_audit(audit.tenant_id, audit.id, skip=skip, limit=limit)
        return AuditTimelineResponse(
            items=[AuditTimelineEntry.model_validate(r) for r in rows],
            total=total,
            skip=skip,
            limit=limit,
        )

    def get_dashboard(self) -> AuditDashboardResponse:
        tenant_id = require_current_tenant_id()
        open_audits = self._audits.count_open(tenant_id)
        findings = list(
            self._session.scalars(
                select(AuditFinding).where(
                    AuditFinding.tenant_id == tenant_id,
                    AuditFinding.deleted_at.is_(None),
                )
            ).all()
        )
        critical = sum(1 for f in findings if f.severity == "critica" and f.status != "cerrado")
        open_f = sum(1 for f in findings if f.status in {"abierto", "en_seguimiento"})
        by_process: dict[str, int] = {}
        by_class: dict[str, int] = {}
        for f in findings:
            proc = f.process_area or "sin_proceso"
            by_process[proc] = by_process.get(proc, 0) + 1
            by_class[f.classification] = by_class.get(f.classification, 0) + 1
        plans = list(
            self._session.scalars(
                select(AuditActionPlan).where(
                    AuditActionPlan.tenant_id == tenant_id,
                    AuditActionPlan.deleted_at.is_(None),
                )
            ).all()
        )
        by_plan_status: dict[str, int] = {}
        for p in plans:
            by_plan_status[p.status] = by_plan_status.get(p.status, 0) + 1
        audits = list(
            self._session.scalars(
                select(Audit).where(
                    Audit.tenant_id == tenant_id,
                    Audit.deleted_at.is_(None),
                )
            ).all()
        )
        by_audit_status: dict[str, int] = {}
        scores: list[int] = []
        for a in audits:
            by_audit_status[a.status] = by_audit_status.get(a.status, 0) + 1
            if a.compliance_score is not None:
                scores.append(a.compliance_score)
        avg = round(sum(scores) / len(scores), 1) if scores else None
        return AuditDashboardResponse(
            open_audits=open_audits,
            critical_findings=critical,
            open_findings=open_f,
            compliance_score_avg=avg,
            findings_by_process=by_process,
            findings_by_classification=by_class,
            action_plans_by_status=by_plan_status,
            audits_by_status=by_audit_status,
        )

    # --- Helpers ---
    def _get_plan(self, plan_id: uuid.UUID) -> AuditPlan:
        tenant_id = require_current_tenant_id()
        plan = self._session.get(AuditPlan, plan_id)
        if plan is None or plan.tenant_id != tenant_id or plan.deleted_at:
            raise HTTPException(status_code=404, detail="Plan not found.")
        return plan

    def _get_audit(self, audit_id: uuid.UUID) -> Audit:
        tenant_id = require_current_tenant_id()
        audit = self._audits.get_by_id(tenant_id, audit_id)
        if audit is None:
            raise HTTPException(status_code=404, detail="Audit not found.")
        return audit

    def _audit_detail(self, audit_id: uuid.UUID) -> AuditDetailResponse:
        audit = self._get_audit(audit_id)
        findings = [f for f in audit.findings if f.deleted_at is None]
        return AuditDetailResponse(
            **AuditResponse.model_validate(audit).model_dump(),
            findings_count=len(findings),
            open_findings_count=sum(1 for f in findings if f.status != "cerrado"),
            critical_findings_count=sum(
                1 for f in findings if f.severity == "critica" and f.status != "cerrado"
            ),
            checklist_items_count=len(audit.checklists),
        )

    def _get_finding(self, audit: Audit, finding_id: uuid.UUID) -> AuditFinding:
        finding = next((f for f in audit.findings if f.id == finding_id), None)
        if finding is None or finding.deleted_at:
            raise HTTPException(status_code=404, detail="Finding not found.")
        return finding

    def _get_checklist(self, audit: Audit, checklist_id: uuid.UUID) -> AuditChecklist:
        item = next((c for c in audit.checklists if c.id == checklist_id), None)
        if item is None:
            raise HTTPException(status_code=404, detail="Checklist item not found.")
        return item

    def _resolve_compliance_status(
        self, item: AuditChecklist, payload: ResponseUpsert
    ) -> str:
        if payload.compliance_status is not None:
            return payload.compliance_status.value
        response_type = item.response_type or "cumple"
        if response_type == "texto":
            if not payload.text_value:
                raise HTTPException(
                    status_code=400, detail="text_value required for texto responses."
                )
            return ChecklistCompliance.CUMPLE.value
        if response_type == "numerico":
            if payload.numeric_value is None:
                raise HTTPException(
                    status_code=400,
                    detail="numeric_value required for numerico responses.",
                )
            return ChecklistCompliance.CUMPLE.value
        raise HTTPException(
            status_code=400, detail="compliance_status is required for this question."
        )

    def _checklist_response(self, item: AuditChecklist) -> ChecklistItemResponse:
        resp = item.response
        return ChecklistItemResponse(
            id=item.id,
            audit_id=item.audit_id,
            iso_standard=item.iso_standard,
            clause_code=item.clause_code,
            requirement_text=item.requirement_text,
            question_text=item.question_text,
            sort_order=item.sort_order,
            weight=item.weight,
            template_id=item.template_id,
            template_version_id=item.template_version_id,
            chapter_code=item.chapter_code,
            section_title=item.section_title,
            process_area=item.process_area,
            criticality=item.criticality,
            response_type=item.response_type,
            evidence_required=item.evidence_required,
            compliance_criteria=item.compliance_criteria,
            compliance_status=resp.compliance_status if resp else None,
            score=resp.score if resp else None,
            text_value=resp.text_value if resp else None,
            numeric_value=resp.numeric_value if resp else None,
            observations=resp.observations if resp else None,
        )
