import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
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
  Stack,
  Rating,
  Typography,
  useTheme,
  alpha,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Archive as ArchiveIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
  format: "paperback" | "hardcover" | "ebook" | "audiobook";
  price?: number;
  coverImage?: string;
  status: "published" | "draft" | "archived" | "pending";
  reviewsCount: number;
  averageRating: number;
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface BookFilters {
  categoryId?: number;
  status?: Book["status"] | "all";
  language?: string;
  format?: Book["format"] | "all";
  minRating?: number;
  maxRating?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminBookTableProps {
  books: Book[];
  categories: Category[];
  totalBooks: number;
  loading?: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (query: string) => void;
  onFilter: (filters: BookFilters) => void;
  onSort: (field: string, direction: "asc" | "desc") => void;
  onAdd: (book: Partial<Book>) => Promise<void>;
  onEdit: (id: number, book: Partial<Book>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
  onBulkStatusChange: (ids: number[], status: Book["status"]) => Promise<void>;
  onExport: (format: "csv" | "pdf" | "excel") => void;
  page: number;
  limit: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  searchQuery?: string;
  filters?: BookFilters;
  className?: string;
}

// ============================================
// Validation Schema
// ============================================

const bookSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters"),
  author: yup
    .string()
    .required("Author is required")
    .min(2, "Author must be at least 2 characters"),
  isbn: yup
    .string()
    .optional()
    .matches(/^(?:\d[- ]?){9}[\dX]$|^(?:\d[- ]?){13}$/, "Invalid ISBN format"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  categoryId: yup.number().required("Category is required").positive(),
  publisher: yup.string().optional(),
  publishDate: yup.string().optional(),
  pages: yup.number().optional().positive().integer(),
  language: yup.string().required("Language is required"),
  format: yup
    .string()
    .required("Format is required")
    .oneOf(["paperback", "hardcover", "ebook", "audiobook"]),
  price: yup.number().optional().positive(),
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["published", "draft", "archived", "pending"]),
  tags: yup.array().of(yup.string()).optional(),
});

// ============================================
// Book Dialog Component
// ============================================

interface BookDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (book: Partial<Book>) => Promise<void>;
  book?: Book | null;
  categories: Category[];
  loading?: boolean;
}

