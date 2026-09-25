#!/usr/bin/env python3
"""Score for "Reading the Sky": an original, fully synthesized soundtrack (no samples).

It follows sovereign-tools/ambient_generator.py in the warm-organic-calm repo (warm
detuned pads, a soft low end, air from a small reverb) and is cut to the picture:
a new chord at every chapter, a felt drum and a bell as each chapter opens, soft
taps as the headline words land, and sound for what is on screen (Suhail's shimmer,
wind and sea, water in the falaj, radar pings, the seeding aircraft crossing left
to right, rain, the globe's arcs, and the gauge reaching 2027).

Cue times mirror film.html; if you retime a scene there, retime it here.

    pip install numpy scipy
    python3 score.py score.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 44100
DUR = 106.0
N = int(DUR * SR)
rng = np.random.default_rng(2007)

# Chapter starts (seconds) and headline word counts, as in film.html.
CHAPTERS = [5, 16, 27, 38, 49, 60, 71, 82, 93]
WORDS = [7, 5, 6, 6, 9, 6, 6, 7, 6]
WORD_T0, WORD_STEP = 0.55, 0.2

L = np.zeros(N)
R = np.zeros(N)


def hz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def add(sig, start, gain=1.0, pan=0.0):
    """Mix a mono signal in at `start` seconds with an equal-power pan (-1..1)."""
    i0 = int(round(start * SR))
    if i0 < 0:
        sig, i0 = sig[-i0:], 0
    n = min(len(sig), N - i0)
    if n <= 0:
        return
    L[i0:i0 + n] += sig[:n] * gain * np.sqrt(0.5 * (1 - pan))
    R[i0:i0 + n] += sig[:n] * gain * np.sqrt(0.5 * (1 + pan))


def add2(sl, sr_, start, gain=1.0):
    i0 = int(round(start * SR))
    n = min(len(sl), N - i0)
    L[i0:i0 + n] += sl[:n] * gain
    R[i0:i0 + n] += sr_[:n] * gain


def sos(kind, f):
    return butter(2, f, kind, fs=SR, output="sos")


def fade(n, a, r, curve=1.6):
    e = np.ones(n)
    ai, ri = min(int(a * SR), n), min(int(r * SR), n)
    if ai:
        e[:ai] = np.linspace(0, 1, ai) ** curve
    if ri:
        e[n - ri:] *= np.linspace(1, 0, ri) ** curve
    return e


def noise(n):
    return rng.standard_normal(n)


# ---------------------------------------------------------------- instruments
def pad_voice(freq, dur, detune=0.0035, bright=0.16):
    """Three detuned sines with a breathing vibrato and a little warmth on top."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    vib = 1 + 0.002 * np.sin(2 * np.pi * 0.17 * tt + rng.random() * 6)
    out = np.zeros(n)
    for d in (-detune, 0.0, detune):
        out += np.sin(2 * np.pi * np.cumsum(freq * (1 + d) * vib) / SR + rng.random() * 6)
    out /= 3
    out += bright * np.sin(2 * np.pi * 2 * freq * tt) + 0.05 * np.sin(2 * np.pi * 3 * freq * tt)
    return out


def chord(notes, start, end, attack=2.4, release=3.2, gain=1.0):
    dur = end - start + release
    n = int(dur * SR)
    env = fade(n, attack, release)
    for k, m in enumerate(notes):
        low = m < 45
        v = pad_voice(hz(m), dur, bright=0.0 if low else 0.16) * env
        v = sosfilt(sos("low", 2600), v)
        pan = 0.0 if low else -0.55 + 1.1 * (k / max(1, len(notes) - 1))
        add(v, start, gain * (0.34 if low else 0.13), pan)


def bell(m, dur=3.6, index=2.0, ratio=3.5):
    """FM bell: bright strike, long soft tail."""
    f, n = hz(m), int(dur * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt + index * np.exp(-tt * 3.0) * np.sin(2 * np.pi * f * ratio * tt)) * np.exp(-tt * 1.3)
    s += 0.2 * np.sin(2 * np.pi * f * 2.005 * tt) * np.exp(-tt * 3.2)
    return s * np.minimum(1, tt / 0.004)


