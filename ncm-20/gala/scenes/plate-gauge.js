'use strict';
// XIII · Al Ghad — twenty years: a rain gauge graduated 2007–2027 takes twenty drops, one for each year
scene({
  id: 'gauge', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 102, dur: 12, speed: 0.975, num: 'XIII', name: 'AL GHAD', ar: 'الغد', readout: 'MARCH 2027',
  kicker: 'NATIONAL CENTER OF METEOROLOGY · 2007 — 2027',
  head: ['TWENTY YEARS', 'OF READING', 'THE SKY.'], accent: { 'SKY.': BLUE },
  arHead: 'عشرون عاماً في قراءة السماء',
  // Twenty drops, one for each year: drop k lands at t20 - (20 - k) * dt (scene clock) and lifts the level one
  // graduation; the twentieth lands on 2027 at t20. The timeline sets t20 and dt so the drops fall on the music.
  t20: 8.0, dt: 0.3125,
  init() {
    this.rim = el(1500, 150, 108, 16, 0, TAU, 400, 0.3); // the funnel's mouth, seen from slightly above
    this.funnel = [ln(1392, 150, 1452, 226, 401, 0.3), ln(1608, 150, 1548, 226, 402, 0.3)];
    this.tube = pl([[1450, 226], [1450, 984], [1550, 984], [1550, 226]], false, 403, 0.4);
    this.foot = el(1500, 984, 64, 8, 0, Math.PI, 404, 0.1); // the gauge stands on the ground (the base's near edge)
    this.ticks = [];
    for (let k = 0; k <= 20; k++) { const y = 950 - k * 35.5, major = k % 5 === 0; this.ticks.push({ y, major, p: ln(1550, y, major ? 1574 : 1562, y, 410 + k, 0.1) }); }
    this.ground = pl([[985, 986], [1200, 978], [1420, 985], [1580, 984], [1885, 988]], false, 440, 0.6);
    const r = rng(55);
    this.drops = []; // a light, passing shower before the count: sparse, after the storm beat
    for (let i = 0; i < 40; i++) this.drops.push({ x: 1000 + r() * 880, ph: r(), v: 700 + r() * 300, len: 16 + r() * 14, on: 0.6 + (i / 40) * 1.6, a: 0.25 + r() * 0.3 });
  },
  arrive(k) { return this.t20 - (20 - k) * this.dt; },
  levelY(k) { return 950 - k * 35.5; },
  draw(lt) {
    const t0c = this.arrive(1) - 0.6; // the count begins; the shower has passed
    // the shower, inside the plate
    const showerOut = 1 - easeInOut(prog(lt, t0c - 1.2, 1.2));
    if (showerOut > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(985, 124, 900, 860); ctx.clip(); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = BLUE; ctx.lineCap = 'round'; ctx.lineWidth = 1.3;
      this.drops.forEach(d => {
        const q = prog(lt, d.on, 0.6) * showerOut;
        if (q <= 0) return;
        const span = 1000, y = ((d.ph * span + (lt - d.on) * d.v) % span), x = d.x - y * 0.05;
        if (y > 978 || (x > 1380 && x < 1620 && y > 140)) return;
        ctx.globalAlpha = SA * d.a * q;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len * 0.05, y - d.len); ctx.stroke();
      });
      ctx.restore();
    }
    stroke(this.ground, easeInOut(prog(lt, 0.4, 1.4)), INK, 1.8);
    // the gauge
    const gp = easeInOut(prog(lt, 0.4, 1.4));
    stroke(this.rim, gp, INK, 2.4); this.funnel.forEach(f => stroke(f, gp, INK, 2));
    stroke(this.tube, easeInOut(prog(lt, 0.8, 1.6)), INK, 2.2); stroke(this.foot, easeInOut(prog(lt, 0.8, 1.6)), INK, 2.6);
    // the level: the founding year's water, then one graduation per arrived drop
    let k = 0; for (let j = 1; j <= 20; j++) if (lt >= this.arrive(j)) k = j;
    const fillIn = easeOut(prog(lt, 1.6, 1.0));
    if (fillIn > 0) {
      const settle = k ? easeOut(prog(lt, this.arrive(k), 0.18)) : 1;
      const top = lerp(k ? this.levelY(k - 1) : 958, this.levelY(k), settle) * fillIn + 958 * (1 - fillIn);
      ctx.save(); ctx.globalAlpha = SA * 0.22; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = BLUE; ctx.fillRect(1453, top, 94, 958 - top);
      ctx.beginPath(); ctx.rect(1453, top, 94, 958 - top); ctx.clip();
      ctx.globalAlpha = SA * 0.55; ctx.strokeStyle = BLUE; ctx.lineWidth = 1.1; ctx.beginPath();
      for (let y = 956; y > top + 3; y -= 7) { ctx.moveTo(1456, y); ctx.lineTo(1544, y); }
      ctx.stroke(); ctx.restore();
      stroke(el(1500, top, 47, 5, 0, TAU, 450, 0.1), 1, BLUE, 2, 0.9); // the water surface, an ellipse like the mouth
      const year = 2007 + k;
      back(String(year), 1432, top + 7, 'right', 1, 22, 2);
      small(String(year), 1432, top + 7, 1, { size: 26, ls: 2, align: 'right', weight: 600, col: year === 2027 ? GOLD : INK, a: 0.95 });
      // a ripple as each drop lands
      if (k) { const age = lt - this.arrive(k); if (age < 0.5) stroke(el(1500, top, 10 + 80 * age, 3 + 10 * age, 0, TAU, 460 + k, 0), 1, BLUE, 1.2, 0.8 * (1 - age / 0.5)); }
    }
    // the falling drops: from the sky into the funnel and down the tube
    for (let j = 1; j <= 20; j++) {
      const ta = this.arrive(j), fall = 0.62, u = (lt - (ta - fall)) / fall;
      if (u < 0 || u >= 1) continue;
      const yEnd = this.levelY(j - 1), y = lerp(40, yEnd, u * u), x = 1500 + (y < 150 ? 0 : 0);
      disc(x, y, 5.5, BLUE, 0.9); fill(new P([[x - 4.6, y - 2], [x, y - 13], [x + 4.6, y - 2]], true), BLUE, 0.9);
      if (j === 20) disc(x, y, 3, GOLD, 0.9);
    }
    this.ticks.forEach((t, kk) => {
      const q = prog(lt, 1.2 + kk * 0.04, 0.4);
      stroke(t.p, q, INK, t.major ? 1.5 : 1, 0.85);
      if (t.major) { back(String(2007 + kk), 1584, t.y + 6, 'left', q, 20, 2); small(String(2007 + kk), 1584, t.y + 6, q, { size: 20, ls: 2, a: 0.8, weight: 600, col: kk === 20 && lt >= this.t20 ? GOLD : INK }); }
    });
    // the twentieth: a gold glint on the 2027 graduation and a ring widening from the rim — the last turning circle
    const h = lt - this.t20;
    if (h >= 0) {
      const g = easeOut(clamp(h / 0.6)) * (1 - easeInOut(prog(h, 0.6, 1.2)) * 0.5); // ramps over 0.6 s: no flash
      ornament(1564, this.levelY(20), 12 * g, 1); // on the major tick, clear of the 2027 label
      const rr = easeOut(prog(h, 0, 2.4));
      if (rr < 1) { stroke(el(1500, 150, 108 + 700 * rr, 16 + 104 * rr, 0, TAU, 470, 0.3), 1, GOLD, 2, 0.8 * (1 - rr)); }
    }
  },
});
