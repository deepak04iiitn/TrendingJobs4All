import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bug, Lightbulb, Send, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { focusRing } from '../theme/tokens';

const easeOut = [0.22, 1, 0.36, 1];

export default function FeedbackPanel({ open, onClose, initialType = 'bug' }) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState(initialType === 'feature' ? 'feature' : 'bug');

  const isBug = feedbackType === 'bug';
  const pageUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), []);
  const userAgent = useMemo(() => (typeof navigator !== 'undefined' ? navigator.userAgent : ''), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setDescription('');
      setFeedbackType(initialType === 'feature' ? 'feature' : 'bug');
      setIsSubmitting(false);
    }
  }, [open, initialType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setIsSubmitting(true);
      const endpoint = isBug ? '/backend/bugs' : '/backend/feature-requests';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, description, pageUrl, userAgent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Submission failed');
      toast.success('Thanks for your feedback!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="feedback-backdrop"
            className="fixed inset-0 z-[2147483646] bg-[#2C241B]/35 backdrop-blur-[2px]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.aside
            key="feedback-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-panel-title"
            initial={reduceMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="fixed inset-y-0 right-0 z-[2147483647] flex w-full max-w-md flex-col border-l border-[#E5DCCE] bg-[#F7F3EC] shadow-[-24px_0_60px_-28px_rgba(44,36,27,0.35)] sm:max-w-[26rem]"
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#C4A574]/20 via-[#C4A574] to-[#C4A574]/20"
              aria-hidden
            />

            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.2)_0%,transparent_70%)]" />
              <p className="font-display absolute -bottom-4 right-4 select-none text-[5.5rem] font-semibold leading-none tracking-tight text-[#2C241B]/[0.04]">
                Note
              </p>
            </div>

            <header className="relative flex items-start justify-between gap-4 border-b border-[#E5DCCE] px-6 pb-5 pt-6 sm:px-7 sm:pt-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                  Feedback
                </p>
                <h2
                  id="feedback-panel-title"
                  className="font-display mt-1.5 text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-[1.75rem]"
                >
                  Tell us what you think
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#57534E]">
                  Bugs, ideas, or anything that would make Route2Hire better for QA and SDET engineers.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close feedback panel"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#FFFDF8] text-[#2C241B] transition hover:border-[#C4A574]/50 hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <X size={18} aria-hidden />
              </button>
            </header>

            <div className="relative flex-1 overflow-y-auto px-6 py-6 sm:px-7">
              <div
                className="mb-7 flex gap-1 border-b border-[#E5DCCE]"
                role="tablist"
                aria-label="Feedback type"
              >
                {[
                  { id: 'bug', label: 'Bug', Icon: Bug },
                  { id: 'feature', label: 'Feature', Icon: Lightbulb },
                ].map(({ id, label, Icon }) => {
                  const selected = feedbackType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setFeedbackType(id)}
                      className={`relative flex flex-1 items-center justify-center gap-2 px-3 py-3 text-sm transition ${focusRing} ${
                        selected
                          ? 'font-semibold text-[#1C1917]'
                          : 'font-medium text-[#78716C] hover:text-[#2C241B]'
                      }`}
                    >
                      <Icon
                        size={15}
                        className={selected ? 'text-[#C4A574]' : 'text-[#A8A29E]'}
                        aria-hidden
                      />
                      {label}
                      {selected ? (
                        <motion.span
                          layoutId="feedback-type-underline"
                          className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#C4A574]"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="feedback-email"
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]"
                  >
                    Your email
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25 ${focusRing}`}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-description"
                    className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]"
                  >
                    {isBug ? 'What went wrong?' : 'What would you like to see?'}
                  </label>
                  <textarea
                    id="feedback-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={7}
                    className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3 text-sm leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25 ${focusRing}`}
                    placeholder={
                      isBug
                        ? 'Describe the issue you encountered...'
                        : 'Share your idea with us...'
                    }
                    required
                  />
                </div>
              </form>
            </div>

            <footer className="relative border-t border-[#E5DCCE] bg-[#EFE8DC]/70 px-6 py-4 sm:px-7">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`flex-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3 text-sm font-semibold text-[#2C241B] transition hover:bg-[#F7F3EC] disabled:opacity-50 ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="feedback-form"
                  disabled={isSubmitting}
                  className={`inline-flex flex-[1.35] items-center justify-center gap-2 rounded-full bg-[#2C241B] px-4 py-3 text-sm font-semibold text-[#FFFDF8] shadow-[0_14px_28px_-12px_rgba(44,36,27,0.4)] transition hover:bg-[#1A1510] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFFDF8]/30 border-t-[#FFFDF8]"
                        aria-hidden
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} aria-hidden />
                      {isBug ? 'Send report' : 'Send idea'}
                    </>
                  )}
                </button>
              </div>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
