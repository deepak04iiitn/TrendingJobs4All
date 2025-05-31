import React, { useState } from 'react';
import { ChevronRight, X, Building, MapPin, Briefcase, Banknote, ThumbsUp, ThumbsDown, MessageCircle, Linkedin, Award, Calendar, DollarSign, TrendingUp, Users, Target, Eye, Star, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SalaryCommentSection from './SalaryCommentSection';

export default function SalaryComponent({ salary }) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [likes, setLikes] = useState(salary?.numberOfLikes || 0);
  const [dislikes, setDislikes] = useState(salary?.numberOfDislikes || 0);

  if (!salary) {
    return <div>Loading...</div>;
  }

  const handleLinkedInClick = (linkedinUrl) => {
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/backend/salary/likeSalary/${salary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to like salary');
      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
    } catch (error) {
      console.error('Error liking salary:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch(`/backend/salary/dislikeSalary/${salary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to dislike salary');
      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
    } catch (error) {
      console.error('Error disliking salary:', error);
    }
  };

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/salary/${salary._id}`;
    }
  };

  // Premium Modern Salary Card with InterviewSidebar Design
  const PremiumSalaryCard = () => (
    <motion.div
      className="relative mb-3 cursor-pointer transition-all duration-500 group overflow-hidden w-full"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -2,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
    >
      {/* Card container with glassmorphism effect */}
      <div className="relative backdrop-blur-sm rounded-2xl p-6 sm:p-7 lg:p-8 border transition-all duration-500 w-full bg-white/80 border-slate-200/50 shadow-lg shadow-slate-900/5 hover:bg-white/95 hover:border-violet-200/40 hover:shadow-xl hover:shadow-violet-500/5">
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-indigo-50/30 pointer-events-none rounded-2xl"></div>
        
        {/* Floating particles for hover effect */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute top-4 right-4 w-1 h-1 bg-violet-400 rounded-full animate-ping"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Header Section */}
        <div className="relative z-10 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Briefcase size={24} className="text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-2xl blur-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent line-clamp-1">
                  {salary.position}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <p className="text-slate-600 font-medium line-clamp-1">
                    {salary.yearsOfExperience} years experience
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {salary.linkedin && salary.linkedin !== 'Not Provided' && (
                <motion.button
                  className="w-10 h-10 bg-gradient-to-br from-slate-100/80 to-slate-200/60 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/50 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkedInClick(salary.linkedin);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin size={18} className="text-indigo-600" />
                </motion.button>
              )}
              <motion.div 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 15 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                  <ExternalLink size={18} className="text-violet-600" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Company and Location Section */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                  <Building size={18} className="text-slate-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Company</p>
                <p className="font-bold text-slate-800 text-lg">{salary.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin size={18} className="text-slate-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Location</p>
                <p className="font-bold text-slate-800">{salary.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* CTC Badge - Premium Style */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50/80 to-green-50/60 px-4 py-2.5 rounded-xl border border-emerald-200/40 shadow-sm backdrop-blur-sm">
              <div className="relative">
                <DollarSign size={16} className="text-emerald-600" />
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-emerald-700">₹{salary.ctc}</span>
                <span className="text-sm text-emerald-600 font-semibold ml-1">LPA</span>
              </div>
            </div>

            {/* Experience Badge */}
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100/80 to-slate-200/60 px-4 py-2.5 rounded-xl border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Trophy size={14} className="text-slate-500" />
              <span>{salary.yearsOfExperience} YOE</span>
            </div>

            {/* Education Badge */}
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 bg-gradient-to-r from-amber-50/80 to-yellow-50/60 px-4 py-2.5 rounded-xl border border-amber-200/40 shadow-sm backdrop-blur-sm">
              <Award size={14} className="text-amber-600" />
              <span>{salary.education}</span>
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative z-10 mb-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>

        {/* Engagement Actions */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like Button - Premium Style */}
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100/80 to-slate-200/60 hover:from-indigo-50/80 hover:to-indigo-100/60 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-200 border border-slate-200/50 hover:border-indigo-200/50 shadow-sm backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp size={16} />
              <span className="font-semibold">{likes}</span>
            </motion.button>
            
            {/* Dislike Button - Premium Style */}
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100/80 to-slate-200/60 hover:from-rose-50/80 hover:to-rose-100/60 text-slate-600 hover:text-rose-500 rounded-xl transition-all duration-200 border border-slate-200/50 hover:border-rose-200/50 shadow-sm backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDislike();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsDown size={16} />
              <span className="font-semibold">{dislikes}</span>
            </motion.button>
          </div>
          
          {/* Discuss Button - Premium Style */}
          <motion.button
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsCommentModalOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={16} />
            <span className="font-semibold">Discuss</span>
          </motion.button>
        </div>

        {/* Premium hover hint */}
        <motion.div 
          className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-violet-600 font-semibold bg-gradient-to-r from-violet-50/80 to-purple-50/60 px-3 py-2 rounded-lg border border-violet-200/40">
              <Sparkles size={12} />
              <span>Click to explore detailed insights</span>
              <ExternalLink size={12} />
            </div>
            <div className="text-xs bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 text-slate-600 font-medium">
              ID: {salary._id.slice(-6)}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <>
      <PremiumSalaryCard />

      {/* Comment Modal - Enhanced with Premium Design */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommentModalOpen(false)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-white/20"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header - Premium Style */}
              <div className="relative p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white rounded-t-3xl overflow-hidden">
                {/* Header background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20"></div>
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-28 h-28 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <h3 className="text-3xl font-bold">Discussion Forum</h3>
                    </div>
                    <p className="text-violet-100 text-lg font-medium">
                      Share insights about {salary.position} at {salary.company}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-violet-200 font-medium">
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        ₹{salary.ctc} LPA
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Trophy size={14} />
                        {salary.yearsOfExperience} years exp
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {salary.location}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsCommentModalOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-xl transition-colors duration-200 backdrop-blur-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50/80 to-white/90 backdrop-blur-sm">
                <SalaryCommentSection salId={salary._id} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}