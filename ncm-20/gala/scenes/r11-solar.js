'use strict';
// Revision 11 · the clean-energy record (B14b, after Shams 1): Al Dhafra Solar PV, Abu Dhabi, an afternoon in time-lapse.
// 2 GW in a single phase (inaugurated 16 November 2023; at its inauguration the world's largest single-site solar
// plant): almost 4 million bifacial modules on single-axis trackers over more than 20 km² of desert, 35 km from the city.
// True 3D (engrave3d.js), metres: x east, y north, z up, the sand at z 0. The eye stands in an aisle of a northern block,
// 4 m from the east-west service road, and looks south-south-west over the road down the aisles; it cranes up from 2.9 m
// to 10.5 m and draws back 6 m, turning 3.5° toward the sun and tilting from level to 10.5° down, so the rows open out to
// the horizon (f 580 px: 84° across the picture box). A pyranometer stands on its post at the road's edge (NCM forecasts
// the sun for solar plants).
//   modules: a 2023 bifacial module is about 2.28 × 1.13 m; two deep in portrait, a strip 4.6 m across; 56 modules
//   along a tracker (four strings of 28), about 65 m; three trackers end to end make a block, 10 m service roads
//   between blocks, a wider north-south road every 36 rows; the torque tube (the axis, north-south) 2.5 m up on piles
//   about 8 m apart, the drive at the middle pile; rows 10.5 m apart (the sources give no pitch: a plausible one, a
//   ground-cover ratio of 0.44). Inverter/transformer stations stand in the roads about 200 × 190 m apart (about 4 MW
//   each over 20 km²; the sources give no layout: a plausible spacing).
//   tracking: Arctech's SkySmart II (2.1 GW supplied through the EPC, CMEC: Arctech, 7 Sep 2021), a two-in-portrait
//   horizontal single-axis tracker, tracking range ±60°, run by an astronomical algorithm with backtracking (Arctech's
//   SkySmart II specification; pv magazine's visit, 15 Jan 2025: "auto-tracking (follows the sun's path with
//   astronomical algorithm along with backtracking)"). Each frame the rows take the true-tracking angle for a
//   horizontal north-south axis, the sun's angle from the zenith in the east-west plane, atan2(-sx, sz) (sx the sun's
//   east component, west positive), held at the ±60° stop, and backtracked (turned back toward flat until a row's
//   shadow just meets the next row) only when cos(true angle) < ground-cover ratio, which at 0.44 is past 64°.
//   the beat, a time-lapse (Revision 11, slower: the requester's "the solar panels following the sun"): 16 November
//   (the plant's inauguration date) at the plant, 24.141° N 54.517° E (OpenStreetMap's outline, way 1087124530; Global
//   Energy Monitor), UTC+4, the sun from NOAA's solar-position equations (after Meeus): solar noon 12:06:35, sunset
//   17:35. The clock runs from 13:50 (sun 40.3° up at azimuth 212.8°, rows 32.6° west) to 15:27:49, when the true angle
//   reaches the 60° stop (sun 24.9° up at 233.4°), and stops there: the beat ends as the rows reach their stop, before
//   they would rest at it and then, from 15:43 (true angle 64°), backtrack east toward flat, which would read as the
//   rows turning away from the sun. So all the rows turn west together through 27° as the sun sinks 15° and swings 21°
//   west; the shadows of the piles, the stations and the pyranometer swing from 33° to 53° (north-east by north to
//   north-east by east) and nearly double; the rows' shade widens from half the aisle to nine-tenths; the light warms
//   (w, from the sun's height: the low sky, the glow round the sun, the disc's edge, the sky in the glass). The clock,
//   and the crane on the same clock, runs at an even pace, about 12 minutes of afternoon to a second of the beat,
//   easing in and out over its first and last fifth; the crane's cubic ease used to tilt the view down faster than the
//   sun sinks mid-beat, which with this sun would lift the disc on screen. A lower sun is out of reach: below about 25°
//   the rows stand at their stop or backtrack.
//   sun: the disc is drawn at 24 px, about four and a half times its true 0.53° (5 px through this lens), so it reads;
//   at 13:50 it stands high, so the camera starts level (it started 2° down) to hold the disc whole in the frame. (It no
//   longer meets the Shams 1 plate's sun in the dissolve, which stands lower and further west on its diagram arc.)
scene({
  id: 'solar',
  start: 0, dur: 5,
  init() {
    const r = rng(1116);
    Object.assign(this, { PITCH: 10.5, WS: 4.6, HUB: 2.5, OFF: 0.15, MOD: 1.154, NM: 56, TG: 1.0, RD: 10, LIM: 60 });
    this.UL = this.NM * this.MOD + 0.6; // one tracker: 56 modules along, a gap at the drive
    this.BL = 3 * this.UL + 2 * this.TG; // a block of three trackers end to end
    this.GCR = this.WS / this.PITCH;
    // rows (axis x), the eye's aisle at x 0; a north-south road (8 m more) every 36 rows
    this.rows = [];
    for (let k = -262; k <= 60; k++) this.rows.push({ k, x: 5.25 + 10.5 * k + 8 * Math.floor((k + 18) / 36) });
    this.rows.forEach((w, i) => { w.dx = i + 1 < this.rows.length ? this.rows[i + 1].x - w.x : this.PITCH; });
    // blocks: the eye's road at y 0 (row ends at y ±5); 17 blocks to the south, 2 to the north
    this.blocks = [];
    for (let j = 0; j < 17; j++) { const yN = -5 - j * (this.BL + this.RD); this.blocks.push({ y0: yN - this.BL, y1: yN }); }
    for (let j = 0; j < 2; j++) { const yS = 5 + j * (this.BL + this.RD); this.blocks.push({ y0: yS, y1: yS + this.BL }); }
    this.blocks.forEach(b => { b.units = [0, 1, 2].map(u => [b.y0 + u * (this.UL + this.TG), b.y0 + u * (this.UL + this.TG) + this.UL]); });
    this.X0 = this.rows[0].x - 6; this.X1 = this.rows[this.rows.length - 1].x + 6;
    this.Y0 = this.blocks[16].y0 - 6; this.Y1 = this.blocks[18].y1 + 6;
    // inverter/transformer stations in the roads between blocks, in an aisle every 18 rows
    this.stations = [];
    for (let j = 1; j < 17; j++) {
      const yc = -j * (this.BL + this.RD);
      for (let i = -15; i <= 3; i++) {
        const k = 18 * i + 9, a = this.rows.find(w => w.k === k), b = this.rows.find(w => w.k === k - 1);
        if (a && b) this.stations.push({ x: (a.x + b.x) / 2, y: yc + (r() - 0.5) * 1.2 });
      }
    }
    // the pyranometer's post on the road's north edge, where no row shades it (as a station must stand)
    this.PYR = [-2.2, 3.4];
    // a vehicle's wheel tracks along the eye's road (a pair 1.8 m apart, wandering a little)
    const wob1 = wobble(1117, 0.25), wob2 = wobble(1118, 0.3);
    this.tracks = [-0.9, 0.9, -0.2, 1.6].map((y0, i) => Array.from({ length: 121 }, (_, k) => { const x = -300 + k * 5; return [x, y0 + (i < 2 ? wob1(x * 4) : wob2(x * 4) + 0.3), 0]; }));
    // sand ripples near the eye, the road's gravel, the desert beyond the plant
    this.ripples = Array.from({ length: 900 }, () => [r(), r(), r()]);
    this.gravel = Array.from({ length: 1400 }, () => [r(), r()]);
    this.stip = Array.from({ length: 5000 }, () => [r(), r(), r()]);
    this.near = Array.from({ length: 1400 }, () => [r(), r(), r()]);
    this.dunes = Array.from({ length: 500 }, () => [r(), r(), r()]);
  },
  // the sun at local time h (hours, UTC+4) on 16 November 2023 at the plant: NOAA's solar-position equations (after
  // Meeus), geometric altitude and azimuth (degrees, azimuth clockwise from north)
  sunPos(h) {
    const D = Math.PI / 180, lat = 24.141 * D, lon = 54.517, TZ = 4;
    // Julian centuries from J2000 (16 November 2023 at 0h UT is JD 2460264.5)
    const T = (2460264.5 + (h - TZ) / 24 - 2451545) / 36525;
    const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360, M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) * D;
    const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    const C = Math.sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M) * (0.019993 - 0.000101 * T) + Math.sin(3 * M) * 0.000289;
    const om = (125.04 - 1934.136 * T) * D, lam = (L0 + C - 0.00569 - 0.00478 * Math.sin(om)) * D;
    const eps = (23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om)) * D;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam)), y = Math.tan(eps / 2) ** 2, l2 = 2 * L0 * D;
    // the equation of time (minutes), then the hour angle from the true solar time
    const eot = 4 / D * (y * Math.sin(l2) - 2 * e * Math.sin(M) + 4 * e * y * Math.sin(M) * Math.cos(l2) - 0.5 * y * y * Math.sin(2 * l2) - 1.25 * e * e * Math.sin(2 * M));
    const ha = ((h * 60 + eot + 4 * lon - 60 * TZ) / 4 - 180) * D;
    const alt = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha));
    const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat)) + Math.PI;
    return { alt: alt / D, az: az / D };
  },
  // the rows' true-tracking angle (radians, west positive) for a sun at alt, az (degrees)
  trueTrack(alt, az) { const D = Math.PI / 180; return Math.atan2(-Math.cos(alt * D) * Math.sin(az * D), Math.sin(alt * D)); },
  // the time-lapse's clock (0-1), shared by the crane: an even pace, easing in and out over its first and last fifth
  // (the speed rises and falls as a smoothstep, so it never jerks), from the dissolve in to the dissolve out
  clock(lt) {
    const x = clamp((lt - 0.3) / 6.9), e = 0.2, sm = t => t * t * t - t * t * t * t / 2;
    return (x < e ? e * sm(x / e) : x > 1 - e ? 1 - e - e * sm((1 - x) / e) : e / 2 + x - e) / (1 - e);
  },
  // the clock's hours: 13:50, and the moment the true-tracking angle reaches the 60° stop (found once, by bisection);
  // the sun's altitude at each, for the warming light
  hours() {
    if (!this.H) {
      const D = Math.PI / 180, tt = h => { const p = this.sunPos(h); return this.trueTrack(p.alt, p.az) - this.LIM * D; };
      let a = 13, b = 17;
      for (let i = 0; i < 50; i++) { const m = (a + b) / 2; if (tt(m) < 0) a = m; else b = m; }
      this.H = [13 + 50 / 60, (a + b) / 2];
      this.ALT = this.H.map(h => this.sunPos(h).alt);
    }
    return this.H;
  },
  // this frame's sun and the trackers' tilt
  sun(lt) {
    const D = Math.PI / 180, H = this.hours(), h = lerp(H[0], H[1], this.clock(lt)), p = this.sunPos(h), alt = p.alt * D, az = p.az * D;
    const s = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
    // backtracking: the true-tracking angle in the plane across the rows, turned back until the rows just clear (only
    // past 64° at this ground-cover ratio, so never in this beat); then the tracker's ±60° stop
    const tT = this.trueTrack(p.alt, p.az), c = Math.cos(tT) / this.GCR;
    let th = Math.abs(c) < 1 ? tT - Math.sign(tT) * Math.acos(Math.abs(c)) : tT;
    th = clamp(th, -this.LIM * D, this.LIM * D);
    const ct = Math.cos(th), st = Math.sin(th);
    this.S = s; this.alt = p.alt; this.az = p.az; this.hour = h;
    // the light's warmth: 0 with the sun at 13:50's height, 1 at the end
    this.w = clamp((this.ALT[0] - p.alt) / (this.ALT[0] - this.ALT[1]));
    this.T = { th, ct, st, n: [-st, 0, ct], nb: [st, 0, -ct], hw: this.WS / 2 };
    return s;
  },
  view(lt) {
    // in the aisle among the northern block's rows, eye height 2.9 m, looking out over the road to the southern
    // blocks; it rises to 10.5 m and draws back north along the aisle, with a slight turn toward the sun, on the
    // time-lapse's clock; it starts level, so the early afternoon's high sun stands whole in the frame
    const D = Math.PI / 180, u = this.clock(lt);
    const C = [lerp(0.4, 1.5, u), lerp(9.2, 15.5, u), lerp(2.9, 10.5, u)], az = lerp(208.8, 212.3, u) * D, pt = lerp(0, 10.5, u) * D;
    return E3.camera(C, [C[0] + 100 * Math.cos(pt) * Math.sin(az), C[1] + 100 * Math.cos(pt) * Math.cos(az), C[2] - 100 * Math.sin(pt)], 580, 540, 560);
  },
  // the camera, and where the horizon and the sun fall on screen (the colour washes follow them)
  frame(lt) {
    this.sun(lt);
    this.view(lt);
    const cam = E3.cam(), hz = E3.projDir([cam.F[0], cam.F[1], 0]);
    this.hy = hz ? hz[1] : 520;
    this.sp = E3.projDir(this.S);
  },
  // a module strip's corner: u across (east edge up), y along the row
  corner(xr, u, y) { const T = this.T; return [xr + u * T.ct - this.OFF * T.st, y, this.HUB + u * T.st + this.OFF * T.ct]; },
  // lines radiating from a vanishing point on the horizon over the ground below it, about gap px apart wherever they
  // are: a finer line starts only where its neighbours have spread apart, each at its own point, so the tone never steps
  radial(vp, box, gap, a, p) {
    const [x0, , x1, y1] = box, R = Math.hypot(Math.max(vp[0] - x0, x1 - vp[0]), y1 - vp[1]) + 20, n = 1024, dA = Math.PI / n, r = rng(1175);
    ctx.save(); ctx.globalAlpha = SA * a * p; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.75; ctx.lineCap = 'butt';
    ctx.beginPath();
    for (let i = 1; i < n; i++) {
      let lev = 0; while (lev < 10 && (i >> lev) % 2 === 0) lev++;
      const r0 = Math.max(24, gap / (dA * (1 << lev)) * (0.45 + 0.9 * r())), ang = i * dA;
      if (r0 > R) continue;
      const c = Math.cos(ang), sn = Math.sin(ang);
      ctx.moveTo(vp[0] + c * r0, vp[1] + sn * r0); ctx.lineTo(vp[0] + c * R, vp[1] + sn * R);
    }
    ctx.stroke(); ctx.restore();
  },
  // a wash graded between two screen points (the glass along a row)
  gradFill(path, p0, p1, c0, a0, c1, a1) {
    const rgba = (c, al) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${al})`; };
    ctx.save();
    if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 1) ctx.fillStyle = rgba(c0, (a0 + a1) / 2);
    else { const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); g.addColorStop(0, rgba(c0, a0)); g.addColorStop(1, rgba(c1, a1)); ctx.fillStyle = g; }
    ctx.globalAlpha = SA; ctx.globalCompositeOperation = BLEND; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore();
  },
  // a line of bare paper along a path (the white an engraver leaves round a near object, to part it from what is behind)
  halo(path, lw) {
    ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA; ctx.strokeStyle = PAPER_PAT; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); path.trace(ctx, 1); ctx.stroke(); ctx.restore();
  },
  // the convex hull of screen points (monotone chain)
  hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  },
  // mix two #rrggbb colours
  mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, clamp(t)));
    return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
  },
  // the sky's brightness (0-1) seen along r at this hour: brightest low toward the sun
  skyLum(r) {
    if (r[2] < 0) return 0.16; // below the horizon: the shaded sand and the rows
    const el = Math.asin(clamp(r[2], -1, 1)), g = Math.acos(clamp(E3.dot(r, this.S), -1, 1));
    return clamp(0.42 + 0.3 * Math.exp(-el / 0.2) + 0.4 * Math.exp(-g / 0.3));
  },
  skyCol(r) {
    if (r[2] < 0) return this.mix(HUE.steel, HUE.dune, 0.35);
    const el = Math.asin(clamp(r[2], -1, 1)), g = Math.acos(clamp(E3.dot(r, this.S), -1, 1));
    // the low sky and the sky round the sun warm as the sun lowers (w)
    const w = this.w;
    return this.mix(this.mix(HUE.sky, HUE.dawn, Math.exp(-el / 0.25) * (0.45 + 0.35 * w)), HUE.dawn, Math.exp(-g / 0.4) * (0.4 + 0.3 * w));
  },
  // glass: a mirror at grazing angles (Fresnel), the dark cells behind it when seen steeply
  glass(p, front) {
    const C = E3.cam().C, v0 = E3.sub(p, C), l = Math.hypot(v0[0], v0[1], v0[2]), v = [v0[0] / l, v0[1] / l, v0[2] / l];
    const m = front ? this.T.n : this.T.nb, vm = E3.dot(v, m), cosi = clamp(-vm), F = 0.04 + 0.96 * Math.pow(1 - cosi, 5);
    const r = [v[0] - 2 * vm * m[0], v[1] - 2 * vm * m[1], v[2] - 2 * vm * m[2]];
    const B = F * this.skyLum(r) + (1 - F) * (front ? 0.12 : 0.2);
    // the tone as the eye reads it (lightness goes as about the square root of the light)
    return { tone: clamp(1.02 - 1.05 * Math.sqrt(B), 0.1, 0.8), col: this.mix(front ? HUE.deep : HUE.steel, this.skyCol(r), clamp(0.1 + 1.2 * Math.pow(F, 0.7))), F };
  },
  // colour: the afternoon sky, warming low toward the sun as it lowers (w, from the sun's height), the sand (all
  // inside the picture box)
  under(lt) {
    this.frame(lt);
    const q = easeInOut(prog(lt, 0, 0.8)), w = this.w, B = R11.BOX, hy = this.hy;
    R11.clipped(() => {
      washFade([B[0], B[1] - 300, B[2], hy + 2], [[0, HUE.sky, 0.48 - 0.04 * w], [0.55, HUE.sky, 0.34 - 0.06 * w], [0.85, HUE.dawn, 0.08 + 0.14 * w], [1, HUE.rose, 0.1 + 0.24 * w]], 0, q);
      if (this.sp) {
        // the glow round the sun: a pale cream while it stands high, warming to apricot
        const [sx, sy] = this.sp, R = 300, c = [lerp(246, 242, w), lerp(214, 163, w), lerp(170, 107, w)].map(Math.round).join(',');
        ctx.save(); const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, R);
        g.addColorStop(0, `rgba(${c},${0.4 + 0.16 * w})`); g.addColorStop(0.5, `rgba(${c},${0.13 + 0.07 * w})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R); ctx.restore();
      }
      washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.dune, 0.36 + 0.1 * w], [0.12, HUE.sand, 0.34], [1, HUE.sand, 0.28 + 0.06 * w]], 0, q);
    });
  },
  draw(lt) {
    const s = this.sun(lt);
    E3.sunAt(this.az, this.alt);
    R11.clipped(() => {
      this.frame(lt);
      this.drawSky(lt);
      this.drawGround(lt);
      this.drawField(lt);
    });
    E3.sunAt();
  },
  // the sky ruled as an engraver rules it: close lines high up, opening toward the horizon and around the sun
  drawSky(lt) {
    const B = R11.BOX, hy = this.hy, sp = this.sp, NB = 14, bands = Array.from({ length: NB + 1 }, () => []), k = OPT.colour ? 0.55 : 1;
    let row = 0;
    for (let y = B[1] + 2; y < hy - 3; y += 4.2, row++) {
      const e = (hy - y) / (hy - B[1]);
      for (let x = B[0], j = 0; x < B[2]; x += 8, j++) {
        const dsun = sp ? Math.hypot(x + 4 - sp[0], (y - sp[1]) * 1.6) : 1e4, open = 1 - Math.exp(-Math.pow(dsun / 190, 2));
        const a = (0.1 + 0.5 * Math.pow(e, 0.9)) * open * k, h = ((row * 73856093) ^ (j * 19349663)) >>> 0;
        const bi = Math.round(a / 0.62 * NB + ((h % 1000) / 1000 - 0.5));
        if (bi > 0) bands[Math.min(NB, bi)].push([x, y, x + 8]);
      }
    }
    bands.forEach((segs, i) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * 0.62 * i / NB; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.75; ctx.lineCap = 'butt';
      ctx.beginPath(); segs.forEach(([x0, y, x1]) => { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }); ctx.stroke(); ctx.restore();
    });
    // the sun in the south-west: the lightest thing in the frame (a paper-cream core laid over the sky, an edge that
    // warms as it lowers, a soft paper glow round it) and no ink outline, so it reads as light, never as a ring or a
    // target
    if (sp) {
      const [sx, sy] = sp, R = 12;
      mask(el(sx, sy, R + 12, R + 12, 0, TAU, 1161, 0), 0.5);
      mask(el(sx, sy, R + 5, R + 5, 0, TAU, 1163, 0), 0.85);
      disc(sx, sy, R, OPT.colour ? '#FFF3D6' : '#FBF4E4', 0.96, 'source-over');
      stroke(el(sx, sy, R, R, 0, TAU, 1162, 0), 1, OPT.colour ? this.mix('#EFD3A0', '#E8A45C', this.w) : OCHRE, 1.8, 0.3 + 0.1 * this.w);
    }
    stroke(new P([[B[0], hy], [B[2], hy]]), 1, INK, 1, 0.45);
  },
  // the ground: sand; the rows' shade over the aisles (the union of every tracker's shadow, lit by the sky), darker
  // under the modules where the sky is hidden; the sun on the road and through the gaps between trackers
  drawGround(lt) {
    const C = E3.cam().C, s = this.S, T = this.T, hw = T.hw, B = R11.BOX, hy = this.hy;
    const shp = p => [p[0] - s[0] * p[2] / s[2], p[1] - s[1] * p[2] / s[2], 0];
    const shade = [], umbra = [], box = [B[0], hy, B[2], B[3]];
    const toPath = (q, out) => {
      const dz = q.map(E3.depth);
      let sp;
      if (dz.every(d => d > 0.6)) sp = q.map(E3.proj);
      else { // near the eye: clip at the near plane
        sp = [];
        for (let i = 0; i < q.length; i++) {
          const a = q[i], b = q[(i + 1) % q.length], da = dz[i], db = dz[(i + 1) % q.length];
          if (da > 0.6) sp.push(E3.proj(a));
          if ((da > 0.6) !== (db > 0.6)) { const t = (0.6 - da) / (db - da); sp.push(E3.proj([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0])); }
        }
        if (sp.length < 3) return;
      }
      const xs = sp.map(p => p[0]), ys = sp.map(p => p[1]);
      if (Math.max(...xs) < B[0] || Math.min(...xs) > B[2] || Math.max(...ys) < hy - 2 || Math.min(...ys) > B[3]) return;
      // one winding for all, so overlapping shadows add up (nonzero) instead of cancelling
      let area = 0; for (let i = 0; i < sp.length; i++) { const a = sp[i], b = sp[(i + 1) % sp.length]; area += a[0] * b[1] - b[0] * a[1]; }
      out.push(new P(area < 0 ? sp.slice().reverse() : sp, true));
    };
    this.rows.forEach(w => {
      const ax = Math.abs(w.x - C[0]);
      if (ax > 900) return;
      this.blocks.forEach(b => {
        if (C[1] - b.y1 > 900 || b.y0 - C[1] > 900) return;
        b.units.forEach(([ya, yb]) => {
          const c4 = [this.corner(w.x, -hw, ya), this.corner(w.x, hw, ya), this.corner(w.x, hw, yb), this.corner(w.x, -hw, yb)];
          const q = c4.map(shp);
          q[1][0] += 0.3; q[2][0] += 0.3; // a hair of overlap, so shadows that meet close without seams
          toPath(q, shade);
          if (ax < 260 && C[1] - b.y1 < 260) toPath([[c4[0][0] - 0.5, ya, 0], [c4[1][0] + 0.5, ya, 0], [c4[2][0] + 0.5, yb, 0], [c4[3][0] - 0.5, yb, 0]], umbra);
        });
      });
    });
    const q = easeInOut(prog(lt, 0, 0.6));
    if (shade.length) {
      if (OPT.colour) { ctx.save(); ctx.beginPath(); shade.forEach(p => p.trace(ctx, 1)); ctx.globalAlpha = SA * 0.34 * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = HUE.steel; ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.beginPath(); shade.forEach(p => p.trace(ctx, 1)); ctx.clip();
      // the shade is ruled along the sun's direction on the sand: every line runs back to the horizon under the sun
      const vp = E3.projDir([s[0], s[1], 0]);
      if (vp) this.radial(vp, box, 3.8, OPT.colour ? 0.28 : 0.4, q);
      hatch(shade, box, 0, 4.4, q, INK, 0.6, OPT.colour ? 0.12 : 0.18, 1170);
      // under the modules the sand sees less of the sky
      if (umbra.length) hatch(umbra, box, 0.05, 2.7, q, INK, 0.7, OPT.colour ? 0.16 : 0.22, 1172);
      ctx.restore();
    }
    // the piles' shadows, where they fall on sunlit sand (the rest lie inside the rows' shade)
    const inQuad = (pt, q) => { let sg = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b[0] - a[0]) * (pt[1] - a[1]) - (b[1] - a[1]) * (pt[0] - a[0]); if (c !== 0) { if (sg && Math.sign(c) !== sg) return false; sg = Math.sign(c); } } return true; };
    const quadOf = (x, ya, yb) => [this.corner(x, -hw, ya), this.corner(x, hw, ya), this.corner(x, hw, yb), this.corner(x, -hw, yb)].map(shp);
    const pshad = [], step = (this.UL - 0.6) / 8;
    this.rows.forEach((w, wi) => {
      if (Math.abs(w.x - C[0]) > 45) return;
      const near = this.rows.slice(Math.max(0, wi - 2), wi + 1);
      this.blocks.forEach(b => b.units.forEach(([ya, yb]) => {
        [ya + 0.3, yb - 0.3].forEach(y => {
          if (Math.abs(y - C[1]) > 50) return;
          const base = [w.x, y, 0], tip = shp([w.x, y, this.HUB - 0.12]);
          const quads = [];
          near.forEach(v => this.blocks.forEach(bb => bb.units.forEach(([a2, b2]) => { if (Math.abs(a2 - y) < 90 || Math.abs(b2 - y) < 90) quads.push(quadOf(v.x, a2, b2)); })));
          let run = null;
          for (let k = 0; k <= 16; k++) {
            const t = k / 16, pt = [lerp(base[0], tip[0], t), lerp(base[1], tip[1], t), 0], lit = !quads.some(q => inQuad(pt, q));
            if (lit && !run) run = pt; else if (!lit && run) { pshad.push([run, pt]); run = null; }
            if (lit && k === 16) pshad.push([run, pt]);
          }
        });
      }));
    });
    pshad.forEach(([a, b]) => E3.line([a, b], INK, clamp(0.12 * E3.cam().f / Math.max(1, E3.depth(a)), 0.6, 2.2), 0.55));
    // the sand: a stipple lying on the ground (denser toward the horizon, as perspective packs it), ripples near the eye,
    // the road's gravel, a vehicle's wheel tracks and the gravel's edges
    const dots = [], segs = [];
    this.stip.forEach(([a, b, c]) => {
      const x = C[0] - 90 + a * 180, y = C[1] + 25 - b * b * 260, d = E3.depth([x, y, 0]);
      if (d > 1 && d < 260) dots.push([[x, y, 0], [x + 0.03 + 0.05 * c, y, 0], (0.35 + 0.4 * c) * R11.air(d, 140)]);
    });
    this.ripples.forEach(([a, b, c]) => {
      const x = C[0] - 60 + a * 120, y = C[1] + 20 - b * 90, l = 0.6 + c * 1.8, d = E3.depth([x, y, 0]);
      if (d > 1 && d < 80) segs.push([[x, y, 0], [x + l, y + 0.2 * (c - 0.5), 0], 0.45 * R11.air(d, 50)]);
    });
    this.gravel.forEach(([a, b]) => { const x = C[0] - 45 + a * 90, y = -2.6 + b * 5.2, d = E3.depth([x, y, 0]); if (d > 1) dots.push([[x, y, 0], [x + 0.05, y, 0], 0.6 * R11.air(d, 60)]); });
    // near the eye: wind ripples (crests north-east to south-west, across the north-westerly) and grit
    this.near.forEach(([a, b, c]) => {
      const x = -14 + a * 30, y = -6 + b * 22, d = E3.depth([x, y, 0]);
      if (d < 1.2 || d > 40) return;
      const l = 0.25 + 0.5 * c, al = (0.25 + 0.3 * c) * clamp((40 - d) / 25);
      if (c < 0.7) segs.push([[x, y, 0], [x + l * 0.7, y - l * 0.7, 0], al]);
      else dots.push([[x, y, 0], [x + 0.03, y, 0], al + 0.2]);
    });
    E3.segments(dots, INK, 1.2);
    E3.segments(segs, INK, 0.8);
    this.tracks.forEach(t => E3.line(t, INK, 0.9, 0.3));
    [-2.6, 2.6].forEach(y => E3.line([[C[0] - 300, y, 0], [C[0] + 300, y, 0]], INK, 0.8, 0.4));
    // the desert past the plant's far edge, to the horizon: a few ruled strokes
    const far = [];
    this.dunes.forEach(([a, b, c]) => {
      const x = this.X0 - 200 + a * (this.X1 - this.X0 + 400), y = this.Y0 - 20 - b * 3000;
      far.push([[x, y, 0], [x + 30 + c * 80, y, 0], 0.3 + 0.3 * c]);
    });
    E3.segments(far, INK, 0.6);
  },
  // the rows: far rows as ruled lines (their tone comes from their density), nearer trackers in full, far to near
  drawField(lt) {
    const cam = E3.cam(), C = cam.C, T = this.T, hw = T.hw, B = R11.BOX, FAR = 420;
    const top = x => this.corner(x, hw, 0), zt = top(0)[2], xo = top(0)[0];
    const bands = [[], [], [], [], [], []], items = [];
    const inView = (a, b) => {
      const s = E3.clipSeg(a, b); if (!s) return null;
      const [p, q] = s;
      if (Math.max(p[0], q[0]) < B[0] - 20 || Math.min(p[0], q[0]) > B[2] + 20 || Math.max(p[1], q[1]) < B[1] - 40 || Math.min(p[1], q[1]) > B[3] + 60) return null;
      return s;
    };
    const dmin = (ya, yb, x) => Math.max(0.6, Math.min(E3.depth([x, ya, this.HUB]), E3.depth([x, yb, this.HUB]), E3.depth([x, clamp(C[1], ya, yb), this.HUB])));
    const farLine = (w, ya, yb) => {
      const a = [w.x + xo, ya, zt], b = [w.x + xo, yb, zt], s = inView(a, b);
      if (!s) return;
      const ym = (ya + yb) / 2, pm = E3.proj([w.x + xo, ym, zt]), pn = E3.proj([w.x + w.dx + xo, ym, zt]);
      const gap = Math.hypot(pn[0] - pm[0], pn[1] - pm[1]), d = E3.depth([w.x, ym, zt]);
      const al = 0.62 * R11.air(d, 2400) * clamp(gap / 3.2, 0.05, 1);
      bands[Math.min(5, Math.floor(al * 9))].push(s);
    };
    this.rows.forEach(w => {
      const key = Math.abs(w.x - C[0]);
      this.blocks.forEach(b => {
        const s = inView([w.x, b.y0, zt], [w.x, b.y1, zt]);
        if (!s) return;
        if (dmin(b.y0, b.y1, w.x) > FAR) { farLine(w, b.y0, b.y1); return; }
        b.units.forEach(([ya, yb], ui) => {
          if (!inView([w.x, ya, zt], [w.x, yb, zt]) && !inView([w.x, ya, 0], [w.x, yb, 0])) return;
          const d = dmin(ya, yb, w.x);
          if (d > FAR) { farLine(w, ya, yb); return; }
          // pieces: one pile span near the eye, longer further out
          const n = d < 45 ? 8 : d < 110 ? 4 : d < 220 ? 2 : 1, L = (yb - ya) / n;
          for (let i = 0; i < n; i++) {
            const y0 = ya + i * L, y1 = y0 + L, dm = E3.depth([w.x, (y0 + y1) / 2, this.HUB]);
            if (!inView([w.x, y0, zt], [w.x, y1, zt]) && !inView([w.x, y0, 0], [w.x, y1, 0])) continue;
            items.push({ key, d: dm, draw: () => this.piece(w, ya, yb, y0, y1, Math.max(0.6, Math.min(E3.depth([w.x, y0, this.HUB]), E3.depth([w.x, y1, this.HUB]))), 1200 + w.k * 7 + i) });
          }
        });
      });
    });
    // stations in the roads
    this.stations.forEach((st, i) => {
      const d = E3.depth([st.x, st.y, 1]);
      if (d < 1 || d > 1500) return;
      const p = E3.proj([st.x, st.y, 1]);
      if (p[0] < B[0] - 30 || p[0] > B[2] + 30 || p[1] < B[1] || p[1] > B[3] + 30) return;
      items.push({ key: Math.abs(st.x - C[0]), d, draw: () => this.station(st, d, i) });
    });
    // the far field first: there the glass is seen at a grazing angle and holds the low sky (in colour, the rows take
    // its warm light, a band that fades out where the rows come near enough to show their own tone)
    if (OPT.colour) {
      const gy = E3.proj([C[0] + 900 * cam.F[0], C[1] + 900 * cam.F[1], 0])[1], g = this.glass([C[0] + 1500 * cam.F[0], C[1] + 1500 * cam.F[1], this.HUB], true);
      washFade([B[0], this.hy, B[2], gy], [[0, g.col, 0.5], [0.45, HUE.dawn, 0.28], [1, HUE.dawn, 0]], 0, 1);
    }
    bands.forEach((segs, i) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (i + 0.5) / 9 * (OPT.colour ? 0.8 : 1); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
      ctx.beginPath(); segs.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
    // then every nearer thing: rows further from the eye (across the rows) first; along a row, the far end first
    items.sort((a, b) => b.key - a.key || b.d - a.d).forEach(o => o.draw());
    this.pyranometer(lt);
  },
  // a length of tracker between y0 and y1 (of the tracker ya-yb): the glass, the torque tube, the piles, the drive
  piece(w, ya, yb, y0, y1, d, seed) {
    const T = this.T, hw = T.hw, xr = w.x, C = E3.cam().C, near = d < 45, a = R11.air(d, 1800);
    const quad = [this.corner(xr, -hw, y0), this.corner(xr, hw, y0), this.corner(xr, hw, y1), this.corner(xr, -hw, y1)];
    const mid = [(quad[0][0] + quad[2][0]) / 2, (y0 + y1) / 2, (quad[0][2] + quad[2][2]) / 2];
    const front = E3.dot(T.n, E3.sub(C, mid)) > 0, g = this.glass(mid, front);
    // the reflection at each end of the piece: the glass shades along the row from one to the other, in bands
    const e0 = this.corner(xr, 0, y0), e1 = this.corner(xr, 0, y1), g0 = this.glass(e0, front), g1 = this.glass(e1, front);
    // pixels per metre here: the details thin out with distance
    const ppm = E3.cam().f / d;
    const glassSt = { n: front ? T.n : T.nb, tone: (g0.tone + g1.tone) / 2, shade: 0, hdir: [0, 1, 0], lw: 1.1, edgeA: 0.85 * a, noHatch: ppm < 6 };
    const under = () => this.understructure(xr, ya, yb, y0, y1, d, ppm, front, seed);
    if (front) under();
    const f = E3.face(quad, glassSt, seed);
    if (f) {
      const pe = (e, alt) => E3.depth(e) > 0.8 ? E3.proj(e) : E3.proj(alt);
      const p0 = pe(e0, mid), p1 = pe(e1, mid);
      if (OPT.colour) this.gradFill(f.path, p0, p1, g0.col, 0.62, g1.col, 0.62);
      else this.gradFill(f.path, p0, p1, INK, 0.08 + 0.3 * g0.tone, INK, 0.08 + 0.3 * g1.tone);
    }
    // the module joints across the strip and the line between the two modules of the pair
    if (ppm * this.MOD > 5) {
      const off = front ? T.n : T.nb, o = p => [p[0] + off[0] * 0.01, p[1], p[2] + off[2] * 0.01], L = [];
      for (let y = ya + this.MOD; y < yb - 0.3; y += this.MOD) if (y > y0 && y < y1) L.push([o(this.corner(xr, -hw, y)), o(this.corner(xr, hw, y)), 0.5 * a]);
      L.push([o(this.corner(xr, 0, y0)), o(this.corner(xr, 0, y1)), 0.6 * a]);
      E3.segments(L, INK, clamp(0.9 * 60 / d, 0.4, 1.2));
    } else if (ppm > 1.2) E3.line([this.corner(xr, 0, y0), this.corner(xr, 0, y1)], INK, 0.5, 0.3 * a);
    if (!front) under();
  },
  understructure(xr, ya, yb, y0, y1, d, ppm, front, seed) {
    const T = this.T, a = R11.air(d, 1800), H = this.HUB, near = ppm > 14;
    // the piles: nine to a tracker, the drive at the middle one
    const step = (this.UL - 0.6) / 8;
    for (let i = 0; i <= 8; i++) {
      const y = ya + 0.3 + i * step;
      if (y < y0 || y >= y1) continue;
      if (near) {
        E3.solid(E3.box(xr - 0.08, xr + 0.08, y - 0.05, y + 0.05, 0, H - 0.12), { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85 * a, fillCol: OPT.colour ? HUE.steel : null, fillA: 0.3 }, seed + i * 3);
        if (i === 4) E3.solid(E3.box(xr - 0.22, xr + 0.22, y - 0.3, y + 0.3, H - 0.3, H + 0.1), { tone: 0.25, shade: 0.5, lw: 0.9, edgeA: 0.85 * a, fillCol: OPT.colour ? HUE.steel : null, fillA: 0.4 }, seed + 50);
      } else if (ppm > 1.5) R11.member([xr, y, 0], [xr, y, H - 0.1], 0.9, 0.7);
    }
    // the torque tube, a square tube turning with the modules
    const t = 0.075, c = (u, v, y) => [xr + u * T.ct - v * T.st, y, H + u * T.st + v * T.ct];
    if (near) {
      const faces = [[[-t, -t], [t, -t]], [[t, -t], [t, t]], [[t, t], [-t, t]], [[-t, t], [-t, -t]]].map(([p, q]) => [c(p[0], p[1], y0), c(q[0], q[1], y0), c(q[0], q[1], y1), c(p[0], p[1], y1)]);
      E3.solid(faces, { tone: 0.15, shade: 0.5, lw: 0.9, edgeA: 0.8 * a, hdir: [0, 1, 0], fillCol: OPT.colour ? HUE.steel : null, fillA: 0.3 }, seed + 60);
      // the rails under each pair of modules (seen from below)
      if (!front) {
        const L = [];
        for (let y = ya + this.MOD / 2; y < yb; y += this.MOD) if (y > y0 && y < y1) L.push([c(-T.hw + 0.1, 0.1, y), c(T.hw - 0.1, 0.1, y), 0.55 * a]);
        E3.segments(L, INK, clamp(60 / d, 0.4, 1.3));
      }
    } else if (ppm > 1) E3.line([[xr, y0, H], [xr, y1, H]], INK, clamp(0.9 * 120 / d, 0.4, 1.2), 0.6 * a);
  },
  // an inverter and transformer station on its pad in a road, with its shadow
  station(st, d, i) {
    const a = R11.air(d, 1800), s = this.S, x = st.x, y = st.y;
    const sh = (p) => [p[0] - s[0] * p[2] / s[2], p[1] - s[1] * p[2] / s[2], 0];
    const box = [x - 1.2, x + 1.2, y - 3.4, y + 0.8, 0.2, 2.8];
    const q = [[box[0], box[2], box[5]], [box[1], box[2], box[5]], [box[1], box[3], box[5]], [box[0], box[3], box[5]]].map(sh);
    const base = [[box[0], box[2], 0], [box[1], box[2], 0], [box[1], box[3], 0], [box[0], box[3], 0]];
    const hull = [base[0], base[1], q[1], q[2], q[3], base[3]].map(E3.proj);
    fill(new P(hull, true), INK, 0.22 * a);
    E3.solid(E3.box(x - 1.5, x + 1.5, y - 3.7, y + 3.7, 0, 0.2), { tone: 0.05, shade: 0.3, lw: 0.8, edgeA: 0.7 * a, noHatch: true }, 1500 + i);
    E3.solid(E3.box(...box), { tone: 0.06, shade: 0.55, lw: 0.9, edgeA: 0.85 * a, fillCol: OPT.colour ? '#EDE6D6' : null, fillA: 0.5, noHatch: d > 300 }, 1510 + i);
    E3.solid(E3.box(x - 0.9, x + 0.9, y + 1.4, y + 3.3, 0.2, 2.3), { tone: 0.2, shade: 0.55, lw: 0.9, edgeA: 0.85 * a, fillCol: OPT.colour ? HUE.steel : null, fillA: 0.4, noHatch: d > 300 }, 1520 + i);
  },
  // the pyranometer: a glass dome over its sensor on a levelled plate, its white sun screen, on a post by the road,
  // and the data logger on the post
  pyranometer(lt) {
    const [px, py] = this.PYR, s = this.S, colr = OPT.colour, d = E3.depth([px, py, 1.9]), f = E3.cam().f;
    const st = (tone, fc, fa = 0.5, shade = 0.5) => ({ tone, shade, lw: 1.1, edgeA: 0.9, fillCol: colr ? fc : null, fillA: fa, noHatch: tone < 0.05 });
    // its shadow on the sand, then the white an engraver leaves round it
    const sh = z => [px - s[0] * z / s[2], py - s[1] * z / s[2], 0];
    E3.line([[px, py, 0], sh(1.95)], INK, 1.4, 0.35);
    this.halo(new P([E3.proj([px, py, 0.12]), E3.proj([px, py, 2.03])]), 0.2 * f / d);
    this.halo(new P([E3.proj([px - 0.07, py, 2.0]), E3.proj([px + 0.07, py, 2.0])]), 0.14 * f / d);
    E3.solid(E3.box(px - 0.2, px + 0.2, py - 0.2, py + 0.2, 0, 0.12), st(0.08, '#D9D0C0', 0.5), 1600);
    E3.solid(R11.cylinder([px, py], 0.03, 0.12, 1.95, 10), st(0.12, HUE.steel, 0.4), 1601);
    // the logger box on the post's north side, with its door
    E3.solid(E3.box(px - 0.15, px + 0.15, py + 0.035, py + 0.19, 1.05, 1.45), st(0.04, '#EFE9DC', 0.6), 1602);
    E3.line([[px - 0.12, py + 0.192, 1.08], [px + 0.12, py + 0.192, 1.08], [px + 0.12, py + 0.192, 1.42], [px - 0.12, py + 0.192, 1.42], [px - 0.12, py + 0.192, 1.08]], INK, 0.8, 0.6);
    // the cable up to the sensor
    E3.line([[px + 0.04, py + 0.02, 1.98], [px + 0.06, py + 0.05, 1.8], [px + 0.05, py + 0.05, 1.46]], INK, 0.8, 0.7);
    // the levelled plate and the sensor's body
    E3.solid(E3.box(px - 0.09, px + 0.09, py - 0.09, py + 0.09, 1.95, 1.965), st(0.1, HUE.steel, 0.4), 1606);
    E3.solid(R11.cylinder([px, py], 0.045, 1.965, 1.985, 14), st(0.2, HUE.steel, 0.5), 1607);
    // the screen: a short white drum (its outline is the hull of its two rims), the top face bare paper
    const rimPts = (r, z) => R11.ring([px, py], r, z, 28).slice(0, 28).map(E3.proj);
    const top = rimPts(0.075, 2.025), drum = new P(this.hull(top.concat(rimPts(0.075, 1.975))), true), rim = new P(top, true);
    const bb = [Math.min(...drum.pts.map(p => p[0])), Math.min(...drum.pts.map(p => p[1])), Math.max(...drum.pts.map(p => p[0])), Math.max(...drum.pts.map(p => p[1]))];
    mask(drum); if (colr) fill(drum, '#F6F2E8', 0.5);
    hatch(drum, bb, Math.PI / 2, 2.2, 1, INK, 0.6, 0.16, 1609);
    mask(rim); stroke(drum, 1, INK, 1, 0.9); stroke(rim, 1, INK, 0.8, 0.85);
    // the glass domes, outer and inner, with the light on them
    const c = E3.proj([px, py, 2.025]), rr = Math.max(1.6, 0.026 * f / d), ri = 0.017 * f / d;
    const dome = new P(Array.from({ length: 19 }, (_, k) => { const t = Math.PI + k / 18 * Math.PI; return [c[0] + rr * Math.cos(t), c[1] + rr * 1.05 * Math.sin(t)]; }), true);
    mask(dome); fill(dome, colr ? HUE.sky : BLUE, 0.3); stroke(dome, 1, INK, 0.9, 0.9);
    if (ri > 1.2) stroke(new P(Array.from({ length: 13 }, (_, k) => { const t = Math.PI + k / 12 * Math.PI; return [c[0] + ri * Math.cos(t), c[1] + ri * 1.05 * Math.sin(t)]; })), 1, INK, 0.6, 0.7);
    disc(c[0] - rr * 0.35, c[1] - rr * 0.55, Math.max(0.6, rr * 0.2), '#FFFFFF', 0.85, 'source-over');
  },
});
