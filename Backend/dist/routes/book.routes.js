"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const book_controller_1 = require("../controllers/book.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', book_controller_1.BookController.getAllBooks);
router.get('/stats', book_controller_1.BookController.getBookStats);
router.get('/popular', book_controller_1.BookController.getPopularBooks);
router.get('/search', book_controller_1.BookController.searchBooks);
router.get('/category/:categoryId', book_controller_1.BookController.getBooksByCategory);
router.get('/author/:author', book_controller_1.BookController.getBooksByAuthor);
router.get('/:id', book_controller_1.BookController.getBookById);
router.get('/:id/summary', book_controller_1.BookController.getBookWithReviewSummary);
// Admin only routes
router.post('/', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, book_controller_1.BookController.createBook);
router.post('/bulk', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, book_controller_1.BookController.bulkCreateBooks);
router.put('/:id', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, book_controller_1.BookController.updateBook);
router.delete('/:id', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, book_controller_1.BookController.deleteBook);
exports.default = router;
