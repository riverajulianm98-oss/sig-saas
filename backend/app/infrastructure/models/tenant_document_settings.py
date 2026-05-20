"""Per-tenant document control settings."""

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.models.base import BaseModel


class TenantDocumentSettings(BaseModel):
    __tablename__ = "tenant_document_settings"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    expiration_warning_days: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
    )
    expiration_critical_days: Mapped[int] = mapped_column(
        Integer,
        default=7,
        nullable=False,
    )
    email_alerts_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    websocket_alerts_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
