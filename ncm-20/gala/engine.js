'use strict';
/* ==========================================================================
   Reading the Sky — the gala edition of the film for NCM's 20th anniversary.
   Everything is a pure function of time: render(t) draws frame t, so the same
   code plays live in a browser and renders frame-exact for the MP4
   (see render.js). Open with ?capture to expose window.__render for capture,
   ?t=SECONDS to jump, ?scale=2 for a 3840×2160 canvas.
   The engine is this file; each scene lives in scenes/ and registers itself
   with scene({...}); start.js boots the film once every scene has loaded.
   ========================================================================== */
const W = 1920, H = 1080, TAU = Math.PI * 2;
const SCALE = Number(new URLSearchParams(location.search).get('scale')) || 1; // 2 → a 4K canvas
// ?grade=led: the LED-wall grade for a dark hall. Parchment at about two-thirds of the web grade's luminance
// with a deeper vignette, so the page does not glare into the front rows. A starting point for calibration.
const GRADE = new URLSearchParams(location.search).get('grade') || 'web';
const OPT = (q => ({ vo: q.has('vo'), tc: q.has('tc'), fadeout: Number(q.get('fadeout') || 0) }))(new URLSearchParams(location.search));
// Two themes: ink on parchment by day; light on a dark sky by night. Helpers read these at call time.
const DAY = { INK: '#1D1813', RED: '#B3391D', BLUE: '#28478C', OCHRE: '#C9973B', SEPIA: '#6E6253', BLEND: 'multiply' };
const NIGHT = { INK: '#F1E4C8', RED: '#F08A63', BLUE: '#9DB9EE', OCHRE: '#F3C862', SEPIA: '#B9AC98', BLEND: 'screen' };
let INK = DAY.INK, RED = DAY.RED, BLUE = DAY.BLUE, OCHRE = DAY.OCHRE, SEPIA = DAY.SEPIA, BLEND = DAY.BLEND, IS_NIGHT = false;
const GOLD = '#C9973B';
const cv = document.getElementById('film');
cv.width = W * SCALE; cv.height = H * SCALE;
let ctx = cv.getContext('2d'); // helpers draw on ctx; during a crossfade it points at LAYER
const MAIN = ctx;
let LAYER_CV, LAYER;
let SA = 1; // opacity multiplier for scene drawing (1 in normal use; crossfades composite a whole layer instead)
let REAL_LT = 0; // unscaled local time of the scene being drawn (labels switch on real cuts)

/* ---------- maths & motion ---------- */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const prog = (t, start, dur) => clamp((t - start) / dur);
function rng(seed) {
  let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function wobble(seed, amp) {
  const r = rng(seed), p1 = r() * TAU, p2 = r() * TAU, p3 = r() * TAU;
  const f1 = 0.012 + r() * 0.006, f2 = 0.03 + r() * 0.01, f3 = 0.07 + r() * 0.02;
  return s => amp * (Math.sin(s * f1 + p1) * 0.55 + Math.sin(s * f2 + p2) * 0.3 + Math.sin(s * f3 + p3) * 0.15);
}

/* ---------- paths: hand-inked polylines that can be drawn on ---------- */
class P {
  constructor(pts, closed = false) {
    this.pts = pts; this.closed = closed;
    const L = [0]; let acc = 0;
    for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(acc); }
    this.open = acc;
    if (closed && pts.length > 1) acc += Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
    this.L = L; this.total = acc;
  }
  trace(c, p = 1) {
    const pts = this.pts, n = pts.length;
    if (p <= 0 || n < 2) return;
    const target = this.total * Math.min(1, p);
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) {
      if (this.L[i] <= target) { c.lineTo(pts[i][0], pts[i][1]); continue; }
      const f = (target - this.L[i - 1]) / (this.L[i] - this.L[i - 1] || 1);
      c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f));
      return;
    }
    if (!this.closed) return;
    if (p >= 1) { c.closePath(); return; }
    const last = pts[n - 1], f = (target - this.open) / (this.total - this.open || 1);
    c.lineTo(lerp(last[0], pts[0][0], f), lerp(last[1], pts[0][1], f));
  }
  at(p) { // point at fraction p of length
    const target = this.total * clamp(p), pts = this.pts;
    for (let i = 1; i < pts.length; i++) if (this.L[i] >= target) {
      const f = (target - this.L[i - 1]) / (this.L[i] - this.L[i - 1] || 1);
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    }
    return pts[pts.length - 1];
  }
}
function wob(pts, seed, amp) { // subdivide a polyline and add a hand-drawn tremor
  if (!amp) return pts;
  const w = wobble(seed, amp), out = [];
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], L = Math.hypot(x2 - x1, y2 - y1) || 1;
    const n = Math.max(1, Math.ceil(L / 9)), nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    for (let k = 0; k < n; k++) { const t = k / n, o = w(s + t * L); out.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]); }
    s += L;
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const ln = (x1, y1, x2, y2, seed = 1, amp = 0.9) => new P(wob([[x1, y1], [x2, y2]], seed, amp));
const pl = (pts, closed = false, seed = 1, amp = 0.7) => new P(wob(closed ? pts.concat([pts[0]]) : pts, seed, amp).slice(0, closed ? -1 : undefined), closed);
function el(cx, cy, rx, ry, a0 = 0, a1 = TAU, seed = 1, amp = 0.9, rot = 0) {
  const span = a1 - a0, L = Math.abs(span) * (rx + ry) / 2, n = Math.max(12, Math.ceil(L / 7));
  const w = wobble(seed, amp), cr = Math.cos(rot), sr = Math.sin(rot), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + span * t, o = w(t * L), x = (rx + o) * Math.cos(a), y = (ry + o * ry / rx) * Math.sin(a);
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  const closed = Math.abs(span) >= TAU - 1e-6;
  if (closed) pts.pop();
  return new P(pts, closed);
}
function quad(p0, c, p1, n = 16) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]); }
  return pts;
}
function cubic(p0, c1, c2, p1, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]]);
  }
  return pts;
}
function yOn(pts, x) { // y of a polyline sampled left to right, at x (clamped to its ends)
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const f = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0] || 1); return lerp(pts[i - 1][1], pts[i][1], f); }
  return pts[pts.length - 1][1];
}
function starP(cx, cy, r1, r2, n, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return new P(pts, true);
}

