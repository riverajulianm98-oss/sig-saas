"""Document module dependencies."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.infrastructure.storage import get_storage_provider
from app.modules.documents.alert_service import DocumentAlertService
from app.modules.documents.file_service import DocumentFileService
from app.modules.documents.service import DocumentService
from app.modules.documents.settings_service import TenantDocumentSettingsService
from app.modules.documents.timeline_service import DocumentTimelineService


def get_document_service(db: Session = Depends(get_db)) -> DocumentService:
    return DocumentService(db)


def get_file_service(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> DocumentFileService:
    return DocumentFileService(db, get_storage_provider(settings), settings)


def get_timeline_service(db: Session = Depends(get_db)) -> DocumentTimelineService:
    return DocumentTimelineService(db)


def get_alert_service(db: Session = Depends(get_db)) -> DocumentAlertService:
    return DocumentAlertService(db)


def get_settings_service(db: Session = Depends(get_db)) -> TenantDocumentSettingsService:
    return TenantDocumentSettingsService(db)
