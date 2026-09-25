'use strict';
// The nation's network: an engraved map of the seven emirates (data/uae-map.js). The coast inks itself,
// the emirates are named in their protocol order, then the Center's headquarters lights and its network
// appears: the ten airports with NCM aviation-weather offices (squares) and the six weather radars that
// NCM lists as operational in the WMO Radar Database (unlabelled, as small range rings, no count from
// that file). The sourced count, "more than 100 weather stations · 9 radars (2021)", is left to the words.
// Protocol: Abu Musa, Greater and Lesser Tunb are drawn as UAE territory; Musandam and Madha (Oman) are
// not UAE; neighbours are faint and unlabelled; the sea is the Arabian Gulf; no maritime lines.
const MAP_BOX = { x: 70, y: 150, w: 1060, h: 860 }; // where the map sits on the plate
scene({
  id: 'nation',
  init() {
    const b = UAE_MAP.projection.bbox_array, KX = Math.cos(24.4 * Math.PI / 180);
    const s = Math.min(MAP_BOX.w / ((b[2] - b[0]) * KX), MAP_BOX.h / (b[3] - b[1]));
    const ox = MAP_BOX.x + (MAP_BOX.w - (b[2] - b[0]) * KX * s) / 2, oy = MAP_BOX.y + (MAP_BOX.h - (b[3] - b[1]) * s) / 2;
    const pr = ([lon, lat]) => [ox + (lon - b[0]) * KX * s, oy + (b[3] - lat) * s];
    this.pr = pr; this.pxPerKm = s / 110.8;
    this.land = UAE_MAP.emirates.map(e => ({ id: e.id, en: e.name_en, ar: e.name_ar, polys: e.polygons.map(pg => new P(pg.map(pr), true)) }));
    this.context = UAE_MAP.context.countries.map(c => c.polygons.map(pg => new P(pg.map(pr), true)));
    const arcs = UAE_MAP.arcs.items.map(a => ({ type: a.type, p: new P(a.points.map(pr)) }));
    // the long mainland coast first, then islands, borders last
    this.coast = arcs.filter(a => a.type === 'coast').sort((a, c) => c.p.total - a.p.total);
    this.borders = arcs.filter(a => a.type === 'emirate_border');
    this.landBorders = arcs.filter(a => a.type === 'land_border');
    const pt = id => UAE_MAP.points.find(p => p.id === id);
    this.caps = ['cap-abu-dhabi', 'cap-dubai', 'cap-sharjah', 'cap-ajman', 'cap-umm-al-quwain', 'cap-ras-al-khaimah', 'cap-fujairah'].map(id => { const p = pt(id); return { ...p, xy: pr([p.lon, p.lat]) }; });
    this.hq = (p => ({ ...p, xy: pr([p.lon, p.lat]) }))(pt('ncm-hq'));
    this.airports = UAE_MAP.points.filter(p => p.category === 'airport').map(p => ({ ...p, xy: pr([p.lon, p.lat]) }));
    this.radars = UAE_MAP.points.filter(p => p.category === 'radar' && p.status === 'Operational').map(p => ({ ...p, xy: pr([p.lon, p.lat]) }));
    // label anchors for the crowded northern emirates, set off the coast on leader lines
    // labels for the Gulf coast stand out in the sea, in a column, on leader lines; Fujairah's in the Sea of Oman
    const col = x => x - 95;
    this.labelXY = {};
    this.caps.forEach(c => { this.labelXY[c.id] = { 'cap-abu-dhabi': [c.xy[0] - 120, c.xy[1] - 70, 'right'], 'cap-fujairah': [c.xy[0] + 34, c.xy[1] + 34, 'left'] }[c.id]; });
    const coastal = ['cap-ras-al-khaimah', 'cap-umm-al-quwain', 'cap-ajman', 'cap-sharjah', 'cap-dubai'], y0 = this.caps.find(c => c.id === 'cap-ras-al-khaimah').xy[1] - 30;
    coastal.forEach((id, k) => { const c = this.caps.find(q => q.id === id); this.labelXY[id] = [col(c.xy[0]) - k * 8, y0 + k * 44, 'right']; });
  },
  draw(t) {
    const pr = this.pr;
    // neighbours, faint and unnamed
    const cq = easeOut(prog(t, 0.2, 1.4));
    this.context.forEach(polys => polys.forEach(p => { fill(p, SEPIA, 0.07 * cq); stroke(p, cq, INK, 0.7, 0.18); }));
    // the land, washed, and the sea engraved in fine horizontal lines
    const lq = easeInOut(prog(t, 1.2, 1.6));
    this.land.forEach(e => e.polys.forEach(p => fill(p, OCHRE, 0.13 * lq)));
    const sq = prog(t, 0.6, 2.4);
    if (sq > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(MAP_BOX.x - 40, MAP_BOX.y - 40, MAP_BOX.w + 80, MAP_BOX.h + 80);
      this.land.forEach(e => e.polys.forEach(p => p.trace(ctx, 1))); this.context.forEach(ps => ps.forEach(p => p.trace(ctx, 1)));
      ctx.clip('evenodd');
      // the engraving fades out toward the edge of the plate instead of stopping on a line
      const fx = MAP_BOX.x + MAP_BOX.w * 0.52, fy = MAP_BOX.y + MAP_BOX.h * 0.42, grd = ctx.createRadialGradient(fx, fy, 200, fx, fy, 720);
      grd.addColorStop(0, 'rgba(40,71,140,0.26)'); grd.addColorStop(0.75, 'rgba(40,71,140,0.12)'); grd.addColorStop(1, 'rgba(40,71,140,0)');
      ctx.globalAlpha = SA; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = IS_NIGHT ? BLUE : grd; ctx.lineWidth = 0.8; ctx.beginPath();
      const y0 = MAP_BOX.y - 40, n = Math.floor((MAP_BOX.h + 80) / 7 * sq);
      for (let i = 0; i < n; i++) { const y = y0 + i * 7; ctx.moveTo(MAP_BOX.x - 40, y); ctx.lineTo(MAP_BOX.x + MAP_BOX.w + 40, y); }
      ctx.stroke(); ctx.restore();
    }
    // the coast inks itself, the longest line first
    this.coast.forEach((a, i) => stroke(a.p, easeInOut(prog(t, 0.4 + Math.min(i, 12) * 0.05, 2.4)), INK, i ? 1.1 : 1.6, 0.9));
    this.landBorders.forEach(a => stroke(a.p, easeInOut(prog(t, 1.6, 1.4)), INK, 1.2, 0.55));
    this.borders.forEach(a => stroke(a.p, easeInOut(prog(t, 2.2, 1.2)), INK, 0.8, 0.35, [5, 4]));
    // sea names
    const nq = easeOut(prog(t, 2.6, 1.0));
    smallAr('الخليج العربي', pr([53.1, 25.35])[0], pr([53.1, 25.35])[1], nq, { size: 26, align: 'center', a: 0.45, font: F_NASKH, weight: 400 });
    small('ARABIAN GULF', pr([53.1, 25.35])[0], pr([53.1, 25.35])[1] + 26, nq, { size: 12, ls: 5, align: 'center', a: 0.4 });
    smallAr('بحر عُمان', pr([56.95, 24.45])[0], pr([56.95, 24.45])[1], nq, { size: 22, align: 'center', a: 0.4, font: F_NASKH, weight: 400 });
    // the seven emirates, named in protocol order
    this.caps.forEach((c, i) => {
      const q = easeOut(prog(t, 3.0 + i * 0.22, 0.6)), [x, y] = c.xy, [lx, ly, al] = this.labelXY[c.id];
      if (q <= 0) return;
      disc(x, y, 3.6 * q, INK, 0.9);
      stroke(new P([[x, y], [lx + (al === 'right' ? 6 : -6), ly - 6]]), q, INK, 0.7, 0.4);
      smallAr(c.name_ar, lx, ly, q, { size: 22, align: al, a: 0.88, weight: 600 });
    });
    // the Center: a gold star at its headquarters, and its circle widening over the country
    const hq = easeOut(prog(t, 4.8, 0.8)), [hx, hy] = this.hq.xy;
    if (hq > 0) {
      const rr = easeInOut(prog(t, 5.0, 2.6));
      if (rr > 0 && rr < 1) stroke(el(hx, hy, 40 + rr * 700, 40 + rr * 700, 0, TAU, 800, 0.3), 1, GOLD, 1.6, 0.6 * Math.sin(Math.PI * rr));
      ornament(hx, hy, 14 * hq, 1);
    }
    // the network: aviation-weather offices at the airports, and the radars' slowly sweeping range marks
    this.airports.forEach((p, i) => {
      const q = easeOut(prog(t, 5.6 + i * 0.12, 0.5)), [x, y] = p.xy;
      if (q <= 0) return;
      const r = 5 * q; mask(new P([[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]], true));
      stroke(new P([[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]], true), 1, BLUE, 1.4, 0.85);
    });
    this.radars.forEach((p, i) => {
      const q = easeOut(prog(t, 6.6 + i * 0.18, 0.8)), [x, y] = p.xy;
      if (q <= 0) return;
      const R = 34 * q, a = t * 1.3 + i;
      stroke(el(x, y, R, R, 0, TAU, 810 + i, 0.2), 1, RED, 1, 0.45);
      stroke(new P([[x, y], [x + R * Math.cos(a), y + R * Math.sin(a)]]), 1, RED, 1.2, 0.6);
      disc(x, y, 3 * q, RED, 0.9);
    });
    // a small key, set in the Arabian Gulf's open water
    const kq = easeOut(prog(t, 7.4, 0.8)), kx = MAP_BOX.x + 30, ky = MAP_BOX.y + MAP_BOX.h - 60;
    if (kq > 0) {
      stroke(new P([[kx - 5, ky - 5], [kx + 5, ky - 5], [kx + 5, ky + 5], [kx - 5, ky + 5]], true), kq, BLUE, 1.4, 0.85);
      smallAr('مكاتب الأرصاد في المطارات', kx + 290, ky + 7, kq, { size: 18, align: 'right', a: 0.75 });
      stroke(el(kx, ky + 34, 8, 8, 0, TAU, 820, 0), kq, RED, 1, 0.6); disc(kx, ky + 34, 2.5, RED, 0.9 * kq);
      smallAr('رادارات الطقس', kx + 290, ky + 41, kq, { size: 18, align: 'right', a: 0.75 });
    }
  },
});
