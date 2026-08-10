import axios from '../utils/axios';

export async function fetchDsaDashboard() {
  const { data } = await axios.get('/backend/dsa/dashboard');
  return data;
}

export async function fetchDsaProblems(params = {}) {
  const { data } = await axios.get('/backend/dsa/problems', { params });
  return data;
}

export async function fetchDsaProblem(slug) {
  const { data } = await axios.get(`/backend/dsa/problems/${slug}`);
  return data;
}

export async function updateDsaProgress(slug, body) {
  const { data } = await axios.put(`/backend/dsa/problems/${slug}/progress`, body);
  return data;
}

export async function runDsaCode(slug, body) {
  const { data } = await axios.post(`/backend/dsa/problems/${slug}/run`, body);
  return data;
}

export async function submitDsaCode(slug, body) {
  const { data } = await axios.post(`/backend/dsa/problems/${slug}/submit`, body);
  return data;
}

/**
 * Stream judge progress via SSE (POST + text/event-stream).
 * callbacks: onStart, onCase, onDone, onError
 */
async function streamJudge(path, body, { onStart, onCase, onDone, onError } = {}) {
  const res = await fetch(`${path}?stream=1`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code;
    try {
      const data = await res.json();
      message = data.message || message;
      code = data.code;
    } catch {
      /* ignore */
    }
    if (res.status === 401) {
      const current = window.location.pathname + window.location.search + window.location.hash;
      window.location.href = `/sign-in?redirect=${encodeURIComponent(current)}`;
    }
    const err = new Error(message);
    err.status = res.status;
    err.code = code || (res.status === 503 ? 'JUDGE_QUOTA' : undefined);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Streaming not supported');

  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || '';
    for (const chunk of chunks) {
      const line = chunk
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.startsWith('data:'));
      if (!line) continue;
      let evt;
      try {
        evt = JSON.parse(line.slice(5).trim());
      } catch {
        continue;
      }
      if (evt.type === 'start') onStart?.(evt);
      else if (evt.type === 'case') onCase?.(evt);
      else if (evt.type === 'done') {
        finalResult = evt.result;
        onDone?.(evt.result);
      } else if (evt.type === 'error') {
        const err = new Error(evt.message || 'Judge error');
        err.code = evt.code;
        onError?.(evt.message || 'Judge error', evt);
        throw err;
      }
    }
  }

  if (!finalResult) throw new Error('Judge finished without a result');
  return finalResult;
}

export function runDsaCodeStream(slug, body, handlers) {
  return streamJudge(`/backend/dsa/problems/${slug}/run`, body, handlers);
}

export function submitDsaCodeStream(slug, body, handlers) {
  return streamJudge(`/backend/dsa/problems/${slug}/submit`, body, handlers);
}

export async function fetchDsaSubmissions(slug) {
  const { data } = await axios.get(`/backend/dsa/problems/${slug}/submissions`);
  return data;
}

export async function fetchDsaDiscussions(slug, params = {}) {
  const { data } = await axios.get(`/backend/dsa/problems/${slug}/discussions`, { params });
  return data;
}

export async function createDsaDiscussion(slug, body) {
  const { data } = await axios.post(`/backend/dsa/problems/${slug}/discussions`, body);
  return data;
}

export async function voteDsaDiscussion(discussionId, value = 1) {
  const { data } = await axios.post(`/backend/dsa/discussions/${discussionId}/vote`, { value });
  return data;
}

export async function fetchDsaLeaderboard(params = {}) {
  const { data } = await axios.get('/backend/dsa/leaderboard', { params });
  return data;
}

export async function fetchWeeklyWinners() {
  const { data } = await axios.get('/backend/dsa/weekly-winners');
  return data;
}
