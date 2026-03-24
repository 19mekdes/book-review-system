export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  category?: string;
  avg_rating: number;
  review_count: number;
  created_at?: string;
}

export interface BookWithDetails extends Book {
  reviews?: Review[];
  ratingDistribution?: RatingDistribution[];
  similarBooks?: Book[];
}

export interface Review {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  comment: string;
  user_name?: string;
  created_at?: string;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}