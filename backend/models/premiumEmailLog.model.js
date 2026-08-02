import mongoose from 'mongoose';

// One row per subscriber per daily cron run, for admin monitoring/debugging.
const PremiumEmailLogSchema = new mongoose.Schema({
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PremiumSubscription', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  runDate: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
  status: {
    type: String,
    enum: ['sent', 'skipped_no_jobs', 'skipped_inactive', 'failed'],
    required: true,
  },
  jobIds: [{ type: mongoose.Schema.Types.ObjectId }],
  matchedYoe: { type: Number, default: null },
  errorMessage: { type: String, default: null },
  resendMessageId: { type: String, default: null },
}, { timestamps: true });

PremiumEmailLogSchema.index({ runDate: 1, status: 1 });

const PremiumEmailLog = mongoose.model('PremiumEmailLog', PremiumEmailLogSchema);

export default PremiumEmailLog;
