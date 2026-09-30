'use strict';
// Revision 11 · The Center's watch (after H.H. Sheikh Mansour's card, before the world beat). NCM's Operations Centre
// before dawn: three forecasters, seen from behind in the national dress, at a long desk under a video wall. On it, a
// full-disk satellite image of the Earth and the national picture with the rain areas drifting across the seven emirates
// (drawn as a chart draws weather: hatched areas; no range rings, no sweep, no points over the map). Through the glass,
// the supercomputer's two liquid-cooled cabinets (WAM, 4 Aug 2025: "one of the most advanced in the region"; HPE, 2021:
// two cabinets). The middle forecaster signs off a printed forecast (every forecast is approved by a forecaster: WAM,
// 29 June 2026). Then the camera pushes into the satellite image while the room fades to paper, and the disc lands where
// the world beat's globe opens (screen 555, 535, radius 318; the same projection, centred on 24 N 46.5 E), so the watch
// hands over to the world in one circle.
scene({
  id: 'watch',
  start: 0, dur: 8.333,
  init() {
    const r = rng(2027);
    this.VP = [560, 400];
    this.wall = [130, 110, 990, 590];
    this.P1 = [158, 150, 418, 380]; this.disc = { x: 288, y: 265, r: 100 };
    this.P2 = [436, 150, 676, 380];
    this.win = [700, 140, 968, 470];
    this.small = Array.from({ length: 5 }, (_, k) => [158 + k * 104, 396, 158 + k * 104 + 96, 468]);
    // the national picture in panel 2: the emirates and the faint neighbours, from the film's own map data
    const b = UAE_MAP.projection.bbox_array, KX = Math.cos(24.4 * Math.PI / 180), [x0, y0, x1, y1] = this.P2;
    const s = Math.min((x1 - x0 - 24) / ((b[2] - b[0]) * KX), (y1 - y0 - 24) / (b[3] - b[1]));
    const ox = x0 + (x1 - x0 - (b[2] - b[0]) * KX * s) / 2, oy = y0 + (y1 - y0 - (b[3] - b[1]) * s) / 2;
    this.pr2 = ([lon, lat]) => [ox + (lon - b[0]) * KX * s, oy + (b[3] - lat) * s];
    this.uae = UAE_MAP.emirates.map(e => e.polygons.map(pg => new P(pg.map(this.pr2), true))).flat();
    this.ctxLand = UAE_MAP.context.countries.map(c => c.polygons.map(pg => new P(pg.map(this.pr2), true))).flat();
    // rain areas on the national picture: afternoon cells over the Hajar and a band crossing from the Gulf ([lon, lat, rx, ry])
    this.cells = [[56.05, 25.2, 0.28, 0.2], [55.8, 24.6, 0.22, 0.16], [53.4, 24.9, 0.5, 0.18], [54.3, 23.6, 0.35, 0.22]];
    // cloud systems on the full disc, in latitude and longitude ([lat, lon, half-height, half-width, seed])
    this.clouds = [[32, 50, 3.2, 9, 1], [36, 34, 3, 8, 2], [14, 62, 4, 7, 3], [8, 38, 3, 9, 4], [-6, 55, 5, 12, 5], [45, 58, 4, 13, 6], [24.9, 56.1, 0.9, 1.1, 7], [-24, 40, 5, 11, 8]];
    // the forecasters, seen from behind: x, head y, dress ('ghutra' or 'shayla')
    this.people = [[300, 706, 'ghutra'], [560, 712, 'shayla'], [820, 706, 'ghutra']];
    // the desk: its far edge and front, an arc across the room
    const arc = (y, ry, a0 = Math.PI * 1.08, a1 = Math.PI * 1.92) => Array.from({ length: 49 }, (_, i) => { const a = a0 + (a1 - a0) * i / 48; return [560 + 440 * Math.cos(a), y + ry * Math.sin(a)]; });
    this.deskTop = new P(arc(740, 110).concat(arc(790, 120).reverse()), true);
    this.deskFront = new P(arc(790, 120).concat(arc(850, 120).reverse()), true);
    this.monitors = [220, 380, 480, 640, 740, 900].map((x, i) => ({ x, y: 616 + Math.abs(x - 560) * 0.06, w: 92, h: 56, i }));
    this.trace = Array.from({ length: 5 }, () => r() * 6);
  },
  // the camera: the room, then the push into the full disc until it lands on the world beat's globe
  camAt(lt) {
    return camPath([{ t: 0, s: 1, px: 560, py: 540, sx: 560, sy: 540 }, { t: 4.6, s: 1.03, px: 560, py: 520, sx: 560, sy: 540 },
      { t: 7.5, s: 318 / 100, px: 288, py: 265, sx: 555, sy: 535 }], lt);
  },
  roomA: lt => 1 - easeInOut(prog(lt, 5.6, 1.7)), // the room fades to paper during the push
  under(lt) {
    const a = this.roomA(lt), q = easeInOut(prog(lt, 0.2, 1.2)) * a;
    if (q <= 0) return;
    ctx.save(); ctx.beginPath(); R11.boxPath().trace(ctx, 1); ctx.clip(); camera(this.camAt(lt));
    // the room in the blue of the hour before dawn; the screens are left light
    const [wx0, wy0, wx1, wy1] = this.wall;
    washFade([R11.BOX[0] - 60, R11.BOX[1] - 60, R11.BOX[2] + 60, R11.BOX[3] + 60], [[0, HUE.deep, 0.36], [1, HUE.deep, 0.46]], 0, q,
      [boxP(R11.BOX[0] - 60, R11.BOX[1] - 60, R11.BOX[2] + 60, R11.BOX[3] + 60), boxP(...this.P1), boxP(...this.P2), boxP(...this.win), ...this.small.map(s => boxP(...s))], 'evenodd');
    washFade([...this.P1.slice(0, 2), this.P1[2], this.P1[3]], [[0, HUE.sky, 0.2], [1, HUE.sky, 0.3]], 0, q);
    washFade([...this.P2.slice(0, 2), this.P2[2], this.P2[3]], [[0, HUE.sea, 0.2], [1, HUE.sea, 0.28]], 0, q);
    ctx.restore();
  },
  draw(lt) {
    const c = this.camAt(lt), ra = this.roomA(lt);
    R11.clipped(() => {
      if (ra > 0.003) R11.faded(ra, () => { ctx.save(); camera(c); this.room(lt); ctx.restore(); });
      this.fullDisc(lt, c);
    });
  },
  room(lt) {
    const [vx, vy] = this.VP, [wx0, wy0, wx1, wy1] = this.wall, p = easeInOut(prog(lt, 0.1, 1.2));
    // walls, ceiling, floor: dim, closely hatched; the lines of the room run to one vanishing point
    const far = (x, y, k) => [vx + (x - vx) * k, vy + (y - vy) * k];
    const K = 2.6, TL = far(wx0, wy0, K), TR = far(wx1, wy0, K), BL = far(wx0, wy1, K), BR = far(wx1, wy1, K);
    const ceil = new P([[wx0, wy0], [wx1, wy0], TR, TL], true), floor = new P([[wx0, wy1], [wx1, wy1], BR, BL], true);
    const lw = new P([[wx0, wy0], [wx0, wy1], BL, TL], true), rw = new P([[wx1, wy0], [wx1, wy1], BR, TR], true);
    const back = new P([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], true);
    hatch(back, [wx0, wy0, wx1, wy1], 0, 5, p, INK, 0.9, 0.3, 700); hatch(back, [wx0, wy0, wx1, wy1], Math.PI / 2, 9, p, INK, 0.7, 0.14, 701);
    hatch(ceil, [-400, -400, 1500, wy0], 0, 4.5, p, INK, 0.9, 0.42, 702);
    hatch(floor, [-400, wy1, 1500, 1500], 0.02, 6, p, INK, 0.9, 0.36, 703);
    hatch([lw, rw], [-600, -600, 1700, 1700], Math.PI / 2, 5, p, INK, 0.9, 0.4, 704);
    // floor joints running to the vanishing point
    for (let k = -6; k <= 6; k++) { const x = vx + k * 72; stroke(new P([[x, wy1], far(x, wy1, K)]), p, INK, 0.8, 0.3); }
    [wx0, wx1].forEach(x => stroke(new P([[x, wy0], far(x, wy0, K)]), p, INK, 1.1, 0.6));
    [wx0, wx1].forEach(x => stroke(new P([[x, wy1], far(x, wy1, K)]), p, INK, 1.1, 0.6));
    stroke(back, p, INK, 1.2, 0.7);
    // the video wall: the full disc, the national picture, a row of small screens
    const sq = easeInOut(prog(lt, 0.4, 1.2));
    [this.P1, this.P2, ...this.small].forEach((b, i) => {
      const pb = boxP(...b); mask(pb, sq); stroke(pb, sq, INK, i < 2 ? 2 : 1.3, 0.85);
      stroke(boxP(b[0] - 4, b[1] - 4, b[2] + 4, b[3] + 4), sq, INK, 0.8, 0.5);
    });
    this.panel2(lt, sq);
    this.small.forEach((b, i) => {
      const pts = []; for (let x = b[0] + 6; x < b[2] - 6; x += 3) pts.push([x, (b[1] + b[3]) / 2 + 12 * Math.sin((x + lt * 40) * 0.05 + this.trace[i]) * Math.sin(x * 0.013 + i)]);
      stroke(new P(pts), sq, i % 2 ? BLUE : INK, 1, 0.65);
      for (let k = 1; k < 4; k++) stroke(new P([[b[0] + 4, b[1] + k * 18], [b[2] - 4, b[1] + k * 18]]), sq, INK, 0.6, 0.18);
    });
    // two clocks over the video wall, UTC and the Emirates' time (UTC+4), a little before dawn; their second hands run
    [[430, 128, 0], [520, 128, 4]].forEach(([cx, cy, off], k) => {
      const face = el(cx, cy, 13, 13, 0, TAU, 710 + k, 0); mask(face, sq); stroke(face, sq, INK, 1.4, 0.9);
      const hh = (0.8 + off + 4.8 / 60) / 12 * TAU, mm = 48 / 60 * TAU, ss = (lt / 60 * 12 % 1) * TAU; // 00:48 UTC, 04:48 UAE
      [[hh, 7, 2], [mm, 10.5, 1.4], [ss + k, 11.5, 0.7]].forEach(([a, l, w]) => stroke(new P([[cx, cy], [cx + l * Math.sin(a), cy - l * Math.cos(a)]]), sq, k === 1 && w < 1 ? RED : INK, w, 0.9));
      small(k ? 'UAE' : 'UTC', cx, cy + 26, sq, { size: 8, ls: 1, align: 'center', a: 0.6, weight: 600 });
    });
    // the machine room through the glass: two tall liquid-cooled cabinets, blade after blade, pipes along the floor
    const [gx0, gy0, gx1, gy1] = this.win, gw = boxP(...this.win);
    mask(gw, sq); hatch(gw, [gx0, gy0, gx1, gy1], 0, 4.5, sq, INK, 0.8, 0.3, 705);
    [[724, 834], [846, 956]].forEach(([a, b], k) => {
      const cab = boxP(a, 176, b, 452); mask(cab, sq); fill(cab, INK, 0.62 * sq);
      for (let x = a + 7; x < b - 4; x += 6.5) stroke(new P([[x, 190], [x, 404]]), sq, OPT.colour ? '#9DB9EE' : '#F1E4C8', 0.8, 0.5);
      for (let y = 196; y < 404; y += 26) stroke(new P([[a + 4, y], [b - 4, y]]), sq, OPT.colour ? '#9DB9EE' : '#F1E4C8', 0.6, 0.35);
      stroke(cab, sq, INK, 1.3);
      stroke(new P([[a + 12, 452], [a + 12, 466], [gx1, 466]]), sq, OCHRE, 2, 0.7); stroke(new P([[b - 14, 452], [b - 14, 460], [gx1, 460]]), sq, OCHRE, 2, 0.6);
    });
    [[gx0 + 30, gy0], [gx0 + 150, gy0]].forEach(([x, y], k) => stroke(new P([[x, y + 10], [x + 60, y + 150]]), sq, '#F1E4C8', 3, 0.35)); // glare on the glass
    stroke(gw, sq, INK, 2, 0.85);
    // the full disc in its panel (drawn by fullDisc in screen space when the camera pushes in)
    // the desk and its monitors, the forecasters in front of them
    const dq = easeInOut(prog(lt, 0.3, 1.0));
    this.monitors.forEach(m => {
      const b = boxP(m.x - m.w / 2, m.y - m.h, m.x + m.w / 2, m.y); mask(b, dq); stroke(b, dq, INK, 1.4, 0.85);
      const g = []; for (let x = m.x - m.w / 2 + 6; x < m.x + m.w / 2 - 6; x += 3) g.push([x, m.y - m.h / 2 + 9 * Math.sin((x + lt * 30 + m.i * 40) * 0.08)]);
      stroke(new P(g), dq, m.i % 2 ? BLUE : INK, 0.9, 0.55);
      stroke(new P([[m.x, m.y], [m.x, m.y + 12]]), dq, INK, 1.6, 0.8);
    });
    mask([this.deskTop, this.deskFront], dq); hatch(this.deskFront, [100, 700, 1020, 980], Math.PI / 2, 4, dq, INK, 0.9, 0.5, 706);
    stroke(this.deskTop, dq, INK, 1.4, 0.8); stroke(this.deskFront, dq, INK, 1.4, 0.8);
    // the printed forecast on the desk and the pen that signs it off
    const sheet = new P([[600, 690], [668, 684], [676, 726], [606, 734]], true);
    mask(sheet, dq); stroke(sheet, dq, INK, 1, 0.8);
    for (let k = 0; k < 5; k++) stroke(new P([[610, 696 + k * 6], [660 - (k % 2) * 12, 691 + k * 6]]), dq, INK, 0.7, 0.45);
    const sg = prog(lt, 2.6, 1.3);
    if (sg > 0) {
      const tick = []; for (let u = 0; u <= sg; u += 0.02) tick.push([640 + 22 * u, 724 - 6 * Math.sin(u * Math.PI * 3) * (1 - u) - 4 * u]);
      if (tick.length > 1) stroke(new P(tick), 1, BLUE, 1.4, 0.9);
      const [px, py] = tick[tick.length - 1];
      stroke(new P([[px, py], [px + 16, py - 34]]), 1, INK, 2.4, 0.9);
    }
    this.people.forEach(([x, y, dress], k) => this.person(x, y, dress, easeInOut(prog(lt, 0.5 + k * 0.15, 1.0)), lt, k));
  },
  // a forecaster seen from behind in a high-backed chair: the white ghutra falling over the shoulders under the black
  // agal, or the black shayla over the abaya; backlit by the wall, so the figures are dark against the light
  person(x, y, dress, q, lt, k) {
    if (q <= 0) return;
    const lean = k === 1 ? Math.sin(Math.min(1, Math.max(0, (lt - 2.4) / 1.4)) * Math.PI) * 4 : 0, hx = x + lean, hy = y + lean * 0.4;
    // a seated figure seen from behind, to true proportion: shoulders about 2.2 heads wide, leaving the neck almost level
    // and turning down at the arm; the back falls straight to the foot of the frame
    const half = (sd) => [[hx + sd * 10, hy + 22], ...cubic([hx + sd * 12, hy + 30], [hx + sd * 30, hy + 36], [hx + sd * 46, hy + 40], [hx + sd * 52, hy + 58], 10).slice(0),
      ...cubic([hx + sd * 52, hy + 58], [hx + sd * 56, hy + 90], [hx + sd * 54, hy + 160], [hx + sd * 50, hy + 230], 10).slice(1)];
    const body = new P(half(-1).concat(half(1).reverse()), true);
    const head = el(hx, hy, 20, 24, 0, TAU, 720 + k, 0.2);
    if (dress === 'ghutra') {
      // the ghutra: white cloth over the head, falling a little past the shoulders in soft folds, its ends lying on the
      // back; the agal, a black double cord, on the crown; the white kandura below
      const cloth = new P([...cubic([hx - 23, hy - 4], [hx - 24, hy - 34], [hx + 24, hy - 34], [hx + 23, hy - 4], 12),
        ...cubic([hx + 23, hy - 4], [hx + 32, hy + 22], [hx + 48, hy + 44], [hx + 56, hy + 70], 10).slice(1),
        ...quad([hx + 56, hy + 70], [hx + 20, hy + 96], [hx, hy + 104], 8).slice(1), ...quad([hx, hy + 104], [hx - 20, hy + 96], [hx - 56, hy + 70], 8).slice(1),
        ...cubic([hx - 56, hy + 70], [hx - 48, hy + 44], [hx - 32, hy + 22], [hx - 23, hy - 4], 10).slice(1)], true);
      mask([body, cloth], q);
      hatch(body, [hx - 60, hy, hx + 60, hy + 240], Math.PI / 2, 7, q, INK, 0.7, 0.12, 734 + k); stroke(body, q, INK, 1.3, 0.8);
      mask(cloth, q);
      for (let j = -3; j <= 3; j++) if (j) stroke(new P(quad([hx + j * 6, hy - 8], [hx + j * 12, hy + 40], [hx + j * 17, hy + 96 - Math.abs(j) * 6], 10)), q, INK, 0.8, 0.28);
      hatch(cloth, [hx - 60, hy - 34, hx + 60, hy + 104], 1.35, 6, q, INK, 0.7, 0.1, 730 + k);
      stroke(cloth, q, INK, 1.5, 0.9);
      stroke(el(hx, hy - 16, 22.5, 6, 0, TAU, 740 + k, 0), q, INK, 3.4, 0.92); stroke(el(hx, hy - 10, 23, 6, 0, TAU, 741 + k, 0), q, INK, 2.6, 0.88);
    } else {
      // the shayla over the head and shoulders and the abaya: black cloth, a fold catching the screens' light
      const scarf = new P([...cubic([hx - 22, hy - 2], [hx - 23, hy - 34], [hx + 23, hy - 34], [hx + 22, hy - 2], 12),
        ...cubic([hx + 22, hy - 2], [hx + 30, hy + 26], [hx + 44, hy + 46], [hx + 54, hy + 74], 10).slice(1),
        ...quad([hx + 54, hy + 74], [hx, hy + 92], [hx - 54, hy + 74], 10).slice(1),
        ...cubic([hx - 54, hy + 74], [hx - 44, hy + 46], [hx - 30, hy + 26], [hx - 22, hy - 2], 10).slice(1)], true);
      mask([body, scarf], q);
      fill(body, INK, 0.7 * q); stroke(body, q, INK, 1.3, 0.85);
      fill(scarf, INK, 0.78 * q); hatch(scarf, [hx - 60, hy - 34, hx + 60, hy + 92], 1.2, 4, q, INK, 0.8, 0.25, 732);
      [[-1, 0.3], [1, 0.22]].forEach(([sd, a]) => stroke(new P(quad([hx + sd * 16, hy - 10], [hx + sd * 30, hy + 40], [hx + sd * 44, hy + 78], 10)), q, '#F1E4C8', 1, a));
      stroke(scarf, q, INK, 1.4, 0.9);
    }
    // the chair: a low back across the small of the back, on its column and base
    const cb = new P([...cubic([x - 58, hy + 250], [x - 62, hy + 190], [x - 50, hy + 160], [x, hy + 156], 10), ...cubic([x, hy + 156], [x + 50, hy + 160], [x + 62, hy + 190], [x + 58, hy + 250], 10).slice(1)], true);
    mask(cb, q); fill(cb, INK, 0.55 * q); hatch(cb, [x - 64, hy + 150, x + 64, hy + 252], 0.2, 3.5, q, INK, 0.8, 0.4, 752 + k); stroke(cb, q, INK, 1.5, 0.9);
    const col = new P([[x - 5, hy + 250], [x + 5, hy + 250], [x + 5, hy + 330], [x - 5, hy + 330]], true); mask(col, q); fill(col, INK, 0.6 * q);
    const base = new P([[x - 60, hy + 346], [x - 8, hy + 330], [x + 8, hy + 330], [x + 60, hy + 346], [x, hy + 352]], true); mask(base, q); fill(base, INK, 0.6 * q); stroke(base, q, INK, 1.1, 0.8);
  },
  // the national picture: the seven emirates and the faint neighbours; rain areas hatched as a chart hatches them,
  // drifting east over the Hajar
  panel2(lt, q) {
    if (q <= 0) return;
    ctx.save(); ctx.beginPath(); boxP(...this.P2).trace(ctx, 1); ctx.clip();
    this.ctxLand.forEach(pg => stroke(pg, q, INK, 0.6, 0.35));
    this.uae.forEach(pg => { stroke(pg, q, INK, 1, 0.85); });
    this.cells.forEach(([lon, lat, rx, ry], i) => {
      const d = lt * 0.03, [cx, cy] = this.pr2([lon + d, lat]), [ex] = this.pr2([lon + d + rx, lat]), [, ey] = this.pr2([lon, lat - ry]);
      const cell = el(cx, cy, Math.abs(ex - cx), Math.abs(ey - cy), 0, TAU, 760 + i, 0.6);
      hatch(cell, [cx - 40, cy - 40, cx + 40, cy + 40], -0.8, 3, q, BLUE, 0.8, 0.6, 770 + i); stroke(cell, q, BLUE, 1, 0.7);
    });
    ctx.restore();
  },
  // the full disc: drawn in screen space from the camera, so its lines keep their weight as it grows
  fullDisc(lt, c) {
    const d = this.disc, sx = c.sx + (d.x - c.px) * c.s, sy = c.sy + (d.y - c.py) * c.s, R = d.r * c.s;
    const q = easeInOut(prog(lt, 0.5, 1.2));
    if (q <= 0) return;
    // the same projection as the world beat's globe at its first frame, turning at its rate until then
    const lat0 = 24, lon0 = 46.5 + (8.733 - lt) * 1.1;
    const P2 = (lat, lon) => { const [x, y, v] = ortho(lat, lon, lat0, lon0, R); return [sx + x, sy - y, v]; };
    ctx.save(); const m = ctx.getTransform(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    const disc = el(sx, sy, R, R, 0, TAU, 1, 0);
    mask(disc, q);
    if (OPT.colour) {
      const g = ctx.createRadialGradient(sx - R * 0.35, sy - R * 0.35, R * 0.1, sx, sy, R);
      g.addColorStop(0, 'rgba(111,168,214,0.3)'); g.addColorStop(0.7, 'rgba(47,154,166,0.46)'); g.addColorStop(1, 'rgba(31,94,140,0.62)');
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.clip(); ctx.globalAlpha = SA * q; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(sx - R, sy - R, 2 * R, 2 * R); ctx.restore();
    }
    // graticule every 15 degrees, as the world beat's
    ctx.save(); ctx.globalAlpha = SA * 0.45 * q; ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath();
    const run = pts => { let on = false; pts.forEach(([x, y, v]) => { if (v > 0.02) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; }); };
    for (let lon = -180; lon < 180; lon += 15) { const pts = []; for (let lat = -90; lat <= 90; lat += 3) pts.push(P2(lat, lon)); run(pts); }
    for (let lat = -75; lat <= 75; lat += 15) { const pts = []; for (let lon = -180; lon <= 180; lon += 3) pts.push(P2(lat, lon)); run(pts); }
    ctx.stroke(); ctx.restore();
    // cloud systems drawn as an engraver draws cloud on a globe: bands of short curved strokes following the flow, no
    // outline and no fill (weather as a chart draws it, never as blobs); they drift east
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.clip();
    this.clouds.forEach(([la, lo, hh, hw, sd]) => {
      const rr = rng(800 + sd), n = Math.round(10 + hw * 2.2), segs = [];
      for (let k = 0; k < n; k++) {
        const u = rr() * 2 - 1, v = (rr() * 2 - 1) * Math.sqrt(1 - u * u) * 0.9, len = (0.25 + rr() * 0.4) * hw, curl = (rr() - 0.5) * 0.6;
        const lat1 = la + v * hh, lon1 = lo + lt * 0.4 + u * hw, pts = [];
        for (let j = 0; j <= 8; j++) { const w = j / 8 - 0.5; pts.push(P2(lat1 + curl * hh * w * w * 2 + 0.25 * hh * Math.sin(w * 3 + sd), lon1 + w * len)); }
        if (pts.some(p => p[2] < 0.05)) continue;
        segs.push(new P(pts.map(p => [p[0], p[1]])));
      }
      segs.forEach((g, j) => stroke(g, q, INK, j % 3 ? 0.9 : 1.3, j % 3 ? 0.35 : 0.5));
    });
    // the seven emirates, in gold
    UAE_MAP.emirates.forEach(e => e.polygons.forEach(pg => {
      const pts = pg.map(([lo, la]) => P2(la, lo)); if (pts.some(p => p[2] < 0.05)) return;
      const pp = new P(pts.map(p => [p[0], p[1]]), true); fill(pp, GOLD, 0.55 * q); stroke(pp, q, INK, 0.8, 0.7);
    }));
    ctx.restore();
    // the limb, lit from the upper left, shaded to the lower right
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.arc(sx - R * 0.22, sy - R * 0.2, R * 1.02, 0, TAU, true); ctx.clip('evenodd');
    hatch(disc, [sx - R, sy - R, sx + R, sy + R], -0.7, Math.max(4, R / 45), q, INK, 1, 0.3, 790); ctx.restore();
    stroke(disc, q, INK, 2.2);
    ctx.setTransform(m); ctx.restore();
  },
});
