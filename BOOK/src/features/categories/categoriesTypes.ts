// ============================================
// Category Types
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
  metaData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CategoryWithPath extends Category {
  path: string;
  level: number;
  fullPath: string;
  breadcrumb: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
  expanded?: boolean;
  selected?: boolean;
  filtered?: boolean;
}

// ============================================
// Category Statistics Types
// ============================================

export interface CategoryStats {
  id: number;
  name: string;
  slug: string;
  
  // Book statistics
  booksCount: number;
  publishedBooks: number;
  draftBooks: number;
  archivedBooks: number;
  
  // Review statistics
  reviewsCount: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  
  // Engagement metrics
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalBookmarks: number;
  
  // Popular books
  popularBooks: Array<{
    id: number;
    title: string;
    author: string;
    coverImage?: string;
    averageRating: number;
    reviewsCount: number;
    views: number;
  }>;
  
  // Top rated books
  topRatedBooks: Array<{
    id: number;
    title: string;
    author: string;
    coverImage?: string;
    averageRating: number;
    reviewsCount: number;
  }>;
  
  // Recent books
  recentBooks: Array<{
    id: number;
    title: string;
    author: string;
    coverImage?: string;
    createdAt: string;
  }>;
  
  // Monthly trends
  monthlyTrends: Array<{
    month: string;
    booksAdded: number;
    reviewsAdded: number;
    averageRating: number;
  }>;
  
  // Top authors in category
  topAuthors: Array<{
    id: number;
    name: string;
    booksCount: number;
    averageRating: number;
  }>;
}

export interface CategoryPerformance {
  id: number;
  name: string;
  views: number;
  engagement: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeSpent: number;
  trafficSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: 'desktop' | 'mobile' | 'tablet';
    count: number;
    percentage: number;
  }>;
}

// ============================================
// Category Filter Types
// ============================================

export interface CategoryFilters {
  // Search
  search?: string;
  
  // Filter by properties
  parentId?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  hasBooks?: boolean;
  hasSubcategories?: boolean;
  
  // Date range
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  
  // Sorting
  sortBy?: 'name' | 'slug' | 'booksCount' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface CategorySortOption {
  field: keyof Category;
  label: string;
  direction: 'asc' | 'desc';
}

export interface CategoryFilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range' | 'date';
  options?: Array<{
    value: any;
    label: string;
    count?: number;
  }>;
  min?: number;
  max?: number;
}

// ============================================
// Category Form Types
// ============================================

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  color?: string;
  image?: File | string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface CategoryFormErrors {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  icon?: string;
  color?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface CategoryFormState {
  data: CategoryFormData;
  errors: CategoryFormErrors;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// ============================================
// Category API Types
// ============================================

export interface CategoriesApiResponse {
  success: boolean;
  message: string;
  data: Category[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    timestamp: string;
  };
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CategoryTreeApiResponse {
  success: boolean;
  message: string;
  data: CategoryTree[];
}

export interface CategoryStatsApiResponse {
  success: boolean;
  message: string;
  data: CategoryStats;
}

export interface CategoryPerformanceApiResponse {
  success: boolean;
  message: string;
  data: CategoryPerformance;
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  data: {
    successCount: number;
    failedCount: number;
    errors?: Array<{
      id: number;
      error: string;
    }>;
  };
}

export interface ReorderResponse {
  success: boolean;
  message: string;
  data: Category[];
}

// ============================================
// Category Selection Types
// ============================================

export interface CategorySelection {
  ids: number[];
  mode: 'include' | 'exclude';
  recursive?: boolean;
}

export interface CategoryHierarchy {
  id: number;
  name: string;
  children: CategoryHierarchy[];
  parent?: CategoryHierarchy;
  level: number;
  path: string;
}

// ============================================
// Category Import/Export Types
// ============================================

export type CategoryExportFormat = 'csv' | 'json' | 'xml' | 'pdf';
export type CategoryImportFormat = 'csv' | 'json' | 'xml';

export interface CategoryExportOptions {
  format: CategoryExportFormat;
  fields?: Array<keyof Category>;
  filters?: CategoryFilters;
  includeSubcategories?: boolean;
  includeStats?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CategoryImportData {
  categories: Array<{
    name: string;
    slug?: string;
    description?: string;
    parentName?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
  }>;
  options?: {
    updateExisting: boolean;
    createMissing: boolean;
    preserveHierarchy: boolean;
  };
}

export interface CategoryImportResult {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors?: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
  warnings?: Array<{
    row: number;
    message: string;
  }>;
}

// ============================================
// Category Breadcrumb Types
// ============================================

export interface BreadcrumbItem {
  id: number;
  name: string;
  slug: string;
  url: string;
}

export interface CategoryBreadcrumb {
  items: BreadcrumbItem[];
  current: BreadcrumbItem;
  fullPath: string;
}

// ============================================
// Category Navigation Types
// ============================================

export interface CategoryNavItem {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  url: string;
  children?: CategoryNavItem[];
  isActive?: boolean;
  isExpanded?: boolean;
  bookCount?: number;
}

export interface CategoryNavigation {
  items: CategoryNavItem[];
  flat: Record<number, CategoryNavItem>;
  maxDepth: number;
}

// ============================================
// Category Display Types
// ============================================

export type CategoryViewMode = 'grid' | 'list' | 'tree' | 'accordion';
export type CategorySortField = 'name' | 'booksCount' | 'createdAt' | 'sortOrder';

export interface CategoryDisplayOptions {
  viewMode: CategoryViewMode;
  showBookCount: boolean;
  showIcons: boolean;
  showDescriptions: boolean;
  expandDepth: number;
  sortBy: CategorySortField;
  sortOrder: 'asc' | 'desc';
}

// ============================================
// Category Event Types
// ============================================

export type CategoryEventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'moved'
  | 'reordered'
  | 'activated'
  | 'deactivated'
  | 'featured'
  | 'unfeatured';

export interface CategoryEvent {
  id: string;
  type: CategoryEventType;
  categoryId: number;
  categoryName: string;
  userId?: number;
  timestamp: string;
  data?: unknown;
  previousData?: unknown;
}

// ============================================
// Category Validation Types
// ============================================

export interface CategoryValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

export interface SlugValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  suggestions?: string[];
  message?: string;
}

// ============================================
// Category Constants
// ============================================

export const CATEGORY_SORT_OPTIONS: CategorySortOption[] = [
  { field: 'name', label: 'Name', direction: 'asc' },
  { field: 'name', label: 'Name', direction: 'desc' },
  { field: 'booksCount', label: 'Books Count', direction: 'desc' },
  { field: 'booksCount', label: 'Books Count', direction: 'asc' },
  { field: 'createdAt', label: 'Date Created', direction: 'desc' },
  { field: 'createdAt', label: 'Date Created', direction: 'asc' },
  { field: 'sortOrder', label: 'Sort Order', direction: 'asc' },
  { field: 'sortOrder', label: 'Sort Order', direction: 'desc' }
];

export const CATEGORY_VIEW_MODES: CategoryViewMode[] = ['grid', 'list', 'tree', 'accordion'];

export const CATEGORY_COLORS = [
  '#1976d2', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#f44336', '#e91e63', '#9c27b0',
  '#673ab7', '#3f51b5', '#607d8b', '#795548', '#9e9e9e'
];

export const CATEGORY_ICONS = [
  'category',
  'book',
  'menu_book',
  'library_books',
  'auto_stories',
  'bookmark',
  'bookmarks',
  'star',
  'favorite',
  'new_releases',
  'trending_up',
  'whatshot',
  'emoji_objects',
  'psychology',
  'science',
  'history',
  'travel_explore',
  'public',
  'palette',
  'music_note',
  'movie',
  'sports_esports',
  'restaurant',
  'pets',
  'spa'
];

// ============================================
// Category Chart Types
// ============================================

export interface CategoryChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface CategoryTrendData {
  date: string;
  booksAdded: number;
  reviewsAdded: number;
  averageRating: number;
  views: number;
}

export interface CategoryComparisonData {
  category: string;
  currentPeriod: number;
  previousPeriod: number;
  growth: number;
}

// ============================================
// Category Permission Types
// ============================================

export interface CategoryPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
  canAssignBooks: boolean;
  canChangeStatus: boolean;
  canReorder: boolean;
}

export interface CategoryRolePermissions {
  admin: CategoryPermissions;
  moderator: CategoryPermissions;
  editor: CategoryPermissions;
  viewer: CategoryPermissions;
}

// ============================================
// Category Activity Types
// ============================================

export interface CategoryActivity {
  id: number;
  categoryId: number;
  categoryName: string;
  userId: number;
  userName: string;
  action: CategoryEventType;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface CategoryActivityFeed {
  activities: CategoryActivity[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// Category SEO Types
// ============================================

export interface CategorySEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  schema?: Record<string, any>;
}

export interface CategorySEOAudit {
  categoryId: number;
  categoryName: string;
  seo: CategorySEO;
  score: number;
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    recommendation: string;
  }>;
}

// ============================================
// Category Cache Types
// ============================================

export interface CategoryCache {
  timestamp: number;
  data: Category[];
  tree: CategoryTree[];
  flat: Record<number, Category>;
  version: string;
}

export interface CategoryCacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of categories to cache
  staleWhileRevalidate: boolean;
}