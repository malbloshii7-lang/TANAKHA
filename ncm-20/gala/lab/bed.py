"""The sound of the Etihad Rail hero scene (lab/rail-3d.html), placed from the picture's own numbers.

It reads the shot chain from lab/rail-3d-shot.js and follows the camera path the picture follows, so the diesel is
sounded from the locomotive's real distance and bearing to the camera: its level, its brightness (the air takes the
highs first), its place in the stereo field and its Doppler shift, which falls as the engine passes. The music follows
the locked order's three beats: a low bass as the long lens finds the train emerging from the Hajar; the ras player's
takhmeera into the cut, then score.py's Ayyala over the diesel as the locomotive towers past the worm's-eye camera; the
drums' last stroke as the camera begins to rise, then silence (the train going away, the wind). No horn, and no rail
clack (the line is welded).

score.py calls build() to place it in the film; run alone, it writes the lab page's bed:

    python3 lab/bed.py out.wav
"""
import json
import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import audio as A  # noqa: E402
import score as S  # noqa: E402

SHOT = json.loads(re.search(r'const R3_SHOT\s*=\s*(\{.*\});', open(os.path.join(HERE, 'rail-3d-shot.js')).read(), re.S).group(1))
assert SHOT['bpm'] == S.BPM, 'the picture cuts on the score bar grid'
T, CUT, RISE, V = SHOT['dur'], SHOT['cut'], SHOT['rise'], SHOT['v']
BAR0 = SHOT['downbeat0']
for tt in (CUT, RISE):
    assert abs((tt - BAR0) / S.BAR - round((tt - BAR0) / S.BAR)) < 1e-3, 'the cut and the rise fall on downbeats'
C_AIR = 343.0
ENGINE = 14.0  # the prime mover, mid-way along the long hood: 14 m behind the front, about 3 m above the rail (m)
TRAIN = 22.6 + 50 * (15.0 + 1.0)  # the locomotive and 50 hoppers with their couplings, as the picture draws them (m)
TAIL = 1.5  # past the scene's end, for the train going away and the reverb


# ---------- the picture's camera and train (lab/rail-3d.js: r3shot, r3key, r3head) ----------
def shot(t):
    return next((s for s in SHOT['shots'] if t < s['t1']), SHOT['shots'][-1])


def key(s, t, name):
    K, n = s['keys'], len(s['keys'])
    if t <= K[0]['t']:
        return np.array(K[0][name], float)
    if t >= K[-1]['t']:
        return np.array(K[-1][name], float)
    i = 1
    while K[i]['t'] < t:
        i += 1
    a, b = K[i - 1], K[i]
    h = b['t'] - a['t']
    u = (t - a['t']) / h

    def tan(j):
        if j == 0 or j == n - 1 or K[j].get('ease'):
            return np.zeros(np.size(K[j][name]))
        return (np.array(K[j + 1][name], float) - np.array(K[j - 1][name], float)) / (K[j + 1]['t'] - K[j - 1]['t'])
    h00, h10, h01, h11 = 2 * u ** 3 - 3 * u ** 2 + 1, u ** 3 - 2 * u ** 2 + u, -2 * u ** 3 + 3 * u ** 2, u ** 3 - u ** 2
    return h00 * np.array(a[name], float) + h10 * h * tan(i - 1) + h01 * np.array(b[name], float) + h11 * h * tan(i)


def geometry(s, t):
    """on shot s at time t: the engine's distance (m) and bearing off the lens axis (rad, + right), and the distance to
    the nearest point of the train"""
    C, L = key(s, t, 'C'), key(s, t, 'L')
    head = s['head0'] - V * (t - s['t0'])
    e = np.array([head + ENGINE, 0.0, 2.8 + 3.0]) - C
    F = L - C
    rel = np.arctan2(F[0] * e[1] - F[1] * e[0], F[0] * e[0] + F[1] * e[1])  # counter-clockwise from the axis
    near = np.array([np.clip(C[0], head, head + TRAIN), 0.0, 3.2]) - C
    return np.linalg.norm(e), -rel, np.linalg.norm(near)


