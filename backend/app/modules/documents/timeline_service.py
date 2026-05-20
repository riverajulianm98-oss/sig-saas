"""Unified document history timeline."""

import uuid

from sqlalchemy.orm import Session

from app.domain.tenancy.context import require_current_tenant_id
from app.modules.documents.schemas import DocumentTimelineEntry, DocumentTimelineResponse
from app.repositories.document_audit_repository import DocumentAuditRepository
from app.repositories.document_repository import DocumentRepository


class DocumentTimelineService:
    def __init__(self, session: Session) -> None:
        self._audit = DocumentAuditRepository(session)
        self._documents = DocumentRepository(session)

    def get_timeline(
        self,
        document_id: uuid.UUID,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> DocumentTimelineResponse:
        tenant_id = require_current_tenant_id()
        document = self._documents.get_by_id(tenant_id, document_id)
        if document is None:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        logs, total = self._audit.list_for_document(
            tenant_id,
            document_id,
            skip=skip,
            limit=limit,
        )
        items = [
            DocumentTimelineEntry(
                id=log.id,
                action=log.action,
                user_id=log.user_id,
                version_id=log.version_id,
                ip_address=log.ip_address,
                changes=log.changes,
                message=log.message,
                created_at=log.created_at,
            )
            for log in logs
        ]
        return DocumentTimelineResponse(items=items, total=total, skip=skip, limit=limit)
