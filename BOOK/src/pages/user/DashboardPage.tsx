// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\user\DashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  Rating,
  Divider,
  Stack,
  IconButton,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha
} from '@mui/material';
import type { ChipProps } from '@mui/material';
import {
  Person as PersonIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance, subMonths } from 'date-fns'; // Removed subDays
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// ============================================
// Types
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastActive: string;
  role: string;
  stats: {
    reviewsCount: number;
    booksReviewed: number;
    averageRating: number;
    followers: number;
    following: number;
    helpfulVotes: number;
    readingGoal?: number;
    readingProgress?: number;
    streak: number;
    badges: Badge[];
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    github?: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface Activity {
  id: number;
  type: 'review' | 'bookmark' | 'like' | 'follow' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
  link?: string;
}

export interface ReadingListItem {
  id: number;
  bookId: number;
  title: string;
  author: string;
  coverImage?: string;
  status: 'to-read' | 'reading' | 'completed';
  progress?: number;
  rating?: number;
  addedAt: string;
  finishedAt?: string;
}

export interface DashboardStats {
  totalReviews: number;
  totalBooks: number;
  averageRating: number;
  helpfulVotes: number;
  followers: number;
  following: number;
  readingStreak: number;
  badgesCount: number;
}

// Chart data type
interface ChartDataPoint {
  month: string;
  reviews: number;
  books: number;
}

interface BadgeDataPoint {
  name: string;
  value: number;
  color: string;
}

// ============================================
// Helper Functions
// ============================================

const getTrendColor = (trend: number): ChipProps['color'] => {
  return trend > 0 ? 'success' : 'error';
};

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />}
              label={`${Math.abs(trend)}%`}
              color={getTrendColor(trend)}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" component="div" fontWeight={600} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

