#!/usr/bin/env python3
"""The score of "Four Weeks, Three Regions", the feed cut: recorded orchestra (VSCO-2 CE, CC0), recorded places (field
recordings) and the narrator. 59.5 s, placed on the cut's own grid: a bar of 2.75 s (87.3 BPM) from 0.25 s, four bars to
each stop, so every cut (3.0, 14.0, 25.0, 36.0, 47.0 s) falls on a downbeat, and the last cadence (bar 20, 55.25 s)
lands under the name.

    python3 score.py out/score.wav --samples VSCO --foley DIR [--vo vo/]

--vo: the narration (voiceover.json), placed on its cues with the music lowered under it, and the voice captions
(out/four-weeks-three-regions.voice.{en,ar}.srt) written from the times its lines actually run.

VSCO: a checkout of https://github.com/sgossner/VSCO-2-CE (the folders ../ncm-20/gala/sampler.py lists).
DIR: the checkouts ../ncm-20/gala/foley.py lists (blanket, noisekun, moodist, vcsl), with Moodist's nature/wind-in-trees.mp3
from the same commit. The voices are the gala score's (audio.py, sampler.py, foley.py), imported from ../ncm-20/gala.

The music, by beat (D major; the regions' colours in the harmony and the voicing, never a borrowed folk idiom):
  - the title (bar 0): a D chord with an added ninth, the harp rising, a glockenspiel glint on the first frame;
  - Kyrgyzstan (1-4): the horn's theme over the strings, D - Bm - G - A; wind off the mountains, the lake lapping;
  - Tonga (5-8): the harp's broken chords like the swell, pizzicato basses, a high violin line, G - D/F# - Em - C;
    the lagoon's waves and the reef's surf far off;
  - Wellington, Melbourne, Jakarta (9-12): a pizzicato ostinato in eighths, the clockwork of services that never close,
    Bm - G - D - A; a forecast room's keyboards, low;
  - Bucharest (13-16): the cellos' line in E minor, Em - C - G - Asus4 A; wind in autumn trees;
  - the close (17-20): the horn's theme again, the strings full, G - A - G A - D, a soft timpani into the last cadence
    under the name, which then dies away with the picture.
"""
import argparse
import os
import sys
import types

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'ncm-20', 'gala'))
import numpy as np  # noqa: E402
import audio as A  # noqa: E402

