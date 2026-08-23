import { Resend } from 'resend';

let resendClient = null;
function getResendClient() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FOUNDERS = ['dky422003@gmail.com', 'sandeep38yad@gmail.com'];
const SITE_URL = 'https://route2hire.com';
const ADMIN_FEEDBACK_URL = `${SITE_URL}/admin/feedback`;

function founderRecipients() {
  const fromEnv = String(process.env.DSA_QUOTA_ALERT_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : FOUNDERS;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFeedbackAlertHtml({
  type,
  email,
  description,
  pageUrl,
  userAgent,
  reportId,
  submittedAt,
}) {
  const when = submittedAt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const isBug = type === 'bug';
  const typeLabel = isBug ? 'Bug report' : 'Feature request';
  const safeDescription = escapeHtml(description).replace(/\n/g, '<br/>');
  const safePageUrl = pageUrl ? escapeHtml(pageUrl) : '';
  const safeUserAgent = userAgent ? escapeHtml(userAgent.slice(0, 240)) : '';

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
                  Route2Hire · Feedback
                </div>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;color:#1C1917;font-family:Georgia,'Times New Roman',serif;font-weight:600;">
                  New ${typeLabel.toLowerCase()}
                </h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:#57534E;">
                  Someone just submitted feedback from the site.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;font-size:14px;line-height:1.6;color:#2C241B;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5DCCE;border-radius:14px;background:#F7F3EC;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6B5A48;font-weight:700;">Details</div>
                      <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#2C241B;">
                        <strong>When (IST):</strong> ${escapeHtml(when)}<br/>
                        <strong>Type:</strong> ${escapeHtml(typeLabel)}<br/>
                        <strong>From:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#C4A574;text-decoration:none;font-weight:600;">${escapeHtml(email)}</a><br/>
                        ${reportId ? `<strong>ID:</strong> ${escapeHtml(reportId)}<br/>` : ''}
                        ${safePageUrl ? `<strong>Page:</strong> <a href="${safePageUrl}" style="color:#C4A574;text-decoration:none;word-break:break-all;">${safePageUrl}</a><br/>` : ''}
                        ${safeUserAgent ? `<strong>Browser:</strong> ${safeUserAgent}` : ''}
                      </p>
                    </td>
                  </tr>
                </table>
                <div style="margin:18px 0 0;padding:16px 18px;border:1px solid #E5DCCE;border-radius:14px;background:#FFFDF8;">
                  <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6B5A48;font-weight:700;margin-bottom:10px;">
                    ${isBug ? 'What went wrong' : 'Their idea'}
                  </div>
                  <p style="margin:0;font-size:14px;line-height:1.65;color:#2C241B;">${safeDescription}</p>
                </div>
                <p style="margin:20px 0 0;">
                  <a href="${ADMIN_FEEDBACK_URL}" style="display:inline-block;background:#2C241B;color:#FFFDF8;text-decoration:none;font-size:13px;font-weight:700;padding:12px 18px;border-radius:999px;">
                    Open admin feedback
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 22px;border-top:1px solid #E5DCCE;font-size:12px;color:#A89B8A;">
                Automated alert from Route2Hire · ${SITE_URL}
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

/**
 * Notify founders when a bug report or feature request is submitted.
 */
export async function notifyFoundersFeedbackReceived({
  type,
  email,
  description,
  pageUrl = '',
  userAgent = '',
  reportId = '',
  submittedAt,
} = {}) {
  if (!type || !email || !description) {
    return { skipped: true, reason: 'missing_fields' };
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn('[feedback-alert] RESEND_API_KEY / RESEND_FROM_EMAIL missing — skip');
    return { skipped: true, reason: 'missing_config' };
  }

  const isBug = type === 'bug';
  const subjectPrefix = isBug ? '🐛' : '💡';
  const subjectType = isBug ? 'Bug report' : 'Feature request';
  const when = submittedAt instanceof Date ? submittedAt : new Date();

  try {
    const to = founderRecipients();
    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: `${subjectPrefix} Route2Hire · New ${subjectType.toLowerCase()} from ${email}`,
      html: buildFeedbackAlertHtml({
        type,
        email,
        description,
        pageUrl,
        userAgent,
        reportId,
        submittedAt: when,
      }),
    });
    return { skipped: false, result };
  } catch (error) {
    console.error('[feedback-alert] failed to send:', error?.message || error);
    return { skipped: true, reason: 'send_failed', error };
  }
}
