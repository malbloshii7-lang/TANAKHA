"""Recorded orchestral instruments for the gala score, in place of the synthesized orchestra (opt-in).

    python3 score.py cues.json out-dir/ --samples DIR      (DIR: a checkout of VSCO-2 CE with the folders listed below)

score.py imports this module only when --samples is given. Without it the score renders exactly as before, byte for
byte. install() swaps the orchestral voices for recorded ones: in audio.py strings() (and so chord(), which plays its
notes through strings()), horn(), timpani(), pizz(), bell() and shimmer(); in score.py harmonic() and orch_bloom().
The Emirati and Arabic instruments (the rababa, the oud, the drums of Al Ayyala, the tus, the mirwas, the claps, the
jahla), the voices (the choir, the hummed answers, the nahham's call) and the sound effects stay synthesized: VSCO has
none of them.

The samples are VSCO-2 Community Edition by Versilian Studios, released under CC0 1.0 (a public-domain dedication), from
https://github.com/sgossner/VSCO-2-CE at commit 440300901dfe9275fd84e0b7763af1f8443ae62e (4 August 2020). Only the
folders named in FOLDERS, TIMPANI and SWELL are read.

How a note is played:
  - by the section whose register fits it: the solo bass doubled by the cellos an octave up below C2, the cellos with the
    bass under them to F#2 and alone to F#3, the violas to C#4, the violins above;
  - from the nearest sampled pitch, repitched and brought to 48 kHz in one polyphase resampling, from the pitch measured
    in the file itself (the libraries sit a few cents off A440). Shifts stay within 3 semitones, except where the
    library leaves a wider gap (the horn above C4, the glockenspiel's fourths and fifths): up to 4;
  - on the dynamic layer that suits the synthesized voice's brightness (strings) or gain (horn, timpani, pizzicato);
  - at the loudness of the synthesized voice it replaces (K-weighted, as BS.1770 measures), so every gain, fader ride and
    per-beat level in score.py keeps its meaning and the Emirati instruments keep their balance with the orchestra;
  - held, when it outlasts its sample, on equal-power crossfades between stretches of the sample's steady middle;
  - under the synthesized voice's own envelope, so every swell and release lands where the score puts it;
  - in stereo as recorded (strings, horn, timpani), with the glockenspiel and the harp in mono, so that the score's pans
    still place them.

audio.rng, the score's one seeded generator, is advanced exactly as each synthesized voice would advance it, so every
voice left synthesized renders sample for sample as in the synthesized build, and the reverbs keep their impulse
responses. The sampler's own choices (round robins, loop points, the glockenspiel's starlight) come from its own seeded
generator, so the recorded score also renders the same every time.
"""
import atexit
import glob
import os
import re
import warnings
from fractions import Fraction

import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly, sosfilt

import audio as A

SR = A.SR
srng = np.random.default_rng(2007)

# (instrument, articulation): the folder, and the interval between a file's name and the pitch it sounds. The strings,
# the horn and the glockenspiel are named with middle C as "C3", an octave below the pitch measured in every file; the
# harp's names are its sounding pitch
FOLDERS = {
    ('violins', 'sus'): ('Strings/Violin Section/susVib', 12),
    ('violas', 'sus'): ('Strings/Viola Section/susvib', 12),
    ('cellos', 'sus'): ('Strings/Cello Section/susvib', 12),
    ('bass', 'sus'): ('Strings/Solo Contrabass/SusVib', 12),
    ('violins', 'spic'): ('Strings/Violin Section/Spic', 12),
    ('violas', 'spic'): ('Strings/Viola Section/spic', 12),
    ('cellos', 'spic'): ('Strings/Cello Section/spic', 12),
    ('violins', 'pizz'): ('Strings/Violin Section/Pizz', 12),
    ('violas', 'pizz'): ('Strings/Viola Section/pizz', 12),
    ('cellos', 'pizz'): ('Strings/Cello Section/pizzT', 12),
    ('horn', 'sus'): ('Brass/F Horn/sus', 12),
    ('harp', 'pluck'): ('Strings/Harp', 0),
    ('glock', 'hit'): ('Percussion/Glock', 12),
}
TIMPANI = 'Percussion/Timpani'
# the five drums' principal tones (the (1,1) mode, the pitch audio.timpani() is tuned by) in Hz, measured from the
# spectra of every hit on every layer
TIMPANI_HZ = {1: 89.7, 2: 122.0, 3: 142.6, 4: 169.3, 5: 191.6}
# a soft-mallet roll on a suspended cymbal, swelling to its peak at about 3.5 s
SWELL = 'VSCO 1 Percussion/varMetal/Cymbals/susp/susp_hit_softmall_roll2_cresc.wav'
# the articulations whose attack is aligned on the beat (the rest keep their first sound on it)
STRUCK = ('spic', 'pizz', 'pluck', 'hit')

