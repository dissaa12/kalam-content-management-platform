from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Tag Schemas
class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# SEO Metadata Schemas
class SEOMetadataBase(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: Optional[str] = None
    canonical_url: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    no_index: bool = False


class SEOMetadataCreate(SEOMetadataBase):
    pass


class SEOMetadataResponse(SEOMetadataBase):
    id: int
    content_id: int

    model_config = ConfigDict(from_attributes=True)


# Content Schemas
class ContentBase(BaseModel):
    title: str
    slug: Optional[str] = None
    content_type: str = "blog"
    body: Optional[str] = None
    excerpt: Optional[str] = None
    category_id: Optional[int] = None
    status: str = "draft"
    featured_image: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class ContentCreate(ContentBase):
    tag_names: Optional[List[str]] = []
    seo_metadata: Optional[SEOMetadataCreate] = None


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content_type: Optional[str] = None
    body: Optional[str] = None
    excerpt: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    featured_image: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    tag_names: Optional[List[str]] = None
    seo_metadata: Optional[SEOMetadataCreate] = None


class ContentResponse(BaseModel):
    id: int
    title: str
    slug: str
    content_type: str
    body: Optional[str] = None
    excerpt: Optional[str] = None
    author_id: int
    author_name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    status: str
    featured_image: Optional[str] = None
    tags: List[TagResponse] = []
    seo_metadata: Optional[SEOMetadataResponse] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedContentResponse(BaseModel):
    items: List[ContentResponse]
    total: int
    page: int
    limit: int
    total_pages: int
