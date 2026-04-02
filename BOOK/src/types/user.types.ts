export type UserRole = 'Admin' | 'Moderator' | 'User';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
export type UserVerificationStatus = 'verified' | 'unverified' | 'pending';
export type AccountProvider = 'local' | 'google' | 'facebook' | 'github' | 'twitter';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
  
  // Profile
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  occupation?: string;
  interests?: string[];
  
  // Account info
  provider: AccountProvider;
  providerId?: string;
  emailVerified: boolean;
  verificationStatus: UserVerificationStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  
  // Preferences
  preferences: UserPreferences;
  
  // Statistics
  stats: UserStats;
  badges: Badge[];
  
  // Social links
  socialLinks?: SocialLinks;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActiveAt: string;
  lastLoginIp?: string;
  loginCount: number;
  isOnline?: boolean;
}

export interface UserPreferences {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  reviewNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  followNotifications: boolean;
  newsletter: boolean;
  marketingEmails: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'followers' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showActivity: boolean;
  allowTagging: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: string;
  compactMode: boolean;
  reducedMotion: boolean;
  
  // Language & Region
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  measurementUnit: 'metric' | 'imperial';
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
}


export interface UserStats {
  // Reviews
  reviewsCount: number;
  booksReviewed: number;
  averageRating: number;
  totalLikes: number;
  totalDislikes: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  
  // Social
  followersCount: number;
  followingCount: number;
  
  // Reading
  readingGoal?: number;
  readingProgress?: number;
  booksToRead: number;
  booksReading: number;
  booksCompleted: number;
  totalPagesRead?: number;
  readingStreak: number;
  longestStreak: number;
  
  // Engagement
  contributionRank?: number;
  badgesCount: number;
  commentsCount: number;
  totalReadingTime?: number; // In minutes
  
  // Activity
  lastReviewAt?: string;
  lastCommentAt?: string;
  lastBookmarkAt?: string;
}


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reviewer' | 'contributor' | 'expert' | 'special' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  awardedAt: string;
  progress?: number;
  totalRequired?: number;
  criteria?: string;
}



export interface SocialLinks {
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  discord?: string;
  twitch?: string;
}



export type ActivityType = 
  | 'review' 
  | 'comment' 
  | 'like' 
  | 'bookmark' 
  | 'follow' 
  | 'badge' 
  | 'reading_progress'
  | 'achievement';

export interface UserActivity {
  id: number;
  userId: number;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  link?: string;
  visibility: 'public' | 'followers' | 'private';
}



export interface UserSession {
  id: string;
  userId: number;
  device: string;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  ipAddress: string;
  location?: string;
  country?: string;
  city?: string;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
  isTrusted: boolean;
}



export interface LoginHistory {
  id: number;
  userId: number;
  timestamp: string;
  ipAddress: string;
  location?: string;
  country?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  success: boolean;
  failureReason?: string;
  twoFactorUsed?: boolean;
}



export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'blocked';
}

export interface Follower extends User {
  followedAt: string;
  isFollowing: boolean;
}

// ============================================
// Reading List
// ============================================

export type ReadingStatus = 'to-read' | 'reading' | 'paused' | 'completed' | 'dnf';

export interface ReadingListItem {
  id: number;
  userId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  status: ReadingStatus;
  progress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  startDate?: string;
  finishDate?: string;
  rating?: number;
  reviewId?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// User Notifications
// ============================================

export type NotificationType = 
  | 'review_reply' 
  | 'comment_reply' 
  | 'like' 
  | 'follow' 
  | 'badge' 
  | 'achievement' 
  | 'system' 
  | 'warning' 
  | 'info';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserNotification {
  id: string;
  userId: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  image?: string;
  createdAt: string;
  expiresAt?: string;
}

// ============================================
// User Reports
// ============================================

export interface UserReport {
  id: number;
  reporterId: number;
  reportedUserId: number;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  notes?: string;
}

// ============================================
// User Blocks
// ============================================

export interface UserBlock {
  id: number;
  blockerId: number;
  blockedId: number;
  reason?: string;
  createdAt: string;
  expiresAt?: string;
}

// ============================================
// User Settings
// ============================================

export interface UserSettings {
  // Profile
  profile: UserProfileSettings;
  
  // Notifications
  notifications: NotificationSettings;
  
  // Privacy
  privacy: PrivacySettings;
  
  // Security
  security: SecuritySettings;
  
  // Appearance
  appearance: AppearanceSettings;
  
  // Accessibility
  accessibility: AccessibilitySettings;
  
