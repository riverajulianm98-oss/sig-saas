from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check",
    description="Liveness and database connectivity probe.",
)
def health_check(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> HealthCheckResponse:
    database_status: Literal["up", "down"] = "up"

    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        database_status = "down"
    except Exception:
        # Connection errors (e.g. DB down) must not break the probe
        database_status = "down"

    overall: Literal["healthy", "degraded"] = (
        "healthy" if database_status == "up" else "degraded"
    )

    return HealthCheckResponse(
        status=overall,
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        database=database_status,
        timestamp=datetime.now(UTC),
    )
