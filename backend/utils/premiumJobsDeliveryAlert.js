import { Resend } from 'resend';

let resendClient = null;
function getResendClient() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FOUNDERS = ['dky422003@gmail.com', 'sandeep38yad@gmail.com'];
const SITE_URL = 'https://route2hire.com';

function founderRecipients() {
  // Same recipient list as DSA quota alerts (overrideable via env).
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

function buildDeliveryAlertHtml({ runDate, sentCount, activeCount, issues, batchError }) {
  const when = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const rows = (issues || [])
    .map((issue) => {
      const who = escapeHtml(
        issue.email
          ? `${issue.username || 'user'} <${issue.email}>`
          : issue.username || String(issue.userId || issue.subscriptionId || 'unknown'),
      );
      const reason =
        issue.status === 'skipped_no_jobs'
          ? 'No matching jobs found'
          : escapeHtml(issue.errorMessage || issue.status || 'unknown failure');
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #E5DCCE;font-size:13px;color:#2C241B;">${who}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #E5DCCE;font-size:13px;color:#6B5A48;">${escapeHtml(issue.status)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #E5DCCE;font-size:13px;color:#57534E;">${reason}</td>
        </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F7F3EC;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F3EC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFDF8;border:1px solid #E5DCCE;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;background:#F7F3EC;border-bottom:1px solid #E5DCCE;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6B5A48;font-weight:700;">
                  Route2Hire · Ops alert
                </div>
                <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;color:#1C1917;font-family:Georgia,'Times New Roman',serif;font-weight:600;">
                  Premium Jobs daily email delivery issue
                </h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:#57534E;">
                  One or more active subscribers did not receive today’s Premium Jobs email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;font-size:14px;line-height:1.6;color:#2C241B;">
                <p style="margin:0 0 12px;">
                  <strong>Checked at (IST):</strong> ${escapeHtml(when)}<br/>
                  <strong>Run date:</strong> ${escapeHtml(runDate)}<br/>
                  <strong>Active subscribers processed:</strong> ${activeCount}<br/>
                  <strong>Successfully sent:</strong> ${sentCount}<br/>
                  <strong>Not delivered:</strong> ${(issues || []).length}
                </p>
                ${
                  batchError
                    ? `<p style="margin:0 0 16px;padding:12px 14px;border-radius:12px;background:#F7F3EC;border:1px solid #E5DCCE;color:#57534E;"><strong>Batch error:</strong> ${escapeHtml(batchError)}</p>`
                    : ''
                }
                ${
                  rows
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5DCCE;border-radius:12px;overflow:hidden;">
                        <tr style="background:#F7F3EC;">
                          <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B5A48;">Subscriber</th>
                          <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B5A48;">Status</th>
                          <th align="left" style="padding:10px 12px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B5A48;">Reason</th>
                        </tr>
                        ${rows}
                      </table>`
                    : ''
                }
                <p style="margin:18px 0 0;color:#57534E;">
                  Please check Resend delivery, job matching, and subscriber YOE / data so daily emails stay reliable.
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
 * Warn founders when any Premium Jobs daily email was not delivered.
 */
export async function notifyFoundersPremiumDeliveryIssues({
  runDate,
  activeCount = 0,
  sentCount = 0,
  issues = [],
  batchError = '',
} = {}) {
  if (!issues.length && !batchError) {
    return { skipped: true, reason: 'nothing_to_report' };
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn('[premium-delivery-alert] RESEND_API_KEY / RESEND_FROM_EMAIL missing — skip');
    return { skipped: true, reason: 'missing_config' };
  }

  try {
    const to = founderRecipients();
    const issueCount = issues.length || (batchError ? 1 : 0);
    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: `⚠️ Route2Hire · Premium Jobs email not delivered (${issueCount})`,
      html: buildDeliveryAlertHtml({
        runDate,
        sentCount,
        activeCount,
        issues,
        batchError,
      }),
    });
    return { skipped: false, result };
  } catch (error) {
    console.error('[premium-delivery-alert] failed to send:', error?.message || error);
    return { skipped: true, reason: 'send_failed', error };
  }
}
