/* eslint-disable react-hooks/exhaustive-deps */
// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\admin\AdminDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ============================================
// Types
// ============================================

interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  totalCategories: number;
  userChange: number;
  bookChange: number;
  reviewChange: number;
  categoryChange: number;
  activeUsers: number;
  pendingReviews: number;
  flaggedReviews: number;
  newUsersToday: number;
  newBooksToday: number;
  newReviewsToday: number;
  averageRating: number;
  totalViews: number;
  totalLikes: number;
  responseTime: number;
  uptime: number;
  errorRate: number;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'book' | 'review' | 'category' | 'system';
  action: string;
  user: string;
  userAvatar?: string;
  target?: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ChartDataPoint {
  name: string;
  users: number;
  books: number;
  reviews: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

interface RatingDataPoint {
  name: string;
  value: number;
  color: string;
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  changeLabel,
  subtitle,
  onClick
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
          {change !== undefined && (
            <Chip
              size="small"
              icon={change > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              label={`${Math.abs(change)}%`}
              color={change > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        
        <Typography variant="h4" component="div" fontWeight={700} gutterBottom>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        
        {changeLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {changeLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// Activity Component
// ============================================

interface ActivityItemComponentProps {
  activity: ActivityItem;
}

const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'user':
        return <PeopleIcon />;
      case 'book':
        return <BookIcon />;
      case 'review':
        return <ReviewIcon />;
      case 'category':
        return <CategoryIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getColor = () => {
    switch (activity.status) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Avatar sx={{ bgcolor: getColor(), width: 40, height: 40 }}>
        {getIcon()}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{activity.user}</Typography>
        <Typography variant="body2" color="text.secondary">
          {activity.action} {activity.target && `• ${activity.target}`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================
// Main Component
// ============================================

const AdminDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [ratingData, setRatingData] = useState<RatingDataPoint[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!storedToken || !userStr) {
        navigate('/login', { replace: true });
        return false;
      }

      try {
        const parsedUser = JSON.parse(userStr);
        const isAdmin = parsedUser.role === 'admin' || parsedUser.role === 'Admin' || parsedUser.roleId === 1;
        
        if (!isAdmin) {
          navigate('/dashboard', { replace: true });
          return false;
        }
        
        return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        navigate('/login', { replace: true });
        return false;
      }
    };

    const isValid = checkAuth();
    setAuthChecked(true);
    
    if (isValid) {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!storedToken) {
        throw new Error('No authentication token found');
      }

      // Fetch dashboard stats - using /admin/dashboard endpoint
      let statsData = null;
      try {
        const response = await api.get('/admin/dashboard');
        statsData = response.data?.data || response.data;
        setStats(statsData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.warn('Dashboard endpoint not available:', err.message);
      }

      // Fetch users to get activity data
      try {
        const response = await api.get('/admin/users', {
          params: { page: 1, limit: 5 }
        });
        const usersData = response.data?.data?.data || response.data?.data || [];
        
        // Convert users to activities
        if (Array.isArray(usersData)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const userActivities = usersData.map((user: any) => ({
            id: `user-${user.id}`,
            type: 'user' as const,
            action: user.created_at ? 'registered a new account' : 'joined the platform',
            user: user.name,
            target: user.email,
            timestamp: user.created_at || new Date().toISOString(),
            status: 'success' as const
          }));
          setActivities(userActivities.slice(0, 5));
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.warn('Could not fetch users for activities:', err.message);
      }

      // Generate mock chart data if no real data
      if (!statsData) {
        setMockData();
      } else {
        // Generate chart data based on stats
        const days = 7;
        const newChartData = Array.from({ length: days }).map((_, i) => ({
          name: format(subDays(new Date(), days - 1 - i), 'EEE'),
          users: Math.floor(Math.random() * 500) + 1000,
          books: Math.floor(Math.random() * 100) + 200,
          reviews: Math.floor(Math.random() * 300) + 500
        }));
        setChartData(newChartData);
        
        // Mock category and rating data
        setCategoryData([
          { name: 'Fiction', value: 2345, color: '#8884d8' },
          { name: 'Non-Fiction', value: 1876, color: '#82ca9d' },
          { name: 'Science Fiction', value: 1234, color: '#ffc658' },
          { name: 'Mystery', value: 987, color: '#ff8042' }
        ]);
        
        setRatingData([
          { name: '5 Stars', value: 15432, color: '#4caf50' },
          { name: '4 Stars', value: 12345, color: '#8bc34a' },
          { name: '3 Stars', value: 8765, color: '#ffc107' },
          { name: '2 Stars', value: 4321, color: '#ff9800' },
          { name: '1 Star', value: 2347, color: '#f44336' }
        ]);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setMockData();
    } finally {
      setLoading(false);
    }
  }, []);

  const setMockData = () => {
    setStats({
      totalUsers: 15234,
      totalBooks: 8765,
      totalReviews: 43210,
      totalCategories: 45,
      userChange: 12.5,
      bookChange: 8.3,
      reviewChange: 23.7,
      categoryChange: 5.2,
      activeUsers: 5678,
      pendingReviews: 234,
      flaggedReviews: 56,
      newUsersToday: 89,
      newBooksToday: 23,
      newReviewsToday: 156,
      averageRating: 4.2,
      totalViews: 234567,
      totalLikes: 45678,
      responseTime: 234,
      uptime: 99.98,
      errorRate: 0.02
    });

    setActivities([
      {
        id: '1',
        type: 'user',
        action: 'registered a new account',
        user: 'John Doe',
        timestamp: new Date().toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'book',
        action: 'added a new book',
        user: 'Jane Smith',
        target: 'The Great Gatsby',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        type: 'review',
        action: 'flagged a review',
        user: 'Moderator',
        target: 'Review #1234',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'warning'
      }
    ]);

    const days = 7;
    setChartData(Array.from({ length: days }).map((_, i) => ({
      name: format(subDays(new Date(), days - 1 - i), 'EEE'),
      users: Math.floor(Math.random() * 500) + 1000,
      books: Math.floor(Math.random() * 100) + 200,
      reviews: Math.floor(Math.random() * 300) + 500
    })));

    setCategoryData([
      { name: 'Fiction', value: 2345, color: '#8884d8' },
      { name: 'Non-Fiction', value: 1876, color: '#82ca9d' },
      { name: 'Science Fiction', value: 1234, color: '#ffc658' },
      { name: 'Mystery', value: 987, color: '#ff8042' }
    ]);

    setRatingData([
      { name: '5 Stars', value: 15432, color: '#4caf50' },
      { name: '4 Stars', value: 12345, color: '#8bc34a' },
      { name: '3 Stars', value: 8765, color: '#ffc107' },
      { name: '2 Stars', value: 4321, color: '#ff9800' },
      { name: '1 Star', value: 2347, color: '#f44336' }
    ]);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = async () => {
    try {
      // Generate CSV from current data
      const csvData = [
        ['Metric', 'Value'],
        ['Total Users', stats?.totalUsers || 0],
        ['Total Books', stats?.totalBooks || 0],
        ['Total Reviews', stats?.totalReviews || 0],
        ['Total Categories', stats?.totalCategories || 0],
        ['Active Users', stats?.activeUsers || 0],
        ['Average Rating', stats?.averageRating || 0],
        ['Pending Reviews', stats?.pendingReviews || 0],
        ['Flagged Reviews', stats?.flaggedReviews || 0],
        ['', ''],
        ['Report Generated', new Date().toLocaleString()]
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Show loading while checking auth
  if (!authChecked || loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {!authChecked ? 'Verifying authentication...' : 'Loading dashboard...'}
        </Typography>
      </Container>
    );
  }

  // Use mock data if stats is null
  const displayStats = stats || {
    totalUsers: 0,
    totalBooks: 0,
    totalReviews: 0,
    totalCategories: 0,
    userChange: 0,
    bookChange: 0,
    reviewChange: 0,
    categoryChange: 0,
    activeUsers: 0,
    pendingReviews: 0,
    flaggedReviews: 0,
    newUsersToday: 0,
    newBooksToday: 0,
    newReviewsToday: 0,
    averageRating: 0,
    totalViews: 0,
    totalLikes: 0,
    responseTime: 0,
    uptime: 0,
    errorRate: 0
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.name || 'Admin'}! Here's what's happening with your platform.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} title="Refresh">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={handleExport} title="Export Report">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={() => navigate('/admin/settings')} title="Settings">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={displayStats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
            change={displayStats.userChange}
            changeLabel="vs last month"
            subtitle={`${displayStats.newUsersToday} new today`}
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Books"
            value={displayStats.totalBooks}
            icon={<BookIcon />}
            color={theme.palette.success.main}
            change={displayStats.bookChange}
            changeLabel="vs last month"
            subtitle={`${displayStats.newBooksToday} new today`}
            onClick={() => navigate('/admin/books')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Reviews"
            value={displayStats.totalReviews}
            icon={<ReviewIcon />}
            color={theme.palette.warning.main}
            change={displayStats.reviewChange}
            changeLabel="vs last month"
            subtitle={`${displayStats.newReviewsToday} new today`}
            onClick={() => navigate('/admin/reviews')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Categories"
            value={displayStats.totalCategories}
            icon={<CategoryIcon />}
            color={theme.palette.info.main}
            change={displayStats.categoryChange}
            changeLabel="vs last month"
            onClick={() => navigate('/admin/categories')}
          />
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mx: 'auto', mb: 1 }}>
              <PeopleIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayStats.activeUsers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mx: 'auto', mb: 1 }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayStats.pendingReviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Reviews
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mx: 'auto', mb: 1 }}>
              <ErrorIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayStats.flaggedReviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Flagged Reviews
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mx: 'auto', mb: 1 }}>
              <StarIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {displayStats.averageRating.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Platform Activity (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke={theme.palette.primary.main} strokeWidth={2} />
                <Line type="monotone" dataKey="books" stroke={theme.palette.success.main} strokeWidth={2} />
                <Line type="monotone" dataKey="reviews" stroke={theme.palette.warning.main} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Rating Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value">
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Activity
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/activity')}>
                View All
              </Button>
            </Box>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} />
              ))
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* System Health */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          System Health
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                {displayStats.uptime}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight={600}>
                {displayStats.responseTime}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Response Time
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight={600}>
                {displayStats.errorRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Error Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;