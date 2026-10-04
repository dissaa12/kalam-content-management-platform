import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Stack, Card, CardContent } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'card';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading workspace resources...',
  variant = 'spinner',
  count = 3,
}) => {
  if (variant === 'skeleton') {
    return (
      <Stack spacing={2} sx={{ width: '100%', py: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={60} animation="wave" sx={{ bgcolor: '#FAF7F0', borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  if (variant === 'card') {
    return (
      <Stack spacing={2} sx={{ width: '100%', py: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
            <CardContent>
              <Skeleton variant="text" width="40%" height={28} animation="wave" />
              <Skeleton variant="text" width="80%" height={20} animation="wave" />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1.5, bgcolor: '#FAF7F0' }} animation="wave" />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        py: 6,
      }}
    >
      <CircularProgress size={40} thickness={4} sx={{ color: '#E59B2F' }} disableShrink={false} />
      <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: '#4A4540' }}>
        {message}
      </Typography>
    </Box>
  );
};
