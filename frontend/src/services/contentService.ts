import { apiClient } from './apiClient';
import {
  ContentItem,
  PaginatedContentResponse,
  ContentCreateParams,
  ContentUpdateParams,
  Category,
  Tag,
} from '../types/content';

export interface ContentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  content_type?: string;
  category_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const contentService = {
  list: async (params: ContentFilterParams = {}): Promise<PaginatedContentResponse> => {
    const response = await apiClient.get<PaginatedContentResponse>('/content', { params });
    return response.data;
  },

  listPublic: async (params: ContentFilterParams = {}): Promise<PaginatedContentResponse> => {
    const response = await apiClient.get<PaginatedContentResponse>('/content/public/list', { params });
    return response.data;
  },

  getById: async (idOrSlug: string | number): Promise<ContentItem> => {
    const response = await apiClient.get<ContentItem>(`/content/${idOrSlug}`);
    return response.data;
  },

  getPublicBySlug: async (idOrSlug: string | number): Promise<ContentItem> => {
    const response = await apiClient.get<ContentItem>(`/content/public/${idOrSlug}`);
    return response.data;
  },

  create: async (data: ContentCreateParams): Promise<ContentItem> => {
    const response = await apiClient.post<ContentItem>('/content', data);
    return response.data;
  },

  update: async (id: number, data: ContentUpdateParams): Promise<ContentItem> => {
    const response = await apiClient.put<ContentItem>(`/content/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await apiClient.delete<{ message: string; id: number }>(`/content/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/content/categories/list');
    return response.data;
  },

  getTags: async (): Promise<Tag[]> => {
    const response = await apiClient.get<Tag[]>('/content/tags/list');
    return response.data;
  },
};
