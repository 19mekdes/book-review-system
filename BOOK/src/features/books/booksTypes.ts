// ============================================
// Book Types
// ============================================

export type BookFormat = 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
export type BookStatus = 'published' | 'draft' | 'archived' | 'pending';
export type BookLanguage = 
  | 'English' 
  | 'Spanish' 
  | 'French' 
  | 'German' 
  | 'Italian' 
  | 'Portuguese' 
  | 'Russian' 
  | 'Chinese' 
  | 'Japanese' 
  | 'Korean' 
  | 'Arabic' 
  | 'Hindi' 
  | 'Turkish' 
  | 'Dutch' 
  | 'Polish' 
  | 'Other';

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
  
  // Statistics
  reviewsCount: number;
  averageRating: number;
  views: number;
  likes: number;
  shares?: number;
  bookmarks?: number;
  
  // Metadata
  tags: string[];
  series?: string;
  seriesPosition?: number;
  awards?: string[];
  characters?: string[];
  settings?: string[];
  genres?: string[];
  
  // User interactions
  isBookmarked?: boolean;
  isLiked?: boolean;
  isInReadingList?: boolean;
  readingProgress?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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
  ebookFormat?: 'PDF' | 'EPUB' | 'MOBI';
  ebookSize?: number;
  dimensions?: string;
  weight?: number;
  edition?: string;
  illustrator?: string;
  translator?: string;
}

// ============================================
// Review Types
// ============================================

export type ReviewStatus = 'approved' | 'pending' | 'flagged' | 'rejected' | 'spam';
export type ReviewFlagReason = 'inappropriate' | 'spam' | 'offensive' | 'copyright' | 'spoiler' | 'other';

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  userRating?: number;
  userReviewsCount?: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
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
  
  // User interactions
  isHelpful?: boolean;
  isReported?: boolean;
  canModify?: boolean;
  
  // Replies
  replies?: ReviewReply[];
  repliesCount?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  id: number;
  reviewId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  isLiked?: boolean;
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
    averageRating: number;
  }>;
  topReviewers: Array<{
    userId: number;
    userName: string;
    userAvatar?: string;
    reviewCount: number;
    averageRating: number;
  }>;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  id: number;
  name: string;
  slug: string;
  booksCount: number;
  reviewsCount: number;
  averageRating: number;
  totalViews: number;
  totalLikes: number;
  popularBooks: Book[];
  topRatedBooks: Book[];
  recentBooks: Book[];
  subcategories?: Array<{
    id: number;
    name: string;
    booksCount: number;
  }>;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
  level: number;
  path: string;
}

// ============================================
// Author Types
// ============================================

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  website?: string;
  wikipedia?: string;
  photo?: string;
  booksCount: number;
  averageRating: number;
  totalReviews: number;
  genres?: string[];
  awards?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthorStats {
  id: number;
  name: string;
  booksCount: number;
  reviewsCount: number;
  averageRating: number;
  totalViews: number;
  totalLikes: number;
  popularBooks: Book[];
  topRatedBooks: Book[];
  recentBooks: Book[];
  coAuthors?: Author[];
}

// ============================================
// Filter Types
// ============================================

export interface DateRange {
  start: string | null;
  end: string | null;
}

export interface BookFilters {
  // Search
  search?: string;
  
  // Basic filters
  categoryId?: number;
  categoryIds?: number[];
  author?: string;
  authorId?: number;
  publisher?: string;
  
  // Rating filters
  minRating?: number;
  maxRating?: number;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Format filters
  format?: BookFormat[];
  
  // Language filters
  language?: BookLanguage[];
  
  // Status filters
  status?: BookStatus[];
  
  // Tag filters
  tags?: string[];
  
  // Date filters
  publishDateFrom?: string;
  publishDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  
  // Year filters
  yearFrom?: number;
  yearTo?: number;
  
  // Series filters
  series?: string;
  hasSeries?: boolean;
  
  // Feature filters
  featured?: boolean;
  hasAwards?: boolean;
  hasReviews?: boolean;
  
