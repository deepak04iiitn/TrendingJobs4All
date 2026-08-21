import razorpay from '../utils/razorpay.js';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import PremiumEmailLog from '../models/premiumEmailLog.model.js';
import User from '../models/user.model.js';
import { runPremiumJobsBatch } from '../cron/premiumJobsEmail.cron.js';
import { respondWithError } from '../utils/razorpayError.js';

export const listSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const total = await PremiumSubscription.countDocuments(query);
    const items = await PremiumSubscription.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username email')
      .lean();

    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch subscribers');
  }
};

export const getSubscriberDetail = async (req, res) => {
  try {
    const subscription = await PremiumSubscription.findById(req.params.id)
      .populate('userId', 'username email')
      .lean();
    if (!subscription) return res.status(404).json({ message: 'Subscriber not found' });

    const emailLogs = await PremiumEmailLog.find({ subscriptionId: subscription._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({ subscription, emailLogs });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch subscriber detail');
  }
};

export const updateSubscriber = async (req, res) => {
  try {
    const { yoe, status } = req.body;
    const update = {};
    if (yoe !== undefined) {
      const yoeNum = Number(yoe);
      if (Number.isNaN(yoeNum) || yoeNum < 0 || !Number.isInteger(yoeNum)) {
        return res.status(400).json({ message: 'YOE must be a whole number (no decimals)' });
      }
      update.yoe = yoeNum;
    }
    if (status !== undefined) update.status = status;

    const subscription = await PremiumSubscription.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!subscription) return res.status(404).json({ message: 'Subscriber not found' });

    res.json(subscription);
  } catch (error) {
    respondWithError(res, error, 'Failed to update subscriber');
  }
};

export const adminCancelSubscriber = async (req, res) => {
  try {
    const subscription = await PremiumSubscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscriber not found' });

    if (subscription.razorpaySubscriptionId) {
      try {
        await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
      } catch (err) {
        console.error('Razorpay cancel failed (continuing with local cancel):', err?.error?.description || err.message);
      }
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();
    await User.findByIdAndUpdate(subscription.userId, { isPremium: false });

    res.json(subscription);
  } catch (error) {
    respondWithError(res, error, 'Failed to cancel subscriber');
  }
};

const ACTIVE_STATUSES = new Set(['authenticated', 'active']);

export const syncSubscriberFromRazorpay = async (req, res) => {
  try {
    const subscription = await PremiumSubscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscriber not found' });
    if (!subscription.razorpaySubscriptionId) {
      return res.status(400).json({ message: 'No Razorpay subscription linked to this subscriber' });
    }

    // Fetches the subscription's live status directly from Razorpay — a
    // manual fallback for when a webhook was missed/delayed, so admins
    // aren't stuck waiting on delivery to reconcile a subscriber.
    const remote = await razorpay.subscriptions.fetch(subscription.razorpaySubscriptionId);

    subscription.status = remote.status;
    if (remote.current_end) subscription.currentPeriodEnd = new Date(remote.current_end * 1000);
    if (remote.status === 'active') subscription.lastChargedAt = new Date();
    if (remote.status === 'cancelled') subscription.cancelledAt = new Date();
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, { isPremium: ACTIVE_STATUSES.has(remote.status) });

    res.json({ subscription, razorpayStatus: remote.status });
  } catch (error) {
    respondWithError(res, error, 'Failed to sync subscription from Razorpay');
  }
};

export const adminTriggerEmailForSubscriber = async (req, res) => {
  try {
    const results = await runPremiumJobsBatch({ subscriptionId: req.params.id });
    res.json({ results });
  } catch (error) {
    respondWithError(res, error, 'Failed to trigger email');
  }
};

export const adminTriggerFullBatch = async (req, res) => {
  try {
    const results = await runPremiumJobsBatch();
    res.json({ results, count: results.length });
  } catch (error) {
    respondWithError(res, error, 'Failed to trigger batch');
  }
};

export const listEmailLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const { status, runDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (runDate) query.runDate = runDate;

    const total = await PremiumEmailLog.countDocuments(query);
    const items = await PremiumEmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username email')
      .lean();

    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch email logs');
  }
};

export const getPremiumOverview = async (req, res) => {
  try {
    const [active, halted, cancelled, created] = await Promise.all([
      PremiumSubscription.countDocuments({ status: 'active' }),
      PremiumSubscription.countDocuments({ status: 'halted' }),
      PremiumSubscription.countDocuments({ status: 'cancelled' }),
      PremiumSubscription.countDocuments({ status: { $in: ['created', 'authenticated', 'pending'] } }),
    ]);

    res.json({
      active,
      halted,
      cancelled,
      created,
      mrr: active * 149,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch overview');
  }
};
