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
// User management
router.get('/users', admin_controller_1.AdminController.getAllUsers);
router.put('/users/:id', admin_controller_1.AdminController.updateUser);
router.delete('/users/:id', admin_controller_1.AdminController.deleteUser);
// Book management
router.get('/books', admin_controller_1.AdminController.getAllBooks);
// Review management
router.get('/reviews', admin_controller_1.AdminController.getAllReviews);
router.delete('/reviews/:id', admin_controller_1.AdminController.deleteReview);
exports.default = router;
