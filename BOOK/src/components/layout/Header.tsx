import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';

// Define the MenuItem type with optional badge
interface MenuItemType {
  text: string;
  icon: JSX.Element;
  path: string;
  badge?: number;
}

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  onLogout: () => void;
  onLogin: () => void;
  transparent?: boolean;
  onMenuClick: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  showSearch?: boolean;
  position?: 'fixed' | 'absolute' | 'sticky' | 'static' | 'relative';
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onMenuClick,
  mobileMenuOpen = false,
  onMobileMenuClose
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Check if user is admin
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin' || user?.roleId === 1;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // User navigation handlers
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  // Admin navigation handlers
  const handleAdminDashboard = () => {
    navigate('/admin');
    handleClose();
  };

  const handleAdminUsers = () => {
    navigate('/admin/users');
    handleClose();
  };

  const handleAdminBooks = () => {
    navigate('/admin/books');
    handleClose();
  };

  const handleAdminReviews = () => {
    navigate('/admin/reviews');
    handleClose();
  };

  const handleAdminCategories = () => {
    navigate('/admin/categories');
    handleClose();
  };

  const handleAdminReports = () => {
    navigate('/admin/reports');
    handleClose();
  };

  const handleLogout = async () => {
    await onLogout();
    handleClose();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  // Mobile menu items
  const menuItems: MenuItemType[] = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Books', icon: <BookIcon />, path: '/books' },
    { text: 'Reviews', icon: <ReviewIcon />, path: '/reviews' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
  ];

  // ✅ Regular user menu items for mobile drawer (No Dashboard, No MyReviews)
  const userMenuItems: MenuItemType[] = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Admin menu items for mobile drawer
  const adminMenuItems: MenuItemType[] = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users', badge: 12 },
    { text: 'Manage Books', icon: <BookIcon />, path: '/admin/books' },
    { text: 'Manage Reviews', icon: <ReviewIcon />, path: '/admin/reviews' },
    { text: 'Manage Categories', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
  ];

  // Get menu items based on user role for mobile drawer
  const getAuthMenuItems = (): MenuItemType[] => {
    if (isAdmin) {
      return adminMenuItems;
    }
    return userMenuItems;
  };

  return (
    <>
      <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Mobile Menu Icon */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
             Book Review
            {isAdmin && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'secondary.main',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                ADMIN
              </Box>
            )}
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
              <Button color="inherit" onClick={() => navigate('/books')}>Books</Button>
              <Button color="inherit" onClick={() => navigate('/reviews')}>Reviews</Button>
              <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
              <Button color="inherit" onClick={() => navigate('/contact')}>Contact</Button>
              {isAdmin && (
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin')}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>
          )}

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <>
                <Tooltip title={isAdmin ? "Admin Account" : "Account"}>
                  <IconButton
                    onClick={handleMenu}
                    color="inherit"
                    size="large"
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        isAdmin ? (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: 'secondary.main',
                              borderRadius: '50%',
                              border: '2px solid white'
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{ 
                          width: 35, 
                          height: 35, 
                          bgcolor: isAdmin ? 'secondary.main' : 'primary.dark',
                          fontSize: '1rem'
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() || <PersonIcon />}
                      </Avatar>
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      minWidth: 220,
                      mt: 1,
                      ...(isAdmin && {
                        borderTop: `3px solid ${theme.palette.secondary.main}`
                      })
                    }
                  }}
                >
                  {/* ADMIN PANEL Header - only for admin */}
                  {isAdmin && (
                    <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="secondary" fontWeight="bold">
                        ADMIN PANEL
                      </Typography>
                    </Box>
                  )}

                  {/* Admin Menu Items */}
                  {isAdmin && (
                    <>
                      <MenuItem onClick={handleAdminDashboard}>
                        <ListItemIcon>
                          <AdminIcon fontSize="small" color="secondary" />
                        </ListItemIcon>
                        <ListItemText>Admin Dashboard</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleAdminUsers}>
                        <ListItemIcon>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Manage Users</ListItemText>
                        <Badge badgeContent={12} color="error" sx={{ ml: 'auto' }} />
                      </MenuItem>
                      <MenuItem onClick={handleAdminBooks}>
                        <ListItemIcon>
                          <BookIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Manage Books</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleAdminReviews}>
                        <ListItemIcon>
                          <ReviewIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>All Reviews</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleAdminCategories}>
                        <ListItemIcon>
                          <CategoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Categories</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleAdminReports}>
                        <ListItemIcon>
                          <AssessmentIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Reports</ListItemText>
                      </MenuItem>
                      <Divider />
                    </>
                  )}

                  {/* ✅ Regular User Menu Items - Only Profile and Settings */}
                  {!isAdmin && (
                    <>
                      <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                      </MenuItem>
                    </>
                  )}

                  {/* Common Menu Items for Both */}
                  <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={onMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          bgcolor: isAdmin ? 'secondary.main' : 'primary.main', 
          color: 'white' 
        }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             Book Review
          </Typography>
          {isAuthenticated && user && (
            <>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Welcome, {user.name}
              </Typography>
              {isAdmin && (
                <Chip 
                  label="ADMIN" 
                  size="small" 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'white', 
                    color: 'secondary.main',
                    fontWeight: 'bold',
                    height: 20
                  }} 
                />
              )}
            </>
          )}
        </Box>

        <List sx={{ pt: 2 }}>
          {/* Public Menu Items */}
          {menuItems.map((item: MenuItemType) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Authenticated User Menu Items */}
          {isAuthenticated ? (
            <>
              {getAuthMenuItems().map((item: MenuItemType) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton onClick={() => handleNavigation(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.badge && (
                      <Badge badgeContent={item.badge} color="error" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding>
                <ListItemButton onClick={handleSettings}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate('/login')}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate('/register')}>
                  <ListItemIcon>
                    <RegisterIcon />
                  </ListItemIcon>
                  <ListItemText primary="Register" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;