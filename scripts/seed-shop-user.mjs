// ============================================================
// OfferCeylon: DEV demo shop account.
// Creates a confirmed, approved shop owner with branches and
// offers so the dashboard can be tested end to end.
//
//   node scripts/seed-shop-user.mjs          # create or reset
//   node scripts/seed-shop-user.mjs --clean  # remove it
//
// Dev only. Never run against production.
// ============================================================
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

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

const EMAIL = 'demo@offerceylon.lk';
const PASSWORD = 'OfferDemo123!';
const SLUG = 'seed-demo-kitchen';

function today(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function findUser() {
  const { data } = await db.auth.admin.listUsers({ perPage: 200 });
  return data.users.find((u) => u.email === EMAIL) ?? null;
}

async function clean() {
  const user = await findUser();
  if (user) {
    const { data: shops } = await db.from('businesses').select('id').eq('owner_id', user.id);
    for (const s of shops ?? []) {
      await db.from('offers').delete().eq('business_id', s.id);
      await db.from('businesses').delete().eq('id', s.id);
    }
    await db.auth.admin.deleteUser(user.id);
  }
  await db.from('businesses').delete().eq('slug', SLUG);
  console.log('Removed the demo shop account.');
}

async function seed() {
  await clean();

  const { data: created, error: userErr } = await db.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (userErr) throw userErr;
  const user = created.user;

  const { data: shop, error: shopErr } = await db
    .from('businesses')
    .insert({
      name: 'Demo Kitchen Colombo',
      slug: SLUG,
      city: 'Colombo',
      contact_email: EMAIL,
      contact_phone: '+94112345000',
      whatsapp: '+94771230000',
      website: 'https://example.com/demo-kitchen',
      owner_id: user.id,
      status: 'approved',
    })
    .select()
    .single();
  if (shopErr) throw shopErr;

  const { data: branches, error: brErr } = await db
    .from('branches')
    .insert([
      {
        business_id: shop.id,
        label: 'Colpetty',
        district: 'Colombo',
        city: 'Colombo 03',
        address: '64 Galle Road, Colombo 03',
        is_primary: true,
      },
      {
        business_id: shop.id,
        label: 'Kandy City',
        district: 'Kandy',
        city: 'Kandy',
        address: '22 Dalada Veediya, Kandy',
        is_primary: false,
      },
    ])
    .select();
  if (brErr) throw brErr;

  const { data: cats } = await db.from('categories').select('id,slug');
  const catId = (slug) => cats.find((c) => c.slug === slug)?.id ?? cats[0].id;

  const { data: offers, error: offErr } = await db
    .from('offers')
    .insert([
      {
        business_id: shop.id,
        category_id: catId('food'),
        title: 'Demo Offer: Lunch Buffet 25% Off',
        description: 'Weekday lunch buffet at both branches.',
        poster_url: 'https://picsum.photos/seed/demo1/1080/1350.webp',
        poster_thumb_url: 'https://picsum.photos/seed/demo1/400/500.webp',
        city: 'Colombo',
        location_note: '2 branches',
        start_date: today(-2),
        end_date: today(21),
        status: 'approved',
        submitted_by_email: EMAIL,
        approved_at: new Date().toISOString(),
      },
      {
        business_id: shop.id,
        category_id: catId('drink'),
        title: 'Demo Offer: Free Coffee Refill',
        description: 'One free refill with any hot drink.',
        poster_url: 'https://picsum.photos/seed/demo2/1080/1350.webp',
        poster_thumb_url: 'https://picsum.photos/seed/demo2/400/500.webp',
        city: 'Colombo',
        location_note: 'Colpetty',
        start_date: today(-1),
        end_date: today(2),
        status: 'approved',
        submitted_by_email: EMAIL,
        approved_at: new Date().toISOString(),
      },
    ])
    .select();
  if (offErr) throw offErr;

  await db.from('offer_branches').insert([
    { offer_id: offers[0].id, branch_id: branches[0].id },
    { offer_id: offers[0].id, branch_id: branches[1].id },
    { offer_id: offers[1].id, branch_id: branches[0].id },
  ]);

  console.log('Demo shop account ready.');
  console.log('  Email:    ' + EMAIL);
  console.log('  Password: ' + PASSWORD);
  console.log('  Shop:     ' + shop.name + ' (' + shop.status + ')');
  console.log('  Branches: ' + branches.length + ', Offers: ' + offers.length);
}

const mode = process.argv.includes('--clean') ? clean : seed;
mode().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
