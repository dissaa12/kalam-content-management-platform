from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.content import ContentResponse


class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    campaign_type: str = "product_launch"
    start_date: datetime
    end_date: datetime
    budget: float = 0.0
    status: str = "planning"


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    campaign_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[float] = None
    status: Optional[str] = None


class CampaignMetricsResponse(BaseModel):
    total_content: int = 0
    published_count: int = 0
    scheduled_count: int = 0
    engagement_score: float = 88.5
    ctr_percentage: float = 4.2
    conversions_count: int = 1420


class CampaignResponse(CampaignBase):
    id: int
    owner_id: int
    owner_name: str
    metrics: Optional[CampaignMetricsResponse] = None
    contents: Optional[List[ContentResponse]] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CalendarEventResponse(BaseModel):
    id: int
    title: str
    slug: str
    content_type: str
    status: str
    scheduled_at: datetime
    published_at: Optional[datetime] = None
    author_name: str
    campaign_id: Optional[int] = None
    campaign_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
