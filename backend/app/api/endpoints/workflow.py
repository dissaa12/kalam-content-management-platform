from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.repositories.workflow_repository import WorkflowRepository
from app.schemas.workflow import (
    WorkflowActionRequest,
    ContentCommentCreate,
    ContentCommentResponse,
    ContentVersionResponse,
    ContentActivityResponse,
)
from app.schemas.content import ContentResponse
from app.api.endpoints.content import format_content_response

router = APIRouter()


@router.post("/{content_id}/workflow", response_model=ContentResponse)
def execute_workflow_action(
    content_id: int,
    action_req: WorkflowActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Execute enterprise content workflow state transition."""
    content_repo = ContentRepository(db)
    wf_repo = WorkflowRepository(db)

    content = content_repo.get_by_id(content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content item not found")

    action = action_req.action.lower()
    role = current_user.role

    # Authorization & Transition Rules
    if action in ["submit_review", "submit_for_review"]:
        # Authors / Editors / Managers can submit for review
        content.status = "in_review"
        wf_repo.log_activity(content.id, current_user.id, "submitted", "Submitted content for editorial review")

    elif action == "approve":
        # Reviewer / Editor / Manager / Admin can approve. Author CANNOT approve own content.
        if role not in ["admin", "marketing_manager", "content_editor", "reviewer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role 'content_author' is not authorized to approve content.",
            )
        content.status = "approved"
        wf_repo.log_activity(content.id, current_user.id, "approved", "Approved content item")

    elif action in ["request_changes", "reject"]:
        # Reviewer / Editor / Manager / Admin can request changes
        if role not in ["admin", "marketing_manager", "content_editor", "reviewer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role is not authorized to request revisions.",
            )
        content.status = "changes_requested"
        wf_repo.log_activity(content.id, current_user.id, "rejected", action_req.comment or "Changes requested by reviewer")

    elif action == "schedule":
        # Manager / Admin can schedule
        if role not in ["admin", "marketing_manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Marketing Managers and Administrators can schedule content publications.",
            )
        content.status = "scheduled"
        if action_req.scheduled_at:
            content.scheduled_at = action_req.scheduled_at
        wf_repo.log_activity(content.id, current_user.id, "scheduled", f"Scheduled for {content.scheduled_at}")

    elif action == "publish":
        # Manager / Admin can publish directly
        if role not in ["admin", "marketing_manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Marketing Managers and Administrators can publish content.",
            )
        content.status = "published"
        content.published_at = datetime.utcnow()
        wf_repo.log_activity(content.id, current_user.id, "published", "Published to live production channels")

    elif action == "archive":
        if role not in ["admin", "marketing_manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Marketing Managers and Administrators can archive content.",
            )
        content.status = "archived"
        wf_repo.log_activity(content.id, current_user.id, "archived", "Archived content item")

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid workflow action '{action}'")

    # Add optional reviewer comment
    if action_req.comment:
        wf_repo.add_comment(content.id, current_user.id, action_req.comment)

    # Save version snapshot on workflow state change
    wf_repo.create_version_snapshot(content, current_user.id)

    db.commit()
    db.refresh(content)
    return format_content_response(content)


# Comments Endpoints
@router.get("/{content_id}/comments", response_model=List[ContentCommentResponse])
def get_content_comments(content_id: int, db: Session = Depends(get_db)) -> Any:
    wf_repo = WorkflowRepository(db)
    comments = wf_repo.get_comments(content_id)
    return [
        ContentCommentResponse(
            id=c.id,
            content_id=c.content_id,
            user_id=c.user_id,
            user_name=f"{c.user.first_name} {c.user.last_name}",
            user_role=c.user.role,
            comment=c.comment,
            created_at=c.created_at,
        )
        for c in comments
    ]


@router.post("/{content_id}/comments", response_model=ContentCommentResponse, status_code=status.HTTP_201_CREATED)
def post_content_comment(
    content_id: int,
    req: ContentCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    content_repo = ContentRepository(db)
    if not content_repo.get_by_id(content_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    wf_repo = WorkflowRepository(db)
    comment = wf_repo.add_comment(content_id, current_user.id, req.comment)
    return ContentCommentResponse(
        id=comment.id,
        content_id=comment.content_id,
        user_id=comment.user_id,
        user_name=f"{current_user.first_name} {current_user.last_name}",
        user_role=current_user.role,
        comment=comment.comment,
        created_at=comment.created_at,
    )


# Version History Endpoints
@router.get("/{content_id}/versions", response_model=List[ContentVersionResponse])
def get_content_versions(content_id: int, db: Session = Depends(get_db)) -> Any:
    wf_repo = WorkflowRepository(db)
    versions = wf_repo.get_versions(content_id)
    return [
        ContentVersionResponse(
            id=v.id,
            content_id=v.content_id,
            version_number=v.version_number,
            author_id=v.author_id,
            author_name=f"{v.author.first_name} {v.author.last_name}" if v.author else "Unknown",
            title=v.title,
            excerpt=v.excerpt,
            body=v.body,
            content_snapshot=v.content_snapshot,
            created_at=v.created_at,
        )
        for v in versions
    ]


@router.post("/{content_id}/versions/{version_number}/restore", response_model=ContentResponse)
def restore_content_version(
    content_id: int,
    version_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    content_repo = ContentRepository(db)
    content = content_repo.get_by_id(content_id)
    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    wf_repo = WorkflowRepository(db)
    try:
        restored = wf_repo.restore_version(content, version_number, current_user)
        return format_content_response(restored)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Activity Log Timeline Endpoints
@router.get("/{content_id}/activities", response_model=List[ContentActivityResponse])
def get_content_activities(content_id: int, db: Session = Depends(get_db)) -> Any:
    wf_repo = WorkflowRepository(db)
    activities = wf_repo.get_activities(content_id)
    return [
        ContentActivityResponse(
            id=a.id,
            content_id=a.content_id,
            user_id=a.user_id,
            user_name=f"{a.user.first_name} {a.user.last_name}" if a.user else "System",
            user_role=a.user.role if a.user else "system",
            action=a.action,
            details=a.details,
            timestamp=a.timestamp,
        )
        for a in activities
    ]
