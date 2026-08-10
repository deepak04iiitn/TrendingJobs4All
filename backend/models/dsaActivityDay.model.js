import mongoose from 'mongoose';

const dsaActivityDaySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // IST YYYY-MM-DD
    solvedCount: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'dsa_activity_days' }
);

dsaActivityDaySchema.index({ userId: 1, date: 1 }, { unique: true });
dsaActivityDaySchema.index({ userId: 1, date: -1 });

const DsaActivityDay = mongoose.model('DsaActivityDay', dsaActivityDaySchema);
export default DsaActivityDay;
