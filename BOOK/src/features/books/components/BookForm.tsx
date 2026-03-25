
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  SelectChangeEvent,
  CircularProgress,
  Rating
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon} from '@mui/icons-material';
import { Book, BookLanguage, Category } from '../../../pages/admin/ManageBooksPage';

interface BookFormProps {
  initialData?: Partial<Book>;
  categories: Category[];
  onSubmit: (data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  loading?: boolean;
}

const LANGUAGES: BookLanguage[] = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean'
];

const FORMATS = [
  { value: 'paperback', label: 'Paperback' },
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'ebook', label: 'E-Book' },
  { value: 'audiobook', label: 'Audiobook' }
];

const STATUSES = [
  { value: 'published', label: 'Published', color: 'success' },
  { value: 'draft', label: 'Draft', color: 'warning' },
  { value: 'archived', label: 'Archived', color: 'error' },
  { value: 'pending', label: 'Pending', color: 'info' }
];

const BookForm: React.FC<BookFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    categoryId: '',
    publisher: '',
    publishDate: '',
    pages: '',
    language: 'English' as BookLanguage,
    format: 'paperback' as Book['format'],
    price: '',
    coverImage: '',
    status: 'draft' as Book['status'],
    isFeatured: false,
    tags: [] as string[],
    averageRating: 0,
    reviewsCount: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId?.toString() || '',
        publisher: initialData.publisher || '',
        publishDate: initialData.publish_date ? initialData.publish_date.split('T')[0] : '',
        pages: initialData.pages?.toString() || '',
        language: initialData.language || 'English',
        format: initialData.format || 'paperback',
        price: initialData.price?.toString() || '',
        coverImage: initialData.cover_image || '',
        status: initialData.status || 'draft',
        isFeatured: initialData.is_featured || false,
        tags: initialData.tags || [],
        averageRating: initialData.average_rating || 0,
        reviewsCount: initialData.reviews_count || 0
      });
      setPreviewImage(initialData.cover_image || '');
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isFeatured: e.target.checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, coverImage: value }));
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }
    if (formData.isbn && !/^(?:\d{10}|\d{13})$/.test(formData.isbn.replace(/-/g, ''))) {
      newErrors.isbn = 'Invalid ISBN format (10 or 13 digits)';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
    if (validateForm()) {
      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        price: formData.price ? Math.round(parseFloat(formData.price) * 100) : undefined,
        averageRating: initialData?.average_rating || 0,
        reviewsCount: initialData?.reviews_count || 0
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await onSubmit(submitData as any);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Left Column - Main Info */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12  }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!errors.categoryId} required>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    label="Category *"
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.books_count} books)
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoryId && (
                    <FormHelperText>{errors.categoryId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    name="format"
                    value={formData.format}
                    label="Format"
                    onChange={handleChange}
                  >
                    {FORMATS.map((format) => (
                      <MenuItem key={format.value} value={format.value}>
                        {format.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Publishing Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
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
                  name="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
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

              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    name="language"
                    value={formData.language}
                    label="Language"
                    onChange={handleChange}
                  >
                    {LANGUAGES.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Price (in cents)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags & Metadata
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Cover Image URL"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleImageChange}
                placeholder="https://example.com/cover.jpg"
                InputProps={{
                  endAdornment: previewImage && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => window.open(previewImage, '_blank')}
                      >
                        <CloudUploadIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {previewImage && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={previewImage}
                    alt="Cover preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 150,
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/book-placeholder.jpg';
                    }}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Status & Settings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={status.label}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        color={status.color as any}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFeatured}
                  onChange={handleSwitchChange}
                />
              }
              label="Feature this book"
            />

            {isEdit && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Statistics
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2">Rating:</Typography>
                  <Rating value={formData.averageRating} readOnly size="small" />
                  <Typography variant="body2">({formData.reviewsCount})</Typography>
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {formData.title || 'Book Title'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                by {formData.author || 'Author Name'}
              </Typography>
              <Chip
                size="small"
                label={formData.format}
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Form Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
        </Button>
      </Box>
    </Box>
  );
};

export default BookForm;