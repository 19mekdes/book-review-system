"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
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
class AdminController {
    /**
     * Get dashboard statistics
     */
    static async getDashboardStats(req, res) {
        try {
            const stats = await admin_service_1.AdminService.getDashboardStats();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Dashboard stats retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get dashboard stats'));
        }
    }
    /**
     * Get all users with pagination
     */
    static async getAllUsers(req, res) {
        try {
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const search = getQueryString(req.query.search);
            const role = getQueryString(req.query.role);
            const result = await admin_service_1.AdminService.getAllUsers(page, limit, search, role);
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
            const user = await admin_service_1.AdminService.getUserById(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'User retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user'));
        }
    }
    /**
     * Create new user
     */
    static async createUser(req, res) {
        try {
            const { name, email, password, roleId } = req.body;
            if (!name || !email || !password || !roleId) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('All fields are required'));
            }
            const user = await admin_service_1.AdminService.createUser({ name, email, password, roleId });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(user, 'User created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create user'));
        }
    }
    /**
     * Update user
     */
    static async updateUser(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const updates = req.body;
            const user = await admin_service_1.AdminService.updateUser(userId, updates);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(user, 'User updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update user'));
        }
    }
    /**
     * Delete user
     */
    static async deleteUser(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const userId = parseInt(idParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const adminUserId = req.user.id;
            await admin_service_1.AdminService.deleteUser(userId, adminUserId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'User deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete user'));
        }
    }
    /**
     * Get all books with pagination
     */
    static async getAllBooks(req, res) {
        try {
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const search = getQueryString(req.query.search);
            const categoryId = getQueryNumber(req.query.categoryId);
            const result = await admin_service_1.AdminService.getAllBooks(page, limit, search, categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books'));
        }
    }
    /**
     * Create new book
     */
    static async createBook(req, res) {
        try {
            const { title, author, description, categoryId } = req.body;
            if (!title || !author || !categoryId) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Title, author and category are required'));
            }
            const book = await admin_service_1.AdminService.createBook({
                title,
                author,
                description: description || '',
                categoryId
            });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(book, 'Book created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create book'));
        }
    }
    /**
     * Update book
     */
    static async updateBook(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const updates = req.body;
            const book = await admin_service_1.AdminService.updateBook(bookId, updates);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(book, 'Book updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update book'));
        }
    }
    /**
     * Delete book
     */
    static async deleteBook(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            await admin_service_1.AdminService.deleteBook(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Book deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete book'));
        }
    }
    /**
     * Get all reviews with pagination
     */
    static async getAllReviews(req, res) {
        try {
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const search = getQueryString(req.query.search);
            const minRating = getQueryNumber(req.query.minRating);
            const result = await admin_service_1.AdminService.getAllReviews(page, limit, search, minRating);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Reviews retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get reviews'));
        }
    }
    /**
     * Delete review
     */
    static async deleteReview(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const reviewId = parseInt(idParam || '', 10);
            if (isNaN(reviewId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid review ID'));
            }
            await admin_service_1.AdminService.deleteReview(reviewId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Review deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete review'));
        }
    }
    /**
     * Get all categories
     */
    static async getAllCategories(req, res) {
        try {
            const categories = await admin_service_1.AdminService.getAllCategories();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Categories retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get categories'));
        }
    }
    /**
     * Create category
     */
    static async createCategory(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await admin_service_1.AdminService.createCategory(name);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(category, 'Category created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create category'));
        }
    }
    /**
     * Update category
     */
    static async updateCategory(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await admin_service_1.AdminService.updateCategory(categoryId, name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update category'));
        }
    }
    /**
     * Delete category
     */
    static async deleteCategory(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            await admin_service_1.AdminService.deleteCategory(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Category deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete category'));
        }
    }
    /**
     * Get system health
     */
    static async getSystemHealth(req, res) {
        try {
            const health = await admin_service_1.AdminService.getSystemHealth();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(health, 'System health retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get system health'));
        }
    }
    /**
     * Get all roles
     */
    static async getAllRoles(req, res) {
        try {
            const roles = await admin_service_1.AdminService.getAllRoles();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(roles, 'Roles retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get roles'));
        }
    }
    /**
     * Generate report
     */
    static async generateReport(req, res) {
        try {
            const type = getQueryString(req.query.type);
            const startDate = getQueryString(req.query.startDate);
            const endDate = getQueryString(req.query.endDate);
            if (!type || !startDate || !endDate) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Type, startDate and endDate are required'));
            }
            const report = await admin_service_1.AdminService.generateReport(type, {
                start: new Date(startDate),
                end: new Date(endDate)
            });
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(report, 'Report generated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to generate report'));
        }
    }
}
exports.AdminController = AdminController;
