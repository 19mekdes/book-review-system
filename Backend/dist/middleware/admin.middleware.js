"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = async (req, res, next) => {
    try {
        // Check if user has admin role
        // Assuming roleId 1 is admin, or check role name
        if (req.user.roleId === 1 || req.user.role === 'admin') {
            next();
        }
        else {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(403).json({ error: 'Access denied' });
    }
};
exports.isAdmin = isAdmin;
