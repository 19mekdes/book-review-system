import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { booksAPI } from './booksAPI';
import { Book, Review, Category, BookFilters, PaginatedResponse } from '../../types';

// ============================================
// Types
// ============================================

export interface BooksState {
  // Books list
  books: PaginatedResponse<Book> | null;
  booksLoading: boolean;
  booksError: string | null;
  
  // Current book
  currentBook: Book | null;
  currentBookLoading: boolean;
  currentBookError: string | null;
  
  // Book reviews
  reviews: PaginatedResponse<Review> | null;
  reviewsLoading: boolean;
  reviewsError: string | null;
  
  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Category stats
  categoryStats: Array<{
    id: number;
    name: string;
    booksCount: number;
    reviewsCount: number;
    averageRating: number;
  }> | null;
  categoryStatsLoading: boolean;
  
  // Popular/Featured/Recent books
  popularBooks: Book[];
  popularBooksLoading: boolean;
  
  featuredBooks: Book[];
  featuredBooksLoading: boolean;
  
  recentBooks: Book[];
  recentBooksLoading: boolean;
  
  // Similar books
  similarBooks: Book[];
  similarBooksLoading: boolean;
  
  // User collections
  bookmarkedBooks: PaginatedResponse<Book> | null;
  bookmarkedBooksLoading: boolean;
  
  likedBooks: PaginatedResponse<Book> | null;
  likedBooksLoading: boolean;
  
  readingList: PaginatedResponse<Book> | null;
  readingListLoading: boolean;
  
  // Recommendations
  recommendations: Book[];
  recommendationsLoading: boolean;
  
  // Book statistics
  bookStats: {
    totalBooks: number;
    totalReviews: number;
    averageRating: number;
    booksByCategory: Array<{ category: string; count: number; averageRating: number }>;
    topRatedBooks: Book[];
    mostReviewedBooks: Book[];
    recentBooks: Book[];
  } | null;
  bookStatsLoading: boolean;
  
  // Filters
  filters: BookFilters;
  
  // UI State
  selectedBookIds: number[];
  viewMode: 'grid' | 'list' | 'compact';
  sortField: string;
  sortDirection: 'asc' | 'desc';
  
  // Operation status
  createBookLoading: boolean;
  updateBookLoading: boolean;
  deleteBookLoading: boolean;
  bulkOperationLoading: boolean;
  
  // Success messages
  successMessage: string | null;
}

// ============================================
// Initial State
// ============================================

const initialState: BooksState = {
  // Books list
  books: null,
  booksLoading: false,
  booksError: null,
  
  // Current book
  currentBook: null,
  currentBookLoading: false,
  currentBookError: null,
  
  // Book reviews
  reviews: null,
  reviewsLoading: false,
  reviewsError: null,
  
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  // Category stats
  categoryStats: null,
  categoryStatsLoading: false,
  
  // Popular/Featured/Recent books
  popularBooks: [],
  popularBooksLoading: false,
  
  featuredBooks: [],
  featuredBooksLoading: false,
  
  recentBooks: [],
  recentBooksLoading: false,
  
  // Similar books
  similarBooks: [],
  similarBooksLoading: false,
  
  // User collections
  bookmarkedBooks: null,
  bookmarkedBooksLoading: false,
  
  likedBooks: null,
  likedBooksLoading: false,
  
  readingList: null,
  readingListLoading: false,
  
  // Recommendations
  recommendations: [],
  recommendationsLoading: false,
  
  // Book statistics
  bookStats: null,
  bookStatsLoading: false,
  
  // Filters
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  
  // UI State
  selectedBookIds: [],
  viewMode: (localStorage.getItem('bookViewMode') as 'grid' | 'list' | 'compact') || 'grid',
  sortField: 'createdAt',
  sortDirection: 'desc',
  
  // Operation status
  createBookLoading: false,
  updateBookLoading: false,
  deleteBookLoading: false,
  bulkOperationLoading: false,
  
  // Success messages
  successMessage: null
};

// ============================================
// Async Thunks
// ============================================

// Get books with filters
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params?: BookFilters, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBooks(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch books');
    }
  }
);

// Get book by ID
export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch book');
    }
  }
);

// Get book by slug
export const fetchBookBySlug = createAsyncThunk(
  'books/fetchBookBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookBySlug(slug);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch book');
    }
  }
);

// Create book
export const createBook = createAsyncThunk(
  'books/createBook',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await booksAPI.createBook(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create book');
    }
  }
);

// Update book
export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.updateBook(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update book');
    }
  }
);

// Delete book
export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id: number, { rejectWithValue }) => {
    try {
      await booksAPI.deleteBook(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete book');
    }
  }
);

// Bulk delete books
export const bulkDeleteBooks = createAsyncThunk(
  'books/bulkDeleteBooks',
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await booksAPI.bulkDeleteBooks(ids);
      return { ids, count: response.deletedCount };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete books');
    }
  }
);

// Bulk update status
export const bulkUpdateStatus = createAsyncThunk(
  'books/bulkUpdateStatus',
  async ({ ids, status }: { ids: number[]; status: Book['status'] }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.bulkUpdateStatus(ids, status);
      return { ids, status, count: response.updatedCount };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update books');
    }
  }
);

// Get popular books
export const fetchPopularBooks = createAsyncThunk(
  'books/fetchPopularBooks',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getPopularBooks(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch popular books');
    }
  }
);

// Get featured books
export const fetchFeaturedBooks = createAsyncThunk(
  'books/fetchFeaturedBooks',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getFeaturedBooks(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured books');
    }
  }
);

// Get recent books
export const fetchRecentBooks = createAsyncThunk(
  'books/fetchRecentBooks',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getRecentBooks(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent books');
    }
  }
);

// Get books by category
export const fetchBooksByCategory = createAsyncThunk(
  'books/fetchBooksByCategory',
  async ({ categoryId, params }: { categoryId: number; params?: BookFilters }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBooksByCategory(categoryId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch books by category');
    }
  }
);

// Get books by author
export const fetchBooksByAuthor = createAsyncThunk(
  'books/fetchBooksByAuthor',
  async ({ author, params }: { author: string; params?: BookFilters }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBooksByAuthor(author, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch books by author');
    }
  }
);

// Search books
export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async ({ query, params }: { query: string; params?: BookFilters }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.searchBooks(query, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search books');
    }
  }
);

// Get book stats
export const fetchBookStats = createAsyncThunk(
  'books/fetchBookStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch book stats');
    }
  }
);

// Get book reviews
export const fetchBookReviews = createAsyncThunk(
  'books/fetchBookReviews',
  async ({ bookId, params }: { bookId: number; params?: { page?: number; limit?: number; sortBy?: string } }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookReviews(bookId, params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reviews');
    }
  }
);

// Add review
export const addReview = createAsyncThunk(
  'books/addReview',
  async ({ bookId, data }: { bookId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.addReview(bookId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add review');
    }
  }
);

// Update review
export const updateReview = createAsyncThunk(
  'books/updateReview',
  async ({ bookId, reviewId, data }: { bookId: number; reviewId: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.updateReview(bookId, reviewId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update review');
    }
  }
);

// Delete review
export const deleteReview = createAsyncThunk(
  'books/deleteReview',
  async ({ bookId, reviewId }: { bookId: number; reviewId: number }, { rejectWithValue }) => {
    try {
      await booksAPI.deleteReview(bookId, reviewId);
      return reviewId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete review');
    }
  }
);

// Mark review as helpful
export const markReviewHelpful = createAsyncThunk(
  'books/markReviewHelpful',
  async ({ bookId, reviewId }: { bookId: number; reviewId: number }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.markReviewHelpful(bookId, reviewId);
      return { reviewId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark review as helpful');
    }
  }
);

// Report review
export const reportReview = createAsyncThunk(
  'books/reportReview',
  async ({ bookId, reviewId, reason }: { bookId: number; reviewId: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.reportReview(bookId, reviewId, reason);
      return { reviewId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to report review');
    }
  }
);

// Get categories
export const fetchCategories = createAsyncThunk(
  'books/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

// Get category stats
export const fetchCategoryStats = createAsyncThunk(
  'books/fetchCategoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getCategoryStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category stats');
    }
  }
);

// Create category
export const createCategory = createAsyncThunk(
  'books/createCategory',
  async ({ name, description }: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.createCategory(name, description);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create category');
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  'books/updateCategory',
  async ({ id, data }: { id: number; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.updateCategory(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update category');
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  'books/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      await booksAPI.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete category');
    }
  }
);

// Bookmark book
export const bookmarkBook = createAsyncThunk(
  'books/bookmarkBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.bookmarkBook(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to bookmark book');
    }
  }
);

// Unbookmark book
export const unbookmarkBook = createAsyncThunk(
  'books/unbookmarkBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.unbookmarkBook(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unbookmark book');
    }
  }
);

// Get bookmarked books
export const fetchBookmarkedBooks = createAsyncThunk(
  'books/fetchBookmarkedBooks',
  async (params?: BookFilters, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getBookmarkedBooks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bookmarked books');
    }
  }
);

// Like book
export const likeBook = createAsyncThunk(
  'books/likeBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.likeBook(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like book');
    }
  }
);

// Unlike book
export const unlikeBook = createAsyncThunk(
  'books/unlikeBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.unlikeBook(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unlike book');
    }
  }
);

// Get liked books
export const fetchLikedBooks = createAsyncThunk(
  'books/fetchLikedBooks',
  async (params?: BookFilters, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getLikedBooks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch liked books');
    }
  }
);

// Add to reading list
export const addToReadingList = createAsyncThunk(
  'books/addToReadingList',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.addToReadingList(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to reading list');
    }
  }
);

// Remove from reading list
export const removeFromReadingList = createAsyncThunk(
  'books/removeFromReadingList',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await booksAPI.removeFromReadingList(bookId);
      return { bookId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from reading list');
    }
  }
);

// Get reading list
export const fetchReadingList = createAsyncThunk(
  'books/fetchReadingList',
  async (params?: BookFilters, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getReadingList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reading list');
    }
  }
);

// Get similar books
export const fetchSimilarBooks = createAsyncThunk(
  'books/fetchSimilarBooks',
  async ({ bookId, limit }: { bookId: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getSimilarBooks(bookId, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch similar books');
    }
  }
);

// Get recommendations
export const fetchRecommendations = createAsyncThunk(
  'books/fetchRecommendations',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await booksAPI.getRecommendations(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recommendations');
    }
  }
);

// Export books
export const exportBooks = createAsyncThunk(
  'books/exportBooks',
  async ({ format, filters }: { format: 'csv' | 'pdf' | 'excel'; filters?: BookFilters }, { rejectWithValue }) => {
    try {
      const blob = await booksAPI.exportBooks(format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `books.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, format };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to export books');
    }
  }
);

// Helper function to extract books from API response
const extractBooksFromResponse = (payload: any): PaginatedResponse<Book> | null => {
  if (!payload) return null;
  
  console.log('Extracting books from payload:', payload);
  
  // Case 1: Our API format with success and data wrapper
  if (payload.success && payload.data) {
    const data = payload.data;
    
    // Check if data has books array
    if (data.books && Array.isArray(data.books)) {
      return {
        data: data.books,
        total: data.total || data.books.length,
        page: data.page || 1,
        limit: data.limit || 12,
        totalPages: data.totalPages || 1
      };
    }
    
    // If data itself is an array
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      };
    }
  }
  
  // Case 2: Direct response with books array
  if (payload.books && Array.isArray(payload.books)) {
    return {
      data: payload.books,
      total: payload.total || payload.books.length,
      page: payload.page || 1,
      limit: payload.limit || 12,
      totalPages: payload.totalPages || 1
    };
  }
  
  // Case 3: Array response
  if (Array.isArray(payload)) {
    return {
      data: payload,
      total: payload.length,
      page: 1,
      limit: payload.length,
      totalPages: 1
    };
  }
  
  // Case 4: Data with results array (like MongoDB)
  if (payload.results && Array.isArray(payload.results)) {
    return {
      data: payload.results,
      total: payload.total || payload.results.length,
      page: payload.page || 1,
      limit: payload.limit || 12,
      totalPages: payload.totalPages || 1
    };
  }
  
  return null;
};

// ============================================
// Books Slice
// ============================================

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.booksError = null;
      state.currentBookError = null;
      state.reviewsError = null;
      state.categoriesError = null;
    },
    
    // Clear success messages
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<BookFilters>>) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    
    // Set page
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    
    // Set limit
    setLimit: (state, action: PayloadAction<number>) => {
      state.filters.limit = action.payload;
      state.filters.page = 1;
    },
    
    // Set sort
    setSort: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>) => {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
      state.filters.sortBy = action.payload.field as any;
      state.filters.sortOrder = action.payload.direction;
    },
    
    // Set view mode
    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'compact'>) => {
      state.viewMode = action.payload;
      localStorage.setItem('bookViewMode', action.payload);
    },
    
    // Select book
    selectBook: (state, action: PayloadAction<number>) => {
      if (!state.selectedBookIds.includes(action.payload)) {
        state.selectedBookIds.push(action.payload);
      }
    },
    
    // Deselect book
    deselectBook: (state, action: PayloadAction<number>) => {
      state.selectedBookIds = state.selectedBookIds.filter(id => id !== action.payload);
    },
    
    // Select all books
    selectAllBooks: (state) => {
      if (state.books) {
        state.selectedBookIds = state.books.data.map(book => book.id);
      }
    },
    
    // Deselect all books
    deselectAllBooks: (state) => {
      state.selectedBookIds = [];
    },
    
    // Clear current book
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
    
    // Clear reviews
    clearReviews: (state) => {
      state.reviews = null;
    }
  },
  extraReducers: (builder) => {
    // ============================================
    // Fetch Books
    // ============================================
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.booksLoading = false;
        
        // Extract books from the response
        const booksData = extractBooksFromResponse(action.payload);
        
        if (booksData) {
          state.books = booksData;
          console.log('Books loaded:', booksData.data.length);
        } else {
          console.warn('Could not extract books from payload:', action.payload);
          state.books = null;
        }
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Fetch Book By ID
    // ============================================
    builder
      .addCase(fetchBookById.pending, (state) => {
        state.currentBookLoading = true;
        state.currentBookError = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.currentBookLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.currentBookLoading = false;
        state.currentBookError = action.payload as string;
      })

    // ============================================
    // Fetch Book By Slug
    // ============================================
    builder
      .addCase(fetchBookBySlug.pending, (state) => {
        state.currentBookLoading = true;
        state.currentBookError = null;
      })
      .addCase(fetchBookBySlug.fulfilled, (state, action) => {
        state.currentBookLoading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookBySlug.rejected, (state, action) => {
        state.currentBookLoading = false;
        state.currentBookError = action.payload as string;
      })

    // ============================================
    // Create Book
    // ============================================
    builder
      .addCase(createBook.pending, (state) => {
        state.createBookLoading = true;
        state.booksError = null;
        state.successMessage = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.createBookLoading = false;
        if (state.books) {
          state.books.data.unshift(action.payload);
          state.books.total += 1;
        }
        state.successMessage = 'Book created successfully';
      })
      .addCase(createBook.rejected, (state, action) => {
        state.createBookLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Update Book
    // ============================================
    builder
      .addCase(updateBook.pending, (state) => {
        state.updateBookLoading = true;
        state.booksError = null;
        state.successMessage = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.updateBookLoading = false;
        
        // Update in books list
        if (state.books) {
          const index = state.books.data.findIndex(b => b.id === action.payload.id);
          if (index !== -1) {
            state.books.data[index] = action.payload;
          }
        }
        
        // Update current book if it's the same
        if (state.currentBook?.id === action.payload.id) {
          state.currentBook = action.payload;
        }
        
        state.successMessage = 'Book updated successfully';
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.updateBookLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Delete Book
    // ============================================
    builder
      .addCase(deleteBook.pending, (state) => {
        state.deleteBookLoading = true;
        state.booksError = null;
        state.successMessage = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.deleteBookLoading = false;
        
        // Remove from books list
        if (state.books) {
          state.books.data = state.books.data.filter(b => b.id !== action.payload);
          state.books.total -= 1;
        }
        
        // Remove from selected
        state.selectedBookIds = state.selectedBookIds.filter(id => id !== action.payload);
        
        // Clear current book if it's the same
        if (state.currentBook?.id === action.payload) {
          state.currentBook = null;
        }
        
        state.successMessage = 'Book deleted successfully';
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.deleteBookLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Bulk Delete Books
    // ============================================
    builder
      .addCase(bulkDeleteBooks.pending, (state) => {
        state.bulkOperationLoading = true;
        state.booksError = null;
        state.successMessage = null;
      })
      .addCase(bulkDeleteBooks.fulfilled, (state, action) => {
        state.bulkOperationLoading = false;
        
        // Remove from books list
        if (state.books) {
          state.books.data = state.books.data.filter(b => !action.payload.ids.includes(b.id));
          state.books.total -= action.payload.count;
        }
        
        // Remove from selected
        state.selectedBookIds = state.selectedBookIds.filter(id => !action.payload.ids.includes(id));
        
        state.successMessage = `${action.payload.count} books deleted successfully`;
      })
      .addCase(bulkDeleteBooks.rejected, (state, action) => {
        state.bulkOperationLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Bulk Update Status
    // ============================================
    builder
      .addCase(bulkUpdateStatus.pending, (state) => {
        state.bulkOperationLoading = true;
        state.booksError = null;
        state.successMessage = null;
      })
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        state.bulkOperationLoading = false;
        
        // Update status in books list
        if (state.books) {
          state.books.data = state.books.data.map(book => 
            action.payload.ids.includes(book.id)
              ? { ...book, status: action.payload.status }
              : book
          );
        }
        
        state.successMessage = `${action.payload.count} books updated to ${action.payload.status}`;
      })
      .addCase(bulkUpdateStatus.rejected, (state, action) => {
        state.bulkOperationLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Fetch Popular Books
    // ============================================
    builder
      .addCase(fetchPopularBooks.pending, (state) => {
        state.popularBooksLoading = true;
      })
      .addCase(fetchPopularBooks.fulfilled, (state, action) => {
        state.popularBooksLoading = false;
        state.popularBooks = action.payload;
      })
      .addCase(fetchPopularBooks.rejected, (state) => {
        state.popularBooksLoading = false;
      })

    // ============================================
    // Fetch Featured Books
    // ============================================
    builder
      .addCase(fetchFeaturedBooks.pending, (state) => {
        state.featuredBooksLoading = true;
      })
      .addCase(fetchFeaturedBooks.fulfilled, (state, action) => {
        state.featuredBooksLoading = false;
        state.featuredBooks = action.payload;
      })
      .addCase(fetchFeaturedBooks.rejected, (state) => {
        state.featuredBooksLoading = false;
      })

    // ============================================
    // Fetch Recent Books
    // ============================================
    builder
      .addCase(fetchRecentBooks.pending, (state) => {
        state.recentBooksLoading = true;
      })
      .addCase(fetchRecentBooks.fulfilled, (state, action) => {
        state.recentBooksLoading = false;
        state.recentBooks = action.payload;
      })
      .addCase(fetchRecentBooks.rejected, (state) => {
        state.recentBooksLoading = false;
      })

    // ============================================
    // Fetch Books By Category
    // ============================================
    builder
      .addCase(fetchBooksByCategory.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(fetchBooksByCategory.fulfilled, (state, action) => {
        state.booksLoading = false;
        
        const booksData = extractBooksFromResponse(action.payload);
        if (booksData) {
          state.books = booksData;
        }
      })
      .addCase(fetchBooksByCategory.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Fetch Books By Author
    // ============================================
    builder
      .addCase(fetchBooksByAuthor.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
        state.booksLoading = false;
        
        const booksData = extractBooksFromResponse(action.payload);
        if (booksData) {
          state.books = booksData;
        }
      })
      .addCase(fetchBooksByAuthor.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Search Books
    // ============================================
    builder
      .addCase(searchBooks.pending, (state) => {
        state.booksLoading = true;
        state.booksError = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.booksLoading = false;
        
        const booksData = extractBooksFromResponse(action.payload);
        if (booksData) {
          state.books = booksData;
        }
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload as string;
      })

    // ============================================
    // Fetch Book Stats
    // ============================================
    builder
      .addCase(fetchBookStats.pending, (state) => {
        state.bookStatsLoading = true;
      })
      .addCase(fetchBookStats.fulfilled, (state, action) => {
        state.bookStatsLoading = false;
        state.bookStats = action.payload;
      })
      .addCase(fetchBookStats.rejected, (state) => {
        state.bookStatsLoading = false;
      })

    // ============================================
    // Fetch Book Reviews
    // ============================================
    builder
      .addCase(fetchBookReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
      })
      .addCase(fetchBookReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchBookReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload as string;
      })

    // ============================================
    // Add Review
    // ============================================
    builder
      .addCase(addReview.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
        state.successMessage = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        
        if (state.reviews) {
          state.reviews.data.unshift(action.payload);
          state.reviews.total += 1;
        }
        
        state.successMessage = 'Review added successfully';
      })
      .addCase(addReview.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload as string;
      })

    // ============================================
    // Update Review
    // ============================================
    builder
      .addCase(updateReview.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
        state.successMessage = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        
        if (state.reviews) {
          const index = state.reviews.data.findIndex(r => r.id === action.payload.id);
          if (index !== -1) {
            state.reviews.data[index] = action.payload;
          }
        }
        
        state.successMessage = 'Review updated successfully';
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload as string;
      })

    // ============================================
    // Delete Review
    // ============================================
    builder
      .addCase(deleteReview.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
        state.successMessage = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        
        if (state.reviews) {
          state.reviews.data = state.reviews.data.filter(r => r.id !== action.payload);
          state.reviews.total -= 1;
        }
        
        state.successMessage = 'Review deleted successfully';
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload as string;
      })

    // ============================================
    // Fetch Categories
    // ============================================
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      })

    // ============================================
    // Fetch Category Stats
    // ============================================
    builder
      .addCase(fetchCategoryStats.pending, (state) => {
        state.categoryStatsLoading = true;
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.categoryStatsLoading = false;
        state.categoryStats = action.payload;
      })
      .addCase(fetchCategoryStats.rejected, (state) => {
        state.categoryStatsLoading = false;
      })

    // ============================================
    // Create Category
    // ============================================
    builder
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.successMessage = 'Category created successfully';
      })

    // ============================================
    // Update Category
    // ============================================
    builder
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.successMessage = 'Category updated successfully';
      })

    // ============================================
    // Delete Category
    // ============================================
    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
        state.successMessage = 'Category deleted successfully';
      })

    // ============================================
    // Bookmark Book
    // ============================================
    builder
      .addCase(bookmarkBook.fulfilled, (state, action) => {
        if (state.currentBook?.id === action.payload.bookId) {
          state.currentBook = {
            ...state.currentBook,
            isBookmarked: true
          } as Book;
        }
        state.successMessage = 'Book added to bookmarks';
      })

    // ============================================
    // Unbookmark Book
    // ============================================
    builder
      .addCase(unbookmarkBook.fulfilled, (state, action) => {
        if (state.currentBook?.id === action.payload.bookId) {
          state.currentBook = {
            ...state.currentBook,
            isBookmarked: false
          } as Book;
        }
        state.successMessage = 'Book removed from bookmarks';
      })

    // ============================================
    // Fetch Bookmarked Books
    // ============================================
    builder
      .addCase(fetchBookmarkedBooks.pending, (state) => {
        state.bookmarkedBooksLoading = true;
      })
      .addCase(fetchBookmarkedBooks.fulfilled, (state, action) => {
        state.bookmarkedBooksLoading = false;
        state.bookmarkedBooks = action.payload;
      })
      .addCase(fetchBookmarkedBooks.rejected, (state) => {
        state.bookmarkedBooksLoading = false;
      })

    // ============================================
    // Like Book
    // ============================================
    builder
      .addCase(likeBook.fulfilled, (state, action) => {
        if (state.currentBook?.id === action.payload.bookId) {
          state.currentBook = {
            ...state.currentBook,
            isLiked: true,
            likes: (state.currentBook.likes || 0) + 1
          } as Book;
        }
      })

    // ============================================
    // Unlike Book
    // ============================================
    builder
      .addCase(unlikeBook.fulfilled, (state, action) => {
        if (state.currentBook?.id === action.payload.bookId) {
          state.currentBook = {
            ...state.currentBook,
            isLiked: false,
            likes: Math.max(0, (state.currentBook.likes || 0) - 1)
          } as Book;
        }
      })

    // ============================================
    // Fetch Liked Books
    // ============================================
    builder
      .addCase(fetchLikedBooks.pending, (state) => {
        state.likedBooksLoading = true;
      })
      .addCase(fetchLikedBooks.fulfilled, (state, action) => {
        state.likedBooksLoading = false;
        state.likedBooks = action.payload;
      })
      .addCase(fetchLikedBooks.rejected, (state) => {
        state.likedBooksLoading = false;
      })

    // ============================================
    // Add to Reading List
    // ============================================
    builder
      .addCase(addToReadingList.fulfilled, (state, action) => {
        state.successMessage = 'Book added to reading list';
      })

    // ============================================
    // Remove from Reading List
    // ============================================
    builder
      .addCase(removeFromReadingList.fulfilled, (state, action) => {
        state.successMessage = 'Book removed from reading list';
      })

    // ============================================
    // Fetch Reading List
    // ============================================
    builder
      .addCase(fetchReadingList.pending, (state) => {
        state.readingListLoading = true;
      })
      .addCase(fetchReadingList.fulfilled, (state, action) => {
        state.readingListLoading = false;
        state.readingList = action.payload;
      })
      .addCase(fetchReadingList.rejected, (state) => {
        state.readingListLoading = false;
      })

    // ============================================
    // Fetch Similar Books
    // ============================================
    builder
      .addCase(fetchSimilarBooks.pending, (state) => {
        state.similarBooksLoading = true;
      })
      .addCase(fetchSimilarBooks.fulfilled, (state, action) => {
        state.similarBooksLoading = false;
        state.similarBooks = action.payload;
      })
      .addCase(fetchSimilarBooks.rejected, (state) => {
        state.similarBooksLoading = false;
      })

    // ============================================
    // Fetch Recommendations
    // ============================================
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.recommendationsLoading = true;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendationsLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state) => {
        state.recommendationsLoading = false;
      })

    // ============================================
    // Export Books
    // ============================================
    builder
      .addCase(exportBooks.pending, (state) => {
        state.booksLoading = true;
      })
      .addCase(exportBooks.fulfilled, (state) => {
        state.booksLoading = false;
        state.successMessage = 'Books exported successfully';
      })
      .addCase(exportBooks.rejected, (state, action) => {
        state.booksLoading = false;
        state.booksError = action.payload as string;
      });
  }
});

// ============================================
// Selectors
// ============================================

export const selectBooks = (state: { books: BooksState }) => state.books.books;
export const selectBooksLoading = (state: { books: BooksState }) => state.books.booksLoading;
export const selectBooksError = (state: { books: BooksState }) => state.books.booksError;

export const selectCurrentBook = (state: { books: BooksState }) => state.books.currentBook;
export const selectCurrentBookLoading = (state: { books: BooksState }) => state.books.currentBookLoading;
export const selectCurrentBookError = (state: { books: BooksState }) => state.books.currentBookError;

export const selectReviews = (state: { books: BooksState }) => state.books.reviews;
export const selectReviewsLoading = (state: { books: BooksState }) => state.books.reviewsLoading;
export const selectReviewsError = (state: { books: BooksState }) => state.books.reviewsError;

export const selectCategories = (state: { books: BooksState }) => state.books.categories;
export const selectCategoriesLoading = (state: { books: BooksState }) => state.books.categoriesLoading;
export const selectCategoriesError = (state: { books: BooksState }) => state.books.categoriesError;

export const selectCategoryStats = (state: { books: BooksState }) => state.books.categoryStats;
export const selectCategoryStatsLoading = (state: { books: BooksState }) => state.books.categoryStatsLoading;

export const selectPopularBooks = (state: { books: BooksState }) => state.books.popularBooks;
export const selectPopularBooksLoading = (state: { books: BooksState }) => state.books.popularBooksLoading;

export const selectFeaturedBooks = (state: { books: BooksState }) => state.books.featuredBooks;
export const selectFeaturedBooksLoading = (state: { books: BooksState }) => state.books.featuredBooksLoading;

export const selectRecentBooks = (state: { books: BooksState }) => state.books.recentBooks;
export const selectRecentBooksLoading = (state: { books: BooksState }) => state.books.recentBooksLoading;

export const selectSimilarBooks = (state: { books: BooksState }) => state.books.similarBooks;
export const selectSimilarBooksLoading = (state: { books: BooksState }) => state.books.similarBooksLoading;

export const selectBookmarkedBooks = (state: { books: BooksState }) => state.books.bookmarkedBooks;
export const selectBookmarkedBooksLoading = (state: { books: BooksState }) => state.books.bookmarkedBooksLoading;

export const selectLikedBooks = (state: { books: BooksState }) => state.books.likedBooks;
export const selectLikedBooksLoading = (state: { books: BooksState }) => state.books.likedBooksLoading;

export const selectReadingList = (state: { books: BooksState }) => state.books.readingList;
export const selectReadingListLoading = (state: { books: BooksState }) => state.books.readingListLoading;

export const selectRecommendations = (state: { books: BooksState }) => state.books.recommendations;
export const selectRecommendationsLoading = (state: { books: BooksState }) => state.books.recommendationsLoading;

export const selectBookStats = (state: { books: BooksState }) => state.books.bookStats;
export const selectBookStatsLoading = (state: { books: BooksState }) => state.books.bookStatsLoading;

export const selectFilters = (state: { books: BooksState }) => state.books.filters;
export const selectSelectedBookIds = (state: { books: BooksState }) => state.books.selectedBookIds;
export const selectViewMode = (state: { books: BooksState }) => state.books.viewMode;
export const selectSortField = (state: { books: BooksState }) => state.books.sortField;
export const selectSortDirection = (state: { books: BooksState }) => state.books.sortDirection;

export const selectCreateBookLoading = (state: { books: BooksState }) => state.books.createBookLoading;
export const selectUpdateBookLoading = (state: { books: BooksState }) => state.books.updateBookLoading;
export const selectDeleteBookLoading = (state: { books: BooksState }) => state.books.deleteBookLoading;
export const selectBulkOperationLoading = (state: { books: BooksState }) => state.books.bulkOperationLoading;

export const selectSuccessMessage = (state: { books: BooksState }) => state.books.successMessage;

// ============================================
// Exports
// ============================================

export const {
  clearErrors,
  clearSuccessMessage,
  setFilters,
  resetFilters,
  setPage,
  setLimit,
  setSort,
  setViewMode,
  selectBook,
  deselectBook,
  selectAllBooks,
  deselectAllBooks,
  clearCurrentBook,
  clearReviews
} = booksSlice.actions;

export default booksSlice.reducer;