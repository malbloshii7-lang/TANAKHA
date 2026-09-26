'use strict';
// The cut, from TREATMENT.md (§4, §5, §7, Appendix A.1, Revisions 2 and 3): 21 beats, 54 bars at 72 BPM, 3:00.0
// (20 beats and 2:55.0 with the tanker pulled: ?pull=tanker).
// From B10 on, words and narration are timed from their beat's start (s + ...), so beats can move without retiming.
// Each entry places a scene: start and dur in film seconds on the bar grid, speed (the scene's own clock rate; set it
// on every plate entry, or the v3 plate's own speed is inherited),
// offset (enter part-drawn), xf (length of the dissolve into it), enter (fade | dawn | dusk | iris), cam, tint, words.
// Words use film time f and the in/out times of §7. Level A echoes the narrator; Level B labels place, date, source.
const BAR72 = 60 / 72 * 4;
const at = bars => +(bars * BAR72).toFixed(3);
const filmT = (s, t) => s.start + t / (s.speed || 1); // film time from a scene's clock (measured from the cut)
const COL = { x: 1840 }; // the words column's right edge
CIRCLES.scope = { px: 1430, py: 700, r: 370 };
CIRCLES.gauge = { px: 1500, py: 150, r: 108 };

// B02's camera: the Durour wheel is born at Suhail's point (the ring around the star is r 24) and settles by 3 s
const SP = { durour: 1.3, monsoon: 1.2, pearling: 1.3, falaj: 1.35, centre: 1.2, airport: 1.0, port: 1.2, energy: 1.2, seeding: 1.1, science: 1.2 };
const DUROUR_CAM = lockCam(() => { const p = suhailScreen(at(3.5)); return { sx: p[0], sy: p[1], R: 24 }; }, CIRCLES.durour,
  { settle: 3.0 * SP.durour, dur: at(2) * SP.durour });
function durourCircle(f) { // the wheel's outer ring on screen at film time f
  const sl = (f - at(3.5)) * SP.durour, c = DUROUR_CAM(sl), z = 1 + 0.03 * easeInOut(clamp(sl / 11));
  return { sx: c.sx + (CIRCLES.durour.px - c.px) * c.s, sy: c.sy + (CIRCLES.durour.py - c.py) * c.s, R: CIRCLES.durour.r * c.s * z };
}
const MONSOON_CAM = lockCam(() => durourCircle(at(5.5)), CIRCLES.monsoon, { off: 2.0, settle: 2.6 * SP.monsoon, dur: at(1.5) * SP.monsoon });
function monsoonCircle(f) {
  const c = MONSOON_CAM(2.0 + (f - at(5.5)) * SP.monsoon);
  return { sx: c.sx + (CIRCLES.monsoon.px - c.px) * c.s, sy: c.sy + (CIRCLES.monsoon.py - c.py) * c.s, R: CIRCLES.monsoon.r * c.s };
}
const WORLD_CAM = t => camPath([{ t: 0, s: 1.0, px: 1435, py: 585, sx: 560, sy: 560 }, { t: 4.0, s: 1.0, px: 1435, py: 585, sx: 560, sy: 560 },
  { t: 7.5, s: 1.3, px: 1322, py: 428, sx: 470, sy: 430 }, { t: 10.5, s: 1.0, px: 1435, py: 585, sx: 560, sy: 560 }], t);

// B11 and B13, added in Revision 3. Each claims only what NCM does (research of 25 Sep 2026, fact-checked and read by
// protocol): no NCM agreement with Etihad Rail or with ADNOC is documented, so the rail beat names NCM's public dust and
// fog warnings (addressed to the public, never to a railway) and the tanker beat names the east-coast marine bulletin,
// which NCM's AI assistant drafts and a forecaster approves.
// Never "safe passage" or «عبور آمن»: in the 2026 Hormuz context it would be heard as a security claim.
// No company name, livery or product on the tanker (ADNOC ships were being attacked in 2026; Murban is a traded
// benchmark), and no container train on the Fujairah line (since 20 Sep 2026 it reads as the Hormuz bypass).
// "Etihad Rail" on screen needs Etihad Rail's written clearance, through NCM; without it, name the national network.
const RAIL_NAME = { ar: 'قطارات الاتحاد', en: 'ETIHAD RAIL' }; // or { ar: 'شبكة السكك الحديدية الوطنية', en: 'NATIONAL RAIL NETWORK' }
const RAIL_BEAT = { id: 'rail', start: at(27), dur: at(1.5), speed: 1, offset: 1.0, xf: 0.5, cam: PLATE_LEFT(1.0, 1.04, 1.0 + at(1.5)),
  words(t) {
    const f = filmT(this, t), s = this.start;
    // every label here is up for at least 3 s plus 0.3 s a word (critique M1), inside the beat's own dissolves
    levelB(f, s + 0.25, s + 4.75, RAIL_NAME.ar + ' · الذيد، الشارقة', RAIL_NAME.en + ' · AL DHAID, SHARJAH', { y: 330 });
    levelA(f, s + 0.7, s + 4.75, 'على امتداد البر', 'ACROSS THE LAND', { y: 520 });
  } };
// The tanker beat can be pulled at the go/no-go checks (two weeks and 72 hours before the ceremony) with ?pull=tanker;
// it never goes into a cut-down, a social clip or the international version.
const TANKER_BEAT = { id: 'tanker', start: at(30), dur: at(1.5), speed: 1, offset: 1.4, xf: 0.5, cam: PLATE_LEFT(1.15, 1.2, 1.4 + at(1.5), 1435, 540),
  words(t) {
    const f = filmT(this, t), s = this.start;
    levelB(f, s + 0.3, s + 4.75, 'الفجيرة · بحر عُمان', 'FUJAIRAH · SEA OF OMAN', { y: 330 });
    levelA(f, s + 0.5, s + 4.75, 'للساحل الشرقي', 'FOR THE EAST COAST', { y: 520 });
  } };

