import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  TextField,
  Avatar,
  Paper,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Publish as PublishIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  ArrowBack as BackIcon,
  Timeline as TimelineIcon,
  Archive as ArchiveIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { VersionHistoryModal } from '../components/VersionHistoryModal';

import { contentService } from '../services/contentService';
import { workflowService } from '../services/workflowService';
import { ContentItem } from '../types/content';
import { ContentComment, ContentActivity, WorkflowActionType } from '../types/workflow';
import { formatDate, getContentTypeConfig } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export const ContentReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [content, setContent] = useState<ContentItem | null>(null);
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [activities, setActivities] = useState<ContentActivity[]>([]);
  const [newComment, setNewComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const loadAllDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const cnt = await contentService.getById(id);
      setContent(cnt);

      const [commList, actList] = await Promise.all([
        workflowService.getComments(cnt.id).catch(() => []),
        workflowService.getActivities(cnt.id).catch(() => []),
      ]);

      setComments(commList);
      setActivities(actList);
    } catch (err: any) {
      console.error('Failed to load review data:', err);
      setError(err.response?.data?.detail || 'Failed to load content for review.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAllDetails();
  }, [loadAllDetails]);

  const handleExecuteAction = async (action: WorkflowActionType, commentText?: string) => {
    if (!content) return;
    setActionError(null);
    try {
      const updated = await workflowService.executeAction(content.id, action, commentText);
      setContent(updated);
      setNewComment('');
      loadAllDetails();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || `Failed to execute action '${action}'.`);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !newComment.trim()) return;
    try {
      await workflowService.addComment(content.id, newComment);
      setNewComment('');
      loadAllDetails();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Failed to post comment.');
    }
  };

  if (loading) {
    return <LoadingState message="Loading review workspace..." variant="card" count={2} />;
  }

  if (error || !content) {
    return <ErrorState message={error || 'Content item not found.'} />;
  }

  const typeConfig = getContentTypeConfig(content.content_type);
  const currentRole = user?.role || 'marketing_manager';

  const canApprove = ['admin', 'marketing_manager', 'content_editor', 'reviewer'].includes(currentRole);
  const canPublish = ['admin', 'marketing_manager'].includes(currentRole);

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title={`Review: ${content.title}`}
        subtitle="Editorial review interface, reviewer discussion thread, and approval pipeline."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content' },
          { label: `Review #${content.id}` },
        ]}
        actions={[
          { label: 'Back to List', href: '/content', variant: 'outlined', icon: <BackIcon /> },
          {
            label: 'Version History',
            onClick: () => setVersionModalOpen(true),
            variant: 'outlined',
            icon: <HistoryIcon />,
          },
        ]}
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Live Content Document Preview */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Header Badges */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={typeConfig.label} size="small" sx={{ bgcolor: typeConfig.badgeBg, color: typeConfig.badgeText, fontWeight: 700 }} />
                  {content.category_name && <Chip label={content.category_name} size="small" variant="outlined" sx={{ borderColor: '#E8DFD2', color: '#171717' }} />}
                </Box>
                <StatusBadge status={content.status} />
              </Box>

              {/* Title */}
              <Typography variant="h2" fontWeight={800} sx={{ mb: 2, lineHeight: 1.25, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                {content.title}
              </Typography>

              {/* Author & Date metadata */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, width: 38, height: 38 }}>
                  {content.author_name ? content.author_name.charAt(0) : 'A'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>
                    {content.author_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4A4540' }}>
                    Submitted / Updated: {formatDate(content.updated_at)}
                  </Typography>
                </Box>
              </Box>

              {/* Featured Image */}
              {content.featured_image && (
                <Box
                  component="img"
                  src={content.featured_image}
                  alt={content.title}
                  sx={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 2, mb: 3, border: '1px solid #DCD2C4' }}
                />
              )}

              {/* Excerpt */}
              {content.excerpt && (
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3A3530', mb: 3, fontStyle: 'italic', borderLeft: '3px solid #E59B2F', pl: 2, fontFamily: 'Newsreader, serif' }}>
                  "{content.excerpt}"
                </Typography>
              )}

              <Divider sx={{ my: 3, borderColor: '#DCD2C4' }} />

              {/* Document Body */}
              <Box sx={{ typography: 'body1', lineHeight: 1.8, color: '#171717' }}>
                {content.body ? (
                  content.body.split('\n').map((p, idx) => {
                    if (p.startsWith('# ')) return <Typography key={idx} variant="h3" fontWeight={800} sx={{ mt: 3, mb: 1.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>{p.replace('# ', '')}</Typography>;
                    if (p.startsWith('## ')) return <Typography key={idx} variant="h4" fontWeight={700} sx={{ mt: 2.5, mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>{p.replace('## ', '')}</Typography>;
                    if (!p.trim()) return null;
                    return <Typography key={idx} variant="body1" sx={{ mb: 2, color: '#171717' }}>{p}</Typography>;
                  })
                ) : (
                  <Typography variant="body2" sx={{ color: '#4A4540' }}>No body content submitted.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Reviewer Actions, Comments & Activity Timeline */}
        <Grid item xs={12} md={4}>
          {/* Reviewer Action Controls Card */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Reviewer Decision Panel
              </Typography>

              <Typography variant="caption" sx={{ color: '#3A3530' }} display="block" mb={2.5}>
                Active role: <strong style={{ color: '#171717' }}>{currentRole}</strong>
              </Typography>

              <Stack spacing={1.5}>
                {canApprove && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleExecuteAction('approve', newComment || undefined)}
                      fullWidth
                      sx={{ bgcolor: '#E59B2F', color: '#171717', fontWeight: 700, '&:hover': { bgcolor: '#D48A1F' } }}
                    >
                      Approve Content
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<RejectIcon />}
                      onClick={() => handleExecuteAction('request_changes', newComment || 'Revisions requested.')}
                      fullWidth
                      sx={{ borderColor: '#C96B4B', color: '#C96B4B', fontWeight: 700, '&:hover': { bgcolor: '#FAF7F0' } }}
                    >
                      Request Revisions
                    </Button>
                  </>
                )}

                {canPublish && (
                  <Button
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={() => handleExecuteAction('publish')}
                    fullWidth
                    sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#333333' } }}
                  >
                    Publish Now
                  </Button>
                )}

                {canPublish && (
                  <Button
                    variant="outlined"
                    startIcon={<ArchiveIcon />}
                    onClick={() => handleExecuteAction('archive')}
                    fullWidth
                    sx={{ borderColor: '#DCD2C4', color: '#3A3530', fontWeight: 600 }}
                  >
                    Archive Asset
                  </Button>
                )}

                {!canApprove && !canPublish && (
                  <Alert severity="info" sx={{ borderRadius: 2, bgcolor: '#FAF7F0', border: '1px solid #DCD2C4', color: '#171717' }}>
                    Your assigned role (<strong>{currentRole}</strong>) allows submitting drafts and viewing comments. Review decisions require Editor/Reviewer role.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Comments Discussion Thread */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CommentIcon sx={{ color: '#E59B2F' }} />
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
                  Reviewer Comments ({comments.length})
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#DCD2C4' }} />

              <Stack spacing={2} sx={{ maxHeight: 280, overflowY: 'auto', mb: 2 }}>
                {comments.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#4A4540' }}>
                    No reviewer comments posted yet.
                  </Typography>
                ) : (
                  comments.map((c) => (
                    <Paper
                      key={c.id}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#FAF7F0', borderColor: '#DCD2C4' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>
                          {c.user_name}
                        </Typography>
                        <Chip label={c.user_role} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: '#DCD2C4', color: '#3A3530' }} />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 0.5, color: '#171717' }}>
                        {c.comment}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                        {formatDate(c.created_at)}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Stack>

              {/* Comment Input */}
              <form onSubmit={handlePostComment}>
                <TextField
                  placeholder="Write a reviewer comment or feedback..."
                  multiline
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      color: '#171717',
                      '& fieldset': { borderColor: '#DCD2C4' },
                      '&:hover fieldset': { borderColor: '#171717' },
                      '&.Mui-focused fieldset': { borderColor: '#171717' },
                    },
                    '& .MuiInputBase-input::placeholder': { color: '#6B625A', opacity: 1 },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon />}
                  disabled={!newComment.trim()}
                  fullWidth
                  sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#333333' } }}
                >
                  Post Comment
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Activity Audit Timeline */}
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <TimelineIcon sx={{ color: '#E59B2F' }} />
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
                  Activity Timeline ({activities.length})
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#DCD2C4' }} />

              <Stack spacing={1.5} sx={{ maxHeight: 240, overflowY: 'auto' }}>
                {activities.map((act) => (
                  <Box key={act.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E59B2F', mt: 0.8 }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block" sx={{ color: '#171717' }}>
                        {act.action.toUpperCase()} by {act.user_name}
                      </Typography>
                      {act.details && (
                        <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                          {act.details}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#4A4540' }}>
                        {formatDate(act.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Version History Modal */}
      <VersionHistoryModal
        open={versionModalOpen}
        contentId={content.id}
        onClose={() => setVersionModalOpen(false)}
        onRestoreSuccess={loadAllDetails}
      />
    </Box>
  );
};
