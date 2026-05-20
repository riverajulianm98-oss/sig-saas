"""Annual / programmatic audit plan."""

from sqlalchemy import Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models.base import BaseModel
from app.infrastructure.models.mixins import TenantScopedMixin


class AuditPlan(BaseModel, TenantScopedMixin):
    __tablename__ = "audit_plans"

    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="activo", nullable=False)
    iso_standards: Mapped[list | None] = mapped_column(JSON, nullable=True)
