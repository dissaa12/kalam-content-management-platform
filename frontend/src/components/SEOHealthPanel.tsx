import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  Chip,
  Paper,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export interface SEOData {
  title: string;
  slug: string;
  body?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  canonical_url?: string;
  featured_image?: string;
}

interface SEOHealthPanelProps {
  data: SEOData;
}

export interface SEOCheckResult {
  id: string;
  label: string;
  passed: boolean;
  score: number; // 0 - 100
  message: string;
  suggestion: string;
}

export const analyzeSEO = (data: SEOData) => {
  const checks: SEOCheckResult[] = [];

  // 1. Title Length Check (30 - 60 characters)
  const activeTitle = data.meta_title || data.title || '';
  const titleLen = activeTitle.length;
  if (titleLen >= 30 && titleLen <= 60) {
    checks.push({
      id: 'title_length',
      label: 'SEO Title Length',
      passed: true,
      score: 100,
      message: `Title length is optimal (${titleLen} chars).`,
      suggestion: 'Your title is concise and well-optimized for search engines.',
    });
  } else if (titleLen > 0 && (titleLen < 30 || titleLen > 60)) {
    checks.push({
      id: 'title_length',
      label: 'SEO Title Length',
      passed: false,
      score: 50,
      message: `Title length (${titleLen} chars) is outside recommended range (30-60 chars).`,
      suggestion: titleLen < 30 ? 'Expand your title with descriptive details.' : 'Shorten title to prevent truncation in search result snippets.',
    });
  } else {
    checks.push({
      id: 'title_length',
      label: 'SEO Title Length',
      passed: false,
      score: 0,
      message: 'Title is missing.',
      suggestion: 'Add a clear, keyword-rich title for search results.',
    });
  }

  // 2. Meta Description Length Check (120 - 160 characters)
  const desc = data.meta_description || '';
  const descLen = desc.length;
  if (descLen >= 120 && descLen <= 160) {
    checks.push({
      id: 'desc_length',
      label: 'Meta Description Length',
      passed: true,
      score: 100,
      message: `Meta description is optimal (${descLen} chars).`,
      suggestion: 'Description engages users effectively in search results.',
    });
  } else if (descLen > 0) {
    checks.push({
      id: 'desc_length',
      label: 'Meta Description Length',
      passed: false,
      score: 50,
      message: `Description length (${descLen} chars) should be between 120 and 160 chars.`,
      suggestion: descLen < 120 ? 'Add more context to encourage click-throughs.' : 'Trim description to avoid search engine truncation.',
    });
  } else {
    checks.push({
      id: 'desc_length',
      label: 'Meta Description Length',
      passed: false,
      score: 0,
      message: 'Meta description is missing.',
      suggestion: 'Add a compelling meta description summarizing the key content takeaways.',
    });
  }

  // 3. Keyword Presence Check
  const keywordsList = (data.keywords || '')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0);

  if (keywordsList.length > 0) {
    const primaryKw = keywordsList[0];
    const inTitle = activeTitle.toLowerCase().includes(primaryKw);
    const inDesc = desc.toLowerCase().includes(primaryKw);
    const inBody = (data.body || '').toLowerCase().includes(primaryKw);
    const inSlug = (data.slug || '').toLowerCase().includes(primaryKw.replace(/\s+/g, '-'));

    const matchCount = [inTitle, inDesc, inBody, inSlug].filter(Boolean).length;
    const score = Math.round((matchCount / 4) * 100);

    checks.push({
      id: 'keyword_presence',
      label: 'Target Keyword Integration',
      passed: matchCount >= 3,
      score: score,
      message: `Primary keyword "${primaryKw}" found in ${matchCount}/4 key areas (Title, Desc, Body, Slug).`,
      suggestion: matchCount >= 3
        ? 'Great target keyword distribution across metadata and body text.'
        : `Include focus keyword "${primaryKw}" in missing areas (${[!inTitle && 'Title', !inDesc && 'Meta Description', !inBody && 'Body', !inSlug && 'URL Slug'].filter(Boolean).join(', ')}).`,
    });
  } else {
    checks.push({
      id: 'keyword_presence',
      label: 'Target Keyword Integration',
      passed: false,
      score: 0,
      message: 'No focus keywords specified.',
      suggestion: 'Enter primary focus keywords (comma-separated) to enable relevance scoring.',
    });
  }

  // 4. Heading Structure Check
  const bodyText = data.body || '';
  const hasHeadings = /#|<h1>|<h2>|<h3>|<h4>|<h[1-6]>/i.test(bodyText) || (bodyText.length > 300 && bodyText.includes('\n'));
  checks.push({
    id: 'heading_structure',
    label: 'Heading & Content Structure',
    passed: hasHeadings,
    score: hasHeadings ? 100 : 40,
    message: hasHeadings ? 'Content includes structured headings or formatted sections.' : 'No heading tags (H1, H2, H3) detected in body text.',
    suggestion: hasHeadings ? 'Well-structured body content improves readability.' : 'Use heading tags to break text into logical, scannable sub-sections.',
  });

  // 5. Image Alt Text Check
  const hasImages = /<img|!\[/i.test(bodyText) || Boolean(data.featured_image);
  const hasAlt = /alt=["'][^"']+["']|!\[[^\]]+\]/i.test(bodyText);
  if (!hasImages) {
    checks.push({
      id: 'image_alt',
      label: 'Image Optimization & Alt Text',
      passed: true,
      score: 100,
      message: 'No images requiring alt text.',
      suggestion: 'Consider adding relevant featured images with alternative text.',
    });
  } else {
    checks.push({
      id: 'image_alt',
      label: 'Image Optimization & Alt Text',
      passed: hasAlt,
      score: hasAlt ? 100 : 30,
      message: hasAlt ? 'Images contain descriptive alternative text.' : 'Some images may be missing descriptive alt text tags.',
      suggestion: 'Add descriptive alt text to images for search indexing and accessibility.',
    });
  }

  // 6. URL & Slug Structure Check
  const slug = data.slug || '';
  const isCleanSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  checks.push({
    id: 'url_structure',
    label: 'Clean URL & Slug Structure',
    passed: isCleanSlug,
    score: isCleanSlug ? 100 : 20,
    message: isCleanSlug ? `URL slug "/${slug}" is clean and SEO-friendly.` : `Slug "${slug}" contains uppercase letters or special characters.`,
    suggestion: isCleanSlug ? 'Clean URL structure.' : 'Use lowercase letters and hyphens only without special characters.',
  });

  // Calculate Overall Score
  const totalScore = Math.round(checks.reduce((acc, c) => acc + c.score, 0) / checks.length);

  return { checks, totalScore };
};

