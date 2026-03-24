import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Badge,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Skeleton,
  Zoom,
  Breadcrumbs,
  Link,
 
  ListItemText,
  ListItemIcon,
  Menu
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Comment as CommentIcon,
  Category as CategoryIcon,
  MenuBook as MenuBookIcon,
  Headphones as HeadphonesIcon,
  Computer as ComputerIcon,
  LibraryBooks as LibraryBooksIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// ============================================
// Types
// ============================================

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description: string;
  categoryId: number;
  category: string;
  publisher?: string;
  publishDate?: string;
  pages?: number;
  language: string;
  format: 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
  price?: number;
  coverImage?: string;
  status: 'published' | 'draft' | 'archived' | 'pending';
  reviewsCount: number;
  averageRating: number;
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  series?: string;
  seriesPosition?: number;
  awards?: string[];
  characters?: string[];
  settings?: string[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  userRating?: number;
  userReviews?: number;
  rating: number;
  title?: string;
  content: string;
  helpful: number;
  notHelpful: number;
  reports: number;
  status: 'approved' | 'pending' | 'flagged';
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies?: ReviewReply[];
  isLiked?: boolean;
  isHelpful?: boolean;
  isReported?: boolean;
}

export interface ReviewReply {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface SimilarBook {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  averageRating: number;
  reviewsCount: number;
  category: string;
}

export interface BookDetailsProps {
  book: Book;
  reviews: Review[];
  similarBooks: SimilarBook[];
  loading?: boolean;
  error?: string | null;
  isBookmarked?: boolean;
  isLiked?: boolean;
  userReview?: Review | null;
  onBookmark?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (book: Book) => void;
  onAddReview?: (review: Partial<Review>) => Promise<void>;
  onUpdateReview?: (id: number, review: Partial<Review>) => Promise<void>;
  onDeleteReview?: (id: number) => Promise<void>;
  onReportReview?: (id: number, reason: string) => Promise<void>;
  onHelpfulReview?: (id: number, helpful: boolean) => Promise<void>;
  onReplyToReview?: (reviewId: number, content: string) => Promise<void>;
  onLoadMoreReviews?: () => void;
  hasMoreReviews?: boolean;
  currentUserId?: number;
  userRole?: string;
  className?: string;
}

// ============================================
// Tab Panel Component
// ============================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`book-tabpanel-${index}`}
      aria-labelledby={`book-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================
// Format Icon Component
// ============================================

const FormatIcon: React.FC<{ format: Book['format'] }> = ({ format }) => {
  switch (format) {
    case 'paperback':
      return <MenuBookIcon />;
    case 'hardcover':
      return <LibraryBooksIcon />;
    case 'ebook':
      return <ComputerIcon />;
    case 'audiobook':
      return <HeadphonesIcon />;
    default:
      return null;
  }
};

// ============================================
// Share Dialog Component
// ============================================

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  book: Book;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ open, onClose, book }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/books/${book.id}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this book: ${book.title} by ${book.author}`)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#4267B2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25D366',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this book: ${book.title} by ${book.author} - ${shareUrl}`)}`
    },
    {
      name: 'Email',
      icon: <EmailIcon />,
      color: '#EA4335',
      url: `mailto:?subject=${encodeURIComponent(`Check out this book: ${book.title}`)}&body=${encodeURIComponent(`I thought you might be interested in this book:\n\n${book.title} by ${book.author}\n\n${shareUrl}`)}`
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share this book</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Share via
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {shareLinks.map((link) => (
              <IconButton
                key={link.name}
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: link.color,
                  color: 'white',
                  '&:hover': {
                    bgcolor: link.color,
                    opacity: 0.9
                  }
                }}
              >
                {link.icon}
              </IconButton>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Copy link
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={shareUrl}
              InputProps={{ readOnly: true }}
            />
            <CopyToClipboard text={shareUrl} onCopy={handleCopy}>
              <Button
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </CopyToClipboard>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Review Form Component
// ============================================

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: Partial<Review>) => Promise<void>;
  initialReview?: Review | null;
  loading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialReview,
  loading = false
}) => {
  const [rating, setRating] = useState<number | null>(initialReview?.rating || 0);
  const [title, setTitle] = useState(initialReview?.title || '');
  const [content, setContent] = useState(initialReview?.content || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!rating || rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!content.trim()) {
      newErrors.content = 'Please write a review';
    } else if (content.length < 10) {
      newErrors.content = 'Review must be at least 10 characters';
    } else if (content.length > 2000) {
      newErrors.content = 'Review must not exceed 2000 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        rating: rating!,
        title,
        content
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialReview ? 'Edit Review' : 'Write a Review'}
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

          {/* Review Title */}
          <TextField
            fullWidth
            label="Review Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          {/* Review Content */}
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
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Submitting...' : (initialReview ? 'Update' : 'Submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

const BookDetails: React.FC<BookDetailsProps> = ({
  book,
  reviews,
  similarBooks,
  loading = false,
  error = null,
  isBookmarked = false,
  isLiked = false,
  userReview = null,
  onBookmark,
  onLike,
  onShare,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onReportReview,
  onHelpfulReview,
  onReplyToReview,
  onLoadMoreReviews,
  hasMoreReviews = false,
  currentUserId,
  userRole,
  className
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyReviewId, setReplyReviewId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [imageError, setImageError] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    // Reset editing review when userReview changes
    if (userReview) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingReview(userReview);
    }
  }, [userReview]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(book.id);
      showNotification(
        isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        'success'
      );
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(book.id);
      showNotification(
        isLiked ? 'Removed like' : 'Liked this book',
        'success'
      );
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(book);
    }
    setShareDialogOpen(true);
  };

  const handleAddReview = () => {
    setEditingReview(null);
    setReviewFormOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewFormOpen(true);
  };

  const handleDeleteReview = async (id: number) => {
    if (onDeleteReview) {
      try {
        await onDeleteReview(id);
        showNotification('Review deleted successfully', 'success');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification('Failed to delete review', 'error');
      }
    }
  };

  const handleReportReview = (id: number) => {
    setReportReviewId(id);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async () => {
    if (reportReviewId && onReportReview) {
      try {
        await onReportReview(reportReviewId, reportReason);
        showNotification('Review reported successfully', 'success');
        setReportDialogOpen(false);
        setReportReason('');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification('Failed to report review', 'error');
      }
    }
  };

  const handleHelpfulReview = async (id: number, helpful: boolean) => {
    if (onHelpfulReview) {
      try {
        await onHelpfulReview(id, helpful);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification('Failed to mark review as helpful', 'error');
      }
    }
  };

  const handleReplyToReview = (id: number) => {
    setReplyReviewId(id);
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = async () => {
    if (replyReviewId && onReplyToReview) {
      try {
        await onReplyToReview(replyReviewId, replyContent);
        showNotification('Reply added successfully', 'success');
        setReplyDialogOpen(false);
        setReplyContent('');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification('Failed to add reply', 'error');
      }
    }
  };

  const handleReviewSubmit = async (reviewData: Partial<Review>) => {
    if (editingReview && onUpdateReview) {
      await onUpdateReview(editingReview.id, reviewData);
    } else if (onAddReview) {
      await onAddReview(reviewData);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const canModifyReview = (review: Review) => {
    return currentUserId === review.userId || userRole === 'Admin' || userRole === 'Moderator';
  };

  if (loading) {
    return <BookDetailsSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={className}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/books"
          color="inherit"
        >
          Books
        </Link>
        <Link
          component={RouterLink}
          to={`/categories/${book.categoryId}`}
          color="inherit"
        >
          {book.category}
        </Link>
        <Typography color="text.primary">{book.title}</Typography>
      </Breadcrumbs>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Cover Image */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Zoom in={true} timeout={500}>
            <Paper
              sx={{
                p: 2,
                position: 'sticky',
                top: 80,
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardMedia
                component="img"
                image={imageError ? '/images/book-placeholder.jpg' : (book.coverImage || '/images/book-placeholder.jpg')}
                alt={book.title}
                onError={handleImageError}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 400,
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 2
                }}
              />

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} justifyContent="center">
                <Tooltip title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}>
                  <IconButton
                    onClick={handleBookmark}
                    color={isBookmarked ? 'primary' : 'default'}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                  <IconButton
                    onClick={handleLike}
                    color={isLiked ? 'error' : 'default'}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Share">
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Zoom>
        </Grid>

        {/* Right Column - Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Title and Author */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              {book.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" color="text.secondary">
                by {book.author}
              </Typography>
              
              {book.series && (
                <Chip
                  label={`${book.series} ${book.seriesPosition ? `#${book.seriesPosition}` : ''}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Rating and Stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={book.averageRating} precision={0.5} readOnly size="large" />
                <Typography variant="h6" color="text.secondary">
                  {book.averageRating.toFixed(1)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title="Total Reviews">
                  <Badge badgeContent={book.reviewsCount} color="primary" max={9999}>
                    <CommentIcon color="action" />
                  </Badge>
                </Tooltip>
                <Tooltip title="Views">
                  <Badge badgeContent={book.views} color="info" max={9999}>
                    <VisibilityIcon color="action" />
                  </Badge>
                </Tooltip>
                <Tooltip title="Likes">
                  <Badge badgeContent={book.likes} color="error" max={9999}>
                    <FavoriteIcon color="action" />
                  </Badge>
                </Tooltip>
              </Box>
            </Box>

            {/* Format and Category */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip
                icon={<FormatIcon format={book.format} />}
                label={book.format}
                variant="outlined"
              />
              <Chip
                icon={<CategoryIcon />}
                label={book.category}
                variant="outlined"
              />
              {book.language && (
                <Chip label={book.language} variant="outlined" />
              )}
            </Stack>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {book.description}
            </Typography>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                {book.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Book Details Grid */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Book Details
            </Typography>
            <Grid container spacing={2}>
              {book.isbn && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ISBN
                  </Typography>
                  <Typography variant="body2">{book.isbn}</Typography>
                </Grid>
              )}
              {book.publisher && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Publisher
                  </Typography>
                  <Typography variant="body2">{book.publisher}</Typography>
                </Grid>
              )}
              {book.publishDate && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Publish Date
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(book.publishDate), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>
              )}
              {book.pages && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pages
                  </Typography>
                  <Typography variant="body2">{book.pages}</Typography>
                </Grid>
              )}
              {book.awards && book.awards.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Awards
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {book.awards.map((award) => (
                      <Chip key={award} label={award} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Tabs Section */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Reviews (${book.reviewsCount})`} />
              <Tab label="Similar Books" />
              <Tab label="Details" />
            </Tabs>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={0}>
              {/* Write Review Button */}
              {!userReview && onAddReview && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleAddReview}
                  sx={{ mb: 3 }}
                >
                  Write a Review
                </Button>
              )}

              {/* User's Review */}
              {userReview && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Your Review
                  </Typography>
                  <ReviewItem
                    review={userReview}
                    currentUserId={currentUserId}
                    userRole={userRole}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    onReport={handleReportReview}
                    onHelpful={handleHelpfulReview}
                    onReply={handleReplyToReview}
                    canModify={true}
                  />
                </Paper>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <Stack spacing={2}>
                  {reviews.map((review) => (
                    <ReviewItem
                      key={review.id}
                      review={review}
                      currentUserId={currentUserId}
                      userRole={userRole}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                      onReport={handleReportReview}
                      onHelpful={handleHelpfulReview}
                      onReply={handleReplyToReview}
                      canModify={canModifyReview(review)}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No reviews yet. Be the first to review this book!
                </Typography>
              )}

              {/* Load More */}
              {hasMoreReviews && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button onClick={onLoadMoreReviews}>Load More Reviews</Button>
                </Box>
              )}
            </TabPanel>

            {/* Similar Books Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {similarBooks.map((book) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <CardMedia
                        component="img"
                        image={book.coverImage || '/images/book-placeholder.jpg'}
                        alt={book.title}
                        sx={{ height: 200, objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          by {book.author}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Rating value={book.averageRating} precision={0.5} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            ({book.reviewsCount})
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Details Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="body1" paragraph>
                Additional details about the book will appear here.
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        book={book}
      />

      <ReviewForm
        open={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setEditingReview(null);
        }}
        onSubmit={handleReviewSubmit}
        initialReview={editingReview}
        loading={loading}
      />

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Review</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reportReason}
              label="Reason"
              onChange={(e) => setReportReason(e.target.value)}
            >
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate content</MenuItem>
              <MenuItem value="offensive">Offensive language</MenuItem>
              <MenuItem value="copyright">Copyright violation</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained" color="error">
            Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)}>
        <DialogTitle>Reply to Review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReply} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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

// ============================================
// Review Component
// ============================================

interface ReviewItemProps {
  review: Review;
  currentUserId?: number;
  userRole?: string;
  onEdit?: (review: Review) => void;
  onDelete?: (id: number) => void;
  onReport?: (id: number) => void;
  onHelpful?: (id: number, helpful: boolean) => void;
  onReply?: (id: number) => void;
  canModify?: boolean;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onEdit,
  onDelete,
  onReport,
  onHelpful,
  onReply,
  canModify = false
}) => {
  const [helpful, setHelpful] = useState(review.isHelpful || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [showReplies, setShowReplies] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleHelpfulClick = () => {
    if (onHelpful) {
      onHelpful(review.id, !helpful);
      setHelpful(!helpful);
      setHelpfulCount(prev => helpful ? prev - 1 : prev + 1);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar src={review.userAvatar} sx={{ width: 48, height: 48 }}>
          {review.userName.charAt(0)}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {review.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.userReviews} reviews
            </Typography>
            <Rating value={review.rating} readOnly size="small" />
          </Box>

          {review.title && (
            <Typography variant="subtitle2" gutterBottom>
              {review.title}
            </Typography>
          )}

          <Typography variant="body2" paragraph>
            {review.content}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
            </Typography>

            <Button
              size="small"
              startIcon={<ThumbUpIcon />}
              onClick={handleHelpfulClick}
              color={helpful ? 'primary' : 'inherit'}
            >
              Helpful ({helpfulCount})
            </Button>

            {onReply && (
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => onReply(review.id)}
              >
                Reply
              </Button>
            )}

            {review.replies && review.replies.length > 0 && (
              <Button
                size="small"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide' : 'Show'} {review.replies.length} replies
              </Button>
            )}

            <Box sx={{ ml: 'auto' }}>
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Replies */}
          {showReplies && review.replies && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
              {review.replies.map((reply) => (
                <Box key={reply.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Avatar src={reply.userAvatar} sx={{ width: 32, height: 32 }}>
                    {reply.userName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {reply.userName}
                    </Typography>
                    <Typography variant="body2">
                      {reply.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistance(new Date(reply.createdAt), new Date(), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {canModify && onEdit && (
          <MenuItem onClick={() => { onEdit(review); handleMenuClose(); }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        {canModify && onDelete && (
          <MenuItem onClick={() => { onDelete(review.id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
        {onReport && !canModify && (
          <MenuItem onClick={() => { onReport(review.id); handleMenuClose(); }}>
            <ListItemIcon>
              <FlagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

// ============================================
// Skeleton Loader
// ============================================

const BookDetailsSkeleton: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rounded" height={400} />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="text" height={60} width="80%" />
          <Skeleton variant="text" height={30} width="40%" />
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <Skeleton variant="rounded" width={100} height={30} />
            <Skeleton variant="rounded" width={100} height={30} />
          </Box>
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} width="60%" />
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;