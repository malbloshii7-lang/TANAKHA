'use strict';
// The cut: the locked order of 26 Sep 2026 (TREATMENT.md, Revision 5), five acts in 10 beats, 52.5 bars at 72 BPM, 2:55.0.
//   Act 1, heritage: a black sky held, then Suhail rises; the star and the dhow (Ibn Majid); the falaj. Cut.
//   Act 2, the storm: 2007, one national center; the map of the seven emirates; April 2024, the red alert held.
//   Act 3, the hero: Etihad Rail in engraved 3D (lab/rail-3d.js): emerging from the Hajar, the worm's-eye pass, the rise.
//   Act 4, rain enhancement: one seeding shot, one research image.
//   Act 5, Suhail over the Abu Dhabi skyline; a short dedication; the title and the lockup. End.
// Cut from Revision 3: the Durour wheel, the pearling winds, the leaders' cards (quote walls), the working-day montage
// (airport, rail plate, port, tanker, energy), the world beat (the WMO globe) and the rain gauge.
// Words and narration are timed from their beat's start (s + ...), so beats can move without retiming.
// Each entry places a scene: start and dur in film seconds on the bar grid, speed (the scene's own clock rate; set it
// on every plate entry, or the v3 plate's own speed is inherited), offset (enter part-drawn), warp (a scene clock of its
// own), xf (length of the dissolve into it), enter (fade | dawn | dusk | iris), cam, tint, words.
// Level A echoes the narrator; Level B labels place, date, source. One idea a beat; sparse type.
const BAR72 = 60 / 72 * 4;
const at = bars => +(bars * BAR72).toFixed(3);
const filmT = (s, t) => s.start + t / (s.speed || 1); // film time from a scene's clock (measured from the cut)
const COL = { x: 1840 }; // the words column's right edge
CIRCLES.scope = { px: 1430, py: 700, r: 370 };

const SP = { monsoon: 1.2, falaj: 1.35, centre: 1.2, seeding: 1.1, science: 1.2 };
// The black sky: the film opens on the night held for one bar before the Suhail scene's own clock begins (its sky is
// computed for that earlier minute, Suhail still below the dunes), so every Suhail time is its scene time + HOLD.
const HOLD = at(1);
// The monsoon plate's circle is born at Suhail's point (the ring around the star is r 24) and settles by 3 s.
const MONSOON_CAM = lockCam(() => { const p = suhailScreen(at(4.5) - HOLD); return { sx: p[0], sy: p[1], R: 24 }; }, CIRCLES.monsoon,
  { off: 2.0, settle: 2.6 * SP.monsoon, dur: at(3.5) * SP.monsoon });
function monsoonCircle(f) { // the plate's circle on screen at film time f
  const c = MONSOON_CAM(2.0 + (f - at(4.5)) * SP.monsoon);
  return { sx: c.sx + (CIRCLES.monsoon.px - c.px) * c.s, sy: c.sy + (CIRCLES.monsoon.py - c.py) * c.s, R: CIRCLES.monsoon.r * c.s };
}
// April 2024: the storm's own clock stops for five seconds at its height, while the red alert reads (a held frame)
const RED_HOLD = { at: 7.5, len: 5.0 };
const redU = lt => lt < RED_HOLD.at ? lt : lt < RED_HOLD.at + RED_HOLD.len ? RED_HOLD.at : lt - RED_HOLD.len;
// The finale's words, from its start: the dedication, then the title, then the lockup (each switched at a cut, never
// crossfaded over another)
const FIN = { ded: [3.5, 10.5], title: 11.0, lockup: 12.7 };

// Act 3 claims only what NCM does (research of 25 Sep 2026, fact-checked and read by protocol): no NCM agreement with
// Etihad Rail is documented, so the beat names nothing but the place and the land. No container train on the Fujairah
// line (since 20 Sep 2026 it reads as the Hormuz bypass): the wagons carry stone, heading west from the Hajar.
// "Etihad Rail" on screen needs Etihad Rail's written clearance, through NCM; without it, name the national network.
const RAIL_NAME = { ar: 'قطارات الاتحاد', en: 'ETIHAD RAIL' }; // or { ar: 'شبكة السكك الحديدية الوطنية', en: 'NATIONAL RAIL NETWORK' }

