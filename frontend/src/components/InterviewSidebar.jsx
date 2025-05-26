import React from 'react';
import { motion } from 'framer-motion';
import { Building, User, Star, CheckCircle, XCircle } from 'lucide-react';

export default function InterviewSidebar({ experiences, selectedExperience, onExperienceSelect }) {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Interview Experiences</h2>
        <p className="text-sm text-gray-600 mt-1">{experiences.length} experiences found</p>
      </div>

      {/* Experience List */}
      <div className="flex-1 overflow-y-auto">
        {experiences.map((experience, index) => (
          <motion.div
            key={experience._id}
            className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 ${
              selectedExperience?._id === experience._id
                ? 'bg-indigo-50 border-l-4 border-l-indigo-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onExperienceSelect(experience)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            {/* Company and Position */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Building size={14} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {experience.company || 'Unknown Company'}
                </h3>
              </div>
              <p className="text-sm text-gray-600 truncate ml-5">
                {experience.position || 'Unknown Position'}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* YOE */}
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <User size={12} />
                  {experience.yoe || 'N/A'} YOE
                </span>

                {/* Verdict */}
                <div className="flex items-center gap-1">
                  {getVerdictIcon(experience.verdict)}
                  <span className={`text-xs font-medium ${
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
              <div className="flex items-center gap-1">
                {renderStars(experience.rating)}
              </div>
            </div>

            {/* Preview of experience text */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 line-clamp-2">
                {experience.experience?.substring(0, 100)}...
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}