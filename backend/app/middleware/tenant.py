"""Multi-tenant context middleware."""

import uuid
from collections.abc import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.core.security import decode_access_token
from app.domain.tenancy.context import clear_current_tenant_id, set_current_tenant_id

logger = get_logger(__name__)

# Paths that never require tenant resolution
_TENANT_EXEMPT_PREFIXES = (
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/health",
    "/health",
    "/api/v1/auth/register",
    "/api/v1/auth/login",
    "/api/v1/auth/token",
)


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Resolves tenant from header and stores it in a ContextVar.

    Future: subdomain / JWT claim resolution can extend this middleware.
    """

    def __init__(self, app, settings: Settings | None = None) -> None:
        super().__init__(app)
        self.settings = settings or get_settings()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if self._is_exempt(request.url.path):
            return await call_next(request)

        header_value = request.headers.get(self.settings.tenant_header)
        context_token = None

        if not header_value:
            header_value = self._tenant_from_bearer(request)

        if header_value:
            try:
                tenant_id = uuid.UUID(header_value)
                context_token = set_current_tenant_id(tenant_id)
                logger.debug("Tenant context set: %s", tenant_id)
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": (
                            f"Invalid {self.settings.tenant_header} value. "
                            "Expected UUID."
                        )
                    },
                )
        elif self.settings.tenant_required:
            return JSONResponse(
                status_code=400,
                content={
                    "detail": f"Missing required header: {self.settings.tenant_header}"
                },
            )

        try:
            return await call_next(request)
        finally:
            if context_token is not None:
                clear_current_tenant_id(context_token)

    def _tenant_from_bearer(self, request: Request) -> str | None:
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.lower().startswith("bearer "):
            return None
        raw_token = authorization.split(" ", 1)[1].strip()
        payload = decode_access_token(raw_token, self.settings)
        if payload is None:
            return None
        return payload.get("tenant_id")

    def _is_exempt(self, path: str) -> bool:
        return any(path.startswith(prefix) for prefix in _TENANT_EXEMPT_PREFIXES)