const TIMELINE = [
  // Act 1 · B01 · Night: the black sky held, then Suhail rises
  { id: 'suhail', start: 0, dur: at(4.5), offset: -HOLD, cam: SUHAIL_CAM,
    words(t) { const f = filmT(this, t), [x, y] = suhailScreen(f - HOLD); levelB(f, HOLD + 8.0, HOLD + 11.6, 'سهيل', 'SUHAIL · CANOPUS', { x: x + 34, y: y - 48, align: 'left', arSize: 30, enSize: 15, gap: 24 }); } },
  // B02 · The star and the dhow: Ibn Majid and the monsoon (its circle born at Suhail's point)
  { id: 'monsoon', start: at(4.5), dur: at(3.5), speed: SP.monsoon, offset: 2.0, xf: 2.8, enter: { type: 'dawn' }, cam: MONSOON_CAM,
    words(t) { const f = filmT(this, t), s = this.start; levelB(f, s + 1.6, s + 9.0, 'أحمد بن ماجد · جلفار', 'AHMED BIN MAJID · JULFAR', { y: 330 }); } },
  // B03 · The aflaj, and Sheikh Zayed
  { id: 'falaj', start: at(8), dur: at(4.5), speed: SP.falaj, offset: 0.5, xf: 0.8,
    cam: t => camPath([{ t: 0, s: 1.04, px: 1300, py: 640, sx: 560, sy: 560 }, { t: 0.5 + at(4.5) * SP.falaj, s: 1.12, px: 1560, py: 660, sx: 560, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 1.1, s + 11.0, ['هيلي، العين · العصر الحديدي', 'قائمة التراث العالمي لليونسكو، ' + ltr('2011')], ['HILI, AL AIN · IRON AGE', 'UNESCO WORLD HERITAGE LIST, 2011'], { y: 330 });
    } },
  // Act 2 · B04 · 2007: one national center
  { id: 'centre', start: at(12.5), dur: at(2.5), speed: SP.centre, xf: 1.6, enter: { type: 'iris', x: 555, y: 675 }, cam: PLATE_LEFT(1.0, 1.12, at(2.5) * SP.centre),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.9, s + 7.9, 'المرسوم بقانون اتحادي رقم ' + ltr('(6)') + ' لسنة ' + ltr('2007'), 'FEDERAL DECREE-LAW NO. 6 OF 2007', { y: 330 });
      levelA(f, s + 4.0, s + 7.9, 'مركز وطني واحد', 'ONE NATIONAL CENTER', { y: 540, arSize: 96, enSize: 38 });
    } },
  // B05 · Seven emirates, one official source
  { id: 'nation', start: at(15), dur: at(3.5), xf: 1.6, enter: { type: 'iris', x: 554, y: 689 },
    cam(t) { const [hx, hy] = this.hq.xy; return camPath([{ t: 0, s: 2.2, px: hx, py: hy, sx: 554.4, sy: 688.8 }, { t: 3.67, s: 1.0, px: 960, py: 540, sx: 960, sy: 540 }, { t: at(3.5), s: 1.02, px: 960, py: 540, sx: 960, sy: 540 }], t); },
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelA(f, s + 6.467, s + 11.267, 'المرجع الرسمي للطقس', 'THE OFFICIAL SOURCE OF WEATHER INFORMATION', { y: 520, arSize: 64, enSize: 20 });
    } },
  // B06 · April 2024: the storm crosses the country; the red alert, held; the remembrance
  { id: 'homes', use: 'nation', storm: true, start: at(18.5), dur: at(8), xf: 1.0,
    warp: lt => 12 + redU(lt),
    cam: t => camPath([{ t: 12, s: 1.02, px: 960, py: 540, sx: 960, sy: 540 }, { t: 12 + at(8) - RED_HOLD.len, s: 1.05, px: 900, py: 540, sx: 960, sy: 540 }], t),
    tint(f) { const u = redU(f - this.start); return 0.34 * easeInOut(prog(u, 0.8, 7.2)) * (1 - easeInOut(prog(u, 12.5, 3.5))); },
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.7, s + 7.3, [ltr('16') + ' أبريل ' + ltr('2024'), 'أغزر أمطار منذ بدء جمع البيانات عام ' + ltr('1949')], ['16 APRIL 2024 · THE HEAVIEST RAINFALL', 'SINCE DATA COLLECTION BEGAN IN 1949'], { y: 640 });
      levelB(f, s + 7.6, s + RED_HOLD.at + RED_HOLD.len + 0.5, 'تنبؤات ' + ltr('14') + ' أبريل · إنذار أحمر ' + ltr('16') + ' أبريل', 'FORECASTS 14 APRIL · RED ALERT 16 APRIL', { y: 640 });
    } },
  // Act 3 · B07 · Across the land: Etihad Rail near Al Dhaid, in engraved 3D (one shot chain, lab/rail-3d-shot.js)
  { id: 'rail3d', start: at(26.5), dur: at(10), xf: 0.8,
    words(t) { r3words(filmT(this, t), this.start); } },
  // Act 4 · B08 · More rain from the clouds
  { id: 'seeding', start: at(36.5), dur: at(4.5), speed: SP.seeding, offset: 0.5, xf: 1.2, cam: t => PLATE_LEFT(1.0, 1.06, 0.5 + at(4.5) * SP.seeding)(t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.8, s + 11.0, 'جبال الحجر · رأس الخيمة', 'HAJAR MOUNTAINS · RAS AL KHAIMAH', { y: 330 });
    } },
  // B09 · The science of rain: one figure, a droplet growing on a salt nucleus (the physics of hygroscopic seeding)
  { id: 'science', start: at(41), dur: at(4.5), speed: SP.science, offset: 1.8, xf: 1.2, only: 1, enter: { type: 'iris', x: 640, y: 560 },
    cam: t => camPath([{ t: 1.8, s: 2.0, px: 1640, py: 330, sx: 640, sy: 560 }, { t: 1.8 + at(4.5) * SP.science, s: 2.12, px: 1640, py: 330, sx: 640, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.533, s + 11.0, 'برنامج الإمارات لبحوث علوم الاستمطار · منذ ' + ltr('2015'), 'UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · SINCE 2015', { y: 330, enSize: 17 });
    } },
  // Act 5 · B10 · Night: the same star over the capital; the dedication; the title; the lockup
  { id: 'finale', start: at(45.5), dur: at(7), xf: 3.0, enter: { type: 'dusk' },
    cam: t => camPath([{ t: 0, s: 1.0, px: 977, py: 698, sx: 977, sy: 698 }, { t: 5.0, s: 1.04, px: 977, py: 698, sx: 977, sy: 698 }], t),
    words(t) { finaleWords(this, filmT(this, t)); } },
];

