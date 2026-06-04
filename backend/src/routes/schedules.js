import express from 'express';
import { createSchedule, getSchedules, deleteSchedule, updateSchedule } from '../controllers/scheduleController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get master schedules list (Authenticated)
router.get('/', authenticateToken, getSchedules);

// Create a new schedule entry (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), createSchedule);

// Update a schedule entry (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateSchedule);

// Delete a schedule entry (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteSchedule);

export default router;