  // Sorting
  sortBy?: 'title' | 'author' | 'rating' | 'reviews' | 'createdAt' | 'updatedAt' | 'price' | 'popularity' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface SortOption {
  field: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  icon?: React.ReactNode;
}

// ============================================
// Reading List Types
// ============================================

export type ReadingStatus = 'to-read' | 'reading' | 'completed' | 'abandoned' | 'wishlist';

export interface ReadingListItem {
  id: number;
  userId: number;
  bookId: number;
  book: Book;
  status: ReadingStatus;
  progress: number; // 0-100
  currentPage?: number;
  totalPages?: number;
  startDate?: string;
  finishDate?: string;
  notes?: string;
  rating?: number;
  review?: Review;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingListStats {
  totalBooks: number;
  booksByStatus: Record<ReadingStatus, number>;
  totalPagesRead: number;
  totalBooksCompleted: number;
  averageRating: number;
  readingStreak: number; // days
  longestStreak: number;
  readingTime?: number; // minutes
  favoriteGenres: Array<{
    genre: string;
    count: number;
  }>;
  favoriteAuthors: Array<{
    authorId: number;
    authorName: string;
    count: number;
  }>;
}

// ============================================
// Book Collection Types
// ============================================

export interface BookCollection {
  id: number;
  userId: number;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  books: Book[];
  booksCount: number;
  followers: number;
  likes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BookCollectionStats {
  id: number;
  name: string;
  booksCount: number;
  followersCount: number;
  likesCount: number;
  averageRating: number;
  totalViews: number;
  popularBooks: Book[];
  recentBooks: Book[];
}

// ============================================
// Book Series Types
// ============================================

export interface BookSeries {
  id: number;
  name: string;
  description?: string;
  author: string;
  authorId?: number;
  books: Array<{
    book: Book;
    position: number;
  }>;
  booksCount: number;
  averageRating: number;
  totalReviews: number;
  coverImage?: string;
  genres: string[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Book Statistics Types
// ============================================

export interface BookStats {
  // Overview
  totalBooks: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalBookmarks: number;
  
  // Status breakdown
  booksByStatus: Record<BookStatus, number>;
  
  // Format breakdown
  booksByFormat: Record<BookFormat, number>;
  
  // Language breakdown
  booksByLanguage: Record<string, number>;
  
  // Category breakdown
  booksByCategory: Array<{
    categoryId: number;
    categoryName: string;
    count: number;
    averageRating: number;
    totalReviews: number;
  }>;
  
  // Author breakdown
  topAuthors: Array<{
    authorId: number;
    authorName: string;
    bookCount: number;
    averageRating: number;
  }>;
  
  // Rating distribution
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  
  // Time-based stats
  booksAddedByMonth: Array<{
    month: string;
    count: number;
  }>;
  
  reviewsByMonth: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  
  // Top books
  topRatedBooks: Book[];
  mostReviewedBooks: Book[];
  mostViewedBooks: Book[];
  mostLikedBooks: Book[];
  mostBookmarkedBooks: Book[];
  
  // Recent books
  recentBooks: Book[];
  
  // Featured books
  featuredBooks: Book[];
}

// ============================================
// Book Activity Types
// ============================================

export interface BookActivity {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  bookId: number;
  bookTitle: string;
  action: 'view' | 'like' | 'bookmark' | 'review' | 'share' | 'add_to_list' | 'remove_from_list';
  details?: string;
  timestamp: string;
}

export interface BookActivityFeed {
  activities: BookActivity[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// API Response Types
// ============================================

export interface BooksApiResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Book>;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface BookApiResponse {
  success: boolean;
  message: string;
  data: Book;
}

export interface ReviewsApiResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Review>;
}

export interface CategoriesApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CategoryStatsApiResponse {
  success: boolean;
  message: string;
  data: CategoryStats[];
}

export interface BookStatsApiResponse {
  success: boolean;
  message: string;
  data: BookStats;
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

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// ============================================
// Import/Export Types
// ============================================

export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';
export type ImportFormat = 'csv' | 'excel' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  fields?: string[];
  filters?: BookFilters;
  includeMetadata?: boolean;
  includeReviews?: boolean;
  dateRange?: DateRange;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
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
// Chart/Visualization Types
// ============================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
  bookId?: number;
  bookTitle?: string;
}

export interface DistributionData {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface ComparisonData {
  current: number;
  previous: number;
  growth: number;
  label: string;
  trend: 'up' | 'down' | 'stable';
}

// ============================================
// Constants
// ============================================

export const BOOK_FORMATS: BookFormat[] = ['paperback', 'hardcover', 'ebook', 'audiobook'];
export const BOOK_STATUSES: BookStatus[] = ['published', 'draft', 'archived', 'pending'];
export const BOOK_LANGUAGES: BookLanguage[] = [
  'English', 'Spanish', 'French', 'German', 'Italian', 
  'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Turkish', 'Dutch', 'Polish', 'Other'
];
export const REVIEW_STATUSES: ReviewStatus[] = ['approved', 'pending', 'flagged', 'rejected', 'spam'];
export const READING_STATUSES: ReadingStatus[] = ['to-read', 'reading', 'completed', 'abandoned', 'wishlist'];

export const BOOK_SORT_OPTIONS: SortOption[] = [
  { field: 'title', label: 'Title', direction: 'asc' },
  { field: 'author', label: 'Author', direction: 'asc' },
  { field: 'rating', label: 'Rating', direction: 'desc' },
  { field: 'reviews', label: 'Reviews', direction: 'desc' },
  { field: 'createdAt', label: 'Date Added', direction: 'desc' },
  { field: 'updatedAt', label: 'Last Updated', direction: 'desc' },
  { field: 'price', label: 'Price', direction: 'asc' },
  { field: 'popularity', label: 'Popularity', direction: 'desc' },
  { field: 'views', label: 'Views', direction: 'desc' },
  { field: 'likes', label: 'Likes', direction: 'desc' }
];

export const DEFAULT_BOOK_FILTERS: BookFilters = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export const BOOK_FORMAT_LABELS: Record<BookFormat, string> = {
  paperback: 'Paperback',
  hardcover: 'Hardcover',
  ebook: 'E-Book',
  audiobook: 'Audiobook'
};

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  pending: 'Pending'
};

export const BOOK_STATUS_COLORS: Record<BookStatus, string> = {
  published: '#4caf50',
  draft: '#ff9800',
  archived: '#f44336',
  pending: '#2196f3'
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  flagged: 'Flagged',
  rejected: 'Rejected',
  spam: 'Spam'
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  approved: '#4caf50',
  pending: '#ff9800',
  flagged: '#f44336',
  rejected: '#9e9e9e',
  spam: '#795548'
};

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  'to-read': 'To Read',
  'reading': 'Currently Reading',
  'completed': 'Completed',
  'abandoned': 'Abandoned',
  'wishlist': 'Wishlist'
};

export const READING_STATUS_COLORS: Record<ReadingStatus, string> = {
  'to-read': '#2196f3',
  'reading': '#4caf50',
  'completed': '#9c27b0',
  'abandoned': '#f44336',
  'wishlist': '#ff9800'
};