import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/', BookController.getAllBooks);
router.get('/stats', BookController.getBookStats);
router.get('/popular', BookController.getPopularBooks);
router.get('/search', BookController.searchBooks);
router.get('/category/:categoryId', BookController.getBooksByCategory);
router.get('/author/:author', BookController.getBooksByAuthor);
router.get('/:id', BookController.getBookById);
router.get('/:id/summary', BookController.getBookWithReviewSummary);

// Admin only routes
router.post('/', authenticate, isAdmin, BookController.createBook);
router.post('/bulk', authenticate, isAdmin, BookController.bulkCreateBooks);
router.put('/:id', authenticate, isAdmin, BookController.updateBook);
router.delete('/:id', authenticate, isAdmin, BookController.deleteBook);

export default router;