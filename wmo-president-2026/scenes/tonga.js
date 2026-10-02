'use strict';
// placeholder until the plate is drawn
scene({
  id: 'tonga', start: 0, dur: 17,
  draw(t, lt) {
    registerRules(1); plateFrame(1);
    plate(() => { if (OPT.colour) washFade([0, 0, PW, PH], [[0, HUE.sky, 0.35], [0.6, HUE.sail, 0.15], [1, HUE.sand, 0.3]], 0, 1); small('PLATE · tonga'.toUpperCase(), PW / 2, PH / 2, 1, { size: 20, ls: 6, a: 0.5, align: 'center' }); });
  },
});
