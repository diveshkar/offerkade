// ============================================================
// OfferCeylon: DEV seed (Phase 4 testing only).
// Inserts sample businesses + offers so the public pages render.
// All rows are tagged submitted_by_email = 'seed@dev' for easy cleanup.
//
//   node scripts/seed-dev.mjs          # insert
//   node scripts/seed-dev.mjs --clean  # remove all seed rows
//
// NOT real content: Phase 8 does real seeding. Poster images use
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
    { name: 'Colombo Electronics Hub', slug: 'seed-colombo-electronics', city: 'Colombo', contact_phone: '+94114567890', whatsapp: '+94772345678', verified: true },
    { name: 'Negombo Beach Resort', slug: 'seed-negombo-resort', city: 'Negombo', contact_phone: '+94312233445', whatsapp: '+94763334455', verified: true },
    { name: 'Style Studio Kandy', slug: 'seed-style-studio', city: 'Kandy', contact_phone: '+94815566778', verified: false },
  ];
  const { data: bizRows, error: bizErr } = await db.from('businesses').insert(businesses).select();
  if (bizErr) throw bizErr;
  const biz = Object.fromEntries(bizRows.map((b) => [b.slug, b]));
  console.log(`✅ Inserted ${bizRows.length} businesses.`);

  const offers = [
    { b: 'seed-pizza-palace', cat: 'food', title: 'Buy 1 Get 1 Free: Large Pizzas', description: 'Every large pizza this week comes with a second one free. Dine-in or takeaway, all branches.', city: 'Colombo', end: 12, feat: true },
    { b: 'seed-pizza-palace', cat: 'food', title: 'Weekend Family Meal: 30% Off', description: 'Family bucket: 2 large pizzas, garlic bread, and a 1.5L drink. This weekend only.', city: 'Colombo', end: 1, feat: false },
    { b: 'seed-galle-coffee', cat: 'drink', title: 'Free Pastry with Any Coffee', description: 'Show this offer and get a free croissant or muffin with any hot coffee before 11am.', city: 'Galle', end: 2, feat: false },
    { b: 'seed-galle-coffee', cat: 'drink', title: 'Iced Coffee Happy Hour: 40% Off', description: 'All iced coffees 40% off, 3pm–5pm daily. Beat the heat.', city: 'Galle', end: 20, feat: true },
    { b: 'seed-kandy-furniture', cat: 'furniture', title: 'Teak Dining Sets: Up to 25% Off', description: 'Handcrafted 6-seater teak dining sets. Limited stock clearance.', city: 'Kandy', end: 30, feat: false },
    { b: 'seed-kandy-furniture', cat: 'furniture', title: 'Mattress Mega Sale: From LKR 18,000', description: 'Orthopedic and memory-foam mattresses, all sizes. Free delivery within Kandy.', city: 'Kandy', end: 8, feat: false },
    { b: 'seed-pizza-palace', cat: 'food', title: 'Student Lunch Combo: LKR 950', description: 'Personal pizza + drink for students with a valid ID. Weekdays only.', city: 'Colombo', end: 45, feat: false },
    { b: 'seed-galle-coffee', cat: 'food', title: 'Breakfast Special: Save 20%', description: 'Full breakfast platter with fresh juice, 20% off every morning this month.', city: 'Galle', end: 2, feat: false },

    { b: 'seed-colombo-electronics', cat: 'electronics', title: 'Smartphones: Up to LKR 25,000 Off', description: 'Selected flagship and mid-range smartphones with instant cash discounts. Warranty included.', city: 'Colombo', end: 18, feat: true },
    { b: 'seed-colombo-electronics', cat: 'electronics', title: 'Laptop Clearance: 15% Off All Models', description: 'End-of-season laptop clearance across all brands. Free laptop bag with every purchase.', city: 'Colombo', end: 6, feat: false },
    { b: 'seed-colombo-electronics', cat: 'electronics', title: 'Buy a TV, Get a Soundbar Free', description: 'Any 55-inch or larger smart TV comes with a free soundbar. While stocks last.', city: 'Colombo', end: 25, feat: false },
    { b: 'seed-colombo-electronics', cat: 'services', title: 'Free Phone Screen Check', description: 'Walk in for a free diagnostic on any device. Repairs quoted upfront, no obligation.', city: 'Colombo', end: 40, feat: false },

    { b: 'seed-negombo-resort', cat: 'travel', title: 'Beachfront Stay: 2 Nights for the Price of 1', description: 'Ocean-view double rooms, breakfast included. Valid weekdays through the season.', city: 'Negombo', end: 22, feat: true },
    { b: 'seed-negombo-resort', cat: 'travel', title: 'Sunday Brunch Buffet: LKR 3,500', description: 'Unlimited seafood brunch buffet with pool access, every Sunday 11am to 3pm.', city: 'Negombo', end: 1, feat: false },
    { b: 'seed-negombo-resort', cat: 'travel', title: 'Honeymoon Package: 20% Off', description: 'Three nights in a deluxe suite with candlelit dinner and spa credit for two.', city: 'Negombo', end: 35, feat: false },
    { b: 'seed-negombo-resort', cat: 'food', title: 'Seafood Night: Kids Eat Free', description: 'Every Friday, one child eats free with each paying adult at the beach grill.', city: 'Negombo', end: 14, feat: false },

    { b: 'seed-style-studio', cat: 'beauty', title: 'Hair Spa + Cut: LKR 2,500', description: 'Full hair spa treatment with wash, cut, and blow-dry. Appointments recommended.', city: 'Kandy', end: 10, feat: false },
    { b: 'seed-style-studio', cat: 'beauty', title: 'Bridal Package: 30% Off', description: 'Complete bridal makeup and hair styling with a free trial session booked in advance.', city: 'Kandy', end: 28, feat: false },
    { b: 'seed-style-studio', cat: 'fashion', title: 'Saree Collection: Buy 2 Get 1 Free', description: 'New-season handloom sarees. Mix and match any three, pay for two.', city: 'Kandy', end: 2, feat: false },
    { b: 'seed-style-studio', cat: 'fashion', title: 'Office Wear: Flat 40% Off', description: 'Shirts, trousers, and blazers reduced across the store. All sizes available.', city: 'Kandy', end: 16, feat: false },

    { b: 'seed-pizza-palace', cat: 'groceries', title: 'Pantry Bundle: Save LKR 1,200', description: 'Rice, dhal, coconut oil, and spices bundled at a fixed weekly price.', city: 'Colombo', end: 9, feat: false },
    { b: 'seed-kandy-furniture', cat: 'furniture', title: 'Office Chairs: 2 for LKR 22,000', description: 'Ergonomic mesh office chairs with lumbar support. Assembly included.', city: 'Kandy', end: 5, feat: false },
    { b: 'seed-galle-coffee', cat: 'other', title: 'Loyalty Card: 10th Coffee Free', description: 'Pick up a loyalty card in store. Every tenth hot drink is on us.', city: 'Galle', end: 50, feat: false },
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
