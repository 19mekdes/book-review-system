"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const User_model_1 = require("../models/User.model");
const Book_model_1 = require("../models/Book.model");
const Review_model_1 = require("../models/Review.model");
const Category_model_1 = require("../models/Category.model");
const Role_model_1 = require("../models/Role.model");
const error_middleware_1 = require("../middleware/error.middleware");
const bcrypt_utils_1 = require("../utils/bcrypt.utils"); // ✅ Fixed import (class, not instance)
const jwt_utils_1 = require("../utils/jwt.utils"); // ✅ Keep this as is (already class)
class AdminService {
    /**
     * Get dashboard statistics
     */
    static async getDashboardStats() {
        try {
            // Get counts
            const users = await User_model_1.UserModel.findAll();
            const books = await Book_model_1.BookModel.findAll();
            const reviews = await Review_model_1.ReviewModel.findAll();
            const categories = await Category_model_1.CategoryModel.findAll();
            // Get recent data
            const recentUsers = await User_model_1.UserModel.getUsersWithReviewCounts();
            const recentBooks = await Book_model_1.BookModel.findAll();
            const recentReviews = await Review_model_1.ReviewModel.getLatestReviews(10);
            // Get popular books
            const popularBooks = await Book_model_1.BookModel.getPopularBooks(5);
            // Get active users (users with most reviews)
            const activeUsers = recentUsers
                .filter(u => u.review_count > 0)
                .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
                .slice(0, 5);
            // Get category statistics
            const categoryStats = await Category_model_1.CategoryModel.getCategoriesWithStats();
            // Get rating distribution
            const allReviews = await Review_model_1.ReviewModel.findAll();
            const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
                rating,
                count: allReviews.filter(r => r.rating === rating).length
            }));
            return {
                totalUsers: users.length,
                totalBooks: books.length,
                totalReviews: reviews.length,
                totalCategories: categories.length,
                recentUsers: recentUsers.slice(0, 5),
                recentBooks: recentBooks.slice(0, 5),
                recentReviews: recentReviews.slice(0, 5),
                popularBooks,
                activeUsers,
                categoryStats,
                ratingDistribution
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get dashboard stats: ${error.message}`);
        }
    }
    /**
     * Get all users with pagination
     */
    static async getAllUsers(page = 1, limit = 10, search, role) {
        try {
            let users = await User_model_1.UserModel.getUsersWithReviewCounts();
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                users = users.filter(u => u.name.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower));
            }
            // Apply role filter
            if (role) {
                users = users.filter(u => u.role_name?.toLowerCase() === role.toLowerCase());
            }
            // Calculate pagination
            const total = users.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedUsers = users.slice(start, start + limit);
            return {
                users: paginatedUsers,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get users: ${error.message}`);
        }
    }
    /**
     * Get user by ID
     */
    static async getUserById(userId) {
        try {
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            return user;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get user: ${error.message}`);
        }
    }
    /**
     * Create new user (admin only)
     */
    static async createUser(userData) {
        try {
            // Check if user exists
            const existingUser = await User_model_1.UserModel.findByEmail(userData.email);
            if (existingUser) {
                throw new error_middleware_1.ApiError(400, 'User with this email already exists');
            }
            // Validate password strength
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(userData.password); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Hash password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(userData.password); // ✅ Fixed
            // Create user
            const newUser = await User_model_1.UserModel.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                roleId: userData.roleId
            });
            // Remove password from response
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create user: ${error.message}`);
        }
    }
    /**
     * Update user (admin only)
     */
    static async updateUser(userId, updates) {
        try {
            // Check if user exists
            const existingUser = await User_model_1.UserModel.findById(userId);
            if (!existingUser) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // If updating email, check if it's already taken
            if (updates.email && updates.email !== existingUser.email) {
                const userWithEmail = await User_model_1.UserModel.findByEmail(updates.email);
                if (userWithEmail) {
                    throw new error_middleware_1.ApiError(400, 'Email already in use');
                }
            }
            // If updating password, hash it
            if (updates.password) {
                const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(updates.password); // ✅ Fixed
                if (!passwordValidation.isValid) {
                    throw new error_middleware_1.ApiError(400, passwordValidation.message);
                }
                updates.password = await bcrypt_utils_1.BcryptUtils.hashPassword(updates.password); // ✅ Fixed
            }
            // Update user
            const updatedUser = await User_model_1.UserModel.update(userId, updates);
            if (!updatedUser) {
                throw new error_middleware_1.ApiError(500, 'Failed to update user');
            }
            // Remove password from response
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update user: ${error.message}`);
        }
    }
    /**
     * Delete user (admin only)
     */
    static async deleteUser(userId, adminUserId) {
        try {
            // Check if user exists
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Prevent admin from deleting themselves
            if (userId === adminUserId) {
                throw new error_middleware_1.ApiError(400, 'Cannot delete your own account');
            }
            // Delete user
            const deleted = await User_model_1.UserModel.delete(userId);
            // Revoke all user sessions
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed - JwtUtils is already correct
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete user: ${error.message}`);
        }
    }
    /**
     * Get all books with pagination
     */
    static async getAllBooks(page = 1, limit = 10, search, categoryId) {
        try {
            let books = await Book_model_1.BookModel.findAll();
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                books = books.filter(b => b.title.toLowerCase().includes(searchLower) ||
                    b.author.toLowerCase().includes(searchLower));
            }
            // Apply category filter
            if (categoryId) {
                books = books.filter(b => b.categoryId === categoryId);
            }
            // Calculate pagination
            const total = books.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedBooks = books.slice(start, start + limit);
            return {
                books: paginatedBooks,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get books: ${error.message}`);
        }
    }
    /**
     * Create new book (admin only)
     */
    static async createBook(bookData) {
        try {
            // Validate category exists
            const category = await Category_model_1.CategoryModel.findById(bookData.categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(400, 'Invalid category');
            }
            // Create book
            const newBook = await Book_model_1.BookModel.create(bookData);
            return newBook;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create book: ${error.message}`);
        }
    }
    /**
     * Update book (admin only)
     */
    static async updateBook(bookId, updates) {
        try {
            // Check if book exists
            const existingBook = await Book_model_1.BookModel.findById(bookId);
            if (!existingBook) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // If updating category, validate it exists
            if (updates.categoryId) {
                const category = await Category_model_1.CategoryModel.findById(updates.categoryId);
                if (!category) {
                    throw new error_middleware_1.ApiError(400, 'Invalid category');
                }
            }
            // Update book
            const updatedBook = await Book_model_1.BookModel.update(bookId, updates);
            if (!updatedBook) {
                throw new error_middleware_1.ApiError(500, 'Failed to update book');
            }
            return updatedBook;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update book: ${error.message}`);
        }
    }
    /**
     * Delete book (admin only)
     */
    static async deleteBook(bookId) {
        try {
            // Check if book exists
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Delete book (reviews will be cascade deleted)
            const deleted = await Book_model_1.BookModel.delete(bookId);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete book: ${error.message}`);
        }
    }
    /**
     * Get all reviews with pagination
     */
    static async getAllReviews(page = 1, limit = 10, search, minRating) {
        try {
            let reviews = await Review_model_1.ReviewModel.findAll();
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                reviews = reviews.filter(r => r.comment?.toLowerCase().includes(searchLower) ||
                    r.user_name?.toLowerCase().includes(searchLower) ||
                    r.book_title?.toLowerCase().includes(searchLower));
            }
            // Apply rating filter
            if (minRating) {
                reviews = reviews.filter(r => r.rating >= minRating);
            }
            // Calculate pagination
            const total = reviews.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedReviews = reviews.slice(start, start + limit);
            return {
                reviews: paginatedReviews,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get reviews: ${error.message}`);
        }
    }
    /**
     * Delete review (admin only)
     */
    static async deleteReview(reviewId) {
        try {
            // Check if review exists
            const review = await Review_model_1.ReviewModel.findById(reviewId);
            if (!review) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // Delete review
            const deleted = await Review_model_1.ReviewModel.delete(reviewId);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete review: ${error.message}`);
        }
    }
    /**
     * Get all categories with statistics
     */
    static async getAllCategories() {
        try {
            const categories = await Category_model_1.CategoryModel.getCategoriesWithStats();
            return categories;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get categories: ${error.message}`);
        }
    }
    /**
     * Create new category
     */
    static async createCategory(categoryName) {
        try {
            // Check if category exists
            const existingCategory = (await Category_model_1.CategoryModel.findAll())
                .find(c => c.category.toLowerCase() === categoryName.toLowerCase());
            if (existingCategory) {
                throw new error_middleware_1.ApiError(400, 'Category already exists');
            }
            // Create category
            const newCategory = await Category_model_1.CategoryModel.create(categoryName);
            return newCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create category: ${error.message}`);
        }
    }
    /**
     * Update category
     */
    static async updateCategory(categoryId, categoryName) {
        try {
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Update category
            const updatedCategory = await Category_model_1.CategoryModel.update(categoryId, categoryName);
            if (!updatedCategory) {
                throw new error_middleware_1.ApiError(500, 'Failed to update category');
            }
            return updatedCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update category: ${error.message}`);
        }
    }
    /**
     * Delete category
     */
    static async deleteCategory(categoryId) {
        try {
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Check if category has books
            const books = await Book_model_1.BookModel.findAll();
            const booksInCategory = books.filter(b => b.categoryId === categoryId);
            if (booksInCategory.length > 0) {
                throw new error_middleware_1.ApiError(400, 'Cannot delete category with books');
            }
            // Delete category
            const deleted = await Category_model_1.CategoryModel.delete(categoryId);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete category: ${error.message}`);
        }
    }
    /**
     * Get system health
     */
    static async getSystemHealth() {
        try {
            const startTime = Date.now();
            // Test database connection
            await User_model_1.UserModel.findAll();
            const dbResponseTime = Date.now() - startTime;
            return {
                database: {
                    status: dbResponseTime < 1000 ? 'healthy' : 'unhealthy',
                    responseTime: dbResponseTime
                },
                server: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage()
                },
                activeSessions: await jwt_utils_1.JwtUtils.getActiveSessionCount?.() || 0, // ✅ Fixed - JwtUtils is correct
                requestsLastHour: 0 // This would come from a monitoring system
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get system health: ${error.message}`);
        }
    }
    /**
     * Get all roles
     */
    static async getAllRoles() {
        try {
            const roles = await Role_model_1.RoleModel.findAll();
            return roles;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get roles: ${error.message}`);
        }
    }
    /**
     * Generate report data
     */
    static async generateReport(type, dateRange) {
        try {
            switch (type) {
                case 'users':
                    const users = await User_model_1.UserModel.findAll();
                    const newUsers = users.filter(u => u.created_at &&
                        new Date(u.created_at) >= dateRange.start &&
                        new Date(u.created_at) <= dateRange.end);
                    return {
                        type: 'users',
                        period: dateRange,
                        total: users.length,
                        newUsers: newUsers.length,
                        usersByRole: await this.getUsersByRole(),
                        data: newUsers
                    };
                case 'books':
                    const books = await Book_model_1.BookModel.findAll();
                    const newBooks = books.filter(b => b.created_at &&
                        new Date(b.created_at) >= dateRange.start &&
                        new Date(b.created_at) <= dateRange.end);
                    return {
                        type: 'books',
                        period: dateRange,
                        total: books.length,
                        newBooks: newBooks.length,
                        booksByCategory: await this.getBooksByCategory(),
                        data: newBooks
                    };
                case 'reviews':
                    const reviews = await Review_model_1.ReviewModel.findAll();
                    const newReviews = reviews.filter(r => r.created_at &&
                        new Date(r.created_at) >= dateRange.start &&
                        new Date(r.created_at) <= dateRange.end);
                    return {
                        type: 'reviews',
                        period: dateRange,
                        total: reviews.length,
                        newReviews: newReviews.length,
                        averageRating: this.calculateAverageRating(reviews),
                        ratingDistribution: this.getRatingDistribution(reviews),
                        data: newReviews
                    };
                default:
                    throw new error_middleware_1.ApiError(400, 'Invalid report type');
            }
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to generate report: ${error.message}`);
        }
    }
    /**
     * Helper: Get users by role
     */
    static async getUsersByRole() {
        const users = await User_model_1.UserModel.findAll();
        const roles = await Role_model_1.RoleModel.findAll();
        return roles.map(role => ({
            role: role.name,
            count: users.filter(u => u.roleId === role.id).length
        }));
    }
    /**
     * Helper: Get books by category
     */
    static async getBooksByCategory() {
        const books = await Book_model_1.BookModel.findAll();
        const categories = await Category_model_1.CategoryModel.findAll();
        return categories.map(cat => ({
            category: cat.category,
            count: books.filter(b => b.categoryId === cat.id).length
        }));
    }
    /**
     * Helper: Calculate average rating
     */
    static calculateAverageRating(reviews) {
        if (reviews.length === 0)
            return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return Number((sum / reviews.length).toFixed(1));
    }
    /**
     * Helper: Get rating distribution
     */
    static getRatingDistribution(reviews) {
        return [1, 2, 3, 4, 5].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length
        }));
    }
}
exports.AdminService = AdminService;
