import React, { useState } from 'react';
import { X, Banknote, Building, MapPin, GraduationCap, Briefcase, Linkedin, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function SalaryForm({ toggleModal, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    education: '',
    yearsOfExperience: '',
    priorExperience: '',
    company: '',
    position: '',
    location: '',
    salary: '',
    relocationSigningBonus: '',
    stockBonus: '',
    bonus: '',
    ctc: '',
    benefits: '',
    otherDetails: '',
    linkedin: ''
  });

  const {currentUser} = useSelector((state) => state.user);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const requiredFields = [
      'education', 'yearsOfExperience', 'priorExperience', 'company',
      'position', 'location', 'salary', 'benefits', 'ctc'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/backend/salary/createSalary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef : currentUser._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      setSuccess('Salary information submitted successfully!');
      setIsSubmitting(false);
      if (onSubmitSuccess) onSubmitSuccess();

      setTimeout(() => {
        toggleModal();
      }, 2000);
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={toggleModal}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Glass Card with Gradient Background */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>

          {/* Container for form with internal scrolling */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            {/* Header Section */}
            <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                    Share Your Salary Insight
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Help the community grow with your valuable insights</p>
                </div>
              </div>
              
              <button
                onClick={toggleModal}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 group flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-slate-800 transition-colors" />
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
              >
                {success}
              </motion.div>
            )}

            <div className="space-y-6 sm:space-y-8">
              {/* Featured CTC Section */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl sm:rounded-2xl border border-emerald-200/50">
                <label htmlFor="ctc" className="block text-base sm:text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                  <span>CTC (Cost to Company) *</span>
                </label>
                <input
                  type="text"
                  id="ctc"
                  value={formData.ctc}
                  className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-emerald-200 focus:ring-2 focus:ring-emerald-500 transition-all duration-200 px-3 py-3 sm:px-4 sm:py-4 text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium"
                  placeholder="Enter your total CTC (e.g., 12 LPA, $80k)"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Professional Background</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="education" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Education Level *</span>
                    </label>
                    <input
                      type="text"
                      id="education"
                      value={formData.education}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="e.g., Bachelor's in Computer Science"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Years of Experience *</span>
                    </label>
                    <input
                      type="text"
                      id="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="e.g., 3.5 years"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Job Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Current Position</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Company *</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Company name"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="position" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Position *</span>
                    </label>
                    <input
                      type="text"
                      id="position"
                      value={formData.position}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Job title"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Location *</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="City, Country"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Compensation Details Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Compensation Breakdown</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="salary" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Base Salary *</span>
                    </label>
                    <input
                      type="text"
                      id="salary"
                      value={formData.salary}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Annual base salary"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bonus" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Annual Bonus</span>
                    </label>
                    <input
                      type="text"
                      id="bonus"
                      value={formData.bonus}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Annual bonus amount"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="stockBonus" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Stock Bonus</span>
                    </label>
                    <input
                      type="text"
                      id="stockBonus"
                      value={formData.stockBonus}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Annual stock value"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="relocationSigningBonus" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Signing/Relocation Bonus</span>
                    </label>
                    <input
                      type="text"
                      id="relocationSigningBonus"
                      value={formData.relocationSigningBonus}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="One-time bonus"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>LinkedIn Profile <span className="text-slate-400">(Optional)</span></span>
                  </label>
                  <input
                    type="text"
                    id="linkedin"
                    value={formData.linkedin}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="Your LinkedIn profile URL"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Experience and Details Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="priorExperience" className="block text-sm font-medium text-slate-700">
                    Prior Experience *
                  </label>
                  <textarea
                    id="priorExperience"
                    value={formData.priorExperience}
                    rows="3"
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 resize-none text-sm sm:text-base"
                    placeholder="Brief description of your previous roles and achievements"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="benefits" className="block text-sm font-medium text-slate-700">
                    Benefits Package *
                  </label>
                  <textarea
                    id="benefits"
                    value={formData.benefits}
                    rows="3"
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 resize-none text-sm sm:text-base"
                    placeholder="Health insurance, retirement plans, PTO, remote work options, etc."
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="otherDetails" className="block text-sm font-medium text-slate-700">
                    Additional Details
                  </label>
                  <textarea
                    id="otherDetails"
                    value={formData.otherDetails}
                    rows="3"
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 resize-none text-sm sm:text-base"
                    placeholder="Any other relevant information you'd like to share"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed relative"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Share Your Salary Insight</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}