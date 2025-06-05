import express from 'express';
import { createOrUpdateResume, getResume, deleteResume } from '../controllers/resumeController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(verifyToken);

// Create or update resume
router.post('/', createOrUpdateResume);

// Get user's resume
router.get('/', getResume);

// Delete resume
router.delete('/', deleteResume);

export default router; 