import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createSubscription,
  getMySubscription,
  updateYoe,
  cancelSubscription,
  getMyEmailHistory,
} from '../controllers/premiumJobs.controller.js';

const router = express.Router();

router.post('/subscribe', verifyToken, createSubscription);
router.get('/me', verifyToken, getMySubscription);
router.patch('/me/yoe', verifyToken, updateYoe);
router.post('/me/cancel', verifyToken, cancelSubscription);
router.get('/me/emails', verifyToken, getMyEmailHistory);

export default router;
