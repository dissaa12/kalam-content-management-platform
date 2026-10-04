from typing import Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.category import Category
from app.models.tag import Tag
from app.repositories.content_repository import ContentRepository
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    PaginatedContentResponse,
    CategoryResponse,
    TagResponse,
)

router = APIRouter()


def format_content_response(item) -> ContentResponse:
    author_name = f"{item.author.first_name} {item.author.last_name}" if item.author else "Unknown"
    category_name = item.category.name if item.category else None

    return ContentResponse(
        id=item.id,
        title=item.title,
        slug=item.slug,
        content_type=item.content_type,
        body=item.body,
        excerpt=item.excerpt,
        author_id=item.author_id,
        author_name=author_name,
        category_id=item.category_id,
        category_name=category_name,
        status=item.status,
        featured_image=item.featured_image,
        tags=[TagResponse.model_validate(t) for t in item.tags] if item.tags else [],
        seo_metadata=item.seo_metadata,
        created_at=item.created_at,
        updated_at=item.updated_at,
        published_at=item.published_at,
        scheduled_at=item.scheduled_at,
    )


@router.get("/public/list", response_model=PaginatedContentResponse)
def list_public_content(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve published content items for the public website."""
    repo = ContentRepository(db)
    items, total, total_pages = repo.list_content(
        page=page,
        limit=limit,
        search=search,
        status="published",
        content_type=content_type,
        category_id=category_id,
        sort_by="published_at",
        sort_order="desc",
    )
    formatted_items = [format_content_response(item) for item in items]
    return PaginatedContentResponse(
        items=formatted_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/public/{id_or_slug}", response_model=ContentResponse)
def get_public_content(id_or_slug: str, db: Session = Depends(get_db)) -> Any:
    """Retrieve single published content item for the public website (Drafts/Archived return 404)."""
    repo = ContentRepository(db)
    if id_or_slug.isdigit():
        item = repo.get_by_id(int(id_or_slug))
    else:
        item = repo.get_by_slug(id_or_slug)

    if not item or item.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Public article '{id_or_slug}' not found.",
        )
    return format_content_response(item)


@router.get("", response_model=PaginatedContentResponse)
def list_content(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    sort_by: str = Query("updated_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieve paginated list of content items with search and filters."""
    repo = ContentRepository(db)
    items, total, total_pages = repo.list_content(
        page=page,
        limit=limit,
        search=search,
        status=status,
        content_type=content_type,
        category_id=category_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    formatted_items = [format_content_response(item) for item in items]
    return PaginatedContentResponse(
        items=formatted_items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    data: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Create a new marketing content item."""
    repo = ContentRepository(db)
    created_item = repo.create(data, author_id=current_user.id)
    return format_content_response(created_item)


@router.get("/{id_or_slug}", response_model=ContentResponse)
def get_content(id_or_slug: str, db: Session = Depends(get_db)) -> Any:
    """Retrieve single content item by ID or slug."""
    repo = ContentRepository(db)
    if id_or_slug.isdigit():
        item = repo.get_by_id(int(id_or_slug))
    else:
        item = repo.get_by_slug(id_or_slug)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content item '{id_or_slug}' not found.",
        )
    return format_content_response(item)


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: int,
    data: ContentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update existing content item."""
    repo = ContentRepository(db)
    existing = repo.get_by_id(content_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    if current_user.role not in ["admin", "marketing_manager", "content_editor"] and existing.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this content item.",
        )

    updated_item = repo.update(content_id, data)
    return format_content_response(updated_item)


@router.delete("/{content_id}", status_code=status.HTTP_200_OK)
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Delete a content item."""
    repo = ContentRepository(db)
    existing = repo.get_by_id(content_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    if current_user.role not in ["admin", "marketing_manager"] and existing.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this content item.",
        )

    success = repo.delete(content_id)
    return {"message": "Content item deleted successfully", "id": content_id}


@router.get("/categories/list", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)) -> Any:
    categories = db.query(Category).all()
    return categories


@router.get("/tags/list", response_model=List[TagResponse])
def get_tags(db: Session = Depends(get_db)) -> Any:
    tags = db.query(Tag).all()
    return tags
