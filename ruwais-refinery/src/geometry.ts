// Builds one THREE.Group of simple primitives per unit, keyed by unit.type.
// Schematic shapes only: a column is a cylinder, a tank farm is squat
// cylinders, the RFCC gets a reactor/regenerator pair — enough to read the
// process, nothing more.

import * as THREE from 'three';
import type { Unit } from './types';

const baseMat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.15, ...opts });

/** Slightly darken/lighten a hex color for visual variation between parts. */
function shade(hex: string, f: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(f);
  return `#${c.getHexString()}`;
}

export function buildUnitMesh(unit: Unit, zoneColor: string): THREE.Group {
  const g = new THREE.Group();
  const [w, h, d] = unit.size;
  const c = zoneColor;

  switch (unit.type) {
    case 'column': {
      const r = w / 2;
      g.add(mesh(new THREE.CylinderGeometry(r, r, h, 20), c, 0, h / 2, 0));
      g.add(mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, h * 0.18, 14), shade(c, 0.8), r * 1.1, h * 0.09, 0));
      g.add(mesh(new THREE.BoxGeometry(w * 1.6, 1, d * 1.6), shade(c, 0.5), 0, 0.5, 0));
      break;
    }
    case 'drum': {
      const r = Math.min(h, d) / 2;
      const drum = mesh(new THREE.CylinderGeometry(r, r, w, 16), c, 0, r + 1, 0);
      drum.rotation.z = Math.PI / 2;
      g.add(drum);
      g.add(mesh(new THREE.BoxGeometry(w * 0.9, 1, d), shade(c, 0.5), 0, 0.5, 0));
      // small vertical treater reactor beside the drum
      g.add(mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.5, h * 1.2, 12), shade(c, 0.85), 0, h * 0.6, d * 0.8));
      break;
    }
    case 'reactor': {
      // Fat main vessel + secondary vessel + connecting bridge (RFCC-style pair).
      const r1 = w * 0.30, r2 = w * 0.20;
      g.add(mesh(new THREE.CylinderGeometry(r1, r1 * 0.85, h * 0.85, 18), c, -w * 0.18, h * 0.42, 0));
      g.add(mesh(new THREE.CylinderGeometry(r2, r2, h, 16), shade(c, 0.85), w * 0.28, h / 2, 0));
      const bridge = mesh(new THREE.CylinderGeometry(1.1, 1.1, w * 0.5, 8), shade(c, 0.7), w * 0.05, h * 0.72, 0);
      bridge.rotation.z = Math.PI / 2;
      g.add(bridge);
      g.add(mesh(new THREE.BoxGeometry(w * 1.3, 1, d * 1.3), shade(c, 0.5), 0, 0.5, 0));
      break;
    }
    case 'tank': {
      const r = w / 2;
      g.add(mesh(new THREE.CylinderGeometry(r, r, h, 24), c, 0, h / 2, 0));
      g.add(mesh(new THREE.ConeGeometry(r, r * 0.25, 24), shade(c, 0.9), 0, h + r * 0.12, 0));
      break;
    }
    case 'tankfarm': {
      // Grid of tank_count squat cylinders; scene.ts recolors them per scenario.
      const count = unit.tank_count ?? 6;
      const cols = Math.ceil(count / 2);
      const r = Math.min(w / (cols * 2.4), d / 5);
      for (let i = 0; i < count; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * r * 2.5;
        const z = (row - 0.5) * r * 2.6;
        const tank = mesh(new THREE.CylinderGeometry(r, r, unit.size[1], 20), '#666666', x, unit.size[1] / 2, z);
        tank.userData.tankIndex = i;
        g.add(tank);
      }
      break;
    }
    case 'sphere': {
      const r = w / 2;
      g.add(mesh(new THREE.SphereGeometry(r, 18, 14), c, 0, r + 1.5, 0));
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, r + 1.5, 6), shade(c, 0.6), Math.cos(a) * r * 0.7, (r + 1.5) / 2, Math.sin(a) * r * 0.7));
      }
      break;
    }
    case 'box':
      g.add(mesh(new THREE.BoxGeometry(w, h, d), c, 0, h / 2, 0));
      break;
    case 'furnace': {
      g.add(mesh(new THREE.BoxGeometry(w, h * 0.6, d), c, 0, h * 0.3, 0));
      for (let i = 0; i < 3; i++) {
        g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, h * 1.4, 10), shade(c, 0.8), (i - 1) * w * 0.28, h * 0.7, 0));
      }
      break;
    }
    case 'flare': {
      g.add(mesh(new THREE.CylinderGeometry(0.7, 0.9, h, 10), '#555560', 0, h / 2, 0));
      const flame = mesh(new THREE.ConeGeometry(1.8, 5, 10), '#ff9a3c', 0, h + 2.5, 0);
      (flame.material as THREE.MeshStandardMaterial).emissive = new THREE.Color('#ff6a00');
      (flame.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.4;
      flame.name = 'flame';
      g.add(flame);
      break;
    }
    case 'jetty': {
      g.add(mesh(new THREE.BoxGeometry(w, 2, d), shade(c, 0.9), 0, 1, 0));
      // schematic tanker alongside
      const hull = mesh(new THREE.BoxGeometry(w * 1.1, 3, d * 0.5), '#40485a', 0, 1.5, d * 0.95);
      g.add(hull);
      g.add(mesh(new THREE.BoxGeometry(w * 0.2, 3, d * 0.35), '#5a6478', -w * 0.35, 4.2, d * 0.95));
      break;
    }
    case 'pipeline': {
      g.add(mesh(new THREE.BoxGeometry(w, 1.2, d), shade(c, 0.8), 0, 0.6, 0));
      const pipe = mesh(new THREE.CylinderGeometry(1, 1, w, 10), c, 0, 2.2, 0);
      pipe.rotation.z = Math.PI / 2;
      g.add(pipe);
      break;
    }
    case 'context': {
      const m = mesh(new THREE.BoxGeometry(w, h, d), c, 0, h / 2, 0);
      (m.material as THREE.MeshStandardMaterial).transparent = true;
      (m.material as THREE.MeshStandardMaterial).opacity = 0.45;
      g.add(m);
      break;
    }
  }

  g.position.set(unit.position[0], unit.position[1], unit.position[2]);
  g.traverse((o) => { o.userData.unitId = unit.id; });
  return g;
}

function mesh(geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number): THREE.Mesh {
  const m = new THREE.Mesh(geo, baseMat(color));
  m.position.set(x, y, z);
  return m;
}

/** Height at which flow pipes should attach to this unit. */
export function attachHeight(unit: Unit): number {
  if (unit.type === 'column' || unit.type === 'reactor') return unit.size[1] * 0.55;
  if (unit.type === 'flare') return unit.size[1] * 0.9;
  return Math.min(unit.size[1] * 0.6, 6);
}
