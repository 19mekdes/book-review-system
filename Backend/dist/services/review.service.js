"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const Review_model_1 = require("../models/Review.model");
const Book_model_1 = require("../models/Book.model");
const User_model_1 = require("../models/User.model");
const error_middleware_1 = require("../middleware/error.middleware");
class ReviewService {
    /**
     * Get all reviews with filters and pagination
     */
    static async getAllReviews(filters = {}) {
        try {
            const { userId, bookId, minRating, maxRating, search, sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 10, startDate, endDate } = filters;
            // Get all reviews
            let reviews = await Review_model_1.ReviewModel.findAll();
            // Apply user filter
            if (userId) {
                reviews = reviews.filter(r => r.user_id === userId);
            }
            // Apply book filter
            if (bookId) {
                reviews = reviews.filter(r => r.book_id === bookId);
            }
            // Apply rating range filter
            if (minRating !== undefined) {
                reviews = reviews.filter(r => r.rating >= minRating);
            }
            if (maxRating !== undefined) {
                reviews = reviews.filter(r => r.rating <= maxRating);
            }
            // Apply date range filter
            if (startDate) {
                reviews = reviews.filter(r => r.created_at && new Date(r.created_at) >= startDate);
            }
            if (endDate) {
                reviews = reviews.filter(r => r.created_at && new Date(r.created_at) <= endDate);
            }
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                reviews = reviews.filter(r => r.comment?.toLowerCase().includes(searchLower) ||
                    r.user_name?.toLowerCase().includes(searchLower) ||
                    r.book_title?.toLowerCase().includes(searchLower));
            }
            // Calculate average rating for filtered results
            const averageRating = reviews.length > 0
                ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
                : 0;
            // Sort reviews
            reviews = this.sortReviews(reviews, sortBy, sortOrder);
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
                totalPages,
                averageRating,
                filters
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get reviews: ${error.message}`);
        }
    }
    /**
     * Get review by ID
     */
    static async getReviewById(reviewId) {
        try {
            const review = await Review_model_1.ReviewModel.findById(reviewId);
            if (!review) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            return review;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get review: ${error.message}`);
        }
    }
    /**
     * Get reviews by book ID
     */
    static async getReviewsByBookId(bookId, filters = {}) {
        try {
            // Check if book exists
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            return this.getAllReviews({
                ...filters,
                bookId
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get book reviews: ${error.message}`);
        }
    }
    /**
     * Get reviews by user ID
     */
    static async getReviewsByUserId(userId, filters = {}) {
        try {
            // Check if user exists
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            return this.getAllReviews({
                ...filters,
                userId
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get user reviews: ${error.message}`);
        }
    }
    /**
     * Create new review
     */
    static async createReview(input) {
        try {
            // Validate user exists
            const user = await User_model_1.UserModel.findById(input.user_id);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Validate book exists
            const book = await Book_model_1.BookModel.findById(input.book_id);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Check if user already reviewed this book
            const existingReviews = await Review_model_1.ReviewModel.findByUserId(input.user_id);
            const alreadyReviewed = existingReviews.some(r => r.book_id === input.book_id);
            if (alreadyReviewed) {
                throw new error_middleware_1.ApiError(400, 'You have already reviewed this book');
            }
            // Validate rating
            if (input.rating < 1 || input.rating > 5) {
                throw new error_middleware_1.ApiError(400, 'Rating must be between 1 and 5');
            }
            // Validate comment length
            if (input.comment && input.comment.length > 1000) {
                throw new error_middleware_1.ApiError(400, 'Comment must not exceed 1000 characters');
            }
            // Create review
            const newReview = await Review_model_1.ReviewModel.create(input);
            return newReview;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create review: ${error.message}`);
        }
    }
    /**
     * Update review
     */
    static async updateReview(reviewId, userId, updates, isAdmin = false) {
        try {
            // Check if review exists
            const existingReview = await Review_model_1.ReviewModel.findById(reviewId);
            if (!existingReview) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // Check permission (user can only update their own reviews, admin can update any)
            if (!isAdmin && existingReview.user_id !== userId) {
                throw new error_middleware_1.ApiError(403, 'You can only update your own reviews');
            }
            // Validate rating if being updated
            if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
                throw new error_middleware_1.ApiError(400, 'Rating must be between 1 and 5');
            }
            // Validate comment length if being updated
            if (updates.comment && updates.comment.length > 1000) {
                throw new error_middleware_1.ApiError(400, 'Comment must not exceed 1000 characters');
            }
            // Update review
            const updatedReview = await Review_model_1.ReviewModel.update(reviewId, updates);
            if (!updatedReview) {
                throw new error_middleware_1.ApiError(500, 'Failed to update review');
            }
            return updatedReview;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update review: ${error.message}`);
        }
    }
    /**
     * Delete review
     */
    static async deleteReview(reviewId, userId, isAdmin = false) {
        try {
            // Check if review exists
            const existingReview = await Review_model_1.ReviewModel.findById(reviewId);
            if (!existingReview) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // Check permission (user can only delete their own reviews, admin can delete any)
            if (!isAdmin && existingReview.user_id !== userId) {
                throw new error_middleware_1.ApiError(403, 'You can only delete your own reviews');
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
     * Get latest reviews
     */
    static async getLatestReviews(limit = 10) {
        try {
            const reviews = await Review_model_1.ReviewModel.getLatestReviews(limit);
            return reviews;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get latest reviews: ${error.message}`);
        }
    }
    /**
     * Get review statistics
     */
    static async getReviewStats(bookId, userId) {
        try {
            let reviews = await Review_model_1.ReviewModel.findAll();
            // Filter by book if specified
            if (bookId) {
                reviews = reviews.filter(r => r.book_id === bookId);
            }
            // Filter by user if specified
            if (userId) {
                reviews = reviews.filter(r => r.user_id === userId);
            }
            // Calculate overall stats
            const totalReviews = reviews.length;
            const averageRating = totalReviews > 0
                ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
                : 0;
            // Calculate rating distribution
            const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = totalReviews > 0
                    ? Number(((count / totalReviews) * 100).toFixed(1))
                    : 0;
                return { rating, count, percentage };
            });
            // Get reviews by user
            const userMap = new Map();
            for (const review of reviews) {
                if (!userMap.has(review.user_id)) {
                    userMap.set(review.user_id, {
                        count: 0,
                        totalRating: 0,
                        userName: review.user_name || `User ${review.user_id}`
                    });
                }
                const userData = userMap.get(review.user_id);
                userData.count++;
                userData.totalRating += review.rating;
            }
            const reviewsByUser = Array.from(userMap.entries())
                .map(([userId, data]) => ({
                userId,
                userName: data.userName,
                reviewCount: data.count,
                averageRating: Number((data.totalRating / data.count).toFixed(1))
            }))
                .sort((a, b) => b.reviewCount - a.reviewCount)
                .slice(0, 10);
            // Get reviews by book
            const bookMap = new Map();
            for (const review of reviews) {
                if (!bookMap.has(review.book_id)) {
                    bookMap.set(review.book_id, {
                        count: 0,
                        totalRating: 0,
                        bookTitle: review.book_title || `Book ${review.book_id}`
                    });
                }
                const bookData = bookMap.get(review.book_id);
                bookData.count++;
                bookData.totalRating += review.rating;
            }
            const reviewsByBook = Array.from(bookMap.entries())
                .map(([bookId, data]) => ({
                bookId,
                bookTitle: data.bookTitle,
                reviewCount: data.count,
                averageRating: Number((data.totalRating / data.count).toFixed(1))
            }))
                .sort((a, b) => b.reviewCount - a.reviewCount)
                .slice(0, 10);
            // Get recent activity
            const recentActivity = [...reviews]
                .sort((a, b) => {
                if (!a.created_at)
                    return 1;
                if (!b.created_at)
                    return -1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
                .slice(0, 10);
            // Get top reviewers
            const topReviewers = reviewsByUser.slice(0, 5);
            return {
                totalReviews,
                averageRating,
                ratingDistribution,
                reviewsByUser,
                reviewsByBook,
                recentActivity,
                topReviewers
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get review stats: ${error.message}`);
        }
    }
    /**
     * Check if user has reviewed a book
     */
    static async hasUserReviewedBook(userId, bookId) {
        try {
            const userReviews = await Review_model_1.ReviewModel.findByUserId(userId);
            return userReviews.some(r => r.book_id === bookId);
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to check review status: ${error.message}`);
        }
    }
    /**
     * Get user's review for a specific book
     */
    static async getUserReviewForBook(userId, bookId) {
        try {
            const userReviews = await Review_model_1.ReviewModel.findByUserId(userId);
            return userReviews.find(r => r.book_id === bookId) || null;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user review: ${error.message}`);
        }
    }
    /**
     * Get rating summary for a book
     */
    static async getBookRatingSummary(bookId) {
        try {
            const reviews = await Review_model_1.ReviewModel.findByBookId(bookId);
            const total = reviews.length;
            const average = total > 0
                ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
                : 0;
            const distribution = [5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = total > 0
                    ? Number(((count / total) * 100).toFixed(1))
                    : 0;
                return { rating, count, percentage };
            });
            return { average, total, distribution };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get rating summary: ${error.message}`);
        }
    }
    /**
     * Get user's review activity summary
     */
    static async getUserReviewSummary(userId) {
        try {
            const reviews = await Review_model_1.ReviewModel.findByUserId(userId);
            const totalReviews = reviews.length;
            const averageRating = totalReviews > 0
                ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
                : 0;
            // Get rating distribution
            const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
                rating,
                count: reviews.filter(r => r.rating === rating).length
            }));
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
            // Determine favorite category (if we had category info in reviews)
            // This would require joining with books to get categories
            let favoriteCategory;
            if (reviews.length > 0) {
                // Get book details for each review
                const bookPromises = reviews.map(r => Book_model_1.BookModel.findById(r.book_id));
                const books = await Promise.all(bookPromises);
                const categoryCount = new Map();
                books.forEach(book => {
                    if (book?.category) {
                        categoryCount.set(book.category, (categoryCount.get(book.category) || 0) + 1);
                    }
                });
                let maxCount = 0;
                categoryCount.forEach((count, category) => {
                    if (count > maxCount) {
                        maxCount = count;
                        favoriteCategory = category;
                    }
                });
            }
            return {
                totalReviews,
                averageRating,
                favoriteCategory,
                recentReviews,
                ratingDistribution
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user review summary: ${error.message}`);
        }
    }
    /**
     * Sort reviews by given criteria
     */
    static sortReviews(reviews, sortBy, sortOrder) {
        const sorted = [...reviews];
        switch (sortBy) {
            case 'rating':
                sorted.sort((a, b) => a.rating - b.rating);
                break;
            case 'created_at':
                sorted.sort((a, b) => {
                    if (!a.created_at)
                        return 1;
                    if (!b.created_at)
                        return -1;
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                });
                break;
            case 'user':
                sorted.sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));
                break;
            case 'book':
                sorted.sort((a, b) => (a.book_title || '').localeCompare(b.book_title || ''));
                break;
            default:
                sorted.sort((a, b) => {
                    if (!a.created_at)
                        return 1;
                    if (!b.created_at)
                        return -1;
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                });
        }
        return sortOrder === 'desc' ? sorted.reverse() : sorted;
    }
    /**
     * Bulk create reviews (admin only)
     */
    static async bulkCreateReviews(reviews) {
        try {
            const createdReviews = [];
            const errors = [];
            for (const reviewData of reviews) {
                try {
                    // Validate user exists
                    const user = await User_model_1.UserModel.findById(reviewData.user_id);
                    if (!user) {
                        errors.push({ review: reviewData, error: 'User not found' });
                        continue;
                    }
                    // Validate book exists
                    const book = await Book_model_1.BookModel.findById(reviewData.book_id);
                    if (!book) {
                        errors.push({ review: reviewData, error: 'Book not found' });
                        continue;
                    }
                    // Check for duplicate
                    const existingReviews = await Review_model_1.ReviewModel.findByUserId(reviewData.user_id);
                    const duplicate = existingReviews.some(r => r.book_id === reviewData.book_id);
                    if (duplicate) {
                        errors.push({ review: reviewData, error: 'User already reviewed this book' });
                        continue;
                    }
                    // Validate rating
                    if (reviewData.rating < 1 || reviewData.rating > 5) {
                        errors.push({ review: reviewData, error: 'Rating must be between 1 and 5' });
                        continue;
                    }
                    const newReview = await Review_model_1.ReviewModel.create(reviewData);
                    createdReviews.push(newReview);
                }
                catch (error) {
                    errors.push({ review: reviewData, error: error.message });
                }
            }
            if (errors.length > 0) {
                throw new error_middleware_1.ApiError(400, `Bulk create completed with errors: ${JSON.stringify(errors)}`);
            }
            return createdReviews;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to bulk create reviews: ${error.message}`);
        }
    }
}
exports.ReviewService = ReviewService;
