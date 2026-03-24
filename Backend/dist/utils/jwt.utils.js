"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
class JwtUtils {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        try {
            const options = {
                expiresIn: this.ACCESS_TOKEN_EXPIRY,
                issuer: this.ISSUER,
                audience: this.AUDIENCE,
                algorithm: 'HS256'
            };
            return jsonwebtoken_1.default.sign(payload, this.SECRET, options);
        }
        catch (error) {
            throw new Error(`Access token generation failed: ${error.message}`);
        }
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        try {
            const options = {
                expiresIn: this.REFRESH_TOKEN_EXPIRY,
                issuer: this.ISSUER,
                audience: this.AUDIENCE,
                algorithm: 'HS256'
            };
            const tokenId = crypto_1.default.randomBytes(16).toString('hex');
            const tokenPayload = { ...payload, tokenId };
            const token = jsonwebtoken_1.default.sign(tokenPayload, this.REFRESH_SECRET, options);
            // Store refresh token
            const decoded = jsonwebtoken_1.default.decode(token);
            this.refreshTokenStore.set(tokenId, {
                token,
                userId: payload.id,
                expiresAt: new Date(decoded.exp * 1000)
            });
            return token;
        }
        catch (error) {
            throw new Error(`Refresh token generation failed: ${error.message}`);
        }
    }
    /**
     * Generate both access and refresh tokens
     */
    static generateTokens(payload) {
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        const decoded = jsonwebtoken_1.default.decode(accessToken);
        return {
            accessToken,
            refreshToken,
            expiresIn: decoded.exp * 1000,
            tokenType: 'Bearer'
        };
    }
    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.SECRET, {
                issuer: this.ISSUER,
                audience: this.AUDIENCE
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Access token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            else {
                throw new Error(`Token verification failed: ${error.message}`);
            }
        }
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.REFRESH_SECRET, {
                issuer: this.ISSUER,
                audience: this.AUDIENCE
            });
            // Check if token exists in store
            const storedToken = this.refreshTokenStore.get(decoded.tokenId);
            if (!storedToken || storedToken.token !== token) {
                throw new Error('Refresh token not found');
            }
            // Check if token is expired in store
            if (storedToken.expiresAt < new Date()) {
                this.refreshTokenStore.delete(decoded.tokenId);
                throw new Error('Refresh token expired');
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            else {
                throw new Error(`Token verification failed: ${error.message}`);
            }
        }
    }
    /**
     * Refresh access token using refresh token
     */
    static refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);
            // Remove old refresh token
            if (decoded.tokenId) {
                this.refreshTokenStore.delete(decoded.tokenId);
            }
            // Generate new tokens
            const { id, email, roleId, name } = decoded;
            return this.generateTokens({ id, email, roleId, name });
        }
        catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    /**
     * Revoke refresh token
     */
    static revokeRefreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            if (decoded?.tokenId) {
                return this.refreshTokenStore.delete(decoded.tokenId);
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Revoke all refresh tokens for a user
     */
    static revokeAllUserTokens(userId) {
        let count = 0;
        for (const [tokenId, data] of this.refreshTokenStore.entries()) {
            if (data.userId === userId) {
                this.refreshTokenStore.delete(tokenId);
                count++;
            }
        }
        return count;
    }
    /**
     * Decode token without verification
     */
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Extract token from authorization header
     */
    static extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
        return null;
    }
    /**
     * Get token expiration time
     */
    static getTokenExpiration(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Check if token is expired
     */
    static isTokenExpired(token) {
        const expiration = this.getTokenExpiration(token);
        if (!expiration)
            return true;
        return expiration.getTime() < Date.now();
    }
    /**
     * Get time until token expires (in seconds)
     */
    static getTokenTimeToLive(token) {
        const expiration = this.getTokenExpiration(token);
        if (!expiration)
            return null;
        const ttl = Math.floor((expiration.getTime() - Date.now()) / 1000);
        return ttl > 0 ? ttl : 0;
    }
    /**
     * Clean up expired refresh tokens
     */
    static cleanupExpiredTokens() {
        const now = new Date();
        let count = 0;
        for (const [tokenId, data] of this.refreshTokenStore.entries()) {
            if (data.expiresAt < now) {
                this.refreshTokenStore.delete(tokenId);
                count++;
            }
        }
        return count;
    }
    /**
     * Get active sessions for a user
     */
    static getUserSessions(userId) {
        const sessions = [];
        for (const [tokenId, data] of this.refreshTokenStore.entries()) {
            if (data.userId === userId) {
                sessions.push({
                    tokenId,
                    createdAt: new Date(data.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000), // Approximate
                    expiresAt: data.expiresAt
                });
            }
        }
        return sessions;
    }
    /**
     * Get active session count
     */
    static getActiveSessionCount() {
        this.cleanupExpiredTokens();
        return this.refreshTokenStore.size;
    }
    /**
     * Create email verification token
     */
    static createEmailVerificationToken(email) {
        const options = {
            expiresIn: '24h',
            algorithm: 'HS256'
        };
        return jsonwebtoken_1.default.sign({ email, purpose: 'email-verification' }, this.SECRET, options);
    }
    /**
     * Create password reset token
     */
    static createPasswordResetToken(userId) {
        const options = {
            expiresIn: '1h',
            algorithm: 'HS256'
        };
        return jsonwebtoken_1.default.sign({ userId, purpose: 'password-reset' }, this.SECRET, options);
    }
    /**
     * Verify purpose-specific token
     */
    static verifyPurposeToken(token, expectedPurpose) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.SECRET);
            if (decoded.purpose !== expectedPurpose) {
                return { valid: false, error: 'Invalid token purpose' };
            }
            return { valid: true, data: decoded };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return { valid: false, error: 'Token expired' };
            }
            return { valid: false, error: error.message };
        }
    }
    /**
     * Get token statistics
     */
    static getTokenStats() {
        return {
            activeTokens: this.refreshTokenStore.size,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`
        };
    }
}
exports.JwtUtils = JwtUtils;
JwtUtils.SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
JwtUtils.REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
JwtUtils.ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
JwtUtils.REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
JwtUtils.ISSUER = process.env.JWT_ISSUER || 'book-review-system';
JwtUtils.AUDIENCE = process.env.JWT_AUDIENCE || 'book-review-client';
// Store refresh tokens (in production, use Redis or database)
JwtUtils.refreshTokenStore = new Map();
