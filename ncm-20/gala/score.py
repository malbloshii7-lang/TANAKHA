#!/usr/bin/env python3
"""Temp score for the gala edition of "Reading the Sky", to the music brief in TREATMENT.md §8.

    python3 score.py cues.json out-dir/      (cues.json: `node render.js cues cues.json`)

It writes 48 kHz 24-bit WAVs:
  mix.wav (-16 LUFS integrated, -1 dBTP, for review and online) and mix-r128.wav (-23 LUFS, for broadcast);
  music.wav, perc.wav and sfx.wav, the stems (perc is the Emirati percussion, kept apart so it can be dropped);
  mix-restrained.wav, the same score without drums, tus or jahla, for a ceremony held in Ramadan or in a period of
  mourning (TREATMENT.md §8);
  hold.wav (a seamless 20 s loop for the stage hold).
Every cue is placed from its beat's start in the film's own timeline, so the music stays on the cuts when the film is
re-cut. It is the temp track for the animatic; the brief asks for an original score, recorded live with UAE troupes.

The Emirati colour follows the music research (UNESCO, DCT Abu Dhabi, the Sharjah Institute for Heritage, New Grove):
  - the drums of Al Ayyala (the ras, three takhamir, the tar frame drum, the tus cymbals) carry the day: the Center,
    the seven emirates and the rail (lab/bed.py, over the diesel as the locomotive passes). Nights have no drums:
    voices and strings only;
  - the rababa, the Bedouin poet's fiddle, replaces the ney; the oud replaces the qanun (neither the ney nor the qanun
    has a traditional link to the area); the jahla, the clay water jar the sailors played, is the sea under the dhow;
  - the night open, the close of the heritage and the finale have a lead answered by a group, hummed, without words
    (only the principle of Al Azi and Al Taghrooda, never their melodies).
  Left out on purpose: Al Harbiya and Al Razfa (war and victory), Liwa and the zaffa (weddings), the habban, the manior
  and any anthem, song, poem or nahma text. Every drum pattern here is a programming sketch that fits the verified
  meter and the instruments' roles, not a transcription: the troupe replaces it with its own.

One motif, "Suhail": D, E half-flat, F, G (maqam Bayati on D) in the heritage; tempered D Dorian for the Center;
a bare D pedal for April 2024, with no Emirati percussion and nothing festive, holding still while the red alert is
held; a low D for the rail's emergence, the Ayyala at its pass and silence as the camera rises; and D major, with the
motif as D-E-F#-G on the rababa, for the finale, whose tonic chord is the only full cadence. 72 BPM, one bar = 3.333 s. Nothing imitates a siren, an alert tone, a horn, thunder, a boom or an
impact, and the rail has no jointed-track clack (Etihad Rail's main line is continuously welded).
"""
import json
import os
import sys

import numpy as np

import audio as A

BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
D2, A2, D3, A3, D4 = 38, 45, 50, 57, 62
EHF = 63.5  # E half-flat (Bayati)

# voicings (MIDI)
Dmaj, Bm, G, Amaj = [50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]
Dm7, Gsus, Csus = [50, 57, 60, 65], [43, 55, 60, 62], [48, 55, 60, 62]  # D Dorian colours
F, C, Dm, Bb = [41, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 58, 62, 65]

# the motif and its continuation, in beats: (MIDI offset above the root, beats)
BAYATI = [(0, 1.5), (1.5, 0.5), (3, 1), (5, 1), (7, 2), (5, 0.5), (3, 0.5), (1.5, 1), (0, 2)]
MAJOR = [(0, 1.5), (2, 0.5), (4, 1), (5, 1), (7, 2), (5, 0.5), (4, 0.5), (2, 1), (0, 2)]

# drum dynamics, and the players' own small unevenness (seeded, so the score renders the same every time)
LEVEL = {'pp': 0.3, 'mp': 0.45, 'mf': 0.6, 'f': 0.8}
feel = np.random.default_rng(72)

