export type ContentType =
  | 'blog'
  | 'landing_page'
  | 'email'
  | 'social_post'
  | 'advertisement'
  | 'case_study'
  | 'announcement';

export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export interface SEOMetadata {
  id?: number;
  content_id?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  no_index?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ContentItem {
  id: number;
  title: string;
  slug: string;
  content_type: ContentType;
  body?: string;
  excerpt?: string;
  author_id: number;
  author_name: string;
  category_id?: number;
  category_name?: string;
  status: ContentStatus;
  featured_image?: string;
  tags: Tag[];
  seo_metadata?: SEOMetadata;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_at?: string;
}

export interface PaginatedContentResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ContentCreateParams {
  title: string;
  slug?: string;
  content_type: ContentType;
  body?: string;
  excerpt?: string;
  category_id?: number;
  status?: ContentStatus;
  featured_image?: string;
  scheduled_at?: string;
  tag_names?: string[];
  seo_metadata?: SEOMetadata;
}

export interface ContentUpdateParams extends Partial<ContentCreateParams> {}
