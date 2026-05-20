"""Audit status workflow."""

from fastapi import HTTPException, status

from app.domain.audits.enums import AuditStatus

ALLOWED_TRANSITIONS: dict[AuditStatus, set[AuditStatus]] = {
    AuditStatus.PLANEADA: {AuditStatus.EN_PROCESO, AuditStatus.CANCELADA},
    AuditStatus.EN_PROCESO: {
        AuditStatus.FINALIZADA,
        AuditStatus.CANCELADA,
    },
    AuditStatus.FINALIZADA: {AuditStatus.CERRADA, AuditStatus.EN_PROCESO},
    AuditStatus.CERRADA: set(),
    AuditStatus.CANCELADA: set(),
}


def assert_valid_audit_transition(current: AuditStatus, target: AuditStatus) -> None:
    if current == target:
        return
    allowed = ALLOWED_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition audit from '{current.value}' to '{target.value}'.",
        )
