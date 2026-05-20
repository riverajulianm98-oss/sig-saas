"""Finding intelligence HTTP routes."""

import uuid

from fastapi import APIRouter, Depends, Query, Request, status

from app.api.deps import get_current_user
from app.api.rbac import require_roles
from app.domain.auth.enums import UserRole
from app.infrastructure.models.user import User
from app.modules.finding_intelligence.deps import get_finding_intelligence_service
from app.modules.finding_intelligence.schemas import (
    ApproveSuggestionRequest,
    ConvertActionRequest,
    DiscardSuggestionRequest,
    FindingIntelligenceDashboard,
    FindingSettingsResponse,
    FindingSettingsUpdate,
    GenerateSuggestionsRequest,
    GenerateSuggestionsResponse,
    SuggestionHistoryEntry,
    SuggestionResponse,
)
from app.modules.finding_intelligence.services import FindingIntelligenceService
from app.schemas.common import APIMessage
from app.utils.request import get_client_ip

router = APIRouter(tags=["finding-intelligence"])


def _ip(request: Request) -> str | None:
    return get_client_ip(request)


@router.get("/audits/settings/finding-generation", response_model=FindingSettingsResponse)
def get_finding_settings(
    actor: User = Depends(get_current_user),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> FindingSettingsResponse:
    return service.get_settings(actor=actor)


@router.patch("/audits/settings/finding-generation", response_model=FindingSettingsResponse)
def update_finding_settings(
    payload: FindingSettingsUpdate,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> FindingSettingsResponse:
    return service.update_settings(payload, actor=actor)


@router.get("/audits/finding-suggestions/dashboard", response_model=FindingIntelligenceDashboard)
def findings_dashboard(
    actor: User = Depends(get_current_user),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> FindingIntelligenceDashboard:
    return service.dashboard(actor=actor)


@router.get(
    "/audits/{audit_id}/finding-suggestions",
    response_model=list[SuggestionResponse],
)
def list_suggestions(
    audit_id: uuid.UUID,
    status_filter: str | None = Query(None, alias="status"),
    actor: User = Depends(get_current_user),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> list[SuggestionResponse]:
    return service.list_suggestions(audit_id, actor=actor, status_filter=status_filter)


@router.post(
    "/audits/{audit_id}/finding-suggestions/generate",
    response_model=GenerateSuggestionsResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_suggestions(
    request: Request,
    audit_id: uuid.UUID,
    payload: GenerateSuggestionsRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
            UserRole.LIDER_PROCESO,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> GenerateSuggestionsResponse:
    return service.generate(audit_id, payload, actor=actor, ip=_ip(request))


@router.post(
    "/audits/{audit_id}/finding-suggestions/{suggestion_id}/submit-validation",
    response_model=SuggestionResponse,
)
def submit_validation(
    audit_id: uuid.UUID,
    suggestion_id: uuid.UUID,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> SuggestionResponse:
    return service.submit_validation(audit_id, suggestion_id, actor=actor)


@router.post(
    "/audits/{audit_id}/finding-suggestions/{suggestion_id}/approve",
    response_model=SuggestionResponse,
)
def approve_suggestion(
    request: Request,
    audit_id: uuid.UUID,
    suggestion_id: uuid.UUID,
    payload: ApproveSuggestionRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> SuggestionResponse:
    return service.approve(
        audit_id, suggestion_id, payload, actor=actor, ip=_ip(request)
    )


@router.post(
    "/audits/{audit_id}/finding-suggestions/{suggestion_id}/discard",
    response_model=SuggestionResponse,
)
def discard_suggestion(
    request: Request,
    audit_id: uuid.UUID,
    suggestion_id: uuid.UUID,
    payload: DiscardSuggestionRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> SuggestionResponse:
    return service.discard(
        audit_id, suggestion_id, payload, actor=actor, ip=_ip(request)
    )


@router.post(
    "/audits/{audit_id}/finding-suggestions/{suggestion_id}/convert-action",
    response_model=SuggestionResponse,
)
def convert_to_action(
    request: Request,
    audit_id: uuid.UUID,
    suggestion_id: uuid.UUID,
    payload: ConvertActionRequest,
    actor: User = Depends(
        require_roles(
            UserRole.ADMIN_EMPRESA,
            UserRole.COORDINADOR_SIG,
            UserRole.AUDITOR,
        )
    ),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> SuggestionResponse:
    return service.convert_to_action(
        audit_id, suggestion_id, payload, actor=actor, ip=_ip(request)
    )


@router.get(
    "/audits/{audit_id}/finding-suggestions/{suggestion_id}/history",
    response_model=list[SuggestionHistoryEntry],
)
def suggestion_history(
    audit_id: uuid.UUID,
    suggestion_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    service: FindingIntelligenceService = Depends(get_finding_intelligence_service),
) -> list[SuggestionHistoryEntry]:
    return service.get_history(audit_id, suggestion_id, actor=actor)
