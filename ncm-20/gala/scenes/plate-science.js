'use strict';
// XI · Al ʿIlm — the science of rain, a plate of four figures: the seeding nanomaterial (Khalifa University and NCM,
// patent WO2018069388A1), a droplet growing on a salt nucleus (the physics of hygroscopic seeding), the numerical
// weather model on NCM's Atmosphere supercomputer (2.8 petaflops peak, 2021), and machine learning.
// (v3's charge-emitting drone and laser figures are left out: in 2026 they could read as weapons.)
scene({
  id: 'science', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 86, dur: 8, speed: 11 / 8, num: 'XI', name: 'AL ‘ILM', ar: 'العلم', readout: '6 AWARD CYCLES · 2016 — 2026',
  kicker: 'UAEREP · SINCE 2015 · 17 PROJECTS · 8 PATENTS',
  head: ['WE FUNDED', 'THE SCIENCE', 'OF RAIN.'], accent: { 'RAIN.': BLUE },
  arHead: 'ودعمنا علوم الاستمطار',
  init() {
    this.cells = [[1010, 170], [1440, 170], [1010, 520], [1440, 520]].map(([x, y], i) => ({
      x, y, outer: pl([[x, y], [x + 400, y], [x + 400, y + 320], [x, y + 320]], true, 300 + i, 0.5),
      inner: pl([[x + 7, y + 7], [x + 393, y + 7], [x + 393, y + 313], [x + 7, y + 313]], true, 310 + i, 0.4),
    }));
    this.caps = ['FIG. I · NANOMATERIAL', 'FIG. II · HYGROSCOPIC GROWTH', 'FIG. III · WEATHER MODEL', 'FIG. IV · MACHINE LEARNING'];
    this.capsAr = ['مادة نانوية', 'نموّ القطيرة على نواة ملحية', 'النمذجة العددية للطقس', 'تعلّم الآلة'];
    // Fig I: salt core in a titanium-dioxide shell
    this.shellO = el(1210, 318, 92, 92, 0, TAU, 320, 0.5); this.shellI = el(1210, 318, 76, 76, 0, TAU, 321, 0.5);
    const sq = [];
    for (let i = 0; i < 4; i++) { const a = 0.2 + Math.PI / 4 + (i * Math.PI) / 2; sq.push([1210 + 64 * Math.cos(a), 318 + 64 * Math.sin(a)]); }
    this.core = new P(sq, true);
    this.lattice = [];
    for (let j = 1; j < 4; j++) {
      const f = j / 4;
      this.lattice.push(new P([[lerp(sq[0][0], sq[1][0], f), lerp(sq[0][1], sq[1][1], f)], [lerp(sq[3][0], sq[2][0], f), lerp(sq[3][1], sq[2][1], f)]]));
      this.lattice.push(new P([[lerp(sq[0][0], sq[3][0], f), lerp(sq[0][1], sq[3][1], f)], [lerp(sq[1][0], sq[2][0], f), lerp(sq[1][1], sq[2][1], f)]]));
    }
    this.sats = [0.5, 1.9, 2.9, 4.05].map(a => [1210 + 128 * Math.cos(a), 318 + 118 * Math.sin(a)]);
    // Fig II: a salt nucleus in moist air; water vapour condenses on it and the droplet grows, then collects a neighbour
    this.nuc = { x: 1640, y: 318 };
    const rv = rng(52);
    this.vapour = Array.from({ length: 46 }, (_, i) => ({ a: rv() * TAU, r0: 70 + rv() * 70, sp: 0.6 + rv() * 0.8, ph: rv() }));
    // Fig III: a model grid laid over the UAE (data/uae-map.js), with smooth analysis contours across it
    const b = UAE_MAP.projection.bbox_array, KX = Math.cos(24.4 * Math.PI / 180), bx = { x: 1040, y: 572, w: 340, h: 214 };
    const sc = Math.min(bx.w / ((b[2] - b[0]) * KX), bx.h / (b[3] - b[1])), mx0 = bx.x + (bx.w - (b[2] - b[0]) * KX * sc) / 2, my0 = bx.y + (bx.h - (b[3] - b[1]) * sc) / 2;
    const pr = ([lon, lat]) => [mx0 + (lon - b[0]) * KX * sc, my0 + (b[3] - lat) * sc];
    this.mini = UAE_MAP.arcs.items.filter(a => a.type === 'coast' || a.type === 'land_border').map(a => new P(a.points.map(pr)));
    this.gridBox = bx;
    // contours of a smooth field by marching squares (schematic: no values are shown)
    const field = (x, y) => Math.sin((x - bx.x) / 70) * 0.6 + Math.cos((y - bx.y) / 55 + (x - bx.x) / 160) * 0.8;
    this.isoSegs = [];
    const st = 6;
    for (let lev = -1.0; lev <= 1.0001; lev += 0.4) {
      for (let x = bx.x; x < bx.x + bx.w; x += st) for (let y = bx.y; y < bx.y + bx.h; y += st) {
        const c = [[x, y], [x + st, y], [x + st, y + st], [x, y + st]], v = c.map(([a, b2]) => field(a, b2) - lev), pts = [];
        for (let k = 0; k < 4; k++) { const a0 = v[k], a1 = v[(k + 1) % 4]; if (a0 * a1 < 0) { const f = a0 / (a0 - a1), p0 = c[k], p1 = c[(k + 1) % 4]; pts.push([p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f]); } }
        if (pts.length >= 2) this.isoSegs.push([pts[0], pts[1]]);
        if (pts.length === 4) this.isoSegs.push([pts[2], pts[3]]);
      }
    }
    // Fig IV: a small network whose output is a raindrop
    const layers = [4, 5, 4], xs = [1500, 1590, 1680];
    this.nodes = [];
    layers.forEach((n, li) => { for (let j = 0; j < n; j++) this.nodes.push({ x: xs[li], y: 680 - ((n - 1) * 46) / 2 + j * 46, l: li }); });
    this.out = { x: 1772, y: 680 };
    this.edges = [];
    this.nodes.forEach(a => this.nodes.forEach(b => { if (b.l === a.l + 1) this.edges.push(new P([[a.x, a.y], [b.x, b.y]])); }));
    this.nodes.filter(n => n.l === 2).forEach(a => this.edges.push(new P([[a.x, a.y], [this.out.x, this.out.y]])));
    const ox = this.out.x, oy = this.out.y, bottom = [];
    for (let i = 0; i <= 20; i++) { const a = (Math.PI * i) / 20; bottom.push([ox + 16 * Math.cos(a), oy + 4 + 16 * Math.sin(a)]); }
    this.dropP = new P(quad([ox, oy - 30], [ox + 6, oy - 14], [ox + 16, oy + 4], 12).concat(bottom.slice(1), quad([ox - 16, oy + 4], [ox - 6, oy - 14], [ox, oy - 30], 12).slice(1)), true);
  },
  draw(lt) {
    // (the v3 table heading is left out: under the gala framing it fell off the frame, and the words column names the programme)
    // only: one figure alone (its index), when the cut wants one research image rather than the plate of four
    const on = i => this.only == null || this.only === i;
    this.cells.forEach((c, i) => {
      if (!on(i)) return;
      const p = easeInOut(prog(lt, 0.4 + i * 0.25, 1.4));
      stroke(c.outer, p, INK, 1.8); stroke(c.inner, p, INK, 0.9, 0.6);
      const q = easeOut(prog(lt, 3.0 + i * 0.4, 0.8));
      back(this.caps[i], c.x + 22, c.y + 298, 'left', q, 12, 3);
      small(this.caps[i], c.x + 22, c.y + 298, q, { size: 12, ls: 3, a: 0.72 });
      smallAr(this.capsAr[i], c.x + 380, c.y + 40, q, { size: 26, align: 'right', a: 0.85, weight: 600 });
      if (i === 0) { // developed at Khalifa University (src-56)
        smallAr('جامعة خليفة', c.x + 380, c.y + 250, q, { size: 18, align: 'right', a: 0.75, weight: 600 });
        small('KHALIFA UNIVERSITY', c.x + 380, c.y + 270, q, { size: 11, ls: 1, align: 'right', a: 0.65, weight: 600 });
      }
    });
    // Fig I
    const f1 = on(0) ? easeOut(prog(lt, 1.4, 1.2)) : 0;
    if (f1 > 0) {
      ctx.save(); ctx.globalAlpha = SA * 0.85 * f1; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = BLUE;
      ctx.beginPath(); this.shellO.trace(ctx, 1); this.shellI.trace(ctx, 1); ctx.fill('evenodd'); ctx.restore();
      fill(this.core, OCHRE, 0.6 * f1);
    }
    stroke(this.shellO, f1, INK, 1.5); stroke(this.shellI, f1, INK, 1.2, 0.8); stroke(this.core, f1, INK, 1.4);
    if (on(0)) this.lattice.forEach((l, i) => stroke(l, prog(lt, 2.0 + i * 0.06, 0.4), INK, 0.9, 0.7));
    if (on(0)) this.sats.forEach(([x, y], i) => { const q = easeOut(prog(lt, 2.4 + i * 0.12, 0.5)); disc(x, y, 12 * q, BLUE, 0.8); disc(x, y, 6 * q, OCHRE, 0.9); });
    // Fig II: vapour drifts in and condenses; the droplet swells round its salt nucleus, then merges with a neighbour
    const f2 = on(1) ? easeOut(prog(lt, 2.0, 0.8)) : 0, { x: nx, y: ny } = this.nuc;
    if (f2 > 0) {
      const g = easeInOut(prog(lt, 2.6, 4.0)), R = 12 + 46 * g;
      this.vapour.forEach(v => {
        const u = ((lt * v.sp * 0.35 + v.ph) % 1), r = R + (v.r0 - R) * (1 - u), a = v.a + u * 0.8;
        disc(nx + r * Math.cos(a), ny + r * Math.sin(a) * 0.85, 2.2, BLUE, 0.55 * f2 * Math.sin(Math.PI * u));
      });
      const m = easeInOut(prog(lt, 6.0, 1.4)), nbx = lerp(nx + 118, nx + R * 0.7, m), nr = 20 * (1 - m * 0.4);
      if (m < 1) { fill(el(nbx, ny + 38 - 30 * m, nr, nr, 0, TAU, 356, 0), BLUE, 0.25 * f2); stroke(el(nbx, ny + 38 - 30 * m, nr, nr, 0, TAU, 357, 0.2), f2, INK, 1.1, 0.8); }
      const RR = R + 8 * m;
      fill(el(nx, ny, RR, RR, 0, TAU, 358, 0), BLUE, 0.22 * f2); stroke(el(nx, ny, RR, RR, 0, TAU, 359, 0.3), f2, INK, 1.4, 0.9);
      const k = 6; fill(new P([[nx - k, ny - k], [nx + k, ny - k], [nx + k, ny + k], [nx - k, ny + k]], true), OCHRE, 0.8 * f2);
      stroke(new P([[nx - k, ny - k], [nx + k, ny - k], [nx + k, ny + k], [nx - k, ny + k]], true), f2, INK, 1.1);
    }
    // Fig III: the grid inks across the country, then the analysis contours flow over it
    const f3 = on(2) ? easeInOut(prog(lt, 2.4, 1.4)) : 0, gb = this.gridBox;
    this.mini.forEach(q => stroke(q, f3, INK, 0.9, 0.75));
    if (f3 > 0) {
      ctx.save(); ctx.globalAlpha = SA * 0.28 * f3; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath();
      for (let x = gb.x; x <= gb.x + gb.w + 0.1; x += 17.4) { ctx.moveTo(x, gb.y); ctx.lineTo(x, gb.y + gb.h * f3); }
      for (let y = gb.y; y <= gb.y + gb.h + 0.1; y += 17.4) { ctx.moveTo(gb.x, y); ctx.lineTo(gb.x + gb.w * f3, y); }
      ctx.stroke(); ctx.restore();
    }
    const fi = on(2) ? easeInOut(prog(lt, 3.4, 1.6)) : 0;
    if (fi > 0) { // the analysis flows across the grid from west to east
      ctx.save(); ctx.beginPath(); ctx.rect(gb.x, gb.y, gb.w * fi, gb.h); ctx.clip();
      ctx.globalAlpha = SA * 0.7; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = BLUE; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath();
      this.isoSegs.forEach(([a, c]) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); }); ctx.stroke(); ctx.restore();
    }
    // Fig IV
    if (!on(3)) return;
    this.edges.forEach((e, i) => stroke(e, prog(lt, 3.2 + i * 0.015, 0.5), INK, 0.8, 0.3));
    this.nodes.forEach((n, i) => { const q = easeOut(prog(lt, 3.1 + i * 0.05, 0.4)); disc(n.x, n.y, 10 * q, n.l === 1 ? RED : BLUE, 0.85); });
    const dq = easeOut(prog(lt, 4.3, 0.8));
    fill(this.dropP, BLUE, 0.8 * dq); stroke(this.dropP, dq, INK, 1.4);
    if (lt > 4.8) this.edges.forEach((e, i) => { const t = ((lt * 0.9 + i * 0.137) % 1), [x, y] = e.at(t); if (i % 3 === 0) disc(x, y, 3, OCHRE, 0.9); });
  },
});
