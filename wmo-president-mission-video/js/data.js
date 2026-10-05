// Content — taken verbatim from the reference infographic.
window.STOPS = [
  { id: 'kyrgyzstan', date: '6–11 SEP', region: 'II', city: 'Kyrgyzstan',
    desc: 'ICH/CIS 37th session and Kyrgyzhydromet centenary week.',
    lon: 74.59, lat: 42.87, focus: '50% 30%', tab: ['#1458b4', '#2b88de'], node: '#1f86dc' },
  { id: 'nukualofa', date: '16 SEP', region: 'V', city: 'Nuku’alofa',
    desc: 'PMMM-4 adopted the Siu-i-Álaimoana-Ki-Likutapu Declaration.',
    lon: -175.2, lat: -21.14, focus: '50% 40%', tab: ['#0f5aa6', '#1c86cf'], node: '#1f86dc' },
  { id: 'wellington', date: '23 SEP', region: 'V', city: 'Wellington',
    desc: 'MetService discussions on WMO governance, regional collaboration and 24/7 operations.',
    lon: 174.78, lat: -41.29, focus: '50% 45%', tab: ['#1c6fd2', '#4aa2ec'], node: '#1f86dc' },
  { id: 'melbourne', date: 'SEP', region: 'V', city: 'Melbourne',
    desc: 'Bureau of Meteorology visit: Operations Centre, Metrology Laboratory and space-weather services.',
    lon: 144.96, lat: -37.81, focus: '50% 62%', tab: ['#2a7fd8', '#5aadf0'], node: '#1f86dc' },
  { id: 'jakarta', date: '30 SEP', region: 'V', city: 'Jakarta',
    desc: 'Regional engagements on Early Warnings, climate services and disaster risk reduction.',
    lon: 106.85, lat: -6.21, focus: '50% 55%', tab: ['#2378d6', '#4ea6ee'], node: '#1f86dc' },
  { id: 'bucharest', date: '2 OCT', region: 'VI', city: 'Bucharest',
    desc: 'RA VI-19 Phase II and EW4All regional planning week hosted in Romania.',
    lon: 26.10, lat: 44.43, focus: '50% 40%', tab: ['#0c3a84', '#1b55ad'], node: '#123f8a' },
];

window.PILLARS = [
  { icon: 'cloud', title: 'EW4All', sub: 'Coverage by<br>end-2027' },
  { icon: 'bars', title: 'AIM for Scale', sub: 'AI-supported<br>climate services' },
  { icon: 'nodes', title: 'RTC training', sub: 'Capacity-<br>building<br>pathways' },
  { icon: 'doc', title: 'Strategic Plan', sub: '2028–2031<br>regional shaping' },
];

// Poster (final frame) geometry at 1080x1350, measured from the reference (x0.9626).
window.POSTER = {
  cards: [
    { x: 14, w: 175, apex: 657, lsh: 687, rsh: 676, band: 809, panelTop: 843, bottom: 1031 },
    { x: 197, w: 167, apex: 632, lsh: 643, rsh: 670, band: 811, panelTop: 846, bottom: 1047 },
    { x: 371, w: 167, apex: 673, lsh: 700, rsh: 683, band: 822, panelTop: 856, bottom: 1061 },
    { x: 545, w: 169, apex: 601, lsh: 657, rsh: 635, band: 820, panelTop: 854, bottom: 1079 },
    { x: 722, w: 164, apex: 680, lsh: 692, rsh: 697, band: 832, panelTop: 866, bottom: 1080 },
    { x: 894, w: 172, apex: 678, lsh: 701, rsh: 690, band: 827, panelTop: 861, bottom: 1059 },
  ],
  nodes: [[116.5, 651.7], [279.6, 624.7], [454.8, 665.2], [647.8, 593.9], [807.6, 675.8], [971.0, 675.8]],
};
