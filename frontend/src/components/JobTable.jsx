import React, { useEffect, useState } from 'react';
import { Search, MapPin, Calendar, Briefcase, Filter, ChevronLeft, ChevronRight, Eye, ExternalLink, Clock, Building2, Zap, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const truncateDescription = (description, wordLimit) => {
    if (typeof description !== "string" || !description.trim() || description === "Not Available") {
        return "No description available";
    }

    const words = description.split(" ");
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatUrlString = (company, title) => {
    const formatString = (str) => str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

    return `${formatString(company)}-${formatString(title)}`;
};

const isRecent = (dateStr) => {
    const jobDate = new Date(dateStr);
    const now = new Date();
    const hoursDifference = Math.floor((now - jobDate) / (1000 * 60 * 60));
    return hoursDifference <= 24;
};

const getTimeAgo = (dateStr) => {
    const jobDate = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now - jobDate) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
};

const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

export default function JobTable() {
    // Get URL search params
    const urlParams = new URLSearchParams(window.location.search);
    
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(parseInt(urlParams.get('page')) || 1);
    const jobsPerPage = 8;
    const [searchKeyword, setSearchKeyword] = useState(urlParams.get('search') || '');
    const [minExpFilter, setMinExpFilter] = useState(urlParams.get('exp') || '');
    const [searchPage, setSearchPage] = useState(urlParams.get('page') || '');
    const [searchDate, setSearchDate] = useState(urlParams.get('date') || '');
    const [categoryFilter, setCategoryFilter] = useState(urlParams.get('category') || '');
    const [totalPages, setTotalPages] = useState(1);
    const [isFilterChange, setIsFilterChange] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Mock current user - replace with your actual Redux selector
    const [currentUser] = useState(true);
    const navigate = useNavigate();

    // Safe string check helper
    const safeString = (value) => {
        return typeof value === 'string' ? value.toLowerCase() : '';
    };

    // Update URL when filters change
    const updateSearchParams = (updates) => {
        const newParams = new URLSearchParams(window.location.search);
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.pushState({}, '', newUrl);
        
        if (updates.hasOwnProperty('page')) {
            setSearchPage(updates.page);
        }
    };

    const handleFilterChange = (updates) => {
        setIsFilterChange(true);
        updateSearchParams({ ...updates, page: '1' });
    };

    const handleSearchKeywordChange = (value) => {
        setSearchKeyword(value);
        handleFilterChange({ search: value });
    };

    const handleMinExpChange = (value) => {
        setMinExpFilter(value);
        handleFilterChange({ exp: value });
    };

    const handleDateChange = (value) => {
        setSearchDate(value);
        handleFilterChange({ date: value });
    };

    const handleCategoryChange = (value) => {
        setCategoryFilter(value);
        handleFilterChange({ category: value });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSearchPage(page.toString());
        updateSearchParams({ page: page.toString() });
    };

    const clearAllFilters = () => {
        setSearchKeyword('');
        setMinExpFilter('');
        setSearchDate('');
        setCategoryFilter('');
        setCurrentPage(1);
        setSearchPage('1');
        setIsFilterChange(true);
        window.history.pushState({}, '', window.location.pathname);
    };

    const handleApplyClick = (id, company, title, job) => {
        if (currentUser) {
            const formattedUrl = formatUrlString(company, title);
            const currentParams = new URLSearchParams(window.location.search);
            // Store job data in sessionStorage with a unique key
            const jobKey = `jobData-${id}`;
            sessionStorage.setItem(jobKey, JSON.stringify(job));
            // Open in new tab with jobKey as a query param
            window.open(`/fulljd/${formattedUrl}/${id}?${currentParams.toString()}&jobKey=${jobKey}`, '_blank');
        } else {
            setShowSignInModal(true);
        }
    };

    const handleSearchByPage = () => {
        const pageNum = parseInt(searchPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            handlePageChange(pageNum);
        } else {
            alert(`Please enter a valid page number between 1 and ${totalPages}`);
        }
    };

    // Fetch initial data
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                
                // Add cache-busting parameter if needed
                const cacheBuster = new URLSearchParams(window.location.search).get('cache') || Date.now();
                const jobsResponse = await axios.get(`/backend/naukri?cache=${cacheBuster}`);

                // Process jobs data
                const processedJobs = jobsResponse.data
                    .filter(item => item.apply_link && item.apply_link !== "Not Found")
                    .map(item => ({
                        ...item,
                        _id: item._id,
                        title: item.job_title || item.title || "Unknown",
                        min_exp: parseFloat(item.min_exp) || 0,
                        company: item.company || "Unknown",
                        location: Array.isArray(item.location) && item.location.length > 0
                            ? item.location.join(" / ")
                            : "Unknown",
                        jd: item.full_jd || "",
                        date: new Date(item.time).toISOString(),
                        apply_link: item.apply_link,
                        category: item.category || ""
                    }))
                    .filter(job => job._id);

                // Sort jobs by date
                processedJobs.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Update state
                setJobs(processedJobs);

                // Handle pagination
                const totalPages = Math.ceil(processedJobs.length / jobsPerPage);
                const pageFromUrl = parseInt(urlParams.get('page')) || 1;

                if (pageFromUrl > totalPages) {
                    setCurrentPage(totalPages);
                    updateSearchParams({ page: totalPages.toString() });
                } else {
                    setCurrentPage(pageFromUrl);
                }

                setTotalPages(totalPages);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setJobs([]);
                setTotalPages(1);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [currentUser]);

    // Filter jobs effect 
    useEffect(() => {
        const filtered = jobs.filter(job => {
            const keyword = searchKeyword.toLowerCase();
            
            const matchesSearch = !keyword || (
                safeString(job.title).includes(keyword) ||
                safeString(job.company).includes(keyword) ||
                safeString(job.location).includes(keyword) ||
                safeString(job.jd).includes(keyword)
            );

            let matchesMinExp = true;
            if (minExpFilter !== '') {
                const minExpValue = parseFloat(minExpFilter);
                const jobExp = parseFloat(job.min_exp) || 0;
                matchesMinExp = !isNaN(minExpValue) && jobExp == minExpValue;
            }

            const jobDate = job.date ? formatDateForComparison(job.date) : '';
            const searchDateFormatted = searchDate ? formatDateForComparison(searchDate) : '';
            const matchesDate = !searchDate || jobDate === searchDateFormatted;

            const matchesCategory = !categoryFilter || 
                safeString(job.category) === safeString(categoryFilter);

            return matchesSearch && matchesMinExp && matchesDate && matchesCategory;
        });

        setFilteredJobs(filtered);
        const newTotalPages = Math.ceil(filtered.length / jobsPerPage);
        setTotalPages(newTotalPages);

        // Only reset page if filters were explicitly changed and current page is out of bounds
        if (isFilterChange && currentPage > newTotalPages) {
            setCurrentPage(1);
            updateSearchParams({ page: '1' });
        }
        setIsFilterChange(false);
    }, [searchKeyword, minExpFilter, searchDate, categoryFilter, jobs]);

    const startIndex = (currentPage - 1) * jobsPerPage;
    const currentJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 ${showSignInModal ? 'filter blur-sm pointer-events-none' : ''}`}>
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-24">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Find Your Dream
                            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                Career
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed px-4">
                            Discover thousands of opportunities from top companies. Your next big break is just a click away.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Search and Filter Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
                        {/* Main Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="🔍 Search by any keywords..."
                                value={searchKeyword}
                                onChange={(e) => handleSearchKeywordChange(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm sm:text-base"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Advanced Filters</span>
                            </button>
                            
                            {(searchKeyword || minExpFilter || searchDate || categoryFilter) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Min Experience (years)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 2"
                                            value={minExpFilter}
                                            onChange={(e) => handleMinExpChange(e.target.value)}
                                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm sm:text-base"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Search by Date
                                        </label>
                                        <input
                                            type="date"
                                            value={searchDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm sm:text-base"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm sm:text-base"
                                        >
                                            <option value="">All Categories</option>
                                            <option value="qa">QA</option>
                                            <option value="developer">Developer</option>
                                            <option value="devops">DevOps</option>
                                            <option value="intern">Intern</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Go to Page
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder={`1-${totalPages}`}
                                                value={searchPage}
                                                onChange={(e) => setSearchPage(e.target.value)}
                                                className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm sm:text-base"
                                            />
                                            <button
                                                onClick={handleSearchByPage}
                                                className="px-3 sm:px-4 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Summary */}
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                        <span>
                            Showing {startIndex + 1}-{Math.min(startIndex + jobsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                        </span>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                </div>

                {/* Job Cards Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-3 sm:mb-4"></div>
                            <p className="text-gray-600 text-sm sm:text-base">Loading jobs...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {currentJobs.map((job, index) => (
                            <div
                                key={job._id}
                                className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6 mb-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                                    #{startIndex + index + 1}
                                                </span>
                                                {isRecent(job.date) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                                                        <Zap className="w-3 h-3" />
                                                        New
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {getTimeAgo(job.date)}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                                                {job.title}
                                            </h3>
                                            
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    <span className="font-medium text-sm sm:text-base">{job.company}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm sm:text-base">{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span className="text-sm sm:text-base">{job.min_exp} years</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                                {truncateDescription(job.jd, 20)}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 sm:ml-6">
                                            <button
                                                onClick={() => handleApplyClick(job._id, job.company, job.title, job)}
                                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Category Badge */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full capitalize">
                                                {job.category || 'General'}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Posted: {formatDate(job.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = currentPage <= 3 ? i + 1 : 
                                          currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                          currentPage - 2 + i;
                            
                            if (pageNum < 1 || pageNum > totalPages) return null;
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                                        currentPage === pageNum
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {filteredJobs.length === 0 && !isLoading && (
                    <div className="text-center py-12 sm:py-16">
                        <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Sign In Modal */}
            {showSignInModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Sign In Required</h3>
                            <button
                                onClick={() => setShowSignInModal(false)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6">
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                You need to sign in to see the details and apply for this job. Please sign in to continue.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <button
                                    onClick={() => {
                                        console.log('Navigate to sign-in');
                                        setShowSignInModal(false);
                                    }}
                                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
                                >
                                    Go to Sign In
                                </button>
                                <button
                                    onClick={() => setShowSignInModal(false)}
                                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors duration-200 text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}