'use strict';
// The finale: the same star, twenty years on. The real sky over Abu Dhabi on a March 2027 evening
// (15 March, 20:00 Gulf time, time-lapsed a little), facing due south: Suhail stands about 12° up in the
// south with Sirius high above it. Checked: at 16:00 UTC on 15 Mar 2027 Canopus is at altitude 12.2°, azimuth 187°;
// Sirius 48.4°, 189°.
// The viewpoint is real: the Marina beside Marina Mall (24.4769 N, 54.3225 E), looking south across the water.
//   Etihad Towers (24.4593 N, 54.3213 E): 1.96 km at bearing 183.6°; at 17 px a degree that is 0.497 px a metre, so the
//   305 m tower stands 8.9° (151 px) high and Suhail, at 12.2°, clears it just above and to its right.
//   Emirates Palace (24.4619 N, 54.3167 E): 1.76 km at bearing 199.6°, 0.553 px a metre, a long low front (about 1 km).
//   Nation Towers (24.4639 N, 54.3281 E): 1.55 km at bearing 158.8°, 0.627 px a metre; 268 m and 233 m, bridge at 202 m.
// These are the tall landmarks in the frame (bearings 129.5°-242.5°); the lower towers of Khalidiya and Al Bateen are
// left out, and The Landmark and the World Trade Center stand east of the frame.
// Revision 11 (?rev11), at the requester's direction (2 Oct 2026), is no longer the view from Marina Mall: it is a symbolic
// skyline of the seven emirates standing together under the same computed sky, a landmark of each, set right to left in
// the constitutional order (Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah), the way Arabic is
// read. Suhail is not drawn in it (nor its halo, rings, label or the ?heritage Sirius halo). NCM's King Air C90 crosses it
// right to left at one steady altitude after the dissolve, and leaves as the title arrives; after it has passed, gentle
// rain falls from a band of cloud over the Hajar beyond the city, never on the landmarks (ghayth). See FIN11 below.
const FINALE_VIEW = { az0: 186, pxDeg: 17, hz: 905 };
// Revision 11's frieze, in depth. One eye 14 m above the water; every object's size and the line it stands on follow from
// its distance (base = horizon + eye x scale), so the frieze has true perspective although its order is symbolic:
//   kT 0.31 px/m, the towers' bank (one scale for every tower, so their heights are true to each other: Burj Khalifa's
//     828 m is 257 px, its spire tip at y 653, 64 px under the aircraft's lowest point and clear of the lockup's box)
//   kP 0.55 px/m, the two palaces (Emirates Palace, Qasr Al Watan), a little nearer: low and about 300 m-1 km long, they are
//     drawn on a bank of their own in front of Abu Dhabi's towers so that they read (at kT their domes would be 19 px)
//   kD 1.3 px/m, Dhayah's hill, nearer; kN 3.4 px/m, the nearer bank of the heritage forts (11x nearer than the towers)
//   kM 0.047 px/m, the Hajar and the cloud over it (far: the 1,796 m crest by Jebel Jais is 84 px; the cloud base 2.3 km)
// The aircraft is drawn at its own distance (FIN11.air): 13.8 px/m (its 15.3 m span would be 211 px seen from below; seen 18
// degrees up from its left side, nose turned 28 degrees toward the eye, its wingtip lights stand 116 px apart and it is
// 153 x 62 px overall), its top 15 px under the lockup's lowest ink (y 506) where it passes beneath it.
const FIN11 = { eye: 14, kT: 0.31, kP: 0.55, kD: 1.3, kN: 3.4, kM: 0.047,
  // centres (scene x), right to left in the constitutional order
  x: { qasr: 1795, palace: 1500, etihad: 1455, adnoc: 1385, nation: 1325, aldar: 1243, bk: 1165, baa: 1070,
    sharjah: 931, ajman: 728, uaq: 544, fujairah: 346, dhayah: 125 },
  // the King Air: model yaw toward the eye (deg), elevation of the eye's view (deg), focal length (px), path height (scene y),
  // and the scene-clock times its nose enters the frame on the right and its tail leaves on the left (the dissolve into the
  // finale ends at 1.5; the title begins at 5.0)
  air: { yaw: 28, elev: 18, f: 1450, y: 563, tIn: 1.6, tOut: 5.0 } };
FIN11.yT = FINALE_VIEW.hz + FIN11.eye * FIN11.kT;
FIN11.yP = FINALE_VIEW.hz + FIN11.eye * FIN11.kP;
FIN11.yD = FINALE_VIEW.hz + FIN11.eye * FIN11.kD;
FIN11.yN = FINALE_VIEW.hz + FIN11.eye * FIN11.kN;
// Burj Khalifa's elevation, from the OpenStreetMap 3D model of its 37 building parts (each wing tier's footprint and
// height; via Overture Maps 2026-09-23.1 building_part) seen toward azimuth 120: [metres across, metres up], a step outline
// with its spiral setbacks, the core rising to the spire and the pinnacle at 828 m
FIN11.bk = [[-72, 0], [-72, 15], [-51, 15], [-51, 35], [-43, 35], [-43, 105], [-36, 105], [-36, 200], [-29.5, 200], [-29.5, 315],
  [-23, 315], [-23, 460], [-17, 460], [-17, 545], [-13, 545], [-13, 605], [-10.5, 605], [-10.5, 660], [-7.5, 660], [-7.5, 710],
  [-4.5, 710], [-4.5, 720], [-1.5, 720], [-1.5, 740], [-0.5, 740], [-0.5, 828], [1, 828], [1, 760], [4.5, 760], [4.5, 710],
  [8.5, 710], [8.5, 700], [9.5, 700], [9.5, 625], [14, 625], [14, 580], [15.5, 580], [15.5, 520], [23.5, 520], [23.5, 360],
  [32, 360], [32, 235], [39.5, 235], [39.5, 130], [48, 130], [48, 35], [57.5, 35], [57.5, 15], [86, 15], [86, 0]];
// The Hajar's crest inside the UAE, north (left) to south (right), lat 26.06 to 24.80 N every 0.01 degree: the highest UAE
// ground east of 55.75 E in each row (m), from AWS Terrain Tiles (z11, SRTM-derived; Omani ground ignored, as in
// data/build/rak_skyline.py). Its length is compressed to the frieze; its heights are at the cloud's scale (kM).
FIN11.crest = [892,1243,1180,1239,1556,1341,1543,1163,1578,1697,1771,1796,1686,1411,1531,1359,1214,1176,1262,1419,1229,865,908,
  568,601,719,896,1096,1337,1113,1058,872,985,943,533,979,1208,1198,1288,1369,1364,1466,1383,1022,969,912,956,895,724,799,512,
  540,445,535,543,579,552,562,710,669,979,779,792,760,619,680,782,699,726,862,894,733,829,851,937,997,867,829,731,675,597,553,
  693,676,747,758,864,722,802,683,601,644,789,835,791,837,884,881,877,944,821,963,906,871,979,854,869,870,756,644,672,736,637,
  708,486,575,425,574,622,844,618,645,603,514,408,491,649];
scene({
  id: 'finale', night: true, ringT: 2.47,
  init() {
    this.stars = BRIGHT_STARS.map(([ra, dec, V, name], i) => ({ ra, dec, V, name, ph: (i * 2.399) % TAU }));
    this.suhail = this.stars.find(s => s.name === 'Canopus');
    // the five Etihad Towers, borrowed from the homes plate (drawn there at 1.155 px a metre from CTBUH heights) and
    // rescaled to their true angular size from the viewpoint
    const tmp = {}; SCENE_DEFS.get('homes').init.call(tmp);
    const V = FINALE_VIEW, xs = b => b.body.pts.map(p => p[0]);
    this.towers = tmp.sky.filter(b => !b.palace && Math.min(...xs(b)) >= 1620 && Math.max(...xs(b)) <= 1790);
    this.etihad = { k: 0.497 / 1.155, px: 1703, base: tmp.base, sx: skyXY(0, 183.6, V)[0] };
    // Nation Towers (plate x 1442-1538, with the sky bridge), at their own distance and bearing
    this.nationT = tmp.sky.filter(b => !b.palace && Math.min(...xs(b)) >= 1440 && Math.max(...xs(b)) <= 1540);
    this.nation = { k: 0.627 / 1.155, px: 1490, base: tmp.base, sx: skyXY(0, 158.8, V)[0] };
    // Emirates Palace at 0.553 px a metre: wings 18 m, central block 34 m, the great dome to about 60 m, small domes
    const pk = 0.553, pcx = skyXY(0, 199.6, V)[0], hz = V.hz, m = h => hz - h * pk, half = 13 * V.pxDeg;
    this.palace = new P([[pcx - half, hz], [pcx - half, m(14)], [pcx - half * 0.72, m(18)], [pcx - 60, m(18)], [pcx - 60, m(34)], [pcx + 60, m(34)], [pcx + 60, m(18)], [pcx + half * 0.72, m(18)], [pcx + half, m(14)], [pcx + half, hz]], true);
    this.palaceDome = el(pcx, m(34), 22 * pk * 1.1, 26 * pk * 1.1, Math.PI, TAU, 730, 0.1);
    this.palaceDomes = [-0.62, -0.35, 0.35, 0.62].map((f, i) => el(pcx + f * half, m(18), 7 * pk, 8 * pk, Math.PI, TAU, 732 + i, 0));
    // lit windows: on the towers (in plate coordinates) and along the palace front
    const r = rng(77);
    this.windows = this.towers.map(b => {
      const x = xs(b), x0 = Math.min(...x), x1 = Math.max(...x), top = Math.min(...b.body.pts.map(p => p[1])), lights = [];
      for (let y = tmp.base - 12; y > top + 10; y -= 11) for (let xx = x0 + 5; xx < x1 - 4; xx += 8) if (r() < 0.3) lights.push([xx, y, r()]);
      return lights;
    });
    this.nationWin = this.nationT.map(b => {
      const x = xs(b), x0 = Math.min(...x), x1 = Math.max(...x), ys = b.body.pts.map(p => p[1]), top = Math.min(...ys), lights = [];
      // within the body only (the sky bridge hangs in the air)
      for (let y = Math.max(...ys) - 12; y > top + 10; y -= 11) for (let xx = x0 + 5; xx < x1 - 4; xx += 8) if (r() < 0.3) lights.push([xx, y, r()]);
      return lights;
    });
    this.palaceLights = Array.from({ length: 70 }, () => [pcx - half * 0.95 + r() * half * 1.9, m(4 + r() * 10), r()]);
    // Revision 11 (?rev11): the symbolic skyline of the seven emirates (initR11). Its geometry and lights use their own
    // random streams, so the approved frame is unchanged.
    this.r11 = typeof REV11 !== 'undefined' && REV11;
    if (this.r11) this.initR11(tmp);
  },
  J(t) { return jdUTC(2027, 3, 15, 15.75 + 0.5 * clamp(this.hold ? 1 : t / (this.dur * (this.speed || 1)))); },
  // the azimuth gap between Sirius and Canopus (deg) at the moment the film's gold ring closes (the same sky in the holds)
  plumb() {
    if (this._plumb == null) {
      const span = this.hold ? (this.endT || this.dur) : this.dur * (this.speed || 1), J = jdUTC(2027, 3, 15, 15.75 + 0.5 * clamp(this.ringT / span));
      const c = this.stars.find(q => q.name === 'Canopus'), si = this.stars.find(q => q.name === 'Sirius');
      this._plumb = Math.abs(altAz(si.ra, si.dec, J)[1] - altAz(c.ra, c.dec, J)[1]);
    }
    return this._plumb;
  },
  // In the stage hold (hold: true, loop: seconds) the sky stands still, everything is fully drawn, and every
  // motion is periodic in the loop length, so the rendered loop joins seamlessly.
  // in a hold every twinkle is periodic in the loop, and starts from its phase at the film's last frame (endT)
  tw(t, ph, rate) { return this.hold ? Math.sin(TAU * Math.round(rate * this.loop / TAU) * t / this.loop + ph + rate * (this.endT || 0)) : Math.sin(t * rate + ph); },
  draw(t0) {
    // Revision 11 draws its own frame (drawR11); the approved frame below is unchanged
    if (this.r11) return this.drawR11(t0);
    const t = this.hold ? 99 : t0, J = this.J(t), fade = easeOut(prog(t, 0.3, 2.5));
    this.stars.forEach(s => {
      const [alt, az] = altAz(s.ra, s.dec, J);
      if (alt < 0) return;
      const [x, y] = skyXY(alt, az, FINALE_VIEW);
      if (x < -20 || x > W + 20 || y < -20) return;
      const hero = s === this.suhail, m = s.V + 0.1 * (airmass(alt) - 1);
      if (m > 6.2) return;
      const underWords = !hero && ((y > 120 && y < 345 && x > 160 && x < 1760) || (y > 340 && y < 530 && x > 660 && x < 1260));
      const rad = Math.max(0.8, 3.7 - 0.6 * m) * (1 + 0.06 * this.tw(t0, s.ph, 3.1)), al = clamp((6.6 - m) / 3.4) * fade * (underWords ? 0.12 : 1);
      disc(x, y, rad, hero ? '#FFE6B8' : INK, al);
      if (m < 2 && !hero) { const L = 3 + (2 - m) * 4, sw = OPT.heritage && s.name === 'Sirius' ? 1.0 : 0.8; stroke(new P([[x - L, y], [x + L, y]]), 1, INK, sw, 0.5 * al); stroke(new P([[x, y - L], [x, y + L]]), 1, INK, sw, 0.5 * al); }
      if (hero) this.suhailXY = [x, y];
      // ?heritage: as the gold ring closes, the computed sky puts al-Shi'ra (Sirius) straight above Suhail. Ibrahim Al Jarwan
      // notes that al-Shi'ra and Suhail stand one above the other over the southern horizon after sunset as spring arrives,
      // about 20 March (WAM, 4 Aug 2020). A soft halo, from the ring's close, lets the eye find it; it is drawn only if the
      // sky really aligns them then (within 1 deg: the date is not yet fixed), and eases to half by the film's end, which
      // the stage holds keep (the pair leans 7 deg by 20:15). No line between them (it would read as a trail), no label.
      if (OPT.heritage && s.name === 'Sirius' && this.plumb() < 1) {
        const span = this.hold ? (this.endT || this.dur) : this.dur * (this.speed || 1);
        const hq = easeInOut(prog(t, this.ringT, 2.0)) * (1 - 0.5 * easeInOut(prog(t, this.ringT + 2.5, span - this.ringT - 2.5)));
        if (hq > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(x, y, 0, x, y, 44);
          g.addColorStop(0, `rgba(215,228,255,${0.3 * hq})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 44, y - 44, 88, 88); ctx.restore(); }
      }
    });
    if (this.suhailXY) {
      const [hx, hy] = this.suhailXY, q = easeOut(prog(t, 1.2, 2.0)), k = 1 + 0.06 * this.tw(t0, 0, 2.3);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 120);
      halo.addColorStop(0, `rgba(255,214,150,${0.45 * q})`); halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo; ctx.fillRect(hx - 120, hy - 120, 240, 240); ctx.restore();
      fill(starP(hx, hy, 19 * q * k, 5.5 * q, 8, -Math.PI / 2), '#FFD9A0', 0.9 * q);
      // a gold ring draws itself around Suhail: the turning circle, closed
      const rp = this.hold ? 1 : easeInOut(prog(t, this.ringT - 1.6, 1.6)); // closes at ringT
      if (rp > 0) { stroke(el(hx, hy, 46, 46, -Math.PI / 2, -Math.PI / 2 + TAU * rp, 780, 0.4), 1, GOLD, 1.6, 0.8); stroke(el(hx, hy, 54, 54, -Math.PI / 2, -Math.PI / 2 - TAU * rp, 781, 0.4), 1, GOLD, 0.8, 0.5); }
      // the outer ring keeps turning, slowly, like the sky (one turn per loop in the hold)
      if (rp >= 1) { const turn = this.hold ? (this.endT || 0) * 0.12 + TAU * t0 / this.loop : t0 * 0.12; stroke(el(hx, hy, 62, 62, turn, turn + TAU, 782, 0), 1, GOLD, 0.8, 0.35, [2, 7], 0); }
    }
    // the city glow on the horizon, then the Corniche in silhouette with its windows lit
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createLinearGradient(0, FINALE_VIEW.hz - 200, 0, FINALE_VIEW.hz);
    glow.addColorStop(0, 'rgba(0,0,0,0)'); glow.addColorStop(1, `rgba(120,90,70,${0.35 * fade})`);
    ctx.fillStyle = glow; ctx.fillRect(0, FINALE_VIEW.hz - 200, W, 200);
    if (OPT.colour) { // colour: the city's warm glow under a violet band (20:00, long after sunset: no twilight is painted)
      const cg = ctx.createLinearGradient(0, FINALE_VIEW.hz - 340, 0, FINALE_VIEW.hz);
      cg.addColorStop(0, 'rgba(0,0,0,0)'); cg.addColorStop(0.5, `rgba(96,72,150,${0.2 * fade})`); cg.addColorStop(1, `rgba(236,146,92,${0.42 * fade})`);
      ctx.fillStyle = cg; ctx.fillRect(0, FINALE_VIEW.hz - 340, W, 340);
    }
    ctx.restore();
    const cq = easeOut(prog(t, 0.2, 2.0)), hz = FINALE_VIEW.hz, E = this.etihad;
    const sil = (path, lw = 1.1) => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = cq; ctx.fillStyle = OPT.colour ? '#070A18' : '#05060B'; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore(); stroke(path, cq, INK, lw, 0.2); };
    const lamp = (x, y, a, w = 2, h = 3) => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.fillStyle = '#F2C97A'; ctx.fillRect(x, y, w, h); ctx.restore(); };
    // the low shore across the water
    sil(new P([[0, hz], [0, hz - 5], [W, hz - 4], [W, hz]], true), 0.8);
    // Emirates Palace, then the Etihad Towers in front of it (they stand nearer)
    sil(this.palace); sil(this.palaceDome); this.palaceDomes.forEach(d => sil(d, 0.8));
    this.palaceLights.forEach(([x, y, v]) => { const on = prog(t, 0.8 + v * 2.5, 0.6); if (on > 0) lamp(x, y, 0.5 * on * (0.5 + 0.5 * v), 2, 2); });
    const N = this.nation;
    ctx.save(); ctx.translate(N.sx - N.px * N.k, hz - N.base * N.k); ctx.scale(N.k, N.k);
    this.nationT.forEach(b => sil(b.body, 2.0));
    this.nationWin.forEach(ws => ws.forEach(([x, y, v]) => { const on = prog(t, 1.2 + v * 3, 0.6); if (on > 0) lamp(x, y, 0.6 * on * (0.6 + 0.4 * v), 4, 6); }));
    ctx.restore();
    ctx.save(); ctx.translate(E.sx - E.px * E.k, hz - E.base * E.k); ctx.scale(E.k, E.k);
    this.towers.forEach(b => sil(b.body, 2.4));
    this.windows.forEach(ws => ws.forEach(([x, y, v]) => { const on = prog(t, 1.0 + v * 3, 0.6); if (on > 0) lamp(x, y, 0.6 * on * (0.6 + 0.4 * v), 4, 6); }));
    ctx.restore();
    // the water in front: dark, with each light's reflection drawn down as a faint, shimmering column
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = OPT.colour ? '#0A1230' : '#04050A'; ctx.fillRect(0, hz, W, H - hz); ctx.restore();
    stroke(ln(0, hz, W, hz, 790, 0.4), fade, INK, 1, 0.25);
    const refl = (x, a, len, ph) => { const s = 0.5 + 0.5 * this.tw(t0, ph, 1.7); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a * (0.6 + 0.4 * s); const g = ctx.createLinearGradient(0, hz, 0, hz + len); g.addColorStop(0, '#F2C97A'); g.addColorStop(1, 'rgba(242,201,122,0)'); ctx.fillStyle = g; ctx.fillRect(x - 1, hz + 2, 2, len); ctx.restore(); };
    const rq = cq * easeOut(prog(t, 2.0, 2.0));
    this.windows.forEach((ws, i) => ws.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(E.sx + (x - E.px) * E.k, 0.16 * rq, 40 + 60 * v, v * 6.28); }));
    this.palaceLights.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(x, 0.1 * rq, 25 + 30 * v, v * 6.28); });
    this.nationWin.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(N.sx + (x - N.px) * N.k, 0.16 * rq, 40 + 60 * v, v * 6.28 + 1); }));
    // hold C (behind speeches): the whole frame dimmed
    if (this.dim) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },

  // ---------- Revision 11: the seven emirates under one sky (FIN11) ----------
  initR11(tmp) {
    const F = FIN11, hz = FINALE_VIEW.hz, X = F.x;
    // a landmark's own frame: metres across from its centre (x) and up from its base (z), at its bank's scale
    const G = (cx, base, k) => ({ X: m => cx + m * k, Y: z => base - z * k, k, cx, base });
    const poly = (g, pts) => new P(pts.map(([x, z]) => [g.X(x), g.Y(z)]), true);
    const rect = (g, x0, x1, z0, z1) => poly(g, [[x0, z0], [x0, z1], [x1, z1], [x1, z0]]);
    // a coral-and-gypsum tower narrows a little as it rises (b: the batter, as a share of its width on each side)
    const batter = (g, x0, x1, z0, z1, b = 0.04) => { const d = (x1 - x0) * b; return poly(g, [[x0, z0], [x0 + d, z1], [x1 - d, z1], [x1, z0]]); };
    // shurfat: the pointed merlons along a parapet, w wide and h tall, every s metres
    const merlons = (g, x0, x1, z, w = 1.0, h = 0.9, s = 1.7) => {
      const out = [], n = Math.max(1, Math.round((x1 - x0) / s)), st = (x1 - x0) / n;
      for (let i = 0; i < n; i++) { const c = x0 + (i + 0.5) * st; out.push(poly(g, [[c - w / 2, z - 0.05], [c - w / 2, z + h * 0.5], [c, z + h], [c + w / 2, z + h * 0.5], [c + w / 2, z - 0.05]])); }
      return out;
    };
    const piece = (p, kind = 'flat') => { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); return { p, kind, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; };
    // a fort: its pieces back to front (each floodlit by its form: a round tower across its width, a wall from below), its
    // merlons, its openings (dark) and its fine lines (a tower's flutes)
    const fort = (g, col, build) => { const f = { g, col, pieces: [], merl: [], holes: [], lines: [] }; build(f); return f; };
    const r = rng(2028);

    // Sharjah · Al Hisn (Sharjah Fort, 1820; rebuilt 1996-97 on its plan, with its saved doors): two storeys of coral stone
    // in light brown plaster round a courtyard; the fluted polygonal Al Mahalwasa tower (three floors), the square tower
    // over the square, and Al Kabs, the round tower of two sections at the far right that survived the 1970 demolition
    // (12 m); the outer wall over 4 m. Floodlit at night in the Heart of Sharjah.
    const gS = G(X.sharjah, F.yN, F.kN);
    this.forts = [];
    this.forts.push(fort(gS, '#EBCB98', f => {
      f.pieces.push(piece(rect(gS, -17, 16, 0, 8)), piece(rect(gS, 3, 10, 0, 11.5)));
      f.pieces.push(piece(batter(gS, -24.5, -17, 0, 15, 0.05), 'round'), piece(batter(gS, 15.5, 25, 0, 9, 0.03), 'round'), piece(rect(gS, 17, 23.5, 8.9, 12), 'round'));
      f.merl.push(...merlons(gS, -17, 3, 8), ...merlons(gS, 10, 15.5, 8), ...merlons(gS, 3, 10, 11.5), ...merlons(gS, -24.1, -17.4, 15), ...merlons(gS, 17, 23.5, 12));
      f.holes.push(poly(gS, [[-8, 0], [-8, 3.4], [-5.5, 4.5], [-3, 3.4], [-3, 0]]));
      [-14.5, -11, 0, 12.6].forEach(x => f.holes.push(rect(gS, x, x + 1.3, 5, 6.5)));
      f.holes.push(rect(gS, -21.2, -20.4, 11, 12.6), rect(gS, -21.2, -20.4, 6, 7.4), rect(gS, 19.8, 20.7, 9.8, 11.2), rect(gS, 19.8, 20.7, 4.5, 6), rect(gS, 6, 7, 8, 9.6));
      [-23.2, -21.9, -19.6, -18.3].forEach(x => f.lines.push(new P([[gS.X(x), gS.Y(0.4)], [gS.X(x + (x < -20.7 ? 0.2 : -0.2)), gS.Y(14.6)]])));
    }));
    // Ajman · Ajman Fort (about 1775; Ajman Museum since 1991): two storeys of coral stone, 2,500 square metres; the gate
    // between its two watchtowers, the round one the taller, the other square; two barjeel (wind towers) on the roof, one
    // held to be the oldest in the UAE; cannons before the gate. Floodlit in the heritage district.
    const gA = G(X.ajman, F.yN, F.kN);
    this.forts.push(fort(gA, '#E8C38E', f => {
      f.pieces.push(piece(rect(gA, -22, -18.5, 7.4, 12.6)), piece(rect(gA, 15.5, 19, 7.4, 12.2)));
      f.pieces.push(piece(rect(gA, -26, 26, 0, 7.5)), piece(batter(gA, -13, -6, 0, 13.5, 0.05), 'round'), piece(rect(gA, 3, 9.5, 0, 11.5)));
      f.merl.push(...merlons(gA, -26, -13, 7.5), ...merlons(gA, -6, 3, 7.5), ...merlons(gA, 9.5, 26, 7.5), ...merlons(gA, -12.7, -6.3, 13.5), ...merlons(gA, 3, 9.5, 11.5));
      f.merl.push(rect(gA, -22.4, -18.1, 12.6, 13.1), rect(gA, 15.1, 19.4, 12.2, 12.7));
      f.holes.push(poly(gA, [[-4, 0], [-4, 3.8], [-1, 4.9], [2, 3.8], [2, 0]]));
      [[-21.4, -20.8], [-19.7, -19.1], [16.1, 16.7], [17.8, 18.4]].forEach(([a, b]) => f.holes.push(rect(gA, a, b, 8.6, 12)));
      f.holes.push(rect(gA, -10, -9.1, 9.6, 11.2), rect(gA, -10, -9.1, 5, 6.4), rect(gA, 5.8, 6.7, 7.5, 9), rect(gA, -22, -20.7, 3, 4.4), rect(gA, 14, 15.3, 3, 4.4));
    }));
    // Umm Al Quwain · Al Ali Fort (1768; UAQ National Museum since 2000): whitewashed and low, square in plan, with a large
    // round tower on its western wall and a smaller round tower on a corner; floodlit at the entrance to the old town.
    const gU = G(X.uaq, F.yN, F.kN);
    this.forts.push(fort(gU, '#F1EADB', f => {
      f.pieces.push(piece(rect(gU, -18.5, 18.5, 0, 6)), piece(batter(gU, -17, -9, 0, 12.5, 0.06), 'round'), piece(batter(gU, 13, 18.5, 0, 8.5, 0.05), 'round'));
      f.merl.push(...merlons(gU, -9, 13, 6), ...merlons(gU, -16.6, -9.4, 12.5), ...merlons(gU, 13.3, 18.2, 8.5));
      f.holes.push(poly(gU, [[-2, 0], [-2, 3.3], [0.25, 4.2], [2.5, 3.3], [2.5, 0]]));
      f.holes.push(rect(gU, -13.5, -12.6, 9, 10.5), rect(gU, -13.5, -12.6, 4.6, 6), rect(gU, 15.3, 16.1, 4.6, 6), rect(gU, 6, 7.2, 2.6, 3.8), rect(gU, -7, -5.8, 2.6, 3.8));
    }));
    // Fujairah · Fujairah Fort (16th century, rebuilt 1650-1700): on a rocky hill about 20 m high, 2 km from the coast, with
    // the Hajar behind; three round towers and a square one, joined by walls, its outline irregular as its rock. Lit after
    // sunset.
    const gF = G(X.fujairah, F.yN, F.kN);
    this.fujRock = poly(gF, [[-31, 0], [-29.5, 1.6], [-28.6, 1.2], [-27.4, 3.4], [-26.2, 4.1], [-25.4, 6.6], [-24, 7.2], [-23.4, 9.8], [-22.1, 10.6], [-21.6, 13.2], [-20.4, 14.1], [-20.1, 16.6], [-19.2, 17.4], [-19, 19.9],
      [18.5, 19.9], [19.1, 18.2], [20.4, 17.5], [20.9, 15.2], [22.2, 14.4], [22.6, 12.1], [23.9, 11.2], [24.6, 8.9], [25.8, 8.1], [26.6, 5.6], [27.8, 4.9], [28.6, 2.6], [30, 1.8], [31, 0]]);
    this.fujCrags = [[[-24, 7.2], [-17, 5.5], [-9, 6.4]], [[-21.6, 13.2], [-13, 11.8], [-4, 12.6]], [[22.6, 12.1], [14, 10.9], [6, 11.6]], [[25.8, 8.1], [17, 6.2], [9, 7.0]], [[-28.6, 1.2], [-20, 2.4]], [[28.6, 2.6], [21, 3.4]]]
      .map(l => new P(l.map(([x, z]) => [gF.X(x), gF.Y(z)])));
    this.forts.push(fort(gF, '#E6C08A', f => {
      f.pieces.push(piece(batter(gF, -6, -0.5, 19.8, 29, 0.05), 'round'), piece(rect(gF, -16, 17, 19.8, 26.5)));
      f.pieces.push(piece(batter(gF, -19.5, -11.5, 19.8, 31, 0.06), 'round'), piece(rect(gF, 3, 9.5, 19.8, 34)), piece(batter(gF, 12, 17.5, 19.8, 30, 0.05), 'round'));
      f.merl.push(...merlons(gF, -11.5, -6, 26.5), ...merlons(gF, -0.5, 3, 26.5), ...merlons(gF, 9.5, 12, 26.5), ...merlons(gF, -5.7, -0.8, 29), ...merlons(gF, -19.1, -11.9, 31), ...merlons(gF, 3, 9.5, 34), ...merlons(gF, 12.3, 17.2, 30));
      f.holes.push(rect(gF, -16, -14.8, 27, 28.4), rect(gF, -16, -14.8, 23, 24.4), rect(gF, 5.7, 6.8, 30, 31.6), rect(gF, 5.7, 6.8, 25, 26.6), rect(gF, 14.3, 15.2, 26, 27.4), rect(gF, -3.5, -2.6, 26.8, 28));
      f.holes.push(poly(gF, [[0, 19.8], [0, 22.6], [1.2, 23.4], [2.4, 22.6], [2.4, 19.8]]));
    }));
    // Ras Al Khaimah · Dhayah Fort: the UAE's only remaining hilltop fort, on a hill about 70 m high between the palm
    // gardens and the Jebel Jais massif, reached by 239 zigzagging steps; a small mud-brick fort of the 19th century with
    // two towers ("twin-peaked"), restored in the late 1990s. It has no lighting at night, so it stands dark.
    const gD = G(X.dhayah, F.yD, F.kD);
    this.dhayah = {
      hill: poly(gD, [[-68, 0], [-58, 5], [-49, 11], [-41, 18], [-34, 26], [-27, 35], [-21, 45], [-15, 55], [-10, 63], [-7, 67.5], [-5, 70], [9, 70], [12, 65.5], [17, 57], [23, 47], [29, 37], [36, 27], [44, 18], [53, 10], [61, 4], [68, 0]]),
      fort: [rect(gD, -9, 10, 69.8, 75), batter(gD, -11, -5.5, 69.8, 79.5, 0.05), rect(gD, 6, 11, 69.8, 78.5)],
      steps: new P([[-34, 0], [-20, 10], [-30, 20], [-14, 30], [-22, 40], [-10, 50], [-12, 57], [-5, 65], [-4, 70]].map(([x, z]) => [gD.X(x), gD.Y(z)])),
    };

    // the far bank. Burj Khalifa (828 m), from its OSM 3D parts; lit windows in rows a floor-group apart
    const gB = G(X.bk, F.yT, F.kT), bkH = u => { const p = F.bk; for (let i = 0; i < p.length - 1; i++) if (p[i][1] === p[i + 1][1] && p[i][0] <= u && u < p[i + 1][0]) return p[i][1]; return 0; };
    this.bk = { g: gB, body: poly(gB, F.bk), win: [] };
    for (let z = 20; z < 580; z += 9.6) {
      let uL = null, uR = null; for (let u = -72; u <= 86; u += 0.5) if (bkH(u) >= z + 5) { if (uL === null) uL = u; uR = u; }
      if (uL === null || z < 36) continue;
      for (let u = uL + 2; u < uR - 1.5; u += 7.5) if (r() < 0.3) this.bk.win.push([gB.X(u), gB.Y(z), r()]);
    }
    // Burj Al Arab (321 m): the sail on its island 280 m offshore, seen from the north-east (Umm Suqeim), its fabric belly
    // to the left (the land, south-east) and its back and mast to the right (the sea): plan depth about 92 m at the base
    // (OSM footprint 97 x 88 m), the fabric wall 180 m tall and up to 50 m wide between the wings, the top of the
    // accommodation 197.5 m (Al Muntaha, cantilevered from the mast), the helipad at 210 m, the tubular mast 60 m above the
    // building to 321 m; the island 150 m a side and 7.5 m above the sea; the exoskeleton's diagonal trusses on the side.
    const gR = G(X.baa, F.yT, F.kT), back = 40, Dz = z => 92 * Math.sqrt(Math.max(0, 1 - Math.pow(z / 258, 2))), fw = z => 13 * Math.pow(Math.max(0, 1 - z / 188), 0.8);
    const front = []; for (let z = 7.5; z < 258; z += 5) front.push([back - Dz(z), z]);
    const fab = []; for (let z = 7.5; z <= 182; z += 5) fab.push([back - Dz(z), z]);
    const fabIn = fab.slice().reverse().map(([u, z]) => [u + fw(z), z]);
    this.baa = { g: gR, back,
      body: poly(gR, front.concat([[back, 258], [back, 7.5]])),
      mast: poly(gR, [[back - 5.3, 252], [back - 4.4, 321], [back - 1.1, 321], [back, 252]]),
      fabric: poly(gR, fab.concat(fabIn)),
      ribs: [22, 37, 52, 67, 82, 97, 112, 127, 142, 157, 172].map(z => new P([[gR.X(back - Dz(z)), gR.Y(z)], [gR.X(back - Dz(z) + fw(z)), gR.Y(z)]])),
      truss: [[[back - Dz(20) + 14, 20], [back, 100]], [[back, 20], [back - Dz(100) + 8, 100]], [[back - Dz(100) + 8, 100], [back, 178]], [[back, 100], [back - Dz(178) + 6, 178]]].map(l => new P(l.map(([u, z]) => [gR.X(u), gR.Y(z)]))),
      leg: new P([[gR.X(back), gR.Y(7.5)], [gR.X(back), gR.Y(258)]]),
      pad: el(gR.X(back + 13), gR.Y(211), 12 * F.kT, 1.3, 0, TAU, 840, 0),
      props: [new P([[gR.X(back + 7), gR.Y(210)], [gR.X(back), gR.Y(193)]]), new P([[gR.X(back + 19), gR.Y(210)], [gR.X(back + 1), gR.Y(186)]])],
      muntaha: rect(gR, back - 24, back + 4, 196.5, 201.5),
      island: poly(gR, [[-75, -1], [-72, 7.5], [72, 7.5], [75, -1]]),
      bridge: new P(quad([gR.X(-75), gR.Y(3.5)], [gR.X(-230), gR.Y(4)], [gR.X(-420), gR.Y(3)], 14)),
      win: [] };
    for (let z = 12; z < 192; z += 7) for (let u = back - Dz(z) + fw(z) + 3; u < back - 2; u += 6) if (r() < 0.26) this.baa.win.push([gR.X(u), gR.Y(z), r()]);
    this.baa.bridgeLamps = Array.from({ length: 16 }, (_, i) => this.baa.bridge.at(i / 15));
    // Aldar HQ (Al Raha Beach): a circle in elevation, 120.9 m across, its top 110 m up (so the circle runs on below the
    // ground), two convex glazed faces with an external steel diagrid, joined by the "zipper" band round its edge
    const gL = G(X.aldar, F.yT, F.kT), Rl = 60.45, zc = 110 - Rl, a0 = Math.asin(-zc / Rl);
    const circ = []; for (let i = 0; i <= 64; i++) { const a = a0 + (Math.PI - 2 * a0) * i / 64; circ.push([Rl * Math.cos(a), zc + Rl * Math.sin(a)]); }
    this.aldar = { g: gL, body: poly(gL, circ), zc, R: Rl, cx: gL.X(0), cy: gL.Y(zc) };
    // Etihad Towers, Nation Towers and ADNOC HQ: the homes plate's outlines (CTBUH heights at 1.155 px/m), at kT
    const kk = F.kT / 1.155, ab = tmp.sky.find(b => b.adnoc);
    this.tw11 = {
      etihad: { k: kk, px: 1705, base: tmp.base, sx: X.etihad },
      nation: { k: kk, px: 1490, base: tmp.base, sx: X.nation },
      adnoc: { k: kk, px: 1586, base: tmp.base, sx: X.adnoc, b: ab,
        hole: new P([[1569, tmp.base - 334 * 1.155], [1603, tmp.base - 334 * 1.155], [1603, tmp.base - 312 * 1.155], [1569, tmp.base - 312 * 1.155]], true) } };
    this.adnocWin = []; for (let y = tmp.base - 12; y > tmp.base - 312 * 1.155 + 8; y -= 11) for (let xx = 1572; xx < 1601; xx += 7) if (r() < 0.34) this.adnocWin.push([xx, y, r()]);
    // Emirates Palace: about 1 km long, its wings 14-18 m, the central block 34 m, the great dome to about 60 m (as above), at kP
    const pk = F.kP, pcx = X.palace, m = h => F.yP - h * pk, half = 400 * pk;
    this.pal11 = new P([[pcx - half, F.yP], [pcx - half, m(14)], [pcx - half * 0.72, m(18)], [pcx - 60 * pk / 0.553, m(18)], [pcx - 60 * pk / 0.553, m(34)], [pcx + 60 * pk / 0.553, m(34)], [pcx + 60 * pk / 0.553, m(18)], [pcx + half * 0.72, m(18)], [pcx + half, m(14)], [pcx + half, F.yP]], true);
    this.palDome11 = el(pcx, m(34), 22 * 1.1 * pk, 26 * 1.1 * pk, Math.PI, TAU, 730, 0.05);
    this.palDomes11 = [-0.62, -0.35, 0.35, 0.62].map((f, i) => el(pcx + f * half, m(18), 7 * pk, 8 * pk, Math.PI, TAU, 732 + i, 0));
    this.palLights11 = Array.from({ length: 70 }, () => [pcx - half * 0.95 + r() * half * 1.9, m(4 + r() * 10), r()]);
    // Qasr Al Watan: the great dome 37 m across, its crown 60 m up over the Great Hall, a wing to each side, at kP
    const qk = F.kP, qcx = X.qasr, qm = h => F.yP - h * qk, QX = mm => qcx + mm * qk;
    this.qasr11 = new P([[QX(-150), F.yP], [QX(-150), qm(15)], [QX(-112), qm(15)], [QX(-112), qm(19)], [QX(-50), qm(19)], [QX(-50), qm(24)],
      [QX(-18.5), qm(24)], [QX(-18.5), qm(41.5)], [QX(18.5), qm(41.5)], [QX(18.5), qm(24)], [QX(50), qm(24)], [QX(50), qm(19)],
      [QX(112), qm(19)], [QX(112), qm(15)], [QX(150), qm(15)], [QX(150), F.yP]], true);
    this.qasrDome11 = el(qcx, qm(41.5), 18.5 * qk, 18.5 * qk, Math.PI, TAU, 760, 0);
    this.qasrFinial11 = new P([[qcx - 0.4, qm(60)], [qcx, qm(64)], [qcx + 0.4, qm(60)]], true);
    this.qasrDomes11 = [-86, -64, 64, 86].map((x, i) => el(QX(x), qm(19), 6 * qk, 6.5 * qk, Math.PI, TAU, 761 + i, 0));
    this.qasrLights11 = Array.from({ length: 56 }, () => { const x = -146 + r() * 292; return [QX(x), qm(3 + r() * (Math.abs(x) < 50 ? 18 : 11)), r()]; });

    // the Hajar: the crest line north to south over x 0-1180 (behind the northern emirates and Hatta), down to the plain
    const n = F.crest.length, cx1 = 1180;
    this.crestPts = F.crest.map((h, i) => [i * cx1 / (n - 1), hz - h * F.kM]).concat([[cx1 + 18, hz - 12], [cx1 + 38, hz]]);
    this.hajar = new P([[0, hz + 1]].concat(this.crestPts, [[cx1 + 38, hz + 1]]), true);
    this.ridge = pl(this.crestPts, false, 850, 0.3);
    // the cloud over the Hajar: a band of cumulus congestus at the mountains' distance (kM: its flat base 2.3 km up, its
    // towers 4-5.5 km, tallest over the Ras Al Khaimah massif), built of overlapping turrets as the seeding plate's cloud is,
    // stacked from its base, each cut flat at the base
    const rc = rng(2029), cb = 798, cx0 = 14, cx1b = 1010;
    const prof = x => (34 + 116 * Math.exp(-Math.pow((x - 175) / 125, 2)) + 78 * Math.exp(-Math.pow((x - 565) / 110, 2)) + 48 * Math.exp(-Math.pow((x - 865) / 95, 2)))
      * Math.min(1, 0.45 + 0.55 * (x - cx0) / 60, 0.45 + 0.55 * (cx1b - x) / 60);
    const T = [];
    for (let x = cx0 + 10; x < cx1b - 8;) {
      const Hc = prof(x), r0 = clamp(0.27 * Hc, 12, 40);
      let y = cb - r0 * 0.5, rr = r0 * (0.92 + 0.16 * rc());
      T.push([x + (rc() - 0.5) * r0 * 0.3, y, rr]);
      while (y - rr > cb - Hc + rr * 0.35) {
        y -= rr * (0.7 + 0.2 * rc()); rr *= 0.86 + 0.12 * rc();
        T.push([x + (rc() - 0.5) * r0 * 0.7, Math.max(y, cb - Hc + rr * 0.95), rr]);
      }
      x += r0 * (0.78 + 0.3 * rc());
    }
    const turrets = T.sort((p1, p2) => p1[1] - p2[1]).map(([x, y, rr], i) => {
      const nn = 2 * Math.round(5 + rr / 10 + rc() * 3), ph = rc() * TAU;
      const puff = k => new P(Array.from({ length: 64 }, (_, j) => { const a2 = j / 64 * TAU, q = rr * (1 + 0.06 * Math.pow(Math.abs(Math.sin(nn * a2 / 2 + ph)), 0.6) - 0.03) + k; return [x + q * Math.cos(a2), y + q * 0.94 * Math.sin(a2)]; }), true);
      // the side away from the city's glow (upper left) stays open; the glow catches the lower right. A turret near the
      // cloud's top keeps a firmer edge than one inside the cloud
      return { x, y, r: rr, i, edge: puff(0), body: puff(-1), outer: y - rr < cb - prof(x) + rr * 0.6,
        dark: el(x - rr * 0.3, y - rr * 0.32, rr * 0.98, rr * 0.92, 0, TAU, 2100 + i, 0), core: el(x - rr * 0.5, y - rr * 0.5, rr * 1.04, rr, 0, TAU, 2400 + i, 0) };
    });
    this.clouds = [{ base: cb, turrets, x0: cx0, x1: cx1b }];

    // the King Air C90 (KING_AIR, scenes/plate-seeding.js) without its flare racks, unturned to its own axes, turned FIN11.air.yaw
    // toward the eye, and seen from below its left side; its projection is fixed, so it is computed once and only moved
    const A = F.air, d15 = 15 * Math.PI / 180, ya = A.yaw * Math.PI / 180;
    const unturn = ([x, y, z]) => [x * Math.cos(d15) - y * Math.sin(d15), x * Math.sin(d15) + y * Math.cos(d15), z];
    const yaw = ([x, y, z]) => [x * Math.cos(ya) - y * Math.sin(ya), x * Math.sin(ya) + y * Math.cos(ya), z];
    const M = q => yaw(unturn(q)), Dh = 100, C = [0, Dh, 0.6 - Dh * Math.tan(A.elev * Math.PI / 180)];
    E3.camera(C, [0, 0, 0.6], A.f, 0, 0);
    const newell = pts => { const nv = [0, 0, 0]; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; nv[0] += (a[1] - b[1]) * (a[2] + b[2]); nv[1] += (a[2] - b[2]) * (a[0] + b[0]); nv[2] += (a[0] - b[0]) * (a[1] + b[1]); } const l = Math.hypot(...nv) || 1; return nv.map(v => v / l); };
    // the city's glow lights it from below, a little from the eye's side
    const GL = (v => { const l = Math.hypot(...v); return v.map(c => c / l); })([0, 0.45, -1]);
    const axisOf = nm => /wing|tailplane/.test(nm) ? [0, 1, 0] : [1, 0, 0];
    const parts = KING_AIR.parts.filter(p => !p.burn).map(p => {
      const faces = p.f.map(f => f.map(M)), cs = E3.centroid(faces.map(E3.centroid));
      const vis = [];
      faces.forEach(f => {
        let nv = newell(f); const c = E3.centroid(f);
        if (E3.dot(nv, E3.sub(c, cs)) < 0) nv = nv.map(v => -v);
        if (E3.dot(nv, E3.sub(C, c)) <= 0) return;
        const sp = f.map(E3.proj), g = Math.max(0, E3.dot(nv, GL));
        vis.push({ sp, g, bb: [Math.min(...sp.map(q => q[0])), Math.min(...sp.map(q => q[1])), Math.max(...sp.map(q => q[0])), Math.max(...sp.map(q => q[1]))] });
      });
      const ax = yaw(axisOf(p.n)), a2 = E3.proj(ax.map(v => v * 3)), a1 = E3.proj([0, 0, 0]);
      return { n: p.n, smooth: !!p.smooth, depth: E3.depth(cs), hull: hull2(faces.flat().map(E3.proj)), vis, ang: Math.atan2(a2[1] - a1[1], a2[0] - a1[0]),
        disc: p.disc ? p.disc.map(q => E3.proj(M(q))) : null };
    });
    // seen from below, each nacelle hangs in front of its own wing's underside: it is painted just after that wing
    parts.forEach(p => { const m = /^nacelle([LR])$/.exec(p.n); if (m) p.depth = Math.min(p.depth, parts.find(q => q.n === 'wing' + m[1]).depth - 0.01); });
    parts.sort((a, b) => b.depth - a.depth);
    const side = yaw([0, 1, 0]), wins = KING_AIR.windows.map(w => w.map(q => { const u = unturn(q); return E3.proj(yaw([u[0], -u[1], u[2]])); }));
    const ck = (u => E3.proj(yaw([u[0], -u[1], u[2]])));
    const D7 = Math.tan(7 * Math.PI / 180);
    this.air = { parts, wins, cockpit: KING_AIR.cockpit.map(q => ck(unturn(q))), side,
      // steady navigation lights only: red on the left (port) wingtip, green on the right, white at the tail
      lights: [[yaw([0, 7.7, 6.96 * D7]), '255,92,76'], [yaw([0, -7.7, 6.96 * D7]), '96,255,150'], [yaw([-5.5, 0, 1.05]), '255,246,226']].map(([p, c]) => ({ p: E3.proj(p), c })) };
    const allX = parts.flatMap(p => p.hull.map(q => q[0])), allY = parts.flatMap(p => p.hull.map(q => q[1]));
    this.air.ext = [Math.min(...allX), Math.min(...allY), Math.max(...allX), Math.max(...allY)];
    this.air.span = Math.hypot(this.air.lights[0].p[0] - this.air.lights[1].p[0], this.air.lights[0].p[1] - this.air.lights[1].p[1]);
    // its path: one altitude (scene y A.y) and one speed, from its nose entering on the right at tIn to its tail (and the
    // tail light's glow) leaving on the left at tOut, under the finale's camera at those moments
    const sxAt = (t, X0) => { const c = this.cam(t); return c.px + (X0 - c.sx) / c.s; };
    const xIn = sxAt(A.tIn, W) - this.air.ext[0] + 6, xOut = sxAt(A.tOut, 0) - this.air.ext[2] - 8;
    this.air.x = t => xIn + (xOut - xIn) * (t - A.tIn) / (A.tOut - A.tIn);
    this.air.v = (xIn - xOut) / (A.tOut - A.tIn);
    // the moment the aircraft (its centre) passes over a scene x
    this.air.tAt = x => A.tIn + (xIn - x) / this.air.v;

    // the rain: veils of fine lines from the cloud base down to the Hajar, each beginning half a second after the aircraft
    // has passed over it and growing gently over three seconds; a line stops 12 px above any landmark in front of it, so no
    // rain is ever drawn on (or seems to fall on) a building, the forts or Dhayah's hill
    const fronts = [this.dhayah.hill, ...this.dhayah.fort, this.fujRock, ...this.forts.flatMap(f => f.pieces.map(q => q.p).concat(f.merl))];
    const topAt = x => { let top = Infinity; fronts.forEach(p => { const q = p.pts; for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) top = Math.min(top, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); else if (a[0] === x) top = Math.min(top, a[1], b[1]); } }); return top; };
    const rv = rng(2030);
    this.veils = [[224, 272], [446, 524], [556, 650], [668, 752], [776, 846], [866, 952], [962, 1004]].map(([x0, x1]) => {
      const c = this.clouds[0], lines = [];
      for (let x = x0; x <= x1; x += 2.1 + rv() * 1.3) {
        // the line leans 0.14 px a px to the left as it falls: its foot rests on the crest under its lower end, and stops 12 px
        // above the highest landmark anywhere under its length
        const yb = c.base + 1, xf = x - 0.14 * (yOn(this.crestPts, x) + 3 - yb);
        let top = Infinity; for (let xx = xf - 1; xx <= x + 1; xx += 1) top = Math.min(top, topAt(xx));
        const foot = Math.min(yOn(this.crestPts, xf) + 3, top - 12);
        if (foot - yb < 14) continue;
        lines.push({ x, yb, foot, dash: 12 + rv() * 18, gap: 7 + rv() * 10, ph: rv() * 60, v: 26 + rv() * 12, w: Math.pow(Math.sin(Math.PI * (x - x0) / (x1 - x0 || 1)), 0.7) });
      }
      return { x0, x1, lines, ts: this.air.tAt((x0 + x1) / 2) + 0.5, base: c.base, yMax: Math.max(...lines.map(l => l.foot)) };
    }).filter(v => v.lines.length);
  },
  // the dashes' fall: steady in the film; in a stage hold each line's speed is rounded so its dash pattern repeats a whole
  // number of times in the loop, starting from where the film leaves it (endT), so the loop joins seamlessly
  fall(t, l) {
    const P_ = l.dash + l.gap;
    if (!this.hold) return l.ph + l.v * t;
    const v = P_ * Math.max(1, Math.round(l.v * this.loop / P_)) / this.loop;
    return l.ph + l.v * (this.endT || 0) + v * t;
  },
  drawR11(t0) {
    const t = this.hold ? 99 : t0, J = this.J(t), fade = easeOut(prog(t, 0.3, 2.5)), F = FIN11, hz = FINALE_VIEW.hz;
    const DARK = OPT.colour ? '#070A18' : '#05060B';
    const hex = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
    // the computed sky, as in the approved frame; Suhail (Canopus) is not drawn in this revision, nor any halo or ring
    this.stars.forEach(s => {
      if (s === this.suhail) return;
      const [alt, az] = altAz(s.ra, s.dec, J);
      if (alt < 0) return;
      const [x, y] = skyXY(alt, az, FINALE_VIEW);
      if (x < -20 || x > W + 20 || y < -20) return;
      const m = s.V + 0.1 * (airmass(alt) - 1);
      if (m > 6.2) return;
      const underWords = (y > 120 && y < 345 && x > 160 && x < 1760) || (y > 340 && y < 530 && x > 660 && x < 1260);
      const rad = Math.max(0.8, 3.7 - 0.6 * m) * (1 + 0.06 * this.tw(t0, s.ph, 3.1)), al = clamp((6.6 - m) / 3.4) * fade * (underWords ? 0.12 : 1);
      disc(x, y, rad, INK, al);
      if (m < 2) { const L = 3 + (2 - m) * 4; stroke(new P([[x - L, y], [x + L, y]]), 1, INK, 0.8, 0.5 * al); stroke(new P([[x, y - L], [x, y + L]]), 1, INK, 0.8, 0.5 * al); }
    });
    const cq = easeOut(prog(t, 0.2, 2.0));
    // the cloud over the Hajar, engraved in light: each turret masks the stars behind it, then takes contour lines where the
    // city's glow catches it (lower right) and its edge; the flat base in horizontal strokes, closer where it rains
    this.clouds.forEach(c => {
      ctx.save(); ctx.beginPath(); ctx.rect(c.x0 - 10, 0, c.x1 - c.x0 + 20, c.base); ctx.clip();
      c.turrets.forEach(tu => {
        mask(tu.body, cq);
        const arcs = (outside, gap, a, lw) => {
          ctx.save(); ctx.beginPath(); tu.body.trace(ctx, 1); ctx.clip();
          ctx.beginPath(); ctx.rect(0, 0, W, H); outside.trace(ctx, 1); ctx.clip('evenodd');
          ctx.globalAlpha = SA * a * cq; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.beginPath();
          for (let rr = tu.r * 0.35; rr < tu.r * 1.05; rr += gap) { ctx.moveTo(tu.x + rr, tu.y); ctx.ellipse(tu.x, tu.y, rr, rr * 0.94, 0, 0, TAU); }
          ctx.stroke(); ctx.restore();
        };
        arcs(tu.dark, 2.5, 0.1, 0.65);
        arcs(tu.core, 2.1, 0.08, 0.65);
        stroke(tu.edge, cq, INK, 0.85, tu.outer ? 0.36 : 0.17);
      });
      ctx.restore();
      ctx.save(); ctx.beginPath(); c.turrets.forEach(tu => { if (tu.y + tu.r > c.base - 30) tu.body.trace(ctx, 1); }); ctx.clip();
      ctx.beginPath(); ctx.rect(c.x0 - 10, c.base - 26, c.x1 - c.x0 + 20, 26); ctx.clip();
      ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
      ctx.globalAlpha = SA * cq * 0.14; ctx.beginPath();
      for (let y = c.base - 1; y > c.base - 24; y -= 2.6) { const k = (c.base - y) / 24; ctx.moveTo(c.x0 + 30 * k * k, y); ctx.lineTo(c.x1 - 30 * k * k, y); }
      ctx.stroke();
      // where it rains, the base is ruled closer (each band feathered at its ends)
      this.veils.forEach(v => {
        const w = this.hold ? 1 : easeInOut(prog(t, v.ts, 3.0));
        if (w <= 0) return;
        const g = ctx.createLinearGradient(v.x0 - 24, 0, v.x1 + 24, 0);
        g.addColorStop(0, hex('#F1E4C8', 0)); g.addColorStop(0.3, hex('#F1E4C8', 1)); g.addColorStop(0.7, hex('#F1E4C8', 1)); g.addColorStop(1, hex('#F1E4C8', 0));
        ctx.strokeStyle = g; ctx.globalAlpha = SA * cq * 0.12 * w; ctx.beginPath();
        for (let y = c.base - 2.3; y > c.base - 22; y -= 2.6) { ctx.moveTo(v.x0 - 24, y); ctx.lineTo(v.x1 + 24, y); }
        ctx.stroke();
      });
      ctx.restore();
      stroke(new P([[c.x0 + 8, c.base], [c.x1 - 8, c.base]]), cq, INK, 0.9, 0.3);
    });
    // the city glow on the horizon, as in the approved frame
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createLinearGradient(0, hz - 200, 0, hz);
    glow.addColorStop(0, 'rgba(0,0,0,0)'); glow.addColorStop(1, `rgba(120,90,70,${0.35 * fade})`);
    ctx.fillStyle = glow; ctx.fillRect(0, hz - 200, W, 200);
    if (OPT.colour) {
      const cg = ctx.createLinearGradient(0, hz - 340, 0, hz);
      cg.addColorStop(0, 'rgba(0,0,0,0)'); cg.addColorStop(0.5, `rgba(96,72,150,${0.2 * fade})`); cg.addColorStop(1, `rgba(236,146,92,${0.42 * fade})`);
      ctx.fillStyle = cg; ctx.fillRect(0, hz - 340, W, 340);
    }
    ctx.restore();
    const sil = (path, lw = 0.8, col = DARK, a = 0.2) => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * cq; ctx.fillStyle = col; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore(); if (lw) stroke(path, cq, INK, lw, a); };
    const lamp = (x, y, a, w = 1.4, h = 1.2, col = '#F2C97A') => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a; ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.restore(); };
    const lit = (paths, col, a, y0, y1, top = 0.6) => {
      if (a <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a;
      const g = ctx.createLinearGradient(0, y1, 0, y0); g.addColorStop(0, hex(col, 1)); g.addColorStop(1, hex(col, top));
      ctx.fillStyle = g; ctx.beginPath(); [].concat(paths).forEach(p => p.trace(ctx, 1)); ctx.fill(); ctx.restore();
    };
    const on = (v, t1 = 0.9, sp = 2.5) => prog(t, t1 + v * sp, 0.6), dq = cq * easeOut(prog(t, 0.6, 2.0));
    // the Hajar, far and low: a little lighter than the near silhouettes, its crest caught by the glow
    sil(this.hajar, 0, OPT.colour ? '#151D45' : '#0F1220');
    hatch(this.hajar, [0, 805, 1230, 906], -1.15, 4.2, cq, INK, 0.6, 0.06, 851);
    stroke(this.ridge, cq, INK, 0.9, 0.3);
    // the rain (ghayth), falling on the mountains beyond the city after the aircraft has passed over them
    this.veils.forEach(v => {
      const q = this.hold ? 1 : easeInOut(prog(t, v.ts, 3.0));
      if (q <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = BLEND; ctx.lineCap = 'round'; ctx.lineWidth = 0.65;
      const g = ctx.createLinearGradient(0, v.base, 0, v.yMax); g.addColorStop(0, hex('#B7CBEF', 1)); g.addColorStop(0.75, hex('#B7CBEF', 0.55)); g.addColorStop(1, hex('#B7CBEF', 0));
      ctx.strokeStyle = g;
      v.lines.forEach(l => {
        const reach = this.hold ? 1 : easeOut(prog(t, v.ts + 0.25 * l.w, 1.6)), y1 = l.yb + (l.foot - l.yb) * reach;
        if (y1 - l.yb < 2) return;
        ctx.globalAlpha = SA * 0.5 * q * (0.25 + 0.75 * l.w);
        ctx.setLineDash([l.dash, l.gap]); ctx.lineDashOffset = -this.fall(t0, l);
        ctx.beginPath(); ctx.moveTo(l.x, l.yb); ctx.lineTo(l.x - 0.14 * (y1 - l.yb), y1); ctx.stroke();
      });
      ctx.restore();
    });
    // the water, from the far bank to the frame's foot
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = OPT.colour ? '#0A1230' : '#04050A'; ctx.fillRect(0, hz, W, H - hz); ctx.restore();
    // the far bank: a low shore under the towers
    sil(new P([[1000, F.yT + 0.6], [1000, hz - 2.5], [W, hz - 2], [W, F.yT + 0.6]], true), 0.7);
    stroke(ln(1040, F.yT + 0.8, W, F.yT + 0.8, 791, 0.3), fade, INK, 0.9, 0.22);
    // the homes plate's towers at kT: ADNOC HQ (the slab with the open square at its crown), the Nation Towers and their
    // sky bridge, the five Etihad Towers
    const T = this.tw11, inPlate = (o, fn) => { ctx.save(); ctx.translate(o.sx - o.px * o.k, F.yT - o.base * o.k); ctx.scale(o.k, o.k); fn(); ctx.restore(); };
    inPlate(T.adnoc, () => {
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * cq; ctx.fillStyle = DARK;
      ctx.beginPath(); T.adnoc.b.body.trace(ctx, 1); T.adnoc.hole.trace(ctx, 1); ctx.fill('evenodd'); ctx.restore();
      stroke(T.adnoc.b.body, cq, INK, 2.6, 0.22);
      this.adnocWin.forEach(([x, y, v]) => { const o = on(v, 1.1, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.4, 4.6); });
    });
    inPlate(T.nation, () => {
      this.nationT.forEach(b => sil(b.body, 2.6));
      this.nationWin.forEach(ws => ws.forEach(([x, y, v]) => { const o = on(v, 1.2, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.4, 4.6); }));
    });
    inPlate(T.etihad, () => {
      this.towers.forEach(b => sil(b.body, 2.8));
      this.windows.forEach(ws => ws.forEach(([x, y, v]) => { const o = on(v, 1.0, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.4, 4.6); }));
    });
    // Aldar HQ: the lit disc behind its diagrid, the zipper round its edge
    const AL = this.aldar;
    sil(AL.body, 0);
    ctx.save(); ctx.beginPath(); AL.body.trace(ctx, 1); ctx.clip();
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.34 * dq;
    const lg = ctx.createRadialGradient(AL.cx - 4, AL.cy + 3, 2, AL.cx, AL.cy, AL.R * F.kT); lg.addColorStop(0, '#F0D9AE'); lg.addColorStop(1, '#8FA4C0');
    ctx.fillStyle = lg; ctx.fillRect(AL.cx - 20, AL.cy - 20, 40, 40);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.7 * cq; ctx.strokeStyle = DARK; ctx.lineWidth = 0.55; ctx.beginPath();
    const sp = 13.6 * F.kT, rr = AL.R * F.kT + 2;
    for (let o = -2 * rr; o <= 2 * rr; o += sp) { [1, -1].forEach(sg => { const a = sg * Math.PI / 3; ctx.moveTo(AL.cx + o - Math.cos(a) * rr * 1.6, AL.cy - Math.sin(a) * rr * 1.6); ctx.lineTo(AL.cx + o + Math.cos(a) * rr * 1.6, AL.cy + Math.sin(a) * rr * 1.6); }); }
    ctx.stroke(); ctx.restore();
    stroke(AL.body, cq, INK, 0.8, 0.4);
    ctx.save(); ctx.beginPath(); AL.body.trace(ctx, 1); ctx.clip(); stroke(el(AL.cx, AL.cy, AL.R * F.kT - 1.3, AL.R * F.kT - 1.3, 0, TAU, 860, 0), cq, INK, 0.5, 0.14); ctx.restore();
    // the two palaces, on their nearer bank in front of the towers. Qasr Al Watan, floodlit: its white granite pale, the dome
    // brightest
    sil(this.qasr11, 0.6); sil(this.qasrDome11, 0.6); sil(this.qasrFinial11, 0.4); this.qasrDomes11.forEach(d => sil(d, 0.5));
    lit([this.qasr11, ...this.qasrDomes11], '#EADDC0', 0.72 * dq, F.yP - 25 * F.kP, F.yP, 0.75);
    lit([this.qasrDome11, this.qasrFinial11], '#F4EAD2', 0.8 * dq, F.yP - 64 * F.kP, F.yP - 41 * F.kP, 0.85);
    this.qasrLights11.forEach(([x, y, v]) => { const o = on(v); if (o > 0) lamp(x, y, 0.5 * o * (0.5 + 0.5 * v), 1.5, 1.3); });
    // Emirates Palace: its long front and the great dome, floodlit gold, the Etihad Towers rising behind its east wing
    sil(this.pal11, 0.6); sil(this.palDome11, 0.6); this.palDomes11.forEach(d => sil(d, 0.5));
    lit([this.palDome11], '#EDD199', 0.7 * dq, F.yP - 63 * F.kP, F.yP - 34 * F.kP, 0.8);
    lit([this.pal11, ...this.palDomes11], '#DDBB84', 0.55 * dq, F.yP - 34 * F.kP, F.yP, 0.62);
    this.palLights11.forEach(([x, y, v]) => { const o = on(v, 0.8); if (o > 0) lamp(x, y, 0.5 * o * (0.5 + 0.5 * v), 1.6, 1.4); });
    // Burj Khalifa: its tiers lit window by window, the spire pale above the occupied floors
    const B = this.bk;
    sil(B.body, 0.7, DARK, 0.24);
    ctx.save(); ctx.beginPath(); B.body.trace(ctx, 1); ctx.clip(); ctx.beginPath(); ctx.rect(B.g.X(-20), B.g.Y(828) - 2, B.g.X(20) - B.g.X(-20), B.g.Y(585) - B.g.Y(828) + 2); ctx.clip();
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.5 * dq;
    const sg = ctx.createLinearGradient(0, B.g.Y(828), 0, B.g.Y(585)); sg.addColorStop(0, 'rgba(236,236,244,0.95)'); sg.addColorStop(1, 'rgba(236,236,244,0.35)');
    ctx.fillStyle = sg; ctx.fillRect(B.g.X(-20), B.g.Y(828) - 2, 40, 90); ctx.restore();
    B.win.forEach(([x, y, v]) => { const o = on(v, 1.0, 3); if (o > 0) lamp(x, y, 0.62 * o * (0.6 + 0.4 * v), 1.3, 1.1); });
    // Burj Al Arab: the island, the sail with its lit fabric belly and its ribs, the exoskeleton's trusses, the helipad and
    // Al Muntaha at the top, the mast; the curving bridge to the shore
    const R_ = this.baa;
    stroke(R_.bridge, cq, INK, 0.7, 0.22);
    R_.bridgeLamps.forEach(([x, y], i) => lamp(x, y - 0.6, 0.45 * cq, 1, 1));
    sil(R_.island, 0.6); sil(R_.body, 0.7, DARK, 0.26); sil(R_.mast, 0.5, DARK, 0.3);
    lit([R_.fabric], '#DDE6F4', 0.5 * dq, R_.g.Y(182), R_.g.Y(7.5), 0.7);
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.55 * cq; ctx.strokeStyle = DARK; ctx.lineWidth = 0.6; ctx.beginPath(); R_.ribs.forEach(p => p.trace(ctx, 1)); ctx.stroke(); ctx.restore();
    R_.truss.forEach(p => stroke(p, cq, INK, 0.75, 0.3)); stroke(R_.leg, cq, INK, 0.7, 0.3);
    R_.win.forEach(([x, y, v]) => { const o = on(v, 1.1, 3); if (o > 0) lamp(x, y, 0.55 * o * (0.6 + 0.4 * v), 1.1, 1.0); });
    R_.props.forEach(p => stroke(p, cq, INK, 0.6, 0.3));
    sil(R_.pad, 0.6, DARK, 0.45); sil(R_.muntaha, 0.5, DARK, 0.3);
    lit([R_.muntaha], '#F2C97A', 0.45 * dq, R_.g.Y(201.5), R_.g.Y(196.5), 1);
    lit([R_.mast], '#E6E9F2', 0.3 * dq, R_.g.Y(321), R_.g.Y(252), 0.5);
    // the reflections of the far bank's lights: faint, shimmering columns
    const refl = (x, y0, a, len, ph, wd = 2) => { const s = 0.5 + 0.5 * this.tw(t0, ph, 1.7); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a * (0.6 + 0.4 * s); const g = ctx.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, '#F2C97A'); g.addColorStop(1, 'rgba(242,201,122,0)'); ctx.fillStyle = g; ctx.fillRect(x - wd / 2, y0 + 1, wd, len); ctx.restore(); };
    const rq = cq * easeOut(prog(t, 2.0, 2.0)), yR = F.yT + 1;
    const tx = (o, x) => o.sx + (x - o.px) * o.k;
    this.windows.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.etihad, x), yR, 0.15 * rq, 26 + 40 * v, v * 6.28, 1.4); }));
    this.nationWin.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.nation, x), yR, 0.15 * rq, 24 + 36 * v, v * 6.28 + 1, 1.4); }));
    this.adnocWin.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.adnoc, x), yR, 0.15 * rq, 26 + 40 * v, v * 6.28 + 2, 1.4); });
    this.palLights11.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(x, F.yP + 1, 0.11 * rq, 22 + 28 * v, v * 6.28 + 4, 1.6); });
    this.qasrLights11.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(x, F.yP + 1, 0.11 * rq, 20 + 26 * v, v * 6.28 + 3, 1.6); });
    refl(this.palDome11.pts[0][0] + (this.palDome11.pts[this.palDome11.pts.length - 1][0] - this.palDome11.pts[0][0]) / 2, F.yP + 1, 0.12 * rq * dq, 34, 9, 8);
    refl(FIN11.x.qasr, F.yP + 1, 0.12 * rq * dq, 30, 10, 8);
    B.win.forEach(([x, y, v], j) => { if (j % 5 === 0) refl(x, yR, 0.14 * rq, 30 + 50 * v, v * 6.28 + 5, 1.4); });
    R_.win.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(x, yR, 0.12 * rq, 20 + 30 * v, v * 6.28 + 6, 1.4); });
    refl(R_.g.X(R_.back - 40), yR, 0.16 * rq * dq, 40, 7, 6);
    refl(AL.cx, yR, 0.12 * rq * dq, 30, 8, 8);
    // the nearer bank, left: the land of the northern emirates, from the shore to the far plain under the Hajar
    sil(new P([[0, hz - 0.5], [1026, hz - 0.5], [1041, hz + 1.5], [1036, F.yN - 14], [1024, F.yN], [0, F.yN]], true), 0);
    stroke(pl([[0, F.yN], [1024, F.yN], [1036, F.yN - 14]], false, 792, 0.4), fade, INK, 0.9, 0.24);
    // Dhayah Fort on its hill, unlit: a dark hill and fort against the Hajar, the zigzag of its steps just caught
    const Dh = this.dhayah;
    sil(Dh.hill, 0.8, DARK, 0.3); Dh.fort.forEach(p => sil(p, 0, DARK));
    Dh.fort.forEach(p => stroke(p, cq, INK, 0.7, 0.42));
    stroke(Dh.steps, cq, INK, 0.6, 0.16);
    // the forts on the nearer bank, floodlit: each piece's silhouette, then its stone in the floodlight (a round tower
    // brightest a little left of its middle, a wall brightest at its foot), its merlons, its dark openings, its lines
    sil(this.fujRock, 0.8, DARK, 0.26);
    hatch(this.fujRock, [FIN11.x.fujairah - 31 * F.kN, F.yN - 20 * F.kN, FIN11.x.fujairah + 31 * F.kN, F.yN], -1.05, 3.4, cq, INK, 0.6, 0.11, 870);
    lit([this.fujRock], '#A98258', 0.3 * dq, F.yN, F.yN - 20 * F.kN, 0.08);
    this.fujCrags.forEach(p => stroke(p, cq, INK, 0.6, 0.18));
    this.forts.forEach(fo => {
      fo.pieces.forEach(pc => {
        sil(pc.p, 0);
        if (pc.kind === 'round') {
          ctx.save(); ctx.beginPath(); pc.p.trace(ctx, 1); ctx.clip(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.78 * dq;
          const g = ctx.createLinearGradient(pc.x0, 0, pc.x1, 0); g.addColorStop(0, hex(fo.col, 0.22)); g.addColorStop(0.36, hex(fo.col, 1)); g.addColorStop(0.72, hex(fo.col, 0.72)); g.addColorStop(1, hex(fo.col, 0.16));
          ctx.fillStyle = g; ctx.fillRect(pc.x0 - 1, pc.y0 - 1, pc.x1 - pc.x0 + 2, pc.y1 - pc.y0 + 2); ctx.restore();
        } else lit([pc.p], fo.col, 0.72 * dq, pc.y0, pc.y1, 0.6);
      });
      fo.merl.forEach(p => { sil(p, 0); lit([p], fo.col, 0.5 * dq, p.pts[2][1], p.pts[0][1], 0.8); });
      fo.holes.forEach(p => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.8 * cq; ctx.fillStyle = '#0B0A0E'; ctx.beginPath(); p.trace(ctx, 1); ctx.fill(); ctx.restore(); });
      fo.lines.forEach(p => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.5 * cq; ctx.strokeStyle = '#3A2C1C'; ctx.lineWidth = 0.8; ctx.beginPath(); p.trace(ctx, 1); ctx.stroke(); ctx.restore(); });
      fo.pieces.forEach(pc => stroke(pc.p, cq, INK, 0.6, 0.16));
    });
    // their light in the water below the nearer bank
    this.forts.forEach((fo, i) => fo.pieces.forEach((pc, j) => { for (let x = pc.x0 + 2; x < pc.x1 - 1; x += 4.5) refl(x, F.yN + 0.5, 0.075 * rq * dq, 14 + 0.35 * (pc.y1 - pc.y0) + 10 * ((x * 7.3) % 1), x * 0.37 + i + j, 2.6); }));
    // the King Air, crossing at one altitude: never in the stage holds
    if (!this.hold) this.drawAir(t);
    // hold C (behind speeches): the whole frame dimmed
    if (this.dim) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },
  drawAir(t) {
    const A = this.air, F = FIN11;
    if (t < F.air.tIn - 0.1 || t > F.air.tOut + 0.1) return;
    const ox = A.x(t), oy = F.air.y;
    if (ox + A.ext[2] < -40 || ox + A.ext[0] > W + 40) return;
    const BODY = OPT.colour ? '#0B1029' : '#08090F';
    ctx.save(); ctx.translate(ox, oy);
    A.parts.forEach((p, i) => {
      // the part's outline filled dark (every part is convex), then the glow from below laid along its form in fine lines
      const hull = new P(p.hull, true);
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA; ctx.fillStyle = BODY; ctx.beginPath(); hull.trace(ctx, 1); ctx.fill(); ctx.restore();
      p.vis.forEach((f, k) => { if (f.g > 0.06) { const fp = new P(f.sp, true); fill(fp, '#C9A27A', 0.16 * f.g); hatch(fp, f.bb, p.ang, 2.4, 1, '#E8C9A2', 0.55, 0.05 + 0.22 * f.g, 3100 + i * 50 + k); } });
      if (p.n === 'fuselage') {
        A.wins.forEach(w => fill(new P(w, true), '#F2C97A', 0.22));
        fill(new P(A.cockpit, true), '#BFD0EA', 0.18);
      }
      stroke(hull, 1, INK, 0.9, 0.5);
      if (p.disc) stroke(new P(p.disc, true), 1, INK, 0.6, 0.22);
    });
    // the steady navigation lights (no strobe or beacon is drawn, and nothing flashes)
    A.lights.forEach(({ p, c }) => {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 6); g.addColorStop(0, `rgba(${c},0.55)`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(p[0] - 6, p[1] - 6, 12, 12); ctx.restore();
      disc(p[0], p[1], 1.3, `rgb(${c})`, 0.95, 'screen');
    });
    ctx.restore();
  },
});
