'use strict';
// Revision 11 · The founding (replaces the radar-scope plate of B07; 4.5 bars). The decree comes first, set as an
// engraved charter across the whole screen and held there: its title as it was gazetted in 2007 (the National Center of
// Meteorology and Seismology; Federal Law No. 13 of 2017 later renamed it the National Center of Meteorology), the year
// and the Official Gazette issue that published it, and the late Sheikh Khalifa bin Zayed Al Nahyan, credited as the one
// who issued it. The day and month stay off screen until NCM confirms which date the anniversary marks (TREATMENT §11
// row 2). A typographic plate, never a facsimile: no signature block, seal, emblem, rosette or palace.
// Then the charter settles into the plate and below it four engraved figures, the Center's instruments since its first
// years, draw in (the weather radar in its radome, an automatic weather station, a seismic station, a radiosonde
// rising), each named in both languages. A gold thread drops from the charter to one ring, and as the narration says
// "in one national center" a thread runs from each instrument into it; the ring opens into the national map (B08).
// Plate coordinates are screen coordinates once the camera has settled (identity), so the ring ends at the scope's old
// point (554, 690), where the map's iris opens. The charter, the ring and the figure grid share one axis, x 554.
scene({
  id: 'founding',
  start: 0, dur: 15,
  init() {
    const r = rng(2007);
    this.ch = { x0: 96, y0: 52, x1: 1012, y1: 408, cx: 554 };
    const c = this.ch, rect = d => new P([[c.x0 + d, c.y0 + d], [c.x1 - d, c.y0 + d], [c.x1 - d, c.y1 - d], [c.x0 + d, c.y1 - d]], true);
    // the frame: a gold rule, then a plain double rule inside it
    this.frame = [rect(0), rect(8), rect(12)];
    this.ring = { x: 554, y: 690, r: 96 };
    const R = this.ring, curve = (fn, n = 720) => new P(Array.from({ length: n }, (_, i) => { const a = i / n * TAU, q = fn(a); return [R.x + q * Math.cos(a), R.y + q * Math.sin(a)]; }), true);
    this.rings = [curve(() => R.r), curve(() => R.r - 10), curve(() => R.r - 30)];
    this.rope = [0, 1, 2].map(j => curve(a => R.r - 5 + 3.2 * Math.sin(30 * a + j * TAU / 3)));
    this.petals = [0, 1].map(j => curve(a => R.r - 20 + 7 * Math.sin(16 * a + j * Math.PI / 2)));
    // the four figures' frames around the ring
    this.G = [640, 640, 800, 930];
    this.figs = [[96, 440, 420, 664], [688, 440, 1012, 664], [96, 716, 420, 952], [688, 716, 1012, 952]].map(([x0, y0, x1, y1], i) => ({ x0, y0, x1, y1, i,
      box: [new P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true), new P([[x0 + 5, y0 + 5], [x1 - 5, y0 + 5], [x1 - 5, y1 - 5], [x0 + 5, y1 - 5]], true)] }));
    // each figure named, Arabic first (caption position: [x, align])
    this.names = [
      ['رادار الطقس', 'WEATHER RADAR', 404, 'right'],
      ['محطة أرصاد آلية', 'AUTOMATIC WEATHER STATION', 702, 'left'],
      ['محطة رصد زلزالي', 'SEISMIC STATION', 110, 'left'],
      ['مسبار جوي', 'RADIOSONDE', 702, 'left'],
    ];
    // the gold threads: one from the charter down to the ring, then one from each figure's inner corner
    this.stem = new P(wob([[554, c.y1], [554, R.y - R.r - 2]], 2008, 0.2));
    this.threads = [[420, 664, -3 * Math.PI / 4], [688, 664, -Math.PI / 4], [420, 716, 3 * Math.PI / 4], [688, 716, Math.PI / 4]].map(([x, y, a], i) => {
      const ex = R.x + (R.r + 2) * Math.cos(a), ey = R.y + (R.r + 2) * Math.sin(a);
      return new P(quad([x, y], [(x + ex) / 2 + (i % 2 ? -8 : 8), (y + ey) / 2], [ex, ey], 20));
    });
    // FIG. I · the weather radar: a C-band dish in a spherical radome of irregular foam panels on a lattice tower, an
    // equipment shelter at its foot; the radome's right half cut away to show the dish turning on its pedestal and yoke
    const G1 = 640, tx = 190;
    this.rad = { G: G1, tx, cy: 494, rr: 44 };
    this.tower = [ln(tx - 26, G1, tx - 12, 548, 301, 0.2), ln(tx + 26, G1, tx + 12, 548, 302, 0.2)];
    const zz = []; for (let k = 0; k <= 6; k++) { const y = G1 - k * 15.3, u = (G1 - y) / (G1 - 548); zz.push([k % 2 ? lerp(tx + 26, tx + 12, u) : lerp(tx - 26, tx - 12, u), y]); }
    this.lattice = new P(wob(zz, 303, 0.2));
    this.rplat = ln(tx - 30, 546, tx + 30, 546, 304, 0.1);
    this.radome = el(tx, 494, 44, 44, 0, TAU, 305, 0);
    this.rbase = new P([[tx - 30, 546], [tx - 24, 532], [tx + 24, 532], [tx + 30, 546]], true);
    // the random-panel net: a jittered lattice on the sphere; its dual net (irregular closed cells, as the foam panels
    // are) is projected onto the dome, so the cells foreshorten toward the limb
    {
      const d = 0.44, pts = {}, key = (i, j) => i + ',' + j;
      for (let j = -5; j <= 5; j++) for (let i = -7; i <= 7; i++) pts[key(i, j)] = [(i + j / 2) * d + (r() - 0.5) * 0.2, j * d * 0.866 + (r() - 0.5) * 0.2];
      const cen = (...q) => q.every(Boolean) ? [(q[0][0] + q[1][0] + q[2][0]) / 3, (q[0][1] + q[1][1] + q[2][1]) / 3] : null;
      const Tu = (i, j) => cen(pts[key(i, j)], pts[key(i + 1, j)], pts[key(i, j + 1)]);
      const Td = (i, j) => cen(pts[key(i + 1, j)], pts[key(i, j + 1)], pts[key(i + 1, j + 1)]);
      const proj = ([lon, lat], back) => { const z = Math.cos(lat) * Math.cos(lon) * (back ? -1 : 1); return [tx + 44 * Math.cos(lat) * Math.sin(lon) * (back ? -1 : 1), 494 - 44 * Math.sin(lat), z]; };
      const edge = (a, b, back) => {
        if (!a || !b) return null;
        const q = []; for (let k = 0; k <= 4; k++) q.push(proj([lerp(a[0], b[0], k / 4), lerp(a[1], b[1], k / 4)], back));
        return q.every(p => p[2] > 0.04) ? new P(q.map(p => [p[0], p[1]])) : null;
      };
      this.seams = []; this.seamsIn = [];
      for (let j = -6; j <= 5; j++) for (let i = -8; i <= 7; i++) {
        [[Tu(i, j), Td(i, j)], [Tu(i, j), Td(i, j - 1)], [Tu(i, j), Td(i - 1, j)]].forEach(([a, b]) => {
          const s = edge(a, b, false); if (s) this.seams.push(s);
          const t = edge(a, b, true); if (t) this.seamsIn.push(t); // the far half's panels, seen from inside through the cut
        });
      }
    }
    this.shelter = new P([[282, G1], [282, 604], [332, 604], [332, G1]], true);
    this.shelterRoof = ln(278, 604, 336, 604, 330, 0.1);
    // FIG. II · the automatic weather station, drawn to one scale (the 10 m mast, 17 px a metre): cup anemometer and vane
    // on the cross-arm at the top, the radiation shield on its arm at 1.5 m, the logger and its solar panel below it, a
    // rain gauge on open ground, guy wires; a detail roundel shows the anemometer and vane magnified
    const G2 = 640, mx = 900;
    this.aws = { G: G2, mx, top: 470 };
    this.mast = ln(mx, G2, mx, 470, 340, 0.1);
    this.guys = [ln(mx, 520, mx - 66, G2, 341, 0.2), ln(mx, 520, mx + 66, G2, 342, 0.2)];
    this.arm = ln(mx - 14, 472, mx + 14, 472, 343, 0);
    this.shieldArm = ln(mx, 614, mx + 12, 614, 344, 0);
    this.shield = [0, 1, 2, 3, 4].map(k => el(mx + 14, 609 + k * 2.6, 4.2, 1.1, 0, TAU, 345 + k, 0));
    this.logger = new P([[mx - 13, 617], [mx - 3, 617], [mx - 3, 628], [mx - 13, 628]], true);
    this.panel = new P([[mx - 16, 600], [mx - 3, 596], [mx - 3, 603], [mx - 16, 607]], true);
    this.gauge = new P([[843, G2], [843, 628], [849, 628], [849, G2]], true);
    this.gaugeRim = el(846, 628, 3, 0.9, 0, TAU, 360, 0);
    this.roundel = { x: 772, y: 566, r: 44 };
    this.ground2 = ln(698, G2, 1002, G2, 361, 0.4);
    this.ground1 = ln(106, G1, 410, G1, 362, 0.4);
    // FIG. III · the seismic station in section: a hut above ground, a shallow vault below it, the broadband sensor (a
    // squat cylinder with its lid, on three levelling feet, under an insulating cover) on a concrete pier bonded to the
    // rock; its record, a ruled seismogram of quiet ground (microseism only), is set out as a paper strip
    const G3 = 800;
    this.seis = { G: G3 };
    this.ground3 = ln(106, G3, 410, G3, 370, 0.4);
    this.hut = new P([[300, G3], [300, 772], [380, 772], [380, G3]], true);
    this.hutRoof = new P([[294, 774], [340, 758], [386, 774]]);
    this.door = new P([[318, G3], [318, 782], [330, 782], [330, G3]], true);
    this.vault = new P([[288, G3], [288, 842], [392, 842], [392, G3]], true);
    this.pier = new P([[304, 842], [304, 832], [376, 832], [376, 842]], true);
    this.cover = new P([[318, 832], [318, 812], [362, 812], [362, 832]], true);
    this.sensor = new P([[330, 829], [330, 818], [350, 818], [350, 829]], true);
    this.lid = el(340, 818, 10, 2.4, 0, TAU, 372, 0);
    this.cable = new P(wob([[358, 822], [372, 816], [374, 804], [368, G3 - 2]], 371, 0.2));
    this.rock = new P([[106, 842], [410, 842], [410, 946], [106, 946]], true);
    this.soil = new P([[106, G3], [288, G3], [288, 842], [392, 842], [392, G3], [410, G3], [410, 842], [106, 842]], true);
    this.strip = [112, 852, 280, 906];
    // FIG. IV · the radiosonde: the balloon, its parachute and the sonde on a long train, launched beside an airport
    // station's shelter; the line pays out from the ground until the balloon lifts the sonde
    const G4 = 930;
    this.sonde = { G: G4, x0: 930 };
    this.ground4 = ln(698, G4, 1002, G4, 380, 0.4);
    this.launch = new P([[858, G4], [858, 900], [912, 900], [912, G4]], true);
    this.launchRoof = ln(852, 900, 918, 900, 381, 0.1);
  },
  // colour: the charter's band in deep blue between its rules, as the cards'; the ring's rope in teal and petals in
  // gold; a clear sky inside each figure and the ground in its sand
  under(lt) {
    const bq = this.bq(lt);
    if (bq > 0) this.figs.forEach(f => {
      const g = this.G[f.i];
      washFade([f.x0 + 5, f.y0 + 5, f.x1 - 5, g], [[0, HUE.sky, 0.46], [1, HUE.dawn, 0.18]], 0, bq, f.box[1]);
      washFade([f.x0 + 5, g, f.x1 - 5, f.y1 - 5], [[0, HUE.sand, 0.4], [1, HUE.dune, 0.42]], 0, bq, f.box[1]);
    });
  },
  over(lt) {
    wash([this.frame[0], this.frame[1]], HUE.deep, 0.45, 'evenodd');
    const rq = this.rq(lt);
    wash([this.rings[0], this.rings[1]], HUE.sea, 0.24 * rq, 'evenodd');
    wash([this.rings[1], this.rings[2]], HUE.gold, 0.16 * rq, 'evenodd');
  },
  bq: lt => easeInOut(prog(lt, 9.0, 1.2)), // the figures' frames and grounds, as the camera settles
  rq: lt => easeInOut(prog(lt, 12.0, 1.4)), // the ring
  draw(lt) {
    const c = this.ch;
    // the charter's frame and ornaments are whole from the first frame of the iris, so it opens onto the charter, not
    // onto bare paper; then its lines ink in one after another and the whole charter is held for 3 s before it settles
    stroke(this.frame[0], 1, GOLD, 1.6, 0.65); stroke(this.frame[1], 1, INK, 1, 0.4); stroke(this.frame[2], 1, INK, 0.9, 0.4);
    [[c.x0, c.y0], [c.x1, c.y0], [c.x0, c.y1], [c.x1, c.y1]].forEach(([x, y]) => ornament(x, y, 8, 1, GOLD, 0.85));
    ruleWithStar(c.cx, 84, 240, 1, 0.7, OPT.heritage);
    arLine('مرسوم بقانون اتحادي رقم ' + ltr('(6)') + ' لسنة ' + ltr('2007'), c.cx, 136, 0.3, lt, { size: 42, align: 'center', font: F_NASKH, weight: 700, dur: 1.4 });
    arLine('بإنشاء وتنظيم المركز الوطني للأرصاد الجوية والزلازل', c.cx, 180, 0.8, lt, { size: 31, align: 'center', font: F_NASKH, weight: 700, dur: 1.4 });
    enLine('FEDERAL DECREE-LAW No. (6) OF 2007', c.cx, 214, 1.6, lt, { size: 17, align: 'center', ls: 3, a: 0.82 });
    enLine('on the establishment and regulation of the National Center of Meteorology and Seismology', c.cx, 238, 1.8, lt, { size: 16, align: 'center', font: F_FELL, weight: 400, ls: 0, italic: true, a: 0.8 });
    // where and when it was published (the year only, until NCM confirms the anniversary date); these two lines are read
    // while the charter is held, and leave as it settles, when they would be too small to read
    const cOut = 1 - easeInOut(prog(lt, 7.4, 1.0));
    smallAr('أبوظبي، ' + ltr('1428') + 'هـ الموافق ' + ltr('2007') + 'م · الجريدة الرسمية، العدد ' + ltr('473'), c.cx, 274, easeOut(prog(lt, 2.4, 0.8)) * cOut, { size: 20, align: 'center', a: 0.82, weight: 600 });
    small('ABU DHABI · 2007 · OFFICIAL GAZETTE No. 473', c.cx, 298, easeOut(prog(lt, 2.6, 0.8)) * cOut, { size: 14.5, ls: 1.6, align: 'center', a: 0.72, weight: 600 });
    ruleWithStar(c.cx, 322, 200, prog(lt, 2.8, 1.0), 0.6, OPT.heritage);
    // who issued it: a credit in today's voice, never set as a signature
    arLine('أصدره المغفور له الشيخ خليفة بن زايد آل نهيان، طيّب الله ثراه', c.cx, 362, 3.0, lt, { size: 30, align: 'center', font: F_NASKH, weight: 700, dur: 1.3 });
    enLine('ISSUED BY THE LATE SHEIKH KHALIFA BIN ZAYED AL NAHYAN', c.cx, 388, 3.5, lt, { size: 15, align: 'center', ls: 2, a: 0.82 });
    // the figures (they come in as the camera settles)
    const bq = this.bq(lt);
    if (bq <= 0) return;
    this.figs.forEach(g => { mask(g.box[0], bq); stroke(g.box[0], bq, INK, 1.6, 0.85); stroke(g.box[1], bq, INK, 0.8, 0.5); this.tone(g, lt); });
    this.fig1(lt); this.fig2(lt); this.fig3(lt); this.fig4(lt);
    this.captions(lt);
    // the thread from the decree to the ring, then the threads from the instruments on "in one national center"
    stroke(this.stem, easeInOut(prog(lt, 11.3, 0.9)), GOLD, 1.8, 0.85);
    this.threads.forEach((t, i) => stroke(t, easeInOut(prog(lt, 12.3 + i * 0.12, 0.9)), GOLD, 1.8, 0.85));
    const rq = this.rq(lt), rot = lt * 0.02;
    if (rq > 0) {
      mask(this.rings[0], rq);
      ctx.save(); ctx.translate(this.ring.x, this.ring.y); ctx.rotate(rot); ctx.translate(-this.ring.x, -this.ring.y);
      this.rings.forEach((q, i) => stroke(q, rq, GOLD, i === 0 ? 1.8 : 1, i === 0 ? 0.8 : 0.45));
      this.rope.forEach(q => stroke(q, rq, GOLD, 0.9, 0.35)); this.petals.forEach(q => stroke(q, rq, GOLD, 0.9, 0.3));
      ctx.restore();
      // the Center's star glints in the ring as the narration's «واحد» lands
      ornament(this.ring.x, this.ring.y, 22, prog(lt, 13.3, 0.6));
    }
  },
  // each figure's name, on a paper patch
  captions(lt) {
    this.names.forEach(([ar, en, x, align], i) => {
      const g = this.figs[i], q = easeOut(prog(lt, 10.2 + i * 0.15, 0.7)), y = g.y0 + 36;
      if (q <= 0) return;
      const wA = textWidth(ar, `600 25px ${F_KUFI}`, 0, 'rtl'), wE = textWidth(en, `600 13px ${F_MONO}`, 2), w = Math.max(wA, wE) + 14;
      const x0 = align === 'right' ? x - w + 7 : x - 7;
      mask(new P([[x0, y - 28], [x0 + w, y - 28], [x0 + w, y + 26], [x0, y + 26]], true), q);
      smallAr(ar, x, y, q, { size: 25, align, a: 0.9, weight: 600 });
      small(en, x, y + 19, q, { size: 13, ls: 2, align, a: 0.75, weight: 600 });
    });
  },
  // each figure's own landscape: a sky hatched dense at the top and open at the horizon, a low line of dunes, the
  // ground toned darker than the sky
  tone(g, lt) {
    const G = this.G[g.i], hy = G - [34, 30, 20, 30][g.i], p = easeInOut(prog(lt, 9.3 + g.i * 0.15, 1.4));
    if (p <= 0) return;
    const sky = new P([[g.x0 + 6, g.y0 + 6], [g.x1 - 6, g.y0 + 6], [g.x1 - 6, hy], [g.x0 + 6, hy]], true);
    const upper = new P([[g.x0 + 6, g.y0 + 6], [g.x1 - 6, g.y0 + 6], [g.x1 - 6, lerp(g.y0, hy, 0.5)], [g.x0 + 6, lerp(g.y0, hy, 0.5)]], true);
    hatch(sky, [g.x0, g.y0, g.x1, hy], 0, 8, p, INK, 0.8, 0.1, 420 + g.i);
    hatch(upper, [g.x0, g.y0, g.x1, hy], 0, 8, p, INK, 0.8, 0.12, 425 + g.i);
    const dunes = []; for (let x = g.x0 + 6; x <= g.x1 - 6; x += 6) dunes.push([x, hy - 5 * Math.pow(Math.sin((x - g.x0) * 0.021 + g.i), 2) - 2 * Math.sin(x * 0.07)]);
    stroke(new P(dunes), p, SEPIA, 1.3, 0.7);
    const land = new P([[g.x0 + 6, hy + 2], [g.x1 - 6, hy + 2], [g.x1 - 6, G], [g.x0 + 6, G]], true);
    hatch(land, [g.x0, hy, g.x1, G], 0.04, 4, p, SEPIA, 0.9, 0.3, 430 + g.i);
    if (g.i !== 2) { const below = new P([[g.x0 + 6, G], [g.x1 - 6, G], [g.x1 - 6, g.y1 - 6], [g.x0 + 6, g.y1 - 6]], true); hatch(below, [g.x0, G, g.x1, g.y1], 0.02, 3.5, p, SEPIA, 1, 0.42, 440 + g.i); }
  },
  fig1(lt) {
    const { G, tx, cy, rr } = this.rad, p = easeInOut(prog(lt, 9.4, 1.4));
    stroke(this.ground1, p, INK, 1.8, 0.8);
    hatch(this.shelter, [282, 604, 332, G], 1.1, 5, p, INK, 0.9, 0.35, 390); stroke(this.shelter, p, INK, 2); stroke(this.shelterRoof, p, INK, 2.4);
    this.tower.forEach(l => stroke(l, p, INK, 2.4)); stroke(this.lattice, p, INK, 1.2, 0.8); stroke(this.rplat, p, INK, 2.4);
    for (let k = 0; k < 6; k++) { const ya = G - k * 15.3, yb = ya - 15.3, ua = (G - ya) / (G - 548), ub = (G - yb) / (G - 548); stroke(new P([[lerp(tx + 26, tx + 12, ua), ya], [lerp(tx - 26, tx - 12, ub), yb]]), p, INK, 0.8, 0.5); stroke(new P([[lerp(tx - 26, tx - 12, ua), ya - 1], [lerp(tx - 26, tx - 12, ua) + 52 - 28 * ua, ya - 1]]), p, INK, 0.9, 0.6); }
    const q = easeInOut(prog(lt, 9.8, 1.2));
    if (q <= 0) return;
    mask([this.radome, this.rbase], q); stroke(this.rbase, q, INK, 1.8);
    // the open half: the far half's inner wall (its panels seen from inside), the pedestal, the yoke and the dish; the
    // dish turns through ±20° about its mean bearing and always faces the open half, so it never jumps
    ctx.save(); ctx.beginPath(); ctx.rect(tx, cy - rr - 2, rr + 4, 2 * rr + 4); ctx.clip();
    hatch(this.radome, [tx - rr, cy - rr, tx + rr, cy + rr], 0.3, 5, q, INK, 0.7, 0.16, 396);
    this.seamsIn.forEach(s => stroke(s, q, INK, 0.7, 0.3));
    ctx.restore();
    const az = (55 + 20 * Math.sin(lt * 0.5)) * Math.PI / 180, px = tx + 3, py = cy + 4;
    // pedestal and yoke
    fill(new P([[px - 5, 532], [px - 4, py + 6], [px + 4, py + 6], [px + 5, 532]], true), INK, 0.55 * q);
    stroke(new P([[px - 7, py + 6], [px - 7, py - 2], [px + 7, py - 2], [px + 7, py + 6]]), q, INK, 1.4, 0.85);
    // the dish (a parabolic reflector about 0.63 of the radome's diameter), seen at its bearing: the rim an ellipse,
    // the concave face toward us, shaded away from the light, the feed held on three struts at its focus
    const Rd = 27, ex = Rd * Math.cos(az), rx = px + 11 * Math.sin(az), ry = py - 4;
    const rim = el(rx, ry, Math.max(3, ex), Rd, 0, TAU, 397, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(tx + 1, cy - rr - 2, rr + 4, 2 * rr + 4); ctx.clip();
    mask(rim, q); hatch(rim, [rx - ex, ry - Rd, rx + ex, ry + Rd], 1.2, 3.2, q, INK, 0.8, 0.3, 398);
    stroke(rim, q, INK, 1.7, 0.9);
    const fx = rx + 18 * Math.sin(az), fy = ry;
    [[rx, ry - Rd + 2], [rx, ry + Rd - 2], [rx + ex * 0.9, ry]].forEach(([sx, sy]) => stroke(new P([[sx, sy], [fx, fy]]), q, INK, 0.9, 0.75));
    fill(new P([[fx - 1, fy - 3], [fx + 4, fy - 2.5], [fx + 4, fy + 2.5], [fx - 1, fy + 3]], true), INK, 0.8 * q);
    ctx.restore();
    // the closed half: the foam panels as a net of irregular cells, the shade on its lower side
    ctx.save(); ctx.beginPath(); ctx.rect(tx - rr - 4, cy - rr - 4, rr + 4, 2 * rr + 8); ctx.clip();
    mask(this.radome, q);
    ctx.save(); ctx.beginPath(); ctx.arc(tx, cy, rr, Math.PI * 0.45, Math.PI * 1.2); ctx.arc(tx + 12, cy - 12, rr * 0.92, Math.PI * 1.2, Math.PI * 0.45, true); ctx.clip();
    hatch(this.radome, [tx - rr, cy - rr, tx + rr, cy + rr], -0.6, 3.2, q, INK, 0.8, 0.34, 394); ctx.restore();
    this.seams.forEach(s => stroke(s, q, INK, 0.9, 0.5));
    ctx.restore();
    // the dome's outline and the cut: the shell drawn in section (its thickness) where it was cut
    stroke(this.radome, q, INK, 2);
    const yT = cy - rr, yB = cy + Math.sqrt(rr * rr - 30 * 30) * 0.98;
    fill(new P([[tx - 1.4, yT], [tx + 1.4, yT], [tx + 1.4, yB], [tx - 1.4, yB]], true), INK, 0.85 * q);
  },
  fig2(lt) {
    const { G, mx } = this.aws, p = easeInOut(prog(lt, 9.6, 1.4));
    stroke(this.ground2, p, INK, 1.8, 0.8);
    stroke(this.mast, p, INK, 2.4); this.guys.forEach(g => stroke(g, p, INK, 0.9, 0.6)); stroke(this.arm, p, INK, 1.6);
    stroke(this.shieldArm, p, INK, 1.3); this.shield.forEach(s => { mask(s, p); stroke(s, p, INK, 1, 0.85); });
    mask([this.logger, this.panel], p); fill(this.panel, BLUE, 0.45 * p); stroke(this.panel, p, INK, 1.1); stroke(this.logger, p, INK, 1.3);
    mask(this.gauge, p); stroke(this.gauge, p, INK, 1.3); stroke(this.gaugeRim, p, INK, 1.1);
    const q = easeOut(prog(lt, 10.0, 0.8));
    if (q <= 0) return;
    const spin = lt * 5.2, vw = Math.sin(lt * 0.7) * 0.35;
    // at scale on the mast: the cups (a small rotor) on the right end of the arm, the vane on the left
    for (let k = 0; k < 3; k++) { const a = spin + k * TAU / 3; disc(mx + 14 + 4 * Math.cos(a), 469 + 1 * Math.sin(a), 1.4, INK, 0.8 * q); }
    stroke(new P([[mx + 14, 472], [mx + 14, 468]]), q, INK, 1);
    stroke(new P([[mx - 14 - 6 * Math.cos(vw), 468], [mx - 14 + 5 * Math.cos(vw), 468]]), q, INK, 1.2);
    stroke(new P([[mx - 14, 472], [mx - 14, 468]]), q, INK, 1);
    // the detail roundel, joined to the mast head by a fine leader
    const R = this.roundel, rq = easeOut(prog(lt, 10.3, 0.8));
    if (rq <= 0) return;
    const ang = Math.atan2(470 - R.y, mx - R.x);
    stroke(new P([[R.x + (R.r + 3) * Math.cos(ang), R.y + (R.r + 3) * Math.sin(ang)], [mx - 4, 471]]), rq, INK, 0.8, 0.55, [3, 3]);
    const circ = el(R.x, R.y, R.r, R.r, 0, TAU, 460, 0), circ2 = el(R.x, R.y, R.r - 4, R.r - 4, 0, TAU, 461, 0);
    mask(circ, rq); stroke(circ, rq, INK, 1.6, 0.85); stroke(circ2, rq, INK, 0.8, 0.5);
    ctx.save(); ctx.beginPath(); ctx.arc(R.x, R.y, R.r - 5, 0, TAU); ctx.clip();
    hatch(circ2, [R.x - R.r, R.y - R.r, R.x + R.r, R.y + R.r], 0, 7, rq, INK, 0.7, 0.08, 462);
    // the mast head, four times larger: the mast, the cross-arm, the three-cup rotor turning, the vane in elevation (a
    // rod with an upright tail fin and a counterweight), swinging a little about the wind
    const ax = R.x + 2, ay = R.y + 2;
    stroke(new P([[ax, ay], [ax, R.y + R.r]]), rq, INK, 3);
    stroke(new P([[ax - 30, ay], [ax + 30, ay]]), rq, INK, 2.4);
    const cxr = ax + 30, cxl = ax - 30;
    stroke(new P([[cxr, ay], [cxr, ay - 10]]), rq, INK, 1.8);
    for (let k = 0; k < 3; k++) {
      const a = spin + k * TAU / 3, x = cxr + 13 * Math.cos(a), y = ay - 10 + 3 * Math.sin(a), s = Math.sin(a);
      stroke(new P([[cxr, ay - 10], [x, y]]), rq, INK, 1.3, 0.85);
      const cup = el(x, y, 5, 4.4, 0, TAU, 463 + k, 0);
      mask(cup, rq); fill(cup, INK, (s > 0 ? 0.55 : 0.25) * rq); stroke(cup, rq, INK, 1.2, 0.9);
    }
    stroke(new P([[cxl, ay], [cxl, ay - 9]]), rq, INK, 1.8);
    const vl = 20 * Math.cos(vw), vr = 13 * Math.cos(vw);
    stroke(new P([[cxl - vl, ay - 9], [cxl + vr, ay - 9]]), rq, INK, 1.8);
    const fin = new P([[cxl - vl, ay - 9], [cxl - vl - 3, ay - 23], [cxl - vl + 6 * Math.cos(vw), ay - 23], [cxl - vl + 9 * Math.cos(vw), ay - 9]], true);
    mask(fin, rq); stroke(fin, rq, INK, 1.3); hatch(fin, [cxl - vl - 4, ay - 24, cxl - vl + 10, ay - 8], 1.1, 2.5, rq, INK, 0.7, 0.45, 466);
    disc(cxl + vr, ay - 9, 3.2, INK, 0.85 * rq);
    // the radiation shield below, on its arm: a stack of plates
    [0, 1, 2, 3].forEach(k => { const e = el(ax + 20, ay + 18 + k * 4.5, 9, 2.2, 0, TAU, 467 + k, 0); mask(e, rq); stroke(e, rq, INK, 1.1, 0.85); });
    stroke(new P([[ax, ay + 22], [ax + 11, ay + 22]]), rq, INK, 1.4);
    ctx.restore();
  },
  fig3(lt) {
    const { G } = this.seis, p = easeInOut(prog(lt, 9.8, 1.4));
    hatch(this.soil, [106, G, 410, 842], 0.35, 5, p, SEPIA, 0.9, 0.4, 400);
    hatch(this.rock, [106, 842, 410, 946], -0.5, 4, p, SEPIA, 0.9, 0.5, 401); hatch(this.rock, [106, 842, 410, 946], 0.9, 8, p, SEPIA, 0.8, 0.3, 402);
    stroke(this.ground3, p, INK, 1.8, 0.8);
    mask(this.vault, p); stroke(this.vault, p, INK, 1.8);
    mask(this.hut, p); hatch(this.hut, [300, 772, 380, G], 1.1, 5, p, INK, 0.8, 0.28, 404); stroke(this.hut, p, INK, 2); stroke(this.hutRoof, p, INK, 2.2);
    mask(this.door, p); stroke(this.door, p, INK, 1.2);
    const q = easeInOut(prog(lt, 10.1, 1.0));
    hatch(this.pier, [304, 832, 376, 842], 0.9, 3, q, INK, 0.9, 0.45, 403); stroke(this.pier, q, INK, 1.6);
    stroke(this.cover, q, INK, 1, 0.55, [2, 2]);
    [[332, 829], [340, 829], [348, 829]].forEach(([x, y]) => stroke(new P([[x, y], [x, y + 3]]), q, INK, 1.2));
    mask(this.sensor, q); hatch(this.sensor, [330, 818, 350, 829], 1.57, 3, q, INK, 0.8, 0.3, 405); stroke(this.sensor, q, INK, 1.6); mask(this.lid, q); stroke(this.lid, q, INK, 1.4);
    stroke(this.cable, q, INK, 1, 0.75);
    // the record: a ruled strip, minute ticks along its top, quiet ground written across it
    const [x0, y0, x1, y1] = this.strip, sq = easeOut(prog(lt, 10.4, 0.6));
    if (sq <= 0) return;
    const box = new P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
    mask(box, sq); stroke(box, sq, INK, 1.3, 0.85); stroke(new P([[x0 + 3, y0 + 3], [x1 - 3, y0 + 3], [x1 - 3, y1 - 3], [x0 + 3, y1 - 3]], true), sq, INK, 0.6, 0.45);
    for (let yy = y0 + 12; yy < y1 - 4; yy += 10) stroke(new P([[x0 + 5, yy], [x1 - 5, yy]]), sq, BLUE, 0.6, 0.3);
    for (let xx = x0 + 10; xx < x1 - 4; xx += 16) stroke(new P([[xx, y0 + 3], [xx, y0 + 8]]), sq, INK, 0.8, 0.6);
    const tq = prog(lt, 10.6, 4.0);
    if (tq > 0) {
      const pts = []; for (let x = x0 + 6; x <= x0 + 6 + (x1 - x0 - 12) * tq; x += 1.5) pts.push([x, (y0 + y1) / 2 + 3 + 4.5 * Math.sin(x * 0.11) * Math.sin(x * 0.013 + 1) + 1.4 * Math.sin(x * 0.53)]);
      if (pts.length > 1) stroke(new P(pts), 1, INK, 1.2, 0.85);
    }
  },
  fig4(lt) {
    const { G, x0 } = this.sonde, p = easeInOut(prog(lt, 10.0, 1.2));
    stroke(this.ground4, p, INK, 1.8, 0.8);
    mask(this.launch, p); hatch(this.launch, [858, 900, 912, G], 1.1, 5, p, INK, 0.9, 0.35, 410); stroke(this.launch, p, INK, 2); stroke(this.launchRoof, p, INK, 2.4);
    const q = easeOut(prog(lt, 10.2, 0.5));
    if (q <= 0) return;
    // the balloon rises and drifts a little with the wind aloft; the train (parachute, then the sonde) pays out from
    // the ground and is lifted taut, so the sonde never goes below the ground
    const u = clamp((lt - 10.4) / 4.4), br = lerp(15, 19, u);
    const by = lerp(G - 100, 750, easeInOut(u)), bx = x0 + 22 * u + 16 * u * u;
    const b = el(bx, by, br, br * 1.12, 0, TAU, 411, 0.1);
    mask(b, q); fill(b, OPT.colour ? '#F1EBDD' : INK, OPT.colour ? 0.6 * q : 0.08 * q); stroke(b, q, INK, 1.8);
    hatch(b, [bx - br, by - br * 1.12, bx + br, by + br * 1.12], -0.7, 3, q * 0.9, INK, 0.7, 0.18, 413);
    const top = [bx, by + br * 1.12], train = 96, taut = top[1] + train <= G - 7;
    const sx = taut ? bx - 2 : lerp(x0 - 34, bx - 2, clamp((top[1] + train - (G - 7)) / -1 + 1)), sy = Math.min(top[1] + train, G - 7);
    const px = lerp(top[0], sx, 0.36), py = top[1] + (taut ? train * 0.36 : Math.min(train * 0.36, (G - 7 - top[1]) * 0.5));
    // the line: taut once the sonde is up, before that a slack curve down to the sonde lying by the shelter
    if (taut) stroke(new P([top, [px, py], [sx, sy]]), q, INK, 0.9, 0.75);
    else stroke(new P(quad(top, [lerp(top[0], sx, 0.2), G - 4], [sx, sy], 16)), q, INK, 0.9, 0.7);
    stroke(el(px, py, 7, 3, Math.PI, TAU, 412, 0), q, INK, 1.2);
    const box = new P([[sx - 4, sy], [sx + 4, sy], [sx + 4, sy + 7], [sx - 4, sy + 7]], true);
    fill(box, INK, 0.7 * q);
  },
});
