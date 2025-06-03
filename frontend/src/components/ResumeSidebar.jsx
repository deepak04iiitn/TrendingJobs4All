import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Building2, Briefcase, Clock, XCircle, ThumbsUp, ThumbsDown, MessageCircle, X, Linkedin, ExternalLink, Sparkles, Trophy, FileText } from 'lucide-react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase.js';
import ResumeCommentSection from './ResumeCommentSection.jsx';

export default function ResumeSidebar({ 
  templates, 
  selectedTemplate, 
  onTemplateSelect, 
  isMobile = false, 
  isFullWidth = false 
}) {
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState({});
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [commentModals, setCommentModals] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});

  // Initialize likes and dislikes from templates
  React.useEffect(() => {
    const initialLikes = {};
    const initialDislikes = {};
    templates.forEach(template => {
      initialLikes[template._id] = template.numberOfLikes || 0;
      initialDislikes[template._id] = template.numberOfDislikes || 0;
    });
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [templates]);

  // Load preview URLs for resumes
  React.useEffect(() => {
    const loadPreviews = async () => {
      const urls = {};
      for (const template of templates) {
        try {
          if (template.resume.startsWith('http')) {
            urls[template._id] = template.resume;
          } else {
            const storage = getStorage(app);
            const resumeRef = ref(storage, template.resume);
            urls[template._id] = await getDownloadURL(resumeRef);
          }
        } catch (error) {
          console.error('Error loading preview for template:', template._id, error);
        }
      }
      setPreviewUrls(urls);
    };

    if (templates.length > 0) {
      loadPreviews();
    }
  }, [templates]);

  const handleLinkedInClick = (linkedinUrl) => {
    if (linkedinUrl && linkedinUrl !== 'Not Provided') {
      const url = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      window.open(url, '_blank');
    }
  };

  const handleDownload = async (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDownloading(prev => ({ ...prev, [template._id]: true }));
    setError(prev => ({ ...prev, [template._id]: '' }));
    
    try {
      let downloadURL = template.resume;
      
      if (!template.resume.startsWith('http')) {
        const storage = getStorage(app);
        const resumeRef = ref(storage, template.resume);
        downloadURL = await getDownloadURL(resumeRef);
      }

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadURL;
      a.target = '_blank';
      a.download = `${template.company}-${template.position}-resume.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);

    } catch (error) {
      console.error('Error downloading resume:', error);
      setError(prev => ({ ...prev, [template._id]: 'Failed to download resume. Please try again later.' }));
    } finally {
      setDownloading(prev => ({ ...prev, [template._id]: false }));
    }
  };

  const handleLike = async (e, template) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/backend/resumeTemplates/likeResume/${template._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to like template');
      const data = await response.json();
      setLikes(prev => ({ ...prev, [template._id]: data.likes }));
      setDislikes(prev => ({ ...prev, [template._id]: data.dislikes }));
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  const handleDislike = async (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/backend/resumeTemplates/dislikeResume/${template._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to dislike template');
      const data = await response.json();
      setLikes(prev => ({ ...prev, [template._id]: data.likes }));
      setDislikes(prev => ({ ...prev, [template._id]: data.dislikes }));
    } catch (error) {
      console.error('Error disliking template:', error);
    }
  };

  const toggleCommentModal = (templateId) => {
    setCommentModals(prev => ({ ...prev, [templateId]: !prev[templateId] }));
  };

  // Determine container classes based on the context
  const getContainerClasses = () => {
    const baseClasses = "backdrop-blur-xl bg-white/95 flex flex-col relative overflow-hidden w-full";
    
    if (isMobile && !isFullWidth) {
      return `${baseClasses} h-full`;
    } else if (isFullWidth) {
      return `${baseClasses} rounded-3xl shadow-2xl shadow-slate-900/10 border border-white/20`;
    } else {
      return `${baseClasses} rounded-3xl shadow-2xl shadow-slate-900/10 border border-white/20 h-[calc(100vh-120px)] max-w-none`;
    }
  };

  const getHeaderClasses = () => {
    if (isMobile && !isFullWidth) {
      return "hidden";
    } else {
      return "relative p-4 sm:p-6 lg:p-8 xl:p-10 border-b border-white/20 bg-gradient-to-br from-blue-50/80 via-green-50/60 to-indigo-50/80 rounded-t-3xl overflow-hidden";
    }
  };

  const getListClasses = () => {
    if (isFullWidth) {
      return "overflow-y-auto max-h-[70vh] scrollbar-hide w-full";
    } else {
      return "flex-1 overflow-y-auto scrollbar-hide w-full";
    }
  };

  return (
    <>
      <div className={getContainerClasses()}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/30 to-blue-50/30 pointer-events-none"></div>
        
        {/* Header */}
        <div className={getHeaderClasses()}>
          {/* Header background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-green-600/5 to-indigo-600/5"></div>
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-28 h-28 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full">
            <div className="flex items-center gap-3 mb-4 w-full">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Briefcase size={isMobile ? 20 : 24} className="text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-green-600/30 rounded-2xl blur-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent truncate">
                  Resume Templates
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                  <p className="text-sm lg:text-base text-slate-600 font-medium truncate">
                    {templates.length} professional templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template List */}
        <div className={getListClasses()}>
          <div className="p-2 w-full">
            {templates.map((template, index) => (
              <motion.div
                key={template._id}
                className={`relative mb-4 cursor-pointer transition-all duration-500 group overflow-hidden w-full ${
                  selectedTemplate?._id === template._id
                    ? 'scale-[1.02] z-10'
                    : 'hover:scale-[1.01]'
                }`}
                onClick={() => onTemplateSelect && onTemplateSelect(template)}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: isMobile ? 0 : -2,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Card container with glassmorphism effect */}
                <div className={`
                  relative backdrop-blur-sm rounded-2xl border transition-all duration-500 w-full overflow-hidden
                  ${selectedTemplate?._id === template._id
                    ? 'bg-gradient-to-br from-white/90 via-blue-50/30 to-green-50/30 border-blue-200/60 shadow-xl shadow-blue-500/10'
                    : 'bg-white/80 border-slate-200/50 shadow-lg shadow-slate-900/5 hover:bg-white/95 hover:border-blue-200/40 hover:shadow-xl hover:shadow-blue-500/5'
                  }
                `}>
                  
                  {/* Selected indicator */}
                  {selectedTemplate?._id === template._id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-blue-500 to-green-600 rounded-r-full shadow-lg shadow-blue-500/30 z-10"></div>
                  )}

                  {/* Error Message */}
                  {error[template._id] && (
                    <div className="m-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fadeIn flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <p className="text-red-700 text-sm font-medium">{error[template._id]}</p>
                    </div>
                  )}

                  {/* Resume Preview Section */}
                  <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                    {previewUrls[template._id] ? (
                      <>
                        {/* PDF Preview as background */}
                        <iframe
                          src={`${previewUrls[template._id]}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="absolute inset-0 w-full h-full border-0 pointer-events-none transform scale-110"
                          style={{ 
                            filter: 'blur(0.5px)',
                            opacity: 0.9
                          }}
                        />
                        
                        {/* Gradient overlay for fade effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95 pointer-events-none"></div>
                        
                        {/* Download icon overlay */}
                        <div className="absolute top-3 right-3 z-20">
                          <motion.button
                            className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${
                              downloading[template._id] 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-white/90 hover:bg-white hover:shadow-xl backdrop-blur-sm border border-white/50'
                            }`}
                            onClick={(e) => handleDownload(e, template)}
                            disabled={downloading[template._id]}
                            whileHover={{ scale: downloading[template._id] ? 1 : 1.1 }}
                            whileTap={{ scale: downloading[template._id] ? 1 : 0.95 }}
                          >
                            <Download 
                              size={18} 
                              className={`${
                                downloading[template._id] 
                                  ? 'text-white animate-bounce' 
                                  : 'text-slate-700'
                              }`}
                            />
                          </motion.button>
                        </div>

                        {/* Preview label */}
                        <div className="absolute bottom-3 left-3 z-20">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/50">
                            <FileText size={14} className="text-slate-600" />
                            <span className="text-xs font-medium text-slate-700">Resume Preview</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Fallback when preview is loading */
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <div className="text-center">
                          <FileText size={32} className="text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 font-medium">Loading preview...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-5 lg:p-6">
                    {/* Company and Position */}
                    <div className="mb-4 lg:mb-5 w-full">
                      <div className="flex items-start justify-between gap-3 mb-3 w-full">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                              <Building2 size={16} className="text-blue-600" />
                            </div>
                            {selectedTemplate?._id === template._id && (
                              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl blur-sm"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-base sm:text-lg lg:text-xl leading-tight line-clamp-1 bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                              {template.company}
                            </h3>
                            <p className="text-sm lg:text-base text-slate-600 font-medium line-clamp-1 mt-0.5">
                              {template.position}
                            </p>
                          </div>
                        </div>
                        
                        {/* LinkedIn Link */}
                        {template.linkedin !== 'Not Provided' && (
                          <motion.div
                            className="flex-shrink-0"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <button
                              className="p-2 rounded-full hover:bg-indigo-100 transition-colors relative group"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkedInClick(template.linkedin);
                              }}
                            >
                              <Linkedin size={16} className="text-indigo-600" />
                              <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity z-10">
                                Connect with provider
                              </span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Years of Experience */}
                    <div className="flex items-center gap-2 mb-4 w-full">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-gradient-to-r from-slate-100/80 to-slate-200/60 px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm backdrop-blur-sm flex-shrink-0">
                        <Clock size={12} className="text-slate-500 flex-shrink-0" />
                        <span className="whitespace-nowrap">{template.yearsOfExperience} years experience</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-200/50 w-full">
                      <div className="flex items-center space-x-3">
                        <motion.button
                          className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => handleLike(e, template)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThumbsUp className="mr-1" size={14} />
                          {likes[template._id] || 0}
                        </motion.button>
                        <motion.button
                          className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => handleDislike(e, template)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ThumbsDown className="mr-1" size={14} />
                          {dislikes[template._id] || 0}
                        </motion.button>
                      </div>
                      
                      <motion.button
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full transition-colors text-xs sm:text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCommentModal(template._id);
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>Comments</span>
                      </motion.button>
                    </div>

                    {/* Premium hover hint */}
                    {isFullWidth && (
                      <motion.div 
                        className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full"
                        initial={{ y: 10 }}
                        animate={{ y: 0 }}
                      >
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-gradient-to-r from-blue-50/80 to-green-50/60 px-3 py-2 rounded-lg border border-blue-200/40 w-fit">
                          <Sparkles size={12} className="flex-shrink-0" />
                          <span className="whitespace-nowrap">Professional resume template</span>
                          <ExternalLink size={12} className="flex-shrink-0" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Comments Modals */}
      {templates.map(template => (
        <AnimatePresence key={`modal-${template._id}`}>
          {commentModals[template._id] && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] flex flex-col"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl relative flex items-center justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">Discussion</h3>
                    <p className="text-blue-200 text-sm mt-1">Share your thoughts about this resume template</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCommentModal(template._id)}
                    className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar">
                    <ResumeCommentSection resId={template._id} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #60a5fa #e0f2fe;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e0f2fe;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #60a5fa;
          border-radius: 4px;
          border: 2px solid #e0f2fe;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3b82f6;
        }
      `}</style>
    </>
  );
}