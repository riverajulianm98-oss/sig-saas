"""Tenant document settings persistence."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.models.tenant_document_settings import TenantDocumentSettings


class TenantDocumentSettingsRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_or_create(self, tenant_id: uuid.UUID) -> TenantDocumentSettings:
        settings = self._session.scalar(
            select(TenantDocumentSettings).where(
                TenantDocumentSettings.tenant_id == tenant_id,
                TenantDocumentSettings.deleted_at.is_(None),
            )
        )
        if settings:
            return settings
        settings = TenantDocumentSettings(tenant_id=tenant_id)
        self._session.add(settings)
        self._session.flush()
        return settings

    def update(self, settings: TenantDocumentSettings) -> TenantDocumentSettings:
        self._session.add(settings)
        self._session.flush()
        return settings
