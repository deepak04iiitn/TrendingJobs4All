import cron from 'node-cron';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import PremiumEmailLog from '../models/premiumEmailLog.model.js';
import User from '../models/user.model.js';
import { matchTop10JobsForSubscriber } from '../utils/premiumJobsMatcher.js';
import { sendPremiumJobsEmail } from '../utils/premiumJobsEmail.js';

export function registerPremiumJobsCron() {
  const schedule = process.env.PREMIUM_JOBS_CRON_SCHEDULE || '0 3 * * *';
  cron.schedule(schedule, () => {
    runPremiumJobsBatch().catch((err) => {
      console.error('Premium Jobs cron batch failed:', err);
    });
  });
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
        await PremiumEmailLog.create({
          subscriptionId: sub._id,
          userId: sub.userId,
          runDate,
          status: 'skipped_no_jobs',
          matchedYoe,
        });
        results.push({ subscriptionId: sub._id, status: 'skipped_no_jobs' });
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
        results.push({ subscriptionId: sub._id, status: 'failed' });
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
      results.push({ subscriptionId: sub._id, status: 'sent', jobCount: jobs.length });
    } catch (error) {
      console.error(`Premium Jobs email failed for subscription ${sub._id}:`, error);
      await PremiumEmailLog.create({
        subscriptionId: sub._id,
        userId: sub.userId,
        runDate,
        status: 'failed',
        errorMessage: error.message,
      });
      results.push({ subscriptionId: sub._id, status: 'failed' });
    }
  }

  return results;
}
