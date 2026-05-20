"""Document module authorization rules."""

from app.domain.auth.enums import UserRole
from app.domain.auth.rbac import has_any_role, parse_role
from app.domain.documents.enums import DocumentStatus

MANAGE_ROLES = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
    UserRole.LIDER_PROCESO,
}

APPROVE_ROLES = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
    UserRole.AUDITOR,
}


def can_manage_documents(actor_role: str | UserRole) -> bool:
    return has_any_role(actor_role, MANAGE_ROLES)


def can_approve_documents(actor_role: str | UserRole) -> bool:
    return has_any_role(actor_role, APPROVE_ROLES)


def can_transition_status(
    actor_role: str | UserRole,
    target_status: DocumentStatus,
) -> bool:
    role = parse_role(actor_role)
    if target_status == DocumentStatus.APROBADO:
        return can_approve_documents(role)
    if target_status in {DocumentStatus.REVISION, DocumentStatus.BORRADOR, DocumentStatus.OBSOLETO}:
        return can_manage_documents(role)
    return False
