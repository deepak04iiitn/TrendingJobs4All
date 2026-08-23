import Razorpay from 'razorpay';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import WebhookEvent from '../models/webhookEvent.model.js';
import User from '../models/user.model.js';
import { claimAndSendPremiumWelcome } from '../utils/premiumJobsEmail.js';

const ACTIVE_STATUSES = new Set(['authenticated', 'active']);

// Razorpay fires authenticated/activated/charged nearly simultaneously for a
// brand-new subscription's first payment, with no delivery-order guarantee —
// confirmed in production, where 'authenticated' finished its write after
// 'activated'/'charged' and silently regressed status back down. Each
// incoming status only applies if the subscription's CURRENT stored status
// is one it's valid to advance from; this is enforced inside the update
// filter itself so the check-and-write is atomic (no separate read + save
// race). A stale/out-of-order event simply matches zero documents and no-ops
// instead of clobbering a more-advanced state. `null` means always apply —
// terminal/absolute states from Razorpay must win regardless of order.
const OVERWRITE_ALLOWED_FROM = {
  authenticated: ['created', 'authenticated'],
  pending: ['created', 'authenticated', 'active', 'pending'],
  active: ['created', 'authenticated', 'pending', 'active'],
  halted: null,
  cancelled: null,
  completed: null,
  expired: null,
};

async function syncSubscription(payloadSubscription, status) {
  const filter = { razorpaySubscriptionId: payloadSubscription.id };
  const allowedFrom = OVERWRITE_ALLOWED_FROM[status];
  if (allowedFrom) filter.status = { $in: allowedFrom };

  const update = { status };
  if (payloadSubscription.current_end) {
    update.currentPeriodEnd = new Date(payloadSubscription.current_end * 1000);
  }
  if (status === 'active') update.lastChargedAt = new Date();
  if (status === 'cancelled') update.cancelledAt = new Date();

  const subscription = await PremiumSubscription.findOneAndUpdate(filter, update, { new: true });
  if (!subscription) return; // not found, or guard blocked a stale/out-of-order event — both fine to no-op

  await User.findByIdAndUpdate(subscription.userId, {
    isPremium: ACTIVE_STATUSES.has(status),
  });

  if (status === 'active') {
    claimAndSendPremiumWelcome(subscription).catch((err) => {
      console.error('[premium-welcome] unexpected:', err?.message || err);
    });
  }
}

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = Razorpay.validateWebhookSignature(
      req.body.toString(),
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body.toString());
    const eventId = req.headers['x-razorpay-event-id'] || `${event.event}:${event.created_at}`;

    try {
      await WebhookEvent.create({ eventId, event: event.event });
    } catch (err) {
      if (err.code === 11000) {
        // Already processed this exact delivery — idempotent no-op.
        return res.status(200).json({ received: true, duplicate: true });
      }
      throw err;
    }

    const subscriptionEntity = event.payload?.subscription?.entity;

    switch (event.event) {
      case 'subscription.authenticated':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'authenticated');
        break;
      case 'subscription.activated':
      case 'subscription.charged':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'active');
        break;
      case 'subscription.pending':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'pending');
        break;
      case 'subscription.halted':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'halted');
        break;
      case 'subscription.cancelled':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'cancelled');
        break;
      case 'subscription.completed':
        if (subscriptionEntity) await syncSubscription(subscriptionEntity, 'completed');
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};
