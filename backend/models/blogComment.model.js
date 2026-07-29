import mongoose from 'mongoose';

const blogCommentSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment', default: null },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorImage: { type: String, default: '' },
    content: { type: String, required: true, maxlength: 4000 },
    likes: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true },
);

blogCommentSchema.index({ blogId: 1, parentId: 1, createdAt: -1 });
blogCommentSchema.index({ parentId: 1, createdAt: 1 });

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

export default BlogComment;
