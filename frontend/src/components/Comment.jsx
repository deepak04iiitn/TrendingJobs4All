import { useEffect, useState } from 'react';
import moment from 'moment';
import { ThumbsUp } from 'lucide-react';
import { useSelector } from 'react-redux';
import { focusRing } from '../theme/tokens';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/backend/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) setUser(data);
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
      const res = await fetch(`/backend/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent }),
      });

      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const liked = currentUser && comment.likes?.includes(currentUser._id);
  const canManage =
    currentUser && (currentUser._id === comment.userId || currentUser.isAdmin);

  return (
    <article className="jd-comment">
      <img
        src={user.profilePicture}
        alt={user.username || 'User'}
        className="jd-comment__avatar"
      />

      <div className="min-w-0 flex-1">
        <div className="jd-comment__meta">
          <span className="jd-comment__user">
            {user?.username ? `@${user.username}` : 'anonymous user'}
          </span>
          <span className="jd-comment__time">{moment(comment.createdAt).fromNow()}</span>
        </div>

        {isEditing ? (
          <>
            <textarea
              className={`jd-comments__textarea ${focusRing}`}
              value={editedContent}
              maxLength={200}
              rows={3}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="jd-comment__edit-actions">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`jd-comment__btn jd-comment__btn--ghost ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`jd-comment__btn jd-comment__btn--primary ${focusRing}`}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="jd-comment__body">{comment.content}</p>
            <div className="jd-comment__actions">
              <button
                type="button"
                onClick={() => onLike(comment._id)}
                className={`jd-comment__action ${liked ? 'is-liked' : ''} ${focusRing}`}
                aria-label="Like comment"
              >
                <ThumbsUp size={14} className={liked ? 'fill-current' : ''} aria-hidden />
                {comment.numberOfLikes > 0
                  ? `${comment.numberOfLikes} ${comment.numberOfLikes === 1 ? 'like' : 'likes'}`
                  : 'Like'}
              </button>

              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className={`jd-comment__action ${focusRing}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(comment._id)}
                    className={`jd-comment__action is-danger ${focusRing}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
