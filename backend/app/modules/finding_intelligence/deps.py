"""Finding intelligence dependencies."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.finding_intelligence.services import FindingIntelligenceService


def get_finding_intelligence_service(
    db: Session = Depends(get_db),
) -> FindingIntelligenceService:
    return FindingIntelligenceService(db)
