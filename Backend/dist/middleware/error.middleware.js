"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            meta: {
                timestamp: new Date().toISOString()
            }
        });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        meta: {
            timestamp: new Date().toISOString()
        }
    });
};
exports.errorHandler = errorHandler;
