import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { EditNoteOutlined as CreateIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  showTagline?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No content found',
  description = 'There are no items matching your criteria or no records exist yet in your workspace.',
  icon,
  actionLabel,
  onAction,
  showTagline = false,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 2.5,
        borderStyle: 'dashed',
        borderColor: '#DCD2C4',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#FAF7F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E59B2F',
          mb: 2,
          border: '1px solid #DCD2C4',
        }}
      >
        {icon || <CreateIcon sx={{ fontSize: 28 }} />}
      </Box>

      <Typography variant="h3" sx={{ color: '#171717', mb: 1, fontSize: '1.35rem', fontWeight: 700, fontFamily: 'Newsreader, serif' }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ maxWidth: 440, mb: 2.5, lineHeight: 1.6, color: '#4A4540' }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            backgroundColor: '#171717',
            color: '#FAF7F0',
            fontWeight: 700,
            px: 3,
            '&:hover': { backgroundColor: '#2D2926' },
          }}
        >
          {actionLabel}
        </Button>
      )}

      {showTagline && (
        <Typography
          variant="caption"
          sx={{
            mt: 3,
            fontWeight: 800,
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: '#E59B2F',
            textTransform: 'uppercase',
          }}
        >
          KALAM | WRITE | CREATE | STORYTELL | EXPRESS
        </Typography>
      )}
    </Paper>
  );
};
