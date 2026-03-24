/**
 * Standard API Response Utility
 * Provides consistent response formatting across the application
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp?: string;
  };
}

export class ApiResponseUtil {
  /**
   * Success Response
   */
  static success<T>(
    data: T,
    message: string = 'Operation successful',
    meta?: ApiResponse['meta']
  ): ApiResponse<T> {
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
  static error(
    message: string = 'An error occurred',
    error?: string,
    errors?: any[]
  ): ApiResponse {
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
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully'
  ): ApiResponse<T[]> {
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
  static created<T>(
    data: T,
    message: string = 'Resource created successfully'
  ): ApiResponse<T> {
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
  static updated<T>(
    data: T,
    message: string = 'Resource updated successfully'
  ): ApiResponse<T> {
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
  static deleted(
    message: string = 'Resource deleted successfully'
  ): ApiResponse {
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
  static notFound(
    resource: string = 'Resource'
  ): ApiResponse {
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
  static validationError(
    errors: any[],
    message: string = 'Validation failed'
  ): ApiResponse {
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
  static unauthorized(
    message: string = 'Unauthorized access'
  ): ApiResponse {
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
  static forbidden(
    message: string = 'Access forbidden'
  ): ApiResponse {
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
  static badRequest(
    message: string = 'Bad request',
    errors?: any[]
  ): ApiResponse {
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
  static serverError(
    message: string = 'Internal server error',
    error?: string
  ): ApiResponse {
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

// Export a singleton instance
export const apiResponse = new ApiResponseUtil();