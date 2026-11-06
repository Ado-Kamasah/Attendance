import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { forgotPasswordSend, forgotPasswordVerify, forgotPasswordReset } from '../controllers/authResetHelpers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (requires valid JWT)
router.get('/profile', authenticateToken, getProfile);

// Password Reset Flow
router.post('/forgot-password/send', forgotPasswordSend);
router.post('/forgot-password/verify', forgotPasswordVerify);
router.post('/forgot-password/reset', forgotPasswordReset);

export default router;
