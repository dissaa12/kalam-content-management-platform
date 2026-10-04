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
  TextField,
  Stack,
  Pagination,
  Skeleton,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { contentService } from '../../services/contentService';
import { ContentItem, Category } from '../../types/content';

export const PublicBlog: React.FC = () => {
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch Categories
  useEffect(() => {
    contentService.getCategories().then(setCategories).catch(console.warn);
  }, []);

  // Fetch Published Content
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await contentService.listPublic({
        page: page,
        limit: 9,
        search: searchQuery || undefined,
        category_id: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
      });
      setArticles(res.items);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.warn('Failed to load public blog articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const gridArticles = articles.length > 0 ? (selectedCategory === 'all' && !searchQuery ? articles.slice(1) : articles) : [];

  return (
    <Box sx={{ py: 6, backgroundColor: '#141210', color: '#F7F3EA' }}>
      <Container maxWidth="lg">
        {/* HEADER & SEARCH BAR */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontWeight: 700,
              fontSize: { xs: '2.25rem', md: '3.25rem' },
              mb: 2,
              color: '#F7F3EA',
            }}
          >
            KALAM Publications & Insights
          </Typography>
          <Typography variant="h6" sx={{ color: '#B3A89C', maxWidth: 620, mx: 'auto', mb: 4, fontWeight: 400 }}>
            Curated thought leadership, AI storytelling frameworks, and digital marketing strategies.
          </Typography>

          {/* Search Box */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ maxWidth: 580, mx: 'auto', display: 'flex', gap: 1 }}
          >
            <TextField
              fullWidth
              placeholder="Search published articles by keyword or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#B3A89C' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#1A1816',
                  borderRadius: 1.5,
                  color: '#F7F3EA',
                  '& fieldset': { borderColor: '#2D2824' },
                  '&:hover fieldset': { borderColor: '#F47A20' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#F47A20', px: 3, fontWeight: 700, '&:hover': { backgroundColor: '#E86A16' } }}
            >
              Search
            </Button>
          </Box>
        </Box>

        {/* CATEGORY FILTER PILLS */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} justifyContent="center">
            <Chip
              label="All Categories"
              clickable
              onClick={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              sx={{
                fontWeight: 700,
                backgroundColor: selectedCategory === 'all' ? '#F47A20' : '#1A1816',
                color: selectedCategory === 'all' ? '#FFF' : '#F7F3EA',
                border: selectedCategory === 'all' ? '1px solid #E86A16' : '1px solid #2D2824',
              }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                clickable
                onClick={() => {
                  setSelectedCategory(String(cat.id));
                  setPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  backgroundColor: selectedCategory === String(cat.id) ? '#F47A20' : '#1A1816',
                  color: selectedCategory === String(cat.id) ? '#FFF' : '#F7F3EA',
                  border: selectedCategory === String(cat.id) ? '1px solid #E86A16' : '1px solid #2D2824',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* FEATURED HERO ARTICLE (IF ON PAGE 1 & NO SEARCH) */}
        {!searchQuery && selectedCategory === 'all' && page === 1 && featuredArticle && (
          <Card
            sx={{
              mb: 8,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              backgroundColor: '#1A1816',
              border: '1px solid #2D2824',
              borderRadius: 2.5,
              overflow: 'hidden',
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 260, md: 360 } }}
              image={featuredArticle.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
              alt={featuredArticle.title}
            />
            <CardContent sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label="FEATURED ARTICLE" size="small" sx={{ bgcolor: '#F47A20', color: '#fff', fontWeight: 800, fontSize: '0.65rem' }} />
                {featuredArticle.category_name && (
                  <Chip label={featuredArticle.category_name} size="small" variant="outlined" sx={{ color: '#B3A89C', borderColor: '#2D2824' }} />
                )}
              </Stack>
              <Typography variant="h3" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', mb: 2, lineHeight: 1.25 }}>
                {featuredArticle.title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#B3A89C', mb: 3, lineHeight: 1.6 }}>
                {featuredArticle.excerpt || 'Explore key strategies and technological advancements shaping the future of enterprise marketing...'}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#B3A89C' }}>
                  By <strong>{featuredArticle.author_name}</strong> • {new Date(featuredArticle.published_at || featuredArticle.created_at).toLocaleDateString()}
                </Typography>
                <Button
                  component={Link}
                  to={`/blog/${featuredArticle.slug}`}
                  variant="contained"
                  endIcon={<ArrowIcon />}
                  sx={{ backgroundColor: '#171717', color: '#FFFDF8', fontWeight: 700, '&:hover': { backgroundColor: '#333' } }}
                >
                  Read Article
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ARTICLES GRID */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2, mb: 1, bgcolor: '#1A1816' }} />
                <Skeleton height={28} sx={{ bgcolor: '#1A1816' }} />
                <Skeleton height={20} width="70%" sx={{ bgcolor: '#1A1816' }} />
              </Grid>
            ))}
          </Grid>
        ) : gridArticles.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', bgcolor: '#1A1816', borderColor: '#2D2824' }}>
            <ArticleIcon sx={{ fontSize: 48, color: '#B3A89C', mb: 2 }} />
            <Typography variant="h5" color="#F7F3EA" fontWeight={700}>
              No published articles match your criteria.
            </Typography>
            <Typography variant="body2" color="#B3A89C" sx={{ mt: 1 }}>
              Try searching with different keywords or selecting another category.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {gridArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#1A1816',
                    border: '1px solid #2D2824',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#F47A20', transform: 'translateY(-3px)' },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={article.featured_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'}
                    alt={article.title}
                  />
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                      <Chip
                        label={article.content_type.replace('_', ' ')}
                        size="small"
                        sx={{ fontSize: '0.62rem', height: 18, bgcolor: 'rgba(244, 122, 32, 0.12)', color: '#F47A20', fontWeight: 700 }}
                      />
                      {article.category_name && (
                        <Chip label={article.category_name} size="small" variant="outlined" sx={{ fontSize: '0.62rem', height: 18, color: '#B3A89C', borderColor: '#2D2824' }} />
                      )}
                    </Stack>

                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'Newsreader, Georgia, serif',
                        fontWeight: 700,
                        color: '#F7F3EA',
                        mb: 1.5,
                        fontSize: '1.15rem',
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
                        mb: 2.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      {article.excerpt || 'Read the full story to learn actionable insights...'}
                    </Typography>

                    <Divider sx={{ my: 1.5, borderColor: '#2D2824' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#B3A89C' }}>
                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/blog/${article.slug}`}
                        size="small"
                        endIcon={<ArrowIcon fontSize="small" />}
                        sx={{ color: '#F47A20', fontWeight: 700 }}
                      >
                        Read Post
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                '& .MuiPaginationItem-root': { color: '#F7F3EA' },
                '& .Mui-selected': { backgroundColor: '#F47A20 !important', color: '#FFF' },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};
