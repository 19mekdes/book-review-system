import api from '../../services/api';
import { AxiosResponse } from 'axios';
import { Book, Review, Category, BookFilters, PaginatedResponse } from '../../types';

// ============================================
// Types
// ============================================

export interface CreateBookData {
  title: string;
  author: string;
  isbn?: string;
  description: string;
  categoryId: number;
  publisher?: string;
  publishDate?: string;
  pages?: number;
  language: string;
  format: 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
  price?: number;
  coverImage?: File | string;
  tags?: string[];
  series?: string;
  seriesPosition?: number;
  awards?: string[];
  characters?: string[];
  settings?: string[];
}

export interface UpdateBookData extends Partial<CreateBookData> {
  status?: 'published' | 'draft' | 'archived' | 'pending';
}

export interface BookResponse {
  success: boolean;
  message: string;
  data: Book;
}

export interface BooksResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Book>;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: PaginatedResponse<Review>;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewData extends Partial<CreateReviewData> {
  status?: 'approved' | 'pending' | 'flagged';
}

export interface APIError {
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  statusCode: number;
}

// ============================================
// Books API Class
// ============================================

class BooksAPI {
  private readonly baseUrl = '/books';

  /**
   * Get all books with filters and pagination
   */
  async getBooks(params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get book by ID
   */
  async getBookById(id: number): Promise<BookResponse> {
    try {
      const response: AxiosResponse<BookResponse> = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get book by slug
   */
  async getBookBySlug(slug: string): Promise<BookResponse> {
    try {
      const response: AxiosResponse<BookResponse> = await api.get(`${this.baseUrl}/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new book (admin only)
   */
  async createBook(data: CreateBookData): Promise<BookResponse> {
    try {
      const formData = this.prepareFormData(data);
      const response: AxiosResponse<BookResponse> = await api.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update book (admin only)
   */
  async updateBook(id: number, data: UpdateBookData): Promise<BookResponse> {
    try {
      const formData = this.prepareFormData(data);
      const response: AxiosResponse<BookResponse> = await api.put(`${this.baseUrl}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete book (admin only)
   */
  async deleteBook(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk delete books (admin only)
   */
  async bulkDeleteBooks(ids: number[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; deletedCount: number }> = await api.delete(`${this.baseUrl}/bulk`, {
        data: { ids }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update book status (admin only)
   */
  async bulkUpdateStatus(ids: number[], status: Book['status']): Promise<{ success: boolean; message: string; updatedCount: number }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; updatedCount: number }> = await api.patch(`${this.baseUrl}/bulk/status`, {
        ids,
        status
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get popular books
   */
  async getPopularBooks(limit: number = 10): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/popular`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get featured books
   */
  async getFeaturedBooks(limit: number = 10): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/featured`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recently added books
   */
  async getRecentBooks(limit: number = 10): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(categoryId: number, params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/category/${categoryId}`, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get books by author
   */
  async getBooksByAuthor(author: string, params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/author/${encodeURIComponent(author)}`, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Search books
   */
  async searchBooks(query: string, params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/search`, {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get book statistics
   */
  async getBookStats(): Promise<{
    success: boolean;
    data: {
      totalBooks: number;
      totalReviews: number;
      averageRating: number;
      booksByCategory: Array<{ category: string; count: number; averageRating: number }>;
      topRatedBooks: Book[];
      mostReviewedBooks: Book[];
      recentBooks: Book[];
    };
  }> {
    try {
      const response: AxiosResponse = await api.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get book reviews
   */
  async getBookReviews(bookId: number, params?: { page?: number; limit?: number; sortBy?: string }): Promise<ReviewsResponse> {
    try {
      const response: AxiosResponse<ReviewsResponse> = await api.get(`${this.baseUrl}/${bookId}/reviews`, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add review to book
   */
  async addReview(bookId: number, data: CreateReviewData): Promise<{ success: boolean; message: string; data: Review }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: Review }> = await api.post(`${this.baseUrl}/${bookId}/reviews`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update review
   */
  async updateReview(bookId: number, reviewId: number, data: UpdateReviewData): Promise<{ success: boolean; message: string; data: Review }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: Review }> = await api.put(`${this.baseUrl}/${bookId}/reviews/${reviewId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete review
   */
  async deleteReview(bookId: number, reviewId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`${this.baseUrl}/${bookId}/reviews/${reviewId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(bookId: number, reviewId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post(`${this.baseUrl}/${bookId}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Report review
   */
  async reportReview(bookId: number, reviewId: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post(`${this.baseUrl}/${bookId}/reviews/${reviewId}/report`, { reason });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response: AxiosResponse<CategoriesResponse> = await api.get('/categories');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<{ success: boolean; data: Category }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Category }> = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Create category (admin only)
   */
  async createCategory(name: string, description?: string): Promise<{ success: boolean; data: Category }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Category }> = await api.post('/categories', { name, description });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update category (admin only)
   */
  async updateCategory(id: number, data: Partial<Category>): Promise<{ success: boolean; data: Category }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Category }> = await api.put(`/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete category (admin only)
   */
  async deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      booksCount: number;
      reviewsCount: number;
      averageRating: number;
    }>;
  }> {
    try {
      const response: AxiosResponse = await api.get('/categories/stats');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Bookmark a book
   */
  async bookmarkBook(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post(`${this.baseUrl}/${bookId}/bookmark`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Unbookmark a book
   */
  async unbookmarkBook(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`${this.baseUrl}/${bookId}/bookmark`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get bookmarked books
   */
  async getBookmarkedBooks(params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get('/user/bookmarks', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Like a book
   */
  async likeBook(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post(`${this.baseUrl}/${bookId}/like`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Unlike a book
   */
  async unlikeBook(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`${this.baseUrl}/${bookId}/like`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get liked books
   */
  async getLikedBooks(params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get('/user/likes', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Export books (admin only)
   */
  async exportBooks(format: 'csv' | 'pdf' | 'excel', filters?: BookFilters): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Import books (admin only)
   */
  async importBooks(file: File): Promise<{ success: boolean; message: string; importedCount: number }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response: AxiosResponse<{ success: boolean; message: string; importedCount: number }> = await api.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get similar books
   */
  async getSimilarBooks(bookId: number, limit: number = 5): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get(`${this.baseUrl}/${bookId}/similar`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get reading list (for authenticated user)
   */
  async getReadingList(params?: BookFilters): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get('/user/reading-list', { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Add to reading list
   */
  async addToReadingList(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.post(`/user/reading-list/${bookId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove from reading list
   */
  async removeFromReadingList(bookId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(`/user/reading-list/${bookId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update reading progress
   */
  async updateReadingProgress(bookId: number, progress: number): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.patch(`/user/reading-list/${bookId}/progress`, { progress });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get book recommendations
   */
  async getRecommendations(limit: number = 10): Promise<BooksResponse> {
    try {
      const response: AxiosResponse<BooksResponse> = await api.get('/user/recommendations', {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Prepare form data for multipart/form-data requests
   */
  private prepareFormData(data: CreateBookData | UpdateBookData): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'coverImage' && value instanceof File) {
          formData.append('coverImage', value);
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): APIError {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
      };
    }
  }
}

// Create and export a singleton instance
export const booksAPI = new BooksAPI();

// Export default instance
export default booksAPI;