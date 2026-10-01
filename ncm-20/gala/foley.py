"""Recorded sound effects and Emirati percussion for the gala score, in place of the synthesized ones (opt-in).

    python3 score.py cues.json out-dir/ --samples VSCO --foley DIR      (DIR: the four checkouts listed in SOURCES)

score.py imports this module only when --foley is given. Without it the score renders exactly as before, byte for byte.
The requester heard the falaj's water as "a mechanical generation sound" and asked for the background sound to be
enhanced (1 October 2026), with no narration; so here every sound effect is a field recording, or, where no free
recording of the right event exists, a physical model of it, and the drums of Al Ayyala and the sea songs are recorded
hits instead of synthesis:

  - the falaj (stream()): a small stream babbling over stones, gluckose's "Stream" (Freesound 333987, CC0), its handling
    rumble filtered out below 150 Hz;
  - the wind (audio.wind()): Felix Blume's wind (Freesound 217506, CC0) for still and gentle air; a gustier recording
    (Moodist "Wind") where the score asks for gusts;
  - the sea (audio.sea()): water along a sailing boat's hull with its timbers creaking (Moodist "Sailboat") for the
    dhows of the monsoon and the pearling beats, gentle waves lapping (Moodist "Waves") for the calm jetty;
  - the rain (audio.rain()): Noisekun's "Rain" (CC0);
  - the freight train (diesel_far()): a recorded train passing (Moodist "Train"), from after its horn, low-passed for its
    distance;
  - the airliner and the seeding aircraft (audio.jet_far(), turboprop_far()): no free recording of an airliner landing
    or a twin turboprop passing was found, so each is a physical model of its pass rather than a drone: the source (a
    jet's broadband roar with its fan's blade-passing tone; a propeller's blade-pass pulses) moves along its path, and
    the sound reaches the listener by the direct path and by the ground's reflection, each delayed by its length at the
    speed of sound and weakened with distance and air absorption: so the pitch falls as it passes (Doppler) and the
    reflection sweeps its comb through the roar, as a real pass does; the airliner's reverse thrust follows touchdown;
  - the drums (audio.tabl(), daf(), tus(), mirwas(), clap(), jahla()): recorded hits from the Versilian Community Sample
    Library (CC0): the ras on the large frame drum, the sticks' and the rim's strokes on the darbuka, the tar on the small
    frame drum with a tambourine's jingles, the tus on finger cymbals, the claps as a group, the jahla on the darbuka's
    low doum, filtered hollow as a clay pot.

Each recorded sound is set to the loudness of the synthesized sound it replaces (K-weighted power, as BS.1770 measures),
so every gain, fade and per-beat level in score.py keeps its meaning; the stream is set 2 dB above its old level, as
the beat's own sound. audio.rng, the score's one seeded generator, is advanced exactly as before (each synthesized sound
is still made, as the level reference), so every sound left synthesized renders sample for sample as in the build
without --foley; the recordings' choices (which stretch of a bed, which round robin) come from foley's own generator,
so the score still renders the same every time. score.py adds a few layers only when this module is installed (FOLEY):
crickets under the night sky, gulls over the jetty and the port, the quay cranes' twistlocks, the operations room's
keyboards and air.

SOURCES (each a git checkout in DIR, at the commit named):
  blanket   https://github.com/rafaelmardojai/blanket  9d229d2be7cb6619135d55ff9e49926e40298686  (SOUNDS_LICENSING.md:
            Stream, gluckose, CC0; Wind, felix.blume, CC0)
  noisekun  https://github.com/hosseinsarshar/Noisekun  e73d5e147916995ec6970e8c712170712a0502a6  (README: Rain and
            Night, SFX Producer, CC0)
  moodist   https://github.com/remvze/moodist  11c0be2200116a3635880d600fd6953899cc51a3  (README: every sound is under
            the Pixabay Content License or CC0, which both allow use in a film without credit; it does not itemize them)
  vcsl      https://github.com/sgossner/VCSL  c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e  (CC0 1.0)
"""
import atexit
import glob
import os
import subprocess
import sys

import numpy as np
from scipy.signal import lfilter, resample_poly, sosfilt

import audio as A

SR = A.SR
FF = os.environ.get('FFMPEG', 'ffmpeg')
frng = np.random.default_rng(2033)
ROOT = None
ORIG, CACHE, USED = {}, {}, {}

