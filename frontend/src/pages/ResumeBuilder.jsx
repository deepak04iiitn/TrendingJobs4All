import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Trash2,
  Plus,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Download,
  LayoutTemplate,
  Eye,
  LogIn,
} from 'lucide-react';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import FieldSelection from '../components/resume/FieldSelection';
import RelatedLinks from '../components/RelatedLinks';
import { focusRing } from '../theme/tokens';

const AVAILABLE_FIELDS = [
  'Header',
  'Objective',
  'Education',
  'Technical Skills',
  'Projects',
  'Work Experience',
  'Positions of Responsibility',
  'Certifications',
  'Achievements',
  'Research/Publications',
  'Languages',
  'Hobbies',
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Route2Hire Resume Builder',
  url: 'https://route2hire.com/resume-builder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Free ATS-friendly resume builder for QA, SDET, and Test Automation professionals. Choose sections, edit live, and download a PDF.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: {
    '@type': 'Organization',
    name: 'Route2Hire',
    url: 'https://route2hire.com',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the Route2Hire resume builder free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can create ATS-friendly resumes for QA, SDET, and Test Automation roles, preview them live, and download a PDF at no cost with a Route2Hire account.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many resume sections can I include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can select up to seven sections, including a required Header for contact details. Keeping resumes focused helps ATS systems and recruiters scan your experience faster.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I tailor my resume for QA and SDET job descriptions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. When Technical Skills is included, you can paste a job description and use AI skill extraction to surface relevant tools, frameworks, and testing technologies for your resume.',
      },
    },
  ],
};

function SeoHelmet() {
  return (
    <Helmet>
      <title>Free Resume Builder for QA & SDET | ATS PDF Export — Route2Hire</title>
      <meta
        name="description"
        content="Free ATS-friendly resume builder for QA, SDET, and Test Automation professionals. Choose up to 7 sections, edit with live preview, extract skills from job descriptions, and download a PDF on Route2Hire."
      />
      <meta
        name="keywords"
        content="QA resume builder, SDET resume, Test Automation resume, ATS resume builder, software testing resume, free resume builder, QA engineer resume PDF, Route2Hire"
      />
      <meta property="og:title" content="Free Resume Builder for QA & SDET | Route2Hire" />
      <meta
        property="og:description"
        content="Build an ATS-friendly QA or SDET resume with live preview and free PDF download."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://route2hire.com/resume-builder" />
      <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Free Resume Builder for QA & SDET | Route2Hire" />
      <meta
        name="twitter:description"
        content="Free ATS-friendly resume builder with live preview for QA and SDET professionals."
      />
      <link rel="canonical" href="https://route2hire.com/resume-builder" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
  );
}

