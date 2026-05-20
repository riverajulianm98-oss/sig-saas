"""Document file upload, download, and storage orchestration."""

import hashlib
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.domain.documents.ai import DocumentAIMetadata
from app.domain.documents.audit import DocumentAuditAction
from app.domain.documents.permissions import can_manage_documents
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.document import Document
from app.infrastructure.models.document_version import DocumentVersion
from app.infrastructure.models.user import User
from app.infrastructure.storage.paths import build_version_storage_key
from app.infrastructure.storage.protocol import StorageProvider
from app.infrastructure.storage.validators import validate_upload
from app.modules.documents.audit_service import DocumentAuditService
from app.repositories.document_repository import DocumentRepository


class DocumentFileService:
    def __init__(
        self,
        session: Session,
        storage: StorageProvider,
        settings: Settings,
    ) -> None:
        self._session = session
        self._storage = storage
        self._settings = settings
        self._documents = DocumentRepository(session)
        self._audit = DocumentAuditService(session)

    async def upload_version_file(
        self,
        *,
        document_id: uuid.UUID,
        version_id: uuid.UUID,
        file: UploadFile,
        actor: User,
        ip_address: str | None,
        user_agent: str | None,
    ) -> DocumentVersion:
        if not can_manage_documents(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        tenant_id = require_current_tenant_id()
        document = self._documents.get_by_id(tenant_id, document_id)
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        version = next((v for v in document.versions if v.id == version_id), None)
        if version is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found.")

        filename = file.filename or "upload.bin"
        mime_type = file.content_type or "application/octet-stream"
        data = await file.read()
        validate_upload(
            filename=filename,
            mime_type=mime_type,
            size=len(data),
            settings=self._settings,
        )

        file_hash = hashlib.sha256(data).hexdigest()
        storage_key = build_version_storage_key(
            tenant_id=tenant_id,
            document_id=document.id,
            version_id=version.id,
            filename=filename,
        )

        if version.storage_key and version.storage_key != storage_key:
            try:
                self._storage.delete_object(storage_key=version.storage_key)
            except Exception:
                pass

        stored = self._storage.put_object(
            storage_key=storage_key,
            data=data,
            mime_type=mime_type,
        )

        version.file_name = filename
        version.storage_key = stored.storage_key
        version.mime_type = stored.mime_type
        version.file_size = stored.size
        version.file_hash_sha256 = file_hash
        version.ai_metadata = DocumentAIMetadata().model_dump()
        document.updated_by_id = actor.id

        self._audit.log(
            tenant_id=tenant_id,
            document_id=document.id,
            version_id=version.id,
            action=DocumentAuditAction.FILE_UPLOADED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={
                "file_name": filename,
                "mime_type": mime_type,
                "file_size": stored.size,
                "file_hash_sha256": file_hash,
            },
        )
        self._session.commit()
        self._session.refresh(version)
        return version

    def get_download_url(
        self,
        *,
        document: Document,
        version: DocumentVersion,
        actor: User,
        ip_address: str | None,
        user_agent: str | None,
    ) -> str:
        if not version.storage_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No file attached to this version.",
            )

        tenant_id = require_current_tenant_id()
        if document.tenant_id != tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        if self._settings.storage_provider.lower() == "local":
            base = self._settings.storage_public_base_url.rstrip("/")
            url = (
                f"{base}/api/v1/documents/{document.id}/versions/"
                f"{version.id}/download"
            )
        else:
            url = self._storage.generate_download_url(
                storage_key=version.storage_key,
                file_name=version.file_name or "document",
                expires_seconds=self._settings.storage_signed_url_expire_seconds,
            )

        self._audit.log(
            tenant_id=tenant_id,
            document_id=document.id,
            version_id=version.id,
            action=DocumentAuditAction.FILE_DOWNLOADED,
            user_id=actor.id,
            ip_address=ip_address,
            user_agent=user_agent,
            changes={"storage_key": version.storage_key},
        )
        self._session.commit()
        return url

    def read_file_bytes(self, *, version: DocumentVersion) -> tuple[bytes, str, str]:
        if not version.storage_key:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
        if self._settings.storage_provider.lower() == "local":
            from app.infrastructure.storage.local import LocalStorageProvider

            if isinstance(self._storage, LocalStorageProvider):
                data, _ = self._storage.read_object(storage_key=version.storage_key)
                return data, version.mime_type or "application/octet-stream", version.file_name or "file"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Direct download is only available for local storage.",
        )