/* ---------- ink on paper ---------- */
function stroke(path, p = 1, col = INK, lw = 2, a = 0.92, dash = null, dashOff = 0) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND;
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = dashOff; }
  ctx.beginPath(); path.trace(ctx, p); ctx.stroke();
  ctx.restore();
}
function fill(path, col, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col;
  ctx.beginPath(); path.trace(ctx, 1); ctx.fill();
  ctx.restore();
}
let PAPER_CV, PAPER_PAT, SPECKLE_CV, NIGHT_CV, DAY_PAT, NIGHT_PAT;
function setTheme(night) {
  ({ INK, RED, BLUE, OCHRE, SEPIA, BLEND } = night ? NIGHT : DAY);
  IS_NIGHT = !!night; PAPER_PAT = night ? NIGHT_PAT : DAY_PAT;
}
function mask(paths) { // repaint paper over paths (hides lines behind a shape)
  ctx.save();
  PAPER_PAT.setTransform(ctx.getTransform().inverse());
  ctx.globalAlpha = SA; ctx.fillStyle = PAPER_PAT;
  ctx.beginPath(); (Array.isArray(paths) ? paths : [paths]).forEach(q => q.trace(ctx, 1)); ctx.fill();
  ctx.restore();
}
function hatch(clip, box, ang, gap, p, col = INK, lw = 1, a = 0.35, seed = 3) {
  if (p <= 0) return;
  const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, n = Math.floor((2 * R) / gap), shown = Math.floor(n * p), r = rng(seed);
  ctx.save();
  ctx.beginPath(); (Array.isArray(clip) ? clip : [clip]).forEach(q => q.trace(ctx, 1)); ctx.clip();
  ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < shown; i++) {
    const o = -R + i * gap + (r() - 0.5) * gap * 0.3, px = cx + nx * o, py = cy + ny * o, j = (r() - 0.5) * R * 0.08;
    ctx.moveTo(px - dx * (R + j), py - dy * (R + j)); ctx.lineTo(px + dx * (R - j), py + dy * (R - j));
  }
  ctx.stroke(); ctx.restore();
}
function disc(x, y, r, col, a = 1, mode = BLEND) {
  if (a <= 0 || r <= 0) return;
  ctx.save(); ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = mode; ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}
function arrowHead(x, y, ang, size, col, a = 0.92, lw = 2) {
  stroke(new P([[x - size * Math.cos(ang - 0.45), y - size * Math.sin(ang - 0.45)], [x, y], [x - size * Math.cos(ang + 0.45), y - size * Math.sin(ang + 0.45)]]), 1, col, lw, a);
}

/* ---------- type ---------- */
const F_HEAD = 'Cinzel', F_MONO = '"IBM Plex Mono"', F_AR = '"Reem Kufi"', F_RUQ = '"Aref Ruqaa"', F_FELL = '"IM Fell English"';
let HEAD_SIZE = 96;
function setText(font, ls = 0, dir = 'ltr', align = 'left') {
  ctx.font = font; ctx.letterSpacing = ls + 'px'; ctx.direction = dir; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
}
function typeLine(text, x, y, t0, lt, { size = 20, ls = 7, a = 0.85, weight = 500, align = 'left', cps = 58, col = INK } = {}) {
  const n = Math.floor(clamp((lt - t0) * cps, 0, text.length));
  if (n <= 0) return;
  ctx.save();
  setText(`${weight} ${size}px ${F_MONO}`, ls);
  let sx = x;
  if (align === 'center') sx = x - ctx.measureText(text).width / 2;
  if (align === 'right') sx = x - ctx.measureText(text).width;
  ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col;
  ctx.fillText(text.slice(0, n), sx, y);
  ctx.restore();
}
function blurIn(draw, p, maxBlur = 14, dx = 26) {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = SA * p; ctx.globalCompositeOperation = BLEND;
  const b = (1 - p) * maxBlur;
  if (b > 0.25) ctx.filter = `blur(${(b * SCALE).toFixed(2)}px)`; // filter lengths are in canvas pixels
  draw((1 - p) * dx);
  ctx.restore();
}
// Big inscriptional headline, revealed word by word (blur to sharp).
function headline(lines, accent, x, top, t0, lt, { size = HEAD_SIZE, align = 'left', step = 0.14 } = {}) {
  setText(`900 ${size}px ${F_HEAD}`, 1);
  let wi = 0, y = top + size * 0.88;
  for (const line of lines) {
    const words = line.split(' '), sp = ctx.measureText(' ').width;
    const widths = words.map(w => ctx.measureText(w).width);
    let wx = align === 'center' ? x - (widths.reduce((s, v) => s + v, 0) + sp * (words.length - 1)) / 2 : x;
    words.forEach((w, i) => {
      const p = easeOut(prog(lt, t0 + wi * step, 0.8));
      blurIn(off => { setText(`900 ${size}px ${F_HEAD}`, 1); ctx.fillStyle = accent[w] || INK; ctx.fillText(w, wx + off, y); }, p);
      wx += widths[i] + sp; wi++;
    });
    y += size * 1.06;
  }
  return { bottom: y - size * 1.06, words: wi };
}
function arabic(text, x, y, t0, lt, { size = 58, align = 'left', a = 0.9, font = F_AR, weight = 700 } = {}) {
  const p = easeOut(prog(lt, t0, 0.9));
  if (p <= 0) return;
  const b = (1 - p) * 12, off = (1 - p) * 18;
  inkText(() => {
    if (b > 0.25) ctx.filter = `blur(${(b * SCALE).toFixed(2)}px)`;
    setText(`${weight} ${size}px ${font}`, 0, 'rtl', align);
    ctx.wordSpacing = '6px'; ctx.fillStyle = INK; ctx.fillText(text, x + (align === 'left' ? off : -off), y);
  }, a * p);
}
function note(text, x, y, t0, lt, { ar = false, size, a = 0.34, align = 'right' } = {}) {
  const p = prog(lt, t0, 1.4);
  if (p <= 0) return;
  if (ar) { inkText(() => { setText(`400 ${size || 30}px ${F_RUQ}`, 0, 'rtl', align); ctx.fillStyle = INK; ctx.fillText(text, x, y); }, p * a); return; }
  ctx.save();
  if (ar) setText(`400 ${size || 30}px ${F_RUQ}`, 0, 'rtl', align);
  else setText(`italic 400 ${size || 25}px ${F_FELL}`, 0, 'ltr', align);
  ctx.globalAlpha = SA * p * a; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
  ctx.fillText(text, x, y);
  ctx.restore();
}
// Paper patch behind a small label so engraved lines don't cut through it.
function back(text, x, y, align, p, size = 14, ls = 3) {
  if (p <= 0) return;
  ctx.save();
  setText(`600 ${size}px ${F_MONO}`, ls, 'ltr', 'left');
  const w = ctx.measureText(text).width, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  PAPER_PAT.setTransform(ctx.getTransform().inverse());
  ctx.globalAlpha = SA * p * 0.92; ctx.fillStyle = PAPER_PAT; ctx.fillRect(x0 - 7, y - size - 3, w + 12, size + 10);
  ctx.restore();
}
function small(text, x, y, p, { size = 15, ls = 4, a = 0.8, align = 'left', col = INK, weight = 500, font = F_MONO } = {}) {
  if (p <= 0) return;
  ctx.save();
  setText(`${weight} ${size}px ${font}`, ls, 'ltr', align);
  ctx.globalAlpha = SA * a * p; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col;
  ctx.fillText(text, x, y);
  ctx.restore();
}
function smallAr(text, x, y, p, { size = 22, a = 0.8, align = 'left', weight = 500, font = F_KUFI, col = null } = {}) {
  if (p <= 0) return;
  inkText(() => { setText(`${weight} ${size}px ${font}`, 0, 'rtl', align); ctx.fillStyle = col || INK; ctx.fillText(text, x, y); }, a * p);
}

