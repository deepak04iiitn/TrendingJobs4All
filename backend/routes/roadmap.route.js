import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import {
  getRoadmaps,
  getRoadmapByRole,
  getUserProgress,
  updateSubskillProgress,
  getSharedProgress,
  createOrUpdateRoadmap,
  deleteRoadmap
} from '../controllers/roadmap.controller.js';

const router = express.Router();

// Public routes
router.get('/roadmaps', getRoadmaps);
router.get('/roadmaps/:role', getRoadmapByRole);
router.get('/share/:userId/:role', getSharedProgress);

// Protected routes - User progress
router.get('/progress/:userId/:role', verifyToken, getUserProgress);
router.put('/progress/:userId/:role/subskill', verifyToken, updateSubskillProgress);

// Admin only routes
router.post('/admin/create', verifyToken, verifyAdmin, createOrUpdateRoadmap);
router.delete('/admin/:roadmapId', verifyToken, verifyAdmin, deleteRoadmap);

export default router;