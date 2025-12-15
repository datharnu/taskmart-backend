import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

// Signup route
router.post('/signup', asyncHandler(AuthController.signup));

// Signin route
router.post('/signin', asyncHandler(AuthController.signin));

export default router;

