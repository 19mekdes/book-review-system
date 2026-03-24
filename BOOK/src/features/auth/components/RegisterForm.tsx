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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  useTheme,
  Fade,
  Zoom,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Types
export interface RegisterFormData {
  // Step 1: Account Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal Info
  username?: string;
  phone?: string;
  location?: string;
  birthDate?: string;
  
  // Step 3: Preferences
  interests?: string[];
  newsletter: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onSocialRegister?: (provider: 'google' | 'facebook' | 'github') => Promise<void>;
  enableSocialLogin?: boolean;
  redirectUrl?: string;
  onSuccess?: () => void;
  className?: string;
}

// Validation schemas
const step1Schema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must not exceed 100 characters'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must not exceed 50 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Must contain at least one special character'),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

const step3Schema = yup.object().shape({
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  privacyAccepted: yup.boolean().oneOf([true], 'You must accept the privacy policy')
});

// Password strength indicator component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'No password', color: 'grey' };
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*]/.test(pwd)) score += 1;
    
    // Calculate percentage
    const percentage = (score / 6) * 100;
    
    if (percentage < 30) return { score: percentage, label: 'Weak', color: '#f44336' };
    if (percentage < 60) return { score: percentage, label: 'Fair', color: '#ff9800' };
    if (percentage < 80) return { score: percentage, label: 'Good', color: '#2196f3' };
    return { score: percentage, label: 'Strong', color: '#4caf50' };
  };

  const strength = calculateStrength(password);

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength
        </Typography>
        <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600 }}>
          {strength.label}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={strength.score}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: strength.color,
            borderRadius: 3
          }
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Use at least 8 characters with uppercase, lowercase, numbers, and special characters
      </Typography>
    </Box>
  );
};

