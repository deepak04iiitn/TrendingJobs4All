import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const dsaUserStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 1 },
    weeklyGoal: { type: Number, default: 5 },
    badges: { type: [badgeSchema], default: [] },
    lastSolvedAt: { type: Date, default: null },
    topicProgress: { type: Map, of: Number, default: {} },
    companyProgress: { type: Map, of: Number, default: {} },
  },
  { timestamps: true, collection: 'dsa_user_stats' }
);

const DsaUserStats = mongoose.model('DsaUserStats', dsaUserStatsSchema);
export default DsaUserStats;
