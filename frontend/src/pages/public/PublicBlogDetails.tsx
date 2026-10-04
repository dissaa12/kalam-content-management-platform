import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LinkedIn,
  Twitter,
  ContentCopy as CopyIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';

import { contentService } from '../../services/contentService';
import { ContentItem } from '../../types/content';

export const PublicBlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [article, setArticle] = useState<ContentItem | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch published article only (404 if draft or archived)
        const item = await contentService.getPublicBySlug(slug);
        setArticle(item);

        // Fetch related articles
        const relatedRes = await contentService.listPublic({ limit: 4 });
        setRelatedArticles(relatedRes.items.filter((a) => a.id !== item.id));
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Article not found or not published.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3, mb: 4, bgcolor: '#1A1816' }} />
        <Skeleton height={50} sx={{ bgcolor: '#1A1816', mb: 2 }} />
        <Skeleton height={25} width="40%" sx={{ bgcolor: '#1A1816', mb: 4 }} />
        <Skeleton height={200} sx={{ bgcolor: '#1A1816' }} />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 6, bgcolor: '#1A1816', borderColor: '#2D2824' }}>
          <ArticleIcon sx={{ fontSize: 64, color: '#DC2626', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#F7F3EA', mb: 1 }}>
            Article Not Available
          </Typography>
          <Typography variant="body1" sx={{ color: '#B3A89C', mb: 4 }}>
            The requested article is either in draft status, archived, or does not exist.
          </Typography>
          <Button variant="contained" component={Link} to="/blog" startIcon={<BackIcon />} sx={{ backgroundColor: '#F47A20', color: '#FFF' }}>
            Return to Publications
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6, backgroundColor: '#141210', color: '#F7F3EA' }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          component={Link}
          to="/blog"
          startIcon={<BackIcon />}
          sx={{ color: '#B3A89C', mb: 4, '&:hover': { color: '#F7F3EA' } }}
        >
          Back to Publications
        </Button>

        {/* Category & Content Type Chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={article.content_type.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{ bgcolor: '#F47A20', color: '#fff', fontWeight: 800, fontSize: '0.65rem' }}
          />
          {article.category_name && (
            <Chip label={article.category_name} size="small" variant="outlined" sx={{ color: '#B3A89C', borderColor: '#2D2824' }} />
          )}
        </Stack>

        {/* Article Title */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontWeight: 700,
            color: '#F7F3EA',
            mb: 2.5,
            fontSize: { xs: '2.25rem', md: '3.25rem' },
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          {article.title}
        </Typography>

        {/* Article Excerpt */}
        {article.excerpt && (
          <Typography variant="h6" sx={{ color: '#B3A89C', mb: 4, fontWeight: 400, lineHeight: 1.6, fontSize: '1.15rem' }}>
            {article.excerpt}
          </Typography>
        )}

        {/* Author & Published Date Metadata Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#171717', color: '#FFFDF8', fontWeight: 800, border: '2px solid #F47A20' }}>
              {article.author_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#F7F3EA">
                {article.author_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#B3A89C' }}>
                Published on {new Date(article.published_at || article.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          {/* Social Share Buttons */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: '#B3A89C', mr: 0.5 }}>
              Share:
            </Typography>
            <Tooltip title="Share on LinkedIn">
              <IconButton
                size="small"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                sx={{ color: '#0B66C2' }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share on X">
              <IconButton
                size="small"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                sx={{ color: '#1DA1F2' }}
              >
                <Twitter fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={copied ? 'Link Copied!' : 'Copy Article Link'}>
              <IconButton size="small" onClick={handleCopyLink} sx={{ color: '#B3A89C' }}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Featured Image */}
        {article.featured_image && (
          <Box
            component="img"
            src={article.featured_image}
            alt={article.title}
            sx={{
              width: '100%',
              maxHeight: 450,
              objectFit: 'cover',
              borderRadius: 2.5,
              mb: 5,
              border: '1px solid #2D2824',
            }}
          />
        )}

        {/* Article Body Content */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 5 },
            backgroundColor: '#1A1816',
            borderColor: '#2D2824',
            borderRadius: 2.5,
            mb: 6,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#F7F3EA',
              fontSize: '1.1rem',
              lineHeight: 1.85,
              whiteSpace: 'pre-line',
            }}
          >
            {article.body || 'No detailed content body provided for this publication.'}
          </Typography>

          {/* Tags List */}
          {article.tags && article.tags.length > 0 && (
            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #2D2824' }}>
              <Typography variant="caption" sx={{ color: '#B3A89C', display: 'block', mb: 1.5, fontWeight: 700 }}>
                TAGS & TOPICS
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {article.tags.map((tag) => (
                  <Chip key={tag.id} label={`#${tag.name}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#B3A89C' }} />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* RELATED ARTICLES SECTION */}
        {relatedArticles.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', mb: 3 }}>
              Related Publications
            </Typography>
            <Grid container spacing={3}>
              {relatedArticles.slice(0, 3).map((rel) => (
                <Grid item xs={12} sm={4} key={rel.id}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: '#1A1816',
                      border: '1px solid #2D2824',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', mb: 1, lineHeight: 1.3 }}>
                        {rel.title}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/blog/${rel.slug}`}
                        size="small"
                        endIcon={<ArrowIcon fontSize="small" />}
                        sx={{ color: '#F47A20', p: 0, mt: 1, fontWeight: 700 }}
                      >
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};
