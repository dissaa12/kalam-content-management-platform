from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class WorkflowActionRequest(BaseModel):
    action: str  # submit_review, approve, request_changes, reject, schedule, publish, archive
    comment: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class ContentCommentCreate(BaseModel):
    comment: str


class ContentCommentResponse(BaseModel):
    id: int
    content_id: int
    user_id: int
    user_name: str
    user_role: str
    comment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentVersionResponse(BaseModel):
    id: int
    content_id: int
    version_number: int
    author_id: int
    author_name: str
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None
    content_snapshot: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContentActivityResponse(BaseModel):
    id: int
    content_id: int
    user_id: int
    user_name: str
    user_role: str
    action: str
    details: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
