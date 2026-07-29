import axios from 'axios';

export async function fetchBlogList(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const res = await axios.get(`/backend/blogs?${search.toString()}`);
  return res.data;
}

export async function fetchBlogCategories() {
  const res = await axios.get('/backend/blogs/categories');
  return res.data;
}

export async function fetchBlogTags() {
  const res = await axios.get('/backend/blogs/tags');
  return res.data;
}

export async function fetchBlogBySlug(slug) {
  const res = await axios.get(`/backend/blogs/${slug}`);
  return res.data;
}

export async function fetchMyReaction(slug) {
  const res = await axios.get(`/backend/blogs/${slug}/my-reaction`);
  return res.data.reaction;
}

export async function reactToBlog(slug, type) {
  const res = await axios.post(`/backend/blogs/${slug}/react`, { type });
  return res.data;
}

export async function fetchBlogComments(slug, page = 1) {
  const res = await axios.get(`/backend/blogs/${slug}/comments?page=${page}`);
  return res.data;
}

export async function fetchCommentReplies(commentId, skip = 0) {
  const res = await axios.get(`/backend/blogs/comments/${commentId}/replies?skip=${skip}`);
  return res.data;
}

export async function postBlogComment(slug, content, parentId = null) {
  const res = await axios.post(`/backend/blogs/${slug}/comments`, { content, parentId });
  return res.data.comment;
}

export async function updateBlogComment(commentId, content) {
  const res = await axios.patch(`/backend/blogs/comments/${commentId}`, { content });
  return res.data.comment;
}

export async function deleteBlogComment(commentId) {
  await axios.delete(`/backend/blogs/comments/${commentId}`);
}

export async function reportBlogComment(commentId) {
  await axios.post(`/backend/blogs/comments/${commentId}/report`);
}
