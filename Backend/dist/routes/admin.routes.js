"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_middleware_1.authenticate, admin_middleware_1.isAdmin);
// Dashboard
router.get('/dashboard', admin_controller_1.AdminController.getDashboardStats);
router.get('/activities', admin_controller_1.AdminController.getActivities);
router.get('/analytics', admin_controller_1.AdminController.getAnalytics);
// User management
router.get('/users', admin_controller_1.AdminController.getAllUsers);
router.get('/users/:id', admin_controller_1.AdminController.getUserById);
router.post('/users', admin_controller_1.AdminController.createUser);
router.put('/users/:id', admin_controller_1.AdminController.updateUser);
router.delete('/users/:id', admin_controller_1.AdminController.deleteUser);
// Book management
router.get('/books', admin_controller_1.AdminController.getAllBooks);
router.post('/books', admin_controller_1.AdminController.createBook);
router.put('/books/:id', admin_controller_1.AdminController.updateBook);
router.delete('/books/:id', admin_controller_1.AdminController.deleteBook);
// Review management
router.get('/reviews', admin_controller_1.AdminController.getAllReviews);
router.delete('/reviews/:id', admin_controller_1.AdminController.deleteReview);
// Category management
router.get('/categories', admin_controller_1.AdminController.getAllCategories);
router.post('/categories', admin_controller_1.AdminController.createCategory);
router.put('/categories/:id', admin_controller_1.AdminController.updateCategory);
router.delete('/categories/:id', admin_controller_1.AdminController.deleteCategory);
// System
router.get('/system-health', admin_controller_1.AdminController.getSystemHealth);
router.get('/roles', admin_controller_1.AdminController.getAllRoles);
router.get('/report', admin_controller_1.AdminController.generateReport);
exports.default = router;
