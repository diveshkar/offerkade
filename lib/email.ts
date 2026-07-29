// ============================================================
// OfferCeylon — Phase 7c — Transactional email (Resend).
//
// Resend chosen over Brevo: a single fetch to a REST API (no SDK, works on the
// Cloudflare Workers edge runtime), cleaner DX, and a bigger free tier
// (3,000/mo, 100/day). Swap the env vars below for your real values later.
//
// SAFE BY DEFAULT: while RESEND_API_KEY is still the dummy placeholder (or
// unset), every send is skipped and logged — the app keeps working, no crash.
// ============================================================
import 'server-only';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// TODO(config): set these in the deployment env (Cloudflare secret / .env.local).
//   RESEND_API_KEY  — from resend.com (starts with "re_")
//   EMAIL_FROM      — a verified sender, e.g. "OfferCeylon <hello@offerceylon.com>"
//                     (until your domain is verified, Resend allows "onboarding@resend.dev")
//   ADMIN_EMAIL     — where new-shop alerts go
const API_KEY = process.env.RESEND_API_KEY ?? 're_dummy_key_replace_me';
const FROM = process.env.EMAIL_FROM ?? 'OfferCeylon <no-reply@offerceylon.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@offerceylon.com';
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://offerceylon.com';

/** True once a real Resend key is configured (not the dummy placeholder). */
function isConfigured(): boolean {
  return Boolean(API_KEY) && !API_KEY.startsWith('re_dummy');
}

export interface EmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Low-level send. Never throws — email must not break a user flow. Returns a
 * result the caller can ignore. No-ops (logs) until a real key is set.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  if (!to) return { ok: false, error: 'no_recipient' };
  if (!isConfigured()) {
    console.warn(`[email] RESEND_API_KEY not configured — skipping "${subject}" to ${to}`);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[email] Resend ${res.status}: ${detail}`);
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] send failed:', err);
    return { ok: false, error: 'network' };
  }
}

// ---------- shared HTML shell ----------
// Shared brand footer / signature for every OfferCeylon email.
function footer(): string {
  return `<div style="margin-top:24px;border-top:1px solid rgba(18,13,10,.08);padding-top:18px">
      <div style="font-size:15px;font-weight:700;letter-spacing:-.01em;color:#120d0a">
        Offer<span style="color:#f4741c">Ceylon</span>
      </div>
      <p style="margin:4px 0 0;font-size:12px;line-height:1.7;color:rgba(18,13,10,.55)">
        Sri Lanka&rsquo;s offers in one place.<br>
        <a href="mailto:support@offerceylon.com" style="color:#f4741c;text-decoration:none">support@offerceylon.com</a>
        &nbsp;&middot;&nbsp;
        <a href="${SITE}" style="color:#f4741c;text-decoration:none">offerceylon.com</a>
      </p>
      <p style="margin:12px 0 0;font-size:11px;line-height:1.6;color:rgba(18,13,10,.4)">
        You received this email because you have an OfferCeylon account.
      </p>
      <p style="margin:6px 0 0;font-size:11px;line-height:1.6;color:rgba(18,13,10,.4)">
        <!-- OfferCeylon &middot; An Olyntox (Pvt) Ltd company &middot; Made in Sri Lanka -->
        &copy; ${new Date().getFullYear()} OfferCeylon &middot; Made in Sri Lanka
      </p>
    </div>`;
}

function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#faf6f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#221a14">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="font-size:20px;font-weight:700;letter-spacing:-.01em;margin-bottom:24px">
      Offer<span style="color:#f4741c">Ceylon</span>
    </div>
    <div style="background:#fff;border:1px solid rgba(18,13,10,.1);border-radius:16px;padding:24px">
      <h1 style="margin:0 0 12px;font-size:18px;color:#120d0a">${heading}</h1>
      ${bodyHtml}
    </div>
    ${footer()}
  </div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;background:#f4741c;color:#120d0a;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:10px">${label}</a>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:rgba(18,13,10,.75)">${text}</p>`;
}

// ---------- high-level, flow-specific senders ----------

/** A new shop finished onboarding and is awaiting approval → tell the admin. */
export async function emailAdminNewShop(shop: {
  name: string;
  contactEmail: string | null;
}): Promise<EmailResult> {
  const html = layout(
    'New shop awaiting approval',
    p(`<strong>${escape(shop.name)}</strong> just signed up and is pending review.`) +
      p(`Contact: ${escape(shop.contactEmail ?? 'not provided')}`) +
      button(`${SITE}/admin`, 'Review in admin'),
  );
  return sendEmail(ADMIN_EMAIL, `New shop pending: ${shop.name}`, html);
}

/** A shop was approved → let them know their offers can go live. */
export async function emailShopApproved(shop: {
  name: string;
  email: string | null;
}): Promise<EmailResult> {
  if (!shop.email) return { ok: false, error: 'no_recipient' };
  const html = layout(
    'Your shop is approved 🎉',
    p(`Hi ${escape(shop.name)}, your shop has been approved on OfferCeylon.`) +
      p('You can now post offers, and they go live the moment you publish them.') +
      button(`${SITE}/dashboard`, 'Post your first offer'),
  );
  return sendEmail(shop.email, 'Your OfferCeylon shop is approved', html);
}

/** A shop was rejected → notify with the reason shown on their dashboard. */
export async function emailShopRejected(shop: {
  name: string;
  email: string | null;
  reason: string;
}): Promise<EmailResult> {
  if (!shop.email) return { ok: false, error: 'no_recipient' };
  const html = layout(
    'About your shop application',
    p(`Hi ${escape(shop.name)}, we could not approve your shop at this time.`) +
      p(`<strong>Reason:</strong> ${escape(shop.reason)}`) +
      p('Reply to this email if you think this was a mistake and we will take another look.'),
  );
  return sendEmail(shop.email, 'Your OfferCeylon shop application', html);
}

/** Minimal HTML escape for interpolated user values. */
function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}
