import mongoose from 'mongoose';

const blogReactionSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: String, required: true },
    type: { type: String, enum: ['like', 'dislike'], required: true },
  },
  { timestamps: true },
);

blogReactionSchema.index({ blogId: 1, userId: 1 }, { unique: true });

const BlogReaction = mongoose.model('BlogReaction', blogReactionSchema);

export default BlogReaction;
