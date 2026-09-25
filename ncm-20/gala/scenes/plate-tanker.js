'use strict';
// A laden crude tanker at an offshore loading buoy off Fujairah, the Hajar behind her. Every size comes from one
// viewpoint: the eye 12 m up on a small vessel at 25.2262 N, 56.4271 E, looking south-west (bearings 227-242 deg
// across the plate, 60 px a degree).
//   The skyline: the true skyline computed from terrain tiles (data/build/rak_skyline.py 25.2262 56.4271 226.5 242.5
//   --sea --true): every bearing in the frame has UAE ground (Fujairah) as its ridge, 1.3-1.9 deg high, 24-32 km away.
//   The buoy: a turret-type loading buoy (CALM) 1.8 km off at bearing 240.1 deg (the terminal's published position);
//   1.91 px a metre at that range. The ship lies to it by a 70 m hawser from her bow, downwind of it (here a light
//   north-westerly: her bow points into it), and loads through two floating hose strings to her midship manifold.
//   The ship: a very large crude carrier, 336 m long; laden with some two million barrels she shows about 9 m of hull.
//   Her waterline lies 0.38 deg (23 px) below eye level. A slight sea: fine wavelets, no whitecaps.
// No name, no flag, no company livery or logo, no shore tank farm (see TREATMENT.md, Revision 3).
// The inset: the east-coast marine bulletin, its lines drafting themselves (the AI assistant prepares the draft), then
// signed (a forecaster approves it). No numbers are shown.
const TK = { eye: 600, px: 1.91, buoyX: 1771 };
scene({
  id: 'tanker',
  init() {
    const r = rng(71), m = TK.px, yw = TK.eye + 22.9;
    this.yw = yw;
    this.ridge = [[991.0,492.7,29190],[1003.0,493.4,29595],[1015.0,490.6,29460],[1027.0,490.1,29415],[1039.0,493.6,29370],[1051.0,494.9,29370],[1063.0,493.6,29370],[1075.0,491.7,29370],[1087.0,492.1,29370],[1099.0,492.0,29370],[1111.0,492.4,29460],[1123.0,494.9,29505],[1135.0,497.3,29505],[1147.0,503.9,29460],[1159.0,506.1,29370],[1171.0,504.8,29370],[1183.0,504.4,29370],[1195.0,505.3,29370],[1207.0,505.7,29415],[1219.0,507.2,29415],[1231.0,510.5,29640],[1243.0,510.1,29730],[1255.0,512.5,31935],[1267.0,513.1,31800],[1279.0,512.8,31755],[1291.0,516.2,31845],[1303.0,514.5,31890],[1315.0,515.5,31710],[1327.0,517.9,31665],[1339.0,519.7,31935],[1351.0,518.3,29055],[1363.0,518.8,29055],[1375.0,516.7,29010],[1387.0,514.0,29010],[1399.0,513.5,29055],[1411.0,512.5,29145],[1423.0,511.0,30315],[1435.0,507.3,30180],[1447.0,503.5,30180],[1459.0,500.0,30180],[1471.0,496.6,30180],[1483.0,495.7,30225],[1495.0,494.4,30225],[1507.0,494.9,30270],[1519.0,495.5,30180],[1531.0,494.1,30180],[1543.0,494.6,30090],[1555.0,497.8,30090],[1567.0,499.0,30090],[1579.0,498.3,30090],[1591.0,497.4,30090],[1603.0,500.7,29910],[1615.0,501.4,29910],[1627.0,501.2,24285],[1639.0,499.6,23475],[1651.0,497.4,23475],[1663.0,499.2,29730],[1675.0,498.8,29685],[1687.0,499.3,29730],[1699.0,502.5,29685],[1711.0,503.0,29685],[1723.0,504.1,29685],[1735.0,502.4,29640],[1747.0,502.6,29640],[1759.0,501.4,23250],[1771.0,498.8,23250],[1783.0,500.5,23250],[1795.0,501.8,29460],[1807.0,499.2,29505],[1819.0,497.5,29505],[1831.0,493.9,29550],[1843.0,493.3,29595],[1855.0,496.5,29595],[1867.0,497.6,29550],[1879.0,496.1,29460]].map(([x, y]) => [x, y]);
    this.ridgeP = pl(this.ridge, false, 900, 0.3);
    this.ridgeFill = new P(this.ridge.concat([[1885, TK.eye + 5], [985, TK.eye + 5]]), true);
    this.shore = pl([[985, TK.eye + 5], [1885, TK.eye + 5]], false, 901, 0.4); // the coast, 6-7 km off, just below eye level
    // the ship, in metres from her stern (x) and the waterline (y), bow to the right; placed 70 m short of the buoy
    const L = 336, fb = 9, sx = TK.buoyX - 70 * m - L * m, S = (x, y) => [sx + x * m, yw - y * m];
    this.sx = sx;
    this.hull = new P([S(0, -0.3), S(-1, fb + 0.6), S(4, fb + 1.0), S(298, fb), S(302, fb + 2.4), S(330, fb + 2.9), S(336, fb + 3.2), S(333, 4), S(328, -0.3)], true);
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
    this.funnelTop = S(7.5, fb + 25.6);
    this.lifeboat = new P([S(-1, fb + 4), S(2, fb + 7.5), S(11, fb + 5), S(8, fb + 1.5)], true);
    this.pipes = pl([S(40, fb + 1.6), S(298, fb + 1.6)], false, 920, 0.15);
    this.catwalk = pl([S(40, fb + 3.2), S(298, fb + 3.2)], false, 921, 0.15);
    this.walkLegs = []; for (let x = 52; x < 296; x += 18) this.walkLegs.push(pl([S(x, fb + 0.2), S(x, fb + 3.2)], false, 922 + x, 0));
    this.manifold = [pl([S(164, fb), S(164, fb + 4.5)], false, 940, 0), pl([S(172, fb), S(172, fb + 4.5)], false, 941, 0)];
    this.crane = [pl([S(178, fb), S(178, fb + 14)], false, 945, 0), pl([S(178, fb + 13), S(166, fb + 9)], false, 946, 0)];
    this.foremast = pl([S(314, fb + 2.9), S(314, fb + 17)], false, 950, 0);
    this.hatchCovers = []; for (let x = 60; x < 290; x += 23) this.hatchCovers.push(new P([S(x, fb), S(x, fb + 1.1), S(x + 3, fb + 1.1), S(x + 3, fb)], true));
    this.bow = S(336, fb + 3.2); this.manifoldPt = S(170, fb + 4); this.craneTip = S(166, fb + 9);
    // the buoy: a 12 m turret buoy, 5 m high, with its turntable and light
    const bx = TK.buoyX, bw = 6 * m, bh = 4 * m;
    this.buoy = new P([[bx - bw, yw], [bx - bw, yw - bh * 0.6], [bx + bw, yw - bh * 0.6], [bx + bw, yw]], true);
    this.turret = new P([[bx - bw * 0.45, yw - bh * 0.6], [bx - bw * 0.45, yw - bh * 1.3], [bx + bw * 0.45, yw - bh * 1.3], [bx + bw * 0.45, yw - bh * 0.6]], true);
    this.buoyMast = pl([[bx, yw - bh * 1.3], [bx, yw - bh * 2.3]], false, 955, 0);
    // the hawser, sagging, from the bow to the turntable
    this.hawser = new P(quad(this.bow, [(this.bow[0] + bx) / 2, yw - 2], [bx - bw * 0.45, yw - bh], 14));
    // two floating hose strings from the buoy along her side to the manifold, then up to her hose crane
    this.hoses = [0, 1].map(k => new P(wob(quad([bx - bw, yw - 1 - k], [TK.buoyX - 60 * m, yw + 8 + k * 5], [this.manifoldPt[0] + 8 * m, yw + 2 + k * 2], 20).concat([[this.manifoldPt[0] + 2 * m, yw - 4], [this.craneTip[0] + k * 3, this.craneTip[1] + 6]]), 960 + k, 0.4)));
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
    const K = 0.9; // the east coast from Dibba to Kalba, simplified from the film's map data (lon/lat to the inset)
    this.coast = new P([[56.27, 25.62], [56.35, 25.45], [56.36, 25.3], [56.37, 25.12], [56.36, 24.98], [56.38, 24.92]].map(([lo, la]) => [1060 + (lo - 56.0) * 260 * K, 188 + (25.7 - la) * 260]), false);
    this.chartBox = new P([[1030, 172], [1160, 172], [1160, 400], [1030, 400]], true);
    this.textLines = []; for (let k = 0; k < 11; k++) this.textLines.push({ y: 186 + k * 17, w: 70 + (k * 37) % 55 });
    this.sign = new P(wob([[1200, 390], [1212, 380], [1222, 392], [1232, 377], [1246, 391], [1262, 384], [1280, 386]], 970, 0.6));
  },
  draw(lt) {
    // the Hajar behind Fujairah, far and light
    const mq = easeInOut(prog(lt, 0.2, 1.4));
    mask(this.ridgeFill);
    hatch(this.ridgeFill, [985, 480, 1885, 610], -1.35, 6, mq, SEPIA, 0.8, 0.28, 905);
    stroke(this.ridgeP, mq, INK, 1.3, 0.6);
    stroke(this.shore, easeOut(prog(lt, 0.6, 1.0)), INK, 1, 0.5);
    const sw = easeOut(prog(lt, 0.3, 1.4));
    this.sea.forEach(w => stroke(w.p, clamp(sw * 1.6 - w.d * 0.6), BLUE, w.w, w.a));
    // the buoy, its hawser and the hoses
    const bq = easeOut(prog(lt, 0.7, 0.8));
    mask([this.buoy, this.turret]); fill(this.buoy, OCHRE, 0.7 * bq); stroke(this.buoy, bq, INK, 1.2); fill(this.turret, INK, 0.2 * bq); stroke(this.turret, bq, INK, 1.1); stroke(this.buoyMast, bq, INK, 1);
    // the ship
    const q = easeInOut(prog(lt, 0.5, 1.3)), dq = easeOut(prog(lt, 1.2, 1.0));
    mask([this.hull, this.accom, this.bridge, this.funnel]);
    hatch(this.hull, [this.sx - 10, this.yw - 30, TK.buoyX, this.yw + 4], 0.1, 4, q, INK, 1, 0.5, 930);
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
    stroke(this.hawser, bq, INK, 1.1, 0.8);
    this.hoses.forEach(h => stroke(h, easeInOut(prog(lt, 1.4, 1.6)), INK, 2.2, 0.75, [5, 1.5]));
    // her funnel exhaust, faint, trailing downwind (to the left)
    const [fx, fy] = this.funnelTop, eq = easeOut(prog(lt, 1.6, 1.2));
    for (let k = 0; k < 6; k++) { const u = ((lt * 0.35 + k / 6) % 1); stroke(new P(wob([[fx - u * 90, fy - 4 - u * 10], [fx - u * 90 - 26, fy - 7 - u * 12]], 980 + k, 0.8)), eq * (1 - u), SEPIA, 1, 0.25); }
    // the east-coast bulletin: the draft writes itself line by line, then it is signed
    const iq = easeOut(prog(lt, 0.8, 0.8));
    if (iq > 0) {
      mask(this.sheet); fill(this.sheet, SEPIA, 0.05 * iq); stroke(this.sheet, iq, INK, 1.4); stroke(this.sheetIn, iq, INK, 0.7, 0.6);
      stroke(this.chartBox, iq, INK, 0.8, 0.6); stroke(this.coast, iq, INK, 1.4, 0.85);
      for (let k = 0; k < 7; k++) stroke(new P([[1038, 230 + k * 22], [1060 + 30 * Math.sin(k * 1.3 + lt * 0.8), 234 + k * 22]]), iq, BLUE, 0.9, 0.5); // the sea off the coast, lined
      this.textLines.forEach((l, k) => { const wq = clamp((lt - 1.4 - k * 0.14) / 0.3); if (wq > 0) stroke(new P([[1172, l.y], [1172 + l.w * wq, l.y]]), 1, INK, 1.2, 0.6); });
      stroke(this.sign, easeInOut(prog(lt, 3.4, 0.7)), BLUE, 1.6, 0.9);
    }
  },
});
