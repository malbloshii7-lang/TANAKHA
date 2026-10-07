/* WMO President mission video — deterministic frame renderer.
   Call window.renderFrame(t) for any t in [0, 50]; nothing animates on its own. */
(function () {
'use strict';
const W = 1080, H = 1350, DEG = Math.PI / 180, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: x => x,
  outQ: x => 1 - (1 - x) * (1 - x),
  inC: x => x * x * x,
  outC: x => 1 - Math.pow(1 - x, 3),
  ioC: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQt: x => 1 - Math.pow(1 - x, 4),
  ioQt: x => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  outQn: x => 1 - Math.pow(1 - x, 5),
  outX: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  outB: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  ioS: x => -(Math.cos(Math.PI * x) - 1) / 2,
};
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/* ------------------------------------------------------------------ timeline
   96-ish BPM grid (101.05 BPM): 1 beat = 0.59375 s, 1 bar = 2.375 s, 1 stop = 2 bars. */
const BEAT = 0.59375, BAR = 4 * BEAT, STOP = 2 * BAR, PAN = 1.75 * BEAT;
const A0 = 5 * BAR;                    // first stop fully on screen (11.875 s)
const ARR = i => A0 + STOP * i;        // arrival of stop i (i = 6 -> pillars)
const T = {
  head: [BEAT * 0.5, BEAT * 0.9, BEAT * 1.3],
  name: BEAT * 2.55, role: BEAT * 2.8,
  stats: BAR,
  lineA: BAR + BEAT * 0.5, lineB: 2 * BAR - BEAT * 0.25,
  morph: 2 * BAR + 2 * BEAT, morphEnd: 3 * BAR + BEAT * 0.25,
  pulse: 3 * BAR + BEAT * 0.25, pulseEnd: 4 * BAR + BEAT * 0.5,
  dock: 4 * BAR + BEAT * 1.0, dockEnd: A0,
  pill: ARR(6), fin: ARR(6) + 2 * BAR, end: 50,
};
window.TL = { BEAT, BAR, STOP, PAN, A0, T, ARR: [0, 1, 2, 3, 4, 5, 6].map(ARR) };

/* ------------------------------------------------------------------ helpers */
const mk = (tag, cls, parent, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
};
function S(e, o) {
  let tf = '';
  if (o.x || o.y) tf += `translate(${(o.x || 0).toFixed(2)}px,${(o.y || 0).toFixed(2)}px) `;
  if (o.r) tf += `rotate(${o.r.toFixed(3)}deg) `;
  if (o.s != null && Math.abs(o.s - 1) > 1e-4) tf += `scale(${o.s.toFixed(4)}) `;
  if (o.sx != null || o.sy != null) tf += `scale(${(o.sx ?? 1).toFixed(4)},${(o.sy ?? 1).toFixed(4)}) `;
  e.style.transform = tf;
  if (o.o != null) {
    e.style.opacity = o.o.toFixed(4);
    e.style.visibility = o.o <= 0.002 ? 'hidden' : 'visible';
  }
  if (o.b != null) e.style.filter = o.b > 0.06 ? `blur(${o.b.toFixed(2)}px)` : 'none';
}
const ICON = {
  cal: '<svg viewBox="0 0 24 24"><rect x="3.4" y="5" width="17.2" height="15.6" rx="2.6" fill="none" stroke="#163f80" stroke-width="1.9"/><path d="M3.4 9.7h17.2" stroke="#163f80" stroke-width="1.9"/><path d="M8 3v4M16 3v4" stroke="#163f80" stroke-width="2" stroke-linecap="round"/><g fill="#163f80"><rect x="6.5" y="12" width="2.5" height="2.3" rx=".5"/><rect x="10.75" y="12" width="2.5" height="2.3" rx=".5"/><rect x="15" y="12" width="2.5" height="2.3" rx=".5"/><rect x="6.5" y="16" width="2.5" height="2.3" rx=".5"/><rect x="10.75" y="16" width="2.5" height="2.3" rx=".5"/><rect x="15" y="16" width="2.5" height="2.3" rx=".5"/></g></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 2.4c-4.1 0-7.2 3.1-7.2 7.1 0 5.3 7.2 12.3 7.2 12.3s7.2-7 7.2-12.3c0-4-3.1-7.1-7.2-7.1z" fill="#163f80"/><circle cx="12" cy="9.6" r="2.8" fill="#d6e8fa"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="#163f80" stroke-width="1.85"><circle cx="12" cy="12" r="8.7"/><path d="M3.3 12h17.4M12 3.3c2.7 2.4 4 5.3 4 8.7s-1.3 6.3-4 8.7c-2.7-2.4-4-5.3-4-8.7s1.3-6.3 4-8.7z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.85" stroke-linejoin="round"><path d="M7.1 18.4h10.1a4 4 0 0 0 .55-7.96A5.6 5.6 0 0 0 7.2 9.3a4.55 4.55 0 0 0-.1 9.1z"/></svg>',
  bars: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="4.6" y="12.8" width="3.7" height="6.8" rx=".9"/><rect x="10.15" y="8.8" width="3.7" height="10.8" rx=".9"/><rect x="15.7" y="4.6" width="3.7" height="15" rx=".9"/></svg>',
  nodes: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.85"><circle cx="12" cy="5.6" r="2.55"/><circle cx="5.5" cy="17.7" r="2.55"/><circle cx="18.5" cy="17.7" r="2.55"/><path d="M10.8 7.85 6.7 15.45M13.2 7.85l4.1 7.6M8.05 17.7h7.9"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.85" stroke-linejoin="round"><path d="M6 3.4h8.6l4 4v13.2H6z"/><path d="M14.6 3.4v4h4"/><path d="M8.8 12h6.8M8.8 15h6.8M8.8 18h4.3" stroke-linecap="round"/></svg>',
  glint: '<svg viewBox="0 0 40 40"><defs><radialGradient id="gg"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff6d8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><circle cx="20" cy="20" r="11" fill="url(#gg)"/><path d="M20 1.5 21.6 18.4 38.5 20 21.6 21.6 20 38.5 18.4 21.6 1.5 20 18.4 18.4Z" fill="#fff"/></svg>',
};

/* roof-shaped photo outline: apex at top-centre, shoulders at (0,lsh) & (w,rsh) */
function roofPath(w, h, lsh, rsh, r, ra, apexX) {
  const ax = apexX ?? w / 2;
  const L = Math.hypot(ax, lsh), R = Math.hypot(w - ax, rsh);
  const ul = [ax / L, -lsh / L], ur = [(w - ax) / R, rsh / R];
  const A = [ul[0] * r, lsh + ul[1] * r];
  const B = [ax - ul[0] * ra, -ul[1] * ra];
  const C = [ax + ur[0] * ra, ur[1] * ra];
  const D = [w - ur[0] * r, rsh - ur[1] * r];
  const f = v => v.toFixed(2);
  return {
    clip: `M0 ${f(h)} L0 ${f(lsh + r)} Q0 ${f(lsh)} ${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])} Q${f(ax)} 0 ${f(C[0])} ${f(C[1])} L${f(D[0])} ${f(D[1])} Q${f(w)} ${f(rsh)} ${f(w)} ${f(rsh + r)} L${f(w)} ${f(h)} Z`,
    rim: `M0 ${f(h)} L0 ${f(lsh + r)} Q0 ${f(lsh)} ${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])} Q${f(ax)} 0 ${f(C[0])} ${f(C[1])} L${f(D[0])} ${f(D[1])} Q${f(w)} ${f(rsh)} ${f(w)} ${f(rsh + r)} L${f(w)} ${f(h)}`,
  };
}
function bandPath(w, h, k) { // gently waved top edge
  const f = v => v.toFixed(2);
  return `M0 ${f(10 * k)} C${f(w * .28)} ${f(-2 * k)} ${f(w * .55)} ${f(16 * k)} ${f(w * .78)} ${f(6 * k)} S${f(w)} ${f(2 * k)} ${f(w)} ${f(2 * k)} L${f(w)} ${f(h)} L0 ${f(h)} Z`;
}

/* ------------------------------------------------------------------ geo */
function ecef(lon, lat) { const l = lon * DEG, p = lat * DEG, c = Math.cos(p); return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)]; }
function rot(lon0, lat0) { const p = lat0 * DEG; return { cl: Math.cos(lon0 * DEG), sl: Math.sin(lon0 * DEG), s: Math.sin(p), c: Math.cos(p) }; }
function view(v, R) {
  const x1 = v[0] * R.cl + v[1] * R.sl, y1 = -v[0] * R.sl + v[1] * R.cl, z1 = v[2];
  return [y1, -R.s * x1 + R.c * z1, R.c * x1 + R.s * z1];
}
function slerp(a, b, t) {
  const d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1), w = Math.acos(d), s = Math.sin(w);
  if (s < 1e-6) return a.slice();
  const k1 = Math.sin((1 - t) * w) / s, k2 = Math.sin(t * w) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}
