'use strict';
// V · Al Markaz — a centre to read the sky: radar, anemometer, the logbook
scene({
  id: 'centre', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 38, dur: 8, speed: 11 / 8, num: 'V', name: 'AL MARKAZ', ar: 'المركز', readout: 'ABU DHABI · 24.45°N 54.38°E',
  kicker: 'FEDERAL DECREE-LAW NO. 6 · 2007 · ABU DHABI',
  head: ['THEN WE BUILT', 'A CENTER TO', 'READ THE SKY.'], accent: { 'SKY.': BLUE },
  arHead: 'ثم أسسنا مركزاً يرصد السماء',
  init() {
    const cx = 1430, cy = 700, k = 0.36;
    Object.assign(this, { cx, cy, k });
    this.rings = [100, 190, 280, 370].map((r, i) => el(cx, cy, r, r * k, 0, TAU, 220 + i, 0.6));
    this.ticks = [];
    for (let d = 0; d < 72; d++) { const a = (d / 72) * TAU, r0 = 370, r1 = d % 6 === 0 ? 392 : 382; this.ticks.push(ln(cx + r0 * Math.cos(a), cy + r0 * k * Math.sin(a), cx + r1 * Math.cos(a), cy + r1 * k * Math.sin(a), 230 + d, 0.1)); }
    const r = rng(9);
    this.echoes = [[0.55, -2.3, 30, RED], [0.72, -1.2, 42, OCHRE], [0.42, 0.45, 26, BLUE], [0.84, 1.3, 36, RED], [0.62, 2.55, 30, OCHRE], [0.3, -0.55, 20, BLUE], [0.8, -2.85, 24, BLUE], [0.68, -0.2, 28, OCHRE]]
      .map(([rr, a, s, c], i) => {
        const x = cx + rr * 370 * Math.cos(a), y = cy + rr * 370 * k * Math.sin(a);
        const pts = [];
        for (let j = 0; j < 28; j++) { const t = (j / 28) * TAU, w = 1 + 0.28 * Math.sin(t * 3 + r() * 6) + 0.12 * Math.sin(t * 5 + i); pts.push([x + s * w * Math.cos(t), y + s * 0.45 * w * Math.sin(t)]); }
        const core = pts.map(([px, py]) => [x + (px - x) * 0.45, y + (py - y) * 0.45]);
        return { outer: new P(pts, true), core: new P(core, true), a, c };
      });
    this.legs = [ln(1404, 700, 1419, 420, 240, 0.3), ln(1456, 700, 1441, 420, 241, 0.3)];
    const zz = [];
    for (let i = 0; i <= 7; i++) { const y = 700 - i * 40, t = (700 - y) / 280, xl = lerp(1404, 1419, t), xr = lerp(1456, 1441, t); zz.push(i % 2 ? [xr, y] : [xl, y]); }
    this.brace = new P(wob(zz, 242, 0.3));
    this.platform = ln(1392, 420, 1468, 420, 243, 0.3);
    this.dome = el(1430, 362, 58, 58, 0, TAU, 244, 0.4);
    this.geo = [el(1430, 362, 58, 20, Math.PI, TAU, 245, 0.2), el(1430, 346, 50, 13, Math.PI, TAU, 246, 0.2), ln(1430, 304, 1430, 420, 247, 0.2), ln(1400, 312, 1395, 414, 248, 0.2), ln(1460, 312, 1465, 414, 249, 0.2)];
    this.pole = ln(1085, 760, 1085, 540, 250, 0.4);
    // the logbook: an open register lying on the desk, its first entry the year 2007
    this.book = [new P([[1080, 868], [1166, 856], [1172, 916], [1086, 930]], true), new P([[1166, 856], [1252, 866], [1250, 928], [1172, 916]], true)];
    this.bookRules = [0, 1, 2, 3, 4].map(k => ln(1182, 878 + k * 9, 1242, 886 + k * 9, 255 + k, 0.2));
  },
  draw(lt) {
    const { cx, cy, k } = this;
    this.rings.forEach((r, i) => stroke(r, easeInOut(prog(lt, 0.3 + i * 0.25, 1.4)), i === 3 ? INK : SEPIA, i === 3 ? 1.8 : 1.2, 0.8));
    this.ticks.forEach((t, d) => stroke(t, prog(lt, 1.2 + d * 0.012, 0.3), INK, d % 6 ? 0.8 : 1.3, 0.7));
    // sweep: one revolution every ~5 s, with a fading wedge
    const sweepOn = prog(lt, 1.6, 0.6);
    if (sweepOn > 0) {
      const th = -Math.PI / 2 + Math.max(0, lt - 1.6) * 1.25;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      for (let j = 0; j < 22; j++) {
        const a0 = th - j * 0.045, a1 = a0 - 0.045;
        ctx.globalAlpha = SA * sweepOn * 0.26 * (1 - j / 22);
        ctx.fillStyle = BLUE; ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 370 * Math.cos(a0), cy + 370 * k * Math.sin(a0)); ctx.lineTo(cx + 370 * Math.cos(a1), cy + 370 * k * Math.sin(a1)); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      stroke(new P([[cx, cy], [cx + 372 * Math.cos(th), cy + 372 * k * Math.sin(th)]]), 1, BLUE, 2.2, 0.85 * sweepOn);
      // echoes appear as the beam first passes them
      this.echoes.forEach(e => {
        const rel = ((e.a + Math.PI / 2) % TAU + TAU) % TAU, tPass = 1.6 + rel / 1.25, q = easeOut(prog(lt, tPass, 0.7));
        if (q <= 0) return;
        const since = ((Math.max(0, lt - 1.6) * 1.25 - rel) % TAU + TAU) % TAU, glow = 1 + 0.25 * Math.exp(-since * 2.2);
        fill(e.outer, e.c, 0.5 * q * glow); fill(e.core, e.c === OCHRE ? RED : e.c, 0.6 * q * glow);
        stroke(e.outer, q, INK, 0.9, 0.5);
      });
    }
    // the logbook
    const bq = easeOut(prog(lt, 1.2, 1.0));
    this.book.forEach(b => { mask(b); stroke(b, bq, INK, 1.4); });
    this.bookRules.forEach((l, k) => stroke(l, prog(lt, 1.6 + k * 0.08, 0.4), INK, 0.7, 0.45));
    const yq = easeOut(prog(lt, 2.4, 0.9));
    if (yq > 0) { ctx.save(); ctx.translate(1122, 900); ctx.rotate(-0.14); note('2007', 0, 0, -9, 9, { size: 34, a: 0.8 * yq, align: 'center' }); ctx.restore(); }
    // radar tower and radome
    this.legs.forEach(l => stroke(l, easeOut(prog(lt, 0.8, 1.2)), INK, 2));
    stroke(this.brace, easeOut(prog(lt, 1.4, 1.2)), INK, 1.1, 0.8);
    stroke(this.platform, prog(lt, 1.9, 0.5), INK, 2);
    const dp = easeInOut(prog(lt, 2.0, 1.2));
    mask(this.dome);
    hatch(this.dome, [1430, 300, 1492, 424], 1.1, 6, dp, INK, 1, 0.35, 251);
    stroke(this.dome, dp, INK, 2);
    this.geo.forEach((g, i) => stroke(g, prog(lt, 2.6 + i * 0.12, 0.6), INK, 1, 0.6));
    // cup anemometer, spinning
    stroke(this.pole, easeOut(prog(lt, 1.0, 1.0)), INK, 2);
    const ap = easeOut(prog(lt, 1.8, 0.8));
    if (ap > 0) {
      const spin = lt * 5.2;
      for (let j = 0; j < 3; j++) {
        const a = spin + (j * TAU) / 3, x = 1085 + 46 * Math.cos(a) * ap, y = 540 + 46 * 0.35 * Math.sin(a) * ap;
        stroke(new P([[1085, 540], [x, y]]), 1, INK, 1.6, 0.9);
        disc(x, y, 9 * ap, j === 0 ? RED : INK, 0.85);
      }
    }
  },
});
