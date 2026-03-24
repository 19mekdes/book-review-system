import bcrypt from 'bcrypt';



export class BcryptUtils {
  private static readonly SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

  /**
   * Hash a password
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Password hashing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param plainPassword - Plain text password to compare
   * @param hashedPassword - Hashed password from database
   * @returns Boolean indicating if passwords match
   */
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Password comparison failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generate a salt
   * @returns Generated salt
   */
  static async generateSalt(): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return salt;
    } catch (error) {
      throw new Error(`Salt generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Hash password with custom salt rounds
   * @param password - Plain text password
   * @param saltRounds - Number of salt rounds (default: 10)
   * @returns Hashed password
   */
  static async hashPasswordWithRounds(
    password: string,
    saltRounds: number = 10
  ): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Password hashing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validate password strength
   * @param password - Plain text password to validate
   * @returns Object with validation result and message
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    message: string;
    strength: 'weak' | 'medium' | 'strong';
  } {
    // Check length
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long',
        strength: 'weak'
      };
    }

    // Check for uppercase, lowercase, number, special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calculate strength
    let strengthScore = 0;
    if (hasUpperCase) strengthScore++;
    if (hasLowerCase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChar) strengthScore++;
    if (password.length >= 8) strengthScore++;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (strengthScore >= 4) strength = 'strong';
    else if (strengthScore >= 2) strength = 'medium';

    // Determine if password is valid (at least medium strength)
    const isValid = strengthScore >= 2;

    let message = '';
    if (isValid) {
      message = 'Password strength is acceptable';
    } else {
      const missing = [];
      if (!hasUpperCase) missing.push('uppercase letter');
      if (!hasLowerCase) missing.push('lowercase letter');
      if (!hasNumbers) missing.push('number');
      if (!hasSpecialChar) missing.push('special character');
      
      message = `Password must include: ${missing.join(', ')}`;
    }

    return {
      isValid,
      message,
      strength
    };
  }

  /**
   * Hash multiple passwords (useful for seeding)
   * @param passwords - Array of plain text passwords
   * @returns Array of hashed passwords
   */
  static async hashMultiplePasswords(passwords: string[]): Promise<string[]> {
    try {
      const hashedPasswords = await Promise.all(
        passwords.map(password => this.hashPassword(password))
      );
      return hashedPasswords;
    } catch (error) {
      throw new Error(`Multiple password hashing failed: ${(error as Error).message}`);
    }
  }
}

// Export a singleton instance
export const bcryptUtils = new BcryptUtils();