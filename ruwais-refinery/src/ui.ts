// Top bar, legend, unit info panel, scenario panel, search.
// Everything re-renders on language or scenario change.

import * as THREE from 'three';
import type { SceneCtx } from './scene';
import {
  data, on, pick, selectUnit, setLang, setScenario, setTourStep,
  setTraceMode, setView2d, state, t,
} from './state';
import type { ScenarioId, StatValue, Tag, Unit } from './types';

const YIELD_COLORS: Record<string, string> = {
  gasoline: '#e8c832', diesel: '#4caf50', jet: '#7ec8e8', lpg: '#e8e8e8',
  propylene: '#d982e8', fuel_oil: '#8a5a2b', sulfur: '#e89020', other: '#5a6478',
};

let ctx: SceneCtx;

export function initUI(sceneCtx: SceneCtx): void {
  ctx = sceneCtx;
  renderAll();
  on('lang', renderAll);
  on('scenario', () => { renderScenarioPanel(); renderTopbar(); });
  on('select', renderUnitPanel);
  on('view', renderTopbar);
  on('trace', renderTopbar);
}

function renderAll(): void {
  renderTopbar();
  renderLegend();
  renderScenarioPanel();
  renderUnitPanel();
  document.getElementById('disclaimer')!.textContent = t('disclaimer_footer');
}

// ---------------------------------------------------------------- top bar

function renderTopbar(): void {
  const bar = document.getElementById('topbar')!;
  bar.innerHTML = '';

  const title = document.createElement('h1');
  title.textContent = t('app_title');
  bar.appendChild(title);

  // Scenario toggle A/B/C
  const group = document.createElement('div');
  group.className = 'btn-group';
  group.title = t('scenario');
  (['A', 'B', 'C'] as ScenarioId[]).forEach((id) => {
    const sc = data.scenarios.scenarios[id];
    const b = document.createElement('button');
    b.className = `btn${state.scenario === id ? ' active' : ''}`;
    b.textContent = `${id} · ${pick(sc as unknown as Record<string, unknown>, 'short')}`;
    b.addEventListener('click', () => setScenario(id));
    group.appendChild(b);
  });
  bar.appendChild(group);

  bar.appendChild(searchBox());

  const mkBtn = (label: string, active: boolean, fn: () => void): HTMLButtonElement => {
    const b = document.createElement('button');
    b.className = `btn${active ? ' active' : ''}`;
    b.textContent = label;
    b.addEventListener('click', fn);
    bar.appendChild(b);
    return b;
  };

  mkBtn(state.view2d ? t('view_3d') : t('view_2d'), state.view2d, () => setView2d(!state.view2d));
  mkBtn(t('trace_barrel'), state.traceMode, () => setTraceMode(!state.traceMode));
  mkBtn(t('tour_start'), state.tourStep !== null, () => setTourStep(state.tourStep === null ? 0 : null));
  mkBtn(state.lang === 'en' ? 'العربية' : 'English', false, () => setLang(state.lang === 'en' ? 'ar' : 'en'));
  mkBtn(t('reset_view'), false, () => { selectUnit(null); ctx.resetView(); });

  const sub = document.createElement('div');
  sub.className = 'subtitle';
  sub.textContent = t('subtitle');
  bar.appendChild(sub);
}

function searchBox(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'search-wrap';
  const input = document.createElement('input');
  input.id = 'search';
  input.placeholder = t('search_placeholder');
  input.autocomplete = 'off';
  const results = document.createElement('div');
  results.id = 'search-results';
  results.className = 'hidden';
  wrap.append(input, results);

  const search = (): void => {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = '';
    if (q.length < 1) { results.classList.add('hidden'); return; }
    const matches = data.units.units.filter(
      (u) => u.name_en.toLowerCase().includes(q) || u.name_ar.includes(q) || u.id.includes(q),
    ).slice(0, 8);
    for (const u of matches) {
      const row = document.createElement('div');
      row.textContent = pick(u as unknown as Record<string, unknown>, 'name');
      row.addEventListener('click', () => {
        selectUnit(u.id);
        ctx.focusUnit(u.id);
        input.value = '';
        results.classList.add('hidden');
      });
      results.appendChild(row);
    }
    results.classList.toggle('hidden', matches.length === 0);
  };
  input.addEventListener('input', search);
  input.addEventListener('blur', () => setTimeout(() => results.classList.add('hidden'), 200));
  return wrap;
}

