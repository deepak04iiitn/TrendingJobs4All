import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Heart, 
  ArrowUpRight,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Users
} from 'lucide-react';

const SalarySidebar = ({ 
  salaries, 
  selectedSalary, 
  onSalarySelect, 
  isMobile = false, 
  isFullWidth = false 
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    const num = parseFloat(amount);
    if (num >= 10000000) { // 1 crore
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) { // 1 lakh
      return `₹${(num / 100000).toFixed(1)}L`;
    } else {
      return `₹${num.toLocaleString()}`;
    }
  };

  const getCompanyInitials = (company) => {
    if (!company) return 'N/A';
    return company
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceText = (years) => {
    if (years === 0) return 'Fresher';
    if (years === 1) return '1 Year';
    return `${years} Years`;
  };

  const getSalaryTier = (ctc) => {
    const num = parseFloat(ctc) || 0;
    if (num >= 10000000) return { 
      tier: 'Executive', 
      color: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    };
    if (num >= 5000000) return { 
      tier: 'Senior', 
      color: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    };
    if (num >= 2000000) return { 
      tier: 'Mid-Level', 
      color: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
      bgColor: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200'
    };
    return { 
      tier: 'Entry', 
      color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      bgColor: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200'
    };
  };

  const getCompanyAvatarColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600'
    ];
    return colors[index % colors.length];
  };

  // Determine container classes based on the context
  const getContainerClasses = () => {
    const baseClasses = "bg-gradient-to-br from-white to-gray-50/30 flex flex-col relative overflow-hidden w-full border border-gray-200/80 backdrop-blur-sm";
    
    if (isMobile && !isFullWidth) {
      return `${baseClasses} h-full`;
    } else if (isFullWidth) {
      return `${baseClasses} rounded-xl shadow-lg shadow-gray-200/50`;
    } else {
      return `${baseClasses} rounded-xl shadow-lg shadow-gray-200/50 h-[calc(100vh-120px)] max-w-none`;
    }
  };

  const getHeaderClasses = () => {
    if (isMobile && !isFullWidth) {
      return "hidden";
    } else {
      return "relative px-6 py-5 border-b border-gray-200/80 bg-gradient-to-r from-slate-50 via-blue-50/30 to-purple-50/30";
    }
  };

  const getListClasses = () => {
    if (isFullWidth) {
      return "overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-blue-300/60 scrollbar-track-gray-100/50 w-full";
    } else {
      return "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300/60 scrollbar-track-gray-100/50 w-full";
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Header */}
      <div className={getHeaderClasses()}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Salary Insights
            </h2>
            <p className="text-sm text-gray-600 mt-0.5 font-medium">
              {salaries.length} salary entries
            </p>
          </div>
        </div>
      </div>

      {/* Salary List */}
      <div className={getListClasses()}>
        <div className="p-4 space-y-4 w-full">
          {salaries.map((salary, index) => {
            const salaryTier = getSalaryTier(salary.ctc);
            
            return (
              <motion.div
                key={salary._id}
                className={`relative cursor-pointer transition-all duration-300 w-full group ${
                  selectedSalary?._id === salary._id
                    ? 'ring-2 ring-blue-400/60 ring-opacity-75 shadow-lg shadow-blue-500/10'
                    : 'hover:shadow-xl hover:shadow-gray-300/30'
                }`}
                onClick={() => onSalarySelect(salary)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: isMobile ? 0 : -2,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Card container */}
                <div className={`
                  relative rounded-xl p-6 border transition-all duration-300 w-full backdrop-blur-sm
                  ${selectedSalary?._id === salary._id
                    ? `bg-gradient-to-br ${salaryTier.bgColor} ${salaryTier.borderColor} shadow-md`
                    : 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200/80 hover:border-gray-300/80 hover:shadow-lg hover:from-white hover:to-blue-50/20'
                  }
                `}>
                  {/* Company and Position */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 ${getCompanyAvatarColor(index)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transform transition-transform duration-200 group-hover:scale-105`}>
                        <span className="text-sm font-bold text-white">
                          {getCompanyInitials(salary.company)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-900 transition-colors duration-200">
                          {salary.company || 'Unknown Company'}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1.5 font-medium">
                          {salary.position || 'Unknown Position'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tier Badge */}
                    <div className={`px-4 py-2 rounded-full text-xs font-bold ${salaryTier.color} flex-shrink-0 shadow-md transform transition-transform duration-200 group-hover:scale-105`}>
                      {salaryTier.tier}
                    </div>
                  </div>

                  {/* CTC Display */}
                  <div className="mb-5">
                    <div className="flex items-center gap-3 text-3xl font-black">
                      <TrendingUp size={24} className="text-emerald-500 flex-shrink-0 drop-shadow-sm" />
                      <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        {formatCurrency(salary.ctc)} lpa
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2.5 mb-5">
                    {/* Experience */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 bg-gradient-to-r from-purple-100 to-purple-200 px-4 py-2 rounded-full shadow-sm border border-purple-200/50">
                      <Briefcase size={15} className="flex-shrink-0" />
                      <span>{getExperienceText(salary.yearsOfExperience)}</span>
                    </div>

                    {/* Location */}
                    {salary.location && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 rounded-full shadow-sm border border-blue-200/50">
                        <MapPin size={15} className="flex-shrink-0" />
                        <span>{salary.location}</span>
                      </div>
                    )}

                    {/* Likes */}
                    {salary.numberOfLikes > 0 && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-pink-700 bg-gradient-to-r from-pink-100 to-rose-200 px-4 py-2 rounded-full shadow-sm border border-pink-200/50">
                        <Heart size={15} className="text-pink-500 flex-shrink-0 fill-current" />
                        <span>{salary.numberOfLikes}</span>
                      </div>
                    )}
                  </div>

                  {/* Salary Breakdown */}
                  {(salary.baseSalary || salary.variablePay) && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-5 mb-5 border border-gray-200/50 shadow-inner">
                      <div className="space-y-3">
                        {salary.baseSalary && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 font-semibold">Base Salary:</span>
                            <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                              {formatCurrency(salary.baseSalary)}
                            </span>
                          </div>
                        )}
                        {salary.variablePay && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 font-semibold">Variable Pay:</span>
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                              {formatCurrency(salary.variablePay)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills/Tags */}
                  {(salary.tags || salary.skills) && (
                    <div className="flex flex-wrap gap-2">
                      {(salary.tags || salary.skills)?.slice(0, 3).map((tag, tagIndex) => {
                        const tagColors = [
                          'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 border-indigo-200/50',
                          'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border-teal-200/50',
                          'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700 border-rose-200/50'
                        ];
                        return (
                          <span
                            key={tagIndex}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${tagColors[tagIndex % tagColors.length]}`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                      {(salary.tags || salary.skills)?.length > 3 && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-bold border border-gray-200/50 shadow-sm">
                          +{(salary.tags || salary.skills).length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* View Details Hint */}
                  {isFullWidth && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-full border border-blue-200/50">
                        <span>Click to view details</span>
                        <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </div>
                    </div>
                  )}

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {salaries.length === 0 && (
          <motion.div 
            className="text-center py-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <DollarSign size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              No Salary Data Available
            </h3>
            <p className="text-gray-600 font-medium">
              Salary information will appear here when available
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SalarySidebar;