BEDS = {
    'stream': 'blanket/data/resources/sounds/stream.ogg',
    'wind': 'blanket/data/resources/sounds/wind.ogg',
    'gusts': 'moodist/public/sounds/nature/wind.mp3',
    'boat': 'moodist/public/sounds/transport/sailboat.mp3',
    'lap': 'moodist/public/sounds/nature/waves.mp3',
    'rain': 'noisekun/public/sounds/rain.ogg',
    'night': 'noisekun/public/sounds/night.ogg',
    'gulls': 'moodist/public/sounds/animals/seagulls.mp3',
    'train': 'moodist/public/sounds/transport/train.mp3',
    'keys': 'moodist/public/sounds/things/keyboard.mp3',
}
HITS = {
    'ras': 'Membranophones/Struck Membranophones/Frame Drum/HDrumL_Hit_v*',
    'boom': 'Membranophones/Struck Membranophones/Bass Drum 1/BDrumNew_hit_v[35]*',
    'tak': 'Membranophones/Struck Membranophones/Darbuka/Darbuka_2_*',
    'stick': 'Membranophones/Struck Membranophones/Darbuka/Darbuka_3_*',
    'tar': 'Membranophones/Struck Membranophones/Frame Drum/HDrumS_Hit_v*',
    'muted': 'Membranophones/Struck Membranophones/Frame Drum/HDrumS_HitMuted_*',
    'jingle': 'Idiophones/Struck Idiophones/Tambourine 1/Tamb1_Hit_*',
    'tus': 'Idiophones/Struck Idiophones/Finger Cymbals/Fing_Cymb*',
    'clap': 'Idiophones/Struck Idiophones/Claps/Clap_rr*',
    'doum': 'Membranophones/Struck Membranophones/Darbuka/Darbuka_1_*',
    'clank': 'Idiophones/Struck Idiophones/Brake Drum/BrakeDrum2_Hammer*',
}


# ---------- reading and shaping recordings ----------
def decode(path):
    """a recording as float (2, n) at the score's rate, through ffmpeg"""
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T.astype(float)


def rec(key):
    if key not in CACHE:
        CACHE[key] = decode(os.path.join(ROOT, BEDS[key]))
    return CACHE[key]


def hits(key):
    """every file for a hit, read at the score's rate (VCSL is at 44.1 or 48 kHz)"""
    if key not in CACHE:
        files = sorted(glob.glob(os.path.join(ROOT, 'vcsl', HITS[key] + '.wav')))
        if not files:
            raise SystemExit(f'--foley: no samples for {key} in {ROOT}/vcsl')
        CACHE[key] = [decode(f) for f in files]
    return CACHE[key]


def kpow(x):
    x = np.atleast_2d(x)
    return float(sum(np.mean(A.k_weight(ch) ** 2) for ch in x)) + 1e-20


def filt(x, hp=None, lp=None):
    if hp:
        x = sosfilt(A.sos('highpass', hp, 2), x, axis=-1)
    if lp:
        x = sosfilt(A.sos('lowpass', lp, 2), x, axis=-1)
    return x


