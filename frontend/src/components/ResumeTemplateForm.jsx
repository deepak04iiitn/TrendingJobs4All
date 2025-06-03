import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, Briefcase, Building, User, Calendar, Linkedin, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase.js';
import { useSelector } from 'react-redux';

export default function ResumeTemplateForm({ toggleModal, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    yearsOfExperience: '',
    linkedin: '',
  });
  
  const {currentUser} = useSelector((state) => state.user);
  const [resume, setResume] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  const handleChange = (e) => {
    e.stopPropagation();
    const value = e.target.id === 'yearsOfExperience' 
      ? parseFloat(e.target.value) 
      : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileChange = (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResume(file);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const uploadResumeToFirebase = async (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '_' + file.name;
    const storageRef = ref(storage, 'resumes/' + fileName);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (!formData.company || !formData.position || 
          typeof formData.yearsOfExperience !== 'number' || 
          formData.yearsOfExperience < 0 || !resume) {
        throw new Error('All fields are required and years of experience must be 0 or greater');
      }

      const downloadURL = await uploadResumeToFirebase(resume);

      const templateData = {
        company: formData.company,
        position: formData.position,
        yearsOfExperience: formData.yearsOfExperience,
        linkedin: formData.linkedin,
        resume: downloadURL,
      };

      const response = await fetch('/backend/resumeTemplates/uploadResume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...templateData,
          userRef : currentUser._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit template');
      }

      setSuccess('Template submitted successfully!');
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      setFormData({
        company: '',
        position: '',
        yearsOfExperience: '',
        linkedin: '',
      });
      setResume(null);
      setUploadProgress(0);

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
         onClick={handleModalClick}>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
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
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                    Share Your Resume Template
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">Help others with your successful resume format</p>
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
              
              {/* Job Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Job Details</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
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
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
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

                  <div className="space-y-2">
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>Years of Experience</span>
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      className="block w-full rounded-lg sm:rounded-xl border-0 bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 px-3 py-2.5 sm:px-4 sm:py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base"
                      placeholder="Years of experience"
                      min="0"
                      step="0.5"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                      <span>LinkedIn <span className="text-slate-400">(Optional)</span></span>
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

              {/* Resume Upload Section */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center space-x-2">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <span>Upload Resume</span>
                </h3>
                
                <div className="p-4 sm:p-6 bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20">
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 transform hover:scale-[1.01] ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/80 scale-105' 
                        : 'border-slate-300 hover:border-blue-400 bg-white/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {resume ? (
                      <div className="flex items-center justify-center space-x-3 bg-blue-50/80 p-4 rounded-xl">
                        <FileText className="text-blue-500 hidden sm:block" size={24} />
                        <span className="text-slate-700 font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                          {resume.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setResume(null)}
                          className="text-red-500 hover:text-red-700 transform hover:scale-110 transition-all duration-300 flex-shrink-0"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto text-blue-500 animate-bounce" size={32} />
                        <div className="text-slate-600">
                          <p className="font-medium text-sm sm:text-base">Drop your resume here or</p>
                          <label
                            htmlFor="resume"
                            className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors duration-300 font-semibold"
                          >
                            Browse Files
                          </label>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">Supports PDF files only</p>
                      </div>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          ></motion.div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20'
                }`}
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{isSubmitting ? 'Submitting...' : 'Share My Template'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}