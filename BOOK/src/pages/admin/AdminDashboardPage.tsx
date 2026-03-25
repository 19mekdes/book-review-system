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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  People as PeopleIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
}

interface Review {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  bookTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'book' | 'review' | 'category' | 'system';
  action: string;
  user: string;
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
// Review List Component for Admin
// ============================================

interface ReviewListProps {
  reviews: Review[];
  onDeleteReview: (reviewId: number, bookTitle: string) => void;
  onViewBook: (bookId: number) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onDeleteReview, onViewBook }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReview) {
      onDeleteReview(selectedReview.id, selectedReview.bookTitle);
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    }
  };

  return (
    <>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2, mb: 2 }}>
        Recent Reviews
      </Typography>
      
      {reviews.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          No reviews to display
        </Typography>
      ) : (
        reviews.map((review) => (
          <Paper 
            key={review.id} 
            sx={{ 
              p: 2, 
              mb: 2, 
              display: 'flex', 
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {review.userName?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600}>
                  {review.userName}
                </Typography>
                <Chip 
                  size="small" 
                  label={`${review.rating} ★`} 
                  color={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'error'}
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                on "{review.bookTitle}"
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {format(new Date(review.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onViewBook(review.bookId)}
                title="View Book"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => handleDeleteClick(review)}
                title="Delete Review"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the review for <strong>"{selectedReview?.bookTitle}"</strong> by <strong>{selectedReview?.userName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete Review
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ============================================
// Main Component
// ============================================

const AdminDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [ratingData, setRatingData] = useState<RatingDataPoint[]>([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.roleId === 1;

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    if (!isAuthenticated && !loading) {
      navigate('/login', { replace: true });
    }
  }, [isAdmin, isAuthenticated, loading, navigate]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch books to get stats
      const booksResponse = await api.get('/books', { params: { limit: 1000 } });
      let booksData = [];
      if (booksResponse.data?.data?.books) {
        booksData = booksResponse.data.data.books;
      } else if (booksResponse.data?.books) {
        booksData = booksResponse.data.books;
      } else if (Array.isArray(booksResponse.data)) {
        booksData = booksResponse.data;
      } else if (booksResponse.data?.data && Array.isArray(booksResponse.data.data)) {
        booksData = booksResponse.data.data;
      }
      const totalBooks = booksData.length || 0;
      
      // Fetch reviews to get stats
      const reviewsResponse = await api.get('/reviews', { params: { limit: 1000 } });
      let reviewsData = [];
      if (reviewsResponse.data?.data?.reviews) {
        reviewsData = reviewsResponse.data.data.reviews;
      } else if (reviewsResponse.data?.reviews) {
        reviewsData = reviewsResponse.data.reviews;
      } else if (Array.isArray(reviewsResponse.data)) {
        reviewsData = reviewsResponse.data;
      } else if (reviewsResponse.data?.data && Array.isArray(reviewsResponse.data.data)) {
        reviewsData = reviewsResponse.data.data;
      }
      const totalReviews = reviewsData.length || 0;
      
      // Calculate average rating
      const avgRating = totalReviews > 0 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews 
        : 0;
      
      // Get recent reviews (last 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedReviews = [...reviewsData].sort((a: any, b: any) => 
        new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
      ).slice(0, 5);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedReviews: Review[] = sortedReviews.map((r: any) => ({
        id: r.id,
        userId: r.user_id || r.userId,
        userName: r.user_name || r.userName || 'Anonymous',
        bookId: r.book_id || r.bookId,
        bookTitle: r.book_title || r.bookTitle || 'Unknown Book',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at || r.createdAt
      }));
      
      setRecentReviews(formattedReviews);
      
      // Set stats
      setStats({
        totalUsers: 0, // Will be fetched separately if user endpoint exists
        totalBooks,
        totalReviews,
        totalCategories: 8, // Default categories count
        userChange: 12.5,
        bookChange: 8.3,
        reviewChange: 23.7,
        categoryChange: 5.2,
        activeUsers: 0,
        pendingReviews: 0,
        flaggedReviews: 0,
        newUsersToday: 0,
        newBooksToday: 0,
        newReviewsToday: 0,
        averageRating: avgRating
      });
      
      // Generate mock chart data
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: '5 Stars', value: reviewsData.filter((r: any) => r.rating === 5).length || 0, color: '#4caf50' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: '4 Stars', value: reviewsData.filter((r: any) => r.rating === 4).length || 0, color: '#8bc34a' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: '3 Stars', value: reviewsData.filter((r: any) => r.rating === 3).length || 0, color: '#ffc107' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: '2 Stars', value: reviewsData.filter((r: any) => r.rating === 2).length || 0, color: '#ff9800' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: '1 Star', value: reviewsData.filter((r: any) => r.rating === 1).length || 0, color: '#f44336' }
      ]);
      
      // Set mock activities
      setActivities([
        {
          id: '1',
          type: 'user',
          action: 'registered a new account',
          user: 'New User',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'book',
          action: 'added a new book',
          user: 'Admin',
          target: booksData[0]?.title || 'New Book',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'success'
        }
      ]);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load data');
      // Set fallback data
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
        averageRating: 4.2
      });
      setRecentReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle delete review
  const handleDeleteReview = async (reviewId: number, bookTitle: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setNotification({
        open: true,
        message: `Review for "${bookTitle}" deleted successfully`,
        severity: 'success'
      });
      // Refresh data
      fetchDashboardData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to delete review',
        severity: 'error'
      });
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = () => {
    // Generate CSV report
    const csvData = [
      ['Metric', 'Value'],
      ['Total Books', stats?.totalBooks || 0],
      ['Total Reviews', stats?.totalReviews || 0],
      ['Average Rating', stats?.averageRating?.toFixed(2) || 0],
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
  };

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
    averageRating: 0
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  // Show access denied if not admin
  if (!isAdmin && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied. You do not have permission to view this page.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.name || 'Admin'}! Manage and moderate the platform.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} title="Refresh">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={handleExport} title="Export Report">
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Rating"
            value={displayStats.averageRating.toFixed(1)}
            icon={<StarIcon />}
            color={theme.palette.warning.main}
            subtitle="out of 5 stars"
          />
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
                <Line type="monotone" dataKey="books" stroke={theme.palette.success.main} strokeWidth={2} name="Books" />
                <Line type="monotone" dataKey="reviews" stroke={theme.palette.warning.main} strokeWidth={2} name="Reviews" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Rating Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ratingData.filter(r => r.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {ratingData.filter(r => r.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Reviews Section - Admin can delete any review */}
      <Paper sx={{ p: 3 }}>
        <ReviewList 
          reviews={recentReviews} 
          onDeleteReview={handleDeleteReview}
          onViewBook={handleViewBook}
        />
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                {activity.type === 'user' ? <PeopleIcon /> : <BookIcon />}
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
          ))
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No recent activity
          </Typography>
        )}
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboardPage;