import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Code2,
  Loader2,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { focusRing } from '../../theme/tokens';
import {
  fetchDsaDiscussions,
  createDsaDiscussion,
  voteDsaDiscussion,
} from '../../lib/dsa-api';

const PAGE_SIZE = 12;
const CODE_LANGS = ['python', 'javascript', 'java', 'cpp', 'c', 'csharp', 'go', 'typescript'];

const LANG_LABELS = {
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  csharp: 'C#',
  ruby: 'Ruby',
};

const langLabel = (id) => LANG_LABELS[id] || id;

function Avatar({ src }) {
  return (
    <img
      src={src || '/assets/Profile.jpg'}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-[#E5DCCE]"
    />
  );
}

function CodeBlock({ code, language }) {
  if (!code) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#E5DCCE] bg-[#1C1917]">
      {language ? (
        <p className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#C4A574]">
          {langLabel(language)}
        </p>
      ) : null}
      <pre className="max-h-56 overflow-auto p-3 text-[11px] leading-relaxed text-[#E5DCCE]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function VoteButtons({ post, onVote, busy }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => onVote(post._id, 1)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${focusRing} ${
          post.myVote === 1
            ? 'bg-[#C4A574]/20 text-[#2C241B]'
            : 'text-[#78716C] hover:bg-[#EFE8DC]'
        }`}
        aria-label="Upvote"
      >
        <ThumbsUp size={14} className={post.myVote === 1 ? 'text-[#C4A574]' : ''} />
        {post.upvotes || 0}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onVote(post._id, -1)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition ${focusRing} ${
          post.myVote === -1
            ? 'bg-rose-50 text-rose-700'
            : 'text-[#78716C] hover:bg-[#EFE8DC]'
        }`}
        aria-label="Downvote"
      >
        <ThumbsDown size={14} />
        {post.downvotes || 0}
      </button>
    </div>
  );
}

function ComposeModal({ open, onClose, onSubmit, title, submitLabel, languages }) {
  const [body, setBody] = useState('');
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState(languages?.[0] || 'python');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setBody('');
    setCode('');
    setShowCode(false);
    setCodeLanguage(languages?.[0] || 'python');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, languages]);

  if (!open) return null;

  const submit = async () => {
    if (!body.trim() && !code.trim()) {
      toast.error('Add text and/or code');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        body: body.trim(),
        code: showCode ? code.trim() : '',
        codeLanguage: showCode && code.trim() ? codeLanguage : '',
      });
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not post');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#2C241B]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disc-compose-title"
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_80px_-24px_rgba(44,36,27,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
          <h2 id="disc-compose-title" className="font-display text-lg font-semibold text-[#1C1917]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl p-2 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Share an approach or ask a question…"
            className={`w-full resize-y rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 p-3 text-sm text-[#1C1917] placeholder:text-[#A89B8A] ${focusRing}`}
            autoFocus
          />

          {!showCode ? (
            <button
              type="button"
              onClick={() => setShowCode(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5DCCE] px-3 py-2 text-xs font-semibold text-[#6B5A48] hover:border-[#C4A574] hover:text-[#2C241B] ${focusRing}`}
            >
              <Code2 size={14} className="text-[#C4A574]" /> Add code snippet
            </button>
          ) : (
            <div className="space-y-2 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#6B5A48]">
                  Language
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2 py-1.5 text-xs font-medium text-[#2C241B] ${focusRing}`}
                  >
                    {(languages?.length ? languages : CODE_LANGS).map((id) => (
                      <option key={id} value={id}>
                        {langLabel(id)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCode(false);
                    setCode('');
                  }}
                  className={`text-xs font-semibold text-[#78716C] hover:text-[#2C241B] ${focusRing}`}
                >
                  Remove code
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={8}
                spellCheck={false}
                placeholder="// paste your code here"
                className={`w-full resize-y rounded-xl border border-[#E5DCCE] bg-[#1C1917] p-3 font-mono text-[12px] text-[#E5DCCE] placeholder:text-white/30 ${focusRing}`}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5DCCE] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border border-[#E5DCCE] px-4 py-2 text-sm font-semibold text-[#2C241B] ${focusRing}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className={`inline-flex items-center gap-1.5 rounded-full bg-[#2C241B] px-4 py-2 text-sm font-semibold text-[#FFFDF8] disabled:opacity-50 ${focusRing}`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PostCard({ post, onVote, onReply, voteBusy, isReply = false }) {
  return (
    <div
      className={`rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-3.5 ${
        isReply ? 'ml-4 border-l-2 border-l-[#C4A574]/50 sm:ml-6' : ''
      }`}
    >
      <div className="flex gap-3">
        <Avatar src={post.userId?.profilePicture} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#1C1917]">
              @{post.userId?.username || 'user'}
            </p>
            {post.createdAt && (
              <p className="text-[11px] text-[#A89B8A]">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            )}
          </div>
          {post.body ? (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#2C241B]">
              {post.body}
            </p>
          ) : null}
          <CodeBlock code={post.code} language={post.codeLanguage} />
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <VoteButtons post={post} onVote={onVote} busy={voteBusy} />
            {!isReply && (
              <button
                type="button"
                onClick={() => onReply(post)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <MessageCircle size={14} className="text-[#C4A574]" /> Reply
                {post.replyCount > 0 ? ` (${post.replyCount})` : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DsaDiscussionPanel({ slug, languages = CODE_LANGS }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [voteBusyId, setVoteBusyId] = useState(null);
  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const loadPage = useCallback(
    async (pageNum, { append } = { append: false }) => {
      if (append) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await fetchDsaDiscussions(slug, { page: pageNum, limit: PAGE_SIZE });
        const next = data.discussions || [];
        setItems((prev) => (append ? [...prev, ...next] : next));
        setHasMore(Boolean(data.hasMore));
        setTotal(data.total || 0);
        setPage(pageNum);
      } catch {
        if (!append) setItems([]);
        toast.error('Could not load discussions');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [slug],
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    loadPage(1, { append: false });
  }, [slug, loadPage]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMoreRef.current && !loading) {
          loadPage(page + 1, { append: true });
        }
      },
      { root, rootMargin: '120px', threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, page, loadPage, loading, items.length]);

  const patchVote = (id, payload) => {
    const apply = (p) =>
      String(p._id) === String(id)
        ? { ...p, myVote: payload.myVote, upvotes: payload.upvotes, downvotes: payload.downvotes }
        : p;
    setItems((prev) =>
      prev.map((t) => ({
        ...apply(t),
        replies: (t.replies || []).map(apply),
      })),
    );
  };

  const onVote = async (id, value) => {
    setVoteBusyId(id);
    try {
      const data = await voteDsaDiscussion(id, value);
      patchVote(id, data);
    } catch {
      toast.error('Could not update vote');
    } finally {
      setVoteBusyId(null);
    }
  };

  const onCreatePost = async ({ body, code, codeLanguage }) => {
    const { discussion } = await createDsaDiscussion(slug, {
      title: 'Discussion',
      body,
      code,
      codeLanguage,
    });
    setItems((prev) => [{ ...discussion, replies: [], replyCount: 0, myVote: 0 }, ...prev]);
    setTotal((t) => t + 1);
    toast.success('Posted');
  };

  const onCreateReply = async ({ body, code, codeLanguage }) => {
    if (!replyTo) return;
    const parentId = replyTo._id;
    const { discussion } = await createDsaDiscussion(slug, {
      body,
      code,
      codeLanguage,
      parentId,
    });
    setItems((prev) =>
      prev.map((t) => {
        if (String(t._id) !== String(parentId)) return t;
        return {
          ...t,
          replyCount: (t.replyCount || 0) + 1,
          replies: [...(t.replies || []), { ...discussion, myVote: 0 }],
        };
      }),
    );
    toast.success('Reply posted');
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#FFFDF8]">
      <div className="shrink-0 border-b border-[#E5DCCE] px-4 py-3">
        <p className="font-display text-base font-semibold text-[#1C1917]">Discussion</p>
        <p className="text-xs text-[#78716C]">
          {loading ? 'Loading…' : `${total} thread${total === 1 ? '' : 's'}`}
        </p>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16 text-[#6B5A48]">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#F7F3EC]/50 px-4 py-12 text-center">
            <MessageCircle className="mx-auto text-[#C4A574]" size={28} />
            <p className="font-display mt-3 text-base font-semibold text-[#1C1917]">
              Start the conversation
            </p>
            <p className="mt-1 text-sm text-[#78716C]">
              Tap + to share an approach, question, or code snippet.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 pb-16">
            {items.map((d) => (
              <li key={d._id} className="space-y-2">
                <PostCard
                  post={d}
                  onVote={onVote}
                  onReply={setReplyTo}
                  voteBusy={voteBusyId === d._id}
                />
                {(d.replies || []).map((r) => (
                  <PostCard
                    key={r._id}
                    post={r}
                    onVote={onVote}
                    onReply={() => {}}
                    voteBusy={voteBusyId === r._id}
                    isReply
                  />
                ))}
              </li>
            ))}
            <li ref={sentinelRef} className="h-4" aria-hidden />
            {loadingMore && (
              <li className="flex justify-center py-3 text-[#6B5A48]">
                <Loader2 className="animate-spin" size={18} />
              </li>
            )}
            {!hasMore && items.length > 0 && (
              <li className="pb-2 text-center text-[11px] text-[#A89B8A]">You&apos;re all caught up</li>
            )}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        className={`absolute bottom-4 right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2C241B] text-[#FFFDF8] shadow-[0_12px_28px_-10px_rgba(44,36,27,0.55)] transition hover:bg-[#3D3228] ${focusRing}`}
        aria-label="New discussion"
      >
        <Plus size={22} />
      </button>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={onCreatePost}
        title="New discussion"
        submitLabel="Post"
        languages={languages}
      />
      <ComposeModal
        open={Boolean(replyTo)}
        onClose={() => setReplyTo(null)}
        onSubmit={onCreateReply}
        title={replyTo ? `Reply to @${replyTo.userId?.username || 'user'}` : 'Reply'}
        submitLabel="Reply"
        languages={languages}
      />
    </div>
  );
}
