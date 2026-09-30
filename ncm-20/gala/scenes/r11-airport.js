'use strict';
// Revision 11 · Zayed International: dawn fog at Terminal A, and the arrival (placeholder: being built)
scene({
  id: 'airportdawn',
  start: 0, dur: 5,
  draw(lt) { smallAr('airport dawn', 560, 540, 1, { size: 40, align: 'center', a: 0.5 }); },
});
scene({
  id: 'arrival',
  start: 0, dur: 5,
  draw(lt) { smallAr('airport arrival', 560, 540, 1, { size: 40, align: 'center', a: 0.5 }); },
});
