import { NextFunction, Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { BookModel } from '../models/Book.model';

// Helper functions
const getQueryNumber = (param: unknown): number | undefined => {
  if (typeof param === 'string') {
    const num = parseInt(param, 10);
    return isNaN(num) ? undefined : num;
  }
  if (Array.isArray(param) && param.length > 0) {
    const num = parseInt(param[0], 10);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

const getQueryString = (param: unknown): string | undefined => {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && param.length > 0) return param[0];
  return undefined;
};

const getRouteParam = (param: string | string[] | undefined): string | undefined => {
  if (Array.isArray(param)) return param[0];
  return param;
};

export class ReviewController {
  /**
   * Get all reviews (public - no authentication required)
   */
  static async getAllReviewsPublic(req: Request, res: Response) {
    try {
      const page = getQueryNumber(req.query.page) || 1;
      const limit = getQueryNumber(req.query.limit) || 10;
      const search = getQueryString(req.query.search);
      const sortBy = getQueryString(req.query.sortBy) || 'created_at';
      const sortOrder = (getQueryString(req.query.sortOrder) as 'asc' | 'desc') || 'desc';
      
      console.log(`📋 Getting public reviews - page: ${page}, limit: ${limit}, search: ${search}`);
      
      const result = await ReviewService.getAllReviews(page, limit, undefined, search);
      
      // Sort the results
      if (result.reviews && result.reviews.length > 0) {
        result.reviews.sort((a, b) => {
          if (sortBy === 'rating') {
            return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
          } else {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
        });
      }
      
      return res.json(
        ApiResponseUtil.success(result, 'Reviews retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllReviewsPublic:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get reviews')
      );
    }
  }

  /**
   * Get all reviews (admin only)
   */
  static async getAllReviewsAdmin(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      // Check if user is admin
      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required')
        );
      }

      const page = getQueryNumber(req.query.page) || 1;
      const limit = getQueryNumber(req.query.limit) || 10;
      const status = getQueryString(req.query.status);
      const search = getQueryString(req.query.search);

      console.log(`📋 Admin getting all reviews - page: ${page}, limit: ${limit}`);
      
      const result = await ReviewService.getAllReviews(page, limit, status, search);
      
      return res.json(
        ApiResponseUtil.success(result, 'All reviews retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllReviewsAdmin:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get all reviews')
      );
    }
  }

  /**
   * Create a review for a book (authenticated users only)
   * ✅ UPDATED: Added notification trigger
   */
  static async createReview(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const { bookId, rating, title, comment } = req.body;
      const userId = req.user.id;
      const userName = req.user.name || 'A user';

      if (!bookId || !rating || !comment) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Book ID, rating, and comment are required')
        );
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Rating must be between 1 and 5')
        );
      }

      // Create the review
      const review = await ReviewService.createReview({
        userId,
        bookId,
        rating,
        title,
        comment
      });

      //  Get book details for notification
      const book = await BookModel.findById(parseInt(bookId));
      if (book) {
        //  Trigger notification for users who follow this book
        const notifiedCount = await NotificationService.notifyOnNewReview(
          parseInt(bookId),
          review.id,
          userName,
          book.title,
          userId
        );
        console.log(`📢 Created ${notifiedCount} notifications for new review`);
      }

      return res.status(201).json(
        ApiResponseUtil.created(review, 'Review created successfully')
      );
    } catch (error: any) {
      console.error('Error in createReview:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to create review')
      );
    }
  }

  /**
   * Update a review (owner or admin only)
   */
  static async updateReview(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const reviewIdParam = getRouteParam(req.params.id);
      const reviewId = parseInt(reviewIdParam || '', 10);
      
      if (isNaN(reviewId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid review ID')
        );
      }

      const { rating, title, comment } = req.body;
      const userId = req.user.id;
      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Rating must be between 1 and 5')
        );
      }

      const review = await ReviewService.updateReview(reviewId, userId, isAdmin, {
        rating,
        title,
        comment
      });

      return res.json(
        ApiResponseUtil.success(review, 'Review updated successfully')
      );
    } catch (error: any) {
      console.error('Error in updateReview:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to update review')
      );
    }
  }

  /**
   * Delete a review (owner or admin only)
   */
  static async deleteReview(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const reviewIdParam = getRouteParam(req.params.id);
      const reviewId = parseInt(reviewIdParam || '', 10);
      
      if (isNaN(reviewId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid review ID')
        );
      }

      const userId = req.user.id;
      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';

      await ReviewService.deleteReview(reviewId, userId, isAdmin);

      return res.json(
        ApiResponseUtil.success(null, 'Review deleted successfully')
      );
    } catch (error: any) {
      console.error('Error in deleteReview:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to delete review')
      );
    }
  }

  /**
   * Get reviews for a book
   */
  static async getBookReviews(req: Request, res: Response) {
    try {
      const bookIdParam = getRouteParam(req.params.bookId);
      const bookId = parseInt(bookIdParam || '', 10);
      
      if (isNaN(bookId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid book ID')
        );
      }

      const page = getQueryNumber(req.query.page) || 1;
      const limit = getQueryNumber(req.query.limit) || 10;

      const result = await ReviewService.getBookReviews(bookId, { page, limit });

      return res.json(
        ApiResponseUtil.success(result, 'Reviews retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getBookReviews:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get reviews')
      );
    }
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const userId = req.user.id;
      const page = getQueryNumber(req.query.page) || 1;
      const limit = getQueryNumber(req.query.limit) || 10;

      const result = await ReviewService.getUserReviews(userId, page, limit);

      return res.json(
        ApiResponseUtil.success(result, 'User reviews retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserReviews:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user reviews')
      );
    }
  }

  /**
   * Get review statistics for a book
   */
  static async getReviewStats(req: Request, res: Response) {
    try {
      const bookIdParam = getRouteParam(req.params.bookId);
      const bookId = parseInt(bookIdParam || '', 10);
      
      if (isNaN(bookId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid book ID')
        );
      }

      const stats = await ReviewService.getReviewStats(bookId);

      return res.json(
        ApiResponseUtil.success(stats, 'Review statistics retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getReviewStats:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get review statistics')
      );
    }
  }

  /**
   * Check if user has reviewed a book
   */
  static async hasUserReviewedBook(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const bookIdParam = getRouteParam(req.params.bookId);
      const bookId = parseInt(bookIdParam || '', 10);
      
      if (isNaN(bookId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid book ID')
        );
      }

      const userId = req.user.id;
      const hasReviewed = await ReviewService.hasUserReviewedBook(userId, bookId);

      return res.json(
        ApiResponseUtil.success({ hasReviewed }, 'Check completed successfully')
      );
    } catch (error: any) {
      console.error('Error in hasUserReviewedBook:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to check review status')
      );
    }
  }

  /**
   * Get user's review for a specific book
   */
  static async getUserReviewForBook(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const bookIdParam = getRouteParam(req.params.bookId);
      const bookId = parseInt(bookIdParam || '', 10);
      
      if (isNaN(bookId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid book ID')
        );
      }

      const userId = req.user.id;
      const review = await ReviewService.getUserReviewForBook(userId, bookId);

      return res.json(
        ApiResponseUtil.success(review, 'Review retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserReviewForBook:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user review')
      );
    }
  }

  /**
   * Mark a review as helpful
   */
  static async markHelpful(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const reviewIdParam = getRouteParam(req.params.id);
      const reviewId = parseInt(reviewIdParam || '', 10);
      
      if (isNaN(reviewId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid review ID')
        );
      }

      const userId = req.user.id;
      const result = await ReviewService.markHelpful(reviewId, userId);

      return res.json(
        ApiResponseUtil.success(result, 'Review marked as helpful')
      );
    } catch (error: any) {
      console.error('Error in markHelpful:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to mark review as helpful')
      );
    }
  }

  /**
   * Report a review
   */
  static async reportReview(req: AuthRequest, res: Response) {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.error('User not authenticated')
        );
      }

      const reviewIdParam = getRouteParam(req.params.id);
      const reviewId = parseInt(reviewIdParam || '', 10);
      
      if (isNaN(reviewId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid review ID')
        );
      }

      const userId = req.user.id;
      const { reason } = req.body;

      await ReviewService.reportReview(reviewId, userId, reason);

      return res.json(
        ApiResponseUtil.success(null, 'Review reported successfully')
      );
    } catch (error: any) {
      console.error('Error in reportReview:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to report review')
      );
    }
  }
}