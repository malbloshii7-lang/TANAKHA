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
// skyline of the UAE's modern landmarks standing together under the same computed sky, zoomed in to fill the frame: Dubai's
// Burj Al Arab and Burj Khalifa on the left; Abu Dhabi's Aldar HQ, the Nation Towers, ADNOC HQ, the Etihad Towers, Emirates
// Palace and Qasr Al Watan to the right. Suhail is not drawn in it (nor its halo, rings, label or the ?heritage Sirius
// halo). A band of engraved cloud crosses the head of the frame; NCM's King Air C90 crosses under it, left to right, at one
// steady altitude after the dissolve, and leaves as the title arrives; behind it, gentle rain falls from the cloud base,
// veil by veil, and fades out well above the buildings (ghayth). As the title (twenty years) rises, the rain turns from
// silver to the anniversary's gold, the gold of the gauge's 2027 (the requester's idea, 5 October 2026). See FIN11 below.
const FINALE_VIEW = { az0: 186, pxDeg: 17, hz: 905 };
// Revision 11's frieze, in depth. One eye 14 m above the water; every object's size and the line it stands on follow from
// its distance (base = horizon + eye x scale), so the frieze has true perspective although its order is symbolic:
//   kT 0.62 px/m, the towers' bank (one scale for every tower, so their heights are true to each other: Burj Khalifa's
//     828 m is 513 px, its spire tip at scene y 401; it stands left of the words, clear of every word box)
//   kP 1.1 px/m, the two palaces (Emirates Palace, Qasr Al Watan), nearer: low and about 300 m-1 km long, they stand on a
//     bank of their own in front of Abu Dhabi's towers
// The aircraft is drawn at its own distance (FIN11.air): 13.8 px/m, seen 18 degrees up from its right side, nose turned 28
// degrees toward the eye: its wingtip lights stand 116 px apart and it is 153 x 62 px overall. It flies at scene y 276,
// under the cloud's base (scene y 140) and over Burj Khalifa's spire (scene y 400) with about 95 px to spare on each side.
const FIN11 = { eye: 14, kT: 0.62, kP: 1.1,
  // centres (scene x): Dubai on the left, Abu Dhabi to the right
  x: { baa: 200, bk: 470, aldar: 715, nation: 955, adnoc: 1215, etihad: 1470, palace: 1180, qasr: 1715 },
  // the King Air: model yaw toward the eye (deg), elevation of the eye's view (deg), focal length (px), path height (scene y),
  // and the scene-clock times its nose enters the frame on the left and its tail leaves on the right (the dissolve into the
  // finale ends at 1.5; the title begins at 5.0)
  air: { yaw: 28, elev: 18, f: 1450, y: 276, tIn: 1.6, tOut: 5.0 },
  // the cloud band (scene coordinates): its flat base and its span, inside the plate's corner marks at the camera's 1.04
  // (screen x 84-1836, its tops below y 46), its base 26 px over the title's highest mark (the tanween of «عاماً»)
  cloud: { base: 140, x0: 120, x1: 1800 } };
