import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PollCard from '../components/PollCard';
import { Button, Spinner } from 'flowbite-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';

const PublicPolls = () => {
  const [polls, setPolls] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/backend/polls?page=${page}&limit=10`);
      const newPolls = response.data.filter(poll => poll && poll.question && poll.options && poll.options.length > 0);
      if (newPolls.length < 10) {
        setHasMore(false);
      }
      setPolls(prevPolls => [...prevPolls, ...newPolls]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to fetch polls. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30"
      >
        <div className="text-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 font-medium text-lg">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Floating orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-indigo-200/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12 relative z-10 mb-24"
      >
        {/* Premium Header Section */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Main heading with premium styling */}
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-6 border border-purple-200/50"
              >
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm font-semibold text-purple-700 tracking-wide">Community Insights</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-purple-700 to-blue-700">
                  Discover What
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
                  Matters Most
                </span>
              </h1>
              
              <p className="text-slate-600 text-xl md:text-2xl mb-12 font-light max-w-3xl mx-auto leading-relaxed">
                Join thousands in shaping opinions, discovering trends, and making your voice heard in our vibrant community
              </p>
            </div>
            
            {/* Premium feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: BarChart3,
                  title: "Real-Time Analytics",
                  description: "Watch live results unfold with beautiful data visualization",
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100/50",
                  delay: 0.1
                },
                {
                  icon: Users,
                  title: "Community Driven",
                  description: "Connect with like-minded individuals and perspectives",
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-50 to-blue-100/50",
                  delay: 0.2
                },
                {
                  icon: TrendingUp,
                  title: "Trending Topics",
                  description: "Stay ahead of the curve with emerging discussions",
                  gradient: "from-indigo-500 to-indigo-600",
                  bgGradient: "from-indigo-50 to-indigo-100/50",
                  delay: 0.3
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110`} />
                  <div className="relative p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-white/40">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-3 text-lg">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Polls Section */}
        {polls.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-slate-400" />
            </div>
            <p className="text-slate-500 text-xl font-medium">No polls available at the moment.</p>
            <p className="text-slate-400 mt-2">Check back soon for new community insights!</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
          >
            <AnimatePresence>
              {polls.map((poll, index) => (
                <motion.div
                  key={poll._id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="h-[450px] w-full group"
                >
                  <div className="relative h-full">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105" />
                    <div className="relative h-full bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                      <PollCard poll={poll} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
              <div className="relative">
                <Spinner size="lg" className="text-purple-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-sm opacity-20 animate-pulse" />
              </div>
              <span className="text-slate-600 font-medium">Loading amazing polls...</span>
            </div>
          </motion.div>
        )}
        
        {/* Load More Button */}
        {hasMore && !isLoading && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={fetchPolls}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 hover:from-purple-700 hover:via-purple-800 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center gap-3">
                <span className="text-lg">Discover More Polls</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PublicPolls;