/* ---------- chapter chrome: label (top left), readout (top right) ---------- */
function chrome(s, lt) {
  // Labels switch at the cut: the old one is gone just before the new one appears.
  const rl = REAL_LT, vis = clamp(rl / 0.2) * clamp((s.dur - rl) / 0.2);
  const p = easeOut(prog(lt, 0, 0.8)) * vis;
  const name = (s.num ? s.num + ' · ' : '') + s.name;
  small(name, 78, 72, p, { size: 18, ls: 7, a: 0.82 });
  setText(`500 18px ${F_MONO}`, 7);
  smallAr(s.ar, 78 + ctx.measureText(name).width + 18, 74, p, { size: 23, a: 0.72 });
  typeLine(s.readout, W - 78, 104, 0.2, lt, { size: 13, ls: 4, a: 0.5 * vis, align: 'right', cps: 60 });
}
// Left column: mono kicker, inscriptional headline, Arabic line.
function textBlock(s, lt) {
  const x = 110, ky = 338;
  typeLine(s.kicker, x, ky, 0.25, lt, { size: 18, ls: 6, a: 0.8 });
  const hb = headline(s.head, s.accent, x, ky + 30, 0.55, lt);
  arabic(s.arHead, x, hb.bottom + 92, 0.55 + hb.words * 0.14 + 0.1, lt, { size: 56 });
}

/* ---------- scenes ---------- */
const SCENES = [];
const SCENE_DEFS = new Map(); // every scene definition by id, even ones the timeline leaves out (for borrowing geometry)
const scene = s => SCENES.push(s);


