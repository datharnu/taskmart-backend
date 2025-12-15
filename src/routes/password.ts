import { Router } from 'express';
import { PasswordController } from '../controllers/passwordController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Forgot password - Step 1: Request OTP
router.post('/forgot-password', asyncHandler(PasswordController.forgotPassword));

// Verify OTP - Step 2: Verify OTP code
router.post('/verify-otp', asyncHandler(PasswordController.verifyOTP));

// Reset password - Step 3: Reset password with verified OTP
router.post('/reset-password', asyncHandler(PasswordController.resetPassword));

export default router;





