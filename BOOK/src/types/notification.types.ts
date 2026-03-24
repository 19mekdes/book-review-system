export interface Notification {
  id: number;
  userId: number;
  type: 'review_like' | 'review_comment' | 'review_reply' | 'book_status' | 'system' | 'achievement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  data?: unknown;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}