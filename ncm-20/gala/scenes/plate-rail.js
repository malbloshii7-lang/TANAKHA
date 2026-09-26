'use strict';
// Etihad Rail near Al Dhaid, Sharjah: a freight train on the double-track embankment across the plain, the Hajar front
// on the eastern horizon. Drawn in true perspective from one viewpoint, the eye 12 m up on a high dune, looking east,
// with a 28-degree field across the plate (1805 px a radian); the camera pans to follow the train.
//   The Hajar front: the computed skyline over UAE ground from 25.29 N, 55.86 E (data/build/rak_skyline.py
//   25.29 55.86 70 115): 0.7-1.5 deg high, 25-36 km away.
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
    this.sky = [[70.0,1.032],[70.4,1.034],[70.8,1.001],[71.2,1.056],[71.6,1.14],[72.0,1.179],[72.4,1.2],[72.8,1.181],[73.2,1.262],[73.6,1.335],[74.0,1.275],[74.4,1.229],[74.8,1.227],[75.2,1.223],[75.6,1.226],[76.0,1.283],[76.4,1.145],[76.8,1.178],[77.2,1.064],[77.6,1.099],[78.0,1.113],[78.4,1.133],[78.8,1.098],[79.2,1.098],[79.6,1.264],[80.0,1.268],[80.4,1.195],[80.8,1.127],[81.2,1.254],[81.6,1.18],[82.0,1.195],[82.4,1.238],[82.8,1.221],[83.2,1.222],[83.6,1.25],[84.0,1.274],[84.4,1.192],[84.8,1.26],[85.2,1.256],[85.6,1.424],[86.0,1.403],[86.4,1.359],[86.8,1.212],[87.2,1.176],[87.6,1.189],[88.0,1.096],[88.4,1.106],[88.8,1.084],[89.2,1.15],[89.6,1.022],[90.0,1.067],[90.4,1.054],[90.8,0.998],[91.2,1.015],[91.6,0.977],[92.0,1.037],[92.4,0.939],[92.8,0.839],[93.2,0.843],[93.6,0.821],[94.0,0.792],[94.4,0.75],[94.8,0.716],[95.2,0.743],[95.6,0.731],[96.0,0.732],[96.4,0.692],[96.8,0.596],[97.2,0.626],[97.6,0.765],[98.0,0.671],[98.4,0.894],[98.8,0.901],[99.2,0.819],[99.6,0.9],[100.0,0.805],[100.4,0.877],[100.8,1.078],[101.2,0.889],[101.6,0.891],[102.0,0.904],[102.4,0.985],[102.8,1.109],[103.2,1.067],[103.6,0.982],[104.0,1.114],[104.4,1.015],[104.8,1.033],[105.2,1.069],[105.6,1.138],[106.0,1.072],[106.4,1.05],[106.8,1.012],[107.2,0.973],[107.6,0.933],[108.0,0.97],[108.4,0.975],[108.8,1.118],[109.2,1.035],[109.6,0.993],[110.0,0.957],[110.4,1.11],[110.8,1.141],[111.2,1.143],[111.6,1.055],[112.0,0.936],[112.4,0.957],[112.8,0.893],[113.2,0.967],[113.6,0.872],[114.0,0.794],[114.4,0.694],[114.8,0.649]];
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
    hatch(rf, [RAIL.x0, RAIL.hz - 60, RAIL.x1, RAIL.hz], -1.3, 6, q, SEPIA, 0.7, 0.25, 811); stroke(rp, q, INK, 1.1, 0.5);
    // a faint dust veil along the horizon, nothing more: the day is clear
    hatch(new P([[RAIL.x0, RAIL.hz - 70], [RAIL.x1, RAIL.hz - 70], [RAIL.x1, RAIL.hz], [RAIL.x0, RAIL.hz]], true), [RAIL.x0, RAIL.hz - 70, RAIL.x1, RAIL.hz], 0, 6, q, OCHRE, 0.7, 0.12, 815);
    // the date palms of the Al Dhaid oasis, far off
    this.palms.forEach(p => {
      const x = mx(p.az), top = RAIL.hz - RAIL.f * (p.h - RAIL.eye) / p.dist, base = RAIL.hz + RAIL.f * RAIL.eye / p.dist;
      if (x < RAIL.x0 || x > RAIL.x1) return;
      stroke(new P([[x, base], [x + p.lean * (base - top), top]]), q, INK, 1, 0.45);
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.55; stroke(new P([[x + p.lean * (base - top), top], [x + p.lean * (base - top) + 5 * Math.cos(a), top + 3 + 4 * Math.sin(a) * -0.5]]), q, INK, 0.9, 0.45); }
    });
    stroke(new P([[RAIL.x0, RAIL.hz + 1], [RAIL.x1, RAIL.hz + 1]]), q, INK, 0.8, 0.35);
    // the plain: sparse ground hatching that closes up toward the horizon
    for (let k = 0; k < 26; k++) { const Y = 9 + Math.pow(k, 1.9) * 2.2, y = RAIL.hz + RAIL.f * RAIL.eye / Y; if (y > RAIL.y1) continue; const w = 30 + 200 * (9 / Y); for (let x = RAIL.x0 + (k * 37) % 90; x < RAIL.x1; x += w * 1.9) stroke(new P([[x, y], [x + w, y]]), q, SEPIA, 0.8, 0.28); }
    // the embankment (formation 2.5 m high, 12 m wide at the top, slopes 1:2) and the ditch on the far, windward side
    const S0 = -2600, S1 = 500, ez = 2.5;
    // drawn in 40 m strips so the part behind the camera simply drops out
    const strips = (o0, z0, o1, z1) => { const out = []; for (let a = S0; a < S1; a += 40) { const f = this.quad([[a, o0, z0], [a + 40, o0, z0], [a + 40, o1, z1], [a, o1, z1]], [], psi); if (f) out.push(f); } return out; };
    const farSlope = strips(8, ez, 13, 0), berm = strips(13, 0, 16, 0.6), ditch = strips(16, -0.4, 19, -0.4);
    ditch.forEach(f => fill(f, OCHRE, 0.3 * q));
    berm.forEach(f => fill(f, SEPIA, 0.12 * q));
    farSlope.forEach(f => fill(f, SEPIA, 0.1 * q));
    const nearSlope = strips(-8.5, 0, -3.5, ez), top = strips(-3.5, ez, 8, ez);
    nearSlope.forEach(f => { mask(f); hatch(f, [RAIL.x0, RAIL.hz - 20, RAIL.x1, RAIL.y1], 0.25, 5, q, SEPIA, 0.9, 0.35, 812); });
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
    this.cars.forEach(c => { boxes.push({ c, s1: s, s0: s - c.len }); s -= c.len + 1.0; });
    boxes.reverse().forEach(b => this.vehicle(b, psi, zr, tq));
    ctx.restore();
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
  vehicle(b, psi, zr, tq) {
    const { c, s0, s1 } = b;
    const probe = this.box(s0, s1, -1.6, 1.6, zr, zr + c.top, psi);
    if (!probe.all.length) return;
    const xs = probe.all.flatMap(p => p.pts.map(q => q[0]));
    if (Math.max(...xs) < RAIL.x0 - 10 || Math.min(...xs) > RAIL.x1 + 10) return;
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
