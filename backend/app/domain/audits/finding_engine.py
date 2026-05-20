"""Intelligent audit finding suggestion engine."""

from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.domain.audits.enums import (
    ChecklistCompliance,
    FindingClassification,
    FindingSeverity,
    QuestionCriticality,
)
from app.domain.audits.finding_rules import CRITICALITY_RANK, FindingGenerationRules
from app.domain.audits.scoring import ScoringItem, resolve_item_score, scores_by_clause, scores_by_process

SEVERITY_ORDER = [
    FindingSeverity.BAJA,
    FindingSeverity.MEDIA,
    FindingSeverity.ALTA,
    FindingSeverity.CRITICA,
]


@dataclass(frozen=True)
class ChecklistItemContext:
    checklist_id: UUID
    clause_code: str
    question_text: str
    compliance_criteria: str
    compliance_status: str
    weight: int
    criticality: str
    process_area: str | None
    template_question_id: UUID | None
    observations: str | None
    evidence_ids: list[UUID] = field(default_factory=list)
    iso_standard: str | None = None
    section_title: str | None = None


@dataclass(frozen=True)
class FindingSuggestionDraft:
    checklist_item_id: UUID
    template_question_id: UUID | None
    classification: str
    severity: str
    title: str
    description: str
    requirement_reference: str
    process_area: str | None
    potential_impact: str
    initial_recommendation: str
    confidence_score: float
    evidence_ids: list[UUID]
    generation_context: dict[str, Any]
    ai_metadata: dict[str, Any]


def _escalate_severity(current: FindingSeverity, steps: int = 1) -> FindingSeverity:
    idx = SEVERITY_ORDER.index(current)
    return SEVERITY_ORDER[min(idx + steps, len(SEVERITY_ORDER) - 1)]


def _base_severity(criticality: str) -> FindingSeverity:
    mapping = {
        QuestionCriticality.BAJA.value: FindingSeverity.BAJA,
        QuestionCriticality.MEDIA.value: FindingSeverity.MEDIA,
        QuestionCriticality.ALTA.value: FindingSeverity.ALTA,
        QuestionCriticality.CRITICA.value: FindingSeverity.CRITICA,
    }
    return mapping.get(criticality, FindingSeverity.MEDIA)


def _classify(
    compliance_status: str,
    criticality: str,
    clause_score: int | None,
    rules: FindingGenerationRules,
) -> str:
    if compliance_status == ChecklistCompliance.NO_CUMPLE.value:
        if CRITICALITY_RANK.get(criticality, 2) >= 3:
            return FindingClassification.NO_CONFORMIDAD.value
        if clause_score is not None and clause_score < rules.min_clause_score:
            return FindingClassification.NO_CONFORMIDAD.value
        return FindingClassification.OBSERVACION.value
    if compliance_status == ChecklistCompliance.PARCIAL.value:
        if CRITICALITY_RANK.get(criticality, 2) >= 3:
            return FindingClassification.OBSERVACION.value
        return FindingClassification.OPORTUNIDAD_MEJORA.value
    return FindingClassification.OBSERVACION.value


def _compute_severity(
    item: ChecklistItemContext,
    *,
    rules: FindingGenerationRules,
    clause_score: int | None,
    process_score: int | None,
    global_score: int | None,
    is_reincident: bool,
) -> FindingSeverity:
    severity = _base_severity(item.criticality)
    if item.weight >= rules.weight_escalation_threshold:
        severity = _escalate_severity(severity)
    if clause_score is not None and clause_score < rules.min_clause_score:
        severity = _escalate_severity(severity)
    if process_score is not None and process_score < rules.min_process_score:
        severity = _escalate_severity(severity)
    if global_score is not None and global_score < rules.min_global_score:
        severity = _escalate_severity(severity)
    if is_reincident and rules.reincidence_severity_boost:
        severity = _escalate_severity(severity)
    if item.compliance_status == ChecklistCompliance.NO_CUMPLE.value:
        severity = _escalate_severity(severity, 0)
    return severity


def _confidence(
    item: ChecklistItemContext,
    *,
    is_reincident: bool,
    clause_score: int | None,
) -> float:
    base = 0.55
    if item.compliance_status == ChecklistCompliance.NO_CUMPLE.value:
        base += 0.25
    elif item.compliance_status == ChecklistCompliance.PARCIAL.value:
        base += 0.15
    if CRITICALITY_RANK.get(item.criticality, 2) >= 3:
        base += 0.1
    if is_reincident:
        base += 0.1
    if clause_score is not None and clause_score < 50:
        base += 0.05
    return min(0.99, round(base, 2))