DUR = 59.5
BAR, T0, BEAT = 2.75, 0.25, 0.6875


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
    # ---- the title (bar 0): bright from the first frame
    chord(bus, 'Dadd9', 0.0, 3.2, gain=0.3, bright=1700, attack=0.35, release=1.6)
    for k, m in enumerate([62, 66, 69, 74, 76, 78, 81]):
        bus.add(H(m, 0.95), 0.12 + k * 0.2, 1.0, -0.3 + k * 0.1)
    bus.add(A.bell(86, 3.0, 0.45), 0.3, 1.0, 0.2)
    # ---- Kyrgyzstan (bars 1-4): the horn's theme, an octave down, where VSCO samples the horn closely (A3, C4)
    for i, c in zip(range(1, 5), ['D', 'Bm', 'G', 'A']):
        chord(bus, c, at(i), BAR, gain=0.4, bright=1900, attack=0.6)
    theme = [(0, 0, 66, 2), (0, 2, 69, 2), (1, 0, 71, 1.5), (1, 1.5, 69, 0.5), (1, 2, 66, 2),
             (2, 0, 67, 1), (2, 1, 71, 1), (2, 2, 74, 2), (3, 0, 76, 2), (3, 2, 73, 2)]
    low = [(b, bt, m - 12, d) for b, bt, m, d in theme]
    line(bus, low, 1, 'horn', gain=1.0, pan=-0.15)
    # ---- Tonga (bars 5-8): the harp's broken chords, pizzicato basses, a high violin line
    for i, c in zip(range(5, 9), ['G', 'D/F#', 'Em', 'C']):
        chord(bus, c, at(i), BAR, gain=0.34, bright=2100, attack=0.7)
        up = [n + 12 for n in CH[c][2:]] + [CH[c][2] + 24]
        for k, ix in enumerate([0, 1, 2, 3, 2, 1, 2, 3]):
            bus.add(H(up[ix], 0.7 if k % 2 else 0.85), at(i, k * 0.5), 1.0, -0.35 + 0.1 * (k % 8))
        for b in (0, 2):
            bus.add(A.pizz(CH[c][0] + 12, 0.7), at(i, b), 1.0, -0.1)
    line(bus, [(0, 0, 74, 4), (1, 0, 78, 2), (1, 2, 76, 2), (2, 0, 79, 3), (2, 3, 78, 1), (3, 0, 76, 4)],
         5, 'strings', gain=0.3, pan=0.25, bright=2600, attack=0.7, release=1.2)
    # ---- Wellington, Melbourne, Jakarta (bars 9-12): the clockwork
    for i, c in zip(range(9, 13), ['Bm', 'G', 'D', 'A']):
        chord(bus, c, at(i), BAR, gain=0.36 + 0.02 * (i - 9), bright=2000 + 100 * (i - 9), attack=0.7)
        r, f = CH[c][1] + 12, CH[c][2] + 12
        for k, m in enumerate([r, f, r + 12, f] * 2):
            bus.add(A.pizz(m, 0.62 if k % 2 == 0 else 0.48), at(i, k * 0.5), 1.0, 0.3 if k % 2 else -0.3)
        bus.add(A.bell(CH[c][4] + 24, 2.0, 0.18), at(i), 1.0, 0.0)
    # ---- Bucharest (bars 13-16): the cellos' line
    for i, c in zip(range(13, 17), ['Em', 'C', 'G', 'Asus4']):
        chord(bus, c, at(i), BAR if c != 'Asus4' else BAR / 2, gain=0.36, bright=1800, attack=0.8)
        for b in (0, 2):
            up = [n + 12 for n in CH[c][2:]]
            for k, m in enumerate(up):
                bus.add(H(m, 0.6), at(i, b + k * 0.25), 1.0, 0.2 - 0.1 * k)
    chord(bus, 'A', at(16, 2), BAR / 2, gain=0.36, bright=1800, attack=0.5)
    line(bus, [(0, 0, 59, 2), (0, 2, 57, 1), (0, 3, 55, 1), (1, 0, 55, 2), (1, 2, 52, 2), (2, 0, 50, 2), (2, 2, 55, 2),
               (3, 0, 57, 3), (3, 3, 54, 1)],
         13, 'strings', gain=0.5, pan=-0.2, bright=2200, attack=0.6, release=1.0)
    # ---- the close (bars 17-20): the theme again, the strings full, the last cadence under the name
    for i, c, g in [(17, 'G', 0.48), (18, 'A', 0.5)]:
        chord(bus, c, at(i), BAR, gain=g, bright=2300 + 100 * (i - 17), attack=0.6)
    chord(bus, 'G', at(19), BAR / 2, gain=0.53, bright=2600, attack=0.4)
    chord(bus, 'A', at(19, 2), BAR / 2, gain=0.55, bright=2700, attack=0.3)
    line(bus, low[:8], 17, 'horn', gain=1.1, pan=-0.15)
    line(bus, theme[:8], 17, 'strings', gain=0.3, pan=0.2, bright=2700, attack=0.4, release=0.9)
    bus.add(A.horn(62, 3.6, 1.15), at(20), 1.0, -0.15)
    bus.add(A.timpani(45, 0.45), at(19, 2), 1.0)
    bus.add(A.timpani(50, 0.75), at(20), 1.0)
    for k, m in enumerate([62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 79, 81, 83, 86]):
        bus.add(H(m, 0.55 + 0.02 * k), at(20) - 0.62 + k * 0.045, 1.0, -0.4 + 0.06 * k)
    A.chord(bus, CH['D'] + [69, 74], at(20), 3.4, gain=0.6, bright=2800, attack=0.3, release=2.6)
    bus.add(A.bell(86, 3.0, 0.4), at(20) + 0.1, 1.0, 0.15)
    x = np.vstack([bus.L, bus.R])[:, :int(DUR * A.SR)]
    return A.reverb(x, rt60=2.2, wet=0.2)


def to_lufs(x, target):
    return x * 10 ** ((target - A.lufs(x)) / 20)


def places(F):
    """the recorded places under each stop, each at its own loudness, with slow fades across the dissolves"""
    out = np.zeros((2, int(DUR * A.SR)))

    def put(x, t0, a=1.0, r=1.0):
        x = F.fades(x, a, r)
        i = int(t0 * A.SR)
        k = min(x.shape[1], out.shape[1] - i)
        out[:, i:i + k] += x[:, :k]
    # Kyrgyzstan: mountain wind (Felix Blume, CC0) and the lake lapping at the shore (Moodist "Waves", low-passed)
    put(to_lufs(F.filt(F.bed('wind', 11.8), hp=120), -31), 2.6)
    put(to_lufs(F.filt(F.bed('lap', 11.8), lp=2600), -33), 2.6)
    # Tonga: the lagoon's waves, and the reef's surf far off (the same recording, another stretch, low-passed for distance)
    put(to_lufs(F.bed('lap', 11.8), -28.5), 13.6)
    put(to_lufs(F.filt(F.bed('lap', 11.8), lp=520), -31), 13.6)
    # the services: a forecast room's keyboards, low
    put(to_lufs(F.filt(F.bed('keys', 11.8), hp=200, lp=6000), -37), 24.6)
    # Bucharest: wind in autumn trees (Moodist "Wind in Trees")
    put(to_lufs(F.filt(F.bed('trees', 11.8), hp=150), -30), 35.6)
    return out


