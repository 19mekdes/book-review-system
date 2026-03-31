// src/components/common/NotificationIcon.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead,
  toggleNotificationDropdown,
  closeNotificationDropdown,
  Notification
} from '../../features/notifications/notificationSlice';

// Bell Icon Component
const BellIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const NotificationIcon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, loading, isOpen } = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => state.notifications
  );

  useEffect(() => {
    // Fetch notifications when component mounts
    dispatch(fetchNotifications());
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      if (!isOpen) {
        dispatch(fetchNotifications());
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch, isOpen]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(closeNotificationDropdown());
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await dispatch(markAsRead(notification.id));
    }
    
    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
    
    dispatch(closeNotificationDropdown());
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type: string): string => {
    const icons: Record<string, string> = {
      review: '📝',
      like: '❤️',
      reply: '💬',
      follow: '🔔',
      book: '📚',
      achievement: '🏆',
      system: '📢'
    };
    return icons[type] || '📢';
  };

  const getTimeAgo = (date: string): string => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => dispatch(toggleNotificationDropdown())}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-gray-500 mt-3 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  When someone reviews a book you follow, you'll see it here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      !notification.read 
                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;