"""Document management API schemas."""

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.domain.documents.enums import DocumentStatus, DocumentType


class DocumentVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version_number: int
    change_summary: str | None
    file_name: str | None
    storage_key: str | None
    mime_type: str | None
    file_size: int | None
    file_hash_sha256: str | None
    ai_metadata: dict[str, Any] | None
    created_by_id: uuid.UUID | None
    created_at: datetime


class DocumentCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    title: str = Field(..., min_length=2, max_length=500)
    document_type: DocumentType
    description: str | None = None
    process_area: str | None = Field(default=None, max_length=255)
    owner_id: uuid.UUID | None = None
    expires_at: datetime | None = None
    tags: list[str] = Field(default_factory=list)
    change_summary: str | None = Field(
        default="Versión inicial",
        max_length=2000,
    )


class DocumentUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    process_area: str | None = Field(default=None, max_length=255)
    owner_id: uuid.UUID | None = None
    expires_at: datetime | None = None
    tags: list[str] | None = None


class DocumentVersionCreateRequest(BaseModel):
    change_summary: str = Field(..., min_length=2, max_length=2000)


class DocumentStatusChangeRequest(BaseModel):
    status: DocumentStatus
    comment: str | None = Field(default=None, max_length=2000)


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    code: str
    title: str
    description: str | None
    document_type: DocumentType
    status: DocumentStatus
    process_area: str | None
    owner_id: uuid.UUID | None
    current_version_id: uuid.UUID | None
    expires_at: datetime | None
    tags: list[str] | None
    created_at: datetime
    updated_at: datetime


class DocumentDetailResponse(DocumentResponse):
    current_version: DocumentVersionResponse | None
    versions: list[DocumentVersionResponse]


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    skip: int
    limit: int


class DocumentSearchParams(BaseModel):
    skip: int = 0
    limit: int = 20
    code: str | None = None
    status: DocumentStatus | None = None
    document_type: DocumentType | None = None
    process_area: str | None = None
    owner_id: uuid.UUID | None = None
    tags: list[str] | None = None
    search: str | None = None
    expires_from: datetime | None = None
    expires_to: datetime | None = None
    created_from: datetime | None = None
    created_to: datetime | None = None
    has_file: bool | None = None


class FileUploadResponse(BaseModel):
    version: DocumentVersionResponse
    message: str = "File uploaded successfully."


class DownloadUrlResponse(BaseModel):
    url: str
    expires_in: int | None = None
    file_name: str | None = None


class DocumentTimelineEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    user_id: uuid.UUID | None
    version_id: uuid.UUID | None
    ip_address: str | None
    changes: dict[str, Any] | None
    message: str | None
    created_at: datetime


class DocumentTimelineResponse(BaseModel):
    items: list[DocumentTimelineEntry]
    total: int
    skip: int
    limit: int


class DocumentAlertItem(BaseModel):
    severity: Literal["expired", "warning", "critical"]
    document: DocumentResponse
    expires_at: datetime | None


class DocumentAlertsResponse(BaseModel):
    expired: list[DocumentAlertItem]
    expiring_soon: list[DocumentAlertItem]
    expiring_critical: list[DocumentAlertItem]
    settings: dict[str, Any]


class TenantDocumentSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tenant_id: uuid.UUID
    expiration_warning_days: int
    expiration_critical_days: int
    email_alerts_enabled: bool
    websocket_alerts_enabled: bool


class TenantDocumentSettingsUpdate(BaseModel):
    expiration_warning_days: int | None = Field(default=None, ge=1, le=365)
    expiration_critical_days: int | None = Field(default=None, ge=1, le=90)
    email_alerts_enabled: bool | None = None
    websocket_alerts_enabled: bool | None = None