export const SEOHealthPanel: React.FC<SEOHealthPanelProps> = ({ data }) => {
  const { checks, totalScore } = analyzeSEO(data);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SearchIcon sx={{ color: '#E59B2F' }} />
            <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
              SEO Audit & Health Score
            </Typography>
          </Stack>
          <Chip
            icon={<SpeedIcon sx={{ color: '#171717 !important' }} />}
            label={`${totalScore} / 100`}
            sx={{ fontWeight: 800, fontSize: '0.9rem', px: 1, bgcolor: totalScore >= 80 ? '#E59B2F' : totalScore >= 50 ? '#C96B4B' : '#9A3412', color: '#171717' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 600 }}>
              Overall Search Optimization Health
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#171717' }}>
              {totalScore}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={totalScore}
            sx={{ borderRadius: 1, height: 8, bgcolor: '#FAF7F0', '& .MuiLinearProgress-bar': { bgcolor: totalScore >= 80 ? '#E59B2F' : '#C96B4B' } }}
          />
        </Box>

        {/* Audit Checks List */}
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#171717' }}>
          Diagnostic Checks & Suggestions
        </Typography>

        <List disablePadding>
          {checks.map((check) => (
            <Paper key={check.id} variant="outlined" sx={{ mb: 1, p: 1.5, borderColor: '#DCD2C4', bgcolor: '#FAF7F0', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                {check.passed ? (
                  <CheckCircleIcon sx={{ color: '#E59B2F', mt: 0.3 }} fontSize="small" />
                ) : check.score > 0 ? (
                  <WarningIcon sx={{ color: '#C96B4B', mt: 0.3 }} fontSize="small" />
                ) : (
                  <ErrorIcon sx={{ color: '#9A3412', mt: 0.3 }} fontSize="small" />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>
                      {check.label}
                    </Typography>
                    <Chip
                      label={`${check.score}%`}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: check.passed ? '#171717' : '#C96B4B', color: '#FAF7F0' }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#171717' }}>
                    {check.message}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5, color: '#4A4540' }}>
                    💡 Suggestion: {check.suggestion}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>

        <Divider sx={{ my: 2, borderColor: '#DCD2C4' }} />

        {/* Mandated Disclaimer Badge */}
        <Alert severity="info" icon={<InfoIcon fontSize="inherit" sx={{ color: '#C96B4B' }} />} sx={{ fontSize: '0.75rem', bgcolor: '#FAF7F0', borderColor: '#DCD2C4', color: '#171717', border: '1px solid #DCD2C4' }}>
          <strong>Note:</strong> The SEO Health Score is an optimization guideline based on best practices and does not guarantee specific search engine rankings or traffic outcomes.
        </Alert>
      </CardContent>
    </Card>
  );
};
