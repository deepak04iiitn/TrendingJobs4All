import { useCallback, useEffect, useRef, useState } from 'react';

function loadStored(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/serialization errors
  }
}

/**
 * A solve-time timer for a single DSA problem: idle -> running -> paused -> stopped.
 * - start(): manual, begins timing from zero.
 * - Automatically pauses when the tab is backgrounded and resumes when it's foregrounded
 *   again (including across a reload/remount, as long as the tab is visible) — this avoids
 *   inflating the recorded time with time spent away from the page.
 * - stop(): locks in the final elapsed time (call this on an Accepted submission).
 * - reset(): back to idle / zero.
 * State persists to localStorage per `storageKey` so a refresh mid-solve doesn't lose progress.
 */
export default function useDsaTimer(storageKey) {
  const [status, setStatus] = useState('idle'); // idle | running | paused | stopped
  const [baseElapsedMs, setBaseElapsedMs] = useState(0);
  const [runningSince, setRunningSince] = useState(null);
  const [, forceTick] = useState(0);
  const stateRef = useRef({ status: 'idle', baseElapsedMs: 0, runningSince: null });

  useEffect(() => {
    stateRef.current = { status, baseElapsedMs, runningSince };
  }, [status, baseElapsedMs, runningSince]);

  // Load persisted state whenever the target problem changes.
  useEffect(() => {
    const stored = loadStored(storageKey);
    if (stored && (stored.status === 'running' || stored.status === 'paused')) {
      const resumeRunning = typeof document !== 'undefined' ? !document.hidden : true;
      setBaseElapsedMs(stored.baseElapsedMs || 0);
      setRunningSince(resumeRunning ? Date.now() : null);
      setStatus(resumeRunning ? 'running' : 'paused');
    } else if (stored && stored.status === 'stopped') {
      setBaseElapsedMs(stored.baseElapsedMs || 0);
      setRunningSince(null);
      setStatus('stopped');
    } else {
      setBaseElapsedMs(0);
      setRunningSince(null);
      setStatus('idle');
    }
  }, [storageKey]);

  // Persist on every change.
  useEffect(() => {
    if (!storageKey) return;
    saveStored(storageKey, { status, baseElapsedMs, runningSince });
  }, [storageKey, status, baseElapsedMs, runningSince]);

  // Tick the displayed elapsed time while running.
  useEffect(() => {
    if (status !== 'running') return undefined;
    const id = setInterval(() => forceTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [status]);

  // Auto-pause on tab blur, auto-resume on return.
  useEffect(() => {
    const onVisibility = () => {
      const cur = stateRef.current;
      if (document.hidden && cur.status === 'running') {
        setBaseElapsedMs(cur.baseElapsedMs + (Date.now() - cur.runningSince));
        setRunningSince(null);
        setStatus('paused');
      } else if (!document.hidden && cur.status === 'paused') {
        setRunningSince(Date.now());
        setStatus('running');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const start = useCallback(() => {
    setBaseElapsedMs(0);
    setRunningSince(Date.now());
    setStatus('running');
  }, []);

  const stop = useCallback(() => {
    const cur = stateRef.current;
    if (cur.status === 'running') {
      setBaseElapsedMs(cur.baseElapsedMs + (Date.now() - cur.runningSince));
    }
    setRunningSince(null);
    setStatus('stopped');
  }, []);

  const reset = useCallback(() => {
    setBaseElapsedMs(0);
    setRunningSince(null);
    setStatus('idle');
  }, []);

  const elapsedMs = runningSince ? baseElapsedMs + (Date.now() - runningSince) : baseElapsedMs;

  return { status, elapsedMs, start, stop, reset };
}

export function formatElapsed(ms) {
  const total = Math.max(0, Math.round((ms || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
