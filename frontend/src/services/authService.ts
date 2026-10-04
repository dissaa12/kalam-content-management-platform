import { apiClient } from './apiClient';
import { UserRole } from '../types/common';

export interface UserProfile {
  id: number | string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  changePassword: async (current_password: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },
};
