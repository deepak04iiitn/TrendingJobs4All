import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function MyInterviews() {

  const { currentUser } = useSelector((state) => state.user);
  const [experiences, setExperiences] = useState([]);
  const [visibleExperiences, setVisibleExperiences] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch(`/backend/user/interviews/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    }
  };


  const handleDeleteExperience = async () => {
    try {
        const response = await fetch(`/backend/interviews/delete/${selectedExperienceId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete experience');
        }

        setExperiences(prev => prev.filter(exp => exp._id !== selectedExperienceId));

        setDeleteModalOpen(false);

    } catch (error) {
        console.error('Error deleting experience:', error);
    }
};


  // Open delete confirmation modal
  const openDeleteModal = (experienceId) => {
    setSelectedExperienceId(experienceId);
    setDeleteModalOpen(true);
  };

  // Show more experiences
  const handleShowMore = () => {
    setVisibleExperiences(prev => prev + 10);
  };


  const renderEmptyState = () => (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center bg-white shadow-xl rounded-2xl p-8 transform transition-all duration-500 hover:scale-105">
        <div className="mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-24 w-24 mx-auto text-blue-500 opacity-70"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Interview Journey Begins Here
        </h2>
        <p className="text-gray-600 mb-6">
          It looks like you haven't shared any interview experiences yet. 
          Your insights can help others navigate their career paths!
        </p>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto space-x-2 group"
          onClick={() => navigate('/interviewExp')}
        >
          <FaPlus className="group-hover:rotate-180 transition-transform" />
          <span>Share Your First Experience</span>
        </button>
        <div className="mt-6 border-t pt-4 text-sm text-gray-500">
          By sharing, you contribute to a community of learning and growth.
        </div>
      </div>
    </div>
  );



  return (
    <div className="container mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 mb-8 rounded-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-white"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                My Interview Experiences
              </h1>
              <p className="text-white text-opacity-80 text-lg">
                Explore, manage, and track your professional journey through shared interview insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {experiences.length === 0 ? (
        renderEmptyState()
      ) : (

        <>
          {/* Experiences Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto"> {/* Add this wrapper for horizontal scrolling */}
          <table className="w-full table-auto min-w-[600px]"> {/* Add min-w-[600px] to ensure scrollability */}
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">No of Likes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">No of Dislikes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {experiences.slice(0, visibleExperiences).map((exp) => (
                <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">{exp.company}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{exp.position}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{exp.numberOfLikes}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{exp.numberOfDislikes}</td>
                  <td className="px-4 py-4 whitespace-nowrap space-x-2">
                    <button 
                      className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-500"
                      onClick={() => openDeleteModal(exp._id)}
                    >
                      <FaTrash className="mr-2" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        </>

      )}

      
      {/* Show More Button */}
      {visibleExperiences < experiences.length && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleShowMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show More Experiences
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this interview experience? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteExperience}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
