import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Component imports
import ResumeHeader from '../components/ResumeHeader';
import ResumeFilterModal from '../components/ResumeFilterModal';
import ResumeTemplateForm from '../components/ResumeTemplateForm';
import ResumeEmptyState from '../components/ResumeEmptyState';
import ResumeSidebar from '../components/ResumeSidebar';

export default function ResumeTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  // Single filters state that gets applied immediately
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
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
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/resumeTemplates/getResume');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
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

  const handleTemplateSelect = (template) => {
    // You can customize this behavior - open in new tab, navigate, etc.
    console.log('Selected template:', template);
    // Example: navigate to template detail page
    // navigate(`/resume-template/${template._id}`);
  };

  // Filter and sort templates using the current filters state
  const filteredTemplates = templates
    .filter(template => {
      const companyMatch = template.company.toLowerCase().includes(filters.companySearch.toLowerCase());
      const positionMatch = template.position.toLowerCase().includes(filters.positionSearch.toLowerCase());
      const yoeMatch = filters.yoeSearch === '' || 
        (template.yearsOfExperience !== undefined && template.yearsOfExperience.toString() === filters.yoeSearch);
      
      return companyMatch && positionMatch && yoeMatch;
    })
    .sort((a, b) => {
      const [field, order] = filters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchTemplates();
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
          <ResumeHeader
            onFilterClick={toggleFilterModal}
            onApplyFilters={() => {}} // Filters are applied immediately now
            onShareClick={toggleModal}
          />
        </motion.div>

        {/* Mobile Sidebar Toggle */}
        {filteredTemplates.length > 0 && (
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={toggleMobileSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors w-full max-w-sm"
            >
              <Menu size={20} className="flex-shrink-0" />
              <span className="font-medium truncate">Browse Templates</span>
              <span className="text-sm text-gray-500 flex-shrink-0">({filteredTemplates.length})</span>
            </button>
          </div>
        )}

        {/* Main Content Area - Full Width Sidebar */}
        {filteredTemplates.length > 0 ? (
          <motion.div 
            className="w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Desktop Sidebar - Full Width */}
            <div className="hidden lg:block w-full">
              <ResumeSidebar
                templates={filteredTemplates}
                selectedTemplate={null}
                onTemplateSelect={handleTemplateSelect}
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
                      <h2 className="text-lg font-semibold text-gray-900 truncate">Resume Templates</h2>
                      <button
                        onClick={toggleMobileSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="h-full overflow-hidden">
                      <ResumeSidebar
                        templates={filteredTemplates}
                        selectedTemplate={null}
                        onTemplateSelect={(template) => {
                          handleTemplateSelect(template);
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
              <ResumeSidebar
                templates={filteredTemplates}
                selectedTemplate={null}
                onTemplateSelect={handleTemplateSelect}
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
            <ResumeEmptyState />
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
              <ResumeTemplateForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <ResumeFilterModal
              isOpen={isFilterModalOpen}
              onClose={toggleFilterModal}
              filters={filters}
              onSave={handleSaveAndApplyFilters}
              onClear={handleClearFilters}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}