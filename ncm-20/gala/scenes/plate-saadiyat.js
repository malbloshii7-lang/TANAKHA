'use strict';
// B09 · Rain as a mercy (Revision 4, redrawn in Revision 5; after the seeding and the science of rain): the Saadiyat
// Cultural District, Abu Dhabi, under a light-to-moderate winter rain that eases as the morning sun breaks through, seen
// from a boat at sea at 24.5445 N, 54.3780 E (eye 3 m) looking east-south-east: bearings about 97-125 deg across the
// frame, f = 3850 px, eye level at y 720. Every building stands at its true bearing and angular size (OSM footprints,
// ODbL; heights from the museums and their architects; research of 26 Sep 2026). From left to right:
//   the Guggenheim Abu Dhabi (opens 11 Dec 2026, so open by the ceremony): 2.20 km, bearings 98.3-106.8, ten cones up to
//   88 m over low galleries; the Zayed National Museum: 3.16 km, bearings 111.2-113.0, five wings, the tallest 123 m, its
//   mound hidden by the Saadiyat Grove blocks (2.8 km, bearings 107-115); the Louvre Abu Dhabi: 2.39 km, its dome 180 m
//   across, the crown 40 m and the rim about 18 m above the sea, over its low white galleries; the Abrahamic Family House
//   (three equal cubes, no symbols) behind the Louvre's left side; the Natural History Museum and the Saadiyat end of the
//   Sheikh Khalifa Bridge at the right edge.
//   Checked 28 Sep 2026: ten cones as built, nine clad in stainless-steel mesh and one in onyx and glass (drawn here as
//   the warm translucent one at the centre, where the 2013 design put its stone cone above the atrium), up to 88 m (DCT,
//   28 Jul 2026); the museum's five wings 83-123 m above the sea datum, on a 30 m mound (DCT; Foster + Partners); the
//   three museums' bearings and distances agree with their OSM outlines within 0.3 deg and 20 m.
//   Still to match before the master: which cone and which wing stands where, left to right (no published text gives
//   it; RIBAJ prints Foster + Partners' elevations of the wings, and DCT's July 2026 photographs show the cones).
// The sky is the rain cloud's base, 700 m up, engraved in its own perspective: horizontal lines that swell where the
// cloud is dense and close up toward the horizon (a cloud 4 km away is drawn larger than one 40 km away), drifting
// slowly. The light: at about 08:15 on a winter morning (late December) the sun stands at azimuth 124 deg, 13.7 deg up
// (computed for Abu Dhabi), just above the frame's top right corner. As the rain eases, the rain band's trailing edge
// crosses the sky from the right (the cloud drifts north, to the left) and the sky clears toward the sun: pale shafts
// fan down from its direction, the sea glitters under it at the right edge, the air clears and the dome's crown takes
// the light. No rainbow: it would stand opposite the sun, behind the boat. The light falls from above
// and is pale; nothing glows up from the ground or the horizon.
// The rain is natural and even across the whole district: no single shaft over one building, no lightning, no
// aircraft, no dark columns, nothing orange (in March 2026 drones struck the naval base 1.4 km from the Louvre, and news
// footage showed smoke beside the museum's wings). Nothing here says NCM makes rain; the words say who gives it.
// Lines are at least 1 px and hatch gaps at least 2.5 px here (2 px and 5 px on the 4K master).
const SV = { f: 3850, yE: 720, b0: 111, eye: 3, cloud: 700, shore: 724.5 };
const svX = b => 960 + SV.f * Math.tan((b - SV.b0) * Math.PI / 180);
const svY = (h, d) => SV.yE - (h - SV.eye) * SV.f / d; // a height above the sea (m) at distance d (m)
// the sun (azimuth 124 deg, 13.7 deg up) in the plate's own perspective: x 1849, y -243
const SV_SUN = [svX(124), SV.yE - SV.f * Math.tan(13.7 * Math.PI / 180) / Math.cos(13 * Math.PI / 180)];
// the shafts of light, as seen from the boat: [direction from the sun (deg; 90 is straight down), half-width, strength]
const SV_SHAFTS = [[95, 0.8, 0.5], [101, 1.7, 0.85], [107.5, 0.7, 0.45], [114, 2.3, 1.0], [121.5, 1.0, 0.6], [129, 1.9, 0.7], [136, 0.9, 0.35]];
// the words' places on screen (timeline.js, the rain beat): the place label, then the headline; k is how much the cloud
// thins around them (the headline stands in the clearing anyway)
const SV_WORDS = [{ box: [1200, 285, 1860, 372], t0: 0.4, t1: 8.3, k: 0.7 }, { box: [1080, 318, 1860, 648], t0: 9.9, t1: 16.2, k: 0.3 }];
const svStep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
function svNoise(seed) { // smooth value noise, summed over four octaves (about 0-1, mean 0.5)
  const r = rng(seed), V = new Float32Array(4096);
  for (let i = 0; i < 4096; i++) V[i] = r();
  const h = (i, j) => V[((i * 73856093) ^ (j * 19349663)) & 4095];
  const n2 = (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = h(i, j), b = h(i + 1, j), c = h(i, j + 1), d = h(i + 1, j + 1);
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  };
  return (x, y) => (n2(x, y) * 0.5 + n2(x * 2.03 + 7.1, y * 2.03 + 3.3) * 0.25 + n2(x * 4.1 + 1.7, y * 4.1 + 9.2) * 0.125 + n2(x * 8.3 + 5.5, y * 8.3 + 2.9) * 0.0625) / 0.9375;
}
// hatching clipped to the overlap of several shapes (a face and the side of it away from the light)
function svHatch(clips, box, ang, gap, col, lw, a, seed) {
  if (a <= 0) return;
  const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, n = Math.floor(2 * R / gap), r = rng(seed);
  ctx.save();
  clips.forEach(c => { ctx.beginPath(); c.trace(ctx, 1); ctx.clip(); });
  ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const o = -R + i * gap + (r() - 0.5) * gap * 0.3, px = cx + nx * o, py = cy + ny * o; ctx.moveTo(px - dx * R, py - dy * R); ctx.lineTo(px + dx * R, py + dy * R); }
  ctx.stroke(); ctx.restore();
}
// light laid on the page (screen): pale, warm, never orange
function svGlow(draw, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = 'screen'; draw(); ctx.restore(); }
// the side of a leaning shape away from the light: everything left of its axis (base to top)
const svShade = (bx, by, tx, ty) => { const vx = tx - bx, vy = ty - by, A = [bx - vx * 0.3, by - vy * 0.3], B = [tx + vx * 0.3, ty + vy * 0.3]; return new P([A, B, [B[0] - 400, B[1]], [A[0] - 400, A[1]]], true); };
scene({
  id: 'saadiyat',
  init() {
    const r = rng(417), k = d => SV.f / d; // px a metre at distance d
    // the Guggenheim: low gallery blocks along the whole complex, then ten cones of different sizes and tilts
    const dG = 2200, cG = svX(103.2), mG = k(dG);
    this.gBlocks = [];
    for (let x = svX(98.3); x < svX(106.8) - 10;) {
      const w = (18 + r() * 34) * mG, h = 12 + r() * 13;
      this.gBlocks.push(new P([[x, svY(4, dG)], [x, svY(h, dG)], [Math.min(x + w, svX(106.8)), svY(h, dG)], [Math.min(x + w, svX(106.8)), svY(4, dG)]], true));
      x += w * (0.72 + r() * 0.2);
    }
    // cones: truncated, the wide end up; we look up at them from the boat (their rims are 2 deg above the eye), so each
    // rim shows only as a shallow lower arc; their bases stand in the galleries, which are drawn in front of them
    const cones = [[-152, 60, -10], [-116, 46, 9], [-80, 88, -3], [-44, 72, 12], [-10, 52, -17], [24, 80, 5], [58, 44, 19], [92, 66, -8], [128, 50, 11], [160, 40, -14]];
    this.gCones = cones.map(([dx, h, tilt], i) => {
      const bx = cG + dx * mG, by = svY(10, dG), top = svY(h, dG), rw = (9 + h * 0.13) * mG, bw = (4.5 + h * 0.05) * mG, t = tilt * Math.PI / 180;
      const tx = bx + (by - top) * Math.tan(t), ty = top, rim = [];
      for (let j = 0; j <= 16; j++) { const u = Math.PI * j / 16; rim.push([tx + rw * Math.cos(u) * Math.cos(t), ty + rw * Math.sin(u) * 0.06 + rw * Math.cos(u) * Math.sin(t)]); }
      const body = [[bx - bw, by]].concat(rim.slice().reverse()).concat([[bx + bw, by]]);
      return { body: new P(body, true), mouth: new P(rim), onyx: i === 5, shade: svShade(bx, by, tx, ty) };
    });
    // the Zayed National Museum: five wings rising from behind the Saadiyat Grove blocks, each its own height and lean
    const dZ = 3160, cZ = svX(112.2), mZ = k(dZ);
    // broad, curved blades like feathers, fanned; the tallest (123 m, published) in the middle, the others about 83-110 m
    this.zWings = [[-46, 93, -14], [46, 83, 15], [-22, 110, -7], [24, 102, 8], [0, 123, 1]].map(([dx, h, lean]) => {
      const bx = cZ + dx * mZ, by = svY(30, dZ), tip = svY(h, dZ), L = by - tip, a = lean * Math.PI / 180, w0 = 15 * mZ, sg = Math.sign(lean || 1);
      const edge = (side, frac) => { const pts = []; for (let j = 0; j <= 14; j++) { const u = j / 14, bow = Math.sin(Math.PI * u * 0.9) * 7 * mZ * sg, cx = bx + Math.sin(a) * L * u + bow, w = w0 * Math.pow(1 - u, 0.8) * frac; pts.push([cx + side * w, by - L * u]); } return pts; };
      return { p: new P(edge(-sg, 1).concat(edge(sg, 0.45).reverse()), true), shade: svShade(bx, by, bx + Math.sin(a) * L, tip) };
    });
    // the Saadiyat Grove blocks in front of the museum's mound (opening Q4 2026; heights about G+8)
    const dS = 2800, mS = k(dS);
    this.grove = [];
    for (let x = svX(107);;) {
      const w = (28 + r() * 36) * mS, h = 24 + r() * 14;
      if (x > svX(115)) break;
      this.grove.push({ p: new P([[x, svY(3, dS)], [x, svY(h, dS)], [x + w, svY(h, dS)], [x + w, svY(3, dS)]], true), x, w, top: svY(h, dS) });
      x += w * (0.8 + r() * 0.3);
    }
    // the Abrahamic Family House: three equal cubes on their plinth, behind the Louvre's left side
    const dA = 3210, cA = svX(118.2), mA = k(dA), s = 30 * mA;
    this.afh = [-1, 0, 1].map(j => new P([[cA + j * 1.6 * s - s / 2, svY(4, dA)], [cA + j * 1.6 * s - s / 2, svY(34, dA)], [cA + j * 1.6 * s + s / 2, svY(34, dA)], [cA + j * 1.6 * s + s / 2, svY(4, dA)]], true));
    // the Louvre: the low white galleries across the 300 m museum city, then the dome's lens over them
    const dL = 2390, cL = svX(119.8), mL = k(dL);
    this.lBlocks = [];
    for (let x = cL - 150 * mL; x < cL + 150 * mL;) {
      const w = (10 + r() * 22) * mL, h = 9 + r() * 8;
      this.lBlocks.push(new P([[x, svY(4, dL)], [x, svY(h, dL)], [x + w, svY(h, dL)], [x + w, svY(4, dL)]], true));
      x += w * (0.9 + r() * 0.3);
    }
    const R = 90 * mL, yRim = svY(18, dL), yRimTop = svY(20.5, dL), yCrown = svY(40, dL), lens = [];
    for (let j = 0; j <= 40; j++) { const u = -1 + 2 * j / 40; lens.push([cL + R * u, yRimTop - (yRimTop - yCrown) * (1 - u * u)]); }
    this.dome = new P(lens.concat([[cL + R, yRim], [cL - R, yRim]]), true);
    this.domeArc = new P(lens);
    this.domeCrown = new P(lens.slice(14, 33)); // backlit, the crown takes the light first (the sun is 4 deg right of it)
    this.rim = new P([[cL - R, yRim], [cL + R, yRim]]);
    this.domeShade = new P([[cL - R, yRim], [cL + R, yRim], [cL + R * 0.97, yRim + 2.4], [cL - R * 0.97, yRim + 2.4]], true); // the shadow under its rim
    this.platform = new P([[cL - 160 * mL, svY(4, dL)], [cL + 160 * mL, svY(4, dL)]]);
    // the Natural History Museum and the bridge's Saadiyat end at the right edge, low and faint through the rain
    const dN = 3000, mN = k(dN);
    this.nhm = [[svX(123.2), 26], [svX(124.6), 20]].map(([x, h]) => new P([[x, svY(3, dN)], [x, svY(h, dN)], [x + 55 * mN, svY(h - 4, dN)], [x + 90 * mN, svY(3, dN)]], true));
    this.bridge = new P([[svX(123.2), svY(16, 3650)], [2000, svY(16, 3650)]]);
    this.shore = new P([[-20, SV.shore], [1940, SV.shore]]);

    // the skyline's top edge, read from the silhouettes filled on a scratch sheet: what the sea mirrors
    const sc = document.createElement('canvas'); sc.width = 1920; sc.height = 760;
    const g = sc.getContext('2d'); g.fillStyle = '#000';
    [...this.gBlocks, ...this.gCones.map(c => c.body), ...this.zWings.map(w => w.p), ...this.grove.map(q => q.p), ...this.afh, ...this.lBlocks, this.dome, ...this.nhm]
      .forEach(q => { g.beginPath(); q.trace(g, 1); g.fill(); });
    const px = g.getImageData(0, 0, 1920, 760).data;
    this.top = new Float32Array(1920).fill(-1);
    for (let x = 0; x < 1920; x++) for (let y = 300; y < 740; y++) if (px[(y * 1920 + x) * 4 + 3] > 100) { this.top[x] = y; break; }

    // the sea: engraved rows closing up toward the shore, each a run of long, gently waving strokes
    const rs = rng(418);
    this.sea = [];
    for (let y = SV.shore + 2.6; y < 1092;) {
      const dp = clamp((y - SV.shore) / 356), sp = 2.6 + 11 * Math.pow(dp, 1.6), segs = [];
      for (let x = -40 + rs() * 30; x < 1960;) {
        const x1 = Math.min(1960, x + lerp(320, 120, dp) * (0.5 + rs())), A = 0.3 + 1.8 * dp, kx = 0.012 + rs() * 0.016, ph = rs() * TAU, pts = [];
        for (let xx = x; xx < x1; xx += 8) pts.push([xx, y + A * Math.sin(xx * kx + ph)]);
        pts.push([x1, y + A * Math.sin(x1 * kx + ph)]);
        segs.push({ p: new P(pts), xm: (x + x1) / 2 });
        x = x1 + lerp(3, 34, dp) * (0.4 + rs());
      }
      this.sea.push({ y, dp, segs, w: 1.0 + 0.4 * dp, a: 0.2 + 0.14 * dp });
      y += sp;
    }
    // the museums mirrored in the sea: short strokes along the rows inside the mirrored skyline, broken by ripples
    this.refl = [];
    this.sea.forEach(row => {
      const T = 2 * SV.shore - row.y, jx = Math.round((rs() - 0.5) * (2 + 8 * row.dp)); // each row's image shifted by its ripple
      let x = 0;
      while (x < 1920) {
        if (!(this.top[x] >= 0 && this.top[x] < T)) { x++; continue; }
        const x1 = Math.min(1919, x + 4 + Math.floor(rs() * lerp(26, 10, row.dp)));
        let e = x; while (e < x1 && this.top[e] >= 0 && this.top[e] < T) e++;
        const depth = (row.y - SV.shore) / Math.max(1, SV.shore - this.top[x]); // 0 at the shore, 1 at the mirrored top
        if (e - x >= 2) this.refl.push({ x0: x + jx, x1: e + jx, y: row.y + (rs() - 0.5) * 1.2, dp: row.dp, f: 1 - 0.75 * depth, ph: rs() * TAU });
        x = e + 2 + Math.floor(rs() * 5);
      }
    });
    // the rain's rings on the sea near the boat, and the sun's glitter on the sea under it at the right edge
    this.rings = Array.from({ length: 60 }, () => ({ x: rs() * 1920, y: 850 + rs() * 225, ph: rs() * 1.2, s: 0.7 + rs() * 0.6 }));
    this.glints = Array.from({ length: 320 }, () => {
      const y = SV.shore + 3 + (1080 - SV.shore) * Math.pow(rs(), 1.5), hw = 14 + 0.36 * (y - SV.shore), dp = clamp((y - SV.shore) / 356);
      return { x: SV_SUN[0] + (rs() * 2 - 1) * hw * Math.pow(rs(), 0.5), y, len: 2 + (3 + 8 * dp) * rs(), w: 1 + 0.5 * dp, om: 5 + rs() * 9, ph: rs() * TAU };
    });

    // the rain cloud's base: rows of engraving, their spacing shrinking with the distance at which their line of sight
    // meets the cloud (d = (700 - 3) m x f / (720 - y)); each row keeps its own slight waver
    this.rows = [];
    for (let y = -12; y < SV.yE - 6;) {
      const dT = clamp((SV.yE - y) / SV.yE), sp = 3.6 + 4.8 * Math.pow(dT, 1.2);
      this.rows.push({ y, sp, dT, ph: rs() * TAU, ph2: rs() * TAU });
      y += sp;
    }
    this.noise = svNoise(4170);
    // the cloud banks: the rain cloud's rolls in perspective, the nearer ones higher in the frame, larger and darker; each
    // bank's underside hangs in rounded lobes (its billows seen from below), and each drifts left at its own apparent
    // speed (the nearer, the faster): [lower edge y, depth, lobe width, lobe depth, density, drift px/s, from x, to x]
    const rb = rng(419);
    this.banks = [[614, 40, 55, 6, 0.42, 0.8, -120, 2100], [562, 70, 80, 10, 0.5, 1.2, -120, 1480], [494, 100, 115, 16, 0.56, 1.8, 280, 2100],
      [412, 140, 160, 22, 0.63, 2.6, -120, 1320], [302, 170, 220, 32, 0.69, 3.8, 480, 2100], [172, 200, 300, 44, 0.74, 5.5, -120, 2100],
      [24, 230, 400, 60, 0.78, 7.5, -120, 2100]].map(([y, th, lw, ld, dens, v, x0, x1]) => {
      const lobes = [];
      for (let x = x0 - lw; x < x1 + lw + 200;) { const w = lw * (0.7 + 0.6 * rb()); lobes.push({ x: x + w / 2, w, d: ld * (0.5 + 0.7 * rb()) }); x += w * (0.85 + 0.2 * rb()); }
      return { y, th, dens, v, x0, x1, lobes, tilt: (rb() - 0.5) * 0.03, ph: rb() * TAU };
    });
    this.xs = Array.from({ length: 343 }, (_, i) => -60 + i * 6); // where each row is sampled
    // the rain: a far veil of short strokes, and fewer, longer strokes near the boat
    this.far = Array.from({ length: 1500 }, () => ({ x: -150 + rs() * 2250, ph: rs(), v: 520 + rs() * 260, len: 9 + rs() * 20, a: 0.05 + rs() * 0.07 }));
    this.near = Array.from({ length: 300 }, () => ({ x: -200 + rs() * 2350, ph: rs(), v: 1150 + rs() * 450, len: 45 + rs() * 70, a: 0.07 + rs() * 0.08 }));
    // the air between the boat and the district: a sheet of rain-light, with the clearing and the shafts cut out of it
    this.air = document.createElement('canvas'); this.air.width = W * SCALE; this.air.height = H * SCALE;
  },
  // how strongly a shaft lights the air at plate point (x, y) (0-1)
  shaftAt(x, y) {
    const [sx, sy] = SV_SUN, ang = Math.atan2(y - sy, x - sx) * 180 / Math.PI;
    let v = 0;
    SV_SHAFTS.forEach(([a, hw, s]) => { v = Math.max(v, s * (1 - svStep(hw * 0.5, hw * 1.6, Math.abs(ang - a)))); });
    return v * svStep(90, 330, y) * (1 - 0.45 * svStep(420, SV.yE, y)) * (y < SV.yE ? 1 : 0);
  },
  draw(lt) {
    // the plate is being drawn through the dissolve into it (from -0.5 s), so the dissolve never shows bare paper
    const q = easeInOut(prog(lt, -0.5, 1.4)), bq = easeOut(prog(lt, -0.3, 1.3)), sw = easeOut(prog(lt, -0.4, 1.4));
    // from 7.6 s the rain band's trailing edge crosses from the right and the rain eases; the shafts follow, the air
    // clears, and the sky over the words' column is open before the headline arrives (10.3 s)
    const brk = easeInOut(prog(lt, 7.6, 4.8)), shafts = easeInOut(prog(lt, 8.6, 3.8)), clr = 0.5 + 0.5 * easeInOut(prog(lt, 7.8, 4.8));
    const rain = easeOut(prog(lt, 0.3, 1.2)) * (1 - 0.9 * easeInOut(prog(lt, 7.8, 5.0)));
    // the words' boxes in the plate's coordinates (the camera moves the plate, not the words): the cloud thins and the
    // rain stops short around them, as an engraver leaves the lettering's ground clear
    const m = ctx.getTransform(), cs = m.a / SCALE, ce = m.e / SCALE, cf = m.f / SCALE;
    const words = SV_WORDS.map(w => ({ b: [(w.box[0] - ce) / cs, (w.box[1] - cf) / cs, (w.box[2] - ce) / cs, (w.box[3] - cf) / cs], k: w.k, a: clamp((lt - w.t0) / 0.5) * clamp((w.t1 - lt) / 0.4) })).filter(w => w.a > 0);
    const box = (x, y, b, f) => Math.hypot(Math.max(b[0] - x, 0, x - b[2]), Math.max(b[1] - y, 0, y - b[3])) / f; // 0 inside
    const oval = (x, y, b, f) => ((x - (b[0] + b[2]) / 2) / ((b[2] - b[0]) / 2 + f)) ** 2 + ((y - (b[1] + b[3]) / 2) / ((b[3] - b[1]) / 2 + f)) ** 2;
    const thin = (x, y) => words.reduce((v, w) => Math.max(v, w.a * w.k * (1 - svStep(0.3, 1, oval(x, y, w.b, 90)))), 0); // the cloud, in a soft oval
    const clear = (x, y, f) => words.reduce((v, w) => Math.max(v, w.a * (1 - svStep(0, 1, box(x, y, w.b, f)))), 0); // the rain, just clear of the letters

    // 1 · the cloud's base, engraved: each row a ribbon that swells with the cloud's density and tapers to a point
    // each bank's underside along the row samples, this frame (the lobes drifting)
    const under = this.banks.map(b => this.xs.map(x => {
      const xs = x + b.v * lt;
      let l = 0;
      for (const o of b.lobes) { const u = (xs - o.x) / (0.42 * o.w); if (u > -2.6 && u < 2.6) l = Math.max(l, o.d * Math.exp(-u * u)); } // rounded, overlapping billows
      return b.y + b.tilt * (x - 960) + 4 * Math.sin(xs * 0.003 + b.ph) + l;
    }));
    // the rain band's trailing edge, ragged and moving: clear sky to its right
    const front = y => lerp(2150, 900 + 0.22 * y, brk) + (this.noise(y / 70 + lt * 0.04, 3.3) - 0.5) * 300 * Math.min(1, brk * 3);
    this.rows.forEach(row => {
      const path = new Path2D(); let run = [];
      const flush = () => {
        if (run.length > 1) {
          const [x0, y0] = run[0], [xn, yn] = run[run.length - 1];
          path.moveTo(x0 - 5, y0);
          run.forEach(([x, y, w]) => path.lineTo(x, y - w / 2));
          path.lineTo(xn + 5, yn);
          for (let i = run.length - 1; i >= 0; i--) path.lineTo(run[i][0], run[i][1] + run[i][2] / 2);
          path.closePath();
        }
        run = [];
      };
      const fx = front(row.y), haze = 0.17 + 0.2 * svStep(540, 700, row.y); // a grey veil between the banks, thicker low down
      this.xs.forEach((x, i) => {
        let D = haze;
        this.banks.forEach((b, j) => {
          const e = under[j][i] - row.y; // how far above the bank's underside this row runs here
          if (e < 0 || e > b.th) return;
          const ends = svStep(b.x0, b.x0 + 160, x) * (1 - svStep(b.x1 - 160, b.x1, x));
          D = Math.max(D, b.dens * (1 - 0.45 * svStep(0, b.th, e)) * (1 - svStep(b.th * 0.6, b.th, e)) * ends);
        });
        D *= (0.88 + 0.24 * this.noise((x + 3 * lt) / 160, row.y / 38)) * (1 - 0.95 * svStep(-170, 170, x - fx)) * (1 - thin(x, row.y)) * (1 - 0.15 * brk);
        const w = Math.min(row.sp - 2.5, Math.max(1, D * row.sp * 0.85));
        if (D > 0.12) run.push([x, row.y + 1.1 * Math.sin(x * 0.004 + row.ph) + 0.5 * Math.sin(x * 0.013 + row.ph2) + 1.5 * (D - 0.45) * row.sp / 6, w]);
        else flush();
      });
      flush();
      ctx.save(); ctx.globalAlpha = SA * q * lerp(0.42, 0.74, row.dT); ctx.globalCompositeOperation = BLEND; ctx.fillStyle = SEPIA; ctx.fill(path); ctx.restore();
    });

    // 2 · the far shore and the museums, farthest first, each masked so the ones in front hide the ones behind; the air
    // veils them in the rain (outlines and tone come up as it clears), and the side of each away from the light is darker
    const oa = 0.5 + 0.5 * clr, ha = 0.6 + 0.4 * clr;
    this.zWings.forEach((w, i) => { mask(w.p); hatch(w.p, [940, 560, 1150, 700], -1.45, 3.4, bq, SEPIA, 1, 0.16 * ha, 441 + i); svHatch([w.p, w.shade], [940, 560, 1150, 700], -1.1, 3.0, SEPIA, 1, 0.14 * ha, 461 + i); stroke(w.p, bq, INK, 1.1, 0.85 * oa); });
    this.grove.forEach(g => { mask(g.p); hatch(g.p, [g.x, g.top, g.x + g.w, 725], 0, 3.4, bq, SEPIA, 1, 0.14 * ha, 442); stroke(g.p, bq, INK, 1, 0.5 * oa); });
    this.afh.forEach(c => { mask(c); stroke(c, bq, INK, 1, 0.45 * oa); });
    this.lBlocks.forEach(b => { mask(b); stroke(b, bq, INK, 1, 0.55 * oa); });
    mask(this.dome);
    hatch(this.dome, [1380, 650, 1730, 700], 0.52, 3.0, bq, INK, 1, 0.16 * ha, 443);
    hatch(this.dome, [1380, 650, 1730, 700], -0.52, 3.0, bq, INK, 1, 0.13 * ha, 444); // the lattice of its eight layers, as texture
    fill(this.domeShade, INK, 0.5 * bq * oa);
    stroke(this.domeArc, bq, INK, 1.4, 0.9 * oa); stroke(this.rim, bq, INK, 1.6, 0.9 * oa); stroke(this.platform, bq, INK, 1, 0.6 * oa);
    // nine cones clad in stainless-steel mesh (a fine cross-hatch), one in onyx and glass (a warm translucent wash)
    this.gCones.forEach((c, i) => {
      mask(c.body);
      if (c.onyx) { fill(c.body, OCHRE, (0.2 + 0.12 * clr) * bq); hatch(c.body, [60, 540, 720, 720], 1.5, 5.0, bq, SEPIA, 1, 0.12 * ha, 447); }
      else { hatch(c.body, [60, 540, 720, 720], 1.5, 3.8, bq, INK, 1, 0.13 * ha, 446); hatch(c.body, [60, 540, 720, 720], 0.35, 4.6, bq, INK, 1, 0.08 * ha, 448); }
      svHatch([c.body, c.shade], [60, 540, 720, 720], 1.2, 3.2, SEPIA, 1, 0.14 * ha, 470 + i);
      stroke(c.body, bq, INK, 1.0, 0.8 * oa); stroke(c.mouth, bq, INK, 1.1, 0.85 * oa);
    });
    this.gBlocks.forEach(b => { mask(b); hatch(b, [60, 650, 700, 725], 0, 3.2, bq, SEPIA, 1, 0.15 * ha, 445); stroke(b, bq, INK, 1, 0.6 * oa); });
    this.nhm.forEach(n => { mask(n); stroke(n, bq, INK, 1, 0.35 * oa); });
    stroke(this.bridge, bq, INK, 1.0, 0.35 * oa);
    stroke(this.shore, q, INK, 1.1, 0.6);

    // 3 · the sea: its rows lighter where the light lies on it; the museums' reflections; the rain's rings
    const lit = (x, y) => brk * Math.max(1 - svStep(0, 16 + 0.36 * (y - SV.shore), Math.abs(x - SV_SUN[0])), 0.55 * (1 - svStep(0, 1, Math.hypot((x - 1640) / 560, (y - 800) / 150))));
    this.sea.forEach(row => {
      const bins = [new Path2D(), new Path2D(), new Path2D()];
      row.segs.forEach(s => { const l = lit(s.xm, row.y); s.p.trace(bins[l > 0.55 ? 2 : l > 0.2 ? 1 : 0], 1); });
      bins.forEach((b, i) => { ctx.save(); ctx.globalAlpha = SA * sw * row.a * [1, 0.62, 0.3][i]; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = BLUE; ctx.lineWidth = row.w; ctx.lineCap = 'round'; ctx.stroke(b); ctx.restore(); });
    });
    // the reflections shiver, broken by the rain; they steady and darken as it stops
    const still = 0.35 + 0.65 * (1 - rain);
    const rb = Array.from({ length: 5 }, () => new Path2D());
    this.refl.forEach(s => {
      const dx = Math.sin(lt * 1.9 + s.ph) * (0.6 + 2.2 * s.dp) * (1.2 - still), i = Math.min(4, Math.floor(s.f * still * 5));
      rb[i].moveTo(s.x0 + dx, s.y); rb[i].lineTo(s.x1 + dx, s.y);
    });
    rb.forEach((b, i) => { ctx.save(); ctx.globalAlpha = SA * sw * bq * (0.1 + 0.36 * (i + 0.5) / 5); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.stroke(b); ctx.restore(); });
    this.rings.forEach((g, i) => { const u = ((lt * 0.8 + g.ph) % 1.2) / 1.2, rr = (2 + 11 * u) * g.s; stroke(el(g.x, g.y, rr, rr * 0.28, 0, TAU, 450 + i, 0), 1, BLUE, 1.0, 0.4 * (1 - u) * rain * sw); });

    // 4 · the air: a sheet of rain-light over sky, district and sea, with the clearing and the shafts cut out of it
    const A = this.air.getContext('2d');
    A.setTransform(1, 0, 0, 1, 0, 0); A.globalCompositeOperation = 'source-over'; A.clearRect(0, 0, this.air.width, this.air.height);
    A.setTransform(m);
    const air = A.createLinearGradient(0, -100, 0, 1100);
    air.addColorStop(0, 'rgba(112,110,104,0.16)'); air.addColorStop(0.72, 'rgba(112,110,104,0.13)'); air.addColorStop(1, 'rgba(112,110,104,0.1)');
    A.fillStyle = air; A.fillRect(-200, -200, 2400, 1500);
    A.globalCompositeOperation = 'destination-out';
    const fm = front(360), sky = A.createLinearGradient(fm - 220, 0, fm + 260, 0);
    sky.addColorStop(0, 'rgba(0,0,0,0)'); sky.addColorStop(1, `rgba(0,0,0,${0.8 * brk})`);
    A.fillStyle = sky; A.fillRect(-200, -400, 2400, SV.yE + 420);
    const wedge = (c, a, hw, s) => {
      const [sx, sy] = SV_SUN, t0 = (a - hw) * Math.PI / 180, t1 = (a + hw) * Math.PI / 180, ax = Math.cos(a * Math.PI / 180), ay = Math.sin(a * Math.PI / 180), L = 1500;
      const at = y => clamp((y - sy) / ay / L); // where a height on screen falls along the shaft's axis
      const g = c.createLinearGradient(sx, sy, sx + ax * L, sy + ay * L);
      g.addColorStop(at(90), 'rgba(255,246,226,0)'); g.addColorStop(at(330), `rgba(255,246,226,${s})`); g.addColorStop(at(430), `rgba(255,246,226,${s})`);
      g.addColorStop(at(SV.yE - 2), `rgba(255,246,226,${0.55 * s})`); g.addColorStop(at(SV.yE + 14), 'rgba(255,246,226,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(t0) * L, sy + Math.sin(t0) * L); c.lineTo(sx + Math.cos(t1) * L, sy + Math.sin(t1) * L); c.closePath(); c.fill();
    };
    SV_SHAFTS.forEach(([a, hw, s]) => [[1, 1], [1.7, 0.45], [2.6, 0.2]].forEach(([k, f]) => wedge(A, a, hw * k, 0.9 * s * f * shafts)));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(this.air, 0, 0); ctx.restore();
    // the light itself: the clearing's glow toward the sun, the shafts, the glitter under the sun, the dome's crown
    svGlow(() => { const g = ctx.createRadialGradient(1790, -20, 0, 1790, -20, 820); g.addColorStop(0, 'rgba(255,242,214,1)'); g.addColorStop(1, 'rgba(255,242,214,0)'); ctx.fillStyle = g; ctx.fillRect(700, -400, 1500, 1300); }, 0.34 * brk);
    svGlow(() => SV_SHAFTS.forEach(([a, hw, s]) => [[1, 1], [1.8, 0.4]].forEach(([k, f]) => wedge(ctx, a, hw * k, 0.24 * s * f))), shafts);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFF3D6';
    this.glints.forEach(g => { const tw = Math.pow(Math.max(0, Math.sin(lt * g.om + g.ph)), 6); if (tw > 0.02) { ctx.globalAlpha = SA * brk * tw * 0.7; ctx.fillRect(g.x - g.len / 2, g.y - g.w / 2, g.len, g.w); } });
    ctx.restore();
    svGlow(() => {
      ctx.strokeStyle = '#FFEFCB'; ctx.lineCap = 'round'; ctx.lineWidth = 1.3;
      ctx.beginPath(); this.domeCrown.trace(ctx, 1); ctx.stroke();
    }, 0.6 * shafts * bq);

    // 5 · the captions under each museum, on paper, never under the rain
    const cap = [[svX(103.2), 'متحف جوجنهايم أبوظبي', 'GUGGENHEIM ABU DHABI', 1.6], [svX(112.2), 'متحف زايد الوطني', 'ZAYED NATIONAL MUSEUM', 2.1], [svX(119.8), 'متحف اللوفر أبوظبي', 'LOUVRE ABU DHABI', 2.6]];
    const patches = [];
    cap.forEach(([x, ar, en, t0]) => {
      const cq = easeOut(prog(lt, t0, 0.6)) * clamp((15.6 - lt) / 0.35);
      if (cq <= 0) return;
      const w = Math.max(textWidth(ar, `600 22px ${F_KUFI}`, 0, 'rtl'), textWidth(en, `600 13px ${F_MONO}`, 2) + 2 * en.length) + 24;
      patches.push({ b: [x - w / 2, 752, x + w / 2, 810], a: cq });
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA * 0.95 * cq; ctx.fillStyle = PAPER_PAT; ctx.fillRect(x - w / 2, 752, w, 58); ctx.restore();
      smallAr(ar, x, 776, cq, { size: 22, align: 'center', weight: 600, a: 0.88 });
      small(en, x, 800, cq, { size: 13, ls: 2, align: 'center', weight: 600, a: 0.7 });
    });

    // 6 · the rain: fine slanted strokes, a far veil and nearer streaks, stopping short of the words and the captions;
    // in the shafts the last drops catch the light
    if (rain > 0.001) {
      const keep = (xa, ya) => 1 - Math.max(clear(xa, ya, 34), patches.reduce((v, p) => Math.max(v, p.a * (1 - svStep(0, 1, box(xa, ya, p.b, 18)))), 0));
      const bins = Array.from({ length: 8 }, () => new Path2D()), glint = new Path2D();
      const put = (d, span, y0) => {
        const y = y0 + ((d.ph * span + lt * d.v) % span), x = d.x - (y - y0) * 0.14;
        const xa = (x - ce) / cs, ya = (y - d.len / 2 - cf) / cs; // the stroke's middle, in the plate's coordinates
        const a = d.a * rain * keep(xa, ya), i = Math.min(7, Math.floor(a / 0.02));
        if (i < 1) return;
        bins[i].moveTo(x, y); bins[i].lineTo(x - d.len * 0.14, y - d.len);
        if (shafts > 0.05 && ya < 540 && this.shaftAt(xa, ya) > 0.3) { glint.moveTo(x, y); glint.lineTo(x - d.len * 0.14, y - d.len); }
      };
      this.far.forEach(d => put(d, 840, -60));
      this.near.forEach(d => put(d, 1240, -120));
      ctx.save(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.lineCap = 'round'; ctx.lineWidth = 1;
      bins.forEach((b, i) => { if (!i) return; ctx.globalAlpha = SA * (i + 0.5) * 0.02; ctx.strokeStyle = i > 3 ? INK : SEPIA; ctx.stroke(b); });
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.35 * shafts; ctx.strokeStyle = '#FFF4DA'; ctx.lineWidth = 1.2; ctx.stroke(glint);
      ctx.restore();
    }
  },
});
