'use strict';
// WMO Region V, the South-West Pacific: a hand-engraved, hand-coloured synoptic chart of the week the President visited the
// Region's services (MetService in Wellington and the Bureau of Meteorology in Melbourne, then BMKG in Jakarta on 23
// September; Tonga on 16 September). Everything on it is data (data/regionv.js, built by the plate's scripts):
// - the coasts and the Members' land: Natural Earth 1:50m admin-0 countries (public domain), in a Mercator projection
//   (x = X0 + (lon - L0) S, y = Y0 - R ln tan(pi/4 + lat/2)): 92.5 E to 170.8 W, 14.1 N to 49.5 S. The land of the
//   Region's 24 Members (WMO Community, "About RA V") is washed sand-gold as one, the neighbours' land faint ochre-green;
//   no line is drawn between countries, only the coasts.
// - the relief and the sea's depth: AWS Terrain Tiles (terrarium, z5); a hillshade lit from the north-west on the land,
//   the shelf seas pale and the deep ocean and trenches darker.
// - the isobars: NOAA GFS 0.25-degree analyses of mean sea-level pressure (PRMSL), every 6 h from 15 Sep 2026 00 UTC to
//   23 Sep 2026 18 UTC (36 analyses), smoothed as an analyst draws (0.6 degree poleward of 25 S, 1.6 in the deep tropics)
//   and sampled at 1 degree; between analyses the field is interpolated in time (Catmull-Rom), so the systems glide.
//   Every 4 hPa, the 1012 and 1016 hPa lines heavier; their values in the margin where they leave the chart. H and L
//   at the analysed centres (closed by at least 1 hPa, tracked from analysis to analysis), each with the analysis'
//   own central pressure from the unsmoothed field; the stamp and the centres' values are those of the nearest analysis.
// - the four cities named beside their true positions (Natural Earth populated places), never marked with a point.
// No arcs, routes, rings or points; no flags; nothing flies; nothing flashes.
const RegionV = (() => {
  const D = typeof REGIONV !== 'undefined' ? REGIONV : null;
  const AB = (() => { let s = ''; for (let c = 35; c < 127; c++) if (c !== 92) s += String.fromCharCode(c); return s; })();
  const IX = new Int16Array(128).fill(-1);
  for (let i = 0; i < AB.length; i++) IX[AB.charCodeAt(i)] = i;
  // a list of polylines in plate px: quarter-pixel coordinates in two base-91 characters, offset 64 px; parts split by spaces
  const parts = s => s.split(' ').filter(Boolean).map(p => {
    const o = [];
    for (let i = 0; i + 3 < p.length; i += 4) o.push([(IX[p.charCodeAt(i)] * 91 + IX[p.charCodeAt(i + 1)]) / 4 - 64, (IX[p.charCodeAt(i + 2)] * 91 + IX[p.charCodeAt(i + 3)]) / 4 - 64]);
    return o;
  });
  const area = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
  // the projection (the same constants as the build scripts)
  const PJ = D ? D.proj : { S: 9.8, L0: 92.5, X0: 12, Y0: 152.0865, R: 561.4986 };
  const px = lon => PJ.X0 + ((lon < 0 ? lon + 360 : lon) - PJ.L0) * PJ.S;
  const py = lat => PJ.Y0 - PJ.R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const lonAt = x => PJ.L0 + (x - PJ.X0) / PJ.S;
  const latAt = y => (2 * Math.atan(Math.exp((PJ.Y0 - y) / PJ.R)) - Math.PI / 2) * 180 / Math.PI;
  const CH = [12, 12, 960, 712]; // the chart inside its neatline
  const NT = D ? D.p.nt : 1;
  // the stamp's analysis time: 15 Sep 2026 00 UTC + 6 h k
  const stamp = k => `MSLP · GFS ANALYSIS · ${String(15 + Math.floor(k / 4)).padStart(2, '0')} SEP 2026 ${String((k % 4) * 6).padStart(2, '0')} UTC`;
  // the analyses' clock: still while the isobars ink in, then 15 Sep 00 UTC to 23 Sep 18 UTC at an even pace with eased
  // ends, settled 0.8 s before the dissolve out
  const T0 = 0.8, T1 = 16.2, RAMP = 1.4;
  function tau(lt) {
    const L = T1 - T0, v = (NT - 1) / (L - RAMP), u = clamp(lt - T0, 0, L);
    if (u < RAMP) return v * u * u / (2 * RAMP);
    if (u > L - RAMP) { const w = L - u; return NT - 1 - v * w * w / (2 * RAMP); }
    return v * RAMP / 2 + v * (u - RAMP);
  }
  let G = null; // decoded data and caches
  function init() {
    if (!D || G) return;
    G = {};
    G.member = parts(D.member); G.other = parts(D.other); G.coastM = parts(D.coastM); G.coastO = parts(D.coastO);
    G.big = G.member.concat(G.other).filter(r => area(r) >= 200);
    // the pressure analyses (tenths of hPa; first analysis absolute, then 0.2 hPa steps, escape 90 + absolute)
    const P = D.p, N = P.nx * P.ny, F = new Float32Array(P.nt * N), rec = new Int32Array(N), e = P.enc;
    let pos = 0;
    const c2 = () => { const v = IX[e.charCodeAt(pos)] * 91 + IX[e.charCodeAt(pos + 1)]; pos += 2; return v; };
    for (let n = 0; n < N; n++) rec[n] = c2();
    for (let k = 0; k < P.nt; k++) for (let n = 0; n < N; n++) {
      if (k > 0) { const ch = IX[e.charCodeAt(pos++)]; if (ch === 90) rec[n] = c2(); else rec[n] += 2 * (ch - 45); }
      F[k * N + n] = 900 + rec[n] / 10;
    }
    G.F = F; G.N = N;
    // the half-degree grid the isobars are traced on, and its nodes on the plate
    G.nx2 = 2 * P.nx - 1; G.ny2 = 2 * P.ny - 1;
    G.PX = Float32Array.from({ length: G.nx2 }, (_, i) => px(P.lon0 + i / 2));
    G.PY = Float32Array.from({ length: G.ny2 }, (_, j) => py(P.lat0 - j / 2));
    G.cur = new Float32Array(N); G.row = new Float32Array(P.ny * G.nx2); G.V = new Float32Array(G.nx2 * G.ny2);
    G.cities = D.cities.map(([name, lon, lat]) => ({ name, x: px(lon), y: py(lat) }));
    G.letters = lettering();
    G.stampBox = inkBox(stamp(0), STAMP[0], STAMP[1], F_STAMP, 1.5, 'ltr', 'left', 0, 5);
    G.base = baseMap();
  }
  // ---- the engraved and hand-coloured chart, laid once on a white sheet (multiplied onto the paper every frame) ----
  function sheet() { const c = document.createElement('canvas'); c.width = Math.round(PW * SCALE); c.height = Math.round(PH * SCALE); const g = c.getContext('2d'); g.setTransform(SCALE, 0, 0, SCALE, 0, 0); return [c, g]; }
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const ringsPath = (g, rings, close = true) => { rings.forEach(r => { r.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (close) g.closePath(); }); };
  function raster(R, decode, colour) { // a coarse plate-space grid as an image (one pixel a cell), drawn smoothed over the plate
    const c = document.createElement('canvas'); c.width = R.nx; c.height = R.ny;
    const g = c.getContext('2d'), im = g.createImageData(R.nx, R.ny), v = decode(R);
    for (let n = 0; n < v.length; n++) { const [r, gg, b, a] = colour(v[n]); im.data[4 * n] = r; im.data[4 * n + 1] = gg; im.data[4 * n + 2] = b; im.data[4 * n + 3] = a; }
    g.putImageData(im, 0, 0);
    return c;
  }
  const decGrid = R => Array.from(R.s, ch => IX[ch.charCodeAt(0)]);
  const decRLE = R => { const out = []; for (let i = 0; i < R.s.length; i++) { const v = IX[R.s.charCodeAt(i)]; if (v === 90) { const n = IX[R.s.charCodeAt(++i)] + 1; for (let k = 0; k < n; k++) out.push(-1); } else out.push(v); } return out; };
  const hexRGB = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  // the lettering printed with the chart (each line-work layer breaks for it): cities, degrees, the Equator and the Tropic
  function lettering() {
    const L = [];
    const add = (text, x, y, o) => L.push(Object.assign({ text, x, y, size: 9, ls: 1, weight: 500, align: 'left', a: 0.62, pad: 2, font: F_MONO, col: INK }, o));
    // the four cities, beside their true positions (never a point)
    G.cities.forEach(c => { const [dx, dy, al] = CITY[c.name]; add(c.name, c.x + dx, c.y + dy, { size: 10.5, ls: 1.5, weight: 600, align: al, a: 0.92, pad: 2.5 }); });
    for (let lon = 100; lon <= 180; lon += 10) add(lon === 180 ? '180°' : lon + '°E', px(lon), CH[1] + 12, { align: 'center' });
    [[10, '10°N'], [0, '0°'], [-10, '10°S'], [-20, '20°S'], [-30, '30°S'], [-40, '40°S']].forEach(([lat, t]) => add(t, CH[0] + 4, py(lat) + 3.5));
    add('EQUATOR', px(98.2), py(0) - 4, { size: 8.5, ls: 3, align: 'center', a: 0.55 });
    add('TROPIC OF CAPRICORN', px(128.5), py(-23.44) - 4, { size: 8.5, ls: 3, align: 'center', a: 0.5 });
    L.forEach(l => { l.f = `${l.weight} ${l.size}px ${l.font}`; l.box = inkBox(l.text, l.x, l.y, l.f, l.ls, 'ltr', l.align, 0, l.pad); });
    return L;
  }
  function baseMap() {
    const [cv, g] = sheet();
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, PW, PH);
    g.globalCompositeOperation = 'multiply'; g.lineCap = 'round'; g.lineJoin = 'round';
    const land = G.member.concat(G.other);
    const clipSea = c => { c.beginPath(); c.rect(CH[0], CH[1], CH[2] - CH[0], CH[3] - CH[1]); ringsPath(c, land); c.clip('evenodd'); };
    const clipLand = c => { c.beginPath(); ringsPath(c, land); c.clip('evenodd'); };
    const lay = (c, a) => { g.save(); g.globalAlpha = a; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, 0, 0); g.restore(); };
    g.save(); g.beginPath(); g.rect(CH[0], CH[1], CH[2] - CH[0], CH[3] - CH[1]); g.clip();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    if (OPT.colour) {
      // the sea: a pale blue-green wash, a little deeper over the deep ocean and the trenches, the shelf seas paler
      g.save(); clipSea(g);
      g.fillStyle = rgba(HUE.sea, 0.15); g.fillRect(0, 0, PW, PH);
      const [dr, dg, db] = hexRGB(HUE.water);
      const dimg = raster(D.depth, decGrid, v => [dr, dg, db, Math.round(255 * 0.3 * Math.pow(v / 89, 1.5))]);
      g.drawImage(dimg, -D.depth.step / 2, -D.depth.step / 2, D.depth.nx * D.depth.step, D.depth.ny * D.depth.step);
      g.restore();
      // the colourist's band along the coasts of the larger lands, fading out to sea
      const [bc, bg] = sheet();
      bg.lineJoin = 'round'; bg.strokeStyle = HUE.sea; bg.beginPath(); ringsPath(bg, G.big);
      bg.filter = `blur(${(8 * SCALE).toFixed(1)}px)`; bg.lineWidth = 24; bg.globalAlpha = 0.75; bg.stroke();
      bg.filter = `blur(${(3 * SCALE).toFixed(1)}px)`; bg.lineWidth = 8; bg.globalAlpha = 0.6; bg.stroke();
      bg.filter = 'none'; bg.globalAlpha = 1;
      bg.globalCompositeOperation = 'destination-out'; bg.beginPath(); ringsPath(bg, land); bg.fill('evenodd');
      lay(bc, 0.72);
      // the land: the neighbours in a faint ochre-green, the Region's Members in one warm sand-gold
      g.beginPath(); ringsPath(g, G.other); g.fillStyle = rgba(HUE.leaf, 0.2); g.fill('evenodd'); g.fillStyle = rgba(HUE.sand, 0.12); g.fill('evenodd');
      g.beginPath(); ringsPath(g, G.member); g.fillStyle = rgba(HUE.sand, 0.5); g.fill('evenodd'); g.fillStyle = rgba(HUE.gold, 0.26); g.fill('evenodd');
    }
    // the relief, lit from the north-west: shade on the slopes turned from the light
    g.save(); clipLand(g);
    const [hr, hg, hb] = hexRGB(OPT.colour ? HUE.hill : SEPIA);
    const rimg = raster(D.relief, decRLE, v => (v < 0 ? [0, 0, 0, 0] : [hr, hg, hb, Math.round(255 * clamp((v / 89 - 0.5) * 2) * (OPT.colour ? 0.55 : 0.35))]));
    g.drawImage(rimg, -D.relief.step / 2, -D.relief.step / 2, D.relief.nx * D.relief.step, D.relief.ny * D.relief.step);
    g.restore();
    // the seas, in spaced italic
    g.save(); g.globalAlpha = 0.5; g.fillStyle = OPT.colour ? HUE.deep : INK; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    [['INDIAN OCEAN', 104, -16.5, 15, 7], ['PACIFIC OCEAN', 178, -5, 15, 7], ['CORAL SEA', 155.5, -15.5, 12, 5], ['TASMAN SEA', 161, -37, 12, 5], ['ARAFURA SEA', 135, -9.6, 10.5, 4]]
      .forEach(([t, lon, lat, size, ls]) => { g.font = `italic 500 ${size}px ${F_SERIF}`; g.letterSpacing = ls + 'px'; g.fillText(t, px(lon) + ls / 2, py(lat)); });
    g.letterSpacing = '0px'; g.restore();
    // the line-work on a sheet of its own, so the lettering can break it
    const [lc, l] = sheet();
    l.lineCap = 'round'; l.lineJoin = 'round';
    // water-lining: three fine lines following the coasts of the larger lands, farther apart and fainter out to sea
    // (none round the small islands, where they would close into rings)
    [[3.5, 0.42], [7.5, 0.26], [12.5, 0.14]].forEach(([d, a]) => {
      const [wc, wg] = sheet();
      wg.lineJoin = 'round'; wg.strokeStyle = '#000'; wg.lineWidth = 2 * d + 1.1; wg.beginPath(); ringsPath(wg, G.big); wg.stroke();
      wg.globalCompositeOperation = 'destination-out'; wg.lineWidth = 2 * d; wg.stroke();
      wg.beginPath(); ringsPath(wg, land); wg.fill('evenodd');
      wg.globalCompositeOperation = 'source-in'; wg.fillStyle = OPT.colour ? HUE.deep : BLUE; wg.fillRect(0, 0, PW, PH);
      l.save(); l.globalAlpha = a; l.setTransform(1, 0, 0, 1, 0, 0); l.drawImage(wc, 0, 0); l.restore();
    });
    // the graticule every 10 degrees; the Equator a little stronger, the Tropic of Capricorn dashed
    l.strokeStyle = INK; l.lineWidth = 0.55; l.globalAlpha = 0.24; l.beginPath();
    for (let lon = 100; lon <= 190; lon += 10) { const x = px(lon); l.moveTo(x, CH[1]); l.lineTo(x, CH[3]); }
    for (let lat = 10; lat >= -40; lat -= 10) { if (!lat) continue; const y = py(lat); l.moveTo(CH[0], y); l.lineTo(CH[2], y); }
    l.stroke();
    l.globalAlpha = 0.42; l.lineWidth = 0.8; l.beginPath(); l.moveTo(CH[0], py(0)); l.lineTo(CH[2], py(0)); l.stroke();
    l.globalAlpha = 0.32; l.lineWidth = 0.6; l.setLineDash([5, 4]); l.beginPath(); l.moveTo(CH[0], py(-23.44)); l.lineTo(CH[2], py(-23.44)); l.stroke(); l.setLineDash([]);
    // the coasts: the Members' firm, the neighbours' faint
    l.globalAlpha = 0.86; l.lineWidth = 0.85; l.beginPath(); ringsPath(l, G.coastM, false); l.stroke();
    l.globalAlpha = 0.42; l.lineWidth = 0.7; l.beginPath(); ringsPath(l, G.coastO, false); l.stroke();
    l.globalAlpha = 1; l.globalCompositeOperation = 'destination-out';
    G.letters.forEach(t => l.fillRect(...t.box));
    lay(lc, 1);
    g.restore();
    // the lettering itself
    G.letters.forEach(t => { g.save(); g.font = t.f; g.letterSpacing = t.ls + 'px'; g.textAlign = t.align; g.globalAlpha = t.a; g.fillStyle = t.col; g.fillText(t.text, t.x, t.y); g.restore(); });
    // the neatline: an outer rule, a band graduated by the degree (filled every other degree), and the inner rule
    g.strokeStyle = INK; g.fillStyle = INK;
    const o = 5, i = CH[0];
    g.save(); g.globalAlpha = 0.62;
    for (let lon = 92; lon <= 190; lon++) {
      if (lon % 2) continue;
      const x0 = Math.max(i, px(lon)), x1 = Math.min(PW - i, px(lon + 1));
      if (x1 > x0) { g.fillRect(x0, o, x1 - x0, i - o); g.fillRect(x0, PH - i, x1 - x0, i - o); }
    }
    for (let lat = 15; lat >= -50; lat--) {
      if (lat % 2) continue;
      const y0 = Math.max(i, py(lat)), y1 = Math.min(PH - i, py(lat - 1));
      if (y1 > y0) { g.fillRect(o, y0, i - o, y1 - y0); g.fillRect(PW - i, y0, i - o, y1 - y0); }
    }
    g.restore();
    g.globalAlpha = 0.8; g.lineWidth = 0.9; g.strokeRect(o, o, PW - 2 * o, PH - 2 * o);
    g.lineWidth = 1.1; g.strokeRect(i, i, PW - 2 * i, PH - 2 * i);
    // the title cartouche, on clean paper with a faint gold wash, in a double rule
    const [x0, y0, x1, y1] = CART, cx = (x0 + x1) / 2;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#FFFFFF'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.globalCompositeOperation = 'multiply';
    if (OPT.colour) { g.globalAlpha = 0.13; g.fillStyle = HUE.gold; g.fillRect(x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6); }
    g.globalAlpha = 0.8; g.lineWidth = 1.2; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    g.globalAlpha = 0.55; g.lineWidth = 0.6; g.strokeRect(x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6);
    g.beginPath(); g.moveTo(cx - 70, y0 + 36); g.lineTo(cx + 70, y0 + 36); g.globalAlpha = 0.5; g.stroke();
    g.fillStyle = INK; g.textAlign = 'center';
    g.globalAlpha = 0.92; g.font = `700 14px ${F_HEAD}`; g.letterSpacing = '2px'; g.fillText('WMO REGION V · SOUTH-WEST PACIFIC', cx + 1, y0 + 27);
    g.globalAlpha = 0.7; g.font = `500 9px ${F_MONO}`; g.letterSpacing = '1.5px'; g.fillText('MEAN SEA-LEVEL PRESSURE · ISOBARS EVERY 4 hPa', cx, y0 + 50);
    // the stamp's box, on clean paper (its text runs with the analyses)
    const sb = G.stampBox;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.94; g.fillStyle = '#FFFFFF'; g.fillRect(...sb);
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6; g.lineWidth = 0.7; g.strokeRect(...sb);
    g.letterSpacing = '0px';
    return cv;
  }
  // ---- the pressure field at analysis time tk (fractional), on the half-degree grid ----
  function field(tk, V = G.V) {
    const P = D.p, N = G.N, F = G.F, k = Math.floor(tk), f = tk - k, K = i => clamp(i, 0, P.nt - 1) * N;
    const a0 = K(k - 1), a1 = K(k), a2 = K(k + 1), a3 = K(k + 2), f2 = f * f, f3 = f2 * f;
    const w0 = -0.5 * f3 + f2 - 0.5 * f, w1 = 1.5 * f3 - 2.5 * f2 + 1, w2 = -1.5 * f3 + 2 * f2 + 0.5 * f, w3 = 0.5 * f3 - 0.5 * f2;
    const C = G.cur;
    for (let n = 0; n < N; n++) C[n] = w0 * F[a0 + n] + w1 * F[a1 + n] + w2 * F[a2 + n] + w3 * F[a3 + n];
    // bicubic (Catmull-Rom) to the half degree: rows first, then columns
    const nx = P.nx, ny = P.ny, nx2 = G.nx2, ny2 = G.ny2, Rw = G.row;
    const mid = (p0, p1, p2, p3) => (-p0 + 9 * p1 + 9 * p2 - p3) / 16;
    for (let j = 0; j < ny; j++) {
      const r = j * nx, o = j * nx2;
      for (let i = 0; i < nx; i++) {
        Rw[o + 2 * i] = C[r + i];
        if (i < nx - 1) Rw[o + 2 * i + 1] = mid(C[r + Math.max(0, i - 1)], C[r + i], C[r + i + 1], C[r + Math.min(nx - 1, i + 2)]);
      }
    }
    for (let i = 0; i < nx2; i++) for (let j = 0; j < ny; j++) {
      V[2 * j * nx2 + i] = Rw[j * nx2 + i];
      if (j < ny - 1) V[(2 * j + 1) * nx2 + i] = mid(Rw[Math.max(0, j - 1) * nx2 + i], Rw[j * nx2 + i], Rw[(j + 1) * nx2 + i], Rw[Math.min(ny - 1, j + 2) * nx2 + i]);
    }
    return V;
  }
  // the field at a plate point (bilinear on the half-degree grid)
  function at(V, x, y) {
    const P = D.p, fi = (lonAt(x) - P.lon0) * 2, fj = (P.lat0 - latAt(y)) * 2;
    const i = clamp(Math.floor(fi), 0, G.nx2 - 2), j = clamp(Math.floor(fj), 0, G.ny2 - 2), u = fi - i, v = fj - j, n = G.nx2;
    return lerp(lerp(V[j * n + i], V[j * n + i + 1], u), lerp(V[(j + 1) * n + i], V[(j + 1) * n + i + 1], u), v);
  }
  // the field at a plate point, bicubic (Catmull-Rom; smooth in its slope, for the values at the chart's edge)
  function atC(V, x, y) {
    const P = D.p, fi = (lonAt(x) - P.lon0) * 2, fj = (P.lat0 - latAt(y)) * 2, n = G.nx2;
    const i = clamp(Math.floor(fi), 0, G.nx2 - 2), j = clamp(Math.floor(fj), 0, G.ny2 - 2), u = fi - i, v = fj - j;
    const w = t => { const t2 = t * t, t3 = t2 * t; return [-0.5 * t3 + t2 - 0.5 * t, 1.5 * t3 - 2.5 * t2 + 1, -1.5 * t3 + 2 * t2 + 0.5 * t, 0.5 * t3 - 0.5 * t2]; };
    const wu = w(u), wv = w(v);
    let s = 0;
    for (let b = 0; b < 4; b++) {
      const jj = clamp(j - 1 + b, 0, G.ny2 - 1) * n;
      let r = 0;
      for (let a = 0; a < 4; a++) r += wu[a] * V[jj + clamp(i - 1 + a, 0, G.nx2 - 1)];
      s += wv[b] * r;
    }
    return s;
  }
  // the field at a plate point and a time, straight from the 1-degree analyses (Catmull-Rom in time and in space)
  const crw = t => { const t2 = t * t, t3 = t2 * t; return [-0.5 * t3 + t2 - 0.5 * t, 1.5 * t3 - 2.5 * t2 + 1, -1.5 * t3 + 2 * t2 + 0.5 * t, 0.5 * t3 - 0.5 * t2]; };
  function pAt(tk, x, y) {
    const P = D.p, N = G.N, F = G.F, fi = lonAt(x) - P.lon0, fj = P.lat0 - latAt(y), k = Math.floor(tk);
    const i = clamp(Math.floor(fi), 0, P.nx - 2), j = clamp(Math.floor(fj), 0, P.ny - 2), wt = crw(tk - k), wu = crw(fi - i), wv = crw(fj - j);
    let s = 0;
    for (let c = 0; c < 4; c++) {
      const o = clamp(k - 1 + c, 0, P.nt - 1) * N;
      let sv = 0;
      for (let b = 0; b < 4; b++) {
        const r = o + clamp(j - 1 + b, 0, P.ny - 1) * P.nx;
        let su = 0;
        for (let a = 0; a < 4; a++) su += wu[a] * F[r + clamp(i - 1 + a, 0, P.nx - 1)];
        sv += wv[b] * su;
      }
      s += wt[c] * sv;
    }
    return s;
  }
  // marching squares: the isobar of level L as polylines on the plate ({ pts, closed })
  function contour(V, L) {
    const nx = G.nx2, ny = G.ny2, N = nx * ny, PX = G.PX, PY = G.PY;
    const A = G.adjA || (G.adjA = new Int32Array(2 * N)), B = G.adjB || (G.adjB = new Int32Array(2 * N)), seen = G.seen || (G.seen = new Uint8Array(2 * N));
    A.fill(-1); B.fill(-1); seen.fill(0);
    const link = (p, q) => { if (A[p] < 0) A[p] = q; else B[p] = q; if (A[q] < 0) A[q] = p; else B[q] = p; };
    // edge ids: the horizontal edge from node (i, j) to (i+1, j) is j*nx+i; the vertical edge from (i, j) to (i, j+1) is N+j*nx+i
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = V[j * nx + i], b = V[j * nx + i + 1], c = V[(j + 1) * nx + i + 1], d = V[(j + 1) * nx + i];
      const code = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const T = j * nx + i, Bt = (j + 1) * nx + i, Lf = N + j * nx + i, Rt = N + j * nx + i + 1;
      switch (code) {
        case 1: case 14: link(Lf, Bt); break;
        case 2: case 13: link(Bt, Rt); break;
        case 3: case 12: link(Lf, Rt); break;
        case 4: case 11: link(T, Rt); break;
        case 6: case 9: link(T, Bt); break;
        case 7: case 8: link(Lf, T); break;
        case 5: if ((a + b + c + d) / 4 > L) { link(Lf, T); link(Bt, Rt); } else { link(T, Rt); link(Lf, Bt); } break;
        case 10: if ((a + b + c + d) / 4 > L) { link(T, Rt); link(Lf, Bt); } else { link(Lf, T); link(Bt, Rt); } break;
      }
    }
    const xy = e => {
      if (e < N) { const j = Math.floor(e / nx), i = e - j * nx, a = V[e], b = V[e + 1], f = (L - a) / (b - a); return [PX[i] + f * (PX[i + 1] - PX[i]), PY[j]]; }
      const q = e - N, j = Math.floor(q / nx), i = q - j * nx, a = V[q], b = V[q + nx], f = (L - a) / (b - a); return [PX[i], PY[j] + f * (PY[j + 1] - PY[j])];
    };
    const out = [];
    const walk = (s, closed) => {
      const pts = []; let prev = -1, cur = s;
      while (cur >= 0 && !seen[cur]) {
        seen[cur] = 1; pts.push(xy(cur));
        const a = A[cur], b = B[cur], n = a >= 0 && a !== prev && !seen[a] ? a : b >= 0 && b !== prev && !seen[b] ? b : -1;
        prev = cur; cur = n;
      }
      if (pts.length > 2) out.push({ pts, closed });
    };
    for (let e = 0; e < 2 * N; e++) if (A[e] >= 0 && B[e] < 0 && !seen[e]) walk(e, false); // open lines start at the grid's edge
    for (let e = 0; e < 2 * N; e++) if (A[e] >= 0 && !seen[e]) walk(e, true);
    return out;
  }
  // one pass of Chaikin's corner cutting (the ends of an open line stay put)
  function chaikin(pts, closed) {
    const n = pts.length, o = closed ? [] : [pts[0]];
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      o.push([0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
    }
    if (!closed) o.push(pts[n - 1]);
    return o;
  }
  const smooth01 = x => { const u = clamp(x); return u * u * (3 - 2 * u); };
  // where the city names stand beside their true positions (dx, dy, alignment), the cartouche and the stamp
  const CITY = { JAKARTA: [9, -10, 'left'], MELBOURNE: [8, 4, 'left'], WELLINGTON: [8, 4, 'left'], 'NUKUʻALOFA': [-8, 3, 'right'] };
  const CART = [574, 32, 948, 90], STAMP = [26, 702], F_STAMP = `600 10px ${F_MONO}`;
  function text(t, x, y, a, f, ls, align, col = INK) {
    if (a <= 0) return;
    ctx.save(); setText(f, ls, 'ltr', align); ctx.globalAlpha = SA * a; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore();
  }
  // ---- one frame of the chart ----
  function draw(lt) {
    init();
    if (!G) return;
    const tk = tau(lt), V = field(tk);
    // the field a moment later, for how fast each isobar slides along the chart's edge (px a frame at 30 fps)
    const dtk = 0.02, tps = (tau(lt + 0.01) - tau(lt)) / 0.01 / 30;
    // the chart as printed and coloured
    ctx.save(); ctx.globalAlpha = SA; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(G.base, 0, 0, PW, PH); ctx.restore();
    // ---- what moves: the isobars' values at the chart's edge, and the centres ----
    const marks = [], cents = [];
    const qa = easeOut(prog(lt, 1.0, 0.8));
    // the values where the isobars leave the chart at its left and right edges, south of 21 S (where they run west to
    // east): each fades in as its line crosses the edge squarely and slowly, and out as it runs along the edge, slides
    // fast or crowds a neighbour
    if (qa > 0) {
      const found = [];
      const WIN = Array.from({ length: 17 }, (_, n) => [(n - 8) * 0.1, 9 - Math.abs(n - 8)]);
      const side = (x0, y0, x1, y1, kind) => {
        const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2), s = [];
        for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n); s.push([x, y, atC(V, x, y)]); }
        for (let i = 1; i < s.length; i++) {
          const [xa, ya, pa] = s[i - 1], [xb, yb, pb] = s[i];
          for (let L = Math.ceil(Math.min(pa, pb) / 4) * 4; L <= Math.max(pa, pb); L += 4) {
            if (L === pa) continue;
            const f = (L - pa) / (pb - pa), x = lerp(xa, xb, f), y = lerp(ya, yb, f), ends = Math.min(Math.hypot(x - x0, y - y0), Math.hypot(x - x1, y - y1));
            // the gradient along and across the edge (bicubic, so it changes smoothly): a value shows where the field
            // slopes along the edge and the isobar meets it squarely (one running along the edge slides fast, so its
            // value is left out; two meeting where an isobar touches the edge fade together)
            const ux = (xb - xa) / Math.hypot(xb - xa, yb - ya), uy = (yb - ya) / Math.hypot(xb - xa, yb - ya);
            // judged over a short window of the analyses' clock (a weighted mean over 1.6 analyses), so a value never pops
            let a = 0, ws = 0;
            WIN.forEach(([o, w]) => {
              const t = clamp(tk + o, 0, NT - 1 - dtk), g = Math.abs(pAt(t, x + 2 * ux, y + 2 * uy) - pAt(t, x - 2 * ux, y - 2 * uy)) / 4;
              const gn = Math.abs(pAt(t, x - uy * 2, y + ux * 2) - pAt(t, x + uy * 2, y - ux * 2)) / 4, sq = g / Math.hypot(g, gn);
              const spd = Math.abs((pAt(t + dtk, x, y) - pAt(t, x, y)) / dtk * tps) / Math.max(g, 1e-4);
              a += w * smooth01((g - 0.01) / 0.035) * smooth01((sq - 0.4) / 0.35) * smooth01((2.8 - spd) / 2.3); ws += w;
            });
            // and where an isobar has only just touched the edge (a pair of crossings born together) it is held back
            const g0 = Math.abs(pAt(tk, x + 2 * ux, y + 2 * uy) - pAt(tk, x - 2 * ux, y - 2 * uy)) / 4;
            const g16 = (pAt(tk, x + 16 * ux, y + 16 * uy) - pAt(tk, x - 16 * ux, y - 16 * uy)) / 32 * Math.sign(pb - pa); // the same way across 32 px
            a = a / ws * smooth01(ends / 24) * smooth01((g0 - 0.006) / 0.03) * smooth01((g16 - 0.012) / 0.03);
            found.push({ x, y, L, a, kind, dbg: [a] });
          }
        }
      };
      side(CH[0], py(-21), CH[0], G.stampBox[1] - 10, 'left'); side(CH[2], py(-21), CH[2], CH[3] - 4, 'right');
      const fixed = [10, 0, -10, -20, -30, -40].map(lat => ({ x: CH[0], y: py(lat), kind: 'left' }));
      // a value gives way to a neighbour in proportion to how strongly that neighbour shows (the latitudes always show)
      fixed.forEach(o => { o.a0 = 1; }); found.forEach(o => { o.a0 = o.a; });
      found.forEach(l => found.concat(fixed).forEach(o => {
        if (o === l || o.kind !== l.kind) return;
        const d = Math.abs(o.y - l.y);
        l.a *= 1 - Math.min(1, 4 * o.a0) * (1 - smooth01((d - 14) / 20));
      }));
      const f = `500 9.5px ${F_MONO}`;
      if (window.__RV_FOUND) window.__RV_FOUND.push(found.map(l => [l.L, l.kind, Math.round(l.x), Math.round(l.y), +l.a.toFixed(3), l.dbg.map(v => +v.toFixed(3)), +l.a.toFixed(3)]));
      const gap = (a, b) => Math.max(a[0] - (b[0] + b[2]), b[0] - (a[0] + a[2]), a[1] - (b[1] + b[3]), b[1] - (a[1] + a[3]));
      found.forEach(l => {
        const a = l.a * l.a * qa; // squared: a value only half-defined shows faintly
        if (a <= 0.01) return;
        const [x, y, al] = l.kind === 'left' ? [CH[0] + 4, l.y + 3.5, 'left'] : l.kind === 'right' ? [CH[2] - 4, l.y + 3.5, 'right'] : [l.x, CH[3] - 4, 'center'];
        const box = inkBox(String(l.L), x, y, f, 1, 'ltr', al, 0, 2);
        const aa = G.letters.reduce((m, t) => m * clamp((gap(box, t.box) - 12) / 8), a);
        if (aa > 0.01) marks.push({ t: String(l.L), x, y, f, ls: 1, al, a: aa, ta: 0.8, box });
      });
    }
    // the centres: H and L at the analysed centres, gliding along their tracks; each with its central pressure in the
    // nearest analysis it was found in
    const cq = easeOut(prog(lt, 1.2, 0.8));
    if (cq > 0) D.tracks.forEach(tr => {
      const n = tr.lon.length, k0 = tr.k0, k1 = k0 + n - 1;
      const a = cq * smooth01((tk - k0 + 0.6) / 1.2) * smooth01((k1 + 0.6 - tk) / 1.2);
      if (a <= 0.01) return;
      const u = clamp(tk - k0, 0, n - 1), i = Math.max(0, Math.min(n - 2, Math.floor(u))), f = u - i;
      const cr = arr => { if (n < 2) return arr[0]; const p0 = arr[Math.max(0, i - 1)], p1 = arr[i], p2 = arr[i + 1], p3 = arr[Math.min(n - 1, i + 2)], f2 = f * f, f3 = f2 * f;
        return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3); };
      const x = px(cr(tr.lon)), y = py(cr(tr.lat));
      // kept off the neatline, the cartouche and the stamp
      const edge = smooth01(Math.min(x - CH[0] - 14, CH[2] - 14 - x, y - CH[1] - 18, CH[3] - 26 - y) / 30);
      const clear = b => smooth01(Math.max(b[0] - 14 - x, x - (b[0] + b[2]) - 14, b[1] - 6 - (y + 24), y - 18 - (b[1] + b[3])) / 24);
      const under = G.letters.slice(0, 4).reduce((m, t) => Math.min(m, clear(t.box)), 1);
      const aa = a * edge * clear([CART[0], CART[1], CART[2] - CART[0], CART[3] - CART[1]]) * clear(G.stampBox) * lerp(0.18, 1, under);
      if (aa <= 0.01) return;
      cents.push([x, y]);
      const v = String(tr.v[clamp(Math.round(tk) - k0, 0, n - 1)]), fL = `700 29px ${F_HEAD}`, fV = `600 10.5px ${F_MONO}`;
      marks.push({ t: tr.kind, x, y: y + 10, f: fL, ls: 0, al: 'center', a: aa, ta: 0.95, col: BLUE, box: inkBox(tr.kind, x, y + 10, fL, 0, 'ltr', 'center', 0, 1.5) });
      marks.push({ t: v, x, y: y + 24, f: fV, ls: 1, al: 'center', a: aa, ta: 0.85, box: inkBox(v, x, y + 24, fV, 1, 'ltr', 'center', 0, 1.5) });
    });
    // ---- the isobars, on a sheet of their own: inked in over the first 1.6 s, then gliding with the analyses; the
    // lettering breaks them ----
    const ic = G.iso || (G.iso = sheet()), [icv, ig] = ic;
    ig.save(); ig.setTransform(1, 0, 0, 1, 0, 0); ig.clearRect(0, 0, icv.width, icv.height); ig.restore();
    ig.save(); ig.beginPath(); ig.rect(CH[0], CH[1], CH[2] - CH[0], CH[3] - CH[1]); ig.clip();
    ig.strokeStyle = BLUE; ig.lineCap = 'round'; ig.lineJoin = 'round';
    const ip = easeInOut(prog(lt, -0.2, 1.8));
    for (let L = 960; L <= 1048; L += 4) {
      const lines = contour(V, L), heavy = L === 1012 || L === 1016;
      ig.lineWidth = heavy ? 2.0 : 1.2; ig.globalAlpha = heavy ? 0.92 : 0.82;
      const a0 = ig.globalAlpha, trace = (pts, closed) => {
        if (ip < 1) new P(pts, closed).trace(ig, ip);
        else { pts.forEach(([x, y], i) => (i ? ig.lineTo(x, y) : ig.moveTo(x, y))); if (closed) ig.closePath(); }
      };
      const faint = [];
      ig.beginPath();
      lines.forEach(l => {
        const pts = chaikin(chaikin(l.pts, l.closed), l.closed);
        if (l.closed) {
          // a small closed isobar fades with its size (no speck of a loop pops in or out), and one about a lettered centre
          // gives way to the letter, which marks the centre
          let per = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
          for (let i = 0; i < pts.length; i++) {
            const q = pts[(i + 1) % pts.length], [x, y] = pts[i]; per += Math.hypot(q[0] - x, q[1] - y);
            x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          }
          if (per < 260) {
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
            const d = cents.reduce((m, [x, y]) => Math.min(m, Math.hypot(x - cx, y + 6 - cy)), 1e9);
            const fit = smooth01(Math.min(x1 - x0 - 58, y1 - y0 - 46) / 16); // does the letter and its value fit inside?
            const k = smooth01((per - 34) / 40) * lerp(fit, 1, smooth01((d - 26) / 16));
            if (k <= 0.01) return;
            if (k < 0.99) { faint.push([pts, k]); return; }
          }
        }
        trace(pts, l.closed);
      });
      ig.stroke();
      faint.forEach(([pts, k]) => { ig.globalAlpha = a0 * k; ig.beginPath(); trace(pts, true); ig.stroke(); });
      ig.globalAlpha = a0;
    }
    ig.restore();
    ig.save(); ig.globalCompositeOperation = 'destination-out';
    G.letters.forEach(t => { ig.globalAlpha = 1; ig.fillRect(...t.box); });
    ig.fillRect(CART[0], CART[1], CART[2] - CART[0], CART[3] - CART[1]); ig.fillRect(...G.stampBox);
    marks.forEach(m => { ig.globalAlpha = clamp(m.a * 1.4); ig.fillRect(...m.box); });
    ig.restore();
    ctx.save(); ctx.globalAlpha = SA; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(icv, 0, 0, PW, PH); ctx.restore();
    // ---- the lettering that moves, and the running stamp (the nearest of the 6-hourly analyses) ----
    marks.forEach(m => text(m.t, m.x, m.y, m.a * m.ta, m.f, m.ls, m.al, m.col || INK));
    if (window.__RV_DEBUG) window.__RV_DEBUG.push(marks.map(m => [m.t, Math.round(m.x), Math.round(m.y), +m.a.toFixed(3), m.f.includes('29px') ? 'C' : m.f.includes('10.5px') ? 'cv' : 'v']));
    text(stamp(clamp(Math.round(tk), 0, NT - 1)), STAMP[0], STAMP[1], 0.82, F_STAMP, 1.5, 'left');
  }
  return { init, draw, tau, stamp, _field: field, _at: at };
})();

scene({
  id: 'regionv', start: 0, dur: 17,
  init() { RegionV.init(); },
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    plate(() => { RegionV.draw(lt); });
  },
});
