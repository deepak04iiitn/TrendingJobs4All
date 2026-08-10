import crypto from 'crypto';
import DsaTestCase from '../models/dsaTestCase.model.js';
import DsaSubmission from '../models/dsaSubmission.model.js';
import DsaUserProgress from '../models/dsaUserProgress.model.js';
import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import DsaActivityDay from '../models/dsaActivityDay.model.js';
import DsaUserStats from '../models/dsaUserStats.model.js';
import {
  ONLINECOMPILER_LANGUAGE_MAP,
  normalizeStdout,
  compareByMode,
  getIstDateKey,
  xpForDifficulty,
  levelFromXp,
  DIFFICULTY_POINTS,
} from '../utils/dsaConstants.js';

const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

function sanitizeElapsedMs(elapsedMs) {
  const n = Number(elapsedMs);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, MAX_ELAPSED_MS);
}
import {
  runCasesWithPool,
  classifyOnlineCompilerCase,
  isJudgeQuotaError,
} from '../utils/onlineCompilerClient.js';

const recentCache = new Map(); // key -> { at, result }
const CACHE_TTL_MS = 5 * 60 * 1000;
const rateBuckets = new Map(); // `${userId}:${action}` -> timestamps[]

function hashCode(language, code) {
  return crypto.createHash('sha256').update(`${language}\n${code}`).digest('hex');
}

function allowRate(userId, action, limit, windowMs) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const list = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    rateBuckets.set(key, list);
    return false;
  }
  list.push(now);
  rateBuckets.set(key, list);
  return true;
}

function compareStdout(actual, expected, comparisonMode = 'exact', comparisonConfig = {}) {
  return compareByMode(actual, expected, comparisonMode, comparisonConfig);
}

async function bumpActivity({ userId, solvedDelta = 0, attemptDelta = 0, xpDelta = 0 }) {
  const date = getIstDateKey();
  await DsaActivityDay.findOneAndUpdate(
    { userId, date },
    {
      $inc: {
        solvedCount: solvedDelta,
        attemptCount: attemptDelta,
        xpEarned: xpDelta,
      },
    },
    { upsert: true, new: true }
  );
}

