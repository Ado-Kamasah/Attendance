import express from 'express';
import {
  getAllClassReps,
  getStudentList,
  assignClassRep,
  removeClassRep,
  getMyClassRepRoles,
  markLecturerAttendance,
  getLecturerAttendanceHistory,
  verifySession,
  getCourseSessions,
} from '../controllers/classRepController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// -- Admin routes -------------------------------------------------------------
// List all class reps (Admin, Lecturer, Student)
router.get('/all', authenticateToken, getAllClassReps);

// Search students (optionally filtered by courseId) - for the assign dropdown
router.get('/students', authenticateToken, getStudentList);

// Assign a student as class rep for a course (Admin only)
router.post('/assign', authenticateToken, requireRole(['ADMIN']), assignClassRep);

// Remove class rep from a course (Admin only)
router.delete('/:courseId', authenticateToken, requireRole(['ADMIN']), removeClassRep);

// -- Lecturer routes ----------------------------------------------------------
// Lecturer assigns a class rep for one of their own courses
router.post('/lecturer-assign', authenticateToken, requireRole(['ADMIN', 'LECTURER', 'STAFF']), assignClassRep);

// Lecturer removes a class rep from one of their own courses
router.delete('/lecturer/:courseId', authenticateToken, requireRole(['ADMIN', 'LECTURER', 'STAFF']), removeClassRep);

// -- Class Rep / Student routes -----------------------------------------------
// Check which courses the logged-in student is class rep for
router.get('/my-roles', authenticateToken, getMyClassRepRoles);

// Verify a session code with reference to a course (gets created date and time)
router.get('/verify-session', authenticateToken, verifySession);

// Get recent sessions for a specific course
router.get('/course-sessions/:courseId', authenticateToken, getCourseSessions);

// Mark lecturer attendance for a course (Class rep using session code or date/time)
router.post('/lecturer-attendance', authenticateToken, markLecturerAttendance);

// View lecturer attendance history for a course
router.get('/lecturer-attendance/:courseId', authenticateToken, getLecturerAttendanceHistory);

export default router;