const BookDialog: React.FC<BookDialogProps> = ({
  open,
  onClose,
  onSave,
  book,
  categories,
  loading = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      categoryId: 0,
      publisher: "",
      publishDate: "",
      pages: 0,
      language: "English",
      format: "paperback",
      price: 0,
      status: "draft",
      tags: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (book) {
        reset({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          description: book.description || "",
          categoryId: book.categoryId || 0,
          publisher: book.publisher || "",
          publishDate: book.publishDate || "",
          pages: book.pages || 0,
          language: book.language || "English",
          format: book.format || "paperback",
          price: book.price || 0,
          status: book.status || "draft",
          tags: book.tags || [],
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTags(book.tags || []);
        setPreviewUrl(book.coverImage || null);
      } else {
        reset({
          title: "",
          author: "",
          isbn: "",
          description: "",
          categoryId: 0,
          publisher: "",
          publishDate: "",
          pages: 0,
          language: "English",
          format: "paperback",
          price: 0,
          status: "draft",
          tags: [],
        });
        setTags([]);
        setPreviewUrl(null);
      }
    }
  }, [open, book, reset]);

  // ✅ FIXED: Simplified file change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      const value = input.value.trim();
      if (value && !tags.includes(value)) {
        const newTags = [...tags, value];
        setTags(newTags);
        setValue("tags", newTags);
      }
      input.value = "";
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  // ✅ FIXED: Handle category select properly
  const handleCategoryChange = (value: string) => {
    setValue("categoryId", Number(value));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const formData: Partial<Book> = {
      ...data,
      tags,
      pages: data.pages ? Number(data.pages) : undefined,
      price: data.price ? Number(data.price) : undefined,
      categoryId: Number(data.categoryId),
    };
    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Cover Image */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={previewUrl || undefined}
                    variant="rounded"
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: "action.hover",
                      border: "2px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 60, color: "text.secondary" }} />
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    }}
                  >
                    <PhotoCameraIcon />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {/* Title */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Author */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Author"
                    error={!!errors.author}
                    helperText={errors.author?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* ISBN */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="isbn"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ISBN"
                    error={!!errors.isbn}
                    helperText={errors.isbn?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* ✅ FIXED: Category Select */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categoryId}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      label="Category"
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={loading}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Publisher */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="publisher"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Publisher"
                    error={!!errors.publisher}
                    helperText={errors.publisher?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Publish Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="publishDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Publish Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.publishDate}
                    helperText={errors.publishDate?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Pages */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="pages"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Pages"
                    type="number"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    error={!!errors.pages}
                    helperText={errors.pages?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Language */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.language}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      {...field}
                      label="Language"
                      disabled={loading}
                      onChange={(e: SelectChangeEvent) =>
                        field.onChange(e.target.value)
                      }
                    >
                      <MenuItem value="English">English</MenuItem>
                      <MenuItem value="Spanish">Spanish</MenuItem>
                      <MenuItem value="French">French</MenuItem>
                      <MenuItem value="German">German</MenuItem>
                      <MenuItem value="Chinese">Chinese</MenuItem>
                      <MenuItem value="Japanese">Japanese</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Format */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.format}>
                    <InputLabel>Format</InputLabel>
                    <Select
                      {...field}
                      label="Format"
                      disabled={loading}
                      onChange={(e: SelectChangeEvent) =>
                        field.onChange(e.target.value)
                      }
                    >
                      <MenuItem value="paperback">Paperback</MenuItem>
                      <MenuItem value="hardcover">Hardcover</MenuItem>
                      <MenuItem value="ebook">E-Book</MenuItem>
                      <MenuItem value="audiobook">Audiobook</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Price */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Price"
                    type="number"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      {...field}
                      label="Status"
                      disabled={loading}
                      onChange={(e: SelectChangeEvent) =>
                        field.onChange(e.target.value)
                      }
                    >
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Tags */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Add Tags (press Enter)"
                placeholder="Type a tag and press Enter"
                onKeyDown={handleAddTag}
                disabled={loading}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isDirty}
          >
            {loading ? "Saving..." : book ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
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
  count: number;
  loading?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  count,
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <Typography>
          Are you sure you want to delete {count}{" "}
          {count === 1 ? "book" : "books"}?
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
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Bulk Status Change Dialog
// ============================================

interface BulkStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (status: Book["status"]) => void;
  count: number;
  loading?: boolean;
}

const BulkStatusDialog: React.FC<BulkStatusDialogProps> = ({
  open,
  onClose,
  onConfirm,
  count,
  loading = false,
}) => {
  const [status, setStatus] = useState<Book["status"]>("published");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Status</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Change status for {count} selected {count === 1 ? "book" : "books"}
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e: SelectChangeEvent) =>
              setStatus(e.target.value as Book["status"])
            }
          >
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onConfirm(status)}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

