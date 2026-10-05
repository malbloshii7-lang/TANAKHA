'use strict';
// The title page, 3 s. It is the autoplay preview and the thumbnail, so it is bright and complete on its first frame:
// the register's rules, the plate's border, the compass star (turning slowly), and the three-line title. Only the dates
// type in, in the first second.
scene({
  id: 'open', start: 0, dur: 3,
  draw(t, lt) {
    registerRules(1);
    plateFrame(1);
    const out = wordsOut(this, 0.3), cx = 540;
    if (OPT.colour) plate(() => washFade([0, 0, PW, PH], [[0, HUE.sky, 0.3], [0.55, HUE.sail, 0.16], [1, HUE.sand, 0.26]], 0, 1));
    ctx.save(); ctx.translate(cx, 300); ctx.rotate(lt * 0.25);
    const s = compassStar(0, 0, 54); fill(s, GOLD, 0.9 * out); stroke(s, 1, INK, 1.1, 0.6 * out);
    ctx.restore();
    recText('K', 0, 2.65, 'المنظمة العالمية للأرصاد الجوية · مهمات الرئيس', 'WORLD METEOROLOGICAL ORGANIZATION · THE PRESIDENT ON MISSION');
    small('WORLD METEOROLOGICAL ORGANIZATION · THE PRESIDENT ON MISSION', cx, 418, out, { size: 19, ls: 3, a: 0.75, align: 'center', weight: 600 });
    const lines = ['Four weeks.', 'Three WMO Regions.', 'Six countries.'];
    recText('A', 0, 2.65, 'أربعة أسابيع. ثلاثة أقاليم للمنظمة. ستّ دول.', lines.join(' '));
    ctx.save(); setText(`900 76px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.globalAlpha = SA * out; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
    lines.forEach((l, i) => ctx.fillText(l, cx, 530 + i * 94)); ctx.restore();
    recText('B', 0.2, 2.65, 'سبتمبر – أكتوبر ' + ltr('2026'), 'September – October 2026');
    const n = Math.floor(clamp((lt - 0.15) * 40, 0, 24)), date = 'September – October 2026';
    if (n > 0) {
      ctx.save(); setText(`italic 500 40px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.88 * out; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText(date.slice(0, n), cx - (textWidth(date, `italic 500 40px ${F_SERIF}`) - textWidth(date.slice(0, n), `italic 500 40px ${F_SERIF}`)) / 2, 818); ctx.restore();
    }
  },
});
