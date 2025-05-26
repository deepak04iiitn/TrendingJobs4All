import React from 'react';
import { motion } from 'framer-motion';
import { Building, User, Star, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function InterviewSidebar({ 
  experiences, 
  selectedExperience, 
  onExperienceSelect, 
  isMobile = false, 
  isFullWidth = false 
}) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={12}
        className={`${
          index < (rating || 0) ? 'text-amber-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'selected') {
      return <CheckCircle size={14} className="text-emerald-600" />;
    } else if (verdict === 'rejected') {
      return <XCircle size={14} className="text-rose-600" />;
    }
    return null;
  };

  // Determine container classes based on the context
  const getContainerClasses = () => {
    if (isMobile && !isFullWidth) {
      return "bg-white h-full flex flex-col";
    } else if (isFullWidth) {
      return "bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col w-full";
    } else {
      return "bg-white rounded-2xl shadow-lg border border-gray-200 h-[calc(100vh-120px)] flex flex-col w-full max-w-none";
    }
  };

  const getHeaderClasses = () => {
    if (isMobile && !isFullWidth) {
      return "hidden"; // Header is already shown in the mobile overlay
    } else {
      return "p-4 sm:p-6 lg:p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl";
    }
  };

  const getListClasses = () => {
    if (isFullWidth) {
      return "overflow-y-auto max-h-[70vh]";
    } else {
      return "flex-1 overflow-y-auto";
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Header */}
      <div className={getHeaderClasses()}>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Interview Experiences</h2>
        <p className="text-sm lg:text-base text-gray-600">{experiences.length} experiences found</p>
      </div>

      {/* Experience List */}
      <div className={getListClasses()}>
        {experiences.map((experience, index) => (
          <motion.div
            key={experience._id}
            className={`p-4 sm:p-5 lg:p-6 border-b border-gray-100 cursor-pointer transition-all duration-300 group ${
              selectedExperience?._id === experience._id
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500 shadow-sm'
                : 'hover:bg-gray-50 hover:shadow-md'
            }`}
            onClick={() => onExperienceSelect(experience)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: isMobile ? 0 : 6, scale: isMobile ? 1 : 1.01 }}
          >
            {/* Company and Position */}
            <div className="mb-3 lg:mb-4">
              <div className="flex items-center justify-between gap-2 lg:gap-3 mb-2">
                <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                  <Building size={16} className="text-indigo-600 flex-shrink-0" />
                  <h3 className="font-bold text-gray-900 text-base lg:text-lg leading-tight line-clamp-1">
                    {experience.company || 'Unknown Company'}
                  </h3>
                </div>
                {/* External link icon - shows on hover for full width mode */}
                {isFullWidth && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLink size={16} className="text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm lg:text-base text-gray-700 font-medium ml-5 lg:ml-7 line-clamp-1">
                {experience.position || 'Unknown Position'}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* YOE */}
                <span className="flex items-center gap-1.5 text-xs lg:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  <User size={12} />
                  {experience.yoe || 'N/A'} YOE
                </span>

                {/* Verdict */}
                <div className="flex items-center gap-1.5">
                  {getVerdictIcon(experience.verdict)}
                  <span className={`text-xs lg:text-sm font-bold ${
                    experience.verdict === 'selected' 
                      ? 'text-emerald-600' 
                      : experience.verdict === 'rejected'
                      ? 'text-rose-600'
                      : 'text-gray-500'
                  }`}>
                    {experience.verdict ? 
                      experience.verdict.charAt(0).toUpperCase() + experience.verdict.slice(1) 
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg w-fit">
                {renderStars(experience.rating)}
              </div>
            </div>

            {/* Preview of experience text */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 lg:line-clamp-3 leading-relaxed">
                {experience.experience?.substring(0, isMobile ? 100 : 150)}{experience.experience?.length > (isMobile ? 100 : 150) ? '...' : ''}
              </p>
            </div>

            {/* Click to view hint for full width mode */}
            {isFullWidth && (
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                  <ExternalLink size={12} />
                  <span>Click to view details in new tab</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}