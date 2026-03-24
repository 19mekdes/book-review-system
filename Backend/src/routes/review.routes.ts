import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// IMPORTANT: Public routes (no authentication required)
router.get('/', ReviewController.getAllReviewsPublic);
router.get('/all', ReviewController.getAllReviewsPublic);
router.get('/book/:bookId', ReviewController.getBookReviews);
router.get('/book/:bookId/stats', ReviewController.getReviewStats);

// Protected routes (authentication required)
router.use(authenticate);

// User review management
router.post('/', ReviewController.createReview);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);
router.get('/my-reviews', ReviewController.getUserReviews);
router.get('/book/:bookId/user-review', ReviewController.getUserReviewForBook);
router.get('/book/:bookId/has-reviewed', ReviewController.hasUserReviewedBook);

// Review interactions
router.post('/:id/helpful', ReviewController.markHelpful);
router.post('/:id/report', ReviewController.reportReview);

// Admin routes (requires admin role)
router.get('/admin/all', isAdmin, ReviewController.getAllReviewsAdmin);

export default router;