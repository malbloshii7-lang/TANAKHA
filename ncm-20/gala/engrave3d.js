'use strict';
// A small 3D renderer in the film's engraved-plate language: the seeding aircraft in the film (scenes/plate-seeding.js)
// and the rail workshop (lab/rail-3d.html).
// World: x east, y north, z up, in metres. A pinhole camera; faces clipped at the near plane, back faces culled,
// painter's order. Each face is masked with paper, then hatched as it turns from the sun (open where it is lit,
// closing up and crossing in shadow), then inked. Line weight falls with distance, as an engraver's does.
const E3 = (() => {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const centroid = pts => pts.reduce((c, p) => [c[0] + p[0] / pts.length, c[1] + p[1] / pts.length, c[2] + p[2] / pts.length], [0, 0, 0]);
  function newell(pts) {
    const n = [0, 0, 0];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return norm(n);
  }
  let CAM = null;
  // the late-afternoon sun in the south-west, 30 degrees up
  const SUN = norm([Math.cos(Math.PI / 6) * Math.sin(235 * Math.PI / 180), Math.cos(Math.PI / 6) * Math.cos(235 * Math.PI / 180), Math.sin(Math.PI / 6)]);
  function camera(C, look, f) {
    const F = norm(sub(look, C)), R = norm(cross(F, [0, 0, 1])), U = cross(R, F);
    CAM = { C, F, R, U, f, cx: W / 2, cy: H / 2, near: 0.5 };
    return CAM;
  }
  const depth = p => dot(sub(p, CAM.C), CAM.F);
  function proj(p) { const d = sub(p, CAM.C), z = dot(d, CAM.F); return [CAM.cx + CAM.f * dot(d, CAM.R) / z, CAM.cy - CAM.f * dot(d, CAM.U) / z]; }
  // a direction at infinity (the far mountains): only the camera's rotation moves it
  function projDir(v) { const z = dot(v, CAM.F); return z <= 1e-6 ? null : [CAM.cx + CAM.f * dot(v, CAM.R) / z, CAM.cy - CAM.f * dot(v, CAM.U) / z]; }
  function clipPoly(pts) { // Sutherland-Hodgman against the near plane
    const out = [], zn = CAM.near;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], za = depth(a), zb = depth(b);
      if (za >= zn) out.push(a);
      if ((za >= zn) !== (zb >= zn)) out.push(mix(a, b, (zn - za) / (zb - za)));
    }
    return out;
  }
  function clipSeg(a, b) {
    const zn = CAM.near, za = depth(a), zb = depth(b);
    if (za < zn && zb < zn) return null;
    if (za < zn) a = mix(a, b, (zn - za) / (zb - za));
    else if (zb < zn) b = mix(b, a, (zn - zb) / (za - zb));
    return [proj(a), proj(b)];
  }
  const bbox = sp => [Math.min(...sp.map(p => p[0])), Math.min(...sp.map(p => p[1])), Math.max(...sp.map(p => p[0])), Math.max(...sp.map(p => p[1]))];
  const offscreen = b => b[2] < -40 || b[0] > W + 40 || b[3] < -40 || b[1] > H + 40;
  // One face. st: { n (outward normal; else from the winding), tone (the material's own darkness, 0-1), shade (how
  // much turning from the sun darkens it), fillCol/fillA (a wash), hatchCol, hdir (the world direction the hatching
  // follows; vertical on walls, along the track on tops), noHatch, edges (false: no outline), lw, edgeA }.
  function face(pts, st = {}, seed = 1) {
    const n = st.n || newell(pts), c = centroid(pts);
    if (dot(n, sub(CAM.C, c)) <= 0) return null;
    const cp = clipPoly(pts);
    if (cp.length < 3) return null;
    const sp = cp.map(proj), bb = bbox(sp);
    if (offscreen(bb)) return null;
    const path = new P(sp, true), zc = Math.max(CAM.near, Math.min(...cp.map(depth)));
    mask(path);
    const lit = Math.max(0, dot(n, SUN)), dark = clamp((st.tone || 0) + (st.shade ?? 0.6) * (1 - lit));
    if (st.fillCol) fill(path, st.fillCol, st.fillA ?? 0.2);
    if (!st.noHatch && dark > 0.14 && (bb[2] - bb[0]) * (bb[3] - bb[1]) > 6) {
      const hd = st.hdir || (Math.abs(n[2]) < 0.6 ? [0, 0, 1] : [1, 0, 0]);
      const cc = centroid(cp), c2 = [cc[0] + hd[0] * 0.3, cc[1] + hd[1] * 0.3, cc[2] + hd[2] * 0.3];
      const a = proj(cc), b = depth(c2) > CAM.near ? proj(c2) : [a[0], a[1] - 1];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), gap = 8.5 - 6 * dark;
      hatch(path, bb, ang, gap, 1, st.hatchCol || INK, 0.75, 0.16 + 0.34 * dark, seed);
      if (dark > 0.55) hatch(path, bb, ang + 1.15, gap * 1.35, 1, st.hatchCol || INK, 0.7, 0.3 * (dark - 0.55) / 0.45 + 0.08, seed + 7);
    }
    if (st.edges !== false) stroke(path, 1, INK, clamp((st.lw || 1.3) * 70 / zc, 0.45, 1.9), st.edgeA ?? 0.85);
    return { path, sp, n };
  }
  // A convex solid (a list of face polygons): normals point away from its centre; visible faces never overlap.
  function solid(faces, st = {}, seed = 1) {
    const cs = centroid(faces.map(centroid)), out = [];
    faces.forEach((f, i) => {
      let n = newell(f);
      if (dot(n, sub(centroid(f), cs)) < 0) n = [-n[0], -n[1], -n[2]];
      out.push(face(f, Object.assign({}, st, { n }), seed + i * 13));
    });
    return out;
  }
  function box(x0, x1, y0, y1, z0, z1) {
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    return [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(ix => ix.map(i => v[i]));
  }
  // a prism from a top rectangle down to a smaller bottom rectangle (a hopper's discharge pocket)
  function frustum(x0, x1, y0, y1, z0, z1, inX, inY) {
    const v = [[x0 + inX, y0 + inY, z0], [x1 - inX, y0 + inY, z0], [x1 - inX, y1 - inY, z0], [x0 + inX, y1 - inY, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    return [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(ix => ix.map(i => v[i]));
  }
  // a polyline in the world, clipped at the near plane, as screen runs
  function runs(pts) {
    const out = []; let cur = null;
    for (let i = 1; i < pts.length; i++) {
      const s = clipSeg(pts[i - 1], pts[i]);
      if (!s) { cur = null; continue; }
      if (cur && Math.hypot(cur[cur.length - 1][0] - s[0][0], cur[cur.length - 1][1] - s[0][1]) < 0.01) cur.push(s[1]);
      else { cur = [s[0], s[1]]; out.push(cur); }
    }
    return out;
  }
  function line(pts, col = INK, lw = 1, a = 0.8, dash = null) { runs(pts).forEach(r => { if (r.length > 1) stroke(new P(r), 1, col, lw, a, dash); }); }
  // many short world segments in one stroke (ground marks, sleepers, fence posts): [[a, b, alpha]...], in alpha bands
  function segments(list, col = INK, lw = 1) {
    const bands = [[], [], [], []];
    list.forEach(([a, b, al]) => { const s = clipSeg(a, b); if (s && al > 0.02) bands[Math.min(3, Math.floor(al * 4))].push(s); });
    bands.forEach((segs, k) => {
      if (!segs.length) return;
      ctx.save(); ctx.globalAlpha = SA * (k + 0.5) / 4; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); segs.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  }
  return { camera, cam: () => CAM, depth, proj, projDir, face, solid, box, frustum, line, runs, segments, clipSeg, centroid, dot, sub, SUN };
})();
