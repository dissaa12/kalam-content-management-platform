from fastapi import APIRouter
from app.api.endpoints.health import router as health_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.content import router as content_router
from app.api.endpoints.workflow import router as workflow_router
from app.api.endpoints.campaigns import router as campaigns_router
from app.api.endpoints.calendar import router as calendar_router
from app.api.endpoints.media import router as media_router
from app.api.endpoints.ai import router as ai_router
from app.api.endpoints.analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(content_router, prefix="/content", tags=["Content Management"])
api_router.include_router(workflow_router, prefix="/content", tags=["Workflow & Approvals"])
api_router.include_router(campaigns_router, prefix="/campaigns", tags=["Campaign Management"])
api_router.include_router(calendar_router, prefix="/calendar", tags=["Content Calendar"])
api_router.include_router(media_router, prefix="/media", tags=["Media Library"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Assistant"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Marketing Analytics"])
