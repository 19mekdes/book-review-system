"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const Contact_model_1 = require("../models/Contact.model");
const error_middleware_1 = require("../middleware/error.middleware");
class ContactService {
    static async sendMessage(messageData) {
        try {
            // Validation
            if (!messageData.name?.trim()) {
                throw new error_middleware_1.ApiError(400, 'Name is required');
            }
            if (!messageData.email?.trim()) {
                throw new error_middleware_1.ApiError(400, 'Email is required');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(messageData.email)) {
                throw new error_middleware_1.ApiError(400, 'Invalid email address');
            }
            if (!messageData.subject?.trim()) {
                throw new error_middleware_1.ApiError(400, 'Subject is required');
            }
            if (!messageData.message?.trim()) {
                throw new error_middleware_1.ApiError(400, 'Message is required');
            }
            if (messageData.message.length < 10) {
                throw new error_middleware_1.ApiError(400, 'Message must be at least 10 characters');
            }
            const savedMessage = await Contact_model_1.ContactModel.create(messageData);
            return savedMessage;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            console.error('Error in ContactService.sendMessage:', error);
            throw new error_middleware_1.ApiError(500, 'Failed to send message');
        }
    }
    static async getAllMessages(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const messages = await Contact_model_1.ContactModel.findAll(limit, offset);
            const total = messages.length;
            return {
                messages,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            console.error('Error in ContactService.getAllMessages:', error);
            throw new error_middleware_1.ApiError(500, 'Failed to fetch messages');
        }
    }
    static async markAsRead(messageId) {
        try {
            const message = await Contact_model_1.ContactModel.updateStatus(messageId, 'read');
            if (!message) {
                throw new error_middleware_1.ApiError(404, 'Message not found');
            }
            return message;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, 'Failed to update message');
        }
    }
    // ✅ FIXED: Accept number parameter
    static async deleteMessage(messageId) {
        try {
            const deleted = await Contact_model_1.ContactModel.delete(messageId);
            if (!deleted) {
                throw new error_middleware_1.ApiError(404, 'Message not found');
            }
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, 'Failed to delete message');
        }
    }
}
exports.ContactService = ContactService;
