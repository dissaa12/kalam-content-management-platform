from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import AIRequest, AIResponse
from app.services.ai_service import get_ai_service

router = APIRouter()

ALLOWED_ACTIONS = [
    "generate_headlines",
    "generate_meta_description",
    "rewrite",
    "change_tone",
    "summarize",
    "social_caption",
    "suggest_keywords",
    "generate_outline",
    "generate_cta",
    "readability_analysis",
]


@router.post("/generate", response_model=AIResponse, status_code=status.HTTP_200_OK)
def generate_ai_assistance(
    req: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Generate AI content assistance (headlines, meta descriptions, rewrites, readability, social captions, etc.)."""
    if not req.action:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="AI action is required.")

    if req.action.lower() not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid AI action '{req.action}'. Allowed actions: {', '.join(ALLOWED_ACTIONS)}",
        )

    ai_service = get_ai_service()
    try:
        response = ai_service.process_request(req)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed: {str(e)}",
        )
