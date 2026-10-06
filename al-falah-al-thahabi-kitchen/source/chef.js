// The chef: a proud profile, chin raised, lifting the lid off the rice platter.
// Drawn as tapered ink strokes (centre-lines thickened into filled outlines) so the figure
// reads like a pen drawing yet stays a pure filled vector, like the rest of the emblem.
const f = (n) => +n.toFixed(2);

// --- path sampling -------------------------------------------------------------------------
// Parses absolute M/L/C/Q commands into a polyline of points.
function samplePath(d, step = 1.5) {
  const tok = d.match(/[MLCQ]|-?\d*\.?\d+/g);
  const pts = [];
  let i = 0, cmd = '', cur = [0, 0];
  const num = () => +tok[i++];
  const bez = (p) => {
    const est = p.reduce((s, q, k) => (k ? s + Math.hypot(q[0] - p[k - 1][0], q[1] - p[k - 1][1]) : 0), 0);
    const n = Math.max(4, Math.ceil(est / step));
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      if (p.length === 4) pts.push([u ** 3 * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t ** 3 * p[3][0],
        u ** 3 * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t ** 3 * p[3][1]]);
      else if (p.length === 3) pts.push([u * u * p[0][0] + 2 * u * t * p[1][0] + t * t * p[2][0], u * u * p[0][1] + 2 * u * t * p[1][1] + t * t * p[2][1]]);
      else pts.push([p[0][0] + (p[1][0] - p[0][0]) * t, p[0][1] + (p[1][1] - p[0][1]) * t]);
    }
  };
  while (i < tok.length) {
    if (/[MLCQ]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { cur = [num(), num()]; pts.push(cur); cmd = 'L'; }
    else if (cmd === 'L') { const p = [num(), num()]; bez([cur, p]); cur = p; }
    else if (cmd === 'C') { const p = [cur, [num(), num()], [num(), num()], [num(), num()]]; bez(p); cur = p[3]; }
    else if (cmd === 'Q') { const p = [cur, [num(), num()], [num(), num()]]; bez(p); cur = p[2]; }
  }
  return pts;
}

