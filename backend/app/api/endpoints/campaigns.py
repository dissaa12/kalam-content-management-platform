from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.campaign_repository import CampaignRepository
from app.api.endpoints.content import format_content_response
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignResponse,
    CalendarEventResponse,
)

router = APIRouter()


def format_campaign_response(campaign, metrics=None) -> CampaignResponse:
    owner_name = f"{campaign.owner.first_name} {campaign.owner.last_name}" if campaign.owner else "Unknown"
    contents = [format_content_response(c) for c in campaign.contents] if campaign.contents else []

    return CampaignResponse(
        id=campaign.id,
        name=campaign.name,
        description=campaign.description,
        objective=campaign.objective,
        target_audience=campaign.target_audience,
        campaign_type=campaign.campaign_type,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        budget=campaign.budget,
        owner_id=campaign.owner_id,
        owner_name=owner_name,
        status=campaign.status,
        metrics=metrics,
        contents=contents,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


@router.get("", response_model=List[CampaignResponse])
def list_campaigns(
    status: Optional[str] = Query(None),
    campaign_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """List all marketing campaigns with status & type filtering."""
    repo = CampaignRepository(db)
    campaigns = repo.list_campaigns(status=status, campaign_type=campaign_type)
    return [format_campaign_response(c, metrics=repo.get_campaign_metrics(c.id)) for c in campaigns]


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    data: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Create a new marketing campaign."""
    if current_user.role not in ["admin", "marketing_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Marketing Managers and Administrators can create campaigns.",
        )

    repo = CampaignRepository(db)
    campaign = repo.create(data, owner_id=current_user.id)
    metrics = repo.get_campaign_metrics(campaign.id)
    return format_campaign_response(campaign, metrics=metrics)


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)) -> Any:
    """Retrieve campaign details, associated content items, and performance metrics."""
    repo = CampaignRepository(db)
    campaign = repo.get_by_id(campaign_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    metrics = repo.get_campaign_metrics(campaign.id)
    return format_campaign_response(campaign, metrics=metrics)


@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: int,
    data: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update campaign details and status."""
    repo = CampaignRepository(db)
    existing = repo.get_by_id(campaign_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")

    if current_user.role not in ["admin", "marketing_manager"] and existing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit campaign.")

    updated = repo.update(campaign_id, data)
    metrics = repo.get_campaign_metrics(updated.id)
    return format_campaign_response(updated, metrics=metrics)


@router.delete("/{campaign_id}", status_code=status.HTTP_200_OK)
def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Delete marketing campaign."""
    if current_user.role not in ["admin", "marketing_manager"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete campaign.")

    repo = CampaignRepository(db)
    success = repo.delete(campaign_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return {"message": "Campaign deleted successfully", "id": campaign_id}
