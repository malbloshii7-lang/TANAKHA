#!/usr/bin/env python3
"""The score of "Four Weeks, Three Regions": recorded orchestra (VSCO-2 CE, CC0) and recorded places (field recordings),
no narration. 93.0 s, placed on the cut's own grid: a bar of 3.4 s (70.6 BPM) from 0.2 s, so every beat of the film
(7.0, 24.0, 41.0, 58.0, 75.0 s) starts on a downbeat, and the name at 88.8 s falls on the last cadence (bar 26, 88.6 s).

    python3 score.py out/score.wav --samples VSCO --foley DIR

VSCO: a checkout of https://github.com/sgossner/VSCO-2-CE (the folders ../ncm-20/gala/sampler.py lists).
DIR: the checkouts ../ncm-20/gala/foley.py lists (blanket, noisekun, moodist, vcsl), with Moodist's nature/wind-in-trees.mp3
from the same commit. The voices are the gala score's (audio.py, sampler.py, foley.py), imported from ../ncm-20/gala.

The music, by beat (D major; the regions' colours in the harmony and the voicing, never a borrowed folk idiom):
  - the title (bars 0-1): a D chord with an added ninth, the harp rising, a glockenspiel glint as the title lands;
  - Kyrgyzstan (2-6): the horn's theme over the strings, D - Bm - G - A - D; wind off the mountains, the lake lapping;
  - Tonga (7-11): the harp's broken chords like the swell, pizzicato basses, a high violin line, G - D/F# - Em - C - D;
    the lagoon's waves and the reef's surf far off;
  - Wellington, Melbourne, Jakarta (12-16): a pizzicato ostinato in eighths, the clockwork of services that never
    close, Bm - G - D - A - A; a forecast room's keyboards, low;
  - Bucharest (17-21): the cellos' line in E minor, Em - C - G - D - A; wind in autumn trees;
  - the close (22-26): the horn's theme again, the strings full, G - A - Bm - G A - D, a soft timpani into the last
    cadence on the name, which then dies away with the picture.
"""
import argparse
import os
import sys
import types

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'ncm-20', 'gala'))
import numpy as np  # noqa: E402
import audio as A  # noqa: E402

DUR = 93.0
BAR, T0, BEAT = 3.4, 0.2, 0.85


def at(i, beat=0.0):
    """film time of bar i, beat (0-3.x) within it"""
    return T0 + BAR * i + BEAT * beat


# the gala score's own harp harmonic and low bloom: the sampler measures its recorded voices against them
def harmonic(m, gain=1.0):
    n = int(2.2 * A.SR)
    t = np.arange(n) / A.SR
    f = A.hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 4)) * np.minimum(1, t / 0.003) * 0.2 * gain


def orch_bloom(t, bus, gain=1.0, root=38):
    bus.add(A.timpani(root + 12, 0.9 * gain), t)
    bus.add(A.strings(root, 3.5, bright=500, attack=0.15, release=2.5, voices=5), t, 0.9 * gain)


SCORE = types.SimpleNamespace(harmonic=harmonic, orch_bloom=orch_bloom, stream=None, diesel_far=None, turboprop_far=None)

CH = {
    'D': [38, 50, 57, 62, 66], 'Dadd9': [38, 50, 57, 64, 66], 'Bm': [35, 47, 54, 59, 62], 'G': [31, 43, 50, 55, 59],
    'A': [33, 45, 52, 57, 61], 'Asus4': [33, 45, 52, 57, 62], 'D/F#': [42, 50, 57, 62, 66], 'Em': [40, 52, 55, 59, 64],
    'C': [36, 48, 55, 60, 64],
}


def chord(bus, name, t, dur, gain=0.42, bright=2000, attack=0.8, release=1.6):
    A.chord(bus, CH[name], t, dur, gain=gain, bright=bright, attack=attack, release=release)


def line(bus, notes, bar0, voice, gain=1.0, pan=0.0, **kw):
    """a melodic line: notes = [(bar offset, beat, midi, beats)]"""
    for db, beat, m, beats in notes:
        dur = beats * BEAT * 1.02
        x = A.horn(m, dur, gain) if voice == 'horn' else A.strings(m, dur, **kw)
        bus.add(x, at(bar0 + db, beat), 1.0 if voice == 'horn' else gain, pan)


def music(H):
    """the orchestra on one bus; H is the harp (the sampler's recorded harp string)"""
    bus = A.Bus(DUR + 6)
    # ---- the title (bars 0-1)
    chord(bus, 'Dadd9', at(0), 6.4, gain=0.3, bright=1500, attack=2.4, release=2.0)
    for k, m in enumerate([62, 66, 69, 74, 76, 78, 81]):
        bus.add(H(m, 0.95), 0.6 + k * 0.42, 1.0, -0.3 + k * 0.1)
    bus.add(A.bell(86, 4.0, 0.5), 1.05, 1.0, 0.2)
    bus.add(A.bell(81, 4.0, 0.35), 3.25, 1.0, -0.2)
    # ---- Kyrgyzstan (bars 2-6): the horn's theme
    for i, c in zip(range(2, 7), ['D', 'Bm', 'G', 'A', 'D']):
        chord(bus, c, at(i), BAR, gain=0.4, bright=1900)
    theme = [(0, 0, 66, 2), (0, 2, 69, 2), (1, 0, 71, 1.5), (1, 1.5, 69, 0.5), (1, 2, 66, 2),
             (2, 0, 67, 1), (2, 1, 71, 1), (2, 2, 74, 2), (3, 0, 76, 2), (3, 2, 73, 2), (4, 0, 74, 3.5)]
    # the horn plays it an octave down, in the middle of its range, where VSCO samples it closely (A3, C4; nothing
    # between C4 and D5, so the upper octave would be shifted up to 7 semitones and sound false)
    low = [(b, bt, m - 12, d) for b, bt, m, d in theme]
    line(bus, low, 2, 'horn', gain=1.0, pan=-0.15)
    # ---- Tonga (bars 7-11): the harp's broken chords, pizzicato basses, a high violin line
    for i, c in zip(range(7, 12), ['G', 'D/F#', 'Em', 'C', 'D']):
        chord(bus, c, at(i), BAR, gain=0.34, bright=2100, attack=1.0)
        up = [n + 12 for n in CH[c][2:]] + [CH[c][2] + 24]
        for k, ix in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
            bus.add(H(up[ix], 0.7 if k % 2 else 0.85), at(i, k * 0.5), 1.0, -0.35 + 0.1 * (k % 8))
        for b in (0, 2):
            bus.add(A.pizz(CH[c][0] + 12, 0.7), at(i, b), 1.0, -0.1)
    line(bus, [(0, 0, 74, 4), (1, 0, 78, 2), (1, 2, 76, 2), (2, 0, 79, 3), (2, 3, 78, 1), (3, 0, 76, 4), (4, 0, 74, 4)],
         7, 'strings', gain=0.3, pan=0.25, bright=2600, attack=0.9, release=1.4)
    bus.add(A.bell(91, 4.0, 0.3), 24.0 + 8.9, 1.0, 0.3)  # the audience
    # ---- Wellington, Melbourne, Jakarta (bars 12-16): the clockwork
    for i, c in zip(range(12, 17), ['Bm', 'G', 'D', 'A', 'A']):
        chord(bus, c, at(i), BAR, gain=0.36 + 0.02 * (i - 12), bright=2000 + 100 * (i - 12), attack=0.9)
        r, f = CH[c][1] + 12, CH[c][2] + 12
        for k, m in enumerate([r, f, r + 12, f] * 2):
            bus.add(A.pizz(m, 0.62 if k % 2 == 0 else 0.48), at(i, k * 0.5), 1.0, 0.3 if k % 2 else -0.3)
        bus.add(A.bell(CH[c][4] + 24, 2.0, 0.18), at(i), 1.0, 0.0)
    # ---- Bucharest (bars 17-21): the cellos' line
    for i, c in zip(range(17, 22), ['Em', 'C', 'G', 'D', 'Asus4']):
        chord(bus, c, at(i), BAR if c != 'Asus4' else BAR / 2, gain=0.36, bright=1800, attack=1.0)
        for b in (0, 2):
            up = [n + 12 for n in CH[c][2:]]
            for k, m in enumerate(up):
                bus.add(H(m, 0.6), at(i, b + k * 0.25), 1.0, 0.2 - 0.1 * k)
    chord(bus, 'A', at(21, 2), BAR / 2, gain=0.36, bright=1800, attack=0.6)
    line(bus, [(0, 0, 59, 2), (0, 2, 57, 1), (0, 3, 55, 1), (1, 0, 55, 2), (1, 2, 52, 2), (2, 0, 50, 2), (2, 2, 55, 2),
               (3, 0, 57, 3), (3, 3, 54, 1), (4, 0, 52, 2), (4, 2, 57, 2)],
         17, 'strings', gain=0.5, pan=-0.2, bright=2200, attack=0.7, release=1.2)
    # ---- the close (bars 22-26): the theme again, the strings full, the last cadence on the name
    for i, c, g in [(22, 'G', 0.48), (23, 'A', 0.5), (24, 'Bm', 0.53)]:
        chord(bus, c, at(i), BAR, gain=g, bright=2300 + 100 * (i - 22), attack=0.8)
    chord(bus, 'G', at(25), BAR / 2, gain=0.55, bright=2600, attack=0.5)
    chord(bus, 'A', at(25, 2), BAR / 2, gain=0.57, bright=2700, attack=0.4)
    line(bus, low[:10], 22, 'horn', gain=1.1, pan=-0.15)
    line(bus, theme[:10], 22, 'strings', gain=0.32, pan=0.2, bright=2700, attack=0.5, release=1.0)
    bus.add(A.horn(62, 4.6, 1.15), at(26), 1.0, -0.15)
    bus.add(A.timpani(45, 0.45), at(25, 2), 1.0)
    bus.add(A.timpani(50, 0.75), at(26), 1.0)
    for k, m in enumerate([62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 86]):
        bus.add(H(m, 0.55 + 0.02 * k), at(26) - 0.84 + k * 0.06, 1.0, -0.4 + 0.06 * k)
    A.chord(bus, CH['D'] + [69, 74], at(26), 3.6, gain=0.6, bright=2800, attack=0.35, release=3.2)
    bus.add(A.bell(86, 4.0, 0.42), 88.8, 1.0, 0.15)
    x = np.vstack([bus.L, bus.R])[:, :int(DUR * A.SR)]
    return A.reverb(x, rt60=2.4, wet=0.22)


