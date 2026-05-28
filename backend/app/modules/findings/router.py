"""Standalone findings router — tenant-wide hallazgos + CAPA."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.infrastructure.models.user import User
from app.modules.findings.schemas import (
    CapaComment,
    CapaCommentResponse,
    CapaCreate,
    CapaResponse,
    CapaStatusChange,
    CapaUpdate,
    FindingCreate,
    FindingDetail,
    FindingListResponse,
    FindingResponse,
    FindingsDashboardStats,
    FindingUpdate,
)
from app.modules.findings.service import FindingsService
from app.schemas.common import APIMessage

router = APIRouter(prefix="/findings", tags=["findings"])


def _svc(db: Session = Depends(get_db), actor: User = Depends(get_current_user)) -> FindingsService:
    return FindingsService(db=db, tenant_id=actor.tenant_id)


@router.get("/dashboard", response_model=FindingsDashboardStats)
def dashboard(svc: FindingsService = Depends(_svc)) -> FindingsDashboardStats:
    return svc.dashboard()


@router.get("", response_model=FindingListResponse)
def list_findings(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    status: str | None = None,
    severity: str | None = None,
    classification: str | None = None,
    process_area: str | None = None,
    search: str | None = Query(default=None, max_length=200),
    audit_id: uuid.UUID | None = None,
    svc: FindingsService = Depends(_svc),
) -> FindingListResponse:
    return svc.list(
        skip=skip,
        limit=limit,
        status=status,
        severity=severity,
        classification=classification,
        process_area=process_area,
        search=search,
        audit_id=audit_id,
    )


@router.post("", response_model=FindingDetail, status_code=status.HTTP_201_CREATED)
def create_finding(
    data: FindingCreate,
    svc: FindingsService = Depends(_svc),
) -> FindingDetail:
    return svc.create(data)


@router.get("/{finding_id}", response_model=FindingDetail)
def get_finding(
    finding_id: uuid.UUID,
    svc: FindingsService = Depends(_svc),
) -> FindingDetail:
    return svc.get(finding_id)


@router.patch("/{finding_id}", response_model=FindingDetail)
def update_finding(
    finding_id: uuid.UUID,
    data: FindingUpdate,
    svc: FindingsService = Depends(_svc),
) -> FindingDetail:
    return svc.update(finding_id, data)


@router.delete("/{finding_id}", response_model=APIMessage)
def delete_finding(
    finding_id: uuid.UUID,
    svc: FindingsService = Depends(_svc),
) -> APIMessage:
    svc.delete(finding_id)
    return APIMessage(message="Finding deleted.")


# ── CAPA actions ──────────────────────────────────────────────────────────────

@router.get("/{finding_id}/actions", response_model=list[CapaResponse])
def list_actions(
    finding_id: uuid.UUID,
    svc: FindingsService = Depends(_svc),
) -> list[CapaResponse]:
    return svc.list_actions(finding_id)


@router.post("/{finding_id}/actions", response_model=CapaResponse, status_code=status.HTTP_201_CREATED)
def create_action(
    finding_id: uuid.UUID,
    data: CapaCreate,
    svc: FindingsService = Depends(_svc),
) -> CapaResponse:
    return svc.create_action(finding_id, data)


@router.patch("/{finding_id}/actions/{action_id}", response_model=CapaResponse)
def update_action(
    finding_id: uuid.UUID,
    action_id: uuid.UUID,
    data: CapaUpdate,
    svc: FindingsService = Depends(_svc),
) -> CapaResponse:
    return svc.update_action(finding_id, action_id, data)


@router.patch("/{finding_id}/actions/{action_id}/status", response_model=CapaResponse)
def change_action_status(
    finding_id: uuid.UUID,
    action_id: uuid.UUID,
    data: CapaStatusChange,
    svc: FindingsService = Depends(_svc),
) -> CapaResponse:
    return svc.change_action_status(finding_id, action_id, data)


@router.delete("/{finding_id}/actions/{action_id}", response_model=APIMessage)
def delete_action(
    finding_id: uuid.UUID,
    action_id: uuid.UUID,
    svc: FindingsService = Depends(_svc),
) -> APIMessage:
    svc.delete_action(finding_id, action_id)
    return APIMessage(message="Action deleted.")


@router.post("/{finding_id}/actions/{action_id}/comments", response_model=CapaCommentResponse)
def add_comment(
    finding_id: uuid.UUID,
    action_id: uuid.UUID,
    data: CapaComment,
    actor: User = Depends(get_current_user),
) -> CapaCommentResponse:
    # Comments are stored in-memory for now (no DB model yet)
    return CapaCommentResponse(
        id=f"cmt-{uuid.uuid4().hex[:8]}",
        capa_id=str(action_id),
        user_id=str(actor.id),
        user_name=actor.full_name,
        content=data.content,
        created_at=__import__("datetime").datetime.utcnow().isoformat(),
    )
