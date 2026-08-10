import mongoose from 'mongoose';
import { CASE_KINDS } from '../utils/dsaConstants.js';

const dsaTestCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaCatalogProblem',
      required: true,
      index: true,
    },
    index: { type: Number, required: true },
    stdin: { type: String, default: '' },
    expectedStdout: { type: String, default: '' },
    isSample: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: true },
    caseKind: {
      type: String,
      enum: CASE_KINDS,
      required: true,
      index: true,
    },
    edgeTags: { type: [String], default: [] },
    timeLimitMs: { type: Number, default: 2000 },
    weight: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'dsa_test_cases' }
);

dsaTestCaseSchema.index({ problemId: 1, index: 1 }, { unique: true });
dsaTestCaseSchema.index({ problemId: 1, caseKind: 1 });
dsaTestCaseSchema.index({ problemId: 1, isSample: 1 });

const DsaTestCase = mongoose.model('DsaTestCase', dsaTestCaseSchema);
export default DsaTestCase;
