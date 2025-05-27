import React from 'react';
import { motion } from 'framer-motion';
import { Building, User, Star, CheckCircle, XCircle, ExternalLink, Sparkles, Trophy } from 'lucide-react';

export default function InterviewSidebar({ 
  experiences, 
  selectedExperience, 
  onExperienceSelect, 
  isMobile = false, 
  isFullWidth = false 
}) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <motion.div
        key={index}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Star
          size={14}
          className={`${
            index < (rating || 0) 
              ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
              : 'text-slate-300/70'
          }`}
        />
      </motion.div>
    ));
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'selected') {
      return (
        <div className="relative">
          <CheckCircle size={16} className="text-emerald-500" />
          <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm"></div>
        </div>
      );
    } else if (verdict === 'rejected') {
      return (
        <div className="relative">
          <XCircle size={16} className="text-rose-500" />
          <div className="absolute -inset-1 bg-rose-500/20 rounded-full blur-sm"></div>
        </div>
      );
    }
    return null;
  };

  const getVerdictBadgeStyle = (verdict) => {
    if (verdict === 'selected') {
      return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-emerald-100/50';
    } else if (verdict === 'rejected') {
      return 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-700 border border-rose-200/50 shadow-rose-100/50';
    }
    return 'bg-gradient-to-r from-slate-500/10 to-gray-500/10 text-slate-600 border border-slate-200/50';
  };

  // Determine container classes based on the context
  const getContainerClasses = () => {
    const baseClasses = "backdrop-blur-xl bg-white/95 flex flex-col relative overflow-hidden w-full";
    
    if (isMobile && !isFullWidth) {
      return `${baseClasses} h-full`;
    } else if (isFullWidth) {
      return `${baseClasses} rounded-3xl shadow-2xl shadow-slate-900/10 border border-white/20`;
    } else {
      return `${baseClasses} rounded-3xl shadow-2xl shadow-slate-900/10 border border-white/20 h-[calc(100vh-120px)] max-w-none`;
    }
  };

  const getHeaderClasses = () => {
    if (isMobile && !isFullWidth) {
      return "hidden";
    } else {
      return "relative p-4 sm:p-6 lg:p-8 xl:p-10 border-b border-white/20 bg-gradient-to-br from-violet-50/80 via-indigo-50/60 to-purple-50/80 rounded-t-3xl overflow-hidden";
    }
  };

  const getListClasses = () => {
    if (isFullWidth) {
      return "overflow-y-auto max-h-[70vh] scrollbar-hide w-full";
    } else {
      return "flex-1 overflow-y-auto scrollbar-hide w-full";
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-indigo-50/30 pointer-events-none"></div>
      
      {/* Header */}
      <div className={getHeaderClasses()}>
        {/* Header background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-indigo-600/5 to-purple-600/5"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-28 h-28 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-3 mb-4 w-full">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles size={isMobile ? 20 : 24} className="text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/30 to-purple-600/30 rounded-2xl blur-lg"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent truncate">
                Interview Experiences
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse flex-shrink-0"></div>
                <p className="text-sm lg:text-base text-slate-600 font-medium truncate">
                  {experiences.length} premium insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience List */}
      <div className={getListClasses()}>
        <div className="p-2 w-full">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience._id}
              className={`relative mb-3 cursor-pointer transition-all duration-500 group overflow-hidden w-full ${
                selectedExperience?._id === experience._id
                  ? 'scale-[1.02] z-10'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => onExperienceSelect(experience)}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: isMobile ? 0 : -2,
                transition: { duration: 0.2 }
              }}
            >
              {/* Card container with glassmorphism effect */}
              <div className={`
                relative backdrop-blur-sm rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7 border transition-all duration-500 w-full
                ${selectedExperience?._id === experience._id
                  ? 'bg-gradient-to-br from-white/90 via-violet-50/30 to-purple-50/30 border-violet-200/60 shadow-xl shadow-violet-500/10'
                  : 'bg-white/80 border-slate-200/50 shadow-lg shadow-slate-900/5 hover:bg-white/95 hover:border-violet-200/40 hover:shadow-xl hover:shadow-violet-500/5'
                }
              `}>
                
                {/* Selected indicator */}
                {selectedExperience?._id === experience._id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-violet-500 to-purple-600 rounded-r-full shadow-lg shadow-violet-500/30"></div>
                )}

                {/* Floating particles for selected card */}
                {selectedExperience?._id === experience._id && (
                  <>
                    <div className="absolute top-4 right-4 w-1 h-1 bg-violet-400 rounded-full animate-ping"></div>
                    <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  </>
                )}

                {/* Company and Position */}
                <div className="mb-4 lg:mb-5 w-full">
                  <div className="flex items-start justify-between gap-3 mb-3 w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Building size={16} className="text-slate-600" />
                        </div>
                        {selectedExperience?._id === experience._id && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl blur-sm"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg lg:text-xl leading-tight line-clamp-1 bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                          {experience.company || 'Unknown Company'}
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 font-medium line-clamp-1 mt-0.5">
                          {experience.position || 'Unknown Position'}
                        </p>
                      </div>
                    </div>
                    
                    {/* External link icon with premium styling */}
                    {isFullWidth && (
                      <motion.div 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                          <ExternalLink size={16} className="text-violet-600" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Metadata with premium badges */}
                <div className="flex flex-col gap-3 mb-4 w-full">
                  <div className="flex items-center gap-2 flex-wrap w-full">
                    {/* YOE Badge */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100/80 to-slate-200/60 px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm backdrop-blur-sm flex-shrink-0">
                      <User size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="whitespace-nowrap">{experience.yoe || 'N/A'} YOE</span>
                    </div>

                    {/* Verdict Badge */}
                    <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-sm flex-shrink-0 ${getVerdictBadgeStyle(experience.verdict)}`}>
                      {getVerdictIcon(experience.verdict)}
                      <span className="whitespace-nowrap">
                        {experience.verdict ? 
                          experience.verdict.charAt(0).toUpperCase() + experience.verdict.slice(1) 
                          : 'Pending'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Premium Rating */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50/80 to-yellow-50/60 px-3 py-1.5 rounded-xl border border-amber-200/40 shadow-sm backdrop-blur-sm w-fit">
                    <Trophy size={12} className="text-amber-600 flex-shrink-0" />
                    <div className="flex items-center gap-1">
                      {renderStars(experience.rating)}
                    </div>
                  </div>
                </div>

                {/* Preview with glassmorphism */}
                <div className="relative bg-gradient-to-br from-slate-50/80 to-slate-100/40 rounded-xl p-3 sm:p-4 border border-slate-200/30 backdrop-blur-sm overflow-hidden w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <p className="relative text-xs sm:text-sm lg:text-base text-slate-700 line-clamp-2 lg:line-clamp-3 leading-relaxed font-medium break-words">
                    {experience.experience?.substring(0, isMobile ? 120 : 180)}{experience.experience?.length > (isMobile ? 120 : 180) ? '...' : ''}
                  </p>
                </div>

                {/* Premium hover hint */}
                {isFullWidth && (
                  <motion.div 
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-violet-600 font-semibold bg-gradient-to-r from-violet-50/80 to-purple-50/60 px-3 py-2 rounded-lg border border-violet-200/40 w-fit">
                      <Sparkles size={12} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">Click to explore detailed insights</span>
                      <ExternalLink size={12} className="flex-shrink-0" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
    </div>
  );
}