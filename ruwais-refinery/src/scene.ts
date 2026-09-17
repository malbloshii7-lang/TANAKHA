// Three.js scene: renderer, camera, lights, unit meshes, labels, picking,
// camera presets and the render loop. Other modules register per-frame
// updaters via onFrame().

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { buildUnitMesh } from './geometry';
import { data, on, pick, selectUnit, state } from './state';
import type { Unit } from './types';

export interface SceneCtx {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  unitGroups: Map<string, THREE.Group>;
  onFrame: (fn: (dt: number) => void) => void;
  flyTo: (pos: THREE.Vector3, target: THREE.Vector3, ms?: number) => void;
  resetView: () => void;
  focusUnit: (id: string, ms?: number) => void;
}

// Units whose labels stay visible when zoomed far out (the story-critical ones).
const MAJOR_LABELS = new Set([
  'crude_tanks', 'cdu', 'vdu', 'ard', 'rfcc', 'hcu', 'hmu', 'sru',
  'product_jetty', 'crude_jetty', 'habshan_inlet', 'ctx_east', 'ctx_borouge', 'ctx_lng',
]);

const HOME_POS = new THREE.Vector3(-25, 195, 225);
const HOME_TARGET = new THREE.Vector3(-15, 0, -10);

export function initScene(container: HTMLElement): SceneCtx {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#101318');
  scene.fog = new THREE.Fog('#101318', 380, 700);

  const camera = new THREE.PerspectiveCamera(50, 1, 1, 1200);
  camera.position.copy(HOME_POS);

  const renderer = new THREE.WebGLRenderer({ antialias: !state.isMobile });
  // Cap pixel ratio: retina x2 halves the frame budget for no schematic benefit.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.isMobile ? 1.5 : 2));
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'label-layer';
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.49; // never below ground
  controls.minDistance = 25;
  controls.maxDistance = 520;

  // Flat dark-industrial lighting: hemisphere + one key light. No shadows —
  // readability over drama, and shadows cost mobile frames.
  scene.add(new THREE.HemisphereLight('#9aa4b5', '#20242c', 1.1));
  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(120, 200, 80);
  scene.add(key);

  // Ground + subtle grid
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 620),
    new THREE.MeshStandardMaterial({ color: '#181c22', roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
  const grid = new THREE.GridHelper(800, 40, '#242a33', '#1d222a');
  grid.position.y = 0.02;
  scene.add(grid);

  // "Sea" strip on the jetty side, purely orientational.
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 620),
    new THREE.MeshStandardMaterial({ color: '#12202e', roughness: 0.9 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(-235, 0.01, 0);
  scene.add(sea);
  const sea2 = sea.clone();
  sea2.position.set(235, 0.01, 0);
  scene.add(sea2);

  // Build all units
  const unitGroups = new Map<string, THREE.Group>();
  for (const unit of data.units.units) {
    const zone = data.units.zones[unit.zone];
    const g = buildUnitMesh(unit, zone.color);
    g.add(makeLabel(unit));
    scene.add(g);
    unitGroups.set(unit.id, g);
  }
  applyTankGrades(unitGroups);
  on('scenario', () => applyTankGrades(unitGroups));
  on('lang', () => refreshLabels(unitGroups));
  on('select', () => highlightSelection(unitGroups));

  // Picking
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downAt = 0;
  renderer.domElement.addEventListener('pointerdown', () => { downAt = performance.now(); });
  renderer.domElement.addEventListener('pointerup', (ev) => {
    if (performance.now() - downAt > 250) return; // drag, not click
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([...unitGroups.values()], true);
    const id = hits.find((h) => h.object.userData.unitId)?.object.userData.unitId ?? null;
    selectUnit(id);
  });

  // Camera tween
  let tween: { fromP: THREE.Vector3; toP: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number; ms: number } | null = null;
  const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, ms = 1100): void => {
    tween = { fromP: camera.position.clone(), toP: pos.clone(), fromT: controls.target.clone(), toT: target.clone(), t: 0, ms };
  };
  const resetView = (): void => flyTo(HOME_POS, HOME_TARGET);
  const focusUnit = (id: string, ms = 1100): void => {
    const unit = data.units.units.find((u) => u.id === id);
    if (!unit) return;
    const p = new THREE.Vector3(...unit.position);
    const span = Math.max(unit.size[0], unit.size[1], unit.size[2]);
    const dist = Math.max(span * 3.2, 40);
    flyTo(p.clone().add(new THREE.Vector3(dist * 0.55, dist * 0.75, dist * 0.8)), p.clone().setY(unit.size[1] * 0.4), ms);
  };

  // Render loop
  const frameFns: ((dt: number) => void)[] = [];
  const onFrame = (fn: (dt: number) => void): void => { frameFns.push(fn); };
  const clock = new THREE.Clock();

  function resize(): void {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    if (tween) {
      tween.t += (dt * 1000) / tween.ms;
      const k = tween.t >= 1 ? 1 : 1 - Math.pow(1 - tween.t, 3); // ease-out cubic
      camera.position.lerpVectors(tween.fromP, tween.toP, k);
      controls.target.lerpVectors(tween.fromT, tween.toT, k);
      if (tween.t >= 1) tween = null;
    }
    controls.update();
    updateLabelVisibility(camera, unitGroups);
    for (const fn of frameFns) fn(dt);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

  return { scene, camera, controls, renderer, unitGroups, onFrame, flyTo, resetView, focusUnit };
}

function makeLabel(unit: Unit): CSS2DObject {
  const div = document.createElement('div');
  div.className = `unit-label${MAJOR_LABELS.has(unit.id) ? ' major' : ''}`;
  div.textContent = pick(unit as unknown as Record<string, unknown>, 'name');
  div.dataset.unitId = unit.id;
  div.addEventListener('pointerdown', (e) => { e.stopPropagation(); selectUnit(unit.id); });
  const obj = new CSS2DObject(div);
  obj.position.set(0, unit.size[1] + 5, 0);
  obj.name = 'label';
  return obj;
}

function refreshLabels(unitGroups: Map<string, THREE.Group>): void {
  for (const unit of data.units.units) {
    const g = unitGroups.get(unit.id);
    const label = g?.getObjectByName('label') as CSS2DObject | undefined;
    if (label) (label.element as HTMLElement).textContent = pick(unit as unknown as Record<string, unknown>, 'name');
  }
}

/** Minor labels fade out when far away so the overview stays readable. */
function updateLabelVisibility(camera: THREE.PerspectiveCamera, unitGroups: Map<string, THREE.Group>): void {
  const far = state.isMobile ? 210 : 280;
  for (const [, g] of unitGroups) {
    const label = g.getObjectByName('label') as CSS2DObject | undefined;
    if (!label) continue;
    const el = label.element as HTMLElement;
    const dist = camera.position.distanceTo(g.position);
    const hide = !el.classList.contains('major') && dist > far;
    el.classList.toggle('hidden', hide);
  }
}

/** Recolor tank-farm tanks to the scenario's stored grades. */
function applyTankGrades(unitGroups: Map<string, THREE.Group>): void {
  const farm = data.units.units.find((u) => u.type === 'tankfarm');
  if (!farm) return;
  const grades = data.scenarios.scenarios[state.scenario].tank_grades;
  const g = unitGroups.get(farm.id);
  g?.traverse((o) => {
    if (o instanceof THREE.Mesh && o.userData.tankIndex !== undefined) {
      const crude = data.scenarios.crudes[grades[o.userData.tankIndex as number]];
      (o.material as THREE.MeshStandardMaterial).color.set(crude?.color ?? '#666666');
    }
  });
}

let prevSelected: string | null = null;
function highlightSelection(unitGroups: Map<string, THREE.Group>): void {
  const setEmissive = (id: string | null, on_: boolean): void => {
    if (!id) return;
    unitGroups.get(id)?.traverse((o) => {
      if (o instanceof THREE.Mesh && o.name !== 'flame') {
        (o.material as THREE.MeshStandardMaterial).emissive.set(on_ ? '#3d6bff' : '#000000');
        (o.material as THREE.MeshStandardMaterial).emissiveIntensity = on_ ? 0.35 : 0;
      }
    });
    const label = unitGroups.get(id)?.getObjectByName('label') as CSS2DObject | undefined;
    (label?.element as HTMLElement | undefined)?.classList.toggle('selected', on_);
  };
  setEmissive(prevSelected, false);
  setEmissive(state.selectedUnit, true);
  prevSelected = state.selectedUnit;
}