// ?pull=<beat ids, comma-separated> takes beats out and closes the cut up behind them: every later beat
// moves up by the pulled beat's length, and its narration goes with it, so nothing needs re-timing.
const PULLED = (new URLSearchParams(location.search).get('pull') || '').split(',').filter(Boolean);
PULLED.forEach(id => {
  const i = TIMELINE.findIndex(e => e.id === id);
  if (i < 0) throw new Error(`?pull: there is no beat "${id}"`);
  const [e] = TIMELINE.splice(i, 1);
  TIMELINE.forEach(x => { if (x.start > e.start) x.start = +(x.start - e.dur).toFixed(3); });
});

// a beat's start in film seconds, captured here, before a ?hold empties TIMELINE
const STARTS = Object.fromEntries(TIMELINE.map(e => [e.id, e.start])), START = id => STARTS[id];
const DURS = Object.fromEntries(TIMELINE.map(e => [e.id, e.dur])), durOf = id => DURS[id];

// the dedication, the title and the lockup over the night (also the stage hold's frame)
function finaleWords(s, f, { title = true, lockup = true, dedication = false } = {}) {
  const hold = !!s.hold, b = START('finale'), e = b + durOf('finale');
  if (s.suhailXY && !hold) { const c = s.cam(f - s.start), x = c.sx + (s.suhailXY[0] - c.px) * c.s, y = c.sy + (s.suhailXY[1] - c.py) * c.s; levelB(f, b + 2.867, 1e9, 'سهيل', 'SUHAIL', { x: x + 70, y: y + 8, align: 'left', arSize: 30, enSize: 15 }); }
  // the film's short dedication (VO-15a), up before the title and gone before it comes
  if (!hold) levelB(f, b + FIN.ded[0], b + FIN.ded[1], ['إلى المتنبئين الجويين والراصدين وعلماء الزلازل،', 'والطيارين والمهندسين والعلماء'], ['TO THE FORECASTERS, OBSERVERS AND SEISMOLOGISTS,', 'THE PILOTS, ENGINEERS AND SCIENTISTS'], { x: 960, y: 200, align: 'center', arSize: 40, enSize: 18, gap: 36 });
  if (TEXT_REC && !hold) { recText('title', b + FIN.title, e, ['عشرون عاماً في قراءة السماء'], ['TWENTY YEARS OF READING THE SKY']); recText('lockup', b + FIN.lockup, e, ['المركز الوطني للأرصاد', ltr('2007–2027')], ['NATIONAL CENTER OF METEOROLOGY', '2007–2027']); }
  if (title) { arLine('عشرون عاماً في قراءة السماء', 960, 240, hold ? -9 : b + FIN.title, hold ? 9 : f, { size: 88, align: 'center', dur: 1.6 }); enLine('TWENTY YEARS OF READING THE SKY', 960, 312, hold ? -9 : b + FIN.title + 0.667, hold ? 9 : f, { size: 32, align: 'center', ls: 5 }); }
  if (dedication) { levelB(9, 0, 1e9, ['إلى المتنبئين الجويين والراصدين وعلماء الزلازل، والطيارين والمهندسين والعلماء،', 'وكل العاملين في المركز الوطني للأرصاد'], ['TO THE FORECASTERS, OBSERVERS, SEISMOLOGISTS, PILOTS, ENGINEERS AND SCIENTISTS,', 'AND EVERYONE WHO SERVES AT THE NATIONAL CENTER OF METEOROLOGY'], { x: 960, y: 200, align: 'center', arSize: 40, enSize: 18, gap: 36 }); }
  if (lockup) {
    const q = hold ? 1 : easeOut(prog(f, b + FIN.lockup, 1.4)), ar = 'المركز الوطني للأرصاد', en = 'NATIONAL CENTER OF METEOROLOGY';
    const wa = textWidth(ar, `700 46px ${F_KUFI}`, 0, 'rtl'), we = textWidth(en, `600 20px ${F_HEAD}`, 0), ls = Math.max(0, (wa - we) / (en.length - 1));
    smallAr(ar, 960, 402, q, { size: 46, align: 'center', a: 0.92, weight: 700 });
    small(en, 960 + ls / 2, 438, q, { size: 20, ls, align: 'center', a: 0.85, weight: 600, font: F_HEAD });
    ruleWithStar(960, 468, wa / 2 - 24, q, 0.55);
    smallAr(ltr('2007–2027'), 960, 506, q, { size: 24, align: 'center', a: 0.75 });
  }
}

