import { Request, Response } from 'express';
import { SignupRequest, SignupResponse, SigninRequest, SigninResponse } from '../types/auth';
import { validateSignupData, validateSigninData } from '../utils/validation';
import { hashPassword, comparePassword } from '../utils/password';
import { formatPhoneNumber } from '../utils/phone';
import { UserModel } from '../models/User';
import { ValidationError, ConflictError, UnauthorizedError } from '../errors/AppError';
import { emailService } from '../services/emailService';

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    const signupData: SignupRequest = req.body;

    // Validate input data
    const validation = validateSignupData(signupData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    // Check if user already exists
    const emailExists = await UserModel.emailExists(signupData.email);
    if (emailExists) {
      throw new ConflictError('An account with this email already exists');
    }

    // Verify passwords match
    if (signupData.password !== signupData.confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    // Hash password
    const hashedPassword = await hashPassword(signupData.password);

    // Format phone number
    const formattedPhoneNumber = formatPhoneNumber(signupData.phoneNumber);

    // Create user
    const user = await UserModel.create({
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      phoneNumber: formattedPhoneNumber,
      password: hashedPassword,
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.name).catch((error) => {
      console.error('Failed to send welcome email:', error);
    });

    // Return success response
    const response: SignupResponse = {
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        image: user.image,
      },
    };

    res.status(201).json(response);
  }

  static async signin(req: Request, res: Response): Promise<void> {
    const signinData: SigninRequest = req.body;

    // Validate input data
    const validation = validateSigninData(signinData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    // Find user by email
    const user = await UserModel.findByEmail(signinData.email.trim());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(signinData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Send signin notification email (non-blocking)
    emailService.sendSigninNotificationEmail(user.email, user.name).catch((error) => {
      console.error('Failed to send signin notification email:', error);
    });

    // Return success response
    const response: SigninResponse = {
      message: 'Sign in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        image: user.image,
      },
    };

    res.status(200).json(response);
  }
}