def air(x, d, near=15.0, far=1500.0):
    """the air between: a dark and a bright copy crossfaded by distance (the highs go first)"""
    w = np.clip(np.log(far / d) / np.log(far / near), 0, 1)
    return A.lp(x, 450, 2) * (1 - w) + A.lp(x, 5500, 2) * w


def moving(bus, x, p, t0):
    """a mono source whose pan follows the picture, from film time t0"""
    i0 = int(round(t0 * A.SR))
    a = (p + 1) * np.pi / 4
    k = min(len(x), bus.n - i0)
    bus.L[i0:i0 + k] += x[:k] * np.cos(a[:k])
    bus.R[i0:i0 + k] += x[:k] * np.sin(a[:k])


def build(perc, music, sfx, t0=0.0):
    """the scene's sound into the three buses, the scene starting at film time t0 (on a bar line of the film); returns
    the engine's pass and the front's pass, in scene time"""
    CR = 500  # control rate (Hz)
    tc = np.arange(0, T + TAIL, 1 / CR)
    d_eng, bearing, d_near, vr = (np.zeros(len(tc)) for _ in range(4))
    for i, t in enumerate(tc):
        s = shot(t)
        d_eng[i], bearing[i], d_near[i] = geometry(s, t)
        vr[i] = (geometry(s, t + 1e-3)[0] - geometry(s, t - 1e-3)[0]) / 2e-3  # within the shot, never across the cut
    n = int(round((T + TAIL) * A.SR))
    ts = np.arange(n) / A.SR
    up = lambda c: np.interp(ts, tc, c)
    de, dn, D = up(d_eng), up(d_near), up(C_AIR / (C_AIR + vr))
    pan = up(np.clip(np.sin(bearing), -1, 1) * 0.8)
    t_pass = tc[tc >= CUT][np.argmin(d_eng[tc >= CUT])]
    t_front = CUT + (SHOT['shots'][1]['head0'] - key(SHOT['shots'][1], CUT, 'C')[0]) / V
    bar = lambda k: t0 + BAR0 + k * S.BAR  # the k-th downbeat of the scene's bar grid, in film time

    # the diesel: an EMD 710 sixteen-cylinder two-stroke at notch 8 (904 rpm), a 15 Hz crank firing 241 times a second,
    # the exhaust's rasp riding the firing pulses; all of it Doppler-shifted by the engine's own motion. It sits under
    # the drums (the locked order: "diesel under Emirati drums").
    ph = 2 * np.pi * (904 / 60) * np.cumsum(D) / A.SR
    rng = np.random.default_rng(710)
    eng = sum(np.sin(k * ph + rng.uniform(0, 6.3)) / np.sqrt(k) * (2.4 if k % 16 == 0 else 1.5 if k % 8 == 0 else 1.0) * np.exp(-k / 36)
              for k in range(1, 49))
    rasp = A.bp(A.noise(n), 120, 3200, 2) * (1 + 0.7 * np.sin(16 * ph)) * (0.8 + 0.2 * np.sin(ph))
    diesel = air(A.lp(eng, 900, 2) * 0.22 + rasp * 0.3, de) * np.minimum(1, 15 / de) ** 0.85
    moving(sfx, diesel * 0.2, pan, t0)
    # the wheels on welded rail, from the whole train: a steady roar from its nearest wagons, spread wide
    roll = [air(A.bp(A.noise(n), 60, 1600, 2) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.7 * ts + c)), dn) for c in (0, 2)]
    rg = np.minimum(1, 15 / dn) ** 0.8 * 0.07
    sfx.add2(roll[0] * rg, roll[1] * rg, t0)
    # the air the locomotive's front pushes aside as it passes abeam
    wn = int(1.2 * A.SR)
    w_env = np.interp(np.arange(wn) / A.SR, [0, 0.35, 0.5, 1.2], [0, 1, 0.8, 0])
    sfx.add(A.bp(A.noise(wn), 150, 1500, 2) * w_env * 0.03, t0 + t_front - 0.35, pan=-0.3)
    # the desert wind: the air of the plain under the bass; lower on the ground; almost all there is as the camera rises
    wind = A.wind(T + TAIL, gain=0.8, gust=0.09)
    wind *= np.interp(np.arange(len(wind)) / A.SR, [0, 0.6, CUT, CUT + 0.01, RISE, RISE + 4, T + TAIL], [0.4, 0.8, 0.8, 0.45, 0.45, 0.6, 0.6])
    sfx.add(wind, t0)

    # beat 1: the bass, a low D (cellos and basses, dark), and two soft timpani strokes as the pan finds the train
    music.add(A.strings(S.D2, RISE - 0.4, bright=450, attack=3.0, release=1.2, voices=5), t0 + 0.3, 0.55)
    music.add(A.strings(S.D2 - 12, RISE - 0.8, bright=300, attack=4.0, release=1.2, voices=3), t0 + 0.8, 0.5)
    music.add(A.strings(S.A2, CUT - 1.0, bright=500, attack=3.0, release=1.0, voices=5), t0 + 1.2, 0.25)
    for k in (1, 2):
        music.add(A.timpani(S.D2, 0.22 + 0.08 * k), bar(k))
    # beat 2: the takhmeera into the cut, then the Ayyala at forte with the takhamir in steady eighths, over the diesel
    S.takhmeera(perc, t0 + CUT, 'mf')
    S.play(perc, S.AYYALA + [(i, 'stick', 0.3) for i in (0, 4, 8, 12)], t0 + BAR0, t0 + CUT, t0 + RISE, 'f')
    # beat 3: the drums' last stroke as the camera leaves the ground; then nothing but the train going away and the wind
    S.play(perc, [(0, 'ras', 1.0), (0, 'tus', 1.0), (0, 'tar', 0.8)], t0 + BAR0, t0 + RISE, t0 + RISE + 0.1, 'f')
    music.add(A.timpani(S.D2, 0.5), t0 + RISE)
    return t_pass, t_front