const TIMELINE = [
  // B01 · Night: Suhail rises
  { id: 'suhail', start: 0, dur: at(3.5), cam: SUHAIL_CAM,
    words(t) { const f = filmT(this, t), [x, y] = suhailScreen(f); levelB(f, 8.0, 11.6, 'سهيل', 'SUHAIL · CANOPUS', { x: x + 34, y: y - 48, align: 'left', arSize: 30, enSize: 15, gap: 24 }); } },
  // B02 · The Durour wheel
  { id: 'durour', start: at(3.5), dur: at(2), speed: SP.durour, xf: 2.8, enter: { type: 'dawn' }, cam: DUROUR_CAM,
    words(t) {
      const f = filmT(this, t);
      levelB(f, 12.5, 18.0, 'حساب الدرور · ' + ltr('36') + ' دَرّاً × ' + ltr('10') + ' أيام + ' + ltr('5') + ' أيام', 'THE DUROUR CALENDAR · 36 × 10 DAYS + 5 DAYS', { y: 330 });
      levelA(f, 12.9, 18.0, 'عدّوا أيام السنة', 'THEY COUNTED THE DAYS OF THE YEAR', { y: 520 });
    } },
  // B03 · Ibn Majid and the monsoon
  { id: 'monsoon', start: at(5.5), dur: at(1.5), speed: SP.monsoon, offset: 2.0, xf: 0.8, cam: MONSOON_CAM,
    words(t) { const f = filmT(this, t); levelB(f, 18.9, 23.2, 'أحمد بن ماجد · جلفار', 'AHMED BIN MAJID · JULFAR', { y: 330 }); } },
  // B04 · Every wind by name
  { id: 'pearling', start: at(7), dur: at(1.5), speed: SP.pearling, offset: 0.8, xf: 0.8,
    cam: lockCam(() => monsoonCircle(at(7)), CIRCLES.pearling, { off: 0.8, settle: 2.0 * SP.pearling,
      then: [{ t: 6.5 * SP.pearling, s: 0.95, px: 1435, py: 700, sx: 560, sy: 560 }] }),
    words(t) {
      const f = filmT(this, t);
      levelB(f, 23.9, 28.0, 'الغوص الكبير', 'THE GREAT DIVE', { y: 330 });
    } },
  // B05 · The aflaj, and Sheikh Zayed
  { id: 'falaj', start: at(8.5), dur: at(2.5), speed: SP.falaj, offset: 0.5, xf: 0.8,
    cam: t => camPath([{ t: 0, s: 1.04, px: 1300, py: 640, sx: 560, sy: 560 }, { t: 0.5 + at(2.5) * SP.falaj, s: 1.10, px: 1560, py: 660, sx: 560, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t);
      levelB(f, 29.4, 35.5, ['هيلي، العين · العصر الحديدي', 'قائمة التراث العالمي لليونسكو، ' + ltr('2011')], ['HILI, AL AIN · IRON AGE', 'UNESCO WORLD HERITAGE LIST, 2011'], { y: 330 });
    } },
  // B06 · Card: the Founding Father (no VO)
  { id: 'quote-zayed', use: 'quote', quote: 'zayed', start: at(11), dur: at(3.5), xf: 1.2 },
  // B07 · 2007: one national center
  { id: 'centre', start: at(14.5), dur: at(2.5), speed: SP.centre, xf: 1.6, enter: { type: 'iris', x: 555, y: 675 }, cam: PLATE_LEFT(1.0, 1.12, at(2.5) * SP.centre),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.9, s + 7.9, 'المرسوم بقانون اتحادي رقم ' + ltr('(6)') + ' لسنة ' + ltr('2007'), 'FEDERAL DECREE-LAW NO. 6 OF 2007', { y: 330 });
      levelA(f, s + 4.0, s + 7.9, 'مركز وطني واحد', 'ONE NATIONAL CENTER', { y: 540, arSize: 96, enSize: 38 });
    } },
  // B08 · Seven emirates, one official source
  { id: 'nation', start: at(17), dur: at(3.5), xf: 1.6, enter: { type: 'iris', x: 554, y: 689 },
    cam(t) { const [hx, hy] = this.hq.xy; return camPath([{ t: 0, s: 2.2, px: hx, py: hy, sx: 554.4, sy: 688.8 }, { t: 3.67, s: 1.0, px: 960, py: 540, sx: 960, sy: 540 }, { t: at(3.5), s: 1.02, px: 960, py: 540, sx: 960, sy: 540 }], t); },
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelA(f, s + 6.467, s + 11.267, 'المرجع الرسمي للطقس', 'THE OFFICIAL SOURCE OF WEATHER INFORMATION', { y: 520, arSize: 64, enSize: 20 });
    } },
  // B09 · April 2024
  { id: 'homes', use: 'nation', storm: true, start: at(20.5), dur: at(5), offset: 12, xf: 1.0,
    cam: t => camPath([{ t: 12, s: 1.02, px: 960, py: 540, sx: 960, sy: 540 }, { t: 12 + at(5), s: 1.05, px: 900, py: 540, sx: 960, sy: 540 }], t),
    tint(f) { const s = this.start; return 0.34 * easeInOut(prog(f, s + 0.8, 7.2)) * (1 - easeInOut(prog(f, s + 12.5, 3.5))); },
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.7, s + 7.3, [ltr('16') + ' أبريل ' + ltr('2024'), 'أغزر أمطار منذ بدء جمع البيانات عام ' + ltr('1949')], ['16 APRIL 2024 · THE HEAVIEST RAINFALL', 'SINCE DATA COLLECTION BEGAN IN 1949'], { y: 640 });
      levelB(f, s + 7.4, s + 12.6, 'تنبؤات ' + ltr('14') + ' أبريل · إنذار أحمر ' + ltr('16') + ' أبريل', 'FORECASTS 14 APRIL · RED ALERT 16 APRIL', { y: 640 });
    } },
  // B10 · For every flight
  { id: 'airport', start: at(25.5), dur: at(1.5), speed: SP.airport, offset: 1.1, xf: 1.0, cam: PLATE_LEFT(1.0, 1.05, 1.1 + at(1.5)),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.55, s + 4.75, 'مطار زايد الدولي · أبوظبي', 'ZAYED INTERNATIONAL AIRPORT · ABU DHABI', { y: 330 });
      levelA(f, s + 0.85, s + 4.75, 'لكل رحلة', 'FOR EVERY FLIGHT', { y: 520 });
    } },
  // B11 · Across the land (Etihad Rail near Al Dhaid, Sharjah)
  RAIL_BEAT,
  // B12 · For every ship
  { id: 'port', start: at(28.5), dur: at(1.5), speed: SP.port, offset: 1.5, xf: 0.5,
    cam: t => camPath([{ t: 1.5, s: 1.0, px: 1400, py: 585, sx: 560, sy: 560 }, { t: 1.5 + at(1.5) * SP.port, s: 1.04, px: 1470, py: 585, sx: 560, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.333, s + 4.633, 'ميناء جبل علي · دبي', 'JEBEL ALI PORT · DUBAI', { y: 330 });
      levelA(f, s + 0.733, s + 4.633, 'لكل سفينة', 'FOR EVERY SHIP', { y: 520 });
    } },
  // B13 · For the east coast (a laden tanker under way off Fujairah; removable with ?pull=tanker)
  TANKER_BEAT,
  // B14 · For clean energy
  { id: 'energy', start: at(31.5), dur: at(1.5), speed: SP.energy, offset: 1.0, xf: 0.5,
    cam: t => camPath([{ t: 1.0, s: 1.0, px: 1435, py: 620, sx: 560, sy: 560 }, { t: 1.0 + at(1.5) * SP.energy, s: 1.05, px: 1435, py: 540, sx: 560, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.2, s + 4.4, 'شمس ' + ltr('1') + ' · منطقة الظفرة', 'SHAMS 1 · AL DHAFRA', { y: 330 });
      levelA(f, s + 0.433, s + 4.4, 'للطاقة النظيفة', 'FOR CLEAN ENERGY', { y: 520 });
    } },
  // B15 · Card: HH the President (reported speech, no VO)
  { id: 'quote-president', use: 'quote', quote: 'president', start: at(33), dur: at(3.5), xf: 1.2 },
  // B16 · More rain from the clouds
  { id: 'seeding', start: at(36.5), dur: at(2), speed: SP.seeding, offset: 0.5, xf: 1.2, cam: t => PLATE_LEFT(1.0, 1.06, 0.5 + at(2) * SP.seeding)(t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.8, s + 6.3, 'جبال الحجر · رأس الخيمة', 'HAJAR MOUNTAINS · RAS AL KHAIMAH', { y: 330 });
    } },
  // B17 · The science of rain
  { id: 'science', start: at(38.5), dur: at(2), speed: SP.science, offset: 1.8, xf: 1.2, enter: { type: 'iris', x: 576, y: 458 },
    cam: t => camPath([{ t: 1.8, s: 2.2, px: 1210, py: 318, sx: 576, sy: 458 }, { t: 1.8 + 2.6 * SP.science, s: 1.0, px: 1435, py: 585, sx: 560, sy: 560 }, { t: 1.8 + at(2) * SP.science, s: 1.02, px: 1435, py: 585, sx: 560, sy: 560 }], t),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 0.533, s + 6.3, 'برنامج الإمارات لبحوث علوم الاستمطار · منذ ' + ltr('2015'), 'UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE · SINCE 2015', { y: 330, enSize: 17 });
    } },
  // B18 · Card: HH Sheikh Mansour bin Zayed (no VO)
  { id: 'quote-mansour', use: 'quote', quote: 'mansour_iref', start: at(40.5), dur: at(3.5), xf: 1.2 },
  // B19 · From the skies of the Emirates to the world
  { id: 'world', start: at(44), dur: at(3.5) + 0.5, speed: 1, xf: 1.4, enter: { type: 'iris', x: 555, y: 535 }, cam: WORLD_CAM,
    words(t) { worldWords(filmT(this, t)); } },
  // B20 · Twenty years
  { id: 'gauge', start: at(47.5) + 0.5, dur: at(3.5) - 0.5, speed: 1, xf: 1.0, t20: 6.167, dt: 60 / 72 / 4, // 0.5 s after the split (where its dissolve begins); the 20th drop lands 6.167 s after its start
    cam: lockCam(() => { const c = WORLD_CAM(at(3.5)); return { sx: c.sx + (1430 - c.px) * c.s, sy: c.sy + (560 - c.py) * c.s, R: 318 * c.s }; }, CIRCLES.gauge,
      { settle: 1.833, py: 610, then: [{ t: at(3.5), s: 1.0, px: 1435, py: 610, sx: 560, sy: 560 }] }),
    words(t) {
      const f = filmT(this, t), s = this.start;
      levelB(f, s + 2.633, s + 9.433, ['إلى المتنبئين الجويين والراصدين وعلماء الزلازل،', 'والطيارين والمهندسين والعلماء'], ['TO THE FORECASTERS, OBSERVERS AND SEISMOLOGISTS,', 'THE PILOTS, ENGINEERS AND SCIENTISTS'], { y: 330, arSize: 30, enSize: 16 });
      levelA(f, s + 6.333, s + 9.933, 'عشرون عاماً', 'TWENTY YEARS', { y: 580, arSize: 120, enSize: 44 });
    } },
  // B21 · Night: the same star; title; lockup
  { id: 'finale', start: at(51), dur: at(3), xf: 3.0, enter: { type: 'dusk' },
    cam: t => camPath([{ t: 0, s: 1.0, px: 977, py: 698, sx: 977, sy: 698 }, { t: 5.0, s: 1.04, px: 977, py: 698, sx: 977, sy: 698 }], t),
    words(t) { finaleWords(this, filmT(this, t)); } },
];

