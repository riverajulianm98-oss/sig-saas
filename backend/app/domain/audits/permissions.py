"""Audit module RBAC."""

from app.domain.auth.enums import UserRole
from app.domain.auth.rbac import has_any_role

MANAGE_AUDITS = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
}

CONDUCT_AUDITS = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
    UserRole.AUDITOR,
}

MANAGE_FINDINGS = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
    UserRole.AUDITOR,
    UserRole.LIDER_PROCESO,
}

VIEW_AUDITS = {
    UserRole.ADMIN_EMPRESA,
    UserRole.COORDINADOR_SIG,
    UserRole.AUDITOR,
    UserRole.LIDER_PROCESO,
    UserRole.USUARIO,
}


def can_manage_audits(role: str | UserRole) -> bool:
    return has_any_role(role, MANAGE_AUDITS)


def can_conduct_audits(role: str | UserRole) -> bool:
    return has_any_role(role, CONDUCT_AUDITS)


def can_manage_findings(role: str | UserRole) -> bool:
    return has_any_role(role, MANAGE_FINDINGS)


def can_view_audits(role: str | UserRole) -> bool:
    return has_any_role(role, VIEW_AUDITS)


MANAGE_TEMPLATES = MANAGE_AUDITS


def can_manage_templates(role: str | UserRole) -> bool:
    return has_any_role(role, MANAGE_TEMPLATES)


def can_view_templates(role: str | UserRole) -> bool:
    return has_any_role(role, VIEW_AUDITS)
