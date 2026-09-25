'use strict';
// XII · Al ʿĀlam — sharing it with the world: a turning globe; partners as pins, one dotted thread to Geneva (WMO)
scene({
  id: 'world', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 94, dur: 8, speed: 11 / 8, num: 'XII', name: 'AL ‘ĀLAM', ar: 'العالم', readout: '24.45°N 54.38°E → 46.20°N 6.14°E',
  kicker: 'WMO PRESIDENCY · 2023 — 2027',
  head: ['NOW WE SHARE', 'IT WITH', 'THE WORLD.'], accent: { 'WORLD.': RED },
  arHead: 'واليوم نشارك علمنا مع العالم',
  init() {
    this.cx = 1430; this.cy = 560; this.R = 318;
    this.home = [24.45, 54.38];
    this.places = [
      { ll: [46.2, 6.14], label: 'GENEVA · WMO', ar: 'جنيف', t: 2.6 },
      { ll: [43.3, 68.27], label: 'TURKISTAN · 2026', ar: 'تركستان', t: 3.4 },
      { ll: [33.57, -7.59], label: 'MOROCCO · 2025', ar: 'المغرب', t: 4.2 },
      { ll: [31.55, 74.34], label: 'LAHORE · 2023', ar: 'لاهور', t: 5.0 },
    ];
    this.outline = el(this.cx, this.cy, this.R, this.R, 0, TAU, 360, 0.5);
    this.ring = el(this.cx, this.cy, 452, 118, 0, TAU, 361, 0.6, -0.22);
    // the ring's near half passes in front of the globe, its far half behind
    const rh = Math.floor(this.ring.pts.length / 2);
    this.ringFront = new P(this.ring.pts.slice(0, rh + 1));
    this.ringBack = new P(this.ring.pts.slice(rh).concat([this.ring.pts[0]]));
  },
  draw(lt) {
    const { cx, cy, R } = this, lat0 = 24, lon0 = 30 + lt * 1.1;
    const P2 = (lat, lon, lift = 1) => { const [x, y, v] = ortho(lat, lon, lat0, lon0, R * lift); return [cx + x, cy - y, v]; };
    const op = easeInOut(prog(lt, 0.3, 1.4));
    const rp = easeInOut(prog(lt, 1.0, 2.0)), sf = (lt * 0.045) % 1;
    const sat = () => { const [sx, sy] = this.ring.at(sf); disc(sx, sy, 5, INK, 0.9); disc(sx, sy, 2.5, OCHRE, 1); };
    stroke(this.ringBack, clamp(rp * 2 - 1), SEPIA, 1.2, 0.65);
    if (lt > 3 && sf >= 0.5) sat();
    mask(new P(this.outline.pts, true));
    stroke(this.outline, op, INK, 2.2);
    // graticule every 15°
    const gp = easeOut(prog(lt, 0.9, 1.6));
    if (gp > 0) {
      ctx.save(); ctx.globalAlpha = SA * 0.45 * gp; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath();
      const run = pts => { let on = false; pts.forEach(([x, y, v]) => { if (v > 0.02) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; }); };
      for (let lon = -180; lon < 180; lon += 15) { const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push(P2(lat, lon)); run(pts); }
      for (let lat = -75; lat <= 75; lat += 15) { const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push(P2(lat, lon)); run(pts); }
      ctx.stroke(); ctx.restore();
    }
    // engraved shading on the far limb
    const shade = new P(el(cx, cy, R, R, 0, TAU, 362, 0).pts, true);
    ctx.save(); ctx.beginPath(); ctx.arc(cx - 70, cy - 60, R, 0, TAU); ctx.rect(cx + R + 10, cy - R - 10, -2 * R - 20, 2 * R + 20); ctx.clip('evenodd');
    hatch(shade, [cx - R, cy - R, cx + R, cy + R], -0.7, 7, prog(lt, 1.4, 1.6), INK, 1, 0.32, 363);
    ctx.restore();
    // the armillary ring and a small satellite on it
    stroke(this.ringFront, clamp(rp * 2), SEPIA, 1.2, 0.65);
    if (lt > 3 && sf < 0.5) sat();
    // home and arcs
    const [hx, hy] = P2(...this.home);
    const hp = easeOut(prog(lt, 2.0, 0.6));
    ornament(hx, hy, 11 * hp, 1);
    smallAr('أبوظبي', hx - 18, hy + 34, hp, { size: 22, align: 'right', weight: 600, a: 0.9 });
    // partners are pins, not trajectories: one quiet, dotted thread runs only to Geneva, the seat of the WMO
    const a = toVec(...this.home);
    this.places.forEach((pl, k) => {
      const [ex, ey, vis] = P2(...pl.ll), lq = easeOut(prog(lt, pl.t, 0.8));
      if (vis <= 0.02 || lq <= 0) return;
      if (k === 0) {
        const b = toVec(...pl.ll), om = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)), pts = [];
        for (let i = 0; i <= 48; i++) {
          const t = i / 48, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
          const [la, lo] = toLatLon([a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2]), [x, y] = P2(la, lo, 1 + 0.06 * Math.sin(Math.PI * t));
          pts.push([x, y]);
        }
        stroke(new P(pts), easeInOut(prog(lt, pl.t - 0.6, 1.6)), BLUE, 1.4, 0.7, [3, 5]);
      }
      stroke(el(ex, ey, 7 * lq, 7 * lq, 0, TAU, 380 + k, 0), 1, INK, 1.2, 0.8); disc(ex, ey, 3 * lq, k ? INK : BLUE, 0.9);
      const lx = ex > cx ? ex + 14 : ex - 14, al = ex > cx ? 'left' : 'right';
      smallAr(pl.ar, lx, ey + 7, lq, { size: 20, align: al, weight: 600, a: 0.85 });
    });
  },
});
