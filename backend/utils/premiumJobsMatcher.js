import mongoose from 'mongoose';
import CompanyDetail from '../models/companyDetail.model.js';
import IgnoreList from '../models/ignoreList.model.js';

// The live `naukri` collection's real field names (`title`, `location` as a
// plain string, `min_exp` as a Number) diverge from the Mongoose schema
// declared inline in backend/index.js (`job_title`, `location: [String]`) —
// confirmed by sampling production data. Query the raw collection directly
// (same approach already used in admin.controller.js's overview KPIs)
// instead of going through that mismatched model.
function naukriCollection() {
  return mongoose.connection.db.collection('naukri');
}

const APPLY_LINK_FILTER = {
  apply_link: { $exists: true, $ne: null, $ne: '' },
  $and: [
    { apply_link: { $ne: 'Not Found' } },
    { apply_link: { $ne: 'about:blank' } },
    { apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } } },
    { apply_link: { $regex: /^https?:\/\/.+\..+/i } },
  ],
};

export function formatLink(input) {
  let formatted = String(input || '').toLowerCase();
  formatted = formatted.replace(/\s+/g, '-');
  formatted = formatted.replace(/[^\w-]+/g, '');
  formatted = formatted.replace(/-+/g, '-');
  return formatted;
}

// Matches the frontend's formatUrlString + /fulljd/:url/:id route exactly
// (frontend/src/pages/MyJobs.jsx, frontend/src/components/JobTable.jsx) —
// NOT the legacy Python tool's slightly different "-/" separator.
export function buildApplyPath(company, title, jobId) {
  return `/fulljd/${formatLink(company)}-${formatLink(title)}/${jobId}`;
}

// Fetch every candidate job for a single exact YOE value, filtered against
// the ignorelist/company_details join and ranked-ready shape — batching the
// company lookups (unlike the legacy Python tool's per-job round trips).
async function findFreshJobsForYoe({ yoe, category, excludeJobIds }) {
  const query = {
    ...APPLY_LINK_FILTER,
    min_exp: yoe,
    _id: { $nin: excludeJobIds },
    ...(category ? { category: new RegExp(`^${category}$`, 'i') } : {}),
  };

  const jobs = await naukriCollection().find(query).toArray();
  if (jobs.length === 0) return [];

  const companyNames = [...new Set(
    jobs.map((job) => (job.company || '').toLowerCase()).filter(Boolean),
  )];

  const [ignoredDocs, companyDetailDocs] = await Promise.all([
    IgnoreList.find({ company: { $in: companyNames } }).lean(),
    CompanyDetail.find({ company: { $in: companyNames } }).lean(),
  ]);

  const ignoredSet = new Set(ignoredDocs.map((d) => d.company));
  const companyDetailMap = new Map(companyDetailDocs.map((d) => [d.company, d]));

  const results = [];
  for (const job of jobs) {
    const companyName = (job.company || '').toLowerCase();
    if (!companyName) continue;
    if (ignoredSet.has(companyName)) continue;

    const companyDetail = companyDetailMap.get(companyName);
    if (!companyDetail) continue; // legacy requires a company_details doc to exist

    results.push({
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      min_exp: job.min_exp,
      follower: companyDetail.follower || 0,
      // Legacy behavior: send users to our own full-JD page (which links out
      // to the real apply_link) rather than the raw external URL directly.
      applyPath: buildApplyPath(job.company, job.title, job._id),
    });
  }
  return results;
}

// Port of the legacy get_job_send_email fallback: decrement YOE (floor 0)
// until >=10 fresh (not-already-sent) matches are found, merge across
// iterations, sort by (-min_exp, -follower), truncate to top 10.
export async function matchTop10JobsForSubscriber(subscription) {
  const seen = new Set();
  const matches = [];
  // naukri.min_exp is an integer. Subscribers may enter floats (e.g. 2.5),
  // which never exact-match — floor so 2.5 → 2, then walk down 1, 0, …
  let currentYoe = Math.floor(Number(subscription.yoe));
  if (!Number.isFinite(currentYoe) || currentYoe < 0) currentYoe = 0;

  while (matches.length < 10 && currentYoe >= 0) {
    const fresh = await findFreshJobsForYoe({
      yoe: currentYoe,
      category: subscription.category,
      excludeJobIds: subscription.sentJobIds,
    });
    for (const job of fresh) {
      const key = String(job._id);
      if (!seen.has(key)) {
        seen.add(key);
        matches.push(job);
      }
    }
    if (matches.length >= 10) break;
    currentYoe -= 1;
  }

  matches.sort((a, b) => (b.min_exp - a.min_exp) || (b.follower - a.follower));

  return { jobs: matches.slice(0, 10), matchedYoe: currentYoe };
}