if __name__ == '__main__':
    L = T + TAIL
    perc, music, sfx = A.Bus(L), A.Bus(L), A.Bus(L)
    t_pass, t_front = build(perc, music, sfx, 0.0)
    mix = A.reverb(music.stereo(), rt60=3.2, wet=0.3) + A.reverb(A.hp(perc.stereo(), 40, 2), rt60=1.6, wet=0.16) + A.reverb(sfx.stereo(), rt60=1.1, wet=0.08)
    ns = int(round(T * A.SR))
    mix = mix[:, :ns]
    fi, fo = int(0.6 * A.SR), int(1.0 * A.SR)  # as the lab page: in from black over 0.6 s, out over the last second
    mix[:, :fi] *= np.linspace(0, 1, fi)
    mix[:, -fo:] *= np.linspace(1, 0, fo) ** 2
    g = 10 ** ((-16.0 - A.lufs(A.glue(mix))) / 20)
    out = A.master(mix, target_lufs=-16.0, ceiling_db=-1.0)
    A.write_wav(sys.argv[1], out)

    def st(x, a, b):
        """loudness of a stretch (LUFS, ungated), at the master's gain"""
        z = [A.k_weight(c) for c in x[:, int(a * A.SR):int(b * A.SR)] * g]
        return -0.691 + 10 * np.log10(sum(np.mean(c ** 2) for c in z) + 1e-12)
    buses = {'drums': perc.stereo()[:, :ns], 'music': music.stereo()[:, :ns], 'diesel+roll+wind': sfx.stereo()[:, :ns]}
    spans = [('emerge', 0.6, CUT - 1.0), ('approach', CUT, t_pass - 1.3), ('the pass', t_pass - 0.4, t_pass + 0.4),
             ('rise', RISE + 1.0, RISE + 6.0), ('the wide', RISE + 9.0, T - 1.0)]
    print(f'mix {A.lufs(out):.1f} LUFS, true peak {A.true_peak_db(out):.1f} dBTP; engine abeam at {t_pass:.2f} s; front abeam at '
          f'{t_front:.2f} s; cut {CUT:.3f} s, rise {RISE:.3f} s')
    for name, a, b in spans:
        print(f'  {name:9s} {a:5.2f}-{b:5.2f} s: ' + '  '.join(f'{k} {st(x, a, b):6.1f}' for k, x in buses.items()))
