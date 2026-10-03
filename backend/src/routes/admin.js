import express from 'express';
import {
  getDashboardStats,
  getAuditLogs,
  createAuditLog,
  getLecturers,
  updateLecturerEmploymentType,
  assignLecturerToCourse
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard-stats', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getDashboardStats);
router.get('/audit-logs', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getAuditLogs);
router.post('/audit-logs', authenticateToken, createAuditLog);

// Lecturer management
router.get('/lecturers', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getLecturers);
router.patch('/lecturers/:id/employment-type', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), updateLecturerEmploymentType);
router.post('/courses/:courseId/assign-lecturer', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), assignLecturerToCourse);

export default router;
