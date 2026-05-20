"""Finding intelligence API schemas."""

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.audits.enums import (
    FindingClassification,
    FindingSeverity,
    GenerationSensitivity,
    SuggestionStatus,
)


class FindingSettingsUpdate(BaseModel):
    sensitivity: GenerationSensitivity | None = None
    min_clause_score: int | None = Field(default=None, ge=0, le=100)
    min_process_score: int | None = Field(default=None, ge=0, le=100)
    min_global_score: int | None = Field(default=None, ge=0, le=100)
    min_criticality: str | None = None
    weight_escalation_threshold: int | None = Field(default=None, ge=1, le=100)
    reincidence_lookback_days: int | None = Field(default=None, ge=30, le=1825)
    reincidence_severity_boost: bool | None = None
    auto_generate_enabled: bool | None = None
    require_manual_validation: bool | None = None


class FindingSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tenant_id: uuid.UUID
    sensitivity: GenerationSensitivity
    min_clause_score: int | None
    min_process_score: int | None
    min_global_score: int | None
    min_criticality: str
    weight_escalation_threshold: int | None
    reincidence_lookback_days: int
    reincidence_severity_boost: bool
    auto_generate_enabled: bool
    require_manual_validation: bool


class SuggestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audit_id: uuid.UUID
    checklist_item_id: uuid.UUID
    template_question_id: uuid.UUID | None
    status: SuggestionStatus
    classification: FindingClassification
    severity: FindingSeverity
    title: str
    description: str
    requirement_reference: str | None
    process_area: str | None
    potential_impact: str | None
    initial_recommendation: str | None
    confidence_score: float
    evidence_ids: list[str] | None
    generation_context: dict[str, Any] | None
    ai_metadata: dict[str, Any] | None
    converted_finding_id: uuid.UUID | None
    reviewed_by_id: uuid.UUID | None
    reviewed_at: datetime | None
    discard_reason: str | None
    created_at: datetime


class GenerateSuggestionsRequest(BaseModel):
    replace_existing: bool = False
    auto_submit_validation: bool = False


class GenerateSuggestionsResponse(BaseModel):
    created: int
    skipped: int
    items: list[SuggestionResponse]


class DiscardSuggestionRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=2000)


class ApproveSuggestionRequest(BaseModel):
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class ConvertActionRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=500)
    description: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class SuggestionHistoryEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    from_status: str | None
    to_status: str | None
    user_id: uuid.UUID | None
    reason: str | None
    changes: dict[str, Any] | None
    created_at: datetime


class FindingIntelligenceDashboard(BaseModel):
    total_suggestions: int
    by_status: dict[str, int]
    auto_generated: int
    reincidence_count: int
    critical_clauses: dict[str, int]
    top_non_compliant_processes: dict[str, int]
    trend_by_classification: dict[str, int]
