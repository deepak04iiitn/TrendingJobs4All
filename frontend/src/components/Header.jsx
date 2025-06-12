import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  User, 
  BookOpen, 
  BriefcaseIcon, 
  TrendingUp, 
  LogOut, 
  Home, 
  Info,
  Menu,
  X,
  Puzzle,
  LayoutDashboard,
  MessageCircle,
  Bell,
  Search,
  Star,
  FileEdit
} from 'lucide-react';
import { signoutSuccess } from '../redux/user/userSlice';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuRef = useRef(null);
  const profileRef = useRef(null);
  const featuresRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modified mobile menu handlers
  const openMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        closeMobileMenu();
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setIsFeaturesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleProfile = (e) => {
    e.stopPropagation();
    if (windowWidth >= 768) {
      setIsProfileOpen(!isProfileOpen);
    }
  };

  const handleProfileNavigation = (path) => {
    setIsProfileOpen(false);
    closeMobileMenu();
    navigate(path);
  };

  const handleSignout = async () => {
    try {
      setIsProfileOpen(false);
      closeMobileMenu();
      const res = await fetch('/backend/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate('/sign-in');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleFeatureNavigation = (path) => {
    setIsFeaturesOpen(false);
    navigate(path);
  };

  // Modern Navigation Items Component
  const MenuItems = ({ isMobile = false }) => {
    const menuItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/about', icon: Info, label: 'About' },
      { path: '/my-jobs', icon: BriefcaseIcon, label: 'Jobs' },
      { path: '/trends', icon: TrendingUp, label: 'Trends' },
      { path: '/contactUs', icon: MessageCircle, label: 'Contact' }
    ];

    return (
      <>
        {menuItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path}>
            <motion.div 
              whileHover={{ y: -2 }}
              className={`
                flex items-center space-x-2 group relative
                ${isMobile 
                  ? 'text-slate-700 py-4 px-6 hover:bg-blue-50 rounded-xl mx-3' 
                  : 'text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50'
                } 
                transition-all duration-300
              `}
            >
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              <span className="font-medium">{label}</span>
              {!isMobile && (
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              )}
            </motion.div>
          </Link>
        ))}
      </>
    );
  };

  // Enhanced Profile Dropdown
  const ProfileDropdown = () => (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Profile Header */}
          <div className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={currentUser.profilePicture}
                  alt="user"
                  className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">@{currentUser.username}</p>
                <p className="text-slate-600 text-sm">{currentUser.email}</p>
                <div className="flex items-center mt-1">
                  <Star size={12} className="text-yellow-500 mr-1" />
                  <span className="text-xs text-slate-500">Premium Member</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="p-3">
            {[
              { action: () => handleProfileNavigation('/profile'), icon: User, label: 'My Profile', desc: 'Manage your account' },
              ...(currentUser?.isUserAdmin ? [{ action: () => handleProfileNavigation('/dashboard'), icon: LayoutDashboard, label: 'Admin Dashboard', desc: 'System overview' }] : []),
              { action: () => handleProfileNavigation('/myCorner'), icon: BookOpen, label: 'My Corner', desc: 'Personal workspace' }
            ].map(({ action, icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                whileHover={{ x: 6 }}
                onClick={action}
                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-white/20 transition-colors">
                  <Icon size={18} className="text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-slate-500 group-hover:text-white/80">{desc}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Divider */}
            <div className="h-px bg-gray-200 my-3" />
            
            {/* Sign Out */}
            <motion.div
              whileHover={{ x: 6 }}
              onClick={handleSignout}
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white/20 transition-colors">
                <LogOut size={18} className="text-red-600 group-hover:text-white" />
              </div>
              <div>
                <p className="font-semibold">Sign Out</p>
                <p className="text-xs text-slate-500 group-hover:text-white/80">See you later!</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Enhanced Features Dropdown
  const FeaturesDropdown = () => {
    const features = [
      { path: '/interviewExp', icon: User, label: 'Interview Experiences', desc: 'Real experiences shared' },
      { path: '/referrals', icon: BriefcaseIcon, label: 'Referrals', desc: 'Get referred by peers' },
      { path: '/salaryStructures', icon: TrendingUp, label: 'Salary Insights', desc: 'Compensation data' },
      { path: '/resumeTemplates', icon: BookOpen, label: 'Resume Templates', desc: 'Professional templates' },
      { path: '/resume-builder', icon: FileEdit, label: 'Resume Builder', desc: 'Create your resume' },
      { path: '/interview-questions', icon: Puzzle, label: 'Interview Questions', desc: 'Practice questions' }
    ];

    return (
      <AnimatePresence>
        {isFeaturesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3">
              {features.map(({ path, icon: Icon, label, desc }) => (
                <motion.div
                  key={path}
                  whileHover={{ x: 6 }}
                  onClick={() => handleFeatureNavigation(path)}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-white/20 transition-colors">
                    <Icon size={18} className="text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-slate-500 group-hover:text-white/80">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Enhanced Mobile Profile Section
  const MobileProfileSection = () => (
    currentUser && (
      <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <img
              src={currentUser.profilePicture}
              alt="user"
              className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="font-bold text-slate-800">@{currentUser.username}</p>
            <p className="text-sm text-slate-600">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleProfileNavigation('/profile')}
            className="py-3 flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300"
          >
            <User size={16} />
            <span className="text-sm font-medium">Profile</span>
          </button>
          
          <button
            onClick={() => handleProfileNavigation('/myCorner')}
            className="py-3 flex items-center justify-center space-x-2 bg-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-700 transition-all duration-300"
          >
            <BookOpen size={16} />
            <span className="text-sm font-medium">Corner</span>
          </button>
          
          {currentUser?.isUserAdmin && (
            <button
              onClick={() => handleProfileNavigation('/dashboard')}
              className="col-span-2 py-3 flex items-center justify-center space-x-2 bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-green-700 transition-all duration-300"
            >
              <LayoutDashboard size={16} />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </button>
          )}
          
          <button
            onClick={handleSignout}
            className="col-span-2 py-3 flex items-center justify-center space-x-2 bg-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all duration-300"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    )
  );

  // Enhanced Mobile Menu
  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-50 flex flex-col"
            ref={mobileMenuRef}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3">
                  <img
                    src="/assets/Route2Hire.png"
                    alt="Route2Hire"
                    className="h-12 w-12 rounded-xl shadow-lg"
                  />
                  <span className="text-slate-800 font-bold text-lg">Route2Hire</span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full bg-white/80 text-slate-600 hover:bg-white hover:text-slate-800 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <MenuItems isMobile={true} />
              
              {/* Features Section */}
              <div className="mx-3 mt-6">
                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <Puzzle size={14} className="mr-2" />
                  Features
                </div>
                
                <div className="space-y-2">
                  {[
                    { path: '/interviewExp', icon: User, label: 'Interview Experiences' },
                    { path: '/referrals', icon: BriefcaseIcon, label: 'Referrals' },
                    { path: '/salaryStructures', icon: TrendingUp, label: 'Salary Insights' },
                    { path: '/resumeTemplates', icon: BookOpen, label: 'Resume Templates' },
                    { path: '/resume-builder', icon: FileEdit, label: 'Resume Builder' }
                  ].map(({ path, icon: Icon, label }) => (
                    <motion.div
                      key={path}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        closeMobileMenu();
                        navigate(path);
                      }}
                      className="flex items-center space-x-3 py-3 px-4 text-slate-700 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-300"
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <MobileProfileSection />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeMobileMenu}
          />
        </>
      )}
    </AnimatePresence>
  );

  return (
    <motion.nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'py-2 bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200' 
          : 'py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
        }
      `}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile View */}
        <div className="md:hidden flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openMobileMenu}
            className="p-2 rounded-xl text-slate-700 hover:bg-white/80 hover:text-slate-900 transition-colors"
          >
            <Menu size={24} />
          </motion.button>

          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/assets/Route2Hire.png"
              alt="Route2Hire"
              className="h-12 w-12 rounded-xl shadow-lg"
            />
            <span className="font-bold text-lg text-slate-800">
              Route2Hire
            </span>
          </Link>

          {currentUser ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <img
                src={currentUser.profilePicture}
                alt="user"
                className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg cursor-pointer"
                onClick={() => handleProfileNavigation('/profile')}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </motion.div>
          ) : (
            <Link to="/sign-in">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img
              whileHover={{ rotate: 5 }}
              src="/assets/Route2Hire.png"
              alt="Route2Hire"
              className="h-12 w-12 rounded-xl shadow-lg"
            />
            <span className="font-bold text-xl text-slate-800 transition-colors">
              Route2Hire
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <MenuItems />
            
            <div className="relative" ref={featuresRef}>
              <motion.button
                whileHover={{ y: -2 }}
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              >
                <Puzzle size={18} />
                <span className="font-medium">Features</span>
                <motion.div
                  animate={{ rotate: isFeaturesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </motion.button>
              <FeaturesDropdown />
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2 rounded-full text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Bell size={20} />
              </motion.button>
              
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={toggleProfile}
                  className="relative group"
                >
                  <img
                    src={currentUser.profilePicture}
                    alt="user"
                    className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  <motion.div
                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                    className="absolute -bottom-1 -left-1 bg-blue-600 rounded-full p-0.5"
                  >
                    <ChevronDown size={10} className="text-white" />
                  </motion.div>
                </motion.button>
                <ProfileDropdown />
              </div>
            </div>
          ) : (
            <Link to="/sign-in">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 font-medium"
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>

        <MobileMenu />
      </div>
    </motion.nav>
  );
}