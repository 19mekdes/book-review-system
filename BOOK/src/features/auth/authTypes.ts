

export type UserRole = 'Admin' | 'Moderator' | 'User';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'banned';
export type UserVerificationStatus = 'verified' | 'unverified' | 'pending';
export type AccountProvider = 'local' | 'google' | 'facebook' | 'github' | 'twitter';

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
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
  interests?: string[];
  
  // Statistics
  stats: UserStats;
  badges: Badge[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastActiveAt: string;
  lastLoginIp?: string;
  loginCount: number;
  
  // Social links
  socialLinks?: SocialLinks;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  newsletter: boolean;
  emailFrequency: 'instant' | 'daily' | 'weekly' | 'never';
  privacyLevel: 'public' | 'followers' | 'private';
  showOnlineStatus: boolean;
  showActivity: boolean;
}

export interface UserStats {
  reviewsCount: number;
  booksReviewed: number;
  averageRating: number;
  totalLikes: number;
  totalDislikes: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  followersCount: number;
  followingCount: number;
  readingGoal?: number;
  readingProgress?: number;
  badgesCount: number;
  streak: number; // Days in a row active
  longestStreak: number;
  contributionRank?: number;
  totalReadingTime?: number; // In minutes
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reviewer' | 'contributor' | 'expert' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  awardedAt: string;
  progress?: number;
  totalRequired?: number;
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
}



export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
  backupCode?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  interests?: string[];
  newsletter?: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface SocialAuthData {
  provider: 'google' | 'facebook' | 'github' | 'twitter';
  token: string;
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
    requiresTwoFactor?: boolean;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// ============================================
// Password Management Types
// ============================================

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  suggestions: string[];
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

// ============================================
// Two-Factor Authentication Types
// ============================================

export interface TwoFactorSetupResponse {
  qrCode: string; // Base64 or data URL
  secret: string;
  backupCodes: string[];
  uri: string;
}

export interface TwoFactorVerifyData {
  token: string;
  code: string;
  trustDevice?: boolean;
}

export interface TwoFactorDisableData {
  password: string;
  code?: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  backupCodesCount: number;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastUsed: string;
  createdAt: string;
  expiresAt: string;
}

// ============================================
// Session Management Types
// ============================================

export interface Session {
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

// ============================================
// Profile Management Types
// ============================================

export interface UpdateProfileData {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: File | string;
  location?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  website?: string;
  socialLinks?: Partial<SocialLinks>;
  interests?: string[];
}

export interface UpdatePreferencesData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  darkMode?: boolean;
  language?: string;
  timezone?: string;
  newsletter?: boolean;
  emailFrequency?: 'instant' | 'daily' | 'weekly' | 'never';
  privacyLevel?: 'public' | 'followers' | 'private';
  showOnlineStatus?: boolean;
  showActivity?: boolean;
}

export interface AvatarUploadResponse {
  avatarUrl: string;
  thumbnailUrl?: string;
}

// ============================================
// Email Verification Types
// ============================================

export interface VerifyEmailData {
  token: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
}

// ============================================
// Account Types
// ============================================

export interface DeleteAccountData {
  password: string;
  confirmReason?: string;
  feedback?: string;
}

export interface AccountRecoveryData {
  email: string;
}

export interface AccountActivity {
  id: number;
  userId: number;
  action: 'login' | 'logout' | 'password_change' | 'email_change' | 'profile_update' | 'two_factor_enable' | 'two_factor_disable' | 'session_revoke';
  details: string;
  ipAddress: string;
  location?: string;
  device?: string;
  browser?: string;
  os?: string;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
}

// ============================================
// Validation Types
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FieldAvailability {
  available: boolean;
  suggestions?: string[];
  message?: string;
}

export interface UsernameValidation {
  valid: boolean;
  available: boolean;
  suggestions?: string[];
  errors?: string[];
}

export interface EmailValidation {
  valid: boolean;
  available: boolean;
  errors?: string[];
}

// ============================================
// Security Types
// ============================================

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  trustedDevices: TrustedDevice[];
  activeSessions: Session[];
  loginHistory: LoginHistory[];
  recentActivity: AccountActivity[];
  securityScore: number; // 0-100
  securityAlerts: SecurityAlert[];
}

export interface SecurityAlert {
  id: string;
  type: 'new_device' | 'new_location' | 'failed_login' | 'password_changed' | 'email_changed' | 'two_factor_changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  read: boolean;
  acknowledged?: boolean;
  ipAddress?: string;
  location?: string;
  device?: string;
}

// ============================================
// API Response Types
// ============================================

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp?: string;
    requestId?: string;
  };
}

export interface AuthApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
  timestamp: string;
  path?: string;
}

// ============================================
// JWT Token Types
// ============================================

export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti?: string; // JWT ID
}

export type JwtDecoded = JwtPayload

// ============================================
// OAuth Types
// ============================================

export interface OAuthProvider {
  id: 'google' | 'facebook' | 'github' | 'twitter';
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
}

// ============================================
// Permission Types
// ============================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// ============================================
// Notification Types
// ============================================

export interface AuthNotification {
  id: string;
  type: 'email_verified' | 'password_changed' | 'two_factor_enabled' | 'two_factor_disabled' | 'new_login' | 'account_locked' | 'account_unlocked';
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
}

// ============================================
// Constants
// ============================================

export const USER_ROLES: UserRole[] = ['Admin', 'Moderator', 'User'];
export const USER_STATUSES: UserStatus[] = ['active', 'suspended', 'pending', 'banned'];
export const ACCOUNT_PROVIDERS: AccountProvider[] = ['local', 'google', 'facebook', 'github', 'twitter'];
export const NOTIFICATION_FREQUENCIES = ['instant', 'daily', 'weekly', 'never'] as const;
export const PRIVACY_LEVELS = ['public', 'followers', 'private'] as const;

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '/icons/google.svg',
    color: '#DB4437',
    enabled: true
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/icons/facebook.svg',
    color: '#4267B2',
    enabled: true
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '/icons/github.svg',
    color: '#333333',
    enabled: true
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '/icons/twitter.svg',
    color: '#1DA1F2',
    enabled: false
  }
];

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  maxLength: 50
};

export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
export const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour