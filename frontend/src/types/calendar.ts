export interface CalendarEvent {
  id: number;
  title: string;
  slug: string;
  content_type: string;
  status: string;
  scheduled_at: string;
  published_at?: string;
  author_name: string;
  campaign_id?: number;
  campaign_name?: string;
}

export interface CalendarFilterParams {
  start_date?: string;
  end_date?: string;
  campaign_id?: number;
  content_type?: string;
  status?: string;
}
