import express from 'express';
import { createResume, getResumes, getResume, updateResume, deleteResume } from '../controllers/resumeController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// All routes are protected and require authentication
router.use(verifyToken);

// Create new resume
router.post('/', createResume);

// Get all user's resumes
router.get('/', getResumes);

// Get specific resume
router.get('/:id', getResume);

// Update resume
router.put('/:id', updateResume);

// Delete resume
router.delete('/:id', deleteResume);

export default router; 