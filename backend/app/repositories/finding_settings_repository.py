"""Tenant finding generation settings."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.audits.enums import GenerationSensitivity
from app.domain.audits.finding_rules import build_rules
from app.domain.audits.finding_rules import FindingGenerationRules
from app.infrastructure.models.tenant_finding_settings import TenantFindingGenerationSettings


class FindingSettingsRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_or_create(self, tenant_id: uuid.UUID) -> TenantFindingGenerationSettings:
        row = self._session.scalar(
            select(TenantFindingGenerationSettings).where(
                TenantFindingGenerationSettings.tenant_id == tenant_id,
                TenantFindingGenerationSettings.deleted_at.is_(None),
            )
        )
        if row is None:
            row = TenantFindingGenerationSettings(tenant_id=tenant_id)
            self._session.add(row)
            self._session.flush()
        return row

    def resolve_rules(self, tenant_id: uuid.UUID) -> FindingGenerationRules:
        settings = self.get_or_create(tenant_id)
        sensitivity = GenerationSensitivity(settings.sensitivity)
        return build_rules(
            sensitivity=sensitivity,
            min_clause_score=settings.min_clause_score,
            min_process_score=settings.min_process_score,
            min_global_score=settings.min_global_score,
            min_criticality=settings.min_criticality,
            weight_escalation_threshold=settings.weight_escalation_threshold,
            reincidence_severity_boost=settings.reincidence_severity_boost,
            auto_generate_enabled=settings.auto_generate_enabled,
            require_manual_validation=settings.require_manual_validation,
        )
