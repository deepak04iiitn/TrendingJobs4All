import mongoose from 'mongoose';

const dsaDiscussionVoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaDiscussion',
      required: true,
    },
    /** 1 = upvote, -1 = downvote */
    value: {
      type: Number,
      enum: [1, -1],
      default: 1,
    },
  },
  { timestamps: true, collection: 'dsa_discussion_votes' }
);

dsaDiscussionVoteSchema.index({ userId: 1, discussionId: 1 }, { unique: true });

const DsaDiscussionVote = mongoose.model('DsaDiscussionVote', dsaDiscussionVoteSchema);
export default DsaDiscussionVote;
