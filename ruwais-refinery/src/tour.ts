// Guided tour: "Follow the crude". Steps live in data/i18n.json
// (en.tour_steps / ar.tour_steps) so the text is editable without code.

import type { SceneCtx } from './scene';
import { data, on, selectUnit, setTourStep, state, t } from './state';
import type { TourStep } from './types';

let ctx: SceneCtx;

export function initTour(sceneCtx: SceneCtx): void {
  ctx = sceneCtx;
  on('tour', render);
  on('lang', render);
}

function steps(): TourStep[] {
  return (data.i18n[state.lang].tour_steps ?? data.i18n.en.tour_steps) as TourStep[];
}

function render(): void {
  const box = document.getElementById('tour-box')!;
  const idx = state.tourStep;
  if (idx === null) { box.classList.add('hidden'); return; }

  const all = steps();
  const step = all[idx];
  box.classList.remove('hidden');
  box.innerHTML = `
    <h2>${esc(step.title)}</h2>
    <p>${esc(step.text)}</p>
    <div class="tour-nav">
      <button class="btn" id="tour-back" ${idx === 0 ? 'disabled' : ''}>${t('tour_back')}</button>
      <button class="btn active" id="tour-next">${idx === all.length - 1 ? t('tour_exit') : t('tour_next')}</button>
      <button class="btn" id="tour-quit">${t('tour_exit')}</button>
      <span class="tour-count">${t('tour_step')} ${idx + 1} / ${all.length}</span>
    </div>`;

  box.querySelector('#tour-back')!.addEventListener('click', () => setTourStep(Math.max(0, idx - 1)));
  box.querySelector('#tour-next')!.addEventListener('click', () =>
    idx === all.length - 1 ? endTour() : setTourStep(idx + 1));
  box.querySelector('#tour-quit')!.addEventListener('click', endTour);

  // Fly the camera to this step's unit and highlight it.
  selectUnit(step.unit);
  ctx.focusUnit(step.unit, 1300);
}

function endTour(): void {
  setTourStep(null);
  selectUnit(null);
  ctx.resetView();
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
