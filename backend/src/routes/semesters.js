import express from 'express';
import { getSemesters, createSemester, updateSemester, deleteSemester } from '../controllers/semesterController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getSemesters);
router.post('/', authenticateToken, requireRole(['ADMIN']), createSemester);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateSemester);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteSemester);

export default router;