// The persistent gold ring: born around Suhail as it clears the dunes, carried into the monsoon plate's circle (the
// star to the navigator's compass).
const suhailAt = f => suhailScreen(f - HOLD), monsoonT0 = at(4.5);
const RING = [
  { t: HOLD + 9.2, x: f => suhailAt(f)[0], y: f => suhailAt(f)[1], r: 24, a: 0.9, p: 0 },
  { t: HOLD + 10.0, x: f => suhailAt(f)[0], y: f => suhailAt(f)[1], r: 24, a: 0.9, p: 1 },
  { t: monsoonT0, x: f => monsoonCircle(f).sx, y: f => monsoonCircle(f).sy, r: f => monsoonCircle(f).R, a: 0.9, p: 1 },
  { t: monsoonT0 + 2.9, x: f => monsoonCircle(f).sx, y: f => monsoonCircle(f).sy, r: f => monsoonCircle(f).R, a: 0.85, p: 1 },
  { t: monsoonT0 + 3.7, x: f => monsoonCircle(f).sx, y: f => monsoonCircle(f).sy, r: f => monsoonCircle(f).R, a: 0, p: 1 },
];

// The narration (TREATMENT.md §6), for the scratch subtitles (?vo), the VO subtitle files and the score's ducking.
const VO = [
  { id: 'VO-01', in: +(HOLD + 2.2).toFixed(3), out: +(HOLD + 7.8).toFixed(3), ar: 'قبلَ الراداراتِ والأقمارِ الاصطناعيّةِ بزمنٍ طويل، قرَأَ أهلُ هذهِ الأرضِ السماءَ… ليَعيشوا.', en: 'Long before radar and satellites, the people of this land read the sky… to live.' },
  { id: 'VO-03', beat: 'monsoon', in: 1.6, out: 7.2, ar: 'ومِن جُلْفار، وقَّتَ ابنُ ماجدٍ أسفارَهُ برياحِ الموسِم، وقاسَ ارتفاعَ النُّجومِ بالأصابِع.', en: 'From Julfar, Ahmed bin Majid timed his voyages by the monsoon winds and measured star heights in fingers.' },
  { id: 'VO-05', beat: 'falaj', in: 0.667, out: 8.267, ar: 'وفي العَين، تقاسَموا الماءَ بالأفلاج، وأحياها المغفورُ لهُ الشيخُ زايد بن سلطان آل نَهْيان، طيَّبَ اللهُ ثَراه.', en: 'In Al Ain they shared out the water through the aflaj, and the Founding Father, the late Sheikh Zayed bin Sultan Al Nahyan, restored them.' },
  { id: 'VO-06', beat: 'centre', in: 0.3, out: 6.7, ar: 'في عامِ ألفَينِ وسبعة، جمَعَتِ الدولةُ خدَماتِ الأرصادِ وأبحاثَ الغِلافِ الجوّيِّ في مركزٍ وطنيٍّ واحد،', sub: 'في عام ' + ltr('2007') + '، جمعت الدولة خدمات الأرصاد وأبحاث الغلاف الجوّيّ في مركز وطني واحد،', en: 'In 2007 the nation brought its weather service and atmospheric research together in one national center,' },
  { id: 'VO-07', beat: 'nation', in: 0.267, out: 9.867, ar: 'أسَّسَهُ بمرسومٍ بقانونٍ اتّحاديٍّ المغفورُ لهُ الشيخُ خليفة بن زايد آل نَهْيان، طيَّبَ اللهُ ثَراه، والمركزُ اليومَ المرجعُ الرسميُّ للطقسِ في الإماراتِ السَّبْع.', en: 'which the late Sheikh Khalifa bin Zayed Al Nahyan established by federal decree-law. Today it is the official source of weather information for all seven emirates.' },
  { id: 'VO-08a', beat: 'homes', in: 1.0, out: 7.0, ar: 'وفي أبريلَ ألفَينِ وأربعةٍ وعشرين، شهِدَتِ الدولةُ أغزرَ أمطارٍ في سِجِلّاتِها.', sub: 'وفي أبريل ' + ltr('2024') + '، شهدت الدولة أغزر أمطار في سجلّاتها.', en: 'In April 2024 the country saw the heaviest rainfall on record.' },
  { id: 'VO-08b', beat: 'homes', in: 7.7, out: 12.9, ar: 'وكانَ المركزُ قد توقَّعَ تزايُدَ عدمِ الاستقرارِ قبلَ يومَين، ثمَّ أصدرَ إنذاراً أحمرَ.', en: 'Two days before, the Center had forecast growing instability; then it issued a red alert.' },
  { id: 'VO-08c', beat: 'homes', in: 17.6, out: 22.2, ar: 'نستحضِرُ تلكَ الأيّامَ العصيبة، ونُحيّي كلَّ مَن سهِرَ على سلامةِ الناس.', en: "We remember those difficult days, and we honour all who kept watch over people's safety." },
  { id: 'VO-12', beat: 'seeding', in: 0.5, out: 7.4, ar: 'وفي أرضٍ يقِلُّ مطرُها عن مِئةِ مِلّيمترٍ في العامِ المُعتاد، سعَينا إلى استمطارِ السَّحاب.', sub: 'وفي أرض يقلّ مطرها عن ' + ltr('100') + ' ملّيمتر في العام المعتاد، سعينا إلى استمطار السحاب.', en: 'In a land with less than 100 millimetres of rain in a typical year, we sought more rain from the clouds.' },
  { id: 'VO-13', beat: 'science', in: 1.333, out: 5.333, ar: 'ثمَّ استثمَرْنا في العلمِ نفسِه، للدُّوَلِ التي تُواجِهُ شُحَّ المياه.', en: 'Then we invested in the science itself, for the countries facing water scarcity.' },
  { id: 'VO-15a', beat: 'finale', in: 3.6, out: 7.5, ar: 'إلى المتنبِّئينَ الجوّيّينَ والراصِدينَ وعلماءِ الزلازل، والطيّارينَ والمهندسينَ والعلماء…', en: 'To the forecasters, observers and seismologists, the pilots, engineers and scientists…' },
  { id: 'VO-15b', beat: 'finale', in: 8.2, out: 10.4, ar: 'عِشرونَ عاماً من رَصْدِ السماء…', en: 'twenty years of watching the sky…' },
  { id: 'VO-16', beat: 'finale', in: 11.4, out: 14.2, ar: 'ليُخطِّطَ الوطنُ لغدِهِ بثِقة.', en: 'so the nation can plan for tomorrow with confidence.' },
];
// narration lines tied to a beat are timed from that beat's start, so the cut can change without retiming them; a
// pulled beat's lines go with it
for (let i = VO.length - 1; i >= 0; i--) if (PULLED.includes(VO[i].beat)) VO.splice(i, 1);
VO.forEach(v => { if (v.beat) { const s = START(v.beat); v.in = +(s + v.in).toFixed(3); v.out = +(s + v.out).toFixed(3); delete v.beat; } });
// Subtitles are set without the narrator's vowels: keep the shadda and the tanween on alif, drop the rest.
// (and the shadda on a sun letter after the article, which plain text never writes: «السّنة» becomes «السنة»).
const voSubAr = v => v.sub || v.ar.replace(/[\u064C-\u0650\u0652]/g, '').replace(/(^|[\s«(،])([وفبكل]?ال|[وف]?لل)([^\s\u0651])\u0651/g, '$1$2$3');

// The stage holds (?hold=A|B|C), each a seamless loop:
//   A: title and lockup · B: the dedication to the Center's people, with the lockup · C: sky and ring only, dimmed, for
//   speeches (20 s, the finale's last frame, alive).
{
  const q = new URLSearchParams(location.search);
  if (q.has('hold')) {
    const v = (q.get('hold') || 'A').toUpperCase();
    TIMELINE.length = 0; RING.length = 0;
    TIMELINE.push({ id: 'hold', use: 'finale', start: 0, dur: 20, hold: true, loop: 20, dim: v === 'C' ? 0.7 : 0,
      cam: () => ({ s: 1.04, px: 977, py: 698, sx: 977, sy: 698 }),
      words() { if (v !== 'C') finaleWords(this, 0, { title: v === 'A', lockup: true, dedication: v === 'B' }); } });
    FADE_IN = 0; FADE_OUT = 0;
  }
}
