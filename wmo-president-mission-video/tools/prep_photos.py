"""Extract the six city photos from the reference infographic, inpaint the
peaked-corner/node/tab areas, and upscale 4x with Real-ESRGAN (ncnn, CPU)."""
import numpy as np, cv2, ncnn, time, sys
from PIL import Image

import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f'{ROOT}/ref/infographic.png'
MODEL = f'{ROOT}/tools/realesrgan/models/realesrgan-x4plus'

# name: L, R, apex(x,y), left-shoulder y, right-shoulder y, bottom y, node(x,y)
CARDS = {
    'kyrgyzstan': (15, 196, (121, 686), 717, 705, 830, (121, 677)),
    'nukualofa':  (205, 378, (290, 660), 672, 700, 842, (290.5, 649)),
    'wellington': (385, 559, (472, 702), 730, 712, 852, (472.5, 691)),
    'melbourne':  (566, 742, (673, 627), 685, 662, 852, (673, 617)),
    'jakarta':    (750, 920, (839, 709), 721, 726, 862, (839, 702)),
    'bucharest':  (929, 1108, (1009, 707), 730, 719, 856, (1009, 702)),
}

src = cv2.cvtColor(np.array(Image.open(SRC).convert('RGB')), cv2.COLOR_RGB2BGR)

net = ncnn.Net()
net.opt.use_vulkan_compute = False
net.opt.num_threads = 4
net.load_param(MODEL + '.param')
net.load_model(MODEL + '.bin')

def esrgan(bgr):
    pad = 10
    p = cv2.copyMakeBorder(bgr, pad, pad, pad, pad, cv2.BORDER_REFLECT)
    rgb = cv2.cvtColor(p, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]
    m = ncnn.Mat.from_pixels(np.ascontiguousarray(rgb), ncnn.Mat.PixelType.PIXEL_RGB, w, h)
    m.substract_mean_normalize([], [1 / 255.0] * 3)
    ex = net.create_extractor()
    ex.input('data', m)
    _, out = ex.extract('output')
    a = np.array(out).transpose(1, 2, 0)
    a = np.clip(a * 255.0, 0, 255).round().astype(np.uint8)
    a = a[pad * 4: -pad * 4, pad * 4: -pad * 4]
    return cv2.cvtColor(a, cv2.COLOR_RGB2BGR)

for name, (L, R, apex, lsh, rsh, bot, node) in CARDS.items():
    x0, x1 = L + 2, R - 2
    y0, y1 = apex[1] - 2, bot
    crop = src[y0:y1, x0:x1].copy()
    h, w = crop.shape[:2]
    valid = np.zeros((h, w), np.uint8)
    poly = np.array([[0, h], [0, lsh - y0], [apex[0] - x0, apex[1] - y0],
                     [w, rsh - y0], [w, h]], np.int32)
    cv2.fillPoly(valid, [poly], 255)
    valid = cv2.erode(valid, np.ones((7, 7), np.uint8))     # stay clear of rounded/glowing edges
    cv2.circle(valid, (int(node[0] - x0), int(node[1] - y0)), 19, 0, -1)  # node + white ring
    holes = 255 - valid
    filled = cv2.inpaint(crop, holes, 9, cv2.INPAINT_TELEA)
    # soften the inpainted sky a touch so it reads as natural gradient
    blur = cv2.GaussianBlur(filled, (0, 0), 3)
    m3 = cv2.GaussianBlur(holes, (0, 0), 2)[..., None] / 255.0
    filled = (filled * (1 - m3) + blur * m3).astype(np.uint8)
    t = time.time()
    up = esrgan(filled)
    cv2.imwrite(f'{ROOT}/assets/photos/{name}.png', up)
    cv2.imwrite(f'{ROOT}/ref/src_{name}.png', filled)
    print(name, 'src', (w, h), '->', up.shape[1::-1], f'{time.time()-t:.1f}s', flush=True)
