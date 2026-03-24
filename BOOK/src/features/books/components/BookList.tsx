import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  Skeleton,
  Alert,
  Drawer,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Slider,
  Rating,
  Divider,
  Collapse,
  Fade,
  Zoom,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ViewCompact as ViewCompactIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SortByAlpha as SortByAlphaIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import BookCard from './BookCard';
import { Book } from '../../../types/book.types';

// ============================================
// Types
// ============================================

export interface BookFilters {
  search?: string;
  categoryId?: number;
  author?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'title' | 'author' | 'rating' | 'reviews' | 'createdAt' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  format?: string[];
  language?: string[];
  status?: string[];
  tags?: string[];
  yearFrom?: number;
  yearTo?: number;
  featured?: boolean;
  bookmarked?: boolean;
  liked?: boolean;
}

export interface Category {
  id: number;
  name: string;
  count?: number;
}

export interface BookListProps {
  books: Book[];
  categories: Category[];
  totalBooks: number;
  loading?: boolean;
  error?: string | null;
  filters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
  onBookmark?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (book: Book) => void;
  showViewToggle?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  defaultView?: 'grid' | 'list' | 'compact';
  pageSize?: number;
  className?: string;
  bookmarkedIds?: number[];
  likedIds?: number[];
  enableVirtualization?: boolean;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
}

// ============================================
// Filter Drawer Component
// ============================================

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: BookFilters;
  categories: Category[];
  onApplyFilters: (filters: BookFilters) => void;
  onClearFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  filters,
  categories,
  onApplyFilters,
  onClearFilters
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<BookFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof BookFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const formatOptions = [
    { value: 'paperback', label: 'Paperback' },
    { value: 'hardcover', label: 'Hardcover' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'audiobook', label: 'Audiobook' }
  ];

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian',
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean'
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        {/* Category Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Category
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={localFilters.categoryId || ''}
              onChange={(e) => handleChange('categoryId', e.target.value || undefined)}
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name} {cat.count ? `(${cat.count})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Rating Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Minimum Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={localFilters.minRating || 0}
              onChange={(_, value) => handleChange('minRating', value || undefined)}
              precision={0.5}
            />
            {localFilters.minRating && (
              <IconButton size="small" onClick={() => handleChange('minRating', undefined)}>
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Price Range Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Price Range
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="Min"
              type="number"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
            <TextField
              size="small"
              label="Max"
              type="number"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Box>
        </Box>

        {/* Year Range Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Publication Year
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="From"
              type="number"
              value={localFilters.yearFrom || ''}
              onChange={(e) => handleChange('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1000, max: new Date().getFullYear() } }}
            />
            <TextField
              size="small"
              label="To"
              type="number"
              value={localFilters.yearTo || ''}
              onChange={(e) => handleChange('yearTo', e.target.value ? Number(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1000, max: new Date().getFullYear() } }}
            />
          </Box>
        </Box>

        {/* Format Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Format
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {formatOptions.map((format) => (
              <Chip
                key={format.value}
                label={format.label}
                onClick={() => {
                  const current = localFilters.format || [];
                  const updated = current.includes(format.value)
                    ? current.filter(f => f !== format.value)
                    : [...current, format.value];
                  handleChange('format', updated);
                }}
                color={localFilters.format?.includes(format.value) ? 'primary' : 'default'}
                variant={localFilters.format?.includes(format.value) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </Box>

        {/* Language Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Language
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={localFilters.language || []}
              onChange={(e) => handleChange('language', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {languageOptions.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Status Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {['published', 'draft', 'archived'].map((status) => (
              <Chip
                key={status}
                label={status}
                onClick={() => {
                  const current = localFilters.status || [];
                  const updated = current.includes(status)
                    ? current.filter(s => s !== status)
                    : [...current, status];
                  handleChange('status', updated);
                }}
                color={localFilters.status?.includes(status) ? 'primary' : 'default'}
                variant={localFilters.status?.includes(status) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </Box>

        {/* Featured Filter */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={localFilters.featured || false}
                onChange={(e) => handleChange('featured', e.target.checked)}
              />
            }
            label="Show featured only"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
};

// ============================================
// Sort Menu Component
// ============================================

