import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  alpha,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  Breadcrumbs,
  Link,
  TreeView,
  TreeItem,
  Collapse,
  List,
  ListItem,
  ListItemButton
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
  FilterList as FilterIcon,
  Category as CategoryIcon,
  Book as BookIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  ColorLens as ColorLensIcon,
  DragIndicator as DragIndicatorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChromePicker } from 'react-color';

// ============================================
// Types
// ============================================

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

export interface CategoryStats {
  id: number;
  name: string;
  booksCount: number;
  reviewsCount: number;
  averageRating: number;
  totalViews: number;
  totalLikes: number;
}

export interface CategoryManagerProps {
  categories: Category[];
  loading?: boolean;
  error?: string | null;
  onAdd: (category: Partial<Category>) => Promise<void>;
  onEdit: (id: number, category: Partial<Category>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
  onToggleActive: (id: number, isActive: boolean) => Promise<void>;
  onToggleFeatured: (id: number, isFeatured: boolean) => Promise<void>;
  onReorder: (sourceId: number, targetId: number) => Promise<void>;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  onRefresh?: () => void;
  className?: string;
}

// ============================================
// Category Dialog Component
// ============================================

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
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId,
        color: category.color || '#1976d2',
        icon: category.icon || '',
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
        isActive: true,
        isFeatured: false,
        sortOrder: categories.length,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: []
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [category, categories.length, open]);

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }));
    }
    
    // Clear error for this field
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validate form
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

    const submitData = {
      ...formData,
      image: imageFile || imagePreview
    };

    await onSave(submitData);
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
                <Avatar
                  src={imagePreview || undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: formData.color,
                    fontSize: 40,
                    border: '2px solid',
                    borderColor: 'divider'
                  }}
                >
                  {formData.name?.charAt(0).toUpperCase() || <CategoryIcon />}
                </Avatar>
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
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12 }} size={{ md: 6 }}>
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
          <Grid size={{ xs: 12 }} size={{ md: 6 }}>
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
          <Grid size={{ xs: 12 }} size={{ md: 6 }}>
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
                  .filter(c => c.id !== category?.id) // Prevent self-reference
                  .map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Color Picker */}
          <Grid size={{ xs: 12 }} size={{ md: 6 }}>
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
              <Tooltip title="Pick color">
                <IconButton onClick={() => setShowColorPicker(!showColorPicker)}>
                  <ColorLensIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {showColorPicker && (
              <Box sx={{ mt: 1, position: 'relative', zIndex: 10 }}>
                <ChromePicker
                  color={formData.color || '#1976d2'}
                  onChange={(color) => handleChange('color', color.hex)}
                />
              </Box>
            )}
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
          <Grid size={{ xs: 12 }} size={{ md: 4 }}>
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
          <Grid size={{ xs: 12 }} size={{ md: 8 }}>
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
          startIcon={loading ? <LinearProgress sx={{ width: 20 }} /> : <SaveIcon />}
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
            {hasBooks && <div>• This category has {hasBooks ? 'books' : ''} assigned</div>}
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
          {loading ? <LinearProgress sx={{ width: 100 }} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Category Tree Component
// ============================================

interface CategoryTreeItemProps {
  category: Category;
  level: number;
  selected: number[];
  onSelect: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onToggleFeatured: (id: number, isFeatured: boolean) => void;
  onDragStart?: (id: number) => void;
  onDragOver?: (id: number) => void;
  onDrop?: (targetId: number) => void;
  draggable?: boolean;
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
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isSelected = selected.includes(category.id);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', category.id.toString());
    if (onDragStart) onDragStart(category.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver) onDragOver(category.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceId !== category.id && onDrop) {
      onDrop(category.id);
    }
  };

  return (
    <Box
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        ml: level * 3,
        borderLeft: level > 0 ? `2px solid ${theme.palette.divider}` : 'none',
        position: 'relative',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }
      }}
    >
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(category.id)}
        sx={{
          pl: 2,
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
        
        {category.subcategories && category.subcategories.length > 0 && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ mr: 1 }}
          >
            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: category.color || theme.palette.primary.main,
            mr: 2
          }}
        >
          {category.icon ? <CategoryIcon /> : (category.name?.charAt(0).toUpperCase() || <CategoryIcon />)}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

      {category.subcategories && category.subcategories.length > 0 && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {category.subcategories.map((sub) => (
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
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                draggable={draggable}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

// ============================================
// Stats Card Component
// ============================================

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  trendLabel?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  trendLabel
}) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend !== undefined && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${Math.abs(trend)}%`}
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
        {trendLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {trendLabel}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// Main Component
// ============================================

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  loading = false,
  error = null,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleActive,
  onToggleFeatured,
  onReorder,
  onExport,
  onRefresh,
  className
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [selected, setSelected] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
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
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    featured: 0,
    withBooks: 0
  });

  useEffect(() => {
    // Calculate stats
    const total = categories.length;
    const active = categories.filter(c => c.isActive).length;
    const featured = categories.filter(c => c.isFeatured).length;
    const withBooks = categories.filter(c => (c.booksCount || 0) > 0).length;
    
    setStats({ total, active, featured, withBooks });
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(filteredCategories.map(c => c.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle CRUD
  const handleAdd = async (category: Partial<Category>) => {
    await onAdd(category);
    showNotification('Category added successfully', 'success');
  };

  const handleEdit = async (id: number, category: Partial<Category>) => {
    await onEdit(id, category);
    showNotification('Category updated successfully', 'success');
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      await onDelete(categoryToDelete.id);
      showNotification('Category deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length > 0) {
      await onBulkDelete(selected);
      setSelected([]);
      showNotification(`${selected.length} categories deleted`, 'success');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    await onToggleActive(id, isActive);
    showNotification(
      `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      'success'
    );
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    await onToggleFeatured(id, isFeatured);
    showNotification(
      `Category ${isFeatured ? 'added to' : 'removed from'} featured`,
      'success'
    );
  };

  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDragOver = (id: number) => {
    // Visual feedback for drag over
  };

  const handleDrop = async (targetId: number) => {
    if (draggedItem && draggedItem !== targetId) {
      await onReorder(draggedItem, targetId);
      showNotification('Categories reordered successfully', 'success');
    }
    setDraggedItem(null);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport(format);
    setAnchorEl(null);
  };

  const handleBreadcrumbClick = (categoryId?: number) => {
    if (categoryId) {
      navigate(`/categories/${categoryId}`);
    } else {
      navigate('/categories');
    }
  };

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Category Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize your books with categories and subcategories. Manage hierarchy, visibility, and SEO settings.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 3 }}>
          <StatsCard
            title="Total Categories"
            value={stats.total}
            icon={<CategoryIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 3 }}>
          <StatsCard
            title="Active"
            value={stats.active}
            icon={<VisibilityIcon />}
            color={theme.palette.success.main}
            trend={Math.round((stats.active / stats.total) * 100)}
            trendLabel="of total"
          />
        </Grid>
        <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 3 }}>
          <StatsCard
            title="Featured"
            value={stats.featured}
            icon={<StarIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12 }} size={{ sm: 6 }} size={{ md: 3 }}>
          <StatsCard
            title="With Books"
            value={stats.withBooks}
            icon={<BookIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid size={{ xs: 12 }} size={{ md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* View Toggle */}
          <Grid size={{ xs: 6 }} size={{ md: 2 }}>
            <Button
              fullWidth
              variant={viewMode === 'tree' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('tree')}
              startIcon={<FolderIcon />}
            >
              Tree View
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }} size={{ md: 2 }}>
            <Button
              fullWidth
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('list')}
              startIcon={<ListIcon />}
            >
              List View
            </Button>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }} size={{ md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {selected.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleBulkDelete}
                  >
                    Delete ({selected.length})
                  </Button>
                </>
              )}
              <Tooltip title="Export">
                <IconButton onClick={handleExportMenuOpen}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingCategory(null);
                  setDialogOpen(true);
                }}
              >
                Add Category
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
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
                  indeterminate={selected.length > 0 && selected.length < filteredCategories.length}
                  checked={selected.length === filteredCategories.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  sx={{ mr: 1 }}
                />
                <Typography variant="subtitle2">
                  {selected.length} selected
                </Typography>
              </Box>

              {/* Category Tree */}
              <List disablePadding>
                {filteredCategories
                  .filter(cat => !cat.parentId) // Only top-level categories
                  .map((category) => (
                    <CategoryTreeItem
                      key={category.id}
                      category={category}
                      level={0}
                      selected={selected}
                      onSelect={handleSelect}
                      onEdit={(cat) => {
                        setEditingCategory(cat);
                        setDialogOpen(true);
                      }}
                      onDelete={(id) => {
                        const cat = categories.find(c => c.id === id);
                        if (cat) {
                          setCategoryToDelete(cat);
                          setDeleteDialogOpen(true);
                        }
                      }}
                      onToggleActive={handleToggleActive}
                      onToggleFeatured={handleToggleFeatured}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      draggable={true}
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
                        indeterminate={selected.length > 0 && selected.length < filteredCategories.length}
                        checked={selected.length === filteredCategories.length}
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
                  {filteredCategories.map((category) => (
                    <TableRow
                      key={category.id}
                      hover
                      selected={selected.includes(category.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(category.id)}
                          onChange={() => handleSelect(category.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: category.color || theme.palette.primary.main,
                              width: 32,
                              height: 32
                            }}
                          >
                            {category.icon ? <CategoryIcon /> : category.name.charAt(0).toUpperCase()}
                          </Avatar>
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
                        {category.parentId ? (
                          <Chip
                            size="small"
                            label={categories.find(c => c.id === category.parentId)?.name}
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
                          <span>{format(new Date(category.createdAt), 'MMM dd, yyyy')}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingCategory(category);
                            setDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingCategory(null);
        }}
        onSave={editingCategory 
          ? (data) => handleEdit(editingCategory.id, data)
          : handleAdd
        }
        category={editingCategory}
        categories={categories}
        loading={loading}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDelete}
        categoryName={categoryToDelete?.name || ''}
        hasSubcategories={categoryToDelete?.subcategories?.length ? categoryToDelete.subcategories.length > 0 : false}
        hasBooks={(categoryToDelete?.booksCount || 0) > 0}
        loading={loading}
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
            setEditingCategory(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

// Need to import missing dependencies
import { List as ListIcon } from '@mui/icons-material';

export default CategoryManager;