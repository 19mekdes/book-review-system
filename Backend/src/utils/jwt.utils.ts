import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT Utility
 * Handles token generation, verification, and management
 */

export interface TokenPayload {
  id: number;
  email: string;
  roleId?: number;
  name?: string;
  [key: string]: any;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export class JwtUtils {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
  private static readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private static readonly ISSUER = process.env.JWT_ISSUER || 'book-review-system';
  private static readonly AUDIENCE = process.env.JWT_AUDIENCE || 'book-review-client';

  // Store refresh tokens (in production, use Redis or database)
  private static refreshTokenStore: Map<string, { token: string; userId: number; expiresAt: Date }> = new Map();

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: this.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithm: 'HS256'
      };
      
      return jwt.sign(payload, this.SECRET, options);
    } catch (error) {
      throw new Error(`Access token generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: this.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
        algorithm: 'HS256'
      };
      
      const tokenId = crypto.randomBytes(16).toString('hex');
      const tokenPayload = { ...payload, tokenId };
      
      const token = jwt.sign(tokenPayload, this.REFRESH_SECRET, options);

      // Store refresh token
      const decoded = jwt.decode(token) as { exp: number };
      this.refreshTokenStore.set(tokenId, {
        token,
        userId: payload.id,
        expiresAt: new Date(decoded.exp * 1000)
      });

      return token;
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(payload: TokenPayload): TokenResponse {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    const decoded = jwt.decode(accessToken) as { exp: number };
    
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
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE
      }) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error(`Token verification failed: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE
      }) as DecodedToken;

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
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error(`Token verification failed: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshAccessToken(refreshToken: string): TokenResponse {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Remove old refresh token
      if (decoded.tokenId) {
        this.refreshTokenStore.delete(decoded.tokenId);
      }

      // Generate new tokens
      const { id, email, roleId, name } = decoded;
      return this.generateTokens({ id, email, roleId, name });
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  /**
   * Revoke refresh token
   */
  static revokeRefreshToken(refreshToken: string): boolean {
    try {
      const decoded = jwt.decode(refreshToken) as { tokenId?: string };
      if (decoded?.tokenId) {
        return this.refreshTokenStore.delete(decoded.tokenId);
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static revokeAllUserTokens(userId: number): number {
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
  static decodeToken(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    
    return null;
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as { exp?: number };
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration.getTime() < Date.now();
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTokenTimeToLive(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return null;
    
    const ttl = Math.floor((expiration.getTime() - Date.now()) / 1000);
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Clean up expired refresh tokens
   */
  static cleanupExpiredTokens(): number {
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
  static getUserSessions(userId: number): Array<{
    tokenId: string;
    createdAt: Date;
    expiresAt: Date;
  }> {
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
  static getActiveSessionCount(): number {
    this.cleanupExpiredTokens();
    return this.refreshTokenStore.size;
  }

  /**
   * Create email verification token
   */
  static createEmailVerificationToken(email: string): string {
    const options: SignOptions = {
      expiresIn: '24h',
      algorithm: 'HS256'
    };
    
    return jwt.sign(
      { email, purpose: 'email-verification' },
      this.SECRET,
      options
    );
  }

  /**
   * Create password reset token
   */
  static createPasswordResetToken(userId: number): string {
    const options: SignOptions = {
      expiresIn: '1h',
      algorithm: 'HS256'
    };
    
    return jwt.sign(
      { userId, purpose: 'password-reset' },
      this.SECRET,
      options
    );
  }

  /**
   * Verify purpose-specific token
   */
  static verifyPurposeToken(
    token: string,
    expectedPurpose: string
  ): { valid: boolean; data?: any; error?: string } {
    try {
      const decoded = jwt.verify(token, this.SECRET) as any;
      
      if (decoded.purpose !== expectedPurpose) {
        return { valid: false, error: 'Invalid token purpose' };
      }
      
      return { valid: true, data: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      }
      return { valid: false, error: (error as Error).message };
    }
  }

  /**
   * Get token statistics
   */
  static getTokenStats(): {
    activeTokens: number;
    memoryUsage: string;
  } {
    return {
      activeTokens: this.refreshTokenStore.size,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`
    };
  }
}