import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  Chip} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  user?: User | null;
  onLogout?: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number;
  collapsedWidth?: number;
}

interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  roles?: string[];
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  onToggle,
  user,
  onLogout,
  variant = 'permanent',
  width = 280,
  collapsedWidth = 72
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'admin': true // Keep admin menu open by default
  });

  const hasRequiredRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role || 'User');
  };

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', path: '/', icon: <HomeIcon /> },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon />, 
      roles: ['User', 'Admin'] 
    },
    {
      id: 'books',
      label: 'Books',
      icon: <BookIcon />,
      children: [
        { id: 'all-books', label: 'All Books', path: '/books', icon: <BookIcon /> },
        { id: 'popular-books', label: 'Popular Books', path: '/books/popular', icon: <StarIcon /> },
        { id: 'trending', label: 'Trending', path: '/books/trending', icon: <TrendingUpIcon /> }
      ]
    },
    { id: 'reviews', label: 'Reviews', path: '/reviews', icon: <ReviewIcon />, badge: 3 },
    { id: 'categories', label: 'Categories', path: '/categories', icon: <CategoryIcon /> },
    { id: 'about', label: 'About', path: '/about', icon: <InfoIcon /> },
    { id: 'contact', label: 'Contact', path: '/contact', icon: <ContactIcon /> }
  ];


  const adminItems: NavItem[] = [
    {
      id: 'admin',
      label: 'ADMIN PANEL',
      icon: <AdminIcon />,
      roles: ['Admin'],
      children: [
        { 
          id: 'admin-dashboard', 
          label: 'Dashboard', 
          path: '/admin', 
          icon: <DashboardIcon />,
        
        },
        { 
          id: 'manage-users', 
          label: 'Manage Users', 
          path: '/admin/users', 
          icon: <PeopleIcon />, 
          badge: 12,
          
        },
        { 
          id: 'manage-books', 
          label: 'Manage Books', 
          path: '/admin/books', 
          icon: <BookIcon />,
          // Maps to: ManageBooksPage.tsx
        },
        { 
          id: 'manage-categories', 
          label: 'Manage Categories', 
          path: '/admin/categories', 
          icon: <CategoryIcon />,
          // Maps to: ManageCategoriesPage.tsx
        },
        { 
          id: 'manage-reviews', 
          label: 'All Reviews', 
          path: '/admin/reviews', 
          icon: <ReviewIcon />,
          // Maps to: AllReviewsPage.tsx
        },
        { 
          id: 'reports', 
          label: 'Reports', 
          path: '/admin/reports', 
          icon: <AssessmentIcon />,
          // Maps to: ReportsPage.tsx
        },
        { 
          id: 'admin-settings', 
          label: 'Settings', 
          path: '/admin/settings', 
          icon: <SettingsIcon />,
          // You may need to create SettingsPage.tsx
        }
      ]
    }
  ];

  // User profile items
  const userItems: NavItem[] = [
    { id: 'profile', label: 'Profile', path: '/profile', icon: <PersonIcon />, roles: ['User', 'Admin'] },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <SettingsIcon />, roles: ['User', 'Admin'] }
  ];

  const getAllNavItems = () => {
    let items = [...navItems];
    if (user?.role === 'Admin') {
      items = [...items, ...adminItems];
    }
    return items;
  };

  const handleSubmenuToggle = (itemId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) return item.children.some(child => child.path && location.pathname.startsWith(child.path));
    return false;
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (!hasRequiredRole(item.roles)) return null;

    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus[item.id] || isActive;

    const Component = item.path && !hasChildren ? (RouterLink as React.ElementType) : 'div';

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={Component}
            to={item.path || '#'}
            onClick={() => {
              if (hasChildren) handleSubmenuToggle(item.id);
              else if (item.path && isMobile) onClose();
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
              color: isActive ? theme.palette.primary.main : 'text.primary',
              '&:hover': { backgroundColor: theme.palette.action.hover },
              ...(depth > 0 && { pl: open ? 4 + depth * 2 : 2.5 })
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 0, 
                mr: open ? 2 : 'auto', 
                justifyContent: 'center', 
                color: isActive ? theme.palette.primary.main : 'inherit' 
              }}
            >
              {item.icon}
            </ListItemIcon>
            {open && (
              <>
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontWeight: isActive ? 600 : 400,
                      fontSize: item.id === 'admin' ? '0.875rem' : '1rem',
                      letterSpacing: item.id === 'admin' ? '0.1em' : 'normal'
                    } 
                  }} 
                />
                {item.badge ? (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                ) : hasChildren ? (
                  isSubmenuOpen ? <ExpandLess /> : <ExpandMore />
                ) : null}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && open && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerWidth = open ? width : collapsedWidth;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : variant}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: 'hidden',
          transition: theme.transitions.create('width', { 
            easing: theme.transitions.easing.sharp, 
            duration: theme.transitions.duration.enteringScreen 
          })
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center', 
        p: 2, 
        minHeight: 64, 
        borderBottom: `1px solid ${theme.palette.divider}` 
      }}>
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
            Book Reviews
          </Typography>
        )}
        <IconButton onClick={onToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* User Profile */}
      {user && open && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.02)'
        }}>
          <Avatar 
            src={user.avatar} 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: theme.palette.primary.main,
              mr: 2 
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.role}
            </Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ pt: 2 }}>
        {getAllNavItems().map(item => renderNavItem(item))}
      </List>

      {/* Bottom User Items */}
      {user && (
        <Box sx={{ mt: 'auto', borderTop: `1px solid ${theme.palette.divider}` }}>
          <List>
            {userItems.map(item => renderNavItem(item))}
            <ListItem disablePadding>
              <ListItemButton
                onClick={onLogout}
                sx={{ 
                  minHeight: 48, 
                  justifyContent: open ? 'initial' : 'center', 
                  px: 2.5, 
                  mx: 1, 
                  my: 0.5, 
                  borderRadius: 2, 
                  color: theme.palette.error.main, 
                  '&:hover': { backgroundColor: theme.palette.action.selected } 
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 0, 
                    mr: open ? 2 : 'auto', 
                    justifyContent: 'center', 
                    color: 'inherit' 
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Logout" />}
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;