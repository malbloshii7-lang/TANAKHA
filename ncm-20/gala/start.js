'use strict';
const params = new URLSearchParams(location.search);
window.__ready = boot().then(() => {
  window.__duration = DURATION;
  if (params.has('capture')) { window.__render = render; render(Number(params.get('t') || 0)); return true; }
  const t0 = performance.now() - Number(params.get('t') || 0) * 1000;
  const loop = () => { render(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  cv.addEventListener('click', () => location.reload());
  return true;
});
