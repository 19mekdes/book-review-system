import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Stack,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  Fade,
  Tab,
  Tabs,
  Badge,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Devices as DevicesIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  PrivacyTip as PrivacyIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Google as GoogleIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';


export interface UserSettings {
  // Profile Settings
  profile: {
    name: string;
    email: string;
    username: string;
    bio: string;
    avatar?: string;
    coverImage?: string;
  };
  
  // Notification Settings
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reviewNotifications: boolean;
    commentNotifications: boolean;
    likeNotifications: boolean;
    followNotifications: boolean;
    newsletterSubscription: boolean;
    marketingEmails: boolean;
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'followers' | 'private';
    showEmail: boolean;
    showLocation: boolean;
    showActivity: boolean;
    allowTagging: boolean;
    allowMessages: 'everyone' | 'followers' | 'none';
  };
  
  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    deviceManagement: boolean;
    sessionTimeout: number;
  };
  
  // Appearance Settings
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: string;
    compactMode: boolean;
    reducedMotion: boolean;
  };
  
  // Language & Region
  localization: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
    measurementUnit: 'metric' | 'imperial';
  };
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: 'google' | 'facebook' | 'github' | 'twitter';
  email: string;
  name: string;
  avatar?: string;
  connectedAt: string;
}


interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onChangePassword
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onChangePassword({
        currentPassword,
        newPassword
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
          />

          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <Alert severity="info">
            Password must be at least 8 characters long.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);

  const handleConfirm = async () => {
    if (confirmText === 'DELETE') {
      setLoading(true);
      try {
        await onConfirm();
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      setConfirmationError(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This action cannot be undone. All your data will be permanently deleted.
        </Alert>

        <Typography variant="body2" paragraph>
          Please type <strong>DELETE</strong> to confirm:
        </Typography>

        <TextField
          fullWidth
          value={confirmText}
          onChange={(e) => {
            setConfirmText(e.target.value);
            setConfirmationError(false);
          }}
          error={confirmationError}
          helperText={confirmationError && 'Please type DELETE to confirm'}
          placeholder="DELETE"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={confirmText !== 'DELETE' || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


interface SessionCardProps {
  session: Session;
  onRevoke: (id: string) => Promise<void>;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onRevoke }) => {
  const theme = useTheme();
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await onRevoke(session.id);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DevicesIcon sx={{ fontSize: 40, color: session.isCurrent ? theme.palette.primary.main : 'text.secondary' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {session.device}
                {session.isCurrent && (
                  <Chip
                    size="small"
                    label="Current"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session.browser} on {session.os}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {session.location} • {session.ipAddress}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last active: {new Date(session.lastActive).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          {!session.isCurrent && (
            <Button
              size="small"
              color="error"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking ? <CircularProgress size={20} /> : 'Revoke'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};


interface ConnectedAccountProps {
  account: ConnectedAccount;
  onDisconnect: (id: string) => Promise<void>;
}

const ConnectedAccountItem: React.FC<ConnectedAccountProps> = ({ account, onDisconnect }) => {
  const [disconnecting, setDisconnecting] = useState(false);

  const getIcon = () => {
    switch (account.provider) {
      case 'google':
        return <GoogleIcon sx={{ color: '#DB4437' }} />;
      case 'facebook':
        return <FacebookIcon sx={{ color: '#4267B2' }} />;
      case 'github':
        return <GitHubIcon />;
      case 'twitter':
        return <TwitterIcon sx={{ color: '#1DA1F2' }} />;
      default:
        return null;
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(account.id);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getIcon()}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={account.name}
        secondary={
          <>
            <Typography variant="caption" display="block">
              {account.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Connected {format(new Date(account.connectedAt), 'MMM dd, yyyy')}
            </Typography>
          </>
        }
      />
      <ListItemSecondaryAction>
        <Button
          size="small"
          color="error"
          onClick={handleDisconnect}
          disabled={disconnecting}
        >
          {disconnecting ? <CircularProgress size={20} /> : 'Disconnect'}
        </Button>
      </ListItemSecondaryAction>
    </ListItem>
  );
};


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};


const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    username: '',
    bio: ''
  });

  // Fetch settings from localStorage first, then API
  const loadSettingsFromStorage = useCallback(() => {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        setProfileForm(parsed.profile);
        return true;
      }
    } catch (err) {
      console.error('Error loading settings from storage:', err);
    }
    return false;
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const loaded = loadSettingsFromStorage();
      
      if (!loaded) {
        // If no stored settings, create from user data
        const userSettings: UserSettings = {
          profile: {
            name: user?.name || '',
            email: user?.email || '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            username: (user as any)?.username || user?.name || '',
            bio: user?.bio || 'Book enthusiast and avid reader',
            avatar: user?.avatar,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            coverImage: (user as any)?.coverImage || ''
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            reviewNotifications: true,
            commentNotifications: true,
            likeNotifications: true,
            followNotifications: true,
            newsletterSubscription: true,
            marketingEmails: false
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: true,
            showActivity: true,
            allowTagging: true,
            allowMessages: 'everyone'
          },
          security: {
            twoFactorEnabled: false,
            loginAlerts: true,
            deviceManagement: true,
            sessionTimeout: 30
          },
          appearance: {
            theme: 'system',
            fontSize: 'medium',
            colorScheme: 'blue',
            compactMode: false,
            reducedMotion: false
          },
          localization: {
            language: 'English',
            timezone: 'America/New_York',
            dateFormat: 'MM/dd/yyyy',
            timeFormat: '12h',
            currency: 'USD',
            measurementUnit: 'imperial'
          }
        };

        setSettings(userSettings);
        setProfileForm(userSettings.profile);
      }

      // Mock sessions and accounts (these would come from API)
      setSessions([
        {
          id: '1',
          device: 'Windows PC',
          browser: 'Chrome 120.0',
          os: 'Windows 11',
          location: 'New York, NY',
          ipAddress: '192.168.1.1',
          lastActive: new Date().toISOString(),
          isCurrent: true
        },
        {
          id: '2',
          device: 'iPhone 14',
          browser: 'Safari',
          os: 'iOS 17',
          location: 'New York, NY',
          ipAddress: '192.168.1.2',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          isCurrent: false
        }
      ]);

      setConnectedAccounts([
        {
          id: '1',
          provider: 'google',
          email: user?.email || 'user@gmail.com',
          name: user?.name || 'User',
          connectedAt: new Date(Date.now() - 30 * 86400000).toISOString()
        }
      ]);

      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user, loadSettingsFromStorage]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings to localStorage
  const saveSettingsToStorage = (updatedSettings: UserSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    
    // Also update user in auth context if profile changed
    if (updatedSettings.profile) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        name: updatedSettings.profile.name,
        email: updatedSettings.profile.email,
        username: updatedSettings.profile.username,
        bio: updatedSettings.profile.bio,
        avatar: updatedSettings.profile.avatar
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (updateUser) {
        updateUser(updatedUser);
      }
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        profile: profileForm
      };
      
      // Save to API
      await api.put('/users/me', profileForm);
      
      // Update local state and storage
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Profile updated successfully', 'success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving profile:', err);
      showNotification(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof UserSettings['notifications'], value: boolean) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: value
        }
      };

      // Save to API
      await api.put('/users/me/preferences', updatedSettings.notifications);

      // Update local state and storage
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Notification preferences updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update preferences', 'error');
    }
  };

  const handlePrivacyChange = async (key: keyof UserSettings['privacy'], value: unknown) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: value
        }
      };

      await api.put('/users/me/privacy', updatedSettings.privacy);
      
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Privacy settings updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update privacy settings', 'error');
    }
  };

  const handleSecurityChange = async (key: keyof UserSettings['security'], value: unknown) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        security: {
          ...settings.security,
          [key]: value
        }
      };

      await api.put('/users/me/security', updatedSettings.security);
      
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Security settings updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update security settings', 'error');
    }
  };

  const handleAppearanceChange = async (key: keyof UserSettings['appearance'], value: unknown) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        appearance: {
          ...settings.appearance,
          [key]: value
        }
      };

      await api.put('/users/me/appearance', updatedSettings.appearance);
      
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Appearance settings updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update appearance settings', 'error');
    }
  };

  const handleLocalizationChange = async (key: keyof UserSettings['localization'], value: unknown) => {
    if (!settings) return;

    try {
      const updatedSettings = {
        ...settings,
        localization: {
          ...settings.localization,
          [key]: value
        }
      };

      await api.put('/users/me/localization', updatedSettings.localization);
      
      setSettings(updatedSettings);
      saveSettingsToStorage(updatedSettings);
      
      showNotification('Localization settings updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update localization settings', 'error');
    }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await api.post('/auth/change-password', data);
      showNotification('Password changed successfully', 'success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to change password', 'error');
      throw err;
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');
      localStorage.clear();
      showNotification('Account deleted successfully', 'success');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to delete account', 'error');
      throw err;
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/users/me/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showNotification('Session revoked successfully', 'success');
    } catch (err) {
      showNotification('Failed to revoke session', 'error');
      throw err;
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await api.delete(`/users/me/accounts/${accountId}`);
      setConnectedAccounts(prev => prev.filter(a => a.id !== accountId));
      showNotification('Account disconnected successfully', 'success');
    } catch (err) {
      showNotification('Failed to disconnect account', 'error');
      throw err;
    }
  };

  const handleExportData = async () => {
    try {
      await api.get('/users/me/export');
      showNotification('Your data export is being prepared. You will receive an email when ready.', 'info');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to export data', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Loading settings...
        </Typography>
      </Container>
    );
  }

  if (error || !settings) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchSettings}>
            Retry
          </Button>
        }>
          {error || 'Failed to load settings'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Settings Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PrivacyIcon />} label="Privacy" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<PaletteIcon />} label="Appearance" />
          <Tab icon={<LanguageIcon />} label="Language & Region" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Fade in={true}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  {/* Name */}
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />

                  {/* Email */}
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />

                  {/* Username */}
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileForm.username}
                    onChange={(e) => handleProfileChange('username', e.target.value)}
                  />

                  {/* Bio */}
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                  />

                  {/* Save Button */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Profile Picture
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton
                        component="label"
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        <input type="file" hidden accept="image/*" />
                        <UploadIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={settings.profile.avatar}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        border: `4px solid ${theme.palette.primary.main}`
                      }}
                    >
                      {settings.profile.name.charAt(0)}
                    </Avatar>
                  </Badge>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Recommended: Square JPG or PNG, at least 500x500px
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={1}>
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Notification Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Email Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Enable email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.newsletterSubscription}
                      onChange={(e) => handleNotificationChange('newsletterSubscription', e.target.checked)}
                    />
                  }
                  label="Newsletter subscription"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.marketingEmails}
                      onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                    />
                  }
                  label="Marketing emails"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Push Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Enable push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.reviewNotifications}
                      onChange={(e) => handleNotificationChange('reviewNotifications', e.target.checked)}
                    />
                  }
                  label="Review notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.commentNotifications}
                      onChange={(e) => handleNotificationChange('commentNotifications', e.target.checked)}
                    />
                  }
                  label="Comment notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.likeNotifications}
                      onChange={(e) => handleNotificationChange('likeNotifications', e.target.checked)}
                    />
                  }
                  label="Like notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.followNotifications}
                      onChange={(e) => handleNotificationChange('followNotifications', e.target.checked)}
                    />
                  }
                  label="Follow notifications"
                />
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </TabPanel>

      {/* Privacy Tab */}
      <TabPanel value={tabValue} index={2}>
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Privacy Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Profile Visibility
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Who can see your profile</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    label="Who can see your profile"
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  >
                    <MenuItem value="public">Public (Everyone)</MenuItem>
                    <MenuItem value="followers">Followers Only</MenuItem>
                    <MenuItem value="private">Private (Only Me)</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showEmail}
                      onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                    />
                  }
                  label="Show email on profile"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showLocation}
                      onChange={(e) => handlePrivacyChange('showLocation', e.target.checked)}
                    />
                  }
                  label="Show location on profile"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showActivity}
                      onChange={(e) => handlePrivacyChange('showActivity', e.target.checked)}
                    />
                  }
                  label="Show activity on profile"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Interactions
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowTagging}
                      onChange={(e) => handlePrivacyChange('allowTagging', e.target.checked)}
                    />
                  }
                  label="Allow others to tag you"
                />

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Who can send you messages</InputLabel>
                  <Select
                    value={settings.privacy.allowMessages}
                    label="Who can send you messages"
                    onChange={(e) => handlePrivacyChange('allowMessages', e.target.value)}
                  >
                    <MenuItem value="everyone">Everyone</MenuItem>
                    <MenuItem value="followers">Followers Only</MenuItem>
                    <MenuItem value="none">No One</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={3}>
        <Fade in={true}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Security Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Password
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialogOpen(true)}
                    >
                      Change Password
                    </Button>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Two-Factor Authentication
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                        />
                      }
                      label="Enable two-factor authentication"
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Login Alerts
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.loginAlerts}
                          onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                        />
                      }
                      label="Send email alerts for new logins"
                    />
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Session Timeout
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Timeout (minutes)</InputLabel>
                      <Select
                        value={settings.security.sessionTimeout}
                        label="Timeout (minutes)"
                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                      >
                        <MenuItem value={15}>15 minutes</MenuItem>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                        <MenuItem value={120}>2 hours</MenuItem>
                        <MenuItem value={240}>4 hours</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Active Sessions
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onRevoke={handleRevokeSession}
                    />
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Connected Accounts
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <List>
                  {connectedAccounts.map((account) => (
                    <ConnectedAccountItem
                      key={account.id}
                      account={account}
                      onDisconnect={handleDisconnectAccount}
                    />
                  ))}
                  <ListItem>
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Connect another account" />
                    <ListItemSecondaryAction>
                      <Button size="small">Connect</Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={tabValue} index={4}>
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Appearance Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Theme
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.appearance.theme}
                    label="Theme"
                    onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Font Size
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.appearance.fontSize}
                    label="Font Size"
                    onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Color Scheme
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Color Scheme</InputLabel>
                  <Select
                    value={settings.appearance.colorScheme}
                    label="Color Scheme"
                    onChange={(e) => handleAppearanceChange('colorScheme', e.target.value)}
                  >
                    <MenuItem value="blue">Blue</MenuItem>
                    <MenuItem value="purple">Purple</MenuItem>
                    <MenuItem value="green">Green</MenuItem>
                    <MenuItem value="orange">Orange</MenuItem>
                    <MenuItem value="red">Red</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Display Options
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                    />
                  }
                  label="Compact mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.reducedMotion}
                      onChange={(e) => handleAppearanceChange('reducedMotion', e.target.checked)}
                    />
                  }
                  label="Reduced motion"
                />
              </Box>
            </Stack>
          </Paper>
        </Fade>
      </TabPanel>

      {/* Language & Region Tab */}
      <TabPanel value={tabValue} index={5}>
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Language & Region Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Language
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.localization.language}
                        label="Language"
                        onChange={(e) => handleLocalizationChange('language', e.target.value)}
                      >
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Spanish">Spanish</MenuItem>
                        <MenuItem value="French">French</MenuItem>
                        <MenuItem value="German">German</MenuItem>
                        <MenuItem value="Chinese">Chinese</MenuItem>
                        <MenuItem value="Japanese">Japanese</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Timezone
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={settings.localization.timezone}
                        label="Timezone"
                        onChange={(e) => handleLocalizationChange('timezone', e.target.value)}
                      >
                        <MenuItem value="America/New_York">Eastern Time (US & Canada)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (US & Canada)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (US & Canada)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (US & Canada)</MenuItem>
                        <MenuItem value="Europe/London">London</MenuItem>
                        <MenuItem value="Europe/Paris">Paris</MenuItem>
                        <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Date Format
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        value={settings.localization.dateFormat}
                        label="Date Format"
                        onChange={(e) => handleLocalizationChange('dateFormat', e.target.value)}
                      >
                        <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                        <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                        <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Time Format
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Time Format</InputLabel>
                      <Select
                        value={settings.localization.timeFormat}
                        label="Time Format"
                        onChange={(e) => handleLocalizationChange('timeFormat', e.target.value)}
                      >
                        <MenuItem value="12h">12-hour (12:00 PM)</MenuItem>
                        <MenuItem value="24h">24-hour (13:00)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Currency
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={settings.localization.currency}
                        label="Currency"
                        onChange={(e) => handleLocalizationChange('currency', e.target.value)}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="JPY">JPY (¥)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </TabPanel>

      {/* Data & Privacy Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Data & Privacy
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              sx={{ justifyContent: 'flex-start' }}
            >
              Export My Data
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => showNotification('Backup feature coming soon', 'info')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Backup Account
            </Button>
          </Grid>
         <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ justifyContent: 'flex-start' }}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onChangePassword={handleChangePassword}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
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
    </Container>
  );
};

export default SettingsPage;