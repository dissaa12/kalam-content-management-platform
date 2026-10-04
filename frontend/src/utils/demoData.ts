import { ContentItem } from '../types/content';
import { ActivityLog } from '../types/user';
import { ChartDataPoint } from '../types/analytics';

export const IS_DEMO_DATA = true;

export const DEMO_STATS = {
  totalContent: 1248,
  published: 842,
  drafts: 186,
  pendingReview: 64,
  scheduled: 156,
  activeCampaigns: 14,
};

export const DEMO_RECENT_ACTIVITY: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'u-1',
    userName: 'Sarah Jenkins',
    userRole: 'marketing_manager',
    action: 'Published article',
    entityType: 'content',
    entityName: 'Q4 Product Launch Announcement & Strategy',
    timestamp: '10 minutes ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    userId: 'u-2',
    userName: 'Alex Rivera',
    userRole: 'content_editor',
    action: 'Approved draft',
    entityType: 'content',
    entityName: 'Top 10 Enterprise AI Trends for 2026',
    timestamp: '42 minutes ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'act-3',
    userId: 'u-3',
    userName: 'Devon Vance',
    userRole: 'content_author',
    action: 'Submitted for review',
    entityType: 'content',
    entityName: 'Building Resilient Content Infrastructure at Scale',
    timestamp: '2 hours ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEMO_UPCOMING_CONTENT: ContentItem[] = [
  {
    id: 101,
    title: 'Q4 B2B SaaS Growth & Acquisition Playbook',
    slug: 'q4-b2b-saas-growth-playbook',
    content_type: 'blog',
    status: 'scheduled',
    author_id: 3,
    author_name: 'Devon Vance',
    category_name: 'Whitepapers',
    scheduled_at: new Date().toISOString(),
    tags: [
      { id: 1, name: 'SaaS', slug: 'saas' },
      { id: 2, name: 'B2B', slug: 'b2b' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 102,
    title: 'Demystifying Generative AI Workflows for Marketers',
    slug: 'demystifying-gen-ai-marketing-workflows',
    content_type: 'blog',
    status: 'in_review',
    author_id: 1,
    author_name: 'Sarah Jenkins',
    category_name: 'Blog Posts',
    scheduled_at: new Date().toISOString(),
    tags: [{ id: 3, name: 'AI', slug: 'ai' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 103,
    title: 'Customer Success Case Study: Acme Corp Scaling 300%',
    slug: 'case-study-acme-corp-scaling-300-percent',
    content_type: 'case_study',
    status: 'scheduled',
    author_id: 2,
    author_name: 'Alex Rivera',
    category_name: 'Case Studies',
    scheduled_at: new Date().toISOString(),
    tags: [{ id: 4, name: 'Case Study', slug: 'case-study' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_TOP_PERFORMING_CONTENT: ContentItem[] = [
  {
    id: 201,
    title: '2026 Enterprise Content Strategy Guide',
    slug: '2026-enterprise-content-strategy-guide',
    content_type: 'blog',
    status: 'published',
    author_id: 1,
    author_name: 'Sarah Jenkins',
    category_name: 'Guides',
    published_at: new Date().toISOString(),
    tags: [{ id: 5, name: 'Strategy', slug: 'strategy' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 202,
    title: 'Why Automated Content Governance Matters in Regulated Tech',
    slug: 'why-automated-content-governance-matters',
    content_type: 'blog',
    status: 'published',
    author_id: 4,
    author_name: 'Elena Rostova',
    category_name: 'Blog Posts',
    published_at: new Date().toISOString(),
    tags: [{ id: 6, name: 'Governance', slug: 'governance' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_PUBLISHING_TRENDS: ChartDataPoint[] = [
  { label: 'Apr', value: 45, secondaryValue: 32 },
  { label: 'May', value: 52, secondaryValue: 40 },
  { label: 'Jun', value: 68, secondaryValue: 55 },
  { label: 'Jul', value: 84, secondaryValue: 70 },
  { label: 'Aug', value: 96, secondaryValue: 82 },
  { label: 'Sep', value: 120, secondaryValue: 104 },
];

export const DEMO_ENGAGEMENT_DATA: ChartDataPoint[] = [
  { label: 'Mon', value: 2400, secondaryValue: 1200 },
  { label: 'Tue', value: 4500, secondaryValue: 2800 },
  { label: 'Wed', value: 5800, secondaryValue: 3900 },
  { label: 'Thu', value: 6200, secondaryValue: 4100 },
  { label: 'Fri', value: 7100, secondaryValue: 4900 },
  { label: 'Sat', value: 3200, secondaryValue: 1800 },
  { label: 'Sun', value: 2900, secondaryValue: 1500 },
];

export const DEMO_CAMPAIGN_PERFORMANCE: ChartDataPoint[] = [
  { label: 'AI Thought Leadership', value: 88 },
  { label: 'Q4 Enterprise Growth', value: 76 },
  { label: 'Product Summit 2026', value: 92 },
  { label: 'Developer Relations', value: 64 },
  { label: 'Partner Ecosystem', value: 54 },
];
