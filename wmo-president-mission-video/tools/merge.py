"""Merge motion-blur sub-frames (NNNNN_sJ.png) into NNNNN.png, averaging in linear light."""
import sys, os, glob, re
import numpy as np
from PIL import Image
d = sys.argv[1]
groups = {}
for f in glob.glob(os.path.join(d, '*_s*.png')):
    m = re.match(r'(\d+)_s(\d+)\.png$', os.path.basename(f))
    groups.setdefault(m.group(1), []).append(f)
lut = (np.arange(256) / 255.0) ** 2.2
for k, files in sorted(groups.items()):
    acc = None
    for f in files:
        a = lut[np.asarray(Image.open(f).convert('RGB'))]
        acc = a if acc is None else acc + a
    out = np.clip((acc / len(files)) ** (1 / 2.2) * 255 + 0.5, 0, 255).astype(np.uint8)
    Image.fromarray(out).save(os.path.join(d, k + '.png'), compress_level=1)
    for f in files: os.remove(f)
print('merged', len(groups), 'frames')
