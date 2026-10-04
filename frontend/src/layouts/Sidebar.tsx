import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  ArticleOutlined as ContentIcon,
  CampaignOutlined as CampaignIcon,
  CalendarMonthOutlined as CalendarIcon,
  PermMediaOutlined as MediaIcon,
  BarChartOutlined as AnalyticsIcon,
  AutoAwesome as AIIcon,
  PeopleOutline as UsersIcon,
  HistoryOutlined as ActivityIcon,
  SettingsOutlined as SettingsIcon,
  RateReviewOutlined as ReviewIcon,
  FindInPageOutlined as SEOIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/common';
import { KalamLogo } from '../components/KalamLogo';

const DRAWER_WIDTH = 270;

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  allowedRoles?: UserRole[];
}

interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    sectionTitle: 'WORKSPACE',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { title: 'Content', path: '/content', icon: <ContentIcon /> },
      {
        title: 'Campaigns',
        path: '/campaigns',
        icon: <CampaignIcon />,
        allowedRoles: ['admin', 'marketing_manager'],
      },
      { title: 'Calendar', path: '/calendar', icon: <CalendarIcon /> },
      {
        title: 'Media Library',
        path: '/media',
        icon: <MediaIcon />,
        allowedRoles: ['admin', 'marketing_manager', 'content_editor'],
      },
    ],
  },
  {
    sectionTitle: 'OPTIMIZATION',
    items: [
      {
        title: 'SEO Health',
        path: '/content',
        icon: <SEOIcon />,
      },
      {
        title: 'Kalam AI',
        path: '/ai-assistant',
        icon: <AIIcon sx={{ color: '#E59B2F' }} />,
        badge: 'AI',
        allowedRoles: ['admin', 'marketing_manager', 'content_author', 'content_editor'],
      },
      {
        title: 'Analytics',
        path: '/analytics',
        icon: <AnalyticsIcon />,
        allowedRoles: ['admin', 'marketing_manager'],
      },
    ],
  },
  {
    sectionTitle: 'MANAGEMENT',
    items: [
      {
        title: 'Approvals',
        path: '/content?status=in_review',
        icon: <ReviewIcon />,
        allowedRoles: ['admin', 'marketing_manager', 'reviewer'],
      },
      {
        title: 'Users & Team',
        path: '/users',
        icon: <UsersIcon />,
        allowedRoles: ['admin'],
      },
      {
        title: 'Activity Timeline',
        path: '/activity',
        icon: <ActivityIcon />,
        allowedRoles: ['admin'],
      },
      {
        title: 'Settings',
        path: '/settings',
        icon: <SettingsIcon />,
        allowedRoles: ['admin', 'marketing_manager'],
      },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentRole: UserRole = user?.role || 'marketing_manager';

  const filterNavItems = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return currentRole === 'admin' || item.allowedRoles.includes(currentRole);
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        px: 2.5,
        py: 3,
        backgroundColor: isDark ? '#141210' : '#FFFFFF',
      }}
    >
      {/* Kalam Standalone Wordmark Header */}
      <Box
        onClick={() => handleNavigate('/dashboard')}
        sx={{
          cursor: 'pointer',
          pb: 2.5,
          pt: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <KalamLogo height={36} lightBackground={!isDark} />
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: isDark ? '#2E2823' : '#E8DFD2' }} />

      {/* Navigation Groups */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {navSections.map((section) => {
          const visibleItems = filterNavItems(section.items);
          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.sectionTitle} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  mb: 1,
                  display: 'block',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: isDark ? '#B8AEA3' : '#7A7067',
                  fontSize: '0.6875rem',
                }}
              >
                {section.sectionTitle}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' &&
                      location.pathname.startsWith(item.path.split('?')[0]));

                  return (
                    <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigate(item.path)}
                        sx={{
                          borderRadius: 1.5,
                          py: 0.85,
                          px: 1.5,
                          backgroundColor: isActive
                            ? isDark
                              ? '#26221E'
                              : '#FAF7F0'
                            : 'transparent',
                          color: isActive
                            ? isDark
                              ? '#FAF7F0'
                              : '#171717'
                            : isDark
                            ? '#B8AEA3'
                            : '#7A7067',
                          borderLeft: isActive ? '3.5px solid #E59B2F' : '3.5px solid transparent',
                          '&:hover': {
                            backgroundColor: isActive
                              ? isDark
                                ? '#26221E'
                                : '#FAF7F0'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.04)'
                              : 'rgba(23, 23, 23, 0.04)',
                            color: isDark ? '#FAF7F0' : '#171717',
                          },
                          transition: 'all 0.15s ease-in-out',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: isActive
                              ? '#E59B2F'
                              : isDark
                              ? '#B8AEA3'
                              : '#7A7067',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 700 : 500,
                            letterSpacing: '-0.01em',
                          }}
                        />
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              backgroundColor: 'rgba(229, 155, 47, 0.15)',
                              color: '#E59B2F',
                              border: '1px solid rgba(229, 155, 47, 0.3)',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 1.5, borderColor: isDark ? '#2E2823' : '#E8DFD2' }} />

      {/* User Role Card */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: isDark ? '#1E1B18' : '#FAF7F0',
          border: isDark ? '1px solid #2E2823' : '1px solid #E8DFD2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: isDark ? '#FAF7F0' : '#171717',
              textTransform: 'capitalize',
            }}
          >
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#E59B2F',
              fontWeight: 800,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {currentRole.replace('_', ' ')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
