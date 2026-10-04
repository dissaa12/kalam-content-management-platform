import React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Avatar, Chip, Paper } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { getRoleLabel } from '../utils/formatters';
import { UserRole } from '../types/common';

const DEMO_USERS = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah.jenkins@enterprise.com', role: 'marketing_manager' as UserRole, dept: 'Growth Marketing', active: true },
  { id: '2', name: 'Alex Rivera', email: 'alex.rivera@enterprise.com', role: 'content_editor' as UserRole, dept: 'Editorial', active: true },
  { id: '3', name: 'Devon Vance', email: 'devon.vance@enterprise.com', role: 'content_author' as UserRole, dept: 'Copywriting', active: true },
  { id: '4', name: 'Elena Rostova', email: 'elena.rostova@enterprise.com', role: 'admin' as UserRole, dept: 'System Engineering', active: true },
  { id: '5', name: 'Marcus Chen', email: 'marcus.chen@enterprise.com', role: 'reviewer' as UserRole, dept: 'Legal & Governance', active: true },
];

export const Users: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="User & Access Management"
        subtitle="Manage platform users, assign role-based permissions, and invite team members."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Users' }]}
        actions={[{ label: 'Invite User', icon: <PersonAddIcon /> }]}
      />

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_USERS.map((u) => (
                <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700 }}>{u.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>{u.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#4A4540' }}>{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Chip label={getRoleLabel(u.role)} size="small" variant="outlined" sx={{ fontWeight: 800, borderColor: '#C96B4B', color: '#C96B4B' }} />
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}><Typography variant="body2" sx={{ color: '#171717' }}>{u.dept}</Typography></TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Chip label={u.active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: u.active ? '#FAF7F0' : '#F3F4F6', color: u.active ? '#171717' : '#4A4540', border: '1px solid #DCD2C4', fontWeight: 700 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