NOTE = re.compile(r'_([A-G])(#?)(-?\d)(?=[_.])')
LAYER = re.compile(r'_v(\d)')
ROBIN = re.compile(r'_(?:rr|RR)?(\d)(?:_Sum)?\.wav$')
DYNAMIC = {'pp': 1, 'p': 2, 'mp': 3, 'mf': 4, 'f': 5, 'ff': 6}
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

ROOT = None
INDEX = {}
ORIG = {}
ROUND = {}
REF = {}
PLAYED = {}


class Sample:
    """one recorded file: decoded once, measured once, and kept at every pitch it is asked to play"""

    def __init__(self, path, art, midi, layer, robin, tune=True):
        self.path, self.art, self.midi, self.layer, self.robin, self.tune = path, art, midi, layer, robin, tune
        self.x = None
        self.at_ = {}
        self.power_ = {}

    def load(self):
        """the file as float stereo at its own rate, from its first sound (for a struck or plucked note, from just
        before its attack, so the attack lands on the beat), and its steady stretch"""
        if self.x is not None:
            return self.x
        # some files carry chunks scipy does not read (loop points, instrument data); the audio is unaffected
        with warnings.catch_warnings():
            warnings.simplefilter('ignore', wavfile.WavFileWarning)
            sr, x = wavfile.read(self.path)
        x = x.astype(np.float64) / (2.0 ** 31 if x.dtype == np.int32 else 2.0 ** 15)
        x = (np.vstack([x, x]) if x.ndim == 1 else x.T)
        e = rms(x, int(0.005 * sr))
        struck = self.art in STRUCK
        i = int(np.argmax(e >= e.max() * 10 ** ((-12 if struck else -30) / 20)))
        lead = max(0, i - int((0.025 if struck else 0.005) * sr))
        x = x[:, lead:].copy()
        k = min(x.shape[1], int(0.002 * sr))
        x[:, :k] *= np.linspace(0, 1, k)
        self.sr, self.x = sr, x
        self.a, self.b, self.rise = steady(x, sr)
        self.pitch = self.measure() if self.tune else self.midi
        return x

    def measure(self):
        """the pitch the file sounds (MIDI, fractional), from the strongest of its first three harmonics found near the
        nominal pitch over its first steady second; the nominal pitch if that strays by more than 45 cents"""
        sr, x = self.sr, self.x
        s = min(int(0.15 * sr), x.shape[1] // 4)
        seg = x.mean(0)[s:s + sr]
        if len(seg) < int(0.2 * sr):
            return self.midi
        S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), 16 * len(seg)))
        df = sr / (16 * len(seg))
        f0, best = A.hz(self.midi), (0.0, None)
        # the glockenspiel's overtones are not harmonic: its fundamental only
        for k in ((1,) if self.art == 'hit' else (1, 2, 3)):
            lo, hi = int(k * f0 * 2 ** (-0.5 / 12) / df), int(k * f0 * 2 ** (0.5 / 12) / df) + 1
            if hi + 1 >= len(S):
                break
            i = lo + int(np.argmax(S[lo:hi]))
            a, b, c = S[i - 1], S[i], S[i + 1]
            p = 0.5 * (a - c) / (a - 2 * b + c) if a - 2 * b + c else 0.0
            if b > best[0]:
                best = (b, (i + p) * df / k)
        if best[1] is None:
            return self.midi
        m = 69 + 12 * np.log2(best[1] / 440.0)
        return m if abs(m - self.midi) < 0.45 else self.midi

    def at(self, m):
        """the file sounding MIDI pitch m at 48 kHz (float32 stereo), with its steady stretch (a, b) and the end of its
        rise (where it first reaches half its steady level), in samples there"""
        key = round(float(m), 3)
        if key not in self.at_:
            x = self.load()
            q = SR / self.sr * 2 ** ((self.pitch - m) / 12)
            r = Fraction(q).limit_denominator(1000)
            y = resample_poly(x, r.numerator, r.denominator, axis=1).astype(np.float32)
            self.at_[key] = (y, int(self.a * q), int(self.b * q), int(self.rise * q))
        return self.at_[key]

    def steady_power(self, m, fc):
        """K-weighted power of the steady stretch at pitch m, through the brightness filter fc"""
        key = (round(float(m), 3), fc)
        if key not in self.power_:
            y, a, b, _ = self.at(m)
            pre = min(a, int(0.1 * SR))
            seg = y[:, a - pre:min(b, a + 3 * SR)].astype(np.float64)
            self.power_[key] = kpow(lp1(seg, fc), pre)
        return self.power_[key]