const ResumeBuilder = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedFields, setSelectedFields] = useState([]);
  const [resumeData, setResumeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFieldSelection, setShowFieldSelection] = useState(true);
  const [savedResumes, setSavedResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  /** library = document shelf; outline = section picker only */
  const [homeView, setHomeView] = useState('library');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/backend/resume', { withCredentials: true });
        const list = Array.isArray(res.data) ? res.data : [];
        setSavedResumes(list);
        setHomeView(list.length === 0 ? 'outline' : 'library');
      } catch (error) {
        console.error('Error fetching resumes:', error);
        setSavedResumes([]);
        setHomeView('outline');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchResumes();
    else setLoading(false);
  }, [currentUser]);

  const goHomeLibrary = () => {
    setShowFieldSelection(true);
    setSelectedFields([]);
    setResumeData({});
    setActiveResumeId(null);
    setHomeView(savedResumes.length === 0 ? 'outline' : 'library');
  };

  const handleFieldSelection = async (fields) => {
    if (fields.length === 0) {
      toast.error('Please select fields for your resume');
      return;
    }
    if (!fields.includes('Header')) {
      toast.error('Header section is compulsory');
      return;
    }
    if (fields.length > 7) {
      toast.error('You can select a maximum of 7 fields');
      return;
    }

    setSelectedFields(fields);
    setShowFieldSelection(false);

    const initialData = {};
    fields.forEach((field) => {
      switch (field) {
        case 'Header':
          initialData[field] = {
            name: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
          };
          break;
        case 'Education':
        case 'Projects':
        case 'Work Experience':
        case 'Positions of Responsibility':
        case 'Certifications':
        case 'Research/Publications':
        case 'Technical Skills':
        case 'Achievements':
        case 'Hobbies':
        case 'Languages':
          initialData[field] = [];
          break;
        default:
          initialData[field] = '';
      }
    });

    setResumeData(initialData);

    try {
      const response = await axios.post(
        '/backend/resume',
        { selectedFields: fields, resumeData: initialData },
        { withCredentials: true },
      );
      setActiveResumeId(response.data._id);
      setSavedResumes((prev) => [...prev, response.data]);
    } catch (error) {
      console.error('Error saving initial resume data:', error);
      toast.error('Failed to save resume data');
    }
  };

  const handleFormChange = async (field, value) => {
    const newData = { ...resumeData, [field]: value };
    setResumeData(newData);

    try {
      await axios.put(
        `/backend/resume/${activeResumeId}`,
        { selectedFields, resumeData: newData },
        { withCredentials: true },
      );
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume changes');
    }
  };

  const handleEditResume = async (resumeId) => {
    try {
      const res = await axios.get(`/backend/resume/${resumeId}`, { withCredentials: true });
      if (res.data) {
        setSelectedFields(res.data.selectedFields);
        setResumeData(res.data.resumeData);
        setActiveResumeId(resumeId);
        setShowFieldSelection(false);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Failed to load resume');
    }
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await axios.delete(`/backend/resume/${resumeId}`, { withCredentials: true });
      const next = savedResumes.filter((resume) => resume._id !== resumeId);
      setSavedResumes(next);
      if (activeResumeId === resumeId) {
        setShowFieldSelection(true);
        setSelectedFields([]);
        setResumeData({});
        setActiveResumeId(null);
        setHomeView(next.length === 0 ? 'outline' : 'library');
      }
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const displayName =
    resumeData?.Header?.name ||
    savedResumes.find((r) => r._id === activeResumeId)?.resumeData?.Header?.name ||
    'Untitled draft';

  return (
    <>
      <SeoHelmet />

      <div className="relative min-h-screen overflow-hidden bg-[#F7F3EC]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 40% at 90% 0%, rgba(196,165,116,0.18), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
          {!currentUser ? (
            <>
              <PageIntro />
              <GuestGate />
              <ResumeSeoGuide />
              <div className="mt-10">
                <RelatedLinks type="resume" />
              </div>
            </>
          ) : loading ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
              <p className="text-sm text-[#6B5A48]">Loading resumes…</p>
            </div>
          ) : showFieldSelection ? (
            <AnimatePresence mode="wait">
              {homeView === 'library' ? (
                <motion.div
                  key="library"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-8 border-b border-[#E5DCCE] pb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 max-w-2xl">
                        <h1 className="font-display text-[clamp(2rem,4.5vw,2.75rem)] font-semibold tracking-tight text-[#1C1917]">
                          Free Resume Builder for QA & SDET
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
                          Create an ATS-friendly resume for Quality Assurance, SDET, and Test
                          Automation roles. Choose focused sections, edit with a live paper preview,
                          extract skills from a job description, and download a clean PDF — free on
                          Route2Hire.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHomeView('outline')}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                      >
                        <Plus className="h-4 w-4" />
                        New resume
                      </button>
                    </div>

                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#6B5A48]">
                      <li className="inline-flex items-center gap-1.5">
                        <LayoutTemplate className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
                        Up to 7 resume sections
                      </li>
                      <li className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
                        Live ATS-style preview
                      </li>
                      <li className="inline-flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
                        Instant PDF download
                      </li>
                    </ul>
                  </div>

                  {savedResumes.length === 0 ? (
                    <EmptyLibrary onCreate={() => setHomeView('outline')} />
                  ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {savedResumes.map((resume) => {
                        const name = resume.resumeData?.Header?.name || 'Untitled resume';
                        const sections = resume.selectedFields?.length || 0;
                        return (
                          <li key={resume._id}>
                            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] transition hover:border-[#C4A574]/55 hover:shadow-[0_18px_40px_-28px_rgba(44,36,27,0.4)]">
                              <button
                                type="button"
                                onClick={() => handleEditResume(resume._id)}
                                className={`relative block aspect-[8.5/7] w-full overflow-hidden bg-[#EFE8DC] p-5 text-left ${focusRing}`}
                              >
                                <div className="h-full rounded-sm bg-white p-4 shadow-sm">
                                  <div className="mx-auto mb-3 h-2 w-1/2 rounded-full bg-[#2C241B]/80" />
                                  <div className="mx-auto mb-4 h-1 w-2/3 rounded-full bg-[#E5DCCE]" />
                                  <div className="space-y-1.5">
                                    <div className="h-1 w-full rounded-full bg-[#EFE8DC]" />
                                    <div className="h-1 w-[92%] rounded-full bg-[#EFE8DC]" />
                                    <div className="h-1 w-[78%] rounded-full bg-[#EFE8DC]" />
                                    <div className="mt-3 h-1 w-1/3 rounded-full bg-[#C4A574]/50" />
                                    <div className="h-1 w-full rounded-full bg-[#EFE8DC]" />
                                    <div className="h-1 w-[85%] rounded-full bg-[#EFE8DC]" />
                                  </div>
                                </div>
                              </button>
                              <div className="flex flex-1 items-start justify-between gap-2 border-t border-[#E5DCCE] px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleEditResume(resume._id)}
                                  className={`min-w-0 flex-1 text-left ${focusRing} rounded-md`}
                                >
                                  <p className="truncate font-medium text-[#1C1917]">{name}</p>
                                  <p className="mt-0.5 text-[12px] text-[#78716C]">
                                    {sections} section{sections === 1 ? '' : 's'}
                                  </p>
                                </button>
                                <div className="flex shrink-0 gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditResume(resume._id)}
                                    className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
                                    aria-label={`Edit ${name}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteResume(resume._id)}
                                    className={`rounded-lg p-2 text-[#6B5A48] hover:bg-rose-50 hover:text-rose-600 ${focusRing}`}
                                    aria-label={`Delete ${name}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </article>
                          </li>
                        );
                      })}

                      <li>
                        <button
                          type="button"
                          onClick={() => setHomeView('outline')}
                          className={`flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5DCCE] bg-transparent text-[#6B5A48] transition hover:border-[#C4A574] hover:bg-[#FFFDF8]/60 ${focusRing}`}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFE8DC]">
                            <Plus className="h-5 w-5 text-[#2C241B]" />
                          </span>
                          <span className="text-sm font-medium">Create new resume</span>
                        </button>
                      </li>
                    </ul>
                  )}

                  <ResumeSeoGuide />
                  <div className="mt-10">
                    <RelatedLinks type="resume" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="outline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="w-full"
                >
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                      {savedResumes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHomeView('library')}
                          className={`mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5A48] transition hover:text-[#2C241B] ${focusRing} rounded-md`}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to resumes
                        </button>
                      )}
                      <h1 className="font-display text-[clamp(1.85rem,4vw,2.5rem)] font-semibold tracking-tight text-[#1C1917]">
                        New resume
                      </h1>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#57534E]">
                        Pick up to 7 sections. Header stays on — it holds your contact details.
                      </p>
                    </div>
                  </div>

                  <FieldSelection
                    availableFields={AVAILABLE_FIELDS}
                    onSelect={handleFieldSelection}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E5DCCE] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={goHomeLibrary}
                    className={`mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B5A48] hover:text-[#2C241B] ${focusRing} rounded-md`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All resumes
                  </button>
                  <h2 className="font-display truncate text-2xl font-semibold text-[#1C1917]">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#78716C]">
                    {selectedFields.length} sections · autosaves as you type
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldSelection(true);
                    setSelectedFields([]);
                    setResumeData({});
                    setActiveResumeId(null);
                    setHomeView('outline');
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New resume
                </button>
              </div>

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
                <section className="min-w-0 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/80 p-4 sm:p-6">
                  <ResumeForm
                    selectedFields={selectedFields}
                    resumeData={resumeData}
                    onChange={handleFormChange}
                    onReset={() => {
                      setShowFieldSelection(true);
                      setHomeView('outline');
                    }}
                  />
                </section>
                <section className="min-w-0 xl:sticky xl:top-28 xl:self-start">
                  <div className="rounded-2xl border border-[#E5DCCE] bg-[#EFE8DC]/50 p-4 sm:p-5">
                    <ResumePreview selectedFields={selectedFields} resumeData={resumeData} />
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

function PageIntro() {
  return (
    <header className="mx-auto mb-12 max-w-3xl text-center">
      <h1 className="font-display text-[clamp(2.25rem,5.5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-[#1C1917]">
        Free Resume Builder for QA & SDET
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
        Build an ATS-ready resume for Quality Assurance, SDET, and Test Automation careers. Pick
        focused sections, refine with a live preview, and download a professional PDF — free with
        Route2Hire.
      </p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-[#6B5A48]">
        <li className="inline-flex items-center gap-1.5">
          <LayoutTemplate className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
          Up to 7 sections
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
          Live preview
        </li>
        <li className="inline-flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5 text-[#C4A574]" aria-hidden />
          PDF export
        </li>
      </ul>
    </header>
  );
}

function ResumeSeoGuide() {
  const faqs = [
    {
      q: 'Is this resume builder free?',
      a: 'Yes. Route2Hire’s resume builder is free to use for creating, editing, and downloading ATS-friendly PDFs for QA and SDET applications.',
    },
    {
      q: 'What makes a strong QA or SDET resume?',
      a: 'Lead with clear contact details, highlight testing tools and automation skills, quantify impact in work experience, and keep the layout simple so applicant tracking systems can parse it reliably.',
    },
    {
      q: 'Can I customize sections for different job applications?',
      a: 'Yes. Create multiple drafts, choose up to seven sections per resume, and use the optional AI skill extractor with a job description when Technical Skills is included.',
    },
  ];

  return (
    <section className="mt-16 border-t border-[#E5DCCE] pt-12" aria-labelledby="resume-guide-heading">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2
            id="resume-guide-heading"
            className="font-display text-2xl font-semibold text-[#1C1917] sm:text-3xl"
          >
            How to build an ATS-friendly QA resume
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#57534E] sm:text-base">
            Recruiters and ATS software prefer clean structure over dense design. Use Route2Hire to
            assemble a focused one-page resume for software testing roles — then iterate as you
            apply to new SDET and automation openings.
          </p>
          <ol className="mt-6 space-y-3 text-sm text-[#57534E]">
            <li className="flex gap-3">
              <span className="font-display tabular-nums text-[#C4A574]">01</span>
              <span>
                <strong className="font-medium text-[#1C1917]">Start with Header</strong> — name,
                email, phone, and LinkedIn or portfolio links.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-display tabular-nums text-[#C4A574]">02</span>
              <span>
                <strong className="font-medium text-[#1C1917]">Add skills & experience</strong> —
                Selenium, Playwright, API testing, CI tools, and measurable outcomes.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-display tabular-nums text-[#C4A574]">03</span>
              <span>
                <strong className="font-medium text-[#1C1917]">Preview and export</strong> — review
                the live paper view, then download a PDF for each application.
              </span>
            </li>
          </ol>
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-[#1C1917]">FAQ</h3>
          <dl className="mt-4 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="border-b border-[#E5DCCE] pb-4 last:border-b-0 last:pb-0">
                <dt className="text-sm font-medium text-[#1C1917]">{item.q}</dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-[#57534E]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function EmptyLibrary({ onCreate }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-6 py-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-[#C4A574]" />
      <h2 className="font-display mt-4 text-xl font-semibold text-[#1C1917]">No resumes yet</h2>
      <p className="mt-2 text-sm text-[#57534E]">
        Create your first ATS-friendly draft — it only takes a minute to pick sections.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
      >
        <Plus className="h-4 w-4" />
        Create resume
      </button>
    </div>
  );
}

function GuestGate() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className="mx-auto max-w-xl space-y-8 text-center"
    >
      <div className="border-t border-[#E5DCCE] pt-10">
        <h2 className="font-display text-2xl font-semibold text-[#1C1917] sm:text-3xl">
          Sign in to open the resume builder
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#57534E] sm:text-base">
          Your drafts sync to your Route2Hire account so you can refine and re-export whenever you
          need a fresh PDF for the next QA or SDET application.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/sign-in?redirect=/resume-builder"
            className={`inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
          <Link
            to="/sign-up?redirect=/resume-builder"
            className={`inline-flex items-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-5 py-3 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export default ResumeBuilder;
