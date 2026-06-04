import express from 'express';
import { 
  createCourse, 
  getCourses, 
  enrollInCourse, 
  getStudentEnrollments, 
  getAvailableCoursesForStudent,
  getCourseStudents,
  updateCourse,
  archiveCourse
} from '../controllers/courseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get list of courses with optional filters (All authenticated users)
router.get('/', authenticateToken, getCourses);

// Admin creates a new course
router.post('/', authenticateToken, requireRole(['ADMIN']), createCourse);

// Admin updates a course
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateCourse);

// Admin archives a course
router.patch('/:id/archive', authenticateToken, requireRole(['ADMIN']), archiveCourse);

// Get student's enrolled courses
router.get('/enrolled', authenticateToken, getStudentEnrollments);

// Get available courses for student to register
router.get('/available', authenticateToken, requireRole(['STUDENT']), getAvailableCoursesForStudent);

// Student/Admin enrolls in a course
router.post('/:courseId/enroll', authenticateToken, enrollInCourse);

// Get students enrolled in a course (Admin/Lecturer)
router.get('/:courseId/students', authenticateToken, requireRole(['ADMIN', 'LECTURER']), getCourseStudents);

export default router;
