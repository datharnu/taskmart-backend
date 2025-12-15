import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Get user by ID
router.get('/:id', asyncHandler(UserController.getUserById));

// Update user profile
router.put('/:id', asyncHandler(UserController.updateProfile));
router.patch('/:id', asyncHandler(UserController.updateProfile));

export default router;

