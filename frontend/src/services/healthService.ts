import { apiClient } from './apiClient';

export interface HealthCheckResponse {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database_status: string;
  timestamp: string;
}

export const fetchHealthStatus = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};
