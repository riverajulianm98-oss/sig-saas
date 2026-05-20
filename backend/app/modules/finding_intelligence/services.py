"""Intelligent finding generation and workflow service."""

import uuid
from datetime import UTC, date, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.audits.audit_actions import AuditActivityAction
from app.domain.audits.enums import (
    ActionPlanStatus,
    FindingSource,
    FindingStatus,
    GenerationSensitivity,
    SuggestionStatus,
)
from app.domain.audits.finding_engine import ChecklistItemContext, generate_suggestions
from app.domain.audits.permissions import can_manage_findings, can_view_audits
from app.domain.audits.scoring import ScoringItem, weighted_average
from app.domain.audits.suggestion_workflow import assert_valid_suggestion_transition
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.audit_action_plan import AuditActionPlan
from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.audit_finding_suggestion import AuditFindingSuggestion
from app.infrastructure.models.audit_finding_suggestion_history import AuditFindingSuggestionHistory
from app.infrastructure.models.tenant_finding_settings import TenantFindingGenerationSettings
from app.infrastructure.models.user import User
from app.modules.audits.activity_service import AuditActivityService
from app.modules.finding_intelligence.schemas import (
    ApproveSuggestionRequest,
    ConvertActionRequest,
    DiscardSuggestionRequest,
    FindingIntelligenceDashboard,
    FindingSettingsResponse,
    FindingSettingsUpdate,
    GenerateSuggestionsRequest,
    GenerateSuggestionsResponse,
    SuggestionHistoryEntry,
    SuggestionResponse,
)
from app.repositories.audit_repository import AuditRepository
from app.repositories.finding_settings_repository import FindingSettingsRepository
from app.repositories.finding_suggestion_repository import FindingSuggestionRepository


