'use strict';
// Revision 11 · Jebel Ali in its might: a working quay seen from the harbour, a line of ship-to-shore cranes over
// four ultra-large container ships, the stacked yard behind, rising to show how far the line runs. True 3D
// (engrave3d.js), metres: x along the quay, y inland (the water is y < 0), z up, the harbour surface at z 0.
// Sizes from the class of ship and crane that works the port (see TREATMENT.md Revision 11 for the sources):
//   ship: 400 m long, 61 m beam, main deck 18 m above the water at this draught, bridge about a quarter of her length
//   from the bow, 40-foot bays (12.2 m) with lashing bridges between, up to 10 tiers on deck (2.59 m a box);
//   crane (Terminal 3's, as DP World specified them): 69.5 m lifting height, a reach across ships 25 containers wide
//   (70 m outreach), 30.5 m between rails, 20 m backreach, the apex about 104 m up; idle, the boom stands raised, its tip
//   about 140 m up (DP World: over 138 m at full boom extension). Yard blocks run parallel to the quay, 5-6 high, 10 wide,
//   under rail-mounted gantries.
scene({
  id: 'jebelali',
  start: 0, dur: 8.333,
  init() {
    const r = rng(1107);
    const QZ = 4.5; // the quay deck above the water
    this.QZ = QZ;
    // four ships along the quay, far ones smaller; bow +1 points along +x
    this.ships = [[-120, 400, -1], [320, 400, 1], [770, 366, -1], [1190, 400, 1]].map(([x0, L, bow], i) => this.ship(x0, L, bow, r, i));
    // the cranes: six or seven working each ship, one or two idle with the boom raised between the berths, and the line
    // running on beyond the last ship
    this.cranes = [];
    const work = (x0, L, n) => { for (let k = 0; k < n; k++) this.cranes.push({ x: x0 + L * (k + 0.5) / n, raised: false, ph: r() }); };
    work(-120, 400, 6); work(320, 400, 7); work(770, 366, 6); work(1190, 400, 6);
    [285, 735, 1628, 1690, 1760, 1840, 1930, 2020, 2110, 2200].forEach(x => this.cranes.push({ x, raised: true, ph: 0 }));
    this.cranes.forEach((c, i) => { c.i = i; c.parts = this.crane(c.x, c.raised); });
    // the yard: long even blocks parallel to the quay, 10 boxes wide (25 m), 5-6 high, a rail-mounted gantry over each
    this.yard = [];
    for (let row = 0; row < 7; row++) for (let bx = -300; bx < 2600; bx += 290) {
      const y0 = 78 + row * 42, tiers = 5 + Math.floor(r() * 2);
      this.yard.push({ x0: bx, x1: bx + 262, y0, y1: y0 + 25, z1: QZ + 2.59 * tiers, rtg: true, gx: bx + 30 + r() * 200, col: r() });
    }
    // the free zone's low sheds on the far ground, and its ground line
    this.sheds = [];
    for (let k = 0; k < 26; k++) { const x0 = -200 + k * 120 + r() * 40, y0 = 480 + r() * 500; this.sheds.push({ x0, x1: x0 + 60 + r() * 90, y0, y1: y0 + 40 + r() * 60, z1: 12 + r() * 14 }); }
    // ripples on the harbour: short strokes lying on the water, denser toward the eye
    this.ripples = [];
    for (let k = 0; k < 900; k++) { const x = -500 + r() * 3200, y = -70 - Math.pow(r(), 0.7) * 700; this.ripples.push([x, y, 3 + r() * 9, r()]); }
    // a harbour tug working at the second ship's quarter, and a pilot boat crossing
    this.tugs = [{ x: 380, y: -92, head: 0.12, L: 32, B: 12 }, { x: 610, y: -300, head: 0.04, L: 18, B: 6, pilot: true }];
  },
  // one ship: hull (midbody, bow wedge, stern), boot-top, deck bays, bridge, engine casing
  ship(x0, L, bow, r, idx) {
    const y0 = -64, y1 = -3, D = 18, xs = t => bow > 0 ? x0 + t * L : x0 + L - t * L; // t 0 at the stern, 1 at the bow
    const s = { x0, L, bow, idx, bays: [], D };
    const lo = Math.min(xs(0.14), xs(0.84)), hi = Math.max(xs(0.14), xs(0.84));
    s.mid = E3.box(lo, hi, y0, y1, 0, D);
    // the bow: from the full section to the stem, a convex wedge (the flare above the water)
    const xb0 = xs(0.84), xb1 = xs(1), sy = (y0 + y1) / 2;
    s.bowF = [[[xb0, y0, 0], [xb0, y1, 0], [xb0, y1, D], [xb0, y0, D]], [[xb0, y0, 0], [xb1, sy, 0], [xb1, sy, D + 2], [xb0, y0, D]],
      [[xb0, y1, 0], [xb0, y1, D], [xb1, sy, D + 2], [xb1, sy, 0]], [[xb0, y0, D], [xb0, y1, D], [xb1, sy, D + 2]]];
    // the stern: a little narrower to the transom, its lower edge just clear of the water
    const xt0 = xs(0), xt1 = xs(0.14);
    s.sternF = [[[xt1, y0, 0], [xt1, y1, 0], [xt1, y1, D], [xt1, y0, D]], [[xt0, y0 + 4, 5], [xt0, y1 - 4, 5], [xt0, y1 - 4, D], [xt0, y0 + 4, D]],
      [[xt0, y0 + 4, 5], [xt1, y0, 0], [xt1, y0, D], [xt0, y0 + 4, D]], [[xt0, y1 - 4, 5], [xt0, y1 - 4, D], [xt1, y1, D], [xt1, y1, 0]],
      [[xt0, y0 + 4, D], [xt1, y0, D], [xt1, y1, D], [xt0, y1 - 4, D]], [[xt0, y0 + 4, 5], [xt0, y1 - 4, 5], [xt1, y1, 0], [xt1, y0, 0]]];
    // the boot-top: a red band from the water to 3 m up, on the side toward us
    s.boot = [[Math.min(xt0, xb1), y0 - 0.05, 0], [Math.max(xt0, xb1), y0 - 0.05, 0], [Math.max(xt0, xb1), y0 - 0.05, 3], [Math.min(xt0, xb1), y0 - 0.05, 3]];
    // the bridge a quarter of her length from the bow, the engine casing and funnel near the stern
    const xbr = xs(0.72);
    s.bridge = { f: E3.box(xbr - 8, xbr + 8, y0 + 10, y1 - 10, D, D + 34), wing: E3.box(xbr - 5, xbr + 5, y0, y1, D + 30, D + 35), mast: [[xbr, sy, D + 35], [xbr, sy, D + 44]] };
    const xf = xs(0.12);
    s.casing = E3.box(xf - 9, xf + 9, y0 + 18, y1 - 18, D, D + 26);
    s.funnel = E3.box(xf - 5, xf + 5, y0 + 24, y1 - 24, D + 26, D + 32);
    // 40-foot bays with lashing bridges, the stacks' tops stepped across the beam as real stowage is
    const skip = x => Math.abs(x - xbr) < 12 || Math.abs(x - xf) < 13;
    for (let t = 0.03; t < 0.9; t += 13.6 / L) {
      const xa = xs(t), xz = xs(t + 12.2 / L), a = Math.min(xa, xz), b = Math.max(xa, xz), xc = (a + b) / 2;
      if (skip(xc)) continue;
      const fine = t > 0.8 ? 0.6 : 1; // the stacks step down into the bow
      const cells = [0, 1, 2].map(k => ({ ya: y0 + 2 + k * 19, yb: y0 + 2 + (k + 1) * 19, tiers: Math.max(4, Math.round((8 + r() * 4) * fine)) }));
      const cols = Array.from({ length: 12 }, () => r());
      s.bays.push({ a, b, xc, cells, cols });
    }
    return s;
  },
  // one ship-to-shore crane at x: legs, portal, girder and boom, machinery house, A-frame and stays; its boom lowered
  // over the ship, or raised when idle
  crane(xc, raised) {
    const QZ = this.QZ, yW = 4, yL = 34.5, zG = QZ + 71, zT = zG + 4, c = { xc, raised };
    c.legs = [[-9, yW], [9, yW], [-9, yL], [9, yL]].map(([dx, y]) => E3.box(xc + dx - 1.3, xc + dx + 1.3, y - 1.3, y + 1.3, QZ, zG));
    c.sills = [-9, 9].map(dx => [[xc + dx, yW, QZ + 16], [xc + dx, yL, QZ + 16]]);
    c.braces = [-9, 9].map(dx => [[xc + dx, yW, QZ + 16], [xc + dx, yL, zG - 4]]);
    c.cross = [yW, yL].map(y => E3.box(xc - 10, xc + 10, y - 1.2, y + 1.2, zG - 3, zG));
    c.back = E3.box(xc - 6, xc + 6, yW, yL + 20, zG, zT); // the girder over the quay and the backreach
    c.house = E3.box(xc - 6.5, xc + 6.5, yL + 3, yL + 17, zT, zT + 6);
    const hinge = [xc, yW, zT], ang = raised ? 80 * Math.PI / 180 : 0, reach = 70;
    const tip = [xc, yW - reach * Math.cos(ang), zT + reach * Math.sin(ang)];
    const u = [0, -Math.cos(ang), Math.sin(ang)], nrm = [0, Math.sin(ang), Math.cos(ang)];
    const P4 = (d, h, dx) => [xc + dx, yW + u[1] * d - nrm[1] * h, zT + u[2] * d - nrm[2] * h];
    // the boom: a box girder about 7 m across at the hinge, narrowing to 5 m at the tip, 4 m deep
    c.boom = [[P4(0, 0, -3.5), P4(reach, 0, -2.5), P4(reach, 0, 2.5), P4(0, 0, 3.5)], [P4(0, 4, -3.5), P4(reach, 3, -2.5), P4(reach, 3, 2.5), P4(0, 4, 3.5)],
      [P4(0, 0, -3.5), P4(reach, 0, -2.5), P4(reach, 3, -2.5), P4(0, 4, -3.5)], [P4(0, 0, 3.5), P4(0, 4, 3.5), P4(reach, 3, 2.5), P4(reach, 0, 2.5)],
      [P4(reach, 0, -2.5), P4(reach, 0, 2.5), P4(reach, 3, 2.5), P4(reach, 3, -2.5)]];
    const apex = [xc, yW + 17, QZ + 104];
    c.aframe = [[[xc - 9, yW, zT], apex], [[xc + 9, yW, zT], apex], [[xc - 9, yL, zT], apex], [[xc + 9, yL, zT], apex]];
    c.stays = [[apex, P4(reach * 0.45, 0, 0)], [apex, P4(reach * 0.9, 0, 0)], [apex, [xc, yL + 20, zT]]];
    c.tip = tip; c.hinge = hinge; c.zT = zT;
    return c;
  },
  // this frame's camera, and where the horizon and the quay edge fall on screen (the colour washes follow them)
  frame(lt) {
    this.view(lt);
    const B = R11.BOX, hz = E3.projDir([1, 0.05, 0]), hy = hz ? hz[1] : 420;
    this.horizonY = hy;
    // the quay edge from beside the eye to far along the line, where it meets the horizon
    const qa = E3.proj([-40, 0, this.QZ]), qb = E3.proj([30000, 0, this.QZ]);
    // extend the edge to the box's left side, so the land and the water share one border
    const k = (B[0] - 400 - qb[0]) / (qa[0] - qb[0]), q0 = [B[0] - 400, qb[1] + (qa[1] - qb[1]) * k];
    this.land = new P([q0, qb, [B[0] - 400, hy]], true);
    this.water = new P([q0, qb, [B[2] + 400, hy], [B[2] + 400, B[3] + 400], [B[0] - 400, B[3] + 400]], true);
    this.qb = qb;
  },
  // colour: a morning sky with haze on the land, the harbour water deepening toward the eye
  under(lt) {
    this.frame(lt);
    const q = easeInOut(prog(lt, 0.1, 1.2)), hy = this.horizonY, B = R11.BOX;
    washFade([B[0], -300, B[2], hy + 2], [[0, HUE.sky, 0.46], [0.75, HUE.sky, 0.3], [1, HUE.dawn, 0.26]], 0, q);
    washFade([B[0], hy - 2, B[2], B[3]], [[0, HUE.sand, 0.3], [1, HUE.sand, 0.2]], 0, q, this.land);
    washFade([B[0], hy - 2, B[2], B[3]], [[0, HUE.sea, 0.4], [0.35, HUE.sea, 0.55], [1, HUE.deep, 0.62]], 0, q, this.water);
  },
  view(lt) {
    // off the first ship's quarter, looking across the berths along the line; a slow truck and rise over the beat
    // shows how far it runs and the yard behind it
    const u = easeInOut(clamp((lt - 0.6) / 8.4)), X = lerp(40, 140, u), Z = lerp(50, 122, u), Y = lerp(-175, -238, u);
    return E3.camera([X, Y, Z], [X + 380, 60, lerp(30, 0, u)], 1000, 560, 450);
  },
  draw(lt) {
    const QZ = this.QZ;
    E3.sunAt(215, 36); // mid-morning, the sun over the harbour behind the eye's left shoulder
    R11.clipped(() => {
      this.frame(lt);
      const ink = (x, d) => easeOut(prog(lt, 0.15 + clamp((x + 200) / 2600) * 1.4, 0.7)); // the plate inks in along the quay
      // the far ground: the horizon, the free zone's sheds in haze
      stroke(new P([[R11.BOX[0], this.horizonY], [R11.BOX[2], this.horizonY]]), easeInOut(prog(lt, 0.1, 0.9)), INK, 1, 0.4);
      const list = [];
      this.sheds.forEach((b, k) => list.push({ d: R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 0]), draw: () => R11.faded(ink(b.x0) * 0.8, () => {
        const a = R11.air(R11.dep([b.x0, b.y0, 0]));
        E3.solid(E3.box(b.x0, b.x1, b.y0, b.y1, QZ, QZ + b.z1), { tone: 0.15, shade: 0.5, lw: 0.8, edgeA: 0.55 * a, noHatch: true, fillCol: OPT.colour ? HUE.sand : SEPIA, fillA: 0.25 }, 3000 + k);
        E3.line([[b.x0 - 30, b.y0 - 8, QZ], [b.x1 + 30, b.y0 - 8, QZ]], INK, 0.6, 0.3 * a);
      }) }));
      // the yard's blocks; a gantry spans some of them
      this.yard.forEach((b, k) => {
        const d = R11.dep([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, b.z1 / 2]);
        list.push({ d, draw: () => R11.faded(ink(b.x0), () => {
          const a = R11.air(d), cc = OPT.colour ? [HUE.teak, HUE.deep, HUE.leaf, HUE.gold, HUE.steel][Math.floor(b.col * 5)] : [RED, BLUE, OCHRE, SEPIA, SEPIA][Math.floor(b.col * 5)];
          const f = E3.solid(E3.box(b.x0, b.x1, b.y0, b.y1, QZ, b.z1), { tone: 0.08, shade: 0.5, lw: 0.9, edgeA: 0.7 * a, fillCol: cc, fillA: 0.28 * a, noHatch: d > 900 }, 3100 + k);
          // the boxes' ends and tiers on the face toward the water
          if (d < 1300) for (let z = QZ + 2.59; z < b.z1 - 0.1; z += 2.59) E3.line([[b.x0, b.y0, z], [b.x1, b.y0, z]], INK, 0.6, 0.35 * a);
          if (b.rtg && d < 1800) {
            const g0 = b.gx, zz = QZ + 26;
            [[g0 - 4, b.y0 - 3], [g0 - 4, b.y1 + 3], [g0 + 4, b.y0 - 3], [g0 + 4, b.y1 + 3]].forEach(([x, y]) => R11.member([x, y, QZ], [x, y, zz], 1, 0.65));
            [-4, 4].forEach(dx => R11.member([g0 + dx, b.y0 - 3, zz], [g0 + dx, b.y1 + 3, zz], 1.3, 0.8));
          }
        }) });
      });
      // the quay: its deck edge and face, fenders at every berth, a bollard line
      list.push({ d: R11.dep([900, 20, QZ]) + 400, draw: () => R11.faded(easeInOut(prog(lt, 0.1, 0.8)), () => {
        E3.face([[-600, 0, 0], [2800, 0, 0], [2800, 0, QZ], [-600, 0, QZ]], { n: [0, -1, 0], tone: 0.35, shade: 0.3, hdir: [0, 0, 1], lw: 1.2 }, 3900);
        E3.line([[-600, 0, QZ], [2800, 0, QZ]], INK, 1.6, 0.85);
        E3.line([[-600, 70, QZ], [2800, 70, QZ]], INK, 0.9, 0.35);
      }) });
      // the cranes (their structure behind the ships; the lowered booms over the ships are drawn after them)
      this.cranes.forEach(c => {
        const p = c.parts, d = R11.dep([c.x, 19, QZ + 40]);
        list.push({ d, draw: () => R11.faded(ink(c.x), () => this.craneFrame(p, d, lt, c)) });
        list.push({ d: c.raised ? d - 1 : R11.dep([c.x, -64, QZ + 55]) - 2, draw: () => R11.faded(ink(c.x), () => this.craneBoom(p, lt, c)) });
      });
      // the ships
      this.ships.forEach(s => list.push({ d: R11.dep([s.x0 + s.L / 2, -34, 10]), draw: () => R11.faded(ink(s.x0 + s.L / 2), () => this.drawShip(s, lt)) }));
      // the tugs
      this.tugs.forEach((t, k) => {
        const tx = t.x + (t.pilot ? 9 * lt : 0.6 * Math.sin(lt * 0.8));
        list.push({ d: R11.dep([tx, t.y, 3]), draw: () => R11.faded(easeOut(prog(lt, 1.2 + k * 0.3, 0.6)), () => this.drawTug(t, tx, lt, k)) });
      });
      // the water: ripples lying on the surface, heavier toward the eye; they drift with the breeze
      const rq = easeInOut(prog(lt, 0.3, 1.2)), segs = [];
      this.ripples.forEach(([x, y, l, ph]) => {
        const xx = x + ((lt * 1.2 + ph * 40) % 40) - 20, a = E3.proj([xx, y, 0]);
        if (a[1] < this.quayY + 2) return; // the water between the ships lies under their hulls
        segs.push([[xx - l / 2, y, 0], [xx + l / 2, y, 0], rq * (0.35 + 0.4 * ph)]);
      });
      E3.segments(segs, OPT.colour ? HUE.deep : BLUE, 1.1);
      R11.paint(list);
    });
    E3.sunAt();
  },
  craneFrame(p, d, lt, c) {
    const a = R11.air(d), st = { tone: 0.12, shade: 0.55, lw: 1.4, edgeA: 0.9 * a, noHatch: d > 1100 };
    p.legs.forEach((f, i) => E3.solid(f, st, 4000 + c.i * 20 + i));
    p.sills.concat(p.braces).forEach(([m, n]) => R11.member(m, n, 1.1, 0.7));
    p.cross.forEach((f, i) => E3.solid(f, st, 4100 + c.i * 20 + i));
    E3.solid(p.back, st, 4200 + c.i);
    E3.solid(p.house, Object.assign({}, st, { tone: 0.2, fillCol: OPT.colour ? '#E8E2D2' : null, fillA: 0.5 }), 4300 + c.i);
    p.aframe.forEach(([m, n]) => R11.member(m, n, 1.8, 0.9));
    p.stays.forEach(([m, n]) => R11.member(m, n, 0.7, 0.6));
  },
  craneBoom(p, lt, c) {
    const d = R11.dep(p.tip), a = R11.air(d);
    E3.solid(p.boom, { tone: 0.12, shade: 0.55, lw: 1.1, edgeA: 0.85 * a, noHatch: d > 1100 }, 4400 + c.i);
    if (c.raised || lt < 0.9) return;
    // the trolley runs out over the ship, the spreader goes down for a box and comes back up with it (one cycle ~ 90 s
    // in life; time runs about 12x here so a move reads in the beat)
    const ph = (lt / 7.5 + c.ph) % 1, out = 0.5 - 0.5 * Math.cos(ph * TAU), y = lerp(12, -52, out), zT = p.zT;
    const low = Math.pow(Math.sin(ph * Math.PI), 6), zS = lerp(zT - 6, 18 + 2.59 * 10, low), load = ph > 0.5;
    const xc = p.xc;
    E3.solid(E3.box(xc - 4, xc + 4, y - 3, y + 3, zT - 3, zT), { tone: 0.3, shade: 0.4, lw: 0.9, edgeA: 0.8 * a, noHatch: true }, 4500 + c.i);
    [[-3, -2], [3, -2], [-3, 2], [3, 2]].forEach(([dx, dy]) => E3.line([[xc + dx * 0.6, y + dy * 0.6, zT - 3], [xc + dx, y + dy * 0.4, zS + 1]], INK, clamp(0.6 * 260 / d, 0.3, 1), 0.7 * a));
    E3.line([[xc - 6.1, y, zS + 1], [xc + 6.1, y, zS + 1]], INK, clamp(1.4 * 260 / d, 0.4, 1.8), 0.9 * a);
    if (load) E3.solid(E3.box(xc - 6.1, xc + 6.1, y - 1.22, y + 1.22, zS - 1.6, zS + 1), { tone: 0.1, shade: 0.4, lw: 0.8, edgeA: 0.8 * a, noHatch: true, fillCol: OPT.colour ? HUE.teak : RED, fillA: 0.6 }, 4600 + c.i);
  },
  drawShip(s, lt) {
    const D = s.D, d = R11.dep([s.x0 + s.L / 2, -34, 10]), a = R11.air(d);
    const hullSt = { tone: 0.35, shade: 0.5, lw: 1.5, edgeA: 0.9 * a, fillCol: OPT.colour ? HUE.deep : null, fillA: 0.35, hdir: [1, 0, 0] };
    E3.solid(s.sternF, hullSt, 5000 + s.idx * 50); E3.solid(s.mid, hullSt, 5010 + s.idx * 50); E3.solid(s.bowF, hullSt, 5020 + s.idx * 50);
    E3.face(s.boot, { n: [0, -1, 0], fillCol: RED, fillA: 0.7, noHatch: true, edges: false }, 5030 + s.idx * 50);
    // the deck: bays from the far end to the near one, the bridge and the casing in their places among them
    const items = s.bays.map(b => ({ x: b.xc, draw: () => this.bay(s, b, a) }));
    items.push({ x: (s.bridge.f[0][0][0] + s.bridge.f[0][1][0]) / 2, draw: () => {
      E3.solid(s.bridge.f, { tone: 0.05, shade: 0.45, lw: 1.3, edgeA: 0.9 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.6 }, 5040 + s.idx * 50);
      E3.solid(s.bridge.wing, { tone: 0.05, shade: 0.45, lw: 1.3, edgeA: 0.9 * a, fillCol: OPT.colour ? '#F1EBDD' : null, fillA: 0.6 }, 5041 + s.idx * 50);
      const [m0, m1] = s.bridge.mast; R11.member(m0, m1, 1.2, 0.8);
      // the bridge windows, a dark band on the face toward us
      const f = s.bridge.wing, y = -64.05, x0 = Math.min(f[0][0][0], f[0][1][0]), x1 = Math.max(f[0][0][0], f[0][1][0]), z = D + 31.5;
      E3.face([[x0, y, z], [x1, y, z], [x1, y, z + 2], [x0, y, z + 2]], { n: [0, -1, 0], fillCol: INK, fillA: 0.55, noHatch: true, edges: false }, 5042 + s.idx * 50);
    } });
    items.push({ x: (s.casing[0][0][0] + s.casing[0][1][0]) / 2, draw: () => {
      E3.solid(s.casing, { tone: 0.1, shade: 0.5, lw: 1.2, edgeA: 0.85 * a }, 5043 + s.idx * 50);
      E3.solid(s.funnel, { tone: 0.4, shade: 0.4, lw: 1.2, edgeA: 0.85 * a }, 5044 + s.idx * 50);
    } });
    // the eye looks along +x: the far (larger x) bays first
    items.sort((p, q) => q.x - p.x).forEach(it => it.draw());
  },
  bay(s, b, a) {
    const D = s.D, near = a > 0.6;
    b.cells.forEach((c, k) => {
      const z1 = D + 1 + 2.59 * c.tiers, colI = Math.floor(b.cols[k] * 6);
      const cc = OPT.colour ? [HUE.teak, HUE.deep, HUE.leaf, HUE.gold, HUE.steel, '#C9C2B2'][colI] : [RED, BLUE, OCHRE, SEPIA, INK, SEPIA][colI];
      E3.solid(E3.box(b.a, b.b, c.ya, c.yb, D + 1, z1), { tone: 0.06, shade: 0.45, lw: 0.9, edgeA: 0.75 * a, fillCol: cc, fillA: 0.42, noHatch: !near }, 5100 + k);
      // tiers on the outboard face, and the box ends on the face toward the eye (the aft or fore end of the bay)
      if (k === 0) for (let z = D + 1 + 2.59; z < z1 - 0.1; z += 2.59) E3.line([[b.a, c.ya - 0.02, z], [b.b, c.ya - 0.02, z]], INK, 0.6, 0.5 * a);
      if (near) for (let y = c.ya + 2.44; y < c.yb - 0.1; y += 2.44) E3.line([[b.a, y, D + 1], [b.a, y, z1]], INK, 0.5, 0.35 * a);
    });
  },
  drawTug(t, x, lt, k) {
    const c = Math.cos(t.head), s = Math.sin(t.head), P = (u, v, z) => [x + u * c - v * s, t.y + u * s + v * c, z];
    const L = t.L / 2, B = t.B / 2;
    const hull = [[P(-L, -B, 0), P(L * 0.7, -B, 0), P(L, 0, 0), P(L * 0.7, B, 0), P(-L, B, 0)].map(q => q), [P(-L, -B, 2.5), P(L * 0.7, -B, 2.5), P(L, 0, 3), P(L * 0.7, B, 2.5), P(-L, B, 2.5)]];
    const sides = [];
    for (let i = 0; i < 5; i++) { const j = (i + 1) % 5; sides.push([hull[0][i], hull[0][j], hull[1][j], hull[1][i]]); }
    E3.solid(sides.concat([hull[1]]), { tone: 0.3, shade: 0.5, lw: 1.1, fillCol: t.pilot ? OCHRE : RED, fillA: 0.5 }, 5600 + k);
    E3.solid(E3.box(x - L * 0.2, x + L * 0.25, t.y - B * 0.6, t.y + B * 0.6, 2.5, t.pilot ? 5 : 7), { tone: 0.05, shade: 0.4, lw: 1, fillCol: '#F1EBDD', fillA: 0.5 }, 5610 + k);
    if (!t.pilot) {
      // her wash at the ship's side as she pushes
      const w = []; for (let j = 0; j < 14; j++) { const u = -L - j * 3; w.push([P(u, -B - j * 0.3, 0), P(u - 2, -B - j * 0.3, 0), 0.5 - j * 0.03]); }
      E3.segments(w, INK, 1);
    }
  },
});
