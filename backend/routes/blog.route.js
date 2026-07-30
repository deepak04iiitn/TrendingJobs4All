import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import cloudinary from '../utils/cloudinary.js';
import {
  listBlogs,
  getCategories,
  getTags,
  getBlogBySlug,
  reactToBlog,
  getMyReaction,
  listBlogComments,
  listCommentReplies,
  addBlogComment,
  updateBlogComment,
  deleteBlogComment,
  reportBlogComment,
  adminListBlogs,
  adminGetBlog,
  adminCreateBlog,
  adminUpdateBlog,
  adminPublishBlog,
  adminUnpublishBlog,
  adminDeleteBlog,
  adminDuplicateBlog,
  adminAnalytics,
  adminListComments,
  adminDeleteComment,
} from '../controllers/blog.controller.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 10 * 1024 * 1024,
    fileSize: 5 * 1024 * 1024,
    fields: 30,
    files: 5,
  },
});

const uploadBufferToCloudinary = (buffer, folder = 'blog-images') =>
  new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    readable.pipe(stream);
  });

const parseMultipartBody = (req, _res, next) => {
  if (typeof req.body.content === 'string' && req.body.content.startsWith('[')) {
    try {
      req.body.content = JSON.parse(req.body.content);
    } catch {
      /* keep as string for htmlToBlocks fallback */
    }
  }
  if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch {
      /* comma-separated fallback handled in controller */
    }
  }
  ['seo', 'faq', 'relatedSlugs', 'author'].forEach((field) => {
    if (typeof req.body[field] === 'string' && (req.body[field].startsWith('{') || req.body[field].startsWith('['))) {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch {
        /* ignore */
      }
    }
  });
  next();
};

router.post('/upload-image', verifyToken, verifyAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const url = await uploadBufferToCloudinary(req.file.buffer);
    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});

// Admin routes (must precede :slug)
router.get('/admin/analytics', verifyToken, verifyAdmin, adminAnalytics);
router.get('/admin/comments', verifyToken, verifyAdmin, adminListComments);
router.delete('/admin/comments/:id', verifyToken, verifyAdmin, adminDeleteComment);
router.get('/admin/list', verifyToken, verifyAdmin, adminListBlogs);
router.get('/admin/:id', verifyToken, verifyAdmin, adminGetBlog);
const attachCoverImage = async (req, _res, next) => {
  try {
    if (req.file) {
      const url = await uploadBufferToCloudinary(req.file.buffer);
      req.body.coverImage = url;
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.post('/admin/create', verifyToken, verifyAdmin, upload.single('coverImage'), attachCoverImage, parseMultipartBody, adminCreateBlog);
router.put('/admin/:id', verifyToken, verifyAdmin, upload.single('coverImage'), attachCoverImage, parseMultipartBody, adminUpdateBlog);
router.post('/admin/:id/publish', verifyToken, verifyAdmin, adminPublishBlog);
router.post('/admin/:id/unpublish', verifyToken, verifyAdmin, adminUnpublishBlog);
router.post('/admin/:id/duplicate', verifyToken, verifyAdmin, adminDuplicateBlog);
router.delete('/admin/:id', verifyToken, verifyAdmin, adminDeleteBlog);

// Legacy aliases
router.get('/get', listBlogs);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/slug/:slug', getBlogBySlug);

// Public listing + taxonomy
router.get('/', listBlogs);

// Comment sub-routes (before generic :slug)
router.get('/comments/:id/replies', listCommentReplies);
router.patch('/comments/:id', verifyToken, updateBlogComment);
router.delete('/comments/:id', verifyToken, deleteBlogComment);
router.post('/comments/:id/report', verifyToken, reportBlogComment);

// Slug-scoped public routes
router.get('/:slug/comments', listBlogComments);
router.post('/:slug/comments', verifyToken, addBlogComment);
router.post('/:slug/react', verifyToken, reactToBlog);
router.get('/:slug/my-reaction', verifyToken, getMyReaction);
router.get('/:slug', getBlogBySlug);

export default router;
