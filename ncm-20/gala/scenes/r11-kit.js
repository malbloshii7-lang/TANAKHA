'use strict';
// Revision 11 (?rev11, a draft for approval): shared helpers for the new plates, drawn in true 3D with engrave3d.js.
// These plates draw in screen space (their timeline entries use R11.CAM), inside the same picture box the v3 plates
// fill under the gala's left-plate camera, so the words column on the right is untouched.
const R11 = (() => {
  const BOX = [34, 44, 1086, 1080]; // the picture box on screen (the v3 plates' washes fill the same box)
  const CAM = () => ({ s: 1, px: 0, py: 0, sx: 0, sy: 0 });
  const boxPath = () => boxP(BOX[0], BOX[1], BOX[2], BOX[3]);
  // draw inside the picture box only
  function clipped(fn) { ctx.save(); ctx.beginPath(); boxPath().trace(ctx, 1); ctx.clip(); try { fn(); } finally { ctx.restore(); } }
  // scale everything drawn inside fn by a (an object inking in); paper masks fade with it, so nothing punches through
  function faded(a, fn) { if (a <= 0.003) return; const s0 = SA; SA = s0 * Math.min(1, a); try { fn(); } finally { SA = s0; } }
  // the air between the eye and a far object: lines and hatching thin out with distance, as an engraver lightens a
  // background (1 near, toward 0.25 at the horizon)
  const air = (d, k = 2600) => 0.25 + 0.75 * Math.exp(-d / k);
  // a world point's depth from the camera (E3's camera must be set)
  const dep = p => E3.depth(p);
  // the sky and the far haze in colour, and a soft ground for the default look (a graded wash that ends at the box)
  function sky(stops, a = 1, horizonY = 600) { washFade([BOX[0], BOX[1] - 300, BOX[2], horizonY], stops, 0, a); }
  // sort drawables { d, draw } far to near and draw them: E3 masks each face with paper, so painter's order is the
  // hidden-line removal
  function paint(list) { list.sort((a, b) => b.d - a.d).forEach(o => o.draw()); }
  // a ring of points (for round things: tanks, domes) in the world
  const ring = (c, r, z, n = 36, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a), z]; });
  // a vertical cylinder as convex faces (sides only facing the camera are kept by E3's culling), with a top
  function cylinder(c, r, z0, z1, n = 20) {
    const f = [];
    for (let k = 0; k < n; k++) {
      const a0 = k / n * TAU, a1 = (k + 1) / n * TAU;
      f.push([[c[0] + r * Math.cos(a0), c[1] + r * Math.sin(a0), z0], [c[0] + r * Math.cos(a1), c[1] + r * Math.sin(a1), z0], [c[0] + r * Math.cos(a1), c[1] + r * Math.sin(a1), z1], [c[0] + r * Math.cos(a0), c[1] + r * Math.sin(a0), z1]]);
    }
    f.push(ring(c, r, z1, n).slice(0, n));
    return f;
  }
  // a thin member between two world points as a line whose weight falls with distance (steel lattice, legs, stays)
  function member(a, b, lw = 1.2, al = 0.85, col = INK) {
    const d = Math.max(1, (dep(a) + dep(b)) / 2);
    E3.line([a, b], col, clamp(lw * 260 / d, 0.35, 2.4), al * air(d));
  }
  return { BOX, CAM, boxPath, clipped, faded, air, dep, sky, paint, ring, cylinder, member };
})();
