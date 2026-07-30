import Blog from '../models/blog.model.js';
import BlogComment from '../models/blogComment.model.js';
import BlogReaction from '../models/blogReaction.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { clearSitemapCache } from './sitemap.controller.js';
import { clearLLMSCache } from './llms.controller.js';
import { prepareContent, slugify } from '../utils/blog-content.js';
import { htmlToBlocks } from '../utils/html-to-blocks.js';

const LIST_SELECT =
  'slug title subtitle excerpt coverImage coverImageAlt author category tags status publishedAt isFeatured readingTime views likes dislikes seo.metaTitle seo.metaDescription relatedSlugs createdAt updatedAt';

const COMMENTS_PAGE_SIZE = 8;
const REPLIES_PAGE_SIZE = 3;

function parseJsonField(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function resolveAuthor(userId, bodyAuthor) {
  if (bodyAuthor?.name) return bodyAuthor;

  if (userId) {
    const user = await User.findById(userId).select('username profilePicture').lean();
    if (user) {
      return {
        name: user.username,
        role: 'Route2Hire Team',
        avatar: user.profilePicture || '',
      };
    }
  }

  return { name: 'Route2Hire Team', role: 'Route2Hire Team', avatar: '' };
}

function normalizeBlogPayload(body, { isCreate = false } = {}) {
  const data = { ...body };

  if (typeof data.tags === 'string') {
    data.tags = data.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  if (typeof data.content === 'string') {
    data.content = parseJsonField(data.content, data.content);
  }

  if (typeof data.content === 'string') {
    data.content = htmlToBlocks(data.content);
  } else if (Array.isArray(data.content)) {
    if (data.content.length === 1 && typeof data.content[0] === 'string') {
      data.content = htmlToBlocks(data.content[0]);
    }
  }

  if (typeof data.seo === 'string') data.seo = parseJsonField(data.seo, {});
  if (typeof data.faq === 'string') data.faq = parseJsonField(data.faq, []);
  if (typeof data.relatedSlugs === 'string') {
    data.relatedSlugs = parseJsonField(data.relatedSlugs, []);
  }
  if (typeof data.author === 'string') data.author = parseJsonField(data.author, {});

  if (data.featuredImage && !data.coverImage) data.coverImage = data.featuredImage;
  if (data.published === true || data.published === 'true') {
    data.status = 'published';
    if (!data.publishedAt) data.publishedAt = new Date();
  } else if (data.published === false || data.published === 'false') {
    data.status = 'draft';
  }

  if (isCreate && !data.slug && data.title) {
    data.slug = slugify(data.title);
  }

  if (data.slug) data.slug = slugify(String(data.slug));

  if (!data.seo) {
    data.seo = {
      metaTitle: data.title || '',
      metaDescription: data.excerpt || '',
      keywords: data.tags || [],
      ogImage: data.coverImage || '',
    };
  }

  return data;
}

function invalidateCaches() {
  clearSitemapCache();
  clearLLMSCache();
}

// ─── Public endpoints ─────────────────────────────────────────────────────────

export const listBlogs = async (req, res, next) => {
  try {
    const {
      category,
      tag,
      q,
      sort = 'latest',
      page = '1',
      limit = '12',
      featured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const filter = { status: 'published' };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (tag) filter.tags = { $regex: tag, $options: 'i' };
    if (featured === 'true') filter.isFeatured = true;
    if (q) filter.$text = { $search: q };

    const sortMap = {
      latest: { publishedAt: -1 },
      popular: { views: -1 },
      liked: { likes: -1 },
      trending: { views: -1, likes: -1 },
      createdAt: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.latest;

    const [blogs, total] = await Promise.all([
      Blog.find(filter).select(LIST_SELECT).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Blog.countDocuments(filter),
    ]);

    res.status(200).json({
      blogs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req, res, next) => {
  try {
    const agg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json(agg.map((a) => ({ category: a._id, count: a.count })));
  } catch (error) {
    next(error);
  }
};

export const getTags = async (_req, res, next) => {
  try {
    const agg = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);
    res.status(200).json(agg.map((a) => ({ tag: a._id, count: a.count })));
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true },
    ).lean();

    if (!blog) return next(errorHandler(404, 'Blog not found'));

    const related = blog.relatedSlugs?.length
      ? await Blog.find({ slug: { $in: blog.relatedSlugs }, status: 'published' })
          .select(LIST_SELECT)
          .lean()
      : [];

    res.status(200).json({ blog, related });
  } catch (error) {
    next(error);
  }
};

export const reactToBlog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    if (!['like', 'dislike', null].includes(type)) {
      return next(errorHandler(400, 'type must be like, dislike, or null'));
    }

    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) return next(errorHandler(404, 'Blog not found'));

    const existing = await BlogReaction.findOne({ blogId: blog._id, userId });

    if (type === null) {
      if (existing) {
        const field = existing.type === 'like' ? 'likes' : 'dislikes';
        await existing.deleteOne();
        await Blog.updateOne({ _id: blog._id }, { $inc: { [field]: -1 } });
      }
      return res.status(200).json({ action: 'removed', type: null });
    }

    if (existing) {
      if (existing.type === type) {
        const field = type === 'like' ? 'likes' : 'dislikes';
        await existing.deleteOne();
        await Blog.updateOne({ _id: blog._id }, { $inc: { [field]: -1 } });
        return res.status(200).json({ action: 'removed', type });
      }

      const oldField = existing.type === 'like' ? 'likes' : 'dislikes';
      const newField = type === 'like' ? 'likes' : 'dislikes';
      existing.type = type;
      await existing.save();
      await Blog.updateOne({ _id: blog._id }, { $inc: { [oldField]: -1, [newField]: 1 } });
      return res.status(200).json({ action: 'switched', type });
    }

    await BlogReaction.create({ blogId: blog._id, userId, type });
    await Blog.updateOne({ _id: blog._id }, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 } });
    res.status(200).json({ action: 'added', type });
  } catch (error) {
    next(error);
  }
};

