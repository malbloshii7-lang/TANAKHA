'use strict';
// Bucharest · Wednesday 1 October 2026, dusk (19:04 to 19:31 local time, EEST, UTC+3): the Romanian Athenaeum seen from
// its garden, and over it the 50 Members of WMO Regional Association VI coming out as lights, one for each. That day
// Region VI's conference on Early Warnings for All (30 September – 1 October) gave way to the 19th session of the
// Association (1–2 October). The plate names nothing, shows no lettering and claims no venue: the Athenaeum stands for
// the city that hosted the Region, as the screens, the lake and the chart stand for theirs.
//
// The building (its parts and proportions from public descriptions; its detail is generic, drawn to the film's scale):
//   the Romanian Athenaeum (Albert Galleron, opened 1888), its main front to the west over its garden. A stair of eight
//   steps; a portico of six fluted Ionic columns in front and one more behind each end (eight in all), 12 m tall, under a
//   plain triangular pediment; the peristyle wall behind them with its doors and the five round mosaic medallions above;
//   the concert hall (28.5 m across) under the great dome, which is sheathed in galvanised sheet over 20 ribs, with 20
//   windows (wreaths and lyres) at its foot, and ends in a tripod after the choragic monument of Lysicrates; the roofs of
//   the four spiral stairs make small cupolas round it; 41 m to the top. Sources: monumenteromania.ro (after Caloianu and
//   Filip, Monumente Bucureștene, 2009), Enciclopedia României (enciclopediaromaniei.ro), the George Enescu Foundation
//   (fundatiaenescu.ro), AGERPRES (1 July 2019). The lower round body about the hall, the front block's windows and every
//   moulding are drawn generic, and so is the floodlighting: its colour and aim are not documented here.
// The evening (sourced): Bucharest-Băneasa (WMO 15420) reported no cloud at 16, 17 and 18 UTC on 1 October (OGIMET
//   SYNOPs: N 0, visibility 20 km, wind 050° 2 m/s then 030° and 010° at 1 m/s, air 19.3 °C falling to 11.3 °C, dew
//   point 4.4 °C, 1028.8–1030 hPa); the airport, LRBS, CAVOK through the evening. So a clear, dry, still dusk. The sun
//   (NOAA's equations after Meeus, for 44.4414° N 26.0974° E, checked with PyEphem): it set at 18:57 at azimuth 266°; at
//   19:05 it stood 2.3° below the horizon and at 19:30 6.8° below (civil dusk ends at 19:26). In the east, where the eye
//   looks, the Earth's shadow rises from the horizon under the rose band of the Belt of Venus (the antisolar point at
//   azimuth 87°–92°), and both fade as the sky deepens; there is no Moon (it rose at 21:23) and no cloud.
// The lights (not stars, and not in the sky's own places): each Member at the seat of its national meteorological
//   service, on an azimuthal equidistant map centred on Bucharest (data/bucharest.js), north up, 0.095 px to the km, so
//   that Bucharest's light stands over the dome. They come out in the order of their true distance from Bucharest, Sofia
//   first (300 km) and Reykjavík last (3,665 km), and the coasts (Natural Earth 1:50m, public domain) are engraved in
//   behind them, faintly. No line joins any two lights, no ring spreads from the capital and no border is drawn: the
//   figure is the Region, every Member alike.
// The eye: in the garden west-south-west of the portico (about 80 m from the stair), 1.65 m up, looking east-north-east
//   (80°) with the camera level (its verticals upright and the horizon low on the plate, as an architect's view is
//   drawn), f 770 px; it eases 3 m forward over the beat. The lights belong to the sky, so they stay put as it moves.
// The living detail: the clock runs about 2.4 minutes of dusk to the second; the lamps in the garden come on, then the
//   floodlights on the Athenaeum, and windows across the city; Bucharest's light comes out over the dome, then the other
//   49, nearest first, with the coasts under them; the figure is named. The trees move a little in the light air.
{
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); };
  const newell = pts => {
    const n = [0, 0, 0];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    return nrm(n);
  };
  const mid3 = pts => pts.reduce((c, p) => [c[0] + p[0] / pts.length, c[1] + p[1] / pts.length, c[2] + p[2] / pts.length], [0, 0, 0]);
  const hex = (a, b, t) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = s => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(t)));
    return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
  };
  const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  // the plate's clock: c seconds; 19:04.5 at the cut, 2.4 minutes of dusk to the second
  const MIN0 = 19 * 60 + 4.5, MPS = 2.4;
  const sunAlt = c => -2.32 - 0.1784 * (MIN0 + c * MPS - (19 * 60 + 5));
  // the cues (plate seconds): the lamps, the floods, Bucharest's light, the other 49 coming out (over span seconds, in
  // the order of their distance from it), the figure's name
  const CUE = { lamps: 0.35, flood: 0.9, home: 1.35, grow: 1.75, span: 5.6, label: 8.1 };
  // the light: the afterglow low in the west behind the eye (azimuth 268°, 14° up), the floodlights on the ground before
  // the portico and on the roof of the front block (aimed at the dome)
  const LS = nrm([-0.970, -0.034, 0.242]);
  const FLOODS = {
    front: [{ p: [-46, -7.5, 0.4], k: 1, r: 24 }, { p: [-46, 7.5, 0.4], k: 1, r: 24 }],
    dome: [{ p: [-25, -10, 17.5], k: 0.85, r: 22 }, { p: [-25, 10, 17.5], k: 0.85, r: 22 }, { p: [-6, -22, 14], k: 0.5, r: 18 }],
    body: [{ p: [-38, -26, 0.3], k: 0.7, r: 16 }, { p: [-38, 26, 0.3], k: 0.7, r: 16 }],
  };
  const WARM = '#F2B24E', DUSK = '#53669E';
  // materials: wash colour and strength, how dark in full shade (tone + shade), how far the floodlight warms it
  const MAT = {
    stone: { col: '#ECE2CC', a: 0.36, tone: 0.0, shade: 0.62, warm: 0.85, fl: 'front' },
    column: { col: '#EFE6D2', a: 0.34, tone: 0.0, shade: 0.7, warm: 0.9, fl: 'front' },
    loggia: { col: '#D2C2A4', a: 0.5, tone: 0.34, shade: 0.42, warm: 0.28, fl: 'front' },
    body: { col: '#E4D8BE', a: 0.38, tone: 0.06, shade: 0.6, warm: 0.5, fl: 'body' },
    drum: { col: '#DDD0B4', a: 0.42, tone: 0.1, shade: 0.58, warm: 0.5, fl: 'dome' },
    zinc: { col: '#6C837F', a: 0.7, tone: 0.2, shade: 0.55, warm: 0.36, fl: 'dome' },
    roof: { col: '#8E9A98', a: 0.5, tone: 0.2, shade: 0.4, warm: 0.2, fl: null },
  };
  // the building (metres): origin at the centre of the dome on the ground, x east, y north, z up; the front faces west
  const AT = {
    XF: -33, XS: -28.9, XW: -27, P: 1.6, COLS: [-9.75, -5.85, -1.95, 1.95, 5.85, 9.75], CR: 0.64,
    STEPS: 8, RISE: 0.2, TREAD: 0.42, SW: 12.4, // the stair: eight steps of 0.2 m, 24.8 m wide
    E0: 13.6, E1: 15.5, E2: 16.2, PED: 20.4, PW: 10.75, // entablature (architrave and frieze, cornice), pediment
    BLK: [-27, -16, -14.6, 14.6, 16.2, 17.2], // the front block: x0, x1, y0, y1, cornice, parapet
    RB: 22.6, RBZ: 13.4, // the round body about the hall
    DR: 17.7, DZ0: 13.4, DZ1: 21.6, // the drum
    DOME: [17.2, 21.6, 15.8], // its radius at the foot, the foot's height, its rise (the crown at 37.4)
    CUP: 20.6, // the corner cupolas, at 45° on this radius
  };

  scene({
    id: 'bucharest', start: 0, dur: 17,
    init() {
      Object.assign(this, { F: 770, EYE: [-118, -20, 1.65], PUSH: 3, CX: 486, CY: 660, KM: 0.095, BY: 300 });
      const E = this.EYE;
      this.HEAD = Math.atan2(-E[0], -E[1]); // toward the dome's axis: 80°
      this.BX = this.CX;
      // the Members on the plate (the sky's own coordinates: they stay put as the eye moves)
      this.members = BUCHAREST.members.map(([name, seat, x, y, d], i) => ({ name, seat, d, x: this.BX + this.KM * x, y: this.BY - this.KM * y, i, home: d === 0 }));
      // each light comes out in the order of its distance from Bucharest (Sofia first, Reykjavík last), as the evening's
      // first stars come out one by one; no line joins any two
      const far = Math.max(...this.members.map(m => m.d));
      this.members.forEach(m => { m.t = m.home ? CUE.home : CUE.grow + m.d / far * CUE.span; });
      // the coasts in short runs, each engraved in as the lights reach its distance from Bucharest
      this.coast = [];
      BUCHAREST.coast.forEach(l => {
        const pts = []; for (let i = 0; i < l.length; i += 2) pts.push([this.BX + this.KM * l[i], this.BY - this.KM * l[i + 1], Math.hypot(l[i], l[i + 1]), l[i], l[i + 1]]);
        for (let i = 0; i < pts.length - 1; i += 10) {
          const run = pts.slice(i, i + 11), mean = k => run.reduce((s2, p) => s2 + p[k], 0) / run.length, r = mean(2);
          // the figure ends softly south of the Levant's latitudes and east of the Caspian (the Gulf, the Red Sea and
          // Central Asia lie outside the Region)
          const k = clamp((mean(4) + 1750) / 350) * clamp((2700 - mean(3)) / 400);
          if (k > 0.05) this.coast.push({ path: new P(run.map(p => [p[0], p[1]])), k, t: CUE.grow + 0.6 + Math.min(r, far) / far * CUE.span });
        }
      });
      const r = rng(15421);
      // the garden's trees (generic: limes and planes in autumn), placed by distance along the view and offset across it
      const H = this.HEAD, fwd = [Math.sin(H), Math.cos(H)], rt = [Math.cos(H), -Math.sin(H)];
      const at = (d, l) => [E[0] + fwd[0] * d + rt[0] * l, E[1] + fwd[1] * d + rt[1] * l];
      this.trees = [];
      [[34, -31, 1.05, 'plane'], [47, -27, 0.95, 'lime'], [62, -30, 1.0, 'lime'], [26, -22.5, 0.85, 'lime'], [80, -35, 0.9, 'plane'], [96, -38, 0.95, 'lime'],
        [31, 26, 1.0, 'lime'], [44, 31, 1.05, 'plane'], [58, 27, 0.9, 'lime'], [24, 19.5, 0.8, 'plane'], [78, 36, 0.95, 'lime'], [94, 40, 0.9, 'plane']]
        .forEach(([d, l, sz, kind], i) => { const [x, y] = at(d, l); this.trees.push(this.makeTree(x, y, sz, kind, 9700 + i)); });
      // the city beyond (generic blocks of six to twelve storeys, 230-560 m off, either side of the building)
      this.blocks = [];
      for (let i = 0; i < 16; i++) {
        const q = rng(9800 + i), side = i % 2 ? 1 : -1, d = 230 + q() * 330, l = side * (60 + q() * 190 + d * 0.1);
        const [x, y] = at(d, l);
        this.blocks.push({ x, y, w: 20 + q() * 34, dp: 14 + q() * 12, h: 20 + q() * 20, rot: H + (q() - 0.5) * 0.6, seed: 9800 + i, lit: Array.from({ length: 70 }, () => [q(), q(), q()]) });
      }
      // the lamps along the garden's walks (generic: cast-iron posts, a lantern on each, 3.9 m)
      this.lamps = [[-52, -5], [-52, 5], [-68, -5], [-68, 5], [-84, -5], [-60, -19], [-78, -21]].map(([x, y], i) => ({ x, y, on: CUE.lamps + i * 0.09 + (i % 3) * 0.05 }));
      // grass: blades over the lawn in the foreground
      this.view(0);
      const back = (sx, sy) => { const c = E3.cam(), x = (sx - c.cx) / c.f, y = -(sy - c.cy) / c.f, dd = [c.F[0] + x * c.R[0] + y * c.U[0], c.F[1] + x * c.R[1] + y * c.U[1], c.F[2] + x * c.R[2] + y * c.U[2]]; if (dd[2] >= -1e-4) return null; const k = -c.C[2] / dd[2]; return [c.C[0] + k * dd[0], c.C[1] + k * dd[1], 0]; };
      this.blades = [];
      for (let i = 0; i < 2600; i++) {
        const sx = r() * PW, sy = this.CY + 3 + Math.pow(r(), 0.8) * (PH + 20 - this.CY);
        const g = back(sx, sy); if (!g || this.onWalk(g[0], g[1])) continue;
        this.blades.push([g[0], g[1], 0.05 + 0.08 * r(), (r() - 0.5) * 0.05, (r() - 0.5) * 0.05, r()]);
      }
    },
    view(c) {
      const u = easeInOut(clamp((c + 0.5) / 12)), H = this.HEAD;
      const C = [this.EYE[0] + this.PUSH * u * Math.sin(H), this.EYE[1] + this.PUSH * u * Math.cos(H), this.EYE[2]];
      return E3.camera(C, [C[0] + 100 * Math.sin(H), C[1] + 100 * Math.cos(H), C[2]], this.F, this.CX, this.CY);
    },
    draw(t, lt) {
      registerRules(1); plateFrame(1);
      plate(() => this.art(t));
    },
    art(c) {
      this.view(c);
      this.lights(c);
      this.sky(c);
      this.chart(c);
      this.city(c);
      this.building(c);
      this.ground(c);
      this.drawTrees(c);
      this.lampPosts(c);
      this.glows(c);
      this.label(c);
    },

    /* ---------- helpers ---------- */
    hull(pts) {
      const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], hi = [];
      p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
      p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
      return lo.slice(0, -1).concat(hi.slice(0, -1));
    },
    bbox(path) { const xs = path.pts.map(p => p[0]), ys = path.pts.map(p => p[1]); return [Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) + 2, Math.max(...ys) + 2]; },
    PB: [-40, -40, 1012, 764],
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
    // a line of bare paper along a path (a lit edge, or the white an engraver leaves round a near thing)
    halo(path, lw, a = 1) {
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA * a; ctx.strokeStyle = PAPER_PAT; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); path.trace(ctx, 1); ctx.stroke(); ctx.restore();
    },
    // light laid over the plate (screen): glows, the lights in the sky, lit windows
    screen(fn) { ctx.save(); ctx.globalCompositeOperation = 'screen'; try { fn(); } finally { ctx.restore(); } },
    glow(x, y, r, col, a) {
      if (a <= 0.004 || r <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * Math.min(1, a);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(col, 1)); g.addColorStop(0.35, rgba(col, 0.45)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
    },
    poly(pts) {
      const zn = 0.6, out = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], da = E3.depth(a), db = E3.depth(b);
        if (da >= zn) out.push(a);
        if ((da >= zn) !== (db >= zn)) { const u = (zn - da) / (db - da); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]); }
      }
      return out.length >= 3 ? new P(out.map(E3.proj), true) : null;
    },
    onWalk(x, y) { return (Math.abs(y) < 3.2 && x < -36) || (x > -48 && x < -36.5 && Math.abs(y) < 17) || (Math.abs(x + 64) < 2.2 && y < 0); },

    /* ---------- the light of the moment ---------- */
    lights(c) {
      const k = clamp((c + 0.5) / 12);
      this.alt = sunAlt(c);
      this.L = {
        amb: lerp(0.52, 0.2, k), // the sky's light from above, fading
        sky: lerp(0.5, 0.08, k), // the afterglow in the west, behind the eye
        flood: smooth((c - CUE.flood) / 1.5), // the floodlights warming up
        dusk: lerp(0.5, 0.82, k), // how blue the shade has gone
      };
    },
    // the light on a surface at p with normal n: [luminance 0-1, the floodlights' share]
    lum(n, p, set) {
      const L = this.L;
      const l = L.amb * (0.5 + 0.5 * n[2]) + L.sky * Math.max(0, dot(n, LS));
      let w = 0;
      if (set && L.flood > 0) FLOODS[set].forEach(f => { const d = sub(f.p, p), dl = Math.hypot(d[0], d[1], d[2]); w += Math.max(0, dot(n, d) / dl) * f.k * Math.min(1, Math.pow(f.r / dl, 1.25)); });
      w *= L.flood;
      return [clamp(l + w), w];
    },
    // a material's wash colour where the light is l (of which w is the floods')
    matCol(m, l, w) { return hex(hex(m.col, DUSK, (1 - l) * this.L.dusk), WARM, Math.min(0.85, w * m.warm)); },
    // one plane face of the building, lit by the moment's light, hatched as it falls into shade
    pface(pts, m, seed, { n = null, lw = 1, edgeA = 0.7, hdir = null, noHatch = false, k = 1 } = {}) {
      n = n || newell(pts);
      const c = mid3(pts);
      if (dot(n, sub(E3.cam().C, c)) <= 0) return null;
      const [l, w] = this.lum(n, c, m.fl), dark = clamp(m.tone + m.shade * (1 - l)) * k;
      const f = E3.face(pts, { n, tone: dark, shade: 0, fillCol: OPT.colour ? this.matCol(m, l, w) : null, fillA: m.a, hdir, lw, edgeA, noHatch }, seed);
      if (f) f.l = l;
      return f;
    },

    /* ---------- the sky: the blue hour, the Earth's shadow rising in the east under the Belt of Venus ---------- */
    sky(c) {
      const cy = this.CY, f = this.F, a = this.alt, yOf = e => cy - f * Math.tan(e * Math.PI / 180);
      const late = clamp((-a - 2.3) / 5);
      // the Earth's shadow: its edge rises about as the sun sinks; the belt of rose above it fades out by -7°
      const es = Math.max(0.4, -a - 0.9), belt = clamp((a + 7.2) / 4.6);
      const top = -4, span = cy + 3 - top, off = y => clamp((y - top) / span);
      const zen = hex('#4E74B8', '#16275F', late), hi = hex('#6B8CC6', '#25397A', late), lo = hex('#8EA6D2', '#3A4C8A', late);
      const rose = hex('#9C8EB8', '#E7A3A2', belt), shadow = hex('#6F7EAE', '#3D4C86', late);
      const stops = [[0, zen, lerp(0.74, 0.93, late)], [off(yOf(30)), hi, lerp(0.62, 0.86, late)], [off(yOf(es + 13)), lo, lerp(0.5, 0.78, late)],
        [off(yOf(es + 6.5)), rose, lerp(0.46, 0.6, late)], [off(yOf(es + 1.2)), hex(rose, shadow, 0.5), 0.55], [off(yOf(es)), shadow, lerp(0.6, 0.78, late)], [1, hex(shadow, '#7C86AC', 0.4), lerp(0.55, 0.72, late)]]
        .sort((p, q) => p[0] - q[0]);
      if (OPT.colour) washFade([0, top, PW, cy + 3], stops, 0, 1);
      // the engraver's ruling: level lines, closer and darker overhead
      const NB = 12, bands = Array.from({ length: NB + 1 }, () => []), k = OPT.colour ? 0.32 : 1;
      let row = 0;
      for (let y = 2; y < cy - 2; y += 4.1, row++) {
        const e = (cy - y) / cy;
        for (let x = 0, j = 0; x < PW; x += 9, j++) {
          const al = (0.1 + 0.5 * Math.pow(e, 0.8)) * k, h = ((row * 73856093) ^ (j * 19349663)) >>> 0;
          const bi = Math.round(al / 0.6 * NB + ((h % 1000) / 1000 - 0.5));
          if (bi > 0) bands[Math.min(NB, bi)].push([x, y, x + 9]);
        }
      }
      bands.forEach((segs, i) => {
        if (!segs.length) return;
        ctx.save(); ctx.globalAlpha = SA * 0.6 * i / NB; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.75; ctx.lineCap = 'butt';
        ctx.beginPath(); segs.forEach(([x0, y, x1]) => { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }); ctx.stroke(); ctx.restore();
      });
    },

    /* ---------- the chart in the sky: the ring, the threads, the coasts and the 50 lights ---------- */
    chart(c) {
      // the coasts, faint, engraved in behind the lights as they come out
      const bands = [[], [], [], [], []];
      this.coast.forEach(k => { const q = smooth((c - k.t) / 1.1) * k.k; if (q > 0.02) bands[Math.min(4, Math.floor(q * 5))].push(k.path); });
      this.screen(() => {
        ctx.strokeStyle = '#CBD5F0'; ctx.lineWidth = 0.75; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        bands.forEach((list, i) => { if (!list.length) return; ctx.globalAlpha = SA * 0.3 * (i + 1) / 5; ctx.beginPath(); list.forEach(p => p.trace(ctx, 1)); ctx.stroke(); });
      });
      // the lights: a small compass star each (the film's ornament), coming out softly, with a faint glow
      this.members.forEach(m => {
        const after = c - m.t;
        if (after <= 0) return;
        const p = smooth(after / 0.6), tw = 1 + 0.06 * Math.sin(c * 2.3 + m.i * 1.9);
        const r = (m.home ? 8.5 : 3.8) * (0.7 + 0.3 * p) * tw;
        this.glow(m.x, m.y, m.home ? 30 : 12, '#FFD98A', (m.home ? 0.55 : 0.45) * p);
        this.screen(() => {
          const st = compassStar(m.x, m.y, r);
          ctx.globalAlpha = SA * p; ctx.fillStyle = '#FFF0C8'; ctx.beginPath(); st.trace(ctx, 1); ctx.fill();
        });
      });
    },

    /* ---------- the city beyond: blocks either side of the Athenaeum, their windows coming on ---------- */
    city(c) {
      const C = E3.cam().C, on = 0.1 + 0.4 * clamp((c + 1) / 11);
      this.blocks.slice().sort((a, b) => Math.hypot(b.x - C[0], b.y - C[1]) - Math.hypot(a.x - C[0], a.y - C[1])).forEach(o => {
        const cs = Math.cos(o.rot), sn = Math.sin(o.rot), Q = (u, v, z) => [o.x + u * cs + v * sn, o.y - u * sn + v * cs, z];
        const hw = o.w / 2, hd = o.dp / 2, h = o.h, dist = Math.hypot(o.x - C[0], o.y - C[1]), hz = clamp((dist - 230) / 400);
        const walls = [[Q(-hw, -hd, 0), Q(hw, -hd, 0), Q(hw, -hd, h), Q(-hw, -hd, h)], [Q(hw, -hd, 0), Q(hw, hd, 0), Q(hw, hd, h), Q(hw, -hd, h)],
          [Q(hw, hd, 0), Q(-hw, hd, 0), Q(-hw, hd, h), Q(hw, hd, h)], [Q(-hw, hd, 0), Q(-hw, -hd, 0), Q(-hw, -hd, h), Q(-hw, hd, h)]];
        const faces = E3.solid(walls, { tone: 0, shade: 0, lw: 0.5, edgeA: 0.3, noHatch: true, fillCol: OPT.colour ? hex('#4C5A86', '#7480A8', hz) : null, fillA: 0.7 }, o.seed);
        // the storeys, and a share of the windows lit, more as the dusk deepens
        faces.forEach((f, k) => {
          if (!f) return;
          const w = walls[k], rows = Math.floor(h / 3.2), cols = Math.max(3, Math.floor(Math.hypot(w[1][0] - w[0][0], w[1][1] - w[0][1]) / 3.6));
          const fl = [];
          for (let r2 = 1; r2 < rows; r2++) { const a = E3.proj([w[0][0], w[0][1], r2 * 3.2]), b = E3.proj([w[1][0], w[1][1], r2 * 3.2]); fl.push([a[0], a[1], b[0], b[1], 0.16]); }
          this.strokes(fl, INK, 0.5, 'butt');
          this.screen(() => {
            ctx.fillStyle = '#F2C27A';
            o.lit.forEach(([u, v, s2]) => {
              if (s2 > on) return;
              const rr = Math.floor(u * rows), cc = Math.floor(v * cols), fu = (cc + 0.5) / cols, fz = (rr + 0.5) * 3.2;
              const q = E3.proj([lerp(w[0][0], w[1][0], fu), lerp(w[0][1], w[1][1], fu), fz]);
              ctx.globalAlpha = SA * (0.3 + 0.45 * (1 - s2 / on)) * (1 - 0.4 * hz); ctx.fillRect(q[0] - 0.8, q[1] - 1.1, 1.6, 2);
            });
          });
        });
      });
    },

    /* ---------- the Athenaeum ---------- */
    building(c) {
      const A = AT;
      // far to near: the cupolas behind, the dome and its lantern, the drum, the round body, the cupolas in front, the
      // front block, then the portico from its back wall forward, and the stair
      [45, 315].forEach((az, i) => this.cupola(az, 9900 + i));
      this.dome(c);
      this.drum(c);
      this.roundBody(c);
      [135, 225].forEach((az, i) => this.cupola(az, 9910 + i));
      this.frontBlock(c);
      this.portico(c);
      this.stair(c);
    },
    // a surface of revolution about the vertical through ctr: prof [[r, z], ...] from the bottom up. Masked to its
    // outline and washed (lighter where the floods reach), then shaded as an engraver shades a dome or a column: with
    // its meridians, which crowd together toward its edges and darken as it turns from the light
    rev(ctr, prof, m, seed, { nM = 60, lw = 0.55, k = 0.7, washSteps = true } = {}) {
      const E = E3.cam().C, pts = [];
      prof.forEach(([r, z]) => { for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; pts.push(E3.proj([ctr[0] + r * Math.cos(a), ctr[1] + r * Math.sin(a), z])); } });
      const out = new P(this.hull(pts), true);
      mask(out);
      const a0 = Math.atan2(E[1] - ctr[1], E[0] - ctr[0]);
      if (OPT.colour) {
        // the wash from the meridian that faces the eye: its light at each height, top to bottom
        const st = [], bb = this.bbox(out);
        for (let j = prof.length - 1; j >= 0; j--) {
          const [r, z] = prof[j], jn = Math.min(prof.length - 1, j + 1), jp = Math.max(0, j - 1);
          const dr = prof[jn][0] - prof[jp][0], dz = prof[jn][1] - prof[jp][1], L = Math.hypot(dr, dz) || 1;
          const n = [Math.cos(a0) * dz / L, Math.sin(a0) * dz / L, -dr / L], p = [ctr[0] + r * Math.cos(a0), ctr[1] + r * Math.sin(a0), z];
          const [l, w] = this.lum(n, p, m.fl), y = E3.proj(p)[1];
          st.push([clamp((y - bb[1]) / (bb[3] - bb[1] || 1)), this.matCol(m, l, w), m.a]);
        }
        st.sort((p, q) => p[0] - q[0]);
        if (st.length > 1 && washSteps) washFade(bb, st, 0, 1, out); else wash(out, st[0][1], m.a);
      }
      const segs = [];
      for (let i = 0; i < nM; i++) {
        const th = a0 - Math.PI / 2 + (i + 0.5) / nM * Math.PI, ct = Math.cos(th), sn = Math.sin(th);
        for (let j = 1; j < prof.length; j++) {
          const [r0, z0] = prof[j - 1], [r1, z1] = prof[j];
          const p0 = [ctr[0] + r0 * ct, ctr[1] + r0 * sn, z0], p1 = [ctr[0] + r1 * ct, ctr[1] + r1 * sn, z1];
          const dr = r1 - r0, dz = z1 - z0, L = Math.hypot(dr, dz) || 1, n = [ct * dz / L, sn * dz / L, -dr / L];
          const md = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (z0 + z1) / 2];
          if (dot(n, sub(E, md)) <= 0) continue;
          const [l] = this.lum(n, md, m.fl), dark = clamp(m.tone + m.shade * (1 - l));
          const a = E3.proj(p0), b = E3.proj(p1);
          segs.push([a[0], a[1], b[0], b[1], dark * k]);
        }
      }
      this.strokes(segs, INK, lw);
      stroke(out, 1, INK, 0.8, 0.55);
      return { out, a0 };
    },
    // the visible arc of a level circle (a cornice, a string course)
    ring(ctr, r, z, a0, lw = 0.8, a = 0.6, span = 1) {
      const pts = [];
      for (let i = 0; i <= 48; i++) { const th = a0 - span * Math.PI / 2 + i / 48 * span * Math.PI; pts.push(E3.proj([ctr[0] + r * Math.cos(th), ctr[1] + r * Math.sin(th), z])); }
      stroke(new P(pts), 1, INK, lw, a);
      return new P(pts);
    },
    // a small window on a curved or flat wall: centre p, across u, up v (unit world vectors), w × h metres with a round
    // head; glass dark, or lit from within
    window(p, u, v, w, h, lit, { arch = true, frameA = 0.6 } = {}) {
      const pts = [], hw = w / 2, rh = arch ? hw : 0, n = 14;
      const W3 = (a, b) => E3.proj([p[0] + u[0] * a + v[0] * b, p[1] + u[1] * a + v[1] * b, p[2] + u[2] * a + v[2] * b]);
      pts.push(W3(-hw, -h / 2), W3(hw, -h / 2));
      if (arch) for (let i = 0; i <= n; i++) { const a = i / n * Math.PI; pts.push(W3(hw * Math.cos(a), h / 2 - rh + rh * Math.sin(a))); }
      else pts.push(W3(hw, h / 2), W3(-hw, h / 2));
      const path = new P(pts, true);
      if (OPT.colour) wash(path, lit > 0 ? hex('#3A4670', '#F0B860', lit) : '#2E3A62', 0.62);
      else fill(path, INK, 0.45);
      if (lit > 0) this.screen(() => { ctx.globalAlpha = SA * 0.35 * lit; ctx.fillStyle = '#F5C57A'; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); });
      stroke(path, 1, INK, 0.6, frameA);
      return path;
    },
    dome(c) {
      const A = AT, [R, z0, H] = A.DOME, prof = [];
      for (let i = 0; i <= 16; i++) { const ph = i / 16 * Math.PI / 2; prof.push([R * Math.cos(ph) + (i === 16 ? 0.01 : 0), z0 + H * Math.pow(Math.sin(ph), 1.0)]); }
      const { a0 } = this.rev([0, 0], prof, MAT.zinc, 9920, { nM: 110, lw: 0.5, k: 0.72 });
      const E = E3.cam().C;
      // the ribs: twenty, the zinc's seams standing proud (a lit line beside a dark one)
      for (let k = 0; k < 20; k++) {
        const th = k / 20 * TAU + Math.PI / 20, ct = Math.cos(th), sn = Math.sin(th), pts = [];
        prof.forEach(([r, z], j) => { if (j >= prof.length - 2) return; const p = [r * ct, r * sn, z], n = [ct, sn, 0.4]; if (dot(n, sub(E, p)) > 0) pts.push(E3.proj(p)); });
        if (pts.length < 2) continue;
        const path = new P(pts);
        this.halo(path, 1.9, 0.8); stroke(path, 1, INK, 0.8, 0.62);
      }
      // the twenty small windows at its foot, between the ribs, each in its wreath
      for (let k = 0; k < 20; k++) {
        const th = k / 20 * TAU, ct = Math.cos(th), sn = Math.sin(th), z = z0 + 1.7, r = R * Math.cos(Math.asin(1.7 / H)) - 0.05;
        const p = [r * ct, r * sn, z], n = [ct, sn, 0.3];
        if (dot(n, sub(E, p)) < 1.5) continue;
        const u = [-sn, ct, 0], v = nrm([-ct * 0.35, -sn * 0.35, 1]);
        const w = this.window(p, u, v, 1.25, 1.25, 0, { arch: false, frameA: 0.5 });
        // the wreath: a round frame, lit by the floods
        const pr = [];
        for (let i = 0; i <= 20; i++) { const a = i / 20 * TAU; pr.push(E3.proj([p[0] + u[0] * 0.95 * Math.cos(a) + v[0] * 0.95 * Math.sin(a), p[1] + u[1] * 0.95 * Math.cos(a) + v[1] * 0.95 * Math.sin(a), p[2] + v[2] * 0.95 * Math.sin(a)])); }
        const wr = new P(pr, true);
        this.halo(wr, 1.6, 0.7); stroke(wr, 1, INK, 0.6, 0.55);
        if (w) void 0;
      }
      this.ring([0, 0], R + 0.15, z0 + 0.2, a0, 1, 0.65);
      // the crown's finial: an acanthus pedestal and the tripod over it, after the choragic monument of Lysicrates (41 m)
      const zc = z0 + H;
      const fprof = [[1.45, zc - 0.35], [1.45, zc + 0.15], [1.05, zc + 0.45], [0.75, zc + 0.9], [0.95, zc + 1.15], [1.0, zc + 1.35], [0.25, zc + 1.5]];
      this.rev([0, 0], fprof, MAT.zinc, 9930, { nM: 18, lw: 0.5, k: 0.75 });
      const bowl = [0, 0, zc + 3.25], bp = E3.proj(bowl), br = 0.62 * this.F / E3.depth(bowl);
      [a0 - 1.2, a0, a0 + 1.2].forEach(th => {
        const foot = E3.proj([0.85 * Math.cos(th), 0.85 * Math.sin(th), zc + 1.4]), top = E3.proj([0.55 * Math.cos(th), 0.55 * Math.sin(th), zc + 3.2]);
        this.halo(new P([foot, top]), 1.6, 0.6); stroke(new P([foot, top]), 1, INK, 0.75, 0.8);
      });
      const cup = new P([[bp[0] - br, bp[1] - 1], [bp[0] - br * 0.7, bp[1] + br * 0.45], [bp[0] + br * 0.7, bp[1] + br * 0.45], [bp[0] + br, bp[1] - 1]], true);
      mask(cup); if (OPT.colour) wash(cup, this.matCol(MAT.zinc, 0.5, this.L.flood * 0.4), 0.7); stroke(cup, 1, INK, 0.7, 0.85);
      const tip = E3.proj([0, 0, zc + 3.65]);
      stroke(new P([[bp[0], bp[1] - 1], tip]), 1, INK, 0.8, 0.8);
    },
    drum(c) {
      const A = AT, prof = [[A.DR, A.DZ0], [A.DR, A.DZ1 - 0.9], [A.DR + 0.5, A.DZ1 - 0.6], [A.DR + 0.75, A.DZ1 - 0.2], [A.DR + 0.75, A.DZ1]];
      const { a0 } = this.rev([0, 0], prof, MAT.drum, 9940, { nM: 80, lw: 0.5, k: 0.62 });
      const E = E3.cam().C;
      // pilasters in pairs, forty about it
      for (let k = 0; k < 40; k++) {
        const th = k / 40 * TAU, ct = Math.cos(th), sn = Math.sin(th), p = [A.DR * ct, A.DR * sn, (A.DZ0 + A.DZ1) / 2];
        if (dot([ct, sn, 0], sub(E, p)) <= 2) continue;
        const a = E3.proj([A.DR * ct, A.DR * sn, A.DZ0 + 0.5]), b = E3.proj([A.DR * ct, A.DR * sn, A.DZ1 - 0.9]);
        this.halo(new P([a, b]), 1.4, 0.55); stroke(new P([[a[0] + 1, a[1]], [b[0] + 1, b[1]]]), 1, INK, 0.55, 0.45);
      }
      this.ring([0, 0], A.DR + 0.75, A.DZ1 - 0.2, a0, 0.9, 0.6);
      this.ring([0, 0], A.DR + 0.05, A.DZ1 - 0.9, a0, 0.7, 0.5);
    },
    roundBody(c) {
      const A = AT, prof = [[A.RB, 0], [A.RB, A.RBZ - 1.1], [A.RB + 0.45, A.RBZ - 0.75], [A.RB + 0.6, A.RBZ - 0.35], [A.RB + 0.25, A.RBZ - 0.3], [A.RB + 0.25, A.RBZ + 0.6]];
      const { a0 } = this.rev([0, 0], prof, MAT.body, 9950, { nM: 90, lw: 0.5, k: 0.6 });
      const E = E3.cam().C, r = rng(9951);
      for (let k = 0; k < 36; k++) {
        const th = (k + 0.5) / 36 * TAU, ct = Math.cos(th), sn = Math.sin(th), u = [-sn, ct, 0], v = [0, 0, 1], lit = r();
        [[4.6, 1.7, 3.9, true], [10.2, 1.3, 1.6, false]].forEach(([z, w, h, arch], j) => {
          const p = [(A.RB + 0.02) * ct, (A.RB + 0.02) * sn, z];
          if (dot([ct, sn, 0], sub(E, p)) <= 3) return;
          this.window(p, u, v, w, h, lit < 0.3 ? smooth((c - 1.5 - k * 0.07) / 1.2) * (0.6 + 0.4 * lit) : 0, { arch });
        });
      }
      this.ring([0, 0], A.RB + 0.6, A.RBZ - 0.35, a0, 0.9, 0.55);
      this.ring([0, 0], A.RB + 0.02, 1.2, a0, 0.7, 0.35);
    },
    cupola(az, seed) {
      const A = AT, th = az * Math.PI / 180, ctr = [A.CUP * Math.sin(th), A.CUP * Math.cos(th)];
      const z0 = A.RBZ, prof = [[2.4, z0], [2.4, z0 + 6.4], [2.7, z0 + 6.6], [2.7, z0 + 7.0], [2.35, z0 + 7.1]];
      for (let i = 1; i <= 8; i++) { const ph = i / 8 * Math.PI / 2; prof.push([2.35 * Math.cos(ph) + (i === 8 ? 0.01 : 0), z0 + 7.1 + 2.4 * Math.sin(ph)]); }
      const { a0 } = this.rev(ctr, prof, MAT.zinc, seed, { nM: 26, lw: 0.5, k: 0.7 });
      const E = E3.cam().C;
      // its finial: a short spike with a ball
      const f0 = E3.proj([ctr[0], ctr[1], z0 + 9.45]), f1 = E3.proj([ctr[0], ctr[1], z0 + 10.5]);
      stroke(new P([f0, f1]), 1, INK, 0.9, 0.75);
      disc(f1[0], f1[1] + 1.2, 1.3, INK, 0.7);
      for (let k = 0; k < 8; k++) {
        const t2 = k / 8 * TAU, ct = Math.cos(t2), sn = Math.sin(t2), p = [ctr[0] + 2.42 * ct, ctr[1] + 2.42 * sn, z0 + 4.1];
        if (dot([ct, sn, 0], sub(E, p)) <= 0.5) continue;
        this.window(p, [-sn, ct, 0], [0, 0, 1], 0.7, 1.9, 0, { frameA: 0.5 });
      }
      this.ring(ctr, 2.7, z0 + 6.8, a0, 0.8, 0.6);
    },
    frontBlock(c) {
      const [x0, x1, y0, y1, zc, zp] = AT.BLK, m = MAT.stone, r = rng(9960);
      // its south side (the eye stands south of the axis), its two front wings beside the portico, the parapet
      const S = [[x0, y0, 0], [x1, y0, 0], [x1, y0, zc], [x0, y0, zc]];
      this.pface(S, MAT.body, 9961, { n: [0, -1, 0], lw: 0.8 });
      [[y0, -AT.PW - 0.6], [AT.PW + 0.6, y1]].forEach(([ya, yb], i) => {
        this.pface([[x0, yb, 0], [x0, ya, 0], [x0, ya, zc], [x0, yb, zc]], m, 9962 + i, { n: [-1, 0, 0], lw: 0.9 });
        const yc = (ya + yb) / 2;
        this.window([x0 - 0.02, yc, 6.4], [0, -1, 0], [0, 0, 1], 1.7, 5.2, r() < 0.5 ? 0.7 * smooth((c - 1.2) / 1.5) : 0);
        this.window([x0 - 0.02, yc, 12.3], [0, -1, 0], [0, 0, 1], 1.4, 1.7, 0, { arch: false });
      });
      // the side's windows
      for (let k = 0; k < 3; k++) {
        const x = lerp(x0 + 2.4, x1 - 1.4, k / 2), lit = r() < 0.5 ? 0.7 * smooth((c - 1.4 - k * 0.2) / 1.5) : 0;
        this.window([x, y0 - 0.02, 6.4], [1, 0, 0], [0, 0, 1], 1.7, 5.2, lit);
        this.window([x, y0 - 0.02, 12.3], [1, 0, 0], [0, 0, 1], 1.4, 1.7, 0, { arch: false });
      }
      // the cornice and the parapet over it, all round the front
      this.pface([[x0 - 0.6, y0 - 0.6, zc - 0.7], [x1, y0 - 0.6, zc - 0.7], [x1, y0 - 0.6, zc], [x0 - 0.6, y0 - 0.6, zc]], m, 9965, { n: [0, -1, 0], lw: 0.8 });
      this.pface([[x0 - 0.6, y1 + 0.6, zc - 0.7], [x0 - 0.6, y0 - 0.6, zc - 0.7], [x0 - 0.6, y0 - 0.6, zc], [x0 - 0.6, y1 + 0.6, zc]], m, 9966, { n: [-1, 0, 0], lw: 0.8 });
      this.pface([[x0 - 0.6, y0 - 0.6, zc - 0.7], [x0 - 0.6, y1 + 0.6, zc - 0.7], [x0, y1 + 0.6, zc - 0.7], [x0, y0 - 0.6, zc - 0.7]], m, 9967, { n: [0, 0, -1], lw: 0.6, k: 1.2 });
      this.pface([[x0 - 0.2, y0 - 0.2, zc], [x1, y0 - 0.2, zc], [x1, y0 - 0.2, zp], [x0 - 0.2, y0 - 0.2, zp]], m, 9968, { n: [0, -1, 0], lw: 0.8 });
      this.pface([[x0 - 0.2, y1 + 0.2, zc], [x0 - 0.2, y0 - 0.2, zc], [x0 - 0.2, y0 - 0.2, zp], [x0 - 0.2, y1 + 0.2, zp]], m, 9969, { n: [-1, 0, 0], lw: 0.8 });
      // the base course
      E3.line([[x0 - 0.05, y1, 1.2], [x0 - 0.05, AT.PW + 0.6, 1.2]], INK, 0.7, 0.4);
      E3.line([[x0 - 0.05, -AT.PW - 0.6, 1.2], [x0 - 0.05, y0, 1.2], [x1, y0, 1.2]], INK, 0.7, 0.4);
    },
    portico(c) {
      const A = AT, m = MAT.stone, P0 = A.P, xe = A.XF - 0.8, xc = A.XF - 1.3, W = A.PW, Wc = W + 0.5;
      // the soffit over the portico (seen from below), the peristyle wall in the portico's shade, its doors and the five
      // mosaic medallions over them
      this.pface([[xe, W, A.E0], [xe, -W, A.E0], [A.XW, -W, A.E0], [A.XW, W, A.E0]], MAT.loggia, 9970, { n: [0, 0, -1], lw: 0.6 });
      const wall = this.pface([[A.XW, W, P0], [A.XW, -W, P0], [A.XW, -W, A.E0], [A.XW, W, A.E0]], MAT.loggia, 9971, { n: [-1, 0, 0], lw: 0.7 });
      [-4.2, 0, 4.2].forEach((y, i) => this.window([A.XW - 0.02, y, P0 + 2.9], [0, -1, 0], [0, 0, 1], 2.3, 5.8, 0.35 * smooth((c - 1.1 - i * 0.15) / 1.4), { frameA: 0.7 }));
      [-8.4, -4.2, 0, 4.2, 8.4].forEach(y => {
        const pc = [A.XW - 0.03, y, P0 + 8.6], pts = [];
        for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; pts.push(E3.proj([pc[0], y + 0.95 * Math.cos(a), pc[2] + 0.95 * Math.sin(a)])); }
        const md = new P(pts, true);
        if (OPT.colour) wash(md, hex('#B8913E', '#E9B957', this.L.flood), 0.7);
        this.halo(md, 1.4, 0.6 * this.L.flood + 0.2); stroke(md, 1, INK, 0.6, 0.6);
      });
      // the side columns (behind the end ones), then the entablature and the pediment, then the six in front
      [-1, 1].forEach((s2, i) => this.column(A.XS, s2 * A.COLS[5], 9972 + i));
      this.pface([[xe, -W, A.E0], [xe, W, A.E0], [xe, W, A.E1], [xe, -W, A.E1]], m, 9974, { n: [-1, 0, 0], lw: 0.8, hdir: [0, 1, 0] });
      this.pface([[A.XW, -W, A.E0], [xe, -W, A.E0], [xe, -W, A.E1], [A.XW, -W, A.E1]], m, 9975, { n: [0, -1, 0], lw: 0.7 });
      this.pface([[xc, -Wc, A.E1], [xc, Wc, A.E1], [xc, Wc, A.E2], [xc, -Wc, A.E2]], m, 9976, { n: [-1, 0, 0], lw: 0.8 });
      this.pface([[xc, Wc, A.E1], [xc, -Wc, A.E1], [xe, -Wc, A.E1], [xe, Wc, A.E1]], m, 9977, { n: [0, 0, -1], lw: 0.6, k: 1.15 });
      this.pface([[A.XW, -Wc, A.E1], [xc, -Wc, A.E1], [xc, -Wc, A.E2], [A.XW, -Wc, A.E2]], m, 9978, { n: [0, -1, 0], lw: 0.7 });
      // the architrave's three fasciae and the frieze over them, and the cornice's dentils
      [A.E0 + 0.38, A.E0 + 0.74, A.E0 + 1.1].forEach((z, i) => E3.line([[xe - 0.01, -W, z], [xe - 0.01, W, z]], INK, 0.6, 0.45 - i * 0.05));
      const den = [];
      for (let y = -W + 0.2; y <= W - 0.1; y += 0.38) { const a = E3.proj([xe - 0.02, y, A.E1 - 0.05]), b = E3.proj([xe - 0.02, y, A.E1 - 0.3]); den.push([a[0], a[1], b[0], b[1], 0.42]); }
      this.strokes(den, INK, 0.7);
      // the pediment: the plain tympanum and the raking cornices
      const tym = [[xe + 0.2, -W, A.E2], [xe + 0.2, W, A.E2], [xe + 0.2, 0, A.PED - 0.6]];
      this.pface(tym, m, 9979, { n: [-1, 0, 0], lw: 0.8 });
      const rake = s => [[xc, s * Wc, A.E2 - 0.05], [xc, 0, A.PED], [xc, 0, A.PED - 0.7], [xc, s * (Wc - 1.2), A.E2 - 0.05]];
      [-1, 1].forEach((s, i) => { const q = rake(s); this.pface(s > 0 ? q.reverse() : q, m, 9980 + i, { n: [-1, 0, 0], lw: 0.8 }); });
      this.pface([[A.XW, -Wc, A.E2], [xc, -Wc, A.E2], [xc, 0, A.PED], [A.XW, 0, A.PED]], MAT.roof, 9982, { lw: 0.7 });
      // the six in front, the farther (north) first
      A.COLS.slice().sort((a, b) => E3.depth([A.XF, b, 8]) - E3.depth([A.XF, a, 8])).forEach((y, i) => this.column(A.XF, y, 9984 + i));
    },
    // an Ionic column: plinth, base, the fluted shaft with its swelling, the capital's volutes and the abacus
    column(x, y, seed) {
      const A = AT, P0 = A.P, R = A.CR, E = E3.cam().C;
      E3.solid(E3.box(x - 0.82, x + 0.82, y - 0.82, y + 0.82, P0, P0 + 0.24), { tone: 0.05, shade: 0.4, lw: 0.6, edgeA: 0.6, fillCol: OPT.colour ? this.matCol(MAT.column, 0.6, this.L.flood * 0.5) : null, fillA: 0.3, noHatch: true }, seed);
      const prof = [[0.8, P0 + 0.24], [0.84, P0 + 0.36], [0.74, P0 + 0.46], [0.7, P0 + 0.52], [R, P0 + 0.58], [R + 0.02, P0 + 4], [R - 0.03, P0 + 8], [R - 0.1, P0 + 11.25], [R - 0.04, P0 + 11.35], [0.66, P0 + 11.55]];
      const { out, a0 } = this.rev([x, y], prof, MAT.column, seed + 1, { nM: 13, lw: 0.6, k: 0.72 });
      // the capital: the volutes' scrolls to front and back, the abacus over them
      const zv = P0 + 11.55, sx = Math.sign(E[0] - x) || -1;
      E3.solid(E3.box(x - 0.8, x + 0.8, y - 0.8, y + 0.8, zv + 0.25, zv + 0.45), { tone: 0.05, shade: 0.45, lw: 0.6, edgeA: 0.7, fillCol: OPT.colour ? this.matCol(MAT.column, 0.7, this.L.flood * 0.6) : null, fillA: 0.3, noHatch: true }, seed + 2);
      const cap = [[x + sx * 0.6, y - 0.82, zv - 0.1], [x + sx * 0.6, y + 0.82, zv - 0.1], [x + sx * 0.6, y + 0.82, zv + 0.25], [x + sx * 0.6, y - 0.82, zv + 0.25]];
      this.pface(cap, MAT.column, seed + 3, { n: [sx, 0, 0], lw: 0.6, noHatch: true });
      [-1, 1].forEach(s => {
        const c3 = [x + sx * 0.62, y + s * 0.6, zv - 0.02], cp = E3.proj(c3), rr = 0.3 * this.F / Math.max(1, E3.depth(c3));
        const sp = [];
        for (let i = 0; i <= 18; i++) { const a = i / 18 * 2.6 * Math.PI, rad = rr * (1 - i / 22); sp.push([cp[0] + s * rad * Math.cos(a), cp[1] + rad * Math.sin(a)]); }
        stroke(new P(sp), 1, INK, 0.55, 0.75);
      });
      // a lit edge down the shaft where the floods catch it
      if (this.L.flood > 0.05) {
        const b = E3.proj([x, y, P0 + 0.6]), t = E3.proj([x, y, P0 + 11.2]), rb = R * this.F / E3.depth([x, y, P0 + 0.6]);
        const o = -0.35 * rb;
        this.halo(new P([[b[0] + o, b[1]], [t[0] + o * 0.88, t[1]]]), Math.max(1, rb * 0.5), 0.55 * this.L.flood);
      }
    },
    stair(c) {
      const A = AT, m = MAT.stone;
      for (let i = A.STEPS - 1; i >= 0; i--) {
        const x = A.XF - 1.0 - (A.STEPS - i) * A.TREAD, z = (i + 1) * A.RISE;
        const riser = [[x, A.SW, z - A.RISE], [x, -A.SW, z - A.RISE], [x, -A.SW, z], [x, A.SW, z]];
        const top = [[x, -A.SW, z], [A.XF - 0.9, -A.SW, z], [A.XF - 0.9, A.SW, z], [x, A.SW, z]];
        this.pface(riser, m, 9990 + i, { n: [-1, 0, 0], lw: 0.6, edgeA: 0.55, hdir: [0, 1, 0] });
        this.pface(top, m, 9998 + i, { n: [0, 0, 1], lw: 0.5, edgeA: 0.45, noHatch: true });
        this.pface([[x, -A.SW, 0], [A.XF - 0.9, -A.SW, 0], [A.XF - 0.9, -A.SW, z], [x, -A.SW, z]], m, 10010 + i, { n: [0, -1, 0], lw: 0.6, edgeA: 0.55 });
      }
    },

    /* ---------- the garden: the lawn, the walks, the forecourt before the stair ---------- */
    ground(c) {
      const cy = this.CY, dusk = this.L.dusk;
      if (OPT.colour) washFade([0, cy - 2, PW, PH], [[0, hex('#5D7A4C', '#33496A', dusk * 0.7), 0.6], [1, hex('#4F7140', '#2E4462', dusk * 0.6), 0.7]], 0, 1);
      hatch(boxP(0, cy, PW, PH), this.PB, 0.03, 2.6, 1, INK, 0.5, 0.18, 10101);
      const walk = (pts, seed, a = 0.5) => {
        const q = this.poly(pts);
        if (!q) return;
        mask(q, 0.9);
        if (OPT.colour) wash(q, hex('#D8C6A2', '#7F86A6', dusk * 0.75), a);
        hatch(q, this.PB, 0.02, 3.2, 1, INK, 0.45, 0.13, seed);
        stroke(q, 1, INK, 0.5, 0.25);
      };
      walk([[-160, -3, 0], [-37.4, -3, 0], [-37.4, 3, 0], [-160, 3, 0]], 10102);
      walk([[-48, -17, 0], [-37.4, -17, 0], [-37.4, 17, 0], [-48, 17, 0]], 10103);
      walk([[-66.2, -60, 0], [-61.8, -60, 0], [-61.8, -3, 0], [-66.2, -3, 0]], 10104);
      // the floods' pools of light on the forecourt and the steps
      const fl = this.L.flood;
      if (fl > 0) FLOODS.front.forEach(f => { const p = E3.proj([f.p[0] + 3, f.p[1], 0]); this.glow(p[0], p[1], 46, '#F2B860', 0.3 * fl); });
      const segs = [];
      this.blades.forEach(([x, y, h, lx, ly, w]) => {
        const d = E3.depth([x, y, 0]);
        if (d < 0.8) return;
        const a = E3.proj([x, y, 0]), b = E3.proj([x + lx, y + ly, h]);
        segs.push([a[0], a[1], b[0], b[1], (0.18 + 0.3 * w) * clamp(1.3 - d / 70)]);
      });
      this.strokes(segs, INK, 0.7);
    },

    /* ---------- the trees: limes and planes in autumn, gone dusky, the lamps under them ---------- */
    makeTree(x, y, sz, kind, seed) {
      const q = rng(seed), K = kind === 'plane' ? { h: [17, 23], R: [5.4, 7], base: [3.2, 4.5], lit: '#D29A40', sh: '#4E4430' } : { h: [15, 20], R: [4.6, 6], base: [2.8, 4], lit: '#DDB040', sh: '#504A2A' };
      const g = a => lerp(a[0], a[1], q());
      const h = g(K.h) * sz, R = g(K.R) * sz, base = g(K.base), Rv = (h - base) / 2 * 1.08, zc = base + (h - base) / 2, lobes = [], N = 170;
      for (let j = 0; j < N; j++) {
        const zz = 1 - 2 * (j + 0.5) / N + (q() - 0.5) * 0.04, rr0 = Math.sqrt(Math.max(0, 1 - zz * zz)), ph = j * 2.39996 + (q() - 0.5) * 0.5;
        const ux = rr0 * Math.cos(ph), uy = rr0 * Math.sin(ph), k = 0.74 + 0.24 * q();
        lobes.push({ p: [x + R * k * ux, y + R * k * uy, zc + Rv * k * zz], n: nrm([ux, uy, zz + 0.25]), rr: (0.075 + 0.09 * q() * q()) * R + 0.03 * R, s: q() * 1000 | 0, deep: k, low: zz, tw: q() });
      }
      return { x, y, h, R, Rv, zc, base, lobes, lit: K.lit, sh: K.sh, trunk: 0.22 + 0.14 * q(), seed: q() * 1e6 | 0 };
    },
    drawTrees(c) {
      const L = this.L, S = LS;
      const list = this.trees.map(T => ({ T, d: E3.depth([T.x, T.y, T.zc]) })).filter(o => o.d > 4).sort((a, b) => b.d - a.d);
      const ticks = [];
      list.forEach(({ T, d }) => {
        const ppm = this.F / d, pc = E3.proj([T.x, T.y, T.zc]), rpx = T.R * ppm * 1.4;
        if (pc[0] + rpx < -10 || pc[0] - rpx > PW + 10) return;
        const sway = 0.012 * Math.sin(c * 0.9 + T.seed % 7) * T.h; // the light air from the north-east
        const tw = T.trunk * ppm, b0 = E3.proj([T.x, T.y, 0]), b1 = E3.proj([T.x, T.y, T.base + T.Rv * 0.6]);
        const trunk = new P([[b0[0] - tw, b0[1]], [b1[0] - tw * 0.55, b1[1]], [b1[0] + tw * 0.55, b1[1]], [b0[0] + tw, b0[1]]], true);
        mask(trunk);
        if (OPT.colour) wash(trunk, '#3E3A40', 0.62);
        hatch(trunk, this.bbox(trunk), Math.PI / 2, 1.8, 1, INK, 0.6, 0.5, T.seed);
        stroke(trunk, 1, INK, 0.7, 0.65);
        const dusk = L.dusk, lit = hex(T.lit, '#7A7A92', dusk * 0.48), shc = hex(T.sh, '#2E3654', dusk * 0.62);
        const cam = E3.cam(), Ls = [E3.dot(S, cam.R), -E3.dot(S, cam.U)], ll = Math.hypot(Ls[0], Ls[1]) || 1, L2 = [Ls[0] / ll, Ls[1] / ll];
        const lobes = T.lobes.map(Lb => {
          const p = [Lb.p[0] + sway * (Lb.p[2] - T.base) / T.h, Lb.p[1] - sway * 0.4 * (Lb.p[2] - T.base) / T.h, Lb.p[2]];
          const dl = E3.depth(p), cc = E3.proj(p), rr = Lb.rr * this.F / dl, m = 7 + (Lb.s % 3), pts = [];
          for (let k = 0; k < 20; k++) { const th = k / 20 * TAU, rad = rr * (0.86 + 0.14 * Math.abs(Math.sin(th * m * 0.5 + Lb.s))); pts.push([cc[0] + rad * Math.cos(th), cc[1] + rad * Math.sin(th) * 0.92]); }
          const lum = clamp((0.15 + (L.sky * 1.2 + 0.2) * Math.max(0, E3.dot(Lb.n, S)) + 0.35 * L.amb * Lb.n[2]) * (0.6 + 0.4 * clamp((Lb.deep - 0.7) / 0.22)));
          return { Lb, dl, c: cc, rr, m, path: new P(pts, true), lum };
        }).filter(o => o.rr >= 1);
        const body = lobes.map(o => o.path), cb = [pc[0] - rpx, pc[1] - rpx * 1.3, pc[0] + rpx, pc[1] + rpx * 1.3];
        mask(body);
        if (OPT.colour) wash(body, shc, 0.82);
        hatch(body, cb, -0.75, 1.7, 1, INK, 0.55, 0.34, T.seed + 1);
        hatch(body, cb, 0.55, 2.3, 1, INK, 0.5, 0.2, T.seed + 2);
        lobes.filter(o => o.lum > 0.16 + 0.12 * o.Lb.tw).sort((x, y) => y.dl - x.dl).forEach(({ Lb, c: cc, rr, m, path, lum }, li) => {
          const bx = [cc[0] - rr - 2, cc[1] - rr - 2, cc[0] + rr + 2, cc[1] + rr + 2];
          mask(path);
          if (OPT.colour) wash(path, hex(shc, lit, 0.25 + 0.6 * lum), 0.74);
          const k = 0.12 + 0.55 * (1 - lum), off = new P(Array.from({ length: 24 }, (_, j) => { const th = j / 24 * TAU; return [cc[0] + L2[0] * k * rr + rr * 0.98 * Math.cos(th), cc[1] + L2[1] * k * rr + rr * 0.98 * Math.sin(th)]; }), true);
          ctx.save(); ctx.beginPath(); path.trace(ctx, 1); off.trace(ctx, 1); ctx.clip('evenodd');
          if (OPT.colour) wash(path, shc, 0.3);
          hatch(path, bx, -0.75, 1.7 + 1.1 * lum, 1, INK, 0.5, 0.3 + 0.14 * (1 - lum), T.seed + li);
          ctx.restore();
          const a0 = Math.atan2(-L2[1], -L2[0]), arc = [];
          for (let k2 = 0; k2 <= 12; k2++) { const th = a0 - 1.35 + 2.7 * k2 / 12, rad = rr * (0.9 + 0.1 * Math.abs(Math.sin(th * m * 0.5 + Lb.s))); arc.push([cc[0] + rad * Math.cos(th), cc[1] + rad * Math.sin(th) * 0.92]); }
          stroke(new P(arc), 1, INK, 0.6, 0.22 + 0.22 * (1 - lum));
          const rg = rng(Lb.s + 7), nm = Math.round(2 + 4 * (1 - lum));
          for (let k2 = 0; k2 < nm; k2++) { const u = rg() * 2 - 1, v = rg() * 2 - 1; if (u * u + v * v > 0.85) continue; ticks.push([cc[0] + u * rr * 0.9, cc[1] + v * rr * 0.85, Math.max(1, rr * 0.11), clamp(0.25 + 0.35 * (1 - lum))]); }
        });
        lobes.forEach(o => { if (o.lum <= 0.16 + 0.12 * o.Lb.tw) stroke(o.path, 1, INK, 0.4, 0.1); });
      });
      const bands = [[], [], [], []];
      ticks.forEach(k => bands[Math.min(3, Math.floor(k[3] * 4))].push(k));
      bands.forEach((b, i) => {
        if (!b.length) return;
        ctx.save(); ctx.globalAlpha = SA * (i + 0.5) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
        ctx.beginPath(); b.forEach(([x, y, s]) => { ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x, y + s * 1.1, x + s, y); }); ctx.stroke(); ctx.restore();
      });
    },
    // the lamps: a fluted post, an arm-less lantern of four panes under a small roof
    lampPosts(c) {
      this.lamps.slice().sort((a, b) => E3.depth([b.x, b.y, 2]) - E3.depth([a.x, a.y, 2])).forEach((o, i) => {
        const d = E3.depth([o.x, o.y, 2]);
        if (d < 2) return;
        const lw = clamp(0.13 * this.F / d, 0.7, 3);
        const b = E3.proj([o.x, o.y, 0]), t = E3.proj([o.x, o.y, 3.2]);
        stroke(new P([b, t]), 1, INK, lw, 0.85);
        E3.solid(E3.box(o.x - 0.2, o.x + 0.2, o.y - 0.2, o.y + 0.2, 0, 0.6), { tone: 0.5, shade: 0.3, lw: 0.6, edgeA: 0.7, fillCol: OPT.colour ? '#2E3346' : null, fillA: 0.6 }, 10200 + i);
        const on = smooth((c - o.on) / 0.5), fl = on * (1 + 0.03 * Math.sin(c * 11 + i));
        const pane = E3.solid(E3.frustum(o.x - 0.24, o.x + 0.24, o.y - 0.24, o.y + 0.24, 3.25, 3.85, -0.06, -0.06), { tone: 0.1, shade: 0.2, lw: 0.6, edgeA: 0.8, fillCol: OPT.colour ? hex('#3B4366', '#F7D490', on) : null, fillA: 0.6, noHatch: true }, 10210 + i);
        E3.solid(E3.frustum(o.x - 0.34, o.x + 0.34, o.y - 0.34, o.y + 0.34, 3.85, 4.05, 0.28, 0.28).map(f => f.reverse()), { tone: 0.5, shade: 0.2, lw: 0.6, edgeA: 0.8, fillCol: OPT.colour ? '#2C3044' : null, fillA: 0.6 }, 10220 + i);
        const g = E3.proj([o.x, o.y, 3.55]);
        o.g = [g[0], g[1], 0.42 * this.F / d, fl];
      });
    },
    // light laid over everything: the lanterns, and the floodlit stone's warmth
    glows(c) {
      this.lamps.forEach(o => { if (!o.g) return; const [x, y, r, fl] = o.g; this.glow(x, y, r * 9, '#FFC978', 0.5 * fl); this.glow(x, y, r * 2.4, '#FFF0C8', 0.8 * fl); });
      const fl = this.L.flood;
      if (fl > 0) {
        const p = E3.proj([AT.XF, 0, 9]), q = E3.proj([0, 0, 26]);
        this.glow(p[0], p[1], 175, '#F3B45E', 0.2 * fl);
        this.glow(q[0], q[1], 150, '#E9B068', 0.1 * fl);
      }
    },
    // the figure named, as a star atlas names its figures
    label(c) {
      const p = smooth((c - CUE.label) / 0.9);
      if (p <= 0) return;
      const x = PW - 34, y = 62, b0 = BLEND;
      BLEND = 'screen';
      try {
        small('REGION VI', x, y, p, { size: 22, ls: 6, a: 0.85, align: 'right', col: '#F4DFAE', weight: 600, font: F_HEAD });
        small('50 MEMBERS', x, y + 26, p, { size: 13, ls: 4, a: 0.72, align: 'right', col: '#E7D3A6', weight: 600 });
      } finally { BLEND = b0; }
    },
  });
}
