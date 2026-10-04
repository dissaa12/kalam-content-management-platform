import React from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Stack, Divider, Grid } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { Save as SaveIcon } from '@mui/icons-material';

export const Settings: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Platform Settings"
        subtitle="Global enterprise configurations, API keys, and organization preferences."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Organization Profile
              </Typography>

              <Stack spacing={2.5}>
                <TextField label="Platform Organization Name" defaultValue="Acme Enterprise Tech" fullWidth />
                <TextField label="API Base URL" defaultValue="http://localhost:8000/api" fullWidth disabled helperText="Configured via .env environment" />
                <TextField label="AI Service Key Placeholder" defaultValue="sk-placeholder-ai-key-******" type="password" fullWidth helperText="Configured in backend .env" />

                <Divider sx={{ my: 1, borderColor: '#DCD2C4' }} />

                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#171717' }}>
                  Notification Rules
                </Typography>
                <FormControlLabel control={<Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#E59B2F' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#E59B2F' } }} />} label="Email notification on content review request" sx={{ color: '#171717' }} />
                <FormControlLabel control={<Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#E59B2F' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#E59B2F' } }} />} label="Slack alert when campaign budget exceeds 80%" sx={{ color: '#171717' }} />

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ width: 'fit-content', mt: 2, bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#333333' } }}
                >
                  Save Preferences
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
