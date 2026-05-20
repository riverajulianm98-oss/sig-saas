"""ISO checklist requirement / question per audit."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit import Audit
    from app.infrastructure.models.audit_response import AuditResponse


class AuditChecklist(Base, TimestampMixin):
    __tablename__ = "audit_checklists"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    audit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    iso_standard: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    clause_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    requirement_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    weight: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    template_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_template_versions.id", ondelete="SET NULL"),
        nullable=True,
    )
    template_question_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_questions.id", ondelete="SET NULL"),
        nullable=True,
    )
    chapter_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    section_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True)
    criticality: Mapped[str | None] = mapped_column(String(50), nullable=True)
    response_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    compliance_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)

    audit: Mapped["Audit"] = relationship("Audit", back_populates="checklists")
    response: Mapped["AuditResponse | None"] = relationship(
        "AuditResponse",
        back_populates="checklist",
        uselist=False,
        cascade="all, delete-orphan",
    )
