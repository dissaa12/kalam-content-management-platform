import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ContentStatus } from '../types/content';
import { getStatusConfig } from '../utils/formatters';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: ContentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small', sx, ...props }) => {
  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        borderRadius: '6px',
        ...sx,
      }}
      {...props}
    />
  );
};
