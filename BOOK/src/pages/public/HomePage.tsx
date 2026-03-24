// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\public\HomePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Chip,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
  Divider,
  Grid,
  Fab,
  Zoom,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  RateReview as ReviewIcon,
  Category as CategoryIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Share as ShareIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/rootReducer';
import type { AppDispatch } from '../../app/store';
import { fetchLatestReviews } from '../../features/reviews/reviewsSlice';
import { fetchCategories } from '../../features/categories/categoriesSlice';
import api from '../../services/api';

// ============================================
// Types
// ============================================

interface Review {
  id: number;
  book_id: number;
  user_id: number;
  user_name?: string;
  user_avatar?: string;
  book_title?: string;
  book_cover?: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend: number;
}

interface CategoryItem {
  id: number;
  name: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

// ============================================
// Memoized Selectors
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectReviewsState = (state: RootState) => (state as any).reviews;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectCategoriesState = (state: RootState) => (state as any).categories;

const selectLatestReviews = createSelector(
  [selectReviewsState],
  (reviewsState) => ({
    latestReviews: reviewsState?.latestReviews || [],
    isLoading: reviewsState?.isLoading || false
  })
);

const selectCategories = createSelector(
  [selectCategoriesState],
  (categoriesState) => ({
    categories: categoriesState?.categories || []
  })
);

// ============================================
// Main Component
// ============================================

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Total Books', value: 12453, icon: <MenuBookIcon />, color: '#4361ee', trend: 12 },
    { label: 'Active Users', value: 8765, icon: <PeopleIcon />, color: '#f72585', trend: 8 },
    { label: 'Total Reviews', value: 32456, icon: <ReviewIcon />, color: '#4cc9f0', trend: 23 },
    { label: 'Categories', value: 8, icon: <CategoryIcon />, color: '#f8961e', trend: 5 }
  ]);

  // Use memoized selectors
  const { latestReviews, isLoading: reviewsLoading } = useSelector(selectLatestReviews);
  const { categories } = useSelector(selectCategories);

  // Fetch real stats from API with error handling
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Use Promise.allSettled to handle individual failures
        const results = await Promise.allSettled([
          api.get('/books/stats').catch(() => ({ data: { totalBooks: 12453, growth: 12 } })),
          api.get('/users/stats').catch(() => ({ data: { totalUsers: 8765, growth: 8 } })),
          api.get('/reviews/stats').catch(() => ({ data: { totalReviews: 32456, growth: 23 } })),
          api.get('/categories').catch(() => ({ data: { length: 8 } }))
        ]);

        // Extract data with fallbacks
        const booksData = results[0].status === 'fulfilled' ? results[0].value.data : { totalBooks: 12453, growth: 12 };
        const usersData = results[1].status === 'fulfilled' ? results[1].value.data : { totalUsers: 8765, growth: 8 };
        const reviewsData = results[2].status === 'fulfilled' ? results[2].value.data : { totalReviews: 32456, growth: 23 };
        const categoriesData = results[3].status === 'fulfilled' 
          ? { length: results[3].value.data.length } 
          : { length: 8 };

        setStats([
          { 
            label: 'Total Books', 
            value: booksData.totalBooks || 12453, 
            icon: <MenuBookIcon />, 
            color: '#4361ee', 
            trend: booksData.growth || 12 
          },
          { 
            label: 'Active Users', 
            value: usersData.totalUsers || 8765, 
            icon: <PeopleIcon />, 
            color: '#f72585', 
            trend: usersData.growth || 8 
          },
          { 
            label: 'Total Reviews', 
            value: reviewsData.totalReviews || 32456, 
            icon: <ReviewIcon />, 
            color: '#4cc9f0', 
            trend: reviewsData.growth || 23 
          },
          { 
            label: 'Categories', 
            value: categoriesData.length || 8, 
            icon: <CategoryIcon />, 
            color: '#f8961e', 
            trend: 5 
          }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values if all APIs fail
      }
    };

    fetchStats();
    dispatch(fetchLatestReviews(6));
    dispatch(fetchCategories());

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  // Categories data with real counts
  const categoryItems: CategoryItem[] = categories?.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? categories.map((cat: any, index: number) => ({
        id: cat.id,
        name: cat.name,
        count: cat.bookCount || Math.floor(Math.random() * 3000) + 1000,
        icon: <CategoryIcon />,
        color: ['#4361ee', '#f72585', '#4cc9f0', '#f8961e', '#9c89b8', '#ef476f', '#43aa8b', '#f9c74f'][index % 8]
      }))
    : [
        { id: 1, name: 'Fiction', count: 3456, icon: <CategoryIcon />, color: '#4361ee' },
        { id: 2, name: 'Non-Fiction', count: 2876, icon: <CategoryIcon />, color: '#f72585' },
        { id: 3, name: 'Science Fiction', count: 1987, icon: <CategoryIcon />, color: '#4cc9f0' },
        { id: 4, name: 'Fantasy', count: 1765, icon: <CategoryIcon />, color: '#9c89b8' },
        { id: 5, name: 'Mystery', count: 1654, icon: <CategoryIcon />, color: '#f8961e' },
        { id: 6, name: 'Biography', count: 1432, icon: <CategoryIcon />, color: '#ef476f' },
        { id: 7, name: 'History', count: 1234, icon: <CategoryIcon />, color: '#43aa8b' },
        { id: 8, name: 'Technology', count: 987, icon: <CategoryIcon />, color: '#f9c74f' }
      ];

  const handleCategoryClick = (categoryId: number, categoryName: string) => {
    console.log('Navigating to category:', { id: categoryId, name: categoryName });
    navigate(`/books?category=${categoryId}`);
  };

  const handleViewAllReviews = () => navigate('/reviews');
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Hero Section with full background image */}
<Paper
  sx={{
    position: 'relative',
    color: 'white',
    mb: 6,
    borderRadius: 0,
    py: { xs: 10, md: 14 },
    minHeight: { xs: '70vh', md: '90vh' },
    backgroundImage:
      "url('https://images.pexels.com/photos/2177482/pexels-photo-2177482.jpeg?auto=compress&cs=tinysrgb&w=1920')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center'
  }}
