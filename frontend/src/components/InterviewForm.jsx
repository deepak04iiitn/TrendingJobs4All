import React, { useState } from 'react';
import { X, Star, Briefcase, Building, User, Calendar, Award, MessageSquare, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { focusRing } from '../theme/tokens';

const fieldClass = `block w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3.5 py-2.5 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`;

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

  const { currentUser } = useSelector((state) => state.user);

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

    if (!formData.company || !formData.position || !formData.experience || !formData.rating) {
      setError('Company, Position, Experience, and Rating are required');
      return;
    }

    try {
      // Set default values for optional fields
      const submissionData = {
        ...formData,
        fullName: formData.fullName.trim() || 'Anonymous',
        yoe: formData.yoe ? Number(formData.yoe) : 0,
        verdict: formData.verdict || 'N/A',
        userRef: currentUser._id,
      };

      const response = await fetch('/backend/interviews/createInterviewExp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
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
      initial={{ scale: 0.96, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="relative mx-auto w-full max-w-3xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-[88vh] overflow-y-auto rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_20px_45px_rgba(44,36,27,0.2)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E5DCCE] bg-[#F7F3EC] px-6 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] text-[#C4A574]">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold leading-tight text-[#1C1917] sm:text-2xl">
                Share your journey
              </h2>
              <p className="mt-1 text-xs text-[#78716C] sm:text-sm">Help others with your interview experience</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleModal}
            aria-label="Close form"
            className={`shrink-0 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-7 sm:py-7">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {success}
            </motion.div>
          )}

          <div className="space-y-7">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#6B5A48]">
                <User className="h-4 w-4 text-[#C4A574]" aria-hidden />
                Personal information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <User className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    Full name <span className="text-[#78716C]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    className={fieldClass}
                    placeholder="Enter your full name"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="yoe" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    Years of experience <span className="text-[#78716C]">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="yoe"
                    value={formData.yoe}
                    className={fieldClass}
                    placeholder="Years of experience"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="linkedin" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <Linkedin className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    LinkedIn profile <span className="text-[#78716C]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="linkedin"
                    value={formData.linkedin}
                    className={fieldClass}
                    placeholder="LinkedIn profile URL"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Job Information Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#6B5A48]">
                <Briefcase className="h-4 w-4 text-[#C4A574]" aria-hidden />
                Job details
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label htmlFor="company" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <Building className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    className={fieldClass}
                    placeholder="Company name"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="position" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    className={fieldClass}
                    placeholder="Job position"
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <label htmlFor="verdict" className="flex items-center gap-1.5 text-sm font-medium text-[#2C241B]">
                    <Award className="h-3.5 w-3.5 shrink-0 text-[#78716C]" aria-hidden />
                    Interview result <span className="text-[#78716C]">(optional)</span>
                  </label>
                  <select id="verdict" value={formData.verdict} className={fieldClass} onChange={handleChange}>
                    <option value="">Select result (optional)</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty Rating Section */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#6B5A48]">
                <Star className="h-4 w-4 text-[#C4A574]" aria-hidden />
                Interview difficulty rating
              </h3>

              <div className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-5">
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRatingChange(star)}
                      aria-label={`Rate difficulty ${star} out of 5`}
                      className={`rounded-full p-1.5 transition ${focusRing} ${
                        star <= formData.rating ? 'text-[#C4A574]' : 'text-[#D8CDBB] hover:text-[#C4A574]/70'
                      }`}
                    >
                      <Star fill={star <= formData.rating ? 'currentColor' : 'none'} strokeWidth={1.5} className="h-7 w-7 sm:h-8 sm:w-8" />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-[#78716C] sm:text-sm">
                  {formData.rating === 0 && 'Click to rate the interview difficulty'}
                  {formData.rating === 1 && 'Very easy'}
                  {formData.rating === 2 && 'Easy'}
                  {formData.rating === 3 && 'Moderate'}
                  {formData.rating === 4 && 'Hard'}
                  {formData.rating === 5 && 'Very hard'}
                </p>
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#6B5A48]">
                <MessageSquare className="h-4 w-4 text-[#C4A574]" aria-hidden />
                Share your experience
              </h3>

              <textarea
                id="experience"
                value={formData.experience}
                rows={5}
                className={`${fieldClass} min-h-[120px] resize-none`}
                placeholder="Share details about your interview process, questions asked, company culture, tips for future candidates..."
                onChange={handleChange}
              />
              <p className="flex items-center gap-1.5 text-xs text-[#78716C]">
                <MessageSquare className="h-3 w-3 shrink-0" aria-hidden />
                Your detailed experience helps others prepare better
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#2C241B] bg-[#2C241B] py-3 text-base font-semibold text-[#FFFDF8] shadow-[0_10px_24px_-12px_rgba(44,36,27,0.55)] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              Share my experience
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
