import { Link } from 'react-router-dom';
import { focusRing } from '../theme/tokens';

/**
 * RelatedLinks - quiet internal linking for SEO and discovery
 */
export default function RelatedLinks({ type = 'general' }) {
  const linkSections = {
    job: {
      title: 'More resources',
      links: [
        { path: '/interviewExp', label: 'Interview Experiences' },
        { path: '/interview-questions', label: 'Interview Questions' },
        { path: '/salaryStructures', label: 'Salary Insights' },
        { path: '/resume-builder', label: 'Resume Builder' },
        { path: '/qa-sdet-dsa-sheet', label: 'DSA Sheet' },
      ],
    },
    interview: {
      title: 'More resources',
      links: [
        { path: '/interview-questions', label: 'Interview Questions' },
        { path: '/jobs', label: 'Jobs' },
        { path: '/salaryStructures', label: 'Salary Insights' },
        { path: '/resume-builder', label: 'Resume Builder' },
      ],
    },
    salary: {
      title: 'More resources',
      links: [
        { path: '/jobs', label: 'Jobs' },
        { path: '/interviewExp', label: 'Interview Experiences' },
        { path: '/interview-questions', label: 'Interview Questions' },
        { path: '/resume-builder', label: 'Resume Builder' },
      ],
    },
    general: {
      title: 'More resources',
      links: [
        { path: '/jobs', label: 'Jobs' },
        { path: '/interviewExp', label: 'Interview Experiences' },
        { path: '/salaryStructures', label: 'Salary Insights' },
        { path: '/interview-questions', label: 'Interview Questions' },
        { path: '/resume-builder', label: 'Resume Builder' },
      ],
    },
  };

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
