import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Chip,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material';
import {
  Visibility as ViewsIcon,
  TrendingUp as TrendingUpIcon,
  TouchApp as CtrIcon,
  Share as ShareIcon,
  CheckCircle as ConversionIcon,
  Timer as ReadingTimeIcon,
  Info as InfoIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { analyticsService } from '../services/analyticsService';
import { campaignService } from '../services/campaignService';
import { contentService } from '../services/contentService';
import { DashboardAnalyticsResponse } from '../types/analytics';
import { Campaign } from '../types/campaign';
import { Category } from '../types/content';
import { useNavigate } from 'react-router-dom';

const DATE_RANGE_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'year_to_date', label: 'Year to Date' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Content Types' },
  { value: 'blog', label: 'Blog Article' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'email', label: 'Email Copy' },
  { value: 'social_post', label: 'Social Media Post' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'announcement', label: 'Announcement' },
];

export const Analytics: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [dateRange, setDateRange] = useState<string>('last_30_days');
  const [campaignId, setCampaignId] = useState<string>('0');
  const [contentType, setContentType] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<string>('0');

  // Filter Dropdown Lists
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    campaignService.list().then(setCampaigns).catch(console.warn);
    contentService.getCategories().then(setCategories).catch(console.warn);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getDashboardAnalytics({
        date_range: dateRange,
        campaign_id: Number(campaignId) || undefined,
        content_type: contentType !== 'all' ? contentType : undefined,
        category_id: Number(categoryId) || undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load marketing analytics telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, campaignId, contentType, categoryId]);

  return (
    <Box>
      <PageHeader
        title="Marketing Analytics & Intelligence"
        subtitle="Performance dashboard tracking views, engagement, CTR, shares, conversions, and reading time."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />

      {/* Mandatory Simulation Disclaimer */}
      <Alert
        severity="info"
        icon={<InfoIcon fontSize="inherit" sx={{ color: '#E59B2F' }} />}
        sx={{
          mb: 3,
          borderRadius: 2,
          borderColor: '#E8DFD2',
          bgcolor: '#FAF7F0',
          color: '#171717',
          border: '1px solid #E8DFD2',
        }}
      >
        <strong>Enterprise Telemetry Disclaimer:</strong> {data?.disclaimer || 'Displaying simulated enterprise analytics & telemetry metrics.'}
      </Alert>

      {/* Interactive Filter Header Bar */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
            >
              <MenuItem value="0">All Campaigns</MenuItem>
              {campaigns.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Content Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {CONTENT_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="0">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Stat Cards Grid (6 Tracked Core Metrics) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* 1. Total Views */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <ViewsIcon sx={{ color: '#E59B2F' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Total Views
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.total_views.toLocaleString() || 0}
              </Typography>
            )}
            <Chip label="+14.2% vs prev" size="small" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 2. Engagement Rate */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#C96B4B' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Engagement Rate
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.avg_engagement || 0}%
              </Typography>
            )}
            <Chip label="+2.1% vs prev" size="small" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 3. Click-Through Rate (CTR) */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <CtrIcon sx={{ color: '#171717' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Avg CTR %
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.avg_ctr || 0}%
              </Typography>
            )}
            <Chip label="+0.8% vs prev" size="small" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 4. Social Shares */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <ShareIcon sx={{ color: '#B45309' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Social Shares
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.total_shares.toLocaleString() || 0}
              </Typography>
            )}
            <Chip label="+8.6% vs prev" size="small" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 5. Conversions */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <ConversionIcon sx={{ color: '#E59B2F' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Conversions
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.total_conversions.toLocaleString() || 0}
              </Typography>
            )}
            <Chip label="+18.4% vs prev" size="small" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }} />
          </Paper>
        </Grid>

        {/* 6. Reading Time */}
        <Grid item xs={12} sm={6} md={2}>
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <ReadingTimeIcon sx={{ color: '#3A3530' }} fontSize="medium" />
            </Box>
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', fontWeight: 600 }}>
              Avg Reading Time
            </Typography>
            {loading ? (
              <Skeleton width="60%" sx={{ mx: 'auto' }} />
            ) : (
              <Typography variant="h4" fontWeight={800} color="#171717" sx={{ fontFamily: 'Newsreader, serif' }}>
                {data?.summary.avg_reading_time || 0}m
              </Typography>
            )}
            <Chip label="Stable" size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, borderColor: '#DCD2C4', color: '#3A3530', fontWeight: 600 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* RECHARTS VISUALIZATION GRID */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Chart 1: Publishing Trends & Views */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Publishing Volume & Readership Spikes
              </Typography>
              <Typography variant="caption" sx={{ color: '#4A4540', mb: 2, display: 'block' }}>
                Track publication frequency alongside article view growth over time.
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.publishing_trends || []}>
                      <defs>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E59B2F" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#E59B2F" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#DCD2C4" />
                      <XAxis dataKey="date" stroke="#3A3530" />
                      <YAxis stroke="#3A3530" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                      <Legend />
                      <Area type="monotone" dataKey="views" name="Page Views" stroke="#E59B2F" fillOpacity={1} fill="url(#viewsGrad)" />
                      <Line type="monotone" dataKey="count" name="Items Published" stroke="#C96B4B" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2: Content Performance by Type */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Content Type Performance Matrix
              </Typography>
              <Typography variant="caption" sx={{ color: '#4A4540', mb: 2, display: 'block' }}>
                Views and conversions broken down across channels and media formats.
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.content_performance || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#DCD2C4" />
                      <XAxis dataKey="content_type" tickFormatter={(v) => v.replace('_', ' ')} stroke="#3A3530" />
                      <YAxis stroke="#3A3530" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="views" name="Total Views" fill="#E59B2F" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conversions" name="Conversions" fill="#171717" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3: Campaign Performance & Conversion ROI */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Campaign ROI & Conversions Breakdown
              </Typography>
              <Typography variant="caption" sx={{ color: '#4A4540', mb: 2, display: 'block' }}>
                Compare promotional campaign budget allocations against lead conversion counts.
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.campaign_performance || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#DCD2C4" />
                      <XAxis dataKey="campaign_name" tickFormatter={(v) => v.substring(0, 15) + '...'} stroke="#3A3530" />
                      <YAxis stroke="#3A3530" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="conversions" name="Conversions" fill="#C96B4B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4: Engagement & CTR Trends */}
        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Engagement Rate & CTR Progression
              </Typography>
              <Typography variant="caption" sx={{ color: '#4A4540', mb: 2, display: 'block' }}>
                Track daily user interaction velocity and click-through rates.
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              ) : (
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.engagement_trends || []}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#DCD2C4" />
                      <XAxis dataKey="date" stroke="#3A3530" />
                      <YAxis domain={[0, 15]} stroke="#3A3530" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                      <Legend />
                      <Line type="monotone" dataKey="engagement_rate" name="Engagement %" stroke="#E59B2F" strokeWidth={3} />
                      <Line type="monotone" dataKey="ctr" name="CTR %" stroke="#171717" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TOP PERFORMING CONTENT RANKING TABLE */}
      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
              Top Performing Content Assets
            </Typography>
            <Chip label="Ranked by Engagement & Conversions" size="small" variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717', fontWeight: 600 }} />
          </Box>

          {loading ? (
            <Stack spacing={1}>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : !data?.top_content || data.top_content.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ py: 4, color: '#4A4540' }}>
              No content telemetry metrics match the selected filters.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Author</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Views</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Engagement</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>CTR</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Conversions</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Shares</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Reading Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.top_content.map((item, idx) => (
                    <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                      <TableCell sx={{ fontWeight: 600, borderColor: '#DCD2C4' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={`#${idx + 1}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: idx < 3 ? '#E59B2F' : '#171717', color: idx < 3 ? '#171717' : '#FAF7F0', fontWeight: 800 }} />
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220, color: '#171717' }}>
                            {item.title}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderColor: '#DCD2C4' }}>
                        <Chip label={item.content_type.replace('_', ' ')} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: '#DCD2C4', color: '#171717' }} />
                      </TableCell>
                      <TableCell sx={{ borderColor: '#DCD2C4', color: '#171717' }}>{item.author_name}</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderColor: '#DCD2C4', color: '#171717' }}>{item.views.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderColor: '#DCD2C4', color: '#E59B2F' }}>{item.engagement_rate}%</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderColor: '#DCD2C4', color: '#171717' }}>{item.ctr}%</TableCell>
                      <TableCell sx={{ fontWeight: 700, borderColor: '#DCD2C4', color: '#C96B4B' }}>{item.conversions}</TableCell>
                      <TableCell sx={{ borderColor: '#DCD2C4', color: '#4A4540' }}>{item.shares}</TableCell>
                      <TableCell sx={{ borderColor: '#DCD2C4', color: '#4A4540' }}>{item.reading_time} min</TableCell>
                      <TableCell align="right" sx={{ borderColor: '#DCD2C4' }}>
                        <Button
                          size="small"
                          endIcon={<OpenIcon fontSize="small" />}
                          onClick={() => navigate(`/content/edit/${item.id}`)}
                          sx={{ color: '#C96B4B', fontWeight: 700 }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
