"""Finding suggestion workflow transitions."""

from app.domain.audits.enums import SuggestionStatus


_ALLOWED: dict[SuggestionStatus, set[SuggestionStatus]] = {
    SuggestionStatus.SUGERIDO: {
        SuggestionStatus.PENDIENTE_VALIDACION,
        SuggestionStatus.APROBADO,
        SuggestionStatus.DESCARTADO,
    },
    SuggestionStatus.PENDIENTE_VALIDACION: {
        SuggestionStatus.APROBADO,
        SuggestionStatus.DESCARTADO,
    },
    SuggestionStatus.APROBADO: {SuggestionStatus.CONVERTIDO_ACCION},
    SuggestionStatus.DESCARTADO: set(),
    SuggestionStatus.CONVERTIDO_ACCION: set(),
}


def assert_valid_suggestion_transition(current: SuggestionStatus, target: SuggestionStatus) -> None:
    allowed = _ALLOWED.get(current, set())
    if target not in allowed:
        raise ValueError(
            f"Invalid suggestion transition from '{current.value}' to '{target.value}'."
        )
