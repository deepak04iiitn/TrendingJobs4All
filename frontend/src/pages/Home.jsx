import { useEffect } from 'react';
import '../styles/Home.css';
import { preloadCriticalResources } from '../utils/performanceOptimizations';
import FeedbackFab from '../components/FeedbackFab';
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
      </div>
    </>
  );
}
