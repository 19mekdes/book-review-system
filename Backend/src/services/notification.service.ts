// backend/src/services/notification.service.ts
import { NotificationModel, CreateNotificationInput } from '../models/Notification.model';
import { ApiError } from '../middleware/error.middleware';
import pool from '../config/database';

export class NotificationService {
  static async createNotification(data: CreateNotificationInput): Promise<any> {
    try {
      console.log(`📝 Creating notification for user ${data.user_id}: ${data.title}`);
      const notification = await NotificationModel.create(data);
      console.log(`✅ Notification created successfully with ID: ${notification.id}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw new ApiError(500, 'Failed to create notification');
    }
  }

  static async getUserNotifications(userId: number, limit: number = 50): Promise<any> {
    try {
      const notifications = await NotificationModel.findByUser(userId, limit);
      const unreadCount = await NotificationModel.getUnreadCount(userId);
      
      // Format notifications for frontend
      const formattedNotifications = notifications.map(notif => ({
        ...notif,
        isRead: notif.read,
        timeAgo: this.getTimeAgo(notif.created_at)
      }));
      
      return { 
        notifications: formattedNotifications, 
        unreadCount 
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new ApiError(500, 'Failed to fetch notifications');
    }
  }

  static async markAsRead(notificationId: number): Promise<void> {
    try {
      await NotificationModel.markAsRead(notificationId);
      console.log(`✅ Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new ApiError(500, 'Failed to mark as read');
    }
  }

  static async markAllAsRead(userId: number): Promise<void> {
    try {
      await NotificationModel.markAllAsRead(userId);
      console.log(`✅ All notifications marked as read for user ${userId}`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new ApiError(500, 'Failed to mark all as read');
    }
  }

  static async getUnreadCount(userId: number): Promise<number> {
    try {
      return await NotificationModel.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * 🔔 Trigger notification when new review is created
   * Notifies all users who follow this book
   */
  static async notifyOnNewReview(
    bookId: number, 
    reviewId: number, 
    reviewerName: string, 
    bookTitle: string, 
    currentUserId: number
  ): Promise<number> {
    try {
      console.log(`🔔 Creating notifications for new review on book ${bookId}: "${bookTitle}"`);
      
      // Get all users who follow this book (excluding the reviewer)
      const followersQuery = `
        SELECT DISTINCT u.id, u.name, u.email 
        FROM users u
        INNER JOIN book_follows bf ON u.id = bf.user_id
        WHERE bf.book_id = $1 
        AND u.id != $2
      `;
      
      const followersResult = await pool.query(followersQuery, [bookId, currentUserId]);
      const followers = followersResult.rows;
      
      console.log(`📊 Found ${followers.length} followers to notify`);
      
      if (followers.length === 0) {
        console.log('ℹ️ No followers to notify for this book');
        return 0;
      }
      
      let notificationCount = 0;
      
      // Create notifications for each follower
      for (const follower of followers) {
        try {
          const notificationData: CreateNotificationInput = {
            user_id: follower.id,
            type: 'review',
            title: 'New Review Added',
            message: `${reviewerName} reviewed "${bookTitle}"`,
            link: `/books/${bookId}`,
            metadata: {
              bookId: bookId,
              reviewId: reviewId,
              bookTitle: bookTitle,
              reviewerName: reviewerName,
              reviewerId: currentUserId,
              timestamp: new Date().toISOString(),
              rating: null // You can add rating if available
            }
          };
          
          await NotificationModel.create(notificationData);
          notificationCount++;
          console.log(`✅ Notification created for user ${follower.id} (${follower.name})`);
        } catch (err) {
          console.error(`❌ Failed to create notification for user ${follower.id}:`, err);
        }
      }
      
      console.log(`✅ Successfully created ${notificationCount} notifications`);
      return notificationCount;
      
    } catch (error) {
      console.error('❌ Error in notifyOnNewReview:', error);
      return 0;
    }
  }

  /**
   * 🔔 Trigger notification when someone likes a review
   */
  static async notifyOnReviewLike(
    reviewId: number, 
    likerName: string, 
    reviewAuthorId: number, 
    bookId: number, 
    bookTitle: string,
    likerId?: number // Add likerId as an optional parameter
  ): Promise<boolean> {
    try {
      // Don't notify if user likes their own review
      if (likerId !== undefined && reviewAuthorId === likerId) {
        console.log('ℹ️ User liked their own review, no notification sent');
        return false;
      }
      
      const notificationData: CreateNotificationInput = {
        user_id: reviewAuthorId,
        type: 'like',
        title: 'Review Liked',
        message: `${likerName} liked your review of "${bookTitle}"`,
        link: `/books/${bookId}`,
        metadata: {
          bookId: bookId,
          reviewId: reviewId,
          likerName: likerName,
          likerId: likerId,
          timestamp: new Date().toISOString()
        }
      };
      
      await NotificationModel.create(notificationData);
      console.log(`✅ Like notification created for user ${reviewAuthorId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creating like notification:', error);
      return false;
    }
  }

  /**
   * 🔔 Trigger notification when a book is followed
   */
  static async notifyOnFollowBook(
    userId: number,
    bookId: number,
    bookTitle: string
  ): Promise<boolean> {
    try {
      const notificationData: CreateNotificationInput = {
        user_id: userId,
        type: 'follow',
        title: 'Book Followed',
        message: `You are now following "${bookTitle}"`,
        link: `/books/${bookId}`,
        metadata: {
          bookId: bookId,
          bookTitle: bookTitle,
          timestamp: new Date().toISOString()
        }
      };
      
      await NotificationModel.create(notificationData);
      console.log(`✅ Follow notification created for user ${userId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creating follow notification:', error);
      return false;
    }
  }

  /**
   * 🔔 Trigger notification when a user replies to a review
   */
  static async notifyOnReply(
    reviewId: number,
    replyText: string,
    replierName: string,
    originalAuthorId: number,
    bookId: number,
    bookTitle: string,
    replierId: number // Added replierId parameter
  ): Promise<boolean> {
    try {
      // Don't notify if user replies to their own review
      if (originalAuthorId === replierId) {
        return false;
      }
      
      const notificationData: CreateNotificationInput = {
        user_id: originalAuthorId,
        type: 'reply',
        title: 'New Reply',
        message: `${replierName} replied to your review on "${bookTitle}"`,
        link: `/books/${bookId}`,
        metadata: {
          bookId: bookId,
          reviewId: reviewId,
          replyText: replyText,
          replierName: replierName,
          replierId: replierId,
          timestamp: new Date().toISOString()
        }
      };
      
      await NotificationModel.create(notificationData);
      console.log(`✅ Reply notification created for user ${originalAuthorId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creating reply notification:', error);
      return false;
    }
  }

  /**
   * 🔔 Trigger notification for system events
   */
  static async notifySystemEvent(
    userId: number,
    title: string,
    message: string,
    link?: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      const notificationData: CreateNotificationInput = {
        user_id: userId,
        type: 'system',
        title: title,
        message: message,
        link: link,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      };
      
      await NotificationModel.create(notificationData);
      console.log(`✅ System notification created for user ${userId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error creating system notification:', error);
      return false;
    }
  }

  /**
   * 🕒 Helper: Get time ago string
   */
  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  }
}