"""ISO document status workflow."""

from fastapi import HTTPException, status

from app.domain.documents.enums import DocumentStatus

ALLOWED_TRANSITIONS: dict[DocumentStatus, set[DocumentStatus]] = {
    DocumentStatus.BORRADOR: {DocumentStatus.REVISION},
    DocumentStatus.REVISION: {DocumentStatus.APROBADO, DocumentStatus.BORRADOR},
    DocumentStatus.APROBADO: {DocumentStatus.OBSOLETO},
    DocumentStatus.OBSOLETO: set(),
}


def assert_valid_transition(
    current: DocumentStatus,
    target: DocumentStatus,
) -> None:
    if current == target:
        return
    allowed = ALLOWED_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from '{current.value}' to '{target.value}'.",
        )
