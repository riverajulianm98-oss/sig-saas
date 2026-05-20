"""Document audit action types."""

from enum import StrEnum


class DocumentAuditAction(StrEnum):
    CREATED = "created"
    UPDATED = "updated"
    STATUS_CHANGED = "status_changed"
    APPROVED = "approved"
    REJECTED = "rejected"
    VERSION_CREATED = "version_created"
    FILE_UPLOADED = "file_uploaded"
    FILE_DOWNLOADED = "file_downloaded"
    DELETED = "deleted"
