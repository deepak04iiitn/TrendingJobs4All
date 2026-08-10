import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  DollarSign,
  Menu,
  X,
  Home,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Bookmark,
  BellRing,
  Code2,
} from 'lucide-react';
import MyInterviews from '../components/MyInterviews';
import MySalary from '../components/MySalary';
import MyJobsPanel from '../components/MyJobsPanel';
import PremiumJobsPanel from '../components/PremiumJobsPanel';
import MyDsaProgressPanel from '../components/MyDsaProgressPanel';
import { focusRing } from '../theme/tokens';

const MENU = [
  {
    id: 'interview',
    icon: FileText,
    label: 'Interview experiences',
    blurb: 'Stories you have shared',
  },
  {
    id: 'salary',
    icon: DollarSign,
    label: 'Salary structures',
    blurb: 'Offers you have posted',
  },
  {
    id: 'jobs',
    icon: Bookmark,
    label: 'My Jobs',
    blurb: 'Roles you have saved',
  },
  {
    id: 'premium',
    icon: BellRing,
    label: 'Premium Jobs',
    blurb: 'Subscription & daily matches',
  },
  {
    id: 'dsa',
    icon: Code2,
    label: 'DSA progress',
    blurb: 'Streaks, XP & heatmap',
  },
];

const PANELS = {
  interview: MyInterviews,
  salary: MySalary,
  jobs: MyJobsPanel,
  premium: PremiumJobsPanel,
  dsa: MyDsaProgressPanel,
};

export default function MyCorner() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const panelFromUrl = searchParams.get('panel');
  const [activeItem, setActiveItem] = useState(
    PANELS[panelFromUrl] ? panelFromUrl : 'interview',
  );
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (panelFromUrl && PANELS[panelFromUrl] && panelFromUrl !== activeItem) {
      setActiveItem(panelFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelFromUrl]);

  if (!currentUser) {
    const redirect = panelFromUrl
      ? `/sign-in?redirect=${encodeURIComponent(`/myCorner?panel=${panelFromUrl}`)}`
      : '/sign-in?redirect=/myCorner';
    return <Navigate to={redirect} replace />;
  }

  const active = MENU.find((m) => m.id === activeItem) || MENU[0];

  const selectItem = (id) => {
    setActiveItem(id);
    setMobileOpen(false);
    setSearchParams(id === 'interview' ? {} : { panel: id }, { replace: true });
  };

  const sidebarInner = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[#E5DCCE] px-4 py-4">
        {(!collapsed || mobileOpen) ? (
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Personal
            </p>
            <h1 className="font-display truncate text-lg font-semibold leading-tight text-[#1C1917]">
              My Corner
            </h1>
          </div>
        ) : (
          <p className="text-center font-display text-sm font-semibold text-[#1C1917]">MC</p>
        )}
      </div>

      <nav
        className="r2h-scroll-hidden min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-2.5"
        aria-label="My Corner sections"
      >
        {MENU.map(({ id, icon: Icon, label, blurb }) => {
          const isActive = activeItem === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectItem(id)}
              title={label}
              className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${focusRing} ${
                isActive
                  ? 'bg-[#2C241B] text-[#FFFDF8]'
                  : 'text-[#6B5A48] hover:bg-[#F7F3EC] hover:text-[#2C241B]'
              } ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#C4A574]' : 'text-[#C4A574]/80'}`}
                aria-hidden
              />
              {(!collapsed || mobileOpen) && (
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-[13px] font-medium">{label}</span>
                  <span
                    className={`mt-0.5 block truncate text-[10px] leading-snug ${
                      isActive ? 'text-[#E5DCCE]' : 'text-[#78716C]'
                    }`}
                  >
                    {blurb}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[#E5DCCE] p-3">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`flex w-full items-center gap-3 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 px-3 py-2.5 text-left transition hover:bg-[#EFE8DC] ${focusRing} ${
            collapsed && !mobileOpen ? 'justify-center' : ''
          }`}
        >
          <img
            src={currentUser.profilePicture || '/assets/Profile.jpg'}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#E5DCCE]"
          />
          {(!collapsed || mobileOpen) && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[#1C1917]">
                {currentUser.username}
              </span>
              <span className="block truncate text-[11px] text-[#78716C]">{currentUser.email}</span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={`mt-2 hidden w-full items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] lg:flex ${focusRing}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>My Corner | Personal workspace — Route2Hire</title>
        <meta
          name="description"
          content="Your personal Route2Hire workspace. Manage interview experiences and salary structures you have shared as a QA or SDET professional."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://route2hire.com/myCorner" />
      </Helmet>

      {/* Do not put w-full on the main column — beside a fixed-width sidebar it becomes 100%+280px and clips. */}
      <div className="flex min-h-screen w-full min-w-0 overflow-x-clip bg-[#F7F3EC]">
        {/* Desktop sidebar — fixed to viewport height; nav scrolls inside */}
        <aside
          className={`sticky top-0 hidden h-svh max-h-svh shrink-0 overflow-hidden border-r border-[#E5DCCE] bg-[#FFFDF8] transition-[width] duration-300 lg:flex lg:flex-col ${
            collapsed ? 'w-[88px]' : 'w-[280px]'
          }`}
        >
          {sidebarInner}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 lg:hidden"
                onClick={() => setMobileOpen(false)}
                aria-hidden
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed inset-y-0 left-0 z-[2147483647] flex h-svh max-h-svh w-[min(100%,280px)] flex-col overflow-hidden border-r border-[#E5DCCE] bg-[#FFFDF8] lg:hidden"
              >
                <div className="absolute right-3 top-3 z-10">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] ${focusRing}`}
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {sidebarInner}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main — flex-1 + min-w-0 only (no w-full) so width = remaining space after sidebar */}
        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E5DCCE] bg-[#F7F3EC]/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-2.5 text-[#6B5A48] ${focusRing}`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
                My Corner
              </p>
              <p className="truncate text-sm font-medium text-[#1C1917]">{active.label}</p>
            </div>
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-medium text-[#6B5A48] ${focusRing}`}
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </header>

          <main className="relative min-w-0 flex-1 overflow-x-clip">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-48"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 10% 0%, rgba(196,165,116,0.14), transparent 55%)',
              }}
            />

            <div className="relative mx-auto box-border w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
              <div className="mb-8 hidden items-end justify-between gap-4 border-b border-[#E5DCCE] pb-6 lg:flex">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                    Workspace
                  </p>
                  <h2 className="font-display mt-1 text-3xl font-semibold leading-[1.15] text-[#1C1917]">
                    {active.label}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-[#57534E]">{active.blurb}</p>
                </div>
                <Link
                  to="/"
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back to site
                </Link>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="min-w-0"
                >
                  {(() => {
                    const ActivePanel = PANELS[activeItem] || MyInterviews;
                    return <ActivePanel />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
