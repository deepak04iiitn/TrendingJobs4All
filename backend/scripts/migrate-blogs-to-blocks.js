import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { prepareContent, slugify } from '../utils/blog-content.js';
import { htmlToBlocks, normalizeSlug } from '../utils/html-to-blocks.js';

dotenv.config();

function resolveUserId(author) {
  if (!author) return null;
  if (typeof author === 'string' && /^[0-9a-fA-F]{24}$/.test(author)) return author;
  if (author instanceof mongoose.Types.ObjectId) return author;
  if (author._id) {
    const id = author._id;
    return id instanceof mongoose.Types.ObjectId ? id : String(id);
  }
  if (typeof author.id === 'string') return author.id;
  return null;
}

function normalizeLegacyContent(content) {
  if (typeof content === 'string') return htmlToBlocks(content);

  if (Array.isArray(content)) {
    // New schema uses [Mixed] — legacy HTML strings get coerced to single-element arrays
    if (content.length === 1 && typeof content[0] === 'string') {
      return htmlToBlocks(content[0]);
    }
    if (content.length > 0 && content.every((b) => b && typeof b.type === 'string')) {
      return content;
    }
    const html = content.filter((c) => typeof c === 'string').join('');
    if (html) return htmlToBlocks(html);
  }

  return [{ type: 'paragraph', text: '' }];
}

function hasEmbeddedAuthor(author) {
  return author && typeof author === 'object' && typeof author.name === 'string' && author.name.trim();
}

async function migrate() {
  await mongoose.connect(process.env.MONGO);

  const blogs = await Blog.find({}).lean(false);
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const blog of blogs) {
    try {
      const $set = {};
      const $unset = {};
      let needsSave = false;

      let content = normalizeLegacyContent(blog.content);
      const alreadyBlocks = Array.isArray(blog.content)
        && blog.content.length > 0
        && blog.content.every((b) => b && typeof b.type === 'string');

      if (!alreadyBlocks) {
        needsSave = true;
      }

      if (blog.contentVersion !== 2) {
        $set.contentVersion = 2;
        needsSave = true;
      }

      const normalized = normalizeSlug(blog.slug);
      if (normalized && normalized !== blog.slug) {
        const clash = await Blog.findOne({ slug: normalized, _id: { $ne: blog._id } });
        if (!clash) {
          $set.slug = normalized;
          needsSave = true;
        }
      }

      let status = blog.status;
      if (!status && blog.published !== undefined) {
        status = blog.published ? 'published' : 'draft';
        $set.status = status;
        needsSave = true;
      } else if (!status) {
        status = 'draft';
        $set.status = status;
        needsSave = true;
      }

      if (!blog.publishedAt && status === 'published') {
        $set.publishedAt = blog.createdAt || new Date();
        needsSave = true;
      }

      if (blog.featuredImage && !blog.coverImage) {
        $set.coverImage = blog.featuredImage;
        needsSave = true;
      }

      if (blog.readTime && !blog.readingTime) {
        $set.readingTime = blog.readTime;
        needsSave = true;
      }

      if (Array.isArray(blog.likes)) {
        $set.likes = Math.max(blog.numberOfLikes || 0, blog.likes.length);
        $unset.likes = '';
        needsSave = true;
      }

      if (Array.isArray(blog.dislikes)) {
        $set.dislikes = Math.max(blog.numberOfDislikes || 0, blog.dislikes.length);
        $unset.dislikes = '';
        needsSave = true;
      }

      if (blog.numberOfLikes !== undefined) $unset.numberOfLikes = '';
      if (blog.numberOfDislikes !== undefined) $unset.numberOfDislikes = '';
      if (blog.published !== undefined) $unset.published = '';
      if (blog.featuredImage !== undefined) $unset.featuredImage = '';
      if (blog.readTime !== undefined) $unset.readTime = '';

      if (!hasEmbeddedAuthor(blog.author)) {
        const userId = resolveUserId(blog.author);
        if (userId) {
          const user = await User.findById(userId).select('username profilePicture').lean();
          if (user) {
            $set.author = {
              name: user.username,
              role: 'Route2Hire Team',
              avatar: user.profilePicture || '',
            };
            needsSave = true;
          }
        } else {
          $set.author = { name: 'Route2Hire Team', role: 'Route2Hire Team', avatar: '' };
          needsSave = true;
        }
      }

      if (!blog.seo?.metaTitle) {
        $set.seo = {
          metaTitle: blog.title || '',
          metaDescription: blog.excerpt || '',
          keywords: blog.tags || [],
          ogImage: blog.coverImage || blog.featuredImage || '',
        };
        needsSave = true;
      }

      if (!needsSave && blog.contentVersion === 2 && Array.isArray(blog.content)) {
        skipped += 1;
        continue;
      }

      if (content) {
        const prep = { content };
        const err = prepareContent(prep);
        if (err) {
          console.error(`[FAIL] ${blog._id} (${blog.slug}): ${err}`);
          failed += 1;
          continue;
        }
        $set.content = prep.content;
        $set.toc = prep.toc;
        $set.readingTime = prep.readingTime;
      }

      if (!$set.slug && !blog.slug) {
        $set.slug = slugify(blog.title || `blog-${blog._id}`);
      }

      const update = { $set };
      if (Object.keys($unset).length) update.$unset = $unset;

      await mongoose.connection.db.collection('blogs').updateOne({ _id: blog._id }, update);
      console.log(`[OK] ${blog.slug}${$set.slug ? ` → ${$set.slug}` : ''}`);
      migrated += 1;
    } catch (error) {
      console.error(`[FAIL] ${blog._id}:`, error.message);
      failed += 1;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}, Failed: ${failed}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
