#!/usr/bin/env python3
"""Temp score for the gala edition of "Reading the Sky", to the music brief in TREATMENT.md §8.

    python3 score.py cues.json out-dir/      (cues.json: `node render.js cues cues.json`)

It writes 48 kHz 24-bit WAVs: music.wav and sfx.wav (stems), mix.wav (-16 LUFS integrated, -1 dBTP, for review and
online), mix-r128.wav (-23 LUFS, for broadcast), hold.wav (a seamless 20 s loop for the stage hold) and hold-world.wav
(a seamless 12 s bed for the applause after B17, which the show caller releases), and part1.wav / part2.wav, the mix
split at the end of B17 for the cue-to-cue run. Every cue is
placed from the film's own timeline, so the music stays on the cuts when the film is re-cut. It is the temp track for
the animatic; the brief asks for an original score recorded live.

One motif, "Suhail": D, E half-flat, F, G (maqam Bayati on D) in the heritage; tempered D Dorian for the Center;
a bare D pedal for April 2024; F major for the world, whose apex is the national line ("from the skies of the
Emirates to the world"), never a person's name; the leaders' cards carry the motif in full strings, horn and choir, as
much weight as any beat; the twenty-year hit on the dominant (A), so it opens rather than ends; and D major, with the
motif as D-E-F#-G, for the finale, whose tonic chord is the only full cadence.
72 BPM, one bar = 3.333 s. Nothing imitates a siren, an alert tone, thunder, a boom or an impact.
"""
import json
import sys

import numpy as np

import audio as A

BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
D2, A2, D3, A3, D4 = 38, 45, 50, 57, 62
EHF = 63.5  # E half-flat (Bayati)

# voicings (MIDI)
Dmaj, Bm, G, Amaj = [50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]
Dm7, Gsus, Csus = [50, 57, 60, 65], [43, 55, 60, 62], [48, 55, 60, 62]  # D Dorian colours
F, C, Dm, Bb = [41, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 58, 62, 65]
Dfifth = [38, 45, 50, 57]

# the motif and its continuation, in beats: (MIDI offset above the root, beats)
BAYATI = [(0, 1.5), (1.5, 0.5), (3, 1), (5, 1), (7, 2), (5, 0.5), (3, 0.5), (1.5, 1), (0, 2)]
MAJOR = [(0, 1.5), (2, 0.5), (4, 1), (5, 1), (7, 2), (5, 0.5), (4, 0.5), (2, 1), (0, 2)]


def motif(t0, root=D4, major=False, stretch=1.0, n=None):
    out, t = [], t0
    for iv, beats in (MAJOR if major else BAYATI)[:n]:
        out.append((t, root + iv, beats * BEAT * stretch))
        t += beats * BEAT * stretch
    return out


def chord(bus, notes, t, dur, **kw):
    A.chord(bus, notes, t, dur, **kw)


def detent():
    """a small, soft brass click for each circle lock"""
    n = int(0.12 * A.SR)
    t = np.arange(n) / A.SR
    return (A.bp(A.noise(n), 2500, 7000, 2) * np.exp(-t * 90) * 0.5 + np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 60) * 0.2) * 0.25


def harmonic(m, gain=1.0):
    """a qanun harmonic: a pure, bright partial with a quick pluck"""
    n = int(2.2 * A.SR)
    t = np.arange(n) / A.SR
    f = A.hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 4)) * np.minimum(1, t / 0.003) * 0.2 * gain


def felt(m, gain=1.0):
    """a felt piano note, soft"""
    n = int(3.0 * A.SR)
    t = np.arange(n) / A.SR
    f = A.hz(m)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (1.2 + k * 0.8)) for k, a in [(1, 1), (2, 0.35), (3, 0.12)])
    return A.lp(s * np.minimum(1, t / 0.008), 1800, 2) * 0.28 * gain


def water(m, gain=1.0):
    """a soft water note: a pitched drop"""
    n = int(0.9 * A.SR)
    t = np.arange(n) / A.SR
    f = A.hz(m) * (1 + 0.25 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / A.SR) * np.exp(-t * 6) * np.minimum(1, t / 0.002) * 0.22 * gain


