import { apiClient } from './apiClient';
import { MediaItem, MediaFilterParams } from '../types/media';

export const mediaService = {
  list: async (params: MediaFilterParams = {}): Promise<MediaItem[]> => {
    const response = await apiClient.get<MediaItem[]>('/media', { params });
    return response.data;
  },

  upload: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<MediaItem>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await apiClient.delete<{ message: string; id: number }>(`/media/${id}`);
    return response.data;
  },
};
