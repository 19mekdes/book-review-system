import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/popular', CategoryController.getPopularCategories);
router.get('/search', CategoryController.searchCategories);
router.get('/suggestions', CategoryController.getCategorySuggestions);
router.get('/stats', CategoryController.getCategoriesWithStats);
router.get('/tree', CategoryController.getCategoryTree);
router.get('/validate', CategoryController.validateCategoryName);
router.get('/usage', CategoryController.getCategoryUsage);
router.get('/usage/:id', CategoryController.getCategoryUsage);
router.get('/:id', CategoryController.getCategoryById);
router.get('/name/:name', CategoryController.getCategoryByName);
router.get('/:id/books', CategoryController.getBooksByCategory);
router.get('/:id/stats', CategoryController.getCategoryStats);

// Admin only routes
router.post('/', authenticate, isAdmin, CategoryController.createCategory);
router.post('/bulk', authenticate, isAdmin, CategoryController.bulkCreateCategories);
router.post('/merge', authenticate, isAdmin, CategoryController.mergeCategories);
router.put('/:id', authenticate, isAdmin, CategoryController.updateCategory);
router.delete('/:id', authenticate, isAdmin, CategoryController.deleteCategory);
router.get('/export/all', authenticate, isAdmin, CategoryController.exportCategories);
router.post('/import/all', authenticate, isAdmin, upload.single('file'), CategoryController.importCategories);

export default router;