#!/usr/bin/env python3
"""The Hajar skyline seen from a point on the UAE plain, for the rail plate (scenes/plate-rail.js, this.sky).

For each bearing from AZ0 to AZ1 in steps of 0.4 degrees: the highest elevation angle of the UAE terrain within 45 km,
from AWS Terrain Tiles (z12, SRTM-derived), with standard refraction (k 0.13) and an eye 1.7 m above the ground. DEM
samples outside the UAE are ignored, so no Omani ridge forms the skyline. The same rules as lab/ridges.py, whose last
band this reproduces at the same bearings.

    python3 data/build/rak_skyline.py 25.29 55.86 70 165 [tile-cache-dir]      prints the [az, deg] pairs as JS
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
Z, DAZ, FAR, STEP = 12, 0.4, 45000, 45


def main(lat0, lon0, az0, az1, cache):
    # tiles covering FAR metres around the viewpoint
    dlat, dlon = FAR / 111320 + 0.02, FAR / (111320 * math.cos(math.radians(lat0))) + 0.02
    bbox = [lat0 - dlat, lon0 - dlon, lat0 + dlat, lon0 + dlon]

    def tile_xy(lat, lon):
        n = 2 ** Z
        return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n

    x0, y1 = tile_xy(bbox[0], bbox[1])
    x1, y0 = tile_xy(bbox[2], bbox[3])
    tiles = {}
    os.makedirs(cache, exist_ok=True)
    for tx in range(int(x0), int(x1) + 1):
        for ty in range(int(y0), int(y1) + 1):
            fn = os.path.join(cache, f'{Z}_{tx}_{ty}.png')
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

    M = json.load(open(os.path.join(HERE, '..', 'uae-map.json')))
    uae = prep(unary_union([Polygon(pg) for e in M['emirates'] for pg in e['polygons']]))
    assert uae.contains(Point(lon0, lat0)), 'viewpoint must be in the UAE'
    h0 = max(0.0, elev(lat0, lon0)) + 1.7
    Reff = 6371e3 / (1 - 0.13)
    out = []
    for az in np.round(np.arange(az0, az1 + 1e-9, DAZ), 2):
        best = -1.0
        for d in np.arange(300, FAR, STEP):
            lat = lat0 + d * math.cos(math.radians(az)) / 111320
            lon = lon0 + d * math.sin(math.radians(az)) / (111320 * math.cos(math.radians(lat0)))
            if not uae.contains(Point(lon, lat)):
                continue
            h = elev(lat, lon)
            if h is None:
                continue
            best = max(best, math.degrees(math.atan2(h - h0 - d * d / (2 * Reff), d)))
        out.append([float(az), round(best, 3)])
    return out


if __name__ == '__main__':
    lat0, lon0, az0, az1 = (float(x) for x in sys.argv[1:5])
    cache = sys.argv[5] if len(sys.argv) > 5 else os.path.join(HERE, 'tiles')
    sky = main(lat0, lon0, az0, az1, cache)
    print(json.dumps(sky, separators=(',', ':')))
