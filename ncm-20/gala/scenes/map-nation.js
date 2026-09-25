'use strict';
// The nation: an engraved map of the seven emirates (data/uae-map.js). The coast inks itself, the Center's
// headquarters is marked with a small gold star, and as the narrator says "the seven emirates" all seven are washed
// in gold together and named in constitutional order. Nothing on this map widens, sweeps or targets: no range ring,
// no radar marks, no point symbols over the country (a widening ring from a capital is a news "strike radius" graphic).
// The same map carries April 2024 (storm: true): the whole country under one weather system, cloud and rain crossing
// from the west and clearing to the east; the event was national, so no single city stands for it.
// Protocol: Abu Musa, Greater and Lesser Tunb are drawn as UAE territory; Musandam and Madha (Oman) are
// not UAE; neighbours are faint and unlabelled; the sea is the Arabian Gulf; no maritime lines.
const MAP_BOX = { x: 40, y: 165, w: 1000, h: 820 }; // where the map sits on the plate
scene({
  id: 'nation', washT: 8.3, storm: false,
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
    // the capitals in the order of Article 1 of the Constitution
    this.caps = ['cap-abu-dhabi', 'cap-dubai', 'cap-sharjah', 'cap-ajman', 'cap-umm-al-quwain', 'cap-fujairah', 'cap-ras-al-khaimah'].map(id => { const p = pt(id); return { ...p, xy: pr([p.lon, p.lat]) }; });
    this.hq = (p => ({ ...p, xy: pr([p.lon, p.lat]) }))(pt('ncm-hq'));
    // great-circle distance from the headquarters to each capital, km; the ring grows at RING_KMS
    const hav = (a, b) => { const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r, h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
    this.caps.forEach(c => { c.km = hav(this.hq, c); });
    this.airports = UAE_MAP.points.filter(p => p.category === 'airport').map(p => ({ ...p, xy: pr([p.lon, p.lat]) }));
    this.radars = UAE_MAP.points.filter(p => p.category === 'radar' && p.status === 'Operational').map(p => ({ ...p, xy: pr([p.lon, p.lat]) }));
    // label anchors for the crowded northern emirates, set off the coast on leader lines
    // labels for the Gulf coast stand out in the sea, in a column, on leader lines; Fujairah's in the Sea of Oman
    const col = x => x - 95;
    this.labelXY = {};
    this.caps.forEach(c => { this.labelXY[c.id] = { 'cap-abu-dhabi': [c.xy[0] - 120, c.xy[1] - 70, 'right'], 'cap-fujairah': [c.xy[0] + 34, c.xy[1] + 34, 'left'] }[c.id]; });
    const coastal = ['cap-ras-al-khaimah', 'cap-umm-al-quwain', 'cap-ajman', 'cap-sharjah', 'cap-dubai'], y0 = this.caps.find(c => c.id === 'cap-ras-al-khaimah').xy[1] - 30;
    coastal.forEach((id, k) => { const c = this.caps.find(q => q.id === id); this.labelXY[id] = [col(c.xy[0]) - 10 - k * 10, y0 - 20 + k * 58, 'right']; });
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
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); // the fade, not a box, sets where the engraving ends
      this.land.forEach(e => e.polys.forEach(p => p.trace(ctx, 1))); this.context.forEach(ps => ps.forEach(p => p.trace(ctx, 1)));
      ctx.clip('evenodd');
      // the engraving fades out toward the edge of the plate instead of stopping on a line
      const fx = MAP_BOX.x + MAP_BOX.w * 0.52, fy = MAP_BOX.y + MAP_BOX.h * 0.42, grd = ctx.createRadialGradient(fx, fy, 150, fx, fy, 640);
      grd.addColorStop(0, 'rgba(40,71,140,0.26)'); grd.addColorStop(0.6, 'rgba(40,71,140,0.13)'); grd.addColorStop(1, 'rgba(40,71,140,0)');
      ctx.globalAlpha = SA; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = IS_NIGHT ? BLUE : grd; ctx.lineWidth = 0.8; ctx.beginPath();
      const n = Math.floor(H / 7 * sq);
      for (let i = 0; i < n; i++) { const y = i * 7 + 3; ctx.moveTo(0, y); ctx.lineTo(W, y); }
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
    small('SEA OF OMAN', pr([56.95, 24.45])[0], pr([56.95, 24.45])[1] + 22, nq, { size: 12, ls: 5, align: 'center', a: 0.4 });
    // the Center's headquarters: a small gold star
    const hq = easeOut(prog(t, 3.0, 0.8)), [hx, hy] = this.hq.xy;
    // the seven emirates, washed in gold together and named in constitutional order
    const wq = easeInOut(prog(t, this.washT, 1.6));
    if (wq > 0) this.land.forEach(e => e.polys.forEach(p => fill(p, GOLD, 0.2 * wq)));
    const dim = this.storm ? 1 - 0.35 * this.stormQ(t) : 1;
    this.caps.forEach((c, i) => {
      const q = easeOut(prog(t, this.washT + 0.2 + i * 0.14, 0.7)), [x, y] = c.xy, [lx, ly, al] = this.labelXY[c.id];
      if (q <= 0) return;
      disc(x, y, 3.6 * q, INK, 0.9 * dim);
      stroke(new P([[x, y], [lx + (al === 'right' ? 6 : -6), ly - 6]]), q, INK, 0.7, 0.4 * dim);
      smallAr(c.name_ar, lx, ly, q * dim, { size: 30, align: al, a: 0.9, weight: 700 });
      small(c.name_en.toUpperCase(), lx, ly + 22, q * dim, { size: 13, ls: 2, align: al, a: 0.7, weight: 600 });
    });
    if (hq > 0) ornament(hx, hy, 12 * hq, 1);
    if (this.storm) this.weather(t);
  },
  // April 2024 on the map: storm clock u from stormT0. The rain area is drawn the way a weather chart draws one: a
  // wavy-edged band of fine blue hatching, with rain streaks inside, crossing from the west and clearing to the east by
  // the remembrance (u ~12.6). No cloud blobs (they read as smoke), no glow, no alert marks.
  stormT0: 12,
  stormQ(t) { const u = t - this.stormT0; return easeInOut(prog(u, 0.6, 3.0)) * (1 - easeInOut(prog(u, 11.6, 3.4))); },
  weather(t) {
    const u = t - this.stormT0, q = this.stormQ(t);
    if (q <= 0) return;
    if (!this.drops) { const r = rng(2024); this.drops = Array.from({ length: 900 }, () => ({ fx: r(), fy: r(), sp: 0.8 + r() * 0.5 })); }
    const xL = -1350 + u * 125, xR = xL + 1500; // the band's west and east edges at the map's middle latitude
    const edge = (x0, y, ph) => x0 + 45 * Math.sin(y / 95 + ph) + 25 * Math.sin(y / 37 + 2 * ph) + (y - 560) * 0.25;
    const band = (inset, ph) => { const L = [], R = []; for (let y = 60; y <= 1040; y += 20) { L.push([edge(xL + inset, y, ph), y]); R.push([edge(xR - inset, y, ph + 1.7), y]); } return new P(L.concat(R.reverse()), true); };
    // drawn on the text layer so it can be feathered out before the words column (x 980 -> 1140), with no hard edge
    inkText(() => {
    const outer = band(0, 0.4), inner = band(160, 1.1);
    fill(outer, BLUE, 0.05 * q); fill(inner, BLUE, 0.06 * q);
    hatch(outer, [-200, 0, 1400, 1080], -1.15, 9, 1, BLUE, 0.9, 0.22 * q, 2401);
    hatch(inner, [-200, 0, 1400, 1080], -1.15, 9, 1, BLUE, 0.9, 0.22 * q, 2402);
    stroke(outer, 1, BLUE, 1.0, 0.35 * q, [2, 6]);
    // rain streaks inside the band, slanting with the westerly wind
    ctx.save(); ctx.beginPath(); outer.trace(ctx, 1); ctx.clip();
    ctx.globalAlpha = SA * 0.45 * q; ctx.globalCompositeOperation = BLEND; ctx.strokeStyle = BLUE; ctx.lineWidth = 1; ctx.lineCap = 'round';
    ctx.beginPath();
    this.drops.forEach(d => {
      const x = xL - 120 + d.fx * 1750, span = 1160, y = -40 + ((d.fy * span + u * 300 * d.sp) % span);
      ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 18);
    });
    ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'destination-in';
    // over the east coast too (it rained there as well); at the camera's push (s 1.05) x 1140 lands at ~1212,
    // clear of the April labels, which start at x ~1240
    const g = ctx.createLinearGradient(980, 0, 1140, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-400, -200, 2800, 1500); ctx.restore();
    }, 1, BLEND);
  },
});
