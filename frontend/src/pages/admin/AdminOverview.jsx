import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Map,
  Bug,
  Sparkles,
  Wallet,
  TrendingUp,
  PieChart,
  BarChart3,
  LayoutGrid,
  Gauge,
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import AdminLineChart from '../../components/admin/charts/AdminLineChart';
import AdminDonutChart from '../../components/admin/charts/AdminDonutChart';
import AdminBarChart from '../../components/admin/charts/AdminBarChart';
import { fetchAdminOverview } from '../../lib/admin-api';

function fmt(n) {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString();
}

function ChartCard({ title, description, icon: Icon, stat, hint, fullWidth, children }) {
  return (
    <div className={`rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F7F3EC] text-[#C4A574]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            )}
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">{title}</p>
          </div>
          <p className="mt-1.5 text-sm text-[#78716C]">{description}</p>
        </div>
        {stat != null && (
          <div className="text-right">
            <p className="font-display text-2xl font-semibold text-[#1C1917]">{stat}</p>
            {hint && <p className="text-[11px] text-[#78716C]">{hint}</p>}
          </div>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOverview()
      .then(setData)
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-20 text-center text-[#78716C]">Loading control room...</p>;
  }

  const k = data?.kpis || {};
  const charts = data?.charts || {};

  const totalRegistered = (charts.userGrowth || []).reduce((sum, m) => sum + (m.registered || 0), 0);
  const totalContent = (charts.contentMix || []).reduce((sum, c) => sum + (c.value || 0), 0);
  const totalFeedback = (charts.feedbackStatus || []).reduce((sum, s) => sum + (s.value || 0), 0);

  const footprintData = [
    { name: 'Users', value: k.users || 0 },
    { name: 'Interviews', value: k.interviews || 0 },
    { name: 'Salaries', value: k.salaries || 0 },
    { name: 'Comments', value: k.comments || 0 },
    { name: 'Blogs', value: k.blogs || 0 },
    { name: 'Questions', value: k.questionSets || 0 },
  ];

  const resolvedCount = (k.bugsResolved || 0) + (k.featuresImplemented || 0);
  const pendingCount = (k.bugsPending || 0) + (k.featuresPending || 0);
  const resolutionData = [
    { name: 'Resolved', value: resolvedCount },
    { name: 'Pending', value: pendingCount },
  ];
  const resolutionRate =
    resolvedCount + pendingCount > 0 ? Math.round((resolvedCount / (resolvedCount + pendingCount)) * 100) : 0;

  return (
    <div>
      <AdminSectionHeader
        title="Platform overview"
        description="Live metrics across users, content, blogs, and feedback — your Route2Hire control room."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminKpiCard label="Users" value={fmt(k.users)} hint={`+${fmt(k.lastMonthUsers)} this month`} icon={Users} />
        <AdminKpiCard label="Interviews" value={fmt(k.interviews)} icon={Briefcase} />
        <AdminKpiCard label="Salaries" value={fmt(k.salaries)} icon={Wallet} />
        <AdminKpiCard label="Comments" value={fmt(k.comments)} icon={MessageSquare} />
        <AdminKpiCard label="Jobs" value={fmt(k.jobs)} icon={Briefcase} />
        <AdminKpiCard label="Published blogs" value={fmt(k.blogs)} hint={`${fmt(k.blogViews)} views`} icon={BookOpen} tone="bronze" />
        <AdminKpiCard label="Question sets" value={fmt(k.questionSets)} icon={HelpCircle} />
        <AdminKpiCard label="Roadmaps" value={fmt(k.roadmaps)} icon={Map} />
        <AdminKpiCard label="Bugs pending" value={fmt(k.bugsPending)} icon={Bug} tone="alert" />
        <AdminKpiCard label="Features pending" value={fmt(k.featuresPending)} icon={Sparkles} tone="alert" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="User growth"
          description="New registrations over the last 6 months"
          icon={TrendingUp}
          stat={fmt(totalRegistered)}
          hint="total in period"
          fullWidth
        >
          <AdminLineChart data={charts.userGrowth || []} height={300} />
        </ChartCard>

        <ChartCard
          title="Content mix"
          description="Published corpus, broken down by type"
          icon={PieChart}
          stat={fmt(totalContent)}
          hint="total content pieces"
        >
          <AdminDonutChart data={charts.contentMix || []} />
        </ChartCard>

        <ChartCard
          title="Feedback status"
          description="Bugs and feature requests, current state"
          icon={BarChart3}
          stat={fmt(totalFeedback)}
          hint="total submissions"
        >
          <AdminBarChart data={charts.feedbackStatus || []} />
        </ChartCard>

        <ChartCard
          title="Platform footprint"
          description="Total volume across every content type"
          icon={LayoutGrid}
          stat={fmt(k.users + k.interviews + k.salaries + k.comments)}
          hint="users, interviews, salaries & comments"
        >
          <AdminBarChart data={footprintData} />
        </ChartCard>

        <ChartCard
          title="Feedback resolution rate"
          description="Share of bugs and features resolved vs. still open"
          icon={Gauge}
          stat={`${resolutionRate}%`}
          hint="resolved"
        >
          <AdminDonutChart data={resolutionData} />
        </ChartCard>
      </div>
    </div>
  );
}
