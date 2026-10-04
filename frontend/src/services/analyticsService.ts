import { apiClient } from './apiClient';
import {
  DashboardAnalyticsResponse,
  AnalyticsFilterParams,
  TopContentMetric,
  CampaignPerformanceMetric,
} from '../types/analytics';

export const analyticsService = {
  getDashboardAnalytics: async (params: AnalyticsFilterParams = {}): Promise<DashboardAnalyticsResponse> => {
    const response = await apiClient.get<DashboardAnalyticsResponse>('/analytics/dashboard', { params });
    return response.data;
  },

  getContentAnalytics: async (contentId: number): Promise<TopContentMetric> => {
    const response = await apiClient.get<TopContentMetric>(`/analytics/content/${contentId}`);
    return response.data;
  },

  getCampaignAnalytics: async (campaignId: number): Promise<CampaignPerformanceMetric> => {
    const response = await apiClient.get<CampaignPerformanceMetric>(`/analytics/campaign/${campaignId}`);
    return response.data;
  },
};
