"""Audit finding (hallazgo)."""

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit import Audit
    from app.infrastructure.models.audit_action_plan import AuditActionPlan
    from app.infrastructure.models.audit_finding_suggestion import AuditFindingSuggestion


class AuditFinding(BaseModel, TenantScopedMixin):
    __tablename__ = "audit_findings"

    audit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    classification: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    requirement_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    responsible_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)
    suggestion_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "audit_finding_suggestions.id",
            ondelete="SET NULL",
            use_alter=True,
            name="fk_audit_findings_suggestion_id",
        ),
        nullable=True,
    )

    audit: Mapped["Audit"] = relationship("Audit", back_populates="findings")
    source_suggestion: Mapped["AuditFindingSuggestion | None"] = relationship(
        "AuditFindingSuggestion",
        foreign_keys=[suggestion_id],
    )
    action_plans: Mapped[list["AuditActionPlan"]] = relationship(
        "AuditActionPlan",
        back_populates="finding",
        cascade="all, delete-orphan",
    )
