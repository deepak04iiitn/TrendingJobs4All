import { Resend } from 'resend';

// Constructed lazily — see backend/utils/razorpay.js for why (dotenv.config()
// in index.js hasn't run yet at ESM import time).
let resendClient = null;
function getResendClient() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const SITE_URL = 'https://route2hire.com';

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