def turboprop_far(dur, gain=1.0):
    """a distant turboprop (the seeding aircraft is a twin turboprop): the propellers' blade-pass hum and its
    harmonics, with a little filtered air, low-passed by distance; it swells and fades as it crosses the frame"""
    n = int(dur * A.SR)
    t = np.arange(n) / A.SR
    f0 = 1700 / 60 * 4 * (1 + 0.004 * np.sin(2 * np.pi * 0.21 * t))  # 1,700 rpm, four blades
    ph = 2 * np.pi * np.cumsum(f0) / A.SR
    hum = sum(a * np.sin(k * ph) for k, a in [(1, 1.0), (2, 0.45), (3, 0.22), (4, 0.1)])
    air = A.bp(A.noise(n), 200, 1400, 2) * 0.35
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return A.lp(hum * 0.5 + air, 900, 2) * env * 0.05 * gain


def orch_bloom(t, bus, gain=1.0, root=D2):
    """an orchestral low bloom (low strings, timpani) instead of any impact: the LFE's only two uses"""
    bus.add(A.timpani(root + 12, 0.9 * gain), t)
    bus.add(A.strings(root, 3.5, bright=500, attack=0.15, release=2.5, voices=5), t, 0.9 * gain)


def stream(dur):
    n = int(dur * A.SR)
    x = A.bp(A.noise(n), 900, 3200, 2)
    bub = np.abs(np.sin(2 * np.pi * np.cumsum(3 + 2 * A.rng.random(n)) / A.SR))
    return x * (0.4 + 0.6 * bub) * A.adsr(n, 0.8, 0.1, 1.0, 0.8) * 0.045