const shortLon = (a, b) => a + ((((b - a) % 360) + 540) % 360 - 180);

const STOPS = window.STOPS, PO = window.POSTER;
const CITY = STOPS.map(s => ecef(s.lon, s.lat));
const K = 64; // samples per leg
const LEGS = [];
for (let i = 0; i < 5; i++) {
  const a = CITY[i], b = CITY[i + 1];
  const w = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
  const hm = 0.03 + 0.15 * (w / Math.PI);
  const pts = [];
  for (let k = 0; k <= K; k++) {
    const t = k / K, v = slerp(a, b, t), h = 1 + hm * Math.sin(Math.PI * t);
    pts.push([v[0] * h, v[1] * h, v[2] * h]);
  }
  LEGS.push(pts);
}
const GD = window.GLOBE_DOTS.map(([lo, la]) => ecef(lo, la));
let FDV = null;
const FD = window.FLAT_DOTS.map(([lo, la], j) => ({ v: ecef(lo, la), lon: lo, lat: la, j }));
// flat map placement used in the title + poster (Asia-Pacific centred)
const MAP = { lon0: 100, k: 3.55, cx: 540, cy: 846 };
const ACT1_DY = 150; // title-act timeline sits lower than the poster line
FDV = FD.map(d => d.v);
for (const d of FD) {
  d.fx = MAP.cx + (((d.lon - MAP.lon0 + 540) % 360) - 180) * MAP.k;
  d.fy = MAP.cy - d.lat * MAP.k;
  d.h = hash(d.j);
}

