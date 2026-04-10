import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  static async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      //  Check if user exists (using authenticate sets req.user)
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      //  Use userId from the user object
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const result = await NotificationService.getUserNotifications(userId, limit);
      
      return res.json(ApiResponseUtil.success(result));
    } catch (error: any) {
      console.error('Error in getUserNotifications:', error);
      return res.status(500).json(ApiResponseUtil.error(error.message));
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid notification ID')
        );
      }
      
      await NotificationService.markAsRead(notificationId);
      
      return res.json(ApiResponseUtil.success(null, 'Notification marked as read'));
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      return res.status(500).json(ApiResponseUtil.error(error.message));
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);
      
      return res.json(ApiResponseUtil.success(null, 'All notifications marked as read'));
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      return res.status(500).json(ApiResponseUtil.error(error.message));
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);
      
      return res.json(ApiResponseUtil.success({ count }));
    } catch (error: any) {
      console.error('Error in getUnreadCount:', error);
      return res.status(500).json(ApiResponseUtil.error(error.message));
    }
  }
}