// ---------------------------------------------------------------- legend

function renderLegend(): void {
  const el = document.getElementById('legend')!;
  el.innerHTML = '';
  const cols = document.createElement('div');
  cols.className = 'cols';

  const zoneCol = document.createElement('div');
  zoneCol.innerHTML = `<h3>${t('zones')}</h3>`;
  for (const [zoneId, zone] of Object.entries(data.units.zones)) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="swatch" style="background:${zone.color}"></span>${pick(zone as unknown as Record<string, unknown>, 'name')}`;
    item.addEventListener('click', () => flyToZone(zoneId));
    zoneCol.appendChild(item);
  }

  const streamCol = document.createElement('div');
  streamCol.innerHTML = `<h3>${t('streams')}</h3>`;
  for (const s of Object.values(data.flows.streams)) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.style.cursor = 'default';
    item.innerHTML = `<span class="stream-swatch" style="background:${s.color}"></span>${pick(s as unknown as Record<string, unknown>, 'name')}`;
    streamCol.appendChild(item);
  }

  cols.append(zoneCol, streamCol);
  el.appendChild(cols);
}

/** Camera preset: frame all units of a zone. */
export function flyToZone(zoneId: string): void {
  const units = data.units.units.filter((u) => u.zone === zoneId);
  if (units.length === 0) return;
  const box = new THREE.Box3();
  for (const u of units) {
    box.expandByPoint(new THREE.Vector3(u.position[0] - u.size[0], 0, u.position[2] - u.size[2]));
    box.expandByPoint(new THREE.Vector3(u.position[0] + u.size[0], u.size[1], u.position[2] + u.size[2]));
  }
  const center = box.getCenter(new THREE.Vector3());
  const span = Math.max(box.getSize(new THREE.Vector3()).length(), 60);
  ctx.flyTo(center.clone().add(new THREE.Vector3(span * 0.35, span * 0.7, span * 0.75)), center);
}

// ---------------------------------------------------------------- unit panel

function tagBadge(tag: Tag): string {
  const key = `tag_${tag.replace('-', '_')}`;
  return `<span class="tag ${tag}">${t(key)}</span>`;
}

function renderUnitPanel(): void {
  const el = document.getElementById('unit-panel')!;
  const unit = data.units.units.find((u) => u.id === state.selectedUnit);
  if (!unit) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const zone = data.units.zones[unit.zone];
  const P = (base: string): string => pick(unit as unknown as Record<string, unknown>, base);

  const capacity = unit.capacity_bpd !== null
    ? `${unit.capacity_bpd.toLocaleString()} ${t('bpd')}`
    : unit.capacity_note ?? t('not_public');

  el.innerHTML = `
    <button class="close-btn" aria-label="${t('close')}">✕</button>
    <h2>${esc(P('name'))}</h2>
    <p><span class="zone-chip" style="background:${zone.color}"></span>${esc(pick(zone as unknown as Record<string, unknown>, 'name'))}</p>
    <p>${esc(P('description'))}</p>
    <h3>${t('panel_capacity')}</h3>
    <p>${esc(capacity)} ${tagBadge(unit.tag)}</p>
    <h3>${t('panel_inputs')}</h3>
    <ul>${unit.inputs.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    <h3>${t('panel_outputs')}</h3>
    <ul>${unit.outputs.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    <h3>${t('panel_conditions')}</h3>
    <p>${esc(unit.temp_c)} · ${esc(unit.pressure)} <span class="tag approx">${t('tag_approx')}</span></p>
    ${unit.why_en !== '—' ? `<h3>${t('panel_why')}</h3><p>${esc(unit.why_en)}</p>` : ''}
    ${unit.heavier_en !== '—' ? `<h3>${t('panel_heavier')}</h3><p>${esc(unit.heavier_en)}</p>` : ''}
    ${unit.source_refs.length > 0 ? `<h3>${t('panel_sources')}</h3><p class="stat-detail">${unit.source_refs.map((r) => `<a style="color:#7ea8ff" href="./SOURCES.md" target="_blank">${r}</a>`).join(' · ')}</p>` : ''}
  `;
  el.querySelector('.close-btn')!.addEventListener('click', () => selectUnit(null));
}

// ---------------------------------------------------------------- scenario panel

function renderScenarioPanel(): void {
  const el = document.getElementById('scenario-panel')!;
  const sc = data.scenarios.scenarios[state.scenario];
  const S = (base: string): string => pick(sc as unknown as Record<string, unknown>, base);

  const feed = sc.feed.map((f) => {
    const crude = data.scenarios.crudes[f.crude];
    return `${pick(crude as unknown as Record<string, unknown>, 'name')} ${f.kbpd} ${t('kbpd')} <span class="stat-detail">(~${crude.api}°API, ${crude.sulfur_pct}% S)</span>`;
  }).join('<br>');

  const cutBars = Object.entries(sc.cdu_cuts_pct).map(([k, v]) => {
    const color = data.flows.streams[k === 'residue' ? 'residue' : k === 'gas' ? 'gas' : k]?.color ?? '#888';
    return barRow(t(`product_${k}`) !== `product_${k}` ? t(`product_${k}`) : streamName(k), v, color, 60);
  }).join('');

  const yieldBars = Object.entries(sc.yields_pct)
    .filter(([k]) => k !== 'other')
    .map(([k, v]) => barRow(t(`product_${k}`), v, YIELD_COLORS[k] ?? '#888', 35))
    .join('') + barRow(t('product_other'), sc.yields_pct.other ?? 0, YIELD_COLORS.other, 35);

  const statRow = (label: string, sv: StatValue, unitStr: string): string => `
    <div class="stat-row"><span>${label}</span>
      <span class="stat-val">${sv.value.toLocaleString()}${unitStr} ${tagBadge(sv.tag)}</span></div>
    ${sv.detail_en ? `<p class="stat-detail">${esc(sv.detail_en)}</p>` : ''}`;

  el.innerHTML = `
    <h2>${esc(S('name'))}</h2>
    <h3>${t('stat_feed')}</h3>
    <p>${feed}</p>
    <h3>${t('cuts_title')}</h3>
    ${cutBars}
    <h3>${t('yields_title')} <span class="tag representative">${t('tag_representative')}</span></h3>
    ${yieldBars}
    <h3>${t('stats_title')}</h3>
    ${statRow(t('stat_sulfur'), sc.stats.feed_sulfur_tpd, ` ${t('tpd')}`)}
    ${statRow(t('stat_h2'), sc.stats.h2_demand_pct, '%')}
    ${statRow(t('stat_ard'), sc.stats.ard_util_pct, '%')}
    ${statRow(t('stat_rfcc'), sc.stats.rfcc_util_pct, '%')}
    ${statRow(t('stat_hcu'), sc.stats.hcu_util_pct, '%')}
    ${statRow(t('stat_freed'), sc.stats.murban_freed_kbpd, ` ${t('kbpd')}`)}
    <div class="why-box"><h3 style="margin-top:0">${t('why_matters')}</h3><p>${esc(S('why'))}</p></div>
    <p class="disclaimer-inline">${esc(pick(data.scenarios.notes, 'yields_disclaimer'))}</p>
  `;
}

function streamName(k: string): string {
  const s = data.flows.streams[k];
  return s ? pick(s as unknown as Record<string, unknown>, 'name') : k;
}

function barRow(label: string, value: number, color: string, max: number): string {
  const width = Math.min((value / max) * 100, 100);
  return `<div class="bar-row"><span class="bar-label">${esc(label)}</span>
    <span class="bar-track"><span class="bar-fill" style="width:${width}%;background:${color}"></span></span>
    <span class="bar-val">${value}%</span></div>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { renderUnitPanel };
export type { Unit };
