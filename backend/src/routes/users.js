import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// User management routes - SUPER_ADMIN and ADMIN have access to read and manage accounts
router.get('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), getAllUsers);
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), getUserById);
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), createUser);
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), updateUser);
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), deleteUser);

export default router;
