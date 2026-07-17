/* OfferCeylon brand asset generator
 * Outputs: public/brand SVG logo suite + app/favicon.ico + app/icon.svg +
 *          app/apple-icon.png + public/brand/og-image.png
 *
 * Run:  npm i -D opentype.js   (one-time; sharp already ships with Next)
 *       node scripts/generate-brand.js
 *       copy public/brand/og-image.png to app/opengraph-image.png if regenerated
 *
 * Wordmark fonts are read from C:/Windows/Fonts (Georgia Bold + Segoe UI)
 * and baked into the SVGs as path outlines, so the output files are
 * self-contained and render identically everywhere.
 */
const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJ = path.join(__dirname, '..');
const BRAND = path.join(PROJ, 'public/brand');
fs.mkdirSync(BRAND, { recursive: true });

// ---------- fonts ----------
function loadFont(p) {
  const buf = fs.readFileSync(p);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}
const georgia = loadFont('C:/Windows/Fonts/georgiab.ttf');
const segoe = loadFont('C:/Windows/Fonts/segoeui.ttf');

function word(font, text, opts = {}) {
  const p = font.getPath(text, 0, 0, 100, { kerning: true, ...opts });
  return { d: p.toPathData(2), adv: font.getAdvanceWidth(text, 100, { kerning: true, ...opts }) };
}
const W_OFFER = word(georgia, 'Offer');
const W_CEYLON = word(georgia, 'Ceylon');
const W_TAG = word(segoe, 'SRI LANKA’S DAILY OFFERS HUB', { letterSpacing: 0.18 });

// ---------- palette ----------
const themes = {
  dark: {
    textGold: ['#FFD87E', '#E8891B'],
    textGreen: ['#3FCB8D', '#118A58'],
    tagline: '#9FB2D8',
  },
  light: {
    textGold: ['#EFA22F', '#B96A08'],
    textGreen: ['#1FA36B', '#0A6B42'],
    tagline: '#5A6B8C',
  },
};

// ---------- shared defs ----------
function defs(theme, uid) {
  const t = themes[theme];
  return `<defs>
  <radialGradient id="${uid}bg" cx="50%" cy="40%" r="78%">
    <stop offset="0" stop-color="#1C2E5E"/><stop offset="1" stop-color="#0A1330"/>
  </radialGradient>
  <linearGradient id="${uid}goldStroke" x1="0" y1="0" x2="0" y2="520" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${theme === 'dark' ? '#FFE49B' : '#EFB33F'}"/><stop offset="1" stop-color="${theme === 'dark' ? '#E09A28' : '#C87E14'}"/>
  </linearGradient>
  <linearGradient id="${uid}letterGold" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#FFE29A"/><stop offset="1" stop-color="#E8961F"/>
  </linearGradient>
  <linearGradient id="${uid}cardOrange" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#D95A26"/><stop offset="1" stop-color="#8A2E0E"/>
  </linearGradient>
  <linearGradient id="${uid}cardNavy" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#27395F"/><stop offset="1" stop-color="#0F1B3D"/>
  </linearGradient>
  <linearGradient id="${uid}mapFill" x1="0" y1="0" x2="0" y2="520" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#1D2F5E"/><stop offset="1" stop-color="#101C40"/>
  </linearGradient>
  <linearGradient id="${uid}sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.16"/>
    <stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="${uid}tGold" x1="0" y1="-80" x2="0" y2="4" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${t.textGold[0]}"/><stop offset="1" stop-color="${t.textGold[1]}"/>
  </linearGradient>
  <linearGradient id="${uid}tGreen" x1="0" y1="-80" x2="0" y2="4" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${t.textGreen[0]}"/><stop offset="1" stop-color="${t.textGreen[1]}"/>
  </linearGradient>
  <filter id="${uid}blurS" x="-120%" y="-120%" width="340%" height="340%">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  <filter id="${uid}outGlow" x="-15%" y="-15%" width="130%" height="130%">
    <feGaussianBlur stdDeviation="5"/>
  </filter>
  <filter id="${uid}cardShadow" x="-35%" y="-35%" width="170%" height="170%">
    <feDropShadow dx="0" dy="9" stdDeviation="10" flood-color="#04091C" flood-opacity="0.55"/>
  </filter>
</defs>`;
}

