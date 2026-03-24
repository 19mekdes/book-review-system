export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const errorHandler = (err: any, req: any, res: any, next: any) => {
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