# ---------- helpers ----------
def rms(x, w):
    """running RMS of a (channels, n) signal over w samples (the mean of the channels' powers)"""
    c = np.concatenate([[0.0], np.cumsum(np.mean(x ** 2, axis=0))])
    w = max(1, min(w, len(c) - 1))
    return np.sqrt(np.maximum(c[w:] - c[:-w], 0) / w)


def steady(x, sr):
    """the stretch of a sustained sample that holds its level (within 3 dB of its median, after its attack and before
    its release), and where its rise first reaches half that level (a soft bowing can take two seconds to get there)"""
    e = rms(x, int(0.05 * sr))
    on = np.where(e > 0.3 * e.max())[0]
    lvl = np.median(e[on[0]:on[-1] + 1])
    ok = np.where(e >= 0.7 * lvl)[0]
    a, b = max(int(ok[0]), int(0.3 * sr)), int(ok[-1]) - int(0.2 * sr)
    if b - a < sr:
        a, b = x.shape[1] // 4, 3 * x.shape[1] // 4
    return a, b, min(int(np.argmax(e >= 0.5 * lvl)), a)


def kpow(x, skip=0):
    """K-weighted power (BS.1770), summed over the channels: a mono voice panned to the centre of a Bus counts the same
    as its stereo equivalent"""
    x = np.atleast_2d(x)
    return float(sum(np.mean(A.k_weight(ch)[skip:] ** 2) for ch in x)) + 1e-20


def lp1(x, fc):
    """a gentle one-pole low-pass: the synthesized voice's brightness, applied to a recording"""
    if fc is None or fc >= SR * 0.45:
        return x
    return sosfilt(A.sos('lowpass', fc, 1), x, axis=-1)


def take(y, n, fade=0.0):
    """the first n samples of y (padded with silence), faded out over its last `fade` seconds"""
    out = np.zeros(y.shape[:-1] + (n,))
    k = min(n, y.shape[-1])
    out[..., :k] = y[..., :k]
    f = min(k, int(fade * SR))
    if f:
        out[..., k - f:k] *= np.linspace(1, 0, f) ** 2
    return out


def hold(y, a, b, n, start=0):
    """a sustained note n samples long: the sample from `start` (its first sound, or a point in its rise), and past its
    steady stretch, further stretches of that steady middle, each joined to the last by a 0.5 s equal-power crossfade (a
    section's bowing is not periodic, so the stretches are uncorrelated and the crossfades keep the level)"""
    if n <= b - start:
        return take(y[:, start:], n)
    X = int(0.5 * SR)
    span = b - a
    out = np.zeros((2, n + 5 * SR))
    out[:, :b - start] = y[:, start:b]
    end = b - start
    w = np.linspace(0, np.pi / 2, X)
    while end < n:
        L = int(srng.integers(min(int(1.5 * SR), span - 1), min(int(4.0 * SR), span) + 1))
        s = int(srng.integers(a, b - L + 1))
        seg = y[:, s:s + L]
        i = end - X
        out[:, i:i + X] = out[:, i:i + X] * np.cos(w) + seg[:, :X] * np.sin(w)
        out[:, i + X:i + L] = seg[:, X:]
        end = i + L
    return out[:, :n]


