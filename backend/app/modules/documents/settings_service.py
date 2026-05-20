"""Tenant document settings."""

from sqlalchemy.orm import Session

from app.domain.tenancy.context import require_current_tenant_id
from app.modules.documents.schemas import (
    TenantDocumentSettingsResponse,
    TenantDocumentSettingsUpdate,
)
from app.repositories.tenant_document_settings_repository import (
    TenantDocumentSettingsRepository,
)


class TenantDocumentSettingsService:
    def __init__(self, session: Session) -> None:
        self._repo = TenantDocumentSettingsRepository(session)
        self._session = session

    def get_settings(self) -> TenantDocumentSettingsResponse:
        tenant_id = require_current_tenant_id()
        row = self._repo.get_or_create(tenant_id)
        return TenantDocumentSettingsResponse.model_validate(row)

    def update_settings(
        self,
        payload: TenantDocumentSettingsUpdate,
    ) -> TenantDocumentSettingsResponse:
        tenant_id = require_current_tenant_id()
        row = self._repo.get_or_create(tenant_id)
        if payload.expiration_warning_days is not None:
            row.expiration_warning_days = payload.expiration_warning_days
        if payload.expiration_critical_days is not None:
            row.expiration_critical_days = payload.expiration_critical_days
        if payload.email_alerts_enabled is not None:
            row.email_alerts_enabled = payload.email_alerts_enabled
        if payload.websocket_alerts_enabled is not None:
            row.websocket_alerts_enabled = payload.websocket_alerts_enabled
        self._repo.update(row)
        self._session.commit()
        self._session.refresh(row)
        return TenantDocumentSettingsResponse.model_validate(row)
