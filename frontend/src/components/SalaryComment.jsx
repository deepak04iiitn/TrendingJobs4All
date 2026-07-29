import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { ThumbsUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { focusRing } from '../theme/tokens';

export default function SalaryComment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/backend/user/${comment.userId}`);
        const data = await res.json();

        if (res.ok) {
          setUser(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    getUser();
  }, [comment]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/backend/salaryComments/editComment/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const hasLiked = Boolean(currentUser && comment.likes.includes(currentUser._id));
  const canModify = Boolean(
    currentUser && (currentUser._id === comment.userId || currentUser.isAdmin)
  );

  return (
    <div className="flex gap-3 border-b border-[#E5DCCE] py-4 text-sm">
      <img
        src={user.profilePicture}
        alt={user.username}
        className="h-9 w-9 shrink-0 rounded-full bg-[#F7F3EC] object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-[#2C241B]">
            {user ? `@${user.username}` : 'anonymous user'}
          </span>
          <span className="text-xs text-[#78716C]">{moment(comment.createdAt).fromNow()}</span>
        </div>

        {isEditing ? (
          <>
            <textarea
              className={`mb-2 w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleSave}
                className={`rounded-lg border border-[#2C241B] bg-[#2C241B] px-3 py-1.5 font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-1.5 font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pb-2 leading-relaxed text-[#57534E]">{comment.content}</p>
            <div className="flex max-w-fit items-center gap-3 border-t border-[#E5DCCE] pt-2 text-xs">
              <button
                type="button"
                onClick={() => onLike(comment._id)}
                aria-label={hasLiked ? 'Unlike comment' : 'Like comment'}
                className={`text-[#78716C] transition hover:text-[#C4A574] ${hasLiked ? 'text-[#C4A574]' : ''} ${focusRing}`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${hasLiked ? 'fill-current' : ''}`} />
              </button>
              {comment.numberOfLikes > 0 && (
                <p className="text-[#78716C]">
                  {comment.numberOfLikes} {comment.numberOfLikes === 1 ? 'like' : 'likes'}
                </p>
              )}
              {canModify && (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className={`text-[#78716C] transition hover:text-[#2C241B] ${focusRing}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment._id)}
                    className={`text-[#78716C] transition hover:text-rose-600 ${focusRing}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
