"""FastAPI dependencies for RBAC."""

from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.domain.auth.enums import UserRole
from app.domain.auth.rbac import has_any_role, has_min_role
from app.infrastructure.models.user import User


def require_roles(*allowed_roles: UserRole) -> Callable[..., User]:
    """Allow only users whose role is in allowed_roles."""

    allowed = set(allowed_roles)

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not has_any_role(current_user.role, allowed):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency


def require_min_role(minimum_role: UserRole) -> Callable[..., User]:
    """Allow users at or above minimum_role in the tenant hierarchy."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if not has_min_role(current_user.role, minimum_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency
