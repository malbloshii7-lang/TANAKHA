'use strict';
// II · Al Mawsim — Ibn Majid, the dhow and the monsoon
scene({
  id: 'monsoon', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 14, dur: 8, speed: 11 / 8, num: 'II', name: 'AL MAWSIM', ar: 'الموسم', readout: 'KITAB AL-FAWA’ID · 895 AH',
  kicker: 'AHMAD IBN MAJID · JULFAR · c. 1490',
  head: ['WE SAILED', 'BY THE', 'MONSOON.'], accent: { 'MONSOON.': BLUE },
  arHead: 'وأبحرنا مع رياح الموسم',
  init() {
    const cx = 1575, cy = 408;
    this.cx = cx; this.cy = cy;
    this.rhumbs = [];
    for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU; this.rhumbs.push(ln(cx, cy, cx + 268 * Math.cos(a), cy + 268 * Math.sin(a), 300 + i, 0.3)); }
    this.circle = el(cx, cy, 268, 268, 0, TAU, 31, 1);
    this.rose = [];
    for (let k = 0; k < 16; k++) {
      const a = -Math.PI / 2 + (k * TAU) / 16, main = k % 2 === 0, r = main ? (k % 4 === 0 ? 124 : 88) : 56, w = main ? 17 : 10;
      const tip = [cx + r * Math.cos(a), cy + r * Math.sin(a)], l = [cx + w * Math.cos(a - Math.PI / 2), cy + w * Math.sin(a - Math.PI / 2)], rr = [cx + w * Math.cos(a + Math.PI / 2), cy + w * Math.sin(a + Math.PI / 2)];
      this.rose.push({ a: new P([[cx, cy], l, tip], true), b: new P([[cx, cy], rr, tip], true), main });
    }
    // a late-15th-century Gulf ship (after the Belitung wreck, the Jewel of Muscat, Ibn Majid and da Gama's accounts):
    // double-ended and sewn-plank; a straight stem raked ~30°, a near-vertical sternpost carrying a central rudder with an
    // aft-pointing tiller; through-beam ends on the side; one forward-raked mast; a four-sided palm-mat sail on an
    // oblique yard no longer than the hull (luff about 3/4 of the leech). Local coordinates: bow right, waterline y = 28.
    const sheer = cubic([-156, -58], [-90, -22], [80, -20], [162, -46], 36);
    const keel = [[112, 40]].concat(quad([112, 40], [0, 44], [-112, 42], 14).slice(1), quad([-112, 42], [-140, 40], [-148, 20], 8).slice(1));
    this.hull = new P(wob(sheer.concat(keel), 41, 0.45), true);
    const keelX = keel.slice().reverse();
    const lower = x => (x > 112 ? 40 - 1.72 * (x - 112) : x < -148 ? 20 + 9.75 * (x + 148) : yOn(keelX, x));
    this.seams = [0.26, 0.5, 0.74].map(f => { const pts = []; for (let x = -154; x <= 160; x += 6) { const ys = yOn(sheer, x); pts.push([x, ys + f * (lower(x) - ys)]); } return pts; });
    this.seamP = this.seams.map((pts, k) => new P(wob(pts, 60 + k, 0.3)));
    this.beams = [-110, -64, -18, 28, 74, 118].map(x => [x, yOn(sheer, x) + 14]); // through-beam ends
    this.stemHead = ln(162, -46, 172, -63, 48, 0.2);
    this.sternHead = ln(-156, -58, -158, -72, 49, 0.2);
    this.rail = new P(wob(cubic([-153, -50], [-90, -15], [80, -13], [158, -39], 30), 42, 0.3));
    this.rudder = new P([[-154, -40], [-176, -36], [-170, 34], [-148, 22]], true); // central rudder hung on the sternpost
    this.rudderStock = ln(-155, -40, -158, -66, 50, 0.2);
    this.tiller = ln(-157, -64, -198, -58, 57, 0.2); // aft-pointing tiller, worked by lines
    this.tillerLines = [ln(-198, -58, -128, -44, 58, 0.3), ln(-198, -58, -112, -40, 59, 0.3)];
    this.awning = [ln(-146, -54, -147, -84, 51, 0.1), ln(-112, -44, -112, -76, 52, 0.1), new P(wob(quad([-152, -84], [-130, -91], [-106, -76], 8), 53, 0.3))];
    this.mast = ln(18, -22, 50, -262, 43, 0.3);
    this.yard = ln(138, -200, -166, -290, 44, 0.4);
    const Th = [132, -202], Pk = [-160, -288], Cl = [-140, -80], Tk = [132, -52]; // the head is laced to the yard
    this.sail = new P(wob([Th, Pk].concat(quad(Pk, [-174, -180], Cl, 16).slice(1), quad(Cl, [0, -54], Tk, 18).slice(1)), 45, 0.5), true);
    this.sailMat = []; // woven palm matting: two families of lines
    for (let i = -14; i < 16; i++) { const y0 = -180 + i * 12; this.sailMat.push(new P([[-200, y0 - 0.296 * 340], [140, y0]])); }
    for (let i = 0; i < 26; i++) { const x0 = -170 + i * 12; this.sailMat.push(new P([[x0, -300], [x0 + 6, -40]])); }
    this.rig = [ln(50, -262, -100, -32, 46, 0.2), ln(50, -262, -60, -27, 47, 0.2), ln(Cl[0], Cl[1], -152, -56, 54, 0.2), ln(Tk[0], Tk[1], 168, -56, 55, 0.2)];
    // an iron grapnel anchor hung at the bow
    this.anchor = [ln(168, -58, 178, -48, 62, 0), ln(178, -48, 178, -30, 63, 0), new P(quad([178, -30], [172, -30], [170, -37], 5)), new P(quad([178, -30], [184, -30], [186, -37], 5)), new P(quad([178, -30], [178, -26], [182, -24], 4))];
    this.crew = [-128, -96, 92].map(x => [x, yOn(sheer, x) + 12]); // standing on deck, behind the bulwark
    this.waves = [];
    for (let row = 0; row < 5; row++) {
      const y = 846 + row * 28, off = row % 2 ? 22 : 0, pts = [];
      for (let x = 990 + off; x + 44 <= 1880; x += 44) pts.push(...quad([x, y], [x + 22, y - 12], [x + 44, y], 6).slice(pts.length ? 1 : 0));
      this.waves.push(new P(wob(pts, 50 + row, 0.4)));
    }
    this.sea = ln(990, 826, 1880, 826, 55, 0.5);
    // the monsoon: filling the sail from behind and skimming the water; the sail and the hull hide the stretches behind them
    this.winds = [
      new P(wob(cubic([990, 810], [1280, 782], [1560, 818], [1812, 790]), 60, 1)),
      new P(wob(cubic([990, 700], [1300, 660], [1580, 722], [1812, 676]), 61, 1)),
      new P(wob(cubic([1060, 628], [1320, 594], [1580, 650], [1808, 614]), 62, 1)),
    ];
    this.scale = ln(1846, 826, 1846, 576, 70, 0.3);
  },
  draw(lt) {
    const { cx, cy } = this;
    ctx.save();
    const z = 1 + 0.025 * easeInOut(prog(lt, 0, 11));
    ctx.translate(cx, cy); ctx.scale(z, z); ctx.rotate(-lt * 0.06); ctx.translate(-cx, -cy); // turns anticlockwise, like the sky about the North Star
    stroke(this.circle, easeInOut(prog(lt, 0.3, 1.8)), INK, 1.4, 0.7);
    this.rhumbs.forEach((r, i) => stroke(r, easeOut(prog(lt, 0.5 + (i % 8) * 0.06, 1.4)), INK, 0.9, 0.3));
    this.rose.forEach((q, k) => {
      const p = easeOut(prog(lt, 1.2 + k * 0.05, 0.6));
      fill(q.a, q.main ? INK : RED, 0.85 * p); fill(q.b, q.main ? OCHRE : '#EBDDC2', 0.55 * p);
      stroke(q.a, p, INK, 1.2, 0.8); stroke(q.b, p, INK, 1.2, 0.8);
    });
    disc(cx, cy, 14 * easeOut(prog(lt, 1.8, 0.5)), OCHRE); disc(cx, cy, 4.5 * easeOut(prog(lt, 1.9, 0.5)), INK);
    ctx.restore();
    this.winds.forEach((w, i) => {
      const p = easeInOut(prog(lt, 1.8 + i * 0.4, 2.4));
      stroke(w, p, BLUE, 3, 0.75, [26, 14], -lt * 42);
      if (p >= 1) { const e = w.pts[w.pts.length - 1], b = w.pts[w.pts.length - 4]; arrowHead(e[0], e[1], Math.atan2(e[1] - b[1], e[0] - b[0]), 16, BLUE, 0.8, 3); }
    });
    stroke(this.sea, prog(lt, 0.6, 1.4), INK, 1.3, 0.6);
    this.waves.forEach((w, i) => stroke(w, prog(lt, 0.8 + i * 0.25, 2), INK, 1.1, 0.45));
    // the isbaʿ scale: a star's altitude measured in fingers
    stroke(this.scale, easeOut(prog(lt, 3.2, 1.2)), INK, 1.2, 0.7);
    for (let k = 0; k <= 5; k++) {
      const y = 826 - k * 50, q = prog(lt, 3.4 + k * 0.08, 0.3);
      stroke(ln(1846, y, k % 5 === 0 ? 1826 : 1834, y, 80 + k, 0.1), q, INK, 1.1, 0.7);
    }
    back('ISBA‘', 1822, 580, 'right', prog(lt, 4.3, 0.6), 13, 3);
    small('ISBA‘', 1822, 580, prog(lt, 4.3, 0.6), { size: 13, ls: 3, align: 'right', a: 0.7 });
    const sq = easeOut(prog(lt, 4.1, 0.8));
    fill(starP(1846, 552, 15 * sq, 6 * sq, 8), OCHRE, 0.95); stroke(starP(1846, 552, 15 * sq, 6 * sq, 8), sq, INK, 1, 0.8);
    // the ship, riding the swell in front of the wind; everything below the waterline is hidden by the sea
    const dx = 1170 + 10 * lt, dy = 798 + 5 * Math.sin(lt * 1.4);
    const world = ctx.getTransform();
    ctx.save(); ctx.translate(dx, dy); ctx.rotate(0.02 * Math.sin(lt * 1.1));
    const hp = easeInOut(prog(lt, 1.0, 1.6)), sp = easeInOut(prog(lt, 2.2, 1.6));
    // clip at the sea line itself (y 826 on the plate), so the hull always meets the water as she pitches and heaves
    ctx.save(); const local = ctx.getTransform(); ctx.setTransform(world); ctx.beginPath(); ctx.rect(985, 100, 900, 726); ctx.clip(); ctx.setTransform(local);
    if (sp > 0) mask(this.sail);
    const fq = easeOut(prog(lt, 3.4, 0.6)); // crew: the helmsman aft, two hands forward; the hull hides their legs
    if (fq > 0) this.crew.forEach(([x, y]) => { disc(x, y - 23, 3.8 * fq, INK, 0.85); stroke(new P([[x - 4.5, y - 16], [x, y - 18.5], [x + 4.5, y - 16]]), fq, INK, 2.2, 0.85); stroke(new P([[x, y - 18], [x, y - 7]]), fq, INK, 3, 0.85); });
    mask([this.hull, this.rudder]);
    hatch(this.hull, [-200, -80, 210, 50], 0.18, 7, hp, INK, 1, 0.3, 43);
    stroke(this.hull, hp, INK, 2.1); stroke(this.rail, hp, INK, 1.3, 0.8);
    this.seamP.forEach((q, k) => stroke(q, prog(lt, 1.4 + k * 0.15, 1.0), INK, 0.9, 0.6));
    const stq = prog(lt, 2.6, 0.8); // the stitching of the sewn planks
    if (stq > 0) { ctx.save(); ctx.globalAlpha = SA * 0.5 * stq; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath();
      this.seams.forEach(pts => pts.forEach(([x, y], i) => { if (i % 2) { ctx.moveTo(x - 1.6, y - 2.2); ctx.lineTo(x + 1.6, y + 2.2); ctx.moveTo(x + 1.6, y - 2.2); ctx.lineTo(x - 1.6, y + 2.2); } })); ctx.stroke(); ctx.restore(); }
    this.beams.forEach(([x, y]) => { const b = new P([[x - 2.5, y - 2.5], [x + 2.5, y - 2.5], [x + 2.5, y + 2.5], [x - 2.5, y + 2.5]], true); fill(b, INK, 0.6 * hp); });
    stroke(this.stemHead, hp, INK, 2.4); stroke(this.sternHead, hp, INK, 2.4);
    fill(this.rudder, SEPIA, 0.35 * hp); stroke(this.rudder, hp, INK, 1.5); stroke(this.rudderStock, hp, INK, 1.8);
    stroke(this.tiller, hp, INK, 2); this.tillerLines.forEach(l => stroke(l, prog(lt, 2.6, 0.6), INK, 0.8, 0.6));
    this.awning.forEach((a, i) => stroke(a, prog(lt, 2.0 + i * 0.1, 0.5), INK, 1.3, 0.8));
    ctx.restore();
    stroke(this.mast, prog(lt, 1.8, 0.8), INK, 2.4);
    if (sp > 0) {
      fill(this.sail, OCHRE, 0.24 * sp);
      ctx.save(); ctx.beginPath(); this.sail.trace(ctx, 1); ctx.clip();
      this.sailMat.forEach(q => stroke(q, sp, SEPIA, 0.7, 0.4));
      ctx.restore();
    }
    stroke(this.sail, sp, INK, 1.6); stroke(this.yard, prog(lt, 2.0, 1.0), INK, 2.8);
    this.rig.forEach((r, i) => stroke(r, prog(lt, 3.0 + i * 0.25, 0.8), INK, 0.9, 0.6));
    this.anchor.forEach(a => stroke(a, easeOut(prog(lt, 2.2, 0.6)), INK, 1.4, 0.85));
    ctx.restore();
  },
});
