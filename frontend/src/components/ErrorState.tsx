import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching system data. Please check your connection or try again.',
  onRetry,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 5,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'error.light',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.05)' : '#FEF2F2',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'error.main',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
        }}
      >
        <ErrorIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#171717' }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ maxWidth: 440, mb: 3, color: '#4A4540' }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="error"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Retry Request
        </Button>
      )}
    </Paper>
  );
};
