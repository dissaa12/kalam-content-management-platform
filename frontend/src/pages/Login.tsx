import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/common';
import { KalamLogo } from '../components/KalamLogo';

const DEMO_ACCOUNTS = [
  { role: 'admin' as UserRole, label: 'Admin', email: 'admin@enterprise.com', pass: 'Admin123!' },
  { role: 'marketing_manager' as UserRole, label: 'Manager', email: 'manager@enterprise.com', pass: 'Manager123!' },
  { role: 'content_editor' as UserRole, label: 'Editor', email: 'editor@enterprise.com', pass: 'Editor123!' },
  { role: 'content_author' as UserRole, label: 'Author', email: 'author@enterprise.com', pass: 'Author123!' },
  { role: 'reviewer' as UserRole, label: 'Reviewer', email: 'reviewer@enterprise.com', pass: 'Reviewer123!' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('manager@enterprise.com');
  const [password, setPassword] = useState('Manager123!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF7F0',
        px: 2,
        py: 5,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 2.5,
          boxShadow: '0 8px 30px rgba(23, 23, 23, 0.05)',
          backgroundColor: '#FFFFFF',
          borderColor: '#E8DFD2',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {/* KALAM Brand Header - Standalone Wordmark */}
          <Box sx={{ mb: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <KalamLogo height={42} lightBackground />
            <Typography variant="body2" sx={{ color: '#4A4540', mt: 1.5, fontSize: '0.85rem' }}>
              Sign in to your editorial workspace & marketing platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Work Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                size="medium"
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MuiLink
                  component={RouterLink}
                  to="/forgot-password"
                  variant="caption"
                  sx={{ color: '#C96B4B', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot Password?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                startIcon={<LockIcon />}
                fullWidth
                sx={{
                  py: 1.25,
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  backgroundColor: '#171717',
                  color: '#FAF7F0',
                  '&:hover': {
                    backgroundColor: '#333333',
                  },
                }}
              >
                Sign In to KALAM
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3.5, borderColor: '#DCD2C4' }}>
            <Typography variant="caption" sx={{ color: '#3A3530', fontWeight: 800, letterSpacing: '0.06em' }}>
              DEMO ROLE QUICK LOGIN
            </Typography>
          </Divider>

          {/* Quick Demo Credentials Switcher */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: '#FAF7F0',
              borderColor: '#DCD2C4',
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: '#3A3530', display: 'block', mb: 1.2, fontWeight: 700 }}>
              Select role credentials to test:
            </Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.8}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Chip
                  key={acc.role}
                  label={acc.label}
                  size="small"
                  onClick={() => handleSelectDemo(acc)}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    backgroundColor: email === acc.email ? '#E59B2F' : '#FFFFFF',
                    color: '#171717',
                    border: email === acc.email ? '1px solid #171717' : '1px solid #DCD2C4',
                    '&:hover': {
                      backgroundColor: email === acc.email ? '#D48A1E' : '#FAF7F0',
                    },
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};