const AdminBookTable: React.FC<AdminBookTableProps> = ({
  books,
  categories,
  totalBooks,
  loading = false,
  error = null,
  onPageChange,
  onLimitChange,
  onSearch,
  onFilter,
  onSort,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
  onExport,
  page,
  limit,
  sortField,
  sortDirection = "asc",
  searchQuery = "",
  filters = {},
  className,
}) => {
  const theme = useTheme();

  const [selected, setSelected] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [localFilters, setLocalFilters] = useState<BookFilters>(filters);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Handle selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(books.map((book) => book.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle filters
  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = () => {
    onFilter(localFilters);
    handleFilterClose();
  };

  const handleFilterClear = () => {
    const cleared: BookFilters = {
      categoryId: undefined,
      status: "all",
      language: undefined,
      format: "all",
      minRating: undefined,
      maxRating: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    setLocalFilters(cleared);
    onFilter(cleared);
    handleFilterClose();
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      onSearch(localSearch);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearch("");
  };

  // Handle sort
  const handleSort = (field: string) => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    onSort(field, direction);
  };

  // Handle CRUD
  const handleAdd = async (book: Partial<Book>) => {
    try {
      await onAdd(book);
      showNotification("Book added successfully", "success");
    } catch {
      showNotification("Failed to add book", "error");
    }
  };

  const handleEdit = async (id: number, book: Partial<Book>) => {
    try {
      await onEdit(id, book);
      showNotification("Book updated successfully", "success");
    } catch {
      showNotification("Failed to update book", "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (selected.length > 0) {
        await onBulkDelete(selected);
        setSelected([]);
      } else if (editingBook) {
        await onDelete(editingBook.id);
      }
      showNotification("Book(s) deleted successfully", "success");
      setDeleteDialogOpen(false);
      setEditingBook(null);
    } catch {
      showNotification("Failed to delete book(s)", "error");
    }
  };

  const handleBulkStatusChange = async (status: Book["status"]) => {
    try {
      await onBulkStatusChange(selected, status);
      setSelected([]);
      showNotification(`Status updated to ${status}`, "success");
      setBulkStatusDialogOpen(false);
    } catch {
      showNotification("Failed to update status", "error");
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

  // Get status color
  const getStatusColor = (status: Book["status"]) => {
    switch (status) {
      case "published":
        return "success";
      case "draft":
        return "warning";
      case "archived":
        return "error";
      case "pending":
        return "info";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status: Book["status"]) => {
    switch (status) {
      case "published":
        return <CheckCircleIcon />;
      case "draft":
        return <EditIcon />;
      case "archived":
        return <ArchiveIcon />;
      case "pending":
        return <WarningIcon />;
      default:
        return null;
    }
  };

  // Convert number to string for Select components
  const categoryValue = localFilters.categoryId?.toString() || "";
  const statusValue = localFilters.status || "all";
  const languageValue = localFilters.language || "";
  const formatValue = localFilters.format || "all";

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Book Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage books, add new titles, edit existing ones, and track their
          status.
        </Typography>
      </Box>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search books..."
              value={localSearch}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: localSearch && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Filter Button */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterOpen}
              color={
                Object.keys(localFilters).some((key) => {
                  const value = localFilters[key as keyof BookFilters];
                  return value !== undefined && value !== "all";
                })
                  ? "primary"
                  : "inherit"
              }
            >
              Filter
            </Button>
          </Grid>

          {/* Export Button */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleMenuOpen}
            >
              Export
            </Button>
          </Grid>

          {/* Add Button */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {selected.length > 0 && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setBulkStatusDialogOpen(true)}
                  >
                    Change Status ({selected.length})
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete ({selected.length})
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingBook(null);
                  setDialogOpen(true);
                }}
              >
                Add Book
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
          Filter Books
        </Typography>
        <Stack spacing={2}>
          {/* Category Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryValue}
              label="Category"
              onChange={(e: SelectChangeEvent) =>
                setLocalFilters({
                  ...localFilters,
                  categoryId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusValue}
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                setLocalFilters({
                  ...localFilters,
                  status: e.target.value as Book["status"] | "all",
                })
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          {/* Language Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Language</InputLabel>
            <Select
              value={languageValue}
              label="Language"
              onChange={(e: SelectChangeEvent) =>
                setLocalFilters({
                  ...localFilters,
                  language: e.target.value || undefined,
                })
              }
            >
              <MenuItem value="">All Languages</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Spanish">Spanish</MenuItem>
              <MenuItem value="French">French</MenuItem>
              <MenuItem value="German">German</MenuItem>
            </Select>
          </FormControl>

          {/* Format Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Format</InputLabel>
            <Select
              value={formatValue}
              label="Format"
              onChange={(e: SelectChangeEvent) =>
                setLocalFilters({
                  ...localFilters,
                  format: e.target.value as Book["format"] | "all",
                })
              }
            >
              <MenuItem value="all">All Formats</MenuItem>
              <MenuItem value="paperback">Paperback</MenuItem>
              <MenuItem value="hardcover">Hardcover</MenuItem>
              <MenuItem value="ebook">E-Book</MenuItem>
              <MenuItem value="audiobook">Audiobook</MenuItem>
            </Select>
          </FormControl>

          {/* Rating Range */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Rating Range
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="Min"
                type="number"
                value={localFilters.minRating || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    minRating: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                inputProps={{ min: 0, max: 5, step: 0.5 }}
              />
              <TextField
                size="small"
                label="Max"
                type="number"
                value={localFilters.maxRating || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    maxRating: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                inputProps={{ min: 0, max: 5, step: 0.5 }}
              />
            </Box>
          </Box>

          {/* Date Range */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Date Range
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                label="From"
                type="date"
                value={localFilters.dateFrom || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateFrom: e.target.value || undefined,
                  })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                size="small"
                label="To"
                type="date"
                value={localFilters.dateTo || ""}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    dateTo: e.target.value || undefined,
                  })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Box>

          {/* Filter Actions */}
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button size="small" onClick={handleFilterClear}>
              Clear
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleFilterApply}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onExport("csv");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onExport("pdf");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onExport("excel");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>

      {/* Loading State */}
      {loading && (
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            Loading books...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Books Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < books.length
                  }
                  checked={books.length > 0 && selected.length === books.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Cover</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "title"}
                  direction={sortField === "title" ? sortDirection : "asc"}
                  onClick={() => handleSort("title")}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "averageRating"}
                  direction={
                    sortField === "averageRating" ? sortDirection : "asc"
                  }
                  onClick={() => handleSort("averageRating")}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "reviewsCount"}
                  direction={
                    sortField === "reviewsCount" ? sortDirection : "asc"
                  }
                  onClick={() => handleSort("reviewsCount")}
                >
                  Reviews
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === "createdAt"}
                  direction={sortField === "createdAt" ? sortDirection : "asc"}
                  onClick={() => handleSort("createdAt")}
                >
                  Added
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => {
              const isSelected = selected.includes(book.id);

              return (
                <TableRow
                  key={book.id}
                  hover
                  selected={isSelected}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelect(book.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      src={book.coverImage}
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
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      {book.author}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={book.category}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Rating
                        value={book.averageRating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="caption">
                        ({book.averageRating.toFixed(1)})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Badge
                      badgeContent={book.reviewsCount}
                      color="primary"
                      max={999}
                    >
                      <Typography variant="body2">
                        {book.reviewsCount}
                      </Typography>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getStatusIcon(book.status) || undefined}
                      label={book.status}
                      color={getStatusColor(book.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={book.format} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={format(new Date(book.createdAt), "PPpp")}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarIcon fontSize="small" color="action" />
                        {format(new Date(book.createdAt), "MMM dd, yyyy")}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingBook(book);
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setEditingBook(book);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {books.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No books found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalBooks}
        rowsPerPage={limit}
        page={page}
        onPageChange={(_event, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
      />

      {/* Add/Edit Dialog */}
      <BookDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingBook(null);
        }}
        onSave={
          editingBook ? (data) => handleEdit(editingBook.id, data) : handleAdd
        }
        book={editingBook}
        categories={categories}
        loading={loading}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setEditingBook(null);
        }}
        onConfirm={handleDelete}
        count={selected.length > 0 ? selected.length : 1}
        loading={loading}
      />

      {/* Bulk Status Dialog */}
      <BulkStatusDialog
        open={bulkStatusDialogOpen}
        onClose={() => setBulkStatusDialogOpen(false)}
        onConfirm={handleBulkStatusChange}
        count={selected.length}
        loading={loading}
      />

      {/* FAB for mobile */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", md: "none" },
          }}
          onClick={() => {
            setEditingBook(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

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
    </Box>
  );
};

export default AdminBookTable;