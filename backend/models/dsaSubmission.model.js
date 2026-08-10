import mongoose from 'mongoose';
import { DSA_LANGUAGES } from '../utils/dsaConstants.js';

const SUBMISSION_STATUSES = [
  'Accepted',
  'WrongAnswer',
  'CompilationError',
  'RuntimeError',
  'TimeLimitExceeded',
  'InternalError',
];

const dsaSubmissionSchema = new mongoose.Schema(
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
    language: { type: String, enum: DSA_LANGUAGES, required: true },
    code: { type: String, required: true },
    codeHash: { type: String, default: '', index: true },
    status: { type: String, enum: SUBMISSION_STATUSES, required: true, index: true },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    runtimeMs: { type: Number, default: null },
    memoryKb: { type: Number, default: null },
    elapsedMs: { type: Number, default: null },
    judgeMessage: { type: String, default: '' },
    failedCaseSummary: { type: String, default: '' },
    caseResults: {
      type: [
        {
          index: Number,
          passed: Boolean,
          status: String,
          runtimeMs: Number,
          // Never store hidden stdin/expected for client leakage safety on samples only:
          isSample: Boolean,
          stdout: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: 'dsa_submissions' }
);

dsaSubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
dsaSubmissionSchema.index({ userId: 1, createdAt: -1 });
dsaSubmissionSchema.index({ problemId: 1, status: 1 });
dsaSubmissionSchema.index({ userId: 1, problemId: 1, language: 1, codeHash: 1, createdAt: -1 });

export { SUBMISSION_STATUSES };
const DsaSubmission = mongoose.model('DsaSubmission', dsaSubmissionSchema);
export default DsaSubmission;
