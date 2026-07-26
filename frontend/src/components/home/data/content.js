export const SEO = {
  title: 'Route2Hire | QA, SDET & Test Automation Jobs, Interviews & Prep',
  description:
    'Route2Hire is the career platform for QA, SDET and Test Automation engineers - curated software testing jobs, real interview experiences, a QA/SDET DSA sheet, salary insights, referrals, resume tools and roadmaps.',
  keywords:
    'QA jobs, SDET jobs, Test Automation jobs, software testing careers, QA interview questions, SDET interview experiences, QA DSA sheet, automation testing salary, QA referrals, SDET resume, test engineer roadmap',
  ogTitle: 'Route2Hire | QA, SDET & Test Automation Careers',
  ogDescription:
    'Find curated QA and SDET jobs, study real interview experiences, practice the QA/SDET DSA sheet, compare salaries and get referrals - all on one platform built for testers.',
  canonical: 'https://route2hire.com',
  ogImage: 'https://route2hire.com/assets/Route2Hire.png',
};

export const COVER = {
  brand: 'Route2Hire',
  headline: 'Built only for QA & SDET careers.',
  support:
    'Curated software testing jobs, real interview experiences, QA/SDET DSA practice, salary insights and referrals - on one platform for testers.',
  primaryCta: { label: 'Explore QA/SDET jobs', path: '/jobs' },
  secondaryCta: { label: 'Open DSA Sheet', path: '/qa-sdet-dsa-sheet' },
};

/** Kinetic typography map - product as living words */
export const WORD_FIELD = [
  { label: 'Jobs', path: '/jobs', blurb: 'Curated QA, SDET & automation testing roles', weight: 'xl', x: 8, y: 18, rotate: -4 },
  { label: 'Interviews', path: '/interviewExp', blurb: 'Round-by-round QA & SDET interview experiences', weight: 'lg', x: 52, y: 12, rotate: 3 },
  { label: 'DSA', path: '/qa-sdet-dsa-sheet', blurb: 'DSA practice sheet built for testing interviews', weight: 'xl', x: 28, y: 42, rotate: -2 },
  { label: 'Salary', path: '/salaryStructures', blurb: 'QA & SDET compensation bands, role by role', weight: 'md', x: 68, y: 38, rotate: 5 },
  { label: 'Referrals', path: '/referrals', blurb: 'Employee referrals from testers already inside', weight: 'md', x: 12, y: 68, rotate: 2 },
  { label: 'Resume', path: '/resume-builder', blurb: 'QA/SDET resume templates and guided builder', weight: 'sm', x: 48, y: 62, rotate: -6 },
  { label: 'Roadmaps', path: '/roadmaps', blurb: 'Manual testing to SDET and automation architect', weight: 'sm', x: 74, y: 72, rotate: 4 },
  { label: 'Questions', path: '/interview-questions', blurb: 'Topic-wise QA/SDET questions with model answers', weight: 'md', x: 38, y: 82, rotate: -1 },
];

/** Stacked parchment sheets - flip through the platform */
export const PAPER_STACK = [
  {
    id: 'jobs',
    label: 'Chapter I',
    title: 'Find the right testing role',
    body: 'Curated Quality Assurance, SDET and Test Automation openings, refreshed daily and filtered for testers - so you never scroll through generic tech listings again.',
    cta: { label: 'Browse QA/SDET jobs', path: '/jobs' },
    marks: ['SDET - Playwright', 'Automation Lead', 'API Test Engineer', 'Mobile QA'],
  },
  {
    id: 'prep',
    label: 'Chapter II',
    title: 'Study real QA interviews',
    body: 'Company-wise interview experiences and topic-wise question banks shared by QA and SDET engineers who already cleared those rounds.',
    cta: { label: 'Read interview experiences', path: '/interviewExp' },
    marks: ['Amazon - flaky test ownership', 'Razorpay - webhook retries', 'Flipkart - CI gating'],
  },
  {
    id: 'practice',
    label: 'Chapter III',
    title: 'Practice DSA that testers are asked',
    body: 'A DSA sheet curated for QA and SDET interviews, with progress tracking and a live leaderboard so your preparation stays measurable.',
    cta: { label: 'Open QA/SDET DSA Sheet', path: '/qa-sdet-dsa-sheet' },
    marks: ['Arrays', 'Hashing', 'Trees', 'SQL drills', 'Test design'],
  },
  {
    id: 'offer',
    label: 'Chapter IV',
    title: 'Negotiate and walk in prepared',
    body: 'Community-sourced salary structures, employee referrals and QA/SDET resume templates that recruiters and ATS actually parse.',
    cta: { label: 'Create free account', path: '/sign-up' },
    marks: ['Mid-senior salary bands', 'Peer referrals', 'QA/SDET resume templates'],
  },
];

