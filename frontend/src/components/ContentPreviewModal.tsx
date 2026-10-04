import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  DesktopWindows as DesktopIcon,
  PhoneIphone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ContentItem } from '../types/content';
import { formatDate, getContentTypeConfig, getStatusConfig } from '../utils/formatters';

interface ContentPreviewModalProps {
  open: boolean;
  content: ContentItem | null;
  onClose: () => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({ open, content, onClose }) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!content) return null;

  const typeConfig = getContentTypeConfig(content.content_type);
  const statusConfig = getStatusConfig(content.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, borderColor: '#DCD2C4', border: '1px solid #DCD2C4' } }}>
      {/* Modal Header */}
      <DialogTitle sx={{ py: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
            Live Content Website Preview
          </Typography>
          <Chip label={statusConfig.label} color={statusConfig.color} size="small" sx={{ fontWeight: 700 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Desktop View">
            <IconButton color={device === 'desktop' ? 'primary' : 'default'} onClick={() => setDevice('desktop')} sx={{ color: device === 'desktop' ? '#E59B2F' : '#4A4540' }}>
              <DesktopIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mobile View">
            <IconButton color={device === 'mobile' ? 'primary' : 'default'} onClick={() => setDevice('mobile')} sx={{ color: device === 'mobile' ? '#E59B2F' : '#4A4540' }}>
              <PhoneIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: '#DCD2C4' }} />

      {/* Modal Body - Public Website Simulation */}
      <DialogContent sx={{ p: 3, backgroundColor: '#FAF7F0' }}>
        <Box
          sx={{
            mx: 'auto',
            width: device === 'mobile' ? 380 : '100%',
            maxWidth: 720,
            transition: 'width 0.3s ease',
            backgroundColor: '#FFFFFF',
            borderRadius: 3,
            p: { xs: 2.5, sm: 4 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #DCD2C4',
          }}
        >
          {/* Category & Type Header */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={typeConfig.label}
              size="small"
              sx={{ backgroundColor: typeConfig.badgeBg, color: typeConfig.badgeText, fontWeight: 700 }}
            />
            {content.category_name && (
              <Chip label={content.category_name} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: '#DCD2C4', color: '#171717' }} />
            )}
          </Box>

          {/* Title */}
          <Typography variant="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 800, mb: 2, lineHeight: 1.25, fontFamily: 'Newsreader, serif', color: '#171717' }}>
            {content.title}
          </Typography>

          {/* Author & Published Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, width: 40, height: 40 }}>
              {content.author_name ? content.author_name.charAt(0) : 'A'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>
                {content.author_name || 'Enterprise Author'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#4A4540' }}>
                Published: {formatDate(content.published_at || content.created_at)} • 4 min read
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

          {/* Excerpt Lead */}
          {content.excerpt && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3A3530', mb: 3, fontStyle: 'italic', borderLeft: '3px solid #E59B2F', pl: 2, fontFamily: 'Newsreader, serif' }}>
              "{content.excerpt}"
            </Typography>
          )}

          <Divider sx={{ my: 3, borderColor: '#DCD2C4' }} />

          {/* Body Content */}
          <Box sx={{ typography: 'body1', color: '#171717', lineHeight: 1.8 }}>
            {content.body ? (
              content.body.split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('# ')) {
                  return (
                    <Typography key={idx} variant="h3" fontWeight={800} sx={{ mt: 3, mb: 1.5, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                      {paragraph.replace('# ', '')}
                    </Typography>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <Typography key={idx} variant="h4" fontWeight={700} sx={{ mt: 2.5, mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                      {paragraph.replace('## ', '')}
                    </Typography>
                  );
                }
                if (paragraph.trim().length === 0) return null;
                return (
                  <Typography key={idx} variant="body1" sx={{ mb: 2, color: '#171717' }}>
                    {paragraph}
                  </Typography>
                );
              })
            ) : (
              <Typography variant="body2" sx={{ color: '#4A4540' }}>
                No body content provided.
              </Typography>
            )}
          </Box>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #DCD2C4' }}>
              <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 1, letterSpacing: 0.8, color: '#3A3530' }}>
                ARTICLE TAGS
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {content.tags.map((t) => (
                  <Chip key={t.id || t.name} label={`#${t.name}`} size="small" variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717' }} />
                ))}
              </Box>
            </Box>
          )}

          {/* SEO Metadata Drawer */}
          {content.seo_metadata && (
            <Accordion variant="outlined" sx={{ mt: 4, borderRadius: 2, borderColor: '#DCD2C4' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon fontSize="small" sx={{ color: '#E59B2F' }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>
                    Search Engine (SEO) Preview
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#FAF7F0', borderColor: '#DCD2C4', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#C96B4B', fontWeight: 700 }} display="block">
                    https://kalam.enterprise.com/{content.slug}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#171717', fontFamily: 'Newsreader, serif' }}>
                    {content.seo_metadata.meta_title || content.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4A4540' }}>
                    {content.seo_metadata.meta_description || content.excerpt || 'No meta description provided.'}
                  </Typography>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717' }}>
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};
