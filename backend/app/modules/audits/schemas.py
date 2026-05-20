"""Audit module API schemas."""

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.domain.audits.enums import (
    ActionPlanStatus,
    AuditStatus,
    AuditType,
    ChecklistCompliance,
    EvidenceType,
    FindingClassification,
    FindingSeverity,
    FindingStatus,
    IsoStandard,
)


# --- Plans ---
class AuditPlanCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    title: str = Field(..., min_length=2, max_length=500)
    year: int = Field(..., ge=2000, le=2100)
    description: str | None = None
    iso_standards: list[IsoStandard] = Field(default_factory=list)


class AuditPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    status: str | None = None
    iso_standards: list[IsoStandard] | None = None


class AuditPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    code: str
    title: str
    year: int
    description: str | None
    status: str
    iso_standards: list[str] | None
    created_at: datetime


# --- Audits ---
class AuditCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    title: str = Field(..., min_length=2, max_length=500)
    audit_type: AuditType
    description: str | None = None
    audit_plan_id: uuid.UUID | None = None
    iso_standards: list[IsoStandard] = Field(default_factory=list)
    process_area: str | None = None
    scope: str | None = None
    objectives: str | None = None
    location: str | None = None
    planned_start_date: date | None = None
    planned_end_date: date | None = None
    lead_auditor_id: uuid.UUID | None = None
    team_member_ids: list[uuid.UUID] = Field(default_factory=list)


class AuditUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    process_area: str | None = None
    scope: str | None = None
    objectives: str | None = None
    location: str | None = None
    planned_start_date: date | None = None
    planned_end_date: date | None = None
    actual_start_date: date | None = None
    actual_end_date: date | None = None
    lead_auditor_id: uuid.UUID | None = None
    team_member_ids: list[uuid.UUID] | None = None
    iso_standards: list[IsoStandard] | None = None


class AuditStatusChange(BaseModel):
    status: AuditStatus
    comment: str | None = None


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    audit_plan_id: uuid.UUID | None
    code: str
    title: str
    description: str | None
    audit_type: AuditType
    status: AuditStatus
    iso_standards: list[str] | None
    process_area: str | None
    scope: str | None
    objectives: str | None
    location: str | None
    planned_start_date: date | None
    planned_end_date: date | None
    actual_start_date: date | None
    actual_end_date: date | None
    lead_auditor_id: uuid.UUID | None
    compliance_score: int | None
    created_at: datetime
    updated_at: datetime


class AuditDetailResponse(AuditResponse):
    findings_count: int = 0
    open_findings_count: int = 0
    critical_findings_count: int = 0
    checklist_items_count: int = 0


class AuditListResponse(BaseModel):
    items: list[AuditResponse]
    total: int
    skip: int
    limit: int


# --- Checklist ---
class ChecklistCreate(BaseModel):
    iso_standard: IsoStandard
    clause_code: str = Field(..., max_length=50)
    requirement_text: str
    question_text: str
    sort_order: int = 0
    weight: int = Field(default=1, ge=1, le=100)


class ChecklistUpdate(BaseModel):
    requirement_text: str | None = None
    question_text: str | None = None
    sort_order: int | None = None
    weight: int | None = Field(default=None, ge=1, le=100)


class ResponseUpsert(BaseModel):
    compliance_status: ChecklistCompliance | None = None
    score: int | None = Field(default=None, ge=0, le=100)
    text_value: str | None = None
    numeric_value: float | None = None
    observations: str | None = None


class ChecklistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audit_id: uuid.UUID
    iso_standard: str
    clause_code: str
    requirement_text: str
    question_text: str
    sort_order: int
    weight: int
    template_id: uuid.UUID | None = None
    template_version_id: uuid.UUID | None = None
    chapter_code: str | None = None
    section_title: str | None = None
    process_area: str | None = None
    criticality: str | None = None
    response_type: str | None = None
    evidence_required: bool = False
    compliance_criteria: str | None = None
    compliance_status: str | None = None
    score: int | None = None
    text_value: str | None = None
    numeric_value: float | None = None
    observations: str | None = None


# --- Findings ---
class FindingCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=500)
    description: str
    classification: FindingClassification
    severity: FindingSeverity
    requirement_reference: str | None = None
    process_area: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None
    root_cause: str | None = None


class FindingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    classification: FindingClassification | None = None
    severity: FindingSeverity | None = None
    status: FindingStatus | None = None
    requirement_reference: str | None = None
    process_area: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None
    root_cause: str | None = None


class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audit_id: uuid.UUID
    tenant_id: uuid.UUID
    code: str | None
    title: str
    description: str
    classification: FindingClassification
    severity: FindingSeverity
    status: FindingStatus
    requirement_reference: str | None
    process_area: str | None
    responsible_user_id: uuid.UUID | None
    due_date: date | None
    created_at: datetime


# --- Action plans ---
class ActionPlanCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=500)
    description: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class ActionPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    status: ActionPlanStatus | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class ActionPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    finding_id: uuid.UUID
    title: str
    description: str | None
    status: ActionPlanStatus
    responsible_user_id: uuid.UUID | None
    due_date: date | None
    completed_at: datetime | None
    created_at: datetime


# --- Evidence ---
class EvidenceDocumentRef(BaseModel):
    document_id: uuid.UUID
    document_version_id: uuid.UUID | None = None
    description: str | None = None


class EvidenceExternalUrl(BaseModel):
    external_url: str = Field(..., max_length=2048)
    description: str | None = None
    finding_id: uuid.UUID | None = None
    checklist_id: uuid.UUID | None = None


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audit_id: uuid.UUID
    finding_id: uuid.UUID | None
    checklist_id: uuid.UUID | None
    evidence_type: EvidenceType
    description: str | None
    document_id: uuid.UUID | None
    document_version_id: uuid.UUID | None
    external_url: str | None
    file_name: str | None
    file_hash_sha256: str | None
    created_at: datetime


# --- Timeline & Dashboard ---
class AuditTimelineEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    user_id: uuid.UUID | None
    entity_type: str | None
    entity_id: uuid.UUID | None
    ip_address: str | None
    changes: dict[str, Any] | None
    message: str | None
    created_at: datetime


class AuditTimelineResponse(BaseModel):
    items: list[AuditTimelineEntry]
    total: int
    skip: int
    limit: int


class AuditDashboardResponse(BaseModel):
    open_audits: int
    critical_findings: int
    open_findings: int
    compliance_score_avg: float | None
    findings_by_process: dict[str, int]
    findings_by_classification: dict[str, int]
    action_plans_by_status: dict[str, int]
    audits_by_status: dict[str, int]
