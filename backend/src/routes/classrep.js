import express from 'express';
import {
  getAllClassReps,
  getStudentList,
  assignClassRep,
  removeClassRep,
  getMyClassRepRoles,
  markLecturerAttendance,
  getLecturerAttendanceHistory,
} from '../controllers/classRepController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── Admin routes ──────────────────────────────────────────────────────────────
// List all class reps (Admin only)
router.get('/all', authenticateToken, requireRole(['ADMIN']), getAllClassReps);

// Search students (optionally filtered by courseId) — for the assign dropdown
router.get('/students', authenticateToken, requireRole(['ADMIN']), getStudentList);

// Assign a student as class rep for a course
router.post('/assign', authenticateToken, requireRole(['ADMIN']), assignClassRep);

// Remove class rep from a course
router.delete('/:courseId', authenticateToken, requireRole(['ADMIN']), removeClassRep);

// ── Class Rep / Student routes ────────────────────────────────────────────────
// Check which courses the logged-in student is class rep for
router.get('/my-roles', authenticateToken, requireRole(['STUDENT']), getMyClassRepRoles);

// Mark lecturer attendance for a course (only the class rep for that course)
router.post('/lecturer-attendance', authenticateToken, requireRole(['STUDENT']), markLecturerAttendance);

// View lecturer attendance history for a course
router.get('/lecturer-attendance/:courseId', authenticateToken, requireRole(['STUDENT', 'ADMIN', 'LECTURER']), getLecturerAttendanceHistory);

export default router;