/* ---------- Arabic-first type: the ministers' language leads, English follows ---------- */
// Joined Arabic letters overlap at every join; drawn straight onto the page under multiply or partial
// alpha, each overlap doubles up and leaves a seam. So text is set opaque on a scratch sheet first and
// laid on the page in one pass.
let TXT_CV, TXT;
function inkText(draw, alpha, mode = BLEND) {
  if (alpha <= 0) return;
  const page = ctx;
  TXT.setTransform(1, 0, 0, 1, 0, 0); TXT.clearRect(0, 0, TXT_CV.width, TXT_CV.height);
  TXT.save(); TXT.setTransform(page.getTransform()); TXT.globalAlpha = 1; TXT.globalCompositeOperation = 'source-over'; TXT.filter = 'none';
  ctx = TXT; try { draw(); } finally { ctx = page; TXT.restore(); }
  page.save(); page.setTransform(1, 0, 0, 1, 0, 0); page.globalAlpha = SA * alpha; page.globalCompositeOperation = mode; page.filter = 'none';
  page.drawImage(TXT_CV, 0, 0); page.restore();
}
const F_NASKH = '"Amiri"', F_KUFI = '"Noto Kufi Arabic"';
// Isolate a left-to-right run (years, ranges, Latin) inside Arabic text, so the bidi algorithm cannot
// reorder it: "2007–2027" in a right-to-left line would otherwise display as "2027–2007".
const ltr = s => '\u2066' + s + '\u2069';
function textWidth(text, font, ls = 0, dir = 'ltr', ws = 0) { ctx.save(); setText(font, ls, dir); ctx.wordSpacing = ws + 'px'; const w = ctx.measureText(text).width; ctx.restore(); return w; }
// An Arabic line revealed the way it is read, right to left, behind a soft feathered edge.
function arLine(text, x, y, t0, lt, { size = 84, align = 'right', a = 0.94, font = F_KUFI, weight = 700, col = null, dur = 1.2, out = 1 } = {}) {
  const p = easeInOut(prog(lt, t0, dur));
  if (p <= 0 || out <= 0) return;
  const ws = Math.round(size * 0.1), f = `${weight} ${size}px ${font}`, w = textWidth(text, f, 0, 'rtl', ws);
  const xr = align === 'right' ? x : align === 'center' ? x + w / 2 : x + w, feather = Math.min(90, w * 0.25);
  const edge = xr - (w + feather) * p; // everything right of the edge is revealed
  const pass = (x0, x1, al) => {
    if (x1 <= x0) return;
    inkText(() => {
      ctx.beginPath(); ctx.rect(x0, y - size * 1.6, x1 - x0, size * 2.4); ctx.clip();
      setText(f, 0, 'rtl', align); ctx.wordSpacing = ws + 'px';
      ctx.fillStyle = col || INK; ctx.fillText(text, x, y);
    }, a * al * out);
  };
  pass(edge + feather, xr + 40, 1);
  for (let k = 0; k < 4; k++) pass(edge + (feather * k) / 4, edge + (feather * (k + 1)) / 4, (k + 0.5) / 4);
}
// The English line: inscriptional capitals that settle in from a slight blur.
function enLine(text, x, y, t0, lt, { size = 38, align = 'right', a = 0.86, font = F_HEAD, weight = 700, ls = 2, col = null, out = 1, italic = false } = {}) {
  const p = easeOut(prog(lt, t0, 0.9)) * out;
  if (p <= 0) return;
  blurIn(off => { setText(`${italic ? 'italic ' : ''}${weight} ${size}px ${font}`, ls, 'ltr', align); ctx.fillStyle = col || INK; ctx.globalAlpha *= a; ctx.fillText(text, x, y + off * 0.25); }, p, 8, 10);
}
// Fades a scene's words out just before its cut, so two scenes' words never overlap in a dissolve.
// Words leave before the next scene starts to show (half its dissolve before the cut) and arrive only
// once their own scene's dissolve has finished.
const wordsOut = (s, pad = 0.35) => clamp((s.dur - (s.nextXf || 0) / 2 - REAL_LT) / pad) * clamp((REAL_LT - (s.xf ?? XF) / 2) / 0.15 + 1);
const wordsIn = (s, t0) => Math.max(t0, ((s.xf ?? XF) / 2 + 0.15) * (s.speed || 1));
// The standard words block (right column, right-aligned): a small bilingual kicker, the Arabic
// headline, then the English. s.text = { kAr, kEn, ar: [lines], en: [lines], x, top, arSize, enSize, t0 }
function wordsBlock(s, lt) {
  const T = s.text; if (!T) return;
  const x = T.x ?? 1812, align = T.align ?? 'right', out = wordsOut(s), t0 = wordsIn(s, T.t0 ?? 0.35);
  // fit the column: the widest line sets the size (the art takes the left of the frame)
  const maxW = T.maxW ?? 780;
  let arSize = T.arSize ?? 82, enSize = T.enSize ?? 36;
  const wA = Math.max(1, ...(T.ar || []).map(l => textWidth(l, `700 ${arSize}px ${F_KUFI}`, 0, 'rtl', Math.round(arSize * 0.1))));
  const wE = Math.max(1, ...(T.en || []).map(l => textWidth(l, `700 ${enSize}px ${F_HEAD}`, 2)));
  if (wA > maxW) arSize = Math.floor(arSize * maxW / wA);
  if (wE > maxW) enSize = Math.floor(enSize * maxW / wE);
  let y = T.top ?? 330;
  // kickers: the place, date or source line, sized to be read from the back of a hall (≥30 px Arabic)
  if (T.kAr) { smallAr(T.kAr, x, y, easeOut(prog(lt, t0, 0.8)) * out, { size: 30, align, a: 0.8 }); y += 36; }
  if (T.kEn) { small(T.kEn, x, y, easeOut(prog(lt, t0 + 0.15, 0.8)) * out, { size: 16, ls: 4, align, a: 0.66, weight: 600 }); y += 28; }
  y += arSize * 0.95;
  (T.ar || []).forEach((l, i) => { arLine(l, x, y, t0 + 0.35 + i * 0.45, lt, { size: arSize, align, out, col: T.arCol && T.arCol[i] }); y += arSize * 1.32; });
  y += enSize * 0.35 - arSize * 0.2;
  const tE = t0 + 0.55 + (T.ar || []).length * 0.45;
  (T.en || []).forEach((l, i) => { enLine(l, x, y, tE + i * 0.18, lt, { size: enSize, align, out, col: T.enCol && T.enCol[i] }); y += enSize * 1.22; });
  return y;
}
// Film-time text (the treatment's §7 gives every line an in and out time in film seconds).
// Level A echoes the narrator (large); Level B is a label (place, date, source). Both are right-aligned in the
// words column by default. f is the film time; lines may be arrays.
const textIn = (f, tin, tout, fi = 0.5, fo = 0.35) => easeOut(prog(f, tin, fi)) * clamp((tout - f) / fo);
// Every words block can be recorded with its film times (TEXT_REC), so the subtitle files come from the build itself.
let TEXT_REC = null;
const recText = (level, tin, tout, ar, en) => { if (TEXT_REC) TEXT_REC.push({ level, tin, tout, ar: [].concat(ar || []), en: [].concat(en || []) }); };
function levelB(f, tin, tout, ar, en, { x = 1840, y = 300, align = 'right', arSize = 32, enSize = 20, gap = Math.ceil(arSize * 0.48 + enSize * 0.72) + 6 } = {}) {
  recText('B', tin, tout, ar, en);
  const q = textIn(f, tin, tout), q2 = textIn(f, tin + 0.15, tout);
  const A = [].concat(ar || []), E = [].concat(en || []);
  A.forEach((l, i) => smallAr(l, x, y + i * arSize * 1.32, q, { size: arSize, align, a: 0.85, weight: 600 }));
  let ye = y + (A.length - 1) * arSize * 1.32 + gap;
  E.forEach((l, i) => small(l, x, ye + i * enSize * 1.5, q2, { size: enSize, ls: 2, align, a: 0.7, weight: 600 }));
  return ye + (E.length - 1) * enSize * 1.5;
}
function levelA(f, tin, tout, ar, en, { x = 1840, y = 520, align = 'right', arSize = 84, enSize = 34, font = F_KUFI } = {}) {
  recText('A', tin, tout, ar, en);
  const out = clamp((tout - f) / 0.35), A = [].concat(ar || []), E = [].concat(en || []);
  A.forEach((l, i) => arLine(l, x, y + i * arSize * 1.3, tin + i * 0.3, f, { size: arSize, align, out, font }));
  let ye = y + (A.length - 1) * arSize * 1.3 + enSize * 1.25 + arSize * 0.22;
  E.forEach((l, i) => enLine(l, x, ye + i * enSize * 1.25, tin + 0.3 + A.length * 0.3 + i * 0.15, f, { size: enSize, align, out }));
  return ye + (E.length - 1) * enSize * 1.25;
}
// The film's ornament is a compass star (long points on the cardinals, short on the diagonals): the navigator's star.
// Never a blunt eight-pointed star, whose outline is two overlapping squares, the Quran's hizb marker.
function compassStar(x, y, r) {
  const pts = [];
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, k = i % 2 ? 0.3 : (i % 4 ? 0.6 : 1); pts.push([x + r * k * Math.cos(a), y + r * k * Math.sin(a)]); }
  return new P(pts, true);
}
function ornament(x, y, r, p, col = null, a = 0.9) {
  if (p <= 0) return;
  const q = easeOut(p), s = compassStar(x, y, r * 1.25 * q);
  fill(s, col || GOLD, a);
  stroke(s, 1, INK, 1, 0.6);
}
function ruleWithStar(cx, y, half, p, a = 0.7) {
  if (p <= 0) return;
  const q = easeInOut(p);
  stroke(new P([[cx - 22, y], [cx - 22 - half * q, y]]), 1, INK, 1.2, a);
  stroke(new P([[cx + 22, y], [cx + 22 + half * q, y]]), 1, INK, 1.2, a);
  ornament(cx, y, 11, p);
}
// A leadership card, set centred: Arabic first, the English under it, then the credit. q = { ar, en, whoAr?, titleAr?,
// whatAr, whoEn?, titleEn?, whatEn, kickerAr?, kickerEn?, reported? } — every field exactly as verified. A `reported`
// card carries the agency's reported speech: no quotation marks, and the English is set upright, not as a quotation.
function quoteCard(q, s, lt, { cy = 480, arSize = 54, enSize = 27, t0 = 0.3 } = {}) {
  const out = wordsOut(s, 0.5), cx = W / 2;
  t0 = wordsIn(s, t0);
  const nA = q.ar.length, nE = q.en.length;
  if (TEXT_REC) recText('card', s.start + t0, s.start + s.dur - 0.5, [q.kickerAr, ...q.ar, q.whoAr, q.titleAr, q.whatAr].filter(Boolean), [q.kickerEn, ...q.en, q.whoEn, q.titleEn, q.whatEn].filter(Boolean));
  const credit = (q.whoAr ? 40 : 0) + (q.titleAr ? 36 : 0) + 38 + (q.whoEn ? 28 : 0) + (q.titleEn ? 26 : 0) + 24;
  const blockH = 34 + nA * arSize * 1.55 + 10 + nE * enSize * 1.5 + 30 + credit + 40;
  let y = cy - blockH / 2;
  if (q.kickerAr) {
    const kq = easeOut(prog(lt, t0, 0.8)) * out;
    smallAr(q.kickerAr, cx, y - 58, kq, { size: 30, align: 'center', a: 0.78 });
    small(q.kickerEn, cx, y - 26, kq, { size: 16, ls: 4, align: 'center', a: 0.6, weight: 600 });
  }
  ruleWithStar(cx, y, 230, prog(lt, t0, 1.0) * out);
  y += 34 + arSize;
  q.ar.forEach((l, i) => { arLine(l, cx, y, t0 + 0.4 + i * 0.7, lt, { size: arSize, align: 'center', font: F_NASKH, weight: 700, out, dur: 1.5 }); y += arSize * 1.55; });
  y += 10 - arSize * 0.35;
  const tE = t0 + 0.9 + nA * 0.7;
  q.en.forEach((l, i) => { enLine(l, cx, y, tE + i * 0.2, lt, { size: enSize, align: 'center', font: F_FELL, weight: 400, ls: 0, italic: !q.reported && !q.upright, a: 0.82, out }); y += enSize * 1.5; });
  y += 30;
  const tC = tE + 0.5 + nE * 0.2, c = k => easeOut(prog(lt, tC + k * 0.15, 0.8)) * out;
  if (q.whoAr) { smallAr(q.whoAr, cx, y, c(0), { size: 30, align: 'center', a: 0.9, weight: 700 }); y += 40; }
  if (q.titleAr) { smallAr(q.titleAr, cx, y, c(1), { size: 26, align: 'center', a: 0.76 }); y += 36; }
  smallAr(q.whatAr, cx, y, c(2), { size: 26, align: 'center', a: 0.7 }); y += 38;
  if (q.whoEn) { small(q.whoEn, cx, y, c(3), { size: 18, ls: 3, align: 'center', a: 0.76, weight: 600 }); y += 28; }
  if (q.titleEn) { small(q.titleEn, cx, y, c(4), { size: 15, ls: 2, align: 'center', a: 0.62, weight: 600 }); y += 26; }
  small(q.whatEn, cx, y, c(5), { size: 15, ls: 2, align: 'center', a: 0.6, weight: 600 });
  ruleWithStar(cx, y + 34, 230, prog(lt, tC + 0.6, 1.0) * out);
}

