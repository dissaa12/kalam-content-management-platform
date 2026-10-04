from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_, and_, desc, asc

from app.models.campaign import Campaign
from app.models.content import Content
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignMetricsResponse


class CampaignRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, campaign_id: int) -> Optional[Campaign]:
        return (
            self.db.query(Campaign)
            .options(
                joinedload(Campaign.owner),
                joinedload(Campaign.contents).joinedload(Content.author),
                joinedload(Campaign.contents).joinedload(Content.category),
            )
            .filter(Campaign.id == campaign_id)
            .first()
        )

    def list_campaigns(
        self,
        status: Optional[str] = None,
        campaign_type: Optional[str] = None,
    ) -> List[Campaign]:
        query = self.db.query(Campaign).options(
            joinedload(Campaign.owner),
            joinedload(Campaign.contents),
        )

        if status:
            query = query.filter(Campaign.status == status)

        if campaign_type:
            query = query.filter(Campaign.campaign_type == campaign_type)

        return query.order_by(desc(Campaign.updated_at)).all()

    def get_campaign_metrics(self, campaign_id: int) -> CampaignMetricsResponse:
        contents = self.db.query(Content).filter(Content.campaign_id == campaign_id).all()
        total_content = len(contents)
        published_count = sum(1 for c in contents if c.status == "published")
        scheduled_count = sum(1 for c in contents if c.status == "scheduled")

        # Demo analytics calculations based on content count
        engagement_score = min(98.5, round(70.0 + (published_count * 5.2), 1))
        ctr_percentage = round(3.2 + (published_count * 0.4), 1)
        conversions_count = published_count * 340 + 120

        return CampaignMetricsResponse(
            total_content=total_content,
            published_count=published_count,
            scheduled_count=scheduled_count,
            engagement_score=engagement_score,
            ctr_percentage=ctr_percentage,
            conversions_count=conversions_count,
        )

    def create(self, data: CampaignCreate, owner_id: int) -> Campaign:
        campaign = Campaign(
            name=data.name,
            description=data.description,
            objective=data.objective,
            target_audience=data.target_audience,
            campaign_type=data.campaign_type,
            start_date=data.start_date,
            end_date=data.end_date,
            budget=data.budget,
            owner_id=owner_id,
            status=data.status,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return self.get_by_id(campaign.id)

    def update(self, campaign_id: int, data: CampaignUpdate) -> Optional[Campaign]:
        campaign = self.get_by_id(campaign_id)
        if not campaign:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if hasattr(campaign, key):
                setattr(campaign, key, value)

        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        return self.get_by_id(campaign_id)

    def delete(self, campaign_id: int) -> bool:
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return False
        
        # Disassociate content items before delete
        self.db.query(Content).filter(Content.campaign_id == campaign_id).update({"campaign_id": None})
        self.db.delete(campaign)
        self.db.commit()
        return True

    def get_calendar_events(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        campaign_id: Optional[int] = None,
        content_type: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Content]:
        query = self.db.query(Content).options(
            joinedload(Content.author),
            joinedload(Content.campaign),
        )

        # Include items with scheduled_at OR published_at date
        date_filter = or_(Content.scheduled_at.isnot(None), Content.published_at.isnot(None))
        query = query.filter(date_filter)

        if start_date:
            query = query.filter(or_(Content.scheduled_at >= start_date, Content.published_at >= start_date))
        if end_date:
            query = query.filter(or_(Content.scheduled_at <= end_date, Content.published_at <= end_date))

        if campaign_id:
            query = query.filter(Content.campaign_id == campaign_id)
        if content_type:
            query = query.filter(Content.content_type == content_type)
        if status:
            query = query.filter(Content.status == status)

        return query.order_by(asc(Content.scheduled_at)).all()

    def reschedule_content(self, content_id: int, new_scheduled_at: datetime) -> Optional[Content]:
        content = self.db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return None

        content.scheduled_at = new_scheduled_at
        if content.status in ["draft", "in_review", "approved"]:
            content.status = "scheduled"
        content.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(content)
        return content
