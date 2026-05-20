"""Safe storage key construction (anti path-traversal)."""

import re
import uuid
from pathlib import PurePosixPath

_UNSAFE_CHARS = re.compile(r"[^a-zA-Z0-9._-]+")


def sanitize_filename(filename: str) -> str:
    """Keep basename only and strip dangerous characters."""
    name = PurePosixPath(filename.replace("\\", "/")).name
    if not name or name in {".", ".."}:
        raise ValueError("Invalid file name.")
    safe = _UNSAFE_CHARS.sub("_", name).strip("._")
    if not safe:
        raise ValueError("Invalid file name.")
    return safe[:255]


def build_version_storage_key(
    *,
    tenant_id: uuid.UUID,
    document_id: uuid.UUID,
    version_id: uuid.UUID,
    filename: str,
) -> str:
    safe_name = sanitize_filename(filename)
    return (
        f"tenants/{tenant_id}/documents/{document_id}/"
        f"versions/{version_id}/{safe_name}"
    )
