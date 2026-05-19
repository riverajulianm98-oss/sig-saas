"""Domain enums for authentication and authorization."""

from enum import StrEnum


class UserRole(StrEnum):
    """RBAC roles aligned with architecture.md."""

    ADMIN_EMPRESA = "admin_empresa"
    COORDINADOR_SIG = "coordinador_sig"
    AUDITOR = "auditor"
    LIDER_PROCESO = "lider_proceso"
    USUARIO = "usuario"
