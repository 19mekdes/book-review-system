import { VALIDATION } from './constants';

// ============================================
// Email Validation
// ============================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate email with detailed error message
 */
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (email.length > 100) {
    return { isValid: false, message: 'Email must not exceed 100 characters' };
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// ============================================
// Password Validation
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  suggestions: string[];
  requirements: {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= VALIDATION.PASSWORD.MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  // Calculate score (0-4)
  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.uppercase) score++;
  if (requirements.lowercase) score++;
  if (requirements.number) score++;
  if (requirements.special) score++;

  // Generate suggestions
  const suggestions: string[] = [];
  if (!requirements.minLength) {
    suggestions.push(`Use at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`);
  }
  if (!requirements.uppercase) {
    suggestions.push('Include at least one uppercase letter');
  }
  if (!requirements.lowercase) {
    suggestions.push('Include at least one lowercase letter');
  }
  if (!requirements.number) {
    suggestions.push('Include at least one number');
  }
  if (!requirements.special) {
    suggestions.push('Include at least one special character');
  }

  // Determine label
  let label: PasswordStrength['label'] = 'Very Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Good';
  else if (score >= 2) label = 'Fair';
  else if (score >= 1) label = 'Weak';

  return {
    score,
    label,
    suggestions,
    requirements,
  };
};

/**
 * Validate password
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string; strength?: PasswordStrength } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters`,
    };
  }

  if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Password must not exceed ${VALIDATION.PASSWORD.MAX_LENGTH} characters`,
    };
  }

  const strength = checkPasswordStrength(password);
  
  if (VALIDATION.PASSWORD.REQUIRE_UPPERCASE && !strength.requirements.uppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_LOWERCASE && !strength.requirements.lowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_NUMBER && !strength.requirements.number) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (VALIDATION.PASSWORD.REQUIRE_SPECIAL && !strength.requirements.special) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, strength };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; message?: string } => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

// ============================================
// Username Validation
// ============================================

/**
 * Validate username
 */
export const validateUsername = (
  username: string
): { isValid: boolean; message?: string } => {
  if (!username) {
    return { isValid: true }; // Username is optional
  }

  if (username.length < VALIDATION.USERNAME.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Username must be at least ${VALIDATION.USERNAME.MIN_LENGTH} characters`,
    };
  }

  if (username.length > VALIDATION.USERNAME.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Username must not exceed ${VALIDATION.USERNAME.MAX_LENGTH} characters`,
    };
  }

  if (!VALIDATION.USERNAME.PATTERN.test(username)) {
    return {
      isValid: false,
      message: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { isValid: true };
};

// ============================================
// Name Validation
// ============================================

/**
 * Validate name
 */
export const validateName = (
  name: string,
  fieldName: string = 'Name'
): { isValid: boolean; message?: string } => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.length < VALIDATION.NAME.MIN_LENGTH) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${VALIDATION.NAME.MIN_LENGTH} characters`,
    };
  }

  if (name.length > VALIDATION.NAME.MAX_LENGTH) {
    return {
      isValid: false,
      message: `${fieldName} must not exceed ${VALIDATION.NAME.MAX_LENGTH} characters`,
    };
  }

  // Optional: Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    };
  }

  return { isValid: true };
};

// ============================================
// Bio Validation
// ============================================

/**
 * Validate bio
 */
export const validateBio = (
  bio: string
): { isValid: boolean; message?: string } => {
  if (!bio) {
    return { isValid: true }; // Bio is optional
  }

  if (bio.length > VALIDATION.BIO.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Bio must not exceed ${VALIDATION.BIO.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

// ============================================
// Review Validation
// ============================================

/**
 * Validate review title
 */
export const validateReviewTitle = (
  title: string
): { isValid: boolean; message?: string } => {
  if (!title) {
    return { isValid: true }; // Title is optional
  }

  if (title.length > VALIDATION.TITLE.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Title must not exceed ${VALIDATION.TITLE.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate review content
 */
export const validateReviewContent = (
  content: string
): { isValid: boolean; message?: string } => {
  if (!content) {
    return { isValid: false, message: 'Review content is required' };
  }

  if (content.length < VALIDATION.REVIEW.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Review must be at least ${VALIDATION.REVIEW.MIN_LENGTH} characters`,
    };
  }

  if (content.length > VALIDATION.REVIEW.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Review must not exceed ${VALIDATION.REVIEW.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate rating
 */
export const validateRating = (
  rating: number
): { isValid: boolean; message?: string } => {
  if (!rating || rating < 1 || rating > 5) {
    return { isValid: false, message: 'Rating must be between 1 and 5' };
  }

  return { isValid: true };
};

// ============================================
// Book Validation
// ============================================

/**
 * Validate ISBN
 */
export const validateISBN = (isbn: string): { isValid: boolean; message?: string } => {
  if (!isbn) {
    return { isValid: true }; // ISBN is optional
  }

  // Remove hyphens and spaces
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // Check if it's ISBN-10 or ISBN-13
  if (cleanIsbn.length === 10) {
    // ISBN-10 validation
    if (!/^\d{9}[\dX]$/.test(cleanIsbn)) {
      return { isValid: false, message: 'Invalid ISBN-10 format' };
    }

    // Calculate checksum for ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanIsbn[i]) * (10 - i);
    }
    const checksum = cleanIsbn[9] === 'X' ? 10 : parseInt(cleanIsbn[9]);
    if ((sum + checksum) % 11 !== 0) {
      return { isValid: false, message: 'Invalid ISBN-10 checksum' };
    }
  } else if (cleanIsbn.length === 13) {
    // ISBN-13 validation
    if (!/^\d{13}$/.test(cleanIsbn)) {
      return { isValid: false, message: 'Invalid ISBN-13 format' };
    }

    // Calculate checksum for ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanIsbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    if (parseInt(cleanIsbn[12]) !== checksum) {
      return { isValid: false, message: 'Invalid ISBN-13 checksum' };
    }
  } else {
    return { isValid: false, message: 'ISBN must be 10 or 13 digits' };
  }

  return { isValid: true };
};

