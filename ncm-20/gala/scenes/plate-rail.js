'use strict';
// Etihad Rail near Al Dhaid, Sharjah: a freight train on the double-track embankment across the plain, the Hajar front
// on the eastern horizon. Drawn in true perspective from one viewpoint, the eye 12 m up on a high dune, looking east,
// with a 28-degree field across the plate (1805 px a radian); the camera pans to follow the train.
//   The Hajar front: the computed skyline over UAE ground from 25.29 N, 55.86 E (data/build/rak_skyline.py
//   25.29 55.86 70 165; the pan looks along bearings to ~163): 0.7-1.5 deg high, 25-36 km away.
//   The locomotive: an EMD SD70-family diesel-electric as Etihad Rail runs them, 22.6 m long, about 5 m high, six axles
//   on two three-axle bogies, sand ploughs at both ends; light grey with broad bands (engraved as dense hatching, never
//   as colour), no logo. Diesel: no overhead wires. In-cab signalling: no lineside signals. No level crossings.
//   The wagons: open hopper wagons of crushed stone (Etihad Rail carries aggregates and building materials; ADMO 2023),
//   heading west from the Hajar. No containers: since 20 Sep 2026 a container train on the Fujairah line reads as the
//   Hormuz bypass. The wagon's size is typical of a four-axle aggregate hopper (15 m, 3 m wide, 3.9 m above the rail);
//   match it to Etihad Rail's photographs before the master.
//   The embankment: sand trapped in the ditch on the windward side, clean ballast; the fence along the right of way.
//   Speed 80 km/h (22.2 m/s). The beat shows the head end only.
const RAIL = { cx: 1435, hz: 430, f: 1805, eye: 12.0, azC: 90, x0: 985, x1: 1885, y0: 100, y1: 1000 };
scene({
  id: 'rail',
  init() {
    this.sky = [[70.0,1.032],[70.4,1.034],[70.8,1.001],[71.2,1.056],[71.6,1.14],[72.0,1.179],[72.4,1.2],[72.8,1.181],[73.2,1.262],[73.6,1.335],[74.0,1.275],[74.4,1.229],[74.8,1.227],[75.2,1.223],[75.6,1.226],[76.0,1.283],[76.4,1.145],[76.8,1.178],[77.2,1.064],[77.6,1.099],[78.0,1.113],[78.4,1.133],[78.8,1.098],[79.2,1.098],[79.6,1.264],[80.0,1.268],[80.4,1.195],[80.8,1.127],[81.2,1.254],[81.6,1.18],[82.0,1.195],[82.4,1.238],[82.8,1.221],[83.2,1.222],[83.6,1.25],[84.0,1.274],[84.4,1.192],[84.8,1.26],[85.2,1.256],[85.6,1.424],[86.0,1.403],[86.4,1.359],[86.8,1.212],[87.2,1.176],[87.6,1.189],[88.0,1.096],[88.4,1.106],[88.8,1.084],[89.2,1.15],[89.6,1.022],[90.0,1.067],[90.4,1.054],[90.8,0.998],[91.2,1.015],[91.6,0.977],[92.0,1.037],[92.4,0.939],[92.8,0.839],[93.2,0.843],[93.6,0.821],[94.0,0.792],[94.4,0.75],[94.8,0.716],[95.2,0.743],[95.6,0.731],[96.0,0.732],[96.4,0.692],[96.8,0.596],[97.2,0.626],[97.6,0.765],[98.0,0.671],[98.4,0.894],[98.8,0.901],[99.2,0.819],[99.6,0.9],[100.0,0.805],[100.4,0.877],[100.8,1.078],[101.2,0.889],[101.6,0.891],[102.0,0.904],[102.4,0.985],[102.8,1.109],[103.2,1.067],[103.6,0.982],[104.0,1.114],[104.4,1.015],[104.8,1.033],[105.2,1.069],[105.6,1.138],[106.0,1.072],[106.4,1.05],[106.8,1.012],[107.2,0.973],[107.6,0.933],[108.0,0.97],[108.4,0.975],[108.8,1.118],[109.2,1.035],[109.6,0.993],[110.0,0.957],[110.4,1.11],[110.8,1.141],[111.2,1.143],[111.6,1.055],[112.0,0.936],[112.4,0.957],[112.8,0.893],[113.2,0.967],[113.6,0.872],[114.0,0.794],[114.4,0.694],[114.8,0.649],[115.2,0.661],[115.6,0.683],[116.0,0.72],[116.4,0.767],[116.8,0.911],[117.2,0.9],[117.6,0.963],[118.0,0.983],[118.4,0.978],[118.8,0.968],[119.2,1.0],[119.6,0.938],[120.0,1.033],[120.4,1.122],[120.8,1.186],[121.2,1.211],[121.6,1.175],[122.0,1.152],[122.4,1.038],[122.8,1.033],[123.2,1.176],[123.6,1.22],[124.0,1.145],[124.4,1.185],[124.8,1.154],[125.2,1.013],[125.6,1.055],[126.0,1.031],[126.4,1.088],[126.8,1.117],[127.2,1.067],[127.6,1.0],[128.0,1.096],[128.4,1.078],[128.8,1.128],[129.2,1.084],[129.6,1.045],[130.0,1.054],[130.4,1.062],[130.8,1.071],[131.2,1.08],[131.6,1.083],[132.0,1.08],[132.4,1.075],[132.8,1.155],[133.2,1.066],[133.6,1.061],[134.0,1.056],[134.4,1.049],[134.8,1.041],[135.2,1.036],[135.6,1.044],[136.0,1.052],[136.4,1.06],[136.8,1.067],[137.2,1.075],[137.6,1.082],[138.0,1.088],[138.4,1.072],[138.8,1.055],[139.2,1.039],[139.6,1.023],[140.0,1.0],[140.4,0.975],[140.8,0.95],[141.2,0.924],[141.6,0.899],[142.0,0.874],[142.4,0.848],[142.8,0.823],[143.2,0.939],[143.6,0.937],[144.0,0.955],[144.4,0.789],[144.8,0.827],[145.2,0.748],[145.6,0.837],[146.0,0.742],[146.4,0.701],[146.8,0.684],[147.2,0.668],[147.6,0.651],[148.0,0.634],[148.4,0.617],[148.8,0.599],[149.2,0.582],[149.6,0.638],[150.0,0.696],[150.4,0.751],[150.8,0.695],[151.2,0.645],[151.6,0.714],[152.0,0.718],[152.4,0.614],[152.8,0.613],[153.2,0.53],[153.6,0.683],[154.0,0.705],[154.4,0.589],[154.8,0.624],[155.2,0.66],[155.6,0.698],[156.0,0.738],[156.4,0.779],[156.8,0.823],[157.2,0.866],[157.6,0.906],[158.0,0.947],[158.4,0.997],[158.8,1.04],[159.2,1.057],[159.6,1.084],[160.0,1.11],[160.4,1.135],[160.8,1.149],[161.2,1.137],[161.6,1.124],[162.0,1.109],[162.4,1.099],[162.8,1.12],[163.2,1.162],[163.6,1.218],[164.0,1.273],[164.4,1.329],[164.8,1.385]];
    const phi = 25 * Math.PI / 180;
    this.d = [Math.sin(phi), -Math.cos(phi)]; // direction of travel, on the ground plane (x right, y forward)
    this.n = [Math.cos(phi), Math.sin(phi)]; // across the track, away from the camera
    this.Q = [14, 95]; // the near track's centre line passes here (metres), where the head is at mid-beat
    // the consist, from the head back: one locomotive, then open hopper wagons of stone
    const r = rng(81);
    this.cars = [{ kind: 'loco', len: 22.6, top: 4.9 }];
    for (let k = 0; k < 50; k++) this.cars.push({ kind: 'hopper', len: 15.0, top: 3.9, heap: 0.25 + 0.2 * r() });
    this.posts = []; for (let s = -2400; s < 400; s += 4) this.posts.push(s);
    this.palms = Array.from({ length: 70 }, () => ({ az: 72 + r() * 18, dist: 2200 + r() * 2600, h: 9 + r() * 7, lean: (r() - 0.5) * 0.3 }));
    // ?heritage: ghaf trees (Prosopis cineraria, the national tree) on the plain. The browse line (camels keep them bare to
    // 3.0-3.5 m) and the stands' densities at Dhaid (29.4 trees a hectare on gravel, 93.7 on sand) are from Gallacher and
    // El-Keblawy 2016; the trees' places are composed, not surveyed, and the plain is drawn far sparser than a stand. None
    // stands behind the train's roofline or under the far palm grove: [bearing deg, distance m, height m]
    this.ghaf = [[95.5, 640, 6.5], [98.5, 700, 7], [101.5, 660, 6.5], [117.5, 310, 7], [121, 335, 6.5], [145, 520, 7], [148.5, 545, 6.5]]
      .map(([b, d, h], i) => ({ X: d * Math.sin((b - 90) * Math.PI / 180), Y: d * Math.cos((b - 90) * Math.PI / 180), h, i,
        full: RAIL.f * h / d >= 16 })); // its style is fixed from its size, so nothing switches mid-beat
  },
  // the head's position along the track (metres from Q) at scene time t, and the camera's pan that keeps it in view
  headS(t) { return -55 + 22.2 * t; },
  pan(t) {
    const [hx, hy] = this.at(this.headS(t), 0);
    return Math.atan2(hx, hy) - Math.atan2(120, RAIL.f); // the head held about 120 px right of the plate's centre
  },
  at(s, o) { return [this.Q[0] + s * this.d[0] + o * this.n[0], this.Q[1] + s * this.d[1] + o * this.n[1]]; },
  proj(X, Y, Z, psi) { // world (metres) to plate pixels, after panning the camera by psi (radians, to the right)
    const c = Math.cos(psi), sn = Math.sin(psi), x = X * c - Y * sn, y = X * sn + Y * c;
    if (y < 1) return null;
    return [RAIL.cx + RAIL.f * x / y, RAIL.hz - RAIL.f * (Z - RAIL.eye) / y, y];
  },
  quad(a, b, psi) { // a face between two points along the track (s, o) pairs, from z0 to z1: [[s,o,z]...]
    const p = a.map(([s, o, z]) => { const [X, Y] = this.at(s, o); return this.proj(X, Y, z, psi); });
    return p.some(q => !q) ? null : new P(p.map(q => [q[0], q[1]]), true);
  },
  draw(lt) {
    const psi = this.pan(lt), q = easeInOut(prog(lt, 0.2, 1.2));
    ctx.save(); ctx.beginPath(); ctx.rect(RAIL.x0, RAIL.y0, RAIL.x1 - RAIL.x0, RAIL.y1 - RAIL.y0); ctx.clip();
    // the Hajar front on the horizon (at infinity: it moves only with the pan)
    const mx = az => RAIL.cx + RAIL.f * Math.tan((az - RAIL.azC) * Math.PI / 180 - psi);
    const ridge = this.sky.map(([az, a]) => [mx(az), RAIL.hz - RAIL.f * Math.tan(a * Math.PI / 180)]);
    const rp = new P(ridge), rf = new P(ridge.concat([[ridge[ridge.length - 1][0], RAIL.hz], [ridge[0][0], RAIL.hz]]), true);
    if (OPT.colour) { // a clear sky down to the computed skyline, the Hajar in its rust, the plain in sand (the train keeps no colour:
      // its livery is not shown until Etihad Rail clears it)
      const skyP = new P(ridge.concat([[ridge[ridge.length - 1][0], RAIL.y0 - 10], [ridge[0][0], RAIL.y0 - 10]]), true);
      washFade([RAIL.x0, RAIL.y0, RAIL.x1, RAIL.hz], [[0, HUE.sky, 0.12], [0.6, HUE.sky, 0.36], [1, HUE.dawn, 0.22]], 0, q, skyP);
      wash(rf, HUE.hill, 0.34 * q);
      washFade([RAIL.x0, RAIL.hz, RAIL.x1, RAIL.y1], [[0, HUE.sand, 0.3], [1, HUE.dune, 0.45]], 0, q);
    }
    hatch(rf, [RAIL.x0, RAIL.hz - 60, RAIL.x1, RAIL.hz], -1.3, 6, q, SEPIA, 0.7, 0.25, 811); stroke(rp, q, INK, 1.1, 0.5);
    // a faint dust veil along the horizon, nothing more: the day is clear
    hatch(new P([[RAIL.x0, RAIL.hz - 70], [RAIL.x1, RAIL.hz - 70], [RAIL.x1, RAIL.hz], [RAIL.x0, RAIL.hz]], true), [RAIL.x0, RAIL.hz - 70, RAIL.x1, RAIL.hz], 0, 6, q, OCHRE, 0.7, 0.12, 815);
    // the date palms of the Al Dhaid oasis, far off
    this.palms.forEach(p => {
      const x = mx(p.az), top = RAIL.hz - RAIL.f * (p.h - RAIL.eye) / p.dist, base = RAIL.hz + RAIL.f * RAIL.eye / p.dist;
      if (x < RAIL.x0 || x > RAIL.x1) return;
      stroke(new P([[x, base], [x + p.lean * (base - top), top]]), q, OPT.colour ? '#5A3A22' : INK, 1, 0.45);
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.55; stroke(new P([[x + p.lean * (base - top), top], [x + p.lean * (base - top) + 5 * Math.cos(a), top + 3 + 4 * Math.sin(a) * -0.5]]), q, OPT.colour ? '#3F6A2A' : INK, 0.9, OPT.colour ? 0.7 : 0.45); }
    });
    stroke(new P([[RAIL.x0, RAIL.hz + 1], [RAIL.x1, RAIL.hz + 1]]), q, INK, 0.8, 0.35);
    // the plain: sparse ground hatching that closes up toward the horizon
    for (let k = 0; k < 26; k++) { const Y = 9 + Math.pow(k, 1.9) * 2.2, y = RAIL.hz + RAIL.f * RAIL.eye / Y; if (y > RAIL.y1) continue; const w = 30 + 200 * (9 / Y); for (let x = RAIL.x0 + (k * 37) % 90; x < RAIL.x1; x += w * 1.9) stroke(new P([[x, y], [x + w, y]]), q, SEPIA, 0.8, 0.28); }
    if (OPT.heritage) this.ghaf.forEach(g => this.ghafTree(g, psi, q));
    // the embankment (formation 2.5 m high, 12 m wide at the top, slopes 1:2) and the ditch on the far, windward side
    const S0 = -2600, S1 = 500, ez = 2.5;
    // drawn in 40 m strips so the part behind the camera simply drops out
    const strips = (o0, z0, o1, z1) => { const out = []; for (let a = S0; a < S1; a += 40) { const f = this.quad([[a, o0, z0], [a + 40, o0, z0], [a + 40, o1, z1], [a, o1, z1]], [], psi); if (f) out.push(f); } return out; };
    const farSlope = strips(8, ez, 13, 0), berm = strips(13, 0, 16, 0.6), ditch = strips(16, -0.4, 19, -0.4);
    ditch.forEach(f => fill(f, OCHRE, 0.3 * q));
    berm.forEach(f => fill(f, SEPIA, 0.12 * q));
    farSlope.forEach(f => fill(f, SEPIA, 0.1 * q));
    const nearSlope = strips(-8.5, 0, -3.5, ez), top = strips(-3.5, ez, 8, ez);
    nearSlope.forEach(f => { mask(f); if (OPT.colour) wash(f, HUE.dune, 0.32 * q); hatch(f, [RAIL.x0, RAIL.hz - 20, RAIL.x1, RAIL.y1], 0.25, 5, q, SEPIA, 0.9, 0.35, 812); });
    top.forEach(f => fill(f, SEPIA, 0.14 * q));
    const edge = (o, z) => { const pts = []; for (let a = S0; a <= S1; a += 20) { const [X, Y] = this.at(a, o), p = this.proj(X, Y, z, psi); if (p) pts.push([p[0], p[1]]); } return new P(pts); };
    stroke(edge(-8.5, 0), q, INK, 1, 0.55); stroke(edge(-3.5, ez), q, INK, 1, 0.6); stroke(edge(8, ez), q, INK, 0.8, 0.45); stroke(edge(16, 0), q, INK, 0.7, 0.35);
    // the rails of both tracks
    [[0, -0.72], [0, 0.72], [4.5, -0.72], [4.5, 0.72]].forEach(([tr, g]) => {
      const pts = []; for (let s = S0; s <= S1; s += 20) { const [X, Y] = this.at(s, tr + g), p = this.proj(X, Y, ez + 0.3, psi); if (p) pts.push([p[0], p[1]]); }
      if (pts.length > 1) stroke(new P(pts), q, INK, 1.1, 0.8);
    });
    // the right-of-way fence on the camera side (posts every 4 m, 1.5 m tall)
    this.posts.forEach(s => { const [X, Y] = this.at(s, -22), a = this.proj(X, Y, 0, psi), b = this.proj(X, Y, 1.5, psi); if (a && b && a[0] > RAIL.x0 - 5 && a[0] < RAIL.x1 + 5) stroke(new P([[a[0], a[1]], [b[0], b[1]]]), q, INK, Math.min(2, 60 / a[2]), 0.55); });
    const wire = z => { const pts = []; for (let s = -2400; s <= 400; s += 16) { const [X, Y] = this.at(s, -22), p = this.proj(X, Y, z, psi); if (p) pts.push([p[0], p[1]]); } return new P(pts); };
    stroke(wire(1.4), q, INK, 0.7, 0.45); stroke(wire(0.8), q, INK, 0.7, 0.35);
    // the train: vehicles from the far end forward (painter's order), each a box on the near track
    const tq = easeOut(prog(lt, 0.4, 0.8)), head = this.headS(lt), zr = ez + 0.3;
    let s = head; const boxes = [];
    // Revision 11 (?rev11): the CRRC aggregate wagons are 13.7 m over their couplers
    const R11R = typeof REV11 !== 'undefined' && REV11, carLen = c => (R11R && c.kind === 'hopper' ? 13.7 : c.len), gapAfter = c => (R11R && c.kind === 'hopper' ? 0 : 1.0);
    this.cars.forEach(c => { boxes.push({ c, s1: s, s0: s - carLen(c) }); s -= carLen(c) + gapAfter(c); });
    boxes.reverse().forEach(b => this.vehicle(b, psi, zr, tq));
    ctx.restore();
  },
  // a ghaf tree at its true size from the viewpoint, drawn as a ghaf and not the flat-topped samr: one crooked grey-brown
  // trunk forking low into two steep limbs; a rounded, deep crown about as wide as it is tall above the browse line, its
  // lower edge a ragged hem of drooping foliage down to the browse line (the ghaf's weeping habit)
  ghafTree(g, psi, q) {
    const base = this.proj(g.X, g.Y, 0, psi), top = this.proj(g.X, g.Y, g.h, psi), br = this.proj(g.X, g.Y, 3.2, psi);
    if (!base || !top || !br || base[0] < 945 || base[0] > 1925) return;
    const k = RAIL.f / base[2], xc = base[0], yb = br[1], yt = top[1], w = 1.05 * g.h * k, hh = yb - yt, rr = rng(870 + g.i);
    const yc = yb - 0.3 * hh, ph = rr() * TAU, n = 20, topPts = [];
    for (let j = 0; j <= n; j++) {
      const u = j / n, lump = 0.1 * Math.abs(Math.sin(u * Math.PI * 3 + ph)) + 0.04 * rr();
      topPts.push([xc - w / 2 + w * u, yc - (yc - yt) * Math.pow(Math.max(0, 1 - Math.pow(2 * u - 1, 2)), 0.65) * (0.9 + lump)]);
    }
    // the hem: the foliage hangs in ragged drooping tips down to the browse line, part of the crown's own outline
    const under = [], teeth = 7;
    for (let j = 0; j < teeth; j++) {
      const x0 = xc + w / 2 - w * j / teeth, x1 = x0 - w / teeth, drop = (0.55 + 0.45 * rr()) * (yb - yc);
      under.push([x0 - 0.35 * (x0 - x1), yc + drop], [x1, yc + 0.15 * (yb - yc) * rr()]);
    }
    const crown = new P(topPts.concat(under), true);
    const bark = OPT.colour ? '#5E574C' : INK, lw = Math.max(1.2, 0.45 * k);
    fill(el(xc, base[1], w / 2, 1.5, 0, TAU, 1, 0), SEPIA, 0.12 * q); // its shade on the ground, no sun direction implied
    const fork = [xc + 0.08 * k, base[1] - 0.55 * (base[1] - yc)];
    stroke(new P([[xc, base[1]], [xc + 0.12 * k, base[1] - 0.3 * (base[1] - yc)], fork]), q, bark, lw, 0.85);
    stroke(new P([fork, [xc - 0.2 * w, yc + 1]]), q, bark, Math.max(1, lw * 0.7), 0.8);
    stroke(new P([fork, [xc + 0.17 * w, yc + 1]]), q, bark, Math.max(1, lw * 0.7), 0.8);
    mask(crown, q);
    if (OPT.colour) wash(crown, '#6E7F5A', 0.45 * q); else fill(crown, SEPIA, 0.15 * q);
    if (g.full) hatch(crown, [xc - w / 2, yt - 2, xc + w / 2, yb + 2], -0.2, 3, q, INK, 1, 0.28, 850 + g.i);
    stroke(crown, q, INK, 1, 0.6);
  },
  // a box on the track from s0 to s1 (along), o0 to o1 (across; the camera is on the o0 side), z0 to z1: its visible faces
  box(s0, s1, o0, o1, z0, z1, psi) {
    const f = {};
    f.side = this.quad([[s0, o0, z0], [s1, o0, z0], [s1, o0, z1], [s0, o0, z1]], [], psi);
    f.front = this.quad([[s1, o0, z0], [s1, o1, z0], [s1, o1, z1], [s1, o0, z1]], [], psi);
    f.top = RAIL.eye > z1 ? this.quad([[s0, o0, z1], [s1, o0, z1], [s1, o1, z1], [s0, o1, z1]], [], psi) : null;
    f.all = [f.side, f.front, f.top].filter(Boolean);
    return f;
  },
  paintBox(f, tq, { side = null, top = null, front = null, lw = 1.2 } = {}) {
    if (!f.all.length) return;
    mask(f.all);
    if (f.top) { if (top) fill(f.top, top[0], top[1] * tq); stroke(f.top, tq, INK, lw * 0.8, 0.8); }
    if (f.front) { if (front) fill(f.front, front[0], front[1] * tq); stroke(f.front, tq, INK, lw, 0.9); }
    if (f.side) { if (side) fill(f.side, side[0], side[1] * tq); stroke(f.side, tq, INK, lw, 0.9); }
  },
  // Revision 11 (?rev11): the head end drawn as the locomotive Etihad Rail runs, an EMD SD70ACS, the SD70ACe built for
  // the desert (its first seven delivered in 2013; the 38 'EMD SD70' of the Stage Two fleet from Progress Rail; Railway
  // Gazette 2011, 2013, 2020; Etihad Rail 2020, 2022): 22.6 m over the couplers and nearly 5 m high (The National, 2011),
  // an isolated wide-nose cab under a tropical roof (IRJ 2015), the long hood with a walkway and handrail along each side,
  // the radiator section at the rear wider than the hood with its two big fans on the roof, two three-axle trucks with
  // their side frames outside the 1,067 mm wheels, the fuel tank slung between them, and sand ploughs at the pilot (two
  // fixed and a movable one; IRJ 2015). From the references gathered on 1 October 2026 (the maker's brochure and
  // railfan data): 22.63 m long, 4.84 m high over the tropical roof, 3.12 m wide, truck centres 14.58 m, HTSC-II trucks
  // of 3.81 m wheelbase, the deck at 1.854 m, the coupler at 0.876 m. The nose, cab and hood lengths are not published
  // and are scaled from the SD70ACe's proportions. Livery: Etihad Rail describes a light grey body "relieved with broad
  // red bands" and its logo mid-body (2012); the bands' path is not yet confirmed, so no band and no logo are drawn.
  // Distances x are metres back from the front coupler's face; o across the track (negative toward the camera); z above
  // the rail head, written for a 1.70 m deck and a 4.94 m roof and mapped by ZB onto the measured 1.854 m and 4.84 m.
  loco11(b, psi, zr, tq) {
    const s1 = b.s1, X = x => s1 - x;
    // the body's heights onto the measured deck (1.854 m) and roof (4.84 m); the frame's sill keeps its depth
    const ZB = z => (z >= 1.70 ? 1.854 + (z - 1.70) * 0.9216 : z >= 1.22 ? 1.40 + (z - 1.22) * 0.946 : z);
    const L = (x, z, o) => { const [Xw, Yw] = this.at(X(x), o), p = this.proj(Xw, Yw, zr + ZB(z), psi); return p ? [p[0], p[1]] : null; };
    const line = (a, e, lw = 0.7, al = 0.7) => { if (a && e) stroke(new P([a, e]), tq, INK, lw, al); };
    const face = pts => { const p = pts.map(([x, o, z]) => L(x, z, o)); return p.some(q => !q) ? null : new P(p, true); };
    const B = (x0, x1, o0, o1, z0, z1) => this.box(X(x1), X(x0), o0, o1, zr + ZB(z0), zr + ZB(z1), psi);
    const bb = f => [Math.min(...f.pts.map(p => p[0])) - 1, Math.min(...f.pts.map(p => p[1])) - 1, Math.max(...f.pts.map(p => p[0])) + 1, Math.max(...f.pts.map(p => p[1])) + 1];
    // a face laid on paper, toned, finely hatched (the light grey body) and outlined
    const plate = (f, { tone = null, skin = 0, ang = 0.1, gap = 4.5, lw = 0.9, al = 0.85, seed = 0 } = {}) => {
      if (!f) return;
      mask(f);
      if (tone) fill(f, tone[0], tone[1] * tq);
      if (skin) hatch(f, bb(f), ang, gap, tq, INK, 0.6, skin, 2100 + seed);
      stroke(f, tq, INK, lw, al);
    };
    const circle = (x, z, o, r, plane = 'side', n = 18) => {
      const pts = [];
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU, p = plane === 'side' ? L(x + r * Math.cos(a), z + r * Math.sin(a), o) : plane === 'roof' ? L(x + r * Math.cos(a), z, o + r * Math.sin(a)) : L(x, z + r * Math.sin(a), o + r * Math.cos(a));
        if (!p) return null; pts.push(p);
      }
      return new P(pts, true);
    };
    // the trucks (HTSC-II): centres 14.58 m apart, three axles 1.905 m apart, the wheels (1,067 mm) inside the side
    // frames, which dip to the journal boxes at each axle and rise between them; a coil-spring nest over each box
    const AX = 1.905, PS = AX / 2.05;
    [4.025, 18.605].forEach((xc, ti) => {
      [-AX, 0, AX].forEach((dx, k) => { const w = circle(xc + dx, 0.533, -0.8, 0.533); if (w) { mask(w); fill(w, INK, 0.42 * tq); stroke(w, tq, INK, 0.9, 0.85); } });
      const prof = [[-2.75, 0.75], [-2.3, 1.02], [2.3, 1.02], [2.75, 0.75], [2.55, 0.5], [2.4, 0.3], [1.7, 0.3], [1.35, 0.62], [0.7, 0.62], [0.35, 0.3], [-0.35, 0.3], [-0.7, 0.62], [-1.35, 0.62], [-1.7, 0.3], [-2.4, 0.3], [-2.55, 0.5]];
      const sf = face(prof.map(([dx, z]) => [xc + dx * PS, -1.08, z]));
      plate(sf, { tone: [INK, 0.5], lw: 0.9 });
      [-AX, 0, AX].forEach(dx => {
        plate(face([[xc + dx - 0.24, -1.14, 0.36], [xc + dx + 0.24, -1.14, 0.36], [xc + dx + 0.24, -1.14, 0.72], [xc + dx - 0.24, -1.14, 0.72]]), { tone: [INK, 0.62], lw: 0.7 });
        for (let z = 0.76; z < 1.0; z += 0.06) line(L(xc + dx - 0.16, z, -1.14), L(xc + dx + 0.16, z + 0.03, -1.14), 0.6, 0.7);
      });
      // the traction motors' and brake gear's shadow between the frames, seen through the gaps
      line(L(xc - 2.1, 1.12, -1.1), L(xc + 2.1, 1.12, -1.1), 1.2, 0.6);
    });
    // the fuel tank, 16,655 litres (The National, 2011), between the trucks: deep, its lower edges chamfered
    const tank = B(7.1, 15.5, -1.35, 1.35, 0.62, 1.22);
    this.paintBox(tank, tq, { side: [INK, 0.28], front: [INK, 0.36], lw: 0.9 });
    plate(face([[7.1, -1.35, 0.62], [15.5, -1.35, 0.62], [15.5, -1.0, 0.45], [7.1, -1.0, 0.45]]), { tone: [INK, 0.45], lw: 0.8 });
    line(L(7.2, 0.92, -1.36), L(15.4, 0.92, -1.36), 0.55, 0.5);
    // the rear steps (the far end is the hood's end) and the frame with its walkway, full width
    [21.3, 21.7].forEach(x => line(L(x, 0.45, -1.58), L(x, 1.7, -1.58), 0.8, 0.8));
    [0.55, 0.95, 1.35].forEach(z => line(L(21.3, z, -1.58), L(21.7, z, -1.58), 0.8, 0.8));
    const frame = B(0.75, 21.85, -1.55, 1.55, 1.22, 1.70);
    this.paintBox(frame, tq, { side: [INK, 0.42], top: [SEPIA, 0.2], front: [INK, 0.46], lw: 1 });
    // the radiator section at the rear: wider than the hood, its radiator cores behind long screens on each side, two
    // fans on the roof
    const rad = B(17.25, 21.6, -1.47, 1.47, 1.70, 4.62);
    if (rad.all.length) {
      mask(rad.all);
      if (rad.top) { fill(rad.top, SEPIA, 0.12 * tq); stroke(rad.top, tq, INK, 0.9, 0.8); }
      if (rad.front) { fill(rad.front, SEPIA, 0.24 * tq); stroke(rad.front, tq, INK, 1, 0.85); }
      if (rad.side) { hatch(rad.side, bb(rad.side), 0.1, 4.5, tq, INK, 0.6, 0.16, 2111); stroke(rad.side, tq, INK, 1, 0.9); }
      const scr = face([[17.7, -1.48, 2.65], [21.15, -1.48, 2.65], [21.15, -1.48, 4.35], [17.7, -1.48, 4.35]]);
      if (scr) { mask(scr); fill(scr, INK, 0.16 * tq); for (let x = 17.82; x < 21.1; x += 0.12) line(L(x, 2.68, -1.48), L(x, 4.32, -1.48), 0.5, 0.55); line(L(17.7, 3.5, -1.48), L(21.15, 3.5, -1.48), 0.7, 0.7); stroke(scr, tq, INK, 0.9, 0.85); }
      [18.35, 20.45].forEach(x => { const fan = circle(x, 4.63, 0, 0.78, 'roof', 24); if (fan) { fill(fan, INK, 0.22 * tq); stroke(fan, tq, INK, 0.8, 0.8); for (let k = -2; k <= 2; k++) line(L(x - 0.7, 4.64, k * 0.28), L(x + 0.7, 4.64, k * 0.28), 0.45, 0.5); } });
    }
    // the long hood, narrower than the frame (a walkway each side): behind the cab its louvred intakes (the filtered air
    // for the engine and electrics), then the engine room's doors; the exhaust stack and the dynamic brake's roof grille
    const hood = B(6.45, 17.25, -1.17, 1.17, 1.70, 4.52);
    if (hood.all.length) {
      mask(hood.all);
      if (hood.top) { fill(hood.top, SEPIA, 0.12 * tq); stroke(hood.top, tq, INK, 0.9, 0.8); }
      if (hood.side) {
        hatch(hood.side, bb(hood.side), 0.1, 4.5, tq, INK, 0.6, 0.16, 2112); stroke(hood.side, tq, INK, 1, 0.9);
        const lv = face([[6.75, -1.18, 3.2], [8.75, -1.18, 3.2], [8.75, -1.18, 4.32], [6.75, -1.18, 4.32]]);
        if (lv) { mask(lv); for (let z = 3.26; z < 4.3; z += 0.09) line(L(6.8, z, -1.18), L(8.7, z, -1.18), 0.5, 0.55); stroke(lv, tq, INK, 0.8, 0.8); }
        for (let x = 9.2; x < 17.1; x += 2.2) line(L(x, 1.82, -1.18), L(x, 4.32, -1.18), 0.55, 0.5);
        line(L(6.55, 4.36, -1.18), L(17.15, 4.36, -1.18), 0.55, 0.55);
      }
      const stack = B(11.6, 12.4, -0.32, 0.32, 4.52, 4.8);
      this.paintBox(stack, tq, { side: [INK, 0.5], top: [INK, 0.7], front: [INK, 0.55], lw: 0.8 });
      const grid = face([[6.9, -0.9, 4.53], [9.6, -0.9, 4.53], [9.6, 0.9, 4.53], [6.9, 0.9, 4.53]]);
      if (grid) { for (let x = 7.05; x < 9.5; x += 0.18) line(L(x, 4.53, -0.88), L(x, 4.53, 0.88), 0.45, 0.5); stroke(grid, tq, INK, 0.7, 0.7); }
    }
    // the walkway's handrail along the camera side: posts every 1.6 m at the deck's edge, one rail at 1.05 m
    for (let x = 6.7; x <= 21.4; x += 1.6) line(L(x, 1.72, -1.52), L(x, 2.75, -1.52), 0.6, 0.65);
    line(L(6.7, 2.75, -1.52), L(21.4, 2.75, -1.52), 0.8, 0.8);
    // the cab, full width, its front raked back above the nose; the tropical roof standing a hand's breadth above its
    // roof; the windscreens and the side windows
    const xr = z => 3.25 + 0.35 * (z - 3.45) / 1.3;
    plate(face([[6.45, -1.55, 1.70], [3.25, -1.55, 1.70], [3.25, -1.55, 3.45], [3.6, -1.55, 4.75], [6.45, -1.55, 4.75]]), { skin: 0.16, seed: 3, lw: 1 });
    plate(face([[3.25, -1.55, 1.70], [3.25, 1.55, 1.70], [3.25, 1.55, 3.45], [3.25, -1.55, 3.45]]), { tone: [SEPIA, 0.26], lw: 1 });
    plate(face([[3.25, -1.55, 3.45], [3.25, 1.55, 3.45], [3.6, 1.55, 4.75], [3.6, -1.55, 4.75]]), { tone: [SEPIA, 0.26], lw: 1 });
    plate(face([[3.6, -1.55, 4.75], [3.6, 1.55, 4.75], [6.45, 1.55, 4.75], [6.45, -1.55, 4.75]]), { tone: [SEPIA, 0.14], lw: 0.9 });
    const troof = B(3.5, 6.6, -1.62, 1.62, 4.82, 4.94);
    this.paintBox(troof, tq, { side: [INK, 0.3], top: [SEPIA, 0.16], front: [INK, 0.32], lw: 0.8 });
    line(L(3.6, 4.79, -1.56), L(6.45, 4.79, -1.56), 1.1, 0.6);
    [[-1.38, -0.12], [0.12, 1.38]].forEach(([a, e]) => {
      const ws = face([[xr(3.62), a, 3.62], [xr(3.62), e, 3.62], [xr(4.55), e, 4.55], [xr(4.55), a, 4.55]]);
      if (ws) { fill(ws, BLUE, 0.4 * tq); stroke(ws, tq, INK, 0.9, 0.9); }
    });
    [[3.85, 5.25], [5.45, 6.15]].forEach(([a, e]) => {
      const sw = face([[a, -1.56, 3.35], [e, -1.56, 3.35], [e, -1.56, 4.35], [a, -1.56, 4.35]]);
      if (sw) { fill(sw, BLUE, 0.34 * tq); stroke(sw, tq, INK, 0.9, 0.9); }
    });
    // the short nose ahead of the cab, a little narrower than it, its top falling toward the front; two headlights
    // high on its face (lit, as trains run by day)
    plate(face([[3.25, -1.32, 1.70], [1.95, -1.32, 1.70], [1.95, -1.32, 3.15], [3.25, -1.32, 3.45]]), { skin: 0.16, seed: 4, lw: 1 });
    plate(face([[1.95, -1.32, 1.70], [1.95, 1.32, 1.70], [1.95, 1.32, 3.15], [1.95, -1.32, 3.15]]), { tone: [SEPIA, 0.28], lw: 1 });
    plate(face([[1.95, -1.32, 3.15], [1.95, 1.32, 3.15], [3.25, 1.32, 3.45], [3.25, -1.32, 3.45]]), { tone: [SEPIA, 0.14], lw: 0.9 });
    [-0.3, 0.3].forEach(o => { const h = L(1.94, 2.85, o), e = L(1.94, 2.94, o); if (h && e) disc(h[0], h[1], Math.max(1, Math.hypot(e[0] - h[0], e[1] - h[1])), OCHRE, 0.9 * tq); });
    // the pilot under the front of the frame, the coupler, the anticlimber along the deck's front edge, the ditch lights
    // at its corners, and the sand ploughs: a V-blade just clear of the rail heads ahead of the leading wheels
    plate(face([[0.75, -1.5, 1.22], [0.75, 1.5, 1.22], [0.55, 1.4, 0.5], [0.55, -1.4, 0.5]]), { tone: [INK, 0.42], lw: 0.9 });
    plate(face([[0.35, 0, 0.08], [1.25, 1.45, 0.08], [1.25, 1.45, 0.5], [0.35, 0, 0.5]]), { tone: [INK, 0.22], lw: 0.7 });
    plate(face([[0.35, 0, 0.08], [1.25, -1.45, 0.08], [1.25, -1.45, 0.5], [0.35, 0, 0.5]]), { tone: [INK, 0.34], lw: 0.8 });
    const cpl = B(0.05, 0.75, -0.24, 0.24, 0.72, 1.04);
    this.paintBox(cpl, tq, { side: [INK, 0.6], top: [INK, 0.5], front: [INK, 0.65], lw: 0.8 });
    const ac = B(0.66, 0.8, -1.55, 1.55, 1.6, 1.78);
    this.paintBox(ac, tq, { side: [INK, 0.55], top: [INK, 0.4], front: [INK, 0.55], lw: 0.7 });
    [-1.2, 1.2].forEach(o => { const h = L(0.62, 1.42, o), e = L(0.62, 1.52, o); if (h && e) disc(h[0], h[1], Math.max(1, Math.hypot(e[0] - h[0], e[1] - h[1])), OCHRE, 0.85 * tq); });
    // the front steps at the corners and the front deck's handrails
    [0.88, 1.32].forEach(x => line(L(x, 0.45, -1.58), L(x, 1.7, -1.58), 0.8, 0.8));
    [0.55, 0.95, 1.35].forEach(z => line(L(0.88, z, -1.58), L(1.32, z, -1.58), 0.8, 0.8));
    [[-1.5, -0.55], [0.55, 1.5]].forEach(([a, e]) => { line(L(0.9, 2.75, a), L(0.9, 2.75, e), 0.8, 0.85); line(L(0.9, 2.25, a), L(0.9, 2.25, e), 0.6, 0.7); [a, e].forEach(o => line(L(0.9, 1.78, o), L(0.9, 2.75, o), 0.7, 0.8)); });
    line(L(0.9, 2.75, -1.5), L(1.95, 2.75, -1.5), 0.8, 0.85);
  },
  // Revision 11 (?rev11): the aggregate wagon as CRRC built it for Etihad Rail's Stage Two (CRRC, 17 Sep 2026): an open
  // hopper 13.7 m long and 3.212 m wide, rounded side sheets, three bottom doors, painted cool grey, 75 m3 (103 t) of
  // crushed stone; its height is not published and is drawn at 3.75 m, inside the 4.72 m gauge. Trains from the Ras Al
  // Khaimah and Fujairah quarries run 70 of them, about 1 km (Etihad Rail, 2021). Two three-piece freight bogies, their
  // side frames outside the wheels. x is metres back from the wagon's leading coupler; o and z as for the locomotive.
  hopper11(b, psi, zr, tq) {
    const { c, s1 } = b, X = x => s1 - x, LEN = 13.7;
    const L = (x, z, o) => { const [Xw, Yw] = this.at(X(x), o), p = this.proj(Xw, Yw, zr + z, psi); return p ? [p[0], p[1]] : null; };
    const line = (a, e, lw = 0.7, al = 0.7) => { if (a && e) stroke(new P([a, e]), tq, INK, lw, al); };
    const face = pts => { const p = pts.map(([x, o, z]) => L(x, z, o)); return p.some(q => !q) ? null : new P(p, true); };
    const bb = f => [Math.min(...f.pts.map(p => p[0])) - 1, Math.min(...f.pts.map(p => p[1])) - 1, Math.max(...f.pts.map(p => p[0])) + 1, Math.max(...f.pts.map(p => p[1])) + 1];
    const grey = OPT.colour ? HUE.steel : null;
    // the bogies: centres 9.3 m apart, axles 1.83 m apart, wheels 0.92 m
    [2.2, 11.5].forEach(xc => {
      [-0.915, 0.915].forEach(dx => {
        const pts = []; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, p = L(xc + dx + 0.46 * Math.cos(a), 0.46 + 0.46 * Math.sin(a), -0.78); if (!p) return; pts.push(p); }
        const w = new P(pts, true); mask(w); fill(w, INK, 0.42 * tq); stroke(w, tq, INK, 0.8, 0.8);
      });
      const sf = face([[xc - 1.35, -1.0, 0.55], [xc - 0.9, -1.0, 0.86], [xc + 0.9, -1.0, 0.86], [xc + 1.35, -1.0, 0.55], [xc + 1.05, -1.0, 0.3], [xc + 0.75, -1.0, 0.42], [xc - 0.75, -1.0, 0.42], [xc - 1.05, -1.0, 0.3]]);
      if (sf) { mask(sf); fill(sf, INK, 0.5 * tq); stroke(sf, tq, INK, 0.8, 0.85); }
    });
    // the body's near side: straight end sills over the bogies, the floor falling to the three doors between them; its
    // upper part bulges out (the rounded side sheet) to 1.606 m and turns back in to the top chord
    const zt = 3.75, zb = 3.0, sill = 1.2, door = 0.62, x0 = 0.4, x1 = LEN - 0.4;
    const lower = [[x0, -1.5, sill], [3.0, -1.5, sill], [3.7, -1.5, door], [LEN - 3.7, -1.5, door], [LEN - 3.0, -1.5, sill], [x1, -1.5, sill]];
    const belly = face(lower.concat([[x1, -1.606, zb], [x0, -1.606, zb]]));
    const shoulder = face([[x0, -1.606, zb], [x1, -1.606, zb], [x1, -1.52, zt], [x0, -1.52, zt]]);
    const endF = face([[x0, -1.5, sill], [x0, 1.5, sill], [x0, 1.52, zt], [x0, -1.52, zt]]);
    if (endF) { mask(endF); if (grey) wash(endF, grey, 0.2 * tq); fill(endF, INK, 0.2 * tq); stroke(endF, tq, INK, 0.8, 0.8); }
    if (belly) { mask(belly); if (grey) wash(belly, grey, 0.22 * tq); fill(belly, INK, 0.2 * tq); hatch(belly, bb(belly), 1.5708, 2.6, tq, INK, 0.55, 0.3, 2120); stroke(belly, tq, INK, 0.9, 0.85); }
    if (shoulder) { mask(shoulder); if (grey) wash(shoulder, grey, 0.18 * tq); fill(shoulder, INK, 0.07 * tq); stroke(shoulder, tq, INK, 0.9, 0.85); }
    for (let x = x0 + 1.1; x < x1 - 0.5; x += 1.1) line(L(x, zb - 0.05, -1.606), L(x, zt - 0.05, -1.52), 0.5, 0.4);
    // the three bottom doors, hanging between the bogies
    [4.2, 6.55, 8.9].forEach(x => {
      const d = face([[x, -1.35, door], [x + 1.6, -1.35, door], [x + 1.25, -1.0, door - 0.42], [x + 0.35, -1.0, door - 0.42]]);
      if (d) { mask(d); fill(d, INK, 0.38 * tq); stroke(d, tq, INK, 0.7, 0.8); }
    });
    // the stone heaped a little above the top chord (the eye, 12 m up, sees over it)
    const heap = face([[x0 + 0.5, -1.52, zt], [x1 - 0.5, -1.52, zt], [x1 - 1.4, 0, zt + c.heap], [x0 + 1.4, 0, zt + c.heap]]);
    if (heap) {
      const hb = bb(heap); mask(heap); fill(heap, OCHRE, 0.35 * tq); hatch(heap, hb, 0.8, 1.8, tq, SEPIA, 0.6, 0.45, 840); hatch(heap, hb, -0.7, 2.2, tq, SEPIA, 0.5, 0.35, 841);
      stroke(heap, tq, INK, 0.7, 0.6);
    }
    line(L(x0, zt, -1.52), L(x1, zt, -1.52), 1, 0.85);
  },
  vehicle(b, psi, zr, tq) {
    const { c, s0, s1 } = b;
    const probe = this.box(s0, s1, -1.6, 1.6, zr, zr + c.top, psi);
    if (!probe.all.length) return;
    const xs = probe.all.flatMap(p => p.pts.map(q => q[0]));
    if (Math.max(...xs) < RAIL.x0 - 10 || Math.min(...xs) > RAIL.x1 + 10) return;
    if (c.kind === 'loco' && typeof REV11 !== 'undefined' && REV11) { this.loco11(b, psi, zr, tq); return; }
    if (c.kind === 'hopper' && typeof REV11 !== 'undefined' && REV11) { this.hopper11(b, psi, zr, tq); return; }
    const L = (s, z, o) => { const [X, Y] = this.at(s, o), p = this.proj(X, Y, z, psi); return p ? [p[0], p[1]] : null; };
    const seg = (a, e) => a && e ? new P([a, e]) : null;
    // bogies and wheels (the near side), under the frame
    const wheels = c.kind === 'loco' ? [2.3, 4.2, 6.1, s1 - s0 - 6.1, s1 - s0 - 4.2, s1 - s0 - 2.3] : [1.7, 3.5, s1 - s0 - 3.5, s1 - s0 - 1.7];
    const bog = c.kind === 'loco' ? [[1.5, 6.9], [s1 - s0 - 6.9, s1 - s0 - 1.5]] : [[1.1, 4.1], [s1 - s0 - 4.1, s1 - s0 - 1.1]];
    bog.forEach(([a, e]) => { const f = this.box(s0 + a, s0 + e, -1.35, 1.35, zr + 0.15, zr + 0.95, psi); this.paintBox(f, tq, { side: [INK, 0.35], top: [INK, 0.3], front: [INK, 0.4], lw: 0.9 }); });
    wheels.forEach(o => { const cpt = L(s0 + o, zr + 0.48, -1.4), e = L(s0 + o + 0.48, zr + 0.48, -1.4); if (cpt && e) { const rr = Math.hypot(e[0] - cpt[0], e[1] - cpt[1]); stroke(el(cpt[0], cpt[1], rr, rr, 0, TAU, 830, 0), tq, INK, 1, 0.85); } });
    if (c.kind === 'loco') {
      // the frame with its walkways, full width; the fuel tank slung between the bogies
      const tank = this.box(s0 + 7.4, s1 - 7.4, -1.25, 1.25, zr + 0.35, zr + 1.0, psi);
      this.paintBox(tank, tq, { side: [INK, 0.3], front: [INK, 0.35], top: [INK, 0.2], lw: 0.9 });
      const frame = this.box(s0 - 0.3, s1, -1.6, 1.6, zr + 1.0, zr + 1.3, psi);
      this.paintBox(frame, tq, { side: [INK, 0.55], top: [SEPIA, 0.25], front: [INK, 0.6] });
      // the long hood, narrower than the frame, light grey (open hatching) with a broad band (dense cross-hatching)
      const hood = this.box(s0 + 0.4, s1 - 6.2, -1.05, 1.05, zr + 1.3, zr + 4.55, psi);
      this.paintBox(hood, tq, { top: [SEPIA, 0.12] });
      if (hood.side) {
        const bb = [Math.min(...hood.side.pts.map(p => p[0])), Math.min(...hood.side.pts.map(p => p[1])), Math.max(...hood.side.pts.map(p => p[0])), Math.max(...hood.side.pts.map(p => p[1]))];
        hatch(hood.side, bb, 0.12, 5, tq, INK, 0.7, 0.18, 831);
        const band = this.quad([[s0 + 0.4, -1.05, zr + 1.6], [s1 - 6.2, -1.05, zr + 1.6], [s1 - 6.2, -1.05, zr + 2.4], [s0 + 0.4, -1.05, zr + 2.4]], [], psi);
        if (band) { hatch(band, bb, 0.9, 2.4, tq, INK, 0.8, 0.5, 832); hatch(band, bb, -0.9, 2.4, tq, INK, 0.8, 0.5, 833); }
        for (let o = 0.9; o < 5.4; o += 0.32) { const g = seg(L(s0 + o, zr + 2.7, -1.05), L(s0 + o, zr + 4.4, -1.05)); if (g) stroke(g, tq, INK, 0.55, 0.55); } // the radiator grille
        for (let o = 7; o < s1 - s0 - 7; o += 2.6) { const g = seg(L(s0 + o, zr + 2.6, -1.05), L(s0 + o, zr + 4.4, -1.05)); if (g) stroke(g, tq, INK, 0.6, 0.4); } // access doors
      }
      if (hood.top) [1.6, 3.5].forEach(o => { const cpt = L(s0 + o, zr + 4.55, 0), e = L(s0 + o + 0.8, zr + 4.55, 0); if (cpt && e) { const rr = Math.hypot(e[0] - cpt[0], e[1] - cpt[1]); stroke(el(cpt[0], cpt[1], rr, rr * 0.45, 0, TAU, 834, 0), tq, INK, 0.9, 0.7); } }); // the radiator fans
      // handrails along the walkway
      const hr = seg(L(s0 + 0.2, zr + 2.3, -1.55), L(s1 - 6.3, zr + 2.3, -1.55)); if (hr) stroke(hr, tq, INK, 0.8, 0.7);
      for (let o = 0.2; o < s1 - s0 - 6.2; o += 3) { const g = seg(L(s0 + o, zr + 1.3, -1.55), L(s0 + o, zr + 2.3, -1.55)); if (g) stroke(g, tq, INK, 0.6, 0.6); }
      // the cab, full width, and its windows
      const cab = this.box(s1 - 6.2, s1 - 2.7, -1.5, 1.5, zr + 1.3, zr + 4.9, psi);
      this.paintBox(cab, tq, { top: [SEPIA, 0.15] });
      const cw = this.quad([[s1 - 5.8, -1.5, zr + 3.4], [s1 - 3.1, -1.5, zr + 3.4], [s1 - 3.1, -1.5, zr + 4.4], [s1 - 5.8, -1.5, zr + 4.4]], [], psi);
      if (cw) { fill(cw, BLUE, 0.35 * tq); stroke(cw, tq, INK, 0.9); }
      [[-1.35, -0.1], [0.1, 1.35]].forEach(([a, e]) => { const ws = this.quad([[s1 - 2.7, a, zr + 3.5], [s1 - 2.7, e, zr + 3.5], [s1 - 2.7, e, zr + 4.5], [s1 - 2.7, a, zr + 4.5]], [], psi); if (ws) { fill(ws, BLUE, 0.4 * tq); stroke(ws, tq, INK, 0.9); } });
      // the short nose and the headlights; the sand plough below the front
      const nose = this.box(s1 - 2.7, s1 - 0.2, -1.0, 1.0, zr + 1.3, zr + 3.3, psi);
      this.paintBox(nose, tq, { top: [SEPIA, 0.12] });
      [-0.55, 0.55].forEach(o => { const h = L(s1 - 0.2, zr + 2.6, o); if (h && nose.front) disc(h[0], h[1], 1.6, OCHRE, 0.9 * tq); });
      const plough = this.quad([[s1 + 0.7, -1.5, zr + 0.12], [s1 + 0.7, 1.5, zr + 0.12], [s1, 1.6, zr + 1.0], [s1, -1.6, zr + 1.0]], [], psi);
      if (plough) { fill(plough, INK, 0.35 * tq); stroke(plough, tq, INK, 1); }
      return;
    }
    // an open hopper wagon: straight sides from the underframe to the top, the two discharge pockets hanging below it
    // between the bogies, and the load of crushed stone heaped a little above the rim (the eye, 12 m up, sees over it)
    const zs = zr + 1.3, zt = zr + c.top, e0 = s0 + 0.3, e1 = s1 - 0.3;
    [[s0 + 4.5, s0 + 7.3], [s1 - 7.3, s1 - 4.5]].forEach(([a, e]) => {
      const pk = this.quad([[a, -1.35, zr + 1.0], [e, -1.35, zr + 1.0], [e - 0.8, -1.1, zr + 0.45], [a + 0.8, -1.1, zr + 0.45]], [], psi);
      if (pk) { mask(pk); fill(pk, INK, 0.3 * tq); stroke(pk, tq, INK, 0.9, 0.8); }
    });
    const sill = this.box(e0, e1, -1.45, 1.45, zr + 1.0, zs, psi);
    this.paintBox(sill, tq, { side: [INK, 0.45], front: [INK, 0.5], lw: 0.8 });
    const body = this.box(e0, e1, -1.5, 1.5, zs, zt, psi);
    this.paintBox(body, tq, { side: [SEPIA, 0.16], front: [SEPIA, 0.3], lw: 1.0 });
    if (body.side) {
      for (let o = 1.2; o < e1 - e0 - 0.6; o += 1.2) { const g = seg(L(e0 + o, zs, -1.5), L(e0 + o, zt, -1.5)); if (g) stroke(g, tq, INK, 0.55, 0.45); } // the side stakes
      const ch = seg(L(e0, zt - 0.18, -1.5), L(e1, zt - 0.18, -1.5)); if (ch) stroke(ch, tq, INK, 0.7, 0.6); // the top chord
    }
    // the stone: its near slope from the rim up to a low crest along the middle
    const heap = this.quad([[e0 + 0.5, -1.5, zt], [e1 - 0.5, -1.5, zt], [e1 - 1.4, 0, zt + c.heap], [e0 + 1.4, 0, zt + c.heap]], [], psi);
    if (heap) {
      const hb = [Math.min(...heap.pts.map(p => p[0])) - 2, Math.min(...heap.pts.map(p => p[1])) - 2, Math.max(...heap.pts.map(p => p[0])) + 2, Math.max(...heap.pts.map(p => p[1])) + 2];
      mask(heap); fill(heap, OCHRE, 0.35 * tq); hatch(heap, hb, 0.8, 1.8, tq, SEPIA, 0.6, 0.45, 840); hatch(heap, hb, -0.7, 2.2, tq, SEPIA, 0.5, 0.35, 841);
      stroke(heap, tq, INK, 0.7, 0.6);
    }
  },
});
