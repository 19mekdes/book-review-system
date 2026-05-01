import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
export interface Notification {
  id: number;
  userId: number;
  type: 'review_like' | 'review_comment' | 'review_reply' | 'book_status' | 'system' | 'achievement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock notifications - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: 1,
          userId: 1,
          type: 'review_like',
          title: 'Review Liked',
          message: 'John liked your review of "1984"',
          link: '/books/1',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'review_comment',
          title: 'New Comment',
          message: 'Sarah commented on your review of "To Kill a Mockingbird"',
          link: '/books/2',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: 3,
          userId: 1,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You wrote your 10th review! You earned the "Prolific Reviewer" badge.',
          link: '/profile',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: 4,
          userId: 1,
          type: 'book_status',
          title: 'Book Status Update',
          message: 'The book "Dune" you were waiting for is now available',
          link: '/books/3',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        }
      ];
      
      if (isMounted.current) {
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
      
    } catch (err) {
      if (isMounted.current) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  }, [notifications]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Fetch notifications when user authenticates with optimized polling
  useEffect(() => {
    if (!isAuthenticated) {
      clearNotifications();
      return;
    }

    let isActive = true;
    
    const fetchData = async () => {
      if (isActive) {
        await fetchNotifications();
      }
    };

    fetchData();

    // Use requestIdleCallback for better performance
    const scheduleNextFetch = () => {
      if (!isActive) return;
      
      if ('requestIdleCallback' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).requestIdleCallback(() => {
          if (isActive) {
            fetchData();
            scheduleNextFetch();
          }
        }, { timeout: 2000 });
      } else {
        fetchTimeoutRef.current = setTimeout(() => {
          if (isActive) {
            fetchData();
            scheduleNextFetch();
          }
          
        }, 60000); 
      }
    };

    scheduleNextFetch();

    return () => {
      isActive = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated, fetchNotifications, clearNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};