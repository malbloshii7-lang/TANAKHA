#!/usr/bin/env python3
"""Photosensitivity pre-check of a master, modelled on ITU-R BT.1702 (the Harding / Ofcom flash guidelines).

This is an automated screening aid, not a certified test: the treatment still requires a certified Harding FPA test on
the final ceremony master before sign-off. It measures what the guideline limits:

- General flashes. A transition is a change in luminance of 20 cd/m2 or more between a local maximum and minimum, where
  the darker state is below 160 cd/m2. A flash is a pair of opposing transitions. The frame fails when the transitions
  that happen together cover a quarter of the screen or more, more than 3 flashes (6 transitions) in any one second.
- Red flashes. The same, on saturated red (R / (R+G+B) >= 0.8, linear) with the red measure (R - G - B) x 320 changing
  by more than 20, with no darker-state condition.

Luminance model (the guideline's display): 8-bit R'G'B' decoded from the master's BT.709 limited range, linearised with a
2.2 gamma, Y = 0.2126 R + 0.7152 G + 0.0722 B, on a 200 cd/m2 display. The frame is averaged into 320 x 180 cells
(12 x 12 pixels at 4K); a quarter of the screen is 14,400 cells.

    python3 qc/pse.py master.mp4 [--matrix bt709|bt601] [--json out.json]
"""
import argparse
import json
import subprocess
import sys

import numpy as np

W, H = 320, 180
PEAK = 200.0          # cd/m2, the guideline's reference display
STEP = 20.0           # cd/m2, a transition
DARK = 160.0          # cd/m2, the darker state must be below this
AREA = 0.25           # of the screen
RED_RATIO = 0.8


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


def frames(path, matrix):
    vf = (f'scale={W}:{H}:in_color_matrix={matrix}:in_range=tv:out_range=pc:flags=area+accurate_rnd+full_chroma_int,'
          'format=rgb24')
    p = subprocess.Popen([ffmpeg(), '-v', 'error', '-i', path, '-map', '0:v:0', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         stdout=subprocess.PIPE)
    size = W * H * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    p.wait()


class Transitions:
    """Per-cell extremum tracking with 20-unit hysteresis; counts transitions frame by frame."""

    def __init__(self, dark_limit):
        self.dark = dark_limit
        self.hi = self.lo = self.dir = None

    def step(self, v):
        if self.hi is None:
            self.hi = v.copy(); self.lo = v.copy(); self.dir = np.zeros(v.shape, np.int8)
            return np.zeros(v.shape, bool)
        up = (self.dir >= 0)
        down = (self.dir <= 0)
        # track the running extremes in the current direction (both when the direction is unknown)
        self.hi = np.where(up, np.maximum(self.hi, v), self.hi)
        self.lo = np.where(down, np.minimum(self.lo, v), self.lo)
        dark_ok = (lambda lower: lower < self.dark) if self.dark is not None else (lambda lower: np.ones(lower.shape, bool))
        rise = (self.dir <= 0) & (v - self.lo >= STEP) & dark_ok(self.lo)
        fall = (self.dir >= 0) & (self.hi - v >= STEP) & dark_ok(v)
        both = rise & fall  # cannot happen for a real series; keep the larger swing
        fall &= ~both | ((self.hi - v) > (v - self.lo))
        rise &= ~fall
        self.dir = np.where(rise, 1, np.where(fall, -1, self.dir)).astype(np.int8)
        self.hi = np.where(rise | fall, v, self.hi)
        self.lo = np.where(rise | fall, v, self.lo)
        return rise | fall


def analyse(path, fps=50.0, matrix='bt709'):
    lum_t, red_t = Transitions(DARK), Transitions(None)
    lum_area, red_area, mean_lum, red_cells = [], [], [], []
    for rgb in frames(path, matrix):
        lin = (rgb.astype(np.float32) / 255.0) ** 2.2
        Y = PEAK * (0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2])
        s = lin.sum(-1) + 1e-9
        sat_red = (lin[..., 0] / s) >= RED_RATIO
        red = np.where(sat_red, np.maximum(lin[..., 0] - lin[..., 1] - lin[..., 2], 0) * 320.0, 0.0)
        lum_area.append(float(lum_t.step(Y).mean()))
        red_area.append(float(red_t.step(red).mean()))
        mean_lum.append(float(Y.mean()))
        red_cells.append(float(sat_red.mean()))
    n = len(mean_lum)
    lum_area, red_area, mean_lum = np.array(lum_area), np.array(red_area), np.array(mean_lum)

    def events(area):
        # a transition "event" is a run of consecutive frames whose concurrent transitions cover >= a quarter of the screen
        hit = area >= AREA
        starts = [i for i in range(n) if hit[i] and (i == 0 or not hit[i - 1])]
        win = int(round(fps))
        worst, at = 0, None
        for k, s in enumerate(starts):
            c = sum(1 for s2 in starts[k:] if s2 < s + win)
            if c > worst:
                worst, at = c, s / fps
        return starts, worst, at

    ls, lworst, lat = events(lum_area)
    rs, rworst, rat = events(red_area)
    jumps = np.abs(np.diff(mean_lum)) if n > 1 else np.zeros(1)
    return {
        'file': path,
        'frames': n,
        'model': f'{PEAK:.0f} cd/m2 display, gamma 2.2, BT.709 luminance, {W}x{H} cells, matrix {matrix}',
        'general': {
            'transition_events': [round(s / fps, 3) for s in ls],
            'max_transitions_in_1s': lworst,
            'max_flashes_in_1s': lworst / 2,
            'worst_second_starts': lat,
            'max_concurrent_transition_area': round(float(lum_area.max()) if n else 0, 4),
            'pass': lworst <= 6,
        },
        'red': {
            'transition_events': [round(s / fps, 3) for s in rs],
            'max_transitions_in_1s': rworst,
            'max_saturated_red_area': round(max(red_cells) if red_cells else 0, 4),
            'max_concurrent_red_transition_area': round(float(red_area.max()) if n else 0, 4),
            'pass': rworst <= 6,
        },
        'mean_luminance_cd_m2': {'min': round(float(mean_lum.min()), 2), 'max': round(float(mean_lum.max()), 2)},
        # the screen's mean luminance every 0.2 s, for the QC dossier's chart and for planning the wall's brightness
        'mean_luminance_series_5hz': [round(float(x), 2) for x in mean_lum[::max(1, int(round(fps / 5)))]],
        'largest_frame_to_frame_mean_change': {'cd_m2': round(float(jumps.max()), 3), 'at_s': round(float(jumps.argmax() + 1) / fps, 3)},
    }


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('file')
    ap.add_argument('--fps', type=float, default=50.0)
    ap.add_argument('--matrix', default='bt709')
    ap.add_argument('--json')
    a = ap.parse_args()
    r = analyse(a.file, a.fps, a.matrix)
    s = json.dumps(r, indent=1)
    if a.json:
        open(a.json, 'w').write(s)
    print(s if len(s) < 4000 else s[:4000])
    sys.exit(0 if r['general']['pass'] and r['red']['pass'] else 1)
