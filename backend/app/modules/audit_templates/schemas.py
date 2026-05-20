"""Checklist template API schemas."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.audits.enums import (
    AuditType,
    IsoStandard,
    QuestionCriticality,
    QuestionResponseType,
    TemplateVersionStatus,
)


class TemplateCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=80)
    title: str = Field(..., min_length=2, max_length=500)
    iso_standard: IsoStandard
    description: str | None = None


class TemplateUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    is_active: bool | None = None


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_id: uuid.UUID
    clause_code: str
    question_text: str
    compliance_criteria: str
    guidance_text: str | None
    weight: int
    criticality: str
    response_type: str
    is_required: bool
    evidence_required: bool
    sort_order: int


class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    version_id: uuid.UUID
    chapter_code: str
    clause_code: str
    title: str
    description: str | None
    process_area: str | None
    sort_order: int
    questions: list[QuestionResponse] = Field(default_factory=list)


class VersionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    template_id: uuid.UUID
    version_number: int
    status: TemplateVersionStatus
    change_summary: str | None
    published_at: datetime | None
    question_count: int = 0


class VersionDetailResponse(VersionSummary):
    sections: list[SectionResponse] = Field(default_factory=list)


class TemplateSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID | None
    code: str
    title: str
    description: str | None
    iso_standard: str
    is_system: bool
    is_active: bool
    source_template_id: uuid.UUID | None
    current_version_id: uuid.UUID | None
    created_at: datetime


class TemplateDetailResponse(TemplateSummary):
    versions: list[VersionSummary] = Field(default_factory=list)
    current_version: VersionDetailResponse | None = None


class TemplateListResponse(BaseModel):
    items: list[TemplateSummary]
    total: int


class SectionCreate(BaseModel):
    chapter_code: str = Field(..., max_length=20)
    clause_code: str = Field(..., max_length=50)
    title: str = Field(..., min_length=2, max_length=500)
    description: str | None = None
    process_area: str | None = None
    sort_order: int = 0


class SectionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    process_area: str | None = None
    sort_order: int | None = None


class QuestionCreate(BaseModel):
    clause_code: str = Field(..., max_length=50)
    question_text: str
    compliance_criteria: str
    guidance_text: str | None = None
    weight: int = Field(default=1, ge=1, le=100)
    criticality: QuestionCriticality = QuestionCriticality.MEDIA
    response_type: QuestionResponseType = QuestionResponseType.CUMPLE
    is_required: bool = True
    evidence_required: bool = False
    sort_order: int = 0


class QuestionUpdate(BaseModel):
    clause_code: str | None = Field(default=None, max_length=50)
    question_text: str | None = None
    compliance_criteria: str | None = None
    guidance_text: str | None = None
    weight: int | None = Field(default=None, ge=1, le=100)
    criticality: QuestionCriticality | None = None
    response_type: QuestionResponseType | None = None
    is_required: bool | None = None
    evidence_required: bool | None = None
    sort_order: int | None = None


class CloneTemplateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=80)
    title: str | None = None


class NewVersionRequest(BaseModel):
    change_summary: str | None = None


class ActivateVersionRequest(BaseModel):
    version_id: uuid.UUID | None = None


class ApplyTemplateRequest(BaseModel):
    template_id: uuid.UUID
    version_id: uuid.UUID | None = None


class AuditFromTemplateCreate(BaseModel):
    template_id: uuid.UUID
    version_id: uuid.UUID | None = None
    code: str = Field(..., min_length=2, max_length=50)
    title: str = Field(..., min_length=2, max_length=500)
    audit_type: AuditType
    description: str | None = None
    audit_plan_id: uuid.UUID | None = None
    process_area: str | None = None
    scope: str | None = None
    objectives: str | None = None
    location: str | None = None
    lead_auditor_id: uuid.UUID | None = None


class ComplianceBreakdown(BaseModel):
    global_score: int | None
    by_clause: dict[str, int]
    by_process: dict[str, int]
    auto_finding_suggestions: list[dict[str, Any]]
