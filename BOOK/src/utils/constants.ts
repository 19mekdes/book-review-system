// ============================================
// Application Constants
// ============================================

// ❌ Remove this line:
// import process from "process";

export const APP_NAME = 'Book Review System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Discover and share reviews about your favorite books';
export const COMPANY_NAME = 'Book Review Inc.';
export const SUPPORT_EMAIL = 'support@bookreview.com';
export const WEBSITE_URL = 'https://bookreview.com';

// ============================================
// API Configuration
// ============================================

// ✅ Use import.meta.env instead of process.env
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_COUNT = 3;
export const API_RETRY_DELAY = 1000; // 1 second

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: (id: number) => `/users/${id}`,
    BOOKMARKS: '/users/bookmarks',
    LIKES: '/users/likes',
    READING_LIST: '/users/reading-list',
    FOLLOWERS: (id: number) => `/users/${id}/followers`,
    FOLLOWING: (id: number) => `/users/${id}/following`,
    ACTIVITY: (id: number) => `/users/${id}/activity`,
    STATS: (id: number) => `/users/${id}/stats`,
  },
  
  // Book endpoints
  BOOKS: {
    BASE: '/books',
    DETAILS: (id: number) => `/books/${id}`,
    POPULAR: '/books/popular',
    FEATURED: '/books/featured',
    RECENT: '/books/recent',
    SEARCH: '/books/search',
    BY_CATEGORY: (id: number) => `/books/category/${id}`,
    BY_AUTHOR: (author: string) => `/books/author/${author}`,
    REVIEWS: (id: number) => `/books/${id}/reviews`,
    SIMILAR: (id: number) => `/books/${id}/similar`,
  },
  
  // Review endpoints
  REVIEWS: {
    BASE: '/reviews',
    DETAILS: (id: number) => `/reviews/${id}`,
    LATEST: '/reviews/latest',
    POPULAR: '/reviews/popular',
    BY_USER: (id: number) => `/reviews/user/${id}`,
    BY_BOOK: (id: number) => `/reviews/book/${id}`,
    HELPFUL: (id: number) => `/reviews/${id}/helpful`,
    REPORT: (id: number) => `/reviews/${id}/report`,
  },
  
  // Category endpoints
  CATEGORIES: {
    BASE: '/categories',
    DETAILS: (id: number) => `/categories/${id}`,
    BOOKS: (id: number) => `/categories/${id}/books`,
    STATS: '/categories/stats',
    TREE: '/categories/tree',
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKS: '/admin/books',
    REVIEWS: '/admin/reviews',
    CATEGORIES: '/admin/categories',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    STATS: '/admin/stats',
  },
} as const;

// ============================================
// Pagination Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];
export const MAX_PAGE_SIZE = 100;
export const INFINITE_SCROLL_THRESHOLD = 0.8;

// ============================================
// Book Constants
// ============================================

export const BOOK_FORMATS = {
  PAPERBACK: 'paperback',
  HARDCOVER: 'hardcover',
  EBOOK: 'ebook',
  AUDIOBOOK: 'audiobook',
} as const;

export const BOOK_FORMAT_LABELS = {
  [BOOK_FORMATS.PAPERBACK]: 'Paperback',
  [BOOK_FORMATS.HARDCOVER]: 'Hardcover',
  [BOOK_FORMATS.EBOOK]: 'E-Book',
  [BOOK_FORMATS.AUDIOBOOK]: 'Audiobook',
} as const;

export const BOOK_FORMAT_ICONS = {
  [BOOK_FORMATS.PAPERBACK]: '📖',
  [BOOK_FORMATS.HARDCOVER]: '📚',
  [BOOK_FORMATS.EBOOK]: '📱',
  [BOOK_FORMATS.AUDIOBOOK]: '🎧',
} as const;

export const BOOK_STATUSES = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  PENDING: 'pending',
} as const;

export const BOOK_STATUS_LABELS = {
  [BOOK_STATUSES.PUBLISHED]: 'Published',
  [BOOK_STATUSES.DRAFT]: 'Draft',
  [BOOK_STATUSES.ARCHIVED]: 'Archived',
  [BOOK_STATUSES.PENDING]: 'Pending',
} as const;