export const FEATURES = [
  {
    id: 'jobs',
    title: 'QA/SDET Job Board',
    description:
      'Curated Quality Assurance, SDET and Test Automation openings, filtered daily so every listing is relevant to software testing professionals.',
    path: '/jobs',
  },
  {
    id: 'interviews',
    title: 'Interview Experiences',
    description:
      'Round-by-round QA and SDET interview experiences from Amazon, Flipkart, Razorpay and more, written by testers who sat in those rooms.',
    path: '/interviewExp',
  },
  {
    id: 'questions',
    title: 'Interview Question Bank',
    description:
      'Topic-wise QA and SDET interview questions with model answers on automation, API testing, SQL and test strategy - drill weak spots fast.',
    path: '/interview-questions',
  },
  {
    id: 'dsa',
    title: 'QA/SDET DSA Sheet',
    description:
      'A data structures and algorithms sheet curated for testing interviews, with progress tracking and a live leaderboard to keep you consistent.',
    path: '/qa-sdet-dsa-sheet',
  },
  {
    id: 'salary',
    title: 'Salary Structures',
    description:
      'Real QA, SDET and automation testing compensation data shared by the community, broken down by role, level and experience.',
    path: '/salaryStructures',
  },
  {
    id: 'referrals',
    title: 'Referrals',
    description:
      'Employee referrals from QA and SDET engineers already working at the companies you want to join, so your resume reaches a human.',
    path: '/referrals',
  },
  {
    id: 'resume',
    title: 'Resume Builder & Templates',
    description:
      'ATS-friendly QA and SDET resume templates plus a guided builder that highlights the automation frameworks and tools recruiters scan for.',
    path: '/resume-builder',
  },
  {
    id: 'roadmaps',
    title: 'Career Roadmaps',
    description:
      'Structured learning paths from manual testing to SDET, automation architect and beyond, with the skills expected at every stage.',
    path: '/roadmaps',
  },
  {
    id: 'blog',
    title: 'Blog & Playbooks',
    description:
      'Deep dives on test automation frameworks, CI pipelines, tooling and interview strategy - written for testers, by testers.',
    path: '/blogs',
  },
];

export const FAQS = [
  {
    q: 'What is Route2Hire?',
    a: 'Route2Hire is a career platform built for QA, SDET and Test Automation professionals. It brings curated software testing jobs, real interview experiences, a QA/SDET DSA sheet, salary insights, referrals, resume tools and career roadmaps together in one place.',
  },
  {
    q: 'Is Route2Hire only for QA and SDET roles?',
    a: 'Yes. Every feature is built around Quality Assurance and Software Development Engineer in Test careers - from job filters and interview content to DSA practice and salary benchmarks for testers.',
  },
  {
    q: 'What is the QA/SDET DSA Sheet?',
    a: 'It is a curated set of data structures and algorithms topics and problems tailored to QA and SDET interviews. You can track your progress, practise consistently and compare with peers on the live leaderboard.',
  },
  {
    q: 'How do I find QA and SDET jobs on Route2Hire?',
    a: 'Browse the job board for daily curated Quality Assurance, SDET and Test Automation openings, filter by role, experience and skills, then apply directly or request a referral from someone already inside the company.',
  },
  {
    q: 'How do I get QA job alerts?',
    a: 'Join our Telegram community for instant QA and SDET job updates, or create a free Route2Hire account to personalise your job search and save roles.',
  },
  {
    q: 'Where can I connect with other testers?',
    a: 'Join our Telegram and WhatsApp communities to network with 3.5K+ QA and SDET professionals, share interview tips and get peer support during your job search.',
  },
];

export const COMMUNITY = {
  title: '3.5K+ testers already in the room',
  support: 'Instant QA and SDET job alerts, interview discussions and peer support.',
  links: [
    {
      name: 'Telegram',
      members: '3.5K+ members',
      href: 'https://t.me/trendingjobs4all_QA',
      blurb: 'Daily QA/SDET job alerts and live discussion.',
    },
    {
      name: 'WhatsApp',
      members: 'Active group',
      href: 'https://chat.whatsapp.com/DXvc1ncAenX1HZ7OKr8L4Y?mode=wwt',
      blurb: 'Peer support and faster replies from the community.',
    },
  ],
};

export const CLOSING = {
  title: 'Your next testing role starts here.',
  support:
    'QA and SDET jobs, interview experiences, DSA practice, salary insights and referrals - free to start.',
  cta: { label: 'Create free account', path: '/sign-up' },
};

export function buildJsonLd(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Route2Hire',
    url: siteUrl,
    description: SEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/jobs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    about: [
      'QA jobs',
      'SDET careers',
      'Test Automation',
      'Interview preparation',
      'Salary insights',
      'Employee referrals',
    ],
  };
}

export function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export function buildFeaturesJsonLd(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: FEATURES.map((feature, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: feature.title,
      description: feature.description,
      url: `${siteUrl}${feature.path}`,
    })),
  };
}

export function buildOrganizationJsonLd(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Route2Hire',
    url: siteUrl,
    logo: SEO.ogImage,
    description: SEO.description,
    sameAs: [COMMUNITY.links[0]?.href, COMMUNITY.links[1]?.href].filter(Boolean),
  };
}
