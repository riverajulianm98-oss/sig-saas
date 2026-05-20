"""Corrective / improvement action plan linked to a finding."""

import uuid
from datetime import date, datetime

from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit_finding import AuditFinding


class AuditActionPlan(BaseModel, TenantScopedMixin):
    __tablename__ = "audit_action_plans"

    finding_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_findings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    responsible_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    finding: Mapped["AuditFinding"] = relationship(
        "AuditFinding",
        back_populates="action_plans",
    )
