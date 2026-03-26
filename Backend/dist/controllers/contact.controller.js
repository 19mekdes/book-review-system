"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const contact_service_1 = require("../services/contact.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
class ContactController {
    static async sendMessage(req, res) {
        try {
            const { name, email, subject, message } = req.body;
            // Validation
            if (!name || !email || !subject || !message) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('All fields are required'));
            }
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid email address'));
            }
            // Message length validation
            if (message.length < 10) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Message must be at least 10 characters'));
            }
            const result = await contact_service_1.ContactService.sendMessage({
                name,
                email,
                subject,
                message
            });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Message sent successfully'));
        }
        catch (error) {
            console.error('Error in sendMessage:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to send message'));
        }
    }
    static async getAllMessages(req, res) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
                return res.status(403).json(apiResponse_utils_1.ApiResponseUtil.error('Admin access required'));
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await contact_service_1.ContactService.getAllMessages(page, limit);
            return res.status(200).json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Messages retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getAllMessages:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to fetch messages'));
        }
    }
    static async markAsRead(req, res) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
                return res.status(403).json(apiResponse_utils_1.ApiResponseUtil.error('Admin access required'));
            }
            const messageId = parseInt(req.params.id, 10);
            if (isNaN(messageId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid message ID'));
            }
            const message = await contact_service_1.ContactService.markAsRead(messageId);
            return res.status(200).json(apiResponse_utils_1.ApiResponseUtil.success(message, 'Message marked as read'));
        }
        catch (error) {
            console.error('Error in markAsRead:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to mark message as read'));
        }
    }
    async deleteMessage(req, res) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'admin' && req.user?.roleId !== 1) {
                return res.status(403).json(apiResponse_utils_1.ApiResponseUtil.error('Admin access required'));
            }
            const messageId = parseInt(req.params.id, 10);
            if (isNaN(messageId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid message ID'));
            }
            await contact_service_1.ContactService.deleteMessage(messageId);
            return res.status(200).json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Message deleted successfully'));
        }
        catch (error) {
            console.error('Error in deleteMessage:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete message'));
        }
    }
}
exports.ContactController = ContactController;
