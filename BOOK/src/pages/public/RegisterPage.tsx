import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import api from '../../services/api';

// ============================================
// Types
// ============================================

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

// ============================================
// Password Strength Meter Component
// ============================================

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getStrength = (): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'No password', color: '#e0e0e0' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
      { score: 0, label: 'Very Weak', color: '#f44336' },
      { score: 1, label: 'Weak', color: '#ff9800' },
      { score: 2, label: 'Fair', color: '#ffc107' },
      { score: 3, label: 'Good', color: '#2196f3' },
      { score: 4, label: 'Strong', color: '#4caf50' }
    ];
    
    return strengths[score] || strengths[0];
  };

  const strength = getStrength();
  const percentage = (strength.score / 4) * 100;

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
      <Box
        sx={{
          width: '100%',
          height: 6,
          bgcolor: '#e0e0e0',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: strength.color,
            transition: 'width 0.3s ease'
          }}
        />
      </Box>
    </Box>
  );
};

// ============================================
// Step Content Components
// ============================================

interface StepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  showPassword?: boolean;
  showConfirmPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
  setShowConfirmPassword?: (value: boolean) => void;
  password?: string;
}

const Step1AccountInfo: React.FC<StepProps> = ({ control, errors }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Account Information
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      Please provide your basic information to create an account.
    </Typography>

    <Controller
      name="name"
      control={control}
      rules={{ required: 'Name is required' }}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label="Full Name"
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      )}
    />

    <Controller
      name="email"
      control={control}
      rules={{ 
        required: 'Email is required',
        pattern: {
          value: /\S+@\S+\.\S+/,
          message: 'Invalid email format'
        }
      }}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label="Email Address"
          type="email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message || ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      )}
    />
  </Box>
);

const Step2Security: React.FC<StepProps> = ({ 
  control, 
  errors, 
  showPassword, 
  showConfirmPassword, 
  setShowPassword, 
  setShowConfirmPassword,
  password 
}) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Security
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      Create a strong password to secure your account.
    </Typography>

    <Controller
      name="password"
      control={control}
      rules={{ 
        required: 'Password is required',
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters'
        },
        validate: {
          hasUppercase: (value) => /[A-Z]/.test(value) || 'Must contain at least one uppercase letter',
          hasNumber: (value) => /[0-9]/.test(value) || 'Must contain at least one number',
          hasSpecialChar: (value) => /[^A-Za-z0-9]/.test(value) || 'Must contain at least one special character'
        }
      }}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message || ''}
          autoComplete="new-password" // Added to fix warning
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword && setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      )}
    />

    <PasswordStrengthMeter password={password || ''} />

    <Controller
      name="confirmPassword"
      control={control}
      rules={{ 
        required: 'Please confirm your password',
        validate: (value, formValues) => 
          value === formValues.password || 'Passwords do not match'
      }}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message || ''}
          autoComplete="new-password" // Added to fix warning
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword && setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      )}
    />
  </Box>
);

const Step3Agreements: React.FC<StepProps> = ({ control, errors }) => {
  const theme = useTheme();
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Agreements
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review and accept our terms to complete registration.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          borderColor: alpha(theme.palette.primary.main, 0.2)
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Terms and Conditions Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          By creating an account, you agree to our Terms and Conditions and Privacy Policy. 
          You'll receive occasional account-related emails. You can opt out at any time.
        </Typography>

        <Controller
          name="termsAccepted"
          control={control}
          rules={{ required: 'You must accept the Terms and Conditions' }}
          render={({ field }) => (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value || false}
                    onChange={field.onChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the{' '}
                    <Link href="#" underline="hover">
                      Terms and Conditions
                    </Link>
                  </Typography>
                }
              />
              {errors.termsAccepted && (
                <Typography variant="caption" color="error" display="block" sx={{ ml: 4 }}>
                  {errors.termsAccepted.message || 'This field is required'}
                </Typography>
              )}
            </Box>
          )}
        />

        <Controller
          name="privacyAccepted"
          control={control}
          rules={{ required: 'You must accept the Privacy Policy' }}
          render={({ field }) => (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value || false}
                    onChange={field.onChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the{' '}
                    <Link href="#" underline="hover">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
              {errors.privacyAccepted && (
                <Typography variant="caption" color="error" display="block" sx={{ ml: 4 }}>
                  {errors.privacyAccepted.message || 'This field is required'}
                </Typography>
              )}
            </Box>
          )}
        />
      </Paper>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Your information is encrypted and secure. We'll never share your data with third parties.
        </Typography>
      </Alert>
    </Box>
  );
};

// ============================================
// Main Component
// ============================================

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const steps = ['Account Information', 'Security', 'Agreements'];

  const {
    control,
    watch,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
      privacyAccepted: false
    },
    mode: 'onChange'
  });

  const password = watch('password');
   

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (activeStep) {
      case 0:
        fieldsToValidate = ['name', 'email'];
        break;
      case 1:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
      case 2:
        fieldsToValidate = ['termsAccepted', 'privacyAccepted'];
        break;
    }
    
    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    
    if (isStepValid) {
      if (activeStep === steps.length - 1) {
        const formData = getValues();
        await handleSubmit(formData);
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting registration:', {
        name: data.name,
        email: data.email,
        password: '***'
      });

      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      console.log('Registration successful:', response.data);
      
      setNotification({
        open: true,
        message: 'Registration successful! Redirecting to login...',
        severity: 'success'
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Registration error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.primary.main,
              margin: '0 auto 16px'
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join our community of book lovers
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content - Wrapped in form */}
        <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
          <Box sx={{ minHeight: 400 }}>
            {activeStep === 0 && (
              <Step1AccountInfo
                control={control}
                errors={errors}
              />
            )}
            {activeStep === 1 && (
              <Step2Security
                control={control}
                errors={errors}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                password={password}
              />
            )}
            {activeStep === 2 && (
              <Step3Agreements
                control={control}
                errors={errors}
              />
            )}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              size="large"
              sx={{ minWidth: '120px' }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
              size="large"
              sx={{ minWidth: '160px' }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Create Account'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </form>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;