"""Idempotent seed for global ISO checklist templates."""

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.domain.audits.enums import TemplateVersionStatus
from app.infrastructure.models.checklist_question import ChecklistQuestion
from app.infrastructure.models.checklist_section import ChecklistSection
from app.infrastructure.models.checklist_template import ChecklistTemplate
from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion
from app.modules.audit_templates.seed_data import SYSTEM_TEMPLATES, TemplateSeed


def seed_system_templates(session: Session) -> int:
    """Insert or skip global templates. Returns count of newly created templates."""
    created = 0
    from sqlalchemy import select

    for data in SYSTEM_TEMPLATES:
        row = session.scalar(
            select(ChecklistTemplate).where(
                ChecklistTemplate.tenant_id.is_(None),
                ChecklistTemplate.code == data["code"],
                ChecklistTemplate.deleted_at.is_(None),
            )
        )
        if row is not None:
            continue
        _create_template(session, data)
        created += 1
    session.flush()
    return created


def _create_template(session: Session, data: TemplateSeed) -> ChecklistTemplate:
    template = ChecklistTemplate(
        tenant_id=None,
        iso_standard=data["iso_standard"],
        code=data["code"],
        title=data["title"],
        description=data["description"],
        is_system=True,
        is_active=True,
    )
    session.add(template)
    session.flush()

    version = ChecklistTemplateVersion(
        template_id=template.id,
        version_number=1,
        status=TemplateVersionStatus.ACTIVE.value,
        change_summary="Versión inicial del sistema",
        published_at=datetime.now(UTC),
    )
    session.add(version)
    session.flush()

    sort_section = 0
    for section_data in data["sections"]:
        sort_section += 1
        section = ChecklistSection(
            version_id=version.id,
            chapter_code=section_data["chapter_code"],
            clause_code=section_data["clause_code"],
            title=section_data["title"],
            description=section_data.get("description"),
            process_area=section_data.get("process_area"),
            sort_order=section_data.get("sort_order", sort_section),
        )
        session.add(section)
        session.flush()
        for q in section_data["questions"]:
            session.add(
                ChecklistQuestion(
                    section_id=section.id,
                    clause_code=q["clause_code"],
                    question_text=q["question_text"],
                    compliance_criteria=q["compliance_criteria"],
                    guidance_text=q.get("guidance_text"),
                    weight=q.get("weight", 1),
                    criticality=q.get("criticality", "media"),
                    response_type=q.get("response_type", "cumple"),
                    is_required=q.get("is_required", True),
                    evidence_required=q.get("evidence_required", False),
                    sort_order=q.get("sort_order", 1),
                )
            )

    template.current_version_id = version.id
    return template
