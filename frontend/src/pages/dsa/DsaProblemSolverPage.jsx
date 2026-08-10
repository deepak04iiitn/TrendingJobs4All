import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Play,
  Send,
  Star,
  ChevronDown,
  Loader2,
  Timer as TimerIcon,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  ChevronRight,
  X,
  Code2,
  EyeOff,
  NotebookPen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { focusRing } from '../../theme/tokens';
import useDsaTimer, { formatElapsed } from '../../hooks/useDsaTimer';
import DsaMarkdown from '../../components/dsa/DsaMarkdown';
import DsaJudgeResults from '../../components/dsa/DsaJudgeResults';
import DsaDiscussionPanel from '../../components/dsa/DsaDiscussionPanel';
import DsaJudgeQuotaModal, {
  isJudgeQuotaFailure,
} from '../../components/dsa/DsaJudgeQuotaModal';
import {
  fetchDsaProblem,
  updateDsaProgress,
  runDsaCodeStream,
  submitDsaCodeStream,
  fetchDsaSubmissions,
} from '../../lib/dsa-api';

const TABS = ['Description', 'Results', 'Hints', 'Discussion', 'Solutions', 'Submissions'];

const EDITOR_IO_HINT =
  'Your code should take the given input, solve the problem, and print only the answer. Follow the Input and Output format below.';

