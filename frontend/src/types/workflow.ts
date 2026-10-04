export type WorkflowActionType =
  | 'submit_review'
  | 'approve'
  | 'request_changes'
  | 'reject'
  | 'schedule'
  | 'publish'
  | 'archive';

export interface ContentComment {
  id: number;
  content_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  comment: string;
  created_at: string;
}

export interface ContentVersion {
  id: number;
  content_id: number;
  version_number: number;
  author_id: number;
  author_name: string;
  title: string;
  excerpt?: string;
  body?: string;
  content_snapshot?: Record<string, any>;
  created_at: string;
}

export interface ContentActivity {
  id: number;
  content_id: number;
  user_id: number;
  user_name: string;
  user_role: string;
  action: string;
  details?: string;
  timestamp: string;
}
