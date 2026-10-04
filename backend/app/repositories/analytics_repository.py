import random
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.content import Content
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummary,
    ContentPerformanceMetric,
    PublishingTrendMetric,
    CampaignPerformanceMetric,
    EngagementTrendMetric,
    TopContentMetric,
    DashboardAnalyticsResponse,
)


class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_analytics(
        self,
        date_range: str = "last_30_days",
        campaign_id: Optional[int] = None,
        content_type: Optional[str] = None,
        author_id: Optional[int] = None,
        category_id: Optional[int] = None,
    ) -> DashboardAnalyticsResponse:
        query = self.db.query(Content)

        if campaign_id and campaign_id != 0:
            query = query.filter(Content.campaign_id == campaign_id)

        if content_type and content_type != "all":
            query = query.filter(Content.content_type == content_type)

        if author_id and author_id != 0:
            query = query.filter(Content.author_id == author_id)

        if category_id and category_id != 0:
            query = query.filter(Content.category_id == category_id)

        contents = query.all()
        content_count = len(contents)

        # Calculate realistic base metrics
        base_views_per_item = 3450
        total_views = sum([c.id * 120 + base_views_per_item for c in contents]) if content_count > 0 else 18450
        avg_engagement = 8.4 if content_count > 0 else 6.2
        avg_ctr = 4.2 if content_count > 0 else 3.8
        total_shares = int(total_views * 0.12)
        total_conversions = int(total_views * (avg_ctr / 100) * 0.45)
        avg_reading_time = 3.5

        summary = AnalyticsSummary(
            total_views=total_views,
            avg_engagement=avg_engagement,
            avg_ctr=avg_ctr,
            total_shares=total_shares,
            total_conversions=total_conversions,
            avg_reading_time=avg_reading_time,
        )

        # 1. Content Performance by Type
        types = ["blog", "landing_page", "email", "social_post", "advertisement", "case_study", "announcement"]
        content_performance: List[ContentPerformanceMetric] = []
        for t in types:
            t_count = len([c for c in contents if c.content_type == t])
            views = (t_count * 4200) + random.randint(1200, 3500) if t_count > 0 else random.randint(800, 2500)
            eng = round(random.uniform(5.5, 9.8), 1)
            ctr = round(random.uniform(3.1, 5.9), 1)
            convs = int(views * (ctr / 100) * 0.4)
            content_performance.append(
                ContentPerformanceMetric(
                    content_type=t,
                    views=views,
                    engagement_rate=eng,
                    ctr=ctr,
                    conversions=convs,
                )
            )

        # 2. Publishing Trends (Last 7 intervals)
        publishing_trends: List[PublishingTrendMetric] = []
        now = datetime.utcnow()
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i * 4)).strftime("%b %d")
            p_count = random.randint(2, 8)
            p_views = p_count * random.randint(800, 1600)
            publishing_trends.append(
                PublishingTrendMetric(
                    date=day_date,
                    count=p_count,
                    views=p_views,
                )
            )

        # 3. Campaign Performance
        campaigns = self.db.query(Campaign).all()
        campaign_performance: List[CampaignPerformanceMetric] = []
        for cmp in campaigns:
            c_contents = [c for c in contents if c.campaign_id == cmp.id]
            convs = random.randint(180, 520) if len(c_contents) > 0 else random.randint(90, 240)
            ctr = round(random.uniform(3.8, 6.2), 1)
            campaign_performance.append(
                CampaignPerformanceMetric(
                    campaign_id=cmp.id,
                    campaign_name=cmp.name,
                    budget=cmp.budget or 10000,
                    conversions=convs,
                    ctr=ctr,
                    content_count=len(c_contents),
                )
            )

        # 4. Engagement Trends over time
        engagement_trends: List[EngagementTrendMetric] = []
        for i in range(6, -1, -1):
            d_date = (now - timedelta(days=i * 3)).strftime("%b %d")
            eng_val = round(7.0 + (i * 0.3) + random.uniform(-0.4, 0.4), 1)
            ctr_val = round(3.5 + (i * 0.2) + random.uniform(-0.2, 0.2), 1)
            engagement_trends.append(
                EngagementTrendMetric(
                    date=d_date,
                    engagement_rate=eng_val,
                    ctr=ctr_val,
                )
            )

        # 5. Top Content Ranking
        top_content: List[TopContentMetric] = []
        sorted_contents = sorted(contents, key=lambda c: c.id, reverse=True)[:8]
        for c in sorted_contents:
            author_name = f"{c.author.first_name} {c.author.last_name}" if c.author else "Enterprise Author"
            c_views = (c.id * 850) + 2400
            c_eng = round(7.2 + (c.id % 3) * 0.8, 1)
            c_ctr = round(3.8 + (c.id % 2) * 0.9, 1)
            c_convs = int(c_views * (c_ctr / 100) * 0.4)
            c_shares = int(c_views * 0.08)
            c_reading_time = round(2.5 + (len(c.body or "") / 800), 1)

            top_content.append(
                TopContentMetric(
                    id=c.id,
                    title=c.title,
                    slug=c.slug,
                    content_type=c.content_type,
                    author_name=author_name,
                    views=c_views,
                    engagement_rate=c_eng,
                    ctr=c_ctr,
                    conversions=c_convs,
                    shares=c_shares,
                    reading_time=c_reading_time,
                )
            )

        return DashboardAnalyticsResponse(
            is_simulated=True,
            disclaimer="Displaying simulated enterprise telemetry metrics.",
            summary=summary,
            content_performance=content_performance,
            publishing_trends=publishing_trends,
            campaign_performance=campaign_performance,
            engagement_trends=engagement_trends,
            top_content=top_content,
        )

    def get_content_analytics(self, content_id: int) -> Optional[TopContentMetric]:
        c = self.db.query(Content).filter(Content.id == content_id).first()
        if not c:
            return None

        author_name = f"{c.author.first_name} {c.author.last_name}" if c.author else "Enterprise Author"
        c_views = (c.id * 850) + 3200
        c_eng = 8.5
        c_ctr = 4.6
        c_convs = int(c_views * (c_ctr / 100) * 0.45)
        c_shares = int(c_views * 0.1)
        c_reading_time = round(2.5 + (len(c.body or "") / 800), 1)

        return TopContentMetric(
            id=c.id,
            title=c.title,
            slug=c.slug,
            content_type=c.content_type,
            author_name=author_name,
            views=c_views,
            engagement_rate=c_eng,
            ctr=c_ctr,
            conversions=c_convs,
            shares=c_shares,
            reading_time=c_reading_time,
        )

    def get_campaign_analytics(self, campaign_id: int) -> Optional[CampaignPerformanceMetric]:
        cmp = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not cmp:
            return None

        contents = self.db.query(Content).filter(Content.campaign_id == campaign_id).all()
        convs = 480 if len(contents) > 0 else 120
        ctr = 5.2

        return CampaignPerformanceMetric(
            campaign_id=cmp.id,
            campaign_name=cmp.name,
            budget=cmp.budget or 10000,
            conversions=convs,
            ctr=ctr,
            content_count=len(contents),
        )