def fades(x, a, r):
    """raised-cosine fades in and out, in seconds"""
    n = x.shape[-1]
    env = np.ones(n)
    ka, kr = min(n // 2, int(a * SR)), min(n // 2, int(r * SR))
    if ka:
        env[:ka] = np.sin(np.linspace(0, np.pi / 2, ka)) ** 2
    if kr:
        env[n - kr:] = np.cos(np.linspace(0, np.pi / 2, kr)) ** 2
    return x * env


def bed(key, dur, start=None, xfade=1.2, lo=None, hi=None):
    """dur seconds of a recording: from a chosen or random point, and past its end further stretches of it, each joined
    to the last by an equal-power crossfade (field recordings of water, wind and sea are noise-like, so stretches taken
    from different points are uncorrelated and the crossfades keep the level). lo/hi limit the stretches to a span"""
    y = rec(key)
    lo = int((lo or 0) * SR)
    hi = int(hi * SR) if hi else y.shape[1]
    n, X = int(dur * SR), int(xfade * SR)
    out = np.zeros((2, n + X))
    span = hi - lo
    s = lo + (int(start * SR) - lo if start is not None else int(frng.integers(0, max(1, span - min(span, n)))))
    seg = y[:, s:min(hi, s + n + X)]
    out[:, :seg.shape[1]] = seg
    end = seg.shape[1]
    w = np.linspace(0, np.pi / 2, X)
    while end < n:
        L = int(min(span, max(4 * X, frng.integers(int(6 * SR), int(12 * SR)))))
        L = min(L, n + 2 * X - end)
        s = lo + int(frng.integers(0, max(1, span - L)))
        seg = y[:, s:s + L]
        i = end - X
        out[:, i:i + X] = out[:, i:i + X] * np.cos(w) + seg[:, :X] * np.sin(w)
        out[:, i + X:i + seg.shape[1]] = seg[:, X:]
        end = i + seg.shape[1]
    USED[key] = USED.get(key, 0) + dur
    return out[:, :n]


def level(x, ref, db=0.0):
    """x at the K-weighted power of ref (the synthesized sound it replaces), plus db"""
    return x * np.sqrt(kpow(ref) / kpow(x)) * 10 ** (db / 20)


def shape_like(x, ref):
    """the recording under the synthesized sound's own slow envelope (its fades and swells, smoothed over 0.4 s)"""
    r = np.atleast_2d(ref)
    e = np.sqrt(np.convolve(np.mean(r ** 2, axis=0), np.ones(int(0.4 * SR)) / int(0.4 * SR), 'same'))
    e = e / (e.max() + 1e-12)
    n = min(x.shape[-1], len(e))
    return x[..., :n] * e[:n]


# ---------- the beds ----------
def wind(dur, gain=1.0, gust=0.08):
    ref = ORIG['wind'](dur, gain, gust)
    y = bed('wind' if gust <= 0.08 else 'gusts', dur)
    y = fades(filt(y, hp=40), min(2.5, dur / 3), min(2.5, dur / 3))
    return level(y, ref)


def sea(dur, gain=1.0, period=6.5):
    ref = ORIG['sea'](dur, gain, period)
    y = bed('boat' if period < 7 else 'lap', dur)
    y = fades(filt(y, hp=60), min(2.0, dur / 3), min(2.0, dur / 3))
    return level(y, ref)


def rain(dur, gain=1.0, density=1.0):
    ref = ORIG['rain'](dur, gain, density)
    y = fades(bed('rain', dur), min(1.8, dur / 3), min(2.0, dur / 3))
    return level(y, ref)


def stream(dur):
    ref = ORIG['stream'](dur)
    y = fades(filt(bed('stream', dur), hp=150), 0.8, 0.8)
    return level(y, ref, db=2.0)


def diesel_far(dur, gain=1.0):
    ref = ORIG['diesel_far'](dur, gain)
    # the pass itself, after the horn that opens the recording (it is out by 4 s) and before its tail
    y = bed('train', dur, start=6.0, lo=6.0, hi=50.0)
    y = filt(y, hp=35, lp=900)
    return level(shape_like(y, ref), ref)


def layer(key, dur, under, db, hp=None, lp=None, a=1.5, r=1.5):
    """a new layer (crickets, gulls, keyboards): dur seconds of a recording, db below the K-weighted power of `under`
    (the bed it sits under in the same beat, as the score renders it)"""
    y = fades(filt(bed(key, dur), hp=hp, lp=lp), a, r)
    return level(y, under, db=-db)


# ---------- passes: a moving source heard by the direct and the ground-reflected path ----------
C = 343.0


def propagate(src, path, ear_h=1.6, refl=0.6, absorb=1.0):
    """src: the source's signal at emission time (n samples); path(t) -> (x, y, h) in metres for t in seconds, the
    listener at the origin, ear_h up. Each path's delay (its length over c), 1/r spreading and air absorption (a
    one-pole low-pass whose corner falls with distance) give the Doppler shift and the swept ground comb"""
    n = len(src)
    t = np.arange(n) / SR
    x, y, h = path(t)
    out = np.zeros(n)
    for sign, g in ((-1, 1.0), (1, refl)):
        r = np.sqrt(x ** 2 + y ** 2 + (h + sign * ear_h) ** 2)
        # the sample emitted at time te arrives at te + r(te)/c: invert by interpolating the emission time per arrival
        arrive = t + r / C
        te = np.interp(t, arrive, t, left=np.nan, right=np.nan)
        ok = ~np.isnan(te)
        sig = np.zeros(n)
        sig[ok] = np.interp(te[ok] * SR, np.arange(n), src)
        rr = np.interp(np.where(ok, te, 0), t, r)
        sig = sig / np.maximum(rr, 30.0)
        # air absorption: the corner falls from 12 kHz at 100 m to about 2 kHz at 1.5 km
        fc = np.clip(12000 * (100 / np.maximum(rr, 100)) ** (0.65 * absorb), 600, 16000)
        out += g * varlp(sig, fc)
    return out


def varlp(x, fc, block=256):
    """a one-pole low-pass whose corner moves (set per block of 256 samples, its state carried across blocks)"""
    y = np.zeros_like(x)
    z = np.zeros(1)
    for i in range(0, len(x), block):
        a = np.exp(-2 * np.pi * fc[i] / SR)
        y[i:i + block], z = lfilter([1 - a], [1, -a], x[i:i + block], zi=z)
    return y


def jet_source(n, rev_from=None):
    """an airliner at approach thrust: jet-mixing roar (pink, peaked near 500 Hz) and fan broadband (1-4 kHz), with the
    fan's blade-passing tone and its harmonic (18 blades at about 1,400 rpm: 420 Hz), a little unsteady; from rev_from
    (s) the reverse thrust's roar builds over 1.5 s and holds"""
    t = np.arange(n) / SR
    roar = A.bp(A.noise(n), 180, 1600, 2) * 1.0 + A.bp(A.noise(n), 1000, 4500, 2) * 0.45
    f = 420 * (1 + 0.004 * np.sin(2 * np.pi * 0.37 * t) + 0.002 * frng.standard_normal(n).cumsum() / np.sqrt(SR))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = 0.10 * np.sin(ph) + 0.05 * np.sin(2 * ph + 1.1)
    s = roar + tone
    if rev_from is not None:
        k = np.clip((t - rev_from) / 1.5, 0, 1) ** 2
        s = s * (1 + 1.6 * k) + A.lp(A.noise(n), 900, 2) * 1.2 * k
    return s


def jet_pass(dur, gain, t_close, t_down=None, side=220.0, v=70.0, k=1.0):
    """the arrival heard from beside the runway, side metres off its centreline: closest at t_close (s into the sound),
    main gear down at t_down; the motion on the picture's clock (k: the plate's clock rate, so the Doppler is the
    picture's), 3-degree path, flare to the ground at touchdown, then decelerating at 2 m/s2 with reverse thrust"""
    n = int(dur * SR)
    ref = ORIG['jet_far'](dur, gain)
    vk = v * k
    td = t_down if t_down is not None else t_close + 1.0

    def path(t):
        x = vk * (t - t_close)
        after = np.clip(t - td, 0, None)
        x = np.where(t > td, vk * (td - t_close) + vk * after - 0.5 * 2.0 * k * k * after ** 2, x)
        h = np.clip(-(x - vk * (td - t_close)) * np.tan(np.radians(3.0)), 0, None) + 2.5
        return x, np.full_like(x, side), h

    # the reversers open about a second after the mains touch (2 s of the picture's slowed clock)
    s = jet_source(n, rev_from=td + 2.0)
    y = propagate(s, path, ear_h=3.5)
    y = np.vstack([y, y])
    return level(fades(y, 1.5, 1.5), ref)


def turboprop_far(dur, gain=1.0):
    """the seeding aircraft (a King Air: two four-blade propellers at about 1,700 rpm) crossing about 1.5 km away:
    blade-pass pulses at 113 Hz, slightly unsteady, with the engines' air; heard by both paths"""
    ref = ORIG['turboprop_far'](dur, gain)
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 113.3 * (1 + 0.006 * np.sin(2 * np.pi * 0.23 * t))
    ph = np.cumsum(f) / SR
    pulses = np.exp(-((ph % 1.0) - 0.5) ** 2 / 0.004) - 0.07
    s = A.bp(pulses, 90, 1400, 2) + A.bp(A.noise(n), 200, 2000, 2) * 0.25

    def path(tt):
        return 90.0 * (tt - dur / 2), np.full_like(tt, 1500.0), np.full_like(tt, 900.0)

    y = propagate(s, path, absorb=1.2)
    y = np.vstack([y, y])
    return level(fades(y, 1.5, 1.5), ref)


# ---------- the drums ----------
def hit(key, inten=0.5, cents=15, lp=None, hp=None, length=None, fade=0.05):
    """one recorded hit: a round robin from the layer nearest the intensity, a few cents of play, in mono"""
    pool = hits(key)
    i = int(np.clip(round(inten * (len(pool) - 1)), 0, len(pool) - 1))
    i = int(np.clip(i + frng.integers(-1, 2), 0, len(pool) - 1))
    y = pool[i].mean(axis=0)
    c = frng.normal(0, cents)
    if abs(c) > 2:
        up = int(round(1000 * 2 ** (c / 1200)))
        y = resample_poly(y, 1000, up)
    if length:
        y = y[:int(length * SR)]
        f = min(len(y), int(fade * SR))
        y[len(y) - f:] *= np.linspace(1, 0, f) ** 2
    if hp or lp:
        y = filt(y, hp=hp, lp=lp)
    USED['hit:' + key] = USED.get('hit:' + key, 0) + 1
    return y


def onset_level(y, ref, win=0.25):
    """y at ref's K-weighted power over the stroke's first 0.25 s (its body), mono"""
    m = int(win * SR)
    return y * np.sqrt(kpow(np.atleast_2d(ref)[:, :m].mean(axis=0)) / kpow(y[:m]))


def tabl(gain=1.0, stroke='dum'):
    ref = ORIG['tabl'](gain, stroke)
    if stroke == 'dum':
        y = hit('ras', 0.7, cents=10)
        b = hit('boom', 0.3, cents=0)
        y = y + 0.35 * np.pad(b, (0, max(0, len(y) - len(b))))[:len(y)]
    else:
        y = hit('tak', 0.6)
    return onset_level(y, ref)


def daf(gain=1.0, jingle=True):
    ref = ORIG['daf'](gain, jingle)
    y = hit('tar', 0.5)
    if jingle:
        j = hit('jingle', 0.3, cents=0, length=0.6)
        y = y + 0.18 * np.pad(j, (0, max(0, len(y) - len(j))))[:len(y)]
    return onset_level(y, ref)


def tus(gain=1.0):
    ref = ORIG['tus'](gain)
    return onset_level(hit('tus', 0.5, cents=25, length=1.1, fade=0.5), ref, win=0.15)


def mirwas(gain=1.0, open_=True):
    ref = ORIG['mirwas'](gain, open_)
    y = hit('stick', 0.6, cents=30) if open_ else hit('muted', 0.4, cents=20, length=0.35)
    return onset_level(y, ref, win=0.15)


def clap(gain=1.0, people=6):
    ref = ORIG['clap'](gain, people)
    y = np.zeros(int(0.8 * SR))
    for _ in range(max(2, people // 3)):
        c = hit('clap', 0.5, cents=20)
        d = int(abs(frng.normal(0, 0.008)) * SR)
        k = min(len(c), len(y) - d)
        y[d:d + k] += c[:k]
    return onset_level(y, ref, win=0.15)


def jahla(gain=1.0):
    ref = ORIG['jahla'](gain)
    return onset_level(hit('doum', 0.5, cents=10, lp=1200), ref)


def clank(gain=1.0):
    """a container's corner castings meeting the spreader's twistlocks or the trailer, far across the quay: a hammered
    brake drum, low-passed and softened by its distance"""
    return hit('clank', 0.4, cents=40, lp=1500, hp=120) * 0.06 * gain


# ---------- layers only the recorded score has ----------
class aside:
    """runs fn on a generator of foley's own, so audio.rng is not touched (a layer the synthesized score does not have
    must not shift the random draws of the sounds that follow it)"""

    def __enter__(self):
        self.rng, A.rng = A.rng, np.random.default_rng(int(frng.integers(1 << 30)))

    def __exit__(self, *exc):
        A.rng = self.rng


def extra(fn, *args, **kw):
    with aside():
        return fn(*args, **kw)


def ref(name, *args):
    """a synthesized sound as the level reference for a new layer, made aside from audio.rng"""
    with aside():
        return ORIG[name](*args)


# ---------- install ----------
def install(root, score):
    """put the recorded sounds in place of the synthesized ones, in audio.py and in the score module `score`"""
    global ROOT
    ROOT = root
    for k, rel in BEDS.items():
        if not os.path.exists(os.path.join(root, rel)):
            raise SystemExit(f'--foley: {rel} is missing from {root}')
    for name, fn in [('wind', wind), ('sea', sea), ('rain', rain), ('jet_far', None), ('tabl', tabl), ('daf', daf),
                     ('tus', tus), ('mirwas', mirwas), ('clap', clap), ('jahla', jahla)]:
        ORIG[name] = getattr(A, name)
        if fn:
            setattr(A, name, fn)
    for name, fn in [('stream', stream), ('diesel_far', diesel_far), ('turboprop_far', turboprop_far)]:
        ORIG[name] = getattr(score, name)
        setattr(score, name, fn)
    score.FOLEY = sys.modules[__name__]
    print(f'sound effects and drums: recorded ({root})')
    atexit.register(report)


def report():
    print('foley:', ', '.join(f'{k} {v:.1f} s' if not k.startswith('hit:') else f'{k[4:]} x{v}' for k, v in sorted(USED.items())))
