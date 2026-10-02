'use strict';
// IX · Al Mujtamaʿ — April 2024: Abu Dhabi's Corniche across the water under a greying sky and fine rain; along the top,
// NCM's own weather-map symbols, whose storm symbol takes a steady red ring (the red warning level); then the sky clears
scene({
  id: 'homes', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 70, dur: 8, num: 'IX', name: 'AL MUJTAMA‘', ar: 'المجتمع', readout: 'WMO · 24 H NOTICE CAN CUT DAMAGE BY 30%',
  kicker: 'FORECAST 11 APRIL · RED ALERT 16 APRIL 2024',
  head: ['WE WATCH', 'OVER EVERY', 'HOME.'], accent: { 'HOME.': RED },
  arHead: 'ونسهر على كل بيت',
  alertT: 11.2, rainT: 1.0, clearT: 12.5,
  init() {
    const base = 800;
    this.base = base;
    // The Corniche seen from the water, to one scale (about 1.15 px per metre, from CTBUH heights):
    // WTC tower and Trust Tower, The Landmark, ordinary mid-rise towers, Nation Towers, ADNOC HQ, the five Etihad Towers, Emirates Palace.
    const m = h => base - h * 1.155, box = (x0, x1, top, seed) => new P(wob([[x0, base], [x0, top], [x1, top], [x1, base], [x0, base]], seed, 0.3).slice(0, -1), true);
    this.sky = [];
    const add = (o) => { o.i = this.sky.length; this.sky.push(o); };
    // World Trade Center tower (381 m) with its curved crown, and the Trust Tower (277 m)
    add({ body: new P([[1016, base], [1016, m(360)], ...quad([1016, m(360)], [1030, m(384)], [1064, m(381)], 8).slice(1), [1064, base]], true), glass: [1024, 1032, 1040, 1048, 1056].map(x => new P([[x, base], [x, m(355)]])), ring: new P([[1016, m(352)], [1064, m(352)]]) });
    add({ body: new P([[1072, base], ...quad([1072, m(270)], [1072, m(277)], [1080, m(277)], 4), ...quad([1104, m(277)], [1112, m(277)], [1112, m(270)], 4), [1112, base]], true), glass: [1080, 1088, 1096, 1104].map(x => new P([[x, base], [x, m(272)]])) });
    // The Landmark (324 m): a twelve-sided prism whose screens step in like petals, a glass lantern on top
    const lmPts = [[1146, base]]; for (let k = 0; k < 6; k++) { const y0 = m(40 + k * 40); lmPts.push([1146 + (k % 2), y0], [1148 + (k % 2), y0 - 6]); }
    lmPts.push([1150, m(268)], [1152, m(324)], [1190, m(324)], [1192, m(268)]); for (let k = 5; k >= 0; k--) { const y0 = m(40 + k * 40); lmPts.push([1194 - (k % 2), y0 - 6], [1196 - (k % 2), y0]); } lmPts.push([1196, base]);
    add({ body: new P(lmPts, true), glass: [1158, 1171, 1184].map(x => new P([[x, base], [x, m(268)]])), lantern: [1158, 1171, 1184].map(x => new P([[x, m(268)], [x, m(320)]])), band: new P([[1150, m(268)], [1192, m(268)]]) });
    // ordinary mid-rise towers along the seafront, lighter
    [[1212, 1244, 150], [1250, 1286, 118], [1292, 1318, 172], [1324, 1360, 132], [1366, 1392, 160], [1398, 1428, 108]].forEach(([a, b, h], i) => add({ body: box(a, b, m(h), 700 + i), mid: true, x0: a, x1: b, h }));
    // Nation Towers (268 m and 233 m) and the sky bridge between them at 202 m
    add({ body: box(1442, 1474, m(268), 710), glass: [1450, 1458, 1466].map(x => new P([[x, base], [x, m(262)]])) });
    add({ body: box(1508, 1538, m(233), 711), glass: [1516, 1524, 1532].map(x => new P([[x, base], [x, m(228)]])) });
    add({ body: new P([[1474, m(202)], [1508, m(202)], [1508, m(218)], [1474, m(218)]], true) });
    // ADNOC HQ (342 m): a straight slab; pale granite side walls rise past the glass to a lintel, leaving an open square at the crown
    add({ body: new P([[1560, base], [1560, m(342)], [1612, m(342)], [1612, base]], true), adnoc: true,
      glassFace: new P([[1569, base], [1569, m(312)], [1603, m(312)], [1603, base]], true), glass: [1575, 1581, 1587, 1593, 1599].map(x => new P([[x, base], [x, m(312)]])),
      walls: [new P([[1569, base], [1569, m(334)]]), new P([[1603, base], [1603, m(334)]]), new P([[1569, m(334)], [1603, m(334)]])] });
    // Etihad Towers (305, 278, 260, 234, 218 m): five slim sail-like towers in a cluster
    const sail = (x0, w, h, seed) => { const top = m(h), pts = [[x0, base], [x0 + 1, top]].concat(quad([x0 + 1, top], [x0 + w * 0.7, top - 3], [x0 + w, top + h * 0.09], 8).slice(1), quad([x0 + w, top + h * 0.09], [x0 + w * 1.18, m(h * 0.5)], [x0 + w - 2, base], 14).slice(1)); return new P(wob(pts, seed, 0.25), true); };
    [[1716, 34, 260], [1684, 36, 278], [1744, 32, 218], [1628, 32, 234], [1652, 38, 305]].forEach(([x0, w, h], i) => add({ body: sail(x0, w, h, 720 + i), glass: [0.3, 0.6].map(f => new P(quad([x0 + w * f, base], [x0 + w * f + w * 0.12, m(h * 0.5)], [x0 + w * f, m(h) + 6], 10))) }));
    // Emirates Palace: a long low front, a great central dome over the tallest block, small domes on the wings
    add({ body: new P([[1782, base], [1782, m(18)], [1812, m(18)], [1812, m(34)], [1860, m(34)], [1860, m(18)], [1885, m(18)], [1885, base]], true), palace: true, // about 1 km long: its wing runs on past the plate
      outline: new P([[1885, m(18)], [1860, m(18)], [1860, m(34)], [1812, m(34)], [1812, m(18)], [1782, m(18)], [1782, base]]) });
    this.palaceDome = el(1836, m(34), 24, 26, Math.PI, TAU, 730, 0.2);
    this.palaceFinial = ln(1836, m(34) - 26, 1836, m(34) - 36, 731, 0);
    this.palaceDomes = [1790, 1802, 1870, 1882].map((x, i) => el(x, m(18), 4.5, 5, Math.PI, TAU, 732 + i, 0));
    // the sea between the Corniche and the homes on this shore
    this.water = [806, 818, 832, 848].map((y, i) => new P(wob([[985 + i * 14, y], [1885 - i * 10, y]], 740 + i, 0.6)));
    // villas and a mosque in the foreground
    this.villas = [1004, 1150, 1440, 1600, 1760].map((x, i) => ({ x, p: new P(wob([[x, 930], [x, 872], [x + 86, 872], [x + 86, 930], [x, 930]], 730 + i, 0.4).slice(0, -1), true) }));
    this.dome = el(1320, 900, 44, 40, Math.PI, TAU, 740, 0.3);
    this.drum = new P([[1272, 930], [1272, 900], [1368, 900], [1368, 930]], true);
    this.minaret = new P([[1382, 930], [1382, 800], [1378, 790], [1398, 790], [1394, 800], [1394, 930]], true);
    this.minTop = new P([[1380, 790], [1388, 752], [1396, 790]], true);
    this.ground = ln(985, 930, 1885, 930, 745, 0.5);
    // weather glyphs across the top
    this.glyphs = [0, 1, 2, 3, 4, 5].map(k => ({ cx: 1046 + k * 128, cy: 190, ring: el(1046 + k * 128, 190, 34, 34, 0, TAU, 750 + k, 0.3) }));
  },
  glyph(k, cx, cy, q) {
    if (q <= 0) return;
    const cloud = (x, y, s) => { [[-12, 2, 10], [0, -5, 13], [13, 2, 9]].forEach(([dx, dy, r]) => stroke(el(x + dx * s, y + dy * s, r * s, r * s, Math.PI * 0.95, Math.PI * 2.05, 760 + k, 0), q, INK, 1.3)); stroke(new P([[x - 22 * s, y + 10 * s], [x + 22 * s, y + 10 * s]]), q, INK, 1.3); };
    if (k === 0) { disc(cx, cy, 11 * q, OCHRE, 0.95); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; stroke(new P([[cx + 15 * Math.cos(a), cy + 15 * Math.sin(a)], [cx + 22 * Math.cos(a), cy + 22 * Math.sin(a)]]), q, INK, 1.3); } }
    if (k === 1) cloud(cx, cy + 2, 1);
    if (k === 2) { cloud(cx, cy - 6, 0.9); for (let i = 0; i < 4; i++) stroke(new P([[cx - 12 + i * 8, cy + 10], [cx - 16 + i * 8, cy + 20]]), q, BLUE, 1.6); }
    if (k === 3) for (let i = 0; i < 4; i++) stroke(new P([[cx - 20 + (i % 2) * 4, cy - 12 + i * 8], [cx + 18 - (i % 2) * 4, cy - 12 + i * 8]]), q, SEPIA, 1.8);
    if (k === 4) { stroke(new P(quad([cx - 20, cy], [cx, cy - 14], [cx + 20, cy], 10)), q, OCHRE, 1.8); for (let i = 0; i < 7; i++) disc(cx - 15 + i * 5, cy + 8 + (i % 2) * 5, 1.8 * q, SEPIA); }
    if (k === 5) { cloud(cx, cy - 8, 0.9); stroke(new P([[cx + 2, cy + 4], [cx - 6, cy + 14], [cx + 2, cy + 14], [cx - 6, cy + 24]]), q, RED, 2); }
  },
  draw(lt) {
    const base = this.base;
    this.sky.forEach(b => {
      const q = easeOut(prog(lt, 0.3 + b.i * 0.06, 0.7));
      if (q <= 0) return;
      mask(b.body);
      if (b.mid) { // lighter, with floor lines
        stroke(b.body, q, INK, 1.1, 0.6);
        ctx.save(); ctx.beginPath(); b.body.trace(ctx, 1); ctx.clip();
        ctx.globalAlpha = SA * 0.25 * q; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath();
        for (let y = base - b.h * 1.155 + 8; y < base; y += 9) { ctx.moveTo(b.x0 + 3, y); ctx.lineTo(b.x1 - 3, y); }
        ctx.stroke(); ctx.restore(); return;
      }
      if (b.adnoc) { fill(b.glassFace, BLUE, 0.3 * q); b.glass.forEach(g => stroke(g, q, INK, 0.7, 0.45)); stroke(b.body, q, INK, 1.6); b.walls.forEach(w => stroke(w, q, INK, 1.2, 0.85)); return; }
      if (b.palace) { fill(b.body, OCHRE, 0.25 * q); stroke(b.outline, q, INK, 1.3); return; }
      fill(b.body, BLUE, 0.16 * q);
      (b.glass || []).forEach(g => stroke(g, q, INK, 0.7, 0.4)); (b.lantern || []).forEach(g => stroke(g, q, INK, 0.5, 0.35));
      if (b.ring) stroke(b.ring, q, INK, 1.1, 0.7); if (b.band) stroke(b.band, q, INK, 1.1, 0.7);
      stroke(b.body, q, INK, 1.6);
    });
    const pq0 = easeOut(prog(lt, 1.2, 0.6));
    fill(this.palaceDome, OCHRE, 0.35 * pq0); stroke(this.palaceDome, pq0, INK, 1.3); stroke(this.palaceFinial, pq0, INK, 1.1);
    this.palaceDomes.forEach(d => { fill(d, OCHRE, 0.35 * pq0); stroke(d, pq0, INK, 1); });
    this.water.forEach((w, i) => stroke(w, prog(lt, 0.5 + i * 0.1, 1.2), BLUE, 1, 0.45, [18 - i * 2, 10 + i * 3], i * 7));
    smallAr('كورنيش أبوظبي', 1319, 572, prog(lt, 2.0, 0.8), { size: 24, align: 'center', a: 0.75, weight: 600 });
    stroke(this.ground, prog(lt, 0.5, 1.0), INK, 1.6, 0.8);
    const fq = easeOut(prog(lt, 1.2, 0.8));
    mask([this.drum, this.minaret, this.minTop]); fill(this.dome, OCHRE, 0.45 * fq);
    [this.drum, this.minaret, this.minTop].forEach(q => stroke(q, fq, INK, 1.5)); stroke(this.dome, fq, INK, 1.6);
    // NCM's warning on its own channel, the weather map's symbols: the storm symbol takes a steady red ring (the red
    // level) at alertT. No pulsing, no rings over the city, no phones: public alert messages belong to NCEMA. The rain is
    // fine and calm; it builds from rainT and thins from clearT.
    const t0 = this.alertT;
    const rq = easeOut(prog(lt, this.rainT, 2.0)) * (1 - easeInOut(prog(lt, this.clearT, 3.0)));
    if (rq > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(985, 250, 900, 680); ctx.clip();
      ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = BLUE; ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
      const r = rng(91);
      for (let i = 0; i < 150; i++) {
        const x0 = 985 + r() * 930, v = 420 + r() * 180, ph = r(), len = 12 + r() * 12, span = 690, keep = r();
        if (keep > rq) continue; // thinning: fewer streaks, not fainter ones
        const y = 250 + ((ph * span + lt * v) % span), x = x0 - (y - 250) * 0.08;
        ctx.globalAlpha = SA * (0.2 + 0.2 * r());
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * 0.08, y - len); ctx.stroke();
      }
      ctx.restore();
    }
    this.villas.forEach((vl, i) => {
      const q = easeOut(prog(lt, 1.0 + i * 0.1, 0.6));
      mask(vl.p); stroke(vl.p, q, INK, 1.6);
      stroke(new P([[vl.x + 30, 930], [vl.x + 30, 900], [vl.x + 52, 900], [vl.x + 52, 930]]), q, INK, 1.1, 0.8);
    });
    // weather glyphs: sun, cloud, rain, fog, dust, storm
    this.glyphs.forEach((g, k) => {
      const q = easeOut(prog(lt, 0.8 + k * 0.15, 0.5));
      stroke(g.ring, q, INK, 1.2, 0.7);
      this.glyph(k, g.cx, g.cy, q);
    });
    const active = this.glyphs[5];
    stroke(el(active.cx, active.cy, 41, 41, -Math.PI / 2, 1.5 * Math.PI, 790, 0), easeInOut(prog(lt, t0, 1.2)), RED, 2.4, 0.9);
  },
});