/* ------------------------------------------------------------------ paths */
function catmull(points, seg = 24) { // centripetal-ish uniform CR through points -> dense polyline
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        i,
      ]);
    }
  }
  const l = points[points.length - 1]; out.push([l[0], l[1], points.length - 2]);
  return out;
}
function resample(poly, n) { // uniform by arc length -> n+1 points
  const d = [0];
  for (let i = 1; i < poly.length; i++) d.push(d[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const L = d[d.length - 1], out = [];
  let j = 1;
  for (let k = 0; k <= n; k++) {
    const s = (k / n) * L;
    while (j < d.length - 1 && d[j] < s) j++;
    const t = (s - d[j - 1]) / (d[j] - d[j - 1] || 1);
    out.push([lerp(poly[j - 1][0], poly[j][0], t), lerp(poly[j - 1][1], poly[j][1], t)]);
  }
  return out;
}
// poster wave: nodes + in-between waypoints (1 = node)
const PW = [[117, 652, 1], [182, 609, 0], [280, 625, 1], [372, 674, 0], [455, 665, 1], [556, 619, 0], [648, 594, 1],
  [732, 626, 0], [808, 676, 1], [889, 627, 0], [971, 676, 1]];
const POSTER_SEGS = (() => {
  const dense = catmull(PW.map(p => [p[0], p[1]]), 28);
  const nodeIdx = PW.map((p, i) => (p[2] ? i : -1)).filter(i => i >= 0);
  const segs = [];
  for (let n = 0; n < 5; n++) {
    const a = nodeIdx[n], b = nodeIdx[n + 1];
    segs.push(resample(dense.filter(q => q[2] >= a && q[2] < b).concat([[PW[b][0], PW[b][1]]]), K));
  }
  return segs;
})();
// strip line (stop cards): nodes at the card apex
const STRIP = { y: 222, dx: 1080, x0: 540 };
const AMP = [74, 46, 92, 58, 80];
const STRIP_SEGS = AMP.map((A, i) => {
  const x0 = STRIP.x0 + i * STRIP.dx, x1 = x0 + STRIP.dx, y = STRIP.y, pts = [];
  for (let k = 0; k <= 160; k++) {
    const t = k / 160, u = 1 - t;
    const c1 = [x0 + 340, y - 1.3 * A], c2 = [x1 - 340, y - 1.3 * A];
    pts.push([u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * x1,
      u * u * u * y + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * y]);
  }
  return resample(pts, K);
});
// tail after the last stop: swoops down into the pillar-scene wave
const PILL_Y = 690;
const TAIL = (() => {
  const x5 = STRIP.x0 + 5 * STRIP.dx, y = STRIP.y, base = x5 + 540; // base = screen-left of pillar scene
  const way = [[x5, y], [x5 + 250, y - 70], [x5 + 470, y + 170], [base + 60, PILL_Y + 6], [base + 300, PILL_Y - 22],
    [base + 560, PILL_Y + 14], [base + 820, PILL_Y - 16], [base + 1080, PILL_Y + 6], [base + 1220, PILL_Y]];
  return resample(catmull(way, 30), 220);
})();
const TAIL_SPLIT = (() => { // index in TAIL where the pillar-scene part begins (x >= base)
  const base = STRIP.x0 + 5 * STRIP.dx + 540; return TAIL.findIndex(p => p[0] >= base);
})();
const WAVE = TAIL.slice(TAIL_SPLIT); // pillar-scene wave (strip coords)
// lead-in that carries the line into the first stop as the globe docks
const LEAD = resample(catmull([[-80, 352], [150, 330], [330, 236], [460, 196], [540, STRIP.y]], 26), 48);
const LEAD_N = LEAD.length - 1;
// pillar-scene comet timing: when it passes under each pillar icon (screen x of icon centres at 1.65x)
const WAVE_RUN = [ARR(6) + 1.75, ARR(6) + 3.95];
const WAVE_PASS = (() => {
  const base = STRIP.x0 + 5 * STRIP.dx + 540, icx = [44, 197, 364, 514].map(x => 22 + x * 1.65);
  const xs = WAVE.map(q => q[0] - base);
  return icx.map(X => {
    let j = xs.findIndex(x => x >= X); if (j < 0) j = xs.length - 1;
    const u = j / (xs.length - 1); // eased progress -> time
    return WAVE_RUN[0] + (WAVE_RUN[1] - WAVE_RUN[0]) * Math.acos(1 - 2 * u) / Math.PI;
  });
})();

/* ------------------------------------------------------------------ DOM build */
const stage = document.getElementById('stage');
const L = {};
let CAM = null;
function layer(id, tag = 'div') { const e = mk(tag, 'layer', CAM); e.id = id; return e; }

function build() {
  CAM = mk('div', 'layer', stage); CAM.id = 'cam'; L.cam = CAM;
  layer('bg'); layer('mist');
  L.wm = mk('div', null, CAM); L.wm.id = 'watermark';
  L.ribbon = mk('div', 'layer', CAM);
  L.ribbon.innerHTML = `<svg width="1080" height="1350" viewBox="0 0 1080 1350" style="position:absolute;left:0;top:0">
    <defs><linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".18" stop-color="#fff" stop-opacity=".78"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient></defs>
    <path d="M0 1128 C 220 1104, 430 1140, 640 1122 S 960 1100, 1080 1118 L1080 1310 L0 1310 Z" fill="url(#rib)"/>
    <path d="M0 1131 C 220 1107, 430 1143, 640 1125 S 960 1103, 1080 1121" fill="none" stroke="#d6e6f7" stroke-width="2"/></svg>`;
  L.waves = mk('div', null, CAM);
  L.waves.innerHTML = `<svg id="waves" viewBox="0 0 1080 240" preserveAspectRatio="none">
    <defs><linearGradient id="w3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1c66c8"/><stop offset=".5" stop-color="#3d93e4"/><stop offset="1" stop-color="#1f6fd0"/></linearGradient>
    <linearGradient id="w2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9cc6ef"/><stop offset="1" stop-color="#bcd9f5"/></linearGradient></defs>
    <path id="wv1" fill="#d9e9f9" opacity=".9"/><path id="wv2" fill="url(#w2)" opacity=".85"/><path id="wv3" fill="url(#w3)"/><path id="wv4" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/></svg>`;
  L.cvA = layer('cvA', 'canvas'); L.cvA.width = W; L.cvA.height = H;
  L.content = layer('content');

  // header
  const hdr = mk('div', null, L.content); hdr.id = 'hdr';
  hdr.innerHTML = `<div class="emb"><img src="assets/wmo_emblem.png"></div><div class="glint">${ICON.glint}</div>
    <div class="org"><div>WORLD</div><div>METEOROLOGICAL</div><div>ORGANIZATION</div></div>
    <div class="vr"></div><div class="pres">WMO PRESIDENT</div><div class="when">SEPTEMBER–OCTOBER 2026</div>`;
  L.emb = hdr.querySelector('.emb'); L.glint = hdr.querySelector('.glint');
  L.org = [...hdr.querySelectorAll('.org div')]; L.vr = hdr.querySelector('.vr');
  L.pres = hdr.querySelector('.pres'); L.when = hdr.querySelector('.when');

  // title
  const ti = mk('div', null, L.content); ti.id = 'title';
  ti.innerHTML = `<div class="hl" id="hl1" style="top:157px"><div class="mask"><span class="in">One line</span></div></div>
    <div class="hl" id="hl2" style="top:247px"><div class="mask"><span class="in" style="position:relative"><span class="grad">across three</span><span class="shine">across three</span></span></div></div>
    <div class="hl" id="hl3" style="top:338px"><div class="mask"><span class="in">WMO Regions</span></div></div>
    <div id="nm">H.E. Dr Abdulla Ahmed Al Mandous</div><div id="rl">President of the World Meteorological Organization</div>`;
  L.hl = ['#hl1', '#hl2', '#hl3'].map(s => ti.querySelector(s + ' .in'));
  L.hlBox = ['#hl1', '#hl2', '#hl3'].map(s => ti.querySelector(s));
  L.shine = ti.querySelector('.shine'); L.nm = ti.querySelector('#nm'); L.rl = ti.querySelector('#rl');

  // stats card
  const st = mk('div', null, L.content); st.id = 'stats';
  st.innerHTML = `
   <div class="row" style="top:0"><div class="ic" style="top:29px">${ICON.cal}</div><div class="lab" style="top:37px">SPAN</div>
     <div class="val" style="top:63px"><span class="roll"><span>1</span><span>2</span><span>3</span><span>4</span></span> weeks</div></div>
   <div class="sep" style="top:129px"></div>
   <div class="row" style="top:129px"><div class="ic" style="top:28px">${ICON.pin}</div><div class="lab" style="top:35px">REGIONS</div>
     <div class="val" style="top:61px"><span class="rn">II</span><span class="rd">·</span><span class="rn">V</span><span class="rd">·</span><span class="rn">VI</span></div></div>
   <div class="sep" style="top:253px"></div>
   <div class="row" style="top:253px"><div class="ic" style="top:24px">${ICON.globe}</div>
     <div class="val v3" style="top:42px;font-size:26px">3 WMO Regions</div></div>`;
  L.stats = st; L.sIc = [...st.querySelectorAll('.ic')]; L.sLab = [...st.querySelectorAll('.lab')];
  L.sSep = [...st.querySelectorAll('.sep')]; L.roll = st.querySelector('.roll');
  L.rn = [...st.querySelectorAll('.rn')]; L.rd = [...st.querySelectorAll('.rd')];
  L.v1 = st.querySelectorAll('.val')[0]; L.v3 = st.querySelector('.v3');
  st.querySelectorAll('.rd').forEach(e => { e.style.margin = '0 10px'; e.style.display = 'inline-block'; });
  st.querySelectorAll('.rn').forEach(e => { e.style.display = 'inline-block'; });

  // ACT-1 timeline labels
  L.tl = STOPS.map((s, i) => {
    const e = mk('div', 'tl', L.content, `<div class="d">${s.date}</div><div class="c">${s.city}</div>`);
    e.style.left = PO.nodes[i][0] + 'px'; e.style.top = (PO.nodes[i][1] + ACT1_DY + 32) + 'px';
    return e;
  });

  // big stop cards
  L.strip = mk('div', null, L.content); L.strip.id = 'strip';
  const BW = 720, PH = 600, BAND_T = 548, BAND_H = 104, PANEL_T = 628, PANEL_H = 382;
  const roof = roofPath(BW, PH, 78, 78, 30, 64);
  L.big = STOPS.map((s, i) => {
    const c = mk('div', 'bcard', L.strip);
    c.style.left = (180 + i * STRIP.dx) + 'px'; c.style.top = STRIP.y + 'px';
    c.innerHTML = `<div class="sh"><div class="rv" style="position:absolute;left:0;top:0;width:720px;height:1012px">
        <div class="ph" style="clip-path:path('${roof.clip}')"><img src="assets/photos/${s.id}.png" style="object-position:${s.focus}"><div class="sheen"></div></div>
        <svg class="rim" width="${BW}" height="${PH}"><path d="${roof.rim}" fill="none" stroke="#fff" stroke-width="7"/></svg>
        <div class="band" style="top:${BAND_T}px;height:${BAND_H}px;clip-path:path('${bandPath(BW, BAND_H, 1.6)}');background:linear-gradient(90deg,${s.tab[0]},${s.tab[1]})">
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%)"></div><div class="tx">${s.date}</div></div>
        <div class="panel" style="top:${PANEL_T}px;height:${PANEL_H}px">
          <div class="reg">REGION ${s.region}</div>
          <div class="cityM" style="position:absolute;left:0;top:78px;width:720px;height:104px;overflow:hidden"><div class="city" style="top:6px">${s.city}</div></div>
          <div class="desc">${s.desc}</div>
          <div class="cnt" style="top:auto;bottom:34px">0${i + 1} / 06</div>
        </div></div></div>
      <div class="badge" style="left:${BW - 226}px;top:${BAND_T - 118}px"><canvas width="212" height="212"></canvas></div>`;
    return {
      root: c, img: c.querySelector('img'), band: c.querySelector('.band'), bandTx: c.querySelector('.band .tx'),
      panel: c.querySelector('.panel'), reg: c.querySelector('.reg'), city: c.querySelector('.city'),
      desc: c.querySelector('.desc'), cnt: c.querySelector('.cnt'), badge: c.querySelector('.badge'), sheen: c.querySelector('.sheen'),
      bcv: c.querySelector('canvas'), ph: c.querySelector('.ph'), sh: c.querySelector('.sh'), rv: c.querySelector('.rv'),
    };
  });

  // slogan + pillars
  L.bottom = mk('div', null, L.content); L.bottom.id = 'bottom';
  L.slogan = mk('div', null, L.bottom); L.slogan.id = 'slogan';
  L.slogan.innerHTML = ['Early warnings.', 'National services.', 'Regional ownership.']
    .map((s, k) => `<div class="mask"><span class="in l${k + 1}">${s}</span></div>`).join('');
  L.sl = [...L.slogan.querySelectorAll('.in')];
  L.pdiv = mk('div', null, L.bottom); L.pdiv.id = 'pdiv';
  L.prow = mk('div', null, L.bottom); L.prow.id = 'prow';
  const PX = [14, 149, 321, 473], ICX = [44, 197, 364, 514], SEPX = [122, 292, 444];
  L.pil = window.PILLARS.map((p, k) => {
    const e = mk('div', 'pil', L.prow);
    e.style.left = PX[k] + 'px';
    e.innerHTML = `<div class="pi" style="left:${ICX[k] - PX[k] - 29}px">${ICON[p.icon]}</div><div class="pt">${p.title}</div><div class="ps">${p.sub}</div>`;
    return { root: e, ic: e.querySelector('.pi'), t: e.querySelector('.pt'), s: e.querySelector('.ps') };
  });
  L.psep = SEPX.map(x => { const e = mk('div', 'psep', L.prow); e.style.left = x + 'px'; return e; });

  // poster small cards
  L.small = STOPS.map((s, i) => {
    const g = PO.cards[i], w = g.w;
    const ph = g.band - g.apex + 14, bandH = 37, panelH = g.bottom - g.panelTop;
    const roofS = roofPath(w, ph, g.lsh - g.apex, g.rsh - g.apex, 10, 22, PO.nodes[i][0] - g.x);
    const c = mk('div', 'scard', L.content);
    c.style.left = g.x + 'px'; c.style.top = g.apex + 'px';
    c.innerHTML = `<div class="sh">
       <div class="ph" style="width:${w}px;height:${ph}px;clip-path:path('${roofS.clip}')"><img src="assets/photos/${s.id}.png" style="object-position:${s.focus}"></div>
       <svg class="rim" width="${w}" height="${ph}"><path d="${roofS.rim}" fill="none" stroke="#fff" stroke-width="3.2"/></svg>
       <div class="band" style="top:${g.band - g.apex}px;width:${w}px;height:${bandH}px;clip-path:path('${bandPath(w, bandH, .6)}');background:linear-gradient(90deg,${s.tab[0]},${s.tab[1]})">
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,0) 50%)"></div><div class="tx">${s.date}</div></div>
       <div class="panel" style="top:${g.panelTop - g.apex}px;width:${w}px;height:${panelH}px">
         <div class="reg">REGION ${s.region}</div><div class="city">${s.city}</div><div class="desc"></div></div></div>`;
    return { root: c, desc: c.querySelector('.desc') };
  });

  L.cvB = layer('cvB', 'canvas'); L.cvB.width = W; L.cvB.height = H;
  L.labels = layer('labels');
  L.kicker = mk('div', null, L.labels, 'SIX STOPS <b>·</b> THREE WMO REGIONS <b>·</b> FOUR WEEKS'); L.kicker.id = 'kicker';
  L.glab = STOPS.map(s => mk('div', 'glab', L.labels, `<div class="c">${s.city}</div><div class="r">REGION ${s.region}</div>`));
}

/* small-card descriptions are manually broken to mirror the reference */
const SMALL_DESC = [
  'ICH/CIS 37th session<br>and Kyrgyzhydromet<br>centenary week.',
  'PMMM-4 adopted<br>the Siu-i-Álaimoana-<br>Ki-Likutapu<br>Declaration.',
  'MetService<br>discussions on WMO<br>governance, regional<br>collaboration and<br>24/7 operations.',
  'Bureau of<br>Meteorology visit:<br>Operations Centre,<br>Metrology<br>Laboratory and<br>space-weather<br>services.',
  'Regional<br>engagements on<br>Early Warnings,<br>climate services<br>and disaster risk<br>reduction.',
  'RA VI-19 Phase II and<br>EW4All regional<br>planning week<br>hosted in Romania.',
];

/* ------------------------------------------------------------------ canvas drawing */
function dotBuckets() { return Array.from({ length: 10 }, () => []); }
function flushBuckets(ctx, b, color, shape) {
  ctx.fillStyle = color;
  for (let k = 0; k < b.length; k++) {
    const arr = b[k]; if (!arr.length) continue;
    ctx.globalAlpha = (k + 0.5) / b.length;
    ctx.beginPath();
    for (let j = 0; j < arr.length; j += 3) {
      const x = arr[j], y = arr[j + 1], r = arr[j + 2];
      if (shape === 'sq') ctx.rect(x - r, y - r, 2 * r, 2 * r);
      else { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function pushB(b, a, x, y, r) { if (a <= 0.01) return; const k = Math.min(b.length - 1, (a * b.length) | 0); b[k].push(x, y, r); }

function drawSphere(ctx, cx, cy, R, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const glow = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.17);
  glow.addColorStop(0, 'rgba(140,195,245,.55)'); glow.addColorStop(1, 'rgba(140,195,245,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.17, 0, TAU); ctx.fill();
  const body = ctx.createRadialGradient(cx - R * .36, cy - R * .42, R * .05, cx, cy, R);
  body.addColorStop(0, '#ffffff'); body.addColorStop(.55, '#edf5fd'); body.addColorStop(1, '#cfe2f6');
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawSphereTop(ctx, cx, cy, R, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const edge = ctx.createRadialGradient(cx, cy, R * .78, cx, cy, R);
  edge.addColorStop(0, 'rgba(30,100,190,0)'); edge.addColorStop(1, 'rgba(30,100,190,.16)');
  ctx.fillStyle = edge; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  const spec = ctx.createRadialGradient(cx - R * .42, cy - R * .5, 0, cx - R * .42, cy - R * .5, R * .55);
  spec.addColorStop(0, 'rgba(255,255,255,.55)'); spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.lineWidth = Math.max(1, R / 220); ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.restore();
}
function drawGraticule(ctx, cx, cy, R, rt, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(60,135,215,.16)'; ctx.lineWidth = Math.max(.6, R / 420);
  const line = pts => {
    let on = false; ctx.beginPath();
    for (const v of pts) {
      const p = view(v, rt);
      if (p[2] > 0) { const x = cx + R * p[0], y = cy - R * p[1]; on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false;
    }
    ctx.stroke();
  };
  for (let lon = -180; lon < 180; lon += 30) { const p = []; for (let la = -80; la <= 80; la += 4) p.push(ecef(lon, la)); line(p); }
  for (let la = -60; la <= 60; la += 30) { const p = []; for (let lo = -180; lo <= 180; lo += 4) p.push(ecef(lo, la)); line(p); }
  ctx.restore();
}
function drawGlobeDots(ctx, cx, cy, R, rt, a, set, rFront, back) {
  const bf = dotBuckets(), bb = dotBuckets();
  for (let j = 0; j < set.length; j++) {
    const p = view(set[j], rt), x = cx + R * p[0], y = cy - R * p[1];
    if (p[2] > 0) pushB(bf, a * (0.34 + 0.66 * Math.pow(p[2], .5)), x, y, rFront * (0.55 + 0.45 * p[2]));
    else if (back) pushB(bb, a * back * (0.35 + 0.65 * -p[2]), x, y, rFront * 0.55);
  }
  if (back) flushBuckets(ctx, bb, '#5b9ad8');
  flushBuckets(ctx, bf, '#1f6fcc');
}
/* polyline helpers: pts = [[x,y,vis], ...] */
function strokeRuns(ctx, pts, upto) {
  let on = false; ctx.beginPath();
  const n = Math.min(pts.length - 1, upto);
  for (let i = 0; i <= n; i++) {
    const q = pts[i];
    if (q[2] === 0) { on = false; continue; }
    on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true;
  }
  ctx.stroke();
}
function drawLine(ctx, pts, prog, opt = {}) { // prog: 0..1 along pts (fractional index)
  if (prog <= 0 || pts.length < 2) return null;
  const f = prog * (pts.length - 1), n = Math.floor(f), fr = f - n;
  const list = pts.slice(0, n + 1);
  if (n < pts.length - 1 && fr > 0) {
    const a = pts[n], b = pts[n + 1];
    list.push([lerp(a[0], b[0], fr), lerp(a[1], b[1], fr), a[2] && b[2] ? 1 : 0]);
  }
  const w = opt.w || 5, s = opt.s || 1;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = opt.a ?? 1;
  // soft halo
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = w + 5 * s; strokeRuns(ctx, list, 1e9);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#1563c3'); g.addColorStop(.5, '#2588e0'); g.addColorStop(1, '#1a6fd0');
  ctx.shadowColor = 'rgba(31,127,216,.45)'; ctx.shadowBlur = 10 * s;
  ctx.strokeStyle = g; ctx.lineWidth = w; strokeRuns(ctx, list, 1e9);
  ctx.shadowBlur = 0;
  if (opt.thin) { ctx.strokeStyle = 'rgba(120,180,240,.55)'; ctx.lineWidth = 1.4 * s; ctx.globalAlpha *= .9;
    ctx.save(); ctx.translate(0, opt.thin); strokeRuns(ctx, list, 1e9); ctx.restore(); }
  ctx.restore();
  return list[list.length - 1];
}
function comet(ctx, x, y, s = 1, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 30 * s);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, 'rgba(200,232,255,.95)');
  g.addColorStop(.45, 'rgba(90,170,245,.45)'); g.addColorStop(1, 'rgba(60,150,240,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 30 * s, 0, TAU); ctx.fill(); ctx.restore();
}
function node(ctx, x, y, r, fill, sc = 1, a = 1) {
  if (sc <= 0.01 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(16,70,150,.35)'; ctx.shadowBlur = 9 * r / 11; ctx.shadowOffsetY = 2 * r / 11;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, (r + r * .45) * sc, 0, TAU); ctx.fill();
  ctx.shadowColor = 'transparent';
  const g = ctx.createRadialGradient(x - r * .35 * sc, y - r * .4 * sc, 0, x, y, r * sc);
  g.addColorStop(0, fill === '#123f8a' ? '#3a6fc0' : '#52acf2'); g.addColorStop(1, fill);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * sc, 0, TAU); ctx.fill();
  ctx.restore();
}
function ripple(ctx, x, y, r, p, a = 1) {
  if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.globalAlpha = a * (1 - p) * .7; ctx.strokeStyle = '#2b8ae2'; ctx.lineWidth = 2.2 * (1 - p) + .6;
  ctx.beginPath(); ctx.arc(x, y, r + r * 2.6 * E.outC(p), 0, TAU); ctx.stroke(); ctx.restore();
}

/* globe scene state -> screen points for route + nodes */
function routePts(cx, cy, R, rt) {
  return LEGS.map(leg => leg.map(v => {
    const p = view(v, rt);
    const vis = p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1 ? 1 : 0;
    return [cx + R * p[0], cy - R * p[1], vis];
  }));
}
function cityPts(cx, cy, R, rt) {
  return CITY.map(v => { const p = view(v, rt); return [cx + R * p[0], cy - R * p[1], p[2]]; });
}

/* badge globe on a card */
function drawBadge(cv, i, t) {
  const ctx = cv.getContext('2d'), w = cv.width, c = w / 2, R = 99;
  ctx.clearRect(0, 0, w, w);
  // rotation: travel from previous city during the pan into this stop
  const s = STOPS[i], prev = STOPS[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : E.ioC(P(t, ARR(i) - PAN * 1.1, ARR(i) + 0.15));
  const lon = lerp(prev.lon, shortLon(prev.lon, s.lon), k);
  const lat = lerp(clamp(prev.lat * .7, -30, 32), clamp(s.lat * .7, -30, 32), k);
  const rt = rot(lon, lat);
  ctx.save(); ctx.beginPath(); ctx.arc(c, c, w / 2, 0, TAU); ctx.clip();
  const bg = ctx.createRadialGradient(c - 30, c - 34, 4, c, c, w / 2);
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#d4e6f8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, w);
  drawGraticule(ctx, c, c, R, rt, 1);
  const bf = dotBuckets();
  for (const d of FD) { const p = view(d.v, rt); if (p[2] > 0) pushB(bf, .25 + .75 * Math.pow(p[2], .6), c + R * p[0], c - R * p[1], 1.25 + .45 * p[2]); }
  flushBuckets(ctx, bf, '#2a78d2');
  // route so far
  const rp = routePts(c, c, R, rt);
  const flat = [];
  const upto = i === 0 ? 0 : (i - 1) + (i === 0 ? 0 : E.ioC(P(t, ARR(i) - PAN, ARR(i))));
  for (let l = 0; l < 5; l++) for (let k2 = 0; k2 <= K; k2++) flat.push(rp[l][k2]);
  if (upto > 0) drawLine(ctx, flat, upto / 5, { w: 2.6, s: .4 });
  const cp = cityPts(c, c, R, rt);
  for (let j = 0; j <= i; j++) if (cp[j][2] > 0) node(ctx, cp[j][0], cp[j][1], j === i ? 5.5 : 3.4, STOPS[j].node, 1, j === i ? 1 : .8);
  const pz = ((t - ARR(i) + 10) % 1.6) / 1.6;
  if (cp[i][2] > 0) ripple(ctx, cp[i][0], cp[i][1], 6, pz, 1);
  ctx.restore();
  ctx.save(); const e = ctx.createRadialGradient(c, c, R * .8, c, c, w / 2);
  e.addColorStop(0, 'rgba(30,100,190,0)'); e.addColorStop(1, 'rgba(30,100,190,.16)');
  ctx.fillStyle = e; ctx.beginPath(); ctx.arc(c, c, w / 2, 0, TAU); ctx.fill(); ctx.restore();
}

/* ------------------------------------------------------------------ frame */
let READY = false;
const GL = { cx: 540, cy: 752, R: 430 }; // big globe placement
function globeRot(t) {
  const a = E.ioS(P(t, T.morph, T.dock)), b = E.ioC(P(t, T.dock, T.dockEnd - BEAT));
  const lon = lerp(lerp(98, 116, a), STOPS[0].lon, b), lat = lerp(lerp(4, 7, a), clamp(STOPS[0].lat * .7, -30, 32), b);
  return rot(lon, lat);
}
function globeGeom(t) { // dock: shrink into stop-0 badge
  const b = E.ioQt(P(t, T.dock, T.dockEnd - BEAT * 0.5));
  const card0 = { x: 180 + 720 - 226 + 106, y: STRIP.y + 548 - 118 + 106 };
  return { cx: lerp(GL.cx, card0.x, b), cy: lerp(GL.cy, card0.y, b), R: lerp(GL.R, 99, b), b };
}

function renderFrame(t) {
  t = clamp(t, 0, T.end);
  const ca = L.cvA.getContext('2d'), cb = L.cvB.getContext('2d');
  ca.clearRect(0, 0, W, H); cb.clearRect(0, 0, W, H);

  /* ---------- background life ---------- */
  S(L.wm, { x: Math.sin(t * .21) * 6, y: Math.cos(t * .17) * 4, r: Math.sin(t * .11) * 1.4, o: .55 });
  const ph = t * .55;
  const wv = (yb, amp, k, sh) => { let d = `M0 240 L0 ${yb}`; for (let x = 0; x <= 1080; x += 30) d += ` L${x} ${(yb + Math.sin(x / 1080 * TAU * k + ph + sh) * amp + Math.sin(x / 1080 * TAU * (k * 2.3) - ph * .7 + sh) * amp * .35).toFixed(1)}`; return d + ' L1080 240 Z'; };
  L.waves.querySelector('#wv1').setAttribute('d', wv(150, 9, 1.1, 0));
  L.waves.querySelector('#wv2').setAttribute('d', wv(178, 8, 1.4, 1.8));
  L.waves.querySelector('#wv3').setAttribute('d', wv(206, 7, 0.9, 3.1));
  L.waves.querySelector('#wv4').setAttribute('d', wv(206, 7, 0.9, 3.1).replace(/ L1080 240 Z$/, '').replace(/^M0 240 L0 /, 'M0 '));

  /* ---------- camera ---------- */
  {
    const intro = lerp(1.045, 1, E.outC(P(t, 0, 3.4)));
    const push = t < T.fin ? lerp(1, 1.035, E.ioS(P(t, ARR(6) - .2, T.fin))) : 1;
    const outro = t >= T.fin ? lerp(1.035, 1, E.outC(P(t, T.fin, T.fin + 2.8))) : 1;
    L.cam.style.transformOrigin = '50% 42%';
    S(L.cam, { s: intro * push * outro });
  }

  /* ---------- phase weights ---------- */
  const fin = P(t, T.fin, T.fin + 1.6);                  // finale assembly
  const titleOut = E.ioC(P(t, T.morph - BEAT * 0.5, T.morph + BEAT * 0.9));
  const finIn = k => E.outQt(P(t, T.fin + 0.25 + k, T.fin + 1.05 + k));

  /* ---------- header (persistent) ---------- */
  {
    const e = E.outB(P(t, 0.1, 0.85), 1.4);
    S(L.emb, { s: lerp(.55, 1, e), r: lerp(-14, 0, E.outC(P(t, .1, .85))), o: E.outC(P(t, .1, .45)) });
    const g = P(t, .78, 1.38);
    S(L.glint, { s: Math.sin(g * Math.PI) * 1.15, r: g * 90, o: g > 0 && g < 1 ? 1 : 0 });
    L.org.forEach((d, k) => { const p = E.outQt(P(t, .26 + k * .07, .9 + k * .07)); S(d, { x: lerp(-18, 0, p), o: p }); });
    S(L.vr, { sy: E.outQt(P(t, .45, 1.0)), o: P(t, .45, .6) });
    const p1 = E.outQt(P(t, .55, 1.15)), p2 = E.outQt(P(t, .66, 1.26));
    S(L.pres, { x: lerp(-16, 0, p1), o: p1 }); S(L.when, { x: lerp(-16, 0, p2), o: p2 });
  }

  /* ---------- title block (act 1 + finale) ---------- */
  {
    const vis = 1 - titleOut;
    L.hl.forEach((e, k) => {
      const pin = E.outQt(P(t, T.head[k], T.head[k] + .85));
      const pfin = finIn(.1 + k * .09);
      const p = t < T.fin ? pin : pfin;
      const out = t < T.fin ? titleOut : 0;
      S(e, { y: lerp(142, 0, p) - out * 40 * (1 + k * .15), o: (t < T.fin ? 1 - out : 1) });
      S(L.hlBox[k], { o: t < T.fin ? vis : (pfin > 0 ? 1 : 0) });
    });
    // shine sweeps
    const sh = Math.max(P(t, 1.55, 2.75), P(t, T.fin + 2.4, T.fin + 3.5));
    L.shine.style.backgroundPosition = `${lerp(110, -10, E.ioS(sh))}% 0`;
    L.shine.style.opacity = sh > 0 && sh < 1 ? 1 : 0;
    const pn = t < T.fin ? E.outQt(P(t, T.name, T.name + .7)) : finIn(.42);
    const pr = t < T.fin ? E.outQt(P(t, T.role, T.role + .7)) : finIn(.5);
    S(L.nm, { y: lerp(20, 0, pn) - (t < T.fin ? titleOut : 0) * 30, o: pn * (t < T.fin ? vis : 1) });
    S(L.rl, { y: lerp(20, 0, pr) - (t < T.fin ? titleOut : 0) * 30, o: pr * (t < T.fin ? vis : 1) });
  }

  /* ---------- stats card ---------- */
  {
    const a = t < T.fin ? E.outQt(P(t, T.stats, T.stats + .7)) : finIn(.35);
    const out = t < T.fin ? titleOut : 0;
    S(L.stats, { x: lerp(46, 0, a) + out * 30, y: -out * 30, s: lerp(.97, 1, a), o: a * (1 - out) });
    const base = t < T.fin ? T.stats : T.fin + .35;
    L.sIc.forEach((e, k) => { const p = P(t, base + .18 + k * .2, base + .68 + k * .2); S(e, { s: lerp(.3, 1, E.outB(p, 2)), o: E.outC(p) }); });
    L.sLab.forEach((e, k) => { const p = E.outQt(P(t, base + .25 + k * .2, base + .8 + k * .2)); S(e, { x: lerp(-10, 0, p), o: p }); });
    L.sSep.forEach((e, k) => S(e, { sx: E.outQt(P(t, base + .3 + k * .2, base + 1.0 + k * .2)) }));
    // value 1: slot roll 1 -> 4
    const pr = t < T.fin ? P(t, base + .3, base + 1.15) : 1; // finale shows the final value, no roll
    S(L.v1, { o: E.outC(P(t, base + .28, base + .5)) });
    [...L.roll.children].forEach(c => { c.style.transform = `translateY(${(-3 * E.outQt(pr) * 100).toFixed(2)}%)`; });
    L.roll.style.filter = pr > 0 && pr < .8 ? `blur(${(Math.sin(pr * Math.PI) * 1.6).toFixed(2)}px)` : 'none';
    // value 2: numerals pop
    L.rn.forEach((e, k) => { const p = P(t, base + .5 + k * .12, base + .95 + k * .12); S(e, { s: lerp(.2, 1, E.outB(p, 2.2)), o: E.outC(p) }); });
    L.rd.forEach((e, k) => S(e, { o: E.outC(P(t, base + .62 + k * .12, base + .9 + k * .12)) }));
    // value 3: wipe
    const p3 = E.outQt(P(t, base + .75, base + 1.45));
    L.v3.style.clipPath = `inset(-10px ${(100 - p3 * 100).toFixed(2)}% -10px -10px)`;
  }

  /* ---------- flat map dots (title + poster) and globe ---------- */
  const mapA = Math.max(t < T.morphEnd ? E.ioS(P(t, .45, 2.8)) : 0, E.ioS(P(t, T.fin + .3, T.fin + 1.5)));
  const morphing = t >= T.morph && t < T.morphEnd + .4;
  const gg = globeGeom(t), rt = globeRot(t);
  const globeOn = t >= T.morph && t < T.dockEnd + .05;
  const globeA = globeOn ? 1 : 0;
  // sphere body
  const gc = t >= T.dock ? cb : ca;
  if (globeOn) {
    const sphA = E.ioC(P(t, T.morph + .2, T.morphEnd));
    drawSphere(gc, gg.cx, gg.cy, gg.R, sphA * (1 - P(t, T.dockEnd - .3, T.dockEnd)));
    drawGraticule(gc, gg.cx, gg.cy, gg.R, rt, sphA * (1 - gg.b));
  }
  // flat dots (also morph into the globe)
  if (mapA > 0 || morphing) {
    const b = dotBuckets(), bb = dotBuckets();
    const sweep = lerp(-200, 1300, E.ioS(P(t, .45, 2.6)));
    for (const d of FD) {
      let x = d.fx, y = d.fy + (t < T.fin ? ACT1_DY * .8 : 0), a, r = 2.15;
      if (t < T.morphEnd + .4 && t >= T.morph) {
        const p = view(d.v, rt), gx = gg.cx + gg.R * p[0], gy = gg.cy - gg.R * p[1];
        const dl = (d.fx / W) * .32 + d.h * .08, m = E.ioC(P(t, T.morph + dl, T.morph + dl + .82));
        x = lerp(d.fx, gx, m); y = lerp(d.fy + ACT1_DY * .8, gy, m);
        const front = p[2] > 0 ? 1 : 0;
        a = lerp(.55, front ? .9 * (0.25 + .75 * p[2]) : 0, m) * (1 - P(t, T.morphEnd - .25, T.morphEnd + .35));
        r = lerp(2.15, 1.5 + 1.0 * Math.max(0, p[2]), m);
      } else {
        a = t < T.fin ? .5 * clamp((sweep - d.fx) / 160) * mapA : .32 * mapA;
        if (t >= T.fin) { // in the poster keep the map airy behind the line band
          const band = 1 - clamp(Math.abs(d.fy - 640) / 230);
          a *= .35 + .65 * band;
        }
      }
      pushB(b, a, x, y, r);
    }
    flushBuckets(ca, b, t < T.morph ? '#7fb2e6' : '#3f88d8', 'sq');
  }
  // parallax world-map texture behind the stops and pillars (wraps seamlessly; lands on the poster map)
  {
    const pa = E.ioS(P(t, T.dock + .6, T.dockEnd + .4)) * (1 - E.ioS(P(t, T.fin + .2, T.fin + 1.2)));
    if (pa > 0) {
      const b = dotBuckets(), Wm = 360 * MAP.k, off = -stripS(t) * STRIP.dx * (Wm / (6 * STRIP.dx));
      for (const d of FD) {
        let x = (((d.fx - MAP.cx + off) % Wm) + Wm * 1.5) % Wm - Wm / 2 + MAP.cx;
        pushB(b, .2 * pa, x, d.fy, 2.15);
      }
      flushBuckets(ca, b, '#7fb2e6', 'sq');
    }
  }
  if (globeOn) {
    const gA = E.ioC(P(t, T.morphEnd - .4, T.morphEnd + .3)) * (1 - P(t, T.dockEnd - .3, T.dockEnd));
    if (gA > 0) drawGlobeDots(gc, gg.cx, gg.cy, gg.R, rt, gA, gg.R > 200 ? GD : FDV, lerp(2.35, 1.3, gg.b), .12);
    const sphA = E.ioC(P(t, T.morph + .2, T.morphEnd)) * (1 - P(t, T.dockEnd - .3, T.dockEnd));
    drawSphereTop(gc, gg.cx, gg.cy, gg.R, sphA);
  }

  /* ---------- ACT 1 line + timeline labels, morph, globe route ---------- */
  if (t < T.morphEnd + .5) {
    const lp = E.ioC(P(t, T.lineA, T.lineB));
    if (t < T.morph) {
      const flat = []; POSTER_SEGS.forEach((sg, i) => sg.forEach((q, k) => { if (i === 0 || k > 0) flat.push([q[0], q[1] + ACT1_DY, 1]); }));
      const head = drawLine(cb, flat, lp, { w: 4.6, thin: 7 });
      PO.nodes.forEach(([x, y], i) => {
        const at = T.lineA + (T.lineB - T.lineA) * INV_IOC(i / 5); // exactly when the comet reaches node i
        const p = P(t, at - .02, at + .5);
        node(cb, x, y + ACT1_DY, 11.5, STOPS[i].node, E.outB(p, 3));
        ripple(cb, x, y + ACT1_DY, 11, P(t, at, at + .9));
        const q = E.outQt(P(t, at + .08, at + .7));
        S(L.tl[i], { y: lerp(14, 0, q), o: q * (1 - titleOut) });
      });
      if (head && lp < 1) comet(cb, head[0], head[1], 1, 1);
    } else {
      L.tl.forEach(e => S(e, { o: 0 }));
    }
    if (t >= T.morph) {
      const rp = routePts(gg.cx, gg.cy, gg.R, rt), cp = cityPts(gg.cx, gg.cy, gg.R, rt);
      const all = [];
      for (let i = 0; i < 5; i++) for (let k = 0; k <= K; k++) {
        if (i > 0 && k === 0) continue;
        const u = (i + k / K) / 5, f = POSTER_SEGS[i][k], g = rp[i][k];
        const m = E.ioC(P(t, T.morph + .1 + u * .3, T.morph + .1 + u * .3 + .85));
        all.push([lerp(f[0], g[0], m), lerp(f[1] + ACT1_DY, g[1], m), m < .5 ? 1 : g[2]]);
      }
      drawLine(cb, all, 1, { w: lerp(4.6, 4.2, P(t, T.morph, T.morphEnd)), thin: 0 });
      PO.nodes.forEach(([x, y], i) => {
        const m = E.ioC(P(t, T.morph + .1 + (i / 5) * .3, T.morph + .1 + (i / 5) * .3 + .85));
        node(cb, lerp(x, cp[i][0], m), lerp(y + ACT1_DY, cp[i][1], m), lerp(11.5, 9, m), STOPS[i].node, 1, cp[i][2] > 0 || m < .5 ? 1 : 0);
      });
    }
  } else L.tl.forEach(e => S(e, { o: 0 }));

  if (t >= T.morphEnd + .5 && t < T.dockEnd + .05) {
    // full route on the globe + travelling pulse + labels
    const fade = 1 - P(t, T.dockEnd - .3, T.dockEnd);
    const rp = routePts(gg.cx, gg.cy, gg.R, rt), cp = cityPts(gg.cx, gg.cy, gg.R, rt);
    const all = []; for (let i = 0; i < 5; i++) for (let k = 0; k <= K; k++) if (!(i > 0 && k === 0)) all.push(rp[i][k]);
    drawLine(cb, all, 1, { w: lerp(4.2, 2.6, gg.b), s: lerp(1, .4, gg.b), a: fade * (1 - E.ioC(P(t, T.dock + .2, T.dockEnd - .55))) });
    const pu = P(t, T.pulse, T.pulseEnd);
    if (pu > 0 && pu < 1) {
      const f = E.ioS(pu) * (all.length - 1), n = Math.floor(f), q = all[Math.min(all.length - 1, n)];
      if (q[2]) comet(cb, q[0], q[1], .9, 1);
    }
    cp.forEach((c, i) => {
      if (c[2] <= 0) return;
      const at = T.pulse + (T.pulseEnd - T.pulse) * PU(i);
      node(cb, c[0], c[1], lerp(9, 5.5, gg.b), STOPS[i].node, 1, fade * (i === 0 ? 1 : 1 - E.ioC(P(t, T.dock + .2, T.dockEnd - .55))));
      ripple(cb, c[0], c[1], 9, P(t, at, at + 1.0), fade);
    });
  }
  // globe labels
  {
    const rpC = cityPts(gg.cx, gg.cy, gg.R, rt);
    if (!LABEL_POS) placeLabels();
    STOPS.forEach((s, i) => {
      const at = T.pulse + (T.pulseEnd - T.pulse) * PU(i);
      const p = E.outQt(P(t, at - .05, at + .55)) * (1 - E.ioC(P(t, T.dock, T.dock + .45)));
      const e = L.glab[i], c = rpC[i], o = LABEL_POS[i];
      e.style.left = (c[0] + o.ox) + 'px'; e.style.top = (c[1] + o.oy) + 'px';
      e.style.width = o.w + 'px'; e.style.textAlign = o.align;
      e.style.transformOrigin = o.align === 'right' ? '100% 50%' : o.align === 'left' ? '0 50%' : '50% 50%';
      S(e, { x: lerp(o.align === 'left' ? -10 : o.align === 'right' ? 10 : 0, 0, p), o: t < T.dockEnd ? p : 0, s: lerp(.92, 1, p) });
    });
    const kp = E.outQt(P(t, T.morphEnd - .3, T.morphEnd + .5)) * (1 - E.ioC(P(t, T.dock, T.dock + .5)));
    S(L.kicker, { y: lerp(12, 0, kp), o: kp });
  }

  /* ---------- ACT 3: stop strip ---------- */
  const s = stripS(t); // continuous stop index (camera)
  const SX = -s * STRIP.dx;
  const stripOn = t >= T.dock + .3 && t < T.fin + .2;
  S(L.strip, { x: SX, o: stripOn ? 1 : 0 });
  L.big.forEach((c, i) => {
    const sx = 180 + i * STRIP.dx + SX;
    const near = sx > -900 && sx < 1100;
    c.root.style.display = stripOn && near ? 'block' : 'none';
    if (!(stripOn && near)) return;
    const a = ARR(i);
    // build-in for the first card (dock), otherwise slide-in with a lag on the text
    let reveal, txt;
    if (i === 0) {
      reveal = E.ioC(P(t, T.dock + .45, T.dockEnd - .1));
      txt = E.outQt(P(t, T.dockEnd - BEAT * 1.4, T.dockEnd + .35));
      const rr = lerp(0, 1150, reveal);
      c.rv.style.webkitMaskImage = c.rv.style.maskImage = reveal >= 1 ? 'none' : `radial-gradient(circle at 600px 536px, #000 ${rr.toFixed(1)}px, transparent ${(rr + 1.5).toFixed(1)}px)`;
    } else {
      txt = E.outQt(P(t, a - PAN * .55, a + .4));
      c.rv.style.webkitMaskImage = c.rv.style.maskImage = 'none';
    }
    // light sheen across the photo on arrival
    const sp = P(t, (i ? a : T.dockEnd) - .1, (i ? a : T.dockEnd) + 1.0);
    c.sheen.style.backgroundPosition = `${lerp(130, -30, E.ioS(sp)).toFixed(2)}% 0`;
    c.sheen.style.opacity = sp > 0 && sp < 1 ? 1 : 0;
    // ken burns
    const kb = P(t, a - PAN, a + STOP);
    c.img.style.transform = `scale(${lerp(1.12, 1.02, E.outQ(kb)).toFixed(4)}) translate(${lerp(-1.2, 1.2, kb).toFixed(2)}%,0)`;
    const lag = (1 - txt) * 70;
    S(c.bandTx, { x: lag * .8, o: txt });
    S(c.reg, { x: lag, o: txt });
    c.reg.style.letterSpacing = lerp(.42, .14, txt).toFixed(3) + 'em';
    S(c.city, { x: lag * .6, y: lerp(104, 0, E.outQt(P(t, (i ? a - PAN * .45 : T.dockEnd - BEAT), (i ? a : T.dockEnd) + .45))) });
    const dp = P(t, (i ? a - PAN * .2 : T.dockEnd - .3), (i ? a : T.dockEnd) + 1.0);
    const m = lerp(-25, 120, E.outC(dp));
    c.desc.style.webkitMaskImage = c.desc.style.maskImage = `linear-gradient(180deg,#000 ${m.toFixed(1)}%,transparent ${(m + 25).toFixed(1)}%)`;
    S(c.desc, { x: lag * .5 });
    S(c.cnt, { o: txt });
    // badge
    const bp = i === 0 ? E.outB(P(t, T.dockEnd - .2, T.dockEnd + .25), 1.2) : 1;
    S(c.badge, { s: i === 0 ? (t < T.dockEnd - .2 ? 0 : lerp(.96, 1, bp)) : 1, o: i === 0 ? (t >= T.dockEnd - .2 ? 1 : 0) : 1 });
    if (sx > -760 && sx < 1080) drawBadge(c.bcv, i, t);
  });

  /* strip line + nodes (canvas B, screen coords) */
  if (t >= T.dockEnd - .4) {
    const fadeIn = P(t, T.dockEnd - .4, T.dockEnd);
    const pts = [];
    LEAD.forEach(q => pts.push([q[0] + SX, q[1], 1]));
    STRIP_SEGS.forEach((sg, i) => sg.forEach((q, k) => { if (k > 0) pts.push([q[0] + SX, q[1], 1]); }));
    TAIL.forEach((q, k) => { if (k > 0) pts.push([q[0] + SX, q[1], 1]); });
    // progress: segment i drawn during the pan into stop i+1; tail during the pan into pillars
    const segN = 5 * K, tailN = TAIL.length - 1;
    let idx = LEAD_N * E.ioC(P(t, T.dock + .55, T.dockEnd - .2));
    for (let i = 1; i <= 5; i++) idx += K * E.outC(P(t, ARR(i) - PAN * 1.05, ARR(i) - PAN * .05));
    idx += tailN * E.ioC(P(t, ARR(6) - PAN * 1.1, ARR(6) + BEAT * .9));
    // during the finale the pillar wave morphs into the poster line
    const fm = E.ioQt(P(t, T.fin + .1, T.fin + 1.15));
    if (fm <= 0) {
      const head = drawLine(cb, pts, (idx + .0001) / (pts.length - 1), { w: 6, s: 1.2, a: 1, thin: 9 });
      const j = idx - LEAD_N;
      const moving = (idx > .5 && idx < LEAD_N - .5) || (j > 0 && j < segN && (j % K) > .5 && (j % K) < K - .5) || (j > segN + 2 && j < segN + tailN - 2);
      if (head && moving) comet(cb, head[0], head[1], 1.2, 1);
    } else {
      const wv = WAVE.map(q => [q[0] + SX, q[1]]);
      const target = []; POSTER_SEGS.forEach((sg, i) => sg.forEach((q, k) => { if (i === 0 || k > 0) target.push(q); }));
      const A = resample(wv, 320), B = resample(target, 320);
      const mix = A.map((q, k) => [lerp(q[0], B[k][0], fm), lerp(q[1], B[k][1], fm), 1]);
      drawLine(cb, mix, 1, { w: lerp(6, 4.6, fm), s: lerp(1.2, 1, fm), thin: lerp(9, 7, fm) });
    }
    // a comet glides along the wave under the pillars
    const wc = P(t, WAVE_RUN[0], WAVE_RUN[1]);
    if (fm <= 0 && wc > 0 && wc < 1) {
      const f = E.ioS(wc) * (WAVE.length - 1), n = Math.floor(f), q0 = WAVE[n], q1 = WAVE[Math.min(WAVE.length - 1, n + 1)];
      comet(cb, lerp(q0[0], q1[0], f - n) + SX, lerp(q0[1], q1[1], f - n), 1.1, Math.sin(wc * Math.PI) * 1.1);
    }
    if (fm <= 0) for (let i = 0; i < 6; i++) {
      const x = STRIP.x0 + i * STRIP.dx + SX, y = STRIP.y;
      if (x < -60 || x > 1140) continue;
      const at = i === 0 ? T.dockEnd - .25 : ARR(i) - PAN * .05;
      node(cb, x, y, 15, STOPS[i].node, E.outB(P(t, at - .05, at + .4), 3), fadeIn);
      ripple(cb, x, y, 15, P(t, at, at + 1.1));
    }
  }
  // poster nodes (finale) + a last comet that runs the full line during the hold
  if (t >= T.fin) {
    const cp = E.ioS(P(t, T.fin + 1.75, T.fin + 3.85));
    if (cp > 0 && cp < 1) {
      const path = []; POSTER_SEGS.forEach((sg, i) => sg.forEach((q, k) => { if (i === 0 || k > 0) path.push(q); }));
      const f = cp * (path.length - 1), n = Math.floor(f), q0 = path[n], q1 = path[Math.min(path.length - 1, n + 1)];
      comet(cb, lerp(q0[0], q1[0], f - n), lerp(q0[1], q1[1], f - n), 1, Math.sin(cp * Math.PI) * 1.2);
    }
    PO.nodes.forEach(([x, y], i) => {
      const at = T.fin + .75 + i * .085;
      node(cb, x, y, 10.5, STOPS[i].node, E.outB(P(t, at, at + .45), 3));
      ripple(cb, x, y, 10, P(t, at + .05, at + .95));
      const pass = T.fin + 1.75 + (T.fin + 3.85 - T.fin - 1.75) * PU(i);
      ripple(cb, x, y, 10, P(t, pass, pass + .9), .9);
    });
  }

  /* ---------- ACT 4: slogan + pillars, then poster ---------- */
  {
    const panX = 6 * STRIP.dx + SX;                      // 0 once arrived
    const on = t >= ARR(6) - PAN - .05;
    const fz = E.ioQt(P(t, T.fin, T.fin + 1.1));
    const sl = { x: lerp(9 + panX, 0, fz), y: lerp(-845, 0, fz), s: lerp(2.42, 1, fz) };
    S(L.slogan, { x: sl.x, y: sl.y, s: sl.s, o: on ? 1 : 0 });
    L.sl.forEach((e, k) => { const p = E.outQt(P(t, ARR(6) - PAN * .75 + k * .2, ARR(6) + .45 + k * .2)); S(e, { y: lerp(115, 0, p) }); });
    const pr = { x: lerp(-418 + panX, 0, fz), y: lerp(-318, 0, fz), s: lerp(1.65, 1, fz) };
    S(L.prow, { x: pr.x, y: pr.y, s: pr.s, o: on ? 1 : 0 });
    L.pil.forEach((p, k) => {
      const q = P(t, ARR(6) + .55 + k * .16, ARR(6) + 1.25 + k * .16);
      S(p.root, { y: lerp(26, 0, E.outQt(q)), o: E.outC(q) });
      const hit = P(t, WAVE_PASS[k], WAVE_PASS[k] + .55);
      S(p.ic, { s: lerp(.35, 1, E.outB(q, 2.2)) * (1 + .09 * Math.sin(Math.PI * hit)) });
    });
    L.psep.forEach((e, k) => S(e, { sy: E.outQt(P(t, ARR(6) + .9 + k * .12, ARR(6) + 1.6 + k * .12)), o: 1 }));
    S(L.pdiv, { sy: E.outQt(P(t, T.fin + .55, T.fin + 1.2)), o: t >= T.fin ? 1 : 0 });
    S(L.ribbon, { o: E.ioS(P(t, T.fin + .2, T.fin + 1.2)) });
  }

  /* ---------- poster small cards ---------- */
  L.small.forEach((c, i) => {
    const q = P(t, T.fin + .6 + i * .085, T.fin + 1.3 + i * .085);
    S(c.root, { y: lerp(-34, 0, E.outQt(q)), s: lerp(.94, 1, E.outQt(q)), o: E.outC(q) });
  });
}
const PU = i => Math.acos(1 - 2 * (i / 5)) / Math.PI; // pulse eased-arrival fraction at city i
const INV_IOC = y => (y < .5 ? Math.cbrt(y / 4) : 1 - Math.cbrt(2 * (1 - y)) / 2);
function stripS(t) { let s = 0; for (let i = 1; i <= 6; i++) s += E.ioC(P(t, ARR(i) - PAN, ARR(i))); return s; }
/* peak on-screen speed (px/s) at time t — drives adaptive motion-blur sampling in the renderer */
function speedAt(t) {
  const dt = 1 / 480, d = f => Math.abs(f(t + dt) - f(t - dt)) / (2 * dt);
  let v = d(stripS) * STRIP.dx;
  v = Math.max(v, d(x => E.ioQt(P(x, T.fin, T.fin + 1.1))) * 900);                       // poster assembly
  v = Math.max(v, d(x => E.ioC(P(x, T.morph, T.morph + 1.3))) * 520);                      // map -> globe
  v = Math.max(v, d(x => E.ioQt(P(x, T.dock, T.dockEnd - BEAT * .5))) * 420);              // globe docks
  v = Math.max(v, d(x => E.ioC(P(x, T.morph - BEAT * .5, T.morph + BEAT * .9))) * 60);     // title exit
  for (const h of T.head) v = Math.max(v, d(x => E.outQt(P(x, h, h + .85))) * 142);
  for (let k = 0; k < 3; k++) v = Math.max(v, d(x => E.outQt(P(x, T.fin + .35 + k * .09, T.fin + 1.15 + k * .09))) * 142);
  for (let i = 0; i < 6; i++) {
    const a = i ? ARR(i) : T.dockEnd;
    v = Math.max(v, d(x => E.outQt(P(x, i ? a - PAN * .45 : a - BEAT, a + .45))) * 104);
  }
  for (let k = 0; k < 3; k++) v = Math.max(v, d(x => E.outQt(P(x, ARR(6) - PAN * .75 + k * .2, ARR(6) + .45 + k * .2))) * 115 * 2.42);
  for (let k = 0; k < 6; k++) v = Math.max(v, d(x => E.outQt(P(x, T.fin + .6 + k * .085, T.fin + 1.3 + k * .085))) * 34);
  return v;
}
let LABEL_POS = null;
function placeLabels() { // choose label slots that avoid the route, nodes and each other
  const t = T.pulseEnd, gg = globeGeom(t), rt = globeRot(t);
  const rp = [].concat(...routePts(gg.cx, gg.cy, gg.R, rt)), cp = cityPts(gg.cx, gg.cy, gg.R, rt);
  const boxes = [];
  LABEL_POS = cp.map((c, i) => {
    const w = Math.ceil(Math.max(L.glab[i].querySelector('.c').scrollWidth, L.glab[i].querySelector('.r').scrollWidth)) + 4, h = 64;
    let best = null;
    for (let a = 0; a < 24; a++) {
      const ang = a / 24 * TAU, dx = Math.cos(ang), dy = Math.sin(ang), d = 22;
      const bx = c[0] + dx * d + (dx < -.35 ? -w : dx > .35 ? 0 : -w / 2);
      const by = c[1] + dy * d + (dy < -.35 ? -h : dy > .35 ? 0 : -h / 2);
      let cost = 0;
      for (const q of rp) if (q[2] && q[0] > bx - 8 && q[0] < bx + w + 8 && q[1] > by - 8 && q[1] < by + h + 8) cost += 1;
      for (const b of boxes) if (bx < b[0] + b[2] + 10 && bx + w + 10 > b[0] && by < b[1] + b[3] + 6 && by + h + 6 > b[1]) cost += 300;
      for (const c2 of cp) if (c2 !== c && c2[0] > bx - 16 && c2[0] < bx + w + 16 && c2[1] > by - 16 && c2[1] < by + h + 16) cost += 120;
      if (bx < 24 || bx + w > 1056 || by < 240 || by + h > 1240) cost += 600;
      cost += Math.abs(dy) * .8;
      if (!best || cost < best.cost) best = { cost, bx, by, dx };
    }
    boxes.push([best.bx, best.by, w, h]);
    return { ox: best.bx - c[0], oy: best.by - c[1], w, align: best.dx < -.35 ? 'right' : best.dx > .35 ? 'left' : 'center' };
  });
}

/* shrink a card title only if it would overflow its card (e.g. "New Zealand" on the narrow poster cards) */
function fitNames() {
  const fit = (e, avail) => {
    const fs = parseFloat(getComputedStyle(e).fontSize), w = e.scrollWidth;
    if (w > avail) e.style.fontSize = (Math.floor(fs * avail / w * 10) / 10) + 'px';
  };
  L.small.forEach(c => { const e = c.root.querySelector('.city'), pn = c.root.querySelector('.panel'); fit(e, pn.clientWidth - e.offsetLeft - 8); });
  L.big.forEach(c => { c.root.style.display = 'block'; fit(c.city, 720 - 41 - 40); });
}
window.renderFrame = renderFrame;
window.speedAt = speedAt;
window.TL.WAVE_PASS = WAVE_PASS; window.TL.WAVE_RUN = WAVE_RUN;
window.ready = (async () => {
  build();
  L.small.forEach((c, i) => { c.desc.innerHTML = SMALL_DESC[i]; });
  await document.fonts.ready;
  await Promise.all([...document.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
  await Promise.all([...document.images].map(im => im.decode ? im.decode().catch(() => 0) : 0));
  fitNames();
  READY = true;
  const q = new URLSearchParams(location.search);
  renderFrame(q.has('t') ? parseFloat(q.get('t')) : T.end);
  return true;
})();
})();
