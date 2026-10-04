from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.campaign_repository import CampaignRepository
from app.schemas.campaign import CalendarEventResponse
from app.schemas.content import ContentResponse
from app.api.endpoints.content import format_content_response

router = APIRouter()


class RescheduleRequest(BaseModel):
    scheduled_at: datetime


@router.get("/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    campaign_id: Optional[int] = Query(None),
    content_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """Fetch scheduled content events for editorial calendar grid."""
    repo = CampaignRepository(db)
    contents = repo.get_calendar_events(
        start_date=start_date,
        end_date=end_date,
        campaign_id=campaign_id,
        content_type=content_type,
        status=status,
    )

    events = []
    for c in contents:
        author_name = f"{c.author.first_name} {c.author.last_name}" if c.author else "Unknown"
        campaign_name = c.campaign.name if c.campaign else None
        event_date = c.scheduled_at or c.published_at

        events.append(
            CalendarEventResponse(
                id=c.id,
                title=c.title,
                slug=c.slug,
                content_type=c.content_type,
                status=c.status,
                scheduled_at=event_date,
                published_at=c.published_at,
                author_name=author_name,
                campaign_id=c.campaign_id,
                campaign_name=campaign_name,
            )
        )
    return events


@router.put("/reschedule/{content_id}", response_model=ContentResponse)
def reschedule_content_event(
    content_id: int,
    req: RescheduleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update content publication scheduled date (drag-and-drop or date picker)."""
    repo = CampaignRepository(db)
    updated_content = repo.reschedule_content(content_id, req.scheduled_at)
    if not updated_content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    return format_content_response(updated_content)
