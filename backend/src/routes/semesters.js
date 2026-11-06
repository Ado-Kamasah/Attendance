import express from 'express';
import { getSemesters, createSemester, updateSemester, deleteSemester, toggleRegistration } from '../controllers/semesterController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Allow reading semesters publicly so students, calendar views, and registration guards can read active semester
router.get('/', getSemesters);
router.post('/', authenticateToken, requireRole(['ADMIN']), createSemester);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateSemester);
router.patch('/:id/registration', authenticateToken, requireRole(['ADMIN']), toggleRegistration);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteSemester);

export default router;
