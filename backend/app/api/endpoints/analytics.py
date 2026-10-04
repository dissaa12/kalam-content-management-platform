from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import DashboardAnalyticsResponse, TopContentMetric, CampaignPerformanceMetric

router = APIRouter()


@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    date_range: str = Query("last_30_days"),
    campaign_id: Optional[int] = Query(None),
    content_type: Optional[str] = Query(None),
    author_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """Fetch comprehensive marketing analytics telemetry, chart metrics, and top content ranks."""
    repo = AnalyticsRepository(db)
    return repo.get_dashboard_analytics(
        date_range=date_range,
        campaign_id=campaign_id,
        content_type=content_type,
        author_id=author_id,
        category_id=category_id,
    )


@router.get("/content/{content_id}", response_model=TopContentMetric)
def get_content_analytics(content_id: int, db: Session = Depends(get_db)) -> Any:
    """Fetch per-item content analytics metrics (views, engagement, CTR, shares, conversions)."""
    repo = AnalyticsRepository(db)
    data = repo.get_content_analytics(content_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")
    return data


@router.get("/campaign/{campaign_id}", response_model=CampaignPerformanceMetric)
def get_campaign_analytics(campaign_id: int, db: Session = Depends(get_db)) -> Any:
    """Fetch per-campaign analytics performance summary."""
    repo = AnalyticsRepository(db)
    data = repo.get_campaign_analytics(campaign_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return data
