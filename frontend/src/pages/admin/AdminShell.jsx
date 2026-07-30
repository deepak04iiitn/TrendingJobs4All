import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Wallet,
  MessageSquareWarning,
  Binary,
  BookOpen,
  HelpCircle,
  Map,
  Menu,
  X,
  Home,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { focusRing } from '../../theme/tokens';

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/comments', label: 'Job comments', icon: MessageSquare },
  { to: '/admin/interviews', label: 'Interview experiences', icon: Briefcase },
  { to: '/admin/salaries', label: 'Salary structures', icon: Wallet },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquareWarning },
  { to: '/admin/dsa', label: 'DSA', icon: Binary },
  { to: '/admin/blogs', label: 'Blogs', icon: BookOpen },
  { to: '/admin/interview-questions', label: 'Questions', icon: HelpCircle },
  { to: '/admin/roadmaps', label: 'Roadmaps', icon: Map },
];

const TITLES = {
  '/admin': 'Overview',
  '/admin/users': 'Users',
  '/admin/comments': 'Job comments',
  '/admin/interviews': 'Interview experiences',
  '/admin/salaries': 'Salary structures',
  '/admin/feedback': 'Feedback queues',
  '/admin/dsa': 'DSA sheet',
  '/admin/blogs': 'Blogs',
  '/admin/interview-questions': 'Interview questions',
  '/admin/roadmaps': 'Roadmaps',
};

const SIDEBAR_COLLAPSED_KEY = 'r2h-admin-sidebar-collapsed';

function NavItems({ collapsed, onNavigate }) {
  return (
    <nav className="space-y-0.5 p-3">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
              collapsed ? 'justify-center px-2' : ''
            } ${
              isActive
                ? 'bg-[#2C241B] text-[#FFFDF8]'
                : 'text-[#6B5A48] hover:bg-[#F7F3EC] hover:text-[#2C241B]'
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminShell() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  });
  const title = TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Helmet>
        <title>{title} | Admin — Route2Hire</title>
      </Helmet>

      {/* Desktop sidebar — fixed flush to the top-left corner of the viewport, full height.
          The public Footer/SocialIconFab are hidden on admin routes (see App.jsx), so there's
          nothing below for this to ever overlap. */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#E5DCCE] bg-[#FFFDF8] transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className={`flex shrink-0 items-center border-b border-[#E5DCCE] px-3 py-4 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">Control room</p>
              <p className="font-display mt-1 text-lg font-semibold text-[#1C1917]">Admin</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={`shrink-0 rounded-lg p-2 text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="r2h-scroll-hidden flex-1 overflow-y-auto">
          <NavItems collapsed={collapsed} />
        </div>

        <div className="shrink-0 border-t border-[#E5DCCE] p-3">
          <NavLink
            to="/"
            title={collapsed ? 'Go to home' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] hover:text-[#2C241B] ${focusRing} ${
              collapsed ? 'justify-center px-2' : ''
            }`}
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">Go to home</span>}
          </NavLink>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-[2147483647] flex w-[min(100%,280px)] flex-col border-r border-[#E5DCCE] bg-[#FFFDF8] lg:hidden">
            <div className="flex items-center justify-between border-b border-[#E5DCCE] px-4 py-4">
              <p className="font-display text-lg font-semibold text-[#1C1917]">Admin</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="r2h-scroll-hidden flex-1 overflow-y-auto">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-[#E5DCCE] p-3">
              <NavLink
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex w-full items-center gap-2.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] hover:text-[#2C241B] ${focusRing}`}
              >
                <Home className="h-4 w-4 shrink-0" aria-hidden />
                Go to home
              </NavLink>
            </div>
          </aside>
        </>
      )}

      {/* Main content — left padding clears the fixed sidebar's width */}
      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`mb-4 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-2.5 text-[#6B5A48] lg:hidden ${focusRing}`}
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
