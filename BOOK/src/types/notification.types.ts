export interface Notification {
  id: number;
  userId: number;
  type: 'review' | 'reply' | 'like' | 'follow' | 'book' | 'achievement' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    bookId?: number;
    reviewId?: number;
    userId?: number;
    badgeName?: string;
  };
}