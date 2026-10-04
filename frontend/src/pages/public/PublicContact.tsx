import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import { Send as SendIcon, Email as EmailIcon, LocationOn as LocationIcon, Phone as PhoneIcon } from '@mui/icons-material';

export const PublicContact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#141210', color: '#F7F3EA' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontWeight: 700,
              fontSize: { xs: '2.25rem', md: '3.25rem' },
              mb: 2,
              color: '#F7F3EA',
            }}
          >
            Get in Touch with KALAM
          </Typography>
          <Typography variant="h6" sx={{ color: '#B3A89C', fontWeight: 400 }}>
            Have questions about enterprise deployment, KALAM AI assistant tools, or editorial workflows?
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, height: '100%', backgroundColor: '#1A1816', border: '1px solid #2D2824', borderRadius: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#F7F3EA', mb: 3 }}>
                Contact Information
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <EmailIcon sx={{ color: '#F47A20' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#B3A89C', display: 'block' }}>
                      Email Us
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F7F3EA', fontWeight: 600 }}>
                      contact@kalam-cms.io
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#F47A20' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#B3A89C', display: 'block' }}>
                      Call Us
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F7F3EA', fontWeight: 600 }}>
                      +1 (800) 555-0199
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <LocationIcon sx={{ color: '#F47A20' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#B3A89C', display: 'block' }}>
                      Headquarters
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F7F3EA', fontWeight: 600 }}>
                      San Francisco, CA & London, UK
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, backgroundColor: '#1A1816', border: '1px solid #2D2824', borderRadius: 2.5 }}>
              {submitted && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>
                  Thank you! Your message has been sent to the KALAM editorial team. We will respond within 24 hours.
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    required
                    label="Full Name"
                    fullWidth
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    InputProps={{ sx: { color: '#F7F3EA' } }}
                    InputLabelProps={{ sx: { color: '#B3A89C' } }}
                  />
                  <TextField
                    required
                    type="email"
                    label="Work Email"
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    InputProps={{ sx: { color: '#F7F3EA' } }}
                    InputLabelProps={{ sx: { color: '#B3A89C' } }}
                  />
                  <TextField
                    label="Subject"
                    fullWidth
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    InputProps={{ sx: { color: '#F7F3EA' } }}
                    InputLabelProps={{ sx: { color: '#B3A89C' } }}
                  />
                  <TextField
                    required
                    multiline
                    rows={4}
                    label="Message"
                    fullWidth
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    InputProps={{ sx: { color: '#F7F3EA' } }}
                    InputLabelProps={{ sx: { color: '#B3A89C' } }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{ backgroundColor: '#F47A20', color: '#FFF', fontWeight: 700, '&:hover': { backgroundColor: '#E86A16' } }}
                  >
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
