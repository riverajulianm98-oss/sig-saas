"""Audit evidence — documents, files, external references."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit import Audit
    from app.infrastructure.models.audit_finding import AuditFinding


class AuditEvidence(BaseModel, TenantScopedMixin):
    __tablename__ = "audit_evidences"

    audit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    finding_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_findings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    checklist_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_checklists.id", ondelete="SET NULL"),
        nullable=True,
    )
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    document_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("document_versions.id", ondelete="SET NULL"),
        nullable=True,
    )
    external_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_hash_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)

    audit: Mapped["Audit"] = relationship("Audit", back_populates="evidences")
    finding: Mapped["AuditFinding | None"] = relationship("AuditFinding")
