'use strict';
// The title page: the register's rules and the plate's border draw on, and the span of the missions is set inside it.
scene({
  id: 'open', start: 0, dur: 7,
  draw(t, lt) {
    registerRules(easeOut(prog(lt, 0.15, 1.2)));
    plateFrame(easeOut(prog(lt, 0.35, 1.4)));
    const out = wordsOut(this, 0.4), cx = 540;
    if (OPT.colour) plate(() => washFade([0, 0, PW, PH], [[0, HUE.sky, 0.22], [0.55, HUE.sail, 0.12], [1, HUE.sand, 0.2]], 0, easeOut(prog(lt, 0.4, 1.6))));
    const st = easeOut(prog(lt, 0.5, 1.0)) * out;
    if (st > 0) { const s = compassStar(cx, 300, 46 * st); fill(s, GOLD, 0.85 * st); stroke(s, 1, INK, 1, 0.6 * st); }
    recText('K', 0.6, 6.6, 'المنظمة العالمية للأرصاد الجوية · مهمات الرئيس', 'WORLD METEOROLOGICAL ORGANIZATION · THE PRESIDENT ON MISSION');
    small('WORLD METEOROLOGICAL ORGANIZATION · THE PRESIDENT ON MISSION', cx, 410, easeOut(prog(lt, 0.7, 0.8)) * out, { size: 17, ls: 4, a: 0.7, align: 'center', weight: 600 });
    const lines = ['Four weeks.', 'Three WMO Regions.', 'Six countries.'];
    recText('A', 1.0, 6.6, 'أربعة أسابيع. ثلاثة أقاليم للمنظمة. ستّ دول.', lines.join(' '));
    lines.forEach((l, i) => {
      const p = easeOut(prog(lt, 1.0 + i * 0.45, 0.9)) * out;
      if (p > 0) blurIn(off => { setText(`900 70px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText(l, cx, 515 + i * 88 + off * 0.3); }, p, 10, 14);
    });
    recText('B', 2.6, 6.6, 'سبتمبر – أكتوبر ' + ltr('2026'), 'September – October 2026');
    const pd = easeOut(prog(lt, 2.6, 0.8)) * out;
    if (pd > 0) { ctx.save(); setText(`italic 500 38px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.85 * pd; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK; ctx.fillText('September – October 2026', cx, 790); ctx.restore(); }
    recText('N', 3.2, 6.6, 'معالي الدكتور عبدالله المندوس، رئيس المنظمة العالمية للأرصاد الجوية', 'H.E. Dr Abdulla Al Mandous, President of the World Meteorological Organization');
    const pn = easeOut(prog(lt, 3.2, 0.8)) * out;
    if (pn > 0) {
      blurIn(off => { setText(`700 40px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText('H.E. Dr Abdulla Al Mandous', cx, 1012 + off * 0.3); }, pn, 6, 8);
      ctx.save(); setText(`500 31px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.86 * pn; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText('President of the World Meteorological Organization', cx, 1060); ctx.restore();
    }
  },
});
