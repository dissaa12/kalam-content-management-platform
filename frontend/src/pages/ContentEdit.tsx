import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ContentForm } from '../components/ContentForm';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { contentService } from '../services/contentService';
import { ContentItem } from '../types/content';
import { ArrowBack as BackIcon } from '@mui/icons-material';

export const ContentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      contentService
        .getById(id)
        .then((data) => {
          setContent(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load content for edit:', err);
          setError(err.response?.data?.detail || 'Failed to load content item from server.');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading content item details..." variant="card" count={2} />;
  }

  if (error || !content) {
    return <ErrorState message={error || 'Content item not found'} />;
  }

  return (
    <Box>
      <PageHeader
        title={`Edit: ${content.title}`}
        subtitle="Update content text, media, taxonomy, or workflow approval state."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content', href: '/content' },
          { label: `Edit #${content.id}` },
        ]}
        actions={[{ label: 'Back to List', href: '/content', variant: 'outlined', icon: <BackIcon /> }]}
      />

      <ContentForm initialValues={content} isEdit={true} />
    </Box>
  );
};
