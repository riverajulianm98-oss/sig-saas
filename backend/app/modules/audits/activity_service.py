"""Audit module activity logging."""

import uuid

from sqlalchemy.orm import Session

from app.domain.audits.audit_actions import AuditActivityAction
from app.repositories.audit_activity_repository import AuditActivityRepository


class AuditActivityService:
    def __init__(self, session: Session) -> None:
        self._repo = AuditActivityRepository(session)

    def log(
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
    ) -> None:
        self._repo.append(
            tenant_id=tenant_id,
            audit_id=audit_id,
            action=action,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            ip_address=ip_address,
            changes=changes,
            message=message,
        )
