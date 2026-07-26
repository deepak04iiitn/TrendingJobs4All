import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  User,
  BookOpen,
  BriefcaseIcon,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Puzzle,
  LayoutDashboard,
  MessageCircle,
  FileEdit,
  Code,
  ArrowUpRight,
  Map,
} from 'lucide-react';
import { signoutSuccess } from '../redux/user/userSlice';

const MENU_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/my-jobs', label: 'My Jobs' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/publicpolls', label: 'Polls' },
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
      { path: '/referrals', icon: BriefcaseIcon, label: 'Referrals', desc: 'Get referred by peers' },
      { path: '/salaryStructures', icon: TrendingUp, label: 'Salary Insights', desc: 'Compensation data' },
      { path: '/blogs', icon: BookOpen, label: 'Blogs', desc: 'Read and create articles' },
    ],
  },
  {
    title: 'Build',
    items: [
      { path: '/resumeTemplates', icon: FileEdit, label: 'Resume Templates', desc: 'Professional templates' },
      { path: '/resume-builder', icon: User, label: 'Resume Builder', desc: 'Create your resume' },
    ],
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2';

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
  const [scrollProgress, setScrollProgress] = useState(0);

  const mobileMenuRef = useRef(null);
  const profileRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(y / Math.max(max * 0.35, 1), 1) : 0);
    };
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

  const NavLinks = ({ isMobile = false }) => (
    <>
      {MENU_ITEMS.map(({ path, label }) => {
        const active = isActivePath(path);
        return (
          <Link
            key={path}
            to={path}
            onClick={() => {
              if (isMobile) closeMobileMenu();
            }}
            className={`${focusRing} rounded-lg ${isMobile ? 'block' : ''}`}
          >
            <span
              className={`
                relative inline-flex items-center font-medium transition-colors duration-200
                ${isMobile
                  ? `w-full px-4 py-3 rounded-xl text-[15px] ${
                      active
                        ? 'bg-slate-50 text-[#1E3A8A]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A]'
                    }`
                  : `px-2.5 lg:px-3 py-2 text-sm ${
                      active
                        ? 'text-[#1E3A8A]'
                        : 'text-slate-600 hover:text-[#1E3A8A]'
                    }`
                }
              `}
            >
              {label}
              {!isMobile && (
                <motion.span
                  className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#16A34A]"
                  initial={false}
                  animate={{
                    scaleX: active ? 1 : 0,
                    opacity: active ? 1 : 0,
                  }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />
              )}
              {isMobile && active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
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
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-0 mt-3 w-[min(42rem,calc(100vw-2rem))] rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] overflow-hidden z-50"
          role="menu"
          aria-label="Destination toolkit"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E3A8A]">
                Destination map
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tools along your route to hire
              </p>
            </div>
            <Map size={16} className="text-[#16A34A]" aria-hidden />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-px bg-[#E2E8F0]">
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title} className="bg-white p-3">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1E3A8A]">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ path, icon: Icon, label, desc, comingSoon }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={comingSoon}
                      onClick={() => handleFeatureNavigation(path, comingSoon)}
                      className={`
                        w-full flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-200
                        ${focusRing}
                        ${
                          comingSoon
                            ? 'opacity-55 cursor-not-allowed'
                            : 'hover:bg-slate-50 group'
                        }
                      `}
                    >
                      <span
                        className={`
                          mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0]
                          ${comingSoon ? 'bg-slate-50 text-slate-400' : 'bg-white text-[#1E3A8A] group-hover:border-[#16A34A]/40 group-hover:text-[#16A34A]'}
                        `}
                      >
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              comingSoon ? 'text-slate-400' : 'text-slate-800 group-hover:text-[#0F172A]'
                            }`}
                          >
                            {label}
                          </span>
                          {comingSoon && (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                              Soon
                            </span>
                          )}
                        </span>
                        <span
                          className={`mt-0.5 block text-xs ${
                            comingSoon ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {desc}
                        </span>
                      </span>
                      {!comingSoon && (
                        <ArrowUpRight
                          size={14}
                          className="mt-1 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[#0EA5E9]"
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
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] overflow-hidden z-50"
          role="menu"
          aria-label="Account menu"
        >
          <div className="relative px-5 py-4 border-b border-[#E2E8F0]">
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A]"
              aria-hidden
            />
            <div className="flex items-center gap-3">
              <img
                src={currentUser.profilePicture}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[#1E3A8A]/25 ring-offset-2 ring-offset-white"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#0F172A]">
                  @{currentUser.username}
                </p>
                <p className="truncate text-sm text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            {[
              {
                action: () => handleProfileNavigation('/profile'),
                icon: User,
                label: 'My Profile',
                desc: 'Manage your account',
              },
              ...(currentUser?.isUserAdmin
                ? [
                    {
                      action: () => handleProfileNavigation('/dashboard'),
                      icon: LayoutDashboard,
                      label: 'Admin Dashboard',
                      desc: 'System overview',
                    },
                  ]
                : []),
              {
                action: () => handleProfileNavigation('/myCorner'),
                icon: BookOpen,
                label: 'My Corner',
                desc: 'Personal workspace',
              },
            ].map(({ action, icon: Icon, label, desc }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 group ${focusRing}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#1E3A8A] group-hover:border-[#16A34A]/35 group-hover:text-[#16A34A]">
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{label}</span>
                  <span className="block text-xs text-slate-500">{desc}</span>
                </span>
              </button>
            ))}

            <div className="my-2 h-px bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={handleSignout}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-red-50 group ${focusRing}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600">
                <LogOut size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-red-700">
                  Sign Out
                </span>
                <span className="block text-xs text-slate-500">See you on the route</span>
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
              className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-[2px]"
              onClick={closeMobileMenu}
              aria-hidden
            />
            <motion.aside
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 bottom-3 top-[4.75rem] z-[100] flex flex-col overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
              ref={mobileMenuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="relative flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3A8A]"
                  aria-hidden
                />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E3A8A]">
                    Route menu
                  </p>
                  <p className="text-sm font-semibold text-[#0F172A]">Where next?</p>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className={`rounded-xl border border-[#E2E8F0] p-2 text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] ${focusRing}`}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3">
                <div className="px-2">
                  <NavLinks isMobile />
                </div>

                <div className="mx-4 my-3 h-px bg-[#E2E8F0]" />

                <div className="px-4 pb-2">
                  <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E3A8A]">
                    <Map size={12} />
                    Destination map
                  </p>
                  <div className="space-y-4">
                    {FEATURE_GROUPS.map((group) => (
                      <div key={group.title}>
                        <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          {group.title}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map(({ path, icon: Icon, label, comingSoon }) => (
                            <button
                              key={label}
                              type="button"
                              disabled={comingSoon}
                              onClick={() => handleFeatureNavigation(path, comingSoon)}
                              className={`
                                flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left
                                ${comingSoon
                                  ? 'cursor-not-allowed opacity-55 text-slate-400'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A]'
                                }
                                ${focusRing}
                              `}
                            >
                              <Icon size={16} className="shrink-0" />
                              <span className="flex-1 text-sm font-medium">{label}</span>
                              {comingSoon && (
                                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Soon
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {currentUser && (
                <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={currentUser.profilePicture}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1E3A8A]/30 ring-offset-2 ring-offset-[#F8FAFC]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        @{currentUser.username}
                      </p>
                      <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleProfileNavigation('/profile')}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-[#1E3A8A] hover:border-[#1E3A8A]/30 ${focusRing}`}
                    >
                      <User size={14} />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProfileNavigation('/myCorner')}
                      className={`flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 ${focusRing}`}
                    >
                      <BookOpen size={14} />
                      Corner
                    </button>
                    {currentUser?.isUserAdmin && (
                      <button
                        type="button"
                        onClick={() => handleProfileNavigation('/dashboard')}
                        className={`col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] py-2.5 text-sm font-medium text-white hover:bg-[#1E3A8A]/90 ${focusRing}`}
                      >
                        <LayoutDashboard size={14} />
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignout}
                      className={`col-span-2 flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 ${focusRing}`}
                    >
                      <LogOut size={14} />
                      Sign Out
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
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 lg:px-6 pt-3"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav
          className={`
            relative mx-auto max-w-7xl overflow-hidden rounded-2xl border transition-all duration-300
            ${
              scrolled
                ? 'border-[#E2E8F0] bg-white/95 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.28)] backdrop-blur-xl'
                : 'border-[#E2E8F0]/80 bg-white/90 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.2)] backdrop-blur-md'
            }
          `}
          aria-label="Primary"
        >
          {/* Route marker — grows with scroll */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1E3A8A]/20"
            aria-hidden
          >
            <motion.div
              className="w-full origin-top bg-[#1E3A8A]"
              style={{ height: `${Math.max(18, scrollProgress * 100)}%` }}
            />
          </div>

          <div
            className={`
              flex items-center justify-between gap-3 pl-4 pr-3 sm:pl-5 sm:pr-4
              transition-[padding] duration-300
              ${scrolled ? 'py-2.5' : 'py-3 md:py-3.5'}
            `}
          >
            {/* Mobile */}
            <div className="flex w-full items-center justify-between md:hidden">
              <button
                type="button"
                onClick={openMobileMenu}
                className={`rounded-xl border border-[#E2E8F0] p-2 text-[#1E3A8A] hover:bg-slate-50 ${focusRing}`}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu size={20} />
              </button>

              <Link to="/" className={`flex items-center gap-2.5 ${focusRing} rounded-xl`}>
                <img
                  src="/assets/Route2Hire.png"
                  alt="Route2Hire"
                  className="h-9 w-9 rounded-xl object-cover shadow-sm"
                />
                <span className="text-[15px] font-bold tracking-tight text-[#0F172A]">
                  Route<span className="text-[#16A34A]">2</span>Hire
                </span>
              </Link>

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
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-[#1E3A8A]/35 ring-offset-2 ring-offset-white"
                  />
                </button>
              ) : (
                <Link to={signInHref}>
                  <span
                    className={`inline-flex items-center rounded-full bg-[#16A34A] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15803D] ${focusRing}`}
                  >
                    Sign In
                  </span>
                </Link>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden w-full items-center gap-4 md:flex">
              <Link
                to="/"
                className={`flex shrink-0 items-center gap-2.5 group ${focusRing} rounded-xl`}
              >
                <motion.img
                  whileHover={{ rotate: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  src="/assets/Route2Hire.png"
                  alt="Route2Hire"
                  className="h-10 w-10 lg:h-11 lg:w-11 rounded-xl object-cover shadow-sm"
                />
                <span className="text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
                  Route<span className="text-[#16A34A]">2</span>Hire
                </span>
              </Link>

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
                      className={`
                        relative inline-flex items-center gap-1.5 rounded-lg px-2.5 lg:px-3 py-2 text-sm font-medium transition-colors
                        ${focusRing}
                        ${
                          isFeaturesOpen || isFeaturesActive
                            ? 'text-[#1E3A8A]'
                            : 'text-slate-600 hover:text-[#1E3A8A]'
                        }
                      `}
                    >
                      Toolkit
                      <motion.span
                        animate={{ rotate: isFeaturesOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex"
                      >
                        <ChevronDown size={15} />
                      </motion.span>
                      <motion.span
                        className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#16A34A]"
                        initial={false}
                        animate={{
                          scaleX: isFeaturesActive && !isFeaturesOpen ? 1 : 0,
                          opacity: isFeaturesActive && !isFeaturesOpen ? 1 : 0,
                        }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        style={{ originX: 0 }}
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
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1E3A8A]/40 ring-offset-2 ring-offset-white transition group-hover:ring-[#16A34A]/50"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1E3A8A] text-white shadow-sm">
                        <motion.span
                          animate={{ rotate: isProfileOpen ? 180 : 0 }}
                          className="inline-flex"
                        >
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
                      className={`inline-flex items-center rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(22,163,74,0.7)] transition hover:bg-[#15803D] ${focusRing}`}
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
