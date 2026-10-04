import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Restore as RestoreIcon } from '@mui/icons-material';
import { ContentVersion } from '../types/workflow';
import { workflowService } from '../services/workflowService';
import { formatDate } from '../utils/formatters';

interface VersionHistoryModalProps {
  open: boolean;
  contentId: number;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  open,
  contentId,
  onClose,
  onRestoreSuccess,
}) => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVer, setSelectedVer] = useState<ContentVersion | null>(null);

  useEffect(() => {
    if (open && contentId) {
      workflowService
        .getVersions(contentId)
        .then((vList) => {
          setVersions(vList);
          if (vList.length > 0) {
            setSelectedVer(vList[0]);
          }
        })
        .catch(console.warn);
    }
  }, [open, contentId]);

  const handleRestore = async (versionNumber: number) => {
    if (window.confirm(`Are you sure you want to restore Version #${versionNumber}? Current content will be reverted.`)) {
      try {
        await workflowService.restoreVersion(contentId, versionNumber);
        alert(`Content successfully restored to Version #${versionNumber}!`);
        onRestoreSuccess();
        onClose();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to restore version.');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, borderColor: '#DCD2C4', border: '1px solid #DCD2C4' } }}>
      <DialogTitle sx={{ py: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
          Content Version History & Comparison
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: '#DCD2C4' }} />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Version List Selector */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#171717' }}>
              Available Snapshots ({versions.length})
            </Typography>

            <Paper variant="outlined" sx={{ maxHeight: 420, overflowY: 'auto', borderRadius: 2, borderColor: '#DCD2C4' }}>
              <List disablePadding>
                {versions.map((ver) => (
                  <React.Fragment key={ver.id}>
                    <ListItem
                      button
                      selected={selectedVer?.id === ver.id}
                      onClick={() => setSelectedVer(ver)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': { bgcolor: '#FAF7F0' },
                        '&:hover': { bgcolor: '#FAF7F0' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={`v${ver.version_number}`} size="small" sx={{ fontWeight: 800, bgcolor: '#171717', color: '#FAF7F0' }} />
                            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: '#171717' }}>
                              {ver.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#4A4540' }}>
                            By {ver.author_name} • {formatDate(ver.created_at)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider sx={{ borderColor: '#DCD2C4' }} />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Selected Version Detail */}
          <Grid item xs={12} md={8}>
            {selectedVer ? (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2.5, backgroundColor: '#FAF7F0', borderColor: '#DCD2C4', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Version #${selectedVer.version_number}`} sx={{ fontWeight: 800, bgcolor: '#E59B2F', color: '#171717' }} />
                      <Typography variant="caption" sx={{ color: '#4A4540' }}>
                        Saved on {formatDate(selectedVer.created_at)} by {selectedVer.author_name}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<RestoreIcon />}
                      onClick={() => handleRestore(selectedVer.version_number)}
                      sx={{ bgcolor: '#C96B4B', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#B55A3B' } }}
                    >
                      Restore This Version
                    </Button>
                  </Box>

                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                    {selectedVer.title}
                  </Typography>

                  {selectedVer.excerpt && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, color: '#4A4540' }}>
                      "{selectedVer.excerpt}"
                    </Typography>
                  )}

                  <Divider sx={{ my: 1.5, borderColor: '#DCD2C4' }} />

                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 260, overflowY: 'auto', color: '#171717' }}>
                    {selectedVer.body || 'No body text snapshot available.'}
                  </Typography>
                </Paper>
              </Stack>
            ) : (
              <Alert severity="info" sx={{ bgcolor: '#FAF7F0', borderColor: '#DCD2C4', color: '#171717' }}>Select a version snapshot to view details.</Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
