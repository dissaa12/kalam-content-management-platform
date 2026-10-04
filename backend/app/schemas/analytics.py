from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class AnalyticsSummary(BaseModel):
    total_views: int = 0
    avg_engagement: float = 0.0
    avg_ctr: float = 0.0
    total_shares: int = 0
    total_conversions: int = 0
    avg_reading_time: float = 0.0


class ContentPerformanceMetric(BaseModel):
    content_type: str
    views: int
    engagement_rate: float
    ctr: float
    conversions: int


class PublishingTrendMetric(BaseModel):
    date: str
    count: int
    views: int


class CampaignPerformanceMetric(BaseModel):
    campaign_id: int
    campaign_name: str
    budget: float
    conversions: int
    ctr: float
    content_count: int


class EngagementTrendMetric(BaseModel):
    date: str
    engagement_rate: float
    ctr: float


class TopContentMetric(BaseModel):
    id: int
    title: str
    slug: str
    content_type: str
    author_name: str
    views: int
    engagement_rate: float
    ctr: float
    conversions: int
    shares: int
    reading_time: float


class DashboardAnalyticsResponse(BaseModel):
    is_simulated: bool = True
    disclaimer: str = "Displaying simulated enterprise telemetry metrics."
    summary: AnalyticsSummary
    content_performance: List[ContentPerformanceMetric] = []
    publishing_trends: List[PublishingTrendMetric] = []
    campaign_performance: List[CampaignPerformanceMetric] = []
    engagement_trends: List[EngagementTrendMetric] = []
    top_content: List[TopContentMetric] = []

    model_config = ConfigDict(from_attributes=True)
