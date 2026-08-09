import mongoose from 'mongoose';
import CompanyDetail from '../models/companyDetail.model.js';
import IgnoreList from '../models/ignoreList.model.js';
import { buildApplyPath } from './premiumJobsMatcher.js';

function naukriCollection() {
  return mongoose.connection.db.collection('naukri');
}

/** Same weekday → YOE map as the legacy telegram test_suite. */
const DAY_YOE_MAP = {
  saturday: 2,
  sunday: 3,
  monday: 4,
  tuesday: 5,
  wednesday: 6,
  thursday: 7,
  friday: 8,
};

const DEFAULT_ROLES = ['qa'];

const CHANNEL_ENV_BY_ROLE = {
  qa: 'TELEGRAM_CHANNEL_QA',
  developer: 'TELEGRAM_CHANNEL_DEV',
  devops: 'TELEGRAM_CHANNEL_DEVOPS',
  intern: 'TELEGRAM_CHANNEL_INTERN',
};

function getIstParts(date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata',
  })
    .format(date)
    .toLowerCase();

  const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return { weekday, isoDate };
}

function escapeMarkdown(text) {
  return String(text ?? '').replace(/([*_{}\[\]()#+\-!])/g, '\\$1');
}

function splitMessage(message, chunkSize = 4000) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * `naukri.location` is inconsistently stored as:
 * - a plain string ("Mumbai Metropolitan Region")
 * - an array of place parts (["Hyderabad", "Telangana"])
 * - a character array (["M","u","m","b","a","i",...]) when a string was
 *   written through the Mongoose `[String]` schema (strings are iterable,
 *   so Mongoose casts "Mumbai" → ["M","u","m","b","a","i"]).
 *
 * Joining a char-array with "," produced the Telegram bug:
 * "M,u,m,b,a,i, ,M,e,t,r,o,..."
 */
function formatLocation(location) {
  if (location == null || location === '') return '';

  if (Array.isArray(location)) {
    const parts = location.filter((part) => part != null && String(part).length > 0);
    if (parts.length === 0) return '';

    const isCharArray = parts.every((part) => typeof part === 'string' && part.length === 1);
    if (isCharArray) return parts.join('');

    return parts.map((part) => String(part).trim()).filter(Boolean).join(', ');
  }

  return String(location).trim();
}

function isValidApplyLink(applyLink) {
  if (!applyLink) return false;
  const value = String(applyLink).toLowerCase();
  return !value.includes('not');
}

function isValidMinExp(minExp) {
  return !String(minExp ?? '')
    .toLowerCase()
    .includes('not');
}

function resolveRoles() {
  const raw = process.env.TELEGRAM_JOBS_ROLES || DEFAULT_ROLES.join(',');
  return raw
    .split(',')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
}

function resolveChannelId(role) {
  const envKey = CHANNEL_ENV_BY_ROLE[role];
  const fromEnv = envKey ? process.env[envKey] : null;
  if (fromEnv) return fromEnv;
  if (role === 'qa') return process.env.TELEGRAM_CHANNEL_ID || null;
  return null;
}

function resolveSiteBaseUrl() {
  return (process.env.TELEGRAM_SITE_BASE_URL || 'https://route2hire.com').replace(/\/$/, '');
}

function resolveInstagramUrl() {
  return process.env.TELEGRAM_INSTAGRAM_URL || 'https://instagram.com/route2hire/';
}

function resolvePremiumJobsUrl() {
  return (
    process.env.TELEGRAM_PREMIUM_JOBS_URL ||
    `${resolveSiteBaseUrl()}/premium-jobs`
  );
}

/**
 * Port of legacy db_ops.new_jobs(..., 'telegram', role):
 * category + min_exp + missing telegram_status, ignorelist + company_details filter.
 */
export async function fetchTelegramJobs({ role, expList }) {
  const query = {
    category: role,
    min_exp: { $in: expList },
    telegram_status: { $exists: false },
  };

  const jobs = await naukriCollection().find(query).toArray();
  if (jobs.length === 0) return [];

  const companyNames = [
    ...new Set(jobs.map((job) => (job.company || '').toLowerCase()).filter(Boolean)),
  ];

  const [ignoredDocs, companyDetailDocs] = await Promise.all([
    IgnoreList.find({ company: { $in: companyNames } }).lean(),
    CompanyDetail.find({ company: { $in: companyNames } }).lean(),
  ]);

  const ignoredSet = new Set(ignoredDocs.map((doc) => doc.company));
  const companyDetailMap = new Map(companyDetailDocs.map((doc) => [doc.company, doc]));
  const siteBase = resolveSiteBaseUrl();
  const results = [];

  for (const job of jobs) {
    const companyName = (job.company || '').toLowerCase();
    if (!companyName) continue;
    if (ignoredSet.has(companyName)) continue;

    const companyDetail = companyDetailMap.get(companyName);
    if (!companyDetail) continue;
    if (!isValidMinExp(job.min_exp)) continue;
    if (!isValidApplyLink(job.apply_link)) continue;

    results.push({
      _id: job._id,
      title: job.title,
      company: job.company,
      location: formatLocation(job.location),
      min_exp: job.min_exp,
      follower: companyDetail.follower || 0,
      Apply: `${siteBase}${buildApplyPath(job.company, job.title, job._id)}`,
    });
  }

  return results;
}

export function selectJobsForTelegram(jobOpenings, limit = 10) {
  return [...jobOpenings]
    .sort((a, b) => a.min_exp - b.min_exp || b.follower - a.follower)
    .slice(0, limit);
}

export function buildTelegramMessage(jobOpenings, { isoDate } = {}) {
  const dateLabel = isoDate || getIstParts().isoDate;
  let combined = `📢 **[${dateLabel}] Latest Job Openings** 👇👇\n`;

  for (const job of jobOpenings) {
    combined += `
📝 **Title**: ${escapeMarkdown(job.title)}
🏛️ **Company**: ${escapeMarkdown(job.company)}
🌍 **Location**: ${escapeMarkdown(job.location)}
⏳ **Min Exp**: ${job.min_exp} yrs
🔗 **Apply Here**: [Click to Apply](${job.Apply})
                \n`;
  }

  combined += '\n ❗Note: If Apply link is not working request to search it on the career page of that company \n';
  combined += `\n ⭐ Get curated jobs in your inbox daily: [Premium Jobs](${resolvePremiumJobsUrl()})`;
  combined += `\n Follow for QA content: [Instagram](${resolveInstagramUrl()})`;
  return combined;
}

async function sendTelegramMessage({ token, chatId, text }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error (${response.status})`);
  }
  return data;
}

export async function markTelegramStatus(jobs) {
  const collection = naukriCollection();
  for (const job of jobs) {
    await collection.updateMany(
      { company: job.company, title: job.title },
      { $set: { telegram_status: 1 } }
    );
  }
}

export async function postJobsForRole(role, { now = new Date() } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  const chatId = resolveChannelId(role);
  if (!chatId) {
    throw new Error(`No Telegram channel configured for role "${role}"`);
  }

  const { weekday, isoDate } = getIstParts(now);
  const expList = role === 'intern' ? [0] : [DAY_YOE_MAP[weekday]];
  if (expList[0] == null) {
    throw new Error(`Unable to resolve YOE for weekday "${weekday}"`);
  }

  const rawJobs = await fetchTelegramJobs({ role, expList });
  if (rawJobs.length === 0) {
    return {
      role,
      status: 'skipped_no_jobs',
      weekday,
      expList,
      jobCount: 0,
    };
  }

  const jobOpenings = selectJobsForTelegram(rawJobs, 10);
  const message = buildTelegramMessage(jobOpenings, { isoDate });
  const chunks = splitMessage(message);

  for (const chunk of chunks) {
    await sendTelegramMessage({ token, chatId, text: chunk });
  }

  await markTelegramStatus(jobOpenings);

  return {
    role,
    status: 'sent',
    weekday,
    expList,
    jobCount: jobOpenings.length,
    channel: chatId,
  };
}

/**
 * Daily batch: mirrors test_suite.test_send2telegram (currently QA-only by default).
 */
export async function runTelegramJobsBatch(options = {}) {
  const roles = options.roles || resolveRoles();
  const results = [];

  for (const role of roles) {
    try {
      const result = await postJobsForRole(role, options);
      results.push(result);
      console.log(
        `[Telegram Jobs] ${role}: ${result.status}` +
          (result.jobCount ? ` (${result.jobCount} jobs, YOE ${result.expList})` : '')
      );
    } catch (error) {
      console.error(`[Telegram Jobs] ${role} failed:`, error);
      results.push({ role, status: 'failed', error: error.message });
    }
  }

  return results;
}

export { DAY_YOE_MAP, getIstParts };
