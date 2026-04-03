import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Rating,
  Divider,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import Grid from '@mui/material/Grid';  
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
  Person as PersonIcon,
  Star as StarIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ModeratorIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';


export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: 'Admin' | 'Moderator' | 'User';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  birthDate?: string;
  joinDate: string;
  lastActive: string;
  lastLoginIp?: string;
  loginCount: number;
  reviewsCount: number;
  averageRating: number;
  helpfulVotes: number;
  followers: number;
  following: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  isOnline?: boolean;
  notes?: string;
  permissions?: string[];
}

export interface UserFilters {
  search?: string;
  role?: 'Admin' | 'Moderator' | 'User' | 'all';
  status?: 'active' | 'suspended' | 'banned' | 'pending' | 'all';
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  hasReviews?: boolean;
  minReviews?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'email' | 'joinDate' | 'lastActive' | 'reviewsCount' | 'loginCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}



interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => Promise<void>;
  user?: User | null;
  loading?: boolean;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  onSave,
  user,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    username: '',
    role: 'User',
    status: 'active',
    bio: '',
    location: '',
    phone: '',
    birthDate: '',
    emailVerified: false,
    twoFactorEnabled: false,
    notes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      if (user) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: user.name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role || 'User',
          status: user.status || 'active',
          bio: user.bio || '',
          location: user.location || '',
          phone: user.phone || '',
          birthDate: user.birthDate || '',
          emailVerified: user.emailVerified || false,
          twoFactorEnabled: user.twoFactorEnabled || false,
          notes: user.notes || ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          username: '',
          role: 'User',
          status: 'active',
          bio: '',
          location: '',
          phone: '',
          birthDate: '',
          emailVerified: false,
          twoFactorEnabled: false,
          notes: ''
        });
        setPassword('');
        setConfirmPassword('');
      }
      setErrors({});
    }
  }, [user, open]);

  const handleChange = (field: keyof User, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!user && !password) {
      newErrors.password = 'Password is required for new users';
    }
    if (password && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      ...formData,
      ...(password && { password })
    };

    await onSave(submitData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Add New User'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Avatar */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: 40
                }}
              >
                {formData.name?.charAt(0).toUpperCase() || <PersonIcon />}
              </Avatar>
            </Box>
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Full Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
            />
          </Grid>

          {/* Username */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => handleChange('role', e.target.value as string)}
                disabled={loading}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Moderator">Moderator</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value as string)}
                disabled={loading}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="banned">Banned</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              disabled={loading}
            />
          </Grid>

          {/* Birth Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Birth Date"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
              disabled={loading}
            />
          </Grid>

          {/* Location */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              error={!!errors.location}
              helperText={errors.location}
              disabled={loading}
            />
          </Grid>

          {/* Bio */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              error={!!errors.bio}
              helperText={errors.bio}
              disabled={loading}
            />
          </Grid>

          {/* Security Settings */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              Security Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailVerified || false}
                  onChange={(e) => handleChange('emailVerified', e.target.checked)}
                />
              }
              label="Email Verified"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.twoFactorEnabled || false}
                  onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
                />
              }
              label="Two-Factor Authentication"
            />
          </Grid>

          {/* Password Fields (for new users) */}
          {!user && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                />
              </Grid>
            </>
          )}

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Admin Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Internal notes about this user"
              disabled={loading}
            />
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
          {loading ? 'Saving...' : (user ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  hasActivity?: boolean;
  loading?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
  hasActivity = false,
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <Typography variant="body1" paragraph>
          Are you sure you want to delete user "{userName}"?
        </Typography>
        
        {hasActivity && (
          <Alert severity="error" sx={{ mt: 2 }}>
            This user has reviews and activity history. Deleting will remove all associated data.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Bulk Actions Dialog
// ============================================

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
  const [role, setRole] = useState('User');
  const [status, setStatus] = useState('active');

  const handleApply = () => {
    switch (action) {
      case 'role':
        onApply('role', role);
        break;
      case 'status':
        onApply('status', status);
        break;
      case 'verify':
        onApply('verify', true);
        break;
      case 'unverify':
        onApply('verify', false);
        break;
      case 'delete':
        onApply('delete', null);
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Actions</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedCount} users selected
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Action</InputLabel>
          <Select
            value={action}
            label="Select Action"
            onChange={(e: SelectChangeEvent) => setAction(e.target.value)}
          >
            <MenuItem value="role">Change Role</MenuItem>
            <MenuItem value="status">Change Status</MenuItem>
            <MenuItem value="verify">Mark Email as Verified</MenuItem>
            <MenuItem value="unverify">Mark Email as Unverified</MenuItem>
            <MenuItem value="delete">Delete Users</MenuItem>
          </Select>
        </FormControl>

        {action === 'role' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e: SelectChangeEvent) => setRole(e.target.value)}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Moderator">Moderator</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </Select>
          </FormControl>
        )}

        {action === 'status' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e: SelectChangeEvent) => setStatus(e.target.value)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="banned">Banned</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        )}

        {action === 'delete' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. {selectedCount} users will be permanently deleted.
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

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
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
      <DialogTitle>Import Users</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: dragActive ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'transparent',
            transition: 'all 0.2s',
            cursor: 'pointer',
            mb: 2
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('user-file-input')?.click()}
        >
          <input
            id="user-file-input"
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
            • CSV files should have headers: name, email, role, status, etc.
          </Typography>
          <Typography variant="body2">
            • Excel files should have a sheet named "Users" with the same headers
          </Typography>
          <Typography variant="body2">
            • JSON files should be an array of user objects
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

