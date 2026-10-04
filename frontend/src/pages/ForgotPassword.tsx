import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Stack, Alert, Link as MuiLink } from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { KalamLogo } from '../components/KalamLogo';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
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
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, textAlign: 'center' }}>
            <KalamLogo height={40} lightBackground />
            <Typography variant="h3" sx={{ mt: 2.5, fontWeight: 700, fontSize: '1.5rem', color: '#171717' }}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: '#7A7067', mt: 0.5 }}>
              Enter your work email to receive recovery instructions
            </Typography>
          </Box>

          {submitted ? (
            <Stack spacing={2.5}>
              <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                A password recovery email has been sent to <strong>{email}</strong>.
              </Alert>
              <Button
                variant="outlined"
                component={RouterLink}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderColor: '#E8DFD2',
                  color: '#171717',
                  '&:hover': { borderColor: '#171717', backgroundColor: 'rgba(23,23,23,0.04)' },
                }}
              >
                Back to Sign In
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Work Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<SendIcon />}
                  fullWidth
                  sx={{ py: 1.25, fontWeight: 700, backgroundColor: '#171717', color: '#FFFFFF', '&:hover': { backgroundColor: '#333333' } }}
                >
                  Send Recovery Link
                </Button>
                <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ color: '#7A7067', textAlign: 'center', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Remember password? Sign In
                </MuiLink>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
