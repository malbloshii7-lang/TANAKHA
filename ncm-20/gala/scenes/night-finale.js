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
// Revision 11 (?rev11) adds, at the requester's direction, the two landmarks beside them:
//   ADNOC HQ (24.46194 N, 54.32417 E): 1.67 km at bearing 174.2°, 0.582 px a metre; 342 m, so its crown stands 11.6°
//   (199 px) high, below Suhail and well to its left, between the Nation Towers and the Etihad Towers.
//   Qasr Al Watan (24.462251 N, 54.305509 E): 2.37 km at bearing 226.6°, 0.411 px a metre, west of Emirates Palace; its
//   central dome (37 m across) stands 60 m above the ground over the 100 m Great Hall, with a wing to each side (the wings'
//   extent and their small domes are drawn to the palace's published massing, to be checked against a photograph from
//   the Marina before lock). Both are drawn as the other landmarks are: dark silhouettes against the sky, lit windows.
const FINALE_VIEW = { az0: 186, pxDeg: 17, hz: 905 };
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
    // Revision 11 (?rev11): ADNOC HQ (borrowed from the homes plate, as the Etihad and Nation Towers are) and Qasr Al Watan.
    // Their lights use their own random stream, so the approved frame's own lights are unchanged.
    this.r11 = typeof REV11 !== 'undefined' && REV11;
    const r2 = rng(2027);
    const ab = tmp.sky.find(b => b.adnoc);
    this.adnoc = { k: 0.582 / 1.155, px: 1586, base: tmp.base, sx: skyXY(0, 174.2, V)[0], b: ab,
      // the slab with the open square at its crown (the pale side walls rise past the glass to a lintel)
      hole: new P([[1569, tmp.base - 334 * 1.155], [1603, tmp.base - 334 * 1.155], [1603, tmp.base - 312 * 1.155], [1569, tmp.base - 312 * 1.155]], true) };
    this.adnocWin = []; for (let y = tmp.base - 12; y > tmp.base - 312 * 1.155 + 8; y -= 11) for (let xx = 1572; xx < 1601; xx += 7) if (r2() < 0.34) this.adnocWin.push([xx, y, r2()]);
    const qk = 0.411, qcx = skyXY(0, 226.6, V)[0], qm = h => hz - h * qk, X = mm => qcx + mm * qk;
    this.qasr = new P([[X(-150), hz], [X(-150), qm(15)], [X(-112), qm(15)], [X(-112), qm(19)], [X(-50), qm(19)], [X(-50), qm(24)],
      [X(-18.5), qm(24)], [X(-18.5), qm(41.5)], [X(18.5), qm(41.5)], [X(18.5), qm(24)], [X(50), qm(24)], [X(50), qm(19)],
      [X(112), qm(19)], [X(112), qm(15)], [X(150), qm(15)], [X(150), hz]], true);
    this.qasrDome = el(qcx, qm(41.5), 18.5 * qk, 18.5 * qk, Math.PI, TAU, 760, 0); // the great dome: 37 m across, its crown 60 m up
    this.qasrFinial = new P([[qcx - 0.6, qm(60)], [qcx, qm(64)], [qcx + 0.6, qm(60)]], true);
    this.qasrDomes = [-86, -64, 64, 86].map((x, i) => el(X(x), qm(19), 6 * qk, 6.5 * qk, Math.PI, TAU, 761 + i, 0));
    this.qasr.cx = qcx; this.qasr.k = qk;
    this.qasrLights = Array.from({ length: 56 }, () => { const x = -146 + r2() * 292; return [X(x), qm(3 + r2() * (Math.abs(x) < 50 ? 18 : 11)), r2()]; });
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
    // Revision 11: Qasr Al Watan, the farthest (2.37 km): its floodlit dome glows softly, its arcades are lit
    if (this.r11) {
      const Q = this.qasr, dq = cq * easeOut(prog(t, 0.6, 2.0));
      sil(Q); sil(this.qasrDome); sil(this.qasrFinial, 0.6); this.qasrDomes.forEach(d => sil(d, 0.7));
      // floodlit at night, as the palace is: its white granite pale against the sky, the dome brightest
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      const fl = ctx.createLinearGradient(0, hz - 64 * Q.k, 0, hz); fl.addColorStop(0, '#E9DCC0'); fl.addColorStop(1, '#B9A07A');
      ctx.fillStyle = fl; ctx.globalAlpha = 0.5 * dq; ctx.beginPath(); Q.trace(ctx, 1); this.qasrDomes.forEach(d => d.trace(ctx, 1)); ctx.fill();
      ctx.globalAlpha = 0.68 * dq; ctx.fillStyle = '#F1E6CC'; ctx.beginPath(); this.qasrDome.trace(ctx, 1); this.qasrFinial.trace(ctx, 1); ctx.fill();
      ctx.restore();
      this.qasrLights.forEach(([x, y, v]) => { const on = prog(t, 0.9 + v * 2.5, 0.6); if (on > 0) lamp(x, y, 0.5 * on * (0.5 + 0.5 * v), 2, 2); });
    }
    // Emirates Palace, then the Etihad Towers in front of it (they stand nearer)
    sil(this.palace); sil(this.palaceDome); this.palaceDomes.forEach(d => sil(d, 0.8));
    this.palaceLights.forEach(([x, y, v]) => { const on = prog(t, 0.8 + v * 2.5, 0.6); if (on > 0) lamp(x, y, 0.5 * on * (0.5 + 0.5 * v), 2, 2); });
    // Revision 11: ADNOC HQ (1.67 km), the slab with the open square at its crown, its windows lit
    if (this.r11) {
      const A = this.adnoc;
      ctx.save(); ctx.translate(A.sx - A.px * A.k, hz - A.base * A.k); ctx.scale(A.k, A.k);
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = cq; ctx.fillStyle = OPT.colour ? '#070A18' : '#05060B';
      ctx.beginPath(); A.b.body.trace(ctx, 1); A.hole.trace(ctx, 1); ctx.fill('evenodd'); ctx.restore();
      stroke(A.b.body, cq, INK, 2.4, 0.2);
      this.adnocWin.forEach(([x, y, v]) => { const on = prog(t, 1.1 + v * 3, 0.6); if (on > 0) lamp(x, y, 0.6 * on * (0.6 + 0.4 * v), 4, 6); });
      ctx.restore();
    }
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
    if (this.r11) {
      const A = this.adnoc;
      this.adnocWin.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(A.sx + (x - A.px) * A.k, 0.16 * rq, 40 + 60 * v, v * 6.28 + 2); });
      this.qasrLights.forEach(([x, y, v], j) => { if (j % 4 === 0) refl(x, 0.1 * rq, 22 + 26 * v, v * 6.28 + 3); });
    }
    this.nationWin.forEach(ws => ws.forEach(([x, y, v], j) => { if (j % 3 === 0) refl(N.sx + (x - N.px) * N.k, 0.16 * rq, 40 + 60 * v, v * 6.28 + 1); }));
    // hold C (behind speeches): the whole frame dimmed
    if (this.dim) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.dim; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  },
});
