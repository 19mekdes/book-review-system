import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Name, email and password are required')
        );
      }

      // Check if user exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('User with this email already exists')
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (default roleId = 2 for regular user)
      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        roleId: 2
      });

      // Generate JWT token - FIXED VERSION
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email,
          roleId: newUser.roleId 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { 
          expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
        }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json(
        ApiResponseUtil.success(
          { user: userWithoutPassword, token },
          'User registered successfully'
        )
      );
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Registration failed')
      );
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Email and password are required')
        );
      }

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('Invalid email or password')
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json(
          ApiResponseUtil.unauthorized('Invalid email or password')
        );
      }

      // Generate JWT token - FIXED VERSION
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          roleId: user.roleId 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { 
          expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
        }
      );

      // Get user with role
      const userWithRole = await UserModel.findById(user.id);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json(
        ApiResponseUtil.success(
          {
            user: {
              ...userWithoutPassword,
              role: userWithRole?.role_name
            },
            token
          },
          'Login successful'
        )
      );
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Login failed')
      );
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      // Get user with role
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json(
          ApiResponseUtil.notFound('User')
        );
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json(
        ApiResponseUtil.success(userWithoutPassword, 'Profile retrieved successfully')
      );
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(
        ApiResponseUtil.error(error.message || 'Failed to get profile')
      );
    }
  }

  /**
   * Verify token (helper method for frontend)
   */
  static async verifyToken(req: AuthRequest, res: Response) {
    try {
      // User is already attached to req by auth middleware
      return res.json(
        ApiResponseUtil.success(
          { 
            valid: true, 
            user: {
              id: req.user.id,
              email: req.user.email,
              roleId: req.user.roleId,
              name: req.user.name
            }
          },
          'Token is valid'
        )
      );
    } catch (error: any) {
      return res.status(401).json(
        ApiResponseUtil.unauthorized('Invalid token')
      );
    }
  }
}