'use strict';
// The finale: the same star, twenty years on. The real sky over Abu Dhabi on a March 2027 evening
// (15 March, 20:00 Gulf time, time-lapsed a little), facing due south: Suhail stands about 12° up in the
// south with Sirius high above it. Along the horizon, the Corniche skyline in silhouette, windows lit,
// its towers in the proportions of the IX plate (CTBUH heights).
// Checked: at 16:00 UTC on 15 Mar 2027 Canopus is at altitude 12.2°, azimuth 187°; Sirius 48.4°, 189°.
const FINALE_VIEW = { az0: 186, pxDeg: 17, hz: 905 };
scene({
  id: 'finale', night: true,
  init() {
    this.stars = BRIGHT_STARS.map(([ra, dec, V, name], i) => ({ ra, dec, V, name, ph: (i * 2.399) % TAU }));
    this.suhail = this.stars.find(s => s.name === 'Canopus');
    // borrow the Corniche from the homes plate, and set it along the horizon
    const tmp = {}; SCENE_DEFS.get('homes').init.call(tmp);
    this.city = tmp.sky; this.cityBase = tmp.base;
    const r = rng(77);
    this.windows = this.city.filter(b => !b.palace).map(b => {
      const xs = b.body.pts.map(p => p[0]), ys = b.body.pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), top = Math.min(...ys);
      const lights = [];
      for (let y = tmp.base - 10; y > top + 8; y -= 9) for (let x = x0 + 4; x < x1 - 3; x += 7) if (r() < 0.34) lights.push([x, y, r()]);
      return lights;
    });
  },
  J(t) { return jdUTC(2027, 3, 15, 15.75 + 0.5 * clamp(this.hold ? 1 : t / (this.dur * (this.speed || 1)))); },
  // In the stage hold (hold: true, loop: seconds) the sky stands still, everything is fully drawn, and every
  // motion is periodic in the loop length, so the rendered loop joins seamlessly.
  tw(t, ph, rate) { return this.hold ? Math.sin(TAU * Math.round(rate * this.loop / TAU) * t / this.loop + ph) : Math.sin(t * rate + ph); },
  draw(t0) {
    const t = this.hold ? 99 : t0, J = this.J(t), fade = easeOut(prog(t, 0.3, 2.5));
    this.stars.forEach(s => {
      const [alt, az] = altAz(s.ra, s.dec, J);
      if (alt < 0) return;
      const [x, y] = skyXY(alt, az, FINALE_VIEW);
      if (x < -20 || x > W + 20 || y < -20) return;
      const hero = s === this.suhail, m = s.V + 0.1 * (airmass(alt) - 1);
      if (m > 6.2) return;
      const rad = Math.max(0.8, 3.7 - 0.6 * m) * (1 + 0.06 * this.tw(t0, s.ph, 3.1)), al = clamp((6.6 - m) / 3.4) * fade;
      disc(x, y, rad, hero ? '#FFE6B8' : INK, al);
      if (m < 2 && !hero) { const L = 3 + (2 - m) * 4; stroke(new P([[x - L, y], [x + L, y]]), 1, INK, 0.8, 0.5 * al); stroke(new P([[x, y - L], [x, y + L]]), 1, INK, 0.8, 0.5 * al); }
      if (hero) this.suhailXY = [x, y];
    });
    if (this.suhailXY) {
      const [hx, hy] = this.suhailXY, q = easeOut(prog(t, 1.2, 2.0)), k = 1 + 0.06 * this.tw(t0, 0, 2.3);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 120);
      halo.addColorStop(0, `rgba(255,214,150,${0.45 * q})`); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(hx - 120, hy - 120, 240, 240); ctx.restore();
      fill(starP(hx, hy, 19 * q * k, 5.5 * q, 8, -Math.PI / 2), '#FFD9A0', 0.9 * q);
      // a gold ring draws itself around Suhail: the turning circle, closed
      const rp = easeInOut(prog(t, 2.2, 2.6));
      if (rp > 0) { stroke(el(hx, hy, 46, 46, -Math.PI / 2, -Math.PI / 2 + TAU * rp, 780, 0.4), 1, GOLD, 1.6, 0.8); stroke(el(hx, hy, 54, 54, -Math.PI / 2, -Math.PI / 2 - TAU * rp, 781, 0.4), 1, GOLD, 0.8, 0.5); }
      // the outer ring keeps turning, slowly, like the sky (one turn per loop in the hold)
      if (rp >= 1) { const turn = this.hold ? TAU * t0 / this.loop : t0 * 0.12; stroke(el(hx, hy, 62, 62, turn, turn + TAU, 782, 0), 1, GOLD, 0.8, 0.35, [2, 7], 0); }
    }
    // the city glow on the horizon, then the Corniche in silhouette with its windows lit
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createLinearGradient(0, FINALE_VIEW.hz - 200, 0, FINALE_VIEW.hz);
    glow.addColorStop(0, 'rgba(0,0,0,0)'); glow.addColorStop(1, `rgba(120,90,70,${0.35 * fade})`);
    ctx.fillStyle = glow; ctx.fillRect(0, FINALE_VIEW.hz - 200, W, 200); ctx.restore();
    // plate x 1016–1885 → the middle of the frame; the mid-rise stretch (plate x ~1320) sits under Suhail
    const k = 0.9, ox = (this.suhailXY ? this.suhailXY[0] : 975) - 1320 * k, oy = FINALE_VIEW.hz - this.cityBase * k;
    ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k);
    const cq = easeOut(prog(t, 0.2, 2.0));
    this.city.forEach((b, i) => {
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = cq; ctx.fillStyle = '#05060B';
      ctx.beginPath(); b.body.trace(ctx, 1); ctx.fill(); ctx.restore();
      stroke(b.body, cq, INK, 1.2, 0.18);
    });
    this.windows.forEach((ws, i) => ws.forEach(([x, y, v]) => { const on = prog(t, 1.0 + v * 3, 0.6); if (on > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.55 * on * (0.6 + 0.4 * v); ctx.fillStyle = '#F2C97A'; ctx.fillRect(x, y, 3, 4); ctx.restore(); } }));
    ctx.restore();
    // the ground and the water line in front of the city
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#04050A'; ctx.fillRect(0, FINALE_VIEW.hz, W, H - FINALE_VIEW.hz); ctx.restore();
    stroke(ln(0, FINALE_VIEW.hz, W, FINALE_VIEW.hz, 790, 0.4), fade, INK, 1, 0.25);
  },
});
