import React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { DEMO_RECENT_ACTIVITY } from '../utils/demoData';

export const ActivityLogs: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Audit & Activity Logs"
        subtitle="Security audit trail of user actions, content edits, and system events."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Activity Logs' }]}
      />

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Target Entity</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_RECENT_ACTIVITY.map((act) => (
                <TableRow key={act.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>{act.userName}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Chip label={act.action} size="small" variant="outlined" sx={{ fontWeight: 700, borderColor: '#E59B2F', color: '#171717' }} />
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}><Typography variant="body2" sx={{ color: '#171717' }}>{act.entityName}</Typography></TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}><Typography variant="caption" sx={{ color: '#4A4540' }}>{act.timestamp}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
