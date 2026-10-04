import React from 'react';
import { Box } from '@mui/material';

interface KalamLogoProps {
  variant?: 'full' | 'compact' | 'horizontal' | 'markOnly' | 'default';
  height?: number | string;
  lightBackground?: boolean;
  showTagline?: boolean;
}

export const KalamLogo: React.FC<KalamLogoProps> = ({
  variant = 'default',
  height = 40,
  lightBackground = true,
  showTagline,
}) => {
  const isMarkOnly = variant === 'markOnly' || variant === 'compact';
  const logoSrc = isMarkOnly ? '/kalam-mark-standalone.png' : '/kalam-logo-standalone.png';
  const altText = isMarkOnly ? 'KALAM Mark' : 'KALAM';

  return (
    <Box
      component="img"
      src={logoSrc}
      alt={altText}
      sx={{
        height: height,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
        filter: lightBackground
          ? 'none'
          : 'brightness(0) invert(1) drop-shadow(0 0 1px rgba(255,255,255,0.8))',
      }}
    />
  );
};
