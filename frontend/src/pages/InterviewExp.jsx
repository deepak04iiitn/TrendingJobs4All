import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import InterviewForm from '../components/InterviewForm';
import InterviewEmptyState from '../components/InterviewEmptyState';
import InterviewHeader from '../components/InterviewHeader';
import InterviewFilterModal from '../components/InterviewFilterModal';
import InterviewSidebar from '../components/InterviewSidebar';
import { useSelector } from 'react-redux';
import { Menu, X } from 'lucide-react';

export default function InterviewExp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const {currentUser} = useSelector((state) => state.user);
  
  const navigate = useNavigate();
  
  // Single filters state that gets applied immediately
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
    verdictFilter: '',
    sortConfig: 'rating-desc'
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!currentUser?.email) {
        setIsPremiumUser(false);
        setIsCheckingPremium(false);
        return;
      }

      try {
        const response = await fetch('/backend/premium');
        const premiumUsers = await response.json();
        
        const userIsPremium = premiumUsers.some(user => user.email === currentUser.email);
        setIsPremiumUser(userIsPremium);
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremiumUser(false);
      } finally {
        setIsCheckingPremium(false);
      }
    };

    checkPremiumStatus();
  }, [currentUser]);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/interviews/getInterviewExp');
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving filters and applying them immediately
  const handleSaveAndApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
  };

  const handleExperienceSelect = (experience) => {
    // Use the MongoDB _id directly in the URL
    window.open(`/interview-experience/${experience._id}`, '_blank');
  };

  // Filter and sort experiences using the current filters state
  const filteredExperiences = experiences
    .filter(exp => {
      const companyMatch = (exp.company || '').toLowerCase().includes(filters.companySearch.toLowerCase());
      const positionMatch = (exp.position || '').toLowerCase().includes(filters.positionSearch.toLowerCase());
      const yoeMatch = filters.yoeSearch === '' || 
        (exp.yoe !== undefined && exp.yoe.toString() === filters.yoeSearch);
      const verdictMatch = filters.verdictFilter === '' || 
        (exp.verdict && exp.verdict.toLowerCase() === filters.verdictFilter.toLowerCase());
      
      return companyMatch && positionMatch && yoeMatch && verdictMatch;
    })
    .sort((a, b) => {
      const [field, order] = filters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'rating') {
        return ((a.rating || 0) - (b.rating || 0)) * sortValue;
      } else if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchExperiences();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 lg:mb-8 w-full"
        >
          <InterviewHeader
            onFilterClick={toggleFilterModal}
            onShareClick={toggleModal}
          />
        </motion.div>

        {/* Mobile Sidebar Toggle */}
        {filteredExperiences.length > 0 && (
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={toggleMobileSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors w-full max-w-sm"
            >
              <Menu size={20} className="flex-shrink-0" />
              <span className="font-medium truncate">Browse Experiences</span>
              <span className="text-sm text-gray-500 flex-shrink-0">({filteredExperiences.length})</span>
            </button>
          </div>
        )}

        {/* Main Content Area - Full Width Sidebar */}
        {filteredExperiences.length > 0 ? (
          <motion.div 
            className="w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Desktop Sidebar - Full Width */}
            <div className="hidden lg:block w-full">
              <InterviewSidebar
                experiences={filteredExperiences}
                selectedExperience={null}
                onExperienceSelect={handleExperienceSelect}
                isFullWidth={true}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {isMobileSidebarOpen && (
                <motion.div
                  className="fixed inset-0 z-50 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Backdrop */}
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={toggleMobileSidebar}
                  />
                  
                  {/* Sidebar */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-hidden"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">Interview Experiences</h2>
                      <button
                        onClick={toggleMobileSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="h-full overflow-hidden">
                      <InterviewSidebar
                        experiences={filteredExperiences}
                        selectedExperience={null}
                        onExperienceSelect={(exp) => {
                          handleExperienceSelect(exp);
                          setIsMobileSidebarOpen(false);
                        }}
                        isMobile={true}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile List - Show on mobile when sidebar is not open */}
            <div className="lg:hidden w-full overflow-hidden">
              <InterviewSidebar
                experiences={filteredExperiences}
                selectedExperience={null}
                onExperienceSelect={handleExperienceSelect}
                isMobile={true}
                isFullWidth={true}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full overflow-hidden"
          >
            <InterviewEmptyState />
          </motion.div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={toggleModal}
            >
              <InterviewForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <InterviewFilterModal
              isOpen={isFilterModalOpen}
              onClose={toggleFilterModal}
              filters={filters}
              onSaveAndApply={handleSaveAndApplyFilters}
              onClear={handleClearFilters}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}