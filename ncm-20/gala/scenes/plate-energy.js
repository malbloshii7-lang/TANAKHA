'use strict';
// VIII · Al Taqa — Shams 1: parabolic troughs turn to follow the sun; a pyranometer and an anemometer measure sun and wind
// Revision 11 (?rev11 only; the approved cut draws exactly as before): Shams 1's collectors track the sun, as a
// time-lapse over the beat, from one sun-position model that also places the sun on the plate's dial.
//   The plant (NREL SolarPACES project page "Shams 1"; Shams Power, "Technology"; Masdar factsheet): Madinat Zayed,
//   23.569 N 53.714 E (Wikipedia); 192 loops of 4 solar collector assemblies, 768 in all, each 150 m of 12 modules;
//   Abengoa ASTRO (ET-150 class) collectors with Flabeg RP3 mirrors (258,048 in all: 28 a module, 4 across and 7 along)
//   and 27,648 Schott PTR 70 receivers (70 mm absorber in a 125 mm glass envelope, about 4 m each). ET-150 geometry
//   (DLR/CIEMAT EuroTrough qualification, ISES 2003; Hennecke, DLR 2016): aperture 5.77 m, focal length 1.71 m (the
//   plate's parabola already has f = 0.3 W and its four facets), 12 m modules, three receiver supports a module. Rows on
//   north-south axes, level (Khalifa University's Shams 1 performance model, HEFAT 2014: orientation 0, tilt 0, rows
//   17.2 m apart, a 0.32 m gap at the vertex); the plant defocuses collectors (turns them a few degrees off the sun) when
//   the field has more heat than the power block takes, and brings them back on sun.
//   The day: 17 March, the inauguration (17 March 2013): declination -1.68 deg, equation of time -9.1 min (NOAA), so
//   solar noon is 12:34 Gulf time. The plate's clock runs at an even pace from 9:34 to 12:14 solar time (10:08 to 12:48
//   GST; 40 deg of hour angle between lt 1.0 and 7.0) and eases to rest as Al Dhafra's afternoon dissolves in: the sun
//   ends 3.9 deg past the dial's zenith, straight below the Al Dhafra plate's sun (screen x 581 at the dissolve), so the
//   day runs on from one plant to the next. The collectors' tracking angle is the sun's angle across the rows (a
//   north-south axis turns by atan2 of the sun's west and up components): 39 deg east going to 4 deg west, 43 deg over
//   the beat, plus the last 3 deg as the collectors come on sun at the start. Seen down the rows, the sun's image lies on
//   the ray from their vanishing point at exactly that angle (only its distance is the dial's), so the sun is placed on
//   the dial there and every trough's axis is parallel to the ray to it.
//   The eye: a frame every 2 z is a 12 m module, so the plate's lens is 319 px (a row from z 0.15 to 26 is one 150 m
//   assembly) and the eye stands 27.6 m up, 24 m above the torque tubes. The mirrors' tone is what each facet reflects
//   toward that eye (the deep high sky, the pale warm haze at the horizon, the sunlit sand below it; the shaded back of
//   the mirror where the eye sees that), so the facets change as the troughs turn; and where the eye looks down a
//   trough's optical axis the receiver's magnified image (the dark absorber, the lit tube at its centre) crosses the
//   mirror as the trough turns: it sweeps over the inner right row in mid-beat (film 123.9-126.4 s in the rev11 cut).
//   The receivers: a steady warm glow (the concentrated light on the glass) that grows as the collectors come on sun
//   (the intercept falls off over about a degree of tracking error), the rays drawn from the model's sun, reflected
//   off the parabola onto the tube.
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
    // Revision 11: the sun-position model, the tracking clock and the eye (see the header)
    if (typeof REV11 !== 'undefined' && REV11) this.init11();
  },
  init11() {
    const D = Math.PI / 180, lat = 23.569 * D, dec = -1.68 * D;
    // the sun's direction at hour angle w (afternoon positive): [west, up, south]
    this.sunVec = w => [Math.cos(dec) * Math.sin(w), Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(w),
      Math.sin(lat) * Math.cos(dec) * Math.cos(w) - Math.cos(lat) * Math.sin(dec)];
    // the clock ends (lt 7.0) at hour angle 3.49 deg, 12:14 solar time: the sun 3.9 deg past the dial's zenith, straight
    // below Al Dhafra's afternoon sun as that plate dissolves in (screen x 581); 40 deg of hour angle (2 h 40 min) before
    // that at lt 1.0
    this.W7 = 3.49 * D; this.WK = 40 * D / (this.clk11(7.0) - this.clk11(1.0));
    // metres to plate px at s 1 (the aperture), and the lens: a frame every 2 z is a 12 m module
    this.PXM = this.W0 / 5.77; this.F11 = 12 * this.PXM / (2 * this.K);
    // the receiver: absorber and glass envelope radii (Schott PTR 70: 70 and 125 mm)
    this.RA = 0.035 * this.PXM; this.RG = 0.0625 * this.PXM;
    // the section's focal length and vertex (as in init), and the eye above each row's torque tube
    this.f11 = 0.3 * this.W0; this.v11 = -0.1 * this.W0; this.EY = this.YG - this.HY - this.H0;
    // receiver supports every 4 m, between the module ends (fixed places along the row, so none moves as a row draws in)
    this.sup = []; for (let z = this.Z1 - 1 / 3; z > 0.5; z -= 2 / 3) this.sup.push(z);
  },
  // the time-lapse clock: steady to lt 5.4, then easing to rest by lt 7.6 (the sun all but still through the dissolve)
  clk11(lt) {
    const a = 5.4, L = 2.2;
    if (lt <= a) return lt;
    if (lt >= a + L) return a + L / 2;
    return a + (lt - a) / 2 + L / (2 * Math.PI) * Math.sin(Math.PI * (lt - a) / L);
  },
  // this frame's sun (hour angle, direction, tracking angle, its place on the dial) and the collectors' tilt: they come on
  // sun from 3 deg east of it over lt 1.0-4.0; G is the share of the concentrated light the receivers catch
  sun11(lt) {
    if (this.S11 && this.S11.lt === lt) return this.S11;
    const D = Math.PI / 180, w = this.W7 + this.WK * (this.clk11(lt) - this.clk11(7.0)), S = this.sunVec(w), rho = Math.atan2(S[0], S[1]);
    const r = 1 / Math.hypot(Math.sin(rho) / 420, Math.cos(rho) / 372), eps = 3 * D * Math.pow(1 - prog(lt, 1.0, 3.0), 3);
    this.S11 = { lt, w, S, rho, eps, tilt: rho - eps, G: Math.exp(-0.5 * Math.pow(eps / D, 2)), sun: [this.VX + r * Math.sin(rho), this.HY - r * Math.cos(rho)] };
    return this.S11;
  },
  // Revision 11 · the section in world terms, from the row's torque tube (x right = west, y down, plate px at s 1): a
  // section point turned by the tilt, the mirror's point and its normal (toward the focus) at u across the aperture,
  // and a world point on screen at depth z
  turn11(c, sn, [x, y]) { return [x * c - y * sn, x * sn + y * c]; },
  pt11(c, sn, u) { return this.turn11(c, sn, [u, this.v11 - u * u / (4 * this.f11)]); },
  nrm11(c, sn, u) { const k = Math.hypot(u / (2 * this.f11), 1); return this.turn11(c, sn, [-u / (2 * this.f11) / k, -1 / k]); },
  scr11(z, off, [X, Y]) { const s = 1 / (1 + this.K * z); return [this.VX + (off + X) * s, this.HY + (this.EY + Y) * s]; },
  // the eye's ray to the mirror at u, reflected: how squarely the eye sees the front (cv, negative on the back), the
  // reflected direction [west, down, south], and its signed miss distance at the focal line (the receiver's image)
  look11(c, sn, off, u, z) {
    const p = this.pt11(c, sn, u), n = this.nrm11(c, sn, u), d = [p[0] + off, p[1] + this.EY], dl = Math.hypot(d[0], d[1]), dn = d[0] * n[0] + d[1] * n[1];
    const r = [d[0] - 2 * dn * n[0], d[1] - 2 * dn * n[1]], f = this.turn11(c, sn, [0, this.v11 - this.f11]), q = [f[0] - p[0], f[1] - p[1]], rl = Math.hypot(r[0], r[1]);
    const miss = dn < 0 && q[0] * r[0] + q[1] * r[1] > 0 ? (r[0] * q[1] - r[1] * q[0]) / rl : Infinity;
    return { cv: -dn / dl, R: [r[0], r[1], this.F11 * (1 + this.K * z)], miss };
  },
  // what the mirror shows along a reflected direction R [west, down, south]: the sky (sky: from the pale haze at the
  // horizon to the deep blue high up; haze: the warm pale band low down) or, below the horizon, the sunlit sand, which
  // meets the haze at the horizon so a facet's tone never steps
  sky11(R) {
    const el = Math.asin(-R[1] / Math.hypot(R[0], R[1], R[2]));
    if (el < 0) { const h = Math.exp(el / 0.06); return { sky: 0, haze: h, sand: 1 - h }; }
    return { sky: 1 - Math.exp(-el / 0.45), haze: Math.exp(-el / 0.12), sand: 0 };
  },
  // a fill graded between two screen points
  grad11(path, p0, p1, col, a0, a1, mode = BLEND) {
    if (a0 <= 0 && a1 <= 0) return;
    const n = parseInt(col.slice(1), 16), rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`, g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    g.addColorStop(0, `rgba(${rgb},${Math.max(0, a0)})`); g.addColorStop(1, `rgba(${rgb},${Math.max(0, a1)})`);
    ctx.save(); ctx.globalAlpha = SA; ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore();
  },
  // the mirror of one row: its four facets (the RP3 panels, four across), each toned by what it reflects toward the eye,
  // near and far, painted from the farthest from the eye (a facet seen from behind is the mirror's shaded back); then
  // the receiver's magnified image where the eye looks down the optical axis: the dark absorber in its glass envelope,
  // and at its centre the lit tube
  mirror11(S11, off, zn, zf, near, far, c, sn) {
    const W = this.W0, facets = [0, 1, 2, 3].map(k => {
      const i0 = 4 * k, i1 = i0 + 4, u = -W / 2 + W * (k + 0.5) / 4, a = this.look11(c, sn, off, u, zn), b = this.look11(c, sn, off, u, zf);
      const p = this.pt11(c, sn, u);
      return { i0, i1, a, b, dist: Math.hypot(p[0] + off, p[1] + this.EY) };
    }).sort((x, y) => y.dist - x.dist);
    // a facet's inks: the reflection on its face, the shaded back of the mirror where the eye sees that (front 0)
    const tone = lk => {
      const fr = clamp(0.5 + lk.cv / 0.16), m = this.sky11(lk.R);
      return { fr, blue: fr * (0.1 + 0.26 * m.sky) + (1 - fr) * 0.14, ink: 0.16 * (1 - fr), och: 0.2 * fr * m.sand,
        sky: 0.4 * fr * m.sky, haze: 0.28 * fr * m.haze, sand: 0.42 * fr * m.sand, steel: 0.3 * (1 - fr) };
    };
    facets.forEach(f => {
      const path = new P(near.slice(f.i0, f.i1 + 1).concat(far.slice(f.i0, f.i1 + 1).reverse()), true);
      const m0 = near[f.i0 + 2], m1 = far[f.i0 + 2], A = tone(f.a), B = tone(f.b);
      mask(path);
      this.grad11(path, m0, m1, BLUE, A.blue, B.blue);
      this.grad11(path, m0, m1, INK, A.ink, B.ink);
      this.grad11(path, m0, m1, OCHRE, A.och, B.och);
      if (OPT.colour) [['sky', HUE.sky], ['haze', HUE.dawn], ['sand', HUE.sand], ['steel', HUE.steel]].forEach(([k, col]) => this.grad11(path, m0, m1, col, A[k], B[k], 'multiply'));
    });
    // the receiver's image: the stretches of the aperture whose reflected ray passes within the glass envelope, the
    // absorber, and the inner quarter of the absorber (where the eye sees the sun again, twice reflected)
    const N = 64, us = Array.from({ length: N + 1 }, (_, i) => -W / 2 + W * i / N), ms = us.map(u => Math.abs(this.look11(c, sn, off, u, zn).miss));
    const spans = th => {
      const out = []; let a = null;
      for (let i = 0; i <= N; i++) {
        const inside = ms[i] < th;
        if (inside && a === null) a = i === 0 ? us[0] : lerp(us[i - 1], us[i], isFinite(ms[i - 1]) ? (ms[i - 1] - th) / (ms[i - 1] - ms[i]) : 1);
        if (!inside && a !== null) { out.push([a, lerp(us[i - 1], us[i], isFinite(ms[i]) ? (th - ms[i - 1]) / (ms[i] - ms[i - 1]) : 0)]); a = null; }
      }
      if (a !== null) out.push([a, us[N]]);
      return out;
    };
    const band = ([u0, u1]) => {
      const k = Math.max(2, Math.ceil((u1 - u0) / 3)), uu = Array.from({ length: k + 1 }, (_, i) => lerp(u0, u1, i / k));
      return new P(uu.map(u => this.scr11(zn, off, this.pt11(c, sn, u))).concat(uu.slice().reverse().map(u => this.scr11(zf, off, this.pt11(c, sn, u)))), true);
    };
    spans(this.RG).forEach(s => fill(band(s), INK, 0.06));
    spans(this.RA).forEach(s => fill(band(s), INK, 0.3));
    spans(0.25 * this.RA).forEach(s => { const b = band(s); this.grad11(b, b.pts[0], b.pts[b.pts.length - 1], '#FFE6B8', 0.4 * S11.G, 0.4 * S11.G, 'source-over'); });
  },
  // the receiver supports (struts from the torque box through the gap at the vertex up to the tube's glass), drawn while
  // the eye sees the mirror's face at its vertex
  supports11(off, zn, zf, c, sn, at) {
    const a = 0.55 * clamp(0.5 + this.look11(c, sn, off, 0, zn).cv / 0.16);
    if (a <= 0) return;
    this.sup.forEach(z => {
      if (z <= zn + 0.3 || z >= zf) return;
      stroke(new P([at(z, off, [0, this.v11]), at(z, off, [0, this.v11 - this.f11 + this.RG + 0.5])]), 1, INK, 0.7 / (1 + this.K * z) + 0.2, a);
    });
  },
  // a band along the receiver from its near end to its far end, its half-width hw px at s 1 tapering with distance
  tube11(fN, fF, zn, zf, hw, col, a, mode) {
    if (a <= 0) return;
    const dx = fF[0] - fN[0], dy = fF[1] - fN[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    const wn = hw / (1 + this.K * zn), wf = hw / (1 + this.K * zf);
    const path = new P([[fN[0] + nx * wn, fN[1] + ny * wn], [fF[0] + nx * wf, fF[1] + ny * wf], [fF[0] - nx * wf, fF[1] - ny * wf], [fN[0] - nx * wn, fN[1] - ny * wn]], true);
    this.grad11(path, fN, fF, col, a, a, mode);
  },
  // sunlight at the near end: rays from the model's sun, reflected by the parabola's normal at each point; they meet
  // on the tube when the collectors are on sun and fall a little beside it while they are still 3 deg off
  rays11(S11, off, zn, c, sn, sq, lt) {
    const di = [-Math.sin(S11.rho), Math.cos(S11.rho)], f = this.turn11(c, sn, [0, this.v11 - this.f11]);
    this.rays.forEach(([u]) => {
      const h = this.pt11(c, sn, u), n = this.nrm11(c, sn, u), dn = di[0] * n[0] + di[1] * n[1], o = [di[0] - 2 * dn * n[0], di[1] - 2 * dn * n[1]];
      const L = Math.hypot(f[0] - h[0], f[1] - h[1]), from = [h[0] - 0.4 * this.W0 * di[0], h[1] - 0.4 * this.W0 * di[1]], to = [h[0] + L * o[0], h[1] + L * o[1]];
      stroke(new P([from, h, to].map(p => this.scr11(zn, off, p))), 1, OCHRE, 1.2, 0.8 * sq, [5, 4], -lt * 30);
    });
  },
  // colour: a sky warming toward the horizon, a warm halo about the sun, desert under the rows, the mirrors holding the sky
  under(lt) {
    const q = easeInOut(prog(lt, 0.2, 1.2));
    washFade([985, -300, 1885, this.HY], [[0, HUE.sky, 0.4], [0.7, HUE.sky, 0.3], [1, HUE.dawn, 0.34]], 150, q);
    washFade([985, this.HY, 1885, 1010], [[0, HUE.sand, 0.34], [1, HUE.dune, 0.5]], 150, q);
    // Revision 11: the sun from the sun-position model
    const S11 = typeof REV11 !== 'undefined' && REV11 ? this.sun11(lt) : null;
    const sa = Math.PI + Math.PI * (0.25 + 0.55 * easeInOut(prog(lt, 0.6, 7.2))), sq = easeOut(prog(lt, 0.8, 0.6));
    const sx = S11 ? S11.sun[0] : 1430 + 420 * Math.cos(sa), sy = S11 ? S11.sun[1] : this.HY + 372 * Math.sin(sa);
    if (sq > 0) {
      ctx.save(); const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, 190);
      g.addColorStop(0, `rgba(242,163,107,${0.5 * sq})`); g.addColorStop(1, 'rgba(242,163,107,0)');
      ctx.globalAlpha = SA; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(sx - 190, sy - 190, 380, 380); ctx.restore();
    }
  },
  draw(lt) {
    const HY = this.HY;
    stroke(this.horizon, easeInOut(prog(lt, 0.2, 1.0)), INK, 1.4, 0.7);
    stroke(this.arc, easeInOut(prog(lt, 0.4, 1.6)), INK, 1.2, 0.55, [4, 9], 0);
    this.ticks.forEach((t, i) => stroke(t, prog(lt, 1.0 + i * 0.06, 0.3), INK, 1.1, 0.6));
    // the sun travels its arc (Revision 11: placed by the sun-position model)
    const S11 = typeof REV11 !== 'undefined' && REV11 ? this.sun11(lt) : null;
    const sa = Math.PI + Math.PI * (0.25 + 0.55 * easeInOut(prog(lt, 0.6, 7.2))), sq = easeOut(prog(lt, 0.8, 0.6));
    const sx = S11 ? S11.sun[0] : 1430 + 420 * Math.cos(sa), sy = S11 ? S11.sun[1] : HY + 372 * Math.sin(sa);
    if (sq > 0) {
      mask(el(sx, sy, 64 * sq, 64 * sq, 0, TAU, 641, 0)); // the sun hides the path behind it
      // Revision 11 (?rev11): Al Dhafra's sun follows just above this point, so the rays and the red centre leave before the
      // dissolve (no concentric rings with a red centre, which would read as a target)
      const rv = typeof REV11 !== 'undefined' && REV11 ? 1 - easeInOut(prog(lt, 5.9, 0.5)) : 1;
      for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + lt * 0.4, r1 = i % 2 ? 50 : 62; stroke(new P([[sx + 40 * Math.cos(a), sy + 40 * Math.sin(a)], [sx + r1 * Math.cos(a), sy + r1 * Math.sin(a)]]), sq * rv, INK, 1.2, 0.6); }
      disc(sx, sy, 32 * sq, OCHRE, 0.95); stroke(el(sx, sy, 32 * sq, 32 * sq, 0, TAU, 640, 0), 1, INK, 1.4, 0.8); disc(sx, sy, 5 * sq, RED, 0.9 * rv);
    }
    // the power block of Shams 1 on the horizon
    const pb = easeOut(prog(lt, 1.4, 0.8));
    mask([this.hall, this.acc]); stroke(this.hall, pb, INK, 1.2); stroke(this.stack, pb, INK, 1.2); stroke(this.duct, pb, INK, 2, 0.8);
    fill(this.acc, INK, 0.1 * pb); stroke(this.acc, pb, INK, 1.2); this.accRibs.forEach(l => stroke(l, pb, INK, 0.7, 0.6));
    this.accLegs.forEach(l => stroke(l, pb, INK, 0.9, 0.8)); this.fans.forEach(fn => stroke(fn, pb, INK, 0.9, 0.8));
    // the troughs turn with the sun: tilt 0 faces straight up; east (left) is negative
    const tilt = S11 ? S11.tilt : sa - 1.5 * Math.PI, c = Math.cos(tilt), sn = Math.sin(tilt);
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
      mask(surf);
      // Revision 11: each facet's tone from what it reflects toward the eye, and the receiver's image in the mirror
      if (S11) this.mirror11(S11, off, zNear, zFar, near, far, c, sn);
      else { fill(surf, BLUE, 0.22); if (OPT.colour) wash(surf, HUE.sky, 0.35); }
      // mirror facets run along the row
      [0, 4, 8, 12, 16].forEach(i => stroke(new P([near[i], far[i]]), 1, INK, i % 8 ? 0.7 : 1.2, i % 8 ? 0.45 : 0.85));
      // frames and pylons every few metres, far to near
      for (let z = Math.floor(zFar); z > zNear + 0.5; z -= 2) {
        const [top, foot] = gnd(z, off);
        stroke(new P([top, foot]), 1, INK, 1.1 / (1 + K * z) + 0.4, 0.7);
        stroke(new P(this.sec.map(p => at(z, off, p))), 1, INK, 1.4 / (1 + K * z) + 0.3, 0.6);
        stroke(new P([top, at(z, off, this.arms[0]), at(z, off, this.arms[3]), top]), 1, INK, 0.8 / (1 + K * z) + 0.3, 0.5);
      }
      // Revision 11: the receiver supports, three a module (hidden behind the mirror when the eye sees its back)
      if (S11) this.supports11(off, zNear, zFar, c, sn, at);
      // the receiver tube along the focal line, hot while the sun is up
      const fN = at(zNear, off, this.focus), fF = at(zFar, off, this.focus);
      // Revision 11: a steady warm glow round the tube as the collectors come on sun, and the lit glass along it
      if (S11) this.tube11(fN, fF, zNear, zFar, 4.2, OCHRE, 0.42 * S11.G * q, BLEND);
      else stroke(new P([fN, fF]), 1, RED, 3.2, 0.25 * sq);
      stroke(new P([fN, fF]), 1, INK, 1.6, 0.9);
      if (S11) this.tube11(fN, fF, zNear, zFar, 0.55, '#FFEBC2', 0.9 * S11.G * q, 'source-over');
      // the near end: the U of the mirror, its torque tube, pylon, receiver support, and sunlight folding onto the tube
      const [top, foot] = gnd(zNear, off);
      stroke(new P([top, foot]), 1, INK, 2.2); stroke(new P([[foot[0] - 12, foot[1]], [foot[0] + 12, foot[1]]]), 1, INK, 1.6, 0.8);
      this.arms.forEach(p => stroke(new P([top, at(zNear, off, p)]), 1, INK, 1.1, 0.75));
      disc(top[0], top[1], 4.5, INK, 0.9);
      stroke(new P(near), 1, INK, 2.2);
      stroke(new P([at(zNear, off, [0, -0.1 * this.W0]), fN]), 1, INK, 1, 0.7);
      disc(fN[0], fN[1], 4.2, INK, 0.9);
      // Revision 11: the tube's end glows as the receivers catch the light; the rays come from the model's sun and are
      // reflected by the parabola (onto the tube once the collectors are on sun)
      if (S11) disc(fN[0], fN[1], 2.2, '#F7D79A', 0.95 * S11.G, 'source-over');
      else disc(fN[0], fN[1], 2.2, RED, 0.9 * sq, 'source-over');
      if (S11 && sq > 0) this.rays11(S11, off, zNear, c, sn, sq, lt);
      else if (sq > 0) this.rays.forEach(p => {
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