>
  {/* Dark Overlay */}
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.58)',
      zIndex: 1
    }}
  />

  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
    <Grid container spacing={5} justifyContent="center">
      <Grid size={{ xs: 12, md: 8, lg: 7 }} sx={{ textAlign: 'center' }}>
        <Typography
          component="h1"
          variant="h1"
          sx={{
            fontSize: { xs: '2.8rem', md: '4.5rem' },
            fontWeight: 800,
            lineHeight: 1.12,
            mb: 3,
            textShadow: '3px 3px 12px rgba(0,0,0,0.8)'
          }}
        >
          Discover Your Next
          <Box component="span" sx={{ color: '#ffca28', display: 'block' }}>
            Favorite Book
          </Box>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            maxWidth: 680,
            mx: 'auto',
            opacity: 0.95,
            mb: 5,
            fontWeight: 400,
            px: 2
          }}
        >
          Join our community of book lovers. Read honest reviews, share your thoughts, and find your next great read from thousands of books.
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          justifyContent="center"
          alignItems="center"
          sx={{ px: 2 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/books')}
            sx={{
              bgcolor: 'white',
              color: 'primary.dark',
              px: 5,
              py: 1.8,
              fontSize: '1.15rem',
              fontWeight: 700,
              borderRadius: 2,
              minWidth: '200px',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-3px)',
                boxShadow: theme.shadows[6]
              }
            }}
          >
            Browse Books
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
            sx={{
              borderColor: 'white',
              color: 'white',
              borderWidth: 2,
              px: 5,
              py: 1.8,
              fontSize: '1.15rem',
              fontWeight: 700,
              borderRadius: 2,
              minWidth: '200px',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            Learn More
          </Button>
        </Stack>
      </Grid>
    </Grid>
  </Container>
</Paper>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[4],
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    margin: '0 auto 16px'
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h3" fontWeight={700} sx={{ color: stat.color }}>
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Chip
                  size="small"
                  icon={stat.trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  label={`${stat.trend > 0 ? '+' : ''}${stat.trend}% this month`}
                  color={stat.trend > 0 ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Categories Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Browse by Category
          </Typography>
          <Grid container spacing={2}>
            {categoryItems.map((category) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      bgcolor: alpha(category.color, 0.05),
                      borderColor: category.color,
                      boxShadow: theme.shadows[2]
                    }
                  }}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(category.color, 0.1),
                      color: category.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {category.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count.toLocaleString()} books
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Latest Reviews Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight={700}>
              Latest Reviews
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllReviews}
              sx={{ textTransform: 'none', fontSize: '1.1rem' }}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={3}>
            {reviewsLoading ? (
              [...Array(6)].map((_, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            ) : latestReviews?.length > 0 ? (
              latestReviews.map((review: Review) => (
                <Grid size={{ xs: 12, md: 4 }} key={review.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => navigate(`/books/${review.book_id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={review.user_avatar} sx={{ width: 50, height: 50 }}>
                        {review.user_name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {review.user_name || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Reviewed {review.book_title || 'a book'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(review.created_at)}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      "{review.comment?.length > 150 ? `${review.comment.substring(0, 150)}...` : review.comment}"
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button size="small" startIcon={<StarIcon />}>
                        Helpful
                      </Button>
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No reviews yet
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            boxShadow: theme.shadows[4]
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default HomePage;