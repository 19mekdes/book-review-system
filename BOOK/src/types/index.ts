export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  category_name?: string;
  cover_image?: string;
  avg_rating?: number;
  review_count?: number;
  created_at?: string;
  status?: 'published' | 'draft' | 'archived' | 'pending';
}

export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  user_name?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface BookFilters {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}