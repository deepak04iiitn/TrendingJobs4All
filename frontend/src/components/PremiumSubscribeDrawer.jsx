import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, BellRing, CheckCircle2 } from 'lucide-react';
import { focusRing } from '../theme/tokens';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PremiumSubscribeDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState(undefined); // undefined = loading, null = none
  const [yoeInput, setYoeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const { data } = await axios.get('/backend/premium-jobs/me');
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchSubscription();
      setPaymentCompleted(false);
    }
  }, [open, fetchSubscription]);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleSubscribe = async () => {
    const yoeNum = Number(yoeInput);
    if (yoeInput === '' || Number.isNaN(yoeNum) || yoeNum < 0) {
      toast.error('Please enter a valid Years of Experience');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post('/backend/premium-jobs/subscribe', { yoe: yoeNum });
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Could not load payment gateway. Please try again.');
        return;
      }

      const razorpayCheckout = new window.Razorpay({
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: 'Route2Hire Premium Jobs',
        description: '₹149/month — daily QA/SDET job matches',
        theme: { color: '#C4A574' },
        handler: () => {
          toast.success('Payment successful!');
          setPaymentCompleted(true);
          fetchSubscription();
        },
        modal: {
          ondismiss: () => fetchSubscription(),
        },
      });
      razorpayCheckout.open();
    } catch (error) {
      console.error('Error subscribing:', error);
      if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
        onClose();
        const current = location.pathname + location.search;
        navigate(`/sign-in?redirect=${encodeURIComponent(current)}`);
        return;
      }
      toast.error(error?.response?.data?.message || 'Failed to start subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const isActive = subscription?.status === 'active' || subscription?.status === 'authenticated';
  const needsAction = subscription && !isActive; // created / halted / cancelled / pending / etc.

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[2147483647] flex w-full max-w-md flex-col border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-[-24px_0_60px_-28px_rgba(44,36,27,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-label="Subscribe to Premium Jobs"
          >
            <div className="flex items-center justify-between border-b border-[#E5DCCE] px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                  <BellRing size={16} aria-hidden />
                </span>
                <p className="font-display text-lg font-semibold text-[#1C1917]">Premium Jobs</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-full border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {paymentCompleted ? (
                <div className="rounded-2xl border border-[#E5DCCE] bg-[#F7F3EC] p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#3E7A4A]" aria-hidden />
                  <p className="font-display mt-3 text-lg font-semibold text-[#1C1917]">
                    Payment successful
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                    We're confirming your subscription now — this can take a few minutes. Your
                    first batch of QA/SDET job matches will land in your inbox at the next daily
                    run. You can check your subscription status anytime from My Corner.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Link
                      to="/myCorner?panel=premium"
                      onClick={onClose}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] ${focusRing}`}
                    >
                      Go to My Corner
                    </Link>
                    <button
                      type="button"
                      onClick={onClose}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] ${focusRing}`}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : subscription === undefined ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
                </div>
              ) : isActive ? (
                <div className="rounded-2xl border border-[#E5DCCE] bg-[#F7F3EC] p-6 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-[#3E7A4A]" aria-hidden />
                  <p className="font-display mt-3 text-base font-semibold text-[#1C1917]">
                    You're already subscribed
                  </p>
                  <p className="mt-1.5 text-sm text-[#57534E]">
                    Manage your plan, billing date and cancellation from My Corner.
                  </p>
                  <Link
                    to="/myCorner?panel=premium"
                    onClick={onClose}
                    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] ${focusRing}`}
                  >
                    Go to My Corner
                  </Link>
                </div>
              ) : (
                <>
                  {needsAction && (
                    <div className="mb-5 rounded-xl border border-[#E8C9A0] bg-[#FBF1E0] p-4 text-sm text-[#7A5A28]">
                      {subscription.status === 'created'
                        ? 'Your last checkout was not completed. Enter your details again to retry.'
                        : 'Your previous subscription is no longer active. Subscribe again to resume daily emails.'}
                    </div>
                  )}

                  <p className="text-sm leading-relaxed text-[#57534E]">
                    Get the top 10 QA/SDET job openings matched to your experience, delivered to
                    your inbox every day, for <strong className="text-[#1C1917]">₹149/month</strong>.
                  </p>

                  <label className="mt-6 block text-sm font-medium text-[#1C1917]" htmlFor="drawer-yoe-input">
                    Years of Experience
                  </label>
                  <input
                    id="drawer-yoe-input"
                    type="number"
                    min="0"
                    value={yoeInput}
                    onChange={(e) => setYoeInput(e.target.value)}
                    placeholder="e.g. 3"
                    className={`mt-2 w-full rounded-xl border border-[#E5DCCE] bg-white px-4 py-2.5 text-sm text-[#1C1917] outline-none ${focusRing}`}
                  />

                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={submitting}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2C241B] px-4 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1C1711] disabled:opacity-60 ${focusRing}`}
                  >
                    {submitting ? 'Starting checkout...' : 'Subscribe ₹149/month'}
                  </button>
                  <p className="mt-3 text-center text-xs text-[#78716C]">
                    Secure payment via Razorpay. Cancel anytime from My Corner.
                  </p>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
