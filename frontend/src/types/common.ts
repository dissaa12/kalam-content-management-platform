import { ContentStatus, ContentType } from './content';

export type { ContentStatus, ContentType };

export type UserRole = 'admin' | 'marketing_manager' | 'content_editor' | 'content_author' | 'reviewer';

export interface BaseEntity {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
