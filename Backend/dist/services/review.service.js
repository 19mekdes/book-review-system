"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const Review_model_1 = require("../models/Review.model");
const Book_model_1 = require("../models/Book.model");
const User_model_1 = require("../models/User.model");
const error_middleware_1 = require("../middleware/error.middleware");
class ReviewService {
    /**
     * Check if user has reviewed a book
     */
    static async hasUserReviewedBook(userId, bookId) {
        try {
            const allReviews = await Review_model_1.ReviewModel.findAll();
            return allReviews.some(r => r.user_id === userId && r.book_id === bookId);
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to check user review: ${error.message}`);
        }
    }
    /**
     * Get user's review for a specific book
     */
    static async getUserReviewForBook(userId, bookId) {
        try {
            const allReviews = await Review_model_1.ReviewModel.findAll();
            const review = allReviews.find(r => r.user_id === userId && r.book_id === bookId);
            if (!review)
                return null;
            const user = await User_model_1.UserModel.findById(review.user_id);
            const book = await Book_model_1.BookModel.findById(review.book_id);
            return {
                id: review.id,
                user_id: review.user_id,
                book_id: review.book_id,
                rating: review.rating,
                comment: review.comment,
                created_at: review.created_at,
                updated_at: review.updated_at,
                user_name: user?.name || 'Anonymous',
                book_title: book?.title || ''
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user review: ${error.message}`);
        }
    }
    /**
     * Get reviews for a specific book
     */
    static async getBookReviews(bookId, options = {}) {
        try {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const sortBy = options.sortBy || 'created_at';
            const sortOrder = options.sortOrder || 'desc';
            // Check if book exists
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Get all reviews for the book
            const allReviews = await Review_model_1.ReviewModel.findAll();
            const bookReviews = allReviews.filter(review => review.book_id === bookId);
            // Apply sorting
            const sortedReviews = [...bookReviews].sort((a, b) => {
                let aValue, bValue;
                switch (sortBy) {
                    case 'rating':
                        aValue = a.rating;
                        bValue = b.rating;
                        break;
                    case 'created_at':
                    default:
                        aValue = new Date(a.created_at || 0).getTime();
                        bValue = new Date(b.created_at || 0).getTime();
                        break;
                }
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            });
            // Calculate pagination
            const total = sortedReviews.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedReviews = sortedReviews.slice(start, start + limit);
            // Fetch user details for each review
            const reviewsWithUserDetails = await Promise.all(paginatedReviews.map(async (review) => {
                const user = await User_model_1.UserModel.findById(review.user_id);
                return {
                    id: review.id,
                    user_id: review.user_id,
                    book_id: review.book_id,
                    rating: review.rating,
                    comment: review.comment,
                    created_at: review.created_at,
                    updated_at: review.updated_at,
                    user_name: user?.name || 'Anonymous',
                    book_title: book.title
                };
            }));
            return {
                reviews: reviewsWithUserDetails,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get book reviews: ${error.message}`);
        }
    }
    /**
     * Create a new review
     */
    static async createReview(data) {
        try {
            // Check if user exists
            const user = await User_model_1.UserModel.findById(data.userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Check if book exists
            const book = await Book_model_1.BookModel.findById(data.bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Check if user already reviewed this book
            const existingReviews = await Review_model_1.ReviewModel.findAll();
            const userReview = existingReviews.find(r => r.user_id === data.userId && r.book_id === data.bookId);
            if (userReview) {
                throw new error_middleware_1.ApiError(400, 'You have already reviewed this book');
            }
            // Create review
            const newReview = await Review_model_1.ReviewModel.create({
                user_id: data.userId,
                book_id: data.bookId,
                rating: data.rating,
                comment: data.comment,
                updated_at: undefined
            });
            // Update book's average rating
            const bookReviews = existingReviews.filter(r => r.book_id === data.bookId);
            const allBookReviews = [...bookReviews, newReview];
            const averageRating = allBookReviews.reduce((sum, r) => sum + r.rating, 0) / allBookReviews.length;
            // Update book with average rating
            await Book_model_1.BookModel.update(data.bookId, { average_rating: averageRating });
            return {
                id: newReview.id,
                user_id: newReview.user_id,
                book_id: newReview.book_id,
                rating: newReview.rating,
                comment: newReview.comment,
                created_at: newReview.created_at,
                updated_at: newReview.updated_at,
                user_name: user.name,
                book_title: book.title
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create review: ${error.message}`);
        }
    }
    /**
     * Update a review
     */
    static async updateReview(reviewId, userId, isAdmin, updates) {
        try {
            // Check if review exists
            const existingReview = await Review_model_1.ReviewModel.findById(reviewId);
            if (!existingReview) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // Check if user owns the review or is admin
            if (existingReview.user_id !== userId && !isAdmin) {
                throw new error_middleware_1.ApiError(403, 'You can only update your own reviews');
            }
            // Update review
            const updateData = {};
            if (updates.rating !== undefined)
                updateData.rating = updates.rating;
            if (updates.comment !== undefined)
                updateData.comment = updates.comment;
            const updatedReview = await Review_model_1.ReviewModel.update(reviewId, updateData);
            if (!updatedReview) {
                throw new error_middleware_1.ApiError(500, 'Failed to update review');
            }
            // Update book's average rating if rating changed
            if (updates.rating !== undefined) {
                const allReviews = await Review_model_1.ReviewModel.findAll();
                const bookReviews = allReviews.filter(r => r.book_id === existingReview.book_id);
                const averageRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
                await Book_model_1.BookModel.update(existingReview.book_id, { average_rating: averageRating });
            }
            const user = await User_model_1.UserModel.findById(updatedReview.user_id);
            const book = await Book_model_1.BookModel.findById(updatedReview.book_id);
            return {
                id: updatedReview.id,
                user_id: updatedReview.user_id,
                book_id: updatedReview.book_id,
                rating: updatedReview.rating,
                comment: updatedReview.comment,
                created_at: updatedReview.created_at,
                updated_at: updatedReview.updated_at,
                user_name: user?.name || 'Anonymous',
                book_title: book?.title || ''
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update review: ${error.message}`);
        }
    }
    /**
     * Delete a review
     */
    static async deleteReview(reviewId, userId, isAdmin) {
        try {
            // Check if review exists
            const existingReview = await Review_model_1.ReviewModel.findById(reviewId);
            if (!existingReview) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // Check if user owns the review or is admin
            if (existingReview.user_id !== userId && !isAdmin) {
                throw new error_middleware_1.ApiError(403, 'You can only delete your own reviews');
            }
            // Delete review
            const deleted = await Review_model_1.ReviewModel.delete(reviewId);
            // Update book's average rating
            if (deleted) {
                const allReviews = await Review_model_1.ReviewModel.findAll();
                const bookReviews = allReviews.filter(r => r.book_id === existingReview.book_id);
                const averageRating = bookReviews.length > 0
                    ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
                    : 0;
                await Book_model_1.BookModel.update(existingReview.book_id, { average_rating: averageRating });
            }
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete review: ${error.message}`);
        }
    }
    /**
     * Mark a review as helpful
     */
    static async markHelpful(reviewId, userId) {
        try {
            // Check if review exists
            const review = await Review_model_1.ReviewModel.findById(reviewId);
            if (!review) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // For now, just return the count
            return { helpful_count: 0 };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to mark review as helpful: ${error.message}`);
        }
    }
    /**
     * Report a review
     */
    static async reportReview(reviewId, userId, reason) {
        try {
            // Check if review exists
            const review = await Review_model_1.ReviewModel.findById(reviewId);
            if (!review) {
                throw new error_middleware_1.ApiError(404, 'Review not found');
            }
            // For now, just return true
            return true;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to report review: ${error.message}`);
        }
    }
    /**
     * Get user's reviews
     */
    static async getUserReviews(userId, page = 1, limit = 10) {
        try {
            const allReviews = await Review_model_1.ReviewModel.findAll();
            const userReviews = allReviews.filter(review => review.user_id === userId);
            // Calculate pagination
            const total = userReviews.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedReviews = userReviews.slice(start, start + limit);
            // Fetch book details for each review
            const reviewsWithBookDetails = await Promise.all(paginatedReviews.map(async (review) => {
                const book = await Book_model_1.BookModel.findById(review.book_id);
                return {
                    id: review.id,
                    user_id: review.user_id,
                    book_id: review.book_id,
                    rating: review.rating,
                    comment: review.comment,
                    created_at: review.created_at,
                    updated_at: review.updated_at,
                    book_title: book?.title || 'Unknown Book',
                    book_author: book?.author || 'Unknown Author'
                };
            }));
            return {
                reviews: reviewsWithBookDetails,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get user reviews: ${error.message}`);
        }
    }
    /**
     * Get review statistics for a book
     */
    static async getReviewStats(bookId) {
        try {
            const allReviews = await Review_model_1.ReviewModel.findAll();
            const bookReviews = allReviews.filter(review => review.book_id === bookId);
            if (bookReviews.length === 0) {
                return {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
                        rating,
                        count: 0,
                        percentage: 0
                    }))
                };
            }
            const averageRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
            const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
                const count = bookReviews.filter(r => r.rating === rating).length;
                return {
                    rating,
                    count,
                    percentage: (count / bookReviews.length) * 100
                };
            });
            return {
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews: bookReviews.length,
                ratingDistribution
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get review stats: ${error.message}`);
        }
    }
    /**
     * Get all reviews (admin only)
     */
    static async getAllReviews(page = 1, limit = 10, status, search) {
        try {
            console.log('🔍 Fetching all reviews...');
            // Get all reviews from the model
            let allReviews = await Review_model_1.ReviewModel.findAll();
            // Ensure we have an array
            if (!Array.isArray(allReviews)) {
                console.error('❌ ReviewModel.findAll() did not return an array');
                allReviews = [];
            }
            console.log(`📊 Found ${allReviews.length} total reviews`);
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                const originalCount = allReviews.length;
                allReviews = allReviews.filter(r => (r.comment?.toLowerCase() || '').includes(searchLower) ||
                    r.title?.toLowerCase().includes(searchLower));
                console.log(`🔍 After search filter: ${allReviews.length} reviews (filtered from ${originalCount})`);
            }
            // Apply status filter (if needed)
            if (status && status !== 'all') {
                allReviews = allReviews.filter(r => r.status === status);
            }
            // Calculate pagination
            const total = allReviews.length;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const start = (page - 1) * limit;
            const paginatedReviews = allReviews.slice(start, start + limit);
            console.log(`📄 Returning page ${page} of ${totalPages}, showing ${paginatedReviews.length} reviews`);
            // Fetch user and book details with error handling
            const reviewsWithDetails = await Promise.all(paginatedReviews.map(async (review) => {
                try {
                    // Get user details
                    let user = null;
                    try {
                        user = await User_model_1.UserModel.findById(review.user_id);
                    }
                    catch (userError) {
                        console.error(`Error fetching user ${review.user_id}:`, userError);
                    }
                    // Get book details
                    let book = null;
                    try {
                        book = await Book_model_1.BookModel.findById(review.book_id);
                    }
                    catch (bookError) {
                        console.error(`Error fetching book ${review.book_id}:`, bookError);
                    }
                    return {
                        id: review.id,
                        user_id: review.user_id,
                        book_id: review.book_id,
                        rating: review.rating,
                        comment: review.comment,
                        created_at: review.created_at,
                        updated_at: review.updated_at,
                        user_name: user?.name || 'Anonymous User',
                        user_email: user?.email || '',
                        book_title: book?.title || 'Unknown Book',
                        book_author: book?.author || 'Unknown Author'
                    };
                }
                catch (err) {
                    console.error(`Error processing review ${review.id}:`, err);
                    // Return a fallback object for this review
                    return {
                        id: review.id,
                        user_id: review.user_id,
                        book_id: review.book_id,
                        rating: review.rating,
                        comment: review.comment,
                        created_at: review.created_at,
                        updated_at: review.updated_at,
                        user_name: 'Unknown User',
                        user_email: '',
                        book_title: 'Unknown Book',
                        book_author: 'Unknown Author'
                    };
                }
            }));
            console.log(`✅ Successfully processed ${reviewsWithDetails.length} reviews`);
            return {
                reviews: reviewsWithDetails,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            console.error('❌ Error in getAllReviews:', error);
            // Return empty result instead of throwing to prevent 500 errors
            return {
                reviews: [],
                total: 0,
                page,
                limit,
                totalPages: 1
            };
        }
    }
}
exports.ReviewService = ReviewService;
