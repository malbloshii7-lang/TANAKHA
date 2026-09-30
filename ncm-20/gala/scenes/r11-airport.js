'use strict';
// Revision 11 · Zayed International (AUH/OMAA), in true 3D (engrave3d.js): dawn radiation fog over Terminal A, and an
// arrival on runway 31L. World metres in the RUNWAY FRAME: u along 31L's landing direction (true 306°, north-west) from its
// threshold, v to the right of it (036°, toward the midfield), z up; E3's world is [v, u, z], a rotation of east-north-up,
// so E3.sunAt takes the sun's true azimuth less 306°.
// The airfield (UAE AIP OMAA; KPF; CTBUH; as researched for this revision, 30 Sep 2026):
//   runways 13R/31L 4,106 × 60 m and 13L/31R 4,100 × 60 m, centrelines 2,000 m apart; Terminal A and the tower midfield.
//   The tower 1 km right of 31L and 2.3 km on from its threshold; Terminal A's high point 1.9 km beyond that (as the v3
//   plate computed). The tower: 109 m, a concrete crescent (a dhow's sail) on a low technical base, the glazed cab on its
//   inner curve; its broad faces look east and west. Terminal A: an X of four piers reaching ~500 m from a central processor
//   whose single roof is 319 m wide, rising to 52 m over a 50 m free-standing glazed landside facade; the pier roofs dip in
//   waves, their glazing canted outward. The X's arms lie at 45° to the runways, the landside between the two north-west
//   arms, facing the access roads (an assumption: the plan's exact bearing was not to hand).
//   31L (CAT III): 900 m approach-light line of centreline barrettes (crossbars at 150 and 300 m), a green threshold bar with
//   wing bars, touchdown-zone barrettes every 30 m for 900 m, centreline lights every 15 m, edge lights; all drawn steady.
//   ILS glide path 3.0°, 17 m (57 ft) over the threshold. RVR sensors beside the runway at 385, 1,520, 2,620 and 3,760 m
//   (twin-head masts, 2.5 m); a cup anemometer on a 10 m mast 300 m in.
//   Fog: radiation fog, commonest December–January around sunrise, a flat shallow layer: tall things stand above it.
//   Aircraft: generic, no livery; A380 class 72.7 m long, 79.75 m span, 24.1 m high; 787-9 class 62.8 × 60.1 × 17 m.
// The sun at AUH (24.4° N) in late December rises at azimuth ~116°.
const AUH = (() => {
  const D = Math.PI / 180, HEAD = 306;
  const W3 = (u, v, z = 0) => [v, u, z];
  const sunAt = (az, alt) => E3.sunAt(az - HEAD, alt);
  const dirAz = az => [Math.cos((az - HEAD) * D), Math.sin((az - HEAD) * D)]; // a compass bearing as a (u, v) unit vector
  const TWR = [2300, 1000], TA = [4200, 1000]; // the tower; Terminal A's high point
  const TL = (a, b, z = 0) => W3(TA[0] + a, TA[1] + b, z); // Terminal A's plan frame (a toward 306°, b toward 036°)
  const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k, p[2] + q[2] * k];
  const lerp3 = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  const cen = pts => E3.centroid(pts);
  const smooth = t => t * t * (3 - 2 * t);

  /* ---------- airframes: body frame x forward, y left, z up (metres), origin on the fuselage axis ---------- */
  // fus: stations [x, half-width, half-height, centre z]; wing: y stations (root, kink, tip) with their leading and trailing
  // edges and thickness; eng: nacelles by span station (lead: inlet ahead of the local leading edge); z0: the axis above
  // the ground when parked
  const TYPES = {
    twin: { // a twin-aisle twin, 787-9 class: 62.8 m long, 60.1 m span, 17 m high, fuselage 5.8 m
      z0: 5.2,
      fus: [[29.5, .12, .12, -.5], [28.3, 1.25, 1.3, -.38], [26.2, 2.15, 2.25, -.16], [23.2, 2.72, 2.8, -.02], [19, 2.9, 2.95, 0], [3.5, 2.9, 2.95, 0], [-12, 2.9, 2.95, 0],
        [-18, 2.72, 2.62, .25], [-24, 2.12, 1.92, .7], [-29, 1.3, 1.1, 1.1], [-32.4, .5, .45, 1.35], [-33.3, .12, .12, 1.4]],
      segs: [[0, 4], [4, 5], [5, 6], [6, 8], [8, 11]],
      wing: { y: [2.4, 10.5, 30.05], le: [4, -1.6, -15.2], te: [-7, -8.4, -17], t: [1.4, .9, .25], z0: -1.5, dih: 6 },
      flaps: [[3.4, 10.2, 2.6], [10.9, 21.5, 1.9]],
      eng: [{ y: 9.6, r: 1.75, lead: 5.8, len: 7.8, drop: 2.35 }],
      stab: { y: [1.1, 10.6], le: [-24.2, -31.4], te: [-30.8, -33.4], t: [.55, .15], z0: 1.3, dih: 7 },
      fin: { z: [2.8, 11.8], le: [-20.5, -28.2], te: [-31.6, -32.4], t: [1.0, .3], zte: 2.0 },
      gear: { y: 4.9, x: -3.2, top: -2.3, r: .64, w: .42, dx: .74, dy: .7, nx: 24.2, ntop: -2.6, nr: .5 },
      win: [.6], cock: 26.6,
    },
    a380: { // A380 class: 72.7 m long, 79.75 m span, 24.1 m high, fuselage 7.1 × 8.4 m (two decks)
      z0: 7.0,
      fus: [[33.6, .15, .18, -1.6], [32.3, 1.6, 2.2, -1.05], [30, 2.75, 3.5, -.45], [26.5, 3.4, 4.1, -.1], [22.5, 3.57, 4.2, 0], [4, 3.57, 4.2, 0], [-14, 3.57, 4.2, 0],
        [-22, 3.3, 3.55, .4], [-29, 2.45, 2.45, 1.05], [-35, 1.35, 1.25, 1.6], [-38.7, .45, .42, 1.9], [-39.1, .14, .14, 1.95]],
      segs: [[0, 4], [4, 5], [5, 6], [6, 8], [8, 11]],
      wing: { y: [3.2, 13.5, 39.9], le: [6.8, -.5, -19.8], te: [-11, -13.2, -23.8], t: [2.1, 1.3, .35], z0: -2.7, dih: 5.6 },
      flaps: [[4, 13, 3.2], [13.8, 30, 2.4]],
      eng: [{ y: 15.4, r: 1.65, lead: 5.5, len: 7.5, drop: 2.4 }, { y: 25.8, r: 1.6, lead: 5, len: 7.2, drop: 2.1 }],
      stab: { y: [1.8, 15.2], le: [-29.5, -38.4], te: [-37.5, -41.2], t: [.8, .2], z0: 1.8, dih: 5 },
      fin: { z: [3.3, 17.1], le: [-24, -35.6], te: [-37.6, -40.2], t: [1.4, .4], zte: 2.4 },
      gear: { y: 6.2, x: -4, top: -3.4, r: .7, w: .5, dx: .9, dy: .8, nx: 27.5, ntop: -3.9, nr: .6 },
      win: [-1.3, 1.9], cock: 30.2,
    },
  };
  // the leading or trailing edge at span station y (interpolated between the wing's stations)
  const edgeAt = (w, key, y) => {
    for (let i = 1; i < w.y.length; i++) if (y <= w.y[i] || i === w.y.length - 1) { const t = (y - w.y[i - 1]) / (w.y[i] - w.y[i - 1]); return w[key][i - 1] + (w[key][i] - w[key][i - 1]) * t; }
    return w[key][0];
  };
  const wingZ = (w, y) => w.z0 + (y - w.y[0]) * Math.tan(w.dih * D);
  const thickAt = (w, y) => edgeAt(w, 't', y);
  // a hexahedron from two chord sections (each: LE and TE points, thickness, and the section's up direction)
  function slab(a, b) { // a, b: { le, te, t } in body coordinates, the thickness along +z (or along a given normal)
    const n = a.n || [0, 0, 1], m = b.n || n;
    const P = (s, k, f) => add(s[k], s.n || n, f * s.t / 2);
    const v = [P(a, 'le', 1), P(a, 'te', .25), P(b, 'te', .25), P(b, 'le', 1), P(a, 'le', -1), P(a, 'te', -.25), P(b, 'te', -.25), P(b, 'le', -1)];
    return [[v[0], v[1], v[2], v[3]], [v[4], v[7], v[6], v[5]], [v[0], v[3], v[7], v[4]], [v[1], v[5], v[6], v[2]], [v[0], v[4], v[5], v[1]], [v[3], v[2], v[6], v[7]]];
  }
  function ringAt(x, hw, hh, zc, n, y0 = 0) { return Array.from({ length: n }, (_, m) => { const a = m / n * TAU; return [x, y0 + hw * Math.cos(a), zc + hh * Math.sin(a)]; }); }
  function tube(rings) { // side faces between consecutive rings
    const f = [];
    for (let i = 0; i + 1 < rings.length; i++) { const A = rings[i], B = rings[i + 1], n = A.length; for (let m = 0; m < n; m++) f.push([A[m], A[(m + 1) % n], B[(m + 1) % n], B[m]]); }
    return f;
  }
  // a wheel: a short cylinder across the aircraft (axis along y)
  function wheel(x, y, z, r, w, n = 10) {
    const A = [], B = [];
    for (let m = 0; m < n; m++) { const a = m / n * TAU; A.push([x + r * Math.cos(a), y - w / 2, z + r * Math.sin(a)]); B.push([x + r * Math.cos(a), y + w / 2, z + r * Math.sin(a)]); }
    return tube([A, B]).concat([A.slice(), B.slice().reverse()]);
  }
  function airframe(type, flight) {
    const k = TYPES[type], NF = 14, parts = { fus: [], side: { L: [], R: [] }, fin: null, noseGear: null, k };
    const rings = k.fus.map(([x, hw, hh, zc]) => ringAt(x, hw, hh, zc, NF));
    k.segs.forEach(([i, j]) => parts.fus.push(tube(rings.slice(i, j + 1))));
    const w = k.wing;
    ['L', 'R'].forEach(side => {
      const s = side === 'L' ? 1 : -1, out = [];
      const sect = y => ({ le: [edgeAt(w, 'le', y), s * y, wingZ(w, y)], te: [edgeAt(w, 'te', y), s * y, wingZ(w, y)], t: thickAt(w, y) });
      // the main gear (below the wing root), the engines with their pylons, the flaps, the wing panels, the stabiliser
      const g = k.gear, gz = flight ? -k.z0 + g.r - 0.35 : -k.z0 + g.r;
      const gear = { strut: [[g.x, s * g.y, g.top], [g.x, s * g.y, gz + 0.3]], wheels: [] };
      [-1, 1].forEach(ix => [-1, 1].forEach(iy => gear.wheels.push(wheel(g.x + ix * g.dx, s * (g.y + iy * g.dy), gz, g.r, g.w))));
      gear.beam = [[g.x - g.dx - .3, s * g.y, gz + .25], [g.x + g.dx + .3, s * g.y, gz + .25]];
      out.push({ kind: 'gear', ...gear });
      k.eng.forEach(e => {
        const x0 = edgeAt(w, 'le', e.y) + e.lead, x1 = x0 - e.len, zw = wingZ(w, e.y), zc = zw - e.drop, yy = s * e.y;
        const rg = [ringAt(x0, e.r * .88, e.r * .88, zc, 12, yy), ringAt(x0 - 1.1, e.r, e.r, zc, 12, yy), ringAt(x1 + 2.2, e.r * .9, e.r * .9, zc, 12, yy), ringAt(x1, e.r * .6, e.r * .6, zc, 12, yy)];
        const plug = [ringAt(x1, e.r * .34, e.r * .34, zc, 10, yy), ringAt(x1 - 1.3, e.r * .07, e.r * .07, zc, 10, yy)];
        const pyl = slab({ le: [x0 - 1.8, yy, zc + e.r * .8], te: [x1 + .4, yy, zc + e.r * .75], t: .55, n: [0, 1, 0] }, { le: [edgeAt(w, 'le', e.y) - .4, yy, zw - thickAt(w, e.y) * .3], te: [x1 - 1.5, yy, zw - thickAt(w, e.y) * .3], t: .55, n: [0, 1, 0] });
        out.push({ kind: 'eng', nac: tube(rg), inlet: rg[0], plug: tube(plug), pyl, y: e.y });
      });
      k.flaps.forEach(([ya, yb, c]) => {
        const del = 30 * D, sec = y => { const te = [edgeAt(w, 'te', y) + .5, s * y, wingZ(w, y) - .5]; return { le: te, te: add(te, [-Math.cos(del), 0, -Math.sin(del)], c), t: .22, n: [-Math.sin(del), 0, Math.cos(del)] }; };
        out.push({ kind: 'flap', f: slab(sec(ya), sec(yb)) });
      });
      for (let i = 0; i + 1 < w.y.length; i++) out.push({ kind: 'wing', f: slab(sect(w.y[i]), sect(w.y[i + 1])).filter((_, q) => q !== (i ? 4 : 5)) });
      const st = k.stab, ss = y => { const t = (y - st.y[0]) / (st.y[1] - st.y[0]), z = st.z0 + (y - st.y[0]) * Math.tan(st.dih * D); return { le: [lerp(st.le[0], st.le[1], t), s * y, z], te: [lerp(st.te[0], st.te[1], t), s * y, z], t: lerp(st.t[0], st.t[1], t) }; };
      out.push({ kind: 'stab', f: slab(ss(st.y[0]), ss(st.y[1])) });
      parts.side[side] = out;
    });
    const fn = k.fin;
    parts.fin = slab({ le: [fn.le[0], 0, fn.z[0]], te: [fn.te[0], 0, fn.zte], t: fn.t[0], n: [0, 1, 0] }, { le: [fn.le[1], 0, fn.z[1]], te: [fn.te[1], 0, fn.z[1]], t: fn.t[1], n: [0, 1, 0] });
    const g = k.gear, nz = flight ? -k.z0 + g.nr - 0.3 : -k.z0 + g.nr;
    parts.noseGear = { strut: [[g.nx, 0, g.ntop], [g.nx, 0, nz + .2]], wheels: [wheel(g.nx, .38, nz, g.nr, .35, 8), wheel(g.nx, -.38, nz, g.nr, .35, 8)] };
    return parts;
  }
  // the pose of an aircraft: position (runway frame), heading psi (degrees from +u toward +v), pitch theta (nose up)
  function poser(p) {
    const ps = p.psi * D, th = (p.theta || 0) * D;
    const f = [Math.cos(ps) * Math.cos(th), Math.sin(ps) * Math.cos(th), Math.sin(th)], l = [Math.sin(ps), -Math.cos(ps), 0], up = [-Math.cos(ps) * Math.sin(th), -Math.sin(ps) * Math.sin(th), Math.cos(th)];
    const toW = q => W3(p.u + q[0] * f[0] + q[1] * l[0] + q[2] * up[0], p.v + q[0] * f[1] + q[1] * l[1] + q[2] * up[1], p.z + q[0] * f[2] + q[1] * l[2] + q[2] * up[2]);
    // a world point back in the body frame
    const toB = w => { const d = [w[1] - p.u, w[0] - p.v, w[2] - p.z]; return [d[0] * f[0] + d[1] * f[1] + d[2] * f[2], d[0] * l[0] + d[1] * l[1], d[0] * up[0] + d[1] * up[1] + d[2] * up[2]]; };
    return { toW, toB, f, l, up };
  }
  // one solid with its faces lit or shaded one by one (E3.solid's own orientation rule), a warm wash on the faces the sun
  // lights (colour only) and a cool one in shade
  function solid(faces, st, seed, warm, inside = null, sil = false) {
    const cs = inside || E3.centroid(faces.map(E3.centroid));
    const sun = E3.sun(), C = E3.cam().C, info = sil ? [] : null;
    faces.forEach((f, i) => {
      const a = E3.sub(f[1], f[0]), b = E3.sub(f[2], f[0]), c = f.length > 3 ? E3.sub(f[3], f[0]) : b;
      let n = [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];
      if (Math.hypot(...n) < 1e-9) n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const L = Math.hypot(...n) || 1; n = [n[0] / L, n[1] / L, n[2] / L];
      if (E3.dot(n, E3.sub(E3.centroid(f), cs)) < 0) n = [-n[0], -n[1], -n[2]];
      let s = Object.assign({}, st, { n });
      if (warm && OPT.colour) {
        const lit = E3.dot(n, sun);
        if (lit > 0.25) { s.fillCol = warm; s.fillA = (st.warmA ?? 0.3) * Math.min(1, lit * 1.6) + 0.08; }
        else if (st.warmAll) { s.fillCol = warm; s.fillA = st.warmAll; } // the dawn's glow on everything that stands above the fog
      }
      if (st.inkFill && !OPT.colour) { const dk = clamp((st.tone || 0) + (st.shade ?? 0.6) * (1 - Math.max(0, E3.dot(n, sun)))); s.fillCol = INK; s.fillA = st.inkFill * dk * dk; }
      if (sil) { s.edges = false; info.push({ f, n, front: E3.dot(n, E3.sub(C, E3.centroid(f))) > 0 }); }
      E3.face(f, s, seed + i * 13);
    });
    if (sil) outline(info, st);
  }
  // an engraver's outline for a solid: its silhouette (edges between a face turned to the eye and one turned away), its
  // open borders, and its creases (sharp edges between two faces turned to the eye)
  function outline(info, st) {
    const key = p => p.map(c => Math.round(c * 20)).join(','), E = new Map();
    info.forEach((q, fi) => q.f.forEach((a, i) => { const b = q.f[(i + 1) % q.f.length], ka = key(a), kb = key(b); if (ka === kb) return; const k = ka < kb ? ka + '|' + kb : kb + '|' + ka; const e = E.get(k); if (e) e.f.push(fi); else E.set(k, { a, b, f: [fi] }); }));
    const byW = new Map();
    E.forEach(e => {
      const fs = e.f.map(i => info[i]);
      let draw = false;
      if (fs.length === 1) draw = fs[0].front;
      else { const fr = fs.filter(q => q.front).length; draw = fr === 1 || (fr === 2 && E3.dot(fs[0].n, fs[1].n) < (st.crease ?? 0.8)); }
      if (!draw) return;
      const d = Math.max(E3.cam().near, (E3.depth(e.a) + E3.depth(e.b)) / 2), lw = clamp((st.lw || 1.3) * 70 / d, 0.45, 1.9), k = Math.round(lw * 4);
      if (!byW.has(k)) byW.set(k, []);
      byW.get(k).push([e.a, e.b]);
    });
    byW.forEach((segs, k) => {
      const runs = [];
      segs.forEach(([a, b]) => { const s2 = E3.clipSeg(a, b); if (s2) runs.push(s2); });
      if (!runs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (st.edgeA ?? 0.85); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = st.edgeCol || INK; ctx.lineWidth = k / 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); runs.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  }
  // draw one aircraft, its parts in an order that is exact for convex parts seen from outside: the far side's parts, the
  // fuselage, the fin, the near side's; within a side, what hangs under the wing before the wing when the eye is above it
  function drawPlane(ac, o = {}) {
    const P = ac.parts, pose = ac.pose, C = E3.cam().C, cb = pose.toB(C), k = P.k;
    const near = cb[1] > 0 ? 'L' : 'R', far = near === 'L' ? 'R' : 'L', above = cb[2] > k.wing.z0;
    const a = o.air ?? 1, W = o.warm || null;
    const tw = pts => pts.map(pose.toW);
    const hx = pose.toW([1, 0, 0]), h0 = pose.toW([0, 0, 0]), along = [hx[0] - h0[0], hx[1] - h0[1], hx[2] - h0[2]];
    const base = { lw: o.lw ?? 1.2, edgeA: 0.85 * a, hdir: along, fillCol: o.fill ?? null, fillA: o.fillA ?? 0.25, warmA: o.warmA };
    const skin = Object.assign({}, base, { tone: o.tone ?? 0.02, shade: o.shade ?? 0.5, inkFill: o.inkFill || 0, warmAll: o.warmAll || 0 });
    const seed = ac.seed || 1;
    const gearDraw = g => {
      if (!g) return;
      const d = Math.max(1, E3.depth(tw([g.strut[0]])[0]));
      E3.line(tw(g.strut), INK, clamp(260 * .9 / d, .5, 2.2), 0.9 * a);
      if (g.beam) E3.line(tw(g.beam), INK, clamp(260 * .8 / d, .45, 2), 0.85 * a);
      g.wheels.forEach((wf, i) => solid(wf.map(tw), Object.assign({}, base, { tone: .55, shade: .35, hdir: [0, 0, 1], fillCol: OPT.colour ? '#4A4038' : null, fillA: .35, lw: .8 }), seed + 300 + i, null, null, true));
    };
    const sideDraw = side => {
      const S = P.side[side], order = above ? ['gear', 'eng', 'flap', 'wing', 'stab'] : ['stab', 'wing', 'flap', 'eng', 'gear'];
      order.forEach(kind => S.filter(p => p.kind === kind).sort((p, q) => (kind === 'eng' ? p.y - q.y : 0)).forEach((p, i) => {
        if (kind === 'gear') { if (o.gear !== false) gearDraw(p); return; }
        if (kind === 'eng') {
          solid(p.pyl.map(tw), skin, seed + 40 + i, W, null, true);
          solid(p.nac.map(tw), Object.assign({}, skin, { tone: .08 }), seed + 50 + i, W, null, true);
          solid(p.plug.map(tw), Object.assign({}, skin, { tone: .3 }), seed + 60 + i, null, null, true);
          const inl = tw(p.inlet), ic = E3.centroid(inl);
          if (E3.dot(E3.sub(C, ic), [-along[0], -along[1], -along[2]]) < 0) E3.face(inl, { n: along, tone: .7, shade: .1, noHatch: false, fillCol: OPT.colour ? '#3A342E' : null, fillA: .4, lw: .8, edgeA: .8 * a }, seed + 70 + i);
          return;
        }
        const st = kind === 'flap' ? Object.assign({}, skin, { tone: .12 }) : kind === 'wing' ? Object.assign({}, skin, { tone: .04, hdir: along }) : skin;
        solid(p.f.map(tw), st, seed + (kind === 'wing' ? 80 : kind === 'flap' ? 90 : 100) + i, W, null, true);
      }));
    };
    sideDraw(far);
    if (above) gearDraw(o.gear === false ? null : P.noseGear); else solid(P.fin.map(tw), skin, seed + 110, W, null, true);
    solid([].concat(...P.fus).map(tw), skin, seed + 120, W, null, true);
    // the cabin windows and the flight-deck windows on the side toward the eye
    const sgn = near === 'L' ? 1 : -1, hw = k.fus[5][1];
    k.win.forEach(z => {
      const run = [], x0 = k.fus[3][0] - 2.5, x1 = k.fus[7][0] + 1;
      for (let x = x0; x > x1; x -= 1.6) { const yy = sgn * hw * Math.sqrt(Math.max(0, 1 - (z / k.fus[5][2]) ** 2)) * 1.01; run.push(tw([[x, yy, z], [x - .5, yy, z]])); }
      const dd = E3.depth(h0); if (dd < 700) run.forEach(sg => E3.line(sg, INK, clamp(160 / dd, .5, 1.6), 0.55 * a));
    });
    const ck = k.cock, cz = k.fus[3][3] + k.fus[3][2] * .45;
    E3.line(tw([[ck + 1.2, sgn * k.fus[2][1] * .95, cz], [ck - 1.4, sgn * k.fus[3][1] * .99, cz + .25]]), INK, clamp(300 / Math.max(1, E3.depth(h0)), .6, 2.4), 0.8 * a);
    if (above) solid(P.fin.map(tw), skin, seed + 110, W, null, true); else gearDraw(o.gear === false ? null : P.noseGear);
    sideDraw(near);
  }

  /* ---------- Terminal A: the processor's roof and landside facade, the piers with their waving roofs ---------- */
  function terminal(res = 1) {
    const out = []; // { pts (world), st, seed }
    const hub = { ca: -10, A: 150, B: 162, p: 4 };
    const Rh = th => { const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)); return 1 / Math.pow(Math.pow(c / hub.A, hub.p) + Math.pow(s / hub.B, hub.p), 1 / hub.p); };
    // the roof: 52 m at its crown behind the landside facade, ~50 m along the facade, falling to ~30 m on the airside,
    // with long dune-like swells across it (the arches it rides on)
    const hRoof = (a, b) => { const bump = Math.exp(-(((a - 85) / 165) ** 2) - ((b / 175) ** 2)); return 21 + 31 * bump + 1.4 * Math.cos(b / 30) * (1 - bump * .6) * Math.min(1, (150 - a) / 60); };
    const hubPt = (th, fr) => { const r = Rh(th) * fr; return [hub.ca + r * Math.cos(th), r * Math.sin(th)]; };
    const NA = Math.round(48 * res), rings = res > .7 ? [0, .22, .42, .6, .76, .9, 1] : [0, .35, .7, 1];
    const armAng = [45, -45, 135, -135].map(x => x * D);
    for (let i = 0; i < NA; i++) for (let j = 0; j + 1 < rings.length; j++) {
      const t0 = i / NA * TAU, t1 = (i + 1) / NA * TAU, q = [hubPt(t0, rings[j]), hubPt(t1, rings[j]), hubPt(t1, rings[j + 1]), hubPt(t0, rings[j + 1])];
      const pts = (j === 0 ? [q[0], q[2], q[3]] : q).map(([a, b]) => TL(a, b, hRoof(a, b)));
      out.push({ pts, st: { tone: .08, shade: .42, hdir: E3.sub(TL(1, 0), TL(0, 0)), lw: 1, kind: 'roof' }, seed: 7000 + i * 7 + j, inside: add(cen(pts), [0, 0, -20]) });
    }
    // the hub's walls: the 50 m glazed landside facade (facing 306°) and the airside walls between the piers
    for (let i = 0; i < NA; i++) {
      const t0 = i / NA * TAU, t1 = (i + 1) / NA * TAU, tm = (t0 + t1) / 2;
      if (armAng.some(g => Math.abs(Math.atan2(Math.sin(tm - g), Math.cos(tm - g))) < 16 * D)) continue;
      const [a0, b0] = hubPt(t0, 1), [a1, b1] = hubPt(t1, 1), land = Math.cos(tm) > .55;
      const pts = [TL(a0, b0, 0), TL(a1, b1, 0), TL(a1, b1, hRoof(a1, b1)), TL(a0, b0, hRoof(a0, b0))];
      out.push({ pts, st: { tone: .46, shade: .3, hdir: [0, 0, 1], lw: 1, kind: 'glass' }, seed: 7600 + i, inside: TL(hub.ca, 0, cen(pts)[2]) });
    }
    // the four piers: 62 m wide at the eaves, glazing canted outward, the roof in waves ~68 m long, out to 500 m
    const piers = [];
    armAng.forEach((g, k) => {
      if (res < .7 && k === 3) return;
      const d = [Math.cos(g), Math.sin(g)], n = [-Math.sin(g), Math.cos(g)];
      const s0 = Math.hypot(hubPt(g, 1)[0] - 0, hubPt(g, 1)[1]) - 40, s1 = 500, ds = 8.5 / res;
      const hP = s => 19.5 + 3.0 * Math.cos(TAU * (s - s0) / 68) + Math.max(0, 1 - (s - s0) / 50) * 4;
      const at = (s, off, z) => TL(d[0] * s + n[0] * off, d[1] * s + n[1] * off, z);
      const lat = [[-31, 0], [-11, 1.8], [11, 1.8], [31, 0]];
      for (let s = s0; s < s1 - .1; s += ds) {
        const sa = s, sb = Math.min(s1, s + ds), ha = hP(sa), hb = hP(sb);
        for (let q = 0; q < 3; q++) out.push({ pts: [at(sa, lat[q][0], ha + lat[q][1]), at(sb, lat[q][0], hb + lat[q][1]), at(sb, lat[q + 1][0], hb + lat[q + 1][1]), at(sa, lat[q + 1][0], ha + lat[q + 1][1])], st: { tone: .02, shade: .36, hdir: E3.sub(at(1, 0, 0), at(0, 0, 0)), lw: 1, kind: 'roof' }, seed: 8000 + k * 300 + Math.round(s) + q, inside: at((sa + sb) / 2, 0, 0) });
        [-1, 1].forEach(side => out.push({ pts: [at(sa, side * 28, 0), at(sb, side * 28, 0), at(sb, side * 31, hb), at(sa, side * 31, ha)], st: { tone: .42, shade: .3, hdir: [0, 0, 1], lw: 1, kind: 'glass' }, seed: 8500 + k * 300 + Math.round(s) + side, inside: at((sa + sb) / 2, 0, (ha + hb) / 4) }));
      }
      const he = hP(s1);
      out.push({ pts: [at(s1, -28, 0), at(s1, 28, 0), at(s1, 31, he), at(s1, 11, he + 1.8), at(s1, -11, he + 1.8), at(s1, -31, he)], st: { tone: .3, shade: .3, hdir: [0, 0, 1], lw: 1, kind: 'glass' }, seed: 8900 + k, inside: at(s1 - 30, 0, he / 2) });
      piers.push({ d, n, g, at, s0, s1, hP });
    });
    // the line work: the roof's arch ribs across the processor (constant a), its eave, and each pier's eaves, ridge and
    // the troughs of its waves, as short segments (each sorted by its own depth)
    const lines = [];
    const seg = (pts, w) => { for (let i = 0; i + 1 < pts.length; i++) lines.push({ a: pts[i], b: pts[i + 1], w }); };
    const bMax = a => { const x = Math.abs((a - hub.ca) / hub.A); return x >= 1 ? 0 : hub.B * Math.pow(1 - Math.pow(x, hub.p), 1 / hub.p); };
    const rstep = res > .7 ? 24 : 40;
    for (let a = hub.ca - hub.A + rstep / 2; a < hub.ca + hub.A; a += rstep) {
      const bm = bMax(a), n = Math.max(2, Math.round(2 * bm / (res > .7 ? 16 : 32))), pts = [];
      for (let k = 0; k <= n; k++) { const b = -bm + 2 * bm * k / n; pts.push(TL(a, b, hRoof(a, b) + 0.2)); }
      seg(pts, 0.7);
    }
    const ring = []; for (let i = 0; i <= NA; i++) { const [a, b] = hubPt(i / NA * TAU, 1); ring.push(TL(a, b, hRoof(a, b) + 0.1)); }
    seg(ring, 1.6);
    piers.forEach(pr => {
      const ds = 8.5 / res, eave = side => { const pts = []; for (let s = pr.s0 + 30; s <= pr.s1 + 0.1; s += ds) pts.push(pr.at(s, side * 31, pr.hP(s))); return pts; };
      seg(eave(-1), 1.4); seg(eave(1), 1.4);
      const rid = []; for (let s = pr.s0 + 30; s <= pr.s1 + 0.1; s += ds) rid.push(pr.at(s, 0, pr.hP(s) + 1.8)); seg(rid, 0.6);
      for (let s = pr.s0 + 34; s < pr.s1; s += 68) seg([pr.at(s, -31, pr.hP(s)), pr.at(s, -11, pr.hP(s) + 1.8), pr.at(s, 11, pr.hP(s) + 1.8), pr.at(s, 31, pr.hP(s))], 0.8);
    });
    // shadow casters: point sets whose convex hulls stand for the processor's roof and each pier's roof
    const casters = [[]];
    for (let i = 0; i < 24; i++) [0.55, 1].forEach(fr => { const [a, b] = hubPt(i / 24 * TAU, fr); casters[0].push(TL(a, b, hRoof(a, b))); });
    piers.forEach(pr => { const c = []; for (let s = pr.s0 + 20; s <= pr.s1; s += 34) [-31, 31].forEach(o => c.push(pr.at(s, o, pr.hP(s)))); casters.push(c); });
    return { faces: out, piers, hRoof, lines, casters };
  }
  // Terminal A into a painter's list: every face (no facet edges) and every line segment at its own depth
  function terminalItems(list, term, ink, o = {}) {
    const k = o.k ?? 2400;
    term.faces.forEach(fc => {
      const c = E3.centroid(fc.pts), d = E3.depth(c);
      if (d < 5) return;
      list.push({ d, draw: () => {
        const a = R11.air(d, k) * ink, glass = fc.st.kind === 'glass';
        const st = Object.assign({}, fc.st, { edges: false, noHatch: o.noHatch && !glass, fillCol: OPT.colour ? (glass ? HUE.deep : '#EFE7D8') : null, fillA: glass ? 0.32 : 0.3, inkFill: glass ? (o.inkFill ?? 0.26) : 0 });
        if (o.warmAll && fc.st.kind === 'roof') st.warmAll = o.warmAll;
        solid([fc.pts], st, fc.seed, fc.st.kind === 'roof' ? o.warm : null, fc.inside);
      } });
    });
    term.lines.forEach(ln => {
      const d = E3.depth(lerp3(ln.a, ln.b, 0.5));
      if (d < 5) return;
      list.push({ d: d - 0.5, draw: () => E3.line([ln.a, ln.b], INK, clamp(ln.w * 300 / d, 0.4, 1.8), 0.8 * R11.air(d, k) * ink) });
    });
  }

  /* ---------- the crescent tower: a tapering concrete blade in a north-south plane on a low base ---------- */
  function tower() {
    const pS = dirAz(180), nE = dirAz(90); // the blade's plane runs north-south; its broad faces look east and west
    const TP = (p, n, z) => W3(TWR[0] + pS[0] * p + nE[0] * n, TWR[1] + pS[1] * p + nE[1] * n, z);
    const bez = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
    // outer (convex) edge toward the south, inner edge and the cab toward the north; 20 m base, tip at 109 m
    const outer = t => [bez(13, 24, -9, t), bez(20, 78, 109, t)], inner = t => [bez(-3, 11, -9, t), bez(20, 82, 109, t)];
    const sec = [];
    const NZ = 16;
    for (let i = 0; i <= NZ; i++) {
      const t = i / NZ, [po, zo] = outer(t), [pi, zi] = inner(t), z = (zo + zi) / 2, th = lerp(17, 4.5, Math.pow(t, 1.1)) / 2, w = po - pi;
      if (i === NZ) { sec.push([TP(-4, 0, 109)]); break; }
      sec.push([TP(pi, 0, zi), TP(pi + w * .22, -th, z), TP(po - w * .22, -th, z), TP(po, 0, zo), TP(po - w * .22, th, z), TP(pi + w * .22, th, z)]);
    }
    const blade = [];
    for (let i = 0; i + 1 < sec.length; i++) {
      const A = sec[i], B = sec[i + 1], mid = lerp3(cen(A), cen(B), 0.5);
      for (let m = 0; m < A.length; m++) {
        const m1 = (m + 1) % A.length;
        blade.push({ f: B.length === 1 ? [A[m], A[m1], B[0]] : [A[m], A[m1], B[m1], B[m]], inside: mid });
      }
    }
    const base = E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([x, y, z]) => TP(-16 + x * 40, -16 + y * 32, z * 20)));
    // the cab: a glazed ring on the inner curve at 86-94 m, under a wider roof slab
    const ci = inner(0.8)[0] - 1;
    const cab = E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([x, y, z]) => TP(ci - 12 + x * 13, -8 + y * 16, 86 + z * 8)));
    const roof = E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([x, y, z]) => TP(ci - 13.5 + x * 15.5, -9 + y * 18, 94 + z * 1.6)));
    const floor = E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([x, y, z]) => TP(ci - 12.5 + x * 14, -8.5 + y * 17, 84.8 + z * 1.2)));
    const casters = [sec.flat()];
    return { blade, base, cab, roof, floor, TP, casters };
  }
  function drawTower(tw, a, warm, tone = .1, inkFill = .3) {
    const st = { tone, shade: .5, lw: 1.1, edgeA: .85 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? HUE.steel : null, fillA: .22 + .55 * tone, inkFill };
    solid(tw.base, Object.assign({}, st, { tone: .12 }), 9100, warm);
    const info = [], C = E3.cam().C;
    tw.blade.map((b, i) => ({ b, i, d: E3.depth(E3.centroid(b.f)) })).sort((p, q) => q.d - p.d).forEach(({ b, i }) => {
      solid([b.f], Object.assign({}, st, { edges: false }), 9200 + i, warm, b.inside);
      const a1 = E3.sub(b.f[1], b.f[0]), a2 = E3.sub(b.f[b.f.length - 1], b.f[0]);
      let n = [a1[1] * a2[2] - a1[2] * a2[1], a1[2] * a2[0] - a1[0] * a2[2], a1[0] * a2[1] - a1[1] * a2[0]]; const L = Math.hypot(...n) || 1; n = n.map(c => c / L);
      if (E3.dot(n, E3.sub(E3.centroid(b.f), b.inside)) < 0) n = n.map(c => -c);
      info.push({ f: b.f, n, front: E3.dot(n, E3.sub(C, E3.centroid(b.f))) > 0 });
    });
    outline(info, Object.assign({}, st, { crease: 0.5 }));
    solid(tw.floor, Object.assign({}, st, { tone: .15 }), 9300, warm);
    solid(tw.cab, Object.assign({}, st, { tone: .55, shade: .2, fillCol: OPT.colour ? HUE.deep : BLUE, fillA: .35 }), 9310);
    solid(tw.roof, Object.assign({}, st, { tone: .1 }), 9320, warm);
  }

  /* ---------- fog lying on the ground ---------- */
  // The fog top's lines of equal depth are screen rows (the camera never rolls), so the layer is laid as bands of rows,
  // each masked with paper as thickly as the fog hides the ground seen through it on that row (the path through the fog
  // grows as the eye looks lower), then lightly hatched along its row. The bands join the painter's list at their depths:
  // the fog hides whatever stands in it, and nothing that stands above it. dens(l, t) thins it across the row (l: metres
  // right of the axis, t: depth), in long flat lenses, never in blobs.
  let FOG_CV, FOG;
  function fogLayer(list, o) {
    const cam = E3.cam(), B = R11.BOX, { C, F, U, f, cx, cy } = cam;
    const dirZ = sy => F[2] - U[2] * (sy - cy) / f;
    const yh = cy + f * F[2] / U[2];
    // the fog's grain: short strokes lying on its top, fixed in the fog (they slide with it), sorted by depth so that each
    // band draws its own
    const sk = (o.strokes || []).map(q => { const a = add(q[0], [o.slide || 0, 0, 0]), b = add(q[1], [o.slide || 0, 0, 0]); a[2] = b[2] = o.h; return { a, b, k: q[2], d: E3.depth(lerp3(a, b, 0.5)) }; }).filter(q => q.d > 1).sort((p, q) => p.d - q.d);
    // the hatching's rows: from the horizon down, closer near it
    const rows = [];
    if (o.rule) for (let y = yh + 2.2; y < B[3]; y += clamp(2.6 + (y - yh) * 0.011, 2.6, 6.2)) rows.push(y);
    const slabs = [{ z0: 0, z1: o.h, V: o.V, amt: 1, grain: true }].concat((o.veils || []).map(([dh0, dh1, V, amt]) => ({ z0: o.h + dh0, z1: o.h + dh1, V, amt })));
    slabs.forEach(sl => {
    const oo = Object.assign({}, o, { amt: o.amt * sl.amt });
    let y = Math.max(B[1], yh + 0.5);
    while (y < B[3]) {
      const hgt = clamp(1.5 + (y - yh) * 0.032, 1.5, 11), y1 = Math.min(B[3], y + hgt), ym = (y + y1) / 2, dz = dirZ(ym);
      if (dz < -1e-6 && C[2] > sl.z1) {
        const t = (sl.z1 - C[2]) / dz, L = (sl.z1 - sl.z0) / -dz, a0 = 1 - Math.exp(-3 * L / sl.V);
        const tf = dirZ(y) < -1e-6 ? (sl.z1 - C[2]) / dirZ(y) : 1e9, tn = (sl.z1 - C[2]) / dirZ(y1);
        // the strokes whose depth falls in this band's range
        let i0 = 0, i1 = sk.length;
        { let lo = 0, hi = sk.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sk[m].d < tn) lo = m + 1; else hi = m; } i0 = lo; }
        { let lo = i0, hi = sk.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sk[m].d < tf) lo = m + 1; else hi = m; } i1 = lo; }
        const mine = sl.grain ? sk.slice(i0, i1) : [], myRows = sl.grain ? rows.filter(r => r >= y && r < y1) : [];
        if (t > 0) { const ya = y; list.push({ d: t, draw: () => fogBand(oo, ya, y1, t, a0, mine, myRows) }); }
      }
      y = y1;
    }
    });
  }
  // a colour from gradient stops [[offset, '#rrggbb', alpha]...] at offset u, as [r, g, b, a]
  function stopAt(stops, u) {
    const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    if (u <= stops[0][0]) return [...hex(stops[0][1]), stops[0][2]];
    for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) { const a = stops[i - 1], b = stops[i], k = (u - a[0]) / ((b[0] - a[0]) || 1), ca = hex(a[1]), cb = hex(b[1]); return [0, 1, 2].map(q => Math.round(ca[q] + (cb[q] - ca[q]) * k)).concat([a[2] + (b[2] - a[2]) * k]); }
    const l = stops[stops.length - 1]; return [...hex(l[1]), l[2]];
  }
  function fogBand(o, ya, yb, t, a0, strokes, rows = []) {
    const B = R11.BOX, cam = E3.cam(), f = cam.f, cx = cam.cx;
    // runs of equal density across the row (22 px cells, the density in steps of 1/40), each laid as paper at that
    // density, and in colour tinted by the fog's colour there
    const CW = 22, runs = [];
    for (let x = B[0]; x < B[2]; x += CW) {
      const l = (x + CW / 2 - cx) / f * t, al = Math.round(clamp(a0 * (o.dens ? o.dens(l, t) : 1) * o.amt) * 40) / 40, x1 = Math.min(B[2], x + CW);
      const last = runs[runs.length - 1];
      if (last && last.a === al) last.x1 = x1; else runs.push({ x0: x, x1, a: al });
    }
    ctx.save();
    PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.fillStyle = PAPER_PAT; ctx.globalCompositeOperation = 'source-over';
    runs.forEach(r => { if (r.a < 0.004) return; ctx.globalAlpha = SA * r.a; ctx.fillRect(r.x0, ya, r.x1 - r.x0, yb - ya); });
    if (o.tint) {
      const stops = o.tint(t);
      ctx.globalCompositeOperation = 'multiply';
      runs.forEach(r => {
        if (r.a < 0.004) return;
        for (let x = r.x0; x < r.x1; x += 44) {
          const x1 = Math.min(r.x1, x + 44), c = stopAt(stops, ((x + x1) / 2 - B[0]) / (B[2] - B[0]));
          ctx.globalAlpha = SA * r.a * c[3]; ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; ctx.fillRect(x, ya, x1 - x, yb - ya);
        }
      });
    }
    ctx.restore();
    // the shadows of what stands out of the fog, lying on its top (all hulls wound the same way, so one fill is their union)
    // (a wash in colour, over horizontal rules on a fixed 2.6 px pitch, so the shadow reads as engraved tone)
    if (o.shadow && o.shadow.polys.length) {
      const sa = SA * o.shadow.a * clamp(a0 * 1.2);
      ctx.save(); ctx.beginPath(); ctx.rect(B[0], ya, B[2] - B[0], yb - ya); ctx.clip();
      ctx.beginPath(); o.shadow.polys.forEach(q => q.trace(ctx, 1)); ctx.clip('nonzero');
      if (OPT.colour) { ctx.globalAlpha = sa * 0.8; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.shadow.col; ctx.fillRect(B[0], ya, B[2] - B[0], yb - ya); }
      ctx.globalAlpha = sa * (OPT.colour ? 0.5 : 1.15); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = OPT.colour ? '#4E5A6A' : INK; ctx.lineWidth = 0.85; ctx.lineCap = 'butt';
      ctx.beginPath(); for (let y = Math.ceil(ya / 2.6) * 2.6; y < yb; y += 2.6) { ctx.moveTo(B[0], y); ctx.lineTo(B[2], y); } ctx.stroke();
      ctx.restore();
    }
    // light horizontal hatching on the rows in this band, in flat bands and lenses (o.rule gives each dash its weight)
    if (rows.length && o.rule) {
      const segs = [[], [], [], []];
      rows.forEach(yr => { for (let x = B[0]; x < B[2]; x += 10) { const l = (x + 5 - cx) / f * t, al = o.rule(x + 5, yr, l, t) * clamp(a0 * (o.dens ? o.dens(l, t) : 1) * o.amt * 1.4); if (al > 0.03) segs[Math.min(3, Math.floor(al * 4))].push([x, yr]); } });
      segs.forEach((ss, k) => {
        if (!ss.length) return;
        ctx.save(); ctx.globalAlpha = SA * (o.ruleA ?? 0.3) * (k + 0.6) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = o.lineCol || SEPIA; ctx.lineWidth = o.ruleW || 0.7; ctx.lineCap = 'butt';
        ctx.beginPath(); ss.forEach(([x, yr]) => { ctx.moveTo(x, yr); ctx.lineTo(x + 10.2, yr); }); ctx.stroke(); ctx.restore();
      });
    }
    // the fog's grain: its strokes, fainter toward the sun and the horizon and where the fog thins
    if (strokes.length && o.grain) {
      const segs = [[], [], [], []];
      strokes.forEach(q => {
        const pa = E3.proj(q.a), pb = E3.proj(q.b), xm = (pa[0] + pb[0]) / 2, l = (xm - cx) / f * q.d;
        const al = o.grain(xm, pa[1], l, q.d, q.k) * clamp(a0 * (o.dens ? o.dens(l, q.d) : 1) * o.amt * 1.5);
        if (al > 0.02) segs[Math.min(3, Math.floor(al * 4))].push([pa, pb]);
      });
      segs.forEach((ss, k) => {
        if (!ss.length) return;
        ctx.save(); ctx.globalAlpha = SA * (k + 0.6) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = o.lineCol || SEPIA; ctx.lineWidth = o.lw || 0.8; ctx.lineCap = 'round';
        ctx.beginPath(); ss.forEach(([a, b]) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }); ctx.stroke(); ctx.restore();
      });
    }
  }
  // strokes for a fog's top: uniform on the screen from the camera's view (depth sampled uniformly in 1/depth, across the
  // view's width), each ~len px long, lying along the view's cross direction
  function fogStrokes(n, seed, { t0 = 40, t1 = 4000, half = 0.6, len = 40, jit = 0.25 } = {}) {
    const r = rng(seed), cam = E3.cam(), Fh = [cam.F[0], cam.F[1], 0], Lh = Math.hypot(Fh[0], Fh[1]); Fh[0] /= Lh; Fh[1] /= Lh;
    const Rh = [Fh[1], -Fh[0], 0], out = [];
    for (let i = 0; i < n; i++) {
      const t = 1 / lerp(1 / t0, 1 / t1, r()), l = (r() * 2 - 1) * half * t, L = len * (0.4 + 1.2 * r()) * t / cam.f, ang = (r() - 0.5) * jit * 0.2;
      const c = add(add(cam.C, Fh, t), Rh, l), d = [Rh[0] * Math.cos(ang) + Fh[0] * Math.sin(ang), Rh[1] * Math.cos(ang) + Fh[1] * Math.sin(ang), 0];
      out.push([add(c, d, -L / 2), add(c, d, L / 2), r()]);
    }
    return out;
  }
  // polygons filled as one union (no seams where they overlap), laid on the page in multiply at alpha a
  let UN_CV, UN;
  function unionFill(polys, col, a, rule = 0) {
    if (a <= 0 || !polys.length) return;
    if (!UN_CV) { UN_CV = document.createElement('canvas'); UN_CV.width = W * SCALE; UN_CV.height = H * SCALE; UN = UN_CV.getContext('2d'); }
    const m = ctx.getTransform(), g = UN;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    polys.forEach(q => q.pts.forEach(([x, y]) => { const X = m.a * x + m.e, Y = m.d * y + m.f; x0 = Math.min(x0, X); y0 = Math.min(y0, Y); x1 = Math.max(x1, X); y1 = Math.max(y1, Y); }));
    x0 = Math.max(0, Math.floor(x0) - 2); y0 = Math.max(0, Math.floor(y0) - 2); x1 = Math.min(W * SCALE, Math.ceil(x1) + 2); y1 = Math.min(H * SCALE, Math.ceil(y1) + 2);
    if (x1 <= x0 || y1 <= y0) return;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(x0, y0, x1 - x0, y1 - y0); g.setTransform(m); g.fillStyle = col;
    polys.forEach(q => { g.beginPath(); q.trace(g, 1); g.fill(); });
    if (rule) { // as engraved rules inside the shape (rule: their pitch in px)
      g.globalCompositeOperation = 'destination-in'; g.setTransform(1, 0, 0, 1, 0, 0);
      g.beginPath(); for (let y = y0 + 0.5; y < y1; y += rule * m.d) g.rect(x0, y, x1 - x0, 0.9 * m.d); g.fill();
    }
    g.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(UN_CV, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); ctx.restore();
  }
  // the air: thin sheets of haze at several depths, each a veil of paper (warm in colour) strongest along the horizon,
  // so that everything beyond a sheet pales a little more (and the sky whitens toward the horizon)
  function hazeItems(list, depths, { hy, up = 220, down = 70, a = 0.14, tint = null } = {}) {
    const B = R11.BOX;
    depths.forEach(d => list.push({ d, draw: () => {
      if (!FOG_CV) { FOG_CV = document.createElement('canvas'); FOG_CV.width = W * SCALE; FOG_CV.height = H * SCALE; FOG = FOG_CV.getContext('2d'); }
      const m = ctx.getTransform(), g = FOG, y0 = Math.max(B[1], hy - up), y1 = Math.min(B[3], hy + down);
      if (y1 <= y0) return;
      const bx0 = Math.max(0, Math.floor(m.a * B[0] + m.e)), bx1 = Math.min(W * SCALE, Math.ceil(m.a * B[2] + m.e)), by0 = Math.max(0, Math.floor(m.d * y0 + m.f)), by1 = Math.min(H * SCALE, Math.ceil(m.d * y1 + m.f));
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(bx0, by0, bx1 - bx0, by1 - by0); g.setTransform(m);
      PAPER_PAT.setTransform(m.inverse()); g.fillStyle = PAPER_PAT; g.globalCompositeOperation = 'source-over'; g.fillRect(B[0], y0, B[2] - B[0], y1 - y0);
      if (tint) { const n = parseInt(tint[0].slice(1), 16); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${tint[1]})`; g.fillRect(B[0], y0, B[2] - B[0], y1 - y0); }
      const vg = g.createLinearGradient(0, y0, 0, y1), k = (hy - y0) / (y1 - y0);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(clamp(k * 0.55), `rgba(0,0,0,${a * 0.35})`); vg.addColorStop(clamp(k), `rgba(0,0,0,${a})`); vg.addColorStop(1, `rgba(0,0,0,${a * 0.5})`);
      g.globalCompositeOperation = 'destination-in'; g.fillStyle = vg; g.fillRect(B[0], y0, B[2] - B[0], y1 - y0); g.restore();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = SA; ctx.drawImage(FOG_CV, bx0, by0, bx1 - bx0, by1 - by0, bx0, by0, bx1 - bx0, by1 - by0); ctx.restore();
    } }));
  }
  // the shadow of a set of world points on the plane z = h, along the sun: its outline on the screen (the convex hull of
  // the projected points, counter-clockwise), or null
  function shadowHull(pts, h) {
    const sun = E3.sun(), out = [];
    pts.forEach(p => { if (p[2] <= h) return; const k = (p[2] - h) / sun[2], q = [p[0] - sun[0] * k, p[1] - sun[1] * k, h]; if (E3.depth(q) > 2) out.push(E3.proj(q)); });
    // the part of the caster standing in the fog's top (its foot on the plane)
    pts.forEach(p => { if (p[2] > h) { const q = [p[0], p[1], h]; if (E3.depth(q) > 2) out.push(E3.proj(q)); } });
    if (out.length < 3) return null;
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    out.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (let i = out.length - 1; i >= 0; i--) { const p = out[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    return new P(lo.slice(0, -1).concat(hi.slice(0, -1)), true);
  }
  // smooth noise from a few long sines (deterministic, no texture needed)
  const noise = (x, y, s = 0) => 0.5 + 0.28 * Math.sin(x * 0.9 + y * 0.31 + s) * Math.cos(y * 0.73 - x * 0.2 + 1.7 * s) + 0.22 * Math.sin(x * 2.3 - y * 1.1 + 2.1 + s * 0.7);

  /* ---------- the engraved sky: horizontal rules, open where the light is ---------- */
  function skyRules(hy, glow, { top = R11.BOX[1], step = 4.6, step0 = null, amax = 0.3, col = INK, lw = 0.75 } = {}) {
    const B = R11.BOX, bands = [[], [], [], [], []];
    for (let y = top + 2; y < hy - 1; y += step0 ? lerp(step0, step, clamp((y - top) / (hy - top))) : step) {
      for (let x = B[0]; x < B[2]; x += 11) {
        const al = amax * glow(x + 5.5, y);
        if (al > 0.012) bands[Math.min(4, Math.floor(al / amax * 5))].push([x, y]);
      }
    }
    bands.forEach((segs, k) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * amax * (k + 0.55) / 5; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'butt';
      ctx.beginPath(); segs.forEach(([x, y]) => { ctx.moveTo(x, y); ctx.lineTo(x + 11.3, y); }); ctx.stroke(); ctx.restore();
    });
  }
  // a radial wash (multiply), for the sky around the sun
  function radialWash(x, y, r, stops, a = 1, clip = null) {
    if (a <= 0) return;
    ctx.save();
    if (clip) { ctx.beginPath(); [].concat(clip).forEach(q => q.trace(ctx, 1)); ctx.clip(); }
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(([o, c, al]) => { const n = parseInt(c.slice(1), 16); g.addColorStop(o, `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${al})`); });
    ctx.globalAlpha = SA * Math.min(1, a); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g;
    const B = R11.BOX; ctx.fillRect(B[0], B[1], B[2] - B[0], B[3] - B[1]); ctx.restore();
  }
  // steady lights (never flashing): small discs whose size falls with distance; a soft halo in fog
  function lights(pts, col, { r0 = 1.4, k = 260, a = 0.95, halo = 0 } = {}) {
    const byA = [];
    pts.forEach(p => { const d = E3.depth(p); if (d < 2) return; const s = E3.proj(p); if (s[0] < R11.BOX[0] - 5 || s[0] > R11.BOX[2] + 5 || s[1] < R11.BOX[1] || s[1] > R11.BOX[3]) return; byA.push([s, Math.max(0.55, Math.min(r0 * 3, r0 * k / d))]); });
    if (!byA.length) return;
    ctx.save(); ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col;
    if (halo > 0) { ctx.globalAlpha = SA * halo; ctx.beginPath(); byA.forEach(([s, r]) => { ctx.moveTo(s[0] + r * 2.6, s[1]); ctx.ellipse(s[0], s[1], r * 2.6, r * 1.6, 0, 0, TAU); }); ctx.fill(); }
    ctx.globalAlpha = SA * a; ctx.beginPath(); byA.forEach(([s, r]) => { ctx.moveTo(s[0] + r, s[1]); ctx.arc(s[0], s[1], r, 0, TAU); }); ctx.fill();
    ctx.restore();
  }
  return { shadowHull, hazeItems, terminalItems, fogStrokes, unionFill, D, HEAD, W3, TL, TWR, TA, sunAt, dirAz, airframe, poser, drawPlane, solid, terminal, tower, drawTower, fogLayer, noise, skyRules, radialWash, lights, smooth, lerp3, add, TYPES };
})();

/* ==========================================================================================================
   1 · Dawn (beat 'airport-dawn', 5 s, entered at lt 0.8): from 40 m over the taxilane behind the west pier's gates (580 m
   out along the pier's line, 160 m to its airside; 600 m from the processor's high point), looking east across the apron
   on a 1050 px lens. Radiation fog lies ~9 m deep over the airfield; the processor's great roof (52 m, ~90 px), the
   piers' waving roofs, the tails of the widebodies at the gates and the crescent tower 2.3 km off (109 m, ~50 px) stand
   out of it; the sun, just risen at 116°, lays their long shadows across the fog's top toward the eye. The eye pans
   slowly right (069° to 093°) and tilts up a little, from the processor and the tails to the tower with the sun low beside
   it; over the beat the fog thins and settles, slides with the dawn air, and more of the apron shows through it.
   ========================================================================================================== */
scene({
  id: 'airportdawn',
  start: 0, dur: 5,
  init() {
    const r = rng(2027);
    this.term = AUH.terminal(1);
    this.tower = AUH.tower();
    const A = AUH.TA;
    // stands: the west pier's airside face (heading 351°, noses to the pier) and the south pier's west face (heading 081°)
    const planes = [];
    const stand = (pierAng, sideN, s, type, seed) => {
      const g = pierAng * AUH.D, d = [Math.cos(g), Math.sin(g)], n = [-Math.sin(g) * sideN, Math.cos(g) * sideN];
      const k = AUH.TYPES[type], off = 31 + 7 + k.fus[0][0];
      const a = d[0] * s + n[0] * off, b = d[1] * s + n[1] * off, psi = Math.atan2(-n[1], -n[0]) / AUH.D;
      planes.push({ type, pose: AUH.poser({ u: A[0] + a, v: A[1] + b, z: k.z0, psi }), parts: AUH.airframe(type, false), seed, s, nose: [A[0] + d[0] * s + n[0] * 31, A[1] + d[1] * s + n[1] * 31] });
    };
    // west pier (-45°): its airside face is side -1; south pier (-135°): its west face is side +1
    [[470, 'twin'], [385, 'a380'], [300, 'twin'], [215, 'a380']].forEach(([s, ty], i) => stand(-45, -1, s, ty, 11000 + i * 500));
    [[250, 'twin'], [335, 'twin'], [420, 'a380']].forEach(([s, ty], i) => stand(-135, 1, s, ty, 13000 + i * 500));
    this.planes = planes;
    // jet bridges: from the pier's glazing to each forward door, at the sill's height
    this.bridges = planes.map(p => {
      const k = AUH.TYPES[p.type], door = p.pose.toW([k.fus[0][0] - 6, k.fus[5][1] + 0.3, -0.3]);
      return { a: AUH.W3(p.nose[0], p.nose[1], door[2]), b: door };
    });
    // the apron under the fog: the taxilane behind the tails, each stand's lead-in line, the apron's edge
    const g = -45 * AUH.D, d = [Math.cos(g), Math.sin(g)], n = [Math.sin(g), -Math.cos(g)];
    const at = (s, o, z = 0.05) => AUH.W3(A[0] + d[0] * s + n[0] * o, A[1] + d[1] * s + n[1] * o, z);
    this.marks = [[at(120, 150), at(1100, 150)], [at(120, 262), at(1100, 262)]];
    planes.slice(0, 4).forEach(p => this.marks.push([at(p.s, 150), at(p.s, 40)]));
    for (let s = 560; s < 1100; s += 60) this.marks.push([at(s, 142), at(s, 158)]);
    // the apron's concrete: slab joints every 7.5 m near the eye (they show through the thin fog)
    this.slabs = [];
    for (let s = 300; s <= 760; s += 7.5) this.slabs.push([at(s, 112), at(s, 330), 0.5]);
    for (let o = 112; o <= 330; o += 7.5) this.slabs.push([at(300, o), at(760, o), 0.5]);
    // grain on the apron near the eye (it shows through the thin fog)
    this.grain = [];
    for (let i = 0; i < 1100; i++) { const s = 420 + r() * 300, o = 100 + r() * 220; this.grain.push([at(s, o), r()]); }
    // the fog's strokes, laid out from the eye in the middle of the pan, wide enough for all of it
    this.view(3.3);
    this.fogSk = AUH.fogStrokes(2200, 4401, { t0: 60, t1: 5000, half: 0.95, len: 70, jit: 0.15 });
  },
  // over the taxilane behind the west pier's tails, 580 m out along the pier's line and 160 m to its airside, 40 m up
  // (rising 3 m); a slow pan from 069° (the processor, the tails in front of it) to 093° (the south pier, the tower and
  // the sun), on a 1050 px lens
  view(lt) {
    const u = easeInOut(clamp((lt - 0.7) / 5.2)), A = AUH.TA;
    const s = lerp(580, 574, u), o = lerp(160, 166, u), z = lerp(40, 43, u);
    const cu = A[0] + 0.7071 * s - 0.7071 * o, cv = A[1] - 0.7071 * s - 0.7071 * o;
    const f = 1050, hyT = lerp(450, 575, easeInOut(clamp((lt - 1.6) / 4.2))), pitch = -Math.atan((562 - hyT) / f), a = lerp(69, 93, u), ax = AUH.dirAz(a), far = 5000;
    const C = AUH.W3(cu, cv, z), L = AUH.W3(cu + far * ax[0] * Math.cos(pitch), cv + far * ax[1] * Math.cos(pitch), z + far * Math.sin(pitch));
    this.ax = a;
    return E3.camera(C, L, f, 560, 562);
  },
  frame(lt) {
    this.view(lt);
    AUH.sunAt(116, 2.4);
    const B = R11.BOX, hz = E3.projDir(AUH.W3(AUH.dirAz(this.ax)[0], AUH.dirAz(this.ax)[1], 0));
    this.hy = hz ? hz[1] : 430;
    const sp = E3.projDir(E3.sun());
    this.sunXY = sp || [B[2] + 200, this.hy - 60];
  },
  under(lt) {
    this.frame(lt);
    const B = R11.BOX, hy = this.hy, [sx, sy] = this.sunXY, q = easeInOut(prog(lt, 0.8, 0.9)), w = prog(lt, 0.8, 5);
    // the dawn sky: blue-grey overhead, clearing to warm light toward the sun, the air along the horizon gold
    washFade([B[0], B[1] - 200, B[2], hy + 2], [[0, HUE.deep, 0.42], [0.3, HUE.sky, 0.55], [0.6, HUE.sky, 0.34], [0.8, HUE.cloud, 0.24], [0.93, HUE.rose, 0.26], [1, HUE.dawn, 0.36]], 0, q);
    AUH.radialWash(sx, sy, 700, [[0, '#FFFFFF', 0], [0.03, HUE.gold, 0.4], [0.25, HUE.dawn, 0.34], [0.6, HUE.rose, 0.14], [1, HUE.rose, 0]], q * (0.85 + 0.25 * w));
    AUH.radialWash(sx, sy + 60, 1400, [[0, HUE.gold, 0.16], [0.6, HUE.sand, 0.1], [1, HUE.sand, 0]], q);
    // the apron under the fog (it shows only where the fog is thin): grey concrete, darker toward the eye
    washFade([B[0], hy - 2, B[2], B[3]], [[0, HUE.steel, 0.2], [1, HUE.steel, 0.45]], 0, q);
    E3.sunAt();
  },
  draw(lt) {
    AUH.sunAt(116, 2.4);
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX, hy = this.hy, [sx, sy] = this.sunXY, w = easeInOut(clamp((lt - 0.8) / 5)), ink = easeOut(prog(lt, 0.55, 0.8));
      // the sky's engraved rules: close overhead and away from the sun, open around it and along the horizon
      AUH.skyRules(hy, (x, y) => {
        const dx = (x - sx) / 1.25, dy = (y - sy) * 1.15, rr = Math.hypot(dx, dy), g = AUH.smooth(clamp(1 - (rr - 14) / 150)) + 0.35 * Math.exp(-rr / 420);
        const up = clamp((hy - y) / (hy - B[1])), haze = clamp((hy - y) / 30);
        return ink * clamp((0.34 + 0.66 * up) * (1 - clamp(g)) * (0.4 + 0.6 * haze)) * (OPT.colour ? 0.45 : 1);
      }, { amax: 0.55, step: 5.6, step0: 2.9, lw: 0.8 });
      // the sun, just clear of the horizon: an open disc of paper, its rim barely drawn
      const sr = this.view(lt).f * Math.tan(0.265 * AUH.D); this.frame(lt);
      mask(el(sx, sy, sr, sr, 0, TAU, 601, 0), 0.9 * ink);
      if (OPT.colour) { AUH.radialWash(sx, sy, 90, [[0, '#FFFFFF', 0], [0.12, HUE.gold, 0.5], [0.4, HUE.dawn, 0.25], [1, HUE.dawn, 0]], ink); disc(sx, sy, sr, HUE.gold, 0.3 * ink, 'multiply'); }
      stroke(el(sx, sy, sr, sr, 0, TAU, 602, 0.1), ink, OPT.colour ? HUE.dune : OCHRE, 0.9, 0.5);
      stroke(new P([[B[0], hy], [B[2], hy]]), ink, INK, 0.7, 0.25);
      // the apron (seen only through the fog): its lines and grain
      // (the apron is under the fog: its lines come up only as the fog thins)
      const show = ink * (0.25 + 0.75 * w * w);
      E3.segments(this.slabs.map(m => [m[0], m[1], 0.16 * show]), INK, 0.5);
      E3.segments(this.marks.map(m => [m[0], m[1], 0.7 * show]), OPT.colour ? HUE.gold : OCHRE, 1.5);
      E3.segments(this.grain.map(([p, k]) => [p, [p[0] + 0.6 + 1.2 * k, p[1] + 0.3, 0.05], (0.2 + 0.3 * k) * show]), INK, 0.8);
      // the painter's list: the terminal's faces, the aircraft, the tower, the jet bridges and the fog's bands
      const list = [];
      const tw = this.tower, dT = R11.dep(AUH.W3(AUH.TWR[0], AUH.TWR[1], 40));
      list.push({ d: dT, draw: () => AUH.drawTower(tw, R11.air(dT, 3400) * ink, OPT.colour ? HUE.dawn : null, 0.45, 0.5) });
      AUH.terminalItems(list, this.term, ink, { warm: OPT.colour ? HUE.dawn : null, warmAll: 0.22 });
      this.planes.forEach(p => {
        const k = AUH.TYPES[p.type], c = p.pose.toW([k.fus[0][0] * 0.2 + k.fus[11][0] * 0.8, 0, 0]), d = R11.dep(c);
        list.push({ d, draw: () => AUH.drawPlane(p, { air: R11.air(d, 2400) * ink, lw: 1.2, fill: OPT.colour ? '#E4E0DA' : null, fillA: 0.35, warm: OPT.colour ? HUE.dawn : null, warmAll: 0.16, tone: 0.22, shade: 0.5, inkFill: 0.28 }) });
      });
      this.bridges.forEach(b => list.push({ d: R11.dep(b.b), draw: () => R11.member(b.a, b.b, 3.4, 0.7 * ink) }));
      // the fog: dense to 9 m at first, settling to 7.2 m, under a soft top (two thin veils over it); visibility in it
      // 110 m, clearing to 240 m; it slides east at ~3 m/s
      const hF = lerp(9, 7.2, w), V = lerp(36, 160, w * w), slide = 3.2 * (lt - 0.8);
      // the fog in shade is cool; only toward the sun does its top take the light
      const sxn = clamp((sx - B[0]) / (B[2] - B[0]), -0.5, 1.6);
      // the long shadows the low sun lays on the fog's top (24 times the height they stand above it), toward the eye
      const casters = this.term.casters.concat(this.tower.casters, this.planes.map(p => p.parts.fin.flat().map(p.pose.toW)));
      const shadow = { polys: casters.map(c => AUH.shadowHull(c, hF)).filter(Boolean), col: OPT.colour ? '#7F8EA3' : INK, a: (OPT.colour ? 0.42 : 0.42) * (1 - 0.45 * w) };
      AUH.fogLayer(list, {
        h: hF, V, amt: 0.97 * ink, strokes: this.fogSk, veils: [[0, 2.2, 70, 0.5]], shadow,
        dens: (l, t) => {
          const near = clamp((380 - t) / 300), n = AUH.noise((l + slide) / 60, t / 14, 0.3);
          return 1 - (0.2 + 0.5 * w) * near * AUH.smooth(clamp((n - 0.4) * 2.2));
        },
        tint: OPT.colour ? t => {
          const far = clamp(1 - t / 2000);
          return [[0, HUE.steel, 0.3 + 0.1 * far], [clamp(sxn - 0.55), HUE.cloud, 0.28], [clamp(sxn - 0.25), HUE.rose, 0.22], [clamp(sxn - 0.08), HUE.dawn, 0.3], [clamp(sxn), HUE.gold, 0.4], [1, HUE.gold, 0.34]];
        } : null,
        grain: (x, y, l, t, k) => {
          const toSun = Math.exp(-Math.abs(x - sx) / 200), horizon = clamp((y - hy) / 26), lens = AUH.smooth(clamp((AUH.noise((l + slide) / 55, t / 26, 1.3) - 0.45) * 2));
          return (0.15 + 0.35 * k) * lens * (1 - 0.85 * toSun) * horizon;
        },
        // long flat swells on the fog's top: hatched in their troughs, open on their crests, fading toward the sun
        rule: (x, y, l, t) => {
          const toSun = Math.exp(-Math.abs(x - sx) / 260), horizon = clamp((y - hy) / 10);
          const swell = 0.5 + 0.5 * Math.sin(TAU * t / 90 + 2.2 * AUH.noise((l + slide) / 260, t / 380, 0.7));
          const band = AUH.smooth(clamp((swell - 0.5) * 3)), lens = 0.35 + 0.65 * AUH.smooth(clamp((AUH.noise((l + slide) / 110, t / 60, 2.9) - 0.25) * 1.8));
          return band * lens * (1 - 0.8 * toSun) * horizon;
        },
        ruleA: OPT.colour ? 0.36 : 0.5, ruleW: 0.8,
        lineCol: OPT.colour ? '#8A7F92' : SEPIA, lw: 0.75,
      });
      AUH.hazeItems(list, [800, 1400, 2100], { hy, up: 70, down: 50, a: 0.16 * ink, tint: OPT.colour ? [HUE.dawn, 0.35] : null });
      R11.paint(list);
    });
    E3.sunAt();
  },
});

/* ==========================================================================================================
   2 · The arrival (beat 'airport', 5 s, entered at lt 0.6): from 45 m up beside 31L's approach lights, 350 m before the
   threshold and 55 m left of the light line, looking up the runway toward the midfield on a long lens. A widebody (787-9
   class) on the 3° glide path sweeps in low on the right over the barrettes, crosses the threshold 17 m up, gear down and
   flaps out, and flares toward the touchdown zone; its shadow runs ahead of it on the ground and closes up as it comes
   down. The approach barrettes and the green threshold bar burn steadily. Terminal A (4.6 km) and the crescent tower
   (2.9 km) stand at their true size on the horizon; shallow fog patches over the field burn off.
   Time runs 1.5× in the aircraft's motion (70 m/s on the approach): it comes into the frame just after the dissolve and
   crosses the threshold at lt 3.7, and is still in the flare at the cut.
   ========================================================================================================== */
scene({
  id: 'arrival',
  start: 0, dur: 5,
  init() {
    const r = rng(3131);
    this.term = AUH.terminal(0.5);
    this.tower = AUH.tower();
    this.plane = { type: 'twin', parts: AUH.airframe('twin', true), seed: 21000 };
    const W3 = AUH.W3;
    // the runway and its markings (ICAO): threshold stripes, centreline, touchdown-zone and aiming-point markings, edges
    const rw = { L: 4106, hw: 30 };
    this.rw = rw;
    const q = (u0, u1, v0, v1, z = 0.02) => [W3(u0, v0, z), W3(u1, v0, z), W3(u1, v1, z), W3(u0, v1, z)];
    this.q = q;
    this.marks = [];
    for (let k = 0; k < 8; k++) [-1, 1].forEach(s => this.marks.push(q(6, 36, s * (1.8 + k * 3.45), s * (3.6 + k * 3.45))));
    for (let u = 60; u < 4000; u += 50) this.marks.push(q(u, u + 30, -0.45, 0.45));
    [[150, 3], [300, 3], [600, 2], [750, 2], [900, 1]].forEach(([u, n]) => { for (let k = 0; k < n; k++) [-1, 1].forEach(s => this.marks.push(q(u, u + 22.5, s * (9 + k * 3.3), s * (10.8 + k * 3.3)))); });
    [-1, 1].forEach(s => this.marks.push(q(400, 460, s * 9, s * 19)));
    [-1, 1].forEach(s => this.marks.push(q(0, rw.L, s * 28.6, s * 29.5)));
    // steady lights: approach centreline barrettes (5 lamps) every 30 m to 900 m, crossbars at 150 and 300 m; the green
    // threshold bar with its wing bars; touchdown-zone barrettes (3 lamps) either side every 30 m to 900 m; centreline
    // every 15 m; edge lights every 60 m
    const app = [], thr = [], rwl = [], frames = [];
    const zA = u => 0.8 + (-u) * 0.0012;
    for (let u = -30; u >= -900; u -= 30) { for (let k = -2; k <= 2; k++) app.push(W3(u, k * 1.05, zA(u))); frames.push({ u, h: 2.3 }); }
    [[-150, 12], [-300, 15]].forEach(([u, h]) => { for (let v = -h; v <= h + 0.01; v += 1.5) if (Math.abs(v) > 2.4) app.push(W3(u, v, zA(u))); frames.push({ u, h: h + 0.4 }); });
    for (let v = -29; v <= 29.01; v += 2.9) thr.push(W3(-2, v, 0.3));
    [-1, 1].forEach(s => { for (let k = 0; k < 6; k++) thr.push(W3(-2, s * (33 + k * 2.5), 0.4)); });
    for (let u = 60; u <= 900; u += 30) [-1, 1].forEach(s => { for (let k = 0; k < 3; k++) rwl.push(W3(u, s * (9 + k * 1.5), 0.05)); });
    for (let u = 7.5; u < rw.L; u += 15) rwl.push(W3(u, 0, 0.05));
    for (let u = 0; u <= rw.L; u += 60) [-1, 1].forEach(s => rwl.push(W3(u, s * 31, 0.4)));
    this.app = app; this.thr = thr; this.rwl = rwl; this.frames = frames; this.zA = zA;
    // the parallel taxiway (210 m to the right), its link at the threshold end, a rapid exit, and the far runway 31R
    this.twy = [q(-80, 3950, 198.5, 221.5), q(-34, -11, 30, 205)];
    this.exitL = [W3(1330, 22, 0.02), W3(1530, 200, 0.02)];
    this.far = q(-200, 4100, 1970, 2030);
    // the runway's instruments: RVR sensors (twin heads on 2.5 m masts) 120 m right of the centreline (the midfield
    // side), a 10 m cup anemometer mast 300 m in, 165 m right; a met enclosure 350 m off the centreline
    this.rvr = [385, 1520, 2620, 3760].map(u => ({ u, v: 120 }));
    this.anemo = { u: 300, v: 165 };
    this.enclosure = { u: 1150, v: 350 };
    // sand grain on the field
    this.grain = [];
    for (let i = 0; i < 6500; i++) { const u = -330 + Math.pow(r(), 1.5) * 4400, v = -420 + r() * 1400; if (Math.abs(v) < 40 || Math.abs(v - 210) < 16) continue; this.grain.push([u, v, r()]); }
    this.view(0.6);
    this.fogSk = AUH.fogStrokes(1800, 5501, { t0: 60, t1: 4500, half: 0.45, len: 60 });
    // the sand's engraved grain: short strokes spread evenly over the picture (evenly in 1/depth), off the pavement
    const onPave = (u, v) => (u > -62 && u < rw.L + 2 && Math.abs(v) < 39) || (u > -82 && u < 3952 && Math.abs(v - 210) < 14) || (u > -36 && u < -9 && v > 28 && v < 207) || (u > -205 && Math.abs(v - 2000) < 34);
    this.sandSk = AUH.fogStrokes(9000, 6601, { t0: 70, t1: 3800, half: 0.6, len: 22, jit: 0.3 }).filter(([a]) => !onPave(a[1], a[0])).map(([a, b, k]) => [[a[0], a[1], 0], [b[0], b[1], 0], k]);
    // the maintenance track beside the approach lights (two sandy ruts, 9 m left of the light line)
    this.track = [-6.5, -8.5].map(v => [W3(-920, v - 3, 0), W3(-60, v - 3, 0)]);
  },
  // the aircraft's path: 105 m per second of film (70 m/s × 1.5); on the glide path until 60 m past the threshold, then
  // a flare that sets it toward the touchdown zone ~450 m in
  flight(lt) {
    const u = 105 * (lt - 3.7), gp = x => 17.4 - x * Math.tan(3 * AUH.D);
    const z0 = AUH.TYPES.twin.z0 + 0.6;
    let z = gp(u), theta = 2.4;
    if (u > 60) {
      const x = clamp((u - 60) / 390), h0 = gp(60), m0 = -Math.tan(3 * AUH.D) * 390;
      z = (2 * x ** 3 - 3 * x ** 2 + 1) * h0 + (x ** 3 - 2 * x ** 2 + x) * m0 + (-2 * x ** 3 + 3 * x ** 2) * z0;
      theta = 2.4 + 3.2 * AUH.smooth(x);
    }
    return { u, v: 0, z, psi: 0, theta };
  },
  view(lt) {
    // 350 m before the threshold, 55 m left of the light line, 45 m up; the axis on 319.5°, easing 3.5° left with the
    // aircraft, on a 1700 px lens (the aircraft comes into the frame from the right just after the dissolve)
    const u = easeInOut(clamp((lt - 1.0) / 4.6)), a = lerp(319.5, 316, u), ax = AUH.dirAz(a), f = 1700, hyT = 300, pitch = -Math.atan((562 - hyT) / f), far = 5000;
    const C = AUH.W3(-350, -55, 45), L = AUH.W3(-350 + far * ax[0] * Math.cos(pitch), -55 + far * ax[1] * Math.cos(pitch), 45 + far * Math.sin(pitch));
    this.ax = a;
    return E3.camera(C, L, f, 560, 562);
  },
  frame(lt) {
    this.view(lt);
    const hz = E3.projDir(AUH.W3(AUH.dirAz(this.ax)[0], AUH.dirAz(this.ax)[1], 0));
    this.hy = hz ? hz[1] : 300;
  },
  under(lt) {
    this.frame(lt);
    const B = R11.BOX, hy = this.hy, q = easeInOut(prog(lt, 0.4, 0.8));
    // the morning sky to the north-west: blue overhead, pale and a little warm along the horizon
    washFade([B[0], B[1] - 200, B[2], hy + 2], [[0, HUE.sky, 0.6], [0.55, HUE.sky, 0.4], [0.88, HUE.cloud, 0.24], [1, HUE.sand, 0.26]], 0, q);
    // the field: sand, warmer and deeper toward the eye
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sand, 0.24], [0.3, HUE.sand, 0.34], [1, HUE.dune, 0.46]], 0, q);
  },
  draw(lt) {
    AUH.sunAt(118, 9); // ~45 min after sunrise
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX, hy = this.hy, ink = easeOut(prog(lt, 0.3, 0.7)), W3 = AUH.W3;
      AUH.skyRules(hy, (x, y) => { const up = clamp((hy - y) / (hy - B[1])); return ink * (0.18 + 0.82 * up) * clamp((hy - y) / 26) * (OPT.colour ? 0.5 : 1); }, { amax: 0.42, step: 5.4, step0: 3, lw: 0.8 });
      stroke(new P([[B[0], hy], [B[2], hy]]), ink, INK, 0.8, 0.35);
      // the ground: sand grain lying on the field, the paved surfaces, their markings
      E3.segments(this.grain.map(([u, v, k]) => [W3(u, v, 0), W3(u + 1.5 + 4 * k, v + 0.5, 0), (OPT.colour ? 0.25 + 0.4 * k : 0.22 + 0.36 * k) * ink]), OPT.colour ? HUE.dune : SEPIA, OPT.colour ? 0.9 : 1);
      E3.segments(this.sandSk.map(([a, b, k]) => [a, b, (OPT.colour ? 0.14 + 0.3 * k : 0.12 + 0.3 * k) * ink]), OPT.colour ? HUE.hill : SEPIA, 0.85);
      this.track.forEach(t => E3.line(t, OPT.colour ? HUE.hill : SEPIA, 0.9, 0.25 * ink));
      const along = [0, 1, 0];
      // (in the default look the asphalt takes a light ink tone under its hatching)
      const pave = (pts, tone, seed, col, fa = 0.42) => E3.face(pts, { n: [0, 0, 1], tone, shade: 0, hdir: along, fillCol: OPT.colour ? col : tone > 0.3 ? INK : null, fillA: OPT.colour ? fa : 0.16 * tone, lw: 0.9, edgeA: 0.5 * ink }, seed);
      // (asphalt: darker than the sand, so the paint shows white on it)
      const dk = OPT.colour ? 0 : 0.2;
      pave(this.far, 0.3 + dk, 501, HUE.steel);
      this.twy.forEach((t, i) => pave(t, 0.26 + dk, 510 + i, HUE.steel));
      E3.line(this.exitL, INK, 0.9, 0.4 * ink);
      pave(this.q(-60, this.rw.L, -37.5, 37.5, 0), 0.08, 520, '#C9BFAE', 0.35);
      pave(this.q(0, this.rw.L, -30, 30, 0.01), 0.44 + dk, 521, HUE.steel, 0.5);
      this.marks.forEach(p => mask(new P(p.map(E3.proj), true), 0.88 * ink));
      // the aircraft's shadow on the field, ahead of it down-sun (the sun at 118°, 9° up behind the eye)
      const fl = this.flight(lt), pose = AUH.poser(fl), ac = Object.assign({}, this.plane, { pose });
      const sun = E3.sun(), shadowOf = p => { const k = p[2] / sun[2]; return [p[0] - sun[0] * k, p[1] - sun[1] * k, 0.03]; };
      const shq = ink;
      {
        const P_ = ac.parts, polys = [];
        const push = f => { const g = f.map(pose.toW).map(shadowOf); if (g.every(p => E3.depth(p) > 2)) polys.push(new P(g.map(E3.proj), true)); };
        P_.fus.forEach(seg => seg.forEach(push));
        ['L', 'R'].forEach(s => P_.side[s].forEach(p => { if (p.f) p.f.forEach(push); if (p.nac) p.nac.forEach(push); }));
        P_.fin.forEach(push);
        AUH.unionFill(polys, OPT.colour ? '#56616E' : INK, (OPT.colour ? 0.36 : 0.6) * shq, OPT.colour ? 0 : 2.2);
      }
      // the approach lights' frames near the eye, then every light, steady
      this.frames.forEach(fr => {
        const u = fr.u, z = this.zA(u), d = R11.dep(W3(u, 0, z));
        if (d > 600) return;
        R11.member(W3(u, -fr.h, z - 0.15), W3(u, fr.h, z - 0.15), 1.1, 0.8 * ink);
        [-fr.h * 0.7, fr.h * 0.7].forEach(v => R11.member(W3(u, v, 0), W3(u, v, z - 0.15), 0.9, 0.7 * ink));
      });
      AUH.lights(this.app, OPT.colour ? '#E0A53C' : OCHRE, { r0: 1.6, k: 230, a: 0.95 * ink, halo: 0.13 * ink });
      AUH.lights(this.thr, OPT.colour ? HUE.leaf : OCHRE, { r0: 1.6, k: 230, a: 0.95 * ink, halo: 0.13 * ink });
      AUH.lights(this.rwl, OPT.colour ? '#E2B868' : OCHRE, { r0: 1.2, k: 200, a: 0.85 * ink, halo: 0.08 * ink });
      // the painter's list: the far terminal and tower, the instruments, the aircraft, the fog patches
      const list = [];
      const dT = R11.dep(W3(AUH.TWR[0], AUH.TWR[1], 40));
      list.push({ d: dT, draw: () => AUH.drawTower(this.tower, R11.air(dT, 2600) * ink, null) });
      AUH.terminalItems(list, this.term, ink, { k: 2600, noHatch: true });
      this.rvr.forEach(s => list.push({ d: R11.dep(W3(s.u, s.v, 1)), draw: () => this.rvrSensor(s, ink) }));
      list.push({ d: R11.dep(W3(this.anemo.u, this.anemo.v, 5)), draw: () => this.anemometer(this.anemo, ink, lt) });
      list.push({ d: R11.dep(W3(this.enclosure.u, this.enclosure.v, 1)), draw: () => this.metPlot(this.enclosure, ink) });
      const dP = R11.dep(pose.toW([0, 0, 0]));
      if (dP > 3) list.push({ d: dP, draw: () => AUH.drawPlane(ac, { air: R11.air(dP, 3000) * ink, lw: 1.4, fill: OPT.colour ? '#F2ECE0' : null, fillA: 0.4, warm: OPT.colour ? HUE.dawn : null, warmA: 0.2, shade: 0.5, inkFill: 0.14 }) });
      // shallow fog patches, ~3.5 m deep, lying in long bands over the field; they burn off over the beat
      const w = easeInOut(clamp((lt - 0.6) / 5)), slide = 1.6 * (lt - 0.6);
      AUH.fogLayer(list, {
        h: lerp(3.6, 2.4, w), V: lerp(150, 320, w), amt: 0.92 * ink * (1 - 0.5 * w), strokes: this.fogSk,
        dens: (l, t) => {
          const n = AUH.noise((l + slide) / 120, t / 70, 2.2), band = AUH.noise(t / 160, 0.3, 4.1), far = clamp((t - 700) / 900);
          return AUH.smooth(clamp((n * 0.55 + band * 0.7 - 0.6 - 0.22 * w) * 2.8 + 0.45 * far));
        },
        tint: OPT.colour ? () => [[0, HUE.cloud, 0.24], [1, HUE.cloud, 0.18]] : null,
        grain: (x, y, l, t, k) => clamp((y - hy) / 24) * (0.2 + 0.5 * k),
        lineCol: OPT.colour ? HUE.steel : SEPIA, lw: 0.8,
      });
      AUH.hazeItems(list, [900, 1500, 2200, 3100, 4200], { hy, up: 200, down: 90, a: 0.13 * ink, tint: OPT.colour ? [HUE.sand, 0.2] : null });
      R11.paint(list);
    });
    E3.sunAt();
  },
  // an RVR sensor: a 2.5 m mast with a cross-arm and two heads facing each other
  rvrSensor(s, a) {
    const W3 = AUH.W3, d = R11.dep(W3(s.u, s.v, 1)), al = R11.air(d, 2600) * a, lw = clamp(1.3 * 260 / d, 0.8, 2);
    E3.line([W3(s.u, s.v, 0), W3(s.u, s.v, 2.5)], INK, lw, 0.9 * al);
    E3.line([W3(s.u - 0.9, s.v, 2.4), W3(s.u + 0.9, s.v, 2.4)], INK, lw, 0.9 * al);
    E3.solid(E3.box(s.v - 0.2, s.v + 0.2, s.u - 1.3, s.u - 0.7, 1.9, 2.4), { tone: .3, shade: .4, lw: .9, edgeA: .9 * al }, 1);
    E3.solid(E3.box(s.v - 0.2, s.v + 0.2, s.u + 0.7, s.u + 1.3, 1.9, 2.4), { tone: .3, shade: .4, lw: .9, edgeA: .9 * al }, 2);
    E3.solid(E3.box(s.v - 0.35, s.v + 0.35, s.u - 0.35, s.u + 0.35, 0.9, 1.4), { tone: .1, shade: .4, lw: .9, edgeA: .9 * al }, 3);
  },
  // a cup anemometer and wind vane on a 10 m mast
  anemometer(s, a, lt) {
    const W3 = AUH.W3, d = R11.dep(W3(s.u, s.v, 5)), al = R11.air(d, 2600) * a;
    E3.line([W3(s.u, s.v, 0), W3(s.u, s.v, 10)], INK, clamp(1.4 * 260 / d, 0.8, 2), 0.9 * al);
    R11.member(W3(s.u - 0.9, s.v, 10), W3(s.u + 0.9, s.v, 10), 1.2, 0.9 * al);
    const spin = lt * 9;
    for (let k = 0; k < 3; k++) { const g = spin + k * TAU / 3; R11.member(W3(s.u - 0.9, s.v, 10.3), W3(s.u - 0.9 + 0.45 * Math.cos(g), s.v + 0.45 * Math.sin(g), 10.3), 1, 0.8 * al); }
    R11.member(W3(s.u + 0.9, s.v, 10.4), W3(s.u, s.v - 0.3, 10.4), 1.1, 0.8 * al);
  },
  // the met enclosure: a fenced plot with a screen and a mast
  metPlot(s, a) {
    const W3 = AUH.W3, d = R11.dep(W3(s.u, s.v, 1)), al = R11.air(d, 2600) * a;
    const c = [[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]];
    E3.line(c.map(([x, y]) => W3(s.u + x, s.v + y, 1.2)), INK, 0.6, 0.55 * al);
    E3.solid(E3.box(s.v - 1, s.v + 1, s.u - 0.7, s.u + 0.7, 1, 2), { tone: .05, shade: .4, lw: .8, edgeA: .8 * al }, 4);
    R11.member(W3(s.u + 5, s.v + 4, 0), W3(s.u + 5, s.v + 4, 6), 1, 0.8 * al);
  },
});
