import { Suspense, lazy } from 'react';

const NewsletterBanner = lazy(() => import('../../NewsLetterBanner'));

export default function HomeNewsletter() {
  return (
    <section className="bg-[#F8FAFC] py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200/60" aria-hidden />
          }
        >
          <NewsletterBanner />
        </Suspense>
      </div>
    </section>
  );
}
