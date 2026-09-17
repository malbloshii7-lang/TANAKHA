// 2D process-flow-diagram view: an SVG generated from the same units.json /
// flows.json, laid out in columns by zone. Selecting a node here selects the
// same unit in 3D and vice versa.

import { data, on, pick, selectUnit, state } from './state';

// Column order approximates left-to-right process flow.
const ZONE_COLUMNS: Record<string, number> = {
  receipt: 0, primary: 1, conversion: 2, treating: 3, sulfur_h2: 4, blending: 5, export: 6,
  utilities: 3, context: 0,
};
const COL_W = 150;
const ROW_H = 58;
const NODE_W = 118;
const NODE_H = 40;

interface NodePos { x: number; y: number }
const nodePos = new Map<string, NodePos>();

export function initPfd(): void {
  layout();
  on('view', render);
  on('scenario', render);
  on('lang', render);
  on('select', updateSelection);
}

function layout(): void {
  const rows: Record<number, number> = {};
  for (const u of data.units.units) {
    if (u.zone === 'context' || u.zone === 'utilities') continue; // keep the diagram to the process
    const col = ZONE_COLUMNS[u.zone] ?? 0;
    const row = rows[col] ?? 0;
    rows[col] = row + 1;
    nodePos.set(u.id, { x: 40 + col * COL_W, y: 50 + row * ROW_H });
  }
}

function render(): void {
  const overlay = document.getElementById('pfd-overlay')!;
  if (!state.view2d) { overlay.classList.add('hidden'); return; }
  overlay.classList.remove('hidden');

  const height = 50 + Math.max(...[...nodePos.values()].map((p) => p.y)) + ROW_H;
  const width = 40 + 7 * COL_W;
  const parts: string[] = [];

  // Flow edges first (under the nodes)
  for (const f of data.flows.flows) {
    const a = nodePos.get(f.from), b = nodePos.get(f.to);
    if (!a || !b) continue;
    const vol = f.volume[state.scenario];
    const stream = data.flows.streams[f.stream];
    const w = vol > 0 ? Math.max(1, 5 * Math.sqrt(vol / 420) * 2) : 1;
    const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
    const x2 = b.x, y2 = b.y + NODE_H / 2;
    const mx = (x1 + x2) / 2;
    parts.push(`<path class="pfd-flow${vol > 0 ? '' : ' dim'}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}"
      stroke="${stream.color}" stroke-width="${w}"><title>${esc(streamTitle(f.stream))}: ${vol} kb/d</title></path>`);
  }

  // Nodes
  for (const u of data.units.units) {
    const p = nodePos.get(u.id);
    if (!p) continue;
    const zone = data.units.zones[u.zone];
    const name = pick(u as unknown as Record<string, unknown>, 'name');
    const short = name.length > 24 ? `${name.slice(0, 23)}…` : name;
    parts.push(`<g class="pfd-node${state.selectedUnit === u.id ? ' selected' : ''}" data-unit="${u.id}" transform="translate(${p.x},${p.y})">
      <rect width="${NODE_W}" height="${NODE_H}" stroke="${zone.color}"></rect>
      <text x="8" y="17">${esc(short)}</text>
      <text x="8" y="32" fill="#9aa4b2" font-size="9">${u.capacity_bpd ? `${(u.capacity_bpd / 1000).toFixed(0)}k b/d` : u.capacity_note ?? ''}</text>
    </g>`);
  }

  overlay.innerHTML = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
  overlay.querySelectorAll<SVGGElement>('.pfd-node').forEach((g) => {
    g.addEventListener('click', () => selectUnit(g.dataset.unit ?? null));
  });
}

function updateSelection(): void {
  if (!state.view2d) return;
  document.querySelectorAll<SVGGElement>('.pfd-node').forEach((g) => {
    g.classList.toggle('selected', g.dataset.unit === state.selectedUnit);
  });
}

function streamTitle(key: string): string {
  const s = data.flows.streams[key];
  return s ? pick(s as unknown as Record<string, unknown>, 'name') : key;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
