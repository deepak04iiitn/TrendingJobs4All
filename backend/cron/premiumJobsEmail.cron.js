import cron from 'node-cron';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import PremiumEmailLog from '../models/premiumEmailLog.model.js';
import User from '../models/user.model.js';
import { matchTop10JobsForSubscriber } from '../utils/premiumJobsMatcher.js';
import { sendPremiumJobsEmail } from '../utils/premiumJobsEmail.js';
import { notifyFoundersPremiumDeliveryIssues } from '../utils/premiumJobsDeliveryAlert.js';

export function registerPremiumJobsCron() {
  const schedule = process.env.PREMIUM_JOBS_CRON_SCHEDULE || '0 3 * * *';
  cron.schedule(schedule, () => {
    runPremiumJobsBatch().catch(async (err) => {
      console.error('Premium Jobs cron batch failed:', err);
      try {
        await notifyFoundersPremiumDeliveryIssues({
          runDate: new Date().toISOString().slice(0, 10),
          activeCount: 0,
          sentCount: 0,
          issues: [],
          batchError: err?.message || String(err),
        });
      } catch (alertErr) {
        console.error('Premium Jobs delivery alert failed:', alertErr);
      }
    });
  });
}

async function enrichUserFields(userId) {
  try {
    const user = await User.findById(userId).select('username email').lean();
    return {
      username: user?.username || '',
      email: user?.email || '',
    };
  } catch {
    return { username: '', email: '' };
  }
}

// Exported standalone so admin "trigger batch" / "send now" endpoints can
// invoke it directly, without waiting for the daily schedule.
export async function runPremiumJobsBatch({ subscriptionId } = {}) {
  const runDate = new Date().toISOString().slice(0, 10);

  const query = subscriptionId
    ? { _id: subscriptionId, status: 'active' }
    : { status: 'active' };

  const activeSubs = await PremiumSubscription.find(query);
  const results = [];

  for (const sub of activeSubs) {
    try {
      const { jobs, matchedYoe } = await matchTop10JobsForSubscriber(sub);

      if (jobs.length === 0) {
        const who = await enrichUserFields(sub.userId);
        await PremiumEmailLog.create({
          subscriptionId: sub._id,
          userId: sub.userId,
          runDate,
          status: 'skipped_no_jobs',
          matchedYoe,
        });
        results.push({
          subscriptionId: sub._id,
          userId: sub.userId,
          ...who,
          status: 'skipped_no_jobs',
          matchedYoe,
        });
        continue;
      }

      const user = await User.findById(sub.userId).lean();
      if (!user) {
        await PremiumEmailLog.create({
          subscriptionId: sub._id,
          userId: sub.userId,
          runDate,
          status: 'failed',
          errorMessage: 'User not found',
        });
        results.push({
          subscriptionId: sub._id,
          userId: sub.userId,
          username: '',
          email: '',
          status: 'failed',
          errorMessage: 'User not found',
        });
        continue;
      }

      const sendResult = await sendPremiumJobsEmail({ user, jobs });

      sub.sentJobIds.push(...jobs.map((j) => j._id));
      sub.lastEmailSentAt = new Date();
      sub.lastEmailJobCount = jobs.length;
      await sub.save();

      await PremiumEmailLog.create({
        subscriptionId: sub._id,
        userId: sub.userId,
        runDate,
        status: 'sent',
        jobIds: jobs.map((j) => j._id),
        matchedYoe,
        resendMessageId: sendResult?.data?.id || null,
      });
      results.push({
        subscriptionId: sub._id,
        userId: sub.userId,
        username: user.username,
        email: user.email,
        status: 'sent',
        jobCount: jobs.length,
      });
    } catch (error) {
      console.error(`Premium Jobs email failed for subscription ${sub._id}:`, error);
      const who = await enrichUserFields(sub.userId);
      await PremiumEmailLog.create({
        subscriptionId: sub._id,
        userId: sub.userId,
        runDate,
        status: 'failed',
        errorMessage: error.message,
      });
      results.push({
        subscriptionId: sub._id,
        userId: sub.userId,
        ...who,
        status: 'failed',
        errorMessage: error.message,
      });
    }
  }

  const sentCount = results.filter((r) => r.status === 'sent').length;
  const issues = results.filter((r) => r.status === 'failed' || r.status === 'skipped_no_jobs');

  if (issues.length > 0) {
    notifyFoundersPremiumDeliveryIssues({
      runDate,
      activeCount: activeSubs.length,
      sentCount,
      issues,
    }).catch((err) => {
      console.error('Premium Jobs delivery alert failed:', err);
    });
  }

  return results;
}
