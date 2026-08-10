/**
 * Migrate legacy DSAProblem progress → dsa_user_progress (+ activity/stats backfill).
 * Usage:
 *   node backend/scripts/migrate-dsa-progress.js --dry-run
 *   node backend/scripts/migrate-dsa-progress.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DSAProblem from '../models/dsaProblem.model.js';
import DsaCatalogProblem from '../models/dsaCatalogProblem.model.js';
import DsaUserProgress from '../models/dsaUserProgress.model.js';
import DsaActivityDay from '../models/dsaActivityDay.model.js';
import DsaUserStats from '../models/dsaUserStats.model.js';
import { DIFFICULTY_POINTS, getIstDateKey, levelFromXp } from '../utils/dsaConstants.js';

dotenv.config();

const dryRun = process.argv.includes('--dry-run');

async function main() {
  if (!process.env.MONGO) throw new Error('MONGO is not set');
  await mongoose.connect(process.env.MONGO);
  console.log(`Mongo connected (${dryRun ? 'DRY RUN' : 'WRITE'})`);

  const catalog = await DsaCatalogProblem.find({}).select('_id legacyProblemName difficulty category companyTags').lean();
  const byName = new Map(catalog.map((p) => [p.legacyProblemName, p]));
  console.log(`Catalog problems: ${catalog.length}`);

  const legacy = await DSAProblem.find({}).lean();
  console.log(`Legacy progress docs: ${legacy.length}`);

  let matched = 0;
  let unmatched = 0;
  const unmatchedNames = new Set();
  const perUser = new Map();

  for (const doc of legacy) {
    const problem = byName.get(doc.problemName);
    if (!problem) {
      unmatched += 1;
      unmatchedNames.add(doc.problemName);
      continue;
    }
    matched += 1;

    const status = doc.isCompleted ? 'solved' : doc.notes || doc.isFavorite ? 'attempted' : 'todo';
    const payload = {
      userId: doc.userId,
      problemId: problem._id,
      legacyProblemName: doc.problemName,
      status: doc.isCompleted ? 'solved' : status === 'todo' && (doc.isFavorite || doc.notes) ? 'attempted' : status,
      isFavorite: !!doc.isFavorite,
      notes: doc.notes || '',
      firstSolvedAt: doc.isCompleted ? doc.completedAt || doc.updatedAt || null : null,
      lastAttemptedAt: doc.updatedAt || null,
      attemptCount: doc.isCompleted ? 1 : 0,
      acceptedCount: doc.isCompleted ? 1 : 0,
    };

    if (!dryRun) {
      await DsaUserProgress.findOneAndUpdate(
        { userId: doc.userId, problemId: problem._id },
        { $set: payload },
        { upsert: true }
      );
    }

    const uid = String(doc.userId);
    if (!perUser.has(uid)) {
      perUser.set(uid, { userId: doc.userId, solved: [], favorites: 0 });
    }
    const bucket = perUser.get(uid);
    if (doc.isFavorite) bucket.favorites += 1;
    if (doc.isCompleted) {
      bucket.solved.push({
        difficulty: problem.difficulty,
        category: problem.category,
        companyTags: problem.companyTags || [],
        at: doc.completedAt || doc.updatedAt || new Date(),
      });
    }
  }

  if (!dryRun) {
    for (const { userId, solved } of perUser.values()) {
      const easy = solved.filter((s) => s.difficulty === 'Easy').length;
      const medium = solved.filter((s) => s.difficulty === 'Medium').length;
      const hard = solved.filter((s) => s.difficulty === 'Hard').length;
      const totalPoints = solved.reduce((sum, s) => sum + (DIFFICULTY_POINTS[s.difficulty] || 0), 0);
      const topicProgress = {};
      const companyProgress = {};
      for (const s of solved) {
        topicProgress[s.category] = (topicProgress[s.category] || 0) + 1;
        for (const c of s.companyTags) companyProgress[c] = (companyProgress[c] || 0) + 1;
      }

      // Activity days from completedAt
      for (const s of solved) {
        const date = getIstDateKey(new Date(s.at));
        await DsaActivityDay.findOneAndUpdate(
          { userId, date },
          { $inc: { solvedCount: 1, attemptCount: 1, xpEarned: DIFFICULTY_POINTS[s.difficulty] || 10 } },
          { upsert: true }
        );
      }

      await DsaUserStats.findOneAndUpdate(
        { userId },
        {
          $set: {
            totalSolved: solved.length,
            totalAttempted: solved.length,
            easySolved: easy,
            mediumSolved: medium,
            hardSolved: hard,
            totalPoints,
            xp: totalPoints,
            level: levelFromXp(totalPoints),
            lastSolvedAt: solved.length
              ? new Date(Math.max(...solved.map((s) => new Date(s.at).getTime())))
              : null,
            topicProgress,
            companyProgress,
          },
        },
        { upsert: true }
      );
    }
  }

  const report = {
    dryRun,
    catalogCount: catalog.length,
    legacyCount: legacy.length,
    matched,
    unmatched,
    unmatchedNames: [...unmatchedNames].slice(0, 50),
    usersTouched: perUser.size,
  };
  console.log(JSON.stringify(report, null, 2));

  if (unmatched > 0) {
    console.warn('WARNING: unmatched legacy problem names exist. Fix catalog before launch.');
  }

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
