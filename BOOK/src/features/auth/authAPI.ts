import api from '../../services/api';
import { AxiosResponse, AxiosError } from 'axios';

// ============================================
// Types
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  interests?: string[];
  newsletter?: boolean;
}

export interface SocialAuthData {
  provider: 'google' | 'facebook' | 'github';
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: TokenResponse;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: 'Admin' | 'Moderator' | 'User';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  birthDate?: string;
  interests?: string[];
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;
  newsletter: boolean;
}

export interface UserStats {
  reviewsCount: number;
  booksReviewed: number;
  averageRating: number;
  followers: number;
  following: number;
  helpfulVotes: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: File | string;
  location?: string;
  phone?: string;
  birthDate?: string;
  interests?: string[];
  preferences?: Partial<UserPreferences>;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyData {
  token: string;
  code: string;
}

export interface TwoFactorDisableData {
  password: string;
  code?: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LoginHistory {
  id: number;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  os: string;
  success: boolean;
  failureReason?: string;
}

export interface APIError {
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  statusCode: number;
}

// Error response type
interface ErrorResponse {
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  statusCode?: number;
}

// ============================================
// Auth API Class
// ============================================

class AuthAPI {
  private readonly baseUrl = '/auth';

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        `${this.baseUrl}/register`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        `${this.baseUrl}/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Login with social provider
   */
  async socialLogin(data: SocialAuthData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        `${this.baseUrl}/social-login`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`, { refreshToken });
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response: AxiosResponse<RefreshTokenResponse> = await api.post(
        `${this.baseUrl}/refresh-token`,
        { refreshToken }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ data: User }> = await api.get(
        `${this.baseUrl}/me`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'avatar' && value instanceof File) {
            formData.append('avatar', value);
          } else if (key === 'interests' && Array.isArray(value)) {
            formData.append('interests', JSON.stringify(value));
          } else if (key === 'preferences' && typeof value === 'object') {
            formData.append('preferences', JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response: AxiosResponse<{ data: User }> = await api.patch(
        `${this.baseUrl}/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/change-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/forgot-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/reset-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/verify-email`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/resend-verification`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(): Promise<TwoFactorSetupResponse> {
    try {
      const response: AxiosResponse<TwoFactorSetupResponse> = await api.post(
        `${this.baseUrl}/2fa/setup`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Verify and enable two-factor authentication
   */
  async verifyTwoFactor(data: TwoFactorVerifyData): Promise<{ message: string; backupCodes: string[] }> {
    try {
      const response: AxiosResponse<{ message: string; backupCodes: string[] }> = await api.post(
        `${this.baseUrl}/2fa/verify`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(data: TwoFactorDisableData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        `${this.baseUrl}/2fa/disable`,
        data
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Get all active sessions
   */
  async getSessions(): Promise<Session[]> {
    try {
      const response: AxiosResponse<{ data: Session[] }> = await api.get(
        `${this.baseUrl}/sessions`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        `${this.baseUrl}/sessions/${sessionId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<{ message: string; count: number }> {
    try {
      const response: AxiosResponse<{ message: string; count: number }> = await api.delete(
        `${this.baseUrl}/sessions`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Get login history
   */
  async getLoginHistory(page: number = 1, limit: number = 10): Promise<{
    data: LoginHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response: AxiosResponse<{
        data: LoginHistory[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }> = await api.get(`${this.baseUrl}/login-history`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Check if username is available
   */
  async checkUsername(username: string): Promise<{ available: boolean }> {
    try {
      const response: AxiosResponse<{ available: boolean }> = await api.get(
        `${this.baseUrl}/check-username/${username}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Check if email is available
   */
  async checkEmail(email: string): Promise<{ available: boolean }> {
    try {
      const response: AxiosResponse<{ available: boolean }> = await api.get(
        `${this.baseUrl}/check-email/${email}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId?: number): Promise<UserStats> {
    try {
      const url = userId ? `${this.baseUrl}/stats/${userId}` : `${this.baseUrl}/stats`;
      const response: AxiosResponse<{ data: UserStats }> = await api.get(url);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<{ data: UserPreferences }> = await api.patch(
        `${this.baseUrl}/preferences`,
        preferences
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response: AxiosResponse<{ avatarUrl: string }> = await api.post(
        `${this.baseUrl}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        `${this.baseUrl}/avatar`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        `${this.baseUrl}/account`,
        {
          data: { password },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ErrorResponse>);
    }
  }

  /**
   * Handle API errors - Fixed: removed 'any' type
   */
  private handleError(error: AxiosError<ErrorResponse>): APIError {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
      };
    }
  }
}

// Create and export a singleton instance
export const authAPI = new AuthAPI();

// Export default instance
export default authAPI;