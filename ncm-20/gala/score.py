#!/usr/bin/env python3
"""Temp score for the gala edition of "Reading the Sky", to the music brief in TREATMENT.md §8.

    python3 score.py cues.json out-dir/      (cues.json: `node render.js cues cues.json`)
    python3 score.py cues.json out-dir/ --samples DIR      (the orchestra recorded: VSCO-2 CE samples, see sampler.py)

It writes 48 kHz 24-bit WAVs:
  mix.wav (-16 LUFS integrated, -1 dBTP, for review and online) and mix-r128.wav (-23 LUFS, for broadcast);
  music.wav, perc.wav and sfx.wav, the stems (perc is the Emirati percussion, kept apart so it can be dropped);
  part1.wav / part2.wav, the mix split at the end of the world beat for the cue-to-cue run;
  mix-restrained.wav with part1-restrained.wav / part2-restrained.wav, the same score without drums, tus, claps or
  jahla, for a ceremony held in Ramadan or in a period of mourning (TREATMENT.md §8);
  hold.wav (a seamless 20 s loop for the stage hold) and hold-world.wav (a seamless 12 s bed for the applause after
  the world beat, which the show caller releases).
Every cue is placed from its beat's start in the film's own timeline, so the music stays on the cuts when the film is
re-cut. It is the temp track for the animatic; the brief asks for an original score, recorded live with UAE troupes.

The Emirati colour follows the music research (UNESCO, DCT Abu Dhabi, the Sharjah Institute for Heritage, New Grove):
  - the drums of Al Ayyala (the ras, three takhamir, the tar frame drum, the tus cymbals) carry the day: the Center,
    the seven emirates, the working day and the world. Nights have no drums: voices and strings only;
  - the rababa, the Bedouin poet's fiddle, replaces the ney; the oud replaces the qanun (neither the ney nor the qanun
    has a traditional link to the area);
  - the pearling beat has a wordless nahham call over the crew's drone two octaves below it, with two groups of
    handclaps and the jahla, the clay water jar the sailors played;
  - the port has the mirwas and interlocking claps of the Gulf sawt; the drums rest under the tanker, where only the
    jahla and the crew's drone play (no Ayyala under a ship in the 2026 context);
  - the night open, every leader's card and the finale have a lead answered by a group, hummed, without words (only
    the principle of Al Azi and Al Taghrooda, never their melodies). Every card gets exactly the same treatment.
  Left out on purpose: Al Harbiya and Al Razfa (war and victory), Liwa and the zaffa (weddings), the habban, the manior
  and any anthem, song, poem or nahma text. Every drum pattern here is a programming sketch that fits the verified
  meter and the instruments' roles, not a transcription: the troupe replaces it with its own.

One motif, "Suhail": D, E half-flat, F, G (maqam Bayati on D) in the heritage; tempered D Dorian for the Center;
a bare D pedal for April 2024, with no Emirati percussion and nothing festive; F major for the world, whose apex is the
national line ("from the skies of the Emirates to the world"), never a person's name; the leaders' cards carry the
motif in full strings, horn and voices, as much weight as any beat; the twenty-year hit on the dominant (A), so it
opens rather than ends; and D major, with the motif as D-E-F#-G on the rababa, for the finale, whose tonic chord is the
only full cadence. 72 BPM, one bar = 3.333 s. Nothing imitates a siren, an alert tone, a horn, thunder, a boom or an
impact, and the rail has no jointed-track clack (Etihad Rail's main line is continuously welded).
"""
import contextlib
import json
import sys

import numpy as np

import audio as A

FOLEY = None  # foley.py, when --foley installs it: recorded sound effects and drums, and the layers only they have
# the arrival's moments on its plate's clock (scenes/r11-airport.js), for its pass with --foley: abeam the camera (on a
# survey mast's platform 12 m up, 240 m left of the centreline, 240 m past the threshold) and the main gear's touchdown
# (298 m in)
JET_CLOSE, JET_DOWN, JET_SIDE, JET_EAR = 2.09, 2.95, 240.0, 12.0

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


# Revision 11's finale (scenes/night-finale.js FIN11), on the finale's own clock: NCM's King Air crosses the frieze right
# to left at one height (its nose enters, its tail leaves, and it crosses the screen's centre), then the rain begins over
# the Hajar beyond the city, veil by veil, right to left (the first veil at FIN_RAIN, the last 1.1 s later, each full 3 s on)
FIN_AIR = (1.6, 5.0, 3.31)
FIN_RAIN = 3.77


@contextlib.contextmanager
def seeds_aside():
    """make new sounds without advancing the score's seeded generators (audio.rng, and foley's own once installed), so
    every sound made after them renders as it did before they were added"""
    gens = [A.rng] + ([FOLEY.frng] if FOLEY else [])
    states = [g.bit_generator.state for g in gens]
    try:
        yield
    finally:
        for g, state in zip(gens, states):
            g.bit_generator.state = state


