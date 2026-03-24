import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Rating,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  Fade
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types
export interface Book {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  description?: string;
  averageRating: number;
  reviewsCount: number;
  publishDate?: string;
  category?: string;
  pages?: number;
  language?: string;
  format?: string;
  status?: 'published' | 'draft' | 'archived' | 'pending';
}

export interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'featured';
  showRating?: boolean;
  showReviews?: boolean;
  showCategory?: boolean;
  showPublishDate?: boolean;
  showActions?: boolean;
  onBookClick?: (book: Book) => void;
  onBookmark?: (book: Book) => void;
  onShare?: (book: Book) => void;
  onPreview?: (book: Book) => void;
  onRead?: (book: Book) => void;
  onLike?: (book: Book) => void;
  isBookmarked?: boolean;
  isLiked?: boolean;
  loading?: boolean;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'default',
  showRating = true,
  showReviews = true,
  showCategory = true,
  showPublishDate = true,
  showActions = true,
  onBookClick,
  onBookmark,
  onShare,
  onPreview,
  onRead,
  onLike,
  isBookmarked = false,
  isLiked = false,
  loading = false,
  className
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (onBookmark) {
      onBookmark(book);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onLike) {
      onLike(book);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(book);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
    if (onPreview) {
      onPreview(book);
    }
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRead) {
      onRead(book);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          display: 'flex',
          height: 140,
          '& .MuiCardMedia-root': {
            width: 100,
            height: 140
          }
        };
      case 'featured':
        return {
          position: 'relative',
          '& .MuiCardMedia-root': {
            height: 300
          },
          '& .MuiCardContent-root': {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            color: 'white'
          }
        };
      default:
        return {
          '& .MuiCardMedia-root': {
            height: 200
          }
        };
    }
  };

  const getCoverImage = () => {
    if (book.coverImage) {
      return book.coverImage;
    }
    return `https://via.placeholder.com/300x200?text=${encodeURIComponent(book.title)}`;
  };

  return (
    <>
      <Card
        className={className}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          cursor: onBookClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: onBookClick ? 'translateY(-8px)' : 'none',
            boxShadow: theme.shadows[8],
            '& .card-actions': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          ...getVariantStyles()
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
      >
        {/* Cover Image */}
        <CardMedia
          component="img"
          image={getCoverImage()}
          alt={book.title}
          sx={{
            objectFit: 'cover',
            ...(variant === 'featured' && { height: 300 })
          }}
        />

        {/* Status Badge */}
        {book.status && book.status !== 'published' && (
          <Chip
            label={book.status}
            size="small"
            color={book.status === 'draft' ? 'warning' : 'error'}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              textTransform: 'capitalize'
            }}
          />
        )}

        {/* Card Content */}
        <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
          {/* Category Chip */}
          {showCategory && book.category && (
            <Chip
              label={book.category}
              size="small"
              variant="outlined"
              sx={{
                mb: 1,
                fontSize: '0.75rem'
              }}
            />
          )}

          {/* Title */}
          <Typography
            variant={variant === 'featured' ? 'h5' : 'h6'}
            component="h2"
            fontWeight={600}
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {book.title}
          </Typography>

          {/* Author */}
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            by {book.author}
          </Typography>

          {/* Rating & Reviews */}
          {(showRating || showReviews) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {showRating && (
                <Rating
                  value={book.averageRating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
              )}
              {showReviews && (
                <Typography variant="caption" color="text.secondary">
                  ({book.reviewsCount} {book.reviewsCount === 1 ? 'review' : 'reviews'})
                </Typography>
              )}
            </Box>
          )}

          {/* Publish Date */}
          {showPublishDate && book.publishDate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              Published: {format(new Date(book.publishDate), 'MMM dd, yyyy')}
            </Typography>
          )}

          {/* Description (for default variant) */}
          {variant === 'default' && book.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {book.description}
            </Typography>
          )}
        </CardContent>

        {/* Card Actions */}
        {showActions && (
          <CardActions
            className="card-actions"
            sx={{
              p: 2,
              pt: 0,
              justifyContent: 'space-between',
              opacity: variant === 'featured' ? 1 : hovered ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Preview">
                <IconButton
                  size="small"
                  onClick={handlePreviewClick}
                  disabled={loading}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Read">
                <IconButton
                  size="small"
                  onClick={handleReadClick}
                  disabled={loading}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={liked ? 'Unlike' : 'Like'}>
                <IconButton
                  size="small"
                  onClick={handleLikeClick}
                  disabled={loading}
                  color={liked ? 'error' : 'default'}
                >
                  {liked ? (
                    <FavoriteIcon fontSize="small" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}>
                <IconButton
                  size="small"
                  onClick={handleBookmarkClick}
                  disabled={loading}
                  color={bookmarked ? 'primary' : 'default'}
                >
                  {bookmarked ? (
                    <BookmarkIcon fontSize="small" />
                  ) : (
                    <BookmarkBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Share">
                <IconButton
                  size="small"
                  onClick={handleShareClick}
                  disabled={loading}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          {book.title}
          <Typography variant="subtitle2" color="text.secondary">
            by {book.author}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {book.coverImage && (
              <Box
                component="img"
                src={book.coverImage}
                alt={book.title}
                sx={{
                  width: 200,
                  height: 280,
                  objectFit: 'cover',
                  borderRadius: 1
                }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" paragraph>
                {book.description || 'No description available.'}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Details
                </Typography>
                <Typography variant="body2">
                  <strong>Author:</strong> {book.author}
                </Typography>
                {book.publishDate && (
                  <Typography variant="body2">
                    <strong>Published:</strong> {format(new Date(book.publishDate), 'MMMM dd, yyyy')}
                  </Typography>
                )}
                {book.pages && (
                  <Typography variant="body2">
                    <strong>Pages:</strong> {book.pages}
                  </Typography>
                )}
                {book.language && (
                  <Typography variant="body2">
                    <strong>Language:</strong> {book.language}
                  </Typography>
                )}
                {book.format && (
                  <Typography variant="body2">
                    <strong>Format:</strong> {book.format}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Rating value={book.averageRating} precision={0.1} readOnly />
                  <Typography variant="body2">
                    ({book.reviewsCount} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenDialog(false);
              if (onRead) onRead(book);
            }}
          >
            Start Reading
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookCard;