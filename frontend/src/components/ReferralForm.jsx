import React, { useState } from 'react';
import { X, Users, Building, MapPin, Phone, Linkedin, Briefcase, Hash, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function ReferralForm({ toggleModal }) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    contact: '',
    linkedin: '',
    positions: [{ position: '', jobid: '' }]
  });

  const {currentUser} = useSelector((state) => state.user);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numOpenings, setNumOpenings] = useState('1');

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'numOpenings') {
      setNumOpenings(value);
      if (value !== '') {
        const num = Math.max(parseInt(value) || 0, 0);
        setFormData(prev => ({
          ...prev,
          positions: Array(num).fill(0).map((_, i) => 
            prev.positions[i] || { position: '', jobid: '' }
          )
        }));
      }
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handlePositionChange = (index, field, value) => {
    const newPositions = [...formData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setFormData({ ...formData, positions: newPositions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!formData.fullName || !formData.company || !formData.contact) {
      setError('Name, company, and contact are required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.positions.some(p => p.position)) {
      setError('At least one position is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/backend/referrals/createReferral', {
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

      setSuccess('Referral submitted successfully!');
      setTimeout(() => {
        toggleModal();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
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
        className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Glass Card with Gradient Background */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-purple-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>

          {/* Container for form with internal scrolling */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            {/* Header Section */}
            <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                    Share Your Referral
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Connect talent with opportunities in your network</p>
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
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                  <span>Contact Information</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Company *</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Your company name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Contact (Email or Phone) *</span>
                    </label>
                    <input
                      type="text"
                      id="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Email address or phone number"
                      required
                    />
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
                      onChange={handleChange}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Your LinkedIn profile URL"
                    />
                  </div>
                </div>
              </div>

              {/* Number of Positions Section */}
              <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl border border-purple-200/50">
                <label htmlFor="numOpenings" className="block text-base sm:text-lg font-semibold text-slate-800 mb-3 flex items-center space-x-2">
                  <Hash className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <span>Number of Positions *</span>
                </label>
                <input
                  type="number"
                  id="numOpenings"
                  min="0"
                  value={numOpenings}
                  onChange={handleChange}
                  className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-purple-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-3 sm:px-4 sm:py-4 text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium"
                  placeholder="Enter number of open positions"
                  required
                />
              </div>

              {/* Positions Section */}
              {formData.positions.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                    <span>Position Details</span>
                  </h3>
                  
                  <div className="space-y-4">
                    {formData.positions.map((pos, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 sm:p-6 bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-sm"
                      >
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-slate-800">Position {index + 1}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                              <span>Position Title *</span>
                            </label>
                            <input
                              type="text"
                              value={pos.position}
                              onChange={(e) => handlePositionChange(index, 'position', e.target.value)}
                              className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                              placeholder="e.g., Software Engineer"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                              <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                              <span>Job ID <span className="text-slate-400">(Optional)</span></span>
                            </label>
                            <input
                              type="text"
                              value={pos.jobid}
                              onChange={(e) => handlePositionChange(index, 'jobid', e.target.value)}
                              className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                              placeholder="Job posting ID or reference"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed relative"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Submit Referral</span>
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