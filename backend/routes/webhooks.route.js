import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhooks.controller.js';

const router = express.Router();

router.post('/razorpay', handleRazorpayWebhook);

export default router;
