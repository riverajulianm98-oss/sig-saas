"""Upload validation helpers."""

from fastapi import HTTPException, status

from app.core.config import Settings
from app.domain.documents.files import DEFAULT_ALLOWED_MIME_TYPES


def validate_upload(
    *,
    filename: str,
    mime_type: str,
    size: int,
    settings: Settings,
) -> None:
    if size <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty files are not allowed.",
        )
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.max_upload_size_mb} MB.",
        )

    allowed = settings.allowed_upload_mime_types or DEFAULT_ALLOWED_MIME_TYPES
    normalized = mime_type.split(";")[0].strip().lower()
    if normalized not in allowed:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"MIME type '{normalized}' is not allowed.",
        )
