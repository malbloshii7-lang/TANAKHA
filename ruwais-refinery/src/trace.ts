// "Trace a barrel": click a crude tank and watch one barrel travel to the
// CDU, split into its distillation cuts, and follow each cut through
// conversion/treating to its final product tank. Routes are computed from
// flows.json for the active scenario — no hardcoded paths.

import * as THREE from 'three';
import { flowCurve } from './flows';
import type { SceneCtx } from './scene';
import { data, on, pick, state, setTraceMode, t } from './state';
import type { Flow } from './types';

interface Mover {
  mesh: THREE.Mesh;
  chain: Flow[];
  hop: number;
  t: number;
  curve: THREE.Curve<THREE.Vector3>;
  done: boolean;
}

const HOP_SECONDS = 2.4;
let ctx: SceneCtx;
let group: THREE.Group;
let movers: Mover[] = [];
let running = false;

export function initTrace(sceneCtx: SceneCtx): void {
  ctx = sceneCtx;
  group = new THREE.Group();
  ctx.scene.add(group);
  ctx.onFrame(animate);

  on('trace', () => {
    const box = document.getElementById('trace-box')!;
    if (state.traceMode) {
      box.classList.remove('hidden');
      setCaption(t('trace_hint'));
    } else {
      box.classList.add('hidden');
      stop();
    }
  });

  // Clicking the tank farm while trace mode is armed starts the run.
  on('select', () => {
    if (!state.traceMode || running) return;
    const unit = data.units.units.find((u) => u.id === state.selectedUnit);
    if (unit?.type === 'tankfarm') start(unit.id);
  });

  on('scenario', stop);
}

function setCaption(html: string): void {
  const box = document.getElementById('trace-box')!;
  box.innerHTML = `<p>${html}</p><button class="btn" id="trace-exit">${t('trace_exit')}</button>`;
  box.querySelector('#trace-exit')!.addEventListener('click', () => setTraceMode(false));
}

function scenarioFlows(): Flow[] {
  return data.flows.flows.filter((f) => f.volume[state.scenario] > 0 && !f.context);
}

/** Greedy walk: from `fromFlow`'s sink, keep following the largest-volume
 *  outflow (skipping utility streams) until we land in a storage unit. */
function extendChain(first: Flow): Flow[] {
  const chain = [first];
  const visited = new Set([first.from, first.to]);
  const flows = scenarioFlows();
  let current = first.to;
  for (let guard = 0; guard < 10; guard++) {
    const unit = data.units.units.find((u) => u.id === current);
    if (!unit || unit.type === 'tank' || unit.type === 'sphere' || unit.id === 'sulfur_pad') break;
    const next = flows
      .filter((f) => f.from === current && !visited.has(f.to) && f.stream !== 'hydrogen')
      .sort((a, b) => b.volume[state.scenario] - a.volume[state.scenario])[0];
    if (!next) break;
    chain.push(next);
    visited.add(next.to);
    current = next.to;
  }
  return chain;
}

function start(tankFarmId: string): void {
  const flows = scenarioFlows();
  const toCdu = flows.find((f) => f.from === tankFarmId);
  if (!toCdu) return;
  running = true;
  group.clear();
  movers = [spawnMover([toCdu], 2.2)];
  const crude = data.scenarios.crudes[data.scenarios.scenarios[state.scenario].feed[0].crude];
  setCaption(`🛢 1 barrel of <b>${pick(crude as unknown as Record<string, unknown>, 'name')}</b> → CDU…`);
  ctx.resetView();
}

/** When the barrel reaches the CDU, split it into one mover per CDU cut,
 *  sized by the cut's share of the barrel. */
function splitAtCdu(cduId: string): void {
  const cuts = scenarioFlows().filter((f) => f.from === cduId && f.stream !== 'hydrogen');
  const total = cuts.reduce((s, f) => s + f.volume[state.scenario], 0);
  for (const cut of cuts) {
    const share = cut.volume[state.scenario] / total;
    movers.push(spawnMover(extendChain(cut), 0.8 + 2.6 * Math.sqrt(share)));
  }
  const sc = data.scenarios.scenarios[state.scenario];
  const parts = Object.entries(sc.cdu_cuts_pct)
    .map(([k, v]) => `${v}% ${streamLabel(k)}`).join(' · ');
  setCaption(`CDU splits the barrel: ${parts}. Watch each cut reach its product tank.`);
}

function streamLabel(k: string): string {
  const s = data.flows.streams[k];
  return s ? pick(s as unknown as Record<string, unknown>, 'name') : k;
}

function spawnMover(chain: Flow[], radius: number): Mover {
  const color = data.flows.streams[chain[0].stream].color;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 12, 10),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 }),
  );
  group.add(mesh);
  return { mesh, chain, hop: 0, t: 0, curve: flowCurve(chain[0]), done: false };
}

function animate(dt: number): void {
  if (!running) return;
  let allDone = true;
  for (const m of movers) {
    if (m.done) continue;
    allDone = false;
    m.t += dt / HOP_SECONDS;
    if (m.t >= 1) {
      const arrivedAt = m.chain[m.hop].to;
      m.hop += 1;
      m.t = 0;
      if (m.hop >= m.chain.length) {
        m.done = true;
        // The single crude barrel arriving at the distillation unit triggers the split.
        if (movers.length === 1) splitAtCdu(arrivedAt);
        continue;
      }
      m.curve = flowCurve(m.chain[m.hop]);
      const color = data.flows.streams[m.chain[m.hop].stream].color;
      (m.mesh.material as THREE.MeshStandardMaterial).color.set(color);
      (m.mesh.material as THREE.MeshStandardMaterial).emissive.set(color);
    }
    m.curve.getPointAt(Math.min(m.t, 1), m.mesh.position);
  }
  if (allDone && movers.length > 1) {
    running = false;
    setCaption('✓ Every fraction reached storage. Switch scenario and trace again to compare diets.');
  } else if (allDone && movers.length === 1 && movers[0].done) {
    // barrel reached CDU but split didn't trigger (shouldn't happen) — finish cleanly
    running = false;
  }
}

function stop(): void {
  running = false;
  movers = [];
  group?.clear();
}
