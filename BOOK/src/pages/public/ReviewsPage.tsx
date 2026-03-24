import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Box,
  Paper,
  Pagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Review {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  comment: string;
  title?: string;
  created_at: string;
  user_name: string;
  user_email?: string;
  book_title: string;
  book_author?: string;
}

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minRating, setMinRating] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.roleId === 1;

  useEffect(() => {
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder, minRating, searchTerm]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        page,
        limit: 10,
        sortBy,
        sortOrder
      };

      if (searchTerm) params.search = searchTerm;
      if (minRating) params.minRating = minRating;

      // Use different endpoints based on whether user is admin
      if (isAdmin && isAuthenticated) {
        // Admin can see all reviews
        response = await api.get('/reviews/all', { params });
      } else {
        // Public users see all reviews (if you add public endpoint)
        // For now, we'll use the book-specific endpoint or show empty
        response = await api.get('/reviews', { params });
      }
      
      // Handle response
      const reviewsData = response.data?.data?.reviews || response.data?.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setTotalPages(response.data?.data?.totalPages || 1);
      setTotalReviews(response.data?.data?.total || 0);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in to view reviews');
      } else if (err.response?.status === 404) {
        setError('Reviews endpoint not found');
      } else {
        setError('Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(tempSearch);
    setPage(1);
  };

  const handleClearSearch = () => {
    setTempSearch('');
    setSearchTerm('');
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value === 'newest') {
      setSortBy('created_at');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortBy('created_at');
      setSortOrder('asc');
    } else if (value === 'highest') {
      setSortBy('rating');
      setSortOrder('desc');
    } else if (value === 'lowest') {
      setSortBy('rating');
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleRatingFilterChange = (event: SelectChangeEvent) => {
    setMinRating(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewClick = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        All Reviews
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse through {totalReviews} reviews from our community
      </Typography>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search reviews by user, book, or comment..."
              value={tempSearch}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: tempSearch && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={
                  sortBy === 'created_at' && sortOrder === 'desc' ? 'newest' :
                  sortBy === 'created_at' && sortOrder === 'asc' ? 'oldest' :
                  sortBy === 'rating' && sortOrder === 'desc' ? 'highest' : 'lowest'
                }
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="highest">Highest Rated</MenuItem>
                <MenuItem value="lowest">Lowest Rated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Min Rating</InputLabel>
              <Select
                value={minRating}
                label="Min Rating"
                onChange={handleRatingFilterChange}
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4+ Stars</MenuItem>
                <MenuItem value="3">3+ Stars</MenuItem>
                <MenuItem value="2">2+ Stars</MenuItem>
                <MenuItem value="1">1+ Stars</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {reviews.length} of {totalReviews} reviews
        </Typography>
        <Chip
          icon={<SortIcon />}
          label={`Sorted by: ${sortBy === 'created_at' ? 'date' : 'rating'} (${sortOrder === 'desc' ? 'descending' : 'ascending'})`}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No reviews found
          </Typography>
          {!isAuthenticated && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please log in to view reviews
            </Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid size={{ xs: 12 }} key={review.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleReviewClick(review.book_id)}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {review.user_name?.[0]?.toUpperCase() || <PersonIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {review.user_name || 'Anonymous User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            reviewed • {formatDate(review.created_at)}
                          </Typography>
                        </Box>
                      </Box>

                      {review.title && (
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          {review.title}
                        </Typography>
                      )}

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {review.book_title} {review.book_author && `by ${review.book_author}`}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {review.rating} out of 5
                        </Typography>
                      </Box>

                      <Typography variant="body1" paragraph>
                        "{review.comment}"
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          bgcolor: 'action.hover',
                          width: '100%'
                        }}
                      >
                        <Typography variant="h2" color="primary" fontWeight={700}>
                          {review.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          out of 5
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" sx={{ mt: 1 }} />
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default ReviewsPage;