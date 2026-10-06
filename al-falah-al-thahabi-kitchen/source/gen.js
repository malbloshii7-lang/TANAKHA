// Renders every Al Falah Al Thahabi Kitchen logo asset (PNG + vector PDF) with headless Chromium.
// Usage: node gen.js [outDir] [--debug]   (outDir defaults to the folder above this one)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const E = require('./emblem');

const OUT = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..'));
const DEBUG = process.argv.includes('--debug');
const FONTS = path.join(__dirname, 'fonts');

const C = { ghaf: '#0D3A33', gold: '#C9A24D', goldDeep: '#A9822F', ivory: '#F6F0E3', qahwa: '#2B1D14' };
const GOLD = `<stop offset="0" stop-color="#F6E7A8"/><stop offset=".32" stop-color="#D9B663"/><stop offset=".58" stop-color="#B68B38"/><stop offset=".8" stop-color="#DDBE6C"/><stop offset="1" stop-color="#9E772F"/>`;
const GOLD_ON_LIGHT = `<stop offset="0" stop-color="#D8B45F"/><stop offset=".35" stop-color="#B38A35"/><stop offset=".6" stop-color="#94701F"/><stop offset=".82" stop-color="#B9933F"/><stop offset="1" stop-color="#83621C"/>`;
const TEXT_GOLD = `<stop offset=".18" stop-color="#F3E2A2"/><stop offset=".55" stop-color="#D6B261"/><stop offset=".9" stop-color="#B38A3A"/>`;
const AR_NAME = 'مطبخ الفلاح الذهبي';
const EN_NAME = 'AL FALAH AL THAHABI';

const head = (w, h, transparent) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Ruqaa;src:url("${FONTS}/ArefRuqaa-Bold.ttf");font-weight:700}
/* static Cinzel instances: a variable font embeds in PDF as Type3 glyphs, which breaks gradient fills */
@font-face{font-family:Cinzel;src:url("${FONTS}/Cinzel-SemiBold.ttf");font-weight:600}
@font-face{font-family:Cinzel;src:url("${FONTS}/Cinzel-Medium.ttf");font-weight:500}
@font-face{font-family:Mono;src:url("${FONTS}/DMMono-Regular.ttf")}
@page{size:${w}px ${h}px;margin:0}
html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;background:${transparent ? 'transparent' : 'none'}}
svg{display:block}
</style></head><body>`;

// In-page typesetting: measures true ink bounds, then stacks blocks on exact optical gaps.
const LAYOUT_JS = `<script>
const ctx = document.createElement('canvas').getContext('2d');
function ink(t) {
  ctx.font = (t.dataset.weight || 400) + ' ' + t.dataset.size + 'px ' + t.dataset.family;
  ctx.letterSpacing = (t.dataset.ls || 0) + 'px';
  const m = ctx.measureText(t.textContent);
  // canvas widens Arabic word spaces relative to SVG shaping, so RTL widths come from SVG geometry
  if (t.dataset.rtl) { const bb = t.getBBox(); return { x0: bb.x, x1: bb.x + bb.width, y0: -m.actualBoundingBoxAscent, y1: m.actualBoundingBoxDescent }; }
  return { x0: -m.actualBoundingBoxLeft, x1: m.actualBoundingBoxRight, y0: -m.actualBoundingBoxAscent, y1: m.actualBoundingBoxDescent };
}
function box(g) {
  if (g.dataset.kind === 'text') return ink(g.querySelector('text'));
  const r = +g.dataset.r; if (r) return { x0: -r, x1: r, y0: -r, y1: r };
  const b = g.getBBox(); return { x0: b.x, x1: b.x + b.width, y0: b.y, y1: b.y + b.height };
}
function place(g, x, y) { g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')'); }
function vstack(root, cx, cy) {
  const blocks = [...root.querySelectorAll(':scope > [data-block]')];
  const boxes = blocks.map(box);
  const total = boxes.reduce((s, b, i) => s + b.y1 - b.y0 + (i < blocks.length - 1 ? +blocks[i].dataset.gap : 0), 0);
  let y = cy - total / 2;
  blocks.forEach((g, i) => {
    const b = boxes[i]; place(g, cx - (b.x0 + b.x1) / 2, y - b.y0);
    g._ink = { x0: cx - (b.x1 - b.x0) / 2, x1: cx + (b.x1 - b.x0) / 2, y0: y, y1: y + b.y1 - b.y0 };
    y += b.y1 - b.y0 + +g.dataset.gap;
  });
  return blocks;
}
// hairlines either side of a word, spanning the ink width of a reference block
function sizeRules() {
  document.querySelectorAll('[data-rules]').forEach((g) => {
    const ref = box(document.getElementById(g.dataset.rules)), w = (ref.x1 - ref.x0) / 2;
    const b = ink(g.querySelector('text')), half = (b.x1 - b.x0) / 2, gap = +g.dataset.rulegap, h = +g.dataset.ruleh;
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, L = w - half - gap;
    g.querySelectorAll('rect').forEach((r, i) => {
      r.setAttribute('width', L.toFixed(2)); r.setAttribute('height', h); r.setAttribute('y', (cy - h / 2).toFixed(2));
      r.setAttribute('x', (i ? cx + half + gap : cx - half - gap - L).toFixed(2));
    });
  });
}
// signboard: [English | emblem | Arabic], emblem centred, text set at equal distance either side
function hrow(root) {
  const [cx, cy, gap] = root.dataset.hrow.split(',').map(Number);
  const emb = root.querySelector('[data-role=emb]'), en = root.querySelector('[data-role=en]'), ar = root.querySelector('[data-role=ar]');
  const be = box(emb); place(emb, cx, cy);
  const ba = box(ar); place(ar, cx + be.x1 + gap - ba.x0, cy - (ba.y0 + ba.y1) / 2);
  const w = Math.max(...vstack(en, 0, 0).map((g) => g._ink.x1 - g._ink.x0));
  place(en, cx + be.x0 - gap - w / 2, cy);
}
function debug(svg) {
  svg.querySelectorAll('[data-vstack] > [data-block]').forEach((g) => { const i = g._ink; svg.insertAdjacentHTML('beforeend', '<rect x="' + i.x0 + '" y="' + i.y0 + '" width="' + (i.x1 - i.x0) + '" height="' + (i.y1 - i.y0) + '" fill="none" stroke="red"/>'); });
  svg.insertAdjacentHTML('beforeend', '<line x1="50%" x2="50%" y1="0" y2="100%" stroke="cyan"/><line y1="50%" y2="50%" x1="0" x2="100%" stroke="cyan"/>');
}
window.__layout = async (dbg) => {
  await document.fonts.ready;
  for (const f of ['700 40px Ruqaa', '500 40px Cinzel', '600 40px Cinzel', '40px Mono']) await document.fonts.load(f);
  sizeRules();
  document.querySelectorAll('[data-vstack]').forEach((r) => { const [cx, cy] = r.dataset.vstack.split(',').map(Number); vstack(r, cx, cy); });
  document.querySelectorAll('[data-hrow]').forEach(hrow);
  if (dbg) document.querySelectorAll('svg[data-page]').forEach(debug);
};
</script>`;

const text = (o) => `<text data-family="${o.family}" data-size="${o.size}" data-weight="${o.weight || 400}"${o.ls ? ` data-ls="${o.ls}"` : ''}${o.rtl ? ' data-rtl="1" direction="rtl"' : ''}
  x="${o.x || 0}" y="${o.y || 0}" text-anchor="${o.anchor || (o.rtl ? 'end' : 'start')}" font-family="${o.family}" font-size="${o.size}" font-weight="${o.weight || 400}" letter-spacing="${o.ls || 0}" fill="${o.fill}"${o.opacity ? ` fill-opacity="${o.opacity}"` : ''}>${o.text}</text>`;

const grad = (id, stops, vertical) => vertical
  ? `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>`
  : `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="-420" y1="-480" x2="420" y2="480">${stops}</linearGradient>`;

// A single rice grain between two hairlines.
const divider = (color, w = 210, h = 2) => `<g fill="${color}">
  <rect x="${-w - 26}" y="${-h / 2}" width="${w}" height="${h}"/><rect x="26" y="${-h / 2}" width="${w}" height="${h}"/>
  <ellipse cx="0" cy="0" rx="12" ry="4.2"/></g>`;

const svgOpen = (W, H, bg) => `<svg data-page xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : ''}`;

function lockupVertical({ id, W = 1600, H = 1600, bg, emb, nameFill, enFill, ruleFill, defs = '', scale = 0.62 }) {
  return `${svgOpen(W, H, bg)}<defs>${defs}</defs>
  <g data-vstack="${W / 2},${H / 2 - 4}">
    <g data-block data-kind="emblem" data-r="${490 * scale}" data-gap="66"><g transform="scale(${scale})">${emb}</g></g>
    <g data-block data-kind="text" data-gap="54">${text({ family: 'Ruqaa', weight: 700, size: 128, text: AR_NAME, rtl: true, fill: nameFill })}</g>
    <g data-block data-kind="rule" data-gap="52">${divider(ruleFill)}</g>
    <g data-block data-kind="text" data-gap="34" id="en-${id}">${text({ family: 'Cinzel', weight: 600, size: 68, ls: 11, text: EN_NAME, fill: enFill })}</g>
    <g data-block data-kind="text" data-gap="0" data-rules="en-${id}" data-rulegap="30" data-ruleh="2">${text({ family: 'Cinzel', weight: 500, size: 30, ls: 19, text: 'KITCHEN', fill: enFill })}<rect fill="${ruleFill}"/><rect fill="${ruleFill}"/></g>
  </g></svg>`;
}

function signboard({ W = 3400, H = 1000, bg, emb, nameFill, enFill, ruleFill, defs = '', scale = 0.72 }) {
  return `${svgOpen(W, H, bg)}<defs>${defs}</defs>
  <g data-hrow="${W / 2},${H / 2},124">
    <g data-role="emb" data-kind="emblem" data-r="${490 * scale}"><g transform="scale(${scale})">${emb}</g></g>
    <g data-role="ar" data-kind="text">${text({ family: 'Ruqaa', weight: 700, size: 150, text: AR_NAME, rtl: true, fill: nameFill })}</g>
    <g data-role="en">
      <g data-block data-kind="text" data-gap="30">${text({ family: 'Cinzel', weight: 600, size: 104, ls: 16, text: 'AL FALAH', fill: enFill })}</g>
      <g data-block data-kind="text" data-gap="40" id="en-sign">${text({ family: 'Cinzel', weight: 600, size: 104, ls: 16, text: 'AL THAHABI', fill: enFill })}</g>
      <g data-block data-kind="text" data-gap="0" data-rules="en-sign" data-rulegap="30" data-ruleh="2.4">${text({ family: 'Cinzel', weight: 500, size: 38, ls: 22, text: 'KITCHEN', fill: enFill })}<rect fill="${ruleFill}"/><rect fill="${ruleFill}"/></g>
    </g>
  </g></svg>`;
}

function emblemOnly({ W, H, bg, emb, diameter }) {
  const s = diameter / 980;
  return `${svgOpen(W, H, bg)}<g transform="translate(${W / 2} ${H / 2}) scale(${s})">${emb}</g></svg>`;
}

// Identity sheet: construction diagram on the left, palette / type / colourways on the right.
function brandSheet() {
  const W = 2400, H = 1600, ink = C.ghaf, mute = 'rgba(13,58,51,.62)';
  const cx = 620, cy = 650, s = 0.76;
  const P = ([x, y]) => [cx + x * s, cy + y * s];
  const mono = (x, y, str, o = {}) => text({ family: 'Mono', size: o.size || 15, ls: o.ls ?? 2.4, x, y, text: str, fill: o.fill || ink, anchor: o.anchor, opacity: o.opacity });

  // numbered leaders from a feature point out to a marker at the panel margin
  const feats = [
    { n: '01', at: [-Math.sqrt(486 ** 2 - 290 ** 2), -290], side: -1 },
    { n: '02', at: [Math.sqrt(440 ** 2 - 290 ** 2), -290], side: 1 },
    { n: '03', at: E.picto([-150, 60]), side: -1 },
    { n: '04', at: E.picto([E.STEAM_X + 6, E.surface(E.STEAM_X) - E.STEAM_GAP - E.SIDE_L * 0.55]), side: 1 },
  ];
  const leaders = feats.map(({ n, at, side }) => {
    const [fx, fy] = P(at), mx = cx + side * 520;
    const lx = mx - side * 22;
    return `<line x1="${fx}" y1="${fy}" x2="${lx}" y2="${fy}" stroke="${ink}" stroke-width="1.2"/>
      <circle cx="${fx}" cy="${fy}" r="4.5" fill="${ink}" stroke="${C.ivory}" stroke-width="1.5"/>
      <circle cx="${mx}" cy="${fy}" r="22" fill="${C.ivory}" stroke="${ink}" stroke-width="1.2"/>
      ${mono(mx, fy + 5.5, n, { size: 15, ls: 1, anchor: 'middle' })}`;
  }).join('');

  const legend = [
    ['01', 'BEZEL', 'Twin gold rings, the rim of the serving tray'],
    ['02', 'BRAID', '108 rice grains set at 38°, after talli braid'],
    ['03', 'HEAP', 'Six strata of grain in a ±18° sadu weave'],
    ['04', 'STEAM', 'Three tapering wisps, drawn like a qalam stroke'],
  ].map(([n, k, v], i) => {
    const x = 110 + (i % 2) * 520, y = 1290 + Math.floor(i / 2) * 110;
    return `${mono(x, y, n, { fill: C.goldDeep, size: 15 })}${text({ family: 'Cinzel', weight: 600, size: 22, ls: 4, x: x + 52, y, text: k, fill: ink })}
      ${mono(x + 52, y + 36, v.toUpperCase(), { size: 13, ls: 1.2, fill: mute })}`;
  }).join('');

  const RX = 1300, RW = 980;
  const sw = [
    ['GHAF GREEN', C.ghaf, '13 58 51'], ['THAHAB GOLD', C.gold, '201 162 77'],
    ['BASMATI IVORY', C.ivory, '246 240 227'], ['QAHWA BROWN', C.qahwa, '43 29 20'],
  ].map(([name, hex, rgb], i) => {
    const x = RX + i * 250;
    return `<rect x="${x}" y="370" width="230" height="230" fill="${hex}"${hex === C.ivory ? ` stroke="${ink}" stroke-opacity=".35" stroke-width="1.5"` : ''}/>
      ${text({ family: 'Cinzel', weight: 600, size: 17, ls: 3, x, y: 640, text: name, fill: ink })}
      ${mono(x, 670, hex, { size: 14, ls: 1.5, fill: mute })}${mono(x, 694, 'RGB ' + rgb, { size: 14, ls: 1.5, fill: mute })}`;
  }).join('');

  const tiles = [
    { bg: C.ghaf, emb: E.emblem({ gradId: 'bs1', gradient: GOLD }), label: 'GOLD ON GHAF' },
    { bg: C.ivory, emb: E.emblem({ paint: C.ghaf }), label: 'GHAF ON IVORY', line: true },
    { bg: C.qahwa, emb: E.emblem({ paint: C.ivory }), label: 'IVORY ON QAHWA' },
  ].map((t, i) => {
    const x = RX + i * 333.33, w = 313.33;
    return `<rect x="${x}" y="1150" width="${w}" height="300" fill="${t.bg}"${t.line ? ` stroke="${ink}" stroke-opacity=".35" stroke-width="1.5"` : ''}/>
      <g transform="translate(${x + w / 2} 1300) scale(${236 / 980})">${t.emb}</g>
      ${mono(x, 1484, t.label, { size: 13, ls: 2, fill: mute })}`;
  }).join('');

  const rule = (y) => `<rect x="${RX}" y="${y}" width="${RW}" height="1.2" fill="${ink}" fill-opacity=".3"/>`;
  return `${svgOpen(W, H, C.ivory)}
  <g stroke="${ink}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="5 7" fill="none">
    <line x1="${cx}" y1="${cy - 520}" x2="${cx}" y2="${cy + 520}"/><line x1="${cx - 470}" y1="${cy}" x2="${cx + 470}" y2="${cy}"/>
    <circle cx="${cx}" cy="${cy}" r="${490 * s * 1.25}"/>
  </g>
  <g transform="translate(${cx} ${cy}) scale(${s})">${E.emblem({ gradId: 'cs2', gradient: GOLD_ON_LIGHT })}</g>
  ${leaders}
  ${mono(cx + 490 * s * 1.25 * Math.SQRT1_2 + 14, cy + 490 * s * 1.25 * Math.SQRT1_2 + 26, 'CLEAR SPACE · R/4', { size: 12, ls: 1.6, fill: mute })}
  <rect x="110" y="1220" width="1020" height="1.2" fill="${ink}" fill-opacity=".3"/>
  ${legend}
  ${mono(RX, 132, 'IDENTITY SHEET · EMBLEM, PALETTE, TYPE', { size: 13, ls: 2.4, fill: C.goldDeep })}
  ${text({ family: 'Cinzel', weight: 600, size: 36, ls: 5, x: RX, y: 210, text: EN_NAME, fill: ink })}
  ${text({ family: 'Cinzel', weight: 500, size: 17, ls: 10, x: RX, y: 250, text: 'KITCHEN', fill: C.goldDeep })}
  ${text({ family: 'Ruqaa', weight: 700, size: 62, x: RX + RW, y: 236, text: AR_NAME, rtl: true, anchor: 'start', fill: ink })}
  ${rule(298)}
  ${mono(RX, 342, 'PALETTE', { size: 13, ls: 3, fill: mute })}
  ${sw}
  ${rule(736)}
  ${mono(RX, 780, 'TYPE', { size: 13, ls: 3, fill: mute })}
  ${text({ family: 'Ruqaa', weight: 700, size: 140, x: RX + 240, y: 955, text: 'ذهبي', rtl: true, anchor: 'middle', fill: ink })}
  ${text({ family: 'Cinzel', weight: 600, size: 72, ls: 5, x: RX + 743, y: 955, text: 'THAHABI', anchor: 'middle', fill: ink })}
  ${mono(RX, 1050, 'ARABIC · AREF RUQAA BOLD', { size: 13, ls: 2, fill: mute })}
  ${mono(RX + 500, 1050, 'LATIN · CINZEL SEMIBOLD', { size: 13, ls: 2, fill: mute })}
  ${rule(1084)}
  ${mono(RX, 1126, 'COLOURWAYS', { size: 13, ls: 3, fill: mute })}
  ${tiles}
  ${mono(110, 1540, 'MINIMUM SIZE 20 MM / 120 PX FOR THE TEXTURED EMBLEM', { size: 12, ls: 1.8, fill: mute })}
  ${mono(RX + RW, 1540, 'AL FALAH AL THAHABI KITCHEN', { size: 12, ls: 1.8, fill: mute, anchor: 'end' })}
  </svg>`;
}

const PAGES = [
  { name: 'logo-primary-dark', w: 1600, h: 1600, dsf: 1.5, pdf: 1,
    svg: () => lockupVertical({ id: 'pd', bg: C.ghaf, emb: E.emblem({ gradId: 'g1', gradient: GOLD }), nameFill: 'url(#t1)', enFill: 'url(#t1)', ruleFill: C.gold, defs: grad('t1', TEXT_GOLD, true) }) },
  { name: 'logo-primary-light', w: 1600, h: 1600, dsf: 1.5, pdf: 2,
    svg: () => lockupVertical({ id: 'pl', bg: C.ivory, emb: E.emblem({ gradId: 'g2', gradient: GOLD_ON_LIGHT }), nameFill: C.ghaf, enFill: C.ghaf, ruleFill: C.goldDeep }) },
  { name: 'logo-gold-transparent', w: 1600, h: 1600, dsf: 1.5, transparent: true,
    svg: () => lockupVertical({ id: 'gt', emb: E.emblem({ gradId: 'g3', gradient: GOLD }), nameFill: 'url(#t3)', enFill: 'url(#t3)', ruleFill: C.gold, defs: grad('t3', TEXT_GOLD, true) }) },
  { name: 'logo-light-transparent', w: 1600, h: 1600, dsf: 1.5, transparent: true,
    svg: () => lockupVertical({ id: 'lt', emb: E.emblem({ gradId: 'g4', gradient: GOLD_ON_LIGHT }), nameFill: C.ghaf, enFill: C.ghaf, ruleFill: C.goldDeep }) },
  { name: 'logo-signboard', w: 3400, h: 1000, dsf: 1.25, pdf: 3,
    svg: () => signboard({ bg: C.ghaf, emb: E.emblem({ gradId: 'g5', gradient: GOLD }), nameFill: 'url(#t5)', enFill: 'url(#t5)', ruleFill: C.gold, defs: grad('t5', TEXT_GOLD, true) }) },
  { name: 'emblem-gold', w: 1000, h: 1000, dsf: 2, transparent: true, svg: () => emblemOnly({ W: 1000, H: 1000, emb: E.emblem({ gradId: 'g6', gradient: GOLD }), diameter: 960 }) },
  { name: 'emblem-green', w: 1000, h: 1000, dsf: 2, transparent: true, svg: () => emblemOnly({ W: 1000, H: 1000, emb: E.emblem({ paint: C.ghaf }), diameter: 960 }) },
  { name: 'emblem-white', w: 1000, h: 1000, dsf: 2, transparent: true, svg: () => emblemOnly({ W: 1000, H: 1000, emb: E.emblem({ paint: '#FFFFFF' }), diameter: 960 }) },
  { name: 'social-avatar', w: 1080, h: 1080, dsf: 1, svg: () => emblemOnly({ W: 1080, H: 1080, bg: C.ghaf, emb: E.emblem({ gradId: 'g7', gradient: GOLD }), diameter: 860 }) },
  { name: 'brand-sheet', w: 2400, h: 1600, dsf: 1, pdf: 4, svg: brandSheet },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'logo-'));
  const browser = await chromium.launch();
  const pdfs = [];
  for (const pg of PAGES) {
    const html = head(pg.w, pg.h, pg.transparent) + pg.svg() + LAYOUT_JS + '</body></html>';
    const file = path.join(tmp, pg.name + '.html');
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: pg.w, height: pg.h }, deviceScaleFactor: pg.dsf });
    await page.goto('file://' + file);
    await page.evaluate((d) => window.__layout(d), DEBUG);
    await page.screenshot({ path: path.join(OUT, pg.name + '.png'), omitBackground: !!pg.transparent });
    if (pg.pdf) {
      const p = path.join(tmp, `${pg.pdf}.pdf`);
      await page.pdf({ path: p, preferCSSPageSize: true, printBackground: true });
      pdfs[pg.pdf - 1] = p;
    }
    await page.close();
    console.log('✓', pg.name);
  }
  await browser.close();
  execFileSync('pdfunite', [...pdfs, path.join(OUT, 'al-falah-al-thahabi-kitchen-logo.pdf')]);
  fs.copyFileSync(pdfs[0], path.join(OUT, 'logo-primary-dark.pdf')); // the official logo as its own vector file
  fs.rmSync(tmp, { recursive: true });
  console.log('✓ al-falah-al-thahabi-kitchen-logo.pdf →', OUT);
})();
