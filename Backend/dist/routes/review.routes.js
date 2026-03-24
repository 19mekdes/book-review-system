"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', review_controller_1.ReviewController.getAllReviews);
router.get('/latest', review_controller_1.ReviewController.getLatestReviews);
router.get('/stats', review_controller_1.ReviewController.getReviewStats);
router.get('/book/:bookId', review_controller_1.ReviewController.getReviewsByBookId);
router.get('/book/:bookId/rating-summary', review_controller_1.ReviewController.getBookRatingSummary);
router.get('/user/:userId', review_controller_1.ReviewController.getReviewsByUserId);
router.get('/user/:userId/summary', review_controller_1.ReviewController.getUserReviewSummary);
router.get('/user/:userId/book/:bookId', review_controller_1.ReviewController.getUserReviewForBook);
router.get('/user/:userId/book/:bookId/exists', review_controller_1.ReviewController.hasUserReviewedBook);
router.get('/:id', review_controller_1.ReviewController.getReviewById);
// Protected routes (require authentication)
router.post('/', auth_middleware_1.authenticate, review_controller_1.ReviewController.createReview);
router.put('/:id', auth_middleware_1.authenticate, review_controller_1.ReviewController.updateReview);
router.delete('/:id', auth_middleware_1.authenticate, review_controller_1.ReviewController.deleteReview);
// Admin only routes
router.post('/bulk', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, review_controller_1.ReviewController.bulkCreateReviews);
exports.default = router;
