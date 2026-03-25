// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\admin\AllReviewsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
  alpha,
  Divider,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Flag as FlagIcon,
  ThumbUp as ThumbUpIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { format, formatDistance } from "date-fns";

// ============================================
// Types
// ============================================

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  userEmail?: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpful: number;
  notHelpful: number;
  reports: number;
  status: "approved" | "pending" | "flagged" | "rejected" | "spam";
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
  repliesCount?: number;
  isFlagged?: boolean;
}

export interface ReviewFilters {
  search?: string;
  status?: Review["status"] | "all";
  minRating?: number;
  maxRating?: number;
  bookId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "rating" | "helpful" | "reports";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  hasReports?: boolean;
}

// ============================================
// Review Dialog Component
// ============================================

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  review: Review | null;
  onUpdate: (id: number, data: Partial<Review>) => Promise<void>;
  onModerate: (
    id: number,
    status: Review["status"],
    notes?: string
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  open,
  onClose,
  review,
  onModerate,
  onDelete,
  loading = false,
}) => {
  const [moderationNotes, setModerationNotes] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<Review["status"]>("approved");

  useEffect(() => {
    if (review) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setModerationNotes(review.moderationNotes || "");
      setSelectedStatus(review.status);
    }
  }, [review]);

  if (!review) return null;

  const handleModerate = () => {
    onModerate(review.id, selectedStatus, moderationNotes);
  };

  const getStatusColor = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "flagged":
        return "error";
      case "rejected":
        return "error";
      case "spam":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Review Details
        <Chip
          size="small"
          label={review.status}
          color={getStatusColor(review.status)}
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* User Info */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {review.userName}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Tooltip title="User ID">
                    <Chip
                      size="small"
                      label={`ID: ${review.userId}`}
                      variant="outlined"
                    />
                  </Tooltip>
                  <Tooltip title="Reports">
                    <Badge badgeContent={review.reports} color="error">
                      <FlagIcon fontSize="small" />
                    </Badge>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Book Info */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BookIcon />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {review.bookTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {review.bookAuthor}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Review Content */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rating
            </Typography>
            <Rating
              value={review.rating}
              readOnly
              size="large"
              sx={{ mb: 2 }}
            />

            {review.title && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Title
                </Typography>
                <Typography variant="body1" paragraph>
                  {review.title}
                </Typography>
              </>
            )}

            <Typography variant="subtitle2" gutterBottom>
              Review
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50", mb: 2 }}>
              <Typography variant="body1">{review.content}</Typography>
            </Paper>

            {/* Pros/Cons */}
            {(review.pros && review.pros.length > 0) ||
            (review.cons && review.cons.length > 0) ? (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {review.pros && review.pros.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="success.main"
                      gutterBottom
                    >
                      Pros
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {review.pros.map((pro, index) => (
                        <Typography key={index} variant="body2">
                          • {pro}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
                {review.cons && review.cons.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="error.main"
                      gutterBottom
                    >
                      Cons
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      {review.cons.map((con, index) => (
                        <Typography key={index} variant="body2">
                          • {con}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            ) : null}

            {/* Stats */}
            <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
              <Tooltip title="Helpful votes">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ThumbUpIcon fontSize="small" color="success" />
                  <Typography variant="body2">{review.helpful}</Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Reports">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FlagIcon fontSize="small" color="error" />
                  <Typography variant="body2">{review.reports}</Typography>
                </Box>
              </Tooltip>
            </Box>

            {/* Timestamps */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Created:{" "}
                {format(new Date(review.createdAt), "MMM dd, yyyy HH:mm")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Updated:{" "}
                {format(new Date(review.updatedAt), "MMM dd, yyyy HH:mm")}
              </Typography>
            </Box>
          </Grid>

          {/* Moderation Section */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Moderation
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Status"
                    onChange={(e: SelectChangeEvent) =>
                      setSelectedStatus(e.target.value as Review["status"])
                    }
                  >
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="flagged">Flagged</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="spam">Spam</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Moderation Notes"
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about this moderation decision..."
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleModerate}
          disabled={loading}
        >
          Apply Moderation
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => onDelete(review.id)}
          disabled={loading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Delete Confirmation Dialog
// ============================================

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reviewTitle: string;
  loading?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  reviewTitle,
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Review</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <Typography variant="body1">
          Are you sure you want to delete this review for "{reviewTitle}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

const AllReviewsPage: React.FC = () => {
  const theme = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedReviews] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ReviewFilters>({
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, setBulkDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    flagged: 0,
    rejected: 0,
    spam: 0,
    avgRating: 0,
    totalHelpful: 0,
    totalReports: 0,
  });

  // Fetch data
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock data
      const mockReviews: Review[] = Array.from({ length: 50 }).map((_, i) => ({
        id: i + 1,
        userId: Math.floor(Math.random() * 100) + 1,
        userName: `User ${Math.floor(Math.random() * 100) + 1}`,
        userAvatar: undefined,
        bookId: Math.floor(Math.random() * 50) + 1,
        bookTitle: `Book ${Math.floor(Math.random() * 50) + 1}`,
        bookAuthor: `Author ${Math.floor(Math.random() * 30) + 1}`,
        rating: Math.floor(Math.random() * 5) + 1,
        title: i % 3 === 0 ? `Review Title ${i + 1}` : undefined,
        content: `This is a sample review content for review ${
          i + 1
        }. It contains some text about the book.`,
        helpful: Math.floor(Math.random() * 50),
        notHelpful: Math.floor(Math.random() * 10),
        reports: Math.floor(Math.random() * 5),
        status: ["approved", "pending", "flagged", "rejected", "spam"][
          Math.floor(Math.random() * 5)
        ] as Review["status"],
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setReviews(mockReviews);
      setFilteredReviews(mockReviews);

      // Calculate stats
      const stats = {
        total: mockReviews.length,
        approved: mockReviews.filter((r) => r.status === "approved").length,
        pending: mockReviews.filter((r) => r.status === "pending").length,
        flagged: mockReviews.filter((r) => r.status === "flagged").length,
        rejected: mockReviews.filter((r) => r.status === "rejected").length,
        spam: mockReviews.filter((r) => r.status === "spam").length,
        avgRating:
          mockReviews.reduce((acc, r) => acc + r.rating, 0) /
          mockReviews.length,
        totalHelpful: mockReviews.reduce((acc, r) => acc + r.helpful, 0),
        totalReports: mockReviews.reduce((acc, r) => acc + r.reports, 0),
      };
      setStats(stats);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filter reviews when dependencies change
  useEffect(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.content.toLowerCase().includes(searchLower) ||
          r.userName.toLowerCase().includes(searchLower) ||
          r.bookTitle.toLowerCase().includes(searchLower) ||
          r.title?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Apply rating filter
    if (filters.minRating) {
      filtered = filtered.filter((r) => r.rating >= (filters.minRating || 0));
    }

    // Apply reports filter
    if (filters.hasReports) {
      filtered = filtered.filter((r) => r.reports > 0);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (filters.sortBy) {
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "rating":
            aValue = a.rating;
            bValue = b.rating;
            break;
          case "helpful":
            aValue = a.helpful;
            bValue = b.helpful;
            break;
          case "reports":
            aValue = a.reports;
            bValue = b.reports;
            break;
          default:
            return 0;
        }

        return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, filters]);

  const handleRefresh = () => {
    fetchReviews();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = (newFilters: Partial<ReviewFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    handleFilterClose();
  };

  const handleFilterClear = () => {
    setFilters({
      status: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });
    setSearchTerm("");
    handleFilterClose();
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    review: Review
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewReview = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleModerateReview = async (
    id: number,
    status: Review["status"],
    notes?: string
  ) => {
    try {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, moderationNotes: notes } : r
        )
      );
      showNotification(`Review marked as ${status}`, "success");
      setDialogOpen(false);
    } catch {
      showNotification("Failed to moderate review", "error");
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showNotification("Review deleted successfully", "success");
      setDeleteDialogOpen(false);
      setDialogOpen(false);
    } catch {
      showNotification("Failed to delete review", "error");
    }
  };

  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Pagination
  const paginatedReviews = filteredReviews.slice(
    page * limit,
    page * limit + limit
  );

  const getStatusColor = (status: Review["status"]) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "flagged":
        return "error";
      case "rejected":
        return "error";
      case "spam":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Review Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Moderate and manage all user reviews across the platform.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="error.main">
                {stats.flagged}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flagged
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                {stats.avgRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                {stats.totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search reviews, users, or books..."
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
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                label="Sort By"
                onChange={(e: SelectChangeEvent) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setFilters({
                    ...filters,
                    sortBy: sortBy as
                      | "createdAt"
                      | "rating"
                      | "helpful"
                      | "reports",
                    sortOrder: sortOrder as "asc" | "desc",
                  });
                }}
              >
                <MenuItem value="createdAt-desc">Newest First</MenuItem>
                <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                <MenuItem value="rating-desc">Highest Rating</MenuItem>
                <MenuItem value="rating-asc">Lowest Rating</MenuItem>
                <MenuItem value="helpful-desc">Most Helpful</MenuItem>
                <MenuItem value="reports-desc">Most Reported</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Items per page</InputLabel>
              <Select
                value={limit.toString()} // Convert number to string
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
                <MenuItem value={100}>100 per page</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {selectedReviews.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setBulkDialogOpen(true)}
                  >
                    Moderate ({selectedReviews.length})
                  </Button>
                </>
              )}
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filters">
                <IconButton onClick={handleFilterOpen}>
                  <Badge
                    badgeContent={filters.status !== "all" ? 1 : 0}
                    color="primary"
                  >
                    <FilterIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || "all"}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                handleFilterApply({
                  status: e.target.value as Review["status"] | "all",
                })
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="flagged">Flagged</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Min Rating</InputLabel>
            <Select
              value={filters.minRating?.toString() || ""}
              label="Min Rating"
              onChange={(e: SelectChangeEvent) =>
                handleFilterApply({
                  minRating: e.target.value as unknown as number,
                })
              }
            >
              <MenuItem value="">Any Rating</MenuItem>
              <MenuItem value={5}>5 Stars</MenuItem>
              <MenuItem value={4}>4+ Stars</MenuItem>
              <MenuItem value={3}>3+ Stars</MenuItem>
              <MenuItem value={2}>2+ Stars</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={filters.hasReports || false}
                onChange={(e) =>
                  handleFilterApply({ hasReports: e.target.checked })
                }
              />
            }
            label="Has reports only"
          />

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button size="small" onClick={handleFilterClear}>
              Clear
            </Button>
          </Box>
        </Stack>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: "100%", py: 4 }}>
          <LinearProgress />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            Loading reviews...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Reviews Table */}
      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Book</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell>Review</TableCell>
                  <TableCell align="center">Helpful</TableCell>
                  <TableCell align="center">Reports</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedReviews.map((review) => (
                  <TableRow
                    key={review.id}
                    hover
                    sx={{
                      bgcolor:
                        review.status === "flagged"
                          ? alpha(theme.palette.error.main, 0.04)
                          : "inherit",
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            {review.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {review.userId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {review.bookTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {review.bookAuthor}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        {review.title && (
                          <Typography variant="subtitle2" noWrap>
                            {review.title}
                          </Typography>
                        )}
                        <Typography variant="body2" noWrap>
                          {review.content}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Badge
                        badgeContent={review.helpful}
                        color="success"
                        max={999}
                      >
                        <ThumbUpIcon fontSize="small" color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <Badge
                        badgeContent={review.reports}
                        color="error"
                        max={999}
                      >
                        <FlagIcon fontSize="small" color="action" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={review.status}
                        color={getStatusColor(review.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={format(new Date(review.createdAt), "PPpp")}
                      >
                        <span>
                          {formatDistance(
                            new Date(review.createdAt),
                            new Date(),
                            { addSuffix: true }
                          )}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, review)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredReviews.length}
              rowsPerPage={limit}
              page={page}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewReview}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setDeleteDialogOpen(true);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}

      {/* Review Dialog */}
      <ReviewDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onUpdate={async () => {}}
        onModerate={handleModerateReview}
        onDelete={handleDeleteReview}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedReview(null);
        }}
        onConfirm={() =>
          selectedReview && handleDeleteReview(selectedReview.id)
        }
        reviewTitle={selectedReview?.bookTitle || ""}
        loading={loading}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

export default AllReviewsPage;
