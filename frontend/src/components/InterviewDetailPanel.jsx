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
  Award
} from 'lucide-react';
import InterviewCommentSection from './InterviewCommentSection';

export default function InterviewDetailPanel({ experience }) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!experience) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Building size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select an interview experience to view details</p>
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
      <p key={index} className="mb-4 leading-relaxed">
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
          index < (rating || 0) ? 'text-amber-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        key={experience._id} // Add key for re-animation when experience changes
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {experience.company || 'Unknown Company'}
                </h1>
                <p className="text-lg text-gray-600 mb-3">
                  {experience.position || 'Unknown Position'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={handleCopyExperience}
                  className={`p-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy experience"
                >
                  <Copy size={16} />
                </motion.button>
                
                {experience.linkedin !== 'Not Provided' && (
                  <motion.button
                    onClick={() => handleLinkedInClick(experience.linkedin)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Open LinkedIn profile"
                  >
                    <Linkedin size={16} />
                  </motion.button>
                )}
                
                <motion.button
                  onClick={() => setIsCommentModalOpen(true)}
                  className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="View comments"
                >
                  <MessageCircle size={16} />
                </motion.button>
              </div>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <User size={14} className="mr-1" />
                {experience.yoe || 'N/A'} YOE
              </span>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                experience.verdict === 'selected' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : experience.verdict === 'rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <Award size={14} className="mr-1" />
                {experience.verdict ? (
                  experience.verdict.charAt(0).toUpperCase() + experience.verdict.slice(1)
                ) : (
                  'N/A'
                )}
              </span>
              
              <div className="flex items-center px-3 py-1 rounded-full bg-amber-100">
                {renderStars(experience.rating)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Experience</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              {formatExperience(experience.experience)}
            </div>
          </motion.div>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col"
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