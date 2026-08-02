import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BellRing,
  Filter,
  Building2,
  Ban,
  RefreshCcw,
  MapPin,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Reveal, easeOut } from '../components/home/motion.jsx';
import PremiumSubscribeDrawer from '../components/PremiumSubscribeDrawer';
import RelatedLinks from '../components/RelatedLinks';
import { focusRing } from '../theme/tokens';

const TIMELINE = [
  {
    icon: BellRing,
    title: 'Tell us your YOE',
    desc: 'One quick input when you subscribe — no lengthy profile, no resume upload.',
  },
  {
    icon: Filter,
    title: 'We scan & rank, every night',
    desc: 'Fresh QA/SDET openings at product-based companies are matched to your experience and ranked by company follower quality.',
  },
  {
    icon: Building2,
    title: 'Your inbox, 8:30am',
    desc: 'The 10 best product-company matches, never-before-seen — ready to open and apply.',
  },
];

const BENEFITS = [
  {
    icon: RefreshCcw,
    title: 'Zero repeats, guaranteed',
    desc: 'Every job we email you is tracked — you will never see the same listing twice. When fresh matches run thin, we widen the experience band automatically so you still get 10.',
    span: 'lg',
  },
  {
    icon: Building2,
    title: 'Product-based companies, ranked by real signal',
    desc: 'We focus on roles at product-based companies and use company follower counts to separate the ones worth chasing from noise.',
  },
  {
    icon: Ban,
    title: 'Low-quality companies filtered',
    desc: 'A standing blocklist keeps known low-quality recruiters and staffing shops out of your inbox.',
  },
  {
    icon: BellRing,
    title: 'Cancel in one tap',
    desc: 'No calls, no forms — cancel or pause from My Corner whenever you like.',
  },
];

const FAQS = [
  {
    q: 'Who is Premium Jobs for?',
    a: 'Premium Jobs currently covers QA, SDET and Test Automation roles at product-based companies exclusively — the same focus as the rest of Route2Hire.',
  },
  {
    q: 'What kind of companies will I hear about?',
    a: 'We focus on QA/SDET openings at product-based companies, ranked by company follower count, so the roles at the top of your inbox are ones genuinely worth chasing.',
  },
  {
    q: 'How are jobs matched to me?',
    a: 'We match daily job listings from product-based companies to your stated Years of Experience, filter out low-quality or blocklisted companies, and rank the rest by company follower count so you see the most reputable, relevant openings first.',
  },
  {
    q: 'Will I get duplicate jobs?',
    a: 'No. We track which jobs have already been emailed to you and always send fresh matches, falling back to slightly lower experience bands if fewer than 10 new matches exist on a given day.',
  },
  {
    q: 'How much does it cost?',
    a: 'Premium Jobs is ₹149/month, billed automatically via Razorpay. You can cancel anytime from My Corner.',
  },
  {
    q: 'What happens if my payment fails?',
    a: 'If a renewal payment fails, your subscription is paused immediately and daily emails stop until you re-subscribe.',
  },
];

const SAMPLE_JOBS = [
  { title: 'Senior SDET', company: 'Docusign', exp: '5 yrs', loc: 'Bengaluru' },
  { title: 'QA Automation Engineer', company: 'Akamai', exp: '3 yrs', loc: 'Remote' },
  { title: 'Software Test Engineer II', company: 'Elsevier', exp: '4 yrs', loc: 'Hyderabad' },
];

function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function buildProductJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Route2Hire Premium Jobs',
    description:
      'Daily, personalized QA/SDET job recommendations at product-based companies, delivered by email and matched to your Years of Experience.',
    offers: {
      '@type': 'Offer',
      price: '149',
      priceCurrency: 'INR',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://route2hire.com/premium-jobs',
    },
  };
}

function buildBreadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://route2hire.com/' },
      { '@type': 'ListItem', position: 2, name: 'Premium Jobs', item: 'https://route2hire.com/premium-jobs' },
    ],
  };
}

