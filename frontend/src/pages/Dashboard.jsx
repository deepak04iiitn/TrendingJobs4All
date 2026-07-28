import React, { useState, useEffect, useRef } from 'react';
import { 
  FaChartLine, 
  FaUsers, 
  FaComments, 
  FaClipboardList, 
  FaMoneyBillWave, 
  FaBars, 
  FaTimes,
  FaCheck, FaTrash, FaExclamationTriangle, FaBug, FaLightbulb, FaSort, FaTable, FaTrophy 
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [interviewExperiences, setInterviewExperiences] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState('');
  const [currentUser, setCurrentUser] = useState({ isUserAdmin: true }); 
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [userFilterDate, setUserFilterDate] = useState('');
  const [filteredUsersCount, setFilteredUsersCount] = useState(null);
  const [visitedUsersCount, setVisitedUsersCount] = useState(null);
  const [bugQuery, setBugQuery] = useState('');
  const [bugStatus, setBugStatus] = useState('');
  const [bugSortBy, setBugSortBy] = useState('createdAt');
  const [bugOrder, setBugOrder] = useState('desc');
  const [featureQuery, setFeatureQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState('');
  const [featureSortBy, setFeatureSortBy] = useState('createdAt');
  const [featureOrder, setFeatureOrder] = useState('desc');
  const [dsaUserStats, setDsaUserStats] = useState([]);
  const [dsaLeaderboard, setDsaLeaderboard] = useState([]);
  const [dsaTotalProblems, setDsaTotalProblems] = useState(0);
  const [dsaSearch, setDsaSearch] = useState('');
  const [dsaSortBy, setDsaSortBy] = useState('completedCount');
  const [dsaOrder, setDsaOrder] = useState('desc');
  
  const sidebarRef = useRef(null);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    if (currentUser.isUserAdmin) {
      setPage(1);
      switch (activeTab) {
        case 'users':
          fetchUsers();
          break;
        case 'comments':
          fetchComments();
          break;
        case 'interviewExperiences':
          fetchInterviewExperiences();
          break;
        case 'salaries':
          fetchSalaries();
          break;
        case 'bugs':
          fetchBugReports(true);
          break;
        case 'features':
          fetchFeatureRequests(true);
          break;
        case 'dsa':
          fetchDSAAdminStats();
          break;
        case 'dsaLeaderboard':
          fetchDSAAdminStats();
          break;
      }
    }
  }, [currentUser.isUserAdmin, activeTab, userFilterDate]);


  const AdvancedStatistics = () => {
    const colors = {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981',
      grid: '#e5e7eb',
      text: '#6b7280',
    };
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminCounts, setAdminCounts] = useState({
      usersLength: 0,
      commentsLength: 0,
      interviewExperiencesLength: 0,
      salariesLength: 0,
    });
    const [llms, setLlms] = useState({
      interviewExperiences: 0,
      salaryRecords: 0,
      interviewQuestions: 0,
      jobs: 0,
      blogs: 0,
      total: 0
    });
    const [bugTotals, setBugTotals] = useState({ total: 0, pending: 0, resolved: 0 });
    const [featureTotals, setFeatureTotals] = useState({ total: 0, pending: 0, implemented: 0 });
    const [months, setMonths] = useState([]);
    const [usersMonthly, setUsersMonthly] = useState([]);
    const [visitsMonthly, setVisitsMonthly] = useState([]);

    useEffect(() => {
      const getMonthBuckets = (n = 6) => {
        const arr = [];
        const now = new Date();
        for (let i = n - 1; i >= 0; i--) {
          const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
          arr.push({
            key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`,
            label: d.toLocaleString(undefined, { month: 'short' })
          });
        }
        return arr;
      };

      const fetchAll = async () => {
        try {
          setLoading(true);
          setError('');
          const monthBuckets = getMonthBuckets(6);
          setMonths(monthBuckets.map(m => m.label));

          const [
            adminRes,
            llmsRes,
            bugTotalRes,
            bugPendingRes,
            bugResolvedRes,
            featureTotalRes,
            featurePendingRes,
            featureImplementedRes,
            dsaLeaderboardRes
          ] = await Promise.all([
            fetch('/backend/admin/statistics', { credentials: 'include' }),
            // Public route mounted at root
            fetch('/llms-stats'),
            // Admin-only; may fail if not authenticated/admin
            fetch(`/backend/bugs?page=1&limit=1`, { credentials: 'include' }),
            fetch(`/backend/bugs?page=1&limit=1&status=Pending`, { credentials: 'include' }),
            fetch(`/backend/bugs?page=1&limit=1&status=Resolved`, { credentials: 'include' }),
            fetch(`/backend/feature-requests?page=1&limit=1`, { credentials: 'include' }),
            fetch(`/backend/feature-requests?page=1&limit=1&status=Pending`, { credentials: 'include' }),
            fetch(`/backend/feature-requests?page=1&limit=1&status=Implemented`, { credentials: 'include' }),
            // Public leaderboard to read totalProblems for sheet size
            fetch(`/backend/dsa-problems/leaderboard`)
          ]);

          // Parse JSON with guards
          const safeJson = async (res) => {
            try { return await res.json(); } catch { return null; }
          };
          const [adminData, llmsData, bugTotal, bugPending, bugResolved, featTotal, featPending, featImplemented, dsaLeaderboard] =
            await Promise.all([safeJson(adminRes), safeJson(llmsRes), safeJson(bugTotalRes), safeJson(bugPendingRes), safeJson(bugResolvedRes), safeJson(featureTotalRes), safeJson(featurePendingRes), safeJson(featureImplementedRes), safeJson(dsaLeaderboardRes)]);

          if (adminRes.ok && adminData) setAdminCounts(adminData);
          if (llmsRes.ok && llmsData?.stats?.dynamicItems) {
            setLlms({
              interviewExperiences: llmsData.stats.dynamicItems.interviewExperiences || 0,
              salaryRecords: llmsData.stats.dynamicItems.salaryRecords || 0,
              interviewQuestions: llmsData.stats.dynamicItems.interviewQuestions || 0,
              jobs: llmsData.stats.dynamicItems.jobs || 0,
              blogs: llmsData.stats.dynamicItems.blogs || 0,
              total: llmsData.stats.dynamicItems.total || 0
            });
          }
          if ((bugTotalRes.ok || bugPendingRes.ok || bugResolvedRes.ok) && (bugTotal || bugPending || bugResolved)) {
            setBugTotals({
              total: bugTotal?.total || 0,
              pending: bugPending?.total || 0,
              resolved: bugResolved?.total || 0
            });
          }
          if ((featureTotalRes.ok || featurePendingRes.ok || featureImplementedRes.ok) && (featTotal || featPending || featImplemented)) {
            setFeatureTotals({
              total: featTotal?.total || 0,
              pending: featPending?.total || 0,
              implemented: featImplemented?.total || 0
            });
          }
          // If admin counts unavailable, attempt to derive some KPIs from llms stats
          if (!adminRes.ok && llmsRes.ok) {
            setAdminCounts((prev) => ({
              ...prev,
              interviewExperiencesLength: llmsData?.stats?.dynamicItems?.interviewExperiences || 0,
              salariesLength: llmsData?.stats?.dynamicItems?.salaryRecords || 0,
            }));
          }
          // We can surface totalProblems for sheet size from public leaderboard
          const totalProblems = dsaLeaderboard?.totalProblems;

          // Users monthly registered and visited via existing API filter by date
          // This route requires auth; if not available, skip silently
          try {
            const monthlyPromises = monthBuckets.map((m) =>
              fetch(`/backend/user/getusers?startIndex=0&limit=1&date=${m.key}`, { credentials: 'include' }).then(async (r) => (r.ok ? r.json() : null))
            );
            const monthResults = await Promise.all(monthlyPromises);
            const regSeries = monthResults.map(r => (r && typeof r.matchedCount === 'number' ? r.matchedCount : 0));
            const visitSeries = monthResults.map(r => (r && typeof r.visitedCount === 'number' ? r.visitedCount : 0));
            if (regSeries.some(v => v > 0) || visitSeries.some(v => v > 0)) {
              setUsersMonthly(regSeries);
              setVisitsMonthly(visitSeries);
            }
          } catch {}
        } catch (e) {
          setError('Failed to load statistics');
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }, []);

    const toPath = (data, width, height, padding) => {
      if (!data || data.length === 0) return '';
      const max = Math.max(...data);
      const min = Math.min(...data);
      const stepX = (width - padding * 2) / Math.max(1, (data.length - 1));
      const y = (v) => {
        if (max === min) return height / 2;
        return height - padding - ((v - min) / (max - min)) * (height - padding * 2);
      };
      return data
        .map((v, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${y(v)}`)
        .join(' ');
    };

    const donutData = [
      { label: 'Jobs', value: llms.jobs, color: '#60a5fa' },
      { label: 'Interviews', value: llms.interviewExperiences, color: '#a78bfa' },
      { label: 'Salaries', value: llms.salaryRecords, color: '#f59e0b' },
      { label: 'Questions', value: llms.interviewQuestions, color: '#f472b6' },
      { label: 'Blogs', value: llms.blogs, color: '#22c55e' },
    ].filter(d => d.value > 0);
    const donutTotal = donutData.reduce((a, b) => a + b.value, 0) || 1;
    const donutCirc = 2 * Math.PI * 60;

    const kpis = [
      { label: 'Total Users', value: adminCounts.usersLength || 'N/A' },
      { label: 'Interview Experiences', value: adminCounts.interviewExperiencesLength },
      { label: 'Salary Structures', value: adminCounts.salariesLength },
      { label: 'Comments', value: adminCounts.commentsLength || 'N/A' },
      { label: 'Question Bank', value: llms.interviewQuestions },
      { label: 'Jobs', value: llms.jobs },
      { label: 'Blogs', value: llms.blogs },
      { label: 'Bugs (All)', value: bugTotals.total || 'N/A' },
      { label: 'Features (All)', value: featureTotals.total || 'N/A' },
    ];

    return (
      <div className="space-y-6 p-4 mt-6">
        {error && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">{k.label}</div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '—' : k.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-gray-100">Users Growth (last 6 months)</div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background: colors.primary }} />Registered</div>
                <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background: colors.secondary }} />Visited</div>
              </div>
            </div>
            <div className="mt-3 w-full">
              <svg viewBox="0 0 700 260" className="w-full">
                <g>
                  {[0,1,2,3].map((i) => (
                    <line key={i} x1="40" x2="680" y1={40 + i * 50} y2={40 + i * 50} stroke={colors.grid} strokeDasharray="4 4" />
                  ))}
                </g>
                <g transform="translate(0,0)">
                  <path d={toPath(usersMonthly, 700, 240, 40)} fill="none" stroke={colors.primary} strokeWidth="2.5" />
                  <path d={toPath(visitsMonthly, 700, 240, 40)} fill="none" stroke={colors.secondary} strokeWidth="2.5" />
                </g>
                <g>
                  {months.map((m, i) => (
                    <text key={m} x={40 + i * ((700 - 80) / Math.max(1, (months.length - 1)))} y="255" textAnchor="middle" fontSize="10" fill={colors.text}>{m}</text>
                  ))}
                </g>
              </svg>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="font-semibold text-gray-900 dark:text-gray-100">Content Mix</div>
            <div className="mt-4 flex items-center gap-6">
              <svg viewBox="0 0 160 160" className="w-36 h-36">
                <circle cx="80" cy="80" r="60" stroke="#e5e7eb" className="dark:stroke-gray-700" strokeWidth="16" fill="none" />
                {(() => {
                  let donutOffset = 0;
                  return donutData.map((d) => {
                    const length = ((d.value || 0) / donutTotal) * donutCirc;
                    const circle = (
                      <circle
                        key={d.label}
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke={d.color}
                        strokeWidth="16"
                        strokeDasharray={`${length} ${donutCirc - length}`}
                        strokeDashoffset={-donutOffset}
                        transform="rotate(-90 80 80)"
                      />
                    );
                    donutOffset += length;
                    return circle;
                  });
                })()}
              </svg>
              <div className="space-y-2 text-sm">
                {donutData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: d.color }} />
                      <span className="text-gray-600 dark:text-gray-300">{d.label}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Breakdown of platform content</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="font-semibold text-gray-900 dark:text-gray-100">Bugs Status</div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Pending', a: bugTotals.pending, color: '#f59e0b' },
                { label: 'Resolved', a: bugTotals.resolved, color: '#10b981' },
              ].map((row) => {
                const max = Math.max(1, bugTotals.total);
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{row.label}</span>
                      <span>{row.a.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-7 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-7"
                        style={{ width: `${(row.a / max) * 100}%`, background: row.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="font-semibold text-gray-900 dark:text-gray-100">Feature Requests Status</div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Pending', a: featureTotals.pending, color: '#60a5fa' },
                { label: 'Implemented', a: featureTotals.implemented, color: '#22c55e' },
              ].map((row) => {
                const max = Math.max(1, featureTotals.total);
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{row.label}</span>
                      <span>{row.a.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-7 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-7"
                        style={{ width: `${(row.a / max) * 100}%`, background: row.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fetchBugReports = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (bugQuery) params.set('search', bugQuery);
      if (bugStatus) params.set('status', bugStatus);
      params.set('sortBy', bugSortBy);
      params.set('order', bugOrder);
      params.set('page', String(resetPage ? 1 : page));
      params.set('limit', String(ITEMS_PER_PAGE));
      const res = await fetch(`/backend/bugs?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        if (resetPage || page === 1) setBugReports(data.items);
        else setBugReports(prev => [...prev, ...data.items]);
        setShowMore((data.items || []).length === ITEMS_PER_PAGE);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatureRequests = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (featureQuery) params.set('search', featureQuery);
      if (featureStatus) params.set('status', featureStatus);
      params.set('sortBy', featureSortBy);
      params.set('order', featureOrder);
      params.set('page', String(resetPage ? 1 : page));
      params.set('limit', String(ITEMS_PER_PAGE));
      const res = await fetch(`/backend/feature-requests?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        if (resetPage || page === 1) setFeatureRequests(data.items);
        else setFeatureRequests(prev => [...prev, ...data.items]);
        setShowMore((data.items || []).length === ITEMS_PER_PAGE);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDSAAdminStats = async () => {
    try {
      setLoading(true);
      const [usersRes, leaderboardRes] = await Promise.all([
        fetch(`/backend/dsa-problems/admin/users-stats`, { credentials: 'include' }),
        fetch(`/backend/dsa-problems/admin/leaderboard?limit=20`, { credentials: 'include' })
      ]);
      const usersData = await usersRes.json();
      const leaderboardData = await leaderboardRes.json();
      if (usersRes.ok) {
        setDsaUserStats(usersData.items || []);
        setDsaTotalProblems(usersData.totalProblems || 0);
      }
      if (leaderboardRes.ok) {
        setDsaLeaderboard(leaderboardData.items || []);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };


  const fetchUsers = async (pageOverride) => {
    try {
      setLoading(true);
      const effectivePage = pageOverride ?? page;
      const params = new URLSearchParams({
        startIndex: String((effectivePage - 1) * ITEMS_PER_PAGE),
        limit: String(ITEMS_PER_PAGE),
      });
      if (userFilterDate) params.set('date', userFilterDate);
      const res = await fetch(`/backend/user/getusers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        if (effectivePage === 1) {
          setUsers(data.users);
        } else {
          setUsers(prev => [...prev, ...data.users]);
        }
        setShowMore(data.users.length === ITEMS_PER_PAGE);
        setFilteredUsersCount(typeof data.matchedCount === 'number' ? data.matchedCount : null);
        setVisitedUsersCount(typeof data.visitedCount === 'number' ? data.visitedCount : null);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/backend/comment/getComments?startIndex=${(page - 1) * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}&sort=desc`);
      const data = await res.json();
      
      if (res.ok) {
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setShowMore(data.comments.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterviewExperiences = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/backend/interviews/getInterviewExp?startIndex=${(page - 1) * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();
      
      if (res.ok) {
        if (page === 1) {
          setInterviewExperiences(data);
        } else {
          setInterviewExperiences(prev => [...prev, ...data]);
        }
        setShowMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/backend/salary/getSalary?startIndex=${(page - 1) * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();
      
      if (res.ok) {
        if (page === 1) {
          setSalaries(data);
        } else {
          setSalaries(prev => [...prev, ...data]);
        }
        setShowMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    switch (activeTab) {
      case 'users':
        fetchUsers(nextPage);
        break;
      case 'comments':
        fetchComments();
        break;
      case 'interviewExperiences':
        fetchInterviewExperiences();
        break;
      case 'salaries':
        fetchSalaries();
        break;
      case 'bugs':
        fetchBugReports();
        break;
      case 'features':
        fetchFeatureRequests();
        break;
      case 'dsa':
        fetchDSAAdminStats();
        break;
      case 'dsaLeaderboard':
        fetchDSAAdminStats();
        break;
    }
  };

  const handleDelete = async () => {
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'users':
          endpoint = `/backend/user/delete/${itemToDelete}`;
          break;
        case 'comments':
          endpoint = `/backend/comment/deleteComment/${itemToDelete}`;
          break;
        case 'interviewExperiences':
          endpoint = `/backend/interviews/delete/${itemToDelete}`;
          break;
        case 'salaries':
          endpoint = `/backend/salary/delete/${itemToDelete}`;
          break;
      case 'bugs':
        // no delete; skip
        break;
      case 'features':
        // no delete; skip
        break;
      }
        
      const res = await fetch(endpoint, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (res.ok) {
        switch (activeTab) {
          case 'users':
            setUsers((prev) => prev.filter((user) => user._id !== itemToDelete));
            break;
          case 'comments':
            setComments((prev) => prev.filter((comment) => comment._id !== itemToDelete));
            break;
          case 'interviewExperiences':
            setInterviewExperiences((prev) => prev.filter((exp) => exp._id !== itemToDelete));
            break;
          case 'salaries':
            setSalaries((prev) => prev.filter((salary) => salary._id !== itemToDelete));
            break;
        }
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const UsersTable = () => (
    <div className="w-full mt-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by date</label>
          <input
            type="date"
            value={userFilterDate}
            onChange={(e) => {
              setPage(1);
              setUserFilterDate(e.target.value);
            }}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
          {userFilterDate && (
            <button
              onClick={() => {
                setUserFilterDate('');
                setPage(1);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {filteredUsersCount !== null && userFilterDate ? (
              <span>
                Registered: <span className="font-semibold">{filteredUsersCount}</span>
              </span>
            ) : null}
            {visitedUsersCount !== null && userFilterDate ? (
              <span className="ml-4">
                Visited: <span className="font-semibold">{visitedUsersCount}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
          {[
            'Date created',
            'User image',
            'Username',
            'Email',
            'Status',
            'Last Visit',
            'Admin',
            'Actions'
          ].map((header) => (
            <th key={header} className="px-6 py-5 text-left">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {header}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {users.map((user, index) => (
          <tr
            key={user._id}
            className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-blue-400 dark:ring-blue-500">
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.username}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
            </td>
            <td className="px-6 py-4">
              <StatusIndicator status={user.status} />
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatLastVisit(user.lastVisit)}
              </span>
            </td>
            <td className="px-6 py-4">
              {user.isUserAdmin ? (
                <div className="flex items-center">
                  <FaCheck className="text-emerald-500 text-lg" />
                  <span className="ml-2 text-sm text-emerald-500">Admin</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FaTimes className="text-gray-400 text-lg" />
                  <span className="ml-2 text-sm text-gray-400">User</span>
                </div>
              )}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setItemToDelete(user._id);
                }}
                disabled={user.isUserAdmin}
                className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-500"
              >
                <FaTrash className="mr-2" />
                <span>Delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );

  const CommentsTable = () => (
    <div className="w-full mt-12">
      <table className="w-full mt-12">
      <thead>
        <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
          {[
            'Date updated',
            'Comment content',
            'Number of likes',
            'Job Id',
            'User Id',
            'Actions'
          ].map((header) => (
            <th key={header} className="px-6 py-5 text-left">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {header}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {comments.map((comment, index) => (
          <tr
            key={comment._id}
            className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(comment.updatedAt).toLocaleDateString()}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {comment.content}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {comment.numberOfLikes}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {comment.jobId}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {comment.userId}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setItemToDelete(comment._id);
                }}
                className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300"
              >
                <FaTrash className="mr-2" />
                <span>Delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );

  const SalariesTable = () => (
    <div className="w-full mt-12">
      <table className="w-full mt-12">
      <thead>
        <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
          {[
            'Company',
            'Position',
            'Location',
            'Salary',
            'CTC',
            'Experience',
            'Likes',
            'Dislikes',
            'Actions'
          ].map((header) => (
            <th key={header} className="px-6 py-5 text-left">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {header}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {salaries.map((salary, index) => (
          <tr
            key={salary._id}
            className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <td className="px-6 py-4">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {salary.company}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {salary.position}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {salary.location}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {salary.salary}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {salary.ctc}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {salary.yearsOfExperience} years
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-green-600 flex items-center">
                <FaCheck className="mr-2" />
                {salary.numberOfLikes}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-red-600 flex items-center">
                <FaTimes className="mr-2" />
                {salary.numberOfDislikes}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setItemToDelete(salary._id);
                }}
                className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300"
              >
                <FaTrash className="mr-2" />
                <span>Delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );

  const InterviewExperiencesTable = () => (
    <div className="w-full">
      <table className="w-full mt-12">
      <thead>
        <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
          {[
            'Company',
            'Position',
            'Verdict',
            'Number of Likes',
            'Number of Dislikes',
            'Actions'
          ].map((header) => (
            <th key={header} className="px-6 py-5 text-left">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {header}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {interviewExperiences.map((experience, index) => (
          <tr
            key={experience._id}
            className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {experience.company}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {experience.position}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`text-sm font-medium ${
                experience.verdict === 'selected' 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {experience.verdict}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {experience.numberOfLikes}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {experience.numberOfDislikes}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => {
                  setShowModal(true);
                  setItemToDelete(experience._id);
                }}
                className="flex items-center px-3 py-1 rounded-full text-sm text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300"
              >
                <FaTrash className="mr-2" />
                <span>Delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );

  const BugsTable = () => (
    <div className="w-full mt-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between p-4">
        <div className="flex gap-2 items-center">
          <input
            value={bugQuery}
            onChange={(e) => setBugQuery(e.target.value)}
            placeholder="Search email or description"
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
          <select
            value={bugStatus}
            onChange={(e) => setBugStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={bugSortBy}
            onChange={(e) => setBugSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="createdAt">Date</option>
            <option value="status">Status</option>
          </select>
          <select
            value={bugOrder}
            onChange={(e) => setBugOrder(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button
            onClick={() => { setPage(1); fetchBugReports(true); }}
            className="px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm"
          >
            Apply
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            {['Date', 'Email', 'Bug Description', 'Status'].map((h) => (
              <th key={h} className="px-6 py-5 text-left">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {bugReports.map((b) => (
            <tr key={b._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(b.createdAt).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{b.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xl break-words">{b.description}</td>
              <td className="px-6 py-4">
                <select
                  value={b.status}
                  onChange={async (e) => {
                    const res = await fetch(`/backend/bugs/${b._id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ status: e.target.value })
                    });
                    if (res.ok) {
                      setBugReports((prev) => prev.map((x) => x._id === b._id ? { ...x, status: e.target.value } : x));
                    }
                  }}
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const FeaturesTable = () => (
    <div className="w-full mt-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between p-4">
        <div className="flex gap-2 items-center">
          <input
            value={featureQuery}
            onChange={(e) => setFeatureQuery(e.target.value)}
            placeholder="Search email or request"
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
          <select
            value={featureStatus}
            onChange={(e) => setFeatureStatus(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Implemented">Implemented</option>
          </select>
          <select
            value={featureSortBy}
            onChange={(e) => setFeatureSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="createdAt">Date</option>
            <option value="status">Status</option>
          </select>
          <select
            value={featureOrder}
            onChange={(e) => setFeatureOrder(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button
            onClick={() => { setPage(1); fetchFeatureRequests(true); }}
            className="px-3 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm"
          >
            Apply
          </button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            {['Date', 'Email', 'Request Description', 'Status'].map((h) => (
              <th key={h} className="px-6 py-5 text-left">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {featureRequests.map((f) => (
            <tr key={f._id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(f.createdAt).toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{f.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xl break-words">{f.description}</td>
              <td className="px-6 py-4">
                <select
                  value={f.status}
                  onChange={async (e) => {
                    const res = await fetch(`/backend/feature-requests/${f._id}/status`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ status: e.target.value })
                    });
                    if (res.ok) {
                      setFeatureRequests((prev) => prev.map((x) => x._id === f._id ? { ...x, status: e.target.value } : x));
                    }
                  }}
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Implemented">Implemented</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );


  const DSAStats = () => {
    const filtered = dsaUserStats.filter((u) => {
      if (!dsaSearch) return true;
      const q = dsaSearch.toLowerCase();
      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = dsaOrder === 'asc' ? 1 : -1;
      if (dsaSortBy === 'completedCount') return (a.completedCount - b.completedCount) * dir;
      if (dsaSortBy === 'completionPercentage') return (a.completionPercentage - b.completionPercentage) * dir;
      if (dsaSortBy === 'lastCompletedAt') {
        const ax = a.lastCompletedAt ? new Date(a.lastCompletedAt).getTime() : 0;
        const bx = b.lastCompletedAt ? new Date(b.lastCompletedAt).getTime() : 0;
        return (ax - bx) * dir;
      }
      return 0;
    });

    return (
      <div className="w-full mt-12 p-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={dsaSearch}
              onChange={(e) => setDsaSearch(e.target.value)}
              placeholder="Search username or email"
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <select
              value={dsaSortBy}
              onChange={(e) => setDsaSortBy(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="completedCount">Solved Count</option>
              <option value="completionPercentage">Completion %</option>
              <option value="lastCompletedAt">Last Completed</option>
            </select>
            <select
              value={dsaOrder}
              onChange={(e) => setDsaOrder(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total problems in sheet: <span className="font-semibold">{dsaTotalProblems}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                  {['User', 'Email', 'Solved', 'Favorites', 'Completion %', 'Last Completed'].map((h) => (
                    <th key={h} className="px-6 py-5 text-left whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sorted.map((u) => (
                  <tr key={u.userId} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={u.profilePicture} alt={u.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{u.completedCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{u.favoriteCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{u.completionPercentage}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{u.lastCompletedAt ? new Date(u.lastCompletedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const DSALeaderboard = () => (
    <div className="w-full mt-12 p-4">
      <div className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">DSA Leaderboard</div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800">
              {['Rank', 'User', 'Solved', '%'].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {dsaLeaderboard.map((u, idx) => (
              <tr key={u.userId} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">#{idx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img src={u.profilePicture} alt={u.username} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <span className="text-sm truncate">{u.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{u.completedCount}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{u.completionPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, tab }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        if (window.innerWidth < 1280) {
          setIsSidebarOpen(false);
        }
      }}
      className={`
        w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 text-left
        ${activeTab === tab 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'}
      `}
    >
      <Icon className="text-base sm:text-lg flex-shrink-0" />
      <span className="text-sm sm:text-base font-medium">{label}</span>
    </button>
  );


  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if sidebar is open and click is outside the sidebar
      if (
        isSidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    // Add event listener when sidebar is open
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);


  const StatusIndicator = ({ status }) => {
    const isActive = status === 'Active';
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isActive && (
            <>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </>
          )}
        </div>
        <span className={`text-sm font-medium ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
          {status}
        </span>
      </div>
    );
  };

  const formatLastVisit = (date) => {
    const now = new Date();
    const lastVisit = new Date(date);
    const diffTime = Math.abs(now - lastVisit);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return lastVisit.toLocaleDateString();
    }
  };


  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Admin Dashboard | Route2Hire QA & SDET Platform</title>
        <meta
          name="description"
          content="Manage Route2Hire platform with comprehensive admin dashboard. Monitor QA jobs, SDET careers, user activity, comments, and platform statistics for software testing professionals."
        />
        <meta
          name="keywords"
          content="Admin dashboard, Route2Hire management, QA platform admin, SDET careers management, Software testing platform, User management, Platform statistics"
        />
        <meta property="og:title" content="Admin Dashboard | Route2Hire QA & SDET Platform" />
        <meta
          property="og:description"
          content="Comprehensive admin dashboard for managing Route2Hire platform, monitoring QA jobs, SDET careers, and supporting software testing professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/dashboard" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/dashboard" />
      </Helmet>

      <div className="flex flex-col xl:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen overflow-x-hidden">
        {/* Sidebar Toggle Arrow - right edge */}
        <button
          className="xl:hidden fixed top-1/2 -translate-y-1/2 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-2.5 rounded-l-xl shadow-2xl backdrop-blur-sm border border-white/20 hover:translate-x-0.5 transition-all duration-300 touch-manipulation"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Backdrop for mobile and tablet */}
        {isSidebarOpen && window.innerWidth < 1280 && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Responsive width and positioning */}
        <div
          ref={sidebarRef}
          className={`
            w-full sm:w-80 lg:w-96 xl:w-80 2xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 transition-all duration-500 fixed inset-y-0 overflow-y-auto
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0
            xl:left-0 xl:right-auto xl:translate-x-0 xl:relative
          `}
        >
          <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 p-2 sm:p-3 md:p-4">
            {/* Close button for mobile and tablet */}
            {isSidebarOpen && window.innerWidth < 1280 && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="Close sidebar"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Manage your platform</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <SidebarItem icon={FaChartLine} label="Statistics" tab="statistics" />
              <SidebarItem icon={FaUsers} label="Users" tab="users" />
              <SidebarItem icon={FaComments} label="Comments" tab="comments" />
              <SidebarItem icon={FaClipboardList} label="Interview Experiences" tab="interviewExperiences" />
              <SidebarItem icon={FaMoneyBillWave} label="Salary Structures" tab="salaries" />
              <SidebarItem icon={FaBug} label="Bugs" tab="bugs" />
              <SidebarItem icon={FaLightbulb} label="Feature Requests" tab="features" />
              <SidebarItem icon={FaTable} label="DSA Sheet" tab="dsa" />
              <SidebarItem icon={FaTrophy} label="DSA Leaderboard" tab="dsaLeaderboard" />
            </nav>
          </div>
        </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden">
        {currentUser.isUserAdmin && (
          activeTab === 'statistics' ? (
            <AdvancedStatistics />
          ) : 
          activeTab === 'users' ? users.length > 0 :
          activeTab === 'comments' ? comments.length > 0 :
          activeTab === 'interviewExperiences' ? interviewExperiences.length > 0 :
          activeTab === 'salaries' ? salaries.length > 0 :
          activeTab === 'bugs' ? bugReports.length > 0 :
          activeTab === 'features' ? featureRequests.length > 0 :
          activeTab === 'dsa' ? dsaUserStats.length > 0 :
          activeTab === 'dsaLeaderboard' ? dsaLeaderboard.length > 0 :
          false
        ) ? (
          <div className="animate-fade-in">
            <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                {activeTab === 'statistics' ? <AdvancedStatistics /> : 
                 activeTab === 'users' ? <UsersTable /> : 
                 activeTab === 'comments' ? <CommentsTable /> : 
                 activeTab === 'interviewExperiences' ? <InterviewExperiencesTable /> : 
                 activeTab === 'salaries' ? <SalariesTable /> :
                 activeTab === 'bugs' ? <BugsTable /> :
                 activeTab === 'features' ? <FeaturesTable /> :
                 activeTab === 'dsa' ? <DSAStats /> :
                 activeTab === 'dsaLeaderboard' ? <DSALeaderboard /> :
                 null}
              </div>
            </div>

            {showMore && activeTab !== 'statistics' && (
              <button
                onClick={handleShowMore}
                disabled={loading}
                className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : `Load More ${activeTab}`}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <span className="text-xl font-medium">No {activeTab} found</span>
            <p className="mt-2 text-sm">Start by adding some {activeTab} to your system</p>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full m-4 p-6 shadow-2xl transform transition-all animate-modal-slide-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FaExclamationTriangle className="text-2xl text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete {activeTab === 'users' ? 'User' : 
                          activeTab === 'comments' ? 'Comment' : 
                          activeTab === 'interviewExperiences' ? 'Interview Experience' : 
                          activeTab === 'salaries' ? 'Salary Structure' :
                          'Item'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone. Are you sure?
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modal-slide-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        tr {
          animation: slide-in 0.5s ease-out forwards;
        }
        
        .animate-modal-slide-in {
          animation: modal-slide-in 0.3s ease-out;
        }
      `}</style>
      </div>
    </>
  );
};

export default Dashboard;