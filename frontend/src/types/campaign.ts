import { ContentItem } from './content';

export interface CampaignMetrics {
  total_content: number;
  published_count: number;
  scheduled_count: number;
  engagement_score: number;
  ctr_percentage: number;
  conversions_count: number;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  objective?: string;
  target_audience?: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  budget: number;
  owner_id: number;
  owner_name: string;
  status: 'planning' | 'draft' | 'active' | 'paused' | 'completed';
  metrics?: CampaignMetrics;
  contents?: ContentItem[];
  created_at: string;
  updated_at: string;
}

export interface CampaignCreateParams {
  name: string;
  description?: string;
  objective?: string;
  target_audience?: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status?: string;
}

export interface CampaignUpdateParams {
  name?: string;
  description?: string;
  objective?: string;
  target_audience?: string;
  campaign_type?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: string;
}
