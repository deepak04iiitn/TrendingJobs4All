import mongoose from 'mongoose';

const PremiumSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  yoe: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Years of Experience must be a whole number',
    },
  },
  category: { type: String, default: 'qa' },

  razorpayCustomerId: { type: String, default: null },
  razorpaySubscriptionId: { type: String, default: null, index: true },
  razorpayPlanId: { type: String, default: null },

  status: {
    type: String,
    enum: ['created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired'],
    default: 'created',
    index: true,
  },

  currentPeriodEnd: { type: Date, default: null },
  lastChargedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  // True once the user requests cancellation — the subscription stays
  // `active` (and daily emails keep sending) until Razorpay's
  // subscription.cancelled webhook fires at the end of the paid period.
  cancelAtPeriodEnd: { type: Boolean, default: false },

  // Per-subscriber dedup for the daily email — jobs already sent to this person.
  sentJobIds: [{ type: mongoose.Schema.Types.ObjectId }],

  lastEmailSentAt: { type: Date, default: null },
  lastEmailJobCount: { type: Number, default: 0 },
}, { timestamps: true });

const PremiumSubscription = mongoose.model('PremiumSubscription', PremiumSubscriptionSchema);

export default PremiumSubscription;