export const BOOK_STATUS_COLORS = {
  [BOOK_STATUSES.PUBLISHED]: 'success',
  [BOOK_STATUSES.DRAFT]: 'warning',
  [BOOK_STATUSES.ARCHIVED]: 'error',
  [BOOK_STATUSES.PENDING]: 'info',
} as const;

export const BOOK_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Turkish',
  'Dutch',
  'Polish',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
] as const;

// ============================================
// Review Constants
// ============================================

export const REVIEW_STATUSES = {
  APPROVED: 'approved',
  PENDING: 'pending',
  FLAGGED: 'flagged',
  REJECTED: 'rejected',
  SPAM: 'spam',
} as const;

export const REVIEW_STATUS_LABELS = {
  [REVIEW_STATUSES.APPROVED]: 'Approved',
  [REVIEW_STATUSES.PENDING]: 'Pending',
  [REVIEW_STATUSES.FLAGGED]: 'Flagged',
  [REVIEW_STATUSES.REJECTED]: 'Rejected',
  [REVIEW_STATUSES.SPAM]: 'Spam',
} as const;

export const REVIEW_STATUS_COLORS = {
  [REVIEW_STATUSES.APPROVED]: 'success',
  [REVIEW_STATUSES.PENDING]: 'warning',
  [REVIEW_STATUSES.FLAGGED]: 'error',
  [REVIEW_STATUSES.REJECTED]: 'error',
  [REVIEW_STATUSES.SPAM]: 'error',
} as const;

export const REVIEW_FLAG_REASONS = [
  'spam',
  'inappropriate',
  'offensive',
  'copyright',
  'spoiler',
  'irrelevant',
  'other',
] as const;

export const REVIEW_FLAG_REASON_LABELS = {
  spam: 'Spam or advertising',
  inappropriate: 'Inappropriate content',
  offensive: 'Offensive language',
  copyright: 'Copyright violation',
  spoiler: 'Contains spoilers',
  irrelevant: 'Irrelevant content',
  other: 'Other',
} as const;

// ============================================
// User Constants
// ============================================

export const USER_ROLES = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  USER: 'User',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MODERATOR]: 'Moderator',
  [USER_ROLES.USER]: 'User',
} as const;

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.INACTIVE]: 'Inactive',
  [USER_STATUSES.SUSPENDED]: 'Suspended',
  [USER_STATUSES.BANNED]: 'Banned',
  [USER_STATUSES.PENDING]: 'Pending',
} as const;

export const USER_STATUS_COLORS = {
  [USER_STATUSES.ACTIVE]: 'success',
  [USER_STATUSES.INACTIVE]: 'default',
  [USER_STATUSES.SUSPENDED]: 'warning',
  [USER_STATUSES.BANNED]: 'error',
  [USER_STATUSES.PENDING]: 'info',
} as const;

export const ACCOUNT_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  GITHUB: 'github',
  TWITTER: 'twitter',
} as const;

export const ACCOUNT_PROVIDER_ICONS = {
  [ACCOUNT_PROVIDERS.LOCAL]: '📧',
  [ACCOUNT_PROVIDERS.GOOGLE]: 'G',
  [ACCOUNT_PROVIDERS.FACEBOOK]: 'f',
  [ACCOUNT_PROVIDERS.GITHUB]: '🐙',
  [ACCOUNT_PROVIDERS.TWITTER]: '🐦',
} as const;

// ============================================
// Reading List Constants
// ============================================

export const READING_STATUSES = {
  TO_READ: 'to-read',
  READING: 'reading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  DNF: 'dnf',
} as const;

export const READING_STATUS_LABELS = {
  [READING_STATUSES.TO_READ]: 'To Read',
  [READING_STATUSES.READING]: 'Currently Reading',
  [READING_STATUSES.PAUSED]: 'Paused',
  [READING_STATUSES.COMPLETED]: 'Completed',
  [READING_STATUSES.DNF]: 'Did Not Finish',
} as const;

export const READING_STATUS_COLORS = {
  [READING_STATUSES.TO_READ]: 'info',
  [READING_STATUSES.READING]: 'warning',
  [READING_STATUSES.PAUSED]: 'default',
  [READING_STATUSES.COMPLETED]: 'success',
  [READING_STATUSES.DNF]: 'error',
} as const;

// ============================================
// Notification Constants
// ============================================

export const NOTIFICATION_TYPES = {
  REVIEW_REPLY: 'review_reply',
  COMMENT_REPLY: 'comment_reply',
  LIKE: 'like',
  FOLLOW: 'follow',
  BADGE: 'badge',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITIES.LOW]: 'info',
  [NOTIFICATION_PRIORITIES.MEDIUM]: 'primary',
  [NOTIFICATION_PRIORITIES.HIGH]: 'warning',
  [NOTIFICATION_PRIORITIES.URGENT]: 'error',
} as const;

// ============================================
// Date/Time Constants
// ============================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_FULL: 'MMM dd, yyyy h:mm a',
  DISPLAY_FULL_LONG: 'MMMM dd, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  ISO_FULL: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  API: 'yyyy-MM-dd',
  API_FULL: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  FILENAME: 'yyyy-MM-dd_HH-mm-ss',
  YEAR_MONTH: 'yyyy-MM',
  MONTH_DAY: 'MMM dd',
  DAY: 'dd',
  MONTH: 'MMM',
  YEAR: 'yyyy',
} as const;

export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
  REVIEW: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 5000,
  },
} as const;

// ============================================
// File Upload Constants
// ============================================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_READABLE = '5MB';
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const ALLOWED_IMPORT_TYPES = ['.csv', '.xlsx', '.xls', '.json'];

// ============================================
// Theme Constants
// ============================================

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const COLOR_SCHEMES = {
  BLUE: 'blue',
  PURPLE: 'purple',
  GREEN: 'green',
  ORANGE: 'orange',
  RED: 'red',
} as const;

export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

// ============================================
// Local Storage Keys
// ============================================

export const STORAGE_KEYS = {
  THEME: 'theme',
  VIEW_MODE: 'viewMode',
  AUTH_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SETTINGS: 'settings',
  BOOKMARKS: 'bookmarks',
  READING_LIST: 'readingList',
  RECENT_SEARCHES: 'recentSearches',
  NOTIFICATIONS: 'notifications',
} as const;