// Thickens a centre-line into a filled outline whose width swells in the middle and tapers to
// fine points at both ends (taper = fraction of the length used for each end).
function ink(d, w, taper = 0.3, minW = 0.18) {
  const p = samplePath(d);
  const L = [0];
  for (let k = 1; k < p.length; k++) L.push(L[k - 1] + Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]));
  const tot = L[L.length - 1];
  const ease = (x) => (x >= 1 ? 1 : Math.sin((Math.PI / 2) * Math.max(0, x)));
  const left = [], right = [];
  p.forEach((q, k) => {
    const a = p[Math.max(0, k - 1)], b = p[Math.min(p.length - 1, k + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    const s = L[k] / tot;
    const half = (w / 2) * (minW + (1 - minW) * Math.min(ease(s / taper), ease((1 - s) / taper)));
    left.push([q[0] - (ty / tl) * half, q[1] + (tx / tl) * half]);
    right.push([q[0] + (ty / tl) * half, q[1] - (tx / tl) * half]);
  });
  return 'M' + left.concat(right.reverse()).map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

const circle = (cx, cy, r) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;

// --- the figure (scene space, facing left) --------------------------------------------------
const W = 10, w = 6; // main contour and detail stroke weights

const TOQUE = [
  [W, 'M16 -208C40 -206 70 -202 96 -198'], // band, lower edge
  [W, 'M20 -237C44 -234 74 -229 102 -225'], // band, upper edge
  [w, 'M16 -208L20 -237'], // band ends
  [w, 'M96 -198L102 -225'],
  [W, 'M20 -238C8 -262 6 -300 30 -316C40 -350 96 -366 120 -340C150 -338 164 -300 146 -280C136 -262 116 -250 102 -228', 0.12], // crown
  [w, 'M50 -241C45 -264 47 -290 58 -314'], // pleats
  [w, 'M78 -236C78 -260 84 -288 98 -308'],
];
const HEAD = [
  // profile with the chin lifted: brow and a straight proud nose, finer lips, raised chin and jaw
  [W * 0.85, 'M19 -206C13 -198 10 -188 10 -180C10 -174 7 -171 5 -168C-2 -160 -10 -152 -16 -146C-17 -143 -14 -141 -9 -141C-7 -141 -5 -140 -4 -139', 0.1],
  [w * 0.75, 'M-5 -141C-4 -138 -6 -135 -8 -133C-6 -131 -6 -130 -6 -129C-8 -127 -8 -124 -7 -122C-6 -120 -6 -118 -8 -115', 0.15, 0.6],
  [W * 0.85, 'M-8 -117C-12 -110 -8 -102 0 -100C14 -98 28 -96 40 -92', 0.15],
  [W, 'M98 -200C104 -180 102 -152 92 -132C86 -120 86 -104 88 -90', 0.2], // back of the head
  [w, 'M66 -160C76 -166 84 -152 76 -140C72 -134 66 -136 64 -134'], // ear
  [w, 'M9 -180C16 -185 25 -185 33 -181'], // brow, lifted
  [w, 'M13 -167C18 -163 24 -163 29 -167'], // eye, closed in quiet pride
  [w * 0.8, 'M-6 -128C-3 -129 0 -130 2 -132'], // mouth corner, turned up
];
const BODY = [
  [w, 'M36 -92C52 -86 72 -86 90 -92'], // mandarin collar
  [W, 'M32 -74C52 -68 76 -68 94 -76'],
  [w, 'M36 -92C33 -86 32 -80 32 -74'],
  [W, 'M32 -74C14 -54 2 -18 4 30C5 80 12 130 22 190', 0.25], // chest, held high
  [W, 'M92 -88C122 -84 160 -70 184 -40C204 -14 210 40 206 100C204 140 198 170 190 200', 0.3], // back
];
const BUTTONS = [[28, -36], [60, -40], [22, 10], [56, 6], [22, 56], [56, 52]];
const ARM = [
  [W, 'M150 -74C120 -60 84 -38 56 -28C30 -20 -10 -38 -50 -66', 0.15], // sleeve, upper edge
  [W, 'M140 -8C118 6 90 20 62 22C36 24 0 4 -38 -34', 0.15], // sleeve, lower edge
  [w, 'M-50 -66C-48 -54 -43 -42 -38 -34'], // cuff
  [w, 'M-38 -72C-34 -58 -30 -48 -24 -40'],
  // hand closed over the knob: back of the hand, curled fingers, palm returning to the cuff
  [W, 'M-50 -66C-60 -74 -78 -78 -92 -74C-102 -71 -106 -62 -102 -54C-99 -48 -92 -47 -86 -50C-72 -52 -54 -44 -38 -34', 0.12],
  [w, 'M-94 -64C-88 -62 -82 -62 -76 -64'], // fingers
  [w, 'M-90 -56C-84 -55 -79 -56 -74 -58'],
];
// area covered by the raised arm, used to hide the chest lines that pass behind it
const SLEEVE = 'M150 -74C120 -60 84 -38 56 -28C30 -20 -10 -38 -50 -66L-38 -34C0 4 36 24 62 22C90 20 118 6 140 -8Z';

const KNOB = [-96, -33];
// Polished cloche lid, lifted and tilted toward the chef, with a cut-out highlight.
function lid() {
  const dome = 'M-72 74C-72 30 -40 10 0 10C40 10 72 30 72 74Z';
  const rim = 'M-80 74H80C82 74 82 84 78 84H-78C-82 84 -82 74 -80 74Z';
  const shine = ink('M-54 64C-52 44 -38 30 -18 24', 7, 0.35);
  return {
    t: `translate(${KNOB[0]} ${KNOB[1]}) rotate(-14)`,
    parts: [dome + shine, rim, circle(0, 0, 8), 'M-4 6H4V12H-4Z'],
  };
}

// Steam escaping from under the lid: a wave thickened by a tapering width, leaning left as it rises.
function wisp({ x0, y0, L, A, W: ww, cycles, lean }) {
  const N = 90, left = [], right = [];
  const k = Math.PI * 2 * cycles;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const cx = x0 + lean * t + A * Math.sin(k * t) * (0.55 + 0.45 * t);
    const cy = y0 - L * t;
    const dxdt = lean + A * (k * Math.cos(k * t) * (0.55 + 0.45 * t) + 0.45 * Math.sin(k * t));
    const nl = Math.hypot(dxdt, L), nx = L / nl, ny = dxdt / nl;
    const hw = (ww / 2) * Math.sin(Math.PI * t) ** 0.75 * (1 - 0.3 * t);
    left.push([cx + nx * hw, cy + ny * hw]);
    right.push([cx - nx * hw, cy - ny * hw]);
  }
  return 'M' + left.concat(right.reverse()).map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}
const STEAM = [
  { x0: -168, y0: 96, L: 128, A: 9, W: 11, cycles: 1.0, lean: -40 },
  { x0: -198, y0: 118, L: 112, A: 8, W: 10, cycles: 0.9, lean: -34 },
  { x0: -228, y0: 142, L: 92, A: 7, W: 9, cycles: 0.8, lean: -26 },
];

const strokes = (list) => list.map(([wd, d, taper, minW]) => ink(d, wd, taper ?? 0.3, minW));

function figure() {
  return {
    behindArm: [...strokes(TOQUE), ...strokes(HEAD), ...strokes(BODY), ...BUTTONS.map(([x, y]) => circle(x, y, 5.5))],
    arm: strokes(ARM),
    sleeve: SLEEVE,
    lid: lid(),
    steam: STEAM.map(wisp),
  };
}

module.exports = { figure, ink, samplePath, KNOB };
