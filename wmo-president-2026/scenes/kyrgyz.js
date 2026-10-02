'use strict';
// Kyrgyzstan · Lake Issyk-Kul from the north shore at Cholpon-Ata, looking south across the lake to the Teskey Ala-Too,
// on a clear morning: 9 September 2026, 09:30 at UTC+6 (the CIS Interstate Council's 37th session at Cholpon-Ata,
// 9-11 September, in Kyrgyzhydromet's centenary year). Kyrgyzhydromet keeps a lake observatory at Cholpon-Ata with
// research vessels (Belhydromet, 10 September 2026, citing Kyrgyzhydromet); one of them, a small white launch drawn
// generic (no name, no markings: its real lines were not to hand), puts out across the lake.
// True 3D (engrave3d.js), metres: x east, y north, z up, the lake at z 0, the eye at the origin 4.5 m above the water.
//   the eye: 42.6412 N 77.1100 E, on the low bank behind the beach east of the Cholpon-Ata cape (Sentinel-2's 10 m view
//     of 11 September 2026: a narrow sand beach, the sandy shelf turquoise for some 200 m out), the bank's top taken
//     2.9 m above the water (the terrain tiles give 3-5 m there, too coarse to say more); heading 172 deg true, a field of
//     20.0 deg (f 2756 px across the plate's 972), tilted 0.67 deg down so the horizontal falls at plate y 330.
//   the range (data/kyrgyz.js): every plate pixel's ray traced over the Earth's curvature with refraction (k 0.13) to
//     the terrain it meets (AWS Terrain Tiles z12, SRTM-derived). The far crest stands 73-82 km away, 1.4-1.9 deg above
//     the horizontal (plate y 237-263), its summits 3,930-4,560 m; the front ranges of its north slope 54-70 km; the
//     south shore's foothills lie below the water horizon (dip 0.064 deg, y 333.1) but for their tops. Lit by the
//     morning sun with cast shadows;
//     snow and ice where Sentinel-2 saw them on 11 and 13 September 2026 (the gaps under cloud filled above the
//     snowline those pixels give: half the north-facing ground snow-covered from about 4,000 m, as the glacier
//     inventory's 3,900-4,000 m for the western part of the north slope), the land's colour zones (red beds, spruce,
//     meadow, bare rock) from the same scenes.
//   the sun (NOAA's solar-position equations, after Meeus): azimuth 115.8 deg, 32.4 deg up, east-south-east, 56 deg to
//     the left of the view: the range's east-facing flanks lit, its west flanks and the steep north faces in shade, the
//     shadows falling to the west-north-west (right and toward the eye). Its glitter on the lake centres 56 deg left of
//     the view and 32 deg down, 49 deg from the frame's nearest corner: a ripple would have to tilt 47 deg to send the
//     sun into that corner, against a slope spread of some 7 deg under a 2 m/s breeze (Cox and Munk), so no glitter is
//     drawn.
//   the air (GFS 0.25 deg, 9 September 2026 00Z +3 h, 09:00 local): clear over the lake (total cloud 0), the 10 m wind
//     1.1-2.6 m/s from the east-north-east; mid-level cloud 41 per cent over the crest south of the lake. So: a light
//     easterly whose cat's paws drift from left to right across the lake (about 2 m/s, toward 247 deg), and a thin bank
//     of cloud gathering on the crest.
//   the launch: about 11 m long, 3.4 m in the beam, a wheelhouse forward of midships, a pole mast, a radome, a davit and
//     a winch on the open after deck; she heads 190 deg (out across the lake, a little west of the line of sight) at
//     2.6 m/s (5 knots) rising smoothly to 3.1 m/s. 161 m off at lt 0 (17.1 px a metre: her hull 112 px across, her
//     waterline at y 410), 206 m at lt 17 (13.4 px a metre, 75 px, y 392); her roof (3.1 m) stays under the horizontal,
//     her masthead (5.5 m) rises just over it (the eye is 4.5 m up). Heading away from the sun, she shows the eye her
//     shaded stern and starboard quarter; her roof is lit. Her wake: the Kelvin wedge (19.47 deg each side of her
//     track), its divergent crests in echelon along both arms (they move with her: the pattern is steady in her frame),
//     the transverse waves between them (2 pi U^2 / g, 4.3-6.2 m apart), and the white water of her track, which lies
//     still on the water and spreads and fades behind her; all of it trails to her left, toward the shore she came
//     from. Her hull spans x 76-462 over the beat, clear of the print that lies on the plate's right from lt 9.4
//     (x 586-931, y 372-614).
//   the shore: the bank's lip 13.5 m ahead (y about 655); dry golden steppe grass and grey-green wormwood on it, granite
//     cobbles with their shadows thrown to the west-north-west, the near water over the sandy shelf turquoise, the deep
//     lake beyond deep blue where the breeze roughens it and pale where it lies glassy and mirrors the low sky.
// Nothing in the sky but cloud: no birds or other small flying shapes.
const KY_IMG = typeof KYRGYZ !== 'undefined' ? { wash: loadImg(KYRGYZ.band.wash), snow: loadImg(KYRGYZ.band.snow) } : null;
scene({
  id: 'kyrgyz', start: 0, dur: 17,
  init() {
    if (typeof KYRGYZ === 'undefined') return;
    const K = this.K = KYRGYZ, cam = K.cam, D = Math.PI / 180, r = rng(2609);
    this.RE = 6371000 / 0.87; // the Earth's radius with refraction (k 0.13)
    this.EYE = cam.eyeH; this.f = cam.f; this.HZ = cam.hz; this.WH = cam.wh;
    const p = cam.pitch * D, h = cam.head * D;
    this.C = [0, 0, cam.eyeH];
    this.Fw = [Math.sin(h) * Math.cos(p), Math.cos(h) * Math.cos(p), Math.sin(p)];
    this.look = [this.C[0] + 100 * this.Fw[0], this.C[1] + 100 * this.Fw[1], this.C[2] + 100 * this.Fw[2]];
    this.sun = K.sun;
    E3.camera(this.C, this.look, this.f, PW / 2, PH / 2);
    const cm = E3.cam(); this.R0 = cm.R; this.U0 = cm.U;
    // the range: its silhouette (to the water horizon) and the engraver's strokes, grouped by tone
    const sk = K.sky, top = [];
    for (let i = 0; i < sk.length; i += 2) top.push([sk[i], sk[i + 1]]);
    this.skyline = top;
    this.rangeP = new P([[-2, top[0][1]]].concat(top, [[PW + 2, top[top.length - 1][1]], [PW + 2, this.WH + 0.6], [-2, this.WH + 0.6]]), true);
    this.ridges = K.ridges.map(q => { const pts = []; for (let i = 0; i < q.p.length; i += 2) pts.push([q.p[i], q.p[i + 1]]); return { pts, d: q.d, j: q.j }; });
    const bin = atob(K.strokes), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const NB = 10; this.rock = Array.from({ length: NB }, () => []); this.snowS = Array.from({ length: NB }, () => []);
    for (let i = 0; i < u8.length;) {
      const n = u8[i], a = u8[i + 1];
      let x = (u8[i + 2] | (u8[i + 3] << 8)) / 16, y = (u8[i + 4] | (u8[i + 5] << 8)) / 16 + K.band.y0;
      i += 6;
      const pts = [[x, y]];
      for (let k = 1; k < n; k++) { x += ((u8[i] << 24) >> 24) / 16; y += ((u8[i + 1] << 24) >> 24) / 16; i += 2; pts.push([x, y]); }
      (a & 128 ? this.snowS : this.rock)[Math.min(NB - 1, Math.floor((a & 127) / 127 * NB))].push(pts);
    }
    this.initLake(r);
    this.initClouds(rng(2611));
    this.initBoat();
    this.initShore(rng(2617));
  },
  // ---------- geometry helpers ----------
  // the water surface under a ray through plate pixel (x, y): its world point, with the Earth's curvature (the water
  // falls away as d^2 / 2R'), or null above the water horizon
  waterAt(x, y) {
    const cm = E3.cam(), u = (x - cm.cx) / cm.f, v = -(y - cm.cy) / cm.f;
    const d = [0, 1, 2].map(i => cm.F[i] + cm.R[i] * u + cm.U[i] * v), hl = Math.hypot(d[0], d[1]), tE = d[2] / hl;
    const disc = tE * tE - 2 * this.EYE / this.RE;
    if (tE >= 0 || disc < 0) return null;
    const s = this.RE * (-tE - Math.sqrt(disc));
    return [this.C[0] + d[0] / hl * s, this.C[1] + d[1] / hl * s, -s * s / (2 * this.RE)];
  },
  // a point on the water at world x, y (z lowered for the curvature)
  W(x, y) { return [x, y, -(x * x + y * y) / (2 * this.RE)]; },
  // ---------- the lake: fixed marks on the water, laid out once (rows closing up toward the horizon) ----------
  initLake(r) {
    this.marks = [];
    for (let y = this.WH + 0.7; y < PH + 30;) {
      const f = clamp((y - this.WH) / 330), gap = 0.9 + 6.2 * Math.pow(f, 1.05);
      for (let x = -20 + r() * 12; x < PW + 20;) {
        const len = 3 + r() * (5 + 26 * f), g = 2 + r() * (5 + 9 * f), xm = x + len / 2;
        const p = this.waterAt(xm, y);
        if (p) {
          const dist = Math.hypot(p[0], p[1]);
          this.marks.push({ x: p[0], y: p[1], h: len / 2 * dist / this.f, ph: r(), rk: r(), dist });
        }
        x += len + g;
      }
      y += gap * (0.75 + 0.5 * r());
    }
    // the cat's paws: gusts of the easterly roughening the water in patches that drift downwind (toward 247 deg at
    // 2 m/s), each forming and fading over half a minute or more (so none appears or goes in a frame)
    const wd = 247 * Math.PI / 180; this.WIND = [Math.sin(wd) * 2.0, Math.cos(wd) * 2.0];
    this.paws = [];
    const along = [this.WIND[0] / 2, this.WIND[1] / 2], across = [-along[1], along[0]];
    for (let k = 0; k < 30; k++) {
      // spread over the water in the frame, 80 m to 2 km off, set upwind of where they will drift. Through this lens a
      // paw within a few hundred metres is wider than the frame (the frame is 53 m across at 150 m), so the nearer
      // paws read as darker bands across the lake and the far ones as streaks
      const dist = 80 * Math.pow(25, Math.pow(r(), 1.1)), bear = (172 + (r() - 0.5) * 26 - 3) * Math.PI / 180;
      const L = 20 + r() * 70, Wd = 6 + r() * 28 * Math.sqrt(dist / 300);
      this.paws.push({ x0: Math.sin(bear) * dist, y0: Math.cos(bear) * dist, L, Wd, t0: -45 + r() * 55, life: 35 + r() * 40, a: 0.5 + 0.5 * r(), along, across, seed: k });
    }
  },
  // how much a cat's paw roughens the water at world (x, y) at time lt (0 calm .. 1)
  paw(x, y, lt) {
    let s = 0;
    for (const c of this.paws) {
      const age = lt - c.t0, k = Math.sin(Math.PI * clamp(age / c.life));
      if (k <= 0) continue;
      const cx = c.x0 + this.WIND[0] * lt, cy = c.y0 + this.WIND[1] * lt, dx = x - cx, dy = y - cy;
      const u = (dx * c.along[0] + dy * c.along[1]) / c.L, v = (dx * c.across[0] + dy * c.across[1]) / c.Wd;
      const q = u * u + v * v;
      if (q < 1.3) s += c.a * k * k * clamp((1.15 - q) / 0.45);
    }
    return Math.min(1, s);
  },
  drawLake(lt) {
    const WH = this.WH, colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9));
    if (colr) {
      // glassy water mirrors the sky low over the far shore (pale), the rippled water the deeper sky overhead and the
      // lake's own deep blue; the shelf near the shore turquoise over sand
      washFade([0, WH - 0.5, PW, PH], [[0, '#BCD2EC', 0.5], [0.025, '#86AEE2', 0.54], [0.12, '#4C80D2', 0.62], [0.3, '#3168C4', 0.68], [0.55, '#2A5DBA', 0.7], [0.7, '#2A6CAE', 0.68], [0.8, '#2B86AE', 0.64], [0.9, '#2C9DAE', 0.62], [1, '#3AAEB0', 0.6]], 0, q);
      // the cat's paws a shade darker (the ripples mirror the deeper sky overhead, not the pale horizon), on the water only
      ctx.save(); ctx.beginPath(); ctx.rect(0, WH + 0.3, PW, PH - WH); ctx.clip();
      this.paws.forEach(c => {
        const age = lt - c.t0, k = Math.sin(Math.PI * clamp(age / c.life));
        if (k <= 0.02) return;
        const cx = c.x0 + this.WIND[0] * lt, cy = c.y0 + this.WIND[1] * lt;
        const o = E3.proj(this.W(cx, cy)), pa = E3.proj(this.W(cx + c.along[0] * c.L, cy + c.along[1] * c.L)), pb = E3.proj(this.W(cx + c.across[0] * c.Wd, cy + c.across[1] * c.Wd));
        if (o[1] < WH || o[0] < -600 || o[0] > PW + 600 || E3.depth(this.W(cx, cy)) < 30) return;
        const ra = Math.min(1500, Math.hypot(pa[0] - o[0], pa[1] - o[1])), rb = Math.min(400, Math.hypot(pb[0] - o[0], pb[1] - o[1])), rot = Math.atan2(pa[1] - o[1], pa[0] - o[0]);
        ctx.save(); ctx.translate(o[0], o[1]); ctx.rotate(rot); ctx.scale(1, Math.max(0.02, rb / Math.max(1, ra)));
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ra);
        g.addColorStop(0, `rgba(24,56,150,${0.38 * c.a * k * k})`); g.addColorStop(0.62, `rgba(24,56,150,${0.32 * c.a * k * k})`); g.addColorStop(0.85, `rgba(24,56,150,${0.12 * c.a * k * k})`); g.addColorStop(1, 'rgba(24,56,150,0)');
        ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, ra, 0, TAU); ctx.fill(); ctx.restore();
      });
      ctx.restore();
    }
    // the marks: short strokes lying on the water across the line of sight, darker and closer in the cat's paws, open
    // on the glassy water between; a long low swell from the east (40 m, 5 s) breathing through them
    const NB = 12, bands = Array.from({ length: NB }, () => []), R0 = this.R0;
    const kx = TAU / 40, dir = [Math.sin(250 * Math.PI / 180), Math.cos(250 * Math.PI / 180)], om = TAU / 5.1;
    const kx2 = TAU / 13, dir2 = [Math.sin(225 * Math.PI / 180), Math.cos(225 * Math.PI / 180)], om2 = TAU / 2.9;
    this.marks.forEach(m => {
      const pw = this.paw(m.x, m.y, lt);
      // more of the marks show inside a paw (each mark has its own rank, so one fades in or out smoothly)
      const show = clamp((0.34 + 0.66 * pw - m.rk) / 0.12);
      if (show <= 0.01) return;
      const sw = 0.5 + 0.5 * Math.cos(kx * (dir[0] * m.x + dir[1] * m.y) - om * lt + m.ph * 1.1), sw2 = 0.5 + 0.5 * Math.cos(kx2 * (dir2[0] * m.x + dir2[1] * m.y) - om2 * lt + m.ph * 2.3);
      const near = clamp(1 - m.dist / 900), air = 0.35 + 0.65 * Math.exp(-m.dist / 1600);
      const al = q * show * air * (0.2 + 0.22 * near + 0.75 * pw) * (0.55 + 0.45 * Math.pow(sw, 1.4)) * (0.8 + 0.2 * sw2) * (0.7 + 0.5 * m.ph);
      if (al < 0.02) return;
      const a0 = this.W(m.x - R0[0] * m.h, m.y - R0[1] * m.h), b0 = this.W(m.x + R0[0] * m.h, m.y + R0[1] * m.h);
      const s = E3.clipSeg(a0, b0);
      if (s) bands[Math.min(NB - 1, Math.floor(al * NB))].push(s);
    });
    this.segBands(bands, colr ? '#1B4A7A' : BLUE, 0.9, NB);
    // the water horizon: a fine ruled line where the lake meets the foot of the range
    stroke(new P([[0, WH], [PW, WH]]), q, INK, 0.7, 0.35);
  },
  // many short screen segments in one stroke per alpha step
  segBands(bands, col, lw, NB, k = 1) {
    bands.forEach((g, b) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * k * (b + 0.5) / NB; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); g.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  },
  // ---------- the sky ----------
  drawSky(lt) {
    const WH = this.WH, colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9));
    if (colr) {
      // a clear mountain sky: deep overhead, paling to the horizon
      washFade([0, -40, PW, WH + 1], [[0, '#2F6FD0', 0.72], [0.3, '#4A8BE0', 0.66], [0.62, '#6FA6EA', 0.5], [0.86, '#A6C8F0', 0.34], [1, '#D6E4F2', 0.22]], 0, q);
      // paler toward the sun, off the frame's left
      washGrad([0, -40, PW, WH + 1], [0, 0], [PW, 0], [[0, '#FFFFFF', 0.0], [0.5, '#4A8BE0', 0.0], [1, '#2F6FD0', 0.14]], q);
    }
    // the engraver's ruling: close overhead, opening toward the horizon
    let y = 1.2, k = 0;
    while (y < WH - 6) {
      const u = y / WH;
      stroke(pl([[0, y], [PW, y]], false, 3300 + k, 0.3), q, colr ? HUE.deep : BLUE, 0.7, (colr ? 0.15 : 0.3) * (1 - 0.85 * u) * (0.75 + 0.25 * Math.sin(k * 1.7)));
      y += 2.4 + 5.2 * u * u; k++;
    }
  },
  // ---------- the cloud bank gathering on the crest ----------
  initClouds(r) {
    // a low bank along the crest: its base taken at about 4,400 m, just over the summits (plate y 250 at the crest's
    // 78 km; GFS gives mid-level cloud over the crest that morning, but not its base height), heaped tops a few hundred
    // metres over it; the peaks stand in front of it. Each puff has its own start and swells over about nine
    // seconds, and a few turrets rise later, so the bank gathers slowly through the beat (a puff grows from nothing,
    // never appears whole)
    this.CB = 250.5;
    this.cells = [];
    [[105, 270, 0.75], [360, 585, 1.0], [800, 955, 0.85]].forEach(([xa, xb, big], i) => {
      const puffs = [], n = Math.round((xb - xa) / 13);
      for (let k = 0; k < n; k++) {
        const u = (k + 0.3 + 0.4 * r()) / n, env = Math.pow(Math.sin(Math.PI * u), 0.7), x = lerp(xa, xb, u);
        const rad = (4 + 11 * env * (0.5 + 0.5 * r())) * big;
        puffs.push({ x, rad, lift: rad * (0.1 + 0.6 * r()) * env, t0: -7 + r() * 6, g: 1 });
      }
      for (let k = 0; k < 4; k++) { const x = lerp(xa, xb, 0.2 + 0.6 * r()); puffs.push({ x, rad: (6 + 5 * r()) * big, lift: (10 + 10 * r()) * big, t0: 0.5 + k * 2.6 + r() * 1.5, g: 1, late: true }); }
      // the cauliflower: smaller swellings on the upper rim of the larger puffs, each a little after its parent
      const n0 = puffs.length;
      for (let pi = 0; pi < n0; pi++) {
        const p = puffs[pi]; if (p.rad < 6) continue;
        const nk = 2 + Math.floor(r() * 3);
        for (let j = 0; j < nk; j++) puffs.push({ parent: pi, a: -Math.PI * (0.12 + 0.76 * (j + 0.2 + 0.6 * r()) / nk), k: 0.3 + 0.2 * r(), t0: p.t0 + 0.8 + r() * 3, kid: true });
      }
      this.cells.push({ xa, xb, puffs, seed: 4100 + i * 31 });
    });
  },
  drawClouds(lt) {
    const colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9)), base = this.CB;
    this.cells.forEach(c => {
      const circ = [], at = [];
      c.puffs.forEach((p, i) => {
        const u = easeInOut(prog(lt, p.t0, 9));
        if (p.kid) {
          const P0 = at[p.parent]; if (!P0) return;
          const R = P0[2] * p.k * u; if (R <= 0.3) return;
          circ.push([P0[0] + Math.cos(p.a) * P0[2] * 0.82, P0[1] + Math.sin(p.a) * P0[2] * 0.82, R]); return;
        }
        const sc = p.late ? u : lerp(0.5, 1, u);
        if (sc <= 0.02) return;
        const R = p.rad * sc; at[i] = [p.x, base - R * 0.5 - p.lift * sc, R]; circ.push(at[i]);
      });
      if (!circ.length) return;
      const x0 = Math.min(...circ.map(k => k[0] - k[2])) - 3, x1 = Math.max(...circ.map(k => k[0] + k[2])) + 3, ytop = Math.min(...circ.map(k => k[1] - k[2])) - 2;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, ytop - 3, x1 - x0, base - ytop + 3); ctx.clip();
      const shape = () => { ctx.beginPath(); circ.forEach(([x, y, R]) => { ctx.moveTo(x + R, y); ctx.arc(x, y, R, 0, TAU); }); };
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA * q; ctx.fillStyle = PAPER_PAT; shape(); ctx.fill('nonzero'); ctx.restore();
      ctx.save(); shape(); ctx.clip('nonzero');
      if (colr) {
        // white where the sun (high on the left) lights the tops, a cool shade toward the flat base
        ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'screen';
        const g = ctx.createLinearGradient(0, ytop, 0, base);
        g.addColorStop(0, 'rgba(255,255,255,0.92)'); g.addColorStop(0.5, 'rgba(255,255,255,0.72)'); g.addColorStop(1, 'rgba(255,255,255,0.35)');
        ctx.fillStyle = g; ctx.fillRect(x0, ytop - 3, x1 - x0, base - ytop + 6);
        ctx.globalCompositeOperation = 'multiply';
        const b = ctx.createLinearGradient(0, ytop, 0, base);
        b.addColorStop(0, 'rgba(160,184,214,0)'); b.addColorStop(0.55, 'rgba(160,184,214,0.12)'); b.addColorStop(1, 'rgba(132,158,196,0.4)');
        ctx.fillStyle = b; ctx.fillRect(x0, ytop - 3, x1 - x0, base - ytop + 6);
        const h = ctx.createLinearGradient(x0, 0, x1, 0);
        h.addColorStop(0, 'rgba(160,184,214,0)'); h.addColorStop(1, 'rgba(150,172,206,0.18)');
        ctx.fillStyle = h; ctx.fillRect(x0, ytop - 3, x1 - x0, base - ytop + 6);
      }
      // fine ruling in the shade under the heaped tops, on each puff's lower right, closing toward the base
      ctx.globalAlpha = SA * q * (colr ? 0.28 : 0.42); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = colr ? '#4E6A92' : INK; ctx.lineWidth = 0.45;
      ctx.beginPath();
      for (let y = base - 0.8; y > ytop; y -= 1.5 + (base - y) * 0.12) {
        circ.forEach(([x, yc, R]) => {
          const dy = y - yc; if (Math.abs(dy) >= R) return;
          const hw = Math.sqrt(R * R - dy * dy), sh = clamp(dy / R * 1.1 + 0.15);
          if (sh <= 0.05) return;
          const xa = x + hw * (1 - 2 * sh), inside = circ.some(([x2, y2, R2]) => x2 !== x && Math.hypot(x + hw - x2, y - y2) < R2 - 0.5);
          ctx.moveTo(xa, y); ctx.lineTo(inside ? x + hw * 0.6 : x + hw, y);
        });
      }
      ctx.stroke(); ctx.restore();
      // the outline: only the outer arcs of the heaped tops
      ctx.save(); ctx.globalAlpha = SA * q * 0.3; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = colr ? '#3C4E6A' : INK; ctx.lineWidth = 0.5; ctx.lineCap = 'round';
      ctx.beginPath();
      circ.forEach(([x, y, R], i) => {
        let pen = false;
        for (let k = 0; k <= 36; k++) {
          const a = Math.PI + k / 36 * Math.PI, px = x + R * Math.cos(a), py = y + R * Math.sin(a);
          const out = py < base - 0.5 && !circ.some(([x2, y2, R2], j) => j !== i && Math.hypot(px - x2, py - y2) < R2 - 0.25);
          if (out) { if (pen) ctx.lineTo(px, py); else ctx.moveTo(px, py); pen = true; } else pen = false;
        }
      });
      ctx.stroke(); ctx.restore();
      ctx.restore();
    });
  },
  // ---------- the range ----------
  drawRange(lt) {
    const K = this.K, B = K.band, colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9));
    mask(this.rangeP, q);
    if (colr && KY_IMG.wash.ok) {
      ctx.save(); ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(KY_IMG.wash.img, 0, B.y0, B.w, B.h); ctx.restore();
    }
    if (KY_IMG.snow.ok) {
      // sunlit snow and ice: brighter than the paper
      ctx.save(); ctx.globalAlpha = SA * q * (colr ? 0.9 : 0.7); ctx.globalCompositeOperation = 'screen'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(KY_IMG.snow.img, 0, B.y0, B.w, B.h); ctx.restore();
    }
    // the engraver's lines down the slopes turned from the sun; on snow in shade, fine and blue
    const NB = this.rock.length, draw = (bands, col, lw, k) => bands.forEach((g, b) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * q * k * (b + 0.5) / NB; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); g.forEach(p => { ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); }); ctx.stroke(); ctx.restore();
    });
    draw(this.rock, colr ? '#3A2E3A' : INK, 0.55, colr ? 0.62 : 0.8);
    draw(this.snowS, colr ? '#3E5F96' : BLUE, 0.5, colr ? 0.55 : 0.7);
    // the nearer ridges' crests, then the skyline
    this.ridges.forEach(g => stroke(new P(g.pts), q, colr ? '#2E2630' : INK, 0.45 + 0.35 * clamp((70 - g.d) / 15), 0.18 + 0.3 * clamp((70 - g.d) / 15) * clamp((g.j - 1) / 0.25 + 0.4)));
    stroke(new P(this.skyline), q, colr ? '#2A2430' : INK, 0.75, 0.55);
  },
  // ---------- the launch ----------
  initBoat() {
    // hull stations from the transom (u -5.5) to the stem (u 5.6): [u, half-breadth at the deck edge, at the waterline,
    // the deck edge's height over the water]: a semi-displacement launch, her sheer rising to a flared bow
    this.ST = [[-5.5, 1.45, 1.3, 1.0], [-4.0, 1.65, 1.5, 1.0], [-2.0, 1.72, 1.56, 1.02], [0.0, 1.72, 1.52, 1.06], [2.0, 1.6, 1.3, 1.14], [3.4, 1.34, 0.92, 1.25], [4.4, 0.98, 0.45, 1.36], [5.1, 0.55, 0.08, 1.46], [5.6, 0.0, 0.0, 1.55]];
    // her course: heading 190 deg (out across the lake, a little west of the line of sight, so the eye sees her stern
    // quarter and her wake opens toward the shore on her left); 161 m off at lt 0, 7 deg left of the view's axis; 2.6 m/s
    // rising smoothly to 3.1 m/s; she has held this course for minutes, so her wake is fully formed
    this.HEAD = 190 * Math.PI / 180;
    this.DIR = [Math.sin(this.HEAD), Math.cos(this.HEAD)];
    const b0 = (172 - 6.95) * Math.PI / 180, d0 = 161.2;
    this.P0 = [Math.sin(b0) * d0, Math.cos(b0) * d0];
    this.V0 = 2.6; this.V1 = 3.1;
  },
  // how far she has run along her track at time lt (from lt 0; negative before), and her speed then
  run(lt) { const T = 17, u = clamp(lt / T); return this.V0 * lt + (lt > 0 ? (this.V1 - this.V0) * T * (u * u * u - u * u * u * u / 2) : 0); },
  speed(lt) { const u = clamp(lt / 17); return this.V0 + (this.V1 - this.V0) * (3 * u * u - 2 * u * u * u); },
  boatAt(lt) { const s = this.run(lt); return [this.P0[0] + this.DIR[0] * s, this.P0[1] + this.DIR[1] * s]; },
  // a point of the launch (u forward, v to port, w up) into the world, with her slow pitch and heave in the swell
  bp(o, u, v, w, lt) {
    const c = this.DIR, pv = [-c[1], c[0]];
    const pitch = 0.008 * Math.sin(lt * TAU / 5.1 + 0.4), roll = 0.01 * Math.sin(lt * TAU / 4.3), heave = 0.04 * Math.sin(lt * TAU / 5.1 + 1.2);
    const ww = w + heave + u * pitch + v * roll;
    return [o[0] + c[0] * u + pv[0] * v, o[1] + c[1] * u + pv[1] * v, ww];
  },
  // a face of her white paintwork: paper, then white where the sun is on it and a cool grey in the shade (laid over the
  // warm paper, so the paint reads white, not cream), ruled lightly along `hd` (a world direction) in the shade; an edge
  // line when `edge` is given
  paint(f, n, hd, seed, edge = 0) {
    const r = E3.face(f, { n, noHatch: true, edges: false }, seed);
    if (!r) return null;
    const lit = Math.max(0, E3.dot(n, E3.sun())), sp = r.sp, colr = OPT.colour;
    const bb = [Math.min(...sp.map(p => p[0])), Math.min(...sp.map(p => p[1])), Math.max(...sp.map(p => p[0])), Math.max(...sp.map(p => p[1]))];
    const u = clamp(lit / 0.45);
    ctx.save(); ctx.globalAlpha = SA * (colr ? 0.8 : 0.55); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = colr ? `rgb(${Math.round(lerp(206, 251, u))},${Math.round(lerp(212, 249, u))},${Math.round(lerp(226, 243, u))})` : `rgb(${Math.round(lerp(214, 246, u))},${Math.round(lerp(208, 240, u))},${Math.round(lerp(198, 228, u))})`;
    ctx.beginPath(); r.path.trace(ctx, 1); ctx.fill(); ctx.restore();
    if (u < 0.6 && (bb[2] - bb[0]) * (bb[3] - bb[1]) > 4) {
      const t = Math.abs(n[2]) < 0.9 ? [n[1], -n[0], 0] : hd; // a horizontal line in the face (along her, on a side)
      const c0 = E3.centroid(f), a = E3.proj(c0), b = E3.proj([c0[0] + t[0] * 0.5, c0[1] + t[1] * 0.5, c0[2] + t[2] * 0.5]);
      hatch(r.path, bb, Math.atan2(b[1] - a[1], b[0] - a[0]), 1.9 + 1.5 * u, 1, colr ? '#3A4A66' : INK, 0.5, 0.22 * (1 - u) + 0.06, seed);
    }
    if (edge) stroke(r.path, 1, INK, 0.7, 0.75 * edge);
    return r;
  },
  // a face's normal, turned to the side of `side`
  outward(f, side) {
    const a = f[0], b = f[1], d = f[f.length - 1], u = E3.sub(b, a), v = E3.sub(d, a);
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1; n = n.map(x => x / l);
    return E3.dot(n, side) < 0 ? n.map(x => -x) : n;
  },
  drawBoat(lt) {
    const o = this.boatAt(lt), colr = OPT.colour, ST = this.ST, B = (u, v, w) => this.bp(o, u, v, w, lt), c = this.DIR, pv = [-c[1], c[0]];
    const white = colr ? '#FBF8F1' : null;
    const st = (tone, extra = {}) => Object.assign({ tone, shade: 0.34, lw: 0.85, edgeA: 0.85, fillCol: white, fillA: 0.4, hdir: [0, 0, 1] }, extra);
    // the hull's sides, panel by panel from the waterline to the deck edge; the transom; a dark boot-top at the water
    for (let i = 0; i < ST.length - 1; i++) {
      const a = ST[i], b = ST[i + 1];
      [1, -1].forEach(sg => {
        const f = [B(a[0], sg * a[2], 0), B(b[0], sg * b[2], 0), B(b[0], sg * b[1], b[3]), B(a[0], sg * a[1], a[3])];
        const n = this.outward(f, [sg * pv[0], sg * pv[1], 0]);
        if (this.paint(f, n, [c[0], c[1], 0], 6100 + i)) {
          const bt = 0.13;
          E3.face([B(a[0], sg * a[2], 0), B(b[0], sg * b[2], 0), B(b[0], sg * lerp(b[2], b[1], bt), b[3] * bt), B(a[0], sg * lerp(a[2], a[1], bt), a[3] * bt)], { n, tone: 0.55, shade: 0.25, lw: 0.5, edgeA: 0.0, fillCol: colr ? '#26344E' : INK, fillA: colr ? 0.6 : 0.45, noHatch: true }, 6101);
        }
      });
    }
    const t0 = ST[0];
    const aft = [-c[0], -c[1], 0];
    this.paint([B(t0[0], t0[2], 0), B(t0[0], t0[1], t0[3]), B(t0[0], -t0[1], t0[3]), B(t0[0], -t0[2], 0)], aft, [pv[0], pv[1], 0], 6109);
    E3.face([B(t0[0] - 0.005, t0[2], 0), B(t0[0] - 0.005, t0[2], 0.13), B(t0[0] - 0.005, -t0[2], 0.13), B(t0[0] - 0.005, -t0[2], 0)], { n: aft, tone: 0.55, shade: 0.25, edgeA: 0, fillCol: colr ? '#26344E' : INK, fillA: colr ? 0.6 : 0.45, noHatch: true }, 6108);
    // the sheer line and the rubbing strake: the hull's outline as the eye reads it
    [1, -1].forEach(sg => {
      E3.line(ST.map(s2 => B(s2[0], sg * s2[1], s2[3])), INK, 0.9, 0.85);
      E3.line(ST.slice(0, -1).map(s2 => B(s2[0], sg * (s2[1] + 0.02), s2[3] - 0.22)), INK, 0.6, 0.55);
    });
    E3.line([B(t0[0], t0[1], t0[3]), B(t0[0], -t0[1], t0[3])], INK, 0.9, 0.85);
    E3.line([B(t0[0], t0[1], t0[3]), B(t0[0], t0[2], 0)], INK, 0.8, 0.75); E3.line([B(t0[0], -t0[1], t0[3]), B(t0[0], -t0[2], 0)], INK, 0.8, 0.75);
    // the deck, seen at a grazing angle
    const deck = []; ST.forEach(s2 => deck.push(B(s2[0], s2[1], s2[3]))); ST.slice().reverse().forEach(s2 => { if (s2[1] > 0) deck.push(B(s2[0], -s2[1], s2[3])); });
    E3.face(deck, { n: [0, 0, 1], tone: 0.0, shade: 0.2, lw: 0.6, edgeA: 0.0, fillCol: colr ? '#EFE6D2' : null, fillA: 0.45, noHatch: true }, 6110);
    // the wheelhouse forward of midships, its raked front, the roof's overhang; a dark band of windows all round
    const z0 = 1.06, z1 = 3.0, hw = 1.15;
    const ring = [[-1.0, -hw], [2.0, -hw], [2.4, -hw * 0.8], [2.4, hw * 0.8], [2.0, hw], [-1.0, hw]];
    const prism = (rg, zA, zB, rake = 0) => { const fs = []; for (let i = 0; i < rg.length; i++) { const a = rg[i], b = rg[(i + 1) % rg.length]; fs.push([B(a[0], a[1], zA), B(b[0], b[1], zA), B(b[0] - (b[0] > 2.1 ? rake : 0), b[1], zB), B(a[0] - (a[0] > 2.1 ? rake : 0), a[1], zB)]); } fs.push(rg.map(p => B(p[0] - (p[0] > 2.1 ? rake : 0), p[1], zB))); return fs; };
    { const fs = prism(ring, z0, z1, 0.35), ctr = B(0.7, 0, (z0 + z1) / 2);
      fs.forEach((f, i) => { const n = this.outward(f, E3.sub(E3.centroid(f), ctr)); this.paint(f, n, Math.abs(n[2]) > 0.9 ? [c[0], c[1], 0] : [0, 0, 1], 6120 + i, 0.9); }); }
    const win = (pa, pb, zA, zB, seed) => E3.face([B(pa[0], pa[1], zA), B(pb[0], pb[1], zA), B(pb[0], pb[1], zB), B(pa[0], pa[1], zB)], { tone: 0.75, shade: 0.1, lw: 0.45, edgeA: 0.5, fillCol: colr ? '#1F2A40' : INK, fillA: colr ? 0.78 : 0.6, noHatch: true }, seed);
    const off = 0.015, zw0 = 2.15, zw1 = 2.76;
    [[-0.75, 0.45], [0.65, 1.85]].forEach(([u0, u1], k) => { win([u0, -hw - off], [u1, -hw - off], zw0, zw1, 6130 + k); win([u1, hw + off], [u0, hw + off], zw0, zw1, 6135 + k); });
    win([-1.0 - off, hw - 0.2], [-1.0 - off, 0.42], zw0, zw1, 6140); win([-1.0 - off, -0.42], [-1.0 - off, -hw + 0.2], zw0, zw1, 6141);
    // the door aft (a little darker than the house), its window
    E3.face([B(-1.0 - off, 0.36, z0 + 0.05), B(-1.0 - off, -0.36, z0 + 0.05), B(-1.0 - off, -0.36, 2.82), B(-1.0 - off, 0.36, 2.82)], { tone: 0.18, shade: 0.3, lw: 0.55, edgeA: 0.7, fillCol: colr ? '#C9C3B6' : null, fillA: 0.45, noHatch: true }, 6142);
    win([-1.0 - 2 * off, 0.24], [-1.0 - 2 * off, -0.24], 2.2, 2.68, 6143);
    E3.solid(prism([[-1.2, -hw - 0.1], [2.15, -hw - 0.1], [2.15, hw + 0.1], [-1.2, hw + 0.1]], z1, z1 + 0.09), st(0.0, { noHatch: true, lw: 0.75 }), 6150);
    // the sun on her roof: a touch of white
    if (colr) {
      const roof = [B(-1.2, -hw - 0.1, z1 + 0.09), B(2.15, -hw - 0.1, z1 + 0.09), B(2.15, hw + 0.1, z1 + 0.09), B(-1.2, hw + 0.1, z1 + 0.09)].map(E3.proj);
      ctx.save(); ctx.globalAlpha = SA * 0.6; ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); new P(roof, true).trace(ctx, 1); ctx.fill(); ctx.restore();
    }
    // a short pole mast with its masthead light, a whip aerial raked aft, and on the roof a radome (no yard: a cross
    // on the skyline reads as a symbol)
    E3.line([B(0.6, 0, z1 + 0.09), B(0.6, 0, 5.3)], INK, 1.1, 0.85);
    E3.solid(R11.cylinder([0, 0], 0.07, 0, 0.16, 8).map(f => f.map(p => B(0.6 + p[0], p[1], 5.3 + p[2]))), st(0.1, { noHatch: true, lw: 0.6 }), 6154);
    E3.line([B(-0.8, 0.75, z1 + 0.09), B(-1.25, 0.75, 4.6)], INK, 0.5, 0.55);
    E3.solid(R11.cylinder([0, 0], 0.34, 0, 0.26, 12).map(f => f.map(p => B(1.45 + p[0], p[1], z1 + 0.09 + p[2]))), st(0.02, { noHatch: true, lw: 0.6 }), 6155);
    // the after deck: a davit on the starboard quarter for the instruments, a winch drum at its foot; the rails
    E3.line([B(-4.4, -1.35, 1.0), B(-4.4, -1.35, 2.55), B(-5.25, -1.95, 2.45)], INK, 1.0, 0.85);
    E3.line([B(-5.25, -1.95, 2.45), B(-5.25, -1.95, 1.75)], INK, 0.45, 0.6);
    E3.solid(E3.box(-3.9, -3.3, -0.5, 0.5, 1.0, 1.45).map(f => f.map(p => B(p[0], p[1], p[2]))), st(0.2, { lw: 0.6 }), 6160);
    [1, -1].forEach(sg => {
      const us = [-5.45, -4.4, -3.2, -2.0, -1.1];
      E3.line(us.map(u => B(u, sg * (u < -5 ? 1.43 : 1.62), 1.88)), INK, 0.6, 0.75);
      us.forEach(u => E3.line([B(u, sg * (u < -5 ? 1.43 : 1.62), 1.0), B(u, sg * (u < -5 ? 1.43 : 1.62), 1.88)], INK, 0.45, 0.6));
    });
    E3.line([B(-5.45, 1.43, 1.88), B(-5.45, -1.43, 1.88)], INK, 0.6, 0.75);
    E3.line([B(3.2, 1.3, 2.0), B(4.4, 0.95, 2.15), B(5.3, 0.25, 2.3), B(5.3, -0.25, 2.3), B(4.4, -0.95, 2.15), B(3.2, -1.3, 2.0)], INK, 0.5, 0.6);
  },
  // her mirror image, broken by the ripples: her white a pale shimmer of broken dashes under her
  drawBoatReflection(lt) {
    const o = this.boatAt(lt), ST = this.ST, B = (u, v, w) => this.bp(o, u, v, -w, lt);
    const pts = []; ST.forEach(s2 => { [1, -1].forEach(sg => { pts.push(E3.proj(B(s2[0], sg * s2[1], s2[3]))); pts.push(E3.proj(B(s2[0], sg * s2[2], 0))); }); });
    [[-1.0, 1.15], [2.4, 0.9], [-1.0, -1.15], [2.4, -0.9]].forEach(([u, v]) => pts.push(E3.proj(B(u, v, 3.0))));
    const ys = pts.map(p => p[1]), xs = pts.map(p => p[0]), y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
    const hull = this.hull2(pts);
    ctx.save(); ctx.beginPath(); new P(hull, true).trace(ctx, 1); ctx.clip();
    PAPER_PAT.setTransform(ctx.getTransform().inverse());
    ctx.strokeStyle = PAPER_PAT; ctx.lineCap = 'butt';
    for (let n = 0, y = y0 + 0.6; y < y1; y += 1.15, n++) {
      const k = (y - y0) / Math.max(1, y1 - y0), sway = 1.4 * Math.sin(n * 0.92 + lt * TAU / 2.6);
      ctx.lineWidth = 0.95;
      for (let x = x0 - 3, m = 0; x < x1; m++) {
        const h0 = this.hash(n * 13.1 + m * 0.37), L = 1.5 + 6 * this.hash(n * 3.1 + m * 1.7), g = 0.8 + 3.2 * this.hash(n * 0.7 + m * 2.9);
        const vis = clamp((0.7 - 0.45 * k - h0) / 0.12);
        if (vis > 0.02) { ctx.globalAlpha = SA * vis * (0.62 - 0.45 * k); ctx.beginPath(); ctx.moveTo(x + sway, y); ctx.lineTo(x + sway + L, y); ctx.stroke(); }
        x += L + g;
      }
    }
    ctx.restore();
  },
  hash(x) { const s2 = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s2 - Math.floor(s2); },
  hull2(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  },
  // ---------- her wake ----------
  // the Kelvin wedge (19.47 deg each side of her track) behind her stern: its divergent crests along both arms, the
  // transverse waves between them, a wavelength 2 pi U^2 / g apart, and the white water of her track; the arms run
  // back as far as the waves she made a minute ago, fading as they spread
  drawWake(lt) {
    const colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9)), c = this.DIR, pv = [-c[1], c[0]];
    const o = this.boatAt(lt), stern = [o[0] - c[0] * 5.5, o[1] - c[1] * 5.5], U = this.speed(lt);
    const back = [-c[0], -c[1]], ka = 19.47 * Math.PI / 180, lam = TAU * U * U / 9.81;
    const arm = sg => [back[0] * Math.cos(ka) - sg * back[1] * Math.sin(ka), back[1] * Math.cos(ka) + sg * back[0] * Math.sin(ka)];
    const dark = [], light = [];
    const seg = (a, b, al, out, lw = 1) => { if (al <= 0.02) return; const s2 = E3.clipSeg(this.W(a[0], a[1]), this.W(b[0], b[1])); if (s2) out.push([s2, al, lw]); };
    // the white water: a band behind the stern, her beam wide at first, spreading and breaking up as it ages; it lies
    // still on the water (laid out along her track by where she was, not by where she is)
    const sNow = this.run(lt) - 5.5;
    for (let k = Math.floor((sNow - 80) / 1.3); k * 1.3 <= sNow - 0.2; k++) {
      const d0 = sNow - k * 1.3, age = d0 / U, w = 1.3 + 0.4 * Math.sqrt(age) + 0.05 * age, al = Math.exp(-age / 9);
      if (d0 < 0.2) continue;
      const p = [stern[0] + back[0] * d0, stern[1] + back[1] * d0];
      for (let j = -3; j <= 3; j++) {
        const h = this.hash(k * 7.3 + j * 1.7), v = (j / 3) * w * (0.7 + 0.3 * h), L = 0.6 + 1.2 * this.hash(k * 3.1 + j);
        const vis = clamp((h - (0.2 + 0.7 * (1 - al))) / 0.15);
        if (vis > 0) seg([p[0] + pv[0] * v, p[1] + pv[1] * v], [p[0] + pv[0] * (v + 0.25) + back[0] * L, p[1] + pv[1] * (v + 0.25) + back[1] * L], vis * al * (0.85 - 0.3 * Math.abs(j) / 3), light, 1.0);
      }
    }
    // the arms: divergent crests in echelon, each a short broken line leaning in to the track at the cusp's 35 deg, its
    // sky-lit face (paper) and the trough beyond it (ink), fading as the waves age and spread
    [1, -1].forEach(sg => {
      const a = arm(sg), th = Math.atan2(back[1], back[0]) + sg * (90 - 35.26) * Math.PI / 180, e = [Math.cos(th), Math.sin(th)];
      const nrm = [a[1] * sg, -a[0] * sg]; // out of the wedge
      // (the cusps of successive crests lie one transverse wavelength apart along her track: 1.155 wavelengths along the
      // arm)
      for (let k = 0; k < 40; k++) {
        const jit = (this.hash(k * 9.7 + sg * 3) - 0.5) * 0.15 * lam, s2 = 1.155 * lam * (k + 0.6) + jit, age = s2 / U;
        const al = Math.exp(-age / 26) * (0.55 + 0.45 * this.hash(k * 5.1 + sg * 2));
        if (al < 0.04) break;
        const p = [stern[0] + a[0] * s2, stern[1] + a[1] * s2], cl = (0.55 * lam + 0.02 * s2) * (0.75 + 0.5 * this.hash(k * 2.7 + sg));
        // inward along the crest (toward her track) and a little outward of the cusp line, broken in two
        const pa = [p[0] - e[0] * cl * 0.75, p[1] - e[1] * cl * 0.75], pm = [p[0] - e[0] * cl * 0.18, p[1] - e[1] * cl * 0.18], pm2 = [p[0] - e[0] * cl * 0.05, p[1] - e[1] * cl * 0.05], pb = [p[0] + e[0] * cl * 0.25, p[1] + e[1] * cl * 0.25];
        seg(pa, pm, Math.min(1, al * 1.05), light, 1.1);
        if (this.hash(k * 1.3 + sg) > 0.3) seg(pm2, pb, al * 0.8, light, 1.0);
        const tr = 0.22 * lam + 0.3;
        seg([pa[0] + nrm[0] * tr, pa[1] + nrm[1] * tr], [pb[0] + nrm[0] * tr, pb[1] + nrm[1] * tr], al * 0.75, dark, 0.9);
      }
    });
    // the transverse waves between the arms, near her
    for (let k = 1; k < 8; k++) {
      // (each crest bows back toward the cusps: at the cusp it lies 1.089 times as far behind her as on her track, and
      // 0.385 times that out to the side)
      const s2 = k * lam, age = s2 / U, al = Math.exp(-age / 9) * 0.65, hw = 0.385 * s2 * 0.92;
      let prev = null;
      for (let j = -5; j <= 5; j++) {
        const v = j / 5 * hw, bend = 0.089 * s2 * Math.pow(Math.abs(j) / 5 * 0.92, 2), p = [stern[0] + back[0] * (s2 + bend) + pv[0] * v, stern[1] + back[1] * (s2 + bend) + pv[1] * v];
        if (prev && this.hash(j * 3.3 + k) > 0.25) { seg(prev, p, al * (0.5 + 0.5 * this.hash(j + k * 7)), dark, 0.9); seg([prev[0] - back[0] * 0.5, prev[1] - back[1] * 0.5], [p[0] - back[0] * 0.5, p[1] - back[1] * 0.5], al * 0.55, light, 0.9); }
        prev = p;
      }
    }
    // her bow wave, white either side of her stem
    [1, -1].forEach(sg => { const st0 = [o[0] + c[0] * 5.4, o[1] + c[1] * 5.4]; seg(st0, [st0[0] + (back[0] * 0.94 + sg * pv[0] * 0.34) * 4, st0[1] + (back[1] * 0.94 + sg * pv[1] * 0.34) * 4], 0.8, light, 1.1); });
    // ink first, then the paper and the white over it
    const NB = 8, bands = Array.from({ length: NB }, () => []);
    dark.forEach(([s2, al]) => bands[Math.min(NB - 1, Math.floor(al * NB))].push(s2));
    this.segBands(bands, colr ? '#122F57' : BLUE, 0.9, NB, q);
    ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.strokeStyle = PAPER_PAT; ctx.lineCap = 'round';
    light.forEach(([s2, al, lw]) => { ctx.globalAlpha = SA * q * Math.min(1, al); ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(s2[0][0], s2[0][1]); ctx.lineTo(s2[1][0], s2[1][1]); ctx.stroke(); });
    ctx.restore();
    if (colr) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = '#FFFFFF'; ctx.lineCap = 'round';
      light.forEach(([s2, al, lw]) => { if (al < 0.25) return; ctx.globalAlpha = SA * q * al * 0.5; ctx.lineWidth = lw * 0.8; ctx.beginPath(); ctx.moveTo(s2[0][0], s2[0][1]); ctx.lineTo(s2[1][0], s2[1][1]); ctx.stroke(); });
      ctx.restore();
    }
  },
  // ---------- the shore ----------
  initShore(r) {
    // the bank's lip: 13.5 m ahead give or take, its top 2.9 m over the water (1.6 m under the eye), from well left of
    // the frame to well right of it
    this.BZ = 2.9;
    const fw = this.Fw, rt = [this.R0[0], this.R0[1]], fwd = [fw[0], fw[1]].map(v => v / Math.hypot(fw[0], fw[1]));
    this.fwd = fwd; this.rt = rt;
    const at = (a, l) => [fwd[0] * a + rt[0] * l, fwd[1] * a + rt[1] * l];
    this.at = at;
    const wl = wobble(2621, 0.55), wl2 = wobble(2622, 0.25);
    this.lip = [];
    for (let l = -3.4; l <= 3.4; l += 0.05) this.lip.push({ l, a: 13.5 + wl(l * 60) + wl2(l * 260) });
    // tufts of dry golden steppe grass (feather grass and fescue, gone to straw by September) and grey-green wormwood on
    // the bank, thicker toward the frame's corners and along the lip; their blades
    this.tufts = [];
    for (let k = 0; k < 190; k++) {
      const l = (r() - 0.5) * 6.6, side = Math.abs(l) / 2.4, lipA = this.lipAt(l);
      if (r() > 0.32 + 0.68 * side * side) continue;
      const a = lipA - 0.05 - Math.pow(r(), 1.4) * 2.7;
      const worm = r() < 0.14;
      const h = worm ? 0.16 + 0.12 * r() : (0.14 + 0.34 * r()) * (0.65 + 0.55 * Math.min(1, side));
      const blades = [];
      const nb = worm ? 40 : 40 + Math.floor(r() * 60);
      for (let bi = 0; bi < nb; bi++) {
        const u = r(), az = r() * TAU, lean = worm ? 0.35 + 0.5 * u : 0.08 + 0.75 * u * u, hh = h * (0.5 + 0.5 * r()) * (1 - 0.3 * u);
        blades.push({ az, lean, h: hh, w: r(), ph: r() * TAU, droop: 0.15 + 0.5 * r() });
      }
      this.tufts.push({ a, l, h, worm, blades, seed: 7000 + k });
    }
    this.tufts.sort((p, q2) => q2.a - p.a);
    // granite cobbles half-sunk in the bank, a few by the lip
    this.stones = [];
    for (let k = 0; k < 13; k++) {
      const l = (r() - 0.5) * 5.2, lipA = this.lipAt(l), a = lipA - 0.15 - r() * 2.3;
      const sz = 0.045 + 0.13 * Math.pow(r(), 1.8);
      this.stones.push({ a, l, rx: sz * (0.9 + 0.5 * r()), ry: sz * (0.8 + 0.5 * r()), rz: sz * (0.5 + 0.3 * r()), rot: r() * TAU, tone: r(), seed: 7500 + k });
    }
    this.stones.sort((p, q2) => q2.a - p.a);
    // grit and pebbles on the bank's top
    this.grit = Array.from({ length: 1400 }, () => [r(), r(), r()]);
  },
  lipAt(l) { const L = this.lip; const i = clamp(Math.round((l + 3.4) / 0.05), 0, L.length - 1); return L[i].a; },
  drawShore(lt) {
    const colr = OPT.colour, q = easeInOut(prog(lt, -0.45, 0.9)), Z = this.BZ, at = this.at;
    const G = (a, l, z = Z) => { const p = at(a, l); return [p[0], p[1], z]; };
    // the bank: from its lip down to the frame's foot
    const lip = this.lip.map(p => E3.proj(G(p.a, p.l)));
    const bank = new P(lip.concat([[PW + 40, PH + 40], [-40, PH + 40]]), true);
    mask(bank, q);
    if (colr) {
      washFade([0, Math.min(...lip.map(p => p[1])) - 4, PW, PH], [[0, '#B08A55', 0.62], [0.4, '#C2964F', 0.6], [1, '#A47A45', 0.66]], 0, q, bank);
    }
    // the lip's edge: a soft dark line where the bank falls away, a little shadow under its overhangs
    stroke(new P(lip), q, INK, 1.0, 0.55);
    // the ground: pebbles and grit, short dry stubble, and the faint ruling of its surface
    const gs = [], stub = [];
    this.grit.forEach(([u, v, w]) => {
      const l = (u - 0.5) * 6.8, a = this.lipAt(l) - 0.05 - v * v * 3.0, p = G(a, l);
      if (w < 0.6) gs.push([p, G(a, l + 0.006 + 0.012 * w), 0.3 + 0.5 * w]);
      else stub.push([p, G(a + 0.01, l + 0.01, Z + 0.03 + 0.06 * (w - 0.6)), 0.35 + 0.4 * (w - 0.6)]);
    });
    E3.segments(gs, colr ? '#4A3824' : INK, 1.3);
    E3.segments(stub, colr ? '#7A5524' : SEPIA, 0.6);
    hatch(bank, [0, Math.min(...lip.map(p => p[1])), PW, PH], 0.03, 3.4, q, colr ? '#6E5536' : INK, 0.5, colr ? 0.1 : 0.16, 7801);
    // stones and tufts, far to near
    const items = [];
    this.stones.forEach(s => items.push({ a: s.a, draw: () => this.stone(s, lt, q) }));
    this.tufts.forEach(t => items.push({ a: t.a, draw: () => this.tuft(t, lt, q) }));
    items.sort((p, q2) => q2.a - p.a).forEach(o => o.draw());
  },
  // a rounded granite cobble, half sunk in the bank: lit from the east-south-east (its top and left), its shadow on the
  // bank to the west-north-west
  stone(s, lt, q) {
    const colr = OPT.colour, at = this.at, Z = this.BZ, c = at(s.a, s.l), S = E3.sun();
    const ca = Math.cos(s.rot), sa = Math.sin(s.rot), sink = 0.35;
    const P3 = (th, ph) => { const x = s.rx * Math.cos(ph) * Math.cos(th), y = s.ry * Math.cos(ph) * Math.sin(th), z = s.rz * (Math.sin(ph) + sink); return [c[0] + x * ca - y * sa, c[1] + x * sa + y * ca, Z + Math.max(0, z)]; };
    // its shadow: the outline carried down the sun's rays onto the bank (to the west-north-west)
    const shp = []; for (let k = 0; k < 16; k++) { const th = k / 16 * TAU; [-0.3, 0.3, 0.9].forEach(ph => { const p = P3(th, ph); const h = p[2] - Z; shp.push(E3.proj([p[0] - S[0] * h / S[2], p[1] - S[1] * h / S[2], Z])); }); }
    fill(new P(this.hull2(shp), true), colr ? '#3B2A1C' : INK, 0.3 * q);
    // its outline as the eye sees it, shaded from the lit upper left (toward the sun) to the shade on its right
    const ol = []; for (let k = 0; k < 28; k++) { const th = k / 28 * TAU; for (const ph of [-0.25, 0.1, 0.45, 0.8, 1.2]) ol.push(E3.proj(P3(th, ph))); }
    const outline = new P(this.hull2(ol), true);
    const bb = [Math.min(...ol.map(p => p[0])), Math.min(...ol.map(p => p[1])), Math.max(...ol.map(p => p[0])), Math.max(...ol.map(p => p[1]))];
    const w = bb[2] - bb[0], h = bb[3] - bb[1];
    mask(outline, q);
    ctx.save(); ctx.beginPath(); outline.trace(ctx, 1); ctx.clip();
    const g = ctx.createLinearGradient(bb[0] + w * 0.15, bb[1], bb[0] + w * 0.95, bb[3]);
    const t2 = s.tone < 0.5;
    g.addColorStop(0, colr ? (t2 ? '#D8D2C8' : '#DCCDB8') : '#EEE8DE'); g.addColorStop(0.45, colr ? (t2 ? '#AEA9A4' : '#B7A895') : '#CFC8BC'); g.addColorStop(1, colr ? '#6E6E7C' : '#8E8880');
    ctx.globalAlpha = SA * q * (colr ? 0.85 : 0.6); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(bb[0] - 2, bb[1] - 2, w + 4, h + 4);
    // the shaded side engraved: a few lines following its curve; a speckle of the granite's grain
    ctx.globalAlpha = SA * q * 0.5; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath();
    for (let k = 0; k < 6; k++) { const x = bb[0] + w * (0.58 + 0.075 * k); ctx.moveTo(x, bb[1] + h * 0.1); ctx.quadraticCurveTo(x + w * 0.1, bb[1] + h * 0.55, x - w * 0.03, bb[3] + 1); }
    ctx.stroke();
    const rr = rng(s.seed); ctx.fillStyle = INK; ctx.globalAlpha = SA * q * 0.35;
    for (let k = 0; k < w * h * 0.04; k++) ctx.fillRect(bb[0] + rr() * w, bb[1] + rr() * h, 0.7, 0.7);
    ctx.restore();
    stroke(outline, q, INK, 0.85, 0.75);
  },
  // a tuft of dry steppe grass (or a wormwood clump): blades rising from a crown and arching out, the tips drooping,
  // swaying with the breeze from the left (gusts of a few seconds, a few centimetres at the tips)
  tuft(t, lt, q) {
    const colr = OPT.colour, at = this.at, Z = this.BZ, c = at(t.a, t.l), S = E3.sun(), sunAz = Math.atan2(S[1], S[0]);
    const gust = 0.5 + 0.5 * Math.sin(lt * TAU / 4.3 + t.l * 1.3) * Math.sin(lt * TAU / 7.1 + 0.7 + t.a);
    const wind = this.rt;
    const lit = [], mid = [], shd = [], tips = [];
    t.blades.forEach(b => {
      const sway = (0.025 + 0.05 * gust) * b.h * (1 + 0.25 * Math.sin(lt * TAU / 1.9 + b.ph));
      const ex = Math.cos(b.az), ey = Math.sin(b.az), reach = b.lean * b.h;
      const base = [c[0] + ex * 0.015, c[1] + ey * 0.015, Z];
      const ctl = [c[0] + ex * reach * 0.45 + wind[0] * sway * 0.5, c[1] + ey * reach * 0.45 + wind[1] * sway * 0.5, Z + b.h * 0.95];
      const tip = [c[0] + ex * reach + wind[0] * sway * 2.2, c[1] + ey * reach + wind[1] * sway * 2.2, Z + b.h * (1 - b.droop * b.lean)];
      const pts = [];
      for (let k = 0; k <= 6; k++) { const u = k / 6, v = 1 - u; pts.push(E3.proj([v * v * base[0] + 2 * u * v * ctl[0] + u * u * tip[0], v * v * base[1] + 2 * u * v * ctl[1] + u * u * tip[1], v * v * base[2] + 2 * u * v * ctl[2] + u * u * tip[2]])); }
      // lit on the side toward the sun (the left), darker on the far side
      const facing = Math.cos(b.az - sunAz);
      (facing > 0.25 ? lit : facing > -0.35 ? mid : shd).push(pts);
      if (!t.worm && facing > -0.2 && b.w > 0.35) tips.push(pts);
    });
    const P = t.worm ? { lit: '#7E8A6A', mid: '#66705A', shd: '#3E4636' } : { lit: '#B98A3A', mid: '#9C6E2C', shd: '#5E3F18' };
    const mono = !colr;
    [[lit, P.lit, 0.62], [mid, P.mid, 0.68], [shd, P.shd, 0.7]].forEach(([g, col, al]) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * q * al; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = mono ? (col === P.shd ? INK : SEPIA) : col; ctx.lineWidth = t.worm ? 0.8 : 0.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); g.forEach(p => { ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); }); ctx.stroke(); ctx.restore();
    });
    if (colr && tips.length) {
      // the sun on the dry blades: pale straw toward their tips, laid in screen
      ctx.save(); ctx.globalAlpha = SA * q * 0.5; ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = '#F0D894'; ctx.lineWidth = 0.55; ctx.lineCap = 'round';
      ctx.beginPath(); tips.forEach(p => { ctx.moveTo(p[2][0], p[2][1]); for (let i = 3; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); }); ctx.stroke(); ctx.restore();
    }
  },
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    plate(() => {
      if (!this.K) return;
      E3.camera(this.C, this.look, this.f, PW / 2, PH / 2);
      E3.sunAt(this.sun.az, this.sun.alt);
      try {
        this.drawSky(lt);
        this.drawClouds(lt);
        this.drawRange(lt);
        this.drawLake(lt);
        this.drawBoatReflection(lt);
        this.drawWake(lt);
        this.drawBoat(lt);
        this.drawShore(lt);
      } finally { E3.sunAt(); }
    });
  },
});
