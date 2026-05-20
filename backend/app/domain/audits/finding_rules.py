"""Tenant-configurable thresholds for intelligent finding generation."""

from dataclasses import dataclass

from app.domain.audits.enums import GenerationSensitivity, QuestionCriticality


@dataclass(frozen=True)
class FindingGenerationRules:
    min_clause_score: int
    min_process_score: int
    min_global_score: int
    min_criticality_rank: int
    weight_escalation_threshold: int
    reincidence_severity_boost: bool
    auto_generate_enabled: bool
    require_manual_validation: bool
    sensitivity: GenerationSensitivity


CRITICALITY_RANK = {
    QuestionCriticality.BAJA.value: 1,
    QuestionCriticality.MEDIA.value: 2,
    QuestionCriticality.ALTA.value: 3,
    QuestionCriticality.CRITICA.value: 4,
}

SENSITIVITY_PRESETS: dict[GenerationSensitivity, dict[str, int]] = {
    GenerationSensitivity.BAJA: {
        "min_clause_score": 60,
        "min_process_score": 55,
        "min_global_score": 50,
        "min_criticality_rank": 3,
        "weight_escalation_threshold": 8,
    },
    GenerationSensitivity.MEDIA: {
        "min_clause_score": 75,
        "min_process_score": 70,
        "min_global_score": 65,
        "min_criticality_rank": 2,
        "weight_escalation_threshold": 5,
    },
    GenerationSensitivity.ALTA: {
        "min_clause_score": 85,
        "min_process_score": 80,
        "min_global_score": 75,
        "min_criticality_rank": 1,
        "weight_escalation_threshold": 3,
    },
}


def build_rules(
    *,
    sensitivity: GenerationSensitivity,
    min_clause_score: int | None = None,
    min_process_score: int | None = None,
    min_global_score: int | None = None,
    min_criticality: str = QuestionCriticality.MEDIA.value,
    weight_escalation_threshold: int | None = None,
    reincidence_severity_boost: bool = True,
    auto_generate_enabled: bool = True,
    require_manual_validation: bool = True,
) -> FindingGenerationRules:
    preset = SENSITIVITY_PRESETS[sensitivity]
    return FindingGenerationRules(
        min_clause_score=min_clause_score if min_clause_score is not None else preset["min_clause_score"],
        min_process_score=min_process_score
        if min_process_score is not None
        else preset["min_process_score"],
        min_global_score=min_global_score if min_global_score is not None else preset["min_global_score"],
        min_criticality_rank=CRITICALITY_RANK.get(min_criticality, 2),
        weight_escalation_threshold=weight_escalation_threshold
        if weight_escalation_threshold is not None
        else preset["weight_escalation_threshold"],
        reincidence_severity_boost=reincidence_severity_boost,
        auto_generate_enabled=auto_generate_enabled,
        require_manual_validation=require_manual_validation,
        sensitivity=sensitivity,
    )
