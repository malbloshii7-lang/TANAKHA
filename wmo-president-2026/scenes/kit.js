'use strict';
// The film's layout in the 4:5 frame (1080×1350) and its devices: the register along the top, the plate, the words under
// it, and the photographs laid on the plate as prints. Nothing is typed below LAY.SAFE: LinkedIn's controls and captions
// sit over the bottom of a feed video.
const LAY = {
  // the register: one row per mission, as an observer's register is kept. Columns: date, place, WMO Region, local time
  // (the last right-aligned)
  REG: { top: 50, head: 82, row: 128, rule: 152, x: [64, 276, 762, 1016] },
  PLATE: [54, 176, 1026, 900], // the plate's box on the page (972×724); plates draw in their own coordinates, 0..972 × 0..724
  WORDS: { x: 64, kicker: 948, head: 1016, body: 1068, lh: 42, maxW: 952 }, // sized for a phone: kicker 25, head 64, body 36 px
  SAFE: 1147,
};
const PW = LAY.PLATE[2] - LAY.PLATE[0], PH = LAY.PLATE[3] - LAY.PLATE[1];
const F_SERIF = '"EB Garamond"', F_SC = '"Cormorant SC"';
const QS = new URLSearchParams(location.search);
const SLOTS = QS.has('slots'); // ?slots: show where each photograph will sit, before the photographs arrive

// images (the office's photographs): start.js waits for every one before the first frame
const ASSETS = [];
function loadImg(src) {
  const img = new Image(), o = { img, ok: false };
  ASSETS.push(new Promise(res => { img.onload = () => { o.ok = true; res(); }; img.onerror = () => res(); }));
  img.src = src;
  return o;
}

// draw fn in the plate's own coordinates, clipped to the plate
function plate(fn) {
  ctx.save(); ctx.translate(LAY.PLATE[0], LAY.PLATE[1]);
  ctx.beginPath(); ctx.rect(0, 0, PW, PH); ctx.clip();
  try { fn(); } finally { ctx.restore(); }
}
// the plate's border: a fine double rule, as a printed plate's platemark
function plateFrame(p = 1) {
  if (p <= 0) return;
  const [x0, y0, x1, y1] = LAY.PLATE;
  stroke(boxP(x0, y0, x1, y1), p, INK, 1.6, 0.8);
  stroke(boxP(x0 - 7, y0 - 7, x1 + 7, y1 + 7), p, INK, 0.8, 0.45);
}

// ---- the register ----
const REG_HEAD = ['DATE', 'PLACE', 'REGION', 'LOCAL TIME'];
// the ruled band at the top of every page: the same on every scene, so it never dissolves
function registerRules(p = 1) {
  const R = LAY.REG;
  stroke(ln(54, R.top, 1026, R.top, 401, 0), p, INK, 1.2, 0.7);
  stroke(ln(54, R.rule, 1026, R.rule, 402, 0), p, INK, 1.4, 0.75);
  stroke(ln(54, R.rule + 5, 1026, R.rule + 5, 403, 0), p, INK, 0.7, 0.5);
  [R.x[1] - 18, R.x[2] - 18, 842].forEach((x, i) => stroke(ln(x, R.top + 8, x, R.rule - 8, 404 + i, 0), p, INK, 0.7, 0.35));
  REG_HEAD.forEach((h, i) => small(h, R.x[i], R.head, p, { size: 13, ls: 4, a: 0.55, weight: 600, align: i === 3 ? 'right' : 'left' }));
}
// one row, written in as the observer writes it (left to right, column by column), and taken out before the cut
function registerRow(row, lt, s, { t0 = 0.5, cps = 30 } = {}) {
  const R = LAY.REG, out = wordsOut(s, 0.3);
  let t = t0;
  row.forEach((cell, i) => {
    if (!cell) return;
    const size = cell.length > 26 ? 19 : i === 0 && cell.length > 9 ? 21 : cell.length > 9 ? 22 : 26, s0 = SA;
    SA = s0 * out; // typeLine sets its own alpha from SA
    try { typeLine(cell, R.x[i], R.row, t, lt, { size, ls: size > 20 ? 3 : size > 18 ? 2 : 1.5, a: 0.9, weight: 600, align: i === 3 ? 'right' : 'left', cps }); } finally { SA = s0; }
    t += cell.length / cps + 0.12;
  });
}

