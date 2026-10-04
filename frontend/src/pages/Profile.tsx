import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { getRoleLabel } from '../utils/formatters';
import { Lock as LockIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setMessage(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password. Please check current password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Box>
      <PageHeader
        title="User Profile & Security Settings"
        subtitle="Manage personal details, account credentials, and security settings."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />

      <Grid container spacing={3}>
        {/* User Card Header */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                alt={user.full_name}
                sx={{
                  width: 90,
                  height: 90,
                  fontSize: '2rem',
                  fontWeight: 800,
                  bgcolor: '#171717',
                  color: '#FAF7F0',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  fontFamily: 'Newsreader, serif',
                }}
              >
                {user.first_name.charAt(0)}
              </Avatar>

              <Typography variant="h3" fontWeight={800} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
                {user.full_name}
              </Typography>

              <Typography variant="body2" sx={{ color: '#4A4540', mb: 2 }}>
                {user.email}
              </Typography>

              <Chip
                label={getRoleLabel(user.role)}
                sx={{ fontWeight: 800, fontSize: '0.8rem', px: 1, bgcolor: '#E59B2F', color: '#171717' }}
              />

              <Divider sx={{ my: 3, borderColor: '#DCD2C4' }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 1, letterSpacing: 0.8, color: '#3A3530' }}>
                  ASSIGNED PERMISSIONS ({user.permissions?.length || 0})
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                  {user.permissions?.map((perm) => (
                    <Chip key={perm} label={perm} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: '#DCD2C4', color: '#171717' }} />
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Form */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Change Account Password
              </Typography>
              <Typography variant="body2" sx={{ color: '#4A4540', mb: 3 }}>
                Ensure your account uses a strong password minimum 6 characters.
              </Typography>

              {message && (
                <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handlePasswordChange}>
                <Stack spacing={2.5} sx={{ maxWidth: 480 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    helperText="Minimum 6 characters"
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LockIcon />}
                    disabled={submitting}
                    sx={{ width: 'fit-content', py: 1, px: 3, fontWeight: 700, bgcolor: '#171717', color: '#FAF7F0', '&:hover': { bgcolor: '#2D2926' } }}
                  >
                    Update Password
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
