import express from 'express';
import { getDashboardStats, getAuditLogs, createAuditLog, getLecturers, assignLecturerToCourse } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard-stats', authenticateToken, requireRole(['ADMIN']), getDashboardStats);
router.get('/audit-logs', authenticateToken, requireRole(['ADMIN']), getAuditLogs);
router.post('/audit-logs', authenticateToken, createAuditLog);

// Lecturer management
router.get('/lecturers', authenticateToken, requireRole(['ADMIN']), getLecturers);
router.post('/courses/:courseId/assign-lecturer', authenticateToken, requireRole(['ADMIN']), assignLecturerToCourse);

export default router;
