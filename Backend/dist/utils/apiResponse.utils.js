"use strict";
/**
 * Standard API Response Utility
 * Provides consistent response formatting across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = exports.ApiResponseUtil = void 0;
class ApiResponseUtil {
    /**
     * Success Response
     */
    static success(data, message = 'Operation successful', meta) {
        return {
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                ...meta
            }
        };
    }
    /**
     * Error Response
     */
    static error(message = 'An error occurred', error, errors) {
        return {
            success: false,
            message,
            ...(error && { error }),
            ...(errors && { errors }),
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Pagination Response
     */
    static paginated(data, page, limit, total, message = 'Data retrieved successfully') {
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            message,
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Created Response (201)
     */
    static created(data, message = 'Resource created successfully') {
        return {
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Updated Response
     */
    static updated(data, message = 'Resource updated successfully') {
        return {
            success: true,
            message,
            data,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Deleted Response
     */
    static deleted(message = 'Resource deleted successfully') {
        return {
            success: true,
            message,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Not Found Response
     */
    static notFound(resource = 'Resource') {
        return {
            success: false,
            message: `${resource} not found`,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Validation Error Response
     */
    static validationError(errors, message = 'Validation failed') {
        return {
            success: false,
            message,
            errors,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Unauthorized Response
     */
    static unauthorized(message = 'Unauthorized access') {
        return {
            success: false,
            message,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Forbidden Response
     */
    static forbidden(message = 'Access forbidden') {
        return {
            success: false,
            message,
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Bad Request Response
     */
    static badRequest(message = 'Bad request', errors) {
        return {
            success: false,
            message,
            ...(errors && { errors }),
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Server Error Response
     */
    static serverError(message = 'Internal server error', error) {
        return {
            success: false,
            message,
            ...(error && { error }),
            meta: {
                timestamp: new Date().toISOString()
            }
        };
    }
}
exports.ApiResponseUtil = ApiResponseUtil;
// Export a singleton instance
exports.apiResponse = new ApiResponseUtil();
