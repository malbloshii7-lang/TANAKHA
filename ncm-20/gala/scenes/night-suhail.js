'use strict';
// The cold open: the real sky before dawn over Abu Dhabi as Suhail (Canopus) rises. The film shows the
// morning of 24 August 2026 from 05:00 to 05:27 Gulf time (01:00–01:27 UTC), time-lapsed. Star places
// are computed per frame from data/stars.js; the sun's depth below the horizon sets the twilight.
// View: facing south-south-east (azimuth 153°), 20 px to the degree, the horizon at y 820.
// Checked: Canopus clears the horizon at about 01:05 UTC at azimuth 151°, and is 2.2° up at 01:25 UTC
// with the sun 8.7° below the horizon; Sirius stands 23° up in the south-east, Achernar low in the south.
const SUHAIL_VIEW = { az0: 153.15, pxDeg: 20, hz: 820 };

scene({
  id: 'suhail', night: true,
  init() {
    // low dunes along the horizon, kept under half a degree where Suhail rises
    const r = rng(41), crest = [];
    for (let x = -20; x <= W + 20; x += 24) {
      const d = Math.abs(x - 960), hump = 7 + 9 * Math.sin(x * 0.0061 + 1.3) + 6 * Math.sin(x * 0.017 + 0.4) + 3 * r();
      crest.push([x, SUHAIL_VIEW.hz - Math.max(2, hump) * (d < 160 ? 0.35 + 0.65 * (d / 160) : 1)]);
    }
    this.crest = new P(wob(crest, 42, 0.6));
    this.land = new P(crest.concat([[W + 20, H + 20], [-20, H + 20]]), true);
    this.stars = BRIGHT_STARS.map(([ra, dec, V, name, ar], i) => ({ ra, dec, V, name, ar, ph: (i * 2.399) % TAU }));
    this.suhail = this.stars.find(s => s.name === 'Canopus');
  },
  // sky time for local time t: 01:00 → 01:27 UTC across the scene, easing into the rising
  J(t) { return jdUTC(2026, 8, 24, (60 + 27 * easeInOut(clamp(t / (this.dur * (this.speed || 1)))) ) / 60); },
  draw(t) {
    const J = this.J(t), [sra, sdec] = sunRaDec(J), sunAlt = altAz(sra, sdec, J)[0];
    // twilight: the sun is below the horizon in the east (off the left edge); its light grows as it climbs
    const tw = clamp((sunAlt + 18) / 12);
    if (tw > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(-260, SUHAIL_VIEW.hz + 60, 0, -260, SUHAIL_VIEW.hz + 60, 1500);
      g.addColorStop(0, `rgba(255,170,110,${0.55 * tw * tw})`); g.addColorStop(0.25, `rgba(120,120,170,${0.35 * tw})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const hzg = ctx.createLinearGradient(0, SUHAIL_VIEW.hz - 260, 0, SUHAIL_VIEW.hz);
      hzg.addColorStop(0, 'rgba(0,0,0,0)'); hzg.addColorStop(1, `rgba(70,80,120,${0.3 * tw})`);
      ctx.fillStyle = hzg; ctx.fillRect(0, SUHAIL_VIEW.hz - 260, W, 260); ctx.restore();
    }
    // stars: brighter ones larger; they fade as twilight grows and toward the horizon (extinction)
    const fadeIn = easeOut(prog(t, 0.2, 2.2));
    this.stars.forEach(s => {
      const [alt, az] = altAz(s.ra, s.dec, J);
      if (alt < -0.5) return;
      const [x, y] = skyXY(alt, az, SUHAIL_VIEW);
      if (x < -20 || x > W + 20 || y < -20) return;
      const air = airmass(alt);
      const hero = s === this.suhail, m = s.V + (hero ? 0.06 : 0.12) * (air - 1) + tw * 1.3 * (hero ? 0.2 : 1);
      if (m > 6.2) return;
      const rad = Math.max(0.8, 3.7 - 0.6 * m) * (1 + 0.06 * Math.sin(t * 3.1 + s.ph)), al = clamp((6.6 - m) / 3.4) * fadeIn;
      disc(x, y, rad, hero ? '#FFE6B8' : INK, al);
      if (m < 2 && !hero) { // a small engraved glint on the brightest
        const L = 3 + (2 - m) * 4;
        stroke(new P([[x - L, y], [x + L, y]]), 1, INK, 0.8, 0.5 * al); stroke(new P([[x, y - L], [x, y + L]]), 1, INK, 0.8, 0.5 * al);
      }
    });
    // Suhail: once it clears the dunes, an eight-pointed star and a soft halo
    const [sa, sz] = altAz(this.suhail.ra, this.suhail.dec, J), [hx, hy] = skyXY(sa, sz, SUHAIL_VIEW), rise = clamp(sa / 1.2);
    if (rise > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
      halo.addColorStop(0, `rgba(255,214,150,${0.5 * rise})`); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(hx - 90, hy - 90, 180, 180); ctx.restore();
      const k = 1 + 0.06 * Math.sin(t * 2.3);
      fill(starP(hx, hy, 17 * rise * k, 5 * rise, 8, -Math.PI / 2), '#FFD9A0', 0.9 * rise);
      this.suhailXY = [hx, hy];
    }
    // the land: a dark desert with the first light on the dune crests
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.96; ctx.fillStyle = '#04050A';
    ctx.beginPath(); this.land.trace(ctx, 1); ctx.fill(); ctx.restore();
    stroke(this.crest, easeInOut(prog(t, 0.4, 2.4)), INK, 1.2, 0.35 + 0.35 * tw);
  },
});
