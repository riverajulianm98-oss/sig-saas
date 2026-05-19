"""URL-safe slug helpers."""

import re
import unicodedata
import uuid


def slugify(value: str, *, max_length: int = 80) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug[:max_length] or "empresa"


def unique_slug(base: str, existing: set[str]) -> str:
    candidate = slugify(base)
    if candidate not in existing:
        return candidate
    suffix = uuid.uuid4().hex[:6]
    return f"{candidate}-{suffix}"
