import mongoose from 'mongoose';

const dsaUserProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaCatalogProblem',
      required: true,
      index: true,
    },
    legacyProblemName: { type: String, default: '', index: true },
    status: {
      type: String,
      enum: ['todo', 'attempted', 'solved'],
      default: 'todo',
      index: true,
    },
    isFavorite: { type: Boolean, default: false, index: true },
    notes: { type: String, default: '' },
    firstSolvedAt: { type: Date, default: null },
    lastAttemptedAt: { type: Date, default: null },
    bestRuntimeMs: { type: Number, default: null },
    bestMemoryKb: { type: Number, default: null },
    firstSolveTimeMs: { type: Number, default: null },
    bestSolveTimeMs: { type: Number, default: null },
    acceptedLanguage: {
      type: String,
      default: null,
    },
    attemptCount: { type: Number, default: 0 },
    acceptedCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'dsa_user_progress' }
);

dsaUserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
dsaUserProgressSchema.index({ userId: 1, status: 1 });
dsaUserProgressSchema.index({ userId: 1, isFavorite: 1 });
dsaUserProgressSchema.index({ userId: 1, firstSolvedAt: -1 });

const DsaUserProgress = mongoose.model('DsaUserProgress', dsaUserProgressSchema);
export default DsaUserProgress;
