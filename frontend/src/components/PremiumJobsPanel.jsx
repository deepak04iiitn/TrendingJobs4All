import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BellRing, CalendarClock, Mail, AlertTriangle, CheckCircle2, Pencil, Check, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { focusRing } from '../theme/tokens';

const STATUS_LABELS = {
  created: 'Awaiting payment',
  authenticated: 'Authenticated',
  active: 'Active',
  pending: 'Payment pending',
  halted: 'Payment failed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  expired: 'Expired',
};

export default function PremiumJobsPanel() {
  const [subscription, setSubscription] = useState(undefined); // undefined = loading, null = none
  const [emailHistory, setEmailHistory] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [editingYoe, setEditingYoe] = useState(false);
  const [yoeInput, setYoeInput] = useState('');
  const [savingYoe, setSavingYoe] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const { data } = await axios.get('/backend/premium-jobs/me');
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    }
  }, []);

  const fetchEmailHistory = useCallback(async () => {
    try {
      const { data } = await axios.get('/backend/premium-jobs/me/emails');
      setEmailHistory(data.items || []);
    } catch (error) {
      console.error('Error fetching email history:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (subscription && subscription.status === 'active') fetchEmailHistory();
  }, [subscription, fetchEmailHistory]);

  // While a subscription is still waiting on the webhook to confirm payment,
  // poll for the real status instead of making the user manually refresh —
  // stops as soon as it reaches 'active' or any terminal state, capped at
  // ~2 minutes so it doesn't poll forever if something never resolves.
  useEffect(() => {
    if (!subscription || !['created', 'authenticated', 'pending'].includes(subscription.status)) {
      return undefined;
    }

    let attempts = 0;
    const maxAttempts = 40;
    const interval = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      fetchSubscription();
    }, 3000);

    return () => clearInterval(interval);
    // Depend on the status string, not the whole subscription object — that
    // object gets a new reference on every poll, which would otherwise
    // restart this effect (and reset the attempts counter) on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription?.status, fetchSubscription]);

  const startEditingYoe = () => {
    setYoeInput(String(subscription.yoe));
    setEditingYoe(true);
  };

  const handleSaveYoe = async () => {
    const yoeNum = Number(yoeInput);
    if (yoeInput === '' || Number.isNaN(yoeNum) || yoeNum < 0) {
      toast.error('Please enter a valid Years of Experience');
      return;
    }
    setSavingYoe(true);
    try {
      const { data } = await axios.patch('/backend/premium-jobs/me/yoe', { yoe: yoeNum });
      setSubscription(data);
      toast.success('Years of Experience updated');
      setEditingYoe(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update Years of Experience');
    } finally {
      setSavingYoe(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await axios.post('/backend/premium-jobs/me/cancel');
      setSubscription(data);
      toast.success(
        data.currentPeriodEnd
          ? `Cancellation scheduled. You'll keep getting daily emails until ${new Date(data.currentPeriodEnd).toLocaleDateString()}.`
          : 'Subscription cancelled',
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
      setCancelModalOpen(false);
    }
  };

  if (subscription === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'authenticated';
  const needsResubscribe = subscription && ['halted', 'cancelled', 'expired', 'completed', 'created', 'pending'].includes(subscription.status);

  return (
    <div className="max-w-2xl">
      {!subscription && (
        <div className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 sm:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
            <BellRing size={20} aria-hidden />
          </div>
          <h2 className="font-display text-xl font-semibold text-[#1C1917]">
            No active subscription
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
            Subscribe on the Premium Jobs page to start getting the top 10 QA/SDET job openings
            matched to your experience, delivered to your inbox every day, for ₹149/month.
          </p>
          <Link
            to="/premium-jobs?subscribe=1"
            className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2C241B] px-4 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1C1711] ${focusRing}`}
          >
            Subscribe ₹149/month
          </Link>
        </div>
      )}

      {subscription && needsResubscribe && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E8C9A0] bg-[#FBF1E0] p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B4762A]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[#1C1917]">
              {subscription.status === 'halted'
                ? 'Your last payment failed and your subscription has been paused.'
                : subscription.status === 'created' || subscription.status === 'pending'
                  ? 'Your subscription is awaiting payment confirmation.'
                  : 'Your subscription is no longer active.'}
            </p>
            <p className="mt-1 text-sm text-[#57534E]">
              Subscribe again from the Premium Jobs page to keep receiving your daily job matches.
            </p>
            <Link
              to="/premium-jobs?subscribe=1"
              className={`mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] ${focusRing}`}
            >
              Re-subscribe ₹149/month
            </Link>
          </div>
        </div>
      )}

      {isActive && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#3E7A4A]" aria-hidden />
              <span className="text-sm font-medium text-[#1C1917]">
                {STATUS_LABELS[subscription.status] || subscription.status}
              </span>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#E8C9A0] bg-[#FBF1E0] p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B4762A]" aria-hidden />
                <p className="text-xs leading-relaxed text-[#7A5A28]">
                  Cancellation scheduled — you'll keep receiving daily emails until{' '}
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : 'the end of your current billing period'}
                  , then it will end automatically. No further charges.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B5A48]">
                  Years of Experience
                </p>
                {editingYoe ? (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      autoFocus
                      value={yoeInput}
                      onChange={(e) => setYoeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveYoe();
                        if (e.key === 'Escape') setEditingYoe(false);
                      }}
                      disabled={savingYoe}
                      className={`w-20 rounded-lg border border-[#E5DCCE] bg-white px-2.5 py-1.5 text-sm text-[#1C1917] outline-none focus:border-[#C4A574] ${focusRing}`}
                    />
                    <button
                      type="button"
                      onClick={handleSaveYoe}
                      disabled={savingYoe}
                      aria-label="Save"
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C241B] text-[#FFFDF8] transition hover:bg-[#1C1711] disabled:opacity-60 ${focusRing}`}
                    >
                      <Check size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingYoe(false)}
                      disabled={savingYoe}
                      aria-label="Cancel"
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5DCCE] text-[#6B5A48] transition hover:bg-[#F7F3EC] disabled:opacity-60 ${focusRing}`}
                    >
                      <X size={15} aria-hidden />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEditingYoe}
                    className={`mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#1C1917] underline decoration-dotted decoration-[#C4A574] underline-offset-2 hover:text-[#6B5A48] ${focusRing}`}
                  >
                    {subscription.yoe} years
                    <Pencil size={12} className="text-[#C4A574]" aria-hidden />
                  </button>
                )}
              </div>

              {subscription.currentPeriodEnd && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B5A48]">
                    Next billing date
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#1C1917]">
                    <CalendarClock size={14} aria-hidden />
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {!subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className={`mt-6 text-sm font-medium text-[#B4762A] underline decoration-dotted ${focusRing}`}
              >
                Cancel subscription
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-[#1C1917]">
              <Mail size={16} aria-hidden />
              Recent email deliveries
            </h3>
            {emailHistory.length === 0 ? (
              <p className="mt-3 text-sm text-[#78716C]">
                No emails sent yet — your first batch will arrive at the next daily run.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#E5DCCE]">
                {emailHistory.map((log) => (
                  <li key={log._id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-[#57534E]">{log.runDate}</span>
                    <span className="text-[#1C1917]">
                      {log.status === 'sent'
                        ? `${log.jobIds?.length || 0} jobs sent`
                        : log.status.replace(/_/g, ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-[#78716C]">
        Have questions? Read more on the{' '}
        <Link to="/premium-jobs" className="underline decoration-dotted">
          Premium Jobs
        </Link>{' '}
        page.
      </p>

      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel your Premium Jobs subscription?"
        description={
          subscription?.currentPeriodEnd
            ? `You'll keep receiving daily job emails until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}, then it will end automatically. No further charges.`
            : 'This stops your subscription and daily job emails.'
        }
        confirmLabel="Cancel subscription"
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
