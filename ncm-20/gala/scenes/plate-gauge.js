'use strict';
// XIII · Al Ghad — twenty years, a rain gauge filling to 2027
scene({
  id: 'gauge', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 102, dur: 12, speed: 0.975, num: 'XIII', name: 'AL GHAD', ar: 'الغد', readout: 'MARCH 2027',
  kicker: 'NATIONAL CENTER OF METEOROLOGY · 2007 — 2027',
  head: ['TWENTY YEARS', 'OF READING', 'THE SKY.'], accent: { 'SKY.': BLUE },
  arHead: 'عشرون عاماً في قراءة السماء',
  init() {
    this.rim = ln(1392, 150, 1608, 150, 400, 0.4);
    this.funnel = [ln(1392, 150, 1452, 226, 401, 0.3), ln(1608, 150, 1548, 226, 402, 0.3)];
    this.tube = pl([[1450, 226], [1450, 984], [1550, 984], [1550, 226]], false, 403, 0.4);
    this.foot = ln(1436, 984, 1564, 984, 404, 0.2); // the gauge stands on the ground
    this.ticks = [];
    for (let k = 0; k <= 20; k++) { const y = 950 - k * 35.5, major = k % 5 === 0; this.ticks.push({ y, major, p: ln(1550, y, major ? 1574 : 1562, y, 410 + k, 0.1) }); }
    this.ground = pl([[985, 986], [1200, 978], [1420, 985], [1580, 984], [1885, 988]], false, 440, 0.6);
    const r = rng(55);
    this.drops = [];
    for (let i = 0; i < 150; i++) this.drops.push({ x: 1000 + r() * 880, ph: r(), v: 700 + r() * 300, len: 18 + r() * 18, on: 0.8 + (i / 150) * 3.5, a: 0.3 + r() * 0.4 });
  },
  draw(lt) {
    small('MARCH 2027', 110, 812, easeOut(prog(lt, 7.6, 0.8)), { size: 18, ls: 6, a: 0.8, weight: 600 });
    setText(`600 18px ${F_MONO}`, 6);
    smallAr('المركز الوطني للأرصاد', 110 + ctx.measureText('MARCH 2027').width + 22, 814, easeOut(prog(lt, 7.9, 0.8)), { size: 26, a: 0.8, weight: 700 });
    // rain, inside the plate
    ctx.save(); ctx.beginPath(); ctx.rect(985, 124, 900, 860); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = BLUE; ctx.lineCap = 'round'; ctx.lineWidth = 1.4;
    this.drops.forEach(d => {
      const q = prog(lt, d.on, 0.6);
      if (q <= 0) return;
      const span = 1000, y = ((d.ph * span + (lt - d.on) * d.v) % span), x = d.x - y * 0.05;
      if (y > 978 || (x > 1440 && x < 1560 && y > 140)) return;
      ctx.globalAlpha = SA * d.a * q;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len * 0.05, y - d.len); ctx.stroke();
    });
    ctx.restore();
    stroke(this.ground, easeInOut(prog(lt, 0.4, 1.4)), INK, 1.8);
    // the gauge
    const gp = easeInOut(prog(lt, 0.4, 1.4));
    stroke(this.rim, gp, INK, 2.4); this.funnel.forEach(f => stroke(f, gp, INK, 2));
    stroke(this.tube, easeInOut(prog(lt, 0.8, 1.6)), INK, 2.2); stroke(this.foot, easeInOut(prog(lt, 0.8, 1.6)), INK, 2.6);
    const level = easeInOut(prog(lt, 1.6, 6.2)), top = 958 - level * (958 - 240);
    if (level > 0) {
      ctx.save(); ctx.globalAlpha = SA * 0.22; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = BLUE; ctx.fillRect(1453, top, 94, 958 - top);
      ctx.beginPath(); ctx.rect(1453, top, 94, 958 - top); ctx.clip();
      ctx.globalAlpha = SA * 0.55; ctx.strokeStyle = BLUE; ctx.lineWidth = 1.1; ctx.beginPath();
      for (let y = 956; y > top + 3; y -= 7) { ctx.moveTo(1456, y); ctx.lineTo(1544, y); }
      ctx.stroke(); ctx.restore();
      stroke(ln(1453, top, 1547, top, 450, 0.3), 1, BLUE, 2.4, 0.95);
      const year = Math.min(2027, Math.floor(2007 + 20 * level + 1e-6));
      small(String(year), 1432, top + 6, 1, { size: 22, ls: 2, align: 'right', weight: 600, col: year === 2027 ? RED : INK, a: 0.9 });
    }
    this.ticks.forEach((t, k) => {
      const q = prog(lt, 1.2 + k * 0.04, 0.4);
      stroke(t.p, q, INK, t.major ? 1.5 : 1, 0.85);
      if (t.major) { back(String(2007 + k), 1584, t.y + 5, 'left', q, 15, 2); small(String(2007 + k), 1584, t.y + 5, q, { size: 15, ls: 2, a: 0.75 }); }
    });
  },
});
