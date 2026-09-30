'use strict';
// Typographic scenes: the leadership quote cards and the closing lockup.
// A quote card: parchment, the film's turning circle behind the words engraved as a guilloché rosette (the fine
// interlaced line-work of banknotes and official seals: a rope of three waves between two rings, a band of petals
// within it), turning slowly; a double rule frames the page. The same for every leader: equal treatment.
// Lines are 1 px or more and never closer than 2.5 px (5 px on the 4K master), so the wall and cameras show no moiré.
scene({
  id: 'quote',
  init() {
    const cx = W / 2, cy = 525, curve = (fn, n = 960) => new P(Array.from({ length: n }, (_, i) => { const a = i / n * TAU, r = fn(a); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }), true);
    this.rings = [curve(() => 346), curve(() => 312), curve(() => 244)];
    this.rope = [0, 1, 2].map(j => curve(a => 329 + 9 * Math.sin(48 * a + j * TAU / 3)));
    this.petals = [0, 1, 2, 3].map(j => curve(a => 276 + 22 * Math.sin(24 * a + j * TAU / 4), 1440));
    const b = 96, rect = d => new P([[b + d, b + d], [W - b - d, b + d], [W - b - d, H - b - d], [b + d, H - b - d]], true);
    this.frame = [rect(0), rect(9)];
  },
  draw(t) {
    const p = easeInOut(prog(t, 0.2, 2.4)), rot = t * 0.012;
    ctx.save(); ctx.translate(W / 2, 525); ctx.rotate(rot); ctx.translate(-W / 2, -525);
    this.rings.forEach((r, i) => stroke(r, p, GOLD, i === 1 ? 1.3 : 1, 0.36));
    this.rope.forEach(r => stroke(r, p, GOLD, 1, 0.3));
    this.petals.forEach(r => stroke(r, p, GOLD, 1, 0.2));
    ctx.restore();
    const f = easeInOut(prog(t, 0.4, 2.0));
    stroke(this.frame[0], f, GOLD, 1.3, 0.45); stroke(this.frame[1], f, INK, 0.9, 0.3);
    [[96, 96], [W - 96, 96], [96, H - 96], [W - 96, H - 96]].forEach(([x, y]) => ornament(x, y, 9, prog(t, 1.6, 0.8), GOLD, 0.8));
  },
  // colour, the same on every card: the rosette's rope band in teal and its petal band in gold, as a seal's tint, and a
  // deep blue between the frame's two rules; the words stay ink on paper
  over(t) {
    const p = easeInOut(prog(t, 0.2, 2.4)), f = easeInOut(prog(t, 0.4, 2.0));
    ctx.save(); ctx.translate(W / 2, 525); ctx.rotate(t * 0.012); ctx.translate(-W / 2, -525);
    wash([this.rings[0], this.rings[1]], HUE.sea, 0.2 * p, 'evenodd');
    wash([this.rings[1], this.rings[2]], HUE.gold, 0.14 * p, 'evenodd');
    ctx.restore();
    wash(this.frame, HUE.deep, 0.45 * f, 'evenodd');
  },
  // the words centred in the framed page (optically, a little above its middle)
  words(t) { quoteCard(QUOTES[this.quote], this, t, { cy: 525 }); },
});
// The closing lockup, over the night: the Center's name set Arabic first, English second, to equal width,
// as the federal visual identity guidelines set entity names. It stands in for the official NCM logo
// lockup, which NCM supplies for the final master (the guidelines allow it only in the outro, with fades).
scene({
  id: 'outro', night: true,
  draw(t) {
    const r = rng(12);
    for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, m = r(); disc(x, y, 0.6 + 1.4 * m * m, INK, (0.25 + 0.5 * m) * easeOut(prog(t, 0, 1.5))); }
  },
  words(t) {
    const out = wordsOut(this, 0.8), p = easeOut(prog(t, 0.4, 1.4)) * out, cx = W / 2;
    const ar = 'المركز الوطني للأرصاد', en = 'NATIONAL CENTER OF METEOROLOGY';
    // equal width: the English is letter-spaced to the Arabic line's measure
    const wa = textWidth(ar, `700 92px ${F_KUFI}`, 0, 'rtl'), we = textWidth(en, `600 40px ${F_HEAD}`, 0), ls = Math.max(0, (wa - we) / (en.length - 1));
    smallAr(ar, cx, 500, p, { size: 92, align: 'center', weight: 700, a: 0.95 });
    small(en, cx + ls / 2, 572, p, { size: 40, ls, align: 'center', a: 0.9, weight: 600, font: F_HEAD });
    ruleWithStar(cx, 630, wa / 2 - 30, prog(t, 1.0, 1.2) * out, 0.6);
    const yq = easeOut(prog(t, 1.6, 1.0)) * out;
    smallAr(ltr('2007–2027'), cx, 700, yq, { size: 30, align: 'center', a: 0.8, font: F_KUFI });
  },
});
