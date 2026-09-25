'use strict';
// VI · Al Matarat — Zayed International from runway 31L: fog lifts off Terminal A, the crescent tower stands by, an arrival lands
scene({
  id: 'airport', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 46, dur: 8, num: 'VI', name: 'AL MATARAT', ar: 'المطارات', readout: 'AVIATION + TOURISM · 18.2% OF UAE GDP · 2023',
  kicker: '24-HOUR WEATHER WATCH · 10 UAE AIRPORTS',
  head: ['WE READ', 'THE SKY FOR', 'EVERY FLIGHT.'], accent: { 'FLIGHT.': BLUE },
  arHead: 'ونقرأ السماء لكل رحلة',
  init() {
    const VX = 1440, HY = 500, NEAR = 1044, K = 0.35;
    const Y = z => HY + (NEAR - HY) / (1 + K * z), HW = z => 262 / (1 + K * z);
    Object.assign(this, { VX, HY, Y, HW, K });
    this.horizon = ln(985, HY, 1885, HY, 500, 0.6);
    this.edges = [ln(VX - HW(0), Y(0), VX - HW(60), Y(60), 501, 0.4), ln(VX + HW(0), Y(0), VX + HW(60), Y(60), 502, 0.4)];
    this.dashes = [];
    for (let z = 1.3; z < 26; z += 1.15) this.dashes.push({ z, p: new P([[VX, Y(z)], [VX, Y(z + 0.55)]]) });
    this.keys = [];
    for (const side of [-1, 1]) for (let k = 0; k < 6; k++) {
      const u0 = 0.18 + k * 0.125, u1 = u0 + 0.075, q = (u, z) => [VX + side * u * HW(z), Y(z)];
      this.keys.push(new P([q(u0, 0.12), q(u1, 0.12), q(u1, 0.7), q(u0, 0.7)], true));
    }
    this.lights = [];
    for (let z = 0; z < 24; z++) for (const side of [-1, 1]) this.lights.push({ z, x: VX + side * HW(z) * 1.05, y: Y(z), r: 6 / (1 + K * z) });
    // an arriving widebody seen from behind, drawn around its fuselage centre at 9.23 px to the metre: 65 m span, 6.5 m
    // fuselage, engines ~9.7 m out, gear down with the main wheels 6 m below the fuselage centre and the nacelles clear of the ground
    this.plane = {
      fus: el(0, 0, 30, 30, 0, TAU, 510, 0.2),
      fin: new P([[-7, -29], [-4, -112], [7, -112], [10, -29]], true),
      wings: [new P([[-29, 2], [-300, -24], [-300, -15], [-29, 12]], true), new P([[29, 2], [300, -24], [300, -15], [29, 12]], true)],
      stabs: [new P([[-26, -14], [-88, -26], [-88, -20], [-26, -7]], true), new P([[26, -14], [88, -26], [88, -20], [26, -7]], true)],
      engs: [el(-92, 26, 22, 22, 0, TAU, 511, 0.2), el(92, 26, 22, 22, 0, TAU, 512, 0.2)],
      gear: [ln(-50, 10, -50, 44, 514, 0), ln(50, 10, 50, 44, 515, 0), ln(0, 29, 0, 45, 516, 0)],
      tyres: [-57, -50, 43, 50, -7, 0].map((x, i) => new P([[x, i > 3 ? 46 : 43], [x + 7, i > 3 ? 46 : 43], [x + 7, 55], [x, 55]], true)),
    };
    // In this view the control tower stands ~1 km right of 31L and 2.3 km on, Terminal A's high point 1.9 km beyond it;
    // at their true size here they are small on the horizon. Positions and sizes follow the runway's own perspective:
    // the 60 m runway's drawn width puts the eye ~62 m up, so the 109 m tower crosses the horizon and the 52 m terminal stays just under it.
    this.farTower = new P(quad([1812, 516], [1815, 500], [1800, 482], 8).concat(quad([1800, 482], [1805, 502], [1801, 516], 8).slice(1)), true);
    this.farBase = new P([[1795, 522], [1795, 516], [1818, 516], [1818, 522]], true);
    this.farCab = new P([[1792, 494], [1802, 494], [1802, 489], [1791, 489]], true);
    const fb = (x0, n, w) => { let pts = []; for (let i = 0; i < n; i++) pts = pts.concat(quad([x0 + i * w, 508], [x0 + i * w + w / 2, 505.5], [x0 + (i + 1) * w, 508], 4).slice(i ? 1 : 0)); return pts; };
    this.farTerm = new P([[1560, 512], [1560, 508]].concat(fb(1560, 5, 10), cubic([1610, 508], [1622, 501], [1654, 499.5], [1676, 508], 16).slice(1), fb(1676, 5, 10).slice(1), [[1726, 512]]), true);
    this.farRoof = new P(cubic([1610, 508], [1622, 501], [1654, 499.5], [1676, 508], 16));
    // figure inset: the crescent tower on its five-storey base, 109 m, drawn to one scale (3.3 px to the metre, shown at 0.92)
    this.box = [new P([[1722, 584], [1880, 584], [1880, 1040], [1722, 1040]], true), new P([[1728, 590], [1874, 590], [1874, 1034], [1728, 1034]], true)];
    this.towerBase = new P([[1762, 1000], [1762, 934], [1840, 934], [1840, 1000]], true);
    this.baseFloors = [947, 960, 973, 986].map((y, i) => ln(1766, y, 1836, y, 525 + i, 0.2));
    const outer = quad([1836, 934], [1842, 732], [1790, 640], 28), inner = quad([1800, 934], [1818, 750], [1790, 640], 28);
    this.crescent = new P(wob(outer.concat(inner.slice(0, -1).reverse()), 522, 0.25), true);
    this.cab = new P([[1774, 712], [1806, 712], [1806, 690], [1768, 690]], true);
    this.cabMull = [1776, 1784, 1792, 1800].map((x, i) => ln(x + 1, 711, x - 1, 691, 530 + i, 0));
    this.cabRoof = ln(1764, 687, 1810, 687, 523, 0.1);
    this.cabFloor = ln(1772, 715, 1808, 715, 524, 0.1);
    this.cabStrut = ln(1776, 716, 1806, 748, 529, 0.1);
    this.scaleBar = [ln(1860, 1000, 1860, 640, 540, 0), ln(1855, 1000, 1865, 1000, 541, 0), ln(1855, 640, 1865, 640, 542, 0)];
    // windsock, to scale: a ~9 m pole about 60 m left of the centre line
    this.pole = ln(1104, 849, 1104, 799, 530, 0.1);
  },
  draw(lt) {
    const lq = easeOut(prog(lt, 4.6, 0.8));
    const { VX, HY, Y, HW, K } = this;
    stroke(this.horizon, easeInOut(prog(lt, 0.2, 1.0)), INK, 1.4, 0.7);
    this.edges.forEach((e, i) => stroke(e, easeOut(prog(lt, 0.3 + i * 0.1, 1.1)), INK, 2.2));
    this.dashes.forEach((d, i) => stroke(d.p, prog(lt, 0.6 + i * 0.045, 0.25), INK, 3.4 / (1 + K * d.z) + 0.5, 0.85));
    this.keys.forEach((k, i) => fill(k, INK, 0.78 * easeOut(prog(lt, 1.0 + (i % 6) * 0.05, 0.4))));
    // edge lights, with a strobe racing toward the far end
    const race = (lt * 1.8) % 1;
    this.lights.forEach(l => {
      const on = easeOut(prog(lt, 1.1 + l.z * 0.035, 0.3)), hot = Math.abs(race - l.z / 24) < 0.035;
      disc(l.x, l.y, l.r * on * (hot ? 1.5 : 1), hot ? RED : OCHRE, 0.95);
    });
    // Terminal A and the crescent tower, true size, on the horizon
    const tq = easeOut(prog(lt, 0.6, 1.4));
    mask([this.farTerm, this.farTower, this.farBase]); fill(this.farTerm, BLUE, 0.2 * tq); stroke(this.farTerm, tq, INK, 1, 0.85); stroke(this.farRoof, tq, INK, 1.3);
    fill(this.farTower, INK, 0.12 * tq); stroke(this.farTower, tq, INK, 1.1); stroke(this.farBase, tq, INK, 1); fill(this.farCab, BLUE, 0.5 * tq); stroke(this.farCab, tq, INK, 0.9);
    // fog banks over the far runway, burning off
    const fog = 1 - easeInOut(prog(lt, 2.4, 2.2));
    if (fog > 0.01) for (let k = 0; k < 5; k++) {
      const y = HY - 44 + k * 30, h = 26, dx = ((lt * 22 + k * 173) % 300) - 150;
      ctx.save();
      ctx.beginPath(); ctx.rect(985, y, 900, h); ctx.clip();
      PAPER_PAT.setTransform(ctx.getTransform().inverse());
      ctx.globalAlpha = SA * fog * (0.72 - k * 0.08); ctx.fillStyle = PAPER_PAT; ctx.fillRect(985, y, 900, h);
      ctx.globalAlpha = SA * fog * 0.3; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = SEPIA; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 985 + dx; x < 1885; x += 38) { ctx.moveTo(x, y + h / 2 + 4 * Math.sin(x * 0.02)); ctx.lineTo(x + 24, y + h / 2 + 4 * Math.sin((x + 24) * 0.02)); }
      ctx.stroke(); ctx.restore();
    }
    // figure inset: the crescent tower on its base, clad in quilted cushions, the glazed cab on its inner curve
    const bq = easeInOut(prog(lt, 0.8, 1.0)), tp = easeInOut(prog(lt, 1.2, 1.2));
    if (bq > 0) {
      ctx.save(); ctx.translate(1801, 584); ctx.scale(0.92, 0.92); ctx.translate(-1801, -584);
      mask(this.box[0]); stroke(this.box[0], bq, INK, 1.6); stroke(this.box[1], bq, INK, 0.8, 0.6);
      hatch(this.crescent, [1786, 636, 1846, 936], 0.9, 8, tp, INK, 0.8, 0.3, 526); hatch(this.crescent, [1786, 636, 1846, 936], -0.9, 8, tp, INK, 0.8, 0.3, 527);
      stroke(this.crescent, tp, INK, 1.7); mask(this.towerBase); stroke(this.towerBase, tp, INK, 1.6); this.baseFloors.forEach(f => stroke(f, tp, INK, 0.9, 0.6));
      const cp = easeOut(prog(lt, 1.8, 0.8));
      mask(this.cab); fill(this.cab, BLUE, 0.45 * cp); stroke(this.cab, cp, INK, 1.4); this.cabMull.forEach(m => stroke(m, cp, INK, 0.8, 0.7));
      stroke(this.cabRoof, cp, INK, 2); stroke(this.cabFloor, cp, INK, 1.6); stroke(this.cabStrut, cp, INK, 1.2, 0.8);
      this.scaleBar.forEach(l => stroke(l, prog(lt, 2.2, 0.6), INK, 0.9, 0.6));
      const fq = easeOut(prog(lt, 2.4, 0.6));
      ctx.save(); ctx.translate(1860, 820); ctx.rotate(-Math.PI / 2);
      ctx.restore();
      smallAr('برج المراقبة', 1801, 622, fq, { size: 22, align: 'center', a: 0.8, weight: 600 });
      ctx.restore();
    }
    // windsock streaming in the breeze
    stroke(this.pole, easeOut(prog(lt, 0.9, 0.8)), INK, 1.4);
    const wq = easeOut(prog(lt, 1.4, 0.8));
    if (wq > 0) for (let k = 0; k < 5; k++) {
      const x0 = 1105 + k * 4.4 * wq, x1 = x0 + 4.4 * wq, fl = Math.sin(lt * 7 + k * 0.9) * 0.6 * k / 4;
      const r0 = 3 - k * 0.4, r1 = 2.6 - k * 0.4;
      fill(new P([[x0, 802 - r0 + fl], [x1, 802 - r1 + fl * 1.3], [x1, 802 + r1 + fl * 1.3], [x0, 802 + r0 + fl]], true), k % 2 ? '#EFE3CC' : RED, k % 2 ? 0.9 : 0.85);
    }
    // the arrival, as the fog lifts: seen ~100 m past the threshold (crossed at 15 m, a 50 ft crossing), a flare onto the touchdown zone ~400 m on,
    // then the roll-out along the centre line. Placed by the runway's own perspective: eye ~62 m up, 8.73 px/m at the threshold,
    // each unit of z another 0.35 of the threshold distance (~33 m)
    if (lt > 3.1) {
      // time runs ~2× fast: 4.3 z/s on the approach (after a 0.5 s ease-in as it fades in), braking to 0.4 z/s by the cut
      const t = lt - 3.1, v = 4.3, td = 0.5 + (12 - 3 - v * 0.25) / v, D = 8 - 3.1 - td;
      const z = t < 0.5 ? 3 + v * t * t : t < td ? 3 + v * (t - 0.25) : 12 + v * (t - td) - (v - 0.4) * (t - td) ** 2 / (2 * D);
      const hw = z < 12 ? 15 * (1 - z / 12) ** 2 : 0, k = 1 + K * z;
      const sc = 0.946 / k, y = HY + 8.73 * (62.3 - hw - 6) / k, lw = 1.9 / Math.max(sc, 0.35);
      const pl_ = this.plane, parts = [pl_.fus, pl_.fin, ...pl_.wings, ...pl_.stabs, ...pl_.engs, ...pl_.tyres];
      ctx.save(); ctx.translate(VX, y); ctx.scale(sc, sc); ctx.rotate(0.03 * Math.sin(lt * 1.3) * Math.min(1, hw / 4)); // wings level once down
      const a = easeOut(prog(lt, 3.1, 0.4));
      mask(parts);
      hatch([pl_.fus, ...pl_.engs], [-120, -30, 120, 50], 0.9, 6, a, INK, 1, 0.45, 513);
      pl_.gear.forEach(g => stroke(g, a, INK, lw * 1.3));
      parts.forEach(q => stroke(q, a, INK, lw));
      pl_.tyres.forEach(q => fill(q, INK, 0.85 * a));
      pl_.engs.forEach((e, i) => disc(i ? 92 : -92, 26, 9, INK, 0.8 * a));
      ctx.restore();
    }
  },
});
