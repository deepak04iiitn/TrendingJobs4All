import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function MySalary() {

  const { currentUser } = useSelector((state) => state.user);
  const [salaries, setSalaries] = useState([]);
  const [visibleSalaries, setVisibleSalaries] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await fetch(`/backend/user/salary/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch salaries');
      }
      const data = await response.json();
      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
  };


  const handleDeleteSalary = async () => {
    try {
        const response = await fetch(`/backend/salary/delete/${selectedSalaryId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete salary');
        }

        setSalaries(prev => prev.filter(sal => sal._id !== selectedSalaryId));

        setDeleteModalOpen(false);

    } catch (error) {
        console.error('Error deleting salary:', error);
    }
};


  // Open delete confirmation modal
  const openDeleteModal = (salaryId) => {
    setSelectedSalaryId(salaryId);
    setDeleteModalOpen(true);
  };

  // Show more experiences
  const handleShowMore = () => {
    setVisibleSalaries(prev => prev + 10);
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
          Your Salary Structures Journey Begins Here
        </h2>
        <p className="text-gray-600 mb-6">
          It looks like you haven't shared any salary  structure yet. 
          Your insights can help others navigate their career paths!
        </p>
        <button 
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto space-x-2 group"
          onClick={() => navigate('/salaryStructures')}
        >
          <FaPlus className="group-hover:rotate-180 transition-transform" />
          <span>Share Your First Salary Structure</span>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                My Salary Structures
              </h1>
              <p className="text-white text-opacity-80 text-lg">
                Track, analyze, and manage your comprehensive salary information and contributions
              </p>
            </div>
          </div>
        </div>
      </div>

      {salaries.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Salary Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[600px]">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">CTC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">No of Likes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">No of Dislikes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salaries.slice(0, visibleSalaries).map((sal) => (
                    <tr key={sal._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">{sal.company}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{sal.position}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{sal.ctc}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{sal.numberOfLikes}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{sal.numberOfDislikes}</td>
                      <td className="px-4 py-4 whitespace-nowrap space-x-2">
                        <button 
                          className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-500"
                          onClick={() => openDeleteModal(sal._id)}
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
      {visibleSalaries < salaries.length && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleShowMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show More Salaries
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
              Are you sure you want to delete this salary structure? 
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
                onClick={handleDeleteSalary}
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
