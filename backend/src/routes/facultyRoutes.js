import express from 'express';
import { getFaculties, createFaculty, deleteFaculty } from '../controllers/facultyController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get faculties (needed for registration page)
router.get('/', getFaculties);

// Admin only routes for managing faculties
router.post('/', protect, adminOnly, createFaculty);
router.delete('/:id', protect, adminOnly, deleteFaculty);

export default router;