/* ---------- camera: art point (px, py) sits at screen (sx, sy), magnified s times ---------- */
function camera(c) { ctx.translate(c.sx, c.sy); ctx.scale(c.s, c.s); ctx.translate(-c.px, -c.py); }
// keys: [{ t, s, px, py, sx, sy }], eased between keys; hold the ends.
function camPath(keys, t) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) {
    const a = keys[i - 1], b = keys[i], u = easeInOut((t - a.t) / (b.t - a.t || 1));
    const s_ = Math.exp(lerp(Math.log(a.s), Math.log(b.s), u)); // zoom evenly in log space
    return { s: s_, px: lerp(a.px, b.px, u), py: lerp(a.py, b.py, u), sx: lerp(a.sx, b.sx, u), sy: lerp(a.sy, b.sy, u) };
  }
  return keys[keys.length - 1];
}
// Circle lock: the incoming plate enters with its own circle (art centre px, py, radius r) exactly where the
// outgoing circle was on screen (sx, sy, radius R), then settles into the standard plate framing. Every lock uses
// this, so the turning circles hand over the film from one plate to the next.
// Times are on the scene clock; `off` is the scene's offset, so the lock always happens at the cut.
function lockCam(from, to, { settle = 2.6, dur = 11, s1 = 1.0, s2 = 1.06, px = 1435, py = 585, off = 0, then = null } = {}) {
  const f = typeof from === 'function' ? from : () => from; // `from` may be computed lazily (it can depend on another scene)
  return t => {
    const a = f(), keys = [{ t: 0, s: a.R / to.r, px: to.px, py: to.py, sx: a.sx, sy: a.sy }, { t: settle, s: s1, px, py, sx: 560, sy: 560 }];
    keys.push(...(then || [{ t: dur, s: s2, px, py, sx: 560, sy: 560 }]));
    return camPath(keys, t - off);
  };
}
// Where a plate's circle sits on screen at scene-clock time t under the standard framing.
function plateCircle(art, t, dur = 11, s1 = 1.0, s2 = 1.06) {
  const c = camPath([{ t: 0, s: s1, px: 1435, py: 585, sx: 560, sy: 560 }, { t: dur, s: s2, px: 1435, py: 585, sx: 560, sy: 560 }], t);
  return { sx: c.sx + (art.px - c.px) * c.s, sy: c.sy + (art.py - c.py) * c.s, R: art.r * c.s };
}
const CIRCLES = { // the turning circles of the plates, in art coordinates
  durour: { px: 1420, py: 575, r: 382 }, monsoon: { px: 1575, py: 408, r: 268 }, pearling: { px: 1430, py: 430, r: 182 },
  world: { px: 1430, py: 560, r: 318 },
};
// The standard move for a re-used v3 plate (drawn in x 985–1885): the art moves into the left half of the
// frame, so the words can take the right, and the camera eases slowly in over the scene.
const PLATE_LEFT = (s0 = 1.0, s1 = 1.06, dur = 8, px = 1435, py = 585) => t => camPath([{ t: 0, s: s0, px, py, sx: 560, sy: 560 }, { t: dur, s: s1, px, py, sx: 560, sy: 560 }], t);

