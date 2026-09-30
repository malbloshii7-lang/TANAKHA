'use strict';
// Revision 11 · Jebel Ali in its might: a container quay seen from high over the harbour, a line of ship-to-shore cranes
// over four ultra-large container ships berthed nose to tail, the stacked yard behind running to the horizon; the eye
// rises from about 150 to 220 m as the beat goes on, so the yard opens out behind the line. True 3D (engrave3d.js),
// metres: x along the quay, y inland (the water is y < 0, the quay face at y 0), z up, the harbour surface at z 0.
// Sizes from the class of ship and crane that works the port (research notes, 30 Sep 2026):
//   ship: 400 m long, 61 m beam (the 24,000 TEU class that has called since 2020), main deck 18 m above the water at this
//   draught; the deckhouse set well forward (0.72 of her length from the stern) with its wheelhouse and full-beam wings
//   about 40 m over the deck, the engine casing and funnel separate and further aft; 40-foot bays (12.2 m) with lashing
//   bridges between, 24 rows across, up to 11 tiers on deck (2.59 m a box). Plain hulls and boxes: no livery, no names.
//   crane (Terminal 3's, as DP World specified them): 69.5 m lifting height, a reach across ships 25 containers wide
//   (the trolley runs out to the outboard row, the boom tip 7 m beyond it), 30.5 m between rails, a 20 m backreach, the
//   apex of each of its two A-frames about 104 m up; idle, the boom stands raised, its tip about 150 m up (DP World: over
//   138 m at full boom extension). Yard blocks run parallel to the quay, 5-6 high, 10 wide, under rail-mounted gantries.
// Painted in three layers, as the eye (always above every boom) sees them: everything landward of the quay face, then the
// ships and craft, then the lowered booms over the ships with their stays, trolleys, spreaders and loads.
// 2026: no smoke, haze, glow or fire-like light anywhere; no red (boxes and craft in ochre, blue, sepia, steel, sea, sand).
scene({
  id: 'jebelali',
  start: 0, dur: 8.333,
  init() {
    const r = rng(1107);
    const QZ = 4.5; // the quay deck above the water
    Object.assign(this, { QZ, YW: 4, YL: 34.5, ZG: QZ + 71, ZT: QZ + 75, ZA: 104, REACH: 72, YLANE: 19, CYC: 7.2 });
    // the hull's lines: stations [s at the deck, half-breadth at the deck, s at the waterline, half-breadth there], s from the
    // stern (0) to the stem (400); the counter overhangs the waterline aft, and the bow flares over a finer waterline
    this.ST = [[0, 23, 12, 12], [5, 26.5, 18, 21], [14, 29.2, 28, 27.5], [28, 30.5, 45, 30.5], [300, 30.5, 292, 30.5], [328, 30, 318, 28.2],
      [350, 28, 338, 23.5], [368, 24.5, 354, 17], [382, 19.5, 366, 10.5], [392, 13.5, 375, 5], [398, 6.5, 381, 1.5], [400, 0, 383, 0]];
    // four ships along the quay; bow +1 points along +x
    this.ships = [[-120, 400, -1], [320, 400, 1], [770, 366, -1], [1190, 400, 1]].map(([x0, L, bow], i) => this.ship(x0, L, bow, r, i));
    // the cranes: six or seven working each ship over its bays (never over the deckhouse or the funnel), idle ones with the
    // boom raised between the berths, and the line running on beyond the last ship
    this.cranes = [];
    [6, 7, 6, 6].forEach((n, i) => {
      const s = this.ships[i], nb = s.bays.length, used = [];
      for (let k = 0; k < n; k++) {
        let j = Math.round((k + 0.5) * nb / n - 0.5);
        while (used.some(u => Math.abs(s.bays[u].xc - s.bays[j].xc) < 40) && j < nb - 1) j++;
        used.push(j);
        const b = s.bays[j], row = k % 2 === 0 ? 0 : Math.floor(r() * 18);
        this.cranes.push({ x: b.xc, raised: false, ship: s, bay: b, row, ph: (k * 0.37 + i * 0.21 + r() * 0.12) % 1 });
      }
    });
    [-175, 300, 745, 1163, 1650, 1725, 1805, 1890, 1975, 2060, 2150, 2240, 2330, 2420].forEach(x => this.cranes.push({ x, raised: true, ph: 0 }));
    this.cranes.forEach((c, i) => { c.i = i; c.parts = this.crane(c.x, c.raised); });
    // the yard: long even blocks parallel to the quay, 10 boxes wide (25 m), 5-6 high, in runs of boxes of one kind, a
    // rail-mounted gantry over each block
    this.yard = [];
    for (let row = 0; row < 9; row++) for (let bx = -520; bx < 3900; bx += 290) {
      const y0 = 82 + row * 40, segs = [];
      for (let x = bx; x < bx + 261;) { const x1 = Math.min(bx + 262, x + (3 + Math.floor(r() * 4)) * 12.5); segs.push({ x0: x, x1, z1: QZ + 2.59 * (r() < 0.12 ? 4 : r() < 0.55 ? 5 : 6), col: r() }); x = x1; }
      this.yard.push({ x0: bx, x1: bx + 262, y0, y1: y0 + 25, segs, gx: bx + 25 + r() * 210 });
    }
    // the free zone's low sheds on the far ground
    this.sheds = [];
    for (let k = 0; k < 60; k++) { const x0 = -500 + (k % 30) * 150 + r() * 50, y0 = 520 + Math.floor(k / 30) * 260 + r() * 120; this.sheds.push({ x0, x1: x0 + 60 + r() * 70, y0, y1: y0 + 40 + r() * 60, z1: 10 + r() * 10 }); }
    // a harbour tug transiting the basin toward the eye, and a pilot boat crossing further out
    this.tugs = [{ x: 470, y: -168, head: Math.PI + 0.03, v: 4.2, L: 32, B: 12 }, { x: 980, y: -330, head: 0.35, v: 6, L: 17, B: 5.2, pilot: true }];
    // the harbour: fixed marks on the water, laid out once from the camera at mid-beat (rows closing up toward the far water),
    // over more than the picture so the rise never runs out of them, then projected every frame
    const cam = this.view(5.2), hz = E3.projDir([cam.F[0], cam.F[1], 0])[1];
    this.sea = [];
    for (let y = hz + 1.4; y < 1560;) {
      const f = clamp((y - hz) / 800), gap = 1.7 + 6.4 * Math.pow(f, 0.9);
      for (let x = -360 + r() * 20; x < 1480;) {
        const len = 5 + r() * (8 + 30 * f), g = 3 + r() * (10 + 14 * f), xm = x + len / 2;
        const d = [0, 1, 2].map(i => cam.F[i] + cam.R[i] * (xm - cam.cx) / cam.f - cam.U[i] * (y - cam.cy) / cam.f);
        if (d[2] < -1e-4) {
          const t = -cam.C[2] / d[2], p = [cam.C[0] + d[0] * t, cam.C[1] + d[1] * t], dep = t * (d[0] * cam.F[0] + d[1] * cam.F[1] + d[2] * cam.F[2]);
          if (p[1] < -1.2 && dep > 60) this.sea.push([p[0], p[1], len / 2 * dep / cam.f, r(), dep]);
        }
        x += len + g;
      }
      y += gap * (0.8 + 0.4 * r());
    }
    this.R0 = [cam.R[0], cam.R[1]];
  },
  // one ship: the hull lofted from its stations, the boot-top face by face, the deck, the bays, the deckhouse and the casing
  ship(x0, L, bow, r, idx) {
    const D = 18, k = L / 400, YC = -33.5, s = { x0, L, bow, idx, D, YC };
    s.X = t => bow > 0 ? x0 + t : x0 + L - t;
    s.P = (t, w, z) => [s.X(t), YC + w, z];
    s.box = (t0, t1, w0, w1, z0, z1) => E3.box(Math.min(s.X(t0), s.X(t1)), Math.max(s.X(t0), s.X(t1)), YC + w0, YC + w1, z0, z1);
    const ST = this.ST.map(q => [q[0] * k, q[1], q[2] * k, q[3]]);
    s.hb = t => { for (let i = 1; i < ST.length; i++) if (t <= ST[i][0]) return lerp(ST[i - 1][1], ST[i][1], (t - ST[i - 1][0]) / (ST[i][0] - ST[i - 1][0])); return 0; };
    const ring = (si, bi, z) => { const p = []; ST.forEach(q => p.push(s.P(q[si], -q[bi], z))); ST.slice().reverse().forEach(q => { if (q[bi] > 0) p.push(s.P(q[si], q[bi], z)); }); return p; };
    s.dk = ring(0, 1, D); s.wl = ring(2, 3, 0);
    const n = s.wl.length, tb = 3 / D;
    s.hull = []; s.boot = []; s.hn = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, f = [s.wl[i], s.wl[j], s.dk[j], s.dk[i]];
      s.hull.push(f); s.hn.push(this.hullN(f, s));
      const m = p => q => [lerp(p[0], q[0], tb), lerp(p[1], q[1], tb), 3];
      s.boot.push([s.wl[i], s.wl[j], m(s.wl[j])(s.dk[j]), m(s.wl[i])(s.dk[i])]);
    }
    // the deckhouse well forward, the engine casing and funnel aft of midships, the bays in three runs between them
    const sb = 0.72 * L, sf = 0.155 * L;
    s.sb = sb; s.sf = sf;
    s.bays = [];
    const run = (a0, a1, tiers) => {
      const nb = Math.floor((a1 - a0 + 1.4) / 13.6), off = (a1 - a0 + 1.4 - nb * 13.6) / 2;
      for (let m = 0; m < nb; m++) {
        const a = a0 + off + m * 13.6, b = a + 12.2, hw = Math.min(s.hb(a), s.hb(b)) - 0.7;
        const edges = [-29.28, -17.08, -4.88, 4.88, 17.08, 29.28], base = tiers(a, b), cells = [];
        for (let c = 0; c < 5; c++) {
          const wa = Math.max(edges[c], -hw), wb = Math.min(edges[c + 1], hw);
          if (wb - wa < 2.4) continue;
          const t = Math.max(3, Math.min(11, Math.round(base - r() * 2.2 - (c === 0 || c === 4 ? r() * 1.4 : 0))));
          cells.push({ wa, wb, z1: D + 1 + 2.59 * t, col: r() });
        }
        const xa = s.X(a), xb = s.X(b);
        s.bays.push({ a, b, xa: Math.min(xa, xb), xb: Math.max(xa, xb), xc: (xa + xb) / 2, cells });
      }
    };
    // (the bays either side of the deckhouse and the casing stow lower, so both stand clear of the stacks)
    const near = (a, b, c) => Math.min(Math.abs(a - c), Math.abs(b - c)) < 22;
    run(9 * k, sf - 12.5, (a, b) => 8.5 + r());
    run(sf + 12.5, sb - 9.5, (a, b) => near(a, b, sf) || near(a, b, sb) ? 8.6 : 10 + r() * 1.5);
    run(sb + 9.5, L - 31 * k, (a, b) => near(a, b, sb) ? 8.4 : 9.8 - 4.2 * (a - sb) / (L - sb));
    // the deckhouse: the house to D+37, the wheelhouse on it to D+41, its wings the full beam; a mast over it
    s.house = s.box(sb - 7, sb + 7, -13, 13, D, D + 37);
    s.wheel = s.box(sb - 6, sb + 6.5, -15.5, 15.5, D + 37, D + 41);
    s.wings = s.box(sb + 2, sb + 6.5, -30.4, 30.4, D + 38, D + 40.6);
    s.mast = [s.P(sb - 1, 0, D + 41), s.P(sb - 1, 0, D + 49)];
    // the engine casing to D+34, the funnel on it to D+40
    s.casing = s.box(sf - 10, sf + 10, -11, 11, D, D + 34);
    s.funnel = s.box(sf - 5.5, sf + 4, -6, 6, D + 34, D + 40);
    // the forecastle's breakwater and the foremast
    const sw = L - 29 * k;
    s.bwater = s.box(sw, sw + 1.2, -s.hb(sw) + 1, s.hb(sw) - 1, D, D + 6);
    s.fmast = [s.P(L - 12 * k, 0, D), s.P(L - 12 * k, 0, D + 17)];
    return s;
  },
  // a hull face's outward normal: its own plane, turned away from her centreline (at the transom, toward her stern)
  hullN(f, s) {
    const nn = [0, 0, 0];
    for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length]; nn[0] += (a[1] - b[1]) * (a[2] + b[2]); nn[1] += (a[2] - b[2]) * (a[0] + b[0]); nn[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    const l = Math.hypot(nn[0], nn[1], nn[2]) || 1, c = E3.centroid(f);
    let out = [0, c[1] - s.YC, 0];
    if (Math.abs(out[1]) < 1) out = [c[0] < s.x0 + s.L / 2 ? -1 : 1, 0, 0];
    const sg = nn[0] * out[0] + nn[1] * out[1] >= 0 ? 1 : -1;
    return [sg * nn[0] / l, sg * nn[1] / l, sg * nn[2] / l];
  },
  // one ship-to-shore crane at x: legs and bogies, sills and braces, portal beams, the girder and backreach, the machinery
  // house, two A-frames (each a front strut from the waterside leg head and a back strut from the landside one, meeting over
  // the waterside rail) with a cross-beam at the apex, back stays; the boom lowered over the ship, or raised when idle
  crane(xc, raised) {
    const { QZ, YW, YL, ZG, ZT, ZA, REACH } = this, c = { xc, raised };
    c.legs = [[-9, YW], [9, YW], [-9, YL], [9, YL]].map(([dx, y]) => ({ p: [xc + dx, y, (QZ + ZG) / 2], f: E3.box(xc + dx - 1.3, xc + dx + 1.3, y - 1.3, y + 1.3, QZ, ZG), bog: E3.box(xc + dx - 3.4, xc + dx + 3.4, y - 1.1, y + 1.1, QZ, QZ + 2.4) }));
    c.sides = [-9, 9].map(dx => ({ p: [xc + dx, (YW + YL) / 2, QZ + 30], m: [[[xc + dx, YW, QZ + 16], [xc + dx, YL, QZ + 16]], [[xc + dx, YW, QZ + 16], [xc + dx, YL, ZG - 4]], [[xc + dx, YL, QZ + 16], [xc + dx, YW, ZG - 10]]] }));
    c.cross = [YW, YL].map(y => ({ p: [xc, y, ZG - 1.5], f: E3.box(xc - 10.3, xc + 10.3, y - 1.2, y + 1.2, ZG - 3, ZG) }));
    c.girder = E3.box(xc - 6, xc + 6, YW, YL + 20, ZG, ZT);
    c.house = E3.box(xc - 6.5, xc + 6.5, YL + 3, YL + 16, ZT, ZT + 6.5);
    const yA = YW + 5;
    c.aframe = [-9, 9].map(dx => [[[xc + dx, YW, ZT], [xc + dx, yA, ZA]], [[xc + dx, YL, ZT], [xc + dx, yA, ZA]]]);
    c.apexBeam = E3.box(xc - 9.6, xc + 9.6, yA - 0.8, yA + 0.8, ZA - 1.6, ZA);
    c.backstays = [-6, 6].map(dx => [[xc + dx * 1.5, yA, ZA], [xc + dx, YL + 20, ZT]]);
    const ang = raised ? 80 * Math.PI / 180 : 0, u = [0, -Math.cos(ang), Math.sin(ang)], nrm = [0, -Math.sin(ang), -Math.cos(ang)];
    // a boom point: d along it from the hinge, h down through its depth, dx across
    const P4 = (d, h, dx) => [xc + dx, YW + u[1] * d + nrm[1] * h, ZT + u[2] * d + nrm[2] * h];
    c.P4 = P4;
    // the boom: a box girder 7 m across at the hinge narrowing to 5 m at the tip, 4 m deep narrowing to 3 m
    const w0 = 3.5, w1 = 2.5, h0 = 4, h1 = 3;
    c.boom = [[P4(0, 0, -w0), P4(REACH, 0, -w1), P4(REACH, 0, w1), P4(0, 0, w0)], [P4(0, h0, -w0), P4(REACH, h1, -w1), P4(REACH, h1, w1), P4(0, h0, w0)],
      [P4(0, 0, -w0), P4(REACH, 0, -w1), P4(REACH, h1, -w1), P4(0, h0, -w0)], [P4(0, 0, w0), P4(0, h0, w0), P4(REACH, h1, w1), P4(REACH, 0, w1)],
      [P4(REACH, 0, -w1), P4(REACH, 0, w1), P4(REACH, h1, w1), P4(REACH, h1, -w1)], [P4(0, 0, -w0), P4(0, 0, w0), P4(0, h0, w0), P4(0, h0, -w0)]];
    // the forestays: from each apex to its own edge of the boom, at 45 and 88 per cent of the reach
    c.stays = [-1, 1].flatMap(sg => [0.45, 0.88].map(t => [[xc + sg * 9, yA, ZA], P4(REACH * t, 0, sg * lerp(w0, w1, t))]));
    c.tip = P4(REACH, 0, 0); c.mid = P4(REACH / 2, 0, 0);
    return c;
  },
  // the trolley, spreader and load of a working crane at scene time lt. One move (about 90 s in life; time runs about 12x
  // here so a whole move reads in the beat): out over the ship, down to the stack under the trolley, up with the box, back
  // over the quay, down to a truck in the lane under the portal, release, up again
  move(c, lt) {
    const { QZ, ZT, YLANE } = this, ph = (((lt - 0.9) / this.CYC + c.ph) % 1 + 1) % 1;
    const yPick = c.ship.YC - 29.28 + 1.22 + 2.44 * c.row;
    const cell = c.bay.cells.find(q => yPick - c.ship.YC >= q.wa - 0.01 && yPick - c.ship.YC <= q.wb + 0.01) || c.bay.cells[0];
    const zPick = cell.z1, zTr = QZ + 63, zTruck = QZ + 4.1;
    const seg = (a, b) => easeInOut(prog(ph, a, b - a));
    let y = YLANE, z = zTr;
    if (ph < 0.16) y = lerp(YLANE, yPick, seg(0, 0.16));
    else if (ph < 0.45) { y = yPick; z = ph < 0.3 ? lerp(zTr, zPick, seg(0.16, 0.28)) : lerp(zPick, zTr, seg(0.33, 0.45)); }
    else if (ph < 0.61) y = lerp(yPick, YLANE, seg(0.45, 0.61));
    else z = ph < 0.77 ? lerp(zTr, zTruck, seg(0.61, 0.74)) : lerp(zTruck, zTr, seg(0.79, 0.9));
    const load = ph >= 0.29 && ph < 0.755;
    // the truck: drives in under the portal, takes the box, drives off along the lane
    let truck = null;
    if (ph > 0.35 && ph < 0.98) {
      const tx = ph < 0.6 ? lerp(c.x - 46, c.x, easeOut(prog(ph, 0.35, 0.25))) : c.x + 46 * Math.pow(prog(ph, 0.77, 0.21), 1.6);
      truck = { x: tx, a: clamp((ph - 0.35) / 0.06) * clamp((0.98 - ph) / 0.06), box: ph >= 0.755 };
    }
    return { y, z, load, truck, col: cell.col };
  },
  // this frame's camera, and where the horizon and the quay edge fall on screen (the washes and the water follow them)
  frame(lt) {
    const cam = this.view(lt), B = R11.BOX;
    this.cam = cam;
    this.hz = E3.projDir([cam.F[0], cam.F[1], 0])[1];
    const qa = E3.proj([cam.C[0] + 60, 0, 0]), qb = E3.proj([60000, 0, 0]), la = E3.proj([cam.C[0] + 60, 0, this.QZ]), lb = E3.proj([60000, 0, this.QZ]);
    const ext = (a, b, X) => [X, b[1] + (a[1] - b[1]) * (X - b[0]) / (a[0] - b[0])];
    const w0 = ext(qa, qb, B[0] - 400), l0 = ext(la, lb, B[0] - 400);
    this.land = new P([l0, lb, [B[2] + 400, this.hz], [B[2] + 400, this.hz - 1], [B[0] - 400, this.hz - 1]], true);
    this.water = new P([w0, qb, [B[2] + 400, this.hz], [B[2] + 400, B[3] + 400], [B[0] - 400, B[3] + 400]], true);
  },
  // colour: a clear, cool sky, pale toward the horizon; the land a sand wash; the harbour deepening toward the eye
  under(lt) {
    this.frame(lt);
    const hy = this.hz, B = R11.BOX;
    washFade([B[0], B[1] - 60, B[2], hy + 2], [[0, HUE.sky, 0.56], [0.6, HUE.sky, 0.36], [1, HUE.sky, 0.12]], 0, 1);
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sand, 0.16], [0.4, HUE.sand, 0.24], [1, HUE.sand, 0.3]], 0, 1, this.land);
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sea, 0.3], [0.3, HUE.sea, 0.46], [1, HUE.deep, 0.58]], 0, 1, this.water);
  },
  // high over the harbour off the first ship's bow, looking along the line and down about 20-24 degrees; over the beat the
  // eye rises from 150 to 220 m (always well above the booms) and draws back a little, so the yard opens out behind
  view(lt) {
    const q = clamp((lt - 0.6) / 9.2), u = 0.6 * q + 0.4 * easeInOut(q);
    const X = lerp(-390, -330, u), Y = lerp(-235, -300, u), Z = lerp(150, 220, u);
    const hd = lerp(22.5, 24, u) * Math.PI / 180, pt = lerp(20, 24, u) * Math.PI / 180;
    const F = [Math.cos(pt) * Math.cos(hd), Math.cos(pt) * Math.sin(hd), -Math.sin(pt)];
    return E3.camera([X, Y, Z], [X + F[0] * 100, Y + F[1] * 100, Z + F[2] * 100], 1000, 560, 640);
  },
  draw(lt) {
    const QZ = this.QZ;
    // late morning: the sun high over the harbour to the right of the eye, so the seaward faces are lit, the faces toward the
    // eye in shade, and the shadows fall back toward the quay
    E3.sunAt(140, 42);
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX;
      const ink = x => easeOut(prog(lt, 0.15 + clamp((x + 200) / 2600) * 1.3, 0.7)); // the plate inks in along the quay
      this.drawSky(lt);
      // the far ground to the horizon
      stroke(new P([[B[0], this.hz], [B[2], this.hz]]), 1, INK, 0.9, 0.45);
      this.drawFarLand(lt);
      this.drawSea(lt);
      const L1 = [], L2 = [], L3 = [];
      // (1) landward of the quay face, far to near: the sheds, the yard, the quay, the cranes' structure
      this.sheds.forEach((b, k) => {
        const d = R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, QZ]);
        L1.push({ d, draw: () => R11.faded(ink(b.x0) * 0.85, () => {
          const a = R11.air(d, 1800);
          E3.solid(E3.box(b.x0, b.x1, b.y0, b.y1, QZ, QZ + b.z1), { tone: 0.05, shade: 0.45, lw: 0.8, edgeA: 0.6 * a, noHatch: d > 1600, fillCol: OPT.colour ? HUE.sand : SEPIA, fillA: OPT.colour ? 0.22 : 0.08 }, 3000 + k);
        }) });
      });
      this.yard.forEach((b, k) => {
        const d = R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, QZ]);
        L1.push({ d, draw: () => R11.faded(ink(b.x0), () => this.drawBlock(b, d, k)) });
      });
      L1.push({ d: 1e6, draw: () => R11.faded(easeInOut(prog(lt, 0.1, 0.8)), () => this.drawQuay(lt)) });
      this.cranes.forEach(c => {
        const d = R11.dep([c.x, 19, QZ + 40]), mv = c.raised ? null : this.move(c, lt);
        c.mv = mv;
        L1.push({ d, draw: () => R11.faded(ink(c.x), () => this.craneFrame(c, d, lt)) });
        L3.push({ d: R11.dep(c.parts.mid), draw: () => R11.faded(ink(c.x), () => this.craneBoom(c, lt)) });
      });
      // (2) the ships and the craft
      this.ships.forEach(s => {
        const d = R11.dep([s.x0 + s.L / 2, -34, 10]);
        L2.push({ d, draw: () => R11.faded(ink(s.x0 + s.L / 2), () => this.drawShip(s, lt, d)) });
      });
      this.tugs.forEach((t, k) => {
        const p = this.tugAt(t, lt);
        L2.push({ d: R11.dep([p[0], p[1], 3]), draw: () => R11.faded(easeOut(prog(lt, 1.0 + k * 0.3, 0.6)), () => this.drawTug(t, p, lt, k)) });
      });
      L1.forEach(o => { o.d += 5000; }); L3.forEach(o => { o.d -= 5000; });
      R11.paint(L1.concat(L2, L3));
    });
    E3.sunAt();
  },
  // the sky: an engraver's ruling, close and dark overhead, opening toward the clear horizon
  drawSky(lt) {
    const B = R11.BOX, hy = this.hz;
    let y = B[1] + 1.5, k = 0;
    while (y < hy - 2) {
      const u = (y - B[1]) / Math.max(1, hy - B[1]);
      stroke(pl([[B[0], y], [B[2], y]], false, 3100 + k, 0.35), 1, OPT.colour ? HUE.deep : BLUE, 0.7, (OPT.colour ? 0.14 : 0.3) * (1 - 0.8 * u));
      y += 2.6 + 5 * u * u; k++;
    }
  },
  // the ground beyond the yard and the sheds, flat to the horizon: long light rulings, closing up with distance
  drawFarLand(lt) {
    const segs = [];
    for (let y = 520; y < 9000; y *= 1.075) {
      const al = 0.08 + 0.2 * R11.air(R11.dep([900, y, 0]), 3000);
      segs.push([[-800, y, 0], [7000, y, 0], al]);
    }
    E3.segments(segs, SEPIA, 0.6);
  },
  // the water: short strokes lying on the surface along the eye's right hand, closing up toward the far water and darker
  // toward the eye; darker still in each hull's reflection under her side and in the shadows cast on the water
  drawSea(lt) {
    const R0 = this.R0, shade = this.shadowPolys(), refl = this.reflPolys();
    const inAny = (p, list) => list.some(q => p[0] >= q.bb[0] && p[0] <= q.bb[2] && p[1] >= q.bb[1] && p[1] <= q.bb[3] && this.inPoly(p[0], p[1], q.p));
    const wk = TAU / 60, dir = [Math.sin(250 * Math.PI / 180), Math.cos(250 * Math.PI / 180)], om = TAU / 6.2;
    const base = [], dark = [], q = easeInOut(prog(lt, 0.2, 1.0)), hz = this.hz;
    this.sea.forEach(([x, y, h, ph, dist]) => {
      const c = E3.proj([x, y, 0]);
      if (c[1] < hz + 1.5 || c[0] < 16 || c[0] > 1104 || c[1] > 1100) return;
      const d = E3.depth([x, y, 0]);
      if (d < 60) return;
      const a0 = [x - R0[0] * h, y - R0[1] * h, 0], b0 = [x + R0[0] * h, y + R0[1] * h, 0];
      const sw = 0.5 + 0.5 * Math.cos(wk * (dir[0] * x + dir[1] * y) - om * lt + ph * 1.3);
      const al = q * (0.18 + 0.82 * Math.exp(-d / 900)) * (0.45 + 0.55 * sw) * (0.8 + 0.35 * ph);
      if (inAny(c, shade)) { dark.push([a0, b0, Math.min(1, al * 1.2 + 0.4 * q)]); return; }
      if (inAny(c, refl)) { dark.push([a0, b0, Math.min(1, al * 1.1 + 0.3 * q)]); return; }
      base.push([a0, b0, al]);
    });
    if (OPT.colour) { shade.forEach(o => wash(new P(o.p, true), HUE.deep, 0.22 * q)); refl.forEach(o => wash(new P(o.p, true), HUE.deep, 0.16 * q)); }
    else { base.forEach(o => { o[2] = Math.min(1, o[2] * 1.25); }); }
    this.segs(base, OPT.colour ? HUE.deep : BLUE, 1);
    this.segs(dark, INK, 1.05);
  },
  // many short world segments in one stroke per alpha step (as E3.segments, in finer steps)
  segs(list, col, lw, nb = 12) {
    const bands = Array.from({ length: nb }, () => []);
    list.forEach(([a, b, al]) => { if (al <= 0.02) return; const s = E3.clipSeg(a, b); if (s) bands[Math.min(nb - 1, Math.floor(al * nb))].push(s); });
    bands.forEach((g, k) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * (k + 0.5) / nb; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); g.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  },
  inPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  },
  hull2(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); });
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  },
  poly(sp) { return { p: sp, bb: [Math.min(...sp.map(q => q[0])), Math.min(...sp.map(q => q[1])), Math.max(...sp.map(q => q[0])), Math.max(...sp.map(q => q[1]))] }; },
  // each hull mirrored in the water under her side (the lower part of her side, broken by the ripples)
  reflPolys() {
    return this.ships.map(s => this.poly(this.hull2(s.dk.concat(s.wl).map(p => E3.proj([p[0], p[1], -p[2] * 0.85])))));
  },
  // the shadows the sun throws on the water: each ship's hull and stacks, the tug's hull, carried down the rays to the sea
  shadowPolys() {
    const S = E3.sun(), sh = p => E3.proj([p[0] - p[2] * S[0] / S[2], p[1] - p[2] * S[1] / S[2], 0]), out = [];
    this.ships.forEach(s => {
      const pts = s.dk.concat(s.wl).map(sh);
      s.bays.forEach(b => b.cells.forEach(c => { [b.xa, b.xb].forEach(x => [c.wa, c.wb].forEach(w => pts.push(sh([x, s.YC + w, c.z1])))); }));
      [s.house, s.wings, s.casing, s.funnel].forEach(f => f[1].forEach(p => pts.push(sh(p))));
      out.push(this.poly(this.hull2(pts)));
    });
    return out;
  },
  // the quay: its face and deck edge along the whole line, the fenders, the crane rails and the lanes on the apron
  drawQuay(lt) {
    const QZ = this.QZ, x0 = -900, x1 = 9000;
    E3.face([[x0, 0, 0], [x1, 0, 0], [x1, 0, QZ], [x0, 0, QZ]], { n: [0, -1, 0], tone: 0.3, shade: 0.35, hdir: [0, 0, 1], lw: 1.2, fillCol: OPT.colour ? '#CFC6B3' : null, fillA: 0.4 }, 3900);
    E3.line([[x0, 0, QZ], [x1, 0, QZ]], INK, 1.5, 0.85);
    E3.line([[x0, 0, 0], [x1, 0, 0]], INK, 1.0, 0.6);
    const segs = [];
    [this.YW, this.YL].forEach(y => segs.push([[x0, y - 0.8, QZ], [x1, y - 0.8, QZ], 0.5], [[x0, y + 0.8, QZ], [x1, y + 0.8, QZ], 0.5]));
    [10.5, 16.5, 22.5, 28.5, 62, 70].forEach(y => segs.push([[x0, y, QZ], [x1, y, QZ], 0.22]));
    for (let x = x0; x < 3000; x += 16) segs.push([[x, -0.05, QZ - 0.3], [x, -0.05, 0.6], 0.55]); // the fenders on the face
    E3.segments(segs, INK, 0.8);
  },
  // a yard block: its runs of boxes far to near, the rows and the box ends on the faces toward the eye, its gantry
  drawBlock(b, d, k) {
    const QZ = this.QZ, a = R11.air(d, 2200), near = d < 1100;
    const cols = OPT.colour ? [HUE.steel, HUE.sea, HUE.sand, HUE.steel, HUE.cloud, SEPIA] : [OCHRE, BLUE, SEPIA, INK, BLUE, SEPIA];
    const g0 = b.gx, zz = QZ + 24;
    // the gantry's legs on the far rail first
    [g0 - 5, g0 + 5].forEach(x => R11.member([x, b.y1 + 3, QZ], [x, b.y1 + 3, zz], 1, 0.6 * a));
    const segs = (d < 2000 ? b.segs : [{ x0: b.x0, x1: b.x1, z1: QZ + 2.59 * 5.5, col: b.segs[0].col }]).slice().sort((p, q) => R11.dep([q.x0, b.y0, QZ]) - R11.dep([p.x0, b.y0, QZ]));
    segs.forEach((s, i) => {
      const cc = cols[Math.floor(s.col * cols.length)];
      E3.solid(E3.box(s.x0, s.x1, b.y0, b.y1, QZ, s.z1), { tone: 0.05, shade: 0.5, lw: 0.9, edgeA: 0.75 * a, fillCol: cc, fillA: (OPT.colour ? 0.34 : 0.14) * (0.5 + 0.5 * a), noHatch: !near }, 3100 + k * 11 + i);
      if (d < 1600) {
        const L = [];
        for (let z = QZ + 2.59; z < s.z1 - 0.1; z += 2.59) L.push([[s.x0, b.y0 - 0.02, z], [s.x1, b.y0 - 0.02, z], 0.4 * a]);
        for (let x = s.x0 + 12.5; x < s.x1 - 1; x += 12.5) L.push([[x, b.y0 - 0.02, QZ], [x, b.y0 - 0.02, s.z1], 0.3 * a], [[x, b.y0, s.z1 + 0.02], [x, b.y1, s.z1 + 0.02], 0.3 * a]);
        if (near) for (let y = b.y0 + 2.5; y < b.y1 - 0.5; y += 2.5) L.push([[s.x0 - 0.02, y, QZ], [s.x0 - 0.02, y, s.z1], 0.3 * a]);
        E3.segments(L, INK, 0.6);
      }
    });
    // the near legs, then the girder across the block
    [g0 - 5, g0 + 5].forEach(x => R11.member([x, b.y0 - 3, QZ], [x, b.y0 - 3, zz], 1, 0.7 * a));
    if (d < 2600) E3.solid(E3.box(g0 - 6, g0 + 6, b.y0 - 4, b.y1 + 4, zz, zz + 2.2), { tone: 0.1, shade: 0.45, lw: 0.9, edgeA: 0.8 * a, noHatch: true, fillCol: OPT.colour ? '#E6E1D4' : null, fillA: 0.5 }, 3600 + k);
    else R11.member([g0, b.y0 - 4, zz + 1], [g0, b.y1 + 4, zz + 1], 1.4, 0.7 * a);
  },
  // the crane's structure landward of the quay face (and a load while it is over the quay), far to near
  craneFrame(c, d, lt) {
    const p = c.parts, a = R11.air(d, 2600), st = { tone: 0.08, shade: 0.55, lw: 1.3, edgeA: 0.9 * a, noHatch: d > 1300, fillCol: OPT.colour ? '#E6E1D4' : null, fillA: 0.45 };
    const items = [];
    p.legs.forEach((l, i) => items.push({ p: l.p, draw: () => { E3.solid(l.bog, Object.assign({}, st, { tone: 0.3, noHatch: true }), 4000 + c.i * 20 + i); E3.solid(l.f, st, 4010 + c.i * 20 + i); } }));
    p.sides.forEach(sd => items.push({ p: sd.p, draw: () => sd.m.forEach(([m, n], j) => R11.member(m, n, j ? 0.8 : 1.1, 0.75)) }));
    p.cross.forEach((cb, i) => items.push({ p: cb.p, draw: () => E3.solid(cb.f, st, 4100 + c.i * 20 + i) }));
    const mv = c.mv, over = mv && mv.y >= this.YW;
    if (mv && mv.truck) items.push({ p: [mv.truck.x, this.YLANE, this.QZ + 2], draw: () => this.drawTruck(mv.truck, d, c) });
    if (over) items.push({ p: [c.x, mv.y, (mv.z + this.ZG) / 2], draw: () => this.drawHoist(c, mv, d) });
    items.sort((m, n) => R11.dep(n.p) - R11.dep(m.p)).forEach(it => it.draw());
    E3.solid(p.girder, st, 4200 + c.i);
    if (over) this.drawTrolley(c, mv, d);
    E3.solid(p.house, Object.assign({}, st, { tone: 0.12, fillCol: OPT.colour ? '#EDE8DC' : null, fillA: 0.55 }), 4300 + c.i);
    p.aframe.forEach(fr => fr.forEach(([m, n]) => R11.member(m, n, 2.0, 0.9)));
    E3.solid(p.apexBeam, Object.assign({}, st, { noHatch: true }), 4350 + c.i);
    p.backstays.forEach(([m, n]) => R11.member(m, n, 0.7, 0.6));
  },
  // the boom (lowered over the ship or raised), with what hangs under it while the trolley is out over the water, the
  // trolley riding on it and the forestays over it
  craneBoom(c, lt) {
    const p = c.parts, d = R11.dep(p.mid), a = R11.air(d, 2600), mv = c.mv, out = mv && mv.y < this.YW;
    if (out) this.drawHoist(c, mv, d);
    E3.solid(p.boom, { tone: 0.06, shade: 0.55, lw: 1.2, edgeA: 0.92 * a, noHatch: d > 1300, fillCol: OPT.colour ? '#ECE7DB' : null, fillA: 0.5, hdir: [0, 1, 0] }, 4400 + c.i);
    // the boom's girder panels, so its length reads as built steel
    const L = [];
    for (let t = 0.1; t < 0.99; t += 0.1) L.push([p.P4(72 * t, 0, -3.3 + t), p.P4(72 * t, 0, 3.3 - t), 0.5 * a]);
    E3.segments(L, INK, clamp(260 / d, 0.4, 0.9));
    if (out) this.drawTrolley(c, mv, d);
    p.stays.forEach(([m, n]) => R11.member(m, n, 0.8, 0.7));
  },
  drawTrolley(c, mv, d) {
    const zT = this.ZT, a = R11.air(d, 2600), x = c.x;
    E3.solid(E3.box(x - 3.6, x + 3.6, mv.y - 3, mv.y + 3, zT, zT + 2.4), { tone: 0.2, shade: 0.45, lw: 0.9, edgeA: 0.85 * a, noHatch: true, fillCol: OPT.colour ? HUE.steel : SEPIA, fillA: 0.4 }, 4500 + c.i);
  },
  // the hoist ropes from the trolley, the spreader, and the box on it
  drawHoist(c, mv, d) {
    const a = R11.air(d, 2600), x = c.x, y = mv.y, z = mv.z, zT = this.ZT;
    [[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].forEach(([dx, dy]) => E3.line([[x + dx, y + dy * 0.8, zT], [x + dx * 3.4, y + dy * 0.9, z + 0.9]], INK, clamp(0.7 * 260 / d, 0.35, 1), 0.75 * a));
    E3.solid(E3.box(x - 6.1, x + 6.1, y - 1.25, y + 1.25, z, z + 0.9), { tone: 0.3, shade: 0.4, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: OCHRE, fillA: 0.5 }, 4550 + c.i);
    if (mv.load) this.drawBox(x, y, z, mv.col, a, 4600 + c.i);
  },
  drawBox(x, y, z, col, a, seed) {
    const cc = (OPT.colour ? [HUE.steel, HUE.sea, HUE.sand, HUE.steel, HUE.cloud, SEPIA] : [OCHRE, BLUE, SEPIA, INK, BLUE, SEPIA])[Math.floor(col * 6)];
    E3.solid(E3.box(x - 6.1, x + 6.1, y - 1.22, y + 1.22, z - 2.59, z), { tone: 0.08, shade: 0.45, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: cc, fillA: OPT.colour ? 0.6 : 0.35 }, seed);
  },
  // a terminal tractor and its chassis in the lane under the portal
  drawTruck(t, d, c) {
    const QZ = this.QZ, y = this.YLANE, x = t.x, a = R11.air(d, 2600);
    R11.faded(t.a, () => {
      const st = { tone: 0.2, shade: 0.45, lw: 0.8, edgeA: 0.85 * a, noHatch: true };
      E3.solid(E3.box(x - 6.3, x + 6.3, y - 1.25, y + 1.25, QZ + 0.9, QZ + 1.5), Object.assign({}, st, { tone: 0.35 }), 4700 + c.i);
      E3.solid(E3.box(x + 6.6, x + 11.4, y - 1.3, y + 1.3, QZ, QZ + 3.4), Object.assign({}, st, { fillCol: OPT.colour ? HUE.steel : BLUE, fillA: 0.4 }), 4710 + c.i);
      if (t.box) this.drawBox(x, y, QZ + 4.1, c.mv.col, a, 4720 + c.i);
    });
  },
  drawShip(s, lt, dS) {
    const D = s.D, a = R11.air(dS, 2600), C = this.cam.C;
    const hullSt = { tone: 0.5, shade: 0.42, lw: 1.4, edges: false, fillCol: OPT.colour ? '#3E4751' : INK, fillA: OPT.colour ? 0.5 : 0.07, hdir: [1, 0, 0] };
    const vis = s.hull.map((f, i) => { const c = E3.centroid(f), n = s.hn[i]; return n[0] * (C[0] - c[0]) + n[1] * (C[1] - c[1]) + n[2] * (C[2] - c[2]) > 0; });
    s.hull.forEach((f, i) => { if (vis[i]) E3.face(f, Object.assign({}, hullSt, { n: s.hn[i] }), 5000 + s.idx * 97 + i); });
    // the boot-top: the lower 3 m of each face, in the hull's darker tone
    s.boot.forEach((f, i) => { if (vis[i]) E3.face(f, { n: s.hn[i], tone: 0.88, shade: 0.12, edges: false, hdir: [1, 0, 0], fillCol: OPT.colour ? '#1E242B' : INK, fillA: OPT.colour ? 0.6 : 0.3 }, 5100 + s.idx * 97 + i); });
    // her outline: the waterline and the deck edge along the faces toward the eye, the stem and the stern's edges where
    // the side turns away
    const n = s.wl.length, lw = clamp(1.5 * 420 / dS, 0.6, 1.5);
    for (let i = 0; i < n; i++) if (vis[i]) {
      const j = (i + 1) % n;
      E3.line([s.wl[i], s.wl[j]], INK, lw, 0.85 * a); E3.line([s.dk[i], s.dk[j]], INK, lw, 0.9 * a);
      E3.line([[s.wl[i][0], s.wl[i][1], 3], [s.wl[j][0], s.wl[j][1], 3]].map((p, k) => { const q = s.boot[i][3 - k]; return [q[0], q[1], 3]; }), INK, lw * 0.5, 0.5 * a);
      if (!vis[(i + n - 1) % n]) E3.line([s.wl[i], s.dk[i]], INK, lw, 0.9 * a);
      if (!vis[j]) E3.line([s.wl[j], s.dk[j]], INK, lw, 0.9 * a);
    }
    E3.face(s.dk, { n: [0, 0, 1], tone: 0.1, shade: 0.35, lw: 1, edges: false, fillCol: OPT.colour ? '#9EA3A3' : null, fillA: 0.3, hdir: [1, 0, 0] }, 5090 + s.idx);
    // the deck: bays, deckhouse, casing, breakwater, far to near (by where each stands on the deck)
    const items = [], at = (x, y) => R11.dep([x, y, D]);
    s.bays.forEach((b, bi) => b.cells.forEach((c, ci) => items.push({ d: at(b.xc, s.YC + (c.wa + c.wb) / 2), draw: () => this.cell(s, b, c, ci, a, dS, 5200 + bi * 7 + ci) })));
    const ctr = f => { const c = E3.centroid(f.map(E3.centroid)); return at(c[0], c[1]); };
    const white = { tone: 0.02, shade: 0.45, lw: 1.2, edgeA: 0.92 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.62 };
    items.push({ d: ctr(s.house), draw: () => {
      E3.solid(s.house, white, 5800 + s.idx * 10);
      this.windows(s, s.house, D + 13, D + 36, 3.1, 1.5, a);
      E3.solid(s.wheel, white, 5801 + s.idx * 10);
      E3.solid(s.wings, white, 5802 + s.idx * 10);
      this.windows(s, s.wheel, D + 38.2, D + 40.3, 9, 1.3, a, true);
      this.windows(s, s.wings, D + 38.7, D + 40.1, 9, 1.4, a, true);
      R11.member(s.mast[0], s.mast[1], 1.2, 0.85);
      const m = s.mast[1]; R11.member([m[0], m[1] - 3, m[2] - 2], [m[0], m[1] + 3, m[2] - 2], 0.9, 0.8);
    } });
    items.push({ d: ctr(s.casing), draw: () => {
      E3.solid(s.casing, Object.assign({}, white, { tone: 0.08 }), 5803 + s.idx * 10);
      E3.solid(s.funnel, { tone: 0.3, shade: 0.4, lw: 1.2, edgeA: 0.9 * a, fillCol: OPT.colour ? HUE.steel : null, fillA: 0.45 }, 5804 + s.idx * 10);
      const f = s.funnel[1], top = f.map(p => p[2]);
      E3.face(f, { n: [0, 0, 1], fillCol: INK, fillA: 0.5, noHatch: true, edges: false }, 5805 + s.idx * 10);
    } });
    items.push({ d: ctr(s.bwater), draw: () => { E3.solid(s.bwater, Object.assign({}, white, { tone: 0.1 }), 5806 + s.idx * 10); R11.member(s.fmast[0], s.fmast[1], 1, 0.8); } });
    items.sort((p, q) => q.d - p.d).forEach(it => it.draw());
  },
  // dark window bands on the faces of a block that turn toward the eye
  windows(s, f, z0, z1, pitch, h, a, band) {
    const xs = f[0].map(p => p[0]), ys = f[0].map(p => p[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys), C = this.cam.C;
    const st = { fillCol: INK, fillA: 0.55, noHatch: true, edges: false };
    for (let z = z0; z < z1 - h + 0.01; z += pitch) {
      // the ends (toward the eye along x) and the seaward side
      const ex = C[0] < X0 ? X0 - 0.05 : X1 + 0.05, nx = C[0] < X0 ? [-1, 0, 0] : [1, 0, 0];
      if (band) { E3.face([[ex, Y0 + 0.8, z], [ex, Y1 - 0.8, z], [ex, Y1 - 0.8, z + h], [ex, Y0 + 0.8, z + h]], Object.assign({ n: nx }, st), 5900); E3.face([[X0 + 0.6, Y0 - 0.05, z], [X1 - 0.6, Y0 - 0.05, z], [X1 - 0.6, Y0 - 0.05, z + h], [X0 + 0.6, Y0 - 0.05, z + h]], Object.assign({ n: [0, -1, 0] }, st), 5901); continue; }
      for (let y = Y0 + 1.4; y < Y1 - 2; y += 3.2) E3.face([[ex, y, z], [ex, y + 1.6, z], [ex, y + 1.6, z + h], [ex, y, z + h]], Object.assign({ n: nx }, st), 5902);
      for (let x = X0 + 1.2; x < X1 - 2; x += 3.4) E3.face([[x, Y0 - 0.05, z], [x + 1.6, Y0 - 0.05, z], [x + 1.6, Y0 - 0.05, z + h], [x, Y0 - 0.05, z + h]], Object.assign({ n: [0, -1, 0] }, st), 5903);
    }
  },
  // one stack of boxes on a bay: its box, the tiers on the outboard face, the row and tier lines on the end toward the eye
  cell(s, b, c, ci, a, dS, seed) {
    const D = s.D, y0 = s.YC + c.wa, y1 = s.YC + c.wb, near = dS < 1100;
    const cc = (OPT.colour ? [HUE.steel, HUE.sea, HUE.sand, HUE.steel, HUE.cloud, SEPIA] : [OCHRE, BLUE, SEPIA, INK, BLUE, SEPIA])[Math.floor(c.col * 6)];
    E3.solid(E3.box(b.xa, b.xb, y0, y1, D + 1, c.z1), { tone: 0.05, shade: 0.45, lw: 0.9, edgeA: 0.78 * a, fillCol: cc, fillA: OPT.colour ? 0.44 : 0.2, noHatch: !near }, seed);
    const L = [], xe = this.cam.C[0] < b.xa ? b.xa - 0.02 : b.xb + 0.02;
    for (let z = D + 1 + 2.59; z < c.z1 - 0.1; z += 2.59) {
      if (ci === 0) L.push([[b.xa, y0 - 0.02, z], [b.xb, y0 - 0.02, z], 0.5 * a]);
      if (near) L.push([[xe, y0, z], [xe, y1, z], 0.4 * a]);
    }
    if (near) for (let y = y0 + 2.44; y < y1 - 0.1; y += 2.44) L.push([[xe, y, D + 1], [xe, y, c.z1], 0.3 * a]);
    if (L.length) E3.segments(L, INK, 0.6);
  },
  // a craft's place this frame
  tugAt(t, lt) { return [t.x + Math.cos(t.head) * t.v * (lt - 4), t.y + Math.sin(t.head) * t.v * (lt - 4)]; },
  // a harbour tug under way (or the pilot boat): hull with a raised bow and its fender, the house and wheelhouse turned
  // with her, windows, a mast; her wake spreading behind
  drawTug(t, p, lt, k) {
    const c = Math.cos(t.head), s = Math.sin(t.head), P = (u, v, z) => [p[0] + u * c - v * s, p[1] + u * s + v * c, z];
    const L = t.L / 2, B = t.B / 2, d = R11.dep([p[0], p[1], 2]), a = R11.air(d, 2600);
    // the wake: a V of short crests from her stern and a trail of broken water in her track
    const w = [];
    for (let j = 1; j < 26; j++) {
      const u = -L - j * 3.2, sp = j * 3.2 * 0.36;
      [-1, 1].forEach(sg => w.push([P(u, sg * (B * 0.6 + sp), 0), P(u - 2.4, sg * (B * 0.6 + sp + 1.2), 0), 0.55 - j * 0.02]));
      if (j < 16) w.push([P(u, (j % 3 - 1) * 1.2, 0), P(u - 2, (j % 3 - 1) * 1.2, 0), 0.45 - j * 0.025]);
    }
    E3.segments(w, OPT.colour ? HUE.deep : BLUE, 1);
    // the hull: sheer rising to the bow, the stern low
    const plan = [[-L, -B * 0.82], [-L * 0.55, -B], [L * 0.45, -B], [L * 0.8, -B * 0.62], [L, 0], [L * 0.8, B * 0.62], [L * 0.45, B], [-L * 0.55, B], [-L, B * 0.82]];
    const sheer = u => (t.pilot ? 1.8 : 2.4) + (u > 0 ? 1.4 * Math.pow(u / L, 2) : 0);
    const lo = plan.map(([u, v]) => P(u, v * 0.92, 0)), hi = plan.map(([u, v]) => P(u, v, sheer(u)));
    const sides = lo.map((q, i) => { const j = (i + 1) % lo.length; return [lo[i], lo[j], hi[j], hi[i]]; });
    const hs = { tone: 0.25, shade: 0.45, lw: 1.1, edgeA: 0.9 * a, fillCol: t.pilot ? (OPT.colour ? HUE.steel : SEPIA) : OCHRE, fillA: 0.5, hdir: [0, 0, 1] };
    E3.solid(sides.concat([hi]), hs, 5600 + k * 20);
    // the fender round her bow, a dark band at the sheer
    const fb = plan.slice(2, 7).map(([u, v]) => P(u, v * 1.02, sheer(u) - 0.3)), fl = plan.slice(2, 7).map(([u, v]) => P(u, v * 1.02, sheer(u) - 1.2));
    for (let i = 0; i < fb.length - 1; i++) E3.face([fl[i], fl[i + 1], fb[i + 1], fb[i]], { fillCol: INK, fillA: 0.55, noHatch: true, edges: false }, 5620 + k * 20 + i);
    // the house and the wheelhouse on it, turned with the hull and inside her beam, windows all round the wheelhouse
    const hb = (u0, u1, v0, v1, z0, z1) => { const q = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]; const b0 = q.map(([u, v]) => P(u, v, z0)), b1 = q.map(([u, v]) => P(u, v, z1)); return [b0, b1].concat([0, 1, 2, 3].map(i => [b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]])); };
    const white = { tone: 0.02, shade: 0.42, lw: 1, edgeA: 0.9 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.6 };
    const z0 = sheer(0);
    E3.solid(hb(-L * 0.25, L * 0.35, -B * 0.62, B * 0.62, z0, z0 + 2.6), white, 5640 + k * 20);
    E3.solid(hb(-L * 0.05, L * 0.3, -B * 0.5, B * 0.5, z0 + 2.6, z0 + (t.pilot ? 4.4 : 5.2)), white, 5641 + k * 20);
    const zw = z0 + (t.pilot ? 3.3 : 3.7), wh = 0.9;
    [[L * 0.3 + 0.03, -B * 0.42, L * 0.3 + 0.03, B * 0.42], [-L * 0.05, -B * 0.5 - 0.03, L * 0.3, -B * 0.5 - 0.03], [-L * 0.05, B * 0.5 + 0.03, L * 0.3, B * 0.5 + 0.03], [-L * 0.05 - 0.03, -B * 0.42, -L * 0.05 - 0.03, B * 0.42]].forEach(([u0, v0, u1, v1], i) => {
      const nn = i === 0 ? [c, s, 0] : i === 1 ? [s, -c, 0] : i === 2 ? [-s, c, 0] : [-c, -s, 0];
      E3.face([P(u0, v0, zw), P(u1, v1, zw), P(u1, v1, zw + wh), P(u0, v0, zw + wh)], { n: nn, fillCol: INK, fillA: 0.6, noHatch: true, edges: false }, 5650 + k * 20 + i);
    });
    const mz = z0 + (t.pilot ? 4.4 : 5.2);
    R11.member(P(L * 0.1, 0, mz), P(L * 0.1, 0, mz + (t.pilot ? 3 : 5.5)), 0.9, 0.9);
    if (!t.pilot) R11.member(P(L * 0.1, -1.6, mz + 3.6), P(L * 0.1, 1.6, mz + 3.6), 0.7, 0.8);
  },
});
