#!/usr/bin/env python3
"""Score for the gala edition of "Reading the Sky": an original, synthesized, dignified cinematic score.

    python3 score.py cues.json out-dir/      (cues.json: `node render.js cues cues.json`)

It writes three 48 kHz 24-bit stems and their mix: music.wav, sfx.wav and mix.wav (-16 LUFS integrated,
-1 dBTP), plus hold.wav, a seamless loop for the stage hold. Every cue is placed from the film's own
timeline, so a re-cut film keeps its music on the cuts.

The music has one theme, in two modes. In the heritage chapters it is in the Hijaz mode on D
(D Eb F# G A Bb C), on oud and qanun over frame drums. When the Center is founded the Eb becomes E and
the same theme is in D major, on strings and horn: the old knowledge carried into modern science. The
April 2024 beat drops to strings and ney under the rain. The finale states the theme in full over the
March night and resolves on D major, then rings out.
72 BPM (a beat is 0.833 s). Nothing in the score or the effects imitates a siren, an alarm or a weapon.
"""
import json
import sys

import numpy as np

import audio as A

BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
D2, A2, D3, A3, D4 = 38, 45, 50, 57, 62
# voicings (MIDI): the major-mode harmony of the Center and after
Dmaj, AoverCs, Bm, G, Amaj = [50, 57, 62, 66], [49, 57, 64, 69], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]
Dadd9, Gadd9 = [50, 57, 64, 66], [43, 55, 62, 69]

# the theme, in beats: (semitones above D4, length); None = rest
THEME = [(0, 1.5), (1, 0.5), (4, 1), (5, 1),  # D  Eb F# G
         (7, 3), (5, 0.5), (4, 0.5),           # A  G  F#
         (5, 1), (4, 0.5), (1, 0.5), (0, 1), (1, 1),  # G F# Eb D Eb
         (0, 4)]                               # D
MAJOR = {1: 2, 10: 11}  # Hijaz Eb -> E, Bb -> B


