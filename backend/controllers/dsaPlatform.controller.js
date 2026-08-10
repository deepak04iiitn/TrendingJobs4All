import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import DsaTestCase from '../models/dsaTestCase.model.js';
import DsaUserProgress from '../models/dsaUserProgress.model.js';
import DsaSubmission from '../models/dsaSubmission.model.js';
import DsaDiscussion from '../models/dsaDiscussion.model.js';
import DsaDiscussionVote from '../models/dsaDiscussionVote.model.js';
import DsaActivityDay from '../models/dsaActivityDay.model.js';
import DsaUserStats from '../models/dsaUserStats.model.js';
import User from '../models/user.model.js';
import { judgeSubmission } from '../services/dsaJudge.service.js';
import {
  DSA_LANGUAGES,
  DIFFICULTY_POINTS,
  validateTestSuite,
  getIstDateKey,
} from '../utils/dsaConstants.js';

function publicProblem(doc, progress) {
  return {
    id: doc._id,
    slug: doc.slug,
    title: doc.title,
    legacyProblemName: doc.legacyProblemName,
    category: doc.category,
    difficulty: doc.difficulty,
    companyTags: doc.companyTags || [],
    legacyExternalLink: doc.legacyExternalLink,
    stats: doc.stats,
    order: doc.order,
    status: progress?.status || 'todo',
    isFavorite: !!progress?.isFavorite,
    notes: progress?.notes || '',
    firstSolvedAt: progress?.firstSolvedAt || null,
    attemptCount: progress?.attemptCount || 0,
    acceptedCount: progress?.acceptedCount || 0,
  };
}

