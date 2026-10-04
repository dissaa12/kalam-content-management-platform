import { ContentStatus, ContentType } from '../types/content';
import { UserRole } from '../types/common';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getStatusConfig = (status: ContentStatus) => {
  switch (status) {
    case 'published':
      return { label: 'Published', color: 'success' as const, bg: '#FAF7F0', text: '#171717' };
    case 'scheduled':
      return { label: 'Scheduled', color: 'info' as const, bg: '#FAF7F0', text: '#171717' };
    case 'approved':
      return { label: 'Approved', color: 'success' as const, bg: '#FAF7F0', text: '#15803D' };
    case 'in_review':
      return { label: 'In Review', color: 'warning' as const, bg: '#FAF7F0', text: '#B45309' };
    case 'changes_requested':
      return { label: 'Changes Requested', color: 'error' as const, bg: '#FAF7F0', text: '#C96B4B' };
    case 'draft':
      return { label: 'Draft', color: 'default' as const, bg: '#FAF7F0', text: '#3A3530' };
    case 'archived':
      return { label: 'Archived', color: 'default' as const, bg: '#FAF7F0', text: '#4A4540' };
    default:
      return { label: status, color: 'default' as const, bg: '#FAF7F0', text: '#3A3530' };
  }
};

export const getContentTypeConfig = (type: ContentType) => {
  switch (type) {
    case 'blog':
      return { label: 'Blog Article', color: 'primary' as const, badgeBg: '#FAF7F0', badgeText: '#E59B2F' };
    case 'landing_page':
      return { label: 'Landing Page', color: 'secondary' as const, badgeBg: '#FAF7F0', badgeText: '#C96B4B' };
    case 'email':
      return { label: 'Email Copy', color: 'info' as const, badgeBg: '#FAF7F0', badgeText: '#171717' };
    case 'social_post':
      return { label: 'Social Media', color: 'warning' as const, badgeBg: '#FAF7F0', badgeText: '#B45309' };
    case 'advertisement':
      return { label: 'Advertisement', color: 'error' as const, badgeBg: '#FAF7F0', badgeText: '#9A3412' };
    case 'case_study':
      return { label: 'Case Study', color: 'success' as const, badgeBg: '#FAF7F0', badgeText: '#78350F' };
    case 'announcement':
      return { label: 'Announcement', color: 'default' as const, badgeBg: '#FAF7F0', badgeText: '#374151' };
    default:
      return { label: type, color: 'default' as const, badgeBg: '#FAF7F0', badgeText: '#3A3530' };
  }
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'marketing_manager':
      return 'Marketing Manager';
    case 'content_editor':
      return 'Content Editor';
    case 'content_author':
      return 'Content Author';
    case 'reviewer':
      return 'Reviewer';
    default:
      return role;
  }
};
