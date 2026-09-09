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

// All user management routes are restricted to SUPER_ADMIN (or ADMIN with elevate privilege if needed)
// SUPER_ADMIN has full permissions.
router.get('/', authenticateToken, requireRole(['SUPER_ADMIN']), getAllUsers);
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), getUserById);
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN']), createUser);
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), updateUser);
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN']), deleteUser);

export default router;
