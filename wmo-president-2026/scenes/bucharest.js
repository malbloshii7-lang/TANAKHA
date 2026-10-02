'use strict';
// Bucharest · Wednesday 1 October 2026, 09:00 local (06 UTC, the morning's main synoptic hour): the observation garden of
// the Bucharest-Băneasa weather station (WMO 15420), in the grounds of Romania's National Meteorological Administration
// (ANM) at Șoseaua București-Ploiești 97, the host of the Region VI conference, which the President's programme visited
// that day. No sign, lettering or building is drawn, and the plate names nothing.
//
// The place (what is verified, and what is generic):
//   the station's coordinates, 44°30'38" N 26°04'41" E, 90 m (CMR Muntenia, saptamanaverde.edu.ro; OpenStreetMap node
//   742024813, ref:wmo 15420, inside the ANM grounds, way 862523834, addr. Șos. București-Ploiești 97); ANM's address
//   (meteoromania.ro); the Institute in its present seat there since 1961 (meteoromania.ro, Istoric). The station's
//   instruments are visited at ANM with the National Forecasting Centre (orasul.ro), "with the classic instruments as
//   well as the automatic station". OpenStreetMap shows the ANM buildings 70-220 m north and north-east of the station:
//   behind the eye here, so none is in the frame (none could be drawn from references in any case). Westward and
//   south-westward, where the plate looks, OSM has the grounds' edge 35-60 m off, then houses and gardens: the plate
//   shows trees, and low roofs and a far tree line between their trunks (their kinds, places and sizes are generic).
//   The garden itself is the standard Romanian platform (a 26 × 26 m square, sides north-south and east-west, the
//   instruments in rows 4 m apart decreasing in height from north to south, gravel paths 0.4 m wide, the gate on the
//   north side; Romanian practical-meteorology course notes, pdfcoffee.com), drawn generic: its actual layout at
//   Băneasa is not public. Row 1 (north): a 10 m mast with the automatic station's cup anemometer and vane (WMO's
//   standard 10 m). Row 2: the two louvred screens, white outside and black inside, double roof, on four legs fixed to
//   concrete stubs, the sensing parts 1.8-2.0 m up, a double door to the north (so the observer's shadow and the sun
//   never fall on the thermometers), a wooden three-step ladder before it; the left one (east, seen from the gate)
//   holds the direct-reading thermometers. Row 3: the rain gauge (rim 1 m) and the rain recorder. Row 4: the sunshine
//   recorder on its pillar. South: the bare-soil plot. A light-painted wire fence.
// The morning (sourced):
//   the station's own SYNOP for 06 UTC (OGIMET): AAXX 01061 15420 04970 03602 10118 20053 30192 40304 52006 ... no cloud
//   (N 0), visibility 20 km, wind from 360° at 2 m/s (gusts to 4 m/s), air 11.8 °C, dew point 5.3 °C, 1030.4 hPa; the
//   airport next door, LRBS 010600Z 35007KT 320V040 CAVOK 13/05 Q1030 (wind 350° at 7 kt, varying 320°-040°). GFS's 06
//   UTC analysis there: no cloud at any level, the 10 m wind from the north-east at 5.7 m/s, MSLP 1030 hPa. So a clear,
//   cool, anticyclonic morning: a cloudless sky, a light north breeze, dry grass (ground state E 0), a coat.
//   the sun (NOAA's equations after Meeus, for 44.5106° N 26.0781° E): at 09:00 EEST it stands 17.6° up at azimuth
//   113.2° (rose 07:14), behind the eye's left shoulder: the screens' east faces and the trees in sun, the north faces
//   (the doors) in shade, every shadow long (3.2 times the height) toward 293°.
// The eye: just inside the garden's north-east corner, 1.6 m up, looking 241° (west-south-west) across the garden, f 950
// px (54° across the plate); it eases 0.8 m forward over the beat. Everything is to one scale from that eye: the near
// screen 10 m off (its 0.75 m box 70 px wide), the mast 17 m, the trees 45-95 m.
// The living detail (slow): the observer, a man of 1.75 m in a coat, walks in from the gate side along the path, climbs
// the ladder, opens the screen's double door and reads the thermometers, entering them in the register; the cups turn
// at the rate a 2-4 m/s wind gives them and the vane swings slowly between north-west and north-east; a few leaves blown
// in on the north breeze drift low across the garden and settle (none above the trees' line, none smaller than 7 px).
// The print (lt 9.4 to the end) covers plate x 581-925, y 367-609: the screen and the observer stand left of it.
scene({
  id: 'bucharest', start: 0, dur: 17,
  init() {
    const r = rng(15420);
    Object.assign(this, { F: 950, C0: [10.5, 11.8, 1.6], HEAD: 241, PITCH: 6, PUSH: 0.8, SUN: [113.2, 17.6], FENCE: 13, FH: 1.5 });
    // the garden's instruments (metres from its centre; x east, y north)
    this.SCR = [{ x: 2.5, y: 5, main: true }, { x: -1.5, y: 5, main: false }];
    this.MAST = [-8, 9];
    this.GAUGE = [0.5, 1.2]; this.RECORDER = [-4.2, 1.2]; this.HELIO = [-2.5, -3];
    // paths (0.4 m wide): from the gate down the east side of the screens' row, along the north of rows 2 and 3, and to
    // the mast
    this.PATHS = [[[4.5, 13], [4.5, 6.6]], [[-3.6, 6.6], [4.7, 6.6]], [[-6, 2.6], [4.5, 2.6]], [[4.5, 6.6], [4.5, 2.6]], [[-8, 10.4], [4.5, 10.4]], [[-2.5, -1.6], [-2.5, 2.6]]];
    // trees: lindens, horse chestnuts and maples turning (gold, amber, the chestnuts' early rust), a few still green;
    // along the grounds' west and south-west edge and in the gardens beyond
    this.trees = [];
    const kinds = {
      linden: { h: [15, 21], R: [4.6, 6.4], base: [3, 4.5], v: 1.18, lit: '#C9B64A', sh: '#6F7A36', turn: [0.35, 0.75] },
      chestnut: { h: [13, 18], R: [5, 7], base: [2.6, 3.8], v: 0.95, lit: '#C8913E', sh: '#7C5A2E', turn: [0.55, 0.95] },
      maple: { h: [12, 17], R: [4, 5.6], base: [2.6, 3.6], v: 1.05, lit: '#E3AA3C', sh: '#A0682C', turn: [0.5, 0.95] },
      green: { h: [13, 19], R: [4.4, 6], base: [3, 4], v: 1.1, lit: '#97AE52', sh: '#4F6C38', turn: [0, 0.2] },
    };
    const pick = () => { const u = r(); return u < 0.36 ? 'linden' : u < 0.58 ? 'chestnut' : u < 0.86 ? 'maple' : 'green'; };
    const add = (x, y) => {
      const kind = pick(), K = kinds[kind], g = (a) => lerp(a[0], a[1], r());
      const h = g(K.h), R = g(K.R), base = g(K.base), Rv = (h - base) / 2 * K.v, zc = base + (h - base) / 2;
      const lobes = [];
      const n = 30;
      for (let i = 0; i < n; i++) {
        // points over the crown's ellipsoid, a little more of them on its upper half; each a cluster of foliage
        let ux, uy, uz; do { ux = r() * 2 - 1; uy = r() * 2 - 1; uz = r() * 2 - 1; } while (ux * ux + uy * uy + uz * uz > 1 || ux * ux + uy * uy + uz * uz < 0.15);
        const l = Math.hypot(ux, uy, uz), k = 0.62 + 0.18 * r();
        lobes.push({ p: [x + R * k * ux / l, y + R * k * uy / l, zc + Rv * k * uz / l], n: [ux / l, uy / l, uz / l * 0.8 + 0.2], rr: (0.3 + 0.14 * r()) * R, s: r() * 1000 | 0 });
      }
      this.trees.push({ x, y, h, R, Rv, zc, base, kind, K, lobes, turn: g(K.turn), trunk: 0.22 + 0.16 * r(), lean: (r() - 0.5) * 0.04, seed: r() * 1e6 | 0 });
    };
    for (let y = -62; y <= 66; y += 7 + r() * 3.5) add(-42 - r() * 7, y);
    for (let y = -58; y <= 70; y += 9 + r() * 4) add(-58 - r() * 12, y);
    for (let x = -36; x <= 2; x += 7.5 + r() * 3) add(x, -60 - r() * 7);
    for (let x = -60; x <= -10; x += 10 + r() * 5) add(x, -78 - r() * 10);
    // the low skyline beyond (generic houses of two storeys in gardens) and the far tree line
    this.houses = [];
    for (let i = 0; i < 16; i++) {
      const az = (214 + r() * 56) * Math.PI / 180, d = 120 + r() * 230, cx = this.C0[0] + d * Math.sin(az), cy = this.C0[1] + d * Math.cos(az);
      this.houses.push({ cx, cy, w: 8 + r() * 6, dpt: 7 + r() * 4, h: 5.5 + r() * 2, roof: 2 + r() * 1.6, rot: (r() - 0.5) * 0.6 + az, hip: r() < 0.5 });
    }
    this.farLine = Array.from({ length: 140 }, (_, i) => [i / 139, r(), r()]);
    // grass: blades scattered so that they fall evenly over the picture from the eye's first position
    this.view(0);
    this.blades = [];
    const back = (sx, sy) => { const c = E3.cam(), x = (sx - c.cx) / c.f, y = -(sy - c.cy) / c.f, d = [c.F[0] + x * c.R[0] + y * c.U[0], c.F[1] + x * c.R[1] + y * c.U[1], c.F[2] + x * c.R[2] + y * c.U[2]]; if (d[2] >= -1e-4) return null; const k = -c.C[2] / d[2]; return [c.C[0] + k * d[0], c.C[1] + k * d[1], 0]; };
    for (let i = 0; i < 5200; i++) {
      const sx = r() * PW, sy = this.hy + 2 + Math.pow(r(), 0.8) * (PH - this.hy);
      const g = back(sx, sy); if (!g) continue;
      this.blades.push([g[0], g[1], 0.05 + 0.1 * r(), (r() - 0.5) * 0.05, (r() - 0.5) * 0.05, r()]);
    }
    // fallen leaves lying on the grass (more of them against the fence and along the paths)
    this.fallen = Array.from({ length: 70 }, () => { const e = r() < 0.4; return { x: e ? -12.6 + r() * 0.5 : -12 + r() * 24, y: e ? -12 + r() * 24 : -12 + r() * 24, a: r() * TAU, s: 0.08 + r() * 0.06, c: r() }; });
    // leaves blown in on the north breeze, low over the garden (start time, start point, size, colour, spin)
    this.drift = [[-1.2, [3.6, 13.6, 2.3]], [1.6, [6.2, 13.2, 2.0]], [4.2, [1.4, 13.9, 2.25]], [6.8, [5.0, 9.6, 2.1]], [9.9, [4.4, 9.0, 2.15]], [12.6, [5.6, 9.4, 1.95]]]
      .map(([t0, p], i) => ({ t0, p, s: 0.11 + 0.04 * r(), c: r(), ph: r() * TAU, sp: 0.6 + 0.5 * r(), seed: i }));
  },
  // the eye: just inside the garden's north-east corner, 1.6 m up, easing 0.8 m forward over the beat
  view(t) {
    const D = Math.PI / 180, u = easeInOut(clamp((t + 0.45) / 17.9)), h = this.HEAD * D, p = this.PITCH * D;
    const C = [this.C0[0] + this.PUSH * u * Math.sin(h), this.C0[1] + this.PUSH * u * Math.cos(h), this.C0[2]];
    E3.camera(C, [C[0] + 100 * Math.cos(p) * Math.sin(h), C[1] + 100 * Math.cos(p) * Math.cos(h), C[2] + 100 * Math.sin(p)], this.F, PW / 2, PH / 2);
    const c = E3.cam(), hz = E3.projDir([c.F[0], c.F[1], 0]);
    this.hy = hz[1];
    return c;
  },
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    plate(() => this.art(t));
  },
  art(t) {
    E3.sunAt(this.SUN[0], this.SUN[1]);
    this.S = E3.sun();
    this.view(t);
    this.sky();
    this.skyline();
    this.lawn();
    this.drawTrees();
    this.fence();
    this.garden(t);
    this.shadows(t);
    this.things(t);
    this.leaves(t);
    E3.sunAt();
  },

  /* ---------- helpers ---------- */
  rgba(c, a) { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; },
  mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, clamp(t)));
    return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
  },
  // the haze of a 20 km visibility (the SYNOP's VV 70): the share of the light lost over d metres (Koschmieder)
  haze(d) { return 1 - Math.exp(-3.912 * d / 20000); },
  // a world polygon clipped at the near plane and projected (null if nothing is left)
  poly(pts) {
    const zn = 0.6, out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], da = E3.depth(a), db = E3.depth(b);
      if (da >= zn) out.push(a);
      if ((da >= zn) !== (db >= zn)) { const u = (zn - da) / (db - da); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); }
    }
    return out.length >= 3 ? new P(out.map(E3.proj), true) : null;
  },
  // pixels per metre at depth d
  ppm(d) { return this.F / Math.max(0.6, d); },
  // a line weight for a member m metres thick at depth d (at least a hairline)
  lw(m, d, lo = 0.45, hi = 2.2) { return clamp(m * this.F / Math.max(0.6, d), lo, hi); },
  // the convex hull of screen points (monotone chain)
  hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  },
  bbox(path) { const xs = path.pts.map(p => p[0]), ys = path.pts.map(p => p[1]); return [Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) + 2, Math.max(...ys) + 2]; },
  // a shadow cast on the ground (z 0) by a world point
  sh(p) { const s = this.S; return [p[0] - s[0] * p[2] / s[2], p[1] - s[1] * p[2] / s[2], 0]; },
  // many short screen strokes in one path per alpha band: [[x0, y0, x1, y1, a], ...]
  strokes(list, col = INK, lw = 0.8, cap = 'round') {
    const bands = [[], [], [], [], [], []];
    list.forEach(s => { if (s[4] > 0.02) bands[Math.min(5, Math.floor(s[4] * 6))].push(s); });
    bands.forEach((segs, k) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (k + 0.5) / 6; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = cap;
      ctx.beginPath(); segs.forEach(([a, b, c, d]) => { ctx.moveTo(a, b); ctx.lineTo(c, d); }); ctx.stroke(); ctx.restore();
    });
  },

  /* ---------- the sky: cloudless (N 0), ruled as an engraver rules it, deeper overhead ---------- */
  sky() {
    const hy = this.hy;
    if (OPT.colour) washFade([0, -4, PW, hy + 3], [[0, '#4C8DCC', 0.62], [0.42, HUE.sky, 0.46], [0.8, '#9EC2E0', 0.3], [1, '#C4D3DA', 0.22]], 0, 1);
    const NB = 12, bands = Array.from({ length: NB + 1 }, () => []), k = OPT.colour ? 0.55 : 1;
    let row = 0;
    for (let y = 2; y < hy - 2; y += 4.1, row++) {
      const e = (hy - y) / hy;
      for (let x = 0, j = 0; x < PW; x += 9, j++) {
        const a = (0.1 + 0.46 * Math.pow(e, 0.85)) * k, h = ((row * 73856093) ^ (j * 19349663)) >>> 0;
        const bi = Math.round(a / 0.6 * NB + ((h % 1000) / 1000 - 0.5));
        if (bi > 0) bands[Math.min(NB, bi)].push([x, y, x + 9]);
      }
    }
    bands.forEach((segs, i) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * 0.6 * i / NB; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.75; ctx.lineCap = 'butt';
      ctx.beginPath(); segs.forEach(([x0, y, x1]) => { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }); ctx.stroke(); ctx.restore();
    });
  },

  /* ---------- beyond the grounds: low roofs among gardens, and the far tree line in the haze ---------- */
  skyline() {
    const hy = this.hy, C = E3.cam().C;
    // the far tree line (1-2 km): a soft scalloped band a degree or so high, in the haze
    const pts = [], f = this.F;
    for (let i = 0; i < this.farLine.length; i++) {
      const [u, a, b] = this.farLine[i], x = u * (PW + 40) - 20;
      pts.push([x, hy - (0.012 + 0.012 * a + 0.006 * Math.sin(u * 37)) * f]);
    }
    const band = new P([[-20, hy + 2], ...pts, [PW + 20, hy + 2]], true);
    if (OPT.colour) wash(band, this.mix('#7E9468', '#B8C6CF', 0.55), 0.42);
    hatch(band, [-20, hy - 40, PW + 20, hy + 3], 0, 2.6, 1, INK, 0.6, 0.12, 15001);
    stroke(new P(pts), 1, INK, 0.6, 0.22);
    // the houses (120-350 m): two storeys under hipped or gabled roofs, seen between the trees' trunks
    this.houses.slice().sort((a, b) => Math.hypot(b.cx - C[0], b.cy - C[1]) - Math.hypot(a.cx - C[0], a.cy - C[1])).forEach((o, i) => {
      const c = Math.cos(o.rot), s = Math.sin(o.rot), P2 = (u, v, z) => [o.cx + u * c + v * s, o.cy - u * s + v * c, z];
      const hw = o.w / 2, hd = o.dpt / 2, d = Math.hypot(o.cx - C[0], o.cy - C[1]), hz = this.haze(d), a = 1 - hz * 2.2;
      const walls = [[P2(-hw, -hd, 0), P2(hw, -hd, 0), P2(hw, -hd, o.h), P2(-hw, -hd, o.h)], [P2(hw, -hd, 0), P2(hw, hd, 0), P2(hw, hd, o.h), P2(hw, -hd, o.h)],
        [P2(hw, hd, 0), P2(-hw, hd, 0), P2(-hw, hd, o.h), P2(hw, hd, o.h)], [P2(-hw, hd, 0), P2(-hw, -hd, 0), P2(-hw, -hd, o.h), P2(-hw, hd, o.h)]];
      const ridge = o.hip ? [P2(-hw * 0.4, 0, o.h + o.roof), P2(hw * 0.4, 0, o.h + o.roof)] : [P2(-hw, 0, o.h + o.roof), P2(hw, 0, o.h + o.roof)];
      const roofs = [[P2(-hw, -hd, o.h), P2(hw, -hd, o.h), ridge[1], ridge[0]], [P2(hw, hd, o.h), P2(-hw, hd, o.h), ridge[0], ridge[1]]];
      if (o.hip) roofs.push([P2(hw, -hd, o.h), P2(hw, hd, o.h), ridge[1]], [P2(-hw, hd, o.h), P2(-hw, -hd, o.h), ridge[0]]);
      else { walls[1] = [P2(hw, -hd, 0), P2(hw, hd, 0), P2(hw, hd, o.h), ridge[1], P2(hw, -hd, o.h)]; walls[3] = [P2(-hw, hd, 0), P2(-hw, -hd, 0), P2(-hw, -hd, o.h), ridge[0], P2(-hw, hd, o.h)]; }
      const wst = { tone: 0.02, shade: 0.4, lw: 0.6, edgeA: 0.5 * a, fillCol: OPT.colour ? this.mix('#E6D9BE', '#C2CDD3', hz * 3) : null, fillA: 0.4, hdir: [0, 0, 1] };
      const rst = { tone: 0.2, shade: 0.4, lw: 0.6, edgeA: 0.55 * a, fillCol: OPT.colour ? this.mix('#9C6A4E', '#B4BEC6', 0.25 + hz * 3) : null, fillA: 0.45, hdir: [c, -s, 0] };
      E3.solid(walls, wst, 15100 + i * 17);
      roofs.forEach((q, k) => E3.face(q, Object.assign({}, rst, { n: null }), 15200 + i * 17 + k));
    });
  },

  /* ---------- the grounds' lawn beyond the garden ---------- */
  lawn() {
    const hy = this.hy;
    if (OPT.colour) washFade([0, hy - 1, PW, PH], [[0, '#8EA66A', 0.45], [0.25, '#86A85A', 0.5], [1, '#7FA24E', 0.55]], 0, 1);
    // a low hedge at the grounds' edge, 1.6 m, along the west and south-west (its line from OSM's outline of the grounds)
    const hedge = [[-36, -62], [-36, 70]], hedge2 = [[-36, -62], [10, -62]];
    [hedge, hedge2].forEach((hl, k) => {
      const top = [], bot = [];
      for (let i = 0; i <= 60; i++) {
        const u = i / 60, x = lerp(hl[0][0], hl[1][0], u), y = lerp(hl[0][1], hl[1][1], u), zt = 1.5 + 0.25 * Math.sin(i * 1.7 + k) + 0.15 * Math.sin(i * 4.3);
        if (E3.depth([x, y, 0]) < 1) continue;
        top.push(E3.proj([x, y, zt])); bot.push(E3.proj([x, y, 0]));
      }
      if (top.length < 2) return;
      const body = new P(top.concat(bot.reverse()), true);
      mask(body);
      if (OPT.colour) wash(body, '#5E7A40', 0.55);
      hatch(body, this.bbox(body), -0.25, 2.2, 1, INK, 0.6, 0.32, 15300 + k);
      stroke(new P(top), 1, INK, 0.7, 0.45);
    });
  },

  /* ---------- the trees ---------- */
  drawTrees() {
    const C = E3.cam().C, S = this.S;
    const list = this.trees.map(T => ({ T, d: E3.depth([T.x, T.y, T.zc]) })).filter(o => o.d > 5).sort((a, b) => b.d - a.d);
    const ticks = [];
    list.forEach(({ T, d }) => {
      const ppm = this.ppm(d), a = R11.air(d, 380), hz = this.haze(d);
      // cull a tree wholly outside the plate
      const pc = E3.proj([T.x, T.y, T.zc]), rpx = T.R * ppm * 1.3;
      if (pc[0] + rpx < -10 || pc[0] - rpx > PW + 10) return;
      // the trunk, from the ground into the crown, and two limbs
      const tw = T.trunk * ppm, b0 = E3.proj([T.x, T.y, 0]), b1 = E3.proj([T.x + T.lean * T.h, T.y, T.base + T.Rv * 0.6]);
      const trunk = new P([[b0[0] - tw, b0[1]], [b1[0] - tw * 0.55, b1[1]], [b1[0] + tw * 0.55, b1[1]], [b0[0] + tw, b0[1]]], true);
      mask(trunk);
      if (OPT.colour) wash(trunk, this.mix('#6B5A48', '#9AA4AA', hz * 3), 0.55);
      hatch(trunk, this.bbox(trunk), Math.PI / 2, 2, 1, INK, 0.6, 0.4 * a, T.seed);
      stroke(trunk, 1, INK, 0.7, 0.6 * a);
      [[-1, 0.8], [1, 0.6]].forEach(([sd, k]) => {
        const p0 = E3.proj([T.x, T.y, T.base + 0.4]), p1 = E3.proj([T.x + sd * T.R * 0.45, T.y - sd * 0.3, T.base + T.Rv * k]);
        stroke(new P([p0, p1]), 1, INK, Math.max(0.6, tw * 0.6), 0.5 * a);
      });
      // the crown: clusters of foliage, far to near, each masking what is behind it, washed from the shade colour to
      // the lit (the sun from behind the eye's left), the shaded ones hatched, the cupped leaf-marks over them
      const lobes = T.lobes.map(L => ({ L, d: E3.depth(L.p) })).sort((x, y) => y.d - x.d);
      const lit = this.mix(T.K.lit === '#97AE52' ? T.K.lit : this.mix('#9AAE52', T.K.lit, T.turn), '#C4CCC8', hz * 3);
      const shc = this.mix(T.K.sh === '#4F6C38' ? T.K.sh : this.mix('#56703A', T.K.sh, T.turn), '#A9B4BC', hz * 3);
      lobes.forEach(({ L, d: dl }, li) => {
        const c = E3.proj(L.p), rr = L.rr * this.ppm(dl);
        if (rr < 1) return;
        const lum = clamp(0.25 + 0.75 * Math.max(0, E3.dot(L.n, S)) + 0.15 * L.n[2]);
        const pts = [], m = 7 + (L.s % 3);
        for (let k = 0; k < 40; k++) { const th = k / 40 * TAU, rad = rr * (0.9 + 0.1 * Math.abs(Math.sin(th * m * 0.5 + L.s))); pts.push([c[0] + rad * Math.cos(th), c[1] + rad * Math.sin(th) * 0.92]); }
        const path = new P(pts, true);
        mask(path);
        if (OPT.colour) wash(path, this.mix(shc, lit, lum), 0.62);
        if (lum < 0.62) hatch(path, [c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr], -0.75, 1.8 + 2.6 * lum, 1, INK, 0.55, (0.42 - 0.4 * lum) * a, T.seed + li);
        // the outline, firmer on the side away from the light
        stroke(path, 1, INK, 0.6, (0.25 + 0.35 * (1 - lum)) * a);
        // leaf-marks: small cups, closer in the shade
        const rg = rng(L.s + 7), nm = Math.round(4 + 7 * (1 - lum));
        for (let k = 0; k < nm; k++) {
          const u = rg() * 2 - 1, v = rg() * 2 - 1; if (u * u + v * v > 0.8) continue;
          const x = c[0] + u * rr * 0.9, y = c[1] + v * rr * 0.85, s = Math.max(1.2, rr * 0.16);
          ticks.push([x, y, s, (0.3 + 0.4 * (1 - lum)) * a]);
        }
      });
    });
    // the leaf-marks, in alpha bands
    const bands = [[], [], [], []];
    ticks.forEach(k => bands[Math.min(3, Math.floor(k[3] * 4))].push(k));
    bands.forEach((b, i) => {
      if (!b.length) return;
      ctx.save(); ctx.globalAlpha = SA * (i + 0.5) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
      ctx.beginPath(); b.forEach(([x, y, s]) => { ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y + s * 1.1, x + s, y); }); ctx.stroke(); ctx.restore();
    });
  },

  /* ---------- the garden's fence: light-painted posts every 2.6 m, rails, wire mesh ---------- */
  fence() {
    const Fz = this.FENCE, H = this.FH, C = E3.cam().C;
    const sides = [[[-Fz, -Fz], [-Fz, Fz]], [[-Fz, -Fz], [Fz, -Fz]], [[Fz, -Fz], [Fz, Fz]], [[-Fz, Fz], [Fz, Fz]]];
    sides.forEach(([a, b], k) => {
      // only the far sides are in view (west and south); the mesh between the rails as a fine cross-hatch
      const q = this.poly([[a[0], a[1], 0.08], [b[0], b[1], 0.08], [b[0], b[1], H], [a[0], a[1], H]]);
      if (!q) return;
      const d = E3.depth([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 1]);
      if (d < 3) return;
      const bb = this.bbox(q);
      hatch(q, bb, 0.78, 3.0, 1, INK, 0.45, 0.14, 15400 + k);
      hatch(q, bb, -0.78, 3.0, 1, INK, 0.45, 0.14, 15410 + k);
      E3.line([[a[0], a[1], H], [b[0], b[1], H]], INK, 0.9, 0.6);
      E3.line([[a[0], a[1], 0.08], [b[0], b[1], 0.08]], INK, 0.7, 0.45);
      const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2.6);
      for (let i = 0; i <= n; i++) {
        const x = lerp(a[0], b[0], i / n), y = lerp(a[1], b[1], i / n), dp = E3.depth([x, y, 1]);
        if (dp < 1) continue;
        const w = 0.03, post = this.poly([[x - w, y - w, 0], [x + w, y + w, 0], [x + w, y + w, H + 0.05], [x - w, y - w, H + 0.05]]);
        if (!post) continue;
        mask(post); if (OPT.colour) wash(post, '#DCD8CC', 0.3);
        E3.line([[x, y, 0], [x, y, H + 0.05]], INK, this.lw(0.06, dp, 0.6, 2), 0.75);
      }
    });
  },

  /* ---------- the garden's ground: mown grass, paths of gravel, the bare-soil plot ---------- */
  garden(t) {
    const Fz = this.FENCE, hy = this.hy;
    const g = this.poly([[-Fz, -Fz, 0], [Fz, -Fz, 0], [Fz, Fz, 0], [-Fz, Fz, 0]]);
    if (g && OPT.colour) { wash(g, '#8DB04E', 0.32); }
    // the paths
    this.PATHS.forEach(([a, b], k) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * 0.2, ny = dx / L * 0.2;
      const q = this.poly([[a[0] - nx - dx / L * 0.2, a[1] - ny - dy / L * 0.2, 0], [b[0] - nx + dx / L * 0.2, b[1] - ny + dy / L * 0.2, 0], [b[0] + nx + dx / L * 0.2, b[1] + ny + dy / L * 0.2, 0], [a[0] + nx - dx / L * 0.2, a[1] + ny - dy / L * 0.2, 0]]);
      if (!q) return;
      mask(q, 0.85);
      if (OPT.colour) wash(q, '#D9C49A', 0.55);
      hatch(q, this.bbox(q), 0.05, 2.4, 1, INK, 0.5, 0.12, 15500 + k);
      E3.line([[a[0] - nx, a[1] - ny, 0], [b[0] - nx, b[1] - ny, 0]], INK, 0.6, 0.35);
      E3.line([[a[0] + nx, a[1] + ny, 0], [b[0] + nx, b[1] + ny, 0]], INK, 0.6, 0.35);
    });
    // the bare-soil plot (south), raked
    const plot = this.poly([[-2, -10.5, 0], [2.5, -10.5, 0], [2.5, -8, 0], [-2, -8, 0]]);
    if (plot) { mask(plot); if (OPT.colour) wash(plot, '#A7835A', 0.55); hatch(plot, this.bbox(plot), 0.02, 1.8, 1, INK, 0.5, 0.3, 15520); stroke(plot, 1, INK, 0.6, 0.4); }
    // grass: blades, sunlit (a little yellow) or shaded
    const segs = [], C = E3.cam().C;
    this.blades.forEach(([x, y, h, lx, ly, w]) => {
      const d = E3.depth([x, y, 0]);
      if (d < 0.8) return;
      const inside = Math.abs(x) < Fz && Math.abs(y) < Fz;
      if (inside && this.onPath(x, y)) return;
      const a = E3.proj([x, y, 0]), b = E3.proj([x + lx, y + ly, h]);
      segs.push([a[0], a[1], b[0], b[1], (0.18 + 0.32 * w) * clamp(1.2 - d / 120)]);
    });
    this.strokes(segs, INK, 0.7);
  },
  onPath(x, y) {
    return this.PATHS.some(([a, b]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, u = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / L2);
      return Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy) < 0.26;
    }) || (x > -2 && x < 2.5 && y > -10.5 && y < -8);
  },

  /* ---------- shadows on the grass (the sun 17.6° up at 113.2°: every shadow 3.2 times its height, toward 293°) ---------- */
  shadowPolys(t) {
    const out = [];
    const hullOf = pts => { const q = pts.map(p => this.sh(p)); if (q.some(p => E3.depth(p) < 0.8)) return null; return new P(this.hull(q.map(E3.proj)), true); };
    this.SCR.forEach(sc => {
      const { x, y } = sc, b = [[-0.375, -0.275], [0.375, -0.275], [0.375, 0.275], [-0.375, 0.275]];
      out.push(hullOf(b.flatMap(([u, v]) => [[x + u * 1.1, y + v * 1.2, 1.7], [x + u * 1.1, y + v * 1.2, 2.53]])));
      [[-0.3, -0.2], [0.3, -0.2], [0.3, 0.2], [-0.3, 0.2]].forEach(([u, v]) => out.push(hullOf([[x + u - 0.025, y + v, 0], [x + u + 0.025, y + v, 0], [x + u + 0.025, y + v, 1.7], [x + u - 0.025, y + v, 1.7]])));
    });
    const [mx, my] = this.MAST;
    out.push(hullOf([[mx - 0.05, my, 0], [mx + 0.05, my, 0], [mx + 0.04, my, 10], [mx - 0.04, my, 10]]));
    out.push(hullOf([[mx - 0.7, my, 9.83], [mx + 0.7, my, 9.83], [mx + 0.7, my, 9.88], [mx - 0.7, my, 9.88]]));
    const [gx, gy] = this.GAUGE; out.push(hullOf([[gx - 0.08, gy, 0], [gx + 0.08, gy, 0], [gx + 0.08, gy, 1], [gx - 0.08, gy, 1]]));
    const [rx, ry] = this.RECORDER; out.push(hullOf([[rx - 0.17, ry, 0], [rx + 0.17, ry, 0], [rx + 0.17, ry, 1.25], [rx - 0.17, ry, 1.25]]));
    const [hx, hy] = this.HELIO; out.push(hullOf([[hx - 0.15, hy, 0], [hx + 0.15, hy, 0], [hx + 0.15, hy, 1.45], [hx - 0.15, hy, 1.45]]));
    return out.filter(Boolean);
  },
  shadows(t) {
    const list = this.shadowPolys(t);
    if (!list.length) return;
    ctx.save(); ctx.beginPath(); list.forEach(p => p.trace(ctx, 1));
    if (OPT.colour) { ctx.globalAlpha = SA * 0.32; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#56708E'; ctx.fill('nonzero'); }
    ctx.restore();
    list.forEach((p, i) => hatch(p, this.bbox(p), 0.12, 2.2, 1, INK, 0.6, OPT.colour ? 0.22 : 0.34, 15600 + i));
  },

  /* ---------- the instruments, far to near ---------- */
  things(t) {
    const items = [];
    const at = (x, y, z, draw) => items.push({ d: E3.depth([x, y, z]), draw });
    this.SCR.forEach(sc => at(sc.x, sc.y, 2, () => this.screen(sc, t)));
    at(this.MAST[0], this.MAST[1], 2, () => this.mast(t));
    at(this.GAUGE[0], this.GAUGE[1], 0.8, () => this.gauge());
    at(this.RECORDER[0], this.RECORDER[1], 0.8, () => this.recorder());
    at(this.HELIO[0], this.HELIO[1], 1, () => this.helio());
    R11.paint(items);
  },
  white(fa = 0.25) { return { tone: 0, shade: 0.42, lw: 1.1, edgeA: 0.85, fillCol: OPT.colour ? '#B9C6D6' : null, fillA: 0, noHatch: true }; },
  // a face of a white-painted part: bare paper where the sun is on it, a cool wash and a ruled shade where it is not
  wface(pts, seed, { louvres = 0, z0 = 0, z1 = 0, edgeA = 0.85, lw = 1.2, n = null } = {}) {
    const f = E3.face(pts, { tone: 0, shade: 0, lw, edgeA, noHatch: true, n: n || undefined }, seed);
    if (!f) return null;
    const lit = Math.max(0, E3.dot(f.n, this.S)), sh = 1 - lit;
    const bb = this.bbox(f.path);
    if (OPT.colour) { if (sh > 0.25) wash(f.path, '#93A8C2', 0.42 * sh); else wash(f.path, '#F2E6C8', 0.25); }
    if (sh > 0.25) hatch(f.path, bb, Math.PI / 2, 2.6 - 0.8 * sh, 1, INK, 0.55, 0.12 + 0.2 * sh, seed + 3);
    return f;
  },
  // the louvres of a screen face: the edge of each slat and the dark slot under it (the inside is black)
  louvres(a, b, z0, z1, n, d, sh, out = 1) {
    const L = [], al = (0.32 + 0.3 * sh) * out;
    for (let k = 1; k < n; k++) {
      const z = lerp(z0, z1, k / n);
      L.push([[a[0], a[1], z], [b[0], b[1], z], al]);
    }
    E3.segments(L, INK, this.lw(0.012, d, 0.5, 1.1));
  },
  // a louvred screen: four legs on concrete stubs, the box (0.75 × 0.55 × 0.65 m, its floor 1.7 m up), the double roof,
  // the double door on the north face, and (the main one) its ladder; with the door open, the black inside and the
  // thermometers
  screen(sc, t) {
    const { x, y } = sc, d = E3.depth([x, y, 2]), hx = 0.375, hy = 0.275, z0 = 1.7, z1 = 2.35;
    const open = sc.main ? this.doorOpen(t) : [0, 0];
    // legs and stubs
    [[-0.3, -0.2], [0.3, -0.2], [0.3, 0.2], [-0.3, 0.2]].map(([u, v]) => ({ u, v, d: E3.depth([x + u, y + v, 1]) })).sort((a, b) => b.d - a.d).forEach(({ u, v }, i) => {
      E3.solid(E3.box(x + u - 0.07, x + u + 0.07, y + v - 0.07, y + v + 0.07, 0, 0.22), { tone: 0.15, shade: 0.5, lw: 0.9, edgeA: 0.7, fillCol: OPT.colour ? '#B8B2A6' : null, fillA: 0.4 }, 15700 + i);
      E3.solid(E3.box(x + u - 0.025, x + u + 0.025, y + v - 0.025, y + v + 0.025, 0.1, z0), { tone: 0, shade: 0.45, lw: 0.9, edgeA: 0.8, fillCol: OPT.colour ? '#E8E2D2' : null, fillA: 0.3, noHatch: true }, 15710 + i);
    });
    // braces between the legs
    [[[-0.3, -0.2], [0.3, -0.2]], [[0.3, -0.2], [0.3, 0.2]], [[0.3, 0.2], [-0.3, 0.2]], [[-0.3, 0.2], [-0.3, -0.2]]].forEach(([p, q]) => {
      E3.line([[x + p[0], y + p[1], 0.75], [x + q[0], y + q[1], 0.75]], INK, this.lw(0.03, d, 0.6, 1.4), 0.7);
    });
    // the box: the inside first when the door stands open (back wall, west wall, ceiling: black), then the thermometers
    if (open[0] > 0.01 || open[1] > 0.01) this.inside(sc, d);
    const B = (u, v, z) => [x + u, y + v, z];
    const faces = { S: [B(-hx, -hy, z0), B(hx, -hy, z0), B(hx, -hy, z1), B(-hx, -hy, z1)], E: [B(hx, -hy, z0), B(hx, hy, z0), B(hx, hy, z1), B(hx, -hy, z1)],
      N: [B(hx, hy, z0), B(-hx, hy, z0), B(-hx, hy, z1), B(hx, hy, z1)], W: [B(-hx, hy, z0), B(-hx, -hy, z0), B(-hx, -hy, z1), B(-hx, hy, z1)],
      B: [B(-hx, -hy, z0), B(-hx, hy, z0), B(hx, hy, z0), B(hx, -hy, z0)] };
    const norms = { S: [0, -1, 0], E: [1, 0, 0], N: [0, 1, 0], W: [-1, 0, 0], B: [0, 0, -1] };
    ['S', 'W', 'E', 'B'].forEach((k, i) => {
      const f = this.wface(faces[k], 15720 + i, { n: norms[k] });
      if (f && k !== 'B') { const q = faces[k], sh = 1 - Math.max(0, E3.dot(norms[k], this.S)); this.louvres(q[0], q[1], z0 + 0.02, z1 - 0.02, 18, d, sh); }
    });
    // the north face: its frame, and the two leaves (closed, or swung out on their hinges at the corners)
    const C = E3.cam().C;
    if (open[0] < 0.01 && open[1] < 0.01) {
      const f = this.wface(faces.N, 15730, { n: norms.N });
      if (f) { this.louvres(faces.N[0], faces.N[1], z0 + 0.02, z1 - 0.02, 18, d, 1); E3.line([B(0, hy + 0.003, z0), B(0, hy + 0.003, z1)], INK, this.lw(0.012, d, 0.5, 1), 0.8); }
    }
    // the double roof: a ceiling board, then the upper roof standing off it on blocks (the air between), falling to the
    // south
    E3.solid(E3.box(x - hx - 0.03, x + hx + 0.03, y - hy - 0.03, y + hy + 0.03, z1, z1 + 0.03), { tone: 0, shade: 0.45, lw: 1, edgeA: 0.85, noHatch: true }, 15740);
    [[-hx + 0.05, -hy + 0.05], [hx - 0.05, -hy + 0.05], [hx - 0.05, hy - 0.05], [-hx + 0.05, hy - 0.05]].forEach(([u, v], i) => E3.solid(E3.box(x + u - 0.025, x + u + 0.025, y + v - 0.025, y + v + 0.025, z1 + 0.03, z1 + 0.1), { tone: 0.1, shade: 0.4, lw: 0.6, edgeA: 0.6, noHatch: true }, 15741 + i));
    const ro = 0.09, rz = z1 + 0.1, rs = 0.035;
    const roof = [[x - hx - ro, y - hy - ro, rz - rs], [x + hx + ro, y - hy - ro, rz - rs], [x + hx + ro, y + hy + ro, rz + rs], [x - hx - ro, y + hy + ro, rz + rs]];
    const top = roof.map(p => [p[0], p[1], p[2] + 0.025]);
    const rf = [top, [roof[0], roof[1], top[1], top[0]], [roof[1], roof[2], top[2], top[1]], [roof[2], roof[3], top[3], top[2]], [roof[3], roof[0], top[0], top[3]], roof.slice().reverse()];
    E3.solid(rf, { tone: 0, shade: 0.4, lw: 1.1, edgeA: 0.9, noHatch: true, fillCol: OPT.colour ? '#F4EBD2' : null, fillA: 0.2 }, 15750);
    if (sc.main) { this.leaf(sc, -1, open[0], d); this.leaf(sc, 1, open[1], d); this.ladder(sc, d); }
  },
  // the door's leaves: hinged at the north face's corners, opening outward (angle in radians; 0 closed)
  leafPts(sc, side, ang) {
    const { x, y } = sc, hx = 0.375, hy = 0.275, z0 = 1.71, z1 = 2.34, th = 0.022;
    const hingeX = x + side * hx, c = Math.cos(ang), s = Math.sin(ang);
    // closed, the leaf runs from its hinge toward the middle (-side) along the face; open, it turns out about the hinge
    const at = (w, n) => [hingeX - side * (w * c - n * s), y + hy + (w * s + n * c), 0];
    return { at, z0, z1, th, w: hx };
  },
  leaf(sc, side, ang, d) {
    const L = this.leafPts(sc, side, ang), { at, z0, z1, th, w } = L;
    const q = (a, b) => [[...at(a[0], a[1]).slice(0, 2), z0], [...at(b[0], b[1]).slice(0, 2), z0], [...at(b[0], b[1]).slice(0, 2), z1], [...at(a[0], a[1]).slice(0, 2), z1]];
    const out = q([0, th], [w, th]), inn = q([w, 0], [0, 0]), edge = q([w, th], [w, 0]), hingeE = q([0, 0], [0, th]);
    const faces = [out, inn, edge, hingeE, [[...at(0, 0).slice(0, 2), z1], [...at(w, 0).slice(0, 2), z1], [...at(w, th).slice(0, 2), z1], [...at(0, th).slice(0, 2), z1]]];
    // the outer face (white, louvred) and the inner (black, like the box's inside)
    const cs = faces.map(f => E3.centroid(f)), C = E3.cam().C;
    const nOut = (() => { const a = at(0, 0), b = at(0, 1); return [b[0] - a[0], b[1] - a[1], 0]; })();
    const seesOut = E3.dot(nOut, E3.sub(C, cs[0])) > 0;
    if (seesOut) {
      const f = this.wface(out, 15760 + side, { n: nOut });
      if (f) { const sh = 1 - Math.max(0, E3.dot(nOut, this.S)); this.louvres(out[0], out[1], z0 + 0.02, z1 - 0.02, 18, d, sh); }
    } else {
      const f = E3.face(inn, { n: [-nOut[0], -nOut[1], 0], tone: 0.75, shade: 0.1, lw: 1, edgeA: 0.85, fillCol: INK, fillA: 0.55 }, 15762 + side);
    }
    E3.face(edge, { tone: 0, shade: 0.3, lw: 0.8, edgeA: 0.8, noHatch: true }, 15764 + side);
    E3.face(faces[4], { tone: 0, shade: 0.3, lw: 0.8, edgeA: 0.8, noHatch: true, n: [0, 0, 1] }, 15766 + side);
    // the latch on the free edge
    if (seesOut) { const p = at(w - 0.04, th + 0.012); E3.line([[p[0], p[1], 2.0], [p[0], p[1], 2.06]], INK, this.lw(0.012, d, 0.8, 1.6), 0.9); }
  },
  inside(sc, d) {
    const { x, y } = sc, hx = 0.355, hy = 0.255, z0 = 1.72, z1 = 2.33;
    const dark = { tone: 0.8, shade: 0, lw: 0.8, edgeA: 0.6, fillCol: INK, fillA: 0.62 };
    E3.face([[x - hx, y - hy, z0], [x + hx, y - hy, z0], [x + hx, y - hy, z1], [x - hx, y - hy, z1]], Object.assign({ n: [0, 1, 0] }, dark), 15770);
    E3.face([[x - hx, y + hy + 0.02, z0], [x - hx, y - hy, z0], [x - hx, y - hy, z1], [x - hx, y + hy + 0.02, z1]], Object.assign({ n: [1, 0, 0] }, dark), 15771);
    E3.face([[x + hx, y + hy + 0.02, z0], [x + hx, y - hy, z0], [x + hx, y - hy, z1], [x + hx, y + hy + 0.02, z1]], Object.assign({ n: [-1, 0, 0] }, dark), 15772);
    E3.face([[x - hx, y - hy, z1], [x + hx, y - hy, z1], [x + hx, y + hy + 0.02, z1], [x - hx, y + hy + 0.02, z1]], Object.assign({ n: [0, 0, -1] }, dark), 15773);
    E3.face([[x - hx, y - hy, z0], [x - hx, y + hy + 0.02, z0], [x + hx, y + hy + 0.02, z0], [x + hx, y - hy, z0]], Object.assign({ n: [0, 0, 1] }, dark), 15774);
    // the thermometers' stand: the psychrometer's dry and wet thermometers upright, the maximum and minimum lying across
    // below them, and the hair hygrometer's frame; their white scales the light things in the dark
    const pale = (a, b, w) => { const pa = E3.proj(a), pb = E3.proj(b); stroke(new P([pa, pb]), 1, '#F4EFE2', Math.max(1, w * this.ppm(d)), 0.95, null); };
    const paleSrc = (a, b, w) => { const pa = E3.proj(a), pb = E3.proj(b); ctx.save(); ctx.globalAlpha = SA * 0.95; ctx.strokeStyle = '#F1ECDF'; ctx.lineWidth = Math.max(1, w * this.ppm(d)); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); ctx.restore(); };
    E3.line([[x - 0.16, y - 0.05, 1.8], [x + 0.16, y - 0.05, 1.8]], '#2A241E', this.lw(0.02, d, 0.8, 2), 0.9);
    paleSrc([x - 0.07, y - 0.02, 1.86], [x - 0.07, y - 0.02, 2.2], 0.018);
    paleSrc([x + 0.03, y - 0.02, 1.86], [x + 0.03, y - 0.02, 2.2], 0.018);
    paleSrc([x - 0.15, y - 0.06, 1.83], [x + 0.13, y - 0.06, 1.83], 0.014);
    paleSrc([x - 0.15, y - 0.06, 1.77], [x + 0.13, y - 0.06, 1.77], 0.014);
    // the wet thermometer's muslin and its little water cup
    const cup = E3.proj([x + 0.03, y - 0.02, 1.8]);
    disc(cup[0], cup[1], Math.max(1.2, 0.02 * this.ppm(d)), '#E8E4D8', 0.9, 'source-over');
    paleSrc([x + 0.2, y - 0.1, 1.95], [x + 0.2, y - 0.1, 2.22], 0.03);
  },
  // the three-step ladder before the door (wooden treads on a metal frame), its feet on the gravel
  ladderPts(sc) {
    const { x, y } = sc, hy = 0.275;
    return { treads: [[0.85, 0.22], [0.68, 0.44], [0.51, 0.66]].map(([v, z]) => ({ y: y + hy + v - 0.275, z })), x, y, w: 0.25 };
  },
  ladder(sc, d) {
    const { x, y } = sc, w = 0.25, Lp = this.ladderPts(sc);
    const rail = s => {
      E3.line([[x + s * w, y + 0.95, 0], [x + s * w, y + 0.42, 0.82]], INK, this.lw(0.03, d, 0.8, 1.6), 0.85);
      E3.line([[x + s * w, y + 0.42, 0.82], [x + s * w, y + 0.33, 0]], INK, this.lw(0.025, d, 0.7, 1.4), 0.75);
    };
    rail(-1);
    Lp.treads.forEach((tr, i) => E3.solid(E3.box(x - w, x + w, tr.y - 0.08, tr.y + 0.08, tr.z - 0.03, tr.z), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85, fillCol: OPT.colour ? '#B98A55' : null, fillA: 0.45 }, 15780 + i));
    rail(1);
  },
  // the door's leaves over the beat (radians, west then east): shut until the observer reaches them
  doorOpen(t) { return [1.85 * easeInOut(prog(t, 7.6, 0.8)), 1.85 * easeInOut(prog(t, 8.6, 0.8))]; },

  // the mast (10 m): the cup anemometer and the vane on their cross-arm at the top, a lightning rod, the logger, the
  // temperature and humidity sensor's radiation shield on its arm at 2 m
  wind(t) {
    // the station's 2 m/s, gusting to 4 (SYNOP 91004): a smooth wander between about 1.3 and 3.7 m/s
    const v = 2.4 + 0.75 * Math.sin(t * 0.83 + 0.4) + 0.4 * Math.sin(t * 2.03 + 1.3);
    // the vane points where the wind comes from: about north, swinging slowly between north-west and north-east
    // (LRBS: 320°-040°)
    const dir = -5 + 24 * Math.sin(t * 0.52 + 0.6) + 9 * Math.sin(t * 1.37 + 2.1);
    return { v, dir };
  },
  cupAngle(t) {
    // the rotor's turn: a cup speed of about a third of the wind's at 0.09 m radius (1.2-2.5 turns a second); the
    // integral of the wander above
    const k = 1 / (2.8 * 0.09);
    return k * (2.4 * t - 0.75 / 0.83 * Math.cos(t * 0.83 + 0.4) - 0.4 / 2.03 * Math.cos(t * 2.03 + 1.3));
  },
  mast(t) {
    const [x, y] = this.MAST, d = E3.depth([x, y, 5]), ppm = this.ppm(d), col = OPT.colour;
    E3.solid(E3.box(x - 0.35, x + 0.35, y - 0.35, y + 0.35, 0, 0.12), { tone: 0.12, shade: 0.5, lw: 0.8, edgeA: 0.7, fillCol: col ? '#B8B2A6' : null, fillA: 0.4 }, 15800);
    E3.solid(R11.cylinder([x, y], 0.045, 0.12, 6, 10), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85, fillCol: col ? HUE.steel : null, fillA: 0.35 }, 15801);
    E3.solid(R11.cylinder([x, y], 0.035, 6, 10, 10), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85, fillCol: col ? HUE.steel : null, fillA: 0.35 }, 15802);
    // the logger's box (north side) and the shield's arm (east), the shield a stack of white plates
    E3.solid(E3.box(x - 0.2, x + 0.2, y + 0.05, y + 0.25, 1.1, 1.6), { tone: 0.04, shade: 0.5, lw: 0.9, edgeA: 0.85, fillCol: col ? '#E5E2D8' : null, fillA: 0.4 }, 15803);
    E3.line([[x, y, 2.05], [x + 0.55, y, 2.05]], INK, this.lw(0.03, d, 0.6, 1.4), 0.85);
    for (let k = 0; k < 9; k++) {
      const z = 1.9 + k * 0.028, r0 = k === 8 ? 0.07 : 0.085;
      const ring = R11.ring([x + 0.55, y], r0, z, 16).map(E3.proj), pth = new P(this.hull(ring.concat(R11.ring([x + 0.55, y], r0, z + 0.012, 16).map(E3.proj))), true);
      mask(pth); stroke(pth, 1, INK, 0.6, 0.75);
    }
    // the cross-arm (east-west), the anemometer at its east end, the vane at its west end, the lightning rod
    const z = 9.85;
    E3.line([[x - 0.7, y, z], [x + 0.7, y, z]], INK, this.lw(0.035, d, 0.8, 1.6), 0.9);
    E3.line([[x, y, 10], [x, y, 11.1]], INK, this.lw(0.012, d, 0.5, 1), 0.8);
    // the anemometer: a stem, the hub, three arms and their cups (open sides all one way round)
    const ax = x + 0.7, ay = y;
    E3.line([[ax, ay, z], [ax, ay, z + 0.22]], INK, this.lw(0.025, d, 0.7, 1.4), 0.9);
    const th = this.cupAngle(t), hub = [ax, ay, z + 0.25], cups = [];
    for (let k = 0; k < 3; k++) {
      const a = th + k * TAU / 3, e = [ax + 0.09 * Math.cos(a), ay + 0.09 * Math.sin(a), z + 0.25];
      cups.push({ e, a, d: E3.depth(e) });
    }
    cups.sort((p, q) => q.d - p.d).forEach(({ e, a }) => {
      E3.line([hub, e], INK, this.lw(0.008, d, 0.6, 1), 0.85);
      // the cup, a cone 0.05 m across with its mouth turned along the rotor's motion
      const c = E3.proj(e), r = Math.max(1.4, 0.03 * ppm), m = [-Math.sin(a), Math.cos(a), 0], pm = E3.proj([e[0] + m[0] * 0.03, e[1] + m[1] * 0.03, e[2]]);
      const cup = new P([[c[0] - r * 0.4, c[1] - r], [pm[0], pm[1] - r * 0.9], [pm[0], pm[1] + r * 0.9], [c[0] - r * 0.4, c[1] + r]], true);
      mask(cup); fill(cup, INK, 0.28); stroke(cup, 1, INK, 0.7, 0.9);
    });
    disc(E3.proj(hub)[0], E3.proj(hub)[1], Math.max(1.2, 0.025 * ppm), INK, 0.8);
    // the vane: its nose and counterweight into the wind, its fin downwind, on a stem at the arm's west end
    const vx = x - 0.7, w = this.wind(t), D = Math.PI / 180, wd = w.dir * D, into = [Math.sin(wd), Math.cos(wd), 0];
    E3.line([[vx, y, z], [vx, y, z + 0.2]], INK, this.lw(0.025, d, 0.7, 1.4), 0.9);
    const vz = z + 0.24, nose = [vx + into[0] * 0.3, y + into[1] * 0.3, vz], tail = [vx - into[0] * 0.42, y - into[1] * 0.42, vz];
    E3.line([nose, tail], INK, this.lw(0.015, d, 0.7, 1.2), 0.9);
    const fin = [[vx - into[0] * 0.2, y - into[1] * 0.2, vz - 0.02], [vx - into[0] * 0.46, y - into[1] * 0.46, vz - 0.06], [vx - into[0] * 0.48, y - into[1] * 0.48, vz + 0.14], [vx - into[0] * 0.26, y - into[1] * 0.26, vz + 0.05]];
    E3.face(fin, { tone: 0.05, shade: 0.4, lw: 0.8, edgeA: 0.9, noHatch: true, fillCol: col ? '#E8E2D2' : null, fillA: 0.4, n: E3.dot([-into[1], into[0], 0], E3.sub(E3.cam().C, fin[0])) > 0 ? [-into[1], into[0], 0] : [into[1], -into[0], 0] }, 15810);
    const pn = E3.proj(nose); disc(pn[0], pn[1], Math.max(1.2, 0.03 * ppm), INK, 0.85);
  },
  // the rain gauge: a can of 200 cm² (16 cm across) on its post, its rim 1 m up
  gauge() {
    const [x, y] = this.GAUGE, d = E3.depth([x, y, 0.8]), col = OPT.colour;
    E3.solid(E3.box(x - 0.04, x + 0.04, y - 0.04, y + 0.04, 0, 0.55), { tone: 0.2, shade: 0.5, lw: 0.9, edgeA: 0.8, fillCol: col ? '#A88B66' : null, fillA: 0.4 }, 15820);
    E3.solid(R11.cylinder([x, y], 0.08, 0.55, 1.0, 16), { tone: 0.05, shade: 0.5, lw: 1, edgeA: 0.9, fillCol: col ? '#C9CFD3' : null, fillA: 0.35 }, 15821);
    const rim = new P(R11.ring([x, y], 0.08, 1.0, 20).slice(0, 20).map(E3.proj), true), inner = new P(R11.ring([x, y], 0.065, 1.0, 20).slice(0, 20).map(E3.proj), true);
    stroke(rim, 1, INK, 0.9, 0.9); fill(inner, INK, 0.5);
  },
  // the rain recorder: a tall drum with its collector on top
  recorder() {
    const [x, y] = this.RECORDER, col = OPT.colour;
    E3.solid(R11.cylinder([x, y], 0.17, 0, 1.12, 20), { tone: 0.05, shade: 0.5, lw: 1, edgeA: 0.9, fillCol: col ? '#C9CFD3' : null, fillA: 0.35 }, 15830);
    E3.solid(R11.cylinder([x, y], 0.08, 1.12, 1.25, 16), { tone: 0.05, shade: 0.5, lw: 1, edgeA: 0.9, fillCol: col ? '#C9CFD3' : null, fillA: 0.35 }, 15831);
    fill(new P(R11.ring([x, y], 0.065, 1.25, 16).slice(0, 16).map(E3.proj), true), INK, 0.5);
  },
  // the sunshine recorder: a glass sphere in its bowl on a concrete pillar
  helio() {
    const [x, y] = this.HELIO, d = E3.depth([x, y, 1.4]), col = OPT.colour;
    E3.solid(E3.box(x - 0.15, x + 0.15, y - 0.15, y + 0.15, 0, 1.3), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.8, fillCol: col ? '#C4BEB0' : null, fillA: 0.4 }, 15840);
    E3.solid(E3.box(x - 0.12, x + 0.12, y - 0.1, y + 0.1, 1.3, 1.33), { tone: 0.2, shade: 0.5, lw: 0.8, edgeA: 0.8, fillCol: col ? HUE.steel : null, fillA: 0.4 }, 15841);
    const c = E3.proj([x, y, 1.42]), r = Math.max(1.6, 0.05 * this.ppm(d));
    const bowl = new P(Array.from({ length: 13 }, (_, k) => { const a = k / 12 * Math.PI; return [c[0] - r * 1.25 * Math.cos(a), c[1] + r * 0.2 + r * 0.9 * Math.sin(a)]; }));
    disc(c[0], c[1], r, '#F7F3E8', 1, 'source-over'); if (col) disc(c[0], c[1], r, HUE.sky, 0.25, 'multiply');
    stroke(el(c[0], c[1], r, r, 0, TAU, 15842, 0), 1, INK, 0.8, 0.85);
    stroke(bowl, 1, INK, 1.1, 0.9);
    disc(c[0] - r * 0.35, c[1] - r * 0.4, Math.max(0.6, r * 0.25), '#FFFFFF', 0.9, 'source-over');
  },

  /* ---------- leaves ---------- */
  leaves(t) {
    // fallen, flat on the grass
    this.fallen.forEach(o => {
      const d = E3.depth([o.x, o.y, 0]); if (d < 1) return;
      const c = Math.cos(o.a), s = Math.sin(o.a), q = [[0, o.s * 0.6], [o.s * 0.42, 0], [0, -o.s * 0.5], [-o.s * 0.42, 0]].map(([u, v]) => E3.proj([o.x + u * c - v * s, o.y + u * s + v * c, 0.005]));
      const p = new P(q, true);
      if (OPT.colour) fill(p, this.mix('#E2A93E', '#B97A34', o.c), 0.75); else fill(p, INK, 0.25);
      stroke(p, 1, INK, 0.5, 0.45);
    });
  },
});
