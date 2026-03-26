"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // ✅ Fix: Attach user to request with all required fields
            req.user = {
                id: decoded.userId || decoded.id,
                userId: decoded.userId || decoded.id,
                email: decoded.email,
                role: decoded.role || (decoded.roleId === 1 ? 'admin' : 'user'),
                roleId: decoded.roleId || 2,
                name: decoded.name || 'User'
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    expired: true
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    const authReq = req;
    // Check if user exists
    if (!authReq.user) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - User not authenticated'
        });
    }
    // Check if user has admin role (roleId 1 or role 'admin')
    const isAdminUser = authReq.user.roleId === 1 || authReq.user.role === 'admin';
    if (isAdminUser) {
        next();
    }
    else {
        return res.status(403).json({
            success: false,
            error: 'Forbidden - Admin access required'
        });
    }
};
exports.isAdmin = isAdmin;
// Combined middleware for admin-only routes
exports.requireAdmin = [exports.authenticate, exports.isAdmin];
