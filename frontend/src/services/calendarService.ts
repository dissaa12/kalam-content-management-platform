import { apiClient } from './apiClient';
import { CalendarEvent, CalendarFilterParams } from '../types/calendar';
import { ContentItem } from '../types/content';

export const calendarService = {
  getEvents: async (params: CalendarFilterParams = {}): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<CalendarEvent[]>('/calendar/events', { params });
    return response.data;
  },

  reschedule: async (contentId: number, scheduledAt: string): Promise<ContentItem> => {
    const response = await apiClient.put<ContentItem>(`/calendar/reschedule/${contentId}`, {
      scheduled_at: scheduledAt,
    });
    return response.data;
  },
};
