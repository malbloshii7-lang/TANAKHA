"""Instruments, effects and mastering for the gala score (numpy + scipy; no samples, royalty-free).

Everything here is a pure function of its arguments plus one seeded generator, so the score renders
the same every time. score.py composes with these and places every cue from the film's own timeline.
"""
import wave

import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve

SR = 48000
rng = np.random.default_rng(2027)


# ---------- basics ----------
def hz(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def tt(dur):
    return np.arange(int(round(dur * SR))) / SR


def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


def lp(x, f, order=2):
    return sosfilt(sos("lowpass", min(f, SR * 0.45), order), x)


def hp(x, f, order=2):
    return sosfilt(sos("highpass", f, order), x)


def bp(x, lo, hi, order=2):
    return sosfilt(sos("bandpass", [lo, min(hi, SR * 0.45)], order), x)


def noise(n):
    return rng.standard_normal(n)


def adsr(n, a, d, s, r, curve=3.0):
    """attack, decay, release in seconds; sustain level 0..1. Exponential-ish segments."""
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    if na:
        e[:na] = (np.arange(na) / na) ** (1 / curve if curve > 1 else 1)
    if nd and na < n:
        k = min(nd, n - na)
        e[na:na + k] = s + (1 - s) * np.exp(-np.arange(k) / (nd / 4.0))
    if nr:
        k = min(nr, n)
        e[n - k:] *= np.linspace(1, 0, k) ** 2
    return e


class Bus:
    """A stereo track the length of the film."""

    def __init__(self, dur):
        self.n = int(round(dur * SR))
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, sig, t, gain=1.0, pan=0.0):
        """mono signal at time t (s), constant-power pan -1..1"""
        if sig.ndim == 2:
            return self.add2(sig[0], sig[1], t, gain)
        i0 = int(round(t * SR))
        if i0 < 0:
            sig, i0 = sig[-i0:], 0
        if i0 >= self.n or len(sig) == 0:
            return
        k = min(len(sig), self.n - i0)
        a = (pan + 1) * np.pi / 4
        self.L[i0:i0 + k] += sig[:k] * gain * np.cos(a)
        self.R[i0:i0 + k] += sig[:k] * gain * np.sin(a)

    def add2(self, l, r, t, gain=1.0):
        i0 = int(round(t * SR))
        if i0 < 0:
            l, r, i0 = l[-i0:], r[-i0:], 0
        if i0 >= self.n:
            return
        k = min(len(l), self.n - i0)
        self.L[i0:i0 + k] += l[:k] * gain
        self.R[i0:i0 + k] += r[:k] * gain

    def stereo(self):
        return np.vstack([self.L, self.R])


# ---------- oscillators ----------
def saw(f, n, harmonics=24, phase=0.0):
    """band-limited sawtooth (PolyBLEP), f may be an array (vibrato); `harmonics` is kept for the call sites"""
    f = np.broadcast_to(np.asarray(f, float), (n,))
    dt = f / SR
    ph = (np.cumsum(dt) + phase / (2 * np.pi)) % 1.0
    out = 2 * ph - 1
    a = ph < dt
    x = ph[a] / dt[a]
    out[a] -= x + x - x * x - 1
    b = ph > 1 - dt
    x = (ph[b] - 1) / dt[b]
    out[b] -= x * x + x + x + 1
    return out


def vib(f, n, rate=5.2, depth=0.004, delay=0.35):
    t = np.arange(n) / SR
    ramp = np.clip((t - delay) / 0.6, 0, 1)
    return f * (1 + depth * ramp * np.sin(2 * np.pi * rate * t + rng.uniform(0, 6.28)))


# ---------- instruments ----------
def strings(m, dur, bright=2600, attack=0.9, release=1.6, voices=7, detune=0.09):
    """a string section on one pitch: detuned saws, soft attack, gentle vibrato, stereo spread"""
    n = int((dur + release) * SR)
    L, R = np.zeros(n), np.zeros(n)
    for v in range(voices):
        cents = (v - (voices - 1) / 2) / ((voices - 1) / 2) * detune * 100 if voices > 1 else 0
        f = vib(hz(m) * 2 ** (cents / 1200), n, rate=4.6 + 0.9 * rng.random(), depth=0.0035)
        s = saw(f, n, harmonics=18, phase=rng.uniform(0, 6.28))
        pan = (v / (voices - 1)) * 2 - 1 if voices > 1 else 0
        a = (pan + 1) * np.pi / 4
        L += s * np.cos(a)
        R += s * np.sin(a)
    env = adsr(n, attack, 0.3, 0.85, release)
    cut = bright * (0.55 + 0.45 * env)
    L = lp(L * env, bright, 2)
    R = lp(R * env, bright, 2)
    del cut
    g = 0.22 / np.sqrt(voices)
    return np.vstack([L, R]) * g