# Patterns on a bar of sixteenths (0-15): (sixteenth, stroke, weight). Sketches, not transcriptions (see above).
# Coastal Ayyala in 4/4: the ras (lead drum) on 1 and 3 and a light rim stroke before the bar; the takhamir, stick
# strokes on the off-beats and hand strokes on 2 and 4; the tar and the tus on 2 and 4.
RAS = [(0, 'ras', 1.0), (8, 'ras', 0.85), (14, 'rim', 0.3)]
TAKHAMIR = [(i, 'stick', 0.45) for i in (2, 6, 10, 14)] + [(i, 'hand', 0.35) for i in (4, 12)]
TAR = [(4, 'tar', 0.5), (12, 'tar', 0.5)]
TUS = [(4, 'tus', 0.6), (12, 'tus', 0.6)]
AYYALA = RAS + TAKHAMIR + TAR + TUS
# the Gulf sawt: the mirwas, open and muted, and two groups of claps interlocking
SAWT = [(0, 'mirwas', 0.8), (6, 'mirwas', 0.7), (10, 'mirwas', 0.7), (4, 'muted', 0.6), (12, 'muted', 0.6), (14, 'muted', 0.5)] + \
       [(i, 'clapA', 0.6) for i in (2, 6, 10, 14)] + [(i, 'clapB', 0.45) for i in (3, 7, 11, 15)]
# the sea songs ashore: the jahla's deep stroke on 1, finger strokes, the two clap groups
SEA = [(0, 'jahla', 1.0), (6, 'finger', 0.5), (14, 'finger', 0.5)] + \
      [(i, 'clapA', 0.5) for i in (2, 6, 10, 14)] + [(i, 'clapB', 0.4) for i in (3, 7, 11, 15)]


def motif(t0, root=D4, major=False, stretch=1.0, n=None):
    out, t = [], t0
    for iv, beats in (MAJOR if major else BAYATI)[:n]:
        out.append((t, root + iv, beats * BEAT * stretch))
        t += beats * BEAT * stretch
    return out


def chord(bus, notes, t, dur, **kw):
    A.chord(bus, notes, t, dur, **kw)


def next_bar(t):
    """the first downbeat of the film's bar grid at or after t"""
    return np.ceil(t / BAR - 1e-6) * BAR


def at16(t0, i):
    """the onset of sixteenth i in the bar that starts at t0, with the Peninsula drummers' 'limp': the off-beat eighths
    sit between straight and triplet time, a little behind the beat (Urkevich 2015 gives no number; set it by ear)"""
    return t0 + i * S16 + {1: 0.02, 2: 0.055, 3: 0.03}.get(i % 4, 0.0) + feel.normal(0, 0.004)


