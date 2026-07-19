// ============================================================
// OfferCeylon — DEV seed (Phase 4 testing only).
// Inserts sample businesses + offers so the public pages render.
// All rows are tagged submitted_by_email = 'seed@dev' for easy cleanup.
//
//   node scripts/seed-dev.mjs          # insert
//   node scripts/seed-dev.mjs --clean  # remove all seed rows
//
// NOT real content — Phase 8 does real seeding. Poster images use
// picsum.photos placeholders.
// ============================================================
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Load .env.local manually (no dependency).
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SEED_TAG = 'seed@dev';

async function clean() {
  await db.from('offers').delete().eq('submitted_by_email', SEED_TAG);
  await db.from('businesses').delete().like('slug', 'seed-%');
  console.log('🧹 Removed all dev seed rows.');
}

function poster(seed, w = 1080, h = 1350) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}.webp`;
}
function today(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await clean(); // idempotent

  const cats = Object.fromEntries(
    (await db.from('categories').select('id,slug')).data.map((c) => [c.slug, c.id]),
  );

  const businesses = [
    { name: 'Pizza Palace Colombo', slug: 'seed-pizza-palace', city: 'Colombo', contact_phone: '+94112345678', whatsapp: '+94771234567', verified: true },
    { name: 'Kandy Furniture House', slug: 'seed-kandy-furniture', city: 'Kandy', contact_phone: '+94812223344', verified: true },
    { name: 'Galle Coffee Co.', slug: 'seed-galle-coffee', city: 'Galle', contact_phone: '+94912556677', whatsapp: '+94761112233', verified: false },
  ];
  const { data: bizRows, error: bizErr } = await db.from('businesses').insert(businesses).select();
  if (bizErr) throw bizErr;
  const biz = Object.fromEntries(bizRows.map((b) => [b.slug, b]));
  console.log(`✅ Inserted ${bizRows.length} businesses.`);

  const offers = [
    { b: 'seed-pizza-palace', cat: 'food', title: 'Buy 1 Get 1 Free — Large Pizzas', description: 'Every large pizza this week comes with a second one free. Dine-in or takeaway, all branches.', city: 'Colombo', end: 12, feat: true },
    { b: 'seed-pizza-palace', cat: 'food', title: 'Weekend Family Meal — 30% Off', description: 'Family bucket: 2 large pizzas, garlic bread, and a 1.5L drink. This weekend only.', city: 'Colombo', end: 1, feat: false },
    { b: 'seed-galle-coffee', cat: 'drink', title: 'Free Pastry with Any Coffee', description: 'Show this offer and get a free croissant or muffin with any hot coffee before 11am.', city: 'Galle', end: 2, feat: false },
    { b: 'seed-galle-coffee', cat: 'drink', title: 'Iced Coffee Happy Hour — 40% Off', description: 'All iced coffees 40% off, 3pm–5pm daily. Beat the heat.', city: 'Galle', end: 20, feat: true },
    { b: 'seed-kandy-furniture', cat: 'furniture', title: 'Teak Dining Sets — Up to 25% Off', description: 'Handcrafted 6-seater teak dining sets. Limited stock clearance.', city: 'Kandy', end: 30, feat: false },
    { b: 'seed-kandy-furniture', cat: 'furniture', title: 'Mattress Mega Sale — From LKR 18,000', description: 'Orthopedic and memory-foam mattresses, all sizes. Free delivery within Kandy.', city: 'Kandy', end: 8, feat: false },
    { b: 'seed-pizza-palace', cat: 'food', title: 'Student Lunch Combo — LKR 950', description: 'Personal pizza + drink for students with a valid ID. Weekdays only.', city: 'Colombo', end: 45, feat: false },
    { b: 'seed-galle-coffee', cat: 'food', title: 'Breakfast Special — Save 20%', description: 'Full breakfast platter with fresh juice, 20% off every morning this month.', city: 'Galle', end: 2, feat: false },
  ];

  const rows = offers.map((o, i) => ({
    business_id: biz[o.b].id,
    category_id: cats[o.cat],
    title: o.title,
    description: o.description,
    poster_url: poster(`ok${i}`),
    poster_thumb_url: poster(`ok${i}`, 400, 500),
    poster_path: `dev/seed-${i}.webp`,
    poster_thumb_path: `dev/seed-${i}-thumb.webp`,
    city: o.city,
    location_note: 'All branches',
    start_date: today(-3),
    end_date: today(o.end),
    status: 'approved',
    is_featured: o.feat,
    approved_at: new Date().toISOString(),
    submitted_by_email: SEED_TAG,
  }));

  const { error: oErr, count } = await db.from('offers').insert(rows, { count: 'exact' });
  if (oErr) throw oErr;
  console.log(`✅ Inserted ${rows.length} offers (${count ?? '?'} confirmed).`);
  console.log('Done. Visit http://localhost:3000 to see them.');
}

const mode = process.argv.includes('--clean') ? clean : seed;
mode().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