def boom(dur=2.4):
    """A felt drum: a pitch-falling sine with a muffled thump."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 41 + 32 * np.exp(-tt * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.0)
    s += 0.5 * sosfilt(sos("low", 170), noise(n)) * np.exp(-tt * 10)
    return s * np.minimum(1, tt / 0.005)


def tap():
    """A pen-on-paper tap for each headline word."""
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    click = sosfilt(sos("band", [900, 3400]), noise(n)) * np.exp(-tt * 130)
    return click + 0.45 * np.sin(2 * np.pi * 760 * tt) * np.exp(-tt * 60)


def ping(m=88, dur=1.4):
    tt = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * hz(m) * tt) + 0.25 * np.sin(2 * np.pi * hz(m + 12) * tt)) * np.exp(-tt * 4.5) * np.minimum(1, tt / 0.003)


def rain_bed(dur, a, r, density=1.0):
    n = int(dur * SR)
    out = []
    for _ in range(2):  # decorrelated left and right
        x = sosfilt(sos("high", 450), sosfilt(sos("low", 6500), noise(n))) * 0.5
        drops = np.zeros(n)
        k = int(dur * 55 * density)
        idx = rng.integers(0, n - 800, k)
        tick = np.exp(-np.arange(600) / SR * 900) * np.sin(2 * np.pi * 2600 * np.arange(600) / SR)
        for i in idx:
            drops[i:i + 600] += tick * rng.uniform(0.2, 1.0)
        out.append((x + 0.35 * drops) * fade(n, a, r, 1.2))
    return out


# ---------------------------------------------------------------- harmony
# One chord per chapter, crossfading at the cuts (D minor, resolving to F major).
PROGRESSION = [
    (0.0, 5.0, [38, 50, 57, 64, 65]),        # prologue  Dm(add9)
    (5.0, 16.0, [38, 50, 57, 60, 64, 65]),   # I         Dm9
    (16.0, 27.0, [34, 46, 53, 57, 62, 65]),  # II        Bbmaj7
    (27.0, 38.0, [43, 50, 57, 58, 62]),      # III       Gm9
    (38.0, 49.0, [33, 45, 52, 57, 60, 64]),  # IV        Fmaj7/A
    (49.0, 60.0, [38, 50, 55, 57, 60, 65]),  # V         Dm11
    (60.0, 71.0, [34, 46, 53, 57, 60, 64]),  # VI        Bbmaj9(#11)
    (71.0, 82.0, [36, 48, 55, 57, 62, 64]),  # VII       C6/9
    (82.0, 93.0, [29, 41, 48, 57, 60, 64, 67]),  # VIII  Fmaj9
    (93.0, 100.8, [34, 46, 53, 57, 60, 65]),     # IX    Bbmaj9
    (100.8, 106.0, [29, 41, 53, 57, 60, 67, 69]),  # the gauge reaches 2027: F(add9)
]
for i, (a, b, notes) in enumerate(PROGRESSION):
    chord(notes, a - (0.0 if i == 0 else 1.2), b, attack=3.0 if i == 0 else 2.2, gain=1.1 if i == len(PROGRESSION) - 1 else 1.0)

# Bells as each chapter opens, drawn from that chapter's chord.
BELLS = [[81, 88], [77, 86], [86, 79], [84, 88], [79, 86], [77, 84], [88, 81], [79, 84, 88], [86, 89]]
for start, notes in zip(CHAPTERS, BELLS):
    add(boom(), start + 0.02, 0.55)
    for j, m in enumerate(notes):
        add(bell(m), start + 0.12 + j * 0.19, 0.16, pan=-0.25 + 0.5 * (j % 2))

# Prologue: the star appears; the title words land.
add(bell(86, 4.5), 0.8, 0.14)
for k in range(3):
    add(tap(), 1.5 + k * 0.22 + 0.25, 0.10, pan=-0.2 + 0.2 * k)

# Headline words landing (each word reaches full strength ~0.3 s into its reveal).
for start, count in zip(CHAPTERS, WORDS):
    for k in range(count):
        add(tap(), start + WORD_T0 + k * WORD_STEP + 0.28, 0.08, pan=-0.3 + 0.6 * (k / max(1, count - 1)))

# ---------------------------------------------------------------- on screen
# I · Suhail rises: a faint high shimmer.
n = int(4.6 * SR)
tt = np.arange(n) / SR
shimmer = (np.sin(2 * np.pi * hz(93) * tt) + 0.6 * np.sin(2 * np.pi * hz(100) * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 5.5 * tt))
add(shimmer * fade(n, 1.6, 1.8), 8.6, 0.012)

# II–III · wind and sea.
n = int(22.6 * SR)
tt = np.arange(n) / SR
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * tt) * np.sin(2 * np.pi * 0.043 * tt + 1)
wl, wr = (sosfilt(sos("band", [260, 1100]), noise(n)) for _ in range(2))
add2(wl * gust * fade(n, 2.5, 2.5), wr * gust * fade(n, 2.5, 2.5), 16.2, 0.05)
swell = 0.35 + 0.65 * np.sin(np.pi * tt / 4.3) ** 2
sea = sosfilt(sos("low", 420), noise(n)) * swell * fade(n, 2.5, 2.5)
add(sea, 16.4, 0.09, pan=0.15)

# IV · water running through the falaj.
n = int(8.4 * SR)
trickle = np.zeros(n)
for i in rng.integers(0, n - 1500, 150):
    f = rng.uniform(1100, 2300)
    k = np.arange(1200) / SR
    trickle[i:i + 1200] += np.sin(2 * np.pi * (f + 900 * k / 0.03) * k) * np.exp(-k * 140) * rng.uniform(0.3, 1.0)
trickle += 0.25 * sosfilt(sos("band", [700, 2400]), noise(n))
add(trickle * fade(n, 1.5, 1.8), 41.2, 0.05, pan=0.3)

# V · a radar ping each time the beam passes north (one revolution every ~5.03 s).
for t in (50.6, 50.6 + 5.0265, 50.6 + 2 * 5.0265):
    add(ping(88), t, 0.07, pan=0.2)

# VI · the seeding aircraft crosses left to right, flares crackle, then rain.
n = int(6.8 * SR)
tt = np.arange(n) / SR
engine = (np.sin(2 * np.pi * 96 * tt) + 0.5 * np.sin(2 * np.pi * 192 * tt) + 0.25 * np.sin(2 * np.pi * 288 * tt)) * (0.8 + 0.2 * np.sin(2 * np.pi * 23 * tt))
engine = engine * 0.6 + 0.8 * sosfilt(sos("low", 700), noise(n))
engine *= fade(n, 1.6, 1.8)
pan = np.linspace(-0.85, 0.85, n)
add2(engine * np.sqrt(0.5 * (1 - pan)), engine * np.sqrt(0.5 * (1 + pan)), 61.2, 0.07)
crackle = np.zeros(int(4.2 * SR))
for i in rng.integers(0, len(crackle) - 400, 90):
    crackle[i:i + 400] += sosfilt(sos("band", [2500, 6500]), noise(400)) * np.exp(-np.arange(400) / SR * 300)
add(crackle, 62.8, 0.05, pan=0.1)
rl, rr = rain_bed(7.0, 3.0, 1.2, density=1.0)
add2(rl, rr, 65.0, 0.11)

# VIII · a soft rush as each arc leaves Abu Dhabi.
for t in (84.6, 85.4, 86.2, 87.0):
    n = int(1.6 * SR)
    x, w = noise(n), np.linspace(0, 1, n)
    y = (1 - w) * sosfilt(sos("band", [250, 900]), x) + w * sosfilt(sos("band", [1200, 4200]), x)  # rising rush
    add(y * np.sin(np.pi * w) ** 2, t, 0.06, pan=rng.uniform(-0.5, 0.5))

# IX · rain again, and a chime as the gauge reaches 2027.
rl, rr = rain_bed(12.2, 3.5, 2.6, density=0.9)
add2(rl, rr, 93.8, 0.09)
for j, m in enumerate([77, 81, 84, 89, 91]):
    add(bell(m, 4.2), 100.8 + j * 0.16, 0.13, pan=-0.4 + 0.2 * j)


# ---------------------------------------------------------------- master
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
    wet = sum(comb(x, ms * spread, g) for ms, g in ((29.7, 0.80), (37.1, 0.77), (41.1, 0.75), (43.7, 0.73))) / 4
    wet = allpass(allpass(wet, 5.0, 0.7), 1.7, 0.7)
    return sosfilt(sos("low", 5200), wet)


mixL = 0.72 * L + 0.34 * reverb(L, 1.0)
mixR = 0.72 * R + 0.34 * reverb(R, 1.07)
stereo = np.stack([mixL, mixR], axis=1)
stereo -= stereo.mean(axis=0)
stereo /= np.max(np.abs(stereo)) + 1e-9
stereo = np.tanh(1.3 * stereo) / np.tanh(1.3)          # gentle limiting
stereo *= fade(N, 1.4, 2.4, 1.0)[:, None]              # out of black, into black
stereo *= 0.89 / (np.max(np.abs(stereo)) + 1e-9)       # about -1 dBFS peak

out = sys.argv[1] if len(sys.argv) > 1 else "score.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype("<i2").tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(stereo ** 2)) + 1e-12)
print(f"wrote {out}: {DUR:.0f} s, peak -1.0 dBFS, RMS {rms:.1f} dBFS")
