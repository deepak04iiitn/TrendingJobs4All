import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PollCard from '../components/PollCard';
import { Spinner, Button } from 'flowbite-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyPolls = () => {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyPolls();
  }, []);

  const fetchMyPolls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/backend/polls/my');
      if (Array.isArray(response.data)) {
        setPolls(response.data);
      } else {
        throw new Error('Received invalid data format');
      }
    } catch (error) {
      console.error('Error fetching my polls:', error);
      setError('Failed to fetch your polls. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    try {
      await axios.delete(`/backend/polls/${pollId}`);
      setPolls(polls.filter((poll) => poll._id !== pollId));
    } catch (error) {
      console.error('Error deleting poll:', error);
      setError('Failed to delete the poll. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-rose-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center items-center h-screen relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-[0_20px_80px_-12px_rgba(0,0,0,0.15)] border border-white/60">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-indigo-100 border-t-indigo-400 rounded-full animate-spin animation-delay-150" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                  Loading Your Polls
                </h3>
                <p className="text-slate-500 font-medium">Please wait while we fetch your content...</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-rose-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center h-screen relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-[0_20px_80px_-12px_rgba(0,0,0,0.15)] border border-white/60 max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-slate-600 mb-6">{error}</p>
              </div>
              <button
                onClick={fetchMyPolls}
                className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-300/40"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-rose-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse animation-delay-300" />
      <div className="absolute bottom-32 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse animation-delay-700" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/8 to-yellow-400/8 rounded-full blur-3xl animate-pulse animation-delay-500" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse animation-delay-1000" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-12 relative z-10"
      >
        {/* Premium Header Section */}
        <div className="flex flex-col items-center mb-16">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center"
          >
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-slate-800 via-violet-700 to-indigo-700 bg-clip-text text-transparent leading-tight mb-4 mt-16">
                My Polls
              </h1>
              
              {/* Decorative elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-12 h-12 border-4 border-violet-300/40 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-indigo-400/60 to-violet-400/60 rounded-full blur-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <motion.div
              className="w-32 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full mx-auto mb-6 relative overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center max-w-2xl"
          >
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              Manage and track all your polls in one elegant dashboard
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/60 inline-flex">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
              <span className="text-slate-600 text-sm font-semibold">Live Dashboard</span>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        {polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-16 shadow-[0_20px_80px_-12px_rgba(0,0,0,0.1)] border border-white/60 max-w-lg w-full text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">No polls yet</h3>
              <p className="text-slate-500 text-lg leading-relaxed">
                You haven't created any polls yet. Start engaging your audience by creating your first poll!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
          >
            <AnimatePresence mode="popLayout">
              {polls.map((poll, index) => (
                <motion.div
                  key={poll._id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      delay: index * 0.1,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -30, 
                    scale: 0.95,
                    transition: { duration: 0.3 }
                  }}
                  whileHover={{ y: -8 }}
                  className="h-[480px] w-full group"
                >
                  <div className="relative h-full w-full">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-200/20 to-indigo-200/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105" />
                    <div className="relative h-full w-full">
                      <PollCard poll={poll} onDelete={() => handleDelete(poll._id)} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* Footer Stats */}
        {polls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                <span className="text-slate-600 font-semibold">
                  {polls.length} Active {polls.length === 1 ? 'Poll' : 'Polls'}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
                <span className="text-slate-600 font-semibold">
                  {polls.reduce((total, poll) => total + poll.votes.length, 0)} Total Votes
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default MyPolls;