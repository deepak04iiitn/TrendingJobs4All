import React from 'react';
import { motion } from 'framer-motion';
import { Building, User, Heart, MessageCircle, ExternalLink, Sparkles, Trophy, Linkedin, Phone, Briefcase } from 'lucide-react';

export default function ReferralSidebar({ 
  referrals, 
  selectedReferral, 
  onReferralSelect, 
  isMobile = false, 
  isFullWidth = false 
}) {
  
  const handleLinkedInClick = (e, linkedinUrl) => {
    e.stopPropagation();
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
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
      return "relative p-4 sm:p-6 lg:p-8 xl:p-10 border-b border-white/20 bg-gradient-to-br from-blue-50/80 via-green-50/60 to-teal-50/80 rounded-t-3xl overflow-hidden";
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-blue-50/30 pointer-events-none"></div>
      
      {/* Header */}
      <div className={getHeaderClasses()}>
        {/* Header background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-green-600/5 to-teal-600/5"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-28 h-28 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-3 mb-4 w-full">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles size={isMobile ? 20 : 24} className="text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-green-600/30 rounded-2xl blur-lg"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent truncate">
                Job Referrals
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                <p className="text-sm lg:text-base text-slate-600 font-medium truncate">
                  {referrals.length} opportunities available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div className={getListClasses()}>
        <div className="p-2 w-full">
          {referrals.map((referral, index) => (
            <motion.div
              key={referral._id}
              className={`relative mb-3 cursor-pointer transition-all duration-500 group overflow-hidden w-full ${
                selectedReferral?._id === referral._id
                  ? 'scale-[1.02] z-10'
                  : 'hover:scale-[1.01]'
              }`}
              onClick={() => onReferralSelect(referral)}
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
                ${selectedReferral?._id === referral._id
                  ? 'bg-gradient-to-br from-white/90 via-blue-50/30 to-green-50/30 border-blue-200/60 shadow-xl shadow-blue-500/10'
                  : 'bg-white/80 border-slate-200/50 shadow-lg shadow-slate-900/5 hover:bg-white/95 hover:border-blue-200/40 hover:shadow-xl hover:shadow-blue-500/5'
                }
              `}>
                
                {/* Selected indicator */}
                {selectedReferral?._id === referral._id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-green-600 rounded-r-full shadow-lg shadow-blue-500/30"></div>
                )}

                {/* Floating particles for selected card */}
                {selectedReferral?._id === referral._id && (
                  <>
                    <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                    <div className="absolute top-8 right-8 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  </>
                )}

                {/* Company and Positions */}
                <div className="mb-4 lg:mb-5 w-full">
                  <div className="flex items-start justify-between gap-3 mb-3 w-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Building size={16} className="text-slate-600" />
                        </div>
                        {selectedReferral?._id === referral._id && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl blur-sm"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg lg:text-xl leading-tight line-clamp-1 bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                          {referral.company || 'Unknown Company'}
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 font-medium line-clamp-1 mt-0.5">
                          {referral.positions?.length || 0} {referral.positions?.length === 1 ? 'Position' : 'Positions'} Available
                        </p>
                      </div>
                    </div>
                    
                    {/* LinkedIn button */}
                    {referral.linkedin && referral.linkedin !== 'Not Provided' && (
                      <motion.button
                        onClick={(e) => handleLinkedInClick(e, referral.linkedin)}
                        className="opacity-70 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg flex items-center justify-center hover:from-blue-500/20 hover:to-blue-600/20 transition-colors">
                          <Linkedin size={16} className="text-blue-600" />
                        </div>
                      </motion.button>
                    )}
                    
                    {/* External link icon */}
                    {isFullWidth && (
                      <motion.div 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg flex items-center justify-center">
                          <ExternalLink size={16} className="text-blue-600" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Positions Badge */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-100/80 to-blue-200/60 px-3 py-1.5 rounded-xl border border-blue-200/50 shadow-sm backdrop-blur-sm">
                    <Briefcase size={12} className="text-blue-500 flex-shrink-0" />
                    <span className="whitespace-nowrap">{referral.positions?.length || 0} Positions</span>
                  </div>

                  {/* Likes Badge */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 bg-gradient-to-r from-emerald-100/80 to-emerald-200/60 px-3 py-1.5 rounded-xl border border-emerald-200/50 shadow-sm backdrop-blur-sm">
                    <Heart size={12} className="text-emerald-500 flex-shrink-0 fill-current" />
                    <span className="whitespace-nowrap">{referral.numberOfLikes || 0}</span>
                  </div>

                  {/* Dislikes Badge */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-700 bg-gradient-to-r from-rose-100/80 to-rose-200/60 px-3 py-1.5 rounded-xl border border-rose-200/50 shadow-sm backdrop-blur-sm">
                    <Heart size={12} className="text-rose-500 flex-shrink-0 fill-current rotate-180" />
                    <span className="whitespace-nowrap">{referral.numberOfDislikes || 0}</span>
                  </div>
                </div>

                {/* Positions Preview */}
                <div className="relative bg-gradient-to-br from-slate-50/80 to-slate-100/40 rounded-xl p-3 sm:p-4 border border-slate-200/30 backdrop-blur-sm overflow-hidden w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <div className="relative">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-700 mb-2">Available Positions:</h4>
                    <div className="space-y-1">
                      {referral.positions?.slice(0, 2).map((position, idx) => (
                        <div key={idx} className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                          • {position.position}
                          {position.jobid && (
                            <span className="text-blue-600 ml-2">#{position.jobid}</span>
                          )}
                        </div>
                      ))}
                      {referral.positions?.length > 2 && (
                        <div className="text-xs text-slate-500 italic">
                          +{referral.positions.length - 2} more positions...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Premium hover hint */}
                {isFullWidth && (
                  <motion.div 
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-gradient-to-r from-blue-50/80 to-green-50/60 px-3 py-2 rounded-lg border border-blue-200/40 w-fit">
                      <Sparkles size={12} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">Click to view full details</span>
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