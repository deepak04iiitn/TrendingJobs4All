import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalaryComment from './SalaryComment';
import { focusRing } from '../theme/tokens';

export default function SalaryCommentSection({ salId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.length > 200) {
      return;
    }

    try {
      const res = await fetch('/backend/salaryComments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment, salId, userId: currentUser._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/backend/salaryComments/getComments/${salId}`);

        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getComments();
  }, [salId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }

      const res = await fetch(`/backend/salaryComments/likeComment/${commentId}`, {
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

  const handleEdit = async (commentItem, editedContent) => {
    setComments(
      comments.map((c) => (c._id === commentItem._id ? { ...c, content: editedContent } : c))
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);

    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }

      const res = await fetch(`/backend/salaryComments/deleteComment/${commentId}`, {
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
    <div>
      {currentUser ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#78716C]">
          <p>Signed in as:</p>
          <img className="h-5 w-5 rounded-full object-cover" src={currentUser.profilePicture} alt="" />
          <Link
            to="/dashboard?tab=profile"
            className={`text-xs font-semibold text-[#2C241B] hover:underline ${focusRing}`}
          >
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="mb-4 flex gap-1.5 text-sm text-[#78716C]">
          You must be signed in to comment.
          <Link to="/sign-in" className={`font-semibold text-[#2C241B] hover:underline ${focusRing}`}>
            Sign in
          </Link>
        </div>
      )}

      {currentUser && (
        <form className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-4" onSubmit={handleSubmit}>
          <textarea
            placeholder="Add a comment..."
            rows={3}
            maxLength={200}
            onChange={(e) => setComment(e.target.value)}
            value={comment}
            className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-2.5 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-[#78716C]">{200 - comment.length} characters remaining</p>
            <button
              type="submit"
              className={`rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              Submit
            </button>
          </div>

          {commentError && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              {commentError}
            </div>
          )}
        </form>
      )}

      {comments.length === 0 ? (
        <p className="my-5 text-sm text-[#78716C]">No comments yet.</p>
      ) : (
        <>
          <div className="my-5 flex items-center gap-2 text-sm text-[#57534E]">
            <p>Comments</p>
            <span className="rounded-full border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-0.5 text-xs font-semibold text-[#6B5A48]">
              {comments.length}
            </span>
          </div>

          {comments.map((item) => (
            <SalaryComment
              key={item._id}
              comment={item}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
            />
          ))}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C241B]/45 p-4 backdrop-blur-[2px]"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 text-center shadow-[0_20px_45px_rgba(44,36,27,0.2)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <AlertTriangle className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-display mt-4 text-lg text-[#1C1917]">Delete this comment?</h3>
              <p className="mt-1 text-sm text-[#78716C]">This action cannot be undone.</p>
              <div className="mt-5 flex justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDelete(commentToDelete)}
                  className={`rounded-xl border border-rose-500 bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 ${focusRing}`}
                >
                  Yes, delete it
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                >
                  No, cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