// ?pull=tanker (or any beat ids, comma-separated) takes beats out and closes the cut up behind them: every later beat
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

// B17's words; `out` is Infinity in the applause hold, so the office and the name stay up until the caller releases it
function worldWords(f, out = START('world') + 12.1) {
  const s = START('world');
  // set below the pins (their labels reach x ~1350 at y 400-560 while the camera pushes toward Geneva)
  levelA(f, s + 2.2, s + 7.9, ['من سماء الإمارات', 'إلى العالم'], 'FROM THE SKIES OF THE EMIRATES TO THE WORLD', { y: 640, arSize: 92, enSize: 32 });
  levelB(f, s + 8.0, out, 'رئاسة المنظمة العالمية للأرصاد الجوية · ' + ltr('2023–2027'), ['PRESIDENCY OF THE WORLD METEOROLOGICAL', 'ORGANIZATION · 2023–2027'], { y: 640, arSize: 28, enSize: 17 });
  levelB(f, s + 9.6, out, 'معالي الدكتور عبدالله أحمد المندوس', 'HIS EXCELLENCY DR ABDULLA AHMED AL MANDOUS', { y: 790, arSize: 28, enSize: 16 });
}

// the title and the lockup over the night (also the stage hold's frame)
function finaleWords(s, f, { title = true, lockup = true, dedication = false } = {}) {
  const hold = !!s.hold, b = START('finale');
  if (s.suhailXY && !hold) { const c = s.cam(f - s.start), x = c.sx + (s.suhailXY[0] - c.px) * c.s, y = c.sy + (s.suhailXY[1] - c.py) * c.s; levelB(f, b + 2.867, 1e9, 'سهيل', 'SUHAIL', { x: x + 70, y: y + 8, align: 'left', arSize: 30, enSize: 15 }); }
  if (TEXT_REC && !hold) { recText('title', b + 5, b + 10, ['عشرون عاماً في قراءة السماء'], ['TWENTY YEARS OF READING THE SKY']); recText('lockup', b + 6.667, b + 10, ['المركز الوطني للأرصاد', ltr('2007–2027')], ['NATIONAL CENTER OF METEOROLOGY', '2007–2027']); }
  if (title) { arLine('عشرون عاماً في قراءة السماء', 960, 240, hold ? -9 : b + 5, hold ? 9 : f, { size: 88, align: 'center', dur: 1.6 }); enLine('TWENTY YEARS OF READING THE SKY', 960, 312, hold ? -9 : b + 5.667, hold ? 9 : f, { size: 32, align: 'center', ls: 5 }); }
  if (dedication) { levelB(9, 0, 1e9, ['إلى المتنبئين الجويين والراصدين وعلماء الزلازل، والطيارين والمهندسين والعلماء،', 'وكل العاملين في المركز الوطني للأرصاد'], ['TO THE FORECASTERS, OBSERVERS, SEISMOLOGISTS, PILOTS, ENGINEERS AND SCIENTISTS,', 'AND EVERYONE WHO SERVES AT THE NATIONAL CENTER OF METEOROLOGY'], { x: 960, y: 200, align: 'center', arSize: 40, enSize: 18, gap: 36 }); }
  if (lockup) {
    const q = hold ? 1 : easeOut(prog(f, b + 6.667, 1.4)), ar = 'المركز الوطني للأرصاد', en = 'NATIONAL CENTER OF METEOROLOGY';
    const wa = textWidth(ar, `700 46px ${F_KUFI}`, 0, 'rtl'), we = textWidth(en, `600 20px ${F_HEAD}`, 0), ls = Math.max(0, (wa - we) / (en.length - 1));
    smallAr(ar, 960, 402, q, { size: 46, align: 'center', a: 0.92, weight: 700 });
    small(en, 960 + ls / 2, 438, q, { size: 20, ls, align: 'center', a: 0.85, weight: 600, font: F_HEAD });
    ruleWithStar(960, 468, wa / 2 - 24, q, 0.55);
    smallAr(ltr('2007–2027'), 960, 506, q, { size: 24, align: 'center', a: 0.75 });
  }
}

