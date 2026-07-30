import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import RelatedLinks from '../components/RelatedLinks';
import { focusRing } from '../theme/tokens';

/**
 * Crawlable soft-404 / unknown route page with strong internal linking.
 */
export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page not found | Route2Hire</title>
        <meta
          name="description"
          content="This page is unavailable. Continue to Route2Hire jobs, interview prep, blogs, and career tools for QA and SDET professionals."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="relative min-h-[70vh] bg-[#F7F3EC] px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]">404</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold text-[#1C1917]">
            This page isn’t available
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#57534E]">
            The link may be outdated or the page was moved. Use the links below to keep exploring
            QA and SDET career resources on Route2Hire.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className={`rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              Go to home
            </Link>
            <Link
              to="/jobs"
              className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-5 py-3 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              Browse jobs
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <RelatedLinks type="notFound" />
        </div>
      </div>
    </>
  );
}
