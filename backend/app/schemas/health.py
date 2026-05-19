from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: Literal["healthy", "degraded", "unhealthy"]
    app_name: str
    version: str
    environment: str
    database: Literal["up", "down"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
