"""SQLAlchemy declarative base — import all models here for Alembic autogenerate."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Root declarative base for all ORM models."""

    pass


# Import models so Alembic autogenerate detects metadata.
from app.infrastructure.models import (  # noqa: F401, E402
    Audit,
    AuditActionPlan,
    AuditActivityLog,
    AuditChecklist,
    AuditEvidence,
    AuditFinding,
    AuditFindingSuggestion,
    AuditFindingSuggestionHistory,
    AuditPlan,
    AuditResponse,
    ChecklistQuestion,
    ChecklistSection,
    ChecklistTemplate,
    ChecklistTemplateVersion,
    Document,
    DocumentAuditLog,
    DocumentVersion,
    RefreshToken,
    Tenant,
    TenantFindingGenerationSettings,
    TenantDocumentSettings,
    User,
)
