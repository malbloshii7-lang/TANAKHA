#!/usr/bin/env python3
"""Score for "Reading the Sky": an original, synthesized, up-tempo soundtrack.

120 BPM, so one bar is 2 s and every chapter cut in film.html lands on a downbeat.

  0:00  Prologue   heartbeat, a riser, the first Hijaz phrase on a plucked string
  0:06  Heritage   a Khaleeji-inspired groove: hand claps, tabl-style dum and tak,
                   jingles, under an oud-like Karplus-Strong line in the Hijaz mode
  0:38  The Center the groove turns modern: a ticking clock, a pulsing bass
  0:46  Economy    the drive: four-on-the-floor, 16th-note arpeggios, taiko on each
                   chapter, risers into every cut; a jet departs, alerts ping
  1:18  Rain       a breakdown: rain, the seeding aircraft crossing left to right
  1:26  Science    the rebuild
  1:34  The world  the peak, with a lead line and brass
  1:42  Finale     the harmony turns to D major, the gauge reaches 2027 on a last
                   hit at 1:50, and the chord rings out

No samples: numpy and scipy only, so it is royalty-free. Cue times mirror film.html.

    pip install numpy scipy
    python3 score.py score.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
BAR = 2.0                     # 120 BPM, 4/4
S16 = BAR / 16
DUR = 114.0
N = int(DUR * SR)
rng = np.random.default_rng(2027)


def T(bar, step=0.0):
    return bar * BAR + step * S16


def hz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def noise(n):
    return rng.standard_normal(n)


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, t, gain=1.0, pan=0.0):
        i0 = int(round(t * SR))
        if i0 >= N:
            return
        if i0 < 0:
            sig, i0 = sig[-i0:], 0
        n = min(len(sig), N - i0)
        self.L[i0:i0 + n] += sig[:n] * gain * np.sqrt(0.5 * (1 - pan))
        self.R[i0:i0 + n] += sig[:n] * gain * np.sqrt(0.5 * (1 + pan))

    def add2(self, sl, sr_, t, gain=1.0):
        i0 = int(round(t * SR))
        n = min(len(sl), N - i0)
        self.L[i0:i0 + n] += sl[:n] * gain
        self.R[i0:i0 + n] += sr_[:n] * gain


drums, sc, music, fx = Bus(), Bus(), Bus(), Bus()   # sc = side-chained to the kick
kick_times = []


# ------------------------------------------------------------------ drums
def kick():
    t = tt(0.45)
    f = 47 + 95 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    click = sosfilt(sos("high", 3000), noise(len(t))) * np.exp(-t / 0.004) * 0.25
    return body + click


def dum():
    t = tt(0.5)
    f = 92 + 45 * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) + 0.35 * sosfilt(sos("low", 320), noise(len(t))) * np.exp(-t / 0.03)


def tak():
    t = tt(0.18)
    return sosfilt(sos("band", [1400, 5200]), noise(len(t))) * np.exp(-t / 0.03) + 0.45 * np.sin(2 * np.pi * 540 * t) * np.exp(-t / 0.045)


def clap():
    t = tt(0.4)
    x = sosfilt(sos("band", [850, 2800]), noise(len(t)))
    e = np.zeros(len(t))
    for d in (0.0, 0.011, 0.023):
        i = int(d * SR)
        e[i:] += np.exp(-(t[i:] - d) / 0.008)
    e += 0.35 * np.exp(-t / 0.11)
    return x * e


def hat(open_=False):
    t = tt(0.3 if open_ else 0.08)
    return sosfilt(sos("high", 7200), noise(len(t))) * np.exp(-t / (0.12 if open_ else 0.028))


def jingle():
    t = tt(0.12)
    return sosfilt(sos("band", [5000, 11000]), noise(len(t))) * np.exp(-t / 0.045)


def snare():
    t = tt(0.3)
    return sosfilt(sos("band", [1500, 7500]), noise(len(t))) * np.exp(-t / 0.1) + 0.5 * np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.07)


def taiko():
    t = tt(1.4)
    f = 60 + 55 * np.exp(-t / 0.05)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45) + 0.6 * sosfilt(sos("low", 420), noise(len(t))) * np.exp(-t / 0.07)


def impact():
    t = tt(3.0)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 1.0)
    crash = sosfilt(sos("band", [3000, 12000]), noise(len(t))) * np.exp(-t / 0.9) * 0.35
    thud = sosfilt(sos("low", 1200), noise(len(t))) * np.exp(-t / 0.25) * 0.5
    return boom + crash + thud


def riser(dur):
    t = tt(dur)
    w = t / dur
    x = noise(len(t))
    y = (1 - w) * sosfilt(sos("band", [300, 1500]), x) + w * sosfilt(sos("band", [2500, 9000]), x)
    tone = 0.15 * np.sin(2 * np.pi * np.cumsum(220 + 900 * w ** 2) / SR)
    return (y + tone) * w ** 2.2


def roll(bar, gain=0.3):
    """A snare roll accelerating through a bar, into the next cut."""
    steps = [0, 4, 8, 10, 12, 13, 14, 15]
    for i, s in enumerate(steps):
        drums.add(snare(), T(bar, s), gain * (0.35 + 0.65 * i / len(steps)), pan=0.1)
    for s in (14.5, 15.0, 15.5):
        drums.add(snare(), T(bar, s), gain)


# ------------------------------------------------------------------ pitched
def pluck(m, dur=1.3, bright=0.55):
    """Karplus-Strong string with a body resonance: an oud-like pluck."""
    f = hz(m)
    L = max(2, int(round(SR / f)))
    n = int(dur * SR)
    exc = np.zeros(n)
    burst = noise(L)
    burst = bright * burst + (1 - bright) * sosfilt(sos("low", 2500), burst)
    exc[:L] = burst
    a = np.zeros(L + 2)
    a[0], a[L], a[L + 1] = 1.0, -0.4988, -0.4988
    y = lfilter([1.0], a, exc)
    y = y + 0.35 * sosfilt(sos("band", [170, 950]), y)
    y *= np.minimum(1, (n - np.arange(n)) / (0.03 * SR))
    return y / (np.max(np.abs(y)) + 1e-9)


def saw(freq, n, harmonics=12, detune=0.0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    f = freq * (1 + detune)
    for k in range(1, harmonics + 1):
        if k * f > 16000:
            break
        out += np.sin(2 * np.pi * k * f * t + k * 0.7) / k
    return out


def env(n, a, d_tau, sustain=0.0, release=0.02):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (sustain + (1 - sustain) * np.exp(-np.maximum(0, t - a) / d_tau))
    r = int(release * SR)
    if r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def arp_note(m, dur=0.13):
    n = int(dur * SR)
    return sosfilt(sos("low", 5200), saw(hz(m), n, 10) * env(n, 0.003, 0.07))


def bass_note(m, dur):
    n = int(dur * SR)
    x = saw(hz(m), n, 10) * 0.6 + np.sin(2 * np.pi * hz(m) * np.arange(n) / SR)
    return sosfilt(sos("low", 950), x) * env(n, 0.005, 0.18, 0.55, 0.03)


def pad(notes, t0, dur, gain=0.1, bright=2400):
    n = int((dur + 0.8) * SR)
    e = env(n, 0.35, 10.0, 1.0, 0.8)
    for k, m in enumerate(notes):
        v = sum(saw(hz(m), n, 10, d) for d in (-0.004, 0.0, 0.004)) / 3
        sc.add(sosfilt(sos("band", [160, bright]), v) * e, t0, gain, pan=-0.5 + k / max(1, len(notes) - 1))


def brass(notes, t0, dur, gain=0.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = env(n, 0.06, 0.5, 0.6, 0.12)
    for k, m in enumerate(notes):
        v = saw(hz(m), n, 16, 0.002) + saw(hz(m), n, 16, -0.002)
        swell = np.minimum(1, t / 0.25)
        v = (1 - swell) * sosfilt(sos("low", 900), v) + swell * sosfilt(sos("low", 3200), v)
        sc.add(v * e, t0, gain, pan=-0.4 + 0.8 * k / max(1, len(notes) - 1))


def lead_note(m, t0, dur, gain=0.16):
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.25)
    ph = 2 * np.pi * np.cumsum(hz(m) * vib) / SR
    v = sum(np.sin(k * ph) / k for k in range(1, 12)) + 0.5 * np.sin(ph / 2)
    music.add(sosfilt(sos("low", 4200), v) * env(n, 0.02, 0.9, 0.7, 0.08), t0, gain)


def bell(m, dur=3.2):
    f, t = hz(m), tt(dur)
    s = np.sin(2 * np.pi * f * t + 2.0 * np.exp(-t * 3.0) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 1.4)
    return s * np.minimum(1, t / 0.004)


# ------------------------------------------------------------------ harmony
CH = {  # pad voicing, bass root
    "D": ([57, 62, 66, 69], 38), "Eb": ([55, 58, 63, 67], 39), "Gm": ([55, 58, 62, 67], 43),
    "Dm": ([57, 62, 65, 69], 38), "Bb": ([58, 62, 65, 70], 34), "F": ([57, 60, 65, 69], 41),
    "C": ([55, 60, 64, 67], 36), "A": ([57, 61, 64, 69], 33), "A/C#": ([57, 61, 64, 69], 37),
    "Bm": ([54, 59, 62, 66], 35), "G": ([55, 59, 62, 67], 31),
}
PLAN = {}
for b, c in zip(range(0, 3), ["D", "D", "D"]):
    PLAN[b] = c
for i, b in enumerate(range(3, 19)):
    PLAN[b] = ["D", "D", "Eb", "D", "Gm", "Gm", "Eb", "D"][i % 8]
for i, b in enumerate(range(19, 23)):
    PLAN[b] = ["Dm", "Dm", "Bb", "C"][i]
for i, b in enumerate(range(23, 39)):
    PLAN[b] = ["Dm", "Bb", "F", "C"][i % 4]
for i, b in enumerate(range(39, 43)):
    PLAN[b] = ["Bb", "F", "Gm", "A"][i]
for i, b in enumerate(range(43, 47)):
    PLAN[b] = ["Dm", "Bb", "F", "C"][i]
for i, b in enumerate(range(47, 51)):
    PLAN[b] = ["Bb", "C", "Dm", "A"][i]
for i, b in enumerate(range(51, 57)):
    PLAN[b] = ["D", "A/C#", "Bm", "G", "D", "D"][i]

# pads (one chord per bar; the final D rings to the end)
for b in range(0, 55):
    notes, _ = CH[PLAN[b]]
    level = 0.05 if b < 3 else 0.075 if b < 19 else 0.09
    pad(notes, T(b), BAR, level, 1800 if b < 19 else 2600)
pad(CH["D"][0] + [74, 78], T(55), 4.0, 0.085, 3200)

# ------------------------------------------------------------------ plucked Hijaz line
HIJAZ = {
    "D":  [62, None, 74, 69, 66, 67, 69, None, 70, 69, 67, 66, 63, None, 62, None],
    "Eb": [63, None, 75, 70, 67, 70, 72, None, 70, 67, 66, 63, 62, None, 63, None],
    "Gm": [67, None, 74, 70, 67, 66, 67, None, 70, 69, 67, 66, 63, None, 62, None],
    "Dm": [62, None, 74, 69, 65, 67, 69, None, 70, 69, 67, 65, 64, None, 62, None],
}
MOTIF = [62, 63, 66, 67, 69, 67, 66, 63]               # D Eb F# G A G F# Eb
AEOLIAN = [62, 64, 65, 67, 69, 67, 65, 64]

pl = [(1, [(0, 62), (2, 63), (4, 66), (6, 67), (8, 69), (12, 66), (14, 63)]),
      (2, [(0, 62), (8, 74)])]
for b, notes in pl:                                     # prologue teaser
    for s, m in notes:
        music.add(pluck(m, 1.6), T(b, s), 0.2, pan=-0.15)
for b in range(3, 23):                                  # heritage and the Center
    patt = HIJAZ.get(PLAN[b], HIJAZ["Dm"])
    for s, m in enumerate(patt):
        if m is None or (b < 7 and s % 2):              # chapter I: eighths only, then 16ths
            continue
        acc = 1.0 if s % 4 == 0 else 0.75
        music.add(pluck(m, 1.1), T(b, s) + (0.012 if s % 2 else 0), 0.17 * acc, pan=-0.2 + 0.4 * (s % 3) / 2)
for b in range(23, 39, 2):                              # call and response in the drive
    for i, m in enumerate(AEOLIAN):
        music.add(pluck(m + 12, 0.9), T(b, 8 + i), 0.21, pan=0.3)
for b in range(39, 43):                                 # rain: the motif, slow and bare
    for i, m in enumerate(AEOLIAN[:6] if b % 2 else AEOLIAN[::-1][:6]):
        music.add(pluck(m, 1.6, 0.4), T(b, i * 2), 0.18, pan=-0.1)

# ------------------------------------------------------------------ arps, bass
def arp_bar(b, gain=0.075):
    notes = CH[PLAN[b]][0]
    seq = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[3] + 12, notes[2] + 12, notes[1] + 12, notes[3], notes[2]]
    for s in range(16):
        sc.add(arp_note(seq[s % 8]), T(b, s), gain * (1.0 if s % 4 == 0 else 0.7), pan=0.35 * np.sin(s))


for b in list(range(23, 39)) + list(range(43, 51)) + list(range(51, 55)):
    arp_bar(b, 0.16 if b < 47 else 0.15)
for b in range(19, 55):                                 # bass from the Center on
    root = CH[PLAN[b]][1]
    if 39 <= b <= 42:
        sc.add(bass_note(root, BAR * 0.95), T(b), 0.2)
        continue
    for s in range(0, 16, 2):
        m = root + (12 if (b >= 23 and s % 4 == 2) else 0)
        sc.add(bass_note(m, S16 * 1.8), T(b, s), 0.2 if b >= 23 else 0.16)
sc.add(bass_note(38, 4.0), T(55), 0.34)

# ------------------------------------------------------------------ lead and brass
LEAD = {
    47: [77, 74, 70, 74, 77, None, 79, 77], 48: [76, 72, 67, 72, 76, None, 77, 79],
    49: [81, None, 77, 74, 81, None, 79, 77], 50: [76, 73, 69, 73, 76, 78, 79, 81],
    51: [74, 75, 78, 79, 81, None, 79, 78], 52: [73, 76, 78, 76, 73, None, 71, 69],
    53: [71, 74, 78, 74, 71, None, 69, 71], 54: [74, 71, 67, 71, 74, 79, 78, 76],
}
for b, line in LEAD.items():
    for i, m in enumerate(line):
        if m is not None:
            nxt = next((j for j in range(i + 1, 8) if line[j] is not None), 8)
            lead_note(m, T(b, i * 2), (nxt - i) * S16 * 2 * 0.95, 0.15)
lead_note(74, T(55), 3.6, 0.16)
for b in list(range(47, 51)) + list(range(51, 56)):
    brass([n + 12 for n in CH[PLAN[b]][0][:3]], T(b), BAR * 0.9, 0.07)

# ------------------------------------------------------------------ drums
def hit(bus, fn, t, gain, pan=0.0, is_kick=False):
    bus.add(fn(), t, gain, pan)
    if is_kick:
        kick_times.append(t)


# prologue: a heartbeat and a riser into the first chapter
for b in (1, 2):
    hit(drums, dum, T(b, 0), 0.5)
    hit(drums, dum, T(b, 3), 0.35)
fx.add(riser(3.0), 3.0, 0.22)

for b in range(3, 23):                                  # heritage groove
    for s in (0, 6):
        hit(drums, dum, T(b, s), 0.55)
    hit(drums, dum, T(b, 8), 0.3)
    for s in (4, 10, 12):
        hit(drums, tak, T(b, s), 0.4, pan=0.15)
    for s in (2, 14):
        hit(drums, tak, T(b, s), 0.11, pan=0.25)
    if b >= 7:                                          # hand claps from chapter II
        for s in (4, 12):
            hit(drums, clap, T(b, s) + 0.006, 0.42, pan=-0.2)
    if b >= 11:                                         # jingles from chapter III
        for s in range(16):
            hit(drums, jingle, T(b, s) + (0.012 if s % 2 else 0), 0.11 if s % 2 else 0.17, pan=0.4)
    if b >= 19:                                         # the Center: a kick and a ticking clock
        for s in (0, 8):
            hit(drums, kick, T(b, s), 0.5, is_kick=True)
        for s in range(16):
            hit(drums, hat, T(b, s), 0.08 if s % 2 else 0.12, pan=0.3)
    if b in (6, 10, 14, 18):                            # a tak fill into each chapter
        for s in (12, 13, 14, 15):
            hit(drums, tak, T(b, s), 0.22 + 0.04 * (s - 12), pan=0.1)

DRIVE = list(range(23, 39)) + list(range(43, 55))
for b in DRIVE:
    for s in (0, 4, 8, 12):
        hit(drums, kick, T(b, s), 0.6, is_kick=True)
    for s in (4, 12):
        hit(drums, clap, T(b, s), 0.48, pan=-0.15)
    for s in (2, 6, 10, 14):
        hit(drums, lambda: hat(True), T(b, s), 0.17, pan=0.25)
    for s in range(16):
        hit(drums, hat, T(b, s), 0.07 if s % 2 else 0.1, pan=-0.25)
    if b >= 47:                                         # the peak and finale: taiko on 1 and 3
        for s in (0, 8):
            hit(drums, taiko, T(b, s), 0.45)
for b in (23, 27, 31, 35, 43):                          # taiko on each chapter
    hit(drums, taiko, T(b), 0.7)
for b in (26, 30, 34):                                  # dum-tak fills end each economy chapter
    for s, f in ((12, dum), (13, tak), (14, dum), (15, tak)):
        hit(drums, f, T(b, s), 0.35)
for b in (39, 40, 41):                                  # rain: just a pulse
    hit(drums, kick, T(b), 0.55, is_kick=True)

# risers and rolls into the big cuts; impacts on them
for b in (22, 26, 30, 34, 38, 42, 46, 50):
    fx.add(riser(BAR), T(b), 0.2)
for b in (42, 50):
    roll(b, 0.26)
for b in (3, 23, 39, 43, 47, 51):
    drums.add(impact(), T(b), 0.7)
for b in (7, 11, 15, 19, 27, 31, 35):
    drums.add(impact(), T(b), 0.35)

# the finale: the gauge reaches 2027 on the last hit
drums.add(impact(), T(55), 0.95)
hit(drums, taiko, T(55), 0.8)
for j, m in enumerate([74, 78, 81, 86, 90]):
    music.add(bell(m, 4.0), T(55) + 0.1 + j * 0.13, 0.1, pan=-0.4 + 0.2 * j)
for b, notes in ((3, [81, 86]), (23, [77, 81]), (43, [81, 84]), (51, [78, 81, 86])):
    for j, m in enumerate(notes):
        music.add(bell(m), T(b) + 0.05 + j * 0.12, 0.07, pan=-0.3 + 0.3 * j)

# ------------------------------------------------------------------ on screen
# V · a radar ping on each sweep past north (sped-up scene: one turn every 3.66 s)
for t0 in (39.16, 42.82):
    t = tt(1.2)
    fx.add((np.sin(2 * np.pi * 1318.5 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 5), t0, 0.05, 0.2)
# VI · the departure: a jet rises and passes
t = tt(5.0)
w = t / 5.0
jet = (1 - w) * sosfilt(sos("band", [300, 1800]), noise(len(t))) + w * sosfilt(sos("band", [900, 4200]), noise(len(t)))
fx.add(jet * np.sin(np.pi * w) ** 1.5, 49.2, 0.07)
# IX · a soft alert tone as each warning ring leaves the storm forecast
for k in range(6):
    t = tt(0.25)
    fx.add(np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 14) * np.minimum(1, t / 0.004), 72.2 + 0.5 * k, 0.05, 0.1)
# X · the seeding aircraft crossing left to right, flares, then rain
t = tt(4.8)
eng = (np.sin(2 * np.pi * 96 * t) + 0.5 * np.sin(2 * np.pi * 192 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 23 * t)) * 0.5
eng = (eng + 0.8 * sosfilt(sos("low", 700), noise(len(t)))) * np.sin(np.pi * t / 4.8)
pan = np.linspace(-0.85, 0.85, len(t))
fx.add2(eng * np.sqrt(0.5 * (1 - pan)), eng * np.sqrt(0.5 * (1 + pan)), 79.0, 0.06)
for dur, t0, g in ((4.8, 81.6, 0.1), (9.6, 102.6, 0.06)):
    n = int(dur * SR)
    e = np.minimum(1, np.arange(n) / (1.2 * SR)) * np.minimum(1, (n - np.arange(n)) / (1.5 * SR))
    rl = sosfilt(sos("high", 450), sosfilt(sos("low", 6500), noise(n))) * e
    rr = sosfilt(sos("high", 450), sosfilt(sos("low", 6500), noise(n))) * e
    fx.add2(rl, rr, t0, g)

# ------------------------------------------------------------------ mix
duck = np.zeros(N)
shape = np.exp(-np.arange(int(0.25 * SR)) / SR / 0.09)
for tk in kick_times:
    i0 = int(tk * SR)
    n = min(len(shape), N - i0)
    duck[i0:i0 + n] = np.maximum(duck[i0:i0 + n], shape[:n])
gate = 1 - 0.55 * duck


def comb(x, ms, g):
    d = int(SR * ms / 1000)
    a = np.zeros(d + 1)
    a[0], a[d] = 1.0, -g
    return lfilter([1.0], a, x)


def allpass(x, ms, g):
    d = int(SR * ms / 1000)
    b, a = np.zeros(d + 1), np.zeros(d + 1)
    b[0], b[d], a[0], a[d] = -g, 1.0, 1.0, -g
    return lfilter(b, a, x)


def reverb(x, spread):
    wet = sum(comb(x, ms * spread, g) for ms, g in ((29.7, 0.82), (37.1, 0.8), (41.1, 0.78), (43.7, 0.76))) / 4
    return sosfilt(sos("low", 6000), allpass(allpass(wet, 5.0, 0.7), 1.7, 0.7))


out = []
for ch, spread in (("L", 1.0), ("R", 1.07)):
    d, s, m, f = (getattr(b, ch) for b in (drums, sc, music, fx))
    s = s * gate
    send = 0.12 * d + 0.3 * s + 0.4 * m + 0.35 * f
    out.append(d + s + m + f + 0.45 * reverb(send, spread))
stereo = np.stack(out, axis=1)
stereo = sosfilt(sos("high", 28), stereo, axis=0)
stereo = stereo + 0.4 * sosfilt(sos("high", 2500), stereo, axis=0)      # presence, for small speakers
stereo /= np.max(np.abs(stereo)) + 1e-9
stereo = np.tanh(2.2 * stereo) / np.tanh(2.2)                    # glue and limit
n = int(2.5 * SR)
stereo[-n:] *= np.linspace(1, 0, n)[:, None] ** 1.3              # into black
stereo[: int(0.08 * SR)] *= np.linspace(0, 1, int(0.08 * SR))[:, None]
stereo *= 0.89 / (np.max(np.abs(stereo)) + 1e-9)                 # about -1 dBFS peak

path = sys.argv[1] if len(sys.argv) > 1 else "score.wav"
with wave.open(path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(stereo ** 2)) + 1e-12)
print(f"wrote {path}: {DUR:.0f} s at 120 BPM, peak -1.0 dBFS, RMS {rms:.1f} dBFS")
