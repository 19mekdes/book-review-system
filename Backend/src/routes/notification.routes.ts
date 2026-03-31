import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get all notifications for current user
router.get('/', NotificationController.getUserNotifications);

// Mark all notifications as read
router.put('/mark-all-read', NotificationController.markAllAsRead);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark a specific notification as read
router.put('/:id/read', NotificationController.markAsRead);

export default router;