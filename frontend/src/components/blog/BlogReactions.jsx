import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchMyReaction, reactToBlog } from '../../lib/blog-api';
import { focusRing } from '../../theme/tokens';

export default function BlogReactions({ slug, likes: initialLikes = 0, dislikes: initialDislikes = 0, compact = false }) {
  const { currentUser } = useSelector((state) => state.user);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [reaction, setReaction] = useState(null);

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [initialLikes, initialDislikes]);

  useEffect(() => {
    if (currentUser) {
      fetchMyReaction(slug).then(setReaction).catch(() => {});
    }
  }, [slug, currentUser]);

  const handleReact = async (type) => {
    if (!currentUser) {
      toast.error('Please sign in to react');
      return;
    }

    const nextType = reaction === type ? null : type;

    try {
      const result = await reactToBlog(slug, nextType);
      const { action, type: newType } = result;

      if (action === 'removed') {
        if (reaction === 'like') setLikes((l) => l - 1);
        if (reaction === 'dislike') setDislikes((d) => d - 1);
        setReaction(null);
      } else if (action === 'added') {
        if (newType === 'like') setLikes((l) => l + 1);
        if (newType === 'dislike') setDislikes((d) => d + 1);
        setReaction(newType);
      } else if (action === 'switched') {
        if (newType === 'like') {
          setLikes((l) => l + 1);
          setDislikes((d) => d - 1);
        } else {
          setDislikes((d) => d + 1);
          setLikes((l) => l - 1);
        }
        setReaction(newType);
      }
    } catch {
      toast.error('Failed to update reaction');
    }
  };

  const btnClass = compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] p-1 ${compact ? '' : 'shadow-sm'}`}>
      <button
        type="button"
        onClick={() => handleReact('like')}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition ${btnClass} ${reaction === 'like' ? 'bg-[#2C241B] text-[#FFFDF8]' : 'text-[#6B5A48] hover:bg-[#F7F3EC]'} ${focusRing}`}
      >
        <ThumbsUp className={`h-3.5 w-3.5 ${reaction === 'like' ? 'fill-current' : ''}`} />
        {likes}
      </button>
      <button
        type="button"
        onClick={() => handleReact('dislike')}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium transition ${btnClass} ${reaction === 'dislike' ? 'bg-rose-600 text-white' : 'text-[#6B5A48] hover:bg-[#F7F3EC]'} ${focusRing}`}
      >
        <ThumbsDown className={`h-3.5 w-3.5 ${reaction === 'dislike' ? 'fill-current' : ''}`} />
        {dislikes}
      </button>
    </div>
  );
}
