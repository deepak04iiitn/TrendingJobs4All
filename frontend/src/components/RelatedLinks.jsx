import { Link } from 'react-router-dom';
import { focusRing } from '../theme/tokens';

/**
 * Internal linking hub for crawlability + discovery.
 * Always use canonical kebab-case public URLs (never blocked/removed paths).
 */
const HUB = {
  jobs: { path: '/jobs', label: 'QA & SDET Jobs' },
  interviews: { path: '/interview-experiences', label: 'Interview Experiences' },
  questions: { path: '/interview-questions', label: 'Interview Questions' },
  salary: { path: '/salary-structures', label: 'Salary Insights' },
  resume: { path: '/resume-builder', label: 'Resume Builder' },
  dsa: { path: '/qa-sdet-dsa-sheet', label: 'QA/SDET DSA Sheet' },
  blogs: { path: '/blogs', label: 'Career Blogs' },
  about: { path: '/about', label: 'About Route2Hire' },
  contact: { path: '/contact-us', label: 'Contact Us' },
  privacy: { path: '/privacy-policy', label: 'Privacy Policy' },
  terms: { path: '/terms-of-service', label: 'Terms of Service' },
  cookies: { path: '/cookie-policy', label: 'Cookie Policy' },
  signIn: { path: '/sign-in', label: 'Sign In' },
  signUp: { path: '/sign-up', label: 'Sign Up' },
  home: { path: '/', label: 'Home' },
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
    links: withEscape([HUB.interviews, HUB.questions, HUB.salary, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  interview: {
    title: 'More career resources',
    links: withEscape([HUB.questions, HUB.salary, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  salary: {
    title: 'More career resources',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.blogs, HUB.dsa]),
  },
  resume: {
    title: 'Continue preparing',
    links: withEscape([HUB.interviews, HUB.questions, HUB.salary, HUB.dsa, HUB.blogs]),
  },
  dsa: {
    title: 'More career resources',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.blogs, HUB.salary]),
  },
  blog: {
    title: 'Explore Route2Hire',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.dsa, HUB.salary]),
  },
  about: {
    title: 'Explore the platform',
    links: withEscape([HUB.interviews, HUB.questions, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  contact: {
    title: 'Explore Route2Hire',
    links: withEscape([HUB.blogs, HUB.resume, HUB.interviews, HUB.questions, HUB.privacy]),
  },
  legal: {
    title: 'Site links',
    links: withEscape([HUB.privacy, HUB.terms, HUB.cookies, HUB.blogs, HUB.resume]),
  },
  auth: {
    title: 'Explore while you sign in',
    links: withEscape([HUB.blogs, HUB.interviews, HUB.resume, HUB.questions, HUB.dsa]),
  },
  home: {
    title: 'Start exploring',
    links: withEscape([HUB.interviews, HUB.questions, HUB.dsa, HUB.salary, HUB.resume, HUB.blogs]),
  },
  general: {
    title: 'More resources',
    links: withEscape([HUB.interviews, HUB.salary, HUB.questions, HUB.resume, HUB.dsa, HUB.blogs]),
  },
  notFound: {
    title: 'Popular pages',
    links: withEscape([HUB.interviews, HUB.questions, HUB.blogs, HUB.resume]),
  },
};

export default function RelatedLinks({ type = 'general' }) {
  const section = linkSections[type] || linkSections.general;

  return (
    <nav className="jobs-explore" aria-label={section.title}>
      <p className="jobs-explore__title">{section.title}</p>
      <ul className="jobs-explore__links">
        {section.links.map((link, i) => (
          <li key={link.path + link.label} className="jobs-explore__item">
            {i > 0 && <span className="jobs-explore__sep" aria-hidden />}
            <Link to={link.path} className={`jobs-explore__link ${focusRing}`}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { HUB as PUBLIC_LINKS };
