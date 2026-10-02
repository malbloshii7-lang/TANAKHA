'use strict';
// The close: the register's page, every mission on it; what the four weeks add up to; the aim they serve; the hosts; the
// name. The distance is computed (SOURCES.md): the great-circle legs between the airports, Dubai to each mission and back,
// the Pacific stops in the order that makes the total smallest, since their order is not public.
const CLOSE_ROWS = [
  ['8–11 SEP', 'KYRGYZSTAN', 'II', 'UTC+6'],
  ['16 SEP', 'TONGA', 'V', 'UTC+13'],
  ['SEPTEMBER', 'NEW ZEALAND', 'V', 'UTC+12'],
  ['SEPTEMBER', 'AUSTRALIA', 'V', 'UTC+10'],
  ['23 SEP', 'INDONESIA', 'V', 'UTC+7'],
  ['30 SEP–2 OCT', 'ROMANIA', 'VI', 'UTC+3'],
];
scene({
  id: 'close', start: 0, dur: 18,
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    const R = LAY.REG, cx = 540, end = this.dur;
    // 1. the register's page (0.6–8.4): each row written in, ruled off
    const qa = clamp((8.4 - lt) / 0.4);
    if (OPT.colour) plate(() => washFade([0, 0, PW, PH], [[0, HUE.sail, 0.16], [1, HUE.sand, 0.16]], 0, 1));
    const y0 = 250, dy = 62;
    CLOSE_ROWS.forEach((row, k) => {
      const t0 = 0.6 + k * 0.42, y = y0 + k * dy;
      stroke(ln(64, y + 20, 1016, y + 20, 600 + k, 0.4), easeOut(prog(lt, t0, 0.5)) * qa, INK, 0.7, 0.35);
      const s0 = SA; SA = s0 * qa;
      row.forEach((c, i) => typeLine(c, R.x[i], y, t0 + i * 0.08, lt, { size: i === 0 && c.length > 9 ? 19 : 22, ls: 3, a: 0.9, weight: 600, align: i === 3 ? 'right' : 'left', cps: 70 }));
      SA = s0;
    });
    recText('B', 75.6, 83.4, 'السجل: قيرغيزستان · تونغا · نيوزيلندا · أستراليا · إندونيسيا · رومانيا', 'The register: Kyrgyzstan · Tonga · New Zealand · Australia · Indonesia · Romania');
    const pt = easeOut(prog(lt, 3.6, 0.8)) * qa;
    const L1 = 'Six countries · three of WMO’s six Regions · UTC+3 to UTC+13';
    const L2 = 'At least 43,700 km between them: more than once around the Equator.';
    recText('A', 78.6, 83.4, 'ستّ دول · ثلاثة من أقاليم المنظمة الستة · من التوقيت العالمي ' + ltr('+3') + ' إلى ' + ltr('+13'), L1);
    recText('A', 79.4, 83.4, 'ما لا يقل عن ' + ltr('43,700') + ' كيلومتر بينها: أكثر من دورةٍ كاملة حول خط الاستواء.', L2);
    if (pt > 0) {
      ctx.save(); setText(`600 34px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.9 * pt; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText(L1, cx, 700); ctx.restore();
    }
    const p2 = easeOut(prog(lt, 4.4, 0.8)) * qa;
    if (p2 > 0) {
      blurIn(off => { setText(`700 36px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText('At least 43,700 km between them', cx, 770 + off * 0.3); }, p2, 6, 8);
      ctx.save(); setText(`italic 500 31px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.85 * p2; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText('more than once around the Equator', cx, 818); ctx.restore();
      small('GREAT-CIRCLE DISTANCES BETWEEN THE AIRPORTS · DUBAI TO EACH MISSION AND BACK · EQUATOR 40,075 KM', cx, 868, p2, { size: 11.5, ls: 1.5, a: 0.55, align: 'center', weight: 600 });
    }
    // 2. the aim (8.9–13.4), and the hosts under the plate
    const qb = easeOut(prog(lt, 8.9, 0.9)) * clamp((13.4 - lt) / 0.4);
    recText('A', 83.9, 88.4, 'هدفٌ واحد: إنذارٌ مبكر لكل إنسان على وجه الأرض بحلول نهاية ' + ltr('2027') + '.', 'One aim: early warnings for everyone on Earth by the end of 2027.');
    if (qb > 0) {
      const s = compassStar(cx, 330, 40 * qb); fill(s, GOLD, 0.85 * qb); stroke(s, 1, INK, 1, 0.6 * qb);
      small('EARLY WARNINGS FOR ALL', cx, 430, qb, { size: 18, ls: 6, a: 0.72, align: 'center', weight: 600 });
      ['One aim: early warnings', 'for everyone on Earth', 'by the end of 2027.'].forEach((l, i) => {
        const p = easeOut(prog(lt, 9.2 + i * 0.3, 0.8)) * clamp((13.4 - lt) / 0.4);
        if (p > 0) blurIn(off => { setText(`700 58px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText(l, cx, 540 + i * 78 + off * 0.3); }, p, 8, 10);
      });
    }
    const thanks = 'With thanks to our hosts: Kyrgyzhydromet and the Ministry of Emergency Situations of the Kyrgyz Republic · the CIS Interstate Council for Hydrometeorology · the Government of Tonga, SPREP and Tonga Meteorological Service · MetService · the Bureau of Meteorology · BMKG · Romania’s National Meteorological Administration · the WMO Secretariat';
    recText('B', 84.4, 88.4, 'مع الشكر لمضيفينا: الهيئة القيرغيزية للأرصاد الجوية ووزارة حالات الطوارئ في جمهورية قيرغيزستان · المجلس المشترك للأرصاد الجوية لرابطة الدول المستقلة · حكومة مملكة تونغا وأمانة البرنامج الإقليمي للبيئة في المحيط الهادئ وهيئة الأرصاد الجوية في تونغا · هيئة الأرصاد الجوية النيوزيلندية · مكتب الأرصاد الجوية الأسترالي · وكالة الأرصاد الجوية والمناخ والجيوفيزياء الإندونيسية · الإدارة الوطنية للأرصاد الجوية في رومانيا · الأمانة العامة للمنظمة', thanks);
    const qt = easeOut(prog(lt, 9.4, 0.9)) * clamp((13.4 - lt) / 0.4);
    if (qt > 0) {
      const lines = wrapText(thanks, `500 25px ${F_SERIF}`, 952);
      if (lines.length > 4) throw new Error('close: the hosts need ' + lines.length + ' lines');
      ctx.save(); setText(`500 25px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.8 * qt; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      lines.forEach((l, i) => ctx.fillText(l, cx, 960 + i * 34)); ctx.restore();
    }
    // 3. the name (13.8 to the end)
    const qc = easeOut(prog(lt, 13.8, 1.0));
    recText('N', 88.8, 93.0, 'معالي الدكتور عبدالله المندوس · رئيس المنظمة العالمية للأرصاد الجوية', 'H.E. Dr Abdulla Al Mandous · President of the World Meteorological Organization');
    if (qc > 0) {
      const s = compassStar(cx, 420, 44 * qc); fill(s, GOLD, 0.85 * qc); stroke(s, 1, INK, 1, 0.6 * qc);
      stroke(ln(cx - 300 * qc, 480, cx + 300 * qc, 480, 701, 0), 1, INK, 1, 0.55 * qc);
      blurIn(off => { setText(`700 50px ${F_HEAD}`, 1, 'ltr', 'center'); ctx.fillStyle = INK; ctx.fillText('H.E. Dr Abdulla Al Mandous', cx, 570 + off * 0.3); }, qc, 8, 10);
      const q2 = easeOut(prog(lt, 14.3, 0.9));
      ctx.save(); setText(`500 36px ${F_SERIF}`, 0, 'ltr', 'center'); ctx.globalAlpha = SA * 0.88 * q2; ctx.globalCompositeOperation = BLEND; ctx.fillStyle = INK;
      ctx.fillText('President of the', cx, 640); ctx.fillText('World Meteorological Organization', cx, 684); ctx.restore();
      stroke(ln(cx - 300 * q2, 730, cx + 300 * q2, 730, 702, 0), 1, INK, 1, 0.55 * q2);
    }
  },
});
