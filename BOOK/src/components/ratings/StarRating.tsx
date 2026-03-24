import React, { useState } from 'react';
import {
  Box,
  Rating,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface StarRatingProps {
  value: number;
  bookId?: number;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  showReviewCount?: boolean;
  reviewCount?: number;
  userRating?: number;
  onChange?: (value: number) => void;
  onRatingSubmit?: () => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  bookId,
  readOnly = false,
  size = 'medium',
  showValue = true,
  showReviewCount = false,
  reviewCount = 0,
  userRating = 0,
  onChange,
  onRatingSubmit
}) => {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState<number | null>(userRating || value);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRatingClick = (newValue: number | null) => {
    if (readOnly) return;
    
    if (!isAuthenticated) {
      setError('Please log in to rate books');
      return;
    }
    
    if (!bookId) {
      setError('Cannot submit rating without book ID');
      return;
    }
    
    if (newValue === rating) {
      // If clicking the same rating, open dialog to edit
      if (userRating > 0) {
        setDialogOpen(true);
      }
    } else {
      setRating(newValue);
      if (newValue && newValue > 0) {
        setDialogOpen(true);
      }
    }
    
    if (onChange && newValue) {
      onChange(newValue);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || !bookId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const reviewData = {
        bookId,
        rating,
        title: reviewTitle,
        comment: reviewComment.trim()
      };
      
      if (userRating > 0) {
        // Update existing review
        await api.put(`/books/${bookId}/review`, reviewData);
      } else {
        // Create new review
        await api.post('/books/review', reviewData);
      }
      
      setSuccess(true);
      setDialogOpen(false);
      setReviewTitle('');
      setReviewComment('');
      
      if (onRatingSubmit) {
        onRatingSubmit();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!bookId) return;
    
    setLoading(true);
    
    try {
      await api.delete(`/books/${bookId}/review`);
      setRating(null);
      setSuccess(true);
      setDialogOpen(false);
      
      if (onRatingSubmit) {
        onRatingSubmit();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '1rem' };
      case 'large':
        return { fontSize: '2rem' };
      default:
        return { fontSize: '1.5rem' };
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating
            value={rating || value}
            precision={0.5}
            readOnly={readOnly}
            size={size}
            icon={<StarIcon sx={getStarSize()} />}
            emptyIcon={<StarBorderIcon sx={getStarSize()} />}
            onChange={(_, newValue) => handleRatingClick(newValue)}
          />
          {showValue && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({(rating || value).toFixed(1)})
            </Typography>
          )}
        </Box>
        
        {showReviewCount && reviewCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            • {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </Typography>
        )}
        
        {userRating > 0 && !readOnly && (
          <Tooltip title="You've rated this book">
            <Chip
              label={`Your rating: ${userRating} ★`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Review Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userRating > 0 ? 'Edit Your Review' : 'Write a Review'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="legend" gutterBottom fontWeight={500}>
              Your Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Click to change your rating
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Review Title (Optional)"
            value={reviewTitle}
            onChange={(e) => setReviewTitle(e.target.value)}
            margin="normal"
            placeholder="Summarize your experience"
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Your Review"
            multiline
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            margin="normal"
            placeholder="What did you think about this book? Share your thoughts..."
            required
            disabled={loading}
            helperText={!reviewComment.trim() && rating ? "Please write your review" : ""}
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {userRating > 0 && (
            <Button
              onClick={handleDeleteReview}
              color="error"
              disabled={loading}
            >
              Delete Review
            </Button>
          )}
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={loading || !rating || !reviewComment.trim()}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Submitting...' : userRating > 0 ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccess(false)}>
          {userRating > 0 ? 'Review updated successfully!' : 'Review submitted successfully!'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StarRating;