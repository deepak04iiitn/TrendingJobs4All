import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import InterviewCommentSection from '../components/InterviewCommentSection';
import RelatedLinks from '../components/RelatedLinks';
import slugify from '../utils/slugify';
import { focusRing } from '../theme/tokens';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  X,
  Image as ImageIcon,
  BookOpen,
  ArrowUpDown,
  Layers,
  Hash,
} from 'lucide-react';

const emptyForm = () => ({
  topic: '',
  description: '',
  questions: [{ question: '', answer: '', images: [] }],
});

export default function InterviewQuestions() {
  const { currentUser } = useSelector((state) => state.user);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { topicSlug, questionId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [sidePanel, setSidePanel] = useState({ open: false, mode: 'create' });
  const [formData, setFormData] = useState(emptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [imagesFilesByIndex, setImagesFilesByIndex] = useState({});
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const selectedQuestion = questions.find((q) => q._id === selectedTopic);

  const openImageModal = (images, startIndex) => {
    setImageModal({ open: true, images, index: startIndex });
  };

  const closeImageModal = () => {
    setImageModal((prev) => ({ ...prev, open: false }));
  };

  const showPrevImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const showNextImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }));
  };

  const openAdminPanel = (mode = 'create') => {
    setSidePanel({ open: true, mode });
  };

  const closeAdminPanel = () => {
    setSidePanel((prev) => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setImagesFilesByIndex({});
    setIsEditing(false);
    setEditQuestionId(null);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (sortBy) params.append('sort', sortBy);
        if (sortOrder) params.append('order', sortOrder);

        const res = await axios.get(`/backend/interview-questions/get?${params.toString()}`);
        setQuestions(res.data);

        const uniqueTopics = [...new Set(res.data.map((q) => q.topic))];
        setTopics(uniqueTopics);

        if (topicSlug) {
          const questionBySlug = res.data.find((q) => slugify(q.topic) === topicSlug);
          if (questionBySlug) {
            const candidate = questionId
              ? res.data.find((q) => q._id === questionId) || questionBySlug
              : questionBySlug;
            setSelectedTopic(candidate._id);
            if (!questionId) {
              navigate(`/interview-questions/${slugify(candidate.topic)}/${candidate._id}`, {
                replace: true,
              });
            }
          } else if (res.data.length > 0) {
            const first = res.data[0];
            setSelectedTopic(first._id);
            navigate(`/interview-questions/${slugify(first.topic)}/${first._id}`, { replace: true });
          }
        } else if (res.data.length > 0) {
          const first = res.data[0];
          setSelectedTopic(first._id);
          navigate(`/interview-questions/${slugify(first.topic)}/${first._id}`, { replace: true });
        }

        setError(false);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, [searchTerm, sortBy, sortOrder, topicSlug, questionId, navigate]);

  useEffect(() => {
    setExpandedAnswers({});
  }, [selectedTopic]);

  useEffect(() => {
    const isOverlayOpen = isTopicsOpen || sidePanel.open || imageModal.open;
    if (!isOverlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTopicsOpen, sidePanel.open, imageModal.open]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsTopicsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!imageModal.open) return;
      if (e.key === 'Escape') closeImageModal();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageModal.open]);

  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return topics;
    return topics.filter((topic) => {
      const match = questions.find((q) => q.topic === topic);
      if (!match) return false;
      return (
        topic.toLowerCase().includes(term) ||
        (match.description || '').toLowerCase().includes(term) ||
        match.questions?.some(
          (qa) =>
            (qa.question || '').toLowerCase().includes(term) ||
            (qa.answer || '').toLowerCase().includes(term)
        )
      );
    });
  }, [topics, questions, searchTerm]);

  const topicMeta = useMemo(() => {
    return filteredTopics.map((topic) => {
      const set = questions.find((q) => q.topic === topic);
      return {
        topic,
        id: set?._id,
        count: set?.questions?.length || 0,
        likes: set?.numberOfLikes || 0,
      };
    });
  }, [filteredTopics, questions]);

  const handleSelectTopic = useCallback(
    (topic) => {
      const question = questions.find((q) => q.topic === topic);
      if (!question) return;
      setSelectedTopic(question._id);
      navigate(`/interview-questions/${slugify(question.topic)}/${question._id}`);
      setIsTopicsOpen(false);
    },
    [questions, navigate]
  );

  const toggleAnswer = (index) => {
    setExpandedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLike = async (id) => {
    if (!currentUser) {
      toast.error('Please sign in to like questions');
      return;
    }
    try {
      const res = await axios.post(`/backend/interview-questions/like/${id}`);
      setQuestions((prev) => prev.map((q) => (q._id === id ? res.data : q)));
    } catch (err) {
      console.error('Error liking question:', err);
      toast.error('Failed to like question');
    }
  };

  const handleDislike = async (id) => {
    if (!currentUser) {
      toast.error('Please sign in to dislike questions');
      return;
    }
    try {
      const res = await axios.post(`/backend/interview-questions/dislike/${id}`);
      setQuestions((prev) => prev.map((q) => (q._id === id ? res.data : q)));
    } catch (err) {
      console.error('Error disliking question:', err);
      toast.error('Failed to dislike question');
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', answer: '', images: [] }],
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
    setImagesFilesByIndex((prev) => {
      const copy = { ...prev };
      delete copy[index];
      const reindexed = {};
      Object.keys(copy).forEach((key) => {
        const oldIndex = parseInt(key, 10);
        if (oldIndex > index) reindexed[oldIndex - 1] = copy[key];
        else reindexed[key] = copy[key];
      });
      return reindexed;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const next = [...formData.questions];
    next[index][field] = value;
    setFormData({ ...formData, questions: next });
  };

  const handleImagesChange = (index, files) => {
    setImagesFilesByIndex((prev) => ({ ...prev, [index]: Array.from(files || []) }));
  };

  const handleRemoveExistingImage = (questionIndex, imageIndex) => {
    const next = [...formData.questions];
    next[questionIndex].images = next[questionIndex].images.filter((_, idx) => idx !== imageIndex);
    setFormData({ ...formData, questions: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const processedQuestions = formData.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        images: q.images || [],
      }));

      const payload = new FormData();
      payload.append('topic', formData.topic);
      payload.append('description', formData.description);
      payload.append('questions', JSON.stringify(processedQuestions));
      Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
        files.forEach((file) => payload.append(`images_${idx}`, file));
      });

      let res;
      if (isEditing) {
        res = await axios.post(`/backend/interview-questions/update/${editQuestionId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions((prev) => prev.map((q) => (q._id === editQuestionId ? res.data : q)));
        toast.success('Question set updated successfully!');
      } else {
        res = await axios.post('/backend/interview-questions/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions((prev) => [...prev, res.data]);
        toast.success('Question set created successfully!');
      }

      closeAdminPanel();
      resetForm();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} question set:`, err);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} question set`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setFormData({
      topic: question.topic,
      description: question.description,
      questions: question.questions.map((q) => ({
        question: q.question,
        answer: q.answer,
        images: q.images || [],
      })),
    });
    setEditQuestionId(question._id);
    setIsEditing(true);
    setImagesFilesByIndex({});
    openAdminPanel('edit');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/backend/interview-questions/delete/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success('Question set deleted successfully!');
    } catch (err) {
      console.error('Error deleting question set:', err);
      toast.error('Failed to delete question set');
    }
  };

  const startCreate = () => {
    resetForm();
    openAdminPanel('create');
  };

  const canonicalUrl = selectedQuestion
    ? `https://route2hire.com/interview-questions/${slugify(selectedQuestion.topic)}/${selectedQuestion._id}`
    : 'https://route2hire.com/interview-questions';

  const topicIndex = (variant = 'desktop') => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#E5DCCE] bg-[#F7F3EC] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">Syllabus</p>
            <h2 className="font-display mt-0.5 text-lg font-semibold text-[#1C1917]">Topic index</h2>
            <p className="mt-0.5 text-[11px] text-[#78716C]">
              {topicMeta.length} topic{topicMeta.length === 1 ? '' : 's'} ready to practice
            </p>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsTopicsOpen(false)}
              aria-label="Close topics list"
              className={`shrink-0 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="relative mt-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics or questions…"
            aria-label="Search interview topics"
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-8 pr-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
          />
        </label>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              aria-label="Sort topics"
              className={`w-full appearance-none rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-8 pr-3 text-xs font-medium text-[#6B5A48] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="numberOfLikes-desc">Most liked</option>
              <option value="topic-asc">Topic A–Z</option>
              <option value="topic-desc">Topic Z–A</option>
            </select>
          </div>
          {currentUser?.isUserAdmin && (
            <button
              type="button"
              onClick={startCreate}
              className={`inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#2C241B] bg-[#2C241B] px-3 py-2 text-xs font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add
            </button>
          )}
        </div>
      </div>

      <div className="r2h-scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5">
        {topicMeta.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-[#78716C]">No topics match your search.</p>
        ) : (
          <ul className="space-y-1">
            {topicMeta.map((item, index) => {
              const isActive = selectedQuestion?.topic === item.topic;
              return (
                <li key={item.topic}>
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(item.topic)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${focusRing} ${
                      isActive
                        ? 'bg-[#EFE8DC] ring-1 ring-[#E5DCCE]'
                        : 'hover:bg-[#F7F3EC]'
                    }`}
                  >
                    <span
                      className={`font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${
                        isActive
                          ? 'bg-[#2C241B] text-[#FFFDF8]'
                          : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#C4A574]'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-[#1C1917]">
                        {item.topic}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-[#78716C]">
                        <span className="inline-flex items-center gap-0.5">
                          <Hash className="h-3 w-3" aria-hidden />
                          {item.count} Qs
                        </span>
                        {item.likes > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[#C4A574]">
                            <ThumbsUp className="h-3 w-3" aria-hidden />
                            {item.likes}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 transition ${
                        isActive ? 'text-[#6B5A48]' : 'text-[#D8CDBB] group-hover:text-[#78716C]'
                      }`}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
          <p className="text-sm font-medium text-[#6B5A48]">Loading interview questions…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {selectedQuestion?.topic
            ? `${selectedQuestion.topic} Interview Questions | QA, SDET & Test Automation - Route2Hire`
            : 'Interview Questions | QA, SDET, Test Automation & Software Testing - Route2Hire'}
        </title>
        <meta
          name="description"
          content={
            selectedQuestion?.topic
              ? `Practice ${selectedQuestion.topic} interview questions for QA, SDET, and Test Automation roles. Get expert answers, tips, and insights to ace your software testing interviews on Route2Hire.`
              : 'Master QA, SDET, Test Automation, and Software Testing interviews with comprehensive question banks. Practice with real interview questions, expert answers, and community insights on Route2Hire.'
          }
        />
        <meta
          name="keywords"
          content={
            selectedQuestion?.topic
              ? `${selectedQuestion.topic} interview questions, QA interview prep, SDET interview, Test Automation questions, Software Testing interview, ${selectedQuestion.topic} QA, Quality Assurance interview`
              : 'QA interview questions, SDET interview prep, Test Automation questions, Software Testing interview, Quality Assurance interview, Test Engineering questions, QA interview tips'
          }
        />
        <meta
          property="og:title"
          content={
            selectedQuestion?.topic
              ? `${selectedQuestion.topic} Interview Questions | Route2Hire`
              : 'Interview Questions | Route2Hire'
          }
        />
        <meta
          property="og:description"
          content={
            selectedQuestion?.topic
              ? `Practice ${selectedQuestion.topic} interview questions for QA, SDET, and Test Automation roles. Expert answers and tips on Route2Hire.`
              : 'Master QA, SDET, and Test Automation interviews with comprehensive question banks and expert answers on Route2Hire platform.'
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="relative min-h-screen bg-[#F7F3EC] pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(196,165,116,0.12),_transparent_60%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl border-b border-[#E5DCCE] pb-8"
          >
            <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
              QA, SDET &amp; test automation question bank
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base">
              Real interview questions organised by topic — with model answers you can reveal one at a
              time. Browse the syllabus, jump into a set, and practise until the patterns feel familiar.
            </p>
          </motion.header>

          {/* Mobile topic picker trigger */}
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsTopicsOpen(true)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3.5 text-left shadow-[0_2px_12px_-6px_rgba(44,36,27,0.1)] transition hover:bg-[#F7F3EC] ${focusRing}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                  <Layers className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#2C241B]">Browse topics</span>
                  <span className="block truncate text-xs text-[#78716C]">
                    {selectedQuestion?.topic || `${topicMeta.length} topics available`}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C]" aria-hidden />
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            {/* Desktop syllabus rail */}
            <aside className="hidden lg:sticky lg:top-28 lg:flex lg:h-[min(max(640px,calc(100vh-6rem)),960px)] lg:w-full lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-[#E5DCCE] lg:bg-[#FFFDF8] lg:shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]">
              {topicIndex('desktop')}
            </aside>

            {/* Practice sheet */}
            <section className="min-w-0">
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
                  <p className="font-display text-2xl text-rose-800">Something went wrong</p>
                  <p className="mt-2 text-sm text-rose-700">Please refresh the page and try again.</p>
                </div>
              ) : selectedQuestion ? (
                <motion.article
                  key={selectedQuestion._id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]"
                >
                  {/* Sheet header — editorial, not gradient hero */}
                  <header className="border-b border-[#E5DCCE] px-5 py-6 sm:px-8 sm:py-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[#6B5A48]">
                          <BookOpen className="h-3.5 w-3.5" aria-hidden />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                            Topic set · {selectedQuestion.questions?.length || 0} questions
                          </p>
                        </div>
                        <h2 className="font-display mt-2 text-[clamp(1.55rem,3.2vw,2.45rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
                          {selectedQuestion.topic}
                        </h2>
                        {selectedQuestion.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#57534E]">
                            {selectedQuestion.description}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {currentUser?.isUserAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(selectedQuestion)}
                              aria-label="Edit question set"
                              className={`rounded-full border border-[#E5DCCE] bg-[#F7F3EC] p-2.5 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(selectedQuestion._id)}
                              aria-label="Delete question set"
                              className={`rounded-full border border-[#E5DCCE] bg-[#F7F3EC] p-2.5 text-[#6B5A48] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 ${focusRing}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleLike(selectedQuestion._id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${focusRing} ${
                            selectedQuestion.likes?.includes(currentUser?._id)
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48] hover:bg-[#EFE8DC]'
                          }`}
                        >
                          <ThumbsUp
                            className={`h-4 w-4 ${
                              selectedQuestion.likes?.includes(currentUser?._id) ? 'fill-current' : ''
                            }`}
                          />
                          {selectedQuestion.numberOfLikes || 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDislike(selectedQuestion._id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${focusRing} ${
                            selectedQuestion.dislikes?.includes(currentUser?._id)
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48] hover:bg-[#EFE8DC]'
                          }`}
                        >
                          <ThumbsDown
                            className={`h-4 w-4 ${
                              selectedQuestion.dislikes?.includes(currentUser?._id) ? 'fill-current' : ''
                            }`}
                          />
                          {selectedQuestion.numberOfDislikes || 0}
                        </button>
                      </div>
                    </div>
                  </header>

                  {/* Exam-style Q&A list */}
                  <div className="divide-y divide-[#E5DCCE]">
                    {(selectedQuestion.questions || []).map((qa, index) => {
                      const isOpen = !!expandedAnswers[index];
                      return (
                        <div key={index} className="px-5 py-5 sm:px-8 sm:py-6">
                          <button
                            type="button"
                            onClick={() => toggleAnswer(index)}
                            className={`group flex w-full items-start gap-4 text-left ${focusRing} rounded-xl`}
                            aria-expanded={isOpen}
                          >
                            <span
                              className={`font-display mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition ${
                                isOpen
                                  ? 'bg-[#2C241B] text-[#FFFDF8]'
                                  : 'border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574] group-hover:border-[#C4A574]/50'
                              }`}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1 pt-1.5">
                              <span className="block text-[15px] font-medium leading-snug text-[#1C1917] sm:text-base">
                                {qa.question}
                              </span>
                              <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                                {isOpen ? 'Hide answer' : 'Reveal answer'}
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
                                  aria-hidden
                                />
                              </span>
                            </span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="ml-0 mt-4 border-l-2 border-[#C4A574]/50 pl-4 sm:ml-14 sm:pl-5">
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                                    Model answer
                                  </p>
                                  <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#2C241B] sm:text-[15px]">
                                    {qa.answer}
                                  </div>

                                  {Array.isArray(qa.images) && qa.images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                      {qa.images.map((imgUrl, imgIdx) => (
                                        <button
                                          type="button"
                                          key={imgIdx}
                                          onClick={() => openImageModal(qa.images, imgIdx)}
                                          className={`group relative overflow-hidden rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] ${focusRing}`}
                                          aria-label={`Open image ${imgIdx + 1}`}
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={`Answer illustration ${imgIdx + 1}`}
                                            className="h-36 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-40"
                                            loading="lazy"
                                          />
                                          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8]/95 px-2 py-1 text-[10px] font-semibold text-[#6B5A48]">
                                            <ImageIcon className="h-3 w-3" aria-hidden />
                                            View
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E5DCCE] px-5 py-7 sm:px-8 sm:py-8">
                    <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-[#1C1917]">
                      <MessageCircle className="h-5 w-5 text-[#C4A574]" aria-hidden />
                      Discussion
                    </h3>
                    <p className="mt-1 text-sm text-[#78716C]">
                      Share alternate answers, clarifications, or follow-up tips for this topic.
                    </p>
                    <div className="mt-5">
                      <InterviewCommentSection expId={selectedQuestion._id} />
                    </div>
                  </div>
                </motion.article>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
                  <p className="font-display text-2xl text-[#1C1917]">Select a topic</p>
                  <p className="mt-2 text-sm text-[#78716C]">
                    Choose a topic from the syllabus to open its practice sheet.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-14">
            <RelatedLinks type="interview" />
          </div>
        </div>
      </div>

      {/* Mobile topics bottom sheet */}
      <AnimatePresence>
        {isTopicsOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTopicsOpen(false)}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 lg:hidden"
              aria-label="Close topics list backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[2147483647] flex h-[min(85vh,640px)] flex-col overflow-hidden rounded-t-3xl border-t border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_-10px_30px_rgba(44,36,27,0.18)] lg:hidden"
            >
              <div className="flex shrink-0 justify-center bg-[#F7F3EC] pt-3">
                <span className="h-1.5 w-10 rounded-full bg-[#E5DCCE]" aria-hidden />
              </div>
              {topicIndex('mobile')}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Admin create/edit sliding panel */}
      <AnimatePresence>
        {sidePanel.open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAdminPanel}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/35"
              aria-label="Close admin panel backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[2147483647] h-full w-full max-w-[520px] border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_0_0_1px_rgba(229,220,206,0.5),_-10px_0_30px_rgba(44,36,27,0.12)]"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-[#E5DCCE] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-3xl text-[#1C1917]">
                      {isEditing ? 'Edit set' : 'New set'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeAdminPanel}
                      className={`rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                      aria-label="Close admin panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    {isEditing
                      ? 'Update this topic’s questions, answers, and images.'
                      : 'Create a topic set with interview questions and model answers.'}
                  </p>
                </div>

                <div className="r2h-scroll-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <form id="iq-admin-form" className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        Topic
                      </p>
                      <div className="h-px bg-[#E5DCCE]" />
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        Name
                      </span>
                      <input
                        required
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        Description
                      </span>
                      <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                      />
                    </label>

                    <div className="space-y-3 pt-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        Questions
                      </p>
                      <div className="h-px bg-[#E5DCCE]" />
                    </div>

                    <div className="space-y-4">
                      {formData.questions.map((qa, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/60 p-3.5"
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <span className="font-display text-sm font-semibold text-[#C4A574]">
                              Q{String(index + 1).padStart(2, '0')}
                            </span>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(index)}
                                className={`rounded-lg p-1.5 text-[#6B5A48] transition hover:bg-rose-50 hover:text-rose-700 ${focusRing}`}
                                aria-label="Remove question"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            required
                            value={qa.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            placeholder="Question…"
                            className={`mb-2 w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                          />
                          <textarea
                            required
                            rows={5}
                            value={qa.answer}
                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                            placeholder="Model answer…"
                            className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                          />

                          {qa.images?.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {qa.images.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="group relative">
                                  <img
                                    src={imgUrl}
                                    alt={`Current ${imgIdx + 1}`}
                                    className="h-16 w-full rounded-lg border border-[#E5DCCE] object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(index, imgIdx)}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white opacity-0 transition group-hover:opacity-100"
                                    aria-label="Remove image"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <label className="mt-3 block">
                            <span className="mb-1 block text-[11px] font-medium text-[#78716C]">
                              {isEditing ? 'Add images (optional)' : 'Attach images (optional)'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImagesChange(index, e.target.files)}
                              className="block w-full text-xs text-[#6B5A48] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EFE8DC] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#2C241B]"
                            />
                            {imagesFilesByIndex[index]?.length ? (
                              <p className="mt-1 text-[11px] text-[#78716C]">
                                {imagesFilesByIndex[index].length} new image(s) selected
                              </p>
                            ) : null}
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                      Add another question
                    </button>
                  </form>
                </div>

                <div className="border-t border-[#E5DCCE] px-5 py-4 sm:px-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeAdminPanel();
                        resetForm();
                      }}
                      className={`flex-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="iq-admin-form"
                      disabled={isSubmitting}
                      className={`flex-1 rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                    >
                      {isSubmitting
                        ? isEditing
                          ? 'Updating…'
                          : 'Creating…'
                        : isEditing
                          ? 'Update set'
                          : 'Create set'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Image lightbox */}
      <AnimatePresence>
        {imageModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#2C241B]/80 p-3 sm:p-6"
            onClick={closeImageModal}
          >
            <div
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={showPrevImage}
                className={`absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#2C241B] shadow-lg sm:left-2 ${focusRing}`}
                aria-label="Previous image"
              >
                ‹
              </button>
              <img
                src={imageModal.images[imageModal.index]}
                alt={`Preview ${imageModal.index + 1}`}
                className="max-h-[75vh] w-full rounded-2xl border border-[#E5DCCE] object-contain bg-[#1A1510]"
              />
              <button
                type="button"
                onClick={showNextImage}
                className={`absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#2C241B] shadow-lg sm:right-2 ${focusRing}`}
                aria-label="Next image"
              >
                ›
              </button>
              <button
                type="button"
                onClick={closeImageModal}
                className={`absolute right-2 top-2 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] ${focusRing}`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-[#EFE8DC]">
                {imageModal.index + 1} / {imageModal.images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
