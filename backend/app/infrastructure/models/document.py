"""Controlled document (ISO document master record)."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.document_version import DocumentVersion


class Document(BaseModel, TenantScopedMixin):
    __tablename__ = "documents"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_documents_tenant_code"),
    )

    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("document_versions.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    tags: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    versions: Mapped[list["DocumentVersion"]] = relationship(
        "DocumentVersion",
        back_populates="document",
        foreign_keys="DocumentVersion.document_id",
        cascade="all, delete-orphan",
    )
    current_version: Mapped["DocumentVersion | None"] = relationship(
        "DocumentVersion",
        foreign_keys=[current_version_id],
        post_update=True,
    )

    def __repr__(self) -> str:
        return f"<Document code={self.code!r} status={self.status}>"
