import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const InterviewFilterModal = ({ isOpen, onClose, filters, onSave, onClear }) => {
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
      verdictFilter: '',
      sortConfig: 'rating-desc'
    };
    setLocalFilters(clearedFilters);
    onClear(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-white" />
            <h2 className="text-xl font-semibold text-white">Refine Results</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Search & Filter
          </button>
          <button
            onClick={() => setActiveTab('sort')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sort'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sort Options
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'search' ? (
            <div className="space-y-6">
              {/* Company Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <div className="relative">
                  <input
                    type="text"
                    value={localFilters.companySearch}
                    onChange={(e) => setLocalFilters({ ...localFilters, companySearch: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Search by company name..."
                  />
                </div>
              </div>

              {/* Position Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={localFilters.positionSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, positionSearch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Search by position..."
                />
              </div>

              {/* YOE */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  value={localFilters.yoeSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, yoeSearch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Enter years of experience..."
                />
              </div>

              {/* Verdict Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Interview Verdict</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, verdictFilter: '' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localFilters.verdictFilter === ''
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, verdictFilter: 'selected' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localFilters.verdictFilter === 'selected'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Selected
                  </button>
                  <button
                    onClick={() => setLocalFilters({ ...localFilters, verdictFilter: 'rejected' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      localFilters.verdictFilter === 'rejected'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Choose how you want to sort the results:</p>
              <div className="space-y-2">
                {[
                  { value: 'rating-desc', label: 'Highest Rating First' },
                  { value: 'rating-asc', label: 'Lowest Rating First' },
                  { value: 'likes-desc', label: 'Most Liked First' },
                  { value: 'likes-asc', label: 'Least Liked First' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalFilters({ ...localFilters, sortConfig: option.value })}
                    className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${
                      localFilters.sortConfig === option.value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                    {localFilters.sortConfig === option.value && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewFilterModal;