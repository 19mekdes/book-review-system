import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class ContactController {
  
  static async sendMessage(req: Request, res: Response) {
    try {
      const { name, email, subject, message } = req.body;
      
      // Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('All fields are required')
        );
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid email address')
        );
      }
      
      // Message length validation
      if (message.length < 10) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Message must be at least 10 characters')
        );
      }
      
      const result = await ContactService.sendMessage({
        name,
        email,
        subject,
        message
      });
      
      return res.status(201).json(
        ApiResponseUtil.success(result, 'Message sent successfully')
      );
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to send message')
      );
    }
  }
  
  
  static async getAllMessages(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await ContactService.getAllMessages(page, limit);
      
      return res.status(200).json(
        ApiResponseUtil.success(result, 'Messages retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllMessages:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to fetch messages')
      );
    }
  }
  
  
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }
      
      const messageId = parseInt(req.params.id, 10);
      
      if (isNaN(messageId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid message ID')
        );
      }
      
      
      const message = await ContactService.markAsRead(messageId);
      
      return res.status(200).json(
        ApiResponseUtil.success(message, 'Message marked as read')
      );
    } catch (error: any) {
      console.error('Error in markAsRead:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to mark message as read')
      );
    }
  }
  
  async deleteMessage(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }
      
      const messageId = parseInt(req.params.id, 10);
      
      if (isNaN(messageId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid message ID')
        );
      }
      
  
      await ContactService.deleteMessage(messageId);
      
      return res.status(200).json(
        ApiResponseUtil.success(null, 'Message deleted successfully')
      );
    } catch (error: any) {
      console.error('Error in deleteMessage:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to delete message')
      );
    }
  }
}