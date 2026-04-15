export interface Review {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  comment?: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface ReviewWithDetails extends Review {
  user_name: string;
  book_title: string;
  book_author: string;
}