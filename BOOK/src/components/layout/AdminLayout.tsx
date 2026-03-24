import React, { useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MUILink,
  Paper,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AdminLayoutProps {
  children?: React.ReactNode;
  user: User;
  onLogout: () => void;
  pageTitle?: string;
  showBreadcrumbs?: boolean;
  showHeader?: boolean;
  showSidebar?: boolean;
}

const breadcrumbNameMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/books': 'Books',
  '/admin/reviews': 'Reviews',
  '/admin/categories': 'Categories',
  '/admin/settings': 'Settings',
  '/admin/reports': 'Reports',
  '/admin/analytics': 'Analytics',
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  user,
  onLogout,
  pageTitle,
  showBreadcrumbs = true,
  showHeader = true,
  showSidebar = true
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleNotificationClose = () =>
    setNotification({ ...notification, open: false });

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(Boolean);

    return (
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <MUILink
          component={RouterLink as React.ElementType}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </MUILink>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = breadcrumbNameMap[to] || value.charAt(0).toUpperCase() + value.slice(1);

          return last ? (
            <Typography
              key={to}
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {index === 0 && <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />}
              {name}
            </Typography>
          ) : (
            <MUILink
              key={to}
              component={RouterLink as React.ElementType}
              to={to}
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {index === 0 && <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />}
              {name}
            </MUILink>
          );
        })}
      </Breadcrumbs>
    );
  };

  const getPageIcon = () => {
    if (location.pathname.includes('/users')) return <PeopleIcon />;
    if (location.pathname.includes('/books')) return <BookIcon />;
    if (location.pathname.includes('/reviews')) return <ReviewIcon />;
    if (location.pathname.includes('/categories')) return <CategoryIcon />;
    if (location.pathname.includes('/settings')) return <SettingsIcon />;
    return <DashboardIcon />;
  };

  const adminStats = [
    { label: 'Total Users', value: 1243, color: 'primary' },
    { label: 'Total Books', value: 567, color: 'success' },
    { label: 'Total Reviews', value: 3421, color: 'info' },
    { label: 'Pending Reviews', value: 23, color: 'warning' }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {showHeader && (
        <Header
          user={user}
          onLogout={onLogout}
          onMenuClick={handleSidebarToggle}
          showSearch={false}
          transparent={false}
          position="fixed" onLogin={function (): void {
            throw new Error('Function not implemented.');
          } }        />
      )}

      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          onToggle={handleSidebarToggle}
          user={user}
          onLogout={onLogout}
          variant={isMobile ? 'temporary' : 'permanent'}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? 280 : 72}px)` },
          ml: { md: sidebarOpen ? '280px' : '72px' },
          mt: '64px',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white'
              }}
            >
              {getPageIcon()}
            </Box>
            <Box>
              <Typography variant="h5" component="h1" fontWeight={600}>
                {pageTitle || breadcrumbNameMap[location.pathname] || 'Dashboard'}
              </Typography>
              {showBreadcrumbs && generateBreadcrumbs()}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {adminStats.map((stat, index) => (
              <Chip
                key={index}
                label={`${stat.label}: ${stat.value}`}
                color={stat.color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        </Paper>

        <Box sx={{ position: 'relative' }}>
          {/* Explicitly type Outlet to avoid TS errors */}
          {children ? children : <Outlet />}
        </Box>

        <Box
          component="footer"
          sx={{
            mt: 4,
            py: 2,
            textAlign: 'center',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Book Review System. All rights reserved.
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLayout;