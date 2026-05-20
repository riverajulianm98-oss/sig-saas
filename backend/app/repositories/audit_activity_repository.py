"""Audit activity log persistence."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.audits.audit_actions import AuditActivityAction
from app.infrastructure.models.audit_activity_log import AuditActivityLog


class AuditActivityRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def append(
        self,
        *,
        tenant_id: uuid.UUID,
        audit_id: uuid.UUID,
        action: AuditActivityAction,
        user_id: uuid.UUID | None,
        entity_type: str | None = None,
        entity_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        changes: dict | None = None,
        message: str | None = None,
    ) -> AuditActivityLog:
        row = AuditActivityLog(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=action.value,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            changes=changes,
            message=message,
        )
        self._session.add(row)
        self._session.flush()
        return row

    def list_for_audit(
        self,
        tenant_id: uuid.UUID,
        audit_id: uuid.UUID,
        *,
        skip: int,
        limit: int,
    ) -> tuple[list[AuditActivityLog], int]:
        filters = (
            AuditActivityLog.tenant_id == tenant_id,
            AuditActivityLog.audit_id == audit_id,
        )
        total = self._session.scalar(
            select(func.count(AuditActivityLog.id)).where(*filters)
        ) or 0
        rows = self._session.scalars(
            select(AuditActivityLog)
            .where(*filters)
            .order_by(AuditActivityLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(rows), total
