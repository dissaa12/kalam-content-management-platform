import React from 'react';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { Add as AddIcon } from '@mui/icons-material';

const DEMO_CATEGORIES = [
  { id: '1', name: 'Blog Posts', slug: 'blog-posts', description: 'Thought leadership and industry insights', count: 482 },
  { id: '2', name: 'Whitepapers', slug: 'whitepapers', description: 'In-depth research papers & guides', count: 124 },
  { id: '3', name: 'Case Studies', slug: 'case-studies', description: 'Customer success stories & benchmarks', count: 96 },
  { id: '4', name: 'Press Releases', slug: 'press-releases', description: 'Official company product announcements', count: 54 },
];

export const Categories: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Content Categories"
        subtitle="Organize content taxonomy into structured portal categories."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Categories' }]}
        actions={[{ label: 'Add Category', icon: <AddIcon /> }]}
      />

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Category Name & Slug</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }} align="right">Content Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_CATEGORIES.map((cat) => (
                <TableRow key={cat.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#171717' }}>{cat.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#4A4540' }}>/{cat.slug}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}><Typography variant="body2" sx={{ color: '#171717' }}>{cat.description}</Typography></TableCell>
                  <TableCell align="right" sx={{ borderColor: '#DCD2C4' }}>
                    <Chip label={`${cat.count} items`} size="small" sx={{ bgcolor: '#E59B2F', color: '#171717', fontWeight: 800 }} />
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
