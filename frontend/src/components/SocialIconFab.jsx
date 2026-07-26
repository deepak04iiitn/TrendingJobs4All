import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Instagram, MessageCircle, Send, Users } from 'lucide-react';

const easeOut = [0.22, 1, 0.36, 1];

const LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/route2hire?igsh=ZGk5NTQyY2RiOGF1',
    icon: Instagram,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/trendingjobs4all_QA',
    icon: Send,
  },
  {
    name: 'WhatsApp',
    href: 'https://chat.whatsapp.com/DXvc1ncAenX1HZ7OKr8L4Y?mode=wwt',
    icon: MessageCircle,
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A574] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]';

export default function SocialIconFab() {
  const reduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);
  const componentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKey);
      };
    }
    return undefined;
  }, [isExpanded]);

  return createPortal(
    <div
      ref={componentRef}
      className="pointer-events-none fixed right-0 top-1/2 z-[2147483646] -translate-y-1/2"
    >
      <div className="pointer-events-auto flex flex-col items-stretch overflow-hidden rounded-l-2xl border border-r-0 border-[#E5DCCE] bg-[#FFFDF8]/95 shadow-[-12px_0_36px_-18px_rgba(44,36,27,0.3)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-label={isExpanded ? 'Close community menu' : 'Join our community'}
          aria-expanded={isExpanded}
          className={`flex h-12 w-12 items-center justify-center bg-[#2C241B] text-[#FFFDF8] transition hover:bg-[#1A1510] sm:h-14 sm:w-14 ${focusRing}`}
        >
          <Users size={20} aria-hidden />
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="panel"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="flex flex-col border-t border-[#E5DCCE] bg-[#F7F3EC]">
                {LINKS.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.name}
                      title={link.name}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.25, ease: easeOut }}
                      className={`flex h-12 w-12 items-center justify-center text-[#2C241B] transition hover:bg-[#EFE8DC] hover:text-[#1A1510] sm:h-14 sm:w-14 ${focusRing}`}
                    >
                      <Icon size={18} aria-hidden />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
