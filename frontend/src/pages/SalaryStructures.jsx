import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Components
import SalaryHeader from '../components/SalaryHeader';
import SalaryFilterModal from '../components/SalaryFilterModal';
import SalaryForm from '../components/SalaryForm';
import SalaryEmptyState from '../components/SalaryEmptyState';
import SalarySidebar from '../components/SalarySidebar'; // You'll need to create this component

export default function SalaryStructures() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    locationSearch: '',
    experienceFilter: '',
    sortConfig: 'ctc-desc'
  });

  const [appliedFilters, setAppliedFilters] = useState({
    companySearch: '',
    positionSearch: '',
    locationSearch: '',
    experienceFilter: '',
    sortConfig: 'ctc-desc'
  });

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
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
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/salary/getSalary');
      if (!response.ok) {
        throw new Error('Failed to fetch salaries');
      }
      const data = await response.json();
      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFilters = (newFilters) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters); // Apply filters immediately when saved
  };

  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters); // Apply cleared filters immediately
  };

  const handleSalarySelect = (salary) => {
    // Navigate to salary detail page or open in new tab
    window.open(`/salary/${salary._id}`, '_blank');
  };

  const filteredSalaries = salaries
    .filter(salary => {
      const companyMatch = salary.company.toLowerCase().includes(appliedFilters.companySearch.toLowerCase());
      const positionMatch = salary.position.toLowerCase().includes(appliedFilters.positionSearch.toLowerCase());
      const locationMatch = salary.location.toLowerCase().includes(appliedFilters.locationSearch.toLowerCase());
      const experienceMatch = !appliedFilters.experienceFilter || 
        salary.yearsOfExperience === parseInt(appliedFilters.experienceFilter);
      
      return companyMatch && positionMatch && locationMatch && experienceMatch;
    })
    .sort((a, b) => {
      const [field, order] = appliedFilters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'ctc') {
        const ctcA = parseFloat(a.ctc);
        const ctcB = parseFloat(b.ctc);
        return (ctcA - ctcB) * sortValue;
      } else if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      } else if (field === 'dislikes') {
        return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchSalaries();
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
          <SalaryHeader
            onFilterClick={toggleFilterModal}
            onShareClick={toggleModal}
          />
        </motion.div>

        {/* Mobile Sidebar Toggle */}
        {filteredSalaries.length > 0 && (
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={toggleMobileSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors w-full max-w-sm"
            >
              <Menu size={20} className="flex-shrink-0" />
              <span className="font-medium truncate">Browse Salaries</span>
              <span className="text-sm text-gray-500 flex-shrink-0">({filteredSalaries.length})</span>
            </button>
          </div>
        )}

        {/* Main Content Area - Full Width Sidebar */}
        {filteredSalaries.length > 0 ? (
          <motion.div 
            className="w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Desktop Sidebar - Full Width */}
            <div className="hidden lg:block w-full">
              <SalarySidebar
                salaries={filteredSalaries}
                selectedSalary={null}
                onSalarySelect={handleSalarySelect}
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
                      <h2 className="text-lg font-semibold text-gray-900 truncate">Salary Structures</h2>
                      <button
                        onClick={toggleMobileSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="h-full overflow-hidden">
                      <SalarySidebar
                        salaries={filteredSalaries}
                        selectedSalary={null}
                        onSalarySelect={(salary) => {
                          handleSalarySelect(salary);
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
              <SalarySidebar
                salaries={filteredSalaries}
                selectedSalary={null}
                onSalarySelect={handleSalarySelect}
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
            <SalaryEmptyState />
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
              <SalaryForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <SalaryFilterModal
              isOpen={isFilterModalOpen}
              onClose={toggleFilterModal}
              filters={filters}
              onSave={handleSaveFilters}
              onClear={handleClearFilters}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}