"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// IMPORTANT: Public routes (no authentication required)
router.get('/', review_controller_1.ReviewController.getAllReviewsPublic);
router.get('/all', review_controller_1.ReviewController.getAllReviewsPublic);
router.get('/book/:bookId', review_controller_1.ReviewController.getBookReviews);
router.get('/book/:bookId/stats', review_controller_1.ReviewController.getReviewStats);
// Protected routes (authentication required)
router.use(auth_middleware_1.authenticate);
// User review management
router.post('/', review_controller_1.ReviewController.createReview);
router.put('/:id', review_controller_1.ReviewController.updateReview);
router.delete('/:id', review_controller_1.ReviewController.deleteReview);
router.get('/my-reviews', review_controller_1.ReviewController.getUserReviews);
router.get('/book/:bookId/user-review', review_controller_1.ReviewController.getUserReviewForBook);
router.get('/book/:bookId/has-reviewed', review_controller_1.ReviewController.hasUserReviewedBook);
// Review interactions
router.post('/:id/helpful', review_controller_1.ReviewController.markHelpful);
router.post('/:id/report', review_controller_1.ReviewController.reportReview);
// Admin routes (requires admin role)
router.get('/admin/all', admin_middleware_1.isAdmin, review_controller_1.ReviewController.getAllReviewsAdmin);
exports.default = router;