function EmailDigestMockup({ reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.8, delay: 0.25, ease: easeOut }}
      className="relative mx-auto w-full max-w-md"
    >
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle,rgba(196,165,116,0.22)_0%,transparent_72%)]" aria-hidden />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.9, ease: easeOut }}
        className="absolute -right-4 -top-4 z-20 flex items-center gap-1.5 rounded-full bg-[#2C241B] px-3 py-1.5 text-[11px] font-semibold text-[#FFFDF8] shadow-[0_10px_24px_-10px_rgba(44,36,27,0.55)]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4A574] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C4A574]" />
        </span>
        10 new matches
      </motion.div>

      <div className="overflow-hidden rounded-[1.5rem] border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_32px_70px_-24px_rgba(44,36,27,0.28)]">
        <div className="flex items-center gap-1.5 border-b border-[#E5DCCE] bg-[#EFE8DC] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5A87C]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8C97A]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#9BC98C]" />
          <span className="ml-3 truncate text-[11px] font-medium text-[#6B5A48]">
            support@route2hire.com
          </span>
        </div>

        <div className="border-b border-[#E5DCCE] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B5A48]">
            Today, 8:30 AM
          </p>
          <p className="font-display mt-1 text-base font-semibold text-[#1C1917]">
            Your Premium Jobs Today
          </p>
        </div>

        <div className="divide-y divide-[#E5DCCE]">
          {SAMPLE_JOBS.map((job, i) => (
            <motion.div
              key={job.title}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.5 + i * 0.12, ease: easeOut }}
              className="flex items-start justify-between gap-3 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1C1917]">{job.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#78716C]">
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={11} aria-hidden />
                    {job.company}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} aria-hidden />
                    {job.loc}
                  </span>
                  <span className="rounded-full bg-[#F7F3EC] px-1.5 py-0.5 font-medium text-[#6B5A48]">
                    {job.exp}
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="mt-0.5 shrink-0 text-[#C4A574]" aria-hidden />
            </motion.div>
          ))}
        </div>

        <div className="bg-[#F7F3EC] px-5 py-3 text-center text-[11px] text-[#78716C]">
          + 7 more roles inside
        </div>
      </div>
    </motion.div>
  );
}

