export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  book_id: number;
  book_title?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewState {
  reviews: Review[];
  userReviews: Review[];
  latestReviews: Review[];
  isLoading: boolean;
  error: string | null;
}