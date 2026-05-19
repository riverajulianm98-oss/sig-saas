"""Request-scoped tenant context (multi-tenant isolation)."""

import uuid
from contextvars import ContextVar, Token

_tenant_id: ContextVar[uuid.UUID | None] = ContextVar("tenant_id", default=None)


def get_current_tenant_id() -> uuid.UUID | None:
    return _tenant_id.get()


def set_current_tenant_id(tenant_id: uuid.UUID) -> Token[uuid.UUID | None]:
    return _tenant_id.set(tenant_id)


def clear_current_tenant_id(token: Token[uuid.UUID | None]) -> None:
    _tenant_id.reset(token)


def require_current_tenant_id() -> uuid.UUID:
    """Raise if tenant context is missing (protected business operations)."""
    tenant_id = get_current_tenant_id()
    if tenant_id is None:
        raise RuntimeError("Tenant context is not set for this request.")
    return tenant_id