export default function PremiumJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useSelector((state) => state.user);
  const reduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const seoTitle = 'Premium Jobs — Daily QA/SDET Jobs at Product-Based Companies | Route2Hire';
  const seoDescription =
    'Get the top 10 QA, SDET and Test Automation job openings at product-based companies, matched to your experience and delivered to your inbox every day. ₹149/month, cancel anytime.';

  useEffect(() => {
    if (searchParams.get('subscribe') === '1' && currentUser) {
      setDrawerOpen(true);
    }
  }, [searchParams, currentUser]);

  const handleSubscribeClick = () => {
    if (!currentUser) {
      const current = location.pathname + location.search;
      navigate(`/sign-in?redirect=${encodeURIComponent(current)}`);
      return;
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    if (searchParams.get('subscribe')) {
      searchParams.delete('subscribe');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="product based company jobs, QA jobs at product companies, premium QA jobs, SDET job alerts, daily job email, QA job recommendations, Route2Hire premium"
        />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/premium-jobs" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <link rel="canonical" href="https://route2hire.com/premium-jobs" />
        <meta name="robots" content="index,follow" />
        <script type="application/ld+json">{JSON.stringify(buildProductJsonLd())}</script>
        <script type="application/ld+json">{JSON.stringify(buildFaqJsonLd())}</script>
        <script type="application/ld+json">{JSON.stringify(buildBreadcrumbJsonLd())}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F7F3EC] pb-20 pt-28 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-[15%] top-[-10%] h-[55vmin] w-[55vmin] rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.24)_0%,transparent_70%)]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[45vmin] w-[45vmin] rounded-full bg-[radial-gradient(circle,rgba(107,90,72,0.1)_0%,transparent_72%)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
              className="font-display mt-5 text-[clamp(2.4rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-[#1C1917]"
            >
              Stop refreshing job boards.
              <br />
              <span className="text-[#C4A574]">Let the jobs find you.</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: easeOut }}
              className="mt-5 max-w-lg text-base leading-relaxed text-[#57534E] sm:text-lg"
            >
              Tell us your Years of Experience once. Every morning, we hand-rank the freshest QA,
              SDET and Test Automation openings at product-based companies and drop the top 10
              straight into your inbox — never the same job twice.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: easeOut }}
              className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <button
                type="button"
                onClick={handleSubscribeClick}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2C241B] px-7 py-3.5 text-sm font-semibold text-[#FFFDF8] shadow-[0_16px_36px_-14px_rgba(44,36,27,0.5)] transition hover:bg-[#1C1711] ${focusRing}`}
              >
                Subscribe — ₹149/month
              </button>
              <p className="text-xs text-[#78716C]">Cancel anytime · No long-term lock-in</p>
            </motion.div>
          </div>

          <EmailDigestMockup reduceMotion={reduceMotion} />
        </div>
      </section>

      {/* How it works — connected timeline */}
      <section className="relative bg-[#FFFDF8] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-lg text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              The pipeline
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              From your inbox, to their inbox
            </h2>
          </Reveal>

          <div className="relative mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
            <div
              className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-[#E5DCCE] to-transparent sm:block"
              aria-hidden
            />
            {TIMELINE.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} className="relative text-center sm:text-left">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] text-[#C4A574] shadow-[0_10px_24px_-14px_rgba(44,36,27,0.3)] sm:mx-0">
                  <step.icon size={24} aria-hidden />
                </div>
                <p className="font-display mt-5 text-4xl font-semibold text-[#E5DCCE]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display -mt-2 text-lg font-semibold text-[#1C1917]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#57534E]">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — bento grid */}
      <section className="bg-[#F7F3EC] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-lg text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Why it works
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              Built to respect your inbox
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal
                key={b.title}
                delay={i * 0.08}
                className={`rounded-[1.5rem] border border-[#E5DCCE] bg-[#FFFDF8] p-7 ${
                  b.span === 'lg' ? 'sm:col-span-2 sm:flex sm:items-center sm:gap-8' : ''
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574] ${
                    b.span === 'lg' ? 'sm:h-14 sm:w-14' : ''
                  }`}
                >
                  <b.icon size={b.span === 'lg' ? 24 : 18} aria-hidden />
                </div>
                <div className={b.span === 'lg' ? 'mt-4 sm:mt-0' : 'mt-4'}>
                  <h3 className="font-display text-lg font-semibold text-[#1C1917] sm:text-xl">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#57534E]">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#FFFDF8] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              One simple plan
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              Everything, for one low price
            </h2>
          </Reveal>

          <Reveal className="mt-12 grid gap-10 border-y border-[#E5DCCE] py-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6B5A48]">
                Premium Jobs
              </p>
              <p className="font-display mt-2 text-xl font-semibold text-[#1C1917] sm:text-2xl">
                Daily QA/SDET job digest from product-based companies
              </p>
              <ul className="mt-8 grid gap-x-8 gap-y-3.5 text-sm text-[#57534E] sm:grid-cols-2">
                {[
                  'Top 10 QA/SDET job matches at product-based companies, daily',
                  'Ranked by company follower quality',
                  'No duplicate job recommendations',
                  'Update your YOE anytime',
                  'Cancel or pause anytime',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={15} className="mt-0.5 shrink-0 text-[#C4A574]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:border-l lg:border-[#E5DCCE] lg:pl-16">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-semibold text-[#1C1917] sm:text-7xl">
                  ₹149
                </span>
                <span className="text-base text-[#78716C]">/month</span>
              </div>
              <div className="mt-4 h-px w-16 bg-[#C4A574]" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed text-[#78716C]">
                Billed monthly via Razorpay. Cancel or pause anytime from My Corner.
              </p>
              <button
                type="button"
                onClick={handleSubscribeClick}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2C241B] px-6 py-3.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1C1711] ${focusRing}`}
              >
                Subscribe now
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#EFE8DC] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="mb-12 max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Good to know
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="divide-y divide-[#E5DCCE] border-y border-[#E5DCCE]">
            {FAQS.map((item, index) => (
              <motion.details
                key={item.q}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: easeOut }}
                className="group"
              >
                <summary
                  className={`flex cursor-pointer list-none items-start gap-5 py-6 text-left ${focusRing}`}
                >
                  <span className="font-display mt-0.5 w-8 shrink-0 text-sm tabular-nums text-[#C4A574]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display flex-1 text-base font-semibold tracking-tight text-[#1C1917] sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center text-lg font-light text-[#6B5A48] transition-transform duration-300 ease-out group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-6 pl-[3.25rem] pr-8 text-sm leading-relaxed text-[#57534E]">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="relative overflow-hidden bg-[#2C241B] py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-[10%] top-[-30%] h-[50vmin] w-[50vmin] rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.18)_0%,transparent_70%)]" />
        </div>
        <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-[#FFFDF8] sm:text-3xl">
            Your next QA role at a product-based company might land tomorrow morning.
          </h2>
          <button
            type="button"
            onClick={handleSubscribeClick}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C4A574] px-7 py-3.5 text-sm font-semibold text-[#2C241B] transition hover:bg-[#D4B685] ${focusRing}`}
          >
            Subscribe — ₹149/month
          </button>
        </Reveal>
      </section>

      {/* Explore more resources */}
      <section className="bg-[#F7F3EC] py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <RelatedLinks type="premium" />
        </div>
      </section>

      <PremiumSubscribeDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
