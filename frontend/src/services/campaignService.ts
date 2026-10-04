import { apiClient } from './apiClient';
import { Campaign, CampaignCreateParams, CampaignUpdateParams } from '../types/campaign';

export interface CampaignFilterParams {
  status?: string;
  campaign_type?: string;
}

export const campaignService = {
  list: async (params: CampaignFilterParams = {}): Promise<Campaign[]> => {
    const response = await apiClient.get<Campaign[]>('/campaigns', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Campaign> => {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  create: async (data: CampaignCreateParams): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>('/campaigns', data);
    return response.data;
  },

  update: async (id: number, data: CampaignUpdateParams): Promise<Campaign> => {
    const response = await apiClient.put<Campaign>(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string; id: number }> => {
    const response = await apiClient.delete<{ message: string; id: number }>(`/campaigns/${id}`);
    return response.data;
  },
};
