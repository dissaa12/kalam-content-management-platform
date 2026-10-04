import { BaseEntity, UserRole } from './common';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  isActive: boolean;
  lastActive: string;
}

export interface ActivityLog extends BaseEntity {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'content' | 'campaign' | 'user' | 'media' | 'category' | 'tag';
  entityName: string;
  timestamp: string;
}
