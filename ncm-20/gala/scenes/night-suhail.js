'use strict';
// The cold open: the real sky before dawn over Abu Dhabi as Suhail (Canopus) rises. The film shows the
// morning of 24 August 2026 from 05:00 to 05:27 Gulf time (01:00–01:27 UTC), time-lapsed. Star places
// are computed per frame from data/stars.js; the sun's depth below the horizon sets the twilight.
// View: facing south-south-east (azimuth 153°), 20 px to the degree, the horizon at y 820.
// Checked: Canopus clears the horizon at about 01:05 UTC at azimuth 151°, and is 2.2° up at 01:25 UTC
// with the sun 8.7° below the horizon; Sirius stands 23° up in the south-east, Achernar low in the south.
// On the near dune, 24 m from the camera (whose eye is 1.6 m up in a trough; 1146 px a radian, so 47.7 px a metre), a
// man in kandura and ghutra stands with his camel stick beside his couched camel, both watching Suhail rise: "the people
// of this land read the sky". Silhouettes only, no face; the crest they stand on is 0.7 m above the camera's eye, 1.65°
// up, so they stand against the sky, and the man (1.75 m) is 84 px tall. The twilight is in the east, off the left of
// the frame, so their edges toward it take a faint rim of light. Low near the horizon Suhail twinkles and changes
// colour, as a low star does through the long path of air (and as the poets describe it); the flicker is small and
// slow, never a strobe.
const SUHAIL_MAN = { x: 640, k: 47.7 }, SUHAIL_CAMEL = { x: 480 };
function suhailSpline(pts, closed = true, n = 8) { // a smooth closed outline through the points (Catmull-Rom)
  const out = [], m = pts.length;
  for (let i = 0; i < m; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  return new P(out, closed);
}
const SUHAIL_VIEW = { az0: 153.15, pxDeg: 20, hz: 820 };
// The sky clock, keyed to the music: 00:59:30 UTC at the first frame; Canopus clears the low dunes on bar 2.5 (8.33 s,
// 01:08:40 UTC, 0.45° up); then faster toward dawn (01:17 UTC at 11.67 s, the sun about 10° down).
const suhailUTC = t => t < 8.333 ? (59.5 + 9.167 * (t / 8.333)) / 60 : (68 + 40 / 60 + (t - 8.333) * 2.5) / 60;
const SUHAIL_CAM = t => camPath([{ t: 0, s: 1, px: 960, py: 560, sx: 960, sy: 560 }, { t: 11.667, s: 1.10, px: 960, py: 700, sx: 960, sy: 640 }], t);
function suhailArt(t) {
  const J = jdUTC(2026, 8, 24, suhailUTC(t)), c = BRIGHT_STARS.find(s => s[3] === 'Canopus'), [alt, az] = altAz(c[0], c[1], J);
  return skyXY(alt, az, SUHAIL_VIEW);
}
function suhailScreen(t) { // where Suhail is on screen (film time = scene time: the scene starts at 0)
  const [x, y] = suhailArt(t), c = SUHAIL_CAM(t);
  return [c.sx + (x - c.px) * c.s, c.sy + (y - c.py) * c.s];
}

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
    // two ridges of dunes between the horizon and the near dune (about 180 m and 40 m off), then the near dune itself:
    // its broad crest on the left, above the far horizon, falling away to the right below it, clear of Suhail
    const ridge = (x0, y0, amp, f, ph) => { const pts = []; for (let x = x0; x <= W + 40; x += 20) pts.push([x, y0 + amp * Math.sin(x * f + ph) + 0.4 * amp * Math.sin(x * f * 2.7 + ph * 2)]); return pts; };
    this.ridges = [ridge(540, 834, 5, 0.006, 1.1), ridge(800, 874, 9, 0.004, 2.3)].map(pts => ({ crest: new P(pts), fill: new P(pts.concat([[W + 40, H + 20], [pts[0][0], H + 20]]), true) }));
    const near = [[-40, 812], [120, 801], [300, 792], [430, 788.5], [560, 787.5], [680, 790], [780, 800], [880, 826], [980, 868], [1080, 918], [1180, 975], [1280, 1040], [1340, 1100]];
    this.nearPts = near;
    this.near = suhailSpline(near.concat([[1340, 1150], [-40, 1150]]), true, 6);
    this.nearCrest = new P(suhailSpline(near, false, 6).pts.slice(0, (near.length - 1) * 6 + 1));
    // wind ripples on the near face, parallel to the crest, fading downhill
    this.ripples = Array.from({ length: 12 }, (_, i) => { const d = 7 + i * (5 + i * 1.1); return new P(this.nearCrest.pts.filter((q, j) => j % 2 === 0).map(([x, y]) => [x, y + d + 1.2 * Math.sin(x * 0.05 + i)])); });
    // the man and his couched camel, in metres (x forward, toward Suhail; y up), set on the crest
    const k = SUHAIL_MAN.k, on = x => yOn(near, x);
    const place = (pts, x0) => pts.map(([x, y]) => [x0 + x * k, on(x0) - y * k]);
    this.camel = suhailSpline(place([[-1.15, 0], [-1.22, 0.18], [-1.18, 0.42], [-1.05, 0.66], [-0.85, 0.86], [-0.6, 1.08], [-0.3, 1.26], [-0.05, 1.33], [0.2, 1.27],
      [0.42, 1.12], [0.6, 1.0], [0.78, 0.94], [0.98, 0.95], [1.14, 1.04], [1.26, 1.2], [1.33, 1.4], [1.37, 1.58], [1.39, 1.67], [1.43, 1.63], [1.52, 1.66],
      [1.66, 1.63], [1.8, 1.56], [1.88, 1.5], [1.87, 1.44], [1.78, 1.41], [1.6, 1.4], [1.47, 1.36], [1.4, 1.22], [1.33, 1.02], [1.22, 0.8], [1.08, 0.62],
      [0.98, 0.46], [1.02, 0.3], [1.1, 0.14], [1.02, 0.02], [0.9, -0.03], [-1.15, -0.03]], SUHAIL_CAMEL.x), true, 6);
    // the man: the kandura falling to the ankles; the ghutra over the head (the agal flattening its top), its back flap
    // hanging behind the shoulders and its front flap in front of them, so head and shoulders make the ghutra's A
    this.man = suhailSpline(place([[-0.17, -0.02], [-0.2, 0.05], [-0.19, 0.35], [-0.17, 0.7], [-0.16, 1.0], [-0.18, 1.18], [-0.24, 1.28], [-0.25, 1.38],
      [-0.2, 1.52], [-0.14, 1.64], [-0.07, 1.72], [0.02, 1.745], [0.08, 1.73], [0.115, 1.69], [0.12, 1.655], [0.125, 1.64], [0.145, 1.605], [0.13, 1.59],
      [0.135, 1.57], [0.125, 1.55], [0.16, 1.48], [0.18, 1.36], [0.17, 1.26], [0.15, 1.2], [0.2, 1.06], [0.21, 0.98], [0.15, 0.95], [0.15, 0.8],
      [0.17, 0.4], [0.2, 0.05], [0.23, -0.02]], SUHAIL_MAN.x), true, 6);
    this.stick = new P(place([[0.2, 1.02], [0.34, -0.02]], SUHAIL_MAN.x));
    this.stars = BRIGHT_STARS.map(([ra, dec, V, name, ar], i) => ({ ra, dec, V, name, ar, ph: (i * 2.399) % TAU }));
    this.suhail = this.stars.find(s => s.name === 'Canopus');
  },
  J(t) { return jdUTC(2026, 8, 24, suhailUTC(t)); },
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
    if (OPT.colour) { // the same twilight in colour: a warm band low in the east under a violet one, growing with the sun
      const c = 0.25 + 0.75 * tw;
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const band = ctx.createLinearGradient(0, SUHAIL_VIEW.hz - 330, 0, SUHAIL_VIEW.hz);
      band.addColorStop(0, 'rgba(0,0,0,0)'); band.addColorStop(0.55, `rgba(92,70,140,${0.22 * c})`); band.addColorStop(1, `rgba(236,138,92,${0.42 * c})`);
      ctx.fillStyle = band; ctx.fillRect(0, SUHAIL_VIEW.hz - 330, W, 330);
      const east = ctx.createRadialGradient(-220, SUHAIL_VIEW.hz, 0, -220, SUHAIL_VIEW.hz, 1400); // strongest in the east, off the left edge
      east.addColorStop(0, `rgba(240,150,96,${0.34 * c})`); east.addColorStop(0.5, `rgba(150,96,140,${0.14 * c})`); east.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = east; ctx.fillRect(0, 0, W, H);
      ctx.restore();
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
      // low in the sky Suhail twinkles and shifts colour through the long path of air; the effect dies away as it climbs
      const low = 1 - clamp((sa - 0.5) / 4), fl = 0.5 * Math.sin(t * 5.3) + 0.3 * Math.sin(t * 8.1 + 1.3) + 0.2 * Math.sin(t * 3.7 + 2.1);
      const k = (1 + 0.06 * Math.sin(t * 2.3)) * (1 + 0.14 * low * fl), hue = low * (0.5 + 0.5 * Math.sin(t * 2.9 + 0.7));
      const col = `rgb(255,${Math.round(217 - 70 * hue)},${Math.round(160 - 60 * hue)})`;
      fill(starP(hx, hy, 17 * rise * k, 5 * rise, 8, -Math.PI / 2), col, 0.9 * rise);
      this.suhailXY = [hx, hy];
    }
    // the land: a dark desert with the first light on the dune crests, nearer ridges darker (the air between lightens the
    // far ones), then the near dune with its ripples, and the man and his camel on its crest
    const solid = (path, col, a = 1) => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore(); };
    const [cLand, cRidge0, cRidge1, cNear] = OPT.colour ? ['#110C16', '#0E0A14', '#0B0811', '#08060D'] : ['#04050A', '#04060B', '#030409', '#020307'];
    solid(this.land, cLand, 0.96);
    const cq = easeInOut(prog(t, 0.4, 2.4));
    stroke(this.crest, cq, INK, 1.2, 0.35 + 0.35 * tw);
    this.ridges.forEach((r, i) => { solid(r.fill, i ? cRidge1 : cRidge0); stroke(r.crest, cq, INK, 1, (0.14 + 0.16 * tw) * (i ? 0.8 : 1)); });
    solid(this.near, cNear);
    ctx.save(); ctx.beginPath(); this.near.trace(ctx, 1); ctx.clip();
    this.ripples.forEach((r, i) => stroke(r, cq, INK, 1, (0.05 + 0.07 * tw) * (1 - i / 13)));
    ctx.restore();
    stroke(this.nearCrest, cq, INK, 1.3, 0.3 + 0.3 * tw);
    // the rim of light: the silhouette laid in pale light a little toward the east and up, then in dark over it
    const figs = [this.camel, this.man];
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (0.22 + 0.4 * tw) * cq; ctx.fillStyle = '#C9B28E';
    ctx.translate(-1.2, -0.6); ctx.beginPath(); figs.forEach(f => f.trace(ctx, 1)); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#C9B28E'; ctx.beginPath(); this.stick.trace(ctx, 1); ctx.stroke(); ctx.restore();
    figs.forEach(f => solid(f, '#020307'));
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#020307'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath(); this.stick.trace(ctx, 1); ctx.stroke(); ctx.restore();
  },
});
