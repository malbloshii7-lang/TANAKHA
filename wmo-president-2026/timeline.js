'use strict';
// The cut: every beat, its register row and its words, in film seconds (93.0 s at 30 fps). The screen is English; the
// Arabic beside each part goes to the SRT (subtitles.js), recorded from the build itself.
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

const TIMELINE = [
  { id: 'open', start: 0, dur: 7.0, xf: 0 },
  { id: 'kyrgyz', start: 7.0, dur: 17.0, xf: 0.9,
    words(t, lt) {
      registerRow(ROWS.kyrgyz, lt, this);
      wordSet(this, lt, { tin: 0.8, tout: 8.4,
        kicker: 'CHOLPON-ATA · LAKE ISSYK-KUL · 9–11 SEPTEMBER', head: 'A century of Kyrgyzhydromet',
        body: 'The CIS Interstate Council for Hydrometeorology held its 37th session as Kyrgyzstan’s national service marked its centenary, 1926–2026.',
        ar: { kicker: 'تشولبون-آتا · بحيرة إيسيك-كول · ' + AR('9–11') + ' سبتمبر', head: 'قرنٌ على تأسيس هيئة الأرصاد الجوية القيرغيزية',
          body: 'عقد المجلس المشترك للأرصاد الجوية لرابطة الدول المستقلة دورته السابعة والثلاثين، فيما احتفلت الهيئة الوطنية القيرغيزية بمئويتها ' + AR('(1926–2026)') + '.' } });
      wordSet(this, lt, { tin: 8.9, tout: 16.4,
        kicker: 'BISHKEK · 8 SEPTEMBER', head: 'Glaciers, dust and rivers',
        body: 'Talks with H.E. Kanatbek Chynybaev, Minister of Emergency Situations, on glacier monitoring, sand and dust storm warnings and hydrological forecasting.',
        ar: { kicker: 'بيشكيك · ' + AR('8') + ' سبتمبر', head: 'الأنهار الجليدية والغبار والأنهار',
          body: 'محادثات مع معالي كاناتبيك تشينيباييف، وزير حالات الطوارئ، حول رصد الأنهار الجليدية والإنذار بالعواصف الرملية والترابية والتنبؤات الهيدرولوجية.' } });
      print('kyrgyz-minister', 812, 668, 300, 210, 0.035, easeOut(prog(lt, 9.4, 0.9)) * wordsOut(this), 'With the Minister of Emergency Situations, Bishkek', { seed: 11 });
    } },
  { id: 'tonga', start: 24.0, dur: 17.0, xf: 0.9,
    words(t, lt) {
      registerRow(ROWS.tonga, lt, this);
      wordSet(this, lt, { tin: 0.8, tout: 8.4,
        kicker: 'NUKUʻALOFA · PMMM-4 · 16 SEPTEMBER', head: 'Weather Ready Pacific',
        body: 'Pacific ministers adopted the Siu-í-Álaimoana-Ki-Likutapu Declaration: stronger national services and multi-hazard early warnings.',
        ar: { kicker: 'نوكوألوفا · الاجتماع الوزاري الرابع للأرصاد الجوية في المحيط الهادئ · ' + AR('16') + ' سبتمبر', head: 'محيطٌ هادئ جاهزٌ لمواجهة الطقس',
          body: 'اعتمد وزراء المحيط الهادئ إعلان «سيو-إي-ألايموانا-كي-ليكوتابو» لتعزيز المرافق الوطنية وأنظمة الإنذار المبكر بالأخطار المتعددة.' } });
      wordSet(this, lt, { tin: 8.9, tout: 16.4,
        kicker: 'NUKUʻALOFA · 16 SEPTEMBER', head: 'Received in audience',
        body: 'by His Royal Highness Crown Prince Tupoutoʻa ʻUlukalala, with the Prime Minister, Hon. Lord Fakafanua, and Pacific ministers.',
        ar: { kicker: 'نوكوألوفا · ' + AR('16') + ' سبتمبر', head: 'في استقبالٍ ملكي',
          body: 'استقبله صاحب السمو الملكي ولي العهد توبوتوآ أولوكالالا، بحضور رئيس الوزراء اللورد فاكافانوا ووزراء دول المحيط الهادئ.' } });
      print('tonga-audience', 806, 664, 310, 214, -0.03, easeOut(prog(lt, 9.4, 0.9)) * wordsOut(this), 'Audience with HRH Crown Prince Tupoutoʻa ʻUlukalala', { seed: 23 });
    } },
  { id: 'regionv', start: 41.0, dur: 17.0, xf: 0.9,
    words(t, lt) {
      registerRow(ROWS.regionv, lt, this);
      wordSet(this, lt, { tin: 0.8, tout: 8.4,
        kicker: 'WELLINGTON · MELBOURNE', head: 'Forecasting around the clock',
        body: 'At MetService, the 24/7 forecast operations centre; at the Bureau of Meteorology, the Operations Centre and the Metrology Laboratory.',
        ar: { kicker: 'ولينغتون · ملبورن', head: 'تنبؤاتٌ على مدار الساعة',
          body: 'في هيئة الأرصاد الجوية النيوزيلندية مركز عمليات التنبؤ العامل على مدار الساعة، وفي مكتب الأرصاد الجوية الأسترالي مركز العمليات ومختبر المعايرة.' } });
      wordSet(this, lt, { tin: 8.9, tout: 16.4,
        kicker: 'JAKARTA · 23 SEPTEMBER', head: 'Tsunami, weather, climate',
        body: 'At BMKG headquarters, the operations rooms of Indonesia’s tsunami, weather and climate early warning systems.',
        ar: { kicker: 'جاكرتا · ' + AR('23') + ' سبتمبر', head: 'تسونامي وطقسٌ ومناخ',
          body: 'في مقر وكالة الأرصاد الجوية والمناخ والجيوفيزياء الإندونيسية، غرف عمليات أنظمة الإنذار المبكر بالتسونامي والطقس والمناخ.' } });
      const a = wordsOut(this);
      // each print beside its own city on the chart (Melbourne lies west of Wellington), none over a city's name
      print('bom', 250, 640, 250, 172, -0.04, easeOut(prog(lt, 1.6, 0.9)) * clamp((8.6 - lt) / 0.4) * a, 'Bureau of Meteorology, Melbourne', { seed: 37 });
      print('metservice', 812, 646, 250, 172, 0.035, easeOut(prog(lt, 2.4, 0.9)) * clamp((8.6 - lt) / 0.4) * a, 'MetService, Wellington', { seed: 31 });
      print('bmkg', 282, 650, 300, 206, 0.02, easeOut(prog(lt, 9.4, 0.9)) * a, 'BMKG headquarters, Jakarta', { seed: 41 });
    } },
  { id: 'bucharest', start: 58.0, dur: 17.0, xf: 0.9,
    words(t, lt) {
      registerRow(ROWS.bucharest, lt, this);
      wordSet(this, lt, { tin: 0.8, tout: 8.4,
        kicker: 'BUCHAREST · 30 SEPTEMBER – 1 OCTOBER', head: 'Turning ambition into action',
        body: 'Region VI’s Regional Conference on Early Warnings for All, hosted by Romania’s National Meteorological Administration.',
        ar: { kicker: 'بوخارست · ' + AR('30') + ' سبتمبر – ' + AR('1') + ' أكتوبر', head: 'من الطموح إلى العمل',
          body: 'المؤتمر الإقليمي للإقليم السادس حول مبادرة الإنذار المبكر للجميع، باستضافة الإدارة الوطنية للأرصاد الجوية في رومانيا.' } });
      wordSet(this, lt, { tin: 8.9, tout: 16.4,
        kicker: 'BUCHAREST · 1–2 OCTOBER', head: 'Regional Association VI',
        body: 'The second phase of its 19th session: the draft WMO Strategic Plan 2028–2031, and the election of its officers.',
        ar: { kicker: 'بوخارست · ' + AR('1–2') + ' أكتوبر', head: 'الرابطة الإقليمية السادسة',
          body: 'المرحلة الثانية من دورتها التاسعة عشرة: مشروع الخطة الاستراتيجية للمنظمة ' + AR('2028–2031') + '، وانتخاب أعضاء مكتبها.' } });
      print('bucharest', 806, 664, 310, 214, -0.03, easeOut(prog(lt, 9.4, 0.9)) * wordsOut(this), 'Bucharest: the Regional Conference and RA VI-19', { seed: 53 });
    } },
  { id: 'close', start: 75.0, dur: 18.0, xf: 0.9 },
];
