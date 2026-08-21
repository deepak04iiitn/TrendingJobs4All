import razorpay from '../utils/razorpay.js';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import PremiumEmailLog from '../models/premiumEmailLog.model.js';
import User from '../models/user.model.js';
import { respondWithError } from '../utils/razorpayError.js';

const PLAN_CATEGORY = 'qa';

export const createSubscription = async (req, res) => {
  try {
    const { yoe } = req.body;
    const yoeNum = Number(yoe);

    if (yoe === undefined || yoe === null || Number.isNaN(yoeNum) || yoeNum < 0 || !Number.isInteger(yoeNum)) {
      return res.status(400).json({
        message: 'Years of Experience must be a whole number (0, 1, 2, … — no decimals)',
      });
    }

    const existing = await PremiumSubscription.findOne({ userId: req.user.id });
    if (existing && ['active', 'authenticated', 'pending'].includes(existing.status)) {
      return res.status(400).json({ message: 'You already have an active Premium Jobs subscription' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let razorpayCustomerId = existing?.razorpayCustomerId || null;
    if (!razorpayCustomerId) {
      try {
        const customer = await razorpay.customers.create({
          name: user.username,
          email: user.email,
          fail_existing: 0,
        });
        razorpayCustomerId = customer.id;
      } catch (err) {
        // fail_existing:0 is meant to return the existing customer instead of
        // erroring, but this is unreliable in practice (a known, unresolved
        // issue in Razorpay's Node SDK — fail_existing:0 still throws
        // "Customer already exists for the merchant" without the expected
        // metadata.customer_id fallback). Customer creation is purely for our
        // own reference (Razorpay's subscriptions.create doesn't require a
        // customer_id — that gets linked during checkout), so never let this
        // block subscribing: fall back to the metadata id if present, else
        // just proceed without one.
        console.error('Razorpay customer create failed (continuing without customerId):', err?.error?.description || err.message);
        razorpayCustomerId = err?.error?.metadata?.customer_id || null;
      }
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 120, // ~10 years of monthly cycles; Razorpay requires a bound
      notes: { userId: String(req.user.id), yoe: String(yoeNum) },
    });

    const doc = await PremiumSubscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        yoe: yoeNum,
        category: PLAN_CATEGORY,
        razorpayCustomerId,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: process.env.RAZORPAY_PLAN_ID,
        status: subscription.status,
      },
      { upsert: true, new: true },
    );

    res.status(201).json({
      subscriptionId: doc.razorpaySubscriptionId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      status: doc.status,
    });
  } catch (error) {
    respondWithError(res, error, 'Failed to start subscription');
  }
};

export const getMySubscription = async (req, res) => {
  try {
    const subscription = await PremiumSubscription.findOne({ userId: req.user.id }).lean();
    res.json(subscription || null);
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch subscription');
  }
};

export const updateYoe = async (req, res) => {
  try {
    const { yoe } = req.body;
    const yoeNum = Number(yoe);
    if (yoe === undefined || yoe === null || Number.isNaN(yoeNum) || yoeNum < 0 || !Number.isInteger(yoeNum)) {
      return res.status(400).json({
        message: 'Years of Experience must be a whole number (0, 1, 2, … — no decimals)',
      });
    }

    const subscription = await PremiumSubscription.findOneAndUpdate(
      { userId: req.user.id },
      { yoe: yoeNum },
      { new: true },
    );
    if (!subscription) return res.status(404).json({ message: 'No subscription found' });

    res.json(subscription);
  } catch (error) {
    respondWithError(res, error, 'Failed to update Years of Experience');
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await PremiumSubscription.findOne({ userId: req.user.id });
    if (!subscription || !subscription.razorpaySubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    if (subscription.status === 'active') {
      // Cancel at the end of the already-paid billing cycle — Razorpay keeps
      // the subscription active (no further charges scheduled) and fires
      // subscription.cancelled via webhook once the period actually ends.
      // Until then, daily emails keep sending (cron only filters status
      // 'active'), so cancelledAt/cancelAtPeriodEnd don't touch status here.
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, true);
      subscription.cancelAtPeriodEnd = true;
      subscription.cancelledAt = new Date();
    } else {
      // Not yet active (created/authenticated/pending) — nothing billed yet,
      // so there's no period to honor. Cancel immediately.
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await User.findByIdAndUpdate(req.user.id, { isPremium: false });
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    respondWithError(res, error, 'Failed to cancel subscription');
  }
};

export const getMyEmailHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const query = { userId: req.user.id };
    const total = await PremiumEmailLog.countDocuments(query);
    const items = await PremiumEmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) {
    respondWithError(res, error, 'Failed to fetch email history');
  }
};