interface SortMenuProps {
  sortBy: BookFilters['sortBy'];
  sortOrder: BookFilters['sortOrder'];
  onSortChange: (sortBy: BookFilters['sortBy'], sortOrder: BookFilters['sortOrder']) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ sortBy, sortOrder, onSortChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (newSortBy: BookFilters['sortBy']) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newSortOrder);
    handleClose();
  };

  const sortOptions: Array<{ value: BookFilters['sortBy']; label: string; icon: React.ReactNode }> = [
    { value: 'title', label: 'Title', icon: <SortByAlphaIcon /> },
    { value: 'author', label: 'Author', icon: <PersonIcon /> },
    { value: 'rating', label: 'Rating', icon: <StarIcon /> },
    { value: 'reviews', label: 'Reviews', icon: <StarBorderIcon /> },
    { value: 'createdAt', label: 'Date Added', icon: <DateRangeIcon /> },
    { value: 'price', label: 'Price', icon: <DateRangeIcon /> },
    { value: 'popularity', label: 'Popularity', icon: <TrendingUpIcon /> }
  ];

  return (
    <>
      <Tooltip title="Sort">
        <IconButton onClick={handleClick}>
          <Badge
            color="primary"
            variant="dot"
            invisible={!sortBy}
          >
            <SortIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSort(option.value)}
            selected={sortBy === option.value}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText>
              {option.label}
            </ListItemText>
            {sortBy === option.value && (
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// ============================================
// Skeleton Loader
// ============================================

const BookListSkeleton: React.FC<{ viewMode: string; count?: number }> = ({ viewMode, count = 6 }) => {
  if (viewMode === 'grid') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 4 }} key={index}>
            <Skeleton variant="rounded" height={300} />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={120} />
      ))}
    </Stack>
  );
};

// ============================================
// Main Component
// ============================================

