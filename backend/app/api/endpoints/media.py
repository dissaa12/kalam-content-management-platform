import os
import uuid
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.media_repository import MediaRepository
from app.schemas.media import MediaResponse

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "image": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    "video": [".mp4", ".webm", ".mov", ".avi", ".mkv"],
    "pdf": [".pdf"],
    "document": [".doc", ".docx", ".txt", ".csv", ".xlsx", ".pptx"],
}

MAX_FILE_SIZES = {
    "image": 15 * 1024 * 1024,
    "video": 50 * 1024 * 1024,
    "pdf": 15 * 1024 * 1024,
    "document": 15 * 1024 * 1024,
}


def get_file_category_and_extension(filename: str):
    ext = os.path.splitext(filename)[1].lower()
    for cat, exts in ALLOWED_EXTENSIONS.items():
        if ext in exts:
            return cat, ext
    return None, ext


def format_media_response(media) -> MediaResponse:
    uploader_name = f"{media.uploaded_by.first_name} {media.uploaded_by.last_name}" if media.uploaded_by else "Unknown"
    return MediaResponse(
        id=media.id,
        filename=media.filename,
        original_filename=media.original_filename,
        file_path=media.file_path,
        file_type=media.file_type,
        mime_type=media.mime_type,
        file_size=media.file_size,
        uploaded_by_id=media.uploaded_by_id,
        uploaded_by_name=uploader_name,
        created_at=media.created_at,
        updated_at=media.updated_at,
    )


@router.get("", response_model=List[MediaResponse])
def list_media(
    search: Optional[str] = Query(None),
    file_type: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
) -> Any:
    """List media assets with filtering, search, and sorting."""
    repo = MediaRepository(db)
    items = repo.list_media(search=search, file_type=file_type, sort_by=sort_by, sort_order=sort_order)
    return [format_media_response(m) for m in items]


@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Upload media file (Image, Video, PDF, Document) with validation."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    file_category, ext = get_file_category_and_extension(file.filename)
    if not file_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed extensions: Images, Videos, PDFs, Documents.",
        )

    # Read content to measure size
    contents = await file.read()
    file_size = len(contents)

    max_allowed = MAX_FILE_SIZES.get(file_category, 15 * 1024 * 1024)
    if file_size > max_allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum limit of {max_allowed // (1024 * 1024)}MB for {file_category}s.",
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    web_path = f"/uploads/{unique_filename}"
    mime_type = file.content_type or "application/octet-stream"

    repo = MediaRepository(db)
    media = repo.create(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=web_path,
        file_type=file_category,
        mime_type=mime_type,
        file_size=file_size,
        uploaded_by_id=current_user.id,
    )

    return format_media_response(media)


@router.delete("/{media_id}", status_code=status.HTTP_200_OK)
def delete_media(
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Delete media file from storage and database."""
    repo = MediaRepository(db)
    media = repo.get_by_id(media_id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")

    # Delete physical file
    file_disk_path = os.path.join(UPLOAD_DIR, media.filename)
    if os.path.exists(file_disk_path):
        try:
            os.remove(file_disk_path)
        except Exception:
            pass

    repo.delete(media_id)
    return {"message": "Media asset deleted successfully", "id": media_id}
