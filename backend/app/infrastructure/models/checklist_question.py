"""Auditable question within a checklist template section."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.models.checklist_section import ChecklistSection


class ChecklistQuestion(Base, TimestampMixin):
    __tablename__ = "checklist_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_sections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    clause_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    compliance_criteria: Mapped[str] = mapped_column(Text, nullable=False)
    guidance_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    weight: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    criticality: Mapped[str] = mapped_column(String(50), default="media", nullable=False)
    response_type: Mapped[str] = mapped_column(String(50), default="cumple", nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    section: Mapped["ChecklistSection"] = relationship(
        "ChecklistSection",
        back_populates="questions",
    )
