import Comment from '../models/comment.model.js';
import InterviewExperience from '../models/interview.model.js';
import Salary from '../models/salary.model.js';
import User from '../models/user.model.js';
import Blog from '../models/blog.model.js';
import InterviewQuestion from '../models/interviewQuestion.model.js';
import BugReport from '../models/bugReport.model.js';
import FeatureRequest from '../models/featureRequest.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resolveDsaProblemCount() {
  try {
    const count = await DsaCatalogProblem.countDocuments({ status: 'published' });
    if (count > 0) return count;
  } catch {
    // fall through to JSON
  }
  try {
    const dsaData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../frontend/src/data/dsa.json'), 'utf8'),
    );
    return Array.isArray(dsaData) ? new Set(dsaData.map((r) => r['Problem Name'])).size : 0;
  } catch {
    return 0;
  }
}

export const statistics = async (req, res) => {
  try {
    const usersLength = await User.countDocuments();
    const commentsLength = await Comment.countDocuments();
    const interviewExperiencesLength = await InterviewExperience.countDocuments();
    const salariesLength = await Salary.countDocuments();

    res.json({
      usersLength,
      commentsLength,
      interviewExperiencesLength,
      salariesLength,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform statistics' });
  }
};

function monthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function lastSixMonthKeys() {
  const keys = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      key: monthKey(d),
      label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return keys;
}

export const overview = async (req, res, next) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const months = lastSixMonthKeys();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const jobsFilter = {
      apply_link: { $exists: true, $ne: null, $ne: '' },
      $and: [
        { apply_link: { $ne: 'Not Found' } },
        { apply_link: { $ne: 'about:blank' } },
        { apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } } },
        { apply_link: { $regex: /^https?:\/\/.+\..+/i } },
      ],
    };

    const [
      usersLength,
      commentsLength,
      interviewExperiencesLength,
      salariesLength,
      lastMonthUsers,
      visitedCount,
      publishedBlogs,
      totalBlogs,
      blogEngagement,
      questionSets,
      roadmapsCount,
      jobsCount,
      bugsPending,
      bugsResolved,
      featuresPending,
      featuresImplemented,
      recentBugs,
      recentFeatures,
      recentBlogs,
      userGrowthAgg,
      activePremiumSubscribers,
    ] = await Promise.all([
      User.countDocuments(),
      Comment.countDocuments(),
      InterviewExperience.countDocuments(),
      Salary.countDocuments(),
      User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
      User.countDocuments({ lastVisit: { $exists: true, $ne: null } }),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments(),
      Blog.aggregate([
        { $group: { _id: null, views: { $sum: '$views' }, likes: { $sum: '$likes' } } },
      ]),
      InterviewQuestion.countDocuments(),
      Roadmap.countDocuments(),
      mongoose.connection.db.collection('naukri').countDocuments(jobsFilter),
      BugReport.countDocuments({ status: 'Pending' }),
      BugReport.countDocuments({ status: 'Resolved' }),
      FeatureRequest.countDocuments({ status: 'Pending' }),
      FeatureRequest.countDocuments({ status: 'Implemented' }),
      BugReport.find({ status: 'Pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email description status createdAt')
        .lean(),
      FeatureRequest.find({ status: 'Pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email description status createdAt')
        .lean(),
      Blog.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title slug views likes category publishedAt')
        .lean(),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              y: { $year: '$createdAt' },
              m: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      PremiumSubscription.countDocuments({ status: 'active' }),
    ]);

    const growthMap = new Map(
      userGrowthAgg.map((row) => [
        `${row._id.y}-${String(row._id.m).padStart(2, '0')}`,
        row.count,
      ]),
    );

    const userGrowth = months.map(({ key, label }) => ({
      month: label,
      key,
      registered: growthMap.get(key) || 0,
    }));

    const totalViews = blogEngagement[0]?.views || 0;
    const totalLikes = blogEngagement[0]?.likes || 0;

    res.status(200).json({
      kpis: {
        users: usersLength,
        lastMonthUsers,
        visitedCount,
        comments: commentsLength,
        interviews: interviewExperiencesLength,
        salaries: salariesLength,
        jobs: jobsCount,
        blogs: publishedBlogs,
        totalBlogs,
        blogViews: totalViews,
        blogLikes: totalLikes,
        questionSets,
        roadmaps: roadmapsCount,
        dsaProblems: await resolveDsaProblemCount(),
        bugsPending,
        bugsResolved,
        featuresPending,
        featuresImplemented,
        activePremiumSubscribers,
        premiumMrr: activePremiumSubscribers * 149,
      },
      charts: {
        userGrowth,
        contentMix: [
          { name: 'Interviews', value: interviewExperiencesLength },
          { name: 'Salaries', value: salariesLength },
          { name: 'Question sets', value: questionSets },
          { name: 'Jobs', value: jobsCount },
          { name: 'Blogs', value: publishedBlogs },
        ],
        feedbackStatus: [
          { name: 'Bugs pending', value: bugsPending },
          { name: 'Bugs resolved', value: bugsResolved },
          { name: 'Features pending', value: featuresPending },
          { name: 'Features done', value: featuresImplemented },
        ],
      },
      queues: {
        bugs: recentBugs,
        features: recentFeatures,
        blogs: recentBlogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
