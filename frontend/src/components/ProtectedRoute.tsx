import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/common';
import { Box, Typography, Button, Paper } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.role === 'admin' || allowedRoles.includes(user.role);
    if (!hasRole) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', maxWidth: 440, borderRadius: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'error.light',
                color: 'error.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your assigned user role (<strong>{user.role}</strong>) does not have permission to view this module.
            </Typography>
            <Button variant="contained" color="primary" href="/dashboard">
              Return to Dashboard
            </Button>
          </Paper>
        </Box>
      );
    }
  }

  return <Outlet />;
};
