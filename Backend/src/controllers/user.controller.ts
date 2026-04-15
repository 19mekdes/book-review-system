import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper functions for query parameters
const getQueryString = (param: unknown): string | undefined => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return typeof param === 'string' ? param : undefined;
};

const getQueryNumber = (param: unknown): number | undefined => {
  const str = getQueryString(param);
  if (str) {
    const num = parseInt(str, 10);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

const getQueryBoolean = (param: unknown): boolean | undefined => {
  const str = getQueryString(param);
  if (str) {
    return str.toLowerCase() === 'true';
  }
  return undefined;
};

const getRouteParam = (param: string | string[] | undefined): string | undefined => {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
};

const getSortBy = (param: unknown): 'name' | 'email' | 'role' | 'reviews' | 'joined' | undefined => {
  const str = getQueryString(param);
  if (str === 'name' || str === 'email' || str === 'role' || str === 'reviews' || str === 'joined') {
    return str;
  }
  return undefined;
};

const getSortOrder = (param: unknown): 'asc' | 'desc' | undefined => {
  const str = getQueryString(param);
  if (str === 'asc' || str === 'desc') {
    return str;
  }
  return undefined;
};

export class UserController {
  /**
   * Get all users with filters (admin only)
   */
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      //  Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      // Check if user is admin
      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const filters = {
        search: getQueryString(req.query.search),
        role: getQueryString(req.query.role),
        minReviews: getQueryNumber(req.query.minReviews),
        sortBy: getSortBy(req.query.sortBy),
        sortOrder: getSortOrder(req.query.sortOrder),
        page: getQueryNumber(req.query.page) || 1,
        limit: getQueryNumber(req.query.limit) || 10,
        startDate: req.query.startDate ? new Date(getQueryString(req.query.startDate) || '') : undefined,
        endDate: req.query.endDate ? new Date(getQueryString(req.query.endDate) || '') : undefined
      };

      // Validate dates
      if (filters.startDate && isNaN(filters.startDate.getTime())) {
        filters.startDate = undefined;
      }
      if (filters.endDate && isNaN(filters.endDate.getTime())) {
        filters.endDate = undefined;
      }

      const result = await UserService.getAllUsers(filters);
      return res.json(
        ApiResponseUtil.success(result, 'Users retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get users')
      );
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const userId = parseInt(idParam || '', 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid user ID')
        );
      }
      
      const user = await UserService.getUserById(userId);
      return res.json(
        ApiResponseUtil.success(user, 'User retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserById:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user')
      );
    }
  }

  /**
   * Get current user profile 
   */
  static async getCurrentUserProfile(req: AuthRequest, res: Response) {
    try {
      //  Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const userId = req.user.id;
      const profile = await UserService.getUserProfile(userId);
      return res.json(
        ApiResponseUtil.success(profile, 'Profile retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCurrentUserProfile:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get profile')
      );
    }
  }

  /**
   * Get user profile by ID (public)
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const userId = parseInt(idParam || '', 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid user ID')
        );
      }
      
      const profile = await UserService.getUserProfile(userId);
      
      // Remove sensitive information for public profile
      const { email, ...publicProfile } = profile;
      
      return res.json(
        ApiResponseUtil.success(publicProfile, 'User profile retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserProfile:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user profile')
      );
    }
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(req: AuthRequest, res: Response) {
    try {
      //  Check if user exists and is admin
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const { name, email, password, roleId } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Name, email and password are required')
        );
      }

      const user = await UserService.createUser({ name, email, password, roleId });
      return res.status(201).json(
        ApiResponseUtil.created(user, 'User created successfully')
      );
    } catch (error: any) {
      console.error('Error in createUser:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to create user')
      );
    }
  }

  /**
   * Update current user -
   */
  static async updateCurrentUser(req: AuthRequest, res: Response) {
    try {
      //  Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const userId = req.user.id;
      const { name, email, password } = req.body;

      const user = await UserService.updateUser(
        userId,
        { name, email, password },
        false
      );

      return res.json(
        ApiResponseUtil.success(user, 'Profile updated successfully')
      );
    } catch (error: any) {
      console.error('Error in updateCurrentUser:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to update profile')
      );
    }
  }

  /**
   * Update user (admin only)
   */
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists and is admin
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const idParam = getRouteParam(req.params.id);
      const userId = parseInt(idParam || '', 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid user ID')
        );
      }
      
      const updates = req.body;

      const user = await UserService.updateUser(userId, updates, true);
      return res.json(
        ApiResponseUtil.success(user, 'User updated successfully')
      );
    } catch (error: any) {
      console.error('Error in updateUser:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to update user')
      );
    }
  }

  /**
   * Delete user (admin only) - ✅ FIXED
   */
  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const idParam = getRouteParam(req.params.id);
      const userId = parseInt(idParam || '', 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid user ID')
        );
      }
      
      const adminUserId = req.user.id;

      await UserService.deleteUser(userId, adminUserId);
      return res.json(
        ApiResponseUtil.success(null, 'User deleted successfully')
      );
    } catch (error: any) {
      console.error('Error in deleteUser:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to delete user')
      );
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists and is admin
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const stats = await UserService.getUserStats();
      return res.json(
        ApiResponseUtil.success(stats, 'User statistics retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserStats:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user statistics')
      );
    }
  }

  /**
   * Search users (admin only)
   */
  static async searchUsers(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists and is admin
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const query = getQueryString(req.query.q);
      if (!query) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Search query is required')
        );
      }

      const filters = {
        role: getQueryString(req.query.role),
        sortBy: getSortBy(req.query.sortBy),
        sortOrder: getSortOrder(req.query.sortOrder),
        page: getQueryNumber(req.query.page) || 1,
        limit: getQueryNumber(req.query.limit) || 10
      };

      const result = await UserService.searchUsers(query, filters);
      return res.json(
        ApiResponseUtil.success(result, 'Search completed successfully')
      );
    } catch (error: any) {
      console.error('Error in searchUsers:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Search failed')
      );
    }
  }

  /**
   * Get user by email (admin only)
   */
  static async getUserByEmail(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists and is admin
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const isAdmin = req.user.roleId === 1 || req.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json(
          ApiResponseUtil.error('Admin access required', )
        );
      }

      const email = getQueryString(req.query.email);
      if (!email) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Email is required')
        );
      }

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return res.status(404).json(
          ApiResponseUtil.notFound('User')
        );
      }

      return res.json(
        ApiResponseUtil.success(user, 'User retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserByEmail:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user')
      );
    }
  }

  /**
   * Update password for current user - ✅ FIXED
   */
  static async updatePassword(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Current password and new password are required')
        );
      }

      await UserService.updatePassword(userId, currentPassword, newPassword);
      return res.json(
        ApiResponseUtil.success(null, 'Password updated successfully')
      );
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to update password')
      );
    }
  }

  /**
   * Get user activity summary - ✅ FIXED
   */
  static async getUserActivitySummary(req: AuthRequest, res: Response) {
    try {
      // ✅ Check if user exists
      if (!req.user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('User not authenticated')
        );
      }

      const userId = req.user.id;
      const activity = await UserService.getUserActivitySummary(userId);
      return res.json(
        ApiResponseUtil.success(activity, 'User activity retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserActivitySummary:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user activity')
      );
    }
  }

  /**
   * Get user activity summary by ID (public)
   */
  static async getUserActivitySummaryById(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const userId = parseInt(idParam || '', 10);
      
      if (isNaN(userId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid user ID')
        );
      }
      
      const activity = await UserService.getUserActivitySummary(userId);
      return res.json(
        ApiResponseUtil.success(activity, 'User activity retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getUserActivitySummaryById:', error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get user activity')
      );
    }
  }
}