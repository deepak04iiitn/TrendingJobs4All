import mongoose from 'mongoose';
import { DSA_LANGUAGES } from '../utils/dsaConstants.js';

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const hintSchema = new mongoose.Schema(
  {
    order: { type: Number, default: 0 },
    text: { type: String, required: true },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    language: { type: String, enum: DSA_LANGUAGES, required: true },
    code: { type: String, required: true },
    approach: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  Object.fromEntries(DSA_LANGUAGES.map((lang) => [lang, { type: String, default: '' }])),
  { _id: false }
);

const dsaCatalogProblemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    legacyProblemName: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      index: true,
    },
    statement: { type: String, default: '' },
    examples: { type: [exampleSchema], default: [] },
    constraints: { type: String, default: '' },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    companyTags: { type: [String], default: [], index: true },
    hints: { type: [hintSchema], default: [] },
    solutions: { type: [solutionSchema], default: [] },
    starterCode: { type: starterCodeSchema, default: () => ({}) },
    functionSignature: { type: mongoose.Schema.Types.Mixed, default: {} },
    legacyExternalLink: { type: String, default: '' },
    ioShape: { type: String, default: '' },
    shapeConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    comparisonMode: {
      type: String,
      enum: ['exact', 'float', 'canonical-sort-lines'],
      default: 'exact',
    },
    comparisonConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    stats: {
      attemptCount: { type: Number, default: 0 },
      acceptCount: { type: Number, default: 0 },
      favoriteCount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, collection: 'dsa_problems' }
);

dsaCatalogProblemSchema.index({ category: 1, difficulty: 1 });
dsaCatalogProblemSchema.index({ companyTags: 1, status: 1 });
dsaCatalogProblemSchema.index({ status: 1, order: 1 });

const DsaCatalogProblem = mongoose.model('DsaCatalogProblem', dsaCatalogProblemSchema);
export default DsaCatalogProblem;
