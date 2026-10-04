import math
import re
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, or_, desc, asc

from app.models.content import Content
from app.models.category import Category
from app.models.tag import Tag
from app.models.seo_metadata import SEOMetadata
from app.models.user import User
from app.schemas.content import ContentCreate, ContentUpdate, SEOMetadataCreate


def generate_slug(text: str) -> str:
    """Generate clean URL slug from string."""
    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug.strip("-")


class ContentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, content_id: int) -> Optional[Content]:
        return (
            self.db.query(Content)
            .options(
                joinedload(Content.author),
                joinedload(Content.category),
                joinedload(Content.tags),
                joinedload(Content.seo_metadata),
            )
            .filter(Content.id == content_id)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[Content]:
        return (
            self.db.query(Content)
            .options(
                joinedload(Content.author),
                joinedload(Content.category),
                joinedload(Content.tags),
                joinedload(Content.seo_metadata),
            )
            .filter(Content.slug == slug)
            .first()
        )

    def list_content(
        self,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        content_type: Optional[str] = None,
        category_id: Optional[int] = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
    ) -> Tuple[List[Content], int, int]:
        query = self.db.query(Content).options(
            joinedload(Content.author),
            joinedload(Content.category),
            joinedload(Content.tags),
            joinedload(Content.seo_metadata),
        )

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Content.title.ilike(search_pattern),
                    Content.slug.ilike(search_pattern),
                    Content.excerpt.ilike(search_pattern),
                    Content.body.ilike(search_pattern),
                )
            )

        if status:
            query = query.filter(Content.status == status)

        if content_type:
            query = query.filter(Content.content_type == content_type)

        if category_id:
            query = query.filter(Content.category_id == category_id)

        # Count total
        total = query.count()

        # Apply sorting
        sort_column = getattr(Content, sort_by, Content.updated_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        total_pages = math.ceil(total / limit) if limit > 0 else 1

        return items, total, total_pages

    def create(self, data: ContentCreate, author_id: int) -> Content:
        base_slug = data.slug or generate_slug(data.title)
        slug = base_slug
        count = 1
        while self.db.query(Content).filter(Content.slug == slug).first() is not None:
            slug = f"{base_slug}-{count}"
            count += 1

        published_at = datetime.utcnow() if data.status == "published" else None

        content_item = Content(
            title=data.title,
            slug=slug,
            content_type=data.content_type,
            body=data.body,
            excerpt=data.excerpt,
            author_id=author_id,
            category_id=data.category_id,
            status=data.status,
            featured_image=data.featured_image,
            scheduled_at=data.scheduled_at,
            published_at=published_at,
        )

        # Attach Tags
        if data.tag_names:
            for tag_name in data.tag_names:
                t_slug = generate_slug(tag_name)
                tag = self.db.query(Tag).filter(Tag.slug == t_slug).first()
                if not tag:
                    tag = Tag(name=tag_name, slug=t_slug)
                    self.db.add(tag)
                    self.db.commit()
                    self.db.refresh(tag)
                content_item.tags.append(tag)

        # Attach SEO Metadata
        if data.seo_metadata:
            seo = SEOMetadata(
                meta_title=data.seo_metadata.meta_title,
                meta_description=data.seo_metadata.meta_description,
                keywords=data.seo_metadata.keywords,
                canonical_url=data.seo_metadata.canonical_url,
                og_title=data.seo_metadata.og_title,
                og_description=data.seo_metadata.og_description,
                og_image=data.seo_metadata.og_image,
                no_index=data.seo_metadata.no_index,
            )
            content_item.seo_metadata = seo

        self.db.add(content_item)
        self.db.commit()
        self.db.refresh(content_item)
        return self.get_by_id(content_item.id)

    def update(self, content_id: int, data: ContentUpdate) -> Optional[Content]:
        content_item = self.get_by_id(content_id)
        if not content_item:
            return None

        update_dict = data.model_dump(exclude_unset=True)

        if "title" in update_dict and not update_dict.get("slug"):
            # Update slug if title changed and slug not explicitly provided
            base_slug = generate_slug(update_dict["title"])
            slug = base_slug
            count = 1
            while True:
                existing = self.db.query(Content).filter(Content.slug == slug).first()
                if not existing or existing.id == content_id:
                    break
                slug = f"{base_slug}-{count}"
                count += 1
            content_item.slug = slug

        if "status" in update_dict:
            if update_dict["status"] == "published" and not content_item.published_at:
                content_item.published_at = datetime.utcnow()
            content_item.status = update_dict["status"]

        for key, value in update_dict.items():
            if key not in ["tag_names", "seo_metadata", "status"] and hasattr(content_item, key):
                setattr(content_item, key, value)

        # Handle tag updates
        if data.tag_names is not None:
            content_item.tags.clear()
            for tag_name in data.tag_names:
                t_slug = generate_slug(tag_name)
                tag = self.db.query(Tag).filter(Tag.slug == t_slug).first()
                if not tag:
                    tag = Tag(name=tag_name, slug=t_slug)
                    self.db.add(tag)
                    self.db.commit()
                    self.db.refresh(tag)
                content_item.tags.append(tag)

        # Handle SEO Metadata updates
        if data.seo_metadata is not None:
            if content_item.seo_metadata:
                for k, v in data.seo_metadata.model_dump().items():
                    setattr(content_item.seo_metadata, k, v)
            else:
                seo = SEOMetadata(
                    content_id=content_item.id,
                    **data.seo_metadata.model_dump()
                )
                content_item.seo_metadata = seo

        content_item.updated_at = datetime.utcnow()
        self.db.commit()
        return self.get_by_id(content_id)

    def delete(self, content_id: int) -> bool:
        content_item = self.db.query(Content).filter(Content.id == content_id).first()
        if not content_item:
            return False
        self.db.delete(content_item)
        self.db.commit()
        return True
