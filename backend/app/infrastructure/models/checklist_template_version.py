"""Versioned snapshot of a checklist template."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.models.checklist_question import ChecklistQuestion
    from app.infrastructure.models.checklist_section import ChecklistSection
    from app.infrastructure.models.checklist_template import ChecklistTemplate


class ChecklistTemplateVersion(Base, TimestampMixin):
    __tablename__ = "checklist_template_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft", index=True)
    change_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    published_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    template: Mapped["ChecklistTemplate"] = relationship(
        "ChecklistTemplate",
        back_populates="versions",
        foreign_keys=[template_id],
    )
    sections: Mapped[list["ChecklistSection"]] = relationship(
        "ChecklistSection",
        back_populates="version",
        cascade="all, delete-orphan",
        order_by="ChecklistSection.sort_order",
    )
