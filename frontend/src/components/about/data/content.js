export const SEO = {
  title: 'About Route2Hire | QA, SDET & Test Automation Career Platform',
  description:
    'Route2Hire is the career platform built for QA, SDET and Test Automation professionals. Curated software testing jobs, interview prep, DSA practice, salary insights and a 3.5K+ tester community.',
  keywords:
    'Route2Hire about, QA career platform, SDET jobs platform, test automation careers, software testing community, QA interview prep, SDET DSA sheet',
  ogTitle: 'About Route2Hire | Built for QA & SDET Careers',
  ogDescription:
    'Discover how Route2Hire helps QA and SDET engineers find curated jobs, study real interviews, practice DSA and grow with a dedicated testing community.',
  canonical: 'https://route2hire.com/about',
  ogImage: 'https://route2hire.com/assets/Route2Hire.png',
};

export const INTRO = {
  eyebrow: 'About Route2Hire',
  headline: 'A QA and SDET career platform, end to end.',
  lede:
    'Route2Hire helps software testing professionals move faster with curated QA/SDET jobs, interview preparation resources, role-specific DSA practice, salary insights and a strong peer community.',
  primaryCta: { label: 'Explore QA/SDET jobs', path: '/jobs' },
  secondaryCta: { label: 'Contact us', path: '/contact-us' },
};

export const SNAPSHOT = {
  title: 'What Route2Hire delivers',
  points: [
    '2500+ curated QA, SDET and Test Automation opportunities.',
    'Company-wise interview experiences and topic-wise interview questions.',
    'A QA/SDET DSA sheet with progress tracking and leaderboard.',
    'Salary structures shared by real practitioners.',
    'Resume builder and roadmaps tailored to software testing roles.',
  ],
};

export const STATS = [
  { key: 'jobs', label: 'QA/SDET roles', fallback: '2500+' },
  { key: 'users', label: 'Active testers', fallback: '1000+' },
  { key: 'resources', label: 'Interview resources', value: '100+' },
  { key: 'community', label: 'Community', value: '3.5K+' },
];

export const FEATURE_MATRIX = [
  {
    id: 'jobs',
    title: 'Curated Job Board',
    focus: 'QA jobs, SDET jobs, Test Automation jobs',
    description:
      'Daily curated openings for software testing professionals with role-relevant filters and cleaner discovery.',
    path: '/jobs',
  },
  {
    id: 'interviews',
    title: 'Interview Prep Stack',
    focus: 'QA interview experiences, SDET interview questions',
    description:
      'Round-by-round experiences plus topic-wise question banks so preparation matches actual interview patterns.',
    path: '/interviewExp',
  },
  {
    id: 'practice',
    title: 'QA/SDET DSA Practice',
    focus: 'QA SDET DSA sheet, testing interview coding prep',
    description:
      'A DSA sheet built for testing interviews, with progress metrics and leaderboard visibility.',
    path: '/qa-sdet-dsa-sheet',
  },
  {
    id: 'growth',
    title: 'Career Growth Toolkit',
    focus: 'Salary insights, QA resume builder',
    description:
      'Compensation intelligence, ATS-ready resume tools and roadmaps for long-term growth.',
    path: '/salaryStructures',
  },
];

export const PRINCIPLES = [
  {
    id: 'specific',
    title: 'Specificity over generic',
    text: 'Every major feature is designed around QA and SDET hiring realities instead of broad software engineering templates.',
  },
  {
    id: 'signal',
    title: 'Signal over noise',
    text: 'Curated listings, structured prep and practical data reduce friction and help professionals focus on outcomes.',
  },
  {
    id: 'community',
    title: 'Community as force multiplier',
    text: 'Peer-shared interview notes and salary structures create faster, better career decisions.',
  },
];

export const TOOLKIT_PHASES = [
  {
    id: 'discover',
    phase: '01',
    title: 'Discover',
    lede: 'Find QA and SDET roles worth applying to, with compensation context.',
    items: [
      {
        id: 'jobs',
        title: 'Curated Job Board',
        subtitle: 'QA, SDET and Test Automation openings',
        path: '/jobs',
      },
      {
        id: 'salary',
        title: 'Salary Insights',
        subtitle: 'Compensation benchmarks by role',
        path: '/salaryStructures',
      },
    ],
  },
  {
    id: 'prepare',
    phase: '02',
    title: 'Prepare',
    lede: 'Study real interview patterns, drill topic-wise questions and practice role-specific DSA.',
    items: [
      {
        id: 'interviews',
        title: 'Interview Experiences',
        subtitle: 'Company-wise round breakdowns',
        path: '/interviewExp',
      },
      {
        id: 'questions',
        title: 'Interview Questions',
        subtitle: 'Topic-wise QA/SDET question bank',
        path: '/interview-questions',
      },
      {
        id: 'dsa',
        title: 'QA/SDET DSA Sheet',
        subtitle: 'Progress tracking and leaderboard',
        path: '/qa-sdet-dsa-sheet',
      },
    ],
  },
  {
    id: 'grow',
    phase: '03',
    title: 'Grow',
    lede: 'Build an ATS-ready profile and follow structured roadmaps from Manual QA to SDET.',
    items: [
      {
        id: 'resume',
        title: 'Resume Builder',
        subtitle: 'ATS-ready profiles for testers',
        path: '/resume-builder',
      },
      {
        id: 'roadmaps',
        title: 'Career Roadmaps',
        subtitle: 'Manual QA to SDET growth paths',
        path: '/roadmaps',
      },
    ],
  },
];

export const INVITE = {
  title: 'Build your next QA/SDET milestone with Route2Hire.',
  text: 'Start with jobs, sharpen your interview prep and leverage community-backed insights to move with confidence.',
  cta: { label: 'Create free account', path: '/sign-up' },
  link: { label: 'Browse QA/SDET jobs', path: '/jobs' },
};

export function buildAboutJsonLd(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Route2Hire',
    url: `${siteUrl}/about`,
    description: SEO.description,
    mainEntity: {
      '@type': 'Organization',
      name: 'Route2Hire',
      url: siteUrl,
      description: SEO.description,
      logo: SEO.ogImage,
    },
  };
}
