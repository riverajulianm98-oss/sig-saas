"""Standalone findings module schemas — tenant-wide view of audit findings + CAPA."""

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


FindingClassification = Literal[
    "no_conformidad", "observacion", "oportunidad_mejora", "fortaleza"
]
FindingSeverity = Literal["baja", "media", "alta", "critica"]
FindingStatus = Literal["abierto", "en_seguimiento", "cerrado"]
CapaStatus = Literal["pendiente", "en_progreso", "completada", "vencida", "cancelada"]


class CapaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    finding_id: uuid.UUID
    title: str
    description: str | None
    status: str
    responsible_user_id: uuid.UUID | None
    due_date: date | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CapaCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=500)
    description: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class CapaUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    status: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None


class CapaStatusChange(BaseModel):
    status: str
    comment: str | None = None


class CapaComment(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CapaCommentResponse(BaseModel):
    id: str
    capa_id: str
    user_id: str
    user_name: str
    content: str
    created_at: str


class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    audit_id: uuid.UUID
    audit_code: str | None = None
    audit_title: str | None = None
    code: str | None
    title: str
    description: str
    classification: str
    severity: str
    status: str
    source: str
    requirement_reference: str | None
    process_area: str | None
    responsible_user_id: uuid.UUID | None
    responsible_name: str | None = None
    due_date: date | None
    root_cause: str | None
    root_cause_category: str | None = None
    actions_count: int = 0
    open_actions_count: int = 0
    is_recurrent: bool = False
    created_at: datetime
    updated_at: datetime


class FindingDetail(FindingResponse):
    actions: list[CapaResponse] = []


class FindingCreate(BaseModel):
    audit_id: uuid.UUID
    title: str = Field(..., min_length=2, max_length=500)
    description: str = Field(..., min_length=2)
    classification: str = "observacion"
    severity: str = "media"
    requirement_reference: str | None = None
    process_area: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None
    root_cause: str | None = None
    source: str = "manual"
    code: str | None = None


class FindingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=500)
    description: str | None = None
    classification: str | None = None
    severity: str | None = None
    status: str | None = None
    requirement_reference: str | None = None
    process_area: str | None = None
    responsible_user_id: uuid.UUID | None = None
    due_date: date | None = None
    root_cause: str | None = None
    root_cause_category: str | None = None


class FindingListResponse(BaseModel):
    items: list[FindingResponse]
    total: int
    skip: int
    limit: int


class FindingsDashboardStats(BaseModel):
    total: int
    open: int
    in_progress: int
    closed: int
    by_severity: dict[str, int]
    by_classification: dict[str, int]
    overdue: int
    open_capa: int
    overdue_capa: int
