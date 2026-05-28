from fastapi import APIRouter

from app.api.v1.endpoints import health
from app.modules.auth.router import router as auth_router
from app.modules.audit_templates.router import router as audit_templates_router
from app.modules.finding_intelligence.router import router as finding_intelligence_router
from app.modules.audits.router import router as audits_router
from app.modules.documents.router import router as documents_router
from app.modules.users.router import router as users_router
from app.modules.analytics.router import router as analytics_router
from app.modules.findings.router import router as findings_router

api_v1_router = APIRouter()
api_v1_router.include_router(health.router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(audits_router)
api_v1_router.include_router(audit_templates_router)
api_v1_router.include_router(finding_intelligence_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(findings_router)