def pick(inst, art, m, inten):
    """the sample for pitch m: the nearest sampled pitch (between two, the one above: a sample pitched down keeps its
    colour better), the layer nearest the intensity 0..1, and the next of its round robins"""
    pool = INDEX[(inst, art)]
    near = min({s.midi for s in pool}, key=lambda p: (abs(p - m), p < m))
    layers = sorted({s.layer for s in pool if s.midi == near})
    lay = layers[int(np.floor(inten * (len(layers) - 1) + 0.5))]
    robins = sorted((s for s in pool if s.midi == near and s.layer == lay), key=lambda s: s.robin)
    k = ROUND.get((inst, art, near, lay), 0)
    ROUND[(inst, art, near, lay)] = k + 1
    s = robins[k % len(robins)]
    s.load()
    n, top = PLAYED.get((inst, art), (0, 0.0))
    PLAYED[(inst, art)] = (n + 1, max(top, abs(m - s.pitch)))
    return s


def mono(y):
    return y.mean(axis=0)


class aside:
    """runs a synthesized voice, for a level reference, on a generator of its own, so audio.rng is not touched"""

    def __enter__(self):
        self.rng, A.rng = A.rng, np.random.default_rng(0)

    def __exit__(self, *exc):
        A.rng = self.rng


def ref(key, render, skip=0):
    """the K-weighted power of a synthesized voice, rendered once (aside from audio.rng) and remembered"""
    if key not in REF:
        with aside():
            REF[key] = kpow(render(), skip)
    return REF[key]


# ---------- the recorded voices ----------
def sections(m, art):
    """the sections that play pitch m, with their weights"""
    if art == 'sus' and m < 36:
        return [('bass', m, 1.0), ('cellos', m + 12, 0.7)]
    if art == 'sus' and m < 43:
        return [('cellos', m, 1.0), ('bass', m, 0.6)]
    if m < 55:
        return [('cellos', m, 1.0)]
    if m < 62:
        return [('violas', m, 1.0)]
    return [('violins', m, 1.0)]


def strings(m, dur, bright=2600, attack=0.9, release=1.6, voices=7, detune=0.09):
    """a string section on one pitch (audio.strings()), recorded: held (sustained, with vibrato), or spiccato for a
    short, quickly attacked note"""
    # audio.rng as strings() draws it: each voice's vibrato rate and phase, then its oscillator's phase
    for _ in range(voices):
        A.rng.random()
        A.rng.uniform(0, 6.28)
        A.rng.uniform(0, 6.28)
    n = int((dur + release) * SR)
    env = A.adsr(n, attack, 0.3, 0.85, release)
    short = dur <= 0.6 and attack <= 0.1
    art = 'spic' if short else 'sus'
    fc = float(np.clip(3 * bright, 1500, 12000))
    inten = float(np.clip((bright - 1500) / 1500, 0, 1))
    parts = sections(m, art)
    norm = np.sqrt(sum(w * w for _, _, w in parts))
    out = np.zeros((2, n))
    for sec, mm, w in parts:
        s = pick(sec, art, mm, inten)
        y, a, b, rise = s.at(mm)
        if short:
            x = lp1(take(y, n), fc) * env
            want = ref(('strings', m, dur, bright, attack, release, voices),
                       lambda: ORIG['strings'](m, dur, bright=bright, attack=attack, release=release, voices=voices))
            g = np.sqrt(want / kpow(x))
        else:
            # a soft layer swells in by itself; when the score asks for a quicker attack, the note starts that much
            # into its rise, and the score's own attack shapes the entry
            x = lp1(hold(y, a, b, n, max(0, rise - int(attack * SR))), fc) * env
            # the synthesized section's steady level (its envelope holds at 0.85), against the sample's steady stretch
            synth = lambda: ORIG['strings'](m, 1.6, bright=bright, attack=0.05, release=0.1, voices=voices)
            want = ref(('strings', m, bright, voices), lambda: synth()[:, :int(1.5 * SR)], int(0.6 * SR)) / 0.85 ** 2
            g = np.sqrt(want / s.steady_power(mm, fc))
        out += x * g * (w / norm)
    return out


