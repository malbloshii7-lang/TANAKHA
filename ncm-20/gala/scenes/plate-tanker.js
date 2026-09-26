'use strict';
// A laden crude tanker under way in the Sea of Oman off Fujairah, heading south-east (away from the strait), the Hajar
// behind her. Every size comes from one viewpoint: the eye 12 m up on a small vessel at 25.2262 N, 56.4271 E, looking
// south-west (bearings 227-242 deg across the plate, 60 px a degree).
//   The skyline: the true skyline computed from terrain tiles (data/build/rak_skyline.py 25.2262 56.4271 226.5 242.5
//   --sea --true): every bearing in the frame has UAE ground (Fujairah) as its ridge, 1.3-1.9 deg high, 24-32 km away.
//   The ship: a very large crude carrier, 336 m long, 1.8 km off (1.91 px a metre), seen nearly broadside. On a
//   south-easterly course she moves to the left of the frame at 12 knots (6.2 m/s, 11.8 px a second). Laden with some
//   two million barrels she shows about 9 m of hull; her waterline lies 0.38 deg (23 px) below eye level. A small bow
//   wave; her wake stays in the water behind her. A slight sea: fine wavelets, no whitecaps.
// No terminal, no loading buoy, no funnel smoke (off Fujairah in 2026, smoke reads as fire), no name, no flag, no company
// livery or logo (TREATMENT.md, Revision 3).
// The inset: the east-coast marine bulletin, its lines drafting themselves (the AI assistant prepares the draft), then
// signed (a forecaster approves it). No numbers are shown. Its chart is the UAE's east coast from the film's own map
// data (data/uae-map.json: the national map's neutral geometry, pending the FGIC map), from the Oman border at Dibba to
// the Oman border south of Kalba, with the sea to the east: no Musandam, no strait, no route, no ship marker.
const TK = { eye: 600, px: 1.91, sternX: 1765, v: 11.8, t0: 1.4, mid: 3.9 }; // t0: the scene clock at the cut (the beat's offset); mid: mid-beat
const EAST_COAST = [[56.2699, 25.6291], [56.2738, 25.6214], [56.2816, 25.6229], [56.28, 25.6137], [56.2893, 25.6067], [56.3067, 25.6108], [56.3362, 25.6042], [56.3557, 25.5939], [56.3549, 25.5524], [56.3698, 25.5251], [56.3603, 25.4868], [56.364, 25.4201], [56.3585, 25.3774], [56.3479, 25.3746], [56.3572, 25.3496], [56.3667, 25.3491], [56.3665, 25.3592], [56.3752, 25.3481], [56.3812, 25.3249], [56.3758, 25.3148], [56.3647, 25.245], [56.3703, 25.2415], [56.3586, 25.1957], [56.361, 25.0682], [56.3756, 24.9811]]; // arcs 43, 25, 23, 39, 45 of data/uae-map.json, north to south
scene({
  id: 'tanker',
  init() {
    const r = rng(71), m = TK.px, yw = TK.eye + 22.9;
    this.yw = yw;
    this.ridge = [[991.0,492.7,29190],[1003.0,493.4,29595],[1015.0,490.6,29460],[1027.0,490.1,29415],[1039.0,493.6,29370],[1051.0,494.9,29370],[1063.0,493.6,29370],[1075.0,491.7,29370],[1087.0,492.1,29370],[1099.0,492.0,29370],[1111.0,492.4,29460],[1123.0,494.9,29505],[1135.0,497.3,29505],[1147.0,503.9,29460],[1159.0,506.1,29370],[1171.0,504.8,29370],[1183.0,504.4,29370],[1195.0,505.3,29370],[1207.0,505.7,29415],[1219.0,507.2,29415],[1231.0,510.5,29640],[1243.0,510.1,29730],[1255.0,512.5,31935],[1267.0,513.1,31800],[1279.0,512.8,31755],[1291.0,516.2,31845],[1303.0,514.5,31890],[1315.0,515.5,31710],[1327.0,517.9,31665],[1339.0,519.7,31935],[1351.0,518.3,29055],[1363.0,518.8,29055],[1375.0,516.7,29010],[1387.0,514.0,29010],[1399.0,513.5,29055],[1411.0,512.5,29145],[1423.0,511.0,30315],[1435.0,507.3,30180],[1447.0,503.5,30180],[1459.0,500.0,30180],[1471.0,496.6,30180],[1483.0,495.7,30225],[1495.0,494.4,30225],[1507.0,494.9,30270],[1519.0,495.5,30180],[1531.0,494.1,30180],[1543.0,494.6,30090],[1555.0,497.8,30090],[1567.0,499.0,30090],[1579.0,498.3,30090],[1591.0,497.4,30090],[1603.0,500.7,29910],[1615.0,501.4,29910],[1627.0,501.2,24285],[1639.0,499.6,23475],[1651.0,497.4,23475],[1663.0,499.2,29730],[1675.0,498.8,29685],[1687.0,499.3,29730],[1699.0,502.5,29685],[1711.0,503.0,29685],[1723.0,504.1,29685],[1735.0,502.4,29640],[1747.0,502.6,29640],[1759.0,501.4,23250],[1771.0,498.8,23250],[1783.0,500.5,23250],[1795.0,501.8,29460],[1807.0,499.2,29505],[1819.0,497.5,29505],[1831.0,493.9,29550],[1843.0,493.3,29595],[1855.0,496.5,29595],[1867.0,497.6,29550],[1879.0,496.1,29460]].map(([x, y]) => [x, y]);
    this.ridgeP = pl(this.ridge, false, 900, 0.3);
    this.ridgeFill = new P(this.ridge.concat([[1885, TK.eye + 5], [985, TK.eye + 5]]), true);
    this.shore = pl([[985, TK.eye + 5], [1885, TK.eye + 5]], false, 901, 0.4); // the coast, 6-7 km off, just below eye level
    // the ship, in metres from her stern (x, forward) and the waterline (y), bow to the LEFT: she steams south-east
    const L = 336, fb = 9, S = (x, y) => [TK.sternX - x * m, yw - y * m];
    this.hull = new P([S(0, -0.3), S(-1, fb + 0.6), S(4, fb + 1.0), S(298, fb), S(302, fb + 2.4), S(330, fb + 2.9), S(336, fb + 3.2), S(333, 4), S(328, -0.3)], true);
    this.hullBox = [S(L, 0)[0] - 4, yw - (fb + 4) * m, S(-1, 0)[0] + 4, yw + 2];
    this.deckLine = pl([S(4, fb + 1.0), S(298, fb)], false, 902, 0.2);
    this.focsle = pl([S(302, fb + 2.4), S(330, fb + 2.9)], false, 903, 0.2);
    this.accom = new P([S(12, fb + 1), S(12, fb + 18), S(38, fb + 18), S(38, fb + 1)], true);
    this.decks = [3.6, 6.9, 10.2, 13.5].map((h, i) => pl([S(13, fb + 1 + h), S(37, fb + 1 + h)], false, 910 + i, 0.1));
    this.windows = [];
    for (let d = 0; d < 5; d++) for (let k = 0; k < 7; k++) this.windows.push(new P([S(15 + k * 3.1, fb + 2.6 + d * 3.3), S(16.6 + k * 3.1, fb + 2.6 + d * 3.3), S(16.6 + k * 3.1, fb + 3.9 + d * 3.3), S(15 + k * 3.1, fb + 3.9 + d * 3.3)], true));
    this.bridge = new P([S(10, fb + 18), S(10, fb + 21.5), S(40, fb + 21.5), S(40, fb + 18)], true);
    this.bridgeWin = new P([S(11, fb + 19.2), S(11, fb + 20.8), S(39, fb + 20.8), S(39, fb + 19.2)], true);
    this.radarMast = [pl([S(24, fb + 21.5), S(24, fb + 30)], false, 915, 0), pl([S(20, fb + 28), S(28, fb + 28)], false, 916, 0)];
    this.funnel = new P([S(3, fb + 1), S(4, fb + 25), S(11, fb + 26), S(12, fb + 1)], true);
    this.lifeboat = new P([S(-1, fb + 4), S(2, fb + 7.5), S(11, fb + 5), S(8, fb + 1.5)], true);
    this.pipes = pl([S(40, fb + 1.6), S(298, fb + 1.6)], false, 920, 0.15);
    this.catwalk = pl([S(40, fb + 3.2), S(298, fb + 3.2)], false, 921, 0.15);
    this.walkLegs = []; for (let x = 52; x < 296; x += 18) this.walkLegs.push(pl([S(x, fb + 0.2), S(x, fb + 3.2)], false, 922 + x, 0));
    this.manifold = [pl([S(164, fb), S(164, fb + 4.5)], false, 940, 0), pl([S(172, fb), S(172, fb + 4.5)], false, 941, 0)];
    this.crane = [pl([S(178, fb), S(178, fb + 14)], false, 945, 0), pl([S(178, fb + 13), S(166, fb + 9)], false, 946, 0)];
    this.foremast = pl([S(314, fb + 2.9), S(314, fb + 17)], false, 950, 0);
    this.hatchCovers = []; for (let x = 60; x < 290; x += 23) this.hatchCovers.push(new P([S(x, fb), S(x, fb + 1.1), S(x + 3, fb + 1.1), S(x + 3, fb)], true));
    // the bow wave, carried with her: a low crest at the stem and a line of broken water running aft along her side
    const [bx] = S(L, 0);
    this.bowWave = [
      new P(wob(quad([bx + 10, yw + 1.5], [bx + 2, yw - 3.5], [bx - 9, yw + 1.2], 8), 985, 0.3)),
      new P(wob(quad([bx + 22, yw + 3], [bx + 12, yw - 1.5], [bx - 4, yw + 3.5], 8), 986, 0.3)),
    ];
    this.sideFoam = []; for (let k = 0; k < 9; k++) { const x0 = bx + 14 + k * 9 + r() * 5; this.sideFoam.push({ p: new P([[x0, yw + 1.2 + r()], [x0 + 5 + r() * 5, yw + 1.4 + r()]]), a: 0.7 - k * 0.06 }); }
    // her wake: broken water fixed in the sea behind the stern, revealed as she moves on, fading with its age
    this.wake = []; for (let k = 0; k < 90; k++) { const x0 = TK.sternX - 40 + r() * 190, y0 = yw + 0.8 + Math.pow(r(), 1.5) * 9; this.wake.push({ x0, p: new P([[x0, y0], [x0 + 5 + r() * 11, y0 + (r() - 0.5) * 0.8]]) }); }
    // the sea: broken strokes closing up toward the land
    this.sea = [];
    for (let row = 0; row < 46; row++) {
      const d = row / 45, y = TK.eye + 7 + 385 * Math.pow(d, 2.1);
      if (y > 1000) break;
      let x = 985 + r() * 40;
      while (x < 1880) {
        const len = 10 + 90 * d * (0.4 + r()), gap = 6 + 40 * (1 - d) * r() + 14 * d, x1 = Math.min(1885, x + len);
        this.sea.push({ p: pl([[x, y + (r() - 0.5) * 1.2], [x1, y + (r() - 0.5) * 1.2]], false, 1000 + this.sea.length, 0.15), w: 0.6 + 0.8 * d, a: 0.28 + 0.32 * d, d });
        x = x1 + gap;
      }
    }
    // the bulletin inset (upper left of the plate): a sheet with a small chart of the east coast and its lines of text
    this.sheet = new P([[1010, 150], [1300, 150], [1300, 420], [1010, 420]], true);
    this.sheetIn = new P([[1018, 158], [1292, 158], [1292, 412], [1018, 412]], true);
    // the chart: north up, true to scale at 25.3 N (352 px a degree of latitude), the coast running the box's full height
    const k = 228 / (25.6291 - 24.9811), kx = k * Math.cos(25.3 * Math.PI / 180), C = ([lo, la]) => [1075 + (lo - 56.2699) * kx, 172 + (25.6291 - la) * k];
    this.coastPts = EAST_COAST.map(C);
    this.coast = new P(this.coastPts, false);
    this.chartBox = new P([[1030, 172], [1160, 172], [1160, 400], [1030, 400]], true);
    // the sea to the east of the coast: wavy lines from the shore to the box's edge
    const coastX = y => { const p = this.coastPts; for (let i = 1; i < p.length; i++) if (p[i][1] >= y) { const u = (y - p[i - 1][1]) / Math.max(1e-6, p[i][1] - p[i - 1][1]); return p[i - 1][0] + u * (p[i][0] - p[i - 1][0]); } return p[p.length - 1][0]; };
    this.chartSea = []; for (let y = 180; y < 398; y += 15) { const x0 = coastX(y) + 5, pts = []; for (let x = x0; x <= 1155; x += 5) pts.push([x, y + 1.2 * Math.sin((x - x0) * 0.35 + y)]); if (pts.length > 1) this.chartSea.push(new P(pts)); }
    this.textLines = []; for (let j = 0; j < 11; j++) this.textLines.push({ y: 186 + j * 17, w: 70 + (j * 37) % 55 });
    this.sign = new P(wob([[1200, 390], [1212, 380], [1222, 392], [1232, 377], [1246, 391], [1262, 384], [1280, 386]], 970, 0.6));
  },
  draw(lt) {
    ctx.save(); ctx.beginPath(); ctx.rect(985, 100, 900, 900); ctx.clip();
    // the Hajar behind Fujairah, far and light
    const mq = easeInOut(prog(lt, 0.2, 1.4));
    mask(this.ridgeFill);
    hatch(this.ridgeFill, [985, 480, 1885, 610], -1.35, 6, mq, SEPIA, 0.8, 0.28, 905);
    stroke(this.ridgeP, mq, INK, 1.3, 0.6);
    stroke(this.shore, easeOut(prog(lt, 0.6, 1.0)), INK, 1, 0.5);
    const sw = easeOut(prog(lt, 0.3, 1.4));
    this.sea.forEach(w => stroke(w.p, clamp(sw * 1.6 - w.d * 0.6), BLUE, w.w, w.a));
    // her wake, behind wherever her stern is now
    const dx = -TK.v * (lt - TK.mid), stern = TK.sternX + dx, q = easeInOut(prog(lt, 0.5, 1.3)), dq = easeOut(prog(lt, 1.2, 1.0));
    this.wake.forEach(w => { const age = w.x0 - stern; if (age > 2) stroke(w.p, q, BLUE, 0.9, 0.55 * clamp(1 - age / 190)); });
    // the ship, moving left
    ctx.save(); ctx.translate(dx, 0);
    mask([this.hull, this.accom, this.bridge, this.funnel]);
    hatch(this.hull, this.hullBox, 0.1, 4, q, INK, 1, 0.5, 930);
    fill(this.hull, INK, 0.25 * q); stroke(this.hull, q, INK, 1.8);
    stroke(this.deckLine, q, INK, 1, 0.7); stroke(this.focsle, q, INK, 1, 0.7);
    stroke(this.pipes, dq, INK, 0.9, 0.7); stroke(this.catwalk, dq, INK, 0.9, 0.7); this.walkLegs.forEach(l => stroke(l, dq, INK, 0.6, 0.5));
    this.hatchCovers.forEach(h => stroke(h, dq, INK, 0.7, 0.6));
    this.manifold.forEach(l => stroke(l, dq, INK, 1, 0.8)); this.crane.forEach(l => stroke(l, dq, INK, 1.1, 0.85));
    stroke(this.foremast, dq, INK, 1.1, 0.85);
    stroke(this.accom, q, INK, 1.5); this.decks.forEach(l => stroke(l, q, INK, 0.7, 0.5));
    this.windows.forEach(w => fill(w, BLUE, 0.35 * dq));
    stroke(this.bridge, q, INK, 1.5); fill(this.bridgeWin, BLUE, 0.5 * dq);
    this.radarMast.forEach(l => stroke(l, dq, INK, 1.1));
    fill(this.funnel, INK, 0.12 * q); stroke(this.funnel, q, INK, 1.4);
    fill(this.lifeboat, OCHRE, 0.7 * dq); stroke(this.lifeboat, dq, INK, 1);
    // the bow wave and the broken water along her side
    this.bowWave.forEach(w => stroke(w, dq, BLUE, 1.2, 0.8));
    this.sideFoam.forEach(f => stroke(f.p, dq, BLUE, 0.9, f.a));
    ctx.restore();
    // the east-coast bulletin: the draft writes itself line by line, then it is signed
    const iq = easeOut(prog(lt, 0.8, 0.8));
    if (iq > 0) {
      mask(this.sheet); fill(this.sheet, SEPIA, 0.05 * iq); stroke(this.sheet, iq, INK, 1.4); stroke(this.sheetIn, iq, INK, 0.7, 0.6);
      stroke(this.chartBox, iq, INK, 0.8, 0.6);
      this.chartSea.forEach(p => stroke(p, iq, BLUE, 0.9, 0.5));
      stroke(this.coast, iq, INK, 1.4, 0.85);
      // the draft writes itself from 0.4 s after the cut; the forecaster signs it 3.4 s in, as the narrator says so
      this.textLines.forEach((l, j) => { const wq = clamp((lt - TK.t0 - 0.4 - j * 0.16) / 0.3); if (wq > 0) stroke(new P([[1172, l.y], [1172 + l.w * wq, l.y]]), 1, INK, 1.2, 0.6); });
      stroke(this.sign, easeInOut(prog(lt, TK.t0 + 3.4, 0.7)), BLUE, 1.6, 0.9);
    }
    ctx.restore();
  },
});
