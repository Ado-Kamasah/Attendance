import express from 'express';
import { createSchedule, getSchedules } from '../controllers/scheduleController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get master schedules list (Authenticated)
router.get('/', authenticateToken, getSchedules);

// Create a new schedule entry (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), createSchedule);

export default router;
