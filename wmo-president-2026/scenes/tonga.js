'use strict';
// Plate · Nukuʻalofa, Tonga, 16 September 2026, 10:52 local time (UTC+13): the morning of the Fourth Pacific Meteorological
// Ministers Meeting. From the sea wall of the waterfront west of the harbour, looking east-north-east over the reef flat and
// the harbour's deep water to the low islets of the northern lagoon, under the cumulus that stood over the Piha Passage reefs
// that morning. True 3D (engrave3d.js): metres, x east, y north, z up from mean sea level, the origin at the eye's foot.
//   the eye: 21.1268 S 175.2087 W (the shoreline there in Sentinel-2), 5 m above mean sea level (standing on the sea wall),
//     looking 074 deg true, level, f = 900 (a 57 deg field across the plate), the lens shifted so the horizon lies at 340.
//     The earth's curve with standard refraction (k = 0.13) lowers every far point; the sea horizon is 8.6 km off.
//   the hour: 10:52, when Sentinel-2C imaged the lagoon (2026-09-15T21:51:49Z). The sun (NOAA algorithm, checked against
//     the image's own metadata, 50.1 and 54.8 deg): azimuth 49.9 deg, 55.1 deg up, ahead and to the left, above the plate;
//     the islets, the cloud and the palm are seen against the light, and the water shines toward the lower left.
//   the islets (data/tonga.js, from Sentinel-2 of 19 Aug 2025): Fafa (6.6 km, 048-052 deg), an islet of the Monūafe-ʻOnevai
//     reef (8.7 km, 056-060), the islet at 10.5 km (064-068, very probably ʻOnevai), Makahaʻa (5.7 km, 075-079) and
//     Pangaimotu (5.0 km, 083-090), with the islets of its reef beyond (ʻOneata). Their canopy is drawn 10 m high and their
//     coconut palms 15-24 m (assumed: no height is in the data), so the palms make their skylines, 2-4 px high.
//   the reef flat, its edge (400 m off at the left, 1.3 km at the right) and the shoals beyond, from the same image. The
//     tide was higher on 16 Sep than on 19 Aug 2025 (Sentinel-2 of the day shows the islets' sand flats and the Monūafe
//     bank covered), so the flat is drawn under water.
//   the cloud: the cumulus of the image of the day itself, at their true bearings and distances (k-means puffs of the
//     cloud's pixels), bases at 0.9 km (GFS 2 m T/Td gives an LCL of 0.95 km; the small clouds' shadows give 0.6-0.9 km),
//     the big cluster built up to about 1.8 km (its shadow lies 0.8-1 km to the south-west). Elsewhere the sky was clear
//     (0.6% cloud on the tile); clouds too small to read as cloud on the plate (under 16 px) are left out.
//   the wind: GFS (15 Sep 18Z, 3 h): 7.2 m/s from 129 deg at 10 m, 5.8 m/s from 122 deg at 925 hPa: the cumulus drift to
//     the west-north-west (right to left here, about 9 px in the 17 s) and the palm streams toward 309 deg.
// Life: the small waves of the south-east trade (a short fetch over the harbour: about 0.3 m, 2.5 s) spill along the reef
// edge in sets, peeling from right to left as they run obliquely along it; a fisherman paddles a paopao (a dugout with a
// single outrigger float to port on two straight booms, after Te Rangi Hīroa's account of the West Polynesian paopao) slowly
// across the flat, right to left; the palm's fronds stream and lift in the trade; the cloud drifts. Nothing else in the sky.
// The print (lt 9.4 on) covers x 581-925, y 367-609: the canoe stays left of x 330, the breakers at y 343-352 and the palm
// and the cloud above y 250 stay clear of it.
// Not drawn: the town, the harbour, any building (none is in this field of view), people's faces.
const TGP = (() => {
  const D = TONGA_DATA, rad = Math.PI / 180;
  const RE = 6371000 / (1 - 0.13), EYE = 5, HEAD = 74, F = 900, CY = 340;
  const SUN_AZ = 49.9, SUN_ALT = 55.1;
  const drop = (x, y) => (x * x + y * y) / (2 * RE);
  const W3 = (x, y, z) => [x, y, z - drop(x, y)]; // lowered by the earth's curve (with refraction)
  const pr = (x, y, z) => E3.proj(W3(x, y, z));
  const dirB = b => [Math.sin(b * rad), Math.cos(b * rad)];
  const atB = (b, d, z = 0) => [Math.sin(b * rad) * d, Math.cos(b * rad) * d, z];
  const HZ = CY + F * Math.sqrt(2 * EYE / RE); // the sea horizon on the plate
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mixc = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
  const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // value noise (for the bottom's patches)
  const hsh = (i, j, s) => { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(s, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function noise(x, y, s = 1) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return lerp(lerp(hsh(i, j, s), hsh(i + 1, j, s), u), lerp(hsh(i, j + 1, s), hsh(i + 1, j + 1, s), u), v);
  }
  const S = {}; // the plate's precomputed state
  function camera() {
    const h = HEAD * rad;
    E3.camera([0, 0, EYE], [Math.sin(h) * 1000, Math.cos(h) * 1000, EYE], F, PW / 2, CY);
  }
  // the sea point under a plate pixel: [x, y, horizontal distance], or null above the horizon
  function ground(px, py) {
    const C = E3.cam(), d = [0, 1, 2].map(i => C.F[i] + C.R[i] * (px - C.cx) / C.f - C.U[i] * (py - C.cy) / C.f);
    const hl = Math.hypot(d[0], d[1]), tn = -d[2] / hl, disc = tn * tn - 2 * EYE / RE;
    if (tn <= 0 || disc < 0) return null;
    const s = RE * (tn - Math.sqrt(disc));
    return [d[0] / hl * s, d[1] / hl * s, s];
  }
  const bearing = (x, y) => (Math.atan2(x, y) / rad + 360) % 360;
  // the reef flat's edge (m) along a bearing, and its bottom (0 dark, 1 mixed, 2 sand) at a distance, interpolated
  function edgeAt(b) {
    const E = D.flat.edge, u = clamp((b - D.flat.b0) / D.flat.db, 0, E.length - 1.001), i = Math.floor(u);
    return lerp(E[i], E[i + 1], u - i);
  }
  function bottomAt(b, s) {
    const Bt = D.flat.bottom, u = clamp((b - D.flat.b0) / D.flat.db, 0, Bt.length - 1.001), i = Math.floor(u), f = u - i;
    const cell = (row, s) => { const k = clamp(s / 20 - 0.5, 0, row.length - 1.001), j = Math.floor(k), g = k - j; const a = +row[j] || 0, c = +(row[j + 1] ?? row[j]) || 0; return lerp(a, c, g); };
    return lerp(cell(Bt[i], s), cell(Bt[i + 1], s), f);
  }

  function init() {
    camera();
    const r = rng(1609);
    // ---- the clouds. A cloud of many puffs (the big cluster) is built as cumulus mediocris: a column of turrets on each
    // puff, taller toward its middle; a small one as cumulus humilis: a few low turrets spread over its footprint
    const BASE = 900;
    S.clouds = D.clouds.map(c => {
      const n = c.puffs.length, cx = c.puffs.reduce((s, p) => s + p[0], 0) / n, cy = c.puffs.reduce((s, p) => s + p[1], 0) / n;
      const ext = Math.max(60, ...c.puffs.map(p => Math.hypot(p[0] - cx, p[1] - cy) + p[2]));
      const tur = [], add = (x, y, z, R) => tur.push({ x, y, z, R, ph: r() * TAU, bumps: 5 + Math.floor(r() * 4) });
      if (n > 4) {
        c.puffs.forEach(([x, y, rr]) => {
          const R = rr * 1.5, central = 1 - clamp(Math.hypot(x - cx, y - cy) / ext);
          const tiers = 1 + Math.round(0.6 + 3.0 * central * central + r() * 0.8);
          for (let k = 0; k < tiers; k++) {
            const Rk = R * (1 - 0.12 * k) * (0.85 + 0.3 * r()), tx = x + (r() - 0.5) * R * 0.6, ty = y + (r() - 0.5) * R * 0.6, tz = BASE + Rk * (0.7 + 1.15 * k);
            add(tx, ty, tz, Rk);
            // the cauliflower: smaller bulges budding on the turret's upper rim
            if (k === tiers - 1 || r() < 0.4) for (let m = 0; m < 2 + Math.floor(r() * 2); m++) { const a = r() * TAU, e = 0.35 + r() * 0.5; add(tx + Math.cos(a) * Rk * 0.55 * Math.cos(e), ty + Math.sin(a) * Rk * 0.55 * Math.cos(e), tz + Rk * 0.6 * Math.sin(e) + Rk * 0.15, Rk * (0.38 + 0.18 * r())); }
          }
        });
      } else {
        c.puffs.forEach(([x, y, rr]) => {
          const m = 4 + Math.floor(r() * 3), ax = r() * TAU;
          for (let k = 0; k < m; k++) {
            const u = (k / (m - 1) - 0.5) * 1.7, R = rr * (0.5 - 0.18 * Math.abs(u)) * (0.85 + 0.3 * r());
            add(x + Math.cos(ax) * u * rr, y + Math.sin(ax) * u * rr, BASE + R * 0.5, R);
          }
          if (rr > 55) add(x + (r() - 0.5) * rr * 0.4, y, BASE + rr * 0.62, rr * 0.4);
        });
      }
      return { id: c.id, cx, cy, base: BASE, tur, d: Math.hypot(cx, cy), big: n > 4 };
    }).sort((a, b) => b.d - a.d);
    // ---- the islets: the canopy's outline per 0.1 deg and the palms that stand out of it
    S.islets = Object.entries(D.islets).map(([name, I]) => {
      const cols = [];
      I.near.forEach((n, i) => { if (n > 0) cols.push({ b: I.b0 + i * 0.1, n, f: I.far[i], t: I.tree[i] }); });
      const palms = [];
      for (let k = 0; k < I.trees.length; k += 2) {
        if (r() > 0.45) continue;
        palms.push({ x: I.trees[k], y: I.trees[k + 1], h: 15 + r() * 9, lean: (r() - 0.5) * 0.5, la: r() * TAU, cr: 3.6 + r() * 1.4, ph: r() * TAU });
      }
      palms.sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y));
      return { name, cols, palms, d: Math.min(...cols.map(c => c.n)) };
    }).sort((a, b) => b.d - a.d);
    // ---- the shoals beyond the flat (ring reefs, the islets' reef flats): slivers along each bearing
    S.shoals = [];
    D.shoals.iv.forEach((iv, i) => {
      const b = D.shoals.b0 + i * D.shoals.db;
      for (let k = 0; k < iv.length; k += 2) S.shoals.push({ b, d0: iv[k] * 10, d1: iv[k + 1] * 10 });
    });
    // ---- the water's colour: one soft wash image (half the plate's resolution) from the bottom (Sentinel-2, with patches of
    // seagrass, sand and coral at the scale the eye sees them near), the sky it mirrors (more as the view grazes it), the
    // deep water beyond the reef, and the sheen toward the sun
    const sc = 2, w = Math.ceil(PW / sc), y0 = Math.floor(HZ) - 1, h = Math.ceil((PH - y0) / sc);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'), img = g.createImageData(w, h);
    const SAND = hex('#4CC7C1'), MIX = hex('#2D9D9B'), GRASS = hex('#2A6E5C'), DEEP = hex('#12558F'), SKYR = hex('#86B6DD'), EDGE = hex('#1FA6B6'), GLARE = hex('#D8E8EC');
    const sunX = PW / 2 + F * Math.tan((SUN_AZ - HEAD) * rad);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const px = i * sc + sc / 2, py = y0 + j * sc + sc / 2, gp = ground(px, py), o = (j * w + i) * 4;
      if (!gp) { img.data[o + 3] = 0; continue; }
      const [x, y, s] = gp, b = bearing(x, y), e = edgeAt(b);
      const dep = Math.atan2(EYE, s) / rad, refl = clamp(0.42 * Math.exp(-dep / 4) + 0.05);
      let col, a;
      if (s > e + 25) { // the harbour's deep water, paling toward the horizon where it mirrors the sky
        col = mixc(DEEP, SKYR, 0.75 * Math.pow(clamp((s - e) / 7500), 0.7)); a = 0.72;
      } else if (s > e - 40) { // the drop-off: clear turquoise over the reef front
        const u = (s - e + 40) / 65; col = mixc(EDGE, DEEP, clamp(u * 1.3 - 0.3)); a = 0.66;
      } else {
        let v = bottomAt(b, s) + 1.0 * (noise(x / 7, y / 7, 3) - 0.5) + 0.5 * (noise(x / 2.4, y / 2.4, 5) - 0.5);
        if (s < 120) v += 0.3 * (noise(x / 0.9, y / 0.9, 9) - 0.5);
        col = v < 0.45 ? GRASS : v < 1.35 ? mixc(GRASS, MIX, (v - 0.45) / 0.9) : mixc(MIX, SAND, clamp((v - 1.35) / 0.55));
        col = mixc(col, SKYR, refl); a = lerp(0.64, 0.5, refl);
      }
      const glare = Math.exp(-Math.pow((px - sunX) / 330, 2) - Math.pow((PH - py) / 300, 2)) * 0.5;
      col = mixc(col, GLARE, glare); a *= 1 - 0.35 * glare;
      img.data[o] = 255 - a * (255 - col[0]); img.data[o + 1] = 255 - a * (255 - col[1]); img.data[o + 2] = 255 - a * (255 - col[2]); img.data[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    S.waterImg = { cv, x: 0, y: y0, w: w * sc, h: h * sc };
    S.sunX = sunX;
    // ---- the water's engraved strokes: marks fixed on the sea (laid out in rows from the horizon down, then projected each
    // frame so the waves run through them), drawn along 195 deg, between the camera's cross-line and the waves' crests
    S.sea = [];
    const sd = dirB(195);
    let yy = HZ + 0.7;
    while (yy < PH + 2) {
      const u = (yy - HZ) / (PH - HZ), gap = 1.1 + 6.8 * Math.pow(u, 1.15);
      let x = r() * 22;
      while (x < PW) {
        const len = 3 + r() * (7 + 26 * u) * (0.6 + 0.8 * r()), gg = 2 + r() * (9 + 40 * u), gp = ground(x + len / 2, yy);
        if (gp) { const b = bearing(gp[0], gp[1]), k = Math.abs(Math.sin((195 - b) * rad)) || 0.5; S.sea.push([gp[0], gp[1], len / 2 * gp[2] / (F * k), r(), gp[2]]); }
        x += len + gg;
      }
      yy += gap * (0.75 + 0.5 * r());
    }
    S.sd = sd;
    // ---- the reef edge, as a line along the bearings in view, with its length measured along it (for the sets)
    S.edge = [];
    let acc = 0, prev = null;
    for (let b = 42; b <= 105; b += 0.25) {
      const p = atB(b, edgeAt(b));
      if (prev) acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      S.edge.push({ b, p, s: acc }); prev = p;
    }
    // ---- the palm on the sea wall, 40 m along the shore to the right (the wall runs 108.7/288.7 deg here), leaning seaward
    // (018.7 deg) and curving up at its crown; 26 leaves, the youngest upright, the oldest hanging, one or two dead
    const sh = dirB(108.7), lean = dirB(18.7), base = [sh[0] * 40, sh[1] * 40, 3.0];
    const tr = [[0, 0], [3.4, 5.0], [7.6, 8.5], [9.0, 11.0]].map(([hh, z]) => [base[0] + lean[0] * hh, base[1] + lean[1] * hh, base[2] + z]);
    S.palm = { base, crown: [tr[3][0], tr[3][1], tr[3][2] + 0.25] };
    S.palm.trunk = Array.from({ length: 31 }, (_, i) => { const t = i / 30, u = 1 - t; return [0, 1, 2].map(k => u * u * u * tr[0][k] + 3 * u * u * t * tr[1][k] + 3 * u * t * t * tr[2][k] + t * t * t * tr[3][k]); });
    const fr = [], NF = 26;
    for (let k = 0; k < NF; k++) {
      const age = k / (NF - 1); // 0 the youngest (top), 1 the oldest (lowest)
      fr.push({ az: (k * 137.508 + 20) % 360, el: lerp(68, -22, Math.pow(age, 0.85)) + (r() - 0.5) * 10, L: lerp(3.4, 5.4, Math.min(1, age * 1.7)) * (0.92 + 0.16 * r()),
        sag: lerp(0.45, 1.45, Math.pow(age, 0.8)) * (0.85 + 0.3 * r()), ph: r() * TAU, dead: age > 0.9 && r() < 0.6, droop: lerp(38, 62, age) });
    }
    S.palm.fronds = fr;
    S.palm.nuts = Array.from({ length: 12 }, () => ({ a: r() * TAU, rr: 0.22 + r() * 0.2, z: -0.3 - r() * 0.45 }));
    // ---- the canoe: from 40 m off at 062 deg to 047.5 deg over the beat, heading 315 deg (right to left, its outrigger,
    // to port, on the side toward the eye), at 0.57 m/s, a slow paddle
    S.canoe = { p0: atB(62.3, 40.5), hd: 315, v: 0.57 };
  }

  // ---------------------------------------------------------------------------------------------------- drawing
  function skyWash() {
    washFade([0, -4, PW, HZ + 1], [[0, '#2C6FBE', 0.72], [0.3, '#4C8ECF', 0.6], [0.7, HUE.sky, 0.44], [0.92, HUE.sky, 0.3], [1, HUE.cloud, 0.16]], 0, 1);
    // the sky deepens away from the sun (the sun is up and to the left, beyond the plate)
    washGrad([0, -4, PW, HZ], [0, 0], [PW, 0], [[0, '#2C6FBE', 0], [0.55, '#2C6FBE', 0.06], [1, '#2C6FBE', 0.2]], 1);
  }
  function skyRules() {
    let y = 1.2, k = 0;
    while (y < HZ - 1.5) {
      const u = y / HZ, a = (OPT.colour ? 0.14 : 0.3) * (1 - 0.7 * u);
      stroke(pl([[0, y], [PW, y]], false, 4100 + k, 0.3), 1, OPT.colour ? '#1B4F86' : BLUE, 0.55, a);
      y += 2.6 + 6.0 * u * u; k++;
    }
  }
  // a turret's outline points: a circle with a few soft bulges, a little flattened
  function turretPts(x, y, rr, n, ph) {
    const pts = [];
    for (let j = 0; j < 56; j++) { const a = j / 56 * TAU, q = rr * (1 + 0.075 * Math.pow(Math.abs(Math.sin(n * a / 2 + ph)), 0.7) - 0.04); pts.push([x + q * Math.cos(a), y + q * 0.93 * Math.sin(a)]); }
    return pts;
  }
  const inside = (p, o, k = 0.985) => { const dx = p[0] - o.p[0], dy = (p[1] - o.p[1]) / 0.93; return dx * dx + dy * dy < (o.rr * k) * (o.rr * k); };
  function drawClouds(lt) {
    const wind = [-4.92, 3.07], tt = lt - 8.5; // 5.8 m/s from 122 deg; the image was taken about lt 8.5
    const sunP = E3.projDir(E3.sun());
    S.clouds.forEach(c => {
      const ox = wind[0] * tt, oy = wind[1] * tt;
      let items = c.tur.map(T => {
        const grow = 1 + 0.03 * Math.sin(lt * 0.19 + T.ph);
        const q = W3(T.x + ox, T.y + oy, T.z), d = E3.depth(q);
        return { T, p: E3.proj(q), d, rr: F * T.R * grow / d };
      }).filter(o => o.d > 10);
      if (!items.length) return;
      const x0 = Math.min(...items.map(o => o.p[0] - o.rr)), x1 = Math.max(...items.map(o => o.p[0] + o.rr));
      if (x1 - x0 < 16 || x1 < 0 || x0 > PW) return; // too small to read as a cloud on the plate
      const air = R11.air(c.d, 30000), yb = pr(c.cx + ox, c.cy + oy, c.base)[1], small = x1 - x0 < 45;
      // far to near; at one depth, the higher turrets first, so the lower ones overlap their feet
      items.sort((a, b) => (b.d - a.d) || (b.T.z - a.T.z));
      items.forEach(o => { o.pts = turretPts(o.p[0], o.p[1], o.rr, o.T.bumps, o.T.ph); o.path = new P(o.pts, true); });
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, -60, x1 - x0 + 40, yb + 60); ctx.clip();
      items.forEach((o, i) => {
        const { p, rr, path } = o;
        mask(path);
        // the light comes from above and a little left (the sun's point on the plate): each turret keeps a lit rim toward it
        // and turns grey-blue away from it, as cumulus do against the light
        const ux = sunP ? sunP[0] - p[0] : 0, uy = sunP ? sunP[1] - p[1] : -1, ul = Math.hypot(ux, uy) || 1, sx = ux / ul, sy = uy / ul;
        ctx.save(); ctx.beginPath(); path.trace(ctx, 1); ctx.clip();
        ctx.beginPath(); ctx.rect(p[0] - 3 * rr, p[1] - 3 * rr, 6 * rr, 6 * rr); ctx.arc(p[0] + sx * rr * 0.38, p[1] + sy * rr * 0.38, rr * 1.0, 0, TAU, true); ctx.clip('evenodd');
        if (OPT.colour) { ctx.globalAlpha = SA * (small ? 0.22 : 0.3) * air; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#A3B6CF'; ctx.fillRect(p[0] - rr, p[1] - rr, 2 * rr, 2 * rr); }
        if (!small) {
          ctx.globalAlpha = SA * 0.17 * air; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.55; ctx.beginPath();
          for (let yy = p[1] - rr; yy < p[1] + rr; yy += 2.0) { ctx.moveTo(p[0] - rr, yy); ctx.lineTo(p[0] + rr, yy); }
          ctx.stroke();
        }
        // the deeper shade low in the turret, away from the light
        ctx.beginPath(); ctx.rect(p[0] - 3 * rr, p[1] - 3 * rr, 6 * rr, 6 * rr); ctx.arc(p[0] + sx * rr * 0.9, p[1] + sy * rr * 0.9, rr * 1.12, 0, TAU, true); ctx.clip('evenodd');
        if (OPT.colour) { ctx.globalAlpha = SA * 0.2 * air; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#8C9FBA'; ctx.fillRect(p[0] - rr, p[1] - rr, 2 * rr, 2 * rr); }
        if (!small) {
          ctx.globalAlpha = SA * 0.13 * air; ctx.globalCompositeOperation = BLEND; ctx.beginPath();
          for (let yy = p[1] - rr; yy < p[1] + rr; yy += 2.4) { ctx.moveTo(p[0] - rr, yy + rr * 0.25); ctx.lineTo(p[0] + rr, yy - rr * 0.25); }
          ctx.stroke();
        }
        ctx.restore();
        // the outline: the silhouette where no other turret covers it, and the fold where it lies over a turret behind it
        const runs = [], folds = [];
        let cur = null, curF = null;
        o.pts.concat([o.pts[0]]).forEach(q => {
          const front = items.slice(i + 1).some(m => inside(q, m)), back = items.slice(0, i).some(m => inside(q, m));
          if (!front && !back) { if (!cur) { cur = []; runs.push(cur); } cur.push(q); } else cur = null;
          if (!front && back) { if (!curF) { curF = []; folds.push(curF); } curF.push(q); } else curF = null;
        });
        o.runs = runs; o.folds = folds;
      });
      items.forEach(o => {
        o.runs.forEach(rn => { if (rn.length > 1) stroke(new P(rn), 1, INK, small ? 0.5 : 0.75, (small ? 0.22 : 0.48) * air); });
        o.folds.forEach(rn => { if (rn.length > 2) stroke(new P(rn), 1, INK, 0.55, (small ? 0.12 : 0.26) * air); });
      });
      ctx.restore();
      // the flat base, blue-grey in its own shade
      const xs = items.filter(o => o.p[1] + o.rr > yb).map(o => { const hh = Math.sqrt(Math.max(0, o.rr * o.rr - ((yb - o.p[1]) / 0.93) ** 2)); return [o.p[0] - hh, o.p[0] + hh]; });
      if (xs.length) {
        const a0 = Math.min(...xs.map(v => v[0])), a1 = Math.max(...xs.map(v => v[1])), bh = Math.max(2.5, (yb - Math.min(...items.map(o => o.p[1] - o.rr))) * 0.18);
        const clipU = items.map(o => o.path);
        if (OPT.colour) washFade([a0, yb - bh, a1, yb + 0.5], [[0, '#8FA3BE', 0], [1, '#6E83A0', (small ? 0.3 : 0.45) * air]], 0, 1, clipU);
        if (!small) hatch(clipU, [a0, yb - bh, a1, yb], 0, 1.8, 1, INK, 0.5, 0.16 * air, 4300 + c.id);
        stroke(new P([[a0 + 1.5, yb], [a1 - 1.5, yb]]), 1, INK, small ? 0.5 : 0.75, (small ? 0.2 : 0.4) * air);
      }
    });
  }
  // the water: its colour, then the engraved strokes with the waves running through them
  function waterColour() {
    if (!OPT.colour) return;
    const Wm = S.waterImg;
    ctx.save(); ctx.globalAlpha = SA; ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true;
    ctx.drawImage(Wm.cv, Wm.x, Wm.y, Wm.w, Wm.h); ctx.restore();
  }
  function seaStrokes(lt) {
    // the trade's waves run toward 305 deg (6.2 m, 2.4 s), with a shorter chop across them. Far off the marks are short
    // dashes; nearer they are the ripples' crests, little arcs that gather in the troughs and leave the crests open
    const wk = TAU / 6.2, dir = dirB(305), om = TAU / 2.4, wk2 = TAU / 3.4, dir2 = dirB(265), om2 = TAU / 1.6;
    const sd = S.sd, deep = [], flat = [];
    S.sea.forEach(([x, y, h, ph, s]) => {
      const a0 = W3(x - sd[0] * h, y - sd[1] * h, 0), b0 = W3(x + sd[0] * h, y + sd[1] * h, 0);
      const sw = 0.5 + 0.5 * Math.cos(wk * (dir[0] * x + dir[1] * y) - om * lt + ph * 0.6);
      const sw2 = 0.5 + 0.5 * Math.cos(wk2 * (dir2[0] * x + dir2[1] * y) - om2 * lt + ph * 2.3);
      const b = bearing(x, y), onFlat = s < edgeAt(b) - 25, air = R11.air(s, 2600);
      const sp = E3.proj(W3(x, y, 0)), sheen = Math.exp(-Math.pow((sp[0] - S.sunX) / 320, 2) - Math.pow((PH - sp[1]) / 280, 2));
      const al = air * (0.05 + 0.95 * Math.pow(sw, 2.8)) * (0.55 + 0.45 * sw2) * (0.75 + 0.5 * ph) * (1 - 0.72 * sheen);
      (onFlat ? flat : deep).push([a0, b0, onFlat ? al * 0.85 : Math.min(1, al * 1.2), s]);
    });
    segs(deep, OPT.colour ? '#123F70' : BLUE, 0.85);
    arcs(flat, OPT.colour ? '#174F60' : BLUE);
  }
  // many short world segments in one stroke per alpha step (as JT.segs in the gala's jetty)
  function segs(list, col, lw, nb = 12) {
    const bands = Array.from({ length: nb }, () => []);
    list.forEach(([a, b, al]) => { if (al <= 0.02) return; const s = E3.clipSeg(a, b); if (s) bands[Math.min(nb - 1, Math.floor(al * nb))].push(s); });
    bands.forEach((g, k) => {
      if (!g.length) return;
      ctx.save(); ctx.globalAlpha = SA * (k + 0.5) / nb; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
      ctx.beginPath(); g.forEach(([p, q]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); ctx.restore();
    });
  }
  // the ripples on the flat: little arcs, heavier and more bowed the nearer they lie, in alpha steps and three weights
  function arcs(list, col, nb = 10) {
    const bands = Array.from({ length: nb * 3 }, () => []);
    list.forEach(([a, b, al, s]) => {
      if (al <= 0.03) return; const q = E3.clipSeg(a, b); if (!q) return;
      const wcl = s < 45 ? 2 : s < 140 ? 1 : 0;
      bands[wcl * nb + Math.min(nb - 1, Math.floor(al * nb))].push(q);
    });
    bands.forEach((g, k) => {
      if (!g.length) return;
      const wcl = Math.floor(k / nb), a = (k % nb + 0.5) / nb;
      ctx.save(); ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = [0.75, 0.95, 1.2][wcl]; ctx.lineCap = 'round';
      ctx.beginPath();
      g.forEach(([p, q]) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), bow = Math.min(2.2, L * 0.07); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - bow, q[0], q[1]); });
      ctx.stroke(); ctx.restore();
    });
  }
  // the shoals beyond the flat and the islets' reefs: turquoise slivers just under the horizon, a little surf on them
  function drawShoals(lt) {
    const db = D.shoals.db / 2;
    S.shoals.forEach(q => {
      const a = pr(...atB(q.b - db, q.d0)), b = pr(...atB(q.b + db, q.d0)), c = pr(...atB(q.b + db, q.d1)), d = pr(...atB(q.b - db, q.d1));
      if (a[0] > PW + 2 || b[0] < -2) return;
      const top = Math.min(c[1], d[1]), bot = Math.max(a[1], b[1]);
      const path = new P([[a[0], bot + 0.3], [b[0], bot + 0.3], [c[0], top - 0.2], [d[0], top - 0.2]], true);
      if (OPT.colour) wash(path, '#2FB3B2', 0.55);
      // white spilling on the reef's rim, in slow sets
      const set = 0.5 + 0.5 * Math.sin(lt * 0.5 - q.b * 0.9 + q.d0 * 0.004);
      if (set > 0.5) mask(new P([[d[0], top - 0.4], [c[0], top - 0.4], [c[0], top + 0.45], [d[0], top + 0.45]], true), (set - 0.5) / 0.5 * 0.75);
    });
  }
  function drawIslets(lt) {
    S.islets.forEach(I => {
      const cols = I.cols, air = R11.air(I.d, 9000);
      const runs = []; let cur = null;
      cols.forEach((c, i) => { if (!cur || c.b - cols[i - 1].b > 0.25) { cur = []; runs.push(cur); } cur.push(c); });
      runs.forEach(run => {
        if (run.length < 2) return;
        const top = run.map(c => pr(...atB(c.b, c.n + Math.min(25, (c.f - c.n) * 0.4), c.t > 0.45 ? 10 : c.t > 0.12 ? 6.5 : 2.2)));
        const sand = run.map(c => pr(...atB(c.b, c.n, 1.2)));
        const water = run.map(c => pr(...atB(c.b, c.n, -0.3)));
        const body = new P(top.concat(water.slice().reverse()), true);
        mask(body);
        if (OPT.colour) wash(body, '#355E3C', 0.66 * air + 0.12);
        hatch(body, [Math.min(...water.map(p => p[0])), Math.min(...top.map(p => p[1])) - 1, Math.max(...water.map(p => p[0])), Math.max(...water.map(p => p[1]))], 0, 1.0, 1, INK, 0.5, 0.5 * air);
        // the beach: a pale line at the waterline, lit by the high sun
        const beach = new P(sand.concat(water.slice().reverse()), true);
        mask(beach, 0.9);
        if (OPT.colour) wash(beach, HUE.sand, 0.22);
        stroke(new P(top), 1, INK, 0.6, 0.55 * air);
      });
      // the coconut palms standing out of the canopy: a trunk and a small crown of drooping fronds
      const sway = 0.4 * Math.sin(lt * 0.9), tr = [], cr = [];
      I.palms.forEach(pm => {
        const lx = Math.sin(pm.la) * pm.lean * pm.h, ly = Math.cos(pm.la) * pm.lean * pm.h, top = [pm.x + lx + sway * 0.3, pm.y + ly, pm.h];
        tr.push([W3(pm.x + lx * 0.45, pm.y + ly * 0.45, 8), W3(top[0], top[1], top[2]), 0.75]);
        for (let k = 0; k < 7; k++) {
          const a = pm.ph + k * TAU / 7, ex = top[0] + Math.sin(a) * pm.cr, ey = top[1] + Math.cos(a) * pm.cr;
          const mid = [top[0] + Math.sin(a) * pm.cr * 0.5, top[1] + Math.cos(a) * pm.cr * 0.5, top[2] + 0.9];
          cr.push([W3(top[0], top[1], top[2]), W3(mid[0], mid[1], mid[2]), 0.85], [W3(mid[0], mid[1], mid[2]), W3(ex, ey, top[2] - 1.8), 0.85]);
        }
      });
      segs(tr, OPT.colour ? '#2E3F2A' : INK, 0.5, 4);
      segs(cr, OPT.colour ? '#2B4A2A' : INK, 0.65, 4);
    });
  }
  function horizonLine() { stroke(new P([[0, HZ], [PW, HZ]]), 1, OPT.colour ? '#1E4F78' : INK, 0.65, 0.5); }
  // the reef edge and its breakers: a faint white line all along, and the sets peeling along it from right to left
  function drawEdge(lt) {
    const E = S.edge, n = E.length;
    const pts = E.map(e => pr(e.p[0], e.p[1], 0));
    // crests every 40 m along the reef, each breaking as it reaches the edge and leaving white water behind it (to its right);
    // they peel left at 16 m/s (a wave's 4.7 m/s, at 16 deg to the reef); larger waves come in groups every 9 s or so
    const v = 16, gap = 40, Tset = 9.3, foam = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const s = E[i].s, ph = (s + v * lt) / gap, k = Math.floor(ph), f = ph - k;
      const grp = 0.5 + 0.5 * Math.cos(TAU * (k * gap / v) / Tset + 0.8), size = 0.2 + 0.8 * Math.pow(grp, 1.6);
      const trail = Math.exp(-f / 0.34) * (1 - Math.exp(-f / 0.025)), wobb = 0.8 + 0.2 * noise(s / 23, k * 1.3, 21);
      foam[i] = clamp(0.16 + size * trail * wobb * 1.15);
    }
    for (let i = 0; i < n - 1; i++) {
      const a = pts[i], b = pts[i + 1], f = (foam[i] + foam[i + 1]) / 2;
      if ((a[0] < -4 && b[0] < -4) || (a[0] > PW + 4 && b[0] > PW + 4)) continue;
      const d = Math.hypot(E[i].p[0], E[i].p[1]), px = F / d; // px per metre at this distance
      const up = Math.max(0.5, 0.45 * px * f), dn = Math.max(0.9, (0.3 + 0.7 * f) * px * 1.3);
      // the breaker's face, in shade against the light, just under the white
      stroke(new P([[a[0], a[1] + dn + 0.2], [b[0], b[1] + dn + 0.2]]), 1, OPT.colour ? '#0F4A63' : INK, 0.7, 0.18 + 0.4 * f);
      // the white water (paper), its crest a little above the edge line, spreading in toward the eye
      mask(new P([[a[0], a[1] - up], [b[0], b[1] - up], [b[0], b[1] + dn], [a[0], a[1] + dn]], true), clamp(f * 1.2));
    }
    // the foam that the broken waves leave drifting in over the flat
    for (let i = 0; i < n - 1; i += 2) {
      const e = E[i], b = e.b, d0 = edgeAt(b);
      for (let k = 1; k <= 3; k++) {
        const dd = d0 - k * 24 - 6 * Math.sin(lt * 0.3 + i), fa = foam[i] * (0.55 - 0.13 * k) * (0.6 + 0.4 * noise(i * 0.3, k + lt * 0.08, 33));
        if (fa < 0.1) continue;
        const a = pr(...atB(b, dd)), c = pr(...atB(b + 0.5, dd + 3));
        mask(new P([[a[0], a[1]], [c[0], c[1]], [c[0], c[1] + 0.8], [a[0], a[1] + 0.8]], true), fa);
      }
    }
  }
  // ---- the canoe
  function canoeFrame(lt) {
    const C = S.canoe, h = dirB(C.hd), t = lt + 0.45;
    const cyc = 1.9, ps = ((t % cyc) + cyc) % cyc / cyc; // the paddle's cycle
    const surge = 0.05 * Math.sin(TAU * ps - 0.6); // the hull runs on a little at each pull
    const x = C.p0[0] + h[0] * (C.v * t + surge), y = C.p0[1] + h[1] * (C.v * t + surge);
    const bob = 0.025 * Math.sin(lt * 2.6) + 0.015 * Math.sin(lt * 1.7 + 1), roll = 0.012 * Math.sin(lt * 2.1 + 0.4);
    const U = [h[0], h[1]], V = [-h[1], h[0]]; // along the hull (bow), and to port (the outrigger's side)
    const L = (u, v, z) => [x + U[0] * u + V[0] * v, y + U[1] * u + V[1] * v, z + bob + roll * v];
    return { L, ps, x, y };
  }
  function drawCanoe(lt) {
    const { L, ps } = canoeFrame(lt), proj = p => E3.proj(p);
    const HL = 2.4, hb = u => 0.19 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u) / HL, 2.4)), 0.6), sheer = u => 0.25 + 0.14 * Math.pow(Math.abs(u) / HL, 4);
    const us = Array.from({ length: 17 }, (_, i) => lerp(-HL, HL, i / 16));
    const bbox = pts => [Math.min(...pts.map(p => p[0])) - 1, Math.min(...pts.map(p => p[1])) - 1, Math.max(...pts.map(p => p[0])) + 1, Math.max(...pts.map(p => p[1])) + 1];
    const FV = 1.35; // the float lies 1.35 m to port, parallel to the hull
    // the reflections of the hull and the float, broken by the ripples
    const rf = (u0, u1, v, z) => new P([L(u0, v, -0.01), L(u1, v, -0.01), L(u1, v, -z), L(u0, v, -z)].map(proj), true);
    if (OPT.colour) { wash(rf(-2.2, 2.2, 0.17, 0.26), '#1F4E60', 0.38); wash(rf(-1.05, 1.8, FV + 0.05, 0.1), '#1F4E60', 0.3); }
    else fill(rf(-2.2, 2.2, 0.17, 0.26), INK, 0.12);
    // the paddle's cycle: the pull (the blade in the water on the far side, from ahead of him to his hip), then the recovery
    const sx = -0.6, pull = ps < 0.6, q = pull ? ps / 0.6 : (ps - 0.6) / 0.4;
    const tip = pull ? L(lerp(sx + 0.75, sx - 0.35, q), -0.5, -0.32) : L(lerp(sx - 0.35, sx + 0.75, q), -0.55, 0.1 + 0.14 * Math.sin(Math.PI * q));
    const grip = pull ? L(lerp(sx + 0.4, sx + 0.05, q), 0.02, lerp(0.95, 0.8, q)) : L(lerp(sx + 0.05, sx + 0.4, q), 0.02, lerp(0.8, 0.95, q) + 0.04 * Math.sin(Math.PI * q));
    const at = k => [0, 1, 2].map(i => grip[i] + (tip[i] - grip[i]) * k), lowHand = at(0.42), bladeRoot = at(0.68);
    const lean = pull ? lerp(0.09, -0.03, q) : lerp(-0.03, 0.09, q);
    const skin = OPT.colour ? '#5E4332' : INK;
    // the hull's inside (dark), seen a little from above
    const gunN = us.map(u => proj(L(u, hb(u), sheer(u)))), gunF = us.map(u => proj(L(u, -hb(u), sheer(u)))), wl = us.map(u => proj(L(u, hb(u) * 0.8, 0)));
    const inner = new P(gunN.concat(gunF.slice().reverse()), true);
    mask(inner); if (OPT.colour) wash(inner, '#4A3A2A', 0.62); fill(inner, INK, 0.32);
    // the far arm to the paddle's lower hand, and the paddle: its shaft and leaf-shaped blade (under water while it pulls)
    E3.line([L(sx + lean, -0.16, 0.68), L(sx + 0.22, -0.3, 0.46), lowHand], skin, 1.7, 0.9);
    const wet = pull ? at(clamp((grip[2] - 0) / (grip[2] - tip[2]))) : tip;
    E3.line([grip, pull ? wet : bladeRoot], OPT.colour ? '#3F3122' : INK, 1.1, 0.95);
    if (!pull) {
      const bp = proj(bladeRoot), bt = proj(tip), nx = bt[1] - bp[1], ny = -(bt[0] - bp[0]), nl = Math.hypot(nx, ny) || 1, bw = Math.max(1.2, F * 0.08 / E3.depth(tip));
      const mid = [lerp(bp[0], bt[0], 0.4), lerp(bp[1], bt[1], 0.4)];
      const bl = new P([bp, [mid[0] + nx / nl * bw, mid[1] + ny / nl * bw], bt, [mid[0] - nx / nl * bw, mid[1] - ny / nl * bw]], true);
      mask(bl); if (OPT.colour) wash(bl, '#7B6247', 0.5); stroke(bl, 1, INK, 0.7, 0.85);
    }
    // the fisherman, seated aft of amidships facing the bow, seen from his left: a light shirt, dark hair; no face drawn
    const torso = [L(sx - 0.14, 0.12, 0.12), L(sx - 0.12 + lean, 0.12, 0.62), L(sx - 0.05 + lean, 0.12, 0.73), L(sx + 0.08 + lean, 0.12, 0.72), L(sx + 0.13 + lean * 0.7, 0.12, 0.5), L(sx + 0.13, 0.12, 0.14)].map(proj);
    const tp = new P(torso, true);
    mask(tp); if (OPT.colour) wash(tp, '#D3DCE2', 0.5);
    hatch(tp, bbox(torso), 1.3, 1.5, 1, INK, 0.45, 0.3, 5121);
    stroke(tp, 1, INK, 0.85, 0.85);
    const neck = [L(sx + lean - 0.01, 0.06, 0.72), L(sx + lean + 0.02, 0.06, 0.8)];
    E3.line(neck, skin, 2.2, 0.9);
    const head = L(sx + lean + 0.03, 0.06, 0.89), hp = proj(head), hr = Math.max(1.6, F * 0.1 / E3.depth(head));
    const hc = el(hp[0], hp[1], hr * 0.95, hr * 1.12, 0, TAU, 5131, 0.08);
    mask(hc); if (OPT.colour) wash(hc, '#5E4434', 0.6); stroke(hc, 1, INK, 0.7, 0.85);
    // his hair, short and dark, over the crown and the back of the head
    const hairP = el(hp[0] + hr * 0.12, hp[1] - hr * 0.25, hr * 0.95, hr * 0.85, Math.PI * 0.95, Math.PI * 2.15, 5133, 0.05);
    fill(new P(hairP.pts, true), OPT.colour ? '#241B14' : INK, 0.75);
    // the hull's near side over his hips: a dugout's round side, darker toward the water, its gunwale catching the sky
    const side = new P(gunN.concat(wl.slice().reverse()), true);
    mask(side);
    if (OPT.colour) washFade(bbox(gunN.concat(wl)), [[0, '#9A8366', 0.45], [0.5, '#6E5539', 0.6], [1, '#4A3826', 0.72]], 0, 1, side);
    else fill(side, INK, 0.25);
    const low = new P(us.map(u => proj(L(u, hb(u) * 0.95, sheer(u) * 0.45))).concat(wl.slice().reverse()), true);
    hatch(low, bbox(gunN.concat(wl)), 0.5, 1.3, 1, INK, 0.5, 0.45, 5101);
    stroke(side, 1, INK, 1.0, 0.95);
    stroke(new P(gunN), 1, OPT.colour ? '#C9B79A' : INK, 0.6, 0.5);
    // his knee just above the gunwale, and his near arm to the paddle's grip
    E3.line([L(sx + 0.1, 0.1, 0.2), L(sx + 0.42, 0.1, 0.33), L(sx + 0.6, 0.1, 0.22)], OPT.colour ? '#3C4E66' : INK, 2.4, 0.85);
    E3.line([L(sx + lean, 0.16, 0.69), L(sx + lean + 0.17, 0.2, 0.52), grip], skin, 1.9, 0.95);
    // the two straight booms across the gunwales to the float, each on a pair of slanting struts; the float, a log pointed
    // forward and cut square aft
    [0.75, -0.7].forEach(u => {
      E3.line([L(u, -0.22, sheer(u) + 0.05), L(u, FV + 0.12, sheer(u) + 0.08)], INK, 1.3, 0.95);
      E3.line([L(u - 0.06, FV - 0.18, sheer(u) + 0.07), L(u - 0.02, FV - 0.05, 0.1)], INK, 0.8, 0.9);
      E3.line([L(u + 0.06, FV + 0.1, sheer(u) + 0.08), L(u + 0.02, FV + 0.04, 0.1)], INK, 0.8, 0.9);
    });
    const fl = [];
    for (let k = 0; k <= 16; k++) { const u = lerp(-1.05, 1.85, k / 16), rr = 0.085 * (u > 1.2 ? Math.sqrt(Math.max(0.02, (1.85 - u) / 0.65)) : 1); fl.push([u, rr]); }
    const ftop = fl.map(([u, rr]) => proj(L(u, FV, 0.03 + rr))), fbot = fl.map(([u, rr]) => proj(L(u, FV + rr * 0.7, -0.01)));
    const fp = new P(ftop.concat(fbot.slice().reverse()), true);
    mask(fp);
    if (OPT.colour) washFade(bbox(ftop.concat(fbot)), [[0, '#A8956F', 0.45], [1, '#6B5A3E', 0.65]], 0, 1, fp);
    stroke(fp, 1, INK, 0.85, 0.9);
    // the ripple along her waterline and the small wave at her bow
    const bow = proj(L(HL, 0.05, 0)), stern = proj(L(-HL, 0.05, 0));
    stroke(new P([[stern[0] - 3, stern[1] + 1.2], [bow[0] + 4, bow[1] + 1.2]]), 1, OPT.colour ? '#174F60' : INK, 0.6, 0.5);
    mask(new P([[bow[0] - 1, bow[1] - 0.3], [bow[0] + 8, bow[1] + 0.7], [bow[0] - 1, bow[1] + 1.5]], true), 0.75);
  }
  // ---- the palm on the sea wall
  function palmGeometry(lt) {
    const Pm = S.palm, c0 = Pm.crown, wdir = dirB(309); // the trade blows toward 309 deg
    const gust = 0.5 + 0.5 * Math.sin(lt * 0.37) * Math.sin(lt * 0.23 + 1.1);
    const c = [c0[0] + wdir[0] * (0.12 + 0.1 * gust) + 0.05 * Math.sin(lt * 0.8), c0[1] + wdir[1] * (0.12 + 0.1 * gust), c0[2] + 0.03 * Math.sin(lt * 0.9)];
    const fronds = Pm.fronds.map((fd, k) => {
      const az = fd.az * rad, el0 = fd.el * rad, hd = [Math.sin(az), Math.cos(az)];
      const dead = fd.dead ? 1 : 0, pts = [c.slice()], N = 30;
      // windward fronds are pushed up and over, leeward ones stream out flatter
      const wv = hd[0] * wdir[0] + hd[1] * wdir[1], lift = (0.14 + 0.2 * gust) * (-wv) * (1 - dead);
      for (let j = 1; j <= N; j++) {
        const s = j / N, flut = 0.05 * Math.sin(lt * (1.2 + 0.15 * (k % 5)) + fd.ph + s * 2.2) * s * s;
        const el = el0 - (fd.sag + dead * 1.4) * Math.pow(s, 1.25) + lift * s + flut, ds = fd.L / N, prev = pts[j - 1];
        const blow = (0.3 + 0.35 * gust) * s * s * ds * (1 - dead * 0.6);
        pts.push([prev[0] + hd[0] * Math.cos(el) * ds + wdir[0] * blow, prev[1] + hd[1] * Math.cos(el) * ds + wdir[1] * blow, prev[2] + Math.sin(el) * ds]);
      }
      return { fd, pts, k };
    });
    return { c, fronds, gust };
  }
  function drawPalm(lt) {
    const Pm = S.palm, G = palmGeometry(lt);
    // the trunk: a tube along its curve, masked, shaded on the side from the light, ringed with its old leaf scars
    const T = Pm.trunk.map((p, i, a) => {
      const t = i / (a.length - 1);
      return { q: [p[0] + (G.c[0] - Pm.crown[0]) * t * t, p[1] + (G.c[1] - Pm.crown[1]) * t * t, p[2]], r: lerp(0.23, 0.15, Math.pow(t, 0.7)) + 0.13 * Math.exp(-t * 16) };
    });
    const sp = T.map(o => E3.proj(o.q)), Lf = [], Rt = [];
    for (let i = 0; i < T.length; i++) {
      const a = sp[Math.max(0, i - 1)], b = sp[Math.min(T.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const rr = F * T[i].r / E3.depth(T[i].q);
      Lf.push([sp[i][0] - dy / l * rr, sp[i][1] + dx / l * rr]); Rt.push([sp[i][0] + dy / l * rr, sp[i][1] - dx / l * rr]);
    }
    const body = new P(Lf.concat(Rt.slice().reverse()), true);
    mask(body);
    if (OPT.colour) wash(body, '#9A8C74', 0.55);
    // which edge is the lower one on the plate: the shade lies along it (the light is high and to the left)
    const lowIsL = Lf[15][1] > Rt[15][1], lowE = lowIsL ? Lf : Rt, highE = lowIsL ? Rt : Lf;
    const shade = new P(sp.map((p, i) => [lerp(p[0], highE[i][0], 0.25), lerp(p[1], highE[i][1], 0.25)]).concat(lowE.slice().reverse()), true);
    const bb = [Math.min(...Lf.concat(Rt).map(p => p[0])) - 2, Math.min(...Lf.concat(Rt).map(p => p[1])) - 2, Math.max(...Lf.concat(Rt).map(p => p[0])) + 2, Math.max(...Lf.concat(Rt).map(p => p[1])) + 2];
    if (OPT.colour) wash(shade, '#6E6250', 0.3);
    hatch(shade, bb, -1.0, 1.6, 1, INK, 0.6, 0.45, 6101);
    ctx.save(); ctx.beginPath(); body.trace(ctx, 1); ctx.clip();
    ctx.globalAlpha = SA * 0.5; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = INK; ctx.lineWidth = 0.65; ctx.beginPath();
    for (let i = 0; i < T.length - 1; i++) for (let k = 0; k < 4; k++) {
      const f = k / 4, j2 = i + 1;
      const l = [lerp(Lf[i][0], Lf[j2][0], f), lerp(Lf[i][1], Lf[j2][1], f)], r = [lerp(Rt[i][0], Rt[j2][0], f), lerp(Rt[i][1], Rt[j2][1], f)];
      const m = [(l[0] + r[0]) / 2 + (r[1] - l[1]) * 0.12, (l[1] + r[1]) / 2 - (r[0] - l[0]) * 0.12];
      ctx.moveTo(l[0], l[1]); ctx.quadraticCurveTo(m[0], m[1], r[0], r[1]);
    }
    ctx.stroke(); ctx.restore();
    stroke(new P(highE), 1, INK, 1.0, 0.85); stroke(new P(lowE), 1, INK, 1.3, 0.95);
    // the coconuts in a cluster under the frond bases
    Pm.nuts.forEach((n, i) => {
      const p = E3.proj([G.c[0] + Math.cos(n.a) * n.rr, G.c[1] + Math.sin(n.a) * n.rr, G.c[2] + n.z]), rr = F * 0.13 / E3.depth(G.c);
      const e = el(p[0], p[1], rr, rr * 1.1, 0, TAU, 6200 + i, 0.15);
      mask(e); if (OPT.colour) wash(e, '#7D8A3E', 0.6); stroke(e, 1, INK, 0.7, 0.8);
      hatch([e], [p[0] - rr, p[1], p[0] + rr, p[1] + rr], 0.5, 1.4, 1, INK, 0.5, 0.45, 6210 + i);
    });
    // the crown: the fronds far to near (by their middles), each a rachis arching out and down with its drooping leaflets
    const fr = G.fronds.map(f => ({ f, d: E3.depth(f.pts[Math.floor(f.pts.length / 2)]) })).sort((a, b) => b.d - a.d);
    fr.forEach(({ f }) => {
      const pts = f.pts, n = pts.length, fd = f.fd, lines = [], tipsA = [], tipsB = [];
      for (let j = 3; j < n; j++) {
        const s = j / (n - 1), p = pts[j], q = pts[j - 1], t = [p[0] - q[0], p[1] - q[1], p[2] - q[2]], tl = Math.hypot(t[0], t[1], t[2]) || 1;
        const side = norm3([-t[1], t[0], 0]), dn = fd.droop * rad + 0.06 * Math.sin(lt * 2.0 + j * 0.7 + fd.ph) * s;
        const len = (fd.dead ? 0.6 : 0.92) * Math.sin(Math.PI * Math.min(1, 0.1 + 0.92 * s)) * (0.5 + 0.5 * Math.min(1, s * 3));
        const wl = (0.12 + 0.22 * G.gust) * s;
        [1, -1].forEach(sg => {
          const v = [side[0] * sg * Math.cos(dn) + 0.35 * t[0] / tl, side[1] * sg * Math.cos(dn) + 0.35 * t[1] / tl, -Math.sin(dn) + 0.25 * t[2] / tl];
          const e = [p[0] + v[0] * len - wl * 0.3, p[1] + v[1] * len + wl * 0.25, p[2] + v[2] * len];
          lines.push([p, e]);
          (sg > 0 ? tipsA : tipsB).push(e);
        });
      }
      const dmid = E3.depth(pts[Math.floor(n / 2)]);
      // the leaf's mass: a translucent wash between its leaflets' tips (backlit: a yellow-green)
      if (OPT.colour) {
        const a = [pts[2]].concat(tipsA).map(p => E3.proj(p)), b = tipsB.map(p => E3.proj(p)).reverse();
        wash(new P(a.concat(b), true), fd.dead ? '#B5A060' : '#79A24A', fd.dead ? 0.42 : 0.3);
      }
      const col = fd.dead ? '#6B5A36' : (OPT.colour ? '#2C4F24' : INK);
      ctx.save(); ctx.globalAlpha = SA * 0.85; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = col; ctx.lineWidth = clamp(20 / dmid, 0.45, 0.9); ctx.lineCap = 'round'; ctx.beginPath();
      lines.forEach(([a, b]) => { const s = E3.clipSeg(a, b); if (s) { ctx.moveTo(s[0][0], s[0][1]); ctx.lineTo(s[1][0], s[1][1]); } });
      ctx.stroke(); ctx.restore();
      E3.line(pts, col, clamp(60 / dmid, 0.8, 1.8), 0.95);
    });
  }

  function draw(lt) {
    camera();
    E3.sunAt(SUN_AZ, SUN_ALT);
    try {
      if (OPT.colour) skyWash();
      skyRules();
      drawClouds(lt);
      waterColour();
      seaStrokes(lt);
      drawShoals(lt);
      drawIslets(lt);
      horizonLine();
      drawEdge(lt);
      drawCanoe(lt);
      drawPalm(lt);
    } finally { E3.sunAt(); }
  }
  return { init, draw, S };
})();

scene({
  id: 'tonga', start: 0, dur: 17,
  init() { TGP.init(); },
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    plate(() => { TGP.draw(lt); });
  },
});
