import React, { useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { AIAssistantPanel } from '../components/AIAssistantPanel';
import { AIAction } from '../types/ai';

export const AIAssistant: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAcceptAIResult = (resultText: string, action: AIAction) => {
    navigator.clipboard.writeText(resultText);
    setToastMessage(`Accepted KALAM AI ${action.replace('_', ' ')} suggestion! Copied to clipboard.`);
  };

  return (
    <Box>
      <PageHeader
        title="KALAM AI Copywriting & Optimization Studio"
        subtitle="Generate headline candidates, SEO meta descriptions, social media captions, outlines, and tone rewrites with human-in-the-loop governance."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'KALAM AI' }]}
      />

      <Box sx={{ maxWidth: 940, mx: 'auto' }}>
        <AIAssistantPanel inputContent="" onAccept={handleAcceptAIResult} />
      </Box>

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)} sx={{ width: '100%', borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
