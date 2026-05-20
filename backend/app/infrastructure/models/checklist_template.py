"""ISO checklist template (global or tenant-owned)."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel

if TYPE_CHECKING:
    from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion


class ChecklistTemplate(BaseModel):
    __tablename__ = "checklist_templates"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_checklist_templates_tenant_code"),
    )

    tenant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    iso_standard: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    source_template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    current_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "checklist_template_versions.id",
            ondelete="SET NULL",
            use_alter=True,
            name="fk_checklist_templates_current_version",
        ),
        nullable=True,
    )

    versions: Mapped[list["ChecklistTemplateVersion"]] = relationship(
        "ChecklistTemplateVersion",
        back_populates="template",
        foreign_keys="ChecklistTemplateVersion.template_id",
        cascade="all, delete-orphan",
    )
    source_template: Mapped["ChecklistTemplate | None"] = relationship(
        "ChecklistTemplate",
        remote_side="ChecklistTemplate.id",
        foreign_keys=[source_template_id],
    )
