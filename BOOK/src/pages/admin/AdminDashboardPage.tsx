import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
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
  Star as StarIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
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
  books: number;
  reviews: number;
}

interface RatingDataPoint {
  name: string;
  value: number;
  color: string;
}


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
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer p-6 border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: alpha(color, 0.1), color: color }}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${change > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {change > 0 ? <TrendingUpIcon className="w-3 h-3" /> : <TrendingDownIcon className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      
      {subtitle && (
        <div className="text-xs text-gray-400">{subtitle}</div>
      )}
      
      {changeLabel && (
        <div className="text-xs text-gray-400 mt-1">{changeLabel}</div>
      )}
    </div>
  );
};



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

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-700';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View All
        </button>
      </div>
      
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reviews to display</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-sm">
                      {review.userName?.charAt(0) || 'U'}
                    </div>
                    <span className="font-medium text-gray-900">{review.userName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating} ★
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-1">
                    on "{review.bookTitle}"
                  </div>
                  
                  <div className="text-gray-600 text-sm mt-2">
                    {review.comment}
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {format(new Date(review.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button 
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={() => onViewBook(review.bookId)}
                    title="View Book"
                  >
                    <VisibilityIcon className="w-5 h-5" />
                  </button>
                  <button 
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteClick(review)}
                    title="Delete Review"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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



const AdminDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [ratingData, setRatingData] = useState<RatingDataPoint[]>([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.roleId === 1;

  useEffect(() => {
    if (!loading && !isAdmin && isAuthenticated) {
      navigate('/', { replace: true });
    }
    if (!isAuthenticated && !loading) {
      navigate('/login', { replace: true });
    }
  }, [isAdmin, isAuthenticated, loading, navigate]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [booksResponse, reviewsResponse] = await Promise.all([
        api.get('/books', { params: { limit: 100 } }),
        api.get('/reviews', { params: { limit: 100 } })
      ]);
      
      // Process books data
      let booksData: unknown[] = [];
      if (booksResponse.data?.data?.books) {
        booksData = booksResponse.data.data.books;
      } else if (booksResponse.data?.books) {
        booksData = booksResponse.data.books;
      } else if (Array.isArray(booksResponse.data)) {
        booksData = booksResponse.data;
      }
      const totalBooks = booksData.length || 0;
      
      // Process reviews data
      let reviewsData: unknown[] = [];
      if (reviewsResponse.data?.data?.reviews) {
        reviewsData = reviewsResponse.data.data.reviews;
      } else if (reviewsResponse.data?.reviews) {
        reviewsData = reviewsResponse.data.reviews;
      } else if (Array.isArray(reviewsResponse.data)) {
        reviewsData = reviewsResponse.data;
      }
      const totalReviews = reviewsData.length || 0;
      
      // Calculate average rating
      const avgRating = totalReviews > 0 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews 
        : 0;
      
      // Get recent reviews
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
        totalUsers: 0,
        totalBooks,
        totalReviews,
        totalCategories: 8,
        userChange: 12.5,
        bookChange: 8.3,
        reviewChange: 23.7,
        categoryChange: 5.2,
        activeUsers: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pendingReviews: reviewsData.filter((r: any) => r.status === 'pending').length || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        flaggedReviews: reviewsData.filter((r: any) => r.is_flagged).length || 0,
        newUsersToday: 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newBooksToday: booksData.filter((b: any) => {
          const createdDate = new Date(b.created_at || b.createdAt);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        }).length || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newReviewsToday: reviewsData.filter((r: any) => {
          const createdDate = new Date(r.created_at || r.createdAt);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        }).length || 0,
        averageRating: avgRating
      });
      
      // Generate chart data
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'EEE');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayReviews = reviewsData.filter((r: any) => {
          const reviewDate = new Date(r.created_at || r.createdAt);
          return reviewDate.toDateString() === date.toDateString();
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayBooks = booksData.filter((b: any) => {
          const bookDate = new Date(b.created_at || b.createdAt);
          return bookDate.toDateString() === date.toDateString();
        });
        
        return {
          name: dateStr,
          books: dayBooks.length,
          reviews: dayReviews.length
        };
      });
      
      setChartData(last7Days);
      
      // Generate rating distribution
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviewsData.forEach((r: any) => {
        const rating = Math.round(r.rating);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating as keyof typeof ratingCounts]++;
        }
      });
      
      setRatingData([
        { name: '5 Stars', value: ratingCounts[5], color: '#10b981' },
        { name: '4 Stars', value: ratingCounts[4], color: '#34d399' },
        { name: '3 Stars', value: ratingCounts[3], color: '#f59e0b' },
        { name: '2 Stars', value: ratingCounts[2], color: '#fb923c' },
        { name: '1 Star', value: ratingCounts[1], color: '#ef4444' }
      ]);
      
      // Set activities from recent reviews
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recentActivities: ActivityItem[] = sortedReviews.slice(0, 5).map((r: any) => ({
        id: `review-${r.id}`,
        type: 'review',
        action: 'wrote a review',
        user: r.user_name || r.userName || 'Anonymous',
        target: r.book_title || r.bookTitle || 'Unknown Book',
        timestamp: r.created_at || r.createdAt,
        status: 'success'
      }));
      
      setActivities(recentActivities);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteReview = async (reviewId: number, bookTitle: string) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setNotification({
        open: true,
        message: `Review for "${bookTitle}" deleted successfully`,
        severity: 'success'
      });
      fetchDashboardData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
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

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">⚠️</div>
            <h3 className="font-semibold">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-600">No data available</p>
        </div>
      </div>
    );
  }

  const displayStats = stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {user?.name || 'Admin'}! Manage and moderate the platform.
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button 
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshIcon />
              </button>
              <button 
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Export Report"
              >
                <DownloadIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <StatCard
            title="Categories"
            value={displayStats.totalCategories}
            icon={<CategoryIcon />}
            color={theme.palette.info.main}
            change={displayStats.categoryChange}
            changeLabel="vs last month"
            onClick={() => navigate('/admin/categories')}
          />
          <StatCard
            title="Average Rating"
            value={displayStats.averageRating.toFixed(1)}
            icon={<StarIcon />}
            color={theme.palette.warning.main}
            subtitle="out of 5 stars"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Activity (Last 7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="books" stroke="#10b981" strokeWidth={2} name="Books" dot={{ fill: '#10b981', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="reviews" stroke="#f59e0b" strokeWidth={2} name="Reviews" dot={{ fill: '#f59e0b', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </div>
        </div>

        {/* Recent Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <ReviewList 
            reviews={recentReviews} 
            onDeleteReview={handleDeleteReview}
            onViewBook={handleViewBook}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {activity.type === 'user' ? <PeopleIcon className="w-5 h-5" /> : <BookIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.user}</div>
                    <div className="text-sm text-gray-500">
                      {activity.action} {activity.target && `• ${activity.target}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent activity</div>
          )}
        </div>
      </div>

      {/* Notification */}
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
    </div>
  );
};

export default AdminDashboardPage;