  // Language & Region
  localization: LocalizationSettings;
}

export interface UserProfileSettings {
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  phone?: string;
  birthDate?: string;
  gender?: Gender;
  occupation?: string;
  interests?: string[];
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reviewNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  followNotifications: boolean;
  newsletter: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  showActivity: boolean;
  allowTagging: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
  showOnlineStatus: boolean;
  showReadingActivity: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  deviceManagement: boolean;
  sessionTimeout: number;
  passwordLastChanged?: string;
  trustedDevices: string[];
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: string;
  compactMode: boolean;
  reducedMotion: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedTransparency: boolean;
}

export interface LocalizationSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  measurementUnit: 'metric' | 'imperial';
  firstDayOfWeek: 'monday' | 'sunday';
}

// ============================================
// API Request/Response Types
// ============================================

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: User;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface UsersApiResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    timestamp: string;
  };
}

export interface UserActivityResponse {
  success: boolean;
  message: string;
  data: UserActivity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: UserStats;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  data: {
    isFollowing: boolean;
    followerCount: number;
  };
}

// ============================================
// User Search/Filter Types
// ============================================

export interface UserFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
  verification?: UserVerificationStatus | 'all';
  provider?: AccountProvider | 'all';
  hasTwoFactor?: boolean;
  hasReviews?: boolean;
  minReviews?: number;
  minFollowers?: number;
  joinedAfter?: string;
  joinedBefore?: string;
  lastActiveAfter?: string;
  location?: string;
  sortBy?: 'name' | 'email' | 'joinedAt' | 'lastActive' | 'reviewsCount' | 'followersCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserSortOption {
  field: keyof User;
  label: string;
  direction: 'asc' | 'desc';
}

// ============================================
// User Statistics for Charts
// ============================================

export interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

export interface UserRoleDistribution {
  role: UserRole;
  count: number;
  percentage: number;
}

export interface UserActivityHeatmap {
  date: string;
  count: number;
  intensity: number;
}

// ============================================
// User Constants
// ============================================

export const USER_ROLES: UserRole[] = ['Admin', 'Moderator', 'User'];
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended', 'banned', 'pending'];
export const ACCOUNT_PROVIDERS: AccountProvider[] = ['local', 'google', 'facebook', 'github', 'twitter'];
export const READING_STATUSES: ReadingStatus[] = ['to-read', 'reading', 'paused', 'completed', 'dnf'];
export const GENDERS: Gender[] = ['male', 'female', 'other', 'prefer-not-to-say'];

export const USER_SORT_OPTIONS: UserSortOption[] = [
  { field: 'name', label: 'Name', direction: 'asc' },
  { field: 'email', label: 'Email', direction: 'asc' },
  { field: 'createdAt', label: 'Join Date', direction: 'desc' },
  { field: 'lastActiveAt', label: 'Last Active', direction: 'desc' },
  
];

export const DEFAULT_USER_PREFERENCES: Partial<UserPreferences> = {
  emailNotifications: true,
  pushNotifications: true,
  newsletter: false,
  profileVisibility: 'public',
  theme: 'system',
  fontSize: 'medium',
  language: 'English',
  timeFormat: '12h'
};

// ============================================
// User Validation Types
// ============================================

export interface UserValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

export interface UsernameAvailability {
  available: boolean;
  suggestions?: string[];
  message?: string;
}

export interface EmailAvailability {
  available: boolean;
  message?: string;
}

// ============================================
// User Permissions
// ============================================

export interface UserPermissions {
  canReview: boolean;
  canComment: boolean;
  canLike: boolean;
  canFollow: boolean;
  canBookmark: boolean;
  canCreateLists: boolean;
  canEditProfile: boolean;
  canDeleteAccount: boolean;
  canManageOwnContent: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canAccessAdmin: boolean;
}

export const getDefaultPermissions = (role: UserRole): UserPermissions => {
  const basePermissions = {
    canReview: true,
    canComment: true,
    canLike: true,
    canFollow: true,
    canBookmark: true,
    canCreateLists: true,
    canEditProfile: true,
    canDeleteAccount: true,
    canManageOwnContent: true,
  };

  switch (role) {
    case 'Admin':
      return {
        ...basePermissions,
        canModerateContent: true,
        canManageUsers: true,
        canAccessAdmin: true,
      };
    case 'Moderator':
      return {
        ...basePermissions,
        canModerateContent: true,
        canManageUsers: false,
        canAccessAdmin: true,
      };
    default:
      return {
        ...basePermissions,
        canModerateContent: false,
        canManageUsers: false,
        canAccessAdmin: false,
      };
  }
};