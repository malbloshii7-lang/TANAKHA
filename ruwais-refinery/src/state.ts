// Tiny observable app state. Everything UI-visible flows through here so
// 3D scene, 2D diagram and panels stay in sync.

import type { AppData, ScenarioId } from './types';

export type Lang = 'en' | 'ar';
type Listener = () => void;

export interface AppState {
  scenario: ScenarioId;
  lang: Lang;
  selectedUnit: string | null;
  view2d: boolean;
  traceMode: boolean;
  tourStep: number | null; // null = tour off
  isMobile: boolean;
}

const listeners: Record<string, Listener[]> = {};

export const state: AppState = {
  scenario: 'A',
  lang: 'en',
  selectedUnit: null,
  view2d: false,
  traceMode: false,
  tourStep: null,
  isMobile: window.matchMedia('(max-width: 820px), (pointer: coarse)').matches,
};

// Loaded JSON data, set once at boot in main.ts.
export let data: AppData;
export function setData(d: AppData): void { data = d; }

export function on(event: 'scenario' | 'lang' | 'select' | 'view' | 'trace' | 'tour', fn: Listener): void {
  (listeners[event] ??= []).push(fn);
}

function emit(event: string): void {
  for (const fn of listeners[event] ?? []) fn();
}

export function setScenario(s: ScenarioId): void {
  if (state.scenario === s) return;
  state.scenario = s;
  emit('scenario');
}

export function setLang(l: Lang): void {
  if (state.lang === l) return;
  state.lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  emit('lang');
}

export function selectUnit(id: string | null): void {
  state.selectedUnit = id;
  emit('select');
}

export function setView2d(v: boolean): void {
  state.view2d = v;
  emit('view');
}

export function setTraceMode(v: boolean): void {
  state.traceMode = v;
  emit('trace');
}

export function setTourStep(step: number | null): void {
  state.tourStep = step;
  emit('tour');
}

/** i18n lookup for plain-string UI keys. */
export function t(key: string): string {
  const v = data.i18n[state.lang][key] ?? data.i18n.en[key];
  return typeof v === 'string' ? v : key;
}

/** Pick the language variant of a *_en / *_ar field pair. */
export function pick(obj: Record<string, unknown>, base: string): string {
  const v = obj[`${base}_${state.lang}`] ?? obj[`${base}_en`];
  return typeof v === 'string' && v.length > 0 ? v : (obj[`${base}_en`] as string) ?? '';
}