def chord(bus, notes, t, dur, gain=0.5, bright=2400, attack=1.0, release=1.8):
    for m in notes:
        bus.add(strings(m, dur, bright=bright, attack=attack, release=release), t, gain)


def horn(m, dur, gain=1.0):
    """a soft French-horn-like voice: saw through an opening low-pass, slow attack"""
    n = int((dur + 1.0) * SR)
    f = vib(hz(m), n, rate=4.8, depth=0.003, delay=0.5)
    s = saw(f, n, harmonics=14) * 0.7 + saw(f * 1.002, n, harmonics=14) * 0.3
    env = adsr(n, 0.35, 0.4, 0.8, 1.0)
    out = np.zeros(n)
    # the tone brightens as it swells: blend two filtered copies by the envelope
    dark, open_ = lp(s, 700, 2), lp(s, 1900, 2)
    out = (dark * (1 - env) + open_ * env) * env
    return out * 0.32 * gain


def choir(m, dur, vowel="a", gain=1.0):
    """an 'aah' voice: a buzzy source through three formant band-passes, with vibrato and a slow swell"""
    n = int((dur + 1.4) * SR)
    F = {"a": [(730, 90), (1090, 110), (2440, 160)], "o": [(570, 80), (840, 90), (2410, 160)]}[vowel]
    L, R = np.zeros(n), np.zeros(n)
    for v in range(4):
        f = vib(hz(m) * 2 ** ((v - 1.5) * 6 / 1200), n, rate=5.0 + rng.random(), depth=0.006, delay=0.4)
        src = saw(f, n, harmonics=40) + 0.05 * noise(n)
        voice = sum(bp(src, c - w, c + w, 2) * (1.0, 0.6, 0.25)[i] for i, (c, w) in enumerate(F))
        pan = (v / 3) * 1.4 - 0.7
        a = (pan + 1) * np.pi / 4
        L += voice * np.cos(a)
        R += voice * np.sin(a)
    env = adsr(n, 1.1, 0.5, 0.9, 1.4)
    return np.vstack([L * env, R * env]) * 0.5 * gain


def pluck(m, dur=1.6, bright=0.55, body=(180, 900)):
    """oud-like: Karplus-Strong string with a wooden body band-pass"""
    f = hz(m)
    n = int(dur * SR)
    N = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, N)
    buf = lp(buf, 1200 + 6000 * bright, 1)
    out = np.zeros(n)
    for i in range(n):
        j = i % N
        out[i] = buf[j]
        buf[j] = 0.5 * (buf[j] + buf[(j + 1) % N]) * 0.996
    out = out * np.exp(-np.arange(n) / (SR * dur * 0.45))
    return (bp(out, *body, 1) * 0.7 + out * 0.3) * 0.6


def qanun(m, dur=1.4):
    return pluck(m, dur, bright=0.85, body=(300, 3500)) * 0.8


