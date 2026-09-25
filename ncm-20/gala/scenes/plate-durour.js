'use strict';
// I · Al Durour — the 36-petal calendar wheel and the rising of Suhail
scene({
  id: 'durour', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 6, dur: 8, speed: 11 / 8, num: 'I', name: 'AL DUROUR', ar: 'الدرور', readout: 'SUHAIL · α CARINAE',
  kicker: 'THE DUROUR CALENDAR · 36 × 10 DAYS + 5',
  head: ['WE COUNTED', 'THE YEAR', 'BY A STAR.'], accent: { 'STAR.': RED },
  arHead: 'عددنا أيام السنة بطلوع سهيل',
  init() {
    const cx = 1420, cy = 575, N = 36, step = TAU / N;
    Object.assign(this, { cx, cy, petals: [], mullions: [], lozenges: [], dots: [], cols: [] });
    const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + i * step, h = step * 0.43, r1 = 262, r2 = 372;
      const pts = quad(pt(r1, a - h), pt(r1 + (r2 - r1) * 0.72, a - h * 0.92), pt(r2, a), 12)
        .concat(quad(pt(r2, a), pt(r1 + (r2 - r1) * 0.72, a + h * 0.92), pt(r1, a + h), 12).slice(1));
      this.petals.push(new P(wob(pts, 100 + i, 0.45)));
      this.mullions.push(ln(...pt(r1 + 6, a), ...pt(r1 + (r2 - r1) * 0.52, a), 200 + i, 0.25));
      this.lozenges.push(new P([pt(186, a), pt(214, a - h * 0.8), pt(243, a), pt(214, a + h * 0.8)], true));
      this.dots.push(pt(231, a));
      this.cols.push(i < 10 ? OCHRE : i < 20 ? BLUE : i < 30 ? RED : SEPIA);
    }
    this.rings = [el(cx, cy, 256, 256, 0, TAU, 5), el(cx, cy, 248, 248, 0, TAU, 6), el(cx, cy, 180, 180, 0, TAU, 7), el(cx, cy, 124, 124, 0, TAU, 8), el(cx, cy, 382, 382, 0, TAU, 9, 1.1)];
    const hy = cy + 36, hw = 130; // trimmed by the medallion's circle when drawn
    this.hy = hy;
    this.horizon = ln(cx - hw, hy, cx + hw, hy, 12, 0.4);
    this.dunes = [pl([[cx - 110, hy + 38], [cx - 60, hy + 22], [cx - 10, hy + 34], [cx + 40, hy + 18], [cx + 105, hy + 40]], false, 13, 0.5),
      pl([[cx - 95, hy + 66], [cx - 30, hy + 52], [cx + 30, hy + 64], [cx + 90, hy + 55]], false, 14, 0.5)];
    this.stolen = [];
    const ab = -Math.PI / 2 - step / 2;
    for (let k = 0; k < 5; k++) this.stolen.push(pt(400, ab + (k - 2) * 0.05));
    const sp = [];
    for (let i = 0; i <= 180; i++) { const t = i / 180, a = -Math.PI / 2 + 0.35 + TAU * 0.82 * t, r = 404 + 48 * t; sp.push(pt(r, a)); }
    this.spiral = new P(wob(sp, 17, 0.6));
  },
  draw(lt) {
    const { cx, cy } = this;
    ctx.save();
    const z = 1 + 0.03 * easeInOut(prog(lt, 0, 11));
    ctx.translate(cx, cy); ctx.scale(z, z); ctx.rotate(lt * 0.06); ctx.translate(-cx, -cy); // the year turns
    this.rings.forEach((r, i) => stroke(r, easeInOut(prog(lt, 0.3 + i * 0.15, 1.6)), INK, i === 4 ? 1.2 : 1.8, 0.85));
    this.petals.forEach((p, i) => { stroke(p, easeOut(prog(lt, 0.5 + i * 0.075, 0.9)), INK, 1.8); stroke(this.mullions[i], prog(lt, 1.1 + i * 0.075, 0.6), INK, 1.1, 0.55); });
    this.lozenges.forEach((q, i) => {
      const g = Math.floor(i / 10);
      fill(q, this.cols[i], 0.85 * easeOut(prog(lt, 2.8 + g * 0.45 + (i % 10) * 0.05, 0.8)));
      stroke(q, prog(lt, 1.6 + i * 0.05, 0.6), INK, 1.3, 0.8);
      disc(this.dots[i][0], this.dots[i][1], 4.2 * easeOut(prog(lt, 3.6 + i * 0.03, 0.5)), '#F3E7CF', 1, 'source-over');
    });
    this.stolen.forEach(([x, y], k) => { const q = easeOut(prog(lt, 5.6 + k * 0.12, 0.4)); disc(x, y, 5.5 * q, RED, 0.9); });
    stroke(this.spiral, easeInOut(prog(lt, 4.2, 4.6)), INK, 2, 0.8);
    ctx.restore();
    // centre: horizon, dunes, Suhail rising, all inside the medallion (which zooms with the wheel)
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 122 * z, 0, TAU); ctx.clip();
    stroke(this.horizon, prog(lt, 2.0, 1.2), INK, 1.4, 0.8);
    this.dunes.forEach((d, i) => stroke(d, prog(lt, 2.4 + i * 0.3, 1.2), INK, 1.1, 0.6));
    const rise = easeInOut(prog(lt, 3.6, 3.2)), sy = this.hy + 30 - 96 * rise;
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - 130, cy - 130, 260, this.hy - (cy - 130)); ctx.clip();
    fill(starP(cx, sy, 24, 9, 8), OCHRE, 0.95); stroke(starP(cx, sy, 24, 9, 8), 1, INK, 1.2, 0.8); disc(cx, sy, 3.5, RED);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU, r1 = i % 2 ? 44 : 56, q = prog(lt, 6.2 + i * 0.03, 0.5);
      stroke(ln(cx + 32 * Math.cos(a), sy + 32 * Math.sin(a), cx + r1 * Math.cos(a), sy + r1 * Math.sin(a), 60 + i, 0.15), q, INK, 1, 0.5);
    }
    ctx.restore(); ctx.restore();
  },
});
