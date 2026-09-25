'use strict';
// Leadership words, exactly as verified (see TREATMENT.md §9.1). Arabic first. The narrator never voices them.
const QUOTES = {
  // First National Environment Day, February 1998. Arabic as reported (Aletihad 2012, src-68; Al Bayan, 4 Feb 2000);
  // English: the official rendering used by the UAE Ministry of Foreign Affairs (src-13).
  zayed: {
    ar: ['«إننا نولي بيئتنا جل اهتمامنا', 'لأنها جزء عضوي من بلادنا وتاريخنا وتراثنا»'],
    en: ['“We cherish our environment because it is an integral part', 'of our country, our history and our heritage.”'],
    whoAr: 'الوالد المؤسس المغفور له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه',
    whatAr: 'كلمته في يوم البيئة الوطني الأول · فبراير ' + ltr('1998'),
    whoEn: 'THE LATE SHEIKH ZAYED BIN SULTAN AL NAHYAN',
    titleEn: 'FOUNDING FATHER OF THE UAE',
    whatEn: 'FROM HIS SPEECH ON THE FIRST NATIONAL ENVIRONMENT DAY · FEBRUARY 1998',
  },
  // December 2011. Only published as the news agency's reported speech (WAM via Emirates 24|7, 13 Dec 2011, src-34;
  // Emarat Al Youm, 13–14 Dec 2011), so it is set as reported speech, with no quotation marks.
  president: {
    reported: true,
    ar: ['أكّد صاحب السمو الشيخ محمد بن زايد آل نهيان، رئيس الدولة، حفظه الله،', 'أن المياه تشكّل أهمية كبرى تفوق أهمية النفط بالنسبة إلى الإمارات'],
    en: ['His Highness Sheikh Mohamed bin Zayed Al Nahyan, President of the UAE,', 'stressed that water is more important than oil for the UAE.'],
    whatAr: 'ديسمبر ' + ltr('2011') + '، حين كان سموّه ولياً لعهد أبوظبي · وام',
    whatEn: 'DECEMBER 2011, AS CROWN PRINCE OF ABU DHABI · WAM',
  },
  // May 2026, on ten years of the rain enhancement programme: Al Khaleej, 13 May 2026 (src-59). No official English,
  // so the English is marked as translated.
  mansour: {
    kickerAr: 'عن برنامج الإمارات لبحوث علوم الاستمطار', kickerEn: 'ON THE UAE RESEARCH PROGRAM FOR RAIN ENHANCEMENT SCIENCE',
    ar: ['«اليوم، أصبح البرنامج منصة عالمية تجمع العقول،', 'وتنتج حلولاً نوعية تعزز الأمن المائي،', 'وتمهّد لمستقبل أكثر استدامة»'],
    en: ['“Today, the programme has become a global platform that brings minds together and produces distinctive', 'solutions that strengthen water security and pave the way for a more sustainable future.”'],
    whoAr: 'سمو الشيخ منصور بن زايد آل نهيان',
    titleAr: 'نائب رئيس الدولة نائب رئيس مجلس الوزراء رئيس ديوان الرئاسة',
    whatAr: 'مايو ' + ltr('2026'),
    whoEn: 'HIS HIGHNESS SHEIKH MANSOUR BIN ZAYED AL NAHYAN',
    titleEn: 'VICE PRESIDENT, DEPUTY PRIME MINISTER AND CHAIRMAN OF THE PRESIDENTIAL COURT',
    whatEn: 'MAY 2026 · TRANSLATED FROM THE ARABIC',
  },
  // The default (it has an official English): 7th International Rain Enhancement Forum, 28 Jan 2025, delivered on his
  // behalf. Arabic: WAM; English: official, Abu Dhabi Media Office. `mansour` (May 2026) replaces it only once WAM or
  // the Presidential Court supplies an approved English.
  mansour_iref: {
    ar: ['«نؤمن في دولة الإمارات بأن البحث العلمي والابتكار', 'هما أساس التعامل مع الواقع وتحديات المستقبل»'],
    en: ['“In the UAE, we recognise that scientific research and innovation are fundamental', 'to addressing present realities and navigating future challenges.”'],
    whoAr: 'سمو الشيخ منصور بن زايد آل نهيان',
    titleAr: 'نائب رئيس الدولة نائب رئيس مجلس الوزراء رئيس ديوان الرئاسة',
    whatAr: 'كلمة سموّه في الملتقى الدولي السابع للاستمطار · يناير ' + ltr('2025'),
    whoEn: 'HIS HIGHNESS SHEIKH MANSOUR BIN ZAYED AL NAHYAN',
    titleEn: 'VICE PRESIDENT, DEPUTY PRIME MINISTER AND CHAIRMAN OF THE PRESIDENTIAL COURT',
    whatEn: 'FROM HIS ADDRESS TO THE 7TH INTERNATIONAL RAIN ENHANCEMENT FORUM · JANUARY 2025',
  },
};
