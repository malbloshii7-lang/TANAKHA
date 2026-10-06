// Emblem geometry for Al Falah Al Thahabi Kitchen.
// Coordinate space: viewBox -500 -500 1000 1000, centred on (0,0).
// Everything is a filled shape (no strokes) so the mark scales and prints cleanly.
const f = (n) => +n.toFixed(2);

// Grain as a closed elliptical path (so many grains can live in one evenodd path).
function grainPath(cx, cy, a, b, deg) {
  const r = (deg * Math.PI) / 180, ux = Math.cos(r) * a, uy = Math.sin(r) * a;
  return `M${f(cx + ux)} ${f(cy + uy)}A${a} ${b} ${f(deg)} 1 1 ${f(cx - ux)} ${f(cy - uy)}A${a} ${b} ${f(deg)} 1 1 ${f(cx + ux)} ${f(cy + uy)}Z`;
}

// Braided ring of rice grains, each tilted against the tangent (talli-braid rhythm).
const BRAID = { n: 108, r: 440, len: 24, wid: 7.2, tilt: 38 };
function grainRing({ n, r, len, wid, tilt }) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const deg = (t * 180) / Math.PI + tilt; // the tangent at polar angle t points t degrees from +x
    d += grainPath(Math.sin(t) * r, -Math.cos(t) * r, len / 2, wid / 2, deg);
  }
  return d;
}

