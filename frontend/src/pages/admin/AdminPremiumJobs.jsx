import { useCallback, useEffect, useState } from 'react';
import { Send, Ban, Loader2, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import ConfirmModal from '../../components/ConfirmModal';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import {
  fetchPremiumOverview,
  fetchPremiumSubscribers,
  cancelPremiumSubscriber,
  syncPremiumSubscriber,
  sendPremiumEmailNow,
  triggerPremiumBatch,
} from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 15;
const STATUS_OPTIONS = ['', 'active', 'created', 'authenticated', 'pending', 'halted', 'cancelled', 'completed', 'expired'];

export default function AdminPremiumJobs() {
  const [status, setStatus] = useState('');
  const [overview, setOverview] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [rowActionId, setRowActionId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'batch' } | { type: 'cancel', id }

  const fetcher = useCallback(async ({ page, limit, status: s }) => {
    const data = await fetchPremiumSubscribers({ page, limit, status: s });
    return { items: data.items, total: data.total };
  }, []);

  const { page, goToPage, rows, total, totalPages, limit, loading, error, reload } = useAdminPaginatedList(
    fetcher,
    { status },
    PAGE_SIZE,
  );

  useEffect(() => {
    if (error) toast.error('Failed to load subscribers');
  }, [error]);

  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchPremiumOverview();
      setOverview(data);
    } catch {
      // non-blocking
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleCancel = async (id) => {
    setRowActionId(id);
    try {
      await cancelPremiumSubscriber(id);
      toast.success('Subscription cancelled');
      goToPage(page);
      loadOverview();
    } catch {
      toast.error('Failed to cancel subscription');
    } finally {
      setRowActionId(null);
      setConfirmAction(null);
    }
  };

  const handleSync = async (id) => {
    setRowActionId(id);
    try {
      const { razorpayStatus } = await syncPremiumSubscriber(id);
      toast.success(`Synced — Razorpay status: ${razorpayStatus}`);
      goToPage(page);
      loadOverview();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to sync from Razorpay');
    } finally {
      setRowActionId(null);
    }
  };

  const handleSendNow = async (id) => {
    setRowActionId(id);
    try {
      const { results } = await sendPremiumEmailNow(id);
      const result = results?.[0];
      if (result?.status === 'sent') toast.success(`Sent ${result.jobCount} jobs`);
      else toast.info(`No email sent: ${result?.status || 'unknown'}`);
      goToPage(page);
    } catch {
      toast.error('Failed to send email');
    } finally {
      setRowActionId(null);
    }
  };

  const handleTriggerBatch = async () => {
    setTriggering(true);
    try {
      const { count } = await triggerPremiumBatch();
      toast.success(`Batch triggered for ${count} subscribers`);
      goToPage(page);
    } catch {
      toast.error('Failed to trigger batch');
    } finally {
      setTriggering(false);
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="Premium Jobs subscribers"
        description="Manage Premium Jobs subscriptions, YOE, and daily email delivery."
        actions={
          <button
            type="button"
            onClick={() => setConfirmAction({ type: 'batch' })}
            disabled={triggering}
            className={`inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] disabled:opacity-60 ${focusRing}`}
          >
            {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Trigger daily batch now
          </button>
        }
      />

      {overview && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Active', value: overview.active },
            { label: 'Payment failed', value: overview.halted },
            { label: 'Cancelled', value: overview.cancelled },
            { label: 'Est. MRR (₹)', value: overview.mrr },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">{kpi.label}</p>
              <p className="font-display mt-1 text-2xl font-semibold text-[#1C1917]">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#2C241B] outline-none focus:border-[#C4A574] ${focusRing}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || 'all'} value={s}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto pb-2 text-xs text-[#78716C]">
          Matching: <strong className="text-[#2C241B]">{total}</strong>
        </div>
      </div>

      <AdminDataTable
        rows={rows}
        loading={loading}
        empty="No subscribers found."
        columns={[
          {
            key: 'user',
            label: 'Subscriber',
            render: (s) => (
              <div className="min-w-0">
                <p className="truncate font-medium text-[#1C1917]">{s.userId?.username || 'Unknown'}</p>
                <p className="truncate text-[11px] text-[#78716C]">{s.userId?.email}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (s) => (
              <div className="flex flex-col gap-1">
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    s.status === 'active'
                      ? 'bg-[#2C241B] text-[#FFFDF8]'
                      : ['halted', 'cancelled', 'expired'].includes(s.status)
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-[#EFE8DC] text-[#6B5A48]'
                  }`}
                >
                  {s.status}
                </span>
                {s.cancelAtPeriodEnd && (
                  <span className="text-[10px] font-medium text-[#B4762A]">Cancels at period end</span>
                )}
              </div>
            ),
          },
          { key: 'yoe', label: 'YOE', render: (s) => `${s.yoe} yrs` },
          {
            key: 'currentPeriodEnd',
            label: 'Next billing',
            render: (s) => (s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'),
          },
          {
            key: 'lastEmailSentAt',
            label: 'Last email',
            render: (s) =>
              s.lastEmailSentAt
                ? `${new Date(s.lastEmailSentAt).toLocaleDateString()} (${s.lastEmailJobCount || 0} jobs)`
                : '—',
          },
          {
            key: 'createdAt',
            label: 'Subscribed',
            render: (s) => (s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'),
          },
          {
            key: 'actions',
            label: '',
            render: (s) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={rowActionId === s._id}
                  onClick={() => handleSync(s._id)}
                  className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#F7F3EC] disabled:opacity-30 ${focusRing}`}
                  aria-label="Sync status from Razorpay"
                  title="Sync status from Razorpay"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={rowActionId === s._id || s.status !== 'active'}
                  onClick={() => handleSendNow(s._id)}
                  className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#F7F3EC] disabled:opacity-30 ${focusRing}`}
                  aria-label="Send email now"
                  title="Send email now"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={rowActionId === s._id || s.status === 'cancelled'}
                  onClick={() => setConfirmAction({ type: 'cancel', id: s._id })}
                  className={`rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30 ${focusRing}`}
                  aria-label="Cancel subscription"
                  title="Cancel subscription"
                >
                  <Ban className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} loading={loading} onPageChange={goToPage} />

      <ConfirmModal
        open={confirmAction?.type === 'batch'}
        title="Trigger daily batch now?"
        description="This immediately sends the daily job-match email to every active subscriber, outside the regular schedule."
        confirmLabel="Trigger batch"
        loading={triggering}
        onConfirm={handleTriggerBatch}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        open={confirmAction?.type === 'cancel'}
        title="Cancel this subscriber's subscription?"
        description="This cancels their Razorpay subscription immediately and stops future daily emails."
        confirmLabel="Cancel subscription"
        danger
        loading={rowActionId === confirmAction?.id}
        onConfirm={() => handleCancel(confirmAction.id)}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
