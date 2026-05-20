"""Document audit logging."""

import uuid

from sqlalchemy.orm import Session

from app.domain.documents.audit import DocumentAuditAction
from app.repositories.document_audit_repository import DocumentAuditRepository


class DocumentAuditService:
    def __init__(self, session: Session) -> None:
        self._repo = DocumentAuditRepository(session)

    def log(
        self,
        *,
        tenant_id: uuid.UUID,
        document_id: uuid.UUID,
        action: DocumentAuditAction,
        user_id: uuid.UUID | None,
        version_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        changes: dict | None = None,
        message: str | None = None,
    ) -> None:
        self._repo.append(
            tenant_id=tenant_id,
            document_id=document_id,
            action=action,
            user_id=user_id,
            version_id=version_id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes=changes,
            message=message,
        )