def main(cues_path, out_dir):
    cues = json.load(open(cues_path))
    DUR = cues['duration'] + 3.5
    music, sfx = A.Bus(DUR), A.Bus(DUR)
    S = {s['id']: s for s in cues['scenes']}
    st = lambda i: S[i]['start']
    en = lambda i: S[i]['start'] + S[i]['dur']

    # B01 · night: silence, then the drone, wind, starlight; the ney motif as Suhail clears the dunes; the ring tone
    t_end = en('suhail')
    sfx.add(A.wind(t_end + 3, gain=0.9, gust=0.05), 1.5)
    music.add(A.strings(D2, t_end - 1.0, bright=600, attack=3.5, release=3.0, voices=5), 1.5, 0.85)
    music.add(A.strings(A2, t_end - 2.0, bright=700, attack=4.0, release=3.0, voices=5), 2.5, 0.5)
    for k, (dt, m) in enumerate([(2.2, 86), (3.4, 93), (4.9, 88), (6.1, 91), (7.2, 86)]):
        music.add(A.bell(m, 2.5, gain=0.45), dt, pan=0.6 * np.sin(k * 2.1))  # celesta glints on the brightest stars
    for (t, m, d) in motif(8.333, root=D4 + 12, n=4):
        music.add(A.ney(m, d * 0.95), t, 0.85, pan=-0.1)
    music.add(A.choir(D3 + 12, 4.0, gain=0.3), 8.333)
    music.add(harmonic(D4 + 24, 0.8), 9.2)
    # B02–B05 · heritage in Bayati: first light chord, oud ostinato, qanun, light frame drum
    h0, h1 = st('durour'), en('falaj')
    chord(music, [D3, A3, 62, 69], h0 - 1.0, 5.0, gain=0.5, bright=2000, attack=2.5)
    music.add(harmonic(D4 + 12, 0.6), h0)
    t = h0
    while t < h1 - 0.1:
        for b, m in [(0, D3), (0.5, A2 + 12), (1, D3 + 3), (1.5, A2 + 12), (2, D3 + 5), (2.5, D3 + 3), (3, D3 + 1.5), (3.5, A2 + 12)]:
            tb = t + b * BEAT
            if tb < h1 - 0.05:
                music.add(A.pluck(m, 1.1, bright=0.5), tb, 0.5, pan=-0.25)
        music.add(A.daf(0.45, jingle=False), t, 0.8)
        music.add(A.daf(0.3, jingle=False), t + 2.5 * BEAT, 0.8)
        t += BAR
    chord(music, [D2, D3, A3], h0 + 2.0, h1 - h0 - 1.0, gain=0.3, bright=1200, attack=2.0, release=2.0)
    for (t, m, d) in motif(h0 + BAR, root=D4):
        music.add(A.pluck(m, max(1.2, d + 0.6), bright=0.6), t, 0.7, pan=-0.2)
    for tq in [st('monsoon') - 0.35, st('pearling') - 0.35]:  # qanun runs into the circle locks
        for k, m in enumerate([D4 + 12, D4 + 13.5, D4 + 15, D4 + 17, D4 + 19]):
            music.add(A.qanun(m, 0.8), tq + k * 0.07, 0.35, pan=0.4)
    sfx.add(A.sea(en('pearling') - st('monsoon') + 1.5, gain=0.8), st('monsoon'))
    sfx.add(A.wind(3.0, gain=0.5, gust=0.3), st('pearling') + 0.2)
    sfx.add(stream(en('falaj') - st('falaj') + 1.0), st('falaj'))
    chord(music, [D3, A3, 62, 65], st('falaj') + 4.6, 4.0, gain=0.38, bright=1500, attack=1.5, release=2.0)  # under Sheikh Zayed's name
    # B06 · the Zayed card, as every leader's card: full strings, the motif in the horn, a wordless choir; no percussion
    card(music, st('quote-zayed'), en('quote-zayed'), major=False)
    # B07–B08 · the Center (D Dorian): the pulse enters; a radar tick in eighths; the seven emirates on the map
    c0, c1 = st('centre'), en('nation')
    prog_ = [Dm7, Csus, Gsus, Dm7]
    k, t = 0, c0
    while t < c1 - 0.1:
        chord(music, prog_[k % 4], t, BAR * 1.05, gain=0.3, bright=1900 + 150 * k, attack=0.5, release=1.0)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < c1:
                music.add(A.pizz([D3, A3, D3 + 12, A3][e % 4] + (-2 if k % 4 == 1 else 0), 0.5), te, 0.5, pan=0.3 * np.sin(e))
                music.add(A.tak(0.18), te, 1.0, pan=0.5)
        k, t = k + 1, t + BAR
    music.add(A.timpani(D2 + 12, 0.5), c0)
    music.add(A.horn(D4 - 12 + 7, 2.5, gain=0.8), 50.4)  # swell under ONE NATIONAL CENTER
    music.add(A.horn(D4 - 12 + 2, 2.5, gain=0.6), 50.4)
    wash_t = st('nation') + 8.3  # the seven emirates washed in gold together, named in constitutional order
    chord(music, [D3, A3, 62, 66, 69], wash_t, 3.2, gain=0.3, bright=2200, attack=0.6, release=1.8)
    for i, m in enumerate([74, 76, 78, 79, 81, 83, 86]):
        music.add(harmonic(m, 0.7), wash_t + 0.2 + i * 0.14, pan=0.5 * np.sin(i))
    # B09 · April 2024: the pulse stops; a cello pedal on D, one felt-piano note a bar, gentle rain; warmth toward F
    a0, a1 = st('homes'), en('homes')
    music.add(A.strings(D2 + 12, a1 - a0, bright=700, attack=1.5, release=2.5, voices=5), a0, 0.8)
    k, t = 0, a0
    while t < a1 - 0.5:
        music.add(felt([D4, A3, D4 + 3, A3, D4 - 2][k % 5], 0.8), t)
        k, t = k + 1, t + BAR
    chord(music, F, 77.6, a1 - 77.6 + 1.5, gain=0.33, bright=1400, attack=2.0, release=2.0)  # the remembrance
    sfx.add(A.rain(12.0, gain=0.9), a0 + 1.0)  # under the band of cloud crossing the map; it clears by the remembrance
    # B10–B12 · the working day: a warm chord and the oud motif as the sky clears, then the drive
    w0, w1 = st('airport'), en('energy')
    chord(music, Dmaj, w0, 2.0, gain=0.38, bright=2000, attack=0.6)
    for (t, m, d) in motif(w0, root=D4, major=True, n=4, stretch=0.7):
        music.add(A.pluck(m, 1.3, bright=0.65), t, 0.6)
    drive0 = 83.333
    k, t = 0, drive0
    while t < 95.8:
        chord(music, [Dmaj, Bm, G, Amaj][k % 4], t, min(BAR, 95.8 - t) * 1.02, gain=0.34, bright=2600, attack=0.3, release=0.6)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < 95.8:
                music.add(A.strings([D3, A3, D4, A3, D3 + 7, A3, D4, A3][e] + (0 if k % 2 == 0 else -2), BEAT * 0.45, bright=2400, attack=0.02, release=0.2, voices=3), te, 0.3)
        music.add(A.daf(0.6, jingle=False), t, 0.9)
        music.add(A.tak(0.4), t + 2 * BEAT, 0.9)
        k, t = k + 1, t + BAR
    music.add(A.horn(D4 - 12 + 9, 2.0, gain=0.7), 93.8)
    sfx.add(A.jet_far(4.5, gain=0.9), 82.2, 0.8, pan=0.2)
    sfx.add(A.ship_horn_far(0.8), st('port') + 1.0, pan=0.4)
    sfx.add(A.wind(5.0, gain=0.35, gust=0.12), st('energy'))
    # B13 · the President's card
    card(music, st('quote-president'), en('quote-president'))
    # B14–B15 · rain and science: pizzicato returns, qanun arpeggios, celesta
    r0, r1 = st('seeding'), en('science')
    k, t = 0, r0
    while t < r1 - 0.1:
        chord(music, [[D3, A3, 64, 69], [43, 55, 62, 69]][k % 2], t, BAR * 1.05, gain=0.3, bright=2300, attack=0.7)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < r1:
                music.add(A.pizz([D3, A3, D4, A3][e % 4], 0.5), te, 0.5)
                if t >= st('science') - 0.1:
                    music.add(A.qanun([74, 78, 81, 86, 81, 78, 76, 78][e], 0.8), te, 0.25, pan=0.5 * np.sin(e))
        k, t = k + 1, t + BAR
    sfx.add(turboprop_far(6.0, gain=0.9), r0 + 0.4, pan=-0.1)  # the seeding aircraft, distant, held near the screen
    sfx.add(A.rain(3.0, gain=0.4), r0 + 3.6)
    for k in range(6):
        music.add(A.bell(86 + [0, 4, 7, 12, 7, 4][k], 1.2, gain=0.35), st('science') + 0.2 + k * 0.17)  # celesta particles
    # B16 · Sheikh Mansour's card
    card(music, st('quote-mansour'), en('quote-mansour'))
    # B17 · the world, in F major: orchestra, choir, frame drums, the motif in the brass; hold for the applause
    g0, g1 = st('world'), en('world')
    split = st('gauge') - S['gauge']['xf'] / 2  # the cue-to-cue split: part 1 ends here, on B17's frame
    orch_bloom(g0, music, 1.0, root=41 - 12)
    k, t = 0, g0
    while t < g1 - 0.1:
        chord(music, [F, Bb, Dm, C][k % 4], t, BAR * 1.05, gain=0.36, bright=3000, attack=0.3)
        music.add(A.daf(0.75, jingle=True), t, 0.9)
        if t + 2 * BEAT < split - 0.1:  # no drum on or across the split
            music.add(A.daf(0.5, jingle=False), t + 2 * BEAT, 0.9)
        k, t = k + 1, t + BAR
    music.add(A.choir(65, g1 - g0 + 2.0, gain=0.45), g0)
    for (t, m, d) in motif(g0 + 0.5, root=65 - 12, major=True):
        music.add(A.horn(m, d), t, 0.7)
    chord(music, F + [69, 72, 77], 127.2, 3.4, gain=0.44, bright=3400, attack=0.25, release=2.0)  # the apex: the national line
    for t in [127.8, 128.6, 129.2, 129.8]:  # the pins
        music.add(A.timpani(41, 0.25), t)
    chord(music, F + [69], 134.6, 5.0, gain=0.3, bright=2400, attack=0.8, release=2.5)  # held under the office and name, no bloom
    # B18 · twenty years: twenty water notes on sixteenths, a timpani roll, the hit on the dominant
    t20 = st('gauge') + S['gauge']['t20']
    dt = S['gauge']['dt']
    chord(music, [D3, A3, 66], st('gauge'), t20 - st('gauge'), gain=0.26, bright=1400, attack=1.0, release=0.5)
    scale = [62, 64, 66, 67, 69, 71, 73, 74]
    for k in range(1, 21):
        m = scale[(k - 1) % 8] + 12 * ((k - 1) // 8)
        music.add(water(m + 12, 0.5 + 0.02 * k), t20 - (20 - k) * dt, pan=0.3 * np.sin(k))
    for k in range(14):
        music.add(A.timpani(A2 + 12, 0.15 + 0.04 * k), 141.67 + k * (t20 - 141.67) / 14)
    orch_bloom(t20, music, 1.0, root=A2 - 12)
    chord(music, [A2, A3, 61, 64, 69, 73], t20, 3.3, gain=0.52, bright=3400, attack=0.05, release=2.5)  # on the dominant
    music.add(A.choir(A3 + 12, 3.5, gain=0.55), t20)
    for (t, m, d) in motif(t20, root=A3, major=True, stretch=0.5, n=5):
        music.add(A.horn(m, d), t, 0.75)
    chord(music, [D3, A3, 62, 66], t20 + 3.5, 2.0, gain=0.25, bright=1300, attack=1.0, release=2.0)  # recedes
    # B19 · night: broad D major; the ring closes; the only full cadence at the title; it rings into the hold pad
    f0, f1 = st('finale'), en('finale')
    sfx.add(A.wind(f1 - f0 + 3, gain=0.6, gust=0.05), f0)
    chord(music, [D3, A3, 66, 69], f0, 153.33 - f0, gain=0.34, bright=1500, attack=2.0, release=1.2)
    music.add(A.shimmer(f1 - f0 + 2, gain=0.8, base=86), f0)
    for (t, m, d) in motif(f0 + 0.4, root=D4, major=True, stretch=0.9):
        if t < 153.2:
            music.add(A.horn(m - 12, d), t, 0.5)
            music.add(A.strings(m, d, bright=2400, attack=0.3, release=0.8, voices=5), t, 0.45)
    music.add(harmonic(D4 + 24, 0.8), 150.8)
    music.add(A.choir(D4 + 4, 4.0, gain=0.4), 150.8)
    chord(music, [D2, D3, A3, 62, 66, 69, 74], 153.33, f1 - 153.33 + 3.0, gain=0.46, bright=2200, attack=0.4, release=4.0)
    music.add(A.timpani(D2 + 12, 0.45), 153.33)
    # detent clicks at the circle locks
    for t in [18.333, 23.333, 45.0, 53.333, 111.667, st('gauge')]:
        sfx.add(detent(), t, 0.9)

    # fader rides: the loudness follows the story (quiet night, the Center's confidence, the April drop, the world's peak)
    ride = rides(cues['scenes'], DUR, {'suhail': -8, 'durour': -3, 'monsoon': -3, 'pearling': -3, 'falaj': -3,
                                       'quote-zayed': 0, 'centre': -1, 'nation': -1, 'homes': -6, 'airport': -1, 'port': 0,
                                       'energy': 0, 'quote-president': 0, 'seeding': -2, 'science': -2, 'quote-mansour': 0,
                                       'world': -2.5, 'gauge': 0.5, 'finale': -1})  # each leader's card at or above B17
    m = A.reverb(music.stereo() * ride, rt60=3.4, wet=0.3)
    f = A.reverb(sfx.stereo(), rt60=1.6, wet=0.12) * 0.9
    mix = m + f
    fade = np.ones(mix.shape[1])
    k = int(3.0 * A.SR)
    fade[-k:] = np.linspace(1, 0, k) ** 2
    m, f, mix = m * fade, f * fade, mix * fade
    web = A.master(mix, target_lufs=-16.0, ceiling_db=-1.0)
    g = np.sqrt(np.sum(web ** 2) / max(1e-12, np.sum(mix ** 2)))  # the stems carry the same overall gain as the master
    A.write_wav(f'{out_dir}/mix.wav', web)
    A.write_wav(f'{out_dir}/mix-r128.wav', A.master(mix, target_lufs=-23.0, ceiling_db=-1.0))
    A.write_wav(f'{out_dir}/music.wav', np.clip(m * g, -1, 1))
    A.write_wav(f'{out_dir}/sfx.wav', np.clip(f * g, -1, 1))
    # the two parts of the cue-to-cue run, each with a short equal-power edge so the media server's crossfade is clean
    n, k = int(round(split * A.SR)), int(0.3 * A.SR)
    p1, p2 = web[:, :n].copy(), web[:, n:].copy()
    p1[:, -k:] *= np.cos(np.linspace(0, np.pi / 2, k)); p2[:, :k] *= np.sin(np.linspace(0, np.pi / 2, k))
    A.write_wav(f'{out_dir}/part1.wav', p1)
    A.write_wav(f'{out_dir}/part2.wav', p2)
    print(f'mix: {A.lufs(web):.1f} LUFS, {A.true_peak_db(web):.1f} dBTP, {web.shape[1] / A.SR:.1f} s')
    hold(out_dir)
    hold_world(out_dir)


def card(bus, t0, t1, major=True):
    """a leader's card: strings on the tonic, the Suhail motif slowly in the horn, a wordless choir; no percussion"""
    chord(bus, [D2 + 12, A2 + 12, 62, 66 if major else 65, 69], t0, t1 - t0 + 0.8, gain=0.36, bright=2000, attack=1.6, release=1.8)
    bus.add(A.choir(D3 + 12, t1 - t0 - 0.4, vowel='o', gain=0.4), t0 + 0.4)
    for (t, m, d) in motif(t0 + 1.0, root=D4 - 12, major=major, stretch=1.3):
        if t < t1 - 0.6:
            bus.add(A.horn(m, d, gain=0.8), t, 0.55)


def hold_world(out_dir, L=12.0):
    """the applause bed after B17: B17's closing F major, held and seamless, for the show caller to release"""
    bus = A.Bus(L * 3)
    for k in range(3):
        t0 = k * L
        chord(bus, F + [69], t0 - 2.0, L + 4.0, gain=0.3, bright=2400, attack=2.0, release=2.0)
        bus.add(A.choir(65, L + 3.0, gain=0.3), t0 - 1.5)
        bus.add(A.shimmer(L + 4.0, gain=0.5, base=89), t0 - 2.0)
    x = A.reverb(bus.stereo(), rt60=3.4, wet=0.3)
    A.write_wav(f'{out_dir}/hold-world.wav', A.master(seamless(x, L), target_lufs=-20.0, ceiling_db=-2.0))


def rides(scenes, dur, db, ramp=1.6):
    n = int(round(dur * A.SR))
    lv = np.zeros(n)
    for s in scenes:
        lv[int(s['start'] * A.SR):] = db.get(s['id'], 0)
    k = int(ramp * A.SR)
    ker = np.hanning(k)
    ker /= ker.sum()
    lv = np.convolve(np.pad(lv, (k, k), mode='edge'), ker, mode='same')[k:-k]
    return 10 ** (lv / 20)


def hold(out_dir, L=20.0):
    """a seamless 20 s loop for the stage hold: the finale's D major pad and starlight, built periodic"""
    bus = A.Bus(L * 3)
    for k in range(3):
        t0 = k * L
        chord(bus, [D2, A2, D3, A3, 66, 69], t0 - 2.0, L + 4.0, gain=0.3, bright=1300, attack=2.0, release=2.0)
        bus.add(A.shimmer(L + 4.0, gain=0.7, base=86), t0 - 2.0)
        for dt, m in [(3.0, 74), (5.5, 78), (9.0, 81), (14.0, 78)]:
            bus.add(A.pluck(m, 2.5), t0 + dt, 0.3)
        bus.add(A.wind(L + 4.0, gain=0.3, gust=0.05), t0 - 2.0)
    x = A.reverb(bus.stereo(), rt60=3.4, wet=0.35)
    A.write_wav(f'{out_dir}/hold.wav', A.master(seamless(x, L), target_lufs=-24.0, ceiling_db=-3.0))


def seamless(x, L, xfade=1.5):
    """one cycle of length L from the middle of a three-cycle render, its last `xfade` seconds crossfaded (equal power)
    into the audio that originally led into its first sample, so the end runs into the start without a click"""
    n, k = int(L * A.SR), int(xfade * A.SR)
    loop = x[:, n:2 * n].copy()
    w = np.linspace(0, np.pi / 2, k)
    loop[:, n - k:] = loop[:, n - k:] * np.cos(w) + x[:, n - k:n] * np.sin(w)
    return loop


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '.')
