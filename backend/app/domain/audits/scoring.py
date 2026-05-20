"""Weighted compliance scoring for audit checklists."""

import uuid
from dataclasses import dataclass
from typing import Any

from app.domain.audits.enums import ChecklistCompliance, FindingClassification, FindingSeverity


COMPLIANCE_SCORE_MAP: dict[str, int | None] = {
    ChecklistCompliance.CUMPLE.value: 100,
    ChecklistCompliance.NO_APLICA.value: 100,
    ChecklistCompliance.PARCIAL.value: 50,
    ChecklistCompliance.NO_CUMPLE.value: 0,
    ChecklistCompliance.PENDIENTE.value: None,
}

CRITICALITY_SEVERITY_MAP: dict[str, FindingSeverity] = {
    "baja": FindingSeverity.BAJA,
    "media": FindingSeverity.MEDIA,
    "alta": FindingSeverity.ALTA,
    "critica": FindingSeverity.CRITICA,
}


@dataclass(frozen=True)
class ScoringItem:
    clause_code: str
    weight: int
    criticality: str
    compliance_status: str
    process_area: str | None = None
    score: int | None = None
    response_type: str = "cumple"
    is_required: bool = True


def resolve_item_score(item: ScoringItem) -> int | None:
    if item.score is not None:
        return max(0, min(100, item.score))
    return COMPLIANCE_SCORE_MAP.get(item.compliance_status)


def weighted_average(items: list[ScoringItem]) -> int | None:
    scored: list[tuple[int, int]] = []
    for item in items:
        value = resolve_item_score(item)
        if value is None:
            continue
        weight = max(1, item.weight)
        scored.append((value, weight))
    if not scored:
        return None
    total_weight = sum(w for _, w in scored)
    total = sum(v * w for v, w in scored)
    return round(total / total_weight)


def scores_by_clause(items: list[ScoringItem]) -> dict[str, int]:
    clauses: dict[str, list[ScoringItem]] = {}
    for item in items:
        clauses.setdefault(item.clause_code, []).append(item)
    return {code: score for code, group in clauses.items() if (score := weighted_average(group)) is not None}


def scores_by_process(items: list[ScoringItem]) -> dict[str, int]:
    processes: dict[str, list[ScoringItem]] = {}
    for item in items:
        key = item.process_area or "sin_proceso"
        processes.setdefault(key, []).append(item)
    return {proc: score for proc, group in processes.items() if (score := weighted_average(group)) is not None}


def suggest_auto_findings(items: list[ScoringItem]) -> list[dict[str, Any]]:
    """Lightweight preview suggestions (full engine persists via finding-intelligence API)."""
    from app.domain.audits.finding_engine import ChecklistItemContext, generate_suggestions
    from app.domain.audits.finding_rules import build_rules
    from app.domain.audits.enums import GenerationSensitivity

    contexts = [
        ChecklistItemContext(
            checklist_id=uuid.uuid4(),
            clause_code=i.clause_code,
            question_text=i.clause_code,
            compliance_criteria=i.clause_code,
            compliance_status=i.compliance_status,
            weight=i.weight,
            criticality=i.criticality,
            process_area=i.process_area,
            template_question_id=None,
            observations=None,
        )
        for i in items
    ]
    rules = build_rules(sensitivity=GenerationSensitivity.MEDIA)
    drafts = generate_suggestions(contexts, rules=rules, reincidence_keys=set())
    return [
        {
            "clause_code": d.requirement_reference,
            "process_area": d.process_area,
            "classification": d.classification,
            "severity": d.severity,
            "title": d.title,
            "description": d.description,
            "confidence_score": d.confidence_score,
        }
        for d in drafts
    ]
