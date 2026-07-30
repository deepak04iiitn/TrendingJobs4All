import { motion, useReducedMotion } from 'framer-motion';
import { easeOut } from '../home/motion.jsx';
import AuthAside from './AuthAside';
import RelatedLinks from '../RelatedLinks';

export default function AuthShell({ content, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="auth-page min-h-screen bg-[#F7F3EC] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="auth-card overflow-hidden rounded-[1.75rem] border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_48px_-28px_rgba(44,36,27,0.18)] lg:grid lg:grid-cols-[0.95fr_1.05fr]"
        >
          <AuthAside content={content} />
          <div className="auth-form-panel p-8 sm:p-10 lg:p-12">{children}</div>
        </motion.div>

        <div className="mt-10">
          <RelatedLinks type="auth" />
        </div>
      </div>
    </div>
  );
}
