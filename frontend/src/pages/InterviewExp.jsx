import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import InterviewForm from '../components/InterviewForm';
import InterviewEmptyState from '../components/InterviewEmptyState';
import InterviewHeader from '../components/InterviewHeader';
import InterviewFilterModal from '../components/InterviewFilterModal';
import InterviewSidebar from '../components/InterviewSidebar';
import InterviewDetailPanel from '../components/InterviewDetailPanel';
import { useSelector } from 'react-redux';

export default function InterviewExp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const {currentUser} = useSelector((state) => state.user);
  
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
    verdictFilter: '',
    sortConfig: 'rating-desc'
  });
  const [appliedFilters, setAppliedFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
    verdictFilter: '',
    sortConfig: 'rating-desc'
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  // Generate URL-friendly slug from company and position
  const generateSlug = (company, position, id) => {
    const baseText = `${company}-${position}`;
    const baseSlug = baseText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Only generate hash if id is provided
    if (id) {
      // Simple hash function for the ID
      const hash = id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a; // Convert to 32-bit integer
      }, 0);
      
      return `${baseSlug}-${Math.abs(hash).toString(36)}`;
    }
    
    return baseSlug;
  };

  // Find experience by slug
  const findExperienceBySlug = (slug, experiences) => {
    return experiences.find(exp => {
      const expSlug = generateSlug(exp.company || 'unknown', exp.position || 'unknown', exp._id);
      return expSlug === slug;
    });
  };

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

  // Handle URL routing when experiences are loaded
  useEffect(() => {
    if (experiences.length > 0 && !isLoading) {
      const { slug } = params;
      
      if (slug) {
        // Try to find experience by slug from URL
        const experience = findExperienceBySlug(slug, experiences);
        if (experience) {
          setSelectedExperience(experience);
        } else {
          // If slug doesn't match any experience, redirect to first experience
          const firstExp = experiences[0];
          const firstSlug = generateSlug(firstExp.company || 'unknown', firstExp.position || 'unknown', firstExp._id);
          navigate(`/interview-experiences/${firstSlug}`, { replace: true });
          setSelectedExperience(firstExp);
        }
      } else {
        // No slug in URL, set first experience and update URL
        const firstExp = experiences[0];
        const firstSlug = generateSlug(firstExp.company || 'unknown', firstExp.position || 'unknown', firstExp._id);
        navigate(`/interview-experiences/${firstSlug}`, { replace: true });
        setSelectedExperience(firstExp);
      }
    }
  }, [experiences, params, navigate, isLoading]);

  const handleSaveFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleExperienceSelect = (experience) => {
    const slug = generateSlug(experience.company || 'unknown', experience.position || 'unknown', experience._id);
    navigate(`/interview-experiences/${slug}`);
    setSelectedExperience(experience);
  };

  const filteredExperiences = experiences
    .filter(exp => {
      const companyMatch = (exp.company || '').toLowerCase().includes(appliedFilters.companySearch.toLowerCase());
      const positionMatch = (exp.position || '').toLowerCase().includes(appliedFilters.positionSearch.toLowerCase());
      const yoeMatch = appliedFilters.yoeSearch === '' || 
        (exp.yoe !== undefined && exp.yoe.toString() === appliedFilters.yoeSearch);
      const verdictMatch = appliedFilters.verdictFilter === '' || 
        (exp.verdict && exp.verdict.toLowerCase() === appliedFilters.verdictFilter.toLowerCase());
      
      return companyMatch && positionMatch && yoeMatch && verdictMatch;
    })
    .sort((a, b) => {
      const [field, order] = appliedFilters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'rating') {
        return ((a.rating || 0) - (b.rating || 0)) * sortValue;
      } else if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      }
      return 0;
    });

  // Update selected experience when filtered experiences change
  useEffect(() => {
    if (filteredExperiences.length > 0 && selectedExperience) {
      const currentExpInFiltered = filteredExperiences.find(exp => exp._id === selectedExperience._id);
      if (!currentExpInFiltered) {
        // Current selection not in filtered results, select first filtered result
        const newExp = filteredExperiences[0];
        const newSlug = generateSlug(newExp.company || 'unknown', newExp.position || 'unknown', newExp._id);
        navigate(`/interview-experiences/${newSlug}`, { replace: true });
        setSelectedExperience(newExp);
      }
    }
  }, [filteredExperiences, selectedExperience, navigate]);

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchExperiences();
    // After fetching new data, maintain current selection if possible
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InterviewHeader
              onFilterClick={toggleFilterModal}
              onApplyFilters={handleApplyFilters}
              onShareClick={toggleModal}
            />
          </motion.div>

          {/* Main Content Area */}
          {filteredExperiences.length > 0 ? (
            <motion.div 
              className="flex gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Sidebar */}
              <div className="w-1/3">
                <InterviewSidebar
                  experiences={filteredExperiences}
                  selectedExperience={selectedExperience}
                  onExperienceSelect={handleExperienceSelect}
                />
              </div>

              {/* Detail Panel */}
              <div className="flex-1">
                <InterviewDetailPanel
                  experience={selectedExperience}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
                onSave={handleSaveFilters}
                onClear={handleClearFilters}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}