def theme_notes(t0, root=D4, major=False, stretch=1.0):
    """(time, midi, dur) for the theme starting at t0"""
    out, t = [], t0
    for iv, beats in THEME:
        if iv is not None:
            out.append((t, root + (MAJOR.get(iv % 12, iv % 12) + 12 * (iv // 12) if major else iv), beats * BEAT * stretch))
        t += beats * BEAT * stretch
    return out


# which music each scene gets; the timeline supplies when
ROLE = {
    'suhail': 'night_open', 'durour': 'heritage', 'monsoon': 'heritage', 'pearling': 'heritage', 'falaj': 'heritage',
    'quote-zayed': 'quote', 'centre': 'centre', 'nation': 'centre',
    'airport': 'nation', 'port': 'nation', 'energy': 'nation', 'homes': 'storm',
    'seeding': 'science', 'science': 'science', 'quote-mansour': 'quote', 'world': 'world',
    'finale': 'finale', 'outro': 'outro',
}


def main(cues_path, out_dir):
    cues = json.load(open(cues_path))
    DUR = cues['duration'] + 3.0
    music, sfx = A.Bus(DUR), A.Bus(DUR)
    scenes = cues['scenes']
    for i, s in enumerate(scenes):
        s['end'] = s['start'] + s['dur']
        s['role'] = ROLE.get(s['id'], 'nation')
        s['prev'] = scenes[i - 1]['role'] if i else None
    heritage_first = next((s for s in scenes if s['role'] == 'heritage'), None)

    for s in scenes:
        t0, t1, role = s['start'], s['end'], s['role']
        n_bars = max(1, int(round((t1 - t0) / BAR)))
        if role == 'night_open':
            sfx.add(A.wind(t1 - t0 + 3, gain=1.0, gust=0.06), t0)
            music.add(A.strings(D2, t1 - t0 + 1, bright=700, attack=4.0, release=3.0, voices=5), t0, 0.9)
            music.add(A.strings(A2, t1 - t0 + 1, bright=800, attack=5.0, release=3.0, voices=5), t0 + 1.0, 0.6)
            music.add(A.shimmer(t1 - t0, gain=0.8), t0 + 2.0)
            # the ney calls in the Hijaz mode, the theme's first phrase, slow
            for (t, m, d) in theme_notes(t0 + 0.28 * (t1 - t0), root=D4, stretch=1.25)[:7]:
                music.add(A.ney(m + 12, d * 0.95), t, 0.9, pan=-0.15)
            # Suhail clears the dunes about a fifth of the way through (sky time 01:05 of 01:00-01:27): a bell
            music.add(A.bell(D4 + 24 + 7, 5.0), t0 + 0.38 * (t1 - t0), 0.9, pan=0.1)
            # first light: the strings swell into the dawn
            chord(music, [D3, A3, 66, 69], t1 - 4.0, 6.0, gain=0.55, bright=2200, attack=3.2)
        elif role == 'heritage':
            first = s is heritage_first
            if first:
                music.add(A.boom(0.5), t0)
                chord(music, [D2, D3, A3, 66], t0, t1 - t0, gain=0.45, bright=1800, attack=1.5)
            else:
                chord(music, [D2, A2, D3], t0, t1 - t0, gain=0.35, bright=1400, attack=1.0)
            daf_pattern(music, t0, t1, first)
            # the oud states the theme (Hijaz) once per scene, the qanun answers
            for (t, m, d) in theme_notes(t0 + BAR * (1 if first else 0.5)):
                if t + 0.2 < t1:
                    music.add(A.pluck(m, dur=max(1.2, d + 0.6)), t, 0.8, pan=-0.2)
            for k in range(n_bars):
                tq = t0 + k * BAR + 3 * BEAT
                if tq < t1:
                    music.add(A.qanun(D4 + 12 + [7, 5, 4, 1][k % 4], 1.2), tq, 0.45, pan=0.35)
            if s['id'] in ('monsoon', 'pearling'):
                sfx.add(A.sea(t1 - t0 + 1.5, gain=0.9), t0)
                sfx.add(A.wind(t1 - t0 + 1.5, gain=0.5), t0)
            if s['id'] == 'falaj':
                sfx.add(stream(t1 - t0 + 1.0), t0)
        elif role == 'quote':
            chord(music, Dmaj, t0, t1 - t0 + 1, gain=0.42, bright=1500, attack=2.0, release=3.0)
            music.add(A.choir(D4 + 9, t1 - t0 - 1, vowel='o', gain=0.35), t0 + 1.0)
            music.add(A.bell(D4 + 24, 4.0, gain=0.6), t0 + 0.4, pan=0.2)
        elif role == 'centre':
            # the modern Center: the Eb becomes E; a pizzicato pulse and a clock-like tick build under strings
            music.add(A.boom(0.6), t0)
            prog_ = [Dmaj, AoverCs, Bm, G]  # D – A/C# – Bm – G
            for k in range(n_bars):
                tb = t0 + k * BAR
                if tb >= t1:
                    break
                chord(music, prog_[k % 4], tb, BAR * 1.05, gain=0.32, bright=2000 + 300 * k, attack=0.6, release=1.2)
                for b8 in range(8):
                    tp = tb + b8 * BEAT / 2
                    if tp < t1:
                        music.add(A.pizz([D3, A3, D4, A3][b8 % 4] + (2 if k % 4 == 2 else 0)), tp, 0.55, pan=0.25 * np.sin(b8))
                for b in range(4):
                    music.add(A.tak(0.35), tb + b * BEAT, 1.0, pan=0.4)
            for (t, m, d) in theme_notes(t0 + BAR, root=D4, major=True):
                if t + 0.2 < t1:
                    music.add(A.horn(m, d), t, 0.7, pan=-0.1)
        elif role == 'nation':
            music.add(A.taiko(0.9), t0)
            chords = [Dmaj, Bm, G, Amaj]  # D – Bm – G – A
            for k in range(n_bars):
                tb = t0 + k * BAR
                if tb >= t1:
                    break
                chord(music, chords[k % 4], tb, BAR * 1.05, gain=0.36, bright=2600, attack=0.4, release=1.0)
                for b8 in range(8):
                    tp = tb + b8 * BEAT / 2
                    if tp < t1:
                        music.add(A.strings([D3, A3, D4, A3, D3 + 7, A3, D4, A3][b8] + (0 if k % 2 == 0 else -2), BEAT * 0.45, bright=2400, attack=0.02, release=0.2, voices=3), tp, 0.35)
                music.add(A.daf(0.8, jingle=False), tb, 0.9)
                music.add(A.daf(0.5, jingle=False), tb + 2 * BEAT, 0.9)
            music.add(A.choir(D4 + 9, t1 - t0, gain=0.3), t0 + 0.5)
            for (t, m, d) in theme_notes(t0, root=D4, major=True):
                if t + 0.2 < t1:
                    music.add(A.horn(m, d), t, 0.6, pan=-0.15)
            if s['id'] == 'airport':
                sfx.add(A.jet_far(min(7.0, t1 - t0), gain=1.0), t0 + 0.8, 0.9, pan=0.2)
            if s['id'] == 'port':
                sfx.add(A.sea(t1 - t0 + 1, gain=0.7), t0)
                sfx.add(A.ship_horn_far(0.8), t0 + 1.6, pan=0.4)
            if s['id'] == 'energy':
                sfx.add(A.wind(t1 - t0 + 1, gain=0.5, gust=0.1), t0)
        elif role == 'storm':
            # April 2024: the drums stop; strings in B minor, the ney alone; the rain, one far roll of thunder
            chords = [Bm, G, Dmaj, Amaj]  # Bm – G – D – A
            for k in range(n_bars):
                tb = t0 + k * BAR
                if tb < t1:
                    chord(music, chords[k % 4], tb, BAR * 1.1, gain=0.34, bright=1500, attack=1.2, release=2.0)
            for (t, m, d) in theme_notes(t0 + BAR * 0.5, root=D4 - 3, stretch=1.1)[:7]:
                if t + 0.2 < t1:
                    music.add(A.ney(m + 12, d * 0.95), t, 0.7)
            sfx.add(A.rain(t1 - t0 + 1.5, gain=1.0), t0 + 1.2)
            sfx.add(A.thunder_far(0.7), t0 + 0.45 * (t1 - t0), pan=-0.3)
        elif role == 'science':
            for k in range(n_bars):
                tb = t0 + k * BAR
                if tb >= t1:
                    break
                chord(music, [Dadd9, Gadd9][k % 2], tb, BAR * 1.05, gain=0.32, bright=2400, attack=0.8)
                for b16 in range(8):
                    tq = tb + b16 * BEAT / 2
                    if tq < t1:
                        music.add(A.qanun([D4 + 12, D4 + 16, D4 + 19, D4 + 24, D4 + 19, D4 + 16, D4 + 14, D4 + 16][b16], 0.9), tq, 0.3, pan=0.5 * np.sin(b16))
            music.add(A.choir(D4 + 4, t1 - t0, gain=0.3), t0)
            if s['id'] == 'seeding':
                sfx.add(A.rain(max(1.0, t1 - t0 - 3.0), gain=0.6), t0 + 3.0)
        elif role == 'world':
            music.add(A.taiko(1.0), t0)
            music.add(A.timpani(D2 + 12, 0.8), t0)
            for k in range(n_bars):
                tb = t0 + k * BAR
                if tb < t1:
                    chord(music, [Dmaj + [69], G + [67], Bm + [66], Amaj + [69]][k % 4], tb, BAR * 1.05, gain=0.34, bright=3000, attack=0.4)
                    music.add(A.daf(0.8, jingle=True), tb)
            music.add(A.choir(D4 + 9, t1 - t0, gain=0.45), t0)
            for (t, m, d) in theme_notes(t0, root=D4 + 12, major=True):
                if t + 0.2 < t1:
                    music.add(A.horn(m - 12, d), t, 0.7)
                    music.add(A.strings(m, d, bright=3200, attack=0.15, release=0.6, voices=5), t, 0.5)
            # a timpani roll into the dusk
            for k in range(12):
                music.add(A.timpani(D2 + 7, 0.25 + 0.05 * k), t1 - 1.6 + k * 0.12)
        elif role == 'finale':
            chord(music, [D2, D3, A3, 66, 69], t0, t1 - t0 + 2, gain=0.42, bright=1600, attack=2.5, release=5.0)
            music.add(A.choir(D4 + 4, t1 - t0, gain=0.35), t0 + 1.0)
            music.add(A.shimmer(t1 - t0, gain=1.0, base=86), t0)
            music.add(A.bell(D4 + 24 + 7, 5.0, gain=0.8), t0 + 2.2, pan=0.1)  # the gold ring around Suhail
            # the theme, whole, in D major: oud and horn together, then the resolution under the title
            for (t, m, d) in theme_notes(t0 + 3.0, root=D4, major=True, stretch=1.1):
                if t + 0.2 < t1:
                    music.add(A.pluck(m, dur=max(1.2, d + 0.8)), t, 0.7, pan=-0.2)
                    music.add(A.horn(m - 12, d), t, 0.45)
            music.add(A.boom(0.7), t0 + 4.2)
        elif role == 'outro':
            chord(music, [D2, A2, D3, A3, 66, 69], t0, t1 - t0 + 1, gain=0.34, bright=1300, attack=1.0, release=5.0)
            music.add(A.shimmer(t1 - t0 + 1, gain=0.8, base=86), t0)

    # fader rides: each scene's role sets the level, so the loudness follows the story
    #   a quiet night, the build through the nation, the drop for April 2024, the peak at the world, the resolve
    ride_m = rides(scenes, DUR, {'night_open': -9, 'heritage': -2, 'quote': -6, 'centre': -1, 'nation': 0, 'storm': -6,
                                 'science': -2, 'world': 1.5, 'finale': 0, 'outro': -4})
    ride_f = rides(scenes, DUR, {'night_open': -12, 'heritage': -8, 'quote': -20, 'centre': -12, 'nation': -8, 'storm': -9,
                                 'science': -12, 'world': -20, 'finale': -20, 'outro': -20})
    # mix: music under a light hall, effects drier; stems share the same gain so they sum to the mix
    m = A.reverb(music.stereo() * ride_m, rt60=3.4, wet=0.3)
    f = A.reverb(sfx.stereo() * ride_f, rt60=1.6, wet=0.12)
    mix = m + f * 0.9
    fade = np.ones(mix.shape[1])
    k = int(2.5 * A.SR)
    fade[-k:] = np.linspace(1, 0, k) ** 2
    mix *= fade
    mastered = A.master(mix, target_lufs=-16.0, ceiling_db=-1.0)
    g = mastered / np.where(np.abs(mix) > 1e-9, mix, 1)  # the mastering gain per sample, applied to the stems too
    g = np.clip(np.nan_to_num(g, nan=1.0, posinf=1.0, neginf=1.0), 0, 10)
    gs = np.median(g, axis=0)
    A.write_wav(f'{out_dir}/mix.wav', mastered)
    A.write_wav(f'{out_dir}/music.wav', m * fade * gs)
    A.write_wav(f'{out_dir}/sfx.wav', f * 0.9 * fade * gs)
    print(f'mix: {A.lufs(mastered):.1f} LUFS, {A.true_peak_db(mastered):.1f} dBTP, {mastered.shape[1] / A.SR:.1f} s')
    hold(out_dir)


def rides(scenes, dur, db, ramp=1.6):
    """a gain envelope: each scene's role level in dB, eased across a ramp at every cut"""
    n = int(round(dur * A.SR))
    lv = np.zeros(n)
    for s in scenes:
        i0 = int(s['start'] * A.SR)
        lv[i0:] = db.get(s['role'], 0)
    k = int(ramp * A.SR)
    ker = np.hanning(k)
    ker /= ker.sum()
    lv = np.convolve(np.pad(lv, (k, k), mode='edge'), ker, mode='same')[k:-k]
    return 10 ** (lv / 20)


def chord(bus, notes, t, dur, **kw):
    A.chord(bus, notes, t, dur, **kw)


def daf_pattern(bus, t0, t1, strong):
    """the Khaleeji-inspired frame-drum figure: dum on 1 and 3-and, taks between"""
    t = t0
    while t < t1 - 0.05:
        for b, kind in [(0, 'dum'), (1, 'tak'), (1.5, 'tak'), (2.5, 'dum'), (3, 'tak')]:
            tb = t + b * BEAT
            if tb < t1:
                if kind == 'dum':
                    bus.add(A.daf(0.8 if strong else 0.6), tb, 0.9)
                else:
                    bus.add(A.tak(0.7), tb, 0.8, pan=0.3)
        t += BAR


def stream(dur):
    """water running in the falaj channel: a narrow, bubbling band"""
    n = int(dur * A.SR)
    x = A.bp(A.noise(n), 900, 3200, 2)
    bub = np.abs(np.sin(2 * np.pi * np.cumsum(3 + 2 * A.rng.random(n)) / A.SR))
    env = A.adsr(n, 0.8, 0.1, 1.0, 0.8)
    return x * (0.4 + 0.6 * bub) * env * 0.05


def hold(out_dir, L=20.0):
    """a seamless 20 s loop for the stage hold: pad, starlight and a few oud notes, built periodic"""
    bus = A.Bus(L * 3)
    for k in range(3):
        t0 = k * L
        chord(bus, [D2, A2, D3, A3, 66, 69], t0 - 2.0, L + 4.0, gain=0.3, bright=1300, attack=2.0, release=2.0)
        bus.add(A.shimmer(L + 4.0, gain=0.7, base=86), t0 - 2.0)
        for j, (dt, m) in enumerate([(3.0, D4 + 12), (5.5, D4 + 16), (9.0, D4 + 19), (14.0, D4 + 16)]):
            bus.add(A.pluck(m, 2.5), t0 + dt, 0.35)
    x = A.reverb(bus.stereo(), rt60=3.4, wet=0.35)
    n = int(L * A.SR)
    loop = x[:, n:2 * n]  # the middle cycle has its predecessor's tails, so its end flows into its start
    loop = A.master(loop, target_lufs=-22.0, ceiling_db=-3.0)
    A.write_wav(f'{out_dir}/hold.wav', loop)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.')
