import React, { useState, useEffect } from 'react';
import { TrashIcon, BriefcaseIcon, MapPinIcon, ClockIcon, BookmarkIcon, StarIcon, ExternalLinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const formatUrlString = (company, title) => {
  const formatString = (str) => str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  return `${formatString(company)}-${formatString(title)}`;
};

export default function MyJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await axios.get(`/backend/saved-jobs/${userId}`);
        setSavedJobs(response.data);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };

    if (userId) {
      fetchSavedJobs();
    }
  }, [userId]);

  const handleRemoveJob = async (jobId, event) => {
    event.stopPropagation();
    try {
      await axios.delete(`/backend/saved-jobs/${userId}/${jobId}`);
      setSavedJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (err) {
      console.error("Error removing job:", err);
    }
  };

  const handleCardClick = (jobId, company, title) => {
    const formattedUrl = formatUrlString(company, title);
    navigate(`/fulljd/${formattedUrl}/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 mt-10">
      {/* Floating Header with Glass Effect */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Premium Icon Container */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-25"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <BookmarkIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            {/* Premium Typography */}
            <h1 className="text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6 tracking-tight">
              Your Dream Jobs
            </h1>
            <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Curated opportunities that match your ambitions and aspirations
            </p>
            
            {/* Stats Badge */}
            <div className="mt-8 inline-flex items-center">
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-full px-8 py-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-700 font-semibold text-lg">{savedJobs.length}</span>
                  </div>
                  <span className="text-slate-600 font-medium">saved opportunities</span>
                  <StarIcon className="h-5 w-5 text-amber-500 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-8 relative z-10">
        {savedJobs.length === 0 ? (
          /* Empty State with Premium Design */
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-blue-100/50 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-6 rounded-2xl">
                  <BookmarkIcon className="h-16 w-16 text-slate-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Your Collection Awaits</h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
                Start building your dream job collection by bookmarking positions that inspire you
              </p>
              <div className="mt-8">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Explore Opportunities
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job, index) => (
              <div
                key={job._id}
                onClick={() => handleCardClick(job.jobId, job.company, job.title)}
                className="group relative cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Card Background with Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden group-hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                  {/* Premium Header */}
                  <div className="relative p-6 bg-gradient-to-r from-slate-50 to-blue-50/50">
                    <div className="flex items-center justify-between mb-4">
                      {/* Experience Badge */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-sm opacity-25"></div>
                        <span className="relative inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                          {job.min_exp}+ years
                        </span>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleRemoveJob(job._id, e)}
                        className="relative p-2 rounded-full bg-white/50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
                      >
                        <TrashIcon size={18} className="group-hover/btn:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 mb-4 line-clamp-2">
                      {job.title}
                    </h2>
                    
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center text-slate-600 group/item hover:text-slate-800 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-2 rounded-lg mr-3">
                          <BriefcaseIcon size={16} className="text-blue-600" />
                        </div>
                        <p className="font-medium truncate">{job.company}</p>
                      </div>
                      
                      <div className="flex items-center text-slate-600 group/item hover:text-slate-800 transition-colors duration-200">
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-2 rounded-lg mr-3">
                          <MapPinIcon size={16} className="text-emerald-600" />
                        </div>
                        <p className="font-medium truncate">{job.location.join(", ")}</p>
                      </div>
                    </div>
                    
                    {/* Premium Apply Button */}
                    <div className="mt-auto">
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/apply relative inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Apply Now</span>
                        <ExternalLinkIcon size={16} className="ml-2 group-hover/apply:translate-x-1 transition-transform duration-200" />
                        
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/apply:opacity-100 group-hover/apply:animate-pulse rounded-xl"></div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}