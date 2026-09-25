'use strict';
// A laden crude tanker leaving Fujairah, seen broadside from another ship's deck in the anchorage. Every size comes
// from one viewpoint: the eye 12 m above the sea at 25.13 N, 56.44 E, looking west (bearings 290-305 deg across the
// plate, 60 px a degree).
//   The Hajar behind Fujairah: the computed skyline over UAE ground only (data/build/rak_skyline.py 25.13 56.44 289 306
//   --sea); the highest point in view stands 2.6 deg up, a ridge 18 km away.
//   The ship: a very large crude carrier, 333 m long, 2 km off (1.72 px a metre). Laden, she floats deep: about 8.5 m
//   of hull above the water. Her waterline lies 0.34 deg (21 px) below eye level, her deck just at the horizon.
//   She makes about 13 knots southward, out to the Arabian Sea: right to left on the plate.
// No company livery or logo is drawn.
const EYE_Y = 684, M_PX = 1.72; // eye level on the plate; pixels per metre at the ship's distance
scene({
  id: 'tanker',
  init() {
    // the Hajar, computed; and the shore at its foot (about 9 km off, at the horizon)
    this.ridge = [[985,583.5],[997,588.7],[1009,591.2],[1021,597.1],[1033,599.5],[1045,595.4],[1057,590.4],[1069,583.3],[1081,576.1],[1093,572.8],[1105,569.3],[1117,568.5],[1129,567.4],[1141,566.8],[1153,568.2],[1165,565.3],[1177,561.2],[1189,555.8],[1201,551.3],[1213,544.9],[1225,538.8],[1237,536.0],[1249,533.9],[1261,529.7],[1273,527.1],[1285,526.2],[1297,530.7],[1309,529.1],[1321,525.7],[1333,525.4],[1345,528.2],[1357,531.3],[1369,531.5],[1381,535.4],[1393,532.0],[1405,532.1],[1417,534.2],[1429,539.0],[1441,540.5],[1453,544.0],[1465,545.3],[1477,542.8],[1489,544.6],[1501,546.2],[1513,548.5],[1525,551.0],[1537,556.8],[1549,561.2],[1561,564.2],[1573,569.2],[1585,571.2],[1597,570.4],[1609,572.0],[1621,571.2],[1633,566.0],[1645,561.9],[1657,562.1],[1669,566.7],[1681,572.9],[1693,579.7],[1705,586.6],[1717,592.3],[1729,596.6],[1741,601.1],[1753,598.9],[1765,596.6],[1777,592.7],[1789,586.6],[1801,580.5],[1813,574.3],[1825,572.9],[1837,573.1],[1849,570.5],[1861,566.8],[1873,563.9],[1885,564.5]];
    const r = rng(71);
    this.ridgeP = pl(this.ridge, false, 900, 0.3);
    this.ridgeFill = new P(this.ridge.concat([[1885, 690], [985, 690]]), true);
    this.shore = pl([[985, 689], [1885, 688]], false, 901, 0.4);
    // low buildings and port structures along the shore (about 9 km away: a 20 m building is 7 px)
    this.town = Array.from({ length: 34 }, (_, i) => { const x = 990 + i * 26 + r() * 14, w = 6 + r() * 14, h = 2 + r() * 6; return new P([[x, 689], [x, 689 - h], [x + w, 689 - h], [x + w, 689]], true); });
    // the ship, in her own frame: x along the hull in metres from the stern (0) to the stem (333), y metres up from the
    // waterline; drawn bow to the left
    const L = 333, fb = 8.5, m = (x, y) => [-x * M_PX, -y * M_PX]; // mirror: bow left
    this.hull = new P([m(0, -0.5), m(0, fb + 0.6), m(4, fb + 1.0), m(296, fb), m(300, fb + 2.4), m(328, fb + 2.9), m(333, fb + 3.2), m(331, 4), m(326, -0.5)], true);
    this.deckLine = pl([m(4, fb + 1.0), m(296, fb)], false, 902, 0.2);
    this.focsle = pl([m(300, fb + 2.4), m(328, fb + 2.9)], false, 903, 0.2);
    // aft: the accommodation (5 decks and the bridge), the funnel behind it, the free-fall lifeboat at the stern
    this.accom = new P([m(12, fb + 1), m(12, fb + 18), m(38, fb + 18), m(38, fb + 1)], true);
    this.decks = [3.6, 6.9, 10.2, 13.5].map((h, i) => pl([m(13, fb + 1 + h), m(37, fb + 1 + h)], false, 910 + i, 0.1));
    this.windows = [];
    for (let d = 0; d < 5; d++) for (let k = 0; k < 7; k++) this.windows.push(new P([m(15 + k * 3.1, fb + 2.6 + d * 3.3), m(16.6 + k * 3.1, fb + 2.6 + d * 3.3), m(16.6 + k * 3.1, fb + 3.9 + d * 3.3), m(15 + k * 3.1, fb + 3.9 + d * 3.3)], true));
    this.bridge = new P([m(10, fb + 18), m(10, fb + 21.5), m(40, fb + 21.5), m(40, fb + 18)], true);
    this.bridgeWin = new P([m(11, fb + 19.2), m(11, fb + 20.8), m(39, fb + 20.8), m(39, fb + 19.2)], true);
    this.radarMast = [pl([m(24, fb + 21.5), m(24, fb + 30)], false, 915, 0), pl([m(20, fb + 28), m(28, fb + 28)], false, 916, 0)];
    this.funnel = new P([m(3, fb + 1), m(4, fb + 25), m(11, fb + 26), m(12, fb + 1)], true);
    this.funnelBand = new P([m(3.6, fb + 20), m(3.8, fb + 23), m(11, fb + 23.5), m(11, fb + 20.5)], true);
    this.lifeboat = new P([m(-1, fb + 4), m(2, fb + 7.5), m(11, fb + 5), m(8, fb + 1.5)], true);
    // the cargo deck: the pipelines and the catwalk run the length of the tanks; the manifold and its two hose cranes
    // midships; the foremast forward
    this.pipes = pl([m(40, fb + 1.6), m(298, fb + 1.6)], false, 920, 0.15);
    this.catwalk = pl([m(40, fb + 3.2), m(298, fb + 3.2)], false, 921, 0.15);
    this.walkLegs = []; for (let x = 52; x < 296; x += 18) this.walkLegs.push(pl([m(x, fb + 0.2), m(x, fb + 3.2)], false, 922 + x, 0));
    this.manifold = [pl([m(160, fb), m(160, fb + 4.5)], false, 940, 0), pl([m(172, fb), m(172, fb + 4.5)], false, 941, 0)];
    this.cranes = [[150, 1], [182, -1]].map(([x, s], i) => [pl([m(x, fb), m(x, fb + 13)], false, 945 + i, 0), pl([m(x, fb + 12), m(x + 16 * s, fb + 8)], false, 947 + i, 0)]);
    this.foremast = pl([m(312, fb + 2.9), m(312, fb + 17)], false, 950, 0);
    this.hatchCovers = []; for (let x = 60; x < 290; x += 23) this.hatchCovers.push(new P([m(x, fb), m(x, fb + 1.1), m(x + 3, fb + 1.1), m(x + 3, fb)], true));
    // the sea, engraved as broken strokes: rows close up toward the horizon (their spacing grows as the distance
    // shrinks), strokes lengthen and thicken toward the viewer
    this.sea = [];
    for (let row = 0; row < 46; row++) {
      const d = row / 45, y = 693 + 300 * Math.pow(d, 2.2);
      if (y > 1000) break;
      let x = 985 + r() * 40;
      while (x < 1880) {
        const len = 12 + 110 * d * (0.4 + r()), gap = 6 + 50 * (1 - d) * r() + 14 * d;
        const x1 = Math.min(1885, x + len);
        this.sea.push({ p: pl([[x, y + (r() - 0.5) * 1.2], [x1, y + (r() - 0.5) * 1.2]], false, 1000 + this.sea.length, 0.15), w: 0.6 + 0.9 * d, a: 0.3 + 0.35 * d, d });
        x = x1 + gap;
      }
    }
  },
  shipX(lt) { return 1630 - lt * 6.7 * M_PX; }, // 13 knots = 6.7 m/s
  draw(lt) {
    // the Hajar behind Fujairah, far and light
    const mq = easeInOut(prog(lt, 0.2, 1.4));
    mask(this.ridgeFill);
    hatch(this.ridgeFill, [985, 520, 1885, 692], -1.35, 7, mq, SEPIA, 0.8, 0.28, 905);
    stroke(this.ridgeP, mq, INK, 1.3, 0.6);
    const sq = easeOut(prog(lt, 0.6, 1.0));
    this.town.forEach(b => { fill(b, INK, 0.35 * sq); });
    stroke(this.shore, sq, INK, 1, 0.5);
    // the sea
    const sw = easeOut(prog(lt, 0.3, 1.4));
    this.sea.forEach(w => stroke(w.p, clamp(sw * 1.6 - w.d * 0.6), BLUE, w.w, w.a));
    // the ship, underway
    const x0 = this.shipX(lt), yw = EYE_Y + Math.atan(12 / 2000) * 180 / Math.PI * 60, q = easeInOut(prog(lt, 0.5, 1.3)), dq = easeOut(prog(lt, 1.2, 1.0));
    ctx.save(); ctx.translate(x0, yw);
    mask([this.hull, this.accom, this.bridge, this.funnel]);
    hatch(this.hull, [-333 * M_PX - 10, -30, 20, 4], 0.1, 4, q, INK, 1, 0.5, 930);
    fill(this.hull, INK, 0.25 * q); stroke(this.hull, q, INK, 1.8);
    stroke(this.deckLine, q, INK, 1, 0.7); stroke(this.focsle, q, INK, 1, 0.7);
    stroke(this.pipes, dq, INK, 0.9, 0.7); stroke(this.catwalk, dq, INK, 0.9, 0.7); this.walkLegs.forEach(l => stroke(l, dq, INK, 0.6, 0.5));
    this.hatchCovers.forEach(h => stroke(h, dq, INK, 0.7, 0.6));
    this.manifold.forEach(l => stroke(l, dq, INK, 1, 0.8)); this.cranes.forEach(c => c.forEach(l => stroke(l, dq, INK, 1.1, 0.85)));
    stroke(this.foremast, dq, INK, 1.1, 0.85);
    stroke(this.accom, q, INK, 1.5); this.decks.forEach(l => stroke(l, q, INK, 0.7, 0.5));
    this.windows.forEach(w => fill(w, BLUE, 0.35 * dq));
    stroke(this.bridge, q, INK, 1.5); fill(this.bridgeWin, BLUE, 0.5 * dq);
    this.radarMast.forEach(l => stroke(l, dq, INK, 1.1));
    fill(this.funnel, INK, 0.12 * q); stroke(this.funnel, q, INK, 1.4); fill(this.funnelBand, OCHRE, 0.55 * dq);
    fill(this.lifeboat, RED, 0.7 * dq); stroke(this.lifeboat, dq, INK, 1);
    // her bow wave and the wake along the hull
    const bx = -333 * M_PX, wq = easeOut(prog(lt, 1.0, 1.0));
    stroke(new P(wob([[bx - 4, 1], [bx + 30, 3], [bx + 90, 2], [bx + 200, 3]], 970, 0.6)), wq, INK, 1.1, 0.55);
    stroke(new P(wob([[bx + 2, -1], [bx - 18, 3], [bx - 40, 4]], 971, 0.5)), wq, INK, 1.2, 0.6);
    stroke(new P(wob([[0, 2], [40, 4], [110, 5], [220, 6]], 972, 0.8)), wq, INK, 1, 0.45);
    ctx.restore();
  },
});
