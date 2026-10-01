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
// The port at work (1 October 2026, "Jebel Ali at work"): every lowered crane discharges in the real cycle, each at its
// own point in it (so no two move alike): the trolley runs out over its bay, the empty spreader comes down onto the box
// standing on top of the deck stack, lands slowly, locks, hoists the box clear of the stacks, the trolley runs back over
// the quay (the box starting down once it is clear of the ship's side) and the box is set down slowly onto a terminal
// tractor's trailer waiting in the crane's lane under the portal, unlocked, and the tractor pulls away. Speeds are the
// STS specification's (ZPMC: hoist 90 m/min laden, 180 m/min empty, trolley 240 m/min; Konecranes gives the same for
// cranes 22-24 rows wide), each move easing in and out on a half-cosine, the port's time running 4 times the scene
// clock: 2.9 times life at the design pace, 2.6 times at the film's 1.1 pace. Terminal 3 (Port Technology; CyberLogitec)
// is semi-automated: remote-operated quay cranes, automated rail-mounted gantries over yard blocks parallel to the quay,
// and manned terminal tractors with trailers between quay and yard (190 tractors, 178 trailers; Kalmar and Terberg
// supplied them, 2014-2016), so the apron's traffic is tractor-trailers (a Terberg YT222: 5.6 m long, 2.5 m wide,
// 3.2 m to the cab roof, the one-man cab on the left), never straddle carriers or AGVs. Behind the backreach, a one-way
// pair of roadway lanes carries laden and empty tractors along the line, at about 22 km/h; in the yard the gantries run
// along their blocks at 4 m/s. All of it is a pure function of the scene clock, from its own seeded stream.
scene({
  id: 'jebelali',
  start: 0, dur: 8.333,
  init() {
    const r = rng(1107);
    const QZ = 4.5; // the quay deck above the water
    Object.assign(this, { QZ, YW: 4, YL: 34.5, ZG: QZ + 71, ZT: QZ + 75, ZA: 104, REACH: 72 });
    // the hull's lines: stations [s at the deck, half-breadth at the deck, s at the waterline, half-breadth there], s from the
    // stern (0) to the stem (400); the counter overhangs the waterline aft, and the bow flares over a finer waterline
    this.ST = [[0, 23, 12, 12], [5, 26.5, 18, 21], [14, 29.2, 28, 27.5], [28, 30.5, 45, 30.5], [300, 30.5, 292, 30.5], [328, 30, 318, 28.2],
      [350, 28, 338, 23.5], [368, 24.5, 354, 17], [382, 19.5, 366, 10.5], [392, 13.5, 375, 5], [398, 6.5, 381, 1.5], [400, 0, 383, 0]];
    // four ships along the quay; bow +1 points along +x
    this.ships = [[-120, 400, -1], [320, 400, 1], [770, 366, -1], [1190, 400, 1]].map(([x0, L, bow], i) => this.ship(x0, L, bow, r, i));
    // the cranes: six or seven working each ship over its bays (never over the deckhouse or the funnel), idle ones with the
    // boom raised between the berths, and the line running on beyond the last ship
    // (a working crane is kept out of the eye's line to each deckhouse and funnel, so no boom crosses in front of them)
    this.cranes = [];
    const cam0 = this.view(5.2), C0 = cam0.C, zB = this.ZT - 2;
    const occ = (x, y, z) => { const t = (zB - z) / (C0[2] - z); return x + t * (C0[0] - x); };
    [6, 7, 6, 6].forEach((n, i) => {
      const s = this.ships[i], nb = s.bays.length, used = [];
      const keep = [occ(s.X(s.sb), s.YC, s.D + 38), occ(s.X(s.sb), s.YC + 15, s.D + 38), occ(s.X(s.sf), s.YC, s.D + 36)];
      const ok = j => !used.some(u => Math.abs(s.bays[u].xc - s.bays[j].xc) < 42) && !keep.some(x => Math.abs(s.bays[j].xc - x) < 15);
      for (let k = 0; k < n; k++) {
        const j0 = (k + 0.5) * nb / n - 0.5, order = s.bays.map((b, j) => j).sort((p, q) => Math.abs(p - j0) - Math.abs(q - j0));
        const j = order.find(ok);
        if (j === undefined) continue;
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
    this.tugs = [{ x: 115, y: -152, head: Math.PI + 0.1, v: 4, L: 32, B: 12 }, { x: 335, y: -212, head: 0.22, v: 5, L: 17, B: 5.2, pilot: true }];
    // the harbour: fixed marks on the water, laid out once from the camera at mid-beat (rows closing up toward the far water),
    // over more than the picture so the rise never runs out of them, then projected every frame
    const cam = this.view(5.2), hz = E3.projDir([cam.F[0], cam.F[1], 0])[1];
    this.sea = [];
    for (let y = hz + 1.4; y < 1560;) {
      const f = clamp((y - hz) / 800), gap = 1.5 + 5.2 * Math.pow(f, 0.9);
      for (let x = -360 + r() * 20; x < 1480;) {
        const len = 5 + r() * (10 + 34 * f), g = 3 + r() * (8 + 8 * f), xm = x + len / 2;
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
    // the port at work, from a second stream so every draw above keeps its place
    this.work(rng(1131));
  },
  // the port's working life: each lowered crane's three cycles around the beat, its tractors, the roadway's tractors and
  // the yard gantries' runs. The port's clock (seconds of life) runs KT times the scene clock; the beat is seen over LW
  work(r) {
    this.KT = 4; this.LW = [0.85, 9.7];
    const crs = this.cranes.filter(c => !c.raised).sort((p, q) => p.x - q.x);
    // where the beat opens in each crane's work, as a share of the time from one pick to the next; the three cranes
    // nearest the eye are set so that the beat holds a whole pick (#4), a whole set-down onto a tractor in the open lane
    // at the bow (#5) and the trolley's run out (#3)
    const HERO = { 5: ['land', 17], 4: ['down', 3], 3: ['out', 4] };
    crs.forEach((c, k) => {
      // the crane's lane under the portal (the three middle lanes in turn along the line), and the stretch of it its
      // tractors are drawn on: the two at the bow come in from beyond the picture, the rest from behind the ships
      c.lane = [25.5, 19.5, 13.5][k % 3];
      c.ra = { 5: 250, 4: 250 }[c.i] || 62; c.rb = { 5: 80, 4: 74 }[c.i] || 62;
      // three picks: A before the beat, B the next (its box stands on the stack until it is lifted), C after; A and C
      // from the rows either side of B's, so a row never gives up the same box twice
      const b = c.bay, wMin = Math.min(...b.cells.map(q => q.wa)) + 1.22, wMax = Math.max(...b.cells.map(q => q.wb)) - 1.22;
      const w = clamp(-29.28 + 1.22 + 2.44 * c.row, wMin, wMax), wA = w + 2.44 <= wMax ? w + 2.44 : w - 2.44, wC = w - 2.44 >= wMin ? w - 2.44 : w + 2.44;
      c.cyc = [wA, w, wC].map(q => this.cycle(c, q, r));
      const [A, B] = c.cyc;
      const lo = A.tLift - A.D, span = B.tLift - lo;
      const h = HERO[c.i];
      // (each hero's opening is set from one event of its work: the set-down of A's box, B's spreader starting down, or
      // B's trolley starting out, that many seconds into the beat)
      // (the others step round the cycle by the golden ratio along the line, so no two neighbours move alike)
      const ev = h ? { land: A.tLand - A.D, down: B.tZ2, out: B.tY1 }[h[0]] - h[1] : lo + (0.03 + 0.94 * ((k * 0.618034 + 0.1 * r()) % 1)) * span;
      c.u0 = clamp(ev, lo + 0.5, B.tLift - 0.5);
      // each cycle's tractor: in to its stop W s before the box lands, away 2 s after the unlock
      c.rigs = c.cyc.map((q, j) => {
        const S = [-A.D, 0, B.D][j], W = 10 + r() * 12;
        return { tA: S + q.tLand - W, tL: S + q.D, tD: S + q.D + 2, col: q.col };
      });
    });
    // the roadway behind the backreach: a loop of two one-way lanes, seaward running down the line (+x), landward back,
    // joined by a turn at each end (behind the eye, and some 5 km down the line), tractors spread round it at one pace
    const rd = this.road = { y0: 66, y1: 76, xa: -760, xb: 5200, v: 6 };
    rd.L = 2 * (rd.xb - rd.xa) + Math.PI * (rd.y1 - rd.y0);
    this.fleet = [];
    for (let s = r() * 60; s < rd.L - 60; s += 70 + r() * 150) this.fleet.push({ s, laden: r() < 0.55, col: r() });
    // the yard gantries: about two in three make one run along their block while the beat is seen. (Each girder is drawn
    // as a box or, far off, as a line by its distance from the eye at mid-beat, so none changes as the eye rises)
    this.view(5.2);
    this.yard.forEach(b => {
      b.dRef = E3.depth([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, this.QZ]);
      const lo = b.x0 + 8, hi = b.x1 - 8, x0 = clamp(b.gx, lo, hi), go = r() < 0.65, sg = r() < 0.5 ? -1 : 1, dx = 25 + r() * 110, t0 = r() * 30 - 8;
      const to = go ? clamp(x0 + sg * dx, lo, hi) : x0;
      b.gm = { x0, to, t0, p: this.prof(to - x0, 4, 6) };
    });
  },
  // a move of length D at top speed v: the speed rises and falls on a half-cosine over ta s each way (no jolt in the
  // speed or in its rate of change), or the same shape, shorter and slower, when D is too short to reach v
  prof(D, v, ta) {
    D = Math.abs(D);
    if (D < 1e-6) return { T: 0, s: () => 0 };
    if (D < v * ta) { ta = Math.sqrt(D * ta / v); v = D / ta; }
    const tc = (D - v * ta) / v, T = 2 * ta + tc;
    return { T, s: t => t <= 0 ? 0 : t >= T ? D : t < ta + tc ? this.ramp(t, v, ta) : D - this.ramp(T - t, v, ta) };
  },
  // the distance run t s after starting from rest on that half-cosine, then at v
  ramp(t, v, ta) { return t <= 0 ? 0 : t < ta ? v / 2 * (t - ta / Math.PI * Math.sin(Math.PI * t / ta)) : v * ta / 2 + v * (t - ta); },
  // when a move has run d
  when(p, d) {
    let a = 0, b = p.T;
    for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (p.s(m) < d) a = m; else b = m; }
    return b;
  },
  // one discharge cycle of a crane, picking from row w of its bay: the moves of the trolley (y) and of the spreader (z,
  // its underside) in the cycle's own seconds, from the unlock on the last trailer to the unlock on the next
  cycle(c, w, r) {
    const { QZ } = this, s = c.ship, b = c.bay;
    const cell = b.cells.find(q => w >= q.wa - 0.01 && w <= q.wb + 0.01) || b.cells[0];
    // the box to pick stands one tier on its stack; the spreader lands on its top; it travels with the box hanging 2.5 m
    // clear of the bay's highest stack; on the trailer the box's top is 4.09 m over the quay
    const yL = c.lane, yP = s.YC + w, zP = cell.z1 + 2.59, zD = QZ + 4.09;
    const zS = Math.max(zP, ...b.cells.map(q => q.z1)) + 2.59 + 2.5;
    const TR = [4, 6], HE = [3, 2.5], HL = [1.5, 2], CR = [0.5, 1.5], LOCK = 2;
    const Y = [], Z = [];
    const add = (arr, t0, a, e, [v, ta]) => { const p = this.prof(e - a, v, ta); arr.push({ t0, a, b: e, p }); return t0 + p.T; };
    // up off the trailer; the trolley sets out so that it crosses the ship's side (y -1.25) only once the spreader is up
    const eZ1 = add(Z, 0, zD, zS, HE), pY1 = this.prof(yP - yL, ...TR);
    const tY1 = Math.max(1.6, eZ1 - this.when(pY1, yL + 1.25));
    const eY1 = add(Y, tY1, yL, yP, TR);
    // down onto the box (the last 1.5 m at a creep), lock
    const tZ2 = Math.max(eZ1, eY1 - 2), eZ2 = add(Z, tZ2, zS, zP + 1.5, HE), eZ3 = add(Z, eZ2, zP + 1.5, zP, CR), tLift = eZ3 + LOCK;
    // hoist it clear; the trolley runs back; the box starts down once it is clear of the ship's side
    const pZ4 = this.prof(zS - zP, ...HL), eZ4 = add(Z, tLift, zP, zS, HL);
    const tY2 = tLift + this.when(pZ4, zS - zP - 0.3), pY2 = this.prof(yL - yP, ...TR);
    add(Y, tY2, yP, yL, TR);
    const tZ5 = Math.max(eZ4, tY2 + this.when(pY2, -0.78 - yP)), eZ5 = add(Z, tZ5, zS, zD + 1.5, HL);
    const tLand = add(Z, eZ5, zD + 1.5, zD, CR);
    return { Y, Z, yL, yP, zD, zP, zS, w, tY1, tZ2, tLift, tLand, D: tLand + LOCK, col: r() };
  },
  // an axis's place at cycle time t, from its moves
  axis(segs, t, v) {
    for (const g of segs) { if (t < g.t0) break; v = g.a + Math.sign(g.b - g.a) * g.p.s(t - g.t0); }
    return v;
  },
  // the crane's time at scene time lt, and the spreader then: which cycle, where, whether it carries a box, whether the
  // next box still stands on its stack, and whether it hangs low enough to be painted among the ship's stacks
  hoist(c, lt) {
    const u = c.u0 + (lt - this.LW[0]) * this.KT, [A, B] = c.cyc;
    const k = u < 0 ? 0 : u < B.D ? 1 : 2, cy = c.cyc[k], t = u - [-A.D, 0, B.D][k];
    const y = this.axis(cy.Y, t, cy.yL), z = this.axis(cy.Z, t, cy.zD), load = t >= cy.tLift && t < cy.D;
    return { u, y, z, load, col: cy.col, stack: u < B.tLift ? B : null, low: (load ? z - 2.59 : z) < 60 };
  },
  // a tractor's place along the crane's lane at the crane's time u (its trailer's centre): running in, slowing to a stop
  // with the trailer under the spreader, waiting, pulling away; null off the stretch of lane it is drawn on
  rigX(c, g, u) {
    const x = u < g.tA ? c.x - this.ramp(g.tA - u, 4.5, 5) : u < g.tD ? c.x : c.x + this.ramp(u - g.tD, 4.5, 6);
    return x < c.x - c.ra || x > c.x + c.rb ? null : x;
  },
  // a roadway tractor's place on the loop at scene time lt: its kingpin, the tractor's heading and the trailer's (the
  // trailer's axles following the kingpin's path 9.5 m behind)
  fleetAt(f, lt) {
    const rd = this.road, s = f.s + rd.v * (lt - this.LW[0]) * this.KT, K = this.loop(s), T = this.loop(s - 9.5), H = this.loop(s + 1.5);
    return { kx: K[0], ky: K[1], h: Math.atan2(H[1] - K[1], H[0] - K[0]), th: Math.atan2(K[1] - T[1], K[0] - T[0]) };
  },
  // a point on the roadway loop at arc length s
  loop(s) {
    const { y0, y1, xa, xb, L } = this.road, L1 = xb - xa, R = (y1 - y0) / 2, Lc = Math.PI * R, ym = (y0 + y1) / 2;
    s = ((s % L) + L) % L;
    if (s < L1) return [xa + s, y0];
    s -= L1;
    if (s < Lc) { const a = -Math.PI / 2 + s / R; return [xb + R * Math.cos(a), ym + R * Math.sin(a)]; }
    s -= Lc;
    if (s < L1) return [xb - s, y1];
    s -= L1;
    const a = Math.PI / 2 + s / R;
    return [xa + R * Math.cos(a), ym + R * Math.sin(a)];
  },
  // draw as the plate inks in at x along the quay, wherever in the layers it is drawn
  inked(x, fn) {
    const s0 = SA;
    SA = this.SA0 * this.ink(x);
    try { if (SA > 0.003) fn(); } finally { SA = s0; }
  },
  // a yard gantry's place along its block
  gantryX(b, lt) {
    const m = b.gm;
    return m.x0 + Math.sign(m.to - m.x0) * m.p.s((lt - this.LW[0]) * this.KT - m.t0);
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
    s.wings = [s.box(sb + 2, sb + 6.5, 15.5, 30.4, D + 38, D + 40.6), s.box(sb + 2, sb + 6.5, -30.4, -15.5, D + 38, D + 40.6)]; // landward, seaward
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
  // this frame's camera, and where the horizon and the quay edge fall on screen (the washes and the water follow them)
  frame(lt) {
    const cam = this.view(lt), B = R11.BOX;
    this.ec = cam;
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
    // (every wash stays inside the picture box)
    ctx.save(); ctx.beginPath(); R11.boxPath().trace(ctx, 1); ctx.clip();
    washFade([B[0], B[1], B[2], hy + 2], [[0, HUE.sky, 0.56], [0.6, HUE.sky, 0.36], [1, HUE.sky, 0.12]], 0, 1);
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sand, 0.06], [0.35, HUE.sand, 0.11], [1, HUE.sand, 0.16]], 0, 1, this.land);
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sea, 0.3], [0.3, HUE.sea, 0.46], [1, HUE.deep, 0.58]], 0, 1, this.water);
    ctx.restore();
  },
  // high over the harbour off the first ship's bow, looking along the line and down about 20-24 degrees; over the beat the
  // eye rises from 150 to 220 m (always well above the booms) and draws back a little, so the yard opens out behind
  view(lt) {
    const q = clamp((lt - 0.6) / 9.2), u = 0.6 * q + 0.4 * easeInOut(q);
    const X = lerp(-330, -300, u), Y = lerp(-215, -300, u), Z = lerp(150, 220, u);
    const hd = lerp(25.5, 26.5, u) * Math.PI / 180, pt = lerp(21.5, 25, u) * Math.PI / 180;
    const F = [Math.cos(pt) * Math.cos(hd), Math.cos(pt) * Math.sin(hd), -Math.sin(pt)];
    return E3.camera([X, Y, Z], [X + F[0] * 100, Y + F[1] * 100, Z + F[2] * 100], 1000, 530, lerp(640, 620, u));
  },
  draw(lt) {
    const QZ = this.QZ;
    // late morning: the sun high over the harbour to the right of the eye, so the seaward faces are lit, the faces toward the
    // eye in shade, and the shadows fall back toward the quay
    E3.sunAt(140, 42);
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX;
      // the plate inks in along the quay
      const ink = x => easeOut(prog(lt, 0.15 + clamp((x + 200) / 2600) * 1.3, 0.7));
      this.ink = ink; this.SA0 = SA;
      this.drawSky(lt);
      // the far ground to the horizon
      stroke(new P([[B[0], this.hz], [B[2], this.hz]]), 1, INK, 0.9, 0.45);
      this.drawFarLand(lt);
      this.drawSea(lt);
      const L1 = [], L2 = [], L3 = [];
      // (1) landward of the quay face, far to near: the sheds, the yard, the quay, the cranes' structure
      // (landward of the roadway, all of it beyond anything nearer the quay, so painted first: +20000)
      this.sheds.forEach((b, k) => {
        const d = R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, QZ]);
        L1.push({ d: d + 20000, draw: () => R11.faded(ink(b.x0) * 0.85, () => {
          const a = R11.air(d, 1800);
          E3.solid(E3.box(b.x0, b.x1, b.y0, b.y1, QZ, QZ + b.z1), { tone: 0.05, shade: 0.45, lw: 0.8, edgeA: 0.6 * a, noHatch: d > 1600, fillCol: OPT.colour ? HUE.steel : SEPIA, fillA: OPT.colour ? 0.16 : 0.08 }, 3000 + k);
        }) });
      });
      this.yard.forEach((b, k) => {
        const d = R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, QZ]);
        L1.push({ d: d + 20000, draw: () => R11.faded(ink(b.x0), () => this.drawBlock(b, d, k, lt)) });
      });
      L1.push({ d: 1e6, draw: () => R11.faded(easeInOut(prog(lt, 0.1, 0.8)), () => this.drawQuay(lt)) });
      // the roadway's tractors, between the yard and the cranes (+10000)
      this.fleet.forEach((f, k) => {
        const g = this.fleetAt(f, lt);
        if (g.kx < -400) return;
        g.box = f.laden ? f.col : null;
        const d = R11.dep([g.kx, g.ky, QZ + 2]);
        L1.push({ d: d + 10000, draw: () => R11.faded(ink(g.kx), () => this.drawRig(g, d, 7000 + k * 7)) });
      });
      this.cranes.forEach(c => { c.here = []; c.mv = c.raised ? null : this.hoist(c, lt); });
      // each crane's tractors in its lane: drawn with the crane whose portal they are under (between its legs in the
      // painting order), else on their own
      this.cranes.forEach(c => {
        if (c.raised) return;
        c.rigs.forEach((g, j) => {
          const x = this.rigX(c, g, c.mv.u);
          if (x === null) return;
          // (inked with its own crane wherever it is drawn, so its box passes from the spreader unchanged)
          const rig = { kx: x + 5.25, ky: c.lane, h: 0, th: 0, box: c.mv.u >= g.tL ? g.col : null, ix: c.x }, xm = x + 1.5;
          const host = this.cranes.find(q => Math.abs(q.x - xm) < 30);
          if (host) { host.here.push(rig); return; }
          const d = R11.dep([xm, c.lane, QZ + 2]);
          L1.push({ d, draw: () => this.inked(c.x, () => this.drawRig(rig, d, 7600 + c.i * 7 + j)) });
        });
      });
      this.cranes.forEach(c => {
        const d = R11.dep([c.x, 19, QZ + 40]);
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
    for (let y = 520; y < 16000; y *= 1.075) {
      const al = 0.08 + 0.2 * R11.air(R11.dep([900, y, 0]), 3000);
      segs.push([[-800, y, 0], [30000, y, 0], al]);
    }
    E3.segments(segs, SEPIA, 0.6);
  },
  // the water: short strokes lying on the surface along the eye's right hand, closing up toward the far water and darker
  // toward the eye; darker still in each hull's reflection under her side and in the shadows cast on the water
  drawSea(lt) {
    const R0 = this.R0, shade = this.shadowPolys(), refl = this.reflPolys();
    const inAny = (p, list) => list.some(q => p[0] >= q.bb[0] && p[0] <= q.bb[2] && p[1] >= q.bb[1] && p[1] <= q.bb[3] && this.inPoly(p[0], p[1], q.p));
    const wk = TAU / 70, dir = [Math.sin(250 * Math.PI / 180), Math.cos(250 * Math.PI / 180)], om = TAU / 6.2;
    const wk2 = TAU / 23, dir2 = [Math.sin(205 * Math.PI / 180), Math.cos(205 * Math.PI / 180)], om2 = TAU / 3.4;
    const base = [], dark = [], q = easeInOut(prog(lt, 0.2, 1.0)), hz = this.hz;
    this.sea.forEach(([x, y, h, ph, dist]) => {
      const c = E3.proj([x, y, 0]);
      if (c[1] < hz + 1.5 || c[0] < 16 || c[0] > 1104 || c[1] > 1100) return;
      const d = E3.depth([x, y, 0]);
      if (d < 60) return;
      const a0 = [x - R0[0] * h, y - R0[1] * h, 0], b0 = [x + R0[0] * h, y + R0[1] * h, 0];
      const sw = 0.5 + 0.5 * Math.cos(wk * (dir[0] * x + dir[1] * y) - om * lt + ph * 1.3), sw2 = 0.5 + 0.5 * Math.cos(wk2 * (dir2[0] * x + dir2[1] * y) - om2 * lt + ph * 2.1);
      const near = clamp((c[1] - hz) / (1080 - hz));
      const al = q * (0.14 + 0.5 * Math.exp(-d / 900) + 0.45 * near * near) * (0.3 + 0.7 * Math.pow(sw, 1.5)) * (0.7 + 0.3 * sw2) * (0.75 + 0.45 * ph);
      if (inAny(c, shade)) { dark.push([a0, b0, Math.min(1, al * 1.2 + 0.4 * q)]); return; }
      if (inAny(c, refl)) { dark.push([a0, b0, Math.min(1, al * 1.1 + 0.3 * q)]); return; }
      base.push([a0, b0, al]);
    });
    if (OPT.colour) { shade.forEach(o => wash(new P(o.p, true), HUE.deep, 0.22 * q)); refl.forEach(o => wash(new P(o.p, true), HUE.deep, 0.16 * q)); }
    else { base.forEach(o => { o[2] = Math.min(1, o[2] * 1.9); }); dark.forEach(o => { o[2] = Math.min(1, o[2] * 1.3); }); }
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
      [s.house, s.wings[0], s.wings[1], s.casing, s.funnel].forEach(f => f[1].forEach(p => pts.push(sh(p))));
      out.push(this.poly(this.hull2(pts)));
    });
    return out;
  },
  // the quay: its face and deck edge along the whole line, the fenders, the crane rails and the lanes on the apron
  drawQuay(lt) {
    const QZ = this.QZ, x0 = -900, x1 = 9000;
    // (in lengths, each lighter and finer with its distance, so the far quay does not close up into a bar)
    const segs = [], edge = [], xs = [x0, -300, 0, 300, 600, 900, 1200, 1600, 2000, 2600, 3400, 4400, 6000, x1];
    for (let i = 0; i < xs.length - 1; i++) {
      const a = xs[i], b = xs[i + 1], dd = R11.dep([(a + b) / 2, 0, QZ]), al = R11.air(dd, 1500);
      E3.face([[a, 0, 0], [b, 0, 0], [b, 0, QZ], [a, 0, QZ]], { n: [0, -1, 0], tone: 0.3, shade: 0.35, hdir: [0, 0, 1], edges: false, noHatch: dd > 1400, fillCol: OPT.colour ? '#CFC6B3' : INK, fillA: OPT.colour ? 0.4 : 0.06 }, 3900 + i);
      edge.push([[a, 0, QZ], [b, 0, QZ], 0.95 * al], [[a, 0, 0], [b, 0, 0], 0.6 * al]);
      [this.YW, this.YL].forEach(y => segs.push([[a, y - 0.8, QZ], [b, y - 0.8, QZ], 0.5 * al], [[a, y + 0.8, QZ], [b, y + 0.8, QZ], 0.5 * al]));
      [10.5, 16.5, 22.5, 28.5, 62, 70].forEach(y => segs.push([[a, y, QZ], [b, y, QZ], 0.22 * al]));
    }
    for (let x = x0; x < 1800; x += 16) segs.push([[x, -0.05, QZ - 0.3], [x, -0.05, 0.6], 0.5 * R11.air(R11.dep([x, 0, 2]), 1200)]); // the fenders on the face
    this.segs(edge, INK, 1.3);
    E3.segments(segs, INK, 0.8);
  },
  // a yard block: its runs of boxes far to near, the rows and the box ends on the faces toward the eye, its gantry
  drawBlock(b, d, k, lt) {
    const QZ = this.QZ, a = R11.air(d, 2200), near = d < 1100;
    const g0 = this.gantryX(b, lt), zz = QZ + 24;
    // the gantry's legs on the far rail first
    [g0 - 5, g0 + 5].forEach(x => R11.member([x, b.y1 + 3, QZ], [x, b.y1 + 3, zz], 1, 0.6 * a));
    const segs = (d < 2000 ? b.segs : [{ x0: b.x0, x1: b.x1, z1: QZ + 2.59 * 5.5, col: b.segs[0].col }]).slice().sort((p, q) => R11.dep([q.x0, b.y0, QZ]) - R11.dep([p.x0, b.y0, QZ]));
    segs.forEach((s, i) => {
      const [cc, ck] = this.boxCol(s.col);
      E3.solid(E3.box(s.x0, s.x1, b.y0, b.y1, QZ, s.z1), { tone: 0.05, shade: 0.5, lw: 0.9, edgeA: 0.75 * a, fillCol: cc, fillA: (OPT.colour ? 0.34 : 0.14) * ck * (0.5 + 0.5 * a), noHatch: !near }, 3100 + k * 11 + i);
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
    if (b.dRef < 2600) E3.solid(E3.box(g0 - 6, g0 + 6, b.y0 - 4, b.y1 + 4, zz, zz + 2.2), { tone: 0.1, shade: 0.45, lw: 0.9, edgeA: 0.8 * a, noHatch: true, fillCol: OPT.colour ? '#E6E1D4' : null, fillA: 0.5 }, 3600 + k);
    else R11.member([g0, b.y0 - 4, zz + 1], [g0, b.y1 + 4, zz + 1], 1.4, 0.7 * a);
  },
  // the crane's structure landward of the quay face, with the tractors under its portal and the load while it is over
  // the quay. The eye is always seaward of the quay and astern of every crane, so the parts go far to near by side: the
  // landside legs and portal beam; the tractors in the lanes; the load (with the far legs' bracing before it when it
  // hangs high, after it when it hangs low: a brace is nearer than whatever lower it crosses on screen); the near bracing;
  // the waterside legs and portal beam; then the girder, trolley, machinery house, A-frames and back stays
  craneFrame(c, d, lt) {
    const p = c.parts, a = R11.air(d, 2600), st = { tone: 0.08, shade: 0.55, lw: 1.3, edgeA: 0.9 * a, noHatch: d > 1300, fillCol: OPT.colour ? '#E6E1D4' : null, fillA: 0.45 };
    const leg = i => { const l = p.legs[i]; E3.solid(l.bog, Object.assign({}, st, { tone: 0.3, noHatch: true }), 4000 + c.i * 20 + i); E3.solid(l.f, st, 4010 + c.i * 20 + i); };
    const brace = j => p.sides[j].m.forEach(([m, n], k) => R11.member(m, n, k ? 0.8 : 1.1, 0.75));
    [3, 2].forEach(leg);
    E3.solid(p.cross[1].f, st, 4100 + c.i * 20 + 1);
    c.here.map(g => ({ g, d: R11.dep([g.kx - 3.75, g.ky, this.QZ + 2]) })).sort((m, n) => n.d - m.d).forEach((o, k) => this.inked(o.g.ix, () => this.drawRig(o.g, o.d, 7300 + c.i * 7 + k)));
    const mv = c.mv, over = mv && mv.y >= this.YW, high = over && mv.z > 40;
    if (!high) brace(1);
    if (over) this.drawHoist(c, mv, d);
    if (high) brace(1);
    brace(0);
    [1, 0].forEach(leg);
    E3.solid(p.cross[0].f, st, 4100 + c.i * 20);
    E3.solid(p.girder, st, 4200 + c.i);
    if (over) this.drawTrolley(c, mv, d);
    E3.solid(p.house, Object.assign({}, st, { tone: 0.12, fillCol: OPT.colour ? '#EDE8DC' : null, fillA: 0.55 }), 4300 + c.i);
    p.aframe.forEach(fr => fr.forEach(([m, n]) => R11.member(m, n, 2.0, 0.9)));
    E3.solid(p.apexBeam, Object.assign({}, st, { noHatch: true }), 4350 + c.i);
    p.backstays.forEach(([m, n]) => R11.member(m, n, 0.7, 0.6));
  },
  // the boom (lowered over the ship or raised), with what hangs under it while the trolley is out over the water and
  // the load is up above the ships' houses (lower, it is painted among the ship's stacks), the trolley riding on it and
  // the forestays over it
  craneBoom(c, lt) {
    const p = c.parts, d = R11.dep(p.mid), a = R11.air(d, 2600), mv = c.mv, out = mv && mv.y < this.YW;
    if (out && !mv.low) this.drawHoist(c, mv, d);
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
    E3.solid(E3.box(x - 3.6, x + 3.6, mv.y - 3, mv.y + 3, zT, zT + 2.4), { tone: 0.2, shade: 0.45, lw: 0.9, edgeA: 0.9 * a, noHatch: true, fillCol: OPT.colour ? HUE.deep : INK, fillA: OPT.colour ? 0.45 : 0.3 }, 4500 + c.i);
  },
  // the hoist ropes from the trolley, the box on the spreader, and the spreader on it (seen from above, so the box first)
  drawHoist(c, mv, d) {
    const a = R11.air(d, 2600), x = c.x, y = mv.y, z = mv.z, zT = this.ZT;
    [[-1.6, -1], [1.6, -1], [-1.6, 1], [1.6, 1]].forEach(([dx, dy]) => E3.line([[x + dx, y + dy * 0.8, zT], [x + dx * 3.4, y + dy * 0.9, z + 0.9]], INK, clamp(0.9 * 260 / d, 0.6, 1.1), 0.85 * a));
    if (mv.load) this.drawBox(x, y, z, mv.col, a, 4600 + c.i);
    E3.solid(E3.box(x - 6.1, x + 6.1, y - 1.25, y + 1.25, z, z + 0.9), { tone: 0.3, shade: 0.4, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: OCHRE, fillA: 0.5 }, 4550 + c.i);
  },
  // a box's colour and how strongly it is laid: plain boxes, no liveries; steel, sea and cloud greys-blues, sepia, a few in
  // sand laid lighter (ochre, blue, sepia and ink in the default look). Never red
  boxCol(col) {
    const k = Math.floor(col * 6);
    return OPT.colour ? [[HUE.steel, 1], [HUE.sea, 0.9], [HUE.cloud, 1], [HUE.steel, 1], [SEPIA, 0.7], [HUE.sand, 0.55]][k] : [[OCHRE, 1], [BLUE, 1], [SEPIA, 1], [INK, 0.8], [BLUE, 1], [SEPIA, 1]][k];
  },
  drawBox(x, y, z, col, a, seed) {
    const [cc, ck] = this.boxCol(col);
    E3.solid(E3.box(x - 6.1, x + 6.1, y - 1.22, y + 1.22, z - 2.59, z), { tone: 0.08, shade: 0.45, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: cc, fillA: (OPT.colour ? 0.6 : 0.35) * ck }, seed);
  },
  // a block of the vehicles: centre (x, y), heading h, from l0 to l1 along it and w0 to w1 across (left +), z0 to z1
  obox(x, y, h, l0, l1, w0, w1, z0, z1) {
    const c = Math.cos(h), s = Math.sin(h), P = (u, v, z) => [x + u * c - v * s, y + u * s + v * c, z];
    const q = [[l0, w0], [l1, w0], [l1, w1], [l0, w1]], b0 = q.map(([u, v]) => P(u, v, z0)), b1 = q.map(([u, v]) => P(u, v, z1));
    return [b0, b1].concat([0, 1, 2, 3].map(i => [b0[i], b0[(i + 1) % 4], b1[(i + 1) % 4], b1[i]]));
  },
  // a terminal tractor and its trailer (g: the kingpin over the fifth wheel, the tractor's and the trailer's headings,
  // the box's colour if laden). The tractor (a YT222: 5.6 x 2.5 m, 3.2 m to the cab roof): its chassis the full width,
  // the one-man cab on the left and the engine cover on the right, both forward of the fifth wheel. The trailer: a
  // 40-foot deck 12.5 m long, its kingpin 1 m from its front, the box's floor 1.5 m over the quay. Far to near as the
  // eye sees them
  drawRig(g, d, seed) {
    const QZ = this.QZ, a = R11.air(d, 2600), st = { tone: 0.2, shade: 0.45, lw: 0.8, edgeA: 0.85 * a, noHatch: true };
    const tx = g.kx - 5.25 * Math.cos(g.th), ty = g.ky - 5.25 * Math.sin(g.th);
    const tractor = () => {
      E3.solid(this.obox(g.kx, g.ky, g.h, -1.6, 4, -1.25, 1.25, QZ + 0.4, QZ + 1.3), Object.assign({}, st, { tone: 0.5, fillCol: INK, fillA: 0.3 }), seed);
      E3.solid(this.obox(g.kx, g.ky, g.h, 1, 4, -1.25, -0.05, QZ + 1.3, QZ + 2.1), Object.assign({}, st, { fillCol: OPT.colour ? HUE.steel : BLUE, fillA: 0.4 }), seed + 1);
      E3.solid(this.obox(g.kx, g.ky, g.h, 1.7, 4, 0.05, 1.25, QZ + 1.3, QZ + 3.2), Object.assign({}, st, { tone: 0.12, fillCol: OPT.colour ? HUE.steel : BLUE, fillA: 0.5 }), seed + 2);
    };
    const trailer = () => {
      E3.solid(this.obox(tx, ty, g.th, -6.25, 6.25, -1.25, 1.25, QZ + 1.0, QZ + 1.5), Object.assign({}, st, { tone: 0.35, fillCol: INK, fillA: 0.25 }), seed + 3);
      // (along the lanes the box is drawn exactly as on the spreader, so it passes from one to the other unchanged)
      if (g.box !== null && g.box !== undefined) {
        if (g.th === 0) this.drawBox(tx, ty, QZ + 4.09, g.box, a, seed + 4);
        else { const [cc, ck] = this.boxCol(g.box); E3.solid(this.obox(tx, ty, g.th, -6.1, 6.1, -1.22, 1.22, QZ + 1.5, QZ + 4.09), { tone: 0.08, shade: 0.45, lw: 0.8, edgeA: 0.85 * a, noHatch: true, fillCol: cc, fillA: (OPT.colour ? 0.6 : 0.35) * ck }, seed + 4); }
      }
    };
    const dT = R11.dep([g.kx + 1.2 * Math.cos(g.h), g.ky + 1.2 * Math.sin(g.h), QZ + 1.5]), dR = R11.dep([tx, ty, QZ + 1.5]);
    if (dT > dR) { tractor(); trailer(); } else { trailer(); tractor(); }
  },
  drawShip(s, lt, dS) {
    const D = s.D, a = R11.air(dS, 2600), C = this.ec.C;
    const hullSt = { tone: OPT.colour ? 0.6 : 0.86, shade: 0.3, lw: 1.4, edges: false, fillCol: OPT.colour ? '#3E4751' : INK, fillA: OPT.colour ? 0.64 : 0.3, hdir: [1, 0, 0] };
    const vis = s.hull.map((f, i) => { const c = E3.centroid(f), n = s.hn[i]; return n[0] * (C[0] - c[0]) + n[1] * (C[1] - c[1]) + n[2] * (C[2] - c[2]) > 0; });
    s.hull.forEach((f, i) => { if (vis[i]) E3.face(f, Object.assign({}, hullSt, { n: s.hn[i] }), 5000 + s.idx * 97 + i); });
    // the boot-top: the lower 3 m of each face, in the hull's darker tone
    s.boot.forEach((f, i) => { if (vis[i]) E3.face(f, { n: s.hn[i], tone: 0.95, shade: 0.05, edges: false, hdir: [1, 0, 0], fillCol: OPT.colour ? '#1E242B' : INK, fillA: OPT.colour ? 0.72 : 0.42 }, 5100 + s.idx * 97 + i); });
    // her outline: the waterline and the deck edge along the faces toward the eye, the stem and the stern's edges where
    // the side turns away
    const n = s.wl.length, lw = clamp(1.5 * 420 / dS, 0.6, 1.5);
    for (let i = 0; i < n; i++) if (vis[i]) {
      const j = (i + 1) % n;
      E3.line([s.wl[i], s.wl[j]], INK, lw, 0.85 * a); E3.line([s.dk[i], s.dk[j]], INK, lw, 0.9 * a);
      E3.line([s.boot[i][3], s.boot[i][2]], INK, lw * 0.5, 0.5 * a);
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
      // the landward wing behind the wheelhouse, the seaward one in front of it
      E3.solid(s.wings[0], white, 5802 + s.idx * 10);
      E3.solid(s.wheel, white, 5801 + s.idx * 10);
      this.windows(s, s.wheel, D + 38.2, D + 40.3, 9, 1.3, a, true);
      E3.solid(s.wings[1], white, 5803 + s.idx * 10);
      this.windows(s, s.wings[1], D + 38.7, D + 40.1, 9, 1.4, a, true);
      R11.member(s.mast[0], s.mast[1], 1.2, 0.85);
      const m = s.mast[1]; R11.member([m[0], m[1] - 3, m[2] - 2], [m[0], m[1] + 3, m[2] - 2], 0.9, 0.8);
    } });
    items.push({ d: ctr(s.casing), draw: () => {
      E3.solid(s.casing, Object.assign({}, white, { tone: 0.08 }), 5803 + s.idx * 10);
      E3.solid(s.funnel, { tone: 0.3, shade: 0.4, lw: 1.2, edgeA: 0.9 * a, fillCol: OPT.colour ? HUE.steel : null, fillA: 0.45 }, 5804 + s.idx * 10);
      E3.face(s.funnel[1], { n: [0, 0, 1], fillCol: INK, fillA: 0.5, noHatch: true, edges: false }, 5805 + s.idx * 10);
    } });
    items.push({ d: ctr(s.bwater), draw: () => { E3.solid(s.bwater, Object.assign({}, white, { tone: 0.1 }), 5806 + s.idx * 10); R11.member(s.fmast[0], s.fmast[1], 1, 0.8); } });
    // the cranes working her: the box each lifts next, standing one tier on its stack, and the spreader with its ropes
    // and box while it is out over the water (it never rises above her houses' tops, so it is always among her stacks):
    // each just after the stack under it, so the stacks nearer the eye paint over it as they should, inked with its crane
    this.cranes.forEach(c => {
      if (c.raised || c.ship !== s) return;
      const mv = c.mv, b = c.bay, dC = R11.dep(c.parts.mid), aC = R11.air(dC, 2600);
      const key = y => { const w = y - s.YC, q = b.cells.find(e => w >= e.wa - 0.01 && w <= e.wb + 0.01); return q ? Math.min(at(c.x, y), at(b.xc, s.YC + (q.wa + q.wb) / 2)) : at(c.x, y); };
      if (mv.stack) { const B = mv.stack; items.push({ d: key(B.yP) - 0.01, draw: () => this.inked(c.x, () => this.drawBox(c.x, B.yP, B.zP, B.col, aC, 4620 + c.i)) }); }
      if (mv.y < this.YW && mv.low) items.push({ d: key(mv.y) - 0.02, draw: () => this.inked(c.x, () => this.drawHoist(c, mv, dC)) });
    });
    items.sort((p, q) => q.d - p.d).forEach(it => it.draw());
    this.boomShadows(s, a);
  },
  // the shadows the lowered booms working her throw across her stacks (laid on the stacks' mean top), so each boom reads
  // as crossing the deck under it
  boomShadows(s, a) {
    const S = E3.sun(), zs = s.D + 1 + 2.59 * 9, zb = this.ZT - 4, kx = -S[0] / S[2] * (zb - zs), ky = -S[1] / S[2] * (zb - zs);
    const deck = s.dk.map(p => E3.proj([p[0], p[1], zs])), bb = [Math.min(...deck.map(q => q[0])), Math.min(...deck.map(q => q[1])), Math.max(...deck.map(q => q[0])), Math.max(...deck.map(q => q[1]))];
    const polys = [];
    this.cranes.forEach(c => {
      if (c.raised || c.ship !== s) return;
      const w = 3.2, q = [[c.x - w, this.YW], [c.x + w, this.YW], [c.x + w * 0.75, this.YW - this.REACH], [c.x - w * 0.75, this.YW - this.REACH]];
      polys.push(new P(q.map(([x, y]) => E3.proj([x + kx, y + ky, zs])), true));
    });
    if (!polys.length) return;
    ctx.save(); ctx.beginPath(); new P(deck, true).trace(ctx, 1); ctx.clip();
    polys.forEach((sp, i) => {
      const q = sp.pts, pb = [Math.min(...q.map(v => v[0])), Math.min(...q.map(v => v[1])), Math.max(...q.map(v => v[0])), Math.max(...q.map(v => v[1]))];
      const ang = Math.atan2(q[2][1] - q[1][1], q[2][0] - q[1][0]) + Math.PI / 2 - 0.35;
      if (OPT.colour) wash(sp, HUE.deep, 0.3 * a); else fill(sp, INK, 0.1 * a);
      hatch(sp, pb, ang, 1.9, 1, INK, 0.6, 0.4 * a, 5950 + s.idx * 20 + i);
    });
    ctx.restore();
  },
  // dark window bands on the faces of a block that turn toward the eye
  windows(s, f, z0, z1, pitch, h, a, band) {
    const xs = f[0].map(p => p[0]), ys = f[0].map(p => p[1]), X0 = Math.min(...xs), X1 = Math.max(...xs), Y0 = Math.min(...ys), Y1 = Math.max(...ys), C = this.ec.C;
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
    const [cc, ck] = this.boxCol(c.col);
    E3.solid(E3.box(b.xa, b.xb, y0, y1, D + 1, c.z1), { tone: 0.05, shade: 0.45, lw: 0.9, edgeA: 0.78 * a, fillCol: cc, fillA: (OPT.colour ? 0.44 : 0.22) * ck, noHatch: !near }, seed);
    const L = [], xe = this.ec.C[0] < b.xa ? b.xa - 0.02 : b.xb + 0.02;
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
    // the wake: feathered crests along the two arms of the V (19.5 degrees either side of her track), each crest a short
    // stroke turned out from the arm, and broken water in her track close astern; all fading as they spread
    const w = [], ext = t.pilot ? 42 : 80, st = t.pilot ? 3.2 : 4.5, cl = t.pilot ? 1.8 : 3;
    for (let rho = st; rho < ext; rho += st) {
      const f = 1 - rho / ext, u0 = -L - rho * Math.cos(0.34), v0 = rho * Math.sin(0.34) + B * 0.5;
      [-1, 1].forEach(sg => {
        const ang = Math.PI - sg * 0.95, du = Math.cos(ang) * cl / 2, dv = Math.sin(ang) * cl / 2 * sg;
        w.push([P(u0 - du, sg * v0 - dv * sg, 0), P(u0 + du, sg * v0 + dv * sg, 0), 0.75 * f]);
      });
    }
    for (let j = 0; j < (t.pilot ? 7 : 12); j++) {
      const u = -L - 1.5 - j * 2.6, hw = (t.pilot ? 1.2 : 2.2) * (1 + j * 0.08), o = ((j * 7) % 5 - 2) * 0.4;
      w.push([P(u, -hw + o, 0), P(u - 0.6, hw + o, 0), 0.55 * (1 - j / 13)]);
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
    for (let i = 0; i < fb.length - 1; i++) {
      const m = E3.centroid([fl[i], fl[i + 1]]), nh = Math.hypot(m[0] - p[0], m[1] - p[1]) || 1;
      E3.face([fl[i], fl[i + 1], fb[i + 1], fb[i]], { n: [(m[0] - p[0]) / nh, (m[1] - p[1]) / nh, 0], fillCol: INK, fillA: 0.55, noHatch: true, edges: false }, 5620 + k * 20 + i);
    }
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