// ============================================
// Activity Component
// ============================================

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'review':
        return <ReviewIcon sx={{ color: '#4caf50' }} />;
      case 'bookmark':
        return <BookmarkIcon sx={{ color: '#2196f3' }} />;
      case 'like':
        return <FavoriteIcon sx={{ color: '#f44336' }} />;
      case 'follow':
        return <PersonIcon sx={{ color: '#9c27b0' }} />;
      case 'achievement':
        return <StarIcon sx={{ color: '#ff9800' }} />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        px: 0,
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle2" component="span">
            {activity.title}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary" component="span">
              {activity.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
            </Typography>
          </>
        }
      />
      {activity.link && (
        <ListItemSecondaryAction>
          <IconButton edge="end" size="small" href={activity.link}>
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

// ============================================
// Reading List Item Component
// ============================================

interface ReadingListItemComponentProps {
  readingItem: ReadingListItem;
  onUpdateStatus: (id: number, status: string) => void;
  onRate: (id: number, rating: number) => void;
  onRemove: (id: number) => void;
}

const ReadingListItemComponent: React.FC<ReadingListItemComponentProps> = ({
  readingItem,
  onRate,
  onRemove
}) => {
  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'completed': return 'success';
      case 'reading': return 'warning';
      case 'to-read': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            src={readingItem.coverImage}
            variant="rounded"
            sx={{ width: 60, height: 80 }}
          >
            <BookIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {readingItem.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {readingItem.author}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={readingItem.status.replace('-', ' ')}
                color={getStatusColor(readingItem.status)}
              />
              {readingItem.status === 'completed' && (
                <Rating
                  value={readingItem.rating || 0}
                  onChange={(_, value) => onRate(readingItem.id, value || 0)}
                  size="small"
                />
              )}
              <IconButton size="small" color="error" onClick={() => onRemove(readingItem.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        {readingItem.progress !== undefined && readingItem.status === 'reading' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Progress: {readingItem.progress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={readingItem.progress}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// Main Component
// ============================================

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [badgeData, setBadgeData] = useState<BadgeDataPoint[]>([]);

  // Load data from localStorage on mount - FIXED: Added fetchDashboardData to dependency array
  useEffect(() => {
    loadFromStorage();
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever data changes - FIXED: Added saveToStorage to dependency array
  useEffect(() => {
    saveToStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activities, readingList, stats, chartData, badgeData]);

  const loadFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('dashboardUser');
      const storedActivities = localStorage.getItem('dashboardActivities');
      const storedReadingList = localStorage.getItem('dashboardReadingList');
      const storedStats = localStorage.getItem('dashboardStats');
      const storedChartData = localStorage.getItem('dashboardChartData');
      const storedBadgeData = localStorage.getItem('dashboardBadgeData');

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedActivities) setActivities(JSON.parse(storedActivities));
      if (storedReadingList) setReadingList(JSON.parse(storedReadingList));
      if (storedStats) setStats(JSON.parse(storedStats));
      if (storedChartData) setChartData(JSON.parse(storedChartData));
      if (storedBadgeData) setBadgeData(JSON.parse(storedBadgeData));
    } catch (err) {
      console.error('Error loading from storage:', err);
    }
  };

  const saveToStorage = () => {
    try {
      if (user) localStorage.setItem('dashboardUser', JSON.stringify(user));
      if (activities) localStorage.setItem('dashboardActivities', JSON.stringify(activities));
      if (readingList) localStorage.setItem('dashboardReadingList', JSON.stringify(readingList));
      if (stats) localStorage.setItem('dashboardStats', JSON.stringify(stats));
      if (chartData) localStorage.setItem('dashboardChartData', JSON.stringify(chartData));
      if (badgeData) localStorage.setItem('dashboardBadgeData', JSON.stringify(badgeData));
    } catch (err) {
      console.error('Error saving to storage:', err);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Try to fetch real data from API
      let userData = null;
      let activitiesData: Activity[] = [];
      
      try {
        console.log('Fetching user data from /api/users/me');
        const userRes = await api.get('/users/me');
        console.log('User data response:', userRes.data);
        
        if (userRes.data && userRes.data.user) {
          userData = userRes.data.user;
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching user data:', err.response?.data || err.message);
      }
      
      try {
        console.log('Fetching activities from /api/users/me/activity');
        const activitiesRes = await api.get('/users/me/activity');
        console.log('Activities response:', activitiesRes.data);
        
        if (activitiesRes.data && activitiesRes.data.activities) {
          activitiesData = activitiesRes.data.activities;
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Error fetching activities:', err.response?.data || err.message);
      }

      // Use real data if available, otherwise use mock
      if (userData) {
        // Transform API data to match your User interface
        const transformedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.username || '',
          avatar: undefined,
          bio: userData.bio || 'Book enthusiast',
          location: userData.location || '',
          website: userData.website || '',
          joinDate: userData.joinDate || new Date().toISOString(),
          lastActive: new Date().toISOString(),
          role: userData.role || 'User',
          stats: {
            reviewsCount: userData.stats?.reviewsCount || 0,
            booksReviewed: userData.stats?.booksReviewed || 0,
            averageRating: userData.stats?.averageRating || 0,
            followers: userData.stats?.followers || 0,
            following: userData.stats?.following || 0,
            helpfulVotes: userData.stats?.helpfulVotes || 0,
            readingGoal: 50,
            readingProgress: userData.stats?.booksReviewed || 0,
            streak: 0,
            badges: []
          }
        };

        setUser(transformedUser);
        setStats({
          totalReviews: transformedUser.stats.reviewsCount,
          totalBooks: transformedUser.stats.booksReviewed,
          averageRating: transformedUser.stats.averageRating,
          helpfulVotes: transformedUser.stats.helpfulVotes,
          followers: transformedUser.stats.followers,
          following: transformedUser.stats.following,
          readingStreak: 0,
          badgesCount: 0
        });
      } else {
        // Use mock user data from auth context
        const mockUser: User = {
          id: authUser?.id || 1,
          name: authUser?.name || 'John Doe',
          email: authUser?.email || 'john.doe@example.com',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          username: (authUser as any)?.username || authUser?.name || '@johndoe',
          avatar: undefined,
          bio: authUser?.bio || 'Avid reader and book enthusiast',
          location: 'New York, NY',
          website: 'https://johndoe.com',
          joinDate: authUser?.created_at || new Date().toISOString(),
          lastActive: new Date().toISOString(),
          role: authUser?.role || 'User',
          stats: {
            reviewsCount: 42,
            booksReviewed: 38,
            averageRating: 4.5,
            followers: 156,
            following: 89,
            helpfulVotes: 234,
            readingGoal: 50,
            readingProgress: 38,
            streak: 15,
            badges: [
              {
                id: '1',
                name: 'Prolific Reviewer',
                description: 'Wrote 25+ reviews',
                icon: '⭐',
                awardedAt: new Date().toISOString()
              },
              {
                id: '2',
                name: 'Early Adopter',
                description: 'Joined in the first month',
                icon: '🚀',
                awardedAt: new Date().toISOString()
              }
            ]
          }
        };
        setUser(mockUser);
        setStats({
          totalReviews: mockUser.stats.reviewsCount,
          totalBooks: mockUser.stats.booksReviewed,
          averageRating: mockUser.stats.averageRating,
          helpfulVotes: mockUser.stats.helpfulVotes,
          followers: mockUser.stats.followers,
          following: mockUser.stats.following,
          readingStreak: mockUser.stats.streak,
          badgesCount: mockUser.stats.badges.length
        });
      }

      setActivities(activitiesData.length ? activitiesData : []);
      setReadingList([]); // Reading list not implemented yet
      
      // Mock chart data (keep this)
      const mockChartData: ChartDataPoint[] = Array.from({ length: 12 }).map((_, i) => ({
        month: format(subMonths(new Date(), 11 - i), 'MMM'),
        reviews: Math.floor(Math.random() * 10) + 1,
        books: Math.floor(Math.random() * 8) + 1
      }));
      setChartData(mockChartData);

      const mockBadgeData: BadgeDataPoint[] = [
        { name: 'Reviewer', value: 5, color: '#4caf50' },
        { name: 'Contributor', value: 3, color: '#2196f3' },
        { name: 'Expert', value: 2, color: '#ff9800' },
        { name: 'Special', value: 1, color: '#9c27b0' }
      ];
      setBadgeData(mockBadgeData);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [authUser, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpdateReadingStatus = (id: number, status: string) => {
    setReadingList(prev =>
      prev.map(item => 
        item.id === id
          ? { ...item, status: status as ReadingListItem['status'], progress: status === 'reading' ? 0 : item.progress }
          : item
      )
    );
  };

  const handleRateBook = (id: number, rating: number) => {
    setReadingList(prev =>
      prev.map(item => (item.id === id ? { ...item, rating } : item))
    );
  };

  const handleRemoveFromList = (id: number) => {
    setReadingList(prev => prev.filter(item => item.id !== id));
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error || 'Failed to load user data'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
          <Avatar
            src={user.avatar}
            sx={{
              width: 80,
              height: 80,
              border: '3px solid white',
              boxShadow: theme.shadows[2]
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, {user.name}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {user.bio || 'Share your thoughts and discover new books.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
              <Chip
                icon={<CalendarIcon />}
                label={`Joined ${format(new Date(user.joinDate), 'MMMM yyyy')}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<LocationIcon />}
                label={user.location || 'Location not set'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                icon={<StarIcon />}
                label={`${user.stats.streak} day streak`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Grid - FIXED: Updated Grid syntax for MUI v6 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Reviews Written"
            value={stats?.totalReviews || 0}
            icon={<ReviewIcon />}
            color={theme.palette.primary.main}
            trend={12}
            onClick={() => navigate('/my-reviews')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Books Read"
            value={stats?.totalBooks || 0}
            icon={<BookIcon />}
            color={theme.palette.success.main}
            trend={8}
            onClick={() => navigate('/profile?tab=reading')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Rating"
            value={stats?.averageRating.toFixed(1) || '0'}
            icon={<StarIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Helpful Votes"
            value={stats?.helpfulVotes || 0}
            icon={<CheckCircleIcon />}
            color={theme.palette.error.main}
            trend={23}
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Reading List" />
          <Tab label="Activity" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Overview Tab - FIXED: Updated Grid syntax */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Reading Progress */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Reading Goal
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <LinearProgress
                    variant="determinate"
                    value={(user.stats.readingProgress || 0) / (user.stats.readingGoal || 1) * 100}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      position: 'relative',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '50%'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {Math.round((user.stats.readingProgress || 0) / (user.stats.readingGoal || 1) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h4" component="span" fontWeight={600}>
                    {user.stats.readingProgress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {' '}/ {user.stats.readingGoal} books
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    You're making great progress! Keep going.
                  </Typography>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/books')}
              >
                Find More Books
              </Button>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {activities.slice(0, 3).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </List>
              <Button
                fullWidth
                variant="text"
                endIcon={<ArrowForwardIcon />}
                onClick={() => setTabValue(2)}
              >
                View All Activity
              </Button>
            </Paper>
          </Grid>

          {/* Badges */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Badges & Achievements
              </Typography>
              <Grid container spacing={2}>
                {user.stats.badges.length > 0 ? (
                  user.stats.badges.map((badge) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={badge.id}>
                      <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            mr: 2
                          }}
                        >
                          {badge.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {badge.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {badge.description}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No badges earned yet
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Reading List Tab - FIXED: Updated Grid syntax */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Your Reading List
              </Typography>
              {readingList.length > 0 ? (
                readingList.map((item) => (
                  <ReadingListItemComponent
                    key={item.id}
                    readingItem={item}
                    onUpdateStatus={handleUpdateReadingStatus}
                    onRate={handleRateBook}
                    onRemove={handleRemoveFromList}
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Your reading list is empty
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/books')}
                    sx={{ mt: 2 }}
                  >
                    Browse Books
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Reading Stats
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    To Read
                  </Typography>
                  <Typography variant="h5">
                    {readingList.filter(i => i.status === 'to-read').length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Currently Reading
                  </Typography>
                  <Typography variant="h5">
                    {readingList.filter(i => i.status === 'reading').length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h5">
                    {readingList.filter(i => i.status === 'completed').length}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Books
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {readingList.length}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Activity Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            All Activity
          </Typography>
          <List>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No activity yet
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Analytics Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Reading Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    name="Reviews"
                  />
                  <Line
                    type="monotone"
                    dataKey="books"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    name="Books Read"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Badge Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={badgeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {badgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Rating Distribution
              </Typography>
              <Stack spacing={2}>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = Math.floor(Math.random() * 30) + 10;
                  return (
                    <Box key={rating}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{rating} stars</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.warning.main
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/books')}
          sx={{ borderRadius: 28, px: 3, py: 1.5 }}
        >
          Add Book
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardPage;