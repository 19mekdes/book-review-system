"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
const pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'book review system',
    user: 'postgres',
    password: '21mek#BDU'
});
// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================
/**
 * GET /api/users/:id
 * Get user by ID (public profile)
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT id, name, email, roleId, created_at 
       FROM users WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// ============================================
// PROTECTED ROUTES - Require authentication
// ============================================
/**
 * GET /api/users/me/profile
 * Get current user profile
 */
router.get('/me/profile', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`SELECT u.id, u.name, u.email, u.roleId, r.name as role, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.id = $1`, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
/**
 * PUT /api/users/me
 * Update current user
 */
router.put('/me', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        const result = await pool.query(`UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, roleId`, [name, email, userId]);
        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
/**
 * POST /api/users/me/password
 * Update current user password
 */
router.post('/me/password', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get current user with password
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
        // Verify current password
        const validPassword = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});
/**
 * GET /api/users/me/activity
 * Get current user activity (reviews, etc.)
 */
router.get('/me/activity', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        // Get user's reviews
        const reviews = await pool.query(`SELECT r.*, b.title as book_title 
       FROM reviews r
       JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`, [userId]);
        // Get user stats
        const stats = await pool.query(`SELECT 
         COUNT(DISTINCT r.id) as total_reviews,
         COALESCE(AVG(r.rating), 0) as avg_rating,
         COUNT(DISTINCT b.id) as books_reviewed
       FROM reviews r
       LEFT JOIN books b ON r.book_id = b.id
       WHERE r.user_id = $1`, [userId]);
        res.json({
            reviews: reviews.rows,
            stats: stats.rows[0]
        });
    }
    catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});
// ============================================
// ADMIN ROUTES - Require authentication + admin role
// ============================================
/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`SELECT u.id, u.name, u.email, u.roleId, r.name as role, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.id
       ORDER BY u.created_at DESC`);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
/**
 * GET /api/users/:id (admin version)
 * Get user by ID (admin only)
 */
router.get('/:id', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT u.*, r.name as role 
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.id
       WHERE u.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Remove password from response
        delete result.rows[0].password;
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
/**
 * POST /api/users
 * Create new user (admin only)
 */
router.post('/', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const { name, email, password, roleId } = req.body;
        // Check if user exists
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await pool.query(`INSERT INTO users (name, email, password, roleId, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, roleId`, [name, email, hashedPassword, roleId || 2]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});
/**
 * PUT /api/users/:id
 * Update user (admin only)
 */
router.put('/:id', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, roleId } = req.body;
        const result = await pool.query(`UPDATE users 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           roleId = COALESCE($3, roleId),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, roleId`, [name, email, roleId, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Delete user's reviews first (optional - depends on your cascading rules)
        await pool.query('DELETE FROM reviews WHERE user_id = $1', [id]);
        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
