# OfferCeylon - Complete Project Plan (Website)

> **Name:** **OfferCeylon** (decided). Domain target: `offerceylon.lk`. *(The project folder/repo is still named `offerkade` - rename later when convenient; it's cosmetic.)*

> A Sri Lankan offers website. Businesses post their current deals (restaurants, shops, furniture, drinks - anything) as posters. Users browse them free by category and location. Offers auto-delete the moment they expire. Built to run at near-zero monthly cost, monetized later through ads, then promo-code leads, then subscriptions.

**One-line pitch:** *Sri Lanka's offers in one place - save money every day.*

---

## Final Stack (locked)

| Layer | Tool | What it does |
|---|---|---|
| **Domain** | `offerceylon.lk` | Address + branded email |
| **DNS + CDN + SSL** | Cloudflare | Fast global delivery, free HTTPS |
| **Hosting** | Cloudflare Workers (via `@opennextjs/cloudflare`) | Serves the site, auto-deploys from GitHub. Full Next.js support (SSR/dynamic), so no rework needed in Phase 4. |
| **Frontend** | Next.js (React, App Router, TypeScript, Tailwind) | The site - SEO-friendly pages |
| **Database** | Supabase (Postgres) | Offers, businesses, categories, admins |
| **Auth** | Supabase Auth | Admin login only |
| **File storage** | Supabase Storage (+ CDN) | Poster images |
| **Image compression** | **Browser-side** (`browser-image-compression`) | Resize → WebP → ~150KB *before upload* |
| **Submission gateway** | Supabase Edge Function (Deno) + **Cloudflare Turnstile** | The only writer of offers - blocks spam |
| **Scheduled jobs** | Supabase pg_cron → Edge Function (expiry) + Cloudflare Worker cron (keep-alive) | Nightly expiry + weekly DB ping |
| **Inbox email** | Zoho Mail (free) or Cloudflare Email Routing | `hello@offerceylon.lk` |
| **Sending email** | Brevo or Resend (free tier) | Approval / rejection / expiry notices |
| **Bot protection** | Cloudflare Turnstile (free CAPTCHA) | On the submission form |
| **Code + CI/CD** | GitHub | Version control, auto-deploy on push |
| **Analytics** | Cloudflare Web Analytics | Traffic stats, privacy-friendly |

**Why this stack:** genuinely free to start (no credit card, no forced pay-as-you-go) and SEO-friendly - critical, since Google search and social links are the traffic engine. **No Flutter, no mobile app** - this is a website only.

### ⚠️ Key architecture decisions (these correct earlier drafts)

1. **Compression runs in the browser, not on a server.** `sharp` is a native Node module and **cannot run** on Supabase Edge Functions (Deno) or Cloudflare Pages (Edge runtime) - the two places the old plan assumed. Instead, the browser compresses the image to WebP *before upload* using `browser-image-compression`. Zero server cost, works on the free stack, no native dependency.
2. **All submissions go through ONE Edge Function - never a direct client insert.** With no user login, a public "insert" RLS policy would let bots write unlimited junk straight to the database/storage. Instead, the form calls a single Supabase Edge Function (service role) that: verifies a **Turnstile** token → accepts the pre-compressed image → uploads to Storage → inserts the offer as `pending`. RLS then forbids all public writes. This closes the spam hole *and* the storage-write hole in one move.
3. **Store the storage object *path*, not just the CDN URL.** To delete a file you need its key (e.g. `posters/abc.webp`), not the public URL. The `offers` table has `poster_path` / `poster_thumb_path` columns used by the expiry job.
4. **`view_count` is bumped via a `SECURITY DEFINER` RPC**, not a client UPDATE - because RLS forbids public writes to `offers`. A tiny Postgres function increments just that one counter.

---

## Cost Summary (the honest version)

| Stage | Monthly cost | Notes |
|---|---|---|
| Build + seeding | **≈ LKR 400/mo** (domain only, amortized) | All services on free tier |
| Early launch (a few thousand visitors) | **≈ LKR 400/mo** | Still free tier; Supabase won't pause once real traffic arrives |
| Scaling (tens of thousands) | **~$45-50/mo** | Paid email + maybe Cloudflare Pro - covered by ad/sub income by then |

**Decision (locked):** **No Supabase Pro until subscription revenue is coming in.** Until then, stay entirely on free tiers - the keep-alive Worker (Phase 7b) neutralizes the only real free-tier risk (the 7-day pause). Pro's $25/mo (backups + no pausing) gets added *only after* paying subscribers exist to fund it.

**Only guaranteed cost to start: the domain, paid yearly.**
- `offerceylon.lk` ≈ LKR 3,000-7,500/year
- `offerceylon.com` (optional, brand protection) ≈ $11/year

**Reality check on "free forever":** the free tier is genuinely enough to *build and launch*. But a *proper* product a business relies on eventually wants **Supabase Pro ($25/mo)** for backups + no cold-starts. Budget for it as the one honest recurring cost - small, and deferrable until you have traction.

### Supabase free tier - what actually matters
| Resource | Free limit | What it means |
|---|---|---|
| **File storage** | **1 GB** | Non-issue. With nightly auto-delete of expired posters you only ever hold *active* offers (~a few hundred ≈ 3% of the tier). |
| **Database** | **500 MB** | Text rows only - images don't count. Hundreds of thousands of offers fit. |
| **Storage egress** | **5 GB/month** | The real constraint. Mitigate with **Cloudflare caching in front** (proper `Cache-Control` headers) so repeat views never hit Supabase. *Note: this needs correct cache headers - it is not automatic just from using CDN URLs.* |
| **Auth** | 50,000 MAU | Never hit - only admins log in. |
| **Edge Functions** | 500,000 invocations/month | Nightly expiry + submissions use a tiny fraction. |
| **Inactivity** | **Pauses after 7 days of no DB activity** | ⚠️ This is about *inactivity*, NOT storage size. During quiet build weeks it can sleep. **Fix: the keep-alive Worker below.** Once real traffic exists it never triggers. |

*Limits shift - confirm at supabase.com/pricing when you sign up.*

---

## Guiding Principles
- Start tiny. Ship v1 with only what's essential.
- Start hyper-focused (one city, one category) before going islandwide.
- The website is 10% of the work; collecting offers and building an audience is 90%.
- Cost risk is near-zero. The real risk is losing motivation during the slow early months.

---

# The 10 Phases
1. Foundation & Setup
2. Database & Backend (Postgres + RLS)
3. Image Pipeline (browser compression + CDN)
4. Public Website (browse offers)
5. Business Submission (Edge Function + Turnstile)
6. Admin Panel & Moderation
7. Automation (expiry job + keep-alive + emails)
8. Content Seeding (fill before launch)
9. Launch & Audience Growth
10. Monetization (ads → leads → subscriptions)

---

## Phase 1 - Foundation & Setup

**Goal:** Domain, accounts, and a skeleton Next.js site that auto-deploys.

### Your half - accounts & domain (only you can do these)
- **Register `offerceylon.lk`** through a local LK registrar (LK Domain Registry / accredited provider). `.lk` cannot be bought at Cloudflare. **Before buying, confirm the registrar lets you set custom nameservers** - a few cheap resellers lock you to their DNS; avoid those.
- Create free accounts: **GitHub, Cloudflare, Supabase**, and email (**Zoho Mail** free, or **Cloudflare Email Routing** forwarding to Gmail).
- (Later) Brevo/Resend account for transactional email.

### Connecting `.lk` to Cloudflare (confirmed workable)
1. Register `offerceylon.lk` at the LK registrar.
2. Add the domain to Cloudflare (free plan) → Cloudflare gives you **two nameservers**.
3. At the LK registrar, **change the nameservers to Cloudflare's two**. (`.lk` allows custom nameservers.)
4. Wait for propagation (minutes-hours).
5. In the **Cloudflare Worker** settings, add `offerceylon.lk` as a **custom domain** → auto DNS record + free SSL.
→ Result: the Next.js site served on `https://offerceylon.lk`, free HTTPS + CDN. Cost = domain only.

### ✅ The skeleton (DONE)
- **Next.js 16 app scaffolded** (TypeScript, App Router, Tailwind, ESLint), builds clean.
- Branded OfferCeylon coming-soon homepage + brand assets (favicon, icon, apple-icon, OG image).
- **GitHub repo** live: `github.com/diveshkar/offerkade`.
- **Cloudflare Workers deploy working** via `@opennextjs/cloudflare` + `wrangler.jsonc`.
  - Build command: `npx opennextjs-cloudflare build`
  - Deploy command: `npx opennextjs-cloudflare deploy`
  - **Live at: https://offerceylon.divesh-kar.workers.dev** (auto-deploys on every push to `main`)

> ⚠️ **Windows caveat:** OpenNext's local *Worker preview* (`opennextjs-cloudflare preview`) does **not** work on Windows - it 500s. This is a known OpenNext limitation, not a config bug. Cloudflare's builders run Linux, where it works fine.
> **Local dev loop = `npm run dev` (`next dev`), which works normally on Windows.** To test Cloudflare-specific behaviour, push and use the deploy preview. If this ever becomes limiting, WSL is the fix.

**Deliverable:** ✅ Accounts created, branded site auto-deploying from GitHub to a live URL. *(Domain deferred to Phase 9 by choice.)*

**Cost:** Domain only.

---

## Phase 2 - Database & Backend

**Goal:** The Postgres database in Supabase that everything depends on, locked down with RLS.

### `businesses`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | `gen_random_uuid()` |
| name | text | |
| slug | text (unique) | `pizza-hut-colombo` |
| logo_url | text | optional |
| contact_email | text | |
| contact_phone | text | |
| whatsapp | text | optional |
| website | text | optional |
| city | text | |
| address | text | optional |
| verified | boolean | default false |
| subscription_tier | text | `free` / `featured` / `premium` (Phase 10) |
| created_at | timestamptz | `now()` |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | serial (PK) | |
| name | text | Food, Drink, Furniture… |
| slug | text (unique) | `food` |
| icon | text | optional |
| sort_order | int | display order |

### `offers` - the heart of the site
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | `gen_random_uuid()` |
| business_id | uuid (FK) | |
| category_id | int (FK) | |
| title | text | |
| description | text | |
| poster_url | text | compressed image (CDN URL, for display) |
| poster_thumb_url | text | thumbnail (CDN URL, for grid) |
| **poster_path** | text | **storage key, for deletion** (`posters/abc.webp`) |
| **poster_thumb_path** | text | **storage key, for deletion** |
| city | text | denormalized for filtering |
| location_note | text | "All branches" |
| promo_code | text | unique (Phase 10) |
| start_date | date | |
| end_date | date | **drives "expiring soon" + auto-delete** |
| status | text | `pending` / `approved` / `expired` / `rejected` |
| is_featured | boolean | default false |
| view_count | int | default 0 (bumped via RPC) |
| redemption_count | int | default 0 (Phase 10) |
| submitted_by_email | text | |
| created_at | timestamptz | `now()` |
| approved_at | timestamptz | nullable |

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | matches Supabase auth user id |
| email | text | |
| role | text | `admin` / `superadmin` |
| created_at | timestamptz | |

### `redemptions` (Phase 10)
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| offer_id | uuid (FK) | |
| redeemed_at | timestamptz | `now()` |
| source | text | `web` / `instore` / `qr` |

### `subscriptions` (Phase 10)
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| business_id | uuid (FK) | |
| tier | text | `featured` / `premium` |
| price | numeric | |
| status | text | `active` / `cancelled` / `past_due` |
| started_at | timestamptz | |
| renews_at | timestamptz | |

### Indexes
- `offers(status, end_date)` - public page + cleanup job
- `offers(category_id)`, `offers(city)` - filtering
- `offers(is_featured, created_at)` - featured-first ordering
- `businesses(slug)`, `categories(slug)` - lookups

### Row Level Security (RLS)
- **Public read:** anyone `SELECT`s offers where `status = 'approved'` AND `end_date >= today`. Admins can read all statuses (for moderation).
- **Public write: FORBIDDEN.** No public insert/update/delete on any table. The submission Edge Function (service role) is the only writer of new offers. This is the key spam fix.
- **`view_count`:** bumped only through a `SECURITY DEFINER` RPC that increments that single column - nothing else.
- **Admin only:** all `UPDATE` / `DELETE` on offers, all writes to `businesses` / `subscriptions`, via the `admins` table.
- **Storage:** public read on the posters bucket; writes only via the Edge Function's service role.

**Deliverable:** Tables, indexes, RLS policies, and the `view_count` RPC live; categories seeded.

### ✅ Phase 2 (DONE)
- Supabase project created (region: Singapore, ref `dvjvzouybtisjkwhtqkf`).
- Schema applied via `supabase/schema_all.sql`: 6 tables (`businesses`, `categories`, `offers`, `admins`, `redemptions`, `subscriptions`), all indexes, RLS, `is_admin()` + `bump_view_count()` RPCs, 10 categories seeded.
- **RLS verified live:** public reads only approved/non-expired offers; public writes to `offers`/`categories` **blocked**; `service_role` writes bypass RLS; `bump_view_count` callable by anon.
- App wired: `@supabase/supabase-js` + `server-only` installed; `lib/supabase/client.ts` (anon) + `lib/supabase/admin.ts` (service role); `lib/database.types.ts`; `.env.local` configured (gitignored).

**Cost:** LKR 0.

---

## Phase 3 - Image Pipeline (browser-side)

**Goal:** Every poster shrunk *in the browser before upload* so storage + egress stay free and pages load fast - no visible quality loss. A 6MB phone photo → ~150KB, ~40× smaller, looks identical on screen.

**Pipeline (runs in the user's browser, on submit):**
1. **Validate:** JPG/PNG/WebP only; reject over 5MB (enforced in the form).
2. **Resize:** max **1080px** wide (1200px if posters are text-heavy, to keep fine print crisp).
3. **Convert + compress:** **WebP**, quality **~80%** (85% for text-heavy).
4. **Thumbnail:** ~400px WebP for the grid.
5. **Send both** to the submission Edge Function, which uploads to Supabase Storage and records `poster_url` + `poster_path` (and thumb equivalents).

```js
import imageCompression from 'browser-image-compression';

const poster = await imageCompression(file, {
  maxWidthOrHeight: 1080,
  fileType: 'image/webp',
  initialQuality: 0.8,
  useWebWorker: true,
});

const thumb = await imageCompression(file, {
  maxWidthOrHeight: 400,
  fileType: 'image/webp',
  initialQuality: 0.75,
  useWebWorker: true,
});
```

### ⚠️ Serve via CDN with proper cache headers (from day one)
Supabase free gives 5 GB egress/month. Put **Cloudflare caching in front** and set `Cache-Control` so repeat views are served from Cloudflare's edge and never re-hit Supabase. This - not merely "using a CDN URL" - is what protects the egress quota.

**Storage math:** ~150KB poster + ~30KB thumb ≈ 180KB/offer → 1 GB holds ~5,500. With Phase 7 auto-delete you only store *active* offers (200 live ≈ 36 MB ≈ 3%). Storage never becomes a problem.

**Deliverable:** Browser compresses any picked image → Edge Function stores it → returns poster + thumbnail CDN URLs and paths.

**Cost:** LKR 0.

---

## Phase 4 - Public Website

**Goal:** The pages users visit - clean, fast, mobile-first.

**Pages**
- **Home / Offers grid** - poster thumbnails; featured pinned top, newest first. Filters: **category**, **city**, **"Ending soon"** tab. Search box (Postgres full-text - a real advantage over the app plan). Shows only `status = approved` AND `end_date >= today`.
- **Offer detail** (`/offer/:id`) - full poster, title, description, business info, WhatsApp/call buttons, valid-until date. Bumps `view_count` via the RPC. (Later: promo code + how to redeem.)
- **Business profile** (`/business/:slug`) - logo, info, their current offers.
- **Submit an offer** → Phase 5.
- **Static:** About, Contact, Privacy Policy, Terms - *required for AdSense later + legally needed (see Risks)*.

### ⏰ "Expiring soon" badge (computed, zero cost)
```
days_left = end_date - today
days_left <= 2  → "⏰ Expiring soon" badge (red/orange)
days_left <= 0  → nightly job deletes it (Phase 7)
```
Lifecycle: **live → last 2 days show urgency → end date passes → deleted.** No expired offers ever shown. The "Ending soon" set is also your best social content - urgency converts.

**Design/tech notes**
- **Mobile-first** - most SL users are on phones.
- **SEO is the free traffic engine.** Per-offer `<title>`/meta, clean URLs, sitemap. *(Resolved in Phase 1: the `@opennextjs/cloudflare` adapter is already set up, so SSR/ISR/dynamic routes work on Cloudflare Workers - no rework or SSG-fallback needed.)*
- **Fast:** WebP thumbnails, lazy-load, Cloudflare-cached.

**Not in v1 (deliberately):** visitor logins, comments, ratings, wishlists.

**Deliverable:** Working public site - offers grid, filters, expiring-soon badges, SEO pages.

**Cost:** LKR 0.

---

## Phase 5 - Business Submission (Edge Function + Turnstile)

**Goal:** Let any business submit easily - while you keep control via approval and block bots.

**Form fields:** business name (select existing or new), contact email + phone + optional WhatsApp, city, offer title, category, description, **poster image** (max 5MB → browser-compressed via Phase 3), start date + **end date** (required), and an invisible **Cloudflare Turnstile** widget.

**Flow (the secure path)**
1. User fills form; browser compresses the poster (Phase 3).
2. Form calls the **submission Edge Function** with the compressed images + a **Turnstile token**.
3. Edge Function (service role): **verifies the Turnstile token** → uploads images to Storage → inserts the offer as `status = 'pending'` with zeroed counters. *(No direct client insert exists - RLS forbids it.)*
4. "Thanks! Your offer is under review."
5. You're emailed about the new pending offer (Phase 7).
6. You approve/reject (Phase 6). On approval → live.

**No login required to submit in v1** - Turnstile + the Edge Function gateway give the anti-abuse protection that a login would otherwise provide. Add business accounts later once volume grows.

**Deliverable:** Public submission form → Edge Function → moderation queue, bot-protected.

**Cost:** LKR 0.

---

## Phase 6 - Admin Panel & Moderation

**Goal:** A private dashboard to review and manage everything.

**Access:** Supabase Auth, restricted to the `admins` table (enforced by RLS). Admins can read all offer statuses.

**Features**
- **Pending queue** - poster preview + **Approve / Reject** (reject asks a reason, optionally emailed).
- **All offers** - search/filter, edit, feature/unfeature, manually expire or delete.
- **Businesses** - view, verify (`verified = true`), edit.
- **Quick-add** - a fast form for *you* to post offers yourself (critical for Phase 8 seeding).
- **Stats dashboard** - total offers, active offers, businesses, views, top offers - the numbers you'll show advertisers/subscribers later.

**Moderation rules:** reject spam/fake/expired-on-arrival/low-quality; fix wrong category/city; verify legit businesses to build trust.

**Deliverable:** Working admin dashboard with approve/reject + quick-add.

**Cost:** LKR 0.

---

## Phase 7 - Automation

**Goal:** The site runs itself - expired offers delete automatically, the DB stays awake, emails send themselves.

### 7a. Auto-delete on expiry (the storage saver)
**pg_cron triggers an Edge Function nightly** (pg_cron alone can't delete storage objects - it calls the function via `pg_net`; the Edge Function does the deletion with the service role):
1. Find offers where `end_date < today` AND `status = 'approved'`.
2. **Delete poster + thumbnail from Storage using `poster_path` / `poster_thumb_path`** (not the URL) → space freed.
3. Set `status = 'expired'` → gone from the public site.
4. **Keep the text row** (title, business, dates) - nearly free, and becomes an asset: *"OfferCeylon has published 800 offers from 150 businesses"* is a strong sponsorship/subscription pitch line.

```sql
-- pg_cron nightly: find expired, hand paths to the Edge Function to delete
select id, poster_path, poster_thumb_path from offers
where status = 'approved' and end_date < current_date;
-- Edge Function: delete those storage objects → update status = 'expired'
```
**No grace period** - urgency is handled *before* expiry by the "Expiring soon" badge, so users never see dead offers.

**Cost:** ~30 invocations/month vs 500,000 free = $0.

### 7b. Keep-alive (prevents the 7-day pause) - FREE
A **Cloudflare Worker cron trigger** runs **every 3 days** (not 6 - leaves margin if one run fails before the 7-day deadline) and makes one tiny Supabase query, which resets the inactivity clock. It must hit the *database*, not the cached homepage.
```js
// Cloudflare Worker - cron: 0 3 */3 * *  (every 3 days, 3 AM)
export default {
  async scheduled(event, env, ctx) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/categories?select=id&limit=1`, {
      headers: { apikey: env.SUPABASE_ANON_KEY }
    });
  }
};
```
Once real traffic exists this is redundant, but it costs nothing to leave running. *(Chosen over GitHub Actions cron, which auto-disables after 60 days of repo inactivity - a bad silent-failure mode.)*

### 7c. Transactional emails (Brevo/Resend free tier)
- New submission → notify admin
- Offer approved → confirm to business
- Offer rejected → notify submitter with reason
- **Offer expiring in 3 days → remind business to repost** (drives repeat engagement)

**Deliverable:** Nightly auto-delete live + keep-alive running + emails sending automatically.

**Cost:** LKR 0.

---

## Phase 8 - Content Seeding

**Goal:** Never launch empty. A site with 50 live offers looks alive; an empty one dies. **This is the real work.**

**Narrow start:** pick **one city + one category** - e.g. **Colombo restaurant offers**. Be the best at one thing, then expand.

**Tasks**
- Manually collect **30-50 real offers** - photograph posters at shops, or (with permission - see Risks) pull from businesses' Facebook/Instagram.
- Post them via admin **quick-add**.
- Set the category list to match what you actually have.
- Message 10-20 local businesses (WhatsApp/visit): *"I'll list your current offer free - send me your poster."* (This also solves the copyright question - the business is handing you the poster.)

**Success check:** before launch the site should feel *full and current* - real posters, real businesses, recent dates.

**Deliverable:** 30-50 live, real offers in your chosen niche.

**Cost:** LKR 0 (just your time).

---

## Phase 9 - Launch & Audience Growth

**Goal:** Get eyeballs. The audience already lives on social - meet them there.

**Channels (from day one)**
- **Instagram** - best daily offer as post + story.
- **TikTok** - "top 3 deals this week" shorts.
- **WhatsApp broadcast / channel** - daily deal blast; very effective locally.
- **Facebook** - SL deal-hunting groups.
- **Google (SEO)** - long-term free traffic; rank for "pizza offers Colombo" etc.

**The model:** the website is the **archive**; social is the **megaphone**. Every post links back to an offer. Best content angle: the "Ending soon" offers.

**Growth loop:** post deal on social → traffic to site → businesses notice → they submit offers → more content → more posts. That's how you break chicken-and-egg. Bonus: partner with 1-2 businesses to promote the site to *their* customers.

**Launch checklist**
- Site full of real offers (Phase 8 done)
- Social accounts branded (logo, `hello@offerceylon.lk`)
- Static pages live (About, Privacy, Terms)
- Sitemap submitted to Google Search Console
- **Post consistently - daily for ~6 months.** Consistency makes or breaks this.

**Milestones (give yourself room - solo + learning the stack)**
- Months 1-2: site + 50 offers + social live *(learning Next.js + Supabase takes time - don't cram it into 4 weeks)*
- Months 3-5: daily posting, a few thousand monthly visitors, first self-submitted offers
- Months 5-7: steady traffic, ready to monetize

**Deliverable:** Public launch, active daily social presence, growing traffic.

**Cost:** LKR 0 (Supabase Pro optional here - see Cost Summary).

---

## Phase 10 - Monetization

**Goal:** Turn traffic into income - in the right order. Don't monetize an empty site.

### Stage A - Google AdSense (covers costs, not profit)
- **When:** only after real content + traffic. AdSense rejects thin/scraped sites - a deals aggregator of reposted posters is exactly what it scrutinizes, so lean on original write-ups + permissioned content.
- **Reality:** SL CPM ~$0.50-$3 per 1,000 pageviews. Modest - treat it as covering the domain.
- **Payout:** $100 threshold - cash arrives slowly. Pay early domain years out of pocket.

### Stage B - Direct ads & sponsorships (better than AdSense)
- Sell homepage banners / sponsored slots directly to **banks and big retailers** - they pay far more than ad networks.

### Stage C - Promo-code / lead tracking (the real value proof)
- Each offer has a unique promo code. Users show it in-store; you log redemptions.
- Then you can tell a business: *"OfferCeylon sent you 40 customers this month."*
- **Build this before charging** - the hard number is what makes businesses pay.

### Stage D - Subscriptions (the endgame)
- Once businesses see proven leads: **Featured** (pinned/highlighted) and **Premium** (unlimited offers, priority, analytics), tracked via `subscriptions`. Charge monthly. Works far better *after* Stage C.

**Order (do not skip ahead):**
`Free everything → grow traffic → AdSense + direct ads → promo-code leads → subscriptions.`

**Bottom line:** ads keep the lights on; the real money is leads → subscriptions.

---

# End-to-End Data Flow
1. **Business submits** (Phase 5) → poster **compressed in browser** (Phase 3) → **Edge Function verifies Turnstile, uploads, inserts** as `pending` (Phase 2).
2. **Admin approves** (Phase 6) → `approved`, goes live.
3. **User browses** (Phase 4) → filters by category/city/ending-soon → views offer (RPC bumps `view_count`) → (later) uses promo code.
4. **Last 2 days** → "⏰ Expiring soon" badge drives urgency.
5. **Redemption logged** (Phase 10) → proves value.
6. **Nightly job** (Phase 7): `end_date` passed → pg_cron → Edge Function deletes images by path, sets `expired`, keeps text.
7. **Keep-alive Worker** every 3 days → DB never sleeps during quiet periods.
8. **Email** reminds business 3 days before expiry → they repost → loop continues.
9. **Revenue:** ads → sponsorships → subscriptions as traffic grows.

---

# Risk & Reality Check
- **Financial risk: near zero.** Only guaranteed cost is the yearly domain. Supabase Pro ($25/mo) is optional until you go properly live.
- **Copyright / IP.** Reposting businesses' posters without permission is a real risk (and can hurt AdSense approval). Prefer the permissioned model - *"send me your poster"* - and add a visible **takedown process**.
- **Sri Lanka PDPA.** You collect emails/phones - the Privacy Policy must reflect the Personal Data Protection Act, not be a generic template.
- **Cloudflare Pages ≠ Vercel** for Next.js SSR/ISR - validate the rendering mode early (adapter or SSG-fallback).
- **Real risk: motivation.** The slow early months of manually posting to a small audience are what kill projects like this. Commit to ~6 months of consistent daily posting.
- **Competition exists** (MyPromo.lk, Promo.lk, Findit.lk) - that proves demand. Win by being more focused, faster, better at social. A decade-old competitor still earns only a few hundred $/month from ads - so plan for the leads/subscription model, not ads.
- **The website is the easy 10%.** The 90% is hustle: collecting offers and growing the audience.

---

# Quick-Start Checklist
- [x] Name decided: **OfferCeylon**
- [ ] Register the `.lk` domain (confirm custom-nameserver support) + optional `.com`
- [ ] Create Cloudflare, Supabase, GitHub, Zoho/email accounts
- [ ] Nameservers → Cloudflare; email routing set up
- [ ] Finish skeleton homepage → `git init` → push to GitHub → Cloudflare Pages auto-deploy
- [x] Create tables + indexes + RLS + `view_count` RPC + seed categories (Phase 2)
- [ ] Build **browser-side** compression (Phase 3)
- [ ] Put **Cloudflare cache in front of Storage** (protects 5 GB egress)
- [ ] Build offers grid + filters + "Ending soon" + expiring-soon badge (Phase 4)
- [ ] Build submission form → **Edge Function + Turnstile** (Phase 5)
- [ ] Build admin approve/reject + quick-add (Phase 6)
- [ ] Deploy nightly expiry (pg_cron → Edge Function, delete by path) (Phase 7)
- [ ] Deploy **keep-alive Worker cron (every 3 days)** (Phase 7)
- [ ] Wire transactional emails (Phase 7)
- [ ] Seed 30-50 real offers in one niche (Phase 8)
- [ ] Add About/Privacy/Terms + submit sitemap to Search Console
- [ ] Launch + start daily social posting (Phase 9)
- [ ] After traffic: AdSense → direct ads → promo codes → subscriptions (Phase 10)

*Cost to start: one domain per year. Everything else free. Supabase Pro ($25/mo) only when you go properly live.*
