import React, { useState } from 'react';
import { ChevronRight, Building, User, Calendar, Star, Copy, ExternalLink, Linkedin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InterviewCommentSection from './InterviewCommentSection';

export default function InterviewCard({ experience }) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!experience) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLinkedInClick = (linkedinUrl) => {
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleViewDetails = () => {
    // Navigate directly to the interview details page using the ID
    navigate(`/interview/${experience._id}`);
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return 'No experience details available.';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <motion.div
        className="group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {experience.company || 'Unknown Company'}
                  </h3>
                  <p className="text-gray-600 truncate">
                    {experience.position || 'Unknown Position'}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700">
                  <User size={12} className="mr-1" />
                  {experience.yoe || 'N/A'} YOE
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                  experience.verdict === 'selected' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {experience.verdict ? (
                    experience.verdict.charAt(0).toUpperCase() + experience.verdict.slice(1)
                  ) : (
                    'N/A'
                  )}
                </span>
                <div className="flex items-center px-2.5 py-1 rounded-lg bg-amber-50">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={12}
                      className={`${
                        index < (experience.rating || 0) ? 'text-amber-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {truncateText(experience.experience)}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCommentModalOpen(true);
                    }}
                    className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Comments
                  </motion.button>
                  
                  {experience.linkedin !== 'Not Provided' && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkedInClick(experience.linkedin);
                      }}
                      className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Linkedin size={16} className="mr-1" />
                      Connect
                    </motion.button>
                  )}
                </div>
                
                <motion.button
                  onClick={handleViewDetails}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 group-hover:translate-x-1 transition-all"
                >
                  Read more
                  <ChevronRight size={16} className="ml-1" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comments Modal */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Discussion</h3>
                    <p className="text-indigo-200 text-sm mt-1">
                      {experience.company} - {experience.position}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCommentModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink size={20} className="rotate-45" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-6">
                  <InterviewCommentSection expId={experience._id} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 