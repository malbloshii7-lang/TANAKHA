'use strict';
// III · Al Ghous — the named winds over the pearling sea
scene({
  id: 'pearling', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 22, dur: 8, speed: 11 / 8, num: 'III', name: 'AL GHOUS', ar: 'الغوص', readout: 'SHAMAL · NORTH-WEST',
  kicker: 'AL-GHOUS AL-KABIR · JUNE — SEPTEMBER',
  head: ['WE KNEW', 'EVERY WIND', 'BY NAME.'], accent: { 'WIND': RED },
  arHead: 'وعرفنا الرياح بأسمائها',
  init() {
    const cx = 1430, cy = 430;
    Object.assign(this, { cx, cy });
    this.rings = [el(cx, cy, 182, 182, 0, TAU, 90), el(cx, cy, 174, 174, 0, TAU, 91), el(cx, cy, 60, 60, 0, TAU, 92)];
    this.spokes = [];
    for (let k = 0; k < 16; k++) { const a = (k * TAU) / 16, r0 = k % 2 ? 150 : 60; this.spokes.push(ln(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a), cx + 174 * Math.cos(a), cy + 174 * Math.sin(a), 93 + k, 0.2)); }
    const W8 = (name, ar, a, col, lw, rOut, lx, ly, align) => {
      const x0 = cx + rOut * Math.cos(a), y0 = cy + rOut * Math.sin(a), x1 = cx + 196 * Math.cos(a), y1 = cy + 196 * Math.sin(a);
      return { name, ar, col, lw, path: ln(x0, y0, x1, y1, 110 + lw * 10, 0.6), end: [x1, y1], ang: Math.atan2(y1 - y0, x1 - x0), lx, ly, align };
    };
    this.winds = [
      W8('SHAMAL', 'الشمال', (-3 * Math.PI) / 4, RED, 4.2, 330, 1183, 180, 'right'),
      W8('KAUS', 'الكوس', Math.PI / 4, BLUE, 2.6, 310, 1672, 690, 'left'),
      W8('SUHAILI', 'السهيلي', Math.PI / 2, OCHRE, 2.6, 290, 1456, 742, 'left'),
    ];
    this.waves = [];
    for (let row = 0; row < 6; row++) {
      const y = 836 + row * 30, off = row % 2 ? 24 : 0, pts = [];
      for (let x = 990 + off; x + 48 <= 1880; x += 48) pts.push(...quad([x, y], [x + 24, y - 13], [x + 48, y], 6).slice(pts.length ? 1 : 0));
      this.waves.push(new P(wob(pts, 130 + row, 0.4)));
    }
    this.surface = ln(990, 812, 1880, 812, 140, 0.5);
    // a sambuk at the pearl bank, to one scale (about 13 px to the metre; the bank is ~15 m deep):
    // high square stern and poop, a spoon stem with its head cut in a concave curve, two masts, the sail rigged as a sun
    // awning, oars run out over the side. Each working diver goes down on a stone weight (zubail), which is then hauled
    // back up, and works on a lifeline (yada) held by his hauler (seib) at the rail; resting divers hold ropes tied to the oars.
    // Local coordinates: bow right, waterline y = 0.
    const sheer = cubic([-128, -48], [-70, -20], [60, -17], [126, -32], 28);
    this.sheer = sheer;
    const stem = quad([126, -32], [122, 6], [84, 16], 10);
    this.boat = new P(wob(sheer.concat(stem.slice(1), [[-100, 16]]), 141, 0.35), true);
    const lower = x => (x > 84 ? yOn(stem.slice().reverse(), x) : x < -100 ? 16 - (64 / 28) * (-100 - x) : 16);
    this.bSeams = [0.3, 0.6].map((f, k) => { const pts = []; for (let x = -125; x <= 124; x += 6) { const ys = yOn(sheer, x); pts.push([x, ys + f * (lower(x) - ys)]); } return new P(wob(pts, 160 + k, 0.3)); });
    this.bRail = new P(wob(cubic([-126, -41], [-70, -14], [60, -11], [124, -26], 24), 152, 0.3));
    this.stemHead = new P([[126, -32], [133, -50]].concat(quad([133, -50], [128, -49], [125, -56], 5).slice(1)));
    this.poop = [new P(wob([[-128, -60], [-100, -48], [-74, -38]], 154, 0.2))];
    for (let x = -126; x <= -78; x += 12) this.poop.push(ln(x, yOn(sheer, x), x, yOn(sheer, x) - 11, 155 + x, 0));
    this.boatMast = ln(26, -18, 40, -120, 148, 0.3);
    this.mizzen = ln(-94, -30, -92, -88, 147, 0.2);
    // the main yard lowered and the sail spread over it as an awning against the sun
    this.awnYard = ln(-104, -58, 74, -50, 149, 0.3);
    this.awning = new P(wob([[-104, -58], [74, -50]].concat(quad([74, -50], [-14, -30], [-104, -46], 18).slice(1)), 156, 0.6), true);
    // oars run out over the gunwale toward us, so they read as short strokes down to the water
    this.oars = [-80, -44, -8, 28, 64, 100].map((x, i) => { const y = yOn(sheer, x); return { p: ln(x, y + 1, x + 7, -5, 170 + i, 0.1), blade: new P([[x + 6, -8], [x + 8, -1]]), tip: [x + 7, -5] }; });
    this.bedPts = [[990, 1034], [1150, 1028], [1330, 1038], [1520, 1030], [1690, 1022], [1880, 1016]];
    this.bCrew = [-118, -60, 20, 56].map(x => [x, yOn(sheer, x) + 11]);
    this.bed = pl([[990, 1034], [1150, 1028], [1330, 1038], [1520, 1030], [1690, 1022], [1880, 1016]], false, 143, 0.6);
    // a pearl-oyster bed; the diver reaches for the open one
    const bedPts = [[990, 1034], [1150, 1028], [1330, 1038], [1520, 1030], [1690, 1022], [1880, 1016]];
    this.oysters = [[1418, 4], [1428, 5], [1446, 4], [1470, 5], [1492, 4], [1515, 5], [1538, 4]].map(([x, r]) => [x, yOn(bedPts, x) - 2, r]).map(([x, y, r], i) => ({
      x, y, r, bot: el(x, y, r, r * 0.42, 0, Math.PI, 700 + i, 0.2), top: el(x, y, r, r * 0.42, Math.PI, TAU, 710 + i, 0.2),
    }));
    this.openBot = el(1405, 1032, 6, 2.6, 0, Math.PI, 720, 0.2);
    this.openTop = el(1403, 1029, 6, 2.6, Math.PI, TAU, 721, 0.2, -0.5);
  },
  draw(lt) {
    const { cx, cy } = this;
    this.rings.forEach((r, i) => stroke(r, easeInOut(prog(lt, 0.3 + i * 0.2, 1.5)), INK, 1.6, 0.85));
    this.spokes.forEach((s, i) => stroke(s, prog(lt, 0.9 + i * 0.04, 0.6), INK, i % 2 ? 0.8 : 1.3, 0.6));
    fill(starP(cx, cy, 44, 12, 4, -Math.PI / 2), INK, 0.8 * easeOut(prog(lt, 1.4, 0.6)));
    fill(starP(cx, cy, 30, 9, 4, -Math.PI / 4), OCHRE, 0.85 * easeOut(prog(lt, 1.6, 0.6)));
    this.winds.forEach((w, i) => {
      const t0 = 2.0 + i * 0.5, p = easeInOut(prog(lt, t0, 1.2));
      stroke(w.path, p, w.col, w.lw, 0.85, [20, 12], lt * 36);
      if (p >= 1) arrowHead(w.end[0], w.end[1], w.ang, 18, w.col, 0.9, w.lw * 0.8);
      const lp = easeOut(prog(lt, t0 + 0.8, 0.7));
      smallAr(w.ar, w.lx, w.ly, lp, { size: 32, align: w.align, a: 0.88, weight: 700 });
      small(w.name, w.lx, w.ly + 34, lp, { size: 17, ls: 4, align: w.align, a: 0.75, weight: 600 });
    });
    // the pearling sea
    stroke(this.surface, prog(lt, 0.6, 1.4), INK, 1.3, 0.65);
    this.waves.forEach((w, i) => stroke(w, prog(lt, 0.8 + i * 0.22, 2.2), BLUE, 1.2, 0.5));
    const bp = easeInOut(prog(lt, 1.6, 1.2));
    // the boat heaves and pitches; B maps a point on the boat to the plate
    const bx = 1300 + 3 * Math.sin(lt * 0.9), by = 812 + 3 * Math.sin(lt * 1.3), br = 0.015 * Math.sin(lt * 1.1), cr = Math.cos(br), sr = Math.sin(br);
    const B = ([x, y]) => [bx + x * cr - y * sr, by + x * sr + y * cr], sheer = this.sheer, bed = x => yOn(this.bedPts, x);
    const world = ctx.getTransform();
    ctx.save(); ctx.translate(bx, by); ctx.rotate(br);
    // clip at the sea line itself (y 812 on the plate), so the hull always meets the water
    ctx.save(); const local = ctx.getTransform(); ctx.setTransform(world); ctx.beginPath(); ctx.rect(985, 100, 900, 712); ctx.clip(); ctx.setTransform(local);
    const cq = easeOut(prog(lt, 3.2, 0.6)); // the nakhoda aft, the haulers at the rail; the bulwark hides their legs
    if (cq > 0) this.bCrew.forEach(([x, y]) => { disc(x, y - 22, 3.6 * cq, INK, 0.85); stroke(new P([[x - 4.5, y - 15], [x, y - 17.5], [x + 4.5, y - 15]]), cq, INK, 2.2, 0.85); stroke(new P([[x, y - 17], [x, y - 6]]), cq, INK, 2.8, 0.85); });
    mask(this.boat); hatch(this.boat, [-130, -60, 135, 20], 0.3, 6, bp, INK, 1, 0.4, 146); stroke(this.boat, bp, INK, 2);
    this.bSeams.forEach((q, k) => stroke(q, prog(lt, 2.0 + k * 0.2, 0.9), INK, 0.9, 0.6));
    stroke(this.bRail, bp, INK, 1.3, 0.8); stroke(this.stemHead, bp, INK, 2.2);
    this.poop.forEach(q => stroke(q, prog(lt, 2.4, 0.6), INK, 1.2, 0.8));
    ctx.restore();
    // below the waterline the sea is drawn in section, so the submerged hull (~1.2 m draft) shows through the water, paler
    ctx.save(); const local2 = ctx.getTransform(); ctx.setTransform(world); ctx.beginPath(); ctx.rect(985, 812, 900, 60); ctx.clip(); ctx.setTransform(local2);
    mask(this.boat); fill(this.boat, BLUE, 0.1 * bp); stroke(this.boat, bp, INK, 1.4, 0.45);
    ctx.restore();
    stroke(this.boatMast, prog(lt, 2.4, 0.7), INK, 2.2); stroke(this.mizzen, prog(lt, 2.5, 0.6), INK, 1.8);
    const aq = easeOut(prog(lt, 2.8, 0.7)); // the sail spread as an awning
    fill(this.awning, OCHRE, 0.3 * aq); stroke(this.awning, aq, INK, 1.1, 0.8); stroke(this.awnYard, aq, INK, 2.2);
    this.oars.forEach((o, i) => { const q = easeOut(prog(lt, 3.0 + i * 0.1, 0.5)); stroke(o.p, q, INK, 1.8, 0.85); stroke(o.blade, q, INK, 3, 0.85); });
    ctx.restore();
    // everything in the water is drawn on the plate: it does not heave with the boat
    // the anchor cable runs down and forward to a grapnel on the bed
    const ax = 1582, ay = bed(1582) - 3, aq2 = easeInOut(prog(lt, 3.2, 1.6));
    stroke(new P(quad(B([122, -26]), [1478, 900], [ax, ay], 20)), aq2, INK, 1, 0.55);
    if (aq2 >= 1) [[[ax - 6, ay + 1], [ax + 7, ay + 2]], [[ax + 7, ay + 2], [ax + 11, ay - 3]], [[ax - 6, ay + 1], [ax - 9, ay - 4]]].forEach(sg => stroke(new P(sg), 1, INK, 1.4, 0.85));
    // the working diver, feet on the bed, on his lifeline, reaching for an open oyster
    const fx = 1392, fy = bed(1392) - 1, dq = easeOut(prog(lt, 4.6, 0.8)), sw = 0.8 * Math.sin(lt * 1.7);
    stroke(new P(quad(B([58, yOn(sheer, 58) + 2]), [1372, 900], [fx - 1, fy - 12 + sw], 18)), easeInOut(prog(lt, 3.6, 1.4)), INK, 1.1, 0.8);
    if (dq > 0) {
      disc(fx - 2, fy - 20 + sw, 2.8 * dq, INK, 0.85);
      stroke(new P([[fx - 2, fy - 17 + sw], [fx, fy - 8]]), dq, INK, 2.4, 0.85);
      stroke(new P([[fx - 2, fy - 15 + sw], [fx - 5, fy - 22 + sw]]), dq, INK, 1.4, 0.85);
      stroke(new P([[fx - 1, fy - 15 + sw], [fx + 5, fy - 10], [fx + 11, fy - 4]]), dq, INK, 1.4, 0.85);
      stroke(new P([[fx, fy - 8], [fx - 4, fy]]), dq, INK, 1.6, 0.85); stroke(new P([[fx, fy - 8], [fx + 5, fy]]), dq, INK, 1.6, 0.85);
      disc(fx + 1, fy - 13 + sw, 2 * dq, SEPIA, 0.7); // the net bag at his neck
    }
    // the stone weight, hauled back up now that he is down
    const sx = 1322, sy = lerp(bed(1322) - 7, 846, easeInOut(prog(lt, 4.6, 4.2))), sq = easeOut(prog(lt, 3.6, 0.6));
    if (sq > 0) { stroke(new P([B([20, yOn(sheer, 20) + 2]), [sx + 1, sy]]), sq, INK, 1, 0.75); fill(new P([[sx - 4, sy], [sx + 4, sy], [sx + 6, sy + 6], [sx - 6, sy + 6]], true), SEPIA, 0.85 * sq); }
    // two resting divers at the surface, each holding the rope tied to his oar
    const rq = easeOut(prog(lt, 3.4, 0.6));
    if (rq > 0) [0, 1].forEach(i => { const t = B(this.oars[i].tip), hx = t[0] + 5, hy = 809.4 + 0.8 * Math.sin(lt * 2 + i); stroke(new P([t, [hx + 1, hy + 2]]), rq, INK, 0.9, 0.7); disc(hx, hy, 2.8 * rq, INK, 0.85); });
    stroke(this.bed, prog(lt, 2.2, 1.6), INK, 1.2, 0.6);
    this.oysters.forEach((o, i) => {
      const q = easeOut(prog(lt, 4.4 + i * 0.08, 0.6));
      fill(o.bot, SEPIA, 0.4 * q); fill(o.top, SEPIA, 0.3 * q); stroke(o.top, q, INK, 1.3, 0.85); stroke(o.bot, q, INK, 1.3, 0.85);
    });
    const op = easeOut(prog(lt, 5.4, 1.0));
    fill(this.openBot, SEPIA, 0.4 * op); stroke(this.openBot, op, INK, 1.5); stroke(this.openTop, op, INK, 1.5);
    const pq = easeOut(prog(lt, 6.0, 0.8)); // the pearl
    disc(1405, 1031, 2.6 * pq, '#FBF3E2', 1, 'source-over'); disc(1404.4, 1030.4, 1 * pq, '#FFFFFF', 0.95, 'source-over');
    if (pq > 0.5) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + lt * 0.8, g = (pq - 0.5) * 2; stroke(new P([[1405 + 5 * Math.cos(a), 1031 + 5 * Math.sin(a)], [1405 + 10 * Math.cos(a), 1031 + 10 * Math.sin(a)]]), g, OCHRE, 1.1, 0.8); }
  },
});
