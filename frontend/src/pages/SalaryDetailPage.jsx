import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X, Building, MapPin, Linkedin, Award, DollarSign, TrendingUp, Users, Target, Banknote, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalaryCommentSection from '../components/SalaryCommentSection';

export default function SalaryDetailPage() {
  const { id } = useParams();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const response = await fetch(`/backend/salary/getSalary/${id}`);
        if (!response.ok) throw new Error('Failed to fetch salary');
        const data = await response.json();
        setSalary(data);
        setLikes(data?.numberOfLikes || 0);
        setDislikes(data?.numberOfDislikes || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!salary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">No salary data found.</div>
      </div>
    );
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

  return (
    <>
      {/* Regular page content - navbar and footer will be visible */}
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 pt-20 pb-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%)] bg-[length:20px_20px]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <motion.div 
            className="px-8 py-6 border-b border-white/10 backdrop-blur-xl bg-white/5 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{salary.position}</h1>
                    <p className="text-indigo-200">{salary.company} • {salary.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white">
                    <span className="text-sm font-medium">{salary.yearsOfExperience} years experience</span>
                  </div>
                  {salary.linkedin && salary.linkedin !== 'Not Provided' && (
                    <motion.button
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center gap-2 transition-colors"
                      onClick={() => handleLinkedInClick(salary.linkedin)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin size={16} />
                      <span>Connect</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto px-8">
            {/* Compensation Overview */}
            <motion.div
              className="mb-8 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-400" size={24} />
                Compensation Breakdown
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl mb-3">
                    <DollarSign className="mx-auto text-green-400" size={32} />
                  </div>
                  <p className="text-3xl font-bold text-white">{salary.ctc}</p>
                  <p className="text-green-400 font-medium">Total CTC (LPA)</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl mb-3">
                    <Banknote className="mx-auto text-blue-400" size={32} />
                  </div>
                  <p className="text-2xl font-bold text-white">{salary.salary || 'N/A'}</p>
                  <p className="text-blue-400 font-medium">Base Salary</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl mb-3">
                    <Target className="mx-auto text-purple-400" size={32} />
                  </div>
                  <p className="text-2xl font-bold text-white">{salary.bonus || 'N/A'}</p>
                  <p className="text-purple-400 font-medium">Annual Bonus</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-2xl mb-3">
                    <TrendingUp className="mx-auto text-orange-400" size={32} />
                  </div>
                  <p className="text-2xl font-bold text-white">{salary.stockBonus || 'N/A'}</p>
                  <p className="text-orange-400 font-medium">Stock Bonus</p>
                </div>
              </div>
            </motion.div>

            {/* Professional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-indigo-400" size={20} />
                  Professional Background
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Education</span>
                    <span className="text-white font-medium">{salary.education}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Experience</span>
                    <span className="text-white font-medium">{salary.yearsOfExperience} years</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Prior Experience</span>
                    <span className="text-white font-medium">{salary.priorExperience || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Position Level</span>
                    <span className="text-white font-medium">{salary.position}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building className="text-purple-400" size={20} />
                  Company Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Company</span>
                    <span className="text-white font-medium">{salary.company}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Location</span>
                    <span className="text-white font-medium">{salary.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-gray-300">Signing Bonus</span>
                    <span className="text-white font-medium">{salary.relocationSigningBonus || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Benefits</span>
                    <span className="text-white font-medium">{salary.benefits || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Additional Details */}
            {salary.otherDetails && (
              <motion.div
                className="mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Additional Information</h3>
                <p className="text-gray-300 leading-relaxed">{salary.otherDetails}</p>
              </motion.div>
            )}

            {/* Interaction Bar */}
            <motion.div
              className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-6">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  onClick={handleLike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp size={18} />
                  <span>{likes}</span>
                </motion.button>
                
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  onClick={handleDislike}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsDown size={18} />
                  <span>{dislikes}</span>
                </motion.button>
              </div>
              
              <motion.button
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
                onClick={() => setIsCommentModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={18} />
                <span>Join Discussion</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Comment Modal */}
      <AnimatePresence>
        {isCommentModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommentModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Discussion</h3>
                    <p className="text-indigo-200 text-sm mt-1">Share your thoughts about this salary</p>
                  </div>
                  <button
                    onClick={() => setIsCommentModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <SalaryCommentSection salId={salary._id} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}