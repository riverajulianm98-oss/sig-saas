"""Checklist template HTTP routes."""

import uuid

from fastapi import APIRouter, Depends, Query, Request, status

from app.api.deps import get_current_user
from app.api.rbac import require_roles
from app.domain.auth.enums import UserRole
from app.infrastructure.models.user import User
from app.modules.audit_templates.deps import get_template_service
from app.modules.audit_templates.schemas import (
    ActivateVersionRequest,
    ApplyTemplateRequest,
    AuditFromTemplateCreate,
    CloneTemplateRequest,
    ComplianceBreakdown,
    NewVersionRequest,
    QuestionCreate,
    QuestionResponse,
    QuestionUpdate,
    SectionCreate,
    SectionResponse,
    SectionUpdate,
    TemplateCreate,
    TemplateDetailResponse,
    TemplateListResponse,
    TemplateSummary,
    TemplateUpdate,
    VersionDetailResponse,
)
from app.modules.audit_templates.services import ChecklistTemplateService
from app.modules.audits.schemas import AuditDetailResponse
from app.schemas.common import APIMessage
from app.utils.request import get_client_ip

router = APIRouter(prefix="/audit-templates", tags=["audit-templates"])


def _ip(request: Request) -> str | None:
    return get_client_ip(request)


@router.get("", response_model=TemplateListResponse)
def list_templates(
    iso_standard: str | None = Query(None, alias="iso"),
    active_only: bool = Query(True),
    actor: User = Depends(get_current_user),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateListResponse:
    return service.list_templates(
        actor=actor, iso_standard=iso_standard, active_only=active_only
    )


@router.post("", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    payload: TemplateCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateDetailResponse:
    return service.create_template(payload, actor=actor)


@router.post(
    "/audits/from-template",
    response_model=AuditDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_audit_from_template(
    request: Request,
    payload: AuditFromTemplateCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> AuditDetailResponse:
    return service.create_audit_from_template(payload, actor=actor, ip=_ip(request))


@router.post("/audits/{audit_id}/apply-template", response_model=APIMessage)
def apply_template_to_audit(
    request: Request,
    audit_id: uuid.UUID,
    payload: ApplyTemplateRequest,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> APIMessage:
    count = service.apply_to_audit(audit_id, payload, actor=actor, ip=_ip(request))
    return APIMessage(message=f"Applied {count} checklist items.")


@router.get("/audits/{audit_id}/compliance", response_model=ComplianceBreakdown)
def audit_compliance(
    audit_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> ComplianceBreakdown:
    return service.compliance_breakdown(audit_id, actor=actor)


@router.get("/{template_id}", response_model=TemplateDetailResponse)
def get_template(
    template_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateDetailResponse:
    return service.get_template(template_id, actor=actor)


@router.patch("/{template_id}", response_model=TemplateSummary)
def update_template(
    template_id: uuid.UUID,
    payload: TemplateUpdate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateSummary:
    return service.update_template(template_id, payload, actor=actor)


@router.post("/{template_id}/activate", response_model=TemplateSummary)
def activate_template(
    template_id: uuid.UUID,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateSummary:
    return service.activate_template(template_id, actor=actor)


@router.post("/{template_id}/deactivate", response_model=TemplateSummary)
def deactivate_template(
    template_id: uuid.UUID,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateSummary:
    return service.deactivate_template(template_id, actor=actor)


@router.post(
    "/{template_id}/clone",
    response_model=TemplateDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def clone_template(
    template_id: uuid.UUID,
    payload: CloneTemplateRequest,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> TemplateDetailResponse:
    return service.clone_template(template_id, payload, actor=actor)


@router.post(
    "/{template_id}/versions",
    response_model=VersionDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_version(
    template_id: uuid.UUID,
    payload: NewVersionRequest,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> VersionDetailResponse:
    return service.create_version(template_id, payload, actor=actor)


@router.post("/{template_id}/versions/activate", response_model=VersionDetailResponse)
def activate_version(
    template_id: uuid.UUID,
    payload: ActivateVersionRequest,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> VersionDetailResponse:
    return service.activate_version(template_id, payload, actor=actor)


@router.get("/{template_id}/versions/{version_id}", response_model=VersionDetailResponse)
def get_version(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    actor: User = Depends(get_current_user),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> VersionDetailResponse:
    return service.get_version(template_id, version_id, actor=actor)


@router.post(
    "/{template_id}/versions/{version_id}/sections",
    response_model=SectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_section(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    payload: SectionCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> SectionResponse:
    return service.add_section(template_id, version_id, payload, actor=actor)


@router.patch(
    "/{template_id}/versions/{version_id}/sections/{section_id}",
    response_model=SectionResponse,
)
def update_section(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    section_id: uuid.UUID,
    payload: SectionUpdate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> SectionResponse:
    return service.update_section(template_id, version_id, section_id, payload, actor=actor)


@router.post(
    "/{template_id}/versions/{version_id}/sections/{section_id}/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_question(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    section_id: uuid.UUID,
    payload: QuestionCreate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> QuestionResponse:
    return service.add_question(
        template_id, version_id, section_id, payload, actor=actor
    )


@router.patch(
    "/{template_id}/versions/{version_id}/sections/{section_id}/questions/{question_id}",
    response_model=QuestionResponse,
)
def update_question(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    section_id: uuid.UUID,
    question_id: uuid.UUID,
    payload: QuestionUpdate,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> QuestionResponse:
    return service.update_question(
        template_id, version_id, section_id, question_id, payload, actor=actor
    )


@router.delete(
    "/{template_id}/versions/{version_id}/sections/{section_id}/questions/{question_id}",
    response_model=APIMessage,
)
def delete_question(
    template_id: uuid.UUID,
    version_id: uuid.UUID,
    section_id: uuid.UUID,
    question_id: uuid.UUID,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)),
    service: ChecklistTemplateService = Depends(get_template_service),
) -> APIMessage:
    service.delete_question(
        template_id, version_id, section_id, question_id, actor=actor
    )
    return APIMessage(message="Question deleted.")
