"""The Hajar front seen from Al Dhaid, in layers, for the long lens of the rail hero scene (lab/rail-3d.html).

The same terrain, viewpoint and rules as the rail plate's skyline (data/build/rak_skyline.py 25.29 55.86 70 115: AWS
Terrain Tiles, z12, SRTM-derived; standard refraction; DEM samples outside the UAE ignored, so no Omani ridge forms the
skyline), extended north to bearing 20 for the wider shots, sampled finer (0.05 degrees) and kept per distance band:
for each bearing, the highest elevation angle of the terrain nearer than each band's far edge. The last layer is the
skyline itself; the nearer layers are the ranges in front of it, which the scene draws far to near, so the far crests
show above the near ones as they do in the view.

    python3 lab/ridges.py [tile-cache-dir]      writes lab/rail-3d-ridges.js
"""
import json
import math
import os
import sys
import urllib.request

import numpy as np
from PIL import Image
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union
from shapely.prepared import prep

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = sys.argv[1] if len(sys.argv) > 1 else '.'
Z = 12
VIEW = (25.29, 55.86)  # lat, lon: the plain beside the line at Al Dhaid, as the plate
AZ0, AZ1, DAZ = 20.0, 115.0, 0.05
BANDS = [9000, 15000, 21000, 27000, 45000]  # far edges (m) of the layers, near to far; the last is the skyline
BBOX = [24.95, 55.8, 25.65, 56.45]


def tile_xy(lat, lon):
    n = 2 ** Z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


x0, y1 = tile_xy(BBOX[0], BBOX[1])
x1, y0 = tile_xy(BBOX[2], BBOX[3])
tiles = {}
for tx in range(int(x0), int(x1) + 1):
    for ty in range(int(y0), int(y1) + 1):
        fn = os.path.join(CACHE, f'{Z}_{tx}_{ty}.png')
        if not os.path.exists(fn):
            urllib.request.urlretrieve(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png', fn)
        a = np.asarray(Image.open(fn).convert('RGB')).astype(np.float64)
        tiles[(tx, ty)] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def elev(lat, lon):
    x, y = tile_xy(lat, lon)
    tx, ty = int(x), int(y)
    a = tiles.get((tx, ty))
    if a is None:
        return None
    px, py = (x - tx) * 256 - 0.5, (y - ty) * 256 - 0.5
    i, j = int(np.clip(math.floor(px), 0, 254)), int(np.clip(math.floor(py), 0, 254))
    fx, fy = np.clip(px - i, 0, 1), np.clip(py - j, 0, 1)
    return a[j, i] * (1 - fx) * (1 - fy) + a[j, i + 1] * fx * (1 - fy) + a[j + 1, i] * (1 - fx) * fy + a[j + 1, i + 1] * fx * fy


M = json.load(open(os.path.join(HERE, '..', 'data', 'uae-map.json')))
uae = prep(unary_union([Polygon(pg) for e in M['emirates'] for pg in e['polygons']]))
lat0, lon0 = VIEW
assert uae.contains(Point(lon0, lat0)), 'viewpoint must be in the UAE'
h0 = max(0.0, elev(lat0, lon0)) + 1.7
Reff = 6371e3 / (1 - 0.13)  # standard refraction
azs = np.round(np.arange(AZ0, AZ1 + 1e-9, DAZ), 2)
layers = [[] for _ in BANDS]
for az in azs:
    best = [-1.0] * len(BANDS)
    for d in np.arange(300, BANDS[-1], 45):
        lat = lat0 + d * math.cos(math.radians(az)) / 111320
        lon = lon0 + d * math.sin(math.radians(az)) / (111320 * math.cos(math.radians(lat0)))
        if not uae.contains(Point(lon, lat)):
            continue
        h = elev(lat, lon)
        if h is None:
            continue
        ang = math.degrees(math.atan2(h - h0 - d * d / (2 * Reff), d))
        for k, far in enumerate(BANDS):
            if d < far and ang > best[k]:
                best[k] = ang
    for k in range(len(BANDS)):
        layers[k].append(round(best[k], 3))
# the check against the plate: the last layer at the plate's bearings is the plate's skyline
sky = json.loads('[' + open(os.path.join(HERE, '..', 'scenes', 'plate-rail.js')).read().split('this.sky = [')[1].split('];')[0] + ']')
dev = max(abs(layers[-1][int(round((az - AZ0) / DAZ))] - el) for az, el in sky)
print('h0', round(h0, 1), 'max deviation from the plate skyline (deg):', round(dev, 3))
with open(os.path.join(HERE, 'rail-3d-ridges.js'), 'w') as f:
    f.write('// The Hajar front from Al Dhaid (25.29 N, 55.86 E), in layers: for each bearing from az0 in steps of daz (degrees),\n'
            '// the highest elevation angle (degrees) of the UAE terrain nearer than each band\'s far edge (m). The last layer is\n'
            '// the skyline. Computed by lab/ridges.py from AWS Terrain Tiles (z12, SRTM-derived), standard refraction.\n')
    f.write('const R3_RIDGES = ' + json.dumps({'az0': AZ0, 'daz': DAZ, 'bands': BANDS, 'layers': layers}, separators=(',', ':')) + ';\n')
print('wrote', len(azs), 'bearings x', len(BANDS), 'layers')
