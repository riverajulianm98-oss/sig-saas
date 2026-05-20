"""Document expiration alerts."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.domain.tenancy.context import require_current_tenant_id
from app.modules.documents.schemas import (
    DocumentAlertItem,
    DocumentAlertsResponse,
    DocumentResponse,
)
from app.repositories.document_repository import DocumentRepository
from app.repositories.tenant_document_settings_repository import (
    TenantDocumentSettingsRepository,
)


class DocumentAlertService:
    def __init__(self, session: Session) -> None:
        self._documents = DocumentRepository(session)
        self._settings = TenantDocumentSettingsRepository(session)

    def get_alerts(self) -> DocumentAlertsResponse:
        tenant_id = require_current_tenant_id()
        cfg = self._settings.get_or_create(tenant_id)
        now = datetime.now(UTC)

        expired = self._documents.list_expiring(tenant_id, before=now)
        warning_until = now + timedelta(days=cfg.expiration_warning_days)
        critical_until = now + timedelta(days=cfg.expiration_critical_days)

        expiring_soon = self._documents.list_expiring(
            tenant_id,
            before=warning_until,
            after=now,
        )
        expiring_critical = self._documents.list_expiring(
            tenant_id,
            before=critical_until,
            after=now,
        )

        return DocumentAlertsResponse(
            expired=[self._to_alert_item(d, "expired") for d in expired],
            expiring_soon=[self._to_alert_item(d, "warning") for d in expiring_soon],
            expiring_critical=[
                self._to_alert_item(d, "critical") for d in expiring_critical
            ],
            settings={
                "expiration_warning_days": cfg.expiration_warning_days,
                "expiration_critical_days": cfg.expiration_critical_days,
                "email_alerts_enabled": cfg.email_alerts_enabled,
                "websocket_alerts_enabled": cfg.websocket_alerts_enabled,
            },
        )

    def _to_alert_item(self, document, severity: str) -> DocumentAlertItem:
        return DocumentAlertItem(
            severity=severity,
            document=DocumentResponse.model_validate(document),
            expires_at=document.expires_at,
        )
