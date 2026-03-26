"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_model_1 = require("../models/User.model");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthService {
    /**
     * Register a new user
     */
    static async register(input) {
        try {
            // Check if user already exists
            const existingUser = await User_model_1.UserModel.findByEmail(input.email);
            if (existingUser) {
                throw new error_middleware_1.ApiError(400, 'User with this email already exists');
            }
            // Validate password strength
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(input.password); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Hash password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(input.password); // ✅ Fixed
            // Create user (default roleId = 2 for regular user)
            const newUser = await User_model_1.UserModel.create({
                name: input.name,
                email: input.email,
                password: hashedPassword,
                roleId: 2
            });
            // Generate tokens - using static method, no await needed
            const tokens = jwt_utils_1.JwtUtils.generateTokens({
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Registration failed: ${error.message}`);
        }
    }
    /**
     * Login user
     */
    static async login(input) {
        try {
            // Find user by email
            const user = await User_model_1.UserModel.findByEmail(input.email);
            if (!user) {
                throw new error_middleware_1.ApiError(401, 'Invalid email or password');
            }
            // Verify password
            const isValidPassword = await bcrypt_utils_1.BcryptUtils.comparePassword(// ✅ Fixed
            input.password, user.password);
            if (!isValidPassword) {
                throw new error_middleware_1.ApiError(401, 'Invalid email or password');
            }
            // Generate tokens - using static method, no await needed
            const tokens = jwt_utils_1.JwtUtils.generateTokens({
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Login failed: ${error.message}`);
        }
    }
    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new error_middleware_1.ApiError(400, 'Refresh token is required');
            }
            const tokens = jwt_utils_1.JwtUtils.refreshAccessToken(refreshToken); // ✅ Fixed - static method, no await
            return { accessToken: tokens.accessToken };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(401, `Token refresh failed: ${error.message}`);
        }
    }
    /**
     * Logout user (revoke refresh token)
     */
    static async logout(refreshToken) {
        try {
            if (!refreshToken) {
                return false;
            }
            const revoked = jwt_utils_1.JwtUtils.revokeRefreshToken(refreshToken); // ✅ Fixed - static method, no await
            return revoked;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get user profile by ID
     */
    static async getProfile(userId) {
        try {
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            return user;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get profile: ${error.message}`);
        }
    }
    /**
     * Change user password
     */
    static async changePassword(input) {
        try {
            // Get user with password
            const user = await User_model_1.UserModel.findById(input.userId);
            if (!user) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Get full user data with password
            const fullUser = await User_model_1.UserModel.findByEmail(user.email);
            if (!fullUser) {
                throw new error_middleware_1.ApiError(404, 'User not found');
            }
            // Verify current password
            const isValidPassword = await bcrypt_utils_1.BcryptUtils.comparePassword(// ✅ Fixed
            input.currentPassword, fullUser.password);
            if (!isValidPassword) {
                throw new error_middleware_1.ApiError(401, 'Current password is incorrect');
            }
            // Validate new password strength
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(input.newPassword); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Hash new password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(input.newPassword); // ✅ Fixed
            // Update password
            await User_model_1.UserModel.update(input.userId, { password: hashedPassword });
            // Revoke all refresh tokens for this user (force re-login)
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(input.userId); // ✅ Fixed - static method
            return true;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Password change failed: ${error.message}`);
        }
    }
    /**
     * Request password reset (send email)
     */
    static async requestPasswordReset(email) {
        try {
            const user = await User_model_1.UserModel.findByEmail(email);
            if (!user) {
                // Don't reveal that user doesn't exist for security
                return { resetToken: '' };
            }
            // Create password reset token
            const resetToken = jwt_utils_1.JwtUtils.createPasswordResetToken(user.id); // ✅ Fixed - static method
            // In production, send email with reset link
            // await emailService.sendPasswordResetEmail(user.email, resetToken);
            return { resetToken };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Password reset request failed: ${error.message}`);
        }
    }
    /**
     * Reset password with token
     */
    static async resetPassword(token, newPassword) {
        try {
            // Verify token
            const verification = jwt_utils_1.JwtUtils.verifyPurposeToken(token, 'password-reset'); // ✅ Fixed - static method
            if (!verification.valid) {
                throw new error_middleware_1.ApiError(401, verification.error || 'Invalid or expired token');
            }
            // Validate new password
            const passwordValidation = bcrypt_utils_1.BcryptUtils.validatePasswordStrength(newPassword); // ✅ Fixed
            if (!passwordValidation.isValid) {
                throw new error_middleware_1.ApiError(400, passwordValidation.message);
            }
            // Hash new password
            const hashedPassword = await bcrypt_utils_1.BcryptUtils.hashPassword(newPassword); // ✅ Fixed
            // Update password
            await User_model_1.UserModel.update(verification.data.userId, { password: hashedPassword });
            // Revoke all refresh tokens for this user
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(verification.data.userId); // ✅ Fixed - static method
            return true;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Password reset failed: ${error.message}`);
        }
    }
    /**
     * Verify email with token
     */
    static async verifyEmail(token) {
        try {
            const verification = jwt_utils_1.JwtUtils.verifyPurposeToken(token, 'email-verification'); // ✅ Fixed - static method
            if (!verification.valid) {
                throw new error_middleware_1.ApiError(401, verification.error || 'Invalid or expired token');
            }
            // Update user email verification status
            // You might want to add an `emailVerified` column to your users table
            // await UserModel.update(verification.data.userId, { emailVerified: true });
            return true;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Email verification failed: ${error.message}`);
        }
    }
    /**
     * Get user sessions
     */
    static async getUserSessions(userId) {
        try {
            const sessions = jwt_utils_1.JwtUtils.getUserSessions(userId); // ✅ Fixed - static method, no await
            return sessions;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get sessions: ${error.message}`);
        }
    }
    /**
     * Revoke a specific session
     */
    static async revokeSession(userId, tokenId) {
        try {
            // In a real implementation, you'd have a method to revoke specific token
            // For now, we'll revoke all
            await jwt_utils_1.JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed - static method
            return true;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to revoke session: ${error.message}`);
        }
    }
    /**
     * Revoke all sessions except current
     */
    static async revokeAllOtherSessions(userId, currentTokenId) {
        try {
            // In a real implementation, you'd revoke all except current
            const count = await jwt_utils_1.JwtUtils.revokeAllUserTokens(userId); // ✅ Fixed - static method
            return count;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to revoke sessions: ${error.message}`);
        }
    }
}
exports.AuthService = AuthService;
