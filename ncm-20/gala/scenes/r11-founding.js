'use strict';
// Revision 11 · The founding (replaces the radar-scope plate of B07). The decree comes first, set as an engraved charter
// across the whole screen: its title as the UAE Legislation portal gives it, the late Sheikh Khalifa bin Zayed Al Nahyan
// who issued it, and its dates (issued in Abu Dhabi on 3 Dhu al-Qa'dah 1428 AH, 13 November 2007; published in the Official
// Gazette No. 473 on 15 November 2007). A typographic plate, never a facsimile: no signature, seal, emblem or palace.
// Then the charter settles into the plate and below it four engraved figures, the Center's instruments since its first
// years, draw in (the weather radar in its radome, an automatic weather station, a seismometer in its vault, a
// radiosonde rising): the Center watches the atmosphere and the ground. As the narration says "in one national center",
// a gold thread runs from each figure into one ring, and the ring opens into the national map (B08).
// Plate coordinates are screen coordinates once the camera has settled (identity), so the ring ends at the scope's old
// point (554, 690), where the map's iris opens.
scene({
  id: 'founding',
  start: 0, dur: 11.667,
  init() {
    const r = rng(2007);
    this.ch = { x0: 150, y0: 64, x1: 970, y1: 392, cx: 560 };
    const c = this.ch, rect = d => new P([[c.x0 + d, c.y0 + d], [c.x1 - d, c.y0 + d], [c.x1 - d, c.y1 - d], [c.x0 + d, c.y1 - d]], true);
    this.frame = [rect(0), rect(8), rect(14)];
    // a guilloché band (three waves between two rules, as on the cards' seals and on banknotes) inside the frame
    const band = (off, amp, n, j) => {
      const pts = [], L = 2 * (c.x1 - c.x0 + c.y1 - c.y0 - 4 * off), per = (u) => {
        const w = c.x1 - c.x0 - 2 * off, h = c.y1 - c.y0 - 2 * off, x0 = c.x0 + off, y0 = c.y0 + off;
        let d = u * 2 * (w + h);
        if (d < w) return [x0 + d, y0, 0, 1]; d -= w;
        if (d < h) return [x0 + w, y0 + d, -1, 0]; d -= h;
        if (d < w) return [x0 + w - d, y0 + h, 0, -1]; d -= w;
        return [x0, y0 + h - d, 1, 0];
      };
      for (let i = 0; i <= 1600; i++) { const u = i / 1600, [x, y, nx, ny] = per(u), q = amp * Math.sin(n * TAU * u + j * TAU / 3); pts.push([x + nx * q, y + ny * q]); }
      return new P(pts, true);
    };
    this.guil = [0, 1, 2].map(j => band(11, 2.6, 190, j));
    const rc = (fn, n = 720) => new P(Array.from({ length: n }, (_, i) => { const a = i / n * TAU, q = fn(a); return [c.cx + q * Math.cos(a), 230 + q * 0.62 * Math.sin(a)]; }), true);
    this.rosette = [rc(() => 150), rc(() => 138), ...[0, 1, 2].map(j => rc(a => 144 + 4 * Math.sin(40 * a + j * TAU / 3))), ...[0, 1].map(j => rc(a => 118 + 14 * Math.sin(20 * a + j * Math.PI / 2)))];
    this.ring = { x: 554, y: 690, r: 96 };
    const R = this.ring, curve = (fn, n = 720) => new P(Array.from({ length: n }, (_, i) => { const a = i / n * TAU, q = fn(a); return [R.x + q * Math.cos(a), R.y + q * Math.sin(a)]; }), true);
    this.rings = [curve(() => R.r), curve(() => R.r - 10), curve(() => R.r - 30)];
    this.rope = [0, 1, 2].map(j => curve(a => R.r - 5 + 3.2 * Math.sin(30 * a + j * TAU / 3)));
    this.petals = [0, 1].map(j => curve(a => R.r - 20 + 7 * Math.sin(16 * a + j * Math.PI / 2)));
    // the four figures' frames around the ring
    this.figs = [[96, 428, 420, 664], [688, 428, 1012, 664], [96, 716, 420, 952], [688, 716, 1012, 952]].map(([x0, y0, x1, y1], i) => ({ x0, y0, x1, y1, i,
      box: [new P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true), new P([[x0 + 5, y0 + 5], [x1 - 5, y0 + 5], [x1 - 5, y1 - 5], [x0 + 5, y1 - 5]], true)] }));
    // the gold threads: from each figure's inner corner to the ring
    this.threads = [[420, 664, -3 * Math.PI / 4], [688, 664, -Math.PI / 4], [420, 716, 3 * Math.PI / 4], [688, 716, Math.PI / 4]].map(([x, y, a], i) => {
      const ex = R.x + (R.r + 2) * Math.cos(a), ey = R.y + (R.r + 2) * Math.sin(a);
      return new P(quad([x, y], [(x + ex) / 2 + (i % 2 ? -8 : 8), (y + ey) / 2], [ex, ey], 20));
    });
    // FIG. I · the weather radar: a C-band dish in a spherical radome of irregular foam panels (the seams are uneven
    // polygons, not a geodesic grid) on a lattice tower, an equipment shelter at its foot; the radome cut away to show
    // the dish, which turns
    const G1 = 640, tx = 250;
    this.rad = { G: G1, tx, cy: 494, rr: 44 };
    this.tower = [ln(tx - 26, G1, tx - 12, 548, 301, 0.2), ln(tx + 26, G1, tx + 12, 548, 302, 0.2)];
    const zz = []; for (let k = 0; k <= 6; k++) { const y = G1 - k * 15.3, u = (G1 - y) / (G1 - 548); zz.push([k % 2 ? lerp(tx + 26, tx + 12, u) : lerp(tx - 26, tx - 12, u), y]); }
    this.lattice = new P(wob(zz, 303, 0.2));
    this.rplat = ln(tx - 30, 546, tx + 30, 546, 304, 0.1);
    this.radome = el(tx, 494, 44, 44, 0, TAU, 305, 0.2);
    this.rbase = new P([[tx - 30, 546], [tx - 24, 532], [tx + 24, 532], [tx + 30, 546]], true);
    // random-panel seams: a jittered net of short seams over the sphere
    this.seams = [];
    for (let k = 0; k < 26; k++) {
      const a = r() * TAU, rr = 44 * Math.sqrt(r()), x = tx + rr * Math.cos(a), y = 494 + rr * Math.sin(a), b = r() * TAU, l = 10 + r() * 12;
      this.seams.push(ln(x, y, x + l * Math.cos(b), y + l * Math.sin(b), 310 + k, 0.1));
    }
    this.shelter = new P([[146, G1], [146, 604], [196, 604], [196, G1]], true);
    this.shelterRoof = ln(142, 604, 200, 604, 330, 0.1);
    // FIG. II · the automatic weather station: a 10 m mast, cup anemometer and vane at the top, the radiation shield on
    // its arm at shoulder height, a logger box and panel, a rain gauge on open ground, guy wires
    const G2 = 640, mx = 800;
    this.aws = { G: G2, mx };
    this.mast = ln(mx, G2, mx, 470, 340, 0.1);
    this.guys = [ln(mx, 520, mx - 70, G2, 341, 0.2), ln(mx, 520, mx + 70, G2, 342, 0.2)];
    this.arm = ln(mx - 34, 472, mx + 34, 472, 343, 0.1);
    this.shieldArm = ln(mx, 596, mx + 36, 596, 344, 0.1);
    this.shield = [0, 1, 2, 3, 4, 5].map(k => el(mx + 42, 588 + k * 4.5, 10, 2.2, 0, TAU, 345 + k, 0));
    this.logger = new P([[mx - 22, 560], [mx - 4, 560], [mx - 4, 584], [mx - 22, 584]], true);
    this.panel = new P([[mx - 32, 540], [mx - 6, 534], [mx - 6, 548], [mx - 32, 554]], true);
    this.gauge = new P([[900, G2], [900, 612], [916, 612], [916, G2]], true);
    this.gaugeRim = el(908, 612, 8, 2.4, 0, TAU, 360, 0);
    this.ground2 = ln(706, G2, 996, G2, 361, 0.4);
    this.ground1 = ln(112, G1, 404, G1, 362, 0.4);
    // FIG. III · the seismometer in its vault, in section: a hut above ground, the vault below, a broadband sensor on a
    // concrete pier bonded to rock; the trace it writes runs along the foot of the figure (quiet ground: microseism only)
    const G3 = 770;
    this.seis = { G: G3 };
    this.ground3 = ln(112, G3, 404, G3, 370, 0.4);
    this.hut = new P([[210, G3], [210, 738], [300, 738], [300, G3]], true);
    this.hutRoof = new P([[204, 740], [255, 722], [306, 740]]);
    this.vault = new P([[196, G3], [196, 872], [314, 872], [314, G3]], true);
    this.pier = new P([[222, 872], [222, 852], [288, 852], [288, 872]], true);
    this.sensor = new P([[236, 852], [236, 826], [240, 818], [270, 818], [274, 826], [274, 852]], true);
    this.cable = new P(wob([[272, 830], [292, 820], [296, 790], [290, G3]], 371, 0.3));
    this.rock = new P([[112, 872], [404, 872], [404, 944], [112, 944]], true);
    this.soil = new P([[112, G3], [196, G3], [196, 872], [314, 872], [314, G3], [404, G3], [404, 872], [112, 872]], true);
    // FIG. IV · the radiosonde: launched from an airport station's shelter; a latex balloon rises with its parachute
    // and the sonde below on its line
    const G4 = 930;
    this.sonde = { G: G4, x: 820 };
    this.ground4 = ln(706, G4, 996, G4, 380, 0.4);
    this.launch = new P([[760, G4], [760, 900], [820, 900], [820, G4]], true);
    this.launchRoof = ln(754, 900, 826, 900, 381, 0.1);
  },
  // colour: the charter's band in deep blue between its rules, as the cards'; the ring's rope in teal and petals in
  // gold; a clear sky inside each figure and the ground in its sand, the vault's rock in its rust
  under(lt) {
    const bq = this.bq(lt);
    if (bq > 0) this.figs.forEach(f => {
      const g = [640, 640, 770, 930][f.i];
      washFade([f.x0 + 5, f.y0 + 5, f.x1 - 5, g], [[0, HUE.sky, 0.36], [1, HUE.dawn, 0.2]], 0, bq, f.box[1]);
      washFade([f.x0 + 5, g, f.x1 - 5, f.y1 - 5], [[0, HUE.sand, 0.34], [1, HUE.dune, 0.3]], 0, bq, f.box[1]);
    });
  },
  over(lt) {
    const f = easeInOut(prog(lt, 0.4, 2.0));
    wash([this.frame[0], this.frame[1]], HUE.deep, 0.45 * f, 'evenodd');
    const rq = this.rq(lt);
    wash([this.rings[0], this.rings[1]], HUE.sea, 0.24 * rq, 'evenodd');
    wash([this.rings[1], this.rings[2]], HUE.gold, 0.16 * rq, 'evenodd');
  },
  bq: lt => easeInOut(prog(lt, 5.5, 1.2)), // the figures' frames and grounds
  rq: lt => easeInOut(prog(lt, 7.6, 1.6)), // the ring
  draw(lt) {
    const c = this.ch;
    // the charter: frame, star, the decree's title, who issued it, where and when; lines ink in one after another
    const f = easeInOut(prog(lt, 0.3, 1.8));
    const rq0 = easeInOut(prog(lt, 0.2, 2.4));
    this.rosette.forEach((q, i) => stroke(q, rq0, GOLD, i < 2 ? 1 : 0.9, i < 2 ? 0.22 : 0.14));
    stroke(this.frame[0], f, GOLD, 1.5, 0.6); stroke(this.frame[1], f, INK, 0.9, 0.35); stroke(this.frame[2], f, GOLD, 0.9, 0.35);
    this.guil.forEach(q => stroke(q, f, GOLD, 0.8, 0.3));
    [[c.x0, c.y0], [c.x1, c.y0], [c.x0, c.y1], [c.x1, c.y1]].forEach(([x, y]) => ornament(x, y, 8, prog(lt, 1.4, 0.8), GOLD, 0.85));
    ruleWithStar(c.cx, 98, 250, prog(lt, 0.6, 1.2), 0.7, OPT.heritage);
    arLine('مرسوم بقانون اتحادي رقم ' + ltr('(6)') + ' لسنة ' + ltr('2007'), c.cx, 156, 0.9, lt, { size: 44, align: 'center', font: F_NASKH, weight: 700, dur: 1.6 });
    arLine('بإنشاء وتنظيم المركز الوطني للأرصاد', c.cx, 204, 1.6, lt, { size: 34, align: 'center', font: F_NASKH, weight: 700, dur: 1.4 });
    enLine('FEDERAL DECREE-LAW No. (6) OF 2007', c.cx, 240, 2.3, lt, { size: 18, align: 'center', ls: 3, a: 0.8 });
    enLine('on the establishment and regulation of the National Center of Meteorology', c.cx, 264, 2.5, lt, { size: 17, align: 'center', font: F_FELL, weight: 400, ls: 0, italic: true, a: 0.78 });
    ruleWithStar(c.cx, 288, 200, prog(lt, 2.8, 1.0), 0.6, OPT.heritage);
    const iq = easeOut(prog(lt, 3.1, 0.9));
    smallAr('المغفور له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه', c.cx, 324, iq, { size: 22, align: 'center', a: 0.9, weight: 700 });
    const dq = easeOut(prog(lt, 3.6, 0.9));
    smallAr('أبوظبي · ' + ltr('3') + ' ذي القعدة ' + ltr('1428') + 'هـ · ' + ltr('13') + ' نوفمبر ' + ltr('2007') + 'م · الجريدة الرسمية، العدد ' + ltr('473'), c.cx, 354, dq, { size: 17, align: 'center', a: 0.78 });
    small("ABU DHABI · 13 NOVEMBER 2007 · OFFICIAL GAZETTE No. 473, 15 NOVEMBER 2007", c.cx, 376, easeOut(prog(lt, 3.9, 0.9)), { size: 10.5, ls: 1.6, align: 'center', a: 0.66, weight: 600 });
    // the figures (they come in as the camera settles)
    const bq = this.bq(lt);
    if (bq <= 0) return;
    this.figs.forEach(g => { mask(g.box[0], bq); stroke(g.box[0], bq, INK, 1.3, 0.8); stroke(g.box[1], bq, INK, 0.7, 0.45); this.tone(g, lt); });
    ['I', 'II', 'III', 'IV'].forEach((n, i) => { const g = this.figs[i]; small('FIG. ' + n, g.x0 + 14, g.y0 + 22, easeOut(prog(lt, 5.9 + i * 0.2, 0.6)), { size: 11, ls: 2, a: 0.55, weight: 600 }); });
    this.fig1(lt); this.fig2(lt); this.fig3(lt); this.fig4(lt);
    // the threads into one ring, and the Center's star in it
    this.threads.forEach((t, i) => stroke(t, easeInOut(prog(lt, 7.4 + i * 0.12, 1.0)), GOLD, 1.6, 0.85));
    const rq = this.rq(lt), rot = lt * 0.02;
    if (rq > 0) {
      mask(this.rings[0], rq);
      ctx.save(); ctx.translate(this.ring.x, this.ring.y); ctx.rotate(rot); ctx.translate(-this.ring.x, -this.ring.y);
      this.rings.forEach((q, i) => stroke(q, rq, GOLD, i === 0 ? 1.8 : 1, i === 0 ? 0.8 : 0.45));
      this.rope.forEach(q => stroke(q, rq, GOLD, 0.9, 0.35)); this.petals.forEach(q => stroke(q, rq, GOLD, 0.9, 0.3));
      ctx.restore();
      ornament(this.ring.x, this.ring.y, 22, prog(lt, 8.4, 1.0));
    }
  },
  // each figure's own landscape: a pale hatched sky, a low line of dunes on the horizon, the ground in stipple-like hatching
  tone(g, lt) {
    const G = [640, 640, 770, 930][g.i], hy = G - [34, 30, 22, 30][g.i], p = easeInOut(prog(lt, 5.7 + g.i * 0.15, 1.4));
    if (p <= 0) return;
    const sky = new P([[g.x0 + 6, g.y0 + 6], [g.x1 - 6, g.y0 + 6], [g.x1 - 6, hy], [g.x0 + 6, hy]], true);
    hatch(sky, [g.x0, g.y0, g.x1, hy], 0, 7, p, INK, 0.7, 0.1, 420 + g.i);
    const dunes = []; for (let x = g.x0 + 6; x <= g.x1 - 6; x += 6) dunes.push([x, hy - 5 * Math.pow(Math.sin((x - g.x0) * 0.021 + g.i), 2) - 2 * Math.sin(x * 0.07)]);
    stroke(new P(dunes), p, SEPIA, 1.1, 0.6);
    const land = new P([[g.x0 + 6, hy + 2], [g.x1 - 6, hy + 2], [g.x1 - 6, G], [g.x0 + 6, G]], true);
    hatch(land, [g.x0, hy, g.x1, G], 0.04, 5, p, SEPIA, 0.8, 0.22, 430 + g.i);
    if (g.i !== 2) { const below = new P([[g.x0 + 6, G], [g.x1 - 6, G], [g.x1 - 6, g.y1 - 6], [g.x0 + 6, g.y1 - 6]], true); hatch(below, [g.x0, G, g.x1, g.y1], 0.02, 4, p, SEPIA, 0.9, 0.34, 440 + g.i); }
  },
  fig1(lt) {
    const { G, tx, cy, rr } = this.rad, p = easeInOut(prog(lt, 5.8, 1.4));
    stroke(this.ground1, p, INK, 1.4, 0.7);
    hatch(this.shelter, [146, 604, 196, G], 1.1, 6, p, INK, 0.9, 0.3, 390); stroke(this.shelter, p, INK, 1.3); stroke(this.shelterRoof, p, INK, 1.8);
    this.tower.forEach(l => stroke(l, p, INK, 2)); stroke(this.lattice, p, INK, 1.1, 0.75); stroke(this.rplat, p, INK, 2);
    for (let k = 0; k < 6; k++) { const ya = G - k * 15.3, yb = ya - 15.3, ua = (G - ya) / (G - 548), ub = (G - yb) / (G - 548); stroke(new P([[lerp(tx + 26, tx + 12, ua), ya], [lerp(tx - 26, tx - 12, ub), yb]]), p, INK, 0.7, 0.45); stroke(new P([[lerp(tx - 26, tx - 12, ua), ya - 1], [lerp(tx - 26, tx - 12, ua) + 52 - 28 * ua, ya - 1]]), p, INK, 0.8, 0.55); }
    const q = easeInOut(prog(lt, 6.2, 1.2));
    mask([this.radome, this.rbase], q); stroke(this.rbase, q, INK, 1.4);
    // the cut-away quarter: the dish inside, turning on its pedestal
    const az = lt * 0.9, w = Math.abs(Math.cos(az)) * 30 + 4, face = Math.cos(az) > 0 ? 1 : -1;
    ctx.save(); ctx.beginPath(); ctx.moveTo(tx, cy); ctx.arc(tx, cy, rr - 1, -Math.PI / 2, 0.15); ctx.closePath(); ctx.clip();
    fill(el(tx, cy, rr, rr, 0, TAU, 1, 0), INK, 0.1 * q);
    stroke(el(tx + 4 * face, cy - 4, w * 0.5, 30, 0, TAU, 391, 0), q, INK, 1.4, 0.85);
    stroke(ln(tx + 4 * face, cy - 4, tx + 4 * face + face * 18, cy - 4, 392, 0), q, INK, 1, 0.7);
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(tx, cy); ctx.arc(tx, cy, rr + 2, 0.15, TAU - Math.PI / 2); ctx.closePath(); ctx.clip();
    hatch(this.radome, [tx - rr, cy - rr, tx + rr, cy + rr], 0.7, 7, q, INK, 0.8, 0.14, 393);
    ctx.save(); ctx.beginPath(); ctx.arc(tx, cy, rr, Math.PI * 0.35, Math.PI * 1.25); ctx.arc(tx + 14, cy - 10, rr * 0.9, Math.PI * 1.25, Math.PI * 0.35, true); ctx.clip(); hatch(this.radome, [tx - rr, cy - rr, tx + rr, cy + rr], -0.6, 4, q, INK, 0.8, 0.3, 394); ctx.restore();
    this.seams.forEach(s => stroke(s, q, INK, 0.8, 0.45));
    ctx.restore();
    stroke(this.radome, q, INK, 1.6);
    stroke(new P([[tx, cy], [tx, cy - rr]]), q, INK, 0.9, 0.6); stroke(new P([[tx, cy], [tx + rr * Math.cos(0.15), cy + rr * Math.sin(0.15)]]), q, INK, 0.9, 0.6);
  },
  fig2(lt) {
    const { G, mx } = this.aws, p = easeInOut(prog(lt, 6.0, 1.4));
    stroke(this.ground2, p, INK, 1.4, 0.7);
    stroke(this.mast, p, INK, 2.2); this.guys.forEach(g => stroke(g, p, INK, 0.8, 0.55)); stroke(this.arm, p, INK, 1.4);
    stroke(this.shieldArm, p, INK, 1.2); this.shield.forEach(s => { mask(s, p); stroke(s, p, INK, 1, 0.8); });
    mask([this.logger, this.panel], p); fill(this.panel, BLUE, 0.4 * p); stroke(this.panel, p, INK, 1.1); stroke(this.logger, p, INK, 1.2);
    mask(this.gauge, p); stroke(this.gauge, p, INK, 1.3); stroke(this.gaugeRim, p, INK, 1.1);
    const q = easeOut(prog(lt, 6.6, 0.8));
    if (q <= 0) return;
    // cups turning in the breeze (one end of the arm), the vane holding into the wind (the other)
    const spin = lt * 5.2;
    for (let k = 0; k < 3; k++) {
      const a = spin + k * TAU / 3, x = mx + 34 + 12 * Math.cos(a), y = 470 + 3 * Math.sin(a);
      stroke(ln(mx + 34, 470, x, y, 395 + k, 0), q, INK, 1, 0.8);
      disc(x, y, 3.4, INK, 0.75 * q);
    }
    stroke(ln(mx + 34, 472, mx + 34, 462, 398, 0), q, INK, 1.2);
    const vw = Math.sin(lt * 0.7) * 0.15;
    ctx.save(); ctx.translate(mx - 34, 466); ctx.rotate(vw);
    stroke(new P([[-16, 0], [14, 0]]), q, INK, 1.4); fill(new P([[-16, 0], [-24, -7], [-24, 7]], true), INK, 0.7 * q); arrowHead(16, 0, 0, 5, INK, 0.85 * q, 1.3);
    ctx.restore();
    stroke(ln(mx - 34, 472, mx - 34, 466, 399, 0), q, INK, 1.2);
  },
  fig3(lt) {
    const { G } = this.seis, p = easeInOut(prog(lt, 6.2, 1.4));
    hatch(this.soil, [112, G, 404, 872], 0.35, 7, p, SEPIA, 0.9, 0.35, 400);
    hatch(this.rock, [112, 872, 404, 944], -0.5, 5, p, SEPIA, 0.9, 0.45, 401); hatch(this.rock, [112, 872, 404, 944], 0.9, 9, p, SEPIA, 0.8, 0.25, 402);
    stroke(this.ground3, p, INK, 1.4, 0.7);
    mask(this.vault, p); stroke(this.vault, p, INK, 1.4);
    mask(this.hut, p); stroke(this.hut, p, INK, 1.3); stroke(this.hutRoof, p, INK, 1.6);
    const q = easeInOut(prog(lt, 6.6, 1.0));
    hatch(this.pier, [222, 852, 288, 872], 0.9, 4, q, INK, 0.9, 0.4, 403); stroke(this.pier, q, INK, 1.3);
    mask(this.sensor, q); stroke(this.sensor, q, INK, 1.5); stroke(this.cable, q, INK, 1, 0.7);
    // the trace: quiet ground, the slow swell of microseism written across the foot of the figure
    const tq = prog(lt, 7.0, 4.0);
    if (tq > 0) {
      const pts = []; for (let x = 124; x <= 124 + 268 * tq; x += 2) pts.push([x, 928 + 3.2 * Math.sin(x * 0.11) * Math.sin(x * 0.013 + 1) + 1.2 * Math.sin(x * 0.53)]);
      if (pts.length > 1) stroke(new P(pts), 1, INK, 1.1, 0.8);
    }
  },
  fig4(lt) {
    const { G, x } = this.sonde, p = easeInOut(prog(lt, 6.4, 1.2));
    stroke(this.ground4, p, INK, 1.4, 0.7);
    mask(this.launch, p); hatch(this.launch, [760, 900, 820, G], 1.1, 6, p, INK, 0.9, 0.3, 410); stroke(this.launch, p, INK, 1.3); stroke(this.launchRoof, p, INK, 1.8);
    // the balloon rises from the shelter, drifting a little with the wind aloft
    const u = clamp((lt - 6.6) / 5.0);
    if (u <= 0) return;
    const by = lerp(880, 776, easeInOut(u)), bx = x + 30 + 26 * u * u, br = lerp(14, 20, u), q = easeOut(prog(lt, 6.6, 0.5));
    const b = el(bx, by, br, br * 1.12, 0, TAU, 411, 0.1);
    mask(b, q); fill(b, OPT.colour ? '#F1EBDD' : INK, OPT.colour ? 0.6 * q : 0.08 * q); stroke(b, q, INK, 1.4);
    const py = by + br * 1.12 + 22, sy = py + 34;
    stroke(new P([[bx, by + br * 1.12], [bx - 2, py]]), q, INK, 0.9, 0.7);
    stroke(el(bx - 2, py, 7, 3, Math.PI, TAU, 412, 0), q, INK, 1.1);
    stroke(new P([[bx - 2, py], [bx - 3, sy]]), q, INK, 0.8, 0.7);
    const box = new P([[bx - 7, sy], [bx + 1, sy], [bx + 1, sy + 7], [bx - 7, sy + 7]], true);
    fill(box, INK, 0.6 * q);
  },
});
