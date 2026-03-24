// src/features/categories/categoriesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// ============================================
// Types
// ============================================

export interface Category {
  id: number;
  name: string;        // This will hold the category name from API
  description?: string;
  bookCount?: number;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Initial State
// ============================================

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null
};

// ============================================
// Helper function to transform API response
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformCategoryResponse = (data: any[]): Category[] => {
  return data.map(item => ({
    id: item.id,
    name: item.category, // Map 'category' field from API to 'name'
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Default values for optional fields
    bookCount: 0,
    description: '',
    icon: '📚',
    color: ['#4361ee', '#f72585', '#4cc9f0', '#f8961e', '#9c89b8', '#ef476f', '#43aa8b', '#f9c74f'][(item.id - 1) % 8]
  }));
};

// ============================================
// Async Thunks
// ============================================

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      console.log('Categories API response:', response.data);
      
      // Handle the response structure: { success: true, data: [...] }
      if (response.data?.success && Array.isArray(response.data.data)) {
        return transformCategoryResponse(response.data.data);
      } 
      // If response is directly an array
      else if (Array.isArray(response.data)) {
        return transformCategoryResponse(response.data);
      }
      // If data is wrapped in data property without success flag
      else if (response.data?.data && Array.isArray(response.data.data)) {
        return transformCategoryResponse(response.data.data);
      }
      
      console.warn('Unexpected categories response format:', response.data);
      return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// ============================================
// Slice
// ============================================

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Optional: Add a category manually
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    // Optional: Update a category
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    // Optional: Remove a category
    removeCategory: (state, action: PayloadAction<number>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
        console.log('Categories loaded:', state.categories.length);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.categories = []; // Clear categories on error
      });
  }
});

// ============================================
// Selectors
// ============================================

export const selectAllCategories = (state: { categories: CategoryState }) => 
  state.categories.categories;

export const selectCategoriesLoading = (state: { categories: CategoryState }) => 
  state.categories.isLoading;

export const selectCategoriesError = (state: { categories: CategoryState }) => 
  state.categories.error;

export const selectCategoryById = (state: { categories: CategoryState }, id: number) => 
  state.categories.categories.find(c => c.id === id);

export const selectCategoryByName = (state: { categories: CategoryState }, name: string) => 
  state.categories.categories.find(c => c.name.toLowerCase() === name.toLowerCase());

// ============================================
// Exports
// ============================================

export const { clearError, addCategory, updateCategory, removeCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;