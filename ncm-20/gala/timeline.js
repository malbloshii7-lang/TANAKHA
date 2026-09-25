'use strict';
// The cut. Each entry places a scene: start and dur in seconds (on a 72 BPM grid: one bar = 3.333 s),
// speed (the scene's own clock rate), xf (length of the dissolve into it) and enter (fade | dawn | dusk | iris),
// cam (camera move), text (the words block: Arabic first) or words (custom typography).
// PROVISIONAL WORDING — to be replaced by the judged, edited copy in TREATMENT.md.
const BAR72 = 60 / 72 * 4;
const at = bars => +(bars * BAR72).toFixed(3);
const plate = (dur, s0 = 1.0, s1 = 1.06) => PLATE_LEFT(s0, s1, dur);
const TIMELINE = [
  { id: 'suhail', start: 0, dur: at(6), cam: t => camPath([{ t: 0, s: 1, px: 960, py: 560, sx: 960, sy: 560 }, { t: at(6), s: 1.14, px: 960, py: 700, sx: 960, sy: 640 }], t),
    words(t) { const out = wordsOut(this, 0.8); arLine('قبل أن تُبنى المدن، قرأ أهل هذه الأرض السماء', 960, 330, 3.6, t, { size: 60, align: 'center', font: F_NASKH, out, dur: 1.8 }); enLine('BEFORE THE CITIES ROSE, THE PEOPLE OF THIS LAND READ THE SKY', 960, 395, 5.2, t, { size: 22, align: 'center', ls: 4, out }); } },
  { id: 'durour', start: at(6), dur: at(3), speed: 11 / at(3), xf: 2.8, enter: { type: 'dawn' }, cam: plate(11),
    text: { kAr: 'حساب الدرور', kEn: 'THE DUROUR CALENDAR', ar: ['عدّوا أيام السنة', 'بطلوع سهيل'], en: ['THEY COUNTED THE YEAR', 'BY THE RISING OF SUHAIL'] } },
  { id: 'monsoon', start: at(9), dur: at(2.5), speed: 11 / at(2.5), xf: 0.8, cam: plate(11),
    text: { kAr: 'أحمد بن ماجد · جلفار · نحو ' + ltr('1490'), kEn: 'AHMAD IBN MAJID · JULFAR · c. 1490', ar: ['وأبحروا بعلم', 'الرياح والنجوم'], en: ['THEY SAILED BY THE KNOWLEDGE', 'OF WINDS AND STARS'] } },
  { id: 'pearling', start: at(11.5), dur: at(2.5), speed: 11 / at(2.5), xf: 0.8, cam: plate(11),
    text: { kAr: 'الغوص الكبير · من يونيو إلى سبتمبر', kEn: 'THE GREAT DIVE · JUNE TO SEPTEMBER', ar: ['وعرفوا كل ريح', 'باسمها'], en: ['THEY KNEW EVERY WIND', 'BY NAME'] } },
  { id: 'falaj', start: at(14), dur: at(2.5), speed: 11 / at(2.5), xf: 0.8, cam: plate(11),
    text: { kAr: 'هيلي · العين · العصر الحديدي', kEn: 'HILI · AL AIN · IRON AGE', ar: ['وأجروا الماء', 'في قلب الصحراء'], en: ['THEY CARRIED WATER', 'THROUGH THE DESERT'] } },
  { id: 'quote-zayed', use: 'quote', quote: 'zayed', start: at(16.5), dur: at(3), xf: 1.2 },
  { id: 'nation', start: at(19.5), dur: at(4), speed: 9 / at(4), xf: 1.6, enter: { type: 'iris', x: 800, y: 580 },
    text: { x: 1830, top: 300, arSize: 70, enSize: 30, kAr: 'المرسوم بقانون اتحادي رقم (6) لسنة ' + ltr('2007'), kEn: 'FEDERAL DECREE-LAW NO. 6 OF 2007', ar: ['مركزٌ وطني واحد', 'يرصد سماء الإمارات'], en: ['ONE NATIONAL CENTER', 'OBSERVING THE SKIES OF THE EMIRATES'] } },
  { id: 'airport', start: at(23.5), dur: at(2), speed: 1.1, xf: 0.8, cam: plate(8.8),
    text: { kAr: 'رصد جوي على مدار الساعة · ' + ltr('10') + ' مطارات', kEn: '24-HOUR AVIATION WEATHER WATCH · 10 AIRPORTS', ar: ['نقرأ السماء', 'لكل رحلة'], en: ['WE READ THE SKY', 'FOR EVERY FLIGHT'] } },
  { id: 'port', start: at(25.5), dur: at(2), speed: 1.1, xf: 0.8, cam: plate(8.8),
    text: { kAr: 'البحر · توقعات بحرية لخمسة أيام', kEn: 'AL BAHAR · 5-DAY MARINE FORECASTS', ar: ['ونقرأ البحر', 'لكل سفينة'], en: ['AND THE SEA', 'FOR EVERY SHIP'] } },
  { id: 'energy', start: at(27.5), dur: at(2), speed: 1.1, xf: 0.8, cam: plate(8.8),
    text: { kAr: 'توقعات لمحطات الطاقة الشمسية وطاقة الرياح', kEn: 'FORECASTS FOR SOLAR PLANTS AND WIND FARMS', ar: ['ونتنبأ بالشمس', 'والرياح'], en: ['WE FORECAST', 'THE SUN AND THE WIND'] } },
  { id: 'homes', start: at(29.5), dur: at(3), speed: 8 / at(3), xf: 1.0, cam: plate(8),
    text: { kAr: 'توقعات ' + ltr('11') + ' أبريل · إنذار أحمر ' + ltr('16') + ' أبريل ' + ltr('2024'), kEn: 'FORECAST 11 APRIL · RED ALERT 16 APRIL 2024', ar: ['أغزر أمطار منذ ' + ltr('1949'), 'وقد سبقها الإنذار'], en: ['THE HEAVIEST RAIN SINCE 1949', 'AND THE WARNING CAME FIRST'] } },
  { id: 'science', start: at(32.5), dur: at(2.5), speed: 11 / at(2.5), xf: 1.0, cam: plate(11),
    text: { kAr: 'برنامج الإمارات لبحوث علوم الاستمطار · منذ ' + ltr('2015'), kEn: 'UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · SINCE 2015', ar: ['ونبحث في علوم المطر', 'مع علماء العالم'], en: ['WE RESEARCH THE SCIENCE OF RAIN', 'WITH SCIENTISTS WORLDWIDE'] } },
  { id: 'quote-mansour', use: 'quote', quote: 'mansour', start: at(35), dur: at(3), xf: 1.2 },
  { id: 'world', start: at(38), dur: at(3), speed: 11 / at(3), xf: 1.4, enter: { type: 'iris', x: 560, y: 560 }, cam: plate(11),
    text: { kAr: 'رئاسة المنظمة العالمية للأرصاد الجوية · ' + ltr('2023–2027'), kEn: 'PRESIDENCY OF THE WORLD METEOROLOGICAL ORGANIZATION · 2023–2027', ar: ['ومن الإمارات', 'إلى العالم'], en: ['FROM THE UAE', 'TO THE WORLD'] } },
  { id: 'finale', start: at(41), dur: at(5), xf: 3.0, enter: { type: 'dusk' },
    words(t) { const out = wordsOut(this, 0.8); arLine('عشرون عاماً في قراءة السماء', 960, 240, 5.0, t, { size: 88, align: 'center', out, dur: 1.8 }); enLine('TWENTY YEARS OF READING THE SKY', 960, 312, 6.4, t, { size: 32, align: 'center', ls: 5, out }); } },
  { id: 'outro', start: at(46), dur: at(2.2), xf: 1.4 },
];
if (new URLSearchParams(location.search).has('hold')) { // the stage hold: the finale, still, as a 20 s loop
  TIMELINE.length = 0;
  TIMELINE.push({ id: 'hold', use: 'finale', start: 0, dur: 20, hold: true, loop: 20,
    words(t) { arLine('عشرون عاماً في قراءة السماء', 960, 240, -9, 9, { size: 88, align: 'center' }); enLine('TWENTY YEARS OF READING THE SKY', 960, 312, -9, 9, { size: 32, align: 'center', ls: 5 }); } });
  FADE_IN = 0; FADE_OUT = 0;
}