def stroke(perc, kind, t, g, i=0):
    """one stroke on the Emirati percussion bus"""
    side = (-0.45, 0.0, 0.45)[i // 4 % 3]  # the three takhamir stand in a row
    if kind == 'ras':
        perc.add(A.tabl(g, 'dum'), t, pan=-0.05)
    elif kind == 'rim':
        perc.add(A.tabl(g, 'tak'), t, pan=-0.05)
    elif kind == 'stick':
        perc.add(A.tabl(g * 0.7, 'tak'), t, pan=side)
    elif kind == 'hand':
        perc.add(A.lp(A.tabl(g, 'tak'), 1400), t, pan=side)
    elif kind == 'tar':
        perc.add(A.daf(g * 0.8, jingle=True), t, pan=0.25)
    elif kind == 'tus':
        perc.add(A.tus(g * 1.6), t, pan=0.35)
    elif kind == 'mirwas':
        perc.add(A.mirwas(g, open_=True), t, pan=-0.3)
    elif kind == 'muted':
        perc.add(A.mirwas(g, open_=False), t, pan=-0.3)
    elif kind in ('clapA', 'clapB'):
        perc.add(A.clap(g * 3.0, people=6), t, pan=-0.5 if kind == 'clapA' else 0.5)  # the two groups face each other
    elif kind == 'jahla':
        perc.add(A.jahla(g), t, pan=0.1)
    elif kind == 'finger':
        perc.add(A.hp(A.jahla(g * 0.6), 180), t, pan=0.1)


def play(perc, pattern, grid0, t_from, t_to, level='mf', drop=()):
    """a pattern on the bar grid that starts at grid0, sounding only from t_from to t_to (no stroke starts at t_to or
    after, so nothing crosses a card or a split); `drop` leaves out strokes by name"""
    g = LEVEL[level] if isinstance(level, str) else level
    b = grid0
    while b < t_to:
        for i, kind, w in pattern:
            t = at16(b, i)
            if kind not in drop and t_from <= t < t_to:
                stroke(perc, kind, t, w * g, i)
        b += BAR


def takhmeera(perc, t_down, level='mf'):
    """the ras player's preliminary strokes that bring the ensemble in on the downbeat t_down"""
    g = LEVEL[level] if isinstance(level, str) else level
    for b, w in [(-1.0, 0.5), (-0.5, 0.7), (-0.25, 0.9)]:
        perc.add(A.tabl(g * w, 'dum'), t_down + b * BEAT, pan=-0.05)


def hum(m, dur, men=8):
    """men humming with closed lips (the chant voice, darkened), as one mono group"""
    return A.lp(A.chant(m, dur, men=men, vowel='o'), 900, 2).sum(0) * 0.7


def answer(bus, t, lead, group, gain=1.0, dur=(2.2, 2.6)):
    """a lead answered by a group, wordless: the lead's few voices on one side, the group on the other, as the two rows
    stand. Only the principle of Al Azi and Al Taghrooda; never their melodies or their names."""
    bus.add(hum(lead, dur[0], men=3), t, 0.9 * gain, pan=-0.4)
    for m in group:
        bus.add(hum(m, dur[1], men=9), t + dur[0] + 0.2, gain / np.sqrt(len(group)), pan=0.4)


def rab(bus, t, m, d, gain=1.0, grace=None, pan=-0.15):
    """one rababa note; `grace` is a short note bowed just before it, the ornament a Bedouin player adds"""
    if grace is not None:
        bus.add(A.rababa(grace, 0.09, gain=gain * 0.8), t - 0.11, pan=pan)
    bus.add(A.rababa(m, d, gain=gain), t, pan=pan)


def nahham(contour, gain=1.0):
    """the nahham's call, wordless (the traditional texts are partly devotional, so no words at all): one male voice,
    high and open, gliding between the pitches in `contour`, a list of (seconds, MIDI) keyframes"""
    n = int((contour[-1][0] + 0.4) * A.SR)
    t = np.arange(n) / A.SR
    ks, ms = zip(*contour)
    m = np.interp(t, ks, ms)
    held = np.abs(np.gradient(m)) < 1e-4
    f = A.hz(m) * (1 + 0.011 * held * np.sin(2 * np.pi * 5.6 * t))
    src = A.saw(f, n) + 0.06 * A.noise(n)
    form = [(700, 110), (1150, 140), (2600, 220)]  # an open 'aa'
    v = sum(A.bp(src, c - w, c + w, 2) * a for (c, w), a in zip(form, (1.0, 0.6, 0.35)))
    return v * A.adsr(n, 0.12, 0.2, 0.9, 0.4) * 0.3 * gain


def detent():
    """a small, soft brass click for each circle lock"""
    n = int(0.12 * A.SR)
    t = np.arange(n) / A.SR
    return (A.bp(A.noise(n), 2500, 7000, 2) * np.exp(-t * 90) * 0.5 + np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 60) * 0.2) * 0.25


def harmonic(m, gain=1.0):
    """a harp harmonic: a pure, bright partial with a quick pluck"""
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
    hum_ = sum(a * np.sin(k * ph) for k, a in [(1, 1.0), (2, 0.45), (3, 0.22), (4, 0.1)])
    air = A.bp(A.noise(n), 200, 1400, 2) * 0.35
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return A.lp(hum_ * 0.5 + air, 900, 2) * env * 0.05 * gain


