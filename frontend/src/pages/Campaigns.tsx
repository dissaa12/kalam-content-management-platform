import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Campaign as CampaignIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TouchApp as TouchAppIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { campaignService } from '../services/campaignService';
import { Campaign, CampaignCreateParams, CampaignUpdateParams } from '../types/campaign';
import { useNavigate } from 'react-router-dom';

const CAMPAIGN_TYPES = [
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'thought_leadership', label: 'Thought Leadership' },
  { value: 'customer_retention', label: 'Customer Retention' },
];

const CAMPAIGN_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'info' as const },
  { value: 'draft', label: 'Draft', color: 'default' as const },
  { value: 'active', label: 'Active', color: 'success' as const },
  { value: 'paused', label: 'Paused', color: 'warning' as const },
  { value: 'completed', label: 'Completed', color: 'primary' as const },
];

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Modal State (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    objective: string;
    target_audience: string;
    campaign_type: string;
    start_date: string;
    end_date: string;
    budget: number;
    status: string;
  }>({
    name: '',
    description: '',
    objective: '',
    target_audience: '',
    campaign_type: 'product_launch',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 10000,
    status: 'planning',
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dashboard / Details Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.list({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        campaign_type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setCampaigns(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, typeFilter]);

  // Handle Form Open for Create
  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      objective: '',
      target_audience: '',
      campaign_type: 'product_launch',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 10000,
      status: 'planning',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Form Open for Edit
  const handleOpenEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      objective: campaign.objective || '',
      target_audience: campaign.target_audience || '',
      campaign_type: campaign.campaign_type || 'product_launch',
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      budget: campaign.budget || 0,
      status: campaign.status || 'planning',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Save
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Campaign name is required.');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      const payload = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        budget: Number(formData.budget),
      };

      if (editingCampaign) {
        await campaignService.update(editingCampaign.id, payload as CampaignUpdateParams);
      } else {
        await campaignService.create(payload as CampaignCreateParams);
      }

      setIsFormOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save campaign.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (campaignId: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignService.delete(campaignId);
        fetchCampaigns();
        if (selectedCampaign?.id === campaignId) {
          setIsDetailOpen(false);
        }
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete campaign.');
      }
    }
  };

  // Handle View Detail
  const handleViewDetail = async (campaignId: number) => {
    try {
      const detailed = await campaignService.getById(campaignId);
      setSelectedCampaign(detailed);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to load campaign dashboard details.');
    }
  };

  // Filtered campaigns (search query filter)
  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    const found = CAMPAIGN_STATUSES.find((s) => s.value === status);
    return found ? found.color : 'default';
  };

  return (
    <Box>
      <PageHeader
        title="KALAM Strategic Campaigns"
        subtitle="Manage multi-channel strategic marketing initiatives, budgets, ROI, and content execution."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Campaigns' }]}
        actions={[{ label: 'Create Campaign', icon: <AddIcon />, onClick: handleOpenCreate }]}
      />

      {/* Filter and Search Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, borderColor: '#E8DFD2', backgroundColor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search campaigns by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#4A4540', mr: 1, fontSize: 18 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#171717',
                  '& fieldset': { borderColor: '#DCD2C4' },
                  '&:hover fieldset': { borderColor: '#171717' },
                  '&.Mui-focused fieldset': { borderColor: '#171717' },
                },
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#171717',
                  '& fieldset': { borderColor: '#DCD2C4' },
                  '&:hover fieldset': { borderColor: '#171717' },
                  '&.Mui-focused fieldset': { borderColor: '#171717' },
                },
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {CAMPAIGN_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Campaign Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#171717',
                  '& fieldset': { borderColor: '#DCD2C4' },
                  '&:hover fieldset': { borderColor: '#171717' },
                  '&.Mui-focused fieldset': { borderColor: '#171717' },
                },
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              {CAMPAIGN_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#3A3530', fontWeight: 600 }}>
              Total: <strong style={{ color: '#171717' }}>{filteredCampaigns.length}</strong> campaigns
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#E59B2F' }} />
        </Box>
      ) : filteredCampaigns.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2, borderColor: '#DCD2C4', backgroundColor: '#FFFFFF' }}>
          <CampaignIcon sx={{ fontSize: 48, color: '#E59B2F', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#171717', fontWeight: 700 }}>
            No marketing campaigns found.
          </Typography>
          <Typography variant="body2" sx={{ color: '#4A4540', mb: 2.5 }}>
            Get started by launching a new promotional or editorial campaign for KALAM.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ backgroundColor: '#171717', color: '#FFF' }}>
            Create Campaign
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCampaigns.map((c) => {
            const metrics = c.metrics;
            const totalContent = metrics?.total_content || 0;
            const published = metrics?.published_count || 0;
            const progress = totalContent > 0 ? Math.round((published / totalContent) * 100) : 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={c.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    borderColor: '#DCD2C4',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#E59B2F',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Chip
                        label={c.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(c.status)}
                        sx={{ fontWeight: 800, fontSize: '0.6875rem' }}
                      />
                      <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 700 }}>
                        {c.campaign_type.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>

                    <Typography variant="h5" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#171717', mb: 1, fontSize: '1.2rem' }}>
                      {c.name}
                    </Typography>

                    {c.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#4A4540',
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {c.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5, borderColor: '#DCD2C4' }} />

                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
                          Budget Allocation
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#171717' }}>
                          ${c.budget.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
                          Timeline
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#171717', display: 'block' }}>
                          {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Progress Bar in Saffron */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 600 }}>
                          Publication Progress ({published}/{totalContent} items)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#E59B2F' }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          borderRadius: 1,
                          height: 6,
                          backgroundColor: '#FAF7F0',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#E59B2F' },
                        }}
                      />
                    </Box>

                    {/* Metrics Pill Strip */}
                    <Paper
                      variant="outlined"
                      sx={{ p: 1, backgroundColor: '#FAF7F0', borderColor: '#DCD2C4' }}
                    >
                      <Grid container textAlign="center">
                        <Grid item xs={4}>
                          <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                            Engagement
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#171717' }}>
                            {metrics?.engagement_score || 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                            CTR
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#E59B2F' }}>
                            {metrics?.ctr_percentage || 0}%
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                            Conversions
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#16A34A' }}>
                            {metrics?.conversions_count || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </CardContent>

                  <Divider sx={{ borderColor: '#DCD2C4' }} />

                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<BarChartIcon sx={{ color: '#E59B2F' }} />}
                      onClick={() => handleViewDetail(c.id)}
                      sx={{ borderColor: '#DCD2C4', color: '#171717', fontWeight: 700 }}
                    >
                      Dashboard Hub
                    </Button>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenEdit(c)}>
                        <EditIcon fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(c.id)}>
                        <DeleteIcon fontSize="small" sx={{ color: '#DC2626' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create / Edit Campaign Modal Dialog */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleFormSubmit}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#171717' }}>
              {editingCampaign ? 'Edit Marketing Campaign' : 'Create New Campaign'}
            </Typography>
            <IconButton size="small" onClick={() => setIsFormOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ borderColor: '#DCD2C4' }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                label="Campaign Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Campaign Type"
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  >
                    {CAMPAIGN_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {CAMPAIGN_STATUSES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Target Audience"
                    fullWidth
                    placeholder="e.g. Enterprise Marketers, B2B Directors"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Budget ($)"
                    type="number"
                    fullWidth
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Campaign Objective"
                fullWidth
                placeholder="e.g. Expand brand reach and drive 500 lead signups"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsFormOpen(false)} sx={{ color: '#4A4540' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formSubmitting} sx={{ backgroundColor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { backgroundColor: '#333333' } }}>
              {formSubmitting ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Campaign Detail Dialog */}
      <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="md" fullWidth>
        {selectedCampaign && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#171717' }}>
                  {selectedCampaign.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedCampaign.status.toUpperCase()}
                    size="small"
                    color={getStatusColor(selectedCampaign.status)}
                    sx={{ fontWeight: 800 }}
                  />
                  <Typography variant="caption" sx={{ color: '#4A4540' }}>
                    Type: <strong style={{ color: '#171717' }}>{selectedCampaign.campaign_type.replace('_', ' ')}</strong> | Owner: <strong style={{ color: '#171717' }}>{selectedCampaign.owner_name}</strong>
                  </Typography>
                </Stack>
              </Box>
              <IconButton onClick={() => setIsDetailOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: '#DCD2C4' }}>
              {/* Overview Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#FAF7F0', borderColor: '#DCD2C4' }}>
                    <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
                      Total Content Items
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#171717">
                      {selectedCampaign.metrics?.total_content || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#FAF7F0', borderColor: '#DCD2C4' }}>
                    <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
                      Published Content
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#16A34A">
                      {selectedCampaign.metrics?.published_count || 0}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#FAF7F0', borderColor: '#DCD2C4' }}>
                    <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
                      Scheduled Content
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#E59B2F">
                      {selectedCampaign.metrics?.scheduled_count || 0}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Performance Metrics Row */}
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#171717' }}>
                Campaign Analytics & ROI
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderColor: '#DCD2C4' }}>
                    <TrendingUpIcon sx={{ color: '#171717', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                        Engagement Score
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#171717' }}>
                        {selectedCampaign.metrics?.engagement_score || 0}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderColor: '#DCD2C4' }}>
                    <TouchAppIcon sx={{ color: '#E59B2F', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                        Click-Through Rate (CTR)
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#171717' }}>
                        {selectedCampaign.metrics?.ctr_percentage || 0}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderColor: '#DCD2C4' }}>
                    <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 32 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#3A3530', display: 'block' }}>
                        Total Conversions
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#171717' }}>
                        {selectedCampaign.metrics?.conversions_count || 0}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Associated Content Table */}
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: '#171717' }}>
                Campaign Content Items ({selectedCampaign.contents?.length || 0})
              </Typography>

              {!selectedCampaign.contents || selectedCampaign.contents.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#4A4540' }}>
                  No content items currently linked to this campaign.
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#DCD2C4' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#171717' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#171717' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#171717' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#171717' }}>Author</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#171717' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCampaign.contents.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ fontWeight: 600, color: '#171717' }}>{item.title}</TableCell>
                          <TableCell>
                            <Chip label={item.content_type.replace('_', ' ')} size="small" variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={item.status} size="small" color={item.status === 'published' ? 'success' : 'info'} sx={{ fontWeight: 700 }} />
                          </TableCell>
                          <TableCell sx={{ color: '#171717' }}>{item.author_name}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => {
                                setIsDetailOpen(false);
                                navigate(`/content/edit/${item.id}`);
                              }}
                              sx={{ color: '#171717', fontWeight: 700 }}
                            >
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setIsDetailOpen(false)} sx={{ color: '#4A4540' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
