import mongoose from 'mongoose';

const tocSchema = new mongoose.Schema(
  { id: String, text: String, level: Number },
  { _id: false },
);

const faqSchema = new mongoose.Schema(
  { q: String, a: String },
  { _id: false },
);

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    excerpt: { type: String, default: '', maxlength: 500 },
    content: { type: [mongoose.Schema.Types.Mixed], required: true },
    coverImage: { type: String, default: '' },
    coverImageAlt: { type: String, default: '' },

    author: {
      name: { type: String, required: true },
      role: { type: String, default: 'Route2Hire Team' },
      avatar: { type: String, default: '' },
    },

    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },

    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },

    isFeatured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 5 },
    contentVersion: { type: Number, default: 2 },

    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: '' },
    },

    faq: { type: [faqSchema], default: [] },
    toc: { type: [tocSchema], default: [] },
    relatedSlugs: { type: [String], default: [] },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likes: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
