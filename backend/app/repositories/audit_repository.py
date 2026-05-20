"""Audit persistence."""

import uuid
from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.infrastructure.models.audit import Audit
from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.audit_response import AuditResponse
from app.domain.audits.scoring import ScoringItem, weighted_average
from app.infrastructure.models.audit_checklist import AuditChecklist


class AuditRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, tenant_id: uuid.UUID, audit_id: uuid.UUID) -> Audit | None:
        return self._session.scalar(
            select(Audit)
            .where(
                Audit.id == audit_id,
                Audit.tenant_id == tenant_id,
                Audit.deleted_at.is_(None),
            )
            .options(
                selectinload(Audit.findings).selectinload(AuditFinding.action_plans),
                selectinload(Audit.checklists).selectinload(AuditChecklist.response),
                selectinload(Audit.evidences),
            )
        )

    def code_exists(self, tenant_id: uuid.UUID, code: str) -> bool:
        return bool(
            self._session.scalar(
                select(Audit.id).where(
                    Audit.tenant_id == tenant_id,
                    Audit.code == code,
                    Audit.deleted_at.is_(None),
                )
            )
        )

    def search(
        self,
        tenant_id: uuid.UUID,
        *,
        skip: int,
        limit: int,
        status: str | None = None,
        audit_type: str | None = None,
        process_area: str | None = None,
        lead_auditor_id: uuid.UUID | None = None,
        search: str | None = None,
        planned_from: date | None = None,
        planned_to: date | None = None,
    ) -> tuple[list[Audit], int]:
        filters = [Audit.tenant_id == tenant_id, Audit.deleted_at.is_(None)]
        if status:
            filters.append(Audit.status == status)
        if audit_type:
            filters.append(Audit.audit_type == audit_type)
        if process_area:
            filters.append(Audit.process_area.ilike(f"%{process_area}%"))
        if lead_auditor_id:
            filters.append(Audit.lead_auditor_id == lead_auditor_id)
        if planned_from:
            filters.append(Audit.planned_start_date >= planned_from)
        if planned_to:
            filters.append(Audit.planned_end_date <= planned_to)
        if search:
            term = f"%{search}%"
            filters.append(or_(Audit.code.ilike(term), Audit.title.ilike(term)))

        total = self._session.scalar(select(func.count(Audit.id)).where(*filters)) or 0
        rows = self._session.scalars(
            select(Audit)
            .where(*filters)
            .order_by(Audit.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(rows), total

    def count_open(self, tenant_id: uuid.UUID) -> int:
        return self._session.scalar(
            select(func.count(Audit.id)).where(
                Audit.tenant_id == tenant_id,
                Audit.deleted_at.is_(None),
                Audit.status.in_(["planeada", "en_proceso", "finalizada"]),
            )
        ) or 0

    def compute_compliance_score(self, audit_id: uuid.UUID) -> int | None:
        rows = list(
            self._session.scalars(
                select(AuditChecklist)
                .where(AuditChecklist.audit_id == audit_id)
                .options(selectinload(AuditChecklist.response))
            ).all()
        )
        items: list[ScoringItem] = []
        for checklist in rows:
            status_value = "pendiente"
            score = None
            if checklist.response:
                status_value = checklist.response.compliance_status
                score = checklist.response.score
            if status_value == "pendiente":
                continue
            items.append(
                ScoringItem(
                    clause_code=checklist.clause_code,
                    weight=checklist.weight,
                    criticality=checklist.criticality or "media",
                    compliance_status=status_value,
                    process_area=checklist.process_area,
                    score=score,
                )
            )
        return weighted_average(items)
