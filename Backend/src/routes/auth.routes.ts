import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-change-this';



const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      roleId: user.roleId
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { isValid: true, message: 'Password is valid' };
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { 
      name: name || 'missing', 
      email: email || 'missing', 
      hasPassword: !!password 
    });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and password are required' 
      });
    }

    if (name.length < 2) {
      return res.status(400).json({ 
        success: false,
        error: 'Name must be at least 2 characters' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid email format' 
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.message 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get default role (user role = 2)
    const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'user'");
    let roleId = 2;
    
    if (roleResult.rows.length > 0) {
      roleId = roleResult.rows[0].id;
    }

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, "roleId", created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, name, email, "roleId", created_at`,
      [name, email, hashedPassword, roleId]
    );

    const newUser = result.rows[0];
    console.log('User created successfully:', { id: newUser.id, email: newUser.email });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Try to store refresh token (don't fail if column doesn't exist)
    try {
      await pool.query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, newUser.id]
      );
      console.log('Refresh token stored successfully');
    } catch (tokenError) {
      console.log('Note: Could not store refresh token - column might not exist yet');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.roleId
      }
    });

  } catch (error: any) {
    console.error('========== REGISTRATION ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    if (error.detail) console.error('Error detail:', error.detail);
    console.error('========================================');
    
    res.status(500).json({ 
      success: false,
      error: 'Registration failed: ' + error.message 
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user - exclude potentially missing columns
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u."roleId", r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u."roleId" = r.id 
       WHERE u.email = $1`,
      [email]
    );

    console.log('User found:', result.rows.length > 0 ? 'Yes' : 'No');

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Try to store refresh token (don't fail if column doesn't exist)
    try {
      await pool.query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, user.id]
      );
    } catch (tokenError) {
      console.log('Note: Could not store refresh token - column might not exist');
    }

    // Remove sensitive data
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        roleId: user.roleId
      }
    });

  } catch (error: any) {
    console.error('========== LOGIN ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.code) console.error('Error code:', error.code);
    if (error.detail) console.error('Error detail:', error.detail);
    console.error('================================');
    
    res.status(500).json({ 
      success: false,
      error: 'Login failed: ' + error.message 
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Get new access token using refresh token
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        error: 'Refresh token is required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;

    // Check if refresh token exists in database
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND refresh_token = $2',
      [decoded.id, refreshToken]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid refresh token' 
      });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        roleId: user.roleId
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Invalid or expired refresh token' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await pool.query(
        'UPDATE users SET refresh_token = NULL WHERE refresh_token = $1',
        [refreshToken]
      );
    }

    res.json({ 
      success: true,
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Logout failed' 
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.message 
      });
    }

    // Get user with current password
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to change password' 
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.json({ 
        success: true,
        message: 'If your email exists in our system, you will receive a reset link' 
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.id]
    );

    console.log(`Password reset link: http://localhost:5173/reset-password?token=${resetToken}`);

    res.json({ 
      success: true,
      message: 'If your email exists in our system, you will receive a reset link',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process request' 
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Token and new password are required' 
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.message 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Check if token exists and is valid
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
      [decoded.id, token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    res.json({ 
      success: true,
      message: 'Password reset successful. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reset password' 
    });
  }
});

/**
 * GET /api/auth/verify-email
 * Verify email address
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        success: false,
        error: 'Verification token is required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token as string, JWT_SECRET) as any;

    // Update user email verification status
    const result = await pool.query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1 AND email = $2 RETURNING id',
      [decoded.id, decoded.email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid verification token' 
      });
    }

    res.json({ 
      success: true,
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify email' 
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Get user details - exclude potentially missing columns
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u."roleId", u.created_at,
              r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u."roleId" = r.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user profile' 
    });
  }
});

export default router;