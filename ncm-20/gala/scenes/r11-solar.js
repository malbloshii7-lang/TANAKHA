'use strict';
// Revision 11 · the clean-energy record (B14b, after Shams 1): Al Dhafra Solar PV, Abu Dhabi, at the end of the day.
// 2 GW in a single phase (inaugurated 16 November 2023; at its inauguration the world's largest single-site solar
// plant): almost 4 million bifacial modules on single-axis trackers over more than 20 km² of desert, 35 km from the city.
// True 3D (engrave3d.js), metres: x east, y north, z up, the sand at z 0. The eye stands on an east-west service road
// inside the plant, looks south-south-west down an aisle between two rows, and cranes up from 2.5 m to 13 m, so the rows
// open out to the horizon; a pyranometer on its post by the road (NCM forecasts the sun for solar plants).
//   modules: a 2023 bifacial module is about 2.28 × 1.13 m; two deep in portrait, a strip 4.6 m across; 56 modules
//   along a tracker (four strings of 28), about 65 m; three trackers end to end make a block, 10 m service roads
//   between blocks, a wider north-south road every 36 rows; the torque tube (the axis, north-south) 2.5 m up on piles
//   about 8 m apart, the drive at the middle pile; rows 10.5 m apart (the sources give no pitch: a plausible one).
//   inverter/transformer stations stand in the roads (one per ~200 × 190 m, about 20 per km², as a 2 GW plant needs).
//   tracking: a tracker follows the sun up to about ±60°; at a low sun it backtracks (turns back toward flat so no row
//   shades the next, the standard on flat ground), so at this hour the rows lean west by 24° going to 17°, computed
//   from the sun below, and the shade of each row just meets the next: the aisles lie in shade, and the sun reaches
//   the sand in the roads and through the gaps between trackers, in long shadows.
//   sun: 16 November (the plant's inauguration date) at 24.2° N, altitude 14.5° sinking to 11°, azimuth 241-243°.
//   The disc is drawn about four times its true size (0.53°, 3 px through this lens), as an engraver would, so it reads.
scene({
  id: 'solar',
  start: 0, dur: 5,
  init() {
    const r = rng(1116);
    Object.assign(this, { PITCH: 10.5, WS: 4.6, HUB: 2.5, OFF: 0.15, MOD: 1.154, NM: 56, TG: 1.0, RD: 10 });
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
    // wheel ruts along the eye's road
    this.ruts = [];
    for (let k = 0; k < 160; k++) { const x = -60 + r() * 120, y = (r() < 0.5 ? -1.1 : 1.1) + (r() - 0.5) * 0.35; this.ruts.push([x, y, 0.6 + r() * 2.4]); }
    // sand ripples near the eye, the road's gravel, the desert beyond the plant
    this.ripples = Array.from({ length: 900 }, () => [r(), r(), r()]);
    this.gravel = Array.from({ length: 1400 }, () => [r(), r()]);
    this.dunes = Array.from({ length: 500 }, () => [r(), r(), r()]);
  },
  // this frame's sun (16 November at 24.2° N: its azimuth from its altitude) and the trackers' tilt
  sun(lt) {
    const D = Math.PI / 180, u = easeInOut(clamp((lt - 0.2) / 6)), alt = lerp(14.5, 11, u) * D, lat = 24.2 * D, dec = -18.8 * D;
    const az = TAU - Math.acos((Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat)));
    const s = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
    // backtracking: the true-tracking angle in the plane across the rows, turned back until the rows just clear
    const tT = Math.atan2(-s[0], s[2]), c = Math.cos(tT) / this.GCR;
    let th = Math.abs(c) < 1 ? tT - Math.sign(tT) * Math.acos(Math.abs(c)) : tT;
    th = clamp(th, -60 * D, 60 * D);
    const ct = Math.cos(th), st = Math.sin(th);
    this.S = s; this.alt = alt / D; this.az = az / D;
    this.T = { th, ct, st, n: [-st, 0, ct], nb: [st, 0, -ct], hw: this.WS / 2 };
    return s;
  },
  view(lt) {
    // in the aisle among the northern block's rows, eye height 2.45 m, looking out over the road to the southern
    // blocks; it rises to 10.5 m and draws back north along the aisle, with a slight turn toward the sun
    const D = Math.PI / 180, u = easeInOut(clamp((lt - 0.2) / 6));
    const C = [lerp(-0.3, 1.5, u), lerp(9.2, 15.5, u), lerp(2.45, 10.5, u)], az = lerp(212.5, 214, u) * D, pt = lerp(2.2, 10.5, u) * D;
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
    if (r[2] < 0) return HUE.hill;
    const el = Math.asin(clamp(r[2], -1, 1)), g = Math.acos(clamp(E3.dot(r, this.S), -1, 1));
    return this.mix(this.mix(HUE.sky, HUE.dawn, Math.exp(-el / 0.25) * 0.8), HUE.dawn, Math.exp(-g / 0.4) * 0.7);
  },
  // glass: a mirror at grazing angles (Fresnel), the dark cells behind it when seen steeply
  glass(p, front) {
    const C = E3.cam().C, v0 = E3.sub(p, C), l = Math.hypot(v0[0], v0[1], v0[2]), v = [v0[0] / l, v0[1] / l, v0[2] / l];
    const m = front ? this.T.n : this.T.nb, vm = E3.dot(v, m), cosi = clamp(-vm), F = 0.04 + 0.96 * Math.pow(1 - cosi, 5);
    const r = [v[0] - 2 * vm * m[0], v[1] - 2 * vm * m[1], v[2] - 2 * vm * m[2]];
    const B = F * this.skyLum(r) + (1 - F) * (front ? 0.12 : 0.2);
    return { tone: clamp(0.92 - B, 0.1, 0.86), col: this.mix(front ? HUE.deep : HUE.steel, this.skyCol(r), clamp(F * 1.4)), F };
  },
  // colour: the evening sky warming low toward the sun, the sand
  under(lt) {
    this.frame(lt);
    const q = easeInOut(prog(lt, 0, 0.8)), w = easeInOut(clamp((lt - 0.2) / 6)), B = R11.BOX, hy = this.hy;
    washFade([B[0], B[1] - 300, B[2], hy + 2], [[0, HUE.sky, 0.46], [0.55, HUE.sky, 0.3], [0.85, HUE.dawn, 0.18 + 0.1 * w], [1, HUE.rose, 0.3 + 0.12 * w]], 0, q);
    if (this.sp) {
      const [sx, sy] = this.sp, R = 300;
      ctx.save(); const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, R);
      g.addColorStop(0, `rgba(242,163,107,${0.5 + 0.15 * w})`); g.addColorStop(0.5, `rgba(242,163,107,${0.18 + 0.08 * w})`); g.addColorStop(1, 'rgba(242,163,107,0)');
      ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R); ctx.restore();
    }
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.dune, 0.42 + 0.08 * w], [0.12, HUE.sand, 0.36], [1, HUE.sand, 0.3 + 0.06 * w]], 0, q);
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
    const B = R11.BOX, hy = this.hy, sp = this.sp, bands = [[], [], [], [], []], k = OPT.colour ? 0.55 : 1;
    for (let y = B[1] + 2; y < hy - 3; y += 4.2) {
      const e = (hy - y) / (hy - B[1]);
      for (let x = B[0]; x < B[2]; x += 26) {
        const dsun = sp ? Math.hypot(x + 13 - sp[0], (y - sp[1]) * 1.6) : 1e4, open = 1 - Math.exp(-Math.pow(dsun / 190, 2));
        const a = (0.1 + 0.5 * Math.pow(e, 0.9)) * open * k;
        if (a > 0.02) bands[Math.min(4, Math.floor(a * 7))].push([x, y, x + 26]);
      }
    }
    bands.forEach((segs, i) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (i + 0.5) / 7; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.75;
      ctx.beginPath(); segs.forEach(([x0, y, x1]) => { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }); ctx.stroke(); ctx.restore();
    });
    // the sun: a plain disc, low in the south-west
    if (sp) {
      const [sx, sy] = sp, R = 12;
      mask(el(sx, sy, R + 3, R + 3, 0, TAU, 1161, 0));
      disc(sx, sy, R, OPT.colour ? '#F4C77E' : OCHRE, OPT.colour ? 0.9 : 0.55);
      stroke(el(sx, sy, R, R, 0, TAU, 1162, 0), 1, INK, 1.1, 0.7);
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
      out.push(new P(sp, true));
    };
    this.rows.forEach(w => {
      const ax = Math.abs(w.x - C[0]);
      if (ax > 900) return;
      this.blocks.forEach(b => {
        if (C[1] - b.y1 > 900 || b.y0 - C[1] > 900) return;
        b.units.forEach(([ya, yb]) => {
          const c4 = [this.corner(w.x, -hw, ya), this.corner(w.x, hw, ya), this.corner(w.x, hw, yb), this.corner(w.x, -hw, yb)];
          const q = c4.map(shp);
          q[1][0] += 0.3; q[2][0] += 0.3; // a hair of overlap, so the backtracked shadows close without seams
          toPath(q, shade);
          if (ax < 260 && C[1] - b.y1 < 260) toPath([[c4[0][0] - 0.5, ya, 0], [c4[1][0] + 0.5, ya, 0], [c4[2][0] + 0.5, yb, 0], [c4[3][0] - 0.5, yb, 0]], umbra);
        });
      });
    });
    const q = easeInOut(prog(lt, 0, 0.6));
    if (shade.length) {
      if (OPT.colour) { ctx.save(); ctx.beginPath(); shade.forEach(p => p.trace(ctx, 1)); ctx.globalAlpha = SA * 0.34 * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = HUE.steel; ctx.fill(); ctx.restore(); }
      hatch(shade, box, 0, 3.6, q, INK, 0.75, OPT.colour ? 0.26 : 0.32, 1170);
      // under the modules, inside the shade, the sand sees less of the sky
      if (umbra.length) { ctx.save(); ctx.beginPath(); shade.forEach(p => p.trace(ctx, 1)); ctx.clip(); hatch(umbra, box, 0.05, 2.7, q, INK, 0.7, OPT.colour ? 0.16 : 0.2, 1172); ctx.restore(); }
    }
    // the sand: ripples lying on the ground near the eye, the gravel of the road, its ruts and edges
    const segs = [];
    this.ripples.forEach(([a, b, c]) => {
      const x = C[0] - 70 + a * 140, y = C[1] - 80 + b * 100, l = 0.5 + c * 1.6, d = E3.depth([x, y, 0]);
      if (d > 1 && d < 90) segs.push([[x, y, 0], [x + l, y + 0.15, 0], 0.5 * R11.air(d, 60)]);
    });
    this.ruts.forEach(([x, y, l]) => segs.push([[x, y, 0], [x + l, y, 0], 0.45]));
    E3.segments(segs, INK, 0.8);
    const grav = [];
    this.gravel.forEach(([a, b]) => { const x = C[0] - 40 + a * 80, y = -2.6 + b * 5.2; grav.push([[x, y, 0], [x + 0.06, y, 0], 0.55]); });
    E3.segments(grav, INK, 1.1);
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
    // the far field first
    bands.forEach((segs, i) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (i + 0.5) / 9; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
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
    // pixels per metre here: the details thin out with distance
    const ppm = E3.cam().f / d;
    const glassSt = { n: front ? T.n : T.nb, tone: g.tone, shade: 0, hdir: [0, 1, 0], lw: 1.1, edgeA: 0.85 * a,
      fillCol: OPT.colour ? g.col : INK, fillA: OPT.colour ? 0.62 : 0.1 + 0.25 * g.tone, noHatch: ppm < 6 };
    const under = () => this.understructure(xr, ya, yb, y0, y1, d, ppm, front, seed);
    if (front) under();
    E3.face(quad, glassSt, seed);
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
  // an inverter and transformer station on its pad in a road, with its long shadow
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
    const [px, py] = this.PYR, s = this.S, colr = OPT.colour, d = E3.depth([px, py, 1.9]);
    const st = (tone, fc, fa = 0.5) => ({ tone, shade: 0.5, lw: 1.1, edgeA: 0.9, fillCol: colr ? fc : null, fillA: fa, noHatch: tone < 0.05 });
    // its shadow on the sand
    const sh = z => [px - s[0] * z / s[2], py - s[1] * z / s[2], 0];
    E3.line([[px, py, 0], sh(1.95)], INK, 1.4, 0.35);
    E3.solid(E3.box(px - 0.2, px + 0.2, py - 0.2, py + 0.2, 0, 0.12), st(0.08, '#D9D0C0', 0.5), 1600);
    E3.solid(R11.cylinder([px, py], 0.03, 0.12, 1.95, 10), st(0.12, HUE.steel, 0.4), 1601);
    // the logger box on the post's north side, with its door
    E3.solid(E3.box(px - 0.15, px + 0.15, py + 0.035, py + 0.19, 1.05, 1.45), st(0.04, '#EFE9DC', 0.6), 1602);
    E3.line([[px - 0.12, py + 0.192, 1.08], [px + 0.12, py + 0.192, 1.08], [px + 0.12, py + 0.192, 1.42], [px - 0.12, py + 0.192, 1.42], [px - 0.12, py + 0.192, 1.08]], INK, 0.8, 0.6);
    // the levelled plate and the up-facing pyranometer: body, sun screen, the glass domes
    E3.solid(E3.box(px - 0.09, px + 0.09, py - 0.09, py + 0.09, 1.95, 1.965), st(0.1, HUE.steel, 0.4), 1606);
    E3.solid(R11.cylinder([px, py], 0.045, 1.965, 2.005, 14), st(0.2, HUE.steel, 0.5), 1607);
    E3.solid(R11.cylinder([px, py], 0.075, 1.975, 2.025, 20), st(0.02, '#F6F2E8', 0.8), 1608);
    const c = E3.proj([px, py, 2.025]), rr = 0.026 * E3.cam().f / d, ri = 0.017 * E3.cam().f / d;
    const dome = new P(Array.from({ length: 19 }, (_, k) => { const t = Math.PI + k / 18 * Math.PI; return [c[0] + rr * Math.cos(t), c[1] + rr * 1.05 * Math.sin(t)]; }), true);
    mask(dome); fill(dome, colr ? HUE.sky : BLUE, 0.28); stroke(dome, 1, INK, 1, 0.9);
    stroke(new P(Array.from({ length: 13 }, (_, k) => { const t = Math.PI + k / 12 * Math.PI; return [c[0] + ri * Math.cos(t), c[1] + ri * 1.05 * Math.sin(t)]; })), 1, INK, 0.7, 0.7);
    disc(c[0] - rr * 0.35, c[1] - rr * 0.55, Math.max(0.6, rr * 0.18), '#FFFFFF', 0.8, 'source-over');
    // the cables down to the logger
    E3.line([[px + 0.04, py + 0.02, 1.98], [px + 0.06, py + 0.05, 1.8], [px + 0.05, py + 0.05, 1.46]], INK, 0.8, 0.7);
  },
});
