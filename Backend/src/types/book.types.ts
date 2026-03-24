export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  categoryId: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BookWithDetails extends Book {
  category: string;
  avg_rating: number;
  review_count: number;
}