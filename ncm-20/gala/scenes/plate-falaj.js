'use strict';
// IV · Al Aflaj — an Iron Age falaj at Hili, in section: after the excavated Hili 15 (Benoist et al. 2021; DCT Abu Dhabi).
// Its water came from a shallow water table to the north-east, near the foothills of the Hajar, drained by a gallery with
// stone-collared shafts, then carried in a slab-covered cut-and-cover channel and an open masonry channel to a distributor
// with sluice gates, the palms and the fields. No deep mother well: that textbook picture fits later aflaj, not these.
// Looking south-east: the Hajar on the east horizon (left), Jebel Hafeet on the south horizon (right).
scene({
  id: 'falaj', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 30, dur: 8, speed: 11 / 8, num: 'IV', name: 'AL AFLAJ', ar: 'الأفلاج', readout: 'UNESCO WORLD HERITAGE · 2011',
  kicker: 'HILI · AL AIN · IRON AGE',
  head: ['WE CARRIED', 'WATER THROUGH', 'THE DESERT.'], accent: { 'WATER': BLUE },
  arHead: 'وأجرينا الماء في الأفلاج عبر الصحراء',
  init() {
    const HZ = 560;
    this.HZ = HZ;
    this.far = ln(985, HZ, 1885, HZ, 240, 0.5);
    // the Hajar, far to the east: a jagged range
    const hj = [[985, HZ], [1004, 536], [1022, 542], [1046, 510], [1066, 522], [1090, 492], [1112, 508], [1136, 486], [1160, 502], [1186, 516], [1212, 504], [1242, 528], [1276, 522], [1310, 542], [1344, HZ]];
    this.hajar = new P(wob(hj, 241, 0.6));
    this.hajarFill = new P(hj, true);
    // Jebel Hafeet on the south horizon, as seen from Hili: steep east end, a broad knobbly crest a third of the way in,
    // a long even fall to the northern foothills (profile from the Copernicus 30 m elevation model, heights ×3)
    const hp = [[0, 0], [0.06, 0.58], [0.12, 0.81], [0.19, 0.86], [0.25, 0.94], [0.31, 0.96], [0.34, 1], [0.38, 0.95], [0.44, 0.98], [0.5, 0.92], [0.56, 0.85], [0.62, 0.75], [0.69, 0.62], [0.75, 0.44], [0.81, 0.32], [0.88, 0.24], [0.94, 0.21], [1, 0.02]];
    const hf = hp.map(([u, v]) => [1440 + 440 * u, HZ - 118 * v]);
    this.hafeet = new P(wob(hf, 242, 0.6));
    this.hafeetFill = new P(hf.concat([[1880, HZ], [1440, HZ]]), true);
    this.strata = [0.3, 0.55].map((f, k) => new P(wob(hf.slice(2, -2).map(([x, y]) => [x, y + f * (HZ - y) + 3]), 243 + k, 0.5)));
    // the ground in section, falling gently from the foothills to the oasis
    const S = [[985, 640], [1020, 612], [1060, 594], [1100, 590], [1140, 600], [1200, 622], [1280, 648], [1360, 670], [1440, 690], [1520, 706], [1600, 720], [1680, 730], [1760, 738], [1840, 744], [1885, 747]];
    this.S = S;
    this.ys = x => yOn(S, x);
    this.surface = pl(S, false, 150, 0.6);
    this.ground = new P(S.concat([[1885, 900], [985, 900]]), true);
    // the water table in the alluvium, and the saturated ground below it: it falls faster than the gallery, which lies below it
    // upstream (the stretch that gathers water) and above it downstream (the stretch that only carries it), so the fields stay dry
    const wt = [[985, 660], [1120, 668], [1380, 706], [1535, 730], [1650, 745], [1885, 772]];
    this.watertable = new P(wob(wt, 244, 0.4));
    this.wet = new P(wt.concat([[1885, 900], [985, 900]]), true);
    // the channel floor falls more gently than the ground, so the water surfaces at the oasis
    const yg = x => 680 + 0.1 * (x - 1120); // gentler than the ground, and the slabs stay buried to the open channel
    this.yg = yg;
    this.galFloor = ln(1120, yg(1120), 1535, yg(1535), 245, 0.2);
    this.galRoof = ln(1120, yg(1120) - 9, 1420, yg(1420) - 9, 246, 0.2);
    this.galCut = new P([[1120, yg(1120) - 9], [1535, yg(1535) - 9], [1535, yg(1535)], [1120, yg(1120)]], true);
    this.galEnd = ln(1120, yg(1120) - 9, 1120, yg(1120), 247, 0);
    this.gShafts = [1150, 1215, 1280, 1345, 1405].map((x, i) => ({ l: ln(x - 3, this.ys(x), x - 3, yg(x) - 9, 250 + i, 0.15), r: ln(x + 3, this.ys(x), x + 3, yg(x) - 9, 255 + i, 0.15),
      cut: new P([[x - 3, this.ys(x)], [x + 3, this.ys(x)], [x + 3, yg(x) - 9], [x - 3, yg(x) - 9]], true), collar: el(x, this.ys(x) - 1, 8, 2.6, 0, TAU, 260 + i, 0.1) }));
    // cut-and-cover: dry-stone walls under a row of stone slabs
    this.slabs = []; for (let x = 1422; x < 1532; x += 11) this.slabs.push(new P([[x, yg(x) - 12], [x + 9, yg(x + 9) - 12], [x + 9, yg(x + 9) - 9], [x, yg(x) - 9]], true));
    this.trench = new P(wob([[1422, yg(1422) - 13], [1420, this.ys(1420)]], 265, 0.3));
    // the open channel at the surface, with masonry sides
    const oc = []; for (let x = 1535; x <= 1650; x += 5) oc.push([x, Math.max(yg(1535), this.ys(x) + 5)]);
    this.open = new P(oc);
    this.openCut = new P(oc.concat(oc.slice().reverse().map(([x, y]) => [x, this.ys(x) - 1])), true);
    this.openSides = []; for (let x = 1540; x < 1650; x += 9) this.openSides.push(ln(x, this.ys(x) - 1, x, Math.max(yg(1535), this.ys(x) + 5), 270 + x, 0));
    // the distributor: a paved junction with a slab sluice gate, and field channels beyond
    const dy = this.ys(1656);
    this.dist = new P([[1650, dy - 2], [1672, dy - 2], [1672, dy + 7], [1650, dy + 7]], true);
    this.gate = new P([[1668, dy - 12], [1673, dy - 12], [1673, dy + 6], [1668, dy + 6]], true);
    this.field = new P(wob([[1674, this.ys(1674) + 3], [1780, this.ys(1780) + 3], [1880, this.ys(1880) + 3]], 275, 0.3));
    this.sideCh = [1700, 1742, 1790, 1836].map((x, i) => ln(x, this.ys(x) + 3, x - 10, this.ys(x) + 9, 276 + i, 0));
    this.cereal = []; for (let x = 1682; x < 1880; x += 7) if (x < 1720 || x > 1810) this.cereal.push(ln(x, this.ys(x) - 1, x + 1.5, this.ys(x) - 9 - (x % 3), 280 + x, 0));
    this.palms = [[1728, 1], [1766, 0.9], [1798, 0.96]].map(([x, s], i) => {
      const y = this.ys(x), top = [x + 10 * s, y - 150 * s];
      const trunk = new P(wob(quad([x, y], [x - 8, y - 80 * s], top, 16), 200 + i, 0.4));
      const fronds = [];
      for (let f = 0; f < 7; f++) {
        const a = -Math.PI / 2 + (f - 3) * 0.5, L = (62 + (f % 2) * 12) * s;
        const end = [top[0] + L * Math.cos(a) * 1.15, top[1] + L * Math.sin(a) + 38 * s];
        const c = [top[0] + L * 0.6 * Math.cos(a), top[1] + L * 0.6 * Math.sin(a) - 16 * s];
        fronds.push(new P(wob(quad(top, c, end, 12), 210 + i * 10 + f, 0.3)));
      }
      return { trunk, fronds, top, s };
    });
  },
  draw(lt) {
    const HZ = this.HZ, yg = this.yg;
    // the far horizon: the Hajar to the east, Jebel Hafeet to the south
    const fq = easeInOut(prog(lt, 0.3, 1.8));
    stroke(this.far, fq, INK, 1, 0.45);
    hatch(this.hajarFill, [985, 480, 1344, HZ], -1.1, 8, fq, SEPIA, 0.8, 0.22, 248); stroke(this.hajar, fq, INK, 1.1, 0.55);
    hatch(this.hafeetFill, [1440, 436, 1880, HZ], -1.25, 8, fq, SEPIA, 0.8, 0.24, 249); stroke(this.hafeet, fq, INK, 1.3, 0.7);
    this.strata.forEach(q => stroke(q, fq, INK, 0.7, 0.3));
    const jl = easeOut(prog(lt, 3.0, 0.8));
    small('HAJAR MOUNTAINS', 1164, 472, jl, { size: 11, ls: 3, align: 'center', a: 0.6 });
    small('JEBEL HAFEET', 1590, 426, jl, { size: 12, ls: 3, align: 'center', a: 0.75 });
    smallAr('جبل حفيت', 1590, 406, jl, { size: 20, align: 'center', a: 0.7 });
    // the ground in section, the water table and the wet alluvium below it
    const p0 = easeInOut(prog(lt, 0.3, 1.8));
    mask(this.ground);
    fill(this.wet, BLUE, 0.07 * easeOut(prog(lt, 1.6, 1.2)));
    hatch(this.ground, [985, 580, 1885, 900], 0.9, 16, prog(lt, 1.0, 2.2), INK, 0.9, 0.16, 197);
    stroke(this.surface, p0, INK, 2);
    stroke(this.watertable, easeInOut(prog(lt, 1.6, 1.4)), BLUE, 1.4, 0.6, [10, 7], 0);
    back('WATER TABLE', 992, 686, 'left', prog(lt, 2.6, 0.6), 11, 3); small('WATER TABLE', 992, 686, prog(lt, 2.6, 0.6), { size: 11, ls: 3, a: 0.55, col: BLUE });
    // the gallery and its shafts
    const gq = easeInOut(prog(lt, 2.0, 1.6));
    mask(this.galCut); stroke(this.galFloor, gq, INK, 1.4, 0.85); stroke(this.galRoof, gq, INK, 1.4, 0.85); stroke(this.galEnd, gq, INK, 1.2, 0.8);
    this.gShafts.forEach((sh, k) => {
      const q = easeOut(prog(lt, 2.4 + k * 0.14, 0.6));
      if (q <= 0) return;
      mask(sh.cut); stroke(sh.l, q, INK, 1.2, 0.85); stroke(sh.r, q, INK, 1.2, 0.85); stroke(sh.collar, q, INK, 1.4, 0.85);
    });
    // cut-and-cover, then the open channel
    const cq = easeOut(prog(lt, 3.2, 0.8));
    this.slabs.forEach(sl => { fill(sl, SEPIA, 0.55 * cq); stroke(sl, cq, INK, 0.9, 0.8); });
    const oq = easeOut(prog(lt, 3.8, 0.8));
    mask(this.openCut); stroke(this.open, oq, INK, 1.2, 0.8); this.openSides.forEach(q => stroke(q, oq, INK, 1, 0.7));
    // water: drained from the wet ground into the gallery, carried down to the oasis
    const wq = easeInOut(prog(lt, 3.4, 2.4));
    stroke(new P([[1122, yg(1122) - 4], [1535, yg(1535) - 4]]), wq, BLUE, 4, 0.75, [14, 8], -lt * 34);
    stroke(new P(this.open.pts.map(([x, y]) => [x, y - 3])), easeInOut(prog(lt, 4.6, 1.0)), BLUE, 3, 0.75, [12, 7], -lt * 30);
    // the distributor, its sluice gate, the field channels, cereals and palms
    const dq = easeOut(prog(lt, 5.0, 0.6));
    fill(this.dist, SEPIA, 0.4 * dq); stroke(this.dist, dq, INK, 1.1); fill(this.gate, SEPIA, 0.8 * dq); stroke(this.gate, dq, INK, 1.1);
    stroke(this.field, easeOut(prog(lt, 5.4, 1.0)), BLUE, 2.2, 0.7, [9, 6], -lt * 24);
    this.sideCh.forEach(q => stroke(q, easeOut(prog(lt, 5.8, 0.6)), BLUE, 1.6, 0.7));
    this.cereal.forEach((q, i) => stroke(q, easeOut(prog(lt, 6.0 + (i % 6) * 0.05, 0.5)), OCHRE, 1.2, 0.8));
    const lq = easeOut(prog(lt, 4.4, 0.8));
    [['GALLERY', 1236, 728], ['CUT-AND-COVER', 1420, 752], ['OPEN CHANNEL', 1560, 776]].forEach(([t, x, y]) => { back(t, x, y, 'left', lq, 11, 3); small(t, x, y, lq, { size: 11, ls: 3, a: 0.65 }); });
    this.palms.forEach((p, i) => {
      const q = easeOut(prog(lt, 5.8 + i * 0.3, 1.0));
      stroke(p.trunk, q, INK, 3 * p.s, 0.9);
      p.fronds.forEach((f, k) => stroke(f, easeOut(prog(lt, 6.4 + i * 0.3 + k * 0.05, 0.7)), INK, 1.6, 0.85));
      const dq2 = easeOut(prog(lt, 7.4 + i * 0.2, 0.6));
      for (let d = 0; d < 6; d++) disc(p.top[0] - 6 + (d % 3) * 6, p.top[1] + 14 + Math.floor(d / 3) * 6, 3.4 * dq2, OCHRE, 0.95);
    });
  },
});
