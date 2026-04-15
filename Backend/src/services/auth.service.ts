import { UserModel, User, UserWithRole } from '../models/User.model';
import { BcryptUtils } from '../utils/bcrypt.utils';        
import { JwtUtils, TokenResponse } from '../utils/jwt.utils'; 
import { ApiError } from '../middleware/error.middleware';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: TokenResponse;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(input.email);
      if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
      }

      // Validate password strength
      const passwordValidation = BcryptUtils.validatePasswordStrength(input.password); // ✅ Fixed
      if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.message);
      }

      // Hash password
      const hashedPassword = await BcryptUtils.hashPassword(input.password); // ✅ Fixed

      // Create user (default roleId = 2 for regular user)
      const newUser = await UserModel.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        roleId: 2
      });

      // Generate tokens - using static method, no await needed
      const tokens = JwtUtils.generateTokens({ 
        id: newUser.id,
        email: newUser.email,
        roleId: newUser.roleId,
        name: newUser.name
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      return {
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Registration failed: ${(error as Error).message}`);
    }
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(input.email);
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Verify password
      const isValidPassword = await BcryptUtils.comparePassword( // ✅ Fixed
        input.password,
        user.password
      );

      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate tokens - using static method, no await needed
      const tokens = JwtUtils.generateTokens({ // ✅ Fixed - static method, no await
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        name: user.name
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Login failed: ${(error as Error).message}`);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
      }

      const tokens = JwtUtils.refreshAccessToken(refreshToken); // ✅ Fixed - static method, no await
      return { accessToken: tokens.accessToken };
    } catch (error) {
      throw new ApiError(401, `Token refresh failed: ${(error as Error).message}`);
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  static async logout(refreshToken: string): Promise<boolean> {
    try {
      if (!refreshToken) {
        return false;
      }

      const revoked = JwtUtils.revokeRefreshToken(refreshToken); // ✅ Fixed - static method, no await
      return revoked;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: number): Promise<UserWithRole | null> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get profile: ${(error as Error).message}`);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(input: ChangePasswordInput): Promise<boolean> {
    try {
      // Get user with password
      const user = await UserModel.findById(input.userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Get full user data with password
      const fullUser = await UserModel.findByEmail(user.email);
      if (!fullUser) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isValidPassword = await BcryptUtils.comparePassword( // ✅ Fixed
        input.currentPassword,
        fullUser.password
      );

      if (!isValidPassword) {
        throw new ApiError(401, 'Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = BcryptUtils.validatePasswordStrength(input.newPassword); // ✅ Fixed
      if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.message);
      }

      // Hash new password
      const hashedPassword = await BcryptUtils.hashPassword(input.newPassword); // ✅ Fixed

      // Update password
      await UserModel.update(input.userId, { password: hashedPassword });

      // Revoke all refresh tokens for this user (force re-login)
      await JwtUtils.revokeAllUserTokens(input.userId); // ✅ Fixed - static method

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Password change failed: ${(error as Error).message}`);
    }
  }

  /**
   * Request password reset (send email)
   */
  static async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal that user doesn't exist for security
        return { resetToken: '' };
      }

      // Create password reset token
      const resetToken = JwtUtils.createPasswordResetToken(user.id); // ✅ Fixed - static method

      // In production, send email with reset link
      // await emailService.sendPasswordResetEmail(user.email, resetToken);

      return { resetToken };
    } catch (error) {
      throw new ApiError(500, `Password reset request failed: ${(error as Error).message}`);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Verify token
      const verification = JwtUtils.verifyPurposeToken(token, 'password-reset'); // ✅ Fixed - static method
      
      if (!verification.valid) {
        throw new ApiError(401, verification.error || 'Invalid or expired token');
      }

      // Validate new password
      const passwordValidation = BcryptUtils.validatePasswordStrength(newPassword); // ✅ Fixed
      if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.message);
      }

      // Hash new password
      const hashedPassword = await BcryptUtils.hashPassword(newPassword); // ✅ Fixed

      // Update password
      await UserModel.update(verification.data.userId, { password: hashedPassword });

      // Revoke all refresh tokens for this user
      await JwtUtils.revokeAllUserTokens(verification.data.userId); // ✅ Fixed - static method

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Password reset failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<boolean> {
    try {
      const verification = JwtUtils.verifyPurposeToken(token, 'email-verification'); // ✅ Fixed - static method
      
      if (!verification.valid) {
        throw new ApiError(401, verification.error || 'Invalid or expired token');
      }

      // Update user email verification status
      // You might want to add an `emailVerified` column to your users table
      // await UserModel.update(verification.data.userId, { emailVerified: true });

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Email verification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(userId: number): Promise<any[]> {
    try {
      const sessions = JwtUtils.getUserSessions(userId); //  Fixed - static method, no await
      return sessions;
    } catch (error) {
      throw new ApiError(500, `Failed to get sessions: ${(error as Error).message}`);
    }
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(userId: number, tokenId: string): Promise<boolean> {
    try {
      // In a real implementation, you'd have a method to revoke specific token
      // For now, we'll revoke all
      await JwtUtils.revokeAllUserTokens(userId); //  Fixed - static method
      return true;
    } catch (error) {
      throw new ApiError(500, `Failed to revoke session: ${(error as Error).message}`);
    }
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllOtherSessions(userId: number, currentTokenId: string): Promise<number> {
    try {
      // In a real implementation, you'd revoke all except current
      const count = await JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed - static method
      return count;
    } catch (error) {
      throw new ApiError(500, `Failed to revoke sessions: ${(error as Error).message}`);
    }
  }
}