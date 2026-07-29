import React, { useState } from 'react';
import { X, SlidersHorizontal, RotateCcw, Check, Search, Building, User, Award, ArrowUpDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { focusRing } from '../theme/tokens';

const verdictOptions = [
  { value: '', label: 'All results' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
];

const sortOptions = [
  { value: 'rating-desc', label: 'Highest rating first', desc: 'Hardest interviews first' },
  { value: 'rating-asc', label: 'Lowest rating first', desc: 'Easier interviews first' },
  { value: 'likes-desc', label: 'Most liked first', desc: 'Popular experiences first' },
  { value: 'likes-asc', label: 'Least liked first', desc: 'Hidden gems' },
  { value: 'dislikes-desc', label: 'Most disliked first', desc: 'Controversial experiences' },
  { value: 'dislikes-asc', label: 'Least disliked first', desc: 'Well-received experiences' },
];

const fieldClass = `w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`;

const InterviewFilterModal = ({ isOpen, onClose, filters, onSaveAndApply, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('search');

  const handleSaveAndApply = () => {
    onSaveAndApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      companySearch: '',
      positionSearch: '',
      yoeSearch: '',
      verdictFilter: '',
      sortConfig: 'rating-desc',
    };
    setLocalFilters(clearedFilters);
    onClear(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C241B]/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_20px_45px_rgba(44,36,27,0.2)]"
      >
        {/* Header */}
        <div className="border-b border-[#E5DCCE] bg-[#F7F3EC] px-6 py-5 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] text-[#C4A574]">
                <SlidersHorizontal className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-[#1C1917]">Refine your search</h2>
                <p className="text-xs text-[#78716C] sm:text-sm">Find the interview experiences that matter to you</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className={`shrink-0 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5DCCE]">
          {[
            { key: 'search', label: 'Search & filter', Icon: Search },
            { key: 'sort', label: 'Sort options', Icon: ArrowUpDown },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold transition ${focusRing} ${
                activeTab === tab.key ? 'bg-[#2C241B] text-[#FFFDF8]' : 'bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#F7F3EC]'
              }`}
            >
              <tab.Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6 sm:p-7">
          {activeTab === 'search' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2C241B]">
                  <Building className="h-4 w-4 text-[#C4A574]" aria-hidden />
                  Company name
                </label>
                <input
                  type="text"
                  value={localFilters.companySearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, companySearch: e.target.value })}
                  className={fieldClass}
                  placeholder="e.g., Google, Microsoft, Amazon..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2C241B]">
                  <User className="h-4 w-4 text-[#C4A574]" aria-hidden />
                  Position title
                </label>
                <input
                  type="text"
                  value={localFilters.positionSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, positionSearch: e.target.value })}
                  className={fieldClass}
                  placeholder="e.g., SDET, QA Engineer, Test Lead..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2C241B]">
                  <Award className="h-4 w-4 text-[#C4A574]" aria-hidden />
                  Years of experience
                </label>
                <input
                  type="number"
                  value={localFilters.yoeSearch}
                  onChange={(e) => setLocalFilters({ ...localFilters, yoeSearch: e.target.value })}
                  className={fieldClass}
                  placeholder="Enter years of experience..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#2C241B]">
                  <Sparkles className="h-4 w-4 text-[#C4A574]" aria-hidden />
                  Interview outcome
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {verdictOptions.map((option) => {
                    const isActive = localFilters.verdictFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocalFilters({ ...localFilters, verdictFilter: option.value })}
                        className={`relative rounded-xl border px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
                          isActive
                            ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]'
                            : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        {option.label}
                        {isActive && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#C4A574] text-[#2C241B]">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="font-display text-lg font-semibold text-[#1C1917]">Choose your sorting preference</h3>
                <p className="mt-1 text-sm text-[#78716C]">Organize results to find what matters most to you</p>
              </div>

              <div className="space-y-2.5">
                {sortOptions.map((option) => {
                  const isActive = localFilters.sortConfig === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, sortConfig: option.value })}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${focusRing} ${
                        isActive ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]' : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#2C241B] hover:bg-[#EFE8DC]'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className={`text-xs ${isActive ? 'text-[#EFE8DC]' : 'text-[#78716C]'}`}>{option.desc}</p>
                      </div>
                      {isActive && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C4A574] text-[#2C241B]">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-[#E5DCCE] bg-[#F7F3EC] px-6 py-5 sm:px-7">
          <button
            type="button"
            onClick={handleClear}
            className={`inline-flex items-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset all
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-5 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className={`rounded-xl border border-[#2C241B] bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              Apply filters
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InterviewFilterModal;
