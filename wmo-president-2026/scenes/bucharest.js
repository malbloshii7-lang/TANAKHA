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
// screen 10 m off (its 0.8 m box 75 px wide), the observer 9.5 m (1.75 m, 175 px), the mast 20 m, the trees 45-95 m.
// The living detail (slow): the observer, a man of 1.75 m in a coat with the register in his left hand, walks in from
// the gate side down the path, climbs the ladder, opens the screen's double door (west leaf, then east), reads the
// thermometers and enters them; the cups turn at the rate a 2-4 m/s wind gives them and the vane swings slowly between
// north-west and north-east; a few leaves blown in on the north breeze drift low across the garden and settle (none
// above the trees' line, none smaller than 7 px).
// The print (lt 9.4 to the end) covers plate x 581-925, y 367-609: the screen and the observer stand left of it.
{
  const D2R = Math.PI / 180;
  const v3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: a => Math.hypot(a[0], a[1], a[2]),
    norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u],
    // a + b·k + c·m + d·n
    am: (a, b, k, c = null, m = 0, d = null, n = 0) => {
      const o = [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
      if (c) { o[0] += c[0] * m; o[1] += c[1] * m; o[2] += c[2] * m; }
      if (d) { o[0] += d[0] * n; o[1] += d[1] * n; o[2] += d[2] * n; }
      return o;
    },
  };
  const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); };
  // keyed values [[t, ...values]]: eased from each key to the next, held before the first and after the last
  const keyed = (keys, t) => {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const a = keys[i - 1], b = keys[i], f = easeInOut((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((x, j) => lerp(x, b[j + 1], f)); }
    return keys[keys.length - 1].slice(1);
  };
  // the screen's box (metres from its centre): 0.8 m east-west, 0.6 m north-south, its floor 1.62 m and its top 2.34 m up
  const BOX = { hx: 0.4, hy: 0.3, z0: 1.62, z1: 2.34 };
  // the observer's body, a man of 1.75 m: the hip joints 0.94 m up (thigh 0.44, shin 0.43, the ankle 0.08 up), the
  // shoulder joints 0.51 m above them, 0.38 m apart; upper arm 0.29, forearm 0.26, hand 0.17
  const BODY = { thigh: 0.44, shin: 0.43, ankle: 0.08, hipW: 0.09, hipH: 0.94, sh: 0.51, shW: 0.19, c7: 0.56, ua: 0.29, fa: 0.26, hand: 0.17 };

  scene({
    id: 'bucharest', start: 0, dur: 17,
    init() {
      const r = rng(15420);
      Object.assign(this, { F: 1000, C0: [9.2, 10.6, 1.6], HEAD: 242, PITCH: 7, PUSH: 0.7, SUN: [113.2, 17.6], FENCE: 13, FH: 1.5 });
      // the garden's instruments (metres from its centre; x east, y north)
      this.SCR = [{ x: 2.5, y: 5, main: true }, { x: -1.5, y: 5, main: false }];
      this.MAST = [-11, 9];
      this.GAUGE = [0.5, 1.2]; this.RECORDER = [-4.6, 1.2]; this.HELIO = [-2.5, -3];
      // paths (0.4 m wide): from the gate (on the north side) straight to the thermometer screen, along the north of rows 2
      // and 3, and to the mast and the sunshine recorder
      this.PATHS = [[[2.5, 13], [2.5, 6.6]], [[-3.6, 6.6], [4.5, 6.6]], [[-6.5, 2.6], [4.5, 2.6]], [[4.5, 6.6], [4.5, 2.6]], [[-11, 10.4], [4.5, 10.4]], [[-2.5, -1.6], [-2.5, 2.6]]];
      this.initTrees(r);
      // the low skyline beyond (generic houses of two storeys in gardens) and the far tree line
      this.houses = [];
      for (let i = 0; i < 18; i++) {
        const az = (214 + r() * 56) * D2R, d = 110 + r() * 240, cx = this.C0[0] + d * Math.sin(az), cy = this.C0[1] + d * Math.cos(az);
        this.houses.push({ cx, cy, w: 8 + r() * 6, dpt: 7 + r() * 4, h: 5.5 + r() * 2.2, roof: 2 + r() * 1.6, rot: (r() - 0.5) * 0.6 + az, hip: r() < 0.5, tone: r() });
      }
      this.farLine = Array.from({ length: 160 }, (_, i) => [i / 159, r(), r()]);
      // grass: blades scattered so that they fall evenly over the picture from the eye's first position
      this.view(0);
      this.blades = [];
      const back = (sx, sy) => { const c = E3.cam(), x = (sx - c.cx) / c.f, y = -(sy - c.cy) / c.f, d = [c.F[0] + x * c.R[0] + y * c.U[0], c.F[1] + x * c.R[1] + y * c.U[1], c.F[2] + x * c.R[2] + y * c.U[2]]; if (d[2] >= -1e-4) return null; const k = -c.C[2] / d[2]; return [c.C[0] + k * d[0], c.C[1] + k * d[1], 0]; };
      for (let i = 0; i < 6400; i++) {
        const sx = r() * PW, sy = this.hy + 2 + Math.pow(r(), 0.75) * (PH + 30 - this.hy);
        const g = back(sx, sy); if (!g) continue;
        this.blades.push([g[0], g[1], 0.05 + 0.1 * r(), (r() - 0.5) * 0.05, (r() - 0.5) * 0.05, r()]);
      }
      // fallen leaves lying on the grass (more of them against the fence)
      this.fallen = Array.from({ length: 80 }, () => { const e = r() < 0.35; return { x: e ? -12.7 + r() * 0.6 : -12 + r() * 24, y: e ? -12 + r() * 24 : -12 + r() * 24, a: r() * TAU, s: 0.1 + r() * 0.06, c: r() }; });
      // leaves blown in on the north breeze, low over the garden: [start time, start point]; each drifts south on the
      // breeze, falls at about 0.4 m/s, flutters and turns, and lies where it lands
      this.drift = [[-2.2, [3.4, 13.4, 2.25]], [0.4, [6.4, 12.6, 1.95]], [3.0, [1.2, 13.9, 2.3]], [5.6, [5.6, 10.2, 2.05]], [8.6, [4.6, 9.2, 2.1]], [11.4, [5.8, 9.6, 1.9]], [13.6, [3.9, 8.8, 2.2]]]
        .map(([t0, p], i) => ({ t0, p, s: 0.11 + 0.035 * r(), c: r(), ph: r() * TAU, sp: 0.7 + 0.5 * r(), lat: (r() - 0.5) * 0.6, seed: i }));
      this.initObserver();
    },
    initTrees(r) {
      // lindens, horse chestnuts and maples turning (gold, amber, the chestnuts' early brown), a few still green, along
      // the grounds' west and south-west edges and in the gardens beyond. Their kinds and places are generic (not
      // surveyed): each tree has its own seed, so the belt stays as composed; behind the white screens stand the darker
      // chestnuts and greens (the screens read against them), the gold lindens and amber maples elsewhere
      this.trees = [];
      const kinds = {
        linden: { h: [15, 21], R: [4.6, 6.2], base: [3, 4.5], v: 1.2, lit: '#E8C83A', sh: '#857A24', g: ['#AFC24E', '#4F6B30'], turn: [0.65, 0.95] },
        chestnut: { h: [13, 18], R: [5, 6.6], base: [2.6, 3.8], v: 0.95, lit: '#D8983C', sh: '#7A4E28', g: ['#A6BB4E', '#4C6A32'], turn: [0.7, 1] },
        maple: { h: [12, 17], R: [4, 5.4], base: [2.6, 3.6], v: 1.05, lit: '#F2AE30', sh: '#A65E24', g: ['#AABC4E', '#4E6B32'], turn: [0.75, 1] },
        green: { h: [13, 19], R: [4.4, 5.8], base: [3, 4], v: 1.1, lit: '#A2C052', sh: '#3F6030', g: ['#A2C052', '#3F6030'], turn: [0, 0] },
      };
      this.view(0);
      const place = [];
      // the grounds' west edge (a staggered belt with gaps, where the low roofs show), the gardens beyond, the south edge
      for (let i = 0; i < 20; i++) { const q = rng(9100 + i); place.push([-41 - q() * 8, -64 + i * 7.1 + (q() - 0.5) * 3, 0.9 + 0.25 * q(), i % 6 === 4]); }
      for (let i = 0; i < 13; i++) { const q = rng(9200 + i); place.push([-60 - q() * 14, -60 + i * 10.6 + (q() - 0.5) * 4, 0.85 + 0.3 * q(), false]); }
      for (let i = 0; i < 5; i++) { const q = rng(9300 + i); place.push([-36 + i * 8.6 + (q() - 0.5) * 2, -59 - q() * 7, 0.9 + 0.25 * q(), i === 2]); }
      for (let i = 0; i < 5; i++) { const q = rng(9400 + i); place.push([-66 + i * 12 + (q() - 0.5) * 3, -80 - q() * 12, 0.9 + 0.3 * q(), false]); }
      const scr = E3.proj([this.SCR[0].x, this.SCR[0].y, 2]), scr2 = E3.proj([this.SCR[1].x, this.SCR[1].y, 2]);
      place.forEach(([x, y, sz, gap], i) => {
        if (gap) return;
        const q = rng(9500 + i), sx = E3.proj([x, y, 10])[0];
        const behind = Math.abs(sx - scr[0]) < 110 || Math.abs(sx - scr2[0]) < 70;
        const u = q(), kind = behind ? (u < 0.55 ? 'chestnut' : 'green') : sx > 640 ? (u < 0.5 ? 'linden' : u < 0.85 ? 'maple' : 'green') : (u < 0.45 ? 'maple' : u < 0.85 ? 'linden' : 'chestnut');
        const K = kinds[kind], g = a => lerp(a[0], a[1], q());
        const h = g(K.h) * sz, R = g(K.R) * sz, base = g(K.base), Rv = (h - base) / 2 * K.v, zc = base + (h - base) / 2;
        const lobes = [], N = 72;
        for (let j = 0; j < N; j++) {
          // clusters spread evenly over the crown (a jittered Fibonacci sphere), each a rounded mass of leaves
          const zz = 1 - 2 * (j + 0.5) / N + (q() - 0.5) * 0.04, rr0 = Math.sqrt(Math.max(0, 1 - zz * zz)), ph = j * 2.39996 + (q() - 0.5) * 0.5;
          const ux = rr0 * Math.cos(ph), uy = rr0 * Math.sin(ph), uz = zz, k = 0.7 + 0.22 * q();
          lobes.push({ p: [x + R * k * ux, y + R * k * uy, zc + Rv * k * uz], n: v3.norm([ux, uy, uz + 0.25]), rr: (0.2 + 0.1 * q()) * R, s: q() * 1000 | 0, deep: k, low: uz, tw: q() });
        }
        const turn = g(K.turn);
        this.trees.push({ x, y, h, R, Rv, zc, base, kind, lobes, lit: this.mix(K.g[0], K.lit, turn), sh: this.mix(K.g[1], K.sh, turn), trunk: 0.2 + 0.16 * q(), lean: (q() - 0.5) * 0.05, seed: q() * 1e6 | 0 });
      });
    },
    // the eye: just inside the garden's north-east corner, 1.6 m up, easing 0.8 m forward over the beat
    view(t) {
      const u = easeInOut(clamp((t + 0.45) / 17.9)), h = this.HEAD * D2R, p = this.PITCH * D2R;
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
      this.pose = this.poseAt(t);
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
    // a line of bare paper along a path (the white an engraver leaves round a near object, to part it from what is behind)
    halo(path, lw) {
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA; ctx.strokeStyle = PAPER_PAT; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); path.trace(ctx, 1); ctx.stroke(); ctx.restore();
    },

    /* ---------- the sky: cloudless (N 0), ruled as an engraver rules it, deeper overhead ---------- */
    sky() {
      const hy = this.hy;
      if (OPT.colour) washFade([0, -4, PW, hy + 3], [[0, '#3A84CE', 0.72], [0.4, '#5A9BD6', 0.55], [0.78, '#92BDE2', 0.34], [1, '#C0D5E2', 0.22]], 0, 1);
      const NB = 12, bands = Array.from({ length: NB + 1 }, () => []), k = OPT.colour ? 0.4 : 1;
      let row = 0;
      for (let y = 2; y < hy - 2; y += 4.1, row++) {
        const e = (hy - y) / hy;
        for (let x = 0, j = 0; x < PW; x += 9, j++) {
          const a = (0.08 + 0.46 * Math.pow(e, 0.85)) * k, h = ((row * 73856093) ^ (j * 19349663)) >>> 0;
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
      const hy = this.hy, C = E3.cam().C, f = this.F;
      // the far tree line (1-2 km): a soft scalloped band a degree or so high, in the haze
      const pts = [];
      for (let i = 0; i < this.farLine.length; i++) {
        const [u, a] = this.farLine[i], x = u * (PW + 40) - 20;
        pts.push([x, hy - (0.011 + 0.01 * a + 0.006 * Math.sin(u * 37) + 0.004 * Math.sin(u * 91)) * f]);
      }
      const band = new P([[-20, hy + 2], ...pts, [PW + 20, hy + 2]], true);
      if (OPT.colour) wash(band, '#9AAE9A', 0.42);
      hatch(band, [-20, hy - 40, PW + 20, hy + 3], 0, 2.4, 1, INK, 0.55, 0.13, 15001);
      stroke(new P(pts), 1, INK, 0.6, 0.2);
      // the houses (110-350 m): two storeys under hipped or gabled roofs of clay tile, rendered walls, seen between the
      // trees' trunks
      this.houses.slice().sort((a, b) => Math.hypot(b.cx - C[0], b.cy - C[1]) - Math.hypot(a.cx - C[0], a.cy - C[1])).forEach((o, i) => {
        const c = Math.cos(o.rot), s = Math.sin(o.rot), P2 = (u, v, z) => [o.cx + u * c + v * s, o.cy - u * s + v * c, z];
        const hw = o.w / 2, hd = o.dpt / 2, d = Math.hypot(o.cx - C[0], o.cy - C[1]), hz = this.haze(d), a = 0.9 - hz * 2.5;
        const walls = [[P2(-hw, -hd, 0), P2(hw, -hd, 0), P2(hw, -hd, o.h), P2(-hw, -hd, o.h)], [P2(hw, -hd, 0), P2(hw, hd, 0), P2(hw, hd, o.h), P2(hw, -hd, o.h)],
          [P2(hw, hd, 0), P2(-hw, hd, 0), P2(-hw, hd, o.h), P2(hw, hd, o.h)], [P2(-hw, hd, 0), P2(-hw, -hd, 0), P2(-hw, -hd, o.h), P2(-hw, hd, o.h)]];
        const ridge = o.hip ? [P2(-hw * 0.4, 0, o.h + o.roof), P2(hw * 0.4, 0, o.h + o.roof)] : [P2(-hw, 0, o.h + o.roof), P2(hw, 0, o.h + o.roof)];
        const roofs = [[P2(-hw, -hd, o.h), P2(hw, -hd, o.h), ridge[1], ridge[0]], [P2(hw, hd, o.h), P2(-hw, hd, o.h), ridge[0], ridge[1]]];
        if (o.hip) roofs.push([P2(hw, -hd, o.h), P2(hw, hd, o.h), ridge[1]], [P2(-hw, hd, o.h), P2(-hw, -hd, o.h), ridge[0]]);
        else { walls[1] = [P2(hw, -hd, 0), P2(hw, hd, 0), P2(hw, hd, o.h), ridge[1], P2(hw, -hd, o.h)]; walls[3] = [P2(-hw, hd, 0), P2(-hw, -hd, 0), P2(-hw, -hd, o.h), ridge[0], P2(-hw, hd, o.h)]; }
        const wst = { tone: 0.02, shade: 0.35, lw: 0.6, edgeA: 0.45 * a, fillCol: OPT.colour ? this.mix(this.mix('#EBDDBF', '#D9C9A6', o.tone), '#C8D2D6', hz * 3) : null, fillA: 0.4, hdir: [0, 0, 1] };
        const rst = { tone: 0.18, shade: 0.35, lw: 0.6, edgeA: 0.5 * a, fillCol: OPT.colour ? this.mix(this.mix('#A8714E', '#8F7A66', o.tone), '#B8C2C8', 0.2 + hz * 3) : null, fillA: 0.45, hdir: [c, -s, 0] };
        E3.solid(walls, wst, 15100 + i * 17);
        roofs.forEach((q, k) => E3.face(q, rst, 15200 + i * 17 + k));
      });
    },

    /* ---------- the grounds' lawn beyond the garden, and a low hedge at their edge ---------- */
    lawn() {
      const hy = this.hy;
      if (OPT.colour) washFade([0, hy - 1, PW, PH], [[0, '#97AE6A', 0.45], [0.2, '#8CB058', 0.52], [1, '#82A84C', 0.58]], 0, 1);
      // the hedge, about 1.6 m, along the grounds' west and south edges (their line from OSM's outline of the grounds)
      [[[-36, -62], [-36, 74]], [[-36, -62], [12, -62]]].forEach((hl, k) => {
        const top = [], bot = [];
        for (let i = 0; i <= 80; i++) {
          const u = i / 80, x = lerp(hl[0][0], hl[1][0], u), y = lerp(hl[0][1], hl[1][1], u), zt = 1.5 + 0.22 * Math.sin(i * 1.7 + k) + 0.14 * Math.sin(i * 4.3);
          if (E3.depth([x, y, 0]) < 1) continue;
          top.push(E3.proj([x, y, zt])); bot.push(E3.proj([x, y, 0]));
        }
        if (top.length < 2) return;
        const body = new P(top.concat(bot.reverse()), true);
        mask(body);
        if (OPT.colour) wash(body, '#5C7C3E', 0.58);
        hatch(body, this.bbox(body), -0.25, 2.1, 1, INK, 0.6, 0.34, 15300 + k);
        stroke(new P(top), 1, INK, 0.7, 0.45);
      });
    },

    /* ---------- the trees: lit from behind the eye's left, their shaded side hatched ---------- */
    drawTrees() {
      const S = this.S;
      const list = this.trees.map(T => ({ T, d: E3.depth([T.x, T.y, T.zc]) })).filter(o => o.d > 5).sort((a, b) => b.d - a.d);
      const ticks = [];
      list.forEach(({ T, d }) => {
        const ppm = this.ppm(d), a = R11.air(d, 380), hz = this.haze(d);
        const pc = E3.proj([T.x, T.y, T.zc]), rpx = T.R * ppm * 1.4;
        if (pc[0] + rpx < -10 || pc[0] - rpx > PW + 10) return;
        // the trunk, from the ground into the crown, and its first limbs
        const tw = T.trunk * ppm, b0 = E3.proj([T.x, T.y, 0]), b1 = E3.proj([T.x + T.lean * T.h, T.y, T.base + T.Rv * 0.6]);
        const trunk = new P([[b0[0] - tw, b0[1]], [b1[0] - tw * 0.55, b1[1]], [b1[0] + tw * 0.55, b1[1]], [b0[0] + tw, b0[1]]], true);
        mask(trunk);
        if (OPT.colour) wash(trunk, this.mix('#5E5144', '#9AA4AA', hz * 3), 0.6);
        hatch(trunk, this.bbox(trunk), Math.PI / 2, 1.9, 1, INK, 0.6, 0.42 * a, T.seed);
        stroke(trunk, 1, INK, 0.7, 0.6 * a);
        [[-1, 0.8], [1, 0.6], [0.3, 1]].forEach(([sd, k]) => {
          const p0 = E3.proj([T.x, T.y, T.base + 0.3]), p1 = E3.proj([T.x + sd * T.R * 0.5, T.y - sd * 0.3, T.base + T.Rv * k]);
          stroke(new P([p0, p1]), 1, INK, Math.max(0.6, tw * 0.5), 0.5 * a);
        });
        // the crown: clusters of foliage, far to near, each masking what is behind it, washed from the shade colour to
        // the lit, the shaded ones hatched; cupped leaf-marks over them
        const lit = this.mix(T.lit, '#C4CCC8', hz * 3), shc = this.mix(T.sh, '#A9B4BC', hz * 3);
        // the light's direction on the plate (the sun is behind the eye: it comes from the upper left)
        const cam = E3.cam(), Ls = [E3.dot(S, cam.R), -E3.dot(S, cam.U)], ll = Math.hypot(Ls[0], Ls[1]), L2 = [Ls[0] / ll, Ls[1] / ll];
        T.lobes.map(L => ({ L, d: E3.depth(L.p) })).sort((x, y) => y.d - x.d).forEach(({ L, d: dl }, li) => {
          const c = E3.proj(L.p), rr = L.rr * this.ppm(dl);
          if (rr < 1) return;
          // a cluster's light: turned to the sun, out at the crown's surface rather than deep in it, above the crown's
          // middle rather than under it
          const lum = clamp((0.2 + 0.85 * Math.max(0, E3.dot(L.n, S)) + 0.1 * L.n[2]) * (0.55 + 0.45 * clamp(L.deep)) * (0.82 + 0.18 * clamp(L.low + 1)));
          const pts = [], m = 7 + (L.s % 3);
          for (let k = 0; k < 40; k++) { const th = k / 40 * TAU, rad = rr * (0.9 + 0.1 * Math.abs(Math.sin(th * m * 0.5 + L.s))); pts.push([c[0] + rad * Math.cos(th), c[1] + rad * Math.sin(th) * 0.92]); }
          const path = new P(pts, true), bx = [c[0] - rr - 2, c[1] - rr - 2, c[0] + rr + 2, c[1] + rr + 2];
          mask(path);
          const tint = this.mix(lit, shc, 0.12 * L.tw);
          if (OPT.colour) wash(path, this.mix(shc, tint, 0.45 + 0.55 * lum), 0.74);
          // the shaded side of the cluster: the part of it a disc moved toward the light does not cover
          const k = 0.22 + 0.6 * (1 - lum), off = new P(Array.from({ length: 28 }, (_, j) => { const th = j / 28 * TAU; return [c[0] + L2[0] * k * rr + rr * 0.98 * Math.cos(th), c[1] + L2[1] * k * rr + rr * 0.98 * Math.sin(th)]; }), true);
          ctx.save(); ctx.beginPath(); path.trace(ctx, 1); off.trace(ctx, 1); ctx.clip('evenodd');
          if (OPT.colour) wash(path, shc, 0.22);
          hatch(path, bx, -0.75, 1.7 + 1.4 * lum, 1, INK, 0.55, (0.26 + 0.16 * (1 - lum)) * a, T.seed + li);
          ctx.restore();
          // the cluster's edge cut firmly only on its shaded side (the light side left open), a hairline elsewhere
          stroke(path, 1, INK, 0.5, 0.1 * a);
          const a0 = Math.atan2(-L2[1], -L2[0]), arc = [];
          for (let k2 = 0; k2 <= 14; k2++) { const th = a0 - 1.35 + 2.7 * k2 / 14, rad = rr * (0.9 + 0.1 * Math.abs(Math.sin(th * m * 0.5 + L.s))); arc.push([c[0] + rad * Math.cos(th), c[1] + rad * Math.sin(th) * 0.92]); }
          stroke(new P(arc), 1, INK, 0.7, (0.3 + 0.35 * (1 - lum)) * a);
          // leaf-marks: small cups in loose rows, closer toward the shade
          const rg = rng(L.s + 7), nm = Math.round(5 + 8 * (1 - lum));
          for (let k2 = 0; k2 < nm; k2++) {
            const u = rg() * 2 - 1, v = rg() * 2 - 1; if (u * u + v * v > 0.85) continue;
            const sd = u * L2[0] + v * L2[1];
            ticks.push([c[0] + u * rr * 0.9, c[1] + v * rr * 0.85, Math.max(1, rr * 0.11), clamp((0.2 + 0.35 * (1 - lum)) * (1 - 0.5 * sd)) * a]);
          }
        });
      });
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
      const Fz = this.FENCE, H = this.FH;
      [[[-Fz, -Fz], [-Fz, Fz]], [[-Fz, -Fz], [Fz, -Fz]]].forEach(([a, b], k) => {
        const q = this.poly([[a[0], a[1], 0.08], [b[0], b[1], 0.08], [b[0], b[1], H], [a[0], a[1], H]]);
        if (!q) return;
        const bb = this.bbox(q);
        hatch(q, bb, 0.78, 3.0, 1, INK, 0.45, 0.13, 15400 + k);
        hatch(q, bb, -0.78, 3.0, 1, INK, 0.45, 0.13, 15410 + k);
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

    /* ---------- the garden's ground: mown grass, gravel paths, the bare-soil plot ---------- */
    garden(t) {
      const Fz = this.FENCE;
      const g = this.poly([[-Fz, -Fz, 0], [Fz, -Fz, 0], [Fz, Fz, 0], [-Fz, Fz, 0]]);
      if (g && OPT.colour) wash(g, '#86B04A', 0.3);
      this.PATHS.forEach(([a, b], k) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ex = dx / L * 0.2, ey = dy / L * 0.2, nx = -ey, ny = ex;
        const q = this.poly([[a[0] - nx - ex, a[1] - ny - ey, 0], [b[0] - nx + ex, b[1] - ny + ey, 0], [b[0] + nx + ex, b[1] + ny + ey, 0], [a[0] + nx - ex, a[1] + ny - ey, 0]]);
        if (!q) return;
        mask(q, 0.85);
        if (OPT.colour) wash(q, '#D9C49A', 0.55);
        hatch(q, this.bbox(q), 0.05, 2.4, 1, INK, 0.5, 0.12, 15500 + k);
        E3.line([[a[0] - nx, a[1] - ny, 0], [b[0] - nx, b[1] - ny, 0]], INK, 0.6, 0.35);
        E3.line([[a[0] + nx, a[1] + ny, 0], [b[0] + nx, b[1] + ny, 0]], INK, 0.6, 0.35);
      });
      const plot = this.poly([[-2, -10.5, 0], [2.5, -10.5, 0], [2.5, -8, 0], [-2, -8, 0]]);
      if (plot) { mask(plot); if (OPT.colour) wash(plot, '#A7835A', 0.55); hatch(plot, this.bbox(plot), 0.02, 1.8, 1, INK, 0.5, 0.3, 15520); stroke(plot, 1, INK, 0.6, 0.4); }
      const segs = [];
      this.blades.forEach(([x, y, h, lx, ly, w]) => {
        const d = E3.depth([x, y, 0]);
        if (d < 0.8) return;
        if (Math.abs(x) < Fz && Math.abs(y) < Fz && this.onPath(x, y)) return;
        const a = E3.proj([x, y, 0]), b = E3.proj([x + lx, y + ly, h]);
        segs.push([a[0], a[1], b[0], b[1], (0.16 + 0.3 * w) * clamp(1.2 - d / 120)]);
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
      const { hx, hy, z0, z1 } = BOX;
      this.SCR.forEach(sc => {
        const { x, y } = sc, b = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]];
        out.push(hullOf(b.flatMap(([u, v]) => [[x + u * 1.2, y + v * 1.3, z0], [x + u * 1.2, y + v * 1.3, z1 + 0.18]])));
        [[-0.33, -0.23], [0.33, -0.23], [0.33, 0.23], [-0.33, 0.23]].forEach(([u, v]) => out.push(hullOf([[x + u - 0.03, y + v, 0], [x + u + 0.03, y + v, 0], [x + u + 0.03, y + v, z0], [x + u - 0.03, y + v, z0]])));
      });
      const [mx, my] = this.MAST;
      out.push(hullOf([[mx - 0.05, my, 0], [mx + 0.05, my, 0], [mx + 0.04, my, 10], [mx - 0.04, my, 10]]));
      out.push(hullOf([[mx, my - 0.7, 9.83], [mx, my + 0.7, 9.83], [mx, my + 0.7, 9.88], [mx, my - 0.7, 9.88]]));
      const [gx, gy] = this.GAUGE; out.push(hullOf([[gx - 0.08, gy, 0], [gx + 0.08, gy, 0], [gx + 0.08, gy, 1], [gx - 0.08, gy, 1]]));
      const [rx, ry] = this.RECORDER; out.push(hullOf([[rx - 0.17, ry, 0], [rx + 0.17, ry, 0], [rx + 0.17, ry, 1.25], [rx - 0.17, ry, 1.25]]));
      const [hx2, hy2] = this.HELIO; out.push(hullOf([[hx2 - 0.15, hy2, 0], [hx2 + 0.15, hy2, 0], [hx2 + 0.15, hy2, 1.45], [hx2 - 0.15, hy2, 1.45]]));
      this.observerShadow(out, hullOf);
      return out.filter(Boolean);
    },
    shadows(t) {
      const list = this.shadowPolys(t);
      if (!list.length) return;
      if (OPT.colour) { ctx.save(); ctx.beginPath(); list.forEach(p => p.trace(ctx, 1)); ctx.globalAlpha = SA * 0.42; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#4A6684'; ctx.fill('nonzero'); ctx.restore(); }
      hatch(list, [0, this.hy, PW, PH], 0.12, 2.2, 1, INK, 0.6, OPT.colour ? 0.22 : 0.34, 15600);
    },

    /* ---------- the instruments and the observer, far to near ---------- */
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
    // a face of a white-painted part: bare paper where the sun is on it, a cool wash and a ruled shade where it is not
    wface(pts, seed, { edgeA = 0.85, lw = 1.2, n = null } = {}) {
      const st = { tone: 0, shade: 0, lw, edgeA, noHatch: true };
      if (n) st.n = n;
      const f = E3.face(pts, st, seed);
      if (!f) return null;
      const lit = Math.max(0, E3.dot(f.n, this.S)), sh = 1 - lit;
      if (OPT.colour) { if (sh > 0.3) wash(f.path, '#8FA5C0', 0.44 * sh); else wash(f.path, '#F3E5C2', 0.22); }
      if (sh > 0.3) hatch(f.path, this.bbox(f.path), Math.PI / 2, 2.6 - 0.8 * sh, 1, INK, 0.55, 0.1 + 0.2 * sh, seed + 3);
      return f;
    },
    // the louvres of a screen face: the edge of each slat and the dark slot under it (the inside is black)
    louvres(a, b, z0, z1, n, d, sh) {
      const L = [], al = 0.3 + 0.3 * sh;
      for (let k = 1; k < n; k++) { const z = lerp(z0, z1, k / n); L.push([[a[0], a[1], z], [b[0], b[1], z], al]); }
      E3.segments(L, INK, this.lw(0.012, d, 0.5, 1.1));
    },
    // a louvred screen: four legs braced and fixed to concrete stubs, the box, the double roof, the double door to the
    // north, and its ladder; the main one with its door opening, the black inside, the thermometers and the observer
    screen(sc, t) {
      const { x, y } = sc, d = E3.depth([x, y, 2]), { hx, hy, z0, z1 } = BOX;
      const open = sc.main ? this.doorOpen(t) : [0, 0];
      const legs = [[-0.33, -0.23], [0.33, -0.23], [0.33, 0.23], [-0.33, 0.23]];
      legs.map(([u, v]) => ({ u, v, d: E3.depth([x + u, y + v, 1]) })).sort((a, b) => b.d - a.d).forEach(({ u, v }, i) => {
        E3.solid(E3.box(x + u - 0.075, x + u + 0.075, y + v - 0.075, y + v + 0.075, 0, 0.25), { tone: 0.14, shade: 0.5, lw: 0.9, edgeA: 0.7, fillCol: OPT.colour ? '#B8B2A6' : null, fillA: 0.4 }, 15700 + i);
        E3.solid(E3.box(x + u - 0.035, x + u + 0.035, y + v - 0.035, y + v + 0.035, 0.12, z0), { tone: 0, shade: 0.45, lw: 1, edgeA: 0.85, fillCol: OPT.colour ? '#E8E2D2' : null, fillA: 0.25 }, 15710 + i);
      });
      // the braces: a rail round the legs and a diagonal on each side
      const L = (p, q, z0b, z1b) => E3.line([[x + p[0], y + p[1], z0b], [x + q[0], y + q[1], z1b]], INK, this.lw(0.035, d, 0.6, 1.5), 0.75);
      [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j]) => { L(legs[i], legs[j], 0.8, 0.8); L(legs[i], legs[j], 0.85, 1.55); });
      if (open[0] > 0.01 || open[1] > 0.01) this.inside(sc, d);
      const B = (u, v, z) => [x + u, y + v, z];
      const faces = { S: [B(-hx, -hy, z0), B(hx, -hy, z0), B(hx, -hy, z1), B(-hx, -hy, z1)], E: [B(hx, -hy, z0), B(hx, hy, z0), B(hx, hy, z1), B(hx, -hy, z1)],
        N: [B(hx, hy, z0), B(-hx, hy, z0), B(-hx, hy, z1), B(hx, hy, z1)], W: [B(-hx, hy, z0), B(-hx, -hy, z0), B(-hx, -hy, z1), B(-hx, hy, z1)],
        Bt: [B(-hx, -hy, z0), B(-hx, hy, z0), B(hx, hy, z0), B(hx, -hy, z0)] };
      const norms = { S: [0, -1, 0], E: [1, 0, 0], N: [0, 1, 0], W: [-1, 0, 0], Bt: [0, 0, -1] };
      ['S', 'W', 'E', 'Bt'].forEach((k, i) => {
        const f = this.wface(faces[k], 15720 + i, { n: norms[k] });
        if (f && k !== 'Bt') { const q = faces[k], sh = 1 - Math.max(0, E3.dot(norms[k], this.S)); this.louvres(q[0], q[1], z0 + 0.03, z1 - 0.03, 20, d, sh); }
      });
      if (open[0] < 0.01 && open[1] < 0.01) {
        const f = this.wface(faces.N, 15730, { n: norms.N });
        if (f) { this.louvres(faces.N[0], faces.N[1], z0 + 0.03, z1 - 0.03, 20, d, 1); E3.line([B(0, hy + 0.004, z0), B(0, hy + 0.004, z1)], INK, this.lw(0.012, d, 0.5, 1), 0.85); }
      } else {
        // the open doorway's frame: the jambs, the lintel and the sill
        const fr = { tone: 0, shade: 0.3, lw: 1, edgeA: 0.85, noHatch: true, n: [0, 1, 0] };
        E3.face([B(-hx, hy, z0), B(hx, hy, z0), B(hx, hy, z0 + 0.04), B(-hx, hy, z0 + 0.04)], fr, 15731);
        E3.face([B(-hx, hy, z1 - 0.04), B(hx, hy, z1 - 0.04), B(hx, hy, z1), B(-hx, hy, z1)], fr, 15732);
        E3.face([B(hx - 0.035, hy, z0), B(hx, hy, z0), B(hx, hy, z1), B(hx - 0.035, hy, z1)], fr, 15733);
        E3.face([B(-hx, hy, z0), B(-hx + 0.035, hy, z0), B(-hx + 0.035, hy, z1), B(-hx, hy, z1)], fr, 15734);
      }
      // the double roof: a ceiling board, then the upper roof standing off it on blocks (the air between), falling to the
      // south, its top white-painted cloth
      E3.solid(E3.box(x - hx - 0.03, x + hx + 0.03, y - hy - 0.03, y + hy + 0.03, z1, z1 + 0.035), { tone: 0, shade: 0.45, lw: 1, edgeA: 0.85, noHatch: true }, 15740);
      [[-hx + 0.06, -hy + 0.06], [hx - 0.06, -hy + 0.06], [hx - 0.06, hy - 0.06], [-hx + 0.06, hy - 0.06]].forEach(([u, v], i) => E3.solid(E3.box(x + u - 0.03, x + u + 0.03, y + v - 0.03, y + v + 0.03, z1 + 0.035, z1 + 0.11), { tone: 0.2, shade: 0.4, lw: 0.6, edgeA: 0.6, noHatch: true }, 15741 + i));
      const ro = 0.1, rz = z1 + 0.11, rs = 0.04;
      const roof = [[x - hx - ro, y - hy - ro, rz - rs], [x + hx + ro, y - hy - ro, rz - rs], [x + hx + ro, y + hy + ro, rz + rs], [x - hx - ro, y + hy + ro, rz + rs]];
      const top = roof.map(p => [p[0], p[1], p[2] + 0.04]);
      const rf = [top, [roof[0], roof[1], top[1], top[0]], [roof[1], roof[2], top[2], top[1]], [roof[2], roof[3], top[3], top[2]], [roof[3], roof[0], top[0], top[3]], roof.slice().reverse()];
      E3.solid(rf, { tone: 0, shade: 0.45, lw: 1.1, edgeA: 0.9, noHatch: true, fillCol: OPT.colour ? '#F4EBD2' : null, fillA: 0.2 }, 15750);
      // the leaves, the ladder and (the main screen) the observer, in the order they stand from the eye
      const C = E3.cam().C;
      const parts = [];
      parts.push({ d: E3.depth(this.leafMid(sc, -1, open[0])), draw: () => this.leaf(sc, -1, open[0], d) });
      parts.push({ d: E3.depth(this.leafMid(sc, 1, open[1])), draw: () => this.leaf(sc, 1, open[1], d) });
      parts.push({ d: E3.depth([x, y + 0.75, 0.4]) + 0.3, draw: () => this.ladder(sc, d, -1) });
      parts.push({ d: E3.depth([x + 0.25, y + 0.75, 0.4]) - 0.05, draw: () => this.ladder(sc, d, 1) });
      if (sc.main) parts.push({ d: E3.depth(v3.add(this.pose.pelvis, [0, 0, 0.3])), draw: () => this.observer(t) });
      R11.paint(parts);
    },
    // the door's leaves: hinged at the north face's corners, opening outward about their hinges (angle in radians; 0
    // shut). at(w, n): the point w along the leaf from its hinge, n off its inner face
    leafAt(sc, side, ang) {
      const { x, y } = sc, { hx, hy } = BOX, hingeX = x + side * hx, c = Math.cos(ang), s = Math.sin(ang);
      return (w, n) => [hingeX - side * (w * c - n * s), y + hy + w * s + n * c];
    },
    leafMid(sc, side, ang) { const at = this.leafAt(sc, side, ang), p = at(0.2, 0.01); return [p[0], p[1], 2]; },
    // the latch on a leaf's free edge (the observer's hand finds it there)
    latch(sc, side, ang) { const at = this.leafAt(sc, side, ang), p = at(BOX.hx - 0.045, 0.04); return [p[0], p[1], 1.99]; },
    leaf(sc, side, ang, d) {
      const at = this.leafAt(sc, side, ang), z0 = BOX.z0 + 0.01, z1 = BOX.z1 - 0.01, th = 0.022, w = BOX.hx;
      const q = (a, b) => { const p = at(a[0], a[1]), r = at(b[0], b[1]); return [[p[0], p[1], z0], [r[0], r[1], z0], [r[0], r[1], z1], [p[0], p[1], z1]]; };
      const out = q([0, th], [w, th]), inn = q([w, 0], [0, 0]), edge = q([w, th], [w, 0]);
      const o0 = at(0, 0), o1 = at(0, 1), nOut = v3.norm([o1[0] - o0[0], o1[1] - o0[1], 0]), C = E3.cam().C;
      const seesOut = E3.dot(nOut, E3.sub(C, E3.centroid(out))) > 0;
      if (seesOut) {
        const f = this.wface(out, 15760 + side, { n: nOut });
        if (f) { const sh = 1 - Math.max(0, E3.dot(nOut, this.S)); this.louvres(out[0], out[1], z0 + 0.02, z1 - 0.02, 20, d, sh); }
      } else E3.face(inn, { n: [-nOut[0], -nOut[1], 0], tone: 0.75, shade: 0.1, lw: 1, edgeA: 0.85, fillCol: INK, fillA: 0.55 }, 15762 + side);
      E3.face(edge, { tone: 0, shade: 0.3, lw: 0.8, edgeA: 0.8, noHatch: true }, 15764 + side);
      const tp = [at(0, 0), at(w, 0), at(w, th), at(0, th)].map(p => [p[0], p[1], z1]);
      E3.face(tp, { tone: 0, shade: 0.3, lw: 0.8, edgeA: 0.8, noHatch: true, n: [0, 0, 1] }, 15766 + side);
      if (seesOut) { const p = at(w - 0.045, th + 0.012); E3.line([[p[0], p[1], 1.96], [p[0], p[1], 2.03]], INK, this.lw(0.014, d, 0.8, 1.8), 0.9); }
    },
    inside(sc, d) {
      const { x, y } = sc, hx = BOX.hx - 0.02, hy = BOX.hy - 0.02, z0 = BOX.z0 + 0.02, z1 = BOX.z1 - 0.02, yo = y + BOX.hy;
      const dark = { tone: 0.8, shade: 0, lw: 0.8, edgeA: 0.6, fillCol: INK, fillA: 0.64 };
      E3.face([[x - hx, y - hy, z0], [x + hx, y - hy, z0], [x + hx, y - hy, z1], [x - hx, y - hy, z1]], Object.assign({ n: [0, 1, 0] }, dark), 15770);
      E3.face([[x - hx, yo, z0], [x - hx, y - hy, z0], [x - hx, y - hy, z1], [x - hx, yo, z1]], Object.assign({ n: [1, 0, 0] }, dark), 15771);
      E3.face([[x + hx, yo, z0], [x + hx, y - hy, z0], [x + hx, y - hy, z1], [x + hx, yo, z1]], Object.assign({ n: [-1, 0, 0] }, dark), 15772);
      E3.face([[x - hx, y - hy, z1], [x + hx, y - hy, z1], [x + hx, yo, z1], [x - hx, yo, z1]], Object.assign({ n: [0, 0, -1] }, dark), 15773);
      E3.face([[x - hx, y - hy, z0], [x - hx, yo, z0], [x + hx, yo, z0], [x + hx, y - hy, z0]], Object.assign({ n: [0, 0, 1] }, dark), 15774);
      // the thermometers' stand: the psychrometer's dry and wet thermometers upright, the maximum and minimum lying across
      // below them, the hair hygrometer's frame to one side: their white scales the light things in the dark
      const pale = (a, b, w) => { const pa = E3.proj(a), pb = E3.proj(b); ctx.save(); ctx.globalAlpha = SA * 0.95; ctx.strokeStyle = '#F1ECDF'; ctx.lineWidth = Math.max(1, w * this.ppm(d)); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); ctx.restore(); };
      E3.line([[x - 0.17, y - 0.06, 1.78], [x + 0.17, y - 0.06, 1.78]], '#2A241E', this.lw(0.02, d, 0.8, 2), 0.9);
      pale([x - 0.08, y - 0.02, 1.86], [x - 0.08, y - 0.02, 2.21], 0.02);
      pale([x + 0.03, y - 0.02, 1.86], [x + 0.03, y - 0.02, 2.21], 0.02);
      pale([x - 0.16, y - 0.07, 1.84], [x + 0.13, y - 0.07, 1.84], 0.015);
      pale([x - 0.16, y - 0.07, 1.8], [x + 0.13, y - 0.07, 1.8], 0.015);
      const cup = E3.proj([x + 0.03, y - 0.02, 1.83]);
      disc(cup[0], cup[1], Math.max(1.2, 0.022 * this.ppm(d)), '#E8E4D8', 0.9, 'source-over');
      pale([x + 0.22, y - 0.12, 1.95], [x + 0.22, y - 0.12, 2.24], 0.035);
    },
    // the three-step ladder before the door: wooden treads on a metal frame (side: -1 west rail and the treads, 1 the
    // east rail)
    TREADS: [[0.56, 0.22], [0.38, 0.44], [0.2, 0.66]],
    ladder(sc, d, side) {
      const { x, y } = sc, w = 0.25, yn = y + BOX.hy, col = OPT.colour;
      const rail = s => {
        E3.line([[x + s * w, yn + 0.66, 0], [x + s * w, yn + 0.1, 0.8]], INK, this.lw(0.03, d, 0.8, 1.7), 0.9);
        E3.line([[x + s * w, yn + 0.1, 0.8], [x + s * w, yn + 0.02, 0]], INK, this.lw(0.025, d, 0.7, 1.4), 0.8);
        E3.line([[x + s * w, yn + 0.1, 0.8], [x + s * w, yn + 0.03, 1.0]], INK, this.lw(0.025, d, 0.7, 1.4), 0.8);
      };
      if (side < 0) {
        rail(-1);
        this.TREADS.forEach(([v, z], i) => E3.solid(E3.box(x - w, x + w, yn + v - 0.1, yn + v + 0.1, z - 0.03, z), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85, fillCol: col ? '#B98A55' : null, fillA: 0.5 }, 15780 + i));
      } else rail(1);
    },
    // the door over the beat (radians, west leaf then east): shut until the observer's hand is on it
    doorOpen(t) { return [1.85 * easeInOut(prog(t, 8.0, 0.8)), 1.85 * easeInOut(prog(t, 9.15, 0.8))]; },

    /* ---------- the observer ---------- */
    // the walk, from footsteps: he comes in from the gate down the east path at 1.3 m/s (steps of 0.65 m, two a
    // second), turns along the screens' row, stops at the ladder's foot, turns to face the door, and climbs to the second
    // tread. Each foot lands, stands while the body passes over it (60% of the stride), swings to its next place.
    initObserver() {
      const v = 1.15, st = 0.62, T = st / v, t0 = -2.1, half = 0.09, X = this.SCR[0].x, Y0 = 12.6, Y1 = 6.3;
      // the walking line: from inside the gate straight down the path to the ladder's foot, heading south
      const at = s => ({ p: [X + 0.01, Y0 - clamp(s, 0, Y0 - Y1)], h: 180 });
      this.walk = { v, t0, at, L: Y0 - Y1, tEnd: 2.9 };
      const steps = [];
      // facing south his left is east: the left foot 0.09 m east of the line, the right 0.09 m west
      for (let k = -4; k <= 9; k++) {
        const s = k * st + 0.3, foot = ((k % 2) + 2) % 2 === 0 ? 0 : 1, q = at(s);
        steps.push({ foot, p: [q.p[0] + (foot === 0 ? half : -half), q.p[1], 0], h: 180, ta: t0 + (s - 0.6 * st) / v, tl: t0 + (s - 0.6 * st) / v - 0.8 * T, kind: 'walk' });
      }
      // then by hand: two shorter steps to stand at the ladder's foot, feet together; and the climb (right, left, right)
      const yn = this.SCR[0].y + BOX.hy;
      steps.push({ foot: 0, p: [X + 0.11, 6.24, 0], h: 180, tl: 2.8, ta: 3.25, kind: 'walk' });
      steps.push({ foot: 1, p: [X - 0.09, 6.2, 0], h: 181, tl: 3.36, ta: 3.8, kind: 'walk' });
      steps.push({ foot: 1, p: [X - 0.09, yn + this.TREADS[0][0] + 0.04, this.TREADS[0][1]], h: 180, tl: 6.0, ta: 6.45, kind: 'climb' });
      steps.push({ foot: 0, p: [X + 0.11, yn + this.TREADS[1][0] + 0.05, this.TREADS[1][1]], h: 180, tl: 6.55, ta: 7.0, kind: 'climb' });
      steps.push({ foot: 1, p: [X - 0.09, yn + this.TREADS[1][0] + 0.05, this.TREADS[1][1]], h: 180, tl: 7.1, ta: 7.5, kind: 'climb' });
      this.steps = [steps.filter(s => s.foot === 0).sort((a, b) => a.ta - b.ta), steps.filter(s => s.foot === 1).sort((a, b) => a.ta - b.ta)];
      // the body after the walk: [t, x, y, hip height (-1: as the legs allow), heading]
      const tz = this.TREADS[1][1], yT = yn + this.TREADS[1][0] + 0.06;
      this.pelvisKeys = [[3.25, X + 0.01, 6.45, -1, 180], [3.8, X + 0.01, 6.25, -1, 180], [4.3, X + 0.01, 6.23, -1, 180], [5.6, X + 0.01, 6.225, -1, 180], [6.0, X + 0.01, 6.22, BODY.hipH, 180],
        [6.45, X + 0.01, 6.07, 0.93, 180], [7.0, X + 0.01, 5.88, 1.14, 180], [7.5, X + 0.01, yT, tz + BODY.hipH - 0.005, 180],
        [10.4, X + 0.01, yT - 0.01, tz + BODY.hipH - 0.01, 180], [11.6, X + 0.02, yT + 0.01, tz + BODY.hipH - 0.012, 182], [13.2, X, yT - 0.01, tz + BODY.hipH - 0.008, 179], [15.0, X + 0.02, yT + 0.01, tz + BODY.hipH - 0.012, 182]];
      // the trunk's lean forward and the head's pitch (down) and turn (to his right), in degrees: walking he looks a
      // little down the path; at the ladder's foot he looks at his watch (the synoptic hour), then up at the door
      this.leanKeys = [[-1, 4], [2.9, 4], [3.8, 2], [4.4, 4], [5.3, 4], [5.7, 1], [6.0, 5], [7.4, 3], [9.9, 4], [10.5, 8], [11.3, 8], [11.9, 10], [13.0, 10], [13.5, 8], [14.6, 8], [15.1, 10], [16.2, 10], [16.7, 7]];
      this.headKeys = [[-1, 9, 0], [2.9, 9, 0], [3.7, 0, 0], [4.3, 32, 8], [5.2, 32, 8], [5.6, -6, 0], [5.85, -4, 0], [6.1, 16, 0], [7.3, 14, 0], [7.7, 2, 4], [8.9, 2, 4], [9.2, 2, -6], [9.9, 0, 0],
        [10.4, -2, 3], [11.2, -2, 3], [11.7, 34, -10], [13.0, 34, -10], [13.4, -3, 8], [14.6, -3, 8], [15.0, 35, -10], [16.2, 35, -10], [16.7, 0, 2]];
    },
    // the pelvis's path: [x, y, heading, hip height] at time t, a cubic Hermite through the walk's samples (every 0.25 s
    // up to the walk's end) and the keys after it, its tangents from the neighbouring keys (so the speed runs on smoothly)
    pelvisAt(t) {
      if (!this.PK) {
        const W = this.walk, K = [];
        for (let tt = -1.5; tt < W.tEnd - 0.01; tt += 0.25) { const q = W.at(W.v * (tt - W.t0)); K.push([tt, q.p[0], q.p[1], q.h, BODY.hipH]); }
        const q = W.at(W.v * (W.tEnd - W.t0)); K.push([W.tEnd, q.p[0], q.p[1], q.h, BODY.hipH]);
        this.pelvisKeys.forEach(k => K.push([k[0], k[1], k[2], k[4], k[3] < 0 ? BODY.hipH : k[3]]));
        for (let i = 1; i < K.length; i++) { while (K[i][3] - K[i - 1][3] > 180) K[i][3] -= 360; while (K[i][3] - K[i - 1][3] < -180) K[i][3] += 360; }
        this.PK = K;
      }
      const K = this.PK;
      if (t <= K[0][0]) return K[0].slice(1);
      if (t >= K[K.length - 1][0]) return K[K.length - 1].slice(1);
      let i = 1; while (K[i][0] < t) i++;
      const a = K[i - 1], b = K[i], h = b[0] - a[0], u = (t - a[0]) / h;
      const tan = (j, c) => { const p = K[Math.max(0, j - 1)], n = K[Math.min(K.length - 1, j + 1)]; return (n[c] - p[c]) / (n[0] - p[0] || 1); };
      const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
      // the climb's keys are short and steep: their hip heights eased rather than splined, so they never overshoot
      return [1, 2, 3, 4].map(c => c === 4 && a[0] >= 5.85 ? lerp(a[c], b[c], smooth(u)) : h00 * a[c] + h10 * h * tan(i - 1, c) + h01 * b[c] + h11 * h * tan(i, c));
    },
    // where a foot is at time t: planted, or swinging from its last place to its next (lifted, its toe dipping then rising)
    footAt(foot, t) {
      const S = this.steps[foot];
      let i = 0; while (i < S.length - 1 && S[i + 1].ta <= t) i++;
      const cur = S[i], nx = S[i + 1];
      if (!nx || t < nx.tl) return { p: cur.p, h: cur.h, pitch: 0, swing: false };
      const u = clamp((t - nx.tl) / (nx.ta - nx.tl));
      let p, lift;
      if (nx.kind === 'climb') {
        const uz = smooth(u * 1.5), uxy = smooth((u - 0.3) / 0.7);
        p = [lerp(cur.p[0], nx.p[0], uxy), lerp(cur.p[1], nx.p[1], uxy), lerp(cur.p[2], nx.p[2], uz) + 0.07 * Math.sin(Math.PI * u)];
      } else {
        const uxy = smooth(u);
        lift = 0.1 * Math.sin(Math.PI * u);
        p = [lerp(cur.p[0], nx.p[0], uxy), lerp(cur.p[1], nx.p[1], uxy), lerp(cur.p[2], nx.p[2], uxy) + lift];
      }
      let dh = ((nx.h - cur.h + 540) % 360) - 180;
      return { p, h: cur.h + dh * smooth(u), pitch: (-26 * (1 - u) + 12 * u) * Math.sin(Math.PI * u), swing: true };
    },
    // a two-bone chain from A to target T (lengths l1, l2), the joint bending toward pole
    ik(A, T, l1, l2, pole) {
      const d = v3.sub(T, A), D = clamp(v3.len(d), 0.02, l1 + l2 - 1e-4), n = v3.norm(d);
      const a = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
      const pp = v3.norm(v3.sub(pole, v3.mul(n, v3.dot(pole, n))));
      return { J: v3.am(A, n, a, pp, h), E: v3.am(A, n, D) };
    },
    poseAt(t) {
      const W = this.walk, B = BODY;
      // the feet first
      const fL = this.footAt(0, t), fR = this.footAt(1, t);
      const ankle = f => [f.p[0], f.p[1], f.p[2] + B.ankle];
      const aL = ankle(fL), aR = ankle(fR);
      // the pelvis: through the walk's samples and then the keys, on a smooth path (it never halts at a key)
      const [px, py, hd0, pzk] = this.pelvisAt(t), hd = (hd0 % 360 + 360) % 360;
      let pz = pzk;
      const hr = hd * D2R, fwd = [Math.sin(hr), Math.cos(hr), 0], right = [Math.cos(hr), -Math.sin(hr), 0], up = [0, 0, 1];
      // the hip height the legs allow (both feet planted reach; a swinging foot does not hold the body up)
      const reach = (a, f) => { const hp = v3.am([px, py, 0], right, f === 0 ? -B.hipW : B.hipW); const dxy = Math.hypot(a[0] - hp[0], a[1] - hp[1]), L = (B.thigh + B.shin) * 0.985; return a[2] + Math.sqrt(Math.max(0, L * L - dxy * dxy)); };
      let zr = B.hipH + Math.min(aL[2], aR[2]) - B.ankle;
      if (!fL.swing) zr = Math.min(zr, reach(aL, 0));
      if (!fR.swing) zr = Math.min(zr, reach(aR, 1));
      // before the climb the legs set the hip's height; from the ladder's foot the keys do (blended over 0.15 s)
      pz = t < 5.85 ? zr : t < 6.0 ? lerp(zr, pzk, smooth((t - 5.85) / 0.15)) : pzk;
      const pelvis = [px, py, pz];
      const lean = keyed(this.leanKeys, t)[0] * D2R, [hp, hyw] = keyed(this.headKeys, t).map(x => x * D2R);
      const spine = v3.norm(v3.am([0, 0, 0], up, Math.cos(lean), fwd, Math.sin(lean)));
      const hipL = v3.am(pelvis, right, -B.hipW), hipR = v3.am(pelvis, right, B.hipW);
      // knees forward (and a little out)
      const kL = this.ik(hipL, aL, B.thigh, B.shin, v3.am(fwd, right, -0.15)), kR = this.ik(hipR, aR, B.thigh, B.shin, v3.am(fwd, right, 0.15));
      const shC = v3.am(pelvis, spine, B.sh), c7 = v3.am(pelvis, spine, B.c7);
      const shL = v3.am(shC, right, -B.shW), shR = v3.am(shC, right, B.shW);
      // the head: pitched down and turned on the neck
      const hf0 = v3.norm(v3.am(fwd, right, Math.sin(hyw) / Math.max(0.2, Math.cos(hyw)))), hr0 = v3.cross(hf0, up);
      const hUp = v3.norm(v3.am(spine, hf0, Math.sin(hp))), hFwd = v3.norm(v3.cross(hUp, v3.cross(hf0, hUp)));
      const hRight = v3.norm(v3.cross(hFwd, hUp));
      const head = v3.am(c7, hUp, 0.125, hFwd, 0.02);
      const P0 = { t, pelvis, fwd, right, up, spine, hipL, hipR, kneeL: kL.J, kneeR: kR.J, ankleL: kL.E, ankleR: kR.E, fL, fR, shL, shR, shC, c7, head, hUp, hFwd, hRight, hd };
      // the hands
      const hands = this.handsAt(t, P0);
      const pole = s => v3.am([0, 0, -1], fwd, -0.35, right, 0.45 * s);
      const aRk = this.ik(shR, hands.R, B.ua, B.fa, pole(1)), aLk = this.ik(shL, hands.L, B.ua, B.fa, pole(-1));
      Object.assign(P0, { elR: aRk.J, wrR: aRk.E, elL: aLk.J, wrL: aLk.E, handDirR: hands.dR, handDirL: hands.dL, book: hands.book, pencil: hands.pencil });
      return P0;
    },
    // the hands' places over the beat: walking (the right arm swings, the left carries the register at his side), the
    // door's leaves (the right hand on each latch as it swings), the sill, the register at his chest and the pencil
    handsAt(t, P) {
      const { fwd, right, up, shL, shR, spine } = P, sc = this.SCR[0], open = this.doorOpen(t);
      const swing = v3.dot(v3.sub(P.ankleL, P.ankleR), fwd);
      const side = (s, k) => v3.am(s === 1 ? shR : shL, [0, 0, -1], 0.53, fwd, k, right, 0.06 * s);
      const walkR = side(1, 0.42 * swing / 2 + 0.03), walkL = side(-1, -0.12 * swing / 2 + 0.06);
      const restR = side(1, 0.04), restL = side(-1, 0.07);
      const latchW = v3.am(this.latch(sc, -1, open[0]), fwd, -0.03), latchE = v3.am(this.latch(sc, 1, Math.min(open[1], 1.05)), fwd, -0.03);
      const sill = [sc.x - 0.16, sc.y + BOX.hy + 0.07, BOX.z0 + 0.05];
      // the register raised before his chest, tilted toward his face; the pencil's point moving over it in short lines
      const chest = v3.am(P.shC, spine, -0.2, fwd, 0.3, right, -0.04);
      const writing = (t > 11.7 && t < 13.0) || (t > 15.1 && t < 16.2);
      const wr = writing ? [0.035 * Math.sin(t * 7.1) + 0.01 * Math.sin(t * 17.3), 0.012 * Math.sin(t * 3.3)] : [0, 0];
      const penR = v3.am(chest, right, 0.07 + wr[0], fwd, -0.02, up, 0.05 + wr[1]);
      const blend = keys => {
        let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
        const k = keys[i];
        if (i === 0 || t >= k[1]) return k[2];
        return v3.lerp(keys[i - 1][2], k[2], easeInOut(clamp((t - k[0]) / (k[1] - k[0]))));
      };
      // [transition start, transition end, target]
      const watch = v3.am(P.shC, spine, -0.2, fwd, 0.28, right, 0.02);
      const R = blend([[-9, -9, walkR], [3.2, 3.9, restR], [4.0, 4.45, watch], [5.15, 5.6, restR], [7.55, 8.0, latchW], [8.85, 9.15, latchE], [9.55, 10.1, sill], [11.3, 11.8, penR], [13.05, 13.5, sill], [14.65, 15.1, penR], [16.3, 16.9, sill]]);
      const L = blend([[-9, -9, walkL], [3.2, 3.9, restL], [11.0, 11.7, v3.am(chest, right, -0.1, up, -0.06)]]);
      // the register: hanging from the left hand at his side, then raised and opened before his chest
      const up2 = clamp((t - 11.0) / 0.7), e = easeInOut(up2);
      const bookHang = { c: v3.am(L, [0, 0, -1], 0.1, fwd, 0.02, right, -0.025), u: fwd, v: [0, 0, 1], n: right, open: 0 };
      const tilt = v3.norm(v3.am(up, fwd, -0.7)), bn = v3.norm(v3.cross(right, tilt));
      const bookUp = { c: v3.am(chest, right, 0.02), u: right, v: v3.mul(tilt, -1), n: v3.mul(bn, -1), open: 1 };
      const book = e <= 0 ? bookHang : e >= 1 ? bookUp : { c: v3.lerp(bookHang.c, bookUp.c, e), u: v3.norm(v3.lerp(bookHang.u, bookUp.u, e)), v: v3.norm(v3.lerp(bookHang.v, bookUp.v, e)), n: v3.norm(v3.lerp(bookHang.n, bookUp.n, e)), open: e };
      const dR = v3.norm(v3.sub(R, v3.am(shR, [0, 0, -1], 0.25))), dL = v3.norm(v3.sub(L, v3.am(shL, [0, 0, -1], 0.25)));
      const wristR = v3.am(R, dR, -0.07), wristL = v3.am(L, dL, -0.07);
      return { R: wristR, L: wristL, dR, dL, book, pencil: t > 11.4 && (t < 13.2 || t > 14.7) };
    },
    // a lofted body part from sections { c, u, v, a, b } (centre, two unit axes, half-widths), its surface as facets;
    // each facet knows its neighbours, so the contour (where the surface turns from the eye) can be found
    loft(secs, n = 16) {
      const rings = secs.map(s => Array.from({ length: n }, (_, j) => { const th = j / n * TAU; return v3.am(s.c, s.u, s.a * Math.cos(th), s.v, s.b * Math.sin(th)); }));
      const facets = [], R = rings.length - 1;
      for (let i = 0; i < R; i++) for (let j = 0; j < n; j++) {
        const q = [rings[i][j], rings[i][(j + 1) % n], rings[i + 1][(j + 1) % n], rings[i + 1][j]];
        const c = v3.mul(v3.add(v3.add(q[0], q[1]), v3.add(q[2], q[3])), 0.25), axis = v3.lerp(secs[i].c, secs[i + 1].c, 0.5);
        let nn = v3.norm(v3.cross(v3.sub(q[2], q[0]), v3.sub(q[3], q[1])));
        if (v3.dot(nn, v3.sub(c, axis)) < 0) nn = v3.mul(nn, -1);
        facets.push({ q, c, n: nn, i, j });
      }
      return { rings, facets, n, R };
    },
    // a limb along a chain of joints (shoulder, elbow, wrist; or hip, knee, ankle): round sections of the given radii at
    // fractions of its length, the sections turning smoothly through each joint (so a bent elbow has no seam), capped
    chain(J, rs, flat = 1) {
      const seg = [], Ls = [0];
      for (let i = 1; i < J.length; i++) { seg.push(v3.sub(J[i], J[i - 1])); Ls.push(Ls[i - 1] + v3.len(seg[i - 1])); }
      const L = Ls[Ls.length - 1], dirs = seg.map(v3.norm);
      let bend = J.length > 2 ? v3.cross(dirs[0], dirs[1]) : [0, 0, 0];
      if (v3.len(bend) < 1e-3) bend = Math.abs(dirs[0][2]) < 0.9 ? v3.cross(dirs[0], [0, 0, 1]) : v3.cross(dirs[0], [1, 0, 0]);
      bend = v3.norm(bend);
      const at = f => {
        const s = f * L; let i = 1; while (i < Ls.length - 1 && Ls[i] < s) i++;
        const u = (s - Ls[i - 1]) / (Ls[i] - Ls[i - 1] || 1), p = v3.lerp(J[i - 1], J[i], u);
        // the tangent blends from one segment to the next over 0.07 m either side of a joint
        let tg = dirs[i - 1];
        if (i - 1 > 0 && s - Ls[i - 1] < 0.07) tg = v3.norm(v3.lerp(dirs[i - 2], dirs[i - 1], 0.5 + 0.5 * (s - Ls[i - 1]) / 0.07));
        if (i < dirs.length && Ls[i] - s < 0.07) tg = v3.norm(v3.lerp(dirs[i - 1], dirs[i], 0.5 - 0.5 * (Ls[i] - s) / 0.07));
        return { p, tg };
      };
      const secs = [], n = rs.length, mk = (p, tg, r) => { const u = v3.norm(v3.sub(bend, v3.mul(tg, v3.dot(bend, tg)))), v = v3.cross(tg, u); return { c: p, u, v, a: r, b: r * flat }; };
      const a0 = at(0), a1 = at(1);
      secs.push(mk(v3.am(a0.p, a0.tg, -rs[0][1] * 0.6), a0.tg, rs[0][1] * 0.5));
      rs.forEach(([f, r]) => { const q = at(f); secs.push(mk(q.p, q.tg, r)); });
      secs.push(mk(v3.am(a1.p, a1.tg, rs[n - 1][1] * 0.6), a1.tg, rs[n - 1][1] * 0.5));
      return secs;
    },
    // a part drawn as an engraver models a figure: its silhouette masked, one wash of its colour over it, a deeper wash
    // where the sun does not reach, the half-lit and shaded facets ruled (crossed in the deep shade), and its contour
    // (the edges where the surface turns from the eye) inked
    part(secs, mat, seed, { n = 16, hatchAng = null, facetMat = null, contour = 0.9, sub = 1 } = {}) {
      if (sub > 1) {
        const out = [secs[0]];
        for (let i = 1; i < secs.length; i++) for (let k = 1; k <= sub; k++) {
          const a = secs[i - 1], b = secs[i], u = k / sub;
          out.push({ c: v3.lerp(a.c, b.c, u), u: v3.norm(v3.lerp(a.u, b.u, u)), v: v3.norm(v3.lerp(a.v, b.v, u)), a: lerp(a.a, b.a, u), b: lerp(a.b, b.b, u) });
        }
        secs = out;
      }
      const C = E3.cam().C, S = this.S, L = this.loft(secs, n);
      if (L.rings.flat().some(p => E3.depth(p) < 0.5)) return;
      const front = L.facets.map(f => v3.dot(f.n, v3.sub(C, f.c)) > 0);
      const groups = {}, all = [];
      L.facets.forEach((f, k) => {
        if (!front[k]) return;
        const path = new P(f.q.map(E3.proj), true), m = facetMat ? facetMat(f) : mat;
        all.push(path);
        (groups[m.id] = groups[m.id] || { m, paths: [] }).paths.push(path);
      });
      if (!all.length) return;
      mask(all);
      const xs = all.flatMap(p => p.pts.map(q => q[0])), ys = all.flatMap(p => p.pts.map(q => q[1]));
      const box = [Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) + 2, Math.max(...ys) + 2];
      // the light across the part: round its middle section, the tone of each point the eye sees, laid out across the
      // part's axis on the plate (so the shading runs smoothly round the form, with no facets in it)
      const A0 = E3.proj(secs[1].c), A1 = E3.proj(secs[secs.length - 2].c), ax = [A1[0] - A0[0], A1[1] - A0[1]], al = Math.hypot(ax[0], ax[1]) || 1;
      const Np = [-ax[1] / al, ax[0] / al], ang = hatchAng !== null ? hatchAng : Math.atan2(ax[1], ax[0]);
      const ms = secs[Math.floor(secs.length / 2)], mc = E3.proj(ms.c), prof = [];
      for (let k = 0; k < 64; k++) {
        const th = k / 64 * TAU, p = v3.am(ms.c, ms.u, ms.a * Math.cos(th), ms.v, ms.b * Math.sin(th));
        const nn = v3.norm(v3.am([0, 0, 0], ms.u, Math.cos(th) / ms.a, ms.v, Math.sin(th) / ms.b));
        if (v3.dot(nn, v3.sub(C, p)) <= 0) continue;
        const q = E3.proj(p);
        prof.push([(q[0] - mc[0]) * Np[0] + (q[1] - mc[1]) * Np[1], v3.dot(nn, S) + 0.18 * nn[2]]);
      }
      prof.sort((a, b) => a[0] - b[0]);
      const half = Math.max(2, ...prof.map(p => Math.abs(p[0]))) + 2;
      const shadeA = tn => clamp((0.3 - tn) / 0.45);
      // the terminator: where the tone falls below 0.04, on the shaded side (the side of the darker end)
      const dark = prof.length ? (prof[0][1] < prof[prof.length - 1][1] ? -1 : 1) : 1;
      let st = dark > 0 ? half : -half;
      if (prof.length) { const seq = dark > 0 ? prof : prof.slice().reverse(); for (const [sp, tn] of seq) if (tn < 0.04) { st = sp; break; } }
      const halfPlane = (s0) => { const big = 4 * half + 400, o = [mc[0] + Np[0] * s0, mc[1] + Np[1] * s0], d = [Np[0] * dark, Np[1] * dark], t = [-Np[1], Np[0]];
        return new P([[o[0] + t[0] * big, o[1] + t[1] * big], [o[0] - t[0] * big, o[1] - t[1] * big], [o[0] - t[0] * big + d[0] * big, o[1] - t[1] * big + d[1] * big], [o[0] + t[0] * big + d[0] * big, o[1] + t[1] * big + d[1] * big]], true); };
      Object.values(groups).forEach(({ m, paths }, gi) => {
        if (OPT.colour) {
          wash(paths, m.col, m.a);
          if (prof.length > 1) {
            const g = ctx.createLinearGradient(mc[0] - Np[0] * half, mc[1] - Np[1] * half, mc[0] + Np[0] * half, mc[1] + Np[1] * half);
            const n0 = parseInt(m.col.slice(1), 16), rgb = `${n0 >> 16},${(n0 >> 8) & 255},${n0 & 255}`;
            prof.forEach(([sp, tn]) => g.addColorStop(clamp((sp + half) / (2 * half)), `rgba(${rgb},${(m.sa * shadeA(tn)).toFixed(3)})`));
            ctx.save(); ctx.beginPath(); paths.forEach(q => q.trace(ctx, 1)); ctx.clip();
            ctx.globalAlpha = SA; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]); ctx.restore();
          }
        }
        // the ruling: open over the whole part, closer beyond the terminator, crossed deeper in the shade
        const hz = m.h;
        if (hz[0]) hatch(paths, box, ang, hz[0][0], 1, INK, 0.5, hz[0][1], seed + gi * 11 + 7);
        ctx.save(); ctx.beginPath(); halfPlane(st).trace(ctx, 1); ctx.clip();
        if (hz[1]) hatch(paths, box, ang + (hz[1][2] || 0), hz[1][0], 1, INK, 0.5, hz[1][1] * (OPT.colour ? 1 : 1.4), seed + gi * 11 + 1);
        ctx.restore();
        if (m.x) { ctx.save(); ctx.beginPath(); halfPlane(st + dark * half * 0.35).trace(ctx, 1); ctx.clip(); hatch(paths, box, ang + 1.1, m.x[0], 1, INK, 0.5, m.x[1], seed + gi * 11 + 5); ctx.restore(); }
      });
      // the contour: facet edges between a facet facing the eye and one facing away (or the open end of the loft)
      const segs = [], N = L.n, idx = (i, j) => i * N + ((j % N) + N) % N;
      L.facets.forEach((f, k) => {
        if (!front[k]) return;
        const { i, j, q } = f;
        if (!front[idx(i, j - 1)]) segs.push([q[0], q[3]]);
        if (!front[idx(i, j + 1)]) segs.push([q[1], q[2]]);
        if (i === 0 || !front[idx(i - 1, j)]) segs.push([q[0], q[1]]);
        if (i === L.R - 1 || !front[idx(i + 1, j)]) segs.push([q[3], q[2]]);
      });
      if (contour) { ctx.save(); ctx.globalAlpha = SA * 0.85; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = contour; ctx.lineCap = 'round'; ctx.beginPath(); segs.forEach(([a, b]) => { const p = E3.proj(a), r = E3.proj(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(r[0], r[1]); }); ctx.stroke(); ctx.restore(); }
    },
    MAT: {
      coat: { id: 'coat', col: '#22324A', a: 0.66, sa: 0.5, h: [[3.4, 0.08], [1.9, 0.3]], x: [2.4, 0.18] },
      trousers: { id: 'tr', col: '#2C2C33', a: 0.6, sa: 0.45, h: [[3.2, 0.08], [1.9, 0.3]], x: [2.4, 0.16] },
      shoe: { id: 'sh', col: '#231D19', a: 0.78, sa: 0.3, h: [null, [1.6, 0.34]] },
      sole: { id: 'so', col: '#1C1714', a: 0.85, sa: 0.1, h: [null, null] },
      skin: { id: 'sk', col: '#CF9670', a: 0.42, sa: 0.32, h: [null, [2.4, 0.16]] },
      hair: { id: 'hr', col: '#4A3E35', a: 0.62, sa: 0.35, h: [[2.4, 0.14], [1.6, 0.3]] },
    },
    observer(t) {
      const P = this.pose, M = this.MAT, B = BODY, { fwd, right, up, spine } = P, items = [];
      const add = (d, fn) => items.push({ d, draw: fn });
      const C = E3.cam().C, dep = p => E3.depth(p);
      // shoes: a leather upper over a sole, heel to toe, pitched as the foot rolls
      const shoe = (f, a) => {
        const hr = f.h * D2R, ff = [Math.sin(hr), Math.cos(hr), 0], rr = [Math.cos(hr), -Math.sin(hr), 0], pr = f.pitch * D2R;
        const dir = v3.norm(v3.am([0, 0, 0], ff, Math.cos(pr), up, Math.sin(pr))), vv = v3.norm(v3.cross(dir, rr));
        const heel = v3.am(a, dir, -0.075, up, -0.05), toe = v3.am(a, dir, 0.205, up, -0.05);
        const upper = [[0, 0.036, 0.03, 0.035], [0.12, 0.046, 0.05, 0.05], [0.42, 0.05, 0.045, 0.035], [0.72, 0.049, 0.032, 0.02], [0.92, 0.04, 0.022, 0.012], [1, 0.022, 0.012, 0.008]]
          .map(([u, aa, bb, lift]) => ({ c: v3.am(v3.lerp(heel, toe, u), vv, -lift), u: rr, v: vv, a: aa, b: bb }));
        const sole = [[0, 0.036], [0.5, 0.05], [0.95, 0.04], [1.02, 0.02]].map(([u, aa]) => ({ c: v3.am(v3.lerp(heel, toe, u), vv, 0.004), u: rr, v: vv, a: aa, b: 0.01 }));
        return { upper, sole };
      };
      // legs (one loft from the hip through the knee to the ankle: loose trousers), the shoes; the thighs lie under the
      // coat, so the legs are drawn before it
      [[P.hipL, P.kneeL, P.ankleL, P.fL, 0], [P.hipR, P.kneeR, P.ankleR, P.fR, 1]].forEach(([h, k, a, f, s]) => {
        add(1e3 + dep(k), () => {
          const sh = shoe(f, a);
          this.part(sh.sole, M.sole, 16020 + s * 50, { n: 12, contour: 0.6 });
          this.part(this.chain([v3.am(h, up, 0.04), k, v3.am(a, up, 0.02)], [[0, 0.086], [0.3, 0.078], [0.5, 0.064], [0.75, 0.058], [1, 0.05]]), M.trousers, 16000 + s * 50, { n: 18 });
          this.part(sh.upper, M.shoe, 16030 + s * 50, { n: 14 });
        });
      });
      // the coat, to mid-thigh: its hem spreads to clear the knees as he strides
      const kn = v3.sub(P.kneeL, P.kneeR), spread = Math.abs(v3.dot(kn, fwd)), lat = Math.abs(v3.dot(kn, right));
      const pel = P.pelvis, mk = v3.lerp(P.kneeL, P.kneeR, 0.5), hem = [lerp(pel[0], mk[0], 0.45), lerp(pel[1], mk[1], 0.45), pel[2] - 0.24];
      const coatSecs = [
        { c: hem, a: Math.max(0.222, lat / 2 + 0.1), b: Math.max(0.135, spread / 2 + 0.09) },
        { c: v3.am(pel, up, -0.12), a: 0.214, b: 0.13 },
        { c: v3.am(pel, spine, 0.02), a: 0.205, b: 0.124 },
        { c: v3.am(pel, spine, 0.16), a: 0.196, b: 0.118 },
        { c: v3.am(pel, spine, 0.32, fwd, 0.012), a: 0.208, b: 0.126 },
        { c: v3.am(pel, spine, 0.44), a: 0.228, b: 0.12 },
        { c: v3.am(pel, spine, 0.5), a: 0.205, b: 0.108 },
        { c: v3.am(pel, spine, 0.535), a: 0.13, b: 0.088 },
        { c: v3.am(pel, spine, 0.56, fwd, -0.006), a: 0.082, b: 0.074 },
        { c: v3.am(pel, spine, 0.615, fwd, -0.012), a: 0.074, b: 0.07 },
      ].map(s => ({ c: s.c, u: right, v: fwd, a: s.a, b: s.b }));
      const coatD = dep(v3.am(pel, spine, 0.25));
      add(coatD, () => {
        this.part(this.chain([P.c7, v3.am(P.c7, P.hUp, 0.1)], [[0, 0.056], [1, 0.05]]), M.skin, 16100, { n: 12 });
        this.part(coatSecs, M.coat, 16110, { n: 32, hatchAng: Math.PI / 2, sub: 3 });
        // the back's centre seam and vent, the collar's edge, the belt line
        if (v3.dot(v3.mul(fwd, -1), v3.sub(C, pel)) > 0) {
          E3.line([0.6, 0.45, 0.3, 0.15, 0.0, -0.1].map(k => k >= 0 ? v3.am(pel, spine, k, fwd, k > 0.5 ? -0.105 : -0.127) : v3.am(pel, up, k, fwd, -0.13)), INK, 0.8, 0.45);
          E3.line([v3.am(hem, fwd, -0.135), v3.am(pel, up, -0.1, fwd, -0.132)], INK, 1, 0.6);
        }
        const belt = Array.from({ length: 13 }, (_, k) => { const th = Math.PI * (0.15 + 0.7 * k / 12) + Math.PI; return v3.am(pel, spine, 0.1, right, 0.2 * Math.cos(th), fwd, 0.122 * Math.sin(th)); });
        E3.line(belt, INK, 0.7, 0.35);
      });
      // the arms in their sleeves (one loft through the elbow), the hands bare, each in its order against the coat
      [[P.shL, P.elL, P.wrL, P.handDirL, -1], [P.shR, P.elR, P.wrR, P.handDirR, 1]].forEach(([s, e, w, hdv, sd]) => {
        const near = dep(v3.lerp(s, e, 0.5)) < coatD - 0.05;
        add(near ? coatD - 0.2 - 0.01 * sd : coatD + 0.2, () => {
          const hn = v3.am(w, hdv, B.hand * 0.78);
          this.part(this.chain([w, hn], [[0, 0.034], [0.45, 0.044], [1, 0.03]], 0.55), M.skin, 16220 + sd * 20, { n: 12 });
          this.part(this.chain([v3.am(s, up, -0.015, right, -0.01 * sd), e, w], [[0, 0.066], [0.25, 0.06], [0.52, 0.054], [0.8, 0.05], [1, 0.05]]), M.coat, 16200 + sd * 20, { n: 16 });
        });
      });
      // the register (a ledger 0.2 × 0.28 m in a dark cloth cover); open before his chest, its two white pages
      const bk = P.book, bd = dep(bk.c);
      add(bd, () => {
        const hw = 0.1, hh = 0.14, c = bk.c, corners = dz => [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([a, b]) => v3.am(c, bk.u, a * (1 + bk.open), bk.v, b, bk.n, dz));
        const back = corners(-0.011), front = corners(0.011);
        E3.solid([front, back.slice().reverse(), [back[0], back[1], front[1], front[0]], [back[1], back[2], front[2], front[1]], [back[2], back[3], front[3], front[2]], [back[3], back[0], front[0], front[3]]],
          { tone: 0.3, shade: 0.4, lw: 0.8, edgeA: 0.9, fillCol: OPT.colour ? '#3B3A2C' : INK, fillA: OPT.colour ? 0.62 : 0.3 }, 16300);
        if (bk.open > 0.6) {
          const f = E3.face(corners(0.015), { tone: 0, shade: 0.1, lw: 0.6, edgeA: 0.7, noHatch: true, n: bk.n }, 16301);
          if (f) E3.line([v3.am(c, bk.v, -hh, bk.n, 0.015), v3.am(c, bk.v, hh, bk.n, 0.015)], INK, 0.6, 0.6);
        }
      });
      // the head: short dark hair over the crown and the back, the skin of the nape and the neck below it; no face
      const hc = P.head, hU = P.hUp, hF = P.hFwd, hR = P.hRight;
      const headSecs = [-1, -0.88, -0.66, -0.36, -0.05, 0.28, 0.58, 0.82, 0.95, 1].map(k => {
        const z = k * 0.114, s = Math.sqrt(Math.max(0.015, 1 - k * k)), jaw = k < -0.25 ? 0.84 + 0.16 * (1 + k) / 0.75 : 1;
        return { c: v3.am(hc, hU, z, hF, k < 0 ? 0.015 * -k : -0.006 * k), u: hR, v: hF, a: 0.077 * s * jaw, b: 0.098 * s };
      });
      add(dep(hc) - 0.3, () => {
        const hairMat = f => { const lz = v3.dot(v3.sub(f.c, hc), hU), lf = v3.dot(v3.sub(f.c, hc), hF); return lz > -0.03 + 0.07 * Math.max(0, lf / 0.098) || (lf < 0 && lz > -0.062 - 0.02 * lf / 0.098) ? M.hair : M.skin; };
        this.part(headSecs, M.skin, 16400, { n: 24, facetMat: hairMat, hatchAng: Math.PI / 2 - 0.35, sub: 2 });
      });
      // the pencil in his right hand
      if (P.pencil) add(dep(P.wrR) - 0.25, () => { const a = v3.am(P.wrR, P.handDirR, 0.11), b = v3.am(a, v3.norm(v3.am(P.handDirR, up, 0.6)), 0.13); E3.line([a, b], INK, 1.1, 0.9); });
      R11.paint(items);
    },
    // his shadow on the ground: the legs, the coat, the arms and the head, cast toward 293°
    observerShadow(out, hullOf) {
      const P = this.pose; if (!P) return;
      const lift = p => p; // the shadow falls on the grass (on the ladder's treads it is lost among their own shadows)
      const segs = [[P.ankleL, P.kneeL, 0.06], [P.kneeL, P.hipL, 0.08], [P.ankleR, P.kneeR, 0.06], [P.kneeR, P.hipR, 0.08], [v3.am(P.pelvis, [0, 0, 1], -0.24), P.shC, 0.21], [P.shL, P.elL, 0.05], [P.elL, P.wrL, 0.045], [P.shR, P.elR, 0.05], [P.elR, P.wrR, 0.045], [P.c7, P.head, 0.09]];
      segs.forEach(([a, b, r]) => out.push(hullOf([v3.am(lift(a), P.right, -r), v3.am(lift(a), P.right, r), v3.am(lift(b), P.right, r), v3.am(lift(b), P.right, -r)])));
      out.push(hullOf([v3.am(P.head, [0, 0, 1], 0.11, P.right, -0.07), v3.am(P.head, [0, 0, 1], 0.11, P.right, 0.07), v3.am(P.head, [0, 0, 1], -0.1, P.right, 0.07), v3.am(P.head, [0, 0, 1], -0.1, P.right, -0.07)]));
    },

    /* ---------- the mast (10 m): the cup anemometer and the vane on their cross-arm, a lightning rod, the logger, the
       temperature and humidity sensor's radiation shield on its arm at 2 m ---------- */
    wind(t) {
      // the station's 2 m/s, gusting to 4 (SYNOP 91004): a smooth wander between about 1.3 and 3.5 m/s
      const v = 2.4 + 0.75 * Math.sin(t * 0.83 + 0.4) + 0.4 * Math.sin(t * 2.03 + 1.3);
      // the vane points where the wind comes from: about north, swinging slowly between north-west and north-east
      // (LRBS: 320°-040°)
      const dir = -5 + 24 * Math.sin(t * 0.52 + 0.6) + 9 * Math.sin(t * 1.37 + 2.1);
      return { v, dir };
    },
    // the rotor's turn (radians): its cups at 0.09 m run at about a third of the wind's speed (1.3-2.2 turns a second),
    // the integral of the wander above
    cupAngle(t) {
      const k = 1 / (2.8 * 0.09);
      return k * (2.4 * t - 0.75 / 0.83 * Math.cos(t * 0.83 + 0.4) - 0.4 / 2.03 * Math.cos(t * 2.03 + 1.3));
    },
    mast(t) {
      const [x, y] = this.MAST, d = E3.depth([x, y, 5]), ppm = this.ppm(d), col = OPT.colour;
      const steel = { tone: 0, shade: 0.12, lw: 0.8, edgeA: 0.85, fillCol: col ? '#A9B4BE' : null, fillA: 0.3, noHatch: true };
      E3.solid(E3.box(x - 0.35, x + 0.35, y - 0.35, y + 0.35, 0, 0.12), { tone: 0.12, shade: 0.5, lw: 0.8, edgeA: 0.7, fillCol: col ? '#B8B2A6' : null, fillA: 0.4 }, 15800);
      this.drum(x, y, 0.045, 0.12, 6, steel, 15801);
      this.drum(x, y, 0.035, 6, 10, steel, 15802);
      E3.solid(E3.box(x - 0.2, x + 0.2, y + 0.05, y + 0.25, 1.1, 1.6), { tone: 0.02, shade: 0.4, lw: 0.9, edgeA: 0.85, fillCol: col ? '#E5E2D8' : null, fillA: 0.35 }, 15803);
      E3.line([[x, y, 2.05], [x + 0.55, y, 2.05]], INK, this.lw(0.03, d, 0.6, 1.4), 0.85);
      for (let k = 0; k < 9; k++) {
        const z = 1.9 + k * 0.028, r0 = k === 8 ? 0.07 : 0.085;
        const pth = new P(this.hull(R11.ring([x + 0.55, y], r0, z, 16).map(E3.proj).concat(R11.ring([x + 0.55, y], r0, z + 0.012, 16).map(E3.proj))), true);
        mask(pth); stroke(pth, 1, INK, 0.6, 0.7);
      }
      // the cross-arm (north-south), the anemometer at its south end, the vane at its north end, the lightning rod
      const z = 9.85;
      E3.line([[x, y - 0.7, z], [x, y + 0.7, z]], INK, this.lw(0.035, d, 0.8, 1.6), 0.9);
      E3.line([[x, y, 10], [x, y, 10.9]], INK, this.lw(0.012, d, 0.5, 1), 0.8);
      const ax = x, ay = y - 0.7;
      E3.line([[ax, ay, z], [ax, ay, z + 0.22]], INK, this.lw(0.025, d, 0.7, 1.4), 0.9);
      const th = this.cupAngle(t), hub = [ax, ay, z + 0.25], cups = [];
      // the circle the cups run round, faint (at this distance the turning rotor reads by it)
      stroke(new P(R11.ring([ax, ay], 0.115, z + 0.25, 28).slice(0, 28).map(E3.proj), true), 1, INK, 0.6, 0.3);
      for (let k = 0; k < 3; k++) { const a = th + k * TAU / 3, e = [ax + 0.09 * Math.cos(a), ay + 0.09 * Math.sin(a), z + 0.25]; cups.push({ e, a, d: E3.depth(e) }); }
      cups.sort((p, q) => q.d - p.d).forEach(({ e, a }) => {
        E3.line([hub, e], INK, this.lw(0.008, d, 0.6, 1), 0.85);
        // the cup, a cone 0.05 m across, its mouth turned the way the rotor runs
        const c = E3.proj(e), r = Math.max(1.5, 0.028 * ppm), m = [-Math.sin(a), Math.cos(a), 0], pm = E3.proj([e[0] + m[0] * 0.035, e[1] + m[1] * 0.035, e[2]]);
        const cup = new P([[c[0], c[1] - r * 0.35], [pm[0], pm[1] - r], [pm[0], pm[1] + r], [c[0], c[1] + r * 0.35]], true);
        mask(cup); fill(cup, INK, 0.3); stroke(cup, 1, INK, 0.7, 0.9);
      });
      const ph = E3.proj(hub); disc(ph[0], ph[1], Math.max(1.2, 0.022 * ppm), INK, 0.8);
      const vx = x, vy = y + 0.7, w = this.wind(t), wd = w.dir * D2R, into = [Math.sin(wd), Math.cos(wd), 0];
      E3.line([[vx, vy, z], [vx, vy, z + 0.2]], INK, this.lw(0.025, d, 0.7, 1.4), 0.9);
      const vz = z + 0.24, nose = [vx + into[0] * 0.3, vy + into[1] * 0.3, vz], tail = [vx - into[0] * 0.42, vy - into[1] * 0.42, vz];
      E3.line([nose, tail], INK, this.lw(0.015, d, 0.7, 1.2), 0.9);
      const fin = [[vx - into[0] * 0.2, vy - into[1] * 0.2, vz - 0.02], [vx - into[0] * 0.46, vy - into[1] * 0.46, vz - 0.06], [vx - into[0] * 0.48, vy - into[1] * 0.48, vz + 0.14], [vx - into[0] * 0.26, vy - into[1] * 0.26, vz + 0.05]];
      const fn = [-into[1], into[0], 0];
      E3.face(fin, { tone: 0.05, shade: 0.4, lw: 0.8, edgeA: 0.9, noHatch: true, fillCol: col ? '#E8E2D2' : null, fillA: 0.4, n: E3.dot(fn, E3.sub(E3.cam().C, fin[0])) > 0 ? fn : [-fn[0], -fn[1], 0] }, 15810);
      const pn = E3.proj(nose); disc(pn[0], pn[1], Math.max(1.3, 0.03 * ppm), INK, 0.85);
    },
    // a vertical cylinder (painted metal): its faces washed and ruled without their edges, then its outline and rims
    drum(x, y, r, z0, z1, st, seed) {
      E3.solid(R11.cylinder([x, y], r, z0, z1, 24), Object.assign({ edges: false }, st), seed);
      const lo = R11.ring([x, y], r, z0, 32).slice(0, 32).map(E3.proj), hi = R11.ring([x, y], r, z1, 32).slice(0, 32).map(E3.proj);
      stroke(new P(this.hull(lo.concat(hi)), true), 1, INK, st.lw || 1, st.edgeA ?? 0.9);
      stroke(new P(hi, true), 1, INK, 0.8, 0.8);
    },
    // the rain gauge: a can of 200 cm² (16 cm across) on its post, its rim 1 m up
    gauge() {
      const [x, y] = this.GAUGE, col = OPT.colour, mt = { tone: 0, shade: 0.35, lw: 1, edgeA: 0.9, fillCol: col ? '#C4CCD2' : null, fillA: 0.35 };
      E3.solid(E3.box(x - 0.04, x + 0.04, y - 0.04, y + 0.04, 0, 0.55), { tone: 0.2, shade: 0.5, lw: 0.9, edgeA: 0.8, fillCol: col ? '#A88B66' : null, fillA: 0.45 }, 15820);
      this.drum(x, y, 0.08, 0.55, 1.0, mt, 15821);
      const rim = new P(R11.ring([x, y], 0.08, 1.0, 20).slice(0, 20).map(E3.proj), true), inner = new P(R11.ring([x, y], 0.065, 1.0, 20).slice(0, 20).map(E3.proj), true);
      stroke(rim, 1, INK, 0.9, 0.9); fill(inner, INK, 0.5);
    },
    // the rain recorder: a drum with its collector on top
    recorder() {
      const [x, y] = this.RECORDER, col = OPT.colour, mt = { tone: 0, shade: 0.35, lw: 1, edgeA: 0.9, fillCol: col ? '#C4CCD2' : null, fillA: 0.35 };
      this.drum(x, y, 0.17, 0, 1.12, mt, 15830);
      this.drum(x, y, 0.08, 1.12, 1.25, mt, 15831);
      fill(new P(R11.ring([x, y], 0.065, 1.25, 16).slice(0, 16).map(E3.proj), true), INK, 0.5);
    },
    // the sunshine recorder: a glass sphere in its bowl on a concrete pillar
    helio() {
      const [x, y] = this.HELIO, d = E3.depth([x, y, 1.4]), col = OPT.colour;
      E3.solid(E3.box(x - 0.15, x + 0.15, y - 0.15, y + 0.15, 0, 1.3), { tone: 0.08, shade: 0.45, lw: 0.9, edgeA: 0.8, fillCol: col ? '#C4BEB0' : null, fillA: 0.4 }, 15840);
      E3.solid(E3.box(x - 0.12, x + 0.12, y - 0.1, y + 0.1, 1.3, 1.33), { tone: 0.2, shade: 0.5, lw: 0.8, edgeA: 0.8, fillCol: col ? HUE.steel : null, fillA: 0.4 }, 15841);
      const c = E3.proj([x, y, 1.42]), r = Math.max(1.6, 0.05 * this.ppm(d));
      const bowl = new P(Array.from({ length: 13 }, (_, k) => { const a = k / 12 * Math.PI; return [c[0] - r * 1.25 * Math.cos(a), c[1] + r * 0.2 + r * 0.9 * Math.sin(a)]; }));
      disc(c[0], c[1], r, '#F7F3E8', 1, 'source-over'); if (col) disc(c[0], c[1], r, HUE.sky, 0.25, 'multiply');
      stroke(el(c[0], c[1], r, r, 0, TAU, 15842, 0), 1, INK, 0.8, 0.85);
      stroke(bowl, 1, INK, 1.1, 0.9);
      disc(c[0] - r * 0.35, c[1] - r * 0.4, Math.max(0.6, r * 0.25), '#FFFFFF', 0.9, 'source-over');
    },

    /* ---------- leaves: lying on the grass, and a few drifting in low on the breeze ---------- */
    leafShape(c, a, s, tilt, flip) {
      // a maple or linden leaf (0.1-0.15 m), seen as it lies or turns: its outline round a midrib, a short stalk
      const ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
      const L = [[0, 0.62], [0.2, 0.42], [0.42, 0.36], [0.3, 0.16], [0.48, 0.02], [0.28, -0.12], [0.3, -0.34], [0.08, -0.26], [0, -0.42], [-0.08, -0.26], [-0.3, -0.34], [-0.28, -0.12], [-0.48, 0.02], [-0.3, 0.16], [-0.42, 0.36], [-0.2, 0.42]];
      const W = ([u, v]) => { const x = u * s * flip, y = v * s, X = x * ca - y * sa, Y = x * sa + y * ca; return [c[0] + X, c[1] + Y * ct, c[2] + Y * st]; };
      return { outline: L.map(W), rib: [W([0, 0.5]), W([0, -0.42]), W([0, -0.6])] };
    },
    leaves(t) {
      const col = OPT.colour, hy = this.hy;
      this.fallen.forEach(o => {
        const d = E3.depth([o.x, o.y, 0]); if (d < 1) return;
        const lf = this.leafShape([o.x, o.y, 0.006], o.a, o.s, 0, 1), p = new P(lf.outline.map(E3.proj), true);
        if (col) fill(p, this.mix('#E6AE40', '#B47634', o.c), 0.78); else fill(p, INK, 0.25);
        stroke(p, 1, INK, 0.5, 0.4);
      });
      this.drift.forEach(o => {
        const u = t - o.t0; if (u < 0) return;
        // the breeze carries it south (1.0-1.3 m/s near the ground), it falls at 0.4 m/s, swaying across its path
        const vy = -1.15 - 0.15 * Math.sin(o.ph), fall = 0.4;
        const zLand = 0.005, tl = (o.p[2] - zLand) / fall, uu = Math.min(u, tl);
        const sway = 0.28 * Math.sin(uu * 2.6 * o.sp + o.ph) * clamp(uu / 0.8);
        const pos = [o.p[0] + o.lat * uu + sway * 0.6, o.p[1] + vy * uu + sway * 0.4, Math.max(zLand, o.p[2] - fall * uu + 0.06 * Math.sin(uu * 5.2 * o.sp))];
        const landed = u >= tl;
        const spin = landed ? o.ph + tl * 2.3 * o.sp : o.ph + uu * 2.3 * o.sp, tilt = landed ? 0 : 0.9 + 0.6 * Math.sin(uu * 3.1 * o.sp + o.seed);
        const d = E3.depth(pos); if (d < 1) return;
        const lf = this.leafShape(pos, spin, o.s, tilt, Math.sin(uu * 1.7 + o.seed) > 0 ? 1 : -1);
        const sp = lf.outline.map(E3.proj), p = new P(sp, true);
        if (sp.every(q => q[0] < -20 || q[0] > PW + 20)) return;
        // never above the trees' line
        if (Math.min(...sp.map(q => q[1])) < hy - 120) return;
        mask(p);
        if (col) fill(p, this.mix('#EBB040', '#C07A32', o.c), 0.8); else fill(p, INK, 0.3);
        stroke(p, 1, INK, 0.6, 0.75);
        E3.line(lf.rib, INK, 0.5, 0.6);
        if (!landed) { const s2 = E3.proj(this.sh(pos)), sz = Math.max(1.5, o.s * 0.4 * this.ppm(E3.depth(this.sh(pos)))); disc(s2[0], s2[1], sz, '#2A3A50', 0.18); }
      });
    },
  });
}
