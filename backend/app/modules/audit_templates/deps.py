"""Checklist template dependencies."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.audit_templates.services import ChecklistTemplateService


def get_template_service(db: Session = Depends(get_db)) -> ChecklistTemplateService:
    return ChecklistTemplateService(db)