def finale_pass(dur):
    """the King Air's pass as heard, dur seconds centred on its closest approach. The recorded-sound model (foley.py)
    delays a pass by its length over the speed of sound (5.1 s at its 1.75 km), so it is made long enough for the sound
    to arrive and cut around the arrival; the synthesized one has no delay"""
    if not FOLEY:
        return turboprop_far(dur)
    delay = np.hypot(1500.0, 900.0 - 1.6) / FOLEY.C  # foley.turboprop_far's path: 1.5 km off, 900 m up; the ear 1.6 m
    D = dur + 2 * delay + 3.5  # the cut must start after the first sound arrives and end before the clip's fade
    y = turboprop_far(D).mean(axis=0)
    c, h = int((D / 2 + delay) * A.SR), int(dur / 2 * A.SR)
    return y[c - h:c + h]


def finale_r11(sfx, music, sc, f0, f1):
    """Revision 11's finale: the King Air's pass, far and faint, carried across the stereo field right to left as it
    crosses the screen; then distant rain on the left, under the cloud, growing in as the veils do and held to the end
    (the film's fade takes it out). Each is set against the finale's own music: the aircraft 15 dB under it, the rain
    18 dB under it once full, both well above the night wind and never over the music"""
    ref = A.lufs(music.stereo()[:, int(f0 * A.SR):int(f1 * A.SR)])
    with seeds_aside():
        a0, a1, ac = (sc('finale', x) for x in FIN_AIR)
        half = max(ac - a0, a1 - ac) + 0.8  # heard a little before the nose enters and after the tail leaves
        y = finale_pass(2 * half)
        t = ac - half + np.arange(len(y)) / A.SR
        y = y * np.sin(np.pi * np.clip((t - (ac - half)) / (2 * half), 0, 1))  # swells to the centre, fades as it leaves
        pan = np.clip(0.75 - 1.5 * (t - a0) / (a1 - a0), -0.75, 0.75)  # right to left with the aircraft
        a = (pan + 1) * np.pi / 4
        air = np.vstack([y * np.cos(a), y * np.sin(a)])
        air *= 10 ** ((ref - 15.0 - A.lufs(air)) / 20)
        sfx.add2(air[0], air[1], ac - half)
        r0 = sc('finale', FIN_RAIN)
        dur = f1 + 3.0 - r0
        rain = A.rain(dur, gain=0.3, density=0.6)
        rain = np.vstack([A.lp(ch, 2600, 2) for ch in rain])  # far off: its high air lost over the distance
        k = int(4.2 * A.SR)  # the seven veils fill in over 4.2 s
        full = rain[:, k:k + int(4.0 * A.SR)] * np.array([[1.0], [0.55]])
        rain *= 10 ** ((ref - 18.0 - A.lufs(full)) / 20)
        grow = np.minimum(1.0, np.arange(rain.shape[1]) / k)
        sfx.add2(rain[0] * grow, rain[1] * grow * 0.55, r0)  # the cloud is on the left of the frame
    print(f'finale (rev11): the King Air at {A.lufs(air):.1f} LUFS and the rain at {ref - 18.0:.1f}, under the music\'s '
          f'{ref:.1f} (before the mix)')


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
    cues = json.load(open(cues_path))
    DUR = cues['duration'] + 3.5
    music, perc, sfx = A.Bus(DUR), A.Bus(DUR), A.Bus(DUR)
    S = {s['id']: s for s in cues['scenes']}
    st = lambda i: S[i]['start']
    en = lambda i: S[i]['start'] + S[i]['dur']
    vo_end = lambda t: max([v['out'] for v in cues['vo'] if v['in'] < t] + [0])  # the narration still running at t
    R11 = 'watch' in S  # Revision 11 (?rev11): its new beats are in the cue list
    # Revision 11's slower detail beats (1 Oct 2026; timeline.js REV11_SLOW): each gained a bar and its plate's clock
    # slowed, so a sound tied to something in a plate (the arrival's jet, the seeding aircraft, the rain from its cloud)
    # follows the plate's clock: sc(id, x) is the film time at which that plate's clock reads x
    SLOW = R11 and S['airport']['dur'] > 6.0
    sc = lambda i, x: st(i) + (x - S[i]['offset']) / S[i]['speed']

    # B01 · night: the drone, wind, starlight; a hummed lead and its answer; the rababa states the motif as Suhail
    # clears the dunes; the ring tone. No drums at night.
    t_end = en('suhail')
    night = A.wind(t_end + 3, gain=0.9, gust=0.05)
    sfx.add(night, 1.5)
    if FOLEY:  # crickets in the desert night, far under the wind
        sfx.add(FOLEY.layer('night', t_end + 3, night, 14, hp=1800), 1.5)
    music.add(A.strings(D2, t_end - 1.0, bright=600, attack=3.5, release=3.0, voices=5), 1.5, 0.85)
    music.add(A.strings(A2, t_end - 2.0, bright=700, attack=4.0, release=3.0, voices=5), 2.5, 0.5)
    for k, (dt, m) in enumerate([(2.2, 86), (3.4, 93), (4.9, 88), (6.1, 91), (7.2, 86)]):
        music.add(A.bell(m, 2.5, gain=0.45), dt, pan=0.6 * np.sin(k * 2.1))  # celesta glints on the brightest stars
    answer(music, st('suhail') + 2.9, D3, [A2, D3], gain=0.45, dur=(2.3, 2.6))
    sm = motif(st('suhail') + 8.333, root=D4, n=4)
    for j, (t, m, d) in enumerate(sm):
        rab(music, t, m, d * (1.4 if j == len(sm) - 1 else 1.0), gain=0.8, grace=EHF if j == 0 else None)
    music.add(harmonic(D4 + 24, 0.8), st('suhail') + 9.2)

    # B02–B05 · heritage in Bayati: first light chord, the oud's ostinato and motif, one soft tar stroke a bar
    h0, h1 = st('durour'), en('falaj')
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
    for tq in [st('monsoon') - 0.35, st('pearling') - 0.35]:  # oud runs into the circle locks
        for k, m in enumerate([D4, D4 + 1.5, D4 + 3, D4 + 5, D4 + 7]):
            music.add(A.pluck(m, 0.9, bright=0.75), tq + k * 0.07, 0.4, pan=0.3)
    # B03 · the monsoon voyage: the jahla's deep stroke as the sea
    for b in (0, 2, 4):
        perc.add(A.jahla(0.55), st('monsoon') + b * BEAT, pan=0.15)
    sfx.add(A.sea(en('pearling') - st('monsoon') + 1.5, gain=0.8), st('monsoon'))
    # B04 · pearling: the crew's drone on D2, two octaves below the nahham; his wordless call, which rests under the
    # narration and answers it after; the two clap groups and the jahla; the tus at the cut
    p0 = st('pearling')
    music.add(A.lp(A.chant(D2, en('pearling') - p0 + 0.3, men=10, vowel='o'), 700, 2), p0 - 0.2, 0.9)
    vo_p = vo_end(p0 + 1.5)  # VO-04 ("Sailors knew every wind by name")
    music.add(nahham([(0, 60), (0.12, 62), (0.5, 62), (0.62, EHF), (0.8, 65), (1.0, EHF), (1.15, 62), (1.5, 62)], 0.8), p0 + 0.12, pan=0.1)
    music.add(nahham([(0, 65), (0.1, 67), (0.6, 67), (0.75, 65), (0.9, EHF), (1.1, 65), (1.3, EHF), (1.5, 62), (1.8, 62)], 0.8), vo_p + 0.1, pan=0.1)
    play(perc, SEA, h0 + 3 * BAR, p0, en('pearling') - 0.15, level=0.75)
    perc.add(A.tus(0.8), p0, pan=0.35)
    sfx.add(A.wind(3.0, gain=0.5, gust=0.3), p0 + 0.2)
    # B05 · the falaj, inland and calm: the rababa descends before Sheikh Zayed's name; a chord under the name
    sfx.add(stream(en('falaj') - st('falaj') + 1.0), st('falaj'))
    for j, (iv, bt) in enumerate([(7, 1.5), (5, 1), (3, 1), (1.5, 0.5), (0, 2)]):
        tj = st('falaj') + 0.4 + sum(b for _, b in [(7, 1.5), (5, 1), (3, 1), (1.5, 0.5), (0, 2)][:j]) * BEAT * 0.7
        rab(music, tj, D4 + iv, bt * BEAT * 0.7 * (1.3 if j == 4 else 1.0), gain=0.55, grace=D4 + iv + 2 if j == 0 else None)
    chord(music, [D3, A3, 62, 65], name_t, 4.0, gain=0.38, bright=1500, attack=1.5, release=2.0)

    # B06 · the Zayed card, as every leader's card
    card(music, st('quote-zayed'), en('quote-zayed'), major=False)

    # B07–B08 · the Center (D Dorian): the ras player's takhmeera brings the Ayyala drums in, pianissimo, on the first
    # downbeat after the iris (ras and takhamir only); the seven emirates lit together get one tar and tus stroke
    c0, c1 = st('centre'), en('nation')
    # Revision 11: the founding decree's charter holds the screen for its first 7.4 s: a held chord, the voices and the
    # horn's motif, no pulse; the pulse enters as the charter settles over the Center's instruments
    charter = 7.4 if R11 else 0.0
    if R11:
        chord(music, [D2 + 12, A2 + 12, 62, 65, 69], c0, charter + 1.5, gain=0.34, bright=1600, attack=1.4, release=2.0)
        music.add(A.choir(D3 + 12, charter + 0.6, vowel='o', gain=0.4), c0 + 0.6)
        for (t, m, d) in motif(c0 + 1.0, root=D4 - 12, stretch=1.2):
            if t < c0 + charter - 0.3:
                music.add(A.horn(m, d, gain=0.75), t, 0.55)
        music.add(harmonic(D4 + 24, 0.7), c0 + 0.9)  # as the decree's title inks in
        music.add(harmonic(D4 + 24 + 7, 0.6), c0 + 12.3)  # the Center's star glints in the ring on «واحد»
    prog_ = [Dm7, Csus, Gsus, Dm7]
    k, t = 0, (next_bar(c0 + charter) if R11 else c0)
    while t < c1 - 0.1:
        chord(music, prog_[k % 4], t, BAR * 1.05, gain=0.3, bright=1900 + 150 * k, attack=0.5, release=1.0)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < c1:
                music.add(A.pizz([D3, A3, D3 + 12, A3][e % 4] + (-2 if k % 4 == 1 else 0), 0.5), te, 0.5, pan=0.3 * np.sin(e))
        k, t = k + 1, t + BAR
    pulse0 = next_bar(c0 + 0.8 + charter)  # after the iris has settled (Revision 11: after the charter)
    wash_t = st('nation') + 8.3  # the seven emirates washed in gold together, named in constitutional order
    takhmeera(perc, pulse0, 'pp')
    play(perc, RAS + TAKHAMIR, pulse0, pulse0, wash_t - 0.1, 'pp')
    hw = 10.0 if R11 else 1.7  # the headline's time in its beat
    music.add(A.horn(D4 - 12 + 7, 2.5, gain=0.8), st('centre') + hw)  # swell under THEN WE BUILT A CENTER TO READ THE SKY
    music.add(A.horn(D4 - 12 + 2, 2.5, gain=0.6), st('centre') + hw)
    chord(music, [D3, A3, 62, 66, 69], wash_t, 3.2, gain=0.3, bright=2200, attack=0.6, release=1.8)
    stroke(perc, 'tar', wash_t, 0.6)
    stroke(perc, 'tus', wash_t, 0.6)
    for i, m in enumerate([74, 76, 78, 79, 81, 83, 86]):
        music.add(harmonic(m, 0.7), wash_t + 0.2 + i * 0.14, pan=0.5 * np.sin(i))

    if 'homes' in S:
        # B09 · April 2024 (?april2024): the pulse stops; a cello pedal on D, one felt-piano note a bar, gentle rain;
        # warmth toward F under the remembrance. No Emirati percussion, no claps, no voices: nothing festive.
        a0, a1 = st('homes'), en('homes')
        music.add(A.strings(D2 + 12, a1 - a0, bright=700, attack=1.5, release=2.5, voices=5), a0, 0.8)
        k, t = 0, a0
        while t < a1 - 0.5:
            music.add(felt([D4, A3, D4 + 3, A3, D4 - 2][k % 5], 0.8), t)
            k, t = k + 1, t + BAR
        rem = a0 + 12.3  # the remembrance (VO-08c), as the paper warms again
        chord(music, F, rem, a1 - rem + 1.5, gain=0.33, bright=1400, attack=2.0, release=2.0)
        sfx.add(A.rain(12.0, gain=0.9), a0 + 1.0)  # under the band of cloud crossing the map; it clears by the remembrance

    # B10–B14 · the working day: a warm chord and the oud motif as the sky clears; the drums wait for the remembrance
    # line to end, then the Ayyala carries the day at mezzo-forte, one colour for each place; a ras stroke and the tus
    # on every cut; everything is out before the President's card
    # Revision 11: the working day opens on the dawn shot (a longer warm chord and the oud, slower); the drive begins with
    # the arrival
    w0, w1 = st('airport-dawn' if R11 else 'airport'), st('quote-president')
    chord(music, Dmaj, w0, 4.5 if R11 else 2.0, gain=0.38, bright=2000, attack=1.5 if R11 else 0.6)
    for (t, m, d) in motif(w0 + (0.8 if R11 else 0), root=D4, major=True, n=4, stretch=1.1 if R11 else 0.7):
        music.add(A.pluck(m, 1.3, bright=0.65), t, 0.6)
    d0, d1 = next_bar(max(vo_end(w0) + 0.6, st('airport') if R11 else w0)), w1 - 1.0  # never before the working day's own first bar
    takhmeera(perc, d0, 'mf')
    k, t = 0, d0
    while t < d1:
        chord(music, [Dmaj, Bm, G, Amaj][k % 4], t, min(BAR, w1 - 0.4 - t) * 1.02, gain=0.34, bright=2600, attack=0.3, release=0.6)
        for e in range(8):
            te = t + e * BEAT / 2
            if te < d1:
                music.add(A.strings([D3, A3, D4, A3, D3 + 7, A3, D4, A3][e] + (0 if k % 2 == 0 else -2), BEAT * 0.45, bright=2400, attack=0.02, release=0.2, voices=3), te, 0.3)
        k, t = k + 1, t + BAR
    colour = {  # each place's drums
        'airport': AYYALA,
        'rail': AYYALA + [(i, 'stick', 0.3) for i in (0, 4, 8, 12)],  # the takhamir in steady eighths
        'port': RAS + TAR + TUS + SAWT,  # the sawt's mirwas and claps: the coastal, urban colour
        'tanker': [(0, 'jahla', 0.8), (8, 'jahla', 0.6)],  # the drums rest: only the jahla, as in the pearling beat
        'energy': AYYALA + [(i, 'tus', 0.3) for i in (2, 6, 10, 14)],  # the tus shimmer
        'solar': AYYALA + [(i, 'tus', 0.3) for i in (2, 6, 10, 14)],  # Revision 11: the same colour into the afternoon
    }
    for sid, pat in colour.items():
        if sid in S:  # the tanker beat can be pulled (?pull=tanker)
            play(perc, pat, d0, max(d0, st(sid)), min(en(sid), d1), 'mf')
    for sid in ['rail', 'port', 'energy'] + (['solar'] if R11 else []):
        stroke(perc, 'tus', st(sid), 0.7)
    if FOLEY and SLOW:
        # the arrival heard from beside the runway: its pass, touchdown and reverse thrust on the plate's own clock
        # the roar comes up 1.5 s before the cut, under the end of the dawn shot
        a0, k_ = st('airport') - 1.5, S['airport']['speed']
        sfx.add(FOLEY.jet_pass(en('airport') - a0 + 1.0, 0.9, sc('airport', JET_CLOSE) - a0, sc('airport', JET_DOWN) - a0,
                               side=JET_SIDE, ear=JET_EAR, k=k_), a0, 0.8)
    else:
        sfx.add(A.jet_far(4.5 / S['airport']['speed'] if SLOW else 4.5, gain=0.9), st('airport') + 0.3, 0.8, pan=0.2)
    if R11:
        sfx.add(A.wind(en('airport-dawn') - w0 if SLOW else 5.0, gain=0.25, gust=0.04), w0)  # the still air of a fog morning
        sfx.add(A.wind(0.75 * (en('solar') - st('solar')) if SLOW else 5.0, gain=0.3, gust=0.08), st('solar'))
    sfx.add(diesel_far(en('rail') - st('rail') + 0.6, gain=1.0), st('rail') - 0.3, pan=0.25)
    if FOLEY:  # the open desert's air around the line
        sfx.add(FOLEY.extra(A.wind, en('rail') - st('rail') + 1.0, gain=0.3, gust=0.05), st('rail') - 0.5)
    if 'tanker' in S:  # the laden tanker under way: calm sea, the crew's drone again; no horn, nothing that waits
        tk = st('tanker')
        sea_tk = A.sea(en('tanker') - tk + 1.0, gain=0.6, period=7.5)
        sfx.add(sea_tk, tk - 0.3)
        music.add(A.lp(A.chant(D2, en('tanker') - tk, men=10, vowel='o'), 700, 2), tk - 0.1, 0.6)
        music.add(A.strings(D2, en('tanker') - tk, bright=600, attack=0.8, release=1.5, voices=5), tk, 0.5)
    sfx.add(A.wind(en('energy') - st('energy') if SLOW else 5.0, gain=0.35, gust=0.12), st('energy'))
    if FOLEY and R11:
        # Jebel Ali at work: water at the quay wall, gulls, and far across the quay the twistlocks of the boxes the
        # cranes set down (at the plate's own set-downs, scene clock: crane 4 on its box, crane 5 on its trailer, crane 3)
        p0, p1 = st('port'), en('port')
        lap = FOLEY.ref('sea', p1 - p0 + 1.0, 0.45, 7.5)
        sfx.add(FOLEY.layer('lap', p1 - p0 + 1.0, lap, 0, hp=80), p0 - 0.3)
        sfx.add(FOLEY.layer('gulls', p1 - p0 + 1.0, lap, 9, hp=300), p0 - 0.3, pan=0.2)
        for x, pan in [(3.75, -0.3), (5.10, 0.25), (7.9, 0.45)]:
            sfx.add(FOLEY.clank(1.0), sc('port', x), pan=pan)
    for m in [55, 59, 62]:  # a brass swell on the last chord of the day, into the President's card
        music.add(A.horn(m, 2.6, gain=0.6), d0 + (k - 1) * BAR)

    # B15 · the President's card
    card(music, st('quote-president'), en('quote-president'))

    # B16–B17 · the seeding and the science of rain: pizzicato with soft, muted mirwas; the oud in tremolo under the
    # science; celesta
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
    if SLOW:
        # the same moments on the seeding plate's slower clock (its clock read 0.94 and 4.46 at them in the faster cut)
        k_ = S['seeding']['speed']
        sfx.add(turboprop_far(6.0 * 1.1 / k_, gain=0.9), sc('seeding', 0.94), pan=-0.1)
        sfx.add(A.rain(3.0 * 1.1 / k_, gain=0.4), sc('seeding', 4.46))
    else:
        sfx.add(turboprop_far(6.0, gain=0.9), r0 + 0.4, pan=-0.1)  # the seeding aircraft, distant, held near the screen
        sfx.add(A.rain(3.0, gain=0.4), r0 + 3.6)  # the rain from the seeded cloud
    for k in range(6):
        music.add(A.bell(86 + [0, 4, 7, 12, 7, 4][k], 1.2, gain=0.35), st('science') + 0.2 + k * 0.17)  # celesta particles

    # B18 · Sheikh Mansour's card
    card(music, st('quote-mansour'), en('quote-mansour'))

    if R11:
        # B18b · the Center's watch (Revision 11): the pulse of the Center's own beat returns, pizzicato in eighths under a
        # low string pedal, the harmony walking D minor - B flat - C (the world's dominant), the strings rising to its
        # landing; no drums (the Ayyala waits for the national line)
        a0, a1 = st('watch'), st('world')
        if FOLEY:  # the operations room: keyboards, quiet, under the music
            room = FOLEY.ref('wind', a1 - a0, 0.2, 0.04)
            sfx.add(FOLEY.layer('keys', a1 - a0, room, 6, hp=400, lp=6000), a0)
        k, t = 0, a0
        # the slower watch (3.5 bars) walks D minor - B flat - G minor - C, the same landing a bar later
        for ch in [Dm7, [34, 41, 58, 62, 65]] + ([[43, 50, 58, 62, 65]] if SLOW else []) + [[36, 43, 60, 64, 67]]:
            if t >= a1 - 0.1:
                break
            chord(music, ch, t, min(BAR * 1.05, a1 - t + 0.4), gain=0.28 + 0.03 * k, bright=1800 + 300 * k, attack=0.4, release=0.6)
            for e in range(8):
                te = t + e * BEAT / 2
                if te < a1 - 0.05:
                    music.add(A.pizz([ch[0] + 12, ch[1] + 12, ch[0] + 24, ch[1] + 12][e % 4], 0.45 + 0.05 * k), te, 0.5, pan=0.3 * np.sin(e))
            k, t = k + 1, t + BAR
        music.add(A.strings(D2 + 12, a1 - a0, bright=900, attack=1.2, release=0.8, voices=5), a0, 0.5)
        music.add(A.strings(60, a1 - a0 - 1.0, bright=2400, attack=a1 - a0 - 2.0, release=0.6, voices=5), a0 + 1.0, 0.35)  # the rise
        for dt in [0.9, 3.2]:
            music.add(harmonic(D4 + 24, 0.5), a0 + dt, pan=-0.3)  # a glint of the Center's motif on the screens

    # B19 · the world, in F major: the orchestra, the voices in two answering groups, the motif in the brass; the
    # Ayyala at forte on the national line (the apex), receding under the office and out before the name
    g0, g1 = st('world'), en('world')
    split = st('gauge') - S['gauge']['xf'] / 2  # the cue-to-cue split: part 1 ends here, on this beat's frame
    apex = g0 + BAR  # the first bar line after the national line comes up (g0 + 2.2), counted from the beat's own start
    office, name = g0 + 8.0, g0 + 9.6
    orch_bloom(g0, music, 1.0, root=41 - 12)
    k, t = 0, g0
    while t < g1 - 0.1:
        chord(music, [F, Bb, Dm, C][k % 4], t, BAR * 1.05, gain=0.36, bright=3000, attack=0.3)
        k, t = k + 1, t + BAR
    music.add(A.choir(65, g1 - g0 + 2.0, gain=0.4), g0)
    for (t, m, d) in motif(g0 + 0.5, root=65 - 12, major=True):
        music.add(A.horn(m, d), t, 0.7)
    answer(music, apex, 53, [48, 53], gain=0.5, dur=(1.4, 1.5))
    answer(music, apex + BAR, 53, [48, 57], gain=0.45, dur=(1.4, 1.5))
    # the full orchestra and voices are some 5 dB louder here than in the working day, so the drums are set higher to sit
    # about 6 dB under them (measured on the stems), not buried
    takhmeera(perc, apex, 1.2)
    play(perc, AYYALA, apex, apex, apex + BAR, 1.2)
    play(perc, RAS + TAKHAMIR + TAR, apex, apex + BAR, office + 0.4, 0.75)  # receding under the office
    chord(music, F + [69, 72, 77], apex, 3.4, gain=0.44, bright=3400, attack=0.25, release=2.0)  # the apex
    for dt in [2.8, 3.6, 4.2, 4.8, 5.4]:  # the pins (plate-world.js places[].t)
        music.add(harmonic(77 + 12, 0.6), g0 + dt, pan=0.4)
    chord(music, F + [69], office, split - office + 1.0, gain=0.3, bright=2400, attack=0.8, release=2.5)  # under the office and name
    assert office + 0.4 + 1.6 < split, 'a drum would ring across the split'

    # B20 · twenty years: twenty water notes on sixteenths (the jahla doubles a few), a timpani roll, the hit on the
    # dominant with the ras and the tus; then it recedes to the rababa and the oud
    t20 = st('gauge') + S['gauge']['t20']
    dt = S['gauge']['dt']
    chord(music, [D3, A3, 66], st('gauge'), t20 - st('gauge'), gain=0.26, bright=1400, attack=1.0, release=0.5)
    scale = [62, 64, 66, 67, 69, 71, 73, 74]
    for k in range(1, 21):
        m = scale[(k - 1) % 8] + 12 * ((k - 1) // 8)
        music.add(water(m + 12, 0.5 + 0.02 * k), t20 - (20 - k) * dt, pan=0.3 * np.sin(k))
        if k in (5, 10, 15):
            perc.add(A.jahla(0.35), t20 - (20 - k) * dt, pan=0.1)
    roll0 = t20 - 2 * BAR / 4
    for k in range(14):
        music.add(A.timpani(A2 + 12, 0.15 + 0.04 * k), roll0 + k * (t20 - roll0) / 14)
    orch_bloom(t20, music, 1.0, root=A2 - 12)
    chord(music, [A2, A3, 61, 64, 69, 73], t20, 3.3, gain=0.52, bright=3400, attack=0.05, release=2.5)  # on the dominant
    music.add(A.choir(A3 + 12, 3.5, gain=0.55), t20)
    stroke(perc, 'ras', t20, LEVEL['f'])
    stroke(perc, 'tus', t20, LEVEL['f'])
    for (t, m, d) in motif(t20, root=A3, major=True, stretch=0.5, n=5):
        music.add(A.horn(m, d), t, 0.75)
    chord(music, [D3, A3, 62, 66], t20 + 3.5, 2.0, gain=0.25, bright=1300, attack=1.0, release=2.0)  # recedes
    for j, (m, d) in enumerate([(69, 1.4), (67, 0.7), (66, 1.6)]):
        rab(music, t20 + 3.0 + [0, 1.4, 2.1][j], m, d, gain=0.5, grace=71 if j == 0 else None)
    music.add(A.pluck(D4, 1.6, bright=0.5), t20 + 3.5, 0.5, pan=-0.25)
    music.add(A.pluck(A3, 1.6, bright=0.5), t20 + 4.3, 0.45, pan=-0.25)

    # B21 · night: broad D major, no drums; the rababa carries the motif, the voices answer, the ring closes; the only
    # full cadence at the title; it rings into the hold pad
    f0, f1 = st('finale'), en('finale')
    title = f0 + 5.0  # finaleWords: the title at b + 5
    fin_w = A.wind(f1 - f0 + 3, gain=0.6, gust=0.05)
    sfx.add(fin_w, f0)
    if FOLEY:  # the desert night again
        sfx.add(FOLEY.layer('night', f1 - f0 + 3, fin_w, 14, hp=1800), f0)
    chord(music, [D3, A3, 66, 69], f0, title - f0, gain=0.34, bright=1500, attack=2.0, release=1.2)
    music.add(A.shimmer(f1 - f0 + 2, gain=0.8, base=86), f0)
    for j, (t, m, d) in enumerate(motif(f0 + 0.4, root=D4, major=True, stretch=0.9)):
        if t < title - 0.13:
            rab(music, t, m, min(d, title - t), gain=0.75, grace={0: EHF, 4: 71}.get(j))
            music.add(A.strings(m - 12, d, bright=1800, attack=0.4, release=0.8, voices=5), t, 0.25)
    # the ring tone as Suhail's gold ring closes; Revision 11 has no Suhail, and the same tone marks the first rain
    music.add(harmonic(D4 + 24, 0.8), sc('finale', FIN_RAIN) if R11 else f0 + 2.467)
    answer(music, f0 + 2.467, D3, [A2, D3], gain=0.45, dur=(1.1, 1.3))
    chord(music, [D2, D3, A3, 62, 66, 69, 74], title, f1 - title + 3.0, gain=0.46, bright=2200, attack=0.4, release=4.0)
    music.add(A.timpani(D2 + 12, 0.45), title)
    if R11:  # after the finale's music is complete: its sounds are set against it
        finale_r11(sfx, music, sc, f0, f1)

    # detent clicks where one circle locks onto the next (the plates' own rings and the irises)
    for sid in ['monsoon', 'pearling', 'centre', 'nation', 'science', 'world', 'gauge']:
        sfx.add(detent(), st(sid), 0.9)

    # fader rides: the loudness follows the story (quiet night, the Center's confidence, the April drop, the world's
    # peak); each leader's card at or above the world beat
    ride = rides(cues['scenes'], DUR, {'suhail': -8, 'durour': -3, 'monsoon': -3, 'pearling': -3, 'falaj': -3,
                                       'quote-zayed': 0.5, 'centre': -1, 'nation': -1, 'homes': -6, 'airport': -1, 'rail': -1,
                                       'port': -1, 'tanker': -2, 'energy': -0.5, 'quote-president': 0.5, 'seeding': -2,
                                       'science': -2, 'quote-mansour': 0.5, 'world': -4.3, 'gauge': 0.5, 'finale': -1,
                                       'airport-dawn': -2, 'solar': -0.5, 'watch': -2})  # Revision 11's new beats
    m = A.reverb(music.stereo() * ride, rt60=3.4, wet=0.3)
    p = A.reverb(A.hp(perc.stereo() * ride, 40, 2), rt60=1.8, wet=0.18)  # the drums outdoors: a shorter room; no sub
    f = A.reverb(sfx.stereo(), rt60=1.6, wet=0.12) * 0.9
    fade = np.ones(m.shape[1])
    k = int(3.0 * A.SR)
    fade[-k:] = np.linspace(1, 0, k) ** 2
    m, p, f = m * fade, p * fade, f * fade
    web = deliver(m + p + f, out_dir, '', split)
    g = np.sqrt(np.sum(web ** 2) / max(1e-12, np.sum((m + p + f) ** 2)))  # the stems carry the master's overall gain
    A.write_wav(f'{out_dir}/mix-r128.wav', A.master(m + p + f, target_lufs=-23.0, ceiling_db=-1.0))
    A.write_wav(f'{out_dir}/music.wav', np.clip(m * g, -1, 1))
    A.write_wav(f'{out_dir}/perc.wav', np.clip(p * g, -1, 1))
    A.write_wav(f'{out_dir}/sfx.wav', np.clip(f * g, -1, 1))
    deliver(m + f, out_dir, '-restrained', split)
    lv = {s['id']: A.lufs(web[:, int(s['start'] * A.SR):int((s['start'] + s['dur']) * A.SR)]) for s in cues['scenes']}
    print('per beat (LUFS):', ', '.join(f'{i} {v:.1f}' for i, v in lv.items()))
    low = [i for i in lv if i.startswith('quote-') and lv[i] < lv['world']]
    assert not low, f'precedence: {low} quieter than the world beat ({lv["world"]:.1f} LUFS)'
    hold(out_dir)
    hold_world(out_dir)


def deliver(mix, out_dir, tag, split):
    """master a mix (-16 LUFS, -1 dBTP) and write it whole and as the two parts of the cue-to-cue run, each part with a
    short equal-power edge so the media server's crossfade is clean"""
    web = A.master(mix, target_lufs=-16.0, ceiling_db=-1.0)
    A.write_wav(f'{out_dir}/mix{tag}.wav', web)
    n, k = int(round(split * A.SR)), int(0.3 * A.SR)
    p1, p2 = web[:, :n].copy(), web[:, n:].copy()
    p1[:, -k:] *= np.cos(np.linspace(0, np.pi / 2, k))
    p2[:, :k] *= np.sin(np.linspace(0, np.pi / 2, k))
    A.write_wav(f'{out_dir}/part1{tag}.wav', p1)
    A.write_wav(f'{out_dir}/part2{tag}.wav', p2)
    print(f'mix{tag}: {A.lufs(web):.1f} LUFS, {A.true_peak_db(web):.1f} dBTP, {web.shape[1] / A.SR:.1f} s')
    return web


def card(bus, t0, t1, major=True):
    """a leader's card, the same for every card: strings on the tonic, the Suhail motif slowly in the horn, a wordless
    choir, and a hummed lead answered by the group; no percussion and no solo instrument"""
    chord(bus, [D2 + 12, A2 + 12, 62, 66 if major else 65, 69], t0, t1 - t0 + 0.8, gain=0.36, bright=2000, attack=1.6, release=1.8)
    bus.add(A.choir(D3 + 12, t1 - t0 - 0.4, vowel='o', gain=0.4), t0 + 0.4)
    answer(bus, t0 + 2.0, D3, [A2, D3], gain=0.5, dur=(2.4, 2.8))
    for (t, m, d) in motif(t0 + 1.0, root=D4 - 12, major=major, stretch=1.3):
        if t < t1 - 0.6:
            bus.add(A.horn(m, d, gain=0.8), t, 0.55)


def hold_world(out_dir, L=12.0):
    """the applause bed after the world beat: its closing F major, held and seamless, for the show caller to release.
    No drums: 12 s is not a whole number of bars, so a pattern would skip at the loop point."""
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
    args = sys.argv[1:]
    if '--samples' in args:
        # opt-in: the strings, horn, timpani, harp and glockenspiel play recorded samples instead of synthesis
        # (sampler.py). Without the flag sampler.py is never imported, and the score renders exactly as before
        k = args.index('--samples')
        import sampler
        sampler.install(args[k + 1], sys.modules[__name__])
        del args[k:k + 2]
    if '--foley' in args:
        # opt-in: recorded sound effects and Emirati drums instead of synthesis (foley.py); without the flag foley.py
        # is never imported, and the score renders exactly as before
        k = args.index('--foley')
        import foley
        foley.install(args[k + 1], sys.modules[__name__])
        del args[k:k + 2]
    main(args[0], args[1] if len(args) > 1 else '.')
