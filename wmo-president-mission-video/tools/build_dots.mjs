import fs from 'fs';
import { geoContains, geoBounds } from 'd3-geo';
import { feature } from 'topojson-client';
const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json'));
const land = feature(topo, topo.objects.land);
// split into polygons with bounding boxes for speed
const polys = land.features ? land.features : [land];
const parts = [];
for (const f of polys) {
  const g = f.geometry;
  const coords = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
  for (const c of coords) {
    const pf = { type: 'Feature', geometry: { type: 'Polygon', coordinates: c } };
    parts.push({ pf, b: geoBounds(pf) });
  }
}
function isLand(lon, lat) {
  for (const p of parts) {
    const [[x0, y0], [x1, y1]] = p.b;
    if (lat < y0 - 0.01 || lat > y1 + 0.01) continue;
    if (x0 <= x1 && (lon < x0 - 0.01 || lon > x1 + 0.01)) continue;
    if (geoContains(p.pf, [lon, lat])) return true;
  }
  return false;
}
const t0 = Date.now();
// globe: equal-area rows
const globe = [];
const STEP = 1.32;
for (let lat = -57; lat <= 83; lat += STEP) {
  const n = Math.max(1, Math.round(360 * Math.cos(lat * Math.PI / 180) / STEP));
  for (let i = 0; i < n; i++) {
    const lon = -180 + (i + 0.5) * 360 / n;
    if (isLand(lon, lat)) globe.push([+lon.toFixed(2), +lat.toFixed(2)]);
  }
}
// flat map: regular lon/lat grid (equirectangular dot matrix)
const flat = [];
const FS = 2.2;
for (let lat = -56; lat <= 80; lat += FS) for (let lon = -180 + FS / 2; lon < 180; lon += FS)
  if (isLand(lon, lat)) flat.push([+lon.toFixed(2), +lat.toFixed(2)]);
fs.writeFileSync('assets/dots.js', 'window.GLOBE_DOTS=' + JSON.stringify(globe) + ';\nwindow.FLAT_DOTS=' + JSON.stringify(flat) + ';\n');
console.log('parts', parts.length, 'globe', globe.length, 'flat', flat.length, (Date.now() - t0) / 1000 + 's');
