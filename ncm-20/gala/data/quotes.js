'use strict';
// Leadership quotes, word for word as verified (see TREATMENT.md → protocol). Arabic original first.
const QUOTES = {
  // First National Environment Day, February 1998. Arabic as reported (Al Bayan, 4 Feb 2000; Aletihad 2012);
  // English: the official rendering used by the UAE Ministry of Foreign Affairs.
  zayed: {
    ar: ['«إننا نولي بيئتنا جل اهتمامنا', 'لأنها جزء عضوي من بلادنا وتاريخنا وتراثنا»'],
    en: ['“We cherish our environment because it is an integral part', 'of our country, our history and our heritage.”'],
    whoAr: 'المغفور له الشيخ زايد بن سلطان آل نهيان، طيّب الله ثراه',
    whatAr: 'اليوم الوطني الأول للبيئة · فبراير ' + ltr('1998'),
    whoEn: 'THE LATE SHEIKH ZAYED BIN SULTAN AL NAHYAN, FOUNDING FATHER OF THE UAE',
    whatEn: 'FIRST NATIONAL ENVIRONMENT DAY · FEBRUARY 1998',
  },
  // 7th International Rain Enhancement Forum, Abu Dhabi, 28 January 2025 (speech delivered on his behalf).
  // Arabic: WAM; English: official, Abu Dhabi Media Office.
  mansour: {
    ar: ['«نؤمن في دولة الإمارات بأن البحث العلمي والابتكار', 'هما أساس التعامل مع الواقع وتحديات المستقبل»'],
    en: ['“In the UAE, we recognise that scientific research and innovation are fundamental', 'to addressing present realities and navigating future challenges.”'],
    whoAr: 'سمو الشيخ منصور بن زايد آل نهيان',
    whatAr: 'نائب رئيس الدولة، نائب رئيس مجلس الوزراء، رئيس ديوان الرئاسة · الملتقى الدولي السابع للاستمطار، يناير ' + ltr('2025'),
    whoEn: 'H.H. SHEIKH MANSOUR BIN ZAYED AL NAHYAN',
    whatEn: 'VICE PRESIDENT, DEPUTY PRIME MINISTER AND CHAIRMAN OF THE PRESIDENTIAL COURT · 7TH INTERNATIONAL RAIN ENHANCEMENT FORUM, JANUARY 2025',
  },
};
