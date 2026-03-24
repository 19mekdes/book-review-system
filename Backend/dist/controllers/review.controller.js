"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
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
const getQueryDate = (param) => {
    const str = getQueryString(param);
    if (str) {
        const date = new Date(str);
        return isNaN(date.getTime()) ? undefined : date;
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
    if (str === 'rating' || str === 'created_at' || str === 'user' || str === 'book') {
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
class ReviewController {
    /**
     * Get all reviews with filters
     */
    static async getAllReviews(req, res) {
        try {
            const filters = {
                userId: getQueryNumber(req.query.userId),
                bookId: getQueryNumber(req.query.bookId),
                minRating: getQueryNumber(req.query.minRating),
                maxRating: getQueryNumber(req.query.maxRating),
                search: getQueryString(req.query.search),
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10,
                startDate: getQueryDate(req.query.startDate),
                endDate: getQueryDate(req.query.endDate)
            };
            const result = await review_service_1.ReviewService.getAllReviews(filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Reviews retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get reviews'));
        }
    }
    /**
     * Get review by ID
     */
    static async getReviewById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const reviewId = parseInt(idParam || '', 10);
            if (isNaN(reviewId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid review ID'));
            }
            const review = await review_service_1.ReviewService.getReviewById(reviewId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(review, 'Review retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get review'));
        }
    }
    /**
     * Get reviews by book ID
     */
    static async getReviewsByBookId(req, res) {
        try {
            const bookIdParam = getRouteParam(req.params.bookId);
            const bookId = parseInt(bookIdParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const filters = {
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10
            };
            const result = await review_service_1.ReviewService.getReviewsByBookId(bookId, filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Book reviews retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book reviews'));
        }
    }
    /**
     * Get reviews by user ID
     */
    static async getReviewsByUserId(req, res) {
        try {
            const userIdParam = getRouteParam(req.params.userId);
            const userId = parseInt(userIdParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const filters = {
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10
            };
            const result = await review_service_1.ReviewService.getReviewsByUserId(userId, filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'User reviews retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user reviews'));
        }
    }
    /**
     * Get latest reviews
     */
    static async getLatestReviews(req, res) {
        try {
            const limit = getQueryNumber(req.query.limit) || 10;
            const reviews = await review_service_1.ReviewService.getLatestReviews(limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(reviews, 'Latest reviews retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get latest reviews'));
        }
    }
    /**
     * Get review statistics
     */
    static async getReviewStats(req, res) {
        try {
            const bookId = getQueryNumber(req.query.bookId);
            const userId = getQueryNumber(req.query.userId);
            const stats = await review_service_1.ReviewService.getReviewStats(bookId, userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Review statistics retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get review statistics'));
        }
    }
    /**
     * Get book rating summary
     */
    static async getBookRatingSummary(req, res) {
        try {
            const bookIdParam = getRouteParam(req.params.bookId);
            const bookId = parseInt(bookIdParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const summary = await review_service_1.ReviewService.getBookRatingSummary(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(summary, 'Book rating summary retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book rating summary'));
        }
    }
    /**
     * Get user review summary
     */
    static async getUserReviewSummary(req, res) {
        try {
            const userIdParam = getRouteParam(req.params.userId);
            const userId = parseInt(userIdParam || '', 10);
            if (isNaN(userId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID'));
            }
            const summary = await review_service_1.ReviewService.getUserReviewSummary(userId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(summary, 'User review summary retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get user review summary'));
        }
    }
    /**
     * Check if user has reviewed a book
     */
    static async hasUserReviewedBook(req, res) {
        try {
            const userIdParam = getRouteParam(req.params.userId);
            const bookIdParam = getRouteParam(req.params.bookId);
            const userId = parseInt(userIdParam || '', 10);
            const bookId = parseInt(bookIdParam || '', 10);
            if (isNaN(userId) || isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID or book ID'));
            }
            const hasReviewed = await review_service_1.ReviewService.hasUserReviewedBook(userId, bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success({ hasReviewed }, 'Check completed successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to check review status'));
        }
    }
    /**
     * Get user's review for a specific book
     */
    static async getUserReviewForBook(req, res) {
        try {
            const userIdParam = getRouteParam(req.params.userId);
            const bookIdParam = getRouteParam(req.params.bookId);
            const userId = parseInt(userIdParam || '', 10);
            const bookId = parseInt(bookIdParam || '', 10);
            if (isNaN(userId) || isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid user ID or book ID'));
            }
            const review = await review_service_1.ReviewService.getUserReviewForBook(userId, bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(review, 'Review retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get review'));
        }
    }
    /**
     * Create new review (authenticated users only)
     */
    static async createReview(req, res) {
        try {
            const { book_id, rating, comment } = req.body;
            const user_id = req.user.id;
            if (!book_id || !rating) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Book ID and rating are required'));
            }
            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Rating must be between 1 and 5'));
            }
            const review = await review_service_1.ReviewService.createReview({
                user_id,
                book_id,
                rating,
                comment
            });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(review, 'Review created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create review'));
        }
    }
    /**
     * Update review (authenticated users only)
     */
    static async updateReview(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const reviewId = parseInt(idParam || '', 10);
            if (isNaN(reviewId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid review ID'));
            }
            const { rating, comment } = req.body;
            const userId = req.user.id;
            const isAdmin = req.user.roleId === 1; // Check if user is admin
            // Validate rating if provided
            if (rating !== undefined && (rating < 1 || rating > 5)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Rating must be between 1 and 5'));
            }
            const review = await review_service_1.ReviewService.updateReview(reviewId, userId, { rating, comment }, isAdmin);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(review, 'Review updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update review'));
        }
    }
    /**
     * Delete review (authenticated users only)
     */
    static async deleteReview(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const reviewId = parseInt(idParam || '', 10);
            if (isNaN(reviewId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid review ID'));
            }
            const userId = req.user.id;
            const isAdmin = req.user.roleId === 1;
            await review_service_1.ReviewService.deleteReview(reviewId, userId, isAdmin);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Review deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete review'));
        }
    }
    /**
     * Bulk create reviews (admin only)
     */
    static async bulkCreateReviews(req, res) {
        try {
            const { reviews } = req.body;
            if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Reviews array is required'));
            }
            const createdReviews = await review_service_1.ReviewService.bulkCreateReviews(reviews);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(createdReviews, `${createdReviews.length} reviews created successfully`));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to bulk create reviews'));
        }
    }
}
exports.ReviewController = ReviewController;