class FindingIntelligenceService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._audits = AuditRepository(session)
        self._suggestions = FindingSuggestionRepository(session)
        self._settings = FindingSettingsRepository(session)
        self._activity = AuditActivityService(session)

    def get_settings(self, *, actor: User) -> FindingSettingsResponse:
        if not can_view_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        row = self._settings.get_or_create(tenant_id)
        return FindingSettingsResponse(
            tenant_id=row.tenant_id,
            sensitivity=GenerationSensitivity(row.sensitivity),
            min_clause_score=row.min_clause_score,
            min_process_score=row.min_process_score,
            min_global_score=row.min_global_score,
            min_criticality=row.min_criticality,
            weight_escalation_threshold=row.weight_escalation_threshold,
            reincidence_lookback_days=row.reincidence_lookback_days,
            reincidence_severity_boost=row.reincidence_severity_boost,
            auto_generate_enabled=row.auto_generate_enabled,
            require_manual_validation=row.require_manual_validation,
        )

    def update_settings(
        self, payload: FindingSettingsUpdate, *, actor: User
    ) -> FindingSettingsResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        row = self._settings.get_or_create(tenant_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            if hasattr(value, "value"):
                setattr(row, field, value.value)
            else:
                setattr(row, field, value)
        row.updated_by_id = actor.id
        self._session.commit()
        return self.get_settings(actor=actor)

    def list_suggestions(
        self,
        audit_id: uuid.UUID,
        *,
        actor: User,
        status_filter: str | None = None,
    ) -> list[SuggestionResponse]:
        if not can_view_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        self._require_audit(tenant_id, audit_id)
        rows = self._suggestions.list_for_audit(
            tenant_id, audit_id, status=status_filter
        )
        return [self._to_response(r) for r in rows]

    def generate(
        self,
        audit_id: uuid.UUID,
        payload: GenerateSuggestionsRequest,
        *,
        actor: User,
        ip: str | None = None,
    ) -> GenerateSuggestionsResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        settings_row = self._settings.get_or_create(tenant_id)
        if not settings_row.auto_generate_enabled:
            raise HTTPException(
                status_code=400,
                detail="Automatic generation is disabled for this tenant.",
            )
        rules = self._settings.resolve_rules(tenant_id)
        audit = self._require_audit(tenant_id, audit_id)

        if payload.replace_existing:
            for existing in self._suggestions.list_for_audit(tenant_id, audit_id):
                if existing.status == SuggestionStatus.SUGERIDO.value:
                    existing.deleted_at = datetime.now(UTC)

        contexts = self._build_contexts(audit)
        reincidence = self._suggestions.reincidence_keys(
            tenant_id,
            lookback_days=settings_row.reincidence_lookback_days,
            exclude_audit_id=audit_id,
        )
        global_score = weighted_average(
            [
                ScoringItem(
                    clause_code=c.clause_code,
                    weight=c.weight,
                    criticality=c.criticality,
                    compliance_status=c.compliance_status,
                    process_area=c.process_area,
                )
                for c in contexts
            ]
        )
        drafts = generate_suggestions(
            contexts,
            rules=rules,
            reincidence_keys=reincidence,
            global_score=global_score,
        )

        created_rows: list[AuditFindingSuggestion] = []
        skipped = 0
        for draft in drafts:
            if self._suggestions.active_for_checklist(
                tenant_id, audit_id, draft.checklist_item_id
            ):
                skipped += 1
                continue
            initial_status = SuggestionStatus.SUGERIDO
            if payload.auto_submit_validation or not rules.require_manual_validation:
                initial_status = SuggestionStatus.PENDIENTE_VALIDACION

            row = AuditFindingSuggestion(
                tenant_id=tenant_id,
                audit_id=audit_id,
                checklist_item_id=draft.checklist_item_id,
                template_question_id=draft.template_question_id,
                status=initial_status.value,
                classification=draft.classification,
                severity=draft.severity,
                title=draft.title,
                description=draft.description,
                requirement_reference=draft.requirement_reference,
                process_area=draft.process_area,
                potential_impact=draft.potential_impact,
                initial_recommendation=draft.initial_recommendation,
                confidence_score=draft.confidence_score,
                evidence_ids=[str(e) for e in draft.evidence_ids] or None,
                generation_context=draft.generation_context,
                ai_metadata=draft.ai_metadata,
                created_by_id=actor.id,
            )
            self._session.add(row)
            self._session.flush()
            self._append_history(
                row,
                action="generated",
                from_status=None,
                to_status=row.status,
                user_id=actor.id,
                changes={"confidence": draft.confidence_score},
            )
            created_rows.append(row)

        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=AuditActivityAction.FINDING_SUGGESTIONS_GENERATED,
            user_id=actor.id,
            ip_address=ip,
            changes={"created": len(created_rows), "skipped": skipped},
        )
        self._session.commit()
        return GenerateSuggestionsResponse(
            created=len(created_rows),
            skipped=skipped,
            items=[self._to_response(r) for r in created_rows],
        )

    def submit_validation(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        *,
        actor: User,
    ) -> SuggestionResponse:
        return self._transition(
            audit_id,
            suggestion_id,
            SuggestionStatus.PENDIENTE_VALIDACION,
            actor=actor,
            action="submit_validation",
        )

    def approve(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        payload: ApproveSuggestionRequest,
        *,
        actor: User,
        ip: str | None = None,
    ) -> SuggestionResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        suggestion = self._get_suggestion(tenant_id, audit_id, suggestion_id)
        current = SuggestionStatus(suggestion.status)
        target = SuggestionStatus.APROBADO
        assert_valid_suggestion_transition(current, target)

        audit = self._require_audit(tenant_id, audit_id)
        count = self._session.scalar(
            select(func.count(AuditFinding.id)).where(AuditFinding.audit_id == audit.id)
        ) or 0
        finding = AuditFinding(
            tenant_id=tenant_id,
            audit_id=audit.id,
            code=f"{audit.code}-H{count + 1:03d}",
            title=suggestion.title,
            description=suggestion.description,
            classification=suggestion.classification,
            severity=suggestion.severity,
            status=FindingStatus.ABIERTO.value,
            requirement_reference=suggestion.requirement_reference,
            process_area=suggestion.process_area,
            responsible_user_id=payload.responsible_user_id,
            due_date=payload.due_date,
            source=FindingSource.AUTO.value,
            suggestion_id=suggestion.id,
            created_by_id=actor.id,
        )
        self._session.add(finding)
        self._session.flush()

        suggestion.status = target.value
        suggestion.converted_finding_id = finding.id
        suggestion.reviewed_by_id = actor.id
        suggestion.reviewed_at = datetime.now(UTC)
        self._append_history(
            suggestion,
            action="approved",
            from_status=current.value,
            to_status=target.value,
            user_id=actor.id,
            changes={"finding_id": str(finding.id)},
        )
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=AuditActivityAction.FINDING_SUGGESTION_APPROVED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="finding_suggestion",
            entity_id=suggestion.id,
            changes={"finding_id": str(finding.id)},
        )
        self._session.commit()
        self._session.refresh(suggestion)
        return self._to_response(suggestion)

    def discard(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        payload: DiscardSuggestionRequest,
        *,
        actor: User,
        ip: str | None = None,
    ) -> SuggestionResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        suggestion = self._get_suggestion(tenant_id, audit_id, suggestion_id)
        current = SuggestionStatus(suggestion.status)
        target = SuggestionStatus.DESCARTADO
        assert_valid_suggestion_transition(current, target)
        suggestion.status = target.value
        suggestion.reviewed_by_id = actor.id
        suggestion.reviewed_at = datetime.now(UTC)
        suggestion.discard_reason = payload.reason
        self._append_history(
            suggestion,
            action="discarded",
            from_status=current.value,
            to_status=target.value,
            user_id=actor.id,
            reason=payload.reason,
        )
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=AuditActivityAction.FINDING_SUGGESTION_DISCARDED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="finding_suggestion",
            entity_id=suggestion.id,
            message=payload.reason,
        )
        self._session.commit()
        self._session.refresh(suggestion)
        return self._to_response(suggestion)

    def convert_to_action(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        payload: ConvertActionRequest,
        *,
        actor: User,
        ip: str | None = None,
    ) -> SuggestionResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        suggestion = self._get_suggestion(tenant_id, audit_id, suggestion_id)
        if suggestion.converted_finding_id is None:
            raise HTTPException(
                status_code=400,
                detail="Suggestion must be approved before converting to action.",
            )
        current = SuggestionStatus(suggestion.status)
        target = SuggestionStatus.CONVERTIDO_ACCION
        assert_valid_suggestion_transition(current, target)

        finding = self._session.get(AuditFinding, suggestion.converted_finding_id)
        if finding is None:
            raise HTTPException(status_code=404, detail="Linked finding not found.")

        plan = AuditActionPlan(
            tenant_id=tenant_id,
            finding_id=finding.id,
            title=payload.title,
            description=payload.description or suggestion.initial_recommendation,
            status=ActionPlanStatus.PENDIENTE.value,
            responsible_user_id=payload.responsible_user_id,
            due_date=payload.due_date,
            created_by_id=actor.id,
        )
        self._session.add(plan)
        suggestion.status = target.value
        self._append_history(
            suggestion,
            action="converted_action",
            from_status=current.value,
            to_status=target.value,
            user_id=actor.id,
            changes={"action_plan_title": payload.title},
        )
        self._activity.log(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=AuditActivityAction.FINDING_SUGGESTION_CONVERTED,
            user_id=actor.id,
            ip_address=ip,
            entity_type="finding_suggestion",
            entity_id=suggestion.id,
        )
        self._session.commit()
        self._session.refresh(suggestion)
        return self._to_response(suggestion)

    def get_history(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        *,
        actor: User,
    ) -> list[SuggestionHistoryEntry]:
        if not can_view_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        suggestion = self._get_suggestion(tenant_id, audit_id, suggestion_id)
        return [SuggestionHistoryEntry.model_validate(h) for h in suggestion.history]

    def dashboard(self, *, actor: User) -> FindingIntelligenceDashboard:
        if not can_view_audits(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        by_status = self._suggestions.dashboard_counts(tenant_id)
        total = sum(by_status.values())

        rows = list(
            self._session.scalars(
                select(AuditFindingSuggestion).where(
                    AuditFindingSuggestion.tenant_id == tenant_id,
                    AuditFindingSuggestion.deleted_at.is_(None),
                )
            ).all()
        )
        reincidence_count = sum(
            1
            for r in rows
            if r.generation_context and r.generation_context.get("is_reincident")
        )
        critical_clauses: dict[str, int] = {}
        top_processes: dict[str, int] = {}
        by_class: dict[str, int] = {}
        for row in rows:
            if row.status == SuggestionStatus.DESCARTADO.value:
                continue
            clause = row.requirement_reference or "sin_clausula"
            if row.severity in {"alta", "critica"}:
                critical_clauses[clause] = critical_clauses.get(clause, 0) + 1
            proc = row.process_area or "sin_proceso"
            if row.classification == "no_conformidad":
                top_processes[proc] = top_processes.get(proc, 0) + 1
            by_class[row.classification] = by_class.get(row.classification, 0) + 1

        return FindingIntelligenceDashboard(
            total_suggestions=total,
            by_status=by_status,
            auto_generated=total,
            reincidence_count=reincidence_count,
            critical_clauses=critical_clauses,
            top_non_compliant_processes=dict(
                sorted(top_processes.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            trend_by_classification=by_class,
        )

    # --- helpers ---
    def _transition(
        self,
        audit_id: uuid.UUID,
        suggestion_id: uuid.UUID,
        target: SuggestionStatus,
        *,
        actor: User,
        action: str,
        reason: str | None = None,
    ) -> SuggestionResponse:
        if not can_manage_findings(actor.role):
            raise HTTPException(status_code=403, detail="Forbidden.")
        tenant_id = require_current_tenant_id()
        suggestion = self._get_suggestion(tenant_id, audit_id, suggestion_id)
        current = SuggestionStatus(suggestion.status)
        assert_valid_suggestion_transition(current, target)
        suggestion.status = target.value
        suggestion.reviewed_by_id = actor.id
        suggestion.reviewed_at = datetime.now(UTC)
        if reason:
            suggestion.discard_reason = reason
        self._append_history(
            suggestion,
            action=action,
            from_status=current.value,
            to_status=target.value,
            user_id=actor.id,
            reason=reason,
        )
        self._session.commit()
        self._session.refresh(suggestion)
        return self._to_response(suggestion)

    def _require_audit(self, tenant_id: uuid.UUID, audit_id: uuid.UUID):
        audit = self._audits.get_by_id(tenant_id, audit_id)
        if audit is None:
            raise HTTPException(status_code=404, detail="Audit not found.")
        return audit

    def _get_suggestion(
        self, tenant_id: uuid.UUID, audit_id: uuid.UUID, suggestion_id: uuid.UUID
    ) -> AuditFindingSuggestion:
        row = self._suggestions.get_by_id(tenant_id, suggestion_id)
        if row is None or row.audit_id != audit_id:
            raise HTTPException(status_code=404, detail="Suggestion not found.")
        return row

    def _build_contexts(self, audit) -> list[ChecklistItemContext]:
        evidence_by_checklist: dict[uuid.UUID, list[uuid.UUID]] = {}
        for ev in audit.evidences:
            if ev.checklist_id:
                evidence_by_checklist.setdefault(ev.checklist_id, []).append(ev.id)
        contexts: list[ChecklistItemContext] = []
        for item in audit.checklists:
            if item.response is None:
                continue
            contexts.append(
                ChecklistItemContext(
                    checklist_id=item.id,
                    clause_code=item.clause_code,
                    question_text=item.question_text,
                    compliance_criteria=item.compliance_criteria or item.requirement_text,
                    compliance_status=item.response.compliance_status,
                    weight=item.weight,
                    criticality=item.criticality or "media",
                    process_area=item.process_area,
                    template_question_id=item.template_question_id,
                    observations=item.response.observations,
                    evidence_ids=evidence_by_checklist.get(item.id, []),
                    iso_standard=item.iso_standard,
                    section_title=item.section_title,
                )
            )
        return contexts

    def _append_history(
        self,
        suggestion: AuditFindingSuggestion,
        *,
        action: str,
        from_status: str | None,
        to_status: str | None,
        user_id: uuid.UUID | None,
        reason: str | None = None,
        changes: dict | None = None,
    ) -> None:
        self._session.add(
            AuditFindingSuggestionHistory(
                suggestion_id=suggestion.id,
                tenant_id=suggestion.tenant_id,
                action=action,
                from_status=from_status,
                to_status=to_status,
                user_id=user_id,
                reason=reason,
                changes=changes,
            )
        )

    @staticmethod
    def _to_response(row: AuditFindingSuggestion) -> SuggestionResponse:
        return SuggestionResponse(
            id=row.id,
            audit_id=row.audit_id,
            checklist_item_id=row.checklist_item_id,
            template_question_id=row.template_question_id,
            status=SuggestionStatus(row.status),
            classification=row.classification,
            severity=row.severity,
            title=row.title,
            description=row.description,
            requirement_reference=row.requirement_reference,
            process_area=row.process_area,
            potential_impact=row.potential_impact,
            initial_recommendation=row.initial_recommendation,
            confidence_score=row.confidence_score,
            evidence_ids=row.evidence_ids,
            generation_context=row.generation_context,
            ai_metadata=row.ai_metadata,
            converted_finding_id=row.converted_finding_id,
            reviewed_by_id=row.reviewed_by_id,
            reviewed_at=row.reviewed_at,
            discard_reason=row.discard_reason,
            created_at=row.created_at,
        )
