"""Copy template version structure into audit checklist snapshot."""

import uuid

from sqlalchemy.orm import Session

from app.infrastructure.models.audit import Audit
from app.infrastructure.models.audit_checklist import AuditChecklist
from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion


def apply_template_snapshot(
    session: Session,
    audit: Audit,
    version: ChecklistTemplateVersion,
    *,
    template_id: uuid.UUID,
) -> list[AuditChecklist]:
    """Materialize template questions as immutable audit checklist rows."""
    items: list[AuditChecklist] = []
    sort_global = 0
    for section in sorted(version.sections, key=lambda s: s.sort_order):
        for question in sorted(section.questions, key=lambda q: q.sort_order):
            sort_global += 1
            item = AuditChecklist(
                audit_id=audit.id,
                iso_standard=version.template.iso_standard,
                clause_code=question.clause_code,
                requirement_text=question.compliance_criteria,
                question_text=question.question_text,
                sort_order=sort_global,
                weight=question.weight,
                template_id=template_id,
                template_version_id=version.id,
                template_question_id=question.id,
                chapter_code=section.chapter_code,
                section_title=section.title,
                process_area=section.process_area or audit.process_area,
                criticality=question.criticality,
                response_type=question.response_type,
                evidence_required=question.evidence_required,
                compliance_criteria=question.compliance_criteria,
            )
            session.add(item)
            items.append(item)
    audit.checklist_template_id = template_id
    audit.checklist_template_version_id = version.id
    return items
