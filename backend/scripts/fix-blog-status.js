import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/blog.model.js';

dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGO);
  const col = mongoose.connection.db.collection('blogs');

  const blogs = await col.find({}).toArray();
  let fixed = 0;

  for (const blog of blogs) {
    const $set = {};
    const $unset = {};

    if (!blog.status) {
      $set.status = blog.published ? 'published' : 'draft';
    }
    if (!blog.contentVersion) $set.contentVersion = 2;

    if (Array.isArray(blog.likes)) {
      $set.likes = Math.max(blog.numberOfLikes || 0, blog.likes.length);
    } else if (typeof blog.likes !== 'number') {
      $set.likes = blog.numberOfLikes || 0;
    }

    if (Array.isArray(blog.dislikes)) {
      $set.dislikes = Math.max(blog.numberOfDislikes || 0, blog.dislikes.length);
    } else if (typeof blog.dislikes !== 'number') {
      $set.dislikes = blog.numberOfDislikes || 0;
    }

    const status = $set.status || blog.status;
    if (!blog.publishedAt && status === 'published') {
      $set.publishedAt = blog.createdAt || new Date();
    }

    if (blog.featuredImage && !blog.coverImage) {
      $set.coverImage = blog.featuredImage;
    }

    ['published', 'featuredImage', 'readTime', 'numberOfLikes', 'numberOfDislikes'].forEach((f) => {
      if (blog[f] !== undefined) $unset[f] = '';
    });

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    if (Object.keys(update).length) {
      await col.updateOne({ _id: blog._id }, update);
      console.log('[FIXED]', blog.slug, $set);
      fixed += 1;
    }
  }

  console.log(`\nFixed ${fixed} blog(s).`);
  await mongoose.disconnect();
}

fix().catch((err) => {
  console.error(err);
  process.exit(1);
});
