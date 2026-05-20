"""Document audit log persistence."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.documents.audit import DocumentAuditAction
from app.infrastructure.models.document_audit_log import DocumentAuditLog


class DocumentAuditRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def append(
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
    ) -> DocumentAuditLog:
        entry = DocumentAuditLog(
            tenant_id=tenant_id,
            document_id=document_id,
            version_id=version_id,
            user_id=user_id,
            action=action.value,
            ip_address=ip_address,
            user_agent=user_agent,
            changes=changes,
            message=message,
        )
        self._session.add(entry)
        self._session.flush()
        return entry

    def list_for_document(
        self,
        tenant_id: uuid.UUID,
        document_id: uuid.UUID,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[DocumentAuditLog], int]:
        filters = (
            DocumentAuditLog.tenant_id == tenant_id,
            DocumentAuditLog.document_id == document_id,
        )
        total = self._session.scalar(
            select(func.count(DocumentAuditLog.id)).where(*filters)
        ) or 0
        rows = self._session.scalars(
            select(DocumentAuditLog)
            .where(*filters)
            .order_by(DocumentAuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(rows), total
