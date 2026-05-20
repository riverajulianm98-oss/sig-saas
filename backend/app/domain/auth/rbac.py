"""Role-based access control helpers."""

from collections.abc import Callable
from typing import ParamSpec, TypeVar

from fastapi import Depends, HTTPException, status

from app.domain.auth.enums import UserRole

P = ParamSpec("P")
R = TypeVar("R")

# Higher value = more privileges within a tenant
ROLE_LEVEL: dict[UserRole, int] = {
    UserRole.ADMIN_EMPRESA: 100,
    UserRole.COORDINADOR_SIG: 80,
    UserRole.AUDITOR: 60,
    UserRole.LIDER_PROCESO: 40,
    UserRole.USUARIO: 20,
}


def parse_role(role: str | UserRole) -> UserRole:
    if isinstance(role, UserRole):
        return role
    try:
        return UserRole(role)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role assigned to user.",
        ) from exc


def has_any_role(user_role: str | UserRole, allowed: set[UserRole]) -> bool:
    return parse_role(user_role) in allowed


def has_min_role(user_role: str | UserRole, minimum: UserRole) -> bool:
    role = parse_role(user_role)
    return ROLE_LEVEL[role] >= ROLE_LEVEL[minimum]


def can_manage_users(actor_role: str | UserRole) -> bool:
    return has_any_role(
        actor_role,
        {UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG},
    )


def can_assign_role(actor_role: str | UserRole, target_role: UserRole) -> bool:
    actor = parse_role(actor_role)
    if actor == UserRole.ADMIN_EMPRESA:
        return True
    if actor == UserRole.COORDINADOR_SIG:
        return target_role not in {UserRole.ADMIN_EMPRESA}
    return False
