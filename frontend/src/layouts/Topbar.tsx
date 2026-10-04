import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Chip,
  Divider,
  Paper,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  NotificationsOutlined as NotificationsIcon,
  DarkModeOutlined as DarkModeIcon,
  LightModeOutlined as LightModeIcon,
  PersonOutline as ProfileIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  LogoutOutlined as LogoutIcon,
  Check as CheckIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useColorMode } from '../hooks/useColorMode';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/common';
import { getRoleLabel } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMobileDrawerToggle: () => void;
}

const ROLES: UserRole[] = [
  'admin',
  'marketing_manager',
  'content_editor',
  'content_author',
  'reviewer',
];

export const Topbar: React.FC<TopbarProps> = ({ onMobileDrawerToggle }) => {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout, switchDemoRole } = useAuth();
  const isDark = mode === 'dark';

  const currentRole: UserRole = user?.role || 'marketing_manager';

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElRole, setAnchorElRole] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElRole(event.currentTarget);
  const handleCloseRoleMenu = () => setAnchorElRole(null);

  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotif(event.currentTarget);
  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const handleSelectRole = (role: UserRole) => {
    switchDemoRole(role);
    handleCloseRoleMenu();
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleGoToProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/content?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: isDark ? '1px solid #2E2823' : '1px solid #E8DFD2',
        backgroundColor: isDark ? '#141210' : '#FFFFFF',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left Section: Mobile Menu Button & Global Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={0}
            sx={{
              p: '2px 12px',
              display: 'flex',
              alignItems: 'center',
              width: { xs: 180, sm: 280, md: 360 },
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FAF7F0',
              border: isDark ? '1px solid #2E2823' : '1px solid #DCD2C4',
              borderRadius: 1.5,
            }}
          >
            <SearchIcon sx={{ color: isDark ? '#FAF7F0' : '#4A4540', mr: 1, fontSize: 18 }} />
            <InputBase
              placeholder="Search content, campaigns, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputProps={{ 'aria-label': 'search content, campaigns, authors' }}
              sx={{ width: '100%', fontSize: '0.85rem', color: isDark ? '#FAF7F0' : '#171717' }}
            />
          </Paper>
        </Box>

        {/* Right Section: Role Switcher, Create Content CTA, Theme Toggle, Notifications, User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Create Content CTA Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/content/create')}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: '0.8125rem',
              px: 2,
              py: 0.75,
              backgroundColor: isDark ? '#FAF7F0' : '#171717',
              color: isDark ? '#171717' : '#FAF7F0',
              '&:hover': {
                backgroundColor: isDark ? '#FFFFFF' : '#333333',
              },
            }}
          >
            Create Content
          </Button>

          {/* Role Switcher Badge */}
          <Tooltip title="Switch Active Demo Role">
            <Chip
              icon={<AdminIcon style={{ fontSize: 15, color: '#C96B4B' }} />}
              label={getRoleLabel(currentRole)}
              onClick={handleOpenRoleMenu}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                borderColor: 'rgba(201, 107, 75, 0.4)',
                color: isDark ? '#FAF7F0' : '#171717',
                backgroundColor: 'rgba(229, 155, 47, 0.12)',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            />
          </Tooltip>

          {/* Role Selection Menu */}
          <Menu
            anchorEl={anchorElRole}
            open={Boolean(anchorElRole)}
            onClose={handleCloseRoleMenu}
            PaperProps={{
              sx: {
                width: 230,
                mt: 1,
                border: isDark ? '1px solid #2E2823' : '1px solid #DCD2C4',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#C96B4B', letterSpacing: '0.05em' }}>
                SWITCH DEMO USER ROLE
              </Typography>
            </Box>
            <Divider sx={{ borderColor: isDark ? '#2E2823' : '#DCD2C4' }} />
            {ROLES.map((role) => (
              <MenuItem
                key={role}
                selected={currentRole === role}
                onClick={() => handleSelectRole(role)}
                sx={{ fontSize: '0.85rem', py: 1, color: isDark ? '#FAF7F0' : '#171717' }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {currentRole === role && <CheckIcon fontSize="small" sx={{ color: '#E59B2F' }} />}
                </ListItemIcon>
                {getRoleLabel(role)}
              </MenuItem>
            ))}
          </Menu>

          {/* Theme Toggle Button */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton color="inherit" onClick={toggleColorMode} size="small" sx={{ p: 1 }}>
              {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications Button */}
          <Tooltip title="Notification Center">
            <IconButton color="inherit" onClick={handleOpenNotifMenu} size="small" sx={{ p: 1 }}>
              <Badge badgeContent={3} sx={{ '& .MuiBadge-badge': { backgroundColor: '#E59B2F', color: '#171717', fontWeight: 800 } }}>
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown */}
          <Menu
            anchorEl={anchorElNotif}
            open={Boolean(anchorElNotif)}
            onClose={handleCloseNotifMenu}
            PaperProps={{ sx: { width: 340, mt: 1, border: isDark ? '1px solid #2E2823' : '1px solid #DCD2C4' } }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                Kalam Notifications
              </Typography>
              <Chip label="3 New" size="small" sx={{ backgroundColor: 'rgba(229, 155, 47, 0.2)', color: '#171717', fontWeight: 800 }} />
            </Box>
            <Divider sx={{ borderColor: isDark ? '#2E2823' : '#DCD2C4' }} />
            <MenuItem onClick={handleCloseNotifMenu} sx={{ py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                  3 Articles Waiting for Review
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#B8AEA3' : '#4A4540' }}>
                  "Enterprise AI Governance Guide" requires reviewer approval.
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCloseNotifMenu} sx={{ py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                  Changes Requested
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#B8AEA3' : '#4A4540' }}>
                  Reviewer requested fixes on "Product Launch Blog".
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleCloseNotifMenu} sx={{ py: 1.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                  Campaign 'Winter Sale' Launch
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#B8AEA3' : '#4A4540' }}>
                  Campaign launch date is scheduled for tomorrow.
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* User Profile Avatar */}
          <Box sx={{ flexGrow: 0, ml: 0.5 }}>
            <Tooltip title="Account & Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    border: '2px solid #E59B2F',
                    bgcolor: '#171717',
                    color: '#FAF7F0',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.first_name ? user.first_name.charAt(0) : 'K'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{ sx: { width: 220, border: isDark ? '1px solid #2E2823' : '1px solid #DCD2C4' } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                  {user?.full_name || 'Kalam Author'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: isDark ? '#B8AEA3' : '#4A4540' }}>
                  {user?.email || 'author@enterprise.com'}
                </Typography>
                <Chip
                  label={getRoleLabel(currentRole)}
                  size="small"
                  sx={{ mt: 1, height: 20, fontSize: '0.65rem', backgroundColor: '#E59B2F', color: '#171717', fontWeight: 800 }}
                />
              </Box>
              <Divider sx={{ borderColor: isDark ? '#2E2823' : '#DCD2C4' }} />
              <MenuItem onClick={handleGoToProfile} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                <ListItemIcon><ProfileIcon fontSize="small" sx={{ color: isDark ? '#FAF7F0' : '#171717' }} /></ListItemIcon>
                Profile & Account
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: isDark ? '#FAF7F0' : '#171717' }}>
                <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: isDark ? '#FAF7F0' : '#171717' }} /></ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
