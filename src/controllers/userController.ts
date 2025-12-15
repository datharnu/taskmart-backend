import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError';
import { GetUserResponse, UpdateProfileRequest, UpdateProfileResponse } from '../types/auth';
import { validateEmail } from '../utils/validation';
import { validatePhoneNumber, formatPhoneNumber } from '../utils/phone';

export class UserController {
  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new NotFoundError('User ID is required');
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const response: GetUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      image: user.image,
    };

    res.status(200).json(response);
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData: UpdateProfileRequest = req.body;

    if (!id) {
      throw new NotFoundError('User ID is required');
    }

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Validate email if provided
    if (updateData.email !== undefined) {
      if (!updateData.email.trim()) {
        throw new ValidationError('Email cannot be empty');
      }
      if (!validateEmail(updateData.email.trim())) {
        throw new ValidationError('Invalid email format');
      }
      // Check if email is already taken by another user
      const emailExists = await UserModel.emailExistsExcludingUser(updateData.email.trim(), id);
      if (emailExists) {
        throw new ConflictError('Email is already taken by another user');
      }
    }

    // Validate phone number if provided
    if (updateData.phoneNumber !== undefined) {
      if (!updateData.phoneNumber.trim()) {
        throw new ValidationError('Phone number cannot be empty');
      }
      if (!validatePhoneNumber(updateData.phoneNumber.trim())) {
        throw new ValidationError('Invalid phone number format');
      }
      // Format phone number
      updateData.phoneNumber = formatPhoneNumber(updateData.phoneNumber.trim());
    }

    // Update user profile
    const updatedUser = await UserModel.updateProfile(id, updateData);

    const response: UpdateProfileResponse = {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        image: updatedUser.image,
      },
    };

    res.status(200).json(response);
  }
}

