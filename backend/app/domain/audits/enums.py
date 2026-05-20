"""Audit module domain enums (ISO 9001 / 14001 / 45001)."""

from enum import StrEnum


class IsoStandard(StrEnum):
    ISO_9001 = "iso_9001"
    ISO_14001 = "iso_14001"
    ISO_45001 = "iso_45001"


class AuditType(StrEnum):
    INTERNA = "interna"
    EXTERNA = "externa"
    SEGUIMIENTO = "seguimiento"
    CERTIFICACION = "certificacion"
    EXTRAORDINARIA = "extraordinaria"


class AuditStatus(StrEnum):
    PLANEADA = "planeada"
    EN_PROCESO = "en_proceso"
    FINALIZADA = "finalizada"
    CERRADA = "cerrada"
    CANCELADA = "cancelada"


class FindingClassification(StrEnum):
    NO_CONFORMIDAD = "no_conformidad"
    OBSERVACION = "observacion"
    OPORTUNIDAD_MEJORA = "oportunidad_mejora"
    FORTALEZA = "fortaleza"


class FindingSeverity(StrEnum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class FindingStatus(StrEnum):
    ABIERTO = "abierto"
    EN_SEGUIMIENTO = "en_seguimiento"
    CERRADO = "cerrado"


class SuggestionStatus(StrEnum):
    SUGERIDO = "sugerido"
    PENDIENTE_VALIDACION = "pendiente_validacion"
    APROBADO = "aprobado"
    DESCARTADO = "descartado"
    CONVERTIDO_ACCION = "convertido_accion"


class FindingSource(StrEnum):
    MANUAL = "manual"
    AUTO = "auto"


class GenerationSensitivity(StrEnum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"


class ChecklistCompliance(StrEnum):
    CUMPLE = "cumple"
    NO_CUMPLE = "no_cumple"
    PARCIAL = "parcial"
    NO_APLICA = "no_aplica"
    PENDIENTE = "pendiente"


class ActionPlanStatus(StrEnum):
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADA = "completada"
    VENCIDA = "vencida"
    CANCELADA = "cancelada"


class EvidenceType(StrEnum):
    DOCUMENT_REFERENCE = "document_reference"
    FILE_UPLOAD = "file_upload"
    EXTERNAL_URL = "external_url"


class QuestionResponseType(StrEnum):
    """Allowed response modes for checklist template questions."""

    CUMPLE = "cumple"
    NO_CUMPLE = "no_cumple"
    PARCIAL = "parcial"
    NO_APLICA = "no_aplica"
    TEXTO = "texto"
    NUMERICO = "numerico"


class QuestionCriticality(StrEnum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class TemplateVersionStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"
