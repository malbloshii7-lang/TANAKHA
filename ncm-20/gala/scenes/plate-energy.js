'use strict';
// VIII · Al Taqa — Shams 1: parabolic troughs turn to follow the sun; a pyranometer and an anemometer measure sun and wind
scene({
  id: 'energy', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 62, dur: 8, num: 'VIII', name: 'AL TAQA', ar: 'الطاقة', readout: 'UAE RENEWABLES · 6 GW · 2024',
  kicker: 'FORECASTS FOR SOLAR PLANTS AND WIND FARMS',
  head: ['WE FORECAST', 'THE SUN', 'AND THE WIND.'], accent: { 'SUN': RED },
  arHead: 'ونتنبأ بسطوع الشمس وهبوب الرياح',
  init() {
    const HY = 560;
    this.HY = HY;
    this.horizon = ln(985, HY, 1885, HY, 600, 0.6);
    this.arc = el(1430, HY, 420, 372, Math.PI, TAU, 601, 0.5);
    this.ticks = [];
    for (let k = 1; k < 12; k++) { const a = Math.PI + (k * Math.PI) / 12; this.ticks.push(ln(1430 + 408 * Math.cos(a), HY + 360 * Math.sin(a), 1430 + 432 * Math.cos(a), HY + 384 * Math.sin(a), 602 + k, 0.1)); }
    // Shams 1 is a parabolic-trough plant: rows run north–south and turn east to west with the sun.
    // We look south along four rows (one-point perspective to (VX, HY)); every point scales toward the vanishing point.
    Object.assign(this, { VX: 1430, K: 0.3, YG: 1000, W0: 92, H0: 56, Z0: 0.15, Z1: 26 });
    this.offs = [-370, -115, 140, 395]; // about three trough-widths apart, centre to centre
    // the trough cross-section in its own frame (axis up, torque tube at the origin): parabola, focus, rims
    const W = this.W0, f = 0.3 * W, v = -0.1 * W;
    this.sec = []; for (let i = 0; i <= 16; i++) { const u = -W / 2 + (W * i) / 16; this.sec.push([u, v - (u * u) / (4 * f)]); }
    this.focus = [0, v - f];
    this.rays = [-0.36, -0.2, 0.2, 0.36].map(k => { const u = k * W; return [u, v - (u * u) / (4 * f)]; });
    this.arms = [-0.46, -0.24, 0.24, 0.46].map(k => { const u = k * W; return [u, v - (u * u) / (4 * f)]; }); // cantilever arms from the torque tube
    // the power block on the horizon: turbine hall, stack, air-cooled condenser on legs with its fans
    this.hall = new P([[1586, HY], [1586, 538], [1610, 531], [1634, 538], [1634, HY]], true);
    this.stack = new P([[1596, 531], [1596, 522], [1601, 522], [1601, 532]], false); // a short flue from the gas heaters
    this.duct = new P([[1622, 534], [1622, 522], [1650, 522]], false); // steam duct to the condenser
    this.acc = new P([[1650, 512], [1728, 512], [1728, 532], [1650, 532]], true); // the air-cooled condenser, a raised box
    this.accRibs = [1660, 1672, 1684, 1696, 1708, 1720].map((x, i) => ln(x, 513, x, 531, 660 + i, 0));
    this.accLegs = [1654, 1672, 1690, 1708, 1724].map((x, i) => ln(x, 532, x, HY, 640 + i, 0));
    this.fans = [1663, 1681, 1699, 1717].map((x, i) => el(x, 536, 7, 2, 0, TAU, 650 + i, 0)); // fans underneath
    // the wind: an anemometer mast in the field, cups and vane at the top (no wind farm stands at Shams 1)
    this.anemMast = ln(1196, 1000, 1196, 846, 635, 0.1);
    this.anemArm = ln(1182, 848, 1212, 848, 636, 0);
    this.anemStays = [ln(1196, 900, 1170, 1000, 637, 0.1), ln(1196, 900, 1222, 1000, 638, 0.1)];
    // pyranometer: the instrument that measures sunlight
    this.tripod = [ln(990, 1000, 1004, 944, 630, 0.2), ln(1018, 1000, 1004, 944, 631, 0.2), ln(1004, 1004, 1004, 944, 632, 0.2)];
    this.plate = ln(988, 944, 1020, 944, 633, 0.1);
    this.dome = el(1004, 942, 13, 13, Math.PI, TAU, 634, 0.1);
  },
  draw(lt) {
    const HY = this.HY;
    stroke(this.horizon, easeInOut(prog(lt, 0.2, 1.0)), INK, 1.4, 0.7);
    stroke(this.arc, easeInOut(prog(lt, 0.4, 1.6)), INK, 1.2, 0.55, [4, 9], 0);
    this.ticks.forEach((t, i) => stroke(t, prog(lt, 1.0 + i * 0.06, 0.3), INK, 1.1, 0.6));
    // the sun travels its arc
    const sa = Math.PI + Math.PI * (0.25 + 0.55 * easeInOut(prog(lt, 0.6, 7.2))), sx = 1430 + 420 * Math.cos(sa), sy = HY + 372 * Math.sin(sa), sq = easeOut(prog(lt, 0.8, 0.6));
    if (sq > 0) {
      mask(el(sx, sy, 64 * sq, 64 * sq, 0, TAU, 641, 0)); // the sun hides the path behind it
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + lt * 0.4, r1 = i % 2 ? 50 : 62; stroke(new P([[sx + 40 * Math.cos(a), sy + 40 * Math.sin(a)], [sx + r1 * Math.cos(a), sy + r1 * Math.sin(a)]]), sq, INK, 1.2, 0.6); }
      disc(sx, sy, 32 * sq, OCHRE, 0.95); stroke(el(sx, sy, 32 * sq, 32 * sq, 0, TAU, 640, 0), 1, INK, 1.4, 0.8); disc(sx, sy, 5 * sq, RED, 0.9);
    }
    // the power block of Shams 1 on the horizon
    const pb = easeOut(prog(lt, 1.4, 0.8));
    mask([this.hall, this.acc]); stroke(this.hall, pb, INK, 1.2); stroke(this.stack, pb, INK, 1.2); stroke(this.duct, pb, INK, 2, 0.8);
    fill(this.acc, INK, 0.1 * pb); stroke(this.acc, pb, INK, 1.2); this.accRibs.forEach(l => stroke(l, pb, INK, 0.7, 0.6));
    this.accLegs.forEach(l => stroke(l, pb, INK, 0.9, 0.8)); this.fans.forEach(fn => stroke(fn, pb, INK, 0.9, 0.8));
    // the troughs turn with the sun: tilt 0 faces straight up; east (left) is negative
    const tilt = sa - 1.5 * Math.PI, c = Math.cos(tilt), sn = Math.sin(tilt);
    const { VX, K, YG, H0, Z0, Z1 } = this;
    const at = (z, off, [x, y]) => { const s = 1 / (1 + K * z); return [VX + (off + x * c - y * sn) * s, HY + (YG - HY - H0 + x * sn + y * c) * s]; };
    const gnd = (z, off) => { const s = 1 / (1 + K * z); return [[VX + off * s, HY + (YG - HY - H0) * s], [VX + off * s, HY + (YG - HY) * s]]; };
    [0, 3, 1, 2].forEach(r => {
      const off = this.offs[r], q = easeInOut(prog(lt, 1.0 + r * 0.25, 1.4));
      if (q <= 0) return;
      stroke(new P([gnd(Z0, off)[1], gnd(Z1, off)[1]]), q, INK, 1, 0.35); // the ground under the row
      const zf = lerp(Z1, Z0, 1), zNear = Z0, zFar = lerp(Z0 + 2, Z1, q);
      const near = this.sec.map(p => at(zNear, off, p)), far = this.sec.map(p => at(zFar, off, p));
      const surf = new P(near.concat(far.slice().reverse()), true);
      mask(surf); fill(surf, BLUE, 0.22);
      // mirror facets run along the row
      [0, 4, 8, 12, 16].forEach(i => stroke(new P([near[i], far[i]]), 1, INK, i % 8 ? 0.7 : 1.2, i % 8 ? 0.45 : 0.85));
      // frames and pylons every few metres, far to near
      for (let z = Math.floor(zFar); z > zNear + 0.5; z -= 2) {
        const [top, foot] = gnd(z, off);
        stroke(new P([top, foot]), 1, INK, 1.1 / (1 + K * z) + 0.4, 0.7);
        stroke(new P(this.sec.map(p => at(z, off, p))), 1, INK, 1.4 / (1 + K * z) + 0.3, 0.6);
        stroke(new P([top, at(z, off, this.arms[0]), at(z, off, this.arms[3]), top]), 1, INK, 0.8 / (1 + K * z) + 0.3, 0.5);
      }
      // the receiver tube along the focal line, hot while the sun is up
      const fN = at(zNear, off, this.focus), fF = at(zFar, off, this.focus);
      stroke(new P([fN, fF]), 1, RED, 3.2, 0.25 * sq); stroke(new P([fN, fF]), 1, INK, 1.6, 0.9);
      // the near end: the U of the mirror, its torque tube, pylon, receiver support, and sunlight folding onto the tube
      const [top, foot] = gnd(zNear, off);
      stroke(new P([top, foot]), 1, INK, 2.2); stroke(new P([[foot[0] - 12, foot[1]], [foot[0] + 12, foot[1]]]), 1, INK, 1.6, 0.8);
      this.arms.forEach(p => stroke(new P([top, at(zNear, off, p)]), 1, INK, 1.1, 0.75));
      disc(top[0], top[1], 4.5, INK, 0.9);
      stroke(new P(near), 1, INK, 2.2);
      stroke(new P([at(zNear, off, [0, -0.1 * this.W0]), fN]), 1, INK, 1, 0.7);
      disc(fN[0], fN[1], 4.2, INK, 0.9); disc(fN[0], fN[1], 2.2, RED, 0.9 * sq, 'source-over');
      if (sq > 0) this.rays.forEach(p => {
        const hit = at(zNear, off, p), from = at(zNear, off, [p[0], p[1] - 0.4 * this.W0]);
        stroke(new P([from, hit, fN]), 1, OCHRE, 1.2, 0.8 * sq, [5, 4], -lt * 30);
      });
    });
    // the anemometer: its cups spin, its vane swings
    const mq = easeOut(prog(lt, 2.4, 0.7));
    stroke(this.anemMast, mq, INK, 1.8); this.anemStays.forEach(l => stroke(l, mq, INK, 0.8, 0.6)); stroke(this.anemArm, mq, INK, 1.4);
    if (mq >= 1) {
      const spin = lt * 5;
      for (let k = 0; k < 3; k++) { const a = spin + (k * TAU) / 3, ex = 1182 + 9 * Math.cos(a), ey = 840 + 3 * Math.sin(a); stroke(new P([[1182, 840], [ex, ey]]), 1, INK, 1, 0.8); disc(ex, ey, 2.6, INK, 0.85); }
      stroke(new P([[1182, 848], [1182, 840]]), 1, INK, 1.2);
      const vane = 0.25 * Math.sin(lt * 0.9);
      stroke(new P([[1212, 848], [1212, 838]]), 1, INK, 1.2); stroke(new P([[1212 - 12 * Math.cos(vane), 836], [1212 + 8 * Math.cos(vane), 836]]), 1, INK, 1.4); fill(new P([[1212 - 12 * Math.cos(vane), 831], [1212 - 12 * Math.cos(vane), 841], [1212 - 6 * Math.cos(vane), 836]], true), RED, 0.85);
    }
    this.tripod.forEach(l => stroke(l, easeOut(prog(lt, 2.6, 0.6)), INK, 1.4));
    const dq = easeOut(prog(lt, 3.0, 0.5));
    stroke(this.plate, dq, INK, 2); stroke(this.dome, dq, INK, 1.4); fill(this.dome, BLUE, 0.25 * dq);
  },
});