def to_lufs(x, target):
    return x * 10 ** ((target - A.lufs(x)) / 20)


def places(F):
    """the recorded places under each beat, each at its own loudness, with slow fades across the dissolves"""
    out = np.zeros((2, int(DUR * A.SR)))

    def put(x, t0, a=1.4, r=1.4):
        x = F.fades(x, a, r)
        i = int(t0 * A.SR)
        k = min(x.shape[1], out.shape[1] - i)
        out[:, i:i + k] += x[:, :k]
    # Kyrgyzstan: mountain wind (Felix Blume, CC0) and the lake lapping at the shore (Moodist "Waves", low-passed)
    put(to_lufs(F.filt(F.bed('wind', 18.0), hp=120), -31), 6.6)
    put(to_lufs(F.filt(F.bed('lap', 18.0), lp=2600), -33), 6.6)
    # Tonga: the lagoon's waves, and the reef's surf far off (the same recording, another stretch, low-passed for distance)
    put(to_lufs(F.bed('lap', 18.0), -28.5), 23.6)
    put(to_lufs(F.filt(F.bed('lap', 18.0), lp=520), -31), 23.6)
    # the services: a forecast room's keyboards, low
    put(to_lufs(F.filt(F.bed('keys', 18.0), hp=200, lp=6000), -37), 40.6)
    # Bucharest: wind in autumn trees (Moodist "Wind in Trees")
    put(to_lufs(F.filt(F.bed('trees', 18.0), hp=150), -30), 57.6)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--samples', required=True)
    ap.add_argument('--foley', required=True)
    ap.add_argument('--lufs', type=float, default=-14.0)
    a = ap.parse_args()
    import sampler
    import foley
    sampler.install(a.samples, SCORE)
    foley.BEDS['trees'] = 'moodist/public/sounds/nature/wind-in-trees.mp3'
    foley.install(a.foley, SCORE)
    H = lambda m, g=1.0: sampler.harmonic(m, g)
    mus = music(H)
    amb = places(foley)
    # the music sits at the front; the places at their own levels under it (set above), then the whole is mastered
    mix = to_lufs(mus, -16.5) + amb
    n = mix.shape[1]
    fade = int(2.5 * A.SR)
    mix[:, n - fade:] *= np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    mix = A.master(mix, target_lufs=a.lufs, ceiling_db=-1.0)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    A.write_wav(a.out, mix)
    print(f'wrote {a.out}: {n / A.SR:.2f} s, {A.lufs(mix):.1f} LUFS, {A.true_peak_db(mix):.1f} dBTP')
    for name, t0, t1 in [('title', 0, 7), ('kyrgyz', 7, 24), ('tonga', 24, 41), ('regionv', 41, 58), ('bucharest', 58, 75), ('close', 75, 93)]:
        seg = mix[:, int(t0 * A.SR):int(t1 * A.SR)]
        print(f'  {name:10s} {A.lufs(seg):6.1f} LUFS')


if __name__ == '__main__':
    main()
