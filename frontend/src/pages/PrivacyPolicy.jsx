import LegalShell from '../components/legal/LegalShell';

const UPDATED = 'July 30, 2026';

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content:
      'Welcome to Route2Hire. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. Please read it carefully before creating an account or sharing details with us.',
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content:
      'We collect information that helps us run the platform and improve your experience. This may include account details, career preferences, and how you use the site.',
    bullets: [
      'Account data such as name, username, email, and profile photo',
      'Job preferences, saved roles, and career-related submissions you choose to share',
      'Usage data such as pages visited and basic device or browser information',
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    content:
      'We use the information we collect to operate Route2Hire, personalize recommendations where relevant, improve product quality, and communicate about opportunities, product updates, or support requests you initiate.',
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content:
      'We implement practical security measures — including encryption in transit and access controls — to protect your personal data from unauthorized access, alteration, or disclosure. No method of transmission over the internet is perfectly secure, but we work to keep your information safe.',
  },
  {
    id: 'third-party',
    title: 'Third-Party Sharing',
    content:
      'We do not sell your personal data. We only share information when required by law, or when it is necessary to operate core services (for example, infrastructure or authentication providers bound by appropriate agreements).',
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    content:
      'You may request access to, correction of, or deletion of your personal information. You can update many details in your profile, or contact us to exercise rights that need our help.',
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalShell
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      lede="How Route2Hire collects, uses, and protects your information — written plainly so you know where you stand."
      updated={UPDATED}
      sections={sections}
      currentPath="/privacy-policy"
      contactNote="Reach out with any privacy-related questions or data requests. We’ll respond as quickly as we can."
      seo={{
        title: 'Privacy Policy | Route2Hire',
        description:
          "Read Route2Hire's Privacy Policy to understand how we protect your personal information on our QA and SDET career platform.",
        keywords:
          'Privacy policy, Route2Hire privacy, data protection, user privacy, QA platform privacy',
      }}
    />
  );
}
