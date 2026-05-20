"""Document management routes."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile, status
from fastapi.responses import Response

from app.api.deps import get_current_user
from app.api.rbac import require_roles
from app.domain.auth.enums import UserRole
from app.domain.documents.enums import DocumentStatus, DocumentType
from app.infrastructure.models.user import User
from app.core.config import Settings, get_settings
from app.modules.documents.deps import (
    get_alert_service,
    get_document_service,
    get_file_service,
    get_settings_service,
    get_timeline_service,
)
from app.modules.documents.alert_service import DocumentAlertService
from app.modules.documents.file_service import DocumentFileService
from app.modules.documents.schemas import (
    DocumentAlertsResponse,
    DocumentCreateRequest,
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentSearchParams,
    DocumentStatusChangeRequest,
    DocumentTimelineResponse,
    DocumentUpdateRequest,
    DocumentVersionCreateRequest,
    DocumentVersionResponse,
    DownloadUrlResponse,
    FileUploadResponse,
    TenantDocumentSettingsResponse,
    TenantDocumentSettingsUpdate,
)
from app.modules.documents.service import DocumentService
from app.modules.documents.settings_service import TenantDocumentSettingsService
from app.modules.documents.timeline_service import DocumentTimelineService
from app.schemas.common import APIMessage
from app.utils.request import get_client_ip

router = APIRouter(prefix="/documents", tags=["documents"])


def _ctx(request: Request) -> tuple[str | None, str | None]:
    return get_client_ip(request), request.headers.get("User-Agent")


@router.get("/search", response_model=DocumentListResponse, summary="Advanced search")
def search_documents(
    request: Request,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    code: str | None = None,
    status_filter: DocumentStatus | None = Query(default=None, alias="status"),
    document_type: DocumentType | None = Query(default=None, alias="type"),
    process_area: str | None = None,
    owner_id: uuid.UUID | None = None,
    tags: str | None = Query(default=None, description="Comma-separated tags"),
    search: str | None = Query(default=None, max_length=200),
    expires_from: datetime | None = None,
    expires_to: datetime | None = None,
    created_from: datetime | None = None,
    created_to: datetime | None = None,
    has_file: bool | None = None,
    _: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> DocumentListResponse:
    _ = request
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    return service.search(
        DocumentSearchParams(
            skip=skip,
            limit=limit,
            code=code,
            status=status_filter,
            document_type=document_type,
            process_area=process_area,
            owner_id=owner_id,
            tags=tag_list,
            search=search,
            expires_from=expires_from,
            expires_to=expires_to,
            created_from=created_from,
            created_to=created_to,
            has_file=has_file,
        )
    )


@router.get("/alerts", response_model=DocumentAlertsResponse, summary="Expiration alerts")
def document_alerts(
    _: User = Depends(get_current_user),
    service: DocumentAlertService = Depends(get_alert_service),
) -> DocumentAlertsResponse:
    return service.get_alerts()


@router.get(
    "/settings",
    response_model=TenantDocumentSettingsResponse,
    summary="Tenant document settings",
)
def get_document_settings(
    _: User = Depends(get_current_user),
    service: TenantDocumentSettingsService = Depends(get_settings_service),
) -> TenantDocumentSettingsResponse:
    return service.get_settings()


@router.put(
    "/settings",
    response_model=TenantDocumentSettingsResponse,
    summary="Update tenant document settings",
)
def update_document_settings(
    payload: TenantDocumentSettingsUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: TenantDocumentSettingsService = Depends(get_settings_service),
) -> TenantDocumentSettingsResponse:
    return service.update_settings(payload)


@router.get("", response_model=DocumentListResponse, summary="List documents")
def list_documents(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    document_type: DocumentType | None = None,
    status_filter: DocumentStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
    _: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> DocumentListResponse:
    return service.list_documents(
        skip=skip,
        limit=limit,
        document_type=document_type,
        doc_status=status_filter,
        search=search,
    )


@router.get("/{document_id}", response_model=DocumentDetailResponse, summary="Get document")
def get_document(
    document_id: uuid.UUID,
    _: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> DocumentDetailResponse:
    return service.get_document(document_id)


@router.get(
    "/{document_id}/timeline",
    response_model=DocumentTimelineResponse,
    summary="Document audit timeline",
)
def document_timeline(
    document_id: uuid.UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    _: User = Depends(get_current_user),
    service: DocumentTimelineService = Depends(get_timeline_service),
) -> DocumentTimelineResponse:
    return service.get_timeline(document_id, skip=skip, limit=limit)


@router.post(
    "",
    response_model=DocumentDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create controlled document",
)
def create_document(
    request: Request,
    payload: DocumentCreateRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: DocumentService = Depends(get_document_service),
) -> DocumentDetailResponse:
    ip, ua = _ctx(request)
    return service.create_document(payload, actor=actor, ip_address=ip, user_agent=ua)


@router.patch("/{document_id}", response_model=DocumentDetailResponse, summary="Update document")
def update_document(
    request: Request,
    document_id: uuid.UUID,
    payload: DocumentUpdateRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: DocumentService = Depends(get_document_service),
) -> DocumentDetailResponse:
    ip, ua = _ctx(request)
    return service.update_document(
        document_id, payload, actor=actor, ip_address=ip, user_agent=ua
    )


@router.post(
    "/{document_id}/versions",
    response_model=DocumentDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add new document version",
)
def add_version(
    request: Request,
    document_id: uuid.UUID,
    payload: DocumentVersionCreateRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: DocumentService = Depends(get_document_service),
) -> DocumentDetailResponse:
    ip, ua = _ctx(request)
    return service.add_version(
        document_id, payload, actor=actor, ip_address=ip, user_agent=ua
    )


@router.post(
    "/{document_id}/versions/{version_id}/upload",
    response_model=FileUploadResponse,
    summary="Upload file for document version",
)
async def upload_version_file(
    request: Request,
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    file: UploadFile = File(...),
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.LIDER_PROCESO,
        )
    ),
    file_service: DocumentFileService = Depends(get_file_service),
) -> FileUploadResponse:
    ip, ua = _ctx(request)
    version = await file_service.upload_version_file(
        document_id=document_id,
        version_id=version_id,
        file=file,
        actor=actor,
        ip_address=ip,
        user_agent=ua,
    )
    return FileUploadResponse(version=DocumentVersionResponse.model_validate(version))


@router.get(
    "/{document_id}/versions/{version_id}/download-url",
    response_model=DownloadUrlResponse,
    summary="Get signed download URL",
)
def get_download_url(
    request: Request,
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    doc_service: DocumentService = Depends(get_document_service),
    file_service: DocumentFileService = Depends(get_file_service),
    settings: Settings = Depends(get_settings),
) -> DownloadUrlResponse:
    ip, ua = _ctx(request)
    document = doc_service.get_document_entity(document_id)
    version = next((v for v in document.versions if v.id == version_id), None)
    if version is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Version not found.")
    url = file_service.get_download_url(
        document=document,
        version=version,
        actor=actor,
        ip_address=ip,
        user_agent=ua,
    )
    return DownloadUrlResponse(
        url=url,
        file_name=version.file_name,
        expires_in=settings.storage_signed_url_expire_seconds,
    )


@router.get(
    "/{document_id}/versions/{version_id}/download",
    summary="Stream file (local storage)",
)
def download_version_file(
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    doc_service: DocumentService = Depends(get_document_service),
    file_service: DocumentFileService = Depends(get_file_service),
) -> Response:
    document = doc_service.get_document_entity(document_id)
    version = next((v for v in document.versions if v.id == version_id), None)
    if version is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Version not found.")
    data, mime, name = file_service.read_file_bytes(version=version)
    _ = actor  # access validated via get_document_entity + auth dependency
    return Response(
        content=data,
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


@router.post(
    "/{document_id}/status",
    response_model=DocumentDetailResponse,
    summary="Change document workflow status",
)
def change_status(
    request: Request,
    document_id: uuid.UUID,
    payload: DocumentStatusChangeRequest,
    actor: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
) -> DocumentDetailResponse:
    ip, ua = _ctx(request)
    return service.change_status(
        document_id, payload, actor=actor, ip_address=ip, user_agent=ua
    )


@router.delete("/{document_id}", response_model=APIMessage, summary="Soft-delete document")
def delete_document(
    request: Request,
    document_id: uuid.UUID,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)
    ),
    service: DocumentService = Depends(get_document_service),
) -> APIMessage:
    ip, ua = _ctx(request)
    service.deactivate_document(document_id, actor=actor, ip_address=ip, user_agent=ua)
    return APIMessage(message="Document deleted.")