// ---------- Sri Lanka map (local space 300x520, pear silhouette) ----------
const MAP_D = `M92,52 C88,30 98,12 114,10 C130,8 142,16 140,30
C138,40 128,44 120,40 C132,62 150,88 164,114
C182,148 204,180 216,218 C230,262 242,308 246,352
C250,396 240,440 218,472 C198,500 164,516 132,512
C102,508 76,490 62,462 C46,428 42,388 44,348
C46,308 52,272 56,236 C60,208 56,186 46,170
C38,148 44,120 58,100 C70,82 84,70 92,52 Z`;

const COAST = {
  A: [140, 30], B: [164, 114], C: [216, 218], D: [246, 352], E: [218, 472],
  F: [132, 512], G: [62, 462], H: [44, 348], I: [56, 236], J: [58, 100], K: [92, 52],
};
const INNER = {
  P: [140, 130], Q: [105, 215], R: [175, 205], S: [135, 290], T: [200, 330],
  U: [95, 330], V: [150, 400], W: [105, 455], X: [175, 455],
};
const PTS = { ...COAST, ...INNER };
const EDGES = [
  'A-P', 'K-P', 'B-P', 'P-R', 'P-Q', 'B-R', 'I-Q', 'Q-R', 'Q-S', 'R-C', 'R-S',
  'C-T', 'R-T', 'S-T', 'S-U', 'H-U', 'S-V', 'T-V', 'T-D', 'U-V', 'U-W', 'V-W',
  'V-X', 'D-X', 'W-G', 'W-F', 'X-F', 'X-E', 'U-Q', 'H-W',
];
const BRIGHT_NODES = ['A', 'C', 'F', 'H', 'P', 'T', 'V', 'W', 'I'];

function mapGroup(uid, theme = 'dark') {
  const edgeD = EDGES.map(e => {
    const [a, b] = e.split('-');
    return `M${PTS[a][0]},${PTS[a][1]}L${PTS[b][0]},${PTS[b][1]}`;
  }).join('');
  let nodes = '';
  for (const [k, [x, y]] of Object.entries(PTS)) {
    const bright = BRIGHT_NODES.includes(k);
    const r = bright ? 4.2 : 2.8;
    nodes += `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#F5B942" opacity="${bright ? 0.5 : 0.28}" filter="url(#${uid}blurS)"/>`;
    nodes += `<circle cx="${x}" cy="${y}" r="${r}" fill="${bright ? '#FFF3C9' : '#FFE9AE'}" opacity="${bright ? 1 : 0.7}"/>`;
  }
  return `<path d="${MAP_D}" fill="url(#${uid}mapFill)" fill-opacity="0.9"/>
<path d="${edgeD}" stroke="#F0B75A" stroke-opacity="0.32" stroke-width="1.5" fill="none"/>
<path d="${MAP_D}" fill="none" stroke="url(#${uid}goldStroke)" stroke-width="9" opacity="${theme === 'dark' ? 0.8 : 0.4}" filter="url(#${uid}outGlow)"/>
<path d="${MAP_D}" fill="none" stroke="url(#${uid}goldStroke)" stroke-width="5" stroke-linejoin="round"/>
${nodes}`;
}

// ---------- cards ----------
function card(uid, cx, cy, rot, kind) {
  const w = 150, h = 212, rx = 18;
  const rect = `x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${rx}"`;
  let letter;
  if (kind === 'O') {
    letter = `<ellipse rx="32" ry="39" fill="none" stroke="url(#${uid}letterGold)" stroke-width="17"/>`;
  } else {
    // C = elliptical arc with right-facing opening (48deg half-gap)
    const rxE = 32, ryE = 39, a = (48 * Math.PI) / 180;
    const sx = (rxE * Math.cos(a)).toFixed(1), sy = (ryE * Math.sin(a)).toFixed(1);
    letter = `<path d="M${sx},${-sy} A${rxE},${ryE} 0 1 0 ${sx},${sy}" fill="none" stroke="url(#${uid}letterGold)" stroke-width="17"/>`;
  }
  const border = kind === 'O'
    ? `<rect ${rect} fill="none" stroke="#FFC98F" stroke-opacity="0.35" stroke-width="2"/>`
    : `<rect ${rect} fill="none" stroke="url(#${uid}letterGold)" stroke-width="3"/>`;
  return `<g transform="translate(${cx},${cy}) rotate(${rot})" filter="url(#${uid}cardShadow)">
  <rect ${rect} fill="url(#${uid}card${kind === 'O' ? 'Orange' : 'Navy'})"/>
  <rect ${rect} fill="url(#${uid}sheen)"/>
  ${border}
  ${letter}
</g>`;
}

