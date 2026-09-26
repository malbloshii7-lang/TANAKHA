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
      { ll: [46.2, 6.14], label: 'GENEVA', ar: 'جنيف', t: 2.8 }, // the seat of the WMO, which the words name
      { ll: [43.3, 68.27], label: 'TURKISTAN REGION, KAZAKHSTAN · 2026', ar: 'إقليم تركستان، كازاخستان · ' + ltr('2026'), t: 3.6 },
      { ll: [33.57, -7.59], label: 'MOROCCO · 2025', ar: 'المغرب · ' + ltr('2025'), t: 4.2 },
      { ll: [31.55, 74.34], label: 'LAHORE, PAKISTAN · 2023', ar: 'لاهور، باكستان · ' + ltr('2023'), t: 4.8 },
      // Ethiopia (Revision 4): the country named at its capital, with no year and no claim (no drought claim)
      { ll: [9.03, 38.74], label: 'ETHIOPIA', ar: 'إثيوبيا', t: 5.4 },
    ];
    this.outline = el(this.cx, this.cy, this.R, this.R, 0, TAU, 360, 0.5);
    this.ring = el(this.cx, this.cy, 452, 118, 0, TAU, 361, 0.6, -0.22);
    // the ring's near half passes in front of the globe, its far half behind
    const rh = Math.floor(this.ring.pts.length / 2);
    this.ringFront = new P(this.ring.pts.slice(0, rh + 1));
    this.ringBack = new P(this.ring.pts.slice(rh).concat([this.ring.pts[0]]));
  },
  // Night on the globe: the terminator for the ceremony evening, 15 March 2027, time-lapsed from 13:40 to 15:10 UTC
  // (sunset in Abu Dhabi is about 14:21 UTC), so the dusk line crosses the UAE while the shot plays. Computed per frame.
  nightSide: true, utc0: 13 + 40 / 60, utc1: 15 + 10 / 60,
  nightShade(lt, lat0, lon0) {
    const R = this.R, n = 200;
    if (!this.nCV) { this.nCV = document.createElement('canvas'); this.nCV.width = this.nCV.height = n; this.hCV = document.createElement('canvas'); this.hCV.width = this.hCV.height = 2 * n; }
    const J = jdUTC(2027, 3, 15, lerp(this.utc0, this.utc1, clamp(lt / 11))), [ra, dec] = sunRaDec(J);
    const subLon = ((ra - gmstDeg(J)) % 360 + 540) % 360 - 180; // the subsolar point
    const [sx, sy, sz] = ortho(dec, subLon, lat0, lon0, 1);
    const g = this.nCV.getContext('2d'), img = g.createImageData(n, n), d = img.data;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * 2 - 1, y = 1 - (j + 0.5) / n * 2, rr = x * x + y * y;
      if (rr > 1) continue;
      const c = x * sx + y * sy + Math.sqrt(1 - rr) * sz; // cosine of the sun's zenith angle there
      const a = clamp((0.06 - c) / 0.2); // civil twilight softens the edge
      d[(j * n + i) * 4 + 3] = Math.round(255 * a);
    }
    g.putImageData(img, 0, 0);
    // engraved night: fine hatching, kept only where it is night
    const h = this.hCV.getContext('2d'); h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, 2 * n, 2 * n);
    h.globalCompositeOperation = 'source-over'; h.strokeStyle = '#1D1813'; h.lineWidth = 1.1; h.beginPath();
    for (let k = -2 * n; k < 4 * n; k += 5) { h.moveTo(k, 0); h.lineTo(k - 2 * n, 2 * n); }
    h.stroke(); h.fillStyle = 'rgba(40,71,140,0.35)'; h.fillRect(0, 0, 2 * n, 2 * n);
    h.globalCompositeOperation = 'destination-in'; h.drawImage(this.nCV, 0, 0, 2 * n, 2 * n);
    const { cx, cy } = this;
    ctx.save(); ctx.globalAlpha = SA * 0.55 * easeOut(prog(lt, 1.2, 1.4)); ctx.globalCompositeOperation = BLEND; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.hCV, cx - R, cy - R, 2 * R, 2 * R); ctx.restore();
    // is Abu Dhabi in night yet?
    const [ax, ay, az] = ortho(24.45, 54.38, lat0, lon0, 1);
    return ax * sx + ay * sy + az * sz;
  },
  draw(lt) {
    const { cx, cy, R } = this, lat0 = 24, lon0 = 46.5 - lt * 1.1; // west to east: the centre longitude falls (38.25 at the 7.5 s close-up)
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
    // night: the true terminator for the ceremony evening (or, if switched off, engraved shading on the far limb)
    if (this.nightSide) this.adNight = this.nightShade(lt, lat0, lon0);
    else {
      const shade = new P(el(cx, cy, R, R, 0, TAU, 362, 0).pts, true);
      ctx.save(); ctx.beginPath(); ctx.arc(cx - 70, cy - 60, R, 0, TAU); ctx.rect(cx + R + 10, cy - R - 10, -2 * R - 20, 2 * R + 20); ctx.clip('evenodd');
      hatch(shade, [cx - R, cy - R, cx + R, cy + R], -0.7, 7, prog(lt, 1.4, 1.6), INK, 1, 0.32, 363);
      ctx.restore();
    }
    // the armillary ring and a small satellite on it
    stroke(this.ringFront, clamp(rp * 2), SEPIA, 1.2, 0.65);
    if (lt > 3 && sf < 0.5) sat();
    // home and arcs
    const [hx, hy] = P2(...this.home);
    const hp = easeOut(prog(lt, 2.0, 0.6));
    ornament(hx, hy, 11 * hp, 1);
    smallAr('أبوظبي', hx - 18, hy + 36, hp, { size: 30, align: 'right', weight: 700, a: 0.9 });
    small('ABU DHABI', hx - 18, hy + 66, hp, { size: 14, ls: 2, align: 'right', weight: 600, a: 0.7 });
    // partners are pins, not trajectories: one quiet, dotted thread runs only to Geneva, the seat of the WMO
    const a = toVec(...this.home);
    // paper patches under every pin label first, so the limb, the night hatching and the ring never run through a name
    this.places.forEach(pl => {
      const [ex, ey, vis] = P2(...pl.ll), lq = easeOut(prog(lt, pl.t, 0.8));
      if (vis <= 0.02 || lq <= 0) return;
      const lx = ex > cx ? ex + 14 : ex - 14, w = Math.max(textWidth(pl.ar, `700 28px ${F_KUFI}`, 0, 'rtl'), textWidth(pl.label, `600 14px ${F_MONO}`, 2) + 2 * pl.label.length) + 8;
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA * 0.92 * lq; ctx.fillStyle = PAPER_PAT;
      ctx.fillRect(ex > cx ? lx - 4 : lx - w + 4, ey - 24, w, 64); ctx.restore();
    });
    this.places.forEach((pl, k) => {
      const [ex, ey, vis] = P2(...pl.ll), lq = easeOut(prog(lt, pl.t, 0.8));
      if (vis <= 0.02 || lq <= 0) return;
      if (k === 0) {
        const b = toVec(...pl.ll), om = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)), pts = [];
        for (let i = 0; i <= 48; i++) {
          const t = i / 48, s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
          const [la, lo] = toLatLon([a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2]), [x, y] = P2(la, lo);
          pts.push([x, y]);
        }
        stroke(new P(pts), 1, BLUE, 1.4, 0.7 * easeInOut(prog(lt, pl.t - 0.6, 1.6)), [3, 5]); // on the surface, faded in whole
      }
      stroke(el(ex, ey, 7 * lq, 7 * lq, 0, TAU, 380 + k, 0), 1, INK, 1.2, 0.8); disc(ex, ey, 3 * lq, k ? INK : BLUE, 0.9);
      const lx = ex > cx ? ex + 14 : ex - 14, al = ex > cx ? 'left' : 'right';
      smallAr(pl.ar, lx, ey + 8, lq, { size: 28, align: al, weight: 700, a: 0.88 });
      if (pl.ar2) smallAr(pl.ar2, lx, ey + 36, lq, { size: 19, align: al, weight: 600, a: 0.8 });
      small(pl.label, lx, ey + (pl.ar2 ? 56 : 34), lq, { size: 14, ls: 2, align: al, weight: 600, a: 0.7 });
    });
  },
});