def diesel_far(dur, gain=1.0):
    """a freight train passing at a distance: the diesel's low firing rumble (a 16-cylinder two-stroke at 900 rpm fires
    240 times a second, on a 15 Hz crank beat) and the smooth roll of steel wheels on welded rail; no horn, no clack"""
    n = int(dur * A.SR)
    t = np.arange(n) / A.SR
    crank = 2 * np.pi * 15.0 * t
    s = sum(np.sin(k * crank + k * 1.7) / np.sqrt(k) for k in range(1, 17))
    fire = np.sin(2 * np.pi * 240 * t) * (0.6 + 0.4 * np.sin(crank))
    roll = A.bp(A.noise(n), 80, 900, 2) * 0.6
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 0.8
    return A.lp(A.lp(s, 400, 2) * 0.25 + fire * 0.12 + roll, 700, 2) * env * 0.09 * gain


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
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lab'))
    import bed  # the rail hero's sound, placed from its shot keys (lab/bed.py)
    cues = json.load(open(cues_path))
    DUR = cues['duration'] + 3.5
    music, perc, sfx = A.Bus(DUR), A.Bus(DUR), A.Bus(DUR)
    S = {s['id']: s for s in cues['scenes']}
    st = lambda i: S[i]['start']
    en = lambda i: S[i]['start'] + S[i]['dur']
    hold_ = -S['suhail']['offset']  # the black sky held before the Suhail scene's own clock begins

    # Act 1 · B01 · night: the black sky held (wind and the low drone only), then starlight; a hummed lead and its
    # answer; the rababa states the motif as Suhail clears the dunes; the ring tone. No drums at night.
    t_end = en('suhail')
    sfx.add(A.wind(t_end + 3, gain=0.9, gust=0.05), 1.5)
    music.add(A.strings(D2, t_end - 1.0, bright=600, attack=3.5, release=3.0, voices=5), 1.5, 0.85)
    music.add(A.strings(A2, t_end - 2.0 - hold_, bright=700, attack=4.0, release=3.0, voices=5), 2.5 + hold_, 0.5)
    for k, (dt, m) in enumerate([(2.2, 86), (3.4, 93), (4.9, 88), (6.1, 91), (7.2, 86)]):
        music.add(A.bell(m, 2.5, gain=0.45), hold_ + dt, pan=0.6 * np.sin(k * 2.1))  # celesta glints on the brightest stars
    answer(music, st('suhail') + hold_ + 2.9, D3, [A2, D3], gain=0.45, dur=(2.3, 2.6))
    sm = motif(st('suhail') + hold_ + 8.333, root=D4, n=4)
    for j, (t, m, d) in enumerate(sm):
        rab(music, t, m, d * (1.4 if j == len(sm) - 1 else 1.0), gain=0.8, grace=EHF if j == 0 else None)
    music.add(harmonic(D4 + 24, 0.8), st('suhail') + hold_ + 9.2)

    # B02–B03 · heritage in Bayati: first light chord, the oud's ostinato and motif, one soft tar stroke a bar; the star
    # and the dhow (the jahla as the sea), then the falaj
    h0, h1 = st('monsoon'), en('falaj')
    name_t = st('falaj') + 4.6  # Sheikh Zayed's name in VO-05: the percussion is out before it
    chord(music, [D3, A3, 62, 69], h0 - 1.0, 5.0, gain=0.5, bright=2000, attack=2.5)
    music.add(harmonic(D4 + 12, 0.6), h0)
    t = h0
    while t < h1 - 0.1:
        for b, m in [(0, D3), (0.5, A2 + 12), (1, D3 + 3), (1.5, A2 + 12), (2, D3 + 5), (2.5, D3 + 3), (3, D3 + 1.5), (3.5, A2 + 12)]:
            tb = t + b * BEAT
            if tb < h1 - 0.05:
                music.add(A.pluck(m, 1.1, bright=0.5), tb, 0.5, pan=-0.25)
        if t < name_t - 1.0:
            perc.add(A.daf(0.4, jingle=False), t, 0.8, pan=0.2)
        t += BAR
    chord(music, [D2, D3, A3], h0 + 2.0, h1 - h0 - 1.0, gain=0.3, bright=1200, attack=2.0, release=2.0)
    for (t, m, d) in motif(h0 + BAR, root=D4):
        music.add(A.pluck(m, max(1.2, d + 0.6), bright=0.6), t, 0.7, pan=-0.2)
    for k, m in enumerate([D4, D4 + 1.5, D4 + 3, D4 + 5, D4 + 7]):  # an oud run into the circle's lock
        music.add(A.pluck(m, 0.9, bright=0.75), h0 - 0.35 + k * 0.07, 0.4, pan=0.3)
    for b in (0, 2, 4, 8, 10):  # the monsoon voyage: the jahla's deep stroke as the sea
        perc.add(A.jahla(0.55), st('monsoon') + 1.4 + b * BEAT, pan=0.15)
    sfx.add(A.sea(en('monsoon') - st('monsoon') + 1.5, gain=0.8), st('monsoon'))
    # the falaj, inland and calm: the rababa descends before Sheikh Zayed's name; a chord under the name
    sfx.add(stream(en('falaj') - st('falaj') + 1.0), st('falaj'))
    for j, (iv, bt) in enumerate([(7, 1.5), (5, 1), (3, 1), (1.5, 0.5), (0, 2)]):
        tj = st('falaj') + 0.4 + sum(b for _, b in [(7, 1.5), (5, 1), (3, 1), (1.5, 0.5), (0, 2)][:j]) * BEAT * 0.7
        rab(music, tj, D4 + iv, bt * BEAT * 0.7 * (1.3 if j == 4 else 1.0), gain=0.55, grace=D4 + iv + 2 if j == 0 else None)
    chord(music, [D3, A3, 62, 65], name_t, 4.0, gain=0.38, bright=1500, attack=1.5, release=2.0)
    answer(music, en('falaj') - 4.2, D3, [A2, D3], gain=0.4, dur=(2.2, 2.6))  # the heritage closes on the night's answer

    # Act 2 · B04–B05 · the Center (D Dorian): the ras player's takhmeera brings the Ayyala drums in, pianissimo, on
    # the first downbeat after the iris (ras and takhamir only); the seven emirates lit together get one tar and tus
    # stroke
    c0, c1 = st('centre'), en('nation')
    prog_ = [Dm7, Csus, Gsus, Dm7]
    k, t = 0, c0
    while t < c1 - 0.1:
        chord(music, prog_[k % 4], t, BAR * 1.05, gain=0.3, bright=1900 + 150 * k, attack=0.5, release=1.0)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < c1:
                music.add(A.pizz([D3, A3, D3 + 12, A3][e % 4] + (-2 if k % 4 == 1 else 0), 0.5), te, 0.5, pan=0.3 * np.sin(e))
        k, t = k + 1, t + BAR
    pulse0 = next_bar(c0 + 0.8)  # after the iris has settled
    wash_t = st('nation') + 8.3  # the seven emirates washed in gold together, named in constitutional order
    takhmeera(perc, pulse0, 'pp')
    play(perc, RAS + TAKHAMIR, pulse0, pulse0, wash_t - 0.1, 'pp')
    music.add(A.horn(D4 - 12 + 7, 2.5, gain=0.8), st('centre') + 3.6)  # swell under ONE NATIONAL CENTER
    music.add(A.horn(D4 - 12 + 2, 2.5, gain=0.6), st('centre') + 3.6)
    chord(music, [D3, A3, 62, 66, 69], wash_t, 3.2, gain=0.3, bright=2200, attack=0.6, release=1.8)
    stroke(perc, 'tar', wash_t, 0.6)
    stroke(perc, 'tus', wash_t, 0.6)
    for i, m in enumerate([74, 76, 78, 79, 81, 83, 86]):
        music.add(harmonic(m, 0.7), wash_t + 0.2 + i * 0.14, pan=0.5 * np.sin(i))

    # B06 · April 2024: the pulse stops; a cello pedal on D, one felt-piano note a bar, gentle rain. The red alert is a
    # held frame, so the music holds too: no new note while the storm's clock is stopped, only the pedal and the rain.
    # Then warmth toward F under the remembrance. No Emirati percussion, no claps, no voices: nothing festive.
    a0, a1 = st('homes'), en('homes')
    rh0, rh1 = a0 + 7.5, a0 + 12.5  # the held frame (timeline.js RED_HOLD)
    music.add(A.strings(D2 + 12, a1 - a0, bright=700, attack=1.5, release=2.5, voices=5), a0, 0.8)
    k, t = 0, a0
    while t < a1 - 0.5:
        if not (rh0 - 0.2 < t < rh1):
            music.add(felt([D4, A3, D4 + 3, A3, D4 - 2][k % 5], 0.8), t)
        k, t = k + 1, t + BAR
    rem = a0 + 17.3  # the remembrance (VO-08c), as the paper warms again
    chord(music, F, rem, a1 - rem + 1.5, gain=0.33, bright=1400, attack=2.0, release=2.0)
    sfx.add(A.rain(17.0, gain=0.9), a0 + 1.0)  # under the band of cloud crossing the map; it clears by the remembrance

    # Act 3 · B07 · Etihad Rail in engraved 3D: the bass as the train emerges, the Ayyala over the diesel at the
    # worm's-eye pass, the last stroke as the camera rises, then silence (lab/bed.py, placed from the shot keys)
    rail_pass, rail_front = bed.build(perc, music, sfx, st('rail3d'))

    # Act 4 · B08–B09 · rain and science: pizzicato with soft, muted mirwas; the oud in tremolo; celesta
    r0, r1 = st('seeding'), en('science')
    k, t = 0, r0
    while t < r1 - 0.1:
        chord(music, [[D3, A3, 64, 69], [43, 55, 62, 69]][k % 2], t, BAR * 1.05, gain=0.3, bright=2300, attack=0.7)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < r1:
                music.add(A.pizz([D3, A3, D4, A3][e % 4], 0.5), te, 0.5)
                if t >= st('science') - 0.1:
                    m = [62, 66, 69, 74, 69, 66, 64, 66][e]
                    for q in (0, 0.5):
                        music.add(A.pluck(m, 0.6, bright=0.6), te + q * BEAT / 2, 0.22, pan=0.4 * np.sin(e))
        k, t = k + 1, t + BAR
    play(perc, [(4, 'muted', 0.5), (12, 'muted', 0.5), (14, 'muted', 0.3)], r0, r0 + 0.5, r1 - 0.8, 'mp')
    sfx.add(turboprop_far(6.0, gain=0.9), r0 + 0.4, pan=-0.1)  # the seeding aircraft, distant, held near the screen
    sfx.add(A.rain(3.0, gain=0.4), r0 + 3.6)
    for k in range(6):
        music.add(A.bell(86 + [0, 4, 7, 12, 7, 4][k], 1.2, gain=0.35), st('science') + 0.2 + k * 0.17)  # celesta particles

    # Act 5 · B10 · night over the capital: broad D major, no drums; the rababa carries the motif under the dedication,
    # the voices answer, the ring closes; the only full cadence at the title; it rings into the hold pad
    f0, f1 = st('finale'), en('finale')
    title = f0 + 11.0  # timeline.js FIN.title
    sfx.add(A.wind(f1 - f0 + 3, gain=0.6, gust=0.05), f0)
    chord(music, [D3, A3, 66, 69], f0, title - f0, gain=0.34, bright=1500, attack=2.0, release=1.2)
    music.add(A.shimmer(f1 - f0 + 2, gain=0.8, base=86), f0)
    for j, (t, m, d) in enumerate(motif(f0 + 2.0, root=D4, major=True, stretch=1.05)):
        if t < title - 0.13:
            rab(music, t, m, min(d, title - t), gain=0.75, grace={0: EHF, 4: 71}.get(j))
            music.add(A.strings(m - 12, d, bright=1800, attack=0.4, release=0.8, voices=5), t, 0.25)
    music.add(harmonic(D4 + 24, 0.8), f0 + 2.467)
    answer(music, f0 + 2.467, D3, [A2, D3], gain=0.45, dur=(1.1, 1.3))
    chord(music, [D2, D3, A3, 62, 66, 69, 74], title, f1 - title + 3.0, gain=0.46, bright=2200, attack=0.4, release=4.0)
    music.add(A.timpani(D2 + 12, 0.45), title)

    # detent clicks where one circle locks onto the next (the plates' own rings and the irises)
    for sid in ['monsoon', 'centre', 'nation', 'science']:
        sfx.add(detent(), st(sid), 0.9)

    # fader rides: the loudness follows the story (the quiet night and heritage, the Center's confidence, the April
    # drop, the rail at full height, the rain, the night again)
    ride = rides(cues['scenes'], DUR, {'suhail': -8, 'monsoon': -3, 'falaj': -3, 'centre': -1, 'nation': -1, 'homes': -6,
                                       'rail3d': 0, 'seeding': -2, 'science': -2, 'finale': -1})
    m = A.reverb(music.stereo() * ride, rt60=3.4, wet=0.3)
    p = A.reverb(A.hp(perc.stereo() * ride, 40, 2), rt60=1.8, wet=0.18)  # the drums outdoors: a shorter room; no sub
    f = A.reverb(sfx.stereo(), rt60=1.6, wet=0.12) * 0.9
    fade = np.ones(m.shape[1])
    k = int(3.0 * A.SR)
    fade[-k:] = np.linspace(1, 0, k) ** 2
    m, p, f = m * fade, p * fade, f * fade
    web = deliver(m + p + f, out_dir, '', None)
    g = np.sqrt(np.sum(web ** 2) / max(1e-12, np.sum((m + p + f) ** 2)))  # the stems carry the master's overall gain
    A.write_wav(f'{out_dir}/mix-r128.wav', A.master(m + p + f, target_lufs=-23.0, ceiling_db=-1.0))
    A.write_wav(f'{out_dir}/music.wav', np.clip(m * g, -1, 1))
    A.write_wav(f'{out_dir}/perc.wav', np.clip(p * g, -1, 1))
    A.write_wav(f'{out_dir}/sfx.wav', np.clip(f * g, -1, 1))
    deliver(m + f, out_dir, '-restrained', None)
    lv = {s['id']: A.lufs(web[:, int(s['start'] * A.SR):int((s['start'] + s['dur']) * A.SR)]) for s in cues['scenes']}
    print('per beat (LUFS):', ', '.join(f'{i} {v:.1f}' for i, v in lv.items()))
    print(f'rail: engine abeam at {st("rail3d") + rail_pass:.2f} s, front abeam at {st("rail3d") + rail_front:.2f} s (film time)')
    hold(out_dir)


