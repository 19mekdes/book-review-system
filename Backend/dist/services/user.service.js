"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_model_1 = require("../models/User.model");
const Review_model_1 = require("../models/Review.model");
const Role_model_1 = require("../models/Role.model");
const Book_model_1 = require("../models/Book.model"); // ✅ Added missing import
const error_middleware_1 = require("../middleware/error.middleware");
const bcrypt_utils_1 = require("../utils/bcrypt.utils"); // ✅ Fixed import (class, not instance)
const jwt_utils_1 = require("../utils/jwt.utils"); // ✅ Fixed import (class, not instance)
class UserService {
    /**
     * Get all users with filters and pagination
     */
    static async getAllUsers(filters = {}) {
        try {
            const { search, role, minReviews, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10, startDate, endDate } = filters;
            // Get all users with review counts
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
            // Apply minimum reviews filter
            if (minReviews !== undefined) {
                users = users.filter(u => (u.review_count || 0) >= minReviews);
            }
            // Apply date range filter
            if (startDate || endDate) {
                users = users.filter(u => {
                    if (!u.created_at)
                        return false;
                    const userDate = new Date(u.created_at);
                    if (startDate && userDate < startDate)
                        return false;
                    if (endDate && userDate > endDate)
                        return false;
                    return true;
                });
            }
            // Sort users
            users = this.sortUsers(users, sortBy, sortOrder);
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
                totalPages,
                filters
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
     * Get user profile with detailed information
     */
    static async getUserProfile(userId) {
        try {
            // Get user basic info
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Get user's reviews
            const reviews = await Review_model_1.ReviewModel.findByUserId(userId);
            // Calculate review statistics
            const reviewCount = reviews.length;
            const averageRating = reviewCount > 0
                ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
                : 0;
            // Get recent reviews
            const recentReviews = [...reviews]
                .sort((a, b) => {
                if (!a.created_at)
                    return 1;
                if (!b.created_at)
                    return -1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
                .slice(0, 5);
            // Calculate rating distribution
            const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviewCount > 0
                    ? Number(((count / reviewCount) * 100).toFixed(1))
                    : 0;
                return { rating, count, percentage };
            });
            // Get favorite categories
            const favoriteCategories = await this.getUserFavoriteCategories(userId, reviews);
            // Calculate reading activity
            const uniqueBooks = new Set(reviews.map(r => r.book_id)).size;
            const dates = reviews
                .map(r => r.created_at)
                .filter((d) => d !== undefined)
                .map(d => new Date(d));
            const firstReview = dates.length > 0
                ? new Date(Math.min(...dates.map(d => d.getTime())))
                : undefined;
            const lastActive = dates.length > 0
                ? new Date(Math.max(...dates.map(d => d.getTime())))
                : undefined;
            return {
                ...user,
                reviewCount,
                averageRating,
                recentReviews,
                favoriteCategories,
                readingActivity: {
                    totalReviews: reviewCount,
                    totalBooksRead: uniqueBooks,
                    averageRating,
                    firstReview,
                    lastActive
                },
                ratingDistribution
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get user profile: ${error.message}`);
        }
    }
    /**
     * Create new user
     */
    static async createUser(input) {
        try {
            // Check if user exists
            const existingUser = await User_model_1.UserModel.findByEmail(input.email);
            if (existingUser) {
                throw new error_middleware_1.ApiError(400, 'User with this email already exists');
            }
            // Validate password strength
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(input.password); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Validate role if provided
            if (input.roleId) {
                const role = await Role_model_1.RoleModel.findById(input.roleId);
                if (!role) {
                    throw new error_middleware_1.ApiError(400, 'Invalid role');
                }
            }
            // Hash password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(input.password); // ✅ Fixed
            // Create user
            const newUser = await User_model_1.UserModel.create({
                name: input.name,
                email: input.email,
                password: hashedPassword,
                roleId: input.roleId || 2 // Default to regular user
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
     * Update user
     */
    static async updateUser(userId, updates, isAdmin = false) {
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
            // If updating password, validate and hash it
            if (updates.password) {
                const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(updates.password); // ✅ Fixed
                if (!passwordValidation.isValid) {
                    throw new error_middleware_1.ApiError(400, passwordValidation.message);
                }
                updates.password = await bcrypt_utils_1.BcryptUtils.hashPassword(updates.password); // ✅ Fixed
            }
            // If updating role, validate it (admin only)
            if (updates.roleId && isAdmin) {
                const role = await Role_model_1.RoleModel.findById(updates.roleId);
                if (!role) {
                    throw new error_middleware_1.ApiError(400, 'Invalid role');
                }
            }
            else if (updates.roleId && !isAdmin) {
                // Non-admins cannot change roles
                delete updates.roleId;
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
     * Delete user
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
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete user: ${error.message}`);
        }
    }
    /**
     * Get user statistics
     */
    static async getUserStats() {
        try {
            const users = await User_model_1.UserModel.getUsersWithReviewCounts();
            const reviews = await Review_model_1.ReviewModel.findAll();
            // Calculate total users
            const totalUsers = users.length;
            // Calculate active users (users with at least 1 review)
            const activeUsers = users.filter(u => (u.review_count || 0) > 0).length;
            // Get users by role
            const roles = await Role_model_1.RoleModel.findAll();
            const usersByRole = roles.map(role => {
                const count = users.filter(u => u.role_name === role.name).length;
                const percentage = totalUsers > 0
                    ? Number(((count / totalUsers) * 100).toFixed(1))
                    : 0;
                return {
                    role: role.name,
                    count,
                    percentage
                };
            });
            // Calculate new users this month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const newUsersThisMonth = users.filter(u => {
                if (!u.created_at)
                    return false;
                return new Date(u.created_at) >= firstDayOfMonth;
            }).length;
            // Get top reviewers
            const topReviewers = users
                .filter(u => (u.review_count || 0) > 0)
                .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
                .slice(0, 5)
                .map(u => {
                const userReviews = reviews.filter(r => r.user_id === u.id);
                const avgRating = userReviews.length > 0
                    ? Number((userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1))
                    : 0;
                return {
                    userId: u.id,
                    name: u.name,
                    reviewCount: u.review_count || 0,
                    averageRating: avgRating
                };
            });
            // Calculate user growth (last 6 months)
            const userGrowth = [];
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
                const count = users.filter(u => {
                    if (!u.created_at)
                        return false;
                    const userDate = new Date(u.created_at);
                    return userDate >= month && userDate < nextMonth;
                }).length;
                userGrowth.push({
                    month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
                    count
                });
            }
            return {
                totalUsers,
                activeUsers,
                usersByRole,
                newUsersThisMonth,
                topReviewers,
                userGrowth
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user stats: ${error.message}`);
        }
    }
    /**
     * Get user's favorite categories
     */
    static async getUserFavoriteCategories(userId, reviews) {
        try {
            if (reviews.length === 0)
                return [];
            // Get book details for each review
            const bookPromises = reviews.map(r => Book_model_1.BookModel.findById(r.book_id) // ✅ Fixed - use direct import, not dynamic import
            );
            const books = await Promise.all(bookPromises);
            // Group by category
            const categoryMap = new Map();
            reviews.forEach((review, index) => {
                const book = books[index];
                if (book?.category) {
                    const current = categoryMap.get(book.category) || { count: 0, totalRating: 0 };
                    current.count++;
                    current.totalRating += review.rating;
                    categoryMap.set(book.category, current);
                }
            });
            // Convert to array and calculate averages
            const favorites = Array.from(categoryMap.entries())
                .map(([category, data]) => ({
                category,
                count: data.count,
                averageRating: Number((data.totalRating / data.count).toFixed(1))
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            return favorites;
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Sort users by given criteria
     */
    static sortUsers(users, sortBy, sortOrder) {
        const sorted = [...users];
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'email':
                sorted.sort((a, b) => a.email.localeCompare(b.email));
                break;
            case 'role':
                sorted.sort((a, b) => (a.role_name || '').localeCompare(b.role_name || ''));
                break;
            case 'reviews':
                sorted.sort((a, b) => (a.review_count || 0) - (b.review_count || 0));
                break;
            case 'joined':
                sorted.sort((a, b) => {
                    if (!a.created_at)
                        return 1;
                    if (!b.created_at)
                        return -1;
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                });
                break;
            default:
                sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        return sortOrder === 'desc' ? sorted.reverse() : sorted;
    }
    /**
     * Search users
     */
    static async searchUsers(query, filters) {
        try {
            return this.getAllUsers({
                ...filters,
                search: query
            });
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to search users: ${error.message}`);
        }
    }
    /**
     * Get user by email
     */
    static async getUserByEmail(email) {
        try {
            const user = await User_model_1.UserModel.findByEmail(email);
            if (!user) {
                return null;
            }
            // Get user with role
            const userWithRole = await User_model_1.UserModel.findById(user.id);
            return userWithRole;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user by email: ${error.message}`);
        }
    }
    /**
     * Update user password
     */
    static async updatePassword(userId, currentPassword, newPassword) {
        try {
            // Get user with password
            const user = await User_model_1.UserModel.findByEmail((await User_model_1.UserModel.findById(userId))?.email || '');
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Verify current password
            const isValidPassword = await bcrypt_utils_1.BcryptUtils.comparePassword(// ✅ Fixed
            currentPassword, user.password);
            if (!isValidPassword) {
                throw new error_middleware_1.ApiError(401, 'Current password is incorrect');
            }
            // Validate new password
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(newPassword); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Hash new password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(newPassword); // ✅ Fixed
            // Update password
            await User_model_1.UserModel.update(userId, { password: hashedPassword });
            // Revoke all refresh tokens for this user
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed
            return true;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update password: ${error.message}`);
        }
    }
    /**
     * Get user activity summary
     */
    static async getUserActivitySummary(userId) {
        try {
            const reviews = await Review_model_1.ReviewModel.findByUserId(userId);
            // Group reviews by month
            const monthlyActivity = new Map();
            reviews.forEach(review => {
                if (review.created_at) {
                    const month = new Date(review.created_at).toLocaleString('default', {
                        month: 'short',
                        year: 'numeric'
                    });
                    monthlyActivity.set(month, (monthlyActivity.get(month) || 0) + 1);
                }
            });
            // Convert to array and sort chronologically
            const activityByMonth = Array.from(monthlyActivity.entries())
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => {
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateA.getTime() - dateB.getTime();
            });
            return {
                totalReviews: reviews.length,
                activityByMonth,
                lastActive: reviews.length > 0 ? reviews[0].created_at : null
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user activity: ${error.message}`);
        }
    }
}
exports.UserService = UserService;
