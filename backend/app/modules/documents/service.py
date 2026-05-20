"""Document control use cases."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.documents.audit import DocumentAuditAction
from app.domain.documents.enums import DocumentStatus, DocumentType
from app.domain.documents.permissions import (
    can_manage_documents,
    can_transition_status,
)
from app.domain.documents.workflow import assert_valid_transition
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.document import Document
from app.infrastructure.models.document_version import DocumentVersion
from app.infrastructure.models.user import User
from app.modules.documents.audit_service import DocumentAuditService
from app.modules.documents.schemas import (
    DocumentCreateRequest,
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentSearchParams,
    DocumentStatusChangeRequest,
    DocumentUpdateRequest,
    DocumentVersionCreateRequest,
    DocumentVersionResponse,
)
from app.repositories.document_repository import DocumentRepository


class DocumentService:
    def __init__(self, session: Session) -> None:
        self._session = session
        self._repo = DocumentRepository(session)
        self._audit = DocumentAuditService(session)

    def search(self, params: DocumentSearchParams) -> DocumentListResponse:
        tenant_id = require_current_tenant_id()
        rows, total = self._repo.search(tenant_id, params)
        return DocumentListResponse(
            items=[DocumentResponse.model_validate(d) for d in rows],
            total=total,
            skip=params.skip,
            limit=params.limit,
        )

    def list_documents(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        document_type: DocumentType | None = None,
        doc_status: DocumentStatus | None = None,
        search: str | None = None,
    ) -> DocumentListResponse:
        return self.search(
            DocumentSearchParams(
                skip=skip,
                limit=limit,
                document_type=document_type,
                status=doc_status,
                search=search,
            )
        )

    def get_document(self, document_id: uuid.UUID) -> DocumentDetailResponse:
        document = self.get_document_entity(document_id)
        return self._to_detail(document)

    def get_document_entity(self, document_id: uuid.UUID) -> Document:
        return self._get_document(document_id)

    def create_document(
        self,
        payload: DocumentCreateRequest,
        *,
        actor: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DocumentDetailResponse:
        if not can_manage_documents(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        tenant_id = require_current_tenant_id()
        code = payload.code.strip().upper()
        if self._repo.code_exists(tenant_id, code):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Document code '{code}' already exists.",
            )

        document = Document(
            tenant_id=tenant_id,
            code=code,
            title=payload.title.strip(),
            description=payload.description,
            document_type=payload.document_type.value,
            status=DocumentStatus.BORRADOR.value,
            process_area=payload.process_area,
            owner_id=payload.owner_id or actor.id,
            expires_at=payload.expires_at,
            tags=payload.tags or None,
            created_by_id=actor.id,
        )
        self._session.add(document)
        self._session.flush()

        version = DocumentVersion(
            document_id=document.id,
            version_number=1,
            change_summary=payload.change_summary or "Versión inicial",
            created_by_id=actor.id,
        )
        self._session.add(version)
        self._session.flush()
        document.current_version_id = version.id

        self._audit.log(
            tenant_id=tenant_id,
            document_id=document.id,
            version_id=version.id,
            action=DocumentAuditAction.CREATED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"code": code, "title": document.title, "status": document.status},
        )
        self._audit.log(
            tenant_id=tenant_id,
            document_id=document.id,
            version_id=version.id,
            action=DocumentAuditAction.VERSION_CREATED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"version_number": 1},
        )
        self._session.commit()
        return self._to_detail(self._get_document(document.id))

    def update_document(
        self,
        document_id: uuid.UUID,
        payload: DocumentUpdateRequest,
        *,
        actor: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DocumentDetailResponse:
        if not can_manage_documents(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        document = self._get_document(document_id)
        if document.status != DocumentStatus.BORRADOR.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only draft documents can be edited.",
            )

        before = {
            "title": document.title,
            "description": document.description,
            "process_area": document.process_area,
            "owner_id": str(document.owner_id) if document.owner_id else None,
            "expires_at": document.expires_at.isoformat() if document.expires_at else None,
            "tags": document.tags,
        }

        if payload.title is not None:
            document.title = payload.title.strip()
        if payload.description is not None:
            document.description = payload.description
        if payload.process_area is not None:
            document.process_area = payload.process_area
        if payload.owner_id is not None:
            document.owner_id = payload.owner_id
        if payload.expires_at is not None:
            document.expires_at = payload.expires_at
        if payload.tags is not None:
            document.tags = payload.tags

        document.updated_by_id = actor.id
        after = {
            "title": document.title,
            "description": document.description,
            "process_area": document.process_area,
            "owner_id": str(document.owner_id) if document.owner_id else None,
            "expires_at": document.expires_at.isoformat() if document.expires_at else None,
            "tags": document.tags,
        }

        self._audit.log(
            tenant_id=document.tenant_id,
            document_id=document.id,
            action=DocumentAuditAction.UPDATED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"before": before, "after": after},
        )
        self._session.commit()
        return self._to_detail(self._get_document(document.id))

    def add_version(
        self,
        document_id: uuid.UUID,
        payload: DocumentVersionCreateRequest,
        *,
        actor: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DocumentDetailResponse:
        if not can_manage_documents(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        document = self._get_document(document_id)
        if document.status not in {
            DocumentStatus.BORRADOR.value,
            DocumentStatus.APROBADO.value,
        }:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New versions are allowed only for draft or approved documents.",
            )

        max_version = self._session.scalar(
            select(func.max(DocumentVersion.version_number)).where(
                DocumentVersion.document_id == document.id
            )
        ) or 0

        version = DocumentVersion(
            document_id=document.id,
            version_number=max_version + 1,
            change_summary=payload.change_summary,
            created_by_id=actor.id,
        )
        self._session.add(version)
        self._session.flush()
        document.current_version_id = version.id
        document.status = DocumentStatus.BORRADOR.value
        document.updated_by_id = actor.id

        self._audit.log(
            tenant_id=document.tenant_id,
            document_id=document.id,
            version_id=version.id,
            action=DocumentAuditAction.VERSION_CREATED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"version_number": version.version_number},
            message=payload.change_summary,
        )
        self._session.commit()
        return self._to_detail(self._get_document(document.id))

    def change_status(
        self,
        document_id: uuid.UUID,
        payload: DocumentStatusChangeRequest,
        *,
        actor: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> DocumentDetailResponse:
        document = self._get_document(document_id)
        current = DocumentStatus(document.status)
        target = payload.status

        if not can_transition_status(actor.role, target):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        assert_valid_transition(current, target)

        document.status = target.value
        document.updated_by_id = actor.id

        if current == DocumentStatus.REVISION and target == DocumentStatus.BORRADOR:
            action = DocumentAuditAction.REJECTED
        elif target == DocumentStatus.APROBADO:
            action = DocumentAuditAction.APPROVED
        else:
            action = DocumentAuditAction.STATUS_CHANGED

        self._audit.log(
            tenant_id=document.tenant_id,
            document_id=document.id,
            version_id=document.current_version_id,
            action=action,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"from": current.value, "to": target.value},
            message=payload.comment,
        )
        self._session.commit()
        return self._to_detail(self._get_document(document.id))

    def deactivate_document(
        self,
        document_id: uuid.UUID,
        *,
        actor: User,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        if not can_manage_documents(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        document = self._get_document(document_id)
        document.deleted_at = datetime.now(UTC)
        document.updated_by_id = actor.id

        self._audit.log(
            tenant_id=document.tenant_id,
            document_id=document.id,
            action=DocumentAuditAction.DELETED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self._session.commit()

    def _get_document(self, document_id: uuid.UUID) -> Document:
        tenant_id = require_current_tenant_id()
        document = self._repo.get_by_id(tenant_id, document_id)
        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )
        return document

    def _to_detail(self, document: Document) -> DocumentDetailResponse:
        versions = sorted(document.versions, key=lambda v: v.version_number, reverse=True)
        return DocumentDetailResponse(
            **DocumentResponse.model_validate(document).model_dump(),
            current_version=(
                DocumentVersionResponse.model_validate(document.current_version)
                if document.current_version
                else None
            ),
            versions=[DocumentVersionResponse.model_validate(v) for v in versions],
        )
