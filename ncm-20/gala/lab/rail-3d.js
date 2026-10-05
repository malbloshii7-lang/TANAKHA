'use strict';
// The Etihad Rail hero scene in engraved 3D (lab/rail-3d.html): the same train, embankment and skyline as
// scenes/plate-rail.js, built in true 3D and filmed as one shot chain in three beats, whose keys lab/rail-3d-shot.js
// holds (lab/bed.py reads the same keys, so the drums and the diesel are placed from the picture). Nothing but the
// camera is new: the SD70-family locomotive (22.6 m, about 5 m high, six axles, light grey with broad bands engraved
// as hatching, no logo), open hopper wagons of stone, the double track on its embankment with the ditch and berm on
// the windward (north) side, the fence, the date palms of the Al Dhaid oasis, and the Hajar front computed from
// terrain (25.29 N, 55.86 E), in layers by distance. The train runs west, away from the Hajar, at 80 km/h (22.2 m/s);
// the sun is in the south-west, late afternoon. The camera watches from outside the right-of-way fence on a long lens,
// stands at eye height 14 m from the near track for the pass, then rises as on a crane to an oblique view (never a
// top-down view).
const R3 = { ZF: 2.5, ZR: 2.8, v: R3_SHOT.v, L0: 22.6, LH: 15.0, GAP: 1.0, N: 50 };
// the shot that holds film time t (each shot cuts to the next at its t1)
const r3shot = t => R3_SHOT.shots.find(s => t < s.t1) || R3_SHOT.shots[R3_SHOT.shots.length - 1];
// the front of the train (its world x) at film time t: each shot sets where the train is on its first frame
const r3head = t => { const s = r3shot(t); return s.head0 - R3.v * (t - s.t0); };
// a smooth camera path through the shot's keys: cubic Hermite in time, velocity continuous; the camera is at rest at
// the shot's ends and at every key marked ease, so a held frame is truly held
function r3key(t, name) {
  const K = r3shot(t).keys, n = K.length;
  if (t <= K[0].t) return K[0][name];
  if (t >= K[n - 1].t) return K[n - 1][name];
  let i = 1; while (K[i].t < t) i++;
  const a = K[i - 1], b = K[i], h = b.t - a.t, u = (t - a.t) / h;
  const tan = j => { if (j === 0 || j === n - 1 || K[j].ease) return [].concat(K[j][name]).map(() => 0); const p = [].concat(K[j - 1][name]), q = [].concat(K[j + 1][name]); return p.map((v, k) => (q[k] - v) / (K[j + 1].t - K[j - 1].t)); };
  const pa = [].concat(a[name]), pb = [].concat(b[name]), ma = tan(i - 1), mb = tan(i);
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
  const out = pa.map((v, k) => h00 * v + h10 * h * ma[k] + h01 * pb[k] + h11 * h * mb[k]);
  return Array.isArray(a[name]) ? out : out[0];
}
// the convex hull of points in the plane (monotone chain)
function r3hull(p) {
  const s = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  s.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
  s.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
scene({
  id: 'rail3d',
  init() {
    const src = {}; SCENE_DEFS.get('rail').init.call(src); // borrow the plate's palms
    this.palms = src.palms.map(p => ({ x: p.dist * Math.sin(p.az * Math.PI / 180), y: p.dist * Math.cos(p.az * Math.PI / 180), h: p.h, lean: p.lean }));
    const r = rng(303);
    this.marks = []; // the plain: tufts and stones, thinning into the distance
    for (let k = 0; k < 7000; k++) {
      const x = -900 + r() * 3600, y = -700 + r() * 1900;
      if (y > -26 && y < 22) continue;
      const len = 1.5 + r() * 3.5, a = Math.PI / 2 + (r() - 0.5) * 0.5;
      this.marks.push([[x, y, 0], [x + len * Math.cos(a), y + len * Math.sin(a), 0]]);
    }
    this.heaps = Array.from({ length: R3.N }, () => 0.25 + 0.2 * r());
  },
  draw(lt) {
    const t = lt, C = r3key(t, 'C'), cam = E3.camera(C, r3key(t, 'L'), r3key(t, 'f'));
    // the Hajar front at infinity, and the horizon (with a faint dust veil above it)
    const dir = (az, el) => { const a = az * Math.PI / 180, e = el * Math.PI / 180; return [Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e)]; };
    const hz = []; for (let az = -30; az <= 210; az += 2) { const p = E3.projDir(dir(az, 0)); if (p) hz.push(p); }
    for (let k = 1; k < 26; k++) {
      const el = 0.35 + 0.05 * Math.pow(k, 1.9), pts = [];
      for (let az = -30; az <= 210; az += 3) { const p = E3.projDir(dir(az, el)); if (p) pts.push(p); }
      if (pts.length > 1) stroke(new P(pts), 1, SEPIA, 0.7, 0.3 * (1 - k / 26), [18 + k * 3, 6 + k]);
    }
    // the Hajar front at infinity in its computed layers (lab/rail-3d-ridges.js), far to near: each range masks the
    // ranges behind it and is engraved a little darker, as it stands nearer through the haze; the two nearest layers
    // are the plain rising to the mountains' foot, hatched level
    const RG = R3_RIDGES, nL = RG.layers.length;
    const RS = [[0, 5.0, 0.18, 0.8, 0.3], [0, 5.0, 0.18, 0.8, 0.3], [-1.2, 4.6, 0.3, 1.0, 0.5], [-1.3, 5.2, 0.28, 1.0, 0.5], [-1.3, 6.0, 0.2, 0.9, 0.4]];
    for (let k = nL - 1; k >= 0; k--) {
      const top = [], foot = [];
      RG.layers[k].forEach((el, i) => {
        const az = RG.az0 + i * RG.daz, p = E3.projDir(dir(az, Math.max(0, el))), q = E3.projDir(dir(az, 0));
        if (p && q && p[0] > -80 && p[0] < W + 80) { top.push(p); foot.push(q); }
      });
      if (top.length < 2) continue;
      const [ang, gap, ha, lw, la] = RS[k], poly = new P(top.concat(foot.slice().reverse()), true);
      const bb = [Math.max(0, top[0][0]), Math.max(0, Math.min(...top.map(p => p[1])) - 4), Math.min(W, top[top.length - 1][0]), Math.min(H, Math.max(...foot.map(p => p[1])) + 4)];
      mask(poly); hatch(poly, bb, ang, gap, 1, SEPIA, 0.7, ha, 811 + k); stroke(new P(top), 1, INK, lw, la);
    }
    // the dust over the plain, thickest at the mountains' foot
    [[0, 0.45, 0.14], [0.45, 0.9, 0.07]].forEach(([e0, e1, a], j) => {
      const lo = [], hi = []; for (let az = 20; az <= 160; az += 0.5) { const p = E3.projDir(dir(az, e0)), q = E3.projDir(dir(az, e1)); if (p && q && q[0] > -80 && q[0] < W + 80) { lo.push(p); hi.push(q); } }
      if (lo.length > 1) hatch(new P(hi.concat(lo.slice().reverse()), true), [0, Math.max(0, Math.min(...hi.map(p => p[1])) - 6), W, Math.min(H, Math.max(...lo.map(p => p[1])) + 6)], 0, 6, 1, OCHRE, 0.7, a, 815 + j);
    });
    if (hz.length > 1) stroke(new P(hz), 1, INK, 0.8, 0.35);
    // the date palms of the Al Dhaid oasis, far off: a trunk, and a crown of fronds (3.6-4.4 m) arching out and down
    // all round, some young and upright, the old ones drooping (drawn in 3D, so a long lens never flattens them to poles)
    this.palms.forEach((p, j) => {
      const top = [p.x + p.lean * p.h, p.y, p.h], d = E3.depth(top);
      if (d < 5) return;
      const s = E3.clipSeg([p.x, p.y, 0], top);
      if (!s || s[1][0] < -60 || s[1][0] > W + 60) return;
      const k = cam.f / d;
      stroke(new P(s), 1, INK, clamp(0.5 * k, 0.8, 2.4), 0.5);
      for (let i = 0; i < 12; i++) {
        const a = i * 2.39996 + j, th = 0.9 - 1.3 * ((i * 7) % 12) / 11, L = 3.6 + 0.4 * ((i * 5) % 3), pts = [];
        for (let u = 0; u <= 1.001; u += 0.2) pts.push([top[0] + L * u * Math.cos(a) * Math.cos(th), top[1] + L * u * Math.sin(a) * Math.cos(th), top[2] + L * u * Math.sin(th) - 1.6 * u * u]);
        E3.line(pts, INK, clamp(0.25 * k, 0.6, 1.3), 0.5);
      }
    });
    // the plain
    E3.segments(this.marks.map(([a, b]) => [a, b, 0.62 * clamp(1 - E3.depth(a) / 2600)]), SEPIA, 0.9);
    // the embankment in its strips, far side first: the ditch (sand held in it), its far wall, the berm, the far slope,
    // the formation (ballast) and the near slope; every strip is one face, so no seams; the long edges are inked apart
    const X0 = -1500, X1 = 4000, zf = R3.ZF;
    const strip = (y0, z0, y1, z1) => [[X0, y0, z0], [X1, y0, z0], [X1, y1, z1], [X0, y1, z1]];
    E3.face(strip(16, -0.4, 19, -0.4), { tone: 0.2, shade: 0.3, fillCol: OCHRE, fillA: 0.28, hatchCol: SEPIA, edges: false }, 821);
    E3.face([[X0, 19, -0.4], [X1, 19, -0.4], [X1, 19, 0], [X0, 19, 0]], { tone: 0.1, shade: 0.5, hatchCol: SEPIA, edges: false }, 822);
    E3.face(strip(13, 0, 16, 0.6), { tone: 0.05, shade: 0.4, hatchCol: SEPIA, edges: false }, 823);
    E3.face(strip(8, zf, 13, 0), { tone: 0.05, shade: 0.5, hatchCol: SEPIA, edges: false }, 824);
    E3.face(strip(-3.5, zf, 8, zf), { tone: 0.25, shade: 0.5, hatchCol: SEPIA, edges: false }, 825);
    E3.face(strip(-8.5, 0, -3.5, zf), { tone: 0.18, shade: 0.5, hatchCol: SEPIA, edges: false }, 826);
    [[-8.5, 0, 0.55], [-3.5, zf, 0.6], [8, zf, 0.45], [13, 0, 0.3], [16, 0.6, 0.35], [19, 0, 0.3]].forEach(([y, z, a]) => E3.line([[X0, y, z], [X1, y, z]], INK, 0.9, a));
    // the sleepers near the camera, then the rails of both tracks
    const sl = [];
    for (let x = Math.floor(C[0] - 40); x < C[0] + 320; x += 0.65) [0, 4.5].forEach(yc => sl.push([[x, yc - 1.3, R3.ZR - 0.18], [x, yc + 1.3, R3.ZR - 0.18], 0.5 * clamp(1 - Math.abs(x - C[0]) / 330)]));
    E3.segments(sl, SEPIA, 1);
    [5.22, 3.78, 0.72, -0.72].forEach(y => E3.line([[X0, y, R3.ZR], [X1, y, R3.ZR]], INK, 1.1, 0.8));
    // the train's shadows, cast north-east by the low sun onto the formation (laid over the ballast and the rails)
    const xs0 = r3head(t), SUN = E3.SUN;
    for (let k = 0, xx = xs0; k <= R3.N; k++) {
      const len = k === 0 ? R3.L0 : R3.LH, top = R3.ZR + (k === 0 ? 4.9 : 3.9 + 0.3), pts = [];
      [xx, xx + len].forEach(x => [-1.6, 1.6].forEach(y => [R3.ZR + 1.0, top].forEach(z => { const u = (z - R3.ZF) / SUN[2]; pts.push([x - SUN[0] * u, y - SUN[1] * u]); })));
      xx += len + R3.GAP;
      const hull = r3hull(pts).map(([x, y]) => [x, y, R3.ZF + 0.02]);
      const sp = E3.runs(hull.concat([hull[0]])).flat();
      if (sp.length > 2 && E3.depth(E3.centroid(hull)) < 1500) {
        const path = new P(sp, true), bb = [Math.min(...sp.map(q => q[0])), Math.min(...sp.map(q => q[1])), Math.max(...sp.map(q => q[0])), Math.max(...sp.map(q => q[1]))];
        fill(path, SEPIA, 0.16); hatch(path, bb, -0.35, 3.2, 1, INK, 0.6, 0.22, 850 + k);
      }
    }
    // the train: vehicles far to near; within each, the parts from the ground up and far to near
    const xf = r3head(t), vehicles = [];
    let x = xf;
    for (let k = 0; k <= R3.N; k++) { const len = k === 0 ? R3.L0 : R3.LH; vehicles.push({ k, x, len }); x += len + R3.GAP; }
    vehicles.map(v => ({ v, d: E3.depth([v.x + v.len / 2, 0, R3.ZR + 2]) })).filter(o => o.d > -30 && o.d < 2600).sort((a, b) => b.d - a.d)
      .forEach(o => (o.v.k === 0 ? this.loco(o.v.x) : this.hopper(o.v.x, this.heaps[o.v.k - 1], o.d)));
    // the right-of-way fence on the camera's side, nearest of all: posts every 4 m, two wires
    const near = [], far = [];
    for (let px = -1500; px < 4000; px += 4) { const d = E3.depth([px, -22, 0.75]); if (d > 0.5) (d < 70 ? near : far).push([[px, -22, 0], [px, -22, 1.5], 0.7 * clamp(1 - d / 900), d]); }
    E3.segments(far.map(s => s.slice(0, 3)), INK, 0.8);
    near.forEach(([a, b, al, d]) => { const s = E3.clipSeg(a, b); if (s) stroke(new P(s), 1, INK, clamp(60 / d, 0.8, 3), 0.75); });
    [1.4, 0.8].forEach(z => E3.line([[X0, -22, z], [X1, -22, z]], INK, 0.8, 0.45));
  },
  // the locomotive: its front (west end) at world x = xf; q is measured from the front
  loco(xf) {
    const Z = R3.ZR, L = R3.L0, B = (q0, q1, y0, y1, z0, z1) => E3.box(xf + q0, xf + q1, y0, y1, Z + z0, Z + z1);
    const C = E3.cam().C, byDepth = parts => parts.map(p => ({ p, d: E3.depth(E3.centroid(p.f.map(E3.centroid))) })).sort((a, b) => b.d - a.d).map(o => o.p);
    const dark = { tone: 0.5, shade: 0.4, lw: 1 }, grey = { tone: 0.04, shade: 0.55, lw: 1.3 };
    // the running gear and the fuel tank, the sand plough, the frame
    const bogies = [[1.5, 6.9], [L - 6.9, L - 1.5]];
    byDepth(bogies.map(([a, b]) => ({ f: B(a, b, -1.35, 1.35, 0.15, 0.95), st: dark })).concat([{ f: B(7.4, L - 7.4, -1.25, 1.25, 0.35, 1.0), st: { tone: 0.35, shade: 0.45, lw: 1 } }]))
      .forEach((o, i) => E3.solid(o.f, o.st, 700 + i * 50));
    if (C[1] < -1.4) [2.3, 4.2, 6.1, L - 6.1, L - 4.2, L - 2.3].forEach(q => this.wheel(xf + q, -1.4));
    const plough = [[[-0.7, -1.5, 0.12], [-0.7, 1.5, 0.12], [0, 1.6, 1.0], [0, -1.6, 1.0]], [[0, -1.5, 0.12], [0, 1.5, 0.12], [0, 1.6, 1.0], [0, -1.6, 1.0]], [[-0.7, -1.5, 0.12], [-0.7, 1.5, 0.12], [0, 1.5, 0.12], [0, -1.5, 0.12]],
      [[-0.7, -1.5, 0.12], [0, -1.5, 0.12], [0, -1.6, 1.0]], [[-0.7, 1.5, 0.12], [0, 1.5, 0.12], [0, 1.6, 1.0]]].map(f => f.map(([q, y, z]) => [xf + q, y, Z + z]));
    E3.solid(plough, { tone: 0.45, shade: 0.4, lw: 1 }, 760);
    E3.solid(B(0, L + 0.3, -1.6, 1.6, 1.0, 1.3), { tone: 0.55, shade: 0.4, lw: 1 }, 770);
    // the long hood, the cab and the short nose, far to near
    const hood = B(6.2, L - 0.4, -1.05, 1.05, 1.3, 4.55), cab = B(2.7, 6.2, -1.5, 1.5, 1.3, 4.9), nose = B(0.2, 2.7, -1.0, 1.0, 1.3, 3.3);
    byDepth([{ f: hood, n: 'hood' }, { f: cab, n: 'cab' }, { f: nose, n: 'nose' }]).forEach(o => {
      const r = E3.solid(o.f, grey, o.n === 'hood' ? 780 : o.n === 'cab' ? 790 : 800);
      // the faces drawn, in E3.box order: bottom, top, south, east, north, west
      const south = r[2], west = r[5], top = r[1];
      if (o.n === 'hood') {
        if (south) {
          // the broad band (dense cross-hatching, never red ink), the radiator grille, the access doors
          const band = [[xf + 6.2, -1.05, Z + 1.6], [xf + L - 0.4, -1.05, Z + 1.6], [xf + L - 0.4, -1.05, Z + 2.4], [xf + 6.2, -1.05, Z + 2.4]];
          E3.face(band, { n: [0, -1, 0], tone: 0.62, shade: 0.2, noHatch: false, hdir: [1, 0, 1], lw: 0.8, edgeA: 0.6 }, 811);
          const g = []; for (let q = L - 5.4; q < L - 0.9; q += 0.32) g.push([[xf + q, -1.06, Z + 2.7], [xf + q, -1.06, Z + 4.4], 0.55]);
          for (let q = 7; q < L - 6; q += 2.6) g.push([[xf + q, -1.06, Z + 2.6], [xf + q, -1.06, Z + 4.4], 0.4]);
          E3.segments(g, INK, 0.6);
        }
        if (top) [L - 1.6, L - 3.5].forEach(q => this.ring([xf + q, 0, Z + 4.56], 0.8, 'z', 0.7));
      }
      if (o.n === 'cab') {
        if (south) E3.face([[xf + 3.1, -1.51, Z + 3.4], [xf + 5.8, -1.51, Z + 3.4], [xf + 5.8, -1.51, Z + 4.4], [xf + 3.1, -1.51, Z + 4.4]], { n: [0, -1, 0], fillCol: BLUE, fillA: 0.35, noHatch: true, lw: 0.9 }, 812);
        if (west) [[-1.35, -0.1], [0.1, 1.35]].forEach(([a, b]) => E3.face([[xf + 2.69, a, Z + 3.5], [xf + 2.69, b, Z + 3.5], [xf + 2.69, b, Z + 4.5], [xf + 2.69, a, Z + 4.5]], { n: [-1, 0, 0], fillCol: BLUE, fillA: 0.4, noHatch: true, lw: 0.9 }, 813));
      }
      if (o.n === 'nose' && west) [-0.55, 0.55].forEach(y => { const c = [xf + 0.19, y, Z + 2.6], d = E3.depth(c); if (d > 1) { const p = E3.proj(c); disc(p[0], p[1], Math.max(1.2, E3.cam().f * 0.17 / d), OCHRE, 0.9); } });
    });
    // the handrails along the walkway on the camera's side
    if (C[1] < -1.6) {
      E3.line([[xf + 6.3, -1.55, Z + 2.3], [xf + L + 0.2, -1.55, Z + 2.3]], INK, 0.8, 0.7);
      const st = []; for (let q = 6.3; q < L; q += 3) st.push([[xf + q, -1.55, Z + 1.3], [xf + q, -1.55, Z + 2.3], 0.65]);
      E3.segments(st, INK, 0.6);
    }
  },
  // an open hopper wagon of stone, its front (west end) at world x = xf
  hopper(xf, heap, d) {
    const Z = R3.ZR, L = R3.LH, B = (q0, q1, y0, y1, z0, z1) => E3.box(xf + q0, xf + q1, y0, y1, Z + z0, Z + z1);
    const C = E3.cam().C, dark = { tone: 0.5, shade: 0.4, lw: 1 };
    [[1.1, 4.1], [L - 4.1, L - 1.1]].map(([a, b]) => ({ a, b, dd: E3.depth([xf + (a + b) / 2, 0, Z]) })).sort((p, q) => q.dd - p.dd)
      .forEach(({ a, b }, i) => E3.solid(B(a, b, -1.35, 1.35, 0.15, 0.95), dark, 900 + i));
    if (C[1] < -1.4 && d < 500) [1.7, 3.5, L - 3.5, L - 1.7].forEach(q => this.wheel(xf + q, -1.4));
    [[4.5, 7.3], [7.7, 10.5]].forEach(([a, b], i) => E3.solid(E3.frustum(xf + a, xf + b, -1.35, 1.35, Z + 0.45, Z + 1.0, 0.8, 0.25), { tone: 0.4, shade: 0.4, lw: 0.9 }, 910 + i));
    E3.solid(B(0.3, L - 0.3, -1.45, 1.45, 1.0, 1.3), { tone: 0.5, shade: 0.35, lw: 0.9 }, 920);
    const body = E3.solid(B(0.3, L - 0.3, -1.5, 1.5, 1.3, 3.9), { tone: 0.12, shade: 0.55, hatchCol: SEPIA, lw: 1.1 }, 930);
    if (body[2] && d < 450) { // the side stakes and the top chord
      const s = []; for (let q = 1.5; q < L - 0.6; q += 1.2) s.push([[xf + q, -1.51, Z + 1.3], [xf + q, -1.51, Z + 3.9], 0.45]);
      E3.segments(s, INK, 0.55);
      E3.line([[xf + 0.3, -1.51, Z + 3.72], [xf + L - 0.3, -1.51, Z + 3.72]], INK, 0.7, 0.6);
    }
    // the stone, heaped a little above the rim (an open tent: no floor, so it never paints over the wagon)
    const zt = Z + 3.9, zc = zt + heap, a0 = xf + 0.8, a1 = xf + L - 0.8, c0 = xf + 1.4, c1 = xf + L - 1.4;
    const tent = [[[a0, -1.5, zt], [a1, -1.5, zt], [c1, 0, zc], [c0, 0, zc]], [[a1, 1.5, zt], [a0, 1.5, zt], [c0, 0, zc], [c1, 0, zc]], [[a0, 1.5, zt], [a0, -1.5, zt], [c0, 0, zc]], [[a1, -1.5, zt], [a1, 1.5, zt], [c1, 0, zc]]];
    const cc = [(a0 + a1) / 2, 0, zt + heap * 0.3];
    tent.forEach((f, i) => { let n; const c = E3.centroid(f), u = E3.sub(f[1], f[0]), v = E3.sub(f[2], f[0]); n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...n); n = n.map(x => x / l); if (E3.dot(n, E3.sub(c, cc)) < 0) n = n.map(x => -x); E3.face(f, { n, tone: 0.2, shade: 0.45, fillCol: OCHRE, fillA: 0.35, hatchCol: SEPIA, hdir: [0, 1, 0], lw: 0.8, edgeA: 0.6 }, 940 + i); });
  },
  wheel(x, y) { this.ring([x, y, R3.ZR + 0.48], 0.48, 'y', 0.85); },
  // a circle in the world (radius r about c, in the plane normal to axis 'y' or 'z'), inked
  ring(c, r, axis, a) {
    const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16 * TAU; pts.push(axis === 'y' ? [c[0] + r * Math.cos(u), c[1], c[2] + r * Math.sin(u)] : [c[0] + r * Math.cos(u), c[1] + r * Math.sin(u), c[2]]); }
    E3.line(pts, INK, clamp(40 / Math.max(1, E3.depth(c)), 0.5, 1.4), a);
  },
});

// The beat's words, in its first beat only (they leave before the cut), above the ranges the long lens raises. s is the
// scene's start in film seconds; RAIL_NAME is set by the page (timeline.js in the film).
function r3words(f, s) {
  levelB(f, s + 1.0, s + R3_SHOT.cut - 0.6, RAIL_NAME.ar + ' · الذيد، الشارقة', RAIL_NAME.en + ' · AL DHAID, SHARJAH', { y: 150 });
  levelA(f, s + 1.4, s + R3_SHOT.cut - 0.6, 'على امتداد البر', 'ACROSS THE LAND', { y: 300 });
}
