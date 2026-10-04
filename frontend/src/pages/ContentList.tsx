import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputBase,
  Button,
  Chip,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  MenuItem,
  TextField,
  Pagination,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  EditOutlined as EditIcon,
  DeleteOutline as DeleteIcon,
  VisibilityOutlined as PreviewIcon,
  RateReviewOutlined as ReviewIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ContentPreviewModal } from '../components/ContentPreviewModal';

import { contentService } from '../services/contentService';
import { ContentItem, Category } from '../types/content';
import { formatDate, getContentTypeConfig } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [items, setItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modals & Dialogs
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Content Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.list({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        content_type: typeFilter || undefined,
        category_id: categoryFilter ? Number(categoryFilter) : undefined,
      });

      setItems(data.items);
      setTotalItems(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      console.error('Failed to load content list:', err);
      setError(err.response?.data?.detail || 'Failed to load content list from server.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    contentService
      .getCategories()
      .then(setCategories)
      .catch((err) => console.warn('Categories fetch offline fallback', err));
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await contentService.delete(deleteId);
      setToastMessage('Content item successfully deleted.');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete content item.');
      setDeleteId(null);
    }
  };

  const canEdit = (item: ContentItem) => {
    if (!user) return false;
    if (['admin', 'marketing_manager', 'content_editor'].includes(user.role)) return true;
    return item.author_id === user.id;
  };

  const canDelete = (item: ContentItem) => {
    if (!user) return false;
    if (['admin', 'marketing_manager'].includes(user.role)) return true;
    return item.author_id === user.id;
  };

  return (
    <Box>
      <PageHeader
        title="KALAM Content Repository"
        subtitle="Manage, author, review, schedule, and publish multi-channel content."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Content Repository' }]}
        actions={[
          {
            label: 'Create Content',
            onClick: () => navigate('/content/new'),
            icon: <AddIcon />,
          },
        ]}
      />

      {/* Toolbar & Filter Bar */}
      <Card variant="outlined" sx={{ mb: 3, p: 2, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <Paper
              elevation={0}
              sx={{
                p: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: 300, md: 360 },
                border: '1px solid #E8DFD2',
                backgroundColor: '#FAF7F0',
                borderRadius: 1.5,
              }}
            >
              <SearchIcon sx={{ color: '#4A4540', mr: 1, fontSize: 18 }} />
              <InputBase
                placeholder="Search title, slug, or content..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                sx={{ fontSize: '0.85rem', width: '100%', color: '#171717' }}
              />
            </Paper>

            {/* Filter Dropdowns */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              {/* Status Filter */}
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="in_review">In Review</MenuItem>
                <MenuItem value="changes_requested">Changes Requested</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>

              {/* Type Filter */}
              <TextField
                select
                size="small"
                label="Content Type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Formats</MenuItem>
                <MenuItem value="blog">Blog Article</MenuItem>
                <MenuItem value="landing_page">Landing Page</MenuItem>
                <MenuItem value="email">Email Copy</MenuItem>
                <MenuItem value="social_post">Social Media</MenuItem>
                <MenuItem value="advertisement">Advertisement</MenuItem>
                <MenuItem value="case_study">Case Study</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
              </TextField>

              {/* Category Filter */}
              {categories.length > 0 && (
                <TextField
                  select
                  size="small"
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {(search || statusFilter || typeFilter || categoryFilter) && (
                <Button variant="outlined" size="small" onClick={handleResetFilters} startIcon={<ClearIcon />} sx={{ borderColor: '#E8DFD2', color: '#171717' }}>
                  Reset
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>

      {/* Main Content Table / States */}
      {loading ? (
        <LoadingState message="Loading KALAM content repository..." variant="skeleton" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No content items match your filters"
          description="Try clearing filters or author a new piece of content for your workspace."
          actionLabel="Create New Content"
          onAction={() => navigate('/content/new')}
        />
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Title & Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Updated</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }}>Publish Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#E8DFD2' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const typeConfig = getContentTypeConfig(item.content_type);
                  return (
                    <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#171717' }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4A4540' }}>
                          /{item.slug}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <Chip
                          label={typeConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: '#FAF7F0',
                            color: '#171717',
                            border: '1px solid #E8DFD2',
                            fontWeight: 700,
                            fontSize: '0.6875rem',
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#171717' }}>
                          {item.author_name}
                        </Typography>
                        {item.category_name && (
                          <Typography variant="caption" sx={{ color: '#4A4540', display: 'block' }}>
                            {item.category_name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <Typography variant="caption" sx={{ color: '#4A4540' }}>
                          {formatDate(item.updated_at)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#E8DFD2' }}>
                        <Typography variant="caption" sx={{ color: '#4A4540' }}>
                          {formatDate(item.published_at || item.scheduled_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ borderColor: '#E8DFD2' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Review & Approval Workflow">
                            <IconButton size="small" onClick={() => navigate(`/content/review/${item.id}`)}>
                              <ReviewIcon fontSize="small" sx={{ color: '#E59B2F' }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Live Preview">
                            <IconButton size="small" onClick={() => setPreviewContent(item)}>
                              <PreviewIcon fontSize="small" sx={{ color: '#171717' }} />
                            </IconButton>
                          </Tooltip>

                          {canEdit(item) && (
                            <Tooltip title="Edit Content">
                              <IconButton size="small" onClick={() => navigate(`/content/edit/${item.id}`)}>
                                <EditIcon fontSize="small" sx={{ color: '#171717' }} />
                              </IconButton>
                            </Tooltip>
                          )}

                          {canDelete(item) && (
                            <Tooltip title="Delete Content">
                              <IconButton size="small" onClick={() => setDeleteId(item.id)}>
                                <DeleteIcon fontSize="small" sx={{ color: '#C96B4B' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E8DFD2' }}>
            <Typography variant="caption" sx={{ color: '#4A4540', fontWeight: 600 }}>
              Showing {items.length} of {totalItems} total KALAM content items
            </Typography>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              shape="rounded"
              sx={{
                '& .Mui-selected': {
                  backgroundColor: '#171717 !important',
                  color: '#FAF7F0',
                },
              }}
            />
          </Box>
        </Card>
      )}

      {/* Live Preview Modal */}
      <ContentPreviewModal open={Boolean(previewContent)} content={previewContent} onClose={() => setPreviewContent(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Content Item?"
        message="Are you sure you want to permanently delete this content item? This action cannot be undone."
        confirmLabel="Delete Content"
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Toast Notification Snackbar */}
      <Snackbar open={Boolean(toastMessage)} autoHideDuration={4000} onClose={() => setToastMessage(null)}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: 1.5 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
