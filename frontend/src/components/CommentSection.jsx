import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Comment from './Comment';
import { easeOut } from './home/motion.jsx';
import { focusRing } from '../theme/tokens';
import '../styles/Comments.css';

export default function CommentSection({ jobId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const remaining = 200 - comment.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200 || !comment.trim()) return;

    try {
      const res = await fetch('/backend/comment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment, jobId, userId: currentUser._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
      } else {
        setCommentError(data.message || 'Unable to post comment');
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/backend/comment/getJobComments/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getComments();
  }, [jobId]);

  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showModal]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }

      const res = await fetch(`/backend/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });

      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((item) =>
            item._id === commentId
              ? {
                  ...item,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : item
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEdit = async (item, editedContent) => {
    setComments(
      comments.map((c) => (c._id === item._id ? { ...c, content: editedContent } : c))
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);

    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }

      const res = await fetch(`/backend/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setComments(comments.filter((item) => item._id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="jd-comments">
      {currentUser ? (
        <div className="jd-comments__identity">
          <span>Signed in as</span>
          <img src={currentUser.profilePicture} alt="" />
          <Link to="/dashboard?tab=profile">@{currentUser.username}</Link>
        </div>
      ) : (
        <div className="jd-comments__identity">
          <span>Sign in to join the discussion.</span>
          <Link to="/sign-in">Sign in</Link>
        </div>
      )}

      {currentUser && (
        <form className="jd-comments__composer" onSubmit={handleSubmit}>
          <textarea
            className={`jd-comments__textarea ${focusRing}`}
            placeholder="Share a tip, question or insight about this role..."
            rows={3}
            maxLength={200}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <div className="jd-comments__composer-foot">
            <p className="jd-comments__count">{remaining} characters left</p>
            <button
              type="submit"
              disabled={!comment.trim()}
              className={`jd-comments__submit ${focusRing}`}
            >
              Post comment
            </button>
          </div>
          {commentError && <div className="jd-comments__error">{commentError}</div>}
        </form>
      )}

      {comments.length === 0 ? (
        <p className="jd-comments__empty">No comments yet. Be the first to start the thread.</p>
      ) : (
        <>
          <div className="jd-comments__list-head">
            <h3 className="jd-comments__list-title">Comments</h3>
            <span className="jd-comments__badge">{comments.length}</span>
          </div>

          <ul>
            {comments.map((item, i) => (
              <motion.li
                key={item._id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.35, ease: easeOut }}
              >
                <Comment
                  comment={item}
                  onLike={handleLike}
                  onEdit={handleEdit}
                  onDelete={(commentId) => {
                    setShowModal(true);
                    setCommentToDelete(commentId);
                  }}
                />
              </motion.li>
            ))}
          </ul>
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              className="jd-comment-modal-backdrop"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="jd-delete-title"
              className="jd-comment-modal"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: easeOut }}
            >
              <h3 id="jd-delete-title">Delete comment?</h3>
              <p>This cannot be undone.</p>
              <div className="jd-comment-modal__actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`jd-comment__btn jd-comment__btn--ghost ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(commentToDelete)}
                  className={`jd-comment__btn jd-comment__btn--primary ${focusRing}`}
                  style={{ background: '#2C241B' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
