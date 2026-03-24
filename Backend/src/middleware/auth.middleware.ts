import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  userId?: number;
  email?: string;
  role?: string;
  roleId?: number;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Attach user to request
      (req as AuthRequest).user = {
        id: decoded.userId || decoded.id,
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId
      };
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
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
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  
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
  } else {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden - Admin access required' 
    });
  }
};

// Combined middleware for admin-only routes
export const requireAdmin = [authenticate, isAdmin];