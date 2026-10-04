import React from 'react';
import { Box } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { ContentForm } from '../components/ContentForm';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export const ContentCreate: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Create New Content Item"
        subtitle="Write & storytell across blogs, landing pages, email campaigns, case studies, and social media."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content' },
          { label: 'Create Content' },
        ]}
        actions={[{ label: 'Back to List', href: '/content', variant: 'outlined', icon: <BackIcon /> }]}
      />

      <ContentForm />
    </Box>
  );
};
