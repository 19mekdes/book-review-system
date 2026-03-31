import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/activities', AdminController.getActivities);
router.get('/analytics', AdminController.getAnalytics);

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Book management
router.get('/books', AdminController.getAllBooks);
router.post('/books', AdminController.createBook);
router.put('/books/:id', AdminController.updateBook);
router.delete('/books/:id', AdminController.deleteBook);

// Review management
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

// Category management
router.get('/categories', AdminController.getAllCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

// System
router.get('/system-health', AdminController.getSystemHealth);
router.get('/roles', AdminController.getAllRoles);
router.get('/report', AdminController.generateReport);

export default router;