'use strict';
// Revision 11 · Fujairah: the oil terminal jetty (prototype, geometry only)
const JT = (() => {
  const TH = 352 * Math.PI / 180, UH = [Math.sin(TH), Math.cos(TH)], VH = [Math.sin(TH + Math.PI / 2), Math.cos(TH + Math.PI / 2)];
  const L = (u, v, z = 0) => [u * UH[0] + v * VH[0], u * UH[1] + v * VH[1], z];
  const Lbox = (u0, u1, v0, v1, z0, z1) => E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([a, b, c]) => L(a ? u1 : u0, b ? v1 : v0, c ? z1 : z0)));
  return { L, Lbox, UH, VH };
})();
scene({
  id: 'jetty',
  start: 0, dur: 6.667,
  init() {
    const { L, Lbox } = JT;
    this.F = 14; // freeboard
    // hull outline half-breadths from stern s=0 to bow s=330, at the deck and at the waterline
    const deck = [[0, 24], [8, 28], [20, 30], [270, 30], [285, 29.5], [300, 27.5], [312, 23.5], [322, 16], [327, 9], [330, 0]];
    const wl = [[4, 20], [10, 27], [25, 30], [265, 30], [280, 29], [295, 26], [308, 20], [318, 12], [323, 4], [324.5, 0]];
    const out = (tab, z) => { const a = tab.map(([s, b]) => [s, b]), pts = []; a.forEach(([s, b]) => pts.push(this.sl(s, -b, z))); a.slice().reverse().forEach(([s, b]) => { if (b > 0) pts.push(this.sl(s, b, z)); }); return pts; };
    this.deckPts = out(deck, this.F); this.wlPts = out(wl, 0);
    const Q = new URLSearchParams(location.search).get('jv'); if (Q) this.V = Q.split(',').map(Number);
  },
  // ship-local: s from the stern (north) to the bow (south), w across from the centreline (+ to seaward/port)
  sl(s, w, z) { return JT.L(165 - s, 30 + w, z); },
  view(lt) {
    const u = easeInOut(clamp((lt - 0.7) / 7.2));
    const V = this.V || [-679, 511, 200, -20, -40, 0, 1500, 560, 640];
    const C = JT.L(V[0], V[1], V[2] + 30 * u), Lk = JT.L(V[3], V[4], V[5]);
    return E3.camera(C, Lk, V[6], V[7], V[8]);
  },
  draw(lt) {
    const { L, Lbox } = JT;
    E3.sunAt(106, 28);
    R11.clipped(() => {
      this.view(lt);
      const hz = E3.projDir([Math.sin(-0.9), Math.cos(-0.9), -0.008]);
      stroke(new P([[0, hz[1]], [1100, hz[1]]]), 1, INK, 1, 0.5);
      // far mountains (placeholder: a ridge 8 km to the west)
      const rp = []; for (let b = 230; b <= 360; b += 1) { const a = b * Math.PI / 180, d = 9000; rp.push(E3.proj([d * Math.sin(a), d * Math.cos(a), 500 + 200 * Math.sin(b * 0.3)])); }
      stroke(new P(rp), 1, INK, 1, 0.6);
      // shore line 2.5 km west
      E3.line([[-2500, -3000, 0], [-2300, 3000, 0]], INK, 1, 0.6);
      // breakwater
      E3.solid([[L(-300, -153, 8), L(700, -153, 8), L(700, -170, 8), L(-300, -170, 8)], [L(-300, -140, 0), L(700, -140, 0), L(700, -153, 8), L(-300, -153, 8)]].concat([]), { tone: 0.1 }, 10);
      E3.face([L(-300, -140, 0), L(700, -140, 0), L(700, -153, 8), L(-300, -153, 8)], { n: [JT.VH[0], JT.VH[1], 1], tone: 0.1 }, 11);
      E3.face([L(-300, -153, 8), L(700, -153, 8), L(700, -170, 8), L(-300, -170, 8)], { n: [0, 0, 1], tone: 0.05 }, 12);
      // trestle
      E3.solid(Lbox(-3, 3, -153, -33, 6.5, 8.2), { tone: 0.1 }, 20);
      // dolphins
      [-190, -150, -110, 110, 150, 190].forEach((u, i) => E3.solid(Lbox(u - 5, u + 5, -30, -20, 3.6, 6.6), { tone: 0.1 }, 30 + i));
      [-66, -42, 42, 66].forEach((u, i) => E3.solid(Lbox(u - 6, u + 6, -15, -3, 3.6, 6.6), { tone: 0.1 }, 40 + i));
      // platform
      E3.solid(Lbox(-19.5, 19.5, -33.3, -3.3, 5.7, 8.2), { tone: 0.1 }, 50);
      // arms (risers)
      [-6, -2, 2, 6].forEach(u => E3.line([L(u, -7, 8.2), L(u, -7, 17.7), L(u, -1, 26.3), L(u, 4.6, 16.1)], INK, 1.2, 0.9));
      // ship
      E3.solid(this.hullFaces || (this.hullFaces = this.loft()), { tone: 0.3 }, 60);
      E3.solid(E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([a, b, c]) => this.sl(a ? 36 : 14, b ? 21 : -21, c ? 36 : 14))), { tone: 0.05 }, 70);
      E3.solid(E3.box(0, 1, 0, 1, 0, 1).map(f => f.map(([a, b, c]) => this.sl(a ? 13 : 4, b ? 7 : -7, c ? 50 : 14))), { tone: 0.3 }, 71);
    });
    E3.sunAt();
  },
  loft() {
    const a = this.wlPts, b = this.deckPts, n = a.length, f = [];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; f.push([a[i], a[j], b[j], b[i]]); }
    f.push(b.slice()); f.push(a.slice());
    return f;
  },
});