def voice(F, vo_dir, n_total):
    """the President's recorded lines (vo/line-N.*, any format ffmpeg reads), each trimmed of its silence, cleaned (a
    high-pass under his voice's fundamental) and set to one level, placed on its cue in voiceover.json; and the duck: how
    far the music and the places fall under him (9 dB, easing down 0.3 s before a line and back up over 0.8 s after it).
    Returns the voice track, the duck gain and the cues actually used (start, end, line)"""
    import glob
    import json
    cues = json.load(open(os.path.join(HERE, 'voiceover.json')))['lines']
    track = np.zeros((2, n_total))
    duck = np.ones(n_total)
    used = []
    for c in cues:
        files = sorted(glob.glob(os.path.join(vo_dir, f"line-{c['n']}.*")))
        if not files:
            raise SystemExit(f"--vo: no recording for line {c['n']} in {vo_dir}")
        x = F.decode(files[0])
        m = np.mean(np.abs(x), axis=0)
        env = np.convolve(m, np.ones(480) / 480, 'same')
        thr = env.max() * 10 ** (-38 / 20)
        on = np.nonzero(env > thr)[0]
        x = x[:, max(0, on[0] - int(0.05 * A.SR)):min(x.shape[1], on[-1] + int(0.15 * A.SR))]
        x = F.filt(x, hp=80)
        x = F.fades(x, 0.01, 0.08)
        x = to_lufs(x, -18.0)
        dur = x.shape[1] / A.SR
        if dur > c['max'] + 0.3:
            print(f"  line {c['n']}: {dur:.1f} s, longer than its {c['max']:.1f} s slot")
        i = int(c['in'] * A.SR)
        k = min(x.shape[1], n_total - i)
        track[:, i:i + k] += x[:, :k]
        a0, a1 = int((c['in'] - 0.3) * A.SR), int((c['in'] + dur + 0.8) * A.SR)
        duck[max(0, a0):min(n_total, a1)] = 0.0
        used.append((c['in'], c['in'] + dur, c))
    # the duck's shape: 0 under a line, 1 between; smoothed, then mapped to gain (-9 dB under a line)
    w = int(0.35 * A.SR)
    sm = np.convolve(duck, np.ones(w) / w, 'same')
    return track, 10 ** (-9 * (1 - sm) / 20), used


def voice_srt(used, out_dir):
    """the captions of what he says, in English and in Arabic, on the times his lines actually run"""
    tc = lambda t: f'{int(t // 3600):02d}:{int(t // 60) % 60:02d}:{int(t) % 60:02d},{int(round(t * 1000)) % 1000:03d}'
    for lang in ('en', 'ar'):
        body = '\n'.join(f"{k + 1}\n{tc(t0)} --> {tc(t1 + 0.3)}\n{c[lang]}\n" for k, (t0, t1, c) in enumerate(used))
        f = os.path.join(out_dir, f'four-weeks-three-regions.voice.{lang}.srt')
        open(f, 'w').write(body)
        print('wrote', f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('--samples', required=True)
    ap.add_argument('--foley', required=True)
    ap.add_argument('--lufs', type=float, default=-14.0)
    ap.add_argument('--vo', help='a folder of the voice-over takes, line-1 ... line-7 (VOICEOVER.md)')
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
    if a.vo:
        vo, g, used = voice(foley, a.vo, n)
        mix = mix * g + vo
        voice_srt(used, os.path.dirname(os.path.abspath(a.out)))
    fade = int(1.2 * A.SR)
    mix[:, n - fade:] *= np.cos(np.linspace(0, np.pi / 2, fade)) ** 2
    mix = A.master(mix, target_lufs=a.lufs, ceiling_db=-1.0)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    A.write_wav(a.out, mix)
    print(f'wrote {a.out}: {n / A.SR:.2f} s, {A.lufs(mix):.1f} LUFS, {A.true_peak_db(mix):.1f} dBTP')
    for name, t0, t1 in [('title', 0, 3), ('kyrgyz', 3, 14), ('tonga', 14, 25), ('regionv', 25, 36), ('bucharest', 36, 47), ('close', 47, 59.5)]:
        seg = mix[:, int(t0 * A.SR):int(t1 * A.SR)]
        print(f'  {name:10s} {A.lufs(seg):6.1f} LUFS')


if __name__ == '__main__':
    main()
