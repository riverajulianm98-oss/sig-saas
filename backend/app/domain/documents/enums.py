"""Document control domain enums (ISO-aligned)."""

from enum import StrEnum


class DocumentType(StrEnum):
    PROCEDIMIENTO = "procedimiento"
    FORMATO = "formato"
    INSTRUCTIVO = "instructivo"
    POLITICA = "politica"
    MANUAL = "manual"
    EVIDENCIA = "evidencia"


class DocumentStatus(StrEnum):
    BORRADOR = "borrador"
    REVISION = "revision"
    APROBADO = "aprobado"
    OBSOLETO = "obsoleto"
