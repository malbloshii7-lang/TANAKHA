'use strict';
// The close, 12.5 s: the register's page with every mission on it (0.3-3.6), the aim they serve (3.9-7.4), the name
// (7.6 to the end, under the narrator's thanks). The hosts are thanked in the post (POST.md), where each can be named and tagged; in the film a list
// of 64 words could not be read. The distance (SOURCES.md) is left to the post too: as a headline it invites talk of
// flight emissions rather than of the work.
const CLOSE_ROWS = [
  ['8–11 SEP', 'KYRGYZSTAN', 'II', 'UTC+6'],
  ['16 SEP', 'TONGA', 'V', 'UTC+13'],
  ['SEPTEMBER', 'NEW ZEALAND', 'V', 'UTC+12'],
  ['SEPTEMBER', 'AUSTRALIA', 'V', 'UTC+10'],
  ['23 SEP', 'INDONESIA', 'V', 'UTC+7'],
  ['30 SEP–2 OCT', 'ROMANIA', 'VI', 'UTC+3'],
];
scene({
  id: 'close', start: 0, dur: 12.5,
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    const R = LAY.REG, cx = 540, f0 = this.start;
    if (OPT.colour) plate(() => washFade([0, 0, PW, PH], [[0, HUE.sail, 0.18], [1, HUE.sand, 0.2]], 0, 1));
    // 1. the register's page: each row written in, ruled off
    const qa = clamp((3.6 - lt) / 0.35);
    recText('B', f0 + 0.3, f0 + 3.6, 'السجل: قيرغيزستان · تونغا · نيوزيلندا · أستراليا · إندونيسيا · رومانيا', 'The register: Kyrgyzstan · Tonga · New Zealand · Australia · Indonesia · Romania');
    const y0 = 262, dy = 70;
    CLOSE_ROWS.forEach((row, k) => {
      const t0 = 0.25 + k * 0.22, y = y0 + k * dy;
      stroke(ln(64, y + 22, 1016, y + 22, 600 + k, 0.4), easeOut(prog(lt, t0, 0.4)) * qa, INK, 0.7, 0.35);
      const s0 = SA; SA = s0 * qa;
      row.forEach((c, i) => typeLine(c, R.x[i], y, t0 + i * 0.05, lt, { size: i === 0 && c.length > 9 ? 22 : 26, ls: 3, a: 0.9, weight: 600, align: i === 3 ? 'right' : 'left', cps: 110 }));
      SA = s0;
    });
    // the page's sum, in two lines: each measured to stay inside the plate with 56 px to spare on either side (in one line
    // at 40 px it ran 1,079 px, wider than the 972 px plate); a line that will not fit stops the build
    const L1 = ['Six countries · three WMO Regions', 'four weeks'];
    recText('A', f0 + 1.6, f0 + 3.6, 'ستّ دول · ثلاثة أقاليم للمنظمة · أربعة أسابيع', L1.join(' · '));
    const pt = easeOut(prog(lt, 1.6, 0.6)) * qa, maxW = PW - 2 * 56;
    L1.forEach(l => { if (textWidth(l, `700 40px ${F_HEAD}`, 1) > maxW) throw new Error(`close: "${l}" is wider than the plate`); });
    if (pt > 0) blurIn(off => { setText(`700 40px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; L1.forEach((l, i) => ctx.fillText(l, cx, 748 + i * 52 + off * 0.3)); }, pt, 6, 8);
    // 2. the aim
    const qb = easeOut(prog(lt, 3.9, 0.7)) * clamp((7.4 - lt) / 0.35);
    recText('A', f0 + 3.9, f0 + 7.4, 'إنذارٌ مبكر لكلّ إنسانٍ على وجه الأرض، بحلول نهاية عام ' + ltr('2027') + '.', 'Early warnings for everyone on Earth, by the end of 2027.');
    if (qb > 0) {
      const s = compassStar(cx, 316, 44 * qb); fill(s, GOLD, 0.88 * qb); stroke(s, 1, INK, 1, 0.6 * qb);
      small('EARLY WARNINGS FOR ALL', cx, 420, qb, { size: 21, ls: 5, a: 0.75, align: 'center', weight: 600 });
      ['Early warnings for', 'everyone on Earth,', 'by the end of 2027.'].forEach((l, i) => {
        const p = easeOut(prog(lt, 4.05 + i * 0.25, 0.6)) * clamp((7.4 - lt) / 0.35);
        if (p > 0) blurIn(off => { setText(`700 66px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText(l, cx, 540 + i * 86 + off * 0.3); }, p, 8, 10);
      });
    }
    // 3. the name
    const qc = easeOut(prog(lt, 7.6, 0.8));
    recText('N', f0 + 7.6, f0 + 12.5, 'معالي الدكتور عبدالله المندوس · رئيس المنظمة العالمية للأرصاد الجوية', 'H.E. Dr Abdulla Al Mandous · President of the World Meteorological Organization');
    if (qc > 0) {
      const s = compassStar(cx, 400, 48 * qc); fill(s, GOLD, 0.88 * qc); stroke(s, 1, INK, 1, 0.6 * qc);
      stroke(ln(cx - 320 * qc, 466, cx + 320 * qc, 466, 701, 0), 1, INK, 1, 0.55 * qc);
      blurIn(off => { setText(`700 56px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText('H.E. Dr Abdulla Al Mandous', cx, 560 + off * 0.3); }, qc, 8, 10);
      const q2 = easeOut(prog(lt, 7.95, 0.8));
      ctx.save(); setText(`500 40px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.9 * q2; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText('President of the', cx, 636); ctx.fillText('World Meteorological Organization', cx, 684); ctx.restore();
      stroke(ln(cx - 320 * q2, 732, cx + 320 * q2, 732, 702, 0), 1, INK, 1, 0.55 * q2);
    }
  },
});
