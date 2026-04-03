import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
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
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  useTheme,
  alpha,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  Tab,
  Tabs,
  Collapse,
  List,
  ListItemButton,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Book as BookIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  PhotoCamera as PhotoCameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';


export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  image?: string;
  booksCount: number;
  subcategories?: Category[];
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  search?: string;
  parentId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  hasBooks?: boolean;
  sortBy?: 'name' | 'booksCount' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}


interface CategoryImageProps {
  src?: string;
  name?: string;
  color?: string;
  size?: number;
}

const CategoryImage: React.FC<CategoryImageProps> = ({ src, name, color, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (str?: string): string => {
    if (!str || typeof str !== 'string') return '?';
    return str
      .split(' ')
      .slice(0, 2)
      .map(word => word[0] || '?')
      .join('')
      .toUpperCase();
  };

  const displayName = name || 'Category';

  if (src && typeof src === 'string' && src.trim() !== '' && !imageError) {
    return (
      <Avatar
        src={src}
        sx={{ width: size, height: size, bgcolor: color }}
        imgProps={{ 
          onError: () => setImageError(true),
          onLoad: () => setImageError(false)
        }}
      />
    );
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: color || '#1976d2',
        fontSize: Math.max(size * 0.4, 12)
      }}
    >
      {getInitials(displayName)}
    </Avatar>
  );
};


interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
  category?: Category | null;
  categories: Category[];
  loading?: boolean;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  categories,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    parentId: undefined,
    color: '#1976d2',
    icon: '',
    image: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keywordInput, setKeywordInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId,
        color: category.color || '#1976d2',
        icon: category.icon || '',
        image: category.image || '',
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        sortOrder: category.sortOrder || 0,
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        seoKeywords: category.seoKeywords || []
      });
      setImagePreview(category.image || null);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentId: undefined,
        color: '#1976d2',
        icon: '',
        image: '',
        isActive: true,
        isFeatured: false,
        sortOrder: categories.length,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [category, categories.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      const keywords = formData.seoKeywords || [];
      if (!keywords.includes(keywordInput.trim())) {
        handleChange('seoKeywords', [...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const keywords = formData.seoKeywords || [];
    handleChange('seoKeywords', keywords.filter(k => k !== keyword));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleChange('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setImagePreview(url);
    handleChange('image', url);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Image Upload */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <CategoryImage
                  src={imagePreview || undefined}
                  name={formData.name}
                  color={formData.color}
                  size={100}
                />
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                  size="small"
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {/* Image URL Input */}
            <TextField
              fullWidth
              size="small"
              label="Image URL"
              value={imagePreview || ''}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/category-image.jpg"
              disabled={loading}
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Category Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Grid>

          {/* Slug */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Slug *"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              error={!!errors.slug}
              helperText={errors.slug}
              disabled={loading}
            />
          </Grid>

          {/* Parent Category */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={formData.parentId || ''}
                label="Parent Category"
                onChange={(e) => handleChange('parentId', e.target.value || undefined)}
                disabled={loading}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {categories
                  .filter(c => c.id !== category?.id)
                  .map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Color Picker */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: formData.color,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      />
                    </InputAdornment>
                  )
                }}
              />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                style={{ width: 48, height: 48, cursor: 'pointer' }}
              />
            </Box>
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* Status Toggles */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFeatured}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                  />
                }
                label="Featured"
              />
            </Box>
          </Grid>

          {/* Sort Order */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Sort Order"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
              disabled={loading}
            />
          </Grid>

          {/* Icon */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Icon Name (Material Icon)"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="e.g., category, book, menu_book"
              disabled={loading}
            />
          </Grid>

          {/* SEO Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              SEO Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* SEO Title */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="SEO Title"
              value={formData.seoTitle}
              onChange={(e) => handleChange('seoTitle', e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* SEO Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="SEO Description"
              multiline
              rows={2}
              value={formData.seoDescription}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* SEO Keywords */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Add SEO Keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                disabled={loading}
              />
              <Button
                variant="outlined"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.seoKeywords?.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => handleRemoveKeyword(keyword)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
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
  categoryName: string;
  hasSubcategories?: boolean;
  hasBooks?: boolean;
  loading?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  categoryName,
  hasSubcategories = false,
  hasBooks = false,
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Category</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <Typography variant="body1" paragraph>
          Are you sure you want to delete "{categoryName}"?
        </Typography>
        
        {(hasSubcategories || hasBooks) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {hasSubcategories && <div>• This category has subcategories</div>}
            {hasBooks && <div>• This category has {hasBooks} books assigned</div>}
            <Typography variant="body2" sx={{ mt: 1 }}>
              These will need to be reassigned or deleted first.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading || hasSubcategories || hasBooks}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Import Dialog Component
// ============================================

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  loading?: boolean;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImport,
  loading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (selectedFile) {
      await onImport(selectedFile);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Categories</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: dragActive ? alpha('#1976d2', 0.04) : 'transparent',
            transition: 'all 0.2s',
            cursor: 'pointer',
            mb: 2
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('category-file-input')?.click()}
        >
          <input
            id="category-file-input"
            type="file"
            hidden
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileChange}
          />
          <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported formats: CSV, Excel, JSON (Max 10MB)
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            • CSV files should have headers: name, slug, description, parent, etc.
          </Typography>
          <Typography variant="body2">
            • Excel files should have a sheet named "Categories" with the same headers
          </Typography>
          <Typography variant="body2">
            • JSON files should be an array of category objects
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


interface BulkActionsDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (action: string, value: unknown) => Promise<void>;
  selectedCount: number;
  loading?: boolean;
}

const BulkActionsDialog: React.FC<BulkActionsDialogProps> = ({
  open,
  onClose,
  onApply,
  selectedCount,
  loading = false
}) => {
  const [action, setAction] = useState('');

  const handleApply = () => {
    switch (action) {
      case 'activate':
        onApply('activate', true);
        break;
      case 'deactivate':
        onApply('activate', false);
        break;
      case 'feature':
        onApply('featured', true);
        break;
      case 'unfeature':
        onApply('featured', false);
        break;
      case 'delete':
        onApply('delete', null);
        break;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Actions</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedCount} categories selected
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Action</InputLabel>
          <Select
            value={action}
            label="Select Action"
            onChange={(e) => setAction(e.target.value)}
          >
            <MenuItem value="activate">Activate Categories</MenuItem>
            <MenuItem value="deactivate">Deactivate Categories</MenuItem>
            <MenuItem value="feature">Mark as Featured</MenuItem>
            <MenuItem value="unfeature">Remove Featured</MenuItem>
            <MenuItem value="delete">Delete Categories</MenuItem>
          </Select>
        </FormControl>

        {action === 'delete' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. {selectedCount} categories will be permanently deleted.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color={action === 'delete' ? 'error' : 'primary'}
          onClick={handleApply}
          disabled={!action || loading}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};


interface CategoryTreeItemProps {
  category: Category;
  level: number;
  selected: number[];
  onSelect: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onToggleFeatured: (id: number, isFeatured: boolean) => void;
  expanded: number[];
  onToggleExpand: (id: number) => void;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  expanded,
  onToggleExpand
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isSelected = selected.includes(category.id);
  const isExpanded = expanded.includes(category.id);
  const hasChildren = category.subcategories && category.subcategories.length > 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(category.id)}
        sx={{
          pl: 2 + level * 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent'
        }}
      >
        <Checkbox
          edge="start"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelect(category.id)}
          sx={{ mr: 1 }}
        />
        
        {hasChildren && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(category.id);
            }}
            sx={{ mr: 1 }}
          >
            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        
        <CategoryImage
          src={category.image}
          name={category.name}
          color={category.color}
          size={32}
        />
        
        <Box sx={{ flex: 1, ml: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {category.name}
            </Typography>
            <Chip
              size="small"
              label={category.slug}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            {!category.isActive && (
              <Chip
                size="small"
                label="Inactive"
                color="error"
                variant="outlined"
              />
            )}
            {category.isFeatured && (
              <Chip
                size="small"
                label="Featured"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
            <Tooltip title="Books">
              <Badge badgeContent={category.booksCount} color="primary" max={999}>
                <BookIcon fontSize="small" color="action" />
              </Badge>
            </Tooltip>
            
            {category.description && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {category.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={category.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(category.id, !category.isActive);
              }}
            >
              {category.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={category.isFeatured ? 'Remove from featured' : 'Add to featured'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFeatured(category.id, !category.isFeatured);
              }}
              color={category.isFeatured ? 'warning' : 'default'}
            >
              {category.isFeatured ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="More actions">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            onEdit(category);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onToggleActive(category.id, !category.isActive);
            handleMenuClose();
          }}>
            <ListItemIcon>
              {category.isActive ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {category.isActive ? 'Deactivate' : 'Activate'}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            onToggleFeatured(category.id, !category.isFeatured);
            handleMenuClose();
          }}>
            <ListItemIcon>
              {category.isFeatured ? <StarBorderIcon fontSize="small" /> : <StarIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {category.isFeatured ? 'Remove Featured' : 'Make Featured'}
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onDelete(category.id);
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
      </ListItemButton>

      {hasChildren && isExpanded && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {category.subcategories?.map((sub) => (
              <CategoryTreeItem
                key={sub.id}
                category={sub}
                level={level + 1}
                selected={selected}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onToggleFeatured={onToggleFeatured}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};


interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend
}) => {
  const theme = useTheme();

  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      info: theme.palette.info.main,
      error: theme.palette.error.main,
      secondary: theme.palette.secondary.main
    };
    return colorMap[colorName] || theme.palette.primary.main;
  };

  const colorValue = getColorValue(color);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: colorValue, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Chip
              size="small"
              label={`${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" component="div" fontWeight={600} gutterBottom>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};



const ManageCategoriesPage: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CategoryFilters>({
    sortBy: 'sortOrder',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  });
  
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<number[]>([]);
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
    active: 0,
    inactive: 0,
    featured: 0,
    withBooks: 0,
    totalBooks: 0
  });

  // Flatten categories for stats calculation
  const flattenCategories = useCallback((cats: Category[]): Category[] => {
    let flat: Category[] = [];
    cats.forEach(cat => {
      flat.push(cat);
      if (cat.subcategories) {
        flat = [...flat, ...flattenCategories(cat.subcategories)];
      }
    });
    return flat;
  }, []);

  // Fetch data
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'Fiction',
          slug: 'fiction',
          description: 'Fiction books category',
          image: 'https://picsum.photos/id/24/200/200',
          color: '#1976d2',
          booksCount: 234,
          isActive: true,
          isFeatured: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subcategories: [
            {
              id: 11,
              name: 'Science Fiction',
              slug: 'science-fiction',
              parentId: 1,
              image: 'https://picsum.photos/id/25/200/200',
              color: '#2196f3',
              booksCount: 89,
              isActive: true,
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 12,
              name: 'Fantasy',
              slug: 'fantasy',
              parentId: 1,
              image: 'https://picsum.photos/id/26/200/200',
              color: '#9c27b0',
              booksCount: 67,
              isActive: true,
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 13,
              name: 'Mystery',
              slug: 'mystery',
              parentId: 1,
              image: 'https://picsum.photos/id/27/200/200',
              color: '#ff9800',
              booksCount: 45,
              isActive: true,
              sortOrder: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 2,
          name: 'Non-Fiction',
          slug: 'non-fiction',
          description: 'Non-fiction books category',
          image: 'https://picsum.photos/id/28/200/200',
          color: '#4caf50',
          booksCount: 156,
          isActive: true,
          isFeatured: true,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subcategories: [
            {
              id: 21,
              name: 'Biography',
              slug: 'biography',
              parentId: 2,
              image: 'https://picsum.photos/id/29/200/200',
              color: '#8bc34a',
              booksCount: 43,
              isActive: true,
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 22,
              name: 'History',
              slug: 'history',
              parentId: 2,
              image: 'https://picsum.photos/id/30/200/200',
              color: '#ffc107',
              booksCount: 38,
              isActive: true,
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 3,
          name: "Children's Books",
          slug: 'childrens-books',
          image: 'https://picsum.photos/id/31/200/200',
          color: '#f44336',
          booksCount: 67,
          isActive: true,
          sortOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Academic',
          slug: 'academic',
          image: 'https://picsum.photos/id/32/200/200',
          color: '#9e9e9e',
          booksCount: 0,
          isActive: false,
          sortOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
      
      const flatCategories = flattenCategories(mockCategories);
      setStats({
        total: flatCategories.length,
        active: flatCategories.filter(c => c.isActive).length,
        inactive: flatCategories.filter(c => !c.isActive).length,
        featured: flatCategories.filter(c => c.isFeatured).length,
        withBooks: flatCategories.filter(c => c.booksCount > 0).length,
        totalBooks: flatCategories.reduce((acc, c) => acc + c.booksCount, 0)
      });

      setError(null);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [flattenCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    let filtered = [...categories];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.slug.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
    }

    if (tabValue === 1) {
      filtered = filtered.filter(c => c.isActive === true);
    } else if (tabValue === 2) {
      filtered = filtered.filter(c => c.isActive === false);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, tabValue]);

  const handleRefresh = () => {
    fetchCategories();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = () => {
    handleFilterClose();
  };

  const handleFilterClear = () => {
    setFilters({
      sortBy: 'sortOrder',
      sortOrder: 'asc',
      page: 1,
      limit: 20
    });
    handleFilterClose();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = flattenCategories(filteredCategories).map(c => c.id);
      setSelectedCategories(allIds);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleExpand = (id: number) => {
    setExpandedNodes(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    const getAllIds = (cats: Category[]): number[] => {
      let ids: number[] = [];
      cats.forEach(cat => {
        ids.push(cat.id);
        if (cat.subcategories) {
          ids = [...ids, ...getAllIds(cat.subcategories)];
        }
      });
      return ids;
    };
    setExpandedNodes(getAllIds(categories));
  };

  const handleCollapseAll = () => {
    setExpandedNodes([]);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveCategory = async (_categoryData: Partial<Category>) => {
    try {
      showNotification(
        selectedCategory ? 'Category updated successfully' : 'Category created successfully',
        'success'
      );
      fetchCategories();
      setDialogOpen(false);
    } catch {
      showNotification('Failed to save category', 'error');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteCategory = async (_id: number) => {
    try {
      showNotification('Category deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch {
      showNotification('Failed to delete category', 'error');
    }
  };

  const handleToggleActive = async (_id: number, isActive: boolean) => {
    try {
      showNotification(`Category ${isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchCategories();
    } catch {
      showNotification('Failed to update category', 'error');
    }
  };

  const handleToggleFeatured = async (_id: number, isFeatured: boolean) => {
    try {
      showNotification(
        isFeatured ? 'Category added to featured' : 'Category removed from featured',
        'success'
      );
      fetchCategories();
    } catch {
      showNotification('Failed to update category', 'error');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBulkAction = async (_action: string, _value: unknown) => {
    try {
      showNotification(`Bulk action completed for ${selectedCategories.length} categories`, 'success');
      setBulkDialogOpen(false);
      setSelectedCategories([]);
      fetchCategories();
    } catch {
      showNotification('Failed to perform bulk action', 'error');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleImport = async (_file: File) => {
    try {
      showNotification('Categories imported successfully', 'success');
    } catch {
      showNotification('Failed to import categories', 'error');
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    showNotification(`Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const paginatedCategories = filteredCategories.slice(page * limit, page * limit + limit);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize your books with categories and subcategories. Manage hierarchy, visibility, and SEO settings.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="Total Categories"
            value={stats.total}
            icon={<CategoryIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="Active"
            value={stats.active}
            icon={<VisibilityIcon />}
            color="success"
            trend={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="Featured"
            value={stats.featured}
            icon={<StarIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="With Books"
            value={stats.withBooks}
            icon={<BookIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="Inactive"
            value={stats.inactive}
            icon={<VisibilityOffIcon />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            icon={<BookIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Categories" />
          <Tab label="Active" />
          <Tab label="Inactive" />
        </Tabs>
      </Paper>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search categories..."
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

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                label="View Mode"
                onChange={(e) => setViewMode(e.target.value as 'tree' | 'table')}
              >
                <MenuItem value="tree">Tree View</MenuItem>
                <MenuItem value="table">Table View</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                label="Sort By"
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                }}
              >
                <MenuItem value="sortOrder-asc">Sort Order</MenuItem>
                <MenuItem value="name-asc">Name A-Z</MenuItem>
                <MenuItem value="name-desc">Name Z-A</MenuItem>
                <MenuItem value="booksCount-desc">Most Books</MenuItem>
                <MenuItem value="booksCount-asc">Least Books</MenuItem>
                <MenuItem value="createdAt-desc">Newest</MenuItem>
                <MenuItem value="createdAt-asc">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {viewMode === 'tree' && (
                <>
                  <Button size="small" onClick={handleExpandAll}>
                    Expand All
                  </Button>
                  <Button size="small" onClick={handleCollapseAll}>
                    Collapse All
                  </Button>
                </>
              )}
              
              {selectedCategories.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setBulkDialogOpen(true)}
                >
                  Bulk Actions ({selectedCategories.length})
                </Button>
              )}
              
              <Tooltip title="Import">
                <IconButton onClick={() => setImportDialogOpen(true)}>
                  <UploadIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Export">
                <IconButton onClick={() => handleExport('csv')}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Filters">
                <IconButton onClick={handleFilterOpen}>
                  <Badge badgeContent={0} color="primary">
                    <FilterIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedCategory(null);
                  setDialogOpen(true);
                }}
              >
                Add Category
              </Button>
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
          Filter Categories
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleFilterClear}>
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={handleFilterApply}>
              Apply
            </Button>
          </Box>
        </Stack>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: '100%', py: 4 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Loading categories...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Categories Display */}
      {!loading && !error && (
        <>
          {viewMode === 'tree' ? (
            <Paper sx={{ p: 2 }}>
              {/* Select All Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  mb: 1
                }}
              >
                <Checkbox
                  indeterminate={
                    selectedCategories.length > 0 && 
                    selectedCategories.length < flattenCategories(filteredCategories).length
                  }
                  checked={selectedCategories.length === flattenCategories(filteredCategories).length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                  {selectedCategories.length} selected
                </Typography>
              </Box>

              {/* Category Tree */}
              <List disablePadding>
                {filteredCategories
                  .filter(cat => !cat.parentId)
                  .map((category) => (
                    <CategoryTreeItem
                      key={category.id}
                      category={category}
                      level={0}
                      selected={selectedCategories}
                      onSelect={handleSelectCategory}
                      onEdit={(cat) => {
                        setSelectedCategory(cat);
                        setDialogOpen(true);
                      }}
                      onDelete={(id) => {
                        const cat = flattenCategories(categories).find(c => c.id === id);
                        if (cat) {
                          setSelectedCategory(cat);
                          setDeleteDialogOpen(true);
                        }
                      }}
                      onToggleActive={handleToggleActive}
                      onToggleFeatured={handleToggleFeatured}
                      expanded={expandedNodes}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
              </List>

              {filteredCategories.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No categories found
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedCategories.length > 0 && selectedCategories.length < paginatedCategories.length}
                        checked={paginatedCategories.length > 0 && selectedCategories.length === paginatedCategories.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Parent</TableCell>
                    <TableCell align="center">Books</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Featured</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCategories.map((category) => {
                    const parent = flattenCategories(categories).find(c => c.id === category.parentId);
                    
                    return (
                      <TableRow key={category.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleSelectCategory(category.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CategoryImage
                              src={category.image}
                              name={category.name}
                              color={category.color}
                              size={32}
                            />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {category.name}
                              </Typography>
                              {category.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {category.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={category.slug} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {parent ? (
                            <Chip
                              size="small"
                              label={parent.name}
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Top Level
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Badge badgeContent={category.booksCount} color="primary" max={999}>
                            <BookIcon color="action" />
                          </Badge>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={category.isActive ? 'Active' : 'Inactive'}
                            color={category.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {category.isFeatured && (
                            <StarIcon color="warning" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={format(new Date(category.createdAt), 'PPpp')}>
                            <span>{formatDistance(new Date(category.createdAt), new Date(), { addSuffix: true })}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={filteredCategories.length}
                rowsPerPage={limit}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          )}
        </>
      )}

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
        category={selectedCategory}
        categories={flattenCategories(categories)}
        loading={loading}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={() => selectedCategory && handleDeleteCategory(selectedCategory.id)}
        categoryName={selectedCategory?.name || ''}
        hasSubcategories={selectedCategory?.subcategories ? selectedCategory.subcategories.length > 0 : false}
        hasBooks={(selectedCategory?.booksCount || 0) > 0}
        loading={loading}
      />

      {/* Bulk Actions Dialog */}
      <BulkActionsDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onApply={handleBulkAction}
        selectedCount={selectedCategories.length}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />

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
            setSelectedCategory(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Container>
  );
};

export default ManageCategoriesPage;