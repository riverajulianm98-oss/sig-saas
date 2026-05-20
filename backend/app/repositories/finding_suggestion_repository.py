"""Finding suggestion persistence."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.audit_finding_suggestion import AuditFindingSuggestion


class FindingSuggestionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(
        self, tenant_id: uuid.UUID, suggestion_id: uuid.UUID
    ) -> AuditFindingSuggestion | None:
        return self._session.scalar(
            select(AuditFindingSuggestion)
            .where(
                AuditFindingSuggestion.id == suggestion_id,
                AuditFindingSuggestion.tenant_id == tenant_id,
                AuditFindingSuggestion.deleted_at.is_(None),
            )
            .options(selectinload(AuditFindingSuggestion.history))
        )

    def list_for_audit(
        self,
        tenant_id: uuid.UUID,
        audit_id: uuid.UUID,
        *,
        status: str | None = None,
    ) -> list[AuditFindingSuggestion]:
        filters = [
            AuditFindingSuggestion.tenant_id == tenant_id,
            AuditFindingSuggestion.audit_id == audit_id,
            AuditFindingSuggestion.deleted_at.is_(None),
        ]
        if status:
            filters.append(AuditFindingSuggestion.status == status)
        return list(
            self._session.scalars(
                select(AuditFindingSuggestion)
                .where(*filters)
                .order_by(AuditFindingSuggestion.created_at.desc())
            ).all()
        )

    def active_for_checklist(
        self, tenant_id: uuid.UUID, audit_id: uuid.UUID, checklist_item_id: uuid.UUID
    ) -> AuditFindingSuggestion | None:
        return self._session.scalar(
            select(AuditFindingSuggestion).where(
                AuditFindingSuggestion.tenant_id == tenant_id,
                AuditFindingSuggestion.audit_id == audit_id,
                AuditFindingSuggestion.checklist_item_id == checklist_item_id,
                AuditFindingSuggestion.deleted_at.is_(None),
                AuditFindingSuggestion.status.not_in(["descartado"]),
            )
        )

    def reincidence_keys(
        self,
        tenant_id: uuid.UUID,
        *,
        lookback_days: int,
        exclude_audit_id: uuid.UUID | None = None,
    ) -> set[str]:
        since = datetime.now(UTC) - timedelta(days=lookback_days)
        filters = [
            AuditFinding.tenant_id == tenant_id,
            AuditFinding.deleted_at.is_(None),
            AuditFinding.created_at >= since,
            AuditFinding.status != "cerrado",
        ]
        if exclude_audit_id:
            filters.append(AuditFinding.audit_id != exclude_audit_id)
        rows = self._session.scalars(
            select(
                AuditFinding.requirement_reference,
                AuditFinding.process_area,
            ).where(*filters)
        ).all()
        keys: set[str] = set()
        for clause, process in rows:
            if clause:
                keys.add(f"{clause}:{process or ''}")
        suggestion_rows = self._session.scalars(
            select(
                AuditFindingSuggestion.requirement_reference,
                AuditFindingSuggestion.process_area,
                AuditFindingSuggestion.template_question_id,
            ).where(
                AuditFindingSuggestion.tenant_id == tenant_id,
                AuditFindingSuggestion.deleted_at.is_(None),
                AuditFindingSuggestion.created_at >= since,
                AuditFindingSuggestion.status.in_(["aprobado", "convertido_accion"]),
            )
        ).all()
        for clause, process, question_id in suggestion_rows:
            if clause:
                keys.add(f"{clause}:{process or ''}")
            if question_id:
                keys.add(str(question_id))
        return keys

    def dashboard_counts(self, tenant_id: uuid.UUID) -> dict[str, int]:
        rows = self._session.execute(
            select(AuditFindingSuggestion.status, func.count(AuditFindingSuggestion.id))
            .where(
                AuditFindingSuggestion.tenant_id == tenant_id,
                AuditFindingSuggestion.deleted_at.is_(None),
            )
            .group_by(AuditFindingSuggestion.status)
        ).all()
        return {status: count for status, count in rows}