const BookList: React.FC<BookListProps> = ({
  books,
  categories,
  totalBooks,
  loading = false,
  error = null,
  filters,
  onFilterChange,
  onPageChange,
  onRefresh,
  onBookmark,
  onLike,
  onShare,
  showViewToggle = true,
  showFilters = true,
  showSort = true,
  showSearch = true,
  showPagination = true,
  defaultView = 'grid',
  pageSize = 12,
  className,
  bookmarkedIds = [],
  likedIds = [],
  enableVirtualization = false,
  emptyMessage = 'No books found',
  headerActions
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>(defaultView);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFiltersCollapse, setShowFiltersCollapse] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFilterChange({ ...filters, search: value || undefined, page: 1 });
    }, 500),
    [filters, onFilterChange]
  );

  useEffect(() => {
    debouncedSearch(searchInput);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ ...filters, search: undefined, page: 1 });
  };

  // Handle filter changes
  const handleApplyFilters = (newFilters: BookFilters) => {
    onFilterChange({ ...filters, ...newFilters, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: undefined,
      categoryId: undefined,
      author: undefined,
      minRating: undefined,
      maxRating: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: pageSize,
      minPrice: undefined,
      maxPrice: undefined,
      format: undefined,
      language: undefined,
      status: undefined,
      tags: undefined,
      yearFrom: undefined,
      yearTo: undefined,
      featured: undefined
    });
    setSearchInput('');
  };

  // Handle sort change
  const handleSortChange = (sortBy: BookFilters['sortBy'], sortOrder: BookFilters['sortOrder']) => {
    onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list' | 'compact') => {
    setViewMode(mode);
    localStorage.setItem('bookViewMode', mode);
  };

  // Load view mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('bookViewMode') as 'grid' | 'list' | 'compact' | null;
    if (savedMode) {
      setViewMode(savedMode);
    }
  }, []);

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.minRating) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.format?.length) count += filters.format.length;
    if (filters.language?.length) count += filters.language.length;
    if (filters.status?.length) count += filters.status.length;
    if (filters.yearFrom) count++;
    if (filters.yearTo) count++;
    if (filters.featured) count++;
    return count;
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalBooks / (filters.limit || pageSize));
  const currentPage = filters.page || 1;

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Books
          </Typography>
          {headerActions}
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            {showSearch && (
              <Grid size={{ xs: 12 }} size={{ md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid size={{ xs: 12 }} size={{ md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {/* Refresh */}
                {onRefresh && (
                  <Tooltip title="Refresh">
                    <IconButton onClick={onRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Sort */}
                {showSort && (
                  <SortMenu
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onSortChange={handleSortChange}
                  />
                )}

                {/* Filter Toggle */}
                {showFilters && (
                  <Tooltip title="Filters">
                    <IconButton
                      onClick={() => setFilterDrawerOpen(true)}
                      color={getActiveFilterCount() > 0 ? 'primary' : 'default'}
                    >
                      <Badge badgeContent={getActiveFilterCount()} color="primary">
                        <FilterIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                )}

                {/* View Mode Toggle */}
                {showViewToggle && (
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5 }}>
                    <Tooltip title="Grid view">
                      <IconButton
                        onClick={() => handleViewModeChange('grid')}
                        color={viewMode === 'grid' ? 'primary' : 'default'}
                      >
                        <ViewModuleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="List view">
                      <IconButton
                        onClick={() => handleViewModeChange('list')}
                        color={viewMode === 'list' ? 'primary' : 'default'}
                      >
                        <ViewListIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compact view">
                      <IconButton
                        onClick={() => handleViewModeChange('compact')}
                        color={viewMode === 'compact' ? 'primary' : 'default'}
                      >
                        <ViewCompactIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Active Filters Chips */}
            {getActiveFilterCount() > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Active filters:
                  </Typography>
                  {filters.categoryId && (
                    <Chip
                      size="small"
                      label={`Category: ${categories.find(c => c.id === filters.categoryId)?.name}`}
                      onDelete={() => handleApplyFilters({ ...filters, categoryId: undefined })}
                    />
                  )}
                  {filters.minRating && (
                    <Chip
                      size="small"
                      label={`Rating: ${filters.minRating}+`}
                      onDelete={() => handleApplyFilters({ ...filters, minRating: undefined })}
                    />
                  )}
                  {filters.format?.map(format => (
                    <Chip
                      key={format}
                      size="small"
                      label={`Format: ${format}`}
                      onDelete={() => {
                        const updated = filters.format?.filter(f => f !== format);
                        handleApplyFilters({ ...filters, format: updated });
                      }}
                    />
                  ))}
                  <Button
                    size="small"
                    onClick={handleClearFilters}
                  >
                    Clear all
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && <BookListSkeleton viewMode={viewMode} />}

      {/* Empty State */}
      {!loading && !error && books.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Book Grid/List */}
      {!loading && !error && books.length > 0 && (
        <Fade in={true} timeout={500}>
          <Box>
            {viewMode === 'grid' && (
              <Grid container spacing={3}>
                {books.map((book, index) => (
                  <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 4 }} size={{ lg: 3 }} key={book.id}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                      <Box>
                        <BookCard
                          book={book}
                          variant="grid"
                          isBookmarked={bookmarkedIds.includes(book.id)}
                          isLiked={likedIds.includes(book.id)}
                          onBookmark={onBookmark}
                          onLike={onLike}
                          onShare={onShare}
                        />
                      </Box>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}

            {viewMode === 'list' && (
              <Stack spacing={2}>
                {books.map((book, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }} key={book.id}>
                    <Box>
                      <BookCard
                        book={book}
                        variant="list"
                        isBookmarked={bookmarkedIds.includes(book.id)}
                        isLiked={likedIds.includes(book.id)}
                        onBookmark={onBookmark}
                        onLike={onLike}
                        onShare={onShare}
                      />
                    </Box>
                  </Zoom>
                ))}
              </Stack>
            )}

            {viewMode === 'compact' && (
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {books.map((book, index) => (
                    <Fade in={true} style={{ transitionDelay: `${index * 50}ms` }} key={book.id}>
                      <Box>
                        <BookCard
                          book={book}
                          variant="compact"
                          isBookmarked={bookmarkedIds.includes(book.id)}
                          isLiked={likedIds.includes(book.id)}
                          onBookmark={onBookmark}
                          onLike={onLike}
                          onShare={onShare}
                        />
                      </Box>
                    </Fade>
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        categories={categories}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Mobile FAB for filters */}
      {isMobile && showFilters && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setFilterDrawerOpen(true)}
        >
          <Badge badgeContent={getActiveFilterCount()} color="error">
            <FilterIcon />
          </Badge>
        </Fab>
      )}
    </Box>
  );
};

// Need to import missing dependencies
import {
  Menu,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material';

export default BookList;