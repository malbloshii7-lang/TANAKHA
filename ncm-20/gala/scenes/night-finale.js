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
//     828 m is 257 px, its spire tip at y 652, 92 px under the aircraft's path and clear of the lockup's box)
//   kD 1.0 px/m, Dhayah's hill, nearer; kN 3.2 px/m, the nearer bank of the heritage forts (about 10x nearer than the towers)
//   kM 0.047 px/m, the Hajar and the cloud over it (far: Jebel Jais' 1,800 m crest is 85 px; the cloud base 2.4 km)
// The aircraft is drawn at its own distance (FIN11.air): a 15.3 m span at 9.2 px/m, seen 20 degrees up from its left side.
const FIN11 = { eye: 14, kT: 0.31, kD: 1.0, kN: 3.2, kM: 0.047,
  // centres (scene x), right to left in the constitutional order
  x: { qasr: 1790, palace: 1590, etihad: 1445, adnoc: 1378, nation: 1318, aldar: 1252, bk: 1165, baa: 1070,
    sharjah: 931, ajman: 728, uaq: 544, fujairah: 346, dhayah: 125 },
  // the King Air: model yaw toward the eye (deg), elevation of the eye's view (deg), focal length (px), path height (scene y),
  // and the scene-clock times its nose enters the frame on the right and its tail leaves on the left (the dissolve into the
  // finale ends at 1.5; the title begins at 5.0)
  air: { yaw: 22, elev: 20, f: 980, y: 560, tIn: 1.6, tOut: 5.0 } };
FIN11.yT = FINALE_VIEW.hz + FIN11.eye * FIN11.kT;
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
});
