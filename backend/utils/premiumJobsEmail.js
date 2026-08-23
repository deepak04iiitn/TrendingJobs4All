import { Resend } from 'resend';
import PremiumSubscription from '../models/premiumSubscription.model.js';
import User from '../models/user.model.js';

// Constructed lazily — see backend/utils/razorpay.js for why (dotenv.config()
// in index.js hasn't run yet at ESM import time).
let resendClient = null;
function getResendClient() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const SITE_URL = 'https://route2hire.com';
const INSTAGRAM_URL =
  process.env.ROUTE2HIRE_INSTAGRAM_URL ||
  'https://www.instagram.com/route2hire?igsh=ZGk5NTQyY2RiOGF1';

function jobCardHtml(job) {
  const locationText = Array.isArray(job.location) ? job.location.join(', ') : job.location;
  return `
    <div style="border-bottom:1px solid #dddddd;padding:16px 0;">
      <div style="font-size:18px;font-weight:bold;color:#0056b3;">${job.title}</div>
      <div style="color:#666666;margin-top:4px;">
        🏛️ Company: ${job.company}<br>
        🌍 Location: ${locationText}<br>
        ⏳ Experience: ${job.min_exp} yrs<br>
        🔗 <a href="${SITE_URL}${job.applyPath}" style="color:#0056b3;text-decoration:none;">View & Apply</a>
      </div>
    </div>
  `;
}

export function buildJobsEmailHtml(jobs, user) {
  const jobsHtml = jobs.map(jobCardHtml).join('');
  return `
    <html>
      <body style="font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:20px;">
        <div style="background-color:#ffffff;padding:24px;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.1);max-width:640px;margin:0 auto;">
          <h1 style="color:#333333;margin-top:0;">Your Premium Jobs Today</h1>
          <p style="color:#666666;">Hi ${user.username}, here are today's top ${jobs.length} QA/SDET roles matched to your profile.</p>
          ${jobsHtml}
          <div style="margin-top:24px;font-size:12px;color:#999999;">
            <p>You're receiving this because you're subscribed to Premium Jobs on Route2Hire.
            <a href="${SITE_URL}/myCorner?panel=premium" style="color:#0056b3;">Manage your subscription</a>.</p>
            <p>Best regards,<br>Route2Hire</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendPremiumJobsEmail({ user, jobs }) {
  return getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: user.email,
    subject: `${jobs.length} new QA/SDET job openings for you today`,
    html: buildJobsEmailHtml(jobs, user),
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWelcomeEmailHtml(user) {
  const name = escapeHtml(user?.username || 'there');
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F7F3EC;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F3EC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFDF8;border:1px solid #E5DCCE;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;background:#F7F3EC;border-bottom:1px solid #E5DCCE;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6B5A48;font-weight:700;">
                  Route2Hire · Premium Jobs
                </div>
                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#1C1917;font-family:Georgia,'Times New Roman',serif;font-weight:600;">
                  Welcome aboard — your subscription is confirmed
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;color:#57534E;font-size:15px;line-height:1.65;">
                <p style="margin:0 0 14px;color:#2C241B;">Dear ${name},</p>
                <p style="margin:0 0 14px;">
                  Thank you for trusting Route2Hire with your QA/SDET job search. We’re genuinely glad to have you with us, and we’re excited to help you discover roles that actually fit.
                </p>
                <p style="margin:0 0 14px;">
                  Your <strong style="color:#2C241B;">QA/SDET Jobs</strong> subscription is confirmed. Starting <strong style="color:#2C241B;">tomorrow</strong>, curated job suggestions will land in your registered inbox every day at <strong style="color:#2C241B;">8:30 AM IST</strong> — thoughtfully matched to your experience, focused on SDET and QA Automation opportunities.
                </p>
                <p style="margin:0 0 14px;">
                  There’s nothing else you need to set up. Just keep an eye on your inbox each morning, and take your time exploring the roles we send.
                </p>
                <p style="margin:0 0 14px;">
                  We hope these recommendations make your search feel a little lighter and a lot more intentional. Wishing you the very best — you’ve got this.
                </p>
                <p style="margin:22px 0 0;color:#2C241B;">
                  Warm regards,<br/>
                  <strong>Team Route2Hire</strong>
                </p>
                <p style="margin:22px 0 0;padding-top:18px;border-top:1px solid #E5DCCE;font-size:14px;line-height:1.6;color:#6B5A48;">
                  Follow us on Instagram for daily QA/SDET tips, openings, and updates:
                  <a href="${INSTAGRAM_URL}" style="color:#C4A574;font-weight:700;text-decoration:none;">@route2hire</a>
                  <br/>
                  <a href="${INSTAGRAM_URL}" style="color:#C4A574;font-size:13px;">${INSTAGRAM_URL}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 22px;border-top:1px solid #E5DCCE;font-size:12px;color:#A89B8A;">
                Manage your plan anytime from
                <a href="${SITE_URL}/myCorner?panel=premium" style="color:#6B5A48;">My Corner</a>
                · ${SITE_URL}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

export async function sendPremiumWelcomeEmail({ user }) {
  if (!user?.email) {
    throw new Error('User email is required for welcome email');
  }
  return getResendClient().emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: user.email,
    subject: 'Welcome to Route2Hire Premium Jobs — you’re all set',
    html: buildWelcomeEmailHtml(user),
  });
}

/**
 * Send the one-time welcome email if it hasn't been sent yet.
 * Safe under concurrent Razorpay webhooks (activated + charged).
 */
export async function claimAndSendPremiumWelcome(subscription) {
  if (!subscription?._id) return { sent: false, reason: 'missing_subscription' };

  const claimed = await PremiumSubscription.findOneAndUpdate(
    {
      _id: subscription._id,
      $or: [{ welcomeEmailSentAt: null }, { welcomeEmailSentAt: { $exists: false } }],
    },
    { $set: { welcomeEmailSentAt: new Date() } },
    { new: true },
  );
  if (!claimed) return { sent: false, reason: 'already_sent' };

  try {
    const user = await User.findById(claimed.userId).select('username email').lean();
    if (!user?.email) {
      console.warn('[premium-welcome] skipped — user email missing', String(claimed.userId));
      return { sent: false, reason: 'missing_email' };
    }
    await sendPremiumWelcomeEmail({ user });
    return { sent: true };
  } catch (error) {
    await PremiumSubscription.updateOne(
      { _id: claimed._id },
      { $unset: { welcomeEmailSentAt: 1 } },
    );
    console.error('[premium-welcome] failed to send:', error?.message || error);
    return { sent: false, reason: 'send_failed', error };
  }
}
