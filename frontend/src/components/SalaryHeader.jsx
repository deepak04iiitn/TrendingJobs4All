import React from 'react';
import { Plus, Filter, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

const SalaryHeader = ({ onFilterClick, onShareClick }) => {
  return (
    <div className="w-full max-w-7xl mx-auto mb-8 mt-10">
      {/* Main Header Container */}
      <div className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/30 to-blue-300/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/30 to-emerald-300/30 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
        
        {/* Content */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl shadow-emerald-100/50 p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Salary Insights
                </h1>
              </div>
            </div>
            
            <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed text-lg">
              Explore and share salary details on <span className="font-semibold text-emerald-600">Route2Hire</span> to 
              compare pay scales and trends across roles. Sort salary data by company, position, or experience to gain 
              clear insights and make smarter career choices.
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-sm text-gray-500 ml-2">Join thousands sharing salary transparency</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Filter Button */}
            <button
              onClick={onFilterClick}
              className="group relative w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Filter & Sort</div>
                  <div className="text-sm text-white/80">Refine your search</div>
                </div>
              </div>
            </button>

            {/* Share Salary Button */}
            <button
              onClick={onShareClick}
              className="group relative w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Share Salary</div>
                  <div className="text-sm text-white/80">Help build transparency</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryHeader;