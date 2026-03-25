import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  People as PeopleIcon,
  RateReview as ReviewIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import api from '../../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReviews: 0,
    myReviews: 0
  });

  useEffect(() => {
    // Get user from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userStr) {
      const userData = JSON.parse(userStr);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(userData);
      
      // Redirect admin to admin dashboard
      if (userData.role === 'admin' || userData.roleId === 1) {
        navigate('/admin/dashboard');
        return;
      }
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const [booksRes, reviewsRes] = await Promise.all([
          api.get('/books'),
          api.get('/reviews/user')
        ]);
        
        setStats({
          totalBooks: booksRes.data.length,
          totalReviews: reviewsRes.data.length,
          myReviews: reviewsRes.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Book Review System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.name}
            </Typography>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <PersonIcon />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            mt: 8
          }
        }}
      >
        <List>
          <ListItem>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <ListItemText primary="Books" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ReviewIcon />
            </ListItemIcon>
            <ListItemText primary="My Reviews" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Welcome, {user.name}!
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Books
                  </Typography>
                  <Typography variant="h3">
                    {stats.totalBooks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reviews
                  </Typography>
                  <Typography variant="h3">
                    {stats.totalReviews}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    My Reviews
                  </Typography>
                  <Typography variant="h3">
                    {stats.myReviews}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have {stats.myReviews} reviews. Start exploring more books to review!
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;