// Available interests for selection
const availableInterests = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 
  'Mystery', 'Thriller', 'Romance', 'Biography', 
  'History', 'Self-Help', 'Poetry', 'Young Adult'
];

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onSocialRegister,
  enableSocialLogin = true,
  redirectUrl = '/dashboard',
  onSuccess,
  className
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  const steps = ['Account Information', 'Personal Details', 'Preferences & Agreements'];

  const {
    control,
    getValues,
    setValue,
    watch
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      phone: '',
      location: '',
      birthDate: '',
      interests: [],
      newsletter: false,
      termsAccepted: false,
      privacyAccepted: false
    },
    mode: 'onChange'
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password');
  const name = watch('name');
  const email = watch('email');
  const confirmPassword = watch('confirmPassword');
  const termsAccepted = watch('termsAccepted');
  const privacyAccepted = watch('privacyAccepted');

  // Validate step 1 in real-time
  useEffect(() => {
    const validateStep1 = async () => {
      const currentValues = {
        name,
        email,
        password,
        confirmPassword
      };
      
      try {
        await step1Schema.validate(currentValues, { abortEarly: false });
        setStep1Errors({});
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errors: Record<string, string> = {};
          err.inner.forEach((validationError) => {
            if (validationError.path) {
              errors[validationError.path] = validationError.message;
            }
          });
          setStep1Errors(errors);
        }
      }
    };
    
    if (activeStep === 0) {
      validateStep1();
    }
  }, [name, email, password, confirmPassword, activeStep]);

  // Validate step 3 in real-time
  useEffect(() => {
    const validateStep3 = async () => {
      const currentValues = {
        termsAccepted,
        privacyAccepted
      };
      
      try {
        await step3Schema.validate(currentValues, { abortEarly: false });
        setStep3Errors({});
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          const errors: Record<string, string> = {};
          err.inner.forEach((validationError) => {
            if (validationError.path) {
              errors[validationError.path] = validationError.message;
            }
          });
          setStep3Errors(errors);
        }
      }
    };
    
    if (activeStep === 2) {
      validateStep3();
    }
  }, [termsAccepted, privacyAccepted, activeStep]);

  const handleNext = async () => {
    let isValidStep = false;
    
    switch (activeStep) {
  case 0:
    // Convert string values to booleans using !!
    isValidStep = Object.keys(step1Errors).length === 0 && 
                  !!name && !!email && !!password && !!confirmPassword;
    break;
  case 1:
    // Step 2 fields are optional, always valid
    isValidStep = true;
    break;
  case 2:
    // termsAccepted and privacyAccepted are already booleans
    isValidStep = Object.keys(step3Errors).length === 0 && 
                  termsAccepted && privacyAccepted;
    break;
}

    if (isValidStep) {
      if (activeStep === steps.length - 1) {
        // Submit form
        const formData = getValues();
        await handleFormSubmit({
          ...formData,
          interests: selectedInterests
        });
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit(data);
      setShowSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(redirectUrl);
        }
      }, 1500);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleSocialClick = async (provider: 'google' | 'facebook' | 'github') => {
    if (onSocialRegister) {
      try {
        await onSocialRegister(provider);
      } catch (err) {
        console.error(`${provider} registration failed:`, err);
      }
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      
      setValue('interests', newInterests);
      return newInterests;
    });
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0} timeout={500}>
            <Box>
              {/* Name Field */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    margin="normal"
                    error={!!step1Errors.name}
                    helperText={step1Errors.name}
                    disabled={isLoading || showSuccess}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />

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
                    error={!!step1Errors.email}
                    helperText={step1Errors.email}
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
                    error={!!step1Errors.password}
                    helperText={step1Errors.password}
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
                              onClick={() => setShowPassword(!showPassword)}
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

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={password} />

              {/* Confirm Password Field */}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    margin="normal"
                    error={!!step1Errors.confirmPassword}
                    helperText={step1Errors.confirmPassword}
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in={activeStep === 1} timeout={500}>
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Username (Optional)"
                        margin="normal"
                        disabled={isLoading || showSuccess}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon color="action" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone (Optional)"
                        margin="normal"
                        disabled={isLoading || showSuccess}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon color="action" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Location (Optional)"
                        margin="normal"
                        disabled={isLoading || showSuccess}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationIcon color="action" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Birth Date (Optional)"
                        type="date"
                        margin="normal"
                        disabled={isLoading || showSuccess}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CakeIcon color="action" />
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select your interests (Optional)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {availableInterests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    onClick={() => handleInterestToggle(interest)}
                    color={selectedInterests.includes(interest) ? 'primary' : 'default'}
                    variant={selectedInterests.includes(interest) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Newsletter Option */}
              <Controller
                name="newsletter"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="I'd like to receive newsletters and updates"
                  />
                )}
              />

              {/* Terms Acceptance */}
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I accept the{' '}
                        <Link
                          component={RouterLink}
                          to="/terms"
                          target="_blank"
                          sx={{ cursor: 'pointer' }}
                        >
                          Terms and Conditions
                        </Link>
                      </Typography>
                    }
                  />
                )}
              />
              {step3Errors.termsAccepted && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: -1, mb: 1 }}>
                  {step3Errors.termsAccepted}
                </Typography>
              )}

              {/* Privacy Acceptance */}
              <Controller
                name="privacyAccepted"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I accept the{' '}
                        <Link
                          component={RouterLink}
                          to="/privacy"
                          target="_blank"
                          sx={{ cursor: 'pointer' }}
                        >
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                )}
              />
              {step3Errors.privacyAccepted && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: -1, mb: 1 }}>
                  {step3Errors.privacyAccepted}
                </Typography>
              )}
            </Box>
          </Fade>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Zoom in={true} timeout={500}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          mx: 'auto',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          },
          position: 'relative'
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
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join our community of book lovers
          </Typography>
        </Box>

        {/* Success Message */}
        <Fade in={showSuccess} timeout={500}>
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setShowSuccess(false)}
          >
            Registration successful! Redirecting...
          </Alert>
        </Fade>

        {/* Error Message */}
        <Fade in={!!error} timeout={500}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Fade>

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="subtitle1" fontWeight={600}>
                  {label}
                </Typography>
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                
                {/* Navigation Buttons */}
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0 || isLoading || showSuccess}
                      startIcon={<ArrowBackIcon />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={isLoading || showSuccess}
                      endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                    >
                      {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Social Registration */}
        {enableSocialLogin && (
          <Box sx={{ mt: 4 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                OR REGISTER WITH
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

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>

        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: 2
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Zoom>
  );
};

// Pre-defined variants
export const QuickRegisterForm: React.FC<RegisterFormProps> = (props) => (
  <RegisterForm {...props} enableSocialLogin={false} />
);

export default RegisterForm;