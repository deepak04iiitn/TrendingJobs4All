import { useEffect } from 'react';
import '../styles/Home.css';
import { preloadCriticalResources } from '../utils/performanceOptimizations';
import FeedbackFab from '../components/FeedbackFab';
import RelatedLinks from '../components/RelatedLinks';
import {
  HomeSeo,
  CoverHero,
  WordField,
  PaperStack,
  AlmanacIndex,
  HomeTestimonials,
  HomeFaq,
  HomeCommunity,
  HomeClosing,
} from '../components/home';

export default function Home() {
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  return (
    <>
      <HomeSeo />
      <div className="home-page bg-[#F7F3EC]">
        <FeedbackFab />
        <CoverHero />
        <WordField />
        <PaperStack />
        <AlmanacIndex />
        <HomeTestimonials />
        <HomeFaq />
        <HomeCommunity />
        <HomeClosing />
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <RelatedLinks type="home" />
        </div>
      </div>
    </>
  );
}
