"""Auditor response to a checklist item."""

import uuid
from datetime import datetime

from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit_checklist import AuditChecklist


class AuditResponse(Base, TimestampMixin):
    __tablename__ = "audit_responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    checklist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_checklists.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    compliance_status: Mapped[str] = mapped_column(
        String(50),
        default="pendiente",
        nullable=False,
    )
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    text_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    numeric_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    observations: Mapped[str | None] = mapped_column(Text, nullable=True)
    responded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    checklist: Mapped["AuditChecklist"] = relationship(
        "AuditChecklist",
        back_populates="response",
    )
