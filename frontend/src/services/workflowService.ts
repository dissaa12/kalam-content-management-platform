import { apiClient } from './apiClient';
import { ContentItem } from '../types/content';
import { ContentComment, ContentVersion, ContentActivity, WorkflowActionType } from '../types/workflow';

export const workflowService = {
  executeAction: async (
    contentId: number,
    action: WorkflowActionType,
    comment?: string,
    scheduledAt?: string
  ): Promise<ContentItem> => {
    const response = await apiClient.post<ContentItem>(`/content/${contentId}/workflow`, {
      action,
      comment,
      scheduled_at: scheduledAt,
    });
    return response.data;
  },

  getComments: async (contentId: number): Promise<ContentComment[]> => {
    const response = await apiClient.get<ContentComment[]>(`/content/${contentId}/comments`);
    return response.data;
  },

  addComment: async (contentId: number, comment: string): Promise<ContentComment> => {
    const response = await apiClient.post<ContentComment>(`/content/${contentId}/comments`, { comment });
    return response.data;
  },

  getVersions: async (contentId: number): Promise<ContentVersion[]> => {
    const response = await apiClient.get<ContentVersion[]>(`/content/${contentId}/versions`);
    return response.data;
  },

  restoreVersion: async (contentId: number, versionNumber: number): Promise<ContentItem> => {
    const response = await apiClient.post<ContentItem>(`/content/${contentId}/versions/${versionNumber}/restore`);
    return response.data;
  },

  getActivities: async (contentId: number): Promise<ContentActivity[]> => {
    const response = await apiClient.get<ContentActivity[]>(`/content/${contentId}/activities`);
    return response.data;
  },
};
