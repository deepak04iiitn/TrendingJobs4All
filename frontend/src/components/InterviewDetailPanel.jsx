import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  User, 
  Star, 
  Copy, 
  Linkedin, 
  MessageCircle, 
  ExternalLink,
  Calendar,
  Award,
  X
} from 'lucide-react';
import InterviewCommentSection from './InterviewCommentSection';

export default function InterviewDetailPanel({ experience }) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!experience) {
    return (
      <div className="bg-gray-950 rounded-2xl shadow-xl border border-gray-800 h-[50vh] lg:h-[calc(100vh-120px)] flex items-center justify-center w-full">
        <div className="text-center text-gray-400 p-6">
          <Building size={48} className="mx-auto mb-4 lg:mb-6 opacity-50" />
          <p className="text-lg lg:text-2xl font-medium mb-2 text-gray-300">Select an interview experience</p>
          <p className="text-sm lg:text-lg text-gray-500">Choose from the list to view detailed information</p>
        </div>
      </div>
    );
  }

  const handleLinkedInClick = (linkedinUrl) => {
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleCopyExperience = () => {
    navigator.clipboard.writeText(experience.experience || '')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const formatExperience = (text) => {
    return text?.split(/(?<=\.|\:)/).map((item, index) => (
      <p key={index} className="mb-4 lg:mb-6 leading-relaxed text-sm lg:text-lg text-gray-200">
        {item.trim()}
      </p>
    )) || [];
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < (rating || 0) ? 'text-red-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const getDifficultyLabel = (rating) => {
    const labels = {
      1: 'Very Easy',
      2: 'Easy',
      3: 'Moderate',
      4: 'Hard',
      5: 'Very Hard'
    };
    return labels[rating] || 'Not Rated';
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <motion.div
        className="bg-gray-950 rounded-2xl shadow-xl border border-gray-800 h-[calc(100vh-200px)] lg:h-[calc(100vh-120px)] flex flex-col w-full"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        key={experience._id}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0 mb-4 lg:mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3 leading-tight">
                  {experience.company || 'Unknown Company'}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-3 lg:mb-4 font-medium">
                  {experience.position || 'Unknown Position'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                <motion.button
                  onClick={handleCopyExperience}
                  className={`p-2 lg:p-3 rounded-xl transition-all duration-200 shadow-sm ${
                    copied 
                      ? 'bg-emerald-600 text-emerald-100 shadow-emerald-900/50' 
                      : 'bg-gray-900 hover:bg-gray-800 text-gray-200 hover:shadow-lg border border-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy experience"
                >
                  <Copy size={16} className="lg:w-[18px] lg:h-[18px]" />
                </motion.button>
                
                {experience.linkedin !== 'Not Provided' && (
                  <motion.button
                    onClick={() => handleLinkedInClick(experience.linkedin)}
                    className="p-2 lg:p-3 rounded-xl bg-blue-600 text-blue-100 hover:bg-blue-500 transition-all duration-200 shadow-sm hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Open LinkedIn profile"
                  >
                    <Linkedin size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={() => setIsCommentModalOpen(true)}
                  className="p-2 lg:p-3 rounded-xl bg-indigo-600 text-indigo-100 hover:bg-indigo-500 transition-all duration-200 shadow-sm hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="View comments"
                >
                  <MessageCircle size={16} className="lg:w-[18px] lg:h-[18px]" />
                </motion.button>
              </div>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 lg:gap-4">
              <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-sm lg:text-base font-semibold bg-indigo-600 text-indigo-100 shadow-sm">
                <User size={14} className="mr-1.5 lg:mr-2" />
                {experience.yoe || 'N/A'} YOE
              </span>
              
              <span className={`inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-sm lg:text-base font-semibold shadow-sm ${
                experience.verdict === 'selected' 
                  ? 'bg-emerald-600 text-emerald-100' 
                  : experience.verdict === 'rejected'
                  ? 'bg-rose-600 text-rose-100'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <Award size={14} className="mr-1.5 lg:mr-2" />
                {experience.verdict ? (
                  experience.verdict.charAt(0).toUpperCase() + experience.verdict.slice(1)
                ) : (
                  'N/A'
                )}
              </span>
              
              <div className="flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full bg-red-600 shadow-sm text-white text-sm lg:text-base font-semibold">
                <div className="flex items-center mr-2">
                  {renderStars(experience.rating)}
                </div>
                <span className="text-xs lg:text-sm">
                  {getDifficultyLabel(experience.rating)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg lg:text-2xl font-bold text-white mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
              <MessageCircle size={20} className="text-indigo-400 lg:w-6 lg:h-6" />
              Interview Experience
            </h2>
            
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-inner border border-gray-800">
              <div className="prose prose-sm lg:prose-lg prose-gray max-w-none">
                {formatExperience(experience.experience)}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Comments Modal - Enhanced and Responsive */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm p-4 lg:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-950 rounded-2xl lg:rounded-3xl shadow-2xl w-full h-full lg:h-[85vh] lg:max-w-4xl flex flex-col border border-gray-800"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-t-2xl lg:rounded-t-3xl text-white">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 lg:mb-2">Discussion Forum</h3>
                    <p className="text-indigo-200 text-sm sm:text-base lg:text-lg truncate">
                      {experience.company} - {experience.position}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCommentModalOpen(false)}
                    className="p-2 lg:p-3 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0 ml-4"
                  >
                    <X size={20} className="lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden bg-gray-950">
                <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <InterviewCommentSection expId={experience._id} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}