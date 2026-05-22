"""Analytics response schemas."""

from pydantic import BaseModel


class RiskByArea(BaseModel):
    bajo: int
    medio: int
    alto: int


class ExecutiveSummaryResponse(BaseModel):
    compliance_score: int
    compliance_trend: int
    open_findings: int
    overdue_capa: int
    active_audits: int
    docs_expiring: int
    risk_level: str  # bajo | medio | alto
    risk_by_area: RiskByArea


class TrendMonth(BaseModel):
    month: str
    compliance: float
    capa_completion: float
    recurrence_rate: float


class TrendsResponse(BaseModel):
    months: list[str]
    compliance: list[float]
    capa_completion: list[float]
    recurrence_rate: list[float]


class ProcessRisk(BaseModel):
    process: str
    critica: int
    alta: int
    media: int
    baja: int
    risk_score: int


class ClauseScore(BaseModel):
    clause: str
    label: str
    score: int


class AiInsight(BaseModel):
    id: str
    type: str  # risk | trend | action | opportunity
    severity: str  # critica | alta | media | positivo | mejora
    icon: str
    title: str
    body: str
