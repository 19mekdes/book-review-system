import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authAPI, {
  LoginCredentials,
  RegisterData,
  User,
  AuthResponse,
  APIError,
  Session,
  LoginHistory,
  UserPreferences,
  TwoFactorSetupResponse,
  UpdateProfileData
} from './authAPI';


export interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  
  // Loading states
  isLoading: boolean;
  isRegistering: boolean;
  isLoggingIn: boolean;
  isUpdating: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Record<string, string> | null;
  
  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // Session management
  sessions: Session[];
  sessionsLoading: boolean;
  
  // Login history
  loginHistory: {
    data: LoginHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  loginHistoryLoading: boolean;
  
  // Two-factor authentication
  twoFactorSetup: TwoFactorSetupResponse | null;
  twoFactorEnabled: boolean;
  twoFactorLoading: boolean;
  
  // Email verification
  emailVerified: boolean;
  verificationLoading: boolean;
  
  // Password reset
  resetToken: string | null;
  resetLoading: boolean;
  
  // Remember me
  rememberMe: boolean;
  
  // Last activity
  lastActivity: number | null;
  
  // Initial loading
  initialLoading: boolean;
}

// ============================================
// Initial State
// ============================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  
  isLoading: false,
  isRegistering: false,
  isLoggingIn: false,
  isUpdating: false,
  
  error: null,
  validationErrors: null,
  
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  tokenExpiry: localStorage.getItem('tokenExpiry') 
    ? parseInt(localStorage.getItem('tokenExpiry')!) 
    : null,
  
  sessions: [],
  sessionsLoading: false,
  
  loginHistory: {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  loginHistoryLoading: false,
  
  twoFactorSetup: null,
  twoFactorEnabled: false,
  twoFactorLoading: false,
  
  emailVerified: false,
  verificationLoading: false,
  
  resetToken: null,
  resetLoading: false,
  
  rememberMe: false,
  
  lastActivity: Date.now(),
  
  initialLoading: true
};

// ============================================
// Async Thunks
// ============================================

/**
 * Register a new user
 */
export const register = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: APIError }
>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Login user
 */
export const login = createAsyncThunk<
  AuthResponse & { rememberMe?: boolean },
  LoginCredentials & { rememberMe?: boolean },
  { rejectValue: APIError }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return {
        ...response,
        rememberMe: credentials.rememberMe
      };
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Social login
 */
export const socialLogin = createAsyncThunk<
  AuthResponse,
  { provider: 'google' | 'facebook' | 'github'; token: string },
  { rejectValue: APIError }
>(
  'auth/socialLogin',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.socialLogin(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Logout user
 */
export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: APIError }
>(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (state.auth.refreshToken) {
        await authAPI.logout(state.auth.refreshToken);
      }
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Refresh access token
 */
export const refreshToken = createAsyncThunk<
  { accessToken: string; expiresIn: number },
  void,
  { rejectValue: APIError }
>(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authAPI.refreshToken(state.auth.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Get current user
 */
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: APIError }
>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Update profile
 */
export const updateProfile = createAsyncThunk<
  User,
  UpdateProfileData,
  { rejectValue: APIError }
>(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const user = await authAPI.updateProfile(data);
      return user;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Change password
 */
export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string; confirmPassword: string },
  { rejectValue: APIError }
>(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Forgot password
 */
export const forgotPassword = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: APIError }
>(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = createAsyncThunk<
  { message: string },
  { token: string; password: string; confirmPassword: string },
  { rejectValue: APIError }
>(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Verify email
 */
export const verifyEmail = createAsyncThunk<
  { message: string },
  { token: string },
  { rejectValue: APIError }
>(
  'auth/verifyEmail',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Resend verification email
 */
export const resendVerificationEmail = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: APIError }
>(
  'auth/resendVerificationEmail',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendVerificationEmail();
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Setup two-factor authentication
 */
export const setupTwoFactor = createAsyncThunk<
  TwoFactorSetupResponse,
  void,
  { rejectValue: APIError }
>(
  'auth/setupTwoFactor',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.setupTwoFactor();
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Verify two-factor authentication
 */
export const verifyTwoFactor = createAsyncThunk<
  { message: string; backupCodes: string[] },
  { token: string; code: string },
  { rejectValue: APIError }
>(
  'auth/verifyTwoFactor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyTwoFactor(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Disable two-factor authentication
 */
export const disableTwoFactor = createAsyncThunk<
  { message: string },
  { password: string; code?: string },
  { rejectValue: APIError }
>(
  'auth/disableTwoFactor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.disableTwoFactor(data);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Get user sessions
 */
export const getSessions = createAsyncThunk<
  Session[],
  void,
  { rejectValue: APIError }
>(
  'auth/getSessions',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await authAPI.getSessions();
      return sessions;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Revoke session
 */
export const revokeSession = createAsyncThunk<
  string,
  string,
  { rejectValue: APIError }
>(
  'auth/revokeSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      await authAPI.revokeSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Revoke all other sessions
 */
export const revokeAllOtherSessions = createAsyncThunk<
  { count: number },
  void,
  { rejectValue: APIError }
>(
  'auth/revokeAllOtherSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.revokeAllOtherSessions();
      return { count: response.count };
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Get login history
 */
export const getLoginHistory = createAsyncThunk<
  {
    data: LoginHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  },
  { page?: number; limit?: number },
  { rejectValue: APIError }
>(
  'auth/getLoginHistory',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await authAPI.getLoginHistory(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Update preferences
 */
export const updatePreferences = createAsyncThunk<
  UserPreferences,
  Partial<UserPreferences>,
  { rejectValue: APIError }
>(
  'auth/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const updated = await authAPI.updatePreferences(preferences);
      return updated;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Upload avatar
 */
export const uploadAvatar = createAsyncThunk<
  string,
  File,
  { rejectValue: APIError }
>(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const response = await authAPI.uploadAvatar(file);
      return response.avatarUrl;
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Delete avatar
 */
export const deleteAvatar = createAsyncThunk<
  void,
  void,
  { rejectValue: APIError }
>(
  'auth/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.deleteAvatar();
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

/**
 * Delete account
 */
export const deleteAccount = createAsyncThunk<
  void,
  string,
  { rejectValue: APIError }
>(
  'auth/deleteAccount',
  async (password, { rejectWithValue }) => {
    try {
      await authAPI.deleteAccount(password);
    } catch (error) {
      return rejectWithValue(error as APIError);
    }
  }
);

// ============================================
// Auth Slice
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = null;
    },

    // Set remember me
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },

    // Update last activity
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },

    // Set initial loading
    setInitialLoading: (state, action: PayloadAction<boolean>) => {
      state.initialLoading = action.payload;
    },

    // Logout locally (without API call)
    localLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    },

    // Set tokens manually
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; expiresIn: number }>) => {
      const { accessToken, refreshToken, expiresIn } = action.payload;
      
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiry = Date.now() + expiresIn * 1000;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', String(state.tokenExpiry));
    },

    // Set user manually
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.emailVerified = action.payload.emailVerified;
      state.twoFactorEnabled = action.payload.twoFactorEnabled;
    },

    // Clear two-factor setup
    clearTwoFactorSetup: (state) => {
      state.twoFactorSetup = null;
    },

    // Reset password state
    resetPasswordState: (state) => {
      state.resetToken = null;
      state.resetLoading = false;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(register.pending, (state) => {
      state.isRegistering = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isRegistering = false;
      state.user = action.payload.data.user;
      state.isAuthenticated = true;
      state.accessToken = action.payload.data.tokens.accessToken;
      state.refreshToken = action.payload.data.tokens.refreshToken;
      state.tokenExpiry = Date.now() + action.payload.data.tokens.expiresIn;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isRegistering = false;
      state.error = action.payload?.message || 'Registration failed';
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoggingIn = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggingIn = false;
      state.user = action.payload.data.user;
      state.isAuthenticated = true;
      state.accessToken = action.payload.data.tokens.accessToken;
      state.refreshToken = action.payload.data.tokens.refreshToken;
      state.tokenExpiry = Date.now() + action.payload.data.tokens.expiresIn;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoggingIn = false;
      state.error = action.payload?.message || 'Login failed';
    });

    // Social Login
    builder.addCase(socialLogin.pending, (state) => {
      state.isLoggingIn = true;
      state.error = null;
    });
    builder.addCase(socialLogin.fulfilled, (state, action) => {
      state.isLoggingIn = false;
      state.user = action.payload.data.user;
      state.isAuthenticated = true;
      state.accessToken = action.payload.data.tokens.accessToken;
      state.refreshToken = action.payload.data.tokens.refreshToken;
      state.tokenExpiry = Date.now() + action.payload.data.tokens.expiresIn;
    });
    builder.addCase(socialLogin.rejected, (state, action) => {
      state.isLoggingIn = false;
      state.error = action.payload?.message || 'Social login failed';
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.sessions = [];
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    });
    builder.addCase(logout.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.sessions = [];
      state.isLoading = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    });

    // Refresh Token
    builder.addCase(refreshToken.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.isLoading = false;
      state.accessToken = action.payload.accessToken;
      state.tokenExpiry = Date.now() + action.payload.expiresIn * 1000;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('tokenExpiry', String(state.tokenExpiry));
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.isLoading = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.initialLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.emailVerified = action.payload.emailVerified;
      state.twoFactorEnabled = action.payload.twoFactorEnabled;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.initialLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isUpdating = false;
      state.user = action.payload;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload?.message || 'Failed to update profile';
    });

    // Get Sessions
    builder.addCase(getSessions.pending, (state) => {
      state.sessionsLoading = true;
      state.error = null;
    });
    builder.addCase(getSessions.fulfilled, (state, action) => {
      state.sessionsLoading = false;
      state.sessions = action.payload;
    });
    builder.addCase(getSessions.rejected, (state, action) => {
      state.sessionsLoading = false;
      state.error = action.payload?.message || 'Failed to get sessions';
    });

    // Revoke Session
    builder.addCase(revokeSession.fulfilled, (state, action) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
    });

    // Revoke All Other Sessions
    builder.addCase(revokeAllOtherSessions.fulfilled, (state) => {
      state.sessions = state.sessions.filter(s => s.isCurrent);
    });

    // Get Login History
    builder.addCase(getLoginHistory.pending, (state) => {
      state.loginHistoryLoading = true;
      state.error = null;
    });
    builder.addCase(getLoginHistory.fulfilled, (state, action) => {
      state.loginHistoryLoading = false;
      state.loginHistory = action.payload;
    });
    builder.addCase(getLoginHistory.rejected, (state, action) => {
      state.loginHistoryLoading = false;
      state.error = action.payload?.message || 'Failed to get login history';
    });
  }
});

// ============================================
// Selectors
// ============================================

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectValidationErrors = (state: { auth: AuthState }) => state.auth.validationErrors;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectEmailVerified = (state: { auth: AuthState }) => state.auth.emailVerified;
export const selectTwoFactorEnabled = (state: { auth: AuthState }) => state.auth.twoFactorEnabled;
export const selectTwoFactorSetup = (state: { auth: AuthState }) => state.auth.twoFactorSetup;
export const selectSessions = (state: { auth: AuthState }) => state.auth.sessions;
export const selectLoginHistory = (state: { auth: AuthState }) => state.auth.loginHistory;
export const selectInitialLoading = (state: { auth: AuthState }) => state.auth.initialLoading;
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  if (!state.auth.tokenExpiry) return true;
  return Date.now() >= state.auth.tokenExpiry;
};

// ============================================
// Exports
// ============================================

export const {
  clearErrors,
  setRememberMe,
  updateLastActivity,
  setInitialLoading,
  localLogout,
  setTokens,
  setUser,
  clearTwoFactorSetup,
  resetPasswordState
} = authSlice.actions;

export default authSlice.reducer;