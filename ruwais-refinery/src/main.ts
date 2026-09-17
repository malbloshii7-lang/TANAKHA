// Boot: load + validate data, build scene, wire UI modules.

import { setData, state } from './state';
import { validateData, showDataErrors } from './validate';
import { initScene } from './scene';
import type { AppData } from './types';

async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function boot(): Promise<void> {
  let appData: AppData;
  try {
    const [units, flows, scenarios, i18n] = await Promise.all([
      loadJson<AppData['units']>('data/units.json'),
      loadJson<AppData['flows']>('data/flows.json'),
      loadJson<AppData['scenarios']>('data/scenarios.json'),
      loadJson<AppData['i18n']>('data/i18n.json'),
    ]);
    appData = { units, flows, scenarios, i18n };
  } catch (e) {
    showDataErrors([`Failed to load or parse data files: ${(e as Error).message}`]);
    return;
  }

  const errors = validateData(appData);
  if (errors.length > 0) {
    showDataErrors(errors);
    return;
  }

  setData(appData);
  const container = document.getElementById('scene-container')!;
  const ctx = initScene(container);

  // UI modules are loaded after the scene exists (they need ctx).
  const { initUI } = await import('./ui');
  initUI(ctx);
  const { initFlows } = await import('./flows');
  initFlows(ctx);
  const { initTrace } = await import('./trace');
  initTrace(ctx);
  const { initTour } = await import('./tour');
  initTour(ctx);
  const { initPfd } = await import('./pfd');
  initPfd();

  // Expose a tiny hook for the headless verification script.
  (window as unknown as Record<string, unknown>).__app = { state, ctx };
}

void boot();
