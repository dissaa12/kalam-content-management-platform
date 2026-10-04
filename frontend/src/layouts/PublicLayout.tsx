import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Dashboard as AdminIcon,
  GitHub,
  LinkedIn,
  Twitter,
} from '@mui/icons-material';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { KalamLogo } from '../components/KalamLogo';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#141210', color: '#F7F3EA' }}>
      {/* PUBLIC NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(20, 18, 16, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2D2824',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 }, py: 1 }}>
            {/* Kalam Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <KalamLogo variant="compact" height={36} lightBackground={false} />
            </Box>

            {/* Desktop Navigation */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Typography
                    key={link.path}
                    component={Link}
                    to={link.path}
                    sx={{
                      textDecoration: 'none',
                      color: isActive ? '#F47A20' : '#B3A89C',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.95rem',
                      letterSpacing: '-0.01em',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#F7F3EA' },
                    }}
                  >
                    {link.label}
                  </Typography>
                );
              })}

              <Divider orientation="vertical" flexItem sx={{ borderColor: '#2D2824' }} />

              {/* Admin Dashboard Entry Link */}
              {user ? (
                <Button
                  variant="contained"
                  startIcon={<AdminIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    backgroundColor: '#F47A20',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#E86A16' },
                  }}
                >
                  CMS Dashboard
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: '#2D2824',
                    color: '#F7F3EA',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    '&:hover': { borderColor: '#F47A20', backgroundColor: 'rgba(244, 122, 32, 0.08)' },
                  }}
                >
                  Workspace Login
                </Button>
              )}
            </Stack>

            {/* Mobile Hamburger */}
            <IconButton
              sx={{ display: { md: 'none' }, color: '#F7F3EA' }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { width: 280, backgroundColor: '#1A1816', color: '#F7F3EA', p: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <KalamLogo variant="compact" height={32} lightBackground={false} />
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#F7F3EA' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.path}
              component={Link}
              to={link.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2, borderColor: '#2D2824' }} />
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            setMobileOpen(false);
            navigate(user ? '/dashboard' : '/login');
          }}
          sx={{ backgroundColor: '#F47A20', color: '#FFF', fontWeight: 700, '&:hover': { backgroundColor: '#E86A16' } }}
        >
          {user ? 'CMS Dashboard' : 'Workspace Login'}
        </Button>
      </Drawer>

      {/* PAGE CONTENT CONTAINER */}
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* PUBLIC FOOTER */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid #2D2824',
          backgroundColor: '#0E0C0A',
          py: 8,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Brand Vision */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <KalamLogo variant="full" height={40} lightBackground={false} showTagline />
              </Box>
              <Typography variant="body2" sx={{ color: '#B3A89C', lineHeight: 1.7, mb: 3 }}>
                Empowering content teams, authors, and marketers with editorial management, intelligent AI assistant tools, and automated publishing workflows.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: '#B3A89C', '&:hover': { color: '#F47A20' } }}>
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#B3A89C', '&:hover': { color: '#F47A20' } }}>
                  <LinkedIn fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: '#B3A89C', '&:hover': { color: '#F47A20' } }}>
                  <GitHub fontSize="small" />
                </IconButton>
              </Stack>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} color="#F7F3EA" sx={{ mb: 2 }}>
                Platform
              </Typography>
              <Stack spacing={1}>
                <Typography component={Link} to="/blog" variant="body2" sx={{ color: '#B3A89C', textDecoration: 'none', '&:hover': { color: '#F47A20' } }}>
                  Publications & Blog
                </Typography>
                <Typography component={Link} to="/about" variant="body2" sx={{ color: '#B3A89C', textDecoration: 'none', '&:hover': { color: '#F47A20' } }}>
                  About KALAM
                </Typography>
                <Typography component={Link} to="/contact" variant="body2" sx={{ color: '#B3A89C', textDecoration: 'none', '&:hover': { color: '#F47A20' } }}>
                  Contact Us
                </Typography>
              </Stack>
            </Grid>

            {/* Platform CMS */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" fontWeight={700} color="#F7F3EA" sx={{ mb: 2 }}>
                Workspace
              </Typography>
              <Stack spacing={1}>
                <Typography component={Link} to="/dashboard" variant="body2" sx={{ color: '#B3A89C', textDecoration: 'none', '&:hover': { color: '#F47A20' } }}>
                  CMS Dashboard
                </Typography>
                <Typography component={Link} to="/login" variant="body2" sx={{ color: '#B3A89C', textDecoration: 'none', '&:hover': { color: '#F47A20' } }}>
                  Author Login
                </Typography>
              </Stack>
            </Grid>

            {/* Newsletter Subscription Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={700} color="#F7F3EA" sx={{ mb: 1 }}>
                Subscribe to Editorial Insights
              </Typography>
              <Typography variant="caption" sx={{ color: '#B3A89C', display: 'block', mb: 2 }}>
                Receive curated articles on digital marketing strategies and AI content engineering.
              </Typography>
              {newsletterSubscribed ? (
                <Chip label="Thank you for subscribing to KALAM!" color="success" sx={{ fontWeight: 700 }} />
              ) : (
                <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter your email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    sx={{
                      flexGrow: 1,
                      backgroundColor: '#1A1816',
                      borderRadius: 1,
                      input: { color: '#F7F3EA', fontSize: '0.85rem' },
                    }}
                  />
                  <Button type="submit" variant="contained" endIcon={<SendIcon />} sx={{ backgroundColor: '#F47A20', '&:hover': { backgroundColor: '#E86A16' } }}>
                    Join
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: '#2D2824', mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#B3A89C' }}>
              © {new Date().getFullYear()} KALAM Content Management Platform. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ color: '#F47A20', fontWeight: 700, letterSpacing: '0.1em' }}>
              WRITE | CREATE | STORYTELL | EXPRESS
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
