"""Chapter / clause grouping within a template version."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.models.checklist_question import ChecklistQuestion
    from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion


class ChecklistSection(Base, TimestampMixin):
    __tablename__ = "checklist_sections"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    version_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_template_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chapter_code: Mapped[str] = mapped_column(String(20), nullable=False)
    clause_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    version: Mapped["ChecklistTemplateVersion"] = relationship(
        "ChecklistTemplateVersion",
        back_populates="sections",
    )
    questions: Mapped[list["ChecklistQuestion"]] = relationship(
        "ChecklistQuestion",
        back_populates="section",
        cascade="all, delete-orphan",
        order_by="ChecklistQuestion.sort_order",
    )
