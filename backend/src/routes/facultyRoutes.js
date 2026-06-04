import express from 'express';
import { getFaculties, createFaculty, deleteFaculty } from '../controllers/facultyController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route to get faculties (needed for registration page)
router.get('/', getFaculties);

// Admin only routes for managing faculties
router.post('/', authenticateToken, requireRole(['ADMIN']), createFaculty);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteFaculty);

export default router;
