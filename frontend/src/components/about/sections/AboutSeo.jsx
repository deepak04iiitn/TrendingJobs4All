import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO, buildAboutJsonLd } from '../data/content';

export default function AboutSeo() {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://route2hire.com';
  const aboutLd = useMemo(() => buildAboutJsonLd(siteUrl), [siteUrl]);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }}
      />
    </Helmet>
  );
}
