import express from 'express';
import { verifyToken, verifyAdmin, optionalVerifyToken } from '../utils/verifyUser.js';
import {
  listProblems,
  getProblemBySlug,
  updateProgress,
  runCode,
  submitCode,
  listSubmissions,
  getDashboard,
  listDiscussions,
  createDiscussion,
  voteDiscussion,
  getLeaderboard,
  streamLeaderboard,
  getWeeklyWinners,
  adminListProblems,
  adminGetProblem,
  adminUpsertProblem,
  adminReplaceTests,
  adminPublishProblem,
} from '../controllers/dsaPlatform.controller.js';

const router = express.Router();

// Public browse (progress joined when signed in)
router.get('/problems', optionalVerifyToken, listProblems);
router.get('/problems/:slug', optionalVerifyToken, getProblemBySlug);
router.get('/leaderboard', optionalVerifyToken, getLeaderboard);
router.get('/weekly-winners', optionalVerifyToken, getWeeklyWinners);
router.get('/leaderboard/stream', optionalVerifyToken, streamLeaderboard);

// Auth required
router.get('/dashboard', verifyToken, getDashboard);
router.put('/problems/:slug/progress', verifyToken, updateProgress);
router.post('/problems/:slug/run', verifyToken, runCode);
router.post('/problems/:slug/submit', verifyToken, submitCode);
router.get('/problems/:slug/submissions', verifyToken, listSubmissions);
router.get('/problems/:slug/discussions', verifyToken, listDiscussions);
router.post('/problems/:slug/discussions', verifyToken, createDiscussion);
router.post('/discussions/:discussionId/vote', verifyToken, voteDiscussion);

router.get('/admin/problems', verifyToken, verifyAdmin, adminListProblems);
router.get('/admin/problems/:id', verifyToken, verifyAdmin, adminGetProblem);
router.post('/admin/problems', verifyToken, verifyAdmin, adminUpsertProblem);
router.put('/admin/problems/:id', verifyToken, verifyAdmin, adminUpsertProblem);
router.put('/admin/problems/:id/tests', verifyToken, verifyAdmin, adminReplaceTests);
router.post('/admin/problems/:id/publish', verifyToken, verifyAdmin, adminPublishProblem);

export default router;
