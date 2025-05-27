import React, { useState } from 'react';
import { X, Star, Briefcase, Building, User, Calendar, Award, MessageSquare, Linkedin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function InterviewForm({ toggleModal }) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    position: '',
    yoe: '',
    verdict: '',
    experience: '',
    rating: 0,
    linkedin: '',
  });

  const {currentUser} = useSelector((state) => state.user);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRatingChange = (newRating) => {
    setFormData({ ...formData, rating: newRating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName || !formData.company || !formData.position || !formData.yoe || !formData.verdict || !formData.experience || !formData.rating) {
      setError('All fields are required, including rating');
      return;
    }

    try {
      const response = await fetch('/backend/interviews/createInterviewExp', {
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

      const data = await response.json();
      setSuccess('Experience submitted successfully!');

      // Reset form after successful submission
      setFormData({
        fullName: '',
        company: '',
        position: '',
        yoe: '',
        verdict: '',
        experience: '',
        rating: 0,
        linkedin: '',
      });

      // Optionally close the modal after a delay
      setTimeout(() => {
        toggleModal();
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
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
        <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-full blur-3xl"></div>

        {/* Container for form with internal scrolling */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          {/* Header Section */}
          <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                  Share Your Journey
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">Help others with your interview experience</p>
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
            {/* Personal Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="Enter your full name"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="yoe" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>Years of Experience</span>
                  </label>
                  <input
                    type="number"
                    id="yoe"
                    value={formData.yoe}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="Years of experience"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>LinkedIn Profile <span className="text-slate-400">(Optional)</span></span>
                  </label>
                  <input
                    type="text"
                    id="linkedin"
                    value={formData.linkedin}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="LinkedIn profile URL"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Job Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Job Details</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>Company</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="Company name"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="position" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>Position</span>
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                    placeholder="Job position"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="verdict" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span>Interview Result</span>
                  </label>
                  <select
                    id="verdict"
                    value={formData.verdict}
                    className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 text-sm sm:text-base"
                    onChange={handleChange}
                  >
                    <option value="">Select result</option>
                    <option value="selected">✅ Selected</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty Rating Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Interview Difficulty Rating</span>
              </h3>
              
              <div className="p-4 sm:p-6 bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20">
                <div className="flex justify-center space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRatingChange(star)}
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                        star <= formData.rating 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <Star
                        fill={star <= formData.rating ? 'currentColor' : 'none'}
                        size={window.innerWidth < 640 ? 24 : 32}
                        strokeWidth={1.5}
                        className="w-6 h-6 sm:w-8 sm:h-8"
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-center mt-3 text-xs sm:text-sm text-slate-600">
                  {formData.rating === 0 && "Click to rate the interview difficulty"}
                  {formData.rating === 1 && "Very Easy"}
                  {formData.rating === 2 && "Easy"}
                  {formData.rating === 3 && "Moderate"}
                  {formData.rating === 4 && "Hard"}
                  {formData.rating === 5 && "Very Hard"}
                </p>
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <span>Share Your Experience</span>
              </h3>
              
              <div className="space-y-2">
                <textarea
                  id="experience"
                  value={formData.experience}
                  rows="4"
                  className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                  placeholder="Share details about your interview process, questions asked, company culture, tips for future candidates..."
                  onChange={handleChange}
                ></textarea>
                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  <span>Your detailed experience helps others prepare better</span>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Share My Experience</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}