// ============================================
// Route Constants
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  BOOKS: '/books',
  BOOK_DETAILS: (id: number) => `/books/${id}`,
  REVIEWS: '/reviews',
  REVIEW_DETAILS: (id: number) => `/reviews/${id}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAILS: (id: number) => `/categories/${id}`,
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  MY_REVIEWS: '/profile/reviews',
  READING_LIST: '/profile/reading-list',
  SETTINGS: '/settings',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    BOOKS: '/admin/books',
    REVIEWS: '/admin/reviews',
    CATEGORIES: '/admin/categories',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
} as const;

// ============================================
// Social Media Links
// ============================================

export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/bookreview',
  FACEBOOK: 'https://facebook.com/bookreview',
  INSTAGRAM: 'https://instagram.com/bookreview',
  GITHUB: 'https://github.com/bookreview',
  LINKEDIN: 'https://linkedin.com/company/bookreview',
} as const;

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  MAINTENANCE: 'The system is under maintenance. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_IN_USE: 'This email is already registered.',
  USERNAME_TAKEN: 'This username is already taken.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password does not meet security requirements.',
  BOOK_NOT_FOUND: 'Book not found.',
  REVIEW_NOT_FOUND: 'Review not found.',
  CATEGORY_NOT_FOUND: 'Category not found.',
  USER_NOT_FOUND: 'User not found.',
  ALREADY_REVIEWED: 'You have already reviewed this book.',
  ALREADY_BOOKMARKED: 'This book is already in your bookmarks.',
  ALREADY_IN_LIST: 'This book is already in your reading list.',
} as const;

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  REVIEW_ADDED: 'Review added successfully!',
  REVIEW_UPDATED: 'Review updated successfully!',
  REVIEW_DELETED: 'Review deleted successfully!',
  BOOK_ADDED: 'Book added successfully!',
  BOOK_UPDATED: 'Book updated successfully!',
  BOOK_DELETED: 'Book deleted successfully!',
  CATEGORY_ADDED: 'Category added successfully!',
  CATEGORY_UPDATED: 'Category updated successfully!',
  CATEGORY_DELETED: 'Category deleted successfully!',
  BOOKMARK_ADDED: 'Book added to bookmarks!',
  BOOKMARK_REMOVED: 'Book removed from bookmarks!',
  LIKE_ADDED: 'Like added!',
  LIKE_REMOVED: 'Like removed!',
  READING_LIST_UPDATED: 'Reading list updated!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  REPORT_SUBMITTED: 'Report submitted successfully!',
} as const;

// ============================================
// Chart Colors
// ============================================

export const CHART_COLORS = [
  '#1976d2', // primary
  '#4caf50', // success
  '#ff9800', // warning
  '#f44336', // error
  '#9c27b0', // purple
  '#00bcd4', // cyan
  '#795548', // brown
  '#607d8b', // blue grey
  '#e91e63', // pink
  '#3f51b5', // indigo
] as const;

export const CHART_COLOR_SCHEMES = {
  PRIMARY: ['#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9'],
  SUCCESS: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
  WARNING: ['#ff9800', '#ffb74d', '#ffcc80', '#ffe0b2', '#fff3e0'],
  ERROR: ['#f44336', '#ef5350', '#e57373', '#ef9a9a', '#ffcdd2'],
  CATEGORICAL: ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'],
} as const;

// ============================================
// Export Constants
// ============================================

export const EXPORT_FORMATS = {
  CSV: 'csv',
  PDF: 'pdf',
  EXCEL: 'excel',
  JSON: 'json',
} as const;

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.CSV]: 'CSV',
  [EXPORT_FORMATS.PDF]: 'PDF',
  [EXPORT_FORMATS.EXCEL]: 'Excel',
  [EXPORT_FORMATS.JSON]: 'JSON',
} as const;

// ============================================
// Report Types
// ============================================

export const REPORT_TYPES = {
  USERS: 'users',
  BOOKS: 'books',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
  ENGAGEMENT: 'engagement',
  REVENUE: 'revenue',
} as const;

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.USERS]: 'Users Report',
  [REPORT_TYPES.BOOKS]: 'Books Report',
  [REPORT_TYPES.REVIEWS]: 'Reviews Report',
  [REPORT_TYPES.CATEGORIES]: 'Categories Report',
  [REPORT_TYPES.ENGAGEMENT]: 'Engagement Report',
  [REPORT_TYPES.REVENUE]: 'Revenue Report',
} as const;

export const REPORT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
} as const;

export const REPORT_PERIOD_LABELS = {
  [REPORT_PERIODS.DAILY]: 'Daily',
  [REPORT_PERIODS.WEEKLY]: 'Weekly',
  [REPORT_PERIODS.MONTHLY]: 'Monthly',
  [REPORT_PERIODS.QUARTERLY]: 'Quarterly',
  [REPORT_PERIODS.YEARLY]: 'Yearly',
  [REPORT_PERIODS.CUSTOM]: 'Custom Range',
} as const;

// ============================================
// Default Values
// ============================================

export const DEFAULT_VALUES = {
  RATING: 0,
  PAGE: 1,
  LIMIT: 10,
  VIEW_MODE: 'grid',
  THEME: 'system',
  LANGUAGE: 'English',
  CURRENCY: 'USD',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  DEBOUNCE_DELAY: 500,
  THROTTLE_DELAY: 1000,
  TOAST_DURATION: 4000,
  SNACKBAR_DURATION: 4000,
  ANIMATION_DURATION: 300,
  MODAL_TRANSITION: 225,
} as const;

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
  SOCIAL_LOGIN: true,
  TWO_FACTOR: true,
  READING_GOALS: true,
  BADGES: true,
  FOLLOW_SYSTEM: true,
  BOOKMARKS: true,
  LIKES: true,
  SHARING: true,
  REPORTS: true,
  ADMIN_PANEL: true,
  EXPORT_DATA: true,
  IMPORT_DATA: true,
  DARK_MODE: true,
  NEWSLETTER: true,
} as const;

// ============================================
// Analytics Events
// ============================================

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  LOGIN: 'login',
  REGISTER: 'register',
  LOGOUT: 'logout',
  SEARCH: 'search',
  VIEW_BOOK: 'view_book',
  VIEW_REVIEW: 'view_review',
  CREATE_REVIEW: 'create_review',
  UPDATE_REVIEW: 'update_review',
  DELETE_REVIEW: 'delete_review',
  LIKE_BOOK: 'like_book',
  BOOKMARK_BOOK: 'bookmark_book',
  ADD_TO_LIST: 'add_to_list',
  SHARE: 'share',
  REPORT: 'report',
  FILTER: 'filter',
  SORT: 'sort',
  PAGINATE: 'paginate',
  ERROR: 'error',
} as const;