/**
 * Validate book title
 */
export const validateBookTitle = (
  title: string
): { isValid: boolean; message?: string } => {
  if (!title) {
    return { isValid: false, message: 'Title is required' };
  }

  if (title.length < VALIDATION.TITLE.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Title must be at least ${VALIDATION.TITLE.MIN_LENGTH} character`,
    };
  }

  if (title.length > VALIDATION.TITLE.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Title must not exceed ${VALIDATION.TITLE.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate book description
 */
export const validateBookDescription = (
  description: string
): { isValid: boolean; message?: string } => {
  if (!description) {
    return { isValid: false, message: 'Description is required' };
  }

  if (description.length < VALIDATION.DESCRIPTION.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Description must be at least ${VALIDATION.DESCRIPTION.MIN_LENGTH} characters`,
    };
  }

  if (description.length > VALIDATION.DESCRIPTION.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Description must not exceed ${VALIDATION.DESCRIPTION.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

// ============================================
// Comment Validation
// ============================================

/**
 * Validate comment
 */
export const validateComment = (
  comment: string
): { isValid: boolean; message?: string } => {
  if (!comment) {
    return { isValid: false, message: 'Comment is required' };
  }

  if (comment.length < VALIDATION.COMMENT.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Comment must be at least ${VALIDATION.COMMENT.MIN_LENGTH} character`,
    };
  }

  if (comment.length > VALIDATION.COMMENT.MAX_LENGTH) {
    return {
      isValid: false,
      message: `Comment must not exceed ${VALIDATION.COMMENT.MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

// ============================================
// URL Validation
// ============================================

/**
 * Validate URL
 */
export const validateUrl = (
  url: string,
  options?: {
    requireProtocol?: boolean;
    allowedProtocols?: string[];
  }
): { isValid: boolean; message?: string } => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }

  const {
    requireProtocol = true,
    allowedProtocols = ['http:', 'https:'],
  } = options || {};

  try {
    const parsedUrl = new URL(url);

    if (requireProtocol && !parsedUrl.protocol) {
      return { isValid: false, message: 'URL must include a protocol (http:// or https://)' };
    }

    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return {
        isValid: false,
        message: `URL protocol must be one of: ${allowedProtocols.join(', ')}`,
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

// ============================================
// Phone Number Validation
// ============================================

/**
 * Validate phone number
 */
export const validatePhone = (
  phone: string
): { isValid: boolean; message?: string } => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }

  // Basic international phone number validation
  // Allows: +1-555-123-4567, +44 20 1234 5678, 555-123-4567, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

// ============================================
// Date Validation
// ============================================

/**
 * Validate date
 */
export const validateDate = (
  date: string,
  options?: {
    minDate?: Date;
    maxDate?: Date;
    format?: string;
  }
): { isValid: boolean; message?: string } => {
  if (!date) {
    return { isValid: true }; // Date is optional
  }

  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  if (options?.minDate && parsedDate < options.minDate) {
    return {
      isValid: false,
      message: `Date must be after ${options.minDate.toLocaleDateString()}`,
    };
  }

  if (options?.maxDate && parsedDate > options.maxDate) {
    return {
      isValid: false,
      message: `Date must be before ${options.maxDate.toLocaleDateString()}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate birth date (must be at least 13 years old)
 */
export const validateBirthDate = (
  birthDate: string
): { isValid: boolean; message?: string } => {
  if (!birthDate) {
    return { isValid: true }; // Birth date is optional
  }

  const date = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    if (age - 1 < 13) {
      return { isValid: false, message: 'You must be at least 13 years old' };
    }
  } else if (age < 13) {
    return { isValid: false, message: 'You must be at least 13 years old' };
  }

  return { isValid: true };
};

// ============================================
// File Validation
// ============================================

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Validate file
 */
export const validateFile = async (
  file: File,
  options: FileValidationOptions = {}
): Promise<{ isValid: boolean; message?: string }> => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = options;

  // Check file size
  if (file.size > maxSize) {
    const sizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      message: `File size must not exceed ${sizeMB}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  // Check image dimensions if required
  if (minWidth || minHeight || maxWidth || maxHeight) {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (minWidth && img.width < minWidth) {
            resolve({
              isValid: false,
              message: `Image width must be at least ${minWidth}px`,
            });
          } else if (minHeight && img.height < minHeight) {
            resolve({
              isValid: false,
              message: `Image height must be at least ${minHeight}px`,
            });
          } else if (maxWidth && img.width > maxWidth) {
            resolve({
              isValid: false,
              message: `Image width must not exceed ${maxWidth}px`,
            });
          } else if (maxHeight && img.height > maxHeight) {
            resolve({
              isValid: false,
              message: `Image height must not exceed ${maxHeight}px`,
            });
          } else {
            resolve({ isValid: true });
          }
        };
        img.onerror = () => {
          resolve({ isValid: false, message: 'Invalid image file' });
        };
        img.src = URL.createObjectURL(file);
      });
    }
  }

  return { isValid: true };
};

// ============================================
// Form Validation Helpers
// ============================================

/**
 * Validate multiple fields at once
 */
export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  validators: Partial<Record<keyof T, (value: unknown) => { isValid: boolean; message?: string }>>
): Record<keyof T, string | undefined> => {
  const errors: Partial<Record<keyof T, string>> = {};

  Object.entries(validators).forEach(([field, validator]) => {
    if (validator) {
      const result = validator(data[field as keyof T]);
      if (!result.isValid) {
        errors[field as keyof T] = result.message;
      }
    }
  });

  return errors as Record<keyof T, string | undefined>;
};

/**
 * Check if form has any errors
 */
export const hasFormErrors = <T extends Record<string, unknown>>(
  errors: Record<keyof T, string | undefined>
): boolean => {
  return Object.values(errors).some(error => error !== undefined);
};

// ============================================
// Sanitization
// ============================================

/**
 * Sanitize input by trimming and removing extra spaces
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Sanitize email (lowercase, trim)
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Sanitize username (lowercase, trim, remove special chars)
 */
export const sanitizeUsername = (username: string): string => {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
};

// ============================================
// Export all validators
// ============================================

export const validators = {
  // Email
  isValidEmail,
  validateEmail,
  
  // Password
  checkPasswordStrength,
  validatePassword,
  validatePasswordConfirmation,
  
  // Username
  validateUsername,
  
  // Name
  validateName,
  
  // Bio
  validateBio,
  
  // Reviews
  validateReviewTitle,
  validateReviewContent,
  validateRating,
  
  // Books
  validateISBN,
  validateBookTitle,
  validateBookDescription,
  
  // Comments
  validateComment,
  
  // URL
  validateUrl,
  
  // Phone
  validatePhone,
  
  // Date
  validateDate,
  validateBirthDate,
  
  // File
  validateFile,
  
  // Form helpers
  validateForm,
  hasFormErrors,
  
  // Sanitization
  sanitizeInput,
  sanitizeEmail,
  sanitizeUsername,
};

export default validators;