def deliver(mix, out_dir, tag, split):
    """master a mix (-16 LUFS, -1 dBTP) and write it whole, and (given a split) as the two parts of a cue-to-cue run,
    each part with a short equal-power edge so the media server's crossfade is clean"""
    web = A.master(mix, target_lufs=-16.0, ceiling_db=-1.0)
    A.write_wav(f'{out_dir}/mix{tag}.wav', web)
    if split:  # a cut with a cue-to-cue break (none in the locked order's cut)
        n, k = int(round(split * A.SR)), int(0.3 * A.SR)
        p1, p2 = web[:, :n].copy(), web[:, n:].copy()
        p1[:, -k:] *= np.cos(np.linspace(0, np.pi / 2, k))
        p2[:, :k] *= np.sin(np.linspace(0, np.pi / 2, k))
        A.write_wav(f'{out_dir}/part1{tag}.wav', p1)
        A.write_wav(f'{out_dir}/part2{tag}.wav', p2)
    print(f'mix{tag}: {A.lufs(web):.1f} LUFS, {A.true_peak_db(web):.1f} dBTP, {web.shape[1] / A.SR:.1f} s')
    return web


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
    """a seamless 20 s loop for the stage hold: the finale's D major pad and starlight, with one soft rababa phrase,
    built periodic"""
    bus = A.Bus(L * 3)
    for k in range(3):
        t0 = k * L
        chord(bus, [D2, A2, D3, A3, 66, 69], t0 - 2.0, L + 4.0, gain=0.3, bright=1300, attack=2.0, release=2.0)
        bus.add(A.shimmer(L + 4.0, gain=0.7, base=86), t0 - 2.0)
        for dt, m in [(3.0, 74), (5.5, 78), (9.0, 81), (14.0, 78)]:
            bus.add(A.pluck(m, 2.5), t0 + dt, 0.3)
        for dt, m, d, gr in [(6.5, 69, 2.2, 71), (9.0, 66, 1.6, None), (11.0, 62, 3.2, 63.5)]:
            rab(bus, t0 + dt, m, d, gain=0.3, grace=gr)
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
