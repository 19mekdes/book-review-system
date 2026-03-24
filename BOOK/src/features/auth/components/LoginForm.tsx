import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Link,
  Alert,
  CircularProgress,
  useTheme,
  Fade,
  Zoom
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Types - rememberMe is required
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean; // Required
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'github') => Promise<void>;
  enableSocialLogin?: boolean;
  enableRememberMe?: boolean;
  enablePasswordReset?: boolean;
  redirectUrl?: string;
  onSuccess?: () => void;
  className?: string;
}

// Validation schema - rememberMe is required
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must not exceed 50 characters')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Password must contain at least one letter and one number'
    ),
  rememberMe: yup.boolean().required() // Required
});

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onSocialLogin,
  enableSocialLogin = true,
  enableRememberMe = true,
  enablePasswordReset = true,
  redirectUrl = '/dashboard',
  onSuccess,
  className
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    mode: 'onChange'
  });

  // Clear external error when form changes
  useEffect(() => {
    if (error) {
      clearErrors();
    }
  }, [error, clearErrors]);

  const handleFormSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      await onSubmit(data);
      setShowSuccess(true);
      
      // Redirect after successful login
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectUrl);
        }
      }, 1500);
    } catch (err) {
      setError('root', { 
        type: 'manual', 
        message: err instanceof Error ? err.message : 'Invalid email or password' 
      });
    }
  };

  const handleSocialClick = async (provider: 'google' | 'facebook' | 'github') => {
    if (onSocialLogin) {
      try {
        await onSocialLogin(provider);
      } catch (err) {
        console.error(`${provider} login failed:`, err);
      }
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Check if in development using Vite's import.meta.env
  const isDev = import.meta.env.DEV;

  return (
    <Zoom in={true} timeout={500}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 450,
          width: '100%',
          mx: 'auto',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          }
        }}
        className={className}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 1
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to your account
          </Typography>
        </Box>

        {/* Success Message */}
        <Fade in={showSuccess} timeout={500}>
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setShowSuccess(false)}
          >
            Login successful! Redirecting...
          </Alert>
        </Fade>

        {/* Error Message */}
        <Fade in={!!error} timeout={500}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => clearErrors()}
          >
            {error}
          </Alert>
        </Fade>

        {/* Login Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Email Field */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading || showSuccess}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            )}
          />

          {/* Password Field */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading || showSuccess}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
            )}
          />

          {/* Options Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              mb: 3
            }}
          >
            {enableRememberMe && (
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        Remember me
                      </Typography>
                    }
                  />
                )}
              />
            )}

            {enablePasswordReset && (
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot password?
              </Link>
            )}
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!isValid || isLoading || showSuccess}
            sx={{
              py: 1.5,
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              },
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Sign In
                <ArrowForwardIcon />
              </Box>
            )}
          </Button>
        </form>

        {/* Social Login */}
        {enableSocialLogin && (
          <Box sx={{ mt: 4 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                OR CONTINUE WITH
              </Typography>
            </Divider>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mt: 3
              }}
            >
              <IconButton
                onClick={() => handleSocialClick('google')}
                disabled={isLoading}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <GoogleIcon sx={{ color: '#DB4437' }} />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick('facebook')}
                disabled={isLoading}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <FacebookIcon sx={{ color: '#4267B2' }} />
              </IconButton>

              <IconButton
                onClick={() => handleSocialClick('github')}
                disabled={isLoading}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <GitHubIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Sign Up Link */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>

        {/* Demo Credentials (for development) */}
        {isDev && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Demo Credentials:
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Email: demo@example.com
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Password: demo123
            </Typography>
          </Box>
        )}
      </Paper>
    </Zoom>
  );
};

// Pre-defined variants
export const CompactLoginForm: React.FC<LoginFormProps> = (props) => (
  <LoginForm {...props} enableSocialLogin={false} enableRememberMe={false} />
);

export const MinimalLoginForm: React.FC<LoginFormProps> = (props) => (
  <LoginForm {...props} enableSocialLogin={false} enableRememberMe={false} enablePasswordReset={false} />
);

export default LoginForm;