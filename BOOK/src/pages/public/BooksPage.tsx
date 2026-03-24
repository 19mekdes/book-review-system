/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Rating,
  Pagination,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Skeleton,
  SelectChangeEvent,
  Alert,
  Drawer,
  Stack,
  Fab,
  Badge
} from '@mui/material';

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  MenuBook as MenuBookIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ImageNotSupported as ImageNotSupportedIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/rootReducer';
import { fetchBooks, fetchBooksByCategory } from '../../features/books/booksSlice';
import { fetchCategories, selectAllCategories, selectCategoriesLoading } from '../../features/categories/categoriesSlice';

// ============================================
// Types
// ============================================

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  category?: string;
  cover_image?: string;
  coverImage?: string;
  published_date?: string;
  avg_rating?: number;
  average_rating?: number;
  review_count?: number;
  reviews_count?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  bookCount?: number;
}

interface Filters {
  search: string;
  category: string;
  minRating: number;
  sortBy: 'title' | 'author' | 'rating' | 'date' | 'reviews';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// ============================================
// CoverImage Component
// ============================================

interface CoverImageProps {
  src?: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
}

const CoverImage: React.FC<CoverImageProps> = ({ src, title }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = src || '';
  const isValidUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:image') || imageUrl.startsWith('/uploads'));
  
  const getPlaceholderColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  const placeholderColor = getPlaceholderColor(title);

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(title);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '140%',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: placeholderColor
      }}
    >
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 2
          }}
        />
      )}

      {!imageError && isValidUrl ? (
        <img
          src={imageUrl}
          alt={title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoaded ? 'block' : 'none'
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: placeholderColor,
            color: 'text.primary'
          }}
        >
          <ImageNotSupportedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="caption" align="center" sx={{ px: 1, fontWeight: 500 }}>
            {initials}
          </Typography>
          <Typography variant="caption" align="center" sx={{ px: 1, fontSize: '0.7rem', opacity: 0.7 }}>
            No Cover
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ============================================
// Memoized Selectors
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectBooksState = (state: RootState) => (state as any).books;

const selectBooksData = createSelector(
  [selectBooksState],
  (booksState) => {
    const paginatedBooks = booksState?.books;
    const books = paginatedBooks?.data || [];
    const totalPages = paginatedBooks?.totalPages || booksState?.totalPages || 1;
    const isLoading = booksState?.booksLoading || false;
    const total = paginatedBooks?.total || booksState?.total || 0;
    
    return {
      books: Array.isArray(books) ? books : [],
      totalPages,
      total,
      isLoading
    };
  }
);

// ============================================
// Main Component
// ============================================

const BooksPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get category from URL query params
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: 'all',
    minRating: 0,
    sortBy: 'title',
    sortOrder: 'asc',
    page: 1,
    limit: isMobile ? 6 : 12
  });
  const [tempFilters, setTempFilters] = useState<Filters>(filters);
  const [categoriesError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Use selectors
  const { books, totalPages, total, isLoading } = useSelector(selectBooksData);
  const categories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);

  // Handle scroll for FAB
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update limit based on screen size
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(prev => ({
      ...prev,
      limit: isMobile ? 6 : 12
    }));
    setTempFilters(prev => ({
      ...prev,
      limit: isMobile ? 6 : 12
    }));
  }, [isMobile]);

  // Fetch categories if empty
  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(fetchCategories() as any);
    }
  }, [categories.length, categoriesLoading, dispatch]);

  // Fetch books when component mounts or filters change
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      minRating: filters.minRating,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    };
    
    if (filters.category !== 'all') {
      dispatch(fetchBooksByCategory({
        categoryId: parseInt(filters.category),
        params: params
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(fetchBooks(params) as any);
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInitialLoad(false);
  }, [dispatch, filters]);

  // Update category from URL when categories load
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      const urlCategory = queryParams.get('category');
      
      if (urlCategory && urlCategory !== 'all') {
        const categoryExists = categories.some(
          (c: Category) => c.id.toString() === urlCategory
        );
        
        if (categoryExists && urlCategory !== filters.category) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFilters(prev => ({ ...prev, category: urlCategory, page: 1 }));
          setTempFilters(prev => ({ ...prev, category: urlCategory }));
        }
      }
    }
  }, [categoriesLoading, categories, queryParams, filters.category]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempFilters(prev => ({ ...prev, search: event.target.value }));
  };

  // FIXED: Search function - triggers the actual search
  const handleSearchSubmit = () => {
    setFilters(prev => ({ ...prev, search: tempFilters.search, page: 1 }));
    if (isMobile) setMobileFilterOpen(false);
  };

  // FIXED: Clear search function
  const handleClearSearch = () => {
    setTempFilters(prev => ({ ...prev, search: '' }));
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    const category = event.target.value;
    setTempFilters(prev => ({ ...prev, category }));
    setFilters(prev => ({ ...prev, category, page: 1 }));
    
    const params = new URLSearchParams(location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate({ search: params.toString() });
    
    if (isMobile) setMobileFilterOpen(false);
  };

  const handleRatingChange = (_event: Event, value: number | number[]) => {
    setTempFilters(prev => ({ ...prev, minRating: value as number }));
  };

  const handleRatingChangeCommitted = (_event: React.SyntheticEvent | Event, value: number | number[]) => {
    setFilters(prev => ({ ...prev, minRating: value as number, page: 1 }));
  };


  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, ...tempFilters, page: 1 }));
    setShowFilters(false);
    if (isMobile) setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      category: 'all',
      minRating: 0,
      sortBy: 'title' as const,
      sortOrder: 'asc' as const,
      page: 1,
      limit: isMobile ? 6 : 12
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilters(false);
    if (isMobile) setMobileFilterOpen(false);
    
    navigate({ search: '' });
  };

  const handleBookClick = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = useCallback((categoryId: number): string => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return 'Uncategorized';
    }
    const category = categories.find((c: Category) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  }, [categories]);

  const getBookCover = (book: Book): string => {
    return book.cover_image || book.coverImage || '';
  };

  const getBookRating = (book: Book): number => {
    return book.avg_rating || book.average_rating || 0;
  };

  const getBookReviewCount = (book: Book): number => {
    return book.review_count || book.reviews_count || 0;
  };

  const activeCategoryName = useMemo(() => {
    if (filters.category === 'all') return null;
    const category = categories.find(c => c.id.toString() === filters.category);
    return category?.name;
  }, [categories, filters.category]);

  // Mobile filter drawer content
  const MobileFilterDrawer = () => (
    <Drawer
      anchor="bottom"
      open={mobileFilterOpen}
      onClose={() => setMobileFilterOpen(false)}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>Filters & Search</Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          {/* Search Field with Search Button */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search books..."
              value={tempFilters.search}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: tempFilters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearchSubmit}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Search
            </Button>
          </Box>

          {/* Category Select */}
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={tempFilters.category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Array.isArray(categories) && categories.map((category: Category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name} ({category.bookCount || 0})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sort Select */}
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${tempFilters.sortBy}-${tempFilters.sortOrder}`}
              label="Sort By"
              onChange={(e: SelectChangeEvent) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [Filters['sortBy'], Filters['sortOrder']];
                setTempFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
            >
              <MenuItem value="title-asc">Title (A-Z)</MenuItem>
              <MenuItem value="title-desc">Title (Z-A)</MenuItem>
              <MenuItem value="author-asc">Author (A-Z)</MenuItem>
              <MenuItem value="author-desc">Author (Z-A)</MenuItem>
              <MenuItem value="rating-desc">Highest Rated</MenuItem>
              <MenuItem value="rating-asc">Lowest Rated</MenuItem>
              <MenuItem value="reviews-desc">Most Reviewed</MenuItem>
            </Select>
          </FormControl>

          {/* Rating Slider */}
          <Box>
            <Typography gutterBottom>Minimum Rating: {tempFilters.minRating}</Typography>
            <Slider
              value={tempFilters.minRating}
              onChange={handleRatingChange}
              step={0.5}
              marks
              min={0}
              max={5}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button fullWidth variant="outlined" onClick={handleResetFilters}>
              Reset All
            </Button>
            <Button fullWidth variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );

  if (initialLoad && isLoading && books.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {[...Array(isMobile ? 4 : 6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            component="h1" 
            fontWeight={700} 
            gutterBottom
          >
            Browse Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover your next favorite read from our collection
          </Typography>
        </Box>

        {/* Search and Filter Bar - Desktop */}
        {!isMobile && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by title, author, or description..."
                    value={tempFilters.search}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: tempFilters.search && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearchSubmit}
                    sx={{ minWidth: 100 }}
                  >
                    Search
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={tempFilters.category}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {Array.isArray(categories) && categories.map((category: Category) => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.name} ({category.bookCount || 0})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, md: 4 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    fullWidth
                  >
                    Filters
                  </Button>
                  <Tooltip title="Grid View">
                    <IconButton
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                      onClick={() => setViewMode('grid')}
                    >
                      <ViewModuleIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="List View">
                    <IconButton
                      color={viewMode === 'list' ? 'primary' : 'default'}
                      onClick={() => setViewMode('list')}
                    >
                      <ViewListIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>

            {/* Advanced Filters - Desktop */}
            {showFilters && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography gutterBottom>Minimum Rating</Typography>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={tempFilters.minRating}
                        onChange={handleRatingChange}
                        onChangeCommitted={handleRatingChangeCommitted}
                        step={0.5}
                        marks={[
                          { value: 0, label: '0' },
                          { value: 1, label: '1' },
                          { value: 2, label: '2' },
                          { value: 3, label: '3' },
                          { value: 4, label: '4' },
                          { value: 5, label: '5' }
                        ]}
                        min={0}
                        max={5}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={`${tempFilters.sortBy}-${tempFilters.sortOrder}`}
                        label="Sort By"
                        onChange={(e: SelectChangeEvent) => {
                          const [sortBy, sortOrder] = e.target.value.split('-') as [Filters['sortBy'], Filters['sortOrder']];
                          setTempFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        }}
                      >
                        <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                        <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                        <MenuItem value="author-asc">Author (A-Z)</MenuItem>
                        <MenuItem value="author-desc">Author (Z-A)</MenuItem>
                        <MenuItem value="rating-desc">Highest Rated</MenuItem>
                        <MenuItem value="rating-asc">Lowest Rated</MenuItem>
                        <MenuItem value="reviews-desc">Most Reviewed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button onClick={handleResetFilters}>Reset All</Button>
                  <Button variant="contained" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Mobile Filter Bar */}
        {isMobile && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              {/* Search Field with Search Button - Mobile */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search books..."
                  value={tempFilters.search}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: tempFilters.search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchSubmit}
                  sx={{ minWidth: 70 }}
                >
                  Search
                </Button>
              </Box>

              {/* Filter Button - Mobile */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setMobileFilterOpen(true)}
                >
                  Filters
                  <Badge
                    badgeContent={
                      (filters.category !== 'all' ? 1 : 0) +
                      (filters.minRating > 0 ? 1 : 0)
                    }
                    color="primary"
                    sx={{ ml: 1 }}
                  >
                    <Box component="span" sx={{ width: 8 }} />
                  </Badge>
                </Button>
                <Tooltip title="Grid View">
                  <IconButton
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  >
                    <ViewModuleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List View">
                  <IconButton
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    <ViewListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Active Category Indicator */}
        {activeCategoryName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing books in category: <strong>{activeCategoryName}</strong>
            {filters.search && ` • Search: "${filters.search}"`}
          </Alert>
        )}

        {/* Search Active Indicator */}
        {filters.search && !activeCategoryName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Showing results for: <strong>"{filters.search}"</strong>
          </Alert>
        )}

        {/* Error Display */}
        {categoriesError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {categoriesError}
          </Alert>
        )}

        {/* Results Count */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          mb: 2 
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {books?.length || 0} of {total} books
          </Typography>
          <Chip
            icon={<SortIcon />}
            label={`Sorted by: ${filters.sortBy} (${filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Books Grid */}
        {isLoading ? (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {[...Array(isMobile ? 4 : 6)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
              </Grid>
            ))}
          </Grid>
        ) : books?.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <MenuBookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {filters.search 
                ? `No books found matching "${filters.search}"` 
                : activeCategoryName 
                  ? `No books found in ${activeCategoryName} category` 
                  : 'No books found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {filters.search 
                ? 'Try a different search term or clear the search to see all books.'
                : activeCategoryName 
                  ? `There are no books in the ${activeCategoryName} category yet.` 
                  : 'Try adjusting your search or filters to find books.'}
            </Typography>
            <Button variant="contained" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {Array.isArray(books) && books.map((book: Book) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-8px)' },
                      boxShadow: { md: theme.shadows[8] }
                    }
                  }}
                  onClick={() => handleBookClick(book.id)}
                >
                  <CoverImage
                    src={getBookCover(book)}
                    title={book.title}
                    size="medium"
                  />
                  
                  <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, md: 2 } }}>
                    <Typography 
                      gutterBottom 
                      variant={isMobile ? 'subtitle1' : 'h6'} 
                      fontWeight={600} 
                      noWrap
                    >
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {book.author}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating 
                        value={getBookRating(book)} 
                        precision={0.1} 
                        readOnly 
                        size="small" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({getBookReviewCount(book)})
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={getCategoryName(book.categoryId)}
                      sx={{ mb: 1 }}
                    />

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      {book.description || 'No description available.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'large'}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 1}
              showFirstButton={!isMobile}
              showLastButton={!isMobile}
            />
          </Box>
        )}

        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer />

        {/* Scroll to Top FAB */}
        {showScrollTop && (
          <Fab
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              boxShadow: theme.shadows[4]
            }}
          >
            <ArrowUpwardIcon />
          </Fab>
        )}
      </Container>
    </Box>
  );
};

export default BooksPage;