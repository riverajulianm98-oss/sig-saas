"""Audit module HTTP routes."""

import uuid

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile, status

from app.api.deps import get_current_user
from app.api.rbac import require_roles
from app.domain.auth.enums import UserRole
from app.infrastructure.models.user import User
from app.modules.audits.deps import get_audit_service
from app.modules.audits.schemas import (
    ActionPlanCreate,
    ActionPlanResponse,
    ActionPlanUpdate,
    AuditCreate,
    AuditDashboardResponse,
    AuditDetailResponse,
    AuditListResponse,
    AuditPlanCreate,
    AuditPlanResponse,
    AuditPlanUpdate,
    AuditResponse,
    AuditStatusChange,
    AuditTimelineResponse,
    AuditUpdate,
    ChecklistCreate,
    ChecklistItemResponse,
    EvidenceDocumentRef,
    EvidenceExternalUrl,
    EvidenceResponse,
    FindingCreate,
    FindingResponse,
    FindingUpdate,
    ResponseUpsert,
)
from app.modules.audits.services import AuditModuleService
from app.schemas.common import APIMessage
from app.utils.request import get_client_ip

router = APIRouter(prefix="/audits", tags=["audits"])


def _ip(request: Request) -> str | None:
    return get_client_ip(request)


@router.get("/dashboard", response_model=AuditDashboardResponse)
def dashboard(
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditDashboardResponse:
    return service.get_dashboard()


@router.get("/plans", response_model=list[AuditPlanResponse])
def list_plans(
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> list[AuditPlanResponse]:
    return service.list_plans()


@router.post(
    "/plans",
    response_model=AuditPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_plan(
    request: Request,
    payload: AuditPlanCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditPlanResponse:
    return service.create_plan(payload, actor=actor, ip=_ip(request))


@router.patch("/plans/{plan_id}", response_model=AuditPlanResponse)
def update_plan(
    plan_id: uuid.UUID,
    payload: AuditPlanUpdate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditPlanResponse:
    return service.update_plan(plan_id, payload, actor=actor)


@router.get("", response_model=AuditListResponse)
def list_audits(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    audit_type: str | None = Query(None, alias="type"),
    process_area: str | None = None,
    search: str | None = None,
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditListResponse:
    return service.list_audits(
        skip=skip,
        limit=limit,
        status=status_filter,
        audit_type=audit_type,
        process_area=process_area,
        search=search,
    )


@router.post("", response_model=AuditDetailResponse, status_code=status.HTTP_201_CREATED)
def create_audit(
    request: Request,
    payload: AuditCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditDetailResponse:
    return service.create_audit(payload, actor=actor, ip=_ip(request))


@router.get("/{audit_id}", response_model=AuditDetailResponse)
def get_audit(
    audit_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditDetailResponse:
    return service.get_audit(audit_id, actor=actor)


@router.patch("/{audit_id}", response_model=AuditDetailResponse)
def update_audit(
    request: Request,
    audit_id: uuid.UUID,
    payload: AuditUpdate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditDetailResponse:
    return service.update_audit(audit_id, payload, actor=actor, ip=_ip(request))


@router.post("/{audit_id}/status", response_model=AuditDetailResponse)
def change_status(
    request: Request,
    audit_id: uuid.UUID,
    payload: AuditStatusChange,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditDetailResponse:
    return service.change_audit_status(audit_id, payload, actor=actor, ip=_ip(request))


@router.delete("/{audit_id}", response_model=APIMessage)
def delete_audit(
    request: Request,
    audit_id: uuid.UUID,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: AuditModuleService = Depends(get_audit_service),
) -> APIMessage:
    service.delete_audit(audit_id, actor=actor, ip=_ip(request))
    return APIMessage(message="Audit deleted.")


@router.get("/{audit_id}/timeline", response_model=AuditTimelineResponse)
def timeline(
    audit_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> AuditTimelineResponse:
    return service.get_timeline(audit_id, skip=skip, limit=limit)


@router.get("/{audit_id}/checklists", response_model=list[ChecklistItemResponse])
def list_checklist(
    audit_id: uuid.UUID,
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> list[ChecklistItemResponse]:
    return service.list_checklist(audit_id)


@router.post(
    "/{audit_id}/checklists",
    response_model=ChecklistItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_checklist(
    request: Request,
    audit_id: uuid.UUID,
    payload: ChecklistCreate,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> ChecklistItemResponse:
    return service.add_checklist_item(audit_id, payload, actor=actor, ip=_ip(request))


@router.put("/{audit_id}/checklists/{checklist_id}/response", response_model=ChecklistItemResponse)
def record_response(
    request: Request,
    audit_id: uuid.UUID,
    checklist_id: uuid.UUID,
    payload: ResponseUpsert,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> ChecklistItemResponse:
    return service.upsert_response(
        audit_id, checklist_id, payload, actor=actor, ip=_ip(request)
    )


@router.get("/{audit_id}/findings", response_model=list[FindingResponse])
def list_findings(
    audit_id: uuid.UUID,
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> list[FindingResponse]:
    return service.list_findings(audit_id)


@router.post(
    "/{audit_id}/findings",
    response_model=FindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_finding(
    request: Request,
    audit_id: uuid.UUID,
    payload: FindingCreate,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> FindingResponse:
    return service.create_finding(audit_id, payload, actor=actor, ip=_ip(request))


@router.patch("/{audit_id}/findings/{finding_id}", response_model=FindingResponse)
def update_finding(
    request: Request,
    audit_id: uuid.UUID,
    finding_id: uuid.UUID,
    payload: FindingUpdate,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> FindingResponse:
    return service.update_finding(
        audit_id, finding_id, payload, actor=actor, ip=_ip(request)
    )


@router.post(
    "/{audit_id}/findings/{finding_id}/action-plans",
    response_model=ActionPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_action_plan(
    request: Request,
    audit_id: uuid.UUID,
    finding_id: uuid.UUID,
    payload: ActionPlanCreate,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> ActionPlanResponse:
    return service.create_action_plan(
        audit_id, finding_id, payload, actor=actor, ip=_ip(request)
    )


@router.patch(
    "/{audit_id}/findings/{finding_id}/action-plans/{plan_id}",
    response_model=ActionPlanResponse,
)
def update_action_plan(
    audit_id: uuid.UUID,
    finding_id: uuid.UUID,
    plan_id: uuid.UUID,
    payload: ActionPlanUpdate,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> ActionPlanResponse:
    return service.update_action_plan(audit_id, finding_id, plan_id, payload, actor=actor)


@router.get("/{audit_id}/evidences", response_model=list[EvidenceResponse])
def list_evidences(
    audit_id: uuid.UUID,
    _: User = Depends(get_current_user),
    service: AuditModuleService = Depends(get_audit_service),
) -> list[EvidenceResponse]:
    return service.list_evidences(audit_id)


@router.post(
    "/{audit_id}/evidences/document",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def link_document_evidence(
    request: Request,
    audit_id: uuid.UUID,
    payload: EvidenceDocumentRef,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> EvidenceResponse:
    return service.add_document_evidence(audit_id, payload, actor=actor, ip=_ip(request))


@router.post(
    "/{audit_id}/evidences/url",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_url_evidence(
    request: Request,
    audit_id: uuid.UUID,
    payload: EvidenceExternalUrl,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> EvidenceResponse:
    return service.add_external_evidence(audit_id, payload, actor=actor, ip=_ip(request))


@router.post(
    "/{audit_id}/evidences/upload",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_evidence(
    request: Request,
    audit_id: uuid.UUID,
    file: UploadFile = File(...),
    finding_id: uuid.UUID | None = None,
    actor: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG, UserRole.AUDITOR)
    ),
    service: AuditModuleService = Depends(get_audit_service),
) -> EvidenceResponse:
    return await service.upload_evidence(
        audit_id,
        file,
        actor=actor,
        finding_id=finding_id,
        ip=_ip(request),
    )
