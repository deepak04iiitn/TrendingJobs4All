import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ThumbsUp, Reply, Pencil, Trash2, Flag, ChevronDown, Send,
} from 'lucide-react';
import { focusRing } from '../../theme/tokens';
import {
  fetchBlogComments,
  fetchCommentReplies,
  postBlogComment,
  updateBlogComment,
  deleteBlogComment,
  reportBlogComment,
} from '../../lib/blog-api';

function timeAgo(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommentItem({
  comment,
  slug,
  currentUser,
  depth = 0,
  onRefresh,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replies, setReplies] = useState(comment.replies || []);
  const [repliesTotal, setRepliesTotal] = useState(comment.repliesTotal || 0);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const isOwner = currentUser?._id === comment.authorId || currentUser?.id === comment.authorId;

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await postBlogComment(slug, replyText, comment._id);
      setReplyText('');
      setReplyOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const saveEdit = async () => {
    try {
      await updateBlogComment(comment._id, editText);
      setEditOpen(false);
      onRefresh();
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteBlogComment(comment._id);
      onRefresh();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReport = async () => {
    try {
      await reportBlogComment(comment._id);
      toast.success('Comment reported');
    } catch {
      toast.error('Failed to report');
    }
  };

  const loadMoreReplies = async () => {
    setLoadingReplies(true);
    try {
      const data = await fetchCommentReplies(comment._id, replies.length);
      setReplies((prev) => [...prev, ...data.replies]);
      setRepliesTotal(data.total);
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-[#E5DCCE] pl-4' : ''}>
      <article className="rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F3EC] text-xs font-semibold text-[#6B5A48]">
            {(comment.authorName || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[#1C1917]">{comment.authorName}</span>
              <span className="text-[11px] text-[#78716C]">{timeAgo(comment.createdAt)}</span>
            </div>
            {editOpen ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-sm text-[#2C241B] outline-none focus:border-[#C4A574]"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} className={`rounded-lg bg-[#2C241B] px-3 py-1.5 text-xs text-[#FFFDF8] ${focusRing}`}>Save</button>
                  <button type="button" onClick={() => setEditOpen(false)} className={`rounded-lg border border-[#E5DCCE] px-3 py-1.5 text-xs text-[#6B5A48] ${focusRing}`}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-[#57534E]">{comment.content}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {currentUser && depth < 2 && (
                <button type="button" onClick={() => setReplyOpen(!replyOpen)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
                  <Reply className="h-3 w-3" /> Reply
                </button>
              )}
              {isOwner && !editOpen && (
                <>
                  <button type="button" onClick={() => setEditOpen(true)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button type="button" onClick={handleDelete} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 ${focusRing}`}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </>
              )}
              {currentUser && !isOwner && (
                <button type="button" onClick={handleReport} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#78716C] hover:bg-[#F7F3EC] ${focusRing}`}>
                  <Flag className="h-3 w-3" /> Report
                </button>
              )}
            </div>
            {replyOpen && (
              <div className="mt-3 flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="flex-1 rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-sm outline-none focus:border-[#C4A574]"
                />
                <button type="button" onClick={submitReply} className={`shrink-0 self-end rounded-lg bg-[#2C241B] p-2 text-[#FFFDF8] ${focusRing}`}>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((r) => (
            <CommentItem key={r._id} comment={r} slug={slug} currentUser={currentUser} depth={depth + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {repliesTotal > replies.length && (
        <button
          type="button"
          onClick={loadMoreReplies}
          disabled={loadingReplies}
          className={`mt-2 inline-flex items-center gap-1 text-xs text-[#6B5A48] hover:text-[#2C241B] ${focusRing}`}
        >
          <ChevronDown className="h-3 w-3" />
          {loadingReplies ? 'Loading...' : `Show ${repliesTotal - replies.length} more replies`}
        </button>
      )}
    </div>
  );
}

export default function BlogComments({ slug }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogComments(slug, page);
      setComments(data.comments || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug, page]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!content.trim()) return;
    try {
      await postBlogComment(slug, content);
      setContent('');
      setPage(1);
      loadComments();
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  return (
    <section id="comments" className="scroll-mt-28">
      <div className="mb-6 flex items-center gap-2">
        <ThumbsUp className="h-4 w-4 text-[#C4A574]" />
        <h2 className="font-display text-xl font-semibold text-[#1C1917]">Reader&apos;s Notes</h2>
        <span className="text-sm text-[#78716C]">({total})</span>
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={4000}
            className="w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4 text-sm text-[#2C241B] outline-none focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#78716C]">{content.length}/4000</span>
            <button type="submit" className={`rounded-xl bg-[#2C241B] px-4 py-2 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}>
              Post comment
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4 text-sm text-[#57534E]">
          <Link to="/sign-in" className="font-medium text-[#C4A574] hover:underline">Sign in</Link> to join the discussion.
        </p>
      )}

      {loading ? (
        <p className="text-center text-[#78716C]">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-[#78716C]">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem key={c._id} comment={c} slug={slug} currentUser={currentUser} onRefresh={loadComments} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium ${p === page ? 'bg-[#2C241B] text-[#FFFDF8]' : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48]'} ${focusRing}`}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
