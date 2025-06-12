import React, { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReferralForm from '../components/ReferralForm';
import ReferralCard from '../components/ReferralCard';
import ReferralHeader from '../components/ReferralHeader';
import ReferralFilterModal from '../components/ReferralFilterModal';
import ReferralEmptyState from '../components/ReferralEmptyState';
import ReferralSidebar from '../components/ReferralSidebar';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Referrals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  // Filters state that gets applied when user saves filters
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    jobIdSearch: '',
    sortConfig: 'likes-desc'
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
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/referrals/getReferral');
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving filters - this now applies the filters immediately
  const handleSaveFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
  };

  const handleReferralSelect = (referral) => {
    setSelectedReferral(referral);
    window.open(`/referral/${referral._id}`, '_blank');
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // Filter and sort referrals using the current filters state
  const filteredReferrals = referrals
    .filter(ref => {
      const companyMatch = safeString(ref.company).includes(safeString(filters.companySearch));
      const positionMatch = filters.positionSearch === '' || (
        ref.positions?.some(pos => 
          safeString(pos.position).includes(safeString(filters.positionSearch))
        )
      );
      const jobIdMatch = filters.jobIdSearch === '' || (
        ref.positions?.some(pos => 
          pos.jobid && safeString(pos.jobid).includes(safeString(filters.jobIdSearch))
        )
      );
      return companyMatch && positionMatch && jobIdMatch;
    })
    .sort((a, b) => {
      const [field, order] = filters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      } else if (field === 'dislikes') {
        return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchReferrals();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <ReferralHeader
            onFilterClick={toggleFilterModal}
            onShareClick={toggleModal}
          />
        </motion.div>

        {/* Mobile Sidebar Toggle */}
        {filteredReferrals.length > 0 && (
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={toggleMobileSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors w-full max-w-sm"
            >
              <Menu size={20} className="flex-shrink-0" />
              <span className="font-medium truncate">Browse Referrals</span>
              <span className="text-sm text-gray-500 flex-shrink-0">({filteredReferrals.length})</span>
            </button>
          </div>
        )}

        {/* Main Content Area - Full Width Sidebar */}
        {filteredReferrals.length > 0 ? (
          <motion.div 
            className="w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Desktop Sidebar - Full Width */}
            <div className="hidden lg:block w-full">
              <ReferralSidebar
                referrals={filteredReferrals}
                selectedReferral={selectedReferral}
                onReferralSelect={handleReferralSelect}
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
                      <h2 className="text-lg font-semibold text-gray-900 truncate">Job Referrals</h2>
                      <button
                        onClick={toggleMobileSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="h-full overflow-hidden">
                      <ReferralSidebar
                        referrals={filteredReferrals}
                        selectedReferral={selectedReferral}
                        onReferralSelect={(ref) => {
                          handleReferralSelect(ref);
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
              <ReferralSidebar
                referrals={filteredReferrals}
                selectedReferral={selectedReferral}
                onReferralSelect={handleReferralSelect}
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
            <ReferralEmptyState />
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
              <ReferralForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <ReferralFilterModal
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

const SearchInput = ({ placeholder, value, onChange }) => (
  <motion.div 
    className="relative flex-grow"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 border border-indigo-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 bg-white bg-opacity-80 backdrop-blur-sm"
    />
    <Search className="absolute left-3 top-2.5 text-indigo-400" size={20} />
  </motion.div>
);