// Heaped rice mound: h(x) = H * (1 - u^Q)^P with u = |x| / rx, flaring tangentially into the tray.
const DOME = { rx: 268, ry: 232, P: 1.6, Q: 2.6, base: 150 };
const heap = (x, rx, H) => { const u = Math.abs(x) / rx; return u >= 1 ? 0 : H * (1 - u ** DOME.Q) ** DOME.P; };
const surface = (x) => DOME.base - heap(x, DOME.rx, DOME.ry);
function domeOutline() {
  const pts = [];
  for (let i = 0; i <= 320; i++) { const x = -DOME.rx + (2 * DOME.rx * i) / 320; pts.push([x, surface(x)]); }
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

// Rows of rice grains cut out along inset contours of the mound, herringbone-tilted against the slope (sadu-weave rhythm).
const WEAVE = { rows: 6, gap: 28, step: 26, len: 17, wid: 5.4, tilt: 18, top: 32, shrink: 0.55 };
function domeTexture({ rows, gap, step, len, wid, tilt, top, shrink }) {
  let d = '';
  for (let k = 0; k < rows; k++) {
    const inset = top + k * gap;
    const H = DOME.ry - inset, rx = DOME.rx - inset * shrink;
    const yAt = (x) => DOME.base - heap(x, rx, H);
    // arc-length stations from the centre outward; alternate rows start half a step out
    const xs = k % 2 ? [] : [0];
    let next = k % 2 ? step / 2 : step, acc = 0;
    for (let x = 0, dx = 0.25; x + dx < rx; x += dx) {
      acc += Math.hypot(dx, yAt(x + dx) - yAt(x));
      if (acc >= next) { xs.push(x + dx); next += step; }
    }
    for (const ax of xs) {
      for (const side of ax === 0 ? [1] : [1, -1]) {
        const gx = ax * side, gy = yAt(gx);
        if (gy > DOME.base - 26) continue; // keep a clean band above the tray
        const slope = (Math.atan2(yAt(gx + 0.5) - yAt(gx - 0.5), 1) * 180) / Math.PI;
        // mirror the tilt on the left half so the herringbone stays bilaterally symmetric
        d += grainPath(gx, gy, len / 2, wid / 2, slope + (k % 2 ? tilt : -tilt) * side);
      }
    }
  }
  return d;
}

// Serving tray (siniya) with a slim footed base.
function tray() {
  const top = DOME.base + 14;
  const dish = `M-302 ${top}H302C295 ${top + 22} 268 ${top + 36} 226 ${top + 38}H-226C-268 ${top + 36} -295 ${top + 22} -302 ${top}Z`;
  const fy = top + 48;
  const foot = `M-104 ${fy}H104L128 ${fy + 22}H-128Z`;
  return { dish, foot, bottom: fy + 22 };
}

// Annulus between r1 (outer) and r2 (inner) as an evenodd path.
function circleRing(r1, r2) {
  const c = (r) => `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`;
  return c(r1) + c(r2);
}

// Scene: the chef in profile on the right, lifting the lid off a steaming rice platter on the left.
// The platter (heap + tray) is drawn in its own space and placed with PLATTER; the whole scene
// is then fitted into the inner field with SCENE. HALO is the negative gap between overlapping forms.
const { figure } = require('./chef');
const PLATTER = { s: 0.5, x: -105, y: 128 };
const SCENE = { s: 1.08, x: 27, y: 38 };
const HALO = 12;
const platter = ([x, y]) => [(x * PLATTER.s + PLATTER.x) * SCENE.s + SCENE.x, (y * PLATTER.s + PLATTER.y) * SCENE.s + SCENE.y];
const scene = ([x, y]) => [x * SCENE.s + SCENE.x, y * SCENE.s + SCENE.y];

let uid = 0;
// Full emblem as SVG markup, filled with a flat colour or a diagonal metallic gradient.
function emblem({ paint, gradId, gradient }) {
  const t = tray(), c = figure(), id = `em${++uid}`;
  const platterT = `translate(${PLATTER.x} ${PLATTER.y}) scale(${PLATTER.s})`;
  // knockout shapes: whatever sits in front cuts a HALO-wide gap into the lines behind it
  const platterHalo = `<g transform="${platterT}" stroke-width="${f((2 * HALO) / PLATTER.s)}"><path d="${domeOutline()}"/><path d="${t.dish}"/><path d="${t.foot}"/></g>`;
  const lidHalo = `<g transform="${c.lid.t}" stroke-width="${2 * HALO}"><path d="${c.lid.parts[0]}" fill-rule="nonzero"/><path d="${c.lid.parts[1]}"/></g>`;
  const sleeveHalo = `<path d="${c.sleeve}" stroke-width="${HALO}"/>`;
  const mask = (name, inner) => `<mask id="${id}-${name}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="1000" height="1000">
    <rect x="-500" y="-500" width="1000" height="1000" fill="#fff"/><g fill="#000" stroke="#000" stroke-linejoin="round">${inner}</g></mask>`;
  const grad = gradient
    ? `<linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="-420" y1="-480" x2="420" y2="480">${gradient}</linearGradient>`
    : '';
  const paths = (list) => list.map((d) => `<path d="${d}"/>`).join('');
  return `<defs>${grad}${mask('body', platterHalo + lidHalo + sleeveHalo)}${mask('arm', platterHalo + lidHalo)}${mask('steam', lidHalo)}</defs>
  <g fill="${gradient ? `url(#${gradId})` : paint}" fill-rule="evenodd">
    <path d="${circleRing(490, 482)}"/><path d="${circleRing(470, 467.5)}"/><path d="${grainRing(BRAID)}"/>
    <path d="${circleRing(412.5, 410)}"/><path d="${circleRing(398, 390)}"/>
    <g transform="translate(${SCENE.x} ${SCENE.y}) scale(${SCENE.s})">
      <g mask="url(#${id}-body)">${paths(c.behindArm)}</g>
      <g mask="url(#${id}-arm)">${paths(c.arm)}</g>
      <g mask="url(#${id}-steam)">${paths(c.steam)}</g>
      <g transform="${c.lid.t}">${paths(c.lid.parts)}</g>
      <g transform="${platterT}"><path d="${domeOutline() + domeTexture(WEAVE)}"/><path d="${t.dish}"/><path d="${t.foot}"/></g>
    </g></g>`;
}

module.exports = { emblem, platter, scene, surface, BRAID, DOME, WEAVE, PLATTER, SCENE };
