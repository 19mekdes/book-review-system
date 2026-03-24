// src/features/reviews/reviewsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// ============================================
// Types
// ============================================

export interface Review {
  id: number;
  user_id: number;
  user_name?: string;
  user_avatar?: string;
  book_id: number;
  book_title?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
  helpful_count?: number;
  liked_by_user?: boolean;
}

export interface ReviewState {
  reviews: Review[];
  userReviews: Review[];
  latestReviews: Review[];
  currentReview: Review | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

// ============================================
// Initial State
// ============================================

const initialState: ReviewState = {
  reviews: [],
  userReviews: [],
  latestReviews: [],
  currentReview: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
};

// ============================================
// Async Thunks
// ============================================

export const fetchLatestReviews = createAsyncThunk(
  'reviews/fetchLatest',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_limit: number = 5, { rejectWithValue }) => {
    try {
      // For development, return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          user_id: 101,
          user_name: 'John Doe',
          user_avatar: '',
          book_id: 1,
          book_title: 'The Great Gatsby',
          rating: 5,
          comment: 'Amazing book! Highly recommended.',
          created_at: new Date().toISOString(),
          helpful_count: 12
        },
        {
          id: 2,
          user_id: 102,
          user_name: 'Jane Smith',
          user_avatar: '',
          book_id: 2,
          book_title: '1984',
          rating: 4,
          comment: 'Thought-provoking and relevant.',
          created_at: new Date().toISOString(),
          helpful_count: 8
        }
      ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest reviews');
    }
  }
);

export const fetchReviewsByBook = createAsyncThunk(
  'reviews/fetchByBook',
  async (bookId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/book/${bookId}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewsByUser = createAsyncThunk(
  'reviews/fetchByUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/user/${userId}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
);

// ADD REVIEW - Make sure this is exported
export const addReview = createAsyncThunk(
  'reviews/add',
  async (reviewData: {
    user_id: number;
    book_id: number;
    rating: number;
    comment: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

// UPDATE REVIEW - Make sure this is exported
export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, ...reviewData }: {
    id: number;
    user_id: number;
    book_id: number;
    rating: number;
    comment: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

// DELETE REVIEW - Make sure this is exported
export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${id}`);
      return id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

// ============================================
// Slice
// ============================================

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.userReviews = [];
      state.latestReviews = [];
      state.currentReview = null;
    },
    setCurrentReview: (state, action: PayloadAction<Review | null>) => {
      state.currentReview = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch latest reviews
      .addCase(fetchLatestReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLatestReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestReviews = action.payload;
      })
      .addCase(fetchLatestReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch reviews by book
      .addCase(fetchReviewsByBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByBook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviewsByBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch reviews by user
      .addCase(fetchReviewsByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userReviews = action.payload;
      })
      .addCase(fetchReviewsByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add review
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.unshift(action.payload);
        state.latestReviews.unshift(action.payload);
        if (state.latestReviews.length > 5) {
          state.latestReviews.pop();
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        const userIndex = state.userReviews.findIndex(r => r.id === action.payload.id);
        if (userIndex !== -1) {
          state.userReviews[userIndex] = action.payload;
        }
        const latestIndex = state.latestReviews.findIndex(r => r.id === action.payload.id);
        if (latestIndex !== -1) {
          state.latestReviews[latestIndex] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
        state.userReviews = state.userReviews.filter(r => r.id !== action.payload);
        state.latestReviews = state.latestReviews.filter(r => r.id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// ============================================
// Exports
// ============================================

export const { clearReviews, setCurrentReview, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;