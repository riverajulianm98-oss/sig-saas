"""Abstract base ORM model for all domain entities."""

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.infrastructure.models.mixins import (
    AuditMixin,
    SoftDeleteMixin,
    TimestampMixin,
)


class BaseModel(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    Enterprise base entity.

    Includes: UUID PK, timestamps, soft delete, audit fields.
    Use TenantScopedMixin on tenant-owned tables.
    """

    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"
