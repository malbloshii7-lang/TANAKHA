'use strict';
// B09 (Revision 4) · Before the rain: the Saadiyat Cultural District, Abu Dhabi, under a light-to-moderate rain, seen from
// a boat at sea at 24.5445 N, 54.3780 E (eye 3 m) looking east-south-east: bearings about 97-125 deg across the frame,
// f = 3850 px, eye level at y 720. Every building stands at its true bearing and angular size (OSM footprints, ODbL;
// heights from the museums and their architects; research of 26 Sep 2026). From left to right:
//   the Guggenheim Abu Dhabi (opens 11 Dec 2026, so open by the ceremony): 2.20 km, bearings 98.3-106.8, ten cones up to
//   88 m over low galleries; the Zayed National Museum: 3.16 km, bearings 111.2-113.0, five wings, the tallest 123 m, its
//   mound hidden by the Saadiyat Grove blocks (2.8 km, bearings 107-115); the Louvre Abu Dhabi: 2.39 km, its dome 180 m
//   across, the crown 40 m and the rim about 18 m above the sea, over its low white galleries; the Abrahamic Family House
//   (three equal cubes, no symbols) behind the Louvre's left side; the Natural History Museum and the Saadiyat end of the
//   Sheikh Khalifa Bridge at the right edge.
//   Still to match before the master: the Guggenheim's cone layout (DCT's photographs) and the four lower wings of the
//   Zayed National Museum (Foster + Partners' elevations); only the 88 m and the 123 m are published.
// The rain is natural and even across the whole district: no single shaft over one building, no lightning, no aircraft,
// no dark columns, nothing orange (in March 2026 drones struck the naval base 1.4 km from the Louvre, and news footage
// showed smoke beside the museum's wings). It stays light enough for the museums to read at 2-3 km, and eases at the end.
// Nothing here says NCM makes rain.
const SV = { f: 3850, yE: 720, b0: 111, eye: 3 };
const svX = b => 960 + SV.f * Math.tan((b - SV.b0) * Math.PI / 180);
const svY = (h, d) => SV.yE - (h - SV.eye) * SV.f / d; // a height above the sea (m) at distance d (m)
scene({
  id: 'saadiyat',
  init() {
    const r = rng(417), k = d => SV.f / d; // px a metre at distance d
    // the Guggenheim: low gallery blocks along the whole complex, then ten cones of different sizes and tilts
    const dG = 2200, cG = svX(103.2), mG = k(dG);
    this.gBlocks = [];
    for (let x = svX(98.3); x < svX(106.8) - 10;) {
      const w = (18 + r() * 34) * mG, h = 12 + r() * 13;
      this.gBlocks.push(new P([[x, svY(4, dG)], [x, svY(h, dG)], [Math.min(x + w, svX(106.8)), svY(h, dG)], [Math.min(x + w, svX(106.8)), svY(4, dG)]], true));
      x += w * (0.72 + r() * 0.2);
    }
    // cones: truncated, the wide end up; we look up at them from the boat (their rims are 2 deg above the eye), so each
    // rim shows only as a shallow lower arc; their bases stand in the galleries, which are drawn in front of them
    const cones = [[-152, 60, -10], [-116, 46, 9], [-80, 88, -3], [-44, 72, 12], [-10, 52, -17], [24, 80, 5], [58, 44, 19], [92, 66, -8], [128, 50, 11], [160, 40, -14]];
    this.gCones = cones.map(([dx, h, tilt], i) => {
      const bx = cG + dx * mG, by = svY(10, dG), top = svY(h, dG), rw = (9 + h * 0.13) * mG, bw = (4.5 + h * 0.05) * mG, t = tilt * Math.PI / 180;
      const tx = bx + (by - top) * Math.tan(t), ty = top, rim = [];
      for (let j = 0; j <= 16; j++) { const u = Math.PI * j / 16; rim.push([tx + rw * Math.cos(u) * Math.cos(t), ty + rw * Math.sin(u) * 0.06 + rw * Math.cos(u) * Math.sin(t)]); }
      const body = [[bx - bw, by]].concat(rim.slice().reverse()).concat([[bx + bw, by]]);
      return { body: new P(body, true), mouth: new P(rim), dark: i === 3 };
    });
    // the Zayed National Museum: five wings rising from behind the Saadiyat Grove blocks, each its own height and lean
    const dZ = 3160, cZ = svX(112.2), mZ = k(dZ);
    // broad, curved blades like feathers, fanned; the tallest (123 m, published) in the middle, the others about 83-110 m
    this.zWings = [[-46, 93, -14], [46, 83, 15], [-22, 110, -7], [24, 102, 8], [0, 123, 1]].map(([dx, h, lean]) => {
      const bx = cZ + dx * mZ, by = svY(30, dZ), tip = svY(h, dZ), L = by - tip, a = lean * Math.PI / 180, w0 = 15 * mZ, sg = Math.sign(lean || 1);
      const edge = (side, frac) => { const pts = []; for (let j = 0; j <= 14; j++) { const u = j / 14, bow = Math.sin(Math.PI * u * 0.9) * 7 * mZ * sg, cx = bx + Math.sin(a) * L * u + bow, w = w0 * Math.pow(1 - u, 0.8) * frac; pts.push([cx + side * w, by - L * u]); } return pts; };
      return new P(edge(-sg, 1).concat(edge(sg, 0.45).reverse()), true);
    });
    // the Saadiyat Grove blocks in front of the museum's mound (opening Q4 2026; heights about G+8)
    const dS = 2800, mS = k(dS);
    this.grove = [];
    for (let x = svX(107);;) {
      const w = (28 + r() * 36) * mS, h = 24 + r() * 14;
      if (x > svX(115)) break;
      this.grove.push({ p: new P([[x, svY(3, dS)], [x, svY(h, dS)], [x + w, svY(h, dS)], [x + w, svY(3, dS)]], true), x, w, top: svY(h, dS) });
      x += w * (0.8 + r() * 0.3);
    }
    // the Abrahamic Family House: three equal cubes on their plinth, behind the Louvre's left side
    const dA = 3210, cA = svX(118.2), mA = k(dA), s = 30 * mA;
    this.afh = [-1, 0, 1].map(j => new P([[cA + j * 1.6 * s - s / 2, svY(4, dA)], [cA + j * 1.6 * s - s / 2, svY(34, dA)], [cA + j * 1.6 * s + s / 2, svY(34, dA)], [cA + j * 1.6 * s + s / 2, svY(4, dA)]], true));
    // the Louvre: the low white galleries across the 300 m museum city, then the dome's lens over them
    const dL = 2390, cL = svX(119.8), mL = k(dL);
    this.lBlocks = [];
    for (let x = cL - 150 * mL; x < cL + 150 * mL;) {
      const w = (10 + r() * 22) * mL, h = 9 + r() * 8;
      this.lBlocks.push(new P([[x, svY(4, dL)], [x, svY(h, dL)], [x + w, svY(h, dL)], [x + w, svY(4, dL)]], true));
      x += w * (0.9 + r() * 0.3);
    }
    const R = 90 * mL, yRim = svY(18, dL), yRimTop = svY(20.5, dL), yCrown = svY(40, dL), lens = [];
    for (let j = 0; j <= 40; j++) { const u = -1 + 2 * j / 40; lens.push([cL + R * u, yRimTop - (yRimTop - yCrown) * (1 - u * u)]); }
    this.dome = new P(lens.concat([[cL + R, yRim], [cL - R, yRim]]), true);
    this.domeArc = new P(lens);
    this.rim = new P([[cL - R, yRim], [cL + R, yRim]]);
    this.platform = new P([[cL - 160 * mL, svY(4, dL)], [cL + 160 * mL, svY(4, dL)]]);
    // the Natural History Museum and the bridge's Saadiyat end at the right edge, low and faint through the rain
    const dN = 3000, mN = k(dN);
    this.nhm = [[svX(123.2), 26], [svX(124.6), 20]].map(([x, h]) => new P([[x, svY(3, dN)], [x, svY(h, dN)], [x + 55 * mN, svY(h - 4, dN)], [x + 90 * mN, svY(3, dN)]], true));
    this.bridge = new P([[svX(123.2), svY(16, 3650)], [2000, svY(16, 3650)]]);
    this.shore = new P([[-20, SV.yE + 4.5], [1940, SV.yE + 4.5]]);
    // the sea: strokes closing up toward the shore; rain rings near the boat
    this.sea = [];
    for (let row = 0; row < 40; row++) {
      const d = row / 39, y = SV.yE + 8 + 352 * Math.pow(d, 2.0);
      let x = -20 + r() * 40;
      while (x < 1940) { const len = 12 + 110 * d * (0.4 + r()), x1 = Math.min(1940, x + len); this.sea.push({ p: new P([[x, y + (r() - 0.5) * 1.5], [x1, y + (r() - 0.5) * 1.5]]), w: 0.6 + 0.8 * d, a: 0.2 + 0.3 * d }); x = x1 + 6 + 30 * (1 - d) * r() + 12 * d; }
    }
    this.rings = Array.from({ length: 70 }, () => ({ x: r() * 1920, y: 820 + r() * 250, ph: r() * 1.2 }));
    this.drops = Array.from({ length: 900 }, () => ({ x: -120 + r() * 2160, ph: r(), v: 900 + r() * 500, len: 26 + r() * 70, a: 0.1 + r() * 0.16 }));
    this.sky = Array.from({ length: 40 }, (_, i) => ({ y: 40 + i * 12 + r() * 4, seg: Array.from({ length: 3 }, () => [r() * 1920, 300 + r() * 700]) }));
  },
  draw(lt) {
    const q = easeInOut(prog(lt, 0.1, 1.2)), ease = 1 - 0.6 * easeInOut(prog(lt, 10.5, 5.0)); // the rain eases at the end
    // the cloud base above the frame, as a weather chart shades a rain area: horizontal hatching, lightening as it clears
    this.sky.forEach((s, i) => {
      const a = 0.16 * (1 - i / 40) * (0.55 + 0.45 * ease) * q;
      s.seg.forEach(([x, len]) => stroke(new P([[x, s.y], [x + len, s.y + 1.5]]), 1, SEPIA, 0.9, a));
    });
    // the far shore and the museums, farthest first, each masked so the ones in front hide the ones behind
    const bq = easeOut(prog(lt, 0.3, 1.2));
    this.zWings.forEach(w => { mask(w); hatch(w, [940, 560, 1150, 700], -1.45, 4.2, bq, SEPIA, 0.55, 0.16, 441); stroke(w, bq, INK, 1.1, 0.85); });
    this.grove.forEach(g => { mask(g.p); hatch(g.p, [g.x, g.top, g.x + g.w, 725], 0, 3.4, bq, SEPIA, 0.6, 0.2, 442); stroke(g.p, bq, INK, 0.8, 0.55); });
    this.afh.forEach(c => { mask(c); stroke(c, bq, INK, 0.8, 0.5); });
    this.lBlocks.forEach(b => { mask(b); stroke(b, bq, INK, 0.8, 0.6); });
    mask(this.dome);
    hatch(this.dome, [1380, 650, 1730, 700], 0.52, 3.0, bq, INK, 0.6, 0.24, 443);
    hatch(this.dome, [1380, 650, 1730, 700], -0.52, 3.0, bq, INK, 0.6, 0.2, 444); // the lattice of its eight layers, as texture
    stroke(this.domeArc, bq, INK, 1.4, 0.9); stroke(this.rim, bq, INK, 1.6, 0.9); stroke(this.platform, bq, INK, 0.9, 0.6);
    this.gCones.forEach(c => { mask(c.body); hatch(c.body, [60, 540, 720, 720], c.dark ? 0.4 : 1.5, c.dark ? 2.4 : 3.8, bq, INK, 0.6, c.dark ? 0.36 : 0.2, 446); stroke(c.body, bq, INK, 1.0, 0.8); stroke(c.mouth, bq, INK, 1.1, 0.85); });
    this.gBlocks.forEach(b => { mask(b); hatch(b, [60, 650, 700, 725], 0, 3.2, bq, SEPIA, 0.6, 0.22, 445); stroke(b, bq, INK, 0.8, 0.6); });
    this.nhm.forEach(n => { mask(n); stroke(n, bq, INK, 0.7, 0.35); });
    stroke(this.bridge, bq, INK, 1.0, 0.35);
    stroke(this.shore, q, INK, 1.1, 0.6);
    // the sea, and rain rings on it near the boat
    const sw = easeOut(prog(lt, 0.2, 1.4));
    this.sea.forEach(s => stroke(s.p, sw, BLUE, s.w, s.a));
    this.rings.forEach((g, i) => { const u = ((lt * 0.8 + g.ph) % 1.2) / 1.2, rr = 2 + 12 * u; stroke(el(g.x, g.y, rr, rr * 0.28, 0, TAU, 450 + i, 0), 1, BLUE, 0.8, 0.45 * (1 - u) * ease * sw); });
    // the captions under each museum, on paper, never under the rain
    const cap = [[svX(103.2), 'متحف جوجنهايم أبوظبي', 'GUGGENHEIM ABU DHABI', 1.6], [svX(112.2), 'متحف زايد الوطني', 'ZAYED NATIONAL MUSEUM', 2.1], [svX(119.8), 'متحف اللوفر أبوظبي', 'LOUVRE ABU DHABI', 2.6]];
    const patches = [];
    cap.forEach(([x, ar, en, t0]) => {
      const cq = easeOut(prog(lt, t0, 0.6)) * clamp((15.6 - lt) / 0.35);
      if (cq <= 0) return;
      const w = Math.max(textWidth(ar, `600 22px ${F_KUFI}`, 0, 'rtl'), textWidth(en, `600 13px ${F_MONO}`, 2) + 2 * en.length) + 24;
      patches.push([x - w / 2, 752, w, 58]);
      ctx.save(); PAPER_PAT.setTransform(ctx.getTransform().inverse()); ctx.globalAlpha = SA * 0.95 * cq; ctx.fillStyle = PAPER_PAT; ctx.fillRect(x - w / 2, 752, w, 58); ctx.restore();
      smallAr(ar, x, 776, cq, { size: 22, align: 'center', weight: 600, a: 0.88 });
      small(en, x, 800, cq, { size: 13, ls: 2, align: 'center', weight: 600, a: 0.7 });
    });
    // the rain: fine slanted strokes falling across everything, kept off the words and the captions
    ctx.save();
    const m = ctx.getTransform(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.beginPath(); ctx.rect(0, 0, W, H);
    [[1270, 282, 600, 110], [1400, 430, 470, 185]].forEach(([x, y, w, h]) => ctx.rect(x, y + h, w, -h)); // the words' column (screen space)
    ctx.setTransform(m);
    patches.forEach(([x, y, w, h]) => ctx.rect(x, y + h, w, -h));
    ctx.clip('evenodd');
    ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = 0.9;
    const rq = easeOut(prog(lt, 0.4, 1.4)) * ease;
    this.drops.forEach(d => {
      const span = 1180, y = -60 + ((d.ph * span + lt * d.v) % span), x = d.x - (y + 60) * 0.18;
      ctx.globalAlpha = SA * d.a * rq;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - d.len * 0.18, y - d.len); ctx.stroke();
    });
    ctx.restore();
  },
});
