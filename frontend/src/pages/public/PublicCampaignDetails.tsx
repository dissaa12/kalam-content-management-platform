import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  Stack,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Campaign as CampaignIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

import { campaignService } from '../../services/campaignService';
import { Campaign } from '../../types/campaign';

export const PublicCampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await campaignService.getById(Number(id));
        setCampaign(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Campaign landing page not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3, mb: 4, bgcolor: '#1F2937' }} />
        <Skeleton height={50} sx={{ bgcolor: '#1F2937' }} />
      </Container>
    );
  }

  if (error || !campaign) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 6, bgcolor: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}>
          <CampaignIcon sx={{ fontSize: 64, color: '#EF4444', mb: 2 }} />
          <Typography variant="h4" fontWeight={800} color="#fff" sx={{ mb: 1 }}>
            Campaign Landing Page Unavailable
          </Typography>
          <Button variant="contained" component={Link} to="/" startIcon={<BackIcon />}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  // Filter published content items inside campaign
  const publishedContent = (campaign.contents || []).filter((c) => c.status === 'published');

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Button component={Link} to="/" startIcon={<BackIcon />} sx={{ color: '#9CA3AF', mb: 4 }}>
          Back to Home
        </Button>

        {/* HERO BANNER */}
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: '#fff',
            mb: 6,
          }}
        >
          <Chip label={campaign.campaign_type.replace('_', ' ').toUpperCase()} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, mb: 2 }} />
          <Typography variant="h2" fontWeight={900} sx={{ mb: 2 }}>
            {campaign.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxW: 700, mb: 3, fontWeight: 400 }}>
            {campaign.description || 'Special strategic marketing campaign hub.'}
          </Typography>
          {campaign.objective && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <Typography variant="caption" fontWeight={700} display="block" sx={{ opacity: 0.8 }}>
                CAMPAIGN OBJECTIVE
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {campaign.objective}
              </Typography>
            </Paper>
          )}
        </Paper>

        {/* PUBLISHED CAMPAIGN CONTENT */}
        <Typography variant="h4" fontWeight={800} color="#fff" sx={{ mb: 3 }}>
          Published Campaign Resources ({publishedContent.length})
        </Typography>

        {publishedContent.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="body1" color="#9CA3AF">
              No published articles or landing pages currently linked to this campaign.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {publishedContent.map((item) => (
              <Grid item xs={12} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Chip label={item.content_type.replace('_', ' ')} size="small" sx={{ mb: 1, bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }} />
                    <Typography variant="h6" fontWeight={700} color="#fff" sx={{ mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="#9CA3AF" sx={{ mb: 2 }}>
                      {item.excerpt || 'Explore key details...'}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/blog/${item.slug}`}
                      variant="text"
                      endIcon={<ArrowIcon />}
                      sx={{ color: '#a855f7', fontWeight: 700, p: 0 }}
                    >
                      Read Content
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