export const getMyReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const blog = await Blog.findOne({ slug: req.params.slug }).select('_id').lean();
    if (!blog) return res.status(200).json({ reaction: null });

    const reaction = await BlogReaction.findOne({ blogId: blog._id, userId }).lean();
    res.status(200).json({ reaction: reaction?.type ?? null });
  } catch (error) {
    next(error);
  }
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const listBlogComments = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).select('_id').lean();
    if (!blog) return res.status(200).json({ comments: [], total: 0, page: 1, pages: 0 });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || COMMENTS_PAGE_SIZE));
    const filter = { blogId: blog._id, parentId: null, isDeleted: false };

    const [comments, total] = await Promise.all([
      BlogComment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogComment.countDocuments(filter),
    ]);

    const ids = comments.map((c) => c._id);
    const replyGroups = ids.length
      ? await BlogComment.aggregate([
          { $match: { parentId: { $in: ids }, isDeleted: false } },
          { $sort: { createdAt: 1 } },
          { $group: { _id: '$parentId', total: { $sum: 1 }, replies: { $push: '$$ROOT' } } },
          { $project: { total: 1, replies: { $slice: ['$replies', REPLIES_PAGE_SIZE] } } },
        ])
      : [];

    const replyMap = new Map(replyGroups.map((g) => [g._id.toString(), g]));
    const result = comments.map((c) => {
      const g = replyMap.get(c._id.toString());
      return { ...c, replies: g?.replies ?? [], repliesTotal: g?.total ?? 0 };
    });

    res.status(200).json({
      comments: result,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const listCommentReplies = async (req, res, next) => {
  try {
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || REPLIES_PAGE_SIZE));
    const filter = { parentId: req.params.id, isDeleted: false };

    const [replies, total] = await Promise.all([
      BlogComment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
      BlogComment.countDocuments(filter),
    ]);

    res.status(200).json({ replies, total });
  } catch (error) {
    next(error);
  }
};

export const addBlogComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, parentId } = req.body;

    if (!content?.trim()) return next(errorHandler(400, 'content is required'));
    if (content.length > 4000) return next(errorHandler(400, 'comment too long'));

    const blog = await Blog.findOne({ slug: req.params.slug }).select('_id').lean();
    if (!blog) return next(errorHandler(404, 'Blog not found'));

    const user = await User.findById(userId).select('username profilePicture').lean();

    const comment = await BlogComment.create({
      blogId: blog._id,
      parentId: parentId || null,
      authorId: userId,
      authorName: user?.username || 'Anonymous',
      authorImage: user?.profilePicture || '',
      content: content.trim(),
    });

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

