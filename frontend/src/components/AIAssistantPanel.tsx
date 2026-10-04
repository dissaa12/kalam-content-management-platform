import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Tune as ToneIcon,
  ShortText as SummaryIcon,
  Share as SocialIcon,
  VpnKey as KeywordIcon,
  FormatListNumbered as OutlineIcon,
  TouchApp as CtaIcon,
  Speed as ReadabilityIcon,
  Check as AcceptIcon,
  Delete as DiscardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { aiService } from '../services/aiService';
import { AIAction, AITone, AIResponseData } from '../types/ai';

const TONES: AITone[] = ['Professional', 'Friendly', 'Persuasive', 'Informative', 'Concise'];

interface AIAssistantPanelProps {
  inputContent: string;
  onAccept?: (resultText: string, action: AIAction) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ inputContent, onAccept }) => {
  const [selectedTone, setSelectedTone] = useState<AITone>('Professional');
  const [customInput, setCustomInput] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<AIAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generated Result State
  const [aiResponse, setAiResponse] = useState<AIResponseData | null>(null);
  const [editableResult, setEditableResult] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const activeContent = customInput.trim() || inputContent.trim() || 'AI Content Optimization';

  const handleRunAIAction = async (action: AIAction) => {
    try {
      setLoadingAction(action);
      setError(null);

      const res = await aiService.generate({
        action,
        content: activeContent,
        tone: selectedTone,
      });

      setAiResponse(res);
      setEditableResult(res.result);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI Assistant request failed. Please check network connection.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAccept = () => {
    if (onAccept && aiResponse) {
      onAccept(editableResult, aiResponse.action);
    }
    setAiResponse(null);
    setEditableResult('');
  };

  const handleDiscard = () => {
    setAiResponse(null);
    setEditableResult('');
    setIsEditing(false);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E7DED2' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Kalam AI Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                backgroundColor: 'rgba(229, 155, 47, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C96B4B',
              }}
            >
              <AIIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#171717', fontSize: '1.15rem' }}>
                  KALAM AI
                </Typography>
                <Chip label="Content Assistant" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#E59B2F', color: '#171717' }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#4A4540', fontSize: '0.825rem' }}>
                What would you like to generate or optimize?
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#DCD2C4' }} />

        {/* Custom Context / Text Input if empty */}
        {!inputContent && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#3A3530', display: 'block', mb: 0.5 }}>
              Topic Context / Draft Snippet
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Enter article topic, key bullet points, or raw draft notes..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#171717',
                  backgroundColor: '#FAF7F0',
                  '& fieldset': { borderColor: '#DCD2C4' },
                  '&:hover fieldset': { borderColor: '#171717' },
                  '&.Mui-focused fieldset': { borderColor: '#171717' },
                },
                '& .MuiInputBase-input::placeholder': { color: '#6B625A', opacity: 1 },
              }}
            />
          </Box>
        )}

        {/* Tone Selector */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '0.85rem', color: '#171717' }}>
          Writing Tone
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.8} sx={{ mb: 3 }}>
          {TONES.map((tone) => (
            <Chip
              key={tone}
              label={tone}
              clickable
              onClick={() => setSelectedTone(tone)}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                backgroundColor: selectedTone === tone ? '#171717' : '#FAF7F0',
                color: selectedTone === tone ? '#FAF7F0' : '#171717',
                border: selectedTone === tone ? '1px solid #171717' : '1px solid #DCD2C4',
                '&:hover': {
                  backgroundColor: selectedTone === tone ? '#333333' : '#E8DFD2',
                },
              }}
            />
          ))}
        </Stack>

        {/* Action Buttons Grid */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.85rem', color: '#171717' }}>
          AI Utilities
        </Typography>

        <Grid container spacing={1.2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'generate_headlines' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <TitleIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('generate_headlines')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Generate Titles
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'generate_meta_description' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <DescriptionIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('generate_meta_description')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              SEO Meta Description
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'rewrite' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <EditIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('rewrite')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Improve Writing
            </Button>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'change_tone' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <ToneIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('change_tone')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Change Tone
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'summarize' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <SummaryIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('summarize')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Summarize
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'social_caption' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <SocialIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('social_caption')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Social Caption
            </Button>
          </Grid>

          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'suggest_keywords' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <KeywordIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('suggest_keywords')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Keywords
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'generate_outline' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <OutlineIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('generate_outline')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Content Outline
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'generate_cta' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <CtaIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('generate_cta')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              CTA Ideas
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={loadingAction === 'readability_analysis' ? <CircularProgress size={14} sx={{ color: '#E59B2F' }} /> : <ReadabilityIcon sx={{ color: '#E59B2F' }} />}
              disabled={!!loadingAction}
              onClick={() => handleRunAIAction('readability_analysis')}
              sx={{ backgroundColor: '#171717', color: '#FAF7F0', border: '1px solid #3A3530', py: 0.8, fontSize: '0.8rem', fontWeight: 700, '&:hover': { backgroundColor: '#2E2926', borderColor: '#E59B2F' } }}
            >
              Readability Diagnostic Analysis
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, color: '#991B1B', backgroundColor: '#FEF2F2', fontWeight: 600 }}>
            {error}
          </Alert>
        )}

        {/* Generated Result Preview Area & Approval Controls */}
        {aiResponse && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderColor: '#E59B2F',
              backgroundColor: '#FFFDF8',
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(229, 155, 47, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#171717' }}>
                KALAM AI Suggestion ({aiResponse.action.replace('_', ' ').toUpperCase()})
              </Typography>
              <Chip
                label={aiResponse.provider_used}
                size="small"
                sx={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#FAF7F0', color: '#3A3530', border: '1px solid #DCD2C4' }}
              />
            </Box>

            {/* Editable Output Field */}
            <TextField
              fullWidth
              multiline
              rows={5}
              value={editableResult}
              onChange={(e) => setEditableResult(e.target.value)}
              sx={{
                bgcolor: '#FFFFFF',
                mb: 2,
                '& .MuiOutlinedInput-root': { fontSize: '0.9rem', lineHeight: 1.6, color: '#171717', fieldset: { borderColor: '#DCD2C4' } },
              }}
            />

            {/* Readability Metrics */}
            {aiResponse.readability_metrics && (
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#FAF7F0', borderColor: '#DCD2C4' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#3A3530', display: 'block' }}>
                  Readability Metrics:
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                      Words: <strong style={{ color: '#171717' }}>{aiResponse.readability_metrics.word_count}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                      Est Reading: <strong style={{ color: '#171717' }}>~{aiResponse.readability_metrics.reading_time_minutes} min</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                      Reading Ease: <strong style={{ color: '#171717' }}>{aiResponse.readability_metrics.flesch_reading_ease}/100</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {aiResponse.suggestions.map((sug, i) => (
                  <Typography key={i} variant="caption" sx={{ color: '#4A4540', display: 'block', fontStyle: 'italic', fontWeight: 500 }}>
                    💡 Tip: {sug}
                  </Typography>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 1.5, borderColor: '#DCD2C4' }} />

            {/* Explicit Human Review Action Buttons */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DiscardIcon />}
                onClick={handleDiscard}
                size="small"
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                Discard
              </Button>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                size="small"
                sx={{ borderRadius: 1.5, fontWeight: 700, borderColor: '#DCD2C4', color: '#171717' }}
              >
                {isEditing ? 'Editing' : 'Edit Text'}
              </Button>

              <Button
                variant="contained"
                startIcon={<AcceptIcon />}
                onClick={handleAccept}
                size="small"
                sx={{ borderRadius: 1.5, fontWeight: 700, backgroundColor: '#171717', color: '#FAF7F0', '&:hover': { backgroundColor: '#333333' } }}
              >
                Accept & Apply
              </Button>
            </Stack>
          </Paper>
        )}

        <Alert severity="info" icon={<InfoIcon fontSize="inherit" sx={{ color: '#E59B2F' }} />} sx={{ mt: 2.5, fontSize: '0.8rem', borderRadius: 1.5, backgroundColor: '#1E1B18', color: '#FAF7F0', border: '1px solid #3A3530' }}>
          <strong style={{ color: '#E59B2F' }}>Human-in-the-Loop Governance:</strong> KALAM AI suggestions require explicit human author approval and will never automatically publish content.
        </Alert>
      </CardContent>
    </Card>
  );
};
