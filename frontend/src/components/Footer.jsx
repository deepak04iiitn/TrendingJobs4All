import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { focusRing } from '../theme/tokens';

const FOOTER_COLUMNS = [
  {
    title: 'Prepare',
    links: [
      { href: '/jobs', label: 'Job Listings' },
      { href: '/interviewExp', label: 'Interview Experiences' },
      { href: '/interview-questions', label: 'Question Bank' },
      { href: '/referrals', label: 'Referrals' },
      { href: '/salaryStructures', label: 'Salary Insights' },
      { href: '/resumeTemplates', label: 'Resume Templates' },
      { href: '/resume-builder', label: 'Resume Builder' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/newsletter', label: 'Newsletter' },
      { href: '/contactUs', label: 'Contact Us' },
      { href: '/BuyMeACoffee', label: 'Premium Subscription' },
      { href: '/myCorner', label: 'My Corner' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacyPolicy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/sign-up', label: 'Sign Up' },
      { href: '/contactUs', label: 'Help Center' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/my-jobs', label: 'My Jobs' },
      { href: '/profile', label: 'My Profile' },
    ],
  },
];

const FooterLink = ({ href, children }) => (
  <Link
    to={href}
    className={`group relative inline-flex items-center gap-1 rounded-sm text-sm text-[#57534E] transition-colors duration-200 hover:text-[#2C241B] ${focusRing}`}
  >
    <span>{children}</span>
    <ArrowUpRight
      size={12}
      className="translate-x-0 -translate-y-0.5 text-[#C4A574] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-1 group-hover:opacity-100"
      aria-hidden
    />
  </Link>
);

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E5DCCE] bg-[#F7F3EC]">
      <p
        className="pointer-events-none absolute -bottom-8 left-1/2 max-w-none -translate-x-1/2 select-none whitespace-nowrap font-display text-[16vw] font-semibold leading-none tracking-tighter text-[#2C241B]/[0.04]"
        aria-hidden
      >
        Route2Hire
      </p>

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link to="/" className={`inline-flex items-center gap-3 rounded-xl group ${focusRing}`}>
              <img
                src="/assets/Route2Hire-48.png"
                alt="Route2Hire"
                width="48"
                height="48"
                className="h-12 w-12 rounded-xl object-cover shadow-sm transition-transform duration-300 group-hover:rotate-3"
                loading="lazy"
              />
              <span className="font-display text-2xl font-semibold tracking-tight text-[#1C1917]">
                Route<span className="text-[#C4A574]">2</span>Hire
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[1.05rem] leading-relaxed text-[#57534E]">
              The one-stop platform for QA & SDET careers — jobs, interview prep, DSA practice,
              salary intel, and referrals.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#78716C]">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C4A574]" aria-hidden />
                Trusted by 1000+ professionals
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6B5A48]" aria-hidden />
                3000+ companies hiring
              </span>
            </div>
            <Link to="/sign-up" className="mt-8 inline-block">
              <motion.span
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] shadow-[0_12px_28px_-12px_rgba(44,36,27,0.45)] transition hover:bg-[#1A1510] ${focusRing}`}
              >
                Join Route2Hire
                <ArrowUpRight size={16} aria-hidden />
              </motion.span>
            </Link>
          </div>

          <div className="rounded-3xl border border-[#E5DCCE] bg-[#EFE8DC] p-6 sm:p-8 lg:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="mb-4 font-display text-sm font-semibold text-[#1C1917]">
                    {column.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {column.links.map(({ href, label }) => (
                      <li key={`${column.title}-${label}`}>
                        <FooterLink href={href}>{label}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#E5DCCE] pt-6 sm:flex-row">
          <p className="text-sm text-[#78716C]">
            © {new Date().getFullYear()} Route2Hire. All rights reserved.
          </p>
          <p className="text-xs font-medium tracking-wide text-[#78716C]">
            Built for QA · SDET · Test Automation
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C4A574]/70 to-transparent" aria-hidden />
    </footer>
  );
}
