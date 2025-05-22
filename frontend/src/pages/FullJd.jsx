import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BookmarkIcon, Share2, MapPin, Briefcase, Clock, BarChart3 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-purple-300">
        <h2 className="text-4xl font-extrabold text-indigo-900 mb-6">
          Please Sign In to View Job Details
        </h2>
        <p className="text-lg text-gray-800 mb-6">
          Access job details, save your favorite jobs, and share them with others!
        </p>
        <button
          onClick={() => navigate("/sign-in")}
          className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 hover:scale-105 transition-transform duration-300 shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-20 px-4 lg:px-20">
      {job ? (
        <div className="bg-gradient-to-br from-blue-100 via-purple-300 to-indigo-400 p-10 rounded-xl shadow-xl transform transition-all duration-700 hover:scale-105 hover:shadow-2xl animate-slideIn">
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-extrabold text-indigo-900 mb-4 animate-fadeInUp tracking-wide">
              {job.title}
            </h2>

            <div className="flex items-center space-x-4 lg:space-x-6">
              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-full shadow-lg ${
                  isSaved ? "bg-yellow-400" : "bg-gray-300"
                } hover:bg-yellow-500 transition-colors duration-300 ease-out transform hover:scale-110`}
                title={isSaved ? "Unsave Job" : "Save Job"}
              >
                <BookmarkIcon size={26} color={isSaved ? "white" : "black"} />
              </button>

              <button
                onClick={toggleShareModal}
                className="p-2 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 transition-transform duration-300 ease-out transform hover:scale-110 flex items-center justify-center"
                title="Share this job"
              >
                <Share2 size={26} color="white" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 text-lg text-gray-800 font-medium">
            <div className="flex items-center space-x-2">
              <Briefcase className="text-purple-700" />
              <p>
                <span className="text-purple-700 font-bold">Company:</span> {job.company}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="text-purple-700" />
              <p>
                <span className="text-purple-700 font-bold">Location:</span>{" "}
                {job.location.join(", ")}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <BarChart3 className="text-purple-700" />
              <p>
                <span className="text-purple-700 font-bold">Experience:</span>{" "}
                {job.min_exp} years
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="text-purple-700" />
              <p>
                <span className="text-purple-700 font-bold">Posted on:</span>{" "}
                {formatDate(job.time)}
              </p>
            </div>
          </div>

          <div className="mt-6 text-lg text-gray-800 font-medium">
            <span className="text-purple-700 font-bold">Job Description : </span>
            <span> *NOTE :- If apply link is not working , request you to search on career page!*</span>
            <div className="ml-10 mt-4 space-y-2 leading-relaxed">
              {formatJobDescription(job.full_jd)}
            </div>
          </div>

          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-8 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-2xl"
          >
            Apply Here
          </a>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={toggleShareModal}
            className="bg-gradient-to-tr from-purple-500 via-pink-500 to-red-400 p-8 rounded-lg shadow-2xl animate-fadeInUp scale-105 w-full max-w-lg mx-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Share This Amazing Job!
            </h2>
            <ShareSocial
              url={window.location.href}
              socialTypes={["facebook", "twitter", "linkedin", "reddit", "whatsapp"]}
              onSocialButtonClicked={(data) => console.log("Shared on:", data)}
            />
            <button
              className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 w-full"
              onClick={toggleShareModal}
            >
              Close
            </button>
          </Modal>

          <div className="flex flex-col mt-20">
            <h1 className="text-blue-900 font-bold text-3xl mb-6">Comment Section</h1>
            <CommentSection jobId={job._id} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20">
          <PuffLoader size={60} color="#4A90E2" />
          <span>Loading Job Details</span>
        </div>
      )}
    </div>
  );
}
