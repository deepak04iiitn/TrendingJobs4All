/**
 * OnlineCompiler.io Code Execution API client (sync).
 * Docs: https://onlinecompiler.io/docs
 *
 * Note: sync API accepts a single `input` string per request (no stdin batching).
 * The judge runs cases with a small concurrency pool (API limit: 4 concurrent sync).
 */

const DEFAULT_BASE = 'https://api.onlinecompiler.io';
const DEFAULT_TIMEOUT_MS = 35000; // sync endpoint blocks up to ~30s

/** Provider quota / billing / rate-limit — not a user code failure. */
export function isJudgeQuotaError(error) {
  if (!error) return false;
  if (error.code === 'JUDGE_QUOTA') return true;
  const status = Number(error.status || error.statusCode || 0);
  if ([402, 429, 503].includes(status)) return true;
  const msg = String(error.message || '').toLowerCase();
  return (
    /quota|rate\s*limit|too many|credit|billing|payment|exceeded|limit reached|over.?limit|insufficient/.test(
      msg
    )
  );
}

export async function runOnlineCompiler({
  compiler,
  code,
  input = '',
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const apiKey = process.env.ONLINECOMPILER_API_KEY || process.env.ONECOMPILER_API_KEY;
  if (!apiKey) {
    throw new Error('ONLINECOMPILER_API_KEY is not set');
  }

  const base = (process.env.ONLINECOMPILER_API_URL || DEFAULT_BASE).replace(/\/$/, '');
  const url = `${base}/api/run-code-sync/`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        compiler,
        code,
        input: input == null ? '' : String(input),
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (response.status === 429 || response.status === 402 || response.status === 403) {
      const detail =
        data?.message || data?.error || data?.detail || `OnlineCompiler HTTP ${response.status}`;
      const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
      err.status = response.status;
      err.code = 'JUDGE_QUOTA';
      err.payload = data;
      throw err;
    }

    if (!response.ok) {
      const message =
        data?.message || data?.error || data?.detail || `OnlineCompiler HTTP ${response.status}`;
      const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
      err.status = response.status;
      err.payload = data;
      if (isJudgeQuotaError(err)) err.code = 'JUDGE_QUOTA';
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const err = new Error('OnlineCompiler request timed out');
      err.code = 'TIMEOUT';
      throw err;
    }
    if (isJudgeQuotaError(error)) {
      error.code = 'JUDGE_QUOTA';
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Map OnlineCompiler sync response → internal case classification.
 * Response shape: { output, error, status, exit_code, signal, time, total, memory }
 */
export function classifyOnlineCompilerCase(result, timeLimitMs = 2000) {
  if (!result) {
    return { status: 'InternalError', message: 'Empty judge response' };
  }

  const stdout = String(result.output ?? '');
  const stderr = String(result.error ?? '');
  const statusRaw = String(result.status || '').toLowerCase();
  const exitCode = Number(result.exit_code ?? 0);
  const signal = result.signal;
  // API returns time in seconds as string
  const timeSec = Number(result.time ?? result.total ?? 0);
  const runtimeMs = Number.isFinite(timeSec) ? Math.round(timeSec * 1000) : 0;
  const memoryKb = result.memory != null ? Number(result.memory) : null;

  // Timeout / killed
  if (exitCode === 124 || statusRaw.includes('timeout')) {
    return {
      status: 'TimeLimitExceeded',
      message: 'Time limit exceeded',
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }
  if (exitCode === 137 || signal === 9) {
    return {
      status: 'TimeLimitExceeded',
      message: 'Killed (memory/timeout)',
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }
  if (runtimeMs > timeLimitMs * 1.5 && timeLimitMs > 0) {
    return {
      status: 'TimeLimitExceeded',
      message: 'Time limit exceeded',
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }

  const compileHints = /error:|cannot find symbol|compilation|syntaxerror|javac|expected |error\[E/i;
  if (compileHints.test(stderr) && exitCode !== 0) {
    return {
      status: 'CompilationError',
      message: stderr.slice(0, 500) || 'Compilation error',
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }

  if (exitCode === 139 || signal === 11) {
    return {
      status: 'RuntimeError',
      message: 'Segmentation fault',
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }

  if (statusRaw === 'error' || exitCode !== 0) {
    return {
      status: 'RuntimeError',
      message: (stderr || `Process exited with code ${exitCode}`).slice(0, 500),
      stdout,
      stderr,
      runtimeMs,
      memoryKb,
    };
  }

  return {
    status: 'ok',
    message: '',
    stdout,
    stderr,
    runtimeMs,
    memoryKb,
  };
}

/** Run many cases with a concurrency cap (OnlineCompiler sync limit is 4). */
export async function runCasesWithPool(
  cases,
  { compiler, code, concurrency = 4, timeoutMs, onCaseComplete }
) {
  const limit = Math.max(1, Math.min(4, concurrency));
  const results = new Array(cases.length);
  let next = 0;

  async function worker() {
    for (;;) {
      const idx = next;
      next += 1;
      if (idx >= cases.length) return;
      let raw;
      try {
        raw = await runOnlineCompiler({
          compiler,
          code,
          input: cases[idx].stdin ?? '',
          timeoutMs,
        });
      } catch (error) {
        if (isJudgeQuotaError(error)) {
          error.code = 'JUDGE_QUOTA';
          throw error;
        }
        raw = {
          output: '',
          error: error.message || 'Execution failed',
          status: 'error',
          exit_code: 1,
          time: '0',
          _clientError: true,
        };
      }
      results[idx] = raw;
      if (typeof onCaseComplete === 'function') {
        await onCaseComplete(idx, raw, cases[idx]);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, cases.length) }, () => worker()));
  return results;
}