def horn(m, dur, gain=1.0):
    """the French horn (audio.horn()), recorded, under the synthesized horn's slow attack and release"""
    # audio.rng as horn() draws it: its vibrato's phase
    A.rng.uniform(0, 6.28)
    n = int((dur + 1.0) * SR)
    s = pick('horn', 'sus', m, float(np.clip((gain - 0.5) / 0.6, 0, 1)))
    y, a, b, rise = s.at(m)
    # the synthesized horn holds at 0.8 of its envelope
    want = ref(('horn', m), lambda: ORIG['horn'](m, 2.4)[:int(2.3 * SR)], int(1.2 * SR)) / 0.8 ** 2
    g = np.sqrt(want / s.steady_power(m, None))
    return hold(y, a, b, n, max(0, rise - int(0.35 * SR))) * g * A.adsr(n, 0.35, 0.4, 0.8, 1.0) * gain


def timpani(m, gain=1.0, roll=0.0):
    """a timpani stroke (audio.timpani()), recorded: the drum whose tuning lies nearest, retuned (as its pedal would),
    on the layer of the stroke's weight, alternating sticks"""
    # audio.rng as timpani() draws it: the noise of the stick on the head
    A.noise(int(3.0 * SR))
    s = pick('timpani', 'hit', m, float(np.clip(gain / 0.9, 0, 1)))
    y = s.at(m)[0]
    x = take(y, min(y.shape[1], int(6.0 * SR)), fade=0.4)
    want = ref(('timpani', m), lambda: ORIG['timpani'](m)[:SR])
    return x * np.sqrt(want / kpow(x[:, :SR])) * gain


def pizz(m, gain=1.0):
    """a pizzicato note (audio.pizz()), recorded, by the section whose register fits it"""
    sec = 'cellos' if m < 55 else 'violas' if m < 62 else 'violins'
    s = pick(sec, 'pizz', m, float(np.clip((gain - 0.3) / 0.4, 0, 1)))
    y = s.at(m)[0]
    x = take(y, min(y.shape[1], int(1.2 * SR)), fade=0.3)
    want = ref(('pizz', m), lambda: ORIG['pizz'](m)[:int(0.4 * SR)])
    return x * np.sqrt(want / kpow(x[:, :int(0.4 * SR)])) * gain


def bell(m, dur=4.0, gain=1.0):
    """the starlight glint (audio.bell()), recorded: a glockenspiel note, in mono for the score to place"""
    s = pick('glock', 'hit', m, 0.5)
    x = take(mono(s.at(m)[0]), int(dur * SR), fade=0.3)
    want = ref(('bell', m), lambda: ORIG['bell'](m, 1.0)[:int(0.6 * SR)])
    return x * np.sqrt(want / kpow(x[:int(0.6 * SR)])) * gain


def shimmer(dur, gain=1.0, base=84):
    """starlight (audio.shimmer()), recorded: the synthesized cluster's five pitches as soft glockenspiel notes, scattered
    at random across the stereo field, under the cluster's own slow swell and at its loudness"""
    n = int(dur * SR)
    out = np.zeros((2, n + 3 * SR))
    pitches = [base, base + 7, base + 12, base + 16, base + 19]
    t = 0.2 + srng.uniform(0, 0.4)
    while t < dur - 0.3:
        m = pitches[srng.choice(5, p=[0.3, 0.25, 0.2, 0.15, 0.1])]
        s = pick('glock', 'hit', m, 0.0)
        x = take(mono(s.at(m)[0]), 3 * SR, fade=0.6) * srng.uniform(0.45, 1.0)
        a = (srng.uniform(-0.7, 0.7) + 1) * np.pi / 4
        i = int(t * SR)
        out[0, i:i + len(x)] += x * np.cos(a)
        out[1, i:i + len(x)] += x * np.sin(a)
        t += srng.uniform(0.35, 0.9)
    out = out[:, :n] * A.adsr(n, dur * 0.3, 0.1, 1.0, dur * 0.4)
    want = ref(('shimmer', dur, base), lambda: ORIG['shimmer'](dur, base=base))
    return out * np.sqrt(want / kpow(out)) * gain


