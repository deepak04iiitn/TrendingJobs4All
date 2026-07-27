import '../styles/About.css';
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
      </div>
    </>
  );
}
