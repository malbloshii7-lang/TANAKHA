'use strict';
// VII · Al Mawani — Jebel Ali from the water: a container ship at berth, a row of quay cranes working her bays, a tug
scene({
  id: 'port', // plate carried over from the v3 film (drawing only; words, timing and camera come from timeline.js)
  start: 54, dur: 8, num: 'VII', name: 'AL MAWANI', ar: 'الموانئ', readout: 'UAE PORTS · ~21 MILLION TEU · 2023',
  kicker: 'AL BAHAR · 5-DAY MARINE FORECASTS · SINCE 2018',
  head: ['WE READ', 'THE SEA FOR', 'EVERY SHIP.'], accent: { 'SHIP.': RED },
  arHead: 'ونقرأ البحر لكل سفينة',
  init() {
    // drawn to one scale, about 3.5 px to the metre: waterline y 800, quay deck y 786, ship's deck y 730
    this.quayTop = ln(985, 786, 1062, 786, 540, 0.3);
    this.quayFace = new P([[985, 786], [1062, 786], [1062, 812], [985, 812]], true);
    this.bollard = el(1040, 783, 6, 5, Math.PI, TAU, 541, 0);
    this.yard = [[988, 4], [1016, 3], [1044, 2]].map(([x, n], i) => ({ x, y: 787 - 11 * n, n, i })); // stacks stand on the quay deck
    // cranes stand on the quay behind the ship; from the water we see them end-on: legs, portal, boom end, A-frame, machinery house
    this.cranes = [1270, 1480, 1700].map((cx, i) => {
      const q = { cx, i, raised: i === 2 };
      q.legs = [ln(cx - 46, 786, cx - 42, 618, 550 + i * 10, 0.2), ln(cx + 46, 786, cx + 42, 618, 551 + i * 10, 0.2)];
      q.rear = [ln(cx - 36, 786, cx - 33, 612, 552 + i * 10, 0.2), ln(cx + 36, 786, cx + 33, 612, 553 + i * 10, 0.2)]; // landside legs, behind
      q.brace = [ln(cx - 44, 700, cx + 44, 650, 554 + i * 10, 0.1), ln(cx + 44, 700, cx - 44, 650, 555 + i * 10, 0.1)];
      q.portal = new P([[cx - 50, 618], [cx + 50, 618], [cx + 50, 606], [cx - 50, 606]], true);
      q.aframe = [ln(cx - 30, 606, cx - 8, 506, 556 + i * 10, 0.2), ln(cx + 30, 606, cx + 8, 506, 557 + i * 10, 0.2), ln(cx - 10, 506, cx + 10, 506, 558 + i * 10, 0)];
      q.house = new P([[cx - 38, 606], [cx - 38, 580], [cx + 38, 580], [cx + 38, 606]], true);
      q.boom = raisedBoom(cx, i === 2);
      return q;
    });
    function raisedBoom(cx, raised) { // end-on the boom is a box; raised, it stands tall above the A-frame
      return raised ? new P([[cx - 11, 606], [cx - 7, 300], [cx + 7, 300], [cx + 11, 606]], true) : new P([[cx - 13, 624], [cx + 13, 624], [cx + 13, 604], [cx - 13, 604]], true);
    }
    // the ship: stern to the left, her bow runs out of the plate
    this.hull = new P(wob([[1070, 730], [1885, 730], [1885, 812], [1082, 812]], 545, 0.4), true);
    this.hullLine = new P(wob([[1885, 730], [1070, 730], [1082, 812], [1885, 812]], 548, 0.4)); // she runs on past the plate
    this.boot = new P([[1079, 790], [1885, 790], [1885, 812], [1082, 812]], true);
    this.sheerLine = ln(1070, 736, 1885, 736, 546, 0.2);
    this.accom = new P([[1098, 730], [1098, 632], [1168, 632], [1168, 730]], true);
    this.decks = []; for (let y = 642; y < 730; y += 11) this.decks.push(ln(1101, y, 1165, y, 547 + y, 0.1));
    this.bridge = new P([[1092, 632], [1092, 614], [1176, 614], [1176, 632]], true);
    this.mast = [ln(1134, 614, 1134, 590, 590, 0), ln(1122, 596, 1146, 596, 591, 0)];
    this.funnel = new P([[1076, 730], [1076, 646], [1094, 640], [1096, 730]], true);
    const r = rng(47), cols = [RED, BLUE, OCHRE, SEPIA, BLUE, RED, INK, '#7A8C6A'];
    this.bays = [];
    for (let b = 0; b < 16; b++) {
      const x = 1182 + b * 44, tiers = [5, 6, 6, 4, 6, 5, 3, 6, 6, 5, 6, 4, 6, 5, 6, 6][b];
      const boxes = [];
      for (let k = 0; k < tiers; k++) boxes.push({ p: new P([[x, 721 - (k + 1) * 9.4], [x + 42, 721 - (k + 1) * 9.4], [x + 42, 720 - k * 9.4], [x, 720 - k * 9.4]], true), col: cols[Math.floor(r() * cols.length)], k });
      this.bays.push({ x, boxes, b, lash: ln(x - 1, 722, x - 1, 700, 600 + b, 0) });
    }
    this.hatches = ln(1178, 722, 1885, 722, 598, 0.1);
    this.moor = [new P(wob([[1080, 734], [1060, 760], [1040, 782]], 592, 0.5)), new P(wob([[1090, 736], [1062, 770], [1044, 783]], 593, 0.5))];
    this.sea = ln(1062, 812, 1885, 812, 561, 0.4);
    this.waves = [];
    for (let row = 0; row < 6; row++) {
      const y = 836 + row * 28, off = row % 2 ? 24 : 0, pts = [];
      for (let x = 990 + off; x + 48 <= 1880; x += 48) pts.push(...quad([x, y], [x + 24, y - 24], [x + 48, y], 6).slice(pts.length ? 1 : 0));
      this.waves.push(new P(wob(pts, 570 + row, 0.4)));
    }
    // a harbour tug in front of the ship (local frame, waterline y = 0, bow right)
    this.tug = new P(wob([[-58, -12], [30, -14], [56, -24], [60, -18], [50, 0], [-52, 0]], 610, 0.3), true);
    this.tugFender = new P(wob([[54, -24], [60, -18], [52, 0]], 611, 0.2));
    this.tugHouse = new P([[-6, -14], [-6, -38], [26, -38], [26, -14]], true);
    this.tugWin = new P([[-3, -34], [23, -34], [23, -27], [-3, -27]], true);
    this.tugFunnel = new P([[-24, -14], [-24, -32], [-14, -32], [-14, -14]], true);
    this.tugMast = ln(10, -38, 10, -60, 612, 0);
    this.tugTyres = [-44, -28, -12, 4, 20, 36].map((x, i) => el(x, -6, 4, 4, 0, TAU, 620 + i, 0));
    this.buoy = new P([[-14, 0], [14, 0], [9, -26], [-9, -26]], true);
    this.buoyMast = ln(0, -26, 0, -62, 580, 0.1);
  },
  draw(lt) {
    const lq = easeOut(prog(lt, 2.0, 0.8));
    small('JEBEL ALI · DUBAI', 990, 470, lq, { size: 13, ls: 4, a: 0.75, weight: 600 });
    // the quay and the yard behind it
    const qp = easeInOut(prog(lt, 0.2, 1.0));
    hatch(this.quayFace, [985, 786, 1062, 812], 0.8, 6, qp, INK, 1, 0.35, 542); stroke(this.quayTop, qp, INK, 2);
    stroke(this.bollard, prog(lt, 1.0, 0.4), INK, 1.6);
    this.yard.forEach(y => { for (let k = 0; k < y.n; k++) { const b = new P([[y.x, y.y + 11 * k], [y.x + 40, y.y + 11 * k], [y.x + 40, y.y + 11 * k + 10], [y.x, y.y + 11 * k + 10]], true), q = easeOut(prog(lt, 0.6 + y.i * 0.1 + k * 0.05, 0.4)); if (q > 0) mask(b); fill(b, [OCHRE, BLUE, RED, SEPIA][(y.i + k) % 4], 0.6 * q); stroke(b, q, INK, 0.9, 0.7); } });
    // the cranes, behind the ship
    this.cranes.forEach(c => {
      const q = easeOut(prog(lt, 0.3 + c.i * 0.2, 1.0)), hq = easeOut(prog(lt, 0.9 + c.i * 0.2, 0.6));
      c.rear.forEach(l => stroke(l, q, INK, 1.4, 0.55)); c.legs.forEach(l => stroke(l, q, INK, 2.4)); c.brace.forEach(l => stroke(l, q, INK, 1.1, 0.7));
      mask(c.house); hatch(c.house, [c.cx - 40, 578, c.cx + 40, 608], 1.2, 5, hq, INK, 1, 0.35, 630 + c.i); stroke(c.house, hq, INK, 1.3);
      c.aframe.forEach(l => stroke(l, hq, INK, 1.8));
      mask(c.portal); stroke(c.portal, q, INK, 1.8);
      mask(c.boom); fill(c.boom, INK, 0.12 * hq); stroke(c.boom, hq, INK, 1.8);
      if (c.raised) { for (let y = 330; y < 600; y += 26) stroke(new P([[c.cx - 9, y], [c.cx + 9, y + 13]]), hq, INK, 0.8, 0.6); return; }
      if (lt < 1.6) return;
      // the trolley, its ropes and the spreader: lifting a box off the ship and setting it back
      const ph = ((lt - 1.6) / 4.4 + c.i * 0.37) % 1, lift = 0.5 - 0.5 * Math.cos(ph * TAU), sy = lerp(680, 632, lift);
      const tr = new P([[c.cx - 10, 624], [c.cx + 10, 624], [c.cx + 10, 632], [c.cx - 10, 632]], true);
      mask(tr); stroke(tr, 1, INK, 1.2);
      [-8, -3, 3, 8].forEach(dx => stroke(new P([[c.cx + dx, 632], [c.cx + dx * 2.4, sy]]), 1, INK, 0.8, 0.8));
      stroke(new P([[c.cx - 22, sy], [c.cx + 22, sy]]), 1, INK, 2);
      const box = new P([[c.cx - 21, sy + 1], [c.cx + 21, sy + 1], [c.cx + 21, sy + 10], [c.cx - 21, sy + 10]], true);
      fill(box, c.i ? BLUE : RED, 0.85); stroke(box, 1, INK, 1);
    });
    // the ship
    const hp = easeInOut(prog(lt, 0.4, 1.2));
    mask([this.hull, this.accom, this.bridge, this.funnel]);
    fill(this.boot, RED, 0.72 * hp); hatch(this.hull, [1070, 730, 1885, 812], 0.12, 8, hp, INK, 1, 0.28, 547);
    stroke(this.hullLine, hp, INK, 2.2); stroke(this.sheerLine, hp, INK, 1, 0.6); stroke(this.hatches, hp, INK, 1.2, 0.7);
    this.moor.forEach(m => stroke(m, prog(lt, 1.4, 0.6), INK, 1, 0.7));
    const bp = easeOut(prog(lt, 0.9, 0.8));
    stroke(this.accom, bp, INK, 1.7); this.decks.forEach(d => stroke(d, bp, INK, 0.8, 0.5));
    fill(this.bridge, BLUE, 0.4 * bp); stroke(this.bridge, bp, INK, 1.7); this.mast.forEach(m => stroke(m, bp, INK, 1.2));
    fill(this.funnel, INK, 0.2 * bp); stroke(this.funnel, bp, INK, 1.5);
    stroke(new P([[1077, 660], [1095, 656]]), bp, RED, 5, 0.8);
    // containers fill the bays, bay by bay
    this.bays.forEach(b => {
      stroke(b.lash, bp, INK, 0.8, 0.5);
      b.boxes.forEach(bx => {
        const q = easeOut(prog(lt, 1.2 + b.b * 0.14 + bx.k * 0.06, 0.35));
        if (q <= 0) return;
        ctx.save(); ctx.translate(0, -(1 - q) * 14);
        mask(bx.p); fill(bx.p, bx.col, 0.8 * q); stroke(bx.p, q, INK, 0.8, 0.8);
        ctx.restore();
      });
    });
    // the sea, a tug standing by, and a buoy riding the swell
    stroke(this.sea, prog(lt, 0.3, 1.0), INK, 1.4, 0.7);
    this.waves.forEach((w, i) => stroke(w, prog(lt, 0.5 + i * 0.18, 1.6), BLUE, 1.2, 0.5));
    const tq = easeOut(prog(lt, 2.0, 0.8));
    if (tq > 0) {
      ctx.save(); ctx.translate(1560 + 6 * lt, 862 + 3 * Math.sin(lt * 1.6)); ctx.rotate(0.02 * Math.sin(lt * 1.3));
      mask([this.tug, this.tugHouse, this.tugFunnel]);
      fill(this.tug, INK, 0.16 * tq); stroke(this.tug, tq, INK, 1.8); stroke(this.tugFender, tq, INK, 4, 0.85);
      fill(this.tugWin, BLUE, 0.5 * tq); stroke(this.tugHouse, tq, INK, 1.5); stroke(this.tugWin, tq, INK, 0.9, 0.7);
      fill(this.tugFunnel, RED, 0.7 * tq); stroke(this.tugFunnel, tq, INK, 1.3); stroke(this.tugMast, tq, INK, 1.3);
      this.tugTyres.forEach(t => stroke(t, tq, INK, 1.6, 0.85));
      ctx.restore();
    }
    const by = 912 + 7 * Math.sin(lt * 2.2), bq = easeOut(prog(lt, 2.2, 0.6));
    if (bq > 0) {
      ctx.save(); ctx.translate(1812, by); ctx.rotate(0.1 * Math.sin(lt * 1.9)); ctx.scale(0.45, 0.45); // a 3 m buoy at this scale
      mask(this.buoy); fill(this.buoy, RED, 0.85 * bq); stroke(this.buoy, bq, INK, 1.4); stroke(this.buoyMast, bq, INK, 1.4);
      disc(0, -66, 5, Math.floor(lt * 2) % 2 ? OCHRE : RED, bq, 'source-over');
      ctx.restore();
    }
    // wave height, marked on the swell
    const wh = easeOut(prog(lt, 3.0, 0.6));
    stroke(new P([[1004, 836], [1040, 836]]), wh, INK, 0.9, 0.6);
    stroke(new P([[1014, 824], [1014, 836]]), wh, INK, 1.2, 0.8);
    arrowHead(1014, 824, -Math.PI / 2, 5, INK, 0.8 * wh, 1.2); arrowHead(1014, 836, Math.PI / 2, 5, INK, 0.8 * wh, 1.2);
    back('WAVE HEIGHT', 1030, 830, 'left', wh, 12, 3);
    small('WAVE HEIGHT', 1030, 830, wh, { size: 12, ls: 3, a: 0.7 });
  },
});
