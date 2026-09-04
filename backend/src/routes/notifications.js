import express from 'express';
import {
  checkAbsencesForSession,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastEvaluationOpen,
} from '../controllers/notificationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Trigger absence check after a session ends (Lecturer or Admin)
router.post(
  '/check-absences',
  authenticateToken,
  requireRole(['LECTURER', 'ADMIN']),
  checkAbsencesForSession
);

// Get logged-in student's notifications
router.get(
  '/my',
  authenticateToken,
  requireRole(['STUDENT']),
  getMyNotifications
);

// Mark a single notification as read
router.patch(
  '/:id/read',
  authenticateToken,
  requireRole(['STUDENT']),
  markNotificationRead
);

// Mark all notifications as read
router.patch(
  '/read-all',
  authenticateToken,
  requireRole(['STUDENT']),
  markAllNotificationsRead
);

// Admin: broadcast evaluation-open notification to all students
router.post(
  '/evaluation-open',
  authenticateToken,
  requireRole(['ADMIN']),
  broadcastEvaluationOpen
);

export default router;
