"""AI-ready suggested audit finding (hallazgo sugerido)."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit import Audit
    from app.infrastructure.models.audit_checklist import AuditChecklist
    from app.infrastructure.models.audit_finding import AuditFinding
    from app.infrastructure.models.audit_finding_suggestion_history import (
        AuditFindingSuggestionHistory,
    )


class AuditFindingSuggestion(BaseModel, TenantScopedMixin):
    __tablename__ = "audit_finding_suggestions"

    audit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    checklist_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_checklists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    template_question_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_questions.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    classification: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirement_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    potential_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    initial_recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    evidence_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    generation_context: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    converted_finding_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_findings.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    discard_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    audit: Mapped["Audit"] = relationship("Audit", back_populates="finding_suggestions")
    checklist_item: Mapped["AuditChecklist"] = relationship("AuditChecklist")
    converted_finding: Mapped["AuditFinding | None"] = relationship(
        "AuditFinding",
        foreign_keys=[converted_finding_id],
    )
    history: Mapped[list["AuditFindingSuggestionHistory"]] = relationship(
        "AuditFindingSuggestionHistory",
        back_populates="suggestion",
        cascade="all, delete-orphan",
    )
