"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    try {
        // Cast to AdminRequest to access user property
        const adminReq = req;
        // Check if user exists on request
        if (!adminReq.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - User not authenticated'
            });
        }
        // Check if user has admin role
        if (adminReq.user.roleId === 1 || adminReq.user.role === 'admin') {
            next();
        }
        else {
            return res.status(403).json({
                success: false,
                error: 'Forbidden - Admin access required'
            });
        }
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.isAdmin = isAdmin;