async function recomputeStreak(userId) {
  const days = await DsaActivityDay.find({ userId, solvedCount: { $gt: 0 } })
    .sort({ date: -1 })
    .limit(400)
    .lean();
  const set = new Set(days.map((d) => d.date));
  const today = getIstDateKey();
  let current = 0;
  let cursor = new Date(`${today}T12:00:00+05:30`);
  // If today has no solve, start from yesterday for "current" display continuity
  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  for (;;) {
    const key = getIstDateKey(cursor);
    if (!set.has(key)) break;
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  const sorted = [...set].sort();
  let prev = null;
  for (const d of sorted) {
    if (!prev) {
      run = 1;
    } else {
      const prevDate = new Date(`${prev}T12:00:00+05:30`);
      prevDate.setDate(prevDate.getDate() + 1);
      const expect = getIstDateKey(prevDate);
      run = expect === d ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }

  return { currentStreak: current, longestStreak: Math.max(longest, current) };
}

async function awardBadges(stats) {
  const have = new Set((stats.badges || []).map((b) => b.id));
  const add = (id) => {
    if (!have.has(id)) {
      stats.badges.push({ id, earnedAt: new Date() });
      have.add(id);
    }
  };
  if (stats.totalSolved >= 1) add('first-solve');
  if (stats.currentStreak >= 7) add('streak-7');
  if (stats.totalSolved >= 50) add('solved-50');
  if (stats.totalSolved >= 100) add('solved-100');
  if (stats.totalSolved >= 200) add('solved-200');
}

const STATUS_PRIORITY = {
  Accepted: 0,
  WrongAnswer: 1,
  TimeLimitExceeded: 2,
  RuntimeError: 3,
  InternalError: 4,
  CompilationError: 5,
};

function worseStatus(current, next) {
  return (STATUS_PRIORITY[next] || 0) >= (STATUS_PRIORITY[current] || 0) ? next : current;
}

function evaluateCase(testCase, raw, problem) {
  if (!raw) {
    return {
      index: testCase.index,
      passed: false,
      status: 'InternalError',
      runtimeMs: 0,
      isSample: !!testCase.isSample,
      message: 'Judge skipped this test',
      stdin: testCase.stdin ?? '',
      expectedStdout: testCase.expectedStdout ?? '',
      stdout: '',
    };
  }

  const classified = classifyOnlineCompilerCase(raw, testCase.timeLimitMs || 2000);
  const base = {
    index: testCase.index,
    runtimeMs: classified.runtimeMs || 0,
    memoryKb: classified.memoryKb,
    isSample: !!testCase.isSample,
    message: classified.message || '',
    stdin: testCase.stdin ?? '',
    expectedStdout: normalizeStdout(testCase.expectedStdout),
  };

  if (classified.status === 'CompilationError') {
    return {
      ...base,
      passed: false,
      status: 'CompilationError',
      stdout: normalizeStdout(classified.stdout),
    };
  }
  if (classified.status === 'TimeLimitExceeded') {
    return {
      ...base,
      passed: false,
      status: 'TimeLimitExceeded',
      stdout: normalizeStdout(classified.stdout),
    };
  }
  if (classified.status === 'RuntimeError' || classified.status === 'InternalError') {
    return {
      ...base,
      passed: false,
      status: classified.status,
      stdout: normalizeStdout(classified.stdout),
    };
  }

  const ok = compareStdout(
    classified.stdout,
    testCase.expectedStdout,
    problem.comparisonMode,
    problem.comparisonConfig
  );
  if (ok) {
    return {
      ...base,
      passed: true,
      status: 'Accepted',
      stdout: testCase.isSample ? normalizeStdout(classified.stdout) : undefined,
      // Don't leak I/O on passed hidden tests
      stdin: testCase.isSample ? base.stdin : undefined,
      expectedStdout: testCase.isSample ? base.expectedStdout : undefined,
    };
  }
  return {
    ...base,
    passed: false,
    status: 'WrongAnswer',
    stdout: normalizeStdout(classified.stdout),
    message: `Expected "${normalizeStdout(testCase.expectedStdout)}", got "${normalizeStdout(classified.stdout)}"`,
  };
}

function publicCaseResult(c) {
  // Samples keep stdout for debugging; hidden cases only expose pass/fail
  if (c.isSample) {
    return {
      index: c.index,
      passed: c.passed,
      status: c.status,
      runtimeMs: c.runtimeMs,
      isSample: true,
      stdout: c.stdout,
      message: c.message,
    };
  }
  return {
    index: c.index,
    passed: c.passed,
    status: c.status,
    runtimeMs: c.runtimeMs,
    isSample: false,
  };
}

function buildFirstFailedCase(caseResults) {
  const failed = (caseResults || []).find((c) => c && !c.passed);
  if (!failed) return null;
  return {
    index: failed.index,
    status: failed.status,
    isSample: !!failed.isSample,
    stdin: failed.stdin ?? '',
    expectedStdout: failed.expectedStdout ?? '',
    stdout: failed.stdout ?? '',
    message: failed.message || '',
    runtimeMs: failed.runtimeMs || 0,
  };
}

/**
 * @param {'run'|'submit'} mode
 * @param {(evt: object) => void} [onProgress] live case updates for SSE
 * @param {Array} [priorCaseResults] optional sample results to reuse on submit (same code)
 */
export async function judgeSubmission({
  userId,
  problem,
  language,
  code,
  mode = 'submit',
  elapsedMs = null,
  onProgress = null,
  priorCaseResults = null,
}) {
  const safeElapsedMs = sanitizeElapsedMs(elapsedMs);
  if (!allowRate(userId, 'run', mode === 'run' ? 6 : 4, 60_000)) {
    const err = new Error('Rate limit exceeded. Please wait before trying again.');
    err.statusCode = 429;
    err.code = 'USER_RATE_LIMIT';
    throw err;
  }

  const compiler = ONLINECOMPILER_LANGUAGE_MAP[language];
  if (!compiler) {
    const err = new Error(`Unsupported language: ${language}`);
    err.statusCode = 400;
    throw err;
  }

  // Run: samples only. Submit: ALL cases (samples + hidden) so UI shows full suite.
  let cases =
    mode === 'run'
      ? await DsaTestCase.find({ problemId: problem._id, isSample: true }).sort({ index: 1 }).lean()
      : await DsaTestCase.find({ problemId: problem._id }).sort({ index: 1 }).lean();

  if (cases.length === 0) {
    const err = new Error('No test cases configured for this problem');
    err.statusCode = 400;
    throw err;
  }

  const totalCount = cases.length;
  const codeHash = hashCode(language, code);
  const emit = (evt) => {
    if (typeof onProgress === 'function') onProgress(evt);
  };

  if (mode === 'submit') {
    const cacheKey = `${userId}:${problem._id}:${codeHash}`;
    const cached = recentCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      const payload = { ...cached.result, cached: true };
      emit({ type: 'start', mode, totalCount: payload.totalCount });
      for (const c of payload.caseResults || []) {
        emit({
          type: 'case',
          case: c,
          passedCount: payload.passedCount,
          failedCount: payload.totalCount - payload.passedCount,
          doneCount: payload.totalCount,
          totalCount: payload.totalCount,
        });
      }
      emit({ type: 'done', result: payload });
      return payload;
    }
  }

  // Reuse prior sample results on submit when the client just ran the same code
  const priorByIndex = new Map();
  if (mode === 'submit' && Array.isArray(priorCaseResults)) {
    for (const c of priorCaseResults) {
      if (c && c.isSample && c.index != null) priorByIndex.set(Number(c.index), c);
    }
  }

  emit({ type: 'start', mode, totalCount });

  const concurrency = Math.min(
    4,
    Math.max(1, Number(process.env.DSA_JUDGE_CONCURRENCY || 4))
  );

  let passedCount = 0;
  let overallStatus = 'Accepted';
  let failedCaseSummary = '';
  let judgeMessage = '';
  let maxRuntime = 0;
  let maxMemory = null;
  const caseResults = new Array(cases.length);
  let doneCount = 0;

  const applyEvaluated = (idx, evaluated) => {
    caseResults[idx] = evaluated;
    doneCount += 1;
    if (evaluated.passed) passedCount += 1;
    else {
      overallStatus = worseStatus(overallStatus, evaluated.status);
      if (!failedCaseSummary) {
        failedCaseSummary =
          evaluated.status === 'CompilationError'
            ? 'Compilation error'
            : evaluated.status === 'WrongAnswer'
              ? `Wrong answer on test ${evaluated.index}`
              : evaluated.status === 'TimeLimitExceeded'
                ? `Time limit exceeded on test ${evaluated.index}`
                : `Error on test ${evaluated.index}`;
        judgeMessage = evaluated.message || judgeMessage;
      }
    }
    maxRuntime = Math.max(maxRuntime, evaluated.runtimeMs || 0);
    if (evaluated.memoryKb != null) {
      maxMemory = Math.max(maxMemory || 0, evaluated.memoryKb);
    }
    emit({
      type: 'case',
      case: publicCaseResult(evaluated),
      passedCount,
      failedCount: doneCount - passedCount,
      doneCount,
      totalCount,
    });
  };

  // Seed reused sample results first (no re-execution)
  const casesToRun = [];
  const runIndexMap = []; // maps pool index -> cases[] index
  for (let i = 0; i < cases.length; i += 1) {
    const tc = cases[i];
    const prior = priorByIndex.get(Number(tc.index));
    if (prior && tc.isSample) {
      applyEvaluated(i, {
        index: tc.index,
        passed: !!prior.passed,
        status: prior.status || (prior.passed ? 'Accepted' : 'WrongAnswer'),
        runtimeMs: prior.runtimeMs || 0,
        isSample: true,
        stdout: prior.stdout,
        message: prior.message || '',
        stdin: tc.stdin ?? '',
        expectedStdout: normalizeStdout(tc.expectedStdout),
      });
    } else {
      runIndexMap.push(i);
      casesToRun.push(tc);
    }
  }

  try {
    if (casesToRun.length > 0) {
      await runCasesWithPool(casesToRun, {
        compiler,
        code,
        concurrency,
        timeoutMs: Number(process.env.ONLINECOMPILER_TIMEOUT_MS || 35000),
        onCaseComplete: async (poolIdx, raw, testCase) => {
          const idx = runIndexMap[poolIdx];
          const evaluated = evaluateCase(testCase, raw, problem);
          applyEvaluated(idx, evaluated);
        },
      });
    }
  } catch (error) {
    if (mode === 'submit') {
      await DsaSubmission.create({
        userId,
        problemId: problem._id,
        language,
        code,
        codeHash,
        status: 'InternalError',
        passedCount: 0,
        totalCount: cases.length,
        judgeMessage: error.message || 'Judge unavailable',
      });
    }
    if (isJudgeQuotaError(error)) {
      const err = new Error(
        error.message || 'Code runner is temporarily unavailable due to high demand.'
      );
      err.statusCode = 503;
      err.code = 'JUDGE_QUOTA';
      throw err;
    }
    const err = new Error(error.message || 'Code execution failed');
    err.statusCode = 502;
    throw err;
  }

  for (let i = 0; i < cases.length; i += 1) {
    if (!caseResults[i]) {
      applyEvaluated(i, evaluateCase(cases[i], null, problem));
    }
  }

  const failedCount = totalCount - passedCount;
  const firstFailedCase = buildFirstFailedCase(caseResults);
  const responsePayload = {
    mode,
    status: overallStatus,
    passedCount,
    failedCount,
    totalCount,
    runtimeMs: maxRuntime || null,
    memoryKb: maxMemory,
    judgeMessage,
    failedCaseSummary,
    firstFailedCase,
    caseResults: caseResults.map(publicCaseResult),
  };

  // Persist progress / submissions for submit mode
  const now = new Date();
  const progress = await DsaUserProgress.findOneAndUpdate(
    { userId, problemId: problem._id },
    {
      $setOnInsert: {
        legacyProblemName: problem.legacyProblemName,
        isFavorite: false,
        notes: '',
      },
      $set: {
        lastAttemptedAt: now,
        ...(overallStatus === 'Accepted' && mode === 'submit'
          ? {
              status: 'solved',
              acceptedLanguage: language,
              bestRuntimeMs: maxRuntime || null,
              bestMemoryKb: maxMemory,
            }
          : {}),
        ...(overallStatus !== 'Accepted' && mode === 'submit'
          ? { status: 'attempted' }
          : {}),
      },
      $inc: {
        attemptCount: mode === 'submit' ? 1 : 0,
        acceptedCount: mode === 'submit' && overallStatus === 'Accepted' ? 1 : 0,
      },
    },
    { upsert: true, new: true }
  );

  let progressDirty = false;
  if (mode === 'submit' && overallStatus === 'Accepted' && !progress.firstSolvedAt) {
    progress.firstSolvedAt = now;
    progress.status = 'solved';
    progressDirty = true;
  }
  if (mode === 'submit' && overallStatus === 'Accepted' && safeElapsedMs != null) {
    if (progress.firstSolveTimeMs == null) {
      progress.firstSolveTimeMs = safeElapsedMs;
      progressDirty = true;
    }
    if (progress.bestSolveTimeMs == null || safeElapsedMs < progress.bestSolveTimeMs) {
      progress.bestSolveTimeMs = safeElapsedMs;
      progressDirty = true;
    }
  }
  if (progressDirty) await progress.save();

  if (mode === 'submit') {
    await DsaSubmission.create({
      userId,
      problemId: problem._id,
      language,
      code,
      codeHash,
      status: overallStatus,
      passedCount,
      totalCount,
      runtimeMs: maxRuntime || null,
      memoryKb: maxMemory,
      elapsedMs: safeElapsedMs,
      judgeMessage,
      failedCaseSummary,
      caseResults: responsePayload.caseResults,
    });

    await DsaCatalogProblem.updateOne(
      { _id: problem._id },
      {
        $inc: {
          'stats.attemptCount': 1,
          ...(overallStatus === 'Accepted' ? { 'stats.acceptCount': 1 } : {}),
        },
      }
    );

    const firstAccept =
      overallStatus === 'Accepted' &&
      (await DsaUserProgress.countDocuments({
        userId,
        problemId: problem._id,
        status: 'solved',
        acceptedCount: 1,
      })) > 0;

    const xpGain =
      overallStatus === 'Accepted' && progress.acceptedCount <= 1
        ? xpForDifficulty(problem.difficulty)
        : 0;

    await bumpActivity({
      userId,
      attemptDelta: 1,
      solvedDelta: overallStatus === 'Accepted' && progress.acceptedCount <= 1 ? 1 : 0,
      xpDelta: xpGain,
    });

    await refreshUserStats(userId, {
      problem,
      accepted: overallStatus === 'Accepted',
      firstAccept: overallStatus === 'Accepted' && (progress.acceptedCount || 0) <= 1,
      xpGain,
    });

    const cacheKey = `${userId}:${problem._id}:${codeHash}`;
    recentCache.set(cacheKey, { at: Date.now(), result: responsePayload });
  } else {
    await bumpActivity({ userId, attemptDelta: 0 });
  }

  emit({ type: 'done', result: responsePayload });
  return responsePayload;
}

async function refreshUserStats(userId, { problem, accepted, firstAccept, xpGain }) {
  let stats = await DsaUserStats.findOne({ userId });
  if (!stats) {
    stats = await DsaUserStats.create({ userId });
  }

  stats.totalSubmissions += 1;
  if (accepted) stats.acceptedSubmissions += 1;

  if (firstAccept && accepted) {
    stats.totalSolved += 1;
    stats.totalPoints += DIFFICULTY_POINTS[problem.difficulty] || 10;
    stats.xp += xpGain || 0;
    stats.level = levelFromXp(stats.xp);
    stats.lastSolvedAt = new Date();
    if (problem.difficulty === 'Easy') stats.easySolved += 1;
    if (problem.difficulty === 'Medium') stats.mediumSolved += 1;
    if (problem.difficulty === 'Hard') stats.hardSolved += 1;

    const topic = problem.category || 'Other';
    const prevTopic = stats.topicProgress?.get?.(topic) || stats.topicProgress?.[topic] || 0;
    if (stats.topicProgress?.set) stats.topicProgress.set(topic, prevTopic + 1);
    else {
      stats.topicProgress = { ...(stats.topicProgress || {}), [topic]: prevTopic + 1 };
    }

    for (const company of problem.companyTags || []) {
      const prev = stats.companyProgress?.get?.(company) || stats.companyProgress?.[company] || 0;
      if (stats.companyProgress?.set) stats.companyProgress.set(company, prev + 1);
      else {
        stats.companyProgress = { ...(stats.companyProgress || {}), [company]: prev + 1 };
      }
    }
  }

  const attempted = await DsaUserProgress.countDocuments({
    userId,
    status: { $in: ['attempted', 'solved'] },
  });
  stats.totalAttempted = attempted;

  const streaks = await recomputeStreak(userId);
  stats.currentStreak = streaks.currentStreak;
  stats.longestStreak = Math.max(stats.longestStreak || 0, streaks.longestStreak);

  await awardBadges(stats);
  await stats.save();
  return stats;
}

export { hashCode, refreshUserStats, recomputeStreak };
