import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

const InterviewHeader = ({ onFilterClick, onApplyFilters, onShareClick }) => {
  return (
    <div className="w-full max-w-7xl mx-auto mb-12">
      {/* Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 p-1">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        
        {/* Content Container */}
        <div className="relative bg-white/95 rounded-[1.4rem] px-8 py-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 inline-block text-transparent bg-clip-text">
              Interview Experiences
            </h1>
            <p className="text-gray-600 mt-2">
            "Discover and share interview experiences on TrendingJobs4All, where job seekers explore real stories, tips, and trends. 
            Sort experiences by company, position, or years of expertise to gain tailored insights. Join a community sharing knowledge 
            for career growth!"
            </p>
          </div>

          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Filter Button */}
            <button
              onClick={onFilterClick}
              className="group relative w-full sm:w-auto px-6 py-3 bg-white rounded-xl border-2 border-indigo-100 hover:border-indigo-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Filter className="w-5 h-5 text-indigo-600" />
              <span className="relative text-indigo-600 font-medium">Filters</span>
            </button>

            {/* Apply Filters Button */}
            <button
              onClick={onApplyFilters}
              className="group relative w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Search className="w-5 h-5 text-white mr-2" />
              <span className="relative text-white font-medium">Apply Filters</span>
            </button>

            {/* Share Experience Button */}
            <button
              onClick={onShareClick}
              className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Plus className="w-5 h-5 text-white" />
              <span className="relative text-white font-medium">Share Experience</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;