"""AI pipeline placeholders (OCR, embeddings, semantic search)."""

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class AIIndexStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    INDEXED = "indexed"
    FAILED = "failed"
    SKIPPED = "skipped"


class DocumentAIMetadata(BaseModel):
    """Stored as JSON on document_versions — extensible for future pipelines."""

    index_status: AIIndexStatus = AIIndexStatus.PENDING
    ocr_status: AIIndexStatus = AIIndexStatus.PENDING
    ocr_text_preview: str | None = None
    embedding_id: str | None = None
    semantic_collection: str | None = None
    auto_classification: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)