def ney(m, dur, gain=1.0):
    """a breathy end-blown flute: sine partials plus band-passed breath, slow attack and vibrato"""
    n = int((dur + 0.6) * SR)
    f = vib(hz(m), n, rate=5.4, depth=0.007, delay=0.25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.28 * np.sin(2 * ph) + 0.1 * np.sin(3 * ph)
    breath = bp(noise(n), hz(m) * 0.8, hz(m) * 3.2, 2) * 0.35
    env = adsr(n, 0.28, 0.2, 0.9, 0.5)
    return (tone * 0.5 + breath) * env * 0.35 * gain


def bell(m, dur=4.0, gain=1.0):
    """an FM bell for the stars"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 2.0)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 1.1) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 2.4)
    return s * 0.25 * gain


def daf(gain=1.0, jingle=True):
    """a frame drum: a soft low thump with its ring of jingles"""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    f = 72 + 40 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    skin = lp(noise(n), 900, 2) * np.exp(-t * 35) * 0.35
    out = body + skin
    if jingle:
        out += lp(hp(noise(n), 4000, 2), 8000, 2) * np.exp(-t * 22) * 0.045
    return out * 0.6 * gain


def tak(gain=1.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    return (bp(noise(n), 900, 3200, 2) * np.exp(-t * 60) * 0.6 + np.sin(2 * np.pi * 380 * t) * np.exp(-t * 55) * 0.5) * 0.3 * gain


def taiko(gain=1.0):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 48 + 60 * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + lp(noise(n), 300, 2) * np.exp(-t * 14) * 0.6
    return s * 0.8 * gain


def timpani(m, gain=1.0, roll=0.0):
    n = int(3.0 * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for a, r, d in [(1, 1, 1.6), (0.5, 1.5, 2.4), (0.35, 1.98, 3.0), (0.2, 2.44, 3.6)])
    s += lp(noise(n), 400, 2) * np.exp(-t * 30) * 0.3
    return s * 0.35 * gain


def boom(gain=1.0):
    """a low cinematic hit, felt more than heard"""
    n = int(4.0 * SR)
    t = np.arange(n) / SR
    f = 34 + 30 * np.exp(-t * 8)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2) + lp(noise(n), 160, 2) * np.exp(-t * 3) * 0.5) * 0.7 * gain


def shimmer(dur, gain=1.0, base=84):
    """a high, slowly twinkling cluster for starlight"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, m in enumerate([base, base + 7, base + 12, base + 16, base + 19]):
        amp = 0.5 + 0.5 * np.sin(2 * np.pi * (0.13 + 0.07 * k) * t + k)
        out += np.sin(2 * np.pi * hz(m) * t) * amp * (0.6 ** k)
    env = adsr(n, dur * 0.3, 0.1, 1.0, dur * 0.4)
    return out * env * 0.05 * gain


def pizz(m, gain=1.0):
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    s = saw(hz(m), n, harmonics=10) * np.exp(-t * 9)
    return lp(s, 1600, 2) * 0.35 * gain


# ---------- sound effects (restrained: no alarms, no sirens, nothing that reads as a weapon) ----------
def wind(dur, gain=1.0, gust=0.08):
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = noise(n)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * gust * t + 1.3) * np.sin(2 * np.pi * gust * 0.37 * t)
    w = bp(base, 150, 700, 2) * lfo + bp(base, 700, 1800, 2) * 0.15 * lfo ** 2
    return w * 0.18 * gain * adsr(n, min(2.5, dur / 3), 0.1, 1.0, min(2.5, dur / 3))


def sea(dur, gain=1.0, period=6.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    swell = np.clip(np.sin(2 * np.pi * t / period) * 0.5 + 0.5, 0, 1) ** 2
    L = lp(noise(n), 1100, 2) * (0.25 + 0.75 * swell)
    R = lp(noise(n), 1100, 2) * (0.25 + 0.75 * np.roll(swell, int(SR * 0.7)))
    env = adsr(n, min(2.0, dur / 3), 0.1, 1.0, min(2.0, dur / 3))
    return np.vstack([L * env, R * env]) * 0.12 * gain


def rain(dur, gain=1.0, density=1.0):
    n = int(dur * SR)
    L, R = bp(noise(n), 500, 5500, 2), bp(noise(n), 500, 5500, 2)
    drops = (rng.random(n) < 0.0006 * density).astype(float)
    drops = bp(drops, 800, 4000, 1) * 4
    env = adsr(n, min(1.8, dur / 3), 0.1, 1.0, min(2.0, dur / 3))
    return np.vstack([(L * 0.35 + drops) * env, (R * 0.35 + np.roll(drops, 311)) * env]) * 0.03 * gain


def thunder_far(gain=1.0):
    n = int(5.0 * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * 0.9) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 0.9 * t) * np.sin(2 * np.pi * 0.31 * t + 1)))
    return lp(noise(n), 220, 3) * env * 0.5 * gain


def jet_far(dur, gain=1.0):
    """a distant airliner on final approach: a soft broadband roar that swells and fades, no whine"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    s = lp(noise(n), 700, 2) * (1 - env) + lp(noise(n), 1200, 2) * env + 0.2 * bp(noise(n), 1500, 3000, 2) * env
    return s * env * 0.14 * gain


def ship_horn_far(gain=1.0):
    """a ship's horn across the harbour: low, long, gentle"""
    n = int(3.2 * SR)
    t = np.arange(n) / SR
    f = hz(38)
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 7))
    env = adsr(n, 0.4, 0.2, 0.9, 1.2)
    return lp(s, 500, 2) * env * 0.08 * gain


