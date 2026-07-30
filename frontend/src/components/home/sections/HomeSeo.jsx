import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO, buildJsonLd, buildFaqJsonLd, buildFeaturesJsonLd, buildOrganizationJsonLd } from '../data/content';

export default function HomeSeo() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : SEO.canonical;
  const websiteLd = useMemo(() => buildJsonLd(siteUrl), [siteUrl]);
  const faqLd = useMemo(() => buildFaqJsonLd(), []);
  const featuresLd = useMemo(() => buildFeaturesJsonLd(siteUrl), [siteUrl]);
  const orgLd = useMemo(() => buildOrganizationJsonLd(siteUrl), [siteUrl]);

  return (
    <Helmet>
      <title>{SEO.title}</title>
      <meta name="description" content={SEO.description} />
      <meta name="keywords" content={SEO.keywords} />
      <meta property="og:title" content={SEO.ogTitle} />
      <meta property="og:description" content={SEO.ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SEO.canonical} />
      <meta property="og:image" content={SEO.ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO.ogTitle} />
      <meta name="twitter:description" content={SEO.ogDescription} />
      <link rel="canonical" href={SEO.canonical} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuresLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
    </Helmet>
  );
}
