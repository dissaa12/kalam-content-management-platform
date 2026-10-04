import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as ApproveIcon,
  Publish as PublishIcon,
  Visibility as PreviewIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  FormatBold,
  FormatItalic,
  Title as TitleIcon,
  FormatListBulleted,
  FormatQuote,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { ContentItem, ContentType, ContentStatus, Category } from '../types/content';
import { contentService } from '../services/contentService';
import { ContentPreviewModal } from './ContentPreviewModal';
import { useAuth } from '../hooks/useAuth';
import { SEOHealthPanel } from './SEOHealthPanel';
import { AIAssistantPanel } from './AIAssistantPanel';
import { AIAction } from '../types/ai';

const contentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required'),
  content_type: z.enum([
    'blog',
    'landing_page',
    'email',
    'social_post',
    'advertisement',
    'case_study',
    'announcement',
  ]),
  category_id: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(10, 'Body content must be at least 10 characters long'),
  featured_image: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
  canonical_url: z.string().optional(),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

interface ContentFormProps {
  initialValues?: ContentItem;
  isEdit?: boolean;
}

export const ContentForm: React.FC<ContentFormProps> = ({ initialValues, isEdit = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialValues?.tags?.map((t) => t.name) || []);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ContentItem | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      slug: initialValues?.slug || '',
      content_type: initialValues?.content_type || 'blog',
      category_id: initialValues?.category_id ? String(initialValues.category_id) : '',
      excerpt: initialValues?.excerpt || '',
      body: initialValues?.body || '',
      featured_image: initialValues?.featured_image || '',
      meta_title: initialValues?.seo_metadata?.meta_title || '',
      meta_description: initialValues?.seo_metadata?.meta_description || '',
      keywords: initialValues?.seo_metadata?.keywords || '',
      canonical_url: initialValues?.seo_metadata?.canonical_url || '',
    },
  });

  const watchTitle = watch('title');
  const watchSlug = watch('slug');
  const watchBody = watch('body');
  const watchMetaTitle = watch('meta_title');
  const watchMetaDescription = watch('meta_description');
  const watchKeywords = watch('keywords');
  const watchCanonicalUrl = watch('canonical_url');
  const watchFeaturedImage = watch('featured_image');

  // Word count & reading time calculations
  const wordCount = watchBody ? watchBody.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = watchBody ? watchBody.length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    contentService.getCategories().then(setCategories).catch(console.warn);
  }, []);

  const handleTitleChange = (val: string) => {
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const currentBody = watchBody || '';
    setValue('body', `${currentBody}\n${prefix}sample text${suffix}`);
  };

  const handleAcceptAIResult = (resultText: string, action: AIAction) => {
    if (action === 'generate_headlines') {
      const firstLine = resultText.split('\n')[0].replace(/^[0-9]+\.\s*/, '').trim();
      setValue('title', firstLine);
      handleTitleChange(firstLine);
    } else if (action === 'generate_meta_description') {
      setValue('meta_description', resultText);
    } else if (action === 'suggest_keywords') {
      setValue('keywords', resultText);
    } else if (action === 'summarize') {
      setValue('excerpt', resultText);
    } else if (['rewrite', 'change_tone', 'generate_outline', 'social_caption', 'generate_cta'].includes(action)) {
      setValue('body', resultText);
    }
  };

  const saveWithStatus = async (formData: ContentFormData, targetStatus: ContentStatus) => {
    setServerError(null);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content_type: formData.content_type,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        excerpt: formData.excerpt,
        body: formData.body,
        featured_image: formData.featured_image || undefined,
        status: targetStatus,
        tag_names: tags,
        seo_metadata: {
          meta_title: formData.meta_title || formData.title,
          meta_description: formData.meta_description || formData.excerpt,
          keywords: formData.keywords,
          canonical_url: formData.canonical_url,
        },
      };

      if (isEdit && initialValues) {
        await contentService.update(initialValues.id, payload);
      } else {
        await contentService.create(payload);
      }

      navigate('/content');
    } catch (err: any) {
      console.error('Content save error:', err);
      setServerError(err.response?.data?.detail || 'Failed to save content item to server.');
    }
  };

  const handleOpenPreview = (formData: ContentFormData) => {
    const categoryName = categories.find((c) => String(c.id) === formData.category_id)?.name;
    const previewObj: ContentItem = {
      id: initialValues?.id || 0,
      title: formData.title || 'Untitled Article',
      slug: formData.slug || 'untitled-article',
      content_type: formData.content_type as ContentType,
      body: formData.body,
      excerpt: formData.excerpt,
      author_id: user?.id ? Number(user.id) : 1,
      author_name: user?.full_name || 'KALAM Author',
      category_name: categoryName,
      status: 'draft',
      featured_image: formData.featured_image,
      tags: tags.map((t) => ({ id: 0, name: t, slug: t })),
      seo_metadata: {
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        keywords: formData.keywords,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPreviewData(previewObj);
    setPreviewOpen(true);
  };

  return (
    <form>
      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {serverError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Distraction-free Writing & Editor Workspace */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#171717', fontFamily: 'Newsreader, serif' }}>
                  Editorial Writing Workspace
                </Typography>

                {/* Real-time word count & reading time indicator */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={`${wordCount} words`}
                    size="small"
                    sx={{ backgroundColor: '#FAF7F0', color: '#171717', border: '1px solid #E8DFD2', fontWeight: 700, fontSize: '0.725rem' }}
                  />
                  <Chip
                    label={`${charCount} chars`}
                    size="small"
                    sx={{ backgroundColor: '#FAF7F0', color: '#171717', border: '1px solid #E8DFD2', fontWeight: 700, fontSize: '0.725rem' }}
                  />
                  <Chip
                    label={`~${readingTime} min read`}
                    size="small"
                    sx={{ backgroundColor: '#E59B2F', color: '#FFFFFF', fontWeight: 700, fontSize: '0.725rem' }}
                  />
                </Stack>
              </Box>

              <Stack spacing={2.5}>
                {/* Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      placeholder="Enter headline..."
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        handleTitleChange(e.target.value);
                      }}
                      inputProps={{ style: { fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Newsreader, Georgia, serif', color: '#171717' } }}
                    />
                  )}
                />

                {/* Slug */}
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="URL Slug"
                      fullWidth
                      size="small"
                      error={!!errors.slug}
                      helperText={errors.slug?.message || 'Permlink identifier for search engines'}
                    />
                  )}
                />

                {/* Excerpt */}
                <Controller
                  name="excerpt"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Summary / Editorial Excerpt"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Concise overview for cards and social snippets..."
                    />
                  )}
                />

                {/* Body Content with Formatting Toolbar */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#171717' }}>
                    Body Content (Markdown Supported)
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1,
                      mb: 1,
                      display: 'flex',
                      gap: 1,
                      backgroundColor: '#FAF7F0',
                      borderColor: '#E8DFD2',
                      borderRadius: 1.5,
                    }}
                  >
                    <Tooltip title="Heading">
                      <IconButton size="small" onClick={() => insertMarkdown('# ')}>
                        <TitleIcon fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bold">
                      <IconButton size="small" onClick={() => insertMarkdown('**', '**')}>
                        <FormatBold fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Italic">
                      <IconButton size="small" onClick={() => insertMarkdown('*', '*')}>
                        <FormatItalic fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bullet List">
                      <IconButton size="small" onClick={() => insertMarkdown('- ')}>
                        <FormatListBulleted fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Blockquote">
                      <IconButton size="small" onClick={() => insertMarkdown('> ')}>
                        <FormatQuote fontSize="small" sx={{ color: '#171717' }} />
                      </IconButton>
                    </Tooltip>
                  </Paper>

                  <Controller
                    name="body"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="Express your story here..."
                        fullWidth
                        multiline
                        rows={14}
                        error={!!errors.body}
                        helperText={errors.body?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.975rem',
                            lineHeight: 1.7,
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            color: '#171717',
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* KALAM AI Copilot Accordion */}
          <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: 2, mb: 3, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AIIcon sx={{ color: '#E59B2F' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#171717', fontFamily: 'Newsreader, serif' }}>
                  KALAM AI Assistant
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <AIAssistantPanel
                inputContent={watchBody || watchTitle || ''}
                onAccept={handleAcceptAIResult}
              />
            </AccordionDetails>
          </Accordion>

          {/* SEO Accordion & Real-Time Diagnostic Audit */}
          <Accordion defaultExpanded variant="outlined" sx={{ borderRadius: 2, mb: 3, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ color: '#E59B2F' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#171717', fontFamily: 'Newsreader, serif' }}>
                  SEO Optimization & Diagnostic Health Score
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2.5} sx={{ mb: 3 }}>
                <Controller
                  name="meta_title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="SEO Title"
                      fullWidth
                      size="small"
                      placeholder="Title snippet optimized for search engines (30-60 chars)"
                    />
                  )}
                />

                <Controller
                  name="meta_description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meta Description"
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      placeholder="Search snippet summary (120-160 chars)"
                    />
                  )}
                />

                <Controller
                  name="keywords"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Focus Keywords (Comma-separated)"
                      fullWidth
                      size="small"
                      placeholder="e.g. content marketing, brand strategy, AI storytelling"
                    />
                  )}
                />

                <Controller
                  name="canonical_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Canonical URL"
                      fullWidth
                      size="small"
                      placeholder="https://example.com/blog/article-slug"
                    />
                  )}
                />
              </Stack>

              {/* Live SEO Health Diagnostic Panel */}
              <SEOHealthPanel
                data={{
                  title: watchTitle || '',
                  slug: watchSlug || '',
                  body: watchBody || '',
                  meta_title: watchMetaTitle || '',
                  meta_description: watchMetaDescription || '',
                  keywords: watchKeywords || '',
                  canonical_url: watchCanonicalUrl || '',
                  featured_image: watchFeaturedImage || '',
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Right Column: Classification, Media, & Workflow Governance Actions */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: '1.1rem', color: '#171717', fontFamily: 'Newsreader, serif' }}>
                Classification & Media
              </Typography>

              <Stack spacing={2.5}>
                {/* Content Type */}
                <Controller
                  name="content_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Content Format" fullWidth size="small">
                      <MenuItem value="blog">Blog Article</MenuItem>
                      <MenuItem value="landing_page">Landing Page</MenuItem>
                      <MenuItem value="email">Email Copy</MenuItem>
                      <MenuItem value="social_post">Social Media Post</MenuItem>
                      <MenuItem value="advertisement">Advertisement</MenuItem>
                      <MenuItem value="case_study">Case Study</MenuItem>
                      <MenuItem value="announcement">Announcement</MenuItem>
                    </TextField>
                  )}
                />

                {/* Category */}
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Category" fullWidth size="small">
                      <MenuItem value="">Unassigned</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Featured Image URL */}
                <Controller
                  name="featured_image"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Featured Cover Image URL"
                      fullWidth
                      size="small"
                      placeholder="https://images.unsplash.com/..."
                      error={!!errors.featured_image}
                      helperText={errors.featured_image?.message}
                    />
                  )}
                />

                {/* Featured Image Thumbnail Preview */}
                {watchFeaturedImage && (
                  <Box
                    component="img"
                    src={watchFeaturedImage}
                    alt="Featured Image Preview"
                    sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #E8DFD2' }}
                    onError={(e: any) => (e.target.style.display = 'none')}
                  />
                )}

                {/* Tag Chip Input */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#171717' }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add tag (e.g. Strategy)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      fullWidth
                    />
                    <Button variant="outlined" onClick={handleAddTag} sx={{ borderColor: '#E8DFD2', color: '#171717' }}>
                      Add
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {tags.map((t) => (
                      <Chip key={t} label={`#${t}`} size="small" onDelete={() => handleRemoveTag(t)} sx={{ backgroundColor: '#FAF7F0', color: '#171717', border: '1px solid #E8DFD2', fontWeight: 600 }} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Workflow Governance Actions */}
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: '1.1rem', color: '#171717', fontFamily: 'Newsreader, serif' }}>
                Workflow & Governance
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => saveWithStatus(data, 'draft'))}
                  fullWidth
                  sx={{ backgroundColor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { backgroundColor: '#2D2926' } }}
                >
                  Save Draft
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<SendIcon sx={{ color: '#E59B2F' }} />}
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => saveWithStatus(data, 'in_review'))}
                  fullWidth
                  sx={{ borderColor: '#E59B2F', color: '#E59B2F', fontWeight: 700, '&:hover': { backgroundColor: '#FAF7F0' } }}
                >
                  Submit for Review
                </Button>

                {user && ['admin', 'marketing_manager', 'content_editor', 'reviewer'].includes(user.role) && (
                  <Button
                    variant="outlined"
                    startIcon={<ApproveIcon />}
                    disabled={isSubmitting}
                    onClick={handleSubmit((data) => saveWithStatus(data, 'approved'))}
                    fullWidth
                    sx={{ borderColor: '#15803D', color: '#15803D', fontWeight: 700 }}
                  >
                    Approve Content
                  </Button>
                )}

                {user && ['admin', 'marketing_manager'].includes(user.role) && (
                  <Button
                    variant="contained"
                    startIcon={<PublishIcon />}
                    disabled={isSubmitting}
                    onClick={handleSubmit((data) => saveWithStatus(data, 'published'))}
                    fullWidth
                    sx={{ backgroundColor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { backgroundColor: '#2D2926' } }}
                  >
                    Publish Now
                  </Button>
                )}

                <Divider sx={{ my: 1, borderColor: '#E8DFD2' }} />

                <Button
                  variant="text"
                  startIcon={<PreviewIcon />}
                  onClick={handleSubmit(handleOpenPreview)}
                  fullWidth
                  sx={{ color: '#171717', fontWeight: 600 }}
                >
                  Preview Website Render
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Preview Modal */}
      <ContentPreviewModal open={previewOpen} content={previewData} onClose={() => setPreviewOpen(false)} />
    </form>
  );
};