/* ---------- paper, night sky, light, and the frame ---------- */
function makePaper() {
  const c = document.createElement('canvas'); c.width = W * SCALE; c.height = H * SCALE;
  const g = c.getContext('2d'), r = rng(7);
  g.scale(SCALE, SCALE);
  g.fillStyle = '#E4D7BE'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) {
    const x = r() * W, y = r() * H, rad = 80 + r() * 420, light = r() < 0.55, a = 0.03 + r() * 0.05;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, light ? `rgba(250,243,228,${a})` : `rgba(140,112,78,${a})`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.strokeStyle = 'rgba(120,96,66,0.10)'; g.lineWidth = 0.7;
  for (let i = 0; i < 520; i++) { const x = r() * W, y = r() * H, a = r() * TAU, L = 10 + r() * 40; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.4) * L * 0.5, y + Math.sin(a + 0.4) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 18; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
  g.putImageData(img, 0, 0);
  return c;
}
// The night sheet: a deep indigo sky, a little lighter toward the horizon, with the same paper grain.
function makeNight() {
  const c = document.createElement('canvas'); c.width = W * SCALE; c.height = H * SCALE;
  const g = c.getContext('2d'), r = rng(23);
  g.scale(SCALE, SCALE);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#05070F'); sky.addColorStop(0.55, '#0B1122'); sky.addColorStop(0.8, '#141A2C'); sky.addColorStop(1, '#0D1120');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H, rad = 120 + r() * 420, a = 0.02 + r() * 0.03;
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, r() < 0.5 ? `rgba(60,72,110,${a})` : `rgba(0,0,0,${a * 2})`); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 7; d[i] += n; d[i + 1] += n; d[i + 2] += n * 1.2; }
  g.putImageData(img, 0, 0);
  return c;
}
function makeSpeckle() {
  const c = document.createElement('canvas'); c.width = W * SCALE; c.height = H * SCALE;
  const g = c.getContext('2d'), r = rng(19);
  g.scale(SCALE, SCALE);
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(255,250,238,${0.25 + r() * 0.6})`; g.fillRect(r() * W, r() * H, r() < 0.8 ? 1 : 2, 1); }
  return c;
}
const CHROME = { corners: true, mark: false };
function corners(a) {
  ctx.save(); ctx.globalAlpha = a * 0.7; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(42, 78); ctx.lineTo(42, 42); ctx.lineTo(78, 42);
  ctx.moveTo(W - 78, 42); ctx.lineTo(W - 42, 42); ctx.lineTo(W - 42, 78);
  ctx.stroke(); ctx.restore();
}
// Light over the sheet: a warm glow and two slow shafts by day (fewer at night), film speckle, a vignette.
function light(t, night) {
  const day = 1 - night;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  if (day > 0) {
    const gx = 560 + Math.sin(t * 0.05) * 120, glow = ctx.createRadialGradient(gx, 520, 0, gx, 520, 820);
    glow.addColorStop(0, `rgba(255,246,226,${0.2 * day})`); glow.addColorStop(1, 'rgba(255,246,226,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    [[-240 + t * 7, 260, 0.07], [260 + t * 5, 150, 0.05]].forEach(([x, w, a]) => {
      ctx.save(); ctx.translate(x, -100); ctx.rotate(-0.62);
      const g = ctx.createLinearGradient(-w, 0, w, 0);
      g.addColorStop(0, 'rgba(255,248,232,0)'); g.addColorStop(0.5, `rgba(255,248,232,${a * day})`); g.addColorStop(1, 'rgba(255,248,232,0)');
      ctx.fillStyle = g; ctx.fillRect(-w, -400, w * 2, 3000); ctx.restore();
    });
  }
  ctx.globalAlpha = 0.09 - 0.05 * night; ctx.drawImage(SPECKLE_CV, 0, 0, W, H);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(255,255,255,1)');
  v.addColorStop(1, `rgba(${Math.round(lerp(178, 110, night))},${Math.round(lerp(150, 112, night))},${Math.round(lerp(116, 130, night))},1)`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ---------- the timeline: scenes, their dissolves, and one frame ---------- */
// Per scene: start, dur, speed (local time rate), night (dark theme), xf (length of the dissolve INTO it),
// enter: { type: 'fade' | 'dawn' | 'iris', x, y }, cam(t) → camera, draw(t, realT) → art, words(t, realT) → text.
let XF = 0.5, DURATION = 0, FADE_IN = 2.0, FADE_OUT = OPT.fadeout; // the film ends on the hold loop's first frame unless ?fadeout=s
function visible(t) {
  const out = [];
  SCENES.forEach((s, i) => {
    const lt = t - s.start, nx = SCENES[i + 1], xin = s.xf ?? XF, xout = nx ? nx.xf ?? XF : 0;
    const a = i > 0 ? clamp((lt + xin / 2) / xin) : 1, o = nx ? clamp((s.dur + xout / 2 - lt) / xout) : 1;
    if (a > 0 && o > 0 && lt > -xin) out.push({ s, lt, a });
  });
  return out;
}
function drawScene(s, lt) {
  setTheme(!!s.night);
  // offset: a plate can enter part-drawn instead of being sped up; warp: a scene clock of its own (a held frame)
  const off = s.offset || 0, wl = lt * (s.speed || 1), sl = s.warp ? s.warp(lt) : off + wl;
  ctx.save();
  if (s.cam) camera(s.cam(sl, lt));
  s.draw(sl, lt);
  ctx.restore();
  if (s.tint) { // a wash over the plate (not the words): the April sky greying and clearing
    const a = s.tint(s.start + lt);
    if (a > 0) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(150,156,168,${a.toFixed(3)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // words run on the scene clock measured from the cut (no offset), so they never arrive inside a dissolve
  if (s.words) { ctx.save(); s.words(wl, lt); ctx.restore(); }
  else if (s.text) { ctx.save(); wordsBlock(s, wl); ctx.restore(); }
}
function sheet(s) { return s && s.night ? NIGHT_CV : PAPER_CV; }
function composite(v) {
  const e = v.s.enter || { type: 'fade' };
  if (e.type === 'iris') {
    // the next plate opens in a widening circle, traced by a gold ring: the turning circle is the film's device
    const p = easeInOut(v.a), R = Math.hypot(Math.max(e.x, W - e.x), Math.max(e.y, H - e.y)) * p;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.arc(e.x * SCALE, e.y * SCALE, R * SCALE, 0, TAU); ctx.clip();
    ctx.drawImage(LAYER_CV, 0, 0); ctx.restore();
    if (p > 0 && p < 1) {
      ctx.save(); ctx.globalAlpha = 0.85 * Math.sin(Math.PI * p); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, TAU); ctx.stroke();
      ctx.globalAlpha *= 0.5; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(e.x, e.y, R + 9, 0, TAU); ctx.stroke(); ctx.restore();
    }
    return;
  }
  if (e.type === 'dawn' || e.type === 'dusk') {
    // dawn: the day sheet is uncovered from the horizon upward behind a band of first light;
    // dusk: the night sheet comes down from the top of the sky
    const p = easeInOut(v.a), F = 420, dawn = e.type === 'dawn';
    const edge = dawn ? lerp(H + F, -F, p) : lerp(-F, H + F, p);
    LAYER.save(); LAYER.setTransform(SCALE, 0, 0, SCALE, 0, 0); LAYER.globalCompositeOperation = 'destination-in';
    const m = LAYER.createLinearGradient(0, edge - F, 0, edge + F);
    m.addColorStop(0, dawn ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)'); m.addColorStop(1, dawn ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)');
    LAYER.fillStyle = m; LAYER.fillRect(0, 0, W, H); LAYER.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(LAYER_CV, 0, 0); ctx.restore();
    const g = Math.sin(Math.PI * p) * (dawn ? 0.5 : 0.25);
    if (g > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const band = ctx.createLinearGradient(0, edge - F, 0, edge + F);
      const c = dawn ? '255,196,128' : '120,140,200';
      band.addColorStop(0, `rgba(${c},0)`); band.addColorStop(0.5, `rgba(${c},${g})`); band.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = band; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    return;
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = v.a; ctx.drawImage(LAYER_CV, 0, 0); ctx.restore();
}
function render(t) {
  const vis = visible(t);
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.drawImage(sheet(vis[0] && vis[0].s), 0, 0, W, H);
  let night = vis.length ? (vis[0].s.night ? 1 : 0) : 0;
  vis.forEach((v, k) => {
    SA = 1; REAL_LT = v.lt;
    if (k === 0) { drawScene(v.s, v.lt); return; }
    // the incoming scene is drawn whole on its own sheet, then laid over the outgoing one
    ctx = LAYER;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.drawImage(sheet(v.s), 0, 0, W, H);
    drawScene(v.s, v.lt);
    ctx = MAIN;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    composite(v);
    night = lerp(night, v.s.night ? 1 : 0, v.a);
  });
  SA = 1;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  setTheme(night > 0.5);
  if (typeof RING !== 'undefined') drawRing(t);
  if (CHROME.corners) corners(1);
  if (CHROME.mark) small('NCM · XX', W - 78, 72, 1, { size: 18, ls: 8, align: 'right', weight: 600, a: 0.85 });
  light(t, night);
  const fadeIn = FADE_IN ? 1 - easeOut(prog(t, 0, FADE_IN)) : 0, fadeOut = FADE_OUT ? easeInOut(prog(t, DURATION - FADE_OUT, FADE_OUT)) : 0;
  if (GRADE === 'led') {
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(${Math.round(lerp(196, 232, night))},${Math.round(lerp(190, 232, night))},${Math.round(lerp(182, 236, night))},1)`; ctx.fillRect(0, 0, W, H);
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
    v.addColorStop(0, "rgba(255,255,255,1)"); v.addColorStop(1, "rgba(150,142,134,1)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  const dark = Math.max(fadeIn, fadeOut);
  if (dark > 0) { ctx.fillStyle = `rgba(6,7,12,${dark})`; ctx.fillRect(0, 0, W, H); }
  if (OPT.vo && typeof VO !== 'undefined') voSubs(t);
  if (OPT.tc) timecode(t);
}
// The persistent gold ring (the film's device where no plate has a circle of its own). RING is a list of film-time
// keys { t, x, y, r, a, p } (p: how much of the circle is drawn); x and y may be functions of t. Drawn on the main canvas
// after compositing, so it never dissolves or ghosts.
function drawRing(t) {
  if (!RING.length || t < RING[0].t || t > RING[RING.length - 1].t) return;
  let i = 1; while (i < RING.length - 1 && RING[i].t < t) i++;
  const a = RING[i - 1], b = RING[i], u = easeInOut(clamp((t - a.t) / (b.t - a.t || 1)));
  const v = k => { const va = typeof a[k] === 'function' ? a[k](t) : a[k], vb = typeof b[k] === 'function' ? b[k](t) : b[k]; return lerp(va, vb, u); };
  const x = v('x'), y = v('y'), r = v('r'), al = v('a'), p = v('p');
  if (al <= 0.01 || r <= 0 || p <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = IS_NIGHT ? 'screen' : 'multiply';
  stroke(el(x, y, r, r, -Math.PI / 2, -Math.PI / 2 + TAU * p, 990, 0), 1, GOLD, 1.8, 0.85 * al);
  ctx.restore();
}
// The review animatic shows the narration as subtitles until the narrator is recorded (?vo). VO: [{ in, out, ar, en }].
function voSubs(t) {
  const v = VO.find(l => t >= l.in - 0.1 && t <= l.out + 0.4);
  if (!v) return;
  const q = clamp((t - v.in + 0.1) / 0.25) * clamp((v.out + 0.4 - t) / 0.3);
  // wrap to the frame (the caption form, without the narrator's vowels, as the audience's captions will read)
  const wrap = (text, font, dir, maxW) => {
    ctx.font = font; ctx.direction = dir;
    const lines = [];
    let cur = '';
    text.split(' ').forEach(w => { const tryL = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(tryL).width > maxW) { lines.push(cur); cur = w; } else cur = tryL; });
    if (cur) lines.push(cur);
    if (lines.length !== 2) return lines;
    // two lines: balance them (the break that makes the longer line shortest), so a name is not left dangling
    const W_ = text.split(' ');
    let best = null;
    for (let k = 1; k < W_.length; k++) { const l1 = W_.slice(0, k).join(' '), l2 = W_.slice(k).join(' '), m = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width), score = m - (/[،,:;]$/.test(l1) ? 0.25 * maxW : 0); if (m <= maxW && (!best || score < best.score)) best = { score, l: [l1, l2] }; }
    return best ? best.l : lines; // prefer a break after a comma, so a phrase or a name is not split
  };
  ctx.save(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  const fa = `600 34px ${F_KUFI}`, fe = `italic 400 25px ${F_FELL}`;
  const A = wrap(typeof voSubAr === 'function' ? voSubAr(v) : v.ar, fa, 'rtl', 1680), E = wrap(v.en, fe, 'ltr', 1680);
  const h = 40 + A.length * 44 + E.length * 32;
  ctx.globalAlpha = 0.55 * q; ctx.fillStyle = '#0B0C10'; ctx.fillRect(0, H - h, W, h);
  ctx.globalAlpha = q; ctx.fillStyle = '#F3EAD6'; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.font = fa;
  let y = H - h + 50;
  A.forEach(l => { ctx.fillText(l, W / 2, y); y += 44; });
  ctx.direction = 'ltr'; ctx.font = fe; ctx.fillStyle = '#D9CFBA';
  y -= 6; E.forEach(l => { ctx.fillText(l, W / 2, y); y += 32; });
  ctx.globalAlpha = 0.5 * q; ctx.font = `600 12px ${F_MONO}`; ctx.letterSpacing = '3px'; ctx.textAlign = 'left'; ctx.fillText('NARRATION · SCRATCH SUBTITLE', 40, H - h + 18);
  ctx.restore();
}
// Burned-in timecode for the show-caller's reference copy (?tc), at 25 fps SMPTE.
function timecode(t) {
  const fr = Math.floor(t * 25 + 1e-6), tc = [Math.floor(fr / 90000), Math.floor(fr / 1500) % 60, Math.floor(fr / 25) % 60, fr % 25].map(n => String(n).padStart(2, '0')).join(':');
  ctx.save(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(W / 2 - 150, 14, 300, 40);
  ctx.fillStyle = '#FFFFFF'; ctx.font = `600 26px ${F_MONO}`; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.fillText(tc, W / 2, 44); ctx.restore();
}

/* ---------- boot ---------- */
async function boot() {
  const fonts = ['900 100px Cinzel', '700 100px Cinzel', '500 20px "IBM Plex Mono"', '600 20px "IBM Plex Mono"', 'italic 400 24px "IM Fell English"', '400 24px "IM Fell English"'];
  const arFonts = ['700 60px "Reem Kufi"', '500 24px "Reem Kufi"', '400 30px "Aref Ruqaa"', '400 40px "Amiri"', '700 40px "Amiri"', '400 40px "Noto Kufi Arabic"', '600 40px "Noto Kufi Arabic"', '700 40px "Noto Kufi Arabic"'];
  await Promise.all(fonts.map(f => document.fonts.load(f, 'AZ az 09 ·')).concat(arFonts.map(f => document.fonts.load(f, 'السماء عربي ٢٠'))));
  await document.fonts.ready;
  // never render with a fallback face: a missing font stops the render (render.js exits on the page error)
  const missing = fonts.filter(f => !document.fonts.check(f, 'AZ az 09')).concat(arFonts.filter(f => !document.fonts.check(f, 'السماء')));
  if (missing.length) throw new Error('fonts failed to load: ' + missing.join(', '));
  LAYER_CV = document.createElement('canvas'); LAYER_CV.width = W * SCALE; LAYER_CV.height = H * SCALE; LAYER = LAYER_CV.getContext('2d');
  TXT_CV = document.createElement('canvas'); TXT_CV.width = W * SCALE; TXT_CV.height = H * SCALE; TXT = TXT_CV.getContext('2d');
  PAPER_CV = makePaper(); NIGHT_CV = makeNight(); SPECKLE_CV = makeSpeckle();
  DAY_PAT = ctx.createPattern(PAPER_CV, 'no-repeat'); NIGHT_PAT = ctx.createPattern(NIGHT_CV, 'no-repeat'); PAPER_PAT = DAY_PAT;
  // one headline size for every v3 chapter headline (only used by scenes that still call textBlock)
  setText(`900 100px ${F_HEAD}`, 1);
  let widest = 1;
  SCENES.forEach(s => s.head && s.head.forEach(l => { widest = Math.max(widest, ctx.measureText(l).width); }));
  HEAD_SIZE = Math.min(104, Math.floor((810 / widest) * 100));
  // timeline.js places the scenes: each entry names a scene by id and sets its start, dur, speed, words,
  // camera and transition. A scene can be used more than once; scenes it does not name are left out.
  SCENES.forEach(s => s.id && SCENE_DEFS.set(s.id, s));
  if (typeof TIMELINE !== 'undefined') { // a top-level const is not a window property
    const byId = SCENE_DEFS, kept = [];
    TIMELINE.forEach(e => { const base = byId.get(e.use || e.id); if (!base) throw new Error('timeline: no scene ' + (e.use || e.id)); kept.push(Object.assign({}, base, e)); });
    SCENES.length = 0; kept.forEach(s => SCENES.push(s));
  }
  SCENES.sort((a, b) => a.start - b.start);
  DURATION = SCENES.reduce((m, s) => Math.max(m, s.start + s.dur), 0);
  SCENES.forEach((s, i) => { s.nextXf = SCENES[i + 1] ? SCENES[i + 1].xf ?? XF : 0; });
  SCENES.forEach(s => { setTheme(!!s.night); s.init && s.init(); });
  setTheme(false);
  return true;
}
