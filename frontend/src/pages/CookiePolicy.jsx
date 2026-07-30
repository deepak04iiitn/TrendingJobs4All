import LegalShell from '../components/legal/LegalShell';

const UPDATED = 'July 30, 2026';

const sections = [
  {
    id: 'what-are-cookies',
    title: 'What Are Cookies',
    content:
      'Cookies are small text files placed on your device when you visit a website. They help sites remember preferences, keep you signed in, and understand how pages are used.',
  },
  {
    id: 'how-we-use',
    title: 'How We Use Cookies',
    content:
      'We use cookies to keep the site working reliably, remember session and preference choices, measure traffic in aggregate, and improve features over time. Some cookies are essential; others help us understand usage.',
  },
  {
    id: 'types',
    title: 'Types of Cookies We Use',
    content: 'Depending on your visit, we may use the following categories:',
    bullets: [
      'Essential — required for core functions such as security and authentication',
      'Performance — help us understand which pages are useful and how visitors move around',
      'Functional — remember choices that make the experience smoother',
      'Marketing — used only if enabled to understand interest in relevant content',
    ],
  },
  {
    id: 'essential',
    title: 'Essential Cookies',
    content:
      'These cookies are necessary for the website to function and generally cannot be switched off. They are usually set in response to actions you take, such as signing in or setting preferences.',
  },
  {
    id: 'performance',
    title: 'Performance Cookies',
    content:
      'These cookies help us count visits and traffic sources so we can measure and improve the site. They tell us which pages are most and least used and how people navigate between them.',
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    content:
      'Functional cookies enable enhanced features and personalization. They may be set by us or by providers whose tools we embed. Disabling them may limit some features.',
  },
  {
    id: 'marketing',
    title: 'Marketing Cookies',
    content:
      'Marketing cookies may be used to understand interests and show more relevant content. If you block them, you may still see ads or promotions elsewhere, but they may be less tailored.',
  },
  {
    id: 'third-party',
    title: 'Third-Party Cookies',
    content:
      'Trusted partners (for example analytics or auth providers) may set cookies subject to their own policies. We only work with partners we believe handle data responsibly.',
  },
  {
    id: 'duration',
    title: 'Cookie Duration',
    content:
      'Session cookies expire when you close your browser. Persistent cookies remain for a set period or until you delete them. Duration depends on the cookie’s purpose.',
  },
  {
    id: 'managing',
    title: 'Managing Your Preferences',
    content:
      'You can control cookies through your browser settings — block them, delete existing ones, or allow them selectively. Blocking essential cookies may affect sign-in and other core features.',
  },
  {
    id: 'browser',
    title: 'Browser Settings',
    content:
      'Most browsers let you manage cookies under privacy or settings menus. Check your browser’s help documentation for steps specific to Chrome, Firefox, Safari, Edge, or others.',
  },
  {
    id: 'updates',
    title: 'Updates to This Policy',
    content:
      'We may update this Cookie Policy to reflect product, legal, or operational changes. Material updates will be reflected on this page with a revised “Last updated” date.',
  },
];

export default function CookiePolicy() {
  return (
    <LegalShell
      eyebrow="Legal · Cookies"
      title="Cookie Policy"
      lede="A clear look at the cookies Route2Hire uses, why they exist, and how you can control them in your browser."
      updated={UPDATED}
      sections={sections}
      currentPath="/cookie-policy"
      contactNote="Need help understanding cookies on Route2Hire? Contact us and we’ll walk you through it."
      seo={{
        title: 'Cookie Policy | Route2Hire',
        description:
          "Read Route2Hire's Cookie Policy to learn how we use cookies and how you can manage your preferences.",
        keywords:
          'Cookie policy, Route2Hire cookies, browser cookies, privacy preferences, QA platform cookies',
      }}
    />
  );
}