// The persistent gold ring: born around Suhail as it clears the dunes, carried into the Durour wheel's outer ring.
const RING = [
  { t: 9.2, x: f => suhailScreen(f)[0], y: f => suhailScreen(f)[1], r: 24, a: 0.9, p: 0 },
  { t: 10.0, x: f => suhailScreen(f)[0], y: f => suhailScreen(f)[1], r: 24, a: 0.9, p: 1 },
  { t: 11.667, x: f => durourCircle(f).sx, y: f => durourCircle(f).sy, r: f => durourCircle(f).R, a: 0.9, p: 1 },
  { t: 14.6, x: f => durourCircle(f).sx, y: f => durourCircle(f).sy, r: f => durourCircle(f).R, a: 0.85, p: 1 },
  { t: 15.4, x: f => durourCircle(f).sx, y: f => durourCircle(f).sy, r: f => durourCircle(f).R, a: 0, p: 1 },
];

// The narration (TREATMENT.md §6), for the scratch subtitles (?vo), the VO subtitle files and the score's ducking.
const VO = [
  { id: 'VO-01', in: 2.2, out: 7.8, ar: 'قبلَ الراداراتِ والأقمارِ الاصطناعيّةِ بزمنٍ طويل، قرَأَ أهلُ هذهِ الأرضِ السماءَ… ليَعيشوا.', en: 'Long before radar and satellites, the people of this land read the sky… to live.' },
  { id: 'VO-02', in: 12.3, out: 17.8, ar: 'ومِن طُلوعِ سُهَيلٍ عَدُّوا أيّامَ السَّنة، وعرَفوا مواسِمَ الزَّرعِ والبحرِ والمطَر.', en: "From Suhail's rising they counted the days of the year, and knew the seasons for planting, the sea and rain." },
  { id: 'VO-03', in: 18.6, out: 24.2, ar: 'ومِن جُلْفار، وقَّتَ ابنُ ماجدٍ أسفارَهُ برياحِ الموسِم، وقاسَ ارتفاعَ النُّجومِ بالأصابِع.', en: 'From Julfar, Ahmed bin Majid timed his voyages by the monsoon winds and measured star heights in fingers.' },
  { id: 'VO-04', in: 24.6, out: 27.0, ar: 'وعرَفَ البحّارةُ كلَّ ريحٍ باسمِها.', en: 'Sailors knew every wind by name.' },
  { id: 'VO-05', in: 29.0, out: 36.6, ar: 'وفي العَين، تقاسَموا الماءَ بالأفلاج، وأحياها المغفورُ لهُ الشيخُ زايد بن سلطان آل نَهْيان، طيَّبَ اللهُ ثَراه.', en: 'In Al Ain they shared out the water through the aflaj, and the Founding Father, the late Sheikh Zayed bin Sultan Al Nahyan, restored them.' },
  { id: 'VO-06', beat: 'centre', in: 0.3, out: 6.7, ar: 'في عامِ ألفَينِ وسبعة، جمَعَتِ الدولةُ خدَماتِ الأرصادِ وأبحاثَ الغِلافِ الجوّيِّ في مركزٍ وطنيٍّ واحد،', sub: 'في عام ' + ltr('2007') + '، جمعت الدولة خدمات الأرصاد وأبحاث الغلاف الجوّيّ في مركز وطني واحد،', en: 'In 2007 the nation brought its weather service and atmospheric research together in one national center,' },
  { id: 'VO-07', beat: 'nation', in: 0.267, out: 9.867, ar: 'أسَّسَهُ بمرسومٍ بقانونٍ اتّحاديٍّ المغفورُ لهُ الشيخُ خليفة بن زايد آل نَهْيان، طيَّبَ اللهُ ثَراه، والمركزُ اليومَ المرجعُ الرسميُّ للطقسِ في الإماراتِ السَّبْع.', en: 'which the late Sheikh Khalifa bin Zayed Al Nahyan established by federal decree-law. Today it is the official source of weather information for all seven emirates.' },
  { id: 'VO-08a', beat: 'homes', in: 1.0, out: 7.0, ar: 'وفي أبريلَ ألفَينِ وأربعةٍ وعشرين، شهِدَتِ الدولةُ أغزرَ أمطارٍ في سِجِلّاتِها.', sub: 'وفي أبريل ' + ltr('2024') + '، شهدت الدولة أغزر أمطار في سجلّاتها.', en: 'In April 2024 the country saw the heaviest rainfall on record.' },
  { id: 'VO-08b', beat: 'homes', in: 7.2, out: 12.4, ar: 'وكانَ المركزُ قد توقَّعَ تزايُدَ عدمِ الاستقرارِ قبلَ يومَين، ثمَّ أصدرَ إنذاراً أحمرَ.', en: 'Two days before, the Center had forecast growing instability; then it issued a red alert.' },
  { id: 'VO-08c', beat: 'homes', in: 12.6, out: 17.2, ar: 'نستحضِرُ تلكَ الأيّامَ العصيبة، ونُحيّي كلَّ مَن سهِرَ على سلامةِ الناس.', en: "We remember those difficult days, and we honour all who kept watch over people's safety." },
  { id: 'VO-09', beat: 'airport', in: 1.1, out: 3.5, ar: 'لكلِّ رحلةٍ رصدٌ لا ينقطِع،', en: 'For every flight, a watch that never sleeps;' },
  { id: 'VO-09r', beat: 'rail', in: 0.4, out: 3.8, ar: 'وعلى امتدادِ البَرِّ تحذيراتٌ من الغبارِ والضَّباب،', en: 'across the land, warnings of dust and fog;' },
  { id: 'VO-10', beat: 'port', in: 0.433, out: 3.133, ar: 'ولكلِّ سفينةٍ تنبُّؤاتٌ بحريّةٌ لخمسةِ أيّام،', en: 'for every ship, a five-day marine forecast;' },
  { id: 'VO-10t', beat: 'tanker', in: 0.3, out: 4.2, ar: 'وللساحلِ الشرقيِّ نشرةٌ يقترحُها الذكاءُ الاصطناعيّ، ويعتمدُها المتنبِّئون،', en: 'for the East Coast, a bulletin that AI drafts and forecasters approve;' },
  { id: 'VO-11', beat: 'energy', in: 0.433, out: 3.733, ar: 'وللطاقةِ النظيفةِ تنبُّؤاتٌ بسُطوعِ الشمسِ وهُبوبِ الرياح.', en: 'for clean energy, forecasts of sunshine and wind.' },
  { id: 'VO-12', beat: 'seeding', in: 0.5, out: 7.4, ar: 'وفي أرضٍ يقِلُّ مطرُها عن مِئةِ مِلّيمترٍ في العامِ المُعتاد، سعَينا إلى استمطارِ السَّحاب.', sub: 'وفي أرض يقلّ مطرها عن ' + ltr('100') + ' ملّيمتر في العام المعتاد، سعينا إلى استمطار السحاب.', en: 'In a land with less than 100 millimetres of rain in a typical year, we sought more rain from the clouds.' },
  { id: 'VO-13', beat: 'science', in: 1.333, out: 5.333, ar: 'ثمَّ استثمَرْنا في العلمِ نفسِه، للدُّوَلِ التي تُواجِهُ شُحَّ المياه.', en: 'Then we invested in the science itself, for the countries facing water scarcity.' },
  { id: 'VO-14a', beat: 'world', in: 0.6, out: 3.8, ar: 'واليومَ، مِن سماءِ الإماراتِ إلى العالَم:', en: 'And today, from the skies of the Emirates to the world,' },
  { id: 'VO-14b', beat: 'world', in: 4.0, out: 11.6, ar: 'يرأَسُ المنظّمةَ العالميّةَ للأرصادِ الجوّيّة، لأوّلِ مرّةٍ من دُوَلِ مجلسِ التعاوُنِ الخليجيّ، معالي الدكتور عبدالله أحمد المَنْدوس.', en: 'the first President of the World Meteorological Organization from the GCC: His Excellency Dr Abdulla Ahmed Al Mandous.' },
  { id: 'VO-15a', beat: 'gauge', in: 2.133, out: 6.033, ar: 'إلى المتنبِّئينَ الجوّيّينَ والراصِدينَ وعلماءِ الزلازل، والطيّارينَ والمهندسينَ والعلماء…', en: 'To the forecasters, observers and seismologists, the pilots, engineers and scientists…' },
  { id: 'VO-15b', beat: 'gauge', in: 6.733, out: 8.933, ar: 'عِشرونَ عاماً من رَصْدِ السماء…', en: 'twenty years of watching the sky…' },
  { id: 'VO-16', beat: 'finale', in: 1.667, out: 4.467, ar: 'ليُخطِّطَ الوطنُ لغدِهِ بثِقة.', en: 'so the nation can plan for tomorrow with confidence.' },
];
// narration lines tied to a beat are timed from that beat's start, so the cut can change without retiming them; a
// pulled beat's lines go with it
for (let i = VO.length - 1; i >= 0; i--) if (PULLED.includes(VO[i].beat)) VO.splice(i, 1);
VO.forEach(v => { if (v.beat) { const s = START(v.beat); v.in = +(s + v.in).toFixed(3); v.out = +(s + v.out).toFixed(3); delete v.beat; } });
// Subtitles are set without the narrator's vowels: keep the shadda and the tanween on alif, drop the rest.
// (and the shadda on a sun letter after the article, which plain text never writes: «السّنة» becomes «السنة»).
const voSubAr = v => v.sub || v.ar.replace(/[\u064C-\u0650\u0652]/g, '').replace(/(^|[\s«(،])([وفبكل]?ال|[وف]?لل)([^\s\u0651])\u0651/g, '$1$2$3');

// The stage holds (?hold=A|B|C|W), each a seamless loop:
//   A: title and lockup · B: the dedication to the Center's people, with the lockup · C: sky and ring only, dimmed, for
//   speeches (20 s, the finale's last frame, alive) · W: the applause hold after B17 (12 s, its last frame, still), so
//   the film runs cue to cue: part 1 ends on the world beat as the dissolve into the gauge begins (the split in the
//   cue sheet), W loops under the applause, the caller releases part 2.
{
  const q = new URLSearchParams(location.search);
  if (q.has('hold')) {
    const v = (q.get('hold') || 'A').toUpperCase();
    TIMELINE.length = 0; RING.length = 0;
    if (v === 'W') TIMELINE.push({ id: 'hold-world', use: 'world', start: 0, dur: 12, speed: 1e-9, offset: at(3.5), cam: WORLD_CAM,
      words() { worldWords(START('world') + 11.5, Infinity); } });
    else TIMELINE.push({ id: 'hold', use: 'finale', start: 0, dur: 20, hold: true, loop: 20, dim: v === 'C' ? 0.7 : 0,
      cam: () => ({ s: 1.04, px: 977, py: 698, sx: 977, sy: 698 }),
      words() { if (v !== 'C') finaleWords(this, 0, { title: v === 'A', lockup: true, dedication: v === 'B' }); } });
    FADE_IN = 0; FADE_OUT = 0;
  }
}