// ---- the words under the plate ----
// lines wrapped to the column; a block that needs more lines than it is allowed throws, so no line is ever lost
function wrapText(text, font, maxW, ls = 0) {
  const words = text.split(' '), lines = [];
  let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && textWidth(t, font, ls) > maxW) { lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur);
  return lines;
}
// one set of words: a kicker (place and date), a headline, and up to two lines. tin/tout in the scene's seconds; ar: the
// Arabic of each part for the SRT (the screen is English, the Arabic travels as subtitles)
function wordSet(s, lt, { tin, tout, kicker, head, body, ar = {}, maxLines = 2, headSize = 64, bodySize = 36 }) {
  const Wd = LAY.WORDS, f0 = s.start;
  recText('K', f0 + tin, f0 + tout, ar.kicker, kicker);
  recText('A', f0 + tin, f0 + tout, ar.head, head);
  if (body) recText('B', f0 + tin, f0 + tout, ar.body, body);
  const q = t => easeOut(prog(lt, t, 0.6)) * clamp((tout - lt) / 0.35) * wordsOut(s);
  small(kicker, Wd.x, Wd.kicker, q(tin), { size: 25, ls: 3, a: 0.78, weight: 600 });
  let hs = headSize;
  const hw = textWidth(head, `700 ${hs}px ${F_HEAD}`, 1);
  if (hw > Wd.maxW) hs = Math.floor(hs * Wd.maxW / hw);
  const qh = q(tin + 0.25);
  if (qh > 0) blurIn(off => { setText(`700 ${hs}px ${F_HEAD}`, 1, 'ltr', 'left'); ctx.fillStyle = INK; ctx.fillText(head, Wd.x + off * 0.4, Wd.head); }, qh, 8, 12);
  if (!body) return;
  const bf = `500 ${bodySize}px ${F_SERIF}`, lines = wrapText(body, bf, Wd.maxW);
  if (lines.length > maxLines) throw new Error(`${s.id}: "${body.slice(0, 40)}…" needs ${lines.length} lines (max ${maxLines})`);
  lines.forEach((l, i) => {
    const y = Wd.body + i * Wd.lh;
    if (y > LAY.SAFE) throw new Error(`${s.id}: a line falls below the safe line`);
    const ql = q(tin + 0.55 + i * 0.12);
    if (ql <= 0) return;
    ctx.save(); setText(bf, 0, 'ltr', 'left'); ctx.globalAlpha = SA * 0.86 * ql; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
    ctx.fillText(l, Wd.x, y); ctx.restore();
  });
}

// a host's name set large on the Region V chart beside its city, on a paper patch so the isobars never cut it
function hostLabel(text, x, y, p) {
  if (p <= 0) return;
  const f = `700 30px ${F_HEAD}`;
  wordPatch([inkBox(text, x, y, f, 1, 'ltr', 'center', 0, 9)], p);
  blurIn(off => { setText(f, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText(text, x, y + off * 0.2); }, p, 5, 6);
}

// ---- photographs, laid on the plate as prints (unused: the requester chose a film without photographs) ----
// the office's own photographs (photos/<name>.jpg): shown as they are, toned a little toward the paper, cropped to the
// print, never altered beyond tone and crop. A print whose photograph has not arrived is left out (with ?slots, its
// place is marked).
const PHOTOS = {};
function photo(name) { return PHOTOS[name] || (PHOTOS[name] = loadImg('photos/' + name + '.jpg')); }
function deckle(w, h, seed) { // a print's torn-edge outline, centred on 0, 0
  const r = rng(seed), pts = [], step = 9;
  const side = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L / step); for (let k = 0; k < n; k++) { const u = k / n, j = (r() - 0.5) * 2.2; pts.push([lerp(x0, x1, u) + (y1 - y0) / L * j, lerp(y0, y1, u) - (x1 - x0) / L * j]); } };
  side(-w / 2, -h / 2, w / 2, -h / 2); side(w / 2, -h / 2, w / 2, h / 2); side(w / 2, h / 2, -w / 2, h / 2); side(-w / 2, h / 2, -w / 2, -h / 2);
  return new P(pts, true);
}
// cx, cy, w, h on the page; rot in radians; p: how far it has been laid down (0..1); caption: what it shows (for ?slots,
// and the credit line under it)
function print(name, cx, cy, w, h, rot, p, caption, { seed = 7, focus = [0.5, 0.42] } = {}) {
  if (p <= 0) return;
  const ph = photo(name);
  if (!ph.ok && !SLOTS) return;
  const q = easeOut(p), m = 16, s = lerp(1.04, 1, q);
  ctx.save(); ctx.translate(cx, cy + (1 - q) * 14); ctx.rotate(rot); ctx.scale(s, s);
  // its shadow on the plate, then the paper of the print with its deckled edge
  ctx.save(); ctx.globalAlpha = SA * 0.28 * q; ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${(7 * SCALE).toFixed(1)}px)`;
  ctx.fillStyle = '#5A4630'; ctx.fillRect(-w / 2 - m + 6, -h / 2 - m + 9, w + 2 * m, h + 2 * m); ctx.restore();
  const edge = deckle(w + 2 * m, h + 2 * m, seed);
  ctx.save(); ctx.globalAlpha = SA * q; ctx.fillStyle = '#F3EBDA'; ctx.beginPath(); edge.trace(ctx, 1); ctx.fill(); ctx.restore();
  stroke(edge, 1, INK, 0.6, 0.25 * q);
  if (ph.ok) {
    const iw = ph.img.naturalWidth, ih = ph.img.naturalHeight, k = Math.max(w / iw, h / ih), sw = w / k, sh = h / k;
    const sx = clamp(iw * focus[0] - sw / 2, 0, iw - sw), sy = clamp(ih * focus[1] - sh / 2, 0, ih - sh);
    ctx.save(); ctx.globalAlpha = SA * q; ctx.filter = 'sepia(0.16) saturate(0.92) contrast(1.02)';
    ctx.drawImage(ph.img, sx, sy, sw, sh, -w / 2, -h / 2, w, h); ctx.restore();
  } else {
    ctx.save(); ctx.globalAlpha = SA * q * 0.5; ctx.strokeStyle = INK; ctx.setLineDash([7, 6]); ctx.lineWidth = 1.2; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore();
    small('PHOTOGRAPH TO COME', 0, -8, q, { size: 15, ls: 4, a: 0.6, align: 'center', weight: 600 });
    const cap = caption.toUpperCase(), cs = Math.min(12, 12 * (w - 24) / Math.max(1, textWidth(cap, `500 12px ${F_MONO}`, 2)));
    small(cap, 0, 20, q, { size: cs, ls: 2, a: 0.5, align: 'center' });
  }
  ctx.restore();
}
