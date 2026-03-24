"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
// Helper functions for query parameters
const getQueryString = (param) => {
    if (Array.isArray(param)) {
        return param[0]; // Take first value if array
    }
    return typeof param === 'string' ? param : undefined;
};
const getQueryNumber = (param) => {
    const str = getQueryString(param);
    if (str) {
        const num = parseInt(str, 10);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
};
const getQueryBoolean = (param) => {
    const str = getQueryString(param);
    if (str) {
        return str.toLowerCase() === 'true';
    }
    return undefined;
};
// Helper function for route parameters (req.params)
const getRouteParam = (param) => {
    if (Array.isArray(param)) {
        return param[0]; // Take first value if array
    }
    return param;
};
const getSortBy = (param) => {
    const str = getQueryString(param);
    if (str === 'name' || str === 'email' || str === 'role' || str === 'reviews' || str === 'joined') {
        return str;
    }
    return undefined;
};
const getSortOrder = (param) => {
    const str = getQueryString(param);
    if (str === 'asc' || str === 'desc') {
        return str;
    }
    return undefined;
};
class UserController {
    /**
     * Get all users with filters (admin only)
     */
    static async getAllUsers(req, res) {
        try {
            const filters = {
                search: getQueryString(req.query.search),
                role: getQueryString(req.query.role),
                minReviews: getQueryNumber(req.query.minReviews),
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10,
                startDate: req.query.startDate ? new Date(getQueryString(req.query.startDate) || '') : undefined,
                endDate: req.query.endDate ? new Date(getQueryString(req.query.endDate) || '') : undefined
            };
            // Validate dates
            if (filters.startDate && isNaN(filters.startDate.getTime())) {
                filters.startDate = undefined;
            }
            if (filters.endDate && isNaN(filters.endDate.getTime())) {
                filters.endDate = undefined;
            }
            const result = await user_service_1.UserService.getAllUsers(filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Users retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get users'));
        }
    }
    /**
     * Get user by ID
     */
    static async getUserById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const user = await user_service_1.UserService.getUserById(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'User retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user'));
        }
    }
    /**
     * Get current user profile
     */
    static async getCurrentUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const profile = await user_service_1.UserService.getUserProfile(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(profile, 'Profile retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get profile'));
        }
    }
    /**
     * Get user profile by ID (public)
     */
    static async getUserProfile(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const profile = await user_service_1.UserService.getUserProfile(userId);
            // Remove sensitive information for public profile
            const { email, ...publicProfile } = profile;
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(publicProfile, 'User profile retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user profile'));
        }
    }
    /**
     * Create new user (admin only)
     */
    static async createUser(req, res) {
        try {
            const { name, email, password, roleId } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Name, email and password are required'));
            }
            const user = await user_service_1.UserService.createUser({ name, email, password, roleId });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(user, 'User created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create user'));
        }
    }
    /**
     * Update current user
     */
    static async updateCurrentUser(req, res) {
        try {
            const userId = req.user.id;
            const { name, email, password } = req.body;
            const user = await user_service_1.UserService.updateUser(userId, { name, email, password }, false);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'Profile updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update profile'));
        }
    }
    /**
     * Update user (admin only)
     */
    static async updateUser(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const updates = req.body;
            const user = await user_service_1.UserService.updateUser(userId, updates, true);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'User updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update user'));
        }
    }
    /**
     * Delete user (admin only)
     */
    static async deleteUser(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const adminUserId = req.user.id;
            await user_service_1.UserService.deleteUser(userId, adminUserId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'User deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete user'));
        }
    }
    /**
     * Get user statistics (admin only)
     */
    static async getUserStats(req, res) {
        try {
            const stats = await user_service_1.UserService.getUserStats();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'User statistics retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user statistics'));
        }
    }
    /**
     * Search users (admin only)
     */
    static async searchUsers(req, res) {
        try {
            const query = getQueryString(req.query.q);
            if (!query) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Search query is required'));
            }
            const filters = {
                role: getQueryString(req.query.role),
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10
            };
            const result = await user_service_1.UserService.searchUsers(query, filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Search completed successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Search failed'));
        }
    }
    /**
     * Get user by email (admin only)
     */
    static async getUserByEmail(req, res) {
        try {
            const email = getQueryString(req.query.email);
            if (!email) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Email is required'));
            }
            const user = await user_service_1.UserService.getUserByEmail(email);
            if (!user) {
                return res.status(404).json(apiResponse_utils_1.ApiResponseUtil.notFound('User'));
            }
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'User retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user'));
        }
    }
    /**
     * Update password for current user
     */
    static async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;
            if (!currentPassword || !newPassword) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Current password and new password are required'));
            }
            await user_service_1.UserService.updatePassword(userId, currentPassword, newPassword);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Password updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update password'));
        }
    }
    /**
     * Get user activity summary
     */
    static async getUserActivitySummary(req, res) {
        try {
            const userId = req.user.id;
            const activity = await user_service_1.UserService.getUserActivitySummary(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(activity, 'User activity retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user activity'));
        }
    }
    /**
     * Get user activity summary by ID (public)
     */
    static async getUserActivitySummaryById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const activity = await user_service_1.UserService.getUserActivitySummary(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(activity, 'User activity retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user activity'));
        }
    }
}
exports.UserController = UserController;
