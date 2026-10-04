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
  ArrowForward as ArrowIcon,
  AutoAwesome as AIIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

import { contentService } from '../../services/contentService';
import { campaignService } from '../../services/campaignService';
import { ContentItem } from '../../types/content';
import { Campaign } from '../../types/campaign';
import { KalamLogo } from '../../components/KalamLogo';

export const PublicHome: React.FC = () => {
  const navigate = useNavigate();

  const [publishedArticles, setPublishedArticles] = useState<ContentItem[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentRes, campaignRes] = await Promise.all([
          contentService.listPublic({ limit: 6 }),
          campaignService.list({ status: 'active' }),
        ]);
        setPublishedArticles(contentRes.items);
        setActiveCampaigns(campaignRes);
      } catch (err) {
        console.warn('Failed to load public content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredArticle = publishedArticles[0];
  const latestArticles = publishedArticles.slice(1, 5);

  return (
    <Box sx={{ backgroundColor: '#141210', color: '#F7F3EA' }}>
      {/* 1. HERO SECTION */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 10%, rgba(244, 122, 32, 0.12) 0%, transparent 65%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<AIIcon sx={{ color: '#F47A20 !important' }} />}
                label="WRITE | CREATE | STORYTELL | EXPRESS"
                sx={{
                  backgroundColor: 'rgba(244, 122, 32, 0.12)',
                  color: '#F47A20',
                  borderColor: 'rgba(244, 122, 32, 0.3)',
                  fontWeight: 800,
                  fontSize: '0.725rem',
                  letterSpacing: '0.12em',
                  mb: 2.5,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Newsreader, Georgia, serif',
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: '#F7F3EA',
                }}
              >
                Craft Exceptional Stories & Elevate Marketing Communications.
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, lineHeight: 1.6, color: '#B3A89C', maxWidth: 620, fontSize: '1.1rem' }}>
                KALAM is an enterprise content management platform empowering editorial teams, authors, and marketers with AI writing assistance and governance workflows.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/blog')}
                  endIcon={<ArrowIcon />}
                  sx={{
                    backgroundColor: '#F47A20',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.5,
                    borderRadius: 1.5,
                    fontSize: '1rem',
                    '&:hover': { backgroundColor: '#E86A16' },
                  }}
                >
                  Explore Publications
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/about')}
                  sx={{
                    borderColor: '#2D2824',
                    color: '#F7F3EA',
                    fontWeight: 600,
                    px: 3.5,
                    py: 1.5,
                    borderRadius: 1.5,
                    fontSize: '1rem',
                    '&:hover': { borderColor: '#F47A20', backgroundColor: 'rgba(244, 122, 32, 0.08)' },
                  }}
                >
                  About KALAM
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={12}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: '#1A1816',
                  border: '1px solid #2D2824',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
                  alt="KALAM Editorial Workspace"
                  sx={{ width: '100%', height: 330, objectFit: 'cover', borderRadius: 2 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* 2. FEATURED EDITORIAL STORY */}
        {featuredArticle && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#F47A20', display: 'block', mb: 1.5, letterSpacing: '0.12em' }}>
              FEATURED STORY
            </Typography>
            <Card
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                backgroundColor: '#1A1816',
                border: '1px solid #2D2824',
                borderRadius: 2.5,
                overflow: 'hidden',
                transition: 'all 0.3s',
                '&:hover': { borderColor: '#F47A20', transform: 'translateY(-2px)' },
              }}
            >
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 260, md: 380 } }}
                image={featuredArticle.featured_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800'}
                alt={featuredArticle.title}
              />
              <CardContent sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip label={featuredArticle.content_type.replace('_', ' ').toUpperCase()} size="small" sx={{ bgcolor: '#F47A20', color: '#fff', fontWeight: 800, fontSize: '0.65rem' }} />
                  {featuredArticle.category_name && (
                    <Chip label={featuredArticle.category_name} size="small" variant="outlined" sx={{ borderColor: '#2D2824', color: '#B3A89C' }} />
                  )}
                </Stack>
                <Typography variant="h3" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', mb: 2, lineHeight: 1.25 }}>
                  {featuredArticle.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#B3A89C', mb: 3, lineHeight: 1.6 }}>
                  {featuredArticle.excerpt || 'Explore key strategies and technological advancements shaping the future of enterprise content operations...'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#B3A89C' }}>
                    By <strong>{featuredArticle.author_name}</strong> • {new Date(featuredArticle.published_at || featuredArticle.created_at).toLocaleDateString()}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/blog/${featuredArticle.slug}`}
                    variant="text"
                    endIcon={<ArrowIcon />}
                    sx={{ color: '#F47A20', fontWeight: 700 }}
                  >
                    Read Article
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* 3. LATEST PUBLISHED ARTICLES FROM CMS API */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', fontSize: '1.75rem' }}>
                Latest Published Publications
              </Typography>
              <Typography variant="body2" sx={{ color: '#B3A89C' }}>
                Fresh articles and campaign stories published directly from the KALAM CMS workspace.
              </Typography>
            </Box>
            <Button component={Link} to="/blog" variant="outlined" endIcon={<ArrowIcon />} sx={{ color: '#F7F3EA', borderColor: '#2D2824' }}>
              View All Publications
            </Button>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1, bgcolor: '#1A1816' }} />
                  <Skeleton height={30} sx={{ bgcolor: '#1A1816' }} />
                  <Skeleton height={20} width="60%" sx={{ bgcolor: '#1A1816' }} />
                </Grid>
              ))}
            </Grid>
          ) : latestArticles.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#1A1816', borderColor: '#2D2824' }}>
              <ArticleIcon sx={{ fontSize: 40, color: '#B3A89C', mb: 1 }} />
              <Typography variant="h6" color="#F7F3EA">
                No published articles available yet.
              </Typography>
              <Typography variant="body2" color="#B3A89C">
                Publish content in the KALAM workspace to see articles appear here in real-time!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {latestArticles.map((article) => (
                <Grid item xs={12} sm={6} md={3} key={article.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#1A1816',
                      border: '1px solid #2D2824',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#F47A20', transform: 'translateY(-2px)' },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={article.featured_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'}
                      alt={article.title}
                    />
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Chip
                        label={article.content_type.replace('_', ' ')}
                        size="small"
                        sx={{ fontSize: '0.62rem', height: 18, width: 'fit-content', bgcolor: 'rgba(244, 122, 32, 0.15)', color: '#F47A20', fontWeight: 700, mb: 1.5 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Newsreader, Georgia, serif',
                          fontWeight: 700,
                          color: '#F7F3EA',
                          mb: 1,
                          fontSize: '1.05rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#B3A89C',
                          mb: 2,
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
                        }}
                      >
                        {article.excerpt || 'Read the full publication to learn actionable insights...'}
                      </Typography>
                      <Divider sx={{ my: 1, borderColor: '#2D2824' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: '#B3A89C' }}>
                          {new Date(article.published_at || article.created_at).toLocaleDateString()}
                        </Typography>
                        <Button
                          component={Link}
                          to={`/blog/${article.slug}`}
                          size="small"
                          sx={{ color: '#F47A20', fontWeight: 700 }}
                        >
                          Read
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* 4. MARKETING CAMPAIGNS SECTION */}
        {activeCampaigns.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA' }}>
                Active Strategic Campaigns
              </Typography>
              <Typography variant="body2" sx={{ color: '#B3A89C' }}>
                Multi-channel promotional initiatives powered by KALAM.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {activeCampaigns.map((cmp) => (
                <Grid item xs={12} md={4} key={cmp.id}>
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: '#1A1816',
                      border: '1px solid #2D2824',
                      borderRadius: 2.5,
                    }}
                  >
                    <Chip label={cmp.status.toUpperCase()} size="small" color="success" sx={{ fontWeight: 800, mb: 1.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#F7F3EA', mb: 1 }}>
                      {cmp.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#B3A89C', mb: 2 }}>
                      {cmp.description || 'Enterprise campaign initiative targeting key audience segments.'}
                    </Typography>
                    <Button
                      component={Link}
                      to={`/campaigns/${cmp.id}`}
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowIcon />}
                      sx={{ borderColor: '#2D2824', color: '#F7F3EA' }}
                    >
                      View Campaign Hub
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 5. CALL TO ACTION SECTION */}
        <Paper
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 3,
            backgroundColor: '#1A1816',
            border: '1px solid #F47A20',
            textAlign: 'center',
            color: '#F7F3EA',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <KalamLogo variant="full" height={42} lightBackground={false} showTagline />
          </Box>
          <Typography variant="h2" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, mb: 2, mt: 1 }}>
            Ready to Transform Your Content Operations?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#B3A89C', maxWidth: 650, mx: 'auto' }}>
            Experience enterprise governance, AI copywriting tools, content calendar scheduling, and SEO health linting in one unified platform.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#F47A20',
              color: '#FFFFFF',
              fontWeight: 800,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { backgroundColor: '#E86A16' },
            }}
          >
            Access KALAM Workspace
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
