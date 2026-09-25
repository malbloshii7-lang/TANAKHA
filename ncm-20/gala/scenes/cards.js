'use strict';
// Typographic scenes: the leadership quote cards and the closing lockup.
// A quote card: parchment, a large faint eight-pointed star behind the words, the quote set centred.
scene({
  id: 'quote',
  init() { this.star = starP(W / 2, 470, 330, 250, 8, -Math.PI / 2); this.star2 = starP(W / 2, 470, 300, 228, 8, -Math.PI / 2 + Math.PI / 8); },
  draw(t) {
    const p = easeInOut(prog(t, 0.2, 2.4));
    stroke(this.star, p, GOLD, 1.2, 0.22); stroke(this.star2, p, GOLD, 0.8, 0.16);
  },
  words(t) { quoteCard(QUOTES[this.quote], this, t, { cy: 480 }); },
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
    smallAr(ltr('2007 — 2027'), cx, 700, yq, { size: 30, align: 'center', a: 0.8, font: F_KUFI });
  },
});
