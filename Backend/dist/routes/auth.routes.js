"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pg_1 = require("pg");
const router = (0, express_1.Router)();
const pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'book review system',
    user: 'postgres',
    password: '21mek#BDU'
});
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Get default role (assuming 'user' role has id 2)
        const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'user'");
        const roleId = roleResult.rows[0]?.id || 2;
        // Insert new user
        const result = await pool.query(`INSERT INTO users (name, email, password, roleId, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, roleId, created_at`, [name, email, hashedPassword, roleId]);
        const newUser = result.rows[0];
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            roleId: newUser.roleId
        }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                roleId: newUser.roleId
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const result = await pool.query(`SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.roleId = r.id 
       WHERE u.email = $1`, [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Check password
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleid,
            role: user.role_name
        }, JWT_SECRET, { expiresIn: '24h' });
        // Remove password from response
        delete user.password;
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                roleId: user.roleid
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});
/**
 * POST /api/auth/logout
 * Logout user (client-side only - just for API completeness)
 */
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});
/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 */
router.post('/refresh-token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        // Verify old token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Generate new token
        const newToken = jsonwebtoken_1.default.sign({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            roleId: decoded.roleId
        }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token: newToken });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});
exports.default = router;
