import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Instagram, Mail, Send, ArrowUpRight, Linkedin } from 'lucide-react';
import { focusRing } from '../theme/tokens';
import RelatedLinks from '../components/RelatedLinks';

const INSTAGRAM_URL =
  'https://www.instagram.com/route2hire?igsh=ZGk5NTQyY2RiOGF1';

const founders = [
  {
    name: 'Sandeep Yadav',
    role: 'Founder',
    image: '/assets/Profile.jpg',
    link: 'https://www.linkedin.com/in/sandeep-yadav-sdet/',
  },
  {
    name: 'Deepak Yadav',
    role: 'Co-Founder',
    image: '/assets/MyProfile.png',
    link: 'https://www.linkedin.com/in/deepak-kumar-yadav-a0653b248/',
  },
];

const otherChannels = [
  {
    name: 'QA Jobs on Telegram',
    detail: 'Daily openings for QA & SDET roles',
    href: 'https://t.me/trendingjobs4all_QA',
    icon: Send,
  },
  {
    name: 'Email',
    detail: 'route2hire@gmail.com',
    href: 'mailto:route2hire@gmail.com',
    icon: Mail,
  },
];

export default function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Route2Hire | QA & SDET Career Community</title>
        <meta
          name="description"
          content="Reach Route2Hire on Instagram, Telegram, email, or LinkedIn. Connect with our founders for QA, SDET, and automation career guidance."
        />
        <meta
          name="keywords"
          content="Route2Hire contact, Instagram, QA jobs Telegram, SDET careers, email Route2Hire, LinkedIn founders"
        />
        <meta property="og:title" content="Contact Route2Hire | QA & SDET Career Community" />
        <meta
          property="og:description"
          content="Follow Route2Hire on Instagram and reach our team via Telegram, email, or LinkedIn."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/contact-us" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/contact-us" />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#F7F3EC]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 65% 50% at 80% -10%, rgba(196,165,116,0.28), transparent 55%), radial-gradient(ellipse 45% 35% at 0% 40%, rgba(239,232,220,0.95), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
          {/* Intro — one job */}
          <motion.header
            className="max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]">
              Contact
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.25rem,5.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-[#1C1917]">
              Say hello where we actually hang out
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#57534E] sm:text-lg">
              Job drops, career tips, and behind-the-scenes live on Instagram — start there, then
              reach us wherever else you prefer.
            </p>
          </motion.header>

          {/* Instagram — primary focus */}
          <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative mt-12 block overflow-hidden rounded-[1.75rem] bg-[#2C241B] px-6 py-10 text-[#FFFDF8] shadow-[0_28px_60px_-28px_rgba(44,36,27,0.55)] sm:px-10 sm:py-14 ${focusRing}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#C4A574]/25 blur-3xl transition duration-700 group-hover:bg-[#C4A574]/40"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#C4A574]/15 blur-3xl"
            />

            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5 sm:items-center">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#C4A574]/20 text-[#C4A574] ring-1 ring-[#C4A574]/35 sm:h-20 sm:w-20">
                  <Instagram className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4A574]">
                    Primary channel
                  </p>
                  <p className="font-display mt-1.5 text-2xl font-semibold tracking-tight text-[#FFFDF8] sm:text-3xl">
                    @route2hire
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[#E5DCCE] sm:text-base">
                    Follow for openings, tips, and community updates — the fastest way to stay in
                    the loop.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#FFFDF8] px-5 py-3 text-sm font-semibold text-[#2C241B] transition group-hover:bg-[#C4A574] group-hover:text-[#1C1917] sm:self-center">
                Open Instagram
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </motion.a>

          {/* Founders */}
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-display text-xl font-semibold text-[#1C1917] sm:text-2xl">
              Meet the founders
            </h2>
            <p className="mt-1 text-sm text-[#78716C]">Say hi on LinkedIn — happy to connect.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {founders.map((person) => (
                <a
                  key={person.name}
                  href={person.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/80 px-4 py-4 transition hover:border-[#C4A574]/50 hover:bg-[#FFFDF8] ${focusRing}`}
                >
                  <img
                    src={person.image}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#E5DCCE] transition group-hover:ring-[#C4A574]/60"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold text-[#1C1917]">{person.name}</p>
                    <p className="text-sm text-[#78716C]">{person.role}</p>
                  </div>
                  <Linkedin className="h-4 w-4 shrink-0 text-[#C4A574] opacity-70 transition group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </motion.section>

          {/* Secondary channels — quieter than Instagram */}
          <section className="mt-14 border-t border-[#E5DCCE] pt-10">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Also reach us
            </h2>
            <ul className="mt-5 divide-y divide-[#E5DCCE]">
              {otherChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <li key={channel.name}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-4 py-4 transition ${focusRing} rounded-lg`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE8DC] text-[#6B5A48] transition group-hover:bg-[#C4A574]/25 group-hover:text-[#2C241B]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-[#1C1917]">{channel.name}</span>
                        <span className="block text-[13px] text-[#78716C]">{channel.detail}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#C4A574] opacity-0 transition group-hover:opacity-100" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="mt-12 text-center text-[12px] text-[#78716C]">
            We value your privacy and use contact details only to respond and support you.
          </p>

          <div className="mt-10">
            <RelatedLinks type="contact" />
          </div>
        </div>
      </div>
    </>
  );
}
