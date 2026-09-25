'use strict';
// Sky maths shared by the night scenes: where each catalogue star stands over Abu Dhabi at a given moment.
const SKY = { lat: 24.4539, lon: 54.3773 }; // Abu Dhabi
function jdUTC(y, mo, d, h) {
  if (mo <= 2) { y -= 1; mo += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5 + h / 24;
}
const gmstDeg = J => (280.46061837 + 360.98564736629 * (J - 2451545)) % 360;
function altAz(ra, dec, J) { // degrees in, degrees out
  const r = Math.PI / 180, H = ((gmstDeg(J) + SKY.lon - ra) % 360) * r, d = dec * r, p = SKY.lat * r;
  const alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
  const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(H));
  return [alt / r, ((az / r) % 360 + 360) % 360];
}
function sunRaDec(J) {
  const n = J - 2451545.0, r = Math.PI / 180, L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * r;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * r, eps = (23.439 - 4e-7 * n) * r;
  return [((Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / r) % 360 + 360) % 360, Math.asin(Math.sin(eps) * Math.sin(lam)) / r];
}
// view = { az0, pxDeg, hz }: facing azimuth az0, pxDeg pixels to the degree, the horizon at y hz
const skyXY = (alt, az, v) => [960 + ((((az - v.az0) % 360) + 540) % 360 - 180) * v.pxDeg, v.hz - alt * v.pxDeg];
const airmass = alt => 1 / (Math.sin(Math.max(alt, 0.1) * Math.PI / 180) + 0.50572 * Math.pow(Math.max(alt, 0.1) + 6.07995, -1.6364));


// Globe geometry for the world plate: orthographic projection and unit vectors
function ortho(lat, lon, lat0, lon0, R) {
  const f = (lat * Math.PI) / 180, l = ((lon - lon0) * Math.PI) / 180, f0 = (lat0 * Math.PI) / 180;
  const x = R * Math.cos(f) * Math.sin(l), y = R * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l));
  const vis = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
  return [x, y, vis];
}
function toVec(lat, lon) { const f = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180; return [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)]; }
function toLatLon([x, y, z]) { return [(Math.asin(clamp(z, -1, 1)) * 180) / Math.PI, (Math.atan2(y, x) * 180) / Math.PI]; }
