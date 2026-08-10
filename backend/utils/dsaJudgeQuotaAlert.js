import { Resend } from 'resend';

let resendClient = null;
function getResendClient() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const FOUNDERS = ['dky422003@gmail.com', 'sandeep38yad@gmail.com'];
const SITE_URL = 'https://route2hire.com';

/** Avoid flooding founders if many users hit the limit in a short window. */
const DEFAULT_COOLDOWN_MS = 6 * 60 * 60 * 1000;
let lastAlertAt = 0;
let alertInFlight = false;

function founderRecipients() {
  const fromEnv = String(process.env.DSA_QUOTA_ALERT_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return fromEnv.length ? fromEnv : FOUNDERS;
}

function buildQuotaAlertHtml({
  mode,
  slug,
  message,
  userLabel,
  userEmail,
  occurredAt,
}) {
  const when = occurredAt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const safeMode = mode === 'run' ? 'Run' : 'Submit';
  const problemLine = slug
    ? `<a href="${SITE_URL}/qa-sdet-dsa-sheet/problems/${encodeURIComponent(slug)}" style="color:#C4A574;text-decoration:none;font-weight:600;">${slug}</a>`
    : 'Unknown problem';

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F7F3EC;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F3EC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFDF8;border:1px solid #E5DCCE;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 20px;background:#F7F3EC;border-bottom:1px solid #E5DCCE;">
                <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6B5A48;font-family:Arial,Helvetica,sans-serif;font-weight:700;">
                  Route2Hire · Ops alert
                </div>
                <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;color:#1C1917;font-weight:600;">
                  DSA code runner quota exceeded
                </h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:#57534E;font-family:Arial,Helvetica,sans-serif;">
                  A learner hit the temporary “we’ll be back shortly” screen. This is on our side — not their code.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5DCCE;border-radius:14px;background:#F7F3EC;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6B5A48;font-weight:700;">Details</div>
                      <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#2C241B;">
                        <strong>When (IST):</strong> ${when}<br/>
                        <strong>Action:</strong> ${safeMode}<br/>
                        <strong>Problem:</strong> ${problemLine}<br/>
                        <strong>User:</strong> ${userLabel}${userEmail ? ` &lt;${userEmail}&gt;` : ''}<br/>
                        <strong>Provider message:</strong> ${message || 'n/a'}
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#57534E;">
                  Please top up / raise the OnlineCompiler quota (or cool off concurrent runs) so the DSA sheet judge stays available.
                </p>
                <p style="margin:18px 0 0;">
                  <a href="${SITE_URL}/qa-sdet-dsa-sheet" style="display:inline-block;background:#2C241B;color:#FFFDF8;text-decoration:none;font-size:13px;font-weight:700;padding:12px 18px;border-radius:999px;">
                    Open DSA Sheet
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 24px;border-top:1px solid #E5DCCE;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#A89B8A;">
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
 * Fire-and-forget friendly founder alert when JUDGE_QUOTA is hit.
 * Cooldown prevents a burst of identical emails.
 */
export async function notifyFoundersDsaJudgeQuota(details = {}) {
  const cooldownMs = Number(process.env.DSA_QUOTA_ALERT_COOLDOWN_MS || DEFAULT_COOLDOWN_MS);
  const now = Date.now();
  if (alertInFlight) return { skipped: true, reason: 'in_flight' };
  if (now - lastAlertAt < cooldownMs) {
    return { skipped: true, reason: 'cooldown' };
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn('[dsa-quota-alert] RESEND_API_KEY / RESEND_FROM_EMAIL missing — skip');
    return { skipped: true, reason: 'missing_config' };
  }

  alertInFlight = true;
  try {
    const to = founderRecipients();
    const occurredAt = details.occurredAt instanceof Date ? details.occurredAt : new Date();
    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: '🚨 Route2Hire · DSA code runner quota exceeded',
      html: buildQuotaAlertHtml({
        mode: details.mode || 'submit',
        slug: details.slug || '',
        message: details.message || '',
        userLabel: details.userLabel || details.username || details.userId || 'unknown',
        userEmail: details.userEmail || '',
        occurredAt,
      }),
    });
    lastAlertAt = Date.now();
    return { skipped: false, result };
  } catch (error) {
    console.error('[dsa-quota-alert] failed to send:', error?.message || error);
    return { skipped: true, reason: 'send_failed', error };
  } finally {
    alertInFlight = false;
  }
}
