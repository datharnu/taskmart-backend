import { Request, Response } from 'express';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth';
import { validateEmail } from '../utils/validation';
import { validateOTPFormat } from '../utils/otp';
import { getPasswordValidationErrors } from '../utils/validation';
import { hashPassword } from '../utils/password';
import { UserModel } from '../models/User';
import { ValidationError, NotFoundError, UnauthorizedError } from '../errors/AppError';
import { otpService } from '../services/otpService';
import { emailService } from '../services/emailService';

export class PasswordController {
  /**
   * Step 1: Request password reset - Send OTP
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email }: ForgotPasswordRequest = req.body;

    // Validate email
    if (!email || !email.trim()) {
      throw new ValidationError('Email is required');
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if user exists
    const user = await UserModel.findByEmail(trimmedEmail);
    if (!user) {
      // Don't reveal if user exists for security
      // Return success message even if user doesn't exist
      const response: ForgotPasswordResponse = {
        message: 'If an account with this email exists, an OTP code has been sent.',
      };
      res.status(200).json(response);
      return;
    }

    // Generate and store OTP
    const otpCode = otpService.generateAndStoreOTP(trimmedEmail);

    // Send OTP email (non-blocking)
    emailService.sendOTPEmail(user.email, user.name, otpCode).catch((error) => {
      console.error('Failed to send OTP email:', error);
    });

    const response: ForgotPasswordResponse = {
      message: 'If an account with this email exists, an OTP code has been sent.',
    };

    res.status(200).json(response);
  }

  /**
   * Step 2: Verify OTP code
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    const { email, otp }: VerifyOTPRequest = req.body;

    // Validate inputs
    if (!email || !email.trim()) {
      throw new ValidationError('Email is required');
    }

    if (!otp || !otp.trim()) {
      throw new ValidationError('OTP code is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim().toUpperCase();

    // Validate OTP format
    if (!validateOTPFormat(trimmedOTP)) {
      throw new ValidationError('Invalid OTP format. OTP must be 5 alphanumeric characters.');
    }

    // Verify OTP
    const isValid = otpService.verifyOTP(trimmedEmail, trimmedOTP);

    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired OTP code');
    }

    const response: VerifyOTPResponse = {
      message: 'OTP verified successfully',
      verified: true,
    };

    res.status(200).json(response);
  }

  /**
   * Step 3: Reset password with verified OTP
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, otp, newPassword, confirmPassword }: ResetPasswordRequest = req.body;

    // Validate inputs
    if (!email || !email.trim()) {
      throw new ValidationError('Email is required');
    }

    if (!otp || !otp.trim()) {
      throw new ValidationError('OTP code is required');
    }

    if (!newPassword) {
      throw new ValidationError('New password is required');
    }

    if (!confirmPassword) {
      throw new ValidationError('Confirm password is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim().toUpperCase();

    // Validate OTP format
    if (!validateOTPFormat(trimmedOTP)) {
      throw new ValidationError('Invalid OTP format. OTP must be 5 alphanumeric characters.');
    }

    // Verify OTP was verified
    if (!otpService.isOTPVerified(trimmedEmail)) {
      // Try to verify it now
      const isValid = otpService.verifyOTP(trimmedEmail, trimmedOTP);
      if (!isValid) {
        throw new UnauthorizedError('Invalid or expired OTP code. Please request a new OTP.');
      }
    }

    // Validate password
    if (newPassword !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Validate password strength
    const passwordErrors = getPasswordValidationErrors(newPassword);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors.join(', '));
    }

    // Check if user exists
    const user = await UserModel.findByEmail(trimmedEmail);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password (we need to add this method to UserModel)
    await UserModel.updatePassword(user.id, hashedPassword);

    // Remove OTP after successful password reset
    otpService.removeOTP(trimmedEmail);

    const response: ResetPasswordResponse = {
      message: 'Password reset successfully. You can now login with your new password.',
    };

    res.status(200).json(response);
  }
}





