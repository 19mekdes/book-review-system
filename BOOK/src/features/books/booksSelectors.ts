import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/rootReducer';

const selectBooksState = (state: RootState) => state.books;

export const selectBooksData = createSelector(
  [selectBooksState],
  (booksState) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = booksState as any;
    return {
      books: state.books || [],
      totalPages: state.totalPages || 1,
      isLoading: state.isLoading || false
    };
  }
);