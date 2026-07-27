import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import JobTable from '../components/JobTable';
import RelatedLinks from '../components/RelatedLinks';
import { easeOut } from '../components/home/motion.jsx';
import '../styles/Jobs.css';

export default function Jobs() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>QA, SDET & Test Automation Jobs | Route2Hire</title>
        <meta
          name="description"
          content="Browse curated QA, SDET, Test Automation and Software Testing jobs on Route2Hire. Filter by experience, category and date to find role-ready openings from top companies."
        />
        <meta
          name="keywords"
          content="QA jobs, SDET jobs, Test Automation jobs, Software Testing jobs, Quality Assurance careers, Test Engineering roles, automation testing openings"
        />
        <meta property="og:title" content="QA, SDET & Test Automation Jobs | Route2Hire" />
        <meta
          property="og:description"
          content="Explore curated QA, SDET and Test Automation openings with filters for experience, category and posting date."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/jobs" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/jobs" />
      </Helmet>

      <div className="jobs-page min-h-screen pb-16 pt-28 sm:pb-20 sm:pt-32">
        <section id="jobs" className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="mb-10 max-w-3xl sm:mb-12"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Job board
            </p>
            <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
              Curated QA, SDET and Test Automation jobs
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
              Browse software testing roles and filter by keyword, experience, category or date -
              then open the full JD when you are ready to apply.
            </p>
            <div className="jobs-divider mt-6" aria-hidden />
          </motion.header>

          <JobTable />

          <div className="jobs-related mt-14">
            <RelatedLinks type="job" />
          </div>
        </section>
      </div>
    </>
  );
}