def harmonic(m, gain=1.0):
    """the harp harmonic (score.harmonic()), recorded: the harp's string at that pitch, filtered toward the harmonic's
    purer tone, in mono for the score to place"""
    s = pick('harp', 'pluck', m, 0.5)
    x = lp1(take(mono(s.at(m)[0]), 3 * SR, fade=0.5), min(3 * A.hz(m), 16000))
    want = ref(('harmonic', m), lambda: ORIG['harmonic'](m)[:int(0.6 * SR)])
    return x * np.sqrt(want / kpow(x[:int(0.6 * SR)])) * gain


def orch_bloom(t, bus, gain=1.0, root=38):
    """the orchestral low bloom (score.orch_bloom()), recorded: the low strings and the timpani as before, through the
    recorded voices, with a soft-mallet cymbal roll swelling into it 9 dB under the timpani"""
    ORIG['orch_bloom'](t, bus, gain, root)
    s = INDEX[('cymbal', 'swell')][0]
    y = s.at(s.midi)[0]
    peak = int(np.argmax(rms(y, int(0.05 * SR))))
    x = take(y, peak + int(4.0 * SR), fade=1.5)
    near = x[:, max(0, peak - SR // 4):peak + SR // 4]
    want = ref(('timpani', root + 12), lambda: ORIG['timpani'](root + 12)[:SR]) * (0.9 * gain) ** 2 * 10 ** (-0.9)
    bus.add(x * np.sqrt(want / kpow(near)), t - peak / SR)


# ---------- setup ----------
def index(root):
    """every file in the folders used, by instrument, articulation, sounding pitch, layer and round robin"""
    for (inst, art), (folder, octave) in FOLDERS.items():
        files = sorted(glob.glob(os.path.join(root, folder, '*.wav')))
        if not files:
            raise SystemExit(f'--samples: no samples in {os.path.join(root, folder)}')
        for f in files:
            name = os.path.basename(f)
            note = NOTE.search(name)
            if not note:
                continue
            midi = 12 * (int(note.group(3)) + 1) + PC[note.group(1)] + (1 if note.group(2) else 0) + octave
            v = LAYER.search(name)
            rr = ROBIN.search(name)
            layer = int(v.group(1)) if v else DYNAMIC.get(name[:-4].rsplit('_', 1)[-1], 4)
            INDEX.setdefault((inst, art), []).append(Sample(f, art, midi, layer, int(rr.group(1)) if rr else 1))
    for f in sorted(glob.glob(os.path.join(root, TIMPANI, 'Timpani*_Hit_*.wav'))):
        d, v, rr = map(int, re.search(r'Timpani(\d)_Hit_v(\d)_rr(\d)', os.path.basename(f)).groups())
        midi = 69 + 12 * np.log2(TIMPANI_HZ[d] / 440.0)
        INDEX.setdefault(('timpani', 'hit'), []).append(Sample(f, 'hit', midi, v, rr, tune=False))
    swell = os.path.join(root, SWELL)
    if not os.path.exists(swell) or ('timpani', 'hit') not in INDEX:
        raise SystemExit(f'--samples: no timpani or cymbal in {root}')
    INDEX[('cymbal', 'swell')] = [Sample(swell, 'swell', 60, 1, 1, tune=False)]


def install(root, score):
    """put the recorded voices in place of the synthesized ones, in audio.py and in the score module `score`"""
    index(root)
    for name, fn in [('strings', strings), ('horn', horn), ('timpani', timpani), ('pizz', pizz), ('bell', bell),
                     ('shimmer', shimmer)]:
        ORIG[name] = getattr(A, name)
        setattr(A, name, fn)
    for name, fn in [('harmonic', harmonic), ('orch_bloom', orch_bloom)]:
        ORIG[name] = getattr(score, name)
        setattr(score, name, fn)
    print(f'orchestra: recorded (VSCO-2 CE, {root})')
    atexit.register(report)


def report():
    """what played: notes by instrument and articulation, and the widest repitch"""
    print('recorded notes:', ', '.join(f'{i} {a} {n} (to {top:.1f} st)' for (i, a), (n, top) in sorted(PLAYED.items())))
