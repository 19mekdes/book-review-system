import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Badge,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  useTheme,
  alpha,
  InputAdornment // Added missing import
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';

// Types
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  phone?: string;
  joinDate: string;
  lastActive: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
  };
  stats: {
    reviewsCount: number;
    booksReviewed: number;
    averageRating: number;
    followers: number;
    following: number;
    helpfulVotes: number;
  };
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    awardedAt: string;
  }>;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface ProfileProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onUpdate?: (data: Partial<UserProfile>) => Promise<void>;
  onChangePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
  onDeleteAccount?: () => Promise<void>;
  onLogout?: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Validation schemas
const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Invalid email format'),
  bio: yup.string().max(500, 'Bio must not exceed 500 characters'),
  location: yup.string().max(100, 'Location must not exceed 100 characters'),
  website: yup.string().url('Must be a valid URL'),
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
  socialLinks: yup.object().shape({
    github: yup.string().url('Must be a valid URL'),
    linkedin: yup.string().url('Must be a valid URL'),
    twitter: yup.string().url('Must be a valid URL'),
    instagram: yup.string().url('Must be a valid URL')
  })
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

// Tab Panel Component
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Stat Card Component - Fixed color typing
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}> = ({ icon, label, value, color = 'primary' }) => {
  const theme = useTheme();
  
  // Helper function to get theme color
  const getThemeColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      info: theme.palette.info.main,
      error: theme.palette.error.main
    };
    return colorMap[colorName] || theme.palette.primary.main;
  };

  return (
    <Card sx={{ textAlign: 'center', height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: alpha(getThemeColor(color), 0.1),
            color: getThemeColor(color),
            mx: 'auto',
            mb: 1
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" component="div" fontWeight={600}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main Component
const Profile: React.FC<ProfileProps> = ({
  user,
  isOwnProfile = false,
  onUpdate,
  onChangePassword,
  onDeleteAccount,
  isLoading = false,
  className
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [avatarHover, setAvatarHover] = useState(false);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      phone: user.phone || '',
      socialLinks: {
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || ''
      }
    }
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    resetProfile({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      phone: user.phone || '',
      socialLinks: {
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || ''
      }
    });
  }, [user, resetProfile]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      resetProfile();
    }
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    if (onUpdate) {
      try {
        await onUpdate(data);
        setIsEditing(false);
        showNotification('Profile updated successfully', 'success');
      } catch {
        showNotification('Failed to update profile', 'error');
      }
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    if (onChangePassword) {
      try {
        await onChangePassword(data.currentPassword, data.newPassword);
        setShowPasswordDialog(false);
        resetPassword();
        showNotification('Password changed successfully', 'success');
      } catch {
        showNotification('Failed to change password', 'error');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (onDeleteAccount) {
      try {
        await onDeleteAccount();
        setShowDeleteDialog(false);
        showNotification('Account deleted successfully', 'success');
      } catch {
        showNotification('Failed to delete account', 'error');
      }
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAvatarChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle avatar upload
    // console.log('Upload avatar:', file);
  };

  return (
    <Container maxWidth="lg" className={className}>
      {/* Profile Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 'auto' }}>
            <Box
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              sx={{ position: 'relative' }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  user.emailVerified ? (
                    <VerifiedIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  ) : (
                    <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                  )
                }
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                    boxShadow: theme.shadows[4]
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </Badge>
              {isOwnProfile && avatarHover && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 'auto' }}>
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
              {user.bio || 'No bio provided'}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<EmailIcon />}
                label={user.email}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              {user.location && (
                <Chip
                  icon={<LocationIcon />}
                  label={user.location}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
              <Chip
                icon={<HistoryIcon />}
                label={`Joined ${format(new Date(user.joinDate), 'MMMM yyyy')}`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Stack>
          </Grid>
          {isOwnProfile && (
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <Button
                variant="contained"
                color={isEditing ? 'error' : 'primary'}
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                sx={{ bgcolor: 'white', color: theme.palette.primary.main }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<ReviewIcon />}
            label="Reviews"
            value={user.stats.reviewsCount}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<BookIcon />}
            label="Books Reviewed"
            value={user.stats.booksReviewed}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<StarIcon />}
            label="Avg Rating"
            value={user.stats.averageRating}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<VerifiedIcon />}
            label="Helpful Votes"
            value={user.stats.helpfulVotes}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile Information" icon={<EditIcon />} iconPosition="start" />
          <Tab label="Activity" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>

        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          {isEditing ? (
            <form onSubmit={handleProfileSubmit(handleProfileUpdate)}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="name"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Name"
                        error={!!profileErrors.name}
                        helperText={profileErrors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="email"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email"
                        type="email"
                        error={!!profileErrors.email}
                        helperText={profileErrors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="bio"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bio"
                        multiline
                        rows={3}
                        error={!!profileErrors.bio}
                        helperText={profileErrors.bio?.message || `${field.value?.length || 0}/500 characters`}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="location"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Location"
                        error={!!profileErrors.location}
                        helperText={profileErrors.location?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone"
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="website"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Website"
                        error={!!profileErrors.website}
                        helperText={profileErrors.website?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Social Links
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="socialLinks.github"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="GitHub"
                        slotProps={{
                          input: {
                            startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="socialLinks.linkedin"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="LinkedIn"
                        slotProps={{
                          input: {
                            startAdornment: <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="socialLinks.twitter"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Twitter"
                        slotProps={{
                          input: {
                            startAdornment: <TwitterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="socialLinks.instagram"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Instagram"
                        slotProps={{
                          input: {
                            startAdornment: <InstagramIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!profileDirty || isLoading}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmailIcon fontSize="small" />
                  {user.email}
                  {user.emailVerified ? (
                    <Chip
                      size="small"
                      icon={<VerifiedIcon />}
                      label="Verified"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<WarningIcon />}
                      label="Unverified"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Typography>

                {user.phone && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PhoneIcon fontSize="small" />
                      {user.phone}
                    </Typography>
                  </>
                )}

                {user.location && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationIcon fontSize="small" />
                      {user.location}
                    </Typography>
                  </>
                )}

                {user.website && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Website
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LanguageIcon fontSize="small" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </Typography>
                  </>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Social Links
                </Typography>
                <Stack spacing={1}>
                  {user.socialLinks?.github && (
                    <Button
                      startIcon={<GitHubIcon />}
                      href={user.socialLinks.github}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      GitHub
                    </Button>
                  )}
                  {user.socialLinks?.linkedin && (
                    <Button
                      startIcon={<LinkedInIcon />}
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      LinkedIn
                    </Button>
                  )}
                  {user.socialLinks?.twitter && (
                    <Button
                      startIcon={<TwitterIcon />}
                      href={user.socialLinks.twitter}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      Twitter
                    </Button>
                  )}
                  {user.socialLinks?.instagram && (
                    <Button
                      startIcon={<InstagramIcon />}
                      href={user.socialLinks.instagram}
                      target="_blank"
                      variant="outlined"
                      fullWidth
                    >
                      Instagram
                    </Button>
                  )}
                </Stack>
              </Grid>

              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Badges & Achievements
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {user.badges.map((badge) => (
                      <Chip
                        key={badge.id}
                        icon={<StarIcon />}
                        label={badge.name}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            Activity feed coming soon...
          </Typography>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Card>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Receive email notifications about your activity"
                    />
                    <Switch
                      checked={user.preferences?.emailNotifications}
                      onChange={() => {}}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Push Notifications"
                      secondary="Receive push notifications in your browser"
                    />
                    <Switch
                      checked={user.preferences?.pushNotifications}
                      onChange={() => {}}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <PaletteIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dark Mode"
                      secondary="Switch between light and dark theme"
                    />
                    <Switch
                      checked={user.preferences?.darkMode}
                      onChange={() => {}}
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {user.twoFactorEnabled ? <LockIcon color="success" /> : <LockOpenIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      />
                      <Button
                        variant="outlined"
                        color={user.twoFactorEnabled ? 'error' : 'primary'}
                      >
                        {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemIcon>
                        <LockIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Password"
                        secondary="Last changed 30 days ago"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        Change Password
                      </Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {isOwnProfile && (
              <Grid size={{ xs: 12 }}>
                <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="error">
                      Danger Zone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Once you delete your account, there is no going back. Please be certain.
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit(handlePasswordChange)}>
          <DialogContent>
            <Stack spacing={2}>
              <Controller
                name="currentPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Password"
                    type={showPassword.current ? 'text' : 'password'}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                              edge="end"
                            >
                              {showPassword.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="newPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="New Password"
                    type={showPassword.new ? 'text' : 'password'}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                              edge="end"
                            >
                              {showPassword.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={passwordControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm New Password"
                    type={showPassword.confirm ? 'text' : 'password'}
                    error={!!passwordErrors.confirmPassword}
                    helperText={passwordErrors.confirmPassword?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                              edge="end"
                            >
                              {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              Change Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error">
            All your data, including reviews and activity, will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={isLoading}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
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

export default Profile;