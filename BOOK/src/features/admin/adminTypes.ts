export type UserRole = 'Admin' | 'Moderator' | 'User';
export type UserStatus = 'active' | 'suspended' | 'pending' | 'banned';
export type UserVerificationStatus = 'verified' | 'unverified' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastActive: string;
  reviewsCount: number;
  averageRating: number;
  booksReviewed: number;
  followers: number;
  following: number;
  emailVerified: boolean;
  verificationStatus: UserVerificationStatus;
  twoFactorEnabled: boolean;
  lastLoginIp?: string;
  loginCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: 'login' | 'logout' | 'review' | 'comment' | 'like' | 'follow';
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  userId: number;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
}


export type BookStatus = 'published' | 'draft' | 'archived' | 'pending';
export type BookFormat = 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
export type BookLanguage = 'English' | 'Spanish' | 'French' | 'German' | 'Chinese' | 'Japanese' | 'Other';

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
  language: BookLanguage;
  format: BookFormat;
  price?: number;
  coverImage?: string;
  status: BookStatus;
  reviewsCount: number;
  averageRating: number;
  views: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookMetadata {
  id: number;
  bookId: number;
  keywords: string[];
  awards: string[];
  characters: string[];
  settings: string[];
  themes: string[];
  series?: string;
  seriesPosition?: number;
  audiobookLength?: number;
  audiobookNarrator?: string;
}

export interface BookReview {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  likes: number;
  dislikes: number;
  helpful: number;
  status: 'approved' | 'pending' | 'flagged' | 'rejected';
  createdAt: string;
  updatedAt: string;
}



export type ReviewStatus = 'approved' | 'pending' | 'flagged' | 'rejected' | 'spam';
export type ReviewFlagReason = 'inappropriate' | 'spam' | 'offensive' | 'copyright' | 'other';

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  helpful: number;
  notHelpful: number;
  reports: number;
  status: ReviewStatus;
  flags?: Array<{
    reason: ReviewFlagReason;
    userId: number;
    timestamp: string;
  }>;
  moderationNotes?: string;
  moderatedBy?: number;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: number;
  reviewId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  status: 'approved' | 'pending' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  reviewsByStatus: Record<ReviewStatus, number>;
  reviewsByDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  booksCount: number;
  subcategories?: Category[];
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
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
  popularBooks: Book[];
}



export interface DashboardStats {
  // Overview
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  totalCategories: number;
  
  // User metrics
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
   activeUsersCount: number;
  suspendedUsers: number;
  pendingUsers: number;
  
  // Book metrics
  newBooksToday: number;
  newBooksThisWeek: number;
  newBooksThisMonth: number;
  publishedBooks: number;
  draftBooks: number;
  archivedBooks: number;
  
  // Review metrics
  newReviewsToday: number;
  newReviewsThisWeek: number;
  newReviewsThisMonth: number;
  pendingReviews: number;
  flaggedReviews: number;
  approvedReviews: number;
  
  // Growth rates
  userGrowth: number;
  bookGrowth: number;
  reviewGrowth: number;
  
  // Recent activity
  recentUsers: User[];
  recentBooks: Book[];
  recentReviews: Review[];
  popularBooks: Book[];
  activeUsers: User[];
  
  // Statistics
  categoryStats: Array<{
    category: string;
    bookCount: number;
    reviewCount: number;
    avgRating: number;
  }>;
  
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  
  // Trends
  userTrend: Array<{
    date: string;
    count: number;
  }>;
  
  bookTrend: Array<{
    date: string;
    count: number;
  }>;
  
  reviewTrend: Array<{
    date: string;
    count: number;
  }>;
}



export type ReportType = 'users' | 'books' | 'reviews' | 'categories' | 'activity' | 'revenue';
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    total: number;
    previous: number;
    growth: number;
    average?: number;
    max?: number;
    min?: number;
  };
  chartData: unknown[];
  tableData: unknown[];
  summary: string;
  generatedBy: number;
  generatedAt: string;
  fileUrl?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  config: {
    metrics: string[];
    charts: string[];
    tables: string[];
    defaultPeriod: ReportPeriod;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AnalyticsData {
  overview: {
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  
  userAnalytics: {
    total: number;
    new: number;
    returning: number;
    byRole: Record<UserRole, number>;
    byLocation: Array<{
      country: string;
      count: number;
    }>;
  };
  
  bookAnalytics: {
    total: number;
    mostViewed: Book[];
    mostReviewed: Book[];
    highestRated: Book[];
    byCategory: Array<{
      category: string;
      count: number;
    }>;
  };
  
  reviewAnalytics: {
    total: number;
    averageRating: number;
    byRating: Array<{
      rating: number;
      count: number;
    }>;
    byStatus: Record<ReviewStatus, number>;
  };
  
  engagementAnalytics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageReviewsPerUser: number;
    averageBooksPerUser: number;
    userRetention: Array<{
      period: string;
      rate: number;
    }>;
  };
  
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  
  popularPages: Array<{
    path: string;
    views: number;
    avgTimeOnPage: number;
  }>;
}



export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
}

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface AdminFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: UserStatus | BookStatus | ReviewStatus | 'all';
  category?: number | 'all';
  dateRange?: DateRange;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  tags?: string[];
  minRating?: number;
  maxRating?: number;
  verified?: boolean;
  active?: boolean;
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  statusCode: number;
  timestamp: string;
}


export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  types: {
    userActivity: boolean;
    reviewActivity: boolean;
    systemAlerts: boolean;
    reports: boolean;
  };
}



export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  supportEmail: string;
  supportPhone?: string;
  
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    twoFactorAuth: boolean;
    socialLogin: boolean;
    reviews: boolean;
    ratings: boolean;
    comments: boolean;
  };
  
  limits: {
    maxReviewsPerDay: number;
    maxBooksPerDay: number;
    reviewMinLength: number;
    reviewMaxLength: number;
    commentMinLength: number;
    commentMaxLength: number;
  };
  
  moderation: {
    autoApproveReviews: boolean;
    flagThreshold: number;
    spamThreshold: number;
    notifyOnFlag: boolean;
  };
  
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    requireSpecialChar: boolean;
    requireNumber: boolean;
    requireUppercase: boolean;
  };
  
  appearance: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    googleAnalyticsId?: string;
    googleSiteVerification?: string;
  };
}



export type ActivityAction = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'book.created'
  | 'book.updated'
  | 'book.deleted'
  | 'review.created'
  | 'review.updated'
  | 'review.deleted'
  | 'review.moderated'
  | 'category.created'
  | 'category.updated'
  | 'category.deleted'
  | 'settings.updated'
  | 'report.generated'
  | 'export.performed';

export interface ActivityLog {
  id: string;
  userId: number;
  userName: string;
  userRole: UserRole;
  action: ActivityAction;
  entityType: 'user' | 'book' | 'review' | 'category' | 'settings' | 'report';
  entityId?: number;
  details: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}



export interface ExportConfig {
  format: ReportFormat;
  fields: string[];
  filters: AdminFilters;
  includeMetadata: boolean;
  dateRange?: DateRange;
}

export interface ExportJob {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  error?: string;
  createdBy: number;
  createdAt: string;
  completedAt?: string;
}



export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: unknown;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
}

export interface ComparisonData {
  current: number;
  previous: number;
  growth: number;
  label: string;
}

export interface DistributionData {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}