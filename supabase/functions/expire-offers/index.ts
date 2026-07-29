// ============================================================
// OfferCeylon : Phase 7a : Edge Function : expire-offers
// Runs nightly (triggered by pg_cron via pg_net — see migration 014).
//
// 1. Find approved offers whose end_date has passed.
// 2. Delete their poster + thumbnail from Storage (frees the real space).
// 3. Mark them 'expired' and null the now-dead image references.
// 4. Hard-delete rows expired more than RETENTION_DAYS ago. The BEFORE DELETE
//    trigger from migration 013 rolls each row's views/leads into the durable
//    lifetime counters first, so no history is lost.
//
// Uses the service role (bypasses RLS). Deploy with:
//   supabase functions deploy expire-offers
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const POSTERS_BUCKET = 'posters';
const RETENTION_DAYS = 7; // keep expired rows this long before hard-deleting
const REMIND_DAYS_BEFORE = 3; // "your offer ends in 3 days" nudge

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

/**
 * Phase 7c "expiring soon" reminder. Sent from the scheduled job (not the app),
 * so it lives here rather than in lib/email.ts. Safe no-op until RESEND_API_KEY
 * is set as an Edge Function secret. Returns true if a mail was accepted.
 */
async function sendExpiryReminder(
  to: string,
  shop: string,
  title: string,
  endDate: string,
): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || key.startsWith('re_dummy')) return false;

  const from = Deno.env.get('EMAIL_FROM') ?? 'OfferCeylon <onboarding@resend.dev>';
  const site =
    Deno.env.get('SITE_URL') ?? Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://offerceylon.com';
  const pretty = new Date(endDate + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const html = `<!doctype html><html><body style="margin:0;background:#faf6f0;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#221a14">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <div style="font-size:20px;font-weight:700;margin-bottom:24px">Offer<span style="color:#f4741c">Ceylon</span></div>
      <div style="background:#fff;border:1px solid rgba(18,13,10,.1);border-radius:16px;padding:24px">
        <h1 style="margin:0 0 12px;font-size:18px">Your offer ends in ${REMIND_DAYS_BEFORE} days</h1>
        <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:rgba(18,13,10,.75)">Hi ${escapeHtml(shop)}, your offer <strong>${escapeHtml(title)}</strong> is valid until <strong>${pretty}</strong>, then it drops off OfferCeylon.</p>
        <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:rgba(18,13,10,.75)">Still running it? Post a fresh offer to keep your deal live.</p>
        <a href="${site}/offers/new" style="display:inline-block;margin-top:16px;background:#f4741c;color:#120d0a;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:10px">Post a new offer</a>
      </div>
    </div></body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `Your offer "${title}" ends in 3 days`, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const today = new Date().toISOString().slice(0, 10);

  // 0. Remind shops whose offers end in exactly REMIND_DAYS_BEFORE days — one
  //    nudge per offer, since the job runs daily. Best-effort; never blocks the
  //    expiry work below.
  let reminded = 0;
  const remindOn = new Date();
  remindOn.setDate(remindOn.getDate() + REMIND_DAYS_BEFORE);
  const remindStr = remindOn.toISOString().slice(0, 10);
  const { data: soon } = await supabase
    .from('offers')
    .select('id, title, end_date, business:businesses(name, contact_email)')
    .eq('status', 'approved')
    .eq('end_date', remindStr);
  for (const o of soon ?? []) {
    const biz = (o as { business: { name: string; contact_email: string | null } | null }).business;
    if (biz?.contact_email) {
      const sent = await sendExpiryReminder(biz.contact_email, biz.name, o.title as string, o.end_date as string);
      if (sent) reminded++;
    }
  }

  // 1. Approved offers past their end date.
  const { data: expired, error: findErr } = await supabase
    .from('offers')
    .select('id, poster_path, poster_thumb_path')
    .eq('status', 'approved')
    .lt('end_date', today);
  if (findErr) return json({ step: 'find', error: findErr.message }, 500);

  // 2. Delete their poster + thumb from Storage.
  const paths = (expired ?? [])
    .flatMap((o) => [o.poster_path, o.poster_thumb_path])
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    const { error } = await supabase.storage.from(POSTERS_BUCKET).remove(paths);
    if (error) return json({ step: 'storage', error: error.message }, 500);
  }

  // 3. Mark expired + drop the dead image references (so nothing points at
  //    objects we just deleted).
  if (expired && expired.length > 0) {
    const { error } = await supabase
      .from('offers')
      .update({
        status: 'expired',
        poster_url: null,
        poster_thumb_url: null,
        poster_path: null,
        poster_thumb_path: null,
      })
      .in(
        'id',
        expired.map((o) => o.id),
      );
    if (error) return json({ step: 'mark', error: error.message }, 500);
  }

  // 4. Hard-delete rows expired longer than the retention window. The migration
  //    013 BEFORE DELETE trigger rolls their views/leads into durable counters.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const { data: purged, error: purgeErr } = await supabase
    .from('offers')
    .delete()
    .eq('status', 'expired')
    .lt('end_date', cutoffStr)
    .select('id');
  if (purgeErr) return json({ step: 'purge', error: purgeErr.message }, 500);

  return json({
    ok: true,
    ranAt: new Date().toISOString(),
    reminded,
    expired: expired?.length ?? 0,
    purged: purged?.length ?? 0,
  });
});