// ============================================
// Main Component
// ============================================

const ManageUsersPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    sortBy: 'joinDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState<NotificationProps>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    pending: 0,
    admins: 0,
    moderators: 0,
    verified: 0,
    twoFactor: 0,
    totalReviews: 0
  });

  // Fetch data
  useEffect(() => {
    fetchUsers();
   
  }, [filters]);

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data
      const mockUsers: User[] = Array.from({ length: 50 }).map((_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        username: `@user${i + 1}`,
        role: i === 0 ? 'Admin' : i % 10 === 0 ? 'Moderator' : 'User',
        status: i % 8 === 0 ? 'suspended' : i % 9 === 0 ? 'banned' : i % 7 === 0 ? 'pending' : 'active',
        avatar: undefined,
        bio: i % 3 === 0 ? `Bio for user ${i + 1}` : undefined,
        location: i % 4 === 0 ? 'New York' : i % 5 === 0 ? 'London' : undefined,
        phone: i % 6 === 0 ? '+1234567890' : undefined,
        birthDate: i % 7 === 0 ? '1990-01-01' : undefined,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastLoginIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        loginCount: Math.floor(Math.random() * 100) + 1,
        reviewsCount: Math.floor(Math.random() * 50),
        averageRating: Math.random() * 2 + 3,
        helpfulVotes: Math.floor(Math.random() * 200),
        followers: Math.floor(Math.random() * 500),
        following: Math.floor(Math.random() * 300),
        emailVerified: Math.random() > 0.2,
        twoFactorEnabled: Math.random() > 0.7,
        isOnline: Math.random() > 0.5
      }));

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);

      // Calculate stats
      const newStats = {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        suspended: mockUsers.filter(u => u.status === 'suspended').length,
        banned: mockUsers.filter(u => u.status === 'banned').length,
        pending: mockUsers.filter(u => u.status === 'pending').length,
        admins: mockUsers.filter(u => u.role === 'Admin').length,
        moderators: mockUsers.filter(u => u.role === 'Moderator').length,
        verified: mockUsers.filter(u => u.emailVerified).length,
        twoFactor: mockUsers.filter(u => u.twoFactorEnabled).length,
        totalReviews: mockUsers.reduce((acc, u) => acc + u.reviewsCount, 0)
      };
      setStats(newStats);

    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
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
    setFilters({ ...filters, page: 1 });
    handleFilterClose();
  };

  const handleFilterClear = () => {
    setFilters({
      role: 'all',
      status: 'all',
      sortBy: 'joinDate',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
    handleFilterClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditUser = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleViewUser = () => {
    if (selectedUser) {
      navigate(`/admin/users/${selectedUser.id}`);
    }
    handleMenuClose();
  };

  const handleSuspendUser = async () => {
    if (selectedUser) {
      try {
        setUsers(prev =>
          prev.map(u => u.id === selectedUser.id ? { ...u, status: 'suspended' } : u)
        );
        showNotification('User suspended successfully', 'success');
        handleMenuClose();
      } catch {
        showNotification('Failed to suspend user', 'error');
      }
    }
  };

  const handleActivateUser = async () => {
    if (selectedUser) {
      try {
        setUsers(prev =>
          prev.map(u => u.id === selectedUser.id ? { ...u, status: 'active' } : u)
        );
        showNotification('User activated successfully', 'success');
        handleMenuClose();
      } catch {
        showNotification('Failed to activate user', 'error');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        showNotification('User deleted successfully', 'success');
        setDeleteDialogOpen(false);
      } catch {
        showNotification('Failed to delete user', 'error');
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBulkAction = async (action: string, value: any) => {
    try {
      switch (action) {
        case 'role':
          setUsers(prev =>
            prev.map(u => selectedUsers.includes(u.id) ? { ...u, role: value as 'Admin' | 'Moderator' | 'User' } : u)
          );
          showNotification(`Updated role for ${selectedUsers.length} users`, 'success');
          break;
        case 'status':
          setUsers(prev =>
            prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: value as 'active' | 'suspended' | 'banned' | 'pending' } : u)
          );
          showNotification(`Updated status for ${selectedUsers.length} users`, 'success');
          break;
        case 'verify':
          setUsers(prev =>
            prev.map(u => selectedUsers.includes(u.id) ? { ...u, emailVerified: true } : u)
          );
          showNotification(`Verified ${selectedUsers.length} users`, 'success');
          break;
        case 'unverify':
          setUsers(prev =>
            prev.map(u => selectedUsers.includes(u.id) ? { ...u, emailVerified: false } : u)
          );
          showNotification(`Unverified ${selectedUsers.length} users`, 'success');
          break;
        case 'delete':
          setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
          showNotification(`Deleted ${selectedUsers.length} users`, 'success');
          break;
        default:
          break;
      }
      setBulkDialogOpen(false);
      setSelectedUsers([]);
    } catch {
      showNotification('Failed to perform bulk action', 'error');
    }
  };

  const handleImport = async () => {
    try {
      showNotification('Users imported successfully', 'success');
    } catch {
      showNotification('Failed to import users', 'error');
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    showNotification(`Exporting as ${format.toUpperCase()}...`, 'info');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const roleMap: Record<number, 'Admin' | 'Moderator' | 'User' | 'all'> = {
      0: 'all',
      1: 'User',
      2: 'Moderator',
      3: 'Admin'
    };
    setFilters({ ...filters, role: roleMap[newValue] });
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const [sortBy, sortOrder] = event.target.value.split('-') as [UserFilters['sortBy'], UserFilters['sortOrder']];
    setFilters({ 
      ...filters, 
      sortBy, 
      sortOrder 
    });
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(Number(event.target.value));
    setPage(0);
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Pagination
  const paginatedUsers = filteredUsers.slice(page * limit, page * limit + limit);

  const getStatusColor = (status: User['status']): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'banned': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'Admin': return <AdminIcon />;
      case 'Moderator': return <ModeratorIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, roles, permissions, and account status across the platform.
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
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="warning.main">
                {stats.suspended}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="error.main">
                {stats.banned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Banned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color="info.main">
                {stats.admins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                {stats.totalReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Users" />
          <Tab label="Regular Users" />
          <Tab label="Moderators" />
          <Tab label="Admins" />
        </Tabs>
      </Paper>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, username..."
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
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="joinDate-desc">Newest First</MenuItem>
                <MenuItem value="joinDate-asc">Oldest First</MenuItem>
                <MenuItem value="name-asc">Name A-Z</MenuItem>
                <MenuItem value="name-desc">Name Z-A</MenuItem>
                <MenuItem value="email-asc">Email A-Z</MenuItem>
                <MenuItem value="email-desc">Email Z-A</MenuItem>
                <MenuItem value="reviewsCount-desc">Most Reviews</MenuItem>
                <MenuItem value="lastActive-desc">Recently Active</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Items per page</InputLabel>
              <Select
                value={limit}
                label="Items per page"
                onChange={handleLimitChange}
              >
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
                <MenuItem value={100}>100 per page</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {selectedUsers.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setBulkDialogOpen(true)}
                >
                  Bulk Actions ({selectedUsers.length})
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
                  <Badge badgeContent={filters.role !== 'all' || filters.status !== 'all' ? 1 : 0} color="primary">
                    <FilterIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedUser(null);
                  setDialogOpen(true);
                }}
              >
                Add User
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
          Filter Users
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || 'all'}
              label="Status"
              onChange={(e: SelectChangeEvent) => setFilters({ ...filters, status: e.target.value as UserFilters['status'] })}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="banned">Banned</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={filters.emailVerified || false}
                onChange={(e) => setFilters({ ...filters, emailVerified: e.target.checked || undefined })}
              />
            }
            label="Email Verified"
          />

          <FormControlLabel
            control={
              <Switch
                checked={filters.twoFactorEnabled || false}
                onChange={(e) => setFilters({ ...filters, twoFactorEnabled: e.target.checked || undefined })}
              />
            }
            label="2FA Enabled"
          />

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
            Loading users...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                    checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Reviews</TableCell>
                <TableCell align="center">Rating</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="center">Security</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={user.isOnline ? 'success' : 'default'}
                      >
                        <Avatar
                          src={user.avatar}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: theme.palette.primary.main
                          }}
                        >
                          {user.name.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.username && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {user.username}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={user.role === 'Admin' ? 'warning' : user.role === 'Moderator' ? 'info' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.status}
                      color={getStatusColor(user.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Badge badgeContent={user.reviewsCount} color="primary" max={999}>
                      <StarIcon fontSize="small" color="action" />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={user.averageRating} precision={0.1} readOnly size="small" />
                      <Typography variant="caption">
                        ({user.averageRating.toFixed(1)})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={format(new Date(user.joinDate), 'PPpp')}>
                      <span>{formatDistance(new Date(user.joinDate), new Date(), { addSuffix: true })}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={format(new Date(user.lastActive), 'PPpp')}>
                      <span>{formatDistance(new Date(user.lastActive), new Date(), { addSuffix: true })}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      {user.emailVerified ? (
                        <Tooltip title="Email Verified">
                          <CheckCircleIcon color="success" fontSize="small" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Email Not Verified">
                          <ErrorIcon color="error" fontSize="small" />
                        </Tooltip>
                      )}
                      {user.twoFactorEnabled ? (
                        <Tooltip title="2FA Enabled">
                          <LockIcon color="primary" fontSize="small" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="2FA Disabled">
                          <LockOpenIcon color="action" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
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
            count={filteredUsers.length}
            rowsPerPage={limit}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewUser}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={handleSuspendUser}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Suspend</ListItemText>
          </MenuItem>
        ) : selectedUser?.status === 'suspended' ? (
          <MenuItem onClick={handleActivateUser}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        ) : null}
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

      {/* Dialogs */}
      <UserDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={async () => {
          showNotification('User saved successfully', 'success');
          setDialogOpen(false);
        }}
        user={selectedUser}
        loading={loading}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.name || ''}
        hasActivity={(selectedUser?.reviewsCount || 0) > 0}
        loading={loading}
      />

      <BulkActionsDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onApply={handleBulkAction}
        selectedCount={selectedUsers.length}
      />

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
            setSelectedUser(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Container>
  );
};

export default ManageUsersPage;