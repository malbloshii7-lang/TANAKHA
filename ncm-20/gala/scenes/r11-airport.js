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
// The fog lifting (1 Oct 2026, the requester's choice "fog lifting at the airport", across both beats): the dawn shot is a
// time-lapse of the first half hour after sunrise in which the radiation fog burns off and the light comes up; the
// arrival, 13 minutes later, keeps real time, the fog thinner and broken, and the widebody now lands (threshold, flare,
// touchdown). The morning's helpers (sunMin, fogDepth, fogShare, castFaces...) are at the end of AUH. Sources:
//   the sun: standard solar geometry for 24.43° N at the December solstice (declination -23.44°);
//   the fog's burning off: NWS fog guide (dissipation: heat carried up from the warming ground, mixing with drier air
//   above; "fog lifts to stratus when the lapse rate approaches dry adiabatic"); CIMSS Satellite Blog, "Dissipation of
//   fog" (radiation fog "will frequently erode from the outside in": it thins toward its edge, where the sun gets through);
//   Stull, Practical Meteorology §6.8 (solar heating evaporates the fog's bottom: it "lifts"); Roach, J. Met. Soc. Japan
//   60 (1982) (fogs seen to lift into low stratus after sunrise, or to clear from the top down); Bergot, QJRMS 2016 (the
//   fog's patchiness as it dissipates);
//   the ground crew: Kalmar Motor, TBL 800 towbarless tractor (9,705-10,140 × 4,500 × 2,000-2,371 mm; docks with the
//   boarding bridge still connected); LD3/AKE containers (DSV, ANA Cargo: 156 × 153 cm base, 163 cm high, contour E);
//   the landing: Airbus FCTM, flare and touchdown (flare at ~30 ft); Boeing FCTM (flare times 4-8 s; the flare distance
//   about 1,000-2,000 ft beyond the threshold on a 3° path).
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
      // the fin's leading edge swept ~43°, its trailing edge (the rudder's) ~20°, the tip a 4 m chord over the tail cone
      fin: { z: [2.8, 11.8], le: [-20.5, -29.0], te: [-29.6, -33.0], t: [1.0, .3], zte: 2.2 },
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
      // the fin's leading edge swept ~40°, its trailing edge ~20°
      fin: { z: [3.3, 17.1], le: [-24, -35.6], te: [-35.2, -40.0], t: [1.4, .4], zte: 2.6 },
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
      // the flaps are out only in flight (an arrival); at the gate they are stowed inside the wing's trailing edge
      if (flight) k.flaps.forEach(([ya, yb, c]) => {
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
  let CLIPZ = null;
  const setClipZ = z => { CLIPZ = z; }, clipZ = () => CLIPZ;
  // a polygon cut to the part above z = h (Sutherland-Hodgman against a horizontal plane)
  function above(pts, h) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], ia = a[2] >= h, ib = b[2] >= h;
      if (ia) out.push(a);
      if (ia !== ib) { const t = (h - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, h]); }
    }
    return out;
  }
  function solid(faces, st, seed, warm, inside = null, sil = false) {
    const cs = inside || E3.centroid(faces.map(E3.centroid));
    const sun = E3.sun(), C = E3.cam().C, info = sil ? [] : null;
    faces.forEach((f0, i) => {
      const f = CLIPZ === null ? f0 : above(f0, CLIPZ);
      if (f.length < 3) return;
      const a = E3.sub(f0[1], f0[0]), b = E3.sub(f0[2], f0[0]), c = f0.length > 3 ? E3.sub(f0[3], f0[0]) : b;
      let n = [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];
      if (Math.hypot(...n) < 1e-9) n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const L = Math.hypot(...n) || 1; n = [n[0] / L, n[1] / L, n[2] / L];
      if (E3.dot(n, E3.sub(E3.centroid(f0), cs)) < 0) n = [-n[0], -n[1], -n[2]];
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
    info.forEach((q, fi) => q.f.forEach((a, i) => { const b = q.f[(i + 1) % q.f.length], ka = key(a), kb = key(b); if (ka === kb) return; if (CLIPZ !== null && Math.abs(a[2] - CLIPZ) < 1e-6 && Math.abs(b[2] - CLIPZ) < 1e-6) return; const k = ka < kb ? ka + '|' + kb : kb + '|' + ka; const e = E.get(k); if (e) e.f.push(fi); else E.set(k, { a, b, f: [fi] }); }));
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
    // seen from below the wing (an aircraft overhead): the tail surfaces stand behind the fuselage, and the low wings,
    // the engines under them and the gear all hang in front of its belly
    const partsOf = (side, kind) => P.side[side].filter(p => p.kind === kind);
    const drawKind = (side, kind) => partsOf(side, kind).sort((p, q) => (kind === 'eng' ? p.y - q.y : 0)).forEach((p, i) => {
      if (kind === 'gear') { if (o.gear !== false) gearDraw(p); return; }
      if (kind === 'eng') {
        solid(p.pyl.map(tw), skin, seed + 40 + i, W, null, true);
        solid(p.nac.map(tw), Object.assign({}, skin, { tone: .08 }), seed + 50 + i, W, null, true);
        solid(p.plug.map(tw), Object.assign({}, skin, { tone: .3 }), seed + 60 + i, null, null, true);
        return;
      }
      const st = kind === 'flap' ? Object.assign({}, skin, { tone: .12 }) : kind === 'wing' ? Object.assign({}, skin, { tone: .04, hdir: along }) : skin;
      solid(p.f.map(tw), st, seed + (kind === 'wing' ? 80 : kind === 'flap' ? 90 : 100) + i, W, null, true);
    });
    if (!above) {
      drawKind(far, 'stab'); drawKind(near, 'stab');
      solid(P.fin.map(tw), skin, seed + 110, W, null, true);
      solid([].concat(...P.fus).map(tw), skin, seed + 120, W, null, true);
      ['wing', 'flap'].forEach(kd => { drawKind(far, kd); drawKind(near, kd); });
      drawKind(far, 'eng'); drawKind(near, 'eng');
      if (o.gear !== false) { gearDraw(P.noseGear); drawKind(far, 'gear'); drawKind(near, 'gear'); }
      return;
    }
    sideDraw(far);
    gearDraw(o.gear === false ? null : P.noseGear);
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
    solid(P.fin.map(tw), skin, seed + 110, W, null, true);
    sideDraw(near);
  }

  /* ---------- Terminal A: the processor's roof and landside facade, the piers with their waving roofs ---------- */
  function terminal(res = 1) {
    const out = []; // { pts (world), st, seed }
    const hub = { ca: -10, A: 150, B: 162, p: 4 };
    const Rh = th => { const c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th)); return 1 / Math.pow(Math.pow(c / hub.A, hub.p) + Math.pow(s / hub.B, hub.p), 1 / hub.p); };
    // the roof: 52.5 m at its crown (50 m inside the landside facade), ~50 m along that facade, falling to ~26 m at the
    // airside walls, with long dune-like swells across it (the arches it rides on)
    const hRoof = (a, b) => { const x = a - 40, fa = Math.exp(-((x / (x < 0 ? 150 : 420)) ** 2)), bump = fa * Math.exp(-((b / 175) ** 2)); return 21 + 31.5 * bump + 1.4 * Math.cos(b / 30) * (1 - bump * .6) * Math.min(1, (150 - a) / 60); };
    const hubPt = (th, fr) => { const r = Rh(th) * fr; return [hub.ca + r * Math.cos(th), r * Math.sin(th)]; };
    const NA = Math.round(48 * res), rings = res > .7 ? [0, .22, .42, .6, .76, .9, 1] : [0, .35, .7, 1];
    const armAng = [45, -45, 135, -135].map(x => x * D);
    for (let i = 0; i < NA; i++) for (let j = 0; j + 1 < rings.length; j++) {
      const t0 = i / NA * TAU, t1 = (i + 1) / NA * TAU, q = [hubPt(t0, rings[j]), hubPt(t1, rings[j]), hubPt(t1, rings[j + 1]), hubPt(t0, rings[j + 1])];
      const pts = (j === 0 ? [q[0], q[2], q[3]] : q).map(([a, b]) => TL(a, b, hRoof(a, b)));
      out.push({ pts, st: { tone: .08, shade: .42, hdir: E3.sub(TL(1, 0), TL(0, 0)), lw: 1, kind: 'roof' }, seed: 7000 + i * 7 + j, inside: add(cen(pts), [0, 0, -20]) });
    }
    // the roof's overhang: 7 m past the walls, its edge a 2.6 m fascia that reads as the roof's thickness
    for (let i = 0; i < NA; i++) {
      const t0 = i / NA * TAU, t1 = (i + 1) / NA * TAU, e = th => { const r = Rh(th) + 7; return [hub.ca + r * Math.cos(th), r * Math.sin(th)]; };
      const [a0, b0] = hubPt(t0, 1), [a1, b1] = hubPt(t1, 1), [c0, d0] = e(t0), [c1, d1] = e(t1);
      const h0 = hRoof(a0, b0), h1 = hRoof(a1, b1);
      out.push({ pts: [TL(a0, b0, h0), TL(a1, b1, h1), TL(c1, d1, h1 - 0.6), TL(c0, d0, h0 - 0.6)], st: { tone: .08, shade: .42, hdir: E3.sub(TL(1, 0), TL(0, 0)), lw: 1, kind: 'roof' }, seed: 7300 + i, inside: TL(hub.ca, 0, 0) });
      out.push({ pts: [TL(c0, d0, h0 - 0.6), TL(c1, d1, h1 - 0.6), TL(c1, d1, h1 - 3.2), TL(c0, d0, h0 - 3.2)], st: { tone: .5, shade: .3, hdir: [0, 0, 1], lw: 1, kind: 'fascia' }, seed: 7400 + i, inside: TL(hub.ca, 0, h0 - 2) });
    }
    // the hub's walls: the 50 m glazed landside facade (facing 306°) and the airside walls between the piers
    for (let i = 0; i < NA; i++) {
      const t0 = i / NA * TAU, t1 = (i + 1) / NA * TAU, tm = (t0 + t1) / 2;
      if (armAng.some(g => Math.abs(Math.atan2(Math.sin(tm - g), Math.cos(tm - g))) < 10 * D)) continue;
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
    const ring = [], rim = []; for (let i = 0; i <= NA; i++) { const th = i / NA * TAU, r = Rh(th) + 7, [a, b] = hubPt(th, 1); ring.push(TL(hub.ca + r * Math.cos(th), r * Math.sin(th), hRoof(a, b) - 0.5)); rim.push(TL(hub.ca + r * Math.cos(th), r * Math.sin(th), hRoof(a, b) - 3.2)); }
    seg(ring, 1.6); seg(rim, 1.1);
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
        const fas = fc.st.kind === 'fascia';
        const st = Object.assign({}, fc.st, { edges: false, noHatch: o.noHatch && !glass && !fas, fillCol: OPT.colour ? (glass ? HUE.deep : fas ? HUE.steel : '#EFE7D8') : null, fillA: glass ? 0.32 : fas ? 0.45 : 0.3, inkFill: glass ? (o.inkFill ?? 0.26) : fas ? 0.3 : 0 });
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
    const sl = Array.isArray(o.slide) ? o.slide : [o.slide || 0, 0, 0];
    const sk = (o.strokes || []).map(q => { const a = add(q[0], sl), b = add(q[1], sl); a[2] = b[2] = o.h; return { a, b, k: q[2], d: E3.depth(lerp3(a, b, 0.5)) }; }).filter(q => q.d > 1).sort((p, q) => p.d - q.d);
    // the hatching's rows: from the horizon down, closer near it
    const rows = [];
    if (o.rule) for (let y = yh + 2.2; y < B[3]; y += o.rulePitch ? o.rulePitch(y) : clamp(2.6 + (y - yh) * 0.011, 2.6, 6.2)) rows.push(y);
    const slabs = [{ z0: 0, z1: o.h, V: o.V, amt: 1, grain: true }].concat((o.veils || []).map(([dh0, dh1, V, amt]) => ({ z0: o.h + dh0, z1: o.h + dh1, V, amt })));
    slabs.forEach(sl => {
    const oo = Object.assign({}, o, { amt: o.amt * sl.amt });
    let y = Math.max(B[1], yh + 0.5);
    while (y < B[3]) {
      const hgt = clamp(1.5 + (y - yh) * 0.032, 1.5, 7), y1 = Math.min(B[3], y + hgt), ym = (y + y1) / 2, dz = dirZ(ym);
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
    // runs of equal density across the row (11 px cells, so a burning rim steps finely; the density in steps of 1/40),
    // each laid as paper at that density, and in colour tinted by the fog's colour there
    const CW = 11, runs = [];
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
    // (a wash in colour, over horizontal rules on a fixed 2.6 px pitch, so the shadow reads as engraved tone), run by run:
    // a shadow lies on the fog only as thickly as the fog is there, so where it has burnt off the shadow is the ground's
    if (o.shadow && o.shadow.polys.length) {
      ctx.save(); ctx.beginPath(); ctx.rect(B[0], ya, B[2] - B[0], yb - ya); ctx.clip();
      ctx.beginPath(); o.shadow.polys.forEach(q => q.trace(ctx, 1)); ctx.clip('nonzero');
      const byK = new Map();
      runs.forEach(r => { const k = Math.round(clamp(r.a * 1.2) * 20); if (k < 1) return; if (!byK.has(k)) byK.set(k, []); byK.get(k).push(r); });
      byK.forEach((rs, k) => {
        const sa = SA * o.shadow.a * k / 20;
        if (OPT.colour) { ctx.globalAlpha = sa * 0.8; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = o.shadow.col; ctx.beginPath(); rs.forEach(r => ctx.rect(r.x0, ya, r.x1 - r.x0, yb - ya)); ctx.fill(); }
        ctx.globalAlpha = sa * (OPT.colour ? 0.5 : 1.15); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = OPT.colour ? '#4E5A6A' : INK; ctx.lineWidth = 0.85; ctx.lineCap = 'butt';
        ctx.beginPath(); for (let y = Math.ceil(ya / 2.6) * 2.6; y < yb; y += 2.6) rs.forEach(r => { ctx.moveTo(r.x0, y); ctx.lineTo(r.x1, y); }); ctx.stroke();
      });
      ctx.restore();
    }
    // light horizontal hatching on the rows in this band, in flat bands and lenses (o.rule gives each dash its weight)
    if (rows.length && o.rule) {
      rows.forEach(yr => {
        const segs = [[], [], [], []];
        for (let x = B[0]; x < B[2]; x += 10) { const l = (x + 5 - cx) / f * t, al = o.rule(x + 5, yr, l, t) * clamp(a0 * (o.dens ? o.dens(l, t) : 1) * o.amt * 1.4); if (al > 0.03) segs[Math.min(3, Math.floor(al * 4))].push(x); }
        const lw = typeof o.ruleW === 'function' ? o.ruleW(yr) : o.ruleW || 0.7;
        segs.forEach((ss, k) => {
          if (!ss.length) return;
          ctx.save(); ctx.globalAlpha = SA * (o.ruleA ?? 0.3) * (k + 0.6) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = o.lineCol || SEPIA; ctx.lineWidth = lw; ctx.lineCap = 'butt';
          ctx.beginPath(); ss.forEach(x => { ctx.moveTo(x, yr); ctx.lineTo(x + 10.2, yr); }); ctx.stroke(); ctx.restore();
        });
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
  function shadowHull(pts, h, sun = E3.sun()) {
    const out = [];
    // each point above the plane, cast along the sun onto it, and its foot where it stands in the plane
    // (a caster marked noFeet floats: a lamp head on its mast casts only its own patch)
    pts.forEach(p => { if (p[2] <= h) return; const k = (p[2] - h) / sun[2]; out.push([p[0] - sun[0] * k, p[1] - sun[1] * k]); if (!pts.noFeet) out.push([p[0], p[1]]); });
    if (out.length < 3) return null;
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    out.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (let i = out.length - 1; i >= 0; i--) { const p = out[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    // counter-clockwise in world XY; cut at 3 m in front of the eye (a shadow can start behind it), then projected
    const poly = lo.slice(0, -1).concat(hi.slice(0, -1)).map(q => [q[0], q[1], h]), cut = [], zn = 3;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], da = E3.depth(a), db = E3.depth(b);
      if (da >= zn) cut.push(a);
      if ((da >= zn) !== (db >= zn)) cut.push(lerp3(a, b, (zn - da) / (db - da)));
    }
    if (cut.length < 3) return null;
    const sp = cut.map(E3.proj);
    // screen winding flips with the view; give every shadow the same winding so one nonzero fill is their union
    let ar = 0; for (let i = 0; i < sp.length; i++) { const a = sp[i], b = sp[(i + 1) % sp.length]; ar += a[0] * b[1] - b[0] * a[1]; }
    return new P(ar < 0 ? sp.reverse() : sp, true);
  }
  // an enclosed walkway (a jet bridge's tunnel) from floor point p0 to floor point p1, hw half-wide and h tall
  function walkway(p0, p1, hw, h) {
    const u = E3.sub(p1, p0), L = Math.hypot(u[0], u[1]) || 1, s = [-u[1] / L * hw, u[0] / L * hw, 0], up = [0, 0, h];
    const v = [add(p0, s, -1), add(p0, s), add(p1, s), add(p1, s, -1)], w = v.map(q => add(q, up));
    return [[v[0], v[1], v[2], v[3]], [w[0], w[1], w[2], w[3]], [v[0], v[1], w[1], w[0]], [v[1], v[2], w[2], w[1]], [v[2], v[3], w[3], w[2]], [v[3], v[0], w[0], w[3]]];
  }
  // engraved rules lying on the ground (z 0) seen from an eye h above it: rows from the horizon down, each dash weighted by
  // fn(u, v, depth) at the ground point it covers (runway frame), so the pattern stays fixed on the ground as the eye moves
  function groundRules(hy, h, fn, { pitch = () => 3, lw = () => 0.8, a = 0.4, col = SEPIA } = {}) {
    const B = R11.BOX, cam = E3.cam(), { C, F, U, R, f, cx, cy } = cam;
    for (let y = hy + 2; y < B[3]; y += pitch(y)) {
      const segs = [[], [], [], []];
      for (let x = B[0]; x < B[2]; x += 9) {
        const dx = (x + 4.5 - cx) / f, dy = -(y - cy) / f, dir = [F[0] + R[0] * dx + U[0] * dy, F[1] + R[1] * dx + U[1] * dy, F[2] + R[2] * dx + U[2] * dy];
        if (dir[2] >= -1e-6) continue;
        const k = -C[2] / dir[2], g = [C[0] + dir[0] * k, C[1] + dir[1] * k], t = k * (dir[0] * F[0] + dir[1] * F[1] + dir[2] * F[2]);
        const al = fn(g[1], g[0], t);
        if (al > 0.03) segs[Math.min(3, Math.floor(al * 4))].push(x);
      }
      const w = lw(y);
      segs.forEach((ss, kk) => {
        if (!ss.length) return;
        ctx.save(); ctx.globalAlpha = SA * a * (kk + 0.6) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'butt';
        ctx.beginPath(); ss.forEach(x => { ctx.moveTo(x, y); ctx.lineTo(x + 9.2, y); }); ctx.stroke(); ctx.restore();
      });
    }
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
  /* ---------- the morning: the sun's climb, the fog's burning off ---------- */
  // the sun over AUH (24.43° N) at the December solstice (declination -23.44°), m minutes after its geometric rise (hour
  // angle 78.6° at the rise, falling 0.25° a minute): [azimuth, altitude] in degrees. It rises at 115.9°; 15 minutes later
  // it is 3.0° up at 117.6°, after 33 minutes 6.6° up at 119.5°, after 46 minutes 9.2° up at 121.1° (standard solar
  // geometry, the equation of time aside)
  function sunMin(m) {
    const ph = 24.43 * D, de = -23.44 * D, H = Math.acos(-Math.tan(ph) * Math.tan(de)) - m * 0.25 * D;
    const sa = Math.sin(ph) * Math.sin(de) + Math.cos(ph) * Math.cos(de) * Math.cos(H), alt = Math.asin(sa);
    const az = Math.acos(clamp((Math.sin(de) - Math.sin(ph) * sa) / (Math.cos(ph) * Math.cos(alt)), -1, 1));
    return [az / D, alt / D];
  }
  // the sun's direction (E3's world) at a compass azimuth and altitude, without setting E3's light
  const sunVec = (az, alt) => { const a = (az - HEAD) * D, h = alt * D; return [Math.cos(h) * Math.sin(a), Math.cos(h) * Math.cos(a), Math.sin(h)]; };
  // Radiation fog after sunrise (NWS fog guide; Waersted 2018): the sun works through the shallow layer and heats the
  // ground, which warms the air in contact with it, and the fog evaporates from below and thins from its top, where it
  // mixes with drier air; it goes first where it is thinnest, at its edges, so patches shrink from their rims and holes
  // open and widen, until only lenses lie in the hollows. A fog's relative depth over a ground point: a fixed field of
  // long flat lenses lying across the light air (toward 300°; k scales them: 0.4 on the apron, ~15-40 m across), cut at a
  // level that rises as the morning heats the ground (over the dawn's apron, theta 0.2 leaves a whole sheet, 0.54 about a
  // third of it in lenses), with a soft rim
  function fogDepth(u, v, theta, rim = 0.22, k = 1) {
    const dv = dirAz(300), a = u * dv[0] + v * dv[1], b = v * dv[0] - u * dv[1];
    const phi = 0.5 * noise(b / (95 * k), a / (36 * k), 0.4) + 0.32 * noise(b / (41 * k) + 1.3, a / (17 * k), 2.4) + 0.18 * noise(b / (230 * k), a / (110 * k), 4.4);
    return smooth(clamp((phi - theta) / rim));
  }
  // a fog band's density at a fraction f of the layer's depth, as a share of the whole layer's (a0 is the band's): the
  // path through the fog shortens with its depth, so a thinning layer still whitens toward the horizon
  const fogShare = (f, L, V) => f >= 1 ? 1 : (1 - Math.exp(-3 * L * f / V)) / Math.max(1e-4, 1 - Math.exp(-3 * L / V));
  // the ground point under (l, t) of a fog band's row (l metres right of the view's axis at depth t)
  function rowGround(l, t) {
    const { C, F, R } = E3.cam(), h = Math.hypot(F[0], F[1]) || 1;
    return [C[0] + F[0] / h * t + R[0] * l, C[1] + F[1] / h * t + R[1] * l];
  }
  // shadows on the ground (z 0) along the sun: each face cast, so a body held up on its gear casts its own shape apart
  // from its feet; screen polygons for unionFill
  // (each cut 3 m in front of the eye, as a shadow can start behind it: the masts stand behind the eye)
  function castFaces(faces, sun, out) {
    faces.forEach(f => {
      const g = f.map(p => { const k = Math.max(0, p[2]) / sun[2]; return [p[0] - sun[0] * k, p[1] - sun[1] * k, 0.02]; }), cut = [];
      for (let i = 0; i < g.length; i++) {
        const a = g[i], b = g[(i + 1) % g.length], da = E3.depth(a), db = E3.depth(b);
        if (da >= 3) cut.push(a);
        if ((da >= 3) !== (db >= 3)) cut.push(lerp3(a, b, (3 - da) / (db - da)));
      }
      if (cut.length > 2) out.push(new P(cut.map(E3.proj), true));
    });
    return out;
  }
  // a prism: a convex cross-section [[y, z]...] (counter-clockwise) carried along x from xa to xb, in a body frame
  function prism(sec, xa, xb, toW) {
    const A = sec.map(([y, z]) => toW([xa, y, z])), Bq = sec.map(([y, z]) => toW([xb, y, z])), f = [A.slice().reverse(), Bq];
    for (let i = 0; i < sec.length; i++) { const j = (i + 1) % sec.length; f.push([A[i], A[j], Bq[j], Bq[i]]); }
    return f;
  }
  // gradient stops mixed between two sets of the same length (colour and alpha), at q
  function mixStops(A, Bs, q) {
    const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const to = c => '#' + c.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
    return A.map((a, i) => { const b = Bs[i], ca = hex(a[1]), cb = hex(b[1]); return [lerp(a[0], b[0], q), to(ca.map((x, k) => lerp(x, cb[k], q))), lerp(a[2], b[2], q)]; });
  }
  return { above, groundRules, setClipZ, clipZ, walkway, shadowHull, hazeItems, terminalItems, fogStrokes, unionFill, D, HEAD, W3, TL, TWR, TA, sunAt, dirAz, airframe, poser, drawPlane, solid, terminal, tower, drawTower, fogLayer, noise, skyRules, radialWash, lights, smooth, lerp3, add, TYPES,
    sunMin, sunVec, fogDepth, fogShare, rowGround, castFaces, prism, mixStops, wheel };
})();

/* ==========================================================================================================
   The airliner: a Boeing 787-9 (Etihad flies the type), one model for both shots, in true 3D and in the plate's
   engraving language. A plain white airframe: no livery, logo, name or registration.
   ========================================================================================================== */
const B789 = (() => {
  const D = Math.PI / 180, add = AUH.add, lerp3 = AUH.lerp3;
  // stations s: metres aft of the nose, as Boeing's door table gives them; the body frame's x runs forward from the main
  // gear's station (so a pose's origin is the main gear, about which the aircraft pitches on the runway), y to the left,
  // z up from the fuselage's axis; the axis stands 4.75 m over the apron when parked
  const SMG = 31.83, SNG = 6.0, Z0 = 4.75, X = s => SMG - s;
  // a smooth curve through rows [s, a, b, ...]: Hermite on uneven knots, its slopes limited so it never overshoots
  function spline(rows) {
    const n = rows.length, M = rows[0].map((_, k) => rows.map((r, i) => {
      if (!k) return 0;
      const dl = i > 0 ? (r[k] - rows[i - 1][k]) / (r[0] - rows[i - 1][0]) : null, dr = i < n - 1 ? (rows[i + 1][k] - r[k]) / (rows[i + 1][0] - r[0]) : null;
      if (dl === null) return dr; if (dr === null) return dl;
      if (dl * dr <= 0) return 0;
      const m = (dl + dr) / 2;
      return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(dl), 3 * Math.abs(dr));
    }));
    return (s, k) => {
      if (s <= rows[0][0]) return rows[0][k];
      if (s >= rows[n - 1][0]) return rows[n - 1][k];
      let i = 0; while (rows[i + 1][0] < s) i++;
      const a = rows[i], b = rows[i + 1], h = b[0] - a[0], t = (s - a[0]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * a[k] + (t3 - 2 * t2 + t) * h * M[k][i] + (-2 * t3 + 3 * t2) * b[k] + (t3 - t2) * h * M[k][i + 1];
    };
  }
  const lin = (rows, s, k) => { if (s <= rows[0][0]) return rows[0][k]; for (let i = 1; i < rows.length; i++) if (s <= rows[i][0]) { const t = (s - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]); return rows[i - 1][k] + (rows[i][k] - rows[i - 1][k]) * t; } return rows[rows.length - 1][k]; };

  /* ---------- the airframe ---------- */
  // the fuselage: [s, crown z, keel z, half-width] (5.77 m wide and 5.97 m deep; the radome's tip at the cabin floor's
  // level, the nose rounding up to the flight deck's windows; the tail cone sweeping up from the main gear to the APU's
  // exhaust, the crown line falling only behind the fin)
  const FUS = spline([[0, -0.40, -0.70, 0.10], [0.25, 0.12, -1.12, 0.62], [0.6, 0.55, -1.48, 1.02], [1.0, 0.92, -1.76, 1.30], [1.6, 1.35, -2.07, 1.62],
    [2.3, 1.75, -2.34, 1.94], [3.0, 2.10, -2.56, 2.21], [3.8, 2.45, -2.74, 2.45], [4.8, 2.74, -2.88, 2.66], [6.0, 2.92, -2.96, 2.81], [7.4, 2.98, -2.985, 2.88],
    [9.0, 2.985, -2.985, 2.885], [40.0, 2.985, -2.985, 2.885], [42.0, 2.985, -2.955, 2.88], [45.0, 2.985, -2.82, 2.83], [48.0, 2.96, -2.52, 2.70], [51.0, 2.88, -2.08, 2.48],
    [54.0, 2.70, -1.52, 2.15], [57.0, 2.38, -0.84, 1.68], [59.5, 1.98, -0.20, 1.14], [61.2, 1.58, 0.40, 0.62], [62.0, 1.32, 0.80, 0.24]]);
  const fz = s => { const zt = FUS(s, 1), zb = FUS(s, 2); return { zc: (zt + zb) / 2, hh: (zt - zb) / 2, hw: FUS(s, 3) }; };
  // a point on the skin at station s, angle a (0 on the left side, a quarter turn at the crown), dr metres proud of it
  function skin(s, a, dr = 0) { const { zc, hh, hw } = fz(s); return [X(s), (hw + dr) * Math.cos(a), zc + (hh + dr) * Math.sin(a)]; }
  // the angle on the left (sg 1) or right (sg -1) side at height z above the axis
  function angAt(s, z, sg = 1) { const { zc, hh } = fz(s), q = Math.asin(clamp((z - zc) / hh, -1, 1)); return sg > 0 ? q : Math.PI - q; }
  // the skin's outward normal at (s, a), from the section's ellipse (the profile's slope along the body is small)
  function skinN(s, a) { const { hh, hw } = fz(s), n = [0, Math.cos(a) / hw, Math.sin(a) / hh], L = Math.hypot(n[1], n[2]); return [0, n[1] / L, n[2] / L]; }
  const STN = [0.02, 0.12, 0.25, 0.42, 0.6, 0.8, 1.0, 1.3, 1.6, 2.0, 2.3, 2.65, 3.0, 3.4, 3.8, 4.3, 4.8, 5.4, 6.0, 6.7, 7.4, 8.2, 9.0, 12, 15, 18, 21, 24, 27, 30, 33,
    36, 39, 40.5, 42, 43.5, 45, 46.5, 48, 49.5, 51, 52.5, 54, 55.5, 57, 58.2, 59.5, 60.4, 61.2, 61.7, 62.0];
  // the wing (787-9: 60.12 m span, 377 m², the leading edge swept 35°, a trailing-edge break outboard of the engine,
  // raked tips): [y, leading edge s, trailing edge s, thickness]
  const WING = [[2.4, 21.6, 34.2, 1.70], [2.9, 22.0, 34.2, 1.66], [5.0, 23.47, 34.38, 1.30], [9.8, 26.84, 34.65, 0.95], [11.0, 27.68, 34.95, 0.86], [18.0, 32.59, 37.46, 0.52],
    [26.5, 38.55, 40.5, 0.26], [28.4, 41.0, 42.1, 0.16], [30.06, 43.1, 43.95, 0.09]];
  const SPAN = [2.4, 2.9, 4.2, 5.6, 7.0, 8.4, 9.8, 11.0, 12.6, 14.4, 16.2, 18.0, 19.8, 21.6, 23.4, 25.0, 26.5, 27.5, 28.4, 29.3, 30.06];
  const wingAt = y => ({ sl: lin(WING, y, 1), st: lin(WING, y, 2), t: lin(WING, y, 3) });
  // the wing's chord plane: 4.5° of dihedral, and the bending under load (flex: the tip's rise, m; on the ground the wing
  // sags a little under its fuel, in flight it bends up)
  const zRef = (y, flex) => -1.30 + Math.max(0, y - 2.9) * Math.tan(4.5 * D) + flex * (Math.max(0, y - 2.9) / 27.16) ** 2;
  // a supercritical section round its loop (chord fraction from the leading edge, height in thicknesses): the upper
  // surface from the trailing edge to the nose, the lower back
  const AF = [[1, 0.02], [0.9, 0.17], [0.78, 0.31], [0.64, 0.43], [0.5, 0.51], [0.36, 0.55], [0.24, 0.53], [0.14, 0.45], [0.07, 0.34], [0.025, 0.2], [0, 0.02],
    [0.005, -0.1], [0.03, -0.2], [0.08, -0.3], [0.16, -0.38], [0.28, -0.43], [0.42, -0.44], [0.56, -0.39], [0.7, -0.28], [0.84, -0.14], [0.95, -0.04]];
  const AFS = [[1, 0.01], [0.85, 0.2], [0.68, 0.38], [0.5, 0.48], [0.32, 0.5], [0.16, 0.42], [0.06, 0.27], [0, 0], [0.06, -0.27], [0.16, -0.42], [0.32, -0.5], [0.5, -0.48], [0.68, -0.38], [0.85, -0.2]];
  // the tail: the fin [z, leading edge s, trailing edge s, thickness] (17.0 m tall over the apron; its leading edge swept
  // 43°, its trailing edge 20°), and the stabiliser [y, ...] (19.8 m span, 37° sweep, 7° dihedral)
  const FIN = [[2.2, 46.4, 55.6, 0.95], [12.25, 55.9, 59.3, 0.33]], FINZ = [2.2, 3.0, 4.2, 5.4, 6.6, 7.8, 9.0, 10.2, 11.3, 12.25];
  const STAB = [[1.8, 50.2, 56.0, 0.55], [9.9, 56.3, 57.8, 0.15]], STABY = [1.8, 3.0, 4.4, 5.8, 7.2, 8.6, 9.9], zStab = y => 1.15 + (y - 1.8) * Math.tan(7 * D);
  // the engines (GEnx-1B class: a 2.82 m fan): nacelles 9.8 m out, their lips 4.9 m ahead of the fan nozzle, which ends
  // 0.3 m ahead of the wing's leading edge; the nacelle's underside 0.72 m over the apron; [distance aft of the lip, r]
  const ENG = { y: 9.8, z: -2.37, sLip: 21.65 };
  const NAC = [[0, 1.45], [0.06, 1.53], [0.25, 1.61], [0.7, 1.66], [1.5, 1.665], [2.5, 1.63], [2.9, 1.60]], SLV = [[2.9, 1.60], [3.6, 1.54], [4.3, 1.46], [4.9, 1.38]];
  const CORE = [[4.3, 1.02], [4.9, 0.98], [5.6, 0.90], [6.5, 0.72]], PLUG = [[6.5, 0.55], [6.9, 0.48], [7.3, 0.30], [7.65, 0.04]];
  // high lift and roll control, per side [y0, y1, chord fraction]: the inboard flap, the flaperon behind the engine, the
  // outboard flap; the slats outboard of the engine; seven spoilers ahead of the flaps; four flap-track fairings
  const FLAPS = [[3.3, 9.0, 0.27, 1], [9.25, 10.85, 0.26, 0.6], [11.05, 21.6, 0.25, 1]], SLAT = [11.4, 26.2, 0.14];
  const SPOIL = [[3.4, 5.8], [5.8, 8.5], [11.3, 13.4], [13.4, 15.5], [15.5, 17.6], [17.6, 19.7], [19.7, 21.7]], CANOE = [6.9, 13.6, 17.0, 20.4];
  // the doors (Boeing's table, centres): four Type A doors a side; the forward and aft cargo doors on the right, the bulk
  // cargo door on the left
  const DOORS = [6.30, 18.36, 35.43, 49.66], WIN = [[7.95, 17.4], [19.55, 34.3], [36.6, 48.5], [50.85, 54.3]];

  // a ring of n points round the x axis through (y0, z0)
  const ringX = (x, r, y0, z0, n) => Array.from({ length: n }, (_, m) => { const a = m / n * TAU; return [x, y0 + r * Math.cos(a), z0 + r * Math.sin(a)]; });
  const ringY = (y, r, x0, z0, n) => Array.from({ length: n }, (_, m) => { const a = m / n * TAU; return [x0 + r * Math.cos(a), y, z0 + r * Math.sin(a)]; });
  const tube = (rings, o = {}) => Object.assign({ rings, cen: rings.map(r => E3.centroid(r)) }, o);
  const rotXZ = (p, c, ang) => { const dx = p[0] - c[0], dz = p[2] - c[2], co = Math.cos(ang), si = Math.sin(ang); return [c[0] + dx * co - dz * si, p[1], c[2] + dx * si + dz * co]; };

  // build the airframe for a configuration: lod (0 hero, 1 near, 2 far), flex (the wing tip's rise, m), flap (degrees),
  // slat (0-1), spoiler (degrees), rev (the reversers' sleeves, 0-1), gear { ext (0 compressed, 1 extended), tilt
  // (degrees, the bogies' fronts up) }
  function build(cfg = {}) {
    const lod = cfg.lod || 0, flex = cfg.flex ?? -0.6, NA = [96, 40, 16][lod], NE = [40, 22, 12][lod], parts = [];
    // the wing's section, its points doubled for the hero (so its hatching can close up)
    const AFL = lod ? AF : AF.flatMap((p, i) => { const q = AF[(i + 1) % AF.length]; return [p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]]; });
    const ext = cfg.gear ? cfg.gear.ext : 0, tilt = (cfg.gear ? cfg.gear.tilt : 0) * D;
    const P = (name, side, layer, tubes, st, o = {}) => parts.push(Object.assign({ name, side, layer, tubes: [].concat(tubes), st }, o));
    // the fuselage, its tail cone closed by the APU's exhaust
    const stn = lod < 2 ? STN : STN.filter((_, i) => i % 2 === 0 || i === STN.length - 1);
    const fr = stn.map(s => Array.from({ length: NA }, (_, j) => skin(s, j / NA * TAU)));
    P('fus', 'C', 'fus', tube(fr, { capEnd: 'dark' }), 'skin');
    // the wing-to-body fairing under the wing root (the main gear's wells), bulging 0.3 m below and beside the skin
    if (lod < 2) {
      const fs = [16, 18, 20.5, 23, 26, 29, 32, 34.5, 36.5, 38.5], a0 = -0.11 * Math.PI, a1 = -0.89 * Math.PI, na = lod ? 9 : 14;
      const bump = s => AUH.smooth(clamp((s - 16) / 4.5)) * AUH.smooth(clamp((38.5 - s) / 5));
      const rings = fs.map(s => Array.from({ length: na + 1 }, (_, j) => { const u = j / na, a = lerp(a0, a1, u); return skin(s, a, 0.32 * bump(s) * Math.pow(Math.sin(Math.PI * u), 0.6)); }));
      P('belly', 'C', 'belly', tube(rings, { open: true, cen: fs.map(s => [X(s), 0, 0]), faint: true }), 'skin');
    }
    ['L', 'R'].forEach(side => {
      const sg = side === 'L' ? 1 : -1;
      // the wing, its raked tip closed
      const span = lod < 2 ? SPAN : SPAN.filter((_, i) => i % 2 === 0 || i === SPAN.length - 1);
      const sec = y => { const w = wingAt(y), c = w.st - w.sl, z = zRef(y, flex); return AFL.map(([f, k]) => [X(w.sl + f * c), sg * y, z + k * w.t]); };
      // its control surfaces' seams on the upper surface: the hinge line of the flaps and ailerons (stowed), the spoilers'
      // outlines, the slats' rear edge
      const kUp = f => { for (let i = 1; i <= 10; i++) if (AF[i][0] <= f) { const a = AF[i - 1], b = AF[i], t = (f - b[0]) / (a[0] - b[0]); return b[1] + (a[1] - b[1]) * t; } return 0; };
      const upAt = (y, f) => { const w = wingAt(y), c = w.st - w.sl; return [X(w.sl + f * c), sg * y, zRef(y, flex) + kUp(f) * w.t + 0.01]; };
      const run = (y0, y1, fy) => { const pts = []; for (let k = 0; k <= 8; k++) { const y = lerp(y0, y1, k / 8); pts.push(upAt(y, fy(y))); } return pts; };
      const lines = [];
      const fs = y => { const w = wingAt(y), c = w.st - w.sl; return 0.75 - (y < 9 ? 1.5 : 0.21 * c) / c; };
      if (!((cfg.flap || 0) > 0.5)) lines.push(run(3.4, 26.4, () => 0.75));
      if (!((cfg.spoiler || 0) > 0.5)) SPOIL.forEach(([y0, y1]) => { lines.push(run(y0, y1, fs)); [y0, y1].forEach(y => lines.push([upAt(y, fs(y)), upAt(y, 0.75)])); });
      if (!((cfg.slat || 0) > 0.01)) lines.push(run(SLAT[0], SLAT[1], () => 0.13));
      [21.8, 26.4].forEach(y => lines.push([upAt(y, 0.75), upAt(y, 0.99)]));
      P('wing', side, 'wing', tube(span.map(sec), { capEnd: 'skin' }), 'wing', { lines: lod < 2 ? lines : [], ln: [0, 0, 1] });
      // the flaps (single-slotted, Fowler): out only at the landing setting, run aft and turned down about their noses
      if ((cfg.flap || 0) > 0.5) FLAPS.forEach(([y0, y1, cf, k], i) => {
        const del = cfg.flap * k * D, ys = [y0, (y0 + y1) / 2, y1];
        const fsec = y => { const w = wingAt(y), c = (w.st - w.sl) * cf, tf = 0.16 * c, le = [X(w.st) + 0.12 * c, sg * y, zRef(y, flex) - 0.18 * w.t - 0.05], d = [-Math.cos(del), -Math.sin(del)], nn = [-Math.sin(del), Math.cos(del)];
          return AFS.map(([f, kk]) => [le[0] + c * f * d[0] + kk * tf * nn[0], le[1], le[2] + c * f * d[1] + kk * tf * nn[1]]); };
        P('flap' + i, side, 'flap', tube(ys.map(fsec), { capStart: 'skin', capEnd: 'skin' }), 'wing');
      });
      // the slats, run forward and down ahead of the leading edge
      if ((cfg.slat || 0) > 0.01) {
        const ys = [SLAT[0], 15.6, 20.2, SLAT[1]], q = cfg.slat;
        const ssec = y => { const w = wingAt(y), ch = w.st - w.sl, c = ch * SLAT[2], tf = 0.14 * c, z = zRef(y, flex), ang = (24 * q) * D;
          const te = [X(w.sl) + 0.02 * ch * q - 0.04 * ch * (1 - q), sg * y, z + 0.12 * w.t], d = [Math.cos(ang), -Math.sin(ang)], nn = [Math.sin(ang), Math.cos(ang)];
          return AFS.map(([f, kk]) => [te[0] + c * (1 - f) * d[0] + kk * tf * nn[0], te[1], te[2] + c * (1 - f) * d[1] + kk * tf * nn[1]]); };
        P('slat', side, 'slat', tube(ys.map(ssec), { capStart: 'skin', capEnd: 'skin' }), 'wing');
      }
      // the spoilers: raised on the ground after touchdown, hinged at their front edges on the upper surface
      if ((cfg.spoiler || 0) > 0.5) SPOIL.forEach(([y0, y1], i) => {
        const del = cfg.spoiler * D;
        const psec = y => { const w = wingAt(y), ch = w.st - w.sl, c = i < 2 ? 1.5 : 0.21 * ch, h = [X(w.st) + 0.08 + c, sg * y, zRef(y, flex) + 0.36 * w.t];
          const te = [h[0] - c * Math.cos(del), h[1], h[2] + c * Math.sin(del)], n = [Math.sin(del) * 0.04, 0, Math.cos(del) * 0.04];
          return [add(h, n), add(te, n), add(te, n, -1), add(h, n, -1)]; };
        P('spoil' + i, side, 'spoil', tube([psec(y0 + 0.05), psec(y1 - 0.05)], { capStart: 'skin', capEnd: 'skin' }), 'wing');
      });
      // the flap-track fairings: slender canoes under the trailing edge, their tails turning down with the flaps
      if (lod < 2) CANOE.forEach((y, i) => {
        const w = wingAt(y), z = zRef(y, flex), zl = z - 0.42 * w.t, xt = X(w.st), del = (cfg.flap || 0) * 0.55 * D, piv = [xt + 0.2, sg * y, zl];
        const xs = [2.6, 1.8, 0.9, 0.1, -0.6, -1.3, -1.75], dep = [0.08, 0.38, 0.55, 0.58, 0.5, 0.36, 0.2];
        const rings = xs.map((dx, k) => { const r = Math.max(0.04, dep[k]) / 2, c = [xt + dx, sg * y, zl - r]; const ring = Array.from({ length: 10 }, (_, m) => { const a = m / 10 * TAU; return [c[0], c[1] + 0.27 * Math.cos(a) * (0.3 + 0.7 * Math.min(1, dep[k] / 0.3)), c[2] + r * Math.sin(a)]; }); return dx < 0.2 ? ring.map(p => rotXZ(p, piv, del)) : ring; });
        P('canoe' + i, side, 'under', tube(rings, { capEnd: 'skin' }), 'wing', { lod1: true });
      });
      // the engine: its nacelle (the reverser's sleeve run aft on the runway, opening the cascades), the inlet, the fan
      // nozzle with its chevrons, the core cowl and the plug; its pylon
      {
        const xl = X(ENG.sLip), yc = sg * ENG.y, zc = ENG.z, rv = (cfg.rev || 0) * 0.75;
        const nac = NAC.map(([d, r]) => ringX(xl - d, r, yc, zc, NE)), slv = SLV.map(([d, r]) => ringX(xl - d - rv, r, yc, zc, NE));
        const tubes = { nac: tube(nac), slv: tube(slv), rev: rv > 0.02 ? tube([ringX(xl - 2.9, 1.585, yc, zc, NE), ringX(xl - 2.9 - rv, 1.585, yc, zc, NE)]) : null,
          lip: tube([ringX(xl - 0.02, 1.42, yc, zc, NE), ringX(xl - 0.35, 1.36, yc, zc, NE), ringX(xl - 0.75, 1.33, yc, zc, NE)], { inward: true }),
          fan: ringX(xl - 0.75, 1.33, yc, zc, NE), spin: tube([ringX(xl - 0.75, 0.44, yc, zc, 12), ringX(xl - 0.5, 0.3, yc, zc, 12), ringX(xl - 0.28, 0.02, yc, zc, 12)]),
          core: tube(CORE.map(([d, r]) => ringX(xl - d - rv * 0, r, yc, zc, NE))), plug: tube(PLUG.map(([d, r]) => ringX(xl - d, r, yc, zc, 12))),
          exit: { x: xl - 4.9 - rv, r: 1.38, y: yc, z: zc, n: lod ? 0 : 16 }, coreExit: { x: xl - 6.5, r: 0.72, y: yc, z: zc, n: lod ? 0 : 12 } };
        // the pylon: a slender blade from the nacelle's crown up into the wing, its fairing running aft under the wing
        const yw = ENG.y, w = wingAt(yw), zw = zRef(yw, flex), xLE = X(w.sl), ds = [1.0, 2.0, 3.2, 4.4, 5.6, 7.0, 8.4, 9.6, 10.8, 12.4];
        const lowAt = x => { const f = clamp((xLE - x) / (w.st - w.sl)); let k = -0.44; for (let i = 11; i < AF.length; i++) if (AF[i][0] >= f) { k = AF[i][1]; break; } return zw + k * w.t; };
        const prings = ds.map(d => {
          const x = xl - d, nt = d < 4.9 ? lin(NAC.concat(SLV.slice(1)), d, 1) : 0, bot = d < 5.4 ? zc + Math.max(nt, 1.3) - 0.12 : lerp(zc + 1.25, lowAt(x) - 0.25, clamp((d - 5.4) / 7)), top = x > xLE ? lerp(zc + 1.62, zw + 0.25, clamp((d - 1.0) / (xl - xLE - 1.0))) : lowAt(x) + 0.15;
          const hw = d < 1.6 ? 0.18 : d > 11 ? 0.12 : 0.3, b = Math.min(bot, top - 0.05);
          return [[x, yc + hw * 0.6, top], [x, yc - hw * 0.6, top], [x, yc - hw, (top + b) / 2], [x, yc - hw * 0.5, b], [x, yc + hw * 0.5, b], [x, yc + hw, (top + b) / 2]];
        });
        P('engine', side, 'under', [], 'skin', { eng: tubes, pylon: tube(prings, { capStart: 'skin' }), c: [xl - 3, yc, zc] });
      }
      // the main gear: the oleo leg under the wing, its side brace, the leg door, a four-wheel bogie (54 × 21 in tyres),
      // the bogie hanging tilted (front up) until the rear wheels meet the runway
      {
        const yg = sg * 4.9, piv = [0, yg, -Z0 + 0.62 - 0.36 * ext], top = [0.25, yg, -1.75], g = [], r = 0.62 + 0.065 * ext;
        const ax = [0.75, -0.75].map(dx => [dx * Math.cos(tilt), yg, piv[2] + dx * Math.sin(tilt)]);
        const mid = [0.05, yg, (top[2] + piv[2]) / 2];
        const legs = [rod(top, add(mid, [0, 0, 0.25]), 0.21, 8), rod(add(mid, [0, 0, 0.45]), add(piv, [0, 0, 0.16]), 0.15, 8)];
        const beam = rod(add(ax[0], [0.3 * Math.cos(tilt), 0, 0.3 * Math.sin(tilt)]), add(ax[1], [-0.3 * Math.cos(tilt), 0, -0.3 * Math.sin(tilt)]), 0.11, 8);
        ax.forEach(a => [-1, 1].forEach(o => g.push(wheelT([a[0], yg + o * 0.68, a[2]], r, 0.53, lod ? 12 : 18))));
        const brace = rod([0.02, yg, -2.85], [0.02, sg * 2.6, -2.25], 0.075, 6);
        const door = [[0.75, yg + sg * 0.3, -1.85], [-0.55, yg + sg * 0.3, -1.85], [-0.5, yg + sg * 0.32, -3.35], [0.7, yg + sg * 0.32, -3.35]];
        P('gear', side, 'under', [], 'strut', { gear: { legs, beam, wheels: g, brace, door, piv }, c: [0, yg, piv[2] + 0.6] });
      }
      // the horizontal stabiliser
      const el = []; for (let k = 0; k <= 6; k++) { const y = lerp(2.6, 9.6, k / 6), s0 = lin(STAB, y, 1), s1 = lin(STAB, y, 2), t = lin(STAB, y, 3); el.push([X(s0 + 0.7 * (s1 - s0)), sg * y, zStab(y) + 0.42 * t]); }
      P('stab', side, 'stab', tube(STABY.map(y => { const s0 = lin(STAB, y, 1), s1 = lin(STAB, y, 2), t = lin(STAB, y, 3), z = zStab(y); return AFS.map(([f, k]) => [X(s0 + f * (s1 - s0)), sg * y, z + k * t]); }), { capEnd: 'skin' }), 'wing', { lines: lod < 2 ? [el] : [], ln: [0, 0, 1] });
    });
    // the fin
    // the fin, its rudder's hinge line on either side
    const rud = sg => { const pts = []; for (let k = 0; k <= 6; k++) { const z = lerp(3.0, 12.0, k / 6), s0 = lin(FIN, z, 1), s1 = lin(FIN, z, 2), t = lin(FIN, z, 3); pts.push([X(s0 + 0.68 * (s1 - s0)), sg * (0.42 * t + 0.01), z]); } return pts; };
    P('fin', 'C', 'fin', tube(FINZ.map(z => { const s0 = lin(FIN, z, 1), s1 = lin(FIN, z, 2), t = lin(FIN, z, 3); return AFS.map(([f, k]) => [X(s0 + f * (s1 - s0)), k * t, z]); }), { capEnd: 'skin' }), 'wing',
      { lines: lod < 2 ? [rud(1), rud(-1)] : [], lnOf: [[0, 1, 0], [0, -1, 0]] });
    // the nose gear: a leg under the flight deck and two wheels (40 × 16 in), its taxi light on the leg
    {
      const en = cfg.gear ? (cfg.gear.extN ?? ext) : 0, xn = X(SNG), ax = -Z0 + 0.47 - 0.3 * en, r = 0.47 + 0.04 * en;
      const legs = [rod([xn, 0, -2.5], [xn - 0.05, 0, (ax - 2.5) / 2], 0.15, 8), rod([xn - 0.05, 0, (ax - 2.5) / 2 + 0.2], [xn - 0.12, 0, ax + 0.15], 0.11, 8)];
      P('nose', 'C', 'nose', [], 'strut', { gear: { legs, wheels: [-1, 1].map(o => wheelT([xn - 0.12, o * 0.42, ax], r, 0.38, lod ? 10 : 14)), door: null }, c: [xn, 0, ax] });
    }
    return { parts, cfg, lod, flex };
  }
  // a rod from a to b (a leg, a brace, a bogie's beam): two rings square to it
  function rod(a, b, r, n) {
    const d = E3.sub(b, a), L = Math.hypot(...d), u = d.map(c => c / L), t = Math.abs(u[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    let e1 = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]]; const l1 = Math.hypot(...e1); e1 = e1.map(c => c / l1);
    const e2 = [u[1] * e1[2] - u[2] * e1[1], u[2] * e1[0] - u[0] * e1[2], u[0] * e1[1] - u[1] * e1[0]];
    const ring = c => Array.from({ length: n }, (_, m) => { const q = m / n * TAU; return [c[0] + r * (e1[0] * Math.cos(q) + e2[0] * Math.sin(q)), c[1] + r * (e1[1] * Math.cos(q) + e2[1] * Math.sin(q)), c[2] + r * (e1[2] * Math.cos(q) + e2[2] * Math.sin(q))]; });
    return tube([ring(a), ring(b)]);
  }
  // a wheel: its tread a short tube across the aircraft, its two sidewalls flat caps
  function wheelT(c, r, w, n) {
    const ys = [-w / 2, -w / 2 + 0.06, -0.1, 0.1, w / 2 - 0.06, w / 2], rs = [0.86, 0.97, 1, 1, 0.97, 0.86];
    return tube(ys.map((dy, k) => ringY(c[1] + dy, r * rs[k], c[0], c[2], n)), { capStart: 'hub', capEnd: 'hub', hubR: r * 0.55 });
  }

  /* ---------- the details on the skin ---------- */
  // points of an outline (s, z) on the left (sg 1) or right side, carried onto the skin
  const onSide = (pts, sg) => pts.map(([s, z]) => skin(s, angAt(s, z, sg), 0.01));
  const rrect = (s0, s1, z0, z1, r, n = 3) => {
    const out = [], c = [[s1 - r, z1 - r, 0], [s0 + r, z1 - r, 90], [s0 + r, z0 + r, 180], [s1 - r, z0 + r, 270]];
    c.forEach(([cs, cz, a0]) => { for (let k = 0; k <= n; k++) { const a = (a0 + 90 * k / n) * D; out.push([cs + r * Math.cos(a), cz + r * Math.sin(a)]); } });
    return out;
  };
  function decals(lod) {
    const out = { win: [], lines: [], glass: [], dark: [] };
    [1, -1].forEach(sg => {
      // the cabin windows: 27 × 47 cm at a 61 cm pitch, their centres 0.55 m over the axis (1 m over the floor)
      if (lod < 2) WIN.forEach(([s0, s1]) => { for (let s = s0; s <= s1 + 0.01; s += 0.61) out.win.push({ pts: onSide(rrect(s - 0.135, s + 0.135, 0.31, 0.79, 0.12, lod ? 1 : 2), sg), n: skinN(s, angAt(s, 0.55, sg)), c: skin(s, angAt(s, 0.55, sg)) }); });
      // the doors (1.07 × 1.9 m, the sill at the floor, 0.45 m under the axis); the cargo doors
      DOORS.forEach(s => out.lines.push({ pts: onSide(rrect(s - 0.535, s + 0.535, -0.45, 1.45, 0.24), sg), n: skinN(s, angAt(s, 0.5, sg)), c: skin(s, angAt(s, 0.5, sg)), a: 0.62, closed: true }));
      (sg < 0 ? [[11.0, 1.35], [43.31, 0.9]] : [[47.75, 0.45]]).forEach(([s, hw]) => out.lines.push({ pts: onSide(rrect(s - hw, s + hw, -2.35, -0.95, 0.15), sg), n: skinN(s, angAt(s, -1.6, sg)), c: skin(s, angAt(s, -1.6, sg)), a: 0.45, closed: true }));
      // the flight deck's side window
      out.glass.push({ pts: onSide([[3.17, 1.12], [3.7, 1.07], [4.25, 1.06], [4.45, 1.25], [4.25, 1.56], [3.3, 1.76], [3.14, 1.55]], sg), n: skinN(3.8, angAt(3.8, 1.35, sg)), c: skin(3.8, angAt(3.8, 1.35, sg)) });
      // the windshield's pane on this side: from the centre post to the side window, its lower edge sweeping down and back
      const ws = [[2.45, 86], [2.58, 68], [2.78, 50], [3.02, 36], [3.1, 51], [3.03, 70], [2.95, 86]].map(([s, a]) => { const q = sg > 0 ? a * D : Math.PI - a * D; return skin(s, q, 0.01); });
      out.glass.push({ pts: ws, n: skinN(2.7, sg > 0 ? 62 * D : Math.PI - 62 * D), c: skin(2.75, sg > 0 ? 62 * D : Math.PI - 62 * D), front: true });
    });
    // the radome's joint, a ring just ahead of the flight deck
    const rj = [], rs = 1.75; for (let k = 0; k <= 36; k++) { const a = k / 36 * TAU; rj.push({ p: skin(rs, a, 0.01), n: skinN(rs, a) }); }
    out.ring = rj;
    // the anti-collision beacons (dark: never lit on the plate), above and below the fuselage
    out.dark.push({ c: skin(21, Math.PI / 2, 0.12), n: [0, 0, 1], r: 0.18 }, { c: [X(31.5), 0, -3.1], n: [0, 0, -1], r: 0.18 });
    return out;
  }
  // the lights that burn steadily on the approach: the landing lights in each wing root's leading edge, the taxi light on
  // the nose gear's leg; each with the way it faces
  const LIGHTS = [[1, [X(22.5), 3.75, -1.62]], [-1, [X(22.5), -3.75, -1.62]], [0, [X(SNG) + 0.12, 0, -3.25]]].map(([sg, p]) => ({ sg, p, dir: [Math.cos(3 * D), 0, -Math.sin(3 * D)] }));

  /* ---------- the engraver: the airframe drawn as the plate draws ---------- */
  // each surface is a tube of rings; its visible skin is laid in paper (one shape, so no seams), washed in colour by its
  // light, hatched with lines that run along the surface (along the fuselage and the nacelles, along the span on the
  // wings and the tail), thicker and closer where the surface turns from the light and crossed in deep shade, then
  // outlined at its silhouette and its creases with a weight that falls with the distance
  const ST = {
    skin: { tone: 0.02, shade: 0.5, sky: 0.16, fill: '#F4EFE6', fillA: 0.42, cool: '#8E9CB3', coolA: 0.62, ink: 1, lw: 1.15, warm: 1 },
    wing: { tone: 0.04, shade: 0.5, sky: 0.14, fill: '#F2EDE4', fillA: 0.42, cool: '#8E9CB3', coolA: 0.62, ink: 1, lw: 1.05, warm: 1, crease: 0.35 },
    strut: { tone: 0.3, shade: 0.42, sky: 0.08, fill: '#A7ABAE', fillA: 0.42, cool: '#6F7884', coolA: 0.3, ink: 0.8, lw: 0.85 },
    tyre: { tone: 0.6, shade: 0.3, sky: 0.06, fill: '#35302C', fillA: 0.58, ink: 0.55, lw: 0.8 },
    hub: { tone: 0.24, shade: 0.4, sky: 0.05, fill: '#A19E99', fillA: 0.45, ink: 0.6, lw: 0.6 },
    dark: { tone: 0.74, shade: 0.2, sky: 0, fill: '#2B2A29', fillA: 0.62, ink: 0.5, lw: 0.9 },
    core: { tone: 0.2, shade: 0.45, sky: 0.1, fill: '#C0B9AE', fillA: 0.42, cool: '#7D8696', coolA: 0.3, ink: 0.9, lw: 0.95 },
    plug: { tone: 0.36, shade: 0.42, sky: 0.06, fill: '#8F8882', fillA: 0.45, ink: 0.85, lw: 0.9 },
  };
  const DITH = [0, 4, 2, 6, 1, 5, 3, 7];
  const sub = E3.sub, dot = E3.dot;
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // closed screen polygons as one path, each wound the same way, so a nonzero fill is their union
  function trace(g, polys) {
    g.beginPath();
    polys.forEach(pp => {
      let ar = 0; for (let k = 0; k < pp.length; k++) { const a = pp[k], b = pp[(k + 1) % pp.length]; ar += a[0] * b[1] - b[0] * a[1]; }
      const q = ar < 0 ? pp.slice().reverse() : pp;
      g.moveTo(q[0][0], q[0][1]); for (let k = 1; k < q.length; k++) g.lineTo(q[k][0], q[k][1]); g.closePath();
    });
  }
  function paper(polys) { if (!polys.length) return; ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA; ctx.fillStyle = PAPER_PAT; trace(ctx, polys); ctx.fill('nonzero'); ctx.restore(); }
  function tint(polys, col, a, mode = BLEND) { if (!polys.length || a <= 0.003) return; ctx.save(); ctx.globalAlpha = SA * Math.min(1, a); ctx.globalCompositeOperation = mode; ctx.fillStyle = col; trace(ctx, polys); ctx.fill('nonzero'); ctx.restore(); }
  function strokeSegs(segs, col, lw, a, cap = 'round') {
    if (!segs.length || a <= 0.003) return;
    ctx.save(); ctx.globalAlpha = SA * Math.min(1, a); ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.lineJoin = 'round';
    ctx.beginPath(); segs.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
  }
  // a world segment cut at the fog's top (when the plate redraws what stands above it), on the screen
  function segS(a, b, h) {
    if (h !== null) { const ia = a[2] >= h, ib = b[2] >= h; if (!ia && !ib) return null; if (ia !== ib) { const t = (h - a[2]) / (b[2] - a[2]), m = lerp3(a, b, t); if (ia) b = m; else a = m; } }
    return [E3.proj(a), E3.proj(b)];
  }
  const polyS = (pts, h) => { const q = h === null ? pts : AUH.above(pts, h); return q.length > 2 ? q.map(E3.proj) : null; };
  // the outline's weight at a depth: about 1.1 px where a metre is 10 px, never under 0.4 px
  const lwAt = (st, o, pxm) => clamp((st.lw || 1.1) * (o.lw ?? 1) * (0.42 + 0.068 * Math.min(pxm, 30)), 0.4, 2.3);

  function drawTube(T, st, o, look = {}) {
    const cam = E3.cam(), C = cam.C, sun = E3.sun(), h = AUH.clipZ(), R = T.rings, ni = R.length, nj = R[0].length, closed = !T.open, nq = closed ? nj : nj - 1;
    const a = (o.air ?? 1) * (look.a ?? 1);
    for (const r of R) for (const p of r) if (E3.depth(p) < 1) return;
    const S = R.map(r => r.map(E3.proj)), Q = [];
    for (let i = 0; i + 1 < ni; i++) {
      const row = [];
      for (let j = 0; j < nq; j++) {
        const j1 = (j + 1) % nj, p0 = R[i][j], p1 = R[i + 1][j], p2 = R[i + 1][j1], p3 = R[i][j1];
        let n = crs(sub(p2, p0), sub(p3, p1)); const L = Math.hypot(n[0], n[1], n[2]);
        if (L < 1e-10) { row.push(null); continue; }
        n = [n[0] / L, n[1] / L, n[2] / L];
        const m = [(p0[0] + p1[0] + p2[0] + p3[0]) / 4, (p0[1] + p1[1] + p2[1] + p3[1]) / 4, (p0[2] + p1[2] + p2[2] + p3[2]) / 4], ax = lerp3(T.cen[i], T.cen[i + 1], 0.5);
        if (dot(n, sub(m, ax)) < 0) n = [-n[0], -n[1], -n[2]];
        if (T.inward) n = [-n[0], -n[1], -n[2]];
        const v = sub(C, m), dv = Math.hypot(v[0], v[1], v[2]), ndv = dot(n, v) / dv, lit = Math.max(0, dot(n, sun));
        const dark = clamp((look.tone ?? st.tone) + (look.shade ?? st.shade) * (1 - lit) - (st.sky || 0) * Math.max(0, n[2]) + (st.under ?? 0.16) * Math.max(0, -n[2]) * (1 - lit));
        row.push({ n, front: ndv > 0, ndv, lit, dark, pxm: cam.f / Math.max(1, E3.depth(m)) });
      }
      Q.push(row);
    }
    const quadW = (i, j) => { const j1 = (j + 1) % nj; return [R[i][j], R[i + 1][j], R[i + 1][j1], R[i][j1]]; };
    const fronts = [], byDark = [[], [], [], [], []], byLit = [[], [], [], []];
    let pxm = 0, nf = 0;
    for (let i = 0; i + 1 < ni; i++) for (let j = 0; j < nq; j++) {
      const q = Q[i][j]; if (!q || !q.front) continue;
      const pp = h === null ? [S[i][j], S[i + 1][j], S[i + 1][(j + 1) % nj], S[i][(j + 1) % nj]] : polyS(quadW(i, j), h);
      if (!pp) continue;
      fronts.push(pp); pxm += q.pxm; nf++;
      if (q.dark > 0.25) byDark[Math.min(4, Math.floor((q.dark - 0.25) / 0.13))].push(pp);
      if (q.lit > 0.12) byLit[Math.min(3, Math.floor(q.lit * 4))].push(pp);
    }
    if (!nf) return;
    pxm /= nf;
    paper(fronts);
    if (OPT.colour) {
      tint(fronts, look.fill || st.fill, (look.fillA ?? st.fillA) * (o.fillK ?? 1));
      if (st.cool) byDark.forEach((pp, k) => tint(pp, st.cool, st.coolA * (k + 1) / 5 * (o.coolK ?? 1)));
      if (o.warm && st.warm) { byLit.forEach((pp, k) => tint(pp, o.warm, (o.warmA ?? 0.25) * (k + 1) / 4)); if (o.warmAll) tint(fronts, o.warm, o.warmAll); }
    } else byDark.forEach((pp, k) => tint(pp, INK, (o.inkFill ?? 0.1) * ((k + 1) / 5) ** 2 * (st.tone > 0.5 ? 3 : 1)));
    if (look.lines !== false) {
      // the lines along the surface, by the tone they carry: a darker surface takes more of them (an ordered choice,
      // faded in and out, so none blinks as the view turns), never closer than about 2.3 px
      const bins = [[], [], [], []], ink = (st.ink ?? 1) * a * (o.hatchA ?? 1);
      for (let j = closed ? 0 : 1; j < (closed ? nj : nj - 1); j++) {
        const r = (DITH[j % 8] + 0.5) / 8, jp = (j - 1 + nj) % nj, jn = (j + 1) % nj;
        for (let i = 0; i + 1 < ni; i++) {
          const q1 = Q[i][(j - 1 + nq) % nq], q2 = Q[i][j % nq];
          if (!q1 || !q2 || !q1.front || !q2.front) continue;
          const dk = (q1.dark + q2.dark) / 2, sp = (Math.hypot(S[i][j][0] - S[i][jp][0], S[i][j][1] - S[i][jp][1]) + Math.hypot(S[i][j][0] - S[i][jn][0], S[i][j][1] - S[i][jn][1])) / 2;
          const den = clamp((dk - 0.08) / 0.5) * Math.min(1, sp / 1.9), w = clamp((den - r) * 6);
          if (w < 0.03) continue;
          const al = (0.2 + 0.62 * dk) * w * clamp(Math.min(q1.ndv, q2.ndv) * 5, 0.3, 1);
          const sg = segS(R[i][j], R[i + 1][j], h); if (sg) bins[Math.min(3, Math.floor(al * 6))].push(sg);
        }
      }
      const lw = clamp(0.5 + 0.03 * pxm, 0.55, 0.95) * (o.hatchW ?? 1);
      bins.forEach((sg, k) => strokeSegs(sg, st.hatchCol || INK, lw, ink * (k + 0.9) / 5));
      // the crossing lines in deep shade: across the surface, about 3.4 px apart
      const cross = [[], [], []];
      for (let i = 0; i + 1 < ni; i++) for (let j = 0; j < nq; j++) {
        const q = Q[i][j]; if (!q || !q.front || q.dark < 0.56) continue;
        const j1 = (j + 1) % nj, A = S[i][j], B = S[i + 1][j], Cc = S[i + 1][j1], Dd = S[i][j1], len = (Math.hypot(B[0] - A[0], B[1] - A[1]) + Math.hypot(Cc[0] - Dd[0], Cc[1] - Dd[1])) / 2;
        const k = Math.floor(len / 3.4); if (k < 1) continue;
        const al = clamp((q.dark - 0.56) * 2.2) * clamp(q.ndv * 4, 0.3, 1);
        for (let t = 1; t <= k; t++) {
          const u = t / (k + 1), w0 = lerp3(R[i][j], R[i + 1][j], u), w1 = lerp3(R[i][j1], R[i + 1][j1], u), sg = segS(w0, w1, h);
          if (sg) cross[Math.min(2, Math.floor(al * 3))].push(sg);
        }
      }
      cross.forEach((sg, k) => strokeSegs(sg, st.hatchCol || INK, lw * 0.9, ink * 0.5 * (k + 0.6) / 3));
    }
    // the outline: the silhouette, the open ends, and the creases (a wing's trailing edge, a lip)
    const OL = new Map(), crease = st.crease ?? 0.55;
    const edge = (pa, pb, q, k) => { const sg = segS(pa, pb, h); if (!sg) return; const lw = lwAt(st, o, q.pxm) * k, key = Math.round(lw * 5); if (!OL.has(key)) OL.set(key, []); OL.get(key).push(sg); };
    for (let j = 0; j < nj; j++) for (let i = 0; i + 1 < ni; i++) {
      const q1 = (closed || j > 0) ? Q[i][(j - 1 + nq) % nq] : null, q2 = (closed || j < nq) ? Q[i][j % nq] : null;
      const f1 = !!(q1 && q1.front), f2 = !!(q2 && q2.front);
      if (f1 !== f2) { if ((q1 && q2) || !T.faint) edge(R[i][j], R[i + 1][j], f1 ? q1 : q2, 1); else edge(R[i][j], R[i + 1][j], f1 ? q1 : q2, 0.45); }
      else if (f1 && f2 && dot(q1.n, q2.n) < crease) edge(R[i][j], R[i + 1][j], q1, 0.8);
    }
    for (let i = 0; i < ni; i++) for (let j = 0; j < nq; j++) {
      const q1 = i > 0 ? Q[i - 1][j] : null, q2 = i < ni - 1 ? Q[i][j] : null, f1 = !!(q1 && q1.front), f2 = !!(q2 && q2.front);
      const j1 = (j + 1) % nj;
      if (f1 !== f2) edge(R[i][j], R[i][j1], f1 ? q1 : q2, 1);
      else if (f1 && f2 && dot(q1.n, q2.n) < crease) edge(R[i][j], R[i][j1], q1, 0.8);
    }
    OL.forEach((sg, key) => strokeSegs(sg, INK, key / 5, (st.edgeA ?? 0.85) * a * (T.faint ? 0.8 : 1)));
    // the ends: closed by a flat cap where the tube does not run into something (a wing's tip, a wheel's sidewalls)
    [['capStart', 0, 1], ['capEnd', ni - 1, ni - 2]].forEach(([k, i, i2]) => {
      if (!T[k]) return;
      const nrm = unit(sub(T.cen[i], T.cen[i2]));
      flat(R[i], nrm, T[k] === 'hub' ? ST.tyre : T[k] === 'dark' ? ST.dark : st, o, a, T[k] === 'hub' ? { hub: T.hubR, c: T.cen[i] } : null);
    });
  }
  // a flat face (a cap, a door panel): paper, its wash, a planar hatch, its outline
  function flat(pts, n, st, o, a, hub = null) {
    const C = E3.cam().C, c = E3.centroid(pts), h = AUH.clipZ();
    if (dot(n, sub(C, c)) <= 0) return;
    const sp = polyS(pts, h); if (!sp) return;
    const pxm = E3.cam().f / Math.max(1, E3.depth(c)), lit = Math.max(0, dot(n, E3.sun())), dark = clamp(st.tone + st.shade * (1 - lit) - (st.sky || 0) * Math.max(0, n[2]));
    paper([sp]);
    if (OPT.colour) tint([sp], st.fill, st.fillA); else tint([sp], INK, 0.1 * dark * dark * (st.tone > 0.5 ? 4 : 1));
    const xs = sp.map(p => p[0]), ys = sp.map(p => p[1]), bb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    if (dark > 0.16 && (bb[2] - bb[0]) * (bb[3] - bb[1]) > 8) hatch(new P(sp, true), bb, 1.2, 8.5 - 5.5 * dark, 1, INK, 0.7, (0.12 + 0.3 * dark) * a * (st.ink ?? 1), 31);
    strokeSegs(sp.map((p, k) => [p, sp[(k + 1) % sp.length]]), INK, lwAt(st, o, pxm) * 0.85, (st.edgeA ?? 0.85) * a);
    if (hub) {
      // the wheel's rim and hub, lighter, on the sidewall that faces the eye
      const hp = Array.from({ length: 14 }, (_, m) => { const q = m / 14 * TAU, u = unit(crs(n, [0, 0, 1])), w = crs(u, n); return add(add(hub.c, u, hub.hub * Math.cos(q)), w, hub.hub * Math.sin(q)); });
      const hs = polyS(hp, h); if (!hs) return;
      tint([hs], OPT.colour ? ST.hub.fill : '#FFFFFF', OPT.colour ? 0.7 : 0, BLEND);
      if (!OPT.colour) paper([hs]);
      strokeSegs(hs.map((p, k) => [p, hs[(k + 1) % hs.length]]), INK, lwAt(st, o, pxm) * 0.6, 0.6 * a);
    }
  }
  // a tube in the world
  const toWorld = (T, W) => Object.assign({}, T, { rings: T.rings.map(r => r.map(W)), cen: T.cen.map(W) });
  const dirW = (pose, v) => { const o = pose.toW([0, 0, 0]), q = pose.toW(v); return [q[0] - o[0], q[1] - o[1], q[2] - o[2]]; };

  // the engine: what lies behind the nacelle first, the nacelle, then what shows in front of it (the inlet from ahead,
  // the nozzle's mouth, the core and the plug from behind); the pylon under or over it as the eye is below or above
  function drawEngine(p, pose, o, eyeB) {
    const e = p.eng, W = pose.toW, tw = T => T && toWorld(T, W);
    const behind = eyeB[0] < e.exit.x, ahead = eyeB[0] > X(ENG.sLip) - 0.2, over = eyeB[2] > ENG.z + 1.5;
    if (!over) drawTube(tw(p.pylon), ST.skin, o);
    if (!behind) { drawTube(tw(e.plug), ST.plug, o); drawTube(tw(e.core), ST.core, o); }
    drawTube(tw(e.nac), ST.skin, o);
    if (e.rev) drawTube(tw(e.rev), ST.dark, o);
    drawTube(tw(e.slv), ST.skin, o);
    const ringOf = (x, r, n) => Array.from({ length: n }, (_, m) => { const a = m / n * TAU; return W([x, e.exit.y + r * Math.cos(a), e.exit.z + r * Math.sin(a)]); });
    if (ahead) {
      drawTube(tw(e.lip), ST.skin, o, { tone: 0.12 });
      flat(e.fan.map(W), dirW(pose, [1, 0, 0]), ST.dark, o, o.air ?? 1);
      drawTube(tw(e.spin), ST.core, o);
    }
    if (behind) {
      flat(ringOf(e.exit.x + 0.05, e.exit.r - 0.03, 20), dirW(pose, [-1, 0, 0]), ST.dark, o, o.air ?? 1);
      drawTube(tw(e.core), ST.core, o);
      flat(ringOf(e.coreExit.x + 0.03, e.coreExit.r - 0.03, 14), dirW(pose, [-1, 0, 0]), ST.dark, o, o.air ?? 1);
      drawTube(tw(e.plug), ST.plug, o);
    }
    // the chevrons: the fan nozzle's and the core nozzle's saw-toothed edges, where they face the eye
    [e.exit, e.coreExit].forEach(x => {
      if (!x.n) return;
      const C = E3.cam().C, segs = [], pts = [];
      for (let k = 0; k <= 2 * x.n; k++) { const a = k / (2 * x.n) * TAU, rr = x.r * (k % 2 ? 0.99 : 1.0); pts.push({ p: W([x.x + (k % 2 ? 0.2 * x.r / 1.38 : 0), x.y + rr * Math.cos(a), x.z + rr * Math.sin(a)]), n: dirW(pose, [0, Math.cos(a), Math.sin(a)]) }); }
      for (let k = 0; k + 1 < pts.length; k++) { const q = pts[k], q2 = pts[k + 1]; if (dot(q.n, sub(C, q.p)) > 0 || behind) { const sg = segS(q.p, q2.p, AUH.clipZ()); if (sg) segs.push(sg); } }
      strokeSegs(segs, INK, lwAt(ST.skin, o, E3.cam().f / Math.max(1, E3.depth(W([x.x, x.y, x.z])))) * 0.55, 0.5 * (o.air ?? 1));
    });
    if (over) drawTube(tw(p.pylon), ST.skin, o);
  }
  // a gear: the wheels beyond its leg, the leg, its brace, beam and door, then the wheels this side of it
  function drawGear(p, pose, o, eyeB) {
    const g = p.gear, W = pose.toW, tw = T => toWorld(T, W), yl = g.legs[0].cen[0][1];
    const wheels = g.wheels.map(T => ({ T, near: (T.cen[2][1] - yl) * (eyeB[1] - yl) > 0, d: E3.depth(W(T.cen[2])) })).sort((x, y) => y.d - x.d);
    wheels.filter(w => !w.near).forEach(w => drawTube(tw(w.T), ST.tyre, o));
    if (g.brace) drawTube(tw(g.brace), ST.strut, o);
    g.legs.forEach(T => drawTube(tw(T), ST.strut, o));
    if (g.beam) drawTube(tw(g.beam), ST.strut, o);
    if (g.door) flat(g.door.map(W), dirW(pose, [0, Math.sign(g.door[0][1]), 0]), ST.skin, o, o.air ?? 1);
    wheels.filter(w => w.near).forEach(w => drawTube(tw(w.T), ST.tyre, o));
  }
  // the details on the skin, where it faces the eye: the cabin windows, the doors' seams, the flight deck's glass, the
  // radome's joint, the dark beacons
  function drawDecals(dc, pose, o) {
    const C = E3.cam().C, W = pose.toW, h = AUH.clipZ(), a = o.air ?? 1, seen = (c, n, k = 0.1) => { const v = sub(C, c); return dot(n, v) / Math.hypot(...v) > k; };
    const pxm = E3.cam().f / Math.max(1, E3.depth(W([0, 0, 0])));
    const fillAll = (list, col, al) => { const polys = []; list.forEach(w => { const c = W(w.c); if (!seen(c, dirW(pose, w.n), w.front ? 0.02 : 0.12)) return; const pts = w.pts.map(W); if (h !== null && pts.some(q => q[2] < h)) return; polys.push(pts.map(E3.proj)); }); if (polys.length) { ctx.save(); ctx.globalAlpha = SA * al; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col; trace(ctx, polys); ctx.fill('nonzero'); ctx.restore(); } return polys; };
    fillAll(dc.win, OPT.colour ? '#2E3644' : INK, (OPT.colour ? 0.72 : 0.6) * a * clamp(pxm / 3));
    const gl = fillAll(dc.glass, OPT.colour ? '#27303C' : INK, (OPT.colour ? 0.8 : 0.66) * a);
    strokeSegs([].concat(...gl.map(pp => pp.map((p, k) => [p, pp[(k + 1) % pp.length]]))), INK, lwAt(ST.skin, o, pxm) * 0.7, 0.8 * a);
    const segs = [];
    dc.lines.forEach(l => { const c = W(l.c); if (!seen(c, dirW(pose, l.n))) return; const pts = l.pts.map(W); for (let k = 0; k < pts.length; k++) { const sg = segS(pts[k], pts[(k + 1) % pts.length], h); if (sg) segs.push(sg); } });
    for (let k = 0; k + 1 < dc.ring.length; k++) { const q = dc.ring[k], q2 = dc.ring[k + 1], c = W(q.p); if (seen(c, dirW(pose, q.n), 0.15)) { const sg = segS(c, W(q2.p), h); if (sg) segs.push(sg); } }
    strokeSegs(segs, INK, clamp(lwAt(ST.skin, o, pxm) * 0.55, 0.4, 1.1), 0.5 * a * clamp(pxm / 4));
    dc.dark.forEach(b => { const c = W(b.c); if (!seen(c, dirW(pose, b.n), 0.05) || (h !== null && c[2] < h)) return; const s = E3.proj(c), r = Math.max(0.6, b.r * pxm); ctx.save(); ctx.globalAlpha = SA * 0.7 * a; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = OPT.colour ? '#5A2E2A' : INK; ctx.beginPath(); ctx.ellipse(s[0], s[1], r, r * 0.6, 0, 0, TAU); ctx.fill(); ctx.restore(); });
  }

  // draw an aircraft: o { air (the far haze on its lines), warm, warmA, warmAll (the dawn's light), lw, lights (0-1, the
  // landing lights), beforeFus (what stands under the nose: drawn after the nose gear, before the fuselage) }
  function draw(m, pose, o = {}) {
    const C = E3.cam().C, eyeB = pose.toB(C), W = pose.toW, near = eyeB[1] > 0 ? 'L' : 'R', far = near === 'L' ? 'R' : 'L';
    const tanG = Math.tan(4.5 * D) + Math.max(0, m.flex) / 27;
    const above = side => { const yy = (side === 'L' ? 1 : -1) * eyeB[1]; return eyeB[2] > -1.3 + (yy - 2.9) * tanG; };
    const part = (side, layer) => m.parts.filter(p => p.side === side && p.layer === layer);
    const one = p => {
      if (p.eng) return drawEngine(p, pose, o, eyeB);
      if (p.gear) return drawGear(p, pose, o, eyeB);
      p.tubes.forEach(T => drawTube(toWorld(T, W), ST[p.st], o));
      if (p.lines && p.lines.length) {
        // the seams, where the surface they lie on faces the eye
        const segs = [], h = AUH.clipZ(), pxm = E3.cam().f / Math.max(1, E3.depth(W(p.tubes[0].cen[0])));
        p.lines.forEach((ln, k) => { const n = dirW(pose, p.lnOf ? p.lnOf[k] : p.ln); for (let i = 0; i + 1 < ln.length; i++) { const a = W(ln[i]), b = W(ln[i + 1]); if (dot(n, sub(C, a)) > 0) { const sg = segS(a, b, h); if (sg) segs.push(sg); } } });
        strokeSegs(segs, INK, clamp(lwAt(ST.wing, o, pxm) * 0.45, 0.35, 0.9), 0.55 * (o.air ?? 1) * clamp(pxm / 4));
      }
    };
    const wingSide = side => {
      const up = above(side), under = part(side, 'under').map(p => ({ p, d: E3.depth(W(p.c || p.tubes[0].cen[0])) })).sort((x, y) => y.d - x.d).map(x => x.p);
      const L = k => part(side, k);
      return up ? [...under, ...L('flap'), ...L('wing'), ...L('spoil'), ...L('slat')] : [...L('spoil'), ...L('wing'), ...L('slat'), ...L('flap'), ...under];
    };
    // the stabilisers: behind the wing seen from ahead of it, in front of it seen from behind
    const aft = eyeB[0] < X(46);
    const seq = [];
    if (!aft) seq.push(...part(far, 'stab'));
    seq.push(...wingSide(far));
    if (aft) seq.push(...part(far, 'stab'));
    seq.push(...part('C', 'nose'));
    seq.forEach(one);
    if (o.beforeFus) o.beforeFus();
    part('C', 'fus').forEach(one);
    part('C', 'belly').forEach(one);
    drawDecals(m.decals, pose, o);
    part('C', 'fin').forEach(one);
    const tail = [];
    if (!aft) tail.push(...part(near, 'stab'));
    tail.push(...wingSide(near));
    if (aft) tail.push(...part(near, 'stab'));
    tail.forEach(one);
    // the landing lights, steady (never flashing), as bright as they face the eye
    if (o.lights > 0) LIGHTS.forEach(l => {
      if (l.sg && (l.sg > 0 ? 'L' : 'R') !== near) return;
      const p = W(l.p), d = dirW(pose, l.dir), v = sub(C, p), k = Math.pow(Math.max(0, dot(d, v) / Math.hypot(...v)), 1.4) * o.lights;
      if (k < 0.01) return;
      const s = E3.proj(p), pxm = E3.cam().f / Math.max(1, E3.depth(p)), r = clamp(0.3 * pxm, 1.1, 7);
      if (OPT.colour) disc(s[0], s[1], r * 3.2, '#F3C27A', 0.32 * k, 'multiply');
      disc(s[0], s[1], r * 1.25, INK, 0.45 * k * (o.air ?? 1));
      mask(el(s[0], s[1], r, r * 0.8, 0, TAU, 17, 0), k);
      if (OPT.colour) disc(s[0], s[1], r * 0.8, '#FFF6DE', 0.85 * k, 'source-over');
    });
  }
  // the aircraft's shadow on the plane z = h, cast along the sun: each segment of its fuselage, wing, tail, nacelle and
  // gear cast whole (each is convex), as screen polygons for a union fill
  function shadow(m, pose, sun, out, h = 0) {
    const W = pose.toW, cast = pts => {
      const g = [];
      pts.forEach(p => { if (p[2] < h - 0.01) return; const k = (p[2] - h) / sun[2]; g.push([p[0] - sun[0] * k, p[1] - sun[1] * k]); });
      if (g.length < 3) return;
      g.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o2, a, b) => (a[0] - o2[0]) * (b[1] - o2[1]) - (a[1] - o2[1]) * (b[0] - o2[0]), lo = [], hi = [];
      g.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
      for (let i = g.length - 1; i >= 0; i--) { const p = g[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
      const poly = lo.slice(0, -1).concat(hi.slice(0, -1)).map(q => [q[0], q[1], h + 0.03]), cut = [];
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], da = E3.depth(a), db = E3.depth(b); if (da >= 3) cut.push(a); if ((da >= 3) !== (db >= 3)) cut.push(lerp3(a, b, (3 - da) / (db - da))); }
      if (cut.length > 2) out.push(new P(cut.map(E3.proj), true));
    };
    const tubeCast = T => { for (let i = 0; i + 1 < T.rings.length; i++) cast(T.rings[i].concat(T.rings[i + 1]).map(W)); };
    m.parts.forEach(p => {
      if (p.eng) { tubeCast(p.eng.nac); tubeCast(p.eng.slv); tubeCast(p.pylon); return; }
      if (p.gear) { p.gear.wheels.forEach(tubeCast); p.gear.legs.forEach(tubeCast); return; }
      if (p.layer === 'belly') return;
      p.tubes.forEach(tubeCast);
    });
    return out;
  }

  const MODELS = new Map();
  // a model for a configuration (cached when the configuration is static)
  function model(cfg) {
    const key = cfg.key;
    if (key && MODELS.has(key)) return MODELS.get(key);
    const m = build(cfg); m.decals = decals(cfg.lod || 0);
    if (key) MODELS.set(key, m);
    return m;
  }
  return { model, build, draw, shadow, X, SMG, SNG, Z0, DOORS, ENG, skin, angAt, wingAt, zRef, LIGHTS, fz };
})();

/* ==========================================================================================================
   1 · Dawn (beat 'airport-dawn', 8.33 s on a 0.6 clock: lt 0.8-5.8, seen lt 0.5-5.95): from 28 m over the apron in the
   courtyard between the south and east piers (150 m east of the south pier's axis), looking north-west across the fog
   to Terminal A on a long lens (2150 px), with the sun just risen behind the eye's right shoulder. Shallow radiation fog
   lies ~3 m deep round a 787-9 parked nose-in at the south pier's gate 155 m away (its jet bridge at the forward door; its
   flaps stowed, as at any gate): its wheels and the lower halves of its engines are in the fog, its fuselage, wings, fin
   and the tops of its nacelles stand out of it, whole in the frame from the first frame. An A380 and the tails at the
   east pier beyond it, the pier roofs and the processor's great roof stand out of it too, all lit warm, and the long
   shadows of the apron masts behind the eye lie across the fog's top as cool bands. The sky ahead is the western dawn
   sky: blue above, the pink band low over the horizon. Over the beat the eye drifts left and rises 2 m. (The eye is 28 m
   up, not lower, because the hero's near wing points almost at the eye from this side of the stand: from 18 m it
   foreshortened to a sliver and the airliner read wingless.) (The crescent tower stands 1.9 km south-east of the
   processor, toward the sun, so from any vantage where the terminal is lit it is behind the eye; it is in the arrival.)
   The fog lifting (1 Oct 2026, the requester's "fog lifting at the airport"), a time-lapse of the morning: the clock runs
   steadily from 3 to 33 minutes after sunrise over the seen beat (minutes(lt), about 6 minutes a scene second) and the
   sun climbs from 0.6° to 6.6° and swings from 116° to 119.5° (AUH.sunMin), so the masts' shadows draw in from the
   horizon toward the eye. The fog burns off as radiation fog does (fogAt: from minute 6 to 32): its top settles from 3.3
   to 1.8 m, it thins (its own visibility 22 to 35 m), and it goes first where it is thinnest, so holes open in the sheet
   and widen and its lenses (15-40 m across) shrink from their rims, until about a third of the apron lies under them
   (AUH.fogDepth); it slides with the light air at 3 m/s, the eye looking down through it. Under it the apron comes out: its
   concrete slabs, the stands' yellow lead-in lines, the service road beyond the hero's wingtip, the shadows on the
   ground, which part from the shadows on the fog's top by the fog's depth along the sun. The light comes up with it: a
   cool veil over the first seconds lifts, the pink band sinks and fades into a warm horizon, the sky pales, and the warm
   light on everything that stands up strengthens. (The faces keep the plate's engraved light, the sun 3° up, so their
   hatching never re-cuts as the sun climbs and nothing crawls; the washes, the shadows and the fog carry the time-lapse.)
   Life on the apron, in true scale and real operation: a towbarless tug (Kalmar TBL 800 class: 9.7-10.1 m long, 4.5 m
   wide, 2.0-2.37 m high; Kalmar Motor) docked at the hero's nose gear while its bridge is still on, as such tugs dock,
   ready to push back; a baggage tractor with three dollies of LD3 containers (IATA: 1.56 m wide at the base, 2.01 m at
   the top, 1.63 m high) driving slowly (3 m/s, on the right) along the service road toward the pier. They stand in the
   fog at first and come out of it as it burns off. (They move at their real speed; only the sky runs in time-lapse.)
   ========================================================================================================== */
scene({
  id: 'airportdawn',
  start: 0, dur: 5,
  init() {
    this.term = AUH.terminal(1);
    this.tower = AUH.tower();
    const A = AUH.TA, D = AUH.D;
    // the south pier's east-side apron in pier coordinates: s out along the pier from the hub, w off its axis toward
    // the courtyard (its glazing at w 31)
    const g0 = -135 * D, pd = [Math.cos(g0), Math.sin(g0)], pn = [Math.sin(g0), -Math.cos(g0)];
    this.PW = (s, w, z = 0) => AUH.W3(A[0] + pd[0] * s + pn[0] * w, A[1] + pd[1] * s + pn[1] * w, z);
    // stands on a pier's face: pier angle g (terminal frame), face side, station s; noses to the pier, 7 m off its
    // glazing; 787-9s throughout (the hero drawn in full, the rest in less detail as they stand further off)
    const planes = [];
    const stand = (gd, side, s, lod, seed, bridges = 1) => {
      const g = gd * D, d = [Math.cos(g), Math.sin(g)], n = [-Math.sin(g) * side, Math.cos(g) * side];
      const off = 31 + 7 + B789.SMG, a = d[0] * s + n[0] * off, b = d[1] * s + n[1] * off;
      const pose = AUH.poser({ u: A[0] + a, v: A[1] + b, z: B789.Z0, psi: Math.atan2(-n[1], -n[0]) / D });
      const m = B789.model({ key: 'gate' + lod, lod, flex: -0.6 });
      planes.push({ pose, m, seed, s, d, n, lod, south: gd === -135, bridges: gd === -135 ? this.bridgesFor(s, bridges) : [] });
    };
    // the south pier's east face: the hero at s 200 with its two bridges, a sister ship beyond it toward the hub; the stand
    // toward the tip stands empty (the eye is there); across the courtyard, the east pier's south face
    stand(-135, -1, 200, 0, 11000, 2);
    stand(-135, -1, 118, 1, 11200, 2);
    stand(135, -1, 215, 2, 12000, 1);
    stand(135, -1, 300, 2, 12500, 1);
    stand(135, -1, 385, 2, 13000, 1);
    this.planes = planes;
    this.hero = planes[0];
    // apron floodlight masts (30 m) behind the eye, toward the sun; their shadows, hundreds of metres long at this sun,
    // run out across the fog toward the point opposite the sun
    this.masts = [];
    this.behind = [[338, 96], [372, 150]].map(([s, w]) => this.PW(s, w, 0));
    this.tug = this.tugParts(this.hero.pose);
    this.apron();
    // the fog's strokes, laid out from the eye in the middle of its move, a little wider than the frame
    this.view(3.3);
    this.fogSk = AUH.fogStrokes(2600, 4401, { t0: 20, t1: 3000, half: 0.62, len: 70, jit: 0.12 });
  },
  // the jet bridges at the hero's left doors (L1 and L2; Boeing's door table: 6.30 and 18.36 m aft of the nose, the sill
  // at the cabin floor, 4.3 m over the apron): an apron-drive bridge to each, its cab closed round the door, its tunnel
  // (two telescoping sections) running back to a rotunda that stands off the pier on its column, its drive column on
  // two wheels under the outer section, and a fixed link from the rotunda into the pier's glazing; in pier coordinates
  bridgesFor(s0, count) {
    const PW = this.PW, out = [], sill = B789.Z0 - 0.45;
    [[6.30, 12, 36], [18.36, 22, 40]].slice(0, count).forEach(([xd, dsR, wR]) => {
      const sR = s0 + dsR;
      const wd = 38 + xd, hw = B789.fz(xd).hw + 0.05, c0 = s0 + hw, c1 = c0 + 3.2;
      const B = (sa, sb, wa, wb, za, zb) => E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([x, y, z]) => PW(sa + (sb - sa) * x, wa + (wb - wa) * y, za + (zb - za) * z)));
      const cab = B(c0, c1, wd - 1.6, wd + 1.6, sill - 0.2, sill + 2.6);
      const p0 = PW(c1, wd, sill - 0.15), R = PW(sR, wR, sill), mid = AUH.lerp3(p0, R, 0.5);
      const tun = [AUH.walkway(p0, mid, 1.25, 2.5), AUH.walkway(AUH.lerp3(p0, R, 0.47), R, 1.4, 2.7)];
      const leg = AUH.lerp3(p0, R, 0.2), rot = R11.cylinder(R, 1.9, sill - 0.3, sill + 2.9, 10), col = R11.cylinder(R, 0.55, 0, sill - 0.3, 8);
      const link = B(sR - 1.35, sR + 1.35, 29.5, wR - 1.7, sill - 0.1, sill + 2.6);
      out.push({ cab, tun, rot, col, link, leg, R, p0, sill });
    });
    return out;
  },
  // the towbarless tug at the hero's nose gear, in the hero's body frame (x forward, y left) at ground heights: the nose
  // wheels held in the cradle between its two rear arms, its body forward under the nose (to 3.7 m short of the
  // glazing), its low cab at the front on the right, a wheel at each corner (laid out about a nose gear at x 24.2, then
  // carried onto the 787-9's)
  tugParts(pose) {
    const z0 = B789.Z0, dx = B789.X(B789.SNG) - 0.12 - 24.2, T = q => pose.toW([q[0] + dx, q[1], q[2] - z0]);
    const B = (x0, x1, y0, y1, za, zb) => E3.box(x0, x1, y0, y1, za, zb).map(f => f.map(T));
    const wheels = [];
    [26.7, 31.7].forEach(x => [-1, 1].forEach(s => wheels.push({ y: s * 1.98, f: AUH.wheel(x, s * 1.98, 0.56, 0.56, 0.52, 12).map(f => f.map(T)) })));
    return {
      body: [B(22.9, 25.7, 0.8, 2.25, 0.28, 1.0), B(22.9, 25.7, -2.25, -0.8, 0.28, 1.0), B(25.7, 32.8, -2.25, 2.25, 0.28, 1.22)],
      cab: B(30.3, 32.6, -2.15, -0.5, 1.22, 2.36), wheels, centre: T([28, 0, 1]), pose,
    };
  },
  // the baggage train, in its own frame (x forward from the tractor's nose, y left, z up from the ground): a tow tractor
  // (3.0 x 1.56 m, its cab roof 2.05 m), then three container dollies on drawbars, each with an LD3 whose contoured side
  // overhangs to the left; at front point w along the near lane of the service road, heading for the pier
  train(w) {
    const p0 = this.PW(239.3, w, 0), pose = AUH.poser({ u: p0[1], v: p0[0], z: 0, psi: -45 }), T = pose.toW;
    const B = (x0, x1, y0, y1, za, zb) => E3.box(x0, x1, y0, y1, za, zb).map(f => f.map(T));
    const W = (x, y, r, wd) => AUH.wheel(x, y, r, r, wd, 10).map(f => f.map(T));
    const units = [{ kind: 'tractor', parts: [B(-1.25, 0, -0.74, 0.74, 0.3, 1.1), B(-3.0, -1.25, -0.78, 0.78, 0.3, 2.05)], wheels: [-0.55, -2.45].flatMap(x => [-1, 1].map(s => ({ y: s * 0.66, f: W(x, s * 0.66, 0.32, 0.24) }))), c: T([-1.5, 0, 1]), bar: null }];
    for (let i = 0; i < 3; i++) {
      const x0 = -4.3 - 3.35 * i;
      const ld3 = AUH.prism([[-0.78, 0.5], [0.75, 0.5], [1.23, 1.1], [1.23, 2.13], [-0.78, 2.13]], x0 - 1.8, x0 - 0.27, T);
      units.push({ kind: 'dolly', parts: [B(x0 - 1.95, x0 - 0.1, -0.92, 0.92, 0.35, 0.5)], box: ld3, wheels: [x0 - 0.45, x0 - 1.6].flatMap(x => [-1, 1].map(s => ({ y: s * 0.8, f: W(x, s * 0.8, 0.2, 0.16) }))), c: T([x0 - 1, 0, 1]), bar: [T([x0 - 0.1, 0, 0.42]), T([x0 + 1.3, 0, 0.42])] });
    }
    return { units, pose };
  },
  // the apron: concrete slabs (5 m joints) east of the south pier, each stand's yellow lead-in line to its nose-gear stop
  // bar, and the service road just outside the hero's wingtip clearance (7.5 m beyond its left wingtip: s 237.5-244.5),
  // asphalt, with white edge lines and a dashed centre line, from the pier out toward the courtyard
  apron() {
    const PW = this.PW, j = [];
    for (let s = 60; s <= 330; s += 5) for (let w = 31; w < 160; w += 8) j.push([PW(s, w), PW(s, Math.min(160, w + 8))]);
    for (let w = 31; w <= 160; w += 5) for (let s = 60; s < 330; s += 8) j.push([PW(s, w), PW(Math.min(330, s + 8), w)]);
    this.joints = j;
    this.road = [PW(237.5, 31, 0.01), PW(237.5, 175, 0.01), PW(244.5, 175, 0.01), PW(244.5, 31, 0.01)];
    const strip = (s0, s1, w0, w1) => [PW(s0, w0, 0.02), PW(s0, w1, 0.02), PW(s1, w1, 0.02), PW(s1, w0, 0.02)];
    this.roadPaint = [strip(237.75, 237.95, 31, 175), strip(244.05, 244.25, 31, 175)];
    for (let w = 33; w < 172; w += 6) this.roadPaint.push(strip(240.92, 241.08, w, w + 3));
    // the lead-in lines run in to the nose-gear stop (44 m off the pier's axis), the empty stand's too
    this.leadIn = [118, 200, 282].map(s => { const ws = 38 + B789.SNG; return { line: [PW(s, 170), PW(s, ws)], bar: [PW(s - 1.5, ws), PW(s + 1.5, ws)] }; });
  },
  // the eye: VIEW (pier coordinates s, w, z of the eye at the beat's start and end, the point it looks at, the lens)
  VIEW: { c0: [281, 60, 34], c1: [275, 57, 36], t0: [195, 73, 3], t1: [194, 72, 3.5], f: 1010, cx: 560, cy: 590 },
  view(lt) {
    const u = easeInOut(clamp((lt - 0.7) / 5.2)), V = window.DAWNTEST ? Object.assign({}, this.VIEW, window.DAWNTEST) : this.VIEW;
    const c = V.c0.map((x, k) => lerp(x, V.c1[k], u)), t = V.t0.map((x, k) => lerp(x, V.t1[k], u));
    return E3.camera(this.PW(c[0], c[1], c[2]), this.PW(t[0], t[1], t[2]), V.f, V.cx, V.cy);
  },
  // the morning's clock: minutes after sunrise, 3 to 33 over the seen beat (lt 0.5-5.95), steadily
  minutes(lt) { return 3 + 30 * clamp((lt - 0.5) / 5.45); },
  // at minute m: how far the fog has burnt off (e, steadily from minute 6 to 32), the level its lenses are cut at (whole
  // at 0.2, a third left at 0.54), its top, its own visibility; and how far the light has come up (q)
  fogAt(m) {
    const e = clamp((m - 6) / 26);
    return { e, theta: 0.2 + 0.34 * Math.pow(e, 0.8), h: lerp(3.3, 1.8, e), V: lerp(22, 35, e), q: AUH.smooth(clamp((m - 3) / 28)) };
  },
  frame(lt) {
    this.view(lt);
    // the true sun of this minute (for the shadows); the faces keep the plate's engraved light (116°, 3° up)
    const [az, alt] = AUH.sunMin(this.minutes(lt));
    this.sunT = AUH.sunVec(az, alt);
    AUH.sunAt(116, 3);
    const F = E3.cam().F, hz = E3.projDir([F[0], F[1], 0]);
    this.hy = hz ? hz[1] : 470;
  },
  under(lt) {
    this.frame(lt);
    const B = R11.BOX, hy = this.hy, q = easeInOut(prog(lt, 0.8, 0.9)), L = this.fogAt(this.minutes(lt)).q;
    // the western sky at sunrise: blue above, paling, the pink band low over the horizon; as the sun climbs the band sinks
    // and fades into a warm haze along the horizon and the sky pales
    washFade([B[0], B[1] - 200, B[2], hy + 2], AUH.mixStops(
      [[0, HUE.deep, 0.36], [0.35, HUE.sky, 0.5], [0.66, HUE.cloud, 0.28], [0.8, HUE.rose, 0.32], [0.9, HUE.rose, 0.28], [0.955, HUE.cloud, 0.34], [1, HUE.steel, 0.34]],
      [[0, HUE.deep, 0.26], [0.35, HUE.sky, 0.42], [0.66, HUE.sky, 0.22], [0.8, HUE.cloud, 0.12], [0.9, HUE.sail, 0.16], [0.955, HUE.dawn, 0.16], [1, HUE.sand, 0.2]], L), 0, q);
    // the ground: the fog's top, cool in the half-light, and the apron's concrete as the sun warms it
    washFade([B[0], hy - 2, B[2], B[3]], AUH.mixStops(
      [[0, HUE.cloud, 0.26], [0.2, HUE.steel, 0.16], [0.6, HUE.cloud, 0.16], [1, HUE.steel, 0.2]],
      [[0, HUE.sail, 0.2], [0.2, HUE.dawn, 0.12], [0.6, HUE.sand, 0.14], [1, HUE.sand, 0.2]], L), 0, q);
    E3.sunAt();
  },
  draw(lt) {
    AUH.sunAt(116, 3);
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX, hy = this.hy, ink = easeOut(prog(lt, 0.55, 0.8)), m = this.minutes(lt), Fg = this.fogAt(m), L = Fg.q, sunT = this.sunT;
      // the sky's engraved rules: close overhead, open on the pink band, closing again just over the horizon; they open
      // as the sky brightens and the band sinks
      AUH.skyRules(hy, (x, y) => {
        const h = (hy - y) / (hy - B[1]), bh = lerp(0.2, 0.08, L), band = Math.exp(-(((h - bh) / 0.1) ** 2)) * (1 - 0.6 * L), shadow = Math.exp(-(((h - 0.035) / 0.035) ** 2)) * (1 - 0.8 * L);
        return ink * lerp(1, 0.78, L) * clamp(0.28 + 0.72 * h - 0.55 * band + 0.3 * shadow) * (OPT.colour ? 0.5 : 1);
      }, { amax: 0.5, step: 5, step0: 2.9, lw: 0.8 });
      stroke(new P([[B[0], hy], [B[2], hy]]), ink, INK, 0.7, 0.3);
      // the apron, under the fog: its slab joints, the service road and its paint, the lead-in lines, the shadows on it
      this.ground(lt, ink, Fg, sunT);
      const list = [];
      const dT = R11.dep(AUH.W3(AUH.TWR[0], AUH.TWR[1], 40));
      if (dT > 5) list.push({ d: dT, draw: () => AUH.drawTower(this.tower, R11.air(dT, 3400) * ink, OPT.colour ? HUE.dawn : null, 0.2, 0.3) });
      AUH.terminalItems(list, this.term, ink, { warm: OPT.colour ? HUE.dawn : null, warmAll: lerp(0.1, 0.2, L), k: 3000 });
      // the aircraft: the warm light on them strengthens and their shade lightens as the sun climbs
      const look = { warm: OPT.colour ? HUE.dawn : null, warmA: lerp(0.24, 0.42, L), warmAll: lerp(0.04, 0.1, L), coolK: lerp(1.15, 0.85, L), inkFill: lerp(0.14, 0.1, L), lw: 1.1 };
      // the hero's tug stands under its nose: drawn after the nose gear and before the fuselage that hangs over it
      const lookOf = (p, d) => Object.assign({ air: R11.air(d, 3000) * ink }, look, p === this.hero ? { beforeFus: () => this.drawTug(ink, L) } : {});
      this.planes.forEach(p => {
        const c = p.pose.toW([0, 0, 0]), d = R11.dep(c);
        if (d < 5) return;
        list.push({ d, draw: () => B789.draw(p.m, p.pose, lookOf(p, d)) });
        p.bridges.forEach((bg, i) => list.push({ d: R11.dep(AUH.lerp3(bg.p0, bg.R, 0.5)) - 2, draw: () => this.drawBridge(bg, ink, p.seed + 700 + i * 20, L) }));
      });
      this.masts.forEach((m, i) => list.push({ d: R11.dep(m), draw: () => this.drawMast(m, ink, i) }));
      this.behind.forEach((m, i) => { if (R11.dep(m) > 3) list.push({ d: R11.dep(m), draw: () => this.drawMast(m, ink, 10 + i) }); });
      // the ground crew: the tug docked at the hero's nose gear (drawn with the hero); the baggage train on the road,
      // 3 m/s toward the pier
      const tr = this.train(this.trainAt(lt));
      tr.units.forEach((un, i) => list.push({ d: R11.dep(un.c), draw: () => this.drawUnit(un, tr.pose, ink, L, i) }));
      // the fog at this minute: its top settling, thinning, burning off from its rims; it slides with the dawn air (3 m/s
      // toward the north-west, across the eye's view)
      const hF = Fg.h, drift = 3 * (lt - 0.8), dv = AUH.dirAz(300), C2 = E3.cam().C[2];
      const slide = [dv[1] * drift, dv[0] * drift, 0];
      // the long shadows the low sun lays on the fog's top (from 92 times the height they stand above it at first to 9
      // times by the end), away from the eye
      const casters = this.term.casters.concat(this.tower.casters, this.planes.map(p => p.m.parts.find(q => q.name === 'fin').tubes[0].rings.flat().map(p.pose.toW)),
        this.planes.map(p => p.m.parts.find(q => q.name === 'fus').tubes[0].rings.flat().filter((q, i) => i % 3 === 0).map(p.pose.toW)),
        // a mast's shadow: its pole a line that widens to its lamp head's patch at the far end
        this.masts.concat(this.behind).map(m => [[m[0] - 0.7, m[1] - 0.7, 29.4], [m[0] + 0.7, m[1] + 0.7, 29.4], [m[0] - 0.7, m[1] - 0.7, 6], [m[0] + 0.7, m[1] + 0.7, 6]]),
        this.masts.concat(this.behind).map(m => [[m[0] - 2.2, m[1] - 0.5, 29.4], [m[0] + 2.2, m[1] + 0.5, 29.4], [m[0] - 2.2, m[1] - 0.5, 31.4], [m[0] + 2.2, m[1] + 0.5, 31.4], [m[0] + 2.2, m[1] - 0.5, 31.4], [m[0] - 2.2, m[1] + 0.5, 29.4]]).map(c => Object.assign(c, { noFeet: true })));
      const shadow = { polys: casters.map(c => AUH.shadowHull(c, hF, sunT)).filter(Boolean), col: OPT.colour ? '#7C89A8' : INK, a: 0.55 * (1 - 0.25 * Fg.e) * lerp(0.75, 1, L) };
      // the fog's depth over the ground point under each cell, as a share of the whole layer's density
      const dens = (l, t) => {
        const gp = AUH.rowGround(l, t), f = AUH.fogDepth(gp[1] - slide[1], gp[0] - slide[0], Fg.theta, 0.1, 0.4);
        return AUH.fogShare(f, hF * t / Math.max(1, C2 - hF), Fg.V);
      };
      const cool = [[0, HUE.steel, 0.2], [0.5, HUE.cloud, 0.14], [1, HUE.cloud, 0.16]], warm = [[0, HUE.cloud, 0.12], [0.5, HUE.rose, 0.1], [1, HUE.dawn, 0.16]];
      AUH.fogLayer(list, {
        h: hF, V: Fg.V, amt: 0.97 * ink, strokes: this.fogSk, slide, veils: [[0, 1.6, 50, 0.5 * (1 - 0.6 * Fg.e)]], shadow, dens,
        tint: OPT.colour ? t => { const k = clamp(1 - t / 900); return AUH.mixStops(cool, warm, L).map(([o, c, a]) => [o, c, a + 0.06 * k]); } : null,
        // the fog's top: rules closing and weighting toward the eye, broken by long flat swells that drift
        // (the swells: long, low, flat undulations of the fog's top, 26 m apart, lying across the drift; hatched in their
        // troughs, open on their crests)
        rule: (x, y, l, t) => {
          const near = clamp((y - hy) / (B[3] - hy)), swell = 0.5 + 0.5 * Math.sin(TAU * (t + 0.35 * l + drift) / 11 + 2.6 * AUH.noise((l + drift) / 60, t / 40, 0.7));
          const sw = clamp((130 - t) / 80);
          return clamp((y - hy) / 8) * (0.34 + 0.66 * Math.pow(near, 0.6)) * (1 - sw * 0.8 * (1 - AUH.smooth(clamp((swell - 0.3) * 2.6))));
        },
        rulePitch: y => lerp(2.3, 3.3, clamp((y - hy) / (B[3] - hy))), ruleW: y => lerp(0.55, 1.45, clamp((y - hy) / (B[3] - hy))),
        ruleA: OPT.colour ? 0.58 : 1,
        grain: (x, y, l, t, k) => clamp((y - hy) / 20) * (0.18 + 0.4 * k),
        lineCol: OPT.colour ? '#7E7890' : SEPIA, lw: 0.8,
      });
      R11.paint(list);
      // the near aircraft, their jet bridges and the mast once more, far to near, cut at the fog's top: nothing that stands
      // above the fog can be hidden by it (one painter's depth per aircraft would let the fog's nearer bands cross a wing)
      const again = [];
      this.planes.forEach(p => { const d = R11.dep(p.pose.toW([0, 0, 0])); if (d > 5 && d < 420) {
        again.push({ d, draw: () => B789.draw(p.m, p.pose, lookOf(p, d)) });
        p.bridges.forEach((bg, i) => again.push({ d: R11.dep(AUH.lerp3(bg.p0, bg.R, 0.5)) - 2, draw: () => this.drawBridge(bg, ink, p.seed + 700 + i * 20, L) }));
      } });
      this.masts.forEach((m, i) => again.push({ d: R11.dep(m), draw: () => this.drawMast(m, ink, i) }));
      AUH.setClipZ(hF);
      try { R11.paint(again); } finally { AUH.setClipZ(null); }
      // the half-light: a cool veil over the first seconds that lifts as the sun climbs (over 3 scene seconds, so the
      // picture brightens gradually, never in a step)
      if (OPT.colour) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = SA * 0.16 * (1 - AUH.smooth(clamp((m - 3) / 18))); ctx.fillStyle = '#8E9CB4'; ctx.fillRect(B[0], B[1], B[2] - B[0], B[3] - B[1]); ctx.restore(); }
    });
    E3.sunAt();
  },
  // the baggage train's front, w off the pier's axis: 3 m/s toward the pier on the scene clock (real speed)
  trainAt(lt) { return 72 - 3 * (lt - 0.5); },
  // the apron under the fog (drawn first: everything stands on it and the fog lies over it)
  ground(lt, ink, Fg, sunT) {
    const PW = this.PW, a0 = ink * lerp(0.7, 1, Fg.q);
    // the slab joints, fading into the distance
    E3.segments(this.joints.map(([a, b]) => [a, b, 0.32 * a0 * Math.exp(-R11.dep(AUH.lerp3(a, b, 0.5)) / 260)]), OPT.colour ? '#6E6A62' : SEPIA, 0.6);
    // the service road: asphalt, its white edge lines and dashed centre line
    E3.face(this.road, { n: [0, 0, 1], tone: 0.45, shade: 0, hdir: E3.sub(PW(0, 1), PW(0, 0)), fillCol: OPT.colour ? '#5C6066' : null, fillA: 0.34, lw: 0.8, edgeA: 0.35 * ink }, 4601);
    this.roadPaint.forEach(q => { if (q.every(p => R11.dep(p) > 3)) mask(new P(q.map(E3.proj), true), 0.9 * ink); });
    // the stands' lead-in lines and stop bars, in yellow
    this.leadIn.forEach(li => { E3.line(li.line, OPT.colour ? '#C89A2E' : OCHRE, 1.1, 0.75 * a0); E3.line(li.bar, OPT.colour ? '#C89A2E' : OCHRE, 1.6, 0.8 * a0); });
    // the shadows on the ground, cast along the true sun: the aircraft at the south pier, the masts behind the eye, the tug
    // and the train; firmer as the sun climbs out of the horizon's haze
    const polys = [];
    this.planes.filter(p => p.south).forEach(p => B789.shadow(p.m, p.pose, sunT, polys));
    this.masts.concat(this.behind).forEach(m => AUH.castFaces(E3.frustum(m[0] - 0.5, m[0] + 0.5, m[1] - 0.5, m[1] + 0.5, 0, 30, -0.2, -0.2).concat(E3.box(m[0] - 2.2, m[0] + 2.2, m[1] - 0.5, m[1] + 0.5, 29.4, 31.4)), sunT, polys));
    AUH.castFaces([].concat(...this.tug.body, this.tug.cab), sunT, polys);
    this.train(this.trainAt(lt)).units.forEach(un => AUH.castFaces([].concat(...un.parts, un.box || []), sunT, polys));
    // (a light wash under engraved rules, crisp-edged, as the shadows on the fog's top are drawn: tone, never a smudge)
    const sa = ink * lerp(0.55, 1, Fg.q);
    if (OPT.colour) AUH.unionFill(polys, '#6E7C9A', 0.16 * sa);
    AUH.unionFill(polys, OPT.colour ? '#4E5A6A' : INK, (OPT.colour ? 0.42 : 0.5) * sa, 2.6);
  },
  // the tug: the wheels on its far side, its body and arms, its cab, the wheels on the near side
  drawTug(ink, L) {
    const tg = this.tug, d = R11.dep(tg.centre), a = R11.air(d, 3000) * ink, cb = tg.pose.toB(E3.cam().C);
    const st = { tone: 0.12, shade: 0.5, lw: 1.0, edgeA: 0.85 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#D8B04E' : null, fillA: 0.42, inkFill: 0.2, warmA: lerp(0.15, 0.3, L) };
    const wst = { tone: 0.6, shade: 0.3, lw: 0.8, edgeA: 0.8 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#3E3832' : null, fillA: 0.45, inkFill: 0.3 };
    const near = w => Math.sign(w.y) === Math.sign(cb[1]);
    tg.wheels.filter(w => !near(w)).forEach((w, i) => AUH.solid(w.f, wst, 4700 + i, null, null, true));
    tg.body.forEach((b, i) => AUH.solid(b, st, 4710 + i * 9, OPT.colour ? HUE.dawn : null, null, true));
    AUH.solid(tg.cab, Object.assign({}, st, { tone: 0.3, fillCol: OPT.colour ? '#9AA6AE' : null }), 4740, OPT.colour ? HUE.dawn : null, null, true);
    tg.wheels.filter(near).forEach((w, i) => AUH.solid(w.f, wst, 4750 + i, null, null, true));
  },
  // one unit of the baggage train: its drawbar, the far wheels, its body (or deck and container), the near wheels
  drawUnit(un, pose, ink, L, i) {
    const d = R11.dep(un.c), a = R11.air(d, 3000) * ink, cb = pose.toB(E3.cam().C), seed = 4800 + i * 40;
    const wst = { tone: 0.6, shade: 0.3, lw: 0.7, edgeA: 0.8 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#3E3832' : null, fillA: 0.45, inkFill: 0.3 };
    if (un.bar) E3.line(un.bar, INK, clamp(0.1 * 2150 / d, 0.6, 1.6), 0.8 * a);
    const near = w => Math.sign(w.y) === Math.sign(cb[1]);
    un.wheels.filter(w => !near(w)).forEach((w, k) => AUH.solid(w.f, wst, seed + k, null, null, true));
    const body = un.kind === 'tractor'
      ? { tone: 0.12, shade: 0.5, lw: 0.9, edgeA: 0.85 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#D8B04E' : null, fillA: 0.42, inkFill: 0.2, warmA: lerp(0.15, 0.3, L) }
      : { tone: 0.3, shade: 0.4, lw: 0.8, edgeA: 0.8 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#4A4038' : null, fillA: 0.4, inkFill: 0.3 };
    un.parts.forEach((p, k) => AUH.solid(p, body, seed + 10 + k * 7, OPT.colour ? HUE.dawn : null, null, true));
    // the LD3: aluminium, its seams vertical
    if (un.box) AUH.solid(un.box, { tone: 0.05, shade: 0.45, lw: 0.9, edgeA: 0.85 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#C4C8CA' : null, fillA: 0.36, inkFill: 0.16, warmA: lerp(0.15, 0.32, L) }, seed + 30, OPT.colour ? HUE.dawn : null, null, true);
    un.wheels.filter(near).forEach((w, k) => AUH.solid(w.f, wst, seed + 20 + k, null, null, true));
  },
  // a jet bridge: its rotunda on its column and the fixed link into the pier, the tunnel's two sections, the drive column's
  // legs and wheels, the cab at the door
  drawBridge(bg, ink, seed, L) {
    const d = R11.dep(bg.R), a = R11.air(d, 3000) * ink, st = { tone: 0.1, shade: 0.5, lw: 1.0, edgeA: 0.85 * a, hdir: [0, 0, 1], fillCol: OPT.colour ? '#DCD5C8' : null, fillA: 0.42, inkFill: 0.2, warmA: lerp(0.18, 0.32, L) };
    const warm = OPT.colour ? HUE.dawn : null;
    AUH.solid(bg.col, Object.assign({}, st, { tone: 0.3 }), seed + 1, null, null, true);
    AUH.solid(bg.link, Object.assign({}, st, { tone: 0.16 }), seed + 2, warm, null, true);
    AUH.solid(bg.rot, st, seed, warm, null, true);
    const legs = () => { if (AUH.clipZ() !== null) return; const p = bg.leg; [-1.1, 1.1].forEach(o => { const q = [p[0] + o * 0.6, p[1] - o * 0.8, p[2]]; R11.member([q[0], q[1], 0.6], q, 1.5, 0.85 * a); }); AUH.solid(E3.box(p[0] - 1.6, p[0] + 1.6, p[1] - 1.2, p[1] + 1.2, 0.25, 0.75), Object.assign({}, st, { tone: 0.35 }), seed + 3, null, null, true); };
    // the outer section's drive column stands nearer the eye than the tunnel's middle when the eye is on the cab's side
    const near = R11.dep(bg.leg) < R11.dep(AUH.lerp3(bg.p0, bg.R, 0.5));
    if (!near) legs();
    // each tunnel section with the band of glazing along its sides
    const glaze = (faces, k0 = 0.42, k1 = 0.8) => {
      const C = E3.cam().C, out = [];
      [faces[3], faces[5]].forEach(f => {
        const c = E3.centroid(f), n = E3.sub(c, E3.centroid(faces.map(E3.centroid)));
        if (E3.dot(n, E3.sub(C, c)) <= 0) return;
        // the side face runs v[a], v[b] along the floor and w[b], w[a] along the roof
        const band = [AUH.lerp3(f[0], f[3], k0), AUH.lerp3(f[1], f[2], k0), AUH.lerp3(f[1], f[2], k1), AUH.lerp3(f[0], f[3], k1)];
        if (AUH.clipZ() !== null && band.some(q => q[2] < AUH.clipZ())) return;
        if (band.every(q => E3.depth(q) > 1)) out.push(new P(band.map(E3.proj), true));
      });
      if (out.length) { wash(out, OPT.colour ? '#3A4656' : INK, (OPT.colour ? 0.42 : 0.3) * a); out.forEach(q => stroke(q, 1, INK, 0.6, 0.5 * a)); }
    };
    AUH.solid(bg.tun[1], Object.assign({}, st, { tone: 0.12 }), seed + 5, warm, null, true); glaze(bg.tun[1]);
    AUH.solid(bg.tun[0], Object.assign({}, st, { tone: 0.14 }), seed + 7, warm, null, true); glaze(bg.tun[0]);
    if (near) legs();
    AUH.solid(bg.cab, Object.assign({}, st, { tone: 0.2 }), seed + 11, warm, null, true);
  },
  // an apron floodlight mast: a tapering pole to 30 m, a head frame of lamps (off by day)
  drawMast(m, ink, i) {
    const d = R11.dep(m), a = R11.air(d, 3000) * ink, top = [m[0], m[1], 30];
    AUH.solid(E3.frustum(m[0] - 0.5, m[0] + 0.5, m[1] - 0.5, m[1] + 0.5, 0, 30, -0.2, -0.2).slice(1), { tone: 0.3, shade: 0.5, lw: 1, edgeA: 0.9 * a, hdir: [0, 0, 1] }, 900 + i, null, null, true);
    AUH.solid(E3.box(m[0] - 2.2, m[0] + 2.2, m[1] - 0.5, m[1] + 0.5, 29.4, 31.4), { tone: 0.35, shade: 0.4, lw: 1, edgeA: 0.9 * a, fillCol: OPT.colour ? '#5E6470' : null, fillA: 0.3 }, 910 + i, null, null, true);
    for (let k = -1; k <= 1; k++) R11.member([m[0] + k * 1.4, m[1] - 0.5, 29.4], [m[0] + k * 1.4, m[1] - 0.5, 31.4], 0.8, 0.7 * a);
  },
});

/* ==========================================================================================================
   2 · The arrival (beat 'airport', 8.33 s on a 0.6 clock: lt 0.6-5.6, seen lt 0.45-5.75): the aviation photographer's
   tracking pan. The eye stands 3.5 m up on the sand 230 m left of runway 31L's centreline, abeam a point 205 m past the
   threshold (outside the runway strip), and pans with a 787-9 (no livery) as it flares, puts its main gear down and
   lowers its nose: seen first from the front quarter (its landing lights toward the eye), broadside at the touchdown, and
   from the rear quarter at the end, when the crescent tower (2.3 km on, 1 km right of the runway) and Terminal A's
   roofs (4.2 km) have slid in behind it. The pan is computed from the aircraft's position (the lens follows a point
   just ahead of its main gear, held a little right of the frame's centre, so there is room ahead of its nose), and the
   lens zooms gently as the aircraft draws away (its focal length grows as the distance to the power 0.7), so it stays
   large and nothing jumps.
   The motion is the aircraft's real one on the scene clock (the clock runs at 0.6, a gentle slow motion; never faster
   than real). The main gear crosses the threshold about 10 m up (the ILS's 17.4 m datum is the antenna's height, 57 ft)
   at 70 m/s on the 3.0° glide path; the flare begins with the main wheels at 30 ft (Airbus FCTM: about 30 ft; the
   pitch raised ~2°), lasts 4.0 s (Boeing FCTM: typical flare times 4-8 s) on idle thrust (0.6 m/s²), the sink easing
   from 3.7 to 0.6 m/s and the pitch rising from 2.4° to 5.2°, and the rear wheels of the tilted bogies touch 298 m past
   the threshold (lt 2.95): the bogies level, the oleos compress, the ground spoilers rise to 50° within a second (they
   deploy at main-gear touchdown), the reversers' sleeves run aft, and the nose is flown down without delay (FCTM:
   "lower the nose as soon as the main gear touches down") to put the nose wheels on the runway 2.25 s later (lt 5.2);
   the deceleration builds from 0.6 to 2.2 m/s². Real time cannot hold the approach as well: the flare, the touchdown
   and the de-rotation take 6.3 s of the beat's 5.3 seen seconds, so the beat opens in the flare, 1.5 s in, the main
   wheels 4.5 m up. Its shadow runs ahead of it on the runway (the sun 9.2° up at 121°, 46 minutes after sunrise, behind
   the aircraft) and closes on its wheels at the touchdown. No tyre smoke, no flame. Its landing lights (in the wing
   roots, and the taxi light on the nose gear) burn steadily; its beacons and strobes are dark.
   The runway (ICAO Annex 14, a precision approach runway of 4,106 × 60 m): sixteen 30 m threshold stripes 6 m in, the
   aiming point (two 60 × 10 m blocks 400 m in), the distance-coded touchdown-zone pairs every 150 m to 900 m (three
   stripes at 150 and 300 m, two at 600, one at 750 and 900; the pair at 450 m dropped beside the aiming point), the
   centreline, the side stripes; its lights steady. The fog, 13 minutes after the dawn shot, is down to its last lenses:
   a 1.5 m layer lying low over the sand, cleared from the runway's asphalt; in real time it barely moves.
   ========================================================================================================== */
scene({
  id: 'arrival',
  start: 0, dur: 5,
  init() {
    this.term = AUH.terminal(0.5);
    this.tower = AUH.tower();
    this.decals = B789.model({ key: 'decals', lod: 0 }).decals;
    const W3 = AUH.W3;
    // the runway and its markings (ICAO): threshold stripes, centreline, touchdown-zone and aiming-point markings, edges
    const rw = { L: 4106, hw: 30 };
    this.rw = rw;
    const q = (u0, u1, v0, v1, z = 0.02) => [W3(u0, v0, z), W3(u1, v0, z), W3(u1, v1, z), W3(u0, v1, z)];
    this.q = q;
    this.marks = [];
    for (let k = 0; k < 8; k++) [-1, 1].forEach(s => this.marks.push(q(6, 36, s * (1.8 + k * 3.45), s * (3.6 + k * 3.45))));
    for (let u = 60; u < 4000; u += 50) this.marks.push(q(u, u + 30, -0.45, 0.45));
    [[150, 3], [300, 3], [600, 2], [750, 1], [900, 1]].forEach(([u, n]) => { for (let k = 0; k < n; k++) [-1, 1].forEach(s => this.marks.push(q(u, u + 22.5, s * (9 + k * 3.3), s * (10.8 + k * 3.3)))); });
    [-1, 1].forEach(s => this.marks.push(q(400, 460, s * 9, s * 19)));
    [-1, 1].forEach(s => this.marks.push(q(0, rw.L, s * 28.6, s * 29.5)));
    // the approach lights (900 m): barrettes every 30 m, crossbars at 150 and 300 m; all steady
    const bars = [];
    const zA = u => 0.9 + (-u) * 0.0012;
    for (let u = -30; u >= -900; u -= 30) bars.push({ u, z: zA(u), h: u === -150 ? 12 : u === -300 ? 15 : 2.1 });
    this.bars = bars;
    // the green threshold bar with its wing bars; touchdown-zone barrettes, centreline and edge lights
    const thr = [], rwl = [];
    for (let v = -29; v <= 29.01; v += 2.9) thr.push(W3(-2, v, 0.3));
    [-1, 1].forEach(s => { for (let k = 0; k < 6; k++) thr.push(W3(-2, s * (33 + k * 2.5), 0.4)); });
    for (let u = 60; u <= 900; u += 30) [-1, 1].forEach(s => { for (let k = 0; k < 3; k++) rwl.push(W3(u, s * (9 + k * 1.5), 0.05)); });
    for (let u = 7.5; u < rw.L; u += 15) rwl.push(W3(u, 0, 0.05));
    this.thr = thr; this.rwl = rwl;
    // the edge lights on short posts (60 m apart), drawn as the small fittings they are
    this.edge = [];
    for (let u = 0; u <= rw.L; u += 60) [-1, 1].forEach(s => this.edge.push(W3(u, s * 31, 0)));
    // the parallel taxiway (210 m to the right), its link at the threshold end, a rapid exit, and the far runway 31R
    this.twy = [q(-80, 3950, 198.5, 221.5), q(-34, -11, 30, 205)];
    this.exitL = [W3(1330, 22, 0.02), W3(1530, 200, 0.02)];
    this.far = q(-200, 4100, 1970, 2030);
    // the runway's instruments: RVR sensors 120 m right of the centreline at 385, 1,520, 2,620 and 3,760 m, a cup
    // anemometer on a 10 m mast 300 m in; the met enclosure 350 m left (south-west) of the centreline, 1,200 m from 13R
    this.rvr = [385, 1520, 2620, 3760].map(u => ({ u, v: 120 }));
    this.anemo = { u: 300, v: 165 };
    this.enclosure = { u: 2906, v: -350 };
    // the eye: 3.5 m up on the sand left of the runway (its perimeter track beside it), abeam 250 m past the threshold
    this.CAM = [285, -150, 3.5];
    this.track = [[W3(-400, -238, 0.01), W3(1400, -238, 0.01)], [W3(-400, -243.5, 0.01), W3(1400, -243.5, 0.01)]];
    // the ground's grain and the fog's, laid out over the whole of the pan's field (strokes lying square to the line of
    // sight, uniform on the screen), and kept off the pavement
    const onPave = (u, v) => (u > -62 && u < rw.L + 2 && Math.abs(v) < 39) || (u > -82 && u < 3952 && Math.abs(v - 210) < 14) || (u > -36 && u < -9 && v > 28 && v < 207) || (u > -205 && Math.abs(v - 2000) < 34);
    this.sandSk = this.wedge(9000, 6601, 9, 4200, 2600, 15).filter(([a]) => !onPave(a[1], a[0]));
    this.fogSk = this.wedge(2600, 5501, 25, 4500, 2600, 55);
    this.near = this.wedge(900, 6611, 9, 60, 2600, 22).filter(([a]) => !onPave(a[1], a[0]));
    // the flight's fixed points
    const D = AUH.D, tg = Math.tan(3 * D);
    this.F = { V0: 70, sink: 70 * tg, hF: 9.1, T: 4.0, ac: 0.6, uF: 23 };
    this.F.uTD = this.F.uF + 70 * this.F.T - 0.5 * this.F.ac * this.F.T * this.F.T;
  },
  // n ground strokes over the pan's field of view: depth t0-t1 from the eye (uniform in 1/depth), bearing across the
  // pan, each ~len px long on a f px lens, square to the line of sight
  wedge(n, seed, t0, t1, f, len) {
    const r = rng(seed), C = this.CAM, out = [], D = AUH.D;
    for (let i = 0; i < n; i++) {
      const ph = lerp(-58, 84, r()) * D, t = 1 / lerp(1 / t0, 1 / t1, r()), L = len * (0.4 + 1.2 * r()) * t / f, a = (r() - 0.5) * 0.08;
      const du = Math.sin(ph), dv = Math.cos(ph), cu = C[0] + du * t, cv = C[1] + dv * t, su = Math.cos(ph + a), sv = -Math.sin(ph + a);
      out.push([AUH.W3(cu - su * L / 2, cv - sv * L / 2, 0), AUH.W3(cu + su * L / 2, cv + sv * L / 2, 0), r()]);
    }
    return out;
  },
  TTD: 2.95,
  // the aircraft at scene time lt: its pose (the body origin on the axis over the main gear; u along the runway from the
  // threshold) and its configuration
  flight(lt) {
    const F = this.F, D = AUH.D, tF = this.TTD - F.T, Z = B789.Z0;
    // the lowest point of the main gear (a rear wheel's tread) below the body origin, for a pitch, a strut extension
    // (1 out, 0 compressed) and a bogie tilt
    const low = (th, ext, tilt) => { const t = th * D, piv = -Z + 0.62 - 0.36 * ext, r = 0.62 + 0.065 * ext, xa = -0.75 * Math.cos(tilt * D), za = piv - 0.75 * Math.sin(tilt * D), xf = 0.75 * Math.cos(tilt * D), zf = piv + 0.75 * Math.sin(tilt * D);
      return Math.min(xa * Math.sin(t) + za * Math.cos(t), xf * Math.sin(t) + zf * Math.cos(t)) - r; };
    let u, hw, th, ext = 1, tilt = 13, sp = 0, rev = 0;
    if (lt < tF) { const t = lt - tF; u = F.uF + F.V0 * t; hw = F.hF - F.sink * t; th = 2.4; }
    else if (lt < this.TTD) {
      const tau = lt - tF, x = tau / F.T, T = F.T;
      u = F.uF + F.V0 * tau - 0.5 * F.ac * tau * tau;
      // the wheels' height: from 9.1 m sinking at 3.7 m/s to the runway sinking at 0.6 m/s (a cubic)
      hw = (2 * x ** 3 - 3 * x ** 2 + 1) * F.hF + (x ** 3 - 2 * x ** 2 + x) * T * -F.sink + (x ** 3 - x ** 2) * T * -0.6;
      th = 2.4 + 2.8 * AUH.smooth(x);
    } else {
      const s = lt - this.TTD, V = F.V0 - F.ac * F.T;
      // the deceleration builds from 0.6 to 2.2 m/s² over 1.5 s (spoilers, reversers, autobrake): integrated exactly
      // enough (Simpson, 40 steps) that the distance is a smooth function of time
      let dist = 0; const n = 40, h = s / n, acc = q => 0.6 + 1.6 * AUH.smooth(clamp(q / 1.5)), vel = q => { let dv = 0; const m = 16, hh = q / m; for (let k = 0; k <= m; k++) dv += (k === 0 || k === m ? 1 : k % 2 ? 4 : 2) * acc(k * hh); return V - dv * hh / 3; };
      if (s > 0) for (let k = 0; k <= n; k++) dist += (k === 0 || k === n ? 1 : k % 2 ? 4 : 2) * vel(k * h);
      u = F.uTD + dist * h / 3;
      hw = 0; tilt = 13 * (1 - AUH.smooth(clamp(s / 0.35))); ext = 1 - AUH.smooth(clamp(s / 0.6));
      th = 5.2 * (1 - AUH.smooth(clamp((s - 0.35) / 1.9)));
      sp = 50 * AUH.smooth(clamp(s / 1.0)); rev = AUH.smooth(clamp((s - 0.7) / 1.4));
    }
    const z = hw - low(th, ext, tilt);
    // the nose gear's leg, out until its wheels meet the runway, then pressed home
    const t = th * D, xn = B789.X(B789.SNG) - 0.12, extN = clamp((z + xn * Math.sin(t) - Z * Math.cos(t)) / (0.34 * Math.cos(t)), 0, 1);
    return { u, v: 0, z, psi: 0, theta: th, cfg: { lod: 0, flex: lt < this.TTD ? 1.6 : lerp(1.6, 0.2, AUH.smooth(clamp((lt - this.TTD) / 1.2))), flap: 30, slat: 1, spoiler: sp, rev, gear: { ext, tilt, extN } } };
  },
  // the eye pans with the aircraft, as an operator follows it: the lens turns on a point just ahead of its main gear
  // (its position, not its attitude), the zoom grows gently with the distance (as its 0.4 power), never so far that the
  // airframe (its nose, tail, fin, wing tips and wheels, softly bounded) fills more than 84% of the frame's width, and
  // the frame is shifted so that the airframe's middle sits a little right of the frame's, leaving room ahead of its nose
  view(lt) {
    const fl = this.flight(lt), aim = AUH.W3(fl.u + 2.5, 0, fl.z + 2.6), C = AUH.W3(this.CAM[0], this.CAM[1], this.CAM[2]), B = R11.BOX;
    if (window.AIRTEST) { const A = window.AIRTEST, D = AUH.D; this.fl = fl; return E3.camera(AUH.W3(fl.u + A.d * Math.sin(A.az * D) * Math.cos(A.el * D), -A.d * Math.cos(A.az * D) * Math.cos(A.el * D), fl.z + A.d * Math.sin(A.el * D)), aim, A.f, 560, 560); }
    E3.camera(C, aim, 1, 0, 0);
    const pose = AUH.poser(fl), X = B789.X, zt = B789.zRef(30.06, fl.cfg.flex), Z = B789.Z0;
    const key = [[X(0), 0, -0.5], [X(62), 0, 1.0], [X(55.9), 0, 12.25], [X(59.3), 0, 12.25], [X(43.1), 30.06, zt], [X(43.95), 30.06, zt], [X(43.1), -30.06, zt], [X(43.95), -30.06, zt],
      [X(57.8), 9.9, 2.1], [X(57.8), -9.9, 2.1], [-0.75, 5.6, -Z - 0.4], [-0.75, -5.6, -Z - 0.4], [X(6), 0, -Z - 0.4], [X(21.65), 9.8, -4.0], [X(21.65), -9.8, -4.0]].map(q => E3.proj(pose.toW(q)));
    const xs = key.map(p => p[0]), ys = key.map(p => p[1]), w0 = Math.max(...xs) - Math.min(...xs), kk = 60 / w0;
    const sm = (a, k) => { const m = k > 0 ? Math.max(...a) : Math.min(...a); return m + Math.log(a.reduce((s, v) => s + Math.exp(k * (v - m)), 0)) / k; };
    const x0 = sm(xs, -kk), x1 = sm(xs, kk), y0 = sm(ys, -kk), y1 = sm(ys, kk);
    const d = Math.hypot(aim[0] - C[0], aim[1] - C[1], aim[2] - C[2]), fd = 2500 * Math.pow(d / 150, 0.5), fm = 0.84 * (B[2] - B[0]) / (x1 - x0);
    const f = Math.pow(Math.pow(fd, -6) + Math.pow(fm, -6), -1 / 6), k = AUH.smooth(clamp((lt - 0.45) / 5.3));
    this.fl = fl;
    return E3.camera(C, aim, f, lerp(600, 640, k) - f * (x0 + x1) / 2, 545 - f * (y0 + y1) / 2);
  },
  frame(lt) {
    const cam = this.view(lt), h = E3.projDir([cam.F[0], cam.F[1], 0]);
    this.hy = h ? h[1] : 560;
  },
  under(lt) {
    this.frame(lt);
    const B = R11.BOX, hy = this.hy, q = easeInOut(prog(lt, 0.4, 0.8));
    // the morning sky away from the sun: blue overhead, paling to a warm haze along the horizon
    washFade([B[0], B[1] - 200, B[2], hy + 2], [[0, HUE.deep, 0.3], [0.3, HUE.sky, 0.55], [0.75, HUE.sky, 0.34], [0.93, HUE.cloud, 0.24], [1, HUE.sand, 0.24]], 0, q);
    // the ground: sand lit by the low sun behind the eye's right shoulder, warmer and deeper toward the eye
    washFade([B[0], hy - 1, B[2], B[3]], [[0, HUE.sand, 0.2], [0.1, HUE.sand, 0.3], [0.55, HUE.dune, 0.42], [1, HUE.hill, 0.5]], 0, q);
  },
  draw(lt) {
    // 46 minutes after sunrise (13 after the dawn shot ends): 9.2° up at 121.1°
    const [sAz, sAlt] = AUH.sunMin(46);
    AUH.sunAt(sAz, sAlt);
    R11.clipped(() => {
      this.frame(lt);
      const B = R11.BOX, hy = this.hy, ink = easeOut(prog(lt, 0.3, 0.7)), W3 = AUH.W3, cam = E3.cam();
      AUH.skyRules(hy, (x, y) => { const up = clamp((hy - y) / (hy - B[1])); return ink * (0.16 + 0.84 * up) * clamp((hy - y) / 22) * (OPT.colour ? 0.5 : 1); }, { amax: 0.46, step: 5.2, step0: 2.9, lw: 0.8 });
      stroke(new P([[B[0], hy], [B[2], hy]]), ink, INK, 0.8, 0.4);
      // the sand: engraved rules on the ground, finer toward the horizon, heavier toward the eye, broken into the long
      // low wind ripples of the graded strip; its grain
      AUH.groundRules(hy, this.CAM[2], (wu, wv, t) => {
        const rip = 0.5 + 0.5 * Math.sin((wu * 0.8 + wv * 0.35) / 2.1 + 2.4 * AUH.noise(wu / 30, wv / 24, 1.3));
        return ink * (0.35 + 0.65 * AUH.smooth(clamp((rip - 0.2) * 1.6))) * (0.55 + 0.45 * AUH.noise(wu / 90, wv / 70, 3.1));
      }, { pitch: y => lerp(2.0, 4.4, clamp((y - hy) / (B[3] - hy))), lw: y => lerp(0.5, 1.35, clamp((y - hy) / (B[3] - hy))), a: OPT.colour ? 0.5 : 0.62, col: OPT.colour ? HUE.hill : SEPIA });
      E3.segments(this.sandSk.map(([a, b, k]) => [a, b, (OPT.colour ? 0.16 + 0.3 * k : 0.14 + 0.32 * k) * ink]), OPT.colour ? HUE.hill : SEPIA, 0.85);
      E3.segments(this.near.map(([a, b, k]) => [a, b, (0.2 + 0.35 * k) * ink]), OPT.colour ? HUE.hill : SEPIA, 1.2);
      this.track.forEach(t => E3.line(t, OPT.colour ? HUE.hill : SEPIA, 1.0, 0.3 * ink));
      // the pavement: asphalt darker than the sand, so its paint shows white
      const along = [0, 1, 0], dk = OPT.colour ? 0 : 0.2;
      const pave = (pts, tone, seed, col, fa = 0.42) => E3.face(pts, { n: [0, 0, 1], tone, shade: 0, hdir: along, fillCol: OPT.colour ? col : tone > 0.3 ? INK : null, fillA: OPT.colour ? fa : 0.16 * tone, lw: 0.9, edgeA: 0.5 * ink }, seed);
      pave(this.far, 0.3 + dk, 501, HUE.steel);
      this.twy.forEach((t, i) => pave(t, 0.26 + dk, 510 + i, HUE.steel));
      E3.line(this.exitL, INK, 0.9, 0.4 * ink);
      pave(this.q(-60, this.rw.L, -37.5, 37.5, 0), 0.08, 520, '#C9BFAE', 0.35);
      pave(this.q(0, this.rw.L, -30, 30, 0.01), 0.62 + dk, 521, '#4A5058', 0.62);
      this.marks.forEach(p => { if (p.every(x => E3.depth(x) > 2)) mask(new P(p.map(E3.proj), true), 0.88 * ink); });
      // the aircraft's shadow on the runway, down-sun of it, ruled
      const fl = this.fl, pose = AUH.poser(fl), m = B789.build(fl.cfg);
      m.decals = this.decals;
      AUH.unionFill(B789.shadow(m, pose, E3.sun(), []), OPT.colour ? '#56616E' : INK, (OPT.colour ? 0.4 : 0.62) * ink, OPT.colour ? 0 : 2.2);
      // the runway's lights, steady; the edge lights' fittings
      AUH.lights(this.thr, OPT.colour ? HUE.leaf : OCHRE, { r0: 1.6, k: 230, a: 0.95 * ink, halo: 0.13 * ink });
      AUH.lights(this.rwl, OPT.colour ? '#E2B868' : OCHRE, { r0: 1.0, k: 200, a: 0.8 * ink, halo: 0.06 * ink });
      E3.segments(this.edge.map(p => [p, [p[0], p[1], 0.45], 0.7 * ink]), INK, 0.9);
      AUH.lights(this.edge.map(p => [p[0], p[1], 0.45]), OPT.colour ? '#F0D9A0' : OCHRE, { r0: 1.1, k: 200, a: 0.85 * ink, halo: 0.07 * ink });
      // the painter's list: the far terminal and tower, the instruments, the approach lights, the aircraft, the fog
      const list = [];
      const dT = R11.dep(W3(AUH.TWR[0], AUH.TWR[1], 40));
      list.push({ d: dT, draw: () => AUH.drawTower(this.tower, R11.air(dT, 2600) * ink, OPT.colour ? HUE.dawn : null, 0.12, 0.3) });
      AUH.terminalItems(list, this.term, ink, { k: 2600, noHatch: true, warm: OPT.colour ? HUE.dawn : null, warmAll: 0.08 });
      this.rvr.forEach(s => list.push({ d: R11.dep(W3(s.u, s.v, 1)), draw: () => this.rvrSensor(s, ink) }));
      list.push({ d: R11.dep(W3(this.anemo.u, this.anemo.v, 5)), draw: () => this.anemometer(this.anemo, ink, lt) });
      list.push({ d: R11.dep(W3(this.enclosure.u, this.enclosure.v, 1)), draw: () => this.metPlot(this.enclosure, ink) });
      this.bars.forEach(b => { const p = W3(b.u, 0, b.z), d = R11.dep(p); if (d > 1) { const s = E3.proj(p); if (s[0] > B[0] - 80 && s[0] < B[2] + 80) list.push({ d, draw: () => this.drawBar(b, ink) }); } });
      const dP = R11.dep(pose.toW([0, 0, 0]));
      list.push({ d: dP, draw: () => B789.draw(m, pose, { air: R11.air(dP, 3000) * ink, warm: OPT.colour ? HUE.dawn : null, warmA: 0.3, warmAll: 0.04, lights: ink, lw: 1.1 }) });
      // the fog's last lenses, 1.5 m deep, over the infield's sand, cleared from the runway's asphalt and its shoulders;
      // in real time it only settles 0.1 m and drifts at 1.5 m/s toward the north-west
      const w = clamp((lt - 0.45) / 5.3), slide = 1.5 * (lt - 0.6), dv = AUH.dirAz(300), C2 = cam.C[2], hF = lerp(1.0, 0.92, w), Vf = 55;
      const fogF = (fu, fv) => {
        const onRw = clamp(1 - (Math.abs(fv) - 110) / 30) * clamp((fu + 260) / 60) * clamp((4300 - fu) / 60);
        return AUH.fogDepth(fu - dv[0] * slide, fv - dv[1] * slide, 0.57 + 0.01 * w, 0.12, 1.5) * (1 - onRw);
      };
      AUH.fogLayer(list, {
        h: hF, V: Vf, amt: 0.92 * ink, strokes: this.fogSk,
        dens: (l, t) => { const g = AUH.rowGround(l, t); return AUH.fogShare(fogF(g[1], g[0]), hF * t / Math.max(1, C2 - hF), Vf); },
        tint: OPT.colour ? () => [[0, HUE.cloud, 0.24], [1, HUE.cloud, 0.18]] : null,
        rule: (x, y) => clamp((y - hy) / 8) * (0.3 + 0.7 * Math.pow(clamp((y - hy) / (B[3] - hy)), 0.6)),
        rulePitch: y => lerp(2.3, 3.6, clamp((y - hy) / (B[3] - hy))), ruleW: y => lerp(0.5, 1.2, clamp((y - hy) / (B[3] - hy))),
        ruleA: OPT.colour ? 0.5 : 0.8,
        grain: (x, y, l, t, k) => clamp((y - hy) / 24) * (0.2 + 0.5 * k),
        lineCol: OPT.colour ? HUE.steel : SEPIA, lw: 0.8,
      });
      // the air: sheets of haze at their depths, each over the sky and the ground beyond it only
      [900, 1500, 2200, 3100, 4200].forEach(d => AUH.hazeItems(list, [d], { hy, up: 160, down: cam.f * this.CAM[2] / d, a: 0.13 * ink, tint: OPT.colour ? [HUE.sand, 0.2] : null }));
      R11.paint(list);
    });
    E3.sunAt();
  },
  // one barrette: its bar across the centreline on two legs, its lamps (steady), a crossbar's long bar on more legs
  drawBar(b, ink) {
    const W3 = AUH.W3, d = R11.dep(W3(b.u, 0, b.z)), a = R11.air(d, 2600) * ink, fl = E3.cam().f, lw = clamp(0.1 * fl / d, 0.5, 4.5);
    const z = b.z;
    E3.line([W3(b.u, -b.h, z), W3(b.u, b.h, z)], INK, lw * 1.2, 0.85 * a);
    const legs = b.h > 3 ? [-b.h, -b.h / 2, -1.5, 1.5, b.h / 2, b.h] : [-1.5, 1.5];
    legs.forEach(v => E3.line([W3(b.u, v, 0), W3(b.u, v, z)], INK, lw, 0.8 * a));
    if (d < 140) legs.forEach(v => E3.line([W3(b.u - 0.3, v, 0.02), W3(b.u + 0.3, v, 0.02)], INK, lw * 1.4, 0.7 * a));
    // the lamps: a housing, and the steady light in it
    const lamps = [];
    for (let k = -2; k <= 2; k++) lamps.push(W3(b.u, k * 1.05, z + 0.25));
    if (b.h > 3) for (let v = -b.h; v <= b.h + 0.01; v += 1.5) if (Math.abs(v) > 2.4) lamps.push(W3(b.u, v, z + 0.25));
    if (d < 260) {
      // near lamps: a dark housing, its lit lens (paper, the brightest thing on the plate) and a warm halo round it
      lamps.forEach(p => {
        const s = E3.proj(p), rr = clamp(0.2 * fl / d, 0.9, 12);
        fill(el(s[0], s[1] + rr * 0.25, rr * 1.35, rr * 1.05, 0, TAU, 60, 0), INK, 0.6 * a);
        if (OPT.colour) disc(s[0], s[1], rr * 2.4, '#F2B14A', 0.3 * ink, 'multiply');
        mask(el(s[0], s[1], rr * 0.85, rr * 0.7, 0, TAU, 61, 0), ink);
        stroke(el(s[0], s[1], rr * 0.95, rr * 0.8, 0, TAU, 62, 0), 1, OPT.colour ? '#D08A1E' : OCHRE, clamp(rr * 0.25, 0.6, 2.2), 0.9 * ink);
      });
    } else AUH.lights(lamps, OPT.colour ? '#F0B43C' : OCHRE, { r0: 1.8, k: 260, a: 0.95 * ink, halo: 0.16 * ink });
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
