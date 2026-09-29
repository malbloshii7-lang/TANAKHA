#!/usr/bin/env python3
"""SMPTE 12M linear timecode (LTC) as a WAV, to lay beside a master for show control, and a reader that checks it.

25 fps (EBU), as the cue sheet: 80 bits a frame, biphase-mark coded, so 2,000 bits a second. At 48 kHz a bit is 24
samples. Each transition rises over 2 samples (about 42 us, inside the 25 +/- 5 us-per-10-90% spirit for a 48 kHz
file). Bit layout for 25 fps: frame units 0-3, frame tens 8-9, seconds 16-19 and 24-26, minutes 32-35 and 40-42, hours
48-51 and 56-57, BGF0 at 27, BGF2 at 43, BGF1 at 58, the biphase polarity-correction bit at 59, and the sync word
0011 1111 1111 1101 in bits 64-79. User bits are zero. Level -10 dBFS.

    python3 qc/ltc.py write out.wav --frames 3542 [--start 00:00:00:00]      (--frames: 25 fps frames to cover)
    python3 qc/ltc.py read out.wav                                            decodes every frame and checks continuity
"""
import argparse
import struct
import sys
import wave

import numpy as np

FPS, RATE, BITS = 25, 48000, 80
SPB = RATE // (FPS * BITS)          # 24 samples a bit
LEVEL = 10 ** (-10 / 20)
SYNC = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1]


def tc_parse(s):
    h, m, sec, f = (int(x) for x in s.split(':'))
    return ((h * 60 + m) * 60 + sec) * FPS + f


def tc_str(n):
    f = n % FPS; s = n // FPS
    return f'{s // 3600:02d}:{s // 60 % 60:02d}:{s % 60:02d}:{f:02d}'


def frame_bits(n):
    f = n % FPS; s = n // FPS
    h, m, sec = s // 3600 % 24, s // 60 % 60, s % 60
    b = [0] * BITS

    def put(value, start, width):
        for k in range(width):
            b[start + k] = (value >> k) & 1
    put(f % 10, 0, 4); put(f // 10, 8, 2)
    put(sec % 10, 16, 4); put(sec // 10, 24, 3)
    put(m % 10, 32, 4); put(m // 10, 40, 3)
    put(h % 10, 48, 4); put(h // 10, 56, 2)
    b[64:80] = SYNC
    # polarity correction (25 fps: bit 59): make the count of zeros in the frame even, so every frame starts on the
    # same edge polarity
    if (BITS - sum(b)) % 2:
        b[59] = 1
    return b


def write(path, frames, start=0):
    half = SPB // 2
    out = np.empty(frames * BITS * SPB, np.float32)
    level = -1.0
    i = 0
    for n in range(start, start + frames):
        for bit in frame_bits(n):
            level = -level                      # every bit starts with a transition
            out[i:i + half] = level
            if bit:
                level = -level                  # a one has a second transition mid-bit
            out[i + half:i + SPB] = level
            i += SPB
    # soften each edge over 2 samples (a 3-tap average), keeping the level flat between edges
    k = np.array([0.25, 0.5, 0.25], np.float32)
    out = np.convolve(out, k, mode='same') * LEVEL
    pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(pcm.tobytes())
    return len(pcm) / RATE


def read(path):
    with wave.open(path, 'rb') as w:
        assert w.getframerate() == RATE and w.getsampwidth() == 2
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32)
    sign = np.sign(x); sign[sign == 0] = 1
    edges = np.flatnonzero(np.diff(sign) != 0) + 1
    gaps = np.diff(edges)
    bits, j = [], 0
    while j < len(gaps):
        if gaps[j] > 0.75 * SPB:                # a long cell: 0
            bits.append(0); j += 1
        else:                                   # two short cells: 1
            bits.append(1); j += 2
    decoded = []
    k = 0
    while k + BITS <= len(bits):
        if bits[k + 64:k + 80] != SYNC:
            k += 1; continue
        b = bits[k:k + BITS]
        val = lambda s, w: sum(b[s + i] << i for i in range(w))
        f = val(0, 4) + 10 * val(8, 2)
        sec = val(16, 4) + 10 * val(24, 3)
        m = val(32, 4) + 10 * val(40, 3)
        h = val(48, 4) + 10 * val(56, 2)
        decoded.append(((h * 60 + m) * 60 + sec) * FPS + f)
        k += BITS
    return decoded


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    w = sub.add_parser('write'); w.add_argument('out'); w.add_argument('--frames', type=int, required=True); w.add_argument('--start', default='00:00:00:00')
    r = sub.add_parser('read'); r.add_argument('file')
    a = ap.parse_args()
    if a.cmd == 'write':
        dur = write(a.out, a.frames, tc_parse(a.start))
        print(f'wrote {a.out}: {a.frames} frames from {a.start} ({dur:.3f} s)')
    else:
        d = read(a.file)
        # the first frame can be lost to the edge detector's start; everything after it must be continuous
        breaks = [i for i in range(1, len(d)) if d[i] != d[i - 1] + 1]
        print(f'read {len(d)} frames: {tc_str(d[0])} to {tc_str(d[-1])}, {len(breaks)} discontinuities')
        sys.exit(1 if breaks else 0)
