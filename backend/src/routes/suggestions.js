import express from 'express';
import {
  submitSuggestion,
  getAllSuggestions,
  updateSuggestion,
  getMySuggestions,
} from '../controllers/suggestionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student: submit a new suggestion / complaint
router.post(
  '/',
  authenticateToken,
  requireRole(['STUDENT']),
  submitSuggestion
);

// Student: view their own past submissions
router.get(
  '/my',
  authenticateToken,
  requireRole(['STUDENT']),
  getMySuggestions
);

// Admin / Dean: view all suggestions
router.get(
  '/',
  authenticateToken,
  requireRole(['ADMIN', 'DEAN']),
  getAllSuggestions
);

// Admin / Dean: update status or add a note
router.patch(
  '/:id',
  authenticateToken,
  requireRole(['ADMIN', 'DEAN']),
  updateSuggestion
);

export default router;
