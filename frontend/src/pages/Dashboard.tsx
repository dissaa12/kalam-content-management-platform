import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Avatar,
  Button,
  Divider,
  Alert,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import {
  ArticleOutlined as TotalContentIcon,
  CheckCircleOutline as PublishedIcon,
  EditNoteOutlined as DraftsIcon,
  RateReviewOutlined as ReviewIcon,
  ScheduleOutlined as ScheduledIcon,
  CampaignOutlined as CampaignIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  InfoOutlined as InfoIcon,
  CheckCircle as HealthyIcon,
  Warning as DegradedIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { StatusBadge } from '../components/StatusBadge';
import {
  DEMO_STATS,
  DEMO_RECENT_ACTIVITY,
  DEMO_UPCOMING_CONTENT,
  DEMO_TOP_PERFORMING_CONTENT,
  DEMO_PUBLISHING_TRENDS,
  DEMO_CAMPAIGN_PERFORMANCE,
} from '../utils/demoData';
import { formatNumber, formatDate } from '../utils/formatters';
import { fetchHealthStatus, HealthCheckResponse } from '../services/healthService';
import { useAuth } from '../hooks/useAuth';

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, iconBg }) => (
  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #E8DFD2',
          }}
        >
          {icon}
        </Box>
        <Chip
          icon={isPositive ? <TrendingUpIcon style={{ fontSize: 13, color: '#15803D' }} /> : <TrendingDownIcon style={{ fontSize: 13, color: '#B45309' }} />}
          label={change}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            backgroundColor: '#FAF7F0',
            color: isPositive ? '#15803D' : '#B45309',
            border: '1px solid #E8DFD2',
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
        {title}
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.02em', color: '#171717', fontSize: '1.75rem', fontFamily: 'Newsreader, serif' }}>
        {formatNumber(value)}
      </Typography>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30_days');

  useEffect(() => {
    fetchHealthStatus()
      .then((data) => {
        setHealthStatus(data);
        setHealthLoading(false);
      })
      .catch((err) => {
        console.error('Health check failed:', err);
        setHealthLoading(false);
      });
  }, []);

  return (
    <Box>
      {/* Header Context Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#171717', fontSize: '1.875rem', fontFamily: 'Newsreader, serif' }}>
            Welcome back, {user?.first_name || 'Creator'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#4A4540', mt: 0.5, fontWeight: 500 }}>
            KALAM Marketing Operations & Editorial Command Center
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Date Range Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              sx={{ borderRadius: 1.5, backgroundColor: '#FFFFFF', borderColor: '#E8DFD2', fontSize: '0.85rem', fontWeight: 600, color: '#171717' }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="7_days">Last 7 days</MenuItem>
              <MenuItem value="30_days">Last 30 days</MenuItem>
              <MenuItem value="90_days">Last 90 days</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/content/new')}
            sx={{
              backgroundColor: '#171717',
              color: '#FAF7F0',
              fontWeight: 700,
              px: 2.5,
              py: 0.9,
              borderRadius: 1.5,
              '&:hover': { backgroundColor: '#2D2926' },
            }}
          >
            Create Content
          </Button>
        </Box>
      </Box>

      {/* Demo Notice Banner & Backend Health Bar */}
      <Box sx={{ mb: 3.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Alert
              severity="info"
              icon={<InfoIcon sx={{ color: '#E59B2F' }} />}
              sx={{
                borderRadius: 2,
                backgroundColor: '#FAF7F0',
                border: '1px solid #E8DFD2',
                color: '#171717',
                alignItems: 'center',
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#171717' }}>
                  <strong>Simulated Analytics Mode:</strong> Dashboard visual telemetry metrics are loaded with KALAM sample datasets.
                </Typography>
                <Chip label="Simulated Data" size="small" sx={{ fontWeight: 700, backgroundColor: '#E59B2F', color: '#FFFFFF' }} />
              </Box>
            </Alert>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                px: 2,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderColor: '#E8DFD2',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {healthStatus?.status === 'ok' ? (
                  <HealthyIcon sx={{ color: '#16A34A' }} />
                ) : (
                  <DegradedIcon sx={{ color: '#D97706' }} />
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 800, letterSpacing: '0.05em', display: 'block' }}>
                    FASTAPI API STATUS
                  </Typography>
                  <Typography variant="body2" fontWeight={800} sx={{ color: healthStatus?.status === 'ok' ? '#16A34A' : '#DC2626' }}>
                    {healthLoading
                      ? 'Checking Backend...'
                      : healthStatus?.status === 'ok'
                      ? `Online (${healthStatus.environment})`
                      : 'Offline'}
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Verify API Health Connection">
                <Chip
                  label="/api/health"
                  size="small"
                  variant="outlined"
                  component="a"
                  href="http://localhost:8000/api/health"
                  target="_blank"
                  clickable
                  icon={<OpenInNewIcon style={{ fontSize: 11, color: '#171717' }} />}
                  sx={{ fontSize: '0.7rem', fontWeight: 700, borderColor: '#E8DFD2', color: '#171717', bgcolor: '#FAF7F0' }}
                />
              </Tooltip>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 6 Primary KPI Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Content"
            value={DEMO_STATS.totalContent}
            change="+14.2%"
            isPositive={true}
            icon={<TotalContentIcon sx={{ color: '#171717' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Published"
            value={DEMO_STATS.published}
            change="+8.6%"
            isPositive={true}
            icon={<PublishedIcon sx={{ color: '#16A34A' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Drafts"
            value={DEMO_STATS.drafts}
            change="-2.1%"
            isPositive={true}
            icon={<DraftsIcon sx={{ color: '#3A3530' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Pending Review"
            value={DEMO_STATS.pendingReview}
            change="+18.4%"
            isPositive={false}
            icon={<ReviewIcon sx={{ color: '#E59B2F' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Scheduled"
            value={DEMO_STATS.scheduled}
            change="+5.0%"
            isPositive={true}
            icon={<ScheduledIcon sx={{ color: '#171717' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Active Campaigns"
            value={DEMO_STATS.activeCampaigns}
            change="+12.0%"
            isPositive={true}
            icon={<CampaignIcon sx={{ color: '#C96B4B' }} />}
            iconBg="#FAF7F0"
          />
        </Grid>
      </Grid>

      {/* Content Workflow Pipeline Visualization Card */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', fontFamily: 'Newsreader, serif' }}>
                Content Approval Pipeline State
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A4540', fontWeight: 500 }}>
                Active governance lifecycle from draft creation to publication
              </Typography>
            </Box>
            <Chip label="Workflow Engine" size="small" sx={{ backgroundColor: '#FAF7F0', color: '#171717', border: '1px solid #E8DFD2', fontWeight: 700 }} />
          </Box>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {[
              { stage: '1. Drafts', count: DEMO_STATS.drafts, color: '#171717', desc: 'Authoring & Edits' },
              { stage: '2. In Review', count: DEMO_STATS.pendingReview, color: '#B45309', desc: 'Reviewer Approval' },
              { stage: '3. Approved', count: 4, color: '#15803D', desc: 'Ready for Scheduling' },
              { stage: '4. Scheduled', count: DEMO_STATS.scheduled, color: '#171717', desc: 'Calendar Queue' },
              { stage: '5. Published', count: DEMO_STATS.published, color: '#E59B2F', desc: 'Live Content' },
            ].map((stg) => (
              <Grid item xs={12} sm={2.4} key={stg.stage}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: '#FAF7F0',
                    borderColor: '#E8DFD2',
                    borderTop: `4px solid ${stg.color}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 800, textTransform: 'uppercase' }}>
                    {stg.stage}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: stg.color, my: 0.5, fontSize: '1.5rem', fontFamily: 'Newsreader, serif' }}>
                    {stg.count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4A4540', fontSize: '0.75rem', fontWeight: 600 }}>
                    {stg.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Analytics Chart Areas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Chart 1: Content Publishing Trends */}
        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', fontFamily: 'Newsreader, serif' }}>
                    Publishing Trends & Volume
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4A4540', fontWeight: 500 }}>
                    Created drafts vs. Published items per month
                  </Typography>
                </Box>
                <Chip label="Sample Analytics" size="small" variant="outlined" sx={{ borderColor: '#E8DFD2', fontWeight: 600, color: '#171717' }} />
              </Box>
              <Box sx={{ width: '100%', height: 280, pt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DEMO_PUBLISHING_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#171717" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E59B2F" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#E59B2F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8DFD2" opacity={0.6} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#4A4540', fontWeight: 600 }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '12px', fill: '#4A4540', fontWeight: 600 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                    <Area type="monotone" dataKey="value" name="Created" stroke="#171717" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreated)" />
                    <Area type="monotone" dataKey="secondaryValue" name="Published" stroke="#E59B2F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPublished)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2: Active Campaign Impact */}
        <Grid item xs={12} lg={5}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', fontFamily: 'Newsreader, serif' }}>
                    Campaign Performance Index
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4A4540', fontWeight: 500 }}>
                    Calculated engagement score (0 - 100)
                  </Typography>
                </Box>
                <Chip label="Sample Analytics" size="small" variant="outlined" sx={{ borderColor: '#E8DFD2', fontWeight: 600, color: '#171717' }} />
              </Box>
              <Box sx={{ width: '100%', height: 280, pt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEMO_CAMPAIGN_PERFORMANCE} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8DFD2" opacity={0.6} />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} style={{ fontSize: '11px', fill: '#4A4540', fontWeight: 600 }} />
                    <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '11px', fill: '#171717', fontWeight: 700 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderRadius: 8, color: '#FAF7F0', border: 'none' }} />
                    <Bar dataKey="value" name="Score" fill="#E59B2F" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3 Grid Panels: Recent Activity, Upcoming Content, Top Performing */}
      <Grid container spacing={3}>
        {/* Panel 1: Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', mb: 0.5, fontFamily: 'Newsreader, serif' }}>
                Recent Activity Timeline
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A4540', mb: 2, fontWeight: 500 }}>
                Audit trail of team editorial actions
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#E8DFD2' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {DEMO_RECENT_ACTIVITY.map((act) => (
                  <Box key={act.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700 }}>
                      {act.userName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#171717' }}>
                        {act.userName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4A4540', display: 'block', fontWeight: 500 }}>
                        {act.action} — <strong style={{ color: '#171717' }}>{act.entityName}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#E59B2F', fontWeight: 700 }}>
                        {act.timestamp}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 2: Upcoming Content */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', mb: 0.5, fontFamily: 'Newsreader, serif' }}>
                Scheduled Content Queue
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A4540', mb: 2, fontWeight: 500 }}>
                Upcoming publication calendar schedule
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#E8DFD2' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {DEMO_UPCOMING_CONTENT.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, backgroundColor: '#FAF7F0', borderColor: '#E8DFD2' }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <StatusBadge status={item.status} />
                      <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 800 }}>
                        {item.category_name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3, color: '#171717' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#E59B2F', fontWeight: 700, display: 'block' }}>
                      Scheduled: {formatDate(item.scheduled_at)}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel 3: Top Performing Content */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#171717', mb: 0.5, fontFamily: 'Newsreader, serif' }}>
                Top Performing Articles
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A4540', mb: 2, fontWeight: 500 }}>
                Highest engagement content in 30 days
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#E8DFD2' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {DEMO_TOP_PERFORMING_CONTENT.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, backgroundColor: '#FAF7F0', borderColor: '#E8DFD2' }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3, color: '#171717' }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={item.content_type.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#FFFFFF', border: '1px solid #E8DFD2', color: '#171717' }}
                      />
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
                        Published: {formatDate(item.published_at)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
