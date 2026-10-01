'use strict';
// Revision 11 (?rev11, a draft): Geneva, in the world beat. While the camera pushes toward the Geneva pin, a small
// engraved plate opens in the words column above the beat's words: WMO's headquarters at 7bis avenue de la Paix under a
// sky of fair-weather cumulus, the same clouds lying in its glass. Its caption names the place, and a second line gives
// the WMO President's work there: the Extraordinary Session of the World Meteorological Congress, held at WMO
// Headquarters in Geneva on 20-23 October 2025 and chaired by Dr Abdulla Ahmed Al Mandous (WMO, the session's page and
// the Secretary-General's opening address; WAM, 23 October 2025). The President is named in the beat's next lines.
// The building (WMO; Geneva's architecture register; Forbes India, 2023): Brodbeck & Roulet, 1996-1999; an elongated oval
// set east-west, 120 m long, nine storeys (35.81 m), glazed on every side in a double skin of bluish glass that "reflects
// the sky" ("The building is in itself meteorological", its architects). Its width is not given by those sources: it is
// drawn a quarter of its length (an assumption), seen from the south-west a little above its foot, as from the slope
// below the Palais des Nations. Screen coordinates (the words layer): it sits clear of the pins' labels (x < 1200) and of
// the beat's big lines below it (y > 560). Its caption runs above the pins' labels (y < 380), and the line about the
// Congress keeps right of x 1420, where the labels reach at the push's peak (x 1375, y 390-470), until the big lines.
const R11_GENEVA = (() => {
  const F = [1300, 84, 1840, 292]; // the plate's frame
  const A = 60, Bm = 15, H = 35.81, TH = 24 * Math.PI / 180, EL = 11 * Math.PI / 180, K = 2.85, CX = 1572, CY = 262;
  // a point of the building (x east, y north, z up, metres from its centre) on screen
  const pr = (x, y, z) => { const u = x * Math.cos(TH) + y * Math.sin(TH), v = -x * Math.sin(TH) + y * Math.cos(TH); return [CX + K * u, CY - K * (z * Math.cos(EL) + v * Math.sin(EL))]; };
  const N = 144, ring = Array.from({ length: N }, (_, j) => j / N * TAU);
  // the face toward the eye: where the oval's outward normal turns toward it
  const toEye = [Math.sin(TH), -Math.cos(TH)];
  const lit = p => { const nx = Math.cos(p) / A, ny = Math.sin(p) / Bm, l = Math.hypot(nx, ny); return (nx * toEye[0] + ny * toEye[1]) / l; };
  const vis = ring.filter(p => lit(p) > 0);
  // the visible arc as one run, from one silhouette to the other
  const k0 = vis.findIndex((p, i) => i === 0 ? lit(ring[(ring.indexOf(p) - 1 + N) % N]) <= 0 : lit(ring[ring.indexOf(p) - 1]) <= 0);
  const arc = vis.slice(k0).concat(vis.slice(0, k0));
  const at = (p, z) => pr(A * Math.cos(p), Bm * Math.sin(p), z);
  const facade = new P(arc.map(p => at(p, 0)).concat(arc.slice().reverse().map(p => at(p, H))), true);
  const roof = new P(ring.map(p => at(p, H)), true), parapet = new P(ring.map(p => pr(0.94 * A * Math.cos(p), 0.86 * Bm * Math.sin(p), H + 1.1)), true);
  const floors = Array.from({ length: 9 }, (_, i) => new P(arc.map(p => at(p, H * (i + 1) / 10))));
  const mull = arc.filter((_, j) => j % 2 === 0).map(p => [at(p, 0.4), at(p, H), lit(p)]);
  // fair-weather cumulus: a cauliflower outline of a few turrets on a flat base (the seeding plate's turret drawn small)
  const puff = (x, y, r, n, ph, sq = 0.92) => new P(Array.from({ length: 64 }, (_, j) => { const a = j / 64 * TAU, q = r * (1 + 0.06 * Math.pow(Math.abs(Math.sin(n * a / 2 + ph)), 0.6) - 0.03); return [x + q * Math.cos(a), y + q * sq * Math.sin(a)]; }), true);
  // a cloud wider than it is tall: turrets in a low dome over a flat base (sq < 1 squashes it, as the glass does)
  const cloud = (x, y, s, seed, sq = 1) => {
    const r = rng(seed), base = y + 0.3 * s * sq;
    const tur = [[-0.8, 0.16, 0.28], [-0.44, 0.02, 0.38], [-0.02, -0.1, 0.44], [0.4, 0.04, 0.36], [0.76, 0.17, 0.26]]
      .map(([dx, dy, rr]) => ({ x: x + dx * s, y: y + dy * s * sq, r: rr * s, body: puff(x + dx * s, y + dy * s * sq, rr * s, 2 * Math.round(4 + 2 * r()), r() * TAU, 0.92 * sq) }))
      .sort((a, b) => a.y - b.y);
    return { tur, base, x0: x - 1.1 * s, x1: x + 1.1 * s };
  };
  const sky = [cloud(1396, 130, 54, 2041), cloud(1606, 110, 44, 2042), cloud(1774, 140, 40, 2043)];
  // the same clouds in the glass, flattened by the oval's curve and lying low on it
  const inGlass = [cloud(1494, 228, 40, 2044, 0.55), cloud(1650, 223, 35, 2045, 0.55)];
  const frame = boxP(F[0], F[1], F[2], F[3]), inner = boxP(F[0] + 7, F[1] + 7, F[2] - 7, F[3] - 7);
  const ground = new P([[F[0] + 7, 268], [F[2] - 7, 266], [F[2] - 7, F[3] - 7], [F[0] + 7, F[3] - 7]], true);
  // plane trees along the avenue in front of its foot (Geneva's avenue de la Paix is lined with them), drawn as soft crowns
  const trees = [[1350, 274, 20], [1396, 278, 16], [1716, 278, 17], [1770, 273, 21]].map(([x, y, r], i) => ({ x, y, r, crown: puff(x, y - r * 0.8, r, 10, i * 1.7, 0.8) }));
  function cumulus(c, q, a = 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(c.x0 - 40, F[1], c.x1 - c.x0 + 80, c.base - F[1]); ctx.clip();
    c.tur.forEach(t => {
      mask(t.body, q);
      ctx.save(); ctx.beginPath(); t.body.trace(ctx, 1); ctx.clip();
      ctx.globalAlpha = SA * 0.24 * a * q; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath();
      for (let rr = t.r * 0.55; rr < t.r * 1.05; rr += 2.6) { ctx.moveTo(t.x - t.r * 0.25 + rr, t.y + t.r * 0.25); ctx.ellipse(t.x - t.r * 0.25, t.y + t.r * 0.25, rr, rr * 0.92, 0, 0, TAU); }
      ctx.stroke(); ctx.restore();
      stroke(t.body, q, INK, 1, 0.6 * a);
    });
    ctx.restore();
    // the flat base, in shade
    const xs = c.tur.filter(t => t.y + t.r > c.base).map(t => [t.x - Math.sqrt(Math.max(0, t.r * t.r - (c.base - t.y) ** 2)), t.x + Math.sqrt(Math.max(0, t.r * t.r - (c.base - t.y) ** 2))]);
    if (xs.length) stroke(new P([[Math.min(...xs.map(v => v[0])), c.base], [Math.max(...xs.map(v => v[1])), c.base]]), q, INK, 1, 0.6 * a);
  }
  // q: the plate's ink (0..1)
  function draw(q) {
    if (q <= 0.003) return;
    const s0 = SA; SA = s0 * q;
    try {
      mask(frame);
      ctx.save(); ctx.beginPath(); inner.trace(ctx, 1); ctx.clip();
      if (OPT.colour) washFade([F[0], F[1], F[2], 268], [[0, HUE.sky, 0.42], [1, HUE.cloud, 0.26]], 0, 1);
      // the sky's engraved rules, closing toward the top
      ctx.save(); ctx.globalAlpha = SA * 0.3; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath();
      for (let y = F[1] + 9; y < 267; y += 2.2 + (y - F[1]) * 0.02) { ctx.moveTo(F[0] + 7, y); ctx.lineTo(F[2] - 7, y); }
      ctx.stroke(); ctx.restore();
      sky.forEach(c => cumulus(c, 1));
      // the ground and the lawns at its foot
      mask(ground);
      if (OPT.colour) wash(ground, HUE.leaf, 0.25);
      hatch(ground, [F[0], 264, F[2], F[3]], 0, 3.2, 1, SEPIA, 0.6, 0.3, 2046);
      // the building: its roof, then the glazed face toward the eye, shaded as the oval turns from it, with the clouds
      // lying in the glass; floor lines and mullions over them
      mask(roof); fill(roof, SEPIA, 0.12); stroke(roof, 1, INK, 0.9, 0.8); stroke(parapet, 1, INK, 0.6, 0.55);
      mask(facade);
      if (OPT.colour) { wash(facade, HUE.water, 0.26); wash(facade, HUE.steel, 0.2); }
      ctx.save(); ctx.beginPath(); facade.trace(ctx, 1); ctx.clip();
      ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK;
      for (let j = 0; j + 1 < arc.length; j++) {
        const p = arc[j], e = Math.max(0, lit(p)), dk = 0.12 + 0.5 * Math.pow(1 - e, 1.6);
        const a0 = at(p, -1), a1 = at(arc[j + 1], -1), b0 = at(p, H + 1), b1 = at(arc[j + 1], H + 1);
        ctx.globalAlpha = SA * dk; ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(...a0); ctx.lineTo(...a1); ctx.lineTo(...b1); ctx.lineTo(...b0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      ctx.save(); ctx.beginPath(); facade.trace(ctx, 1); ctx.clip();
      inGlass.forEach(c => { ctx.save(); ctx.beginPath(); ctx.rect(c.x0, F[1], c.x1 - c.x0, c.base - F[1]); ctx.clip(); c.tur.forEach(t => mask(t.body, 0.5)); ctx.restore(); });
      ctx.restore();
      floors.forEach(f => stroke(f, 1, INK, 0.6, 0.55));
      mull.forEach(([a, b, e]) => stroke(new P([a, b]), 1, INK, 0.45, 0.25 + 0.2 * (1 - e)));
      stroke(facade, 1, INK, 1, 0.85);
      trees.forEach(t => { stroke(new P([[t.x, t.y], [t.x, t.y - 0.4 * t.r]]), 1, INK, 1.2, 0.75); mask(t.crown); if (OPT.colour) wash(t.crown, '#6E7F5A', 0.45); hatch(t.crown, [t.x - t.r, t.y - 2 * t.r, t.x + t.r, t.y + t.r], -0.6, 2.2, 1, INK, 0.6, 0.38, 2050 + Math.round(t.x)); stroke(t.crown, 1, INK, 0.8, 0.7); });
      ctx.restore();
      stroke(frame, 1, INK, 1.2, 0.8); stroke(inner, 1, INK, 0.7, 0.6);
    } finally { SA = s0; }
  }
  return { draw, F };
})();
