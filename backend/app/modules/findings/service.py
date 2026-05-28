"""Standalone findings service — tenant-wide view across all audits."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.infrastructure.models.audit import Audit
from app.infrastructure.models.audit_action_plan import AuditActionPlan
from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.user import User
from app.modules.findings.schemas import (
    CapaCreate,
    CapaResponse,
    CapaStatusChange,
    CapaUpdate,
    FindingCreate,
    FindingDetail,
    FindingListResponse,
    FindingResponse,
    FindingsDashboardStats,
    FindingUpdate,
)


def _finding_to_response(f: AuditFinding, db: Session) -> FindingResponse:
    audit = db.get(Audit, f.audit_id)
    responsible_name: str | None = None
    if f.responsible_user_id:
        u = db.get(User, f.responsible_user_id)
        responsible_name = u.full_name if u else None

    actions = (
        db.query(AuditActionPlan)
        .filter(AuditActionPlan.finding_id == f.id, AuditActionPlan.deleted_at.is_(None))
        .all()
    )
    open_actions = [a for a in actions if a.status not in ("completada", "cancelada")]

    return FindingResponse(
        id=f.id,
        tenant_id=f.tenant_id,
        audit_id=f.audit_id,
        audit_code=audit.code if audit else None,
        audit_title=audit.title if audit else None,
        code=f.code,
        title=f.title,
        description=f.description,
        classification=f.classification,
        severity=f.severity,
        status=f.status,
        source=f.source,
        requirement_reference=f.requirement_reference,
        process_area=f.process_area,
        responsible_user_id=f.responsible_user_id,
        responsible_name=responsible_name,
        due_date=f.due_date,
        root_cause=f.root_cause,
        root_cause_category=None,
        actions_count=len(actions),
        open_actions_count=len(open_actions),
        is_recurrent=False,
        created_at=f.created_at,
        updated_at=f.updated_at,
    )


class FindingsService:
    def __init__(self, db: Session, tenant_id: uuid.UUID) -> None:
        self.db = db
        self.tenant_id = tenant_id

    def _base_query(self):
        return (
            self.db.query(AuditFinding)
            .filter(
                AuditFinding.tenant_id == self.tenant_id,
                AuditFinding.deleted_at.is_(None),
            )
        )

    def dashboard(self) -> FindingsDashboardStats:
        findings = self._base_query().all()
        actions = (
            self.db.query(AuditActionPlan)
            .filter(
                AuditActionPlan.tenant_id == self.tenant_id,
                AuditActionPlan.deleted_at.is_(None),
            )
            .all()
        )

        by_severity: dict[str, int] = {}
        by_classification: dict[str, int] = {}
        open_count = in_progress_count = closed_count = overdue = 0

        today = date.today()
        for f in findings:
            s = f.severity or "media"
            c = f.classification or "observacion"
            by_severity[s] = by_severity.get(s, 0) + 1
            by_classification[c] = by_classification.get(c, 0) + 1

            if f.status == "cerrado":
                closed_count += 1
            elif f.status == "en_seguimiento":
                in_progress_count += 1
            else:
                open_count += 1

            if f.due_date and f.due_date < today and f.status != "cerrado":
                overdue += 1

        open_capa = sum(1 for a in actions if a.status not in ("completada", "cancelada"))
        overdue_capa = sum(
            1 for a in actions
            if a.status not in ("completada", "cancelada")
            and a.due_date and a.due_date < today
        )

        return FindingsDashboardStats(
            total=len(findings),
            open=open_count,
            in_progress=in_progress_count,
            closed=closed_count,
            by_severity=by_severity,
            by_classification=by_classification,
            overdue=overdue,
            open_capa=open_capa,
            overdue_capa=overdue_capa,
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 20,
        status: str | None = None,
        severity: str | None = None,
        classification: str | None = None,
        process_area: str | None = None,
        search: str | None = None,
        audit_id: uuid.UUID | None = None,
    ) -> FindingListResponse:
        q = self._base_query()
        if status:
            q = q.filter(AuditFinding.status == status)
        if severity:
            q = q.filter(AuditFinding.severity == severity)
        if classification:
            q = q.filter(AuditFinding.classification == classification)
        if process_area:
            q = q.filter(AuditFinding.process_area == process_area)
        if audit_id:
            q = q.filter(AuditFinding.audit_id == audit_id)
        if search:
            term = f"%{search}%"
            q = q.filter(
                AuditFinding.title.ilike(term) | AuditFinding.description.ilike(term)
            )

        total = q.count()
        findings = q.order_by(AuditFinding.created_at.desc()).offset(skip).limit(limit).all()

        return FindingListResponse(
            items=[_finding_to_response(f, self.db) for f in findings],
            total=total,
            skip=skip,
            limit=limit,
        )

    def get(self, finding_id: uuid.UUID) -> FindingDetail:
        f = (
            self._base_query()
            .filter(AuditFinding.id == finding_id)
            .first()
        )
        if not f:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

        base = _finding_to_response(f, self.db)
        actions = (
            self.db.query(AuditActionPlan)
            .filter(AuditActionPlan.finding_id == finding_id, AuditActionPlan.deleted_at.is_(None))
            .order_by(AuditActionPlan.created_at.desc())
            .all()
        )
        return FindingDetail(**base.model_dump(), actions=[CapaResponse.model_validate(a) for a in actions])

    def create(self, data: FindingCreate) -> FindingDetail:
        # Verify audit belongs to this tenant
        audit = self.db.query(Audit).filter(
            Audit.id == data.audit_id,
            Audit.tenant_id == self.tenant_id,
            Audit.deleted_at.is_(None),
        ).first()
        if not audit:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")

        f = AuditFinding(
            tenant_id=self.tenant_id,
            audit_id=data.audit_id,
            title=data.title,
            description=data.description,
            classification=data.classification,
            severity=data.severity,
            status="abierto",
            requirement_reference=data.requirement_reference,
            process_area=data.process_area,
            responsible_user_id=data.responsible_user_id,
            due_date=data.due_date,
            root_cause=data.root_cause,
            source=data.source,
            code=data.code,
        )
        self.db.add(f)
        self.db.commit()
        self.db.refresh(f)
        return self.get(f.id)

    def update(self, finding_id: uuid.UUID, data: FindingUpdate) -> FindingDetail:
        f = self._base_query().filter(AuditFinding.id == finding_id).first()
        if not f:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

        for field, val in data.model_dump(exclude_none=True).items():
            if hasattr(f, field):
                setattr(f, field, val)
        self.db.commit()
        self.db.refresh(f)
        return self.get(f.id)

    def delete(self, finding_id: uuid.UUID) -> None:
        f = self._base_query().filter(AuditFinding.id == finding_id).first()
        if not f:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")
        from datetime import datetime, UTC
        f.deleted_at = datetime.now(UTC)
        self.db.commit()

    # ── CAPA actions ─────────────────────────────────────────────────────────

    def list_actions(self, finding_id: uuid.UUID) -> list[CapaResponse]:
        self.get(finding_id)  # validates ownership
        actions = (
            self.db.query(AuditActionPlan)
            .filter(AuditActionPlan.finding_id == finding_id, AuditActionPlan.deleted_at.is_(None))
            .order_by(AuditActionPlan.created_at.desc())
            .all()
        )
        return [CapaResponse.model_validate(a) for a in actions]

    def create_action(self, finding_id: uuid.UUID, data: CapaCreate) -> CapaResponse:
        self.get(finding_id)  # validates ownership
        action = AuditActionPlan(
            tenant_id=self.tenant_id,
            finding_id=finding_id,
            title=data.title,
            description=data.description,
            status="pendiente",
            responsible_user_id=data.responsible_user_id,
            due_date=data.due_date,
        )
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        return CapaResponse.model_validate(action)

    def update_action(self, finding_id: uuid.UUID, action_id: uuid.UUID, data: CapaUpdate) -> CapaResponse:
        self.get(finding_id)
        action = self.db.query(AuditActionPlan).filter(
            AuditActionPlan.id == action_id,
            AuditActionPlan.finding_id == finding_id,
            AuditActionPlan.deleted_at.is_(None),
        ).first()
        if not action:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        for field, val in data.model_dump(exclude_none=True).items():
            if hasattr(action, field):
                setattr(action, field, val)
        self.db.commit()
        self.db.refresh(action)
        return CapaResponse.model_validate(action)

    def change_action_status(self, finding_id: uuid.UUID, action_id: uuid.UUID, data: CapaStatusChange) -> CapaResponse:
        from datetime import datetime, UTC
        action = self.db.query(AuditActionPlan).filter(
            AuditActionPlan.id == action_id,
            AuditActionPlan.finding_id == finding_id,
            AuditActionPlan.deleted_at.is_(None),
        ).first()
        if not action:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        action.status = data.status
        if data.status == "completada" and not action.completed_at:
            action.completed_at = datetime.now(UTC)
        self.db.commit()
        self.db.refresh(action)
        return CapaResponse.model_validate(action)

    def delete_action(self, finding_id: uuid.UUID, action_id: uuid.UUID) -> None:
        from datetime import datetime, UTC
        action = self.db.query(AuditActionPlan).filter(
            AuditActionPlan.id == action_id,
            AuditActionPlan.finding_id == finding_id,
            AuditActionPlan.deleted_at.is_(None),
        ).first()
        if not action:
            from fastapi import HTTPException, status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        action.deleted_at = datetime.now(UTC)
        self.db.commit()