// ---------- the mark: map + cards, local space 400x600 ----------
function markGroup(uid, theme = 'dark') {
  return `<g transform="translate(30,20) scale(1.08)">${mapGroup(uid, theme)}</g>
${card(uid, 163, 318, -12, 'O')}
${card(uid, 262, 336, 9, 'C')}`;
}

// ---------- wordmark ----------
function wordmark(uid, cx, baselineY, size, gapEm = 0.26) {
  const s = size / 100;
  const total = (W_OFFER.adv + gapEm * 100 + W_CEYLON.adv) * s;
  const x0 = cx - total / 2;
  const xCeylon = x0 + (W_OFFER.adv + gapEm * 100) * s;
  return {
    width: total,
    x0,
    svg: `<g transform="translate(${x0.toFixed(1)},${baselineY}) scale(${s})"><path d="${W_OFFER.d}" fill="url(#${uid}tGold)"/></g>
<g transform="translate(${xCeylon.toFixed(1)},${baselineY}) scale(${s})"><path d="${W_CEYLON.d}" fill="url(#${uid}tGreen)"/></g>`,
  };
}
function tagline(uid, theme, cx, baselineY, size) {
  const s = size / 100;
  const w = W_TAG.adv * s;
  return {
    width: w,
    svg: `<g transform="translate(${(cx - w / 2).toFixed(1)},${baselineY}) scale(${s})"><path d="${W_TAG.d}" fill="${themes[theme].tagline}"/></g>`,
  };
}

const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

// ---------- 1. full lockup (1024x1024, navy bg) ----------
function fullLockup() {
  const uid = 'f-';
  const wm = wordmark(uid, 512, 818, 130);
  const tg = tagline(uid, 'dark', 512, 904, 34);
  return `<svg ${XMLNS} viewBox="0 0 1024 1024" width="1024" height="1024">
<title>OfferCeylon</title>
${defs('dark', uid)}
<rect width="1024" height="1024" rx="56" fill="url(#${uid}bg)"/>
<g transform="translate(316,52) scale(0.98)">${markGroup(uid)}</g>
${wm.svg}
${tg.svg}
</svg>`;
}

// ---------- 2. mark only (transparent) ----------
function markOnly() {
  const uid = 'm-';
  return `<svg ${XMLNS} viewBox="0 0 400 600" width="400" height="600">
<title>OfferCeylon mark</title>
${defs('dark', uid)}
${markGroup(uid)}
</svg>`;
}

// ---------- 3. horizontal lockup ----------
function horizontal(theme) {
  const uid = theme === 'dark' ? 'hd-' : 'hl-';
  const wmSize = 112, wmBase = 158;
  const s = 280 / 600;
  const textX = 234;
  const wmWidth = (W_OFFER.adv + 26 + W_CEYLON.adv) * (wmSize / 100);
  const wmCx = textX + wmWidth / 2;
  const wm = wordmark(uid, wmCx, wmBase, wmSize);
  const tgSize = 29.5;
  const tgW = W_TAG.adv * (tgSize / 100);
  const tg = tagline(uid, theme, textX + tgW / 2, 224, tgSize);
  const vw = Math.ceil(textX + Math.max(wmWidth, tgW) + 24);
  return `<svg ${XMLNS} viewBox="0 0 ${vw} 300" width="${vw}" height="300">
<title>OfferCeylon</title>
${defs(theme, uid)}
<g transform="translate(14,10) scale(${s.toFixed(4)})">${markGroup(uid, theme)}</g>
${wm.svg}
${tg.svg}
</svg>`;
}

