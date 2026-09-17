// Lightweight hand-rolled validation of the /data JSON files.
// Goal: if the user hand-edits a JSON and breaks it, they get a readable
// on-screen list of what's wrong instead of a blank canvas.

import type { AppData, FlowsData, ScenariosData, UnitsData } from './types';

const UNIT_TYPES = new Set([
  'column', 'drum', 'reactor', 'tank', 'tankfarm', 'sphere',
  'box', 'furnace', 'flare', 'jetty', 'pipeline', 'context',
]);
const TAGS = new Set(['public', 'approx', 'representative', 'not-public']);
const SCENARIO_IDS = ['A', 'B', 'C'] as const;

export function validateData(data: AppData): string[] {
  const errors: string[] = [];
  validateUnits(data.units, errors);
  validateFlows(data.flows, data.units, errors);
  validateScenarios(data.scenarios, data.units, errors);
  validateI18n(data, errors);
  return errors;
}

function validateUnits(u: UnitsData, errors: string[]): void {
  if (!u || typeof u.zones !== 'object' || !Array.isArray(u.units)) {
    errors.push('units.json: must have "zones" object and "units" array');
    return;
  }
  for (const [id, z] of Object.entries(u.zones)) {
    if (!z.name_en || !z.color) errors.push(`units.json zone "${id}": needs name_en and color`);
  }
  const seen = new Set<string>();
  for (const unit of u.units) {
    const where = `units.json unit "${unit.id ?? '?'}"`;
    if (!unit.id) errors.push('units.json: a unit is missing "id"');
    else if (seen.has(unit.id)) errors.push(`${where}: duplicate id`);
    else seen.add(unit.id);
    if (!u.zones[unit.zone]) errors.push(`${where}: unknown zone "${unit.zone}"`);
    if (!UNIT_TYPES.has(unit.type)) errors.push(`${where}: unknown type "${unit.type}"`);
    if (!TAGS.has(unit.tag)) errors.push(`${where}: tag must be one of ${[...TAGS].join(', ')}`);
    if (!Array.isArray(unit.position) || unit.position.length !== 3 || unit.position.some((n) => typeof n !== 'number'))
      errors.push(`${where}: position must be [x, y, z] numbers`);
    if (!Array.isArray(unit.size) || unit.size.length !== 3 || unit.size.some((n) => typeof n !== 'number'))
      errors.push(`${where}: size must be [w, h, d] numbers`);
    if (unit.capacity_bpd !== null && typeof unit.capacity_bpd !== 'number')
      errors.push(`${where}: capacity_bpd must be a number or null`);
    if (!unit.name_en) errors.push(`${where}: missing name_en`);
  }
}

function validateFlows(f: FlowsData, u: UnitsData, errors: string[]): void {
  if (!f || typeof f.streams !== 'object' || !Array.isArray(f.flows)) {
    errors.push('flows.json: must have "streams" object and "flows" array');
    return;
  }
  const unitIds = new Set(u.units?.map((x) => x.id) ?? []);
  f.flows.forEach((flow, i) => {
    const where = `flows.json flow #${i} (${flow.from ?? '?'} → ${flow.to ?? '?'})`;
    if (!unitIds.has(flow.from)) errors.push(`${where}: unknown "from" unit`);
    if (!unitIds.has(flow.to)) errors.push(`${where}: unknown "to" unit`);
    if (!f.streams[flow.stream]) errors.push(`${where}: unknown stream "${flow.stream}"`);
    for (const s of SCENARIO_IDS) {
      const v = flow.volume?.[s];
      if (typeof v !== 'number' || v < 0) errors.push(`${where}: volume.${s} must be a number ≥ 0`);
    }
  });
}

function validateScenarios(s: ScenariosData, u: UnitsData, errors: string[]): void {
  if (!s || typeof s.crudes !== 'object' || typeof s.scenarios !== 'object') {
    errors.push('scenarios.json: must have "crudes" and "scenarios" objects');
    return;
  }
  const tankFarm = u.units?.find((x) => x.type === 'tankfarm');
  for (const id of SCENARIO_IDS) {
    const sc = s.scenarios[id];
    const where = `scenarios.json scenario "${id}"`;
    if (!sc) { errors.push(`${where}: missing`); continue; }
    for (const feed of sc.feed ?? []) {
      if (!s.crudes[feed.crude]) errors.push(`${where}: feed references unknown crude "${feed.crude}"`);
    }
    for (const g of sc.tank_grades ?? []) {
      if (!s.crudes[g]) errors.push(`${where}: tank_grades references unknown crude "${g}"`);
    }
    if (tankFarm?.tank_count && sc.tank_grades?.length !== tankFarm.tank_count)
      errors.push(`${where}: tank_grades must list exactly ${tankFarm.tank_count} entries (one per tank)`);
    const yieldSum = Object.values(sc.yields_pct ?? {}).reduce((a, b) => a + b, 0);
    if (Math.abs(yieldSum - 100) > 2)
      errors.push(`${where}: yields_pct sums to ${yieldSum.toFixed(1)}%, expected ≈100%`);
  }
}

function validateI18n(data: AppData, errors: string[]): void {
  const { i18n } = data;
  if (!i18n?.en || !i18n?.ar) {
    errors.push('i18n.json: must have "en" and "ar" objects');
    return;
  }
  for (const key of Object.keys(i18n.en)) {
    if (!(key in i18n.ar)) errors.push(`i18n.json: key "${key}" exists in en but not in ar`);
  }
  const steps = i18n.en.tour_steps;
  if (!Array.isArray(steps) || steps.length < 12) {
    errors.push('i18n.json: en.tour_steps must be an array of ≥12 steps');
  } else {
    const unitIds = new Set(data.units.units?.map((x) => x.id) ?? []);
    steps.forEach((st, i) => {
      if (typeof st === 'object' && !unitIds.has(st.unit))
        errors.push(`i18n.json tour step #${i + 1}: unknown unit "${st.unit}"`);
    });
  }
}

/** Full-screen readable error overlay (bilingual header, content in English). */
export function showDataErrors(errors: string[]): void {
  const div = document.createElement('div');
  div.className = 'data-error-overlay';
  div.innerHTML = `
    <div class="data-error-box">
      <h1>Data error / خطأ في البيانات</h1>
      <p>The JSON data files failed validation. Fix and reload:</p>
      <ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
    </div>`;
  document.body.appendChild(div);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
