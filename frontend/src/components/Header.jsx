import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  User,
  BookOpen,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Puzzle,
  LayoutDashboard,
  MessageCircle,
  Code,
  ArrowUpRight,
  Map,
} from 'lucide-react';
import { signoutSuccess } from '../redux/user/userSlice';
import { focusRing } from '../theme/tokens';

const MENU_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/my-jobs', label: 'My Jobs' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/contactUs', label: 'Contact' },
];

const FEATURE_GROUPS = [
  {
    title: 'Prepare',
    items: [
      { path: '/interviewExp', icon: MessageCircle, label: 'Interview Experiences', desc: 'Company-wise insights' },
      { path: '/interview-questions', icon: Puzzle, label: 'Interview Questions', desc: 'Topic-wise practice' },
      { path: '/qa-sdet-dsa-sheet', icon: Code, label: 'QA/SDET DSA Sheet', desc: 'Track your progress' },
      { path: '/roadmaps', icon: Map, label: 'Roadmaps', desc: 'Skill paths for roles', comingSoon: true },
    ],
  },
  {
    title: 'Discover',
    items: [
      { path: '/salaryStructures', icon: TrendingUp, label: 'Salary Insights', desc: 'Compensation data' },
      { path: '/blogs', icon: BookOpen, label: 'Blogs', desc: 'Read and create articles' },
    ],
  },
  {
    title: 'Build',
    items: [
      { path: '/resume-builder', icon: User, label: 'Resume Builder', desc: 'Create your resume' },
    ],
  },
];

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuRef = useRef(null);
  const profileRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) closeMobileMenu();
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (featuresRef.current && !featuresRef.current.contains(event.target)) setIsFeaturesOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsFeaturesOpen(false);
        closeMobileMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    setIsFeaturesOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const toggleProfile = (e) => {
    e.stopPropagation();
    if (windowWidth >= 768) {
      setIsProfileOpen((open) => !open);
      setIsFeaturesOpen(false);
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
      const res = await fetch('/backend/user/signout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      else {
        dispatch(signoutSuccess());
        navigate('/sign-in');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleFeatureNavigation = (path, comingSoon) => {
    if (comingSoon) return;
    setIsFeaturesOpen(false);
    closeMobileMenu();
    navigate(path);
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const isFeaturesActive = FEATURE_GROUPS.some((group) =>
    group.items.some(
      (item) =>
        !item.comingSoon &&
        (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
    )
  );

  const signInHref = `/sign-in?redirect=${encodeURIComponent(
    location.pathname + location.search + location.hash
  )}`;

  const BrandMark = ({ size = 'md' }) => (
    <Link to="/" className={`inline-flex items-center gap-2.5 rounded-xl ${focusRing}`}>
      <img
        src="/assets/Route2Hire.png"
        alt="Route2Hire"
        className={`${size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} rounded-xl object-cover shadow-sm`}
      />
      <span
        className={`font-display ${size === 'lg' ? 'text-xl' : 'text-lg'} font-semibold tracking-tight text-[#1C1917]`}
      >
        Route<span className="text-[#C4A574]">2</span>Hire
      </span>
    </Link>
  );

  const NavLinks = ({ isMobile = false }) => (
    <>
      {MENU_ITEMS.map(({ path, label }) => {
        const active = isActivePath(path);
        return (
          <Link
            key={path}
            to={path}
            onClick={() => isMobile && closeMobileMenu()}
            className={`${focusRing} rounded-lg ${isMobile ? 'block' : ''}`}
          >
            <span
              className={`
                relative inline-flex items-center font-medium transition-colors duration-200
                ${
                  isMobile
                    ? `w-full rounded-xl px-4 py-3 text-[15px] ${
                        active
                          ? 'bg-[#EFE8DC] text-[#2C241B]'
                          : 'text-[#57534E] hover:bg-[#EFE8DC] hover:text-[#2C241B]'
                      }`
                    : `px-2.5 py-2 text-sm lg:px-3 ${
                        active ? 'text-[#2C241B]' : 'text-[#57534E] hover:text-[#2C241B]'
                      }`
                }
              `}
            >
              {label}
              {!isMobile && (
                <motion.span
                  className="absolute -bottom-0.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#C4A574]"
                  initial={false}
                  animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              {isMobile && active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C4A574]" />
              )}
            </span>
          </Link>
        );
      })}
    </>
  );

  const FeaturesDropdown = () => (
    <AnimatePresence>
      {isFeaturesOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 z-50 mt-3 w-[min(52rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_50px_-20px_rgba(44,36,27,0.22)]"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-[#E5DCCE] bg-[#EFE8DC] px-5 py-3.5">
            <div>
              <p className="font-display text-sm font-semibold text-[#1C1917]">Toolkit</p>
              <p className="mt-0.5 text-xs text-[#78716C]">Everything for QA & SDET careers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px bg-[#E5DCCE] sm:grid-cols-3">
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title} className="bg-[#FFFDF8] p-3">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ path, icon: Icon, label, desc, comingSoon }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={comingSoon}
                      onClick={() => handleFeatureNavigation(path, comingSoon)}
                      className={`group flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${focusRing} ${
                        comingSoon ? 'cursor-not-allowed opacity-55' : 'hover:bg-[#EFE8DC]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5DCCE] ${
                          comingSoon
                            ? 'bg-[#EFE8DC] text-[#78716C]'
                            : 'bg-[#FFFDF8] text-[#6B5A48] group-hover:border-[#C4A574]/50 group-hover:text-[#2C241B]'
                        }`}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              comingSoon ? 'text-[#78716C]' : 'text-[#1C1917]'
                            }`}
                          >
                            {label}
                          </span>
                          {comingSoon && (
                            <span className="rounded-md border border-[#E5DCCE] bg-[#EFE8DC] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B5A48]">
                              Soon
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-[#78716C]">{desc}</span>
                      </span>
                      {!comingSoon && (
                        <ArrowUpRight
                          size={14}
                          className="mt-1 shrink-0 text-[#E5DCCE] opacity-0 transition group-hover:opacity-100 group-hover:text-[#C4A574]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ProfileDropdown = () => (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_50px_-20px_rgba(44,36,27,0.22)]"
          role="menu"
        >
          <div className="relative border-b border-[#E5DCCE] bg-[#EFE8DC] px-5 py-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#C4A574]" aria-hidden />
            <div className="flex items-center gap-3">
              <img
                src={currentUser.profilePicture}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[#C4A574]/40 ring-offset-2 ring-offset-[#EFE8DC]"
              />
              <div className="min-w-0">
                <p className="font-display truncate text-base font-semibold text-[#1C1917]">
                  @{currentUser.username}
                </p>
                <p className="truncate text-sm text-[#78716C]">{currentUser.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            {[
              { action: () => handleProfileNavigation('/profile'), icon: User, label: 'My Profile', desc: 'Manage your account' },
              ...(currentUser?.isUserAdmin
                ? [{ action: () => handleProfileNavigation('/dashboard'), icon: LayoutDashboard, label: 'Admin Dashboard', desc: 'System overview' }]
                : []),
              { action: () => handleProfileNavigation('/myCorner'), icon: BookOpen, label: 'My Corner', desc: 'Personal workspace' },
            ].map(({ action, icon: Icon, label, desc }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] group-hover:text-[#2C241B]">
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#1C1917]">{label}</span>
                  <span className="block text-xs text-[#78716C]">{desc}</span>
                </span>
              </button>
            ))}
            <div className="my-2 h-px bg-[#E5DCCE]" />
            <button
              type="button"
              onClick={handleSignout}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-red-50 ${focusRing}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
                <LogOut size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#1C1917] group-hover:text-red-700">
                  Sign Out
                </span>
                <span className="block text-xs text-[#78716C]">See you soon</span>
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const MobileMenu = () =>
    createPortal(
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-[#2C241B]/35 backdrop-blur-[2px]"
              onClick={closeMobileMenu}
              aria-hidden
            />
            <motion.aside
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 bottom-3 top-[4.75rem] z-[100] flex flex-col overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#F7F3EC] shadow-[0_24px_60px_-20px_rgba(44,36,27,0.3)]"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex items-center justify-between border-b border-[#E5DCCE] bg-[#EFE8DC] px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                    Menu
                  </p>
                  <p className="font-display text-base font-semibold text-[#1C1917]">Explore Route2Hire</p>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#57534E] hover:text-[#2C241B] ${focusRing}`}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3">
                <div className="px-2">
                  <NavLinks isMobile />
                </div>
                <div className="mx-4 my-3 h-px bg-[#E5DCCE]" />
                <div className="px-4 pb-2">
                  <p className="mb-2 font-display text-sm font-semibold text-[#1C1917]">Toolkit</p>
                  {FEATURE_GROUPS.map((group) => (
                    <div key={group.title} className="mb-4">
                      <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-[#78716C]">
                        {group.title}
                      </p>
                      {group.items.map(({ path, icon: Icon, label, comingSoon }) => (
                        <button
                          key={label}
                          type="button"
                          disabled={comingSoon}
                          onClick={() => handleFeatureNavigation(path, comingSoon)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${focusRing} ${
                            comingSoon
                              ? 'cursor-not-allowed opacity-55 text-[#78716C]'
                              : 'text-[#57534E] hover:bg-[#EFE8DC] hover:text-[#2C241B]'
                          }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span className="flex-1 text-sm font-medium">{label}</span>
                          {comingSoon && (
                            <span className="rounded-md bg-[#EFE8DC] px-1.5 py-0.5 text-[10px] font-semibold text-[#6B5A48]">
                              Soon
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {currentUser && (
                <div className="border-t border-[#E5DCCE] bg-[#EFE8DC] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={currentUser.profilePicture}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C4A574]/40 ring-offset-2 ring-offset-[#EFE8DC]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1C1917]">
                        @{currentUser.username}
                      </p>
                      <p className="truncate text-xs text-[#78716C]">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleProfileNavigation('/profile')}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2.5 text-sm font-medium text-[#2C241B] ${focusRing}`}
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProfileNavigation('/myCorner')}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2.5 text-sm font-medium text-[#57534E] ${focusRing}`}
                    >
                      <BookOpen size={14} /> Corner
                    </button>
                    {currentUser?.isUserAdmin && (
                      <button
                        type="button"
                        onClick={() => handleProfileNavigation('/dashboard')}
                        className={`col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#2C241B] py-2.5 text-sm font-medium text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
                      >
                        <LayoutDashboard size={14} /> Admin Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignout}
                      className={`col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-[#FFFDF8] py-2.5 text-sm font-medium text-red-600 ${focusRing}`}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          className={`relative mx-auto max-w-7xl rounded-2xl border transition-all duration-300 ${
            scrolled
              ? 'border-[#E5DCCE] bg-[#FFFDF8]/95 shadow-[0_14px_40px_-18px_rgba(44,36,27,0.18)] backdrop-blur-xl'
              : 'border-[#E5DCCE]/90 bg-[#FFFDF8]/88 shadow-[0_8px_28px_-18px_rgba(44,36,27,0.12)] backdrop-blur-md'
          }`}
          aria-label="Primary"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C4A574]/60 to-transparent"
            aria-hidden
          />

          <div
            className={`flex items-center justify-between gap-3 px-3 transition-[padding] duration-300 sm:px-4 ${
              scrolled ? 'py-2.5' : 'py-3 md:py-3.5'
            }`}
          >
            <div className="flex w-full items-center justify-between md:hidden">
              <button
                type="button"
                onClick={openMobileMenu}
                className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#2C241B] hover:bg-[#EFE8DC] ${focusRing}`}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu size={20} />
              </button>
              <BrandMark />
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => handleProfileNavigation('/profile')}
                  className={`rounded-full ${focusRing}`}
                  aria-label="Open profile"
                >
                  <img
                    src={currentUser.profilePicture}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-[#C4A574]/45 ring-offset-2 ring-offset-[#FFFDF8]"
                  />
                </button>
              ) : (
                <Link to={signInHref}>
                  <span
                    className={`inline-flex items-center rounded-full bg-[#2C241B] px-3.5 py-2 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                  >
                    Sign In
                  </span>
                </Link>
              )}
            </div>

            <div className="hidden w-full items-center gap-4 md:flex">
              <div className="shrink-0">
                <BrandMark size="lg" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-0.5 lg:gap-1">
                  <NavLinks />
                  <div className="relative" ref={featuresRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFeaturesOpen((open) => !open);
                        setIsProfileOpen(false);
                      }}
                      aria-expanded={isFeaturesOpen}
                      aria-haspopup="menu"
                      className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3 ${focusRing} ${
                        isFeaturesOpen || isFeaturesActive
                          ? 'text-[#2C241B]'
                          : 'text-[#57534E] hover:text-[#2C241B]'
                      }`}
                    >
                      Toolkit
                      <motion.span animate={{ rotate: isFeaturesOpen ? 180 : 0 }} className="inline-flex">
                        <ChevronDown size={15} />
                      </motion.span>
                      <motion.span
                        className="absolute -bottom-0.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#C4A574]"
                        initial={false}
                        animate={{
                          scaleX: isFeaturesActive && !isFeaturesOpen ? 1 : 0,
                          opacity: isFeaturesActive && !isFeaturesOpen ? 1 : 0,
                        }}
                      />
                    </button>
                    <FeaturesDropdown />
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center" ref={profileRef}>
                {currentUser ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleProfile}
                      aria-expanded={isProfileOpen}
                      aria-haspopup="menu"
                      className={`group relative rounded-full ${focusRing}`}
                    >
                      <img
                        src={currentUser.profilePicture}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C4A574]/50 ring-offset-2 ring-offset-[#FFFDF8]"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2C241B] text-[#FFFDF8] shadow-sm">
                        <motion.span animate={{ rotate: isProfileOpen ? 180 : 0 }} className="inline-flex">
                          <ChevronDown size={10} />
                        </motion.span>
                      </span>
                    </button>
                    <ProfileDropdown />
                  </div>
                ) : (
                  <Link to={signInHref}>
                    <motion.span
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] shadow-[0_10px_24px_-10px_rgba(44,36,27,0.45)] transition hover:bg-[#1A1510] ${focusRing}`}
                    >
                      Sign In
                    </motion.span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </motion.header>
      <MobileMenu />
    </>
  );
}