def ink(dur, gain=1.0):
    """the scratch of a pen on parchment, for lines drawing themselves"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    grain = bp(noise(n), 2500, 7000, 2) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7.3 * t)))
    return grain * adsr(n, 0.05, 0.1, 1.0, 0.1) * 0.02 * gain


# ---------- space and mastering ----------
def reverb(stereo, rt60=3.0, wet=0.28, pre=0.022, damp=5200):
    """convolution with a synthetic, decorrelated stereo tail"""
    n = int(rt60 * 1.1 * SR)
    t = np.arange(n) / SR
    decay = np.exp(-6.91 * t / rt60)
    irL = lp(noise(n), damp, 1) * decay
    irR = lp(noise(n), damp, 1) * decay
    irL[: int(pre * SR)] = 0
    irR[: int(pre * SR)] = 0
    irL /= np.sqrt(np.sum(irL ** 2))
    irR /= np.sqrt(np.sum(irR ** 2))
    L = fftconvolve(stereo[0], irL)[: stereo.shape[1]]
    R = fftconvolve(stereo[1], irR)[: stereo.shape[1]]
    return stereo * (1 - wet) + np.vstack([L, R]) * wet


def k_weight(x):
    """ITU-R BS.1770 K-weighting at 48 kHz (pre-filter shelf + RLB high-pass)"""
    from scipy.signal import lfilter
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def lufs(stereo):
    """integrated loudness (BS.1770-4, with the absolute and relative gates)"""
    z = [k_weight(ch) for ch in stereo]
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    ms = []
    for i in range(0, stereo.shape[1] - blk, hop):
        ms.append(sum(np.mean(c[i:i + blk] ** 2) for c in z))
    ms = np.array(ms)
    lk = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[lk > -70]
    rel = -0.691 + 10 * np.log10(np.mean(g) + 1e-12) - 10
    g2 = ms[(lk > -70) & (lk > rel)]
    return -0.691 + 10 * np.log10(np.mean(g2) + 1e-12)


def true_peak_db(stereo):
    """4× oversampled peak, dBTP"""
    from scipy.signal import resample_poly
    return 20 * np.log10(max(np.max(np.abs(resample_poly(ch, 4, 1))) for ch in stereo) + 1e-12)


def glue(stereo, thresh_db=-18, ratio=2.0, attack=0.02, release=0.25):
    """a gentle RMS compressor on the sum"""
    env = np.sqrt(sosfiltfilt(sos("lowpass", 8.0, 1), np.mean(stereo ** 2, axis=0)) + 1e-12)
    lvl = 20 * np.log10(env)
    over = np.maximum(lvl - thresh_db, 0)
    gain_db = -over * (1 - 1 / ratio)
    return stereo * 10 ** (gain_db / 20)


def limit(stereo, ceiling_db=-1.0):
    """a look-ahead brick-wall limiter aimed below the true-peak ceiling"""
    c = 10 ** ((ceiling_db - 0.3) / 20)
    peak = np.max(np.abs(stereo), axis=0)
    need = np.minimum(1.0, c / np.maximum(peak, 1e-9))
    # smooth the gain: instant attack via a running minimum, then a release
    w = int(0.005 * SR)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * w + 1)
    g = sosfiltfilt(sos("lowpass", 30.0, 1), g)
    g = np.minimum(g, need)
    return stereo * g


def master(stereo, target_lufs=-16.0, ceiling_db=-1.0):
    x = glue(stereo)
    x = x * 10 ** ((target_lufs - lufs(x)) / 20)
    for _ in range(3):
        x = limit(x, ceiling_db)
        if true_peak_db(x) <= ceiling_db:
            break
        x *= 10 ** ((ceiling_db - true_peak_db(x) - 0.1) / 20)
    return x


def write_wav(path, stereo, bits=24):
    """write to a temporary file and rename it, so a failed write never leaves a broken WAV behind"""
    import os
    x = np.clip(stereo.T, -1, 1)
    tmp = path + ".part"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(bits // 8)
        w.setframerate(SR)
        if bits == 16:
            w.writeframes((x * 32767).astype("<i2").tobytes())
        else:
            v = np.ascontiguousarray((x * 8388607).astype("<i4"))
            b = v.view(np.uint8).reshape(-1, 4)[:, :3]
            w.writeframes(b.tobytes())
    os.replace(tmp, path)
