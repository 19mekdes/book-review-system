
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Fade,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Book as BookIcon,
  RateReview as ReviewIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  LinkedIn as LinkedInIcon,
  Delete as DeleteIcon,
  Cake as CakeIcon} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';



export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  joinDate: string;
  lastActive: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    github?: string;
    linkedin?: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
    timezone: string;
    newsletter: boolean;
  };
  stats: {
    reviewsCount: number;
    booksReviewed: number;
    averageRating: number;
    followers: number;
    following: number;
    helpfulVotes: number;
    readingGoal?: number;
    readingProgress?: number;
    streak: number;
    badges: Badge[];
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  awardedAt: string;
}

export interface Activity {
  id: number;
  type: 'review' | 'bookmark' | 'like' | 'follow' | 'badge';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
}

// ============================================
// Profile Header Component
// ============================================

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit: () => void;
  onAvatarChange: (file: File) => void;
  onCoverChange: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  onAvatarChange,
  onCoverChange
}) => {
  const theme = useTheme();
  const [avatarHover, setAvatarHover] = useState(false);
  const [coverHover, setCoverHover] = useState(false);

  return (
    <Paper
      sx={{
        position: 'relative',
        mb: 4,
        overflow: 'hidden',
        borderRadius: 2
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          bgcolor: theme.palette.primary.dark,
          backgroundImage: profile.coverImage ? `url(${profile.coverImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
          }
        }}
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
      >
        {isOwnProfile && coverHover && (
          <IconButton
            component="label"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'white',
              zIndex: 2,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onCoverChange(e.target.files[0]);
                }
              }}
            />
            <PhotoCameraIcon />
          </IconButton>
        )}
      </Box>

      {/* Profile Info */}
      <Box
        sx={{
          position: 'relative',
          px: 3,
          pb: 3,
          mt: -8,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-end' },
          gap: 3,
          zIndex: 1
        }}
      >
        {/* Avatar */}
        <Box
          sx={{ position: 'relative' }}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              profile.emailVerified ? (
                <VerifiedIcon sx={{ color: '#4caf50', fontSize: 20 }} />
              ) : (
                <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />
              )
            }
          >
            <Avatar
              src={profile.avatar}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: theme.shadows[2]
              }}
            >
              {profile.name.charAt(0)}
            </Avatar>
          </Badge>
          
          {isOwnProfile && avatarHover && (
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
            >
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onAvatarChange(e.target.files[0]);
                  }
                }}
              />
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* User Info */}
        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            {profile.name}
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            sx={{ mb: 1 }}
          >
            {profile.username && (
              <Typography variant="subtitle1" color="text.secondary">
                @{profile.username}
              </Typography>
            )}
            <Chip
              size="small"
              label={profile.role}
              color="primary"
              variant="outlined"
            />
          </Stack>

          {profile.bio && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              {profile.bio}
            </Typography>
          )}
        </Box>

        {/* Edit Button */}
        {isOwnProfile && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ alignSelf: { xs: 'center', sm: 'flex-end' } }}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Paper>
  );
};


interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  color = 'primary',
  onClick
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
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: alpha(colorValue, 0.1),
            color: colorValue,
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 1
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h4" component="div" fontWeight={600}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
};


interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  return (
    <Tooltip title={badge.description}>
      <Paper
        sx={{
          p: 2,
          textAlign: 'center',
          cursor: 'help',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        <Typography variant="h3" sx={{ mb: 1 }}>
          {badge.icon}
        </Typography>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {badge.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(badge.awardedAt), 'MMM yyyy')}
        </Typography>
      </Paper>
    </Tooltip>
  );
};


interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'review':
        return <ReviewIcon sx={{ color: '#4caf50' }} />;
      case 'bookmark':
        return <BookIcon sx={{ color: '#2196f3' }} />;
      case 'like':
        return <FavoriteIcon sx={{ color: '#f44336' }} />;
      case 'follow':
        return <PersonIcon sx={{ color: '#9c27b0' }} />;
      case 'badge':
        return <StarIcon sx={{ color: '#ff9800' }} />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'transparent' }}>
          {getIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={activity.title}
        secondary={
          <>
            <Typography variant="body2" color="text.secondary" component="span">
              {activity.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};


interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    phone: profile.phone || '',
    birthDate: profile.birthDate || '',
    gender: profile.gender || 'prefer-not-to-say',
    twitter: profile.socialLinks?.twitter || '',
    instagram: profile.socialLinks?.instagram || '',
    facebook: profile.socialLinks?.facebook || '',
    github: profile.socialLinks?.github || '',
    linkedin: profile.socialLinks?.linkedin || ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const updatedProfile: Partial<UserProfile> = {
        name: formData.name,
        email: formData.email,
        username: formData.username || undefined,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        birthDate: formData.birthDate || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gender: formData.gender as any,
        socialLinks: {
          twitter: formData.twitter || undefined,
          instagram: formData.instagram || undefined,
          facebook: formData.facebook || undefined,
          github: formData.github || undefined,
          linkedin: formData.linkedin || undefined
        }
      };
      
      await onSave(updatedProfile);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Basic Info */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </Grid>

          {/* Contact Info */}
         <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }} gutterBottom>
              Contact Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Birth Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Social Links */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }} gutterBottom>
              Social Links
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Twitter"
              placeholder="https://twitter.com/username"
              value={formData.twitter}
              onChange={(e) => handleChange('twitter', e.target.value)}
              InputProps={{
                startAdornment: (
                  <TwitterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Instagram"
              placeholder="https://instagram.com/username"
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InstagramIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Facebook"
              placeholder="https://facebook.com/username"
              value={formData.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              InputProps={{
                startAdornment: (
                  <FacebookIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="GitHub"
              placeholder="https://github.com/username"
              value={formData.github}
              onChange={(e) => handleChange('github', e.target.value)}
              InputProps={{
                startAdornment: (
                  <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="LinkedIn"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              InputProps={{
                startAdornment: (
                  <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  // eslint-disable-next-line no-empty-pattern
  const [] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Check if viewing own profile
  const isOwnProfile = true;

  // Load user data from AuthContext on mount
  useEffect(() => {
    if (user) {
      loadProfileFromUser();
    } else {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfileFromUser = () => {
  try {
    // Check if user exists
    if (!user) {
      console.warn('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    // Create profile from auth user data
    const profileData: UserProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      username: (user as any).username || user.name || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bio: (user as any).bio || 'Book enthusiast and avid reader',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      location: (user as any).location || 'New York, NY',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      joinDate: (user as any).created_at || new Date().toISOString(),
      lastActive: new Date().toISOString(),
      role: user.role || 'User',
      emailVerified: true,
      twoFactorEnabled: false,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        darkMode: false,
        language: 'English',
        timezone: 'America/New_York',
        newsletter: true
      },
      stats: {
        reviewsCount: 0,
        booksReviewed: 0,
        averageRating: 0,
        followers: 0,
        following: 0,
        helpfulVotes: 0,
        streak: 0,
        badges: []
      }
    };
    
    setProfile(profileData);
  } catch (err) {
    console.error('Error loading profile:', err);
    setError('Failed to load profile data');
  } finally {
    setLoading(false);
  }
};

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // Try to get user profile from API
      const response = await api.get('/users/me/profile');
      const userData = response.data.user;
      
      const profileData: UserProfile = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        username: userData.username || '',
        bio: userData.bio || 'Book enthusiast and avid reader',
        location: userData.location || 'New York, NY',
        joinDate: userData.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        role: userData.role || 'User',
        emailVerified: userData.email_verified || false,
        twoFactorEnabled: false,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          darkMode: false,
          language: 'English',
          timezone: 'America/New_York',
          newsletter: true
        },
        stats: {
          reviewsCount: userData.reviewsCount || 0,
          booksReviewed: userData.booksReviewed || 0,
          averageRating: userData.avgRating || 0,
          followers: 0,
          following: 0,
          helpfulVotes: 0,
          streak: 0,
          badges: []
        }
      };

      setProfile(profileData);
      fetchActivities();
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to auth user data
      loadProfileFromUser();
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/users/me/activity');
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    setSaving(true);
    try {
      // Send updates to backend
      
      // Update local profile state
      if (profile) {
        const updatedProfile = { ...profile, ...data };
        setProfile(updatedProfile);
        
        // Update auth context and localStorage
        if (updateUser) {
          updateUser(updatedProfile);
        } else {
          // Manual update in localStorage
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const newUser = { ...storedUser, ...data };
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        
        showNotification('Profile updated successfully', 'success');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error saving profile:', err);
      showNotification(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (profile) {
        const updatedProfile = { ...profile, avatar: response.data.avatarUrl };
        setProfile(updatedProfile);
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.avatar = response.data.avatarUrl;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        showNotification('Avatar updated successfully', 'success');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update avatar', 'error');
    }
  };

  const handleCoverChange = async (file: File) => {
    const formData = new FormData();
    formData.append('cover', file);
    
    try {
      const response = await api.post('/users/me/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (profile) {
        const updatedProfile = { ...profile, coverImage: response.data.coverUrl };
        setProfile(updatedProfile);
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.coverImage = response.data.coverUrl;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        showNotification('Cover image updated successfully', 'success');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update cover image', 'error');
    }
  };

  const handlePreferenceChange = async (key: keyof UserProfile['preferences'], value: unknown) => {
    if (!profile) return;
    
    try {
      const updatedPreferences = {
        ...profile.preferences,
        [key]: value
      };
      
      await api.put('/users/me/preferences', updatedPreferences);
      
      const updatedProfile = {
        ...profile,
        preferences: updatedPreferences
      };
      setProfile(updatedProfile);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.preferences = updatedPreferences;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      showNotification('Preferences updated', 'success');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showNotification('Failed to update preferences', 'error');
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
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (error || !profile) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchProfile}>
            Retry
          </Button>
        }
      >
        {error || 'Failed to load profile'}
      </Alert>
    </Container>
  );
}

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={handleEditProfile}
        onAvatarChange={handleAvatarChange}
        onCoverChange={handleCoverChange}
      />

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<ReviewIcon />}
            label="Reviews"
            value={profile.stats.reviewsCount}
            color="primary"
            onClick={() => navigate('/my-reviews')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<BookIcon />}
            label="Books Read"
            value={profile.stats.booksReviewed}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<StarIcon />}
            label="Avg Rating"
            value={profile.stats.averageRating.toFixed(1)}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<ThumbUpIcon />}
            label="Helpful"
            value={profile.stats.helpfulVotes}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<PersonIcon />}
            label="Followers"
            value={profile.stats.followers}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <StatsCard
            icon={<FavoriteIcon />}
            label="Following"
            value={profile.stats.following}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="About" />
          <Tab label="Activity" />
          <Tab label="Badges" />
          <Tab label="Settings" />
        </Tabs>
      </Paper>

      {/* About Tab */}
      {tabValue === 0 && (
        <Fade in={true}>
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Contact Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="action" />
                    <Typography>{profile.email}</Typography>
                    {profile.emailVerified && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </Box>
                  
                  {profile.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PhoneIcon color="action" />
                      <Typography>{profile.phone}</Typography>
                    </Box>
                  )}
                  
                  {profile.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationIcon color="action" />
                      <Typography>{profile.location}</Typography>
                    </Box>
                  )}
                  
                  {profile.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinkIcon color="action" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon color="action" />
                    <Typography>
                      Joined {format(new Date(profile.joinDate), 'MMMM yyyy')}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Social Links
                </Typography>
                <Stack spacing={2}>
                  {profile.socialLinks?.twitter && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TwitterIcon color="info" />
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        {profile.socialLinks.twitter.replace('https://', '')}
                      </a>
                    </Box>
                  )}
                  
                  {profile.socialLinks?.instagram && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InstagramIcon color="error" />
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        {profile.socialLinks.instagram.replace('https://', '')}
                      </a>
                    </Box>
                  )}
                  
                  {profile.socialLinks?.facebook && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FacebookIcon color="primary" />
                      <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        {profile.socialLinks.facebook.replace('https://', '')}
                      </a>
                    </Box>
                  )}
                  
                  {profile.socialLinks?.github && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <GitHubIcon />
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                        {profile.socialLinks.github.replace('https://', '')}
                      </a>
                    </Box>
                  )}
                  
                  {profile.socialLinks?.linkedin && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinkedInIcon color="primary" />
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        {profile.socialLinks.linkedin.replace('https://', '')}
                      </a>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Personal Information */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Personal Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="action" />
                    <Typography>
                      {profile.name} {profile.username && `(@${profile.username})`}
                    </Typography>
                  </Box>
                  
                  {profile.birthDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CakeIcon color="action" />
                      <Typography>
                        {format(new Date(profile.birthDate), 'MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                  )}
                  
                  {profile.gender && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon color="action" />
                      <Typography sx={{ textTransform: 'capitalize' }}>
                        {profile.gender.replace('-', ' ')}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Account Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon color="action" />
                    <Typography>
                      Two-Factor Authentication: {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon color="action" />
                    <Typography>
                      Last active: {formatDistance(new Date(profile.lastActive), new Date(), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Activity Tab */}
      {tabValue === 1 && (
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recent activity
                </Typography>
              )}
            </List>
          </Paper>
        </Fade>
      )}

      {/* Badges Tab */}
      {tabValue === 2 && (
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Badges & Achievements
            </Typography>
            <Grid container spacing={2}>
              {profile.stats.badges.length > 0 ? (
                profile.stats.badges.map((badge) => (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }} key={badge.id}>
                    <BadgeCard badge={badge} />
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No badges earned yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Settings Tab */}
      {tabValue === 3 && isOwnProfile && (
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Preferences
            </Typography>
            
            <Stack spacing={3}>
              {/* Notifications */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.preferences.pushNotifications}
                      onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.preferences.newsletter}
                      onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                    />
                  }
                  label="Newsletter Subscription"
                />
              </Box>

              <Divider />

              {/* Appearance */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Appearance
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.preferences.darkMode}
                      onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
              </Box>

              <Divider />

              {/* Language & Region */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Language & Region
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={profile.preferences.language}
                    label="Language"
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={profile.preferences.timezone}
                    label="Timezone"
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
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

              <Divider />

              {/* Security */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="error" gutterBottom>
                  Security
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LockIcon />}
                  onClick={() => navigate('/settings/password')}
                  sx={{ mr: 2 }}
                >
                  Change Password
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                    }
                  }}
                >
                  Delete Account
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Fade>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
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

export default ProfilePage;



