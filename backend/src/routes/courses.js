import express from 'express';
import { 
  createCourse, 
  getCourses, 
  enrollInCourse, 
  getStudentEnrollments, 
  getAvailableCoursesForStudent 
} from '../controllers/courseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get list of courses (Authenticated)
router.get('/', authenticateToken, getCourses);

// Create a new course (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), createCourse);

// Get student's enrolled courses (Authenticated)
router.get('/enrolled', authenticateToken, getStudentEnrollments);

// Get courses student can register for (Students only)
router.get('/available', authenticateToken, requireRole(['STUDENT']), getAvailableCoursesForStudent);

// Enroll in a specific course (Student or Admin)
router.post('/:courseId/enroll', authenticateToken, enrollInCourse);

export default router;