function CodingHint({ visible, onDismiss }) {
  if (!visible) return null;

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3.5 py-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F7F3EC] text-[#C4A574]">
        <Lightbulb size={14} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#2C241B]">How to write your code</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#57534E]">{EDITOR_IO_HINT}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className={`shrink-0 rounded-md p-1 text-[#A89B8A] transition hover:bg-[#F7F3EC] hover:text-[#2C241B] ${focusRing}`}
        aria-label="Dismiss coding hint"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function TimerWidget({ timer }) {
  if (timer.status === 'idle') {
    return (
      <button
        type="button"
        onClick={timer.start}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCE] px-3 py-1.5 text-xs font-semibold text-[#2C241B] hover:bg-[#F7F3EC] ${focusRing}`}
      >
        <TimerIcon size={14} className="text-[#C4A574]" /> Start solving
      </button>
    );
  }
  if (timer.status === 'stopped') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} /> Solved in {formatElapsed(timer.elapsedMs)}
      </span>
    );
  }
  const paused = timer.status === 'paused';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums ${
        paused ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#2C241B]'
      }`}
      title={paused ? 'Paused while tab is inactive' : 'Solving in progress'}
    >
      <TimerIcon size={14} className={paused ? '' : 'animate-pulse text-[#C4A574]'} />
      {formatElapsed(timer.elapsedMs)}
      {paused && ' · paused'}
    </span>
  );
}

const LANG_MONACO = {
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  csharp: 'csharp',
  ruby: 'ruby',
};

const LANG_LABELS = {
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
  csharp: 'C#',
  ruby: 'Ruby',
};

const langLabel = (id) => LANG_LABELS[id] || id;

const EDITOR_OPTIONS = {
  fontSize: 13,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  readOnly: false,
  domReadOnly: false,
  contextmenu: true,
};

const emptyJudge = () => ({
  mode: null,
  running: false,
  totalCount: 0,
  passedCount: 0,
  failedCount: 0,
  doneCount: 0,
  cases: [],
  result: null,
});

/** Isolated so the solve-timer tick (250ms) doesn't re-render Monaco. */
const DsaCodeEditor = memo(function DsaCodeEditor({
  editorKey,
  defaultValue,
  language,
  height,
  onMount,
}) {
  return (
    <Editor
      key={editorKey}
      height={height}
      theme="vs-dark"
      language={LANG_MONACO[language] || 'javascript'}
      defaultValue={defaultValue}
      onMount={onMount}
      options={EDITOR_OPTIONS}
    />
  );
});

export default function DsaProblemSolverPage() {
  const { slug } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const timer = useDsaTimer(`dsa-timer:${currentUser?._id || 'anon'}:${slug}`);
  const [problem, setProblem] = useState(null);
  const [tab, setTab] = useState('Description');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [runBusy, setRunBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [judge, setJudge] = useState(emptyJudge);
  const [submissions, setSubmissions] = useState([]);
  const [revealedHints, setRevealedHints] = useState(1);
  const [rawIoOpen, setRawIoOpen] = useState({});
  const [copiedSolution, setCopiedSolution] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [showSolWarn, setShowSolWarn] = useState(false);
  const [solutionsAck, setSolutionsAck] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesBusy, setNotesBusy] = useState(false);
  const [ioHintVisible, setIoHintVisible] = useState(true);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [editorNonce, setEditorNonce] = useState(0);
  const [editorOverride, setEditorOverride] = useState(null);
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = Number(localStorage.getItem('dsa-split') || 46);
    return Number.isFinite(saved) ? Math.min(70, Math.max(28, saved)) : 46;
  });
  const dragging = useRef(false);
  const editorRef = useRef(null);
  const lastRunRef = useRef(null); // { code, language, caseResults }
  const anyBusy = runBusy || submitBusy;

  const getEditorCode = () => editorRef.current?.getValue?.() ?? code;

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const editorStarter = editorOverride ?? problem?.starterCode?.[language] ?? code ?? '';
  const editorKey = `${slug}:${language}:${editorNonce}`;

  const loadCodeIntoEditor = (src, lang) => {
    if (lang && lang !== language) setLanguage(lang);
    setEditorOverride(src);
    setCode(src);
    setEditorNonce((n) => n + 1);
    setViewingSubmission(null);
    toast.success('Loaded into editor');
  };

  const selectTab = (t) => {
    if (t === 'Solutions' && !solutionsAck) {
      setShowSolWarn(true);
      return;
    }
    setTab(t);
  };

  const load = useCallback(async () => {
    const data = await fetchDsaProblem(slug);
    setProblem(data);
    const starter = data.starterCode?.[language] || data.starterCode?.python || '';
    setCode(starter);
    const [subs] = await Promise.all([fetchDsaSubmissions(slug)]);
    setSubmissions(subs.submissions || []);
  }, [slug, language]);

  useEffect(() => {
    load().catch((e) => {
      console.error(e);
      toast.error('Failed to load problem');
    });
    setRevealedHints(1);
    setRawIoOpen({});
    setJudge(emptyJudge());
    setViewingSubmission(null);
    setShowSolWarn(false);
    setSolutionsAck(sessionStorage.getItem(`dsa-sol-ack:${slug}`) === '1');
    setEditorOverride(null);
    setEditorNonce((n) => n + 1);
    setIoHintVisible(true);
    lastRunRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!problem) return;
    setEditorOverride(null);
    setCode(problem.starterCode?.[language] || '');
    setEditorNonce((n) => n + 1);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      const next = Math.min(70, Math.max(28, pct));
      setLeftWidth(next);
      localStorage.setItem('dsa-split', String(next));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const languages = problem?.languages || Object.keys(LANG_MONACO);

  const onFavorite = async () => {
    try {
      await updateDsaProgress(slug, { isFavorite: !problem.isFavorite });
      setProblem((p) => ({ ...p, isFavorite: !p.isFavorite }));
    } catch {
      toast.error('Could not update favorite');
    }
  };

  const openNotes = () => {
    setNotesDraft(problem?.notes || '');
    setNotesOpen(true);
  };

  const saveNotes = async () => {
    setNotesBusy(true);
    try {
      await updateDsaProgress(slug, { notes: notesDraft });
      setProblem((p) => ({ ...p, notes: notesDraft }));
      setNotesOpen(false);
      toast.success(notesDraft.trim() ? 'Notes saved' : 'Notes cleared');
    } catch {
      toast.error('Could not save notes');
    } finally {
      setNotesBusy(false);
    }
  };

  const dismissIoHint = () => {
    setIoHintVisible(false);
  };

  const beginJudge = (mode) => {
    setTab('Results');
    setJudge({
      mode,
      running: true,
      totalCount: 0,
      passedCount: 0,
      failedCount: 0,
      doneCount: 0,
      cases: [],
      result: null,
    });
  };

  const streamHandlers = {
    onStart: (evt) => {
      setJudge((j) => ({
        ...j,
        totalCount: evt.totalCount || 0,
        running: true,
      }));
    },
    onCase: (evt) => {
      setJudge((j) => {
        const nextCases = [...j.cases];
        const idx = nextCases.findIndex((c) => c.index === evt.case?.index);
        if (idx >= 0) nextCases[idx] = evt.case;
        else nextCases.push(evt.case);
        return {
          ...j,
          cases: nextCases,
          passedCount: evt.passedCount ?? j.passedCount,
          failedCount: evt.failedCount ?? j.failedCount,
          doneCount: evt.doneCount ?? j.doneCount,
          totalCount: evt.totalCount ?? j.totalCount,
        };
      });
    },
    onDone: (result) => {
      setJudge((j) => ({
        ...j,
        running: false,
        result,
        passedCount: result.passedCount,
        failedCount: result.failedCount ?? result.totalCount - result.passedCount,
        doneCount: result.totalCount,
        totalCount: result.totalCount,
        cases: result.caseResults || j.cases,
      }));
    },
  };

  const onRun = async () => {
    if (anyBusy) return;
    const source = getEditorCode();
    setCode(source);
    setRunBusy(true);
    beginJudge('run');
    try {
      const res = await runDsaCodeStream(
        slug,
        { language, code: source, elapsedMs: timer.elapsedMs },
        streamHandlers
      );
      lastRunRef.current = {
        code: source,
        language,
        caseResults: res.caseResults || [],
      };
      if (res.status === 'Accepted') toast.success('All sample tests passed');
      else toast.error(`${res.passedCount}/${res.totalCount} samples passed`);
    } catch (e) {
      setJudge((j) => ({ ...j, running: false }));
      if (isJudgeQuotaFailure(e)) setQuotaModalOpen(true);
      else toast.error(e?.message || 'Run failed');
    } finally {
      setRunBusy(false);
    }
  };

  const onSubmit = async () => {
    if (anyBusy) return;
    const source = getEditorCode();
    setCode(source);
    setSubmitBusy(true);
    beginJudge('submit');
    const prior =
      lastRunRef.current &&
      lastRunRef.current.code === source &&
      lastRunRef.current.language === language
        ? (lastRunRef.current.caseResults || []).filter((c) => c.isSample)
        : undefined;
    try {
      const res = await submitDsaCodeStream(
        slug,
        {
          language,
          code: source,
          elapsedMs: timer.elapsedMs,
          priorCaseResults: prior,
        },
        streamHandlers
      );
      if (res.status === 'Accepted') {
        toast.success(`Accepted · ${res.passedCount}/${res.totalCount}`);
        setProblem((p) => ({ ...p, status: 'solved' }));
        timer.stop();
      } else {
        toast.error(
          `${res.passedCount} passed · ${res.failedCount ?? res.totalCount - res.passedCount} failed`
        );
      }
      const subs = await fetchDsaSubmissions(slug);
      setSubmissions(subs.submissions || []);
    } catch (e) {
      setJudge((j) => ({ ...j, running: false }));
      if (isJudgeQuotaFailure(e)) setQuotaModalOpen(true);
      else toast.error(e?.message || 'Submit failed');
    } finally {
      setSubmitBusy(false);
    }
  };

  const copySolutionCode = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopiedSolution(key);
      setTimeout(() => setCopiedSolution((k) => (k === key ? null : k)), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const leftPanel = useMemo(() => {
    if (!problem) return null;
    if (tab === 'Discussion') {
      return (
        <DsaDiscussionPanel
          slug={slug}
          languages={Object.keys(problem.starterCode || {}).length
            ? Object.keys(problem.starterCode)
            : undefined}
        />
      );
    }
    if (tab === 'Results') {
      if (!judge.mode && !judge.result) {
        return (
          <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#F7F3EC]/50 px-5 py-10 text-center">
            <p className="font-display text-lg font-semibold text-[#1C1917]">No results yet</p>
            <p className="mt-2 text-sm text-[#78716C]">
              Run sample tests or submit to see live progress here.
            </p>
          </div>
        );
      }
      return <DsaJudgeResults {...judge} />;
    }
    if (tab === 'Hints') {
      const hints = problem.hints || [];
      return (
        <div className="space-y-3">
          <ol className="space-y-3">
            {hints.slice(0, revealedHints).map((h) => (
              <li key={h.order} className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-3 text-sm text-[#57534E]">
                <span className="font-semibold text-[#C4A574]">Hint {h.order}. </span>
                {h.text}
              </li>
            ))}
          </ol>
          {revealedHints < hints.length ? (
            <button
              type="button"
              onClick={() => setRevealedHints((n) => n + 1)}
              className={`inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCE] px-3 py-1.5 text-xs font-semibold text-[#2C241B] hover:bg-[#F7F3EC] ${focusRing}`}
            >
              <Lightbulb size={14} className="text-[#C4A574]" />
              Show next hint ({revealedHints}/{hints.length})
            </button>
          ) : (
            hints.length > 0 && <p className="text-xs text-[#78716C]">That's all the hints for this problem.</p>
          )}
          {!hints.length && <p className="text-sm text-[#78716C]">No hints for this problem.</p>}
        </div>
      );
    }
    if (tab === 'Solutions') {
      return (
        <div className="space-y-4">
          {(problem.solutions || []).map((s, i) => (
            <div key={i} className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5A48]">{s.language}</p>
                {!s.locked && s.code && (
                  <button
                    type="button"
                    onClick={() => copySolutionCode(s.code, i)}
                    className={`inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2 py-1 text-[11px] font-medium text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
                  >
                    {copiedSolution === i ? <Check size={12} /> : <Copy size={12} />}
                    {copiedSolution === i ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              {s.approach && <DsaMarkdown className="mt-1">{s.approach}</DsaMarkdown>}
              {(s.timeComplexity || s.spaceComplexity) && (
                <p className="mt-1 text-xs text-[#78716C]">
                  Time {s.timeComplexity || '—'} · Space {s.spaceComplexity || '—'}
                </p>
              )}
              {s.locked ? (
                <p className="mt-3 text-sm text-[#6B5A48]">Solve the problem to unlock full solution code.</p>
              ) : (
                <DsaMarkdown className="mt-3">{`\`\`\`${s.language}\n${s.code || ''}\n\`\`\``}</DsaMarkdown>
              )}
            </div>
          ))}
          {!problem.solutions?.length && <p className="text-sm text-[#78716C]">No solutions published yet.</p>}
        </div>
      );
    }
    if (tab === 'Submissions') {
      return (
        <ul className="space-y-2">
          {submissions.map((s) => (
            <li key={s._id}>
              <button
                type="button"
                onClick={() => setViewingSubmission(s)}
                className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2.5 text-left text-sm transition hover:border-[#C4A574] hover:bg-[#EFE8DC]/50 ${focusRing}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className={s.status === 'Accepted' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                    {s.status}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-[#78716C]">
                    {s.language} · {s.passedCount}/{s.totalCount}
                    {s.elapsedMs != null && (
                      <span className="inline-flex items-center gap-1 text-[#6B5A48]">
                        <TimerIcon size={12} /> {formatElapsed(s.elapsedMs)}
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#A89880]">
                  {new Date(s.createdAt).toLocaleString()} · click to view code
                </p>
                {s.failedCaseSummary && (
                  <p className="mt-1 text-xs text-[#6B5A48]">{s.failedCaseSummary}</p>
                )}
              </button>
            </li>
          ))}
          {!submissions.length && <p className="text-sm text-[#78716C]">No submissions yet.</p>}
        </ul>
      );
    }

    return (
      <div>
        <CodingHint visible={ioHintVisible} onDismiss={dismissIoHint} />
        <DsaMarkdown>{problem.statement}</DsaMarkdown>
        <h3 className="font-display mt-6 text-base font-semibold text-[#1C1917]">Examples</h3>
        {(problem.examples || []).map((ex, i) => {
          const raw = problem.sampleTests?.[i];
          const rawOpen = !!rawIoOpen[i];
          return (
            <div key={i} className="mt-3 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-3">
              <p className="text-xs font-semibold text-[#6B5A48]">Example {i + 1}</p>
              <p className="mt-2 text-xs font-semibold text-[#2C241B]">Input</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-xs text-[#2C241B]">{ex.input || '(empty)'}</pre>
              <p className="mt-2 text-xs font-semibold text-[#2C241B]">Output</p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-xs text-[#2C241B]">{ex.output || '(empty)'}</pre>
              {ex.explanation && <p className="mt-2 text-xs text-[#57534E]">{ex.explanation}</p>}
              {raw && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setRawIoOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium text-[#78716C] hover:text-[#2C241B] ${focusRing}`}
                  >
                    <ChevronRight size={12} className={`transition-transform ${rawOpen ? 'rotate-90' : ''}`} />
                    Raw stdin / stdout
                  </button>
                  {rawOpen && (
                    <div className="mt-2 space-y-1 rounded-lg bg-[#FFFDF8] p-2">
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] text-[#6B5A48]">{raw.stdin || '(empty)'}</pre>
                      <div className="h-px bg-[#E5DCCE]" />
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] text-[#6B5A48]">{raw.expectedStdout || '(empty)'}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <h3 className="font-display mt-6 text-base font-semibold text-[#1C1917]">Constraints</h3>
        <DsaMarkdown>{problem.constraints}</DsaMarkdown>
        <h3 className="font-display mt-6 text-base font-semibold text-[#1C1917]">I/O format</h3>
        <p className="text-xs text-[#57534E]"><strong className="text-[#2C241B]">Input:</strong> {problem.inputFormat}</p>
        <p className="text-xs text-[#57534E]"><strong className="text-[#2C241B]">Output:</strong> {problem.outputFormat}</p>
        {!!problem.companyTags?.length && (
          <>
            <h3 className="font-display mt-6 text-base font-semibold text-[#1C1917]">Companies</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {problem.companyTags.map((c) => (
                <span key={c} className="rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-0.5 text-xs text-[#6B5A48]">
                  {c}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }, [problem, tab, submissions, slug, revealedHints, rawIoOpen, copiedSolution, judge, ioHintVisible, dismissIoHint]);

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] text-sm text-[#6B5A48]">
        Loading problem…
      </div>
    );
  }

  const runSubmitButtons = (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={anyBusy}
        onClick={onRun}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-[#F7F3EC] hover:bg-white/10 disabled:opacity-50"
      >
        {runBusy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        Run
      </button>
      <button
        type="button"
        disabled={anyBusy}
        onClick={onSubmit}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#C4A574] px-3 py-1.5 text-xs font-semibold text-[#1C1917] hover:bg-[#d4b98a] disabled:opacity-50"
      >
        {submitBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Submit
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{problem.title} | DSA Sheet | Route2Hire</title>
        <link rel="canonical" href={`https://route2hire.com/qa-sdet-dsa-sheet/problems/${slug}`} />
      </Helmet>

      <div className="flex h-[100svh] flex-col bg-[#F7F3EC]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/qa-sdet-dsa-sheet" className={`inline-flex items-center gap-1 text-sm text-[#6B5A48] ${focusRing}`}>
              <ArrowLeft size={16} /> Sheet
            </Link>
            <div className="min-w-0">
              <h1 className="font-display truncate text-base font-semibold text-[#1C1917] sm:text-lg">
                {problem.title}
              </h1>
              <p className="text-[11px] text-[#78716C]">
                {problem.difficulty} · {problem.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TimerWidget timer={timer} />
            <button
              type="button"
              onClick={openNotes}
              className={`inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] px-3 py-1.5 text-xs font-medium ${
                problem.notes?.trim() ? 'border-[#C4A574]/50 bg-[#F7F3EC] text-[#2C241B]' : 'text-[#2C241B]'
              } ${focusRing}`}
            >
              <NotebookPen
                size={14}
                className={problem.notes?.trim() ? 'text-[#C4A574]' : 'text-[#6B5A48]'}
              />
              Notes
            </button>
            <button
              type="button"
              onClick={onFavorite}
              className={`inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] px-3 py-1.5 text-xs font-medium ${focusRing}`}
            >
              <Star size={14} className={problem.isFavorite ? 'fill-amber-400 text-amber-500' : ''} />
              Favorite
            </button>
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 md:flex">
          <section style={{ width: `${leftWidth}%` }} className="flex min-w-0 flex-col border-r border-[#E5DCCE] bg-[#FFFDF8]">
            <div className="flex gap-1 overflow-x-auto border-b border-[#E5DCCE] px-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => selectTab(t)}
                  className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold ${
                    tab === t ? 'border-b-2 border-[#C4A574] text-[#1C1917]' : 'text-[#78716C]'
                  }`}
                >
                  {t}
                  {t === 'Results' && judge.running && (
                    <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#C4A574] animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            <div
              className={`min-h-0 flex-1 ${
                tab === 'Discussion' ? 'overflow-hidden' : 'overflow-y-auto p-4'
              }`}
            >
              {leftPanel}
            </div>
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={() => {
              dragging.current = true;
            }}
            className="w-1.5 cursor-col-resize bg-[#E5DCCE] hover:bg-[#C4A574]"
          />

          <section className="flex min-w-0 flex-1 flex-col bg-[#1C1917]">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
              <label className="relative inline-flex items-center text-xs text-[#E5DCCE]">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none rounded-lg border border-white/15 bg-white/5 py-1.5 pl-3 pr-8 text-xs text-[#F7F3EC]"
                >
                  {languages.map((l) => (
                    <option key={l} value={l} className="text-black">
                      {langLabel(l)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2" />
              </label>
              {runSubmitButtons}
            </div>
            <div className="min-h-0 flex-1">
              <DsaCodeEditor
                editorKey={editorKey}
                defaultValue={editorStarter}
                language={language}
                height="100%"
                onMount={handleEditorMount}
              />
            </div>
            <div className="border-t border-white/10 bg-black/40 px-3 py-2 text-xs text-white/50">
              {judge.running
                ? `Judging… ${judge.doneCount}/${judge.totalCount || '—'} — details on the Results tab`
                : judge.result
                  ? `${judge.result.status} · ${judge.result.passedCount} passed · ${judge.result.failedCount ?? judge.result.totalCount - judge.result.passedCount} failed`
                  : 'Run samples or submit — live results open on the left'}
            </div>
          </section>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-[#E5DCCE] bg-[#FFFDF8] px-2">
            {[...TABS, 'Code'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => (t === 'Code' ? setTab('Code') : selectTab(t))}
                className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${
                  tab === t ? 'border-b-2 border-[#C4A574] text-[#1C1917]' : 'text-[#78716C]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'Code' ? (
            <div className="flex min-h-0 flex-1 flex-col bg-[#1C1917]">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-white/15 bg-white/5 py-1.5 px-2 text-xs text-[#F7F3EC]"
                >
                  {languages.map((l) => (
                    <option key={l} value={l} className="text-black">
                      {langLabel(l)}
                    </option>
                  ))}
                </select>
                {runSubmitButtons}
              </div>
              <DsaCodeEditor
                editorKey={`${editorKey}:mobile`}
                defaultValue={editorStarter}
                language={language}
                height="50vh"
                onMount={handleEditorMount}
              />
            </div>
          ) : (
            <div
              className={`min-h-0 flex-1 bg-[#FFFDF8] ${
                tab === 'Discussion' ? 'overflow-hidden' : 'overflow-y-auto p-4'
              }`}
            >
              {leftPanel}
            </div>
          )}
        </div>
      </div>

      {/* Solutions first-visit warning */}
      {showSolWarn && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2C241B]/45 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sol-warn-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_80px_-24px_rgba(44,36,27,0.45)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(196,165,116,0.22), transparent 55%)',
              }}
            />
            <div className="relative px-6 py-7 sm:px-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2C241B] text-[#C4A574]">
                <EyeOff size={22} aria-hidden />
              </div>
              <h2 id="sol-warn-title" className="font-display mt-4 text-2xl font-semibold text-[#1C1917]">
                Try it yourself first
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                Solutions are most useful after you&apos;ve wrestled with the problem. Give it a real attempt —
                run tests, submit, and learn from failures — before peeking. Spoilers are hard to unsee.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowSolWarn(false)}
                  className={`rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-semibold text-[#2C241B] ${focusRing}`}
                >
                  Keep solving
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem(`dsa-sol-ack:${slug}`, '1');
                    setSolutionsAck(true);
                    setShowSolWarn(false);
                    setTab('Solutions');
                  }}
                  className={`rounded-full bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] ${focusRing}`}
                >
                  I&apos;ve tried — show solutions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission code modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2C241B]/45 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_80px_-24px_rgba(44,36,27,0.45)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#E5DCCE] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48]">
                  Submission
                </p>
                <p className="font-display mt-0.5 text-lg font-semibold text-[#1C1917]">
                  <span
                    className={
                      viewingSubmission.status === 'Accepted' ? 'text-emerald-700' : 'text-rose-700'
                    }
                  >
                    {viewingSubmission.status}
                  </span>
                  <span className="text-[#A89880]"> · </span>
                  {viewingSubmission.language}
                </p>
                <p className="mt-0.5 text-xs text-[#78716C]">
                  {viewingSubmission.passedCount}/{viewingSubmission.totalCount} passed ·{' '}
                  {new Date(viewingSubmission.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className={`rounded-xl border border-[#E5DCCE] p-2 text-[#6B5A48] ${focusRing}`}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-[#1C1917] p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-[#E5DCCE]">
                {viewingSubmission.code || '// (empty)'}
              </pre>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5DCCE] bg-[#FFFDF8] px-5 py-3">
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className={`rounded-full border border-[#E5DCCE] px-4 py-2 text-sm font-semibold text-[#2C241B] ${focusRing}`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => loadCodeIntoEditor(viewingSubmission.code || '', viewingSubmission.language)}
                className={`inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-4 py-2 text-sm font-semibold text-[#FFFDF8] ${focusRing}`}
              >
                <Code2 size={15} className="text-[#C4A574]" />
                Move to editor
              </button>
            </div>
          </div>
        </div>
      )}

      {notesOpen &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#2C241B]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close notes"
              onClick={() => setNotesOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dsa-notes-title"
              className="relative z-10 flex max-h-[min(90vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_24px_80px_-24px_rgba(44,36,27,0.45)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#E5DCCE] px-5 py-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                    <NotebookPen size={16} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 id="dsa-notes-title" className="font-display truncate text-lg font-semibold text-[#1C1917]">
                      Notes
                    </h2>
                    <p className="truncate text-xs text-[#78716C]">{problem.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotesOpen(false)}
                  className={`rounded-xl p-2 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 px-5 py-4">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={10}
                  autoFocus
                  placeholder="Approach, edge cases, pitfalls, reminders…"
                  className={`h-full min-h-[220px] w-full resize-y rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 p-3 text-sm text-[#1C1917] placeholder:text-[#A89B8A] ${focusRing}`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#E5DCCE] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setNotesOpen(false)}
                  className={`rounded-full border border-[#E5DCCE] px-4 py-2 text-sm font-semibold text-[#2C241B] ${focusRing}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={notesBusy}
                  onClick={saveNotes}
                  className={`inline-flex items-center gap-1.5 rounded-full bg-[#2C241B] px-4 py-2 text-sm font-semibold text-[#FFFDF8] disabled:opacity-50 ${focusRing}`}
                >
                  {notesBusy ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save notes
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <DsaJudgeQuotaModal open={quotaModalOpen} onClose={() => setQuotaModalOpen(false)} />
    </>
  );
}
