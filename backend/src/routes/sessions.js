import express from 'express';
import { 
  startSession, 
  getActiveSessions, 
  markAttendance, 
  endSession 
} from '../controllers/sessionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get list of active sessions (Authenticated)
router.get('/active', authenticateToken, getActiveSessions);

// Start a live attendance session (Lecturers only)
router.post('/start', authenticateToken, requireRole(['LECTURER']), startSession);

// Submit PIN to mark attendance (Students only)
router.post('/mark', authenticateToken, requireRole(['STUDENT']), markAttendance);

// End a live session (Lecturers and Admins only)
router.post('/:sessionId/end', authenticateToken, requireRole(['LECTURER', 'ADMIN']), endSession);

export default router;
