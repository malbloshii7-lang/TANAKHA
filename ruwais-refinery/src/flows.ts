// Animated material flows: a translucent pipe (tube) per flow whose radius
// scales with the scenario volume, plus particles drifting along the path.
// Rebuilt whenever the scenario changes (≈40 flows, cheap).

import * as THREE from 'three';
import { attachHeight } from './geometry';
import type { SceneCtx } from './scene';
import { data, on, state } from './state';
import type { Flow, Unit } from './types';

interface FlowObj {
  flow: Flow;
  curve: THREE.Curve<THREE.Vector3>;
  points: THREE.Points;
  offsets: Float32Array; // per-particle phase 0..1
  speed: number;
}

let group: THREE.Group;
let flowObjs: FlowObj[] = [];
const unitById = new Map<string, Unit>();

export function initFlows(ctx: SceneCtx): void {
  for (const u of data.units.units) unitById.set(u.id, u);
  group = new THREE.Group();
  ctx.scene.add(group);
  rebuild();
  on('scenario', rebuild);
  ctx.onFrame(animate);
}

/** Path for a flow, routed like a pipe rack: drop from the source nozzle to
 *  rack height, run rectilinear (x first, then z), rise into the sink.
 *  A deterministic per-flow jitter spreads parallel pipes into lanes. */
export function flowCurve(flow: Flow): THREE.Curve<THREE.Vector3> {
  const a = unitById.get(flow.from)!;
  const b = unitById.get(flow.to)!;
  const pa = new THREE.Vector3(a.position[0], attachHeight(a), a.position[2]);
  const pb = new THREE.Vector3(b.position[0], attachHeight(b), b.position[2]);
  const hash = [...(flow.from + flow.to + flow.stream)].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const rackY = 1.6 + (hash % 6) * 0.8;
  const jx = (((hash >> 2) % 5) - 2) * 1.5;
  const jz = ((hash % 5) - 2) * 1.5;

  const drop = new THREE.Vector3(pa.x, rackY, pa.z);
  const corner = new THREE.Vector3(pb.x + jx, rackY, pa.z + jz);
  const rise = new THREE.Vector3(pb.x + jx, rackY, pb.z);

  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(pa, drop));
  path.add(new THREE.LineCurve3(drop, corner));
  path.add(new THREE.LineCurve3(corner, rise));
  path.add(new THREE.LineCurve3(rise, pb));
  return path;
}

function rebuild(): void {
  group.clear();
  flowObjs = [];
  const particleFactor = state.isMobile ? 0.5 : 1;

  for (const flow of data.flows.flows) {
    const vol = flow.volume[state.scenario];
    if (vol <= 0) continue;
    const stream = data.flows.streams[flow.stream];
    const curve = flowCurve(flow);

    // Pipe: radius grows with sqrt of volume so area ∝ volume.
    const radius = 0.22 + 1.15 * Math.sqrt(vol / 420);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, radius, 6),
      new THREE.MeshBasicMaterial({
        color: stream.color,
        transparent: true,
        opacity: flow.context ? 0.14 : 0.3,
        depthWrite: false,
      }),
    );
    group.add(tube);

    // Particles
    const count = Math.max(2, Math.round(Math.min(vol / 12, 26) * particleFactor));
    const offsets = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) offsets[i] = i / count;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      color: stream.color,
      size: Math.max(1.6, radius * 2.2),
      sizeAttenuation: true,
      transparent: true,
      opacity: flow.context ? 0.4 : 0.95,
      depthWrite: false,
    }));
    group.add(points);

    flowObjs.push({ flow, curve, points, offsets, speed: 0.05 + Math.min(vol / 420, 1) * 0.06 });
  }
}

const tmp = new THREE.Vector3();
function animate(dt: number): void {
  for (const f of flowObjs) {
    const pos = f.points.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < f.offsets.length; i++) {
      f.offsets[i] = (f.offsets[i] + dt * f.speed) % 1;
      f.curve.getPointAt(f.offsets[i], tmp);
      pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    pos.needsUpdate = true;
  }
}
