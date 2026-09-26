'use strict';
// X · Al Istimtar — seeding the cloud over the Hajar in Ras Al Khaimah: the aircraft level under the cloud base, salt
// plumes rising into it, droplets gathering, then rain on the foothills
// The aircraft is NCM's seeding type, a Beechcraft King Air C90: 10.82 m long, 15.32 m span, 4.34 m high on its gear;
// a low wing with 7 degrees of dihedral, two PT6A turboprops in nacelles ahead of it, a conventional tail, round cabin
// windows. Hygroscopic flares burn in racks under each wing's trailing edge, outboard of the nacelles. It is built in
// 3D and engraved as the film's other 3D work is (engrave3d.js), seen from the foothills about 15 degrees below it and
// to its right, its nose turned 15 degrees toward us; no livery, number or marks.
// the outline of a convex part on screen: the hull of its projected vertices (monotone chain)
function hull2(pts) {
  const s = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  s.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
  s.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const KING_AIR = (() => {
  const D7 = Math.tan(7 * Math.PI / 180);
  // elliptical sections [x, half-width, centre z, half-height] joined into faces (x forward, y to the left, z up; m)
  const loft = (sections, sides, dy = 0) => {
    const rings = sections.map(([x, w, zc, h]) => Array.from({ length: sides }, (_, k) => { const a = k / sides * TAU; return [x, dy + w * Math.cos(a), zc + h * Math.sin(a)]; }));
    const f = [];
    for (let i = 1; i < rings.length; i++) for (let k = 0; k < sides; k++) { const r0 = rings[i - 1], r1 = rings[i], k2 = (k + 1) % sides; f.push([r0[k], r0[k2], r1[k2], r1[k]]); }
    f.push(rings[0].slice().reverse(), rings[rings.length - 1]);
    return f;
  };
  const hexa = v => [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(ix => ix.map(i => v[i]));
  // a thin tapered surface from span y0 to y1: its leading and trailing edges at root and tip, its root height z0, its
  // dihedral (tangent), its thickness at root and tip (full at the leading edge, half at the trailing edge)
  const panel = (y0, y1, le0, te0, le1, te1, z0, dih, t0, t1) => {
    const z1 = z0 + Math.abs(y1 - y0) * dih;
    const bottom = [[le0, y0, z0 - t0 / 2], [te0, y0, z0 - t0 / 4], [te1, y1, z1 - t1 / 4], [le1, y1, z1 - t1 / 2]];
    const top = [[le0, y0, z0 + t0 / 2], [te0, y0, z0 + t0 / 4], [te1, y1, z1 + t1 / 4], [le1, y1, z1 + t1 / 2]];
    return hexa(bottom.concat(top));
  };
  const skin = { tone: 0.05, shade: 0.5, lw: 2.2 };
  const parts = [
    { n: 'fuselage', smooth: true, f: loft([[5.4, 0.16, 0.46, 0.16], [5.12, 0.4, 0.47, 0.38], [4.5, 0.6, 0.52, 0.58], [3.7, 0.68, 0.58, 0.7], [2.8, 0.72, 0.62, 0.76], [-1.6, 0.72, 0.62, 0.76], [-3.4, 0.5, 0.8, 0.55], [-5.45, 0.16, 1.05, 0.2]], 12), st: { tone: 0.04, shade: 0.55, lw: 2.4 } },
    { n: 'wingR', f: panel(-0.7, -7.66, 1.4, -0.8, 0.55, -0.55, 0.0, D7, 0.32, 0.12), st: skin },
    { n: 'wingL', f: panel(0.7, 7.66, 1.4, -0.8, 0.55, -0.55, 0.0, D7, 0.32, 0.12), st: skin },
    { n: 'tailplaneR', f: panel(-0.2, -2.62, -4.3, -5.45, -4.95, -5.6, 0.95, Math.tan(5 * Math.PI / 180), 0.12, 0.07), st: skin },
    { n: 'tailplaneL', f: panel(0.2, 2.62, -4.3, -5.45, -4.95, -5.6, 0.95, Math.tan(5 * Math.PI / 180), 0.12, 0.07), st: skin },
    { n: 'fin', f: hexa([[-3.1, -0.08, 1.2], [-5.4, -0.08, 1.25], [-5.9, -0.05, 3.1], [-4.9, -0.05, 3.1], [-3.1, 0.08, 1.2], [-5.4, 0.08, 1.25], [-5.9, 0.05, 3.1], [-4.9, 0.05, 3.1]]), st: skin },
  ];
  [-2.3, 2.3].forEach(y => {
    const zw = (Math.abs(y) - 0.7) * D7, side = y < 0 ? 'R' : 'L';
    // the nacelle, slung on the wing, and its propeller (a 2.3 m disc) just ahead of it
    parts.push({ n: 'nacelle' + side, smooth: true, f: loft([[2.35, 0.3, zw + 0.2, 0.28], [1.2, 0.42, zw + 0.18, 0.42], [-1.1, 0.28, zw + 0.25, 0.25]], 10, y), st: { tone: 0.1, shade: 0.5, lw: 2.0 }, prop: [2.45, y, zw + 0.2] });
    // the flare rack under the wing's trailing edge, outboard of the nacelle; the flares burn at its rear
    const yr = Math.sign(y) * 4.8, zr = (4.8 - 0.7) * D7 - 0.1;
    parts.push({ n: 'rack' + side, f: hexa([[-0.3, yr - 0.6, zr - 0.26], [-0.78, yr - 0.6, zr - 0.26], [-0.78, yr + 0.6, zr - 0.26], [-0.3, yr + 0.6, zr - 0.26], [-0.3, yr - 0.6, zr], [-0.78, yr - 0.6, zr], [-0.78, yr + 0.6, zr], [-0.3, yr + 0.6, zr]]), st: { tone: 0.55, shade: 0.3, lw: 1.6 }, burn: [-0.8, yr, zr - 0.2] });
  });
  // the model turned 15 degrees toward the viewer; the fixed view is 100 m to its right and 28 m below
  const psi = -15 * Math.PI / 180, turn = ([x, y, z]) => [x * Math.cos(psi) - y * Math.sin(psi), x * Math.sin(psi) + y * Math.cos(psi), z];
  parts.forEach(p => {
    p.f = p.f.map(f => f.map(turn));
    if (p.prop) { const [x, y, z] = p.prop; p.disc = Array.from({ length: 37 }, (_, k) => turn([x, y + 1.15 * Math.cos(k / 36 * TAU), z + 1.15 * Math.sin(k / 36 * TAU)])); }
    if (p.burn) p.burn = turn(p.burn);
  });
  // the round cabin windows and the cockpit's side window, on the side toward us
  const windows = [1.6, 0.7, -0.2, -1.1].map(x => [[x + 0.22, -0.69, 0.74], [x - 0.22, -0.69, 0.74], [x - 0.22, -0.69, 1.0], [x + 0.22, -0.69, 1.0]].map(turn));
  const cockpit = [[3.45, -0.62, 0.86], [2.85, -0.7, 0.86], [2.85, -0.7, 1.16], [3.3, -0.62, 1.12]].map(turn);
  const side = turn([0, -1, 0]);
  const view = () => E3.camera([0, -100, -28], [0, 0, 0.6], 1450);
  return { parts, windows, cockpit, side, view };
})();
scene({
  id: 'seeding', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 78, dur: 8, speed: 11 / 8, num: 'X', name: 'AL ISTIMTAR', ar: 'الاستمطار', readout: '311 MISSIONS · 2022',
  kicker: 'FIRST TRIAL 1982 · NATIONWIDE SINCE 2010',
  head: ['WE ASKED', 'THE CLOUDS', 'FOR MORE.'], accent: { 'MORE.': BLUE },
  arHead: 'واستمطرنا السحاب',
  init() {
    const C = [[1180, 380, 108], [1300, 300, 148], [1452, 262, 162], [1606, 316, 132], [1726, 392, 96], [1392, 402, 118], [1546, 412, 112], [1262, 432, 90], [1660, 448, 70]];
    this.circles = C.map(([x, y, r], i) => el(x, y, r, r, 0, TAU, 260 + i, 1.2));
    this.inside = C.map(([x, y, r], i) => el(x, y, r - 2.2, r - 2.2, 0, TAU, 900 + i, 0));
    this.base = pl([[1138, 505], [1300, 510], [1500, 503], [1700, 508], [1744, 505]], false, 270, 0.8);
    // a solid band along the base, so the lobes do not leave notches where they meet
    this.band = new P([[1117, 468], [1700, 468], [1764, 480], [1744, 507], [1138, 507]], true);
    this.bandEnds = [new P(quad([1117, 468], [1126, 492], [1140, 505], 8)), new P(quad([1764, 480], [1756, 496], [1742, 505], 8))];
    // the ground: the real skyline of the Hajar in Ras Al Khaimah, seen from the plain at 25.78 N, 56.02 E looking east
    // (bearings 50-100 deg across the plate, 18 px a degree both ways, so heights are true to the angles). Computed by
    // data/build/rak_skyline.py from SRTM-derived terrain tiles, counting only ground inside the UAE outline, so the
    // aircraft works over UAE territory; the highest point in view is 6.3 deg up, a ridge 11.7 km away.
    this.terrain = [[985, 940]].concat([[985,873.2],[992,872.4],[999,871.2],[1007,870.4],[1014,869.6],[1021,867.2],[1028,861.0],[1035,858.3],[1043,858.8],[1050,860.5],[1057,861.1],[1064,859.9],[1071,858.8],[1079,859.4],[1086,860.5],[1093,862.5],[1100,863.6],[1107,861.6],[1115,862.1],[1122,862.2],[1129,867.9],[1136,872.1],[1143,877.1],[1151,875.4],[1158,875.4],[1165,871.6],[1172,871.7],[1179,874.2],[1187,875.1],[1194,879.0],[1201,877.6],[1208,882.5],[1215,883.9],[1223,885.8],[1230,887.5],[1237,889.2],[1244,890.2],[1251,891.2],[1259,892.4],[1266,890.9],[1273,890.6],[1280,890.1],[1287,889.1],[1295,886.5],[1302,885.4],[1309,886.1],[1316,885.5],[1323,886.3],[1331,884.7],[1338,885.0],[1345,885.9],[1352,885.1],[1359,883.4],[1367,881.0],[1374,879.7],[1381,878.3],[1388,877.4],[1395,876.7],[1403,874.7],[1410,873.6],[1417,873.0],[1424,872.5],[1431,872.8],[1439,873.4],[1446,874.0],[1453,873.6],[1460,874.4],[1467,874.0],[1475,871.6],[1482,870.0],[1489,867.9],[1496,865.9],[1503,863.5],[1511,861.8],[1518,862.7],[1525,864.2],[1532,864.5],[1539,863.0],[1547,861.7],[1554,858.1],[1561,856.3],[1568,856.6],[1575,859.1],[1583,854.5],[1590,853.3],[1597,852.1],[1604,852.3],[1611,852.5],[1619,852.5],[1626,851.5],[1633,848.9],[1640,846.4],[1647,843.2],[1655,841.7],[1662,839.9],[1669,837.5],[1676,833.4],[1683,830.6],[1691,829.5],[1698,826.6],[1705,828.1],[1712,829.0],[1719,828.5],[1727,828.8],[1734,831.6],[1741,834.6],[1748,835.0],[1755,836.2],[1763,838.2],[1770,844.7],[1777,848.2],[1784,853.2],[1791,854.0],[1799,856.5],[1806,857.7],[1813,859.3],[1820,860.4],[1827,861.5],[1835,862.8],[1842,862.9],[1849,864.4],[1856,865.2],[1863,865.2],[1871,866.1],[1878,864.4],[1885,862.3]], [[1885, 940]]);
    this.ground = pl(this.terrain.slice(1, -1), false, 271, 0.5); // the ridge line only: the plate's edges cut the view, no cliffs
    this.groundFill = new P(this.terrain.concat([[1885, 1006], [985, 1006]]), true);
    this.hero = [1450, 489]; // the droplet the next plate opens from
    // aircraft, local coordinates (nose to the right)
    this.fuse = el(0, 0, 70, 10, 0, TAU, 272, 0.2);
    this.wing = new P([[-6, -3], [18, -3], [0, 44], [-16, 44]], true);
    this.wing2 = new P([[-6, 3], [18, 3], [4, -30], [-10, -30]], true);
    this.fin = new P([[-58, -6], [-72, -30], [-60, -30], [-44, -6]], true);
    this.drops = [];
    const r = rng(33);
    for (let i = 0; i < 170; i++) this.drops.push({ x: 1120 + r() * 640, ph: r(), v: 620 + r() * 260, len: 16 + r() * 16, on: 5.0 + (i / 170) * 3.2, a: 0.35 + r() * 0.45 });
    this.flares = [];
    for (let i = 0; i < 90; i++) this.flares.push({ te: 1.6 + i * 0.06, side: i % 2 ? 1 : -1, vy: 40 + r() * 70, vx: -30 + r() * 60, life: 1.8 + r() * 1.2 });
    KING_AIR.view();
    this.racks = KING_AIR.parts.filter(p => p.burn).map(p => { const [x, y] = E3.proj(p.burn); return [x - W / 2, y - H / 2]; });
  },
  planeX(lt) { return lerp(930, 1910, prog(lt, 1.4, 6.2)); },
  draw(lt) {
    // ground
    mask(this.groundFill); hatch(this.groundFill, [985, 780, 1885, 1012], -1.2, 8, prog(lt, 1.0, 1.6), SEPIA, 0.9, 0.3, 273);
    stroke(this.ground, easeInOut(prog(lt, 0.6, 1.6)), INK, 1.8);
    // the cloud: outlines, then paper over the inside, then shading below
    const cp = easeInOut(prog(lt, 0.3, 2.2));
    ctx.save(); ctx.beginPath(); ctx.rect(1000, 80, 900, 426); ctx.clip();
    this.circles.forEach((c, i) => stroke(c, clamp(cp * 1.1 - i * 0.02), INK, 2));
    mask(this.inside.concat([this.band]));
    hatch(this.circles.concat([this.band]), [1070, 330, 1830, 505], 0.55, 8, prog(lt, 1.6, 1.8), INK, 1, 0.3, 274);
    ctx.restore();
    this.bandEnds.forEach(e => stroke(e, clamp(cp * 1.1 - 0.2), INK, 2));
    stroke(this.base, easeInOut(prog(lt, 1.2, 1.2)), INK, 1.8);
    // droplets gathering at the cloud base after seeding
    const r = rng(77);
    for (let i = 0; i < 26; i++) {
      const x = 1150 + r() * 600, y = 470 + r() * 28, q = easeOut(prog(lt, 4.2 + r() * 1.6, 0.8));
      disc(x, y, (2 + r() * 3) * q, BLUE, 0.7);
    }
    const hq = easeOut(prog(lt, 6.2, 0.8));
    if (hq > 0) { disc(this.hero[0], this.hero[1], 3 + 5 * hq, BLUE, 0.85); stroke(el(this.hero[0], this.hero[1], 8 + 6 * hq, 8 + 6 * hq, 0, TAU, 279, 0), hq, GOLD, 1.4, 0.8); }
    // hygroscopic flares burn at the wing racks and leave a pale plume of salt particles that the updraft
    // carries into the cloud base: drawn as fine salt particles, never as sparks or puffs
    this.flares.forEach(f => {
      const age = lt - f.te;
      if (age < 0 || age > f.life * 1.6) return;
      const px = this.planeX(f.te);
      if (px < 1110 || px > 1780) return;
      const [rx, ry] = this.racks[f.side > 0 ? 0 : 1], u = age / (f.life * 1.6), x = px + rx + f.vx * age * 0.6, y = 590 + ry - f.vy * age * 0.9;
      if (y < 505) return;
      disc(x, y, 1.3, BLUE, 0.45 * (1 - u)); // fine rising salt particles, never puffs (they read as smoke)
    });
    // the aircraft: its parts far to near, each engraved by the light; the propellers as the discs a camera sees
    const px = this.planeX(lt);
    if (lt > 1.3 && px < 1905) {
      ctx.save(); ctx.translate(px - W / 2, 590 + 3 * Math.sin(lt * 2) - H / 2);
      KING_AIR.view();
      const depth = p => E3.depth(E3.centroid(p.f.map(E3.centroid)));
      KING_AIR.parts.map(p => ({ p, d: depth(p) })).sort((a, b) => b.d - a.d).forEach(({ p }, i) => {
        // a smooth part (the fuselage, the nacelles) is shaded by its hatching and outlined once, never faceted
        E3.solid(p.f, p.smooth ? Object.assign({}, p.st, { edges: false }) : p.st, 1300 + i * 40);
        if (p.smooth) stroke(new P(hull2(p.f.flat().map(E3.proj)), true), 1, INK, 1.6, 0.9);
        if (p.n === 'fuselage') {
          KING_AIR.windows.forEach((w, k) => E3.face(w, { n: KING_AIR.side, fillCol: INK, fillA: 0.55, noHatch: true, lw: 1.4, edgeA: 0.7 }, 1500 + k));
          E3.face(KING_AIR.cockpit, { n: KING_AIR.side, fillCol: INK, fillA: 0.6, noHatch: true, lw: 1.4, edgeA: 0.8 }, 1510);
        }
        if (p.disc) E3.line(p.disc, INK, 1.0, 0.4);
      });
      ctx.restore();
    }
    // rain, thickening as the seeding takes hold
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = BLUE; ctx.lineCap = 'round'; ctx.lineWidth = 1.5;
    this.drops.forEach(d => {
      const q = prog(lt, d.on, 0.6);
      if (q <= 0) return;
      const span = 440, y = 512 + ((d.ph * span + (lt - d.on) * d.v) % span), x = d.x - (y - 512) * 0.06;
      if (y > yOn(this.terrain, x) - 2) return;
      ctx.globalAlpha = SA * d.a * q;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len * 0.06, y - d.len); ctx.stroke();
    });
    ctx.restore();
  },
});
