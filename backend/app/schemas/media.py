from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MediaBase(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_type: str  # 'image', 'video', 'pdf', 'document'
    mime_type: str
    file_size: int


class MediaResponse(MediaBase):
    id: int
    uploaded_by_id: int
    uploaded_by_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
