import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageHeaderAction[];
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#4A4540' }} />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            if (isLast || !crumb.href) {
              return (
                <Typography key={idx} variant="caption" sx={{ color: '#171717', fontWeight: 700 }}>
                  {crumb.label}
                </Typography>
              );
            }
            return (
              <Link
                key={idx}
                component={RouterLink}
                to={crumb.href}
                variant="caption"
                sx={{ color: '#4A4540', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: '#171717' } }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, color: '#171717' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ mt: 0.5, color: '#4A4540' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && actions.length > 0 && (
          <Stack direction="row" spacing={1.5} sx={{ mt: { xs: 1, sm: 0 } }}>
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                component={action.href ? RouterLink : 'button'}
                to={action.href}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
};
