export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
}

export interface AnalyticsSummary {
  total_views: number;
  avg_engagement: number;
  avg_ctr: number;
  total_shares: number;
  total_conversions: number;
  avg_reading_time: number;
}

export interface ContentPerformanceMetric {
  content_type: string;
  views: number;
  engagement_rate: number;
  ctr: number;
  conversions: number;
}

export interface PublishingTrendMetric {
  date: string;
  count: number;
  views: number;
}

export interface CampaignPerformanceMetric {
  campaign_id: number;
  campaign_name: string;
  budget: number;
  conversions: number;
  ctr: number;
  content_count: number;
}

export interface EngagementTrendMetric {
  date: string;
  engagement_rate: number;
  ctr: number;
}

export interface TopContentMetric {
  id: number;
  title: string;
  slug: string;
  content_type: string;
  author_name: string;
  views: number;
  engagement_rate: number;
  ctr: number;
  conversions: number;
  shares: number;
  reading_time: number;
}

export interface DashboardAnalyticsResponse {
  is_simulated: boolean;
  disclaimer: string;
  summary: AnalyticsSummary;
  content_performance: ContentPerformanceMetric[];
  publishing_trends: PublishingTrendMetric[];
  campaign_performance: CampaignPerformanceMetric[];
  engagement_trends: EngagementTrendMetric[];
  top_content: TopContentMetric[];
}

export interface AnalyticsFilterParams {
  date_range?: string;
  campaign_id?: number;
  content_type?: string;
  author_id?: number;
  category_id?: number;
}
