import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { Add as AddIcon } from '@mui/icons-material';

const DEMO_TAGS = [
  'AI', 'SaaS', 'B2B', 'Growth', 'Automation', 'Workflows', 'Security', 'Compliance',
  'Conversion', 'Analytics', 'Attribution', 'Enterprise', 'Strategy', 'Leadership'
];

export const Tags: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Content Tags & Metadata"
        subtitle="Manage taxonomy labels used across content filtering and search indexing."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Tags' }]}
        actions={[{ label: 'New Tag', icon: <AddIcon /> }]}
      />

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2, fontFamily: 'Newsreader, serif', color: '#171717' }}>
            Active System Tags ({DEMO_TAGS.length})
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1.5}>
            {DEMO_TAGS.map((t) => (
              <Chip
                key={t}
                label={`#${t}`}
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.85rem', borderColor: '#DCD2C4', color: '#171717', bgcolor: '#FAF7F0' }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