def _title(item: ChecklistItemContext, classification: str) -> str:
    labels = {
        FindingClassification.NO_CONFORMIDAD.value: "No conformidad",
        FindingClassification.OBSERVACION.value: "Observación",
        FindingClassification.OPORTUNIDAD_MEJORA.value: "Oportunidad de mejora",
        FindingClassification.FORTALEZA.value: "Fortaleza",
    }
    label = labels.get(classification, "Hallazgo")
    ref = item.section_title or item.clause_code
    return f"{label} — {ref}"


def _description(item: ChecklistItemContext, clause_score: int | None, process_score: int | None) -> str:
    parts = [
        f"Pregunta: {item.question_text}",
        f"Criterio: {item.compliance_criteria}",
        f"Respuesta registrada: {item.compliance_status}.",
    ]
    if item.observations:
        parts.append(f"Observaciones del auditor: {item.observations}")
    if clause_score is not None:
        parts.append(f"Score de cláusula {item.clause_code}: {clause_score}%.")
    if process_score is not None and item.process_area:
        parts.append(f"Score del proceso {item.process_area}: {process_score}%.")
    return " ".join(parts)


def _impact(classification: str, severity: FindingSeverity) -> str:
    return (
        f"Impacto potencial {classification.replace('_', ' ')} con severidad {severity.value}. "
        "Puede afectar la conformidad del SG y resultados de certificación."
    )


def _recommendation(classification: str) -> str:
    if classification == FindingClassification.NO_CONFORMIDAD.value:
        return "Analizar causa raíz, definir acción correctiva y verificar eficacia."
    if classification == FindingClassification.OBSERVACION.value:
        return "Evaluar riesgo residual y documentar acción preventiva si aplica."
    if classification == FindingClassification.OPORTUNIDAD_MEJORA.value:
        return "Priorizar mejora del proceso y asignar responsable de seguimiento."
    return "Documentar buena práctica y considerar replicar en otros procesos."


def generate_suggestions(
    items: list[ChecklistItemContext],
    *,
    rules: FindingGenerationRules,
    reincidence_keys: set[str],
    global_score: int | None = None,
) -> list[FindingSuggestionDraft]:
    scoring_items = [
        ScoringItem(
            clause_code=i.clause_code,
            weight=i.weight,
            criticality=i.criticality,
            compliance_status=i.compliance_status,
            process_area=i.process_area,
        )
        for i in items
        if i.compliance_status != ChecklistCompliance.PENDIENTE.value
    ]
    clause_scores = scores_by_clause(scoring_items)
    process_scores = scores_by_process(scoring_items)

    drafts: list[FindingSuggestionDraft] = []
    for item in items:
        if item.compliance_status not in {
            ChecklistCompliance.NO_CUMPLE.value,
            ChecklistCompliance.PARCIAL.value,
        }:
            continue
        if CRITICALITY_RANK.get(item.criticality, 2) < rules.min_criticality_rank:
            continue

        clause_score = clause_scores.get(item.clause_code)
        process_score = process_scores.get(item.process_area or "sin_proceso")
        reincidence_key = f"{item.clause_code}:{item.process_area or ''}"
        question_key = str(item.template_question_id) if item.template_question_id else ""
        is_reincident = reincidence_key in reincidence_keys or question_key in reincidence_keys

        classification = _classify(
            item.compliance_status, item.criticality, clause_score, rules
        )
        severity = _compute_severity(
            item,
            rules=rules,
            clause_score=clause_score,
            process_score=process_score,
            global_score=global_score,
            is_reincident=is_reincident,
        )
        confidence = _confidence(item, is_reincident=is_reincident, clause_score=clause_score)

        drafts.append(
            FindingSuggestionDraft(
                checklist_item_id=item.checklist_id,
                template_question_id=item.template_question_id,
                classification=classification,
                severity=severity.value,
                title=_title(item, classification),
                description=_description(item, clause_score, process_score),
                requirement_reference=item.clause_code,
                process_area=item.process_area,
                potential_impact=_impact(classification, severity),
                initial_recommendation=_recommendation(classification),
                confidence_score=confidence,
                evidence_ids=list(item.evidence_ids),
                generation_context={
                    "compliance_status": item.compliance_status,
                    "criticality": item.criticality,
                    "weight": item.weight,
                    "clause_score": clause_score,
                    "process_score": process_score,
                    "global_score": global_score,
                    "is_reincident": is_reincident,
                    "sensitivity": rules.sensitivity.value,
                    "item_score": resolve_item_score(
                        ScoringItem(
                            clause_code=item.clause_code,
                            weight=item.weight,
                            criticality=item.criticality,
                            compliance_status=item.compliance_status,
                            process_area=item.process_area,
                        )
                    ),
                },
                ai_metadata={
                    "nlp_ready": True,
                    "embedding_source": item.question_text,
                    "cluster_key": f"{item.iso_standard or 'iso'}:{item.clause_code}",
                    "semantic_tags": [classification, item.criticality, item.compliance_status],
                },
            )
        )
    return drafts