export const updateBlogComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    if (!content?.trim()) return next(errorHandler(400, 'content is required'));

    const comment = await BlogComment.findById(req.params.id);
    if (!comment || comment.isDeleted) return next(errorHandler(404, 'Comment not found'));
    if (comment.authorId !== userId && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'Forbidden'));
    }

    comment.content = content.trim();
    await comment.save();
    res.status(200).json({ comment });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const comment = await BlogComment.findById(req.params.id);
    if (!comment) return next(errorHandler(404, 'Comment not found'));
    if (comment.authorId !== userId && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'Forbidden'));
    }

    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const reportBlogComment = async (req, res, next) => {
  try {
    const comment = await BlogComment.findById(req.params.id);
    if (!comment) return next(errorHandler(404, 'Comment not found'));
    comment.isReported = true;
    await comment.save();
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const adminListBlogs = async (req, res, next) => {
  try {
    const { status, q, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('-content')
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.status(200).json({ blogs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    next(error);
  }
};

export const adminGetBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return next(errorHandler(404, 'Blog not found'));
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const adminCreateBlog = async (req, res, next) => {
  try {
    const data = normalizeBlogPayload(req.body, { isCreate: true });

    if (!data.title || !data.category) {
      return next(errorHandler(400, 'title and category are required'));
    }

    data.author = await resolveAuthor(req.user.id, data.author);

    const contentError = prepareContent(data);
    if (contentError) return next(errorHandler(400, contentError));

    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const existing = await Blog.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const blog = await Blog.create(data);
    invalidateCaches();
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateBlog = async (req, res, next) => {
  try {
    const data = normalizeBlogPayload(req.body);

    if (data.content) {
      const contentError = prepareContent(data);
      if (contentError) return next(errorHandler(400, contentError));
    }

    if (data.author) {
      data.author = await resolveAuthor(req.user.id, data.author);
    }

    if (data.status === 'published') {
      const existing = await Blog.findById(req.params.id).select('publishedAt').lean();
      if (existing && !existing.publishedAt) data.publishedAt = new Date();
    }

    if (data.slug) {
      const clash = await Blog.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
      if (clash) return next(errorHandler(400, 'Slug already in use'));
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
    if (!blog) return next(errorHandler(404, 'Blog not found'));

    invalidateCaches();
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const adminPublishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'published', publishedAt: new Date() } },
      { new: true },
    );
    if (!blog) return next(errorHandler(404, 'Blog not found'));
    invalidateCaches();
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const adminUnpublishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'draft' } },
      { new: true },
    );
    if (!blog) return next(errorHandler(404, 'Blog not found'));
    invalidateCaches();
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, 'Blog not found'));

    await Blog.findByIdAndDelete(req.params.id);
    await BlogComment.deleteMany({ blogId: blog._id });
    await BlogReaction.deleteMany({ blogId: blog._id });

    invalidateCaches();
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const adminDuplicateBlog = async (req, res, next) => {
  try {
    const original = await Blog.findById(req.params.id).lean();
    if (!original) return next(errorHandler(404, 'Blog not found'));

    const {
      _id,
      createdAt,
      updatedAt,
      views,
      likes,
      dislikes,
      ...rest
    } = original;

    const copy = await Blog.create({
      ...rest,
      slug: `${rest.slug}-copy-${Date.now()}`,
      title: `${rest.title} (Copy)`,
      status: 'draft',
      publishedAt: null,
      views: 0,
      likes: 0,
      dislikes: 0,
    });

    invalidateCaches();
    res.status(201).json(copy);
  } catch (error) {
    next(error);
  }
};

export const adminAnalytics = async (req, res, next) => {
  try {
    const [totalBlogs, publishedBlogs, topViewed, topLiked, categoryBreakdown, engagement] =
      await Promise.all([
        Blog.countDocuments(),
        Blog.countDocuments({ status: 'published' }),
        Blog.find({ status: 'published' })
          .select('title slug views likes category publishedAt')
          .sort({ views: -1 })
          .limit(10)
          .lean(),
        Blog.find({ status: 'published' })
          .select('title slug views likes category publishedAt')
          .sort({ likes: -1 })
          .limit(10)
          .lean(),
        Blog.aggregate([
          { $match: { status: 'published' } },
          { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
          { $sort: { totalViews: -1 } },
        ]),
        Blog.aggregate([
          { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likes' } } },
        ]),
      ]);

    res.status(200).json({
      totalBlogs,
      publishedBlogs,
      totalViews: engagement[0]?.views || 0,
      totalLikes: engagement[0]?.likes || 0,
      topViewed,
      topLiked,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

export const adminListComments = async (req, res, next) => {
  try {
    const { reported, page = '1' } = req.query;
    const filter = {};
    if (reported === 'true') filter.isReported = true;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const [comments, total] = await Promise.all([
      BlogComment.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * 20)
        .limit(20)
        .lean(),
      BlogComment.countDocuments(filter),
    ]);

    res.status(200).json({ comments, total });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteComment = async (req, res, next) => {
  try {
    await BlogComment.findByIdAndDelete(req.params.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

// Legacy compatibility shims (deprecated)
export const getBlogs = listBlogs;
export const getBlogById = adminGetBlog;
