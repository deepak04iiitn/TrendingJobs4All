import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Search, Building, User, Hash, ArrowUpDown, Sparkles } from 'lucide-react';

const ResumeFilterModal = ({ isOpen, onClose, filters, onSave, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('search');

  const handleSave = () => {
    onSave(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      companySearch: '',
      positionSearch: '',
      yoeSearch: '',
      sortConfig: 'likes-desc'
    };
    setLocalFilters(clearedFilters);
    onClear(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <SlidersHorizontal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Refine Your Search</h2>
                <p className="text-white/80 text-sm">Find the perfect resume opportunities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 text-white hover:bg-white/20 rounded-2xl transition-all duration-300 flex items-center justify-center group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50/80 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'search'
                ? 'text-indigo-600 bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search & Filter
            </div>
            {activeTab === 'search' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sort')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'sort'
                ? 'text-indigo-600 bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort Options
            </div>
            {activeTab === 'sort' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {activeTab === 'search' ? (
            <div className="space-y-8">
              {/* Company Search */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 text-indigo-600" />
                  Company Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={localFilters.companySearch}
                    onChange={(e) => setLocalFilters({ ...localFilters, companySearch: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50/80 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
                    placeholder="e.g., Google, Microsoft, Amazon..."
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Position Search */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-purple-600" />
                  Position Title
                </label>
                <input
                  type="text"
                  value={localFilters.positionSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, positionSearch: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50/80 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="e.g., Software Engineer, Product Manager..."
                />
              </div>

              {/* Years of Experience Search */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={localFilters.yoeSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, yoeSearch: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50/80 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="Enter years of experience..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your Sorting Preference</h3>
                <p className="text-sm text-gray-600">Organize results to find what matters most to you</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { value: 'likes-desc', label: 'Most Liked First', icon: '👍', desc: 'Popular resumes first' },
                  { value: 'likes-asc', label: 'Least Liked First', icon: '📊', desc: 'Hidden gems' },
                  { value: 'dislikes-desc', label: 'Most Disliked First', icon: '👎', desc: 'Controversial resumes' },
                  { value: 'dislikes-asc', label: 'Least Disliked First', icon: '💫', desc: 'Well-received resumes' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalFilters({ ...localFilters, sortConfig: option.value })}
                    className={`w-full p-5 rounded-2xl text-left transition-all duration-300 border-2 group ${
                      localFilters.sortConfig === option.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-50/80 text-gray-700 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl ${localFilters.sortConfig === option.value ? 'grayscale-0' : 'grayscale'}`}>
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-semibold">{option.label}</div>
                          <div className={`text-sm ${localFilters.sortConfig === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                            {option.desc}
                          </div>
                        </div>
                      </div>
                      {localFilters.sortConfig === option.value && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            onClick={handleClear}
            className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white rounded-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Reset All</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-white rounded-2xl transition-all duration-300 border border-gray-200 hover:border-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeFilterModal;