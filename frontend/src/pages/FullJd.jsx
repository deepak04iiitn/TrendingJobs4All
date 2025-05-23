import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BookmarkIcon, Share2, MapPin, Briefcase, Clock, BarChart3, ExternalLink, Sparkles } from "lucide-react";
import Modal from "react-modal";
import { ShareSocial } from "react-share-social";
import CommentSection from "../components/CommentSection";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";

Modal.setAppElement("#root");

export default function FullJd() {
  const { id, url } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  useEffect(() => {
    if (userId) {
      axios
        .get(`/backend/naukri/${url}/${id}`)
        .then((response) => {
          const jobData = response.data;
          setJob(jobData);
          checkIfJobIsSaved(jobData._id);
        })
        .catch((error) => console.error("Error fetching job data:", error));
    }
  }, [id, url, userId]);

  const checkIfJobIsSaved = async (jobId) => {
    try {
      const { data } = await axios.get(`/backend/saved-jobs/${userId}`);
      const saved = data.some((savedJob) => savedJob.jobId === jobId);
      setIsSaved(saved);
    } catch (err) {
      console.error("Error checking saved jobs:", err);
    }
  };

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await axios.delete(`/backend/saved-jobs/${userId}/${job._id}`);
        setIsSaved(false);
      } else {
        const jobData = {
          jobId: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          min_exp: job.min_exp,
          full_jd: job.full_jd,
          apply_link: job.apply_link,
          time: job.time,
        };

        await axios.post(`/backend/saved-jobs/${userId}`, jobData);
        setIsSaved(true);
        navigate("/my-jobs");
      }
    } catch (err) {
      console.error("Error saving job:", err);
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
                <p className="text-slate-800 font-semibold text-lg">{job.location.join(", ")}</p>
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
            className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md mx-auto"
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Share This Job</h2>
              <p className="text-slate-600 mb-8">Help others discover this amazing opportunity</p>
              
              <div className="mb-8">
                <ShareSocial
                  url={window.location.href}
                  socialTypes={["facebook", "twitter", "linkedin", "reddit", "whatsapp"]}
                  onSocialButtonClicked={(data) => console.log("Shared on:", data)}
                />
              </div>

              <button
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-4 rounded-2xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-300"
                onClick={toggleShareModal}
              >
                Close
              </button>
            </div>
          </Modal>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
            <PuffLoader size={80} color="#8B5CF6" />
            <p className="text-slate-600 font-medium text-xl mt-6">Loading premium job details...</p>
          </div>
        </div>
      )}
    </div>
  );
}