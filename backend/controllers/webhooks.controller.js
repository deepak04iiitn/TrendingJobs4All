import Razorpay from 'razorpay';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import WebhookEvent from '../models/webhookEvent.model.js';
import User from '../models/user.model.js';

const ACTIVE_STATUSES = new Set(['authenticated', 'active']);

async function syncSubscription(payloadSubscription, status) {
  const subscription = await PremiumSubscription.findOne({
    razorpaySubscriptionId: payloadSubscription.id,
  });
  if (!subscription) return;

  subscription.status = status;
  if (payloadSubscription.current_end) {
    subscription.currentPeriodEnd = new Date(payloadSubscription.current_end * 1000);
  }
  if (status === 'active') subscription.lastChargedAt = new Date();
  if (status === 'cancelled') subscription.cancelledAt = new Date();
  await subscription.save();

  await User.findByIdAndUpdate(subscription.userId, {
    isPremium: ACTIVE_STATUSES.has(status),
  });
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
