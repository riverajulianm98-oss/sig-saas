"""
ORM models live in app.infrastructure.models (Clean Architecture).

This package is kept for backward compatibility during migration.
"""

from app.infrastructure.models import (
    AuditMixin,
    BaseModel,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
)

__all__ = [
    "AuditMixin",
    "BaseModel",
    "SoftDeleteMixin",
    "TenantScopedMixin",
    "TimestampMixin",
]
