import '../styles/About.css';
import RelatedLinks from '../components/RelatedLinks';
import {
  AboutSeo,
  AboutIntro,
  AboutStatement,
  AboutTimeline,
  AboutValues,
  AboutBento,
  AboutInvite,
} from '../components/about';

export default function About() {
  return (
    <>
      <AboutSeo />
      <div className="about-page bg-[#F7F3EC]">
        <AboutIntro />
        <AboutStatement />
        <AboutTimeline />
        <AboutValues />
        <AboutBento />
        <AboutInvite />
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <RelatedLinks type="about" />
        </div>
      </div>
    </>
  );
}
