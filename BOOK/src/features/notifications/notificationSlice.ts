// src/features/notifications/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Notification {
  id: number;
  userId: number;
  type: 'review' | 'reply' | 'like' | 'follow' | 'book' | 'achievement' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isOpen: boolean; // Add this for dropdown state
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  isOpen: false, // Initialize dropdown as closed
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark as read
export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      return notificationId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/mark-all-read');
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add these new actions
    toggleNotificationDropdown: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeNotificationDropdown: (state) => {
      state.isOpen = false;
    },
    openNotificationDropdown: (state) => {
      state.isOpen = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.read = true; });
        state.unreadCount = 0;
      });
  }
});

// Export all actions
export const { 
  addNotification, 
  clearError, 
  toggleNotificationDropdown, 
  closeNotificationDropdown,
  openNotificationDropdown 
} = notificationSlice.actions;

export default notificationSlice.reducer;