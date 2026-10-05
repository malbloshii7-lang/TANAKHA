'use strict';
const params = new URLSearchParams(location.search);
window.__ready = boot().then(() => {
  // the pace (timeline.js): the film runs PACE times slower than its design, so real time maps to design time / PACE
  const K = typeof PACE !== 'undefined' ? PACE : 1;
  window.__duration = DURATION * K;
  if (params.has('capture')) { window.__render = t => render(t / K); render(Number(params.get('t') || 0) / K); return true; }
  const t0 = performance.now() - Number(params.get('t') || 0) * 1000;
  const loop = () => { render(((performance.now() - t0) / 1000 / K) % DURATION); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  cv.addEventListener('click', () => location.reload());
  return true;
});
