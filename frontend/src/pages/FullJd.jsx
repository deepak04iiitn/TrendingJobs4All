import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BookmarkIcon, Share2, MapPin, Briefcase, Clock, BarChart3, ExternalLink, Sparkles } from "lucide-react";
import Modal from "react-modal";
import { ShareSocial } from "react-share-social";
import CommentSection from "../components/CommentSection";
import { useSelector } from "react-redux";

Modal.setAppElement("#root");


const Toast = ({ show, message, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className={`fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out ${
      show 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95 pointer-events-none'
    }`}>
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl shadow-green-500/20 border-l-4 border-l-green-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p className="text-slate-800 font-semibold text-sm">{message}</p>
            <p className="text-slate-600 text-xs mt-1">Ready to share with others!</p>
          </div>
          <button
            onClick={onHide}
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom loading spinner component
const LoadingSpinner = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
  </div>
);

export default function FullJd() {
  const { id, url } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedJob = location.state?.job;
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  // Helper to get jobKey from URL
  const getJobKeyFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('jobKey');
  };

  useEffect(() => {
    if (userId) {
      if (passedJob) {
        setJob(passedJob);
        checkIfJobIsSaved(passedJob._id);
      } else {
        // Try to get job from sessionStorage if jobKey is present
        const jobKey = getJobKeyFromUrl();
        if (jobKey) {
          const storedJob = sessionStorage.getItem(jobKey);
          if (storedJob) {
            try {
              const jobObj = JSON.parse(storedJob);
              setJob(jobObj);
              checkIfJobIsSaved(jobObj._id);
              return;
            } catch (e) {
              // Fallback to fetch if parsing fails
            }
          }
        }
        axios
          .get(`/backend/naukri/${url}/${id}`)
          .then((response) => {
            const jobData = response.data;
            setJob(jobData);
            checkIfJobIsSaved(jobData._id);
          })
          .catch((error) => console.error("Error fetching job data:", error));
      }
    }
  }, [id, url, userId, passedJob]);

  const handleSaveJob = async () => {
    try {
        if (isSaved) {
            // When removing a saved job, use the saved job's _id, not the original job's _id
            await axios.delete(`/backend/saved-jobs/${userId}/${job._id}`);
            setIsSaved(false);
        } else {
            console.log("Current job data:", job);
            
            // Validate required data before sending
            if (!job._id || !job.title || !job.company) {
                console.error("Missing required job data:", job);
                alert("Unable to save job - missing required information");
                return;
            }

            const jobData = {
                jobId: job._id,
                title: job.title,
                company: job.company,
                location: Array.isArray(job.location) ? job.location : [job.location || "Not specified"],
                min_exp: job.min_exp ? Number(job.min_exp) : 0,
                full_jd: job.jd || job.full_jd || "No description available",
                apply_link: job.apply_link || "#",
                time: job.time || job.date || new Date().toISOString()
            };

            console.log("Sending job data:", jobData);

            const response = await axios.post(`/backend/saved-jobs/${userId}`, jobData);
            console.log("Save response:", response.data);
            
            setIsSaved(true);
            // Don't navigate immediately, let user stay on the page
            // navigate("/my-jobs");
        }
    } catch (err) {
        console.error("Error saving job:", err);
        
        // Handle specific error cases
        if (err.response?.status === 400) {
            const message = err.response.data.message || "Invalid data provided";
            alert(`Unable to save job: ${message}`);
        } else if (err.response?.status === 500) {
            console.error("Server error details:", err.response.data);
            alert("Server error occurred. Please try again later.");
        } else {
            alert("Network error occurred. Please check your connection.");
        }
    }
};

// Updated checkIfJobIsSaved function to handle the correct comparison
const checkIfJobIsSaved = async (jobId) => {
    try {
        const { data } = await axios.get(`/backend/saved-jobs/${userId}`);
        // Compare with the original jobId, not the saved job's _id
        const saved = data.some((savedJob) => savedJob.jobId === jobId);
        setIsSaved(saved);
    } catch (err) {
        console.error("Error checking saved jobs:", err);
    }
};

  const toggleShareModal = () => setIsModalOpen((prev) => !prev);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatJobDescription = (description) => {
    if (!description) return "";
    return description.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Access Required
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Sign in to unlock premium job details, save opportunities, and connect with your dream career.
          </p>
          <button
            onClick={() => navigate("/sign-in")}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 lg:px-8 mt-16">
      {job ? (
        <div className="max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8 hover:shadow-3xl transition-all duration-500">
            {/* Top Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                    Active Position
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 bg-clip-text text-transparent mb-3 leading-tight">
                  {job.title}
                </h1>
                <p className="text-xl text-slate-600 font-medium">{job.company}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveJob}
                  className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isSaved 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 shadow-lg shadow-amber-500/25" 
                      : "bg-white/60 border-slate-200 hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50"
                  }`}
                  title={isSaved ? "Remove from saved" : "Save this job"}
                >
                  <BookmarkIcon 
                    size={24} 
                    className={`transition-all duration-300 ${
                      isSaved ? "text-white fill-current" : "text-slate-600 group-hover:text-amber-600"
                    }`}
                  />
                  {isSaved && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </button>

                <button
                  onClick={toggleShareModal}
                  className="group p-4 rounded-2xl border-2 border-slate-200 bg-white/60 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                  title="Share this opportunity"
                >
                  <Share2 size={24} className="text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
                </button>
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-xl">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700 uppercase tracking-wide">Company</span>
                </div>
                <p className="text-slate-800 font-semibold text-lg">{job.company}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500 rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-emerald-700 uppercase tracking-wide">Location</span>
                </div>
                <p className="text-slate-800 font-semibold text-lg">{Array.isArray(job.location) ? job.location.join(", ") : job.location}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">Experience</span>
                </div>
                <p className="text-slate-800 font-semibold text-lg">{job.min_exp} years</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-700 uppercase tracking-wide">Posted</span>
                </div>
                <p className="text-slate-800 font-semibold text-lg">{formatDate(job.time)}</p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-center">
              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl shadow-purple-500/25"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Job Description</h2>
                <p className="text-slate-600 mt-1">Everything you need to know about this role</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <p className="text-amber-800 font-medium">
                  <strong>Note:</strong> If the apply link doesn't work, please check the company's career page directly.
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="text-slate-700 leading-relaxed space-y-4 text-lg">
                {formatJobDescription(job.full_jd)}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold">💬</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Discussion</h2>
                <p className="text-slate-600 mt-1">Share your thoughts and connect with others</p>
              </div>
            </div>
            <CommentSection jobId={job._id} />
          </div>

          {/* Share Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={toggleShareModal}
          className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-0 shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
          overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50"
        >
          <div className="relative">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Share This Opportunity</h2>
                <p className="text-white/90 text-sm">Help others discover this amazing job</p>
              </div>
              
              {/* Close button */}
              <button
                onClick={toggleShareModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 group"
              >
                <span className="text-white text-lg font-light group-hover:rotate-90 transition-transform duration-200">×</span>
              </button>
            </div>

            {/* Share options */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* LinkedIn */}
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl border border-blue-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-blue-700 font-semibold text-sm">LinkedIn</span>
                </a>

                {/* Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this amazing job opportunity: ${job.title} at ${job.company}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-6 bg-gradient-to-br from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 rounded-2xl border border-sky-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="text-sky-700 font-semibold text-sm">Twitter</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company} - ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl border border-green-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                  </div>
                  <span className="text-green-700 font-semibold text-sm">WhatsApp</span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job.title}`)}&body=${encodeURIComponent(`I found this interesting job opportunity that might interest you:\n\n${job.title} at ${job.company}\n\nLocation: ${Array.isArray(job.location) ? job.location.join(', ') : job.location}\nExperience: ${job.min_exp} years\n\nCheck it out: ${window.location.href}`)}`}
                  className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl border border-gray-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 font-semibold text-sm">Email</span>
                </a>
              </div>

              {/* Copy Link Section */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600 mb-4 text-center">Or copy the link</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setToastMessage('Link copied to clipboard!');
                      setShowToast(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            </div>
          </Modal>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl p-12 text-center shadow-2xl max-w-md mx-auto">
            {/* Loading Animation */}
            <div className="flex justify-center mb-8">
              <LoadingSpinner />
            </div>
            
            {/* Loading Text */}
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-purple-700 bg-clip-text text-transparent mb-4">
              Loading Job Details
            </h2>
            
            <p className="text-slate-600 font-medium text-lg mb-6 leading-relaxed">
              Fetching premium job information for you...
            </p>
            
            {/* Loading Progress Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast 
        show={showToast} 
        message={toastMessage} 
        onHide={() => setShowToast(false)} 
      />
    </div>
  );
}