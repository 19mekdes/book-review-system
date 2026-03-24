// client/src/app/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import booksReducer from '../features/books/booksSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import adminReducer from '../features/admin/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  books: booksReducer,
  reviews: reviewsReducer,
  categories: categoriesReducer,
  admin: adminReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;