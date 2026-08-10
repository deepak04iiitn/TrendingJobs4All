import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Code2,
  Cookie,
  FileText,
  Home,
  Info,
  LogIn,
  Mail,
  MessageCircle,
  Puzzle,
  Scale,
  Shield,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { focusRing } from '../theme/tokens';

/**
 * Internal linking hub for crawlability + discovery.
 * Always use canonical kebab-case public URLs (never blocked/removed paths).
 */
const HUB = {
  jobs: {
    path: '/jobs',
    label: 'QA & SDET Jobs',
    desc: 'Curated openings worth applying to',
    icon: Briefcase,
  },
  interviews: {
    path: '/interview-experiences',
    label: 'Interview Experiences',
    desc: 'Company-wise rounds and tips',
    icon: MessageCircle,
  },
  questions: {
    path: '/interview-questions',
    label: 'Interview Questions',
    desc: 'Topic-wise practice bank',
    icon: Puzzle,
  },
  salary: {
    path: '/salary-structures',
    label: 'Salary Insights',
    desc: 'Real compensation ranges',
    icon: TrendingUp,
  },
  resume: {
    path: '/resume-builder',
    label: 'Resume Builder',
    desc: 'ATS-friendly templates',
    icon: FileText,
  },
  dsa: {
    path: '/qa-sdet-dsa-sheet',
    label: 'QA/SDET DSA Sheet',
    desc: 'Track problems and progress',
    icon: Code2,
  },
  blogs: {
    path: '/blogs',
    label: 'Career Blogs',
    desc: 'Guides and hiring insights',
    icon: BookOpen,
  },
  about: {
    path: '/about',
    label: 'About Route2Hire',
    desc: 'Why we built this',
    icon: Info,
  },
  contact: {
    path: '/contact-us',
    label: 'Contact Us',
    desc: 'Questions or feedback',
    icon: Mail,
  },
  privacy: {
    path: '/privacy-policy',
    label: 'Privacy Policy',
    desc: 'How we handle data',
    icon: Shield,
  },
  terms: {
    path: '/terms-of-service',
    label: 'Terms of Service',
    desc: 'Using the platform',
    icon: Scale,
  },
  cookies: {
    path: '/cookie-policy',
    label: 'Cookie Policy',
    desc: 'Cookies and preferences',
    icon: Cookie,
  },
  signIn: {
    path: '/sign-in',
    label: 'Sign In',
    desc: 'Continue where you left off',
    icon: LogIn,
  },
  signUp: {
    path: '/sign-up',
    label: 'Sign Up',
    desc: 'Create your free account',
    icon: UserPlus,
  },
  home: {
    path: '/',
    label: 'Home',
    desc: 'Back to the start',
    icon: Home,
  },
};

const CORE_ESCAPE = [HUB.home, HUB.jobs, HUB.about, HUB.contact];

/** Ensure every nav block includes a home escape hatch so crawlers never hit a dead end. */
function withEscape(links) {
  const seen = new Set();
  return [...CORE_ESCAPE, ...links].filter((link) => {
    if (seen.has(link.path)) return false;
    seen.add(link.path);
    return true;
  });
}

const linkSections = {
  job: {
    title: 'More career resources',
    support: 'Keep preparing with interviews, questions, salary data, and tools built for QA & SDET paths.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.salary, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  interview: {
    title: 'More career resources',
    support: 'Pair real experiences with practice questions, compensation data, and a sharper resume.',
    links: withEscape([HUB.questions, HUB.salary, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  salary: {
    title: 'More career resources',
    support: 'Use salary context alongside interview prep, DSA practice, and resume polish.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.blogs, HUB.dsa]),
  },
  resume: {
    title: 'Continue preparing',
    support: 'A strong resume pairs best with interview practice, DSA reps, and real company stories.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.salary, HUB.dsa, HUB.blogs]),
  },
  dsa: {
    title: 'More career resources',
    support: 'Balance coding practice with interviews, questions, resume work, and career reading.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.blogs, HUB.salary]),
  },
  blog: {
    title: 'Explore Route2Hire',
    support: 'Turn what you read into action — practice, apply, and track your prep.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.dsa, HUB.salary]),
  },
  about: {
    title: 'Explore the platform',
    support: 'See the tools that help QA and SDET candidates prepare with real market context.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  contact: {
    title: 'Explore Route2Hire',
    support: 'While you wait on a reply, keep exploring blogs, prep tools, and community stories.',
    links: withEscape([HUB.blogs, HUB.resume, HUB.interviews, HUB.questions, HUB.privacy]),
  },
  legal: {
    title: 'Site links',
    support: 'Policies and a few popular places to continue on Route2Hire.',
    links: withEscape([HUB.privacy, HUB.terms, HUB.cookies, HUB.blogs, HUB.resume]),
  },
  auth: {
    title: 'Explore while you sign in',
    support: 'Browse prep resources — your progress saves once you are in.',
    links: withEscape([HUB.blogs, HUB.interviews, HUB.resume, HUB.questions, HUB.dsa]),
  },
  home: {
    title: 'Start exploring',
    support: 'Pick a lane — interviews, questions, DSA, salary, resume, or blogs.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.dsa, HUB.salary, HUB.resume, HUB.blogs]),
  },
  general: {
    title: 'More resources',
    support: 'Everything else you might need for the next step in your QA or SDET career.',
    links: withEscape([HUB.interviews, HUB.salary, HUB.questions, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  premium: {
    title: 'Explore more resources',
    support: 'Pair premium listings with prep tools so you show up ready.',
    links: withEscape([HUB.jobs, HUB.interviews, HUB.salary, HUB.questions, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  notFound: {
    title: 'Popular pages',
    support: 'These paths usually help people find what they were looking for.',
    links: withEscape([HUB.interviews, HUB.questions, HUB.blogs, HUB.resume]),
  },
};

const easeOut = [0.22, 1, 0.36, 1];

export default function RelatedLinks({ type = 'general' }) {
  const section = linkSections[type] || linkSections.general;
  const reduceMotion = useReducedMotion();

  return (
    <nav
      className="relative w-full border-t border-[#E5DCCE] pt-10 sm:pt-12"
      aria-label={section.title}
    >
      <div className="w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#C4A574]" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Keep going
            </p>
          </div>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-3xl">
            {section.title}
          </h2>
          {section.support ? (
            <p className="mt-2 text-sm leading-relaxed text-[#57534E] sm:text-[15px]">
              {section.support}
            </p>
          ) : null}
        </motion.div>

        <ul className="mt-7 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.links.map((link, i) => {
            const Icon = link.icon || FileText;
            return (
              <motion.li
                key={link.path + link.label}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: reduceMotion ? 0 : 0.04 + i * 0.04, duration: 0.45, ease: easeOut }}
              >
                <Link
                  to={link.path}
                  className={`group flex h-full items-center gap-3 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-[#C4A574]/55 hover:shadow-[0_12px_24px_-20px_rgba(44,36,27,0.35)] ${focusRing}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574] transition duration-200 group-hover:border-[#C4A574]/40 group-hover:bg-[#2C241B] group-hover:text-[#C4A574]">
                    <Icon size={15} strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold leading-tight text-[#1C1917] transition-colors group-hover:text-[#2C241B]">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        size={13}
                        className="shrink-0 text-[#C4A574] opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                        aria-hidden
                      />
                    </span>
                    {link.desc ? (
                      <span className="mt-0.5 block text-[11px] leading-snug text-[#78716C]">
                        {link.desc}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export { HUB as PUBLIC_LINKS };
