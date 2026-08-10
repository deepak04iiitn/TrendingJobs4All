import mongoose from 'mongoose';

const dsaDiscussionSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaCatalogProblem',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaDiscussion',
      default: null,
      index: true,
    },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    code: { type: String, default: '' },
    codeLanguage: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'dsa_discussions' }
);

dsaDiscussionSchema.index({ problemId: 1, parentId: 1, createdAt: -1 });
dsaDiscussionSchema.index({ problemId: 1, parentId: 1, upvotes: -1, createdAt: -1 });

const DsaDiscussion = mongoose.model('DsaDiscussion', dsaDiscussionSchema);
export default DsaDiscussion;
