"""Per-tenant configuration for intelligent finding generation."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin


class TenantFindingGenerationSettings(BaseModel, TenantScopedMixin):
    __tablename__ = "tenant_finding_generation_settings"
    __table_args__ = (UniqueConstraint("tenant_id", name="uq_tenant_finding_settings"),)

    sensitivity: Mapped[str] = mapped_column(String(50), default="media", nullable=False)
    min_clause_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    min_process_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    min_global_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    min_criticality: Mapped[str] = mapped_column(String(50), default="media", nullable=False)
    weight_escalation_threshold: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reincidence_lookback_days: Mapped[int] = mapped_column(Integer, default=365, nullable=False)
    reincidence_severity_boost: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    auto_generate_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    require_manual_validation: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
