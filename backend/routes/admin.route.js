import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import { statistics, overview } from '../controllers/admin.controller.js';
import {
  listSubscribers,
  getSubscriberDetail,
  updateSubscriber,
  adminCancelSubscriber,
  adminTriggerEmailForSubscriber,
  adminTriggerFullBatch,
  listEmailLogs,
  getPremiumOverview,
} from '../controllers/premiumJobsAdmin.controller.js';

const router = express.Router();

router.get('/statistics', verifyToken, verifyAdmin, statistics);
router.get('/overview', verifyToken, verifyAdmin, overview);

router.get('/premium-jobs/overview', verifyToken, verifyAdmin, getPremiumOverview);
router.get('/premium-jobs/subscribers', verifyToken, verifyAdmin, listSubscribers);
router.get('/premium-jobs/subscribers/:id', verifyToken, verifyAdmin, getSubscriberDetail);
router.patch('/premium-jobs/subscribers/:id', verifyToken, verifyAdmin, updateSubscriber);
router.post('/premium-jobs/subscribers/:id/cancel', verifyToken, verifyAdmin, adminCancelSubscriber);
router.post('/premium-jobs/subscribers/:id/send-now', verifyToken, verifyAdmin, adminTriggerEmailForSubscriber);
router.post('/premium-jobs/trigger-batch', verifyToken, verifyAdmin, adminTriggerFullBatch);
router.get('/premium-jobs/email-logs', verifyToken, verifyAdmin, listEmailLogs);

export default router;
