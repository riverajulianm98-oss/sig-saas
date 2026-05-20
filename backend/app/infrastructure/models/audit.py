"""Audit execution (ISO audit event)."""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin

if TYPE_CHECKING:
    from app.infrastructure.models.audit_checklist import AuditChecklist
    from app.infrastructure.models.audit_evidence import AuditEvidence
    from app.infrastructure.models.audit_finding import AuditFinding
    from app.infrastructure.models.audit_finding_suggestion import AuditFindingSuggestion
    from app.infrastructure.models.audit_plan import AuditPlan


class Audit(BaseModel, TenantScopedMixin):
    __tablename__ = "audits"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_audits_tenant_code"),
    )

    audit_plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audit_plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    audit_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    iso_standards: Mapped[list | None] = mapped_column(JSON, nullable=True)
    process_area: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    scope: Mapped[str | None] = mapped_column(Text, nullable=True)
    objectives: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    planned_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    planned_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    lead_auditor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    team_member_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    compliance_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    checklist_template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    checklist_template_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("checklist_template_versions.id", ondelete="SET NULL"),
        nullable=True,
    )

    plan: Mapped["AuditPlan | None"] = relationship("AuditPlan")
    findings: Mapped[list["AuditFinding"]] = relationship(
        "AuditFinding",
        back_populates="audit",
        cascade="all, delete-orphan",
    )
    checklists: Mapped[list["AuditChecklist"]] = relationship(
        "AuditChecklist",
        back_populates="audit",
        cascade="all, delete-orphan",
    )
    evidences: Mapped[list["AuditEvidence"]] = relationship(
        "AuditEvidence",
        back_populates="audit",
        cascade="all, delete-orphan",
    )
    finding_suggestions: Mapped[list["AuditFindingSuggestion"]] = relationship(
        "AuditFindingSuggestion",
        back_populates="audit",
        cascade="all, delete-orphan",
    )
