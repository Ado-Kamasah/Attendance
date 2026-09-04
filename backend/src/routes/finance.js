import express from 'express';
import {
  getClaims,
  downloadClaims,
  getLecturers,
} from '../controllers/financeController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

const FINANCE_ROLES = ['FINANCE', 'ADMIN'];

// Get all lecturer claims (JSON)
router.get('/claims',          authenticateToken, requireRole(FINANCE_ROLES), getClaims);

// Download lecturer claims as CSV
router.get('/claims/download', authenticateToken, requireRole(FINANCE_ROLES), downloadClaims);

// Get all lecturers list (for filter dropdown)
router.get('/lecturers',       authenticateToken, requireRole(FINANCE_ROLES), getLecturers);

export default router;
