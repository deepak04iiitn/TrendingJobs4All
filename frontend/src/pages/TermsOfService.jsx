import LegalShell from '../components/legal/LegalShell';

const UPDATED = 'July 30, 2026';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content:
      'By accessing and using Route2Hire, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
  },
  {
    id: 'service',
    title: 'Description of Service',
    content:
      'Route2Hire is a career platform that helps professionals explore opportunities and prepare for interviews. We provide job listings, interview experiences, salary insights, a resume builder, learning resources, and community tools.',
  },
  {
    id: 'accounts',
    title: 'User Accounts',
    content:
      'Some features require an account. You are responsible for keeping your credentials confidential and for activity under your account. Provide accurate information when you sign up, and notify us if you suspect unauthorized access.',
  },
  {
    id: 'conduct',
    title: 'User Conduct',
    content:
      'Use Route2Hire only for lawful purposes and in line with these Terms. Do not post or transmit content that is illegal, harmful, abusive, misleading, or otherwise objectionable, and do not interfere with other users or the integrity of the service.',
  },
  {
    id: 'ip',
    title: 'Content and Intellectual Property',
    content:
      'Content on Route2Hire — including text, branding, graphics, and software — is owned by Route2Hire or its licensors and protected by intellectual property laws. You may not copy, distribute, or create derivative works without permission, except as allowed by law or a written grant from us.',
  },
  {
    id: 'privacy',
    title: 'Privacy and Data Protection',
    content:
      'Your privacy matters to us. Our Privacy Policy explains how we collect, use, and protect information. Using Route2Hire means you agree to that policy as well.',
  },
  {
    id: 'prohibited',
    title: 'Prohibited Activities',
    content: 'Without limitation, you may not:',
    bullets: [
      'Use the service for unlawful purposes or to solicit unlawful acts',
      'Violate applicable laws, regulations, or third-party rights',
      'Send unsolicited advertising or promotional material without our prior written consent',
      'Attempt to disrupt, scrape abusively, or reverse engineer the platform',
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    content:
      'We may suspend or terminate your account and access immediately, without prior notice, if you breach these Terms or if we need to protect the platform, our users, or our legal obligations.',
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content:
      "Information on Route2Hire is provided on an “as is” basis. To the fullest extent permitted by law, we exclude warranties and representations relating to the service and your use of it, including job outcomes or third-party content accuracy.",
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content:
      'To the fullest extent permitted by law, Route2Hire and its team are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses arising from your use of the service.',
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    content:
      'These Terms are governed by the laws of the jurisdiction in which Route2Hire operates, without regard to conflict-of-law rules. Failure to enforce any provision is not a waiver of our rights.',
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    content:
      'We may update these Terms from time to time. If a change is material, we will provide reasonable notice before it takes effect. Continued use after changes means you accept the updated Terms.',
  },
];

export default function TermsOfService() {
  return (
    <LegalShell
      eyebrow="Legal · Terms"
      title="Terms of Service"
      lede="The ground rules for using Route2Hire — your rights, our responsibilities, and how we keep the platform fair."
      updated={UPDATED}
      sections={sections}
      currentPath="/terms-of-service"
      contactNote="If anything in these Terms is unclear, contact us before relying on a feature that might be affected."
      seo={{
        title: 'Terms of Service | Route2Hire',
        description:
          "Read Route2Hire's Terms of Service for using our QA and SDET career platform, including accounts, conduct, and liability.",
        keywords:
          'Terms of service, Route2Hire terms, user agreement, legal terms, QA platform terms',
      }}
    />
  );
}
