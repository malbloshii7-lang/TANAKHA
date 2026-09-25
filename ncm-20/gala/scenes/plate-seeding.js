'use strict';
// X · Al Istimtar — seeding the cloud, then rain
scene({
  id: 'seeding', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 78, dur: 8, speed: 11 / 8, num: 'X', name: 'AL ISTIMTAR', ar: 'الاستمطار', readout: '311 MISSIONS · 2022',
  kicker: 'FIRST TRIAL 1982 · NATIONWIDE SINCE 2010',
  head: ['WE ASKED', 'THE CLOUDS', 'FOR MORE.'], accent: { 'MORE.': BLUE },
  arHead: 'واستمطرنا السحاب',
  init() {
    const C = [[1180, 380, 108], [1300, 300, 148], [1452, 262, 162], [1606, 316, 132], [1726, 392, 96], [1392, 402, 118], [1546, 412, 112], [1262, 432, 90], [1660, 448, 70]];
    this.circles = C.map(([x, y, r], i) => el(x, y, r, r, 0, TAU, 260 + i, 1.2));
    this.inside = C.map(([x, y, r], i) => el(x, y, r - 2.2, r - 2.2, 0, TAU, 900 + i, 0));
    this.base = pl([[1138, 505], [1300, 510], [1500, 503], [1700, 508], [1744, 505]], false, 270, 0.8);
    // a solid band along the base, so the lobes do not leave notches where they meet
    this.band = new P([[1117, 468], [1700, 468], [1764, 480], [1744, 507], [1138, 507]], true);
    this.bandEnds = [new P(quad([1117, 468], [1126, 492], [1140, 505], 8)), new P(quad([1764, 480], [1756, 496], [1742, 505], 8))];
    this.ground = pl([[985, 958], [1100, 946], [1230, 960], [1380, 944], [1540, 962], [1700, 948], [1885, 960]], false, 271, 0.8);
    this.groundFill = new P([[985, 958], [1100, 946], [1230, 960], [1380, 944], [1540, 962], [1700, 948], [1885, 960], [1885, 1006], [985, 1006]], true);
    // aircraft, local coordinates (nose to the right)
    this.fuse = el(0, 0, 70, 10, 0, TAU, 272, 0.2);
    this.wing = new P([[-6, -3], [18, -3], [0, 44], [-16, 44]], true);
    this.wing2 = new P([[-6, 3], [18, 3], [4, -30], [-10, -30]], true);
    this.fin = new P([[-58, -6], [-72, -30], [-60, -30], [-44, -6]], true);
    this.drops = [];
    const r = rng(33);
    for (let i = 0; i < 170; i++) this.drops.push({ x: 1120 + r() * 640, ph: r(), v: 620 + r() * 260, len: 16 + r() * 16, on: 5.0 + (i / 170) * 3.2, a: 0.35 + r() * 0.45 });
    this.flares = [];
    for (let i = 0; i < 90; i++) this.flares.push({ te: 1.6 + i * 0.06, side: i % 2 ? 1 : -1, vy: 40 + r() * 70, vx: -30 + r() * 60, life: 1.8 + r() * 1.2 });
  },
  planeX(lt) { return lerp(930, 1910, prog(lt, 1.4, 6.2)); },
  draw(lt) {
    // ground
    hatch(this.groundFill, [985, 940, 1885, 1012], 0.5, 9, prog(lt, 1.0, 1.6), OCHRE, 1.2, 0.5, 273);
    stroke(this.ground, easeInOut(prog(lt, 0.6, 1.6)), INK, 1.8);
    // the cloud: outlines, then paper over the inside, then shading below
    const cp = easeInOut(prog(lt, 0.3, 2.2));
    ctx.save(); ctx.beginPath(); ctx.rect(1000, 80, 900, 426); ctx.clip();
    this.circles.forEach((c, i) => stroke(c, clamp(cp * 1.1 - i * 0.02), INK, 2));
    mask(this.inside.concat([this.band]));
    hatch(this.circles.concat([this.band]), [1070, 330, 1830, 505], 0.55, 8, prog(lt, 1.6, 1.8), INK, 1, 0.3, 274);
    ctx.restore();
    this.bandEnds.forEach(e => stroke(e, clamp(cp * 1.1 - 0.2), INK, 2));
    stroke(this.base, easeInOut(prog(lt, 1.2, 1.2)), INK, 1.8);
    // droplets gathering at the cloud base after seeding
    const r = rng(77);
    for (let i = 0; i < 26; i++) {
      const x = 1150 + r() * 600, y = 470 + r() * 28, q = easeOut(prog(lt, 4.2 + r() * 1.6, 0.8));
      disc(x, y, (2 + r() * 3) * q, BLUE, 0.7);
    }
    // hygroscopic flares burn at the wing racks and leave a pale plume of salt particles that the updraft
    // carries into the cloud base: drawn as soft, spreading smoke, never as sparks
    this.flares.forEach(f => {
      const age = lt - f.te;
      if (age < 0 || age > f.life * 1.6) return;
      const px = this.planeX(f.te);
      if (px < 1110 || px > 1780) return;
      const u = age / (f.life * 1.6), x = px - 40 + f.vx * age * 0.6, y = 590 + f.side * 26 - f.vy * age * 0.9;
      if (y < 505) return;
      disc(x, y, 3 + 14 * u, SEPIA, 0.16 * (1 - u));
    });
    // the aircraft
    const px = this.planeX(lt);
    if (lt > 1.3 && px < 1905) {
      ctx.save(); ctx.translate(px, 590 + 3 * Math.sin(lt * 2));
      mask([this.fuse, this.wing, this.wing2, this.fin]);
      [this.wing2, this.fuse, this.wing, this.fin].forEach(q => stroke(q, 1, INK, 1.8));
      disc(5, 22, 5, INK, 0.9); disc(5, -16, 4, INK, 0.9);
      ctx.restore();
    }
    // rain, thickening as the seeding takes hold
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = BLUE; ctx.lineCap = 'round'; ctx.lineWidth = 1.5;
    this.drops.forEach(d => {
      const q = prog(lt, d.on, 0.6);
      if (q <= 0) return;
      const span = 440, y = 512 + ((d.ph * span + (lt - d.on) * d.v) % span), x = d.x - (y - 512) * 0.06;
      if (y > 950) return;
      ctx.globalAlpha = SA * d.a * q;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len * 0.06, y - d.len); ctx.stroke();
    });
    ctx.restore();
  },
});
