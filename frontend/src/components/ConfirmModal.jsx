import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { focusRing } from '../theme/tokens';

/**
 * Themed replacement for window.confirm(). Controlled — render it once,
 * toggle `open`, and handle the outcome in onConfirm/onCancel.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2147483646] bg-[#2C241B]/45 backdrop-blur-[2px]"
            onClick={loading ? undefined : onCancel}
            aria-hidden
          />
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_28px_60px_-20px_rgba(44,36,27,0.35)]"
              role="alertdialog"
              aria-modal="true"
              aria-label={title}
            >
              <div className="p-6">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                    danger
                      ? 'border-rose-100 bg-rose-50 text-rose-600'
                      : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]'
                  }`}
                >
                  {danger ? <AlertTriangle size={20} aria-hidden /> : <HelpCircle size={20} aria-hidden />}
                </div>
                <h2 className="font-display mt-4 text-lg font-semibold text-[#1C1917]">{title}</h2>
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-[#57534E]">{description}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-[#E5DCCE] bg-[#F7F3EC]/60 px-6 py-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] disabled:opacity-60 ${focusRing}`}
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                    danger
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-[#2C241B] text-[#FFFDF8] hover:bg-[#1C1711]'
                  } ${focusRing}`}
                >
                  {loading ? 'Please wait…' : confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
