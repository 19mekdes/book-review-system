import { ContactModel, CreateContactInput, ContactMessage } from '../models/Contact.model';
import { ApiError } from '../middleware/error.middleware';

export class ContactService {
  static async sendMessage(messageData: CreateContactInput): Promise<ContactMessage> {
    try {
      // Validation
      if (!messageData.name?.trim()) {
        throw new ApiError(400, 'Name is required');
      }
      
      if (!messageData.email?.trim()) {
        throw new ApiError(400, 'Email is required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(messageData.email)) {
        throw new ApiError(400, 'Invalid email address');
      }
      
      if (!messageData.subject?.trim()) {
        throw new ApiError(400, 'Subject is required');
      }
      
      if (!messageData.message?.trim()) {
        throw new ApiError(400, 'Message is required');
      }
      
      if (messageData.message.length < 10) {
        throw new ApiError(400, 'Message must be at least 10 characters');
      }
      
      const savedMessage = await ContactModel.create(messageData);
      
      return savedMessage;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('Error in ContactService.sendMessage:', error);
      throw new ApiError(500, 'Failed to send message');
    }
  }
  
  static async getAllMessages(page: number = 1, limit: number = 20): Promise<{
    messages: ContactMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const messages = await ContactModel.findAll(limit, offset);
      const total = messages.length;
      
      return {
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in ContactService.getAllMessages:', error);
      throw new ApiError(500, 'Failed to fetch messages');
    }
  }
  
  
  static async markAsRead(messageId: number): Promise<ContactMessage> {
    try {
      const message = await ContactModel.updateStatus(messageId, 'read');
      if (!message) {
        throw new ApiError(404, 'Message not found');
      }
      return message;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update message');
    }
  }
  
  // ✅ FIXED: Accept number parameter
  static async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const deleted = await ContactModel.delete(messageId);
      if (!deleted) {
        throw new ApiError(404, 'Message not found');
      }
      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete message');
    }
  }
}