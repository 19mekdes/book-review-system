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