export const listProblems = async (req, res, next) => {
  try {
    const {
      q = '',
      difficulty,
      category,
      company,
      status, // solved|unsolved|attempted|favorite
      sort = 'order',
      page = 1,
      limit = 50,
    } = req.query;

    const filter = { status: 'published' };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (company) filter.companyTags = company;
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { category: new RegExp(q, 'i') },
        { companyTags: new RegExp(q, 'i') },
      ];
    }

    const problems = await DsaCatalogProblem.find(filter).sort({ order: 1, title: 1 }).lean();
    const userId = req.user?.id;
    const progressDocs = userId
      ? await DsaUserProgress.find({ userId }).lean()
      : [];
    const progressMap = new Map(progressDocs.map((p) => [String(p.problemId), p]));

    let rows = problems.map((p) => publicProblem(p, progressMap.get(String(p._id))));

    if (status === 'solved') rows = rows.filter((r) => r.status === 'solved');
    if (status === 'unsolved') rows = rows.filter((r) => r.status !== 'solved');
    if (status === 'attempted') rows = rows.filter((r) => r.status === 'attempted');
    if (status === 'favorite') rows = rows.filter((r) => r.isFavorite);

    if (sort === 'difficulty') {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      rows.sort((a, b) => order[a.difficulty] - order[b.difficulty] || a.order - b.order);
    } else if (sort === 'popularity') {
      rows.sort((a, b) => (b.stats?.attemptCount || 0) - (a.stats?.attemptCount || 0));
    } else if (sort === 'acceptance') {
      rows.sort((a, b) => (b.stats?.acceptCount || 0) - (a.stats?.acceptCount || 0));
    }

    const total = rows.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const lim = Math.min(200, Math.max(1, Number(limit) || 50));
    const start = (pageNum - 1) * lim;
    const paged = rows.slice(start, start + lim);

    const categories = [...new Set(problems.map((p) => p.category))];
    const companies = [...new Set(problems.flatMap((p) => p.companyTags || []))];

    res.json({
      problems: paged,
      total,
      page: pageNum,
      limit: lim,
      facets: { categories, companies, difficulties: ['Easy', 'Medium', 'Hard'] },
      stats: {
        total: problems.length,
        solved: rows.filter((r) => r.status === 'solved').length,
        attempted: rows.filter((r) => r.status === 'attempted').length,
        favorites: rows.filter((r) => r.isFavorite).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findOne({
      slug: req.params.slug,
      status: 'published',
    }).lean();
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const progress = req.user?.id
      ? await DsaUserProgress.findOne({
          userId: req.user.id,
          problemId: problem._id,
        }).lean()
      : null;

    const samples = await DsaTestCase.find({
      problemId: problem._id,
      isSample: true,
    })
      .sort({ index: 1 })
      .select('index stdin expectedStdout caseKind')
      .lean();

    res.json({
      ...publicProblem(problem, progress),
      statement: problem.statement,
      examples: problem.examples,
      constraints: problem.constraints,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      hints: problem.hints,
      // Solutions only if solved (or always show approach after solve — lock code until solved)
      solutions:
        progress?.status === 'solved'
          ? problem.solutions
          : (problem.solutions || []).map((s) => ({
              language: s.language,
              approach: s.approach,
              timeComplexity: s.timeComplexity,
              spaceComplexity: s.spaceComplexity,
              locked: true,
            })),
      starterCode: problem.starterCode,
      sampleTests: samples,
      languages: DSA_LANGUAGES,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const { isFavorite, notes } = req.body;
    const update = {};
    if (typeof isFavorite === 'boolean') update.isFavorite = isFavorite;
    if (typeof notes === 'string') update.notes = notes;

    const progress = await DsaUserProgress.findOneAndUpdate(
      { userId: req.user.id, problemId: problem._id },
      {
        $set: update,
        $setOnInsert: {
          legacyProblemName: problem.legacyProblemName,
          status: 'todo',
        },
      },
      { upsert: true, new: true }
    );

    if (typeof isFavorite === 'boolean') {
      await DsaCatalogProblem.updateOne(
        { _id: problem._id },
        { $inc: { 'stats.favoriteCount': isFavorite ? 1 : -1 } }
      );
    }

    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

export const runCode = async (req, res, next) => {
  try {
    const { language, code, elapsedMs } = req.body;
    if (!language || typeof code !== 'string') {
      return res.status(400).json({ message: 'language and code are required' });
    }
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug, status: 'published' });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const wantsStream =
      req.query.stream === '1' ||
      String(req.headers.accept || '').includes('text/event-stream');

    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();
      const send = (evt) => {
        res.write(`data: ${JSON.stringify(evt)}\n\n`);
        if (typeof res.flush === 'function') res.flush();
      };
      try {
        await judgeSubmission({
          userId: req.user.id,
          problem,
          language,
          code,
          mode: 'run',
          elapsedMs,
          onProgress: send,
        });
      } catch (error) {
        send({ type: 'error', message: error.message || 'Run failed' });
      }
      return res.end();
    }

    const result = await judgeSubmission({
      userId: req.user.id,
      problem,
      language,
      code,
      mode: 'run',
      elapsedMs,
    });
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { language, code, elapsedMs } = req.body;
    if (!language || typeof code !== 'string') {
      return res.status(400).json({ message: 'language and code are required' });
    }
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug, status: 'published' });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const wantsStream =
      req.query.stream === '1' ||
      String(req.headers.accept || '').includes('text/event-stream');

    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();
      const send = (evt) => {
        res.write(`data: ${JSON.stringify(evt)}\n\n`);
        if (typeof res.flush === 'function') res.flush();
      };
      try {
        await judgeSubmission({
          userId: req.user.id,
          problem,
          language,
          code,
          mode: 'submit',
          elapsedMs,
          priorCaseResults: req.body?.priorCaseResults,
          onProgress: send,
        });
      } catch (error) {
        send({ type: 'error', message: error.message || 'Submit failed' });
      }
      return res.end();
    }

    const result = await judgeSubmission({
      userId: req.user.id,
      problem,
      language,
      code,
      mode: 'submit',
      elapsedMs,
      priorCaseResults: req.body?.priorCaseResults,
    });
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
};

export const listSubmissions = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const submissions = await DsaSubmission.find({
      userId: req.user.id,
      problemId: problem._id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-caseResults.stdout')
      .lean();

    res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const totalProblems = await DsaCatalogProblem.countDocuments({ status: 'published' });
    let stats = await DsaUserStats.findOne({ userId }).lean();
    if (!stats) {
      stats = {
        totalSolved: 0,
        totalAttempted: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        totalPoints: 0,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        dailyGoal: 1,
        weeklyGoal: 5,
        badges: [],
        topicProgress: {},
        companyProgress: {},
      };
    }

    const today = getIstDateKey();
    const todayActivity = await DsaActivityDay.findOne({ userId, date: today }).lean();
    const heatmap = await DsaActivityDay.find({ userId })
      .sort({ date: -1 })
      .limit(400)
      .lean();

    const recentSubmissions = await DsaSubmission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('problemId', 'title slug difficulty')
      .lean();

    const recentlySolved = await DsaUserProgress.find({ userId, status: 'solved' })
      .sort({ firstSolvedAt: -1 })
      .limit(8)
      .populate('problemId', 'title slug difficulty category')
      .lean();

    // Recommended: unsolved Easy in weakest topics
    const solvedIds = await DsaUserProgress.find({ userId, status: 'solved' }).distinct('problemId');
    const recommended = await DsaCatalogProblem.find({
      status: 'published',
      _id: { $nin: solvedIds },
      difficulty: 'Easy',
    })
      .sort({ order: 1 })
      .limit(6)
      .select('title slug difficulty category companyTags')
      .lean();

    const accuracy =
      stats.totalSubmissions > 0
        ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
        : 0;

    const timedAccepts = await DsaSubmission.find({
      userId,
      status: 'Accepted',
      elapsedMs: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('problemId', 'title slug difficulty')
      .lean();

    const byDifficulty = { Easy: [], Medium: [], Hard: [] };
    for (const s of timedAccepts) {
      const diff = s.problemId?.difficulty;
      if (diff && byDifficulty[diff]) byDifficulty[diff].push(s.elapsedMs);
    }
    const avgByDifficulty = {};
    for (const [diff, arr] of Object.entries(byDifficulty)) {
      avgByDifficulty[diff] = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    }

    const trend = timedAccepts
      .slice(0, 20)
      .reverse()
      .filter((s) => s.problemId)
      .map((s) => ({
        date: s.createdAt,
        elapsedMs: s.elapsedMs,
        difficulty: s.problemId.difficulty,
        title: s.problemId.title,
        slug: s.problemId.slug,
      }));

    const fastest = [...timedAccepts]
      .filter((s) => s.problemId)
      .sort((a, b) => a.elapsedMs - b.elapsedMs)
      .slice(0, 5)
      .map((s) => ({
        title: s.problemId.title,
        slug: s.problemId.slug,
        difficulty: s.problemId.difficulty,
        elapsedMs: s.elapsedMs,
      }));

    res.json({
      totalProblems,
      remaining: Math.max(0, totalProblems - (stats.totalSolved || 0)),
      stats: {
        ...stats,
        topicProgress: stats.topicProgress instanceof Map
          ? Object.fromEntries(stats.topicProgress)
          : stats.topicProgress || {},
        companyProgress: stats.companyProgress instanceof Map
          ? Object.fromEntries(stats.companyProgress)
          : stats.companyProgress || {},
        accuracy,
        solvedToday: todayActivity?.solvedCount || 0,
      },
      heatmap: heatmap.map((h) => ({
        date: h.date,
        count: (h.solvedCount || 0) + (h.attemptCount || 0),
        solvedCount: h.solvedCount,
        attemptCount: h.attemptCount,
      })),
      recentSubmissions,
      recentlySolved,
      recommended,
      speed: { avgByDifficulty, trend, fastest },
    });
  } catch (error) {
    next(error);
  }
};

export const listDiscussions = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(5, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = { problemId: problem._id, parentId: null };
    const total = await DsaDiscussion.countDocuments(filter);

    const threads = await DsaDiscussion.find(filter)
      .sort({ upvotes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username profilePicture')
      .lean();

    const ids = threads.map((t) => t._id);
    const replies = ids.length
      ? await DsaDiscussion.find({ parentId: { $in: ids } })
          .sort({ createdAt: 1 })
          .populate('userId', 'username profilePicture')
          .lean()
      : [];

    const allIds = [...ids, ...replies.map((r) => r._id)];
    const votes = allIds.length
      ? await DsaDiscussionVote.find({
          userId: req.user.id,
          discussionId: { $in: allIds },
        }).lean()
      : [];

    const voteMap = new Map(
      votes.map((v) => [String(v.discussionId), v.value === -1 ? -1 : 1]),
    );

    const shape = (doc) => ({
      ...doc,
      downvotes: doc.downvotes || 0,
      code: doc.code || '',
      codeLanguage: doc.codeLanguage || '',
      myVote: voteMap.get(String(doc._id)) || 0,
    });

    const replyMap = {};
    for (const r of replies) {
      const key = String(r.parentId);
      if (!replyMap[key]) replyMap[key] = [];
      replyMap[key].push(shape(r));
    }

    const totalPages = Math.max(1, Math.ceil(total / limit));
    res.json({
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      discussions: threads.map((t) => ({
        ...shape(t),
        replies: replyMap[String(t._id)] || [],
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createDiscussion = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const {
      title = '',
      body = '',
      code = '',
      codeLanguage = '',
      parentId = null,
    } = req.body || {};

    const text = String(body || '').trim();
    const codeText = String(code || '').trim();
    if (!text && !codeText) {
      return res.status(400).json({ message: 'Add text and/or code to post' });
    }

    if (parentId) {
      const parent = await DsaDiscussion.findById(parentId).lean();
      if (!parent || String(parent.problemId) !== String(problem._id)) {
        return res.status(400).json({ message: 'Invalid parent post' });
      }
      if (parent.parentId) {
        return res.status(400).json({ message: 'Only one reply level is supported' });
      }
    }

    const doc = await DsaDiscussion.create({
      problemId: problem._id,
      userId: req.user.id,
      title: parentId ? '' : String(title || '').slice(0, 120),
      body: text,
      code: codeText,
      codeLanguage: codeText ? String(codeLanguage || '').slice(0, 40) : '',
      parentId: parentId || null,
    });

    if (parentId) {
      await DsaDiscussion.updateOne({ _id: parentId }, { $inc: { replyCount: 1 } });
    }

    const populated = await DsaDiscussion.findById(doc._id)
      .populate('userId', 'username profilePicture')
      .lean();

    res.status(201).json({
      discussion: {
        ...populated,
        downvotes: 0,
        myVote: 0,
        replies: parentId ? undefined : [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const voteDiscussion = async (req, res, next) => {
  try {
    const discussionId = req.params.discussionId;
    const raw = Number(req.body?.value);
    const value = raw === -1 ? -1 : 1;

    const discussion = await DsaDiscussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const existing = await DsaDiscussionVote.findOne({
      userId: req.user.id,
      discussionId,
    });

    if (existing) {
      const prev = existing.value === -1 ? -1 : 1;
      if (prev === value) {
        await existing.deleteOne();
        const inc = value === 1 ? { upvotes: -1 } : { downvotes: -1 };
        await DsaDiscussion.updateOne({ _id: discussionId }, { $inc: inc });
        const updated = await DsaDiscussion.findById(discussionId).lean();
        return res.json({
          myVote: 0,
          upvotes: updated.upvotes || 0,
          downvotes: updated.downvotes || 0,
        });
      }
      existing.value = value;
      await existing.save();
      const inc =
        value === 1
          ? { upvotes: 1, downvotes: -1 }
          : { upvotes: -1, downvotes: 1 };
      await DsaDiscussion.updateOne({ _id: discussionId }, { $inc: inc });
      const updated = await DsaDiscussion.findById(discussionId).lean();
      return res.json({
        myVote: value,
        upvotes: updated.upvotes || 0,
        downvotes: updated.downvotes || 0,
      });
    }

    await DsaDiscussionVote.create({ userId: req.user.id, discussionId, value });
    const inc = value === 1 ? { upvotes: 1 } : { downvotes: 1 };
    await DsaDiscussion.updateOne({ _id: discussionId }, { $inc: inc });
    const updated = await DsaDiscussion.findById(discussionId).lean();
    res.json({
      myVote: value,
      upvotes: updated.upvotes || 0,
      downvotes: updated.downvotes || 0,
    });
  } catch (error) {
    next(error);
  }
};

function periodStart(period) {
  const now = new Date();
  if (period === 'weekly') {
    const day = now.getUTCDay();
    const diff = (day + 6) % 7; // Monday start
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - diff);
    return start;
  }
  if (period === 'monthly') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  return null;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function leaderboardSort(sortBy) {
  if (sortBy === 'solved') {
    return { completedCount: -1, totalPoints: -1, lastCompletedAt: -1 };
  }
  if (sortBy === 'recent') {
    return { lastCompletedAt: -1, totalPoints: -1, completedCount: -1 };
  }
  return { totalPoints: -1, completedCount: -1, lastCompletedAt: -1 };
}

export const getLeaderboard = async (req, res, next) => {
  try {
    const period = ['weekly', 'monthly', 'all'].includes(req.query.period)
      ? req.query.period
      : 'all';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const q = String(req.query.q || '').trim().slice(0, 64);
    const sortBy = ['points', 'solved', 'recent'].includes(req.query.sort)
      ? req.query.sort
      : 'points';
    const minSolved = Math.max(0, parseInt(req.query.minSolved, 10) || 0);
    const minPoints = Math.max(0, parseInt(req.query.minPoints, 10) || 0);
    const start = periodStart(period);

    const match = { status: 'solved', firstSolvedAt: { $ne: null } };
    if (start) match.firstSolvedAt = { $gte: start };

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'dsa_problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$userId',
          completedCount: { $sum: 1 },
          totalPoints: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$problem.difficulty', 'Easy'] }, then: 10 },
                  { case: { $eq: ['$problem.difficulty', 'Medium'] }, then: 20 },
                  { case: { $eq: ['$problem.difficulty', 'Hard'] }, then: 30 },
                ],
                default: 10,
              },
            },
          },
          lastCompletedAt: { $max: '$firstSolvedAt' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          profilePicture: '$user.profilePicture',
          completedCount: 1,
          totalPoints: 1,
          lastCompletedAt: 1,
        },
      },
    ];

    const postFilters = {};
    if (q) {
      postFilters.username = { $regex: escapeRegex(q), $options: 'i' };
    }
    if (minSolved > 0) postFilters.completedCount = { $gte: minSolved };
    if (minPoints > 0) postFilters.totalPoints = { $gte: minPoints };
    if (Object.keys(postFilters).length) {
      pipeline.push({ $match: postFilters });
    }

    pipeline.push({ $sort: leaderboardSort(sortBy) });
    pipeline.push({
      $facet: {
        meta: [{ $count: 'total' }],
        items: [{ $skip: skip }, { $limit: limit }],
      },
    });

    const [agg] = await DsaUserProgress.aggregate(pipeline);
    const total = agg?.meta?.[0]?.total || 0;
    const items = agg?.items || [];
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      period,
      page,
      limit,
      total,
      totalPages,
      sort: sortBy,
      q,
      minSolved: minSolved || undefined,
      minPoints: minPoints || undefined,
      leaderboard: items.map((r, i) => ({
        ...r,
        rank: skip + i + 1,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const streamLeaderboard = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const period = req.query.period || 'all';
  let closed = false;

  const send = async () => {
    if (closed) return;
    try {
      req.query.period = period;
      req.query.limit = req.query.limit || 20;
      req.query.page = req.query.page || 1;
      const fakeRes = {
        json: (payload) => {
          res.write(`data: ${JSON.stringify(payload)}\n\n`);
        },
      };
      await getLeaderboard(req, fakeRes, () => {});
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  };

  await send();
  const id = setInterval(send, 10000);
  req.on('close', () => {
    closed = true;
    clearInterval(id);
  });
};

export const getWeeklyWinners = async (req, res, next) => {
  try {
    req.query.period = 'weekly';
    req.query.limit = 3;
    req.query.page = 1;
    req.query.q = '';
    req.query.sort = 'points';
    delete req.query.minSolved;
    delete req.query.minPoints;
    return getLeaderboard(req, res, next);
  } catch (error) {
    next(error);
  }
};

/* ——— Admin catalog CRUD ——— */

export const adminListProblems = async (req, res, next) => {
  try {
    const problems = await DsaCatalogProblem.find({})
      .sort({ order: 1 })
      .select('title slug difficulty category status order stats companyTags legacyProblemName')
      .lean();
    res.json({ problems });
  } catch (error) {
    next(error);
  }
};

export const adminGetProblem = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findById(req.params.id).lean();
    if (!problem) return res.status(404).json({ message: 'Not found' });
    const tests = await DsaTestCase.find({ problemId: problem._id }).sort({ index: 1 }).lean();
    res.json({ problem, tests, validation: validateTestSuite(tests) });
  } catch (error) {
    next(error);
  }
};

export const adminUpsertProblem = async (req, res, next) => {
  try {
    const data = req.body || {};
    const id = req.params.id;
    let problem;
    if (id && id !== 'new') {
      problem = await DsaCatalogProblem.findByIdAndUpdate(id, { $set: data }, { new: true });
    } else {
      problem = await DsaCatalogProblem.create(data);
    }
    res.json({ problem });
  } catch (error) {
    next(error);
  }
};

export const adminReplaceTests = async (req, res, next) => {
  try {
    const problemId = req.params.id;
    const tests = req.body.tests || [];
    const validation = validateTestSuite(tests);
    if (!validation.ok && req.body.force !== true) {
      return res.status(400).json({ message: 'Test suite validation failed', validation });
    }
    await DsaTestCase.deleteMany({ problemId });
    const docs = tests.map((t, index) => ({
      problemId,
      index: t.index ?? index,
      stdin: t.stdin,
      expectedStdout: t.expectedStdout,
      isSample: !!t.isSample,
      isHidden: t.isHidden !== false,
      caseKind: t.caseKind || 'typical',
      edgeTags: t.edgeTags || [],
      timeLimitMs: t.timeLimitMs || 2000,
      weight: t.weight || 1,
    }));
    await DsaTestCase.insertMany(docs);
    res.json({ ok: true, count: docs.length, validation });
  } catch (error) {
    next(error);
  }
};

export const adminPublishProblem = async (req, res, next) => {
  try {
    const problem = await DsaCatalogProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Not found' });
    const tests = await DsaTestCase.find({ problemId: problem._id }).lean();
    const validation = validateTestSuite(tests);
    if (!validation.ok) {
      return res.status(400).json({ message: 'Cannot publish: test suite invalid', validation });
    }
    if (!problem.statement || (problem.examples || []).length < 2) {
      return res.status(400).json({ message: 'Cannot publish: statement/examples incomplete' });
    }
    problem.status = 'published';
    await problem.save();
    res.json({ problem, validation });
  } catch (error) {
    next(error);
  }
};
