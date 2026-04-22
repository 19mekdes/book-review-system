import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Rating,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Pagination,
  useTheme,
  alpha,
  Grow,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Book as BookIcon,
  DateRange as DateRangeIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';



export interface Review {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  bookCategory: string;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  notHelpful: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft' | 'flagged';
  isHelpful?: boolean;
  isReported?: boolean;
}

export interface ReviewFilters {
  search?: string;
  rating?: number | 'all';
  sortBy?: 'date' | 'rating' | 'helpful' | 'comments';
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'published' | 'draft' | 'flagged';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalHelpful: number;
  totalComments: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}



interface EditReviewDialogProps {
  open: boolean;
  onClose: () => void;
  review: Review | null;
  onSave: (id: number, data: Partial<Review>) => void;
}

const EditReviewDialog: React.FC<EditReviewDialogProps> = ({
  open,
  onClose,
  review,
  onSave
}) => {
  const [rating, setRating] = useState<number | null>(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use useEffect to sync with review prop
  useEffect(() => {
    if (review) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRating(review.rating);
      setTitle(review.title || '');
      setContent(review.content);
    } else {
      setRating(0);
      setTitle('');
      setContent('');
    }
  }, [review]);

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!rating || rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Review must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (review) {
      onSave(review.id, {
        rating: rating!,
        title,
        content
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Review
        {review && (
          <Chip
            label={review.bookTitle}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Rating */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Your Rating *
            </Typography>
            <Rating
              size="large"
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
                if (errors.rating) {
                  setErrors({ ...errors, rating: '' });
                }
              }}
            />
            {errors.rating && (
              <Typography variant="caption" color="error">
                {errors.rating}
              </Typography>
            )}
          </Box>

          {/* Title */}
          <TextField
            fullWidth
            label="Review Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Content */}
          <TextField
            fullWidth
            label="Your Review *"
            multiline
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) {
                setErrors({ ...errors, content: '' });
              }
            }}
            error={!!errors.content}
            helperText={errors.content || `${content.length}/2000 characters`}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reviewTitle: string;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  reviewTitle
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Review</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <Typography variant="body1">
          Are you sure you want to delete your review for "{reviewTitle}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Review Card Component
// ============================================

interface ReviewCardProps {
  review: Review;
  onEdit: (review: Review) => void;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onShare
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [isHelpful, setIsHelpful] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHelpful(!isHelpful);
    setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Grow in={true} timeout={500}>
      <Card
        sx={{
          mb: 2,
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            {/* Book Cover */}
            <Grid size={{ xs: 12, sm: 2 }}>
              <CardMedia
                component="img"
                image={review.bookCover || '/images/book-placeholder.jpg'}
                alt={review.bookTitle}
                sx={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 1
                }}
              />
            </Grid>

            {/* Review Content */}
            <Grid size={{ xs: 12, sm: 10 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" component="h3" fontWeight={600}>
                    {review.bookTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {review.bookAuthor} • {review.bookCategory}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={review.status}
                    color={getStatusColor(review.status) as 'success' | 'error' | 'warning' | 'info' | 'default'}
                  />
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e);
                  }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                </Typography>
              </Box>

              {review.title && (
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {review.title}
                </Typography>
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1
                }}
              >
                {review.content}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  size="small"
                  startIcon={isHelpful ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  onClick={handleHelpful}
                  color={isHelpful ? 'primary' : 'inherit'}
                >
                  Helpful ({helpfulCount})
                </Button>

                <Tooltip title="Comments">
                  <Badge badgeContent={review.comments} color="primary">
                    <CommentIcon fontSize="small" color="action" />
                  </Badge>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            onEdit(review);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onDelete(review.id);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onShare(review.id);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </Grow>
  );
};



const MyReviewsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'date',
    sortOrder: 'desc',
    status: 'all',
    page: 1,
    limit: 10
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Define filterReviews with useCallback
  const filterReviews = useCallback(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.bookTitle.toLowerCase().includes(searchLower) ||
        r.bookAuthor.toLowerCase().includes(searchLower) ||
        r.content.toLowerCase().includes(searchLower) ||
        r.title?.toLowerCase().includes(searchLower)
      );
    }

    // Apply rating filter
    if (filters.rating && filters.rating !== 'all') {
      filtered = filtered.filter(r => r.rating === filters.rating);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'helpful':
            aValue = a.helpful;
            bValue = b.helpful;
            break;
          case 'comments':
            aValue = a.comments;
            bValue = b.comments;
            break;
          default:
            return 0;
        }

        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, filters]);

  // Fetch data
  useEffect(() => {
    fetchReviews();
  }, []);

  // Update filtered reviews when dependencies change
  useEffect(() => {
    filterReviews();
  }, [filterReviews]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock reviews data
const mockReviews: Review[] = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  bookId: i + 1,
  bookTitle: `Book Title ${i + 1}`,
  bookAuthor: `Author ${Math.floor(Math.random() * 10) + 1}`,
  bookCover: undefined,
  bookCategory: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery'][Math.floor(Math.random() * 4)],
  rating: Math.floor(Math.random() * 5) + 1,
  title: i % 3 === 0 ? `Review Title ${i + 1}` : undefined,
  content: `This is a sample review content for book ${i + 1}. It contains my thoughts about the plot, characters, and writing style.`,
  helpful: Math.floor(Math.random() * 50),
  notHelpful: Math.floor(Math.random() * 10),
  comments: Math.floor(Math.random() * 20),
  createdAt: subDays(new Date(), Math.floor(Math.random() * 90)).toISOString(),
  updatedAt: subDays(new Date(), Math.floor(Math.random() * 30)).toISOString(),
  status: (['published', 'published', 'published', 'draft', 'flagged'][Math.floor(Math.random() * 5)]) as 'published' | 'draft' | 'flagged'
}));
      // Calculate stats
      const totalReviews = mockReviews.length;
      const averageRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
      const totalHelpful = mockReviews.reduce((acc, r) => acc + r.helpful, 0);
      const totalComments = mockReviews.reduce((acc, r) => acc + r.comments, 0);

      // Rating distribution
      const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
        const count = mockReviews.filter(r => Math.floor(r.rating) === rating).length;
        return {
          rating,
          count,
          percentage: (count / totalReviews) * 100
        };
      });

      // Recent activity (last 7 days)
      const recentActivity = Array.from({ length: 7 }).map((_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM dd'),
        count: Math.floor(Math.random() * 5)
      }));

      // Top categories
      const categoryMap = new Map<string, number>();
      mockReviews.forEach(r => {
        categoryMap.set(r.bookCategory, (categoryMap.get(r.bookCategory) || 0) + 1);
      });
      const topCategories = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setReviews(mockReviews);
      setStats({
        totalReviews,
        averageRating,
        totalHelpful,
        totalComments,
        ratingDistribution,
        recentActivity,
        topCategories
      });
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = (newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    handleFilterClose();
  };

  const handleFilterClear = () => {
    setFilters({
      sortBy: 'date',
      sortOrder: 'desc',
      status: 'all',
      page: 1,
      limit: 10
    });
    setSearchTerm('');
    handleFilterClose();
  };

  const handleSortChange = (sortBy: 'date' | 'rating' | 'helpful' | 'comments') => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1
    }));
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setEditDialogOpen(true);
  };

  const handleSaveReview = (id: number, data: Partial<Review>) => {
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)
    );
    showNotification('Review updated successfully', 'success');
    setEditDialogOpen(false);
  };

  const handleDeleteReview = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    showNotification('Review deleted successfully', 'success');
    setDeleteDialogOpen(false);
  };

  const handleShareReview = (id: number) => {
    navigator.clipboard.writeText(`${window.location.origin}/reviews/${id}`);
    showNotification('Link copied to clipboard', 'success');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / (filters.limit || 10));
  const paginatedReviews = filteredReviews.slice(
    ((filters.page || 1) - 1) * (filters.limit || 10),
    (filters.page || 1) * (filters.limit || 10)
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          My Reviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all your book reviews
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight={700}>
                {stats.totalReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                {stats.totalHelpful}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Helpful Votes
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="info.main" fontWeight={700}>
                {stats.totalComments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comments
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by book, author, or content..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Sort
            </Button>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterOpen}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sort Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { handleSortChange('date'); setAnchorEl(null); }}>
          <ListItemIcon>
            <DateRangeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Date</ListItemText>
          {filters.sortBy === 'date' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              {filters.sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem onClick={() => { handleSortChange('rating'); setAnchorEl(null); }}>
          <ListItemIcon>
            <StarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rating</ListItemText>
          {filters.sortBy === 'rating' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              {filters.sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem onClick={() => { handleSortChange('helpful'); setAnchorEl(null); }}>
          <ListItemIcon>
            <ThumbUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Helpful</ListItemText>
          {filters.sortBy === 'helpful' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              {filters.sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </ListItemIcon>
          )}
        </MenuItem>
        <MenuItem onClick={() => { handleSortChange('comments'); setAnchorEl(null); }}>
          <ListItemIcon>
            <CommentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Comments</ListItemText>
          {filters.sortBy === 'comments' && (
            <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
              {filters.sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
            </ListItemIcon>
          )}
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{ sx: { width: 320, p: 2 } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Filter Reviews
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Rating</InputLabel>
            <Select
              value={filters.rating || 'all'}
              label="Rating"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => handleFilterApply({ rating: e.target.value as any })}
            >
              <MenuItem value="all">All Ratings</MenuItem>
              <MenuItem value={5}>5 Stars</MenuItem>
              <MenuItem value={4}>4 Stars</MenuItem>
              <MenuItem value={3}>3 Stars</MenuItem>
              <MenuItem value={2}>2 Stars</MenuItem>
              <MenuItem value={1}>1 Star</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || 'all'}
              label="Status"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => handleFilterApply({ status: e.target.value as any })}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="flagged">Flagged</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleFilterClear}>
              Clear
            </Button>
          </Box>
        </Stack>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: '100%', py: 4 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading your reviews...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Reviews Display */}
      {!loading && !error && (
        <>
          {filteredReviews.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No reviews found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchTerm || filters.rating || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You haven\'t written any reviews yet'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<BookIcon />}
                onClick={() => navigate('/books')}
              >
                Browse Books
              </Button>
            </Paper>
          ) : (
            <Box>
              {paginatedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={handleEditReview}
                  onDelete={() => {
                    setSelectedReview(review);
                    setDeleteDialogOpen(true);
                  }}
                  onShare={handleShareReview}
                />
              ))}
            </Box>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Analytics Section */}
      {stats && !loading && !error && filteredReviews.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {/* Rating Distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Rating Distribution
              </Typography>
              <Stack spacing={2}>
                {stats.ratingDistribution.map((item) => (
                  <Box key={item.rating}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.rating} stars</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
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
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Recent Activity Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Categories */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Categories You Review
              </Typography>
              <Grid container spacing={2}>
                {stats.topCategories.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.category}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.count} {item.count === 1 ? 'review' : 'reviews'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Edit Review Dialog */}
      <EditReviewDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onSave={handleSaveReview}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedReview(null);
        }}
        onConfirm={() => selectedReview && handleDeleteReview(selectedReview.id)}
        reviewTitle={selectedReview?.bookTitle || ''}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyReviewsPage;