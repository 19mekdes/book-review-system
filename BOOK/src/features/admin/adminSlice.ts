// src/features/admin/adminSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';  // Fixed import

// ============================================
// Types
// ============================================

export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  totalCategories: number;
  activeToday: number;
  averageRating: number;
  pendingReviews: number;
  userGrowth: number;
  bookGrowth: number;
  reviewGrowth: number;
  recentUsers: unknown[];
  recentReviews: unknown[];
}

export interface AdminState {
  stats: DashboardStats | null;
  users: unknown[];
  books: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Initial State
// ============================================

const initialState: AdminState = {
  stats: null,
  users: [],
  books: [],
  reviews: [],
  isLoading: false,
  error: null
};

// ============================================
// Async Thunks
// ============================================

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (range: string = 'week', { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/stats?range=${range}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchAllBooks = createAsyncThunk(
  'admin/fetchAllBooks',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/books', { params });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
    }
  }
);

export const fetchAllReviews = createAsyncThunk(
  'admin/fetchAllReviews',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/reviews', { params });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const deleteBook = createAsyncThunk(
  'admin/deleteBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/books/${bookId}`);
      return bookId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete book');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'admin/deleteReview',
  async (reviewId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      return reviewId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

// ============================================
// Slice
// ============================================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // All Books
      .addCase(fetchAllBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload;
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // All Reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state.users = state.users.filter((user: any) => user.id !== action.payload);
      })

      // Delete Book
      .addCase(deleteBook.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state.books = state.books.filter((book: any) => book.id !== action.payload);
      })

      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state.reviews = state.reviews.filter((review: any) => review.id !== action.payload);
      });
  }
});

// ============================================
// Exports
// ============================================

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;