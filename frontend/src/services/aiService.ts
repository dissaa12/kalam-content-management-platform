import { apiClient } from './apiClient';
import { AIRequestParams, AIResponseData } from '../types/ai';

export const aiService = {
  generate: async (params: AIRequestParams): Promise<AIResponseData> => {
    const response = await apiClient.post<AIResponseData>('/ai/generate', params);
    return response.data;
  },
};
