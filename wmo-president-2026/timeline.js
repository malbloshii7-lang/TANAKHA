'use strict';
// The cut: the feed version, 59.5 s at 30 fps. It opens bright with the title already up, gives each stop 11 s on one
// plate with one set of words, and closes on the register, the aim and the name. The President does not appear: the
// requester's direction (2 October 2026), since his photographs are in his earlier posts. The screen is English; the
// Arabic of every part goes to the SRT, recorded from the build itself. The narrator's lines are in voiceover.json.
//
// Each plate enters part-drawn and starts where its living detail is richest (`offset`, on the plate's own clock), and the
// Region V chart runs its week of analyses a little faster (`speed`) so 15-23 September fits the beat.
//
// Facts and their sources: SOURCES.md. Nothing here comes from the President's office's internal briefings except what a
// public source also reports; their logistics (flights, hotels, transfers, security) never appear.
const AR = ltr; // isolate a Latin or number run inside an Arabic line

// [date, place, WMO Region, local time]
const ROWS = {
  kyrgyz: ['8–11 SEP', 'KYRGYZSTAN', 'II', 'UTC+6'],
  tonga: ['16 SEP', 'TONGA', 'V', 'UTC+13'],
  // the order and the days of Wellington and Melbourne are not public; Jakarta's is (23 September)
  regionv: ['SEPTEMBER', 'NEW ZEALAND · AUSTRALIA · INDONESIA', 'V', 'UTC+7…+12'],
  bucharest: ['30 SEP–2 OCT', 'ROMANIA', 'VI', 'UTC+3'],
};

// three plates animate on their own local time (and the Issyk-Kul plate has a method named `speed`, the launch's, which
// the engine's own `speed` key would clash with), so their clock is set here: the plate is drawn at off + lt * k
const ON_CLOCK = (id, off, k = 1) => function (t, lt) { const c = off + lt * k; return SCENE_DEFS.get(id).draw.call(this, c, c); };

// one words set per stop: in after the dissolve, out before the next
const SET = { tin: 0.55, tout: 10.35 };

const TIMELINE = [
  // xf 0.01, not 0: the engine shows a scene from lt > -xf, so with 0 the title page would miss frame 0 (the thumbnail)
  { id: 'open', start: 0, dur: 3.0, xf: 0.01 },
  { id: 'kyrgyz', start: 3.0, dur: 11.0, xf: 0.7, draw: ON_CLOCK('kyrgyz', 4.5),
    words(t, lt) {
      registerRow(ROWS.kyrgyz, lt, this, { t0: 0.35, cps: 45 });
      wordSet(this, lt, { ...SET,
        kicker: 'BISHKEK · CHOLPON-ATA · 8–11 SEPTEMBER', head: 'Kyrgyzhydromet at 100',
        body: 'A century of service, marked at Lake Issyk-Kul with the CIS Interstate Council for Hydrometeorology.',
        ar: { kicker: 'بيشكيك · تشولبون-آتا · ' + AR('8–11') + ' سبتمبر', head: 'هيئة الأرصاد الجوية القيرغيزية في عامها المئة',
          body: 'قرنٌ من العطاء، احتُفي به على ضفاف بحيرة إيسيك-كول مع المجلس المشترك للأرصاد الجوية لرابطة الدول المستقلة.' } });
    } },
  { id: 'tonga', start: 14.0, dur: 11.0, xf: 0.7, draw: ON_CLOCK('tonga', 2.0),
    words(t, lt) {
      registerRow(ROWS.tonga, lt, this, { t0: 0.35, cps: 45 });
      wordSet(this, lt, { ...SET,
        kicker: 'NUKUʻALOFA · 16 SEPTEMBER', head: 'Weather Ready Pacific',
        body: 'Ministers adopted a new declaration for early warnings; HRH the Crown Prince received the WMO President.',
        ar: { kicker: 'نوكوألوفا · ' + AR('16') + ' سبتمبر', head: 'محيطٌ هادئ جاهزٌ لمواجهة الطقس',
          body: 'اعتمد الوزراء إعلاناً جديداً للإنذار المبكر، واستقبل صاحب السمو الملكي ولي العهد رئيسَ المنظمة.' } });
    } },
  { id: 'regionv', start: 25.0, dur: 11.0, xf: 0.7, draw: ON_CLOCK('regionv', 0.4, 1.45),
    words(t, lt) {
      registerRow(ROWS.regionv, lt, this, { t0: 0.35, cps: 55 });
      wordSet(this, lt, { ...SET,
        kicker: 'WELLINGTON · MELBOURNE · JAKARTA', head: 'Warnings around the clock',
        body: 'MetService, the Bureau of Meteorology and BMKG: forecast and warning rooms that never close.',
        ar: { kicker: 'ولينغتون · ملبورن · جاكرتا', head: 'إنذاراتٌ على مدار الساعة',
          body: 'هيئة الأرصاد الجوية النيوزيلندية، ومكتب الأرصاد الجوية الأسترالي، ووكالة الأرصاد الإندونيسية: غرف تنبؤٍ وإنذار لا تُغلق أبداً.' } });
      // each host named large beside its own city on the chart, all three together (their order is not public)
      const q = k => easeOut(prog(lt, 1.6 + 0.25 * k, 0.6)) * clamp((10.2 - lt) / 0.4);
      hostLabel('BMKG', 206, 352, q(0));
      hostLabel('BUREAU OF METEOROLOGY', 560, 690, q(1));
      hostLabel('METSERVICE', 862, 742, q(2));
    } },
  { id: 'bucharest', start: 36.0, dur: 11.0, xf: 0.7,
    words(t, lt) {
      registerRow(ROWS.bucharest, lt, this, { t0: 0.35, cps: 45 });
      wordSet(this, lt, { ...SET,
        kicker: 'BUCHAREST · 30 SEPTEMBER – 2 OCTOBER', head: 'Turning ambition into action',
        body: 'Region VI’s conference on Early Warnings for All, and the 19th session of Regional Association VI.',
        ar: { kicker: 'بوخارست · ' + AR('30') + ' سبتمبر – ' + AR('2') + ' أكتوبر', head: 'من الطموح إلى العمل',
          body: 'مؤتمر الإقليم السادس حول مبادرة الإنذار المبكر للجميع، والدورة التاسعة عشرة للرابطة الإقليمية السادسة.' } });
    } },
  { id: 'close', start: 47.0, dur: 12.5, xf: 0.7 },
];
