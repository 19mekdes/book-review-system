// C:\Users\PC_1\OneDrive\Desktop\Book Review\BOOK\src\pages\public\BookDetailPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Divider,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useTheme,
  Skeleton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ============================================
// Types
// ============================================

interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  category: string;
  coverImage?: string;
  cover_image?: string;  // ✅ Added for consistency
  publishedDate?: string;
  publisher?: string;
  isbn?: string;
  pageCount?: number;
  language?: string;
  averageRating: number;
  reviewCount: number;
  reviews?: Review[];
  isFavorite?: boolean;
  isBookmarked?: boolean;
}

// ============================================
// Cover Image Upload Component
// ============================================

interface CoverUploadProps {
  bookId: number;
  currentCover?: string;
  onCoverUpdate: (coverUrl: string) => void;
  isAdmin: boolean;
}

const CoverUpload: React.FC<CoverUploadProps> = ({ bookId, currentCover, onCoverUpdate, isAdmin }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to Base64 and compress
    const compressAndUpload = async () => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          
          img.onload = () => {
            // Compress image
            let width = img.width;
            let height = img.height;
            const maxDimension = 400;
            
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedBase64);
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
      });
    };

    setUploading(true);
    setUploadError(null);

    try {
      const compressedImage = await compressAndUpload();
      
      // Update book with compressed image
      const response = await api.put(`/books/${bookId}`, {
        cover_image: compressedImage
      });
      
      // Get the updated cover image URL from response
      const newCoverUrl = response.data.data?.cover_image || response.data.cover_image;
      onCoverUpdate(newCoverUrl);
      setUploadError(null);
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setUploadError(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await api.put(`/books/${bookId}`, {
        cover_image: null
      });
      onCoverUpdate('');
    } catch (err: unknown) {
      console.error('Remove error:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setUploadError(error.response?.data?.error || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          size="small"
        >
          {uploading ? <CircularProgress size={20} /> : 'Upload Cover'}
          <input
            type="file"
            hidden
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
          />
        </Button>
        
        {currentCover && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleRemove}
            disabled={uploading}
            size="small"
          >
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ============================================
// Helper Functions
// ============================================

const formatDate = (dateString: string | undefined, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!dateString) return 'Date not available';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Fallback image
const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'400\' viewBox=\'0 0 300 400\'%3E%3Crect width=\'300\' height=\'400\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'16\' fill=\'%23999\'%3ENo Cover%3C/text%3E%3C/svg%3E';

// ============================================
// Main Component
// ============================================

const BookDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [imageError, setImageError] = useState(false);

  // Check if user is admin
  const isAdmin = user?.roleId === 1 || user?.role === 'admin';

  useEffect(() => {
    fetchBookDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/books/${id}`);
      
      // Handle different response structures
      const bookData = response.data.data || response.data.book || response.data;

      // ✅ FIXED: Normalize both cover_image and coverImage fields
      const normalizedBook = {
        ...bookData,
        coverImage: bookData.cover_image || bookData.coverImage || '',
        cover_image: bookData.cover_image || bookData.coverImage || '',
        reviews: (bookData.reviews ?? []).map((r: {
          userId?: number; user_id?: number; userName?: string; user_name?: string;
          userAvatar?: string; user_avatar?: string; createdAt?: string; created_at?: string;
          id: number; rating: number; comment: string; likes?: number; isLiked?: boolean;
        }) => ({
          ...r,
          userId: r.userId ?? r.user_id,
          userName: r.userName ?? r.user_name ?? 'Anonymous',
          userAvatar: r.userAvatar ?? r.user_avatar ?? null,
          createdAt: r.createdAt ?? r.created_at,
        })),
      } as Book;

      console.log('📖 Book data loaded:', {
        id: normalizedBook.id,
        title: normalizedBook.title,
        coverImage: normalizedBook.coverImage,
        cover_image: normalizedBook.cover_image
      });
      
      setBook(normalizedBook);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching book:', err);
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        setError('Book not found');
      } else {
        setError('Failed to load book details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  
  const getImageUrl = (): string => {
    // Check both coverImage and cover_image fields
    const coverImageUrl = book?.coverImage || book?.cover_image;
    
    if (!coverImageUrl || imageError) {
      return fallbackImage;
    }
    
    // If it's already a full URL (http:// or https:// or data:image), use it directly
    if (coverImageUrl.startsWith('http://') || 
        coverImageUrl.startsWith('https://') || 
        coverImageUrl.startsWith('data:image')) {
      return coverImageUrl;
    }
    
    // If it's a relative path, prepend the API base URL
    // For local development, use the backend URL
    return `http://localhost:5000${coverImageUrl.startsWith('/') ? coverImageUrl : `/${coverImageUrl}`}`;
  };

  const handleImageError = () => {
    console.log('Image failed to load:', book?.coverImage || book?.cover_image);
    setImageError(true);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCoverUpdate = (newCoverUrl: string) => {
    setBook(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        coverImage: newCoverUrl,
        cover_image: newCoverUrl
      };
    });
    setImageError(false); // Reset error state for new image
    setSnackbar({
      open: true,
      message: 'Cover image updated successfully',
      severity: 'success'
    });
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to add to favorites',
        severity: 'error'
      });
      return;
    }

    try {
      if (book?.isFavorite) {
        await api.delete(`/books/${id}/favorite`);
        setBook(prev => prev ? { ...prev, isFavorite: false } : null);
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'success'
        });
      } else {
        await api.post(`/books/${id}/favorite`);
        setBook(prev => prev ? { ...prev, isFavorite: true } : null);
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
    } catch (err: unknown) {
      console.error('Error toggling favorite:', err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      
      if (error.response?.status === 404) {
        setBook(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        setSnackbar({
          open: true,
          message: 'Favorite toggled (demo mode)',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to update favorite',
          severity: 'error'
        });
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to bookmark',
        severity: 'error'
      });
      return;
    }

    try {
      if (book?.isBookmarked) {
        await api.delete(`/books/${id}/bookmark`);
        setBook(prev => prev ? { ...prev, isBookmarked: false } : null);
        setSnackbar({
          open: true,
          message: 'Bookmark removed',
          severity: 'success'
        });
      } else {
        await api.post(`/books/${id}/bookmark`);
        setBook(prev => prev ? { ...prev, isBookmarked: true } : null);
        setSnackbar({
          open: true,
          message: 'Bookmark added',
          severity: 'success'
        });
      }
    } catch (err: unknown) {
      console.error('Error toggling bookmark:', err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      
      if (error.response?.status === 404) {
        setBook(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
        setSnackbar({
          open: true,
          message: 'Bookmark toggled (demo mode)',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to update bookmark',
          severity: 'error'
        });
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard!',
      severity: 'success'
    });
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to write a review',
        severity: 'error'
      });
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setSnackbar({
        open: true,
        message: 'Please select a rating between 1 and 5 stars',
        severity: 'error'
      });
      return;
    }

    if (!reviewText.trim()) {
      setSnackbar({
        open: true,
        message: 'Please write a review',
        severity: 'error'
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const reviewData = {
        bookId: Number(id),
        rating: Number(reviewRating),
        comment: reviewText.trim()
      };

      const response = await api.post('/reviews', reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const rawReview = response.data.data || response.data;

      const reviewWithUser = {
        id: rawReview.id,
        userId: rawReview.user_id ?? user?.id,
        userName: user?.name || rawReview.user_name || 'You',
        userAvatar: user?.avatar || rawReview.user_avatar,
        rating: rawReview.rating,
        comment: rawReview.comment,
        createdAt: rawReview.createdAt ?? rawReview.created_at,
        likes: rawReview.likes ?? 0,
        isLiked: rawReview.isLiked ?? false
      } as Review;

      setBook(prev => {
        if (!prev) return null;
        const updatedReviews = [reviewWithUser, ...(prev.reviews || [])];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = totalRating / updatedReviews.length;

        return {
          ...prev,
          reviews: updatedReviews,
          averageRating: newAvgRating,
          reviewCount: updatedReviews.length
        };
      });

      setReviewText('');
      setReviewRating(5);
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
    } catch (err: unknown) {
      console.error('Error submitting review:', err);
      const error = err as { response?: { status?: number; data?: { message?: string; error?: string } } };
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to submit review';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 400) {
        if (error.response?.data?.message?.includes('already reviewed')) {
          errorMessage = 'You have already reviewed this book. You can only review a book once.';
        } else {
          errorMessage = error.response?.data?.message || 'Invalid review data';
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setBook(prev => {
        if (!prev) return null;
        const updatedReviews = prev.reviews?.filter(r => r.id !== reviewId) || [];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

        return {
          ...prev,
          reviews: updatedReviews,
          averageRating: newAvgRating,
          reviewCount: updatedReviews.length
        };
      });

      setSnackbar({
        open: true,
        message: 'Review deleted successfully',
        severity: 'success'
      });
      
    } catch (err: unknown) {
      console.error('Error deleting review:', err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setSnackbar({
          open: true,
          message: 'Your session has expired. Please login again.',
          severity: 'error'
        });
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to delete this review',
          severity: 'error'
        });
      } else if (error.response?.status === 404) {
        setSnackbar({
          open: true,
          message: 'Review not found. It may have been already deleted.',
          severity: 'error'
        });
        fetchBookDetails();
      } else {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete review',
          severity: 'error'
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="text" height={50} />
            <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleGoBack}>
              Go Back
            </Button>
          }
        >
          {error || 'Book not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={RouterLink} to="/" color="inherit" underline="hover">
          Home
        </MuiLink>
        <MuiLink component={RouterLink} to="/books" color="inherit" underline="hover">
          Books
        </MuiLink>
        <Typography color="text.primary">{book.title}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
        <ArrowBackIcon /> <Typography sx={{ ml: 1 }}>Back</Typography>
      </IconButton>

      <Grid container spacing={4}>
        {/* Book Cover Section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, position: 'relative' }}>
            <Badge
              overlap="rectangular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isAdmin && (
                  <Tooltip title="Upload new cover">
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      <PhotoCameraIcon />
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Compress and upload
                          const compressAndUpload = async () => {
                            return new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.readAsDataURL(file);
                              
                              reader.onload = (event) => {
                                const img = new Image();
                                img.src = event.target?.result as string;
                                
                                img.onload = () => {
                                  let width = img.width;
                                  let height = img.height;
                                  const maxDimension = 400;
                                  
                                  if (width > maxDimension || height > maxDimension) {
                                    if (width > height) {
                                      height = (height * maxDimension) / width;
                                      width = maxDimension;
                                    } else {
                                      width = (width * maxDimension) / height;
                                      height = maxDimension;
                                    }
                                  }
                                  
                                  const canvas = document.createElement('canvas');
                                  canvas.width = width;
                                  canvas.height = height;
                                  
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  
                                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                                  resolve(compressedBase64);
                                };
                                
                                img.onerror = () => reject(new Error('Failed to load image'));
                              };
                              
                              reader.onerror = () => reject(new Error('Failed to read file'));
                            });
                          };

                          try {
                            const compressedImage = await compressAndUpload();
                            const response = await api.put(`/books/${id}`, {
                              cover_image: compressedImage
                            });
                            const newCoverUrl = response.data.data?.cover_image || response.data.cover_image;
                            handleCoverUpdate(newCoverUrl);
                          } catch (err) {
                            console.error('Upload failed:', err);
                          }
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <img
                src={getImageUrl()}
                alt={book.title}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  minHeight: '300px',
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
                onError={handleImageError}
              />
            </Badge>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <IconButton 
                onClick={handleToggleFavorite}
                color={book.isFavorite ? 'error' : 'default'}
              >
                {book.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton 
                onClick={handleToggleBookmark}
                color={book.isBookmarked ? 'primary' : 'default'}
              >
                {book.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={handleShare}>
                <ShareIcon />
              </IconButton>
            </Box>

            {/* Admin Upload Controls */}
            <CoverUpload
              bookId={book.id}
              currentCover={book.coverImage || book.cover_image}
              onCoverUpdate={handleCoverUpdate}
              isAdmin={isAdmin}
            />

            {/* ISBN if available */}
            {book.isbn && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                ISBN: {book.isbn}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Book Details Section - Keep the rest of your code unchanged */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
              {book.title}
            </Typography>
            
            <Typography variant="h5" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Rating value={book.averageRating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({book.reviewCount || 0} {book.reviewCount === 1 ? 'review' : 'reviews'})
              </Typography>
              <Chip label={book.category || 'Uncategorized'} color="primary" size="small" />
            </Box>

            {/* Book Metadata */}
            {(book.publishedDate || book.publisher || book.pageCount || book.language) && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    {book.publishedDate && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Published</Typography>
                        <Typography variant="body2">
                          {formatDate(book.publishedDate, 'yyyy')}
                        </Typography>
                      </Grid>
                    )}
                    {book.publisher && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Publisher</Typography>
                        <Typography variant="body2">{book.publisher}</Typography>
                      </Grid>
                    )}
                    {book.pageCount && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Pages</Typography>
                        <Typography variant="body2">{book.pageCount}</Typography>
                      </Grid>
                    )}
                    {book.language && (
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Language</Typography>
                        <Typography variant="body2">{book.language}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {book.description || 'No description available.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Reviews Section */}
            <Typography variant="h5" gutterBottom>
              Reviews
            </Typography>

            {/* Add Review Form */}
            {isAuthenticated ? (
              <Paper sx={{ p: 3, mb: 3, bgcolor: theme.palette.grey[50] }}>
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Write a Review
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Rating
                    value={reviewRating}
                    onChange={(_, newValue) => setReviewRating(newValue)}
                    size="large"
                  />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Share your thoughts about this book..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
              </Paper>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Please <MuiLink component={RouterLink} to="/login" underline="hover">login</MuiLink> to write a review.
              </Alert>
            )}

            {/* Existing Reviews */}
            {book.reviews && book.reviews.length > 0 ? (
              <List>
                {book.reviews.map((review) => (
                  <ListItem
                    key={review.id}
                    alignItems="flex-start"
                    secondaryAction={
                      user?.id === review.userId && (
                        <IconButton 
                          edge="end" 
                          onClick={() => {
                            setReviewToDelete(review.id);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                    sx={{ 
                      bgcolor: 'background.paper',
                      mb: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={review.userAvatar}>
                        {review.userName?.[0] || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" component="span">{review.userName}</Typography>
                          <Rating value={review.rating} size="small" readOnly />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }} component="span">
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span" display="block">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No reviews yet. Be the first to review this book!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Review</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this review? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => reviewToDelete && handleDeleteReview(reviewToDelete)} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookDetailPage;