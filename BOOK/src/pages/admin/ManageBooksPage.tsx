// pages/admin/ManageBooksPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  Rating,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CloudUpload as CloudUploadIcon,
  RateReview as RateReviewIcon
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ============================================
// Types
// ============================================

export type BookLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Russian' | 'Chinese' | 'Japanese' | 'Korean';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  description: string;
  categoryId: number;
  category_name?: string;
  publisher?: string;
  publish_date?: string;
  pages?: number;
  language: BookLanguage;
  format: 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
  price?: number;
  cover_image?: string;
  status: 'published' | 'draft' | 'archived' | 'pending';
  reviews_count?: number;
  average_rating?: number;
  views?: number;
  likes?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  is_featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  category?: string;
  slug?: string;
  description?: string;
  books_count?: number;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Image Compression Helper Function
// ============================================

const compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size first (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Image size must be less than 5MB. Please compress your image.'));
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Please upload JPEG, PNG, or WEBP image'));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions (max 400px for cover image)
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
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 80% quality (good balance of quality and size)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // Check compressed size (warning if > 500KB)
        const compressedSize = Math.ceil(compressedBase64.length * 0.75);
        if (compressedSize > 500 * 1024) {
          console.warn(`⚠️ Compressed image size: ${(compressedSize / 1024).toFixed(1)}KB`);
        } else {
          console.log(`✅ Image compressed: ${(compressedSize / 1024).toFixed(1)}KB`);
        }
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};


interface BookFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  book?: Book | null;
  categories: Category[];
}

const BookFormDialog: React.FC<BookFormProps> = ({
  open,
  onClose,
  onSave,
  book,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category_id: '',
    publisher: '',
    publish_date: '',
    pages: '',
    language: 'English' as BookLanguage,
    format: 'paperback' as Book['format'],
    price: '',
    cover_image: '',
    status: 'draft' as Book['status'],
    is_featured: false,
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        category_id: book.categoryId?.toString() || '',
        publisher: book.publisher || '',
        publish_date: book.publish_date ? book.publish_date.split('T')[0] : '',
        pages: book.pages?.toString() || '',
        language: book.language || 'English',
        format: book.format || 'paperback',
        price: book.price?.toString() || '',
        cover_image: book.cover_image || '',
        status: book.status || 'draft',
        is_featured: book.is_featured || false,
        tags: book.tags || []
      });
      setPreviewImage(book.cover_image || '');
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        category_id: '',
        publisher: '',
        publish_date: '',
        pages: '',
        language: 'English',
        format: 'paperback',
        price: '',
        cover_image: '',
        status: 'draft',
        is_featured: false,
        tags: []
      });
      setPreviewImage('');
    }
    setErrors({});
  }, [book]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_featured: e.target.checked }));
  };

  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Clear previous errors
    setErrors(prev => ({ ...prev, cover_image: '' }));
    setImageProcessing(true);
    
    try {
      // Compress and resize image
      const compressedImage = await compressAndResizeImage(file);
      setPreviewImage(compressedImage);
      setFormData(prev => ({ ...prev, cover_image: compressedImage }));
      console.log(' Image processed successfully');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Image processing error:', error);
      setErrors(prev => ({ 
        ...prev, 
        cover_image: error.message || 'Failed to process image' 
      }));
    } finally {
      setImageProcessing(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cover_image: value }));
    setPreviewImage(value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.isbn && !/^(?:\d{10}|\d{13})$/.test(formData.isbn.replace(/-/g, ''))) {
      newErrors.isbn = 'Invalid ISBN format (10 or 13 digits)';
    }
    if (formData.pages && (parseInt(formData.pages) < 1 || parseInt(formData.pages) > 10000)) {
      newErrors.pages = 'Pages must be between 1 and 10000';
    }
    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (book) {
        const updateData = {
          title: formData.title.trim(),
          author: formData.author.trim(),
          description: formData.description.trim(),
          categoryId: parseInt(formData.category_id),
          isbn: formData.isbn || null,
          publisher: formData.publisher || null,
          publishDate: formData.publish_date || null,
          pages: formData.pages ? parseInt(formData.pages) : null,
          language: formData.language,
          format: formData.format,
          price: formData.price ? Math.round(parseFloat(formData.price) * 100) : null,
          coverImage: formData.cover_image || null,
          cover_image: formData.cover_image || null,
          status: formData.status,
          isFeatured: formData.is_featured,
          tags: formData.tags
        };
        await api.put(`/books/${book.id}`, updateData);
      } else {
        const createData = {
          title: formData.title.trim(),
          author: formData.author.trim(),
          description: formData.description.trim(),
          categoryId: parseInt(formData.category_id),
          cover_image: formData.cover_image || undefined
        };
        
        console.log('📝 Creating book with data:', {
          title: createData.title,
          author: createData.author,
          categoryId: createData.categoryId,
          hasCoverImage: !!createData.cover_image,
          imageSize: createData.cover_image ? `${Math.ceil(createData.cover_image.length * 0.75 / 1024)}KB` : 'none'
        });
        await api.post('/books', createData);
      }
      
      onSave();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Error saving book:', error);
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to save book';
      setErrors({ 
        submit: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box component="span" sx={{ typography: 'h6' }}>
          {book ? 'Edit Book' : 'Add New Book'}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Box component="form" id="book-form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Form fields */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Author *"
                name="author"
                value={formData.author}
                onChange={handleChange}
                error={!!errors.author}
                helperText={errors.author}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.category_id} required>
                <InputLabel id="category-select-label">Category *</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="category_id"
                  value={formData.category_id}
                  label="Category *"
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name || cat.category || 'Unnamed Category'} ({cat.books_count || 0} books)
                    </MenuItem>
                  ))}
                </Select>
                {errors.category_id && (
                  <FormHelperText>{errors.category_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={4}
                required
              />
            </Grid>

            {/* Additional fields */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Additional Details (Optional)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                These fields can be updated after creating the book
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                error={!!errors.isbn}
                helperText={errors.isbn || '10 or 13 digits'}
                placeholder="978-3-16-148410-0"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Publication Date"
                name="publish_date"
                type="date"
                value={formData.publish_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Pages"
                name="pages"
                type="number"
                value={formData.pages}
                onChange={handleChange}
                error={!!errors.pages}
                helperText={errors.pages}
                inputProps={{ min: 1, max: 10000 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  label="Language"
                  onChange={handleChange}
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="French">French</MenuItem>
                  <MenuItem value="German">German</MenuItem>
                  <MenuItem value="Italian">Italian</MenuItem>
                  <MenuItem value="Portuguese">Portuguese</MenuItem>
                  <MenuItem value="Russian">Russian</MenuItem>
                  <MenuItem value="Chinese">Chinese</MenuItem>
                  <MenuItem value="Japanese">Japanese</MenuItem>
                  <MenuItem value="Korean">Korean</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  label="Format"
                  onChange={handleChange}
                >
                  <MenuItem value="paperback">Paperback</MenuItem>
                  <MenuItem value="hardcover">Hardcover</MenuItem>
                  <MenuItem value="ebook">eBook</MenuItem>
                  <MenuItem value="audiobook">Audiobook</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_featured}
                    onChange={handleSwitchChange}
                    name="is_featured"
                  />
                }
                label="Featured Book"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cover Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={imageProcessing}
                >
                  {imageProcessing ? 'Processing...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </Button>
                <TextField
                  size="small"
                  placeholder="Or enter image URL"
                  value={formData.cover_image}
                  onChange={handleImageUrlChange}
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </Box>
              {errors.cover_image && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.cover_image}
                </Alert>
              )}
              {previewImage && (
                <Box sx={{ mt: 2 }}>
                  <Avatar
                    src={previewImage}
                    variant="rounded"
                    sx={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                  {!previewImage.startsWith('http') && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                       Image compressed for optimal performance
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                <Button onClick={handleAddTag} variant="outlined" size="small">
                  Add
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          form="book-form"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading || imageProcessing}
        >
          {loading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const ManageBooksPage: React.FC = () => {
  // ... (keep all existing code from here down, it's unchanged)
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    pending: 0,
    avgRating: 0
  });

  // Fetch books from database
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/books', {
        params: {
          search: searchTerm || undefined,
          page: page + 1,
          limit
        }
      });
      
      let booksData = [];
      if (response.data?.data?.books) {
        booksData = response.data.data.books;
      } else if (response.data?.books) {
        booksData = response.data.books;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        booksData = response.data;
      } else {
        booksData = [];
      }
      
      const booksArray = Array.isArray(booksData) ? booksData : [];
      setBooks(booksArray);
      
      setStats({
        total: booksArray.length,
        published: booksArray.filter((b: Book) => b.status === 'published').length,
        draft: booksArray.filter((b: Book) => b.status === 'draft').length,
        archived: booksArray.filter((b: Book) => b.status === 'archived').length,
        pending: booksArray.filter((b: Book) => b.status === 'pending').length,
        avgRating: booksArray.length > 0 
          ? booksArray.reduce((acc: number, b: Book) => acc + (b.average_rating || 0), 0) / booksArray.length 
          : 0
      });
      
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load books:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load books');
      }
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, limit]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      
      let categoriesData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else {
        categoriesData = [];
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedCategories = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name || cat.category || cat.category_name || 'Unnamed Category',
        category: cat.category || cat.name,
        slug: cat.slug || '',
        description: cat.description || '',
        books_count: cat.books_count || cat.bookCount || 0,
        is_active: cat.is_active !== undefined ? cat.is_active : true,
        sort_order: cat.sort_order || 0,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      }));
      
      console.log('📚 Categories loaded:', mappedCategories);
      setCategories(mappedCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setError('Please log in to access books');
      setLoading(false);
      return;
    }
    
    fetchBooks();
    fetchCategories();
  }, [fetchBooks, fetchCategories, token]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        fetchBooks();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchBooks, token]);

  const handleRefresh = () => {
    fetchBooks();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, book: Book) => {
    setAnchorEl(event.currentTarget);
    setSelectedBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditBook = () => {
    setFormOpen(true);
    handleMenuClose();
  };

  const handleViewReviews = () => {
    if (selectedBook) {
      navigate(`/admin/reviews?bookId=${selectedBook.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    
    if (selectedBook.reviews_count && selectedBook.reviews_count > 0) {
      showNotification(
        `Cannot delete "${selectedBook.title}" because it has ${selectedBook.reviews_count} review(s). Please delete all reviews first.`,
        'warning'
      );
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      await api.delete(`/books/${selectedBook.id}`);
      showNotification('Book deleted successfully', 'success');
      fetchBooks();
      setDeleteDialogOpen(false);
      setSelectedBook(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error deleting book:', err);
      
      let errorMessage = 'Failed to delete book';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      if (errorMessage.toLowerCase().includes('review')) {
        errorMessage = `Cannot delete "${selectedBook.title}" because it has reviews. Please delete all reviews for this book first.`;
        fetchBooks();
      }
      
      showNotification(errorMessage, 'error');
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveBook = () => {
    fetchBooks();
    showNotification(
      selectedBook ? 'Book updated successfully' : 'Book added successfully',
      'success'
    );
    setSelectedBook(null);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const paginatedBooks = Array.isArray(books) 
    ? books.slice(page * limit, page * limit + limit) 
    : [];

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Book Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your book catalog, add new titles, edit existing ones, and organize your collection.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total Books</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="success.main">{stats.published}</Typography>
              <Typography variant="body2" color="text.secondary">Published</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="warning.main">{stats.draft}</Typography>
              <Typography variant="body2" color="text.secondary">Drafts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="info.main">{stats.pending}</Typography>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>{stats.avgRating.toFixed(1)}</Typography>
              <Typography variant="body2" color="text.secondary">Avg Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={handleSearchChange}
              slotProps={{
                input: {
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
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedBook(null);
                  setFormOpen(true);
                }}
              >
                Add Book
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: '100%', py: 4 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading books...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      )}

      {/* Books Table */}
      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cover</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Reviews</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBooks.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>
                      <Avatar
                        src={book.cover_image}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        <BookIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {book.title}
                      </Typography>
                      {book.isbn && (
                        <Typography variant="caption" color="text.secondary">
                          ISBN: {book.isbn}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        {book.author}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={book.category_name || 'Uncategorized'} variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={book.average_rating || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="caption">
                          ({book.average_rating?.toFixed(1) || '0'})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`${book.reviews_count || 0} review(s)`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RateReviewIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {book.reviews_count || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={book.status}
                          color={getStatusColor(book.status)}
                        />
                        {book.reviews_count && book.reviews_count > 0 && (
                          <Chip
                            size="small"
                            icon={<RateReviewIcon />}
                            label={`${book.reviews_count} reviews`}
                            variant="outlined"
                            color="info"
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={book.created_at ? format(new Date(book.created_at), 'PPpp') : ''}>
                        <span>{book.created_at ? formatDistance(new Date(book.created_at), new Date(), { addSuffix: true }) : 'N/A'}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, book)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedBooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No books found
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedBook(null);
                          setFormOpen(true);
                        }}
                        sx={{ mt: 2 }}
                      >
                        Add Your First Book
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={books.length}
              rowsPerPage={limit}
              page={page}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditBook}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleViewReviews}>
          <ListItemIcon>
            <RateReviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            View Reviews 
            {selectedBook?.reviews_count && selectedBook.reviews_count > 0 && 
              ` (${selectedBook.reviews_count})`
            }
          </ListItemText>
        </MenuItem>
        
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Book Dialog */}
      <BookFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedBook(null);
        }}
        onSave={handleSaveBook}
        book={selectedBook}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography gutterBottom>
            Are you sure you want to delete "{selectedBook?.title}"?
          </Typography>
          
          {selectedBook && selectedBook.reviews_count && selectedBook.reviews_count > 0 && (
            <Alert severity="error" sx={{ mt: 2, p: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ⚠️ Cannot Delete This Book
              </Typography>
              <Typography variant="body2">
                This book has {selectedBook.reviews_count} review
                {selectedBook.reviews_count !== 1 ? 's' : ''}. 
                Please delete all reviews for this book first before deleting the book.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => {
                  setDeleteDialogOpen(false);
                  navigate(`/admin/reviews?bookId=${selectedBook.id}`);
                }}
              >
                View Reviews
              </Button>
            </Alert>
          )}
          
          {selectedBook && (!selectedBook.reviews_count || selectedBook.reviews_count === 0) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This book has no reviews and can be safely deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteBook} 
            color="error" 
            variant="contained"
            disabled={(selectedBook?.reviews_count ?? 0) > 0}
          >
            Delete
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

      {/* FAB for mobile */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={() => {
            setSelectedBook(null);
            setFormOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Container>
  );
};

export default ManageBooksPage;