// ---------- 4. favicon (64x64) ----------
function favicon({ rounded = true } = {}) {
  const uid = 'v-';
  const cArc = (() => {
    const rxE = 6.6, ryE = 8.2, a = (48 * Math.PI) / 180;
    const sx = (rxE * Math.cos(a)).toFixed(2), sy = (ryE * Math.sin(a)).toFixed(2);
    return `M${sx},${-sy} A${rxE},${ryE} 0 1 0 ${sx},${sy}`;
  })();
  return `<svg ${XMLNS} viewBox="0 0 64 64" width="64" height="64">
<defs>
  <radialGradient id="${uid}bg" cx="50%" cy="38%" r="80%">
    <stop offset="0" stop-color="#1D2F60"/><stop offset="1" stop-color="#0A1330"/>
  </radialGradient>
  <linearGradient id="${uid}or" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#C24A1A"/><stop offset="1" stop-color="#77230A"/>
  </linearGradient>
  <linearGradient id="${uid}nv" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#2E4068"/><stop offset="1" stop-color="#13204A"/>
  </linearGradient>
</defs>
<rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="url(#${uid}bg)"/>
<g transform="translate(23,29) rotate(-10)">
  <rect x="-13" y="-19" width="26" height="38" rx="4.5" fill="url(#${uid}or)"/>
  <ellipse rx="6.6" ry="8.2" fill="none" stroke="#FFC85A" stroke-width="4.6"/>
</g>
<g transform="translate(43,36) rotate(8)">
  <rect x="-13" y="-19" width="26" height="38" rx="4.5" fill="url(#${uid}nv)" stroke="#F0A930" stroke-width="2"/>
  <path d="${cArc}" fill="none" stroke="#FFC85A" stroke-width="4.6"/>
</g>
</svg>`;
}

// ---------- 5. OG image svg (1200x630) ----------
function ogSvg() {
  const uid = 'og-';
  const wmSize = 100, textX = 465, wmBase = 310;
  const wmWidth = (W_OFFER.adv + 26 + W_CEYLON.adv) * (wmSize / 100);
  const wm = wordmark(uid, textX + wmWidth / 2, wmBase, wmSize);
  const tgSize = 29;
  const tgW = W_TAG.adv * (tgSize / 100);
  const tg = tagline(uid, 'dark', textX + tgW / 2, 375, tgSize);
  return `<svg ${XMLNS} viewBox="0 0 1200 630" width="1200" height="630">
${defs('dark', uid)}
<rect width="1200" height="630" fill="url(#${uid}bg)"/>
<g transform="translate(130,100) scale(0.72)">${markGroup(uid)}</g>
${wm.svg}
${tg.svg}
</svg>`;
}

// ---------- ICO packer (PNG-in-ICO) ----------
function packIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = [], blobs = [];
  for (const { size, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(e); blobs.push(buf);
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

// ---------- write everything ----------
async function main() {
  const files = {
    [path.join(BRAND, 'logo-full.svg')]: fullLockup(),
    [path.join(BRAND, 'logo-mark.svg')]: markOnly(),
    [path.join(BRAND, 'logo-horizontal-dark.svg')]: horizontal('dark'),
    [path.join(BRAND, 'logo-horizontal-light.svg')]: horizontal('light'),
    [path.join(PROJ, 'public/favicon.svg')]: favicon(),
    [path.join(PROJ, 'app/icon.svg')]: favicon(),
  };
  for (const [f, content] of Object.entries(files)) {
    fs.writeFileSync(f, content.trim() + '\n');
    console.log(f.replace(/\\/g, '/').replace(PROJ + '/', ''), '=', (fs.statSync(f).size / 1024).toFixed(1) + 'KB');
  }

  // favicon.ico (16/32/48) from favicon.svg
  const favBuf = Buffer.from(favicon());
  const pngs = [];
  for (const size of [16, 32, 48]) {
    const buf = await sharp(favBuf, { density: (72 * size) / 64 * 4 })
      .resize(size, size).png().toBuffer();
    pngs.push({ size, buf });
  }
  const ico = packIco(pngs);
  fs.writeFileSync(path.join(PROJ, 'app/favicon.ico'), ico);
  console.log('app/favicon.ico =', (ico.length / 1024).toFixed(1) + 'KB');

  // apple-icon 180x180 (square, no rounding — iOS applies its own mask)
  const apple = await sharp(Buffer.from(favicon({ rounded: false })), { density: (72 * 180) / 64 * 2 })
    .resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(PROJ, 'app/apple-icon.png'), apple);
  console.log('app/apple-icon.png =', (apple.length / 1024).toFixed(1) + 'KB');

  // og-image 1200x630
  const og = await sharp(Buffer.from(ogSvg()), { density: 144 }).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(BRAND, 'og-image.png'), og);
  console.log('public/brand/og-image.png =', (og.length / 1024).toFixed(1) + 'KB');
}

main().catch(e => { console.error(e); process.exit(1); });
