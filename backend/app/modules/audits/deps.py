"""Audit module dependencies."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.infrastructure.storage import get_storage_provider
from app.modules.audits.services import AuditModuleService


def get_audit_service(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AuditModuleService:
    return AuditModuleService(db, get_storage_provider(settings), settings)
