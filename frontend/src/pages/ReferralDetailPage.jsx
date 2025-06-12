import React, { useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Linkedin, Building2, User, Mail, Phone, Briefcase, Hash, ExternalLink, Heart, Share2, X } from 'lucide-react';
import ReferralCommentSection from '../components/referralCommentSection';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Modal Component
const CommentModal = ({ isOpen, onClose, referralId, companyName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Discussion</h2>
                  <p className="text-blue-100 text-sm">{companyName} Referral</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
            <ReferralCommentSection refId={referralId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReferralDetailPage() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/backend/referrals/getReferral/${id}`);
        if (!response.ok) throw new Error('Failed to fetch referral');
        const data = await response.json();
        setReferral(data);
        setLikes(data.numberOfLikes || 0);
        setDislikes(data.numberOfDislikes || 0);
        
        if (currentUser) {
          setIsLiked(data.likes.includes(currentUser._id));
          setIsDisliked(data.dislikes.includes(currentUser._id));
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [id, currentUser]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowCommentModal(false);
      }
    };

    if (showCommentModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showCommentModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral details...</p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Referral not found</p>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to like referrals');
      return;
    }

    try {
      const response = await fetch(`/backend/referrals/likeReferral/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like referral');
      }

      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setIsLiked(true);
      setIsDisliked(false);
    } catch (error) {
      console.error('Error liking referral:', error);
      toast.error('Failed to like referral');
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to dislike referrals');
      return;
    }

    try {
      const response = await fetch(`/backend/referrals/dislikeReferral/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to dislike referral');
      }

      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setIsLiked(false);
      setIsDisliked(true);
    } catch (error) {
      console.error('Error disliking referral:', error);
      toast.error('Failed to dislike referral');
    }
  };

  const handleLinkedInClick = (linkedinUrl) => {
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${referral.company} Referral Opportunity`,
        text: `Check out this referral opportunity at ${referral.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Share2 size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Building2 size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">{referral.company}</h1>
                  </div>
                  <p className="text-blue-100 text-lg">
                    {referral.positions.length} {referral.positions.length === 1 ? 'Position Available' : 'Positions Available'}
                  </p>
                </div>
                {referral.linkedin !== 'Not Provided' && (
                  <button
                    onClick={() => handleLinkedInClick(referral.linkedin)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <Linkedin size={20} />
                    <span className="font-medium">Connect</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Referrer Info */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Referred by</h3>
                  <p className="text-2xl font-bold text-blue-600">{referral.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Phone size={16} className="text-gray-500" />
                <span className="text-gray-700 font-medium">{referral.contact}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Positions */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Briefcase size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
              </div>
              
              <div className="space-y-4">
                {referral.positions.map((pos, index) => (
                  <div key={index} className="group bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {pos.position}
                        </h3>
                        {pos.jobid && pos.jobid !== 'Not found' && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Hash size={16} />
                            <span className="font-mono text-sm bg-white px-3 py-1 rounded-full">
                              {pos.jobid}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Apply */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 border border-green-100">
              <div className="text-center">
                <div className="inline-flex p-3 bg-green-100 rounded-2xl mb-4">
                  <Mail size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Apply?</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Send your CV and details to get started with your referral
                </p>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
                  <p className="text-gray-600 mb-2">Contact</p>
                  <p className="text-2xl font-bold text-green-600">{referral.contact}</p>
                </div>
                <div className="mt-6 p-4 bg-green-100 rounded-xl">
                  <p className="text-green-800 font-medium italic">
                    "Your next big opportunity awaits! Best of luck with your application!"
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Engagement */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Feedback</h3>
              <div className="space-y-4">
                <motion.button
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    isLiked 
                      ? 'bg-green-50 border-2 border-green-200 text-green-700' 
                      : 'bg-gray-50 hover:bg-green-50 text-gray-700'
                  }`}
                  onClick={handleLike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <ThumbsUp size={20} className={isLiked ? 'text-green-600' : 'text-gray-500'} />
                    <span className="font-medium">Helpful</span>
                  </div>
                  <span className="text-xl font-bold">{likes}</span>
                </motion.button>
                
                <motion.button
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    isDisliked 
                      ? 'bg-red-50 border-2 border-red-200 text-red-700' 
                      : 'bg-gray-50 hover:bg-red-50 text-gray-700'
                  }`}
                  onClick={handleDislike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <ThumbsDown size={20} className={isDisliked ? 'text-red-600' : 'text-gray-500'} />
                    <span className="font-medium">Not Helpful</span>
                  </div>
                  <span className="text-xl font-bold">{dislikes}</span>
                </motion.button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors text-blue-700"
                >
                  <MessageCircle size={18} />
                  <span className="font-medium">Join Discussion</span>
                </button>
                
                {referral.linkedin !== 'Not Provided' && (
                  <button
                    onClick={() => handleLinkedInClick(referral.linkedin)}
                    className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors"
                  >
                    <Linkedin size={18} />
                    <span className="font-medium">Connect on LinkedIn</span>
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-700"
                >
                  <Share2 size={18} />
                  <span className="font-medium">Share Referral</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Referral Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Positions</span>
                  <span className="text-2xl font-bold text-purple-600">{referral.positions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Community Likes</span>
                  <span className="text-2xl font-bold text-green-600">{likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Engagement Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.max(0, Math.round(((likes - dislikes) / Math.max(1, likes + dislikes)) * 100))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal 
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        referralId={referral._id}
        companyName={referral.company}
      />
    </div>
  );
}