import express from 'express';
import { 
  getStudentAttendanceSummary, 
  getLecturerSessionsReport, 
  getSessionAttendanceList,
  getLecturerStats,
  getCourseReports,
  getCourseStudentsAttendance
} from '../controllers/attendanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get student's course attendance percentages (Students and Admins only)
router.get('/summary', authenticateToken, requireRole(['STUDENT', 'ADMIN']), getStudentAttendanceSummary);

// Get lecturer's started sessions list (Lecturers only)
router.get('/lecturer-sessions', authenticateToken, requireRole(['LECTURER']), getLecturerSessionsReport);

// Get attendance list details for a specific session (Lecturers and Admins only)
router.get('/session/:sessionId', authenticateToken, requireRole(['LECTURER', 'ADMIN']), getSessionAttendanceList);

router.get('/lecturer-stats', authenticateToken, requireRole(['LECTURER']), getLecturerStats);
router.get('/course-reports', authenticateToken, requireRole(['LECTURER']), getCourseReports);
router.get('/course-reports/:courseId/students', authenticateToken, requireRole(['LECTURER']), getCourseStudentsAttendance);

export default router;