FIN11.yT = FINALE_VIEW.hz + FIN11.eye * FIN11.kT;
FIN11.yP = FINALE_VIEW.hz + FIN11.eye * FIN11.kP;
// Burj Khalifa's elevation, from the OpenStreetMap 3D model of its 37 building parts (each wing tier's footprint and
// height; via Overture Maps 2026-09-23.1 building_part) seen toward azimuth 120: [metres across, metres up], a step outline
// with its spiral setbacks, the core rising to the spire and the pinnacle at 828 m
FIN11.bk = [[-72, 0], [-72, 15], [-51, 15], [-51, 35], [-43, 35], [-43, 105], [-36, 105], [-36, 200], [-29.5, 200], [-29.5, 315],
  [-23, 315], [-23, 460], [-17, 460], [-17, 545], [-13, 545], [-13, 605], [-10.5, 605], [-10.5, 660], [-7.5, 660], [-7.5, 710],
  [-4.5, 710], [-4.5, 720], [-1.5, 720], [-1.5, 740], [-0.5, 740], [-0.5, 828], [1, 828], [1, 760], [4.5, 760], [4.5, 710],
  [8.5, 710], [8.5, 700], [9.5, 700], [9.5, 625], [14, 625], [14, 580], [15.5, 580], [15.5, 520], [23.5, 520], [23.5, 360],
  [32, 360], [32, 235], [39.5, 235], [39.5, 130], [48, 130], [48, 35], [57.5, 35], [57.5, 15], [86, 15], [86, 0]];
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
    // Revision 11 (?rev11): the symbolic skyline of the UAE's landmarks (initR11). Its geometry and lights use their own
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

  // ---------- Revision 11: the UAE's landmarks under one sky (FIN11) ----------
  initR11(tmp) {
    const F = FIN11, X = F.x;
    // a landmark's own frame: metres across from its centre (x) and up from its base (z), at its bank's scale
    const G = (cx, base, k) => ({ X: m => cx + m * k, Y: z => base - z * k, k, cx, base });
    const poly = (g, pts) => new P(pts.map(([x, z]) => [g.X(x), g.Y(z)]), true);
    const rect = (g, x0, x1, z0, z1) => poly(g, [[x0, z0], [x0, z1], [x1, z1], [x1, z0]]);
    const r = rng(2028);

    // Burj Khalifa (828 m), from its OSM 3D parts; lit windows in rows a floor-group apart
    const gB = G(X.bk, F.yT, F.kT), bkH = u => { const p = F.bk; for (let i = 0; i < p.length - 1; i++) if (p[i][1] === p[i + 1][1] && p[i][0] <= u && u < p[i + 1][0]) return p[i][1]; return 0; };
    this.bk = { g: gB, body: poly(gB, F.bk), win: [] };
    for (let z = 20; z < 580; z += 9.6) {
      let uL = null, uR = null; for (let u = -72; u <= 86; u += 0.5) if (bkH(u) >= z + 5) { if (uL === null) uL = u; uR = u; }
      if (uL === null || z < 36) continue;
      for (let u = uL + 2; u < uR - 1.5; u += 6) if (r() < 0.3) this.bk.win.push([gB.X(u), gB.Y(z), r()]);
    }
    // Burj Al Arab (321 m): the sail on its island 280 m offshore, seen from the north-east (Umm Suqeim), its fabric belly
    // to the left (the land, south-east) and its back and mast to the right (the sea): plan depth about 92 m at the base
    // (OSM footprint 97 x 88 m), the fabric wall 180 m tall and up to 50 m wide between the wings, the top of the
    // accommodation 197.5 m (Al Muntaha, cantilevered from the mast), the helipad at 210 m, the tubular mast 60 m above the
    // building to 321 m; the island 150 m a side and 7.5 m above the sea; the exoskeleton's diagonal trusses on the side.
    const gR = G(X.baa, F.yT, F.kT), back = 40, Dz = z => 92 * Math.sqrt(Math.max(0, 1 - Math.pow(z / 258, 2))), fw = z => 13 * Math.pow(Math.max(0, 1 - z / 188), 0.8);
    const front = []; for (let z = 7.5; z < 258; z += 4) front.push([back - Dz(z), z]);
    const fab = []; for (let z = 7.5; z <= 182; z += 4) fab.push([back - Dz(z), z]);
    const fabIn = fab.slice().reverse().map(([u, z]) => [u + fw(z), z]);
    this.baa = { g: gR, back,
      body: poly(gR, front.concat([[back, 258], [back, 7.5]])),
      mast: poly(gR, [[back - 5.3, 252], [back - 4.4, 321], [back - 1.1, 321], [back, 252]]),
      fabric: poly(gR, fab.concat(fabIn)),
      ribs: [22, 37, 52, 67, 82, 97, 112, 127, 142, 157, 172].map(z => new P([[gR.X(back - Dz(z)), gR.Y(z)], [gR.X(back - Dz(z) + fw(z)), gR.Y(z)]])),
      truss: [[[back - Dz(20) + 14, 20], [back, 100]], [[back, 20], [back - Dz(100) + 8, 100]], [[back - Dz(100) + 8, 100], [back, 178]], [[back, 100], [back - Dz(178) + 6, 178]]].map(l => new P(l.map(([u, z]) => [gR.X(u), gR.Y(z)]))),
      leg: new P([[gR.X(back), gR.Y(7.5)], [gR.X(back), gR.Y(258)]]),
      pad: el(gR.X(back + 13), gR.Y(211), 12 * F.kT, 2.2, 0, TAU, 840, 0),
      props: [new P([[gR.X(back + 7), gR.Y(210)], [gR.X(back), gR.Y(193)]]), new P([[gR.X(back + 19), gR.Y(210)], [gR.X(back + 1), gR.Y(186)]])],
      muntaha: rect(gR, back - 24, back + 4, 196.5, 201.5),
      island: poly(gR, [[-75, -1], [-72, 7.5], [72, 7.5], [75, -1]]),
      bridge: new P(quad([gR.X(-75), gR.Y(3.5)], [gR.X(-230), gR.Y(4)], [gR.X(-420), gR.Y(3)], 14)),
      win: [] };
    for (let z = 12; z < 192; z += 7) for (let u = back - Dz(z) + fw(z) + 3; u < back - 2; u += 5) if (r() < 0.26) this.baa.win.push([gR.X(u), gR.Y(z), r()]);
    this.baa.bridgeLamps = Array.from({ length: 16 }, (_, i) => this.baa.bridge.at(i / 15));
    // Aldar HQ (Al Raha Beach): a circle in elevation, 120.9 m across, its top 110 m up (so the circle runs on below the
    // ground), two convex glazed faces with an external steel diagrid, joined by the "zipper" band round its edge
    const gL = G(X.aldar, F.yT, F.kT), Rl = 60.45, zc = 110 - Rl, a0 = Math.asin(-zc / Rl);
    const circ = []; for (let i = 0; i <= 96; i++) { const a = a0 + (Math.PI - 2 * a0) * i / 96; circ.push([Rl * Math.cos(a), zc + Rl * Math.sin(a)]); }
    this.aldar = { g: gL, body: poly(gL, circ), zc, R: Rl, cx: gL.X(0), cy: gL.Y(zc) };
    // Etihad Towers, Nation Towers and ADNOC HQ: the homes plate's outlines (CTBUH heights at 1.155 px/m), at kT
    const kk = F.kT / 1.155, ab = tmp.sky.find(b => b.adnoc);
    this.tw11 = {
      etihad: { k: kk, px: 1705, base: tmp.base, sx: X.etihad },
      nation: { k: kk, px: 1490, base: tmp.base, sx: X.nation },
      adnoc: { k: kk, px: 1586, base: tmp.base, sx: X.adnoc, b: ab,
        hole: new P([[1569, tmp.base - 334 * 1.155], [1603, tmp.base - 334 * 1.155], [1603, tmp.base - 312 * 1.155], [1569, tmp.base - 312 * 1.155]], true) } };
    this.adnocWin = []; for (let y = tmp.base - 12; y > tmp.base - 312 * 1.155 + 8; y -= 11) for (let xx = 1572; xx < 1601; xx += 7) if (r() < 0.34) this.adnocWin.push([xx, y, r()]);
    // Emirates Palace: about 1 km long, its wings 14-18 m, the central block 34 m, the great dome to about 60 m (the
    // approved frame's massing), at kP
    const pk = F.kP, pcx = X.palace, m = h => F.yP - h * pk, half = 400 * pk;
    this.pal11 = new P([[pcx - half, F.yP], [pcx - half, m(14)], [pcx - half * 0.72, m(18)], [pcx - 60 * pk / 0.553, m(18)], [pcx - 60 * pk / 0.553, m(34)], [pcx + 60 * pk / 0.553, m(34)], [pcx + 60 * pk / 0.553, m(18)], [pcx + half * 0.72, m(18)], [pcx + half, m(14)], [pcx + half, F.yP]], true);
    this.palDome11 = el(pcx, m(34), 22 * 1.1 * pk, 26 * 1.1 * pk, Math.PI, TAU, 730, 0.05);
    this.palDomes11 = [-0.62, -0.35, 0.35, 0.62].map((f, i) => el(pcx + f * half, m(18), 7 * pk, 8 * pk, Math.PI, TAU, 732 + i, 0));
    this.palLights11 = Array.from({ length: 120 }, () => [pcx - half * 0.95 + r() * half * 1.9, m(4 + r() * 10), r()]);
    // Qasr Al Watan: the great dome 37 m across, its crown 60 m up over the Great Hall, a wing to each side, at kP
    const qk = F.kP, qcx = X.qasr, qm = h => F.yP - h * qk, QX = mm => qcx + mm * qk;
    this.qasr11 = new P([[QX(-150), F.yP], [QX(-150), qm(15)], [QX(-112), qm(15)], [QX(-112), qm(19)], [QX(-50), qm(19)], [QX(-50), qm(24)],
      [QX(-18.5), qm(24)], [QX(-18.5), qm(41.5)], [QX(18.5), qm(41.5)], [QX(18.5), qm(24)], [QX(50), qm(24)], [QX(50), qm(19)],
      [QX(112), qm(19)], [QX(112), qm(15)], [QX(150), qm(15)], [QX(150), F.yP]], true);
    this.qasrDome11 = el(qcx, qm(41.5), 18.5 * qk, 18.5 * qk, Math.PI, TAU, 760, 0);
    this.qasrFinial11 = new P([[qcx - 0.4, qm(60)], [qcx, qm(64)], [qcx + 0.4, qm(60)]], true);
    this.qasrDomes11 = [-86, -64, 64, 86].map((x, i) => el(QX(x), qm(19), 6 * qk, 6.5 * qk, Math.PI, TAU, 761 + i, 0));
    this.qasrLights11 = Array.from({ length: 80 }, () => { const x = -146 + r() * 292; return [QX(x), qm(3 + r() * (Math.abs(x) < 50 ? 18 : 11)), r()]; });

    // the cloud band across the head of the frame: engraved turrets as the seeding plate's cloud is, stacked from a flat base,
    // taller toward the middle, tapering to its ends inside the corner marks
    const C0 = F.cloud, rc = rng(2029), cb = C0.base;
    const bump = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
    const prof = x => Math.min(66, 32 + 24 * bump(x, 300, 110) + 30 * bump(x, 640, 120) + 18 * bump(x, 900, 90) + 32 * bump(x, 1180, 130) + 22 * bump(x, 1480, 110) + 28 * bump(x, 1690, 90))
      * Math.min(1, 0.4 + 0.6 * (x - C0.x0) / 90, 0.4 + 0.6 * (C0.x1 - x) / 90);
    // big masses along the base, each crowned by smaller turrets up to the band's local height (a cumulus's cauliflower)
    const T = [];
    for (let x = C0.x0 + 14; x < C0.x1 - 12;) {
      const Hc = prof(x), R1 = clamp(0.42 * Hc, 13, 27);
      T.push([x + (rc() - 0.5) * R1 * 0.3, cb - R1 * 0.55, R1 * (0.92 + 0.16 * rc())]);
      let y = cb - R1 * 1.25, r2 = R1 * (0.55 + 0.1 * rc());
      while (y - r2 > cb - Hc - 2) {
        T.push([x + (rc() - 0.5) * R1 * 1.1, y, r2]);
        if (rc() < 0.6) T.push([x + (rc() - 0.5) * R1 * 1.4, y + r2 * 0.4, r2 * (0.7 + 0.2 * rc())]);
        y -= r2 * (0.8 + 0.2 * rc()); r2 *= 0.72 + 0.12 * rc();
      }
      x += R1 * (0.8 + 0.25 * rc());
    }
    const turrets = T.filter(([x, , rr]) => x - rr > C0.x0 - 4 && x + rr < C0.x1 + 4).sort((p1, p2) => p1[1] - p2[1]).map(([x, y, rr], i) => {
      const nn = 2 * Math.round(5 + rr / 10 + rc() * 3), ph = rc() * TAU;
      const puff = k => new P(Array.from({ length: 64 }, (_, j) => { const a2 = j / 64 * TAU, q = rr * (1 + 0.06 * Math.pow(Math.abs(Math.sin(nn * a2 / 2 + ph)), 0.6) - 0.03) + k; return [x + q * Math.cos(a2), y + q * 0.94 * Math.sin(a2)]; }), true);
      // lit from below by the city: the upper part stays open, the glow catches the underside. A turret near the cloud's
      // top keeps a firmer edge than one inside the cloud
      return { x, y, r: rr, i, edge: puff(0), body: puff(-1), outer: y - rr < cb - prof(x) + rr * 0.6,
        dark: el(x, y - rr * 0.36, rr * 0.98, rr * 0.9, 0, TAU, 2100 + i, 0), core: el(x, y - rr * 0.58, rr * 1.04, rr, 0, TAU, 2400 + i, 0) };
    });
    this.clouds = [{ base: cb, turrets, x0: C0.x0, x1: C0.x1 }];

    // the King Air C90 (KING_AIR, scenes/plate-seeding.js) without its flare racks, unturned to its own axes, and turned
    // FIN11.air.yaw toward the eye on its right side: it flies left to right, seen from below its right (starboard) side, so
    // its near wingtip carries the green light and its far wingtip the red; its projection is fixed, computed once, and moved
    const A = F.air, d15 = 15 * Math.PI / 180, ya = -A.yaw * Math.PI / 180;
    const unturn = ([x, y, z]) => [x * Math.cos(d15) - y * Math.sin(d15), x * Math.sin(d15) + y * Math.cos(d15), z];
    const yaw = ([x, y, z]) => [x * Math.cos(ya) - y * Math.sin(ya), x * Math.sin(ya) + y * Math.cos(ya), z];
    const M = q => yaw(unturn(q)), Dh = 100, C = [0, -Dh, 0.6 - Dh * Math.tan(A.elev * Math.PI / 180)];
    E3.camera(C, [0, 0, 0.6], A.f, 0, 0);
    const newell = pts => { const nv = [0, 0, 0]; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; nv[0] += (a[1] - b[1]) * (a[2] + b[2]); nv[1] += (a[2] - b[2]) * (a[0] + b[0]); nv[2] += (a[0] - b[0]) * (a[1] + b[1]); } const l = Math.hypot(...nv) || 1; return nv.map(v => v / l); };
    // the city's glow lights it from below, a little from the eye's side
    const GL = (v => { const l = Math.hypot(...v); return v.map(c => c / l); })([0, -0.45, -1]);
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
    parts.forEach(p => { const mm = /^nacelle([LR])$/.exec(p.n); if (mm) p.depth = Math.min(p.depth, parts.find(q => q.n === 'wing' + mm[1]).depth - 0.01); });
    parts.sort((a, b) => b.depth - a.depth);
    const D7 = Math.tan(7 * Math.PI / 180);
    this.air = { parts, wins: KING_AIR.windows.map(w => w.map(q => E3.proj(M(q)))), cockpit: KING_AIR.cockpit.map(q => E3.proj(M(q))),
      // steady navigation lights only: green on the right (starboard) wingtip, nearer the eye; red on the left (port), the far
      // one; white at the tail
      lights: [[yaw([0, -7.7, 6.96 * D7]), '96,255,150'], [yaw([0, 7.7, 6.96 * D7]), '255,92,76'], [yaw([-5.5, 0, 1.05]), '255,246,226']].map(([p, c]) => ({ p: E3.proj(p), c })) };
    const allX = parts.flatMap(p => p.hull.map(q => q[0])), allY = parts.flatMap(p => p.hull.map(q => q[1]));
    this.air.ext = [Math.min(...allX), Math.min(...allY), Math.max(...allX), Math.max(...allY)];
    this.air.span = Math.hypot(this.air.lights[0].p[0] - this.air.lights[1].p[0], this.air.lights[0].p[1] - this.air.lights[1].p[1]);
    // its path: one altitude (scene y A.y) and one speed, from its nose entering on the left at tIn to its tail (and the
    // tail light's glow) leaving on the right at tOut, under the finale's camera at those moments
    const sxAt = (t, X0) => { const c = this.cam(t); return c.px + (X0 - c.sx) / c.s; };
    const xIn = sxAt(A.tIn, 0) - this.air.ext[2] - 6, xOut = sxAt(A.tOut, W) - this.air.ext[0] + 8;
    this.air.x = t => xIn + (xOut - xIn) * (t - A.tIn) / (A.tOut - A.tIn);
    this.air.v = (xOut - xIn) / (A.tOut - A.tIn);
    // the moment the aircraft (its centre) passes under a scene x
    this.air.tAt = x => A.tIn + (x - xIn) / this.air.v;

    // the word boxes, measured from finaleWords() itself: each variant drawn alone on a scratch sheet and its ink found, line
    // by line (CSS px, screen space): the title, the lockup, and hold B's dedication
    this.wordBoxes = this.measureWords();
    // the buildings' outlines in the scene, for the rain's stops
    const plate = (o, b) => new P(b.body.pts.map(([x, y]) => [o.sx + (x - o.px) * o.k, F.yT - (o.base - y) * o.k]), true);
    const fronts = [this.bk.body, this.baa.body, this.baa.mast, this.aldar.body, this.pal11, this.palDome11, this.qasr11, this.qasrDome11,
      ...this.towers.map(b => plate(this.tw11.etihad, b)), ...this.nationT.map(b => plate(this.tw11.nation, b)), plate(this.tw11.adnoc, ab)];
    const topAt = x => { let top = FINALE_VIEW.hz; fronts.forEach(p => { const q = p.pts; for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) top = Math.min(top, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); else if (a[0] === x) top = Math.min(top, a[1], b[1]); } }); return top; };
    this.topAt = topAt;
    // the rain: veils of fine lines from the cloud's base, each beginning half a second after the aircraft has passed under
    // it and growing gently over three seconds. A line fades out 45 px above the highest building within 40 px either side
    // of it (so no rain reaches within 40 px of a roof or spire), and never falls below scene y 600: it is rain over the
    // city, ending in the air
    const rv = rng(2030);
    this.veils = [[150, 236], [282, 372], [410, 520], [566, 664], [712, 822], [866, 962], [1004, 1110], [1152, 1248], [1290, 1398], [1440, 1532], [1574, 1676], [1712, 1784]].map(([x0, x1]) => {
      const lines = [];
      for (let x = x0; x <= x1; x += 2.6 + rv() * 1.6) {
        // the line leans 0.12 px a px to the left as it falls: the buildings checked are those within 40 px of any point of it
        const yb = cb + 1, xf = x - 0.12 * (600 - yb);
        let top = Infinity; for (let xx = Math.floor(Math.min(x, xf) - 40); xx <= Math.ceil(Math.max(x, xf) + 40); xx += 0.5) top = Math.min(top, topAt(xx));
        const foot = Math.min(600, top - 45);
        if (foot - yb < 30) continue;
        lines.push({ x, yb, foot, dash: 16 + rv() * 22, gap: 9 + rv() * 14, ph: rv() * 80, v: 52 + rv() * 26, w: Math.pow(Math.sin(Math.PI * (x - x0) / (x1 - x0 || 1)), 0.7) });
      }
      return { x0, x1, lines, ts: this.air.tAt((x0 + x1) / 2) + 0.5, base: cb };
    }).filter(v => v.lines.length);
  },
  // the word boxes: finaleWords() drawn by itself on a scratch sheet for each variant, and its ink grouped into lines
  measureWords() {
    if (typeof finaleWords !== 'function') return null;
    const sh = document.createElement('canvas'); sh.width = W * SCALE; sh.height = H * SCALE;
    const g = sh.getContext('2d', { willReadFrequently: true }), page = ctx, rec = TEXT_REC, out = {};
    TEXT_REC = null;
    [['title', { title: true, lockup: false }], ['lockup', { title: false, lockup: true }], ['dedication', { title: false, lockup: false, dedication: true }]].forEach(([k, o]) => {
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, sh.width, sh.height); g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx = g; try { finaleWords({ hold: true }, 0, o); } finally { ctx = page; }
      const d = g.getImageData(0, 0, sh.width, sh.height).data, rows = [];
      for (let y = 0; y < sh.height; y++) {
        let x0 = -1, x1 = -1;
        for (let x = 0, i = y * sh.width * 4 + 3; x < sh.width; x++, i += 4) if (d[i] > 24) { if (x0 < 0) x0 = x; x1 = x; }
        if (x0 >= 0) rows.push([y, x0, x1]);
      }
      const lines = [];
      rows.forEach(([y, x0, x1]) => { const L = lines[lines.length - 1]; if (L && y - L[3] <= 4 * SCALE) { L[0] = Math.min(L[0], x0); L[2] = Math.max(L[2], x1); L[3] = y; } else lines.push([x0, y, x1, y]); });
      out[k] = lines.map(([x0, y0, x1, y1]) => [x0 / SCALE, y0 / SCALE, (x1 + 1) / SCALE, (y1 + 1) / SCALE]);
    });
    TEXT_REC = rec;
    return out;
  },
  // the dashes' fall: steady in the film; in a stage hold each line's speed is rounded so its dash pattern repeats a whole
  // number of times in the loop, starting from where the film leaves it (endT), so the loop joins seamlessly
  fall(t, l) {
    const P_ = l.dash + l.gap;
    if (!this.hold) return l.ph + l.v * t;
    const v = P_ * Math.max(1, Math.round(l.v * this.loop / P_)) / this.loop;
    return l.ph + l.v * (this.endT || 0) + v * t;
  },
  // how strongly each group of words is up (they soften the rain behind them): the film's title from 5.0 and lockup from
  // 6.667 on the scene clock; in the stage holds, the variant's own words
  wordsUp(t) {
    if (this.hold) {
      const v = ((new URLSearchParams(location.search).get('hold')) || 'A').toUpperCase();
      return { title: v === 'A' ? 1 : 0, lockup: v === 'C' ? 0 : 1, dedication: v === 'B' ? 1 : 0 };
    }
    return { title: easeInOut(prog(t, 5.0, 1.2)), lockup: easeOut(prog(t, 6.667, 1.2)), dedication: 0 };
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
    // the cloud across the head of the frame, engraved in light: each turret masks the stars behind it, then takes contour
    // lines where the city's glow catches it from below, and its edge; the flat base in horizontal strokes, ruled closer
    // where it rains
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
        arcs(tu.dark, 2.0, 0.15, 0.6);
        arcs(tu.core, 1.7, 0.12, 0.6);
        stroke(tu.edge, cq, INK, 0.9, tu.outer ? 0.5 : 0.2);
      });
      ctx.restore();
      ctx.save(); ctx.beginPath(); c.turrets.forEach(tu => { if (tu.y + tu.r > c.base - 24) tu.body.trace(ctx, 1); }); ctx.clip();
      ctx.beginPath(); ctx.rect(c.x0 - 10, c.base - 13, c.x1 - c.x0 + 20, 13); ctx.clip();
      ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
      ctx.globalAlpha = SA * cq * 0.12; ctx.beginPath();
      for (let y = c.base - 1; y > c.base - 13; y -= 2.5) { const k = (c.base - y) / 13; ctx.moveTo(c.x0 + 24 * k * k, y); ctx.lineTo(c.x1 - 24 * k * k, y); }
      ctx.stroke();
      this.veils.forEach(v => {
        const w = this.hold ? 1 : easeInOut(prog(t, v.ts, 3.0));
        if (w <= 0) return;
        const g = ctx.createLinearGradient(v.x0 - 24, 0, v.x1 + 24, 0);
        g.addColorStop(0, hex('#F1E4C8', 0)); g.addColorStop(0.3, hex('#F1E4C8', 1)); g.addColorStop(0.7, hex('#F1E4C8', 1)); g.addColorStop(1, hex('#F1E4C8', 0));
        ctx.strokeStyle = g; ctx.globalAlpha = SA * cq * 0.12 * w; ctx.beginPath();
        for (let y = c.base - 2.2; y > c.base - 12; y -= 2.5) { ctx.moveTo(v.x0 - 24, y); ctx.lineTo(v.x1 + 24, y); }
        ctx.stroke();
      });
      ctx.restore();
      stroke(new P([[c.x0 + 6, c.base], [c.x1 - 6, c.base]]), cq, INK, 0.9, 0.3);
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
    // the rain (ghayth), from the cloud's base after the aircraft has passed under it; drawn on a sheet of its own, then
    // softened behind every word that is up (a feathered box round each line of words), then laid behind the words
    this.drawRain(t, t0);
    const sil = (path, lw = 0.8, col = DARK, a = 0.2) => { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * cq; ctx.fillStyle = col; ctx.beginPath(); path.trace(ctx, 1); ctx.fill(); ctx.restore(); if (lw) stroke(path, cq, INK, lw, a); };
    const lamp = (x, y, a, w = 2, h = 1.7, col = '#F2C97A') => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a; ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - h / 2, w, h); ctx.restore(); };
    const lit = (paths, col, a, y0, y1, top = 0.6) => {
      if (a <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a;
      const g = ctx.createLinearGradient(0, y1, 0, y0); g.addColorStop(0, hex(col, 1)); g.addColorStop(1, hex(col, top));
      ctx.fillStyle = g; ctx.beginPath(); [].concat(paths).forEach(p => p.trace(ctx, 1)); ctx.fill(); ctx.restore();
    };
    const on = (v, t1 = 0.9, sp = 2.5) => prog(t, t1 + v * sp, 0.6), dq = cq * easeOut(prog(t, 0.6, 2.0));
    // the water, from the far bank to the frame's foot
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = OPT.colour ? '#0A1230' : '#04050A'; ctx.fillRect(0, hz, W, H - hz); ctx.restore();
    // the far bank: a low shore under the towers
    sil(new P([[0, F.yT + 0.6], [0, hz - 2.5], [W, hz - 2], [W, F.yT + 0.6]], true), 0.7);
    stroke(ln(0, F.yT + 0.8, W, F.yT + 0.8, 791, 0.3), fade, INK, 0.9, 0.22);
    // the homes plate's towers at kT: ADNOC HQ (the slab with the open square at its crown), the Nation Towers and their
    // sky bridge, the five Etihad Towers
    const T = this.tw11, inPlate = (o, fn) => { ctx.save(); ctx.translate(o.sx - o.px * o.k, F.yT - o.base * o.k); ctx.scale(o.k, o.k); fn(); ctx.restore(); };
    inPlate(T.adnoc, () => {
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * cq; ctx.fillStyle = DARK;
      ctx.beginPath(); T.adnoc.b.body.trace(ctx, 1); T.adnoc.hole.trace(ctx, 1); ctx.fill('evenodd'); ctx.restore();
      stroke(T.adnoc.b.body, cq, INK, 1.8, 0.24);
      this.adnocWin.forEach(([x, y, v]) => { const o = on(v, 1.1, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.2, 4.4); });
    });
    inPlate(T.nation, () => {
      this.nationT.forEach(b => sil(b.body, 1.8, DARK, 0.22));
      this.nationWin.forEach(ws => ws.forEach(([x, y, v]) => { const o = on(v, 1.2, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.2, 4.4); }));
    });
    inPlate(T.etihad, () => {
      this.towers.forEach(b => sil(b.body, 1.8, DARK, 0.22));
      this.windows.forEach(ws => ws.forEach(([x, y, v]) => { const o = on(v, 1.0, 3); if (o > 0) lamp(x, y, 0.6 * o * (0.6 + 0.4 * v), 4.2, 4.4); }));
    });
    // Aldar HQ: the lit disc behind its diagrid, the zipper round its edge
    const AL = this.aldar, aR = AL.R * F.kT;
    sil(AL.body, 0);
    ctx.save(); ctx.beginPath(); AL.body.trace(ctx, 1); ctx.clip();
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.34 * dq;
    const lg = ctx.createRadialGradient(AL.cx - aR * 0.2, AL.cy + aR * 0.15, 2, AL.cx, AL.cy, aR); lg.addColorStop(0, '#F0D9AE'); lg.addColorStop(1, '#8FA4C0');
    ctx.fillStyle = lg; ctx.fillRect(AL.cx - aR - 2, AL.cy - aR - 2, 2 * aR + 4, 2 * aR + 4);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.7 * cq; ctx.strokeStyle = DARK; ctx.lineWidth = 0.8; ctx.beginPath();
    const sp = 13.6 * F.kT, rr = aR + 2;
    for (let o = -2 * rr; o <= 2 * rr; o += sp) { [1, -1].forEach(sg => { const a = sg * Math.PI / 3; ctx.moveTo(AL.cx + o - Math.cos(a) * rr * 1.6, AL.cy - Math.sin(a) * rr * 1.6); ctx.lineTo(AL.cx + o + Math.cos(a) * rr * 1.6, AL.cy + Math.sin(a) * rr * 1.6); }); }
    ctx.stroke(); ctx.restore();
    stroke(AL.body, cq, INK, 1.0, 0.42);
    ctx.save(); ctx.beginPath(); AL.body.trace(ctx, 1); ctx.clip(); stroke(el(AL.cx, AL.cy, aR - 2.4, aR - 2.4, 0, TAU, 860, 0), cq, INK, 0.6, 0.16); ctx.restore();
    // Burj Khalifa: its tiers lit window by window, the spire pale above the occupied floors
    const B = this.bk;
    sil(B.body, 0.8, DARK, 0.26);
    ctx.save(); ctx.beginPath(); B.body.trace(ctx, 1); ctx.clip(); ctx.beginPath(); ctx.rect(B.g.X(-20), B.g.Y(828) - 2, B.g.X(20) - B.g.X(-20), B.g.Y(585) - B.g.Y(828) + 2); ctx.clip();
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * 0.5 * dq;
    const sg = ctx.createLinearGradient(0, B.g.Y(828), 0, B.g.Y(585)); sg.addColorStop(0, 'rgba(236,236,244,0.95)'); sg.addColorStop(1, 'rgba(236,236,244,0.35)');
    ctx.fillStyle = sg; ctx.fillRect(B.g.X(-20), B.g.Y(828) - 2, B.g.X(20) - B.g.X(-20), B.g.Y(585) - B.g.Y(828) + 4); ctx.restore();
    B.win.forEach(([x, y, v]) => { const o = on(v, 1.0, 3); if (o > 0) lamp(x, y, 0.62 * o * (0.6 + 0.4 * v), 2.2, 1.8); });
    // Burj Al Arab: the island, the sail with its lit fabric belly and its ribs, the exoskeleton's trusses, the helipad and
    // Al Muntaha at the top, the mast; the curving bridge to the shore
    const R_ = this.baa;
    stroke(R_.bridge, cq, INK, 0.8, 0.24);
    R_.bridgeLamps.forEach(([x, y]) => lamp(x, y - 0.8, 0.45 * cq, 1.6, 1.4));
    sil(R_.island, 0.7); sil(R_.body, 0.8, DARK, 0.28); sil(R_.mast, 0.6, DARK, 0.3);
    lit([R_.fabric], '#DDE6F4', 0.5 * dq, R_.g.Y(182), R_.g.Y(7.5), 0.7);
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = SA * 0.55 * cq; ctx.strokeStyle = DARK; ctx.lineWidth = 0.8; ctx.beginPath(); R_.ribs.forEach(p => p.trace(ctx, 1)); ctx.stroke(); ctx.restore();
    R_.truss.forEach(p => stroke(p, cq, INK, 0.9, 0.32)); stroke(R_.leg, cq, INK, 0.8, 0.3);
    R_.win.forEach(([x, y, v]) => { const o = on(v, 1.1, 3); if (o > 0) lamp(x, y, 0.55 * o * (0.6 + 0.4 * v), 1.8, 1.5); });
    R_.props.forEach(p => stroke(p, cq, INK, 0.7, 0.32));
    sil(R_.pad, 0.7, DARK, 0.45); sil(R_.muntaha, 0.6, DARK, 0.3);
    lit([R_.muntaha], '#F2C97A', 0.45 * dq, R_.g.Y(201.5), R_.g.Y(196.5), 1);
    lit([R_.mast], '#E6E9F2', 0.3 * dq, R_.g.Y(321), R_.g.Y(252), 0.5);
    // the two palaces, on their nearer bank in front of the towers. Qasr Al Watan, floodlit: its white granite pale, the dome
    // brightest (drawn first: Emirates Palace's east wing runs in front of its west wing)
    sil(this.qasr11, 0.7); sil(this.qasrDome11, 0.7); sil(this.qasrFinial11, 0.5); this.qasrDomes11.forEach(d => sil(d, 0.6));
    lit([this.qasr11, ...this.qasrDomes11], '#EADDC0', 0.72 * dq, F.yP - 25 * F.kP, F.yP, 0.75);
    lit([this.qasrDome11, this.qasrFinial11], '#F4EAD2', 0.8 * dq, F.yP - 64 * F.kP, F.yP - 41 * F.kP, 0.85);
    this.qasrLights11.forEach(([x, y, v]) => { const o = on(v); if (o > 0) lamp(x, y, 0.5 * o * (0.5 + 0.5 * v), 2.2, 1.8); });
    // Emirates Palace: its long front and the great dome, floodlit gold, the Abu Dhabi towers rising behind it
    sil(this.pal11, 0.7); sil(this.palDome11, 0.7); this.palDomes11.forEach(d => sil(d, 0.6));
    lit([this.palDome11], '#EDD199', 0.7 * dq, F.yP - 63 * F.kP, F.yP - 34 * F.kP, 0.8);
    lit([this.pal11, ...this.palDomes11], '#DDBB84', 0.55 * dq, F.yP - 34 * F.kP, F.yP, 0.62);
    this.palLights11.forEach(([x, y, v]) => { const o = on(v, 0.8); if (o > 0) lamp(x, y, 0.5 * o * (0.5 + 0.5 * v), 2.2, 1.8); });
    // the reflections of the lights: faint, shimmering columns
    const refl = (x, y0, a, len, ph, wd = 2) => { const s = 0.5 + 0.5 * this.tw(t0, ph, 1.7); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = SA * a * (0.6 + 0.4 * s); const g = ctx.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, '#F2C97A'); g.addColorStop(1, 'rgba(242,201,122,0)'); ctx.fillStyle = g; ctx.fillRect(x - wd / 2, y0 + 1, wd, len); ctx.restore(); };
    const rq = cq * easeOut(prog(t, 2.0, 2.0)), yR = F.yT + 1, yRP = F.yP + 1;
    const tx = (o, x) => o.sx + (x - o.px) * o.k;
    this.windows.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.etihad, x), yR, 0.15 * rq, 40 + 60 * v, v * 6.28, 2); }));
    this.nationWin.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.nation, x), yR, 0.15 * rq, 36 + 54 * v, v * 6.28 + 1, 2); }));
    this.adnocWin.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(tx(T.adnoc, x), yR, 0.15 * rq, 40 + 60 * v, v * 6.28 + 2, 2); });
    B.win.forEach(([x, y, v], j) => { if (j % 5 === 0) refl(x, yR, 0.14 * rq, 50 + 80 * v, v * 6.28 + 5, 2); });
    R_.win.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(x, yR, 0.12 * rq, 34 + 50 * v, v * 6.28 + 6, 2); });
    refl(R_.g.X(R_.back - 40), yR, 0.16 * rq * dq, 70, 7, 12);
    refl(AL.cx, yR, 0.12 * rq * dq, 50, 8, 14);
    this.palLights11.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(x, yRP, 0.11 * rq, 30 + 40 * v, v * 6.28 + 4, 2.2); });
    this.qasrLights11.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(x, yRP, 0.11 * rq, 28 + 36 * v, v * 6.28 + 3, 2.2); });
    refl(FIN11.x.palace, yRP, 0.12 * rq * dq, 56, 9, 14);
    refl(FIN11.x.qasr, yRP, 0.12 * rq * dq, 50, 10, 14);
    // the King Air, crossing at one altitude: never in the stage holds
    if (!this.hold) this.drawAir(t);
    // hold C (behind speeches): the whole frame dimmed
    if (this.dim) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },
  drawRain(t, t0) {
    const live = this.veils.map(v => ({ v, q: this.hold ? 1 : easeInOut(prog(t, v.ts, 3.0)) })).filter(o => o.q > 0);
    if (!live.length) return;
    if (!FINALE_RAIN) { FINALE_RAIN = document.createElement('canvas'); FINALE_RAIN.width = W * SCALE; FINALE_RAIN.height = H * SCALE; }
    const g = FINALE_RAIN.getContext('2d'), page = ctx, m = page.getTransform();
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FINALE_RAIN.width, FINALE_RAIN.height); g.setTransform(m);
    g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineWidth = 0.7;
    // the anniversary's gold: as the title (twenty years) rises, from 5.0 on the scene clock, the rain warms from silver to
    // the film's gold, the gold of the gauge's 2027 and of the twentieth drop (GOLD, #C9973B), paler where it leaves the
    // cloud; it stays fine, dashed rain (no glow, no sparks), its lines a little stronger and wider so the darker gold reads
    // as gold over the night sky (screened at the silver's strength it would read as grey)
    const k = this.hold ? 1 : easeInOut(prog(t, 5.0, 1.6)), gl = parseInt(GOLD.slice(1), 16);
    const mixc = (a, b) => a.map((c, i) => Math.round(lerp(c, b[i], k))).join(',');
    const cTop = mixc([183, 203, 239], [240, 200, 112]), cLow = mixc([183, 203, 239], [gl >> 16, (gl >> 8) & 255, gl & 255]), aK = lerp(1, 2.1, k);
    g.lineWidth = lerp(0.7, 0.9, k);
    live.forEach(({ v, q }) => v.lines.forEach(l => {
      // the rain reaches down over 1.6 s, and fades out over the lower 45% of its fall
      const reach = this.hold ? 1 : easeOut(prog(t, v.ts + 0.25 * l.w, 1.6)), y1 = l.yb + (l.foot - l.yb) * reach;
      if (y1 - l.yb < 2) return;
      const x1 = l.x - 0.12 * (y1 - l.yb), gr = g.createLinearGradient(0, l.yb, 0, l.foot);
      gr.addColorStop(0, `rgba(${cTop},1)`); gr.addColorStop(0.55, `rgba(${cLow},0.8)`); gr.addColorStop(1, `rgba(${cLow},0)`);
      g.strokeStyle = gr; g.globalAlpha = Math.min(1, 0.34 * aK * q * (0.25 + 0.75 * l.w));
      g.setLineDash([l.dash, l.gap]); g.lineDashOffset = -this.fall(t0, l);
      g.beginPath(); g.moveTo(l.x, l.yb); g.lineTo(x1, y1); g.stroke();
    }));
    // soften it behind every word that is up: a feathered box round each line of words, in screen space
    const up = this.wordsUp(t), WB = this.wordBoxes || {};
    g.setTransform(SCALE, 0, 0, SCALE, 0, 0); g.setLineDash([]); g.globalCompositeOperation = 'destination-out'; g.filter = `blur(${(14 * SCALE).toFixed(1)}px)`; g.fillStyle = '#000';
    Object.keys(up).forEach(k => { if (up[k] <= 0 || !WB[k]) return; g.globalAlpha = 0.85 * up[k]; WB[k].forEach(([x0, y0, x1, y1]) => g.fillRect(x0 - 16, y0 - 12, x1 - x0 + 32, y1 - y0 + 24)); });
    g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    page.save(); page.setTransform(1, 0, 0, 1, 0, 0); page.globalAlpha = SA; page.globalCompositeOperation = BLEND; page.drawImage(FINALE_RAIN, 0, 0); page.restore();
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
// Revision 11's rain sheet (made on first use)
let FINALE_RAIN = null;
