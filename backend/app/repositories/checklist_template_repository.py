"""Checklist template persistence."""

import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.infrastructure.models.checklist_question import ChecklistQuestion
from app.infrastructure.models.checklist_section import ChecklistSection
from app.infrastructure.models.checklist_template import ChecklistTemplate
from app.infrastructure.models.checklist_template_version import ChecklistTemplateVersion


class ChecklistTemplateRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_template(
        self,
        template_id: uuid.UUID,
        *,
        tenant_id: uuid.UUID | None = None,
    ) -> ChecklistTemplate | None:
        template = self._session.scalar(
            select(ChecklistTemplate)
            .where(
                ChecklistTemplate.id == template_id,
                ChecklistTemplate.deleted_at.is_(None),
            )
            .options(selectinload(ChecklistTemplate.versions))
        )
        if template is None:
            return None
        if not self._can_access(template, tenant_id):
            return None
        return template

    def get_version_with_structure(
        self,
        version_id: uuid.UUID,
        *,
        tenant_id: uuid.UUID | None = None,
    ) -> ChecklistTemplateVersion | None:
        version = self._session.scalar(
            select(ChecklistTemplateVersion)
            .where(ChecklistTemplateVersion.id == version_id)
            .options(
                selectinload(ChecklistTemplateVersion.template),
                selectinload(ChecklistTemplateVersion.sections).selectinload(
                    ChecklistSection.questions
                ),
            )
        )
        if version is None:
            return None
        if not self._can_access(version.template, tenant_id):
            return None
        return version

    def list_accessible(
        self,
        tenant_id: uuid.UUID,
        *,
        iso_standard: str | None = None,
        active_only: bool = True,
        include_system: bool = True,
    ) -> list[ChecklistTemplate]:
        filters = [ChecklistTemplate.deleted_at.is_(None)]
        scope = [ChecklistTemplate.tenant_id == tenant_id]
        if include_system:
            scope.append(ChecklistTemplate.tenant_id.is_(None))
        filters.append(or_(*scope))
        if iso_standard:
            filters.append(ChecklistTemplate.iso_standard == iso_standard)
        if active_only:
            filters.append(ChecklistTemplate.is_active.is_(True))
        return list(
            self._session.scalars(
                select(ChecklistTemplate)
                .where(*filters)
                .order_by(
                    ChecklistTemplate.is_system.desc(),
                    ChecklistTemplate.iso_standard,
                    ChecklistTemplate.code,
                )
            ).all()
        )

    def code_exists(
        self,
        code: str,
        *,
        tenant_id: uuid.UUID | None,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        filters = [
            ChecklistTemplate.code == code,
            ChecklistTemplate.deleted_at.is_(None),
        ]
        if tenant_id is None:
            filters.append(ChecklistTemplate.tenant_id.is_(None))
        else:
            filters.append(ChecklistTemplate.tenant_id == tenant_id)
        if exclude_id:
            filters.append(ChecklistTemplate.id != exclude_id)
        return bool(self._session.scalar(select(ChecklistTemplate.id).where(*filters)))

    def system_template_by_code(self, code: str) -> ChecklistTemplate | None:
        return self._session.scalar(
            select(ChecklistTemplate).where(
                ChecklistTemplate.tenant_id.is_(None),
                ChecklistTemplate.code == code,
                ChecklistTemplate.deleted_at.is_(None),
            )
        )

    def count_questions(self, version_id: uuid.UUID) -> int:
        return (
            self._session.scalar(
                select(func.count(ChecklistQuestion.id))
                .join(ChecklistSection, ChecklistSection.id == ChecklistQuestion.section_id)
                .where(ChecklistSection.version_id == version_id)
            )
            or 0
        )

    @staticmethod
    def _can_access(template: ChecklistTemplate, tenant_id: uuid.UUID | None) -> bool:
        if template.tenant_id is None:
            return True
        return tenant_id is not None and template.tenant_id == tenant_id
