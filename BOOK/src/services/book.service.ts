import api from './api';

export const bookService = {
  // Get all books
  getAllBooks: async (params?: Record<string, unknown>) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  // Get book by ID
  getBookById: async (id: number) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Get popular books
  getPopularBooks: async (limit: number = 5) => {
    const response = await api.get(`/books/popular?limit=${limit}`);
    return response.data;
  },

  // Search books
  searchBooks: async (query: string, params?: Record<string, unknown>) => {
    const response = await api.get('/books/search', { 
      params: { q: query, ...(params ?? {}) } // safe spread
    });
    return response.data;
  },

  // Get books by category
  getBooksByCategory: async (categoryId: number, page: number = 1, limit: number = 10) => {
    const response = await api.get(`/books/category/${categoryId}`, {
      params: { page, limit }
    });
    return response.data;
  }
};